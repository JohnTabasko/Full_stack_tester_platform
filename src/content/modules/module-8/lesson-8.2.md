# Testowanie interfejsów GraphQL w Playwright (GraphQL Testing)

W nowoczesnych architekturach mikroserwisowych oraz aplikacjach typu Single Page Application (SPA), interfejsy **GraphQL** stanowią coraz częstszą alternatywę dla tradycyjnego modelu REST API. GraphQL różni się diametralnie pod kątem sposobu przesyłania danych: zamiast dziesiątek różnych adresów URL (endpointów), cała komunikacja odbywa się przez **jeden uniwersalny punkt końcowy** (najczęściej `/graphql`) za pomocą żądań typu `POST`.

Testowanie GraphQL niesie za sobą specyficzne wyzwania – w szczególności obsługę tzw. **pułapki statusu 200 OK**, gdzie serwer zwraca poprawny kod odpowiedzi pomimo wystąpienia błędów biznesowych wewnątrz payloadu. W tej lekcji nauczysz się projektować stabilne testy zapytań (Queries) i mutacji (Mutations) w GraphQL przy użyciu Playwright.

---

## 1. Architektura zapytań GraphQL w Playwright (`request`)

Każde zapytanie GraphQL przesyłane jest jako obiekt JSON w metodzie `POST`, zawierający dwa kluczowe pola:
1.  **`query`**: Ciąg znaków opisujący strukturę zapytania (Query) lub modyfikacji danych (Mutation).
2.  **`variables`**: (Opcjonalny) Słownik zawierający dynamiczne wartości parametrów wejściowych.

Przeanalizujmy zapytanie o szczegóły produktu:

```typescript
import { test, expect } from '@playwright/test';

test('pobranie szczegółów produktu przez GraphQL', async ({ request }) => {
  // Wysyłamy żądanie POST do jednego wspólnego endpointu /graphql
  const response = await request.post('/graphql', {
    data: {
      query: `
        query GetProduct($id: ID!) {
          product(id: $id) {
            name
            price
            inStock
          }
        }
      `,
      variables: {
        id: "product-102"
      }
    }
  });

  await expect(response).toBeOK();
  const body = await response.json();
  
  // Weryfikacja struktury danych (data)
  expect(body.data.product.name).toBe('Buty sportowe');
});
```

---

## 2. Pułapka statusu 200 OK w GraphQL (The GraphQL Error Trap)

To najważniejsza koncepcja i najczęstszy błąd początkujących testerów API. 
*   W tradycyjnym REST API błąd autoryzacji lub walidacji zwraca odpowiednio statusy `401`, `400` lub `500`.
*   W GraphQL, jeśli zapytanie dotarło do serwera, serwer **zawsze zwraca status `200 OK`**, nawet jeśli zapytanie nie powiodło się (np. z powodu braku uprawnień lub niepoprawnego ID). Szczegóły błędu są umieszczane w specjalnej tablicy `errors` wewnątrz zwracanego obiektu JSON.

Dlatego asercja `expect(response).toBeOK()` jest w GraphQL niewystarczająca! **Zawsze musisz jawnie zweryfikować brak błędów wewnątrz payloadu:**

```typescript
test('bezpieczne wywołanie mutacji tworzenia zamówienia', async ({ request }) => {
  const response = await request.post('/graphql', {
    data: {
      query: `
        mutation CreateOrder($productId: ID!, $qty: Int!) {
          createOrder(productId: $productId, quantity: $qty) {
            orderId
            status
          }
        }
      `,
      variables: { productId: "99", qty: 2 }
    }
  });

  await expect(response).toBeOK();
  const body = await response.json();

  // KRYTYCZNA ASERCJA: Upewnij się, że tablica errors nie istnieje (brak błędów GraphQL)
  expect(body.errors).toBeUndefined();
  
  expect(body.data.createOrder.status).toBe('success');
});
```

---

## 3. Testowanie scenariuszy negatywnych (GraphQL Errors Validation)

W scenariuszach negatywnych (np. próba pobrania produktu przez nieuprawnionego użytkownika) celowo weryfikujemy obecność i poprawność komunikatów błędów w strukturze `errors`:

```typescript
test('walidacja braku uprawnień w GraphQL', async ({ request }) => {
  const response = await request.post('/graphql', {
    data: {
      query: `query { secretSystemStats { cpuUsage } }`
    }
  });

  const body = await response.json();
  
  // Oczekujemy tablicy errors o długości minimum 1
  expect(body.errors).toBeDefined();
  expect(body.errors[0].message).toContain('Unauthorized access');
});
```

---

## 4. Checklista Testowania GraphQL
- [ ] Czy wysyłasz wszystkie zapytania i mutacje jako żądania typu `POST` do wspólnego punktu końcowego (najczęściej `/graphql`)?
- [ ] Czy poprawnie oddzielasz strukturę `query` od dynamicznych parametrów wejściowych w obiekcie `variables`?
- [ ] Czy w każdym teście ścieżki pozytywnej (happy path) sprawdzasz, czy tablica `errors` w zwracanym JSON jest niezdefiniowana (`toBeUndefined()`)?
- [ ] Czy w testach negatywnych weryfikujesz strukturę i teksty komunikatów wewnątrz tablicy `errors[x].message`?