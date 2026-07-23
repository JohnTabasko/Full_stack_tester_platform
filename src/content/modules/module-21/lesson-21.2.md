# Testy Kontraktowe Sterowane przez Konsumenta z Pact — Ochrona Granic Między Usługami

> **Perspektywa Full Stack Testera**
> W świecie mikrousług Frontend nie jest jedynym konsumentem Twojego API. Są też inne usługi, aplikacje mobilne, integracje partnerskie i procesy automatyczne. Gdy dostawca API zmienia swój interfejs — czy to przez refaktoryzację, optymalizację czy „ulepszenie" — każdy konsument musi o tym wiedzieć i mieć czas na adaptację. Tradycyjne testy E2E wykryją problem zbyt późno (gdy wszystko jest już zintegrowane). Testy kontraktowe sterowane przez konsumenta (Consumer-Driven Contract Testing) odwracają perspektywę: to konsument mówi, czego potrzebuje, a dostawca weryfikuje, czy nadal to zapewnia. W tej lekcji zdobędziesz praktyczne umiejętności pracy z frameworkiem Pact — od pisania kontraktów konsumenckich, przez publikację w Pact Broker, po weryfikację dostawcy w CI/CD.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Rozumieć** filozofię Consumer-Driven Contract Testing
- **Pisać** consumer tests w Pact, definiujące realne potrzeby
- **Konfigurować** Pact Broker do przechowywania i udostępniania kontraktów
- **Przeprowadzać** provider verification, aby wykrywać breaking changes
- **Integrować** Pact z CI/CD (GitHub Actions, Jenkins, GitLab CI)
- **Rozumieć** granice i ograniczenia Pact w kontekście testów E2E

---

## Wprowadzenie — dlaczego CDCT (Consumer-Driven)?

W tradycyjnym podejściu dostawca API definiuje swój interfejs i testuje go jednostkowo. Problem: dostawca nie wie, czego konsumenci faktycznie potrzebują. Może testować wszystkie endpointy, ale nie testuje scenariuszy użycia.

**Consumer-Driven Contract Testing (CDCT)** odwraca tę perspektywę:
- **Konsument** pisze testy opisujące swoje realne potrzeby
- **Te testy generują kontrakt** (pact file)
- **Kontrakt jest publikowany** w Pact Broker
- **Dostawca weryfikuje** czy nadal spełnia wszystkie kontrakty konsumentów

Efekt: dostawca wie dokładnie, które konsumenty zostaną dotknięte zmianą, a konsumenci są chronieni przed nieoczekiwanymi breaking changes.

---

## Sytuacja przewodnia — refaktoryzacja Orders API

Frontend checkout używa tylko 5 pól z odpowiedzi `/orders/{orderId}`:
- `id`, `orderNumber`, `status`, `total`, `customer.email`

Backend planuje refaktoryzację modelu — chce rozdzielić odpowiedź na `metadata` (id, orderNumber), `financials` (total, currency), `parties` (customer, shippingAddress).

Bez Pact: frontend dowie się o zmianie dopiero gdy E2E test zacznie padać.
Z Pact: kontrakt frontendu określa dokładnie potrzebne pola. Dostawca widzi, że zmiana rozbije kontrakt frontendu i wie, że musi zapewnić backward compatibility lub skoordynować zmianę.

---

## 1. Architektura Pact

### 1.1 Komponenty ekosystemu Pact

```
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   Consumer       │         │   Pact Broker    │         │    Provider      │
│   (Frontend)     │         │                  │         │    (Backend)     │
│                  │         │ Przechowuje:     │         │                  │
│  .writePact()    │ ──────> │ - Kontrakty      │ <───────│  .verifyPacts()  │
│  Generuje plik   │         │ - Wersje         │ Weryfikuje            │
│  pacts/xxx.json  │         │ - Wyniki          │ kontrakty
│                  │         │                  │         │                  │
└──────────────────┘         │ Podejmuje        │         └──────────────────┘
                             │ decyzję o deploy │
                             └──────────────────┘
                                     │
                                     ▼
                               can-i-deploy?
                               Czy można wdrożyć?
```

### 1.2 Instalacja i konfiguracja

```bash
# Instalacja Pact dla Node.js/TypeScript
npm install --save-dev @pact-foundation/pact @pact-foundation/pact-core

#Instalacja narzędzi CLI
npm install -g pact-broker
npx pact-broker --version  # 2.x.x
```

---

## 2. Consumer Tests — testy konsumenta

### 2.1 Podstawowa konfiguracja consumer test

```typescript
// tests/pact/consumer/checkout.consumer.pact.spec.ts
import { PactV3, MatchersV3, PactDsl } from '@pact-foundation/pact';
import path from 'path';

const { eachLike, like, regex, integer, decimal, string } = MatchersV3;

// Konfiguracja Pacts
const provider = new PactV3({
  consumer: 'checkout-frontend',       // Nazwa konsumenta
  provider: 'orders-api',              // Nazwa dostawcy
  dir: path.resolve(__dirname, '../../../pacts'),  // Gdzie zapisać contraty
  logLevel: 'warn',
});

// Test konsumenta — opisuje realną potrzebę
describe('Orders API - Consumer Contract', () => {
  
  describe('GET /orders/{orderId}', () => {
    
    it('zwraca podstawowe dane zamówienia dla frontendu checkout', async () => {
      // Given: stan początkowy dostawcy
      provider
        .given('order with ID 1001 exists and is paid')
        .uponReceiving('a request for order details by checkout frontend')
        
        // When: request od konsumenta
        .withRequest({
          method: 'GET',
          path: '/api/orders/1001',
          headers: {
            'Accept': 'application/json',
            'Authorization': regex({ generate: 'Bearer token', matcher: '^Bearer .+' }),
          },
        })
        
        // Then: response jaki konsument POTRZEBUJE (nie wszystko!)
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': regex({
              generate: 'application/json',
              matcher: 'application/json.*',
            }),
          },
          body: {
            // Dokładnie te pola, których frontend potrzebuje:
            id: string('1001'),
            orderNumber: string('ORD-20240623'),
            status: regex({
              generate: 'PAID',
              matcher: '^(NEW|PENDING|PAID|PROCESSING|SHIPPED|COMPLETED|CANCELLED)$',
            }),
            total: decimal(199.99),  // Liczba, nie string!
            currency: string('PLN'),
            customer: {
              id: integer(1001),
              email: regex({
                generate: 'jan@example.com',
                matcher: '^[^@]+@[^@]+\\.[^@]+$',
              }),
            },
          },
        });
      
      await provider.executeTest(async (mockServer) => {
        // Act: wywołaj mock server zamiast prawdziwego API
        const response = await fetch(`${mockServer.url}/api/orders/1001`, {
          headers: {
            'Authorization': 'Bearer test-token',
            'Accept': 'application/json',
          },
        });
        
        // Assert: weryfikacja odpowiedzi przez konsumenta
        expect(response.status).toBe(200);
        
        const body = await response.json();
        expect(body.id).toBe('1001');
        expect(body.status).toBe('PAID');
        expect(typeof body.total).toBe('number');  // Weryfikacja typu!
        expect(body.customer.email).toContain('@');
      });
    });
    
    it('zwraca błąd 404 gdy zamówienie nie istnieje', async () => {
      provider
        .given('order with ID 9999 does not exist')
        .uponReceiving('a request for non-existent order')
        .withRequest({
          method: 'GET',
          path: '/api/orders/9999',
          headers: { 'Accept': 'application/json' },
        })
        .willRespondWith({
          status: 404,
          body: {
            error: string('NOT_FOUND'),
            message: like('Zamówienie nie zostało znalezione'),
            code: string('RESOURCE_NOT_FOUND'),
          },
        });
      
      await provider.executeTest(async (mockServer) => {
        const response = await fetch(`${mockServer.url}/api/orders/9999`);
        expect(response.status).toBe(404);
        
        const body = await response.json();
        expect(body.error).toBe('NOT_FOUND');
      });
    });
    
    it('zwraca błąd 401 gdy brak autoryzacji', async () => {
      provider
        .given('no authentication token is provided')
        .uponReceiving('a request without auth token')
        .withRequest({
          method: 'GET',
          path: '/api/orders/1001',
          headers: { 'Accept': 'application/json' },  // Brak Authorization!
        })
        .willRespondWith({
          status: 401,
          body: {
            error: string('UNAUTHORIZED'),
            message: like('Wymagany jest token autoryzacji'),
          },
        });
      
      await provider.executeTest(async (mockServer) => {
        const response = await fetch(`${mockServer.url}/api/orders/1001`, {
          headers: { 'Accept': 'application/json' },
        });
        expect(response.status).toBe(401);
      });
    });
  });
});
```

### 2.2 Testowanie POST z body

```typescript
describe('POST /orders', () => {
  
  it('tworzy zamówienie z wymaganymi polami', async () => {
    provider
      .given('user 1001 is authenticated and has empty cart')
      .uponReceiving('a request to create order from cart')
      .withRequest({
        method: 'POST',
        path: '/api/orders',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: {
          cartId: integer(5001),
          shippingAddressId: integer(2001),
          paymentMethod: regex({
            generate: 'CARD',
            matcher: '^(CARD|BLIK|TRANSFER)$',
          }),
        },
      })
      .willRespondWith({
        status: 201,
        body: {
          id: string(),              // Matcher bez konkretnej wartości
          orderNumber: regex({
            generate: 'ORD-20240623-001',
            matcher: '^ORD-\\d{8}-\\d{3}$',
          }),
          status: string('NEW'),
          total: decimal(),
          createdAt: regex({
            generate: '2024-06-23T10:30:00Z',
            matcher: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$',
          }),
        },
      });
    
    await provider.executeTest(async (mockServer) => {
      const response = await fetch(`${mockServer.url}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({
          cartId: 5001,
          shippingAddressId: 2001,
          paymentMethod: 'CARD',
        }),
      });
      
      expect(response.status).toBe(201);
      const order = await response.json();
      expect(order.id).toBeDefined();
      expect(order.status).toBe('NEW');
    });
  });
});
```

---

## 3. Publishing contracts to Pact Broker

### 3.1 Konfiguracja Pact Broker

```bash
# Uruchom Pact Broker przez Docker
docker run -d \
  --name pact-broker \
  -p 9292:9292 \
  -e PACT_BROKER_DATABASE_URL=postgresql://postgres:password@localhost:5432/pact_broker \
  -e PACT_BROKER_PORT=9292 \
  pactfoundation/pact-broker

# Lub użyj hosted Pact Broker (cloud.pact.io)
```

### 3.2 Publikacja kontraktu po testach

```typescript
// scripts/publish-pacts.ts
import { Publisher } from '@pact-foundation/pact';
import path from 'path';

const publisher = new Publisher({
  pactBroker: process.env.PACT_BROKER_URL || 'https://cloud.pact.io',
  pactBrokerToken: process.env.PACT_BROKER_TOKEN,  // Zmienna env w CI!
  consumerVersion: process.env.GIT_SHA || '1.0.0',
  tagWithGitBranch: true,  // Taguj gałęzią Git
});

async function publishContracts() {
  try {
    await publisher.publishPacts({
      pactFiles: [path.resolve(__dirname, '../../pacts/*.json')],
    });
    console.log('✓ Kontrakty opublikowane w Pact Broker');
  } catch (error) {
    console.error('❌ Błąd publikacji kontraktów:', error);
    process.exit(1);
  }
}

publishContracts();
```

### 3.3 Skrypt w package.json

```json
{
  "scripts": {
    "pact:publish": "node scripts/publish-pacts.js",
    "pact:can-i-deploy": "pact-broker can-i-deploy \\
      --broker-base-url=$PACT_BROKER_URL \\
      --broker-token=$PACT_BROKER_TOKEN \\
      --provider=orders-api \\
      --consumer=checkout-frontend"
  }
}
```

### 3.4 Workflow publikacji

```yaml
# .github/workflows/pact-consumer.yml
name: Consumer Contract Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  pact-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run consumer tests
        run: npx playwright test tests/pact/consumer --reporter=json
        
      - name: Publish contracts to Pact Broker
        if: github.ref == 'refs/heads/main'
        env:
          PACT_BROKER_URL: ${{ secrets.PACT_BROKER_URL }}
          PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}
          GIT_SHA: ${{ github.sha }}
        run: npm run pact:publish
```

---

## 4. Provider Verification — weryfikacja dostawcy

### 4.1 Konfiguracja provider tests

```typescript
// tests/pact/provider/orders-api.provider.spec.ts
import { Verifier } from '@pact-foundation/pact';
import path from 'path';

describe('Orders API - Provider Verification', () => {
  
  const verifier = new Verifier({
    provider: 'orders-api',
    providerBaseUrl: process.env.PROVIDER_BASE_URL || 'http://localhost:3000',
    
    // Pact Broker — skąd pobrać kontrakty konsumentów
    pactBrokerUrl: process.env.PACT_BROKER_URL,
    pactBrokerToken: process.env.PACT_BROKER_TOKEN,
    
    // Weryfikuj tylko kontrakty z gałęzi main konsumentów
    consumerVersionSelectors: [
      { mainBranch: true },                    // Kontrakty z main
      { latest: true, fallbackTag: 'prod' },  // Lub ostatni tag prod
    ],
    
    // Publish wyników weryfikacji z powrotem do Brokera
    publishVerificationResult: process.env.CI === 'true',
    providerVersion: process.env.GIT_SHA || '1.0.0',
    
    // Format wyjścia
    format: ['console', 'json'],
    outDir: './pact-verification-results',
  });
  
  afterAll(async () => {
    await verifier.removeServer();
  });
  
  it('spełnia kontrakt checkout-frontend dla GET /orders/{orderId}', async () => {
    await verifier.verifyPactsForProvider();
  });
});
```

### 4.2 State handlers — setup stanu dostawcy

```typescript
// Stan dostawcy dla każdego scenariusza
verifier.stateHandler('order with ID 1001 exists and is paid', async (params) => {
  // Setup: przygotuj stan w bazie danych
  await db.insert('orders', {
    id: 1001,
    order_number: 'ORD-20240623',
    status: 'PAID',
    total: 199.99,
    user_id: 1001,
    paid_at: new Date(),
  });
  
  console.log(`✓ Setup: order 1001 exists with status PAID`);
});

verifier.stateHandler('order with ID 9999 does not exist', async (params) => {
  // Stan domyślny — brak zamówienia
  console.log('✓ Setup: no order 9999 (default state)');
});

verifier.stateHandler('user 1001 is authenticated and has empty cart', async (params) => {
  await db.update('users', { status: 'ACTIVE' }, 'id = $1', [1001]);
  await db.delete('cart_items', 'cart_id = $1', [5001]);
  console.log('✓ Setup: user 1001 authenticated, cart empty');
});
```

### 4.3 CI workflow dla providera

```yaml
# .github/workflows/provider-contract-tests.yml
name: Provider Contract Verification

on:
  push:
    branches: [main, develop, 'release/**']
  pull_request:
    branches: [main]

jobs:
  verify-contracts:
    runs-on: ubuntu-latest
    services:
      api:
        image: my-app:latest
        ports:
          - 3000:3000
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db
          
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Wait for API to be ready
        run: |
          for i in {1..30}; do
            curl -s http://localhost:3000/health && break
            sleep 2
          done
          
      - name: Run provider verification
        env:
          PROVIDER_BASE_URL: http://localhost:3000
          PACT_BROKER_URL: ${{ secrets.PACT_BROKER_URL }}
          PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}
          CI: true
          GIT_SHA: ${{ github.sha }}
        run: npx playwright test tests/pact/provider
        
      - name: Check can-i-deploy
        if: github.ref == 'refs/heads/main'
        env:
          PACT_BROKER_URL: ${{ secrets.PACT_BROKER_URL }}
          PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}
        run: |
          npm run pact:can-i-deploy || {
            echo "❌ Nie można wdrożyć — istnieją niepotwierdzone kontrakty";
            exit 1;
          }
```

---

## 5. can-i-deploy — decyzja o wdrożeniu

### 5.1 Jak działa can-i-deploy?

```bash
# Sprawdź czy można wdrożyć orders-api w wersji abc123
pact-broker can-i-deploy \
  --broker-base-url https://cloud.pact.io \
  --broker-token $PACT_BROKER_TOKEN \
  --provider orders-api \
  --version abc123

# Output:
# Computer says no. 😱
# 
# The following consumer contracts are not satisfied:
# 
#checkout-frontend - latest (main)
#  - orders-api_has_pending_verification_results (2024-06-23 10:30:00)
#    Latest successful verification: 3 days ago
# 
# Solution: Run provider verification and publish results first
```

### 5.2 Automatyczna decyzja w pipeline

```typescript
// scripts/can-deploy-check.ts
import { canDeploy } from '@pact-foundation/pact';

async function checkDeployment(provider: string, version: string) {
  const result = await canDeploy({
    pactBrokerUrl: process.env.PACT_BROKER_URL!,
    pactBrokerToken: process.env.PACT_BROKER_TOKEN!,
    provider,
    version,
    to: 'main',  // lub konkretny tag
  });
  
  if (result.deployable) {
    console.log(`✓ ${provider}@${version} może zostać wdrożony`);
    console.log(`  Wszystkie kontrakty konsumentów zweryfikowane`);
  } else {
    console.error(`❌ ${provider}@${version} NIE może zostać wdrożony`);
    console.error(`  ${result.reason}`);
    console.error(`  Dotknięci konsumenci:`);
    for (const c of result.consumerContracts || []) {
      console.error(`    - ${c.consumer} (${c.consumerVersion})`);
    }
    process.exit(1);
  }
}

checkDeployment('orders-api', process.env.GIT_SHA!);
```

---

## 6. Integracja z Playwright

### 6.1 Playwright jako wykonawca kontraktów

```typescript
// tests/pact/consumer/playwright-as-consumer.spec.ts
import { test, expect, request as playwrightRequest } from '@playwright/test';
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import path from 'path';

const provider = new PactV3({
  consumer: 'playwright-frontend',
  provider: 'products-api',
  dir: path.resolve(__dirname, '../../../pacts'),
});

test.describe('Products API - Playwright Consumer Tests', () => {
  
  test('pobiera listę produktów dla katalogu', async () => {
    provider
      .given('products catalog contains at least 3 products')
      .uponReceiving('request for products list with pagination')
      .withRequest({
        method: 'GET',
        path: '/api/products',
        query: {
          page: '1',
          limit: '10',
        },
        headers: {
          'Accept': 'application/json',
        },
      })
      .willRespondWith({
        status: 200,
        body: {
          data: MatchersV3.eachLike({
            id: MatchersV3.string('1'),
            name: MatchersV3.string('Product Name'),
            price: MatchersV3.decimal(99.99),
            category: MatchersV3.string('Electronics'),
            imageUrl: MatchersV3.string('https://cdn.example.com/product.jpg'),
            inStock: MatchersV3.boolean(true),
          }, { min: 1 }),
          pagination: {
            page: MatchersV3.integer(1),
            limit: MatchersV3.integer(10),
            total: MatchersV3.integer(MatchersV3.integer(3)),
          },
        },
      });
    
    await provider.executeTest(async (mockServer) => {
      const response = await playwrightRequest.fetch(`${mockServer.url}/api/products?page=1&limit=10`, {
        headers: { 'Accept': 'application/json' },
      });
      
      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(body.data).toBeDefined();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.pagination.page).toBe(1);
    });
  });
});
```

---

## 7. Granice Pact — co Pact nie robi

### 7.1 Co Pact chroni

✅ Komunikacja HTTP między usługami — kształt request/response
✅ Zgodność pól — typy, formaty, enumy
✅ Wymagane vs opcjonalne pola
✅ Kody odpowiedzi HTTP

### 7.2 Co Pact nie chroni

❌ **Funkcjonalne zachowanie** — czy algorytm zwraca prawidłowy wynik
❌ **Testy E2E** — pełne scenariusze użytkownika przez UI
❌ **Wydajność** — czas odpowiedzi, throughput
❌ **Bezpieczeństwo** — autoryzacja, walidacja danych
❌ **Stany transient** — dane zmieniające się w czasie (poza kontraktem)

### 7.3 Strategia testowania — komplementarność

```mermaid
graph TD
    A[Testy Jednostkowe] --> B[Testy Integracyjne]
    B --> C[Testy Kontraktowe]
    C --> D[Testy E2E]
    
    style C fill:#e1f5fe
    style D fill:#fff3e0
```

| Poziom | Cel | Narzędzia |
|--------|-----|-----------|
| **Jednostkowe** | Poprawność logiki | Jest, Mocha |
| **Integracyjne** | Poprawność DB, cache | Playwright (API) |
| **Kontraktowe** | Zgodność interfejsów | **Pact** |
| **E2E** | Pełne ścieżki użytkownika | Playwright (UI) |

---

## Perspektywa Full Stack Testera

Pact to most między zespołami w organizacji mikrousługowej. Jako Full Stack Tester powinieneś:

- **Pisać consumer tests** — opisuj realne potrzeby Twojego zespołu
- **Brać udział w provider verification** — wiesz, jak testy konsumują API
- **Monitorować can-i-deploy** — decyzja o wdrożeniu na podstawie kontraktów
- **Rozumieć granice** — Pact nie zastępuje testów funkcjonalnych ani E2E

Pamiętaj: kontrakt jest tak silny, jak najsłabszy konsument. Jeśli masz konsumenta, który potrzebuje tylko 3 pól, a dostawca musi zapewnić 50 — kontrakt chroni tych 3, nie 50.

---

## Podsumowanie

- **Consumer-Driven Contract Testing** — konsument definiuje potrzeby, dostawca weryfikuje
- **Consumer tests** generują pact files opisujące realne potrzeby
- **Pact Broker** przechowuje kontrakty i umożliwia can-i-deploy
- **Provider verification** uruchamia kontrakty przeciwko rzeczywistej implementacji
- **can-i-deploy** blokuje wdrożenie, jeśli kontrakty nie są zweryfikowane
- **Integracja z Playwright** pozwala używać Playwright jako execution engine dla kontraktów
- **Granice Pact** — kontrakt ≠ testy funkcjonalne, E2E, wydajności

---

## Linki i źródła

- **[Pact Framework](https://docs.pact.io/)** — oficjalna dokumentacja Pact
- **[Pact Broker](https://docs.pact.io/pact_broker)** — konfiguracja i użycie Pact Broker
- **[Pact JS](https://github.com/pact-foundation/pact-js)** — implementacja Pact dla JavaScript/TypeScript
- **[Pactflow — Contract Testing Guide](https://pactflow.io/blog/contract-testing-what-it-means-for-your-team/)** — wprowadzenie do CDCT
- **[can-i-deploy](https://docs.pact.io/pact_broker/can_i_deploy)** — dokumentacja can-i-deploy
- **[Provider States](https://docs.pact.io/implementation_and_architecture/provider_states)** — konfiguracja stanów dostawcy
- **[Consumer Contract Tests Best Practices](https://smartbear.com/blog/consumer-driven-contract-testing/)** — best practices Pact
---

## Consumer-driven vs provider-driven contracts

Pact jest narzędziem consumer-driven contract testing. Konsument opisuje, jakiego requestu i response potrzebuje, a provider weryfikuje, czy nadal spełnia ten kontrakt.

To różni się od podejścia provider-driven, gdzie provider publikuje OpenAPI i konsumenci dopasowują się do specyfikacji. Oba podejścia są wartościowe:

| Podejście | Zaleta | Ryzyko |
|---|---|---|
| OpenAPI/provider-driven | pełny opis API | nie zawsze pokazuje realne użycie konsumentów |
| Pact/consumer-driven | chroni realne potrzeby klientów | wymaga dyscypliny publikacji i weryfikacji kontraktów |

## Pact Broker i can-i-deploy

Pact Broker przechowuje kontrakty i wyniki weryfikacji. Dzięki temu pipeline może odpowiedzieć na pytanie: czy ta wersja providera może zostać wdrożona bez zepsucia znanych konsumentów?

W praktyce proces wygląda tak:

1. Konsument uruchamia testy i publikuje pact.
2. Provider pobiera pact i weryfikuje go przeciw swojej implementacji.
3. Wynik trafia do brokera.
4. `can-i-deploy` decyduje, czy wersja może iść dalej.

## Typowe błędy Pact

- kontrakty opisują zbyt dużo pól nieużywanych przez konsumenta;
- mock providera w teście konsumenta nie odpowiada realnej semantyce;
- provider nie uruchamia weryfikacji w CI;
- brak danych testowych do provider verification;
- pacty są publikowane, ale nikt nie używa `can-i-deploy`.

## Checklista Pact

- Czy kontrakt opisuje realne użycie konsumenta?
- Czy provider verification działa w CI?
- Czy dane providera są deterministyczne?
- Czy kontrakty są wersjonowane?
- Czy deployment używa informacji z brokera?

## 📘 Suplement Inżynieryjny 2026: Testy Kontraktowe i Zarządzanie API (Pact)
*Inspiracja: „Scalable Test Automation with Playwright” (2026), Chapter 10*
*   **Consumer-Driven Contracts**: Używaj narzędzi takich jak Pact obok tradycyjnych testów API, aby zapewnić, że zmiany na backendzie nie popsują integracji u konsumentów (frontend, mikroserwisy), tworząc automatyczny gatekeeper w CI/CD.
