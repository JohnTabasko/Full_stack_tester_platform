# Zaawansowana konfiguracja testów — `playwright.config.ts` jako centrum sterowania

Konfiguracja Playwright nie jest tylko plikiem technicznym. To kontrakt opisujący, jak projekt testowy uruchamia przeglądarki, jak długo czeka na akcje i asercje, jakie artefakty zapisuje, jak obsługuje retry, jakie środowiska testuje i jak zachowuje się lokalnie oraz w CI.

W małym projekcie można uruchomić testy z domyślną konfiguracją. W projekcie komercyjnym `playwright.config.ts` decyduje o stabilności, szybkości i diagnostyce całego procesu jakości.

## 1. Minimalna konfiguracja

Typowy plik wygląda tak:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

`defineConfig()` nie jest obowiązkowe, ale daje lepsze typowanie i podpowiedzi TypeScript.

## 2. Najważniejsze poziomy konfiguracji

Playwright ma kilka poziomów ustawień:

1. ustawienia globalne runnera, np. `testDir`, `timeout`, `retries`, `workers`;
2. ustawienia `expect`, np. timeout asercji;
3. ustawienia `use`, przekazywane do fixtures takich jak `page` i `context`;
4. `projects`, czyli warianty uruchomienia;
5. lokalne nadpisania przez `test.use()` i `test.describe.configure()`.

Zasada praktyczna: konfiguracja globalna powinna opisywać strategię projektu, a nie ukrywać wyjątków pojedynczego testu.

## 3. `testDir`, `testMatch`, `testIgnore`

```typescript
export default defineConfig({
  testDir: './tests',
  testMatch: ['**/*.spec.ts', '**/*.e2e.ts'],
  testIgnore: ['**/examples/**', '**/*.manual.spec.ts'],
});
```

Używaj spójnych nazw plików. Jeśli część testów jest manualnym eksperymentem, nie powinna przypadkowo trafiać do CI.

## 4. Timeouty

W Playwright istnieje kilka różnych timeoutów i nie należy ich mieszać:

| Timeout | Co kontroluje | Przykład |
|---|---|---|
| `timeout` | maksymalny czas całego testu | `timeout: 30_000` |
| `expect.timeout` | czas ponawiania web-first assertions | `expect: { timeout: 5_000 }` |
| `actionTimeout` | czas pojedynczych akcji, np. click/fill | `use: { actionTimeout: 10_000 }` |
| `navigationTimeout` | czas nawigacji | `use: { navigationTimeout: 15_000 }` |
| `globalTimeout` | maksymalny czas całego uruchomienia suite | `globalTimeout: 60 * 60 * 1000` |

Przykład:

```typescript
export default defineConfig({
  timeout: 45_000,
  globalTimeout: 60 * 60 * 1000,
  expect: { timeout: 7_000 },
  use: {
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },
});
```

Nie rozwiązuj flakiness przez bezmyślne zwiększanie timeoutów. Najpierw sprawdź, czy test czeka na właściwy warunek.

## 5. `use` — opcje kontekstu i strony

`use` ustawia domyślne opcje dla fixtures. To tutaj trafiają ustawienia środowiska przeglądarki.

```typescript
export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    locale: 'pl-PL',
    timezoneId: 'Europe/Warsaw',
    viewport: { width: 1440, height: 900 },
    colorScheme: 'light',
    ignoreHTTPSErrors: true,
    storageState: 'playwright/.auth/user.json',
    permissions: ['clipboard-read', 'clipboard-write'],
    geolocation: { latitude: 52.2297, longitude: 21.0122 },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
```

Najczęstsze opcje `use`:

- `baseURL` — skraca `page.goto('/login')`;
- `storageState` — zapisany stan logowania;
- `viewport` — rozmiar okna;
- `deviceScaleFactor`, `isMobile`, `hasTouch` — emulacja urządzeń;
- `locale`, `timezoneId` — testy lokalizacji;
- `permissions`, `geolocation` — uprawnienia i lokalizacja;
- `offline` — tryb offline;
- `httpCredentials` — Basic Auth;
- `proxy` — testy przez proxy;
- `trace`, `video`, `screenshot` — artefakty diagnostyczne.

## 6. Projects — testowanie wielu wariantów

`projects` pozwalają uruchamiać te same testy w różnych konfiguracjach.

```typescript
export default defineConfig({
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 15'] },
    },
    {
      name: 'admin',
      use: { storageState: 'playwright/.auth/admin.json' },
    },
    {
      name: 'user',
      use: { storageState: 'playwright/.auth/user.json' },
    },
  ],
});
```

Projekty mogą reprezentować:

- przeglądarki;
- urządzenia;
- role użytkownika;
- regiony;
- feature flagi;
- środowiska;
- tryby graficzne/dark mode;
- setupy zależne od innych projektów.

## 7. Setup project i zależności projektów

Oficjalnie rekomendowany sposób przygotowania logowania to setup project.

```typescript
export default defineConfig({
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
```

Przykładowy setup:

```typescript
// tests/auth.setup.ts
import { test as setup, expect } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_USER!);
  await page.getByLabel('Password').fill(process.env.E2E_PASSWORD!);
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByRole('heading', { name: 'Panel' })).toBeVisible();
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
```

Nie zapisuj plików `.auth` z prawdziwymi sesjami do repozytorium.

## 8. Retry, workers i CI

```typescript
export default defineConfig({
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  fullyParallel: true,
});
```

- `forbidOnly` chroni CI przed przypadkowym `test.only`.
- `retries` pomaga klasyfikować flaky tests, ale nie powinno maskować problemów.
- `workers` kontroluje równoległość.
- `fullyParallel` pozwala uruchamiać testy z jednego pliku równolegle, jeżeli są niezależne.

## 9. Reportery

```typescript
export default defineConfig({
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'results/junit.xml' }]]
    : [['list'], ['html']],
});
```

W CI raport HTML powinien być zapisany jako artifact. JUnit przydaje się do integracji z narzędziami CI.

## 10. Web server

Playwright może sam uruchomić aplikację przed testami:

```typescript
export default defineConfig({
  webServer: {
    command: 'npm run start:test',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

To dobre dla aplikacji frontendowych. W większych systemach środowisko bywa uruchamiane przez Docker Compose albo pipeline CI.

## 11. Lokalna konfiguracja w testach

Nie wszystko musi być globalne. Playwright pozwala nadpisywać konfigurację lokalnie.

```typescript
import { test, expect } from '@playwright/test';

test.use({ locale: 'en-US', timezoneId: 'America/New_York' });

test.describe.configure({ mode: 'serial', retries: 1 });

test('format daty dla USA', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.getByTestId('date-format')).toHaveText('07/09/2026');
});
```

Używaj lokalnych nadpisań tylko tam, gdzie mają jasne uzasadnienie.

## 12. Zmienne środowiskowe

Konfiguracja często zależy od środowiska:

```typescript
const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';
const isCI = !!process.env.CI;

export default defineConfig({
  use: { baseURL },
  retries: isCI ? 2 : 0,
});
```

Nigdy nie wpisuj sekretów w `playwright.config.ts`. Używaj zmiennych środowiskowych i sekretów CI.

## 13. Typowe błędy

### Zbyt dużo logiki w konfiguracji

Konfiguracja powinna opisywać środowisko testowe, a nie zawierać złożoną logikę biznesową.

### Jedna konfiguracja dla wszystkich potrzeb

Smoke, regression, mobile i visual tests mogą wymagać różnych projektów albo różnych komend CI.

### Artefakty zawsze włączone

Trace i video są bardzo pomocne, ale kosztują czas i miejsce. Częsty kompromis: `trace: 'on-first-retry'`, `video: 'retain-on-failure'`, `screenshot: 'only-on-failure'`.

### Brak `forbidOnly` w CI

`test.only` w repozytorium potrafi sprawić, że pipeline uruchomi tylko jeden test i fałszywie przejdzie.

## 14. Checklista konfiguracji projektu

- Czy `baseURL` jest ustawiony?
- Czy CI ma `forbidOnly: true`?
- Czy retry działa tylko tam, gdzie ma sens?
- Czy trace/video/screenshot mają rozsądną retencję?
- Czy projekty odpowiadają realnym macierzom ryzyka?
- Czy auth setup nie używa sekretów zapisanych w repozytorium?
- Czy `webServer` ma timeout i `reuseExistingServer`?
- Czy raport HTML i JUnit są dostępne w CI?
- Czy timeouty są jawne i uzasadnione?

## 15. Ćwiczenie praktyczne

Stwórz konfigurację dla aplikacji e-commerce:

1. `setup` zapisujący `storageState` użytkownika.
2. Projekt `chromium-user` zależny od `setup`.
3. Projekt `mobile-safari` dla najważniejszych smoke testów.
4. Reporter HTML i JUnit w CI.
5. `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`.
6. `forbidOnly` oraz `retries` zależne od `process.env.CI`.

## Linki

- [Playwright Test configuration](https://playwright.dev/docs/test-configuration)
- [Playwright Test use options](https://playwright.dev/docs/test-use-options)
- [Playwright projects](https://playwright.dev/docs/test-projects)
- [Authentication](https://playwright.dev/docs/auth)
- [Reporters](https://playwright.dev/docs/test-reporters)
- [Web server](https://playwright.dev/docs/test-webserver)
