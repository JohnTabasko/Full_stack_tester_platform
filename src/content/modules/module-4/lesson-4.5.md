# Globalne uwierzytelnianie i wielorolowość w testach (Authentication)

W systemach komercyjnych większość testów wymaga zalogowanego użytkownika. Powtarzanie tradycyjnego logowania przez interfejs graficzny (UI) – wpisywanie e-maila, hasła i klikanie przycisku – na początku każdego z 200 testów to potężna strata czasu (logowanie przez UI trwa średnio 2-5 sekund, co przy 200 testach daje ponad **10 minut marnowanych na sam proces uwierzytelniania**).

Playwright Test rozwiązuje ten problem systemowo, udostępniając zaawansowany mechanizm **zapisu i ponownego użycia stanu sesji (Storage State)**. W tej lekcji nauczysz się, jak zaimplementować jednokrotne logowanie oraz symulować zaawansowane scenariusze wielorolowe (Multi-Role Authentication).

---

## 1. Koncepcja zapisu stanu sesji (`storageState`)

Po poprawnym zalogowaniu się użytkownika, przeglądarka zapisuje dane sesji w postaci plików cookie (cookies) oraz pamięci lokalnej (`localStorage`/`sessionStorage`). 

Playwright potrafi wyeksportować cały ten stan do lekkiego pliku JSON na dysku, a następnie automatycznie wstrzyknąć go do nowo powoływanych kontekstów przeglądarki na samym starcie testu. Dzięki temu każdy kolejny test uruchamia się jako **już zalogowany użytkownik** w ułamku milisekund!

```
+-------------------------------------------------------------+
|    TEST SETUP: Wykonaj logowanie przez UI i zapisz sesję    |
|               do pliku .auth/user.json                      |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|    TESTY FUNKCJONALNE: Automatycznie wczytują user.json     |
|               na starcie kontekstu (błyskawiczny start)      |
+-------------------------------------------------------------+
```

---

## 2. Implementacja krok po kroku: Setup Project

Najbardziej eleganckim i bezpiecznym sposobem automatyzacji tego procesu jest wydzielenie logowania do osobnego **projektu przygotowawczego (Setup Project)** w pliku `playwright.config.ts`.

### Krok A: Konfiguracja projektów w `playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    // 1. Definiujemy dedykowany projekt przygotowawczy (Setup)
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },
    // 2. Standardowy projekt testowy, który ZALEŻY od projektu setup
    {
      name: 'chromium',
      dependencies: ['setup'], // Wymuś wykonanie projektu setup najpierw!
      use: {
        ...devices['Desktop Chrome'],
        // Automatycznie wstrzykuj zapisany stan sesji do każdego testu
        storageState: '.auth/user.json',
      },
    },
  ],
});
```

### Krok B: Kod pliku przygotowawczego (`tests/global.setup.ts`)
```typescript
import { test as setup } from '@playwright/test';

setup('logowanie globalne użytkownika', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('user@example.com');
  await page.getByLabel('Hasło').fill('SecretPassword123!');
  await page.getByRole('button', { name: 'Zaloguj' }).click();

  // Poczekaj, aż strona załaduje panel użytkownika (potwierdzenie zalogowania)
  await page.waitForURL('/dashboard');

  // Zapisz cookies i localStorage do pliku JSON
  await page.context().storageState({ path: '.auth/user.json' });
});
```

---

## 3. Scenariusze wielorolowe w jednym projekcie (Multi-Role Support)

Jeśli Twoja aplikacja posiada różne uprawnienia (np. `Admin`, `Editor`, `Customer`), możesz skonfigurować globalny setup tak, aby logował się na trzy różne konta i zapisywał odpowiednio pliki `.auth/admin.json`, `.auth/editor.json` oraz `.auth/customer.json`.

Następnie w konkretnym pliku testowym możesz nadpisać domyślny stan sesji za pomocą bloku `test.use()`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Panel Administratora', () => {
  // Nadpisz domyślny stan sesji dla wszystkich testów w tym bloku
  test.use({ storageState: '.auth/admin.json' });

  test('admin widzi opcje usuwania użytkowników', async ({ page }) => {
    await page.goto('/users-list');
    await expect(page.getByRole('button', { name: 'Usuń użytkownika' })).toBeVisible();
  });
});
```

---

## 4. Checklista Strategii Uwierzytelniania
- [ ] Czy wydzieliłeś proces logowania do dedykowanego projektu typu `setup` w konfiguracji?
- [ ] Czy dodałeś folder `.auth/` do pliku `.gitignore`, aby zapobiec wyciekowi wrażliwych ciasteczek sesyjnych do Git?
- [ ] Czy poprawnie nadpisujesz stany sesji (`storageState`) dla różnych ról użytkowników za pomocą bloku `test.use()`?
- [ ] Czy upewniłeś się, że testy przygotowawcze (setup) czekają na pełne załadowanie strony (np. `waitForURL`) przed wywołaniem zapisu stanu?