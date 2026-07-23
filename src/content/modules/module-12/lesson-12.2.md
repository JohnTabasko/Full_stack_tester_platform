# Zaawansowane wzorce obiektu strony i inżynieria frameworków UI

Tradycyjny wzorzec **Page Object Model (POM)** jest absolutnym fundamentem automatyzacji testów UI, jednak w dużych, komercyjnych projektach podejście typu "quick start" szybko ujawnia swoje ograniczenia. Bez odpowiedniej struktury inżynieryjnej, klasy stron stają się monolityczne, testy stają się podatne na zmiany techniczne, a modyfikacje konstruktorów klas POM zmuszają programistów do edycji dziesiątek plików testowych. 

Współczesna inżynieria testów (Software Engineering in Test) opiera się na **zasadach SOLID**, wzorcach projektowych (takich jak **Fabryka** czy **Metoda Szablonowa**) oraz zaawansowanym wstrzykiwaniu zależności za pomocą **systemu fixture-ów Playwrighta**. Niniejsza lekcja pokazuje, jak połączyć te światy w celu zbudowania wysoce skalowalnej i łatwej w utrzymaniu platformy testowej.

---

## 1. Architektura oparta o zasadę SOLID w testach UI

Stosowanie zasad SOLID w kodzie automatyzacji testów jest tak samo krytyczne jak w kodzie produkcyjnym. Oto jak przekładają się one na architekturę Playwright:

*   **S (Single Responsibility Principle - SRP)**: Klasa testu odpowiada wyłącznie za asercję i scenariusz biznesowy (AAA). Klasa Page Object odpowiada za techniczną interakcję z UI i udostępnianie metod domenowych. Fabryka odpowiada za powoływanie obiektów do życia, a fixture-y za przygotowanie środowiska.
*   **O (Open/Closed Principle - OCP)**: Architektura umożliwia dodawanie nowych stron i scenariuszy (rozszerzanie) bez konieczności modyfikowania jądra konfiguracji lub istniejących testów klienckich.
*   **L (Liskov Substitution Principle - LSP)**: Podklasy stron (np. `AdminDashboardPage` dziedzicząca po `DashboardPage`) muszą być w pełni kompatybilne i wymienne z klasami bazowymi w każdym teście.
*   **I (Interface Segregation Principle - ISP)**: Tworzenie mniejszych, wyspecjalizowanych interfejsów (np. dla komponentów wspólnych jak `Header` czy `Sidebar`) zamiast gigantycznych, monolitycznych interfejsów stron.
*   **D (Dependency Inversion Principle - DIP)**: Klasy stron nie powinny same zarządzać tworzeniem instancji kontekstu czy żądań. Konteksty takie jak `Page` czy `APIRequestContext` są wstrzykiwane z zewnątrz (poprzez konstruktor i system fixture-ów).

---

## 2. Wzorzec Metody Szablonowej (Template Method Pattern)

Częstym błędem jest brak spójności w cyklu życia stron. **Wzorzec Metody Szablonowej** rozwiązuje ten problem poprzez zdefiniowanie ogólnego szkieletu algorytmu (np. procesu nawigacji) w klasie bazowej, podczas gdy specyficzne kroki są delegowane do podklas za pomocą tzw. hooków (haków).

Stwórzmy klasę bazową `BasePage`:

```typescript
import { Page, test } from '@playwright/test';

export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Metoda szablonowa (Template Method) definiująca niezmienny szkielet nawigacji.
   */
  public async navigate(path: string): Promise<void> {
    await test.step(`Nawigacja do: ${path}`, async () => {
      await this.beforeNavigate(path);
      await this.page.goto(path);
      await this.afterNavigate(path);
    });
  }

  // Hooki (haki), które klasy pochodne mogą opcjonalnie nadpisywać
  protected async beforeNavigate(path: string): Promise<void> {
    // Domyślnie puste - gotowe na globalne logowanie lub weryfikację stanu sieci
  }

  protected async afterNavigate(path: string): Promise<void> {
    // Domyślne sprawdzenie, czy strona nie zwróciła błędu serwera (np. 500)
    const title = await this.page.title();
    if (title.includes('500') || title.includes('Internal Server Error')) {
      throw new Error(`Wykryto błąd serwera podczas nawigacji do ${path}`);
    }
  }
}
```

Teraz każda klasa strony (np. `LoginPage`) rozszerza `BasePage` i może dostosować zachowanie przed i po nawigacji bez powielania kodu zarządzania krokami testowymi (`test.step`):

```typescript
export class LoginPage extends BasePage {
  private readonly usernameInput = this.page.locator('[data-test="username"]');
  private readonly passwordInput = this.page.locator('[data-test="password"]');
  private readonly loginButton = this.page.locator('[data-test="login-button"]');

  // Nadpisanie hooka po nawigacji w celu weryfikacji stabilności
  protected override async afterNavigate(path: string): Promise<void> {
    await super.afterNavigate(path);
    // Upewnij się, że pole formularza jest gotowe do interakcji
    await this.usernameInput.waitFor({ state: 'visible' });
  }

  async login(user: string, pass: string): Promise<void> {
    await test.step('Logowanie do aplikacji', async () => {
      await this.usernameInput.fill(user);
      await this.passwordInput.fill(pass);
      await this.loginButton.click();
    });
  }
}
```

---

## 3. Wzorzec Fabryki (Page Object Factory Pattern)

W klasycznych frameworkach testy same wywołują konstruktory: `const loginPage = new LoginPage(page)`. Co się stanie, gdy po roku rozwoju zdecydujesz, że każdy Page Object musi dodatkowo przyjmować instancję loggera lub globalnej konfiguracji? Będziesz zmuszony edytować setki testów.

**Wzorzec Fabryki** izoluje testy od bezpośredniego wywoływania konstruktorów klas POM. Zapewnia scentralizowany punkt kreacji obiektów.

```typescript
import { Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { BasePage } from '../pages/BasePage';

export type PageName = 'LoginPage' | 'InventoryPage';

export class PageFactory {
  /**
   * Statyczna metoda fabrykująca, która dynamicznie tworzy i zwraca otypowany obiekt strony.
   */
  public static getPage<T extends BasePage>(pageName: PageName, page: Page): T {
    switch (pageName) {
      case 'LoginPage':
        return new LoginPage(page) as unknown as T;
      case 'InventoryPage':
        return new InventoryPage(page) as unknown as T;
      default:
        throw new Error(`Typ strony "${pageName}" nie jest obsługiwany przez PageFactory.`);
    }
  }
}
```

Dzięki temu w testach (lub fixturach) wywołanie jest całkowicie zunifikowane i odporne na zmiany strukturalne parametrów konstruktorów.

---

## 4. Głębokie wykorzystanie Fixture-ów (Fixtures Deep Dive)

Wstrzykiwanie zależności w Playwright opiera się na genialnym systemie **fixture-ów**. Pozwala to całkowicie wyeliminować kruche bloki setupu `beforeEach`/`afterEach`, zastępując je modularnymi, leniwie ładowanymi zależnościami.

### A. Fixtury powiązane (zależne)

Fixtury mogą zależeć od innych fixtur. Możemy stworzyć fixturę `loggedInAdminPage`, która automatycznie korzysta z `loginPage` i wbudowanego `page`, wykonuje logowanie w tle, a sam test otrzymuje już w pełni uwierzytelnioną stronę:

```typescript
import { test as base, Page } from '@playwright/test';
import { PageFactory } from './PageFactory';
import { LoginPage } from '../pages/LoginPage';

export type MyFixtures = {
  loginPage: LoginPage;
  loggedInAdminPage: Page;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    // Użycie Fabryki do stworzenia instancji strony
    const loginPage = PageFactory.getPage<LoginPage>('LoginPage', page);
    await use(loginPage);
  },

  loggedInAdminPage: async ({ page, loginPage }, use) => {
    // Stan początkowy (Arrange) realizowany w tle przez fixture
    await loginPage.navigate('/');
    await loginPage.login('standard_user', 'secret_sauce');
    await use(page); // Przekazanie w pełni uwierzytelnionej strony do testu
  },
});
```

### B. Fixtury automatyczne (Automatic Fixtures) z załącznikami

Fixtury automatyczne uruchamiają się dla każdego testu, nawet jeśli nie zostaną zadeklarowane jako parametry. Są doskonałe do zbierania diagnostyki, np. logów konsoli przeglądarki, i załączania ich bezpośrednio do raportu HTML przy użyciu `testInfo.attach`.

```typescript
export const testWithDiagnostics = test.extend<{ consoleErrors: string[] }>({
  consoleErrors: [async ({ page }, use, testInfo) => {
    const logs: string[] = [];
    
    // Subskrypcja zdarzeń konsoli
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        logs.push(`[Console Error] ${msg.text()}`);
      }
    });

    await use(logs);

    // Teardown: Jeśli wykryto błędy, dodaj je jako załącznik do raportu HTML
    if (logs.length > 0) {
      await testInfo.attach('browser-console-errors', {
        body: JSON.stringify(logs, null, 2),
        contentType: 'application/json',
      });
    }
  }, { auto: true }], // Oznaczenie jako automatyczna fixtura
});
```

---

## 5. Rozszerzanie Expecta (Custom Expect Matchers)

Asercje techniczne (np. `await expect(page.locator('.alert')).toContainText('Witaj')`) zaciemniają biznesowy sens testu. Jean-François Greffier w swojej książce z 2026 r. zaleca rozszerzanie globalnego obiektu `expect` o dedykowane asercje semantyczne (Custom Matchers).

Dzięki temu piszemy kod czytelny dla biznesu, a asercja automatycznie generuje precyzyjny raport błędu w przypadku niepowodzenia:

```typescript
import { expect as baseExpect, Page } from '@playwright/test';

export const expect = baseExpect.extend({
  async toBeValidPageTitle(page: Page, expectedTitle: string) {
    const title = await page.title();
    const pass = title.includes(expectedTitle);
    
    return {
      message: () => 
        `Oczekiwano, że tytuł strony "${title}" ${pass ? 'NIE ' : ''}będzie zawierał frazę "${expectedTitle}"`,
      pass,
    };
  },
});
```

Użycie w teście staje się banalnie proste i niezwykle eleganckie:

```typescript
await expect(page).toBeValidPageTitle('Panel Klienta');
```

---

## 6. Antywzorzec: Framework-Over-Product oraz WET vs DRY

Zarówno Uppadhyay, jak i Greffier ostrzegają przed **nadmierną inżynierią (over-engineering)** na wczesnym etapie projektu. 
*   **Antywzorzec "Framework ponad produkt"**: Budowanie skomplikowanych fabryk, strategii i warstw abstrakcji, gdy projekt ma zaledwie kilka prostych testów, generuje olbrzymi koszt utrzymania i tzw. "cognitive load" (obciążenie poznawcze) dla nowych testerów, nie dając żadnej wartości biznesowej.
*   **Zasada WET (Write Everything Twice)**: Przeciwieństwo ślepego podążania za zasadą DRY. Zamiast natychmiast wyodrębniać każdą linijkę kodu do osobnej klasy, napisz go dwukrotnie w tradycyjny sposób. Dopiero gdy potrzebujesz go po raz trzeci i upewnisz się, że struktura jest stabilna, wyodrębnij abstrakcję (np. komponent lub pomocnik). Zapobiega to tworzeniu przedwczesnych, błędnych założeń architektonicznych.

---

## 7. Kompletna Synteza: Inżynieryjny Scenariusz Testowy

Poniższy przykład ilustruje, jak zintegrowane ze sobą wzorce (Zasady SOLID, Fabryka, Metoda Szablonowa, powiązane i automatyczne fixtury oraz rozszerzony `expect`) tworzą bezkompromisowo czytelny i stabilny test:

```typescript
import { test, expect } from '../src/utils/customTest';

test.describe('Zarządzanie katalogiem produktów', () => {

  test('powinien zweryfikować brak dostępu dla niepoprawnych poświadczeń', async ({ loginPage, page }) => {
    // 1. Nawigacja wykorzystuje Metodę Szablonową z BasePage
    await loginPage.navigate('/');
    
    // 2. Użycie niestandardowej asercji (Custom Expect Matcher)
    await expect(page).toBeValidPageTitle('Swag Labs');

    // 3. Biznesowa akcja zamknięta w LoginPage
    await loginPage.login('bad_user', 'bad_password');
    
    // 4. Asercja semantyczna wewnątrz POM
    await loginPage.assertErrorMessageContains('Username and password do not match');
  });

  test('powinien poprawnie wczytać listę produktów dla zalogowanego administratora', async ({ loggedInAdminPage, inventoryPage }) => {
    // Stan zalogowania został w pełni zorganizowany (Arrange) w tle przez fixture loggedInAdminPage.
    // Test skupia się wyłącznie na sprawdzeniu katalogu produktów.
    
    await inventoryPage.assertInventoryIsVisible();
    
    const count = await inventoryPage.getItemsCount();
    expect(count).toBeGreaterThan(0);
    
    // Automatyczna fixtura w tle monitoruje błędy konsoli przeglądarki i w razie ich wystąpienia
    // dołączy je jako załącznik do raportu testowego.
  });
});
```

---

## 8. Checklista Inżynieryjna Frameworka UI

Użyj tej checklisty podczas Code Review, aby ocenić, czy Twój framework UI zachowuje wysokie standardy inżynieryjne:

- [ ] **SRP**: Czy Twoje pliki testowe zawierają wyłącznie logikę scenariusza (AAA) i asercje, bez bezpośrednich wywołań technicznych lokalizatorów?
- [ ] **DIP**: Czy kontekst przeglądarki (`page`) i zapytania (`request`) są wstrzykiwane do klas stron, a nie inicjalizowane wewnątrz nich?
- [ ] **WET vs DRY**: Czy abstrakcja (np. nowa fixtura, klasa pomocnicza) została wprowadzona z powodu potrójnej duplikacji kodu, czy powstała przedwcześnie?
- [ ] **Modularne Fixtury**: Czy udało się wyeliminować bloki `beforeEach`/`afterEach` na rzecz modularnych, reużywalnych fixture-ów?
- [ ] **Diagnostyka**: Czy w przypadku błędu test automatycznie zbiera i załącza kontekst (zrzuty ekranu, wideo, logi konsoli) do raportu HTML?
