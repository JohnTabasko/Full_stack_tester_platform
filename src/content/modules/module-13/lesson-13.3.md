# Strategie optymalizacji

> **Perspektywa Full Stack Testera**
> "Najpierw zmierz, potem optymalizuj" — to jedna z najważniejszych zasad inżynierii, a mimo to w testach automation zespoły często zaczynają od optymalizacji, zanim wiedzą, co naprawdę spowalnia ich suite. Blockowanie obrazów, zwiększanie workers, przenoszenie setupu do API — każda z tych optymalizacji ma sens w odpowiednim kontekście, ale każda też ma koszt. Ta lekcja uczy systematycznego podejścia do optymalizacji: najpierw profiling, potem decyzja na podstawie danych, z świadomością kompromisów.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Profilować suite testów** — identify bottlenecks w execution lifecycle
- **Przenosić setup do API** — eliminate UI overhead w data preparation
- **Zarządzać HTTP cache** — control caching behavior without hiding state changes
- **Stosować batching** — batch data creation dla faster setup
- **Implementować lazy initialization** — defer expensive operations
- **Analizować kompromisy** — trade-offs każdej optymalizacji

---

## Wprowadzenie: optymalizacja bez danych to zgadywanie

Zanim zmienisz cokolwiek, odpowiedz na pytanie: "Gdzie dokładnie jest czas?" Problem może być w miejscu, którego się nie spodziewasz:

```
Całkowity czas: 40 minut
├── npm install (cache hit): ~2 min     ← wydaje się OK, ale 2% całości
├── Playwright browsers install: ~3 min ← zależy od cache
├── Login UI per test: 500 tests × 3s = 25 min ← ❌ GŁÓWNY PROBLEM
├── API calls per test: 500 tests × 1s = 8 min ← drugi problem
├── Test assertions: 500 tests × 2s = 17 min ← w tym
└── Report generation: ~2 min
```

Login przez UI zabiera 25 z 40 minut — 62% czasu. Blockowanie obrazów (oszczędność ~5%) przy tym jest dropped. Measure first, optimize where it matters.

---

## Sekcja 1: Profilowanie — gdzie jest czas?

### Timing breakdown per test

```typescript
// tests/utils/timing-analyzer.ts
import { test as base, FullConfig, TestCase, TestResult } from '@playwright/test';

export const test = base.extend({
  // Automatyczny timing każdego testu
}, {
  auto: true,
});

test.beforeEach(async ({ page }, testInfo) => {
  testInfo.reporter;
  (testInfo as any)._timing = {
    setupStart: Date.now(),
    testStart: 0,
    testEnd: 0,
    teardownStart: 0,
  };
});

test.afterEach(async ({ page }, testInfo) => {
  const timing = (testInfo as any)._timing as any;
  timing.testEnd = Date.now();
  
  const totalTime = timing.testEnd - timing.setupStart;
  
  // Raport do analytics
  console.log(JSON.stringify({
    test: testInfo.title,
    file: testInfo.file,
    duration: totalTime,
    timestamp: new Date().toISOString(),
  }));
  
  // Warn jeśli test trwa > 30s
  if (totalTime > 30000) {
    console.warn(`⚠️ SLOW TEST: ${testInfo.title} — ${totalTime}ms`);
  }
});
```

### Profiling script — analyze all tests

```bash
# Uruchom testy z JSON reporter i analizuj wyniki
npx playwright test --reporter=json --output-dir=test-results

# Generuj raport profilowania
node scripts/profile-tests.js
```

```typescript
// scripts/profile-tests.ts
import { readFileSync } from 'fs';

interface TestProfile {
  title: string;
  file: string;
  duration: number;
  category: 'setup' | 'navigation' | 'action' | 'assertion' | 'api' | 'unknown';
}

function profileTests() {
  const results = JSON.parse(readFileSync('./test-results/results.json', 'utf-8'));
  
  const profiles: TestProfile[] = [];
  
  function extractTests(suite: any) {
    for (const test of suite.tests || []) {
      const duration = test.results[0]?.duration ?? 0;
      const file = test.location?.file ?? 'unknown';
      
      profiles.push({
        title: test.title,
        file,
        duration,
        category: categorizeTest(test.title),
      });
    }
    for (const child of suite.suites || []) {
      extractTests(child);
    }
  }
  
  for (const suite of results.suites || []) {
    extractTests(suite);
  }
  
  // Sort by duration
  const sorted = profiles.sort((a, b) => b.duration - a.duration);
  
  // Group by category
  const byCategory = profiles.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + p.duration;
    return acc;
  }, {} as Record<string, number>);
  
  const totalTime = profiles.reduce((s, p) => s + p.duration, 0);
  
  console.log('\n=== TEST PROFILING REPORT ===');
  console.log(`Total tests: ${profiles.length}`);
  console.log(`Total time: ${(totalTime / 1000 / 60).toFixed(1)} min`);
  console.log('\nTime by category:');
  for (const [cat, time] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    const percent = ((time / totalTime) * 100).toFixed(1);
    console.log(`  ${cat.padEnd(15)} ${(time / 1000).toFixed(0)}s (${percent}%)`);
  }
  
  console.log('\nTop 20 slowest tests:');
  sorted.slice(0, 20).forEach((p, i) => {
    console.log(`  ${i + 1}. ${(p.duration / 1000).toFixed(1)}s — ${p.title}`);
    console.log(`     ${p.file}`);
  });
}

function categorizeTest(title: string): TestProfile['category'] {
  const lower = title.toLowerCase();
  if (lower.includes('setup') || lower.includes('login')) return 'setup';
  if (lower.includes('api') || lower.includes('request')) return 'api';
  if (lower.includes('navigate') || lower.includes('goto')) return 'navigation';
  if (lower.includes('click') || lower.includes('fill') || lower.includes('type')) return 'action';
  if (lower.includes('expect') || lower.includes('should') || lower.includes('verify')) return 'assertion';
  return 'unknown';
}

profileTests();
```

### CI profiling — identify bottlenecks

```bash
# Uruchom testy z timing i export
PLAYWRIGHT_JSON_OUTPUT_NAME=test-results/results.json \
npx playwright test --reporter=json,line

# Analizuj wyniki
node scripts/ci-profiler.js
```

---

## Sekcja 2: Przeniesienie setupu do API

### Dlaczego API setup jest szybszy

| Metoda | Czas | Overhead |
|--------|------|----------|
| **UI login** | 2-5s | Renderowanie całej strony, HTTP requests, JS execution |
| **API login** | 100-500ms | Prosty HTTP request, zwraca token |
| **UI create user** | 3-8s | Formularz, walidacja, redirect, session setup |
| **API create user** | 50-200ms | Direct DB write |

Setup przez API = 10-50x szybszy dla każdej operacji.

### Implementation — API-based fixtures

```typescript
// tests/fixtures/api-auth.fixture.ts
import { test as base, request } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';

interface ApiAuth {
  request: APIRequestContext;
  adminToken: string;
  userToken: string;
  createTestData: (data: TestData) => Promise<string>;  // Returns ID
}

interface TestData {
  customer?: Partial<Customer>;
  order?: Partial<Order>;
  product?: Partial<Product>;
}

export const test = base.extend<ApiAuth>({
  // Raz na całą suitę — jeden admin token
  adminToken: async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        email: 'admin@test.com',
        password: process.env.ADMIN_PASSWORD,
      },
    });
    
    const { token } = await response.json();
    return token;
  },
  
  // Per-worker user token
  userToken: async ({ request, adminToken }) => {
    const response = await request.post('/api/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        role: 'customer',
      },
    });
    
    const user = await response.json();
    
    // Login as new user
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: user.email,
        password: 'test-password',
      },
    });
    
    const { token } = await loginResponse.json();
    return token;
  },
  
  createTestData: async ({ request, adminToken }, use) => {
    const creator = async (data: TestData) => {
      const headers = { Authorization: `Bearer ${adminToken}` };
      
      if (data.customer) {
        const response = await request.post('/api/customers', {
          headers,
          data: data.customer,
        });
        return (await response.json()).id;
      }
      
      if (data.order) {
        const response = await request.post('/api/orders', {
          headers,
          data: data.order,
        });
        return (await response.json()).id;
      }
      
      return null;
    };
    
    await use(creator);
  },
});

// tests/customers/customer-profile.spec.ts
import { test } from '../fixtures/api-auth.fixture';

test('użytkownik widzi swój profil', async ({ page, userToken, createTestData }) => {
  // Szybki setup przez API — 50ms
  const customerId = await createTestData({
    customer: {
      name: 'Jan Kowalski',
      email: 'jan.kowalski@example.com',
    },
  });
  
  // Test przez UI — tylko interakcję użytkownika
  await page.goto(`/customers/${customerId}`);
  
  await expect(page.getByText('Jan Kowalski')).toBeVisible();
  await expect(page.getByText('jan.kowalski@example.com')).toBeVisible();
});
```

### Hybrid approach — API setup, UI verification

```typescript
test('pełny przepływ zamówienia', async ({ page, request, adminToken }) => {
  // Setup przez API — szybki
  const customerId = await createCustomerAPI(request, adminToken, {
    name: 'Test Customer',
    email: 'test@example.com',
  });
  
  const productId = await createProductAPI(request, adminToken, {
    name: 'Test Product',
    price: 199,
    stock: 100,
  });
  
  // UI test — tylko critical path
  await page.goto('/');
  
  // Krok 1: Dodaj do koszyka
  await page.goto(`/products/${productId}`);
  await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  await expect(page.locator('.cart-badge')).toHaveText('1');
  
  // Krok 2: Checkout
  await page.getByRole('link', { name: 'Koszyk' }).click();
  await page.getByRole('button', { name: 'Złóż zamówienie' }).click();
  
  // Weryfikuj przez API — szybka asercja
  const order = await getOrderAPI(request, adminToken, { customerId });
  expect(order.status).toBe('pending');
});
```

---

## Sekcja 3: HTTP Cache management

### Block cache vs. bypass cache

```typescript
// tests/utils/cache-utils.ts
export async function blockCaching(page: Page) {
  // Block browser cache — wymuś fresh downloads
  await page.route('**/*', route => {
    route.fulfill({
      status: route.request().frame() === page.mainFrame() ? 200 : 200,
      headers: {
        ...route.request().headers(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      body: 'CACHE_BLOCKED',
    });
  });
}

export async function enableAggressiveCaching(page: Page) {
  // Wymuś cache dla statycznych zasobów
  await page.route('**/*.{js,css,png,jpg,jpeg,webp,svg,woff,woff2}', route => {
    route.fulfill({
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=31536000',
      },
      body: route.request().url().startsWith('http') 
        ? 'CACHED' 
        : undefined,
    });
  });
}
```

### Cache-aware testing — verify cache behavior

```typescript
test('strona wykorzystuje cache dla obrazów', async ({ page }) => {
  // Pierwszy request — no cache
  const firstRequest = page.waitForRequest('**/hero-image.png');
  await page.goto('/');
  await firstRequest;
  
  // Reload — cache hit
  const secondRequest = page.waitForRequest('**/hero-image.png');
  await page.reload();
  
  // Mierz czy drugi request jest szybszy (cache)
  const request2 = await secondRequest;
  const timing = await request2.timing();
  
  // Cache hit = nie ma transferu, TTFB ~0ms
  console.log(`Cache response time: ${timing?.responseEnd - timing?.startTime}ms`);
  
  // Cache hit powinno być znacznie szybsze
  expect(timing?.responseEnd).toBeLessThan(50);  // < 50ms = cache hit
});

test('strona wymusza fresh data dla dynamicznych endpointów', async ({ page }) => {
  const request1Promise = page.waitForRequest('**/api/products');
  await page.goto('/products');
  await request1Promise;
  
  // Drugi request na tę samą stronę
  const request2Promise = page.waitForRequest('**/api/products');
  await page.reload();
  await request2Promise;
  
  const request2 = await request2Promise;
  
  // Dynamic endpoints NIE powinny być cached
  // Ale jeśli są cached, test powinien fail
  const cacheHeader = request2.headers()['cache-control'];
  
  // Business rule: api/products NIE może być cached
  expect(cacheHeader).not.toMatch(/max-age/);
});
```

---

## Sekcja 4: Batching —批量 operations

### Batch create test data

```typescript
// tests/api/batch-data.ts
test.beforeAll(async ({ request, adminToken }) => {
  // Stwórz 50 test users jednym batch requestem
  const batchPayload = Array.from({ length: 50 }, (_, i) => ({
    email: `batch-user-${i}-${Date.now()}@example.com`,
    name: `Batch User ${i}`,
    role: 'customer',
  }));
  
  //假设 API obsługuje batch create
  const response = await request.post('/api/users/batch', {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: { users: batchPayload },
  });
  
  const { created } = await response.json();
  
  // Zapisz do pliku — fixture będzie czytać
  const fs = await import('fs/promises');
  await fs.writeFile('./test-data/batch-users.json', JSON.stringify(created));
});

test('użytkownik batch może się zalogować', async ({ page }) => {
  // Wczytaj batch users z pliku
  const fs = await import('fs/promises');
  const users = JSON.parse(await fs.readFile('./test-data/batch-users.json', 'utf-8'));
  
  const user = users[0];
  
  await page.goto('/login');
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Hasło').fill('test-password');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  
  await expect(page.getByText(`Witaj, ${user.name}`)).toBeVisible();
});
```

### Batch cleanup

```typescript
test.afterAll(async ({ request, adminToken }) => {
  // Cleanup batch users jednym requestem
  const fs = await import('fs/promises');
  const users = JSON.parse(await fs.readFile('./test-data/batch-users.json', 'utf-8'));
  
  await request.post('/api/users/batch-delete', {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: { userIds: users.map((u: any) => u.id) },
  });
  
  // Usuń plik
  await fs.unlink('./test-data/batch-users.json');
});
```

---

## Sekcja 5: Lazy initialization

### Lazy load heavy fixtures

```typescript
// tests/fixtures/lazy-fixtures.ts
import { test as base, Page, BrowserContext } from '@playwright/test';

// Lazy admin panel — ładuje się tylko gdy jest potrzebny
export const lazyAdmin = async ({ browser }: { browser: Browser }) => {
  const context = await browser.newContext({
    storageState: './.auth/admin.json',
  });
  const page = await context.newPage();
  
  return {
    page,
    close: async () => await context.close(),
  };
};

test('heavy admin operations via lazy fixture', async ({ browser }) => {
  // Lazy init — admin panel ładuje się tylko jeśli test go potrzebuje
  const admin = await lazyAdmin({ browser });
  
  await admin.page.goto('/admin/export-users');
  await admin.page.getByRole('button', { name: 'Eksportuj CSV' }).click();
  
  // Cleanup od razu
  await admin.close();
});

// Lazy browser — uruchom tylko gdy wiele testów potrzebuje
const lazyBrowserPool: Browser[] = [];
let browserIndex = 0;

export async function getLazyBrowser(): Promise<Browser> {
  if (lazyBrowserPool.length < 4) {
    const browser = await chromium.launch();
    lazyBrowserPool.push(browser);
  }
  return lazyBrowserPool[browserIndex++ % lazyBrowserPool.length];
}

test.afterAll(async () => {
  // Cleanup lazy browsers
  await Promise.all(lazyBrowserPool.map(b => b.close()));
});
```

### Lazy data seeding

```typescript
// tests/fixtures/lazy-seed.ts
// Data seeding ON DEMAND — tylko gdy test potrzebuje
const seedCache = new Map<string, unknown>();

async function lazySeed(
  key: string,
  generator: () => Promise<unknown>
): Promise<unknown> {
  if (seedCache.has(key)) {
    return seedCache.get(key);
  }
  
  const value = await generator();
  seedCache.set(key, value);
  return value;
}

// Użycie
test('dashboard shows correct data', async ({ page, request }) => {
  // Lazy seed — data tworzona dopiero gdy test jej potrzebuje
  const customer = await lazySeed('customer-1', async () => {
    const resp = await request.post('/api/customers', {
      data: { name: 'Lazy Customer', email: 'lazy@example.com' },
    });
    return resp.json();
  });
  
  await page.goto(`/customers/${(customer as any).id}/dashboard`);
  await expect(page.getByText((customer as any).name)).toBeVisible();
});
```

---

## Sekcja 6: Kompromisy — każda optymalizacja ma cenę

### Trade-off matrix

| Optymalizacja | Zysk | Koszt | Kiedy używać |
|---------------|------|-------|--------------|
| **Block resources** | 20-40% faster load | Może ukryć real problems | Development, fast feedback |
| **API setup** | 80-90% faster setup | Mniej realistic (no UI) | Regression, CI |
| **Cache HTTP** | 30-50% faster reruns | May hide state bugs | Repeat visits, smoke |
| **Batching** | 60-70% faster bulk ops | Harder debug single item | Setup heavy test data |
| **Lazy init** | 30-50% faster init | More complex code | Heavy fixtures, shared resources |
| **More workers** | Linear speedup | More RAM, potential race | CI with enough resources |
| **Fewer workers** | More stable | Slower | Debugging, flaky tests |

### Decision framework

```typescript
function shouldOptimize(
  currentTime: number,
  targetTime: number,
  optimizationGain: number,  // Procent gain
  complexityCost: number,     // 1-5 scale
  maintenanceCost: number,    // 1-5 scale
): { shouldOptimize: boolean; reason: string } {
  const projectedTime = currentTime * (1 - optimizationGain / 100);
  const improvement = currentTime - projectedTime;
  
  // Only optimize if:
  // 1. Projected time meets target
  // 2. Improvement > 30s (worth the effort)
  // 3. Complexity + maintenance < 4 (reasonable cost)
  
  const totalCost = complexityCost + maintenanceCost;
  const worthIt = improvement > 30000 && totalCost < 4;
  
  return {
    shouldOptimize: projectedTime < targetTime && worthIt,
    reason: worthIt 
      ? `Oszczędność: ${(improvement / 1000).toFixed(0)}s, koszt: ${totalCost}/10`
      : `Projekcja: ${(projectedTime / 1000).toFixed(0)}s (cel: ${targetTime / 1000}s), nieopłacalne`,
  };
}
```

### Document optimization decisions

```typescript
// tests/OPTIMIZATIONS.md
/**
 * # Performance Optimization Decisions
 * 
 * ## 2024-06-15: API-based setup for authentication
 * Decision: Przeniesiono login z UI do API
 * Before: 3-5s per test for login
 * After: 50-200ms for API token fetch
 * Impact: ~60% faster setup across 200 tests
 * Trade-off: Tests nie weryfikują UI login flow (oddzielne testy istnieją)
 * Owner: QA Team
 * 
 * ## 2024-06-20: Resource blocking for smoke tests
 * Decision: Block images/fonts w smoke suite
 * Before: ~8s average load time
 * After: ~4s average load time
 * Impact: ~50% faster smoke feedback
 * Trade-off: Nie testuje real image loading performance
 * Owner: QA Team
 * 
 * ## 2024-06-25: Sharding 4-way w CI
 * Decision: Podzielono 500 testów na 4 parallel jobs
 * Before: 40 min total
 * After: ~12 min total
 * Impact: 70% faster CI pipeline
 * Trade-off: Higher CI cost (4x compute), JUnit merge complexity
 * Owner: DevOps
 */
```

---

## Perspektywa Full Stack Testera

Jako Full Stack Tester zarządzający wydajnością testów myśl systemically:

**Measure → Analyze → Decide → Implement → Monitor**

1. **Measure**: Uruchom profiling, znajdź top slowest tests i categories
2. **Analyze**: Czy bottleneck jest w setup (API vs. UI), w test logic, czy w resource loading?
3. **Decide**: Która optymalizacja daje największy zysk przy najmniejszym koszcie?
4. **Implement**: Zaimplementuj i zweryfikuj realną oszczędność
5. **Monitor**: Czy optymalizacja utrzymuje się w czasie? Czy nie wprowadza flaky?

Najlepsze zespoły mają "performance budget" dla test suite: np. "smoke suite < 5 min, regression < 30 min". Każda optymalizacja jest oceniana przeciwko temu budżetowi.

Pamiętaj: optymalizacja, która zmniejsza coverage lub wiarygodność, jest counter-productive. Fast test suite, które missuje bugs, jest gorsze niż slower suite, który catchuje everything.

---

## Podsumowanie

- **Profile first** — przed jakąkolwiek optymalizacją uruchom profiler. Zidentyfikuj top 10 slowest tests i main bottlenecks.
- **API setup** — największy possible gain (10-50x speedup). Przenieś data creation z UI na API gdzie możliwe.
- **HTTP cache management** — block cache dla deterministycznych testów, enable cache dla repeat-visit tests, verify cache behavior jako część testów.
- **Batching** — bulk operations dla data setup. Ale balanced z debuggability — zbyt batched data utrudnia diagnose failures.
- **Lazy initialization** — defer expensive operations dopiero gdy są potrzebne. Oszczędza setup time dla testów, które nie potrzebują heavy fixtures.
- **Trade-off analysis** — każda optymalizacja ma koszt. Dokumentuj decyzje: co zyskujesz, co tracisz, dlaczego decyzja jest uzasadniona.
- **Monitor after changes** — measure before i after. Jeśli zmiana nie daje realnego zysku (min. 30s), revert.

---

## Linki i źródła

- [Playwright Performance Tips](https://playwright.dev/docs/test-performance) — official performance optimization guide
- [Playwright API Testing](https://playwright.dev/docs/api/class-apirequestcontext) — request fixture for API testing
- [HTTP Caching — MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching) — cache behavior and headers
- [Performance Profiling — Chrome DevTools](https://developer.chrome.com/docs/devtools/performance/) — browser profiling
- [Lighthouse Performance Budgets](https://developer.chrome.com/docs/lighthouse/performance/performance-budget/) — budget-based performance tracking
- [Playwright Test Sharding](https://playwright.dev/docs/test-sharding) — parallel execution configuration
- [Parallelization Strategies — CircleCI](https://circleci.com/docs/parallelism-faster-pipelines/) — thinking about parallel execution cost