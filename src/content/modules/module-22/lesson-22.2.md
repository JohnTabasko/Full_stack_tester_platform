# Architektura Mikroserwisowa dla Testerów — Mapowanie, Kontrakty i Strategia Testów

> **Perspektywa Full Stack Testera**
> Proces zamówienia w systemie e-commerce przechodzi przez usługę koszyka, płatności, magazynu, faktur i powiadomień — każda z własną bazą danych, własnym API i własnym cyclem release. Testując tylko jedną usługę, nie wiesz, czy cały proces biznesowy działa. Testując wszystkie naraz, nie wiesz, która usługa zawiodła. W tej lekcji zdobędziesz umiejętności mapowania zależności między usługami, definiowania granic testów i wyboru właściwej strategii testowej dla systemu rozproszonego.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Mapować** zależności między usługami w przepływie biznesowym
- **Definiować** granice usług i ich kontraktów API/eventów
- **Projektować** piramidę testów dla systemu rozproszonego
- **Używać** dublerów (stubs/mocks) bezpiecznie w testach jednostkowych
- **Rozróżniać** kiedy używać stubów, a kiedy prawdziwych usług w testach integracyjnych

---

## 1. Mikroserwisy jako system zależności

### 1.1 Mapa przepływu zamówienia

```mermaid
graph TD
    A[checkout-api] -->|HTTP| B[cart-service]
    A -->|Event: OrderCreated| C[payment-service]
    B -->|Event: OrderCreated| C
    C -->|Event: PaymentCaptured| D[inventory-service]
    C -->|Event: PaymentCaptured| E[invoice-service]
    D -->|Event: InventoryReserved| E
    E -->|Event: InvoiceIssued| F[notification-service]
    F -->|Email/SMS| G[Customer]
    
    style A fill:#e3f2fd
    style C fill:#fff3e0
    style D fill:#e8f5e9
    style E fill:#fce4ec
```

### 1.2 Tabela zależności i ryzyk

| Usługa | Zależy od | Publikuje | Krytyczne ryzyko |
|--------|-----------|-----------|-----------------|
| **checkout-api** | cart-service | OrderCreated | Zamówienie bez koszyka |
| **payment-service** | external Stripe | PaymentCaptured | Płatność nie przetworzona |
| **inventory-service** | payment-service | InventoryReserved | Sprzedaż bez rezerwacji |
| **invoice-service** | payment + inventory | InvoiceIssued | Faktura bez płatności |
| **notification-service** | invoice-service | - | Brak powiadomienia |

---

## 2. Granice usług — kontrakt jako definicja

### 2.1 Granica = odpowiedzialność domenowa

```
┌──────────────────────────────┐
│        checkout-api          │
│  Odpowiedzialność:           │
│  - Inicjacja zamówienia      │
│  - Walidacja koszyka         │
│  - Orchestracja płatności    │
│                              │
│  Kontrakt wejścia:           │
│  POST /checkout/finalize     │
│  Kontrakt wyjścia:           │
│  Event: OrderCreated         │
└──────────────────────────────┘
              │
              ▼
┌──────────────────────────────┐
│       payment-service        │
│  Odpowiedzialność:           │
│  - Przetwarzanie płatności   │
│  - Komunikacja ze Stripe     │
│  - Idempotencja              │
│                              │
│  Kontrakt wejścia:           │
│  Event: OrderCreated         │
│  Kontrakt wyjścia:           │
│  Event: PaymentCaptured      │
└──────────────────────────────┘
```

### 2.2 Test kontraktu między usługami

```typescript
// tests/contracts/checkout-payment.contract.spec.ts
import { test, expect, request as apiRequest } from '@playwright/test';

// Kontrakt: checkout-api → payment-service
// checkout-api PUBLIKUJE OrderCreated
// payment-service KONSUMUJE OrderCreated

test.describe('Checkout → Payment Contract', () => {
  
  test('checkout publishes OrderCreated with required fields', async ({ page }) => {
    const correlationId = `contract-test-${Date.now()}`;
    
    // Setup: dodaj produkt do koszyka
    await page.goto('/products/42');
    await page.click('button:has-text("Dodaj do koszyka")');
    
    // Act: finalizuj zamówienie
    await page.goto('/checkout');
    await page.fill('#card-number', '4242424242424242');
    await page.click('button:has-text("Zapłać")');
    
    // Poczekaj na odpowiedź HTTP (sukces)
    await expect(page.getByText('Zamówienie przyjęte')).toBeVisible({ timeout: 15000 });
    
    // Weryfikacja kontraktu: event ma wszystkie wymagane pola
    const event = await waitForEvent(
      'orders',
      (e: any) => e.eventType === 'OrderCreated' && e.correlationId === correlationId,
      10000
    );
    
    // Kontrakt mówi: event musi zawierać
    expect(event).toMatchObject({
      eventType: 'OrderCreated',
      eventVersion: '1.0',
      payload: {
        orderId: expect.any(String),
        customerId: expect.any(Number),
        items: expect.arrayContaining([
          expect.objectContaining({ productId: expect.any(Number), quantity: expect.any(Number) }),
        ]),
        totalAmount: expect.any(Number),
        currency: 'PLN',
      },
    });
    
    console.log(`OrderCreated event published: ${event.eventId}`);
  });
  
  test('payment-service consumes OrderCreated and publishes PaymentCaptured', async ({ request }) => {
    // Symuluj EventBridge / Kafka consumer
    // Alternatywnie: wywołaj payment-service напрямую z mock payload
    
    const mockOrderEvent = {
      eventType: 'OrderCreated',
      eventVersion: '1.0',
      correlationId: `contract-${Date.now()}`,
      payload: {
        orderId: 'ORD-TEST-001',
        customerId: 1001,
        items: [{ productId: 42, quantity: 2, price: 99.99 }],
        totalAmount: 199.98,
        currency: 'PLN',
      },
    };
    
    // Act: wyślij event do payment-service (przez test consumer)
    await publishToKafka('orders', mockOrderEvent);
    
    // Assert: payment-service publikuje PaymentCaptured
    const paymentEvent = await waitForEvent(
      'payments',
      (e: any) => 
        e.eventType === 'PaymentCaptured' &&
        e.payload.orderId === 'ORD-TEST-001',
      20000
    );
    
    expect(paymentEvent.payload.amount).toBe(199.98);
    expect(paymentEvent.payload.currency).toBe('PLN');
    expect(paymentEvent.correlationId).toBe(mockOrderEvent.correlationId);
  });
});
```

---

## 3. Piramida testów w systemie rozproszonym

### 3.1 Strategia wielopoziomowa

```
     ▲
    /E\  E2E Tests (3-5 tests per critical flow)
   /2E2\  - End-to-end przez wszystkie usługi
  /─────\  - Playwright + realne bazy i kolejki
     │
    /I\  Integration Tests (10-20 tests per service)
   /NTE\  - Testy kontraktów między usługami
  /─────\  - Stubs dla usług zewnętrznych
     │
    /U \  Unit Tests (50-100 tests per service)
   /NITS\  - Logika biznesowa w izolacji
  /──────\  - Mocks dla wszystkich zależności
     │
   Service A  │  Service B  │  Service C
```

### 3.2 Kryteria wyboru poziomu testów

| Scenariusz | Poziom | Uzasadnienie |
|------------|--------|-------------|
| Logika walidacji płatności | Unit | Szybki feedback, izolacja |
| Kontrakt checkout → payment | Integration | Weryfikacja interakcji |
| Cały przepływ zamówienia | E2E | Pewność, że wszystko działa |
| Awaria payment-service | Chaos | Weryfikacja resilience |
| Zmiana w API invoice-service | Contract | Czy zmiana nie psuje konsumentów |

### 3.3 Przykładowa konfiguracja testów integracyjnych

```typescript
// tests/integration/shared-services.setup.ts
import { test as base } from '@playwright/test';

// Konfiguracja środowiska integracyjnego z kontrolowanymi zależnościami
export const integrationTest = base.extend<{
  services: {
    checkout: string;
    payment: string;
    inventory: string;
    invoice: string;
  };
  db: DatabaseConnection;
  kafka: KafkaConnection;
}>({
  // Użyj staging environment z kontrolowanymi wersjami
  services: {
    checkout: process.env.CHECKOUT_API_URL || 'http://checkout-staging:3000',
    payment: process.env.PAYMENT_API_URL || 'http://payment-staging:3001',
    inventory: process.env.INVENTORY_API_URL || 'http://inventory-staging:3002',
    invoice: process.env.INVOICE_API_URL || 'http://invoice-staging:3003',
  },
  
  // Każdy test ma izolowaną bazę danych z seedem
  db: async ({}, use) => {
    const db = await setupIsolatedDatabase('test_integration_' + Date.now());
    await seedTestData(db);
    await use(db);
    await cleanupDatabase(db);
  },
  
  // Kafka z test topic
  kafka: async ({}, use) => {
    const kafka = new Kafka({
      clientId: 'integration-test',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    });
    
    // Ustaw offset na początek topicu dla czystego stanu
    const admin = kafka.admin();
    await admin.connect();
    await admin.setOffsets({ topic: 'test-payments', groupId: 'test', offsets: [{ offset: '0' }] });
    await admin.disconnect();
    
    await use(kafka);
    await kafka.admin().disconnect();
  },
});
```

---

## 4. Dublerzy i service virtualization

### 4.1 Kiedy używać stubów vs prawdziwych usług

| Sytuacja | Stub/Mock | Prawdziwa usługa |
|----------|-----------|-----------------|
| Test jednostkowy funkcji w izolacji | ✅ Tak | ❌ Nie |
| Test kontraktu API między usługami | ❌ Nie | ✅ Tak |
| Test E2E krytycznego przepływu | ❌ Nie | ✅ Tak |
| Usługa zewnętrzna (Stripe, SendGrid) | ✅ Tak | ❌ Nie |
| Niedostępna usługa w środowisku | ✅ Tak | ❌ Nie |
| Test resilience (awaria usługi) | ✅ Tak (symulacja awarii) | ❌ Nie |

### 4.2 WireMock — service virtualization

```typescript
// tests/mocks/stripe.mock.ts
import { Server } from 'wiremock';

export async function setupStripeMock(): Promise<Server> {
  const server = new Server(9090);
  
  // Mock sukcesu płatności
  server.stub({
    request: {
      method: 'POST',
      urlPattern: '/v1/charges',
    },
    response: {
      status: 200,
      json: {
        id: 'ch_mock_123',
        status: 'succeeded',
        amount: 19999,  // w centach
        currency: 'pln',
        payment_method: 'pm_mock_card',
        created: Date.now(),
      },
    },
  });
  
  // Mock błędu karty
  server.stub({
    request: {
      method: 'POST',
      urlPattern: '/v1/charges',
      bodyPatterns: [{ contains: 'declined_card' }],
    },
    response: {
      status: 402,
      json: {
        error: {
          code: 'card_declined',
          message: 'Your card was declined',
        },
      },
    },
  });
  
  await server.start();
  return server;
}

// Użycie w teście
test('payment succeeds with mocked Stripe', async ({ page }) => {
  const mockServer = await setupStripeMock();
  
  try {
    process.env.STRIPE_API_URL = 'http://localhost:9090';
    
    await page.goto('/checkout');
    await page.fill('#card-number', '4242424242424242');
    await page.click('#pay-button');
    
    await expect(page.getByText('Płatność zakończona')).toBeVisible({ timeout: 10000 });
  } finally {
    await mockServer.stop();
    delete process.env.STRIPE_API_URL;
  }
});
```

### 4.3 Niebezpieczeństwo stubów — ukryte problemy integracji

```typescript
// ❌ ŹLE: Stub zbyt uproszczony — ukrywa realne problemy
const mockStripeSuccess = {
  id: 'ch_123',
  status: 'succeeded',  // W prawdziwym Stripe to 'succeeded' lub 'pending'
};

// ✅ DOBRZE: Stub z walidacją — naśladuje prawdziwe zachowanie
const realisticStripeResponse = (amount: number, cardType: string) => {
  if (cardType === 'decline') {
    throw new Error({ code: 'card_declined', status: 402 });
  }
  
  return {
    id: `ch_${crypto.randomUUID()}`,
    status: amount > 10000 ? 'pending' : 'succeeded',  // Realne zachowanie Stripe
    amount,
    currency: 'pln',
    // ... wszystkie pola z prawdziwej odpowiedzi Stripe
  };
};
```

---

## 5. Środowiska integracyjne

### 5.1 Wymagania środowiska

| Element | Wymaganie | Dlaczego |
|---------|-----------|----------|
| **Kontrolowane wersje** | Lock na wersje usług (git SHA lub tag) | Powtarzalność |
| **Izolowane dane** | Każdy test ma osobną bazę | Brak konfliktów |
| **Deterministyczne dane** | Seed jest idempotentny | Spójność |
| **Czyste kolejki** | Offset reset przed testem | Brak „starych" wiadomości |
| **Monitoring** | Metryki z każdej usługi | Diagnostyka |

### 5.2 Docker Compose dla środowiska integracyjnego

```yaml
# docker-compose.integration.yml
services:
  checkout-api:
    image: checkout-api:${CHECKOUT_VERSION:-latest}
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://test:test@postgres:5432/checkout_test
      - KAFKA_BROKER=kafka:9092
      - PAYMENT_API_URL=http://payment-service:3001
    depends_on:
      - postgres
      - kafka
      
  payment-service:
    image: payment-service:${PAYMENT_VERSION:-latest}
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://test:test@postgres:5432/payment_test
      - KAFKA_BROKER=kafka:9092
      - STRIPE_API_KEY=${STRIPE_TEST_KEY}
      
  inventory-service:
    image: inventory-service:${INVENTORY_VERSION:-latest}
    ports:
      - "3002:3002"
    environment:
      - DATABASE_URL=postgresql://test:test@postgres:5432/inventory_test
      - KAFKA_BROKER=kafka:9092
      
  kafka:
    image: confluentinc/cp-kafka:7.5.0
    ports:
      - "9092:9092"
    environment:
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'true'
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test

networks:
  default:
    name: integration-network
```

### 5.3 Skrypt uruchomienia środowiska

```bash
# scripts/start-integration-env.sh
#!/bin/bash
set -e

# Ustaw wersje (z env lub domyślne)
export CHECKOUT_VERSION=${CHECKOUT_VERSION:-$(git rev-parse --short HEAD)}
export PAYMENT_VERSION=${PAYMENT_VERSION:-latest}
export INVENTORY_VERSION=${INVENTORY_VERSION:-latest}

echo "Starting integration environment..."
echo "  checkout-api: $CHECKOUT_VERSION"
echo "  payment-service: $PAYMENT_VERSION"

docker-compose -f docker-compose.integration.yml up -d

# Poczekaj na gotowość usług
for service in checkout-api payment-service inventory-service; do
  echo "Waiting for $service..."
  for i in {1..30}; do
    if curl -sf "http://localhost:${PORT:-3000}/health" > /dev/null 2>&1; then
      echo "  ✓ $service is ready"
      break
    fi
    sleep 2
  done
done

echo "✓ All services ready. Run tests with:"
echo "  BASE_URL=http://localhost:3000 npm test"
```

---

## Perspektywa Full Stack Testera

W systemie rozproszonym rola testera jest krytyczna, ponieważ:

- **Mapowanie zależności** — wiesz, jakie usługi są dotknięte zmianą
- **Testy kontraktów** — weryfikujesz, że zmiana w jednej usłudze nie psuje innych
- **Strategia wielopoziomowa** — wiesz, kiedy testować w izolacji, a kiedy end-to-end
- **Środowiska** — rozumienie, jak kontrolować wersje i dane w testach integracyjnych

Pamiętaj: w systemie mikroserwisowym test jednostkowy pojedynczej usługi to dopiero początek. Prawdziwa wartość to testy, które weryfikują przepływy biznesowe przez wiele usług.

---

## Podsumowanie

- **Mapa zależności** — wizualizacja przepływów między usługami jest fundamentem testowania
- **Granice usług** — kontrakt = to, co usługa akceptuje na wejściu i produkuje na wyjściu
- **Piramida testów** — unit → integration → E2E, każdy poziom ma swoje miejsce
- **Dublerzy** — używaj do izolacji i symulacji awarii, ale nie ukrywaj realnych problemów
- **Środowiska integracyjne** — kontrolowane wersje, izolowane dane, deterministyczny seed

---

## Linki i źródła

- **[Microservices Testing Strategies — Tito](https://martinfowler.com/articles/microservices-testing.html)** — kompletny przewodnik po strategiach testowania mikroserwisów
- **[Contract Testing — Pact](https://docs.pact.io/)** — Consumer-Driven Contract Testing
- **[Service Virtualization — WireMock](https://wiremock.org/)** — mockowanie usług zewnętrznych
- **[Testcontainers](https://testcontainers.com/)** — konteneryzowane środowiska testowe
- **[Architecture of a Databaseless Integration Test Environment](https://github.com/testcontainers)** — użycie Testcontainers w CI