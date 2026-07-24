# Migracje schematów, seedowanie i higiena bazy danych

W profesjonalnych projektach oprogramowania, struktura bazy danych (schemat) nie jest stała – stale ewoluuje pod wpływem nowych wymagań biznesowych. Zmiany te są zapisywane w postaci plików migracji wersjonowanych w systemie Git (za pomocą narzędzi takich jak **Flyway** lub **Liquibase**).

Jako Full Stack Tester, musisz dbać o **higienę bazy danych (Test Database Hygiene)**. Testy automatyczne, które pozostawiają po sobie "brudne" dane w bazie (lub usuwają rekordy wymagane przez inne testy), natychmiast wywołują kaskadowe awarie w rurociągach CI/CD.

---

## 1. Techniki czyszczenia bazy danych (Database Cleanup Strategies)

Każdy test musi rozpoczynać się w czystym, przewidywalnym środowisku. Wyróżniamy trzy główne strategie czyszczenia bazy przed lub po testach:

### Strategia A: Truncate / Delete (Czyszczenie tabel)
Czyszczenie zawartości tabel za pomocą polecenia `TRUNCATE` przed każdym testem.
*   **Zalety**: Bardzo proste i gwarantuje 100% czystości.
*   **Wady**: Powolne. Czyszczenie kilkudziesięciu tabel przed każdym testem E2E spowalnia cały pakiet. Ponadto usuwa słowniki (np. listy krajów, stałe role), które są wymagane do działania systemu.

### Strategia B: Transakcyjny Rollback (Transaction Rollback - Najszybsza)
Wszystkie operacje i zapytania testu są wykonywane wewnątrz jednej transakcji bazy danych. Na koniec testu (w fazie Teardown) wywołujemy komendę `ROLLBACK` zamiast `COMMIT`.
*   **Zalety**: Ekstremalnie szybka (trwa milisekundy), brak jakichkolwiek śladów w bazie na dysku.
*   **Wady**: Nie pozwala testować asynchronicznych procesów backendowych (które działają w osobnych procesach i nie widzą niezatwierdzonej transakcji testu).

### Strategia C: Sprzątanie selektywne po identyfikatorze sesji (`run_id`)
Testy tworzą dane, dodając do unikalnych pól (np. nazwisk, e-maili) unikalny identyfikator uruchomienia testu (`run_id` lub UUID). Po zakończeniu testu (lub na koniec rurociągu), usuwamy wyłącznie te rekordy, które posiadają dany identyfikator:

```typescript
import { test, expect } from '@playwright/test';
import { DatabaseClient } from '../utils/db';
import { v4 as uuidv4 } from 'uuid';

test.describe('Zarządzanie produktami', () => {
  let db: DatabaseClient;
  let testRunId: string;

  test.beforeAll(async () => {
    db = new DatabaseClient();
    await db.connect();
    testRunId = uuidv4(); // Wygeneruj unikalny ID dla tego uruchomienia testów
  });

  test('dodanie unikalnego produktu', async ({ page }) => {
    const productName = `Buty-sportowe-${testRunId}`;

    await page.goto('/admin/products');
    await page.getByLabel('Nazwa produktu').fill(productName);
    await page.getByRole('button', { name: 'Zapisz' }).click();

    // Weryfikacja w bazie
    const product = await db.query('SELECT * FROM products WHERE name = $1', [productName]);
    expect(product.length).toBe(1);
  });

  test.afterAll(async () => {
    // Teardown: Selektywne usunięcie danych wygenerowanych w tym runie, bez dotykania danych innych deweloperów!
    await db.query('DELETE FROM products WHERE name LIKE $1', [`%${testRunId}`]);
    await db.disconnect();
  });
});
```

---

## 2. Seedowanie Danych (Data Seeding)

**Seedowanie** to proces zasilania bazy danych minimalnym zestawem danych wymaganych do działania aplikacji (np. stworzenie konta administratora, dodanie stałych kategorii produktowych).
*   **Zasada skali**: Seed bazy wykonuj **tylko raz na poziomie całego uruchomienia suite** (w global-setup w konfiguracji), a nie przed każdym testem. Do testowania unikalnych scenariuszy używaj dynamicznych generatorów (Faker) wewnątrz testów.

---

## 3. Checklista Higieny Bazy Danych
- [ ] Czy Twój projekt testowy automatycznie dba o przywrócenie stanu bazy do czystości po zakończeniu testu (Teardown)?
- [ ] Czy unikasz czyszczenia słowników systemowych przy użyciu ogólnych poleceń `TRUNCATE`?
- [ ] Czy stosujesz unikalne identyfikatory (UUID/Timestamp) do oznaczania i selektywnego usuwania wygenerowanych rekordów?
- [ ] Czy proces seedowania bazy danych jest wydzielony do jednorazowego etapu przed uruchomieniem testów (Global Setup)?