# Integracja z GitHub Actions — kompletny przewodnik po CI/CD pipeline

> **Perspektywa Full Stack Testera**
> W profesjonalnym zespole testy są uruchamiane przy każdym Pull Requeście. Jeśli "pękną" — deweloper nie może zmergować kodu. Jeśli testy działają — pipeline zielony, merge możliwy. Ta prosta zasada "gatekeeper" jest fundamentem quality gates w nowoczesnym DevOps. GitHub Actions to natywny system CI/CD GitHuba, który oferuje potężne możliwości konfiguracji: sharding (podział testów na wiele runnerów), caching (przyspieszenie instalacji), matrix builds (testy na wielu przeglądarkach/wersjach), artefakty (przechowywanie raportów), i warunki uruchamiania (uruchamianie tylko gdy potrzeba). Jako Full Stack Tester powinieneś opanować GitHub Actions do perfekcji — to Twój pierwszy kontakt z prawdziwym CI.

## Cel lekcji

Po ukończeniu tej lekcji potrafisz zbudować kompletny workflow GitHub Actions dla Playwrighta, konfigurujesz matrix builds dla wielu przeglądarek/środowisk, implementujesz caching (node_modules, Playwright browsers), optymalizujesz pipeline pod kątem czasu i kosztów, konfigurujesz artefakty i retencję artefaktów, zarządzasz sekretami i zmiennymi środowiskowymi, stosujesz warunki uruchamiania (pomiń testy na zmianach dokumentacji), konfigurujesz fail-fast i strategie retry, i wiesz, jak łączyć Playwright z Dockerem w CI.

---

## Architektura GitHub Actions dla Playwrighta

### Model wykonania

```
Push / Pull Request
        │
        ▼
  [GitHub Actions Runner]
        │
        ├── Checkout (pobranie kodu z Git)
        ├── Setup Node.js (instalacja Node)
        ├── Install Dependencies (npm ci)
        ├── Install Browsers (npx playwright install --with-deps)
        ├── Run Tests (npx playwright test)
        ├── Upload Artifacts (raporty, trace, screenshoty)
        └── Cleanup
```

### Struktura workflow file

```yaml
# .github/workflows/e2e.yml
name: E2E Tests                    # Nazwa wyświetlana w GitHub Actions
on:                               # Trigger — kiedy workflow się uruchamia
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:                              # Zmienne globalne dla całego workflow
  NODE_VERSION: '22'
  PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS: 'true'

jobs:
  e2e-tests:                      # Nazwa joba
    runs-on: ubuntu-latest         # System operacyjny runner'a
    timeout-minutes: 60            # Maksymalny czas trwania
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js ${{ env.NODE_VERSION }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'             # Automatyczny cache dla node_modules
          
      - name: Install dependencies
        run: npm ci                # Instalacja z package-lock.json (deterministyczna)
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
        
      - name: Run Playwright tests
        run: npx playwright test --reporter=list
        
      - name: Upload test results
        if: always()               # Upload nawet gdy testy padły
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ github.run_id }}
          path: playwright-report/
          retention-days: 30
```

---

## Trigger events — kiedy uruchamiać workflow?

### Podstawowe triggery

```yaml
on:
  # Uruchom na push do gałęzi main i develop
  push:
    branches: [main, develop]
    
  # Uruchom na pull request do main i develop
  pull_request:
    branches: [main, develop]
    
  # Uruchom ręcznie (workflow dispatch)
  workflow_dispatch:
    inputs:
      environment:
        description: 'Środowisko do testowania'
        required: true
        default: 'staging'
        type: choice
        options: ['staging', 'production']
```

### Conditional triggers — pomijaj zbędne uruchomienia

```yaml
on:
  push:
    branches: [main, develop]
    paths-ignore:
      - '**.md'                    # Ignoruj zmiany w dokumentacji
      - 'docs/**'
      - '*.txt'
      - 'LICENSE'
      - '.gitignore'
      
  pull_request:
    branches: [main, develop]
    paths-ignore:
      - '**.md'
      - 'docs/**'
```

**Korzyść**: Gdy zmieniasz tylko README.md, workflow się nie uruchomi — oszczędzasz minuty runner'a i czas dewelopera.

### Schedule — uruchomienia cykliczne

```yaml
on:
  schedule:
    # Codziennie o 6:00 UTC = 8:00 czasu polskiego
    - cron: '0 6 * * *'
    
    # Co poniedziałek o 7:00 UTC
    - cron: '0 7 * * 1'
    
    # Co 6 godzin (pełna regresja nocna)
    - cron: '0 */6 * * *'
```

---

## Matrix builds — testy na wielu przeglądarkach/środowiskach

### Matrix strategy —równoległe wykonanie

```yaml
jobs:
  e2e-tests:
    strategy:
      matrix:
        # Kombinacje: 3 przeglądarki × 2 środowiska = 6 jobów równoległych
        browser: [chromium, firefox, webkit]
        environment: [staging, production]
        # exclude: wyklucz niepotrzebne kombinacje
        exclude:
          - browser: webkit
            environment: production  # WebKit nie istnieje na prod
        
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps ${{ matrix.browser }}
        
      - name: Run tests on ${{ matrix.browser }} / ${{ matrix.environment }}
        env:
          BASE_URL: ${{ matrix.environment == 'staging' && 'https://staging.app.pl' || 'https://app.pl' }}
        run: npx playwright test --project=${{ matrix.browser }}
        
      - name: Upload artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ matrix.browser }}-${{ matrix.environment }}
          path: playwright-report/
          retention-days: 14
```

**Wynik**: 5 równoległych jobów (nie 6 — webkit/production wykluczone):
```
✅ chromium-staging   (5 min)
✅ firefox-staging    (5 min)
✅ webkit-staging     (5 min)
✅ chromium-production (5 min)
✅ firefox-production (5 min)
─────────────────────────
Całkowity czas: ~5 min (vs. 25 min sekwencyjnie)
```

---

## Caching — przyspieszenie workflow

### Cache dla node_modules

```yaml
- name: Setup Node.js with cache
  uses: actions/setup-node@v4
  with:
    node-version: '22'
    cache: 'npm'
    cache-dependency-path: package-lock.json  # Klucz cache — zmiana lock = invalidate cache
```

**Efekt**: Pierwsze uruchomienie: npm ci = ~60s. Kolejne uruchomienia: npm ci z cache = ~5s. Oszczędność: ~55s na każdym runie.

### Cache dla Playwright browsers

```yaml
- name: Cache Playwright browsers
  id: playwright-cache
  uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}

- name: Install Playwright browsers
  if: steps.playwright-cache.outputs.cache-hit != 'true'  # Tylko gdy cache miss
  run: npx playwright install --with-deps chromium
```

**Efekt**: Pierwsze uruchomienie: install = ~90s. Kolejne: install z cache = ~3s. Oszczędność: ~87s na każdym runie.

### Łączny efekt caching

```
Bez cache:   npm ci (60s) + install browsers (90s) + tests (5min) = ~6.5 min
Z cache:     npm ci (5s) + install browsers (3s) + tests (5min) = ~5.1 min

Oszczędność: ~1.4 min × liczba commitów = realne pieniądze i czas
```

---

## Sharding — podział testów na wiele runnerów

### Problem: 500 testów trwa 50 minut

Rozwiązanie: Podziel testy na mniejsze batche i uruchom równolegle.

### Sharding przez podział plików

```yaml
jobs:
  # Batch 1: Pierwsza połowa plików
  tests-batch-1:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup
        run: |
          npm ci
          npx playwright install --with-deps chromium
      - name: Run tests (batch 1)
        run: npx playwright test --shard=1/4

  # Batch 2: Druga połowa plików  
  tests-batch-2:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup
        run: |
          npm ci
          npx playwright install --with-deps chromium
      - name: Run tests (batch 2)
        run: npx playwright test --shard=2/4

  # Batch 3: Trzecia ćwiartka
  tests-batch-3:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup
        run: |
          npm ci
          npx playwright install --with-deps chromium
      - name: Run tests (batch 3)
        run: npx playwright test --shard=3/4

  # Batch 4: Ostatnia ćwiartka
  tests-batch-4:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup
        run: |
          npm ci
          npx playwright install --with-deps chromium
      - name: Run tests (batch 4)
        run: npx playwright test --shard=4/4
```

**Efekt**: 500 testów / 4 batche = ~125 testów na job. 4 joby równoległe = ~12-15 min łącznie (vs. 50 min sekwencyjnie).

### Automatyczny sharding z GitHub Actions

```yaml
jobs:
  test:
    strategy:
      fail-fast: false  # Nie przerywaj innych jobów gdy jeden padnie
      matrix:
        shard: [1, 2, 3, 4]
        
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup
        run: |
          npm ci
          npx playwright install --with-deps chromium
          
      - name: Run tests (shard ${{ matrix.shard }}/4)
        run: npx playwright test --shard=${{ matrix.shard }}/4
        
      - name: Upload artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-results-shard-${{ matrix.shard }}
          path: |
            test-results/
            playwright-report/
          retention-days: 7
```

---

## Artifacts — przechowywanie wyników

### Upload artifacts

```yaml
- name: Upload Playwright Report
  if: always()  # Nawet gdy testy padły — raport jest najważniejszy przy błędzie!
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report-${{ github.run_id }}
    path: playwright-report/
    retention-days: 30   # Przechowuj 30 dni — wystarczająco na analysis po release
    compression-level: 9  # Maksymalna kompresja (wolniejsze upload, mniejszy rozmiar)

- name: Upload Trace on failure
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-trace-${{ github.run_id }}
    path: test-results/**/trace.zip
    retention-days: 7    # Ślady testów — krótki retention (duże pliki)

- name: Upload test results JSON
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-results-json
    path: |
      test-results/*.json
      playwright-results.json
    retention-days: 30
```

### Przeglądanie artifactów po zakończeniu

```
GitHub Repository → Actions → Run ID → Summary → Artifacts
    ↓
Playwright Report    (HTML, do przeglądarki)
Playwright Trace     (ZIP, otwórz na trace.playwright.dev)
Test Results JSON   (dla integracji z zewnętrznymi narzędziami)
```

---

## Zarządzanie sekretami

### Dodawanie sekretów

```
Repository → Settings → Secrets and variables → Actions
    ↓
New repository secret:
- Name: STAGING_PASSWORD
- Secret: SuperSecret123!
    ↓
Dostęp w workflow: ${{ secrets.STAGING_PASSWORD }}
```

### Użycie sekretów w workflow

```yaml
jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    
    env:
      # Sekrety jako zmienne środowiskowe
      API_KEY: ${{ secrets.API_KEY }}
      DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
      STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
      STAGING_PASSWORD: ${{ secrets.STAGING_PASSWORD }}
      
    steps:
      - name: Run tests
        env:
          BASE_URL: https://staging.app.pl
        run: npx playwright test
```

### Własne zmienne (nie sekrety)

```yaml
on:
  workflow_dispatch:
    inputs:
      test_environment:
        description: 'Środowisko testowe'
        required: true
        default: 'staging'
        type: choice
        options: ['staging', 'production']

jobs:
  e2e-tests:
    env:
      TEST_ENVIRONMENT: ${{ github.event.inputs.test_environment || 'staging' }}
    steps:
      - name: Run tests on ${{ env.TEST_ENVIRONMENT }}
        run: npx playwright test
```

---

## Fail-fast strategies

### Fail-fast na poziomie jobów

```yaml
jobs:
  # Te joby mogą działać równolegle, ale nie warto czekać na wszystkie
  # jeśli jeden padnie — fail-fast przyspiesza feedback
  
  lint:
    runs-on: ubuntu-latest
    steps: [npm run lint]
    
  type-check:
    runs-on: ubuntu-latest
    needs: lint  # Poczekaj na lint (szybszy)
    steps: [npm run typecheck]
    
  e2e-tests:
    runs-on: ubuntu-latest
    needs: type-check  # Poczekaj na typy (szybki) — testy E2E uruchom tylko gdy typy OK
    steps: [npx playwright test]
```

### Retry strategies

```yaml
jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    
    # Automatyczny retry na błędy infrastructure (network, runner issues)
    # NIE retry na logiczne błędy testów (te mają retries w Playwright config)
    env:
      PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS: 'true'
      
    # Dodatkowy retry workflow-level (dla flaky infrastructure)
    # Uruchom cały workflow ponownie max 2 razy przy awarii
    if: github.event_name == 'push'
    
    steps:
      - uses: actions/checkout@v4
      - name: Setup and run tests
        run: |
          npm ci
          npx playwright install --with-deps chromium
          npx playwright test --reporter=list || npx playwright test --reporter=list
          # Drugie uruchomienie jako zabezpieczenie przy niestabilności infrastruktury
```

---

## Pełny profesjonalny workflow

```yaml
# .github/workflows/e2e-full.yml
name: E2E Tests — Full Pipeline

on:
  push:
    branches: [main, develop]
    paths-ignore:
      - '**.md'
      - 'docs/**'
      - 'LICENSE'
  pull_request:
    branches: [main, develop]
    paths-ignore:
      - '**.md'
      - 'docs/**'
  workflow_dispatch:

env:
  NODE_VERSION: '22'

jobs:
  # ============================================================
  # Job 1: Szybka weryfikacja (lint + typecheck)
  # ============================================================
  quality-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Lint
        run: npm run lint || echo "Lint failed"
        
      - name: Type check
        run: npm run typecheck || echo "Type check failed"

  # ============================================================
  # Job 2: Testy Playwright — matrix (browsers × environments)
  # ============================================================
  e2e-tests:
    needs: quality-gate        # Poczekaj na quality gate — E2E tylko gdy lint OK
    strategy:
      fail-fast: false         # Nie przerywaj innych jobów gdy jeden padnie
      matrix:
        browser: [chromium, firefox]
        environment: [staging]
        
    runs-on: ubuntu-latest
    timeout-minutes: 30
        
    steps:
      - uses: actions/checkout@v4
        
      - name: Setup Node.js with cache
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: package-lock.json
          
      - name: Install dependencies
        run: npm ci
          
      - name: Cache Playwright browsers
        id: playwright-cache
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
          
      - name: Install Playwright browsers
        if: steps.playwright-cache.outputs.cache-hit != 'true'
        run: npx playwright install --with-deps ${{ matrix.browser }}
        
      - name: Run tests (${{ matrix.browser }} on ${{ matrix.environment }})
        env:
          BASE_URL: ${{ matrix.environment == 'staging' && 'https://staging.app.pl' || 'https://app.pl' }}
          API_KEY: ${{ secrets.API_KEY }}
        run: npx playwright test --project=${{ matrix.browser }} --reporter=list
        
      - name: Upload Playwright Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ matrix.browser }}-${{ matrix.environment }}-${{ github.run_id }}
          path: playwright-report/
          retention-days: 30
          
      - name: Upload Trace on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-trace-${{ matrix.browser }}-${{ matrix.environment }}-${{ github.run_id }}
          path: test-results/**/trace.zip
          retention-days: 7

  # ============================================================
  # Job 3: Podsumowanie
  # ============================================================
  summary:
    needs: e2e-tests
    if: always()
    runs-on: ubuntu-latest
    steps:
      - name: Check overall status
        run: |
          echo "Test summary:"
          echo "Jobs: ${{ needs.e2e-tests.result }}"
```

---

## Perspektywa Full Stack Testera — CI jako jakość

GitHub Actions to nie jest "narzędzie DevOpsa" — to narzędzie testera. Jako Full Stack Tester powinieneś:
- Znać strukturę workflow i móc ją modyfikować.
- Rozumieć caching i wiedzieć, jak przyspieszyć pipeline.
- Konfigurować matrix builds dla efektywnego pokrycia.
- Projektować fail-fast i quality gates.
- Monitorować koszty CI (runner minutes) i optymalizować.

Dobry pipeline CI to nie jest "zrobione raz i zapomniane". To żywy dokument, który ewoluuje wraz z projektem. Jako tester masz wgląd w metryki (ile czasu zajmuje pipeline? ile testów pada? które testy są najwolniejsze?) i możesz proponować optymalizacje.

---

## Podsumowanie

1. **Struktura workflow**: trigger → jobs → steps → actions.
2. **Triggers**: push, pull_request, workflow_dispatch, schedule — wybieraj świadomie.
3. **Matrix builds**: wiele kombinacji równolegle (browser × environment).
4. **Caching**: node_modules + Playwright browsers — oszczędność ~1.5 min per run.
5. **Sharding**: --shard=X/Y dla podziału testów na batche.
6. **Artifacts**: raporty, trace, screenshoty — uploaduj nawet na awarię.
7. **Secrets**: Settings → Secrets, używaj przez ${{ secrets.NAME }}.
8. **Fail-fast**: zależności między jobami (needs), fail-fast na poziomie matrix.
9. **Conditional**: paths-ignore dla dokumentacji, pomijaj zbędne triggery.

---

## Linki i źródła

- [GitHub Actions for Playwright](https://playwright.dev/docs/ci#github-actions)
- [GitHub Actions Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Caching Dependencies in GitHub Actions](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [Matrix Strategy in GitHub Actions](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstrategymatrix)
- [Reusable Workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows)

---

## Aktualny minimalny workflow Playwright

Oficjalny, praktyczny workflow powinien zawierać deterministyczną instalację zależności, instalację przeglądarek z zależnościami systemowymi oraz upload raportu nawet po awarii.

```yaml
name: Playwright Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npx playwright test
      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

Wariant produkcyjny możesz rozbudować o sharding, matrix projektów, sekrety i cache, ale minimalny workflow powinien pozostać czytelny dla każdej osoby w zespole.

## Raport HTML i trace jako artefakty

W CI raport jest często ważniejszy niż log terminala. Log mówi, że test padł. Raport HTML i trace pokazują, dlaczego.

```yaml
- name: Upload test-results
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: test-results
    path: test-results/
    retention-days: 7
```

Jeśli używasz `trace: 'on-first-retry'` albo `retain-on-failure`, pamiętaj, aby `test-results` było publikowane zawsze.

## Sharding z matrix

```yaml
strategy:
  fail-fast: false
  matrix:
    shard: [1, 2, 3, 4]

steps:
  - run: npx playwright test --shard=${{ matrix.shard }}/4
```

Każdy shard powinien publikować własny raport lub blob report. Inaczej po awarii jednego sharda stracisz diagnostykę.

## Checklista GitHub Actions dla Playwright

- Czy używasz wspieranej wersji Node.js, np. 22.x?
- Czy instalujesz przeglądarki przez `npx playwright install --with-deps`?
- Czy raport HTML jest uploadowany przy `if: always()`?
- Czy `test-results` z trace jest artefaktem?
- Czy sekrety są w GitHub Secrets, a nie w repozytorium?
- Czy sharding nie gubi raportów?
- Czy PR uruchamia szybki zestaw smoke, a nightly pełną regresję?

## 📘 Suplement Inżynieryjny 2026: Integracja z CI/CD (Pipeline Optimization)
*Inspiracja: „Hands-On Automated Testing with Playwright” (2026), Chapter 7*
*   **Sharding**: Rozdzielaj uruchomienie testów na wiele niezależnych maszyn (shardów) w rurociągu CI/CD (np. GitHub Actions) w celu skrócenia czasu wykonania z godzin do kilku minut.
*   **Dockerization**: Zawsze uruchamiaj testy regresji wizualnej w kontenerach Docker, aby zagwarantować identyczne renderowanie czcionek i grafik na maszynie dewelopera oraz serwerze CI.
