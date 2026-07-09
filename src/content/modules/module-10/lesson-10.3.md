# Analityka testów i metryki

> **Perspektywa Full Stack Testera**
> Metryki bez kontekstu historycznego to jak zdjęcie bez daty — wygląda ładnie, ale nic nie mówi. Gdy pakiet testów rośnie z 20 do 600, pojedynczy przebieg przestaje wystarczać. Potrzebujesz systemu, który nie tylko pokazuje "czy przeszło", ale analizuje "dlaczego nie przechodzi, jak często i od kiedy". Ta lekcja uczy, jak budować analitykę testów, która zamienia liczby w decyzje — i dlaczego trend jest ważniejszy niż chwilowy wynik.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Zbierać i klasyfikować metryki testowe** — pass rate, flaky rate, p95/p99 duration, odsetek ponowień
- **Interpretować metryki w kontekście historycznym** — pojedynczy wynik vs. trend tygodniowy/miesięczny
- **Projektować dashboard w Grafanie** z podziałem na moduł, projekt, środowisko i właściciela
- **Rozpoznawać anomalia w danych** — nagły wzrost flaky rate, wydłużenie czasu testów, spadek pass rate
- **Powiązać metryki z decyzjami jakościowymi** — quality gates, stop criteria, release recommendations

---

## Wprowadzenie: dlaczego metryki jakościowe mają sens dopiero w trendzie

Załóżmy, że dziś masz 95% pass rate w suite regresyjnym. Czy to dobry wynik? Odpowiedź brzmi: to zależy. Wczoraj było 98%. W ostatni poniedziałek — 94%. Trzy tygodnie temu — 87%. Średnia z ostatnich 30 dni — 93.2%. Trend jest spadkowy od dwóch tygodni.

Metryka bez kontekstu to szum. Profesjonalne podejście do analityki testów opiera się na trzech filarach:

1. **Historyczność** — każda metryka jest punkttem na wykresie, nie pojedynczą liczbą. Trend tygodniowy mówi więcej niż najnowszy wynik.

2. **Wymiarowość** — metryki muszą być filtrowane i agregowane na wielu poziomach: moduł, projekt, przeglądarka, środowisko, właściciel, branch.

3. **Akcja** — metryka, która nie prowadzi do działania, jest tylko biurokracją. Każda metryka powinna mieć zdefiniowany próg, przy którym zespół reaguje.

---

## Sekcja 1: Fundamentalne metryki jakościowe

### Pass Rate — procent testów, które przeszły

Pass rate to najczęściej używana metryka, ale też najbardziej myląca bez kontekstu:

```
Pass Rate = (passed / total) * 100
```

Problem: pass rate nie rozróżnia między:
- **Czystym passed** — test przeszedł za pierwszym razem
- **Flaky passed** — test przeszedł po retry, co oznacza niestabilność

```typescript
interface PassRateResult {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number;
  cleanPassRate: number;  // passed bez retry
  flakyRate: number;      // passed z retry
}

// Obliczanie z wyników testów
function calculatePassRate(results: TestResult[]): PassRateResult {
  const total = results.length;
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const cleanPassed = results.filter(r => r.status === 'passed' && r.retries === 0).length;
  const flakyPassed = results.filter(r => r.status === 'passed' && r.retries > 0).length;
  
  return {
    total,
    passed,
    failed,
    skipped,
    passRate: (passed / total) * 100,
    cleanPassRate: (cleanPassed / total) * 100,
    flakyRate: (flakyPassed / total) * 100,
  };
}
```

Dla zespołu deweloperskiego liczy się głównie **clean pass rate** — odsetek testów przechodzących za pierwszym razem. To metryka zaufania do suite'u.

Dla managera release'u liczy się **total pass rate** — bo każdy failed test to potencjalne ryzyko w produkcji.

### Flaky Rate — wskaźnik niestabilności

Flaky test to test, który w identycznych warunkach czasem przechodzi, czasem nie. To jedna z najniebezpieczniejszych metryk, bo:

- Obniża zaufanie do całego suite'u
- Wydłuża czas pipeline'u (retry consumes time)
- Tworzy fałszywy obraz jakości (passed =/= stable)
- Powoduje "boy who cried wolf" — zespół ignoruje failures

```
Flaky Rate = (flaky_tests / total_tests) * 100
```

gdzie `flaky_tests` to testy, które przeszły po retry (status: passed, retries > 0).

```typescript
interface FlakyAnalysis {
  flakyTests: Array<{
    testId: string;
    title: string;
    flakyCount: number;      // ile razy był flaky w historii
    lastFlakyDate: string;
    avgRetries: number;
    category: 'intermittent' | 'race_condition' | 'async_timing' | 'environmental';
  }>;
  overallFlakyRate: number;
  flakyByModule: Record<string, number>;
  flakyByProject: Record<string, number>;
}

function analyzeFlakiness(
  currentResults: TestResult[],
  historicalData: TestResult[]
): FlakyAnalysis {
  // Test jest flaky, jeśli przeszedł po retry
  const flakyTests = currentResults
    .filter(r => r.status === 'passed' && r.retries > 0)
    .map(r => ({
      testId: r.test.id,
      title: r.test.title,
      flakyCount: 1, // na razie liczba w bieżącym przebiegu
      lastFlakyDate: new Date().toISOString(),
      avgRetries: r.retries,
      category: categorizeFlaky(r),
    }));
  
  // Filtrowanie po historycznych danych — ile razy był flaky
  const testFlakyHistory = new Map<string, number>();
  for (const r of historicalData) {
    if (r.status === 'passed' && r.retries > 0) {
      const count = testFlakyHistory.get(r.test.id) ?? 0;
      testFlakyHistory.set(r.test.id, count + 1);
    }
  }
  
  // Aktualizacja flaky count z historii
  for (const test of flakyTests) {
    const historyCount = testFlakyHistory.get(test.testId) ?? 0;
    test.flakyCount = historyCount + 1;
  }
  
  return {
    flakyTests,
    overallFlakyRate: (flakyTests.length / currentResults.length) * 100,
    flakyByModule: groupByModule(flakyTests),
    flakyByProject: groupByProject(flakyTests),
  };
}

function categorizeFlaky(result: TestResult): FlakyAnalysis['flakyTests'][0]['category'] {
  const errorMessage = result.error?.message ?? '';
  
  if (errorMessage.includes('timeout') || errorMessage.includes('TimeoutError')) {
    return 'async_timing';
  }
  if (errorMessage.includes('Cannot locate') || errorMessage.includes('not visible')) {
    return 'race_condition';
  }
  if (errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
    return 'environmental';
  }
  
  return 'intermittent';
}
```

Klasyfikacja flaky testów pozwala podejmować różne działania:
- **intermittent** — zespół musi zidentyfikować przyczynę (często timing lub external dependency)
- **race_condition** — test wymaga lepszej synchronizacji (waitFor, expect with polling)
- **async_timing** — zwiększyć timeout'y lub dodać stability waits
- **environmental** — naprawić środowisko lub izolować test od external dependencies

### Percentyle czasu trwania — P50, P90, P95, P99

Średni czas trwania testu jest bezużyteczny przy skewed distribution. Jeśli większość testów trwa 500ms, ale jeden trwa 45 sekund (timeout na API), średnia nie pokaże problemu.

Percentyle rozwiązują ten problem:

```
P95 = wartość, poniżej której mieści się 95% obserwacji
```

```typescript
interface DurationMetrics {
  avg: number;
  median: number;    // P50
  p90: number;
  p95: number;
  p99: number;
  max: number;
  slowestTests: Array<{ title: string; duration: number; project: string }>;
}

function calculateDurationMetrics(results: TestResult[]): DurationMetrics {
  const durations = results
    .map(r => r.duration)
    .sort((a, b) => a - b);
  
  const calculatePercentile = (arr: number[], p: number): number => {
    const index = Math.ceil((p / 100) * arr.length) - 1;
    return arr[Math.max(0, index)];
  };
  
  const slowestTests = results
    .map(r => ({ title: r.test.title, duration: r.duration, project: r.test.project().name }))
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10);
  
  return {
    avg: durations.reduce((a, b) => a + b, 0) / durations.length,
    median: calculatePercentile(durations, 50),
    p90: calculatePercentile(durations, 90),
    p95: calculatePercentile(durations, 95),
    p99: calculatePercentile(durations, 99),
    max: durations[durations.length - 1],
    slowestTests,
  };
}
```

Praktyczne znaczenie percentyli:
- **P50 (median)** — typowy czas testu, niezależny od outlierów
- **P90** — 90% testów kończy się w tym czasie; dobry do szacowania pipeline budget
- **P95** — standard QA dla SLA; używany w quality gates
- **P99** — pokazuje outliery; testy trwające dłużej niż P99 wymagają analizy

### Przykład kalkulatora metryk w Playwright Reporter

```typescript
import type { Reporter, FullResult, TestCase, TestResult, Config, Suite } from '@playwright/test/reporter';

interface MetricsSnapshot {
  timestamp: string;
  branch: string;
  commit: string;
  environment: string;
  project: string;
  metrics: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
    passRate: number;
    cleanPassRate: number;
    flakyRate: number;
    avgDuration: number;
    p50Duration: number;
    p90Duration: number;
    p95Duration: number;
    p99Duration: number;
  };
}

export class MetricsReporter implements Reporter {
  private config: Config | null = null;
  private results: TestResult[] = [];
  private tests: TestCase[] = [];
  
  onBegin(config: Config, suite: Suite): void {
    this.config = config;
    this.results = [];
    this.tests = [];
  }
  
  onTestBegin(test: TestCase): void {
    this.tests.push(test);
  }
  
  onTestEnd(test: TestCase, result: TestResult): void {
    this.results.push(result);
  }
  
  async onEnd(result: FullResult): Promise<void> {
    const snapshot = this.buildSnapshot(result);
    
    // Zapisz snapshot do pliku JSON dla późniejszej analizy
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const outputDir = './test-results/metrics';
    await fs.mkdir(outputDir, { recursive: true });
    
    const fileName = `metrics-${Date.now()}.json`;
    await fs.writeFile(path.join(outputDir, fileName), JSON.stringify(snapshot, null, 2));
    
    console.log(`[MetricsReporter] Snapshot: ${fileName}`);
    console.table(snapshot.metrics);
    
    // Dodatkowo: eksportuj do formatu prometheus (dla Grafana)
    await this.exportPrometheusMetrics(snapshot);
  }
  
  private buildSnapshot(result: FullResult): MetricsSnapshot {
    const durations = this.results.map(r => r.duration).sort((a, b) => a - b);
    
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    const flaky = this.results.filter(r => r.status === 'passed' && r.retries > 0).length;
    const cleanPassed = this.results.filter(r => r.status === 'passed' && r.retries === 0).length;
    
    const percentile = (arr: number[], p: number) => {
      const index = Math.ceil((p / 100) * arr.length) - 1;
      return arr[Math.max(0, index)];
    };
    
    return {
      timestamp: new Date().toISOString(),
      branch: process.env.GIT_BRANCH ?? 'unknown',
      commit: process.env.GIT_COMMIT?.substring(0, 7) ?? 'unknown',
      environment: this.config?.projects[0]?.name ?? 'default',
      project: this.config?.projects[0]?.use?.browserName ?? 'unknown',
      metrics: {
        total,
        passed,
        failed,
        skipped,
        flaky,
        passRate: total > 0 ? (passed / total) * 100 : 0,
        cleanPassRate: total > 0 ? (cleanPassed / total) * 100 : 0,
        flakyRate: total > 0 ? (flaky / total) * 100 : 0,
        avgDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
        p50Duration: percentile(durations, 50),
        p90Duration: percentile(durations, 90),
        p95Duration: percentile(durations, 95),
        p99Duration: percentile(durations, 99),
      },
    };
  }
  
  private async exportPrometheusMetrics(snapshot: MetricsSnapshot): Promise<void> {
    const m = snapshot.metrics;
    
    const prometheusOutput = `# HELP test_total Total number of tests
# TYPE test_total gauge
test_total{branch="${snapshot.branch}",env="${snapshot.environment}"} ${m.total}

# HELP test_passed_total Total passed tests
# TYPE test_passed_total gauge
test_passed_total{branch="${snapshot.branch}",env="${snapshot.environment}"} ${m.passed}

# HELP test_failed_total Total failed tests
# TYPE test_failed_total gauge
test_failed_total{branch="${snapshot.branch}",env="${snapshot.environment}"} ${m.failed}

# HELP test_pass_rate Pass rate percentage
# TYPE test_pass_rate gauge
test_pass_rate{branch="${snapshot.branch}",env="${snapshot.environment}"} ${m.passRate.toFixed(2)}

# HELP test_flaky_rate Flaky rate percentage
# TYPE test_flaky_rate gauge
test_flaky_rate{branch="${snapshot.branch}",env="${snapshot.environment}"} ${m.flakyRate.toFixed(2)}

# HELP test_p95_duration 95th percentile test duration in ms
# TYPE test_p95_duration gauge
test_p95_duration{branch="${snapshot.branch}",env="${snapshot.environment}"} ${m.p95Duration.toFixed(0)}
`;
    
    const fs = await import('fs/promises');
    await fs.writeFile('./test-results/metrics/metrics.prom', prometheusOutput);
    console.log('[MetricsReporter] Prometheus metrics: ./test-results/metrics/metrics.prom');
  }
}

export default MetricsReporter;
```

---

## Sekcja 2: Grafana — wizualizacja trendów

### Architektura analityki metryk testowych

Typowa architektura stacku analitycznego:

```
Playwright Tests
      ↓ (JSON/Prometheus metrics)
  InfluxDB / Prometheus / TimescaleDB
      ↓ (time-series data)
    Grafana
      ↓ (dashboards + alerts)
  QA Team / Devs / Managers
```

### Konfiguracja datasource Prometheus w Grafanie

```yaml
# prometheus.yml — scrapowanie metryk z testów
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'playwright-metrics'
    static_configs:
      - targets: ['localhost:9090']
    metrics_path: '/test-results/metrics/metrics.prom'
    scrape_interval: 30s
```

### Dashboard — przegląd jakościowy

Tworząc dashboard w Grafanie, myśl kategoriami pytań:

1. **Czy suite jest zdrowy?** → Pass rate trend, flaky rate trend
2. **Gdzie są problemy?** → Top failed modules, slowest test categories
3. **Czy pipeline jest przewidywalny?** → Duration trend, P95 over time
4. **Kto jest właścicielem problemów?** → Failed tests by team/project

Przykładowe panele Grafana:

```sql
-- Pass Rate Trend (Line chart)
SELECT 
  time,
  avg(test_pass_rate) as "Pass Rate %"
FROM test_metrics
WHERE $__timeFilter(time)
GROUP BY time
ORDER BY time
```

```sql
-- Failed tests by module (Pie chart)
SELECT 
  module,
  count(*) as "Failed Count"
FROM test_results
WHERE status = 'failed'
  AND $__timeFilter(timestamp)
GROUP BY module
ORDER BY count(*) DESC
```

```sql
-- P95 Duration Over Time (Area chart)
SELECT 
  time,
  avg(test_p95_duration) as "P95 Duration (ms)"
FROM test_metrics
WHERE $__timeFilter(time)
GROUP BY time
ORDER BY time
```

```sql
-- Flaky Tests by Category (Table)
SELECT 
  test_name,
  flaky_count,
  last_flaky_date,
  category
FROM flaky_tests
WHERE $__timeFilter(last_flaky_date)
ORDER BY flaky_count DESC
LIMIT 20
```

### Quality Gates — automatyczne kryteria release

Quality gate to automatyczny checkpoint, który blokuje release, jeśli metryki przekraczają zdefiniowane progi:

```typescript
interface QualityGate {
  name: string;
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  action: 'block' | 'warn' | 'info';
}

const qualityGates: QualityGate[] = [
  { name: 'Pass Rate Minimum', metric: 'passRate', operator: 'gte', threshold: 95, action: 'block' },
  { name: 'Flaky Rate Maximum', metric: 'flakyRate', operator: 'lte', threshold: 3, action: 'block' },
  { name: 'P95 Duration Maximum', metric: 'p95Duration', operator: 'lte', threshold: 30000, action: 'warn' },
  { name: 'Critical Tests Failed', metric: 'criticalFailed', operator: 'eq', threshold: 0, action: 'block' },
  { name: 'New Failures', metric: 'newFailures', operator: 'eq', threshold: 0, action: 'warn' },
];

function evaluateQualityGate(
  snapshot: MetricsSnapshot,
  gates: QualityGate[]
): { passed: boolean; violations: string[] } {
  const violations: string[] = [];
  
  for (const gate of gates) {
    const value = snapshot.metrics[gate.metric as keyof typeof snapshot.metrics] as number;
    
    let passed = false;
    switch (gate.operator) {
      case 'gt': passed = value > gate.threshold; break;
      case 'lt': passed = value < gate.threshold; break;
      case 'eq': passed = value === gate.threshold; break;
      case 'gte': passed = value >= gate.threshold; break;
      case 'lte': passed = value <= gate.threshold; break;
    }
    
    if (!passed) {
      const severity = gate.action === 'block' ? '🔴' : '⚠️';
      violations.push(
        `${severity} [${gate.action.toUpperCase()}] ${gate.name}: ${value} (required: ${gate.operator} ${gate.threshold})`
      );
    }
  }
  
  const blocked = violations.some(v => v.startsWith('🔴'));
  
  return { passed: !blocked, violations };
}
```

Quality gates implementowane w CI pipeline:

```typescript
// W playwright.config.ts — jako custom reporter
import { evaluateQualityGate } from './quality-gate';

export default defineConfig({
  reporter: [
    ['html'],
    [MetricsReporter],
  ],
});

// W CI pipeline — po zakończeniu testów
async function checkQualityGates() {
  const snapshots = await loadRecentSnapshots('./test-results/metrics', 1);
  
  if (snapshots.length === 0) {
    console.error('Brak snapshotów metrycznych.');
    process.exit(1);
  }
  
  const latest = snapshots[snapshots.length - 1];
  const { passed, violations } = evaluateQualityGate(latest, qualityGates);
  
  console.log('\n=== Quality Gate Evaluation ===');
  violations.forEach(v => console.log(v));
  console.log('==============================');
  
  if (!passed) {
    console.error('❌ Quality gate FAILED — release blocked.');
    process.exit(1);
  } else {
    console.log('✅ Quality gate PASSED — release approved.');
  }
}
```

---

## Sekcja 3: Analiza trendów i anomaly detection

### Wzorce trendów — co mówią liczby

**Trend wzrostowy pass rate** (np. 85% → 95% w miesiąc):
- Pozytywny — zespół naprawia defekty systematycznie
- Ryzyko: może oznaczać usuwanie trudnych testów zamiast naprawy kodu

**Trend spadkowy pass rate** (np. 98% → 92% w 2 tygodnie):
- Negatywny — regresja w kodzie lub niestabilne środowisko
- Akcja: analiza root cause nowych failure'ów, izolacja problemu

**Rosnący flaky rate** (np. 0.5% → 4% w miesiąc):
- Krytyczny — testy tracą zaufanie
- Akcja: priorytetowa analiza flaky testów, może wymagać временного wyłączenia z pipeline

**Wydłużający się P95 duration** (np. 8s → 25s w kwartale):
- Wydajnościowy — problemy z testami lub środowiskiem
- Akcja: profilowanie najwolniejszych testów, optymalizacja setup/teardown

**Spadający total tests** (np. 600 → 450 w roku):
- Może być pozytywny (usunięto martwe testy) lub negatywny (testy wyłączone z powodu problemów)

### Anomaly detection — wykrywanie odstępstw

Prosty algorytm wykrywania anomalii oparty na moving average:

```typescript
interface Anomaly {
  metric: string;
  expectedValue: number;
  actualValue: number;
  deviation: number;  // procent odchylenia
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
}

function detectAnomalies(
  current: MetricsSnapshot,
  historical: MetricsSnapshot[]
): Anomaly[] {
  const anomalies: Anomaly[] = [];
  
  if (historical.length < 7) {
    return anomalies; // potrzebujemy przynajmniej 7 punktów historycznych
  }
  
  // Oblicz moving average z ostatnich N wyników
  const windowSize = 7;
  const recentHistorical = historical.slice(-windowSize);
  
  const metricsToCheck = ['passRate', 'flakyRate', 'p95Duration'] as const;
  
  for (const metric of metricsToCheck) {
    const currentValue = current.metrics[metric];
    const historicalValues = recentHistorical.map(h => h.metrics[metric]);
    
    const avg = historicalValues.reduce((a, b) => a + b, 0) / historicalValues.length;
    const stdDev = calculateStdDev(historicalValues);
    
    const deviation = Math.abs(currentValue - avg) / avg * 100;
    
    let severity: Anomaly['severity'] = 'info';
    if (deviation > 20) severity = 'critical';
    else if (deviation > 10) severity = 'warning';
    
    if (deviation > 10) {
      anomalies.push({
        metric,
        expectedValue: Math.round(avg * 100) / 100,
        actualValue: Math.round(currentValue * 100) / 100,
        deviation: Math.round(deviation * 10) / 10,
        severity,
        timestamp: current.timestamp,
      });
    }
  }
  
  return anomalies;
}

function calculateStdDev(values: number[]): number {
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(variance);
}
```

Wykrywanie anomalii w Grafanie realizujesz przez Holt-Winters forecasting lub proste progi oparte na standard deviation — oba podejścia są dostępne jako wbudowane funkcje Grafany.

---

## Sekcja 4: Raport kierowniczy — executive summary

Dla kadry zarządzającej metryki muszą być przedstawione inaczej niż dla developerów. Raport kierowniczy odpowiada na pytania biznesowe:

- Czy produkt jest gotowy do release?
- Gdzie są największe ryzyka jakościowe?
- Jak jakość zmienia się w czasie?
- Czy zespół QA jest efektywny?

```typescript
interface ExecutiveSummary {
  generatedAt: string;
  period: { from: string; to: string };
  overallHealth: 'good' | 'degraded' | 'critical';
  releaseRecommendation: 'approve' | 'caution' | 'block';
  
  keyMetrics: {
    testCoverage: number;      // % requirements covered by tests
    defectLeakageRate: number; // % bugs found in prod vs. pre-prod
    automationROI: number;     // hours saved by automation
    suiteReliability: number;  // % tests passing without flakiness
  };
  
  trends: {
    qualityTrend: 'improving' | 'stable' | 'declining';
    velocityTrend: 'improving' | 'stable' | 'declining';
    riskTrend: 'increasing' | 'stable' | 'decreasing';
  };
  
  topRisks: Array<{
    risk: string;
    impact: 'high' | 'medium' | 'low';
    mitigation: string;
  }>;
  
  recommendations: string[];
}

function generateExecutiveSummary(
  snapshots: MetricsSnapshot[],
  releaseContext: { deploymentTarget: string; hasBreakingChanges: boolean }
): ExecutiveSummary {
  const latest = snapshots[snapshots.length - 1];
  const previous = snapshots[snapshots.length - 2];
  const oldest = snapshots[0];
  
  // Oblicz kierunki trendów
  const passRateTrend = calculateTrend(
    snapshots.map(s => s.metrics.passRate)
  );
  
  const flakyRateTrend = calculateTrend(
    snapshots.map(s => s.metrics.flakyRate)
  );
  
  const durationTrend = calculateTrend(
    snapshots.map(s => s.metrics.p95Duration)
  );
  
  // Określ zdrowie suite'u
  let health: ExecutiveSummary['overallHealth'] = 'good';
  if (latest.metrics.flakyRate > 5 || latest.metrics.passRate < 90) {
    health = 'critical';
  } else if (latest.metrics.flakyRate > 2 || latest.metrics.passRate < 95) {
    health = 'degraded';
  }
  
  // Rekomendacja release
  let releaseRecommendation: ExecutiveSummary['releaseRecommendation'] = 'approve';
  if (health === 'critical') releaseRecommendation = 'block';
  else if (health === 'degraded' || releaseContext.hasBreakingChanges) releaseRecommendation = 'caution';
  
  return {
    generatedAt: new Date().toISOString(),
    period: {
      from: oldest.timestamp,
      to: latest.timestamp,
    },
    overallHealth: health,
    releaseRecommendation,
    keyMetrics: {
      testCoverage: calculateTestCoverage(snapshots),
      defectLeakageRate: calculateDefectLeakage(snapshots),
      automationROI: calculateAutomationROI(snapshots),
      suiteReliability: latest.metrics.cleanPassRate,
    },
    trends: {
      qualityTrend: passRateTrend === 'up' ? 'improving' : passRateTrend === 'down' ? 'declining' : 'stable',
      velocityTrend: durationTrend === 'down' ? 'improving' : durationTrend === 'up' ? 'declining' : 'stable',
      riskTrend: flakyRateTrend === 'down' ? 'decreasing' : flakyRateTrend === 'up' ? 'increasing' : 'stable',
    },
    topRisks: identifyTopRisks(snapshots),
    recommendations: generateRecommendations(latest, health, releaseContext),
  };
}

function calculateTrend(values: number[]): 'up' | 'down' | 'stable' {
  if (values.length < 2) return 'stable';
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const change = ((avgSecond - avgFirst) / avgFirst) * 100;
  
  if (change > 2) return 'up';
  if (change < -2) return 'down';
  return 'stable';
}
```

---

## Sekcja 5: Pułapki interpretacji metryk

### Pułapka 1: Korelacja ≠ przyczynowość

Wzrost flaky rate koreluje z nowym deploymentem środowiska staging. Czy to oznacza, że deployment zepsuł testy? Nie automatycznie — flaky mogły istnieć wcześniej, ale dopiero teraz są widoczne (zmieniono retry policy). Zawsze badaj root cause, nie zakładaj przyczynowości.

### Pułapka 2: Coverage mylony z jakością

500 testów nie oznacza lepszej jakości niż 200 testów. Jakość mierzysz defect leakage rate — ile bugów przedostało się do produkcji mimo testów. Test, który zawsze przechodzi i nic nie weryfikuje, zwiększa coverage, ale nie jakość.

### Pułapka 3: Pojedynczy snapshot

Reprezentatywność próby ma znaczenie. Jeden passed run po restarcie środowiska nic nie mówi o stabilności. Potrzebujesz minimum 10-20 przebiegów, żeby wyciągać wnioski.

### Pułapka 4: Normalizacja środowisk

Test trwający 5s na laptopie developera i 12s na shared CI runnerze to dwie różne rzeczy. Porównuj metryki tylko w ramach tego samego środowiska execution context.

---

## Perspektywa Full Stack Testera

Jako Full Stack Tester pracujesz na styku danych i decyzji. Twoja rola w kontekście analityki to:

- **Inżynier metryk** — projektujesz, co mierzysz, aby odpowiedzieć na właściwe pytania. Zły pomiar prowadzi do złych decyzji.
- **Analityk jakości** — interpretujesz trendy, wykrywasz anomalie, komunikujesz ryzyko w sposób zrozumiały dla odbiorcy.
- **Facilitator quality gates** — wdrażasz automatyczne checkpoints, które chronią release przed nieprzetestowanym kodem.
- **Advocate dla metryk behawioralnych** — poza pass/fail liczą się flaky rate, coverage quality i defect leakage.

Najlepsze zespoły, które widziałem, mają wspólny dashboard metryk, do którego każdy ma dostęp. Metryki nie są ukryte w raportach CI — są na widoku, omawiane na stand-upach, wpływają na decyzje. To kulturowa zmiana, nie tylko techniczna.

---

## Podsumowanie

- **Pass Rate** jest użyteczny, ale wymaga rozróżnienia na clean pass rate (bez retry) i total pass rate. W pojedynczym snapshotcie myli.
- **Flaky Rate** to jedna z najważniejszych metryk zaufania. Każdy flaky test wymaga analizy przyczyny i klasyfikacji (timing, race, environmental).
- **Percentyle (P95, P99)** pokazują rozkład czasu trwania lepiej niż średnia. P95 to standard dla quality gates.
- **Grafana dashboard** to narzędzie do wizualizacji trendów. Dashboard powinien odpowiadać na pytania biznesowe, nie tylko pokazywać liczby.
- **Quality Gates** automatyzują decyzje release'owe. Progi muszą być zdefiniowane, komunikowane i egzekwowane w CI.
- **Anomaly Detection** wykrywa odstępstwa od normy na podstawie moving average i standard deviation.
- **Executive Summary** to inny format dla innego odbiorcy — fokus na ryzyku, trendach i rekomendacjach, nie na liczbach.

---

## Linki i źródła

- [Grafana — Getting Started](https://grafana.com/docs/grafana/latest/getting-started/getting-started/) — wprowadzenie do Grafany, datasources, dashboard creation
- [Prometheus — Metric Types](https://prometheus.io/docs/concepts/metric_types/) — Counter, Gauge, Histogram, Summary — kiedy używać każdego
- [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer) — podstawowy artefakt diagnostyczny dla analizy failure'ów
- [Statistical Process Control for QA](https://en.wikipedia.org/wiki/Statistical_process_control) — SPC jako metodologia wykrywania anomalii w procesach jakościowych
- [Google Test Analytics — Flaky Tests](https://testing.googleblog.com/2020/12/test-selectors-for-flaky-tests.html) — podejście Googla do zarządzania flaky testami na skalę
- [InfluxDB + Grafana for Test Metrics](https://www.influxdata.com/integrations/playwright/) — integracja Playwright z InfluxDB dla time-series analytics