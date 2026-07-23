# OpenAPI jako Kontrakt — Wykonywalna Specyfikacja API

> **Perspektywa Full Stack Testera**
> API to umowa między dostawcą a konsumentem. Gdy frontend oczekuje pola `total` jako liczby, a backend zaczyna zwracać string — mamy problem. Problem, który wykryty późno może kosztować godziny debugowania, popsute wdrożenie i utratę zaufania między zespołami. OpenAPI (wcześniej znany jako Swagger) to nie tylko dokumentacja — to wykonywalny kontrakt, który można walidować w CI/CD, lintować pod kątem jakości i udostępniać wszystkim konsumentom w jednym, spójnym formacie. W tej lekcji zdobędziesz umiejętności projektowania, walidacji i utrzymywania kontraktów API, które chronią zarówno dostawcę, jak i konsumenta przed nieprzyjemnymi niespodziankami.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Rozumieć** OpenAPI jako wykonywalny kontrakt, nie dokumentację po fakcie
- **Projektować** schematy OpenAPI z walidacją typów, enumów i formatów
- **Dokumentować** scenariusze błędów (400, 401, 403, 404, 422) w specyfikacji
- **Lintować** specyfikację pod kątem spójności i jakości
- **Walidować** odpowiedzi API względem schematu OpenAPI
- **Wykorzystywać** OpenAPI do generowania mocków i dokumentacji

---

## Wprowadzenie — dlaczego kontrakt jest ważny

Współczesne aplikacje to archipelag mikrousług. Każda usługa komunikuje się z innymi przez API. Gdy jedna usługa zmienia swój interfejs, wszystkie konsumujące ją usługi muszą być świadome tej zmiany — w przeciwnym razie:

- **Frontend przestaje działać** — oczekuje innego kształtu danych
- **Integracje zewnętrzne padają** — partnerzy nie wiedzą o zmianie
- **Debugowanie staje się koszmarem** — który z 20 mikroserwisów się zmienił?

OpenAPI rozwiązuje ten problem, tworząc ** wspólny, maszynowo-weryfikowalny kontrakt**, który wszyscy rozumieją iagainst który można testować automatycznie.

---

## Sytuacja przewodnia — breaking change w Orders API

Frontend zamówień oczekuje:
- `total: number` — suma zamówienia jako liczba
- `status: 'PAID' | 'NEW' | 'CANCELLED'` — znane statuty

Backend po refaktoryzacji zaczyna zwracać:
- `total: string` — „199.99 PLN" zamiast 199.99
- `status: 'SETTLED'` — nowy status nieznany frontendowi

Twój zespół testów kontraktowych powinien wykryć tę zmianę **zanim dotrze ona do frontendu**.

---

## 1. OpenAPI jako źródło prawdy

### 1.1 Dokumentacja vs kontrakt

| Aspekt | Dokumentacja (popołudniowa) | Kontrakt (wykonywalny) |
|--------|----------------------------|----------------------|
| **Tworzona** | Po implementacji | Przed implementacją |
| **Weryfikowana** | Ręcznie | Automatycznie w CI |
| **Aktualizacja** | Ręczna, łatwo zapomnieć | Wymuszona przez testy |
| **Wykorzystanie** | Ludzie czytają | Narzędzia walidują |

### 1.2 Narzędzia ekosystemu OpenAPI

```bash
# Specyfikacja (YAML/JSON)
openapi.yaml
openapi.json

# Narzędzia
npm install -g @redocly/cli       # Redocly CLI — lintowanie, budowanie docs
npm install -g @apidevtools/swagger-cli  # Swagger CLI — walidacja
npm install swagger-ui-react      # Interaktywna dokumentacja
npm install @openapitools/openapi-generator-cli  # Generowanie klientów
```

### 1.3 Struktura dokumentu OpenAPI 3.1

```yaml
openapi: 3.1.0  # Wersja specyfikacji

info:           # Metadane API
  title: E-commerce Platform API
  version: 2.1.0
  description: |
    API platformy e-commerce. Wszystkie ścieżki są wersjonowane
    i muszą być używane z odpowiednim accept-header.
  contact:
    name: API Team
    email: api@example.com

servers:        # Środowiska
  - url: https://api.example.com/v2
    description: Production
  - url: https://staging-api.example.com/v2
    description: Staging

paths:          # Endpoints
  /orders/{orderId}:
    get:
      summary: Pobierz szczegóły zamówienia
      operationId: getOrder
      tags: [Orders]
      parameters:
        - $ref: '#/components/parameters/orderId'
      responses:
        '200':
          $ref: '#/components/responses/OrderFound'
        '404':
          $ref: '#/components/responses/NotFound'
        '401':
          $ref: '#/components/responses/Unauthorized'

components:     # Reużywalne elementy
  parameters:
    orderId:
      name: orderId
      in: path
      required: true
      schema:
        type: string
        format: uuid
  schemas:
    Order:
      $ref: '#/components/schemas/Order'
  responses:
    OrderFound:
      description: Zamówienie znalezione
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Order'
```

---

## 2. Schematy — precyzyjne modelowanie danych

### 2.1 Podstawowy schemat obiektu

```yaml
components:
  schemas:
    Order:
      type: object
      description: Zamówienie klienta
      required:
        - id
        - status
        - total
        - createdAt
      properties:
        id:
          type: string
          format: uuid
          description: Unikalny identyfikator zamówienia
          example: "d290f1ee-6c54-4b01-90e6-d701748f0851"
        orderNumber:
          type: string
          pattern: '^ORD-[0-9]{8}$'
          description: Czytelny numer zamówienia dla klienta
          example: "ORD-20240623"
        status:
          $ref: '#/components/schemas/OrderStatus'
        total:
          type: number
          format: double
          description: Całkowita kwota zamówienia w PLN
          minimum: 0
          example: 199.99
        currency:
          type: string
          enum: [PLN, EUR, USD, GBP]
          default: PLN
          example: PLN
        customer:
          $ref: '#/components/schemas/Customer'
        items:
          type: array
          items:
            $ref: '#/components/schemas/OrderItem'
          minItems: 1
          description: Pozycje zamówienia
        shippingAddress:
          $ref: '#/components/schemas/Address'
        createdAt:
          type: string
          format: date-time
          example: "2024-06-23T10:30:00Z"
        updatedAt:
          type: string
          format: date-time
          example: "2024-06-23T11:45:00Z"
        paidAt:
          type: string
          format: date-time
          nullable: true
          description: Data i czas płatności (null jeśli nieopłacone)
```

### 2.2 Enum — zamknięta lista wartości

```yaml
components:
  schemas:
    OrderStatus:
      type: string
      enum:
        - NEW           # Nowe zamówienie, oczekuje na płatność
        - PENDING       # Płatność w trakcie przetwarzania
        - PAID          # Płatność zakończona sukcesem
        - PROCESSING    # Zamówienie w realizacji
        - SHIPPED       # Zamówienie wysłane
        - DELIVERED     # Zamówienie dostarczone
        - COMPLETED     # Zamówienie zamknięte
        - CANCELLED     # Zamówienie anulowane
        - REFUNDED      # Zwrot środków
      description: |
        Status zamówienia w cyklu życia.
        - NEW → Płatność zainicjowana
        - PENDING → Płatność w trakcie (np. oczekuje na 3D Secure)
        - PAID → Płatność zakończona, można realizować
        - CANCELLED → Może nastąpić z NEW, PENDING, PAID
        - REFUNDED → Zawsze po PAID lub COMPLETED
```

### 2.3 Zagnieżdżone schematy

```yaml
components:
  schemas:
    OrderItem:
      type: object
      required: [productId, productName, quantity, unitPrice, totalPrice]
      properties:
        productId:
          type: integer
          format: int64
          example: 12345
        productName:
          type: string
          example: "MacBook Pro 14''"
        sku:
          type: string
          pattern: '^[A-Z0-9]{8,12}$'
          example: "MBP14-M3-16"
        quantity:
          type: integer
          minimum: 1
          example: 1
        unitPrice:
          type: number
          format: double
          minimum: 0
          example: 9999.00
        totalPrice:
          type: number
          format: double
          description: quantity × unitPrice
          example: 9999.00
        imageUrl:
          type: string
          format: uri
          nullable: true
          example: "https://cdn.example.com/products/mbp14.jpg"

    Customer:
      type: object
      required: [id, email]
      properties:
        id:
          type: integer
          format: int64
          example: 1001
        email:
          type: string
          format: email
          example: "jan.kowalski@example.com"
        firstName:
          type: string
          example: "Jan"
        lastName:
          type: string
          example: "Kowalski"
        phone:
          type: string
          nullable: true
          example: "+48 123 456 789"
        loyaltyTier:
          type: string
          enum: [BRONZE, SILVER, GOLD, PLATINUM]
          description: Poziom programu lojalnościowego
          example: GOLD

    Address:
      type: object
      required: [street, city, postalCode, country]
      properties:
        street:
          type: string
          example: "ul. Marszałkowska 1/10"
        city:
          type: string
          example: "Warszawa"
        postalCode:
          type: string
          pattern: '^[0-9]{2}-[0-9]{3}$'
          example: "00-001"
        country:
          type: string
          enum: [PL, DE, FR, GB, US]
          example: PL
```

---

## 3. Scenariusze błędów — kontrakt obejmuje nie tylko sukces

### 3.1 Standardowe błędy HTTP

```yaml
paths:
  /orders/{orderId}:
    get:
      # ... definicja ...
      responses:
        '200':
          description: Zamówienie znalezione
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Order'
              example:
                id: "d290f1ee-6c54-4b01-90e6-d701748f0851"
                status: PAID
                total: 199.99
                customer:
                  id: 1001
                  email: "jan@example.com"

        '400':
          $ref: '#/components/responses/BadRequest'

        '401':
          $ref: '#/components/responses/Unauthorized'

        '403':
          $ref: '#/components/responses/Forbidden'

        '404':
          $ref: '#/components/responses/NotFound'

        '422':
          $ref: '#/components/responses/UnprocessableEntity'

        '500':
          $ref: '#/components/responses/InternalError'
```

### 3.2 Definicja wspólnych odpowiedzi błędów

```yaml
components:
  responses:
    BadRequest:
      description: |
        Nieprawidłowe żądanie. Sprawdź parametry i format danych.
        Zwraca listę błędów walidacji.
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ValidationError'
          example:
            error: VALIDATION_ERROR
            message: "Nieprawidłowe parametry żądania"
            details:
              - field: orderId
                message: "Musi być prawidłowym UUID"
                code: INVALID_FORMAT
              - field: status
                message: "Nieznany status zamówienia"
                code: INVALID_ENUM

    Unauthorized:
      description: |
        Brak autoryzacji. Token JWT jest wymagany lub wygasł.
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            error: UNAUTHORIZED
            message: "Wymagany jest token autoryzacji"
            code: AUTH_TOKEN_MISSING

    Forbidden:
      description: |
        Brak uprawnień do zasobu. Użytkownik nie ma wymaganych ról.
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            error: FORBIDDEN
            message: "Brak uprawnień do tego zasobu"
            code: INSUFFICIENT_PERMISSIONS

    NotFound:
      description: |
        Zasób nie został znaleziony.
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            error: NOT_FOUND
            message: "Zamówienie o ID d290f1ee nie istnieje"
            code: RESOURCE_NOT_FOUND

    UnprocessableEntity:
      description: |
        Błąd przetwarzania. Żądanie jest poprawne syntaktycznie,
        ale nie może być przetworzone z powodu błędu biznesowego.
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/BusinessError'
          example:
            error: ORDER_ALREADY_PAID
            message: "Nie można anulować zamówienia, które jest już opłacone"
            code: INVALID_STATE_TRANSITION

    InternalError:
      description: |
        Wewnętrzny błąd serwera. Problem po stronie backendu.
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            error: INTERNAL_ERROR
            message: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później."
            code: SERVER_ERROR
```

### 3.3 Schematy błędów

```yaml
components:
  schemas:
    ErrorResponse:
      type: object
      required: [error, message, code]
      properties:
        error:
          type: string
          description: Kod błędu w formacie SCREAMING_SNAKE_CASE
          example: NOT_FOUND
        message:
          type: string
          description: Czytelny opis błędu dla użytkownika
          example: "Zamówienie nie zostało znalezione"
        code:
          type: string
          description: |
            Kod maszynowy błędu. Może być używany do automatycznej obsługi
            w aplikacji klienta.
          example: RESOURCE_NOT_FOUND
        details:
          type: object
          nullable: true
          description: Dodatkowe szczegóły błędu (opcjonalne)

    ValidationError:
      allOf:
        - $ref: '#/components/schemas/ErrorResponse'
        - type: object
          properties:
            details:
              type: array
              items:
                type: object
                required: [field, message]
                properties:
                  field:
                    type: string
                    description: Nazwa pola, które nie przeszło walidacji
                    example: "email"
                  message:
                    type: string
                    description: Opis błędu walidacji
                    example: "Musi być prawidłowym adresem email"
                  code:
                    type: string
                    description: Kod błędu walidacji
                    example: INVALID_EMAIL_FORMAT

    BusinessError:
      allOf:
        - $ref: '#/components/schemas/ErrorResponse'
        - type: object
          properties:
            context:
              type: object
              nullable: true
              description: Kontekst biznesowy błędu (np. aktualny status zamówienia)
              example:
                orderId: "d290f1ee-6c54-4b01-90e6-d701748f0851"
                currentStatus: PAID
```

---

## 4. Lintowanie specyfikacji — jakość kontraktu

### 4.1 Konfiguracja Redocly CLI

```yaml
# .redocly.yaml
extends:
  - recommended

rules:
  # Tagi muszą być zdefiniowane
  oas3 tags:
    level: error
    
  # Każdy schema musi mieć opis
  oas3-schema-no-description:
    level: warning
    severity: warn
    
  # Każdy parameter musi mieć opis
  operation-parameters-unique: error
    
  # Operacja musi mieć summary
  operation-summary: error
    
  # Operacja musi mieć description
  operation-description: error
    
  # Bezpieczeństwo: wymagany auth na chronionych endpointach
  oas3-server-variables: warn
    
  # Polish locale dla walidacji
  spec:
    lint:
      - ./openapi.yaml
```

### 4.2 Integracja z package.json

```json
{
  "scripts": {
    "lint:openapi": "redocly lint openapi.yaml",
    "lint:openapi:fix": "redocly lint openapi.yaml --fix",
    "build:docs": "redocly build-docs openapi.yaml",
    "preview:docs": "redocly preview-docs openapi.yaml"
  }
}
```

### 4.3 Typowe reguły lintowania

| Reguła | Cel | Przykład naruszenia |
|--------|-----|---------------------|
| `operation-summary` | Każda operacja musi mieć summary | Brak summary na PUT /orders |
| `no-unresolved-refs` | Wszystkie $ref muszą istnieć | $ref do nieistniejącego schema |
| `no-identical-paths` | Unikalne ścieżki | /orders i /orders (duplikat) |
| `no-ambiguous-paths` | Brak konfliktów ścieżek | /{id} i /orders/{id} |
| `operation-description` | Każda operacja opisana | Brak description na GET /products |
| `parameter-description` | Każdy parametr opisany | Brak description na ?page= |
| `request-body-schema` | Body musi mieć schema | PUT bez schema w body |
| `no-example-prop-and-example` | Nie dubluj przykładów | Jednocześnie example i examples |

### 4.4 Automatyczne sprawdzanie w CI

```yaml
# .github/workflows/openapi-lint.yml
name: OpenAPI Lint

on:
  pull_request:
    paths:
      - 'openapi.yaml'
      - 'api/**/*.yaml'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install -g @redocly/cli
      - run: npx redocly lint openapi.yaml
```

---

## 5. Walidacja implementacji względem specyfikacji

### 5.1 Dredd — walidator kontraktów

```bash
# Instalacja
npm install -g dredd-hooks-template
npm install dredd @dredd/api-spec-reader

# Konfiguracja .dredd.yml
draft: openapi.yaml
endpoint: http://localhost:3000

hooks:
  beforeAll:
    - ./hooks/before-all.js

dryRun: false
silent: false
level: info

reporter:
  - cli
  - html
```

```javascript
// hooks/before-all.js
const hooks = require('dredd-hooks-template');

hooks.beforeAll(function (transaction) {
  // Dodaj autoryzację do każdego requestu
  transaction.request.headers['Authorization'] = `Bearer ${process.env.API_TOKEN}`;
  transaction.request.headers['Content-Type'] = 'application/json';
});
```

### 5.2 Test Playwright walidujący kontrakt

```typescript
// tests/api/openapi-validation.spec.ts
import { test, expect } from '@playwright/test';
import { parse, validate } from '@apidevtools/swagger-parser';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Walidacja API względem kontraktu OpenAPI', () => {
  
  let openApiSpec: any;
  
  test.beforeAll(async () => {
    // Wczytaj specyfikację
    const specPath = path.join(process.cwd(), 'openapi.yaml');
    openApiSpec = await parse(specPath);
  });
  
  test('GET /orders/{orderId} zwraca dane zgodne ze schematem Order', async ({ request }) => {
    const orderId = 'd290f1ee-6c54-4b01-90e6-d701748f0851';
    
    const response = await request.get(`/api/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
        'Accept': 'application/json',
      },
    });
    
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    
    // Pobierz schemat Order z komponentów
    const orderSchema = openApiSpec.components.schemas.Order;
    
    // Waliduj odpowiedź względem schematu
    const validationResult = validate(responseBody, orderSchema);
    
    if (!validationResult.valid) {
      console.error('Błędy walidacji:', JSON.stringify(validationResult.errors, null, 2));
    }
    
    expect(validationResult.valid).toBe(true);
  });
  
  test('GET /orders/{orderId} zwraca poprawny błąd 404', async ({ request }) => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    
    const response = await request.get(`/api/orders/${nonExistentId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
      },
    });
    
    expect(response.status()).toBe(404);
    
    const errorBody = await response.json();
    
    // Waliduj schemat błędu
    const errorSchema = openApiSpec.components.schemas.ErrorResponse;
    const validationResult = validate(errorBody, errorSchema);
    
    expect(validationResult.valid).toBe(true);
    expect(errorBody.error).toBe('NOT_FOUND');
  });
  
  test('wszystkie wymagane pola są obecne w odpowiedzi', async ({ request }) => {
    const response = await request.get('/api/orders/d290f1ee-6c54-4b01-90e6-d701748f0851');
    
    const body = await response.json();
    const orderSchema = openApiSpec.components.schemas.Order;
    const requiredFields = orderSchema.required || [];
    
    for (const field of requiredFields) {
      expect(body).toHaveProperty(field);
    }
  });
  
  test('status zamówienia jest jedną z dozwolonych wartości enum', async ({ request }) => {
    const response = await request.get('/api/orders/d290f1ee-6c54-4b01-90e6-d701748f0851');
    
    const body = await response.json();
    const allowedStatuses = ['NEW', 'PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED'];
    
    expect(allowedStatuses).toContain(body.status);
  });
});
```

### 5.3 Generowanie mocków ze specyfikacji

```bash
# Prisma Mock Server — generuje mock z OpenAPI
npx prism mock openapi.yaml

# Swagger Petstore — przykładowy mock
npx prism mock https://petstore.swagger.io/v2/swagger.json

# Opcje:
npx prism mock openapi.yaml --port 8080 --dynamic  # Dynamiczne odpowiedzi
```

### 5.4 Generowanie klientów API

```bash
# openapi-generator-cli — generuje klienta TypeScript z OpenAPI
npx @openapitools/openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-fetch \
  -o ./src/generated/api-client \
  --additional-properties=typescriptVersion=5.4

# Użycie wygenerowanego klienta:
import { OrdersApi, Configuration } from './generated/api-client';

const api = new OrdersApi(new Configuration({
  basePath: process.env.API_URL,
  apiKey: process.env.API_TOKEN,
}));

const order = await api.getOrder({ orderId: 'd290f1ee-6c54-4b01-90e6-d701748f0851' });
console.log(order.status);  // TypeScript wie, że to OrderStatus enum
```

---

## 6. Versioning API — zarządzanie zmianami

### 6.1 Strategie wersjonowania

```yaml
# Strategia 1: URL path versioning
servers:
  - url: https://api.example.com/v1
  - url: https://api.example.com/v2

# Strategia 2: Header versioning (mniej popularna)
paths:
  /orders/{orderId}:
    get:
      parameters:
        - name: API-Version
          in: header
          required: true
          schema:
            type: string
            enum: [v1, v2]
```

### 6.2 Breaking vs non-breaking changes

**Non-breaking (wsteczna kompatybilność):**
- Dodanie nowego opcjonalnego pola do odpowiedzi
- Dodanie nowego endpointu
- Dodanie nowego parametru query (opcjonalne)
- Rozszerzenie enum o nowe wartości

**Breaking (łamiące zmiany):**
- Zmiana typu pola (`number` → `string`)
- Usunięcie pola
- Zmiana wymagalności pola (opcjonalne → wymagane)
- Zmiana nazwy pola
- Usunięcie endpointu
- Zmiana formatu odpowiedzi błędu
- Zmiana kodu odpowiedzi HTTP

### 6.3 Wykrywanie breaking changes w CI

```typescript
// scripts/check-breaking-changes.ts
import { diff } from 'openapi-diff';
import { readFileSync } from 'fs';

const oldSpec = readFileSync('openapi-v1.yaml', 'utf-8');
const newSpec = readFileSync('openapi-v2.yaml', 'utf-8');

const result = await diff(oldSpec, newSpec);

const breakingChanges = result.breakingChanges || [];

if (breakingChanges.length > 0) {
  console.error('⚠️  Wykryto breaking changes:');
  for (const change of breakingChanges) {
    console.error(`  - ${change.path}: ${change.type}`);
  }
  
  console.error('\nTe zmiany wymagają:');
  console.error('1. Zwiększenia wersji API (v2 → v3)');
  console.error('2. Uruchomienia procesu deprecacji dla konsumentów');
  console.error('3. Co najmniej 30-dniowego okresu przejściowego');
  
  process.exit(1);
}

console.log('✓ Brak breaking changes');
```

---

## Perspektywa Full Stack Testera

Testy kontraktowe to most między zespołami. Jako Full Stack Tester powinieneś:

- **Znać kontrakty API** wszystkich usług, z którymi współpracujesz
- **Weryfikować zgodność** odpowiedzi ze specyfikacją w testach E2E
- **Brać udział w review** zmian w OpenAPI — Ty wiesz, jak testy konsumują API
- **Wykrywać breaking changes** zanim dotrą do produkcji
- **Dokumentować** nieudokumentowane zachowania jako nowe wymagania

Pamiętaj: kontrakt, który nie jest walidowany, to tylko dokument. Dokument, który nie chroni konsumenta, jest wart tyle, co dokumentacja tworzona po fakcie — czyli niewiele.

---

## Podsumowanie

- **OpenAPI to kontrakt**, nie dokumentacja — traktuj go jako wykonywalną specyfikację
- **Schematy** modelują dokładny kształt danych — typy, enumy, formaty, wymagalność
- **Scenariusze błędów** są częścią kontraktu — 400, 401, 403, 404, 422 muszą być opisane
- **Lintowanie** utrzymuje jakość specyfikacji — spójne nazewnictwo, opisy, formaty
- **Walidacja** porównuje implementację ze specyfikacją — wykrywa rozjechania wcześnie
- **Breaking changes** wymagają procesu — niekompatybilne zmiany powinny blokować CI

---

## Linki i źródła

- **[OpenAPI Specification](https://spec.openapis.org/oas/v3.1.0)** — oficjalna specyfikacja OpenAPI 3.1
- **[Swagger Editor](https://editor.swagger.io/)** — interaktywny edytor i walidator OpenAPI
- **[Redocly CLI](https://redocly.com/docs/cli/)** — lintowanie i budowanie dokumentacji
- **[Dredd — API Testing](https://dredd.org/en/latest/)** — walidacja API względem OpenAPI
- **[OpenAPI Diff](https://github.com/OpenAPITools/openapi-diff)** — wykrywanie breaking changes
- **[openapi-generator](https://github.com/OpenAPITools/openapi-generator)** — generowanie klientów i mocków
- **[Stoplight Elements](https://stoplight.io/open-source/elements)** — interaktywna dokumentacja OpenAPI
---

## AsyncAPI jako uzupełnienie OpenAPI

OpenAPI opisuje głównie HTTP API. W systemach event-driven potrzebujesz także kontraktu dla komunikatów, topiców, kolejek i eventów. Do tego służy AsyncAPI.

Przykład zakresu AsyncAPI:

- nazwa kanału lub topicu;
- typ komunikatu;
- schema payloadu;
- nagłówki;
- przykładowe wiadomości;
- producent i konsument;
- wersjonowanie eventu.

Jeśli moduł API opisuje `POST /orders`, a system później publikuje event `OrderCreated`, oba kontrakty są ważne. Testy powinny chronić zarówno request/response, jak i eventy.

## Contract drift

Contract drift oznacza rozjazd między dokumentacją a rzeczywistym zachowaniem systemu. Przykład: OpenAPI mówi, że `total` jest number, a backend zaczyna zwracać string. Taki błąd może nie zostać wykryty przez test UI, dopóki frontend nie zacznie dziwnie formatować kwoty.

Mitygacje:

- walidacja odpowiedzi względem OpenAPI w CI;
- openapi-diff dla zmian breaking;
- review zmian kontraktu;
- generowanie typów z kontraktu;
- testy konsumenckie dla krytycznych klientów.

## Mock server z kontraktu

OpenAPI może służyć do wygenerowania mock servera. To pomaga frontendowi pracować przed gotowym backendem, ale mock musi być zgodny z kontraktem i aktualizowany razem z nim. Mock nie zastępuje testu provider implementation.

## Checklista OpenAPI jako kontraktu

- Czy specyfikacja jest wersjonowana razem z kodem?
- Czy CI wykrywa breaking changes?
- Czy przykłady są realistyczne?
- Czy błędy 4xx/5xx mają opisany schema?
- Czy nagłówki i autoryzacja są częścią kontraktu?
- Czy eventy asynchroniczne mają osobny kontrakt, np. AsyncAPI?

## 📘 Suplement Inżynieryjny 2026: Testy Kontraktowe i Zarządzanie API (Pact)
*Inspiracja: „Scalable Test Automation with Playwright” (2026), Chapter 10*
*   **Consumer-Driven Contracts**: Używaj narzędzi takich jak Pact obok tradycyjnych testów API, aby zapewnić, że zmiany na backendzie nie popsują integracji u konsumentów (frontend, mikroserwisy), tworząc automatyczny gatekeeper w CI/CD.
