# Fikstury (Fixtures) — kompletne wstrzykiwanie zależności w Playwright Test

Fikstury są jednym z najważniejszych mechanizmów Playwright Test. To one sprawiają, że test nie musi ręcznie tworzyć przeglądarki, kontekstu, strony, klienta API, użytkownika testowego albo Page Objectów. Test deklaruje, czego potrzebuje, a runner przygotowuje zasoby, przekazuje je do testu i sprząta po zakończeniu.

Dla Full Stack Testera fikstury są czymś więcej niż „ładniejszym `beforeEach`”. To sposób projektowania architektury testów: izolacji danych, logowania, klientów API, połączeń z bazą, obiektów stron, mocków oraz instancji diagnostycznych.

---

## 1. Wyższość Fixture-ów nad Klasycznymi Hookami

W tradycyjnych frameworkach (jak Jest, Vitest czy Mocha) stan początkowy oraz sprzątanie organizuje się w blokach `beforeEach` i `afterEach`. W skali korporacyjnej podejście to prowadzi do poważnych problemów:
*   **Brak modularności**: Hooki są trwale związane z blokiem `describe`. Nie można ich łatwo współdzielić między plikami bez kopiowania kodu.
*   **Brak leniwego ładowania (Lazy Loading)**: Wszystkie hooki w bloku `describe` uruchamiają się dla każdego testu, nawet jeśli dany test nie potrzebuje danej bazy danych czy zalogowanego użytkownika.
*   **Skomplikowane zarządzanie zmiennymi globalnymi**: Dane przygotowane w `beforeEach` muszą być przekazywane do testów przez mutowalne zmienne o zasięgu pliku (`let user: User;`), co stwarza ryzyko wycieku stanu między testami.

System fixture-ów w Playwright, opisany w książce *"Practical Playwright Test" (2026)*, całkowicie eliminuje te wady:
*   Inicjalizacja jest **leniwa** (lazy-evaluated) – fixture uruchamia się wyłącznie wtedy, gdy test jawnie zażąda go w sygnaturze (np. `async ({ loginPage }) => { ... }`).
*   Wszystkie zależności są przekazywane jako silnie otypowane parametry wejściowe, eliminując mutowalne zmienne o zasięgu pliku.
*   Cykl życia fixture-a (setup i teardown) jest zamknięty w jednej funkcji za pomocą słowa kluczowego `use()`.

---

## 2. Fixtury Powiązane i Ich Cykl Życia (Fixtures Dependency)

Fixtury mogą bez przeszkód zależeć od siebie nawzajem. Playwright analizuje graf zależności i uruchamia je w optymalnej kolejności.

Wyobraźmy sobie proces, w którym chcemy przetestować panel administratora. Test wymaga w pełni zalogowanej strony (`loggedInAdminPage`). Zamiast pisać kod logowania w każdym teście, fixtura ta może polegać na innej fixturze – `loginPage`:

```typescript
import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

type MyFixtures = {
  loginPage: LoginPage;
  loggedInAdminPage: Page;
};

export const test = base.extend<MyFixtures>({
  // Inicjalizacja LoginPage przy użyciu wbudowanej fixtury page
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  // Fixtura loggedInAdminPage zależy od loginPage oraz page
  loggedInAdminPage: async ({ page, loginPage }, use) => {
    // 1. SETUP: Wykonaj logowanie przed testem
    await loginPage.navigate('/');
    await loginPage.login('admin@example.com', 'secret_pass');
    
    // Przekaż zalogowaną stronę do testu
    await use(page);
    
    // 2. TEARDOWN: Opcjonalne wylogowanie po teście
    await page.evaluate(() => localStorage.clear());
  },
});
```

---

## 3. Fixtury Automatyczne (Auto Fixtures) z Załącznikami Diagnostycznymi

Fixtury automatyczne (`auto: true`) to potężne narzędzie diagnostyczne opisywane w książce *"Hands-On Automated Testing with Playwright" (2026)*. Uruchamiają się one automatycznie dla każdego testu w danym projekcie, bez konieczności deklarowania ich w parametrach funkcji testowej.

Są one idealne do:
1.  **Monitorowania błędów konsoli** przeglądarki (Console Error Collector).
2.  **Mierzenia czasu wykonania testu** lub zapytań API.
3.  **Automatycznego czyszczenia bazy danych** po każdym teście na podstawie identyfikatora testu.

Oto kompletny przykład automatycznej fixtury zbierającej błędy z konsoli przeglądarki i dołączającej je bezpośrednio do raportu HTML za pomocą `testInfo.attach()` w przypadku niepowodzenia:

```typescript
export const testWithDiagnostics = test.extend<{ consoleLogs: string[] }>({
  consoleLogs: [async ({ page }, use, testInfo) => {
    const logs: string[] = [];

    // Rejestracja błędów konsoli przeglądarki
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        logs.push(`[Console Error] ${msg.text()} (URL: ${page.url()})`);
      }
    });

    // Uruchomienie testu
    await use(logs);

    // Teardown: Jeśli test nie przeszedł pomyślnie i zebrano błędy, dołącz je jako plik tekstowy
    if (testInfo.status !== testInfo.expectedStatus && logs.length > 0) {
      await testInfo.attach('browser-console-errors', {
        body: JSON.stringify(logs, null, 2),
        contentType: 'application/json',
      });
    }
  }, { auto: true }], // auto: true oznacza, że fixture uruchomi się dla każdego testu automatycznie
});
```

---

## 4. Wybór Zakresu Fixture-a (Scope: Test vs Worker)

W Playwright wyróżniamy dwa główne zakresy fixture-ów:
1.  **Scope: test** (Domyślny) – fixture jest niszczony i tworzony od nowa dla każdego pojedynczego testu. Gwarantuje to 100% izolację środowiskową.
2.  **Scope: worker** – fixture jest tworzony raz na proces roboczy (worker thread) i współdzielony przez wiele testów uruchamianych w tym procesie. Jest idealny do ciężkich, kosztownych operacji (np. nawiązanie połączenia z bazą danych, uruchomienie kontenera Docker za pomocą Docker Compose).

Przykład współdzielonej fixtury bazodanowej o zakresie worker:

```typescript
import { test as base } from '@playwright/test';
import { DatabasePool } from '../utils/db';

type WorkerFixtures = {
  dbPool: DatabasePool;
};

export const test = base.extend<{}, WorkerFixtures>({
  // Definiujemy fixture o zakresie worker
  dbPool: [async ({}, use) => {
    // SETUP: Uruchomienie połączenia raz na worker
    const pool = new DatabasePool();
    await pool.connect();
    
    await use(pool);
    
    // TEARDOWN: Zamknięcie połączenia po zakończeniu pracy workera
    await pool.disconnect();
  }, { scope: 'worker' }],
});
```

---

## 5. Checklista Zaawansowanego Projektowania Fixture-ów

Podczas projektowania wstrzykiwania zależności za pomocą fixture-ów, zawsze zadaj sobie następujące pytania:
- [ ] Czy dany setup jest unikalny dla tego testu, czy powtarza się w wielu plikach? (Jeśli się powtarza -> przenieś go do fixture).
- [ ] Czy poprawnie obsłużyłeś fazę sprzątania (kod po słowie kluczowym `use()`)?
- [ ] Czy dobrałeś odpowiedni zakres (scope: 'test' dla izolacji sesji, scope: 'worker' dla ciężkich baz danych)?
- [ ] Czy w przypadku błędów dołączasz logi lub diagnostykę do raportu za pomocą `testInfo.attach()`?

---

## Bibliografia i Linki
*   *Jean-François Greffier, Practical Playwright Test (2026), Chapter 7: Fixtures Deep Dive*
*   *Faraz K. Kelhini & Butch Mayhew, Hands-On Automated Testing with Playwright (2026), Chapter 5: Crafting Scalable Tests with the Fixture System*
*   [Oficjalna Dokumentacja Playwright Test Fixtures](https://playwright.dev/docs/test-fixtures)

## 📘 Suplement Inżynieryjny 2026: Runner Testów i Fixtury (Fixtures Deep Dive)
*Inspiracja: „Practical Playwright Test” (2026), Chapter 7*
*   **Fixtury Zależne i Automatyczne**: Odrzuć kruche bloki `beforeEach`/`afterEach`. Projektuj modularne fixtury, które mogą od siebie zależeć (np. `loggedInAdminPage` polega na `loginPage`). Używaj automatycznych fixtur (`auto: true`) do globalnego zbierania metryk.
*   **Scope Worker**: Inicjalizuj ciężkie zasoby (np. połączenia DB) na poziomie workera (`scope: 'worker'`), współdzieląc je bezpiecznie między testami w tym samym procesie.
