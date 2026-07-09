# Testowanie i asercje API — Full Stack Approach

Playwright nie służy wyłącznie do testowania UI. Fixture `request` oraz `APIRequestContext` pozwalają wykonywać żądania HTTP bezpośrednio z testu. To kluczowa umiejętność Full Stack Testera, bo wiele stabilnych testów E2E używa API do przygotowania danych, weryfikacji stanu backendu albo testowania kontraktu bez kosztownego przechodzenia przez UI.

Samo `expect(response.ok()).toBeTruthy()` nie wystarcza. Dobry test API sprawdza status, body, nagłówki, kontrakt, scenariusze negatywne, autoryzację i skutki uboczne.

## 1. Fixture `request`

Najprostszy test API:

```typescript
import { test, expect } from '@playwright/test';

test('API zwraca listę produktów', async ({ request }) => {
  const response = await request.get('/api/products');

  await expect(response).toBeOK();
  expect(response.headers()['content-type']).toContain('application/json');

  const body = await response.json();
  expect(body).toEqual(expect.any(Array));
  expect(body.length).toBeGreaterThan(0);
});
```

`request` korzysta z konfiguracji Playwright, w tym z `baseURL`, jeśli jest ustawione.

## 2. `APIResponseAssertions`

Playwright ma asercję dla odpowiedzi API:

```typescript
await expect(response).toBeOK();
```

`toBeOK()` sprawdza, czy status jest w zakresie 2xx/3xx zgodnie z semantyką `response.ok()`. Jeśli potrzebujesz konkretnego statusu, sprawdzaj go jawnie:

```typescript
expect(response.status()).toBe(201);
```

Dobre testy często używają obu poziomów: `toBeOK` dla ogólnego sukcesu albo konkretny status dla kontraktu endpointu.

## 3. Status HTTP to dopiero początek

```typescript
const response = await request.get('/api/orders/ORD-123');
expect(response.status()).toBe(200);

const order = await response.json();
expect(order).toMatchObject({
  id: 'ORD-123',
  status: 'PAID',
  currency: 'PLN',
});
```

Status `200` mówi, że serwer odpowiedział. Nie mówi, czy zwrócił właściwe zamówienie, status, walutę, role użytkownika albo dane paginacji.

## 4. Nagłówki

```typescript
expect(response.headers()['content-type']).toContain('application/json');
expect(response.headers()['cache-control']).toContain('no-store');
```

Nagłówki są ważne dla:

- typów treści;
- cache;
- bezpieczeństwa;
- paginacji;
- rate limitów;
- korelacji requestów.

Jeśli system używa `x-correlation-id`, warto sprawdzać jego obecność i wykorzystywać go w diagnostyce.

## 5. Body JSON i kontrakt

```typescript
const body = await response.json();

expect(body).toEqual(expect.objectContaining({
  id: expect.any(String),
  status: expect.stringMatching(/^(NEW|PAID|CANCELLED)$/),
  totalGross: expect.any(Number),
  items: expect.any(Array),
}));
```

Asercja powinna być tak szczegółowa, jak wymaga kontrakt. Jeśli API jest publiczne albo krytyczne dla wielu klientów, warto dołożyć walidację schematu OpenAPI/Zod/Ajv w osobnej warstwie testów.

## 6. Scenariusze negatywne

Test API bez negatywnych przypadków jest niepełny.

```typescript
test('API odrzuca zamówienie bez produktów', async ({ request }) => {
  const response = await request.post('/api/orders', {
    data: { items: [] },
  });

  expect(response.status()).toBe(400);
  const error = await response.json();
  expect(error).toMatchObject({
    code: 'VALIDATION_ERROR',
  });
});
```

Typowe negatywne przypadki:

- 400 — błędne dane;
- 401 — brak uwierzytelnienia;
- 403 — brak uprawnień;
- 404 — brak zasobu;
- 409 — konflikt;
- 422 — błąd walidacji domenowej;
- 429 — rate limit;
- 500 — błąd serwera, zwykle nie jako oczekiwany wynik.

## 7. Autoryzacja i storage state

`APIRequestContext` może współdzielić cookies/storage z kontekstem przeglądarki albo być niezależny, zależnie od sposobu utworzenia. W testach z fixture `request` zwykle korzystasz z kontekstu skonfigurowanego przez Playwright.

Przykład z nagłówkiem:

```typescript
const response = await request.get('/api/admin/users', {
  headers: {
    Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
  },
});
```

Przykład niezależnego kontekstu:

```typescript
const api = await playwright.request.newContext({
  baseURL: process.env.BASE_URL,
  extraHTTPHeaders: {
    Authorization: `Bearer ${process.env.API_TOKEN}`,
  },
});

const response = await api.get('/api/orders');
await api.dispose();
```

Zamykaj ręcznie utworzone konteksty przez `dispose()`.

## 8. API jako setup i teardown dla UI

Zamiast tworzyć dane przez UI, użyj API:

```typescript
test('użytkownik edytuje produkt', async ({ page, request }) => {
  const create = await request.post('/api/products', {
    data: { name: `Produkt ${Date.now()}`, price: 100 },
  });
  expect(create.status()).toBe(201);
  const product = await create.json();

  await page.goto(`/products/${product.id}/edit`);
  await page.getByLabel('Cena').fill('120');
  await page.getByRole('button', { name: 'Zapisz' }).click();

  await expect(page.getByText('Produkt zapisany')).toBeVisible();

  const verify = await request.get(`/api/products/${product.id}`);
  const updated = await verify.json();
  expect(updated.price).toBe(120);
});
```

To skraca test i usuwa zależność od nieistotnych ekranów.

## 9. Multipart, formularze i pliki

APIRequestContext obsługuje różne typy payloadów:

```typescript
await request.post('/api/upload', {
  multipart: {
    file: {
      name: 'invoice.pdf',
      mimeType: 'application/pdf',
      buffer: await fs.promises.readFile('tests/assets/invoice.pdf'),
    },
    type: 'invoice',
  },
});
```

Dla JSON używaj `data`. Dla formularzy i plików — `form` lub `multipart` zgodnie z dokumentacją.

## 10. `failOnStatusCode`

W nowszych wersjach Playwright opcja `failOnStatusCode` pozwala sprawić, że request rzuci błąd dla statusów spoza 2xx/3xx.

To przydatne dla helperów setupu, które mają natychmiast przerwać test, jeśli nie uda się utworzyć danych. Nie używaj jej w testach negatywnych, gdzie oczekujesz np. 400 albo 403.

## 11. Eventual consistency i polling API

Jeżeli backend przetwarza zamówienie asynchronicznie:

```typescript
await expect.poll(async () => {
  const response = await request.get('/api/orders/ORD-123');
  const order = await response.json();
  return order.status;
}, {
  timeout: 30_000,
}).toBe('PAID');
```

To lepsze niż `waitForTimeout(30000)`, bo test kończy się natychmiast, gdy warunek jest spełniony.

## 12. Antywzorce

- Sprawdzanie tylko `response.ok()`.
- Brak testów 400/401/403/404/409.
- Pełne porównanie body zawierającego dynamiczne pola.
- Brak cleanupu danych utworzonych przez API.
- Używanie jednego współdzielonego użytkownika do testów modyfikujących stan.
- Twardo wpisane tokeny w kodzie.
- `failOnStatusCode` w testach negatywnych.

## 13. Checklista asercji API

- Czy status HTTP jest sprawdzony?
- Czy body potwierdza semantykę odpowiedzi?
- Czy nagłówki istotne dla kontraktu są sprawdzone?
- Czy są scenariusze negatywne?
- Czy autoryzacja i role są pokryte?
- Czy dane dynamiczne są sprawdzane przez typ/format?
- Czy cleanup danych jest zaplanowany?
- Czy test API wspiera stabilność testu UI, zamiast powielać jego kroki?

## Linki

- [API testing](https://playwright.dev/docs/api-testing)
- [APIRequestContext](https://playwright.dev/docs/api/class-apirequestcontext)
- [APIResponseAssertions](https://playwright.dev/docs/api/class-apiresponseassertions)
- [Authentication](https://playwright.dev/docs/auth)
- [Assertions](https://playwright.dev/docs/test-assertions)
