# Kompletne testowanie REST API i wzorzec API Object Model

> **Perspektywa Full Stack Testera**
> Testowanie REST API w Playwright to nie jest jedynie "dodatek" do testów UI. To pełnoprawna, niezależna warstwa testowa, która pozwala na weryfikację logiki biznesowej, kontraktów danych i integracji backendowych — z szybkością, która jest nieosiągalna dla testów interfejsu graficznego. Jako Full Stack Tester powinieneś widzieć testy API jako fundament piramidy testów: to tutaj sprawdzasz 80% przypadków brzegowych (walidacje, uprawnienia, błędy logiczne, poprawność danych), a przez UI przechodzisz tylko "szczęśliwą ścieżkę". 

W skali korporacyjnej, bezpośrednie wywoływanie `request.post('/api/v1/orders', ...)` w plikach testowych staje się uciążliwe i utrudnia refaktoryzację. Aby temu zapobiec, Raj Uppadhyay w książce *"Scalable Test Automation with Playwright" (2026)* opisuje wzorce **Base API Class** oraz **API Object Model (AOM)** powiązany z **ApiFactory**.

---

## 1. Wzorzec API Object Model (AOM)

Analogicznie do Page Object Model (POM), **API Object Model** hermetyzuje techniczne szczegóły zapytań HTTP (adresy URL, nagłówki, parametry) w wyspecjalizowanych klasach usług. Testy wywołują jedynie czytelne metody biznesowe, co ułatwia utrzymanie kodu.

### A. Klasa bazowa BaseApi
Klasa bazowa `BaseApi` udostępnia zunifikowany mechanizm wykonywania zapytań HTTP, logowania zdarzeń oraz obsługi błędów sieciowych:

```typescript
import { APIRequestContext, APIResponse } from '@playwright/test';

export abstract class BaseApi {
  protected request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  /**
   * Metoda pomocnicza zapewniająca domyślne nagłówki i logowanie zapytań.
   */
  protected async postRequest(endpoint: string, data: any, headers?: Record<string, string>): Promise<APIResponse> {
    return await this.request.post(endpoint, {
      data,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      }
    });
  }

  protected async getRequest(endpoint: string, params?: Record<string, string>): Promise<APIResponse> {
    return await this.request.get(endpoint, { params });
  }
}
```

---

## 2. Implementacja specyficznego modelu API (`UserApi`)

Dziedzicząc po `BaseApi`, tworzymy klasy reprezentujące konkretne zasoby/mikroserwisy aplikacji:

```typescript
import { BaseApi } from './BaseApi';
import { APIResponse } from '@playwright/test';

export class UserApi extends BaseApi {
  private readonly userEndpoint = '/api/v1/users';

  async createUser(userData: any): Promise<APIResponse> {
    return await this.postRequest(this.userEndpoint, userData);
  }

  async getUser(userId: string): Promise<APIResponse> {
    return await this.getRequest(`${this.userEndpoint}/${userId}`);
  }
}
```

---

## 3. Wzorzec Fabryki API (ApiFactory)

Podobnie jak w przypadku UI, powoływanie instancji klas API ukrywamy za wzorcem **Fabryki (ApiFactory)**. Zapobiega to bezpośredniemu sprzężeniu testów z konstruktorami klas API:

```typescript
import { APIRequestContext } from '@playwright/test';
import { UserApi } from '../api/UserApi';
import { BaseApi } from '../api/BaseApi';

export type ApiName = 'UserApi';

export class ApiFactory {
  /**
   * Statyczna metoda fabrykująca powołująca instancje obiektów API.
   */
  public static getApi<T extends BaseApi>(apiName: ApiName, request: APIRequestContext): T {
    switch (apiName) {
      case 'UserApi':
        return new UserApi(request) as unknown as T;
      default:
        throw new Error(`Model API "${apiName}" nie jest obsługiwany przez ApiFactory.`);
    }
  }
}
```

---

## 4. Wykorzystanie AOM w Fixturach

Najbardziej eleganckim sposobem integracji AOM z testami Playwright jest wstrzykiwanie ich za pomocą fixture-ów. Dzięki temu test nie zajmuje się pobieraniem kontekstu ani inicjalizacją fabryk:

```typescript
import { test as base } from '@playwright/test';
import { ApiFactory } from '../utils/ApiFactory';
import { UserApi } from '../api/UserApi';

type ApiFixtures = {
  userApi: UserApi;
};

export const test = base.extend<ApiFixtures>({
  userApi: async ({ request }, use) => {
    // Inicjalizacja poprzez fabrykę i wbudowaną fixturę request
    const userApi = ApiFactory.getApi<UserApi>('UserApi', request);
    await use(userApi);
  },
});
```

A sam plik testowy staje się krystalicznie czysty i otypowany:

```typescript
import { test } from './fixtures/base-test';
import { expect } from '@playwright/test';

test('powinien pomyślnie utworzyć nowego użytkownika w bazie', async ({ userApi }) => {
  const newUser = { name: 'Jan Kowalski', email: 'jan@example.com' };
  
  const response = await userApi.createUser(newUser);
  expect(response.status()).toBe(201);
  
  const body = await response.json();
  expect(body.email).toBe(newUser.email);
});
```

---

## 5. Checklista Inżynieryjna Testów API
Podczas budowania frameworka API w Playwright upewnij się, że:
- [ ] Czy szczegóły żądań HTTP (metody, endpointy, struktura nagłówków) są ukryte w klasach modelu API (AOM)?
- [ ] Czy do kreacji obiektów API wykorzystujesz dedykowaną fabrykę `ApiFactory`?
- [ ] Czy asercje w teście weryfikują zarówno status odpowiedzi (status code), jak i zgodność kontraktu JSON (np. struktury kluczy i typów)?
- [ ] Czy poprawnie zarządzasz nagłówkami autoryzacyjnymi (np. tokenami Bearer) wewnątrz klasy bazowej `BaseApi`?

---

## Bibliografia i Linki
*   *Raj Uppadhyay, Scalable Test Automation with Playwright (2026), Chapter 2: Building Your First API Test Automation Framework*
*   *Jean-François Greffier, Practical Playwright Test (2026), Chapter 8: Mocking and Emulation*
*   [Oficjalna Dokumentacja Playwright API Testing](https://playwright.dev/docs/api-testing)

## 📘 Suplement Inżynieryjny 2026: Zaawansowane Testowanie API (API Object Model)
*Inspiracja: „Scalable Test Automation with Playwright” (2026), Chapter 2*
*   **API Object Model (AOM)**: Hermetyzuj adresy URL, nagłówki i struktury zapytań HTTP w klasach modelu API dziedziczących po `BaseApi`. Powołuj te obiekty za pomocą `ApiFactory`, chroniąc testy przed modyfikacją endpointów.
*   **Synchronizacja Autoryzacji**: Korzystaj z wbudowanej fixtury `request`, która potrafi współdzielić stan sesji i ciasteczka bezpośrednio z kontekstem przeglądarki.
