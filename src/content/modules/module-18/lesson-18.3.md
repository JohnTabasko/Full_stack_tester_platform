# Node.js, npm i struktura projektu testowego

> **Perspektywa Full Stack Testera**
> Nowa osoba w zespole klonuje repozytorium i chce uruchomić testy. W profesjonalnym projekcie powinna wykonać dokładnie trzy kroki: `npm install`, `npx playwright install` i `npm test`. Jeśli potrzebuje czegoś więcej — dokumentacji, SSH kluczy, ręcznej konfiguracji — coś jest nie tak ze strukturą projektu. W tej lekcji zbudujesz od podstaw profesjonalny projekt Playwright, który jest gotowy do pracy zespołowej, CI/CD i skalowania do setek testów. Nauczysz się zarządzać zależnościami, konfigurować środowisko i tworzyć strukturę katalogów, która sprawi, że każdy członek zespołu — nawet ten, który nigdy nie pisał testów Playwright — będzie wiedział, gdzie co znaleźć i jak uruchomić testy.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Rozumieć** architekturę Node.js i jej znaczenie dla testów Playwright
- **Konfigurować** package.json z jasnymi skryptami i zależnościami
- **Zarządzać** zależnościami z package-lock.json
- **Obsługiwać** zmienne środowiskowe bezpiecznie i konsekwentnie
- **Projektować** strukturę katalogów dla projektu testowego
- **Tworzyć** pliki konfiguracyjne dla różnych środowisk
- **Uruchamiać** testy w sposób reprodukowalny

---

## Wprowadzenie — od klonowania do pierwszego raportu

Profesjonalny projekt testowy powinien być uruchomiony w 5 minut przez każdego, kto ma podstawową znajomość terminala. Jeśli nowy członek zespołu potrzebuje więcej niż:
1. `git clone ...`
2. `npm install`
3. `npx playwright install chromium`
4. `npm test`

...to struktura projektu wymaga refaktoryzacji.

---

## Sytuacja przewodnia — nowa osoba w zespole

Nowa testerka, Ania, dołącza do zespołu. Ma dostęp do repozytorium i 30 minut na uruchomienie testów regresji przed spotkaniem sprint planning. Jeśli po 25 minutach nadal walczy z konfiguracją — traci czas, który mógłaby poświęcić na testowanie. Twój projekt musi być dla Ani przyjazny.

---

## 1. Node.js jako środowisko testów Playwright

### 1.1 Dlaczego Node.js?

Playwright (oraz większość narzędzi do testów E2E w ekosystemie JavaScript) działa na Node.js, ponieważ:

- **Nieblokujący I/O** — idealny do równoległego uruchamiania wielu przeglądarek
- **Ekosystem npm** — dostęp do tysięcy bibliotek
- **Jednolity język** — ten sam TypeScript co w aplikacji frontendowej
- **Łatwe CI/CD** — prosta integracja z GitHub Actions, Jenkins, GitLab CI

### 1.2 Wersja Node.js — wybór właściwej

```bash
# Sprawdź wersję Node.js
node --version
# v22.3.0 (przykład)

# Sprawdź wersję npm
npm --version
# 10.8.1 (przykład)

# Rekomendowana wersja dla Playwright: >=22.x
```

### 1.3 Sprawdzenie wersji w projekcie

```json
// package.json
{
  "engines": {
    "node": ">=22",
    "npm": ">=10"
  }
}
```

### 1.4 Node.js runtime — kontekst dla testera

```typescript
// Gdzie działa Twój kod testowy?
// Node.js = single-threaded event loop + libuv (thread pool dla I/O)

console.log('=== Process Info ===');
console.log('Platform:', process.platform);           // linux, darwin, win32
console.log('Arch:', process.arch);                   // x64, arm64
console.log('Node version:', process.version);        // v22.3.0
console.log('CPU cores:', os.cpus().length);          // Liczba rdzeni
console.log('Total memory:', os.totalmem());          // Pamięć RAM

// Environment variables
console.log('NODE_ENV:', process.env.NODE_ENV);       // development, test, production
console.log('HOME:', process.env.HOME);               // Katalog domowy
```

---

## 2. package.json — interfejs projektu

### 2.1 Minimalny package.json dla Playwright

```json
{
  "name": "playwright-test-suite",
  "version": "1.0.0",
  "description": "E2E test suite for MyApp",
  "private": true,
  "engines": {
    "node": ">=22",
    "npm": ">=10"
  },
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:smoke": "playwright test --grep @smoke",
    "test:regression": "playwright test --grep @regression",
    "test:api": "playwright test --grep @api",
    "test:chromium": "playwright test --project=chromium",
    "test:firefox": "playwright test --project=firefox",
    "test:mobile": "playwright test --project='Mobile Chrome'",
    "test:parallel": "playwright test --workers=4",
    "report": "playwright show-report",
    "report:serve": "npx playwright show-report --port 9323",
    "install:browsers": "playwright install --with-deps chromium firefox webkit",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix",
    "format": "prettier --write \"{src,tests}/**/*.ts\"",
    "clean": "rimraf test-results playwright-report .playwright node_modules/.cache"
  },
  "devDependencies": {
    "@playwright/test": "^1.44.0",
    "@types/node": "^20.14.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint": "^8.57.0",
    "eslint-config-prettier": "^9.1.0",
    "prettier": "^3.3.0",
    "rimraf": "^5.0.0",
    "typescript": "^5.4.0"
  },
  "dependencies": {
    "dotenv": "^16.4.0",
    "zod": "^3.23.0"
  }
}
```

### 2.2 Opis skryptów — co robi każdy?

| Skrypt | Cel | Kiedy używać |
|--------|-----|-------------|
| `npm test` | Uruchom wszystkie testy | Codzienna regresja |
| `npm run test:ui` | Interaktywny tryb UI | Development, pisanie nowych testów |
| `npm run test:debug` | Debugger Playwright | Głęboka analiza pojedynczego testu |
| `npm run test:smoke` | Tylko testy smoke | Szybka weryfikacja przed deploy |
| `npm run test:regression` | Pełna regresja | Przed release |
| `npm run report` | Otwórz HTML report | Po zakończeniu testów |
| `npm run typecheck` | Sprawdź typy TypeScript | PR, CI |
| `npm run lint` | Sprawdź styl kodu | PR, CI |
| `npm run install:browsers` | Zainstaluj przeglądarki | Po git clone, w CI |

### 2.3 Skrypty z flagami Playwright

```json
// package.json — zaawansowane skrypty
{
  "scripts": {
    "test:ci": "playwright test --reporter=github --project=chromium",
    "test:ci:full": "playwright test --reporter=html,json --project=chromium,firefox,webkit",
    "test:shard": "playwright test --shard=1/3 --project=chromium",
    "test:update-snapshots": "playwright test --update-snapshots",
    "test:generate-tests": "playwright codegen https://staging.example.com",
    "test:trace": "playwright test --trace=on",
    "test:video": "playwright test --video=on",
    "test:trace:viewer": "npx playwright show-trace trace.zip",
    "test:auth": "playwright test --grep @auth",
    "test:checkout": "playwright test --grep @checkout",
    "test:api:smoke": "playwright test --grep @api --grep @smoke"
  }
}
```

---

## 3. package-lock.json — deterministyczne zależności

### 3.1 Dlaczego lockfile jest ważny?

`package-lock.json` zapisuje dokładną wersję każdej zależności (włącznie z wersjami transitive). Bez niego:

- Instalacja dziś może dać wersję 1.2.3
- Instalacja za tydzień może dać wersję 1.3.0 (jeśli semver pozwala)
- Testy mogą zachowywać się inaczej w zależności od dnia instalacji

### 3.2 Praktyki pracy z lockfile

```bash
# ✅ DOBRZE: commituj package-lock.json
git add package-lock.json

# ✅ DOBRZE: aktualizuj zależności świadomie
npm install                     # Zachowuje lockfile
npm install lodash@latest       # Aktualizuje lockfile

# ✅ DOBRZE: reinstall dokładnie taki sam stan
npm ci                          # Używa dokładnie wersji z lockfile
# npm ci jest preferowane w CI!

# ❌ ŹLE: usuwanie lockfile
rm package-lock.json
npm install                     # Potencjalnie nowe wersje!
```

### 3.3 Weryfikacja lockfile w CI

```yaml
# .github/workflows/test.yml
- name: Install dependencies
  run: npm ci  # Używa package-lock.json, nie package.json!
```

### 3.4 Aktualizacja zależności bezpiecznie

```bash
# Sprawdź co jest outdated
npm outdated

# Dry run aktualizacji
npm update --dry-run

# Aktualizuj minor/patch (bezpieczne)
npm update

# Aktualizuj major (uwaga na breaking changes!)
npm install playwright@latest

# Lockfile nie jest aktualizowany?
npm install --package-lock-only  # tylko aktualizuje lockfile
```

---

## 4. Zmienne środowiskowe — konfiguracja bez tajemnic

### 4.1 Koncepcja: konfigurowalność przez env vars

```typescript
// config.ts — centralna konfiguracja
import dotenv from 'dotenv';

// Załaduj .env jeśli istnieje
dotenv.config();

interface Config {
  baseUrl: string;
  apiUrl: string;
  timeout: number;
  workers: number;
  headless: boolean;
  screenshotOnFailure: boolean;
  videoOnFailure: boolean;
  traceOnFailure: boolean;
  browser: 'chromium' | 'firefox' | 'webkit';
}

function getEnvOrDefault<T>(key: string, defaultValue: T): T {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  
  // Parsuj różne typy
  if (typeof defaultValue === 'boolean') {
    return (value === 'true' || value === '1') as T;
  }
  if (typeof defaultValue === 'number') {
    return parseInt(value, 10) as T;
  }
  return value as T;
}

export const config: Config = {
  baseUrl: getEnvOrDefault('BASE_URL', 'http://localhost:3000'),
  apiUrl: getEnvOrDefault('API_URL', 'http://localhost:3000/api'),
  timeout: getEnvOrDefault('TIMEOUT', 30000),
  workers: getEnvOrDefault('WORKERS', 4),
  headless: getEnvOrDefault('HEADLESS', true),
  screenshotOnFailure: getEnvOrDefault('SCREENSHOT_ON_FAILURE', true),
  videoOnFailure: getEnvOrDefault('VIDEO_ON_FAILURE', true),
  traceOnFailure: getEnvOrDefault('TRACE_ON_FAILURE', true),
  browser: getEnvOrDefault('BROWSER', 'chromium') as Config['browser'],
};
```

### 4.2 .env.example — szablon bez sekretów

```env
# .env.example — ten plik JEST w repozytorium!

# === URL'e ===
BASE_URL=http://localhost:3000
API_URL=http://localhost:3000/api

# === Playwright ===
BROWSER=chromium
WORKERS=4
TIMEOUT=30000
HEADLESS=true
SCREENSHOT_ON_FAILURE=true
VIDEO_ON_FAILURE=false
TRACE_ON_FAILURE=true

# === baza danych ===
DB_HOST=localhost
DB_PORT=5432
DB_NAME=playwright_test
DB_USER=test_user
# DB_PASSWORD= — NIE dodawaj tutaj!

# === API tokens ===
# API_TOKEN= — NIE dodawaj tutaj!

# === Feature flags ===
FEATURE_NEW_CHECKOUT=false
FEATURE_BETA_DASHBOARD=false
```

### 4.3 .gitignore — wykluczenie sekretów

```gitignore
# .gitignore

# Environment variables — sekrety NIGDY nie są w repo!
.env
.env.local
.env.*.local
.env.production
*.env

# Playwright
test-results/
playwright-report/
playwright/.cache/
videos/
traces/

# Logs
*.log
npm-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Build
dist/
build/
```

### 4.4 Bezpieczne zarządzanie sekretami

```typescript
// ❌ ŹLE: sekret w kodzie
const apiToken = 'sk-live-abc123def456ghi';

// ✅ DOBRZE: sekret z environment variable
const apiToken = process.env.API_TOKEN;
if (!apiToken) {
  throw new Error('API_TOKEN environment variable is required');
}

// ✅ NAJLEPSZE: walidacja przy starcie
import { z } from 'zod';

const envSchema = z.object({
  BASE_URL: z.string().url(),
  API_TOKEN: z.string().min(1),
  DB_PASSWORD: z.string().min(8),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
```

---

## 5. Struktura katalogów — profesjonalny układ

### 5.1 Rekomendowana struktura

```
playwright-learning-platform/
├── src/
│   ├── renderer/              # Kod aplikacji (nie dotyczy testów)
│   │   └── ...
│   └── content/              # Treści kursu
│       └── modules/
│
├── tests/                    # ✅ GŁÓWNY KATALOG TESTÓW
│   ├── e2e/                  # Testy E2E (UI flow)
│   │   ├── auth/
│   │   │   ├── login.spec.ts
│   │   │   ├── logout.spec.ts
│   │   │   └── registration.spec.ts
│   │   ├── checkout/
│   │   │   ├── add-to-cart.spec.ts
│   │   │   ├── checkout-flow.spec.ts
│   │   │   └── payment.spec.ts
│   │   └── smoke/
│   │       └── smoke.spec.ts
│   │
│   ├── api/                  # Testy API
│   │   ├── users.api.spec.ts
│   │   ├── orders.api.spec.ts
│   │   └── products.api.spec.ts
│   │
│   ├── integration/          # Testy integracyjne
│   │   └── database/
│   │       └── data-integrity.spec.ts
│   │
│   ├── pages/                # Page Object Models
│   │   ├── base.page.ts
│   │   ├── login.page.ts
│   │   ├── dashboard.page.ts
│   │   ├── checkout.page.ts
│   │   └── admin/
│   │       └── admin.page.ts
│   │
│   ├── components/           # Reużywalne komponenty
│   │   ├── modal.component.ts
│   │   ├── form.component.ts
│   │   └── toast.component.ts
│   │
│   ├── fixtures/             # Playwright fixtures
│   │   ├── db.fixture.ts
│   │   ├── api.fixture.ts
│   │   ├── auth.fixture.ts
│   │   └── test-data.fixture.ts
│   │
│   ├── utils/                # Funkcje pomocnicze
│   │   ├── api-client.ts
│   │   ├── data-generators.ts
│   │   ├── wait-helpers.ts
│   │   └── assert-helpers.ts
│   │
│   ├── factories/            # Data factories (builders)
│   │   ├── user.factory.ts
│   │   ├── order.factory.ts
│   │   └── product.factory.ts
│   │
│   └── config/
│       ├── test.config.ts
│       └── environments.ts
│
├── playwright.config.ts      # Konfiguracja Playwright
├── tsconfig.json             # Konfiguracja TypeScript
├── .eslintrc.js              # Konfiguracja ESLint
├── .prettierrc               # Konfiguracja Prettier
├── .env.example              # Szablon zmiennych środowiskowych
├── package.json
├── package-lock.json
└── README.md
```

### 5.2 Alternatywna struktura dla mniejszych projektów

```
tests/
├── *.spec.ts               # Testy na poziomie głównym
├── pages/                  # Page Objects
├── fixtures/               # Fixtures
├── utils/                  # Helpers
└── data/                   # Statyczne dane testowe
```

### 5.3 Zasada: konwencja nazewnictwa

```typescript
// ✅ DOBRZE: konsekwentne nazewnictwo plików
login.page.ts           // Page Object
login.spec.ts           // Test
login.fixture.ts        // Fixture
login.helper.ts         // Helper

// ✅ DOBRZE: grupowanie przez @tag
// login.spec.ts
test.describe('Login', () => {
  test('@smoke @auth should login with valid credentials', () => { });
  test('@auth should show error with invalid password', () => { });
  test('@auth should redirect after successful login', () => { });
});

// ✅ DOBRZE: eksportowanie Page Object z fixtures
// tests/pages/login.page.ts
export class LoginPage {
  constructor(private page: Page) {}
  
  async login(email: string, password: string) {
    await this.page.fill('[data-testid="email"]', email);
    await this.page.fill('[data-testid="password"]', password);
    await this.page.click('[data-testid="submit"]');
  }
}

// tests/fixtures/page.fixture.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

export const test = base.extend<{ loginPage: LoginPage }>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});
```

---

## 6. Konfiguracja Playwright — playwright.config.ts

### 6.1 Kompletna konfiguracja

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Wczytaj zmienne środowiskowe z .env
import 'dotenv/config';

export default defineConfig({
  // Katalog z testami
  testDir: './tests',
  
  // Pliki testowe (glob pattern)
  testMatch: '**/*.spec.ts',
  
  // Pliki do pominięcia
  testIgnore: ['**/tmp/**', '**/*.backup.ts'],
  
  // Timeout dla każdego testu (ms)
  timeout: 30000,
  
  // Timeout dla expect (ms)
  expect: {
    timeout: 5000,
  },
  
  // Poziomy powtórzeń przy niepowodzeniu
  retries: process.env.CI ? 2 : 0,
  
  // Liczba równoległych workerów
  workers: process.env.CI ? 2 : undefined,  // undefined = wszystkie dostępne
  
  // Reporter (konsolowy + HTML + JSON dla CI)
  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: 'playwright-report' }]]
    : [['list'], ['html', { outputFolder: 'playwright-report' }]],
  
  // Globalne setup/teardown
  globalSetup: './tests/config/global-setup.ts',
  globalTeardown: './tests/config/global-teardown.ts',
  
  // Konfiguracja dla każdego projektu (przeglądarki)
  projects: [
    {
      name: 'chromium',
      testDir: './tests/e2e',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
      },
    },
    {
      name: 'firefox',
      testDir: './tests/e2e',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
        trace: 'on-first-retry',
      },
    },
    {
      name: 'webkit',
      testDir: './tests/e2e',
      use: {
        ...devices['Desktop Safari'],
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
        trace: 'on-first-retry',
      },
    },
    {
      name: 'Mobile Chrome',
      testDir: './tests/e2e',
      use: {
        ...devices['Pixel 5'],
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
        isMobile: true,
      },
    },
    {
      name: 'Mobile Safari',
      testDir: './tests/e2e',
      use: {
        ...devices['iPhone 12'],
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
        isMobile: true,
      },
    },
  ],
  
  use: {
    // Bazowy URL dla wszystkich testów
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Lokalizacja artifactów
    screenshotDir: './test-results/zrzuty ekranu',
    videoDir: './test-results/videos',
    traceDir: './test-results/traces',
    
    // Ignoruj domyślne timeouty (tylko dla debugowania)
    actionTimeout: 0,
    navigationTimeout: 0,
  },
  
  outputDir: './test-results',  // Katalog na artefakty testów
});
```

### 6.2 Global setup — przygotowanie środowiska

```typescript
// tests/config/global-setup.ts
import { chromium, FullConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

async function globalSetup(config: FullConfig) {
  console.log('=== Global Setup ===');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Base URL: ${process.env.BASE_URL}`);
  
  // Upewnij się, że aplikacja działa
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    const response = await page.goto(process.env.BASE_URL || 'http://localhost:3000');
    if (!response || response.status() >= 500) {
      throw new Error(`Application is not responding: ${response?.status()}`);
    }
    console.log('✓ Application is running');
  } catch (error) {
    console.error('❌ Application check failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
  
  // Upewnij się, że baza danych jest gotowa (opcjonalnie)
  // await seedDatabase();
  
  console.log('✓ Global setup complete');
}

export default globalSetup;
```

### 6.3 Global teardown — sprzątanie

```typescript
// tests/config/global-teardown.ts
import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('=== Global Teardown ===');
  
  // Cleanup test data (jeśli używasz dedykowanej bazy)
  // await cleanupTestDatabase();
  
  console.log('✓ Global teardown complete');
}

export default globalTeardown;
```

---

## 7. README.md — dokumentacja dla zespołu

```markdown
# Playwright Test Suite

E2E test suite dla aplikacji MyApp.

## Szybki start

```bash
# Zainstaluj zależności
npm install

# Zainstaluj przeglądarki
npx playwright install --with-deps chromium

# Uruchom testy
npm test

# Otwórz raport
npm run report
```

## Wymagania

- Node.js >= 20
- npm >= 10

## Dostępne skrypty

| Skrypt | Opis |
|--------|------|
| `npm test` | Uruchom wszystkie testy |
| `npm run test:ui` | Interaktywny tryb UI |
| `npm run test:smoke` | Testy smoke |
| `npm run test:regression` | Pełna regresja |
| `npm run report` | Otwórz HTML raport |
| `npm run typecheck` | Sprawdź typy TypeScript |
| `npm run lint` | Sprawdź styl kodu |

## Zmienne środowiskowe

Skopiuj `.env.example` do `.env` i uzupełnij wartości:

```bash
cp .env.example .env
```

## Struktura katalogów

```
tests/
├── e2e/          # Testy E2E
├── api/          # Testy API
├── pages/        # Page Object Models
├── fixtures/     # Playwright fixtures
├── utils/        # Funkcje pomocnicze
└── factories/    # Data factories
```

## Konwencje

- Każdy test ma tag: `@smoke`, `@regression`, `@auth`, `@checkout`
- Testy E2E używają Page Object Model
- Dane testowe są generowane przez factories
- Sekrety są w .env (nigdy w kodzie!)

## CI/CD

Testy uruchamiane automatycznie w:
- GitHub Actions na pull request
- Jenkins na deploy do staging

## Troubleshooting

**Testy padają z powodu timeoutu?**
→ Zwiększ `timeout` w `playwright.config.ts`

**Playwright nie znajduje przeglądarki?**
→ Uruchom `npx playwright install chromium`

**Błąd "Application is not responding"?**
→ Upewnij się, że aplikacja działa na `BASE_URL`
```

---

## Perspektywa Full Stack Testera

Struktura projektu to pierwsza rzecz, którą ocenia nowy członek zespołu. Jeśli widzi:
- Jasny `package.json` z opisanymi skryptami
- Konsekwentną strukturę katalogów
- Działający `npm install && npm test`

...to wie, że projekt jest profesjonalny i godny zaufania. Jeśli widzi chaos i brak dokumentacji — traci wiarę w jakość testów, zanim jeszcze pierwszy test został uruchomiony.

Pamiętaj: jako Full Stack Tester jesteś nie tylko wykonawcą testów, ale też architektem procesu testowego. Dobra struktura projektu to fundament, na którym budujesz wszystko inne.

---

## Podsumowanie

- **Node.js** to runtime dla Playwright — rozumiej jego architekturę (event loop, non-blocking I/O)
- **package.json** dokumentuje interfejs projektu — skrypty są ważniejsze niż mogłoby się wydawać
- **package-lock.json** gwarantuje deterministyczne instalacje — commituj go, używaj `npm ci` w CI
- **Zmienne środowiskowe** pozwalają na konfigurację bez zmiany kodu — sekrety poza repozytorium
- **Struktura katalogów** powinna być intuicyjna dla nowej osoby w zespole
- **playwright.config.ts** kontroluje całe zachowanie testów — poznaj wszystkie opcje
- **Global setup/teardown** pozwalają na przygotowanie i sprzątanie środowiska

---

## Linki i źródła

- **[Node.js Documentation](https://nodejs.org/docs/)** — oficjalna dokumentacja Node.js
- **[npm Documentation](https://docs.npmjs.com/)** — zarządzanie pakietami npm
- **[Playwright Configuration](https://playwright.dev/docs/test-configuration)** — wszystkie opcje konfiguracji Playwright
- **[12 Factor App — Config](https://12factor.net/config)** — filozofia zarządzania konfiguracją
- **[direnv — Environment Variables](https://direnv.net/)** — automatyczne ładowanie .env
- **[Effective Playwright Config — GitHub](https://github.com/microsoft/playwright/blob/main/packages/playwright/src/common/playwrightSettings.ts)** — rekomendacje Microsoftu
- **[TypeScript + Playwright Best Practices](https://github.com/playwright-community/best-practices)** — społecznościowe best practices
---

## `npm ci` vs `npm install`

W CI używaj `npm ci`, bo instaluje dokładnie wersje z lockfile i kończy się błędem, jeśli `package-lock.json` nie pasuje do `package.json`.

```bash
npm ci
npm test
```

`npm install` jest dobre lokalnie do aktualizacji zależności, ale w pipeline powinien działać deterministyczny install.

## ESM vs CommonJS

Node.js obsługuje dwa światy modułów: CommonJS (`require`) i ESM (`import`). Mieszanie ich bywa źródłem problemów w konfiguracji testów, CLI i narzędziach.

Sprawdzaj:

- pole `type` w `package.json`;
- rozszerzenia `.cjs`, `.mjs`, `.ts`;
- sposób eksportu konfiguracji;
- kompatybilność bibliotek.

## Exit codes w CI

Skrypty testowe powinny zwracać poprawny kod wyjścia. Jeśli testy padają, proces musi zakończyć się kodem różnym od zera. Nie ukrywaj błędów przez `|| true`, chyba że świadomie zbierasz raport w osobnym kroku i później failujesz pipeline.
