# Wzorzec komponentu — Component Objects w Playwright

Page Object nie zawsze powinien reprezentować całą stronę. W nowoczesnym UI wiele elementów powtarza się na wielu ekranach: nagłówek, menu użytkownika, tabela, modal, toast, karta produktu, paginacja, filtr, date picker. Jeśli każda strona implementuje je osobno, projekt szybko zacznie się duplikować.

Component Object to Page Object dla fragmentu interfejsu. Najważniejsza zasada: komponent powinien mieć **root locator**, a wszystkie jego elementy powinny być wyszukiwane wewnątrz tego korzenia.

## 1. Problem dużych Page Objectów

Antywzorzec:

```typescript
class DashboardPage {
  async openUserMenu() {}
  async logout() {}
  async sortOrdersTable() {}
  async openOrderDetails() {}
  async closeModal() {}
  async goToNotifications() {}
}
```

Taka klasa szybko zaczyna znać każdy fragment UI. Zmiana modala albo tabeli wymaga modyfikacji wielu stron.

Lepszy kierunek:

```typescript
class DashboardPage {
  readonly header: HeaderComponent;
  readonly ordersTable: OrdersTable;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page.getByRole('banner'));
    this.ordersTable = new OrdersTable(page.getByTestId('orders-table'));
  }
}
```

## 2. Root locator

```typescript
import { expect, type Locator } from '@playwright/test';

export class OrdersTable {
  constructor(private readonly root: Locator) {}

  rowByOrderId(orderId: string) {
    return this.root.getByRole('row').filter({ hasText: orderId });
  }

  async openDetails(orderId: string) {
    await this.rowByOrderId(orderId)
      .getByRole('button', { name: 'Szczegóły' })
      .click();
  }

  async expectStatus(orderId: string, status: string) {
    await expect(this.rowByOrderId(orderId)).toContainText(status);
  }
}
```

Dzięki `root` ten sam komponent może działać w panelu admina i panelu klienta, jeśli struktura tabeli jest podobna.

## 3. Komponenty zagnieżdżone

Komponent może zwracać inny komponent:

```typescript
class HeaderComponent {
  constructor(private readonly root: Locator) {}

  async openUserMenu() {
    await this.root.getByRole('button', { name: 'Menu użytkownika' }).click();
    return new UserMenuComponent(this.root.getByRole('menu'));
  }
}
```

To jest kompozycja. Jest zwykle elastyczniejsza niż głębokie dziedziczenie.

## 4. Modal jako komponent

```typescript
class ConfirmModal {
  constructor(private readonly root: Locator) {}

  async confirm() {
    await this.root.getByRole('button', { name: 'Potwierdź' }).click();
  }

  async cancel() {
    await this.root.getByRole('button', { name: 'Anuluj' }).click();
  }

  async expectMessage(message: string | RegExp) {
    await expect(this.root).toContainText(message);
  }
}
```

W Page Object:

```typescript
async deleteOrder(orderId: string) {
  await this.ordersTable.rowByOrderId(orderId).getByRole('button', { name: 'Usuń' }).click();
  return new ConfirmModal(this.page.getByRole('dialog'));
}
```

## 5. Co powinien wiedzieć komponent

Komponent powinien znać:

- własny root;
- własne elementy;
- własne akcje;
- własne asercje stanu.

Komponent nie powinien znać:

- całego procesu biznesowego;
- danych bazy;
- setupu API;
- konfiguracji CI;
- innych odległych stron.

Tabela zamówień może otworzyć szczegóły zamówienia, ale nie powinna wiedzieć, jak przejść cały proces zwrotu płatności.

## 6. Kiedy nie tworzyć komponentu

Nie każdy fragment UI wymaga klasy. Jeśli element występuje raz i ma jedną prostą akcję, zwykły locator w Page Object może wystarczyć.

Twórz komponent, gdy:

- fragment UI powtarza się w wielu miejscach;
- ma kilka akcji i asercji;
- ma wewnętrzną złożoność;
- zmienia się niezależnie od strony;
- zespół często duplikuje jego lokatory.

## 7. Antywzorce

- Komponent bez root locatora, używający globalnie `page`.
- Komponent zna cały proces biznesowy.
- Komponenty tworzone dla każdego pojedynczego przycisku.
- Publiczne lokatory używane dowolnie w testach.
- Komponent ukrywa nieczytelne CSS/XPath.

## 8. Checklista

- Czy komponent ma root locator?
- Czy wszystkie locatory są lokalne względem root?
- Czy komponent ma jedną odpowiedzialność?
- Czy nadaje się do użycia w więcej niż jednym miejscu?
- Czy test po użyciu komponentu nadal mówi językiem biznesowym?
- Czy komponent nie stał się mini-aplikacją?

## Linki

- [Page Object Models](https://playwright.dev/docs/pom)
- [Locators](https://playwright.dev/docs/locators)
- [Locator API](https://playwright.dev/docs/api/class-locator)
