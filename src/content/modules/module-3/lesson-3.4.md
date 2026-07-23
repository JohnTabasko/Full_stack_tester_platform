# Własne asercje i funkcje pomocnicze

Własne asercje, helpery i matchery pomagają utrzymać duży projekt testowy. Mogą jednak również zaszkodzić, jeśli ukrywają sens testu, mieszają setup z akcjami i asercjami albo tworzą abstrakcje niezrozumiałe dla zespołu. Dobra funkcja pomocnicza nazywa wiedzę domenową. Zła funkcja pomocnicza tylko chowa kod.

Celem tej lekcji jest pokazanie, kiedy tworzyć helper, kiedy custom matcher, jak organizować kod pomocniczy i jak nie stracić diagnostyki w raportach Playwright.

## 1. Po co tworzyć helpery asercji

Jeżeli w wielu testach powtarza się ten sam warunek domenowy, warto go nazwać:

```typescript
export async function expectOrderSummaryToShowPaidStatus(page: Page, orderId: string) {
  const summary = page.getByTestId(`order-summary-${orderId}`);
  await expect(summary.getByText('Status: opłacone')).toBeVisible();
  await expect(summary.getByRole('button', { name: 'Pobierz fakturę' })).toBeEnabled();
}
```

Test staje się czytelniejszy:

```typescript
await expectOrderSummaryToShowPaidStatus(page, order.id);
```

Nazwa helpera mówi, jaki stan domenowy jest oczekiwany.

## 2. Helper nie powinien ukrywać całego testu

Antywzorzec:

```typescript
await doCheckoutAndVerifyEverything(page);
```

Nie wiadomo, jakie dane są tworzone, jakie akcje wykonywane i co właściwie jest sprawdzane. Gdy test padnie, trzeba wejść do helpera i rozplątać kilkanaście kroków.

Lepszy podział:

```typescript
await checkoutPage.addProduct(product.name);
await checkoutPage.submitOrder();
await expectOrderConfirmation(page, orderData);
```

Akcje biznesowe pozostają widoczne, a powtarzalna asercja jest nazwana.

## 3. Asercje domenowe

Asercja domenowa mówi językiem produktu:

- zamówienie jest opłacone;
- użytkownik jest zablokowany;
- faktura jest wystawiona;
- koszyk jest pusty;
- produkt jest niedostępny;
- płatność została odrzucona.

Przykład dla API:

```typescript
export function expectOrderToBePaid(order: unknown) {
  expect(order).toEqual(expect.objectContaining({
    id: expect.any(String),
    status: 'PAID',
    paidAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
  }));
}
```

## 4. Helper z diagnostyką

Dobre helpery mogą dodawać komunikaty:

```typescript
export async function expectToast(page: Page, message: string) {
  await expect(
    page.getByRole('status'),
    `Oczekiwano toast message: ${message}`
  ).toContainText(message);
}
```

W CI taki komunikat jest często szybszy niż analiza całego trace.

## 5. `test.step` wewnątrz helpera

Jeśli helper wykonuje kilka asercji, możesz dodać `test.step`:

```typescript
import { test, expect, type Page } from '@playwright/test';

export async function expectUserProfile(page: Page, user: { name: string; email: string }) {
  await test.step('Weryfikacja profilu użytkownika', async () => {
    await expect(page.getByTestId('user-name')).toHaveText(user.name);
    await expect(page.getByTestId('user-email')).toHaveText(user.email);
  });
}
```

Nie przesadzaj z zagnieżdżeniem kroków. Celem jest czytelny raport, nie drzewo z setką poziomów.

## 6. Custom matchers

Custom matcher ma sens, gdy asercja:

- powtarza się często;
- ma semantykę domenową;
- potrzebuje lepszego komunikatu błędu;
- nie jest tylko cienką nakładką na jeden matcher.

Przykład:

```typescript
import { expect } from '@playwright/test';

expect.extend({
  toBeValidMoneyAmount(received: number) {
    const pass = Number.isInteger(received) && received >= 0;
    return {
      pass,
      message: () => `expected ${received} to be a non-negative integer amount in cents`,
    };
  },
});
```

Użycie:

```typescript
expect(order.totalGrossCents).toBeValidMoneyAmount();
```

W TypeScript trzeba dodatkowo zadeklarować typ matchera, aby edytor i kompilator znały nową metodę.

## 7. Kiedy nie tworzyć custom matchera

Nie twórz matchera dla czegoś, co występuje raz:

```typescript
expect(order.status).toBe('PAID');
```

To jest wystarczająco czytelne. Matcher `toBePaidStatus()` może być nadmiarowy, jeśli nie dodaje diagnostyki ani nie ukrywa złożoności.

## 8. Organizacja kodu pomocniczego

Przykładowa struktura:

```text
tests/
  assertions/
    order.assertions.ts
    user.assertions.ts
    api.assertions.ts
  matchers/
    money.matcher.ts
    date.matcher.ts
  fixtures/
    base-test.ts
  pages/
    CheckoutPage.ts
  clients/
    OrdersClient.ts
  builders/
    orderBuilder.ts
```

Unikaj jednego katalogu `helpers` z plikami `utils.ts`, `helpers2.ts`, `common.ts`. Nazwy powinny mówić, jakiej odpowiedzialności dotyczy plik.

## 9. Helpery UI vs API

Czasem ten sam stan warto sprawdzić na dwóch poziomach:

```typescript
await expectOrderSummaryToShowPaidStatus(page, order.id);

const response = await request.get(`/api/orders/${order.id}`);
const body = await response.json();
expectOrderToBePaid(body);
```

To nie zawsze jest duplikacja. UI potwierdza rezultat widoczny dla użytkownika, API potwierdza stan backendu. W testach krytycznych oba poziomy mogą być uzasadnione.

## 10. Granica między POM a asercją

Page Object może zawierać metody asercji, ale z umiarem:

```typescript
class CheckoutPage {
  async expectSuccess() {
    await expect(this.page.getByText('Dziękujemy za zamówienie')).toBeVisible();
  }
}
```

To jest akceptowalne, jeśli metoda jest domenowa i czytelna. Nie zamieniaj Page Objecta w ogromny zbiór ukrytych asercji. Alternatywą są osobne pliki `*.assertions.ts`.

## 11. Typowanie helperów

Helpery powinny mieć typy domenowe:

```typescript
type Order = {
  id: string;
  status: 'NEW' | 'PAID' | 'CANCELLED';
  totalGrossCents: number;
};

export function expectPaidOrder(order: Order) {
  expect(order.status).toBe('PAID');
  expect(order.totalGrossCents).toBeGreaterThan(0);
}
```

Typy dokumentują kontrakt i ograniczają błędy w testach.

## 12. Antywzorce

- Helper wykonuje setup, akcję i asercje naraz.
- Nazwa helpera jest techniczna, np. `checkData`.
- Helper ukrywa krytyczny warunek testu.
- Custom matcher tylko opakowuje `toBe` bez wartości dodanej.
- Katalog `helpers` staje się śmietnikiem.
- Brak typów dla danych domenowych.
- Helper utrudnia odczyt trace i raportu.

## 13. Checklista helperów i custom assertions

- Czy helper ma jedną odpowiedzialność?
- Czy nazwa mówi językiem domeny?
- Czy awaria helpera daje czytelny komunikat?
- Czy helper nie ukrywa głównego sensu testu?
- Czy custom matcher powtarza się na tyle często, aby miał sens?
- Czy typy wejścia są jawne?
- Czy kod pomocniczy jest podzielony według odpowiedzialności?
- Czy test nadal jest zrozumiały bez wchodzenia do pięciu plików?

## 14. Ćwiczenie

Weź trzy testy, które sprawdzają status zamówienia. Zaprojektuj:

1. helper UI `expectOrderSummaryToShowPaidStatus`;
2. helper API `expectOrderToBePaid`;
3. custom matcher dla kwoty w groszach;
4. strukturę katalogów dla tych helperów;
5. przykład błędu i komunikatu, który powinien zobaczyć tester w CI.

## Linki

- [Assertions](https://playwright.dev/docs/test-assertions)
- [GenericAssertions API](https://playwright.dev/docs/api/class-genericassertions)
- [Extensibility](https://playwright.dev/docs/extensibility)
- [Best practices](https://playwright.dev/docs/best-practices)

## 📘 Suplement Inżynieryjny 2026: Asercje i Weryfikacje (Web-First Assertions)
*Inspiracja: „Practical Playwright Test” (2026), Chapter 6*
*   **Asercje Web-First**: Zawsze używaj asynchronicznych asercji, takich jak `expect(locator).toBeVisible()`. Te asercje automatycznie ponawiają sprawdzenie (poll) przez określony timeout (domyślnie 5s), zapobiegając niestabilności spowodowanej powolnym renderowaniem sieciowym.
*   **Custom Matchers (`expect.extend`)**: Dla zachowania czystości kodu domenowego wyodrębniaj techniczne aserty do niestandardowych metod weryfikujących (np. `expect(page).toBeAuthenticated()`).
