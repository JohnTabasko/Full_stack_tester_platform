# Zaawansowane wzorce POM — journey, fasada, strategia i service objects

Podstawowy POM porządkuje pojedyncze strony. W większym projekcie pojawiają się jednak przepływy obejmujące wiele ekranów, wiele wariantów płatności, setup przez API i komponenty współdzielone między domenami. Wtedy przydają się wzorce zaawansowane — ale tylko wtedy, gdy rozwiązują realny problem.

Największy błąd to budowanie frameworka testowego dla samej architektury. Dobry wzorzec skraca test i zwiększa czytelność. Zły wzorzec sprawia, że prosta ścieżka wymaga otwierania dziesięciu plików.

## 1. Journey pattern

Journey reprezentuje proces biznesowy przechodzący przez kilka stron.

```typescript
export class CheckoutJourney {
  constructor(
    private readonly productPage: ProductPage,
    private readonly cartPage: CartPage,
    private readonly checkoutPage: CheckoutPage,
    private readonly confirmationPage: OrderConfirmationPage,
  ) {}

  async buyProduct(productName: string) {
    await this.productPage.open(productName);
    await this.productPage.addToCart();
    await this.cartPage.open();
    await this.cartPage.proceedToCheckout();
    await this.checkoutPage.submitOrder();
    await this.confirmationPage.expectLoaded();
  }
}
```

Journey jest dobre dla powtarzalnych procesów, ale nie powinno ukrywać głównej intencji testu. Jeśli test ma sprawdzić walidację płatności, nie chowaj całego procesu płatności w jednej metodzie bez kroków i asercji.

## 2. Fasada

Fasada upraszcza dostęp do zestawu stron, komponentów i klientów API.

```typescript
export class App {
  readonly login: LoginPage;
  readonly checkout: CheckoutPage;
  readonly ordersApi: OrdersClient;

  constructor(page: Page, request: APIRequestContext) {
    this.login = new LoginPage(page);
    this.checkout = new CheckoutPage(page);
    this.ordersApi = new OrdersClient(request);
  }
}
```

Użycie:

```typescript
test('użytkownik widzi zamówienie', async ({ app }) => {
  const order = await app.ordersApi.createPaidOrder();
  await app.checkout.openOrder(order.id);
  await app.checkout.expectOrderVisible(order.id);
});
```

Fasada nie może stać się God Objectem. Jeśli `App` ma 80 właściwości i zna cały system, problem wrócił pod inną nazwą.

## 3. Strategia

Strategia jest przydatna, gdy proces ma kilka wariantów, np. płatność kartą, BLIK i przelew.

```typescript
type PaymentStrategy = {
  pay(): Promise<void>;
};

class CardPayment implements PaymentStrategy {
  constructor(private readonly page: Page) {}

  async pay() {
    await this.page.getByLabel('Numer karty').fill('4242 4242 4242 4242');
    await this.page.getByRole('button', { name: 'Zapłać kartą' }).click();
  }
}

class BlikPayment implements PaymentStrategy {
  constructor(private readonly page: Page) {}

  async pay() {
    await this.page.getByLabel('Kod BLIK').fill('123456');
    await this.page.getByRole('button', { name: 'Zapłać BLIK' }).click();
  }
}
```

CheckoutPage może przyjąć strategię:

```typescript
async payWith(strategy: PaymentStrategy) {
  await strategy.pay();
}
```

## 4. Service/API Objects

Nie wszystko jest stroną. Setup danych, cleanup i asercje backendowe warto trzymać w klientach API.

```typescript
export class OrdersClient {
  constructor(private readonly request: APIRequestContext) {}

  async createOrder(data: CreateOrderPayload) {
    const response = await this.request.post('/api/orders', { data });
    expect(response.status()).toBe(201);
    return response.json();
  }

  async deleteOrder(orderId: string) {
    await this.request.delete(`/api/orders/${orderId}`);
  }
}
```

To ogranicza pokusę tworzenia danych przez UI tylko dlatego, że test już ma `page`.

## 5. Builder danych

Builder pomaga tworzyć czytelne dane testowe:

```typescript
export function buildOrder(overrides: Partial<CreateOrderPayload> = {}): CreateOrderPayload {
  return {
    customerEmail: `user-${Date.now()}@example.com`,
    items: [{ sku: 'BOOK-1', quantity: 1 }],
    currency: 'PLN',
    ...overrides,
  };
}
```

Builder nie powinien wykonywać requestów. Tworzy dane. Klient API wysyła dane. Page Object obsługuje UI.

## 6. Kiedy wzorzec jest przesadą

Nie używaj journey, fasady i strategii dla jednego prostego testu. Najpierw napisz czytelny test. Abstrakcję wprowadź, gdy pojawia się powtórzenie albo realna złożoność.

## 7. Checklista

- Czy wzorzec usuwa powtarzalność lub nazywa proces biznesowy?
- Czy test nadal jest zrozumiały bez zaglądania do wielu klas?
- Czy Page Object nie wykonuje setupu API?
- Czy builder tylko buduje dane?
- Czy strategia odpowiada realnym wariantom procesu?
- Czy fasada nie staje się God Objectem?

## Linki

- [Page Object Models](https://playwright.dev/docs/pom)
- [Fixtures](https://playwright.dev/docs/test-fixtures)
- [API testing](https://playwright.dev/docs/api-testing)

## 8. Strategy dla ról użytkowników

Ten sam proces może różnić się zależnie od roli. Strategia pozwala zamknąć różnice w małych klasach:

```typescript
type LoginStrategy = { login(): Promise<void> };

class AdminLogin implements LoginStrategy {
  constructor(private readonly loginPage: LoginPage) {}
  async login() { await this.loginPage.login('admin@example.test', 'secret'); }
}

class CustomerLogin implements LoginStrategy {
  constructor(private readonly loginPage: LoginPage) {}
  async login() { await this.loginPage.login('customer@example.test', 'secret'); }
}
```

Nie używaj strategii, jeśli wystarczy jeden parametr metody. Wzorzec ma zmniejszać złożoność, nie ją zwiększać.

## 9. Journey z test.step

Długi journey powinien być widoczny w raporcie:

```typescript
await test.step('Klient kupuje produkt', async () => {
  await checkoutJourney.buyProduct(product.name);
});
```

Jeśli journey ukrywa zbyt wiele, rozbij go na kilka kroków w teście. Raport powinien pokazywać, gdzie proces się zatrzymał.

## 10. Service Object jako granica backendu

Service Object nie jest Page Objectem. Powinien mieć własne asercje techniczne i zwracać dane domenowe. Dzięki temu test może łączyć szybki setup przez API z czytelną weryfikacją UI.

## 11. Builder + Service + POM w jednym scenariuszu

Zaawansowana architektura często łączy trzy warstwy:

```typescript
const order = buildOrder({ status: 'PAID' });
const created = await ordersClient.createOrder(order);
await ordersPage.open(created.id);
await ordersPage.expectOrderStatus(created.id, 'Opłacone');
```

To czytelniejsze niż tworzenie zamówienia przez UI, jeśli celem testu jest wyświetlenie statusu, a nie flow tworzenia zamówienia.

## 12. Fasada a jawność zależności

Fasada `app` jest wygodna, ale może ukrywać zależności. Jeśli test używa tylko `app.doEverything()`, reviewer nie widzi, czy test dotyka UI, API, bazy czy mocków. Używaj fasady do organizacji, nie do ukrywania zakresu.

## 13. Zasada końcowa

Zaawansowany wzorzec jest uzasadniony tylko wtedy, gdy zmniejsza koszt zmiany albo poprawia diagnostykę. W przeciwnym razie prosty test jest lepszy.
