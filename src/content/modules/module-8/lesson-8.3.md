# Kontrakty API i walidacja schematów

Test API, który sprawdza tylko status HTTP, nie chroni konsumentów. Endpoint może nadal zwracać `200`, ale zmienić typ pola, usunąć wymagane pole, zmienić kod błędu albo strukturę paginacji. Kontrakt API to umowa między dostawcą a klientem: jakie dane można wysłać, jakie dane wrócą, jakie błędy są możliwe i jakie znaczenie mają pola.

## 1. Co jest kontraktem API

Kontrakt obejmuje:

- metodę HTTP;
- URL i parametry;
- body requestu;
- statusy odpowiedzi;
- body odpowiedzi;
- nagłówki;
- format błędów;
- autoryzację;
- paginację;
- wersjonowanie;
- kompatybilność wsteczną.

Przykład: jeśli frontend oczekuje `total` jako number, zmiana na string jest breaking change, nawet jeśli status to nadal `200`.

## 2. Walidacja ręczna matcherami

Dla prostych kontraktów wystarczą matchery:

```typescript
const response = await request.get('/api/orders/ORD-123');
expect(response.status()).toBe(200);

const order = await response.json();
expect(order).toEqual(expect.objectContaining({
  id: expect.any(String),
  status: expect.stringMatching(/^(NEW|PAID|CANCELLED)$/),
  total: expect.any(Number),
  currency: 'PLN',
}));
```

To jest szybkie i czytelne, ale przy większych kontraktach warto użyć schematów.

## 3. JSON Schema i Ajv

```typescript
import Ajv from 'ajv';

const orderSchema = {
  type: 'object',
  required: ['id', 'status', 'total', 'items'],
  properties: {
    id: { type: 'string' },
    status: { enum: ['NEW', 'PAID', 'CANCELLED'] },
    total: { type: 'number' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        required: ['sku', 'quantity'],
        properties: {
          sku: { type: 'string' },
          quantity: { type: 'integer', minimum: 1 },
        },
      },
    },
  },
};

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(orderSchema);
const body = await response.json();

expect(validate(body), JSON.stringify(validate.errors, null, 2)).toBe(true);
```

`allErrors: true` pomaga w diagnostyce, bo pokazuje więcej niż pierwszy błąd.

## 4. OpenAPI jako źródło prawdy

OpenAPI pozwala opisać endpointy, requesty i response’y w jednym kontrakcie. Testy mogą:

- walidować odpowiedzi względem specyfikacji;
- wykrywać brakujące endpointy;
- sprawdzać przykłady;
- generować typy TypeScript;
- porównywać zmiany pod kątem breaking changes.

W dojrzałym zespole OpenAPI powinno być częścią procesu review. Zmiana kontraktu bez aktualizacji specyfikacji jest długiem technicznym.

## 5. Testy negatywnego kontraktu

Kontrakt obejmuje też błędy:

```typescript
const response = await request.post('/api/orders', {
  data: { items: [] },
});

expect(response.status()).toBe(400);
const error = await response.json();
expect(error).toMatchObject({
  code: 'VALIDATION_ERROR',
  message: expect.any(String),
});
```

Format błędu jest tak samo ważny jak format sukcesu. Frontend potrzebuje stabilnego `code`, aby pokazać właściwy komunikat.

## 6. Wersjonowanie i breaking changes

Zmiany zwykle kompatybilne:

- dodanie opcjonalnego pola;
- dodanie nowej wartości, jeśli klient jest na to przygotowany;
- rozszerzenie metadanych.

Zmiany ryzykowne lub łamiące:

- usunięcie pola;
- zmiana typu pola;
- zmiana znaczenia pola;
- zmiana kodu błędu;
- zmiana domyślnego sortowania;
- zmiana wymaganych parametrów.

## 7. Pact i kontrakty konsumenckie

Pact pozwala konsumentowi opisać, jakiej odpowiedzi potrzebuje. Dostawca uruchamia weryfikację i wie, czy nadal spełnia potrzeby klientów.

Playwright może uzupełniać Pact: używasz Playwright do testów API i UI, a Pact do formalnego kontraktu między usługami.

## 8. Checklista kontraktu

- Czy test sprawdza body, nie tylko status?
- Czy typy pól są walidowane?
- Czy wymagane pola są sprawdzone?
- Czy format błędów jest częścią kontraktu?
- Czy autoryzacja jest sprawdzona dla różnych ról?
- Czy paginacja i sortowanie mają testy?
- Czy zmiany OpenAPI są reviewowane?
- Czy breaking changes są wykrywane przed deployem?

## Linki

- [Playwright API testing](https://playwright.dev/docs/api-testing)
- [APIResponseAssertions](https://playwright.dev/docs/api/class-apiresponseassertions)
- [OpenAPI](https://www.openapis.org/)
- [Ajv JSON Schema Validator](https://ajv.js.org/)

## 9. Kontrakt paginacji

Paginacja jest częścią kontraktu API. Test powinien sprawdzić nie tylko listę danych, ale też metadane:

```typescript
const response = await request.get('/api/orders?page=1&pageSize=20');
await expect(response).toBeOK();
const body = await response.json();

expect(body).toMatchObject({
  items: expect.any(Array),
  page: 1,
  pageSize: 20,
  totalItems: expect.any(Number),
});
```

Jeśli frontend zależy od `totalPages`, brak tego pola jest breaking change.

## 10. Diagnostyka walidacji schematu

Przy walidacji schematu zawsze wypisuj błędy walidatora. Samo `expected false to be true` nie pomaga.

```typescript
const valid = validate(body);
expect(valid, JSON.stringify(validate.errors, null, 2)).toBe(true);
```

## 11. Contract drift

Contract drift oznacza, że implementacja i dokumentacja zaczynają się rozjeżdżać. Testy kontraktowe powinny działać w CI i blokować zmianę, która zmienia typ, usuwa pole albo modyfikuje format błędu bez uzgodnienia.

## 12. Typy TypeScript z kontraktu

Jeśli generujesz typy z OpenAPI, używaj ich w klientach API i builderach. Dzięki temu zmiana kontraktu jest widoczna już na poziomie kompilacji, a nie dopiero w testach UI.

## 13. Kontrakt autoryzacji

Kontrakt API obejmuje także to, kto może wykonać operację. Dla krytycznych endpointów sprawdzaj role:

```typescript
const response = await userRequest.delete('/api/admin/users/u1');
expect(response.status()).toBe(403);
const error = await response.json();
expect(error.code).toBe('FORBIDDEN');
```

Brak testów autoryzacji jest częstą przyczyną luk bezpieczeństwa.

## 14. Kontrakt nagłówków

Niektóre nagłówki są częścią kontraktu: `content-type`, `cache-control`, `etag`, `retry-after`, `x-request-id`. Jeśli frontend albo integracja od nich zależy, test powinien je sprawdzić.

```typescript
expect(response.headers()['content-type']).toContain('application/json');
expect(response.headers()['x-request-id']).toBeTruthy();
```

## 15. Zasada końcowa

Kontrakt API nie jest dokumentem obok systemu. Jest wykonywalną umową. Jeśli test kontraktu nie działa w CI, dokumentacja może bardzo szybko przestać odpowiadać rzeczywistości.

Każda zmiana kontraktu powinna być świadoma, widoczna i uzgodniona.

## 📘 Suplement Inżynieryjny 2026: Zaawansowane Testowanie API (API Object Model)
*Inspiracja: „Scalable Test Automation with Playwright” (2026), Chapter 2*
*   **API Object Model (AOM)**: Hermetyzuj adresy URL, nagłówki i struktury zapytań HTTP w klasach modelu API dziedziczących po `BaseApi`. Powołuj te obiekty za pomocą `ApiFactory`, chroniąc testy przed modyfikacją endpointów.
*   **Synchronizacja Autoryzacji**: Korzystaj z wbudowanej fixtury `request`, która potrafi współdzielić stan sesji i ciasteczka bezpośrednio z kontekstem przeglądarki.
