# Testowanie dostępności (WCAG & Axe) — profesjonalny przewodnik

> **Perspektywa Full Stack Testera**
> Internet jest dla wszystkich. Osoby z niepełnosprawnościami wzroku, słuchu, motorycznymi lub poznawczymi polegają na technologiach asystujących (czytniki ekranu, powiększacze), aby korzystać z aplikacji webowych. Jako Full Stack Tester masz nie tylko etyczny, ale także prawny obowiązek zapewnienia, że Twoja aplikacja jest dostępna. Standard WCAG (Web Content Accessibility Guidelines) definiuje kryteria dostępności, a narzędzia takie jak Axe automatyzują wykrywanie wielu błędów.

Jednak ślepe skanowanie całej strony za pomocą Axe często prowadzi do szumów (false positives) – np. z powodu dynamicznych widgetów czatów zewnętrznych dostawców, na które nie mamy wpływu. W książce *"Hands-On Automated Testing with Playwright" (2026)*, Faraz Kelhini i Butch Mayhew uczą, jak precyzyjnie **ograniczać zakres skanowania** oraz definiować **własne zestawy reguł** WCAG.

---

## 1. Precyzyjne ograniczanie zakresu skanowania (Scoping)

W dużych aplikacjach rzadko testujemy całą stronę na raz. Zamiast tego powinniśmy ograniczyć badanie Axe wyłącznie do testowanego komponentu, wykluczając elementy zewnętrzne (np. osadzone mapy Google, widgety mediów społecznościowych):

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('dostępność koszyka zakupowego bez widgetów zewnętrznych', async ({ page }) => {
  await page.goto('/cart');

  // Skonfiguruj skaner Axe
  const results = await new AxeBuilder({ page })
    // Skanuj tylko kontener koszyka
    .include('.cart-container')
    // Wyklucz problematyczny formularz płatności zewnętrznego dostawcy (np. Stripe/PayPal)
    .exclude('.external-payment-frame')
    .analyze();

  // Asercja na brak błędów krytycznych
  expect(results.violations).toEqual([]);
});
```

---

## 2. Konfiguracja reguł i poziomów zgodności WCAG

Możemy precyzyjnie kontrolować, które reguły i kryteria sukcesu standardu WCAG (2.0, 2.1, 2.2 na poziomach A, AA lub AAA) mają zostać poddane analizie:

```typescript
test('audyt dostępności zgodnie z WCAG 2.1 AA', async ({ page }) => {
  await page.goto('/contact');

  const results = await new AxeBuilder({ page })
    // Skup się wyłącznie na regułach WCAG 2.1 AA
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    // Możesz również wyłączyć wybraną, specyficzną regułę, jeśli projekt jej nie wspiera
    .disableRules(['color-contrast'])
    .analyze();

  expect(results.violations).toEqual([]);
});
```

---

## 3. Dołączanie raportów z błędami do raportów HTML (Axe + testInfo.attach)

Gdy test dostępności nie przejdzie, suchy komunikat błędu nie pomoże programiście zlokalizować usterki. Najlepszą praktyką inżynieryjną z 2026 r. jest dołączenie pełnego raportu Axe w formacie JSON oraz sformatowanej tabeli z naruszeniami bezpośrednio do raportu HTML testu:

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('zaawansowany audyt z załącznikiem diagnostycznym', async ({ page }, testInfo) => {
  await page.goto('/profile');

  const results = await new AxeBuilder({ page }).analyze();

  if (results.violations.length > 0) {
    // Dołącz raport z naruszeniami w formacie JSON do testu
    await testInfo.attach('axe-violations-report', {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json',
    });
  }

  expect(results.violations).toEqual([]);
});
```

---

## 4. Checklista Audytu Dostępności
- [ ] Czy skanowanie Axe jest ograniczone do obszarów, nad którymi Twój zespół deweloperski ma pełną kontrolę (`include` / `exclude`)?
- [ ] Czy testujesz zgodność z właściwą wersją WCAG (np. `wcag21aa`) za pomocą tagów?
- [ ] Czy dołączasz sformatowane naruszenia do raportu testowego za pomocą `testInfo.attach()` w przypadku błędu?
- [ ] Czy pamiętasz, że automatyczne testy Axe wykrywają jedynie ok. 30-40% błędów dostępności i powinny być uzupełniane ręczną nawigacją klawiaturą (Tab/Shift+Tab)?

---

## Bibliografia i Linki
*   *Faraz K. Kelhini & Butch Mayhew, Hands-On Automated Testing with Playwright (2026), Chapter 9: Accessibility Testing with Playwright and axe-core*
*   [Oficjalna dokumentacja Axe-core Playwright](https://github.com/dequelabs/axe-core-playwright)
