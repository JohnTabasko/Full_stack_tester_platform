# Testy wizualne i regresja (Pixel-Perfect Testing)

Jako Full Stack Tester wiesz, że kod może być poprawny, ale interfejs może być "rozjechany" (np. przycisk nachodzi na tekst). Testy funkcjonalne tego nie wyłapią. Rozwiązaniem jest **Visual Regression Testing**.

## 1. Zrzuty ekranu (Screenshots)

Playwright pozwala na robienie zdjęć w różnych formatach:
- `page.screenshot({ path: 'full-page.png', fullPage: true })`: Cała przewijana strona.
- `locator.screenshot({ path: 'element.png' })`: Tylko konkretny komponent (np. nagłówek).

## 2. Asercja toHaveScreenshot()

To serce testów wizualnych. Playwright porównuje aktualny zrzut z **obrazem bazowym (baseline)**.
```typescript
await expect(page).toHaveScreenshot('landing-page.png');
```
Przy pierwszym uruchomieniu test padnie, ponieważ Playwright nie ma jeszcze obrazu wzorcowego. Stworzy go automatycznie w katalogu `*.spec.ts-snapshots`. Przy kolejnych uruchomieniach będzie porównywał obraz piksel po pikselu.

## 3. Problemy w projektach komercyjnych (Kluczowa wiedza!)

### Problem 1: Różnice między systemami (OS Differences)
Ten sam przycisk wyrenderowany na macOS będzie wyglądał inaczej niż na Windowsie lub Linuksie (inne wygładzanie czcionek).
**Rozwiązanie**: Uruchamiaj testy wizualne w **Dockerze**. Dzięki temu zarówno programista na Macu, jak i system CI na Linuksie używają tego samego środowiska.

### Problem 2: Dynamiczne dane (Daty, ID)
Zrzut ekranu padnie, jeśli na stronie wyświetla się aktualna data lub losowe ID.
**Rozwiązanie**: Maskowanie elementów.
```typescript
await expect(page).toHaveScreenshot({
  mask: [page.getByTestId('current-date')]
});
```

## 4. Tolerancja (Threshold)

Możesz pozwolić na minimalne różnice w kolorach (np. wynikające z kompresji obrazu):
```typescript
await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });
// lub
await expect(page).toHaveScreenshot({ threshold: 0.2 });
```

## 5. Aktualizacja obrazów bazowych

Jeśli celowo zmieniłeś layout aplikacji, musisz zaktualizować obrazy wzorcowe komendą:
```bash
npx playwright test --update-snapshots
```

## Perspektywa Ekspercka
Testy wizualne są drogie w utrzymaniu. Nie rób screenshotów całej strony dla każdego testu. Skup się na:
- Komponentach UI (Design System).
- Stronach krytycznych biznesowo (np. strona płatności).
- Raportach PDF generowanych przez aplikację.

## Linki
- [Visual Comparisons in Playwright](https://playwright.dev/docs/test-snapshots)
