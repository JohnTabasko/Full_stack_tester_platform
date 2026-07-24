# Anatomia testu Playwright i techniki debugowania

Napisanie testu to nie tylko ułożenie sekwencji kliknięć. Jako Full Stack Tester musisz rozumieć strukturę testu, cykl życia hooków, mechanikę asercji Web-First oraz posiadać zaawansowane umiejętności diagnozowania błędów przy użyciu nowoczesnych narzędzi, takich jak Tryb UI, Trace Viewer czy Inspector.

W tej lekcji przeanalizujemy od podszewki anatomię testu Playwright, wdrożymy wzorzec AAA oraz poznamy profesjonalne techniki debugowania kodu.

---

## 1. Anatomia kodu testu i wzorzec AAA

Każdy dobrze zaprojektowany test automatyczny powinien realizować klasyczny wzorzec inżynierii testów: **AAA (Arrange, Act, Assert)**:

1.  **Arrange (Przygotuj)**: Przygotowanie środowiska, kont użytkowników, bazy danych oraz nawigacja do punktu początkowego.
2.  **Act (Działaj)**: Wykonanie akcji biznesowych (np. dodanie produktu do koszyka, wypełnienie formularza).
3.  **Assert (Zweryfikuj)**: Sprawdzenie stanu aplikacji przy użyciu asercji (np. czy pojawił się komunikat o sukcesie).

Przeanalizujmy ten wzorzec w kodzie:

```typescript
import { test, expect } from '@playwright/test';

// test.describe służy do grupowania powiązanych testów (Logical Suite)
test.describe('Zarządzanie koszykiem zakupowym', () => {

  test('użytkownik może dodać produkt do koszyka', async ({ page }) => {
    // 1. ARRANGE (Przygotowanie i Nawigacja)
    await page.goto('/products');
    
    // 2. ACT (Wykonanie interakcji)
    const productCard = page.locator('.product-card').first();
    await productCard.getByRole('button', { name: 'Dodaj do koszyka' }).click();
    
    // 3. ASSERT (Weryfikacja Web-First)
    const cartBadge = page.locator('.cart-badge');
    await expect(cartBadge).toHaveText('1');
  });

});
```

---

## 2. Cykl życia testu i rola Hooków (Hooks Lifecycle)

Hooki pozwalają na wykonywanie powtarzalnego kodu przygotowania i sprzątania w kontrolowanych punktach cyklu życia testu.

*   `beforeAll` / `afterAll`: Uruchamiane **dokładnie raz** na poziomie całego pliku (lub grupy `describe`), przed rozpoczęciem pierwszego i po zakończeniu ostatniego testu. Są powiązane z cyklem życia **workera**.
*   `beforeEach` / `afterEach`: Uruchamiane **przed i po każdym pojedynczym teście**. Są powiązane z cyklem życia **testu**.

### Sekwencja wykonywania (Lifecycle Timeline):
```text
[Worker Thread Starts]
   └── beforeAll
         ├── beforeEach (Test 1) -> TEST 1 (Act) -> afterEach (Test 1)
         ├── beforeEach (Test 2) -> TEST 2 (Act) -> afterEach (Test 2)
   └── afterAll
[Worker Thread Exits]
```

---

## 3. Mechanika Asercji Web-First (Auto-Polling)

Asercje w Playwright są tak stabilne, ponieważ działają na zasadzie **Web-First**:
*   Asercja nie sprawdza stanu aplikacji tylko raz. W tle uruchamia **pętlę ponowień (polling loop)**.
*   Jeśli element nie jest jeszcze widoczny, asercja automatycznie czeka i ponawia sprawdzenie co kilkanaście milisekund, aż do momentu upływu limitu czasu (`expect.timeout` – domyślnie 5s).
*   Eliminuje to potrzebę pisania twardo kodowanych opóźnień (`page.waitForTimeout()`).

```typescript
// Asercja Web-First (Stabilna, automatycznie ponawia sprawdzenie)
await expect(page.locator('.alert-success')).toBeVisible();

// Asercja tradycyjna (Krucha, sprawdza stan tylko raz i natychmiast rzuca błąd)
const isVisible = await page.locator('.alert-success').isVisible();
expect(isVisible).toBe(true); // Antywzorzec!
```

---

## 4. Zaawansowane narzędzia debugowania

Gdy test nie przechodzi w rurociągu CI, lub chcesz prześledzić zachowanie lokalnie, Playwright udostępnia trzy potężne narzędzia diagnostyczne.

### A. Interaktywny Tryb UI (UI Mode)
To wizualne centrum dowodzenia Playwrightem, uruchamiane komendą:
```bash
npx playwright test --ui
```
*   **Time-Travel**: Możesz klikać na kolejne kroki testu i na własne oczy zobaczyć stan renderowania strony (DOM) w ułamku sekundy, w którym dana akcja została wykonana.
*   **Locator Explorer**: Możesz wpisywać i testować na żywo lokatory, sprawdzając, ile elementów na stronie pasuje do wpisanego wzorca.
*   **Network Tab**: Pokazuje historię wszystkich zapytań sieciowych (API, grafiki, skrypty) wykonanych podczas testu.

### B. Playwright Inspector (Visual Debugger)
Uruchamiany przez flagę `--debug` lub włożenie instrukcji `await page.pause()` bezpośrednio do kodu:
```bash
npx playwright test --debug
```
*   Pozwala na wykonywanie testu linijka po linijce (Step Over).
*   Podświetla aktywne elementy i wskazuje powody, dla których dana akcja czeka na spełnienie warunków (np. czekanie, aż element będzie włączony).

### C. Analiza śladów (Trace Viewer)
Trace to kompletne, spakowane archiwum z przebiegu testu, zapisywane najczęściej w CI w pliku `.zip`. Można je otworzyć lokalnie komendą:
```bash
npx playwright show-trace path/to/trace.zip
```
Zawiera ono pełne odwzorowanie stanu przeglądarki, sieci, logów konsoli oraz zrzutów ekranu i pozwala bezbłędnie zrekonstruować przyczynę awarii na maszynie CI bez konieczności lokalnego uruchamiania testów.

---

## 5. Checklista Diagnostyczna Testu
- [ ] Czy Twój test realizuje strukturę AAA (Arrange, Act, Assert)?
- [ ] Czy do weryfikacji stanów UI stosujesz wyłącznie asynchroniczne asercje Web-First (z użyciem `await expect`)?
- [ ] Czy całkowicie wyeliminowałeś instrukcje `page.waitForTimeout` z kodu?
- [ ] Czy w przypadku awarii w CI potrafisz pobrać i przeanalizować plik Trace w Trace Viewerze?
