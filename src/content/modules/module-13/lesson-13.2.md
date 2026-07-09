# Testowanie wydajności aplikacji

> **Perspektywa Full Stack Testera**
> Dwa pytania, które CI/CD musi zadawać regularnie: "Czy testy działają szybko?" (wydajność testów) i "Czy aplikacja działa szybko?" (wydajność aplikacji). To różne problemy z różnymi metrykami i różnymi rozwiązaniami. Wolny test może być szybki w execution, ale testować wolną stronę. Szybki test może ukrywać problem wydajności aplikacji. Ta lekcja uczy, jak mierzyć wydajność aplikacji w sposób powtarzalny, interpretować wyniki z kontekstem i definiować budżety wydajnościowe, które zamieniają "ma być szybko" w mierzalny wymóg.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Mierzyć Core Web Vitals** — LCP, CLS, INP i ich związek z doświadczeniem użytkownika
- **Konfigurować Lighthouse CI** — automated performance audits w pipeline
- **Korzystać z Navigation Timing API** — precyzyjne pomiary ładowania strony
- **Symulować warunki realnych użytkowników** — CPU throttling, network throttling, mobile viewport
- **Definiować budżety wydajnościowe** — ilościowe progi dla metryk frontendu
- **Rozróżniać problemy** — wolny test vs. wolna aplikacja vs. wolne środowisko

---

## Wprowadzenie: dwa typy wydajności

Wydajność w kontekście Playwright ma dwa aspekty, które są często mylone:

| Aspekt | Co mierzymy | Cel | Metryki |
|--------|-------------|-----|---------|
| **Wydajność testów** | Szybkość execution testów | Szybki feedback developerowi | Czas testu, workers, retries |
| **Wydajność aplikacji** | Szybkość działania strony/aplikacji | Zadowolenie użytkownika | LCP, CLS, INP, TTFB |

Zasada: test wydajności aplikacji powinien mierzyć doświadczenie użytkownika, nie czas wykonania testu. Test, który łąduje stronę i sprawdza, czy przycisk jest widoczny, mierzy to samo co użytkownik — ale w odróżnieniu od benchmarków, test Playwright mierzy interaktywność i treść, nie tylko liczby.

---

## Sekcja 1: Core Web Vitals — język wydajności frontendu

### LCP (Largest Contentful Paint) — kiedy główna treść jest widoczna

LCP mierzy czas od startu ładowania strony do momentu, gdy największy widoczny element treści (obraz, video, blok tekstu) jest renderowany w viewport.

```typescript
// Test LCP z Playwright
test('strona główna — LCP poniżej 2.5s', async ({ page }) => {
  // Monitoruj LCP entries
  const lcpPromise = page.evaluate(() => {
    return new Promise<number>((resolve) => {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
        resolve(lastEntry.startTime);
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    });
  });
  
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  
  const lcp = await lcpPromise;
  console.log(`LCP: ${lcp.toFixed(0)}ms`);
  
  // Thresholds według Google
  expect(lcp).toBeLessThan(2500);  // Good: < 2.5s
});
```

### CLS (Cumulative Layout Shift) — stabilność layoutu

CLS mierzy sumę wszystkich unexpected layout shifts, które occur podczas życia strony. Nieoczekiwany shift = element, który zmienia pozycję bez wyraźnego powodu (np. lazy-loaded image bez dimensions).

```typescript
// Test CLS z Playwright
test('strona produktu — CLS poniżej 0.1', async ({ page }) => {
  await page.goto('/product/123');
  
  // Poczekaj na pełne załadowanie
  await page.waitForLoadState('networkidle');
  
  // Zmierz CLS przez Performance Observer
  const clsValue = await page.evaluate(() => {
    return new Promise<number>((resolve) => {
      let cls = 0;
      
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries() as PerformanceEntry[]) {
          if (!(entry as any).hadRecentInput) {
            cls += (entry as any).value;
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
      
      // Poczekaj chwilę na eventual shifts
      setTimeout(() => resolve(cls), 2000);
    });
  });
  
  console.log(`CLS: ${clsValue.toFixed(4)}`);
  expect(clsValue).toBeLessThan(0.1);  // Good: < 0.1
});
```

### INP (Interaction to Next Paint) — responsywność interakcji

INP zastąpił FID (First Input Delay) w marcu 2024. INP mierzy opóźnienie od interakcji użytkownika (click, keypress) do momentu, gdy przeglądarka paintuje odpowiedź.

```typescript
// Test INP z Playwright
test('reakcja na klik — INP poniżej 200ms', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Poczekaj aż strona będzie idle
  const inpValue = await page.evaluate(() => {
    return new Promise<number>((resolve) => {
      let maxINP = 0;
      
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries() as PerformanceEntry[]) {
          const inp = (entry as any).duration;
          if (inp > maxINP) maxINP = inp;
        }
      }).observe({ type: 'event', buffered: true });
      
      setTimeout(() => resolve(maxINP), 3000);
    });
  });
  
  console.log(`INP: ${inpValue.toFixed(0)}ms`);
  expect(inpValue).toBeLessThan(200);  // Good: < 200ms
});
```

### Thresholds Core Web Vitals

| Metryka | Dobra | Wymaga poprawy | Słaba |
|---------|-------|----------------|-------|
| **LCP** | < 2.5s | 2.5s - 4s | > 4s |
| **CLS** | < 0.1 | 0.1 - 0.25 | > 0.25 |
| **INP** | < 200ms | 200ms - 500ms | > 500ms |

---

## Sekcja 2: Navigation Timing API — precyzyjne pomiary

### Timeline ładowania strony

```typescript
test('metryki ładowania strony produktu', async ({ page }) => {
  // Monitoruj wszystkie metryki navigation
  await page.goto('/products/laptop-xyz', { waitUntil: 'load' });
  
  const metrics = await page.evaluate(() => {
    const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    
    return {
      // Timing phases
      ttfb: navigation.responseStart - navigation.requestStart,  // Time to first byte
      domInteractive: navigation.domInteractive - navigation.startTime,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
      loadComplete: navigation.loadEventEnd - navigation.startTime,
      
      // Transfer
      transferSize: navigation.transferSize,
      encodedBodySize: navigation.encodedBodySize,
      decodedBodySize: navigation.decodedBodySize,
      
      // Navigation type
      navigationType: navigation.type,
      redirectCount: navigation.redirectCount,
    };
  });
  
  console.log('Navigation metrics:', metrics);
  
  // Assertions z uzasadnionymi progami
  expect(metrics.ttfb).toBeLessThan(500);       // TTFB < 500ms (CDN, cache)
  expect(metrics.domInteractive).toBeLessThan(2000);  // FCP < 2s
  expect(metrics.domContentLoaded).toBeLessThan(2500);  // DCL < 2.5s
  expect(metrics.loadComplete).toBeLessThan(5000);  // Pełne załadowanie < 5s
  
  // Ilość transferred data
  const mbTransferred = (metrics.transferSize / 1024 / 1024).toFixed(2);
  console.log(`Strona przetransferowała: ${mbTransferred} MB`);
  expect(metrics.transferSize).toBeLessThan(5 * 1024 * 1024);  // < 5MB
});
```

### Resource timing — co ładuje się najdłużej

```typescript
test('analiza zasobów — slowest resources', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  const resourceMetrics = await page.evaluate(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    return resources
      .map(r => ({
        name: r.name.split('/').pop(),  // Nazwa pliku
        duration: (r.responseEnd - r.startTime).toFixed(0),
        size: r.transferSize,
        type: r.initiatorType,
        dns: (r.dnsEnd - r.dnsStart).toFixed(0),
        connect: (r.connectEnd - r.connectStart).toFixed(0),
        ttfb: (r.responseStart - r.requestStart).toFixed(0),
      }))
      .sort((a, b) => Number(b.duration) - Number(a.duration))
      .slice(0, 10);  // Top 10 slowest
  });
  
  console.log('Top 10 slowest resources:');
  resourceMetrics.forEach(r => {
    const sizeKB = (r.size / 1024).toFixed(0);
    console.log(`  ${r.duration}ms | ${sizeKB}KB | ${r.type} | ${r.name}`);
  });
  
  // Fail jeśli którykolwiek resource trwa > 3s
  const slowResources = resourceMetrics.filter(r => Number(r.duration) > 3000);
  expect(slowResources.length, `Zbyt wolne zasoby: ${slowResources.map(r => r.name).join(', ')}`).toBe(0);
});
```

### Network request metrics

```typescript
test('API response time', async ({ page, request }) => {
  // Test API bez UI overhead
  const apiMetrics = await request.evaluate(async (apiUrl) => {
    const timings = [];
    
    for (let i = 0; i < 5; i++) {  // 5 requestów dla średniej
      const start = performance.now();
      const response = await fetch(apiUrl);
      const duration = performance.now() - start;
      
      timings.push({
        duration: duration.toFixed(0),
        status: response.status,
        ok: response.ok,
      });
    }
    
    const avg = timings.reduce((s, t) => s + Number(t.duration), 0) / timings.length;
    const p95 = timings.sort((a, b) => Number(b.duration) - Number(a.duration))[Math.floor(timings.length * 0.95)];
    
    return { timings, avg: avg.toFixed(0), p95: p95?.duration };
  }, '/api/products');
  
  console.log('API metrics:', apiMetrics);
  
  expect(Number(apiMetrics.avg)).toBeLessThan(500);  // Średnia < 500ms
  expect(Number(apiMetrics.p95)).toBeLessThan(1000);  // P95 < 1s
});
```

---

## Sekcja 3: Lighthouse CI — automated performance audits

### Konfiguracja Lighthouse CI

```bash
# Instalacja
npm install -D @lhci/cli

# Konfiguracja — lighthouserc.json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000",
        "http://localhost:3000/products",
        "http://localhost:3000/checkout"
      ],
      "numberOfRuns": 3,
      "settings": {
        "staticDistDir": "./dist"
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.8 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "first-contentful-paint": ["warn", { "maxNumericValue": 2000 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 4000 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["warn", { "maxNumericValue": 500 }],
        "speed-index": ["warn", { "maxNumericValue": 4000 }]
      }
    },
    "upload": {
      "target": "lhci"
    }
  }
}
```

### Playwright + Lighthouse integration

```typescript
// tests/performance/lighthouse.spec.ts
import { test, expect } from '@playwright/test';
import { LHCI } from '@lhci/utils';

test('Lighthouse performance audit', async ({ page }) => {
  // Start local server (lub użyj webServer z playwright.config)
  
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Run Lighthouse via CDP (Chrome DevTools Protocol)
  const lighthouseResults = await page.evaluate(async () => {
    // @ts-ignore
    const { default: lighthouse } = await import('lighthouse');
    
    const results = await lighthouse(window.location.href, {
      port: 9222,
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      settings: {
        throttlingMethod: 'simulate',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
      },
    });
    
    return results;
  });
  
  const lhr = lighthouseResults;
  
  // Weryfikacja score
  expect(lhr.categories.performance.score).toBeGreaterThan(0.8);  // 80%+ performance
  expect(lhr.categories.accessibility.score).toBeGreaterThan(0.9);  // 90%+ a11y
  
  console.log('Lighthouse scores:');
  console.log('  Performance:', lhr.categories.performance.score);
  console.log('  Accessibility:', lhr.categories.accessibility.score);
  console.log('  Best Practices:', lhr.categories['best-practices'].score);
  console.log('  SEO:', lhr.categories.seo.score);
  
  // Log audits
  console.log('\nAudits with warnings:');
  for (const audit of Object.values(lhr.audits)) {
    if (audit.scoreDisplayMode === 'informative' || audit.scoreDisplayMode === 'manual') {
      console.log(`  ${audit.id}: ${audit.description}`);
    }
  }
});
```

### Lighthouse w CI pipeline

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse Performance

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 6 * * *'  # Codziennie rano

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '22'
      
      - name: Install and start app
        run: |
          npm ci
          npm run build
          npm run start &
          sleep 5
      
      - name: Run Lighthouse CI
        run: npx @lhci/cli autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
      
      - name: Upload LHCI results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: lighthouse-results
          path: .lighthouseci/
```

---

## Sekcja 4: Throttling — symulacja warunków realnych użytkowników

### CPU throttling — mobile slowdown

```typescript
// playwright.config.ts — symulacja mobile CPU
export default defineConfig({
  projects: [
    {
      name: 'mobile-perf',
      use: {
        ...devices['iPhone 12'],
        // CPU slowdown = symulacja słabszego procesora
        launchOptions: {
          args: [
            '--disable-gpu',
            '--no-sandbox',
          ],
        },
        // Network throttling via CDP
      },
    },
  ],
});

// W test — programmatic throttling
test('strona działa na mobile CPU', async ({ page, context }) => {
  // Aktywuj CPU throttling (4x slowdown = mid-range mobile)
  await context.newPage();  // workaround — throttling per context
  await page.emulateNetworkConditions({
    name: 'Mobile 4G',
    download: 4000000,    // 4 Mbps
    upload: 3000000,      // 3 Mbps
    latency: 20,          // 20ms RTT
  });
  
  const start = Date.now();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - start;
  
  console.log(`Mobile load time: ${loadTime}ms`);
  expect(loadTime).toBeLessThan(8000);  // Mobile budget
});
```

### Network throttling presets

```typescript
// tests/performance/network-conditions.spec.ts
const networkConditions = {
  '4G Fast': { download: 4000000, upload: 3000000, latency: 20 },
  '4G Slow': { download: 400000, upload: 400000, latency: 40 },
  '3G': { download: 400000, upload: 400000, latency: 100 },
  '2G': { download: 50000, upload: 20000, latency: 200 },
  'Offline': { download: 0, upload: 0, latency: 0 },
};

test.describe('Performance under network conditions', () => {
  for (const [name, conditions] of Object.entries(networkConditions)) {
    test(`load time on ${name}`, async ({ page }) => {
      await page.emulateNetworkConditions(conditions);
      
      const start = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - start;
      
      console.log(`${name}: ${loadTime}ms`);
      
      // Różne progi dla różnych warunków
      const threshold = name === '3G' ? 15000 : name === '4G Slow' ? 8000 : 5000;
      expect(loadTime).toBeLessThan(threshold);
    });
  }
});
```

### Device emulation — realne viewport i UA

```typescript
// Wszystkie popularne urządzenia
const devices = [
  'iPhone 12',
  'iPhone 12 Pro',
  'iPad (gen 7)',
  'Galaxy S20',
  'Pixel 5',
];

test.describe('Device compatibility', () => {
  for (const deviceName of devices) {
    test(`${deviceName} — core functionality`, async ({ browser, page }) => {
      const device = require('playwright').devices[deviceName];
      
      await page.close();
      const context = await browser.newContext({
        ...device,
      });
      const devicePage = await context.newPage();
      
      await devicePage.goto('/');
      await devicePage.waitForLoadState('networkidle');
      
      // Weryfikacja layout na mobile
      await expect(devicePage.locator('body')).toHaveCSS('width', device.defaultBrowserViewport?.width?.toString() + 'px');
      
      await context.close();
    });
  }
});
```

---

## Sekcja 5: Performance budgets — od wymagań do testów

### Definiowanie budżetów

```typescript
// performance-budget.ts
interface PerformanceBudget {
  metric: string;
  threshold: number;
  unit: string;
  environment: 'mobile' | 'desktop' | 'both';
  severity: 'error' | 'warn';
}

const performanceBudget: PerformanceBudget[] = [
  // Timing budgets
  { metric: 'LCP', threshold: 2500, unit: 'ms', environment: 'both', severity: 'error' },
  { metric: 'INP', threshold: 200, unit: 'ms', environment: 'both', severity: 'error' },
  { metric: 'CLS', threshold: 0.1, unit: 'score', environment: 'both', severity: 'error' },
  
  // Navigation timing
  { metric: 'TTFB', threshold: 600, unit: 'ms', environment: 'both', severity: 'warn' },
  { metric: 'DOM Interactive', threshold: 3800, unit: 'ms', environment: 'desktop', severity: 'warn' },
  { metric: 'Page Load', threshold: 5000, unit: 'ms', environment: 'both', severity: 'error' },
  
  // Transfer budgets
  { metric: 'Total JS', threshold: 500, unit: 'KB', environment: 'both', severity: 'error' },
  { metric: 'Total CSS', threshold: 100, unit: 'KB', environment: 'both', severity: 'warn' },
  { metric: 'Total Transfer', threshold: 2, unit: 'MB', environment: 'both', severity: 'warn' },
  
  // Resource counts
  { metric: 'Total Requests', threshold: 50, unit: 'count', environment: 'both', severity: 'warn' },
];

export { performanceBudget };
```

### Automated budget enforcement

```typescript
// tests/performance/budget-enforcement.spec.ts
import { test, expect } from '@playwright/test';
import { performanceBudget } from '../../config/performance-budget';

test('performance budget — all pages', async ({ page }) => {
  const pages = [
    '/',
    '/products',
    '/product/test-laptop',
    '/cart',
    '/checkout',
  ];
  
  const violations: string[] = [];
  
  for (const path of pages) {
    await page.goto(path, { waitUntil: 'networkidle' });
    
    // Measure all metrics
    const metrics = await page.evaluate(() => {
      const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      const lcpEntry = (performance.getEntriesByType('largest-contentful-paint') as PerformanceEntry[]).pop();
      
      return {
        ttfb: nav.responseStart - nav.requestStart,
        domInteractive: nav.domInteractive - nav.startTime,
        pageLoad: nav.loadEventEnd - nav.startTime,
        lcp: lcpEntry?.startTime ?? 0,
      };
    });
    
    // Check against budget
    for (const budget of performanceBudget) {
      if (budget.environment === 'desktop') continue;  // Mobile only
      
      const actual = metrics[budget.metric as keyof typeof metrics];
      if (actual === undefined) continue;
      
      const exceeds = actual > budget.threshold;
      if (exceeds) {
        violations.push(`${path}: ${budget.metric} = ${actual.toFixed(0)}${budget.unit} (limit: ${budget.threshold}${budget.unit})`);
      }
    }
  }
  
  if (violations.length > 0) {
    console.error('Performance budget violations:');
    violations.forEach(v => console.error(`  - ${v}`));
    throw new Error(`${violations.length} budget violations found`);
  }
});
```

### Trend analysis — czy wydajność się pogarsza?

```typescript
// scripts/performance-trend.ts
// Uruchamiane po każdym pipeline — zapisuje metryki do bazy/JSON
interface PerformanceTrend {
  date: string;
  page: string;
  lcp: number;
  cls: number;
  loadTime: number;
  score: number;  // Lighthouse score
}

async function recordPerformanceTrend(results: PerformanceTrend[]) {
  const fs = await import('fs/promises');
  
  const historyPath = './test-results/performance-history.json';
  let history: PerformanceTrend[] = [];
  
  try {
    const existing = await fs.readFile(historyPath, 'utf-8');
    history = JSON.parse(existing);
  } catch {}
  
  // Append new results
  history.push(...results);
  
  // Keep last 90 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  history = history.filter(r => new Date(r.date) > cutoff);
  
  await fs.writeFile(historyPath, JSON.stringify(history, null, 2));
}

function analyzeTrend(history: PerformanceTrend[], page: string) {
  const pageHistory = history.filter(r => r.page === page).slice(-30);  // Last 30 data points
  
  if (pageHistory.length < 3) return { trend: 'insufficient-data' };
  
  const recent = pageHistory.slice(-10).map(r => r.lcp);
  const older = pageHistory.slice(-20, -10).map(r => r.lcp);
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  
  const change = ((recentAvg - olderAvg) / olderAvg) * 100;
  
  return {
    trend: change > 5 ? 'degrading' : change < -5 ? 'improving' : 'stable',
    changePercent: change.toFixed(1),
    recentAverage: recentAvg.toFixed(0),
    olderAverage: olderAvg.toFixed(0),
  };
}
```

---

## Sekcja 6: Dashboard i alerting na wydajność

### Grafana dashboard — performance metrics

```json
{
  "title": "Frontend Performance Dashboard",
  "panels": [
    {
      "title": "LCP Trend (30 days)",
      "type": "timeseries",
      "targets": [
        {
          "expr": "avg(lcp_ms{page=\"/\"})",
          "legendFormat": "{{page}}"
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
          }
        }
      }
    },
    {
      "title": "CLS by Page",
      "type": "bargauge",
      "targets": [
        {
          "expr": "avg(cls_score{page=~\".*\"}) by (page)",
          "legendFormat": "{{page}}"
        }
      ]
    },
    {
      "title": "Lighthouse Performance Score",
      "type": "stat",
      "targets": [
        {
          "expr": "avg(lighthouse_performance_score)",
          "legendFormat": "Score"
        }
      ],
      "fieldConfig": {
        "defaults": {
          "mappings": [
            { "type": "range", "options": { "from": 0, "to": 0.69, "result": { "color": "red", "text": "Poor" } } },
            { "type": "range", "options": { "from": 0.7, "to": 0.89, "result": { "color": "yellow", "text": "Needs Work" } } },
            { "type": "range", "options": { "from": 0.9, "to": 1, "result": { "color": "green", "text": "Good" } } }
          ]
        }
      }
    }
  ]
}
```

### Alerting na degraded performance

```yaml
# Prometheus alerting rules
groups:
  - name: performance
    rules:
      - alert: LCPDegraded
        expr: avg(lcp_ms) over 7d > 4000
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "LCP przekroczył 4s w ostatnim tygodniu"
          description: "Średni LCP w ostatnich 7 dniach: {{ $value }}ms. Wymaga natychmiastowej uwagi."
      
      - alert: PerformanceBudgetExceeded
        expr: lighthouse_performance_score < 0.7
        for: 15m
        labels:
          severity: critical
        annotations:
          summary: "Lighthouse score poniżej 70"
          description: "Wydajność frontendu wymaga natychmiastowej naprawy. Sprawdź raport Lighthouse."
```

---

## Perspektywa Full Stack Testera

Wydajność aplikacji to obszar, gdzie Full Stack Tester może mieć realny wpływ na doświadczenie użytkownika. Regularne testowanie metryk frontendu (LCP, CLS, INP) w CI oznacza, że problemy wydajnościowe są wykrywane na etapie developmentu, nie po release.

Kluczowe insight:
- **LCP mierzy percepcję użytkownika** — "kiedy widzę, że strona jest gotowa"
- **CLS mierzy stabilność** — "czy strona nie skacze podczas ładowania"
- **INP mierzy responsywność** — "czy strona reaguje na moje kliknięcia"

Budżety wydajnościowe zamieniają subiektywne "wolne" w obiektywny wymóg. Gdy próg jest zdefiniowany i automatycznie egzekwowany w CI, nikt nie może argumentować "ale moim zdaniem było szybko".

Pamiętaj: performance regression może być bardziej kosztowne niż functional regression. Użytkownik, który odczuwa wolno działającą stronę, rarely raportuje bug — po prostu odchodzi.

---

## Podsumowanie

- **Core Web Vitals** — LCP (< 2.5s), CLS (< 0.1), INP (< 200ms). To language businessowy dla wydajności frontendu.
- **Navigation Timing API** — TTFB, DOM Interactive, DCL, load — precyzyjne pomiary phases ładowania.
- **Resource Timing** — które zasoby ładują się najdłużej? Analiza top slowest resources.
- **Lighthouse CI** — automated performance audits w CI. Score-based assertions.
- **Throttling** — CPU slowdown i network throttle symulują realne warunki (mobile, slow 3G).
- **Performance budgets** — ilościowe progi zdefiniowane w konfiguracji, egzekwowane w testach.
- **Trend analysis** — śledzenie metryk w czasie. Degraded performance wykrywane zanim stanie się krytyczne.
- **Alerting** — Grafana alerts na degraded metrics. Proaktywne powiadomienia przed user complaints.

---

## Linki i źródła

- [Core Web Vitals — Google](https://web.dev/vitals/) — pełna dokumentacja LCP, CLS, INP
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) — automated Lighthouse in CI
- [Navigation Timing API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_Timing_API) — API reference
- [PerformanceObserver API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver) — observing metrics
- [Performance Budgets — web.dev](https://web.dev/use-lighthouse-for-performance-budgets/) — jak definiować i egzekwować budżety
- [Playwright emulateNetworkConditions](https://playwright.dev/docs/emulation#clobbering-network-conditions) — throttling networka
- [Google PageSpeed Insights](https://pagespeed.web.dev/) — real-world performance data
- [Grafana + Prometheus for Performance](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/) — wizualizacja metryk wydajności