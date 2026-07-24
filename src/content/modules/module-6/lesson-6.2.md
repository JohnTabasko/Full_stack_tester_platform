# Wzorzec strony bazowej (BasePage) i Metoda Szablonowa

Gdy Twój projekt testowy zaczyna rosnąć, klasy Page Object Model (POM) zaczynają powielać te same powtarzalne czynności techniczne: logowanie zdarzeń, weryfikację stabilności strony po załadowaniu, sprawdzanie błędów serwera (np. 500 Internal Server Error) czy obsługę menu nawigacyjnych.

Najlepszą praktyką inżynierii obiektowej jest wyodrębnienie tych zachowań do wspólnej klasy abstrakcyjnej – **`BasePage`** – oraz zaimplementowanie wzorca projektowego **Metody Szablonowej (Template Method Pattern)**. W tej lekcji nauczysz się projektować hierarchię klas POM z użyciem silnych typów TypeScript.

---

## 1. Dziedziczenie w POM: Rola klasy abstrakcyjnej `BasePage`

Klasa bazowa powinna być zadeklarowana jako klasa abstrakcyjna (`abstract class`). Oznacza to, że nie można stworzyć jej bezpośredniej instancji w testach (`new BasePage(page)` jest niedozwolone) – służy ona wyłącznie jako szablon i fundament dla innych, wyspecjalizowanych stron (np. `LoginPage`, `CartPage`).

```typescript
// src/pages/BasePage.ts
import { Page, test, expect } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
}
```

Dzięki temu, że pole `page` jest zadeklarowane jako `protected`, wszystkie klasy pochodne mają do niego bezpośredni dostęp, ale sam obiekt jest zabezpieczony przed bezpośrednimi zmianami z poziomu plików testowych.

---

## 2. Wdrożenie wzorca Metody Szablonowej (Template Method Pattern)

Wzorzec ten polega na zdefiniowaniu niezmiennego szkieletu algorytmu (np. procesu nawigacji lub klikania z weryfikacją błędów) w klasie bazowej, podczas gdy specyficzne kroki są delegowane do klas pochodnych za pomocą metod hakowych (hooks).

Dodajmy metodę szablonową `navigate()` do naszej klasy `BasePage`:

```typescript
export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Metoda szablonowa definiująca sztywny algorytm nawigacji.
   */
  public async navigate(path: string): Promise<void> {
    await test.step(`Nawigacja do ścieżki: \${path}\`, async () => {
      // 1. Wywołaj hook przed nawigacją
      await this.beforeNavigate(path);
      
      // 2. Wykonaj fizyczną nawigację
      await this.page.goto(path);
      
      // 3. Wywołaj hook po nawigacji (np. sprawdzenie błędów 500)
      await this.afterNavigate(path);
    });
  }

  // Hooki, które klasy pochodne mogą opcjonalnie nadpisać
  protected async beforeNavigate(path: string): Promise<void> {
    // Domyślnie puste - gotowe na ewentualne logowanie
  }

  protected async afterNavigate(path: string): Promise<void> {
    // Wspólne dla wszystkich stron sprawdzenie, czy serwer nie zwrócił błędu 500
    const title = await this.page.title();
    if (title.includes('500') || title.includes('Internal Server Error')) {
      throw new Error(`Wykryto krytyczny błąd serwera (500) podczas nawigacji do \${path}\`);
    }
  }
}
```

---

## 3. Implementacja klasy pochodnej (`LoginPage`)

Klasa pochodna dziedziczy wszystkie metody i właściwości po `BasePage` za pomocą słowa kluczowego `extends` oraz przekazuje stronę do konstruktora bazowego za pomocą `super(page)`:

```typescript
// src/pages/LoginPage.ts
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly usernameInput = this.page.locator('[data-test="username"]');

  // Nadpisywanie hooka z metody szablonowej
  protected override async afterNavigate(path: string): Promise<void> {
    await super.afterNavigate(path);
    // Dodatkowa, specyficzna dla LoginPage weryfikacja gotowości elementu formularza
    await this.usernameInput.waitFor({ state: 'visible' });
  }

  async login(user: string, pass: string) {
    await this.usernameInput.fill(user);
    // ...
  }
}
```

Dzięki temu, test wywołując `await loginPage.navigate('/login')` automatycznie wykona pełen, bezpieczny algorytm sprawdzania błędów 500 oraz weryfikacji gotowości formularza, bez powielania ani jednej linii kodu!

---

## 4. Checklista Projektowania BasePage
- [ ] Czy zadeklarowałeś klasę bazową jako klasę abstrakcyjną (`abstract class`)?
- [ ] Czy pole `page` posiada modyfikator dostępu `protected readonly`?
- [ ] Czy zastosowałeś metodę szablonową (`Template Method`) do ujednolicenia cyklu życia nawigacji lub interakcji?
- [ ] Czy klasy pochodne przekazują instancję strony do konstruktora nadrzędnego za pomocą `super(page)`?