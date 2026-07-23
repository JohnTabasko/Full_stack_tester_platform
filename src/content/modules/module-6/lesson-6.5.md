# Dobre praktyki i antywzorce POM

Page Object Model ma zmniejszać koszt utrzymania testów. Nie gwarantuje jakości sam z siebie. Zły POM potrafi być gorszy niż brak POM: ukrywa kruche selektory, tworzy ogromne klasy, miesza UI z API i sprawia, że test przestaje być czytelny.

Ta lekcja zbiera praktyki, które chronią projekt Playwright przed typowymi problemami architektury POM.

## 1. Testuj zachowanie, nie implementację

Metody Page Objecta powinny mówić językiem użytkownika lub domeny:

```typescript
await loginPage.loginAs(user);
await checkoutPage.submitOrder();
await ordersPage.expectOrderStatus(order.id, 'Opłacone');
```

Słabszy styl:

```typescript
await loginPage.fillEmail(user.email);
await loginPage.fillPassword(user.password);
await loginPage.clickBlueButton();
```

Nie każda techniczna akcja zasługuje na publiczną metodę. Publiczne API Page Objecta powinno opisywać intencję.

## 2. Prywatne locatory, publiczne zachowania

```typescript
class LoginPage {
  private readonly emailInput = this.page.getByLabel('Email');
  private readonly passwordInput = this.page.getByLabel('Hasło');
  private readonly submitButton = this.page.getByRole('button', { name: 'Zaloguj' });

  constructor(private readonly page: Page) {}

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

Jeśli wystawisz locatory publicznie, testy zaczną klikać w szczegóły implementacji i POM przestanie chronić przed zmianami.

## 3. Locator-first POM

POM nie może być miejscem, w którym chowasz złe selektory. Preferuj:

- `getByRole`;
- `getByLabel`;
- `getByText`;
- `getByTestId` dla elementów technicznych;
- `filter` i locatory zagnieżdżone.

Unikaj:

```typescript
this.saveButton = page.locator('.container > div:nth-child(3) button');
```

To nadal jest kruche, nawet jeśli ukryte w klasie.

## 4. God Object

Antywzorzec:

```typescript
class AppPage {
  async login() {}
  async searchProduct() {}
  async payInvoice() {}
  async changePassword() {}
  async manageUsers() {}
  async exportReports() {}
}
```

Lepszy podział:

```typescript
class LoginPage {}
class ProductSearchPage {}
class InvoicesPage {}
class UserSettingsPage {}
class AdminUsersPage {}
class ReportsPage {}
```

Jedna klasa powinna mieć jedną odpowiedzialność.

## 5. Ukrywanie asercji

Asercje w Page Objectach są dopuszczalne, jeśli są domenowe i czytelne:

```typescript
await ordersPage.expectOrderStatus(order.id, 'Opłacone');
```

Problem zaczyna się, gdy metoda akcji ukrywa wiele asercji bez nazwy:

```typescript
await checkoutPage.submitOrder(); // w środku 10 asercji, API check i cleanup
```

Jeśli metoda ma ważną asercję, nazwij ją jawnie: `submitOrderAndExpectSuccess` albo rozdziel akcję od oczekiwania.

## 6. Mieszanie UI, API i danych

Page Object powinien obsługiwać UI. Klient API powinien obsługiwać API. Builder powinien budować dane.

Zły kierunek:

```typescript
class OrdersPage {
  async createOrderInDatabase() {}
  async callAdminApi() {}
  async clickOrderRow() {}
}
```

Lepszy:

```typescript
const order = await ordersClient.createOrder(buildOrder());
await ordersPage.open(order.id);
await ordersPage.expectOrderVisible(order.id);
```

## 7. Refaktoryzacja POM

Nie projektuj ogromnej architektury na zapas. Refaktoryzuj, gdy widzisz:

- powtarzalne locatory;
- powtarzalne flow;
- klasę powyżej kilkuset linii;
- metody o wielu odpowiedzialnościach;
- trudne code review;
- testy, których nie da się zrozumieć bez debugowania.

## 8. Antywzorce — szybka lista

- Publiczne locatory.
- God Object.
- `BasePage` jako śmietnik.
- CSS/XPath ukryte w POM bez powodu.
- Metody typu `clickButton1`.
- Brak `expectLoaded`.
- Akcje bez asercji rezultatu.
- Page Object wykonujący requesty API.
- Helpery ukrywające cały scenariusz.
- Dziedziczenie tam, gdzie lepsza jest kompozycja.

## 9. Checklista review POM

- Czy nazwa klasy odpowiada ekranowi lub komponentowi?
- Czy publiczne metody mówią językiem domeny?
- Czy locatory są stabilne i semantyczne?
- Czy klasa ma jedną odpowiedzialność?
- Czy asercje są jawne i diagnostyczne?
- Czy API/setup danych nie trafiły do Page Objecta?
- Czy test po refaktorze jest bardziej czytelny niż przed?
- Czy awaria wskazuje konkretną stronę, komponent albo stan?

## Linki

- [Page Object Models](https://playwright.dev/docs/pom)
- [Best practices](https://playwright.dev/docs/best-practices)
- [Locators](https://playwright.dev/docs/locators)
- [Fixtures](https://playwright.dev/docs/test-fixtures)

## 10. Antywzorzec: POM ukrywa złe oczekiwania

Jeśli metoda `expectLoaded()` sprawdza tylko, że `body` jest widoczne, to niczego nie dowodzi. Warunek gotowości powinien być charakterystyczny dla strony:

```typescript
await expect(page.getByRole('heading', { name: 'Zamówienia' })).toBeVisible();
await expect(page.getByRole('table', { name: 'Lista zamówień' })).toBeVisible();
```

## 11. Antywzorzec: POM z asercjami technicznymi bez języka domeny

Metoda `checkElement()` mówi mniej niż `expectOrderStatus(orderId, 'Opłacone')`. Dobra nazwa zmniejsza potrzebę otwierania implementacji.

## 12. Refaktoryzacja bez zmiany testu

Dobry POM pozwala zmienić lokator bez zmiany testów. Jeśli każda zmiana UI wymaga edycji wielu speców, abstrakcja nie spełnia zadania. Jeśli każda zmiana scenariusza wymaga edycji wielu Page Objectów, abstrakcja jest zbyt sztywna.

## 13. Checklista antywzorców POM

- Czy klasa ma więcej niż jedną odpowiedzialność?
- Czy publiczne metody są techniczne zamiast domenowe?
- Czy Page Object wykonuje requesty API?
- Czy locatory są semantyczne?
- Czy test jest czytelny bez znajomości implementacji POM?

## 14. Antywzorzec: dziedziczenie wszystkiego

Głęboka hierarchia `BasePage -> AuthenticatedPage -> AdminPage -> AdminOrdersPage` często komplikuje projekt. Kompozycja komponentów i fixtures jest zwykle prostsza. Dziedziczenie zostaw dla naprawdę wspólnego cyklu życia.

## 15. Antywzorzec: asercje ukryte w akcjach

Metoda `clickSave()` nie powinna po cichu wykonywać pięciu asercji biznesowych. Jeśli metoda sprawdza rezultat, nazwij ją `saveAndExpectSuccess()` albo rozdziel akcję od asercji.

## 16. Antywzorzec: POM bez testów review

Page Object też jest kodem. Review powinno sprawdzać nazwy metod, locatory, odpowiedzialność, typy i diagnostykę. Zły POM jest kopiowany tak samo szybko jak zły test.

## 17. Zasada końcowa

POM ma chronić test przed przypadkowymi zmianami UI, ale nie może ukrywać sensu scenariusza. Czytelność testu jest ważniejsza niż elegancja wzorca.

## 📘 Suplement Inżynieryjny 2026: Wzorzec Obiektu Strony (Page Object Factory)
*Inspiracja: „Scalable Test Automation with Playwright” (2026), Chapter 3*
*   **PageObject Factory**: Zastąp bezpośrednią instancjację `new LoginPage(page)` za pomocą fabryki `PageFactory`. Zapobiega to kruchości testów – przy zmianie konstruktora klasy strony poprawiasz wyłącznie kod fabryki.
*   **Metoda Szablonowa (Template Method)**: Definiuj szkielet procesów (np. nawigacji i sprawdzania błędów 500) w abstrakcyjnej klasie bazowej `BasePage`.
