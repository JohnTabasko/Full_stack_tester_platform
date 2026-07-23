# Stabilność i niezawodność testów

Stabilny test daje ten sam wynik dla tego samego kodu i kontrolowanego stanu. Jeśli test czasem przechodzi, a czasem pada, zespół przestaje ufać automatyzacji. Flaky test to nie „urok E2E”, tylko defekt procesu: danych, synchronizacji, środowiska, produktu albo kodu testowego.

## 1. Deterministyczność

Test deterministyczny ma:

- jawny stan początkowy;
- izolowane dane;
- stabilne locatory;
- asercje na znaczący stan;
- brak zależności od kolejności innych testów;
- kontrolowane zależności zewnętrzne.

Jeżeli wynik zależy od aktualnej godziny, resztek danych albo kolejności testów, test nie jest deterministyczny.

## 2. Niezależność testów

Antywzorzec:

```typescript
test('tworzy produkt', async () => {});
test('usuwa produkt utworzony wcześniej', async () => {});
```

Każdy test powinien sam przygotować stan:

```typescript
test('usuwa produkt', async ({ request, page }) => {
  const product = await createProduct(request, buildProduct());
  await page.goto('/admin/products');
  await page.getByRole('row').filter({ hasText: product.name }).getByRole('button', { name: 'Usuń' }).click();
  await expect(page.getByText(product.name)).toBeHidden();
});
```

## 3. Izolacja danych i workerów

Przy równoległości najczęstszy problem to wspólne konto albo wspólny rekord. Używaj:

- danych per test;
- kont per worker;
- `runId`;
- `testInfo.parallelIndex`;
- cleanup po runie.

```typescript
const email = `qa+${testInfo.parallelIndex}-${crypto.randomUUID()}@example.test`;
```

## 4. Race condition

Race condition pojawia się, gdy test wykonuje akcję zanim aplikacja osiągnie właściwy stan albo gdy zdarzenie dzieje się zanim test zacznie na nie czekać.

Dla popupów, downloadów i response używaj event-first pattern:

```typescript
const responsePromise = page.waitForResponse('**/api/orders');
await page.getByRole('button', { name: 'Odśwież' }).click();
await responsePromise;
```

## 5. Retry jako narzędzie obserwacji

Konfiguracja:

```typescript
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  use: {
    trace: 'on-first-retry',
  },
});
```

Retry nie naprawia testu. Jeśli test przeszedł po retry, powinien zostać oznaczony jako flaky i przeanalizowany.

## 6. Mockowanie z umiarem

Mock stabilizuje test, ale może ukryć błąd integracji. Dobra strategia:

- smoke E2E na prawdziwych integracjach;
- mocki dla trudnych błędów 500/403/timeout;
- mocki dla zewnętrznych usług niestabilnych;
- kontrakty API dla granic systemów.

Nie mockuj wszystkiego w testach, które mają dawać zaufanie do całego systemu.

## 7. Quarantine flaky tests

Jeśli test blokuje pipeline, można go tymczasowo oznaczyć, ale z zasadami:

- ticket naprawczy;
- właściciel;
- data przeglądu;
- trace i dowody;
- usunięcie tagu po naprawie.

`@flaky` bez procesu staje się cmentarzem testów.

## 8. Checklista stabilności

- Czy test działa samodzielnie?
- Czy dane są unikalne?
- Czy nie ma `waitForTimeout`?
- Czy event-first pattern jest użyty tam, gdzie trzeba?
- Czy retry jest analizowane?
- Czy mocki nie ukrywają krytycznej integracji?
- Czy test zostawia artefakty diagnostyczne?

## Linki

- [Best practices](https://playwright.dev/docs/best-practices)
- [Parallelism](https://playwright.dev/docs/test-parallel)
- [Retries](https://playwright.dev/docs/test-retries)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)

## 9. Stabilność przez konfigurację artefaktów

Dobra konfiguracja pomaga analizować flaky tests:

```typescript
use: {
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```

`on-first-retry` jest szczególnie przydatne, bo zbiera dowody właśnie wtedy, gdy test zachowuje się niestabilnie.

## 10. Stabilność środowiska

Nie każdy flaky test jest winą testu. Monitoruj:

- 5xx backendu;
- czas odpowiedzi API;
- błędy bazy;
- limity rate limiting;
- brak zasobów CI;
- wersje przeglądarek;
- różnice danych między środowiskami.

Stabilność automatyzacji jest wspólną odpowiedzialnością QA, Dev i DevOps.

## 11. Stabilność locatorów

Flakiness często wynika z locatorów, które pasują do przypadkowych elementów. Preferuj:

```typescript
page.getByRole('button', { name: 'Zapisz' })
page.getByRole('row').filter({ hasText: orderId })
page.getByLabel('Adres e-mail')
```

Unikaj locatorów zależnych od pozycji, np. `nth(2)`, jeśli możesz zawęzić przez dane biznesowe.

## 12. Stabilność czasu

Testy zależne od aktualnej daty lub godziny bywają niestabilne. Używaj kontrolowanego czasu, danych testowych albo Playwright Clock tam, gdzie ma to sens.

```typescript
await page.clock.install({ time: new Date('2026-07-09T10:00:00Z') });
```

## 13. Stabilność przez mniejszy zakres

Im więcej systemów dotyka jeden test, tym więcej potencjalnych przyczyn awarii. Krytyczne E2E są potrzebne, ale wiele wariantów lepiej pokryć przez API, komponenty lub testy kontraktowe. Mniejszy zakres to często większa stabilność i lepsza diagnostyka.

## 14. Stabilność danych auth

Wiele flaky tests wynika z wygasłego lub współdzielonego `storageState`. Jeśli testy autoryzowane padają losowo, sprawdź:

- czy setup project odświeża sesję;
- czy plik `.auth` nie jest commitowany;
- czy role mają osobne konta;
- czy równoległe testy nie zmieniają ustawień tego samego użytkownika;
- czy sessionStorage nie jest używane w sposób nieobsługiwany przez standardowe `storageState`.

## 15. Stabilność przez health checks

Przed pełną regresją warto sprawdzić środowisko:

```typescript
const health = await request.get('/api/health');
await expect(health).toBeOK();
```

Jeśli środowisko nie jest gotowe, lepiej przerwać pipeline jasnym komunikatem niż wygenerować 100 fałszywych awarii UI.

## 16. Stabilność a dane produkcyjnopodobne

Dane produkcyjnopodobne są wartościowe, ale muszą być kontrolowane. Losowa próbka zanonimizowanych danych może ujawnić realne edge case, ale jeśli zmienia się codziennie, testy mogą stać się niereprodukowalne. Łącz realizm z deterministycznością: snapshot danych, seed, wersja datasetu i opis w raporcie.

## 17. Zasada końcowa

Stabilność nie oznacza, że test nigdy nie pada. Stabilność oznacza, że test pada z właściwego powodu, zostawia dowody i daje ten sam wynik dla tego samego stanu systemu.

## 📘 Suplement Inżynieryjny 2026: Debugowanie i Rozwiązywanie Problemów
*Inspiracja: „Hands-On Automated Testing with Playwright” (2026), Chapter 8*
*   **Diagnostyka Trace Viewer**: W przypadku awarii w CI, plik trace jest Twoim najważniejszym dowodem. Zawiera nagranie DOM, historię sieci, logi konsoli przeglądarki oraz zrzuty ekranu przed i po każdej akcji.
*   **UI Mode**: Wykorzystaj interaktywny tryb UI (`npx playwright test --ui`) do błyskawicznego pisania, debugowania i podróżowania w czasie (time-travel) w kodzie testów.
