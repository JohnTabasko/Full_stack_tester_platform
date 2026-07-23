# Azure DevOps i inne platformy CI/CD

> **Perspektywa Full Stack Testera**
> Każda organizacja ma swoją platformę CI/CD — i to determinuje, jak integrujesz Playwright. Nie chodzi o to, którą platformę wybrać, lecz o to, jak rozumieć zasady CI/CD, które są wspólne dla wszystkich: powtarzalność, secrets, artefakty, parallelism i feedback speed. Ta lekcja pokazuje, jak te zasady manifestują się w Azure DevOps, CircleCI i Bitbucket Pipelines — oraz kiedy i jak włączyć cloud-based browser testing (BrowserStack, Sauce Labs) jako uzupełnienie lokalnego execution.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Konfigurować Azure Pipelines** z Playwright — azure-pipelines.yml, stages, jobs, tasks
- **Konfigurować CircleCI** — config.yml z executors, jobs, workflows, parallelism
- **Konfigurować Bitbucket Pipelines** — bitbucket-pipelines.yml
- **Rozumieć cross-platform patterns** — cache, artefakty, secrets, matrix builds
- **Integrować BrowserStack/Sauce Labs** z Playwright dla cross-browser testing
- **Decydować, kiedy local vs. cloud** — trade-offs cost, speed i coverage

---

## Wprowadzenie: zasady CI/CD ponad platformą

Zanim zagłębisz się w składnię, zapamiętaj pięć zasad, które są identyczne niezależnie od platformy:

| Zasada | GitHub Actions | GitLab CI | Jenkins | Azure Pipelines | CircleCI |
|--------|---------------|-----------|---------|-----------------|----------|
| **Powtarzalność** | Docker container | Docker image | Docker agent | Docker container | Docker executor |
| **Cache** | `actions/cache` | `cache:` | `cache:` | `Cache@0` task | `save_cache`/`restore_cache` |
| **Secrets** | `secrets:` | `variables:` (masked) | `credentials()` | `variables:` (secret) | `environment:` |
| **Artefakty** | `actions/upload-artifact` | `artifacts:` | `archiveArtifacts` | `PublishBuildArtifacts` | `store_artifacts` |
| **Parallelism** | `matrix:` / `strategy:` | `parallel:` | `parallel:` | `parallel:` | `parallelism:` |

Składnia jest inna, koncepcje te same. Stąd ta lekcja pokazuje każdą platformę przez pryzmat tych samych problemów.

---

## Sekcja 1: Azure Pipelines

### Podstawowy azure-pipelines.yml

```yaml
# azure-pipelines.yml
trigger:
  - main
  - develop

pr:
  - main
  - develop

pool:
  vmImage: 'ubuntu-22.04'

stages:
  - stage: Verify
    jobs:
      - job: Lint
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '20.x'
          - script: npm ci
          - script: npm run lint
          - script: npx tsc --noEmit
      
      - job: TypeCheck
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '20.x'
          - script: npm ci
          - script: npx tsc --noEmit

  - stage: E2E_Smoke
    dependsOn: Verify
    condition: succeeded()
    jobs:
      - job: Playwright_Smoke
        pool:
          vmImage: 'ubuntu-22.04'
        container: mcr.microsoft.com/playwright:v1.47.0-jammy
        steps:
          - task: Cache@2
            inputs:
              key: 'npm | "$(Agent.OS)" | package-lock.json'
              restoreKeys: |
                npm | "$(Agent.OS)"
              path: $(Agent.TempDirectory)/npm-cache
          - script: npm ci
          - script: npx playwright test --grep @smoke --reporter=line,junit
          - task: PublishTestResults@2
            inputs:
              testResultsFormat: 'JUnit'
              testResultsFiles: 'test-results/junit.xml'
              failOnMissingTestFile: false
              testRunTitle: 'Playwright Smoke'
          - publish: playwright-report
            artifact: smoke-report
            condition: always()

  - stage: E2E_FullRegression
    dependsOn: E2E_Smoke
    condition: succeeded()
    condition: eq(variables['Build.Reason'], 'Manual')
    jobs:
      - job: Playwright_Regression
        pool:
          vmImage: 'ubuntu-22.04'
        container: mcr.microsoft.com/playwright:v1.47.0-jammy
        timeoutInMinutes: 120
        steps:
          - script: npm ci
          - script: npx playwright install --with-deps
          - script: npx playwright test --reporter=line,html,json,junit
          - task: PublishTestResults@2
            inputs:
              testResultsFormat: 'JUnit'
              testResultsFiles: 'test-results/junit.xml'
          - publish: playwright-report
            artifact: regression-report
            condition: always()

  - stage: Report
    dependsOn: E2E_Smoke
    condition: succeeded()
    jobs:
      - job: Publish_Report
        steps:
          - download: current
            artifact: smoke-report
          - task: AzureFileCopy@4
            inputs:
              sourcePath: playwright-report
              azureSubscription: 'AzureServiceConnection'
              destination: 'AzureBlob'
              containerName: 'playwright-reports'
              blobPrefix: $(Build.BuildNumber)
          - script: |
              echo "Report available at: https://$(STORAGE_ACCOUNT).blob.core.windows.net/playwright-reports/$(Build.BuildNumber)/index.html"
```

### Matrix builds w Azure Pipelines

```yaml
- stage: CrossBrowser_Tests
  dependsOn: Verify
  jobs:
    - job: Playwright_Browsers
      strategy:
        matrix:
          Chromium:
            BROWSER_NAME: chromium
          Firefox:
            BROWSER_NAME: firefox
          WebKit:
            BROWSER_NAME: webkit
      container: mcr.microsoft.com/playwright:v1.47.0-jammy
      steps:
        - script: npm ci
        - script: npx playwright test --project=$(BROWSER_NAME) --reporter=line,junit
        - task: PublishTestResults@2
```

### Variables i secrets

```yaml
variables:
  # Zwykła zmienna — widoczna w logach
  APP_URL: 'https://staging.example.com'
  
  # Zmienna group — grupa zmiennych (np. "test-env-secrets")
  # Zdefiniowane w: Pipelines → Library → Variable Groups
  - group: playwright-secrets
  - name: BROWSERSTACK_USER
    value: $(browserstack-username)
  - name: BROWSERSTACK_KEY
    value: $(browserstack-key)

parameters:
  - name: runFullRegression
    displayName: 'Run Full Regression'
    type: boolean
    default: false

trigger:
  - main
```

### Publishing test results

```yaml
# PublishTestResults task — pokazuje wyniki w Azure DevOps UI
- task: PublishTestResults@2
  inputs:
    testResultsFormat: 'JUnit'
    testResultsFiles: 'test-results/junit.xml'
    mergeTestResults: true
    failTaskOnFailedTests: true
    testRunTitle: 'Playwright E2E $(Build.BuildNumber)'
    build多Platform: 'true'
```

### Azure DevOps — integration z Playwright Test

Microsoft ma dedykowaną integrację Playwright w Azure Pipelines:

```yaml
# Używając Microsoft Playwright Test Task
- task: Playwright@0
  inputs:
    version: '1.47.0'
    cwd: '$(System.DefaultWorkingDirectory)'
    testSuite: '**/*.spec.ts'
    runOptions: '--grep @smoke'
    envVariables: |
      BASE_URL=$(APP_URL)
      API_KEY=$(API_KEY)
    browser: chromium
    headed: false
    trace: true
    video: true
```

---

## Sekcja 2: CircleCI

### Podstawowy .circleci/config.yml

```yaml
# .circleci/config.yml
version: 2.1

orbs:
  node: circleci/node@5.2.0
  browser-tools: circleci/browser-tools@1.4.0

executors:
  playwright-executor:
    docker:
      - image: cimg/node:20.12-browsers  # Node + przeglądarki
    environment:
      NODE_ENV: test
      PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: 'false'

jobs:
  verify:
    executor: playwright-executor
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: npm
      - run:
          name: Lint and Type Check
          command: |
            npm run lint
            npx tsc --noEmit

  smoke-tests:
    executor: playwright-executor
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: npm
      - browser-tools/install-playwright:
          browsers: chromium
      - run:
          name: Run smoke tests
          command: npx playwright test --grep @smoke --reporter=line,junit,json
      - store_test_results:
          path: test-results
      - store_artifacts:
          path: playwright-report
          when: always

  regression-tests:
    executor: playwright-executor
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: npm
      - browser-tools/install-playwright:
          browsers: chromium, firefox, webkit
      - run:
          name: Run regression tests
          command: npx playwright test --reporter=line,html,junit,json
      - store_test_results:
          path: test-results
      - store_artifacts:
          path: playwright-report
          when: always

workflows:
  version: 2
  test-and-report:
    jobs:
      - verify:
          filters:
            branches:
              only:
                - main
                - develop
      - smoke-tests:
          requires:
            - verify
          filters:
            branches:
              only:
                - main
                - develop
                - feature/*
      - regression-tests:
          requires:
            - smoke-tests
          filters:
            branches:
              only:
                - main
          triggers:
            - schedule:
                cron: "0 3 * * *"  # Nocna regressja o 3:00 UTC
                filters:
                  branches:
                    only:
                      - main

# Parallelism — sharding tests
jobs:
  test-shard-1:
    executor: playwright-executor
    steps:
      - checkout
      - node/install-packages
      - browser-tools/install-playwright
      - run:
          command: |
            PLAYWRIGHT_PARALLELISM=4
            TOTAL_SHARDS=4
            npx playwright test --shard=1/4
      - store_test_results

  test-shard-2:
    # ... (shard 2)

  test-shard-3:
    # ... (shard 3)

  test-shard-4:
    # ... (shard 4)

workflows:
  parallel-shards:
    jobs:
      - test-shard-1
      - test-shard-2
      - test-shard-3
      - test-shard-4

  # Merge results
      - merge-results:
          requires:
            - test-shard-1
            - test-shard-2
            - test-shard-3
            - test-shard-4
```

### CircleCI resource classes

```yaml
jobs:
  heavy-regression:
    executor:
      machine:
        image: ubuntu-2204:2024.01.1
    resource_class: large  # 4 vCPUs, 8GB RAM
    steps:
      - checkout
      - node/install-packages
      - browser-tools/install-playwright
      - run:
          name: Full regression
          command: npx playwright test --workers=4
```

### CircleCI caching

```yaml
jobs:
  smoke-tests:
    executor: playwright-executor
    steps:
      - checkout
      
      - restore_cache:
          keys:
            - v1-npm-{{ checksum "package-lock.json" }}
            - v1-npm-
      
      - node/install-packages:
          pkg-manager: npm
      
      - save_cache:
          key: v1-npm-{{ checksum "package-lock.json" }}
          paths:
            - node_modules
            - ~/.npm
```

---

## Sekcja 3: Bitbucket Pipelines

### bitbucket-pipelines.yml

```yaml
# bitbucket-pipelines.yml
image: node:20

pipelines:
  default:
    - step:
        name: Lint & Types
        script:
          - npm ci
          - npm run lint
          - npx tsc --noEmit

  pull-requests:
    '**':
      - step:
          name: Playwright Smoke
          image: mcr.microsoft.com/playwright:v1.47.0-jammy
          script:
            - npm ci
            - npx playwright install --with-deps chromium
            - npx playwright test --grep @smoke --reporter=line,junit
          artifacts:
            - test-results/**
            - playwright-report/**
          caches:
            - npm
          size: 2x  # Więcej zasobów (4 vCPUs)

  branches:
    main:
      - step:
          name: Verify
          script:
            - npm ci
            - npm run lint
            - npx tsc --noEmit

      - parallel:
          - step:
              name: Playwright Chrome
              image: mcr.microsoft.com/playwright:v1.47.0-jammy
              script:
                - npm ci
                - npx playwright install --with-deps chromium
                - npx playwright test --project=chromium --reporter=line,junit
              artifacts:
                - test-results/**

          - step:
              name: Playwright Firefox
              image: mcr.microsoft.com/playwright:v1.47.0-jammy
              script:
                - npm ci
                - npx playwright install --with-deps firefox
                - npx playwright test --project=firefox --reporter=line,junit
              artifacts:
                - test-results/**

definitions:
  caches:
    npm: ~/.npm
```

### Bitbucket Deployments — multi-environment

```yaml
pipelines:
  deployments:
    staging:
      - step:
          name: Deploy to Staging
          deployment: staging
          script:
            - ./deploy.sh staging
      - step:
          name: Playwright Staging Tests
          image: mcr.microsoft.com/playwright:v1.47.0-jammy
          script:
            - npm ci
            - npx playwright test --project=staging --reporter=line,junit
          artifacts:
            - playwright-report/**
          conditions:
            - if: $BITBUCKET_DEPLOYMENT_ENVIRONMENT == "staging"

    production:
      - step:
          name: Production Smoke
          deployment: production
          script:
            - npm ci
            - npx playwright test --grep @critical --reporter=line,junit
```

---

## Sekcja 4: Cross-platform patterns — co jest wspólne

### Cache strategy — porównanie platform

| Aspekt | GitHub Actions | GitLab CI | Azure DevOps | CircleCI | Bitbucket |
|--------|---------------|-----------|--------------|----------|-----------|
| **npm cache** | `actions/cache` | `cache: { key: ... }` | `Cache@2` task | `restore_cache` / `save_cache` | `caches: - npm` |
| **PW browsers** | Custom action | `cache:` z path | `Cache@2` | Browser tools orb | `caches:` |
| **Key strategy** | `${{ hashFiles }}` | `${CI_COMMIT_REF_SLUG}` | `hashFiles()` | `{{ checksum }}` | `npm` |

### Secrets management — porównanie

```yaml
# GitHub Actions
env:
  SECRET_TOKEN: ${{ secrets.MY_SECRET }}

# GitLab CI
variables:
  SECRET_TOKEN: $MY_SECRET  # Zdefiniowane w Settings → CI/CD → Variables

# Azure DevOps
variables:
  - name: SECRET_TOKEN
    value: $(my-secret)  # Z Library → Variable Groups
  - group: playwright-secrets

# CircleCI
environment:
  SECRET_TOKEN: ${SECRET_TOKEN}  # Z Project Settings → Environment Variables

# Bitbucket
pipelines:
  default:
    - step:
        script:
          - export SECRET_TOKEN=$SECRET_TOKEN  # Z Repository Settings → Variables
```

### Artifacts — porównanie

```yaml
# GitHub Actions
- uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report
    retention-days: 30

# GitLab CI
artifacts:
  paths:
    - playwright-report
  expire_in: 30 days
  when: always

# Azure DevOps
- publish: playwright-report
  artifact: playwright-report
  condition: always()

# CircleCI
- store_artifacts:
    path: playwright-report
    destination: playwright-report

# Bitbucket
artifacts:
  - playwright-report/**
  - test-results/**
```

---

## Sekcja 5: Cloud browser testing — BrowserStack i Sauce Labs

### Kiedy używać cloud testing

Cloud browser testing (BrowserStack, Sauce Labs, LambdaTest) ma sens gdy:

- **Brak zasobów** — nie masz agentów z Windows/macOS lub dużej puli Linux agentów
- **Device coverage** — potrzebujesz testów na Mobile Safari, Samsung Browser, starszych wersji IE/Edge
- **Geo-testing** — testujesz latency z różnych lokalizacji geograficznych
- **Parallel scaling** — chcesz uruchomić 50 shardów równolegle bez self-hosting agentów

**Nie ma sensu** gdy:
- Uruchamiasz ten sam zestaw testów na tym samym OS/browser w kółko
- Masz stable CI infrastructure z wieloma agentami
- Testy wymagają access do internal services niedostępne z internetu

### Integracja BrowserStack z Playwright

```typescript
// playwright.config.ts — BrowserStack configuration
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  
  projects: [
    // Local execution
    {
      name: 'chromium-local',
      use: { ...devices['Desktop Chrome'] },
    },
    
    // BrowserStack Chromium
    {
      name: 'bs-chromium',
      use: {
        browserName: 'chromium',
        launchOptions: {
          args: ['--disable-blink-features=AutomationControlled'],
        },
      },
      config: {
        browserstack: {
          username: process.env.BROWSERSTACK_USERNAME,
          accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
        },
      },
    },
    
    // BrowserStack Mobile
    {
      name: 'bs-iphone-14',
      use: {
        browserName: 'webkit',
        ...devices['iPhone 14'],
      },
    },
    
    // BrowserStack Windows
    {
      name: 'bs-edge-win10',
      use: {
        browserName: 'chromium',
        channel: 'edge',
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
});
```

### BrowserStack w CI pipeline

```bash
# .env — BrowserStack credentials
BROWSERSTACK_USERNAME=your_username
BROWSERSTACK_ACCESS_KEY=your_access_key
```

```yaml
# Azure Pipelines + BrowserStack
- stage: BrowserStack_Tests
  jobs:
    - job: BS_Chrome
      steps:
        - script: |
            npx playwright test \
              --project=bs-chromium \
              --reporter=line,json
          env:
            BROWSERSTACK_USERNAME: $(BROWSERSTACK_USERNAME)
            BROWSERSTACK_ACCESS_KEY: $(BROWSERSTACK_ACCESS_KEY)
            BROWSERSTACK_BUILD_NAME: $(Build.BuildNumber)
```

### BrowserStack Reporter — automatic result upload

```typescript
// browserstack-reporter.ts
import { chromium, Browser, BrowserContext } from '@playwright/test';
import { bsReporter } from '@browserstack/playwright-js-reporter';

async function runBrowserStackTests() {
  const browser = await chromium.launch({
    args: [
      `--browserstack.username=${process.env.BROWSERSTACK_USERNAME}`,
      `--browserstack.accessKey=${process.env.BROWSERSTACK_ACCESS_KEY}`,
    ],
  });
  
  // Automatyczny upload wyników do BrowserStack dashboard
  await browser.close();
}
```

### Sauce Labs integration

```typescript
// playwright.config.ts — Sauce Labs
export default defineConfig({
  use: {
    launchOptions: {
      args: [
        `--sauce.username=${process.env.SAUCE_USERNAME}`,
        `--sauce.accessKey=${process.env.SAUCE_ACCESS_KEY}`,
        `--sauce.tunnel-id=${process.env.SAUCE_TUNNEL_ID}`,
      ],
    },
  },
  
  projects: [
    {
      name: 'sauce-chrome-win',
      use: {
        browserName: 'chromium',
        channel: undefined,
      },
      config: {
        sauce: {
          region: 'eu-central-1',
          platformName: 'Windows 11',
          browserVersion: 'latest',
        },
      },
    },
  ],
});
```

### Cost optimization — kiedy local vs. cloud

```yaml
# Decyzja: local vs. BrowserStack w zależności od testu

strategy:
  matrix:
    include:
      # Local — szybkie, darmowe, dobre dla frequent runs
      - TEST_TYPE: smoke
        BROWSER: chromium
        LOCATION: local
      
      # Cloud — szerokie pokrycie, wolniejsze, droższe, dobre dla okresowych pełnych uruchomień
      - TEST_TYPE: regression
        BROWSER: chrome, firefox, safari, edge
        LOCATION: cloud
      
      # Cloud mobile — tylko dla mobile-specific tests
      - TEST_TYPE: mobile-check
        DEVICE: iPhone 14, Samsung S23
        LOCATION: cloud
```

Reguła thumb: **Local execution dla 80% testów (smoke, fast regression), Cloud dla 20% (cross-browser matrix, mobile, geo-testing).**

---

## Sekcja 6: Wybór platformy — decyzja dla organizacji

### Porównanie platform CI/CD dla Playwright

| Kryterium | GitHub Actions | GitLab CI | Azure DevOps | CircleCI | Bitbucket | Jenkins |
|-----------|---------------|-----------|--------------|----------|-----------|---------|
| **Koszt** | Free do 2000min/ms | Free (self-hosted) / SaaS | Free do 1800min | Free do 1000min | Free do 500min | Free (self-hosted) |
| **GIT integration** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Docker support** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Playwright support** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Enterprise features** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Learning curve** | Low | Medium | Medium | Low | Low | High |
| **Maintenance** | Low (SaaS) | Medium | Low (SaaS) | Low (SaaS) | Low (SaaS) | High (self-hosted) |

### Recommendation framework

- **Startup/small team**: GitHub Actions lub CircleCI — najszybszy start, darmowy tier
- **Microsoft-centric org**: Azure DevOps — naturalna integracja z Azure, Azure Boards, Azure Repos
- **Open source / GitLab-native**: GitLab CI — doskonała integracja z GitLab ecosystem
- **Enterprise z legacy Jenkins**: Migrate gradually — nie przepisuj wszystkiego naraz
- **Enterprise bez istniejącego CI**: Azure DevOps lub GitHub Enterprise — najlepszy support i security

---

## Perspektywa Full Stack Testera

Jako Full Stack Tester pracujący z wieloma platformami CI/CD pamiętaj:

**Składnia jest wtórna.** Gdy rozumiesz pięć zasad CI/CD (powtarzalność, cache, secrets, artefakty, parallelism), adaptacja do nowej platformy to kwestia godziny — nie dni. Ta lekcja pokazuje cztery platformy nie po to, byś uczył się wszystkich, lecz byś rozumiał, że problemy są wspólne.

**Cloud browser testing to kompromis.** BrowserStack i Sauce Labs dają coverage, ale kosztują i wprowadzają zależność zewnętrzną. Używaj strategicznie — full matrix na cloud, smoke na local.

**Platform lock-in jest ryzykiem.** Unikaj deep coupling z specyficznymi funkcjami platformy. Standardowe formaty (JUnit, JSON, HTML reports) działają wszędzie. Custom steps/reporter actions są mniej portable.

---

## Podsumowanie

- **Azure DevOps** — `azure-pipelines.yml` z stages, jobs, containers. `PublishTestResults@2` task integruje JUnit z DevOps UI. Matrix builds dla cross-browser.
- **CircleCI** — `config.yml` z orbs (node, browser-tools), executors, workflows. Parallelism przez wiele jobów. `store_test_results` / `store_artifacts`.
- **Bitbucket Pipelines** — `bitbucket-pipelines.yml` z `pipelines:`, `definitions:` i `caches:`. Integracja z Bitbucket Deployments dla multi-environment.
- **Wspólne wzorce** — cache npm/node_modules na wszystkich platformach, secrets przez environment variables, artefakty `when: always`.
- **BrowserStack / Sauce Labs** — cloud execution dla cross-browser matrix, mobile, geo-testing. Strategia: local dla 80% testów, cloud dla 20%.
- **Wybór platformy** — zależy od organizacji, istniejącej infrastruktury i team expertise. Zasady CI/CD są wspólne, składnia różna.

---

## Linki i źródła

- [Azure Pipelines Documentation](https://learn.microsoft.com/en-us/azure/devops/pipelines/) — pełna dokumentacja Azure Pipelines
- [Azure Pipelines Playwright Task](https://learn.microsoft.com/en-us/azure/devops/pipelines/tasks/test/playwright-tests) — Microsoft Playwright task
- [CircleCI Documentation](https://circleci.com/docs/) — pełna dokumentacja CircleCI
- [CircleCI Browser Tools Orb](https://circleci.com/developer/orbs/orb/circleci/browser-tools) — Playwright w CircleCI
- [Bitbucket Pipelines Documentation](https://support.atlassian.com/bitbucket-cloud/docs/bitbucket-pipelines/) — konfiguracja Bitbucket Pipelines
- [BrowserStack Playwright Integration](https://www.browserstack.com/docs/automate/playwright) — oficjalna integracja Playwright + BrowserStack
- [Sauce Labs Playwright Documentation](https://docs.saucelabs.com/test-results/viewing-test-results/view-in-sauce/index.html) — Sauce Labs + Playwright
- [Cross-Platform CI/CD Patterns — Martin Fowler](https://martinfowler.com/articles/continuousIntegration.html) — teoretyczne podstawy CI/CD niezależne od platformy

## 📘 Suplement Inżynieryjny 2026: Integracja z CI/CD (Pipeline Optimization)
*Inspiracja: „Hands-On Automated Testing with Playwright” (2026), Chapter 7*
*   **Sharding**: Rozdzielaj uruchomienie testów na wiele niezależnych maszyn (shardów) w rurociągu CI/CD (np. GitHub Actions) w celu skrócenia czasu wykonania z godzin do kilku minut.
*   **Dockerization**: Zawsze uruchamiaj testy regresji wizualnej w kontenerach Docker, aby zagwarantować identyczne renderowanie czcionek i grafik na maszynie dewelopera oraz serwerze CI.
