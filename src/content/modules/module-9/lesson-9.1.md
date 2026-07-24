# Narzędzia i strategie debugowania testów w Playwright

Diagnozowanie przyczyn awarii w testach E2E (End-to-End) bywa niezwykle frustrujące, zwłaszcza gdy błędy występują sporadycznie i są trudne do powtórzenia na maszynie dewelopera. Tradycyjne narzędzia automatyzacji zmuszały inżynierów QA do ręcznego przeglądania surowych logów tekstowych lub wstawiania niesławnych opóźnień (`sleep`).

Playwright Test redefiniuje ten proces, udostępniając **zbiór nowoczesnych narzędzi wizualnych** – od interaktywnego **Trybu UI (UI Mode)**, poprzez **Playwright Inspector**, aż po unikalny **Trace Viewer**. W tej lekcji opanujesz te narzędzia do poziomu eksperckiego.

---

## 1. Interaktywny Tryb UI (UI Mode): Centrum Dowodzenia

Tryb UI to zintegrowane, graficzne środowisko deweloperskie dla Twoich testów, uruchamiane komendą:
```bash
npx playwright test --ui
```

### Kluczowe funkcjonalności UI Mode (Mastering UI Mode):
*   **Wizualne podróżowanie w czasie (Time-Travel Debugging)**: Możesz najechać myszką na dowolny krok w historii wykonania testu (po lewej stronie), a Playwright wyrenderuje pełny zrzut drzewa DOM (Before, Action, After) dokładnie z ułamka milisekundy, w którym akcja została wykonana. Możesz badać kod HTML wyrenderowanej strony w locie!
*   **Locator Explorer (Kreator Lokalizatorów)**: Kliknij przycisk "Pick Locator" i najedź na dowolny element na stronie. Playwright automatycznie zaproponuje najstabilniejszy lokalizator semantyczny (zgodnie z hierarchią dostępności) i pozwoli skopiować go do schowka.
*   **Zakładka Network (Analiza Sieci)**: Pokazuje pełną historię wszystkich żądań sieciowych HTTP wywołanych przez frontend podczas testu, ułatwiając wykrywanie powolnych lub uszkodzonych zapytań API.

---

## 2. Playwright Inspector: Debugowanie Krok po Kroku

Jeśli chcesz zatrzymać test w konkretnym punkcie i przeanalizować stan zmiennych lub ręcznie przetestować zapytania w konsoli, możesz wywołać **Playwright Inspector**:

```typescript
import { test, expect } from '@playwright/test';

test('debugowanie koszyka', async ({ page }) => {
  await page.goto('/cart');

  // Wstawienie pauzy zatrzyma przeglądarkę i otworzy Inspector
  await page.pause();

  await page.getByRole('button', { name: 'Kup teraz' }).click();
});
```

Możesz również uruchomić cały zestaw testów w trybie debugowania bezpośrednio z terminala:
```bash
npx playwright test --debug
```

W tym trybie testy będą wykonywać się niezwykle powoli, a każda kolejna akcja będzie wymagała kliknięcia przycisku "Step Over" w oknie Inspektora.

---

## 3. Trace Viewer: Czarna Skrzynka Twoich testów w CI

Gdy test wywala się na odizolowanej maszynie rurociągu CI/CD, nie masz dostępu do fizycznego ekranu przeglądarki. Twoim najważniejszym dowodem jest plik **Trace** (zapis śladów).

Plik `.zip` wygenerowany przez CI możesz otworzyć lokalnie komendą:
```bash
npx playwright show-trace path/to/trace.zip
```

### Co zawiera plik Trace?
1.  **Pełne nagranie wideo** oraz zrzuty ekranu dla każdego wykonanego kroku.
2.  **Pełne drzewo DOM**: Możesz badać strukturę HTML strony i najeżdżać na elementy dokładnie tak, jak w działającej przeglądarce.
3.  **Logi konsoli przeglądarki**: Wykryjesz błędy JavaScript rzucane przez frontend.
4.  **Pełen panel sieciowy (Network Log)**: Zobaczysz kody statusów, nagłówki oraz ciała zapytań i odpowiedzi (Request/Response) dla każdego zapytania HTTP.

---

## 4. Checklista Debugowania
- [ ] Czy w przypadku trudnych błędów lokalnych korzystasz z zalet podróży w czasie (Time-Travel) w Trybie UI (`--ui`)?
- [ ] Czy stosujesz instrukcję `await page.pause()` zamiast długich, ręcznych sleepów?
- [ ] Czy skonfigurowałeś rurociąg CI/CD tak, aby automatycznie zapisywał i udostępniał pliki Trace w przypadku błędu (`trace: 'on-first-retry'`)?
- [ ] Czy potrafisz czytać logi sieciowe w Trace Viewerze w celu wykluczenia awarii po stronie backendu?