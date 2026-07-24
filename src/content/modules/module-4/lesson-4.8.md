# Wykonywanie kodu w kontekście przeglądarki (`evaluate` & `clock`)

Podczas pisania testów, czasami zachodzi potrzeba wykonania kodu bezpośrednio w kontekście karty przeglądarki (tak, jakbyśmy wpisali kod bezpośrednio w konsoli deweloperskiej F12). Może to być przydatne do odczytania globalnych zmiennych JS, przetestowania specyficznych metod obiektów frontendowych, a także manipulowania czasem systemowym (mockowanie zegara).

Playwright udostępnia do tego niezwykle elastyczne API: metody `page.evaluate()` oraz nowoczesne API **`page.clock`** do kontroli czasu systemowego.

---

## 1. Wykonywanie kodu na stronie (`page.evaluate`)

Metoda `page.evaluate()` przesyła Twój skrypt TypeScript z procesu Node.js (test runnera) bezpośrednio do silnika JavaScript przeglądarki (np. V8), wykonuje go tam i zwraca wynik z powrotem do testu:

```typescript
import { test, expect } from '@playwright/test';

test('odczytanie parametrów z globalnego obiektu window', async ({ page }) => {
  await page.goto('/');

  // Wykonaj kod bezpośrednio w przeglądarce i pobierz wynik
  const innerWidth = await page.evaluate(() => {
    // Ten kod wykonuje się wewnątrz przeglądarki! Ma dostęp do obiektu window i document.
    return window.innerWidth;
  });

  console.log(`Szerokość okna przeglądarki: ${innerWidth}px`);
  expect(innerWidth).toBeGreaterThan(0);
});
```

### Przekazywanie argumentów do `page.evaluate`
Możesz bezpiecznie przekazywać argumenty ze swojego testu do wnętrza funkcji wykonywanej w przeglądarce. Muszą być one przekazane jako drugi parametr metody `evaluate`:

```typescript
const selector = '.custom-title-element';
const textContent = await page.evaluate((sel) => {
  // Przekazany parametr 'sel' odpowiada wartości zmiennej 'selector'
  return document.querySelector(sel)?.textContent;
}, selector);
```

---

## 2. Mockowanie czasu i zegara systemowego (`page.clock`)

Jeśli Twoja aplikacja posiada funkcjonalności zależne od czasu systemowego (np. wyświetla promocję ważną tylko do północy, automatycznie wylogowuje użytkownika po 15 minutach bezczynności lub renderuje kalendarz), testowanie tych stanów tradycyjnymi metodami jest niemal niemożliwe.

Playwright udostępnia potężne, nowoczesne API **`page.clock`** do całkowitej kontroli czasu systemowego przeglądarki:

```typescript
test('symulacja upływu czasu i automatycznego wylogowania', async ({ page }) => {
  // 1. Zainstaluj wirtualny zegar w przeglądarce i ustaw stałą datę początkową
  await page.clock.install({ time: new Date('2026-07-24T12:00:00Z') });
  
  await page.goto('/dashboard');
  await expect(page.getByText('Sesja aktywna')).toBeVisible();

  // 2. Przyspiesz czas systemowy wirtualnego zegara o 16 minut w przód w ułamku sekundy!
  await page.clock.fastForward('16:00'); // Przesuwa czas o 16 minut

  // 3. Weryfikujemy, czy aplikacja poprawnie zareagowała i automatycznie wylogowała użytkownika
  await expect(page.getByText('Twoja sesja wygasła z powodu bezczynności.')).toBeVisible();
});
```

---

## 3. JSHandle vs ElementHandle

Gdy kod wykonywany w przeglądarce zwraca referencję do surowego obiektu JavaScript lub elementu DOM, którego nie da się łatwo zserializować (przesłać jako tekst JSON), Playwright zwraca dedykowany uchwyt: **`JSHandle`** lub **`ElementHandle`**:

*   `JSHandle`: Uchwyt do dowolnego obiektu w przeglądarce.
*   `ElementHandle`: (Przestarzałe) Uchwyt do elementu DOM. 
*   *Rekomendacja 2026*: Unikaj stosowania `ElementHandle`. Do interakcji z elementami DOM zawsze stosuj nowoczesne, stabilne obiekty **`Locator`**!

---

## 4. Checklista Wykonywania Skryptów
- [ ] Czy pamiętasz, że kod przekazany do `page.evaluate` wykonuje się w silniku przeglądarki, a nie w procesie Node.js Twojego testu?
- [ ] Czy poprawnie przekazujesz argumenty zewnętrzne do funkcji `evaluate` jako dodatkowe parametry wywołania?
- [ ] Czy do testowania procesów zależnych od czasu (sesje, kalendarze, odliczania) wykorzystujesz potężne i stabilne API `page.clock`?
- [ ] Czy unikasz stosowania przestarzałych uchwytów `ElementHandle` na rzecz nowoczesnych obiektów `Locator`?