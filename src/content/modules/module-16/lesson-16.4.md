# Testowanie komponentów frontendowych (Playwright Component Testing)

Tradycyjne testowanie E2E sprawdza pełną, zintegrowaną aplikację (frontend + backend). Czasami jednak chcemy przetestować pojedyncze, izolowane komponenty interfejsu (np. przycisk, modal, kalendarz, formularz wyszukiwania napisany w React lub Vue) bezpośrednio w **prawdziwej przeglądarce**, ale bez konieczności uruchamiania pełnego serwera API backendu.

**Playwright Component Testing (CT)** to rewolucyjna alternatywa dla bibliotek typu React Testing Library uruchamianych w konsoli (JSDOM). Umożliwia renderowanie i testowanie komponentów w rzeczywistym silniku przeglądarki, gwarantując 100% realizm zachowań.

---

## 1. Architektura Playwright Component Testing (CT)

```
+------------------+                   +--------------------+
|   Vitest / Jest  |                   |   Playwright CT    |
| (JSDOM / Konsola)|                   | (Real Browser Engine) |
+------------------+                   +--------------------+
* Działa w Node.js                     * Działa w prawdziwej przeglądarce
* Brak obsługi CSS/Layout              * Pełna obsługa CSS, renderowania i layoutu
* Emulacja drzewa DOM                  * Prawdziwy silnik Chromium/WebKit/Firefox
```

Playwright CT pod maską uruchamia serwer deweloperski (np. Vite) i kompiluje komponenty w locie, wstrzykując je bezpośrednio do odizolowanej karty przeglądarki.

---

## 2. Implementacja testu komponentu w React

Do testowania komponentów używamy dedykowanego pakietu `@playwright/experimental-ct-react`. Testy posiadają specjalną metodę `mount()`, która fizycznie renderuje komponent w przeglądarce:

```typescript
// src/components/Button.test.tsx
import { test, expect } from '@playwright/experimental-ct-react';
import { Button } from './Button';

test('komponent przycisku reaguje na kliknięcie i zmienia styl', async ({ mount }) => {
  let clicked = false;

  // 1. Wyrenderuj komponent w przeglądarce, przekazując propsy i zdarzenia
  const component = await mount(
    <Button 
      label="Kliknij mnie" 
      onClick={() => { clicked = true; }} 
    />
  );

  // 2. Komponent zwraca standardowy obiekt Locator! Posiada pełną maszynę stanów gotowości.
  await expect(component).toBeVisible();
  await expect(component).toHaveText('Kliknij mnie');

  // 3. Wykonaj fizyczną interakcję w przeglądarce
  await component.click();

  // 4. Zweryfikuj wyzwolenie zdarzenia
  expect(clicked).toBe(true);
});
```

---

## 3. Zalety stosowania Playwright CT
*   **Realizm 100%**: Testujesz zachowanie, style, cienie CSS, kolory, responsywność oraz obsługę klawiatury dokładnie tak, jak zobaczy to użytkownik. JSDOM tego nie potrafi.
*   **Niezwykła prędkość**: Testy komponentowe są odizolowane od sieci i bazy danych, dzięki czemu wykonują się w ułamkach sekund.
*   **Te same lokalizatory**: Używasz tych samych, znanych Ci lokalizatorów semantycznych (`getByRole`, `getByLabel`).

---

## 4. Checklista Testowania Komponentów
- [ ] Czy używasz dedykowanego pakietu eksperymentalnego Playwright CT dla swojego frameworka (React/Vue/Svelte)?
- [ ] Czy do renderowania komponentu stosujesz metodę `mount()`?
- [ ] Czy pamiętasz, że obiekt zwrócony przez `mount()` to standardowy `Locator`, na którym wykonujesz akcje i asercje?
- [ ] Czy weryfikujesz reakcję komponentu na zmiany parametrów wejściowych (props) i zdarzenia wyjściowe?