# Wzorzec Budowniczego i Fabryki Danych Testowych (Test Data Builders)

W komercyjnych testach automatycznych, scenariusze biznesowe wymagają zasilenia wieloma złożonymi strukturami danych (np. obiektami użytkowników, parametrami produktów, zamówieniami czy koszykami). Twarde kodowanie tych obiektów bezpośrednio w ciele testu wywołuje poważne konsekwencje:
*   **Ogromna powtarzalność kodu (Boilerplate)**: Każdy test musi od nowa definiować te same, rozbudowane obiekty JSON.
*   **Kruchość testów**: Jeśli deweloperzy dodadzą nowe wymagane pole do modelu bazy danych (np. pole `zipCode` w adresie), będziesz musiał edytować setki plików testowych, które tego pola nie posiadają.
*   **Brak jasności intencji**: Ciężko odczytać, który parametr w gigantycznym obiekcie JSON jest kluczowy dla danego scenariusza testowego.

Rozwiązaniem tych problemów są wzorce inżynierii danych: **Test Data Builder (Budowniczy Danych)** oraz **Fabryki Danych (Data Factories)**.

---

## 1. Wzorzec Budowniczego (Fluent Test Data Builder)

Wzorzec Budowniczego pozwala na sekwencyjne tworzenie otypowanych obiektów za pomocą czytelnego, łańcuchowego API (Fluent API). Klasa budowniczego posiada domyślne, poprawne wartości wszystkich pól, a test nadpisuje wyłącznie te parametry, które są istotne dla danego scenariusza.

Stwórzmy budowniczego danych użytkownika w TypeScript:

```typescript
// src/data/UserBuilder.ts
export interface User {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin';
  isActive: boolean;
}

export class UserBuilder {
  // Domyślne, bezpieczne wartości parametrów (Default State)
  private user: User = {
    email: 'test-user@mycommerce.pl',
    firstName: 'Jan',
    lastName: 'Kowalski',
    role: 'customer',
    isActive: true,
  };

  // Metody do dynamicznego nadpisywania poszczególnych pól
  public withEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  public withRole(role: 'customer' | 'admin'): this {
    this.user.role = role;
    return this;
  }

  public makeInactive(): this {
    this.user.isActive = false;
    return this;
  }

  /**
   * Zwraca ostatecznie zbudowany, silnie otypowany obiekt.
   */
  public build(): User {
    return this.user;
  }
}
```

Użycie Budowniczego w teście jest niesamowicie przejrzyste:
```typescript
// Tworzy nieaktywnego administratora
const inactiveAdmin = new UserBuilder()
  .withEmail('admin-block@sklep.pl')
  .withRole('admin')
  .makeInactive()
  .build();
```

---

## 2. Wzorzec Fabryki Danych (Data Factory)

Gdy dany stan danych jest powtarzalny (np. stale potrzebujesz "zablokowanego użytkownika" lub "użytkownika z niepoprawnym hasłem"), wywoływanie budowniczego w każdym teście wciąż może tworzyć zbędny szum.

**Fabryka Danych** to zbiór statycznych metod pomocniczych, które zwracają prekonfigurowane obiekty z budowniczego dla konkretnych stanów biznesowych:

```typescript
// src/data/UserFactory.ts
import { UserBuilder, User } from './UserBuilder';

export class UserFactory {
  public static createDefaultCustomer(): User {
    return new UserBuilder().build();
  }

  public static createBlockedAdmin(): User {
    return new UserBuilder()
      .withEmail('blocked-admin@sklep.pl')
      .withRole('admin')
      .makeInactive()
      .build();
  }

  public static createInvalidEmailUser(): User {
    return new UserBuilder()
      .withEmail('bad-email-format')
      .build();
  }
}
```

---

## 3. Integracja Fabryk z testami Playwright

W testach wystarczy wywołać statyczną metodę fabryki, co czyni kod krystalicznie czystym i zabezpiecza go przed jakimikolwiek przyszłymi zmianami w strukturze modelu `User`:

```typescript
import { test, expect } from '@playwright/test';
import { UserFactory } from '../src/data/UserFactory';

test('zablokowany administrator nie może wejść do panelu', async ({ page }) => {
  // 1. Arrange: Pobierz prekonfigurowane dane fabryki
  const blockedAdmin = UserFactory.createBlockedAdmin();

  await page.goto('/login');
  await page.getByLabel('E-mail').fill(blockedAdmin.email);
  // ...
});
```

---

## 4. Checklista Projektowania Danych Testowych
- [ ] Czy wyeliminowałeś surowe obiekty JSON z plików testowych na rzecz Budowniczych i Fabryk danych?
- [ ] Czy klasa `UserBuilder` posiada domyślne, bezpieczne wartości dla wszystkich wymaganych pól modelu?
- [ ] Czy metody modyfikujące właściwości budowniczego zwracają `this` w celu umożliwienia wywołań łańcuchowych (Fluent API)?
- [ ] Czy statyczne metody fabrykujące są nazwane językiem domenowym (np. `createBlockedAdmin`)?