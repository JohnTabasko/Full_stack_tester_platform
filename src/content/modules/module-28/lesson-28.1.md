# Projekt końcowy: interfejs użytkownika, API, baza danych i CI

> Moduł dwudziesty ósmy zamyka kurs przez przełożenie kompetencji na dowody: matrycę umiejętności, projekt końcowy, rozmowę techniczną, GitHub, CV i portfolio. Celem nie jest tylko ukończenie lekcji, lecz umiejętność pokazania, że potrafisz pracować jak tester full stack. W tym module zbudujesz coś, co można uruchomić, ocenić i omówić — dowód kompetencji, a nie deklarację.

## Jak czytać ten moduł

Czytaj ten moduł jak przygotowanie do rozmowy zawodowej i prezentacji projektu. Wiedza techniczna musi zostać zamieniona w czytelne dowody: kod, raport, README, CI, decyzje architektoniczne i opowieść o ryzyku. Każda lekcja buduje jeden element portfolio, który warto pokazać rekruterowi, liderowi QA lub programiście oceniającemu kod.

Trzy zasady modułu:

1. **Dowód jest ważniejszy niż deklaracja.** Nie pisz tylko „znam Playwright". Pokaż projekt, raport i decyzje.
2. **Portfolio ma być uruchamialne.** Odbiorca powinien móc odtworzyć wynik bez ustnych instrukcji.
3. **Komunikuj kompromisy.** Dojrzałość widać w tym, co świadomie wybrałeś i czego świadomie nie zrobiłeś.

---

## Cel lekcji

Ta lekcja koncentruje się na: **zakres projektu, architektura frameworka, plan testów, dane testowe, raporty, praktyczny egzamin i kryteria zaliczenia full stack testera**. Główne ryzyko: **projekt końcowy zawiera wiele plików testowych, ale nie pokazuje strategii, danych, diagnostyki, CI ani świadomych kompromisów**. Po lekturze powinieneś umieć zaprojektować projekt końcowy, który demonstruje kompetencje w UI, API, bazie danych i CI, oraz umieć wyjaśnić każdą decyzję architektoniczną podczas rozmowy rekrutacyjnej.

**Perspektywa Full Stack Testera:** Projekt końcowy to nie egzamin — to pierwszy element portfolio. Zbuduj go tak, jakbyś miał go pokazać podczas prezentacji technicznej: z kontekstem biznesowym, dowodami jakości i świadomym wyjaśnieniem każdego kompromisu.

---

## Sytuacja przewodnia

Kandydat przygotowuje repozytorium z testami sklepu lub aplikacji SaaS, które ma pokazać UI, API, bazę danych, CI i raportowanie. Rekruter otwiera repozytorium i w trzy minuty powinien zrozumieć: co robi projekt, jak go uruchomić, jakie testy pokrywa, jak wygląda raport i jakie były kluczowe decyzje architektoniczne.

---

## 1. Zakres projektu jako kompromis świadomy

Zakres projektu końcowego nie powinien być przypadkowy. Powinien wynikać z analizy ryzyka produktu i umiejętności, które chcesz zademonstrować. Zasada jest prosta: lepiej mieć mniejszy projekt z pełnym pokryciem niż duży projekt z pustymi miejscami.

Minimalny zakres full stack testera obejmuje cztery warstwy:

| Warstwa | Co testujesz | Czego dowodzi |
|---|---|---|
| **UI** | Przepływ użytkownika, formularz, asercje widoczne | Lokatory, POM, asercje, stabilność |
| **API** | CRUD zasobu, błędy, autoryzacja | APIRequestContext, walidacja kontraktu |
| **DB** | Zapis danych po akcji, cleanup | Setup/teardown, bezpośredni dostęp |
| **CI** | Uruchomienie na czystej maszynie, raport | Konfiguracja, artefakty, jakość raportów |

Każda z tych warstw powinna być reprezentowana przez co najmniej jeden test. Nie chodzi o liczbę testów, lecz o kompletność perspektywy.

### Ograniczenie zakresu

Projekt końcowy nie jest produkcyjnym systemem. Nie musisz testować wszystkiego — musisz pokazać, że rozumiesz, co warto testować. Wybierz jedną funkcjonalność (np. checkout w sklepie lub rejestrację w aplikacji SaaS) i przetestuj ją na wszystkich czterech warstwach. To wystarczy, żeby pokazać kompetencję full stack.

### Co celowo pomiń i dlaczego

Dojrzały kandydat wie, co celowo pomija i umie to uzasadnić. Na przykład:

- **Visual testing**: pomijasz, bo nie masz stable design system; wspominasz w README jako future work
- **Parallelizacja na setkach testów**: pomijasz, bo zakres jest mały; wspominasz, że w produkcji użylibyśmy sharding
- **Performance testing**: pomijasz, bo nie masz narzędzi load testing; wspominasz, że rozumiesz metodologię

Te świadome ograniczenia pokazują więcej niż pełny, ale niezrozumiały projekt.

---

## 2. Architektura frameworka testowego

Struktura projektu powinna być czytelna dla każdego, kto ją otworzy. Profesjonalny projekt Playwright ma precyzyjny podział odpowiedzialności, który wynika z konwencji i dobrych praktyk.

### Struktura katalogów

```
playwright-fullstack-project/
├── tests/                    # Pliki .spec.ts z grupami scenariuszy
│   ├── ui/
│   │   ├── login.spec.ts
│   │   └── checkout.spec.ts
│   ├── api/
│   │   └── orders.spec.ts
│   └── smoke.spec.ts         # Testy smoke na wszystkich warstwach
├── pages/                    # Page Object Models — abstrakcja UI
│   ├── LoginPage.ts
│   ├── CheckoutPage.ts
│   └── OrderPage.ts
├── api/                      # Klienci API — abstrakcja HTTP
│   ├── client.ts
│   ├── orders.ts
│   └── auth.ts
├── fixtures/                 # Rozszerzenia fikstur Playwright
│   ├── auth.fixture.ts       # Fikstura zalogowanego użytkownika
│   ├── db.fixture.ts         # Fikstura z dostępem do bazy danych
│   └── api-context.fixture.ts
├── utils/                    # Funkcje pomocnicze
│   ├── data-builder.ts       # Generator danych testowych
│   ├── db.ts                 # Klient PostgreSQL/MySQL
│   └── logger.ts
├── data/                     # Dane statyczne i konfiguracja środowisk
│   ├── test-users.json
│   └── api-environment.json
├── playwright.config.ts      # Konfiguracja główna
├── .env.example              # Przykład zmiennych środowiskowych
├── README.md                 # Dokumentacja projektu
└── package.json
```

### Czemu taki podział?

Każdy katalog ma jasną odpowiedzialność. `tests/` zawiera tylko orchestrację — co robimy i czego się spodziewamy. `pages/` zawiera wiedzę o strukturze DOM i interakcjach. `api/` zawiera wiedzę o kontraktach HTTP. `fixtures/` zawiera wiedzę o przygotowaniu środowiska. `utils/` zawiera kod wielokrotnego użytku, który nie pasuje do żadnej konkretnej warstwy.

Taki podział pozwala na:

- **Szybkie odnalezienie kodu**: gdy test pada, wiesz, gdzie szukać
- **Łatwą rozmowę**: możesz powiedzieć „problem jest w LoginPage" zamiast „problem jest gdzieś w testach logowania"
- **Skalowanie**: nowy tester dodaje nowy plik w odpowiednim katalogu bez zrozumienia całego projektu

### Page Object Model — zasada i przykład

Page Object Model to wzorzec, który oddziela kod testowy od wiedzy o strukturze strony. Zamiast pisać `await page.getByRole('button', { name: 'Zaloguj się' }).click()` w każdym teście, tworzysz klasę `LoginPage` z metodą `login()`.

```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private readonly page: Page) {}

  get emailInput() {
    return this.page.getByLabel('Adres e-mail');
  }

  get passwordInput() {
    return this.page.getByLabel('Hasło');
  }

  get submitButton() {
    return this.page.getByRole('button', { name: 'Zaloguj się' });
  }

  get errorMessage() {
    return this.page.getByRole('alert');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(message: string): Promise<void> {
    await expect(this.errorMessage).toContainText(message);
  }
}
```

```typescript
// tests/ui/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('użytkownik widzi błąd przy nieprawidłowym haśle', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('jan@example.test', 'wrong-password');
  await loginPage.expectError('Nieprawidłowy adres e-mail lub hasło');
});
```

Zasada jest następująca: **kod testowy nie wie nic o strukturze DOM**. Jeśli developer zmieni etykietę przycisku z "Zaloguj się" na "Zaloguj", zmieniasz jedną linię w `LoginPage`, a nie wszystkie testy, które używają tego przycisku.

---

## 3. Plan testów jako mapa ryzyka

Plan testów w projekcie końcowym nie musi być dokumentem Word — wystarczy komentarz w kodzie i README, które pokazują logikę decyzji. Ważne jest, żeby było widać, że wybrałeś konkretne scenariusze z konkretnych powodów.

### Hierarchia testów

Projekt powinien zawierać trzy poziomy testów, z których każdy odpowiada na inne pytanie:

**Smoke tests (5-10 testów):** Czy system w ogóle działa? Testujesz najkrótszą ścieżkę na każdej warstwie. Uruchamiasz je na każdym PR.

```typescript
// tests/smoke.spec.ts
test.describe('Smoke suite', () => {
  test('UI — strona logowania się ładuje', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Logowanie' })).toBeVisible();
  });

  test('API — serwer odpowiada 200 na health endpoint', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
  });

  test('DB — połączenie do bazy danych działa', async ({ db }) => {
    const result = await db.query('SELECT 1');
    expect(result.rows[0]['?column?']).toBe(1);
  });
});
```

**Critical path tests (15-30 testów):** Czy użytkownik może wykonać główny przepływ? Testujesz happy path i najważniejsze ścieżki alternatywne. Uruchamiasz je na każdym PR i w nocy.

```typescript
// tests/ui/checkout.spec.ts
test.describe('Checkout — critical path', () => {
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    await createTestOrder(); // setup via API
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
  });

  test('użytkownik przechodzi checkout z prawidłowymi danymi', async ({ page }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await checkoutPage.fillDeliveryData({
      name: 'Jan Kowalski',
      street: 'ul. Marszałkowska 1',
      city: 'Warszawa',
      postalCode: '00-001',
    });
    await checkoutPage.selectPayment('Karta płatnicza');
    await checkoutPage.confirmOrder();
    await expect(checkoutPage.orderConfirmation).toBeVisible();
  });
});
```

**Regression tests (30-100 testów):** Czy wszystko działa po zmianie? Testujesz funkcjonalności pokryte umową jakości. Uruchamiasz je w nocy i przed release'em.

### Macierz testów a ryzyko

Nie każdy test musi być na każdym środowisku. Dobrze zaprojektowany projekt ma macierz:

| Poziom | Lokalnie | PR | Nightly | Release |
|---|---|---|---|---|
| Smoke | ✓ | ✓ | ✓ | ✓ |
| Critical path | | ✓ | ✓ | ✓ |
| Regression | | | ✓ | ✓ |

Ta macierz wynika z analizy ryzyka: smoke testy są szybkie i krytyczne, więc uruchamiamy je wszędzie. Regression testy są wolne, więc uruchamiamy je tylko wtedy, gdy mamy czas.

---

## 4. Dane testowe — setup i cleanup

Dane testowe to jeden z najważniejszych elementów profesjonalnego frameworka. Źle zaprojektowane dane powodują niestabilność, flakiness i fałszywe wyniki. Dobrze zaprojektowane dane pozwalają na powtarzalność, izolację i czytelność testów.

### Trzy strategie tworzenia danych

**Strategia 1: Through-the-UI (API approach)**

Tworzysz dane przez interfejs użytkownika lub API przed każdym testem. To najwolniejsza, ale najbliższa rzeczywistemu użytkowaniu strategia.

```typescript
test.beforeEach(async ({ page, request }) => {
  // Użyj API zamiast UI, żeby było szybciej
  const order = await request.post('/api/orders', {
    data: {
      customerEmail: 'jan@example.test',
      items: [{ productId: 'PROD-001', quantity: 2 }],
      status: 'pending',
    },
  });
  const orderData = await order.json();
  test.info().annotations.push({
    type: 'order-id',
    description: orderData.id,
  });
});
```

**Strategia 2: Direct database**

Tworzysz dane bezpośrednio w bazie danych, omijając UI i API. To najszybsze, ale wymaga znajomości schematu bazy i jest podatne na błędy, gdy schemat się zmieni.

```typescript
import { Pool } from 'pg';

test.beforeEach(async ({ dbPool }) => {
  const client = await dbPool.connect();
  try {
    await client.query('BEGIN');
    const userId = await createTestUser(client, {
      email: `test-${Date.now()}@example.test`,
      role: 'customer',
    });
    test.info().annotations.push({ type: 'user-id', description: userId });
  } finally {
    client.release();
  }
});

test.afterEach(async ({ dbPool }) => {
  const userId = test.info().annotations.find(a => a.type === 'user-id')?.description;
  if (userId) {
    await dbPool.query('DELETE FROM orders WHERE user_id = $1', [userId]);
    await dbPool.query('DELETE FROM users WHERE id = $1', [userId]);
  }
});
```

**Strategia 3: Fixture pattern (rekomendowana)**

Tworzysz fiksturę Playwright, która enkapsuluje całą logikę tworzenia i usuwania danych. Każdy test deklaruje swoje potrzeby, a fikstura je realizuje.

```typescript
// fixtures/order.fixture.ts
import { test as base } from '@playwright/test';
import { DataBuilder } from '../utils/data-builder';

type OrderFixture = {
  order: {
    id: string;
    customerEmail: string;
    total: number;
  };
};

export const test = base.extend<OrderFixture>({
  order: async ({ request, dbPool }, use) => {
    const builder = new DataBuilder();
    const orderData = await builder.createOrder({ status: 'pending' });

    // Cleanup after test
    await use(orderData);
    await builder.cleanupOrder(orderData.id);
  },
});
```

```typescript
// tests/ui/order-details.spec.ts
import { test, expect } from '@playwright/test';
import { test as orderTest } from '../fixtures/order.fixture';

orderTest('użytkownik widzi szczegóły zamówienia', async ({ page, order }) => {
  await page.goto(`/orders/${order.id}`);
  await expect(page.getByText(order.customerEmail)).toBeVisible();
  await expect(page.getByText(order.total.toFixed(2))).toBeVisible();
});
```

### Zasady organizacji danych testowych

**Identyfikowalność:** Każdy rekord testowy musi mieć atrybut, który pozwala go zidentyfikować i posprzątać. Email z timestamp (`test-1719000000@example.test`) lub przedrostek (`qa_auto_*`) są dobrymi markerami.

**Izolacja:** Każdy test powinien pracować na swoich danych. Jeśli test A modyfikuje zamówienie X, a test B oczekuje, że zamówienie X jest w stanie pending, to te testy będą się wyprzedzać. Stosuj przedrostki i zakresy czasowe.

**Determinizm:** Dane powinny być przewidywalne. Jeśli testujesz walidację emaila, używaj stalej listy wartości, nie losowych stringów, które utrudniają debugowanie.

**Minimalizm:** Twórz tylko tyle danych, ile test potrzebuje. Jeśli test sprawdza tylko status zamówienia, nie twórz 50 pozycji w koszyku.

---

## 5. Konfiguracja CI/CD jako dowód jakości

CI/CD to nie tylko `npm run test`. To sposób na pokazanie, że rozumiesz cały cykl jakości: od kodu do raportu, od awarii do diagnostyki.

### GitHub Actions — kompletny pipeline

```yaml
name: Playwright Full Stack Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  tests:
    timeout-minutes: 30
    runs-on: ubuntu-latest
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

      - name: Run smoke tests
        run: npm run test:smoke
        env:
          BASE_URL: ${{ vars.STAGING_URL }}
          API_URL: ${{ vars.STAGING_API_URL }}
          DB_CONNECTION_STRING: ${{ secrets.DB_CONNECTION_STRING }}

      - name: Run API tests
        run: npm run test:api

      - name: Run DB verification tests
        run: npm run test:db

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ matrix.shard }}
          path: |
            playwright-report/
            test-results/
            trace.zip
          retention-days: 30

      - name: Publish HTML report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-html-report
          path: playwright-report/index.html

      - name: Fail on critical test failures
        run: |
          if grep -q '"failed":[^0]' test-results/results.json; then
            echo "Critical tests failed — see attached report"
            exit 1
          fi
```

### Artefakty przy awarii

Każdy profesjonalny pipeline powinien zbierać dowody awarii. Przynajmniej:

- **Screenshot:** automatyczny screenshot przy niepowodzeniu (Playwright robi to domyślnie)
- **Trace:** plik trace Playwright, który pozwala odtworzyć sesję (uploaduj tylko przy awarii, żeby oszczędzać miejsce)
- **Video:** nagranie testu (przydatne przy flaky tests, żeby zobaczyć, co się działo)
- **Report HTML:** raport Playwright z detalami (uploaduj zawsze, żeby rekruter mógł go otworzyć)

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry', // collect on first retry, not on every attempt
  },
  retries: {
    'failed-tests': 2,
    'flaky-tests': 3,
  },
});
```

### Ochrona przed flaky tests w CI

Flaky tests to zmora każdego pipeline'u. W profesjonalnym projekcie masz strategię:

1. **Retry count:** Playwright pozwala ustawić `retries` dla nieudanych testów. To daje czas na naprawienie niestabilnych testów bez blokowania PR-ów.

2. **Shard distribution:** Jeśli masz 100 testów i 2 są flaky, podziel je na 4 shardy. Flaky test w jednym shardzie nie blokuje pozostałych trzech.

3. **Quarantine list:** Testy, które są flaky mimo retries, wrzuć do osobnej grupy `quarantine` i uruchamiaj ją rzadziej, z powiadomieniem do zespołu.

4. **CI-specific limity czasu:** W CI sieć jest mniej stabilna niż lokalnie. Ustaw dłuższe timeouty dla testów API i DB.

```typescript
// playwright.config.ts — CI-specific overrides
const isCI = process.env['CI'] === 'true';

export default defineConfig({
  timeout: isCI ? 60_000 : 30_000,
  expect: {
    timeout: isCI ? 15_000 : 5_000,
  },
  retries: isCI ? 2 : 0,
  workers: isCI ? 4 : process.env['CI'] ? '50%' : undefined,
});
```

---

## 6. Raportowanie — co pokazuje raport o testerze

Raport z testów jest częścią portfolio. Jako tester full stack powinieneś umieć nie tylko uruchomić testy, ale też zinterpretować wyniki i wyciągnąć wnioski.

### Minimalny raport HTML

Playwright domyślnie generuje raport HTML, który zawiera:

- Podsumowanie: ile testów, ile przeszło, ile padło
- Timeline: ile czasu zajął każdy test i każdy krok
- Screenshots i trace: dowody awarii
- Filtry: możliwość przefiltrowania po statusie, tagu, pliku

Dobrze jest skonfigurować raport tak, żeby zawierał dodatkowe informacje:

```typescript
// playwright.config.ts
export default defineConfig({
  reporter: [
    ['html', {
      outputFolder: 'playwright-report',
      open: 'never',
      attachmentsBaseUrl: 'file://',
    }],
    ['list'],
  ],
  projects: [
    {
      name: 'smoke',
      testMatch: /.*\.smoke\.spec\.ts/,
      grepInvert: /@flaky/,
    },
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
    },
    {
      name: 'db',
      testMatch: /.*\.db\.spec\.ts/,
    },
  ],
});
```

### Przykład README z raportem

W prawdziwym portfolio umieść screenshot raportu HTML lub link do artefaktu w CI:

```markdown
## Raporty testów

Ostatni raport z main branch: [playwright-report/index.html](./playwright-report/index.html)

### Przykładowe metryki (stan na 2024-06-01)
- Smoke tests: 12 testów, 100% pass rate, avg 45s
- API tests: 18 testów, 98% pass rate, avg 12s  
- DB tests: 6 testów, 100% pass rate, avg 8s
- Całkowity czas smoke suite: ~2 minuty

### Znane ograniczenia
- Testy performance (k6) nie są włączone do tego repozytorium
- Visual regression testing wymaga stable design system
```

---

## 7. Kryteria zaliczenia projektu

Projekt końcowy powinien spełniać konkretne kryteria, które można zweryfikować. Te kryteria to jednocześnie lista kontrolna dla Ciebie i punkt odniesienia dla oceniającego.

### Kryteria obowiązkowe (must-have)

| Kryterium | Jak zweryfikować |
|---|---|
| **Uruchamia się od zera** | `npm ci && npx playwright install && npm run test` na czystej maszynie |
| **Ma README** | README wyjaśnia: cel, instalację, zakres, strukturę, decyzje architektoniczne |
| **Pokrywa 4 warstwy** | Co najmniej 1 test UI, 1 API, 1 DB, konfiguracja CI |
| **Ma raport** | Po uruchomieniu generuje się raport HTML z wynikami |
| **Ma testy pozytywne i negatywne** | Co najmniej 1 happy path i 1 walidacja błędu |
| **Opisuje ograniczenia** | README zawiera sekcję "Co celowo pominięto i dlaczego" |

### Kryteria dodatkowe (nice-to-have)

| Kryterium | Co pokazuje |
|---|---|
| **Trace viewer w CI** | Zaawansowana diagnostyka, umiejętność debugowania |
| **Parallelizacja** | Świadomość optymalizacji, sharding |
| **Custom fixtures** | Architektura, enkapsulacja, wielokrotne użycie |
| **Data builder** | Profesjonalne podejście do danych testowych |
| **Docker setup** | Reprodukowalność, świadomość infrastruktury |

---

## Perspektywa Full Stack Testera

Projekt końcowy to nie sprint — to maraton ciągłego doskonalenia. Zacznij od minimum, które działa, a następnie dodawaj warstwy: raporty, diagnostykę, optymalizację. Każda dodana warstwa pokazuje kolejny poziom dojrzałości. Pamiętaj, że rekruter ocenia nie tylko to, co masz, ale też to, jak o tym opowiadasz — umiejętność wyjaśnienia kompromisów i decyzji jest równie ważna jak umiejętność pisania testów.

---

## Podsumowanie

- **Zakres:** Minimum 4 warstwy (UI + API + DB + CI); nie musisz testować wszystkiego, musisz pokazać strategię
- **Architektura:** Wyraźny podział na tests/, pages/, api/, fixtures/, utils/ — czytelność i skalowalność
- **Dane:** Fikstury z enkapsulacją setup/teardown; identyfikowalność i izolacja
- **CI/CD:** Kompletny pipeline z artefaktami, retry i shardowaniem; pipeline jest częścią portfolio
- **Raporty:** Raport HTML jako dowód; metryki w README; świadome ograniczenia
- **Kryteria:** Lista kontrolna must-have i nice-to-have; każde kryterium ma weryfikowalny dowód
- **Kompromisy:** Dokumentuj celne ograniczenia i ich uzasadnienie — pokazuje dojrzałość techniczną

---

## Linki i źródła

- [Playwright Test — Configuration](https://playwright.dev/docs/test-configuration) — oficjalna dokumentacja konfiguracji Playwright, timeoutów, retry i reporterów
- [Playwright Reporter API](https://playwright.dev/docs/test-reporters) — jak pisać własne reportery i integrować z CI
- [GitHub Actions — Upload Artifact](https://docs.github.com/en/actions/managing-workflows/storing-workflow-data-as-artifacts) — jak publikować raporty HTML i trace viewer jako artefakty
- [Page Object Model — Martin Fowler](https://martinfowler.com/bliki/PageObject.html) — oryginalny artykuł o wzorcu Page Object
- [Test Data Builder Pattern — Nat Pryce](https://www.natpryce.com/articles/000714.html) — wzorzec data builder dla danych testowych
- [Test Automation Strategy — Amy Reichert](https://www.ministryoftesting.com/dojo/lessons/building-a-test-automation-strategy) — jak budować strategię testów, nie tylko zestaw testów

## 📘 Suplement Inżynieryjny 2026: Portfolio i Egzamin Testera Full Stack
*Inspiracja: „Scalable Test Automation with Playwright” (2026), Chapter 12*
*   **SDET Portfolio Checklist**: Profesjonalne portfolio testera full stack powinno demonstrować znajomość czystego kodu (clean code), zasady SOLID, wzorców projektowych (AOM, POM, Fabryka), automatycznej diagnostyki w CI oraz testów hybrydowych (API + UI).
