# Nawigacja i stany ładowania — `page.goto`, SPA i oczekiwanie na właściwy stan

Nawigacja w Playwright nie sprowadza się do `page.goto()`. W nowoczesnych aplikacjach webowych część przejść jest klasycznym załadowaniem dokumentu HTML, część odbywa się przez router SPA bez przeładowania strony, część zależy od odpowiedzi API, a część kończy się dopiero wtedy, gdy użytkownik widzi konkretny stan biznesowy. Full Stack Tester musi umieć rozróżnić te sytuacje.

Najważniejsza zasada: nie czekaj na „czas” ani na ogólne poczucie, że strona się załadowała. Czekaj na warunek, który oznacza gotowość scenariusza.

## 1. `page.goto()` — podstawowy mechanizm

```typescript
const response = await page.goto('/dashboard');
expect(response?.ok()).toBeTruthy();
```

Jeżeli w konfiguracji ustawiono `baseURL`, możesz używać ścieżek względnych:

```typescript
await page.goto('/login');
```

To jest lepsze niż pełny adres w każdym teście, bo pozwala przełączać środowiska przez konfigurację:

```typescript
use: {
  baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
}
```

`page.goto()` zwraca odpowiedź głównego dokumentu albo `null` w niektórych przypadkach, np. przy nawigacji do `about:blank`. W testach E2E często warto sprawdzić status odpowiedzi, szczególnie dla stron renderowanych po stronie serwera.

## 2. `waitUntil` — kiedy Playwright uznaje nawigację za zakończoną

```typescript
await page.goto('/products', { waitUntil: 'domcontentloaded' });
```

Najważniejsze wartości:

| `waitUntil` | Znaczenie | Kiedy używać |
|---|---|---|
| `commit` | odpowiedź zaczęła być odbierana | rzadko, dla niskopoziomowej diagnostyki |
| `domcontentloaded` | HTML został sparsowany | szybki start w aplikacjach, gdzie potem i tak czekasz na UI |
| `load` | zdarzenie `load` strony | domyślne, dobre dla klasycznych stron |
| `networkidle` | przez chwilę brak aktywności sieci | używać bardzo ostrożnie |

`networkidle` brzmi kusząco, ale w aplikacjach z analytics, pollingiem, WebSocketami albo odświeżaniem danych może nigdy nie być stabilnym sygnałem. Oficjalna dokumentacja zaleca, aby nie traktować go jako domyślnego sposobu oczekiwania w testach. Lepiej czekać na konkretny element albo odpowiedź API.

## 3. Nawigacja klasyczna vs SPA

W klasycznej stronie kliknięcie linku powoduje załadowanie nowego dokumentu. W SPA kliknięcie może tylko zmienić URL przez History API i wyrenderować inny widok.

Przykład SPA:

```typescript
await page.getByRole('link', { name: 'Ustawienia' }).click();
await expect(page).toHaveURL(/\/settings$/);
await expect(page.getByRole('heading', { name: 'Ustawienia' })).toBeVisible();
```

Ważne: `toHaveURL` mówi, że router zmienił adres. Nie zawsze oznacza, że dane na stronie są gotowe. Dlatego dodaj asercję na widoczny stan użytkownika.

## 4. `waitForURL` i event-first pattern

Jeżeli akcja ma spowodować nawigację, dobrym wzorcem jest rozpoczęcie oczekiwania przed akcją:

```typescript
await Promise.all([
  page.waitForURL('**/order-confirmation'),
  page.getByRole('button', { name: 'Złóż zamówienie' }).click(),
]);

await expect(page.getByText('Dziękujemy za zamówienie')).toBeVisible();
```

Ten pattern ogranicza race condition: test nie przegapi zdarzenia, które wydarzy się bardzo szybko po kliknięciu.

## 5. Oczekiwanie na odpowiedź API

Czasem gotowość strony zależy od konkretnego requestu:

```typescript
const responsePromise = page.waitForResponse(response =>
  response.url().includes('/api/orders') && response.status() === 200
);

await page.goto('/orders');
await responsePromise;

await expect(page.getByRole('heading', { name: 'Moje zamówienia' })).toBeVisible();
```

Nie używaj `waitForResponse` jako zamiennika asercji UI. Najlepszy test często łączy oba elementy: odpowiedź API potwierdza warstwę techniczną, a asercja UI potwierdza rezultat widoczny dla użytkownika.

## 6. Reload, back i forward

Playwright obsługuje historię przeglądarki:

```typescript
await page.reload();
await page.goBack();
await page.goForward();
```

Przykłady zastosowań:

- sprawdzenie, czy formularz zachowuje stan po odświeżeniu;
- test wielokrokowego checkoutu z przyciskiem Wstecz;
- sprawdzenie, czy użytkownik po wylogowaniu nie wróci do panelu przez historię;
- weryfikacja przekierowań po logowaniu.

## 7. Nawigacje i pobieranie plików

Niektóre akcje nie prowadzą do nowej strony, tylko do pobrania pliku. Wtedy użyj event-first pattern:

```typescript
const downloadPromise = page.waitForEvent('download');
await page.getByRole('link', { name: 'Pobierz fakturę' }).click();
const download = await downloadPromise;
await download.saveAs(`downloads/${download.suggestedFilename()}`);
```

Nie oczekuj wtedy zmiany URL, jeśli scenariusz biznesowy oznacza pobranie pliku.

## 8. Obsługa błędów nawigacji

Możesz importować `errors` i rozpoznawać timeout:

```typescript
import { test, expect, errors } from '@playwright/test';

test('dashboard odpowiada', async ({ page }) => {
  try {
    const response = await page.goto('/dashboard', { timeout: 10_000 });
    expect(response?.status()).toBe(200);
  } catch (error) {
    if (error instanceof errors.TimeoutError) {
      throw new Error('Dashboard nie odpowiedział w wymaganym czasie');
    }
    throw error;
  }
});
```

W testach zwykle lepiej pozwolić Playwright zgłosić błąd z trace, ale w testach infrastrukturalnych własny komunikat bywa pomocny.

## 9. Antywzorce

### `waitForTimeout`

```typescript
await page.waitForTimeout(5000); // źle
```

Jeśli aplikacja będzie gotowa po 100 ms, tracisz czas. Jeśli po 5100 ms, test i tak padnie. Czekaj na stan:

```typescript
await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
```

### `networkidle` jako domyślny wait

W aplikacji z ciągłym ruchem sieciowym może prowadzić do losowych timeoutów.

### Sprawdzanie tylko URL

URL może się zmienić, a dane mogą nadal się ładować. Dodaj asercję na treść, tabelę, komunikat albo inny widoczny rezultat.

## 10. Checklista nawigacji

- Czy test używa `baseURL`?
- Czy po `goto` sprawdzasz odpowiedni stan strony?
- Czy w SPA po zmianie URL sprawdzasz także widoczny UI?
- Czy uniknięto `waitForTimeout`?
- Czy event-first pattern jest użyty dla popupów, downloadów i szybkich nawigacji?
- Czy `networkidle` ma konkretne uzasadnienie?
- Czy błędy 404/500 są wykrywane wcześnie, jeśli to ważne dla scenariusza?

## Linki do dokumentacji

- [Navigations](https://playwright.dev/docs/navigations)
- [Pages](https://playwright.dev/docs/pages)
- [Network](https://playwright.dev/docs/network)
- [Downloads](https://playwright.dev/docs/downloads)
- [Assertions](https://playwright.dev/docs/test-assertions)
