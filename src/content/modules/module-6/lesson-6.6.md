# Page Object Model z fixtures — wstrzykiwanie stron, komponentów i klientów API

Fixtures są naturalnym partnerem Page Object Model. Page Object jest zależnością testu, tak samo jak `page`, `request` albo dane użytkownika. Jeśli każdy test ręcznie tworzy `new LoginPage(page)`, `new DashboardPage(page)` i `new OrdersClient(request)`, szybko pojawia się duplikacja. Fixtures pozwalają dostarczyć te obiekty spójnie i typowo.

## 1. Problem ręcznego tworzenia Page Objectów

```typescript
test('użytkownik widzi zamówienia', async ({ page, request }) => {
  const loginPage = new LoginPage(page);
  const ordersPage = new OrdersPage(page);
  const ordersClient = new OrdersClient(request);

  // ...
});
```

Na początku to jest akceptowalne. W większym projekcie powtarza się w wielu plikach. Gdy konstruktor Page Objecta się zmieni, trzeba poprawić wiele testów.

## 2. Podstawowa fixture dla POM

```typescript
// tests/fixtures/base-test.ts
import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { OrdersPage } from '../pages/OrdersPage';

type PageFixtures = {
  loginPage: LoginPage;
  ordersPage: OrdersPage;
};

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  ordersPage: async ({ page }, use) => {
    await use(new OrdersPage(page));
  },
});

export { expect };
```

Test:

```typescript
import { test, expect } from '../fixtures/base-test';

test('użytkownik widzi zamówienia', async ({ ordersPage }) => {
  await ordersPage.goto();
  await ordersPage.expectLoaded();
});
```

Test importuje własny `test`, nie `@playwright/test`.

## 3. Fixtures dla komponentów

Możesz dostarczać komponenty:

```typescript
type Components = {
  header: HeaderComponent;
  toast: ToastComponent;
};

export const test = base.extend<Components>({
  header: async ({ page }, use) => {
    await use(new HeaderComponent(page.getByRole('banner')));
  },
  toast: async ({ page }, use) => {
    await use(new ToastComponent(page.getByRole('status')));
  },
});
```

To ma sens dla elementów obecnych w większości testów. Nie twórz fixtures dla każdego małego komponentu, jeśli używa go tylko jeden Page Object.

## 4. Fixtures dla klientów API

```typescript
type ApiFixtures = {
  ordersClient: OrdersClient;
};

export const test = base.extend<ApiFixtures>({
  ordersClient: async ({ request }, use) => {
    await use(new OrdersClient(request));
  },
});
```

Użycie:

```typescript
test('zamówienie utworzone przez API jest widoczne w UI', async ({ ordersClient, ordersPage }) => {
  const order = await ordersClient.createOrder();
  await ordersPage.open(order.id);
  await ordersPage.expectOrderVisible(order.id);
});
```

To jest czysty Full Stack pattern: API przygotowuje stan, UI potwierdza zachowanie użytkownika.

## 5. App fixture — ostrożnie

Czasem wygodne jest dostarczenie obiektu `app`:

```typescript
class App {
  readonly login: LoginPage;
  readonly orders: OrdersPage;
  readonly ordersApi: OrdersClient;

  constructor(page: Page, request: APIRequestContext) {
    this.login = new LoginPage(page);
    this.orders = new OrdersPage(page);
    this.ordersApi = new OrdersClient(request);
  }
}
```

Fixture:

```typescript
export const test = base.extend<{ app: App }>({
  app: async ({ page, request }, use) => {
    await use(new App(page, request));
  },
});
```

Uważaj, aby `app` nie stał się God Objectem. Jeśli ma zbyt wiele odpowiedzialności, lepsze są osobne fixtures.

## 6. Auto fixtures dla diagnostyki

Auto fixtures są dobre do rzeczy technicznych, np. logów konsoli:

```typescript
export const test = base.extend<{ consoleLogs: void }>({
  consoleLogs: [async ({ page }, use, testInfo) => {
    const logs: string[] = [];
    page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`));

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

Nie używaj auto fixtures do ukrywania logowania, tworzenia danych i przechodzenia flow biznesowego bez wiedzy testu.

## 7. Łączenie fixtures

W większych projektach możesz rozdzielić fixtures:

```text
tests/fixtures/
  pages.fixture.ts
  api.fixture.ts
  diagnostics.fixture.ts
  base-test.ts
```

`base-test.ts` eksportuje finalny `test` używany w specach. Dzięki temu testy mają jeden import i spójne zależności.

## 8. Migracja krok po kroku

1. Zacznij od najczęściej używanych Page Objectów.
2. Stwórz `base-test.ts`.
3. Przenieś ręczne `new LoginPage(page)` do fixture.
4. Popraw importy w kilku testach.
5. Dopiero potem migruj kolejne obszary.
6. Nie przepisuj całej suite naraz, jeśli nie musisz.

## 9. Checklista

- Czy testy importują własny `test` z fixtures?
- Czy fixtures mają małą odpowiedzialność?
- Czy Page Objecty są tworzone per test, a nie współdzielone globalnie?
- Czy API clients są oddzielone od Page Objectów?
- Czy auto fixtures nie ukrywają logiki biznesowej?
- Czy typy fixtures są jawne?
- Czy migracja może być stopniowa?

## Linki

- [Fixtures](https://playwright.dev/docs/test-fixtures)
- [Page Object Models](https://playwright.dev/docs/pom)
- [API testing](https://playwright.dev/docs/api-testing)
- [Best practices](https://playwright.dev/docs/best-practices)

## 10. Worker-zakresd fixtures a POM

Page Objecty zwykle są test-zakresd, bo opierają się na `page`. Klienci API, konta per worker albo ciężkie dane mogą być worker-zakresd. Nie mieszaj tych zakresów bez potrzeby.

```typescript
export const test = base.extend<{}, { workerAccount: Account }>({
  workerAccount: [async ({ request }, use, workerInfo) => {
    const account = await createAccount(request, `worker-${workerInfo.parallelIndex}`);
    await use(account);
  }, { zakres: 'worker' }],
});
```

Page Object korzysta potem z danych konta, ale nie jest współdzielony między testami.

## 11. Typed app fixture

Jeśli tworzysz `app` fixture, dobrze ją typuj:

```typescript
type App = {
  pages: { login: LoginPage; orders: OrdersPage };
  api: { orders: OrdersClient };
};
```

Dzięki temu `app` jest wygodą, nie magicznym workiem zależności.

## 12. Kiedy nie używać app fixture

Jeśli test potrzebuje tylko jednej strony, importowanie ogromnego `app` może ukrywać zależności. Używaj najmniejszej fixture, która wyraża potrzebę testu.

## 13. Checklista POM + fixtures

- Czy Page Object jest tworzony per test?
- Czy API clients są oddzielone od Page Objectów?
- Czy worker fixtures nie przechowują stanu UI?
- Czy `app` fixture nie stała się God Objectem?
- Czy test nadal pokazuje intencję biznesową?
