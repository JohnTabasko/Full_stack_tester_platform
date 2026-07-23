# Strategie uwierzytelniania — storageState, role i stabilne logowanie

Uwierzytelnianie jest jednym z najczęstszych źródeł wolnych i niestabilnych testów E2E. Logowanie przez UI jest ważnym scenariuszem, ale nie powinno być powtarzane w każdym teście. Jeśli 300 testów zaczyna się od wpisania emaila i hasła, awaria formularza logowania albo chwilowy problem SSO zepsuje cały pakiet, nawet jeśli testowana funkcja nie ma nic wspólnego z logowaniem.

Celem tej lekcji jest pokazanie, jak w Playwright projektować logowanie przez `storageState`, setup project, role użytkowników, API authentication i per-worker accounts.

## 1. Kiedy logować się przez UI

Logowanie przez UI testuj wtedy, gdy celem testu jest sam mechanizm logowania:

- poprawne dane logowania;
- błędne hasło;
- zablokowane konto;
- walidacja pól;
- MFA;
- wylogowanie;
- przekierowanie po logowaniu;
- wygasła sesja.

Nie loguj się przez UI w każdym teście koszyka, profilu, faktur czy panelu admina. Dla nich logowanie jest warunkiem wstępnym, nie celem.

## 2. `storageState` — zapis sesji

Playwright może zapisać cookies, localStorage i IndexedDB kontekstu:

```typescript
await page.context().storageState({ path: 'playwright/.auth/user.json' });
```

Potem używasz tego stanu w konfiguracji:

```typescript
use: {
  storageState: 'playwright/.auth/user.json',
}
```

Pliki `.auth/*.json` mogą zawierać tokeny i cookies. Nie commituj ich do repozytorium.

`.gitignore`:

```gitignore
playwright/.auth/*.json
```

## 3. Setup project — rekomendowany wzorzec

W Playwright najczytelniejszy wzorzec to osobny projekt przygotowujący sesję.

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium-user',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
```

Test setup:

```typescript
// tests/auth.setup.ts
import { test as setup, expect } from '@playwright/test';

setup('authenticate user', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_USER!);
  await page.getByLabel('Hasło').fill(process.env.E2E_PASSWORD!);
  await page.getByRole('button', { name: 'Zaloguj' }).click();

  await expect(page.getByRole('heading', { name: 'Panel' })).toBeVisible();
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
```

To uruchamia logowanie raz, a właściwe testy startują już w stanie zalogowanym.

## 4. Wiele ról użytkowników

Systemy komercyjne zwykle mają role: admin, manager, klient, użytkownik read-only, użytkownik bez uprawnień.

```typescript
projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/ },
  {
    name: 'admin',
    use: { storageState: 'playwright/.auth/admin.json' },
    dependencies: ['setup'],
  },
  {
    name: 'customer',
    use: { storageState: 'playwright/.auth/customer.json' },
    dependencies: ['setup'],
  },
]
```

W setup możesz zapisać kilka sesji:

```typescript
async function loginAndSave(page: Page, email: string, password: string, path: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Hasło').fill(password);
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByRole('heading')).toBeVisible();
  await page.context().storageState({ path });
}
```

Każda rola powinna mieć osobne konto i osobny storage state.

## 5. Per-worker authentication

Jeśli testy działają równolegle i modyfikują dane użytkownika, jedno konto na całą suite jest ryzykowne. Lepszy wzorzec: konto per worker.

```typescript
import { test as base } from '@playwright/test';

export const test = base.extend<{}, { workerStorageState: string }>({
  workerStorageState: [async ({ browser }, use, workerInfo) => {
    const id = workerInfo.parallelIndex;
    const page = await browser.newPage();

    await page.goto('/login');
    await page.getByLabel('Email').fill(`user-${id}@example.com`);
    await page.getByLabel('Hasło').fill(process.env.E2E_PASSWORD!);
    await page.getByRole('button', { name: 'Zaloguj' }).click();

    const path = `playwright/.auth/user-${id}.json`;
    await page.context().storageState({ path });
    await page.close();

    await use(path);
  }, { zakres: 'worker' }],
});
```

Ten wzorzec ogranicza konflikty między testami działającymi równolegle.

## 6. Logowanie przez API

Czasem UI logowania jest wolne, zależne od SSO albo nieistotne dla testu. Możesz przygotować sesję przez API, jeśli aplikacja na to pozwala.

```typescript
const response = await request.post('/api/auth/login', {
  data: {
    email: process.env.E2E_USER,
    password: process.env.E2E_PASSWORD,
  },
});
expect(response.status()).toBe(200);
```

Następnie możesz zapisać cookies albo tokeny zgodnie z architekturą aplikacji. Rób to świadomie: ręczne wkładanie tokena do localStorage może ominąć realny mechanizm bezpieczeństwa.

## 7. APIRequestContext z autoryzacją

Do setupu danych często używa się osobnego klienta API:

```typescript
const api = await playwright.request.newContext({
  baseURL: process.env.BASE_URL,
  extraHTTPHeaders: {
    Authorization: `Bearer ${process.env.ADMIN_API_TOKEN}`,
  },
});

const user = await (await api.post('/api/users', {
  data: { email: `test-${Date.now()}@example.com` },
})).json();

await api.dispose();
```

Nie mieszaj bez potrzeby tokenów administracyjnych z testami UI użytkownika. Setup danych może wymagać uprawnień admina, ale scenariusz UI powinien działać na właściwej roli.

## 8. SessionStorage

Playwright `storageState` nie zapisuje sessionStorage w standardowy sposób, ponieważ sessionStorage jest specyficzny dla konkretnej domeny i karty. Jeśli aplikacja przechowuje sesję w sessionStorage, możesz zapisać i odtworzyć ją przez `page.evaluate`, ale lepiej zapytać zespół, czy to świadoma decyzja architektoniczna.

Przykład odczytu:

```typescript
const session = await page.evaluate(() => JSON.stringify(sessionStorage));
```

Taki workaround powinien być opisany w projekcie, bo jest bardziej kruchy niż cookies/localStorage.

## 9. SSO, OAuth i MFA

Zewnętrzne logowanie często ma ograniczenia:

- CAPTCHA;
- MFA;
- rate limiting;
- polityki bezpieczeństwa;
- niestabilne środowisko dostawcy;
- blokady automatyzacji.

Strategie:

1. testuj SSO w małej liczbie dedykowanych scenariuszy;
2. dla reszty suite używaj przygotowanego `storageState`;
3. używaj testowego dostawcy lub bypassu w środowisku testowym;
4. nie używaj prywatnych kont pracowników;
5. nie zapisuj sekretów w repozytorium.

## 10. Scenariusze negatywne auth

Pokryj nie tylko sukces:

```typescript
await page.goto('/admin');
await expect(page).toHaveURL(/\/login/);

await page.goto('/login');
await page.getByLabel('Email').fill('user@example.com');
await page.getByLabel('Hasło').fill('wrong-password');
await page.getByRole('button', { name: 'Zaloguj' }).click();
await expect(page.getByRole('alert')).toContainText(/niepoprawne/i);
```

Ważne przypadki:

- brak sesji;
- wygasła sesja;
- brak uprawnień;
- próba dostępu do cudzego zasobu;
- zablokowane konto;
- błędne hasło;
- wylogowanie i back button.

## 11. Diagnostyka auth

Przy awarii auth zbieraj:

- aktualny URL;
- screenshot;
- trace;
- cookies/storage, jeśli bezpieczne;
- status odpowiedzi login API;
- komunikaty konsoli;
- identyfikator korelacji requestu.

Nie dołączaj tokenów i cookies do publicznych raportów bez maskowania.

## 12. Antywzorce

- Logowanie przez UI w każdym teście.
- Jedno konto do wszystkich testów równoległych.
- Commitowanie plików `storageState`.
- Testy zależne od prywatnego konta pracownika.
- Brak testów negatywnych auth.
- Ręczne wkładanie tokena bez zrozumienia mechanizmu sesji.
- Brak rozdzielenia ról admin/customer/read-only.

## 13. Checklista strategii auth

- Czy logowanie przez UI jest celem testu, czy tylko setupem?
- Czy sesje są przygotowywane przez setup project?
- Czy role mają osobne storage state?
- Czy testy równoległe mają izolowane konta lub dane?
- Czy sekrety są w zmiennych środowiskowych / sekretach CI?
- Czy scenariusze negatywne auth są pokryte?
- Czy trace i raport nie ujawniają tokenów?
- Czy SSO/MFA jest testowane świadomie, a nie przypadkowo w każdej ścieżce?

## Linki

- [Authentication](https://playwright.dev/docs/auth)
- [Test projects](https://playwright.dev/docs/test-projects)
- [Fixtures](https://playwright.dev/docs/test-fixtures)
- [API testing](https://playwright.dev/docs/api-testing)
- [Browser contexts](https://playwright.dev/docs/browser-contexts)

## 📘 Suplement Inżynieryjny 2026: Mechanizmy Zaawansowane (Dialogs & Interception)
*Inspiracja: „Hands-On Automated Testing with Playwright” (2026), Chapter 11 & 12*
*   **Event-First Pattern dla Dialogów**: Playwright automatycznie odrzuca systemowe dialogi (`alert`, `confirm`). Jeśli chcesz je zatwierdzić, musisz zarejestrować subskrypcję zdarzenia *przed* wywołaniem akcji wyzwalającej: `page.once('dialog', dialog => dialog.accept())`.
*   **Intercepcja Sieciowa (`route.fallback`)**: Nowoczesne mockowanie API opiera się na elastycznych regułach przechwytywania, umożliwiających przekazywanie żądań do rzeczywistego serwera lub nadpisywanie nagłówków w locie.
