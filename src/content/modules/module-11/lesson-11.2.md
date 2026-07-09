# Integracja z GitLab CI/CD

> **Perspektywa Full Stack Testera**
> Playwright na lokalnej maszynie to narzędzie dewelopera. Playwright w GitLab CI to bramka jakości całego zespołu. Ta różnica wymaga przemyślenia: jak szybko dać feedback? Jak publikować diagnostykę przy awarii? Jak bezpiecznie zarządzać sekretami? Jak skalować testy bez przytoczenia pipeline'u? Ta lekcja uczy, jak zaprojektować pipeline Playwright w GitLab CI, który działa niezawodnie, publikuje raporty i wspiera pracę zespołową na każdym etapie procesu CI/CD.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Projektować pipeline w .gitlab-ci.yml** z odpowiednimi stages, cache i zależnościami między jobami
- **Konfigurować Playwright w kontenerze Docker** — oficjalny obraz lub własny Dockerfile
- **Korzystać z artifacts i when: always** — publikacja raportów przy awarii, nie tylko przy sukcesie
- **Skalować testy równolegle** — parallel jobs, matrix strategy, test splitting
- **Hostować raport HTML na GitLab Pages** z linkowaniem z merge requestów
- **Zarządzać sekretami bezpiecznie** — zmienne CI/CD, maskowanie, zakresy

---

## Wprowadzenie: dlaczego GitLab CI to dobry wybór dla Playwright

GitLab CI (wbudowane w GitLab.com i GitLab Self-Managed) oferuje kilka przewag dla testów Playwright:

- **Integrated** — brak zewnętrznych integracji, konfiguracja w jednym pliku YAML
- **Artifacts persistent** — raporty HTML i trace'y przetrwają nawet po czerwonym jobie (z `when: always`)
- **GitLab Pages** — darmowy hosting raportów HTML w ramach repozytorium
- **Parallel jobs** — native support dla równoległego execution bez dodatkowych narzędzi
- **Cache optimization** — warstwowe cachowanie `node_modules` przyspiesza kolejne przebiegi
- **Kubernetes executor** — skalowanie na wielu workerach w klastrze
- **Merge request integration** — natywne wyświetlanie statusu pipeline w MR, z linkami do raportów

Alternatywy (Jenkins, GitHub Actions, CircleCI) mają podobne możliwości, ale GitLab CI jest native dla ekosystemu GitLab — idealny, jeśli już używasz GitLaba jako VCS i issue tracker.

---

## Sekcja 1: Struktura pipeline — stages i job flow

### Podstawowa struktura .gitlab-ci.yml

```yaml
# .gitlab-ci.yml — kompletna konfiguracja Playwright pipeline
stages:
  - verify      # Szybkie walidacje: lint, typy, unit
  - e2e         # Testy E2E: smoke, regression
  - report      # Generowanie i publikacja raportów
  - deploy      # Warunkowy deploy przy spełnieniu criteria

# Zmienne globalne — wspólne dla wszystkich jobów
variables:
  PLAYWRIGHT_VERSION: "1.47.0"
  NODE_VERSION: "20"
  PLAYWRIGHT_BROWSERS_PATH: "/ms-playwright"
  npm_config_cache: "$CI_PROJECT_DIR/.npm"

# Etap 1: Verifikacja — szybki feedback
lint:
  stage: verify
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm run lint
    - npm run type-check
  cache:
    key: npm-${CI_COMMIT_REF_SLUG}
    paths:
      - .npm
      - node_modules
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == "main"

types:
  stage: verify
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npx tsc --noEmit
  cache:
    key: npm-${CI_COMMIT_REF_SLUG}
    paths:
      - .npm
      - node_modules
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == "main"

# Etap 2: E2E — smoke tests (szybkie, na każdym MR)
playwright:smoke:
  stage: e2e
  image: mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-jammy
  services:
    - docker:24-dind  # Docker-in-Docker dla przeglądarek
  script:
    - npm ci
    - npx playwright install --with-deps chromium
    - npx playwright test --grep @smoke --reporter=line,html,junit
  artifacts:
    when: always  # KLUCZOWE: publikuj artefakty nawet przy awarii
    expire_in: 7 days
    paths:
      - playwright-report/
      - test-results/
    reports:
      junit: test-results/junit.xml
  coverage: '/Coverage: (\d+\.\d+) %/'
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == "main"
  parallel:
    matrix:
      - BROWSER: [chromium, firefox]

# Etap 2: E2E — full regression (na main, nightly)
playwright:regression:
  stage: e2e
  image: mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-jammy
  services:
    - docker:24-dind
  script:
    - npm ci
    - npx playwright install --with-deps
    - npx playwright test --reporter=line,html,json,junit
  artifacts:
    when: always
    expire_in: 30 days
    paths:
      - playwright-report/
      - test-results/
      - trace/
    reports:
      junit: test-results/junit.xml
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
      when: manual
    - if: $CI_PIPELINE_SOURCE == "schedule"
  timeout: 2h  # Długi timeout dla pełnej regresji
  resource_group: regression  # Zapobiega równoległym regression runs

# Etap 3: Raporty — GitLab Pages
pages:
  stage: report
  image: python:3.12-slim
  script:
    - mv playwright-report public/
  artifacts:
    paths:
      - public
    expire_in: 30 days
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
  needs:
    - playwright:regression
```

### Logika stages — kiedy co uruchamiać

| Zdarzenie | Stages aktywne | Typ testów | Cel |
|-----------|---------------|------------|-----|
| **Merge Request** | verify → e2e | Lint, types, smoke | Szybki feedback PR |
| **Push na main** | verify → e2e → report | Lint, types, smoke, regression | Pełna walidacja |
| **Scheduled (nightly)** | e2e → report | Full regression | Weryfikacja nocna |
| **Release tag** | verify → e2e → deploy | Full regression + security | Final gate |
| **Manual trigger** | e2e | Wybrany zestaw | On-demand testing |

### Dependency routing — fail fast

Zasada fail fast: jeśli lint pada, E2E nie ma sensu. GitLab CI automatycznie nie uruchomi jobów zależnych od failed joba (chyba że job ma `allow_failure: true`):

```yaml
# Job E2E zależy od success verify
playwright:smoke:
  stage: e2e
  # Implicit dependency na wszystkie jobs w stage 'verify'
  # Jeśli lint lub types failed → playwright:smoke się nie uruchomi
  script:
    - npm ci
    - npx playwright test --grep @smoke
```

Dla jobów "opcjonalnych" (np. flaky security scan) używamy `allow_failure`:

```yaml
security-scan:
  stage: verify
  allow_failure: true  # Nie blokuje pipeline, ale raportuje problem
  script:
    - npm run security-audit
```

---

## Sekcja 2: Playwright w kontenerze Docker

### Wybór obrazu Docker

GitLab CI używa obrazów Docker jako środowiska execution. Dla Playwright masz dwie opcje:

**Opcja A: Oficjalny obraz Microsoft Playwright**
```yaml
image: mcr.microsoft.com/playwright:v1.47.0-jammy
```

Zalety: zawiera Playwright + wszystkie przeglądarki + zależności systemowe. Gotowy do użycia.

Wady: duży obraz (~2GB), stała wersja Playwright (aktualizacja = zmiana obrazu).

**Opcja B: Custom Dockerfile**
```dockerfile
# Dockerfile.playwright
FROM node:20-jammy

# Install system dependencies for browsers
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    apt-transport-https \
    && rm -rf /var/lib/apt/lists/*

# Install Playwright
RUN npm install -g playwright@1.47.0

# Install browsers
RUN playwright install --with-deps chromium firefox webkit

WORKDIR /app
COPY package*.json ./
RUN npm ci

CMD ["npx", "playwright", "test"]
```

```yaml
# .gitlab-ci.yml
build:image:
  stage: build
  image: docker:24-dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE/playwright:$CI_COMMIT_SHA -f Dockerfile.playwright .
    - docker push $CI_REGISTRY_IMAGE/playwright:$CI_COMMIT_SHA
  rules:
    - if: $CI_COMMIT_BRANCH == "main"

playwright:smoke:
  image: $CI_REGISTRY_IMAGE/playwright:$CI_COMMIT_SHA
  # ...
```

### Konfiguracja przeglądarek w CI

```typescript
// playwright.config.ts — optymalizacja dla CI
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  
  // Timeout'y dostosowane do CI (shared runners mogą być wolniejsze)
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  
  // Retries — CI ma więcej niestabilności niż local
  retries: 2,
  
  // Workers — zależy od planu GitLab CI
  // Free: 1 worker, Gold: 2, Premium: 4+
  workers: process.env.CI ? 2 : undefined,
  
  // Reporter — HTML + JUnit (dla GitLab) + Line (dla console)
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],
  
  use: {
    // Trace na retry (nie na failure) — oszczędza miejsce
    trace: 'on-first-retry',
    
    // Video tylko przy failure
    video: 'retain-on-failure',
    
    // Screenshots też przy failure
    screenshot: 'only-on-failure',
    
    // Launch options dla CI
    launchOptions: {
      args: [
        '--no-sandbox',           // Wymagane w kontenerze
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // Unikaj /dev/shm overflow
      ],
    },
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});
```

### Docker-in-Docker (dind) service

Playwright wymaga pełnego środowiska Linux do uruchamiania przeglądarek. W GitLab CI używamy `docker:24-dind` service:

```yaml
services:
  - docker:24-dind

variables:
  DOCKER_HOST: tcp://docker:2376
  DOCKER_TLS_CERTDIR: "/certs"
  DOCKER_TLS_VERIFY: 1
```

Bez `dind` przeglądarki Playwright mogą mieć problemy z uruchomieniem w niektórych executorach (Kubernetes, Docker runner).

---

## Sekcja 3: Artifacts — publikacja raportów i trace'ów

### artifacts — kiedy i jak

Artyfakty w GitLab CI to pliki generowane przez job, które są dostępne po jego zakończeniu. Dla Playwright kluczowe jest `when: always`:

```yaml
artifacts:
  when: always  # Publikuj nawet gdy job zakończy się niepowodzeniem
  expire_in: 7 days  # Automatyczne usunięcie po 7 dniach
  paths:
    - playwright-report/
    - test-results/
    - trace/
  reports:
    junit: test-results/junit.xml  # Integracja z GitLab Test Report UI
```

| `when:` | Kiedy publikuje | Przypadek użycia |
|---------|-----------------|-----------------|
| `on_success` | Tylko przy sukcesie | Intermediate build artifacts |
| `on_failure` | Tylko przy awarii | Crash dumps, debug logs |
| `always` | Zawsze | **Playwright reports, traces** |
| `manual` | Ręcznie przez użytkownika | On-demand artifacts |

### GitLab Test Report UI — integracja JUnit

JUnit XML to standardowy format raportu testowego. GitLab automatycznie parsuje plik JUnit i wyświetla go w UI:

```yaml
artifacts:
  reports:
    junit: test-results/junit.xml
```

Po uruchomieniu pipeline w GitLab UI zobaczysz:
- **Test Report tab** — lista testów z passed/failed
- **Failed tests** — expandable z stack trace'em
- **Duration** — czas każdego testu
- **History** — trend pass rate w project dashboard

Konfiguracja JUnit reporter w Playwright:

```typescript
// playwright.config.ts
reporter: [
  ['list'],
  ['html', { outputFolder: 'playwright-report' }],
  ['junit', { outputFile: 'test-results/junit.xml' }],
],
```

### Przechowywanie trace'ów — duże pliki

Trace'y Playwright mogą być duże (setki MB dla długich testów). GitLab ma limity artifactów:

| Plan GitLab | Max artifact size | Retention |
|-------------|-------------------|-----------|
| Free | 100 MB | 7 days |
| Premium | 1 GB | 30 days |
| Ultimate | 5 GB | 90 days |

Dla dużych trace'ów używaj GitLab Pages lub external storage:

```yaml
playwright:regression:
  stage: e2e
  script:
    - npm ci
    - npx playwright test --trace retain-on-failure
    # Zip trace'y przed uploadem (zmniejsz ~80%)
    - find trace/ -name "*.zip" -exec echo {} \;
  artifacts:
    when: always
    expire_in: 30 days
    paths:
      - playwright-report/
      - test-results/junit.xml
      - trace.zip  # Compressed trace archive
```

Lepsze podejście dla dużych projektów — upload trace'ów do S3/GCS:

```typescript
// post-test.ts — upload trace do S3 po teście
import { S3Client } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: 'eu-central-1' });

export async function uploadTrace(tracePath: string, metadata: Record<string, string>) {
  const key = `traces/${metadata.runId}/${metadata.testId}.zip`;
  
  await s3.putObject({
    Bucket: process.env.TRACES_BUCKET!,
    Key: key,
    Body: fs.createReadStream(tracePath),
    Metadata: metadata,
  });
  
  return `https://${process.env.TRACES_BUCKET}.s3.amazonaws.com/${key}`;
}
```

---

## Sekcja 4: Równoległość i parallel execution

### Parallel jobs — test splitting

GitLab CI pozwala uruchamiać wiele instancji tego samego joba równolegle z różnymi parametrami:

```yaml
playwright:smoke:
  stage: e2e
  image: mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-jammy
  parallel:
    matrix:
      - TEST_GROUP: [auth, checkout, search, profile]
  script:
    - npx playwright test --grep @smoke --grep-annotation group=${TEST_GROUP}
  artifacts:
    when: always
    paths:
      - playwright-report/
      - test-results/
```

### Test file splitting — instatnce workers

Dla lepszego load balancing używaj test file splitting:

```bash
# Podziel testy na N grup
TEST_FILES=$(find tests -name "*.spec.ts" | sort | \
  awk "NR % ${CI_NODE_TOTAL} == ${CI_NODE_INDEX - 1} {print}")

npx playwright test $TEST_FILES --reporter=list
```

```yaml
playwright:split:
  stage: e2e
  image: mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-jammy
  parallel:
    matrix:
      - CI_NODE_INDEX: [1, 2, 3, 4]
        CI_NODE_TOTAL: 4
  script:
    - |
      TEST_FILES=$(find tests -name "*.spec.ts" | sort | \
        awk "NR % ${CI_NODE_TOTAL} == ${CI_NODE_INDEX - 1} {print}")
      npx playwright test $TEST_FILES \
        --reporter=line,json,junit \
        --shard=$CI_NODE_INDEX/$CI_NODE_TOTAL
  artifacts:
    when: always
    expire_in: 7 days
    paths:
      - playwright-report/
      - test-results/
  coverage: '/Lines\\s*:\\s*(\\d+\\.\\d+)%/'
```

### Test sharding z Playwright built-in

Playwright ma wbudowany sharding:

```bash
# Uruchom 4 sharda (każdy na innym runnerze)
npx playwright test --shard=1/4
npx playwright test --shard=2/4
npx playwright test --shard=3/4
npx playwright test --shard=4/4
```

```yaml
# .gitlab-ci.yml z 4 parallel runners
stages:
  - e2e

.playwright_template: &playwright_template
  image: mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-jammy
  services:
    - docker:24-dind
  before_script:
    - npm ci
    - npx playwright install --with-deps

test:shard1:
  <<: *playwright_template
  stage: e2e
  script:
    - npx playwright test --shard=1/4 --reporter=line,junit
  artifacts:
    when: always
    paths:
      - test-results/

test:shard2:
  <<: *playwright_template
  stage: e2e
  script:
    - npx playwright test --shard=2/4 --reporter=line,junit
  artifacts:
    when: always
    paths:
      - test-results/

test:shard3:
  <<: *playwright_template
  stage: e2e
  script:
    - npx playwright test --shard=3/4 --reporter=line,junit
  artifacts:
    when: always
    paths:
      - test-results/

test:shard4:
  <<: *playwright_template
  stage: e2e
  script:
    - npx playwright test --shard=4/4 --reporter=line,junit
  artifacts:
    when: always
    paths:
      - test-results/
```

### Mergowanie wyników z wielu shardów

Po parallel execution musisz zmerge'ować JUnit XML:

```yaml
merge-results:
  stage: report
  image: node:20
  needs:
    - test:shard1
    - test:shard2
    - test:shard3
    - test:shard4
  script:
    - npm install -g junit-merge
    - junit-merge -d test-results -o test-results/merged.xml
  artifacts:
    paths:
      - test-results/merged.xml
    reports:
      junit: test-results/merged.xml
```

---

## Sekcja 5: GitLab Pages — hosting raportów HTML

### Konfiguracja Pages

GitLab Pages serwuje statyczne pliki z katalogu `public/` w branchu `gh-pages`. Konfiguracja:

```yaml
pages:
  stage: report
  image: alpine:latest
  script:
    - echo "Deploying Playwright report to GitLab Pages"
    - cp -r playwright-report public/
    # Dodaj index.html z redirect do aktualnego raportu
    - echo '<meta http-equiv="refresh" content="0; url=report/index.html">' > public/index.html
  artifacts:
    paths:
      - public
    expire_in: 30 days
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
  needs:
    - job: playwright:regression
      artifacts: true
```

### Dostęp i bezpieczeństwo Pages

| Ustawienie | Public | Internal | Private |
|------------|--------|----------|---------|
| Public project | Public Pages | Private Pages | Private Pages |
| Private project | Private Pages | Private Pages | Private Pages |

Dla private projects raport na Pages wymaga logowania do GitLaba. Alternatywa — upload do S3 z signed URLs:

```yaml
upload-report:
  stage: report
  image: amazon/aws-cli:latest
  needs:
    - playwright:regression
  script:
    - aws s3 cp playwright-report s3://$REPORT_BUCKET/reports/$CI_COMMIT_SHA/ --recursive
    - echo "Report URL: https://$REPORT_BUCKET.s3.amazonaws.com/reports/$CI_COMMIT_SHA/index.html"
  variables:
    AWS_ACCESS_KEY_ID: $AWS_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY: $AWS_SECRET_ACCESS_KEY
  environment:
    name: report
    url: https://$REPORT_BUCKET.s3.amazonaws.com/reports/$CI_COMMIT_SHA/index.html
```

### Linkowanie z Merge Request

GitLab automatycznie wyświetla artefakty w MR UI:

```
Pipeline: ✅ Passed (2min 34s)
├── verify (lint + types) — ✅
├── e2e (smoke) — ✅
└── 📊 Playwright Report: [View](https://gitlab.example.com/-/jobs/artifacts/main/download?job=pages)
```

Dla lepszej widoczności w MR comment:

```yaml
comment:mr:
  stage: report
  image: node:20-alpine
  needs:
    - playwright:regression
    - pages
  script: |
    REPORT_URL="${CI_PROJECT_URL}/-/jobs/artifacts/main/download?job=pages"
    
    curl --request POST \
      --header "PRIVATE-TOKEN: ${GITLAB_TOKEN}" \
      --header "Content-Type: application/json" \
      --data "{
        \"body\": \"## Playwright Report\\n\\n📊 [Otwórz raport HTML](${REPORT_URL})\\n\\n| Metryka | Wartość |\\n|---|---|\\n| Passed | ${PASSED} |\\n| Failed | ${FAILED} |\\n| Duration | ${DURATION} |\"
      }" \
      "${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/merge_requests/${CI_MERGE_REQUEST_IID}/notes"
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

---

## Sekcja 6: Cache — optymalizacja instalacji zależności

### Strategia cache dla npm/Playwright

Cache w GitLab CI przyspiesza kolejne pipeline uruchomienia, unikając ponownego pobierania `node_modules`:

```yaml
cache:
  key: ${CI_COMMIT_REF_SLUG}-npm  # Cache per branch
  paths:
    - .npm
    - node_modules/
  policy: pull-push  # Zapisz i odczytaj cache
```

Lepsza strategia — cache tylko na main, key stable:

```yaml
cache:
  key: npm-stable
  paths:
    - .npm
    - node_modules/
  policy: pull-push
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
    - if: $CI_COMMIT_BRANCH == "develop"
```

### Playwright browsers cache

Playwright instaluje przeglądarki do `$PLAYWRIGHT_BROWSERS_PATH`. Cache tej ścieżki przyspiesza install:

```yaml
variables:
  PLAYWRIGHT_BROWSERS_PATH: /cache/pw-browsers

playwright:smoke:
  cache:
    key: playwright-browsers
    paths:
      - /cache/pw-browsers
  script:
    - npm ci
    - npx playwright install --with-deps chromium
    - npx playwright test
```

---

## Sekcja 7: Bezpieczeństwo — sekrety i maskowanie

### Zmienne CI/CD — zakresy i maskowanie

```yaml
variables:
  # Zmienna globalna — widoczna dla wszystkich jobów
  APP_URL: "https://staging.example.com"
  
  # Zmienna masked — nie pojawi się w logach
  DATABASE_URL: "postgresql://..."  # Zdefiniuj w Settings → CI/CD → Variables jako masked
  
  # Zmienna protected — tylko dla protected branches
  PRODUCTION_TOKEN: "secret"  # Zdefiniuj jako protected variable
```

Zasady bezpieczeństwa w GitLab CI:
- **Maskowane zmienne** — automatycznie zastępowane przez `***` w logach
- **Chronione zmienne** — dostępne tylko dla protected branches (main, release/*)
- **Never echo secrets** — nawet w debug scripts

```yaml
# NIE Rób tego:
script:
  - echo $SECRET_TOKEN  # ⚠️ Token pojawi się w logach!

# Zrób to:
script:
  - |  # Użyj pipe, nie echo
    SECRET_MASKED=$(echo $SECRET_TOKEN | cut -c1-4)
    echo "Using token: ${SECRET_MASKED}****"
```

### Environment-scoped variables

```yaml
playwright:staging:
  stage: e2e
  environment:
    name: staging
    url: https://staging.example.com
  variables:
    APP_URL: https://staging.example.com
    API_URL: https://api.staging.example.com
  rules:
    - if: $CI_COMMIT_BRANCH == "main"

playwright:production:
  stage: e2e
  environment:
    name: production
    url: https://example.com
  variables:
    APP_URL: https://example.com
    API_URL: https://api.example.com
  rules:
    - if: $CI_COMMIT_TAG =~ /^v\d+\.\d+\.\d+$/
```

---

## Sekcja 8: Troubleshooting common issues

### Problem: Browser nie może się uruchomić w Docker

```
Error: browser is not installed
```

Rozwiązanie: Upewnij się, że `dind` service jest skonfigurowany i obraz Playwright zawiera browsery:

```yaml
services:
  - docker:24-dind  # Wymagane dla Chromium w niektórych executorach

before_script:
  - npx playwright install --with-deps chromium
```

### Problem: Timeout na CI, ale działa lokalnie

Rozwiązanie: Zwiększ timeout'y w `playwright.config.ts` i sprawdź resource limits:

```yaml
playwright:smoke:
  timeout: 10m  # Explicit timeout w jobie
  variables:
    PLAYWRIGHT_TIMEOUT: 60000
```

### Problem: Parallel jobs fail z race conditions

Rozwiązanie: Upewnij się, że testy są idempotent i nie zależą od wspólnego stanu:

```typescript
// Testy izolowane przez fixture z unique data
test.beforeEach(async ({ page }, testInfo) => {
  const testId = `test-${testInfo.workerIndex}-${Date.now()}`;
  await page.goto(`/reset-test-data?testId=${testId}`);
});
```

### Problem: Artifacts expired, brak trace

Rozwiązanie: Wydłuż `expire_in` lub używaj external storage (S3):

```yaml
artifacts:
  expire_in: 30 days  # lub "never" dla release builds
  reports:
    junit: test-results/junit.xml
```

---

## Perspektywa Full Stack Testera

GitLab CI to nie tylko miejsce, gdzie testy "działają" — to środowisko, które definiuje, jak zespół myśli o jakości. Pipeline w GitLab CI jest contractem między kodem a release'em:

- **Szybki feedback** — smoke na MR uruchamia się w 2-3 minuty, nie w 30
- **Fail fast** — lint i types padają przed E2E, developer wie szybciej
- **Diagnostyka always** — report dostępny nawet po czerwonym jobie
- **Równoległość** — shardy przyspieszają feedback z 30 min do 8 min
- **Transparency** — MR pipeline status jest widoczny dla całego zespołu

Jako Full Stack Tester projektujesz pipeline tak, aby każdy member zespołu — developer, QA, PM — miał dostęp do informacji, którą potrzebuje. GitLab CI z Playwright to infrastructure jako kod — musi być wersjonowane, reviewowane i utrzymywane jak każdy inny kod.

---

## Podsumowanie

- **Pipeline structure** — stages pozwalają na fail-fast: verify przed E2E, smoke na MR, full regression na main/schedule.
- **Docker image** — oficjalny obraz Microsoft Playwright zawiera wszystkie dependencies. `docker:24-dind` service wymagany dla przeglądarek.
- **Artifacts with `when: always`** — raporty HTML, trace'y i JUnit publikowane nawet przy awarii. `expire_in` kontroluje retencję.
- **JUnit integration** — GitLab automatycznie wyświetla test report UI z JUnit XML. To najlepszy sposób na wizualizację wyników.
- **Parallel execution** — `parallel: matrix` lub Playwright `--shard` pozwalają skalować testy na wiele runnerów.
- **GitLab Pages** — darmowy hosting raportów HTML na branchu `gh-pages`. Linkuj z MR dla łatwego dostępu.
- **Cache** — `node_modules` cache przyspiesza instalację. `PLAYWRIGHT_BROWSERS_PATH` cache przyspiesza browser install.
- **Secrets** — maskowane i chronione zmienne w Settings → CI/CD → Variables. Nigdy nie echo secrets w logach.

---

## Linki i źródła

- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/) — pełna dokumentacja GitLab CI
- [GitLab CI/CD Pipeline Configuration Reference](https://docs.gitlab.com/ee/ci/yaml/) — pełna referencja .gitlab-ci.yml
- [GitLab CI/CD Examples — Playwright](https://docs.gitlab.com/ee/ci/examples/) — przykładowe konfiguracje CI
- [GitLab Pages Administration](https://docs.gitlab.com/ee/administration/pages/) — konfiguracja Pages
- [GitLab CI/CD Variables](https://docs.gitlab.com/ee/ci/variables/) — bezpieczne zarządzanie sekretami
- [GitLab CI/CD Cache](https://docs.gitlab.com/ee/ci/caching/) — strategia cache dla npm i dependencies
- [Microsoft Playwright Docker Image](https://mcr.microsoft.com/product/playwright/about) — oficjalny obraz Docker z Playwright
- [GitLab CI/CD DIND Service](https://docs.gitlab.com/ee/ci/docker/using_docker_build.html) — Docker-in-Docker w GitLab CI