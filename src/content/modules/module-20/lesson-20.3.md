# Transakcje bazy danych, poziomy izolacji i warunki wyścigu

W systemach wieloużytkownikowych (Multi-user Systems), setki wątków i sesji modyfikują dane w bazie w tym samym czasie. Testowanie integralności danych w warunkach współbieżności to jedno z najtrudniejszych zadań Full Stack Testera. Proste scenariusze sprawdzające pojedyncze zapisy nie wykryją błędów współbieżności, takich jak utracone modyfikacje (**Lost Updates**), odczyty "brudnych" danych (**Dirty Reads**) czy blokady zakleszczające (**Deadlocks**).

W tej lekcji przeanalizujemy pod maską poziomy izolacji transakcji bazy danych (zgodnie ze standardem SQL i implementacją PostgreSQL) oraz nauczymy się projektować testy weryfikujące poprawność współbieżną systemu.

---

## 1. Cztery poziomy izolacji transakcji (SQL Transaction Isolation)

Transakcje w bazach danych muszą spełniać zasady **ACID** (Atomicity, Consistency, Isolation, Durability). Poziom izolacji (**Isolation**) określa, jak bardzo modyfikacje wykonywane przez jedną transakcję są ukryte przed innymi transakcjami działającymi w tym samym czasie.

| Poziom izolacji | Dirty Read | Non-repeatable Read | Phantom Read | Serialization Anomaly |
|---|---|---|---|---|
| **Read Uncommitted** | Dozwolony | Dozwolony | Dozwolony | Dozwolony |
| **Read Committed** (Domyślny) | ❌ Zablokowany | Dozwolony | Dozwolony | Dozwolony |
| **Repeatable Read** | ❌ Zablokowany | ❌ Zablokowany | ❌ Zablokowany | Dozwolony |
| **Serializable** (Najwyższy) | ❌ Zablokowany | ❌ Zablokowany | ❌ Zablokowany | ❌ Zablokowany |

### Charakterystyka anomalii:
*   **Dirty Read (Odczyt Brudny)**: Transakcja A odczytuje dane zmodyfikowane przez transakcję B, zanim transakcja B została zatwierdzona (`COMMIT`). Jeśli transakcja B wycofa zmiany (`ROLLBACK`), transakcja A operuje na nieistniejących danych.
*   **Lost Update (Utracona Modyfikacja)**: Dwie transakcje jednocześnie odczytują ten sam rekord, modyfikują go lokalnie i zapisują. Zapis transakcji B całkowicie nadpisuje i niszczy modyfikacje dokonane przez transakcję A.

---

## 2. Testowanie Utraconej Modyfikacji (Lost Update Test)

Wyobraźmy sobie scenariusz: w magazynie e-commerce została ostatnia sztuka produktu. Dwóch klientów jednocześnie klika przycisk "Kup teraz". Bez odpowiedniego blokowania bazy danych, system może zatwierdzić oba zamówienia, mimo że fizycznie produkt jest tylko jeden (anomalia *Overbooking*).

W testach integracyjnych możemy zasymulować tę sytuację przy użyciu dwóch współbieżnych połączeń do bazy:

```typescript
import { test, expect } from '@playwright/test';
import { DatabaseClient } from '../utils/db';

test('system zapobiega anomalii Lost Update przy zakupie ostatniej sztuki', async () => {
  // 1. Arrange: Inicjalizacja dwóch niezależnych połączeń (klientów) do bazy
  const dbClientA = new DatabaseClient();
  const dbClientB = new DatabaseClient();
  await dbClientA.connect();
  await dbClientB.connect();

  // Ustawienie stanu początkowego magazynu (1 sztuka)
  await dbClientA.query('UPDATE inventory SET stock = 1 WHERE product_id = "prod-99"');

  // 2. Act: Transakcja A rozpoczyna odczyt z blokadą dla modyfikacji (FOR UPDATE)
  await dbClientA.query('BEGIN');
  const stockA = await dbClientA.query('SELECT stock FROM inventory WHERE product_id = "prod-99" FOR UPDATE');

  // Transakcja B próbuje zrobić to samo. Zostanie zablokowana przez silnik bazy, dopóki transakcja A nie zakończy pracy!
  await dbClientB.query('BEGIN');
  
  // Obietnica zapytania B zostanie zawieszona
  const promiseB = dbClientB.query('SELECT stock FROM inventory WHERE product_id = "prod-99" FOR UPDATE');

  // Transakcja A zmniejsza stan i zatwierdza transakcję
  await dbClientA.query('UPDATE inventory SET stock = 0 WHERE product_id = "prod-99"');
  await dbClientA.query('COMMIT');

  // Teraz blokada zostaje zwolniona i zapytanie B zostaje rozwiązane
  const stockB = await promiseB;

  // Transakcja B odczytuje zaktualizowany stan (stock === 0) i musi wycofać operację!
  if (stockB[0].stock < 1) {
    await dbClientB.query('ROLLBACK');
  }

  // 3. Assert: Weryfikacja spójności bazy
  const finalStock = await dbClientA.query('SELECT stock FROM inventory WHERE product_id = "prod-99"');
  expect(finalStock[0].stock).toBe(0); // Brak ujemnego stanu magazynu!

  await dbClientA.disconnect();
  await dbClientB.disconnect();
});
```

---

## 3. Diagnozowanie Blokad Zakleszczających (Deadlocks)

**Deadlock (Zakleszczenie)** zachodzi wtedy, gdy transakcja A blokuje rekord 1 i czeka na zablokowanie rekordu 2, podczas gdy działająca równolegle transakcja B zablokowała już rekord 2 i czeka na rekord 1. Żadna transakcja nie może pójść dalej – powstaje nieskończona pętla oczekiwania.

Nowoczesne relacyjne bazy danych (jak PostgreSQL) posiadają wbudowane detektory zakleszczeń. Wykrywają pętlę, przerywają jedną z transakcji i rzucają wyjątek poziomu kodu aplikacji: `deadlock detected`. Twoje testy integracyjne muszą sprawdzić, czy aplikacja poprawnie przechwytuje ten wyjątek i automatycznie ponawia transakcję (Transaction Retry Pattern).

---

## 4. Checklista Testowania Współbieżności
- [ ] Czy znasz domyślny poziom izolacji transakcji bazy danych swojej aplikacji (np. `Read Committed` w PostgreSQL)?
- [ ] Czy do testowania procesów krytycznych (płatności, stany magazynowe) stosujesz blokowanie jawne (np. `SELECT ... FOR UPDATE`)?
- [ ] Czy projektujesz testy integracyjne z użyciem wielu niezależnych połączeń klienckich w celu symulacji wyścigów stanów?
- [ ] Czy weryfikujesz reakcję aplikacji na błędy zakleszczeń (`deadlock detected`) i upewniasz się, że system bezpiecznie ponawia operację?