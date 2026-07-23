# Runner testów Playwright — kompletny przewodnik

> **Perspektywa Full Stack Testera**
> Playwright Test to nie jest zwykła biblioteka asercyjna, którą można "podpiąć" do projektu. To zaawansowany silnik wykonawczy (test runner), który zarządza całym cyklem życia testu: od momentu jego zdefiniowania, przez izolację środowiskową, równoległe wykonanie, diagnostykę błędów, aż po generowanie czytelnych raportów. Zrozumienie architektury runnera pozwala pisać testy, które są nie tylko poprawne, ale także szybkie, stabilne i łatwe w utrzymaniu — nawet gdy Twój zespół rośnie do kilkudziesięciu testerów i tysięcy przypadków testowych.

## Cel lekcji

Po ukończeniu tej lekcji rozumiesz architekturę silnika testowego Playwrighta, potrafisz efektywnie organizować testy przy użyciu `test.describe`, `test.step` i tagowania, znasz wszystkie adnotacje sterujące wykonaniem (`skip`, `fixme`, `only`, `fail`, `slow`), rozumiesz strategię retries i timeoutów oraz wiesz, jak skonfigurować test runner dla różnych środowisk (lokalne, CI, debug).

---

## Architektura testu: Fundament silnika Playwright

### Model jednostek testowych

Playwright Test opiera się na prostej, ale potężnej hierarchii jednostek:

```
Playwright Test Runner
├── Configuration (playwright.config.ts)
│   ├── Globalne timeouty
│   ├── Projekty (różne przeglądarki/urządzenia)
│   ├── Retries
│   └── Reporter (HTML, JSON, JUnit)
│
├── test.describe('Moduł')       ← Grupa testów (suite)
│   ├── test.describe('Podgrupa') ← Podgrupa (nested suite)
│   │   ├── test('przypadek A')  ← Pojedynczy test
│   │   └── test('przypadek B')  ← Pojedynczy test
│   └── test('przypadek C')      ← Pojedynczy test
│
└── Hooks (beforeAll, beforeEach, afterAll, afterEach)
```

Każda jednostka ma ściśle określony cykl życia:
1. **Setup**: Inicjalizacja fikstur i kontekstów przeglądarki.
2. **Test execution**: Wykonanie kodu testu w izolowanym środowisku.
3. **Teardown**: Sprzątanie zasobów, zamykanie przeglądarek, zapisywanie trace.

### Izolacja przez fixture `page`

Podstawowa izolacja w Playwrightzie pochodzi z fixture `page`. Każdy test dostaje **własną, świeżą kartę przeglądarki** (nie współdzieloną z innymi testami). To rozwiązuje fundamentalny problem Selenium, gdzie współdzielony stan przeglądarki prowadził do "flaky tests".

```typescript
import { test, expect } from '@playwright/test';

// Każde wywołanie test() = nowa izolowana karta przeglądarki
test('użytkownik może się zalogować', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('test@example.pl');
  await page.getByLabel('Hasło').fill('haslo123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  
  await expect(page).toHaveURL('/dashboard');
});

test('formularz rejestracji waliduje email', async ({ page }) => {
  // Ta karta przeglądarki jest CAŁKOWICIE odizolowana od testu powyżej
  // Nawet jeśli poprzedni test zostawił stronę w stanie "/dashboard",
  // ten test zaczyna od czystej karty
  await page.goto('/register');
  await page.getByLabel('Email').fill('zly-email');
  await page.getByRole('button', { name: 'Zarejestruj' }).click();
  
  await expect(page.getByText('Nieprawidłowy format adresu email')).toBeVisible();
});
```

### Co oznacza "izolacja" w praktyce?

**Izolacja od strony przeglądarki:**
- Każdy test dostaje nową kartę (tab) w ramach współdzielonego kontekstu przeglądarki (browser context).
- Karta ma pusty `localStorage`, pusty `sessionStorage` i brak ciasteczek.
- Test nie "widzi" stanu pozostawionego przez poprzedni test.

**Izolacja od strony JavaScript:**
- Nowa strona = nowy global zakres JavaScript.
- Zmienne globalne, cache, stan Redux/MobX/React — wszystko jest czyste.

**Izolacja od strony sieci:**
- Mocki API (`page.route()`) ustawione w jednym teście nie wpływają na inny test.

```typescript
test('test A — ustawia mock API', async ({ page }) => {
  // Mock obowiązuje TYLKO w tym teście
  await page.route('/api/user', route => route.fulfill({ body: { name: 'Jan' } }));
  await page.goto('/profile');
  await expect(page.getByText('Jan')).toBeVisible();
}); // Po zakończeniu testu mock znika, strona się zamyka

test('test B — bez mocka, prawdziwe API', async ({ page }) => {
  // Nowa karta, brak mocków
  await page.goto('/profile');
  // Pobiera dane z prawdziwego serwera
});
```

---

## Organizacja testów: test.describe i grupy logiczne

### Hierarchia grup

`test.describe` tworzy logicalzną grupę testów. Służy do organizacji testów według:
- **Funkcji aplikacji** (moduł: Autentykacja, Koszyk, Płatności).
- **Ścieżki użytkownika** (user flow: Rejestracja → Logowanie → Zakupy).
- **Poziomu ryzyka** (smoke, regresja, E2E).
- **Przeglądarki/urządzenia** (mobile, desktop, tablet).

```typescript
import { test, expect } from '@playwright/test';

// Grupa: Moduł autentykacji
test.describe('Autentykacja', () => {
  
  // Podgrupa: Logowanie
  test.describe('Logowanie', () => {
    test('poprawne dane — użytkownik jest przekierowany do dashboard', async ({ page }) => { /* ... */ });
    test('błędne hasło — wyświetla się komunikat błędu', async ({ page }) => { /* ... */ });
    test('nieistniejący użytkownik — wyświetla się komunikat błędu', async ({ page }) => { /* ... */ });
  });
  
  // Podgrupa: Rejestracja
  test.describe('Rejestracja', () => {
    test('nowy użytkownik — konto jest tworzone', async ({ page }) => { /* ... */ });
    test('duplikat email — wyświetla się błąd unikalności', async ({ page }) => { /* ... */ });
    test('słabe hasło — walidacja blokuje rejestrację', async ({ page }) => { /* ... */ });
  });
  
  // Wspólny setup dla całej grupy "Autentykacja"
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth'); // Wspólna strona początkowa
  });
});
```

### test.describe.parallel i test.describe.serial

Domyślnie testy w ramach jednego `describe` są wykonywane równolegle (parallel). Możesz to zmienić:

```typescript
// Wymuszenie kolejności — używaj rzadko, tylko gdy testy zależą od siebie!
test.describe.serial('Scenariusz zakupowy (wymaga kolejności)', () => {
  test('krok 1: Dodaj produkt do koszyka', async ({ page }) => { /* ... */ });
  test('krok 2: Przejdź do kasy', async ({ page }) => { /* ... */ }); // Zależy od kroku 1
  test('krok 3: Złóż zamówienie', async ({ page }) => { /* ... */ }); // Zależy od kroku 2
});

// Opcja.only — tylko jeden test w grupie
test.describe('Moduł płatności', () => {
  test.only('debugging: testuj tylko ten przypadek', async ({ page }) => { /* ... */ });
  test.skip('pomijamy na razie', async ({ page }) => { /* ... */ });
});
```

**Złota zasada**: Testy powinny być niezależne i wykonywalne w dowolnej kolejności. Jeśli potrzebujesz `serial`, to znak, że Twój test sprawdza wieloetapowy scenariusz, który powinien być podzielony na mniejsze, niezależne testy połączone przez wspólny stan (np. przez API lub fixture).

### Tagowanie testów (Annotations)

Playwright pozwala na tagowanie testów przez prefiks `@` w nazwie lub przez opcję `tag`:

```typescript
import { test, expect } from '@playwright/test';

// Tagowanie przez nazwę — najprostsze podejście
test('@smoke użytkownik może się zalogować', async ({ page }) => { /* ... */ });
test('@regression zestawienie zamówień działa poprawnie', async ({ page }) => { /* ... */ });
test('@slow export PDF generuje poprawny plik', async ({ page }) => { /* ... */ });

// Tagowanie przez opcje — bardziej elastyczne
test('weryfikacja SSL certyfikatu', {
  tag: ['@security', '@critical'],
}, async ({ page }) => { /* ... */ });

// Uruchomienie tylko testów z określonym tagiem
// npx playwright test --grep "@smoke"
// npx playwright test --grep "@security|@critical"
// npx playwright test --grep-invert "@slow" // Wszystkie oprócz @slow
```

Tagowanie jest kluczowe dla strategii testów w projektach komercyjnych:

| Tag | Zastosowanie | Częstotliwość uruchamiania |
|---|---|---|
| `@smoke` | Szybki check krytycznych ścieżek (5-15 testów) | Po każdym commicie |
| `@regression` | Pełna regresja (100-500 testów) | Przed wydaniem |
| `@critical` | Funkcje biznesowe (fakturowanie, płatności) | Codziennie |
| `@slow` | Testy > 1 minuty (exporty, duże raporty) | Nocno |
| `@flaky` | Testy niestabilne (czasowo wyłączone) | Przegląd tygodniowy |
| `@wip` | Work-in-progress | Nigdy w CI |

---

## test.step — dokumentacja wykonania testu

### Czemu służy test.step?

`test.step` to jedna z najcenniejszych funkcji Playwrighta dla dużych projektów. Pozwala podzielić długi scenariusz testowy na named steps, które są widoczne w raporcie HTML i Trace Viewerze.

```typescript
import { test, expect } from '@playwright/test';

test('pełny proces zakupowy — od logowania do potwierdzenia', async ({ page }) => {
  // Krok 1: Logowanie
  await test.step('Użytkownik loguje się do systemu', async () => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('jan.kowalski@example.pl');
    await page.getByLabel('Hasło').fill('BezpieczneHaslo123!');
    await page.getByRole('button', { name: 'Zaloguj' }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });

  // Krok 2: Wybór produktu
  await test.step('Użytkownik wybiera produkt z katalogu', async () => {
    await page.getByRole('link', { name: 'Katalog' }).click();
    await page.getByRole('article').filter({ hasText: 'iPhone 15 Pro' }).getByRole('button', { name: 'Dodaj do koszyka' }).click();
    await expect(page.getByText('Produkt dodany do koszyka')).toBeVisible();
  });

  // Krok 3: Finalizacja zamówienia
  await test.step('Użytkownik finalizuje zamówienie', async () => {
    await page.getByRole('link', { name: 'Koszyk' }).click();
    await page.getByRole('button', { name: 'Przejdź do kasy' }).click();
    // ...dalej
  });
});
```

### Korzyści z test.step w raporcie HTML

```
PASS  checkout.spec.ts › Pełny proces zakupowy

  ✓ Użytkownik loguje się do systemu        (1.2s)
  ✓ Użytkownik wybiera produkt z katalogu   (3.4s)
  ✓ Użytkownik finalizuje zamówienie        (5.1s)

Duration: 9.7s
```

Jeśli test padnie na kroku "Użytkownik finalizuje zamówienie", raport jasno pokaże, że kroki 1 i 2 przeszły — oszczędzając godziny debugowania.

### test.step w Trace Viewerze

W Trace Viewerze każdy `test.step` tworzy osobny wpis w timeline. Możesz:
- Zobaczyć dokładnie, ile czasu zajął każdy krok.
- Kliknąć na krok i zobaczyć stan strony w tamtym momencie.
- Zidentyfikować, który krok spowodował timeout.

### Hierarchia kroków (zagnieżdżone steps)

Kroki mogą być zagnieżdżone, tworząc czytelną strukturę:

```typescript
await test.step('Scenariusz zakupowy', async () => {
  await test.step('1. Autentykacja', async () => {
    await test.step('1.1 Wprowadzenie danych logowania', async () => { /* ... */ });
    await test.step('1.2 Weryfikacja przekierowania', async () => { /* ... */ });
  });
  
  await test.step('2. Wybór produktu', async () => {
    await test.step('2.1 Nawigacja do katalogu', async () => { /* ... */ });
    await test.step('2.2 Dodanie do koszyka', async () => { /* ... */ });
  });
});
```

---

## Adnotacje sterujące wykonaniem

### test.skip() — pomijanie testu

```typescript
test.skip('funkcja jeszcze nie istnieje w MVP', async ({ page }) => {
  // Ten test nie zostanie uruchomiony
  await page.getByRole('button', { name: 'Eksport CSV' }).click();
});

test.skip(process.env.CI, 'wymaga ręcznej interwencji', async ({ page }) => {
  // Ten test zostanie pominięty TYLKO na CI
  // Lokalnie będzie normalnie działał
});
```

### test.fixme() — oznaczenie jako wymagający naprawy

```typescript
// fixme = skip + notatka "do naprawienia"
test.fixme('BUG-456: Reset hasła wysyła email dwukrotnie', async ({ page }) => {
  await page.goto('/forgot-password');
  await page.getByLabel('Email').fill('test@example.pl');
  await page.getByRole('button', { name: 'Wyślij link' }).click();
  // Oczekiwane: 1 email
  // Rzeczywiste: 2 emaile
  // Dopóki bug nie zostanie naprawiony, test jest pomijany
  // ale widoczny w raporcie jako "FIXME"
});
```

### test.fail() — oczekiwany błąd

```typescript
test.fail('System powinien odrzucać ujemne ilości w zamówieniu', async ({ page }) => {
  await page.goto('/order/new');
  await page.getByLabel('Ilość').fill('-5'); // Powinno być zablokowane
  
  // Oczekiwane zachowanie: formularz nie wyśle, błąd walidacji
  // Rzeczywiste (gdy bug istnieje): formularz się wyśle → test padnie
  // Gdy bug zostanie naprawiony: test przejdzie (bo fail przestanie obowiązywać)
  await expect(page.getByText('Błąd: ilość musi być większa od 0')).toBeVisible();
});
```

### test.slow() — wydłużenie timeoutu

```typescript
test.slow('eksport raportu 1000-stronicowego trwa długo', async ({ page }) => {
  // Automatycznie potraja timeout dla tego testu (z 30s do 90s)
  await page.getByRole('button', { name: 'Eksportuj raport' }).click();
  await expect(page.getByText('Raport został wygenerowany')).toBeVisible({ timeout: 120000 });
});
```

### Łączenie adnotacji

```typescript
// skip + only — zazwyczaj używane podczas debugowania
test.describe.parallel.only('Debug: Grupa płatności', () => {
  // Uruchomi tylko tę grupę, pomijając wszystkie inne
});

// fixme z warunkiem środowiskowym
test.fixme(process.env.CI, 'niestabilny na Mac ARM64', async ({ page }) => {
  // ...
});
```

---

## Strategia retries i timeoutów

### Model retries w Playwright

Playwright ma dwupoziomowy system ponawiania:

**1. Retries na poziomie całego testu:**
```typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0, // Lokalnie: 0, na CI: 2
  // retry, gdy Cały test padnie (timeout, asercja, błąd)
});
```

**2. Retries na poziomie pojedynczej akcji (auto-waiting):**
```typescript
// Playwright automatycznie ponawia np. click(), jeśli element
// nie był "actionable" przez 30 sekund (domyślny actionTimeout)
await page.getByRole('button', { name: 'Zapisz' }).click({ timeout: 5000 });
// Ponawiaj przez 5 sekund, zanim rzucisz TimeoutError
```

### Kiedy retries mają sens, a kiedy są antywzorcem?

**Retries MAJĄ sens:**
- Losowe problemy sieciowe (niestabilne API trzeciej strony).
- Wyścigi w ładowaniu zasobów (leniwie ładowane moduły).
- Awarie infrastruktury CI (przeciążony runner).

**Retries SĄ antywzorcem:**
- Test jest flaky z powodu złego lokatora (element zasłonięty przez overlay).
- Test zależy od danych, które są niespójne (brak cleanup).
- Test sprawdza niestabilny feature (loading spinner, który znika losowo).

**Złota zasada**: Jeśli test musi być ponowiony, aby przejść — to jest oznaka problemu. Retry maskuje problem, ale go nie rozwiązuje. Po każdym teście "green on retry" napisz zgłoszenie do developers, dlaczego test był niestabilny.

### Konfiguracja timeoutów w różnych środowiskach

```typescript
// playwright.config.ts
export default defineConfig({
  // Globalny timeout dla całego testu
  timeout: 30000, // 30 sekund
  
  // Timeout dla pojedynczej akcji (kliknięcie, fill, hover)
  actionTimeout: 10000, // 10 sekund
  
  // Timeout dla nawigacji (page.goto, page.goBack)
  navigationTimeout: 30000,
  
  // Timeout dla asercji web-first (expect().toBeVisible())
  expect: {
    timeout: 5000, // 5 sekund
  },
  
  // Nadpisanie dla CI — wolniejsze środowisko
  ...(process.env.CI && {
    timeout: 60000,
    actionTimeout: 20000,
  }),
});
```

### Definicja timeoutu jako kontrakt z aplikacją

Timeout to nie "losowa liczba". Timeout to oczekiwany maksymalny czas na wykonanie operacji:

```typescript
// ✅ Dobrze — timeout wynika z kontraktu SLA
await expect(page.getByText('Operacja zakończona')).toBeVisible({ 
  timeout: 30000 // SLA: operacja musi się zakończyć w 30s
});

// ✅ Dobrze — timeout z dokumentacji
await page.getByRole('button', { name: 'Wyślij' }).click({ 
  timeout: 15000 // API ma timeout 10s + buffer 5s
});

// ❌ Źle — losowa liczba
await page.waitForTimeout(5000); // Dlaczego 5000? Skąd ta wartość?
```

---

## Zaawansowane techniki: testInfo i meta dane

### Dostęp do kontekstu wykonania

`testInfo` to obiekt przekazujący kontekst uruchomienia do testu:

```typescript
test('sprawdź tytuł strony', async ({ page }, testInfo) => {
  console.log('Nazwa testu:', testInfo.title);
  console.log('Tagi:', testInfo.tags);
  console.log('Retry:', testInfo.retry);
  console.log('Status:', testInfo.status);
  
  // Możesz dodać własne adnotacje
  testInfo.annotations.push({
    type: 'jira',
    description: 'https://jira.example.com/bug/BUG-123',
  });
  
  await page.goto('/');
  await expect(page).toHaveTitle(/Moja Aplikacja/);
});
```

### Dynamiczne sterowanie testem na podstawie testInfo

```typescript
test('test zachowania przy niestabilnej sieci', async ({ page }, testInfo) => {
  // W zależności od środowiska, test zachowuje się inaczej
  if (testInfo.project.name === 'mobile-slow-network') {
    // Symuluj wolne połączenie dla mobile
    await page.route('**/*', route => {
      route.fulfill({
        status: 200,
        body: route.request().resourceType() === 'document' 
          ? 'slow' // specjalne opóźnienie dla HTML
          : 'continue',
      });
    });
  }
  
  await page.goto('/');
  // ...
});
```

---

## Konfiguracja dla różnych środowisk

### Lokalne (developer)

```typescript
// playwright.config.ts — developer local
export default defineConfig({
  // Szybkie feedback: brak retry, krótkie timeouty
  retries: 0,
  workers: 4,  // równoległość na lokalnej maszynie
  timeout: 30000,
  
  // Reporter — czytelny dla człowieka
  reporter: [['list']],
  
  // Web server — automatyczne uruchomienie aplikacji
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true, // reuse jeśli już działa
  },
});
```

### CI (GitHub Actions, GitLab CI, Jenkins)

```typescript
export default defineConfig({
  // Więcej retry na CI (losowe problemy infrastruktury)
  retries: process.env.CI ? 2 : 0,
  
  // Mniej workerów (ограничение ресурсов)
  workers: process.env.CI ? 2 : undefined, // undefined = automatycznie
  
  // Dłuższe timeouty (CI jest wolniejszy)
  timeout: 60000,
  
  // Reporter — machine-readable
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-results.json' }],
  ],
  
  // Trace — zapisuj przy porażce (nie na sukces)
  trace: 'retain-on-failure',
  
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
});
```

### Debugowe (playwright --debug)

```typescript
export default defineConfig({
  // Maksymalne opóźnienia dla łatwego śledzenia
  timeout: 0, // bez limitu
  retries: 0,
  
  // Reporter tekstowy
  reporter: [['list', { printSteps: true }]],
  
  // Ustawienie screenshot/video na sukces (żeby móc obejrzeć udany test)
  screenshot: 'on',
  video: 'on',
  
  // Trace zawsze
  trace: 'on',
});
```

---

## Cykl życia hooków (Lifecycle Hooks)

### Kolejność wykonania hooków

```typescript
test.describe('Moduł Zamówień', () => {
  // 1. Raz na początku grupy (beforeAll)
  test.beforeAll(async ({ browser }) => {
    console.log('Tworzę kontekst przeglądarki dla całej grupy');
    // Może być używany przez wszystkie testy w grupie
  });

  // 2. Przed każdym testem (beforeEach)
  test.beforeEach(async ({ page }) => {
    await page.goto('/orders'); // Reset do strony zamówień
  });

  // Testy...

  // 3. Po każdym teście (afterEach)
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== 'passed') {
      console.log(`Test ${testInfo.title} zawiódł — robię screenshot`);
      await page.screenshot({ path: `error-${testInfo.title}.png` });
    }
  });

  // 4. Raz na końcu grupy (afterAll)
  test.afterAll(async () => {
    console.log('Zamykam zasoby grupy');
    // cleanup
  });
});
```

### Zasady używania hooków

**Zasada 1**: `beforeAll` / `afterAll` działają na poziomie grupy (describe). Używaj ich do kosztownych operacji, które chcesz wykonać raz na grupę (np. uruchomienie serwera testowego, stworzenie bazy danych).

**Zasada 2**: `beforeEach` / `afterEach` działają przed/po każdym pojedynczym teście. Używaj ich do resetu stanu, nawigacji do punktu startowego, lub cleanupu specyficznego dla testu.

**Zasada 3**: Unikaj ciężkiej logiki w hookach. Jeśli `beforeEach` ma 50 linii, to jest "setup smell" — setup jest zbyt skomplikowany.

```typescript
// ❌ Zły przedEach — zbyt wiele odpowiedzialności
test.beforeEach(async ({ page, request }) => {
  await page.goto('/');
  await request.post('/api/reset-db'); // Reset bazy
  await page.evaluate(() => localStorage.clear()); // Czyszczenie LS
  await page.goto('/orders'); // Navigacja
  await page.waitForLoadState('networkidle'); // Czekanie
  // 5 linii — za dużo jak na reset
});

// ✅ Dobry beforeEach — prosta odpowiedzialność
test.beforeEach(async ({ page }) => {
  await page.goto('/orders'); // Jeden cel: startuj z zamówień
});

// Specyficzny setup przenieś do fixture
```

---

## Dobre praktyki dla profesjonalnego użycia runnera

### 1. Atomowość testu

Każdy test powinien sprawdzać jedną, konkretną rzecz. Jeśli test nazywa się "użytkownik może zalogować się i złożyć zamówienie", to sprawdza DWIE rzeczy. Rozbij go na dwa testy:

```typescript
// ❌ Zły test — testuje dwie niezależne rzeczy
test('użytkownik loguje się i składa zamówienie', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('test@example.pl');
  await page.getByLabel('Hasło').fill('haslo');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  // ... logowanie ...
  await page.getByRole('button', { name: 'Złóż zamówienie' }).click();
  // ... zamówienie ...
});

// ✅ Dwa niezależne testy
test('użytkownik może się zalogować', async ({ page }) => { /* tylko logowanie */ });
test('zalogowany użytkownik może złożyć zamówienie', async ({ page }) => { /* tylko zamówienie */ });
```

**Korzyści z atomowości:**
- Gdy test padnie, od razu wiesz, co nie działa.
- Testy mogą być uruchamiane równolegle bez konfliktów.
- Testy mogą być tagowane niezależnie (@auth, @checkout).

### 2. Nazewnictwo testów — język domeny, nie technologii

```typescript
// ❌ Nazwa techniczna — co test robi, nie co sprawdza
test('click login button → redirect to dashboard', ...)

// ✅ Nazwa domenowa — co system powinien zrobić
test('poprawnie zalogowany użytkownik jest przekierowany do swojego panelu', ...)

// ✅ Jeszcze lepiej — odwołanie do wymagania/USP
test('po 3 nieudanych próbach logowania konto jest blokowane na 15 minut', ...)
```

### 3. Konfiguracja przez zmienne środowiskowe

```typescript
export default defineConfig({
  // Konfiguracja zmienia się w zależności od środowiska
  baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
  
  ...(process.env.API_BASE_URL && {
    use: {
      baseURL: process.env.API_BASE_URL,
    },
  }),
});
```

### 4. Własne reporters

Playwright pozwala na pisanie własnych reporterów, które integrują się z Twoim systemem raportowania (Jira, Slack, email):

```typescript
// reporters/slack-reporter.ts
export default {
  onTestEnd: async (test, result) => {
    if (result.status === 'failed') {
      await sendToSlack({
        channel: '#qa-alerts',
        message: `❌ Test zawiódł: ${test.title}\n${result.errors[0].message}`,
      });
    }
  },
};
```

---

## Perspektywa Full Stack Testera — Runner jako fundament

Playwright Test Runner to nie jest "coś, co uruchamia testy". To **platforma inżynieryjna** do automatyzacji testów. Jako Full Stack Tester, który rozumie architekturę runnera, możesz:

- **Projektować testy jako niezależne jednostki**, które mogą być uruchamiane równolegle i w dowolnej kolejności.
- **Konfigurować środowiska** specyficzne dla każdego projektu (dev, staging, production, mobile).
- **Tagować i filtrować** testy tak, aby uruchamiać tylko te, które mają sens w danym momencie (smoke po commicie, full regression przed wydaniem).
- **Diagnozować awarie** na poziomie kroku, nie całego testu, dzięki `test.step`.
- **Planować strategię retry** — wiedząc, że retry maskuje problem, ale nie rozwiązuje go.

Zrozumienie tych mechanizmów na poziomie architektonicznym pozwala przekształcić zwykły "test automation" w profesjonalny framework testowy, z którym zespół będzie chciał pracować przez lata.

---

## Podsumowanie

Silnik testowy Playwrighta oferuje zaawansowane mechanizmy do organizacji, wykonania i diagnostyki testów:

1. **Izolacja przez fixture** — każdy test dostaje świeżą kartę przeglądarki.
2. **Hierarchia grup** — `test.describe` do organizacji logicznej i kontekstowej.
3. **test.step** — dokumentacja wykonania testu w raporcie i Trace Viewerze.
4. **Tagowanie** — filtrowanie testów przez `@tag` w nazwie lub opcjach.
5. **Adnotacje sterujące** — `skip`, `fixme`, `fail`, `slow` do kontroli wykonania.
6. **Retries i timeouty** — strategia walki z niestabilnością, z rozróżnieniem na retry testu i auto-waiting akcji.
7. **Konfiguracja środowiskowa** — różne configi dla dev, CI, debug.

---

## Linki i źródła

- [Playwright Test Runner Documentation](https://playwright.dev/docs/test-runners)
- [Playwright Test Configuration](https://playwright.dev/docs/test-configuration)
- [Playwright CLI Reference](https://playwright.dev/docs/test-cli)
- [Advanced Playwright Test Patterns](https://playwright.dev/docs/test-projects)

## 📘 Suplement Inżynieryjny 2026: Runner Testów i Fixtury (Fixtures Deep Dive)
*Inspiracja: „Practical Playwright Test” (2026), Chapter 7*
*   **Fixtury Zależne i Automatyczne**: Odrzuć kruche bloki `beforeEach`/`afterEach`. Projektuj modularne fixtury, które mogą od siebie zależeć (np. `loggedInAdminPage` polega na `loginPage`). Używaj automatycznych fixtur (`auto: true`) do globalnego zbierania metryk.
*   **Scope Worker**: Inicjalizuj ciężkie zasoby (np. połączenia DB) na poziomie workera (`scope: 'worker'`), współdzieląc je bezpiecznie między testami w tym samym procesie.
