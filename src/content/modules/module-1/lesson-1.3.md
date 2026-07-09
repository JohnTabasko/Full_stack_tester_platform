# Struktura projektu Playwright

Struktura projektu testowego decyduje o tym, czy automatyzacja będzie rosła w kontrolowany sposób. Na początku każdy projekt wygląda prosto: jeden plik `example.spec.ts`, kilka kliknięć i raport HTML. Po kilku miesiącach pojawiają się jednak Page Objecty, fixtures, dane testowe, klienci API, setup logowania, raporty, testy wizualne, testy API, testy mobilne i konfiguracja CI. Bez świadomej struktury repozytorium zamieni się w zbiór przypadkowych helperów.

Celem tej lekcji jest pokazanie, jak projektować strukturę Playwright tak, aby była zrozumiała dla testera, programisty, DevOpsa i osoby robiącej code review.

## 1. Struktura tworzona przez `npm init playwright@latest`

Po uruchomieniu instalatora Playwright najczęściej otrzymasz strukturę podobną do:

```text
playwright.config.ts
package.json
package-lock.json
tests/
  example.spec.ts
```

To dobry punkt startu, ale nie docelowa architektura dla większego projektu. Oficjalny scaffold pokazuje minimalny przykład. Twoim zadaniem jest rozbudować go tak, aby odpowiadał realnemu ryzyku i sposobowi pracy zespołu.

## 2. Co powinno znaleźć się w profesjonalnym projekcie

Przykładowa struktura dla średniego projektu:

```text
tests/
  specs/
    smoke/
      login.spec.ts
      checkout.spec.ts
    regression/
      account.spec.ts
      discounts.spec.ts
    api/
      orders.api.spec.ts
    visual/
      product-card.visual.spec.ts
  fixtures/
    base-test.ts
    auth.fixture.ts
    api.fixture.ts
    pages.fixture.ts
  pages/
    LoginPage.ts
    CheckoutPage.ts
    ProductPage.ts
    components/
      HeaderComponent.ts
      ProductCardComponent.ts
  clients/
    OrdersClient.ts
    UsersClient.ts
  data/
    users.ts
    products.ts
  builders/
    userBuilder.ts
    orderBuilder.ts
  utils/
    runId.ts
    cleanup.ts
    env.ts
playwright.config.ts
README.md
```

Nie każdy projekt potrzebuje wszystkiego od pierwszego dnia. Ważne jest rozdzielenie odpowiedzialności:

- `specs` — scenariusze testowe;
- `fixtures` — zasoby dostarczane testom;
- `pages` — Page Object Model i komponenty;
- `clients` — klienci API używani do setupu, teardownu i testów API;
- `data` — statyczne dane testowe;
- `builders` — dynamiczne generowanie danych;
- `utils` — małe narzędzia techniczne;
- `playwright.config.ts` — konfiguracja runnera i środowisk.

## 3. Organizacja według typu testu czy domeny?

Są dwa popularne podejścia.

### Podział według typu testu

```text
tests/
  e2e/
  api/
  visual/
  component/
```

Ten podział jest prosty i dobry na początku. Łatwo uruchamiać osobne pipeline dla E2E, API i visual.

### Podział domenowy

```text
tests/
  checkout/
    checkout.spec.ts
    CheckoutPage.ts
    checkout.fixtures.ts
  auth/
    login.spec.ts
    LoginPage.ts
  account/
    account.spec.ts
    AccountPage.ts
```

Ten podział sprawdza się w dużych zespołach, bo trzyma testy, Page Objecty i dane blisko obszaru biznesowego. Wymaga jednak większej dyscypliny.

Nie ma jednej najlepszej struktury. Najważniejsze, aby projekt miał jasną zasadę i konsekwentnie jej przestrzegał.

## 4. Nazewnictwo plików

Dobre nazwy plików pomagają znaleźć test bez wyszukiwarki.

Przykłady:

```text
login.spec.ts
checkout-guest.spec.ts
checkout-authenticated.spec.ts
orders.api.spec.ts
product-card.visual.spec.ts
```

Unikaj nazw:

```text
test1.spec.ts
new-flow.spec.ts
final.spec.ts
bugfix.spec.ts
```

Nazwa powinna mówić, jaki obszar lub przepływ jest testowany.

## 5. Nazewnictwo testów

Nazwa testu powinna być zrozumiała w raporcie HTML.

Słabo:

```typescript
test('click save', async ({ page }) => {});
```

Lepiej:

```typescript
test('użytkownik może zapisać zmiany adresu dostawy', async ({ page }) => {});
```

Jeszcze lepiej, jeśli test zawiera kontekst:

```typescript
test('zalogowany klient może zmienić adres dostawy dla aktywnego zamówienia', async ({ page }) => {});
```

Raporty Playwright są często czytane przez osoby, które nie otwierają kodu. Nazwa testu powinna więc mówić, jakie ryzyko pokrywa test.

## 6. Fixtures jako centrum zależności

W większych projektach testy nie powinny importować przypadkowych helperów z wielu miejsc. Lepiej stworzyć własny `test`, który dostarcza zależności.

```typescript
// tests/fixtures/base-test.ts
import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

type Fixtures = {
  loginPage: LoginPage;
  checkoutPage: CheckoutPage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
});

export { expect };
```

W testach importujesz:

```typescript
import { test, expect } from '../fixtures/base-test';
```

Dzięki temu projekt ma jedno kontrolowane wejście do własnych rozszerzeń Playwright.

## 7. Page Objecty i komponenty

Page Object powinien reprezentować stronę lub istotny fragment UI. Nie powinien być śmietnikiem z każdą metodą.

```typescript
export class CheckoutPage {
  constructor(private page: Page) {}

  async open() {
    await this.page.goto('/checkout');
  }

  async submitOrder() {
    await this.page.getByRole('button', { name: 'Złóż zamówienie' }).click();
  }

  async expectSuccess() {
    await expect(this.page.getByText('Dziękujemy za zamówienie')).toBeVisible();
  }
}
```

Dla powtarzalnych elementów używaj komponentów:

```typescript
export class HeaderComponent {
  constructor(private page: Page) {}

  cartLink() {
    return this.page.getByRole('link', { name: /koszyk/i });
  }
}
```

## 8. Dane testowe

Dane testowe powinny być jawne i izolowane.

```typescript
export const defaultUser = {
  email: 'user@example.com',
  password: process.env.E2E_USER_PASSWORD!,
};
```

Dla danych dynamicznych używaj builderów:

```typescript
export function buildUser(overrides = {}) {
  return {
    email: `user-${Date.now()}@example.com`,
    password: 'Secret123!',
    ...overrides,
  };
}
```

Unikaj jednego globalnego użytkownika do wszystkich testów modyfikujących dane.

## 9. Artefakty i `.gitignore`

Playwright generuje artefakty, których nie należy commitować:

```gitignore
node_modules/
playwright-report/
test-results/
blob-report/
.env
.env.*
playwright/.auth/*.json
```

Wyjątek: możesz commitować przykładowe pliki `.env.example` albo `README` opisujące wymagane zmienne.

Pliki `storageState` z prawdziwą sesją użytkownika traktuj jak sekret. Nie powinny trafić do repozytorium.

## 10. README projektu testowego

Każdy projekt Playwright powinien mieć README z minimum:

```markdown
# E2E tests

## Wymagania
- Node.js 22/24/26 zgodnie z oficjalnym wsparciem Playwright
- npm lub pnpm

## Instalacja
npm ci
npx playwright install --with-deps

## Uruchamianie
npm run test
npm run test:ui
npm run test:smoke
npm run report

## Zmienne środowiskowe
BASE_URL=
E2E_USER=
E2E_PASSWORD=
```

README jest częścią jakości projektu. Jeśli nowa osoba nie potrafi uruchomić testów na podstawie README, struktura projektu nie jest kompletna.

## 11. Kiedy rozbudowywać strukturę

Nie twórz zbyt złożonej architektury w pierwszym dniu. Dobry moment na rozbudowę to sytuacje:

- więcej niż kilka plików spec;
- powtarzalne logowanie;
- powtarzalne tworzenie danych;
- potrzeba klientów API;
- wiele ról użytkowników;
- osobne pipeline dla smoke/regression/visual;
- duża liczba powtarzających się locatorów.

Zasada: struktura ma usuwać powtarzalność i zwiększać czytelność, nie imponować złożonością.

## 12. Checklista review struktury

- Czy testy są łatwe do znalezienia?
- Czy nazwy plików opisują obszar biznesowy?
- Czy Page Objecty są w jednym miejscu lub konsekwentnie blisko domeny?
- Czy fixtures są typowane i importowane z jednego miejsca?
- Czy dane testowe są izolowane?
- Czy sekrety nie trafiają do repozytorium?
- Czy artefakty Playwright są w `.gitignore`?
- Czy README opisuje instalację, uruchamianie i raporty?
- Czy struktura jest wystarczająca, ale nie przesadnie skomplikowana?

## Linki

- [Installation](https://playwright.dev/docs/intro)
- [Fixtures](https://playwright.dev/docs/test-fixtures)
- [Page Object Models](https://playwright.dev/docs/pom)
- [Best practices](https://playwright.dev/docs/best-practices)
- [Authentication — storage state](https://playwright.dev/docs/auth)
