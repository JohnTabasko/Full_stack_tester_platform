# SQL dla Testerów — Kompleksowa Weryfikacja Integralności Danych

> **Perspektywa Full Stack Testera**
> Jako Full Stack Tester nie ograniczasz się do warstwy prezentacji. Prawdziwa pewność jakości aplikacji przychodzi dopiero wtedy, gdy potwierdzisz, że dane w bazie są dokładnie takie, jakich oczekujesz po wykonaniu operacji przez użytkownika. Testowanie tylko interfejsu użytkownika to jak sprawdzanie tylko wyglądu samochodu — wygląda dobrze, ale czy silnik działa? baza danych to właśnie ten „silnik" Twojej aplikacji, a SQL to klucz, który pozwala go rozebrać, sprawdzić i złożyć z powrotem. W tej lekcji zdobędziesz praktyczne umiejętności, które pozwolą Ci weryfikować integralność danych na poziomie, który zadowoli nawet najbardziej wymagającego architekta systemu.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Rozumieć**, dlaczego weryfikacja danych w bazie jest krytycznym elementem testowania aplikacji
- **Pisać** zapytania SELECT, INSERT, UPDATE i DELETE na poziomie zaawansowanym
- **Łączyć** dane z wielu tabel przy użyciu JOIN (INNER, LEFT, RIGHT, FULL)
- **Stosować** agregacje i funkcje grupujące w celu analizy danych testowych
- **Integrować** połączenia z bazą danych w testach Playwright za pomocą fikstur
- **Zarządzać** transakcjami, aby testy były izolowane i niezawodne
- **Projektować** strategie sprzątania danych (teardown) po zakończeniu testów

---

## 1. Dlaczego SQL jest niezbędny w testowaniu oprogramowania?

Współczesne aplikacje webowe i mobilne to systemy wielowarstwowe. Użytkownik wchodzi w interakcję z warstwą prezentacji (Frontend), która komunikuje się z logiką biznesową (Backend/API), a ta z kolei operuje na danych przechowywanych w relacyjnej bazie danych. Każda z tych warstw może zawierać błędy, jednak błędy w warstwie danych są szczególnie niebezpieczne, ponieważ:

- **Są ukryte** — interfejs użytkownika może wyglądać poprawnie, podczas gdy dane w bazie są błędne
- **Są kaskadowe** — jeden błędny rekord może wpływać na setki innych poprzez relacje
- **Są trudne do odtworzenia** — bez bezpośredniego dostępu do bazy danych, odtworzenie stanu systemu wymaga żmudnej analizy logów

### 1.1 Trzy główne przypadki użycia SQL w testach

#### Weryfikacja (Assertion)

Najczęstszy scenariusz. Po wykonaniu akcji przez użytkownika (kliknięcie przycisku, wysłanie formularza, wywołanie API) sprawdzasz, czy stan bazy danych odpowiada oczekiwanemu rezultatowi.

**Przykład biznesowy:** Użytkownik składa zamówienie o wartości 250 PLN. Po kliknięciu „Złóż zamówienie" w bazie danych powinny pojawić się:
- Rekord w tabeli `orders` z `total_price = 250.00` i `status = 'PENDING'`
- Rekord w tabeli `order_items` powiązany z tym zamówieniem
- Zmniejszenie stanu magazynowego (`stock`) produktów w tabeli `products`
- Wpisanie rekordu do tabeli `payment_transactions`

Bez weryfikacji na poziomie bazy danych nie masz pewności, że wszystkie te operacje zostały wykonane atomowo.

#### Przygotowanie danych (Setup/Seed)

Często zdarza się, że test wymaga specyficznego stanu bazy danych, który jest trudny lub czasochłonny do uzyskania przez interfejs użytkownika. Zamiast przechodzić przez 15 kroków kreatora rejestracji, możesz bezpośrednio wstawić użytkownika do tabeli `users` jednym zapytaniem.

**Przykład:** Testowanie panelu administracyjnego wymaga użytkownika z rolą `ADMIN` i statusem `ACTIVE`. Zamiast przechodzić proces rejestracji i ręcznie zmieniać uprawnienia przez panel admina, wykonujesz:

```sql
INSERT INTO users (email, password_hash, role, status, created_at)
VALUES ('admin-test@example.com', '$2b$12$...', 'ADMIN', 'ACTIVE', NOW());
```

To podejście jest znacznie szybsze i bardziej niezawodne.

#### Sprawdzanie integralności referencyjnej

Nowoczesne aplikacje operują na złożonych modelach danych z dziesiątkami tabel połączonych relacjami. Usunięcie produktu z katalogu nie powinno pozostawiać „osieroconych" rekordów w tabelach opinii, koszyków, historii zamówień czy list życzeń.

**Przykład:** Przed usunięciem produktu o `id = 42` sprawdzasz:

```sql
SELECT COUNT(*) AS orphaned_reviews 
FROM reviews 
WHERE product_id = 42;

SELECT COUNT(*) AS orphaned_cart_items
FROM cart_items
WHERE product_id = 42;
```

Jeśli którekolwiek zapytanie zwraca wartość większą niż 0, masz do czynienia z naruszeniem integralności referencyjnej.

---

## 2. Podstawowe operacje CRUD — głębsze spojrzenie

CRUD to akronim od **Create, Read, Update, Delete** — cztery podstawowe operacje na danych, które stanowią fundament każdej aplikacji bazodanowej. Jako tester, musisz je opanować w stopniu umożliwiającym zarówno weryfikację istniejących danych, jak i manipulację stanem bazy podczas testów.

### 2.1 SELECT — czytanie danych

`SELECT` to najczęściej używana operacja w testowaniu. Służy do pobierania danych z bazy w celu ich weryfikacji.

**Podstawowa składnia:**
```sql
SELECT kolumna1, kolumna2, kolumna3
FROM nazwa_tabeli
WHERE warunek
ORDER BY kolumna1 ASC|DESC
LIMIT n;
```

**Przykład praktyczny — weryfikacja zamówienia:**
```sql
SELECT 
    o.id AS order_id,
    o.total_price,
    o.status,
    o.created_at,
    u.email AS customer_email,
    u.full_name AS customer_name
FROM orders o
INNER JOIN users u ON o.user_id = u.id
WHERE o.id = 12345
  AND o.status = 'COMPLETED'
  AND o.total_price > 0;
```

**Filtry zaawansowane:**
```sql
-- Wiele warunków z operatorami logicznymi
SELECT * FROM products 
WHERE category = 'Electronics' 
  AND price BETWEEN 100 AND 500
  AND stock > 0
  AND is_active = true;

-- Wzorzec tekstowy (LIKE)
SELECT * FROM users 
WHERE email LIKE '%@gmail.com'
  AND created_at > '2024-01-01';

-- Lista wartości (IN)
SELECT * FROM orders 
WHERE status IN ('PENDING', 'PROCESSING', 'SHIPPED');
```

### 2.2 INSERT — wstawianie danych

`INSERT` służy do dodawania nowych rekordów. W testowaniu używamy tego do przygotowania danych testowych.

**Podstawowa składnia:**
```sql
INSERT INTO nazwa_tabeli (kolumna1, kolumna2, kolumna3)
VALUES (wartość1, wartość2, wartość3);
```

**Przykład — tworzenie użytkownika testowego:**
```sql
INSERT INTO users (
    email, 
    password_hash, 
    full_name, 
    phone, 
    role, 
    status, 
    email_verified, 
    created_at, 
    updated_at
)
VALUES (
    'test-user-1719200000@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtY8fT8V1YqWe',  -- hasz bcrypt
    'Jan Kowalski Test',
    '+48 123 456 789',
    'USER',
    'ACTIVE',
    true,
    NOW(),
    NOW()
);
```

**Wstawianie wielu rekordów jednocześnie:**
```sql
INSERT INTO product_reviews (product_id, user_id, rating, comment, created_at)
VALUES 
    (101, 1, 5, 'Świetny produkt!', NOW()),
    (101, 2, 4, 'Dobra jakość, polecam.', NOW()),
    (101, 3, 3, 'OK, ale mogłoby być lepiej.', NOW());
```

### 2.3 UPDATE — modyfikacja danych

`UPDATE` pozwala na zmianę istniejących rekordów. Używaj tego ostrożnie — zawsze z klauzulą `WHERE`, chyba że celowo chcesz zaktualizować wszystkie rekordy.

**Składnia:**
```sql
UPDATE nazwa_tabeli
SET kolumna1 = nowa_wartość1,
    kolumna2 = nowa_wartość2
WHERE warunek;
```

**Przykład — symulacja statusu płatności:**
```sql
-- Symulacja opłacenia zamówienia
UPDATE orders
SET status = 'PAID',
    paid_at = NOW(),
    payment_method = 'CARD',
    transaction_id = 'txn_test_1719200000'
WHERE id = 12345
  AND status = 'PENDING';
```

**Aktualizacja z podzapytaniem:**
```sql
-- Zmiana statusu wszystkich zamówień starszych niż 30 dni na 'EXPIRED'
UPDATE orders
SET status = 'EXPIRED'
WHERE status = 'PENDING'
  AND created_at < NOW() - INTERVAL '30 days';
```

### 2.4 DELETE — usuwanie danych

`DELETE` służy do usuwania rekordów. Podobnie jak `UPDATE`, wymaga ostrożności z klauzulą `WHERE`.

**Składnia:**
```sql
DELETE FROM nazwa_tabeli
WHERE warunek;
```

**Przykład — czyszczenie danych testowych:**
```sql
-- Usuwanie sesji użytkownika testowego
DELETE FROM user_sessions
WHERE user_id IN (
    SELECT id FROM users 
    WHERE email LIKE 'test-%@example.com'
);

-- Usuwanie osieroconych recenzji po usunięciu produktu
DELETE FROM product_reviews
WHERE product_id NOT IN (
    SELECT id FROM products
);
```

---

## 3. Łączenie tabel — JOIN-y w praktyce testowej

Dane w rzeczywistych systemach są rozproszone w wielu tabelach powiązanych relacjami. Jedna tabela `users` rzadko kiedy wystarcza. Jako tester musisz umieć łączyć dane z różnych tabel, aby zweryfikować złożone scenariusze biznesowe.

### 3.1 INNER JOIN — tylko pasujące rekordy

Zwraca tylko te rekordy, które mają swoje odpowiedniki w obu tabelach.

```sql
SELECT 
    u.email,
    u.full_name,
    o.order_number,
    o.total_price,
    o.status AS order_status
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE u.status = 'ACTIVE'
  AND o.created_at > NOW() - INTERVAL '7 days'
ORDER BY o.created_at DESC;
```

**Zastosowanie w testach:** Weryfikacja, czy aktywny użytkownik ma zamówienia z ostatniego tygodnia.

### 3.2 LEFT JOIN — wszystkie rekordy z lewej tabeli

Zwraca wszystkie rekordy z lewej (pierwszej) tabeli, nawet jeśli nie mają odpowiedników w prawej tabeli.

```sql
SELECT 
    u.email,
    u.full_name,
    COUNT(o.id) AS total_orders,
    COALESCE(SUM(o.total_price), 0) AS total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.status = 'ACTIVE'
GROUP BY u.id, u.email, u.full_name
HAVING COUNT(o.id) > 0;
```

**Zastosowanie w testach:** Identyfikacja użytkowników, którzy nigdy nie złożyli zamówienia (potencjalni porzuceni użytkownicy).

### 3.3 RIGHT JOIN — wszystkie rekordy z prawej tabeli

Mniej popularny, ale przydatny gdy chcesz zobaczyć wszystkie rekordy z prawej tabeli.

```sql
SELECT 
    p.name AS product_name,
    p.sku,
    COUNT(oi.id) AS times_ordered
FROM order_items oi
RIGHT JOIN products p ON oi.product_id = p.id
GROUP BY p.id, p.name, p.sku;
```

### 3.4 FULL OUTER JOIN — wszystko z obu tabel

Zwraca wszystkie rekordy z obu tabel, nawet jeśli nie mają odpowiedników.

```sql
SELECT 
    u.email,
    o.order_number
FROM users u
FULL OUTER JOIN orders o ON u.id = o.user_id
WHERE u.email LIKE 'test-%@example.com'
   OR o.id IS NULL;  -- użytkownicy bez zamówień lub zamówienia bez użytkowników
```

### 3.5 Wielokrotne JOIN-y — złożone zapytania

W prawdziwych systemach często musisz połączyć więcej niż dwie tabele:

```sql
SELECT 
    u.email,
    o.order_number,
    oi.product_name,
    oi.quantity,
    oi.unit_price,
    (oi.quantity * oi.unit_price) AS line_total,
    p.category_name
FROM users u
INNER JOIN orders o ON u.id = o.user_id
INNER JOIN order_items oi ON o.id = oi.order_id
INNER JOIN products p ON oi.product_id = p.id
WHERE o.status = 'COMPLETED'
  AND o.created_at > NOW() - INTERVAL '30 days'
  AND p.category_name = 'Electronics'
ORDER BY o.created_at DESC;
```

---

## 4. Agregacje i funkcje grupujące

Agregacje pozwalają na analizę danych na poziomie grup, co jest niezbędne przy weryfikacji statystyk, raportów i metryk biznesowych.

### 4.1 Podstawowe funkcje agregujące

```sql
SELECT 
    COUNT(*) AS total_orders,
    COUNT(DISTINCT user_id) AS unique_customers,
    SUM(total_price) AS total_revenue,
    AVG(total_price) AS average_order_value,
    MIN(total_price) AS min_order,
    MAX(total_price) AS max_order
FROM orders
WHERE status IN ('COMPLETED', 'SHIPPED')
  AND created_at > NOW() - INTERVAL '90 days';
```

### 4.2 GROUP BY — grupowanie danych

```sql
-- Przychód według kategorii produktów
SELECT 
    p.category_name,
    COUNT(DISTINCT oi.order_id) AS order_count,
    SUM(oi.quantity) AS total_items_sold,
    SUM(oi.quantity * oi.unit_price) AS category_revenue
FROM order_items oi
INNER JOIN products p ON oi.product_id = p.id
INNER JOIN orders o ON oi.order_id = o.id
WHERE o.status = 'COMPLETED'
GROUP BY p.category_name
ORDER BY category_revenue DESC;
```

### 4.3 HAVING — warunki na grupach

`WHERE` filtruje przed agregacją, `HAVING` filtruje po agregacji.

```sql
-- Kategorie z przychodem powyżej 10000 PLN
SELECT 
    p.category_name,
    SUM(oi.quantity * oi.unit_price) AS revenue
FROM order_items oi
INNER JOIN products p ON oi.product_id = p.id
INNER JOIN orders o ON oi.order_id = o.id
WHERE o.status = 'COMPLETED'
GROUP BY p.category_name
HAVING SUM(oi.quantity * oi.unit_price) > 10000
ORDER BY revenue DESC;
```

---

## 5. Integracja z Playwright — fikstury bazodanowe

Skoro opanowałeś podstawy SQL, czas przenieść tę wiedzę do środowiska testowego Playwright. Kluczem jest stworzenie fikstury (fixture), która zarządza połączeniem z bazą danych przez cały cykl życia testu.

### 5.1 Instalacja klienta PostgreSQL

```bash
npm install pg --save-dev
npm install @types/pg --save-dev
```

### 5.2 Konfiguracja połączenia

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3000',
  },
});
```

```typescript
// tests/database.config.ts
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'playwright_test',
  user: process.env.DB_USER || 'test_user',
  password: process.env.DB_PASSWORD || 'test_password',
  max: 20,  // maksymalna liczba połączeń w puli
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};
```

### 5.3 Definicja fikstury bazodanowej

```typescript
// tests/fixtures/db.fixture.ts
import { test as base, Page } from '@playwright/test';
import { Client } from 'pg';
import { dbConfig } from '../database.config';

// Typ dla fikstury bazy danych
interface DBFixture {
  db: {
    query: <T = any>(sql: string, params?: any[]) => Promise<{ rows: T[]; rowCount: number }>;
    getOne: <T = any>(sql: string, params?: any[]) => Promise<T | null>;
    getValue: (sql: string, params?: any[]) => Promise<any>;
    insert: (table: string, data: Record<string, any>) => Promise<number>;
    update: (table: string, data: Record<string, any>, where: string, params?: any[]) => Promise<number>;
    delete: (table: string, where: string, params?: any[]) => Promise<number>;
  };
}

// Rozszerzenie typu test
export { DBFixture };

// Implementacja fikstury
export const test = base.extend<DBFixture>({
  db: async ({}, use) => {
    const client = new Client(dbConfig);
    
    try {
      await client.connect();
      console.log('[DB Fixture] Połączono z bazą danych PostgreSQL');
      
      // Helper do wykonywania zapytań
      const query = async <T = any>(
        sql: string, 
        params?: any[]
      ): Promise<{ rows: T[]; rowCount: number }> => {
        const result = await client.query(sql, params);
        return { rows: result.rows as T[], rowCount: result.rowCount ?? 0 };
      };
      
      // Pobierz jeden rekord
      const getOne = async <T = any>(
        sql: string, 
        params?: any[]
      ): Promise<T | null> => {
        const result = await client.query(sql, params);
        return result.rows[0] as T ?? null;
      };
      
      // Pobierz konkretną wartość (np. COUNT, SUM)
      const getValue = async (
        sql: string, 
        params?: any[]
      ): Promise<any> => {
        const result = await client.query(sql, params);
        return result.rows[0]?.[Object.keys(result.rows[0])[0]] ?? null;
      };
      
      // Helper do wstawiania
      const insert = async (
        table: string, 
        data: Record<string, any>
      ): Promise<number> => {
        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING id`;
        const result = await client.query(sql, values);
        return result.rows[0]?.id ?? -1;
      };
      
      // Helper do aktualizacji
      const update = async (
        table: string, 
        data: Record<string, any>, 
        where: string, 
        params?: any[]
      ): Promise<number> => {
        const setClause = Object.keys(data)
          .map((col, i) => `${col} = $${i + 1}`)
          .join(', ');
        const values = [...Object.values(data), ...(params ?? [])];
        const sql = `UPDATE ${table} SET ${setClause} WHERE ${where}`;
        const result = await client.query(sql, values);
        return result.rowCount ?? 0;
      };
      
      // Helper do usuwania
      const delete_ = async (
        table: string, 
        where: string, 
        params?: any[]
      ): Promise<number> => {
        const sql = `DELETE FROM ${table} WHERE ${where}`;
        const result = await client.query(sql, params ?? []);
        return result.rowCount ?? 0;
      };
      
      await use({ query, getOne, getValue, insert, update, delete: delete_ });
      
    } catch (error) {
      console.error('[DB Fixture] Błąd połączenia:', error);
      throw error;
    } finally {
      await client.end();
      console.log('[DB Fixture] Rozłączono z bazą danych');
    }
  },
});
```

### 5.4 Przykładowy test z weryfikacją bazy danych

```typescript
// tests/e2e/order-creation.spec.ts
import { test } from '../fixtures/db.fixture';

test.describe('Składanie zamówienia — weryfikacja bazy danych', () => {
  
  test.beforeEach(async ({ db }) => {
    // Przygotowanie: utwórz użytkownika testowego
    await db.query(`
      INSERT INTO users (email, password_hash, full_name, role, status, created_at)
      VALUES ($1, $2, $3, 'USER', 'ACTIVE', NOW())
      ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
    `, [
      `test-order-${Date.now()}@example.com`,
      '$2b$12$hashedpassword',
      'Test User Order'
    ]);
  });

  test('powinien utworzyć zamówienie i zweryfikować dane w bazie', async ({ page, db }) => {
    // Arrange: dane testowe
    const testEmail = `test-order-${Date.now()}@example.com`;
    const productId = 42;
    const expectedQuantity = 2;
    const expectedPrice = 99.99;

    // Act: użytkownik składa zamówienie
    await page.goto(`/products/${productId}`);
    await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
    await page.getByRole('button', { name: 'Przejdź do kasy' }).click();
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Numer karty').fill('4242424242424242');
    await page.getByLabel('Ważność').fill('12/28');
    await page.getByLabel('CVV').fill('123');
    await page.getByRole('button', { name: 'Złóż zamówienie' }).click();
    
    // Poczekaj na przekierowanie do strony potwierdzenia
    await page.waitForURL(/\/order-confirmation\/\d+/);

    // Assert: weryfikacja danych w bazie
    const orderRecord = await db.getOne<{
      id: number;
      user_id: number;
      total_price: number;
      status: string;
    }>(`
      SELECT id, user_id, total_price, status, created_at
      FROM orders
      WHERE user_id = (
        SELECT id FROM users WHERE email = $1
      )
      ORDER BY created_at DESC
      LIMIT 1
    `, [testEmail]);

    expect(orderRecord).not.toBeNull();
    expect(orderRecord!.status).toBe('PENDING');
    expect(orderRecord!.total_price).toBeGreaterThan(0);

    // Weryfikacja pozycji zamówienia
    const orderItems = await db.query<{
      product_id: number;
      quantity: number;
      unit_price: number;
    }>(`
      SELECT product_id, quantity, unit_price
      FROM order_items
      WHERE order_id = $1
    `, [orderRecord!.id]);

    expect(orderItems.rows.length).toBeGreaterThan(0);
    
    const item = orderItems.rows[0];
    expect(item.quantity).toBe(expectedQuantity);
    expect(item.unit_price).toBe(expectedPrice);
  });

  test('powinien zwiększyć licznik zamówień użytkownika', async ({ page, db }) => {
    const testEmail = `test-order-${Date.now()}@example.com`;
    
    // Pobierz stan początkowy
    const initialOrderCount = await db.getValue<number>(`
      SELECT COUNT(*) FROM orders 
      WHERE user_id = (SELECT id FROM users WHERE email = $1)
    `, [testEmail]);

    // Act: złóż zamówienie (jakoś)
    // ... (kod testu)

    // Assert: liczba zamówień wzrosła o 1
    const finalOrderCount = await db.getValue<number>(`
      SELECT COUNT(*) FROM orders 
      WHERE user_id = (SELECT id FROM users WHERE email = $1)
    `, [testEmail]);

    expect(finalOrderCount).toBe(initialOrderCount + 1);
  });
});
```

---

## 6. Transakcje — izolacja i niezawodność testów

Transakcje to fundament integralności danych w bazach relacyjnych. Pozwalają na wykonanie wielu operacji jako jednej atomowej jednostki — albo wszystkie się powiodą, albo żadna.

### 6.1 Dlaczego transakcje są ważne w testach?

Wyobraź sobie scenariusz:
1. Test tworzy użytkownika
2. Test składa zamówienie
3. Test kończy się niepowodzeniem na asercji
4. **Problem:** Użytkownik i zamówienie zostały zapisane w bazie i pozostają tam po testach

Transakcje rozwiązują ten problem:

```typescript
// Fikstura z obsługą transakcji
export const testWithTransaction = base.extend<DBFixture>({
  db: async ({}, use) => {
    const client = new Client(dbConfig);
    await client.connect();
    
    // Rozpocznij transakcję
    await client.query('BEGIN');
    
    const query = async <T = any>(sql: string, params?: any[]) => {
      return client.query(sql, params);
    };
    
    await use({ query, getOne, getValue, insert, update, delete });
    
    // Wycofaj wszystkie zmiany po teście
    await client.query('ROLLBACK');
    await client.end();
  },
});
```

### 6.2 SAVEPOINT — częściowe wycofanie

Dla bardziej zaawansowanych scenariuszy możesz użyć punktów zapisu (SAVEPOINT):

```typescript
await client.query('BEGIN');

// Tworzenie użytkownika
await client.query(`
  INSERT INTO users (email, full_name, status) 
  VALUES ($1, 'Test User', 'ACTIVE')
`, [`test-${Date.now()}@example.com`]);

// Punkt zapisu
await client.query('SAVEPOINT before_order');

// Próba utworzenia zamówienia (która może się nie powieść)
try {
  await client.query(`
    INSERT INTO orders (user_id, total_price, status)
    VALUES ((SELECT id FROM users WHERE email LIKE 'test-%@example.com'), -100, 'PENDING')
  `);
  // Jeśli się powiedzie, kontynuuj
  await client.query('COMMIT');
} catch (error) {
  // Wycofaj tylko do punktu zapisu
  await client.query('ROLLBACK TO SAVEPOINT before_order');
  console.log('Zamówienie nie powiodło się, użytkownik nadal istnieje');
}

// Zakończ transakcję
await client.query('COMMIT');
await client.end();
```

---

## 7. Strategie sprzątania danych (Teardown)

Dla każdego testu, który modyfikuje bazę danych, musisz zaplanować strategię czyszczenia. Istnieje kilka podejść, z których każde ma swoje zalety i wady.

### 7.1 Podejście 1: Czyszczenie po teście (After Each)

```typescript
test.afterEach(async ({ db }) => {
  // Usuń użytkowników testowych (po prefiksie)
  await db.delete('users', 'email LIKE $1', [`test-%@example.com`]);
});
```

### 7.2 Podejście 2: Dedykowana baza danych „sandbox"

Najlepsze podejście dla zespołów z zasobami DevOps:

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    baseURL: 'http://localhost:3000',
    databaseUrl: process.env.DATABASE_URL,
  },
});

// Skrypt resetujący bazę
// scripts/reset-test-db.sh
#!/bin/bash
echo "Resetowanie bazy testowej..."
psql $TEST_DATABASE_URL -c "DROP SCHEMA public CASCADE;"
psql $TEST_DATABASE_URL -c "CREATE SCHEMA public;"
psql $TEST_DATABASE_URL -f migrations/latest.sql
echo "Baza testowa zresetowana."
```

### 7.3 Podejście 3: Automatyczne czyszczenie przez fiksturę

```typescript
// tests/fixtures/db-cleanup.fixture.ts
export const testWithCleanup = base.extend<DBFixture & { cleanup: () => Promise<void> }>({
  db: async ({}, use) => {
    const client = new Client(dbConfig);
    await client.connect();
    
    // Lista utworzonych ID do usunięcia
    const createdRecords: { table: string; id: number }[] = [];
    
    const insert = async (table: string, data: Record<string, any>): Promise<number> => {
      // Oryginalny insert
      const columns = Object.keys(data);
      const values = Object.values(data);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING id`;
      const result = await client.query(sql, values);
      const id = result.rows[0]?.id;
      if (id) createdRecords.push({ table, id });
      return id ?? -1;
    };
    
    // Helper do czyszczenia
    const cleanup = async () => {
      for (const { table, id } of createdRecords.reverse()) {
        await client.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
      }
      createdRecords = [];
    };
    
    await use({ query, getOne, getValue, insert, update, delete, cleanup });
    
    // Wyczyść po teście
    await cleanup();
    await client.end();
  },
});
```

---

## 8. Najczęstsze pułapki i jak ich unikać

### 8.1 Zapomniana klauzula WHERE

```sql
-- 💀 NIEBEZPIECZNE: usunie wszystko!
DELETE FROM orders;

-- ✅ BEZPIECZNE: konkretny rekord
DELETE FROM orders WHERE id = 12345;
```

### 8.2 Injection SQL

Nigdy nie wstawiaj danych użytkownika bezpośrednio w zapytanie:

```typescript
// 💀 NIEBEZPIECZNE: podatność na SQL injection
const email = req.body.email;
await client.query(`SELECT * FROM users WHERE email = '${email}'`);

// ✅ BEZPIECZNE: parametryzowane zapytanie
await client.query(`SELECT * FROM users WHERE email = $1`, [email]);
```

### 8.3 Wyścigi (Race conditions)

Gdy wiele testów działa równolegle, mogą próbować modyfikować te same dane:

```typescript
// 💀 Kolizja: dwa testy tworzą użytkownika z tym samym emailem
await client.query(`INSERT INTO users (email) VALUES ('test@example.com')`);

// ✅ Unikalny email dla każdego testu
const uniqueEmail = `test-${Date.now()}-${process.pid}@example.com`;
await client.query(`INSERT INTO users (email) VALUES ($1)`, [uniqueEmail]);
```

### 8.4 Niespójne typy danych

Upewnij się, że typy w kodzie i w bazie danych są zgodne:

```typescript
// JavaScript Date → PostgreSQL TIMESTAMP
const now = new Date();
await client.query(
  `INSERT INTO orders (created_at) VALUES ($1)`, 
  [now.toISOString()]  // lub: [now]
);
```

---

## 9. Podsumowanie narzędzi i bibliotek

### Obsługiwane bazy danych

| Baza | Biblioteka | Instalacja |
|------|------------|------------|
| PostgreSQL | `pg` | `npm install pg` |
| MySQL | `mysql2` | `npm install mysql2` |
| SQLite | `better-sqlite3` | `npm install better-sqlite3` |
| MSSQL | `mssql` | `npm install mssql` |

### Narzędzia CLI

```bash
# PostgreSQL
psql -h localhost -U test_user -d playwright_test

# MySQL
mysql -h localhost -u test_user -p playwright_test

# Export danych
pg_dump -h localhost -U test_user -d playwright_test > backup.sql
```

---

## Perspektywa Full Stack Testera

SQL to nie tylko umiejętność deweloperów backendowych — to kluczowa kompetencja testera, który chce pracować na poziomie profesjonalnym. Gdy potrafisz bezpośrednio weryfikować stan bazy danych, stajesz się niezastąpionym członkiem zespołu. Możesz:
- Weryfikować złożone scenariusze biznesowe, które są niemożliwe do przetestowania tylko przez UI
- Szybko przygotowywać dane testowe bez żmudnego klikania przez aplikację
- Diagnozować problemy produkcyjne na poziomie danych, nie tylko logów
- Budować zaawansowane testy integracyjne, które sprawdzają całą ścieżkę — od akcji użytkownika, przez API, aż po stan końcowy w bazie

Pamiętaj: baza danych nie kłamie. Jeśli dane są poprawne w bazie, masz pewność, że aplikacja działa prawidłowo na najgłębszym poziomie architektury.

---

## Podsumowanie

- **SQL jest niezbędny** w testowaniu — pozwala na weryfikację, setup i sprawdzanie integralności
- **CRUD (Create, Read, Update, Delete)** to podstawowe operacje, które musisz opanować
- **JOIN-y** umożliwiają łączenie danych z wielu tabel w złożonych zapytaniach
- **Agregacje** (COUNT, SUM, AVG) pozwalają na analizę danych na poziomie grup
- **Fikstury bazodanowe** w Playwright integrują SQL z testami E2E
- **Transakcje** zapewniają izolację i możliwość wycofania zmian
- **Strategie sprzątania** (teardown) chronią bazę przed „zanieczyszczeniem"
- **Parametryzowane zapytania** chronią przed SQL injection

---

## Linki i źródła

- **[SQL Zoo — Interaktywny kurs SQL](https://sqlzoo.net/)** — interaktywne ćwiczenia z SQL krok po kroku
- **[PostgreSQL Node.js Client (pg)](https://node-postgres.com/)** — oficjalna dokumentacja biblioteki pg dla Node.js
- **[PostgreSQL Documentation](https://www.postgresql.org/docs/)** — kompletna dokumentacja PostgreSQL
- **[W3Schools SQL Tutorial](https://www.w3schools.com/sql/)** — podstawowy kurs SQL z przykładami
- **[Learn SQL with Mode](https://mode.com/sql-tutorial/)** — zaawansowany kurs SQL, w tym JOIN-y i agregacje
- **[SQL Injection Prevention Cheat Sheet (OWASP)](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)** — jak chronić zapytania przed injection
- **[Practice SQL on LeetCode](https://leetcode.com/problemset/database/)** — zadania algorytmiczne z SQL
---

## Różnice dialektów SQL

SQL nie jest identyczny w każdej bazie. PostgreSQL, MySQL i SQLite różnią się typami, funkcjami dat, składnią upsert, zachowaniem transakcji i ograniczeniami.

Przykłady różnic:

- PostgreSQL: `SERIAL`, `JSONB`, `RETURNING`, `ILIKE`;
- MySQL: `AUTO_INCREMENT`, różne tryby SQL mode;
- SQLite: luźniejsze typowanie i ograniczenia współbieżności.

Tester powinien wiedzieć, na jakiej bazie działa produkcja i testy. Test przechodzący na SQLite in-memory może nie wykryć problemu PostgreSQL.

## EXPLAIN jako narzędzie testera

Dla wolnych zapytań użyj:

```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 'u1';
```

Nie musisz być DBA, ale powinieneś umieć zauważyć pełny skan dużej tabeli, brak indeksu lub kosztowny join.
