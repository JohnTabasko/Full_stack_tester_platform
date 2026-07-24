# Podstawy testów regresji wizualnej (Visual Comparisons)

Tradycyjne testy funkcjonalne sprawdzają zachowanie systemu (np. "czy element został zapisany w bazie", "czy koszyk ma właściwą liczbę"). Nie potrafią jednak zweryfikować wyglądu ani poprawności układu graficznego (Layout). Element może być w pełni klikalny dla bota testowego, ale dla prawdziwego użytkownika być całkowicie niewidoczny (np. z powodu czarnego tekstu na czarnym tle lub przesunięcia poza krawędź ekranu na telefonie).

**Testy regresji wizualnej (Visual Comparisons)** wypełniają tę lukę, porównując zrzuty ekranu aplikacji ze złotymi wzorcami (Golden Snapshots) zapisanymi na dysku.

---

## 1. Tworzenie i aktualizacja Golden Snapshots

Podczas pierwszego uruchomienia asercji wizualnej `toHaveScreenshot()` na nowym widoku:

```typescript
import { test, expect } from '@playwright/test';

test('estetyka widoku karty płatniczej', async ({ page }) => {
  await page.goto('/payment');
  
  // Pierwsze wykonanie zapisze aktualny zrzut na dysku jako homepage-baseline.png
  await expect(page.locator('.payment-card-container')).toHaveScreenshot('payment-card-baseline.png');
});
```

Test zakończy się niepowodzeniem za pierwszym razem z informacją, że plik wzorca nie istniał i został właśnie utworzony. Każde kolejne uruchomienie tego testu będzie wykonywać nowy zrzut ekranu w locie i porównywać go piksel po pikselu z zapisanym plikiem `payment-card-baseline.png`.

Gdy celowo zmienisz szatę graficzną na aplikacji, zaktualizujesz pliki wzorców za pomocą flagi:
```bash
npx playwright test --update-snapshots
```

---

## 2. Maskowanie elementów zmiennych (Masking)

Testy wizualne bywają niestabilne w dynamicznych sekcjach (np. tam, gdzie wyświetlana jest losowa reklama, imię zalogowanego użytkownika lub stale odliczający czas zegar).

Playwright pozwala na **maskowanie** tych sekcji. Przed wykonaniem zrzutu ekranu, wskazane elementy są zakrywane jednolitym prostokątem (`magenta`), co sprawia, że ich zawartość jest całkowicie ignorowana przez silnik porównujący:

```typescript
await expect(page).toHaveScreenshot('dashboard.png', {
  mask: [
    page.locator('.live-clock'),
    page.locator('.user-avatar-name'),
    page.locator('iframe.external-advertisement')
  ]
});
```

---

## 3. Próg Tolerancji Pikseli (`maxDiffPixelRatio`)

Ponieważ renderowanie czcionek (antyaliasing) i cieni różni się minimalnie w zależności od systemu operacyjnego, testy wizualne mogą zgłaszać fałszywe błędy (np. 0.05% różnic subpikselowych).

Możemy skonfigurować dopuszczalny próg błędu bezpośrednio w asercji:

```typescript
await expect(page.locator('.header-banner')).toHaveScreenshot('header.png', {
  // Pozwól na różnicę maksymalnie 1.5% pikseli na całym zrzucie
  maxDiffPixelRatio: 0.015,
  threshold: 0.2, // tolerancja na minimalne odchylenia kolorów pikseli
});
```

---

## 4. Checklista Podstaw Testów Wizualnych
- [ ] Czy zmaskowałeś wszystkie sekcje dynamiczne (zegary, imiona, reklamy) przy użyciu opcji `mask`?
- [ ] Czy do weryfikacji całych stron stosujesz odpowiednie progi tolerancji (`maxDiffPixelRatio`)?
- [ ] Czy wiesz, jak zaktualizować bazę zrzutów po celowej zmianie graficznej na frontendzie?