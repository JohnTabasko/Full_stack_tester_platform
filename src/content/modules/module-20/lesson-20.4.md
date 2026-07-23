# Migracje, Seedowanie i Sprzątanie Danych — Higiena Środowiska Testowego

> **Perspektywa Full Stack Testera**
> Migracje baz danych to jeden z najbardziej ryzykownych elementów wdrożeń oprogramowania. Zmiana schematu bazy wpływa bezpośrednio na integralność produkcyjnych danych, a błąd w migracji może kosztować godziny przestoju i tysiące przywróconych rekordów. Jako Full Stack Tester masz obowiązek nie tylko testować aplikację, ale także weryfikować migracje, zarządzać danymi testowymi i utrzymywać środowisko w czystości. W tej lekcji zdobędziesz umiejętności projektowania strategii migracji, seedowania i sprzątania, które zapewnią, że Twoje testy będą działać na przewidywalnym, spójnym stanie bazy danych — niezależnie od tego, ile razy zostaną uruchomione.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Projektować** i weryfikować migracje schematu bazy danych
- **Tworzyć** deterministyczne zestawy danych seedowych
- **Budować** fikstury bazodanowe z właściwym cyklem życia
- **Implementować** strategie sprzątania danych po testach
- **Testować** migracje w warunkach zbliżonych do produkcyjnych
- **Zarządzać** wersjami schematu bazy danych

---

## Wprowadzenie — dlaczego higiena danych ma znaczenie

Wyobraź sobie następujący scenariusz:

1. Test A tworzy użytkownika `test@example.com`, test kończy się, ale użytkownik zostaje w bazie
2. Test B próbuje utworzyć użytkownika `test@example.com`, otrzymuje błąd UNIQUE constraint
3. Test C zmienia schemat tabeli `users`, ale nie aktualizuje fikstury
4. Test D uruchamia się z poprzednią wersją schematu, fikstura nie działa

Taki stan rzeczy prowadzi do niestabilnych testów, fałszywych negatywów i utraty zaufania do zestawu testowego. Profesjonalne zarządzanie danymi testowymi to fundament niezawodnej automatyzacji.

---

## Sytuacja przewodnia — migracja pola statusu faktury

Zespół programistyczny dodaje pole `status` do tabeli `invoices`. Migracja musi:
1. Dodać kolumnę z wartością domyślną
2. Zaktualizować istniejące rekordy na podstawie `paid_at`
3. Utworzyć indeks dla nowej kolumny
4. Zweryfikować, że migracja działa na danych produkcyjnych

Jako tester musisz napisać testy, które weryfikują poprawność tej migracji.

---

## 1. Migracja jako kod produkcyjny

### 1.1 Filozofia „migracja jako kod"

Migracja bazy danych to ostatnia rzecz, którą można „cofnąć" po awarii. Dlatego:

- **Każda migracja musi być wersjonowana** — masz pełną historię zmian
- **Migracje muszą być idempotentne** — można je uruchomić wielokrotnie bez efektu ubocznego
- **Migracje muszą być odwracalne** — jeśli to możliwe, musisz móc wycofać zmianę
- **Migracje muszą być testowane** — nie tylko na pustej bazie, ale na danych zbliżonych do produkcyjnych

### 1.2 Struktura migracji

```typescript
// migrations/002_add_invoice_status.ts
import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Krok 1: Dodaj kolumnę z wartością domyślną
  pgm.addColumn('invoices', {
    status: {
      type: 'VARCHAR(50)',
      notNull: true,
      default: 'ISSUED'
    }
  });

  // Krok 2: Aktualizuj istniejące rekordy
  pgm.sql(`
    UPDATE invoices
    SET status = 'PAID'
    WHERE paid_at IS NOT NULL
      AND payment_status = 'COMPLETED'
  `);

  pgm.sql(`
    UPDATE invoices
    SET status = 'CANCELLED'
    WHERE cancelled_at IS NOT NULL
  `);

  // Krok 3: Dodaj indeks
  pgm.addIndex('invoices', 'status', { name: 'idx_invoices_status' });

  // Krok 4: Dodaj constraint sprawdzający wartość
  pgm.addConstraint('invoices', 'chk_invoice_status_valid', {
    check: "status IN ('ISSUED', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED')"
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropConstraint('invoices', 'chk_invoice_status_valid');
  pgm.dropIndex('invoices', 'idx_invoices_status');
  pgm.dropColumn('invoices', 'status');
}
```

### 1.3 Testowanie migracji

```typescript
// tests/migrations/002_add_invoice_status.spec.ts
import { describe, test, expect, beforeAll, afterAll } from '@playwright/test';
import { Client } from 'pg';
import { dbConfig } from '../../database.config';

describe('Migracja: dodanie pola status do faktur', () => {
  
  let client: Client;
  
  beforeAll(async () => {
    client = new Client(dbConfig);
    await client.connect();
  });
  
  afterAll(async () => {
    await client.end();
  });
  
  test('kolumna status istnieje po migracji', async () => {
    const columnExists = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'invoices' AND column_name = 'status'
    `);
    
    expect(columnExists.rows.length).toBe(1);
    expect(columnExists.rows[0].data_type).toBe('character varying');
    expect(columnExists.rows[0].is_nullable).toBe('NO');
  });
  
  test('nowe faktury mają domyślny status ISSUED', async () => {
    // Utwórz fakturę bez podania statusu
    const result = await client.query(`
      INSERT INTO invoices (invoice_number, user_id, amount, created_at)
      VALUES ($1, 1, 100.00, NOW())
      RETURNING status
    `, [`TEST-STATUS-${Date.now()}`]);
    
    expect(result.rows[0].status).toBe('ISSUED');
  });
  
  test('istniejące faktury opłacone mają status PAID', async () => {
    // Utwórz fakturę z paid_at
    const result = await client.query(`
      INSERT INTO invoices (invoice_number, user_id, amount, paid_at, payment_status, created_at)
      VALUES ($1, 1, 200.00, NOW(), 'COMPLETED', NOW())
      RETURNING status
    `, [`TEST-PAID-${Date.now()}`]);
    
    expect(result.rows[0].status).toBe('PAID');
  });
  
  test('istniejące faktury anulowane mają status CANCELLED', async () => {
    const result = await client.query(`
      INSERT INTO invoices (invoice_number, user_id, amount, cancelled_at, created_at)
      VALUES ($1, 1, 150.00, NOW(), NOW())
      RETURNING status
    `, [`TEST-CANCEL-${Date.now()}`]);
    
    expect(result.rows[0].status).toBe('CANCELLED');
  });
  
  test('indeks na kolumnie status istnieje', async () => {
    const indexExists = await client.query(`
      SELECT indexname FROM pg_indexes
      WHERE tablename = 'invoices' AND indexname = 'idx_invoices_status'
    `);
    
    expect(indexExists.rows.length).toBe(1);
  });
  
  test('constraint ogranicza dozwolone wartości', async () => {
    let invalidInsertFailed = false;
    
    try {
      await client.query(`
        INSERT INTO invoices (invoice_number, user_id, amount, status)
        VALUES ($1, 1, 50.00, 'INVALID_STATUS')
      `, [`TEST-INVALID-${Date.now()}`]);
    } catch (error: any) {
      if (error.code === '23514') {  // check_violation
        invalidInsertFailed = true;
      }
    }
    
    expect(invalidInsertFailed).toBe(true);
  });
});
```

### 1.4 Testowanie migracji na dużych wolumenach

```typescript
test('migracja działa na tabeli z milionem rekordów', async () => {
  // Setup: utwórz 1 000 000 rekordów (symulacja)
  const startTime = Date.now();
  
  // Wstaw dużą ilość danych
  await client.query(`
    INSERT INTO invoices (invoice_number, user_id, amount, paid_at, payment_status)
    SELECT 
      'BULK-' || generate_series,
      (random() * 100)::int,
      (random() * 1000)::numeric(10,2),
      CASE WHEN random() > 0.5 THEN NOW() ELSE NULL END,
      CASE WHEN random() > 0.5 THEN 'COMPLETED' ELSE 'PENDING' END
    FROM generate_series(1, 100000)
  `);
  
  const insertDuration = Date.now() - startTime;
  console.log(`Wstawiono 100 000 faktur w ${insertDuration}ms`);
  
  // Wykonaj migrację (dodanie kolumny)
  const migrationStart = Date.now();
  
  await client.query(`
    ALTER TABLE invoices ADD COLUMN status VARCHAR(50) DEFAULT 'ISSUED'
  `);
  
  await client.query(`
    UPDATE invoices SET status = 'PAID' 
    WHERE paid_at IS NOT NULL AND payment_status = 'COMPLETED'
  `);
  
  const migrationDuration = Date.now() - migrationStart;
  console.log(`Migracja wykonana w ${migrationDuration}ms`);
  
  // Weryfikacja
  const stats = await client.query(`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'ISSUED') as issued,
      COUNT(*) FILTER (WHERE status = 'PAID') as paid
    FROM invoices
  `);
  
  expect(parseInt(stats.rows[0].total)).toBeGreaterThan(0);
  console.log(`Statusy: ${JSON.stringify(stats.rows[0])}`);
  
  // Cleanup
  await client.query(`DELETE FROM invoices WHERE invoice_number LIKE 'BULK-%'`);
});
```

---

## 2. Seed danych — deterministyczne dane referencyjne

### 2.1 Co to jest seed?

Seed to zestaw danych referencyjnych, które zawsze istnieją w bazie niezależnie od testów:
- Role użytkowników (`ADMIN`, `USER`, `MODERATOR`)
- Statusy zamówień (`PENDING`, `PROCESSING`, `SHIPPED`, `COMPLETED`)
- Waluty (`PLN`, `EUR`, `USD`)
- Kategorie produktów
- Konfiguracje systemowe

**Zasada:** Seed ≠ dane scenariuszowe. Seed tworzy „szkielet" referencyjny. Scenariuszowe dane tworzysz w ramach poszczególnych testów.

### 2.2 Implementacja seedera

```typescript
// tests/database/seed.ts
import { Client } from 'pg';
import { dbConfig } from '../database.config';

interface SeedRecord {
  table: string;
  records: Record<string, any>[];
}

const seedData: SeedRecord[] = [
  {
    table: 'user_roles',
    records: [
      { id: 1, name: 'ADMIN', permissions: ['read', 'write', 'delete', 'admin'] },
      { id: 2, name: 'MODERATOR', permissions: ['read', 'write'] },
      { id: 3, name: 'USER', permissions: ['read'] },
      { id: 4, name: 'GUEST', permissions: [] },
    ],
  },
  {
    table: 'order_statuses',
    records: [
      { id: 1, name: 'PENDING', display_name: 'Oczekuje na płatność', is_final: false },
      { id: 2, name: 'PROCESSING', display_name: 'W trakcie realizacji', is_final: false },
      { id: 3, name: 'SHIPPED', display_name: 'Wysłano', is_final: false },
      { id: 4, name: 'COMPLETED', display_name: 'Zakończone', is_final: true },
      { id: 5, name: 'CANCELLED', display_name: 'Anulowane', is_final: true },
      { id: 6, name: 'REFUNDED', display_name: 'Zwrócone', is_final: true },
    ],
  },
  {
    table: 'currencies',
    records: [
      { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', decimal_places: 2 },
      { code: 'EUR', name: 'Euro', symbol: '€', decimal_places: 2 },
      { code: 'USD', name: 'US Dollar', symbol: '$', decimal_places: 2 },
      { code: 'GBP', name: 'British Pound', symbol: '£', decimal_places: 2 },
    ],
  },
  {
    table: 'product_categories',
    records: [
      { id: 1, name: 'Electronics', slug: 'electronics', parent_id: null },
      { id: 2, name: 'Clothing', slug: 'clothing', parent_id: null },
      { id: 3, name: 'Books', slug: 'books', parent_id: null },
      { id: 4, name: 'Smartphones', slug: 'smartphones', parent_id: 1 },
      { id: 5, name: 'Laptops', slug: 'laptops', parent_id: 1 },
      { id: 6, name: 'Men', slug: 'men', parent_id: 2 },
      { id: 7, name: 'Women', slug: 'women', parent_id: 2 },
    ],
  },
];

export async function seedDatabase(): Promise<void> {
  const client = new Client(dbConfig);
  await client.connect();
  
  console.log('Rozpoczęcie seedowania bazy danych...');
  
  for (const seed of seedData) {
    for (const record of seed.records) {
      const columns = Object.keys(record);
      const values = Object.values(record);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      
      await client.query(`
        INSERT INTO ${seed.table} (${columns.join(', ')})
        VALUES (${placeholders})
        ON CONFLICT DO NOTHING
      `, values);
    }
    
    console.log(`  ✓ Wstawiono ${seed.records.length} rekordów do ${seed.table}`);
  }
  
  await client.end();
  console.log('Seedowanie zakończone.');
}

export async function clearDatabase(): Promise<void> {
  const client = new Client(dbConfig);
  await client.connect();
  
  console.log('Czyszczenie bazy danych...');
  
  // Usuń w odwrotnej kolejności zależności (tabele podrzędne najpierw)
  const tablesToClear = [
    'order_items',
    'orders',
    'payments',
    'user_sessions',
    'cart_items',
    'wishlists',
    'product_reviews',
  ];
  
  for (const table of tablesToClear) {
    const result = await client.query(`DELETE FROM ${table}`);
    console.log(`  ✓ Usunięto ${result.rowCount} rekordów z ${table}`);
  }
  
  // Użytkowników testowych (po prefiksie)
  const testUsers = await client.query(`
    DELETE FROM users WHERE email LIKE 'test-%@example.com' RETURNING id
  `);
  console.log(`  ✓ Usunięto ${testUsers.rowCount} użytkowników testowych`);
  
  await client.end();
  console.log('Czyszczenie zakończone.');
}
```

### 2.3 Testowanie seeda

```typescript
test('seed tworzy wszystkie wymagane referencje', async () => {
  // Uruchom seeda
  await seedDatabase();
  
  // Weryfikuj każdą tabelę referencyjną
  const roles = await db.query('SELECT name FROM user_roles ORDER BY id');
  expect(roles.rows.map(r => r.name)).toEqual(['ADMIN', 'MODERATOR', 'USER', 'GUEST']);
  
  const currencies = await db.query('SELECT code FROM currencies ORDER BY code');
  expect(currencies.rows.map(r => r.code)).toEqual(['EUR', 'GBP', 'PLN', 'USD']);
  
  const categories = await db.query('SELECT slug FROM product_categories ORDER BY id');
  expect(categories.rows.length).toBeGreaterThan(0);
  
  // Weryfikuj integralność referencyjną
  const productsWithoutCategory = await db.query(`
    SELECT COUNT(*) FROM products p
    LEFT JOIN product_categories c ON p.category_id = c.id
    WHERE c.id IS NULL
  `);
  expect(parseInt(productsWithoutCategory.rows[0].count)).toBe(0);
});
```

---

## 3. Fikstura bazy danych — cykl życia w Playwright

### 3.1 Kompletna fikstura bazodanowa

```typescript
// tests/fixtures/database.fixture.ts
import { test as base, Page, APIResponse } from '@playwright/test';
import { Client, Pool } from 'pg';
import { dbConfig } from '../database.config';
import { seedDatabase, clearDatabase } from '../database/seed';

interface DBMethods {
  query: <T = any>(sql: string, params?: any[]) => Promise<{ rows: T[]; rowCount: number }>;
  getOne: <T = any>(sql: string, params?: any[]) => Promise<T | null>;
  getValue: <T = any>(sql: string, params?: any[]) => Promise<T>;
  insert: (table: string, data: Record<string, any>) => Promise<number>;
  update: (table: string, data: Record<string, any>, where: string, params?: any[]) => Promise<number>;
  delete: (table: string, where: string, params?: any[]) => Promise<number>;
  transaction: <T>(callback: (client: Client) => Promise<T>) => Promise<T>;
}

interface DatabaseFixture {
  db: DBMethods;
  dbClean: () => Promise<void>;
  dbSeed: () => Promise<void>;
}

export const test = base.extend<DatabaseFixture>({
  
  db: async ({}, use) => {
    const pool = new Pool(dbConfig);
    await pool.connect();
    
    const db: DBMethods = {
      query: async <T = any>(sql: string, params?: any[]): Promise<{ rows: T[]; rowCount: number }> => {
        const result = await pool.query(sql, params);
        return { rows: result.rows as T[], rowCount: result.rowCount ?? 0 };
      },
      
      getOne: async <T = any>(sql: string, params?: any[]): Promise<T | null> => {
        const result = await pool.query(sql, params);
        return result.rows[0] as T ?? null;
      },
      
      getValue: async <T = any>(sql: string, params?: any[]): Promise<T> => {
        const result = await pool.query(sql, params);
        const firstKey = Object.keys(result.rows[0] ?? {})[0];
        return result.rows[0]?.[firstKey] as T;
      },
      
      insert: async (table: string, data: Record<string, any>): Promise<number> => {
        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const result = await pool.query(
          `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING id`,
          values
        );
        return result.rows[0]?.id ?? -1;
      },
      
      update: async (table: string, data: Record<string, any>, where: string, params?: any[]): Promise<number> => {
        const setClause = Object.keys(data).map((col, i) => `${col} = $${i + 1}`).join(', ');
        const values = [...Object.values(data), ...(params ?? [])];
        const result = await pool.query(`UPDATE ${table} SET ${setClause} WHERE ${where}`, values);
        return result.rowCount ?? 0;
      },
      
      delete: async (table: string, where: string, params?: any[]): Promise<number> => {
        const result = await pool.query(`DELETE FROM ${table} WHERE ${where}`, params ?? []);
        return result.rowCount ?? 0;
      },
      
      transaction: async <T>(callback: (client: Client) => Promise<T>): Promise<T> => {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          const result = await callback(client);
          await client.query('COMMIT');
          return result;
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
      },
    };
    
    await use(db);
    
    await pool.end();
  },
  
  dbClean: async ({ db }, use) => {
    await use(async () => {
      await clearDatabase();
    });
    // Automatyczny cleanup po teście
  },
  
  dbSeed: async ({ db }, use) => {
    await use(async () => {
      await seedDatabase();
    });
  },
});
```

### 3.2 Użycie fikstury w testach

```typescript
import { test } from '../fixtures/database.fixture';

test.describe('Testy z fiksturą bazodanową', () => {
  
  test.beforeAll(async ({ dbSeed }) => {
    // Seed przed wszystkimi testami w grupie
    await dbSeed();
  });
  
  test.afterEach(async ({ dbClean }) => {
    // Czyszczenie po każdym teście
    await dbClean();
  });
  
  test('użytkownik może złożyć zamówienie', async ({ page, db }) => {
    // Setup przez bazę
    const userId = await db.insert('users', {
      email: `test-order-${Date.now()}@example.com`,
      full_name: 'Test User',
      role_id: 3,  // USER
      status: 'ACTIVE'
    });
    
    const productId = await db.insert('products', {
      name: 'Test Product',
      price: 99.99,
      stock: 10,
      category_id: 1
    });
    
    // Act: UI flow
    await page.goto('/products');
    await page.getByText('Test Product').click();
    await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
    await page.getByRole('button', { name: 'Złóż zamówienie' }).click();
    
    // Assert: weryfikacja bazy danych
    const order = await db.getOne<{ id: number; user_id: number; status: string }>(
      'SELECT id, user_id, status FROM orders WHERE user_id = $1',
      [userId]
    );
    
    expect(order).not.toBeNull();
    expect(order!.status).toBe('PENDING');
    
    const orderItems = await db.query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
      [order!.id]
    );
    
    expect(orderItems.rows.length).toBeGreaterThan(0);
    expect(orderItems.rows[0].product_id).toBe(productId);
  });
  
  test('magazyn zmniejsza się po zamówieniu', async ({ page, db }) => {
    const productId = await db.insert('products', {
      name: 'Limited Product',
      price: 49.99,
      stock: 5,
      category_id: 1
    });
    
    const initialStock = await db.getValue<number>(
      'SELECT stock FROM products WHERE id = $1',
      [productId]
    );
    
    // Zamów 2 sztuki
    await page.request.post('/api/checkout', {
      data: { productId, quantity: 2 }
    });
    
    const finalStock = await db.getValue<number>(
      'SELECT stock FROM products WHERE id = $1',
      [productId]
    );
    
    expect(finalStock).toBe(initialStock - 2);
  });
});
```

---

## 4. Strategie sprzątania danych

### 4.1 Strategia 1: Cleanup po teście (After Each)

```typescript
test.afterEach(async ({ db }) => {
  // Usuń zamówienia testowe
  const testOrders = await db.query(
    "SELECT id FROM orders WHERE order_number LIKE 'TEST-%'"
  );
  
  for (const order of testOrders.rows) {
    await db.delete('order_items', 'order_id = $1', [order.id]);
    await db.delete('orders', 'id = $1', [order.id]);
  }
  
  // Usuń użytkowników testowych
  await db.delete('users', "email LIKE 'test-%@example.com'");
  
  console.log('Cleanup zakończony');
});
```

### 4.2 Strategia 2: Cleanup przez prefiks

```typescript
test.describe.configure({ mode: 'serial' });  // Testy wykonywane sekwencyjnie

test('tworzy dane z prefiksem TEST-', async ({ db }) => {
  const testPrefix = `TEST-${Date.now()}`;
  
  const orderId = await db.insert('orders', {
    order_number: `${testPrefix}-ORDER-1`,
    user_id: 1,
    total_price: 100.00,
    status: 'PENDING'
  });
  
  // ... test logic ...
  
  // Cleanup: wszystko z prefiksem
  await db.query(`
    DELETE FROM orders WHERE order_number LIKE $1
  `, [`${testPrefix}%`]);
});
```

### 4.3 Strategia 3: Transakcyjny cleanup (najlepsza)

```typescript
export const transactionalTest = base.extend<DatabaseFixture>({
  db: async ({}, use) => {
    const client = new Client(dbConfig);
    await client.connect();
    
    // Rozpocznij transakcję
    await client.query('BEGIN');
    
    const db = { /* ... same methods but using client ... */ };
    
    await use(db);
    
    // Wycofaj wszystkie zmiany
    await client.query('ROLLBACK');
    console.log('Transakcja wycofana — środowisko niezmienione');
    
    await client.end();
  },
});

// Użycie
transactionalTest('test z pełną izolacją', async ({ db }) => {
  // Wszystkie zmiany automatycznie wycofane po teście
  await db.insert('orders', { order_number: 'TEST-123', total_price: 100 });
  // ...
});
```

### 4.4 Strategia 4: Periodic cleanup (dla środowisk CI)

```typescript
// scripts/periodic-cleanup.ts
import { Client } from 'pg';

export async function cleanupOldTestData(): Promise<void> {
  const client = new Client(dbConfig);
  await client.connect();
  
  // Usuń dane starsze niż 24 godziny
  const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const result = await client.query(`
    DELETE FROM user_sessions 
    WHERE created_at < $1
    RETURNING id
  `, [cutoffDate]);
  
  console.log(`Usunięto ${result.rowCount} starych sesji`);
  
  await client.end();
}

// Uruchom jako cron job lub w beforeAll zestawu testów
```

---

## 5. Testowanie zmian struktury bazy

### 5.1 Test: Dodanie nowej kolumny

```typescript
test('zmiana schematu nie psuje istniejących zapytań', async ({ db }) => {
  // Weryfikuj, że wszystkie tabele mają oczekiwane kolumny
  const requiredColumns: Record<string, string[]> = {
    users: ['id', 'email', 'full_name', 'role_id', 'status', 'created_at'],
    orders: ['id', 'order_number', 'user_id', 'total_price', 'status', 'created_at'],
    products: ['id', 'name', 'price', 'stock', 'category_id'],
  };
  
  for (const [table, columns] of Object.entries(requiredColumns)) {
    const existingColumns = await db.query<{ column_name: string }>(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = $1
    `, [table]);
    
    const existingColumnNames = existingColumns.rows.map(r => r.column_name);
    
    for (const column of columns) {
      expect(existingColumnNames).toContain(column);
    }
  }
});
```

### 5.2 Test: Migracja wsteczna (down migration)

```typescript
test('down migration przywraca poprzedni stan', async ({ db }) => {
  // Setup: symuluj kolumnę po migracji
  await db.query(`
    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ISSUED'
  `);
  
  // Act: wykonaj down migration
  await db.query(`
    ALTER TABLE invoices DROP COLUMN IF EXISTS status
  `);
  
  // Assert: kolumna nie istnieje
  const columnExists = await db.getValue<number>(`
    SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'status'
  `);
  
  expect(columnExists).toBe(0);
});
```

### 5.3 Test: Integralność danych po migracji

```typescript
test('migracja zachowuje integralność referencyjną', async ({ db }) => {
  // Setup: istniejące zamówienia bez kolumny status
  const orderId = await db.insert('orders', {
    order_number: `MIGRATION-TEST-${Date.now()}`,
    user_id: 1,
    total_price: 500.00,
    status: 'PENDING'
  });
  
  // Symuluj „stare" dane bez nowej kolumny (przed migracją)
  // W prawdziwym scenariuszu: zmigruj i sprawdź
  
  // Act: dodaj kolumnę
  await db.query(`
    ALTER TABLE orders ADD COLUMN shipping_address TEXT
  `);
  
  // Sprawdź, że wszystkie istniejące zamówienia mają poprawne wartości
  const ordersWithAddress = await db.query(`
    SELECT id, shipping_address FROM orders WHERE shipping_address IS NOT NULL
  `);
  
  // Nowe zamówienie może mieć adres
  await db.update('orders', { shipping_address: 'ul. Testowa 1' }, 'id = $1', [orderId]);
  
  const updatedOrder = await db.getOne<{ shipping_address: string }>(
    'SELECT shipping_address FROM orders WHERE id = $1',
    [orderId]
  );
  
  expect(updatedOrder!.shipping_address).toBe('ul. Testowa 1');
  
  // Cleanup
  await db.query('ALTER TABLE orders DROP COLUMN shipping_address');
});
```

---

## 6. Testowanie na realistycznych danych

### 6.1 Clone produkcyjnych danych (anonimizacja)

```typescript
// scripts/anonymize-prod-data.ts
export async function cloneAndAnonymize(): Promise<void> {
  const sourceClient = new Client({
    host: process.env.PROD_DB_HOST,
    database: process.env.PROD_DB_NAME,
    user: process.env.PROD_DB_USER,
    password: process.env.PROD_DB_PASSWORD,
  });
  
  const targetClient = new Client(dbConfig);
  await targetClient.connect();
  
  // Clone tabele (pominięcie wrażliwych danych)
  await targetClient.query(`
    INSERT INTO users (id, email, full_name, created_at)
    SELECT id, 
           'user' || id || '@test.local',
           'Test User ' || id,
           created_at
    FROM source.users
    LIMIT 1000
  `);
  
  // Anonimizacja danych osobowych
  await targetClient.query(`
    UPDATE users SET 
      email = 'user' || id || '@test.local',
      phone = NULL,
      address = NULL
    WHERE email LIKE '%@test.local'
  `);
  
  await sourceClient.end();
  await targetClient.end();
}
```

### 6.2 Generator danych testowych

```typescript
// tests/factories/user.factory.ts
export function generateTestUser(overrides: Partial<User> = {}): Partial<User> {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100000);
  
  return {
    email: `test-user-${timestamp}-${random}@example.com`,
    full_name: `Test User ${random}`,
    phone: `+48 ${random}`.padStart(12, '0'),
    role_id: 3,  // USER
    status: 'ACTIVE',
    email_verified: true,
    created_at: new Date(),
    ...overrides,
  };
}

export function generateTestProduct(overrides: Partial<Product> = {}): Partial<Product> {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  
  return {
    name: `Test Product ${random}`,
    slug: `test-product-${timestamp}-${random}`,
    description: `Opis produktu testowego ${random}`,
    price: parseFloat((Math.random() * 1000).toFixed(2)),
    stock: Math.floor(Math.random() * 100) + 1,
    category_id: Math.floor(Math.random() * 5) + 1,
    is_active: true,
    created_at: new Date(),
    ...overrides,
  };
}

export function generateTestOrder(overrides: Partial<Order> = {}): Partial<Order> {
  const timestamp = Date.now();
  
  return {
    order_number: `ORD-TEST-${timestamp}`,
    user_id: overrides.user_id ?? 1,
    total_price: overrides.total_price ?? 99.99,
    status: 'PENDING',
    shipping_address: 'ul. Testowa 1, 00-001 Warszawa',
    created_at: new Date(),
    ...overrides,
  };
}
```

---

## 7. Lista kontrolna zarządzania danymi

| Element | Status | Uwagi |
|---------|--------|-------|
| Migracje mają up/down | ☐ | Możliwość wycofania |
| Seed jest idempotentny | ☐ | Można uruchomić wielokrotnie |
| Cleanup jest deterministyczny | ☐ | Zawsze ten sam efekt |
| Fixture ma jasny cykl życia | ☐ | Setup → Test → Teardown |
| Testy używają izolowanych danych | ☐ | Brak konfliktów między testami |
| Dane testowe są realistyczne | ☐ | Zbliżone do produkcyjnych |
| Wrażliwe dane są anonimizowane | ☐ | Brak PII w testach |
| Migracje są testowane na dużych danych | ☐ | Wolumen zbliżony do produkcji |

---

## Perspektywa Full Stack Testera

Profesjonalne zarządzanie danymi testowymi to kompetencja, która odróżnia dobrego testera od mistrza. Gdy masz:
- **Idempotentny seed** — środowisko zawsze ma poprawny stan wyjściowy
- **Deterministyczny cleanup** — żadne dane nie „wyciekają" między testami
- **Testowane migracje** — zmiany schematu nie psują systemu
- **Realistyczne dane** — testy odzwierciedlają prawdziwe scenariusze

...wtedy możesz uruchomić zestaw testów 1000 razy i za każdym razem otrzymać ten sam, wiarygodny wynik. To jest fundament Continuous Deployment i prawdziwej jakości oprogramowania.

---

## Podsumowanie

- **Migracje są kodem produkcyjnym** — wymagają wersjonowania, testowania i możliwości wycofania
- **Seed tworzy dane referencyjne** — deterministyczne, idempotentne, niezmienne między testami
- **Fikstury bazodanowe** zarządzają cyklem życia połączenia: setup → test → teardown
- **Strategie cleanup** obejmują: after each, prefiksy, transakcje i cleanup okresowy
- **Testowanie migracji** powinno obejmować: weryfikację kolumn, indeksów, ograniczeń i danych brzegowych
- **Realistyczne dane testowe** zwiększają wiarygodność testów i zmniejszają ryzyko pominięcia błędów

---

## Linki i źródła

- **[node-pg-migrate](https://salsita.github.io/node-pg-migrate/)** — narzędzie do migracji PostgreSQL dla Node.js
- **[Knex.js Migrations](https://knexjs.org/guide/migrations.html)** — migracje z Knex.js
- **[Database Testing Best Practices — ThoughtWorks](https://www.thoughtworks.com/developer-tools)** — najlepsze praktyki testowania baz danych
- **[Faker.js](https://fakerjs.dev/)** — generator danych testowych
- **[Test Data Management — Datical](https://www.datical.com/)** — zarządzanie danymi testowymi w przedsiębiorstwach
- **[Database Schema Migration Strategies — Redgate](https://www.red-gate.com/)** — strategie migracji schematu
- **[Anonymizing Production Data for Testing — Wikipedia](https://en.wikipedia.org/wiki/Data_anonymization)** — techniki anonimizacji danych
---

## Migracje forward-only i rollback

W wielu zespołach migracje są forward-only: zamiast cofać migrację, tworzy się kolejną, która naprawia stan. Tester powinien wiedzieć, jaki model obowiązuje w projekcie.

Dobre testy migracji sprawdzają:

- migrację na pustej bazie;
- migrację na bazie z danymi;
- zachowanie aplikacji po migracji;
- kompatybilność starej i nowej wersji podczas rolling deploy;
- brak utraty danych.

## Maskowanie danych

Jeśli używasz snapshotu produkcyjnego do testów, dane muszą być zanonimizowane lub syntetyzowane. Maskowanie powinno zachować właściwości danych ważne dla testów: długości, rozkłady, relacje i wartości brzegowe, ale usunąć PII i sekrety.

## 📘 Suplement Inżynieryjny 2026: SQL i Bazy Danych dla Testerów
*Inspiracja: „Scalable Test Automation with Playwright” (2026), Chapter 7*
*   **Isolation Levels**: Przy testowaniu współbieżności bazy danych (np. deadlocks, warunki wyścigu), upewnij się, że Twoje testy celowo wymuszają i weryfikują zachowanie aplikacji na różnych poziomach izolacji transakcji (Read Committed, Serializable).
