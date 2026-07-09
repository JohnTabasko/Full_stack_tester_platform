# Niestandardowe reportery

> **Perspektywa Full Stack Testera**
> Każdy test, który nie dostarcza informacji pozwalającej podjąć decyzję, jest tylko kosztem operacyjnym. Niestandardowe reportery to nie gadżet — to most między wynikami testów a działaniami zespołu. Gdy developer wraca z来不及 (brak czasu) na bug fix, a manager pyta o ryzyko wydania, odpowiedź leży w raporcie, który zaprojektowałeś. Ta lekcja uczy, jak budować raportowanie, które prowadzi do decyzji, a nie tylko generuje pliki.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Zdefiniować odbiorcę i cel raportu** przed napisaniem pierwszej linii kodu reportera
- **Zaimplementować interfejs Reporter z Playwright** z obsługą wszystkich kluczowych zdarzeń lifecycle'u testów
- **Zintegrować webhooki Slack i Teams** z zachowaniem zasady "krótki alert + link do szczegółów"
- **Wygenerować raporty w formatach CSV, JSON i Markdown** dla różnych odbiorców i narzędzi
- **Unikać typowych pułapek** — nadmiaru danych w komunikatorach, braku kontekstu w alertach i raportów bez linków do artefaktów

---

## Wprowadzenie: dlaczego raportowanie jest krytyczne

Testy automatyczne bez raportowania to jak pager bez numeru alarmowego — sygnalizuje problem, ale nie kieruje do rozwiązania. W profesjonalnym pipeline'u CI/CD raportowanie pełni trzy funkcje:

1. **Diagnostyka** — developer musi szybko zrozumieć, co się zepsuło, na którym środowisku i dlaczego test się nie powiódł. Trace, screenshoty, logi i stack trace'y to podstawowe artefakty diagnostyczne.

2. **Podejmowanie decyzji** — lider QA i manager muszą ocenić ryzyko wydania. Czy 2% testów failed to stabilny wynik? Czy flaky rate rośnie? Czy regresja jest krytyczna? Odpowiedź wymaga metryk w kontekście historycznym.

3. **Compliance i audyt** — niektóre regulacje wymagają dokumentacji wyników testów. Raport staje się artefaktem jakościowym, który można dołączyć do release notes lub dokumentacji wymagań.

Zasada numer jeden: **raport ma prowadzić do działania**. Jeśli po przeczytaniu raportu nikt nie wie, co zrobić, raport jest bezużyteczny — nawet jeśli wygląda profesjonalnie.

---

## Sekcja 1: Interfejs Reporter w Playwright

### Architektura reportera

Playwright oferuje rozbudowany interfejs `Reporter`, który pozwala reagować na zdarzenia podczas wykonywania testów. Reporter jest instancją klasy implementującej określone metody — każda z nich odpowiada konkretnemu momentowi w lifecycle'ie testu:

| Metoda | Moment wywołania | Typowy przypadek użycia |
|--------|-----------------|------------------------|
| `onBegin(config, suite)` | Przed pierwszym testem | Inicjalizacja liczników, ustawienie timestamp startu |
| `onTestBegin(test)` | Przed każdym testem | Rezerwacja zasobów, logowanie startu |
| `onTestEnd(test, result)` | Po każdym teście | Zbieranie metryk, archiwizacja wyników |
| `onStepEnd(test, result, step)` | Po każdym kroku | Szczegółowe logowanie, timing kroków |
| `onError(error)` | Przy błędzie krytycznym | Wysłanie alertu, zatrzymanie diagnostyki |
| `onEnd(result)` | Po wszystkich testach | Generowanie raportu końcowego |
| `onExit(finalOutput)` | Po zakończeniu procesu | Cleanup, publikacja artefaktów |

Reporter nie modyfikuje logiki testów — jego rolą jest obserwacja i reakcja. To kluczowa zasada projektowa: reporter towarzyszy testom, ale nie ingeruje w ich przebieg.

### Implementacja podstawowego reportera

```typescript
import type { 
  Reporter, 
  FullResult, 
  TestCase, 
  TestResult,
  Suite,
  Config
} from '@playwright/test/reporter';

interface TestMetrics {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  duration: number;
}

interface FailedTestInfo {
  title: string;
  location: string;
  error: string;
  retry: number;
  attachments: string[];
}

export class QualityReporter implements Reporter {
  private metrics: TestMetrics = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    flaky: 0,
    duration: 0,
  };
  
  private failedTests: FailedTestInfo[] = [];
  private testStartTime: Date | null = null;
  private config: Config | null = null;
  
  onBegin(config: Config, suite: Suite): void {
    this.config = config;
    this.testStartTime = new Date();
    console.log(`[QualityReporter] Rozpoczęto: ${suite.allTests().length} testów`);
    console.log(`[QualityReporter] Środowisko: ${config.projects[0]?.name ?? 'domyślne'}`);
  }
  
  onTestBegin(test: TestCase): void {
    this.metrics.total++;
    console.log(`[QualityReporter] ▶ ${test.titlePath().join(' › ')}`);
  }
  
  onTestEnd(test: TestCase, result: TestResult): void {
    const titlePath = test.titlePath().join(' › ');
    
    switch (result.status) {
      case 'passed':
        this.metrics.passed++;
        if (result.status === 'passed' && result.retries > 0) {
          this.metrics.flaky++;
          console.log(`[QualityReporter] ⚠️ Flaky: ${titlePath} (retry: ${result.retries})`);
        }
        break;
      case 'failed':
        this.metrics.failed++;
        this.failedTests.push({
          title: titlePath,
          location: test.location.file,
          error: result.error?.message ?? 'nieznany błąd',
          retry: result.retries,
          attachments: this.extractAttachments(result),
        });
        break;
      case 'skipped':
        this.metrics.skipped++;
        break;
    }
    
    this.metrics.duration += result.duration;
    console.log(`[QualityReporter] ${this.getStatusIcon(result.status)} ${titlePath} (${result.duration}ms)`);
  }
  
  onError(error: Error): void {
    console.error('[QualityReporter] 🔴 Błąd krytyczny:', error.message);
    console.error('[QualityReporter] Stack:', error.stack);
  }
  
  async onEnd(result: FullResult): Promise<void> {
    const endTime = new Date();
    const totalDuration = this.testStartTime 
      ? endTime.getTime() - this.testStartTime.getTime() 
      : 0;
    
    const summary = this.buildSummary(totalDuration);
    console.log('\n' + summary);
    
    await this.exportResults();
  }
  
  private getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      passed: '✅',
      failed: '❌',
      skipped: '⏭️',
      timedOut: '⏱️',
    };
    return icons[status] ?? '❓';
  }
  
  private extractAttachments(result: TestResult): string[] {
    const attachments: string[] = [];
    if (result.attachments) {
      for (const attachment of result.attachments) {
        if (attachment.path) {
          attachments.push(attachment.path);
        }
      }
    }
    return attachments;
  }
  
  private buildSummary(totalDuration: number): string {
    const passRate = this.metrics.total > 0 
      ? ((this.metrics.passed / this.metrics.total) * 100).toFixed(1) 
      : '0.0';
    const flakyRate = this.metrics.total > 0 
      ? ((this.metrics.flaky / this.metrics.total) * 100).toFixed(1) 
      : '0.0';
    
    return `
╔══════════════════════════════════════════════════════╗
║              JAKOŚĆ TESTÓW — PODSUMOWANIE             ║
╠══════════════════════════════════════════════════════╣
║  Status:     ${result.status.padEnd(42)}║
║  Total:      ${String(this.metrics.total).padEnd(42)}║
║  ✅ Passed:  ${String(this.metrics.passed).padEnd(42)}║
║  ❌ Failed:  ${String(this.metrics.failed).padEnd(42)}║
║  ⏭️ Skipped: ${String(this.metrics.skipped).padEnd(42)}║
║  ⚠️ Flaky:   ${String(this.metrics.flaky).padEnd(42)}║
║  Pass rate:  ${(passRate + '%').padEnd(42)}║
║  Flaky rate: ${(flakyRate + '%').padEnd(42)}║
║  Duration:   ${(totalDuration + 'ms').padEnd(42)}║
╚══════════════════════════════════════════════════════╝`;
  }
  
  private async exportResults(): Promise<void> {
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: this.metrics,
      failedTests: this.failedTests,
      environment: this.config?.projects[0]?.name ?? 'unknown',
    };
    
    // Eksport do pliku JSON dla późniejszej analizy
    const fs = await import('fs/promises');
    const path = await import('path');
    const outputDir = './test-results';
    
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(
      path.join(outputDir, 'quality-report.json'),
      JSON.stringify(reportData, null, 2)
    );
    
    console.log(`[QualityReporter] Raport zapisany: ${outputDir}/quality-report.json`);
  }
}

export default QualityReporter;
```

Powyższy reporter zbiera metryki w trakcie przebiegu i generuje podsumowanie w formacie ASCII box na końcu. Ważne elementy:

- **Zliczanie flaky tests** — test, który przeszedł po retry, jest oznaczany jako flaky. To fundamentalna metryka zdrowia suite'u.
- **Ścieżka testu jako tytuł** — `test.titlePath()` zwraca tablicę, którą łączymy separatorem `›` dla czytelnej hierarchii.
- **Załączniki z failed testów** — reporter ekstrahuje ścieżki do screenshotów, video i trace'ów, aby można je było dołączyć do raportu.

### Rejestracja reportera w konfiguracji

Reporter definiujemy w pliku `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';
import { QualityReporter } from './reporters/quality-reporter';

export default defineConfig({
  testDir: './tests',
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    [QualityReporter, { 
      outputDir: './test-results',
      verbose: true,
    }],
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

Playwright pozwala na kombinację reporterów — w powyższym przykładzie uruchamiamy jednocześnie HTML (dla ludzi), list (dla CI output) i QualityReporter (dla własnej logiki). Kolejność ma znaczenie przy agregacji wyników.

---

## Sekcja 2: Integracje z Slack i Teams

### Zasady projektowania alertów

Komunikatory teamowe to real-time feedback loop. Jednak nadmiar powiadomień prowadzi do ignores — zespół przestaje czytać alerty, bo co piąty commit generuje powiadomienie. Projektując alert do Slacka lub Teams, stosuj trzy zasady:

1. **Alert ≠ raport** — komunikator pokazuje informację wstępną. Raport z pełnymi detalami żyje w HTML/JSON/trace viewerze. Link do raportu jest obowiązkowy.

2. **Krótkość i kontekst** — treść alertu powinna dać się przeczytać w 5 sekund. Właściciel, środowisko, zakres awarii, akcja — tyle maksymalnie.

3. **Actionable** — alert bez next step to szum. Jeśli alarm mówi "testy się wywaliły", to kto ma to naprawić i do kiedy?

### Implementacja webhooku Slack

```typescript
import type { FullResult, TestCase, TestResult } from '@playwright/test/reporter';

interface SlackAlertConfig {
  webhookUrl: string;
  channel: string;
  reportBaseUrl: string;
  owners: Record<string, string>; // test pattern → Slack user mention
}

interface AlertPayload {
  text: string;
  blocks: Array<{
    type: string;
    text?: { type: string; text: string };
    elements?: Array<{ type: string; text?: string; url?: string }>;
  }>;
}

export class SlackReporter implements Reporter {
  private config: SlackAlertConfig;
  private failedTests: Array<{ test: TestCase; result: TestResult }> = [];
  private totalTests = 0;
  private passedTests = 0;
  
  constructor(config: SlackAlertConfig) {
    this.config = config;
  }
  
  onTestEnd(test: TestCase, result: TestResult): void {
    this.totalTests++;
    
    if (result.status === 'passed') {
      this.passedTests++;
      return;
    }
    
    this.failedTests.push({ test, result });
  }
  
  async onEnd(result: FullResult): Promise<void> {
    // Alert wysyłamy tylko przy niepowodzeniu pipeline'u
    if (result.status === 'passed') {
      console.log('[SlackReporter] Wszystko zielone — brak alertu.');
      return;
    }
    
    const payload = this.buildSlackPayload(result);
    await this.sendWebhook(payload);
  }
  
  private buildSlackPayload(result: FullResult): AlertPayload {
    const passRate = ((this.passedTests / this.totalTests) * 100).toFixed(1);
    const failedCount = this.failedTests.length;
    
    // Określamy właściciela na podstawie pierwszego failed testu
    const primaryOwner = this.determineOwner(this.failedTests[0]?.test);
    
    const blocks: AlertPayload['blocks'] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🚨 Regresja wykryta w pipeline\'zie CI',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Środowisko:* \`${process.env.DEPLOY_ENV ?? 'staging'}\`\n`
              + `*Branch:* \`${process.env.GIT_BRANCH ?? 'unknown'}\`\n`
              + `*Właściciel:* ${primaryOwner}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Wynik:* ${failedCount} failed / ${this.totalTests} total (${passRate}% pass rate)\n`
              + `*Przypadki:* ${this.formatFailedTests()}`,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '📊 Otwórz raport' },
            url: `${this.config.reportBaseUrl}/${process.env.GIT_BRANCH ?? 'latest'}`,
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: '🔍 Trace Viewer' },
            url: `${this.config.reportBaseUrl}/trace?path=${this.failedTests[0]?.result?.attachments?.[0]?.path ?? ''}`,
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Pipeline: ${process.env.GITHUB_RUN_ID ?? 'local'} | Commit: ${process.env.GIT_COMMIT?.substring(0, 7) ?? 'n/a'}`,
          },
        ],
      },
    ];
    
    return { text: `Regresja: ${failedCount} failed, ${passRate}% pass rate`, blocks };
  }
  
  private determineOwner(test?: TestCase): string {
    if (!test || !this.config.owners) {
      return '@qa-team';
    }
    
    const title = test.title.toLowerCase();
    
    for (const [pattern, owner] of Object.entries(this.config.owners)) {
      if (title.includes(pattern.toLowerCase())) {
        return owner;
      }
    }
    
    return '@qa-team';
  }
  
  private formatFailedTests(): string {
    return this.failedTests
      .slice(0, 5)
      .map(({ test, result }) => {
        const retry = result.retries > 0 ? ` (retry: ${result.retries})` : '';
        return `• \`${test.title}\`${retry}`;
      })
      .join('\n') + (this.failedTests.length > 5 ? `\n• ... i ${this.failedTests.length - 5} więcej` : '');
  }
  
  private async sendWebhook(payload: AlertPayload): Promise<void> {
    try {
      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        console.error(`[SlackReporter] Błąd wysyłki: ${response.status} ${response.statusText}`);
      } else {
        console.log('[SlackReporter] Alert wysłany do Slacka.');
      }
    } catch (error) {
      console.error('[SlackReporter] Błąd połączenia z Slackiem:', error);
    }
  }
}
```

Kluczowe decyzje projektowe w tym reporterze:

- **Właściciel na podstawie wzorca** — system mapuje testy na konkretne osoby na podstawie nazwy testu. Test z "checkout" w tytule trafia do zespołu e-commerce, test z "api" — do zespołu integracji.
- **Tylko niepowodzenia generują alert** — sukces nie powinien być komunikowany przez Slack. Zespół i tak widzi zielone CI.
- **Limit 5 failed testów w wiadomości** — reszta jest w raporcie. Wiadomość musi być czytelna na telefonie.

### Microsoft Teams — webhook adaptive card

Teams wymaga innego formatu payloadu. Zamiast Block Kit (Slack) używamy Adaptive Cards:

```typescript
interface TeamsCardPayload {
  type: 'message';
  attachments: Array<{
    contentType: string;
    content: {
      type: string;
      body: Array<Record<string, unknown>>;
      actions?: Array<{
        type: string;
        title: string;
        url: string;
      }>;
    };
  }>;
}

export class TeamsReporter implements Reporter {
  private webhookUrl: string;
  private failedCount = 0;
  
  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }
  
  onTestEnd(test: TestCase, result: TestResult): void {
    if (result.status !== 'passed') {
      this.failedCount++;
    }
  }
  
  async onEnd(result: FullResult): Promise<void> {
    if (result.status === 'passed') return;
    
    const card = this.buildAdaptiveCard(result);
    
    await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card),
    });
  }
  
  private buildAdaptiveCard(result: FullResult): TeamsCardPayload {
    return {
      type: 'message',
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: {
            type: 'AdaptiveCard',
            body: [
              {
                type: 'TextBlock',
                size: 'Large',
                weight: 'Bolder',
                text: '🔴 Regresja testów — Action Required',
                color: 'Attention',
              },
              {
                type: 'FactSet',
                facts: [
                  { title: 'Środowisko', value: process.env.DEPLOY_ENV ?? 'staging' },
                  { title: 'Branch', value: process.env.GIT_BRANCH ?? 'unknown' },
                  { title: 'Failed', value: String(this.failedCount) },
                  { title: 'Status', value: result.status },
                ],
              },
              {
                type: 'TextBlock',
                text: `Pipeline ID: ${process.env.GITHUB_RUN_ID ?? 'local'}`,
                isSubtle: true,
              },
            ],
            actions: [
              {
                type: 'Action.OpenUrl',
                title: '📊 Raport HTML',
                url: `${process.env.REPORT_URL}/index.html`,
              },
              {
                type: 'Action.OpenUrl',
                title: '🔍 Trace Viewer',
                url: `${process.env.REPORT_URL}/trace/`,
              },
            ],
            $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
            version: '1.4',
          },
        },
      ],
    };
  }
}
```

---

## Sekcja 3: Generowanie raportów w formatach maszynowych

### CSV — dla analizy w arkuszach kalkulacyjnych

CSV to format uniwersalny — otworzysz go w Excelu, Google Sheets, tableau Public, czy w Python/Pandas. Dla zespołów, które wolą analizować metryki poza dedykowanymi dashboardami, CSV jest idealny:

```typescript
import type { Reporter, FullResult, TestCase, TestResult } from '@playwright/test/reporter';
import * as fs from 'fs/promises';
import * as path from 'path';

export class CsvReporter implements Reporter {
  private rows: string[] = [];
  private headersWritten = false;
  private outputPath: string;
  
  constructor(outputPath: string) {
    this.outputPath = outputPath;
    this.writeHeader();
  }
  
  private writeHeader(): void {
    const header = [
      'timestamp',
      'test_name',
      'suite',
      'status',
      'duration_ms',
      'retries',
      'error_message',
      'file_path',
      'tags',
      'project',
    ].join(',');
    
    this.rows.push(header);
    this.headersWritten = true;
  }
  
  onTestEnd(test: TestCase, result: TestResult): void {
    const row = [
      new Date().toISOString(),
      this.escapeCsv(test.title),
      this.escapeCsv(test.parent?.title ?? 'unknown'),
      result.status,
      result.duration,
      result.retries,
      this.escapeCsv(result.error?.message ?? ''),
      test.location.file,
      this.escapeCsv(test.tags.join(';')),
      test.project().name,
    ].join(',');
    
    this.rows.push(row);
  }
  
  async onEnd(result: FullResult): Promise<void> {
    await fs.mkdir(path.dirname(this.outputPath), { recursive: true });
    await fs.writeFile(this.outputPath, this.rows.join('\n'), 'utf-8');
    console.log(`[CsvReporter] Zapisano: ${this.outputPath} (${this.rows.length - 1} wierszy)`);
  }
  
  private escapeCsv(value: string): string {
    // CSV wymaga escaping-u cudzysłowów i przecinków
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
```

Reporter CSV jest szczególnie przydatny przy budowie własnych metryk — możesz go zaimportować do narzędzi BI, stworzyć własny dashboard w Grafanie lub przeanalizować trendy w Pythonie.

### JSON — dla pipeline'ów i API

Format JSON jest naturalnym wyborem dla systemów programistycznych — łatwo go parsować, transformować i przekazywać między usługami:

```typescript
import type { Reporter, FullResult, TestCase, TestResult, Config, Suite } from '@playwright/test/reporter';

interface TestResultJson {
  id: string;
  title: string;
  fullTitle: string;
  suite: string;
  status: 'passed' | 'failed' | 'skipped' | 'timedOut';
  duration: number;
  retries: number;
  error?: {
    message: string;
    stack?: string;
    location?: { file: string; line: number; column: number };
  };
  attachments: Array<{
    name: string;
    type: string;
    path?: string;
  }>;
  tags: string[];
  parameters: Record<string, string>;
}

interface SuiteJson {
  name: string;
  tests: TestResultJson[];
  duration: number;
}

interface ReportJson {
  version: string;
  generatedAt: string;
  duration: number;
  status: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    timedOut: number;
  };
  metrics: {
    passRate: number;
    flakyRate: number;
    avgDuration: number;
    p95Duration: number;
    p99Duration: number;
  };
  suites: SuiteJson[];
  environment: {
    project: string;
    browser: string;
    headless: boolean;
  };
}

export class JsonReporter implements Reporter {
  private config: Config | null = null;
  private suite: Suite | null = null;
  private testResults: TestResultJson[] = [];
  private startTime: number = 0;
  
  onBegin(config: Config, suite: Suite): void {
    this.config = config;
    this.suite = suite;
    this.startTime = Date.now();
  }
  
  onTestEnd(test: TestCase, result: TestResult): void {
    this.testResults.push({
      id: test.id,
      title: test.title,
      fullTitle: test.titlePath().join(' › '),
      suite: test.parent?.title ?? 'root',
      status: result.status as TestResultJson['status'],
      duration: result.duration,
      retries: result.retries,
      error: result.error ? {
        message: result.error.message,
        stack: result.error.stack,
        location: result.error.location,
      } : undefined,
      attachments: (result.attachments ?? []).map(a => ({
        name: a.name,
        type: a.contentType,
        path: a.path,
      })),
      tags: test.tags,
      parameters: test.parameters,
    });
  }
  
  async onEnd(result: FullResult): Promise<void> {
    const duration = Date.now() - this.startTime;
    const report = this.buildReport(result, duration);
    
    const fs = await import('fs/promises');
    const p = await import('path');
    
    const outputDir = './test-results';
    await fs.mkdir(outputDir, { recursive: true });
    
    const filePath = p.join(outputDir, 'results.json');
    await fs.writeFile(filePath, JSON.stringify(report, null, 2));
    
    console.log(`[JsonReporter] Raport JSON: ${filePath}`);
  }
  
  private buildReport(result: FullResult, duration: number): ReportJson {
    const durations = this.testResults.map(t => t.duration).sort((a, b) => a - b);
    
    const total = this.testResults.length;
    const passed = this.testResults.filter(t => t.status === 'passed').length;
    const failed = this.testResults.filter(t => t.status === 'failed').length;
    const skipped = this.testResults.filter(t => t.status === 'skipped').length;
    const timedOut = this.testResults.filter(t => t.status === 'timedOut').length;
    const flaky = this.testResults.filter(t => t.status === 'passed' && t.retries > 0).length;
    
    const calculatePercentile = (arr: number[], p: number): number => {
      const index = Math.ceil((p / 100) * arr.length) - 1;
      return arr[Math.max(0, index)];
    };
    
    return {
      version: '1.0',
      generatedAt: new Date().toISOString(),
      duration,
      status: result.status,
      summary: { total, passed, failed, skipped, timedOut },
      metrics: {
        passRate: total > 0 ? (passed / total) * 100 : 0,
        flakyRate: total > 0 ? (flaky / total) * 100 : 0,
        avgDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
        p95Duration: calculatePercentile(durations, 95),
        p99Duration: calculatePercentile(durations, 99),
      },
      suites: this.groupBySuite(),
      environment: {
        project: this.config?.projects[0]?.name ?? 'default',
        browser: this.config?.projects[0]?.use?.browserName ?? 'unknown',
        headless: this.config?.projects[0]?.use?.headless ?? true,
      },
    };
  }
  
  private groupBySuite(): SuiteJson[] {
    const groups = new Map<string, TestResultJson[]>();
    
    for (const test of this.testResults) {
      const suite = test.suite;
      if (!groups.has(suite)) {
        groups.set(suite, []);
      }
      groups.get(suite)!.push(test);
    }
    
    return Array.from(groups.entries()).map(([name, tests]) => ({
      name,
      tests,
      duration: tests.reduce((sum, t) => sum + t.duration, 0),
    }));
  }
}

export default JsonReporter;
```

Ten reporter generuje pełny raport JSON z obliczonymi metrykami percentylowymi (p95, p99), co jest nieocenione przy analizie wydajności testów. Raport można następnie:

- Zaimportować do Elasticsearch/Kibana
- Wykorzystać w pipeline'ach CI do warunków bramek jakościowych
- Przesłać do zewnętrznego systemu test management
- Zachować jako snapshot historyczny

### Markdown — dla pull requestów i dokumentacji

Markdown to format idealny do osadzania w PR descriptions, Confluence, Notion czy README:

```typescript
import type { Reporter, FullResult, TestCase, TestResult } from '@playwright/test/reporter';

export class MarkdownReporter implements Reporter {
  private results: Array<{ test: TestCase; result: TestResult }> = [];
  
  onTestEnd(test: TestCase, result: TestResult): void {
    this.results.push({ test, result });
  }
  
  async onEnd(result: FullResult): Promise<void> {
    const markdown = this.generateMarkdown(result);
    
    const fs = await import('fs/promises');
    await fs.writeFile('./test-results/report.md', markdown);
    console.log('[MarkdownReporter] Raport Markdown: ./test-results/report.md');
  }
  
  private generateMarkdown(result: FullResult): string {
    const passed = this.results.filter(r => r.result.status === 'passed');
    const failed = this.results.filter(r => r.result.status === 'failed');
    const skipped = this.results.filter(r => r.result.status === 'skipped');
    const flaky = passed.filter(r => r.result.retries > 0);
    
    const passRate = ((passed.length / this.results.length) * 100).toFixed(1);
    
    return `# 📋 Raport testów — ${new Date().toLocaleDateString('pl-PL')}

## Podsumowanie

| Metryka | Wartość |
|---------|---------|
| Status | ${result.status === 'passed' ? '✅ Passed' : '❌ Failed'} |
| Passed | ${passed.length} |
| Failed | ${failed.length} |
| Skipped | ${skipped.length} |
| Flaky | ${flaky.length} |
| Pass rate | ${passRate}% |

${result.status !== 'passed' ? this.renderFailedSection(failed) : ''}
${flaky.length > 0 ? this.renderFlakySection(flaky) : ''}

## Szczegóły wszystkich testów

| Test | Status | Czas (ms) | Retry |
|------|--------|-----------|-------|
${this.results.map(r => {
  const icon = r.result.status === 'passed' ? '✅' : r.result.status === 'failed' ? '❌' : '⏭️';
  const title = r.test.title.length > 60 ? r.test.title.substring(0, 60) + '...' : r.test.title;
  return `| ${title} | ${icon} | ${r.result.duration} | ${r.result.retries} |`;
}).join('\n')}

---
*Wygenerowano automatycznie przez Playwright MarkdownReporter*
`;
  }
  
  private renderFailedSection(failed: Array<{ test: TestCase; result: TestResult }>): string {
    return `## ❌ Failed tests

${failed.map(({ test, result }) => `
### ${test.title}

\`\`\`
${result.error?.message ?? 'nieznany błąd'}
\`\`\`

- Plik: \`${test.location.file}:${test.location.line}\`
- Retry: ${result.retries}

`).join('\n---\n')}`;
  }
  
  private renderFlakySection(flaky: Array<{ test: TestCase; result: TestResult }>): string {
    return `## ⚠️ Flaky tests

${flaky.map(({ test, result }) => `- \`${test.title}\` (retry: ${result.retries})`).join('\n')}

> Testy flaky to testy, które przeszły po ponownym uruchomieniu. Wymagają analizy przyczyny niestabilności.
`;
  }
}

export default MarkdownReporter;
```

---

## Sekcja 4: Wiele formatów jednocześnie i architektura reporters

### Łączenie reporterów

Playwright pozwala na wiele reporterów równolegle. Typowa konfiguracja dla dojrzałego pipeline'u:

```typescript
import { defineConfig } from '@playwright/test';
import { QualityReporter } from './reporters/quality-reporter';
import { SlackReporter } from './reporters/slack-reporter';
import { JsonReporter } from './reporters/json-reporter';
import { MarkdownReporter } from './reporters/markdown-reporter';

export default defineConfig({
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    [JsonReporter, { outputPath: './test-results/results.json' }],
    [MarkdownReporter],
    [QualityReporter, { verbose: true }],
    process.env.CI ? [SlackReporter, { webhookUrl: process.env.SLACK_WEBHOOK_URL! }] : [],
  ],
});
```

W CI uruchamiamy wszystkie reportery, w lokalnym developmentzie pomijamy Slacka. To klasyczny wzorzec konfiguracyjny.

### Strategia wyboru formatu

| Format | Odbiorca | Narzędzia | Zalety |
|--------|----------|-----------|--------|
| HTML | Developer, QA | Przeglądarka | Trace viewer, screenshoty, interaktywność |
| JSON | Pipeline CI/CD, API | Jenkins, GitHub Actions | Automatyzacja, quality gates, analityka |
| JUnit XML | CI system, tools | TeamCity, Azure DevOps | Wsparcie native, history w UI |
| CSV | Analitycy, BI | Excel, Tableau, Python | Eksport, custom dashboards |
| Markdown | PR reviewers, PM | GitHub, Confluence | Embedded w dokumentacji |
| Slack/Teams | Zespół dev | Komunikator | Real-time, action-oriented |

---

## Sekcja 5: Koszt utrzymania i pułapki

### Typowe błędy w projektowaniu reporterów

**Błąd 1: Reporter zaśmiecający CI output**

Jeśli reporter pisze `console.log` dla każdego testu, output CI staje się nieczytelny. Solution: używaj `console.log` tylko dla podsumowań i błędów krytycznych, nie dla każdego testu.

**Błąd 2: Alert bez linku do artefaktów**

Team dostaje "testy failed" bez screenshotu, trace'a ani linku do raportu. Developer musi ręcznie szukać informacji. Solution: każdy alert zawiera bezpośredni link do trace viewera lub HTML reporta.

**Błąd 3: Raport JSON bez walidacji schematu**

Jeśli raport JSON ma zły format, pipeline, który go konsumuje, pada bez komunikatu. Solution: waliduj schemat JSON w reporterze i w consumerze.

**Błąd 4: Brak warstwowania — wszystko w jednym reporterze**

Jeden reporter robi Slacka, CSV, HTML i analitykę. Gdy trzeba zmienić format Slacka, zmieniasz cały reporter. Solution: separated concerns — osobne reportery dla każdego kanału.

**Błąd 5: Nadmiar danych w komunikatorze**

Slack message zawiera pełny stack trace, 50 failed testów i screenshoty inline. Nikt tego nie czyta. Solution: maksymalnie 5-7 failed testów w wiadomości, pełne logi w raporcie HTML/JSON.

### Maintenance — reporter to kod produkcyjny

Niestandardowy reporter podlega tym samym regułom co kod produkcyjny:

- **Wersjonowanie** — zmiany w reporterze wymagają review i changelogu
- **Testowanie** — reporter powinien mieć własne testy, szczególnie logika parsowania i formatowania
- **Deprecation tracking** — przy aktualizacji Playwrighta sprawdzaj, czy interfejs Reporter się nie zmienił
- **Secrets management** — webhooki do Slacka/Teams to secrets, nie hardcoduj ich w kodzie

```typescript
// Dobra praktyka: konfiguracja przez zmienne środowiskowe
const webhookUrl = process.env.SLACK_WEBHOOK_URL;
if (!webhookUrl) {
  throw new Error('SLACK_WEBHOOK_URL environment variable is required');
}
```

---

## Perspektywa Full Stack Testera

Niestandardowe reportery to punkt, w którym test automation spotyka się z inżynierią oprogramowania w pełnym tego słowa znaczeniu. Jako Full Stack Tester projektujesz system informacyjny: zbierasz dane, transformujesz je, dostarczasz właściwemu odbiorcy w momencie, gdy może podjąć decyzję.

Najlepsi testerzy automatyczni, których spotkałem, traktują raportowanie jako pierwszą klasę citizen — tak samo ważną jak sam test. Bo test bez raportu to rozmowa bez odpowiedzi: pyta, ale nie informuje.

Zbuduj raportowanie, które:
- Dostarcza kontekst w ciągu 5 sekund (alert)
- Pozwala drążyć szczegóły (HTML/JSON)
- Zasila metryki historyczne (CSV/database)
- Wspiera decyzję o release (quality gate)

Wtedy testy przestają być tylko kosztem operacyjnym — stają się źródłem wiedzy o jakości systemu.

---

## Podsumowanie

- **Interfejs Reporter** w Playwright oferuje pełny lifecycle — od `onBegin` do `onExit`. Każda metoda reprezentuje konkretny moment, który możesz wykorzystać.
- **Slack i Teams webhooks** wymagają krótkich, actionable wiadomości z linkami do artefaktów. Pełne logi żyją w raporcie, nie w komunikatorze.
- **Formaty maszynowe** (JSON, CSV) są dla pipeline'ów i analityki. Formaty ludzkie (HTML, Markdown) są dla debugowania i dokumentacji.
- **Separated concerns** — osobne reportery dla każdego kanału. Łącz je w konfiguracji, nie w kodzie.
- **Reporter to kod produkcyjny** — wymaga wersjonowania, testów i zarządzania secrets.

---

## Linki i źródła

- [Playwright Test Reporters — dokumentacja oficjalna](https://playwright.dev/docs/test-reporters) — interfejs Reporter, metody lifecycle'u, przykłady wbudowanych reporterów
- [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer) — podstawowy artefakt diagnostyczny, który każdy reporter powinien linkować
- [Slack Block Kit Builder](https://app.slack.com/block-kit-builder/) — narzędzie do wizualizacji i prototypowania payloadów Slack
- [Adaptive Cards — Microsoft](https://adaptivecards.io/) — specyfikacja i narzędzia do budowy kart dla Teams
- [JUnit XML Format Specification](https://llg.cubic.org/docs/junit/) — standardowy format maszynowy dla systemów CI
- [GitHub Actions — Publishing workflow artifacts](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions) — jak bezpiecznie zarządzać webhook URLs jako secrets w CI