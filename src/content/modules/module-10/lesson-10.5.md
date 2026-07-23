# Zaawansowane strategie raportowania

> **Perspektywa Full Stack Testera**
> Po nocnej regresji trzy osoby otwierają raport: developer szuka stack trace'u i screenshotu, lider QA analizuje trendy flaky rate i pass rate, a product owner chce jedno zdanie — "czy możemy wydać?". Te trzy perspektywy wymagają trzech różnych formatów raportu. Ta lekcja uczy, jak zaprojektować system raportowania wielopoziomowego, który dostarcza właściwą informację właściwej osobie we właściwym momencie — i jak zautomatyzować decyzje o release za pomocą quality gates.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Projektować raportowanie wielopoziomowe** — od trace'a dla developera po executive summary dla stakeholderów
- **Implementować quality gates** w CI/CD, które automatycznie blokują lub warnują przy przekroczeniu progów
- **Budować dashboardy podejmowania decyzji** — każdy panel odpowiada na konkretne pytanie biznesowe
- **Konfigurować smart alerty** — z progami, właścicielami, kategoryzacją i eskalacją
- **Generować executive summary** — streszczenie nadające się do Slack DM lub email, nie tylko do HTML reporta

---

## Wprowadzenie: piramida informacji testowej

Raportowanie wielopoziomowe opiera się na prostej obserwacji: różni odbiorcy potrzebują różnych poziomów szczegółowości, a każdy poziom odpowiada na inne pytanie. Piramida informacji testowej:

```
         ▲
        /│\        EXECUTIVE SUMMARY
       / │ \       "Czy możemy wydać?"
      /  │  \      1-2 zdania, color coded, decision
     /   │   \
    /────┼────\   QUALITY GATE
   /     │     \  "Czy spełniamy kryteria release?"
  /      │      \ 3-5 metryk z progowaniem
 /       │       \
/────────┼────────\
         │         METRYKI SZCZEGÓŁOWE
         │         "Które moduły mają problemy?"
         │         Top failed, flaky by module, duration by feature
        /│\
       / │ \
      /  │  \
     /   │   \
    /    │    \
   /     │     \  TRACE + ARTEFAKTY
  /      │      \ "Co się zepsuło i dlaczego?"
 /       │       \ Steps, screenshoty, video, network log, stack trace
/────────┼────────\
```

Zasada piramidy: zawsze zaczynaj od szczegółów (trace) i buduj w górę (executive summary). Nie odwrotnie. Jeśli executive summary nie odpowiada na żadne pytanie, wróć do danych źródłowych i sprawdź, co mierzysz.

---

## Sekcja 1: Poziomy raportowania — projektowanie dla odbiorców

### Poziom 1: Developer — trace i artefakty

**Odbiorca**: Developer naprawiający błąd
**Pytanie**: Co się zepsuło, gdzie, dlaczego i jak szybko naprawić?
**Format**: Pełny Playwright HTML report + trace viewer
**Zawartość**:
- Pełny stack trace z numerami linii
- Screenshots failure point
- Network log (HAR)
- Video recording (jeśli enabled)
- Link do kodu testu i application code
- Lista retry i flaky indicator
- Środowisko (browser, OS, viewport)
- Test data / fixtures used

```typescript
// Konfiguracja maksymalnej diagnostyki dla developerów
export default defineConfig({
  testDir: './tests',
  reporter: [
    ['html', { 
      outputFolder: 'playwright-report',
      open: 'never',
    }],
    ['allure-playwright'],
  ],
  
  use: {
    // Pełna diagnostyka
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',  // trace na pierwszym retry, nie na failure
    
    // Dodatkowe logging
    actionTimeout: 10000,
    navigationTimeout: 30000,
    
    // Launch options
    launchOptions: {
      args: ['--enable-logging', '--v=1'],
    },
  },
  
  projects: [
    {
      name: 'chromium-dev',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

Reporter HTML Playwright automatycznie dołącza trace viewer, screenshoty i video. Kluczowa konfiguracja: `trace: 'on-first-retry'` — trace przy flaky tests, nie tylko przy failure. To daje kontekst dlaczego test był flaky.

### Poziom 2: QA Lead — metryki i trendy

**Odbiorca**: Lider QA analizujący kondycję suite'u
**Pytanie**: Które moduły mają problemy? Czy trendy się poprawiają? Gdzie inwestować czas?
**Format**: Dashboard Grafana + Allure categories
**Zawartość**:
- Pass rate trend (last 30 runs)
- Flaky rate trend with category breakdown
- Failed tests by module/project (top 10)
- P95/P99 duration trend
- New failures vs. known failures
- Test count by feature area
- Age of failures (kiedy test zaczął failować)

```typescript
// Reporter dedykowany dla QA Lead
import type { Reporter, FullResult, TestCase, TestResult, Suite, Config } from '@playwright/test/reporter';

interface QALeadMetrics {
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  flaky: number;
  skipped: number;
  byModule: Record<string, { passed: number; failed: number; flaky: number; avgDuration: number }>;
  byBrowser: Record<string, { passed: number; failed: number }>;
  slowestTests: Array<{ title: string; duration: number; module: string }>;
  newFailures: Array<{ title: string; firstFailedDate: string; failCount: number }>;
}

export class QALeadReporter implements Reporter {
  private results: TestResult[] = [];
  private tests: Map<string, { test: TestCase; firstFailed: string | null }> = new Map();
  private suites: Suite | null = null;
  
  onBegin(config: Config, suite: Suite): void {
    this.suites = suite;
    this.results = [];
    this.tests = new Map();
  }
  
  onTestEnd(test: TestCase, result: TestResult): void {
    this.results.push(result);
    
    const key = test.id;
    if (!this.tests.has(key)) {
      this.tests.set(key, { 
        test, 
        firstFailed: result.status === 'failed' ? new Date().toISOString() : null 
      });
    } else if (result.status === 'failed' && this.tests.get(key)!.firstFailed === null) {
      this.tests.get(key)!.firstFailed = new Date().toISOString();
    }
  }
  
  async onEnd(result: FullResult): Promise<void> {
    const metrics = this.buildMetrics(result);
    
    // Eksport do formatu dla Grafana (Prometheus)
    await this.exportForGrafana(metrics);
    
    // Eksport do JSON dla dalszej analizy
    await this.exportJson(metrics);
    
    console.log('[QALeadReporter] Metryki QA Lead wygenerowane.');
  }
  
  private buildMetrics(result: FullResult): QALeadMetrics {
    const byModule: QALeadMetrics['byModule'] = {};
    const slowestTests: QALeadMetrics['slowestTests'] = [];
    
    for (const r of this.results) {
      const test = r.test as TestCase;
      const module = test.parent?.title ?? 'unknown';
      
      if (!byModule[module]) {
        byModule[module] = { passed: 0, failed: 0, flaky: 0, avgDuration: 0 };
      }
      
      if (r.status === 'passed') {
        byModule[module].passed++;
        if (r.retries > 0) byModule[module].flaky++;
      } else if (r.status === 'failed') {
        byModule[module].failed++;
      }
      
      byModule[module].avgDuration = (byModule[module].avgDuration + r.duration) / 2;
      slowestTests.push({ title: test.title, duration: r.duration, module });
    }
    
    slowestTests.sort((a, b) => b.duration - a.duration);
    
    const newFailures = Array.from(this.tests.entries())
      .filter(([_, v]) => v.firstFailed !== null)
      .map(([id, v]) => ({
        title: v.test.title,
        firstFailedDate: v.firstFailed!,
        failCount: this.results.filter(r => r.test.id === id && r.status === 'failed').length,
      }))
      .filter(f => f.failCount <= 3) // tylko niedawne failures
      .slice(0, 10);
    
    return {
      timestamp: new Date().toISOString(),
      totalTests: this.results.length,
      passed: this.results.filter(r => r.status === 'passed').length,
      failed: this.results.filter(r => r.status === 'failed').length,
      flaky: this.results.filter(r => r.status === 'passed' && r.retries > 0).length,
      skipped: this.results.filter(r => r.status === 'skipped').length,
      byModule,
      byBrowser: this.aggregateByBrowser(),
      slowestTests: slowestTests.slice(0, 10),
      newFailures,
    };
  }
  
  private aggregateByBrowser(): Record<string, { passed: number; failed: number }> {
    const result: Record<string, { passed: number; failed: number }> = {};
    for (const r of this.results) {
      const browser = r.test.project()?.name ?? 'default';
      if (!result[browser]) result[browser] = { passed: 0, failed: 0 };
      if (r.status === 'passed') result[browser].passed++;
      else if (r.status === 'failed') result[browser].failed++;
    }
    return result;
  }
  
  private async exportForGrafana(metrics: QALeadMetrics): Promise<void> {
    const fs = await import('fs/promises');
    await fs.mkdir('./test-results/grafana', { recursive: true });
    
    const prometheus = `
# HELP qa_test_total Total tests
# TYPE qa_test_total gauge
qa_test_total ${metrics.totalTests}

# HELP qa_test_passed Passed tests
# TYPE qa_test_passed gauge
qa_test_passed ${metrics.passed}

# HELP qa_test_failed Failed tests
# TYPE qa_test_failed gauge
qa_test_failed ${metrics.failed}

# HELP qa_test_flaky Flaky tests
# TYPE qa_test_flaky gauge
qa_test_flaky ${metrics.flaky}

# HELP qa_pass_rate Pass rate percentage
# TYPE qa_pass_rate gauge
qa_pass_rate ${((metrics.passed / metrics.totalTests) * 100).toFixed(2)}

# HELP qa_flaky_rate Flaky rate percentage
# TYPE qa_flaky_rate gauge
qa_flaky_rate ${((metrics.flaky / metrics.totalTests) * 100).toFixed(2)}
`;
    
    await fs.writeFile('./test-results/grafana/metrics.prom', prometheus.trim());
  }
  
  private async exportJson(metrics: QALeadMetrics): Promise<void> {
    const fs = await import('fs/promises');
    await fs.writeFile(
      './test-results/grafana/qa-metrics.json',
      JSON.stringify(metrics, null, 2)
    );
  }
}

export default QALeadReporter;
```

### Poziom 3: Product Owner / Manager — executive summary

**Odbiorca**: Product Owner, manager, stakeholder podejmujący decyzję o release
**Pytanie**: Czy możemy wydać? Jakie jest ryzyko? Co blokuje?
**Format**: Krótki komunikat (Slack DM, email, badge w PR)
**Zawartość**:
- Jednoznacznny status: ✅ RELEASE / ⚠️ CAUTION / 🔴 BLOCK
- Kluczowe metryki: pass rate, flaky rate, critical failures
- Główne ryzyko: co może pójść nie tak w produkcji
- Akcja: kto co ma zrobić i do kiedy

```typescript
interface ExecutiveSummary {
  status: 'APPROVED' | 'CAUTION' | 'BLOCKED';
  releaseReadiness: number;  // 0-100%
  
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    flaky: number;
    passRate: number;
    flakyRate: number;
    criticalFailures: number;
  };
  
  risks: Array<{
    severity: 'critical' | 'major' | 'minor';
    area: string;
    description: string;
    impact: string;
  }>;
  
  blockedBy: Array<{
    test: string;
    owner: string;
    deadline: string;
  }>;
  
  recommendation: string;
  reportUrl: string;
  decisionMaker: string;
}

function generateExecutiveSummary(
  metrics: QALeadMetrics,
  context: { releaseVersion: string; hasBreakingChanges: boolean }
): ExecutiveSummary {
  const passRate = (metrics.passed / metrics.totalTests) * 100;
  const flakyRate = (metrics.flaky / metrics.totalTests) * 100;
  const criticalFailures = countCriticalFailures(metrics);
  
  // Określ status
  let status: ExecutiveSummary['status'] = 'APPROVED';
  let releaseReadiness = 100;
  
  if (criticalFailures > 0 || passRate < 90) {
    status = 'BLOCKED';
    releaseReadiness = Math.max(0, 100 - criticalFailures * 10 - (90 - passRate));
  } else if (flakyRate > 5 || passRate < 95 || context.hasBreakingChanges) {
    status = 'CAUTION';
    releaseReadiness = Math.max(50, 95 - flakyRate * 2);
  }
  
  return {
    status,
    releaseReadiness: Math.round(releaseReadiness),
    summary: {
      totalTests: metrics.totalTests,
      passed: metrics.passed,
      failed: metrics.failed,
      flaky: metrics.flaky,
      passRate: Math.round(passRate * 10) / 10,
      flakyRate: Math.round(flakyRate * 10) / 10,
      criticalFailures,
    },
    risks: identifyTopRisks(metrics),
    blockedBy: identifyBlockedItems(metrics),
    recommendation: buildRecommendation(status, metrics),
    reportUrl: process.env.REPORT_URL ?? 'https://report.example.com/latest',
    decisionMaker: determineDecisionMaker(metrics),
  };
}

function buildRecommendation(status: ExecutiveSummary['status'], metrics: QALeadMetrics): string {
  if (status === 'BLOCKED') {
    return `🔴 Release zablokowany. ${metrics.failed} failed testów (w tym ${countCriticalFailures(metrics)} krytycznych). Szczegóły w raporcie.`;
  }
  if (status === 'CAUTION') {
    return `⚠️ Release wymaga uwagi. Flaky rate ${metrics.flakyRate}% (próg: 5%). ${metrics.flaky} testów niestabilnych. Zalecane: ręczna weryfikacja przed wydaniem.`;
  }
  return `✅ Release zatwierdzony. Pass rate ${metrics.passRate}%, flaky rate ${metrics.flakyRate}%. Wszystkie kryteria spełnione.`;
}
```

### Format komunikatu dla Slack/PM

```typescript
function formatSlackMessage(summary: ExecutiveSummary): string {
  const statusEmoji = {
    'APPROVED': '✅',
    'CAUTION': '⚠️',
    'BLOCKED': '🔴',
  };
  
  return `
${statusEmoji[summary.status]} *Release Readiness Report*

*Wersja:* ${process.env.RELEASE_VERSION ?? 'dev'}
*Status:* ${summary.status} (${summary.releaseReadiness}% gotowości)

*Metryki:*
• Passed: ${summary.summary.passed}/${summary.summary.totalTests} (${summary.summary.passRate}%)
• Failed: ${summary.summary.failed}
• Flaky: ${summary.summary.flaky} (${summary.summary.flakyRate}%)

${summary.risks.length > 0 ? `*Ryzyka:*\n${summary.risks.map(r => `  • ${r.severity.toUpperCase()}: ${r.description}`).join('\n')}` : ''}

${summary.blockedBy.length > 0 ? `*Blokujące:*\n${summary.blockedBy.map(b => `  • ${b.test} → ${b.owner} (do: ${b.deadline})`).join('\n')}` : ''}

*Recommendation:* ${summary.recommendation}

📊 <${summary.reportUrl}|Pełny raport> | 🧪 <${summary.reportUrl}/trace|Trace Viewer>
  `.trim();
}
```

---

## Sekcja 2: Quality Gates — automatyczne kryteria release

### Architektura Quality Gate

Quality gate to automatyczny checkpoint w CI pipeline, który ewaluuje metryki testowe względem zdefiniowanych kryteriów i podejmuje decyzję o kontynuacji lub zatrzymaniu pipeline'u:

```
Pipeline CI/CD
    │
    ├── Test Execution (Playwright)
    │       │
    │       └── Generuje metryki JSON + Prometheus
    │           │
    ├── Quality Gate Evaluation
    │       │
    │       ├── Pass Rate >= 95%? ✅/❌
    │       ├── Flaky Rate <= 3%? ✅/❌
    │       ├── Critical Failures = 0? ✅/❌
    │       ├── P95 Duration <= 30s? ✅/❌
    │       └── New Failures <= 0? ✅/❌
    │           │
    ├── Gate Result
    │       │
    │       ├── PASS → Continue to deploy
    │       ├── WARN → Notify, continue (optional)
    │       └── FAIL → Block deploy, escalate
    │           │
    └── Notification & Artefacts
```

### Implementacja Quality Gate w CI

```typescript
// quality-gate.ts — evaluacja quality gate
import type { MetricsSnapshot } from './metrics-reporter';

interface QualityGateConfig {
  passRate: { min: number; action: 'block' | 'warn' };
  flakyRate: { max: number; action: 'block' | 'warn' };
  criticalFailures: { max: number; action: 'block' | 'warn' };
  p95Duration: { max: number; action: 'block' | 'warn' };
  newFailures: { max: number; action: 'block' | 'warn' };
  skippedRate: { max: number; action: 'block' | 'warn' };
}

const defaultConfig: QualityGateConfig = {
  passRate: { min: 95, action: 'block' },
  flakyRate: { max: 3, action: 'block' },
  criticalFailures: { max: 0, action: 'block' },
  p95Duration: { max: 30000, action: 'warn' }, // 30s
  newFailures: { max: 0, action: 'warn' },
  skippedRate: { max: 10, action: 'warn' }, // 10%
};

interface GateResult {
  passed: boolean;
  blocked: boolean;
  warnings: string[];
  blockedReasons: string[];
  metrics: Record<string, { actual: number; threshold: number; status: 'pass' | 'warn' | 'fail' }>;
}

export function evaluateQualityGate(
  snapshot: MetricsSnapshot,
  config: QualityGateConfig = defaultConfig
): GateResult {
  const result: GateResult = {
    passed: true,
    blocked: false,
    warnings: [],
    blockedReasons: [],
    metrics: {},
  };
  
  const checks: Array<{ key: keyof QualityGateConfig; actual: number; threshold: number; higherIsBetter: boolean }> = [
    {
      key: 'passRate',
      actual: snapshot.metrics.passRate,
      threshold: config.passRate.min,
      higherIsBetter: true,
    },
    {
      key: 'flakyRate',
      actual: snapshot.metrics.flakyRate,
      threshold: config.flakyRate.max,
      higherIsBetter: false,
    },
    {
      key: 'criticalFailures',
      actual: snapshot.summary.criticalFailed,
      threshold: config.criticalFailures.max,
      higherIsBetter: false,
    },
    {
      key: 'p95Duration',
      actual: snapshot.metrics.p95Duration,
      threshold: config.p95Duration.max,
      higherIsBetter: false,
    },
  ];
  
  for (const check of checks) {
    const passes = check.higherIsBetter 
      ? check.actual >= check.threshold 
      : check.actual <= check.threshold;
    
    let status: 'pass' | 'warn' | 'fail' = 'pass';
    if (!passes) {
      const action = config[check.key].action;
      status = action === 'block' ? 'fail' : 'warn';
      
      if (action === 'block') {
        result.blocked = true;
        result.passed = false;
        result.blockedReasons.push(
          `${check.key}: ${check.actual} (wymagane: ${check.threshold})`
        );
      } else {
        result.warnings.push(
          `${check.key}: ${check.actual} (wymagane: ${check.threshold})`
        );
      }
    }
    
    result.metrics[check.key] = {
      actual: Math.round(check.actual * 100) / 100,
      threshold: check.threshold,
      status,
    };
  }
  
  return result;
}

// W CI pipeline — po testach
export async function runQualityGate(): Promise<void> {
  const fs = await import('fs/promises');
  
  // Wczytaj najnowszy snapshot
  const files = await fs.readdir('./test-results/metrics');
  const latestFile = files
    .filter(f => f.endsWith('.json'))
    .sort()
    .pop();
  
  if (!latestFile) {
    throw new Error('Brak pliku metryk');
  }
  
  const content = await fs.readFile(`./test-results/metrics/${latestFile}`, 'utf-8');
  const snapshot: MetricsSnapshot = JSON.parse(content);
  
  const result = evaluateQualityGate(snapshot);
  
  console.log('\n' + '═'.repeat(60));
  console.log('           QUALITY GATE EVALUATION');
  console.log('═'.repeat(60));
  
  for (const [key, m] of Object.entries(result.metrics)) {
    const icon = m.status === 'pass' ? '✅' : m.status === 'warn' ? '⚠️' : '❌';
    console.log(`${icon} ${key.padEnd(20)} ${m.actual} / ${m.threshold}`);
  }
  
  console.log('═'.repeat(60));
  
  if (result.blocked) {
    console.log('\n🔴 QUALITY GATE FAILED — Release BLOCKED');
    console.log('Blokujące kryteria:');
    result.blockedReasons.forEach(r => console.log(`  • ${r}`));
    process.exit(1);
  } else if (result.warnings.length > 0) {
    console.log('\n⚠️ QUALITY GATE PASSED with warnings');
    result.warnings.forEach(w => console.log(`  • ${w}`));
  } else {
    console.log('\n✅ QUALITY GATE PASSED');
  }
}
```

### Quality Gate w GitHub Actions

```yaml
# .github/workflows/quality-gate.yml
name: Quality Gate

on:
  workflow_run:
    workflow: Playwright Tests
    types: [completed]

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    if: github.event.workflow_run.conclusion == 'success'
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Run Quality Gate
        run: npx ts-node scripts/quality-gate.ts
        
      - name: Comment on PR
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## Quality Gate: ${needs.quality-gate.result} \n\n <!-- comment -->`
            })
```

### Escalation matrix — kto jest informowany przy którym statusie

```typescript
interface EscalationRule {
  condition: (result: GateResult) => boolean;
  notify: Array<{ channel: string; message: string }>;
  escalateAfter?: number; // minut
}

const escalationRules: EscalationRule[] = [
  {
    condition: r => r.blocked && r.blockedReasons.some(b => b.includes('criticalFailures')),
    notify: [
      { channel: '#qa-alerts', message: '🔴 CRITICAL: Quality gate blocked — critical failures' },
      { channel: 'pagerduty', message: 'P1: Critical test failures block release' },
    ],
    escalateAfter: 15,
  },
  {
    condition: r => r.warnings.length > 3,
    notify: [
      { channel: '#qa-team', message: '⚠️ Multiple warnings in quality gate' },
    ],
  },
  {
    condition: r => r.passed && r.warnings.length === 0,
    notify: [
      { channel: '#ci-success', message: '✅ Quality gate passed' },
    ],
  },
];
```

---

## Sekcja 3: Dashboardy podejmowania decyzji

### Zasada jednego panelu — jedno pytanie

Każdy panel na dashboardzie musi odpowiadać na konkretne pytanie. Jeśli nie wiesz, jakie pytanie, panel nie ma sensu.

| Panel | Pytanie | Typ wykresu | Odpowiedź |
|-------|---------|-------------|-----------|
| Release Readiness | Czy możemy wydać? | Gauge (0-100) | Numer + kolor |
| Pass Rate Trend | Czy jakość się poprawia? | Line (30 days) | Trend kierunku |
| Flaky by Module | Gdzie jest niestabilność? | Bar chart | Moduł z najwyższym flaky |
| Slowest Tests | Co spowalnia pipeline? | Table | Top 10 testów |
| New Failures | Co się zepsuło w tej wersji? | List | Lista testów + właściciel |
| Duration Trend | Czy testy przyspieszają? | Area chart | Trend P50/P95 |

### Dashboard w Grafana — kompletna konfiguracja

```json
{
  "title": "Playwright Quality Dashboard",
  "panels": [
    {
      "title": "Release Readiness",
      "type": "stat",
      "targets": [
        {
          "expr": "qa_pass_rate{job=\"playwright\"}",
          "legendFormat": "Pass Rate %"
        }
      ],
      "fieldConfig": {
        "defaults": {
          "mappings": [
            { "type": "range", "options": { "from": 0, "to": 89, "result": { "color": "red", "text": "BLOCK" } } },
            { "type": "range", "options": { "from": 90, "to": 94, "result": { "color": "orange", "text": "CAUTION" } } },
            { "type": "range", "options": { "from": 95, "to": 100, "result": { "color": "green", "text": "APPROVED" } } }
          ],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              { "value": 0, "color": "red" },
              { "value": 90, "color": "orange" },
              { "value": 95, "color": "green" }
            ]
          }
        }
      }
    },
    {
      "title": "Flaky Tests by Module",
      "type": "bargauge",
      "targets": [
        {
          "expr": "sum(qa_flaky_rate{job=\"playwright\"}) by (module)",
          "legendFormat": "{{module}}"
        }
      ],
      "options": {
        "displayMode": "gradient",
        "orientation": "horizontal"
      }
    },
    {
      "title": "Pass Rate Trend (30 days)",
      "type": "timeseries",
      "targets": [
        {
          "expr": "avg(qa_pass_rate{job=\"playwright\"}) by (branch)",
          "legendFormat": "{{branch}}"
        }
      ],
      "fieldConfig": {
        "defaults": {
          "thresholds": {
            "mode": "absolute",
            "steps": [
              { "value": null, "color": "red" },
              { "value": 95, "color": "green" }
            ]
          }
        }
      }
    }
  ],
  "templating": {
    "list": [
      {
        "name": "branch",
        "type": "query",
        "query": "label_values(qa_pass_rate, branch)"
      },
      {
        "name": "environment",
        "type": "query", 
        "query": "label_values(qa_pass_rate, env)"
      }
    ]
  }
}
```

---

## Sekcja 4: Email reports — automatyczne podsumowania

```typescript
interface EmailReportConfig {
  smtp: {
    host: string;
    port: number;
    auth: { user: string; pass: string };
  };
  recipients: {
    developers: string[];  // tylko przy failures
    qaLead: string;
    stakeholders: string[];  // tylko przy release gate
  };
  frequency: 'on-demand' | 'daily' | 'weekly';
}

async function sendEmailReport(
  summary: ExecutiveSummary,
  config: EmailReportConfig
): Promise<void> {
  const nodemailer = await import('nodemailer');
  
  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    auth: config.smtp.auth,
  });
  
  const statusColor = {
    'APPROVED': '#28a745',
    'CAUTION': '#ffc107',
    'BLOCKED': '#dc3545',
  }[summary.status];
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    .header { padding: 20px; background: ${statusColor}; color: white; border-radius: 8px; }
    .metrics { display: flex; gap: 20px; margin: 20px 0; }
    .metric { padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center; }
    .metric-value { font-size: 24px; font-weight: bold; }
    .metric-label { color: #6c757d; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6; }
    .risk-critical { color: #dc3545; font-weight: bold; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Release Readiness Report</h1>
    <p>Wersja: ${process.env.RELEASE_VERSION ?? 'dev'} | ${new Date().toLocaleDateString('pl-PL')}</p>
    <h2 style="margin: 0;">Status: ${summary.status} (${summary.releaseReadiness}% gotowości)</h2>
  </div>
  
  <div class="metrics">
    <div class="metric">
      <div class="metric-value">${summary.summary.passRate}%</div>
      <div class="metric-label">Pass Rate</div>
    </div>
    <div class="metric">
      <div class="metric-value">${summary.summary.flakyRate}%</div>
      <div class="metric-label">Flaky Rate</div>
    </div>
    <div class="metric">
      <div class="metric-value">${summary.summary.passed}/${summary.summary.totalTests}</div>
      <div class="metric-label">Passed</div>
    </div>
    <div class="metric">
      <div class="metric-value">${summary.summary.failed}</div>
      <div class="metric-label">Failed</div>
    </div>
  </div>
  
  ${summary.risks.length > 0 ? `
  <h3>Ryzyka</h3>
  <table>
    <tr><th>Severity</th><th>Obszar</th><th>Opis</th><th>Wpływ</th></tr>
    ${summary.risks.map(r => `
    <tr>
      <td class="risk-${r.severity}">${r.severity.toUpperCase()}</td>
      <td>${r.area}</td>
      <td>${r.description}</td>
      <td>${r.impact}</td>
    </tr>`).join('')}
  </table>` : ''}
  
  <div class="footer">
    <p><strong>Rekomendacja:</strong> ${summary.recommendation}</p>
    <p>📊 <a href="${summary.reportUrl}">Pełny raport HTML</a> | 🔍 <a href="${summary.reportUrl}/trace">Trace Viewer</a></p>
    <p>Wygenerowano automatycznie przez Playwright Quality Reporter</p>
  </div>
</body>
</html>
  `.trim();
  
  const recipients = summary.status === 'BLOCKED' || summary.status === 'CAUTION'
    ? [...config.recipients.developers, config.recipients.qaLead]
    : [config.recipients.stakeholders[0]];
  
  await transporter.sendMail({
    from: '"Playwright QA Reporter" <qa-reporter@example.com>',
    to: recipients.join(', '),
    subject: `[${summary.status}] Release Readiness — v${process.env.RELEASE_VERSION ?? 'dev'}`,
    html,
  });
  
  console.log(`[EmailReporter] Wysłano raport do ${recipients.length} odbiorców.`);
}
```

---

## Sekcja 5: Pułapki wielopoziomowego raportowania

### Pułapka 1: Wszyscy dostają ten sam raport

Developerzy toną w emailach od PM, PM nie rozumie stack trace'y w Slacku. Solution: jasno zdefiniuj, kto dostaje co i kiedy. Automatyzuj routing na podstawie typu wyniku (failure vs. success) i severity.

### Pułapka 2: Dashboard bez akcji

Dashboard z 20 wykresami, z których żaden nie prowadzi do działania. Solution: każdy panel ma przypisaną osobę odpowiedzialną i termin reakcji.

### Pułapka 3: Quality gate bez kontekstu

Quality gate blokuje pipeline z błędem "flaky rate 4%", ale nikt nie wie, co z tym zrobić. Solution: quality gate zawsze pokazuje kontekst: które testy, dlaczego flaky, link do analizy.

### Pułapka 4: Raport executive bez linku do danych

Summary mówi "release readiness 87%", ale nie ma linku do danych źródłowych. Solution: każdy executive summary zawiera link do Grafany lub HTML reporta.

---

## Perspektywa Full Stack Testera

Wielopoziomowe raportowanie to most między technicznym detailem a biznesową decyzją. Jako Full Stack Tester pełnisz rolę architecta informacji:

- **Developer** dostaje trace — szybka diagnoza, szybka naprawa
- **QA Lead** dostaje metryki — strategiczna alokacja czasu, proactive improvement
- **Product Owner** dostaje decision — release/go/no-go z uzasadnieniem

Najlepsze zespoły, które widziałem, mają "report contract" — zdefiniowane formaty, częstotliwości i odbiorców dla każdego typu raportu. Report contract jest częścią Definition of Done: każdy nowy moduł testowy musi mieć przypisany poziom raportowania i właściciela.

Quality gates zamieniają "testy przeszły" w "produkt jest gotowy do release". To shift left dla decyzji jakościowych — zamiast czekać na review spot, automatyczna bramka blokuje release, gdy kryteria nie są spełnione.

---

## Podsumowanie

- **Piramida informacji** — od trace'a dla developera po executive summary dla stakeholderów. Każdy poziom odpowiada na inne pytanie.
- **Trzy poziomy raportowania**: Developer (trace + artefakty), QA Lead (metryki + trendy), PO/Manager (decision-ready summary).
- **Quality Gates** automatyzują release decisions. Konfiguracja w JSON, ewaluacja po testach, block/warn w CI.
- **Dashboard w Grafanie** — każdy panel = jedno pytanie + osoba odpowiedzialna + termin reakcji.
- **Smart alerts** — tylko przy odchyleniach, z kontekstem i linkami do artefaktów, z escalation matrix.
- **Email reports** — format HTML dla stakeholderów, auto-routing na podstawie statusu i severity.
- **Report contract** — zdefiniuj kto, co, kiedy dostaje. Automatyzuj routing. Egzekwuj w Definition of Done.

---

## Linki i źródła

- [Quality Gates in CI/CD — Atlassian](https://www.atlassian.com/continuous-delivery/principles/quality-gates) — koncepcja quality gates w kontekście CI/CD
- [Grafana Dashboards — Best Practices](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/best-practices/) — projektowanie dashboardów podejmowania decyzji
- [PagerDuty — Alerting best practices](https://developer.pagerduty.com/docsguides/best-practices) — escalation matrix i smart alerting
- [Email HTML Templates — Litmus](https://www.litmus.com/resources/email-template-design-best-practices/) — projektowanie email reports w HTML
- [GitHub Actions — Workflow triggers](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#workflow_run) — orchestracja pipeline z workflow_run trigger
- [Prometheus Alerting Rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/) — definicja alertów w Prometheus dla quality metrics

## 📘 Suplement Inżynieryjny 2026: Raportowanie i Analityka
*Inspiracja: „Practical Playwright Test” (2026), Chapter 6*
*   **Raporty dla Biznesu**: Dobry raport to nie tylko statystyka "passed/failed". Używaj zaawansowanych reporterów (np. Monocart) i dołączaj bogate załączniki za pomocą `testInfo.attach()` w fazie teardownu.
*   **Oznaczanie znanych błędów**: Korzystaj z adnotacji testowych (np. `test.info().annotations.push(...)`), aby powiązać błędy w testach z otwartymi zgłoszeniami w systemach typu GitHub Issues lub Jira.
