# Konfiguracja `playwright.config.ts` — omówienie szczegółowe

`playwright.config.ts` jest centrum sterowania projektem Playwright. To tutaj określasz, gdzie znajdują się testy, jakie przeglądarki uruchamiać, jak długo czekać na akcje i asercje, kiedy robić screenshoty, kiedy nagrywać trace, ile razy ponawiać testy, jak działać w CI i czy aplikacja ma być uruchamiana automatycznie przed testami.

Początkujący często traktują konfigurację jako plik, którego „lepiej nie ruszać”. W profesjonalnym projekcie jest odwrotnie: konfiguracja musi być świadoma, czytelna i uzasadniona, bo wpływa na stabilność, szybkość i diagnostykę całej automatyzacji.

## 1. Minimalny przykład

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
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

`defineConfig()` daje typowanie i podpowiedzi. Dzięki temu łatwiej wykryć literówki w nazwach opcji.

## 2. Lokalizacja testów

```typescript
export default defineConfig({
  testDir: './tests',
  testMatch: ['**/*.spec.ts', '**/*.e2e.ts'],
  testIgnore: ['**/*.manual.spec.ts', '**/examples/**'],
});
```

- `testDir` mówi, gdzie Playwright szuka testów.
- `testMatch` zawęża wzorce plików.
- `testIgnore` wyklucza pliki, których nie chcesz uruchamiać automatycznie.

Dzięki temu przypadkowe eksperymenty nie trafią do CI.

## 3. Timeouty — nie wszystkie znaczą to samo

W Playwright istnieje kilka poziomów timeoutów:

| Opcja | Co kontroluje | Typowy przykład |
|---|---|---|
| `timeout` | maksymalny czas całego testu | `30_000` |
| `expect.timeout` | czas oczekiwania asercji web-first | `5_000` |
| `actionTimeout` | czas pojedynczej akcji, np. click/fill | `10_000` |
| `navigationTimeout` | czas nawigacji | `20_000` |
| `globalTimeout` | maksymalny czas całego uruchomienia suite | `60 * 60 * 1000` |

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

Nie zwiększaj timeoutów bez diagnozy. Jeśli test losowo nie znajduje elementu, problemem może być zły locator, brak oczekiwania na proces domenowy albo niestabilne środowisko.

## 4. `use` — domyślne opcje przeglądarki i kontekstu

Sekcja `use` ustawia opcje przekazywane do fixtures takich jak `page`, `context` i `request`.

```typescript
export default defineConfig({
  use: {
    baseURL: 'https://staging.example.com',
    locale: 'pl-PL',
    timezoneId: 'Europe/Warsaw',
    viewport: { width: 1440, height: 900 },
    colorScheme: 'light',
    ignoreHTTPSErrors: true,
    permissions: ['clipboard-read', 'clipboard-write'],
    geolocation: { latitude: 52.2297, longitude: 21.0122 },
    storageState: 'playwright/.auth/user.json',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
```

Najważniejsze opcje `use`:

- `baseURL` — pozwala pisać `page.goto('/login')` zamiast pełnego adresu;
- `storageState` — zapisane cookies/localStorage, często do logowania;
- `viewport` — rozmiar okna;
- `locale`, `timezoneId` — testy lokalizacji;
- `permissions`, `geolocation` — uprawnienia i lokalizacja;
- `offline` — tryb offline;
- `httpCredentials` — Basic Auth;
- `proxy` — testy przez proxy;
- `trace`, `video`, `screenshot` — artefakty diagnostyczne.

## 5. Projekty, czyli testy w wielu wariantach

`projects` pozwalają uruchamiać te same testy w wielu konfiguracjach.

```typescript
export default defineConfig({
  projects: [
    {
      name: 'desktop-chrome',
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
  ],
});
```

Projekt może reprezentować:

- przeglądarkę;
- urządzenie;
- rolę użytkownika;
- region;
- konfigurację feature flag;
- tryb dark/light;
- setup zależny od innego projektu.

Nie twórz projektów „na wszelki wypadek”. Każdy projekt zwiększa czas wykonania suite. Powinien wynikać z ryzyka produktowego.

## 6. Setup project i logowanie

Oficjalna dokumentacja rekomenduje przygotowanie logowania przez setup project i `storageState`.

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

Przykład testu setup:

```typescript
import { test as setup, expect } from '@playwright/test';

setup('authenticate user', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_USER!);
  await page.getByLabel('Password').fill(process.env.E2E_PASSWORD!);
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByRole('heading', { name: 'Panel' })).toBeVisible();
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
```

Pliki `.auth/*.json` z prawdziwą sesją traktuj jak sekrety. Nie commituj ich do repozytorium.

## 7. Retry, workers i `forbidOnly`

```typescript
export default defineConfig({
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  fullyParallel: true,
});
```

- `forbidOnly` zatrzymuje CI, jeśli ktoś zostawi `test.only`.
- `retries` pozwala zebrać diagnostykę flaky testów, ale nie powinno maskować problemów.
- `workers` steruje równoległością.
- `fullyParallel` uruchamia równolegle także testy z jednego pliku, jeśli są niezależne.

Włączanie `fullyParallel` bez izolacji danych to prosty sposób na losowe awarie.

## 8. Reportery

```typescript
export default defineConfig({
  reporter: process.env.CI
    ? [
        ['list'],
        ['html', { open: 'never' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
      ]
    : [['list'], ['html']],
});
```

HTML report jest najlepszy do analizy lokalnej i artefaktów CI. JUnit jest przydatny dla systemów CI, które pokazują wyniki testów w interfejsie pipeline.

## 9. Trace, screenshoty i video

Najczęstsza konfiguracja diagnostyczna:

```typescript
use: {
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```

Tryby są kompromisem między diagnostyką a kosztem:

- `trace: 'on'` — bardzo dużo danych, dobre do debugowania, słabe jako domyślne CI;
- `trace: 'on-first-retry'` — dobry kompromis;
- `screenshot: 'only-on-failure'` — tani i pomocny;
- `video: 'retain-on-failure'` — pomocne, ale cięższe niż screenshot.

## 10. Web server

Playwright może uruchomić aplikację przed testami:

```typescript
export default defineConfig({
  webServer: {
    command: 'npm run start:test',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

To dobre w projektach frontendowych i demo. W większych systemach aplikację często uruchamia Docker Compose, Kubernetes albo pipeline CI.

## 11. Zmienne środowiskowe i sekrety

Konfiguracja powinna być elastyczna:

```typescript
const isCI = !!process.env.CI;
const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  use: { baseURL },
  retries: isCI ? 2 : 0,
});
```

Nie zapisuj haseł, tokenów i sesji w konfiguracji. Używaj sekretów CI, `.env` lokalnie i `.env.example` jako dokumentacji.

## 12. Lokalne nadpisania konfiguracji

Niektóre ustawienia można nadpisać w teście:

```typescript
import { test, expect } from '@playwright/test';

test.use({ locale: 'en-US', timezoneId: 'America/New_York' });

test('użytkownik widzi datę w formacie USA', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.getByTestId('date-format')).toHaveText('07/09/2026');
});
```

Lokalne nadpisania są dobre, gdy test sprawdza konkretny wariant. Nie używaj ich chaotycznie.

## 13. Przykładowa kompletna konfiguracja startowa

```typescript
import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 4 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: isCI
    ? [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]]
    : [['list'], ['html']],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run start:test',
    url: 'http://localhost:3000',
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
```

## 14. Typowe błędy

- Jedna ogromna konfiguracja z logiką biznesową.
- Brak `forbidOnly` w CI.
- Trace i video zawsze włączone bez potrzeby.
- Projekty uruchamiane dla każdej przeglądarki bez analizy ryzyka.
- Timeouty zwiększane zamiast diagnozy problemu.
- Sekrety zapisane w repozytorium.
- Brak raportów jako artefaktów CI.

## 15. Checklista review konfiguracji

- Czy `baseURL` jest jawne i zależne od środowiska?
- Czy `forbidOnly` działa w CI?
- Czy retry jest świadomą decyzją?
- Czy trace/screenshot/video mają rozsądną retencję?
- Czy projekty odpowiadają realnym wymaganiom?
- Czy timeouty są uzasadnione?
- Czy setup logowania nie zapisuje sekretów do repozytorium?
- Czy raport HTML i JUnit są dostępne w CI?
- Czy konfiguracja jest czytelna dla nowej osoby w zespole?

## Linki

- [Test configuration](https://playwright.dev/docs/test-configuration)
- [Test use options](https://playwright.dev/docs/test-use-options)
- [Projects](https://playwright.dev/docs/test-projects)
- [Authentication](https://playwright.dev/docs/auth)
- [Reporters](https://playwright.dev/docs/test-reporters)
- [Web server](https://playwright.dev/docs/test-webserver)
