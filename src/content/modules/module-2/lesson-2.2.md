# Nawigacja i stany ładowania (Mastering page.goto)

Nawigacja w nowoczesnych aplikacjach webowych (SPA - Single Page Applications) nie jest tak prosta jak w starych stronach HTML. Jako Full Stack Tester musisz rozumieć, kiedy strona jest "naprawdę" gotowa do interakcji.

## 1. page.goto() — Co dzieje się pod maską?

Gdy wywołujesz `await page.goto('https://example.com')`, Playwright czeka na tzw. **load state**.
Domyślnie jest to zdarzenie `load` emitowane przez przeglądarkę, gdy cały HTML oraz wszystkie zasoby (obrazy, skrypty) zostały pobrane.

Możesz jednak kontrolować ten proces za pomocą parametru `waitUntil`:
- `domcontentloaded`: HTML został sparsowany, ale obrazy czy style mogą się jeszcze dociągać. Najszybsza opcja.
- `load`: (Domyślne) Czeka na pełne załadowanie okna.
- `networkidle`: Czeka, aż przez co najmniej 500ms nie będzie żadnych nowych żądań sieciowych. 
    - *Uwaga*: Unikaj `networkidle` w testach komercyjnych, jeśli aplikacja ma ciągły ruch sieciowy (np. polling, analytics), bo test może wisieć aż do timeoutu.

## 2. Obsługa błędów nawigacji

W profesjonalnych testach nie zakładamy, że sieć zawsze działa.
```typescript
try {
  await page.goto('/dashboard', { timeout: 5000, waitUntil: 'domcontentloaded' });
} catch (error) {
  if (error instanceof errors.TimeoutError) {
    console.error("Serwer nie odpowiedział w ciągu 5 sekund!");
  }
}
```

## 3. Nawigacja w aplikacjach React/Vue (SPA)

W aplikacjach SPA kliknięcie w menu często zmienia URL bez przeładowywania strony (używając History API). 
`page.goto` tego nie obsłuży. Wtedy musisz użyć:
- `page.waitForURL('**/settings')`: Czeka, aż URL zmieni się na pasujący do wzorca.
- `page.waitForFunction(() => window.location.pathname === '/success')`: Bardziej zaawansowane sprawdzenie stanu.

## 4. Monitoring odpowiedzi (Response Validation)

Jako Full Stack Tester zawsze sprawdzaj, czy nawigacja zakończyła się sukcesem po stronie serwera:
```typescript
const response = await page.goto('/product/123');
expect(response?.status()).toBe(200);
```
Jeśli serwer rzucił błędem 404 lub 500, test powinien paść natychmiast, zamiast czekać na lokator, którego nie ma.

## 5. Praca z historią i odświeżaniem

- `page.reload()`: Odświeża stronę. Przydatne do testowania stanów utrwalonych w bazie.
- `page.goBack()` / `page.goForward()`: Testowanie nawigacji "Wstecz/Dalej". Krytyczne w aplikacjach z formularzami wielokrokowymi.

## Dobre praktyki i perspektywa QA
- **Unikaj stałych opóźnień**: Nigdy nie pisz `await page.waitForTimeout(3000)`. Zamiast tego poczekaj na konkretny element: `await expect(page.getByText('Witaj')).toBeVisible()`.
- **BaseURL**: Zawsze konfiguruj `baseURL` w `playwright.config.ts`. W testach pisz `await page.goto('/login')` zamiast pełnego adresu. Pozwala to na łatwe przełączanie testów między środowiskami dev, staging i prod.

## Linki do dokumentacji
- [Nawigacja w Playwright](https://playwright.dev/docs/navigations)
- [Obsługa zdarzeń sieciowych](https://playwright.dev/docs/network)
