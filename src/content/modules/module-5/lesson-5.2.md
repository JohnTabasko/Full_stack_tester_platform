# Fikstury (Fixtures) — kompletne wstrzykiwanie zależności w Playwright Test

Fikstury są jednym z najważniejszych mechanizmów Playwright Test. To one sprawiają, że test nie musi ręcznie tworzyć przeglądarki, kontekstu, strony, klienta API, użytkownika testowego albo Page Objectów. Test deklaruje, czego potrzebuje, a runner przygotowuje zasoby, przekazuje je do testu i sprząta po zakończeniu.

Dla Full Stack Testera fikstury są czymś więcej niż „ładniejszym `beforeEach`”. To sposób projektowania architektury testów: izolacji danych, logowania, klientów API, połączeń z bazą, obiektów stron, mocków oraz artefaktów diagnostycznych.

## 1. Problem, który rozwiązują fikstury

Bez fikstur testy szybko zaczynają wyglądać tak:

```typescript
import { test, expect, chromium } from '@playwright/test';

test('użytkownik może zmienić adres dostawy', async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('/login');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('secret');
  await page.getByRole('button', { name: 'Zaloguj' }).click();

  await page.goto('/account/address');
  await page.getByLabel('Miasto').fill('Warszawa');
  await page.getByRole('button', { name: 'Zapisz' }).click();

  await expect(page.getByText('Adres zapisany')).toBeVisible();

  await context.close();
  await browser.close();
});
```

Ten kod miesza wiele odpowiedzialności: uruchomienie przeglądarki, logowanie, nawigację, scenariusz biznesowy i sprzątanie. Jeżeli taki setup powtórzy się w kilkudziesięciu testach, projekt będzie trudny w utrzymaniu.

Playwright rozwiązuje to przez fixtures:

```typescript
import { test, expect } from '@playwright/test';

test('użytkownik może zmienić adres dostawy', async ({ page }) => {
  await page.goto('/account/address');
  await page.getByLabel('Miasto').fill('Warszawa');
  await page.getByRole('button', { name: 'Zapisz' }).click();
  await expect(page.getByText('Adres zapisany')).toBeVisible();
});
```

Fikstura `page` jest wbudowana. Playwright sam tworzy izolowany kontekst przeglądarki i stronę dla testu.

## 2. Wbudowane fikstury Playwright

Najczęściej używane wbudowane fikstury:

| Fikstura | Scope | Zastosowanie |
|---|---|---|
| `page` | test | Nowa strona w izolowanym kontekście dla pojedynczego testu. |
| `context` | test | BrowserContext, czyli izolowana sesja: cookies, localStorage, permissions. |
| `browser` | worker | Instancja przeglądarki współdzielona w workerze. |
| `browserName` | worker | Nazwa przeglądarki: `chromium`, `firefox`, `webkit`. |
| `request` | test | Izolowany `APIRequestContext` do testów API i setupu danych. |
| `baseURL` | worker/test option | Bazowy URL z konfiguracji. |
| `isMobile` | option | Informacja z konfiguracji projektu. |

Przykład użycia kilku fikstur naraz:

```typescript
import { test, expect } from '@playwright/test';

test('koszyk jest pusty dla nowej sesji', async ({ page, context, browserName, request }) => {
  console.log(`Test działa w: ${browserName}`);

  const health = await request.get('/api/health');
  expect(health.ok()).toBeTruthy();

  await context.addCookies([
    { name: 'currency', value: 'PLN', domain: 'localhost', path: '/' },
  ]);

  await page.goto('/cart');
  await expect(page.getByText('Twój koszyk jest pusty')).toBeVisible();
});
```

## 3. Custom fixture — własna zależność testu

Własne fikstury tworzymy przez `base.extend()`.

```typescript
// tests/fixtures/base-test.ts
import { test as base, expect, type Page } from '@playwright/test';

class LoginPage {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.page.goto('/login');
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Zaloguj' }).click();
  }
}

type Fixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
});

export { expect };
```

Test importuje już nie `test` z `@playwright/test`, ale naszą wersję:

```typescript
import { test, expect } from './fixtures/base-test';

test('logowanie poprawnym hasłem', async ({ loginPage, page }) => {
  await loginPage.login('user@example.com', 'secret');
  await expect(page.getByRole('heading', { name: 'Panel użytkownika' })).toBeVisible();
});
```

## 4. `use()` i cykl życia fikstury

Najważniejszy element fikstury to `await use(value)`:

```typescript
export const test = base.extend<{ temporaryUser: { email: string } }>({
  temporaryUser: async ({ request }, use) => {
    // setup
    const email = `user-${Date.now()}@example.com`;
    const response = await request.post('/api/users', {
      data: { email, password: 'Secret123!' },
    });
    expect(response.ok()).toBeTruthy();

    // przekazanie zasobu do testu
    await use({ email });

    // teardown — wykona się również, gdy test się wywali
    await request.delete(`/api/users/${email}`);
  },
});
```

Kod przed `use()` to setup. Kod po `use()` to teardown. Dzięki temu sprzątanie jest powiązane z zasobem, a nie porozrzucane po testach.

## 5. Test zakres vs worker zakres

Fikstury mogą działać w dwóch głównych zakresach.

### Test zakres

Domyślny zakres. Fikstura jest tworzona osobno dla każdego testu. To najbezpieczniejszy wybór dla danych, stron, użytkowników i zasobów, które nie mogą przeciekać między testami.

```typescript
export const test = base.extend<{ cartId: string }>({
  cartId: async ({ request }, use) => {
    const response = await request.post('/api/carts');
    const cart = await response.json();
    await use(cart.id);
    await request.delete(`/api/carts/${cart.id}`);
  },
});
```

### Worker zakres

Fikstura jest tworzona raz dla procesu workera i współdzielona przez testy uruchamiane w tym workerze. Przydaje się dla kosztownych zasobów: kontenerów, klientów bazodanowych, dużych seedów albo kont testowych przypisanych do workera.

```typescript
import { test as base } from '@playwright/test';

type WorkerFixtures = {
  workerAccount: { email: string; password: string };
};

export const test = base.extend<{}, WorkerFixtures>({
  workerAccount: [async ({}, use, workerInfo) => {
    const email = `worker-${workerInfo.workerIndex}@example.com`;
    await use({ email, password: 'Secret123!' });
  }, { zakres: 'worker' }],
});
```

Uwaga: worker zakres wymaga dyscypliny. Jeżeli testy modyfikują współdzielony zasób, mogą wpływać na siebie nawzajem.

## 6. Auto fixtures

Fikstura może uruchamiać się automatycznie, nawet jeśli test nie wymienia jej w argumentach. To dobre miejsce na diagnostykę lub globalny setup per test, ale trzeba używać tego ostrożnie.

```typescript
export const test = base.extend<{ saveLogs: void }>({
  saveLogs: [async ({ page }, use, testInfo) => {
    const logs: string[] = [];
    page.on('console', message => logs.push(`${message.type()}: ${message.text()}`));

    await use();

    if (testInfo.status !== testInfo.expectedStatus) {
      await testInfo.attach('console.log', {
        body: logs.join('\n'),
        contentType: 'text/plain',
      });
    }
  }, { auto: true }],
});
```

Nie twórz automatycznych fikstur, które wykonują duże flow biznesowe. Test powinien pozostać czytelny.

## 7. Option fixtures — konfiguracja jako fixture

Fikstury mogą reprezentować opcje, które da się nadpisywać w `test.use()` albo w projekcie.

```typescript
import { test as base } from '@playwright/test';

type Options = {
  defaultCurrency: 'PLN' | 'EUR';
};

export const test = base.extend<{}, {}, Options>({
  defaultCurrency: ['PLN', { option: true }],
});

test.use({ defaultCurrency: 'EUR' });
```

To przydatne, gdy ta sama logika testowa ma działać dla różnych wariantów konfiguracji: roli użytkownika, regionu, waluty, feature flagi albo kanału sprzedaży.

## 8. Łączenie fikstur i architektura projektu

W większym projekcie nie warto mieć jednego ogromnego pliku `base-test.ts`. Lepiej dzielić fikstury według odpowiedzialności:

```text
tests/
  fixtures/
    base-test.ts
    auth.fixture.ts
    api.fixture.ts
    pages.fixture.ts
    database.fixture.ts
  pages/
    LoginPage.ts
    CheckoutPage.ts
  specs/
    checkout.spec.ts
```

Przykład eksportu wspólnego `test`:

```typescript
// fixtures/base-test.ts
import { test as base, expect } from '@playwright/test';
import { authFixtures } from './auth.fixture';
import { pageFixtures } from './pages.fixture';

export const test = base
  .extend(authFixtures)
  .extend(pageFixtures);

export { expect };
```

Jeżeli projekt używa kilku zestawów fikstur, można stosować `mergeTests` z Playwright.

## 9. Fikstury a Page Object Model

Bardzo dobry wzorzec to dostarczanie Page Objectów jako fixtures:

```typescript
export const test = base.extend<{
  checkoutPage: CheckoutPage;
}>({
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
});
```

Test jest wtedy czytelny:

```typescript
test('gość może złożyć zamówienie', async ({ checkoutPage }) => {
  await checkoutPage.open();
  await checkoutPage.addProduct('Laptop');
  await checkoutPage.submitOrder();
  await checkoutPage.expectOrderConfirmation();
});
```

Pamiętaj jednak: fixture nie powinien ukrywać krytycznych kroków biznesowych, jeśli ich brak utrudni zrozumienie scenariusza.

## 10. Typowe błędy

### Błąd 1: fixture robi zbyt wiele

Jeśli fixture loguje, tworzy dane, przechodzi przez checkout i ustawia flagi, test przestaje mówić, co naprawdę sprawdza. Rozbij ją na mniejsze fikstury.

### Błąd 2: stan współdzielony między testami

Worker fixture jest szybka, ale ryzykowna. Dla danych modyfikowanych używaj izolacji per test albo unikalnych identyfikatorów.

### Błąd 3: fixture ukrywa asercje

Asercje biznesowe zwykle powinny być widoczne w teście. W fixture można sprawdzić techniczny warunek setupu, ale nie główny oczekiwany rezultat scenariusza.

### Błąd 4: importowanie złego `test`

Jeżeli projekt ma własny `test`, specyfikacje powinny importować go z pliku fixtures:

```typescript
import { test, expect } from '../fixtures/base-test';
```

Nie mieszaj w jednym pliku `test` z `@playwright/test` i własnego rozszerzonego `test`.

## 11. Checklista review fikstur

- Czy fixture ma jedną odpowiedzialność?
- Czy nazwa mówi, jaki zasób dostarcza?
- Czy teardown jest blisko setupu?
- Czy fixture jest test-zakresd, jeśli modyfikuje dane?
- Czy worker-zakresd fixture nie powoduje zależności między testami?
- Czy testy importują właściwy `test`?
- Czy typy TypeScript jasno opisują dostępne fixtures?
- Czy fixture nie ukrywa głównego sensu scenariusza?
- Czy diagnostyka awarii trafia do `testInfo.attach`?

## 12. Ćwiczenie praktyczne

Zaprojektuj zestaw fixtures dla modułu e-commerce:

1. `temporaryUser` — tworzy użytkownika przez API i usuwa go po teście.
2. `authenticatedPage` — otwiera stronę jako zalogowany użytkownik.
3. `checkoutPage` — dostarcza Page Object koszyka i checkoutu.
4. `consoleLogs` — automatycznie zapisuje logi konsoli przy awarii.

Następnie napisz test „zalogowany użytkownik kupuje produkt” tak, aby w samym teście zostały tylko kroki biznesowe i asercje.

## Linki

- [Playwright Fixtures](https://playwright.dev/docs/test-fixtures)
- [Playwright Authentication](https://playwright.dev/docs/auth)
- [Playwright API testing](https://playwright.dev/docs/api-testing)
- [Playwright Page Object Models](https://playwright.dev/docs/pom)
