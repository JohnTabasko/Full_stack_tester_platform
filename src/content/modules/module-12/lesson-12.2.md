# Zaawansowane wzorce obiektu strony

Page Object Model jest użyteczny tylko wtedy, gdy zmniejsza koszt zmiany i poprawia czytelność testu. Zaawansowane wzorce POM nie są celem samym w sobie. W Playwright szczególnie ważne jest podejście locator-first: Page Object powinien korzystać z locatorów Playwright, web-first assertions i metod domenowych, a nie ukrywać kruche CSS/XPath.

## 1. Locator-first POM

```typescript
export class LoginPage {
  constructor(private readonly page: Page) {}

  private readonly email = this.page.getByLabel('Email');
  private readonly password = this.page.getByLabel('Hasło');
  private readonly submit = this.page.getByRole('button', { name: 'Zaloguj' });

  async login(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
```

Nie ukrywaj w POM złych selektorów:

```typescript
page.locator('.container > div:nth-child(3) button') // źle
```

## 2. Komponenty zamiast ogromnych stron

Strona może składać się z komponentów:

```typescript
export class DashboardPage {
  readonly header = new HeaderComponent(this.page.getByRole('banner'));
  readonly orders = new OrdersTable(this.page.getByTestId('orders-table'));

  constructor(private readonly page: Page) {}
}
```

Komponent powinien mieć root locator i szukać elementów tylko wewnątrz niego.

## 3. Journey pattern

Journey jest przydatne, gdy proces przechodzi przez kilka stron:

```typescript
export class CheckoutJourney {
  constructor(
    private readonly product: ProductPage,
    private readonly cart: CartPage,
    private readonly checkout: CheckoutPage,
  ) {}

  async buy(productName: string) {
    await this.product.open(productName);
    await this.product.addToCart();
    await this.cart.proceedToCheckout();
    await this.checkout.submitOrder();
  }
}
```

Nie używaj journey, jeśli ukrywa główny sens testu.

## 4. Service Objects

Setup przez API trzymaj poza Page Objectem:

```typescript
const order = await ordersClient.createOrder(buildOrder());
await ordersPage.open(order.id);
await ordersPage.expectOrderVisible(order.id);
```

Page Object obsługuje UI. API Client obsługuje API. Builder buduje dane.

## 5. Checklista

- Czy Page Object ma jedną odpowiedzialność?
- Czy publiczne metody mówią językiem domeny?
- Czy locatory są semantyczne?
- Czy komponent ma root locator?
- Czy API nie trafiło do Page Objecta?
- Czy test po abstrakcji jest bardziej czytelny?

## Linki

- [Page Object Models](https://playwright.dev/docs/pom)
- [Fixtures](https://playwright.dev/docs/test-fixtures)
- [Best practices](https://playwright.dev/docs/best-practices)

## 6. Fixtures jako granica architektury

Zaawansowany POM najlepiej działa z fixtures. Test nie musi wiedzieć, jak tworzyć `LoginPage`, `OrdersPage` czy `OrdersClient`.

```typescript
export const test = base.extend<{
  ordersPage: OrdersPage;
  ordersClient: OrdersClient;
}>({
  ordersPage: async ({ page }, use) => {
    await use(new OrdersPage(page));
  },
  ordersClient: async ({ request }, use) => {
    await use(new OrdersClient(request));
  },
});
```

Dzięki temu test opisuje scenariusz, a nie składanie zależności.

## 7. Antywzorzec: framework ponad produkt

Jeśli dodajesz fabryki stron, fasady, strategie, buildery i custom DSL zanim projekt ma powtarzalność, tworzysz koszt bez wartości. Najpierw napisz kilka czytelnych testów. Dopiero gdy widzisz powtórzenia, wyciągaj abstrakcje.

## 8. Wzorzec decyzji

- Jedna strona, kilka akcji: zwykły Page Object.
- Powtarzalny fragment UI: Component Object.
- Proces przez kilka ekranów: Journey.
- Setup danych przez backend: API/Service Object.
- Wiele wariantów tego samego procesu: Strategy.
- Wiele zależności w testach: fixtures.

## 9. Checklista zaawansowanego POM

- Czy abstrakcja ma nazwę domenową?
- Czy ukrywa szczegóły techniczne, ale nie ukrywa sensu testu?
- Czy awaria nadal jest łatwa do zlokalizowania?
- Czy POM używa web-first assertions tam, gdzie sprawdza stan UI?
- Czy API i dane są poza Page Objectem?

## 10. Przykład dobrego podziału odpowiedzialności

```typescript
const user = buildUser({ role: 'customer' });
const createdUser = await usersClient.createUser(user);
await loginPage.login(createdUser.email, user.password);
await dashboardPage.expectLoaded();
```

W tym przykładzie:

- builder tworzy dane;
- client API zapisuje dane;
- Page Object wykonuje UI;
- asercja potwierdza rezultat.

Ten podział ułatwia diagnozę. Jeśli nie powstał użytkownik, problem jest w API/setupie. Jeśli logowanie nie działa, problem jest w UI/auth. Jeśli dashboard się nie pojawia, problem może być w redirect albo sesji.

## 11. Kiedy usunąć abstrakcję

Abstrakcję warto usunąć, gdy:

- jest używana tylko raz;
- jej nazwa nie wyjaśnia intencji;
- wymaga częstego otwierania implementacji;
- ukrywa ważne asercje;
- utrudnia trace i raport;
- powoduje więcej kodu niż prosty test.

Profesjonalny kod testowy nie polega na maksymalnej liczbie wzorców, ale na minimalnej złożoności potrzebnej do utrzymania jakości.

## 12. Warstwa asercji obok POM

W dużych projektach warto rozdzielić akcje UI od asercji domenowych:

```text
pages/OrdersPage.ts
assertions/order.assertions.ts
clients/OrdersClient.ts
```

Page Object otwiera stronę i wykonuje akcje. Plik asercji sprawdza stan domenowy. Dzięki temu unikniesz Page Objecta z dziesiątkami metod `expect...` i zachowasz czytelne komunikaty błędów.

## 13. Page Object a test.step

Jeśli metoda POM wykonuje kilka widocznych kroków, rozważ `test.step` na poziomie testu albo wewnątrz helpera. Raport powinien pokazywać proces w języku biznesowym:

```typescript
await test.step('Klient przechodzi do koszyka', async () => {
  await cartPage.open();
  await cartPage.expectLoaded();
});
```

## 14. Ewolucja POM

Dobry POM ewoluuje razem z produktem. Po redesignie nie doklejaj kolejnych wyjątków. Sprawdź, czy komponenty, root locatory i nazwy metod nadal odpowiadają aktualnemu UI. Refaktor POM jest normalną częścią utrzymania testów.

## 15. Metody zwracające kolejną stronę

Czasem metoda Page Objecta może zwrócić obiekt kolejnej strony:

```typescript
async submitLogin() {
  await this.submit.click();
  return new DashboardPage(this.page);
}
```

To jest czytelne, gdy akcja zawsze prowadzi do tego samego widoku. Jeśli wynik zależy od danych, lepiej rozdziel akcję i asercję, aby test jawnie sprawdzał redirect albo błąd.

## 16. POM a i18n

Jeśli aplikacja ma wiele języków, locatory po tekście mogą wymagać warstwy tłumaczeń albo stabilnych accessible names. Nie wracaj automatycznie do CSS. Ustal standard: testy per locale, słownik tekstów albo test id dla elementów technicznych.
