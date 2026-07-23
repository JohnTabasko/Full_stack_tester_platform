# Transakcje, Izolacja i Warunki Wyścigu — Testowanie Spójności Współbieżnej

> **Perspektywa Full Stack Testera**
> Współczesne aplikacje webowe obsługują setki, a nawet tysiące użytkowników jednocześnie. Scenariusz, w którym dwóch klientów próbuje kupić ostatnią sztukę produktu, nie jest hipotetyczny — to codzienność e-commerce, systemów rezerwacyjnych i platform finansowych. Rozumienie transakcji, poziomów izolacji i warunków wyścigu pozwala projektować testy, które weryfikują poprawność systemu w scenariuszach równoległych, gdzie najprostsze błędy mogą prowadzić do poważnych konsekwencji: podwójnych płatności, ujemnych stanów magazynowych lub utraconych aktualizacji. W tej lekcji zdobędziesz umiejętności diagnozowania i testowania problemów współbieżności, które są jednymi z najtrudniejszych do wykrycia i najdroższych w naprawie.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Rozumieć** właściwości ACID i ich wpływ na testowanie
- **Konfigurować** i testować różne poziomy izolacji transakcji
- **Projektować** testy współbieżności dla scenariuszy biznesowych
- **Identyfikować** i weryfikować problemy typu lost update, dirty read i deadlock
- **Używać** mechanizmów blokowania i wersjonowania do rozwiązywania konfliktów
- **Symulować** warunki wyścigu w kontrolowanym środowisku testowym

---

## Wprowadzenie — dlaczego współbieżność ma znaczenie

Przyjrzyjmy się scenariuszowi przewodniemu: dwóch klientów jednocześnie kupuje ostatnią sztukę produktu. System musi sprzedać ją dokładnie raz. Bez odpowiedniej ochrony współbieżności może dojść do:

1. **Podwójnej sprzedaży** — oba zamówienia zostaną przyjęte, mimo że magazyn miał tylko jedną sztukę
2. **Niespójnego stanu magazynowego** — oba zamówienia zostaną zaksięgowane, ale stan produktu będzie ujemny
3. **Lost update** — oba procesy odczytają stan = 1, oba zdecydują o sprzedaży, finalny stan będzie 0 zamiast -1
4. **Deadlock** — transakcje zablokują się nawzajem, żadna nie zostanie ukończona

Zrozumienie tych problemów i umiejętność ich testowania to kluczowa kompetencja Full Stack Testera.

---

## 1. Właściwości ACID w kontekście testowania

ACID to akronim opisujący cztery fundamentalne właściwości, które gwarantują poprawność operacji bazodanowych:

### 1.1 Atomicity (Atomowość)

**Definicja:** Operacja jest niepodzielna — albo wykonuje się w całości, albo w ogóle. Nie ma stanu pośredniego.

**Scenariusz testowy:** Zamówienie składa się z trzech operacji:
1. Zmniejsz stan magazynowy
2. Utwórz rekord zamówienia
3. Utwórz rekord płatności

**Test atomowości:**

```typescript
test('zamówienie musi być atomowe — wszystko albo nic', async ({ db }) => {
  const productId = 42;
  const initialStock = await db.getValue<number>(
    'SELECT stock FROM products WHERE id = $1',
    [productId]
  );
  
  const client = new Client(dbConfig);
  await client.connect();
  
  try {
    await client.query('BEGIN');
    
    // Operacja 1: Zmniejsz stan
    await client.query(
      'UPDATE products SET stock = stock - 1 WHERE id = $1',
      [productId]
    );
    
    // Operacja 2: Utwórz zamówienie
    await client.query(
      'INSERT INTO orders (order_number, user_id, total_price, status) VALUES ($1, $2, $3, $4)',
      [`ORD-ATOMIC-${Date.now()}`, 1, 99.99, 'PENDING']
    );
    
    // Operacja 3: Symulacja błędu w trzeciej operacji
    throw new Error('Simulated failure in payment creation');
    
  } catch (error) {
    // Wycofanie całej transakcji
    await client.query('ROLLBACK');
    console.log('Transakcja wycofana — stan bazy niezmieniony');
  } finally {
    await client.end();
  }
  
  // Weryfikacja: stan magazynowy niezmieniony
  const finalStock = await db.getValue<number>(
    'SELECT stock FROM products WHERE id = $1',
    [productId]
  );
  
  expect(finalStock).toBe(initialStock);
  
  // Weryfikacja: brak zamówienia
  const orderCount = await db.getValue<number>(
    "SELECT COUNT(*) FROM orders WHERE order_number LIKE 'ORD-ATOMIC-%'"
  );
  
  expect(orderCount).toBe(0);
});
```

### 1.2 Consistency (Spójność)

**Definicja:** Transakcja przekształca bazę z jednego poprawnego stanu w inny poprawny stan. Wszystkie ograniczenia (constraints) muszą być spełnione.

**Scenariusz testowy:** Przelew bankowy między dwoma kontami. Suma salda obu kont po operacji musi być równa sumie przed operacją.

```typescript
test('przelew musi zachować spójność — suma sald bez zmian', async ({ db }) => {
  const accountAId = 1;
  const accountBId = 2;
  const transferAmount = 500;
  
  // Pobierz stan początkowy
  const initialSum = await db.getValue<number>(`
    SELECT COALESCE(SUM(balance), 0) FROM accounts WHERE id IN ($1, $2)
  `, [accountAId, accountBId]);
  
  const initialBalanceA = await db.getValue<number>(
    'SELECT balance FROM accounts WHERE id = $1',
    [accountAId]
  );
  
  const initialBalanceB = await db.getValue<number>(
    'SELECT balance FROM accounts WHERE id = $2',
    [accountBId]
  );
  
  // Wykonaj przelew atomowo
  await db.query('BEGIN');
  
  try {
    await db.query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
      [transferAmount, accountAId]
    );
    await db.query(
      'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
      [transferAmount, accountBId]
    );
    await db.query('COMMIT');
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
  
  // Weryfikacja spójności
  const finalSum = await db.getValue<number>(`
    SELECT COALESCE(SUM(balance), 0) FROM accounts WHERE id IN ($1, $2)
  `, [accountAId, accountBId]);
  
  const finalBalanceA = await db.getValue<number>(
    'SELECT balance FROM accounts WHERE id = $1',
    [accountAId]
  );
  
  const finalBalanceB = await db.getValue<number>(
    'SELECT balance FROM accounts WHERE id = $2',
    [accountBId]
  );
  
  // Suma sald bez zmian
  expect(finalSum).toBe(initialSum);
  
  // Salda zmienione poprawnie
  expect(finalBalanceA).toBe(initialBalanceA - transferAmount);
  expect(finalBalanceB).toBe(initialBalanceB + transferAmount);
  
  // Ograniczenie: saldo nie może być ujemne (jeśli zdefiniowane)
  const negativeBalances = await db.getValue<number>(
    'SELECT COUNT(*) FROM accounts WHERE balance < 0'
  );
  expect(negativeBalances).toBe(0);
});
```

### 1.3 Isolation (Izolacja)

**Definicja:** Współbieżne transakcje nie wpływają na siebie nawzajem. Efekt wykonania dwóch transakcji równolegle jest taki sam jak sekwencyjny.

**Scenariusz testowy:** Dwie transakcje próbują jednocześnie zaktualizować ten sam rekord.

**Więcej szczegółów w sekcji 3 — poziomy izolacji.**

### 1.4 Durability (Trwałość)

**Definicja:** Po zatwierdzeniu transakcji (COMMIT) jej efekty są trwale zapisane, nawet w przypadku awarii systemu.

**Scenariusz testowy:** Potwierdzenie zamówienia musi przetrwać restart bazy danych.

```typescript
test('zatwierdzone zamówienie musi przetrwać restart', async ({ db }) => {
  // Utwórz zamówienie i zatwierdź
  const orderId = await db.insert('orders', {
    order_number: `ORD-DUR-${Date.now()}`,
    user_id: 1,
    total_price: 199.99,
    status: 'CONFIRMED'
  });
  
  await db.query('CHECKPOINT');  // wymuś zapis na dysk (PostgreSQL)
  
  // Symulacja "awarii" — ponowne połączenie
  // (w prawdziwym scenariuszu: restart instancji bazy)
  
  // Weryfikacja: zamówienie nadal istnieje
  const order = await db.getOne<{ id: number; status: string }>(
    'SELECT id, status FROM orders WHERE id = $1',
    [orderId]
  );
  
  expect(order).not.toBeNull();
  expect(order!.status).toBe('CONFIRMED');
});
```

---

## 2. Rollback — mechanizm wycofywania zmian

### 2.1 Podstawowy rollback

```typescript
test('błąd w transakcji powoduje pełny rollback', async ({ db }) => {
  const initialCount = await db.getValue<number>(
    'SELECT COUNT(*) FROM users WHERE email LIKE $1',
    ['test-rollback-%@example.com']
  );
  
  const client = new Client(dbConfig);
  await client.connect();
  
  try {
    await client.query('BEGIN');
    
    // Utwórz użytkownika
    await client.query(`
      INSERT INTO users (email, full_name, status)
      VALUES ($1, 'Test User', 'ACTIVE')
    `, [`test-rollback-${Date.now()}@example.com`]);
    
    // Symuluj błąd
    throw new Error('Simulated business logic error');
    
  } catch (error) {
    await client.query('ROLLBACK');
  } finally {
    await client.end();
  }
  
  // Weryfikacja: żaden użytkownik nie został utworzony
  const finalCount = await db.getValue<number>(
    'SELECT COUNT(*) FROM users WHERE email LIKE $1',
    ['test-rollback-%@example.com']
  );
  
  expect(finalCount).toBe(initialCount);
});
```

### 2.2 Partial rollback z SAVEPOINT

```typescript
test('rollback do savepoint nie wycofuje całości transakcji', async ({ db }) => {
  const client = new Client(dbConfig);
  await client.connect();
  
  try {
    await client.query('BEGIN');
    
    // Krok 1: Utwórz użytkownika
    const userId = await client.query(`
      INSERT INTO users (email, full_name, status)
      VALUES ($1, 'First User', 'ACTIVE')
      RETURNING id
    `, [`test-savepoint-${Date.now()}@example.com`]).then(r => r.rows[0].id);
    
    // Savepoint po kroku 1
    await client.query('SAVEPOINT after_user_creation');
    
    // Krok 2: Utwórz zamówienie (które może się nie powieść)
    let orderCreated = false;
    try {
      // Próba utworzenia zamówienia z nieprawidłową wartością
      await client.query(`
        INSERT INTO orders (order_number, user_id, total_price, status)
        VALUES ($1, $2, -100, 'PENDING')
      `, [`ORD-SAVE-${Date.now()}`, userId]);
      orderCreated = true;
    } catch (error) {
      // Wycofaj tylko do savepoint
      await client.query('ROLLBACK TO SAVEPOINT after_user_creation');
      console.log('Zamówienie wycofane, użytkownik nadal istnieje');
    }
    
    // Krok 3: Spróbuj utworzyć zamówienie poprawne
    const orderId = await client.query(`
      INSERT INTO orders (order_number, user_id, total_price, status)
      VALUES ($1, $2, 150.00, 'PENDING')
      RETURNING id
    `, [`ORD-SAVE-OK-${Date.now()}`, userId]).then(r => r.rows[0].id);
    
    await client.query('COMMIT');
    
    // Weryfikacja: użytkownik istnieje, poprawne zamówienie istnieje, błędne nie istnieje
    const user = await db.getOne('SELECT id FROM users WHERE id = $1', [userId]);
    expect(user).not.toBeNull();
    
    const goodOrder = await db.getOne(
      'SELECT id FROM orders WHERE id = $1 AND total_price > 0',
      [orderId]
    );
    expect(goodOrder).not.toBeNull();
    
    const badOrderCount = await db.getValue<number>(
      "SELECT COUNT(*) FROM orders WHERE order_number LIKE 'ORD-SAVE-%' AND total_price < 0"
    );
    expect(badOrderCount).toBe(0);
    
  } finally {
    await client.end();
  }
});
```

### 2.3 Ograniczenia rollback w systemach rozproszonych

**Ważne:** Rollback działa tylko na bazie danych. Jeśli transakcja obejmuje zewnętrzny serwis (np. płatność przez Stripe), broker wiadomości (np. Kafka) lub usługę trzecią, rollback bazy danych nie wycofa tych operacji.

```typescript
// Przykład: transakcja obejmuje bazę i zewnętrzny webhook
test('błąd po wysłaniu webhooka nie może być wycofany z bazy', async ({ db }) => {
  const client = new Client(dbConfig);
  await client.connect();
  
  let webhookSent = false;
  
  try {
    await client.query('BEGIN');
    
    // Krok 1: Utwórz zamówienie w bazie
    await client.query(`
      INSERT INTO orders (order_number, user_id, total_price, status)
      VALUES ($1, 1, 100.00, 'PENDING')
    `, [`ORD-WEB-${Date.now()}`]);
    
    // Krok 2: Wyślij webhook (symulacja)
    webhookSent = true;
    console.log('Webhook wysłany — nie można wycofać!');
    
    // Krok 3: Symuluj błąd po webhooku
    throw new Error('Database error after webhook');
    
  } catch (error) {
    // Rollback bazy danych — ale webhook уже wysłany!
    await client.query('ROLLBACK');
    console.log('Baza wycofana, ale webhook pozostał wysłany!');
    
    // W rzeczywistej implementacji potrzebna jest kompensacja:
    // - Wysłanie anulującego webhooka
    // - Zapisanie w tabeli kompensacji
    // - Powiadomienie systemu monitoringu
  } finally {
    await client.end();
  }
  
  // Stan w bazie jest wycofany
  const orderCount = await db.getValue<number>(
    "SELECT COUNT(*) FROM orders WHERE order_number LIKE 'ORD-WEB-%'"
  );
  expect(orderCount).toBe(0);
  
  // Ale webhook został wysłany (w prawdziwym scenariuszu — konieczna kompensacja)
  expect(webhookSent).toBe(true);
});
```

---

## 3. Poziomy izolacji transakcji

Poziom izolacji określa, jak transakcje współbieżne wpływają na siebie nawzajem. Wyższy poziom = większa ochrona, ale niższa wydajność.

### 3.1 Przegląd poziomów izolacji

| Poziom | Dirty Read | Non-repeatable Read | Phantom Read |
|--------|------------|---------------------|--------------|
| **Read Uncommitted** | ✓ Możliwe | ✓ Możliwe | ✓ Możliwe |
| **Read Committed** | ✗ Niemożliwe | ✓ Możliwe | ✓ Możliwe |
| **Repeatable Read** | ✗ Niemożliwe | ✗ Niemożliwe | ✓ Możliwe* |
| **Serializable** | ✗ Niemożliwe | ✗ Niemożliwe | ✗ Niemożliwe |

*W PostgreSQL REPEATABLE READ zapobiega phantom reads.

### 3.2 Read Committed (domyślny w PostgreSQL)

```sql
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

**Test: Weryfikacja, że niezatwierdzone zmiany nie są widoczne**

```typescript
test('transakcja A nie widzi niezatwierdzonych zmian transakcji B', async ({ db }) => {
  const clientA = new Client(dbConfig);
  const clientB = new Client(dbConfig);
  
  const productId = 1;
  const initialStock = await db.getValue<number>(
    'SELECT stock FROM products WHERE id = $1',
    [productId]
  );
  
  try {
    // Transakcja B: rozpocznij, zmodyfikuj, ale nie zatwierdź
    await clientB.connect();
    await clientB.query('BEGIN');
    await clientB.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
    await clientB.query(
      'UPDATE products SET stock = $1 WHERE id = $2',
      [initialStock - 10, productId]
    );
    console.log('Transakcja B: zmodyfikowano stock, nie zatwierdzono');
    
    // Transakcja A: rozpocznij i czytaj
    await clientA.connect();
    await clientA.query('BEGIN');
    await clientA.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
    
    const visibleStock = await clientA.query(
      'SELECT stock FROM products WHERE id = $1',
      [productId]
    ).then(r => r.rows[0].stock);
    
    console.log(`Transakcja A widzi stock: ${visibleStock} (initial: ${initialStock})`);
    
    // Asercja: widoczny jest stary stan (zmiany B nie są widoczne)
    expect(visibleStock).toBe(initialStock);
    
    // Zatwierdź transakcję A
    await clientA.query('COMMIT');
    
    // Teraz B zatwierdza
    await clientB.query('COMMIT');
    
  } finally {
    await clientA.end();
    await clientB.end();
  }
  
  // Weryfikacja końcowego stanu
  const finalStock = await db.getValue<number>(
    'SELECT stock FROM products WHERE id = $1',
    [productId]
  );
  expect(finalStock).toBe(initialStock - 10);
});
```

### 3.3 Repeatable Read

```sql
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
```

**Test: Weryfikacja spójności odczytu w ramach transakcji**

```typescript
test('w repeatable read wielokrotne odczyty tego samego wiersza dają ten sam wynik', async ({ db }) => {
  const clientA = new Client(dbConfig);
  const clientB = new Client(dbConfig);
  
  const productId = 1;
  const initialStock = await db.getValue<number>(
    'SELECT stock FROM products WHERE id = $1',
    [productId]
  );
  
  try {
    // Transakcja A: rozpocznij z REPEATABLE READ
    await clientA.connect();
    await clientA.query('BEGIN');
    await clientA.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
    
    // Pierwszy odczyt
    const firstRead = await clientA.query(
      'SELECT stock FROM products WHERE id = $1',
      [productId]
    ).then(r => r.rows[0].stock);
    
    // Transakcja B: zmień stock i zatwierdź
    await clientB.connect();
    await clientB.query('BEGIN');
    await clientB.query(
      'UPDATE products SET stock = $1 WHERE id = $2',
      [initialStock - 5, productId]
    );
    await clientB.query('COMMIT');
    
    // Drugi odczyt w transakcji A (powinien dać ten sam wynik!)
    const secondRead = await clientA.query(
      'SELECT stock FROM products WHERE id = $1',
      [productId]
    ).then(r => r.rows[0].stock);
    
    // Asercja: oba odczyty są identyczne
    expect(firstRead).toBe(secondRead);
    expect(secondRead).toBe(initialStock);  // Nie widać zmian B!
    
    await clientA.query('COMMIT');
    
  } finally {
    await clientA.end();
    await clientB.end();
  }
});
```

### 3.4 Serializable — najwyższy poziom izolacji

```sql
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```

**Test: Weryfikacja, że transakcje wykonują się sekwencyjnie**

```typescript
test('serializable wymusza sekwencyjne wykonanie konfliktujących transakcji', async ({ db }) => {
  const clientA = new Client(dbConfig);
  const clientB = new Client(dbConfig);
  
  const productId = 1;
  const initialStock = await db.getValue<number>(
    'SELECT stock FROM products WHERE id = $1',
    [productId]
  );
  
  try {
    // Obie transakcje: REPEATABLE READ (domyślny) — mogą się "minąć"
    await clientA.connect();
    await clientA.query('BEGIN');
    await clientA.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
    
    // Transakcja A: odczytaj stock
    const stockA = await clientA.query(
      'SELECT stock FROM products WHERE id = $1',
      [productId]
    ).then(r => r.rows[0].stock);
    
    // Teraz obie transakcje próbują zmienić stock
    await clientB.connect();
    await clientB.query('BEGIN');
    await clientB.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
    
    // Transakcja B: zmień stock i zatwierdź
    await clientB.query(
      'UPDATE products SET stock = stock - 5 WHERE id = $1',
      [productId]
    );
    await clientB.query('COMMIT');
    console.log('Transakcja B zatwierdzona');
    
    // Transakcja A: próba zmiany (konflikt!)
    let aFailed = false;
    let aError = '';
    try {
      await clientA.query(
        'UPDATE products SET stock = stock - 3 WHERE id = $1',
        [productId]
      );
      await clientA.query('COMMIT');
    } catch (error: any) {
      aFailed = true;
      aError = error.message;
      await clientA.query('ROLLBACK');
      console.log('Transakcja A wycofana z powodu konfliktu');
    }
    
    // W serializable jedna transakcja musi się wycofać
    // Sprawdzenie, czy konflikt został wykryty
    const finalStock = await db.getValue<number>(
      'SELECT stock FROM products WHERE id = $1',
      [productId]
    );
    
    console.log(`Stock końcowy: ${finalStock} (initial: ${initialStock})`);
    expect(finalStock).toBe(initialStock - 5);  // Tylko zmiana B
    
  } finally {
    await clientA.end();
    await clientB.end();
  }
});
```

---

## 4. Lost Update — utracona aktualizacja

### 4.1 Co to jest Lost Update?

Lost update występuje, gdy dwie transakcje:
1. Odczytują ten sam stan
2. Każda modyfikuje dane na podstawie odczytu
3. Obie zatwierdzają zmiany
4. Jedna zmiana „ginie" — zostaje nadpisana przez drugą

**Klasyczny przykład: licznik zamówień**

```
Transakcja A: READ stock = 1
Transakcja B: READ stock = 1
Transakcja A: WRITE stock = 0 (sprzedaż)
Transakcja B: WRITE stock = 0 (sprzedaż)  ← LOST UPDATE! Zmiana A zginęła
```

### 4.2 Test: Weryfikacja lost update przy współbieżności

```typescript
test('współbieżne zamówienia nie powinny powodować lost update na stanie magazynowym', async ({ db }) => {
  const productId = 1;
  
  // Ustaw stan initial: 1 sztuka
  await db.query(
    'UPDATE products SET stock = 1 WHERE id = $1',
    [productId]
  );
  
  const clientA = new Client(dbConfig);
  const clientB = new Client(dbConfig);
  
  await clientA.connect();
  await clientB.connect();
  
  const results = { a: null as string | null, b: null as string | null };
  
  try {
    // Obie transakcje: READ COMMITTED (domyślny)
    await clientA.query('BEGIN');
    await clientB.query('BEGIN');
    
    // Obie odczytują ten sam stan
    const stockA = await clientA.query(
      'SELECT stock FROM products WHERE id = $1 FOR UPDATE',
      [productId]
    ).then(r => r.rows[0].stock);
    
    const stockB = await clientB.query(
      'SELECT stock FROM products WHERE id = $1',
      [productId]
    ).then(r => r.rows[0].stock);
    
    console.log(`Odczyt A: ${stockA}, Odczyt B: ${stockB}`);
    
    // Obie próbują zmienić
    // Transakcja A: zmień i zatwierdź
    if (stockA > 0) {
      await clientA.query(
        'UPDATE products SET stock = stock - 1 WHERE id = $1',
        [productId]
      );
      await clientA.query('COMMIT');
      results.a = 'SUCCESS';
    } else {
      await clientA.query('ROLLBACK');
      results.a = 'INSUFFICIENT_STOCK';
    }
    
    // Transakcja B: zmień i zatwierdź
    if (stockB > 0) {
      await clientB.query(
        'UPDATE products SET stock = stock - 1 WHERE id = $1',
        [productId]
      );
      await clientB.query('COMMIT');
      results.b = 'SUCCESS';
    } else {
      await clientB.query('ROLLBACK');
      results.b = 'INSUFFICIENT_STOCK';
    }
    
  } finally {
    await clientA.end();
    await clientB.end();
  }
  
  // Weryfikacja: dokładnie jedna transakcja zakończyła się sukcesem
  console.log(`Wyniki: A=${results.a}, B=${results.b}`);
  
  const finalStock = await db.getValue<number>(
    'SELECT stock FROM products WHERE id = $1',
    [productId]
  );
  
  // Stan końcowy: 0 (jedna sprzedaż)
  expect(finalStock).toBe(0);
  
  // Dokładnie jedno zamówienie zostało utworzone
  const orderCount = await db.getValue<number>(
    'SELECT COUNT(*) FROM orders WHERE product_id = $1',
    [productId]
  );
  expect(orderCount).toBe(1);
});
```

### 4.3 Rozwiązanie: SELECT FOR UPDATE (pessimistic locking)

```typescript
test('FOR UPDATE zapobiega lost update — tylko jedna transakcja przechodzi', async ({ db }) => {
  const productId = 1;
  
  // Ustaw stan initial: 1 sztuka
  await db.query(
    'UPDATE products SET stock = 1 WHERE id = $1',
    [productId]
  );
  
  const clientA = new Client(dbConfig);
  const clientB = new Client(dbConfig);
  
  await clientA.connect();
  await clientB.connect();
  
  const results = { a: null as string | null, b: null as string | null };
  
  try {
    await clientA.query('BEGIN');
    await clientB.query('BEGIN');
    
    // Transakcja A: blokuje wiersz do aktualizacji
    const stockA = await clientA.query(
      'SELECT stock FROM products WHERE id = $1 FOR UPDATE',
      [productId]
    ).then(r => r.rows[0].stock);
    
    // Transakcja B: próbuje zablokować ten sam wiersz — musi czekać!
    // W tym momencie następuje "kolejkowanie" transakcji B
    const stockBPromise = clientB.query(
      'SELECT stock FROM products WHERE id = $1 FOR UPDATE',
      [productId]
    );
    
    console.log('Transakcja B czeka na zwolnienie blokady...');
    
    // Transakcja A: zmień i zatwierdź
    await clientA.query(
      'UPDATE products SET stock = stock - 1 WHERE id = $1',
      [productId]
    );
    await clientA.query('COMMIT');
    results.a = 'SUCCESS';
    console.log('Transakcja A zatwierdzona, blokada zwolniona');
    
    // Teraz transakcja B może kontynuować
    const stockBResult = await stockBPromise;
    const stockB = stockBResult.rows[0].stock;
    
    // Transakcja B: stock jest już 0, więc nie może sprzedać
    if (stockB > 0) {
      await clientB.query(
        'UPDATE products SET stock = stock - 1 WHERE id = $1',
        [productId]
      );
      await clientB.query('COMMIT');
      results.b = 'SUCCESS';
    } else {
      await clientB.query('ROLLBACK');
      results.b = 'INSUFFICIENT_STOCK';
    }
    
  } finally {
    await clientA.end();
    await clientB.end();
  }
  
  // Weryfikacja: dokładnie jedna transakcja zakończyła się sukcesem
  expect(results.a).toBe('SUCCESS');
  expect(results.b).toBe('INSUFFICIENT_STOCK');
  
  const finalStock = await db.getValue<number>(
    'SELECT stock FROM products WHERE id = $1',
    [productId]
  );
  expect(finalStock).toBe(0);
});
```

### 4.4 Rozwiązanie alternatywne: Optimistic Locking (wersjonowanie)

```sql
-- Tabela z kolumną version
ALTER TABLE products ADD COLUMN version INTEGER DEFAULT 0;

-- Aktualizacja z weryfikacją wersji
UPDATE products 
SET stock = stock - 1, version = version + 1
WHERE id = $1 AND version = $2 AND stock >= 1
RETURNING *;
```

```typescript
test('optimistic locking zapobiega lost update przez wersjonowanie', async ({ db }) => {
  const productId = 1;
  
  // Setup: produkt z jedną sztuką
  await db.query(`
    UPDATE products 
    SET stock = 1, version = 0 
    WHERE id = $1
  `, [productId]);
  
  // Odczytaj początkową wersję
  const initialVersion = await db.getValue<number>(
    'SELECT version FROM products WHERE id = $1',
    [productId]
  );
  
  // Próba aktualizacji z wersją
  const updateResult = await db.query(`
    UPDATE products 
    SET stock = stock - 1, version = version + 1
    WHERE id = $1 AND version = $2 AND stock >= 1
    RETURNING id, stock, version
  `, [productId, initialVersion]);
  
  if (updateResult.rowCount === 0) {
    console.log('Aktualizacja nie powiodła się — wersja się nie zgadza');
  }
  
  // Weryfikacja
  const product = await db.getOne<{ stock: number; version: number }>(
    'SELECT stock, version FROM products WHERE id = $1',
    [productId]
  );
  
  expect(product!.version).toBe(initialVersion + 1);
  expect(product!.stock).toBe(0);
});
```

---

## 5. Deadlock — wzajemne blokowanie transakcji

### 5.1 Co to jest deadlock?

Deadlock występuje, gdy dwie lub więcej transakcji wzajemnie blokują zasoby, których potrzebują, tworząc cykl zależności:

```
Transakcja A blokuje Zasób 1, czeka na Zasób 2
Transakcja B blokuje Zasób 2, czeka na Zasób 1
→ DEADLOCK!
```

### 5.2 Test: Wykrywanie deadlock w scenariuszu przelewu

```typescript
test('wzajemne blokowanie w przelewach powinno być wykryte i rozwiązane', async ({ db }) => {
  const accountA = 1;
  const accountB = 2;
  
  const clientA = new Client(dbConfig);
  const clientB = new Client(dbConfig);
  
  await clientA.connect();
  await clientB.connect();
  
  const results = { a: null as string | null, b: null as string | null };
  
  try {
    // Transakcja A: blokuj konto A
    await clientA.query('BEGIN');
    await clientA.query(
      'SELECT id FROM accounts WHERE id = $1 FOR UPDATE',
      [accountA]
    );
    console.log('Transakcja A zablokowała konto A');
    
    // Transakcja B: blokuj konto B
    await clientB.query('BEGIN');
    await clientB.query(
      'SELECT id FROM accounts WHERE id = $1 FOR UPDATE',
      [accountB]
    );
    console.log('Transakcja B zablokowała konto B');
    
    // Teraz obie próbują zablokować przeciwne konto:
    // Transakcja A próbuje zablokować konto B
    let aWaiting = false;
    const bLockPromise = clientB.query(
      'SELECT id FROM accounts WHERE id = $1 FOR UPDATE',
      [accountA]
    ).then(() => { aWaiting = true; return { rows: [] }; }).catch(() => null);
    
    // Krótkie opóźnienie symulujące przetwarzanie
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Transakcja B próbuje zablokować konto A
    // To powinno wykryć deadlock!
    let deadlockOccurred = false;
    try {
      await clientB.query(
        'SELECT id FROM accounts WHERE id = $1 FOR UPDATE',
        [accountA]
      );
      results.b = 'SUCCESS';
    } catch (error: any) {
      if (error.code === '40P01') {  // deadlock_detected
        deadlockOccurred = true;
        await clientB.query('ROLLBACK');
        results.b = 'DEADLOCK_ROLLBACK';
        console.log('Deadlock wykryty — transakcja B wycofana');
      } else {
        throw error;
      }
    }
    
    // Teraz A może kontynuować (B się wycofało)
    try {
      await clientA.query(
        'SELECT id FROM accounts WHERE id = $1 FOR UPDATE',
        [accountB]
      );
      await clientA.query('COMMIT');
      results.a = 'SUCCESS';
    } catch (error: any) {
      await clientA.query('ROLLBACK');
      results.a = 'FAILED';
    }
    
  } finally {
    await clientA.end();
    await clientB.end();
  }
  
  console.log(`Wyniki: A=${results.a}, B=${results.b}`);
  
  // Przynajmniej jedna transakcja powinna się powieść
  const successCount = [results.a, results.b].filter(r => r === 'SUCCESS').length;
  expect(successCount).toBeGreaterThanOrEqual(1);
});
```

### 5.3 Zapobieganie deadlock — best practices

```typescript
// Zasada: blokuj zasoby w tej samej kolejności
// ❌ ŹLE: różna kolejność blokowania prowadzi do deadlock
async function transferAtoB(client: Client, from: number, to: number, amount: number) {
  await client.query('BEGIN');
  await client.query('SELECT id FROM accounts WHERE id = $1 FOR UPDATE', [from]);  // Najpierw from
  await client.query('SELECT id FROM accounts WHERE id = $1 FOR UPDATE', [to]);    // Potem to
  // ...
}

// ❌ ŹLE: odwrotna kolejność
async function transferBtoA(client: Client, from: number, to: number, amount: number) {
  await client.query('BEGIN');
  await client.query('SELECT id FROM accounts WHERE id = $1 FOR UPDATE', [to]);    // Najpierw to!
  await client.query('SELECT id FROM accounts WHERE id = $1 FOR UPDATE', [from]);  // Potem from!
  // ...
}

// ✅ DOBRZE: zawsze blokuj w kolejności ID (alfanumerycznej)
async function transferSafe(client: Client, from: number, to: number, amount: number) {
  await client.query('BEGIN');
  
  const [first, second] = from < to ? [from, to] : [to, from];
  await client.query('SELECT id FROM accounts WHERE id = $1 FOR UPDATE', [first]);
  await client.query('SELECT id FROM accounts WHERE id = $1 FOR UPDATE', [second]);
  
  await client.query(
    'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
    [amount, from]
  );
  await client.query(
    'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
    [amount, to]
  );
  
  await client.query('COMMIT');
}
```

---

## 6. Testowanie współbieżności w Playwright

### 6.1 Równoległe żądania HTTP

```typescript
test('tylko jedno zamówienie może kupić ostatni produkt', async ({ request }) => {
  const productId = 42;
  
  // Symulacja dwóch równoległych zamówień
  const [resultA, resultB] = await Promise.allSettled([
    request.post('/api/checkout', {
      data: { productId, quantity: 1, paymentMethod: 'CARD' }
    }),
    request.post('/api/checkout', {
      data: { productId, quantity: 1, paymentMethod: 'CARD' }
    })
  ]);
  
  const statuses = [
    resultA.status === 'fulfilled' ? resultA.value.status() : 500,
    resultB.status === 'fulfilled' ? resultB.value.status() : 500
  ].sort();
  
  console.log(`Statusy odpowiedzi: ${JSON.stringify(statuses)}`);
  
  // Dokładnie jedno zamówienie powiodło się (200), drugie nie (409 Conflict lub 422)
  expect(statuses[0]).toBe(200);
  expect(statuses[1]).toBeGreaterThanOrEqual(400);
});
```

### 6.2 Test z fiksturą bazy danych współbieżnej

```typescript
// tests/concurrency/setup-concurrent-db.ts
export const concurrentDbTest = test.extend<{
  concurrentDb: {
    clients: Client[];
    begin: () => Promise<number>;
    commit: (index: number) => Promise<void>;
    rollback: (index: number) => Promise<void>;
    query: (index: number, sql: string, params?: any[]) => Promise<any>;
  };
}>({
  concurrentDb: async ({}, use) => {
    const clients: Client[] = [];
    
    // Utwórz 10 klientów (symulacja 10 równoległych użytkowników)
    for (let i = 0; i < 10; i++) {
      const client = new Client(dbConfig);
      await client.connect();
      clients.push(client);
    }
    
    const begin = async (index: number) => {
      await clients[index].query('BEGIN');
      return index;
    };
    
    const commit = async (index: number) => {
      await clients[index].query('COMMIT');
    };
    
    const rollback = async (index: number) => {
      await clients[index].query('ROLLBACK');
    };
    
    const query = async (index: number, sql: string, params?: any[]) => {
      return clients[index].query(sql, params);
    };
    
    await use({ clients, begin, commit, rollback, query });
    
    // Cleanup
    for (const client of clients) {
      await client.end();
    }
  },
});

// Użycie w teście
concurrentDbTest('10 użytkowników jednocześnie próbuje zarezerwować 5 miejsc', async ({ concurrentDb }) => {
  const eventId = 1;
  
  // Ustaw początkową liczbę miejsc: 5
  await db.update('events', { available_seats: 5 }, 'id = $1', [eventId]);
  
  // Rozpocznij 10 transakcji
  await Promise.all(
    Array.from({ length: 10 }, (_, i) => concurrentDb.begin(i))
  );
  
  // Wszystkie 10 próbuje zarezerwować 1 miejsce
  const reservationPromises = Array.from({ length: 10 }, async (i) => {
    try {
      const result = await concurrentDb.query(i, `
        UPDATE events 
        SET available_seats = available_seats - 1 
        WHERE id = $1 AND available_seats >= 1
        RETURNING available_seats
      `, [eventId]);
      
      if (result.rowCount > 0) {
        await concurrentDb.commit(i);
        return { index: i, success: true, seats: result.rows[0].available_seats };
      } else {
        await concurrentDb.rollback(i);
        return { index: i, success: false, seats: null };
      }
    } catch (error) {
      await concurrentDb.rollback(i);
      return { index: i, success: false, error };
    }
  });
  
  const results = await Promise.all(reservationPromises);
  
  const successCount = results.filter(r => r.success).length;
  console.log(`Pomyślne rezerwacje: ${successCount}`);
  
  // Dokładnie 5 rezerwacji powiodło się (tyle ile było miejsc)
  expect(successCount).toBe(5);
});
```

---

## 7. Lista kontrolna testów współbieżności

| Scenariusz | Test | Oczekiwany rezultat |
|------------|------|---------------------|
| **Lost Update** | Dwie transakcje czytają i modyfikują ten sam wiersz | Tylko jedna zmiana zachowana |
| **Dirty Read** | Transakcja A czyta niezatwierdzone zmiany B | Zmiany B nie są widoczne |
| **Non-repeatable Read** | Wielokrotny odczyt w ramach transakcji | Zawsze ten sam wynik |
| **Phantom Read** | Transakcja A widzi nowe wiersze wstawione przez B | W REPEATABLE READ i wyższych — niemożliwe |
| **Deadlock** | Transakcje blokują się wzajemnie | System wykrywa i wycofuje jedną |
| **Ostatni produkt** | Dwóch użytkowników kupuje jednocześnie | Dokładnie jedno zamówienie |

---

## Perspektywa Full Stack Testera

Problemy współbieżności należą do najtrudniejszych w testowaniu, ponieważ:
- **Są nieterminowe** — występują losowo, zależnie od timingu
- **Są trudne do odtworzenia** — wymagają specyficznych warunków (obiekt pod ręką, serwer pod dużym obciążeniem)
- **Mają ukryte konsekwencje** — podwójna płatność, ujemny stan magazynowy, utracone dane

Jako Full Stack Tester musisz:
- **Rozumieć poziomy izolacji** i ich wpływ na zachowanie systemu
- **Projektować testy symulujące współbieżność** — równoległe żądania, wielu klientów bazy
- **Znać mechanizmy blokowania** (FOR UPDATE) i wersjonowania (optimistic locking)
- **Weryfikować, że system rozwiązuje konflikty** poprawnie, nie że je ukrywa

Pamiętaj: najlepszy sposób na wykrycie problemów współbieżności to systematyczne testowanie z użyciem fikstur bazodanowych i równoległych żądań HTTP w kontrolowanym środowisku.

---

## Podsumowanie

- **ACID** gwarantuje poprawność transakcji: atomowość, spójność, izolacja, trwałość
- **Rollback** wycofuje całość transakcji; SAVEPOINT pozwala na częściowe wycofanie
- **Poziomy izolacji** (Read Committed, Repeatable Read, Serializable) oferują różne kompromisy między wydajnością a ochroną
- **Lost Update** występuje, gdy dwie transakcje modyfikują dane na podstawie tego samego odczytu
- **FOR UPDATE** (pessimistic locking) blokuje wiersz do aktualizacji
- **Optimistic Locking** (wersjonowanie) wykrywa konflikty przy próbie aktualizacji
- **Deadlock** powstaje, gdy transakcje blokują się wzajemnie; system automatycznie wykrywa i rozwiązuje
- **Playwright + bezpośredni dostęp do bazy** to potężna kombinacja do testowania współbieżności

---

## Linki i źródła

- **[PostgreSQL Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)** — dokumentacja poziomów izolacji w PostgreSQL
- **[PostgreSQL Locking Functions](https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-ADVISORY-LOCKS)** — funkcje blokowania i deadlock detection
- **[SQL Transaction Isolation Levels — Oracle](https://docs.oracle.com/cd/B19306_01/server.102/b14220/consist.htm)** — w глубині o poziomach izolacji
- **[Testing Concurrent Database Operations — Microsoft](https://learn.microsoft.com/en-us/sql/relational-databases/testing-concurrency)** — praktyczne podejście do testowania współbieżności
- **[Optimistic vs Pessimistic Locking — Martin Fowler](https://martinfowler.com/eaaCatalog/optimisticOfflineLock.html)** — wzorce blokowania
- **[Deadlock Detection in Database Systems — IEEE](https://ieeexplore.ieee.org/)** — techniczny artykuł o wykrywaniu deadlock
- **[Concurrency Testing Patterns — ThoughtWorks](https://www.thoughtworks.com/developer-tools)** — wzorce testowania współbieżności
---

## Anomalie izolacji transakcji

W testach współbieżności warto znać klasyczne anomalie:

- dirty read — odczyt niezatwierdzonych danych;
- non-repeatable read — ten sam odczyt zwraca inny wynik w tej samej transakcji;
- phantom read — pojawiają się nowe wiersze spełniające warunek;
- lost update — dwie transakcje nadpisują sobie zmiany.

Testy nie muszą odtwarzać każdej anomalii w UI. Często lepszy jest test integracyjny na poziomie bazy i serwisu.

## Deadlocki

Deadlock pojawia się, gdy transakcje czekają na siebie wzajemnie. W systemach zamówień i płatności może wystąpić przy aktualizacji zasobów w różnej kolejności. Testy współbieżne powinny sprawdzać, czy aplikacja obsługuje retry i nie zostawia częściowego stanu.

## 📘 Suplement Inżynieryjny 2026: SQL i Bazy Danych dla Testerów
*Inspiracja: „Scalable Test Automation with Playwright” (2026), Chapter 7*
*   **Isolation Levels**: Przy testowaniu współbieżności bazy danych (np. deadlocks, warunki wyścigu), upewnij się, że Twoje testy celowo wymuszają i weryfikują zachowanie aplikacji na różnych poziomach izolacji transakcji (Read Committed, Serializable).
