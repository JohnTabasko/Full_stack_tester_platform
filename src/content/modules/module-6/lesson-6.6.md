# Integracja Page Object Model z systemem Fixture-ów

Mimo wdrożenia wzorców POM i kompozycji, w Twoich testach wciąż może pojawiać się powtarzalny i mało czytelny kod inicjalizacji zależności:

```typescript
test('użytkownik widzi koszyk', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const cartPage = new CartPage(page);

  await loginPage.navigate();
  await loginPage.login('user@test.pl', 'pass');
  await cartPage.navigate();
  // ...
});
```

Ręczne tworzenie instancji `new LoginPage(page)` na początku każdego testu tworzy **silne sprzężenie** (tight coupling) i zmusza testerów do marnowania czasu na składanie zależności.

Najwyższym standardem inżynierii testów w Playwright, opisanym w książce *"Practical Playwright Test" (2026)*, jest **całkowite ukrycie procesu powoływania instancji klas stron wewnątrz niestandardowych fixture-ów**.

---

## 1. Wyższość Fixtur POM nad manualną instancjacją

Integrując POM z systemem fixture-ów, zyskujesz niezwykłe korzyści:
1.  **Leniwe ładowanie (Lazy Loading)**: Klasa strony zostanie utworzona przez Playwright wyłącznie wtedy, gdy dany test zażąda jej w swojej sygnaturze (np. `async ({ cartPage }) => { ... }`).
2.  **Czystość scenariuszy**: Testy nie zawierają ani jednej komendy inicjalizacji `new` – po prostu deklarują wymagane strony i od razu przystępują do akcji biznesowych.
3.  **Wygodne zarządzanie cyklem życia**: Możemy wewnątrz fixture-a zapisać logikę sprzątania (teardown), która wykona się automatycznie po zakończeniu testu.

---

## 2. Implementacja krok po kroku: Custom Test Runner

Tworzymy dedykowany plik runnera testów (np. `customTest.ts`), który rozszerza bazowy runner Playwright o instancje naszych klas POM:

```typescript
// src/utils/customTest.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CartPage } from '../pages/CartPage';

// 1. Definiujemy otypowanie dla naszych fixtur stron
type MyPageFixtures = {
  loginPage: LoginPage;
  cartPage: CartPage;
};

// 2. Rozszerzamy obiekt test o nasze otypowane fixtury
export const test = base.extend<MyPageFixtures>({
  
  loginPage: async ({ page }, use) => {
    // Powołaj instancję strony LoginPage
    const loginPage = new LoginPage(page);
    // Przekaż gotową instancję do testu
    await use(loginPage);
  },

  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await use(cartPage);
  },

});

export { expect } from '@playwright/test';
```

---

## 3. Użycie otypowanych Fixtur w testach

Teraz w plikach testowych nie importujemy już surowego obiektu `test` z `@playwright/test`, lecz nasz rozszerzony test z pliku `customTest.ts`:

```typescript
import { test, expect } from '../src/utils/customTest'; // Import naszego custom runnera

test('dodanie produktu do koszyka i weryfikacja sumy', async ({ loginPage, cartPage }) => {
  // Brak ręcznego wywoływania "new LoginPage(page)"! Instancje są wstrzykiwane automatycznie!
  
  await loginPage.navigate();
  await loginPage.login('user@test.pl', 'pass');
  
  await cartPage.navigate();
  await expect(cartPage.totalAmount).toHaveText('150.00 PLN');
});
```

---

## 4. Checklista Integracji POM z Fixturami
- [ ] Czy całkowicie wyeliminowałeś bezpośrednie wywoływanie `new SomePage(page)` z wnętrza plików testowych?
- [ ] Czy stworzyłeś dedykowany plik `customTest.ts` rozszerzający bazowy `test` o otypowane fixtury stron?
- [ ] Czy pliki testowe importują rozszerzony obiekt `test` z Twojego lokalnego katalogu pomocniczego?