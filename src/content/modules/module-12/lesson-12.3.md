# Jakość kodu i utrzymywalność — Software Engineering w QA

> **Perspektywa Full Stack Testera**
> Testy automatyczne to oprogramowanie. Kod testowy musi być utrzymywany przez lata, rozwijany przez wielu ludzi i integrowany z CI/CD. Gdy piszesz test, który za miesiąc będzie musiał zostać zaktualizowany z powodu zmiany wymagań, chcesz, aby ta aktualizacja była prosta i bezpieczna. Zasady inżynierii oprogramowania — SOLID, DRY, KISS, spójne nazewnictwo, linting, code review — nie są tylko dla programistów. Są dla każdego, kto pisze kod, który ma działać przez długie lata. Jako Full Stack Tester z dobrą jakością kodu stajesz się prawdziwym inżynierem, nie tylko "automatyzatorem".

## Cel lekcji

Po ukończeniu tej lekcji rozumiesz zasady SOLID w kontekście testów automatycznych, znasz balans między DRY (Don't Repeat Yourself) a DAMP (Descriptive and Meaningful Phrases), potrafisz stosować konwencje nazewnictwa i unikać magic numbers, konfigurujesz ESLint dla Playwrighta, implementujesz Prettier i Husky dla automatycznej jakości, i rozumiesz, jak prowadzić efektywny Code Review w kontekście QA.

---

## Zasady SOLID w testach automatycznych

### S — Single Responsibility Principle (SRP)

**Zasada**: Każda klasa/funkcja/moduł powinien mieć jedną, jasno określoną odpowiedzialność.

```typescript
// ❌ Zła klasa — wiele odpowiedzialności
class TestHelper {
  async login(page) { /* logowanie */ }
  async createOrder(page, productId) { /* tworzenie zamówienia */ }
  async sendEmail(request, template) { /* wysyłanie emaila */ }
  async generateReport(results) { /* generowanie raportu */ }
  async cleanupDatabase() { /* cleanup */ }
} // Ta klasa wie za dużo — każda zmiana wymaga zmiany w wielu miejscach

// ✅ Dobre podejście — jedna odpowiedzialność na klasę
class LoginHelper {
  constructor(private page: Page) {}
  async login(email: string, password: string): Promise<void> { /* tylko logowanie */ }
}

class OrderHelper {
  constructor(private page: Page, private request: APIRequestContext) {}
  async createOrder(productId: string): Promise<OrderData> { /* tylko zamówienia */ }
}

class EmailHelper {
  constructor(private request: APIRequestContext) {}
  async sendEmail(template: string): Promise<void> { /* tylko emaile */ }
}
```

**W kontekście testów Playwright:**
- Jeden `test()` sprawdza jeden konkretny przypadek (nie "cały flow od logowania do zakupu").
- Jeden `Page Object` odpowiada za jedną stronę (nie za 10 stron naraz).
- Jeden `fixture` ma jedną odpowiedzialność (nie "setup + teardown + data + auth" w jednym).

### O — Open/Closed Principle (OCP)

**Zasada**: Klasy powinny być otwarte na rozbudowę, ale zamknięte na modyfikację.

```typescript
// ❌ Zła konstrukcja — modyfikujesz istniejący kod przy dodaniu nowej przeglądarki
test.describe('Testy na Chrome', () => {
  test('login działa na Chrome', async ({ page }) => { /* ... */ });
});

// ❌ Jeśli dodajesz Firefox, musisz DUPLIKOWAĆ kod
test.describe('Testy na Firefox', () => {
  test('login działa na Firefox', async ({ page }) => { /* ... */ });
});

// ✅ Dobre podejście — nowe przeglądarki przez konfigurację, nie kod
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
  ],
});

// test.spec.ts — jeden kod, wiele projektów
test('strona główna renderuje się poprawnie', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Moja Aplikacja/);
  // Ten sam test uruchomi się na Chrome, Firefox i iOS Safari!
});
```

### L — Liskov Substitution Principle (LSP)

**Zasada**: Obiekty klasy pochodnej powinny być możliwe do użycia tam, gdzie spodziewamy się obiektów klasy bazowej.

```typescript
// ❌ Problem: test zakłada konkretną implementację
test('test zależy od konkretnej metody', async () => {
  const page = new PlaywrightPage(); // Konkretna implementacja
  
  // Jeśli zmienisz na inną implementację (np. mock), test się zepsuje
  await page.gotoAndWaitForSelector('/products', '#product-list');
});

// ✅ Dobre podejście: test zależy od interfejsu
test('strona produktów jest widoczna', async ({ page }) => {
  // page jest interfejsem (abstrakcją) — każdy test może używać dowolnej implementacji
  await page.goto('/products');
  await expect(page.getByRole('main')).toBeVisible();
});
```

### I — Interface Segregation Principle (ISP)

**Zasada**: Lepiej mieć wiele wyspecjalizowanych interfejsów niż jeden ogólny.

```typescript
// ❌ Zły interfejs — wymusza na konsumentach wiedzę o wszystkim
interface ITestData {
  createUser(): User;
  createProduct(): Product;
  createOrder(): Order;
  cleanupUsers(): void;
  cleanupProducts(): void;
  cleanupOrders(): void;
}

// Konsument, który chce tylko użytkownika, musi znać wszystkie metody
class OrderTest {
  constructor(private data: ITestData) {
    this.data.createUser();  // Potrzebne
    this.data.cleanupUsers(); // Potrzebne
    // this.data.createProduct() — niepotrzebne, ale muszę wiedzieć że istnieje
  }
}

// ✅ Dobre podejście — wyspecjalizowane interfejsy
interface UserDataProvider {
  create(): Promise<UserData>;
  cleanup(): Promise<void>;
}

interface OrderDataProvider {
  create(): Promise<OrderData>;
  cleanup(): Promise<void>;
}

// Każdy konsument używa tylko tego, co potrzebuje
class OrderTest {
  constructor(
    private users: UserDataProvider,
    private orders: OrderDataProvider
  ) { /* proste i jasne */ }
}
```

### D — Dependency Inversion Principle (DIP)

**Zasada**: Moduły wysokiego poziomu nie powinny zależeć od modułów niskiego poziomu. Oba powinny zależeć od abstrakcji.

```typescript
// ❌ Zła zależność — test zależy od konkretnej implementacji
test('pobierz użytkownika z bazy', async () => {
  const db = new PrismaClient(); // Konkretna implementacja — skąd wziąć connection string?
  const user = await db.user.findFirst(); // Co jeśli zmienisz na TypeORM?
});

// ✅ Dobre podejście — zależność od abstrakcji (fixture)
test('pobierz użytkownika przez fixture', async ({ request }) => {
  // Nie wiesz, skąd fixture bierze dane — to szczegół implementacyjny
  // Może być API, może być baza, może być mock
  const response = await request.get('/api/users/me');
  expect(response.ok()).toBeTruthy();
});
```

---

## DRY vs DAMP — balans dla testów

### DRY (Don't Repeat Yourself)

DRY mówi: nie powtarzaj tego samego kodu. W kodzie aplikacji to ważne — powtarzanie prowadzi do rozbieżności i błędów.

```typescript
// ❌ Duplikacja — ten sam kod w 10 miejscach
await page.getByLabel('Email').fill('jan@example.pl');
await page.getByLabel('Hasło').fill('haslo123');
await page.getByRole('button', { name: 'Zaloguj' }).click();

// ✅ DRY — raz zdefiniowane, używane wielokrotnie
class LoginPage {
  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Hasło').fill(password);
    await this.page.getByRole('button', { name: 'Zaloguj' }).click();
  }
}

// W teście:
await loginPage.login('jan@example.pl', 'haslo123');
```

### DAMP (Descriptive and Meaningful Phrases)

DAMP mówi: kod testowy powinien być czytelny "od góry do dołu" jak zdanie w języku naturalnym. Czasem lepiej powtórzyć kilka linijek niż wprowadzić abstrakcję, która ukrywa intencję.

```typescript
// ❌ Zbyt abstrakcyjne — nie wiesz, co się dzieje bez zagłębienia się w helper
test('użytkownik składa zamówienie', async ({ page }) => {
  // Setup: 3 linie, ale co dokładnie robią?
  await helpers.completeCheckoutFlow(page, 'jan@example.pl', 'PROD-001');
  // Asercja
  await expect(page.getByText('Zamówienie potwierdzone')).toBeVisible();
});
// Co jeśli helper robi więcej niż "checkout flow"? Co jeśli zmieniasz produkt?
// Nie wiesz, gdzie szukać błędu.

// ✅ DAMP — czytelny kod "odsłania" intencję
test('zalogowany użytkownik składa zamówienie na jeden produkt', async ({ page }) => {
  // Krok 1: Zaloguj się
  await page.getByLabel('Email').fill('jan@example.pl');
  await page.getByLabel('Hasło').fill('haslo123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page).toHaveURL('/dashboard');
  
  // Krok 2: Otwórz stronę produktu
  await page.goto('/products/PROD-001');
  await expect(page.getByRole('heading', { name: 'iPhone 15 Pro' })).toBeVisible();
  
  // Krok 3: Dodaj do koszyka
  await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  await expect(page.getByText('Produkt dodany do koszyka')).toBeVisible();
  
  // Krok 4: Przejdź do kasy
  await page.getByRole('link', { name: 'Koszyk' }).click();
  await expect(page.getByText('1 przedmiot w koszyku')).toBeVisible();
  
  // Krok 5: Złóż zamówienie
  await page.getByRole('button', { name: 'Złóż zamówienie' }).click();
  
  // Asercja: Zamówienie zostało złożone
  await expect(page.getByText('Zamówienie potwierdzone')).toBeVisible({ timeout: 20000 });
});
```

**Złota zasada**: DRY dla infrastruktury (POM, fixtures, helpers), DAMP dla logiki testowej (same testy). Nie ukrywaj intencji testu za zbyt głębokimi abstrakcjami.

---

## Konwencje nazewnictwa i unikanie magic numbers

### Nazewnictwo testów — język domeny

```typescript
// ❌ Nazwy techniczne — co test ROBI, nie co sprawdza
test('click button, expect redirect', async ({ page }) => { /* ... */ });
test('api returns 200', async ({ request }) => { /* ... */ });
test('form validation fails', async ({ page }) => { /* ... */ });

// ✅ Nazwy domenowe — co system POWINIEN zrobić
test('poprawnie zalogowany użytkownik jest przekierowany do panelu głównego', async ({ page }) => { /* ... */ });
test('API zwraca listę zamówień posortowaną po dacie (najnowsze na górze)', async ({ request }) => { /* ... */ });
test('formularz rejestracji odrzuca email bez @ z komunikatem "Nieprawidłowy format"', async ({ page }) => { /* ... */ });

// ✅ Konwencja: "Operation [target] [expected outcome]"
test('zalogowany użytkownik może anulować zamówienie przed wysyłką', async ({ page }) => { /* ... */ });
test('nieuprawniony użytkownik nie może usunąć produktu z koszyka innego użytkownika', async ({ page }) => { /* ... */ });
```

### Nazewnictwo zmiennych i funkcji

```typescript
// ❌ Magic numbers i niejasne nazwy
const t = 5000;
const r = 3;
if (price > 1000) discount = 0.15;

// ✅ Jasne nazwy i stałe
const PAYMENT_TIMEOUT_MS = 5000;
const MAX_RETRY_ATTEMPTS = 3;
const HIGH_VALUE_ORDER_THRESHOLD = 1000;
const HIGH_VALUE_DISCOUNT_PERCENT = 0.15;

// ✅ Nazwy funkcji opisują działanie, nie implementację
// ❌ getUserData()
// ✅ fetchAuthenticatedUserProfile()
// ❌ check()
// ✅ validatePasswordStrength()
// ❌ wait()
// ✅ waitForPaymentConfirmation()
```

### Magic numbers w timeoutach

```typescript
// ❌ Co oznacza 5000? Dlaczego akurat 5000?
await page.click('#submit', { timeout: 5000 });
await page.waitForTimeout(5000);

// ✅ Nazwana stała — jasne, dlaczego tyle
const PAYMENT_GATEWAY_TIMEOUT = 5000;      // Stripe API ma timeout 10s + buffer 5s = 15s total
const ANIMATION_COMPLETE_DELAY = 5000;     // CSS animation: 5s z defines transitions

// ✅ Jeszcze lepiej — wyróżnij pochodzenie wartości
// Timeout wynika z SLA serwisu płatności (10s) + buffer dla CI (5s)
const STRIPE_RESPONSE_TIMEOUT_MS = 15_000;

// ✅ Używaj też w konfiguracji globalnej
export default defineConfig({
  actionTimeout: 10_000,       // 10s na akcję UI (lokalne CI)
  navigationTimeout: 30_000,   // 30s na pełne załadowanie strony
  expect: { timeout: 5_000 },  // 5s na spełnienie asercji webowej
});
```

---

## Narzędzia do jakości kodu

### ESLint — wychwytywanie błędów przed uruchomieniem

```bash
# Instalacja
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D eslint-plugin-playwright
```

```javascript
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'playwright'],
  rules: {
    // Zamiast await = błąd
    '@typescript-eslint/await-thenable': 'error',
    
    // Zakaz używania sleep
    'playwright/no-wait-for-timeout': 'error',
    
    // Wymagaj force przy force click
    'playwright/require-force': 'error',
    
    // Zakaz page.$ (stary styl)
    'playwright/no-primitive-location': 'error',
    
    // Nazwy testów — wymagaj opisowości
    'playwright/test-callback-spec-name': ['error', 'kebab-case'],
  },
};
```

### Prettier — spójne formatowanie

```bash
npm install -D prettier
```

```javascript
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "arrowParens": "always"
}
```

### Husky + lint-staged — automatyczna weryfikacja przed commitem

```bash
npm install -D husky lint-staged
npx husky init
```

```javascript
// package.json
{
  "lint-staged": {
    "*.ts": ["prettier --write", "eslint --fix", "playwright test"]
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

Teraz przed każdym commitem automatycznie:
1. Kod jest formatowany przez Prettier.
2. ESLint sprawdza błędy.
3. Playwright uruchamia testy — jeśli którykolwiek padnie, commit nie przejdzie.

---

## Code Review w QA — checklist dla reviewera

### Co sprawdzać podczas przeglądu kodu testowego

**1. Poprawność techniczna:**
- [ ] Czy `await` jest używane przed każdą metodą Playwrighta?
- [ ] Czy timeouty są ustawione i mają sens (nie magic numbers)?
- [ ] Czy lokatory są stabilne (nie używają losowych ID)?
- [ ] Czy fixture cleanup działa (nie zostawia danych)?

**2. Poprawność logiczna:**
- [ ] Czy test faktycznie sprawdza to, co nazwa sugeruje?
- [ ] Czy asercje są wystarczające (nie tylko status OK)?
- [ ] Czy są scenariusze brzegowe (pusty stan, maksymalne wartości, błędy)?
- [ ] Czy test jest deterministyczny (ten sam wynik przy wielokrotnym uruchomieniu)?

**3. Czytelność i utrzymanie:**
- [ ] Czy nazwa testu jest opisowa i zrozumiała?
- [ ] Czy kod jest DAMP (czytelny "od góry do dołu")?
- [ ] Czy są komentarze tam, gdzie intencja nie jest oczywista?
- [ ] Czy POM jest używany tam, gdzie lokatory się powtarzają?

**4. Jakość danych:**
- [ ] Czy dane testowe są unikalne (nie współdzielone z innymi testami)?
- [ ] Czy jest cleanup po teście?
- [ ] Czy email/nazwa mają prefiks testowy (QA_)?

**5. Bezpieczeństwo:**
- [ ] Czy sekretne dane (hasła, API keys) nie są w kodzie?
- [ ] Czy pliki .env są w .gitignore?

### Przykładowy raport Code Review

```
=== Code Review: checkout.spec.ts ===

Autor: Jan Kowalski
Reviewer: Anna Nowak
Data: 2024-06-23

🟢 APPROVED z komentarzami:

✅ Poprawność techniczna:
- await użyty konsekwentnie ✓
- Timeouty mają nazwy (PAYMENT_TIMEOUT) ✓
- Fixture cleanup działa ✓

🟡 COMMENTS (do poprawy przed merge):

[Medium] Linia 45: Magic number 5000 powinien być stałą
   Obecne: await page.waitForTimeout(5000);
   Sugestia: const ANIMATION_DELAY_MS = 300;
   Uzasadnienie: Wartość 5000ms jest nieuzasadniona, 
   obecna animacja trwa ~300ms.

[Low] Linia 78: Lokator `button.btn-primary` jest zbyt ogólny
   Obecne: page.locator('button.btn-primary').click();
   Sugestia: page.getByRole('button', { name: 'Złóż zamówienie' }).click();
   Uzasadnienie: getByRole jest odporniejszy na zmiany CSS.

[Komentarz do dyskusji] Linia 120: Czy test powinien sprawdzać 
   email wysyłany przez system? To wymagałoby integracji z 
   mailowym mockiem (np. Mailtrap). Na razie pomijamy, ale 
   zgłaszam jako TECH DEBT do backlogu.

❌ BLOCKERS: brak

Czas review: 25 minut
```

---

## Perspektywa Full Stack Testera — kod testowy jako produkt

Jako Full Stack Tester zadbaj o to, aby Twój kod testowy był traktowany jak kod produkcyjny:
- **Wersjonowanie**: Każdy test jest w Git z historią zmian.
- **Code Review**: Każdy merge musi być zaakceptowany przez innego testera lub developera.
- **CI/CD**: Testy uruchamiają się automatycznie na każdym branchu.
- **Monitoring**: Raporty z testów są archiwizowane i śledzone.

Gdy traktujesz testy jako "pierwszorzędny citizen" w zespole, nie tylko poprawiasz jakość testów — zmieniasz percepcję testowania automatycznego z "niedocenianej konieczności" na "profesjonalną praktykę inżynieryjną".

---

## Podsumowanie

1. **SOLID w testach**: SRP (jeden test = jedno zachowanie), OCP (konfiguracja > kod), LSP (abstrakcje > konkretne implementacje), ISP (wyspecjalizowane fixture), DIP (zależność od abstrakcji).
2. **DRY vs DAMP**: DRY dla infrastruktury (POM, fixtures), DAMP dla logiki testowej (same testy muszą być czytelne).
3. **Konwencje nazewnictwa**: Nazwy testów językiem domeny, stałe zamiast magic numbers, opisowe nazwy funkcji.
4. **Narzędzia jakości**: ESLint (błędy), Prettier (formatowanie), Husky (git hooks).
5. **Code Review**: Checklist techniczny, logiczny, jakościowy i bezpieczeństwa.

---

## Linki i źródła

- [Clean Code in Test Automation](https://medium.com/codex/clean-code-in-test-automation-987823b5c65f)
- [ESLint Playwright Plugin](https://github.com/playwright-community/eslint-plugin-playwright)
- [SOLID Principles for Software Testing](https://www.ministryoftesting.com/articles/solid-principles-for-test-automation)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Code Review Best Practices](https://github.com/mrxpalmer/code-review-checklist)

## 📘 Suplement Inżynieryjny 2026: Dobre Praktyki i Wzorce (SOLID & Clean Code)
*Inspiracja: „Scalable Test Automation with Playwright” (2026), Chapter 5*
*   **Zasada Single Responsibility (SRP)**: Każdy komponent frameworka powinien odpowiadać za jedną rzecz. Unikaj monolitycznych klas POM łączących akcje UI, setup bazy, zapytania API i asercje.
*   **WET (Write Everything Twice)**: Unikaj przedwczesnej abstrakcji. Zastosuj zasadę WET i wyodrębnij kod do abstrakcji dopiero przy trzeciej duplikacji.
