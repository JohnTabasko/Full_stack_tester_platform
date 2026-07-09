# Fikstury (Fixtures) — Wstrzykiwanie Zależności

Większość narzędzi do testowania (jak Cypress czy Selenium) polega na hookach `beforeEach`. Playwright wprowadza potężniejszy mechanizm: **Fixtures**. Jako Full Stack Tester musisz umieć tworzyć własne fikstury, aby Twój kod był czysty i łatwy w utrzymaniu.

## 1. Czym jest Fikstura?

Fikstura to zasób (np. strona, klient bazy danych, zalogowany użytkownik), który jest przygotowywany przed testem i sprzątany po nim. Test "zamawia" fiksturę przekazując ją w argumentach:
```typescript
test('mój test', async ({ page, request }) => { ... });
```

## 2. Tworzenie własnej fikstury (Masterclass)

Wyobraź sobie, że każdy test w Twoim module wymaga zalogowanego użytkownika. Zamiast pisać `login()` w każdym teście, stwórz fiksturę `authenticatedPage`.

```typescript
// fixtures/auth-fixture.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // 1. Setup: Zaloguj użytkownika
    await page.goto('/login');
    await page.fill('#user', 'admin');
    await page.fill('#pass', 'secret');
    await page.click('#submit');
    
    // 2. Oddaj sterowanie do testu
    await use(page);
    
    // 3. Teardown: Kod po zakończeniu testu (opcjonalnie)
    await page.context().clearCookies();
  },
});
```

Teraz w teście używasz jej tak:
```typescript
import { test } from './fixtures/auth-fixture';

test('zmień ustawienia profilu', async ({ authenticatedPage }) => {
  // Ten test zaczyna się już jako zalogowany admin!
  await authenticatedPage.goto('/settings');
});
```

## 3. Worker Scope vs. Test Scope

- **Test Scope (domyślny)**: Fikstura tworzona i niszczona dla każdego pojedynczego `test()`. Gwarantuje pełną izolację.
- **Worker Scope**: Fikstura tworzona raz dla całego procesu (workera). Idealna dla ciężkich zadań, jak np. uruchomienie kontenera z bazą danych lub pobranie 100MB danych testowych.

## 4. Zalety nad beforeEach
1. **Leniwe ładowanie**: Jeśli test nie używa fikstury, Playwright jej nie uruchomi (oszczędność czasu).
2. **Modularność**: Możesz łączyć wiele fikstur z różnych plików.
3. **Automatyczne sprzątanie**: Kod po `use()` wykona się zawsze, nawet jeśli test padnie.

## Perspektywa Ekspercka
W dużych projektach komercyjnych nie używamy standardowego `test` z `@playwright/test`. Zamiast tego tworzymy własny plik `base-test.ts`, który zawiera wszystkie Page Objekty i narzędzia jako fikstury. Dzięki temu testy są czystą poezją biznesową, pozbawioną technicznego szumu.

## Linki
- [Playwright Fixtures Guide](https://playwright.dev/docs/test-fixtures)
