# Obsługa Ramek (iframes) i Shadow DOM

Współczesne aplikacje webowe często integrują komponenty innych dostawców (np. formularze płatności Stripe, widgety czatów czy mapy Google) za pomocą znaczników `<iframe>` (ramek osadzonych). Dodatkowo, biblioteki komponentów (np. Web Components) ukrywają swoje elementy wewnątrz odizolowanego drzewa **Shadow DOM**.

Zarówno ramki, jak i Shadow DOM stanowią ogromną barierę dla tradycyjnych narzędzi automatyzacji. Playwright udostępnia jednak dedykowane mechanizmy, które pozwalają na bezproblemową interakcję z tymi strukturami.

---

## 1. Anatomia testowania Ramek (`<iframe>`)

Elementy znajdujące się wewnątrz ramki `<iframe>` należą do całkowicie innego dokumentu HTML i nie mogą być zlokalizowane przy użyciu tradycyjnych selektorów poziomu `page`.

Aby zlokalizować element wewnątrz ramki, musimy skorzystać z metody `page.frameLocator()`:

```typescript
import { test, expect } from '@playwright/test';

test('uzupełnienie danych płatności wewnątrz ramki', async ({ page }) => {
  await page.goto('/checkout');

  // 1. Zlokalizuj ramkę za pomocą unikalnego selektora (np. ID lub klasy iframe)
  const paymentFrame = page.frameLocator('iframe#stripe-payment-field');

  // 2. Wykonuj akcje wewnątrz ramki, korzystając ze standardowych lokalizatorów semantycznych!
  await paymentFrame.getByLabel('Card Number').fill('4111 2222 3333 4444');
  await paymentFrame.getByPlaceholder('MM/YY').fill('12/28');
  await paymentFrame.getByPlaceholder('CVC').fill('123');
});
```

---

## 2. Obsługa ramek zagnieżdżonych (Nested Iframes)

Jeśli aplikacja posiada ramkę umieszczoną wewnątrz innej ramki, Playwright pozwala na łańcuchowe wywoływanie lokalizatorów ramek:

```typescript
const nestedFrame = page
  .frameLocator('iframe#outer-frame')
  .frameLocator('iframe#inner-frame');

await nestedFrame.getByRole('button', { name: 'Potwierdź' }).click();
```

---

## 3. Przenikanie Shadow DOM: Natywna rewolucja Playwright

### Czym jest Shadow DOM?
Shadow DOM pozwala na hermetyzację stylów i zachowań komponentów webowych (Web Components). Elementy ukryte pod korzeniem Shadow Root są odizolowane od globalnego drzewa dokumentu, co uniemożliwia ich znalezienie przez tradycyjne zapytania w Selenium czy surowym JavaScript (chyba że deweloper zastosuje specjalne, skomplikowane obejścia).

### Podejście Playwright (Traversing Shadow DOM)
Playwright rewolucjonizuje to podejście: **wszystkie lokalizatory Playwright domyślnie przenikają przez Shadow Roots!**

Nie musisz pisać żadnego dedykowanego kodu. Poniższy lokalizator bez problemu znajdzie element, nawet jeśli jest on głęboko ukryty w strukturze Shadow DOM komponentu:

```typescript
// Playwright natywnie przeszuka korzenie Shadow DOM i kliknie przycisk
await page.locator('my-custom-element').getByRole('button', { name: 'Szukaj' }).click();
```

---

## 4. Checklista Ramek i Shadow DOM
- [ ] Czy do lokalizowania elementów wewnątrz `<iframe>` konsekwentnie stosujesz `page.frameLocator(...)`?
- [ ] Czy pamiętasz, że Playwright domyślnie przenika przez Shadow DOM i nie potrzebujesz do tego żadnych specjalnych flag ani obejść?
- [ ] Czy unikałeś prób bezpośredniego wyszukiwania elementów z iframe na poziomie obiektu `page`?