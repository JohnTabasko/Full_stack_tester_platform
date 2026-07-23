# Testy regresji wizualnej i zarządzanie baseline

> **Perspektywa Full Stack Testera**
> Test funkcjonalny mówi "czy element istnieje i czy można go kliknąć". Test wizualny mówi "czy element wygląda prawidłowo i czy użytkownik go rozpozna". Różnica jest krytyczna: przycisk może być klikalny, ale jednocześnie znajdować się poza widocznym obszarem, być przesłonięty przez inną warstwę albo mieć biały tekst na białym tle. Te problemy functional tests zignorują. 

Wdrażając automatyczną weryfikację wizualną, musimy uważać na tzw. „szum” (false positives) generowany przez dynamiczny content. Faraz Kelhini i Butch Mayhew w książce *"Hands-On Automated Testing with Playwright" (2026)* szczegółowo tłumaczą, jak konfigurować progi tolerancji oraz maskować dynamiczne sekcje.

---

## 1. Tworzenie Złotego Zrzutu (Golden Snapshot Baseline)

Podczas pierwszego uruchomienia testu wizualnego z metodą `toHaveScreenshot()`, Playwright nie ma z czym porównać widoku, więc automatycznie zapisuje bieżący zrzut na dysku jako **Golden Snapshot** (złoty wzorzec):

```typescript
import { test, expect } from '@playwright/test';

test('strona główna sklepu - weryfikacja wizualna', async ({ page }) => {
  await page.goto('/');
  
  // Pierwsze wywołanie stworzy plik wzorca. Kolejne będą do niego porównywać.
  await expect(page).toHaveScreenshot('homepage-baseline.png');
});
```

Aby zaktualizować złote wzorce po celowej zmianie designu na aplikacji, uruchamiamy testy z flagą `--update-snapshots`:
```bash
npx playwright test --update-snapshots
```

---

## 2. Maskowanie Dynamicznej Zawartości (Masking)

Najczęstszą przyczyną czerwonych (fałszywie negatywnych) testów wizualnych są dynamiczne dane: zmieniające się daty, losowe liczby zamówień, imiona użytkowników, reklamy, avatary czy animacje GIF.

Playwright umożliwia **maskowanie** tych elementów. Podczas robienia zrzutu, wskazane elementy są zakrywane jednolitym, różowym prostokątem (`magenta`), co sprawia, że ich dynamiczna zawartość jest ignorowana przez algorytm porównujący:

```typescript
test('szczegóły profilu z maskowaniem elementów dynamicznych', async ({ page }) => {
  await page.goto('/profile');

  await expect(page).toHaveScreenshot('profile-view.png', {
    // Ukryj datę logowania, imię użytkownika i baner reklamowy
    mask: [
      page.locator('.user-last-login-date'),
      page.locator('.username-heading'),
      page.locator('.google-ads-container')
    ],
  });
});
```

---

## 3. Konfigurowanie Progów Tolerancji (Thresholds)

Przeglądarki renderują czcionki i cienie minimalnie inaczej na systemach Linux (maszyny CI), Windows czy macOS. Bez odpowiedniej konfiguracji progów tolerancji, testy wizualne przechodzące lokalnie będą stale wywalać się w CI.

Playwright udostępnia trzy parametry konfiguracyjne do precyzyjnej kontroli czułości algorytmu porównującego piksele:
1.  **`threshold`** (od 0 do 1) – czułość porównania kolorów pojedynczego piksela. Domyślnie 0.2. Im mniejsza wartość, tym surowsza asercja.
2.  **`maxDiffPixels`** – dopuszczalna liczba pikseli, które mogą się różnić na całym zrzucie.
3.  **`maxDiffPixelRatio`** (od 0 do 1) – dopuszczalny procentowy stosunek odmiennych pikseli do rozmiaru całego zrzutu (np. `0.02` pozwala na 2% zmian).

```typescript
test('weryfikacja kasy z elastycznym progiem tolerancji', async ({ page }) => {
  await page.goto('/checkout');

  await expect(page).toHaveScreenshot('checkout-layout.png', {
    // Pozwól na minimalne przesunięcia subpikselowe (np. cieni czcionek w CI)
    threshold: 0.25,
    // Pozwól na różnicę maksymalnie 1.5% pikseli na całym ekranie
    maxDiffPixelRatio: 0.015,
  });
});
```

Możesz te wartości zdefiniować również globalnie w pliku `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01, // Domyślnie 1% tolerancji dla wszystkich testów wizualnych
    },
  },
});
```

---

## 4. Checklista Testów Wizualnych
- [ ] Czy zrzuty ekranu wykonywane w CI są generowane na tym samym systemie operacyjnym (zalecany Docker)?
- [ ] Czy zmaskowałeś wszystkie elementy dynamiczne (daty, loga partnerów, reklamy) za pomocą opcji `mask`?
- [ ] Czy ustawiłeś optymalne parametry tolerancji (`maxDiffPixelRatio` / `maxDiffPixels`), aby uniknąć błędów związanych z antyaliasingiem czcionek w różnych przeglądarkach?
- [ ] Czy przed skanowaniem zatrzymałeś wszystkie dynamiczne animacje CSS lub odtwarzacze wideo?

---

## Bibliografia i Linki
*   *Faraz K. Kelhini & Butch Mayhew, Hands-On Automated Testing with Playwright (2026), Chapter 10: Setting Up Visual Regression Testing*
*   [Oficjalna Dokumentacja Playwright Visual Comparisons](https://playwright.dev/docs/visual-comparisons)
