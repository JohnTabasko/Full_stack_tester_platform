# Kompozycja w POM: Wzorzec komponentu (Component Objects)

W miarę rozwoju aplikacji, pojedyncze strony zaczynają się rozbudowywać i współdzielić te same elementy interfejsu użytkownika. Na przykład: pasek wyszukiwania (`Search`), nagłówek (`Header`), panel boczny (`Sidebar`) czy stopka (`Footer`) pojawiają się na niemal każdej podstronie serwisu.

Próba umieszczenia wszystkich tych lokatorów i akcji wewnątrz jednego gigantycznego Page Objectu (np. `DashboardPage`) łamie zasadę **Single Responsibility Principle (SRP)** i prowadzi do powstawania tzw. monolitycznych klas POM.

Rozwiązaniem tego problemu jest **kompozycja** – składanie obiektów stron z mniejszych, wyspecjalizowanych i niezależnych **obiektów komponentów (Component Objects)**.

---

## 1. Wyższość Kompozycji nad Dziedziczeniem

W inżynierii oprogramowania obowiązuje złota zasada: **Prefer Composition over Inheritance (Wybieraj kompozycję ponad dziedziczenie)**. 
Zamiast tworzyć skomplikowane drzewo dziedziczenia klas stron, strona powinna po prostu *posiadać* (zawierać) instancje odpowiednich komponentów jako swoje publiczne lub prywatne pola:

```typescript
// Przykład kompozycji: DashboardPage POSIADA Header, Sidebar i OrdersTable
export class DashboardPage extends BasePage {
  public readonly header = new HeaderComponent(this.page);
  public readonly sidebar = new SidebarComponent(this.page);
  public readonly ordersTable = new OrdersTableComponent(this.page);

  constructor(page: Page) {
    super(page);
  }
}
```

---

## 2. Projektowanie bezpiecznych komponentów z lokalizatorem Root (Root Locator)

Aby komponent był w 100% niezależny i bezpieczny w użyciu, nie powinien przeszukiwać całej strony (`this.page.locator(...)`). Zamiast tego, każdy komponent musi mieć ściśle określone granice działania – tzw. **Root Locator (lokalizator korzenia)**.

Wszystkie wewnętrzne lokatory komponentu są wyszukiwane wyłącznie w obszarze tego korzenia:

```typescript
// src/components/HeaderComponent.ts
import { Page, Locator } from '@playwright/test';

export class HeaderComponent {
  private readonly rootLocator: Locator;
  private readonly cartBadge: Locator;
  private readonly searchInput: Locator;

  constructor(page: Page) {
    // Korzeniem Headeru jest znacznik <header> lub element posiadający test-id
    this.rootLocator = page.locator('header.main-header');
    
    // Wyszukuj elementy WYŁĄCZNIE wewnątrz korzenia Headeru (Scoping)
    this.cartBadge = this.rootLocator.locator('.cart-badge');
    this.searchInput = this.rootLocator.getByPlaceholder('Wyszukaj...');
  }

  async searchProduct(name: string) {
    await this.searchInput.fill(name);
    await this.searchInput.press('Enter');
  }

  async getCartCount(): Promise<string | null> {
    return await this.cartBadge.textContent();
  }
}
```

---

## 3. Dlaczego Scoping (Zawężanie) jest kluczowy?

Jeśli na stronie wyrenderuje się kilka różnych list produktów (np. lista polecanych produktów oraz koszyk), a Ty spróbujesz wywołać `.locator('.product-name')` globalnie, Playwright rzuci błąd `strict mode violation: resolved to 5 elements`.

Dzięki Root Locatorowi w obiekcie komponentu, Playwright przeszukuje tylko wydzielony fragment DOM, eliminując kolizje i zapewniając stabilność selekcji.

---

## 4. Checklista Komponentów
- [ ] Czy wyodrębniłeś powtarzalne fragmenty UI (Header, Sidebar, tabele) do dedykowanych klas komponentów?
- [ ] Czy każdy Component Object posiada zdefiniowany i używany `rootLocator` zawężający obszar działania?
- [ ] Czy unikasz monolitycznych klas stron, zastępując je elastyczną kompozycją?