# Integracja z Allure

> **Perspektywa Full Stack Testera**
> Allure to nie tylko ładny HTML — to system organizacji wyników testów w hierarchię, którą rozumieją zarówno programiści, jak i product ownnerzy. Epic, feature, severity i steps tworzą mapę jakości produktu, którą można prezentować na review, omawiać na planningu i śledzić w czasie. Ta lekcja uczy, jak skonfigurować Allure tak, aby raport był narzędziem komunikacji, a nie dekoracją.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Skonfigurować Allure z Playwright** — instalacja, integracja w CI, generowanie raportów
- **Stosować adnotacje Allure** konsekwentnie — epic, feature, story, severity, step
- **Grupować awarie w kategorie** — produkcyjne błędy, problemy z danymi, limity czasu, środowisko
- **Korzystać z historii wyników** — porównywanie przebiegów, śledzenie trendów w dłuższym okresie
- **Hostować raporty** w sposób dostępny dla zespołu — GitHub Pages, Artifactory, S3, Jenkins

---

## Wprowadzenie: czym jest Allure i dlaczego warto

Allure to framework do generowania raportów testowych, który dodaje strukturę i kontekst do surowych wyników testów. W przeciwieństwie do standardowego HTML reporta Playwright, Allure oferuje:

- **Hierarchię organizacyjną** — epic → feature → story, co odpowiada strukturze produktu
- **Klasyfikację severity** — blocker, critical, normal, minor, trivial
- **Grupy kategorii failure'ów** — automatyczna kategoryzacja błędów według typu
- **Śledzenie kroków** — szczegółowy log każdego kroku w scenariuszu
- **Załączniki** — screenshoty, logi, trace'y dołączane automatycznie
- **Historia wyników** — porównywanie przebiegów w czasie, trend analysis
- **Integracja z narzędziami** — Jira, TestRail, Zephyr, Slack

Allure jest framework-agnostyczny — działa z Playwright, pytest, JUnit, TestNG, Mocha, Cucumber i wieloma innymi. Dla Playwrighta używamy dedykowanego adaptera `allure-playwright`.

---

## Sekcja 1: Instalacja i konfiguracja

### Instalacja Allure

```bash
# Instalacja Allure CLI (potrzebny do generowania raportów)
npm install -g allure-commandline

# Lub jako dev dependency w projekcie
npm install -D @allure-playwright playwright allure-playwright

# Sprawdzenie wersji
allure --version
```

### Konfiguracja Playwright z Allure

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  
  // Allure reporter — generuje surowe wyniki w formacie Allure
  reporter: [
    ['list'],
    ['allure-playwright', {
      outputDir: './allure-results',
      detail: true,
      suiteSuffix: '',        // suffix nazwy suite (opcjonalny)
      environmentInfo: {
        browser: 'chromium',
        nodeVersion: process.version,
      },
    }],
  ],
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

Po uruchomieniu testów Playwright wygeneruje pliki w `./allure-results/` — to surowe dane, które następnie konwertujemy w raport HTML.

### Generowanie raportu

```bash
# Generuj raport z wyników Allure
allure generate ./allure-results --clean -o ./allure-report

# Otwórz raport w przeglądarce
allure open ./allure-report

# Lub serve raport (użyteczne w CI)
allure serve ./allure-results
```

### Pełny pipeline w CI (GitHub Actions)

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests with Allure

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      
      - name: Run tests
        run: npx playwright test --reporter=html,allure-playwright
        
      - name: Generate Allure report
        run: allure generate ./allure-results --clean -o ./allure-report
      
      - name: Deploy Allure report to GitHub Pages
        if: github.ref == 'refs/heads/main'
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./allure-report
          publish_branch: gh-pages
```

Konfiguracja GitHub Pages wymaga włączenia w ustawieniach repozytorium: **Settings → Pages → Source: Deploy from a branch, Branch: gh-pages**.

---

## Sekcja 2: Adnotacje i etykiety

### Hierarchia Allure — Epic, Feature, Story

Hierarchia Allure odpowiada struktury produktu w podejściu BDD:

| Poziom | Allure | Playwright | Odpowiednik biznesowy |
|--------|--------|------------|----------------------|
| Najwyższy | `epic` | `allure.epic()` | Obszar produktu / domena |
| Średni | `feature` | `allure.feature()` | Funkcjonalność / moduł |
| Najniższy | `story` | `allure.story()` | User story / konkretny przypadek |

```typescript
import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';

// Test z pełną hierarchią Allure
test('użytkownik może zresetować hasło przez email', async ({ page }) => {
  // Definiujemy hierarchię od najwyższego poziomu
  await allure.epic('Zarządzanie kontem');
  await allure.feature('Reset hasła');
  await allure.story('SCEN-1234: Reset hasła przez link w emailu');
  await allure.severity('critical');
  
  // Logika testu
  await page.goto('/login');
  await page.getByText('Nie pamiętam hasła').click();
  await page.getByPlaceholder('Email').fill('jan.kowalski@example.com');
  await page.getByRole('button', { name: 'Wyślij link' }).click();
  
  await expect(page.getByText('Link został wysłany')).toBeVisible();
});
```

Hierarchia pozwala filtrować raport Allure:
- "Pokaż wszystkie testy z epic: Zarządzanie kontem"
- "Pokaż testy feature: Płatności z severity: critical"
- "Pokaż story: SCEN-1234"

### Severity — waga testu

Severity określa krytyczność testu dla produktu:

```typescript
// Import z allure-playwright
import { Severity } from 'allure-playwright';

// Definiowanie severity na poziomie testu
test('płatność kartą — sukces', { 
  severity: Severity.CRITICAL, 
}, async ({ page }) => {
  // ...
});

// Lub dynamicznie w teście
test('weryfikacja email — format nieprawidłowy', async ({ page }) => {
  await allure.severity('minor');
  // ...
});
```

| Severity | Opis | Przykład | Quality gate |
|----------|------|----------|--------------|
| **blocker** | Test blokuje cały przebieg | Błąd krytyczny w login | Zawsze block |
| **critical** | Awaria core functionality | Checkout nie działa | Zawsze block |
| **normal** | Standardowy test funkcjonalny | Filtrowanie produktów | Block jeśli > 5% |
| **minor** | Drobny defect | Błąd literówki | Warn only |
| **trivial** | Kosmetyczny problem | Formatowanie UI | Ignore |

### Linkowanie do narzędzi zewnętrznych

Allure pozwala linkować testy do ticketów w Jira, test management tools i repozytoriach:

```typescript
import { test } from '@playwright/test';
import { allure } from 'allure-playwright';

// Definiowanie linków do TMS
test('rejestracja nowego użytkownika', async ({ page }) => {
  await allure.link('https://jira.example.com/browse/PROD-1234', 'jira');
  await allure.link('https://testrail.example.com/tests/TC-5678', 'testrail');
  
  // ...
});
```

W konfiguracji `allure.properties` definiujemy szablony linków:

```properties
# allure.properties
allure.link.issue.pattern=https://jira.example.com/browse/{}
allure.link.tms.pattern=https://testrail.example.com/tests/{}
```

### Parametryzacja testów

Allure automatycznie rozpoznaje parametry Playwright i wyświetla je w raporcie:

```typescript
test('wyszukiwanie produktu przez {query}', async ({ page }, testInfo) => {
  // Parametr z danych testowych
  const query = testInfo.parameters['query'];
  
  await page.goto('/search');
  await page.getByPlaceholder('Szukaj...').fill(query);
  await expect(page.getByRole('heading', { name: query })).toBeVisible();
});
```

W pliku `playwright.config.ts` lub w test data definiujemy parametry:

```typescript
test('wyszukiwanie produktu', async ({ page }, testInfo) => {
  // ...
}).configure({ parameters: { query: 'laptop' } });

// Lub z data-driven testing
test.describe.each([
  { query: 'laptop', category: 'elektronika' },
  { query: 'książka', category: 'media' },
  { query: 'buty', category: 'odzież' },
])('wyszukiwanie: $query', ({ query, category }) => {
  test('znajduje produkty z kategorii: ' + category, async ({ page }) => {
    await allure.parameter('query', query);
    await allure.parameter('category', category);
    // ...
  });
});
```

---

## Sekcja 3: Steps — logowanie kroków testu

### Definiowanie kroków

Steps w Allure tworzą czytelny, rozwijalny log każdego testu. Każdy step powinien reprezentować znaczącą fazę scenariusza, nie pojedynczą akcję:

```typescript
import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';

test('rezerwacja lotu — end-to-end', async ({ page }) => {
  await allure.feature('Rezerwacje');
  await allure.severity('critical');
  
  // Krok 1: Nawigacja do strony rezerwacji
  await allure.step('Otwieram stronę wyszukiwania lotów', async () => {
    await page.goto('/flights/search');
    await expect(page.getByRole('heading', { name: 'Wyszukaj lot' })).toBeVisible();
  });
  
  // Krok 2: Wypełnienie formularza
  await allure.step('Wypełniam formularz wyszukiwania', async () => {
    await page.getByLabel('Z:').selectOption('Warszawa');
    await page.getByLabel('Do:').selectOption('Kraków');
    await page.getByLabel('Data wylotu').fill('2024-07-15');
    await page.getByLabel('Liczba pasażerów').selectOption('2');
    await page.getByRole('button', { name: 'Szukaj' }).click();
  });
  
  // Krok 3: Weryfikacja wyników
  await allure.step('Weryfikuję wyniki wyszukiwania', async () => {
    await expect(page.getByText('Znaleziono loty')).toBeVisible({ timeout: 10000 });
    
    const flightCards = page.locator('[data-testid="flight-card"]');
    const count = await flightCards.count();
    
    if (count === 0) {
      throw new Error(`Nie znaleziono żadnych lotów. Oczekiwano minimum 1.`);
    }
    
    await expect(count).toBeGreaterThan(0);
  });
  
  // Krok 4: Wybór lotu
  await allure.step('Wybieram pierwszy dostępny lot', async () => {
    await page.locator('[data-testid="flight-card"]').first().click();
    await expect(page.getByText('Szczegóły lotu')).toBeVisible();
  });
  
  // Krok 5: Rezerwacja
  await allure.step('Przechodzę do rezerwacji', async () => {
    await page.getByRole('button', { name: 'Zarezerwuj' }).click();
    await expect(page).toHaveURL(/.*checkout/);
  });
});
```

### Zagnieżdżone steps

Steps mogą być zagnieżdżone dla lepszej organizacji:

```typescript
await allure.step('Proces zakupowy', async () => {
  await allure.step('Dodaj produkt do koszyka', async () => {
    await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  });
  
  await allure.step('Przejdź do kasy', async () => {
    await page.getByRole('link', { name: 'Koszyk' }).click();
    await expect(page).toHaveURL(/.*cart/);
  });
  
  await allure.step('Wprowadź dane płatności', async () => {
    await page.getByPlaceholder('Numer karty').fill('4111111111111111');
    await page.getByPlaceholder('CVV').fill('123');
    await page.getByPlaceholder('MM/RR').fill('12/26');
  });
  
  await allure.step('Złóż zamówienie', async () => {
    await page.getByRole('button', { name: 'Zapłać' }).click();
  });
});
```

### Automatyczne screenshoty na failure

Allure może automatycznie dołączać screenshoty przy niepowodzeniu stepu:

```typescript
// W allure-playwright, screenshot jest dołączany automatycznie
// gdy test zakończy się niepowodzeniem

test('formularz kontaktowy — walidacja', async ({ page }) => {
  await allure.step('Wypełniam formularz nieprawidłowymi danymi', async () => {
    await page.goto('/contact');
    
    // Celowo zostawiamy puste wymagane pole
    await page.getByRole('button', { name: 'Wyślij' }).click();
    
    // Sprawdzamy komunikat błędu
    const errorMessage = page.locator('.error-message');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    
    // Allure automatycznie dołączy screenshot z błędem
  });
});
```

Aby włączyć automatyczne screenshoty dla wszystkich failure'ów, dodajemy hook w konfiguracji:

```typescript
// hooks.ts — globalne hooki Allure
import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';

test.afterEach(async ({}, testInfo) => {
  // Jeśli test nie przeszedł, dołącz screenshot
  if (testInfo.status !== 'passed') {
    // Screenshot zostanie automatycznie załączony przez playwright allure adapter
    console.log(`Test nie przeszedł: ${testInfo.title}`);
  }
});
```

---

## Sekcja 4: Kategorie błędów — triage failure'ów

### Definiowanie kategorii

Kategorie Allure pozwalają grupować failure'y według typu, co ułatwia triage. Typowa konfiguracja kategorii:

```javascript
// categories.js — konfiguracja kategorii Allure
module.exports = [
  {
    name: 'Błędy produktowe',
    matchedStatuses: ['failed'],
    messageRegex: '.*(AssertionError|expect.*to).*',
    traceRegex: '.*src/app/.*',
  },
  {
    name: 'Timeout — wolne API',
    matchedStatuses: ['failed'],
    messageRegex: '.*Timeout.*exceeded.*',
  },
  {
    name: 'Problemy środowiskowe',
    matchedStatuses: ['broken'],
    messageRegex: '.*(ECONNREFUSED|ENOTFOUND|net::ERR).*',
  },
  {
    name: 'Niestabilność testów (flaky)',
    matchedStatuses: ['failed'],
    messageRegex: '.*flaky.*',
  },
  {
    name: 'Błędy danych testowych',
    matchedStatuses: ['failed'],
    messageRegex: '.*(no such element|locator.*not visible|not found).*',
  },
  {
    name: 'Problemy z identyfikacją elementów',
    matchedStatuses: ['failed'],
    messageRegex: '.*(selector|locator|css|xpath).*',
  },
];
```

Konfiguracja w pliku `playwright.config.ts`:

```typescript
import categories from './categories';

export default defineConfig({
  reporter: [
    ['list'],
    ['allure-playwright', {
      outputDir: './allure-results',
      categories,
      environmentInfo: {
        nodeVersion: process.version,
        platform: process.platform,
      },
    }],
  ],
});
```

### Analiza kategorii w praktyce

Po uruchomieniu testów raport Allure pokazuje podział na kategorie:

```
❌ Failed tests: 12

📁 Błędy produktowe (6)
   - Checkout: nie można dodać więcej niż 99 sztuk
   - Search: filtrowanie po cenie zwraca złe wyniki
   ...

📁 Timeout — wolne API (3)
   - API /products: timeout po 30s
   - API /orders: timeout na staging
   ...

📁 Problemy środowiskowe (2)
   - Cannot connect to database
   - Redis connection refused
   ...

📁 Niestabilność testów (1)
   - Login test: flaky na Firefox
```

Ta kategoryzacja pozwala szybko skierować problemy do właściwych zespołów:
- **Błędy produktowe** → Developerzy produktu
- **Timeout API** → Zespół backend/API
- **Problemy środowiskowe** → DevOps/Infrastructure
- **Flaky** → Zespół QA (naprawić testy)

---

## Sekcja 5: Historia wyników i hosting

### Przechowywanie historii

Allure przechowuje historię wyników w pliku `history/history.json`. Aby historia działała między przebiegami, należy zachować ten katalog między generowaniami raportów:

```bash
# CI pipeline — zachowaj historię między przebiegami
- name: Restore Allure history
  uses: actions/cache@v3
  with:
    path: ./allure-results/history
    key: allure-history-${{ github.run_id }}

- name: Save Allure history
  uses: actions/cache@v3
  with:
    path: ./allure-results/history
    key: allure-history-${{ github.run_id }}
    restore-keys: |
      allure-history-
```

Lepsze podejście — historia na branchu `gh-pages`:

```yaml
- name: Checkout gh-pages branch for history
  run: |
    git clone --depth 1 --branch gh-pages https://github.com/${{ github.repository }}.git gh-pages-repo 2>/dev/null || true
    mkdir -p ./allure-results/history
    if [ -d gh-pages-repo/history ]; then
      cp -r gh-pages-repo/history ./allure-results/
    fi

- name: Generate report with history
  run: allure generate ./allure-results --clean -o ./allure-report
```

### Hosting raportów — opcje

| Metoda | Zalety | Wady |
|--------|--------|------|
| **GitHub Pages** | Darmowe, łatwa integracja z Actions, wersjonowanie | Publiczne dla public repos, brak auth |
| **AWS S3 + CloudFront** | Skalowalność, private buckets, CDN | Wymaga konfiguracji AWS, koszty egress |
| **Artifactory** | Enterprise, autentykacja, wersjonowanie artifactów | Wymaga license, bardziej złożone |
| **Jenkins** | Wbudowane w CI, łatwa autentykacja | Ograniczona skalowalność |
| **Netlify/Vercel** | Darmowe dla open source, CDN, custom domains | Brak wbudowanej integracji z artifactami CI |

### GitHub Pages — kompletna konfiguracja

```yaml
# .github/workflows/allure.yml
name: Allure Report

on:
  push:
    branches: [main, develop]

jobs:
  test-and-report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      
      - name: Run tests
        run: npx playwright test --reporter=allure-playwright
      
      - name: Checkout gh-pages
        uses: actions/checkout@v4
        with:
          ref: gh-pages
          path: gh-pages
          fetch-depth: 0
          # Ustawienie GITHUB_TOKEN jako read-only token
          token: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Copy history
        run: |
          mkdir -p gh-pages/history
          if [ -d gh-pages/history ]; then
            cp -r gh-pages/history/* allure-results/history/ 2>/dev/null || true
          fi
      
      - name: Generate Allure report
        run: |
          allure generate allure-results --clean -o gh-pages
          git config --global user.name "github-actions[bot]"
          git config --global user.email "github-actions[bot]@users.noreply.github.com"
          cd gh-pages
          git add .
          git commit -m "Allure report $(date -u +'%Y-%m-%dT%H:%M:%SZ')" || true
          git push origin gh-pages || true
```

### Historia i porównywanie wyników

Allure history pokazuje trendy z ostatnich przebiegów. W raporcie widzisz:

- **Trend pass rate** — czy suite się poprawia, czy pogarsza
- **Statystyki failure categories** — które kategorie błędów dominują
- **Najczęstsze błędy** — który test fails najczęściej w ostatnich przebiegach
- **Duration trend** — czy testy przyspieszają, czy zwalniają

```bash
# Lokalne przeglądanie historii — serve z katalogu głównego
allure serve ./allure-results -p 9090

# Z określonym portem historycznym
allure open ./allure-report -p 9091
```

---

## Sekcja 6: Zaawansowane funkcje Allure

### Attachment — dołączanie plików

```typescript
import { allure } from 'allure-playwright';
import * as fs from 'fs/promises';

test('eksport danych — weryfikacja pliku', async ({ page }) => {
  await allure.step('Eksportuję raport CSV', async () => {
    await page.goto('/reports');
    await page.getByRole('button', { name: 'Eksportuj CSV' }).click();
    
    // Czekaj na pobranie pliku
    await page.waitForTimeout(3000);
  });
  
  await allure.step('Weryfikuję zawartość pliku', async () => {
    const filePath = './downloads/report.csv';
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Dołącz plik do raportu Allure
    await allure.attachment(
      'Eksportowany raport CSV',
      content,
      'text/csv'
    );
    
    // Weryfikacja
    expect(content).toContain('id,date,amount');
    expect(content).toContain('Order');
  });
});
```

### Launch — grupowanie testów

Launch w Allure to named group przebiegów testów — przydatne przy wielu środowiskach lub zestawach testów:

```typescript
// Definiowanie launch na poziomie konfiguracji
import { AllureResults } from 'allure-js-commons';

const results = new AllureResults();
results.startLaunch({
  name: 'Playwright Regression Suite',
  version: process.env.RELEASE_VERSION ?? 'dev',
});
```

### Trenowanie modelu kategoryzacji (AI-based)

Zaawansowane użycie Allure polega na trenowaniu modelu kategoryzacji błędów na podstawie historycznych danych. Allure pozwala eksportować wyniki jako JSON i analizować je w external tools:

```bash
# Eksport wyników do analizy
allure generate ./allure-results --clean -o ./allure-report
cat ./allure-report/widgets/summary.json

# Struktura danych dla ML modelu
{
  "runs": [...],
  "defects": [...],
  "categories": [...],
  "history": {...}
}
```

---

## Sekcja 7: Pułapki i dobre praktyki

### Pułapka 1: Niespójne etykiety

Jeśli jedni developerzy używają `epic: Zakupy`, a inni `epic: E-commerce`, raport jest bezużyteczny. Solution: zdefiniuj glossary etykiet przed startem i wprowadź linting w pre-commit hook.

```typescript
// .eslintrc.js — walidacja etykiet Allure
module.exports = {
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'CallExpression[callee.name="allure.epic"]',
        message: 'Używaj tylko zatwierdzonych epic: ' + 
          'Zakupy, Konto, Płatności, Admin, Integracje',
      },
    ],
  },
};
```

### Pułapka 2: Za dużo steps

Logowanie każdej akcji jako step tworzy nieczytelny raport. Solution: steps = fazy scenariusza, nie pojedyncze kliknięcia. Maksymalnie 5-8 steps na typowy test.

### Pułapka 3: Historia bez kontekstu

Sama historia bez interpretacji to data. Solution: dodawaj komentarze do trendów ("Flaky rate spadł o 2% po usunięciu testów z external dependencies").

### Pułapka 4: Brak właściciela kategorii

Kategorie bez przypisanych właścicieli oznaczają, że nikt nie odpowiada za naprawę. Solution: mapuj kategorie na zespoły w `categories.js` i komunikuj w team charter.

---

## Perspektywa Full Stack Testera

Allure jest mostem między technicznym wynikiem testów a biznesową perspektywą jakości. Jako Full Stack Tester projektujesz raport Allure z myślą o dwóch perspektywach:

**Dla developerów**: szczegółowe steps, trace, screenshot failure, link do kodu. Developer chce szybko znaleźć przyczynę i naprawić.

**Dla stakeholderów**: epic/feature overview, severity distribution, trend history, category breakdown. PM i manager chcą zrozumieć, czy produkt jest gotowy i gdzie są ryzyka.

Najlepsze wdrożenia Allure, które widziałem, traktują etykiety jako contract między testami a strukturą produktu. Epic i feature odpowiadają faktycznym domenom biznesowym — nie są tworzone ad-hoc, lecz wynikają z architektury produktu. Dzięki temu raport Allure staje się living documentation zespołu.

---

## Podsumowanie

- **Allure doda strukturę** do surowych wyników Playwright — hierarchię epic/feature/story, severity i steps.
- **Instalacja** wymaga `allure-commandline`, adaptera `allure-playwright` i konfiguracji `reporter` w `playwright.config.ts`.
- **Adnotacje** (`allure.epic`, `allure.feature`, `allure.severity`) muszą być stosowane konsekwentnie — zdefiniuj glossary przed startem.
- **Steps** to fazy scenariusza, nie pojedyncze akcje. Maksymalnie 5-8 steps na test.
- **Kategorie failure'ów** pozwalają grupować błędy według typu i kierować je do właściwych zespołów.
- **Historia** wymaga zachowania katalogu `history/` między przebiegami i hostowania na stałym URL.
- **Hosting na GitHub Pages** to darmowe i proste rozwiązanie dla publicznych repozytoriów.

---

## Linki i źródła

- [Allure Framework — strona główna](https://allurereport.org/) — dokumentacja, download, community
- [Allure Playwright — GitHub](https://github.com/allure-framework/allure-playwright) — oficjalny adapter dla Playwright
- [Allure Command Line](https://www.npmjs.com/package/allure-commandline) — CLI do generowania i otwierania raportów
- [Allure History — GitHub Pages integration](https://docs.qameta.io/allure/latest/reporting/history/) — jak skonfigurować historię między przebiegami
- [Allure Categories](https://docs.qameta.io/allure/latest/reporting/categories/) — definicja kategorii failure'ów
- [Allure Labels](https://docs.qameta.io/allure/latest/reporting/widgets/) — epic, feature, story, severity — pełna dokumentacja etykiet
- [GitHub Actions — GitHub Pages deployment](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page) — deployment raportów na GitHub Pages