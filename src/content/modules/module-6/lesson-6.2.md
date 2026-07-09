# Wzorzec strony bazowej — BasePage bez klasy-śmietnika

BasePage to wspólna klasa bazowa dla Page Objectów. Może ujednolicić nawigację, diagnostykę i oczekiwanie na załadowanie strony. Może też stać się najgorszym antywzorcem w projekcie: ogromną klasą, do której zespół wrzuca każdą przypadkową metodę.

Dobra BasePage ma małą odpowiedzialność. Nie zna logiki koszyka, tabel, modali, API, płatności i logowania naraz. Daje wspólny szkielet, ale nie zastępuje dobrze zaprojektowanych stron i komponentów.

## 1. Kiedy BasePage ma sens

BasePage jest przydatna, gdy wiele stron ma wspólny cykl życia:

- każda strona ma `path`;
- każda strona potrafi sprawdzić, że jest załadowana;
- chcesz mieć spójne `goto()`;
- chcesz dodać diagnostykę, np. screenshot;
- chcesz ujednolicić podstawowe oczekiwanie na widok.

Nie twórz BasePage tylko dlatego, że „tak się robi w POM”. W małym projekcie kilka prostych klas bez dziedziczenia może być czytelniejsze.

## 2. Minimalna BasePage

```typescript
import { type Page } from '@playwright/test';

export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  abstract readonly path: string;
  abstract expectLoaded(): Promise<void>;

  async goto() {
    await this.page.goto(this.path);
    await this.expectLoaded();
  }
}
```

Każda strona definiuje własny warunek gotowości:

```typescript
import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProfilePage extends BasePage {
  readonly path = '/profile';

  constructor(page: Page) {
    super(page);
  }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Profil' })).toBeVisible();
  }
}
```

`expectLoaded()` jest lepsze niż losowe `waitForTimeout`, bo opisuje realny stan widoku.

## 3. Locator-first BasePage

BasePage nie powinna wymuszać CSS/XPath. Każda klasa dziedzicząca nadal powinna używać locatorów użytkownika:

```typescript
protected heading(name: string) {
  return this.page.getByRole('heading', { name });
}
```

Taki helper może być przydatny, ale nie przesadzaj. Jeśli BasePage zaczyna mieć dziesiątki skrótów do każdego typu elementu, staje się własnym mini-frameworkiem.

## 4. Diagnostyka

Możesz dodać małe narzędzia diagnostyczne:

```typescript
async screenshot(name: string) {
  await this.page.screenshot({
    path: `test-results/${name}.png`,
    fullPage: true,
  });
}
```

W praktyce screenshoty przy awarii lepiej często obsłużyć przez konfigurację lub fixture. BasePage może mieć diagnostykę manualną dla trudnych przypadków, ale nie powinna dublować mechanizmów Playwright.

## 5. Dziedziczenie kontra kompozycja

Dziedziczenie działa dobrze dla wspólnych elementów cyklu życia. Kompozycja działa lepiej dla fragmentów UI.

Zły kierunek:

```typescript
class BasePage {
  async openUserMenu() {}
  async sortTable() {}
  async closeModal() {}
  async addProductToCart() {}
}
```

Lepszy kierunek:

```typescript
class DashboardPage extends BasePage {
  readonly navigation = new NavigationComponent(this.page.getByRole('navigation'));
  readonly ordersTable = new OrdersTable(this.page.getByTestId('orders-table'));
}
```

Jeśli funkcja dotyczy tylko niektórych stron, zrób komponent albo helper, nie metodę w BasePage.

## 6. Antywzorce BasePage

- `BasePage` ma 1000 linii.
- Każdy Page Object dziedziczy metody, których nigdy nie używa.
- BasePage zna szczegóły domeny: koszyk, faktury, płatności, admina.
- BasePage ukrywa `waitForTimeout`.
- BasePage zawiera uniwersalne `click(selector: string)` i `fill(selector: string)` zamiast locatorów domenowych.
- Zmiana BasePage psuje cały projekt.

## 7. Checklista

- Czy BasePage ma mniej niż kilka naprawdę wspólnych metod?
- Czy `expectLoaded()` sprawdza widoczny stan strony?
- Czy dziedziczenie nie zastępuje komponentów?
- Czy BasePage nie zna logiki biznesowej?
- Czy test po użyciu Page Objecta nadal jest czytelny?
- Czy metody bazowe nie ukrywają sztywnych timeoutów?

## Linki

- [Page Object Models](https://playwright.dev/docs/pom)
- [Locators](https://playwright.dev/docs/locators)
- [Assertions](https://playwright.dev/docs/test-assertions)
