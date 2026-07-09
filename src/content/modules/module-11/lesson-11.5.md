# Dobre praktyki i optymalizacja CI/CD

> **Perspektywa Full Stack Testera**
> Pipeline, który działa prawidłowo przez miesiąc, a potem zaczyna się zawodzić, to pipeline niedoskonały. Pipeline, który daje feedback po godzinie, jest ignorowany. Pipeline, którego zespół się boi uruchomić, jest martwy. Ta lekcja uczy, jak zbudować pipeline Playwright, który jest szybki (feedback w minutach), niezawodny (flake-resistant), ekonomiczny (optymalizuje resource usage) i bezpieczny (sekretów nie wycieka). Każda z tych cech wymaga świadomego projektowania, nie przypadku.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Projektować szybki feedback loop** — zestaw testów dobrany do typu event (PR, push, schedule)
- **Optymalizować cache** — npm, Playwright browsers, Docker layers
- **Implementować test splitting** — sharding, parallel execution, result merging
- **Budować quality gates** — automatyczne criteria release oparte o metryki
- **Zarządzać kosztami CI** — resource classes, scheduling, selective execution
- **Obsługiwać flaky tests** — detection, isolation, retry strategies
- **Zabezpieczać sekrety** — no echo, maskowanie, zakress, rotation

---

## Wprowadzenie: pipeline jako produkt

Pipeline CI/CD to nie jednorazowa konfiguracja — to produkt, który wymaga:
- **Monitoring** — ile trwa? ile kosztuje? które testy są najwolniejsze?
- **Maintenance** — aktualizacja zależności, Playwright version, agent image
- **Evolution** — nowe testy, nowe etapy, nowe kryteria jakości
- **Documentation** — kto i kiedy może uruchomić full regression? jak interpretować wyniki?

Zasada: jeśli pipeline wymaga więcej niż 15 minut na zrozumienie przez nowego członka zespołu, jest zbyt skomplikowany.

---

## Sekcja 1: Szybki feedback — test selection strategy

### Zasada piramidy testów w CI

W CI/CD testy dobierasz według ryzyka i momentu procesu. Piramida testów CI:

```
        ▲
       /│\      RELEASE GATE: Critical path (5-10 testów, <5 min)
      / │ \     → Pełna walidacja przed prod
     /  │  \
    /───┼──-\   PR/SCHEDULE: Regression (100-200 testów, 15-30 min)
   /    │    \  → Pełny functional coverage
  /     │     \
 /──────┼──────\  MAIN PUSH: Smoke (20-50 testów, 3-8 min)
 /      │       \→ Szybki feedback core flows
/───────┼────────\
        │          DEV: Unit + Component (konfigurowalne)
        │          → Developer local feedback
```

Każdy poziom ma inny cel i inny zestaw testów:

| Poziom | Kiedy | Cel | Liczba testów | Czas | Kryterium |
|--------|-------|-----|---------------|------|-----------|
| **Dev local** | Pre-commit | Szybka walidacja | 10-50 | <2 min | Pass/fail |
| **PR smoke** | Merge request | Czy zmiana nie łamie core? | 20-50 | 3-8 min | 100% core pass |
| **Main push** | Push na main | Czy build jest stabilny? | 50-100 | 10-20 min | Pass rate > 95% |
| **Scheduled** | Nightly | Czy system się nie zepsuł? | 200-500 | 30-90 min | Quality gate |
| **Release** | Pre-prod | Czy można wydać? | 10-30 (critical) | 5-10 min | Zero critical failures |

### Tag-based test selection

```typescript
// tests/smoke/checkout.spec.ts
test.describe('Checkout smoke', () => {
  test('@smoke @critical — add to cart', async ({ page }) => {
    // Test krytyczny dla smoke
  });
  
  test('@smoke — checkout flow', async ({ page }) => {
    // Test smoka dla checkout
  });
  
  test('@regression — checkout with coupon', async ({ page }) => {
    // Test regresji, nie smoka
  });
});

test.describe('Search regression', () => {
  test('@regression — filter by category', async ({ page }) => {
    // Tylko regression
  });
  
  test('@regression @slow — advanced search', async ({ page }) => {
    // Regression + slow (nie uruchamiaj na PR)
  });
});
```

```bash
# PR pipeline — tylko smoke
npx playwright test --grep @smoke --reporter=line,junit

# Schedule — smoke + regression (bez slow)
npx playwright test --grep '@smoke|@regression' --grep '@slow' --invert --reporter=line,json

# Full regression — wszystko
npx playwright test --reporter=line,html,json
```

### Smart test selection — changed files

Zaawansowana strategia: uruchamiaj tylko testy dotknięte przez zmianę w MR:

```bash
# W CI: znajdź pliki zmienione w MR
CHANGED_FILES=$(git diff --name-only origin/main...HEAD)

# Wyciągnij testy które testują zmienione pliki
AFFECTED_TESTS=$(echo "$CHANGED_FILES" | \
  xargs grep -l "from.*" | \
  sed 's|tests/||;s|\.spec\.ts||' | \
  tr '\n' ',')

# Uruchom tylko dotknięte testy (jeśli są)
if [ -n "$AFFECTED_TESTS" ]; then
  npx playwright test $AFFECTED_TESTS --reporter=line,junit
else
  echo "No affected tests found, running smoke..."
  npx playwright test --grep @smoke
fi
```

Ta strategia może zmniejszyć czas pipeline z 30 min do 3-5 min w MR z małą zmianą.

---

## Sekcja 2: Cache optimization

### Warstwy cache

Cache w CI/CD ma kilka warstw, które działają na różnych poziomach:

```
┌─────────────────────────────────┐
│  Docker Image Layer Cache       │  ← Najszybszy: cały image jest cached
│  (FROM, COPY, RUN)              │
├─────────────────────────────────┤
│  Playwright Browsers Cache      │  ← ~1GB pobierania per browser
│  ($PLAYWRIGHT_BROWSERS_PATH)    │
├─────────────────────────────────┤
│  npm modules Cache              │  ← ~200-500MB per build
│  (node_modules/)                │
├─────────────────────────────────┤
│  TypeScript Compilation Cache   │  ← tsconfig cache
│  (.tsbuildinfo)                 │
├─────────────────────────────────┤
│  Test Results Cache             │  ← dla flaky comparison
└─────────────────────────────────┘
```

### npm cache — wszystkie platformy

```bash
# Zasada: zawsze używaj package-lock.json, nigdy package.json
# npm ci — deterministyczna instalacja z lockfile
npm ci  # ~3x szybsze niż npm install
```

```yaml
# GitHub Actions
- uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      node_modules
    key: npm-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      npm-${{ runner.os }}-
```

```yaml
# GitLab CI
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - .npm
    - node_modules
  policy: pull-push
```

```yaml
# Azure DevOps
- task: Cache@2
  inputs:
    key: 'npm | $(Agent.OS) | package-lock.json'
    path: $(Agent.TempDirectory)/npm-cache
    cacheHitVar: NPM_CACHE_HIT
```

### Playwright browsers cache

```bash
# Ustaw zmienną środowiskową dla cache path
export PLAYWRIGHT_BROWSERS_PATH=/cache/playwright-browsers

# Zainstaluj browsers raz, cache się zachowa
npx playwright install --with-deps chromium
```

```yaml
# GitHub Actions — cache Playwright browsers
- name: Cache Playwright browsers
  uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ runner.os }}-${{ env.PLAYWRIGHT_VERSION }}
    restore-keys: |
      playwright-${{ runner.os }}-
```

### Docker layer caching

```dockerfile
# Dockerfile.playwright — optymalizacja warstw
FROM node:20-jammy

# COPY package files FIRST (warstwa zmienia się tylko przy package.json change)
COPY package*.json ./

# Install deps (ta warstwa jest cached dopóki package*.json się nie zmieni)
RUN npm ci && npm cache clean --force

# COPY source AFTER deps install (ta warstwa zmienia się często)
COPY . .

# Install browsers
RUN npx playwright install --with-deps chromium
```

```yaml
# GitHub Actions — Docker layer cache
- uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

---

## Sekcja 3: Test splitting — parallel execution

### Playwright built-in sharding

```bash
# Podziel testy na 4 shardy
npx playwright test --shard=1/4
npx playwright test --shard=2/4
npx playwright test --shard=3/4
npx playwright test --shard=4/4
```

```yaml
# GitHub Actions — parallel shards
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test --shard=${{ matrix.shard }}/4 --reporter=line,json
      - uses: actions/upload-artifact@v4
        with:
          name: test-results-shard-${{ matrix.shard }}
          path: test-results/
```

### Merging JUnit results

```bash
# npm install -g junit-merge
junit-merge -d test-results -o test-results/merged.xml
```

```yaml
# Merge job — po wszystkich shardach
merge-results:
  needs: [test-1, test-2, test-3, test-4]
  steps:
    - uses: actions/download-artifact@v4
      with:
        path: test-results
        pattern: test-results-shard-*
        merge-multiple: true
    - run: npm install -g junit-merge
    - run: junit-merge -d test-results -o test-results/merged.xml
    - uses: actions/upload-artifact@v4
      with:
        name: merged-results
        path: test-results/merged.xml
```

### CI total time — before vs. after

| Konfiguracja | Liczba testów | Czas pojedynczy | Czas parallel (4x) |
|-------------|---------------|-----------------|-------------------|
| **Bez sharding** | 200 | 40 min | 40 min |
| **4 shardy** | 200 (50/shard) | 10 min/shard | 10 min |
| **8 shardów** | 200 (25/shard) | 5 min/shard | 5 min |
| **4 shardy + fast-path** | 200 (50/shard) | 2 min/shard | 2 min |

Szybka estymacja: przy 4 workerach i 200 testach po 10s każdy → 2000s / 4 = 500s ≈ 8-9 min (z overhead).

### Test file distribution — even splitting

```bash
# Even distribution po plikach (nie po indywidualnych testach)
TOTAL_FILES=$(find tests -name "*.spec.ts" | wc -l)
SHARD_SIZE=$(( (TOTAL_FILES + 4 - 1) / 4 ))

for i in $(seq 1 4); do
  START=$(( (i - 1) * SHARD_SIZE + 1 ))
  END=$(( i * SHARD_SIZE ))
  sed -n "${START},${END}p" tests-files.txt > shard-${i}.txt
done

# Uruchom testy per shard file list
npx playwright test @shard-${i}.txt
```

---

## Sekcja 4: Quality gates — automation of release decisions

### Progi jakości — konfiguracja

```typescript
// quality-gates.ts
interface QualityGate {
  name: string;
  metric: string;
  threshold: number;
  comparison: 'gte' | 'lte' | 'eq';
  severity: 'block' | 'warn';
  description: string;
}

const qualityGates: QualityGate[] = [
  {
    name: 'Pass Rate Minimum',
    metric: 'passRate',
    threshold: 95,
    comparison: 'gte',
    severity: 'block',
    description: 'Minimum 95% tests must pass',
  },
  {
    name: 'Critical Tests Zero Failure',
    metric: 'criticalFailed',
    threshold: 0,
    comparison: 'eq',
    severity: 'block',
    description: 'Zero critical test failures allowed',
  },
  {
    name: 'Flaky Rate Maximum',
    metric: 'flakyRate',
    threshold: 5,
    comparison: 'lte',
    severity: 'warn',
    description: 'Max 5% flaky rate allowed',
  },
  {
    name: 'P95 Duration Maximum',
    metric: 'p95Duration',
    threshold: 30000,
    comparison: 'lte',
    severity: 'warn',
    description: 'P95 test duration should not exceed 30s',
  },
  {
    name: 'Security Tests Passed',
    metric: 'securityFailed',
    threshold: 0,
    comparison: 'eq',
    severity: 'block',
    description: 'Zero security test failures',
  },
];

export function evaluateGates(
  results: MetricsSnapshot
): { passed: boolean; violations: string[]; warnings: string[] } {
  const violations: string[] = [];
  const warnings: string[] = [];
  
  for (const gate of qualityGates) {
    const actual = getMetric(results, gate.metric);
    let passes = false;
    
    switch (gate.comparison) {
      case 'gte': passes = actual >= gate.threshold; break;
      case 'lte': passes = actual <= gate.threshold; break;
      case 'eq': passes = actual === gate.threshold; break;
    }
    
    if (!passes) {
      const message = `${gate.name}: ${actual} (required: ${gate.comparison} ${gate.threshold})`;
      if (gate.severity === 'block') {
        violations.push(message);
      } else {
        warnings.push(message);
      }
    }
  }
  
  return {
    passed: violations.length === 0,
    violations,
    warnings,
  };
}
```

### Quality gate w CI pipeline

```yaml
# .github/workflows/quality-gate.yml (example)
- name: Evaluate Quality Gate
  run: |
    node scripts/quality-gate.js
    
    # Exit code 1 = blocked
    # Exit code 0 = passed/warned
  env:
    JUNIT_PATH: test-results/junit.xml
    METRICS_PATH: test-results/metrics.json

# Conditional deployment — tylko przy passed gate
- name: Deploy to Staging
  if: always() && needs.quality-gate.outputs.passed == 'true'
  run: kubectl apply -f k8s/staging/
```

### Threshold as code — versioned gates

```yaml
# quality-gates.yml — wersjonowany w repo
version: "1.0"
gates:
  - name: standard-release
    applies_to: [main, release/*]
    criteria:
      pass_rate: 95
      critical_failures: 0
      flaky_rate: 5
      p95_duration_ms: 30000
  
  - name: fast-feedback
    applies_to: [merge_request]
    criteria:
      smoke_pass_rate: 100
      critical_failures: 0
  
  - name: nightly-exhaustive
    applies_to: [schedule]
    criteria:
      pass_rate: 90  # Niższy próg dla nocnych — pozwala na więcej eksperymentów
      flaky_rate: 10  # Higher tolerance overnight
      any_failures_logged: true
```

---

## Sekcja 5: Obsługa flaky tests

### Definicja flaky testu

Flaky test to test, który w identycznych warunkach:
- Czasem przechodzi, czasem nie (non-deterministic result)
- Potrzebuje retry żeby przejść (intermittent pass after failure)
- Ma różny czas execution (timing-dependent)

### Strategie obsługi flaky

**Poziom 1: Retry (Playwright config)**

```typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0,  // Więcej retry w CI
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
});
```

**Poziom 2: Stability waits**

```typescript
// Zamiast:
// await page.click('#submit');  // Potencjalnie flaky

// Dodaj stabilne czekanie:
await page.click('#submit');
await expect(page.locator('.loading')).not.toBeVisible();  // Poczekaj na loading

// Lub polling:
await expect(async () => {
  const count = await page.locator('.result').count();
  expect(count).toBeGreaterThan(0);
}).toPass({ timeout: 10000, intervals: [100, 200, 500] });
```

**Poziom 3: Isolate flaky tests**

```typescript
// tests/e2e/flaky-tests.spec.ts
test.describe.configure({ mode: 'serial' });  // Jeden test na raz

test('@flaky — payment gateway stress', async ({ page }) => {
  test.info().annotations.push({
    type: 'flaky',
    description: 'Known flaky: intermittent timeout on payment API. Tracking: JIRA-1234',
  });
  
  // ... test content
});
```

**Poziom 4: Exclude z CI (temporary)**

```yaml
# W CI — wyklucz flaky tests z głównego przebiegu
npx playwright test \
  --grep '@flaky' --invert  # Uruchom wszystko ZA WYJĄTKIEM flaky
  --reporter=line,junit

# Raportuj flaky osobno
npx playwright test \
  --grep '@flaky'
  --reporter=line,json
  --output-dir=test-results/flaky
```

### Flaky detection — automated

```typescript
// flaky-detector.ts — analyze results for patterns
interface FlakyAnalysis {
  testName: string;
  passCount: number;
  failCount: number;
  totalRuns: number;
  flakyRate: number;
  classification: 'stable' | 'mildly-flaky' | 'highly-flaky' | 'broken';
}

function analyzeFlakiness(results: TestResult[]): FlakyAnalysis[] {
  const grouped = groupByTest(results);
  
  return Object.entries(grouped).map(([testName, runs]) => {
    const passCount = runs.filter(r => r.status === 'passed' && r.retries === 0).length;
    const failCount = runs.filter(r => r.status === 'failed').length;
    const flakyPassCount = runs.filter(r => r.status === 'passed' && r.retries > 0).length;
    const totalRuns = runs.length;
    
    const flakyRate = totalRuns > 0 
      ? (flakyPassCount / totalRuns) * 100 
      : 0;
    
    let classification: FlakyAnalysis['classification'] = 'stable';
    if (flakyRate > 50) classification = 'broken';
    else if (flakyRate > 20) classification = 'highly-flaky';
    else if (flakyRate > 5) classification = 'mildly-flaky';
    
    return {
      testName,
      passCount,
      failCount,
      totalRuns,
      flakyRate,
      classification,
    };
  }).filter(a => a.flakyRate > 0).sort((a, b) => b.flakyRate - a.flakyRate);
}

// Automatyczne tagowanie na podstawie historii
function tagFlakyTests(analysis: FlakyAnalysis[]): string[] {
  return analysis
    .filter(a => a.classification === 'broken' || a.classification === 'highly-flaky')
    .map(a => a.testName);
}
```

---

## Sekcja 6: Optymalizacja kosztów CI

### Co kosztuje w CI

| Element | Koszt | Optymalizacja |
|---------|-------|--------------|
| **Compute minutes** | $0.01-0.05/min | Parallelization, faster tests |
| **Artifact storage** | $0.01-0.05/GB | Compression, retention policy |
| **Browser cloud** | $0.05-0.50/test | Local execution vs. cloud |
| **Network egress** | $0.01-0.09/GB | Minimize artifact uploads |
| **Private runners** | infrastructure cost | Right-size, scale down |

### Cost optimization strategies

**1. Eliminate wasted compute**

```yaml
# Uruchamiaj full regression tylko na schedule i manual
# Nie na każdym push
playwright:regression:
  rules:
    - if: $CI_COMMIT_BRANCH == 'main'
      when: manual  # Nie automatycznie!
    - if: $CI_PIPELINE_SOURCE == 'schedule'
```

**2. Fast-fail na tanich etapach**

```yaml
stages:
  - verify      # 1-2 min, tani
  - e2e-smoke   # 5-10 min, kosztuje
  - e2e-full    # 30-60 min, najdroższy
```

Jeśli `verify` failed → nie uruchamiaj `e2e-smoke` i `e2e-full`.

**3. Selective browser matrix**

```yaml
# Na PR — tylko Chromium (najpopularniejszy)
# Na main — Chromium + Firefox  
# Na schedule — wszystkie

strategy:
  matrix:
    browser:
      - ${{ contains(variables['CI_COMMIT_BRANCH'], 'main') && 'chromium,firefox' || 'chromium' }}
```

**4. Artifact retention**

```yaml
artifacts:
  expire_in: 7 days  # Nie 30 dni dla wszystkich!
  
  # Dla release — dłuższy retention
  release-artifacts:
    expire_in: 90 days
```

### Monitoring pipeline costs

```typescript
// pipeline-cost-tracker.ts
interface PipelineCost {
  jobName: string;
  durationMinutes: number;
  resourceClass: string;
  costEstimate: number;  // USD
}

function estimatePipelineCost(jobs: PipelineCost[]): number {
  const ratePerMinute = 0.02;  // Średni koszt za minutę compute
  
  return jobs.reduce((total, job) => {
    return total + (job.durationMinutes * ratePerMinute);
  }, 0);
}

// Report do zespołu
function reportCostBreakdown(jobs: PipelineCost[], buildId: string) {
  const total = estimatePipelineCost(jobs);
  const byJob = jobs
    .sort((a, b) => b.costEstimate - a.costEstimate)
    .map(j => `  ${j.jobName}: ${j.costEstimate.toFixed(4)} USD (${j.durationMinutes}min)`)
    .join('\n');
  
  console.log(`
Pipeline Cost Report — Build #${buildId}
Total: $${total.toFixed(4)}
${byJob}
  `.trim());
}
```

---

## Sekcja 7: Bezpieczeństwo w CI/CD

### Zasada: secrets nie są widoczne w logach

```bash
# NIE RÓB TEGO — sekret pojawi się w logach:
echo $SECRET_API_KEY

# ZRÓB TO — partial masking:
echo "Using token: ${SECRET_API_KEY:0:4}****"

# Lub pipeline-specific masking:
# GitHub Actions: zmienna z prefixem SECRET_ jest automatycznie maskowana
# GitLab CI: zmienna z typem "masked" jest automatycznie maskowana
# Azure DevOps: zmienna z "Keep this value secret" jest maskowana
```

### Scope secrets — least privilege

```yaml
# NIE dawaj wszystkim jobom wszystkich sekretów
# Używaj zakresd environment variables

# Job 1: tylko staging secrets
deploy:staging:
  environment:
    name: staging
  variables:
    ENV: staging
    DB_PASSWORD: $(staging-db-password)
    API_KEY: $(staging-api-key)
  # staging-db-password nie jest dostępne w innych jobach!

# Job 2: tylko production secrets
deploy:production:
  environment:
    name: production
  variables:
    ENV: production
    DB_PASSWORD: $(prod-db-password)
  # prod-db-password nie jest dostępne w jobach staging
```

### Rotacja sekretów

```typescript
// Automatyczna rotacja — Azure Key Vault / AWS Secrets Manager
// W CI: używaj short-lived credentials

// Azure DevOps — Service Connection z automatic rotation
- task: AzureKeyVault@2
  inputs:
    azureSubscription: 'AzureServiceConnection'
    KeyVaultName: 'my-keyvault'
    SecretsFilter: '*'
    RunAsPreJob: true
```

### Ochrona artefaktów

```yaml
# Artifacts mogą zawierać sensitive data
# Ustaw expiration i access control

artifacts:
  expire_in: 7 days  # Automatyczne usunięcie po tygodniu
  paths:
    - playwright-report/
    # Nie publikuj: credentials.json, .env files, private keys
```

---

## Sekcja 8: Monitoring i observability pipeline

### Pipeline metrics

```typescript
// pipeline-metrics.ts
interface PipelineMetrics {
  buildId: string;
  duration: number;
  stages: Array<{
    name: string;
    duration: number;
    status: 'passed' | 'failed' | 'skipped';
  }>;
  tests: {
    total: number;
    passed: number;
    failed: number;
    flaky: number;
    skipped: number;
  };
  cost: number;
}

function collectPipelineMetrics(): PipelineMetrics {
  return {
    buildId: process.env.BUILD_ID ?? 'unknown',
    duration: measureDuration(),
    stages: extractStageMetrics(),
    tests: parseTestResults(),
    cost: estimateCost(),
  };
}
```

### Dashboard metryk pipeline

```sql
-- Grafana SQL — pipeline performance over time
SELECT 
  date_trunc('day', timestamp) as day,
  avg(duration_seconds) as avg_duration,
  percentile(95, duration_seconds) as p95_duration,
  count(*) as total_runs,
  sum(case when status = 'failed' then 1 else 0 end) as failed_runs
FROM pipeline_builds
WHERE $__timeFilter(timestamp)
GROUP BY day
ORDER BY day
```

### Alerting na pipeline anomalies

```yaml
# Alert na długotrwały pipeline
- alert: PipelineDurationExceeded
  expr: avg(pipeline_duration_minutes) > 30
  for: 15m
  labels:
    severity: warning
  annotations:
    summary: "Pipeline trwa ponad 30 minut"
    description: "Średni czas pipeline w ostatnich 15 min przekroczył 30 min. Sprawdź najwolniejsze testy."

# Alert na wysoki flaky rate
- alert: HighFlakyRate
  expr: avg(flaky_rate_percent) > 10
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Flaky rate powyżej 10%"
    description: "Ponad 10% testów jest flaky. Zespół QA powinien zbadać przyczyny."
```

---

## Perspektywa Full Stack Testera

Jako Full Stack Tester zarządzający pipeline'em CI/CD myśl kategoriami:

**Szybkość** — feedback w 5 minut to lepsze niż w 30. Ale szybkość nie może kosztować jakości. Dobierz testy do event type.

**Niezawodność** — pipeline, który daje fałszywe alarmy (flaky), jest ignorowany. Investuj w stabilność testów.

**Koszt** — każda minuta CI kosztuje. Optymalizuj tam, gdzie ROI jest najwyższy: parallel execution, caching, selective test execution.

**Bezpieczeństwo** — secrets w CI to realne ryzyko. Traktuj pipeline security tak samo poważnie jak application security.

**Monitoring** — jeśli nie mierzysz pipeline performance, nie możesz go poprawić. Build time, cost, flaky rate — wszystko mierz i wizualizuj.

Pipeline jest living system — wymaga regularnego review, refactoring i evolutionary improvement. Tak samo jak kod produkcyjny.

---

## Podsumowanie

- **Test selection** — różne eventy (PR, main, schedule, release) uruchamiają różne zestawy testów. Piramida testów CI odzwierciedla ryzyko.
- **Cache** — warstwowe cache (Docker, Playwright browsers, npm, TypeScript) może zmniejszyć czas buildu o 50-80%.
- **Parallel execution** — sharding testów na 4-8 workerów zmniejsza czas pipeline z 40 min do 5-10 min.
- **Quality gates** — automatyczne kryteria release oparte o pass rate, flaky rate, critical failures. Gates jako kod.
- **Flaky management** — strategia wielopoziomowa: retry config, stability waits, isolation, exclusion, detection.
- **Cost optimization** — fast-fail, selective matrix, retention policies, resource right-sizing.
- **Security** — maskowanie sekretów, least privilege zakress, short-lived credentials, artifact expiration.
- **Observability** — metryki pipeline (duration, cost, flaky rate), dashboardy, alerting na anomalie.

---

## Linki i źródła

- [Playwright CI Best Practices](https://playwright.dev/docs/ci-best-practices/) — oficjalne rekomendacje Microsoft
- [GitHub Actions Cache](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows) — cache optimization
- [Grafana Alerting](https://grafana.com/docs/grafana/latest/alerting/) — alerting na pipeline metrics
- [Flaky Test Management — Google](https://testing.googleblog.com/2020/12/test-selectors-for-flaky-tests.html) — podejście Googla do flaky management
- [CI/CD Security Best Practices — Snyk](https://snyk.io/blog/securing-ci-cd-pipeline/) — bezpieczeństwo pipeline CI/CD
- [CircleCI Resource Classes](https://circleci.com/docs/configuration-reference/#resourceclass) — sizing compute resources
- [Docker Layer Caching — GitHub Actions](https://github.com/marketplace/actions/docker-build-push-action) — DLC dla Docker images
- [JUnit Merge Tool](https://www.npmjs.com/package/junit-merge) — merging parallel test results