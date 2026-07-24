# Dynamiczne generowanie danych testowych i unikalność sesji

Podczas wykonywania testów automatycznych w trybie wysoce współbieżnym (`fullyParallel: true`), stosowanie statycznych danych testowych (np. rejestrowanie użytkownika o stałym e-mailu `jan.kowalski@wp.pl` w każdym teście) natychmiast prowadzi do **konfliktów i kolizji danych**. Pierwszy wątek pomyślnie zarejestruje użytkownika, a pozostałe wątki zakończą się niepowodzeniem z informacją: `Ten e-mail jest już zajęty`.

Profesjonalna inżynieria danych testowych wymaga **dynamicznego i unikalnego generowania danych wejściowych per test**. Najpopularniejszym narzędziem realizującym to zadanie w ekosystemie Node.js/TypeScript jest biblioteka **Faker**.

---

## 1. Integracja i możliwości biblioteki Faker

Biblioteka `@faker-js/faker` dostarcza olbrzymi zbiór generatorów (lokalizowanych dla setek języków i regionów, w tym dla Polski), które pozwalają na generowanie realistycznie wyglądających danych: imion, adresów e-mail, haseł, losowych numerów telefonów, adresów ustrukturyzowanych, danych bankowych oraz opisów tekstowych.

### A. Przykładowe generatory:
```typescript
import { fakerPL as faker } from '@faker-js/faker';

// Generowanie unikalnego adresu e-mail
const email = faker.internet.email(); // np. 'Janusz_Kowalski12@gmail.com'

// Generowanie losowego imienia i nazwiska zgodnego z polską lokalizacją
const name = faker.person.fullName(); // np. 'Mariusz Malewski'

// Generowanie numeru telefonu komórkowego
const phone = faker.phone.number(); // np. '+48 501 234 567'
```

---

## 2. Dynamiczny Budowniczy Danych (Faker + Test Data Builder)

Najlepszą i bezkompromisową praktyką projektową jest połączenie biblioteki Faker z naszym wzorcem **Test Data Buildera**. Dzięki temu budowniczy przy każdym wywołaniu automatycznie wygeneruje w 100% unikalny, losowy, ale realistyczny zestaw danych:

```typescript
// src/data/DynamicUserBuilder.ts
import { fakerPL as faker } from '@faker-js/faker';
import { User } from './UserBuilder';

export class DynamicUserBuilder {
  private user: User;

  constructor() {
    this.user = {
      // Przy każdym nowym obiekcie generuj unikalne dane wejściowe!
      email: faker.internet.email({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        provider: 'commerce-tests.pl'
      }),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: 'customer',
      isActive: true,
    };
  }

  public withCustomEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  public build(): User {
    return this.user;
  }
}
```

Użycie w teście gwarantuje brak jakichkolwiek konfliktów przy równoległym wykonaniu:
```typescript
test('nowy klient może pomyślnie założyć konto', async ({ page }) => {
  // Dane są dynamiczne i unikalne dla tego konkretnego wątku roboczego!
  const randomUser = new DynamicUserBuilder().build();

  await page.goto('/register');
  await page.getByLabel('Imię').fill(randomUser.firstName);
  await page.getByLabel('Nazwisko').fill(randomUser.lastName);
  await page.getByLabel('E-mail').fill(randomUser.email);
  // ...
});
```

---

## 3. Przeciwdziałanie Niestabilności i Powtarzalność (Reproducibility)

Jednym z zagrożeń związanych z dynamicznym generowaniem danych jest **trudność w reprodukcji błędów**. Co jeśli Faker wygeneruje specyficzny, rzadki znak specjalny w nazwisku, który wywoła błąd bazy danych, a po ponownym uruchomieniu testu dane się zmienią i test przejdzie pomyślnie?

### Praktyka 1: Logowanie wygenerowanych danych
Zawsze loguj wygenerowane dane testowe na początku testu lub w raportach, aby w razie awarii można było odczytać parametry wejściowe:
```typescript
test('rejestracja klienta', async ({ page }, testInfo) => {
  const user = new DynamicUserBuilder().build();
  
  // Zapisz wygenerowane dane w adnotacjach testu w raporcie HTML!
  testInfo.annotations.push({
    type: 'generated-data',
    description: `Email: ${user.email}, Name: ${user.firstName} ${user.lastName}`
  });
  
  // ...
});
```

### Praktyka 2: Seedowanie generatora (Faker Seed)
Możesz ustawić stały punkt startowy (seed) dla generatora losowości na maszynach CI, co sprawi, że Faker przy każdym kolejnym uruchomieniu wygeneruje identyczną sekwencję losowych wartości:
```typescript
import { faker } from '@faker-js/faker';

// Ustawienie stałego ziarna losowości
faker.seed(12345);
```

---

## 4. Zasady Prywatności Danych i RODO (GDPR Compliance)

**Nigdy nie używaj rzeczywistych danych produkcyjnych prawdziwych użytkowników w testach automatycznych!** Jest to bezpośrednie złamanie przepisów o ochronie danych osobowych (RODO). 
Używanie syntetycznych bibliotek generujących dynamiczne, fikcyjne dane (jak Faker) to jedyny prawnie i inżynieryjnie dopuszczalny standard w automatyzacji QA.

---

## 5. Checklista Dynamicznego Generowania Danych
- [ ] Czy zintegrowałeś bibliotekę Faker z projektem w celu wyeliminowania konfliktów danych przy testach współbieżnych?
- [ ] Czy połączyłeś Faker z wzorcem Test Data Buildera w celu zautomatyzowania unikalności obiektów?
- [ ] Czy logujesz wygenerowane dynamicznie dane w adnotacjach testowych (`testInfo.annotations`) w celu ułatwienia późniejszego debugowania?
- [ ] Czy upewniłeś się, że w kodzie testów nie ma żadnych rzeczywistych danych osobowych prawdziwych użytkowników (zgodność z RODO)?