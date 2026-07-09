# Budowniczowie danych i fabryki

Dane testowe powinny mówić, jaki wariant biznesowy sprawdza test. Jeśli w każdym teście ręcznie tworzysz obiekt użytkownika z dwudziestoma polami, po kilku tygodniach nikt nie wie, które pola są istotne, a które są tylko technicznym szumem. Builder i factory rozwiązują ten problem: tworzą poprawny obiekt domyślnie, a test nadpisuje tylko to, co jest ważne dla scenariusza.

## 1. Builder vs factory

**Builder** tworzy dane w pamięci:

```typescript
type User = {
  email: string;
  password: string;
  role: 'customer' | 'admin';
  marketingConsent: boolean;
};

export function buildUser(overrides: Partial<User> = {}): User {
  return {
    email: `qa+${crypto.randomUUID()}@example.test`,
    password: 'Correct-Horse-Battery-7!',
    role: 'customer',
    marketingConsent: false,
    ...overrides,
  };
}
```

**Factory** tworzy stan w systemie, np. przez API:

```typescript
export async function createUser(request: APIRequestContext, overrides: Partial<User> = {}) {
  const user = buildUser(overrides);
  const response = await request.post('/api/users', { data: user });
  expect(response.status()).toBe(201);
  return response.json();
}
```

Różnica jest ważna: builder nie ma skutków ubocznych, factory je ma.

## 2. Test pokazuje tylko istotne dane

```typescript
const blockedUser = buildUser({
  role: 'customer',
  marketingConsent: true,
});
```

Jeżeli test sprawdza marketing consent, tylko to pole powinno być wyróżnione. Reszta może zostać domyślna.

## 3. Unikalność i równoległość

Dane muszą działać równolegle. Nie używaj stałego emaila:

```typescript
email: 'test@example.com' // źle dla równoległości
```

Lepsze:

```typescript
email: `qa+${process.env.TEST_RUN_ID ?? 'local'}-${crypto.randomUUID()}@example.test`
```

Możesz też uwzględnić `testInfo.parallelIndex`:

```typescript
export function buildWorkerUser(workerIndex: number): User {
  return buildUser({
    email: `qa+worker-${workerIndex}-${crypto.randomUUID()}@example.test`,
  });
}
```

## 4. Object Mother — ostrożnie

Object Mother to katalog nazwanych wariantów:

```typescript
export const Users = {
  admin: () => buildUser({ role: 'admin' }),
  customer: () => buildUser({ role: 'customer' }),
  withoutConsent: () => buildUser({ marketingConsent: false }),
};
```

To jest dobre dla kilku znanych wariantów. Jeśli plik ma 100 metod typu `user27()`, stał się śmietnikiem.

## 5. Zagnieżdżone buildery

Zamówienie składa się z klienta, adresu i pozycji:

```typescript
type Order = {
  customer: User;
  shippingAddress: Address;
  items: OrderItem[];
  currency: 'PLN' | 'EUR';
};

export function buildOrder(overrides: Partial<Order> = {}): Order {
  return {
    customer: buildUser(),
    shippingAddress: buildAddress(),
    items: [buildOrderItem()],
    currency: 'PLN',
    ...overrides,
  };
}
```

Dzięki temu test może mówić:

```typescript
const order = buildOrder({
  items: [buildOrderItem({ sku: 'OUT-OF-STOCK' })],
});
```

## 6. Builder nie powinien ukrywać logiki testu

Jeśli builder ma 20 warunków, wykonuje requesty, czyta bazę i ustawia sesję, to nie jest builder. Rozdziel odpowiedzialności:

- builder — tworzy obiekt;
- factory — zapisuje obiekt w systemie;
- client API — wykonuje request;
- cleanup tracker — usuwa zasób;
- fixture — dostarcza gotowy zasób testowi.

## 7. Checklista

- Czy dane domyślne są poprawne biznesowo?
- Czy test nadpisuje tylko pola istotne dla scenariusza?
- Czy generowane wartości są unikalne dla równoległości?
- Czy builder nie ma skutków ubocznych?
- Czy factory jasno komunikuje, że tworzy stan w systemie?
- Czy typy TypeScript opisują kontrakt danych?

## Linki

- [Playwright fixtures](https://playwright.dev/docs/test-fixtures)
- [API testing](https://playwright.dev/docs/api-testing)
- [Best practices](https://playwright.dev/docs/best-practices)

## 8. Przykład pełnego przepływu builder + factory + cleanup

```typescript
export async function createOrderForTest(request: APIRequestContext, overrides: Partial<Order> = {}) {
  const payload = buildOrder(overrides);
  const response = await request.post('/api/orders', { data: payload });
  expect(response.status()).toBe(201);
  return response.json();
}

test('klient widzi zamówienie utworzone przez API', async ({ request, page }) => {
  const order = await createOrderForTest(request, {
    items: [buildOrderItem({ sku: 'BOOK-1' })],
  });

  await page.goto(`/orders/${order.id}`);
  await expect(page.getByText(order.id)).toBeVisible();
});
```

Ten wzorzec jest czytelny: test pokazuje wariant danych, factory tworzy stan, a Page Object lub UI sprawdza rezultat.

## 9. Czego nie wkładać do buildera

Builder nie powinien:

- czytać zmiennych środowiskowych poza prostym `runId`;
- wykonywać requestów;
- czytać bazy;
- losowo wybierać krytycznych wariantów biznesowych;
- ukrywać zależności od roli użytkownika;
- tworzyć danych niezgodnych z walidacją API.

Jeśli test wymaga produktu wyprzedanego, nazwij to jawnie:

```typescript
const product = buildProduct({ stock: 0 });
```

Nie ukrywaj tego w losowym generatorze, który czasem zwraca `stock: 0`, a czasem `stock: 10`.

## 10. Buildery a czytelność testu

Builder powinien sprawić, że test wygląda jak opis scenariusza:

```typescript
const order = buildOrder({
  customer: buildUser({ role: 'customer' }),
  items: [buildOrderItem({ sku: 'PROMO-BOOK', quantity: 2 })],
});
```

Jeśli test musi nadpisać 15 pól, sprawdź, czy nie potrzebujesz nazwanego wariantu domenowego, np. `buildPaidOrder`, `buildCancelledOrder`, `buildOrderWithOutOfStockItem`.

## 11. Walidacja danych buildera

Builder powinien tworzyć dane poprawne domyślnie. Warto mieć testy dla samych builderów, szczególnie gdy są używane w wielu suite’ach. Jeśli builder tworzy niepoprawny payload, wiele testów zacznie padać w setupie zamiast w testowanym zachowaniu.

## 12. Buildery wariantów domenowych

Jeżeli pewne warianty powtarzają się często, nazwij je językiem domeny:

```typescript
export function buildPaidOrder(overrides: Partial<Order> = {}) {
  return buildOrder({ status: 'PAID', paidAt: new Date().toISOString(), ...overrides });
}

export function buildCancelledOrder(overrides: Partial<Order> = {}) {
  return buildOrder({ status: 'CANCELLED', cancelledReason: 'customer_request', ...overrides });
}
```

Test staje się wtedy krótszy i czytelniejszy:

```typescript
const order = buildPaidOrder({ currency: 'PLN' });
```

Nie przesadzaj jednak z liczbą wariantów. Jeśli wariant jest użyty raz, zwykłe `buildOrder({ ... })` może być prostsze.

## 13. Buildery a kontrakt API

Builder powinien być zgodny z aktualnym kontraktem API. Jeśli OpenAPI mówi, że `currency` jest wymagane, builder powinien je ustawić domyślnie. Jeśli API zmienia kontrakt, buildery powinny zostać zaktualizowane razem z klientami API i schematami.

Dobry wzorzec to współdzielenie typów:

```typescript
type CreateOrderPayload = components['schemas']['CreateOrderPayload'];
```

Dzięki temu TypeScript szybciej wykryje rozjazd między danymi testowymi a kontraktem.

## 14. Checklista review buildera

- Czy domyślny obiekt przechodzi walidację API?
- Czy pola dynamiczne są unikalne?
- Czy wariant domenowy ma jasną nazwę?
- Czy builder nie wykonuje requestów?
- Czy test nadpisuje tylko dane istotne dla scenariusza?
