# Relacje, Ograniczenia i Indeksy — Architektura Integralności Danych

> **Perspektywa Full Stack Testera**
> Jako Full Stack Tester patrzysz na system przez pryzmat danych. Interfejs użytkownika i odpowiedzi API pokazują objawy, ale baza danych przechowuje prawdę o stanie procesu biznesowego, relacjach między encjami, atomowości transakcji i potencjalnych niespójnościach. Umiejętność rozumienia schematu bazy — kluczy głównych, obcych, ograniczeń i indeksów — pozwala projektować testy, które weryfikują nie tylko to, co użytkownik widzi, ale także to, co system faktycznie przechowuje i jak chroni swoje wewnętrzne niezmienniki (invariants). W tej lekcji zdobędziesz wiedzę, która pozwoli Ci projektować testy kontrolujące integralność danych na poziomie architektonicznym, a nie tylko funkcjonalnym.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Rozumieć** rolę ograniczeń (constraints) jako linii obrony integralności danych
- **Projektować** zapytania testowe weryfikujące poprawność kluczy głównych i obcych
- **Testować** ograniczenia `UNIQUE`, `NOT NULL`, `CHECK` w scenariuszach negatywnych
- **Analizować** wpływ indeksów na wydajność zapytań i konsekwencje ich braku
- **Identyfikować** niespójności w danych wynikające z brakujących ograniczeń
- **Planować** testy integralności w kontekście scenariuszy biznesowych (faktury, zamówienia, płatności)

---

## Wprowadzenie — dlaczego integralność danych ma znaczenie w testowaniu

Integralność danych oznacza, że baza danych nie pozwala na zapisanie stanu sprzecznego z regułami zdefiniowanymi w schemacie systemu. Aplikacja frontendowa powinna walidować dane wejściowe, ale baza danych jest ostatnią, krytyczną linią obrony. Gdy ta linia zawodzi, konsekwencje mogą być poważne:

- **Niespójność referencyjna** — zamówienie bez klienta, pozycja zamówienia bez zamówienia, płatność bez użytkownika
- **Duplikaty biznesowe** — dwie faktury o tym samym numerze, dwóch użytkowników z tym samym adresem email
- **Nieprawidłowe wartości** — ujemna ilość produktu w magazynie, data urodzenia z przyszłości, cena zerowa tam, gdzie powinna być większa od zera
- **Problemy z raportowaniem** — błędne sumy w fakturach, niepoprawne statystyki sprzedaży, raporty księgowe niezgodne ze stanem faktycznym

Jako tester masz obowiązek weryfikować, czy ograniczenia bazy danych działają prawidłowo i czy aplikacja nie jest w stanie zapisać danych naruszających te ograniczenia.

---

## Sytuacja przewodnia — system zamówień i fakturowania

W tej lekcji używamy scenariusza systemu e-commerce, gdzie obowiązują następujące reguły biznesowe:

1. **Każda pozycja zamówienia musi należeć do istniejącego zamówienia** (integralność referencyjna)
2. **Numer faktury musi być unikalny** w całym systemie (brak duplikatów)
3. **Kwota płatności musi być większa od zera** (poprawność zakresu)
4. **Email użytkownika musi być obecny i unikalny** (wymagalność i unikalność)
5. **Zapytania o aktywne zamówienia muszą być szybkie** (wydajność przez indeksy)

---

## 1. Primary Key — jednoznaczna identyfikacja rekordu

### 1.1 Co to jest klucz główny?

Klucz główny (Primary Key) to kolumna lub zestaw kolumn, które jednoznacznie identyfikują każdy rekord w tabeli. Relacyjne bazy danych wymuszają unikalność i niepustość klucza głównego automatycznie.

**Typowe patterny kluczy głównych:**

```sql
-- IDENTITY (auto-inkrementacja) — najczęstszy pattern
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- UUID — lepszy dla systemów rozproszonych
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Composite key (klucz złożony) — dla tabel asocjacyjnych
CREATE TABLE order_items (
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    PRIMARY KEY (order_id, product_id)
);
```

### 1.2 Testowanie kluczy głównych

**Test 1: Weryfikacja auto-generacji ID**

```typescript
test('powinien automatycznie wygenerować ID dla nowego użytkownika', async ({ page, db }) => {
  // Utwórz użytkownika przez API
  const response = await page.request.post('/api/users', {
    data: {
      email: `test-pk-${Date.now()}@example.com`,
      fullName: 'Primary Key Test User'
    }
  });
  
  expect(response.status()).toBe(201);
  const userId = await response.json().then(r => r.id);
  
  // Weryfikacja w bazie danych
  const dbUser = await db.getOne<{ id: number; email: string }>(
    'SELECT id, email FROM users WHERE id = $1',
    [userId]
  );
  
  expect(dbUser).not.toBeNull();
  expect(typeof dbUser!.id).toBe('number');
  expect(dbUser!.id).toBeGreaterThan(0);
});
```

**Test 2: Weryfikacja braku duplikatów ID**

```typescript
test('nie powinien pozwolić na dwa rekordy z tym samym ID', async ({ db }) => {
  // Próba dwukrotnego wstawienia z tym samym ID
  const testId = 999999;
  
  // Pierwsze wstawienie
  await db.query(`
    INSERT INTO users (id, email, full_name)
    VALUES ($1, 'first@example.com', 'First User')
    ON CONFLICT DO NOTHING
  `, [testId]);
  
  // Próba drugiego wstawienia z tym samym ID
  const result = await db.query(`
    INSERT INTO users (id, email, full_name)
    VALUES ($1, 'second@example.com', 'Second User')
  `, [testId]);
  
  // Sprawdzenie czy tylko jeden rekord istnieje
  const count = await db.getValue<number>(
    'SELECT COUNT(*) FROM users WHERE id = $1',
    [testId]
  );
  
  expect(count).toBeLessThanOrEqual(1);  // Może być 0 (jeśli constraint zablokował) lub 1
});
```

---

## 2. kluczy obcych — integralność referencyjna

### 2.1 Co to jest klucz obcy?

Klucz obcy (kluczy obcych) to kolumna w tabeli, która odnosi się do klucza głównego w innej tabeli. Zapewnia, że relacja między tabelami jest spójna — nie można utworzyć rekordu odnoszącego się do nieistniejącego rekordu w tabeli nadrzędnej.

**Definicja relacji w schemacie:**

```sql
-- Tabela nadrzędna
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),  -- FK do users
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela podrzędna
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,  -- FK do orders
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2.2 Testowanie integralności referencyjnej

**Test 3: Próba utworzenia pozycji zamówienia bez zamówienia**

```typescript
test('nie powinien pozwolić na utworzenie pozycji zamówienia bez istniejącego zamówienia', async ({ db }) => {
  const nonExistentOrderId = 999999;
  const testProductId = 1;
  
  // Próba wstawienia pozycji zamówienia z nieistniejącym order_id
  const result = await db.query(`
    INSERT INTO order_items (order_id, product_id, quantity, unit_price)
    VALUES ($1, $2, 1, 99.99)
  `, [nonExistentOrderId, testProductId]);
  
  // Sprawdzenie czy żaden rekord nie został utworzony
  const count = await db.getValue<number>(`
    SELECT COUNT(*) FROM order_items 
    WHERE order_id = $1
  `, [nonExistentOrderId]);
  
  expect(count).toBe(0);
});
```

**Test 4: Kaskadowe usuwanie (ON DELETE CASCADE)**

```typescript
test('powinien usunąć pozycje zamówienia po usunięciu zamówienia', async ({ db }) => {
  // Setup: utwórz zamówienie z pozycjami
  const userId = await db.insert('users', {
    email: `test-cascade-${Date.now()}@example.com`,
    full_name: 'Cascade Test User',
    status: 'ACTIVE'
  });
  
  const orderId = await db.insert('orders', {
    user_id: userId,
    order_number: `ORD-CASCADE-${Date.now()}`,
    total_price: 199.99,
    status: 'PENDING'
  });
  
  await db.insert('order_items', {
    order_id: orderId,
    product_id: 1,
    quantity: 2,
    unit_price: 99.99
  });
  
  // Act: usuń zamówienie
  await db.delete('orders', 'id = $1', [orderId]);
  
  // Assert: pozycje zamówienia również zostały usunięte
  const orphanedItems = await db.getValue<number>(`
    SELECT COUNT(*) FROM order_items WHERE order_id = $1
  `, [orderId]);
  
  expect(orphanedItems).toBe(0);
});
```

**Test 5: Weryfikacja wartości FK przez UI**

```typescript
test('powinien wyświetlić poprawne dane zamówienia powiązane z użytkownikiem', async ({ page, db }) => {
  // Setup: utwórz użytkownika i zamówienie
  const userId = await db.insert('users', {
    email: `test-fk-${Date.now()}@example.com`,
    full_name: 'FK Test User',
    status: 'ACTIVE'
  });
  
  const orderId = await db.insert('orders', {
    user_id: userId,
    order_number: `ORD-FK-${Date.now()}`,
    total_price: 299.99,
    status: 'PENDING'
  });
  
  // Act: otwórz szczegóły zamówienia przez UI
  await page.goto(`/orders/${orderId}`);
  
  // Assert: weryfikacja danych zarówno na UI, jak i w bazie
  const orderOnPage = await page.locator('[data-testid="order-number"]').textContent();
  const orderInDb = await db.getOne<{ order_number: string; user_id: number }>(
    'SELECT order_number, user_id FROM orders WHERE id = $1',
    [orderId]
  );
  
  expect(orderOnPage).toContain(orderInDb!.order_number);
  expect(orderInDb!.user_id).toBe(userId);
});
```

---

## 3. Ograniczenia — UNIQUE, NOT NULL, CHECK

### 3.1 UNIQUE — ochrona przed duplikatami

Ograniczenie UNIQUE zapewnia, że wartość w kolumnie (lub kombinacja wartości w kolumnach) nie powtarza się w tabeli.

**Typowe zastosowania:**

```sql
-- Unikalny email użytkownika
ALTER TABLE users 
ADD CONSTRAINT uq_users_email UNIQUE (email);

-- Unikalny numer zamówienia
ALTER TABLE orders 
ADD CONSTRAINT uq_orders_order_number UNIQUE (order_number);

-- Unikalna kombinacja: użytkownik + produkt w liście życzeń
ALTER TABLE wishlists 
ADD CONSTRAINT uq_wishlist_user_product UNIQUE (user_id, product_id);
```

**Test 6: Weryfikacja unikalności numeru faktury**

```typescript
test('nie powinien pozwolić na dwa zamówienia z tym samym numerem faktury', async ({ db }) => {
  const duplicateInvoiceNumber = `INV-${Date.now()}`;
  
  // Pierwsze zamówienie z danym numerem faktury
  await db.query(`
    INSERT INTO orders (order_number, user_id, total_price, status, invoice_number)
    VALUES ($1, 1, 100.00, 'PENDING', $2)
  `, [`ORD-1-${Date.now()}`, duplicateInvoiceNumber]);
  
  // Próba drugiego zamówienia z tym samym numerem faktury
  let secondInsertSucceeded = false;
  try {
    await db.query(`
      INSERT INTO orders (order_number, user_id, total_price, status, invoice_number)
      VALUES ($1, 2, 200.00, 'PENDING', $2)
    `, [`ORD-2-${Date.now()}`, duplicateInvoiceNumber]);
    secondInsertSucceeded = true;
  } catch (error: any) {
    // Oczekiwane: błąd naruszenia ograniczenia UNIQUE
    expect(error.code).toBe('23505');  // PostgreSQL: unique_violation
  }
  
  expect(secondInsertSucceeded).toBe(false);
  
  // Weryfikacja: tylko jedno zamówienie z tym numerem faktury
  const count = await db.getValue<number>(`
    SELECT COUNT(*) FROM orders WHERE invoice_number = $1
  `, [duplicateInvoiceNumber]);
  
  expect(count).toBe(1);
});
```

### 3.2 NOT NULL — wymagalność wartości

Ograniczenie NOT NULL zapewnia, że kolumna zawsze zawiera wartość (nie może być pusta/NULL).

**Definicja:**

```sql
ALTER TABLE users 
ALTER COLUMN email SET NOT NULL;

ALTER TABLE orders 
ALTER COLUMN total_price SET NOT NULL;
```

**Test 7: Weryfikacja wymagalności email**

```typescript
test('nie powinien pozwolić na utworzenie użytkownika bez emaila', async ({ db }) => {
  let insertSucceeded = false;
  
  try {
    await db.query(`
      INSERT INTO users (email, full_name, status)
      VALUES (NULL, 'Test User', 'ACTIVE')
    `);
    insertSucceeded = true;
  } catch (error: any) {
    // Oczekiwane: błąd naruszenia ograniczenia NOT NULL
    expect(error.code).toBe('23502');  // PostgreSQL: not_null_violation
  }
  
  expect(insertSucceeded).toBe(false);
});
```

### 3.3 CHECK — walidacja zakresu wartości

Ograniczenie CHECK pozwala na zdefiniowanie warunku, który wartość musi spełniać.

**Definicje:**

```sql
-- Kwota płatności musi być większa od zera
ALTER TABLE payments 
ADD CONSTRAINT chk_payment_amount_positive CHECK (amount > 0);

-- Ilość produktów musi być dodatnia
ALTER TABLE order_items 
ADD CONSTRAINT chk_order_item_quantity_positive CHECK (quantity > 0);

-- Status zamówienia może przyjmować tylko określone wartości
ALTER TABLE orders 
ADD CONSTRAINT chk_order_status_valid 
CHECK (status IN ('PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'));

-- Email musi zawierać znak @
ALTER TABLE users 
ADD CONSTRAINT chk_user_email_format CHECK (email LIKE '%@%');
```

**Test 8: Weryfikacja ograniczenia kwoty płatności**

```typescript
test.describe('Walidacja kwoty płatności', () => {
  
  test('nie powinien pozwolić na ujemną kwotę płatności', async ({ db }) => {
    let negativeAmountInserted = false;
    
    try {
      await db.query(`
        INSERT INTO payments (order_id, amount, payment_method, status)
        VALUES (1, -50.00, 'CARD', 'PENDING')
      `);
      negativeAmountInserted = true;
    } catch (error: any) {
      expect(error.code).toBe('23514');  // PostgreSQL: check_violation
    }
    
    expect(negativeAmountInserted).toBe(false);
  });
  
  test('nie powinien pozwolić na zerową kwotę płatności', async ({ db }) => {
    let zeroAmountInserted = false;
    
    try {
      await db.query(`
        INSERT INTO payments (order_id, amount, payment_method, status)
        VALUES (1, 0.00, 'CARD', 'PENDING')
      `);
      zeroAmountInserted = true;
    } catch (error: any) {
      expect(error.code).toBe('23514');
    }
    
    expect(zeroAmountInserted).toBe(false);
  });
  
  test('powinien pozwolić na poprawną kwotę płatności', async ({ db }) => {
    const userId = await db.insert('users', {
      email: `test-check-${Date.now()}@example.com`,
      full_name: 'Check Constraint Test',
      status: 'ACTIVE'
    });
    
    const orderId = await db.insert('orders', {
      user_id: userId,
      order_number: `ORD-CHECK-${Date.now()}`,
      total_price: 150.00,
      status: 'PENDING'
    });
    
    const paymentId = await db.insert('payments', {
      order_id: orderId,
      amount: 150.00,
      payment_method: 'CARD',
      status: 'COMPLETED'
    });
    
    expect(paymentId).toBeGreaterThan(0);
    
    const payment = await db.getOne<{ amount: number }>(
      'SELECT amount FROM payments WHERE id = $1',
      [paymentId]
    );
    
    expect(payment!.amount).toBe(150.00);
  });
});
```

**Test 9: Weryfikacja dozwolonych statusów zamówienia**

```typescript
test('nie powinien pozwolić na nieprawidłowy status zamówienia', async ({ db }) => {
  const userId = await db.insert('users', {
    email: `test-status-${Date.now()}@example.com`,
    full_name: 'Status Test User',
    status: 'ACTIVE'
  });
  
  const orderId = await db.insert('orders', {
    user_id: userId,
    order_number: `ORD-STATUS-${Date.now()}`,
    total_price: 99.99,
    status: 'PENDING'
  });
  
  let invalidStatusUpdated = false;
  
  try {
    await db.query(`
      UPDATE orders SET status = 'INVALID_STATUS' WHERE id = $1
    `, [orderId]);
    invalidStatusUpdated = true;
  } catch (error: any) {
    expect(error.code).toBe('23514');  // check_violation
  }
  
  expect(invalidStatusUpdated).toBe(false);
});
```

---

## 4. Indeksy — wydajność zapytań testowych

### 4.1 Co to jest indeks?

Indeks to struktura danych, która przyspiesza operacje odczytu na określonych kolumnach. Bez indeksu baza danych musi przeskanować całą tabelę (sequential scan), aby znaleźć pasujące rekordy. Z indeksem — przeszukuje tylko strukturę indeksu, która jest znacznie mniejsza i posortowana.

**Koszty indeksów:**
- Zwiększony rozmiar bazy danych
- Wolniejsze operacje INSERT, UPDATE, DELETE (indeks musi być aktualizowany)
- Zwiększone użycie pamięci RAM

**Korzyści indeksów:**
- Znacznie szybsze zapytania SELECT
- Możliwość wymuszenia unikalności (UNIQUE INDEX zamiast UNIQUE CONSTRAINT)
- Zoptymalizowane operacje JOIN

### 4.2 Typy indeksów

```sql
-- B-tree index (domyślny w PostgreSQL) — dla wartości porównywalnych
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Composite index — dla zapytań filtrujących po wielu kolumnach
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Unique index — wymusza unikalność i przyspiesza wyszukiwanie
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Partial index — indeks tylko dla podzbioru wierszy
CREATE INDEX idx_orders_pending ON orders(created_at) 
WHERE status = 'PENDING';

-- Index na wyrażeniu (functional index)
CREATE INDEX idx_users_email_lower ON users(LOWER(email));

-- Gin index — dla wyszukiwania tekstowego (np. JSON)
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('polish', name));
```

### 4.3 Analiza wydajności zapytań

**EXPLAIN ANALYZE — kluczowe narzędzie diagnostyczne:**

```sql
-- Analiza zapytania bez indeksu
EXPLAIN ANALYZE
SELECT * FROM orders 
WHERE user_id = 123
  AND status = 'PENDING'
  AND created_at > NOW() - INTERVAL '7 days';

-- Wynik bez indeksu (przykład):
-- Seq Scan on orders  (cost=0.00..12543.00 rows=523 width=245)
--                    (actual time=0.052..234.123 rows=15 loops=1)
--   Filter: ((user_id = 123) AND (status = 'PENDING') AND ...)
-- Planning Time: 0.234 ms
-- Execution Time: 234.567 ms

-- Analiza zapytania z indeksem
CREATE INDEX idx_orders_user_status_date ON orders(user_id, status, created_at);

EXPLAIN ANALYZE
SELECT * FROM orders 
WHERE user_id = 123
  AND status = 'PENDING'
  AND created_at > NOW() - INTERVAL '7 days';

-- Wynik z indeksem (przykład):
-- Index Scan using idx_orders_user_status_date on orders  
--               (cost=0.00..45.23 rows=15 width=245)
--              (actual time=0.015..0.089 rows=15 loops=1)
--   Index Cond: ((user_id = 123) AND (status = 'PENDING') AND ...)
-- Planning Time: 0.234 ms
-- Execution Time: 0.089 ms
```

### 4.4 Testowanie wpływu indeksów na testy

**Test 10: Mierzenie czasu zapytania**

```typescript
test('zapytanie o aktywne zamówienia użytkownika powinno być szybkie', async ({ db }) => {
  const userId = 1;
  
  // Rozpocznij pomiar czasu
  const startTime = Date.now();
  
  const orders = await db.query<{
    id: number;
    order_number: string;
    status: string;
    total_price: number;
  }>(`
    SELECT id, order_number, status, total_price
    FROM orders
    WHERE user_id = $1
      AND status IN ('PENDING', 'PROCESSING', 'SHIPPED')
      AND created_at > NOW() - INTERVAL '30 days'
    ORDER BY created_at DESC
  `, [userId]);
  
  const endTime = Date.now();
  const queryDuration = endTime - startTime;
  
  console.log(`Zapytanie wykonane w ${queryDuration}ms, zwrócono ${orders.rows.length} rekordów`);
  
  // Asercja: zapytanie powinno trwać mniej niż 500ms
  expect(queryDuration).toBeLessThan(500);
});
```

**Test 11: Weryfikacja braku indeksu —模拟 scenariusz produkcyjny**

```typescript
test('brak indeksu na kolumnie status powoduje wolne zapytania', async ({ db }) => {
  // Usuń indeks jeśli istnieje
  try {
    await db.query('DROP INDEX IF EXISTS idx_orders_status');
  } catch (error) {
    console.log('Indeks nie istniał lub nie można go usunąć');
  }
  
  // ANALYZE — aktualizuj statystyki
  await db.query('ANALYZE orders');
  
  // Mierz czas zapytania bez indeksu
  const startTimeWithoutIndex = Date.now();
  
  await db.query(`
    SELECT COUNT(*) FROM orders WHERE status = 'PENDING'
  `);
  
  const timeWithoutIndex = Date.now() - startTimeWithoutIndex;
  
  // Utwórz indeks
  await db.query('CREATE INDEX idx_orders_status ON orders(status)');
  
  // Mierz czas zapytania z indeksem
  const startTimeWithIndex = Date.now();
  
  await db.query(`
    SELECT COUNT(*) FROM orders WHERE status = 'PENDING'
  `);
  
  const timeWithIndex = Date.now() - startTimeWithIndex;
  
  console.log(`Czas bez indeksu: ${timeWithoutIndex}ms, z indeksem: ${timeWithIndex}ms`);
  
  // Sprawdzenie czy utworzono indeks
  const indexExists = await db.getValue<number>(`
    SELECT COUNT(*) FROM pg_indexes 
    WHERE indexname = 'idx_orders_status'
  `);
  
  expect(indexExists).toBe(1);
  
  // Cleanup
  await db.query('DROP INDEX IF EXISTS idx_orders_status');
});
```

---

## 5. Identyfikacja problemów integralności — pułapki i scenariusze

### 5.1 Orphaned records (osierocone rekordy)

Rekordy, które odnoszą się do nieistniejących rekordów w tabeli nadrzędnej.

```sql
-- Znajdź pozycje zamówień bez zamówień
SELECT oi.* FROM order_items oi
LEFT JOIN orders o ON oi.order_id = o.id
WHERE o.id IS NULL;

-- Znajdź zamówienia bez użytkowników
SELECT o.* FROM orders o
LEFT JOIN users u ON o.user_id = u.id
WHERE u.id IS NULL;

-- Znajdź płatności bez zamówień
SELECT p.* FROM payments p
LEFT JOIN orders o ON p.order_id = o.id
WHERE o.id IS NULL;
```

**Test 12: Wykrywanie osieroconych rekordów**

```typescript
test('nie powinien istnieć żaden osierocony rekord w order_items', async ({ db }) => {
  const orphanedCount = await db.getValue<number>(`
    SELECT COUNT(*) 
    FROM order_items oi
    LEFT JOIN orders o ON oi.order_id = o.id
    WHERE o.id IS NULL
  `);
  
  expect(orphanedCount).toBe(0);
});
```

### 5.2 Violacje integralności przez UI

```typescript
test('aplikacja nie powinna pozwolić na zapisanie zamówienia bez powiązania z użytkownikiem', async ({ page }) => {
  // Próba utworzenia zamówienia z pustym user_id przez API
  const response = await page.request.post('/api/orders', {
    data: {
      userId: null,
      items: [{ productId: 1, quantity: 1 }]
    }
  });
  
  // Aplikacja powinna zwrócić błąd 400 (Bad Request) lub 422 (Unprocessable Entity)
  expect(response.status()).toBeGreaterThanOrEqual(400);
  expect(response.status()).toBeLessThan(500);
  
  const errorBody = await response.json();
  expect(errorBody.error).toContain('user');
});
```

### 5.3 Wielokrotne ograniczenia — testowanie组合

```typescript
test('faktura musi mieć unikalny numer i dodatnią kwotę', async ({ db }) => {
  const invoiceNumber = `INV-${Date.now()}`;
  const userId = await db.insert('users', {
    email: `test-multi-${Date.now()}@example.com`,
    full_name: 'Multi Constraint Test',
    status: 'ACTIVE'
  });
  
  // Test 1: Poprawna faktura
  const invoiceId = await db.insert('invoices', {
    invoice_number: invoiceNumber,
    user_id: userId,
    amount: 150.00,
    status: 'ISSUED'
  });
  
  expect(invoiceId).toBeGreaterThan(0);
  
  // Test 2: Duplikat numeru faktury
  let duplicateFailed = false;
  try {
    await db.insert('invoices', {
      invoice_number: invoiceNumber,  // Ten sam numer!
      user_id: userId + 1,
      amount: 200.00,
      status: 'ISSUED'
    });
  } catch (error: any) {
    duplicateFailed = error.code === '23505';
  }
  expect(duplicateFailed).toBe(true);
  
  // Test 3: Ujemna kwota
  let negativeAmountFailed = false;
  try {
    await db.insert('invoices', {
      invoice_number: `INV-NEW-${Date.now()}`,
      user_id: userId,
      amount: -100.00,  // Ujemna kwota!
      status: 'ISSUED'
    });
  } catch (error: any) {
    negativeAmountFailed = error.code === '23514';
  }
  expect(negativeAmountFailed).toBe(true);
});
```

---

## 6. Lista kontrolna testera integralności danych

Przed zakończeniem testów integralności danych, przejrzyj poniższą listę:

| Pytanie | Tak | Nie | Uwagi |
|---------|-----|-----|-------|
| Czy wiesz, jaki stan danych test ma potwierdzić? | ☐ | ☐ | |
| Czy zapytanie filtruje po jednoznacznym identyfikatorze (PK)? | ☐ | ☐ | |
| Czy relacje FK są testowane zarówno pozytywnie, jak i negatywnie? | ☐ | ☐ | |
| Czy ograniczenia UNIQUE są weryfikowane w scenariuszach duplikatów? | ☐ | ☐ | |
| Czy ograniczenia NOT NULL są testowane z pustymi wartościami? | ☐ | ☐ | |
| Czy ograniczenia CHECK są weryfikowane z wartościami na granicach? | ☐ | ☐ | |
| Czy brak indeksów wpływa na czas wykonania testów? | ☐ | ☐ | |
| Czy operacje współbieżne są testowane pod kątem wyścigów? | ☐ | ☐ | |
| Czy seed i cleanup są deterministyczne i idempotentne? | ☐ | ☐ | |
| Czy test nie omija logiki aplikacji bez świadomego uzasadnienia? | ☐ | ☐ | |

---

## Perspektywa Full Stack Testera

Rozumienie schematu bazy danych — kluczy głównych, obcych, ograniczeń i indeksów — to kompetencja, która wyróżnia profesjonalnego testera od amatora. Gdy znasz architekturę danych, możesz:

- **Projektować testy na poziomie invariantów** — zamiast testować tylko UI, testujesz fundamentalne reguły biznesowe zapisane w schemacie
- **Diagnozować problemy produkcyjne** — niespójności w raportach, błędy w integracjach, problemy z wydajnością
- **Weryfikować jakość implementacji** — czy deweloperzy faktycznie zdefiniowali ograniczenia, czy polegają tylko na walidacji frontendowej?
- **Komunikować się z zespołem DevOps** — rozumienie indeksów i ich wpływu na wydajność pozwala na efektywniejszą współpracę

Pamiętaj: baza danych jest ostatnią linią obrony. Jeśli ograniczenia tam działają, masz pewność, że system nie może zapisać niespójnych danych, nawet jeśli wszystkie inne warstwy zawiodą.

---

## Podsumowanie

- **Primary Key** jednoznacznie identyfikuje każdy rekord i jest wymagany do diagnostyki, cleanupu i powiązań
- **kluczy obcych** chroni integralność referencyjną — zapobiega osieroconym rekordom i zapewnia spójność relacji
- **UNIQUE** chroni przed duplikatami — numerów faktur, emaili, numerów zamówień
- **NOT NULL** wymusza obecność wartości — tam, gdzie system absolutnie potrzebuje danych
- **CHECK** waliduje zakres i format wartości — kwoty dodatnie, statusy z listy dozwolonych, format emaila
- **Indeksy** przyspieszają odczyty, ale kosztują zapis — brak indeksu może powodować timeouty i wolne testy
- **EXPLAIN ANALYZE** to kluczowe narzędzie do diagnozowania wydajności zapytań
- **Testowanie negatywne** ograniczeń jest równie ważne jak testowanie pozytywne

---

## Linki i źródła

- **[PostgreSQL Constraints Documentation](https://www.postgresql.org/docs/current/ddl-constraints.html)** — kompletna dokumentacja ograniczeń w PostgreSQL
- **[PostgreSQL Indexes Documentation](https://www.postgresql.org/docs/current/indexes.html)** — wszystko o indeksach, typy i strategie
- **[EXPLAIN ANALYZE Tutorial](https://www.postgresql.org/docs/current/using-explain.html)** — jak analizować wydajność zapytań
- **[Testing Database Constraints — Baeldung](https://www.baeldung.com/cs/testing-database-constraints)** — omówienie strategii testowania ograniczeń
- **[Database Testing Guide — DevTestClub](https://www.devtestclub.com/)** — praktyczne podejście do testowania baz danych
- **[SQL Indexes and Performance — Use The Index, Luke](https://use-the-index-luke.com/)** — doskonały kurs optymalizacji zapytań przez indeksy
- **[Data Integrity Testing Patterns — ThoughtWorks](https://www.thoughtworks.com/developer-tools)** — wzorce testowania integralności danych
---

## Indeksy a testy regresji wydajności

Indeks nie jest tylko optymalizacją. Brak indeksu może spowodować timeout testów i awarię produkcyjną. Dla krytycznych zapytań warto mieć testy lub monitoring, które wykrywają wzrost czasu wykonania.

Przykład ryzyka:

```sql
SELECT * FROM orders WHERE external_id = ?;
```

Jeśli `external_id` nie ma indeksu, mała baza testowa może działać szybko, a produkcyjna wolno. Dane testowe powinny mieć realistyczną skalę dla testów wydajnościowych.

## Ograniczenia jako oracle

Foreign keys, unique constraints i check constraints mogą być oracle jakości danych. Test może sprawdzić, że baza odrzuca niespójny stan, a aplikacja obsługuje taki błąd w kontrolowany sposób.
