# Projekt testowania aplikacji e-commerce

> **Perspektywa Full Stack Testera**
> Aplikacja e-commerce to jeden z najczęstszych przypadków użycia Playwright w portfolio i w pracy. Ma wszystkie elementy wymagające testowania: UI transakcyjne, API, płatności, rabaty, stany magazynowe, wielu użytkowników, bezpieczeństwo i compliance. Ale projekt e-commerce, który testuje każdy przycisk, jest bezużyteczny. Projekt, który chroni najważniejsze ryzyka biznesowe, jest wartościowy. Ta lekcja uczy, jak zaprojektować projekt testowania e-commerce, który pokazuje strategiczne myślenie, a nie tylko znajomość składni.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Zdefiniować zakres testów e-commerce** na podstawie ryzyka biznesowego, nie listy funkcji
- **Zbudować warstwową architekturę testów** — smoke, regression, API, unit
- **Zaprojektować automatyczne dane testowe** — fixture builders, isolation, determinism
- **Testować krytyczne przepływy** — wyszukiwanie, koszyk, checkout, płatność, zamówienie
- **Zintegrować CI/CD** z raportowaniem i quality gates
- **Dokumentować projekt** dla portfolio i współpracy zespołowej

---

## Wprowadzenie: czym jest projekt e-commerce w kontekście testów

### Domena e-commerce — najważniejsze ryzyka biznesowe

W e-commerce ryzyka biznesowe to:
- **Nieudana transakcja** — użytkownik chce kupić, system odmawia (zły UX, stracona sprzedaż)
- **Nieprawidłowa cena** — rabat nalicza się źle (straty finansowe)
- **Niedostępny produkt** — kupiono produkt, którego nie ma (complaints, refunds)
- **Wyciek danych płatności** — card data exposed (regulatory, reputacja)
- **Niezgodność stock** — system pokazuje produkt, ale go nie ma (canceled orders)

Każde z tych ryzyk generuje realne straty: finansowe, regulacyjne lub reputacyjne.

### Co NIE testować (i dlaczego)

| Funkcja | Dlaczego nie testować automatycznie |
|---------|------------------------------------|
| **Walidacja formularza rejestracji** | Rzadko się psuje, niskie ryzyko |
| **Oformatowanie daty w stopce** | Niskie ryzyko, niska wartość biznesowa |
| **Animacje hover na przyciskach** | Niskie ryzyko, false positives w visual tests |
| **Sekcja blog/poradnik** | Niska krytyczność dla transakcji |

### Co TESTOWAĆ (i dlaczego)

| Przepływ | Ryzyko biznesowe | Test layers |
|----------|------------------|-------------|
| **Checkout end-to-end** | Czy użytkownik może kupić? | Smoke + Regression |
| **Kalkulacja cen z rabatami** | Czy rabaty działają prawidłowo? | API + UI |
| **Stan magazynowy** | Czy można kupić niedostępny produkt? | API + Integration |
| **Płatność stripe sandbox** | Czy płatność działa? | Smoke |
| **Wyświetlanie cen** | Czy cena jest poprawna? | Regression |
| **Sesja i autentykacja** | Czy użytkownik nie traci koszyka? | Regression |

---

## Sekcja 1: Architektura projektu e-commerce

### Struktura katalogów

```
ecommerce-tests/
├── tests/
│   ├── smoke/                  # Krytyczne przepływy — każdy PR
│   │   ├── checkout.spec.ts
│   │   ├── login.spec.ts
│   │   └── search-add-cart.spec.ts
│   ├── regression/             # Full regression — main/schedule
│   │   ├── products/
│   │   │   ├── catalog.spec.ts
│   │   │   ├── product-detail.spec.ts
│   │   │   └── filters.spec.ts
│   │   ├── cart/
│   │   │   ├── add-remove.spec.ts
│   │   │   ├── update-quantity.spec.ts
│   │   │   └── apply-coupon.spec.ts
│   │   ├── checkout/
│   │   │   ├── address.spec.ts
│   │   │   ├── payment.spec.ts
│   │   │   └── order-confirmation.spec.ts
│   │   └── account/
│   │       ├── login-logout.spec.ts
│   │       ├── order-history.spec.ts
│   │       └── profile.spec.ts
│   ├── api/                    # API tests
│   │   ├── products.spec.ts
│   │   ├── cart.spec.ts
│   │   ├── orders.spec.ts
│   │   └── auth.spec.ts
│   ├── security/               # Security tests
│   │   ├── idor.spec.ts
│   │   ├── xss.spec.ts
│   │   └── headers.spec.ts
│   └── compliance/             # Compliance tests
│       ├── gdpr.spec.ts
│       └── cookies.spec.ts
├── src/
│   ├── pages/                  # Page Object Models
│   │   ├── home.page.ts
│   │   ├── product.page.ts
│   │   ├── cart.page.ts
│   │   ├── checkout.page.ts
│   │   └── account.page.ts
│   ├── components/             # Reusable components
│   │   ├── header.component.ts
│   │   ├── product-card.component.ts
│   │   ├── modal.component.ts
│   │   └── toast.component.ts
│   ├── api/                    # API clients
│   │   ├── products.client.ts
│   │   ├── cart.client.ts
│   │   ├── orders.client.ts
│   │   └── auth.client.ts
│   ├── fixtures/               # Test fixtures
│   │   ├── app.fixture.ts
│   │   ├── customer.fixture.ts
│   │   └── products.fixture.ts
│   ├── builders/               # Data builders
│   │   ├── product.builder.ts
│   │   ├── customer.builder.ts
│   │   ├── coupon.builder.ts
│   │   └── order.builder.ts
│   └── utils/
│       ├── random.ts
│       ├── dates.ts
│       └── price.ts
├── playwright.config.ts
├── package.json
├── tsconfig.json
├── .env.example
├── README.md
├── CONTRIBUTING.md
└── docs/
    ├── architecture.md
    ├── test-strategy.md
    └── adr/
```

### Playwright configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './tests',
  
  fullyParallel: true,
  
  forbidOnly: !!process.env.CI,
  
  retries: process.env.CI ? 2 : 0,
  
  workers: process.env.CI ? 4 : undefined,
  
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  
  use: {
    baseURL: process.env.BASE_URL ?? 'https://shop.example.com',
    
    trace: process.env.CI ? 'on-first-retry' : 'on',
    video: process.env.CI ? 'retain-on-failure' : 'off',
    screenshot: 'only-on-failure',
    
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    httpCredentials: {
      username: process.env.E2E_USER ?? 'test@example.com',
      password: process.env.E2E_PASSWORD ?? 'TestPassword123!',
    },
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 12'] },
    },
  ],
  
  globalSetup: './src/fixtures/global-setup.ts',
  globalTeardown: './src/fixtures/global-teardown.ts',
});
```

---

## Sekcja 2: Data builders — automatyczne dane testowe

### Product builder

```typescript
// src/builders/product.builder.ts
import { faker } from '@faker-js/faker';
import { randomBytes } from 'crypto';

export interface ProductData {
  id?: string;
  name: string;
  price: number;
  salePrice?: number;
  stock: number;
  category: string;
  description?: string;
  sku: string;
  images?: string[];
  active?: boolean;
}

export class ProductBuilder {
  private data: ProductData;
  
  constructor() {
    this.data = {
      name: faker.commerce.productName(),
      price: parseFloat(faker.commerce.price(10, 500, 2)),
      stock: faker.number.int({ min: 1, max: 100 }),
      category: faker.commerce.department(),
      sku: `SKU-${randomBytes(4).toString('hex').toUpperCase()}`,
      active: true,
    };
  }
  
  withPrice(price: number): this {
    this.data.price = price;
    return this;
  }
  
  onSale(salePrice?: number): this {
    this.data.salePrice = salePrice ?? this.data.price * 0.8;
    return this;
  }
  
  outOfStock(): this {
    this.data.stock = 0;
    return this;
  }
  
  withStock(stock: number): this {
    this.data.stock = stock;
    return this;
  }
  
  inCategory(category: string): this {
    this.data.category = category;
    return this;
  }
  
  withDescription(description: string): this {
    this.data.description = description;
    return this;
  }
  
  inactive(): this {
    this.data.active = false;
    return this;
  }
  
  build(): ProductData {
    return { ...this.data };
  }
  
  // Class method for quick creation
  static random(): ProductData {
    return new ProductBuilder().build();
  }
  
  static expensive(price = 1000): ProductData {
    return new ProductBuilder().withPrice(price).build();
  }
  
  static outOfStock(): ProductData {
    return new ProductBuilder().outOfStock().build();
  }
}

// Usage in tests
test('can buy expensive product', async ({ api }) => {
  const expensiveProduct = ProductBuilder.expensive(5000);
  const created = await api.products.create(expensiveProduct);
  
  await shop.products.open(created.id);
  await shop.products.addToCart();
  // ...
});
```

### Customer builder

```typescript
// src/builders/customer.builder.ts
import { faker } from '@faker-js/faker';
import { randomBytes } from 'crypto';

export interface CustomerData {
  id?: string;
  email: string;
  name: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  role?: 'customer' | 'admin';
  verified?: boolean;
}

export class CustomerBuilder {
  private data: CustomerData;
  
  constructor() {
    this.data = {
      email: `test-${randomBytes(4).toString('hex')}@example.com`,
      name: faker.person.fullName(),
      role: 'customer',
      verified: true,
    };
  }
  
  withName(name: string): this {
    this.data.name = name;
    return this;
  }
  
  asAdmin(): this {
    this.data.role = 'admin';
    return this;
  }
  
  unverified(): this {
    this.data.verified = false;
    return this;
  }
  
  withAddress(address: CustomerData['address']): this {
    this.data.address = address;
    return this;
  }
  
  withPhone(phone: string): this {
    this.data.phone = phone;
    return this;
  }
  
  build(): CustomerData {
    return { ...this.data };
  }
  
  static default(): CustomerData {
    return new CustomerBuilder().build();
  }
  
  static admin(): CustomerData {
    return new CustomerBuilder().asAdmin().build();
  }
  
  static unverified(): CustomerData {
    return new CustomerBuilder().unverified().build();
  }
}
```

### Coupon builder

```typescript
// src/builders/coupon.builder.ts
import { randomBytes } from 'crypto';

export interface CouponData {
  id?: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrderValue?: number;
  maxUses?: number;
  usedCount?: number;
  expiresAt?: string;
  active?: boolean;
}

export class CouponBuilder {
  private data: CouponData;
  
  constructor() {
    this.data = {
      code: `COUPON-${randomBytes(4).toString('hex').toUpperCase()}`,
      type: 'percent',
      value: 10,
      active: true,
    };
  }
  
  percent(value: number): this {
    this.data.type = 'percent';
    this.data.value = value;
    return this;
  }
  
  fixed(amount: number): this {
    this.data.type = 'fixed';
    this.data.value = amount;
    return this;
  }
  
  withMinOrder(minOrder: number): this {
    this.data.minOrderValue = minOrder;
    return this;
  }
  
  withMaxUses(uses: number): this {
    this.data.maxUses = uses;
    return this;
  }
  
  expiresIn(days: number): this {
    const date = new Date();
    date.setDate(date.getDate() + days);
    this.data.expiresAt = date.toISOString();
    return this;
  }
  
  build(): CouponData {
    return { ...this.data };
  }
  
  static tenPercentOff(): CouponData {
    return new CouponBuilder().percent(10).build();
  }
  
  static freeShipping(): CouponData {
    return new CouponBuilder().fixed(0).build();
  }
}
```

---

## Sekcja 3: Fixture architecture — App fixture

### App fixture with domain objects

```typescript
// src/fixtures/app.fixture.ts
import { test as base, Page, APIRequestContext } from '@playwright/test';
import { ProductBuilder, ProductData } from '../builders/product.builder';
import { CustomerBuilder, CustomerData } from '../builders/customer.builder';
import { CouponBuilder, CouponData } from '../builders/coupon.builder';

// Import page objects
import { HomePage } from '../pages/home.page';
import { ProductPage } from '../pages/product.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { AccountPage } from '../pages/account.page';
import { LoginPage } from '../pages/login.page';

// Import API clients
import { ProductsClient } from '../api/products.client';
import { CartClient } from '../api/cart.client';
import { AuthClient } from '../api/auth.client';
import { OrdersClient } from '../api/orders.client';

interface AppFixtures {
  // UI pages
  home: HomePage;
  product: ProductPage;
  cart: CartPage;
  checkout: CheckoutPage;
  account: AccountPage;
  login: LoginPage;
  
  // API clients
  api: {
    products: ProductsClient;
    cart: CartClient;
    auth: AuthClient;
    orders: OrdersClient;
  };
  
  // Builders
  builders: {
    product: typeof ProductBuilder;
    customer: typeof CustomerBuilder;
    coupon: typeof CouponBuilder;
  };
  
  // Shop operations (high-level)
  shop: {
    login: {
      loginAs: (customer: CustomerData) => Promise<void>;
      logout: () => Promise<void>;
    };
    products: {
      open: (productId: string) => Promise<void>;
      addToCart: () => Promise<void>;
      search: (query: string) => Promise<void>;
    };
    cart: {
      open: () => Promise<void>;
      applyCoupon: (code: string) => Promise<void>;
      updateQuantity: (productId: string, quantity: number) => Promise<void>;
      remove: (productId: string) => Promise<void>;
    };
    checkout: {
      fillAddress: (address: CustomerData['address']) => Promise<void>;
      payByTestCard: () => Promise<void>;
    };
  };
}

export const test = base.extend<AppFixtures>({
  // API clients
  api: async ({ request }, use) => {
    const clients = {
      products: new ProductsClient(request),
      cart: new CartClient(request),
      auth: new AuthClient(request),
      orders: new OrdersClient(request),
    };
    await use(clients);
  },
  
  // Page objects
  home: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  
  product: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  
  cart: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  
  checkout: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  
  account: async ({ page }, use) => {
    await use(new AccountPage(page));
  },
  
  login: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  
  // Builders
  builders: async ({}, use) => {
    await use({
      product: ProductBuilder,
      customer: CustomerBuilder,
      coupon: CouponBuilder,
    });
  },
  
  // High-level shop operations
  shop: async ({ page }, use) => {
    const shop = {
      login: {
        loginAs: async (customer: CustomerData) => {
          await page.goto('/login');
          await page.getByLabel('Email').fill(customer.email);
          await page.getByLabel('Hasło').fill('TestPassword123!');
          await page.getByRole('button', { name: 'Zaloguj' }).click();
          await page.waitForURL('/dashboard');
        },
        logout: async () => {
          await page.getByRole('button', { name: 'Wyloguj' }).click();
          await page.waitForURL('/');
        },
      },
      products: {
        open: async (productId: string) => {
          await page.goto(`/products/${productId}`);
          await page.waitForLoadState('networkidle');
        },
        addToCart: async () => {
          await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
          await expect(page.getByText('Dodano do koszyka')).toBeVisible();
        },
        search: async (query: string) => {
          await page.getByPlaceholder('Szukaj...').fill(query);
          await page.getByRole('button', { name: 'Szukaj' }).click();
        },
      },
      cart: {
        open: async () => {
          await page.goto('/cart');
        },
        applyCoupon: async (code: string) => {
          await page.getByPlaceholder('Kod rabatowy').fill(code);
          await page.getByRole('button', { name: 'Zastosuj' }).click();
        },
        updateQuantity: async (productId: string, quantity: number) => {
          await page.locator(`[data-product-id="${productId}"] input[type="number"]`).fill(String(quantity));
        },
        remove: async (productId: string) => {
          await page.locator(`[data-product-id="${productId}"] button[aria-label="Usuń"]`).click();
        },
      },
      checkout: {
        fillAddress: async (address: CustomerData['address']) => {
          if (!address) return;
          await page.getByLabel('Ulica').fill(address.street);
          await page.getByLabel('Miasto').fill(address.city);
          await page.getByLabel('Kod pocztowy').fill(address.postalCode);
        },
        payByTestCard: async () => {
          await page.getByLabel('Numer karty').fill('4242424242424242');
          await page.getByLabel('MM/RR').fill('1230');
          await page.getByLabel('CVV').fill('123');
        },
      },
    };
    
    await use(shop);
  },
});
```

---

## Sekcja 4: Critical flow tests

### Checkout smoke test

```typescript
// tests/smoke/checkout.spec.ts
import { test, expect } from '../fixtures/app';

test.describe('Checkout Smoke', () => {
  test.beforeEach(async ({ shop, builders, api }) => {
    // Create test data
    const product = builders.product.random();
    const createdProduct = await api.products.create(product);
    
    // Make it available globally for the test
    test.info().parameters.productId = createdProduct.id;
  });
  
  test('customer can complete full checkout flow @critical', async ({ shop, api, page }) => {
    const productId = test.info().parameters.productId;
    
    // Step 1: Browse and add to cart
    await shop.products.open(productId);
    await shop.products.addToCart();
    
    // Step 2: Verify cart
    await shop.cart.open();
    await expect(page.locator('.cart-item')).toHaveCount(1);
    
    // Step 3: Apply coupon
    const coupon = await api.coupons.create(
      new (await import('../builders/coupon.builder')).CouponBuilder().percent(10).build()
    );
    await shop.cart.applyCoupon(coupon.code);
    
    // Step 4: Checkout
    await page.getByRole('button', { name: 'Przejdź do kasy' }).click();
    await shop.checkout.fillAddress({
      street: 'ul. Testowa 1',
      city: 'Warszawa',
      postalCode: '00-001',
      country: 'Polska',
    });
    
    // Step 5: Payment (sandbox)
    await shop.checkout.payByTestCard();
    await page.getByRole('button', { name: 'Zapłać' }).click();
    
    // Step 6: Verify confirmation
    await expect(page.getByRole('heading', { name: /zamówienie.*potwierdzone/i })).toBeVisible();
    await expect(page.getByText(/dziękujemy.*zakup/i)).toBeVisible();
    
    // Step 7: Verify order in system
    const order = await api.orders.getLatest();
    expect(order.status).toBe('PAID');
    expect(order.total).toBeLessThan(product.price);  // Discount applied
  });
  
  test('checkout handles out-of-stock product', async ({ shop, builders, api }) => {
    const outOfStockProduct = builders.product.outOfStock();
    const created = await api.products.create(outOfStockProduct);
    
    await shop.products.open(created.id);
    
    // Should show out of stock or disable add to cart
    const addButton = page.getByRole('button', { name: 'Dodaj do koszyka' });
    await expect(addButton).toBeDisabled({ timeout: 3000 }).catch(() => {
      // Or show message
      expect(page.getByText(/niedostępny|brak.*stock/i)).toBeVisible();
    });
  });
});
```

### Pricing calculation tests

```typescript
// tests/regression/pricing.spec.ts
import { test, expect } from '../fixtures/app';

test.describe('Pricing and Discounts', () => {
  test('percentage discount is calculated correctly', async ({ shop, builders, api }) => {
    const product = builders.product.withPrice(100);
    const created = await api.products.create(product);
    
    const coupon = builders.coupon.percent(15);
    await api.coupons.create(coupon);
    
    await shop.products.open(created.id);
    await shop.products.addToCart();
    await shop.cart.open();
    await shop.cart.applyCoupon(coupon.code);
    
    // Should show 15% off = 85.00
    const totalText = await page.locator('.cart-total').textContent();
    expect(totalText).toContain('85');
    expect(totalText).not.toContain('100');
  });
  
  test('minimum order value is enforced', async ({ shop, builders, api }) => {
    const cheapProduct = builders.product.withPrice(5);
    const created = await api.products.create(cheapProduct);
    
    const coupon = builders.coupon.percent(20).withMinOrder(100);
    await api.coupons.create(coupon);
    
    await shop.products.open(created.id);
    await shop.products.addToCart();
    await shop.cart.open();
    await shop.cart.applyCoupon(coupon.code);
    
    // Should show error or prevent applying
    await expect(page.getByText(/minimalna.*wartość|nie.*spełnia/i)).toBeVisible();
  });
  
  test('expired coupon is rejected', async ({ shop, builders, api }) => {
    const product = builders.product.random();
    const created = await api.products.create(product);
    
    const expiredCoupon = builders.coupon.percent(10).expiresIn(-1);  // Expired yesterday
    await api.coupons.create(expiredCoupon);
    
    await shop.products.open(created.id);
    await shop.products.addToCart();
    await shop.cart.open();
    await shop.cart.applyCoupon(expiredCoupon.code);
    
    await expect(page.getByText(/wygasł|nie.*obowiązuje/i)).toBeVisible();
  });
  
  test('sale price takes priority over regular price', async ({ shop, builders, api }) => {
    const saleProduct = builders.product.withPrice(100).onSale(60);
    const created = await api.products.create(saleProduct);
    
    await shop.products.open(created.id);
    
    // Should show sale price
    const priceElement = page.locator('.product-price');
    const priceText = await priceElement.textContent();
    expect(priceText).toContain('60');
    expect(priceText).not.toContain('100');
  });
});
```

### Multi-tenant isolation test

```typescript
// tests/security/tenant-isolation.spec.ts
import { test, expect } from '../fixtures/app';

test.describe('Tenant Data Isolation', () => {
  test('user from tenant A cannot access tenant B orders', async ({ shop, builders, api }) => {
    // Create two tenants with users
    const tenantACustomer = builders.customer.default();
    const customerA = await api.auth.register(tenantACustomer);
    
    const tenantBCustomer = builders.customer.default();
    const customerB = await api.auth.register(tenantBCustomer);
    
    // Create orders for each tenant
    const orderA = await api.orders.create({ customerId: customerA.id });
    const orderB = await api.orders.create({ customerId: customerB.id });
    
    // Login as customer A
    await shop.login.loginAs(customerA);
    
    // Try to access customer B's order
    await page.goto(`/orders/${orderB.id}`);
    
    // Should be denied
    await expect(page.getByText(/brak dostępu|nie znaleziono/i)).toBeVisible({ timeout: 3000 });
  });
  
  test('user can only see their own orders', async ({ shop, builders, api }) => {
    const customer = builders.customer.default();
    const created = await api.auth.register(customer);
    
    // Create multiple orders
    const orders = await Promise.all([
      api.orders.create({ customerId: created.id }),
      api.orders.create({ customerId: created.id }),
      api.orders.create({ customerId: created.id }),
    ]);
    
    await shop.login.loginAs(created);
    await page.goto('/account/orders');
    
    // Should see all own orders
    for (const order of orders) {
      await expect(page.getByText(`Zamówienie #${order.id}`)).toBeVisible();
    }
    
    // Should NOT see any test orders from other customers
    const otherOrderIds = await api.orders.getAll({ page: 1, limit: 50 });
    const ownOrderIds = orders.map(o => o.id);
    
    for (const order of otherOrderIds) {
      if (!ownOrderIds.includes(order.id)) {
        await expect(page.getByText(`Zamówienie #${order.id}`)).not.toBeVisible();
      }
    }
  });
});
```

---

## Sekcja 5: CI/CD configuration

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  BASE_URL: ${{ vars.APP_URL }}
  E2E_USER: ${{ secrets.E2E_USER }}
  E2E_PASSWORD: ${{ secrets.E2E_PASSWORD }}

jobs:
  smoke:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      
      - name: Run smoke tests
        run: npx playwright test tests/smoke --reporter=line,junit,json
      
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: smoke-results
          path: |
            test-results/
            playwright-report/
      
      - name: Publish JUnit results
        uses: dorny/test-reporter@v1
        with:
          name: E2E Smoke Tests
          path: test-results/junit.xml
          reporter: java-junit
      
      - name: Publish HTML report
        uses: peaceiris/actions-gh-pages@v3
        if: always()
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: playwright-report
          publish_branch: gh-pages

  regression:
    needs: smoke
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      
      - name: Install and run
        run: |
          npm ci
          npx playwright install --with-deps
          npx playwright test tests/regression --shard=${{ matrix.shard }}/4
      
      - name: Upload results
        uses: actions/upload-artifact@v4
        with:
          name: regression-shard-${{ matrix.shard }}
          path: test-results/
```

---

## Sekcja 6: Project documentation

### README structure

```markdown
# E-commerce E2E Test Suite

## Overview

Automated E2E test suite for e-commerce platform covering:
- Critical purchase flows
- Pricing and discount calculations
- User account management
- Multi-tenant data isolation

## Quick Start

```bash
# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install --with-deps

# Run smoke tests
npx playwright test tests/smoke

# Run all tests
npx playwright test

# Open HTML report
npx playwright show-report
```

## Architecture

### Test Layers

| Layer | Location | Trigger | Purpose |
|-------|----------|---------|---------|
| Smoke | `tests/smoke/` | Every PR | Core purchase flow |
| Regression | `tests/regression/` | Main push | Full coverage |
| API | `tests/api/` | Every PR | Contract validation |
| Security | `tests/security/` | Daily | Access control |
| Compliance | `tests/compliance/` | Weekly | GDPR, cookies |

### Key Components

- **Fixtures** (`src/fixtures/`) — App-level fixtures with shop operations
- **Builders** (`src/builders/`) — Deterministic test data creation
- **Pages** (`src/pages/`) — Page Object Models
- **API Clients** (`src/api/`) — Typed API clients

## Environment Variables

```bash
BASE_URL=https://shop.example.com
E2E_USER=test@example.com
E2E_PASSWORD=...
```

## Test Strategy

### Risk-Based Coverage

We test based on business risk, not feature coverage:

**High Priority (Smoke)**
- Complete checkout flow
- User login/logout
- Product search and add to cart

**Medium Priority (Regression)**
- Pricing calculations
- Coupon application
- Order history

**Low Priority (Weekly)**
- Security tests
- Compliance checks
- Visual regression

## Known Limitations

- Payment tests use Stripe sandbox — not real transactions
- Tests run against staging environment only
- Mobile testing limited to iPhone 12 viewport

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for standards and workflow.
```

---

## Perspektywa Full Stack Testera

Projekt e-commerce to demonstration of full stack thinking. Jako Full Stack Tester:

**Strategic zakres**: NIE testujesz wszystkiego. Testujesz najważniejsze ryzyka biznesowe. Reszta to szczegóły.

**Architecture matters**: Page Objects, Fixtures, Builders — to nie boilerplate, to architektura pozwalająca na skalowanie.

**Data isolation**: Każdy test tworzy swoje dane. Testy nie zależą od siebie. Mogą uruchamiać się równolegle.

**CI integration**: Testy bez CI to hobby project. Testy z CI to profesjonalny system jakości.

**Documentation**: README i ADR pokazują, że rozumiesz decyzje, nie tylko technologię.

---

## Podsumowanie

- **Risk-based zakres** — testuj najważniejsze ryzyka biznesowe, nie wszystkie funkcje.
- **Warstwowa architektura** — smoke, regression, API, security, compliance — każda warstwa ma inny cel.
- **Data builders** — deterministyczne, izolowane dane testowe. Każdy test tworzy swoje dane.
- **App fixtures** — high-level shop operations (login, addToCart, checkout) jako fixtures dla czytelnych testów.
- **CI/CD** — smoke na PR, regression na main, quality gates, artifact publishing.
- **Documentation** — README, CONTRIBUTING, ADR — wszystko, co pozwala innym uruchomić i zrozumieć projekt.

---

## Linki i źródła

- [Playwright Test Patterns](https://playwright.dev/docs/test-pom) — Page Object Model patterns
- [Test Automation University — E2E Testing](https://testautomationu.applitools.com/) — comprehensive e2e testing course
- [Testing Library — Priority](https://testing-library.com/docs/guiding-principles) — guiding principles for test design
- [Risk-Based Testing — ISTQB](https://www.istqb.org/downloads/send/51-foundation-level-extensions/135-ctfl-tm-ext-newsample-exam-a4.html) — risk-based testing approach