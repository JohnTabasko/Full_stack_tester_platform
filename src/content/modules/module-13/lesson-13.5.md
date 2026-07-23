# Monitorowanie wydajności i ciągła kontrola wydajności

> **Perspektywa Full Stack Testera**
> Pojedynczy pomiar wydajności to snapshot. Snapshot mówi "teraz", ale nie mówi "czy było lepiej wcześniej" ani "czy będzie gorzej jutro". Ciągła kontrola wydajności to system, który śledzi metryki w czasie, wykrywa regresje zanim użytkownicy je zgłoszą, i daje zespołowi wczesne ostrzeżenie o problemach. Ta lekcja uczy, jak zbudować observability pipeline dla wydajności frontendu: od automatycznego collection metryk przez Prometheus, przez wizualizację w Grafanie, po alertowanie na regresje.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Zbierać metryki wydajności** automatycznie w CI — LCP, CLS, INP, timing z każdego testu
- **Przechowywać historyczne dane** — Prometheus/InfluxDB dla time-series analytics
- **Wizualizować trendy** w Grafanie — dashboard odpowiadający na pytania biznesowe
- **Wykrywać regresje** automatycznie — compare against baseline, alert when degraded
- **Konfigurować budżety w CI** — performance gates jako automated quality checks
- **Monitorować długoterminowo** — 30/90 day trends, seasonal patterns, slow degradation

---

## Wprowadzenie: dlaczego pojedynczy pomiar nie wystarczy

Przykład: strona koszyka ładuje się w 3.2s. Czy to dobry wynik?

```
Snapshot: 3.2s — bez kontekstu nie wiadomo

Trend over 30 days:
- Tydzień 1: 2.1s
- Tydzień 2: 2.3s
- Tydzień 3: 2.8s
- Tydzień 4: 3.2s ← regresja narastająca od 3 tygodni

Konkluzja: regresja wydajności. Bez trendu: would've been missed.
```

Regresje wydajności często narastają stopniowo — 100ms tygodniowo. Pojedynczy pomiar tego nie wychwyci. Potrzebujesz:
1. **Continuous measurement** — metryki zbierane przy każdym pipeline
2. **Historical baseline** — punkt odniesienia do porównania
3. **Trend detection** — automated alerting gdy trend rośnie
4. **Root cause context** — co zmieniło się w ostatnim commit, że wydajność spadła

---

## Sekcja 1: Automatyczne zbieranie metryk w CI

### Prometheus metrics exporter

```typescript
// tests/utils/performance-metrics.ts
import { test, expect } from '@playwright/test';

interface PerformanceMetrics {
  route: string;
  lcp: number;
  cls: number;
  ttfb: number;
  domInteractive: number;
  loadComplete: number;
  timestamp: string;
  commit: string;
  branch: string;
}

// Export do Prometheus format
function exportPrometheus(metrics: PerformanceMetrics[]): string {
  const lines: string[] = [];
  const timestamp = Math.floor(Date.now() / 1000);
  
  for (const m of metrics) {
    const labels = `route="${m.route}",branch="${m.branch}"`;
    
    lines.push(`# TYPE perf_lcp gauge`);
    lines.push(`perf_lcp{${labels}} ${m.lcp} ${timestamp}`);
    
    lines.push(`# TYPE perf_cls gauge`);
    lines.push(`perf_cls{${labels}} ${m.cls} ${timestamp}`);
    
    lines.push(`# TYPE perf_ttfb gauge`);
    lines.push(`perf_ttfb{${labels}} ${m.ttfb} ${timestamp}`);
    
    lines.push(`# TYPE perf_dom_interactive gauge`);
    lines.push(`perf_dom_interactive{${labels}} ${m.domInteractive} ${timestamp}`);
    
    lines.push(`# TYPE perf_load_complete gauge`);
    lines.push(`perf_load_complete{${labels}} ${m.loadComplete} ${timestamp}`);
  }
  
  return lines.join('\n');
}

// W teście — zbierz metryki z każdego page
test('homepage performance metrics', async ({ page }) => {
  const route = '/';
  const start = Date.now();
  
  await page.goto(route, { waitUntil: 'load' });
  
  const metrics = await page.evaluate(() => {
    const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const lcpEntry = (performance.getEntriesByType('largest-contentful-paint') as PerformanceEntry[]).pop();
    const clsEntries = performance.getEntriesByType('layout-shift') as any[];
    
    let cls = 0;
    for (const entry of clsEntries) {
      if (!entry.hadRecentInput) cls += entry.value;
    }
    
    return {
      lcp: lcpEntry?.startTime ?? 0,
      cls,
      ttfb: nav.responseStart - nav.requestStart,
      domInteractive: nav.domInteractive - nav.startTime,
      loadComplete: nav.loadEventEnd - nav.startTime,
    };
  });
  
  const allMetrics: PerformanceMetrics = {
    route,
    ...metrics,
    timestamp: new Date().toISOString(),
    commit: process.env.GIT_COMMIT ?? 'unknown',
    branch: process.env.GIT_BRANCH ?? 'unknown',
  };
  
  // Export do pliku
  const fs = await import('fs/promises');
  await fs.appendFile(
    './test-results/perf-metrics.prom',
    exportPrometheus([allMetrics])
  );
  
  console.log(`Metrics: LCP=${metrics.lcp.toFixed(0)}ms, CLS=${metrics.cls.toFixed(3)}, TTFB=${metrics.ttfb.toFixed(0)}ms`);
});
```

### Batch metrics collection

```typescript
// tests/performance/collect-all-metrics.ts
import { test, page } from '@playwright/test';

const pagesToTest = [
  '/',
  '/products',
  '/product/test-product',
  '/cart',
  '/checkout',
  '/account',
];

for (const path of pagesToTest) {
  test(`performance: ${path}`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' });
    
    const metrics = await page.evaluate(() => {
      const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      const lcpEntry = (performance.getEntriesByType('largest-contentful-paint') as PerformanceEntry[]).pop();
      
      return {
        lcp: lcpEntry?.startTime ?? 0,
        ttfb: nav.responseStart - nav.requestStart,
        domInteractive: nav.domInteractive - nav.startTime,
        loadComplete: nav.loadEventEnd - nav.startTime,
      };
    });
    
    const sanitizedPath = path.replace(/\//g, '_').replace(/^-/, '');
    
    console.log(`# TYPE perf_${sanitizedPath}_lcp gauge`);
    console.log(`perf_${sanitizedPath}_lcp ${metrics.lcp}`);
  });
}
```

### Prometheus scrape configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 30s

scrape_configs:
  - job_name: 'playwright-perf'
    static_configs:
      - targets: ['localhost:9090']
    metrics_path: '/test-results/perf-metrics.prom'
    scrape_interval: 60s
```

---

## Sekcja 2: Baseline i regression detection

### Establishing baseline

```typescript
// scripts/establish-baseline.ts
import { readFileSync, writeFileSync } from 'fs';

interface BaselineMetrics {
  route: string;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  sampleCount: number;
  establishedAt: string;
  establishedFrom: string;  // commit range
}

async function establishBaseline(resultsPath: string, outputPath: string) {
  const data = JSON.parse(readFileSync(resultsPath, 'utf-8'));
  
  // Group metrics by route
  const byRoute: Record<string, number[]> = {};
  
  for (const entry of data) {
    const route = entry.route;
    if (!byRoute[route]) byRoute[route] = [];
    byRoute[route].push(entry.lcp);
  }
  
  const baselines: BaselineMetrics[] = [];
  
  for (const [route, values] of Object.entries(byRoute)) {
    values.sort((a, b) => a - b);
    const p50 = values[Math.floor(values.length * 0.5)];
    const p90 = values[Math.floor(values.length * 0.9)];
    const p95 = values[Math.floor(values.length * 0.95)];
    const p99 = values[Math.floor(values.length * 0.99)];
    
    baselines.push({
      route,
      p50,
      p90,
      p95,
      p99,
      sampleCount: values.length,
      establishedAt: new Date().toISOString(),
      establishedFrom: `${process.env.GIT_COMMIT ?? 'unknown'}`,
    });
  }
  
  writeFileSync(outputPath, JSON.stringify(baselines, null, 2));
  console.log(`Baseline established for ${baselines.length} routes`);
}

// Uruchom po 30 dniach regularnych testów
// node scripts/establish-baseline.js --results ./test-results/all-metrics.json --output ./baseline.json
```

### Regression detection

```typescript
// scripts/detect-regression.ts
import { readFileSync } from 'fs';

interface RegressionResult {
  route: string;
  current: number;
  baseline: number;
  changePercent: number;
  severity: 'info' | 'warning' | 'critical';
  isRegression: boolean;
}

const TOLERANCE = 0.10;  // 10% natural variation
const WARNING_THRESHOLD = 0.15;  // 15% degradation = warning
const CRITICAL_THRESHOLD = 0.25;  // 25% degradation = critical

function detectRegression(
  currentMetrics: Record<string, number>,
  baseline: Record<string, { p95: number }>
): RegressionResult[] {
  const results: RegressionResult[] = [];
  
  for (const [route, currentValue] of Object.entries(currentMetrics)) {
    const baselineValue = baseline[route]?.p95 ?? currentValue;
    const changePercent = ((currentValue - baselineValue) / baselineValue) * 100;
    
    let severity: RegressionResult['severity'] = 'info';
    let isRegression = false;
    
    if (changePercent > WARNING_THRESHOLD * 100) {
      severity = 'warning';
      isRegression = true;
    }
    if (changePercent > CRITICAL_THRESHOLD * 100) {
      severity = 'critical';
      isRegression = true;
    }
    
    results.push({
      route,
      current: currentValue,
      baseline: baselineValue,
      changePercent,
      severity,
      isRegression,
    });
  }
  
  return results;
}

// CLI — uruchom jako część CI
async function main() {
  const currentRaw = readFileSync('./test-results/perf-metrics.json', 'utf-8');
  const current = JSON.parse(currentRaw);
  
  const baselineRaw = readFileSync('./baseline.json', 'utf-8');
  const baseline = JSON.parse(baselineRaw);
  
  const results = detectRegression(current, baseline);
  
  console.log('\n=== Performance Regression Detection ===');
  
  const regressions = results.filter(r => r.isRegression);
  const warnings = results.filter(r => r.severity === 'warning');
  const criticals = results.filter(r => r.severity === 'critical');
  
  if (criticals.length > 0) {
    console.log('\n🔴 CRITICAL REGRESSIONS:');
    criticals.forEach(r => {
      console.log(`  ${r.route}: ${r.current.toFixed(0)}ms (baseline: ${r.baseline.toFixed(0)}ms, change: +${r.changePercent.toFixed(1)}%)`);
    });
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:');
    warnings.forEach(r => {
      console.log(`  ${r.route}: ${r.current.toFixed(0)}ms (baseline: ${r.baseline.toFixed(0)}ms, change: +${r.changePercent.toFixed(1)}%)`);
    });
  }
  
  if (regressions.length === 0) {
    console.log('\n✅ No performance regressions detected');
  }
  
  // Exit code: 1 jeśli critical regressions
  process.exit(criticals.length > 0 ? 1 : 0);
}
```

---

## Sekcja 3: Grafana dashboard

### Performance overview dashboard

```json
{
  "title": "Frontend Performance — Overview",
  "panels": [
    {
      "title": "LCP Trend (30 days)",
      "type": "timeseries",
      "gridPos": { "x": 0, "y": 0, "w": 12, "h": 8 },
      "targets": [
        {
          "expr": "avg(perf_lcp{route=\"/\"}) by (branch)",
          "legendFormat": "{{branch}}"
        }
      ],
      "fieldConfig": {
        "defaults": {
          "thresholds": {
            "steps": [
              { "value": 0, "color": "red" },
              { "value": 2500, "color": "yellow" },
              { "value": 4000, "color": "green" }
            ]
          },
          "unit": "ms"
        }
      }
    },
    {
      "title": "Performance Score by Page",
      "type": "bargauge",
      "gridPos": { "x": 12, "y": 0, "w": 12, "h": 8 },
      "targets": [
        {
          "expr": "avg(perf_lcp) by (route)",
          "legendFormat": "{{route}}"
        }
      ],
      "options": {
        "displayMode": "gradient",
        "orientation": "horizontal"
      }
    },
    {
      "title": "TTFB Trend",
      "type": "timeseries",
      "gridPos": { "x": 0, "y": 8, "w": 8, "h": 6 },
      "targets": [
        {
          "expr": "avg(perf_ttfb) by (route)",
          "legendFormat": "{{route}}"
        }
      ]
    },
    {
      "title": "CLS by Page",
      "type": "bargauge",
      "gridPos": { "x": 8, "y": 8, "w": 8, "h": 6 },
      "targets": [
        {
          "expr": "avg(perf_cls) by (route)",
          "legendFormat": "{{route}}"
        }
      ],
      "fieldConfig": {
        "defaults": {
          "thresholds": {
            "steps": [
              { "value": 0, "color": "green" },
              { "value": 0.1, "color": "yellow" },
              { "value": 0.25, "color": "red" }
            ]
          }
        }
      }
    },
    {
      "title": "Sample Count (reliability)",
      "type": "stat",
      "gridPos": { "x": 16, "y": 8, "w": 8, "h": 6 },
      "targets": [
        {
          "expr": "sum(perf_lcp_count)",
          "legendFormat": "Total samples"
        }
      ]
    }
  ],
  "templating": {
    "list": [
      {
        "name": "route",
        "type": "query",
        "query": "label_values(perf_lcp, route)"
      },
      {
        "name": "branch",
        "type": "query",
        "query": "label_values(perf_lcp, branch)"
      }
    ]
  }
}
```

### Comparison dashboard — current vs. baseline

```json
{
  "title": "Performance vs Baseline",
  "panels": [
    {
      "title": "LCP: Current vs Baseline",
      "type": "timeseries",
      "targets": [
        {
          "expr": "avg(perf_lcp{route=\"/\"}) by (branch)",
          "legendFormat": "Current: {{branch}}"
        },
        {
          "expr": "baseline_p95{route=\"/\"}",
          "legendFormat": "Baseline P95"
        }
      ]
    },
    {
      "title": "Regression Events",
      "type": "table",
      "targets": [
        {
          "expr": "rate(perf_regression_total[5m])",
          "format": "table"
        }
      ]
    }
  ]
}
```

---

## Sekcja 4: Performance gates w CI

### Automated quality gate

```typescript
// scripts/performance-gate.ts
interface PerformanceGate {
  name: string;
  route: string;
  metric: string;
  threshold: number;
  baseline: number;
  comparison: 'lte' | 'gte';
}

const performanceGates: PerformanceGate[] = [
  { name: 'Homepage LCP', route: '/', metric: 'lcp', threshold: 2500, baseline: 1800, comparison: 'lte' },
  { name: 'Product Page LCP', route: '/products', metric: 'lcp', threshold: 3000, baseline: 2200, comparison: 'lte' },
  { name: 'Checkout LCP', route: '/checkout', metric: 'lcp', threshold: 4000, baseline: 3000, comparison: 'lte' },
  { name: 'Homepage CLS', route: '/', metric: 'cls', threshold: 0.1, baseline: 0.05, comparison: 'lte' },
  { name: 'TTFB Maximum', route: '*', metric: 'ttfb', threshold: 600, baseline: 400, comparison: 'lte' },
];

interface GateResult {
  gate: PerformanceGate;
  passed: boolean;
  actual: number;
  changeFromBaseline: number;
  message: string;
}

function evaluatePerformanceGate(
  metrics: Record<string, number>,
  gate: PerformanceGate
): GateResult {
  const actual = metrics[`${gate.route}_${gate.metric}`] ?? metrics[gate.metric] ?? 0;
  
  let passed = false;
  switch (gate.comparison) {
    case 'lte': passed = actual <= gate.threshold; break;
    case 'gte': passed = actual >= gate.threshold; break;
  }
  
  const changeFromBaseline = ((actual - gate.baseline) / gate.baseline) * 100;
  
  return {
    gate,
    passed,
    actual,
    changeFromBaseline,
    message: passed
      ? `✅ ${gate.name}: ${actual.toFixed(0)}ms (limit: ${gate.threshold}ms)`
      : `❌ ${gate.name}: ${actual.toFixed(0)}ms (limit: ${gate.threshold}ms, baseline: ${gate.baseline}ms, change: +${changeFromBaseline.toFixed(1)}%)`,
  };
}

// W CI — po testach
async function runPerformanceGate() {
  const metricsRaw = readFileSync('./test-results/perf-metrics.json', 'utf-8');
  const metrics = JSON.parse(metricsRaw);
  
  const results = performanceGates.map(gate => evaluatePerformanceGate(metrics, gate));
  
  console.log('\n=== Performance Gate Evaluation ===');
  results.forEach(r => console.log(r.message));
  console.log('===================================');
  
  const failed = results.filter(r => !r.passed);
  
  if (failed.length > 0) {
    console.log(`\n🔴 PERFORMANCE GATE FAILED — ${failed.length} gate(s) not passed`);
    failed.forEach(f => console.log(`  - ${f.gate.name}: ${f.actual.toFixed(0)}ms`));
    process.exit(1);
  } else {
    console.log('\n✅ ALL PERFORMANCE GATES PASSED');
    process.exit(0);
  }
}
```

### GitHub Actions integration

```yaml
# .github/workflows/performance-gate.yml
name: Performance Gate

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 3 * * *'  # Nocne sprawdzenie

jobs:
  collect-metrics:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      
      - name: Start app
        run: npm run start &
        background: true
      
      - name: Collect performance metrics
        run: |
          npm ci
          npx playwright test tests/performance/collect-all.spec.ts --reporter=list
      
      - name: Upload metrics
        uses: actions/upload-artifact@v4
        with:
          name: perf-metrics
          path: test-results/perf-metrics.json
  
  evaluate-gate:
    needs: collect-metrics
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Download metrics
        uses: actions/download-artifact@v4
        with:
          name: perf-metrics
          path: test-results
      
      - name: Run performance gate
        run: node scripts/performance-gate.js
      
      - name: Comment on PR if failed
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              body: '## ⚠️ Performance Regression Detected\n\nPerformance metrics have degraded compared to baseline. Please investigate.',
            });
```

---

## Sekcja 5: Długoterminowe śledzenie i alerting

### Seasonal and trend analysis

```typescript
// scripts/performance-trends.ts
interface TrendAnalysis {
  route: string;
  period: string;
  direction: 'improving' | 'stable' | 'degrading';
  changePercent: number;
  lastValue: number;
  firstValue: number;
}

function analyzeTrends(historicalData: any[], periodDays: number): TrendAnalysis[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - periodDays);
  
  const recentData = historicalData.filter(d => new Date(d.timestamp) > cutoff);
  
  const byRoute: Record<string, number[]> = {};
  for (const entry of recentData) {
    if (!byRoute[entry.route]) byRoute[entry.route] = [];
    byRoute[entry.route].push(entry.lcp);
  }
  
  const analyses: TrendAnalysis[] = [];
  
  for (const [route, values] of Object.entries(byRoute)) {
    if (values.length < 5) continue;
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    let direction: TrendAnalysis['direction'] = 'stable';
    if (changePercent > 5) direction = 'degrading';
    else if (changePercent < -5) direction = 'improving';
    
    analyses.push({
      route,
      period: `${periodDays} days`,
      direction,
      changePercent,
      lastValue: secondAvg,
      firstValue: firstAvg,
    });
  }
  
  return analyses.sort((a, b) => b.changePercent - a.changePercent);
}
```

### Prometheus alerting rules

```yaml
# prometheus-alerts.yml
groups:
  - name: performance
    rules:
      # Alert gdy LCP przekroczył threshold
      - alert: LCPExceedsThreshold
        expr: avg(perf_lcp) > 4000
        for: 5m
        labels:
          severity: warning
          team: frontend
        annotations:
          summary: "LCP above 4s — {{ $value }}ms"
          description: "Largest Contentful Paint exceeded 4000ms threshold on {{ $labels.route }}"
          runbook: "https://wiki.example.com/runbooks/lcp-degradation"
      
      # Alert gdy LCP pogorszył się o >25% vs. baseline
      - alert: LCPRegression25Percent
        expr: |
          (
            avg(perf_lcp{route="/"}) 
            / 
            baseline_p95{route="/"}
          ) > 1.25
        for: 10m
        labels:
          severity: critical
          team: frontend
        annotations:
          summary: "LCP regression >25% on {{ $labels.route }}"
          description: "LCP has degraded by more than 25% compared to baseline. Current: {{ $value }}ms"
      
      # Alert gdy CLS przekroczył threshold
      - alert: CLSExceedsThreshold
        expr: avg(perf_cls) > 0.1
        for: 5m
        labels:
          severity: warning
          team: frontend
        annotations:
          summary: "CLS above 0.1 on {{ $labels.route }}"
      
      # Alert gdy sample count spadł (oznacza że testy się nie uruchamiają)
      - alert: LowSampleCount
        expr: rate(perf_lcp_count[1h]) < 5
        for: 2h
        labels:
          severity: warning
          team: frontend
        annotations:
          summary: "Low performance sample count"
          description: "Performance metrics are not being collected regularly"
      
      # Alert na weekly trend degradation
      - alert: WeeklyTrendDegradation
        expr: |
          (
            avg(perf_lcp{route="/"}) over 7d
            /
            avg(perf_lcp{route="/"}) over 14d offset 7d
          ) > 1.15
        for: 1h
        labels:
          severity: critical
        annotations:
          summary: "Performance degrading over 7-day trend"
          description: "Weekly rolling average LCP has increased by >15% vs. previous week"

# Alert routing (Alertmanager)
route:
  receiver: 'frontend-team'
  routes:
    - match:
        severity: critical
      receiver: 'pagerduty-frontend'
      repeat_interval: 5m
    - match:
        severity: warning
      receiver: 'slack-frontend'
```

---

## Sekcja 6: Observability maturity model

### Level 1: Manual measurement

```yaml
# Na tym poziomie:
# - Developer ręcznie mierzy czas ładowania
# - Brak automated collection
# - Brak trend tracking
# - Problemy wykrywane przez user feedback

test('wydajność — developer sprawdza ręcznie', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  console.log('⚠️ Manual check: sprawdź Performance tab w DevTools');
});
```

### Level 2: Automated collection

```typescript
// Na tym poziomie:
// - Metrics zbierane automatycznie przy każdym run
// - Stored w JSON/CSV
// - Brak trendów, brak alertów

test('collect metrics', async ({ page }) => {
  await page.goto('/');
  // Collect and save
});
```

### Level 3: Visualization

```yaml
# Na tym poziomie:
# - Grafana dashboard
# - Trend visualization
# - Manual review
# - Brak automated gates
```

### Level 4: Automated gates

```yaml
# Na tym poziomie:
# - Performance gates w CI
# - Automated blocking on regression
# - Alerts na degradation
# - Proaktywne detection
```

### Level 5: Predictive alerting

```typescript
// Na tym poziomie:
// - ML-based trend prediction
// - Anomaly detection przed exceed threshold
// - Root cause analysis automated
// - Cost optimization (auto-scaling resources based on trends)

// Future: Prometheus + ML (np. używając Grafana ML lub Thanos)
```

---

## Perspektywa Full Stack Testera

Observability to nie monitoring — monitoring to "czy coś działa", observability to "dlaczego nie działa i kiedy przestanie działać". Performance observability dodaje trzeci wymiar: "czy będzie działało".

Full Stack Tester jako performance observability engineer:
- **Measure everything** — automatyczne collection metryk z każdego pipeline
- **Compare against baseline** — wiesz czy jest lepiej czy gorzej, nie tylko "jaka jest liczba"
- **Alert on trends, not just values** — regresja narastająca przez 3 tygodnie to większy problem niż single spike
- **Close the loop** — alert → investigation → fix → verification → update baseline

Najlepsze zespoły mają performance budget jako first-class citizen — tak samo ważny jak code coverage czy test pass rate. I enforce'ują go automatycznie w CI.

---

## Podsumowanie

- **Automated collection** — każdy pipeline generuje Prometheus-format metrics. LCP, CLS, TTFB, timing z każdego tested page.
- **Baseline establishment** — po 30+ days of data ustalasz P95 baseline per route. To punkt odniesienia.
- **Regression detection** — compare current vs. baseline, z tolerance na natural variation (10%). Alert na >15% degradation.
- **Grafana dashboards** — visualize trends over 7/30/90 days. Dashboard answers: "czy się pogarsza? gdzie? jak bardzo?"
- **Performance gates in CI** — automated checks block release gdy LCP > threshold lub regression > tolerance.
- **Prometheus alerts** — alert on threshold exceed, trend degradation, low sample count. Escalation matrix.
- **Długoterminowe śledzenie** — weekly/monthly trend analysis, seasonal patterns, slow degradation detection.
- **Observability maturity** — od manual check → automated collection → visualization → automated gates → predictive alerting.

---

## Linki i źródła

- [Prometheus — Getting Started](https://prometheus.io/docs/prometheus/latest/getting_started/) — setup Prometheus
- [Grafana — Dashboard Tutorial](https://grafana.com/docs/grafana/getting-started/getting-started/) — creating performance dashboards
- [Prometheus Alerting Rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/) — alert configuration
- [Playwright Performance Metrics](https://playwright.dev/docs/api/class-page#page-evaluate) — collecting perf data via evaluate
- [Core Web Vitals Monitoring — Google](https://web.dev/vitals-business-metrics/) — connecting CWV to business metrics
- [Performance Budgets in CI — web.dev](https://web.dev/use-lighthouse-for-performance-budgets/) — performance budgets as CI gates
- [Alertmanager Configuration](https://prometheus.io/docs/alerting/latest/configuration/) — routing alerts to Slack/PagerDuty
- [Grafana Alerting — Trends](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rules/alert-instances/) — alert na trends, not just values

## 📘 Suplement Inżynieryjny 2026: Wydajność i Optymalizacja (CDP Profiling)
*Inspiracja: „Hands-On Automated Testing with Playwright” (2026), Chapter 6*
*   **Profilowanie CDP**: Nawiąż bezpośrednie połączenie z procesorem przeglądarki przez Chrome DevTools Protocol (`page.context().newCDPSession(page)`), aby zbierać dokładne metryki pamięci (`JSHeapUsedSize`) i wykrywać wycieki.
*   **Przechwytywanie i Blokowanie Sieci**: Blokuj zbędne skrypty śledzące, reklamy, grafiki i czcionki za pomocą `page.route` w celu radykalnego przyspieszenia ładowania stron w środowiskach testowych.
