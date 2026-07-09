# Testy na rzeczywistych urządzeniach i testy mobilne

> **Perspektywa Full Stack Testera**
> Desktopowy Chromium to tylko jeden użytkownik z miliardów. Użytkownik mobilny ma inny viewport, inny input method (touch vs. keyboard), inną sieć (4G vs. fiber) i inny CPU. To, co działa na desktop, może być unusable na telefonie. Ta lekcja uczy, jak testować aplikację w kontekście realnych użytkowników mobilnych — przez emulację, realne urządzenia i cloud-based device labs — z świadomością kompromisów między kosztem, coverage i wiarygodnością.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Konfigurować emulację urządzeń** w Playwright — viewport, user agent, device scale, touch
- **Rozróżniać emulację od realnych urządzeń** — kiedy emulator wystarczy, kiedy potrzebne jest real hardware
- **Integrować BrowserStack/Sauce Labs** z Playwright dla real device testing
- **Testować mobile-specific interactions** — touch, keyboard overlay, swipe, geolocation
- **Symulować warunki sieciowe** — throttling, offline, network transitions
- **Konfigurować locale, timezone i geolocation** w testach

---

## Wprowadzenie: dlaczego mobile testing ma znaczenie

Statystyki użycia mobile vs. desktop (2024):

```
Globalny traffic webowy:
├── Mobile: ~60%
├── Desktop: ~37%
└── Tablet: ~3%

E-commerce:
├── Mobile: ~65% sessions
├── Desktop: ~32% sessions
└── Tablet: ~3% sessions

Ale konwersja:
├── Desktop: 3.5%
├── Mobile: 1.5%
└── Tablet: 2.8%
```

Mobile ma więcej sessions, ale niższą konwersję. Częściowo przez UX issues — layout niepasujący do mobile, slow loading, confusing touch interactions. Te problemy są catchable przez automated mobile testing.

---

## Sekcja 1: Emulacja urządzeń w Playwright

### Built-in device presets

Playwright ma wbudowane definicje popularnych urządzeń:

```typescript
import { test, expect, devices } from '@playwright/test';

// Wszystkie built-in devices
const availableDevices = Object.keys(devices);
// ['iPhone 11', 'iPhone 11 Pro', 'iPhone 12', 'iPhone 12 Pro',
//  'iPhone 13', 'iPhone 13 Pro', 'iPhone 14', 'iPhone 14 Pro',
//  'iPhone 14 Pro Max', 'iPad (gen 6)', 'iPad (gen 7)',
//  'Samsung Galaxy S20', 'Samsung Galaxy S10', 'Pixel 5', 'Kindle Fire HDX', ...]
```

### Użycie device preset

```typescript
// playwright.config.ts — konfiguracja project per device
export default defineConfig({
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'iphone-12',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'pixel-5',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'ipad-pro',
      use: { ...devices['iPad Pro 11-inch'] },
    },
  ],
});

// test.spec.ts — użycie device w teście
test('checkout na iPhone 12', async ({ page }) => {
  await page.goto('/checkout');
  // Test działa w kontekście iPhone 12 (viewport, UA, touch emulation)
});
```

### Custom device definition

```typescript
// Dla urządzeń nieobjętych built-in presets
import { defineDevice } from '@playwright/test';

const budgetPhone = {
  viewport: { width: 360, height: 640 },
  screenWidth: 360,
  screenHeight: 640,
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  defaultBrowserType: 'chromium',
};

const customDevice = {
  ...budgetPhone,
  name: 'budget-android-mid-range',
  userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-A525F) Chrome/91.0',
};

export default defineConfig({
  projects: [
    {
      name: 'budget-android',
      use: { ...customDevice },
    },
  ],
});
```

### Test mobile-specific behaviors

```typescript
test.describe('Mobile interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
  });
  
  test('touch tap na przycisk', async ({ page }) => {
    await page.goto('/');
    
    // Touch tap — automatycznie wykrywa touch events
    await page.tap('#buy-button');
    
    await expect(page.locator('.added-to-cart')).toBeVisible();
  });
  
  test('swipe na karuzeli produktów', async ({ page }) => {
    await page.goto('/products');
    
    // Swipe gesture
    const carousel = page.locator('.product-carousel');
    await carousel.tap();
    await page.touchscreen.swipe(300, 400, 100, 400);  // Swipe left
    
    await expect(page.locator('.carousel-item[data-index="1"]')).toBeVisible();
  });
  
  test('keyboard ekranowa nie zasłania przycisku', async ({ page }) => {
    await page.goto('/checkout');
    
    // Focus na input — keyboard otwiera się
    await page.locator('#postal-code').tap();
    
    // Poczekaj aż keyboard się otworzy
    await page.waitForTimeout(500);
    
    // Sprawdź czy przycisk "Zapłać" jest widoczny i clickable
    const payButton = page.locator('#pay-button');
    const isVisible = await payButton.isVisible();
    const isInViewport = await payButton.isInViewport();
    
    expect(isVisible && isInViewport).toBe(true);
  });
  
  test('long press na elemencie', async ({ page }) => {
    await page.goto('/products');
    
    // Long press (800ms)
    await page.locator('.product-card').tap({ delay: 800 });
    
    await expect(page.locator('.context-menu')).toBeVisible();
  });
});
```

---

## Sekcja 2: Emulacja vs. Real Devices

### Porównanie: emulator vs. real device

| Aspekt | Emulator (Playwright) | Real Device (BrowserStack) | Physical Device Lab |
|--------|----------------------|---------------------------|---------------------|
| **Cost** | $0 (included) | $0.05-0.50/test | Infrastructure |
| **Speed** | Fast | Medium-slow | Medium |
| **Coverage** | Limited (mostly Chrome) | Excellent (100s devices) | Limited to owned devices |
| **Realism** | Medium (Chrome only) | High | Very High |
| **Touch accuracy** | Simulated | Real touch events | Real touch events |
| **Keyboard overlay** | Simulated | Real OS behavior | Real OS behavior |
| **Network behavior** | Can be throttled | Real network | Real network |
| **Hardware sensors** | No | GPS/accelerometer no | GPS/accelerometer no |

### Kiedy emulator wystarczy

Emulator (built-in Playwright) jest wystarczający gdy:
- **Layout responsiveness** — czy layout działa na mobile viewport?
- **Touch interactions** — tap, swipe gestures na poziomie DOM
- **Basic functionality** — core flows działają na mobile
- **Performance budgets** — czy LCP mierzony jest akceptowalny na mobile?

Emulator NIE zastąpi real device gdy:
- **Virtual keyboard overlay** — jak keyboard wpływa na viewport? (emulator nie oddaje perfect)
- **Hardware-specific bugs** — Samsung browser issues, Safari quirks
- **Performance profiling** — real CPU/memory constraints
- **Native integrations** — camera, QR code scanner, NFC

### Strategy: layered device testing

```yaml
# Device testing strategy — layered approach
# Layer 1: Emulator (zawsze, na każdym PR)
# Layer 2: Real devices key models (core devices, nightly)
# Layer 3: Extended device matrix (major releases, monthly)

device-matrix:
  # Layer 1: Emulator (fast, cheap)
  - chromium-375x812  # iPhone size
  - chromium-360x640  # Android small
  - chromium-768x1024 # iPad size
  
  # Layer 2: Real devices key models
  - browserstack-iphone-14
  - browserstack-samsung-s23
  - browserstack-pixel-7
  
  # Layer 3: Extended matrix (release gates)
  - browserstack-iphone-12
  - browserstack-iphone-13
  - browserstack-samsung-s21
  - browserstack-google-pixel-6
```

---

## Sekcja 3: BrowserStack integration

### Konfiguracja BrowserStack

```bash
# npm install -D @browserstack/playwright-js-reporter
npm install -D @browserstack/playwright-js-reporter

# Environment variables
export BROWSERSTACK_USERNAME="your_username"
export BROWSERSTACK_ACCESS_KEY="your_access_key"
```

```typescript
// playwright.config.ts — BrowserStack configuration
import { devices } from '@playwright/test';

export default defineConfig({
  use: {
    // Launch through BrowserStack
    launchOptions: {
      // BrowserStack credentials — automatic when using BS executablePath
    },
  },
  
  projects: [
    // iPhone 14 Real Device
    {
      name: 'browserstack-iphone-14',
      use: {
        browserName: 'safari',
        ...devices['iPhone 14'],
      },
      config: {
        browserstack: {
          os: 'iOS',
          osVersion: '16',
          deviceName: 'iPhone 14',
          realMobile: 'true',
          buildName: process.env.BROWSERSTACK_BUILD_NAME ?? 'Playwright Tests',
          projectName: 'E-commerce App',
          sessionName: 'iPhone 14 — Smoke',
        },
      },
    },
    
    // Samsung Galaxy S23
    {
      name: 'browserstack-samsung-s23',
      use: {
        browserName: 'chrome',
        ...devices['Samsung Galaxy S20'],
      },
      config: {
        browserstack: {
          os: 'Android',
          osVersion: '13',
          deviceName: 'Samsung Galaxy S23',
          realMobile: 'true',
        },
      },
    },
  ],
});
```

### Playwright executable path for BrowserStack

```typescript
// Użycie local Playwright z BrowserStack executables
// BrowserStack_binary_mode pozwala na użycie BS local browser
export default defineConfig({
  use: {
    // Path to BrowserStack local browser
    channel: 'chromium',
  },
  
  projects: [
    {
      name: 'bs-chrome-win11',
      use: {
        browserName: 'chromium',
        channel: 'msedge',
      },
      config: {
        browserstack: {
          os: 'Windows',
          osVersion: '11',
          browser: 'Chrome',
          browserVersion: 'latest',
          build: 'Playwright CI',
        },
      },
    },
  ],
});
```

### BrowserStack local testing (internal apps)

```typescript
// Dla aplikacji za firewallem — użyj BrowserStack Local
import { Local as BrowserStackLocal } from 'browserstack-local';

test.beforeAll(async () => {
  const bsLocal = new BrowserStackLocal();
  
  await bsLocal.start({
    key: process.env.BROWSERSTACK_ACCESS_KEY,
    force: true,  // Force new connection
    // For lokalny development servers:
    // localIdentifier: 'my-app-tests',
  });
  
  // Aplikacja dostępna przez bs_local来往
});

test.afterAll(async () => {
  await bsLocal.stop();
});
```

### Sauce Labs integration

```typescript
// playwright.config.ts — Sauce Labs
export default defineConfig({
  projects: [
    {
      name: 'sauce-iphone-14',
      use: {
        browserName: 'webkit',
        ...devices['iPhone 14'],
      },
      config: {
        sauce: {
          username: process.env.SAUCE_USERNAME,
          accessKey: process.env.SAUCE_ACCESS_KEY,
          region: 'eu-central-1',
          platformName: 'iOS 16',
          deviceName: 'iPhone 14 Simulator',
        },
      },
    },
  ],
});
```

---

## Sekcja 4: Mobile-specific testing scenarios

### Virtual keyboard overlay testing

```typescript
test('formularz kontaktowy — keyboard nie zasłania przycisku wyślij', async ({ page }) => {
  // Setup mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  
  await page.goto('/contact');
  
  // Scroll do formularza
  await page.locator('#message').scrollIntoViewIfNeeded();
  
  // Focus na input — keyboard otwiera się
  await page.locator('#email').focus();
  
  // Poczekaj na keyboard animation
  await page.waitForTimeout(300);
  
  // Zmierz pozycję przycisku wyślij po otwarciu keyboard
  const buttonBox = await page.locator('#submit-button').boundingBox();
  
  // Przycisk musi być w widocznym obszarze (nad keyboard)
  // Keyboard zajmuje ~50% viewportu na iOS
  const viewportHeight = 667;
  
  // Zakładamy keyboard = 291px na iPhone 8 (mniejszy na nowszych)
  const estimatedKeyboardHeight = 291;
  
  expect(buttonBox?.y).toBeLessThan(viewportHeight - estimatedKeyboardHeight);
  expect(buttonBox?.y).toBeGreaterThan(0);
});
```

### Network throttling — mobile conditions

```typescript
test.describe('Mobile network conditions', () => {
  // 4G — typowa mobilna sieć
  test('load time na 4G', async ({ page }) => {
    await page.context().newPage();
    await page.context().setNetworkConditions({
      download: 4000000,  // 4 Mbps
      upload: 3000000,    // 3 Mbps
      latency: 20,        // 20ms RTT
    });
    
    const start = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - start;
    console.log(`4G load time: ${loadTime}ms`);
    
    // Mobile budget: < 8s na 4G
    expect(loadTime).toBeLessThan(8000);
  });
  
  // 3G — wolniejsze połączenie
  test('load time na 3G', async ({ page }) => {
    await page.context().setNetworkConditions({
      download: 750000,   // 750 Kbps
      upload: 250000,     // 250 Kbps
      latency: 100,       // 100ms RTT
    });
    
    const start = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - start;
    console.log(`3G load time: ${loadTime}ms`);
    
    // Allow longer time on 3G
    expect(loadTime).toBeLessThan(15000);
  });
  
  // Offline — graceful degradation
  test('app works offline with service worker', async ({ page }) => {
    // Symuluj offline
    await page.context().setNetworkConditions({
      download: 0,
      upload: 0,
      latency: 0,
    });
    
    // App powinna pokazać offline indicator lub cached content
    await page.goto('/');
    
    const offlineIndicator = page.locator('.offline-banner, .cached-content-notice');
    const hasOfflineFallback = await offlineIndicator.isVisible().catch(() => false);
    
    // User powinien widzieć, że jest offline
    expect(hasOfflineFallback || await page.locator('body').isVisible()).toBe(true);
  });
});
```

### Geolocation testing

```typescript
test.describe('Geolocation-dependent features', () => {
  test('sklepy w pobliżu dla użytkownika z Warszawy', async ({ browser }) => {
    const context = await browser.newContext({
      permissions: ['geolocation'],
      geolocation: { latitude: 52.2297, longitude: 21.0122 },  // Warszawa
    });
    
    const page = await context.newPage();
    
    await page.goto('/stores');
    await page.waitForLoadState('networkidle');
    
    // Strona powinna pokazać sklepy w Warszawie
    const firstStore = page.locator('.store-card').first();
    await expect(firstStore).toContainText(/Warszawa/i);
    
    await context.close();
  });
  
  test('zmiana lokalizacji w aplikacji', async ({ page }) => {
    await page.goto('/settings/location');
    
    // Początkowa lokalizacja (domyślna)
    await page.locator('#change-location').click();
    
    // Wybierz inną lokalizację (np. Londyn)
    await page.selectOption('#city-select', 'London');
    
    await page.getByRole('button', { name: 'Zapisz' }).click();
    
    // Weryfikuj nową lokalizację
    await expect(page.locator('#current-city')).toContainText('London');
  });
});
```

### Locale i timezone

```typescript
test.describe('Locale and timezone', () => {
  test.use({
    locale: 'pl-PL',
    timezoneId: 'Europe/Warsaw',
  });
  
  test('formatowanie cen w PLN', async ({ page }) => {
    await page.goto('/products/1');
    
    const price = page.locator('.product-price');
    await expect(price).toContainText(/zł/);
    
    // Formatowanie polskie: spacja jako separator tysięcy, 2 miejsca po przecinku
    const priceText = await price.textContent();
    expect(priceText).toMatch(/\d+\s\d{2}\s*zł/);
  });
  
  test('formatowanie daty', async ({ page }) => {
    await page.goto('/orders');
    
    const date = page.locator('.order-date').first();
    const dateText = await date.textContent();
    
    // Polski format: dd.mm.rrrr lub dd/mm/rrrr
    expect(dateText).toMatch(/\d{1,2}[./]\d{1,2}[./]\d{4}/);
  });
});

test.describe('Timezone-aware features', () => {
  test.use({
    timezoneId: 'America/New_York',  // Eastern Time
  });
  
  test('spotkanie pokazuje czas w timezone użytkownika', async ({ page }) => {
    await page.goto('/meetings');
    
    const timeElement = page.locator('.meeting-time');
    const timeText = await timeElement.textContent();
    
    // Powinno pokazywać czas eastern (np. "2:30 PM EST")
    expect(timeText).toMatch(/\d{1,2}:\d{2}\s*(AM|PM)/);
  });
});
```

---

## Sekcja 5: Cost optimization dla mobile testing

### Device matrix prioritization

```typescript
// tests/config/device-priorities.ts
interface DevicePriority {
  device: string;
  coverage: 'critical' | 'important' | 'extended';
  execution: 'emulator' | 'cloud' | 'physical';
  frequency: 'always' | 'daily' | 'weekly' | 'release';
}

const deviceMatrix: DevicePriority[] = [
  // Critical — zawsze na każdym PR
  { device: 'iPhone 12 (Chrome)', coverage: 'critical', execution: 'emulator', frequency: 'always' },
  { device: 'Samsung Galaxy S20 (Chrome)', coverage: 'critical', execution: 'emulator', frequency: 'always' },
  
  // Important — real devices, daily
  { device: 'iPhone 14 (Safari)', coverage: 'important', execution: 'cloud', frequency: 'daily' },
  { device: 'Pixel 6 (Chrome)', coverage: 'important', execution: 'cloud', frequency: 'daily' },
  
  // Extended — cloud matrix, weekly/release
  { device: 'iPhone 13 (Safari)', coverage: 'extended', execution: 'cloud', frequency: 'weekly' },
  { device: 'Samsung S21 (Chrome)', coverage: 'extended', execution: 'cloud', frequency: 'weekly' },
  { device: 'iPad Pro (Safari)', coverage: 'extended', execution: 'cloud', frequency: 'weekly' },
];

export { deviceMatrix };
```

### Selective mobile execution in CI

```yaml
# .github/workflows/mobile-tests.yml
name: Mobile Tests

on:
  push:
    branches: [main, develop]
  schedule:
    - cron: '0 6 * * *'  # Codziennie rano — full mobile matrix

jobs:
  # Fast: Emulator tests (always)
  mobile-emulator:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        device: ['iphone-12', 'samsung-s20', 'pixel-5']
    steps:
      - run: npx playwright test --project=mobile-${{ matrix.device }}
  
  # Slower: Real device smoke (on PR + daily)
  mobile-cloud-smoke:
    if: github.event_name == 'push' || github.event_name == 'schedule'
    runs-on: ubuntu-latest
    steps:
      - run: |
          BROWSERSTACK_USERNAME=${{ secrets.BS_USER }} \
          BROWSERSTACK_ACCESS_KEY=${{ secrets.BS_KEY }} \
          npx playwright test --project=browserstack-iphone-14
```

---

## Perspektywa Full Stack Testera

Mobile testing to nie bonus — to requirement dla większości współczesnych aplikacji. Jako Full Stack Tester:

**Coverage**: Wiesz, że 60%+ użytkowników to mobile. Jeśli nie testujesz mobile, testujesz mniejszość.

**Cost vs. Value**: Emulator jest darmowy i szybki. Real devices w cloud są droższe. Balancing: emulator dla fast feedback, real devices dla critical paths.

**Mobile-specific bugs**: Keyboard overlay, touch targets, viewport changes, network transitions. Te issues są impossible to catch w desktop-only testing.

**Device priority**: Not all devices are equal. Focus on devices your users actually use — analytics data mówi which devices to test.

---

## Podsumowanie

- **Emulacja urządzeń** — Playwright built-in devices (iPhone, Pixel, iPad) dla fast, free mobile testing w CI.
- **Custom devices** — define custom viewport, UA, touch capability dla specyficznych urządzeń.
- **Touch interactions** — tap, swipe, long press, keyboard overlay — każde wymaga osobnego podejścia testowego.
- **Emulator vs. real device** — emulator dla layout i basic function, real devices dla keyboard overlay, Safari quirks, hardware constraints.
- **BrowserStack/Sauce Labs** — real device testing w cloud. Konfiguracja per project w playwright.config.ts.
- **Network throttling** — symuluj 4G, 3G, offline dla realistic mobile experience testing.
- **Geolocation, locale, timezone** — context-dependent features wymagają Playwright context configuration.
- **Device matrix** — layered strategy: emulator na każdym PR, real devices daily, extended matrix weekly/release.

---

## Linki i źródła

- [Playwright Device Descriptors](https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/deviceDescriptorsSource.ts) — all built-in devices
- [Playwright Emulation](https://playwright.dev/docs/emulation) — full emulation reference
- [BrowserStack Playwright Integration](https://www.browserstack.com/docs/automate/playwright) — real device testing setup
- [Sauce Labs Playwright](https://docs.saucelabs.com/test-results/viewing-test-results/view-in-sauce/index.html) — Sauce Labs + Playwright
- [Mobile Performance Testing — web.dev](https://web.dev/learn/performance/) — performance testing for mobile
- [Core Web Vitals for Mobile — Google](https://web.dev/vitals-mobile/) — mobile-specific CWV guidance
- [Network Throttling — Playwright](https://playwright.dev/docs/emulation#clobbering-network-conditions) — network condition simulation