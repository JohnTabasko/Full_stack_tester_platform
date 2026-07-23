# Page Object Model — zaawansowana architektura skalowalna

> **Perspektywa Full Stack Testera**
> Page Object Model to nie jest "opcjonalny dodatek" do testów Playwright. To fundamentalna architektura, która decyduje o tym, czy Twoje testy będą utrzymywane przez lata, czy zamienią się w spaghetti code po trzech miesiącach. W profesjonalnym projekcie z setkami testów POM jest tym, co pozwala zespołowi: współpracować nad testami bez konfliktów, aktualizować selektory w jednym miejscu zamiast w stu plikach, budować reużywalne komponenty i workflow'y, i przekazywać wiedzę nowym członkom zespołu. Ta lekcja wykracza poza podstawowy POM — pokazuje zaawansowane wzorce, component objects, business workflows i antywzorce, które odróżniają początkującego od profesjonalisty.

## Cel lekcji

Po ukończeniu tej lekcji rozumiesz pełną architekturę POM (nie tylko podstawową wersję), potrafisz projektować profesjonalne klasy POM z prywatnymi lokatorami i publicznymi metodami, znasz Component Objects dla fragmentów stron, potrafisz budować Business Workflows łączące wiele stron, implementujesz POM z fixtures dla pełnej izolacji, unikaniasz typowych antywzorców POM, i wiesz, kiedy POM jest zbędny (proste testy jednorazowe).

---

## Anatomia profesjonalnej klasy POM

### Pełna struktura z TypeScript

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  // =========================================================
  // SEKCJA 1: Prywatne lokatory (praktyka wymagana!)
  // =========================================================
  // Dlaczego prywatne? 
  // 1. Ukrywają strukturę HTML od testów (abstrakcja)
  // 2. Zapobiegają "dowolnemu klikaniu" w testach
  // 3. Wymuszają używanie zdefiniowanych metod biznesowych
  
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;
  private readonly errorMessage: Locator;
  private readonly forgotPasswordLink: Locator;
  private readonly stayLoggedInCheckbox: Locator;

  // =========================================================
  // SEKCJA 2: Konstruktor i zależności
  // =========================================================
  constructor(private readonly page: Page) {
    this.emailInput = this.page.getByLabel(/email/i);
    this.passwordInput = this.page.getByLabel(/hasło|password/i, { exact: false });
    this.submitButton = this.page.getByRole('button', { name: /zaloguj|sign in/i });
    this.errorMessage = this.page.getByRole('alert');
    this.forgotPasswordLink = this.page.getByRole('link', { name: /zapomniałeś|forgot/i });
    this.stayLoggedInCheckbox = this.page.getByRole('checkbox', { name: /zapamiętaj|remember/i });
  }

  // =========================================================
  // SEKCJA 3: Metody nawigacji
  // =========================================================
  async navigate(): Promise<void> {
    await this.page.goto('/login');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateToRegistration(): Promise<RegistrationPage> {
    await this.forgotPasswordLink.click();
    // Alternatywnie: zwróć klasę do strony rejestracji
    return new RegistrationPage(this.page);
  }

  // =========================================================
  // SEKCJA 4: Metody akcji (biznesowe nazwy!)
  // =========================================================
  async login(email: string, password: string, rememberMe = false): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    
    if (rememberMe) {
      await this.stayLoggedInCheckbox.check();
    }
    
    await this.submitButton.click();
  }

  async loginWithInvalidCredentials(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    
    // Czekaj na pojawienie się komunikatu błędu
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
  }

  async submitWithoutCredentials(): Promise<void> {
    await this.submitButton.click();
    // Weryfikuj, że przycisk jest nadal widoczny (nie przekierowało)
    await expect(this.submitButton).toBeVisible();
  }

  // =========================================================
  // SEKCJA 5: Metody asercji (getters do stanu)
  // =========================================================
  get error(): Locator {
    return this.errorMessage;
  }

  get isLoaded(): Locator {
    return this.submitButton; // Jeśli przycisk jest widoczny, strona jest załadowana
  }

  // =========================================================
  // SEKCJA 6: Metody pomocnicze (nie-exponowane publicznie)
  // =========================================================
  private async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await expect(this.submitButton).toBeVisible();
  }
}
```

---

## Component Objects — POM dla fragmentów stron

### Problem: Współdzielone elementy między wieloma stronami

Moduł nawigacji (header), stopka, modalne okna, powiadomienia toast — te elementy występują na wielu stronach i nie powinny być duplikowane w każdej klasie POM.

### Header Component

```typescript
// components/HeaderComponent.ts
export class HeaderComponent {
  private readonly logoLink: Locator;
  private readonly navLinks: Locator;
  private readonly userMenuButton: Locator;
  private readonly cartIcon: Locator;
  private readonly searchInput: Locator;
  private readonly notificationBadge: Locator;

  constructor(private readonly page: Page) {
    this.logoLink = this.page.getByRole('link', { name: /logo|strona główna/i });
    this.navLinks = this.page.getByRole('navigation').getByRole('link');
    this.userMenuButton = this.page.locator('[data-testid="user-menu-button"]');
    this.cartIcon = this.page.locator('[data-testid="cart-icon"]');
    this.searchInput = this.page.getByPlaceholder(/szukaj|search/i);
    this.notificationBadge = this.page.locator('[data-testid="notification-badge"]');
  }

  async navigateToHome(): Promise<void> {
    await this.logoLink.click();
    await this.page.waitForURL('/');
  }

  async navigateToCart(): Promise<void> {
    await this.cartIcon.click();
    await this.page.waitForURL(/\/cart/);
  }

  async openUserMenu(): Promise<UserMenuComponent> {
    await this.userMenuButton.click();
    return new UserMenuComponent(this.page);
  }

  async getCartItemCount(): Promise<number> {
    const badge = this.notificationBadge;
    if (await badge.isVisible()) {
      const text = await badge.innerText();
      return parseInt(text, 10);
    }
    return 0;
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }
}

// components/UserMenuComponent.ts
export class UserMenuComponent {
  private readonly menuItems: Locator;
  
  constructor(private readonly page: Page) {
    this.menuItems = this.page.locator('[data-testid="user-menu-item"]');
  }

  async logout(): Promise<void> {
    await this.page.getByRole('menuitem', { name: /wyloguj|sign out|log out/i }).click();
  }

  async goToProfile(): Promise<void> {
    await this.page.getByRole('menuitem', { name: /profil|profile/i }).click();
  }
}
```

### Użycie Component w klasie POM

```typescript
// pages/ProductPage.ts — strona produktu używa HeaderComponent
export class ProductPage {
  private readonly page: Page;
  private readonly header: HeaderComponent;
  
  // Inne lokatory specyficzne dla strony produktu
  private readonly productTitle: Locator;
  private readonly addToCartButton: Locator;
  private readonly priceDisplay: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page); // Współdzielony komponent
    
    this.productTitle = page.getByRole('heading', { level: 1 });
    this.addToCartButton = page.getByRole('button', { name: /dodaj do koszyka/i });
    this.priceDisplay = page.locator('[data-testid="product-price"]');
  }
  
  async navigateTo(productId: string): Promise<void> {
    await this.page.goto(`/products/${productId}`);
  }
  
  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
    // Po dodaniu — sprawdź badge w headerze
    await expect(this.header.getCartItemCount()).toBeGreaterThan(0);
  }
  
  async goToCartViaHeader(): Promise<CartPage> {
    await this.header.navigateToCart();
    return new CartPage(this.page);
  }
}
```

---

## Business Workflows — łączenie stron w procesy biznesowe

### Problem: Scenariusze obejmujące wiele stron

Gdy masz scenariusz "Złóż zamówienie", obejmuje on: strona główna → katalog → szczegóły produktu → koszyk → checkout → potwierdzenie. Każda strona to osobna klasa POM. Ale test musi wiedzieć, jak przejść między nimi.

### Klasa Workflow

```typescript
// workflows/CheckoutWorkflow.ts
import { Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { OrderConfirmationPage } from '../pages/OrderConfirmationPage';

export class CheckoutWorkflow {
  private readonly page: Page;
  
  private loginPage: LoginPage;
  private productPage: ProductPage;
  private cartPage: CartPage;
  private checkoutPage: CheckoutPage;
  private confirmationPage: OrderConfirmationPage;

  constructor(page: Page) {
    this.page = page;
    this.loginPage = new LoginPage(page);
    this.productPage = new ProductPage(page);
    this.cartPage = new CartPage(page);
    this.checkoutPage = new CheckoutPage(page);
    this.confirmationPage = new OrderConfirmationPage(page);
  }

  async executeCompleteCheckout(
    credentials: { email: string; password: string },
    productId: string
  ): Promise<{ orderId: string; reference: string }> {
    // Krok 1: Logowanie
    await this.loginPage.navigate();
    await this.loginPage.login(credentials.email, credentials.password);
    await this.page.waitForURL('/dashboard');
    
    // Krok 2: Wybór produktu
    await this.productPage.navigateTo(productId);
    await this.productPage.addToCart();
    
    // Krok 3: Przejście do koszyka
    const cartPage = await this.productPage.goToCartViaHeader();
    await expect(cartPage.isLoaded).toBeVisible();
    
    // Krok 4: Checkout
    await cartPage.proceedToCheckout();
    await this.checkoutPage.selectPaymentMethod('card');
    await this.checkoutPage.enterCardDetails({
      number: '4242424242424242',
      expiry: '12/28',
      cvc: '123',
    });
    await this.checkoutPage.submitOrder();
    
    // Krok 5: Potwierdzenie
    await expect(this.confirmationPage.isLoaded).toBeVisible();
    const orderReference = await this.confirmationPage.getOrderReference();
    const orderId = await this.confirmationPage.getOrderId();
    
    return { orderId, reference: orderReference };
  }
}
```

### Użycie Workflow w teście

```typescript
import { test, expect } from '@playwright/test';
import { CheckoutWorkflow } from '../workflows/CheckoutWorkflow';
import { createTestUser } from '../fixtures/test-data';

test.describe('Scenariusze zakupowe', () => {
  
  test('pełny checkout — od logowania do potwierdzenia', async ({ page, request }) => {
    // Setup: stwórz użytkownika i produkt
    const user = await createTestUser(request);
    const product = await createTestProduct(request);
    
    // Workflow: wykonaj cały proces
    const workflow = new CheckoutWorkflow(page);
    const { orderId, reference } = await workflow.executeCompleteCheckout(
      { email: user.email, password: 'TestPassword123!' },
      product.id
    );
    
    // Asercja końcowa
    expect(orderId).toBeDefined();
    expect(reference).toMatch(/^ORD-\d+/);
    
    // Cleanup
    await request.delete(`/api/orders/${orderId}`);
    await request.delete(`/api/users/${user.id}`);
  });
});
```

---

## POM z Fixtures — pełna integracja

### Własny typ testu z wstrzykiwanymi POM

```typescript
// fixtures/pom-fixtures.ts
import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { HeaderComponent } from '../components/HeaderComponent';

// Definicja rozszerzonego typu testu
type PomFixtures = {
  loginPage: LoginPage;
  productPage: ProductPage;
  cartPage: CartPage;
  header: HeaderComponent;
};

// Rozszerzenie test() o POM fixtures
export const test = base.extend<PomFixtures>({
  // Każda fixtures tworzy nową instancję POM dla każdego testu
  loginPage: async ({ page }, use) => {
    const pom = new LoginPage(page);
    await use(pom);
    // Cleanup nie jest potrzebny — nowa instancja dla każdego testu
  },
  
  productPage: async ({ page }, use) => {
    const pom = new ProductPage(page);
    await use(pom);
  },
  
  cartPage: async ({ page }, use) => {
    const pom = new CartPage(page);
    await use(pom);
  },
  
  header: async ({ page }, use) => {
    const pom = new HeaderComponent(page);
    await use(pom);
  },
});

// Re-export dla łatwego importu
export { expect } from '@playwright/test';
```

### Użycie w testach — czytelne i zwięzłe

```typescript
// tests/checkout.spec.ts
import { test, expect } from '../fixtures/pom-fixtures';

test.describe('Koszyk', () => {
  
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
    await loginPage.login('jan@test.pl', 'haslo123');
  });
  
  test('dodanie produktu do koszyka przez POM', async ({ productPage, header }) => {
    await productPage.navigateTo('PROD-001');
    await productPage.addToCart();
    
    const cartCount = await header.getCartItemCount();
    expect(cartCount).toBeGreaterThan(0);
  });
  
  test('edycja ilości w koszyku', async ({ cartPage }) => {
    await cartPage.navigate();
    await cartPage.increaseQuantity(0, 3); // Wiersz 0, ilość 3
    await expect(cartPage.getItemPrice(0)).toBeGreaterThan(0);
  });
});
```

---

## Antywzorce POM — czego unikać

### Antywzorzec 1: Publiczne lokatory

```typescript
// ❌ ZŁY POM — lokatory są publiczne
export class LoginPage {
  public emailInput: Locator; // Każdy może zrobić wszystko z tym inputem!
  public passwordInput: Locator;
  public submitButton: Locator;
}

// W teście:
await page.loginPage.emailInput.fill('test@test.pl'); // Sprawdza konkretne pole
await page.loginPage.emailInput.press('Tab');          // Tab na polu — po co?
await page.loginPage.emailInput.focus();               // Focus — niepotrzebne
// Problem: test operuje na szczegółach implementacji, nie na zachowaniu!
```

### Antywzorzec 2: God Object (klasa, która wie wszystko)

```typescript
// ❌ ZŁY POM — jedna klasa na całą aplikację
export class AppPage {
  async login(email, pass) { /* ... */ }
  async addToCart(product) { /* ... */ }
  async checkout() { /* ... */ }
  async search(query) { /* ... */ }
  async filter(category) { /* ... */ }
  async logout() { /* ... */ }
  async goToProfile() { /* ... */ }
  async goToOrders() { /* ... */ }
  // ... 50+ metod!
  // Ta klasa wie za dużo — zmiana w jednym miejscu może zepsuć wszystko
}

// ✅ DOBRY POM — jedna klasa na jedną stronę/sekcję
export class LoginPage { /* tylko logowanie */ }
export class ProductPage { /* tylko strona produktu */ }
export class CartPage { /* tylko koszyk */ }
```

### Antywzorzec 3: Metody, które robią więcej niż jedno

```typescript
// ❌ ZŁY POM — metoda robi za dużo
async loginAndGoToDashboard(email, password) {
  await this.emailInput.fill(email);
  await this.passwordInput.fill(password);
  await this.submitButton.click();
  await this.page.waitForURL('/dashboard'); // Po co? To inna strona!
  // Metoda "login" powinna tylko logować, nie nawigować!
}

// ✅ DOBRY POM — jedna metoda = jedna odpowiedzialność
async login(email, password) {
  await this.emailInput.fill(email);
  await this.passwordInput.fill(password);
  await this.submitButton.click();
}

async expectRedirectToDashboard() {
  await this.page.waitForURL('/dashboard');
}
```

---

## Perspektywa Full Stack Testera — POM jako inwestycja

Page Object Model to inwestycja, nie koszt. Początkowo zajmuje więcej czasu (trzeba napisać klasę, nie jeden test). Ale zwraca się wielokrotnie:

- Gdy programista zmieni `id="password"` na `id="user-pass"` — zmieniasz JEDNĄ linijkę w `LoginPage.ts` zamiast 50 plików `.spec.ts`.
- Gdy nowy członek zespołu dołącza — ma czytelną dokumentację API (metody POM) zamiast zgadywać, jak działa test.
- Gdy test pada — wiesz, że problem jest w logice (kod testu) czy w implementacji (POM), bo masz warstwy.

Profesjonalny POM to nie jest "ładny kod" — to instrument ochrony Twojej inwestycji w testy automatyczne na lata.

---

## Podsumowanie

1. **Prywatne lokatory**: Ukrywaj implementację, wystawiaj metody biznesowe.
2. **Component Objects**: Współdzielone fragmenty (header, modal, toast) — nie duplikuj.
3. **Business Workflows**: Łączenie wielu stron w procesy biznesowe — reużywalne scenariusze.
4. **POM z fixtures**: Wstrzykiwanie POM przez custom fixture type.
5. **Antywzorce**: Publiczne lokatory, God Object, metody robiące za dużo.
6. **Kiedy POM jest zbędny**: Proste testy jednorazowe (sprawdzenie jednego przycisku).

---

## Linki i źródła

- [Playwright Page Object Models](https://playwright.dev/docs/pom)
- [Page Object Pattern — Martin Fowler](https://martinfowler.com/bliki/PageObject.html)
- [SOLID Principles for Test Automation](https://www.ministryoftesting.com/articles/solid-principles-for-test-automation)
- [Playwright Fixtures Guide](https://playwright.dev/docs/test-fixtures)

## 📘 Suplement Inżynieryjny 2026: Wzorzec Obiektu Strony (Page Object Factory)
*Inspiracja: „Scalable Test Automation with Playwright” (2026), Chapter 3*
*   **PageObject Factory**: Zastąp bezpośrednią instancjację `new LoginPage(page)` za pomocą fabryki `PageFactory`. Zapobiega to kruchości testów – przy zmianie konstruktora klasy strony poprawiasz wyłącznie kod fabryki.
*   **Metoda Szablonowa (Template Method)**: Definiuj szkielet procesów (np. nawigacji i sprawdzania błędów 500) w abstrakcyjnej klasie bazowej `BasePage`.
