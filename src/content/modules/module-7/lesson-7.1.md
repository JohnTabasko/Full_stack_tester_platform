# Zarządzanie danymi testowymi — Zero Flakiness Strategy

> **Perspektywa Full Stack Testera**
> Dane testowe to najcichsza, najczęściej ignorowana, a zarazem najważniejsza przyczyna niestabilności testów w CI. Gdy test "losowo" pada trzeci raz na dziesięć — prawie zawsze winowajcą jest dane testowe. Albo test korzysta z danych stworzonych przez inny test, albo test zakłada, że "użytkownik Jan Kowalski istnieje w bazie", albo test pisze do tabeli, którą modyfikuje inny test równolegle. Jako Full Stack Tester musisz opanować strategię zarządzania danymi na poziomie eksperckim — od generowania unikalnych danych, przez izolację środowisk, po automatyczny cleanup.

## Cel lekcji

Po ukończeniu tej lekcji rozumiesz fundamentalne problemy z danymi testowymi w automatyzacji, potrafisz generować dynamiczne dane testowe z Faker.js, znasz strategię setup-through-API jako najszybszą metodę przygotowania danych, rozumiesz koncepcję database seeding i atomic state, potrafisz implementować izolację przez prefiksy i cleanup, oraz wiesz, jak budować bezstanowe (stateless) środowiska testowe.

---

## Problem: Dlaczego dane testowe psują testy

### Zjawisko "Dirty Environment"

Wyobraź sobie scenariusz: masz 50 testów, które logują się jako użytkownik `admin@example.pl`. Testy uruchamiane są równolegle (4 workery). Worker 1 i Worker 2 próbują jednocześnie zmienić hasło temu samu użytkownikowi. Worker 1 zmienia hasło na `Password123!`. Worker 2 zmienia hasło na `NewPass456@`. Kto wygrywa? Zależy od timingu. Test, który skończy się pierwszy, przejdzie. Test, który skończy się drugi, padnie z błędem "nieprawidłowe hasło" — mimo że wszystko jest technicznie "poprawne".

To jest klasyczny problem **shared mutable state** — współdzielone dane, które są modyfikowane przez wiele testów jednocześnie.

### Typowe scenariusze awarii

| Scenariusz | Objaw | Przyczyna |
|---|---|---|
| Test pada tylko na CI | Lokalnie test przechodzi, w CI pada | Inny test na CI zostawił dane w określonym stanie |
| Test pada przy drugim uruchomieniu | Pierwszy pass, drugi fail | Pierwszy test stworzył unikalny zasób (np. email), drugi test próbuje stworzyć ten sam email |
| Test pada "losowo" raz na 10 | Niestabilność | Dwa testy równoległe modyfikują ten sam rekord |
| Test pada "po godzinach" | Nocna regresja | Zadanie cronowe zmienia dane testowe w nocy |
| Test pada po deployu | Po wydaniu | Migracja bazy zmienia strukturę danych |

### Anatomia problemu

```
Test A (Worker 1)          Test B (Worker 2)          Test C (Worker 1)
─────────────────          ─────────────────          ─────────────────
1. Login jako admin   →    1. Login jako admin   →    1. Login jako admin
2. Utwórz produkt "X" →    2. Edytuj produkt "X" →    3. Usuń produkt "X"
4. Zweryfikuj         →    5. Zweryfikuj         →    (produkt nie istnieje!)
```

Problem: wszystkie testy używają TEGO SAMEGO produktu `produkt X`. Gdy Test C usunie produkt X, Test B (który jeszcze nie zdążył zweryfikować) pada.

---

## Strategia 1: Generowanie dynamiczne z Faker.js

### Dlaczego statyczne dane są problemem

```typescript
// ❌ Statyczne dane — problem z unikalnością
const user = {
  email: 'jan.kowalski@example.pl',  // Zawsze ten sam email
  firstName: 'Jan',
  lastName: 'Kowalski',
};

// Gdy test A i test B uruchomią się równolegle:
// Test A: POST /api/users → 201 Created (email: jan.kowalski@example.pl)
// Test B: POST /api/users → 409 Conflict (email już istnieje!)
```

### Faker.js — generowanie unikalnych danych

`@faker-js/faker` to biblioteka generująca realistyczne, unikalne dane testowe:

```typescript
import { faker } from '@faker-js/faker';

test('rejestracja nowego użytkownika', async ({ page }) => {
  // Generuj unikalne dane za każdym razem
  const userData = {
    firstName: faker.person.firstName(),           // "Anna"
    lastName: faker.person.lastName(),             // "Nowak"
    email: faker.internet.email(),                 // "anna.nowak@example.com"
    phone: faker.phone.number(),                   // "+48 123 456 789"
    company: faker.company.name(),                 // "Przedsiębiorstwo XYZ"
  };

  await page.goto('/register');
  await page.getByLabel('Imię').fill(userData.firstName);
  await page.getByLabel('Nazwisko').fill(userData.lastName);
  await page.getByLabel('Email').fill(userData.email);
  
  // Każde uruchomienie testu = nowy email = brak konfliktu unikalności
});
```

### Generowanie zaawansowanych danych

```typescript
import { faker, da, pl } from '@faker-js/faker';

// Lokalizacja na polski (ważne dla danych osobowych!)
const polishFaker = faker as unknown as {
  person: {
    firstName: () => string;
    lastName: () => string;
  };
  internet: {
    email: (firstName: string, lastName: string) => string;
  };
  address: {
    city: () => string;
    streetName: () => string;
    buildingNumber: () => string;
  };
};

// Złożone struktury danych
const orderData = {
  id: `ORD-${faker.string.alphanumeric(8).toUpperCase()}`,
  customer: {
    name: faker.person.firstName(),
    surname: faker.person.lastName(),
    email: faker.internet.email(),
    // Tematyczny email, np. test-ORD-ABC12345@przykład.pl
    testEmail: `test-${faker.string.alphanumeric(8)}@test.pl`,
  },
  items: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
    product: faker.commerce.productName(),
    quantity: faker.number.int({ min: 1, max: 10 }),
    price: parseFloat(faker.commerce.price()),
  })),
  shipping: {
    street: faker.location.street(),
    city: faker.location.city(),
    postalCode: faker.location.zipCode(), // "12-345"
  },
  payment: {
    method: faker.helpers.arrayElement(['card', 'transfer', 'blik']),
    amount: parseFloat(faker.commerce.price()),
  },
};
```

### Strategia unikalnych identyfikatorów

```typescript
// Prefiksowanie danych testowych — łatwa identyfikacja i cleanup
const testId = `QA_${Date.now()}_${faker.string.alphanumeric(6).toUpperCase()}`;

// Użytkownik testowy
const testUser = {
  email: `test.${testId}@test.pl`,
  name: `Test User ${testId}`,
  company: `QA_TEST_COMPANY_${testId}`,
};

// Zamówienie testowe
const testOrder = {
  id: `QA_ORD_${testId}`,
  reference: `QA_REF_${testId}`,
};

// Produkt testowy
const testProduct = {
  sku: `QA_SKU_${testId}`,
  name: `QA Product ${testId}`,
};

// Zalety prefiksu QA_:
// 1. Łatwo odróżnić dane testowe od produkcyjnych
// 2. Można napisać skrypt cleanup: DELETE FROM users WHERE email LIKE 'QA_%'
// 3. Łatwo wyszukać w bazie danych: SELECT * FROM orders WHERE reference LIKE 'QA_%'
```

---

## Strategia 2: Setup przez API (najszybsza metoda)

### Filozofia: UI do testowania UI, API do przygotowania danych

Gdy testujesz funkcjonalność koszyka zakupowego, NIE musisz:
1. Kliknąć "Zarejestruj się".
2. Wypełnić formularz rejestracji.
3. Kliknąć "Potwierdź email" (pod warunkiem, że masz testowy SMTP).
4. Kliknąć link aktywacyjny.
5. Dopiero teraz: dodać produkt do koszyka.

Możesz zrobić to samo w 50ms przez API:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Koszyk zakupowy', () => {
  
  // Setup przez API — błyskawiczny, deterministyczny
  test.beforeEach(async ({ request }) => {
    // Tworzę użytkownika przez API
    const user = await request.post('/api/users', {
      data: {
        email: `test.${Date.now()}@test.pl`,
        password: 'TestPassword123!',
        firstName: 'Jan',
        lastName: 'Kowalski',
      },
    });
    const userData = await user.json();
    
    // Loguję się przez API i pobieram token
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: userData.email,
        password: 'TestPassword123!',
      },
    });
    const { token } = await loginResponse.json();
    
    // Tworzę zamówienie przez API
    const order = await request.post('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        status: 'pending',
        items: [
          { productId: 'PROD_001', quantity: 2 },
        ],
      },
    });
    
    // UWAGA: Te dane muszą być przekazane do testu przez storageState
    // lub przez custom fixture
  });
  
  test('zalogowany użytkownik widzi swoje zamówienia', async ({ page }) => {
    // Idź bezpośrednio na stronę zamówień — nie przechodź przez logowanie UI
    await page.goto('/my-orders');
    await expect(page.getByText('Zamówienie')).toBeVisible();
  });
});
```

### Setup Through API z storageState — izolacja sesji

`storageState` pozwala na zapisanie stanu autoryzacji (cookies, localStorage) do pliku JSON i wczytanie go w następnym teście — bez konieczności logowania przez UI:

```typescript
import { test, expect } from '@playwright/test';
import type { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Raz na początku całej sesji: stwórz użytkownika i zapisz jego stan autoryzacji
  const { baseURL } = config.projects[0].use;
  
  const requestContext = await request.newContext();
  const response = await requestContext.post(`${baseURL}/api/auth/login`, {
    data: { email: 'admin@test.pl', password: 'admin123' },
  });
  await requestContext.storageState({ path: './storageState.json' });
  await requestContext.dispose();
}

// Wpisz globalSetup w playwright.config.ts:
// import { globalSetup } from './global-setup';
// setup: globalSetup,

test('panel admina — użytkownik musi być zalogowany', async ({ page }) => {
  // page ma już cookies zalogowanego użytkownika
  // Nie trzeba logować się przez UI!
  await page.goto('/admin');
  await expect(page.getByText('Panel Administratora')).toBeVisible();
});
```

### Kompleksowy setup fixture z API

```typescript
import { test as base } from '@playwright/test';
import { faker } from '@faker-js/faker';

type TestUser = {
  id: string;
  email: string;
  password: string;
  token: string;
};

// Tworzenie custom fixture do setupu danych
export const testWithData = base.extend<{
  testUser: TestUser;
  testProduct: { id: string; sku: string; name: string };
}>({
  testUser: async ({ request }, use) => {
    // Setup: stwórz użytkownika przez API
    const email = `test.${faker.string.alphanumeric(8)}@test.pl`;
    const response = await request.post('/api/users', {
      data: {
        email,
        password: 'TestPassword123!',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      },
    });
    const user = await response.json();
    
    // Pobierz token autoryzacji
    const loginResponse = await request.post('/api/auth/login', {
      data: { email, password: 'TestPassword123!' },
    });
    const { token } = await loginResponse.json();
    
    const testUser: TestUser = {
      id: user.id,
      email,
      password: 'TestPassword123!',
      token,
    };
    
    await use(testUser);
    
    // Teardown: usuń użytkownika
    await request.delete(`/api/users/${testUser.id}`, {
      headers: { Authorization: `Bearer ${testUser.token}` },
    });
  },
  
  testProduct: async ({ request }, use) => {
    // Stwórz produkt testowy przez API
    const product = await request.post('/api/products', {
      data: {
        sku: `QA_${faker.string.alphanumeric(8)}`,
        name: `Test Product ${faker.string.alphanumeric(4)}`,
        price: 99.99,
        stock: 100,
      },
    });
    const productData = await product.json();
    
    await use(productData);
    
    // Cleanup
    await request.delete(`/api/products/${productData.id}`);
  },
});

// Teraz każdy test może używać: testWithData.testUser i testWithData.testProduct
testWithData('użytkownik dodaje produkt do koszyka', async ({ page, testUser, testProduct }) => {
  // testUser zawiera zalogowanego użytkownika (przez API)
  // testProduct zawiera gotowy produkt (przez API)
  
  // Dodaj produkt do koszyka przez UI
  await page.goto(`/product/${testProduct.id}`);
  await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  
  await expect(page.getByText(`Produkt dodany`)).toBeVisible();
});
```

---

## Strategia 3: Database Seeding (Atomic State)

### Kiedy API nie wystarczy

Czasem API nie daje wystarczającej kontroli (np. chcesz stworzyć bardzo specyficzny stan bazy — setki powiązanych rekordów). Wtedy możesz wstrzykiwać dane bezpośrednio do bazy.

### Prisma jako narzędzie do seedingu

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function seedTestDatabase() {
  console.log('Seeding bazy testowej...');
  
  // Wyczyść istniejące dane testowe
  await prisma.order.deleteMany({ where: { reference: { startsWith: 'QA_' } } });
  await prisma.user.deleteMany({ where: { email: { contains: '@test.pl' } } });
  
  // Stwórz deterministyczny stan bazy
  const testUser = await prisma.user.create({
    data: {
      email: 'seed@test.pl',
      passwordHash: 'hashedPassword', // Nie używaj plaintextu w prawdziwym kodzie!
      firstName: 'Seed',
      lastName: 'User',
      role: 'CUSTOMER',
      // Oznacz jako dane testowe
      metadata: JSON.stringify({ source: 'seed', createdAt: new Date().toISOString() }),
    },
  });
  
  const orders = await Promise.all(
    Array.from({ length: 10 }, () =>
      prisma.order.create({
        data: {
          reference: `QA_SEED_${faker.string.alphanumeric(6).toUpperCase()}`,
          userId: testUser.id,
          status: faker.helpers.arrayElement(['PENDING', 'PAID', 'SHIPPED']),
          total: parseFloat(faker.commerce.price()),
          items: {
            create: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
              productName: faker.commerce.productName(),
              quantity: faker.number.int({ min: 1, max: 5 }),
              unitPrice: parseFloat(faker.commerce.price()),
            })),
          },
        },
      })
    )
  );
  
  console.log(`Stworzono ${orders.length} zamówień testowych`);
  return { testUser, orders };
}

// Uruchom: npx ts-node prisma/seed.ts
```

### Seed w Playwright (beforeAll na poziomie projektu)

```typescript
// global-setup.ts
import { test as base, type FullConfig } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function globalSetup(_config: FullConfig) {
  // Seeding raz na początku całej sesji testowej
  // (nie przed każdym testem — to by było zbyt wolne)
  
  const testEmail = `seed.${Date.now()}@test.pl`;
  
  await prisma.user.create({
    data: {
      email: testEmail,
      password: 'TestPassword123!',
      firstName: 'Seed',
      lastName: 'User',
    },
  });
  
  // Zapisz email do pliku — fixture odczyta go później
  fs.writeFileSync('.test-seed.json', JSON.stringify({ testEmail }));
}

export async function globalTeardown() {
  // Cleanup po zakończeniu całej sesji testowej
  // Usuń wszystkie dane testowe z prefiksem QA_
  await prisma.user.deleteMany({
    where: { email: { contains: '@test.pl' } },
  });
  await prisma.order.deleteMany({
    where: { reference: { startsWith: 'QA_' } },
  });
  await prisma.$disconnect();
}
```

---

## Izolacja: Prefiksy, cleanup i naming conventions

### Konwencje nazewnictwa dla danych testowych

```typescript
// Prefiksy dla łatwej identyfikacji i cleanup
const QA_PREFIX = 'QA_';
const TIMESTAMP = Date.now();
const RANDOM = faker.string.alphanumeric(6).toUpperCase();

// Wzorzec: TYP_KATEGORIA_TIMESTAMP_RANDOM
const testData = {
  userEmail: `${QA_PREFIX}USER_${TIMESTAMP}_${RANDOM}@test.pl`,
  orderRef: `${QA_PREFIX}ORD_${TIMESTAMP}_${RANDOM}`,
  productSku: `${QA_PREFIX}SKU_${TIMESTAMP}_${RANDOM}`,
  companyName: `${QA_PREFIX}COMPANY_${TIMESTAMP}`,
};

// Wzorzec: deskryptor + timestamp (dla danych jednorazowych)
const sessionId = `TEST_SESSION_${Date.now()}`;
```

### Automatyczny cleanup — zasada "Always clean up after yourself"

```typescript
test('test z automatycznym cleanup', async ({ request }) => {
  const testId = `QA_${Date.now()}`;
  let createdUserId: string;
  
  try {
    // 1. Setup — stwórz dane
    const userResponse = await request.post('/api/users', {
      data: {
        email: `test.${testId}@test.pl`,
        name: `Test User ${testId}`,
      },
    });
    const userData = await userResponse.json();
    createdUserId = userData.id;
    
    // 2. Test — użyj danych
    await request.get(`/api/users/${createdUserId}`);
    
    // 3. Teardown — posprzątaj
    await request.delete(`/api/users/${createdUserId}`);
  } catch (error) {
    // Teardown nawet w przypadku błędu — CRITICAL!
    if (createdUserId) {
      await request.delete(`/api/users/${createdUserId}`).catch(() => {});
      // ignore cleanup error — główny test jest ważniejszy
    }
    throw error;
  }
});
```

### Cleanup w afterEach / afterAll

```typescript
test.describe('Moduł produktów', () => {
  const createdProductIds: string[] = [];
  
  test.afterEach(async ({ request }) => {
    // Usuń wszystkie produkty stworzone w tym teście
    await Promise.all(
      createdProductIds.map(id => 
        request.delete(`/api/products/${id}`).catch(() => {})
      )
    );
    createdProductIds.length = 0; // Reset tablicy
  });
  
  test('stwórz nowy produkt', async ({ page, request }) => {
    const response = await request.post('/api/products', {
      data: { name: `Test Product ${Date.now()}`, price: 99.99 },
    });
    const product = await response.json();
    createdProductIds.push(product.id);
    
    // ...
  });
  
  test('edytuj istniejący produkt', async ({ page }) => {
    // Ten test też może coś stworzyć...
  });
});
```

---

## Stateless Testing — idealne środowisko testowe

### Filozofia bezstanowości

Idealne środowisko testowe to takie, które jest **resetowane do znanego stanu przed każdym uruchomieniem suity**. Oznacza to:
- Czysta baza danych (dump/restore przed każdym uruchomieniem).
- Zerowy stan persistent (brak danych z poprzednich uruchomień).
- Determinizm — ten sam test zawsze daje ten sam wynik.

### Docker + Database Reset

```yaml
# docker-compose.test.yml
services:
  postgres-test:
    image: postgres:15
    environment:
      POSTGRES_DB: test_db
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
    # Init script: ładuje "clean snapshot" bazy
    volumes:
      - ./test-db-dump.sql:/docker-entrypoint-initdb.d/01-seed.sql
    # Respekt: przed każdym uruchomieniem kontener jest restartowany
    # z czystym init scriptem

  app:
    build: .
    depends_on:
      - postgres-test
    environment:
      DATABASE_URL: postgresql://test_user:test_password@postgres-test:5432/test_db
    command: npm run start:test
```

### Seed fixture jako kontrakt stanu

```typescript
// fixtures/seed.ts
export const seededState = base.extend<{
  // Każdy test dostaje fixture "seededState", który zawiera
  // zainicjowany stan bazy danych
  
  users: {
    admin: { id: string; email: string; password: string; token: string };
    customer: { id: string; email: string; password: string; token: string };
    blocked: { id: string; email: string; password: string; token: string };
  };
  
  products: Array<{ id: string; sku: string; name: string; price: number; stock: number }>;
  
  orders: {
    pending: { id: string; reference: string };
    paid: { id: string; reference: string };
    cancelled: { id: string; reference: string };
  };
}>({
  users: ..., // setup z fixture request
  products: ..., // setup z fixture request
  orders: ..., // setup z fixture request
});

// Teraz każdy test może użyć:
test('zablokowany użytkownik nie może się zalogować', async ({ page, seededState }) => {
  // seededState.users.blocked — deterministyczny użytkownik o znanym stanie
  await page.goto('/login');
  await page.getByLabel('Email').fill(seededState.users.blocked.email);
  await page.getByLabel('Hasło').fill(seededState.users.blocked.password);
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  
  await expect(page.getByText('Twoje konto jest zablokowane')).toBeVisible();
});
```

---

## Dobre praktyki — co robić, a czego unikać

### Co ROBIĆ:

1. **Generuj unikalne dane za każdym razem** — nigdy nie polegaj na statycznych wartościach współdzielonych między testami.
2. **Oznaczaj dane testowe prefiksem** — `QA_`, `TEST_`, `AUTO_` — aby łatwo je znaleźć w bazie i wyczyścić.
3. **Cleanup po każdym teście** — nawet gdy test padnie, cleanup ma chronić następne testy.
4. **Preferuj API nad UI dla setupu** — stworzenie użytkownika przez API to 50ms, przez formularz UI to 5-10 sekund.
5. **Unikaj "magic numbers"** — jeśli test wymaga zamówienia w statusie "SHIPPED", stwórz fixture, który zawsze dostarcza takie zamówienie.
6. **Testuj z izolowanymi kontekstami** — każdy test dostaje własne ciasteczka, localStorage, sesję.

### Czego UNIKAĆ:

1. **Nie polegaj na "istniejącym użytkowniku"** — zakładaj, że baza jest pusta.
2. **Nie używaj tej samej email/nazwy użytkownika w wielu testach** — konflikty unikalności.
3. **Nie pisz cleanupu ręcznie w każdym teście** — używaj fixture z automatycznym teardown.
4. **Nie zostawiaj danych testowych po teście** — rośnie ryzyko "dirty state" w następnych uruchomieniach.
5. **Nie testuj UI tam, gdzie API jest szybsze i stabilniejsze** — np. setup danych przez UI zamiast API.
6. **Nie zakładaj, że testy mogą być uruchamiane w dowolnej kolejności bez izolacji** — jeśli nie masz izolacji danych, kolejność ma znaczenie.

---

## Perspektywa Full Stack Testera — od testera do inżyniera danych

Umiejętność zarządzania danymi testowymi to jedna z cech, która odróżnia dobrego testera automatycznego od inżyniera QA. Gdy potrafisz:
- Pisać skrypty seedujące bazę danych do znanego stanu.
- Konfigurować Docker z powtarzalnym init scriptem.
- Pisać fixture'y, które automatycznie tworzą i usuwają dane.
- Monitorować, czy środowisko testowe nie "puchnie" od starych danych.

...wtedy Twoja wartość dla zespołu rośnie dramatycznie. Stajesz się osobą, która potrafi zapewnić, że 500 testów E2E działa stabilnie na każdym środowisku — co jest jednym z najtrudniejszych problemów inżynieryjnych w testowaniu automatycznym.

---

## Podsumowanie

Zarządzanie danymi testowymi to fundament stabilności testów automatycznych:

1. **Problem dirty environment** — współdzielone dane modyfikowane przez testy równoległe powodują losowe awarie.
2. **Faker.js** — generowanie unikalnych, realistycznych danych testowych za każdym razem.
3. **Setup-through-API** — najszybsza metoda przygotowania danych (50ms vs 10s przez UI).
4. **Database seeding** — wstrzykiwanie złożonego stanu bazy bezpośrednio, gdy API nie wystarczy.
5. **Izolacja prefiksami** — oznaczanie danych testowych (`QA_*`) dla łatwego cleanupu i identyfikacji.
6. **Stateless testing** — resetowanie środowiska do znanego stanu przed każdą sesją testową.

---

## Linki i źródła

- [Faker.js Documentation](https://fakerjs.dev/)
- [Playwright Fixtures Guide](https://playwright.dev/docs/test-fixtures)
- [Database Seeding Best Practices](https://prismjs.github.io/prisma/docs/guides/testing)
- [Docker for Test Automation](https://docs.docker.com/compose/asp-net-core-signalr/)
- [Test Data Management — ISTQB](https://www.istqb.org/)

## 📘 Suplement Inżynieryjny 2026: Zarządzanie Danymi Testowymi (Data Management)
*Inspiracja: „Scalable Test Automation with Playwright” (2026), Chapter 7*
*   **Izolacja Danych**: Nigdy nie współdziel mutowalnych danych między testami działającymi równolegle. Używaj generatorów (np. biblioteki Faker) do tworzenia unikalnych tożsamości i twórz stan bazy dynamicznie per test.
*   **Szybki Setup przez API**: Zamiast przeklikiwać UI w celu przygotowania danych, użyj szybkiego klienta API przed rozpoczęciem testu funkcjonalnego.
