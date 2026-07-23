# Organizacja testów API i wzorce

Testy API szybko rosną: endpointy, role, scenariusze negatywne, kontrakty, setup danych, cleanup, retry, paginacja, pliki, autoryzacja. Bez struktury projekt staje się zbiorem requestów w losowych plikach. Dobra organizacja API tests sprawia, że testy są szybkie, czytelne i łatwe do diagnozy.

## 1. Proponowana struktura

```text
tests/
  api/
    orders.api.spec.ts
    users.api.spec.ts
    auth.api.spec.ts
  clients/
    OrdersClient.ts
    UsersClient.ts
  data/
    builders/
      orderBuilder.ts
      userBuilder.ts
  assertions/
    order.assertions.ts
    error.assertions.ts
  schemas/
    order.schema.ts
  fixtures/
    api-test.ts
```

Specyfikacje opisują scenariusze. Klienci API wykonują requesty. Buildery tworzą payloady. Asercje i schematy sprawdzają kontrakt.

## 2. API Client Object

```typescript
export class OrdersClient {
  constructor(private readonly request: APIRequestContext) {}

  async createOrder(payload: CreateOrderPayload) {
    const response = await this.request.post('/api/orders', { data: payload });
    expect(response.status()).toBe(201);
    return response.json();
  }

  async getOrder(orderId: string) {
    return this.request.get(`/api/orders/${orderId}`);
  }

  async deleteOrder(orderId: string) {
    const response = await this.request.delete(`/api/orders/${orderId}`);
    expect([200, 204, 404]).toContain(response.status());
  }
}
```

Klient API nie powinien ukrywać wszystkich asercji. Może sprawdzić techniczny sukces setupu, ale scenariusz testowy powinien jawnie sprawdzać kontrakt ważny dla testu.

## 3. Fixtures dla klientów API

```typescript
export const test = base.extend<{ ordersClient: OrdersClient }>({
  ordersClient: async ({ request }, use) => {
    await use(new OrdersClient(request));
  },
});
```

Test:

```typescript
test('zamówienie ma status PAID', async ({ ordersClient }) => {
  const order = await ordersClient.createOrder(buildPaidOrder());
  const response = await ordersClient.getOrder(order.id);
  await expect(response).toBeOK();
  expect(await response.json()).toMatchObject({ status: 'PAID' });
});
```

## 4. Podział scenariuszy

Dla każdego endpointu planuj:

- happy path;
- walidacja requestu;
- brak auth;
- brak uprawnień;
- brak zasobu;
- konflikt;
- paginacja;
- sortowanie;
- filtrowanie;
- nagłówki;
- kontrakt błędu.

Nie każdy endpoint wymaga takiej samej głębokości, ale krytyczne API powinno mieć pełne pokrycie.

## 5. Tagi i pipeline

Przykłady tagów:

```typescript
test('tworzy zamówienie', { tag: ['@api', '@orders', '@smoke'] }, async ({ request }) => {});
test('odrzuca brak uprawnień', { tag: ['@api', '@auth', '@negative'] }, async ({ request }) => {});
```

Komendy:

```bash
npx playwright test --grep @api
npx playwright test --grep "@api.*@smoke"
npx playwright test --grep @negative
```

API smoke może działać w każdym PR. Pełna regresja API może działać nightly.

## 6. Cleanup i idempotencja

API tests tworzą dużo danych. Używaj `runId`, cleanup trackerów i endpointów testowych do sprzątania.

```typescript
test.afterEach(async ({ request }, testInfo) => {
  await request.delete(`/api/test-data?runId=${testInfo.project.name}-${testInfo.parallelIndex}`);
});
```

Endpointy cleanup muszą być dostępne tylko w środowiskach testowych i zabezpieczone.

## 7. Diagnostyka

Przy awarii dołącz:

- URL;
- status;
- response body;
- request id / correlation id;
- payload requestu bez sekretów;
- nagłówki istotne dla kontraktu.

```typescript
await testInfo.attach('api-response.json', {
  body: JSON.stringify(await response.json(), null, 2),
  contentType: 'application/json',
});
```

Uważaj, aby nie załączać tokenów i danych osobowych.

## 8. Antywzorce

- Requesty pisane bezpośrednio w każdym teście bez klientów API.
- Test API sprawdzający tylko `200`.
- Brak negatywnych scenariuszy.
- Cleanup zależny od przejścia testu.
- Twardo wpisane tokeny.
- Jeden użytkownik do wszystkich testów równoległych.
- Zbyt wiele logiki asercji ukrytej w kliencie API.

## 9. Checklista organizacji API tests

- Czy endpointy są pogrupowane domenowo?
- Czy istnieją klienci API?
- Czy payloady są budowane przez buildery?
- Czy kontrakty są w schematach/asercjach?
- Czy scenariusze negatywne są pokryte?
- Czy dane są sprzątane po awarii?
- Czy testy API mają tagi i osobny pipeline?
- Czy diagnostyka nie ujawnia sekretów?

## Linki

- [Playwright API testing](https://playwright.dev/docs/api-testing)
- [Fixtures](https://playwright.dev/docs/test-fixtures)
- [Test annotations](https://playwright.dev/docs/test-annotations)
- [Reporters](https://playwright.dev/docs/test-reporters)

## 10. Wspólne asercje błędów

Format błędu powinien być spójny w całym API. Warto mieć helper:

```typescript
export async function expectApiError(response: APIResponse, status: number, code: string) {
  expect(response.status()).toBe(status);
  const body = await response.json();
  expect(body).toMatchObject({
    code,
    message: expect.any(String),
  });
}
```

Użycie:

```typescript
const response = await request.get('/api/admin/users');
await expectApiError(response, 403, 'FORBIDDEN');
```

## 11. API tests jako wsparcie E2E

Dobre testy API zmniejszają liczbę ciężkich testów UI. Jeśli kontrakt walidacji zamówienia jest dokładnie pokryty w API, UI może mieć tylko kilka testów potwierdzających, że użytkownik widzi właściwy komunikat. To skraca suite i poprawia diagnostykę.

## 12. Warstwy API suite

Podziel API tests na warstwy:

- `@api @smoke` — health, auth, najważniejsze endpointy;
- `@api @contract` — schematy i typy;
- `@api @negative` — błędy i uprawnienia;
- `@api @data-setup` — endpointy wspierające E2E;
- `@api @performance-smoke` — lekkie budżety czasu.

Taki podział ułatwia uruchamianie właściwego zakresu w PR, nightly i release.

## 13. Review testów API

Review powinno sprawdzać:

- czy test sprawdza semantykę, nie tylko status;
- czy scenariusz negatywny ma stabilny kod błędu;
- czy payload jest typowany;
- czy cleanup działa;
- czy logi nie ujawniają sekretów;
- czy test nie dubluje ciężkiego E2E bez potrzeby.

## 14. Konfiguracja bazowa API suite

Warto mieć osobny plik fixture dla API:

```typescript
export const test = base.extend<{
  ordersClient: OrdersClient;
  usersClient: UsersClient;
}>({
  ordersClient: async ({ request }, use) => {
    await use(new OrdersClient(request));
  },
  usersClient: async ({ request }, use) => {
    await use(new UsersClient(request));
  },
});
```

Dzięki temu testy API mają takie same zależności i standardy jak testy UI.

## 15. Dokumentowanie endpointów test-support

Jeśli istnieją endpointy do setupu i cleanupu, muszą być opisane i zabezpieczone. Nie powinny być dostępne na produkcji. Testy powinny jasno odróżniać publiczne API od API pomocniczego.

## 16. Raportowanie API failures

Przy awarii API dołącz minimalny zestaw:

- metoda i URL;
- status;
- request id;
- body odpowiedzi po maskowaniu;
- payload requestu bez sekretów;
- rola użytkownika.

## 17. Zasada końcowa

Dobra organizacja API tests zmniejsza liczbę drogich testów UI. Im lepiej pokryjesz kontrakty i błędy na poziomie API, tym mniej wariantów musisz przepychać przez przeglądarkę.

## 📘 Suplement Inżynieryjny 2026: Zaawansowane Testowanie API (API Object Model)
*Inspiracja: „Scalable Test Automation with Playwright” (2026), Chapter 2*
*   **API Object Model (AOM)**: Hermetyzuj adresy URL, nagłówki i struktury zapytań HTTP w klasach modelu API dziedziczących po `BaseApi`. Powołuj te obiekty za pomocą `ApiFactory`, chroniąc testy przed modyfikacją endpointów.
*   **Synchronizacja Autoryzacji**: Korzystaj z wbudowanej fixtury `request`, która potrafi współdzielić stan sesji i ciasteczka bezpośrednio z kontekstem przeglądarki.
