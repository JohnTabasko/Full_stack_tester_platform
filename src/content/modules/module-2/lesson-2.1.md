# Przeglądarka, kontekst i strona — Browser, BrowserContext, Page

Hierarchia `Browser → BrowserContext → Page` jest fundamentem Playwright. Jeśli ją rozumiesz, łatwiej projektujesz izolację testów, logowanie, scenariusze wielu użytkowników, emulację urządzeń i równoległe wykonanie w CI. Jeśli jej nie rozumiesz, szybko zaczniesz pisać testy zależne od wspólnej sesji, powolne i trudne w debugowaniu.

## 1. Model obiektów Playwright

```text
Browser
  BrowserContext
    Page
```

- `Browser` — proces przeglądarki, np. Chromium, Firefox lub WebKit.
- `BrowserContext` — izolowany profil/sesja w przeglądarce.
- `Page` — karta w danym kontekście.

W Playwright Test najczęściej nie tworzysz tych obiektów ręcznie. Runner dostarcza je jako fixtures:

```typescript
import { test, expect } from '@playwright/test';

test('strona główna działa', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('main')).toBeVisible();
});
```

Fixture `page` oznacza, że Playwright przygotował dla testu stronę w izolowanym kontekście.

## 2. Browser — proces przeglądarki

`Browser` reprezentuje uruchomiony silnik przeglądarki. Ręczne użycie wygląda tak:

```typescript
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
await page.goto('https://example.com');
await browser.close();
```

W Playwright Test taki kod jest rzadki, bo runner zarządza przeglądarką za Ciebie. Ręczne tworzenie browsera ma sens w skryptach, narzędziach wewnętrznych albo bardzo niestandardowych fixtures.

Typowe opcje uruchomienia:

- `headless` — bez widocznego okna, typowo w CI;
- `channel` — np. Chrome lub Edge, jeśli chcesz użyć konkretnego kanału;
- `slowMo` — spowolnienie akcji do debugowania;
- `proxy` — konfiguracja proxy;
- `args` — flagi przeglądarki, głównie dla zaawansowanych scenariuszy Chromium.

Nie nadużywaj flag `args`. Jeśli test wymaga wielu specjalnych flag, opisz powód w konfiguracji.

## 3. BrowserContext — izolowana sesja

`BrowserContext` to jedna z najważniejszych koncepcji Playwright. Możesz go traktować jak osobny profil incognito. Każdy kontekst ma własne:

- cookies;
- localStorage;
- sessionStorage;
- IndexedDB;
- permissions;
- geolokalizację;
- ustawienia viewportu;
- nagłówki;
- storage state.

Dzięki temu każdy test może działać w czystej sesji. To ogranicza flaky tests wynikające z przecieków stanu.

```typescript
const context = await browser.newContext({
  locale: 'pl-PL',
  timezoneId: 'Europe/Warsaw',
  viewport: { width: 1440, height: 900 },
});
```

## 4. Page — karta przeglądarki

`Page` to karta, na której wykonujesz większość operacji:

```typescript
await page.goto('/login');
await page.getByLabel('Email').fill('user@example.com');
await page.getByRole('button', { name: 'Zaloguj' }).click();
await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
```

`Page` obsługuje też zdarzenia:

```typescript
page.on('console', message => console.log(message.text()));
page.on('request', request => console.log(request.method(), request.url()));
page.on('response', response => console.log(response.status(), response.url()));
```

To ważne dla Full Stack Testera, bo pozwala łączyć test UI z diagnostyką sieci i konsoli.

## 5. Wielu użytkowników w jednym teście

Jedna z praktycznych przewag Playwright to wiele kontekstów w jednym browserze.

```typescript
const adminContext = await browser.newContext({ storageState: 'playwright/.auth/admin.json' });
const userContext = await browser.newContext({ storageState: 'playwright/.auth/user.json' });

const adminPage = await adminContext.newPage();
const userPage = await userContext.newPage();

await adminPage.goto('/admin/orders');
await userPage.goto('/orders');
```

Scenariusze:

- admin nadaje uprawnienia, user widzi zmianę;
- konsultant odpowiada na czacie, klient widzi wiadomość;
- użytkownik składa zamówienie, panel admina pokazuje status;
- dwa konta współpracują w czasie rzeczywistym.

Pamiętaj o zamykaniu ręcznie utworzonych kontekstów:

```typescript
await adminContext.close();
await userContext.close();
```

## 6. Storage state

`storageState` pozwala zapisać stan logowania:

```typescript
await page.context().storageState({ path: 'playwright/.auth/user.json' });
```

A potem użyć go w konfiguracji:

```typescript
use: {
  storageState: 'playwright/.auth/user.json',
}
```

To przyspiesza testy i ogranicza powtarzanie logowania przez UI. Nie oznacza jednak, że testy logowania są zbędne. Powinny istnieć osobno, ale nie każdy test musi przechodzić pełny login flow.

Pliki `.auth/*.json` traktuj jak sekrety. Mogą zawierać cookies i tokeny.

## 7. Emulacja w kontekście

Kontekst pozwala symulować warunki użytkownika:

```typescript
const mobileContext = await browser.newContext({
  ...devices['iPhone 15'],
  locale: 'pl-PL',
  timezoneId: 'Europe/Warsaw',
  geolocation: { longitude: 21.0122, latitude: 52.2297 },
  permissions: ['geolocation'],
  colorScheme: 'dark',
});
```

To przydatne dla testów responsywności, lokalizacji, uprawnień i trybu dark mode.

## 8. Persistent context

Playwright umożliwia także persistent context, czyli kontekst oparty o katalog profilu użytkownika:

```typescript
const context = await chromium.launchPersistentContext('user-data-dir', {
  headless: false,
});
```

To zaawansowany temat, używany np. przy testowaniu rozszerzeń Chrome. W zwykłych testach E2E preferuj standardowe, izolowane konteksty.

## 9. Antywzorce

- Jeden wspólny kontekst dla całej suite.
- Logowanie przez UI w każdym teście bez potrzeby.
- Ręczne tworzenie browsera w każdym teście Playwright Test.
- Brak zamykania ręcznie utworzonych kontekstów.
- Przechowywanie prawdziwego `storageState` w repozytorium.
- Testy zależne od cookies pozostałych po poprzednim teście.

## 10. Checklista

- Czy test korzysta z izolowanego kontekstu?
- Czy stan logowania jest przygotowany przez setup project albo fixture?
- Czy wiele ról użytkowników ma osobne konteksty?
- Czy ręcznie utworzone konteksty są zamykane?
- Czy storage state nie trafia do repozytorium?
- Czy emulacja jest ustawiona na poziomie kontekstu lub projektu?

## Linki

- [Browser contexts](https://playwright.dev/docs/browser-contexts)
- [Pages](https://playwright.dev/docs/pages)
- [Authentication](https://playwright.dev/docs/auth)
- [Emulation](https://playwright.dev/docs/emulation)
- [BrowserContext API](https://playwright.dev/docs/api/class-browsercontext)

## 11. BrowserName i projekty Playwright

W Playwright Test rzadko wybierasz przeglądarkę ręcznie przez `chromium.launch()`. Najczęściej robi to runner przez projekty w `playwright.config.ts`:

```typescript
projects: [
  { name: 'chromium', use: { browserName: 'chromium' } },
  { name: 'firefox', use: { browserName: 'firefox' } },
  { name: 'webkit', use: { browserName: 'webkit' } },
]
```

Dzięki temu ten sam test może działać na różnych silnikach, a kod testu nadal używa fixture `page`.

## 12. Kiedy tworzyć kontekst ręcznie

Ręczne `browser.newContext()` ma sens, gdy testujesz wielu użytkowników, wiele ról albo izolowane sesje w jednym scenariuszu. Nie rób tego w każdym teście bez potrzeby, bo Playwright Test już zapewnia izolowany kontekst per test.

## 13. Zasada końcowa

Browser jest kosztowny, context izoluje sesję, a page reprezentuje kartę. Profesjonalny test Playwright zwykle używa fixture `page`, a ręcznie tworzy dodatkowe konteksty tylko wtedy, gdy wymaga tego scenariusz.

## 📘 Suplement Inżynieryjny 2026: Podstawy Playwright (Locators & Actions)
*Inspiracja: „Hands-On Automated Testing with Playwright” (2026), Chapter 2*
*   **Priorytet Dostępności (A11y)**: Współczesne testy odrzucają surowe selektory CSS i XPath. Zawsze dąż do używania lokalizatorów semantycznych (`getByRole`, `getByLabel`), które imitują interakcję prawdziwego użytkownika i ułatwiają zachowanie standardów dostępności w kodzie produkcyjnym.
*   **Auto-Waiting State Machine**: Playwright przed kliknięciem elementu automatycznie sprawdza jego stan (czy jest widoczny, stabilny, włączony i klikalny). Zrozumienie tej maszyny stanów zapobiega pisaniu zbędnych oczekiwań (np. `sleep`).
