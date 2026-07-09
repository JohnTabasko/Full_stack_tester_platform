# Równoległość, workers i sharding — szybkie testy bez utraty izolacji

Playwright Test został zaprojektowany z myślą o równoległym uruchamianiu testów. To jedna z jego największych przewag nad starszymi rozwiązaniami. Równoległość może skrócić wykonanie suite z godziny do kilkunastu minut, ale tylko wtedy, gdy testy są niezależne, dane są izolowane, a środowisko potrafi obsłużyć obciążenie.

Ta lekcja pokazuje, jak działa równoległość w Playwright, czym są workers, kiedy używać `fullyParallel`, jak działa `serial`, jak dzielić testy na shardy w CI i jak unikać flakiness wynikającego ze współdzielonego stanu.

## 1. Model wykonania Playwright

Playwright uruchamia testy w procesach zwanych workerami. Worker to osobny proces Node.js, który wykonuje część testów. Każdy test dostaje izolowane fixtures test-zakresd, np. `page` i `context`.

Domyślnie Playwright wykonuje pliki testowe równolegle. Testy wewnątrz jednego pliku zwykle wykonują się po kolei, chyba że włączysz pełną równoległość.

```bash
npx playwright test
```

Liczbę workerów można ustawić w konfiguracji:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  workers: process.env.CI ? 4 : undefined,
});
```

Można też sterować tym z CLI:

```bash
npx playwright test --workers=4
```

## 2. Izolacja jako warunek równoległości

Równoległość jest bezpieczna tylko wtedy, gdy testy nie zależą od siebie. Każdy test powinien móc przejść samodzielnie, w dowolnej kolejności i równolegle z innymi.

Złe założenie:

```typescript
test('tworzy produkt', async ({ page }) => {
  await page.goto('/admin/products');
  await page.getByRole('button', { name: 'Dodaj' }).click();
  await page.getByLabel('Nazwa').fill('Laptop');
  await page.getByRole('button', { name: 'Zapisz' }).click();
});

test('usuwa produkt', async ({ page }) => {
  await page.goto('/admin/products');
  await page.getByText('Laptop').click();
  await page.getByRole('button', { name: 'Usuń' }).click();
});
```

Drugi test zakłada, że pierwszy wykonał się wcześniej. To antywzorzec.

Lepsze podejście:

```typescript
test('usuwa produkt', async ({ page, request }) => {
  const productName = `Laptop ${Date.now()}`;
  await request.post('/api/products', { data: { name: productName } });

  await page.goto('/admin/products');
  await page.getByText(productName).click();
  await page.getByRole('button', { name: 'Usuń' }).click();
  await expect(page.getByText(productName)).toBeHidden();
});
```

Test sam przygotowuje stan, którego potrzebuje.

## 3. `fullyParallel`

Opcja `fullyParallel` pozwala uruchamiać równolegle również testy z tego samego pliku.

```typescript
export default defineConfig({
  fullyParallel: true,
});
```

Można ją ustawić również na poziomie projektu:

```typescript
export default defineConfig({
  projects: [
    { name: 'chromium', fullyParallel: true },
  ],
});
```

Używaj `fullyParallel`, gdy testy są naprawdę niezależne. Jeśli plik zawiera wspólne zmienne mutowane przez testy, pełna równoległość ujawni błędy architektury.

## 4. `test.describe.configure()`

Na poziomie grupy testów można ustawić tryb wykonania.

```typescript
import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test.describe('wyszukiwarka', () => {
  test('szuka po nazwie', async ({ page }) => {});
  test('szuka po kategorii', async ({ page }) => {});
});
```

Dostępne tryby:

- `default` — standardowe zachowanie;
- `parallel` — testy w grupie mogą działać równolegle;
- `serial` — testy działają po kolei i po awarii kolejne mogą zostać pominięte.

`serial` traktuj jako wyjątek. Najczęściej oznacza, że testy są zbyt zależne od siebie. Są jednak sytuacje uzasadnione, np. bardzo kosztowny end-to-end flow demonstracyjny albo test migracji, którego nie da się łatwo rozdzielić.

```typescript
test.describe.configure({ mode: 'serial' });
```

## 5. Workers a dane testowe

Playwright udostępnia `testInfo.workerIndex` oraz `testInfo.parallelIndex`, które pomagają izolować dane.

```typescript
import { test, expect } from '@playwright/test';

test('konto przypisane do workera', async ({ page }, testInfo) => {
  const email = `test-user-${testInfo.parallelIndex}@example.com`;
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
});
```

W fixture worker-zakresd można przypisać osobne konto dla każdego workera:

```typescript
export const test = base.extend<{}, { account: { email: string; password: string } }>({
  account: [async ({}, use, workerInfo) => {
    await use({
      email: `worker-${workerInfo.parallelIndex}@example.com`,
      password: 'Secret123!',
    });
  }, { zakres: 'worker' }],
});
```

To przydatne, gdy logowanie przez UI jest kosztowne albo gdy backend ogranicza liczbę sesji jednego użytkownika.

## 6. Równoległość a uwierzytelnianie

Najczęstszy problem: wszystkie testy używają tego samego konta. Wtedy test A zmienia ustawienia profilu, test B oczekuje domyślnego profilu, a test C usuwa dane potrzebne testowi A.

Bezpieczne strategie:

1. osobne konto per worker;
2. osobne konto per test;
3. osobny tenant/organizacja per suite;
4. dane z unikalnym `runId`;
5. cleanup po teście albo po całym runie;
6. testy read-only na wspólnym koncie tylko wtedy, gdy niczego nie modyfikują.

## 7. Sharding — podział suite między maszyny CI

Workers przyspieszają testy na jednej maszynie. Sharding dzieli testy między kilka maszyn.

```bash
npx playwright test --shard=1/4
npx playwright test --shard=2/4
npx playwright test --shard=3/4
npx playwright test --shard=4/4
```

Każdy shard wykonuje część testów. W CI uruchamia się je jako matrix job.

Przykład GitHub Actions:

```yaml
strategy:
  fail-fast: false
  matrix:
    shard: [1, 2, 3, 4]

steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with:
      node-version: 22
  - run: npm ci
  - run: npx playwright install --with-deps
  - run: npx playwright test --shard=${{ matrix.shard }}/4
  - uses: actions/upload-artifact@v4
    if: always()
    with:
      name: playwright-report-${{ matrix.shard }}
      path: playwright-report
```

Ważne: raporty, trace, screenshoty i video z każdego sharda muszą zostać zapisane jako osobne artefakty albo scalone w późniejszym kroku.

## 8. Równoległość a zasoby środowiska

Więcej workerów nie zawsze znaczy szybciej. Jeśli środowisko testowe ma słaby backend, wolną bazę albo limity API, zbyt duża równoległość zwiększy flakiness.

Objawy przeciążenia:

- losowe timeouty;
- błędy 429/503;
- testy przechodzą lokalnie, ale padają w CI;
- długie czasy odpowiedzi API;
- problemy z cleanupem danych.

Dobra praktyka: mierz czas suite dla różnych wartości `workers` i wybierz punkt, w którym przyrost szybkości nie powoduje niestabilności.

## 9. Retry a równoległość

Retry pomaga zebrać diagnostykę i rozróżnić test stale padający od flaky testu, ale nie naprawia przyczyny.

```typescript
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  use: {
    trace: 'on-first-retry',
  },
});
```

Jeśli test przechodzi dopiero za drugim razem, traktuj to jako sygnał długu technicznego. Analizuj trace i sprawdź, czy problemem jest brak izolacji, zły wait, konflikt danych albo przeciążone środowisko.

## 10. Typowe antywzorce

### Wspólne zmienne globalne

```typescript
let orderId: string;

test('tworzy zamówienie', async ({ request }) => {
  orderId = await createOrder(request);
});

test('opłaca zamówienie', async ({ request }) => {
  await payOrder(request, orderId);
});
```

To nie działa poprawnie przy równoległości. Dane powinny być tworzone wewnątrz testu albo fixture.

### Jeden użytkownik admin do wszystkiego

Wspólne konto admina jest wygodne, ale bardzo ryzykowne dla testów modyfikujących stan.

### `serial` jako plaster na flakiness

Jeśli testy działają tylko w trybie `serial`, to często znak, że nie mają własnego setupu.

### Zbyt duża liczba workerów

Jeśli backend nie wyrabia, zmniejsz workers albo popraw środowisko.

## 11. Checklista bezpiecznej równoległości

- Czy każdy test tworzy własny stan albo korzysta z read-only danych?
- Czy testy mogą działać w dowolnej kolejności?
- Czy nie ma globalnych zmiennych mutowanych przez testy?
- Czy użytkownicy testowi są izolowani per test, worker albo tenant?
- Czy cleanup działa również po awarii?
- Czy `fullyParallel` jest włączone tylko dla niezależnych testów?
- Czy `serial` ma konkretne uzasadnienie?
- Czy liczba workerów jest dobrana do wydajności środowiska?
- Czy shardy zapisują artefakty diagnostyczne?

## 12. Ćwiczenie praktyczne

Masz suite checkoutu, która trwa 40 minut i używa jednego konta `admin@example.com`. Zaprojektuj refaktor:

1. osobne konto per worker;
2. unikalny koszyk per test;
3. setup produktu przez API;
4. cleanup zamówień po `runId`;
5. uruchomienie w 4 workerach lokalnie;
6. podział na 4 shardy w CI;
7. zapis trace tylko przy retry.

## Linki

- [Playwright Parallelism](https://playwright.dev/docs/test-parallel)
- [Playwright Sharding](https://playwright.dev/docs/test-sharding)
- [Playwright Retries](https://playwright.dev/docs/test-retries)
- [Playwright Fixtures](https://playwright.dev/docs/test-fixtures)
- [Playwright CI](https://playwright.dev/docs/ci)
