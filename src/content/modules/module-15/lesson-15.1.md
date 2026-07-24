# Projekt Praktyczny I: Automatyzacja Platformy E-Commerce

Automatyzacja sklepu internetowego (E-Commerce) to jeden z najważniejszych i najbardziej powszechnych projektów w karierze inżyniera QA. Sklepy e-commerce charakteryzują się złożonymi przepływami biznesowymi, które łączą wiele asynchronicznych mechanizmów: uwierzytelnianie, dynamiczne wyszukiwanie produktów, koszyk zakupowy (zarządzanie sesją) oraz proces płatności (kasa - checkout) zintegrowany z zewnętrznymi bramkami.

W tym projekcie praktycznym połączymy wszystkie zaawansowane wzorce inżynieryjne pozyskane z literatury 2026 w celu zbudowania kompletnego, odpornego na zmiany i wysoce wydajnego frameworka testowego.

---

## 1. Architektura i struktura projektu E-Commerce

Nasz projekt zostanie podzielony zgodnie z zasadami **SOLID** na odizolowane warstwy:

```text
ecommerce-framework/
├── src/
│   ├── pages/
│   │   ├── BasePage.ts         <-- Metoda Szablonowa (Template Method)
│   │   ├── LoginPage.ts        <-- Panel Logowania (SRP)
│   │   ├── ProductsPage.ts     <-- Katalog Produktów
│   │   └── CheckoutPage.ts     <-- Proces Kasy (Kroki Kasy)
│   ├── components/
│   │   ├── HeaderComponent.ts  <-- Reużywalny nagłówek (Root Locator)
│   │   └── CartComponent.ts    <-- Podgląd koszyka
│   ├── utils/
│   │   ├── PageFactory.ts      <-- Fabryka Obiektów Stron
│   │   └── customTest.ts       <-- Custom Runner z fixturami i asercjami
│   └── data/
│       └── UserBuilder.ts      <-- Dynamiczne dane testowe (Faker)
└── tests/
    └── checkout.spec.ts        <-- Przejrzyste scenariusze biznesowe
```

---

## 2. Wdrożenie warstwy customTest z powiązanymi fixturami

Zaimplementujemy zaawansowany custom runner `customTest.ts`. Zastępuje on manualną instancjację klas stron automatycznymi, leniwie ładowanymi fixturami:

```typescript
// src/utils/customTest.ts
import { test as base } from '@playwright/test';
import { PageFactory } from './PageFactory';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CheckoutPage } from '../pages/CheckoutPage';

type MyEcommerceFixtures = {
  loginPage: LoginPage;
  productsPage: ProductsPage;
  checkoutPage: CheckoutPage;
  loggedInCustomerPage: any;
};

export const test = base.extend<MyEcommerceFixtures>({
  loginPage: async ({ page }, use) => {
    await use(PageFactory.getPage<LoginPage>('LoginPage', page));
  },
  
  productsPage: async ({ page }, use) => {
    await use(PageFactory.getPage<ProductsPage>('ProductsPage', page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(PageFactory.getPage<CheckoutPage>('CheckoutPage', page));
  },

  // Fixtura zależna (Dependency Fixture) przygotowująca zalogowanego klienta w tle
  loggedInCustomerPage: async ({ page, loginPage }, use) => {
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await use(page); // Przekaż zalogowaną stronę do testów koszyka/kasy
  },
});

export { expect } from '@playwright/test';
```

---

## 3. Kompletny scenariusz testowy: Proces zakupu (Happy Path)

Dzięki wdrożeniu architektury opartej o wstrzykiwanie fixtur, wzorzec fabryki oraz kompozycję komponentów, nasz końcowy test zakupowy jest niesamowicie czytelny i w pełni odporny na błędy:

```typescript
// tests/checkout.spec.ts
import { test, expect } from '../src/utils/customTest';
import { DynamicUserBuilder } from '../src/data/UserBuilder';

test.describe('Przepływy zakupowe klienta', () => {

  test('klient może pomyślnie kupić produkt', async ({ loggedInCustomerPage, productsPage, checkoutPage }) => {
    // 1. Arrange: Dane adresowe klienta wygenerowane dynamicznie przez Faker
    const randomCustomer = new DynamicUserBuilder().build();

    // 2. Act: Wykonanie interakcji na katalogu produktów
    await productsPage.addProductToCart('Backpack');
    await productsPage.header.openCart(); // Wywołanie komponentu kompozycji (Header)

    // Przejście do kasy i wypełnienie danych adresowych
    await checkoutPage.proceedToCheckout();
    await checkoutPage.fillShippingDetails(randomCustomer);
    await checkoutPage.submitOrder();

    // 3. Assert: Weryfikacja sukcesu zamówienia asercją Web-First
    await expect(checkoutPage.successMessage).toHaveText('Dziękujemy za złożenie zamówienia!');
  });

});
```

---

## 4. Wytyczne do Projektu E-Commerce
Podczas samodzielnej realizacji projektu upewnij się, że spełniasz następujące wymagania architektoniczne:
- [ ] Wszystkie klasy stron dziedziczą po wspólnej klasie abstrakcyjnej `BasePage` implementującej metodę szablonową.
- [ ] Nagłówek i koszyk zostały wydzielone jako osobne, niezależne obiekty komponentów (`Component Objects`) posiadające własne lokalizatory korzenia (`rootLocator`).
- [ ] Wyeliminowałeś bezpośrednie wywoływanie `new` z plików testowych na rzecz automatycznego wstrzykiwania otypowanych fixtur z `customTest.ts`.
- [ ] Dane adresowe i unikalne e-maile są generowane dynamicznie przy użyciu biblioteki Faker.