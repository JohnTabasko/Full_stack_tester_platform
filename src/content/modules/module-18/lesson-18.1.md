# Podstawy TypeScript dla Automatyzacji Testów — Bezpieczny Typowo Kod Testowy

> **Perspektywa Full Stack Testera**
> TypeScript to nie tylko „JavaScript z typami" — to potężne narzędzie, które zamienia potencjalne błędy runtime w wyłapane wcześniej błędy kompilacji. W automatyzacji testów, gdzie kod często piszesz szybko, pod presją czasu, i gdzie zmiany w API czy UI mogą pojawić się bez ostrzeżenia, system typów staje się Twoim najlepszym sprzymierzeńcem. Zamiast czekać na runtime failure podczas uruchomienia testu o 3:00 w nocy, TypeScript powie Ci „hej, przekazujesz string tam, gdzie oczekiwany jest numer" — zanim test w ogóle zostanie uruchomiony. W tej lekcji zdobędziesz praktyczne umiejętności modelowania danych testowych, tworzenia bezpiecznych kontraktów i pisania kodu, który jest jednocześnie dokumentacją i zabezpieczeniem przed regresjami.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Rozumieć** dlaczego TypeScript jest kluczowy w automatyzacji testów
- **Definiować** typy i interfejsy dla danych testowych (użytkownicy, zamówienia, API)
- **Stosować** union types do ograniczania wartości do znanych wariantów
- **Tworzyć** generyczne helpery i funkcje pomocnicze
- **Wykorzystywać** utility types (Partial, Pick, Omit, Required) do transformacji typów
- **Weryfikować** zgodność kontraktów API z typami TypeScript
- **Konfigurować** środowisko TypeScript w projekcie Playwright

---

## Wprowadzenie — dlaczego typy są dokumentacją kontraktu

Wyobraź sobie następujący scenariusz:

1. Backend zmienia strukturę odpowiedzi API: `status` zamiast `orderStatus`
2. Twój test nadal używa starego pola `orderStatus`
3. Test przechodzi, ale nie sprawdza prawdziwego statusu — fałszywy negatyw!
4. Problem ujawnia się dopiero w produkcji

Z TypeScriptem ten scenariusz wygląda inaczej:

1. Backend zmienia strukturę — TypeScript natychmiast pokazuje błąd w edytorze
2. Wszystkie testy używające starego pola przestają się kompilować
3. Musisz jawnie zaktualizować typy i kod testowy
4. **Błąd wykryty przed uruchomieniem testu, nie w produkcji**

### 1.1 Korzyści z TypeScript w testach

| Aspekt | JavaScript | TypeScript |
|--------|------------|------------|
| **Wykrywanie błędów** | Runtime (podczas testu) | Kompilacja (przed testem) |
| **Dokumentacja** | Brak / komentarze | Wbudowana w typach |
| **Refaktoryzacja** | Ryzykowna — łatwo przeoczyć zależności | Bezpieczna — kompilator wskaże wszystkie użycia |
| **Intellisense** | Podstawowy | Pełny — autouzupełnianie, dokumentacja, nawigacja |
| **Onboarding** | Naucz się kodu, pytaj ludzi | Czytaj typy, eksploruj strukturę |

---

## Sytuacja przewodnia — testy z modelowaniem danych

Twój zespół testuje system e-commerce przez API. Testy tworzą użytkowników, zamówienia i płatności. Backend planuje zmianę kontraktu: `status` zamówienia zmienia się z `string` na `enum`, a pole `totalPrice` jest zastępowane przez `orderTotal` (obiekt z `amount` i `currency`).

Twoim zadaniem jest napisać testy tak, aby ta zmiana została wykryta **przed uruchomieniem regresji**, na etapie kompilacji.

---

## 1. Podstawowe typy i ich zastosowanie

### 1.1 Typy prymitywne

```typescript
// Typy prymitywne w automatyzacji testów
const userEmail: string = 'test@example.com';
const orderCount: number = 42;
const isActive: boolean = true;
const timeout: number | null = null;  // undefined i null są dozwolone w wielu kontekstach
```

### 1.2 Typy dla danych testowych

```typescript
// Definicja użytkownika testowego
type UserRole = 'customer' | 'admin' | 'support' | 'moderator';

interface TestUser {
  id: number;
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  active: boolean;
  emailVerified: boolean;
  createdAt: Date;
}

// Alternatywnie — dla bardziej elastycznego podejścia:
type UserData = {
  email: string;
  password: string;
  role?: UserRole;
  profile?: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
};
```

### 1.3 Typ dla zamówienia

```typescript
// Statusy zamówień — zamknięta lista wartości
type OrderStatus = 
  | 'PENDING' 
  | 'PROCESSING' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'REFUNDED';

// Interfejs zamówienia
interface TestOrder {
  id: number;
  orderNumber: string;
  userId: number;
  items: OrderItem[];
  totalPrice: number;
  currency: 'PLN' | 'EUR' | 'USD' | 'GBP';
  status: OrderStatus;
  shippingAddress: Address;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}
```

---

## 2. Interfejsy vs Type Aliases — kiedy co wybrać?

### 2.1 Type Alias

```typescript
// Użyj type alias dla prostych kombinacji
type UserId = number;
type OrderId = number;
type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: string | null;
  timestamp: Date;
};
```

### 2.2 Interface

```typescript
// Użyj interface dla obiektów z zachowaniem kontraktu
interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserDto): Promise<User>;
  update(id: UserId, data: UpdateUserDto): Promise<User>;
  delete(id: UserId): Promise<void>;
}

// Interface można rozszerzać
interface AdminUser extends TestUser {
  permissions: string[];
  lastLoginAt: Date;
  twoFactorEnabled: boolean;
}
```

### 2.3 Reguła praktyczna

```typescript
// ✅ DOBRZE: interface dla obiektów z metodami lub rozszerzeniem
interface PageObject {
  goto(url: string): Promise<void>;
  getTitle(): Promise<string>;
}

// ✅ DOBRZE: type alias dla kombinacji, union, primitive aliases
type PositiveNumber = number;
type HttpStatus = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 500;
type ConfigKey = 'apiUrl' | 'timeout' | 'retries';
```

---

## 3. Union Types — ograniczanie wartości

### 3.1 Podstawowe union types

```typescript
// Zamiast string — zamknięta lista dozwolonych wartości
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type PaymentMethod = 'CARD' | 'BLIK' | 'TRANSFER' | 'PAYPAL';

type Currency = 'PLN' | 'EUR' | 'USD' | 'GBP' | 'CHF';

// Zastosowanie w helperze API
async function apiRequest<T>(
  method: HttpMethod,
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  // Implementacja...
  const response = await fetch(endpoint, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  return response.json() as Promise<ApiResponse<T>>;
}

// Teraz TypeScript nie pozwoli na:
// apiRequest('OPTIONS', '/api/users')  // ❌ Błąd kompilacji!
```

### 3.2 Union types w walidacji

```typescript
// Funkcja walidująca status zamówienia
function isValidOrderStatus(status: string): status is OrderStatus {
  const validStatuses: OrderStatus[] = [
    'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 
    'COMPLETED', 'CANCELLED', 'REFUNDED'
  ];
  return validStatuses.includes(status as OrderStatus);
}

// Użycie z guard
const apiResponse = await fetch('/api/orders/123');
const data = await apiResponse.json() as { status: string };

if (isValidOrderStatus(data.status)) {
  // TypeScript wie, że data.status jest OrderStatus
  console.log(`Zamówienie ${data.status} jest poprawne`);
} else {
  console.error(`Nieznany status: ${data.status}`);
}
```

### 3.3 Literal types dla konkretnych wartości

```typescript
// Bardzo specyficzne typy dla danych testowych
type TestEnvironment = 'local' | 'dev' | 'staging' | 'production';

type BrowserType = 'chromium' | 'firefox' | 'webkit';

type ViewportPreset = 'mobile' | 'tablet' | 'desktop' | 'wide';

// Konfiguracja środowiska testowego
interface TestConfig {
  environment: TestEnvironment;
  browser: BrowserType;
  viewport: ViewportPreset;
  baseUrl: string;
  apiUrl: string;
  headless: boolean;
}

// TypeScript zapobiegnie literówkom:
// const config: TestConfig = { environment: 'prod' };  // ❌ 'prod' nie istnieje
// const config: TestConfig = { environment: 'production' };  // ✅ OK
```

---

## 4. Generics — elastyczne, typowo-bezpieczne helpery

### 4.1 Podstawowe generics

```typescript
// Funkcja generyczna do pobierania jednego elementu
async function getById<T extends { id: number }>(
  collection: T[],
  id: number
): Promise<T | null> {
  return collection.find(item => item.id === id) ?? null;
}

// Użycie
interface Product {
  id: number;
  name: string;
  price: number;
}

const products: Product[] = [
  { id: 1, name: 'Laptop', price: 3999 },
  { id: 2, name: 'Mouse', price: 99 },
];

const product = await getById(products, 1);
// TypeScript wie, że product jest typu Product | null
```

### 4.2 Generyczny klient API

```typescript
// Klient API z typowaniem odpowiedzi
interface ApiClient {
  get<T>(endpoint: string): Promise<T>;
  post<T>(endpoint: string, data: unknown): Promise<T>;
  put<T>(endpoint: string, data: unknown): Promise<T>;
  delete<T>(endpoint: string): Promise<T>;
}

class HttpApiClient implements ApiClient {
  constructor(private baseUrl: string) {}
  
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json() as T;
  }
  
  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json() as T;
  }
  
  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json() as T;
  }
  
  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
    });
    return response.json() as T;
  }
}

// Użycie z pełnym typowaniem
const api = new HttpApiClient('https://api.example.com');

interface User {
  id: number;
  email: string;
  role: UserRole;
}

interface CreateUserRequest {
  email: string;
  password: string;
  role: UserRole;
}

const user = await api.post<User>('/users', {
  email: 'new@example.com',
  password: 'SecurePass123!',
  role: 'customer',
} as CreateUserRequest);

// TypeScript wie, że user jest typu User
console.log(`Utworzono użytkownika: ${user.email} (ID: ${user.id})`);
```

### 4.3 Generyczny builder danych testowych

```typescript
// Builder z generykami dla różnych typów danych
class DataBuilder<TData extends object, TOverrides extends Partial<TData> = {}> {
  constructor(
    private defaults: TData,
    private factory: (data: TData) => TData
  ) {}
  
  with(overrides: TOverrides): DataBuilder<TData, TOverrides> {
    return new DataBuilder<TData, TOverrides>(
      { ...this.defaults, ...overrides } as TData,
      this.factory
    );
  }
  
  build(): TData {
    return this.factory(this.defaults);
  }
}

// Builder dla użytkowników
const defaultUser: TestUser = {
  id: 0,  // 0 oznacza, że serwer wygeneruje ID
  email: `qa+${Date.now()}@example.test`,
  password: 'TestPassword123!',
  fullName: 'Test User',
  role: 'customer',
  active: true,
  emailVerified: true,
  createdAt: new Date(),
};

function createUser(data: TestUser): TestUser {
  return {
    ...data,
    id: data.id === 0 ? Math.floor(Math.random() * 100000) : data.id,
  };
}

const userBuilder = new DataBuilder(defaultUser, createUser);

// Użycie
const regularUser = userBuilder.build();
const adminUser = userBuilder.with({ role: 'admin', emailVerified: false }).build();
const customUser = userBuilder.with({ 
  fullName: 'John Doe', 
  role: 'support' 
}).build();

// Wszystkie typy są poprawne, TypeScript pilnuje zgodności
```

---

## 5. Utility Types — transformacje typów

### 5.1 Partial — wszystko opcjonalne

```typescript
// Częściowa aktualizacja — wszystkie pola opcjonalne
type UpdateUserDto = Partial<Omit<TestUser, 'id' | 'createdAt'>>;

// Użycie
const updateData: UpdateUserDto = {
  fullName: 'Jan Kowalski',  // tylko to pole
  // inne pola opcjonalne — można pominąć
};

// TypeScript pozwala na:
const partialUpdate: UpdateUserDto = { email: 'new@example.com' };
// Ale nie pozwoli na:
const invalidUpdate: UpdateUserDto = { id: 999 };  // ❌ id jest wykluczone
```

### 5.2 Pick — wybór konkretnych pól

```typescript
// Tylko potrzebne pola do tworzenia użytkownika
type CreateUserDto = Pick<TestUser, 'email' | 'password' | 'fullName' | 'role'>;

// Użycie
function createUser(data: CreateUserDto): Promise<TestUser> {
  return api.post<TestUser>('/users', data);
}

// Działa:
await createUser({
  email: 'test@example.com',
  password: 'password',
  fullName: 'Test User',
  role: 'customer',
});

// Nie działa (brakuje wymaganych):
await createUser({
  email: 'test@example.com',
});  // ❌ Błąd: brakuje password, fullName, role
```

### 5.3 Omit — usunięcie zbędnych pól

```typescript
// Publiczny profil użytkownika — bez hasła i wewnętrznych pól
type PublicUserProfile = Omit<TestUser, 'password' | 'emailVerified'> & {
  avatarUrl: string | null;
  memberSince: Date;
};

// Użycie w asercji
const apiResponse = await api.get<ApiResponse<TestUser>>('/users/123');
const publicProfile: PublicUserProfile = {
  ...apiResponse.data,
  avatarUrl: '/avatars/default.png',
  memberSince: apiResponse.data.createdAt,
};

// Nie można przypisać:
const invalidProfile: PublicUserProfile = {
  ...apiResponse.data,
  password: 'hacked',  // ❌ password usunięty z typu
};
```

### 5.4 Required i Readonly

```typescript
// Wszystko obowiązkowe
type CompleteUser = Required<TestUser>;

// Tylko do odczytu
type FrozenUser = Readonly<TestUser>;

// Zastosowanie: fixture niezmiennego użytkownika
const defaultAdmin: Readonly<Required<TestUser>> = {
  id: 1,
  email: 'admin@example.com',
  password: 'AdminPass123!',
  fullName: 'System Administrator',
  role: 'admin',
  active: true,
  emailVerified: true,
  createdAt: new Date('2020-01-01'),
} as const;  // as const dodatkowo blokuje wartości na etapie JS

// Próba modyfikacji:
defaultAdmin.email = 'hacked@example.com';  // ❌ Błąd kompilacji (Readonly)
```

### 5.5 Combining utility types — praktyczny przykład

```typescript
// Formularz rejestracji — kombinacja Pick i Partial
type RegistrationForm = Pick<TestUser, 'email' | 'password' | 'fullName'> & {
  confirmPassword: string;
  termsAccepted: boolean;
};

// Walidacja formularza
function validateRegistration(form: RegistrationForm): string[] {
  const errors: string[] = [];
  
  if (form.password !== form.confirmPassword) {
    errors.push('Hasła nie są identyczne');
  }
  
  if (!form.termsAccepted) {
    errors.push('Musisz zaakceptować regulamin');
  }
  
  if (!form.email.includes('@')) {
    errors.push('Nieprawidłowy adres email');
  }
  
  return errors;
}

// Usage
const formData: RegistrationForm = {
  email: 'user@example.com',
  password: 'Secure123!',
  fullName: 'Jan Kowalski',
  confirmPassword: 'Secure123!',
  termsAccepted: true,
};

const errors = validateRegistration(formData);
expect(errors).toHaveLength(0);
```

---

## 6. Typowanie odpowiedzi API — praktyczny przykład

### 6.1 Reakcja na zmianę kontraktu

**Scenariusz:** Backend zmienia strukturę odpowiedzi zamówienia.

```typescript
// Stary kontrakt (już nieaktualny)
interface OldOrderResponse {
  orderId: number;
  orderStatus: string;  // ❌ Zmienione na: status
  totalPrice: number;   // ❌ Zmienione na: orderTotal.amount
}

// Nowy kontrakt
interface NewOrderResponse {
  id: number;
  status: OrderStatus;
  orderTotal: {
    amount: number;
    currency: Currency;
  };
  customer: {
    id: number;
    email: string;
  };
  createdAt: string;  // ISO date string, nie Date
}

// Stary kod testowy — TypeScript pokaże błędy!
async function getOrderOld(orderId: number): Promise<OldOrderResponse> {
  const response = await fetch(`/api/orders/${orderId}`);
  return response.json();
}

// Próba użycia starego typu:
const order = await getOrderOld(123);
// order.orderStatus  // ❌ Ta właściwość nie istnieje!
// order.totalPrice   // ❌ Ta właściwość nie istnieje!

// Nowy kod — zgodny z aktualnym kontraktem
async function getOrderNew(orderId: number): Promise<NewOrderResponse> {
  const response = await fetch(`/api/orders/${orderId}`);
  return response.json();
}

const newOrder = await getOrderNew(123);
console.log(`Status: ${newOrder.status}`);  // ✅ OrderStatus
console.log(`Kwota: ${newOrder.orderTotal.amount} ${newOrder.orderTotal.currency}`);  // ✅
```

### 6.2 Walidator kontraktu API

```typescript
// Validator sprawdzający zgodność odpowiedzi z typem
function validateApiResponse<T>(data: unknown, schema: z.ZodType<T>): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
    throw new Error(`API response validation failed:\n${errors.join('\n')}`);
  }
  
  return result.data;
}

// Użycie z biblioteką Zod (https://zod.dev)
import { z } from 'zod';

const OrderSchema = z.object({
  id: z.number(),
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED']),
  orderTotal: z.object({
    amount: z.number().positive(),
    currency: z.enum(['PLN', 'EUR', 'USD', 'GBP']),
  }),
  customer: z.object({
    id: z.number(),
    email: z.string().email(),
  }),
  createdAt: z.string().datetime(),
});

// W teście
test('API zwraca poprawne dane zamówienia', async ({ request }) => {
  const response = await request.get('/api/orders/123');
  expect(response.status()).toBe(200);
  
  const order = validateApiResponse(await response.json(), OrderSchema);
  
  expect(order.status).toBe('PENDING');
  expect(order.orderTotal.amount).toBeGreaterThan(0);
  expect(order.customer.email).toContain('@');
});
```

---

## 7. Konfiguracja TypeScript w projekcie Playwright

### 7.1 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "strictNullChecks": true,
    "strictPropertyInitialization": true
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist", "playwright-report"]
}
```

### 7.2 Integracja z Playwright

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  
  // Konfiguracja TypeScript
  use: {
    // Włączone przez default w Playwright 1.40+
  },
});
```

### 7.3 Skrypty w package.json

```json
{
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:smoke": "playwright test --grep @smoke",
    "test:regression": "playwright test --grep @regression",
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src tests --ext .ts",
    "format": "prettier --write \"src/**/*.ts\" \"tests/**/*.ts\""
  }
}
```

---

## 8. Typowanie w Page Object Model

```typescript
// tests/pages/base.page.ts
export interface PageElement {
  selector: string;
  timeout?: number;
}

export abstract class BasePage {
  constructor(protected page: Page) {}
  
  async navigateTo(path: string): Promise<void> {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }
  
  async click(element: PageElement): Promise<void> {
    await this.page.click(element.selector, { 
      timeout: element.timeout ?? 30000 
    });
  }
  
  async fill(element: PageElement, value: string): Promise<void> {
    await this.page.fill(element.selector, value);
  }
  
  async getText(element: PageElement): Promise<string> {
    return this.page.textContent(element.selector) ?? '';
  }
}

// tests/pages/login.page.ts
interface LoginFormElements {
  email: PageElement;
  password: PageElement;
  submitButton: PageElement;
  errorMessage: PageElement;
}

export class LoginPage extends BasePage {
  private elements: LoginFormElements = {
    email: { selector: '[data-testid="login-email"]' },
    password: { selector: '[data-testid="login-password"]' },
    submitButton: { selector: '[data-testid="login-submit"]' },
    errorMessage: { selector: '[data-testid="login-error"]', timeout: 5000 },
  };
  
  async login(credentials: { email: string; password: string }): Promise<void> {
    await this.fill(this.elements.email, credentials.email);
    await this.fill(this.elements.password, credentials.password);
    await this.click(this.elements.submitButton);
  }
  
  async getErrorMessage(): Promise<string | null> {
    const isVisible = await this.page.isVisible(this.elements.errorMessage.selector);
    return isVisible ? this.getText(this.elements.errorMessage) : null;
  }
}
```

---

## 9. Lista kontrolna TypeScript w testach

| Element | Status | Uwagi |
|---------|--------|-------|
| Wszystkie dane testowe mają typy | ☐ | |
| Odpowiedzi API są typowane | ☐ | |
| Funkcje pomocnicze są generyczne | ☐ | |
| Union types dla zamkniętych list wartości | ☐ | |
| Utility types do transformacji | ☐ | |
| Brak `any` w kodzie produkcyjnym | ☐ | |
| `strict` mode w tsconfig.json | ☐ | |
| Testy kompilują się bez błędów | ☐ | |
| Nowe pola API = nowe typy | ☐ | |

---

## Perspektywa Full Stack Testera

TypeScript w automatyzacji testów to nie narzut — to inwestycja. Początkowo może się wydawać, że pisanie typów spowalnia, ale:

- **Koszt typu** = 5 minut przy pisaniu
- **Koszt błędu runtime** = 30-60 minut na debugging + potencjalna awaria produkcji + utrata zaufania

Różnica jest oczywista. Jako Full Stack Tester, którego kod jest częścią pipeline CI/CD i którego testy chronią jakość przed wdrożeniem, masz obowiązek pisać kod możliwie najbezpieczniejszy. TypeScript jest najlepszym narzędziem do tego celu w ekosystemie JavaScript/Node.js.

Pamiętaj: najlepszy test to taki, który wykrywa błąd **zanim dotrze on do użytkownika**. TypeScript pomaga Ci to osiągnąć.

---

## Podsumowanie

- **Typy są dokumentacją** — opisują kontrakt między komponentami
- **Interface vs type alias** — interface dla obiektów z rozszerzeniem, type alias dla kombinacji
- **Union types** — zamknięta lista wartości zamiast „dowolny string"
- **Generics** — elastyczne, typowo-bezpieczne helpery dla różnych typów danych
- **Utility types** (Partial, Pick, Omit, Required) — transformacje typów bez duplikacji
- **Typowanie API** — wykrywanie zmian kontraktu na etapie kompilacji
- **Konfiguracja strict** — maksymalne bezpieczeństwo kosztem minimalnego narzutu

---

## Linki i źródła

- **[TypeScript Official Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)** — kompletna dokumentacja TypeScript
- **[TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)** — zaawansowane techniki TypeScript
- **[Zod — Schema Validation](https://zod.dev/)** — walidacja schematów w runtime
- **[Playwright + TypeScript Guide](https://playwright.dev/docs/intro)** — integracja Playwright z TypeScript
- **[Type-Fest](https://github.com/sindresorhus/type-fest)** — kolekcja utility types dla TypeScript
- **[Effective TypeScript — Dan Vanderkam](https://effectivetypescript.com/)** — best practices TypeScript
- **[TypeScript Playground](https://www.typescriptlang.org/play)** — eksperymentuj z TypeScript online