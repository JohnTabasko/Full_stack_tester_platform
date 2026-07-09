# Dane testowe z bazy danych i API

Dane testowe można przygotowywać przez UI, API, bazę danych, kolejki, seedy albo fixtures. Wybór warstwy ma znaczenie. Jeśli przygotowujesz dane przez UI, test jest wolny i zależny od wielu ekranów. Jeśli przygotowujesz je bezpośrednio przez SQL, możesz ominąć walidację biznesową aplikacji. Full Stack Tester musi dobrać właściwą warstwę do celu testu.

## 1. API jako domyślny setup dla E2E

W testach Playwright najczęściej najlepszym kompromisem jest API:

```typescript
test('zamówienie jest widoczne w panelu', async ({ request, page }) => {
  const create = await request.post('/api/orders', {
    data: buildOrder(),
  });
  expect(create.status()).toBe(201);
  const order = await create.json();

  await page.goto(`/orders/${order.id}`);
  await expect(page.getByRole('heading', { name: `Zamówienie ${order.id}` })).toBeVisible();
});
```

API jest szybsze niż UI, a jednocześnie przechodzi przez logikę aplikacji: walidacje, reguły domenowe, eventy i uprawnienia.

## 2. Kiedy używać SQL

SQL jest przydatny do:

- seedowania danych referencyjnych;
- diagnostyki po teście;
- sprawdzenia skutku w bazie;
- przygotowania trudnego stanu, którego API nie wspiera;
- cleanupu po `runId`.

SQL jest ryzykowny, gdy:

- omija walidację biznesową;
- tworzy niespójne rekordy;
- nie emituje eventów wymaganych przez aplikację;
- zależy od szczegółów schematu, który często się zmienia.

## 3. UI jako setup — zwykle najdroższa opcja

Tworzenie danych przez UI ma sens, gdy testujesz właśnie flow tworzenia danych. Jeśli testujesz edycję produktu, nie musisz za każdym razem tworzyć produktu przez UI. Utwórz go przez API i przejdź bezpośrednio do ekranu edycji.

## 4. Cleanup tracker

```typescript
export class CleanupTracker {
  private readonly callbacks: Array<() => Promise<void>> = [];

  add(callback: () => Promise<void>) {
    this.callbacks.push(callback);
  }

  async cleanup() {
    for (const callback of this.callbacks.reverse()) {
      try {
        await callback();
      } catch (error) {
        console.warn('Cleanup failed', error);
      }
    }
  }
}
```

Użycie:

```typescript
const cleanup = new CleanupTracker();
const order = await ordersClient.createOrder(buildOrder());
cleanup.add(() => ordersClient.deleteOrder(order.id));

try {
  await page.goto(`/orders/${order.id}`);
  await expect(page.getByText(order.id)).toBeVisible();
} finally {
  await cleanup.cleanup();
}
```

Cleanup powinien działać także wtedy, gdy test padnie.

## 5. Cleanup po runId

Lepszym wzorcem w CI bywa cleanup zbiorczy:

```typescript
const runId = process.env.TEST_RUN_ID ?? `local-${Date.now()}`;

await request.post('/api/orders', {
  data: { ...buildOrder(), runId },
});

// po suite
await request.delete(`/api/test-data?runId=${runId}`);
```

Dzięki temu nawet jeśli test padnie przed zarejestrowaniem callbacka cleanupu, dane nadal można znaleźć i usunąć.

## 6. Transakcje i rollback

Rollback jest świetny w testach integracyjnych, które działają w jednym procesie. W testach E2E przez przeglądarkę bywa trudniejszy, bo aplikacja, worker, kolejka i procesy asynchroniczne mogą działać poza transakcją testu.

Nie zakładaj, że rollback obejmie:

- eventy wysłane do kolejki;
- pliki zapisane w storage;
- emaile;
- cache;
- indeks wyszukiwarki;
- zewnętrzne integracje.

## 7. Dane UI + API + DB

Najmocniejszy test full stack często wygląda tak:

1. API tworzy stan.
2. UI wykonuje akcję użytkownika.
3. API albo DB potwierdza skutek.
4. Cleanup usuwa dane.

```typescript
const product = await productsClient.createProduct(buildProduct());
await page.goto(`/products/${product.id}`);
await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
await expect(page.getByText('Dodano do koszyka')).toBeVisible();

const cart = await cartsClient.getCurrentCart();
expect(cart.items).toEqual(expect.arrayContaining([
  expect.objectContaining({ productId: product.id }),
]));
```

## 8. Checklista

- Czy wybrana warstwa setupu odpowiada celowi testu?
- Czy API może przygotować stan szybciej niż UI?
- Czy SQL nie omija ważnej logiki biznesowej?
- Czy dane mają `runId`?
- Czy cleanup działa po awarii?
- Czy procesy asynchroniczne są uwzględnione?
- Czy test sprawdza skutek na właściwej warstwie?

## Linki

- [API testing](https://playwright.dev/docs/api-testing)
- [Fixtures](https://playwright.dev/docs/test-fixtures)
- [Parallelism](https://playwright.dev/docs/test-parallel)

## 9. Weryfikacja danych po akcji UI

Dostęp do API lub DB jest szczególnie wartościowy po wykonaniu akcji w UI:

```typescript
await page.getByRole('button', { name: 'Opłać zamówienie' }).click();
await expect(page.getByText('Płatność przyjęta')).toBeVisible();

await expect.poll(async () => {
  const response = await request.get(`/api/orders/${order.id}`);
  const body = await response.json();
  return body.status;
}).toBe('PAID');
```

UI potwierdza rezultat dla użytkownika, API potwierdza stan systemu. Polling jest lepszy niż stały timeout, gdy backend przetwarza zdarzenie asynchronicznie.

## 10. Endpointy test-support

W wielu firmach tworzy się specjalne endpointy dostępne tylko w środowiskach testowych:

```text
POST   /api/test-support/users
POST   /api/test-support/orders
DELETE /api/test-support/data?runId=...
```

To dobry wzorzec, jeśli endpointy są zabezpieczone, niedostępne na produkcji i opisane w dokumentacji zespołu. Nie twórz niejawnych backdoorów bez kontroli bezpieczeństwa.

## 11. Kolejność cleanupu

Zasoby usuwaj w odwrotnej kolejności tworzenia: najpierw pozycje zależne, potem obiekt nadrzędny. Jeśli tworzysz użytkownika, koszyk, zamówienie i płatność, cleanup powinien uwzględnić relacje.

```typescript
cleanup.add(() => paymentsClient.deletePayment(payment.id));
cleanup.add(() => ordersClient.deleteOrder(order.id));
cleanup.add(() => usersClient.deleteUser(user.id));
```

## 12. Kiedy zostawić dane po awarii

Czasem warto nie usuwać danych po nieudanym teście, aby programista mógł zobaczyć stan w aplikacji. Wtedy dane muszą mieć `runId`, właściciela i automatyczną retencję, np. usuwanie po 24 godzinach.

## 13. API setup z autoryzacją techniczną

Często dane testowe tworzy konto techniczne lub token administracyjny. To jest poprawne, jeśli jest jawne i odseparowane od roli testowanego użytkownika.

```typescript
const adminApi = await playwright.request.newContext({
  baseURL: process.env.BASE_URL,
  extraHTTPHeaders: {
    Authorization: `Bearer ${process.env.TEST_SUPPORT_TOKEN}`,
  },
});
```

Nie używaj tokena admina do wykonywania akcji, które w scenariuszu powinien wykonać zwykły użytkownik. Admin może przygotować stan, ale UI powinno działać na właściwej roli.

## 14. Walidacja setupu

Po utworzeniu danych przez API sprawdź, że setup się udał. Nie przechodź do UI, jeśli API zwróciło błąd.

```typescript
const response = await request.post('/api/orders', { data: buildOrder() });
expect(response.status()).toBe(201);
const order = await response.json();
expect(order.id).toBeTruthy();
```

W przeciwnym razie test UI padnie na „brak elementu”, chociaż prawdziwym problemem był setup.

## 15. Dane asynchroniczne

Jeśli po utworzeniu danych backend publikuje event, aktualizuje indeks wyszukiwarki albo generuje plik, test musi poczekać na gotowy stan:

```typescript
await expect.poll(async () => {
  const response = await request.get(`/api/orders/${order.id}`);
  const body = await response.json();
  return body.indexed;
}).toBe(true);
```

To lepsze niż stały sleep i znacznie łatwiejsze do diagnozy.
