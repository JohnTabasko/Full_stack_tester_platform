# Testowanie kontraktów i asercje odpowiedzi API (API Response Assertions)

Warstwa testowania API w Playwright jest niezwykle silna i działa w pełnej synergii z testami UI. Wysyłając zapytania HTTP bezpośrednio z poziomu test runnera (za pomocą wbudowanej fixtury `request`), otrzymujemy obiekt odpowiedzi **`APIResponse`**.

Jako profesjonalny Full Stack Tester musisz umieć napisać rygorystyczne asercje, które sprawdzą nie tylko poprawność kodu statusu HTTP, ale zweryfikują kompletność struktury danych (kontraktu JSON) oraz bezpieczeństwo nagłówków odpowiedzi.

---

## 1. Weryfikacja kodów statusu HTTP

Najprostszą asercją na obiekcie odpowiedzi API jest weryfikacja poprawności kodu statusu:

```typescript
import { test, expect } from '@playwright/test';

test('rejestracja nowego zamówienia przez API', async ({ request }) => {
  const response = await request.post('/api/v1/orders', {
    data: { productId: '99', quantity: 1 }
  });

  // Asercja Web-First na poprawność statusu (oczekuje 2xx)
  await expect(response).toBeOK();

  // Lub alternatywnie, asercja na dokładny kod statusu
  expect(response.status()).toBe(201);
});
```

---

## 2. Walidacja struktury i kontraktu JSON payloadu

Samo sprawdzenie kodu statusu `200 OK` to za mało. Musimy mieć pewność, że backend zwrócił poprawną strukturę danych i nie nastąpił tzw. *breaking change* (uszkodzenie kontraktu).

### A. Pobranie i prosta weryfikacja pól
```typescript
const body = await response.json();

// Weryfikacja istnienia i formatu kluczowych pól
expect(body).toHaveProperty('id');
expect(body.id).not.toBeNull();
expect(typeof body.id).toBe('string');
```

### B. Częściowe dopasowanie obiektu (Partial Object Matching)
Często backend zwraca w odpowiedzi wiele parametrów (np. daty utworzenia, id procesów), które są dynamiczne i trudne do przewidzenia. Możemy użyć matchera `objectContaining`, aby sprawdzić wyłącznie obecność i poprawność kluczowych danych biznesowych:

```typescript
expect(body).toEqual(
  expect.objectContaining({
    status: 'created',
    totalAmount: 150.00,
    customer: expect.objectContaining({
      email: 'klient@example.com'
    })
  })
);
```

---

## 3. Weryfikacja Nagłówków Odpowiedzi (Response Headers)

Nagłówki odpowiedzi są kluczowe pod kątem bezpieczeństwa i cache-owania. Warto wdrożyć automatyczne asercje weryfikujące poprawność nagłówków zwracanych przez Twoje API:

```typescript
const headers = response.headers();

// Upewnij się, że serwer wymusza format JSON
expect(headers['content-type']).toContain('application/json');

// Upewnij się, że wdrożono nagłówki bezpieczeństwa CORS
expect(headers['access-control-allow-origin']).toBeDefined();
```

---

## 4. Wyświetlanie czytelnej diagnostyki przy błędach

Jeśli asercja statusu API nie przejdzie na serwerze CI, test padnie z mało mówiącym komunikatem (np. `Expected 200, received 500`). Wyszukanie przyczyny błędu wymaga wówczas otwierania logów backendu.

Najlepszą praktyką inżynieryjną z 2026 r. jest dołączenie pełnej treści błędu zwróconego przez serwer bezpośrednio do komunikatu asercji:

```typescript
if (response.status() !== 201) {
  const errorText = await response.text();
  throw new Error(`Błąd tworzenia zamówienia! Serwer zwrócił status ${response.status()} o treści: ${errorText}`);
}
```

---

## 5. Checklista Asercji API
- [ ] Czy zawsze weryfikujesz status odpowiedzi przed próbą parsowania pliku JSON?
- [ ] Czy stosujesz matcher `expect.objectContaining()` do elastycznej walidacji kontraktów JSON?
- [ ] Czy sprawdzasz kluczowe nagłówki odpowiedzi (np. `Content-Type`)?
- [ ] Czy w przypadku błędów przechwytujesz i logujesz pełne body błędu w celu ułatwienia debugowania w CI?