# Kompletne testowanie REST API — profesjonalny przewodnik

> **Perspektywa Full Stack Testera**
> Testowanie REST API w Playwright to nie jest "dodatek" do testów UI. To pełnoprawna, niezależna warstwa testowa, która pozwala na weryfikację logiki biznesowej, kontraktów danych i integracji backendowych — z szybkością, która jest nieosiągalna dla testów interfejsu graficznego. Jako Full Stack Tester powinieneś widzieć testy API jako fundament piramidy testów: to tutaj sprawdzasz 80% przypadków brzegowych (walidacje, uprawnienia, błędy logiczne, poprawność danych), a przez UI przechodzisz tylko "szczęśliwą ścieżkę". Zrozumienie tej hierarchii pozwala budować test suite'y, które są jednocześnie szybkie, stabilne i diagnostyczne.

## Cel lekcji

Po ukończeniu tej lekcji rozumiesz rolę testów API w piramidzie testów, potrafisz używać fixture `request` do wysyłania zapytań HTTP, znasz wszystkie metody HTTP (GET, POST, PUT, PATCH, DELETE) i wiesz, kiedy ich używać, potrafisz walidować kontrakt odpowiedzi JSON z użyciem bibliotek walidacyjnych, rozumiesz strategie autoryzacji w testach API, potrafisz budować hybrydowe testy (API + UI), i wiesz, jak diagnozować błędy API na poziomie eksperckim.

---

## Architektura: Testy API w kontekście piramidy testów

### Dlaczego testy API są fundamentem

Piramida testów (opracowana przez Martina Fowlera) definiuje optymalną strukturę pokrycia testami:

```
        /\
       /  \       E2E / UI Tests (Playwright)
      /    \      ~10% — najwolniejsze, najdroższe, najstabilniejsze
     /------\     
    /        \    Integration / API Tests (Playwright request)
   /          \   ~30% — średnia szybkość, duża wartość diagnostyczna
  /------------\  
 /              \ Unit Tests (Jest, Vitest)
/                \ ~60% — najszybsze, najtańsze, izolowane
──────────────────
```

W kontekście projektu Playwright:
- **Testy UI (Playwright page)**: symulacja zachowania użytkownika, interakcje z interfejsem graficznym, weryfikacja rendering, E2E flow.
- **Testy API (Playwright request)**: weryfikacja logiki biznesowej, kontraktów, uprawnień, walidacji danych, integracji backendowych.
- **Testy jednostkowe**: weryfikacja pojedynczych funkcji/klass (poza zakresem Playwrighta).

### Co sprawdzać w testach API (a co NIE)

**Sprawdzać w API:**
- Walidacja danych wejściowych (required, format, zakres, unikalność).
- Uprawnienia i autoryzacja (403, 401 dla nieuprawnionych).
- Logika biznesowa (obliczenia, transformacje, workflow).
- Integracje między serwisami (przekazywanie danych, webhooks).
- Obsługa błędów (400, 404, 409, 500).
- Poprawność kontraktu odpowiedzi (schema, typy, wartości).
- Paginacja, filtrowanie, sortowanie.
- Rate limiting (429).

**Sprawdzać w UI (nie w API):**
- Rendering komponentów (styl, układ, responsywność).
- Interakcje użytkownika (hover, focus, drag&drop).
- Animacje i przejścia.
- Integracja UI z backendem (end-to-end flow).
- UX i dostępność.

```typescript
// ✅ Dobrze — testuj logikę w API
test('API odrzuca ujemne ceny produktów', async ({ request }) => {
  const response = await request.post('/api/products', {
    data: { name: 'Test', price: -10 },
  });
  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.message).toContain('cena musi być większa od 0');
});

// ❌ Źle — testujesz UI w API
test('formatowanie ceny w UI', async ({ request }) => {
  // Nie testuj CSS/stylów przez API!
});
```

---

## Request Fixture — podstawowe narzędzie

### Czym jest request fixture?

`request` to izolowany klient HTTP w Playwright, analogiczny do `page` dla UI. Każdy test dostaje świeżą instancję klienta, niezależną od innych testów:

```typescript
import { test, expect } from '@playwright/test';

test('pobierz listę produktów', async ({ request }) => {
  // request to izolowany klient HTTP — nie współdzieli ciasteczek z page
  const response = await request.get('/api/products');
  
  expect(response.ok()).toBeTruthy(); // Status 200-299
  
  const products = await response.json();
  expect(Array.isArray(products)).toBeTruthy();
  expect(products.length).toBeGreaterThan(0);
});
```

### Izolacja request fixture

`request` jest całkowicie odizolowany od `page` i od innych testów:

```typescript
test('test A — ustawia globalny header', async ({ request }) => {
  // Ten header NIE wpłynie na test B, ponieważ request jest izolowany
  const response = await request.get('/api/me');
  expect(response.status()).toBe(401); // Brak autoryzacji — izolowany klient
});

test('test B — inne środowisko', async ({ request }) => {
  const response = await request.get('/api/me');
  expect(response.status()).toBe(401); // Ten sam rezultat — izolacja działa
});
```

### Konfiguracja baseURL

Aby nie powtarzać domeny w każdym teście:

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    // baseURL obowiązuje dla request fixture i page.goto()
    baseURL: 'https://api.mojaaplikacja.pl',
  },
});

test('test z baseURL', async ({ request }) => {
  // Zamiast: request.get('https://api.mojaaplikacja.pl/api/products')
  // Możesz: request.get('/api/products') — automatycznie użyje baseURL
  const response = await request.get('/api/products');
  expect(response.ok()).toBeTruthy();
});
```

---

## Kompletny przewodnik po metodach HTTP

### GET — pobieranie zasobów

```typescript
test('pobierz pojedynczy produkt po ID', async ({ request }) => {
  const response = await request.get('/api/products/PROD-001');
  
  expect(response.status()).toBe(200);
  
  const product = await response.json();
  
  // Sprawdź kontrakt odpowiedzi
  expect(product).toMatchObject({
    id: 'PROD-001',
    name: expect.any(String),
    price: expect.any(Number),
    stock: expect.any(Number),
    createdAt: expect.any(String), // ISO date string
  });
  
  // Sprawdź konkretne wartości
  expect(product.name).toBe('iPhone 15 Pro');
  expect(product.price).toBeGreaterThan(0);
});

test('pobierz listę z filtrami', async ({ request }) => {
  const response = await request.get('/api/products', {
    params: {
      category: 'electronics',
      minPrice: 100,
      maxPrice: 1000,
      sort: 'price',
      order: 'asc',
      page: 1,
      limit: 10,
    },
  });
  
  expect(response.status()).toBe(200);
  const data = await response.json();
  
  expect(data.products).toBeInstanceOf(Array);
  expect(data.total).toBeGreaterThan(0);
  expect(data.page).toBe(1);
  expect(data.products.length).toBeLessThanOrEqual(10);
});

test('404 dla nieistniejącego zasobu', async ({ request }) => {
  const response = await request.get('/api/products/NONEXISTENT-ID');
  
  expect(response.status()).toBe(404);
  
  const error = await response.json();
  expect(error.message).toContain('Product not found');
  expect(error.code).toBe('PRODUCT_NOT_FOUND');
});

test('autoryzowany dostęp — nieuprawniony użytkownik', async ({ request }) => {
  // Próba dostępu do zasobu bez uprawnień
  const response = await request.get('/api/admin/users');
  
  expect(response.status()).toBe(403); // Forbidden
});
```

### POST — tworzenie zasobów

```typescript
test('stwórz nowego użytkownika z poprawnymi danymi', async ({ request }) => {
  const newUser = {
    email: `test.${Date.now()}@test.pl`,
    firstName: 'Jan',
    lastName: 'Kowalski',
    role: 'CUSTOMER',
  };
  
  const response = await request.post('/api/users', {
    data: newUser,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  expect(response.status()).toBe(201); // Created
  expect(response.headers()['location']).toMatch(/\/api\/users\/\d+/); // URL nowego zasobu
  
  const createdUser = await response.json();
  expect(createdUser.id).toBeDefined();
  expect(createdUser.email).toBe(newUser.email);
  expect(createdUser.password).toBeUndefined(); // Hasło nigdy nie wraca w odpowiedzi!
  
  // Cleanup
  await request.delete(`/api/users/${createdUser.id}`);
});

test('błąd walidacji przy tworzeniu — brak wymaganego pola', async ({ request }) => {
  const response = await request.post('/api/users', {
    data: {
      email: 'test@example.pl',
      // brak firstName i lastName — wymagane
    },
  });
  
  expect(response.status()).toBe(422); // Unprocessable Entity
  const errors = await response.json();
  expect(errors.details).toContainEqual(expect.objectContaining({ field: 'firstName' }));
  expect(errors.details).toContainEqual(expect.objectContaining({ field: 'lastName' }));
});

test('konflikt unikalności — duplikat email', async ({ request }) => {
  const email = `duplicate.${Date.now()}@test.pl`;
  
  // Pierwszy użytkownik
  const first = await request.post('/api/users', {
    data: { email, firstName: 'Jan', lastName: 'Kowalski' },
  });
  expect(first.status()).toBe(201);
  
  // Drugi użytkownik z tym samym email
  const second = await request.post('/api/users', {
    data: { email, firstName: 'Anna', lastName: 'Nowak' },
  });
  expect(second.status()).toBe(409); // Conflict
  const error = await second.json();
  expect(error.code).toBe('EMAIL_ALREADY_EXISTS');
  
  // Cleanup
  const firstUser = await first.json();
  await request.delete(`/api/users/${firstUser.id}`);
});
```

### PUT — pełna aktualizacja zasobu

```typescript
test('zaktualizuj produkt — pełna zamiana', async ({ request }) => {
  // Najpierw stwórz produkt
  const create = await request.post('/api/products', {
    data: { name: 'Stary Produkt', price: 99.99 },
  });
  const product = await create.json();
  
  // Pełna aktualizacja (PUT = zastąpienie całego zasobu)
  const update = await request.put(`/api/products/${product.id}`, {
    data: { name: 'Nowy Produkt', price: 149.99, stock: 50 },
  });
  
  expect(update.status()).toBe(200);
  const updated = await update.json();
  expect(updated.name).toBe('Nowy Produkt');
  expect(updated.price).toBe(149.99);
  expect(updated.stock).toBe(50);
  
  // Cleanup
  await request.delete(`/api/products/${product.id}`);
});
```

### PATCH — częściowa aktualizacja zasobu

```typescript
test('zaktualizuj tylko cenę produktu', async ({ request }) => {
  const create = await request.post('/api/products', {
    data: { name: 'Test Product', price: 99.99, stock: 10 },
  });
  const product = await create.json();
  
  // Częściowa aktualizacja — tylko cena
  const patch = await request.patch(`/api/products/${product.id}`, {
    data: { price: 79.99 }, // Tylko cena — reszta bez zmian
  });
  
  expect(patch.status()).toBe(200);
  const updated = await patch.json();
  expect(updated.price).toBe(79.99);
  expect(updated.name).toBe('Test Product'); // Niezmienione
  expect(updated.stock).toBe(10); // Niezmienione
  
  await request.delete(`/api/products/${product.id}`);
});
```

### DELETE — usuwanie zasobów

```typescript
test('usuń produkt — sukces', async ({ request }) => {
  // Stwórz produkt
  const create = await request.post('/api/products', {
    data: { name: 'Do usunięcia', price: 10 },
  });
  const product = await create.json();
  
  // Usuń
  const deleteResponse = await request.delete(`/api/products/${product.id}`);
  expect(deleteResponse.status()).toBe(204); // No Content — sukces bez body
  
  // Zweryfikuj usunięcie
  const getResponse = await request.get(`/api/products/${product.id}`);
  expect(getResponse.status()).toBe(404); // Potwierdzenie: zasób nie istnieje
  
  // Cleanup nie jest potrzebny — produkt został usunięty
});

test('usuń produkt — nieuprawniony użytkownik', async ({ request }) => {
  // Próba usunięcia bez autoryzacji lub z niewłaściwymi uprawnieniami
  const response = await request.delete('/api/products/SOME-ID');
  
  expect(response.status()).toBe(403);
});
```

---

## Walidacja kontraktu odpowiedzi JSON

### Dlaczego zwykłe sprawdzanie statusu to za mało

Sama weryfikacja `response.ok()` lub `status() === 200` nie wystarczy. Musisz mieć pewność, że struktura odpowiedzi jest zgodna z kontraktem:

```typescript
// ❌ Niewystarczająca walidacja
test('pobierz użytkownika', async ({ request }) => {
  const response = await request.get('/api/users/123');
  expect(response.status()).toBe(200); // Status OK
  // Ale czy odpowiedź ma poprawny kształt? Nie wiesz!
});

// ✅ Pełna walidacja kontraktu
test('pobierz użytkownika z pełną walidacją kontraktu', async ({ request }) => {
  const response = await request.get('/api/users/123');
  expect(response.status()).toBe(200);
  
  const user = await response.json();
  
  // Waliduj strukturę odpowiedzi
  expect(user).toMatchObject({
    id: expect.any(String),
    email: expect.stringMatching(/^[^\s@]+@[^\s@]+\.[^\s@]+$/), // Email format
    firstName: expect.any(String),
    lastName: expect.any(String),
    role: expect.stringMatching(/^(CUSTOMER|ADMIN|MANAGER)$/),
    createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/), // ISO date
    profile: expect.objectContaining({
      avatar: expect.stringMatching(/^https?:\/\//).orNull(),
      bio: expect.any(String),
    }),
  });
  
  // Sprawdź, że hasło nigdy nie wraca w odpowiedzi
  expect(user.password).toBeUndefined();
  expect(user.passwordHash).toBeUndefined();
});
```

### Walidacja z biblioteką Zod

`zod` to biblioteka do walidacji schematów TypeScript w runtime — idealna do walidacji kontraktów API:

```typescript
import { z } from 'zod';

// Zdefiniuj schemat odpowiedzi API
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['CUSTOMER', 'ADMIN', 'MANAGER']),
  createdAt: z.string().datetime(),
  profile: z.object({
    avatar: z.string().url().nullable(),
    bio: z.string().optional(),
  }).optional(),
});

const ProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  category: z.enum(['electronics', 'clothing', 'food', 'books']),
  tags: z.array(z.string()).optional(),
});

const PaginatedResponseSchema = z.object({
  data: z.array(ProductSchema),
  meta: z.object({
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  }),
});

// Użycie w teście
test('waliduj kontrakt odpowiedzi przez Zod', async ({ request }) => {
  const response = await request.get('/api/users/123');
  
  if (response.status() !== 200) {
    throw new Error(`API zwrócił błąd: ${response.status()} - ${await response.text()}`);
  }
  
  const user = await response.json();
  
  // Zod waliduje odpowiedź w runtime — jeśli kontrakt się nie zgadza,
  // test padnie z jasnym komunikatem o błędzie schematu
  const result = UserSchema.safeParse(user);
  
  if (!result.success) {
    // Jasny komunikat: "pole 'role' ma nieprawidłową wartość 'SUPER_ADMIN' — oczekiwano CUSTOMER|ADMIN|MANAGER"
    console.error('Błąd walidacji kontraktu:', result.error.format());
  }
  
  expect(result.success).toBeTruthy();
});
```

### Walidacja tabelaryczna — wiele asercji naraz

```typescript
test('waliduj odpowiedź z wieloma polami', async ({ request }) => {
  const response = await request.get('/api/products/PROD-001');
  const product = await response.json();
  
  // Tablica asercji — każda sprawdza jedno pole
  const assertions = [
    () => expect(product.id).toBe('PROD-001'),
    () => expect(product.name).toBeTruthy(),
    () => expect(product.name.length).toBeGreaterThan(3),
    () => expect(product.price).toBeGreaterThan(0),
    () => expect(product.price).toBeLessThan(100000),
    () => expect(product.currency).toBe('PLN'),
    () => expect(product.inStock).toBe(true),
    () => expect(Array.isArray(product.images)).toBeTruthy(),
    () => expect(product.images.length).toBeGreaterThan(0),
    () => expect(product.tags).toContain('electronics'),
  ];
  
  // Jeśli którakolwiek asercja padnie, zobaczysz dokładnie które pole
  // To lepsze niż pojedyncza asercja z wieloma sprawdzeniami naraz
  for (const assertion of assertions) {
    assertion();
  }
});
```

---

## Autoryzacja w testach API

### Strategie autoryzacji

| Strategia | Zalety | Wady | Kiedy używać |
|---|---|---|---|
| Brak autoryzacji | Prosta | Tylko publiczne endpointy | Testy public API |
| Token JWT w headerze | Pełna kontrola | Trzeba generować token | Testy autoryzowanych endpointów |
| Basic Auth | Prosta | Hasło w plain text | Dev/Staging |
| API Key | Prosta, stabilna | Wymaga konfiguracji serwera | Internal APIs |
| OAuth token | Realistyczna | Złożona konfiguracja | Third-party APIs |

### Autoryzacja przez JWT Bearer Token

```typescript
// Helper do generowania tokenów testowych
async function getAuthToken(request: APIRequestContext, email: string, password: string): Promise<string> {
  const response = await request.post('/api/auth/login', {
    data: { email, password },
  });
  
  if (!response.ok()) {
    throw new Error(`Login failed: ${response.status()}`);
  }
  
  const { token } = await response.json();
  return token;
}

// Użycie w testach
test('autoryzowany użytkownik może zobaczyć swoje zamówienia', async ({ request }) => {
  // Zaloguj się i pobierz token
  const token = await getAuthToken(request, 'jan@test.pl', 'haslo123');
  
  // Wyślij żądanie z tokenem
  const response = await request.get('/api/orders/my', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  expect(response.status()).toBe(200);
  const orders = await response.json();
  expect(Array.isArray(orders)).toBeTruthy();
});

test('nieautoryzowany dostęp do prywatnych danych', async ({ request }) => {
  // Żądanie bez tokena
  const response = await request.get('/api/orders/my');
  
  expect(response.status()).toBe(401); // Unauthorized
  const error = await response.json();
  expect(error.code).toBe('UNAUTHORIZED');
});

test('dostęp do zasobu innego użytkownika', async ({ request }) => {
  const token1 = await getAuthToken(request, 'jan@test.pl', 'haslo123');
  const token2 = await getAuthToken(request, 'anna@test.pl', 'haslo456');
  
  // Próba dostępu do zamówień użytkownika 1 przez użytkownika 2
  const orderId = 'ORD-123'; // Zamówienie użytkownika 1
  
  const response = await request.get(`/api/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token2}` },
  });
  
  expect(response.status()).toBe(403); // Forbidden — nie możesz czytać cudzych zamówień
});
```

### Globalne nagłówki autoryzacji

```typescript
// setup Auth dla wszystkich request fixture
export const testWithAuth = base.extend<{
  authenticatedRequest: APIRequestContext;
}>({
  authenticatedRequest: async ({ request }, use) => {
    // Stwórz kontekst z predefiniowanymi nagłówkami autoryzacji
    const context = await request.newContext({
      baseURL: process.env.API_BASE_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${process.env.TEST_AUTH_TOKEN}`,
        'X-Test-ID': `TEST-${Date.now()}`, // Identyfikator testu
      },
    });
    
    await use(context);
    await context.dispose();
  },
});

// Teraz każdy test może używać authenticatedRequest z predefiniowaną autoryzacją
testWithAuth('pobierz zamówienia z autoryzacją globalną', async ({ authenticatedRequest }) => {
  const response = await authenticatedRequest.get('/api/orders');
  expect(response.status()).toBe(200);
});
```

---

## Hybrydowe testowanie: API + UI razem

### Filozofia hybrydowa

Najpotężniejszy wzorzec w testowaniu komercyjnym: używaj API do przygotowania danych i UI do weryfikacji doświadczenia użytkownika.

```typescript
test('edytuj produkt — hybrydowy test', async ({ page, request }) => {
  // FAZA 1: Przygotowanie danych przez API (szybkie, deterministyczne)
  // Stwórz produkt przez API — 50ms
  const createResponse = await request.post('/api/products', {
    data: {
      name: `Hybrydowy Produkt ${Date.now()}`,
      price: 199.99,
      stock: 100,
      category: 'electronics',
    },
  });
  const product = await createResponse.json();
  
  // FAZA 2: Weryfikacja doświadczenia przez UI (wolniejsze, ale realistyczne)
  // Otwórz stronę edycji produktu — bezpośredni URL, nie trzeba przechodzić przez cały flow
  await page.goto(`/admin/products/${product.id}/edit`);
  
  // Zmień nazwę produktu przez UI
  await page.getByLabel('Nazwa produktu').clear();
  await page.getByLabel('Nazwa produktu').fill('Zaktualizowany Produkt');
  
  // Zmień cenę przez UI
  await page.getByLabel('Cena').clear();
  await page.getByLabel('Cena').fill('249.99');
  
  // Zapisz zmiany
  await page.getByRole('button', { name: 'Zapisz zmiany' }).click();
  
  // Zweryfikuj komunikat sukcesu przez UI
  await expect(page.getByText('Produkt został zaktualizowany')).toBeVisible();
  
  // FAZA 3: Weryfikacja zmian przez API (szybkie sprawdzenie backendu)
  const getResponse = await request.get(`/api/products/${product.id}`);
  const updatedProduct = await getResponse.json();
  
  expect(updatedProduct.name).toBe('Zaktualizowany Produkt');
  expect(updatedProduct.price).toBe(249.99);
  
  // Cleanup
  await request.delete(`/api/products/${product.id}`);
});
```

### Porównanie czasów: UI-only vs. Hybrydowy vs. API-only

| Scenariusz | UI-only | Hybrydowy | API-only |
|---|---|---|---|
| Załóż konto → Kup produkt → Potwierdź | ~45s (logowanie UI, nawigacja, formularz) | ~5s (API setup) + ~10s (UI weryfikacja) = **~15s** | ~3s |
| Sprawdź 10 wariantów walidacji formularza | ~60s (10 × formularz UI) | **~5s** (API POST × 10) | ~5s |
| Zweryfikuj email po rejestracji | ~120s (czekać na email, otworzyć inbox) | ~10s (API sprawdza wysłany email) | ~10s |

---

## Diagnostyka błędów API

### Techniki debugowania

```typescript
test('debugowanie błędów API', async ({ request }) => {
  const response = await request.post('/api/orders', {
    data: {
      // celowo błędne dane, aby zobaczyć komunikat błędu
      items: [], // Pusty koszyk — powinien być błąd
    },
  });
  
  console.log('=== DEBUG API ===');
  console.log('Status:', response.status());
  console.log('Headers:', JSON.stringify(response.headers(), null, 2));
  console.log('Body:', await response.text());
  
  // Jeśli status jest nieoczekiwany, zobacz szczegóły
  if (!response.ok()) {
    const errorBody = await response.json();
    console.log('Error code:', errorBody.code);
    console.log('Error details:', errorBody.details);
    console.log('Error message:', errorBody.message);
  }
  
  expect(response.status()).toBe(422);
});
```

### Sprawdzanie nagłówków jako kontrakt

```typescript
test('waliduj nagłówki odpowiedzi', async ({ request }) => {
  const response = await request.get('/api/products');
  
  expect(response.status()).toBe(200);
  
  // Content-Type
  const contentType = response.headers()['content-type'];
  expect(contentType).toContain('application/json');
  expect(contentType).toContain('charset=utf-8');
  
  // Cache headers
  expect(response.headers()['cache-control']).toBeDefined();
  
  // Custom headers (np. rate limiting)
  const rateLimitRemaining = response.headers()['x-ratelimit-remaining'];
  if (rateLimitRemaining) {
    expect(parseInt(rateLimitRemaining)).toBeGreaterThan(0);
  }
  
  // CORS headers
  expect(response.headers()['access-control-allow-origin']).toBe('*');
  
  const body = await response.json();
  expect(body).toBeInstanceOf(Array);
});
```

---

## Zaawansowane wzorce testów API

### Testowanie paginacji

```typescript
test('paginacja — weryfikuj poprawność', async ({ request }) => {
  const page1 = await request.get('/api/products', { params: { page: 1, limit: 5 } });
  expect(page1.status()).toBe(200);
  const data1 = await page1.json();
  
  const page2 = await request.get('/api/products', { params: { page: 2, limit: 5 } });
  expect(page2.status()).toBe(200);
  const data2 = await page2.json();
  
  // Elementy na stronach nie powinny się pokrywać
  const idsPage1 = data1.products.map((p: { id: string }) => p.id);
  const idsPage2 = data2.products.map((p: { id: string }) => p.id);
  
  const overlap = idsPage1.filter((id: string) => idsPage2.includes(id));
  expect(overlap.length).toBe(0); // Brak duplikatów między stronami
  
  // Całkowita liczba = suma ze wszystkich stron
  expect(data1.total).toBe(data1.meta.total);
});

test('paginacja — brak danych na następnej stronie', async ({ request }) => {
  const response = await request.get('/api/products', { params: { page: 9999, limit: 10 } });
  
  expect(response.status()).toBe(200);
  const data = await response.json();
  
  expect(data.products).toEqual([]);
  expect(data.meta.page).toBe(9999);
});
```

### Testowanie rate limiting

```typescript
test('rate limiting — 429 po przekroczeniu limitu', async ({ request }) => {
  // Wyślij nadmierną liczbę żądań
  const responses = await Promise.all(
    Array.from({ length: 100 }, () => request.get('/api/products'))
  );
  
  const rateLimitedCount = responses.filter(r => r.status() === 429).length;
  
  // Przynajmniej jedno żądanie powinno być zablokowane
  expect(rateLimitedCount).toBeGreaterThan(0);
  
  // Sprawdź nagłówek retry-after
  const rateLimitedResponse = responses.find(r => r.status() === 429);
  if (rateLimitedResponse) {
    const retryAfter = rateLimitedResponse.headers()['retry-after'];
    expect(parseInt(retryAfter ?? '0')).toBeGreaterThan(0);
  }
});
```

---

## Perspektywa Full Stack Testera — API jako źródło prawdy

Testy API w Playwright to nie jest "mniej ważna wersja testów UI". To fundamentalnie inne narzędzie, które służy innym celom:

- **Szybkość**: Testy API to milisekundy, testy UI to sekundy/minuty.
- **Precyzja**: W API sprawdzasz dokładnie to, co serwer zwraca — bez warstwy pośredniej (CSS, JS, rendering).
- **Pokrycie brzegowe**: Walidacje, uprawnienia, błędy — wszystko, co jest "zbyt nudne" do testowania przez UI.
- **Diagnostyka**: Gdy test UI padnie, testy API pozwalają szybko określić, czy problem jest w backendzie (API nie działa) czy we frontendzie (API działa, ale UI źle wyświetla).

Umiejętność pisania testów API w Playwright to kompetencja, która czyni Cię pełnoprawnym inżynierem QA — nie tylko "testerem klikającym w przeglądarce".

---

## Podsumowanie

1. **Piramida testów** — API to fundament (~30%), UI to weryfikacja (~10%).
2. **Request fixture** — izolowany klient HTTP, niezależny od page.
3. **Metody HTTP** — GET, POST, PUT, PATCH, DELETE z walidacją statusów.
4. **Kontrakty JSON** — walidacja struktury, typów i wartości odpowiedzi (Zod).
5. **Autoryzacja** — JWT Bearer Token, globalne nagłówki, storageState.
6. **Hybrydowe testowanie** — API do setupu + UI do weryfikacji doświadczenia.
7. **Diagnostyka** — logowanie błędów, walidacja nagłówków, sprawdzanie ciała odpowiedzi.

---

## Linki i źródła

- [Playwright API Testing](https://playwright.dev/docs/api-testing)
- [REST API Testing Guide — Postman](https://learning.postman.com/docs/sending-requests/requests/)
- [Zod — Schema Validation](https://zod.dev/)
- [HTTP Status Codes Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [API Design Best Practices — REST](https://restfulapi.net/)