# Integracja z Jenkinsem

> **Perspektywa Full Stack Testera**
> Jenkins to jeden z najstarszych i najbardziej elastycznych narzędzi CI/CD — używany w enterprises od dekady. Jeśli pracujesz w organizacji z istniejącym Jenkinsem, integracja Playwright wymaga przemyślenia: który agent? Jakie środowisko? Jak zapewnić powtarzalność, gdy każdy job może mieć inną konfigurację? Ta lekcja uczy, jak zaprojektować pipeline Playwright w Jenkinsie, który jest wersjonowany, powtarzalny i publikuje raporty nawet przy awarii — jednocześnie wykorzystując unikalne możliwości Jenkinsa, jak distributed agents, checkpoints i extensibility.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Projektować Jenkinsfile w stylu Declarative Pipeline** — wersjonowany, czytelny, maintainable
- **Konfigurować Docker agent** dla stabilnego środowiska Playwright
- **Uruchamiać testy w parallel stages** — sharding, multi-browser, distributed execution
- **Publikować raporty JUnit i HTML** w sekcji `post` z `always`
- **Zarządzać credentialami i secretami** — Jenkins Credentials Store, masked variables
- **Monitorować pipeline** — build trends, flaky detection, resource usage

---

## Wprowadzenie: dlaczego Jenkins dla Playwright

Jenkins ma kilka unikalnych cech, które czynią go dobrym wyborem dla Playwright w enterprise:

- **Distributed agents** — testy mogą uruchamiać się na wielu maszynach, scale'ując z potrzebami
- **Checkpoint / input steps** — manual approval między stages, przydatne dla release gates
- **Extensive plugin ecosystem** — JUnit, HTML Publisher, Slack, Jira, Git, Docker, Kubernetes
- **Flexibility** — można używać declarative pipeline, scripted pipeline lub freestyle jobs
- **Long history** — dojrzałe rozwiązanie z obszerną dokumentacją i społecznością

Wady: wyższy próg entry niż GitHub Actions/GitLab CI, wymaga własnej infrastruktury i maintenance, konfiguracja freestyle jobs bywa fragmentaryczna. Stąd nacisk na Jenkinsfile — pipeline as code.

---

## Sekcja 1: Jenkinsfile — Declarative Pipeline

### Podstawowa struktura

```groovy
// Jenkinsfile — kompletny pipeline Playwright
@Library('shared-pipeline-library') _

pipeline {
    // Agent — gdzie pipeline się wykonuje
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.47.0-jammy'
            args '--shm-size=2g'  // Wymagane dla Chromium w kontenerze
        }
    }

    // Środowisko — zmienne globalne
    environment {
        PLAYWRIGHT_VERSION = '1.47.0'
        APP_URL = 'https://staging.example.com'
        NODE_ENV = 'test'
    }

    // Stages — logiczne fazy pipeline'u
    stages {
        stage('Verify') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm ci'
            }
        }

        stage('Lint & Types') {
            steps {
                sh 'npm run lint'
                sh 'npx tsc --noEmit'
            }
        }

        stage('Smoke Tests') {
            when {
                anyOf {
                    changeRequest()
                    branch 'main'
                }
            }
            steps {
                sh 'npx playwright test --grep @smoke --reporter=line,junit'
            }
        }

        stage('Full Regression') {
            when {
                branch 'main'
            }
            steps {
                sh 'npx playwright test --reporter=line,html,json,junit'
            }
        }
    }

    // Post — zawsze wykonuje się po stages (niezależnie od wyniku)
    post {
        always {
            echo 'Publishing reports and artifacts...'
            
            // JUnit — GitLab-style test report UI
            junit 'test-results/junit.xml'
            
            // Archiwum wszystkich artifactów (trace, screenshots)
            archiveArtifacts artifacts: 'playwright-report/**,test-results/**,trace/**', 
                             allowEmptyArchive: true,
                             fingerprint: true
            
            // HTML Publisher — interaktywny raport
            publishHTML([
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright HTML Report'
            ])
            
            // Clean workspace (opcjonalne)
            cleanWs()
        }
        
        success {
            echo 'Pipeline succeeded! All tests passed.'
            // Opcjonalnie: wysyłanie powiadomień tylko przy sukcesie
        }
        
        failure {
            echo 'Pipeline failed. Check reports for details.'
            // Opcjonalnie: escalation, page on-call
        }
    }

    // Options — globalne ustawienia pipeline'u
    options {
        buildDiscarder(logRotator(numToKeepStr: '30'))
        timeout(time: 1, unit: 'HOURS')
        disableConcurrentBuilds()
    }

    // Triggers — kiedy pipeline się uruchamia
    triggers {
        pollSCM('H */4 * * 1-5')  // Co 4 godziny w dni robocze jeśli zmiana
        cron('H 2 * * *')         // Nocna regresja o 2:00
    }
}
```

### Dyrektywy when — kiedy uruchamiać stage

Krytyczne dla Optymalnego użycia zasobów:

```groovy
stage('Full Regression') {
    when {
        anyOf {
            branch 'main'
            branchPattern 'release/*'
            changeRequest()
        }
    }
    steps {
        sh 'npx playwright test --reporter=line,junit'
    }
}

stage('Deploy to Production') {
    when {
        allOf {
            branch 'main'
            expression { currentBuild.resultIsBetterOrEqualTo('SUCCESS') }
        }
    }
    input {
        message 'Approve production deployment?'
        ok 'Deploy'
        submitter 'qa-lead,release-manager'
    }
    steps {
        sh 'kubectl apply -f k8s/production/'
    }
}
```

### Environment — secrets i credentials

```groovy
pipeline {
    environment {
        // Credential jako zmienna — wartość nie pojawi się w logach
        APP_PASSWORD = credentials('app-test-password')
        DB_CONNECTION_STRING = credentials('db-connection-string')
    }
    
    stages {
        stage('E2E with Auth') {
            steps {
                // Wartość jest dostępna jako $APP_PASSWORD
                sh 'npx playwright test --grep @authenticated'
            }
        }
    }
}
```

Dodawanie credentials w Jenkins: **Manage Jenkins → Credentials → System → Global credentials → Add**

### Shared Libraries — reusable pipeline components

Dla wielu projektów z Playwright warto stworzyć shared library:

```groovy
// vars/playwrightPipeline.groovy
def call(Map config = [:]) {
    def playwrightVersion = config.playwrightVersion ?: '1.47.0'
    def testPattern = config.testPattern ?: '**/*.spec.ts'
    def reporters = config.reporters ?: 'line,junit'
    
    pipeline {
        agent {
            docker {
                image "mcr.microsoft.com/playwright:v${playwrightVersion}-jammy"
                args '--shm-size=2g'
            }
        }
        
        stages {
            stage('Install') {
                steps {
                    sh 'npm ci'
                }
            }
            
            stage('Test') {
                steps {
                    sh "npx playwright test ${testPattern} --reporter=${reporters}"
                }
            }
        }
        
        post {
            always {
                junit 'test-results/junit.xml'
                publishHTML([
                    allowMissing: true,
                    reportDir: 'playwright-report',
                    reportFiles: 'index.html',
                    reportName: 'Playwright Report'
                ])
            }
        }
    }
}
```

Użycie w Jenkinsfile:

```groovy
@Library('my-shared-library') _

playwrightPipeline(
    playwrightVersion: '1.47.0',
    testPattern: 'tests/e2e/**/*.spec.ts',
    reporters: 'line,html,junit'
)
```

---

## Sekcja 2: Docker Agent — stabilne środowisko

### Konfiguracja agenta Docker

Jenkins Docker agent zapewnia izolację i powtarzalność:

```groovy
agent {
    docker {
        image 'mcr.microsoft.com/playwright:v1.47.0-jammy'
        
        // Args dla stabilności przeglądarek w kontenerze
        args '''--shm-size=2g \
                --network=host \
                -v /var/run/docker.sock:/var/run/docker.sock'''
        
        // Reuse node — agent nie jest niszczony między stages
        reuseNode true
    }
}
```

### Problem: /dev/shm size w Docker

Chromium w kontenerze Linux wymaga większego `/dev/shm` (shared memory). Domyślne 64MB powoduje crashes:

```groovy
// Solution: --shm-size=2g w args
args '--shm-size=2g'

// Lub mount z host
args '-v /dev/shm:/dev/shm'
```

### Custom Dockerfile dla specyficznych potrzeb

```dockerfile
# Dockerfile.playwright-ci
FROM mcr.microsoft.com/playwright:v1.47.0-jammy

# Dodatkowe tooling
RUN apt-get update && apt-get install -y \
    curl \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Zależności projektu
WORKDIR /app
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Użytkownik non-root ( Jenkins agent może wymagać)
USER jenkins

CMD ["npx", "playwright", "test"]
```

```groovy
agent {
    docker {
        image 'my-registry.example.com/playwright:v1.47.0'
        label 'docker-agent'  // Label selekcji agenta
    }
}
```

### Kubernetes agent (dla dużych organizacji)

```groovy
agent {
    kubernetes {
        label 'playwright-tests'
        defaultContainer 'playwright'
        yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
    - name: playwright
      image: mcr.microsoft.com/playwright:v1.47.0-jammy
      command: ["sleep", "infinity"]
      resources:
        requests:
          memory: "2Gi"
          cpu: "1"
        limits:
          memory: "4Gi"
          cpu: "2"
      volumeMounts:
        - name: dshm
          mountPath: /dev/shm
  volumes:
    - name: dshm
      emptyDir:
        medium: Memory
        sizeLimit: 2Gi
'''
    }
}
```

---

## Sekcja 3: Parallel stages — równoległe execution

### Basic parallel

```groovy
stages {
    stage('Smoke Tests') {
        parallel {
            stage('Chromium') {
                agent { label 'docker' }
                steps {
                    sh 'npx playwright test --project=chromium --grep @smoke'
                }
            }
            stage('Firefox') {
                agent { label 'docker' }
                steps {
                    sh 'npx playwright test --project=firefox --grep @smoke'
                }
            }
            stage('WebKit') {
                agent { label 'docker' }
                steps {
                    sh 'npx playwright test --project=webkit --grep @smoke'
                }
            }
        }
    }
}
```

### Test sharding w parallel

```groovy
def totalShards = 4

stage('Regression Shards') {
    parallel {
        (1..totalShards).each { shard ->
            stage("Shard ${shard}/${totalShards}") {
                agent { label 'docker' }
                environment {
                    SHARD_INDEX = "${shard}"
                    SHARD_TOTAL = "${totalShards}"
                }
                steps {
                    sh '''
                        npx playwright test \
                            --shard=${SHARD_INDEX}/${SHARD_TOTAL} \
                            --reporter=line,json
                    '''
                }
                post {
                    always {
                        // Unikalna ścieżka dla każdego sharda
                        archiveArtifacts artifacts: "test-results/shard-${SHARD_INDEX}/**"
                        junit "test-results/shard-${SHARD_INDEX}/junit.xml"
                    }
                }
            }
        }
    }
}
```

### Parallel stages z merge wyników

```groovy
// Po parallel stages — merge JUnit XML
stage('Merge Results') {
    agent { label 'docker' }
    when {
        anyOf { branch 'main'; changeRequest() }
    }
    steps {
        sh '''
            npm install -g junit-merge
            junit-merge -d test-results -o test-results/merged.xml
        '''
    }
    post {
        always {
            junit 'test-results/merged.xml'
        }
    }
}
```

### Matrix builds — kombinacje

```groovy
stage('Matrix: Browsers × OS') {
    matrix {
        axes {
            axis {
                name 'BROWSER'
                values 'chromium', 'firefox', 'webkit'
            }
            axis {
                name 'OS'
                values 'linux', 'windows'
            }
        }
        agent { label "playwright-${OS}" }
        steps {
            sh "npx playwright test --project=${BROWSER}"
        }
        post {
            always {
                archiveArtifacts artifacts: "playwright-report/**"
            }
        }
    }
}
```

---

## Sekcja 4: Post actions — raporty i cleanup

### Hierarchia post conditions

```groovy
post {
    // Zawsze — nawet przy aborted, success, failure
    always {
        echo 'Publishing artifacts regardless of result...'
        junit 'test-results/junit.xml'
        archiveArtifacts artifacts: 'playwright-report/**,test-results/**', 
                         allowEmptyArchive: true,
                         fingerprint: true
    }
    
    // Tylko przy success
    success {
        echo 'All tests passed!'
        // Slack notification tylko przy sukcesie
    }
    
    // Tylko przy failure
    failure {
        echo 'Tests failed. Check HTML report for details.'
        // Alert do zespołu
    }
    
    // Tylko przy changed (build unstable)
    changed {
        echo 'Build status changed from previous.'
    }
    
    // Tylko przy aborted (force kill)
    aborted {
        echo 'Build was aborted.'
    }
    
    // Tylko przy unstable (np. flaky tests)
    unstable {
        echo 'Build unstable — some tests had issues.'
    }
}
```

### HTML Publisher — konfiguracja

```groovy
publishHTML([
    // Czy dozwolone jest brak raportu (np. gdy wszystko przeszło)
    allowMissing: false,
    
    // Czy raport jest zawsze linkowany z ostatniego builda
    alwaysLinkToLastBuild: true,
    
    // Czy archiwum jest zachowane dla wszystkich buildów
    keepAll: true,
    
    // Katalog z raportem (względem workspace)
    reportDir: 'playwright-report',
    
    // Główny plik raportu
    reportFiles: 'index.html',
    
    // Nazwa wyświetlana w Jenkins UI
    reportName: 'Playwright HTML Report'
])
```

### Zbieranie wszystkich artifactów z parallel stages

Gdy parallel stages generują artifacty w różnych katalogach, użyj pattern:

```groovy
post {
    always {
        // Wildcard zbiera wszystkie pliki z parallel branches
        archiveArtifacts artifacts: 'playwright-report*/**'
        
        // Dla JUnit — agregacja z wielu katalogów
        junit 'test-results/**/*.xml'
    }
}
```

### Slack notifications z kontekstem

```groovy
post {
    failure {
        script {
            def testResults = readJSON file: 'test-results/results.json'
            def failedCount = testResults.summary.failed
            
            slackSend(
                channel: '#qa-alerts',
                color: 'danger',
                message: """\
                    :red_circle: Playwright tests FAILED
                    *Job:* ${env.JOB_NAME} #${env.BUILD_NUMBER}
                    *Branch:* ${env.GIT_BRANCH}
                    *Failed:* ${failedCount} tests
                    *Report:* ${env.BUILD_URL}playwright/
                    *Logs:* ${env.BUILD_URL}console
                """.stripIndent()
            )
        }
    }
    
    success {
        script {
            slackSend(
                channel: '#ci-success',
                color: 'good',
                message: """\
                    :white_check_mark: Playwright tests PASSED
                    *Job:* ${env.JOB_NAME} #${env.BUILD_NUMBER}
                    *Branch:* ${env.GIT_BRANCH}
                """.stripIndent()
            )
        }
    }
}
```

Wymaga pluginu: **Slack Notification Plugin**

---

## Sekcja 5: Credentials i security

### Credential binding

```groovy
pipeline {
    // Sekrety jako environment variables — bezpieczne
    environment {
        SECRET_API_KEY = credentials('api-key-secret')
        APP_ENV = 'staging'
    }
    
    stages {
        stage('Test') {
            steps {
                // API_KEY jest dostępne jako $SECRET_API_KEY
                // Jenkins automatycznie maskje je w logach
                sh 'TEST_API_KEY=$SECRET_API_KEY npx playwright test'
            }
        }
    }
}
```

### Masked passwords in logs

```groovy
steps {
    script {
        // Maskuje hasło w logach
        def maskedPass = env.APP_PASSWORD.replaceAll('.', '*')
        echo "Using password: ${maskedPass}"
    }
}
```

### Credentials z Jenkins Credentials Store

Typy credentials w Jenkins:
- **Username with password** — dla basic auth
- **Secret text** — dla API keys, tokens
- **SSH credentials** — dla git over SSH

```groovy
// Z sekretnego tekstu
environment {
    OPENAI_API_KEY = credentials('openai-api-key')
}

// Z username/password
withCredentials([
    usernamePassword(
        credentialsId: 'app-credentials',
        usernameVariable: 'APP_USER',
        passwordVariable: 'APP_PASS'
    )
]) {
    sh 'npx playwright test --headed'
}
```

---

## Sekcja 6: Strategia testów w zależności od trigger

```groovy
pipeline {
    stages {
        // PR — tylko smoke, szybki feedback
        stage('PR Smoke') {
            when {
                changeRequest()
            }
            steps {
                sh 'npx playwright test --grep @smoke --reporter=line,junit'
            }
        }
        
        // Main push — smoke + regression
        stage('Main Regression') {
            when {
                branch 'main'
            }
            steps {
                sh 'npx playwright test --reporter=line,html,json,junit'
            }
        }
        
        // Scheduled — full coverage
        stage('Nightly Full') {
            when {
                triggeredBy 'TimerTrigger'
            }
            steps {
                sh 'npx playwright test --reporter=all'
            }
        }
        
        // Release — validation + security
        stage('Release Validation') {
            when {
                tag pattern: 'v\\d+\\.\\d+\\.\\d+', compare: 'REGEXP'
            }
            steps {
                sh 'npx playwright test --reporter=all'
                sh 'npm run security-scan'
            }
        }
    }
}
```

---

## Sekcja 7: Troubleshooting i best practices

### Common issues

**Issue: Agent out of memory**
```
FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed
```
Solution: Zwiększ `--shm-size` lub użyj większego agenta:
```groovy
agent {
    docker {
        image 'mcr.microsoft.com/playwright:v1.47.0-jammy'
        args '--shm-size=4g -Xmx4g'
    }
}
```

**Issue: Tests timeout in CI but pass locally**
Solution: Zwiększ timeout'y, sprawdź resource agenta:
```groovy
options {
    timeout(time: 2, unit: 'HOURS')
}
```
```typescript
// playwright.config.ts
timeout: 60000,  // 60s zamiast 30s
expect: { timeout: 15000 },
```

**Issue: Parallel stages all fail with "workspace locked"**
Solution: Upewnij się, że stages mają unikalne workspace lub użyj `reuseNode false`:
```groovy
agent {
    docker {
        image 'playwright:v1.47'
        reuseNode false  // Każdy stage dostaje świeży workspace
    }
}
```

**Issue: JUnit results not showing in Jenkins UI**
Solution: Sprawdź ścieżkę pliku JUnit — musi być w workspace:
```groovy
junit 'test-results/junit.xml'  // nie './test-results/...'
```

### Best practices

1. **Always use Docker agent** — unikanie snowflake agents z ręcznie zainstalowanym Node.js
2. **Post always with artifacts** — nawet przy failure raport musi być dostępny
3. **Timeout na pipeline** — unikaj "wiszących" buildów
4. **Build discarder** — retencja artifactów (30-60 builds)
5. **Agent labels** — jasne nazywanie agentów (docker, linux, windows, kubernetes)
6. **Shared libraries** — DRY dla wielu projektów Playwright

---

## Perspektywa Full Stack Testera

Jenkins to dojrzałe narzędzie z unikalnymi możliwościami dla enterprise testing. Jako Full Stack Tester doceniasz:

- **Distributed execution** — możesz skalować testy Playwright na dziesiątki agentów bez dodatkowej infrastruktury
- **Checkpoint gates** — manual approval przed prod deployment to naturalny quality gate
- **History & trends** — Jenkins przechowuje build history przez lata, co pozwala analizować długoterminowe trendy flaky
- **Plugins** — ecosystem integruje się z everything: Jira, Slack, Jira, SonarQube, Kubernetes

Jednocześnie Jenkins wymaga większej dyscypliny niż cloud-native CI:
- Pipeline as code (Jenkinsfile) to mus-have, nie nice-to-have
- Agent maintenance spoczywa na zespole
- Konfiguracja freestyle jobs jest technical debt

Jeśli masz Jenkinsa — używaj go świadomie. Jeśli wybierasz nowe narzędzie — Jenkins jest overkill dla mniejszych zespołów.

---

## Podsumowanie

- **Jenkinsfile as code** — zawsze wersjonuj pipeline w Jenkinsfile, nie w UI. Declarative Pipeline jest czytelny i maintainable.
- **Docker agent** — `--shm-size=2g` jest kluczowy dla Chromium. Official Microsoft image zawiera wszystkie dependencies.
- **Parallel stages** — sharding testów lub multi-browser testing. Merge JUnit results po parallel execution.
- **Post `always`** — publikacja JUnit, HTML, artifacts zawsze, także przy failure. To najważniejsza sekcja w Jenkinsfile.
- **HTML Publisher** — interaktywny raport w Jenkins UI. `keepAll: true` zachowuje raporty historyczne.
- **Credentials** — `credentials()` binding bezpiecznie zarządza sekretami. Jenkins maskje je automatycznie.
- **Shared libraries** — DRY dla wielu projektów. Wspólna logika Playwright pipeline.
- **Triggers** — różne zestawy testów dla PR, main, scheduled, release. `when` dyrektywa kontroluje execution.

---

## Linki i źródła

- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/) — pełna dokumentacja Declarative Pipeline
- [Jenkinsfile Syntax Reference](https://www.jenkins.io/doc/book/pipeline/syntax/) — referencja wszystkich dyrektyw
- [Docker Agent in Jenkins](https://www.jenkins.io/doc/book/pipeline/syntax/#docker) — konfiguracja Docker agent
- [JUnit Plugin](https://plugins.jenkins.io/junit/) — publikacja wyników JUnit w Jenkins UI
- [HTML Publisher Plugin](https://plugins.jenkins.io/htmlpublisher/) — interaktywne raporty HTML
- [Slack Notification Plugin](https://plugins.jenkins.io/slack/) — powiadomienia w Slack
- [Kubernetes Plugin](https://plugins.jenkins.io/kubernetes/) — dynamic provisioning agents w Kubernetes
- [Jenkins Shared Libraries](https://www.jenkins.io/doc/book/pipeline/shared-libraries/) — reusable pipeline components
- [Microsoft Playwright Docker Image](https://mcr.microsoft.com/product/playwright/about) — oficjalny obraz Docker z Playwright