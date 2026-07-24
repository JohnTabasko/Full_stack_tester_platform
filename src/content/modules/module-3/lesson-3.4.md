# Rozszerzanie Expecta i pisanie własnych asercji (Custom Matchers)

W dużych, komercyjnych projektach, testy szybko zaczynają obrastać powtarzalnym i skomplikowanym kodem weryfikacji technicznym. Pisanie kodu takiego jak:
```typescript
const isElementChecked = await page.locator('.terms-box').isChecked();
const title = await page.title();
expect(isElementChecked && title.includes('MyCommerce')).toBe(true);
```
jest antywzorcem. Taki kod jest trudny do czytania, nie ma nazwy domenowej i w razie niepowodzenia rzuca mało czytelny błąd: `Expected true, received false`.

Jean-François Greffier w swojej książce *"Practical Playwright Test" (2026)* zaleca rozszerzanie globalnego obiektu asercji o **własne, silnie otypowane asercje (Custom Expect Matchers)**. Pozwala to na pisanie testów w języku czysto biznesowym i generowanie precyzyjnych komunikatów o błędach w raportach.

---

## 1. Jak rozszerzyć obiekt `expect`? (`expect.extend`)

Niestandardowe asercje definiujemy przy użyciu metody `expect.extend()`. Każdy matcher musi zwracać obiekt zawierający właściwość `pass` (stan logiczny) oraz metodę `message` (funkcja zwracająca sformatowany tekst błędu).

Stwórzmy własny matcher `toBeValidPageTitle`, który sprawdza czy strona zawiera oczekiwaną frazę w tytule:

```typescript
// src/utils/customTest.ts
import { expect as baseExpect, Page } from '@playwright/test';

export const expect = baseExpect.extend({
  /**
   * Niestandardowy matcher weryfikujący poprawność tytułu strony.
   */
  async toBeValidPageTitle(page: Page, expectedTitle: string) {
    const title = await page.title();
    const pass = title.includes(expectedTitle);
    
    return {
      message: () => 
        `Oczekiwano, że tytuł strony "${title}" ${pass ? 'NIE ' : ''}będzie zawierał frazę "${expectedTitle}"`,
      pass,
    };
  },
});
```

---

## 2. Rejestracja typów TypeScript (Declaration Merging)

Aby kompilator TypeScript rozumiał naszą nową asercję i podpowiadał ją w edytorze (IntelliSense), musimy rozszerzyć globalny interfejs `PlaywrightTest.Matchers`:

```typescript
declare global {
  namespace PlaywrightTest {
    interface Matchers<R, T> {
      toBeValidPageTitle(expectedTitle: string): Promise<R>;
    }
  }
}
```

---

## 3. Wykorzystanie własnej asercji w testach

Teraz w plikach testowych nie importujemy surowego `expect` z `@playwright/test`, lecz nasz rozszerzony obiekt z pliku `customTest`:

```typescript
import { test } from '@playwright/test';
import { expect } from '../src/utils/customTest'; // Import rozszerzonego expect

test('logowanie z poprawnym tytułem', async ({ page }) => {
  await page.goto('/login');
  
  // Niezwykle elegancka, biznesowa asercja o wysokiej wartości diagnostycznej!
  await expect(page).toBeValidPageTitle('Zaloguj się do konta');
});
```

---

## 4. Dodawanie komunikatów do standardowych asercji

Jeśli nie chcesz pisać pełnego custom matchera, ale zależy Ci na czytelnym komunikacie o błędzie w raporcie CI, Playwright Test pozwala przekazać niestandardowy komunikat jako drugi parametr wywołania metody `expect()`:

```typescript
await expect(
  page.locator('.user-welcome-msg'),
  'Brak powitania zalogowanego użytkownika na pulpicie głównym!'
).toBeVisible();
```

---

## 5. Checklista Własnych Asercji
- [ ] Czy powtarzalne, skomplikowane technicznie asercje wyodrębniłeś do dedykowanych metod za pomocą `expect.extend()`?
- [ ] Czy rozszerzyłeś interfejs `PlaywrightTest.Matchers`, aby zapewnić pełne wsparcie typów i IntelliSense?
- [ ] Czy metoda `message` w Twoim custom matcherze obsługuje poprawnie stan zanegowany (obsługuje sytuację, gdy `pass === true`)?
- [ ] Czy do krytycznych asercji biznesowych dodajesz niestandardowe komunikaty tekstowe w parametrach wywołania?