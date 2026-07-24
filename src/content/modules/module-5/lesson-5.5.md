# Organizacja pakietu testowego, tagowanie i adnotacje (Annotations)

W miarę rozwoju projektu testowego, liczba plików specyfikacji rośnie do kilkudziesięciu lub kilkuset. Utrzymanie porządku w tak dużej bazie kodu wymaga precyzyjnych narzędzi do grupowania scenariuszy, kategoryzowania testów (np. podział na szybkie testy dymne i pełną regresję) oraz elastycznego sterowania zachowaniem runnera (np. pomijanie znanych błędów).

Playwright Test udostępnia bogaty zestaw narzędzi poziomu kodu: bloki `test.describe()`, dynamiczne **tagowanie** oraz wbudowane **adnotacje (Annotations)**.

---

## 1. Grupowanie i konfiguracja Suite (`test.describe`)

Blok `test.describe` służy do logicznego grupowania powiązanych testów (np. według modułów aplikacji). Pozwala również na lokalne nadpisywanie zachowań konfiguracyjnych (np. wymuszenie uruchomienia testów z tego bloku w trybie sekwencyjnym lub równoległym):

```typescript
import { test, expect } from '@playwright/test';

// Konfigurujemy grupę tak, aby jej testy wykonywały się w trybie sekwencyjnym (np. testujemy jeden długi proces)
test.describe.configure({ mode: 'serial' });

test.describe('Proces składania zamówienia', () => {
  test('krok 1: dodanie do koszyka', async ({ page }) => { /* ... */ });
  test('krok 2: płatność', async ({ page }) => { /* ... */ });
});
```

---

## 2. Dynamiczne tagowanie testów (Tags)

W Playwright tagi deklarujemy bezpośrednio w nazwie testu lub grupy `describe` za pomocą znaku `@` (np. `@smoke`, `@regression`, `@slow`):

```typescript
test('szybka weryfikacja logowania @smoke @critical', async ({ page }) => {
  await page.goto('/login');
  // ... szybki test dymny
});
```

Dzięki temu możemy w łatwy sposób uruchamiać węższe podzbiory testów w rurociągach CI (np. w rurociągu PR chcemy uruchomić tylko szybkie testy `@smoke`):

```bash
# Uruchom wyłącznie testy posiadające tag @smoke
npx playwright test --grep "@smoke"

# Uruchom wszystkie testy OPRÓCZ tych, które posiadają tag @slow
npx playwright test --grep-invert "@slow"
```

---

## 3. Zarządzanie cyklem życia za pomocą Adnotacji (Annotations)

Adnotacje pozwalają na dynamiczne i rygorystyczne sterowanie zachowaniem silnika Playwright Test w zależności od warunków lub znanych błędów na produkcji.

Najważniejsze adnotacje wbudowane:

### A. `test.skip()`
Całkowicie ignoruje i pomija dany test. Można go użyć warunkowo:
```typescript
test('test logowania przez SSO', async ({ page }, testInfo) => {
  // Pomiń test na przeglądarce WebKit (Safari), ponieważ SSO tam nie działa
  test.skip(testInfo.project.name === 'webkit', 'SSO nie jest wspierane na silniku WebKit');
  
  await page.goto('/login-sso');
});
```

### B. `test.fixme()`
Oznacza test jako uszkodzony (np. z powodu znanego błędu w aplikacji, który czeka na poprawkę). Test zostanie oznaczony jako pominięty, co informuje zespół o konieczności naprawy.
```typescript
test('generowanie raportu finansowego', async ({ page }) => {
  test.fixme(true, 'Zgłoszenie błędu: https://github.com/org/repo/issues/1203');
  
  await page.goto('/reports');
});
```

### C. `test.fail()`
Deklaruje, że test **powinien się wywalić**. Jest to niezwykle przydatne, gdy chcemy napisać test zabezpieczający (asserting a bug), potwierdzający istnienie błędu, zanim programiści go naprawią. Jeśli test nieoczekiwanie przejdzie pomyślnie, Playwright oznaczy go jako błąd!

---

## 4. Checklista Organizacji Pakietu Testowego
- [ ] Czy grupujesz logicznie powiązane testy w bloki `test.describe`?
- [ ] Czy stosujesz przejrzysty system tagowania (`@smoke`, `@regression`) w celu selekcji testów w CI/CD?
- [ ] Czy zamiast zakomentowywać kod testu, stosujesz adnotacje `test.skip()` lub `test.fixme()` wraz z podaniem linku do Jira/GitHub?
- [ ] Czy do testowania znanych błędów, które czekają na poprawkę frontendową, wykorzystujesz adnotację `test.fail()`?