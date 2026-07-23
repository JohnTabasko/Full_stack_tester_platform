# Zaawansowane wzorce POM — journey, fasada, strategia, fabryka i service objects

Podstawowy Page Object Model (POM) porządkuje pojedyncze strony. W większych, profesjonalnych projektach pojawiają się jednak skomplikowane przepływy obejmujące wiele ekranów, warianty realizowane za pomocą strategii, dynamiczne powoływanie obiektów przez fabrykę, setup przez API oraz komponenty współdzielone między wieloma domenami. W takich sytuacjach inżynieria testów opiera się na zaawansowanych wzorcach projektowych.

Jak podkreśla Raj Uppadhyay w książce *"Scalable Test Automation with Playwright" (2026)*, celem zaawansowanych wzorców nie jest maksymalne skomplikowanie kodu, lecz **decoupling** (rozprzężenie) – oddzielenie scenariusza testowego od technicznej konstrukcji obiektów.

---

## 1. Wzorzec Fabryki Obiektów Stron (Page Object Factory)

Tradycyjna instancjacja `new LoginPage(page)` w każdym pliku testowym tworzy **silne sprzężenie (tight coupling)**. Jeśli w przyszłości zmieni się konstruktor `LoginPage` (np. dodamy zależność od loggera lub klasy konfiguracyjnej), musimy zaktualizować każdy test wywołujący ten konstruktor.

**Wzorzec Fabryki** rozwiązuje ten problem. Zamiast tworzyć obiekty ręcznie, test żąda ich od scentralizowanej klasy fabryki, która jako jedyna wie, jak poprawnie skonstruować dany obiekt:

```typescript
import { Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { BasePage } from '../pages/BasePage';

export type PageName = 'LoginPage' | 'InventoryPage';

export class PageFactory {
  /**
   * Generyczna metoda fabrykująca zwracająca otypowany obiekt strony.
   */
  public static getPage<T extends BasePage>(pageName: PageName, page: Page): T {
    switch (pageName) {
      case 'LoginPage':
        return new LoginPage(page) as unknown as T;
      case 'InventoryPage':
        return new InventoryPage(page) as unknown as T;
      default:
        throw new Error(`Strona "${pageName}" nie jest obsługiwana przez PageFactory.`);
    }
  }
}
```

Dzięki temu zmiana konstruktora klasy `LoginPage` wymaga poprawki **wyłącznie w jednym pliku** (`PageFactory.ts`).

---

## 2. Journey pattern (Wzorzec Przepływu)

Wzorzec Journey reprezentuje wieloetapowy proces biznesowy (np. zakup produktu, rejestracja z weryfikacją e-mail), przechodzący przez wiele stron i komponentów.

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

**Złota zasada**: Journey upraszcza powtarzalne ścieżki, ale nie powinien maskować głównego sensu testu. Jeśli test ma sprawdzić walidację formularza płatności, nie ukrywaj procesu wypełniania formularza w jednej metodzie Journey – test powinien jawnie wywoływać metody walidacyjne na `CheckoutPage`.

---

## 3. Wzorzec Strategii (Strategy Pattern)

Gdy dany proces biznesowy ma wiele wariantów wykonania (np. różne metody płatności: BLIK, Karta Kredytowa, PayPal), stosowanie instrukcji warunkowych `if/else` wewnątrz Page Objectu drastycznie obniża czytelność kodu i łamie zasadę **Open/Closed Principle (OCP)**.

**Wzorzec Strategii** pozwala wyodrębnić każdy wariant do osobnej, wymiennej klasy implementującej wspólny interfejs:

```typescript
// Definicja strategii płatności
export interface PaymentStrategy {
  pay(amount: number): Promise<void>;
}

// Strategia płatności kartą
export class CardPayment implements PaymentStrategy {
  constructor(private readonly page: Page) {}
  async pay(amount: number) {
    await this.page.getByLabel('Card Number').fill('4111...');
    await this.page.getByRole('button', { name: 'Zapłać' }).click();
  }
}

// Strategia płatności BLIK
export class BlikPayment implements PaymentStrategy {
  constructor(private readonly page: Page) {}
  async pay(amount: number) {
    await this.page.getByLabel('Kod BLIK').fill('123456');
    await this.page.getByRole('button', { name: 'Potwierdź BLIK' }).click();
  }
}
```

Teraz strona kasy (`CheckoutPage`) nie przejmuje się szczegółami technicznymi płatności – po prostu deleguje zadanie do przekazanej strategii:

```typescript
export class CheckoutPage extends BasePage {
  async processPayment(amount: number, strategy: PaymentStrategy) {
    await test.step(`Przetwarzanie płatności o wartości ${amount}`, async () => {
      await strategy.pay(amount);
    });
  }
}
```

---

## 4. Service Objects (Wzorzec Obiektów Usługowych)

Fizyczna interakcja z interfejsem użytkownika (UI) bywa powolna. Jeśli testujesz koszyk zakupowy, nie musisz w każdym teście przechodzić przez UI w celu dodania 5 produktów i zalogowania użytkownika.

**Service Objects** (np. klienci API) służą do błyskawicznego przygotowywania stanu danych przed testem (Arrange) bezpośrednio na poziomie backendu:

```typescript
// Inicjalizacja stanu przez API (błyskawiczna)
const user = await userApiService.createUser();
const order = await orderApiService.createOrder(user.token, productData);

// Testowanie właściwego zachowania w UI (szybkie i stabilne)
await loginPage.loginWithToken(user.token);
await ordersPage.open(order.id);
await ordersPage.assertOrderIsVisible(order.id);
```

Dzięki temu oddzielamy testowanie zachowania interfejsu (UI) od inżynierii przygotowania danych (API).

---

## 5. Checklista Zaawansowanych Wzorców POM

Uruchom tę checklistę przed wdrożeniem skomplikowanej abstrakcji:
- [ ] **Problem sprzężenia**: Czy bezpośrednie wywoływanie `new` utrudni w przyszłości refaktoryzację? (Jeśli tak -> wdroż `PageFactory`).
- [ ] **Open/Closed**: Czy dodanie nowego wariantu procesu (np. nowej płatności) wymaga modyfikowania istniejącej klasy POM? (Jeśli tak -> wdroż `Strategy Pattern`).
- [ ] **Szybkość testów**: Czy możesz przygotować dane testowe za pomocą Service Object (API) zamiast przeklikiwać cały interfejs UI?
- [ ] **Czytelność**: Czy po schowaniu kodu za warstwą abstrakcji test nadal jasno opisuje intencję scenariusza?

---

## Bibliografia i Linki
*   *Raj Uppadhyay, Scalable Test Automation with Playwright (2026), Chapter 3: Building a Scalable UI Framework (PageFactory & BasePage)*
*   *Jean-François Greffier, Practical Playwright Test (2026), Chapter 12: Solving the Test Frameworks Puzzle*
*   [Playwright Best Practices](https://playwright.dev/docs/best-practices)
