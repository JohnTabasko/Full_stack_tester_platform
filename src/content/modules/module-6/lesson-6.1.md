# Wprowadzenie do Page Object Model (POM)

Podczas budowania dużych pakietów testowych, bezpośrednie umieszczanie selektorów technicznych (np. `page.locator('.btn-primary')`) i kroków interakcji bezpośrednio w plikach testowych szybko staje się koszmarem utrzymaniowym. Jeśli zmieni się struktura HTML (np. nazwa klasy przycisku), deweloper jest zmuszony modyfikować każdy test korzystający z tego elementu.

**Page Object Model (POM)** to najpopularniejszy wzorzec projektowy w automatyzacji testów UI, realizujący inżynieryjną zasadę **Separation of Concerns (Podziału Odpowiedzialności)**. Hermetyzuje on szczegóły techniczne interfejsu (lokatory, akcje) w czytelnych klasach, udostępniając testom wyłącznie domenowe metody biznesowe.

---

## 1. Wyzwanie: Koszt zmiany (The Maintenance Trap)

### Kod bez wzorca POM (Antywzorzec):
```typescript
test('użytkownik może złożyć zamówienie', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#user-email').fill('test@test.pl');
  await page.locator('#user-pass').fill('Secret123!');
  await page.locator('button.submit-btn').click();
  
  await page.goto('/cart');
  await page.locator('.checkout-btn').click();
  await expect(page.locator('.order-success-msg')).toBeVisible();
});
```
*   **Problem**: Jeśli zmieni się identyfikator `#user-email` na `[data-test="email"]`, a plik testowy powiela ten kod w 50 miejscach, musisz edytować 50 linii kodu.

---

## 2. Rozwiązanie: Klasa Page Object

Wzorce POM w Playwright implementujemy jako klasy TypeScript, przekazując instancję `Page` jako parametr konstruktora (wstrzykiwanie zależności – DIP):

```typescript
import { Page, Locator, test } from '@playwright/test';

export class LoginPage {
  private readonly page: Page;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Lokatory są zadeklarowane w jednym, centralnym miejscu
    this.emailInput = this.page.locator('#user-email');
    this.passwordInput = this.page.locator('#user-pass');
    this.submitButton = this.page.locator('button.submit-btn');
  }

  // Metody publiczne udostępniają wyłącznie akcje biznesowe (język domeny)
  async navigate() {
    await this.page.goto('/login');
  }

  async login(email: string, pass: string) {
    await test.step(`Logowanie jako ${email}`, async () => {
      await this.emailInput.fill(email);
      await this.passwordInput.fill(pass);
      await this.submitButton.click();
    });
  }
}
```

---

## 3. Korzyści ze stosowania POM
1.  **Scentralizowane zarządzanie**: Zmiana lokatora w klasie strony natychmiast aktualizuje wszystkie powiązane testy.
2.  **Czytelność scenariuszy**: Pliki testowe stają się krystalicznie czyste i opisują wyłącznie scenariusz biznesowy.
3.  **Łatwość wdrożenia (Niski próg wejścia)**: Nowy tester w zespole pisze testy korzystając z gotowych klocków (metod POM), bez konieczności badania kodu HTML aplikacji.

---

## 4. Checklista Podstaw POM
- [ ] Czy lokatory techniczne są zadeklarowane jako pola prywatne klasy (enkapsulacja)?
- [ ] Czy metody publiczne klasy POM są nazwane językiem biznesowym, a nie technicznym?
- [ ] Czy instancja `Page` jest przekazywana do klasy przez konstruktor?