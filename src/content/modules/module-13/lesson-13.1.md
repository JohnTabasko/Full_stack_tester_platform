# Optymalizacja wydajności testów

> **Perspektywa Full Stack Testera**
> Test suite trwający 40 minut to nie problem techniczny — to problem kulturowy. Programiści zaczynają omijać testy, QA traci wiarygodność, a feedback loop staje się bezużyteczny. Wydajność testów nie jest tylko inżynierskim zadaniem optymalizacji — to fundament developer experience i biznesowej efektywności zespołu. Ta lekcja uczy systematycznego podejścia do przyspieszania testów Playwright, od prostych konfiguracji po zaawansowane strategie parallelizacji i resource management.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Konfigurować parallelism** w Playwright — workers, fullyParallel, per-project configuration
- **Blokować zbędne zasoby** — obrazów, czcionek, trackingu, reklam przez page.route()
- **Optymalizować state management** — storageState, reused state, skip login where possible
- **Zarządzać trace i video** — kiedy zapisywać, kiedy pomijać, jak ograniczyć overhead
- **Implementować test sharding** — dzielenie suity na wiele CI jobs
- **Mierzyć wydajność** — identyfikować bottlenecks, profile'ować slowest tests
- **Unikać common anti-patterns** — anti-patterns, które spowalniają testy bez wartości

---

## Wprowadzenie: dlaczego wydajność testów ma znaczenie

Załóżmy, że masz 500 testów, każdy trwa średnio 8 sekund, i uruchamiasz je sekwencyjnie:

```
500 tests × 8s = 4000s ≈ 67 minut
```

Teraz uruchom te same 500 testów na 8 workerach:

```
500 tests / 8 workers × 8s ≈ 500s ≈ 8-9 minut
```

Różnica: 58 minut vs. 9 minut. To nie tylko kwestia wygody — to kwestia:
- **Developer experience**: czy programista czeka 10 min czy godzinę na feedback?
- **Pipeline cost**: każda minuta CI kosztuje ($0.01-0.05/min w większości platform)
- **Frequency of testing**: wolne testy = rzadziej uruchamiane = mniej value
- **Team culture**: jeśli testy są frustrujące, zespół je ignoruje

Zasada: test suite powinien być wystarczająco szybki, żeby programista uruchomił go przed każdym commitem. Dla PR to <10 min. Dla local development to <3 min.

---

## Sekcja 1: Parallelism — konfiguracja workers

### Podstawowa konfiguracja

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Workers — liczba równoległych procesów testowych
  // 'undefined' = wszystkie dostępne CPU cores
  // Liczba = konkretna wartość
  // Procent = '50%' (połowa rdzeni)
  workers: process.env.CI ? 4 : undefined,
  
  // fullyParallel — testy WEWNĄTRZ pliku też równolegle
  // Domyślnie: false — plik testu działa jako jednostka
  fullyParallel: process.env.CI ? false : true,
  
  // reuseExistingServer — reuse browser instance między testami (lokalnie)
  reuseExistingServer: !process.env.CI,
  
  // maxConnectionsPerServer — limit połączeń HTTP (unikanie rate limiting)
  maxConnectionsPerServer: 10,
});
```

### Workers w zależności od środowiska

| Środowisko | Rekomendowane workers | Uzasadnienie |
|------------|----------------------|--------------|
| **Laptop developer** | `undefined` (all cores) | Maximum local speed |
| **GitHub Actions** | 4-8 | 2-4 vCPU per runner |
| **GitLab CI** | 2-4 | Zależy od planu |
| **Jenkins (large agent)** | 8-16 | Duże maszyny |
| **CI z ograniczonym RAM** | 2 | Unikaj OOM |

```typescript
// playwright.config.ts — smart workers selection
export default defineConfig({
  workers: (() => {
    if (process.env.CI) {
      // CI: ograniczona liczba workerów (RAM constraints)
      const cpuCount = require('os').cpus().length;
      return Math.min(cpuCount, 8);  // Max 8, niezależnie od maszyny
    }
    // Lokalnie: użyj wszystkich rdzeni
    return undefined;
  })(),
});
```

### fullyParallel — kiedy używać, kiedy unikać

```typescript
// playwright.config.ts
fullyParallel: false,  // Domyślnie — testy w pliku sekwencyjnie

// Ustaw true lokalnie dla szybkości:
// test.describe.configure({ mode: 'parallel' }) — na poziomie describe
```

`fullyParallel: true` może powodować problemy gdy:
- Testy w tym samym pliku operują na współdzielonych zasobach (np. ten sam użytkownik w DB)
- Testy zależą od kolejności execution (np. cleanup musi być ostatni)

`fullyParallel: false` (domyślne) jest bezpieczniejsze — plik = atomowa jednostka testowa.

### Per-project workers

```typescript
// Różna liczba workers dla różnych typów testów
projects: [
  {
    name: 'smoke',
    testMatch: /.*smoke.*\.spec\.ts/,
    use: { browserName: 'chromium' },
    workers: process.env.CI ? 8 : undefined,  // Więcej workers dla smoke
  },
  {
    name: 'regression',
    testMatch: /.*regression.*\.spec\.ts/,
    use: { browserName: 'chromium' },
    workers: process.env.CI ? 4 : undefined,  // Mniej workers dla regression
  },
  {
    name: 'api',
    testMatch: /.*api.*\.spec\.ts/,
    use: { browserName: 'chromium' },
    workers: process.env.CI ? 16 : undefined, // API testy — lżejsze, więcej workers
  },
],
```

---

## Sekcja 2: Resource blocking — oszczędzanie transferu i CPU

### Blocking images, fonts, analytics

Aplikacja webowa pobiera dziesiątki zasobów, które nie są potrzebne do testów funkcjonalnych:

| Typ zasobu | Przykłady | Oszczędność |
|------------|-----------|-------------|
| **Obrazy** | .jpg, .png, .webp, .svg (poza UI test) | 30-60% transferu |
| **Czcionki** | .woff2, .woff, Google Fonts | 5-10% transferu |
| **Tracking** | Google Analytics, Segment, GTM | 3-5% transferu |
| **Reklamy** | Ad networks, banners | 10-20% transferu |
| **Video/audio** | .mp4, .mp3, streams | 20-40% transferu |
| **CDN static** | CDN assets, libraries | 5-15% transferu |

### Implementacja route blocking

```typescript
// playwright.config.ts — globalny route blocking
import { defineConfig, Route } from '@playwright/test';

export default defineConfig({
  use: {
    // Base URL dla testów
    baseURL: 'https://staging.example.com',
    
    // Customizacja launch — wszystkie projects
    launchOptions: {
      args: [
        '--disable-web-security',  // Unikaj CORS issues w testach
        '--disable-features=VizDisplayCompositor',
      ],
    },
  },
  
  // Globalna konfiguracja route interception
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true,
  },
});

// W test file — intercept routes per test
test('strona główna ładuje się szybko', async ({ page }) => {
  // Block images
  await page.route('**/*.{jpg,jpeg,png,gif,webp,svg}', route => route.abort());
  
  // Block fonts
  await page.route('**/*.{woff,woff2,ttf,otf}', route => route.abort());
  
  // Block analytics
  await page.route('**/google-analytics/**', route => route.abort());
  await page.route('**/gtm.js', route => route.abort());
  await page.route('**/analytics/**', route => route.abort());
  
  // Block ads
  await page.route('**/*doubleclick*', route => route.abort());
  await page.route('**/*googlesyndication*', route => route.abort());
  
  // Block video/audio
  await page.route('**/*.{mp4,mp3,webm,wav}', route => route.abort());
  
  // Mierz czas ładowania
  const start = Date.now();
  await page.goto('/');
  const loadTime = Date.now() - start;
  
  console.log(`Strona załadowana w ${loadTime}ms`);
  
  // Verify — core functionality działa mimo blocked resources
  await expect(page.getByRole('heading', { name: 'Witaj!' })).toBeVisible();
});
```

### Advanced route management — mock data

```typescript
// Zamiast blockować — podstaw fake response ( ещё lepsze dla determinism)
test('wyszukiwanie produktów', async ({ page }) => {
  await page.route('**/api/products', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        products: [
          { id: 1, name: 'Test Laptop', price: 2999 },
          { id: 2, name: 'Test Phone', price: 1999 },
        ],
      }),
    });
  });
  
  await page.goto('/search');
  await page.getByPlaceholder('Szukaj...').fill('laptop');
  
  // Deterministic result — nie zależy od real API
  await expect(page.locator('.product-card')).toHaveCount(1);
});
```

### Global vs. per-test route blocking

```typescript
// playwright.config.ts — globalny handler dla wszystkich testów
import { test, Route } from '@playwright/test';

// Ustaw globalny handler w beforeAll
test.beforeAll(async ({ page }) => {
  // Block tracking everywhere
  await page.route('**/analytics*', route => route.abort());
  await page.route('**/gtm*', route => route.abort());
});

// Lub użyj globalSetup
export default defineConfig({
  globalSetup: async (config) => {
    // Konfiguracja shared dla wszystkich testów
  },
});
```

---

## Sekcja 3: State management — reuse login i setup

### Problem: Login w każdym teście

Typowy test suite:

```typescript
// ❌ SLOW: Login w każdym teście
test('użytkownik widzi profil', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Hasło').fill('password123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();  // 3-5s
  await page.waitForURL('/dashboard');
  // ... test logic
});

test('użytkownik edytuje profil', async ({ page }) => {
  await page.goto('/login');  // Drugi raz!
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Hasło').fill('password123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();  // Trzeci raz!
  await page.waitForURL('/dashboard');
  // ... test logic
});
```

Login przez UI to 3-5s per test. Przy 100 testach = 5-8 minut marnowane tylko na login.

### Solution: storageState — jeden login na wiele testów

```typescript
// playwright.config.ts — global state management
import { defineConfig, storageState } from '@playwright/test';
import { test as base } from '@playwright/test';

export default defineConfig({
  // use: { storageState: '.auth/user.json' }  # Statyczny state — nie rekomenduje
  
  projects: [
    {
      name: 'authenticated',
      use: {
        // Zaloguj się przed pierwszym testem, zachowaj state
        // State przetrwa między testami w tym samym workerze
      },
      dependencies: [],  # Konfiguracja w test files
    },
  ],
});

// tests/auth.spec.ts — dedicated auth fixture
test.describe('Authentication', () => {
  test('login flow — save state', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Hasło').fill('password123');
    await page.getByRole('button', { name: 'Zaloguj' }).click();
    await page.waitForURL('/dashboard');
    
    // Zachowaj state do pliku
    await page.context().storageState({
      path: './.auth/user.json',
    });
  });
});

// tests/authenticated.spec.ts — użyj zapisanego state
test.use({ storageState: './.auth/user.json' });

test('użytkownik widzi profil', async ({ page }) => {
  await page.goto('/dashboard');  // Już zalogowany!
  await expect(page.getByText('Witaj, test@example.com')).toBeVisible();
});

test('użytkownik edytuje profil', async ({ page }) => {
  await page.goto('/profile');  // Już zalogowany!
  await expect(page.getByLabel('Email')).toHaveValue('test@example.com');
});
```

### Dynamic storageState z różnymi użytkownikami

```typescript
// tests/fixtures/auth-fixtures.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

interface AuthFixture {
  adminPage: Page;
  userPage: Page;
  guestPage: Page;
}

// Różne typy użytkowników — różne state files
const authFiles = {
  admin: './.auth/admin.json',
  user: './.auth/user.json',
  guest: './.auth/guest.json',
};

export const test = base.extend<AuthFixture>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: authFiles.admin,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  
  userPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: authFiles.user,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  
  guestPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

// tests/dashboard.spec.ts
import { test } from '../fixtures/auth-fixtures';

test('admin widzi panel admina', async ({ adminPage }) => {
  await adminPage.goto('/admin');
  await expect(adminPage.getByRole('heading', { name: 'Admin Panel' })).toBeVisible();
});

test('zwykły użytkownik nie widzi panelu admina', async ({ userPage }) => {
  await userPage.goto('/admin');
  // Przekierowanie na dashboard (403 lub redirect)
  await expect(userPage).toHaveURL(/\/dashboard/);
});
```

### API-based authentication — fastest approach

```typescript
// tests/auth/api-auth.ts — najszybszy sposób (bez UI login)
test.beforeAll(async ({ request }) => {
  // Pobierz token przez API
  const response = await request.post('/api/auth/login', {
    data: {
      email: 'test@example.com',
      password: 'password123',
    },
  });
  
  const { token, user } = await response.json();
  
  // Ustaw cookies/request headers bez UI
  await request.context().storageState({
    cookies: [
      {
        name: 'auth_token',
        value: token,
        domain: 'staging.example.com',
        path: '/',
        httpOnly: true,
        secure: true,
      },
    ],
  });
});
```

### Reuse browser context

```typescript
// playwright.config.ts — reuse context (lokalnie szybsze, w CI mniej stabilne)
export default defineConfig({
  reuseExistingServer: !process.env.CI,
  
  // Fully reuse browser instance (oszczędza ~30% czasu launch)
  // Ustawione per project
  projects: [
    {
      name: 'chromium-fast',
      use: {
        browserName: 'chromium',
        launchOptions: {
          args: ['--reuse-global-browser'],  # Jeśli supported
        },
      },
    },
  ],
});
```

---

## Sekcja 4: Trace i video — zarządzanie overhead

### Porównanie overhead resource capture

| Setting | Storage per test | CPU overhead | Kiedy używać |
|---------|-----------------|--------------|--------------|
| **trace: 'off'** | 0 | 0 | Szybkie smoke tests |
| **trace: 'on-first-retry'** | 1-5 MB | 5-10% | ✅ Standard CI |
| **trace: 'retain-on-failure'** | 1-5 MB | 5-10% | ✅ Full regression |
| **trace: 'on'** | 5-20 MB | 20-30% | Development only |
| **video: 'off'** | 0 | 0 | Fast tests |
| **video: 'retain-on-failure'** | 5-20 MB | 10-15% | ✅ Standard CI |
| **video: 'on'** | 10-50 MB | 20-30% | Debug only |
| **screenshot: 'off'** | 0 | 0 | Normal tests |
| **screenshot: 'only-on-failure'** | 100-500 KB | 1-2% | ✅ Standard |

### Optimal configuration

```typescript
// playwright.config.ts — balanced configuration
export default defineConfig({
  use: {
    // Trace: tylko na retry (flaky detection) lub failure (debugging)
    trace: process.env.CI ? 'on-first-retry' : 'on',
    
    // Video: tylko przy failure (minimal overhead for passing tests)
    video: process.env.CI ? 'retain-on-failure' : 'off',
    
    // Screenshots: tylko przy failure (jasne dowody problemu)
    screenshot: process.env.CI ? 'only-on-failure' : 'off',
    
    // Navigation — czekaj na load, nie na networkidle
    actionTimeout: 10000,  // Timeout na akcję, nie na całą stronę
    navigationTimeout: 30000,  // Timeout na navigation
  },
  
  // Retry — retry failing tests (ale nie wszystkie!)
  retries: process.env.CI ? 2 : 0,
  
  // Timeout — per test
  timeout: process.env.CI ? 60000 : 30000,
  expect: {
    timeout: process.env.CI ? 15000 : 10000,
  },
});
```

### CI-specific optimizations

```yaml
# GitHub Actions — GitLab CI — optymalizacja dla CI
# playwright.config.ts
const isCI = process.env.CI === 'true';

export default defineConfig({
  use: {
    // CI: więcej timeout (shared runners are slower)
    timeout: isCI ? 60000 : 30000,
    
    // CI: retry (niższy bandwitch, możliwe network issues)
    retries: isCI ? 2 : 0,
    
    // CI: trace tylko na retry
    trace: isCI ? 'on-first-retry' : 'off',
    
    // CI: video tylko na failure
    video: isCI ? 'retain-on-failure' : 'off',
    
    // CI: mniej workers (resource constraints)
    workers: isCI ? 4 : undefined,
  },
});
```

---

## Sekcja 5: Test sharding — parallel execution w CI

### Playwright built-in sharding

```bash
# Podziel 200 testów na 4 równe części
npx playwright test --shard=1/4  # Tests 1-50
npx playwright test --shard=2/4  # Tests 51-100
npx playwright test --shard=3/4  # Tests 101-150
npx playwright test --shard=4/4  # Tests 151-200
```

### CI configuration — GitHub Actions

```yaml
# .github/workflows/playwright.yml
jobs:
  test:
    strategy:
      fail-fast: false  # Nie przerywaj wszystkich shardów gdy jeden padnie
      matrix:
        shard: [1, 2, 3, 4]
    
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
        run: npx playwright install --with-deps chromium
      
      - name: Run tests (shard ${{ matrix.shard }}/4)
        run: |
          npx playwright test \
            --shard=${{ matrix.shard }}/4 \
            --reporter=line,json,junit \
            --timeout=60000
        env:
          BASE_URL: ${{ vars.APP_URL }}
      
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results-shard-${{ matrix.shard }}
          path: |
            test-results/
            playwright-report/
          retention-days: 7
```

### Merge JUnit results

```yaml
# Po wszystkich shardach — merge results
merge-results:
  needs: [test-1, test-2, test-3, test-4]
  steps:
    - name: Download all artifacts
      uses: actions/download-artifact@v4
      with:
        pattern: test-results-shard-*
        path: test-results
        merge-multiple: true
    
    - name: Install junit-merge
      run: npm install -g junit-merge
    
    - name: Merge JUnit XML files
      run: |
        junit-merge -d test-results -o test-results/merged.xml
        echo "Merged $(find test-results -name '*.xml' | wc -l) XML files"
    
    - name: Publish merged results
      uses: actions/upload-artifact@v4
      with:
        name: merged-test-results
        path: test-results/merged.xml
```

### Test file-based sharding — alternatywa dla even distribution

```bash
# Podziel po plikach (nie po indywidualnych testach)
TOTAL_FILES=$(find tests -name "*.spec.ts" | wc -l)

# Generuj listy plików per shard
for shard in 1 2 3 4; do
  find tests -name "*.spec.ts" | \
    awk "NR % 4 == $((shard - 1))" | \
    sort > tests-shard-${shard}.txt
done

# Uruchom testy z listą plików
npx playwright test --config=playwright.shard.config.ts \
  $(cat tests-shard-${SHARD_INDEX}.txt | tr '\n' ' ')
```

---

## Sekcja 6: Performance measurement i profiling

### Built-in Playwright performance API

```typescript
// tests/performance/metrics.spec.ts
import { test, expect } from '@playwright/test';

test('Core Web Vitals metrics', async ({ page }) => {
  const metrics: PerformanceMetrics[] = [];
  
  // Monitoruj metryki strony
  page.on('performance', metric => {
    metrics.push(metric);
  });
  
  // Navigacja i pomiary
  const start = Date.now();
  await page.goto('/');
  const loadTime = Date.now() - start;
  
  // Performance navigation timing
  const navigationTiming = await page.evaluate(() => {
    const [navigation] = performance.getEntriesByType('navigation');
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
      loadComplete: (navigation as PerformanceNavigationTiming).loadEventEnd - navigation.startTime,
      domInteractive: (navigation as PerformanceNavigationTiming).domInteractive - navigation.startTime,
    };
  });
  
  console.log('Navigation timing:', navigationTiming);
  console.log('Total load time:', loadTime, 'ms');
  
  // Assertions — performance budgets
  expect(loadTime).toBeLessThan(5000);  // 5s budget
  expect(navigationTiming.domInteractive).toBeLessThan(3000);  // 3s FCP
});

test('API response time', async ({ page, request }) => {
  const start = Date.now();
  const response = await request.get('/api/products');
  const duration = Date.now() - start;
  
  expect(response.status()).toBe(200);
  expect(duration).toBeLessThan(1000);  // API < 1s
  
  console.log(`API response in ${duration}ms`);
});
```

### Identify slowest tests

```bash
# Playwright json reporter generuje szczegółowy raport
npx playwright test --reporter=json --output-dir=test-results

# Znajdź najwolniejsze testy
cat test-results/results.json | \
  jq '.suites[].suites[].tests[] | {title: .title, duration: .results[0].duration}' | \
  jq -s 'sort_by(-.duration) | .[:10]'
```

```typescript
// scripts/identify-slow-tests.ts — analiza wyników
import { readFileSync } from 'fs';

const results = JSON.parse(readFileSync('./test-results/results.json', 'utf-8'));

interface SlowTest {
  title: string;
  duration: number;
  file: string;
}

const allTests: SlowTest[] = [];

function extractTests(suite: any) {
  for (const test of suite.tests || []) {
    allTests.push({
      title: test.title,
      duration: test.results[0]?.duration ?? 0,
      file: test.location?.file ?? 'unknown',
    });
  }
  for (const child of suite.suites || []) {
    extractTests(child);
  }
}

for (const suite of results.suites || []) {
  extractTests(suite);
}

const slowest = allTests
  .sort((a, b) => b.duration - a.duration)
  .slice(0, 20);

console.log('\nTop 20 slowest tests:');
slowest.forEach((t, i) => {
  console.log(`${i + 1}. ${t.duration.toFixed(0)}ms — ${t.title}`);
  console.log(`   File: ${t.file}`);
});
```

### Performance budget — automated enforcement

```typescript
// tests/performance/budget.spec.ts
test.describe('Performance Budget', () => {
  test('regression tests should complete within time budget', async ({ page }) => {
    const metrics = collectTestMetrics();
    
    const slowTests = metrics
      .filter(m => m.duration > 30000)  // 30s per test budget
      .map(m => `${m.title}: ${m.duration}ms`);
    
    if (slowTests.length > 0) {
      console.error('Performance budget exceeded:');
      slowTests.forEach(t => console.error(`  - ${t}`));
      throw new Error(`${slowTests.length} tests exceeded 30s budget`);
    }
  });
  
  test('average test duration should be acceptable', async ({ page }) => {
    const metrics = collectTestMetrics();
    const avgDuration = metrics.reduce((s, m) => s + m.duration, 0) / metrics.length;
    
    expect(avgDuration).toBeLessThan(10000);  // Średnia < 10s
  });
});
```

---

## Sekcja 7: Common anti-patterns i rozwiązania

### Anti-pattern 1: Sleep zamiast wait

```typescript
// ❌ SLOW: sleep() jest deterministycznie wolny
await page.goto('/');
await page.waitForTimeout(3000);  // Zawsze 3s, nawet jeśli strona załadowana wcześniej

// ✅ FAST: czekaj na konkretny element
await page.goto('/');
await expect(page.getByRole('heading', { name: 'Witaj' })).toBeVisible({ timeout: 3000 });

// ✅ FAST: czekaj na network idle (ale używaj sparingly)
// await page.waitForLoadState('networkidle');
```

### Anti-pattern 2: Too many assertions per test

```typescript
// ❌ SLOW: jeden test = wiele page loads = wolne
test('weryfikacja strony produktu', async ({ page }) => {
  await page.goto('/product/1');
  await expect(page.locator('.name')).toHaveText('Laptop');
  await expect(page.locator('.price')).toHaveText('2999');
  await page.goto('/product/2');  // Drugi page load!
  await expect(page.locator('.name')).toHaveText('Phone');
  await expect(page.locator('.price')).toHaveText('1999');
});

// ✅ FAST: mniej page loads, assertion per test
test('strona produktu — nazwa', async ({ page }) => {
  await page.goto('/product/1');
  await expect(page.locator('.name')).toHaveText('Laptop');
});

test('strona produktu — cena', async ({ page }) => {
  await page.goto('/product/1');
  await expect(page.locator('.price')).toHaveText('2999');
});
```

### Anti-pattern 3: Sequential dependencies in parallel suite

```typescript
// ❌ SLOW: test B musi czekać na test A
test('stwórz użytkownika', async ({ page }) => {
  await createUser(page);  // 2s
  const userId = await getUserId();  // zależy od poprzedniego
});

// ❌ SLOW: cleanup w middleware blokuje suite
test.afterAll(async ({ page }) => {
  await cleanupAllData();  // 10s dla całego cleanup
});

// ✅ FAST: cleanup parallel, dane per test
test.beforeEach(async ({ page }) => {
  await createFreshTestUser(page);  // Każdy test ma własne dane
  await page.context().addInitScript(() => {
    // Lub: database seeding per test
  });
});
```

### Anti-pattern 4: Not using headless mode in CI

```yaml
# ❌ SLOW: headed mode = renderowanie UI = overhead
# playwright.config.ts
use:
  headless: false  # ❌ Wolne!

# ✅ FAST: headless mode (domyślnie true)
use:
  headless: true  # ✅ Szybkie
```

---

## Perspektywa Full Stack Testera

Wydajność testów to rozmowa między inżynierią a biznesem:
- **Inżynieria**: workers, caching, resource blocking, sharding — to wszystko zmniejsza czas execution
- **Biznes**: szybki feedback oznacza szybsze decyzje, mniej blocked developers, lepszy ROI

Najlepsze zespoły, które widziałem, traktują performance testów jako feature. Dokumentują time budgets, monitorują trending, i refaktoryzują slowest tests jako pierwsze (nie najważniejsze, najwolniejsze).

Zasada Pareto: 20% testów zabiera 80% czasu. Znajdź te testy i zoptymalizuj je — lub podziel na shardy. Każda sekunda zaoszczędzona w pipeline'u to wielokrotność tej sekundy w context całego zespołu przez rok.

---

## Podsumowanie

- **Workers**: konfiguruj liczbę workers per środowisko. Lokalnie — wszystkie rdzenie. W CI — ogranicz do 4-8.
- **fullyParallel**: używaj localnie dla szybkości, wyłączaj gdy testy zależą od siebie.
- **Resource blocking**: block images, fonts, tracking przez `page.route()`. Oszczędza 30-50% transferu.
- **storageState**: jeden login na wielokrotne testy. Zapisuj state, nie loguj się przez UI w każdym teście.
- **Trace/video strategy**: `on-first-retry` (trace) + `retain-on-failure` (video) = minimum overhead, maximum debugging.
- **Sharding**: `--shard=N/M` dzieli suite na M równych części. Przy 4 shardach: 40 min → 10 min.
- **Performance measurement**: mierz, profiluj, identyfikuj slowest tests. Performance budget jako automated check.
- **Anti-patterns**: replace `waitForTimeout` with expect, split large tests, use per-test data, run headless.

---

## Linki i źródła

- [Playwright Test Parallelism](https://playwright.dev/docs/test-parallel) — oficjalna dokumentacja parallel execution
- [Playwright Performance Tips](https://playwright.dev/docs/test-performance) — best practices Microsoft
- [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer) — jak efektywnie używać trace'ów
- [Core Web Vitals](https://web.dev/vitals/) — metryki wydajności webowej (LCP, FID, CLS)
- [Playwright Shard Command](https://playwright.dev/docs/test-sharding) — dokumentacja sharding
- [Performance Budgets — Google](https://web.dev/use-lighthouse-for-performance-budgets/) — concept performance budgets
- [junit-merge npm](https://www.npmjs.com/package/junit-merge) — merging parallel test results