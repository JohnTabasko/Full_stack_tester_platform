# Testowanie Kolejek i Zdarzeń — Integracyjna Weryfikacja Systemów Rozproszonych

> **Perspektywa Full Stack Testera**
> W systemie monolitycznym: wywołujesz endpoint → dostajesz odpowiedź → testujesz. Proste. W systemie rozproszonym: wywołujesz endpoint → system publikuje zdarzenie → konsument przetwarza → inne usługi reagują → wynik pojawia się po sekundach, minutach, a czasem godzinach. Test UI widzi tylko końcowy objaw. Aby wiedzieć, co się stało po drodze, musisz rozumieć Kafka, RabbitMQ, semantykę dostarczania i idempotencję. W tej lekcji zdobędziesz umiejętności testowania procesów opartych na komunikatach — od weryfikacji publikacji zdarzenia, przez sprawdzanie Dead Letter Queue, po asercję stanu końcowego z limitem czasu.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Rozumieć** architekturę publish-subscribe i różnice między Kafka, RabbitMQ i SQS
- **Weryfikować** publikację i konsumpcję komunikatów w testach
- **Testować** idempotencję i obsługę duplikatów
- **Sprawdzać** Dead Letter Queue przy błędnych komunikatach
- **Oczekiwać** na stan końcowy z limitem czasu i diagnostyką
- **Powiązywać** correlation ID między żądaniem HTTP a zdarzeniem w kolejce

---

## Wprowadzenie — dlaczego testowanie kolejek jest trudniejsze

W testach synchronicznych (HTTP) masz:
- Wywołanie → natychmiastowa odpowiedź → łatwa asercja

W testach asynchronicznych (kolejki) masz:
- Wywołanie → publikacja komunikatu → (milisekundy/minuty) → przetworzenie → stan końcowy

**Ryzyka specyficzne dla kolejek:**
- Komunikat nigdy nie dochodzi (network partition)
- Komunikat dochodzi wielokrotnie (brak idempotencji)
- Kolejność nie jest gwarantowana (chyba że przez partycję)
- Konsument pada, komunikat wraca do kolejki
- Stan końcowy pojawia się po godzinach (eventual consistency)

---

## Sytuacja przewodnia — po opłaceniu zamówienia

Po opłaceniu zamówienia system publikuje `PaymentCaptured`. Magazyn musi zarezerwować produkty. Faktury muszą wystawić dokument. Każda usługa konsumuje to samo zdarzenie. Test musi zweryfikować cały łańcuch, nie tylko odpowiedź HTTP.

---

## 1. Architektura kolejek — Kafka, RabbitMQ, SQS

### 1.1 Porównanie

| Aspekt | Apache Kafka | RabbitMQ | AWS SQS |
|--------|-------------|----------|---------|
| **Model** | Log append-only | Kolejka FIFO/classic | Kolejka fully-managed |
| **Kolejność** | W obrębie partycji | FIFO (opcjonalnie) | Brak gwarancji |
| **Duplikaty** | Możliwe (at-least-once) | Możliwe | Możliwe (ack timeout) |
| **Retention** | Konfigurowalne (dni) | Po ack | 14 dni max |
| **Replay** | Tak (offset reset) | Nie | Nie |
| **Consumer groups** | Tak (load balancing) | Tak (shared queue) |隐式 |
| **Throughput** | Bardzo wysoki | Średni | Wysoki (managed) |

### 1.2 Schema zdarzenia PaymentCaptured

```typescript
// models/payment-captured.event.ts
interface PaymentCapturedEvent {
  eventId: string;           // UUID
  eventType: 'PaymentCaptured';
  eventVersion: '1.0';
  timestamp: string;         // ISO 8601
  correlationId: string;     // Z żądania HTTP
  producer: string;          // 'payment-service'
  
  payload: {
    paymentId: string;
    orderId: string;
    amount: number;
    currency: string;
    method: 'CARD' | 'BLIK' | 'TRANSFER';
    capturedAt: string;
    transactionRef: string;
  };
  
  metadata: {
    traceId: string;
    spanId: string;
    environment: 'production' | 'staging' | 'test';
  };
}
```

---

## 2. Testowanie publikacji komunikatów

### 2.1 Helper do nasłuchiwania Kafka/RabbitMQ

```typescript
// tests/helpers/event-helper.ts
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { MessageQueue } from 'amqplib';

export class EventWatcher {
  private kafka: Kafka;
  private consumer: Consumer;
  private messages: Map<string, any[]> = new Map();
  
  constructor() {
    this.kafka = new Kafka({
      clientId: 'playwright-test-watcher',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      ssl: process.env.KAFKA_SSL === 'true',
      sasl: {
        mechanism: 'plain',
        username: process.env.KAFKA_USER || '',
        password: process.env.KAFKA_PASSWORD || '',
      },
    });
    
    this.consumer = this.kafka.consumer({ 
      groupId: `test-watcher-${Date.now()}`,
    });
  }
  
  async subscribe(topic: string): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic, fromBeginning: false });
  }
  
  async waitForEvent<T>(
    topic: string,
    predicate: (event: T) => boolean,
    timeoutMs: number = 15000
  ): Promise<T> {
    await this.subscribe(topic);
    
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout waiting for event on ${topic}`)), timeoutMs);
    });
    
    const eventPromise = new Promise<T>((resolve) => {
      this.consumer.run({
        eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
          if (!message.value) return;
          
          const event = JSON.parse(message.value.toString()) as T;
          
          if (predicate(event)) {
            // Zapisz wszystkie wiadomości z tego topic dla debugowania
            if (!this.messages.has(topic)) {
              this.messages.set(topic, []);
            }
            this.messages.get(topic)!.push(event);
            
            resolve(event);
          }
        },
      });
    });
    
    return Promise.race([eventPromise, timeout]);
  }
  
  async getAllMessages(topic: string): Promise<any[]> {
    return this.messages.get(topic) || [];
  }
  
  async cleanup(): Promise<void> {
    await this.consumer.disconnect();
  }
}

// Alternatywa dla RabbitMQ
export class RabbitMQWatcher {
  private connection: any;
  private channel: any;
  private messages: any[] = [];
  
  async connect(url: string): Promise<void> {
    this.connection = await amqplib.connect(url);
    this.channel = await this.connection.createChannel();
  }
  
  async waitForMessage(
    queue: string,
    predicate: (msg: any) => boolean,
    timeoutMs: number = 15000
  ): Promise<any> {
    const consumed: any[] = [];
    
    await this.channel.consume(queue, (msg: any) => {
      if (!msg) return;
      const content = JSON.parse(msg.content.toString());
      consumed.push(content);
      
      if (predicate(content)) {
        this.channel.ack(msg);
      } else {
        // Nack — zwróć do kolejki (dla innych konsumentów)
        this.channel.nack(msg, false, true);
      }
    }, { noAck: false });
    
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        const found = consumed.find(predicate);
        if (found) {
          clearInterval(interval);
          resolve(found);
        }
      }, 100);
      
      setTimeout(() => {
        clearInterval(interval);
        reject(new Error(`Timeout waiting for message in queue ${queue}`));
      }, timeoutMs);
    });
  }
}
```

### 2.2 Test publikacji i konsumpcji

```typescript
// tests/integration/payment-captured-flow.spec.ts
import { test, expect, request as apiRequest } from '@playwright/test';
import { EventWatcher } from '../helpers/event-helper';

test.describe('Payment Captured — Event Flow', () => {
  let watcher: EventWatcher;
  
  test.beforeAll(async () => {
    watcher = new EventWatcher();
  });
  
  test.afterAll(async () => {
    await watcher.cleanup();
  });
  
  test('payment capture publishes event consumed by multiple services', async ({ page }) => {
    const correlationId = `e2e-${Date.now()}`;
    await page.context().setExtraHTTPHeaders({ 'X-Correlation-ID': correlationId });
    
    // 1. Otwórz checkout i złóż zamówienie
    await page.goto('/checkout');
    await page.fill('#card-number', '4242424242424242');
    await page.fill('#expiry', '12/28');
    await page.fill('#cvv', '123');
    await page.click('#pay-button');
    
    // 2. Poczekaj na success UI
    await expect(page.getByText('Płatność zakończona')).toBeVisible({ timeout: 15000 });
    
    // 3. Pobierz order ID ze strony
    const orderId = await page.locator('[data-testid="order-id"]').textContent();
    
    // 4. Weryfikuj zdarzenie w Kafka
    const event = await watcher.waitForEvent(
      'payments',
      (e: any) => 
        e.eventType === 'PaymentCaptured' &&
        e.payload.orderId === orderId &&
        e.correlationId === correlationId,
      15000
    );
    
    // 5. Asercje na evencie
    expect(event.payload.amount).toBeGreaterThan(0);
    expect(event.payload.currency).toBe('PLN');
    expect(event.metadata.environment).toBeDefined();
    
    console.log(`Event captured: ${event.eventId} for order ${event.payload.orderId}`);
  });
  
  test('payment event triggers inventory reservation', async ({ request }) => {
    const correlationId = `e2e-inventory-${Date.now()}`;
    
    // Wyślij żądanie z correlation ID
    const response = await request.post('/api/checkout/finalize', {
      data: { orderId: 12345, paymentMethod: 'CARD' },
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
        'X-Correlation-ID': correlationId,
      },
    });
    
    expect(response.status()).toBe(200);
    
    // Poczekaj na PaymentCaptured
    const paymentEvent = await watcher.waitForEvent(
      'payments',
      (e: any) => e.correlationId === correlationId && e.eventType === 'PaymentCaptured',
      20000
    );
    
    // Poczekaj na InventoryReserved (kolejne zdarzenie)
    const inventoryEvent = await watcher.waitForEvent(
      'inventory',
      (e: any) => 
        e.eventType === 'InventoryReserved' &&
        e.payload.orderId === paymentEvent.payload.orderId,
      30000
    );
    
    expect(inventoryEvent.payload.reserved).toBe(true);
    expect(inventoryEvent.payload.items.length).toBeGreaterThan(0);
  });
});
```

---

## 3. Testowanie idempotencji i duplikatów

### 3.1 Scenariusz: konsument przetwarza duplikat

```typescript
test('consumer handles duplicate event without side effects', async ({ page }) => {
  const correlationId = `e2e-dup-${Date.now()}`;
  
  // Utwórz zamówienie
  await page.goto('/checkout');
  await page.fill('#card-number', '4242424242424242');
  await page.click('#pay-button');
  await expect(page.getByText('Płatność zakończona')).toBeVisible({ timeout: 10000 });
  
  const orderId = await page.locator('[data-testid="order-id"]').textContent();
  
  // Symuluj ponowne przetworzenie tego samego zdarzenia (np. retry)
  await injectDuplicateEvent({
    topic: 'payments',
    event: {
      eventId: `duplicate-${Date.now()}`,
      eventType: 'PaymentCaptured',
      payload: {
        orderId,
        amount: 199.99,
        // ... reszta payload
      },
      correlationId,  // Ten sam correlation ID!
    },
  });
  
  // Poczekaj na przetworzenie ( retry)
  await page.waitForTimeout(5000);
  
  // Sprawdź stan końcowy — nie powinien się podwoić!
  const invoices = await db.query(
    'SELECT COUNT(*) FROM invoices WHERE order_id = $1',
    [orderId]
  );
  
  // Powinien być dokładnie 1 faktura, nie 2
  expect(parseInt(invoices.rows[0].count)).toBe(1);
  
  console.log('Idempotency verified: duplicate event did not create duplicate invoice');
});
```

### 3.2 Weryfikacja idempotencji przez API

```typescript
test('idempotent payment capture — double submission has no effect', async ({ request }) => {
  const orderId = 9999;
  
  // Pierwsza płatność
  const response1 = await request.post('/api/payments/capture', {
    data: { orderId, paymentMethod: 'CARD' },
    headers: { 'Authorization': `Bearer ${process.env.API_TOKEN}` },
    headers: { 'X-Idempotency-Key': `idem-${Date.now()}` },  // Klucz idempotencji
  });
  
  const status1 = response1.status();
  
  // Druga płatność z tym samym kluczem
  const response2 = await request.post('/api/payments/capture', {
    data: { orderId, paymentMethod: 'CARD' },
    headers: { 'Authorization': `Bearer ${process.env.API_TOKEN}` },
    headers: { 'X-Idempotency-Key': `idem-${Date.now()}` },  // TEN SAM KLUCZ!
  });
  
  const status2 = response2.status();
  
  // Obie odpowiedzi powinny być identyczne (druga = cached response)
  expect(status2).toBe(status1);
  
  // Tylko jedna faktura wystawiona
  const invoiceCount = await db.getValue<number>(
    'SELECT COUNT(*) FROM invoices WHERE order_id = $1',
    [orderId]
  );
  
  expect(invoiceCount).toBe(1);
});
```

---

## 4. Dead Letter Queue — błędne komunikaty

### 4.1 Test sprawdzający DLQ

```typescript
test('failed message goes to DLQ with error details', async ({ request }) => {
  // Wyślij komunikat z nieprawidłowym payload (brak wymaganego pola)
  await publishToKafka('inventory', {
    eventType: 'InventoryReserve',
    payload: {
      orderId: 99999,
      // missing: items[], customerId — to spowoduje błąd walidacji
    },
  });
  
  // Poczekaj na przetworzenie i błąd
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Sprawdź DLQ
  const dlqMessages = await readKafkaTopic('inventory.DLQ');
  
  expect(dlqMessages.length).toBeGreaterThan(0);
  
  const dlqMessage = dlqMessages[0];
  expect(dlqMessage.error).toBeDefined();
  expect(dlqMessage.error.code).toBe('VALIDATION_ERROR');
  expect(dlqMessage.originalTopic).toBe('inventory');
  expect(dlqMessage.timestamp).toBeDefined();
  
  console.log(`Message in DLQ: ${JSON.stringify(dlqMessage, null, 2)}`);
});
```

### 4.2 Monitorowanie DLQ w testach CI

```yaml
# .github/workflows/dlx-monitor.yml
- name: Check DLQ depth
  run: |
    DLQ_COUNT=$(kafka-consumer-groups.sh --bootstrap-server $KAFKA_BROKER \
      --group dlq-processor --describe | grep inventory.DLQ | awk '{print $4}')
    
    echo "DLQ depth for inventory: $DLQ_COUNT"
    
    if [ "$DLQ_COUNT" -gt 10 ]; then
      echo "⚠️ DLQ has $DLQ_COUNT messages — investigate before proceeding"
      exit 1
    fi
```

---

## 5. Oczekiwanie na stan końcowy (Eventually Consistent)

### 5.1 Helper expectEventually

```typescript
// tests/helpers/eventually.ts
export async function expectEventually<T>(
  assertion: () => Promise<T>,
  options: {
    timeoutMs?: number;
    intervalMs?: number;
    description?: string;
  } = {}
): Promise<T> {
  const { timeoutMs = 30000, intervalMs = 1000, description = 'condition' } = options;
  
  const deadline = Date.now() + timeoutMs;
  let lastError: Error | null = null;
  
  while (Date.now() < deadline) {
    try {
      const result = await assertion();
      return result;
    } catch (error) {
      lastError = error as Error;
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
  
  throw new Error(
    `expectEventually: condition "${description}" not met within ${timeoutMs}ms. ` +
    `Last error: ${lastError?.message}`
  );
}

// Użycie
test('invoice is issued within 60 seconds of payment', async ({ page }) => {
  const orderId = await createOrderAndPay(page);
  
  const invoice = await expectEventually(
    () => db.getOne<{ id: number; status: string }>(
      'SELECT id, status FROM invoices WHERE order_id = $1 AND status = $2',
      [orderId, 'ISSUED']
    ),
    { 
      timeoutMs: 60000,
      intervalMs: 2000,
      description: 'Invoice status = ISSUED',
    }
  );
  
  expect(invoice).not.toBeNull();
  expect(invoice!.status).toBe('ISSUED');
});
```

### 5.2 Integracja z Playwright

```typescript
test('full order-to-invoice flow completes within SLA', async ({ page }) => {
  const startTime = Date.now();
  
  // Wykonaj checkout
  await page.goto('/checkout');
  await page.fill('#card-number', '4242424242424242');
  await page.click('#pay-button');
  await expect(page.getByText('Płatność zakończona')).toBeVisible({ timeout: 15000 });
  
  const orderId = await page.locator('[data-testid="order-id"]').textContent();
  
  // Oczekuj na fakturę (do 60s)
  const invoice = await expectEventually(
    async () => {
      const inv = await db.getOne<{ id: number; status: string }>(
        'SELECT id, status FROM invoices WHERE order_id = $1 AND status = $2',
        [orderId, 'ISSUED']
      );
      
      if (!inv) {
        throw new Error(`Invoice not yet issued for order ${orderId}`);
      }
      
      return inv;
    },
    { timeoutMs: 60000, description: 'invoice status = ISSUED' }
  );
  
  const totalTime = Date.now() - startTime;
  console.log(`Full flow completed in ${totalTime}ms`);
  
  // SLO: cały proces < 2 minuty
  expect(totalTime).toBeLessThan(120000);
  
  expect(invoice.status).toBe('ISSUED');
});
```

---

## Perspektywa Full Stack Testera

Testowanie kolejek wymaga myślenia w kategoriach czasu i stanu, nie tylko request-response. Kluczowe umiejętności:

- **Nasłuchiwanie** zdarzeń w topikach Kafka/RabbitMQ
- **Idempotencja** — konsument musi być bezpieczny przy duplikatach
- **Eventually consistent** — stan końcowy pojawia się z opóźnieniem, test musi na niego czekać
- **DLQ** — błędne komunikaty muszą mieć ścieżkę diagnostyczną

Pamiętaj: w systemie rozproszonym test UI to dopiero początek. Prawdziwa weryfikacja wymaga dostępu do kolejek, baz danych i trace.

---

## Podsumowanie

- **Kafka/RabbitMQ/SQS** — różne semantyki dostarczania, kolejności i duplikatów
- **EventWatcher** — helper do nasłuchiwania zdarzeń w testach
- **Correlation ID** — łączy żądanie HTTP z zdarzeniem w kolejce
- **Idempotencja** — konsument musi być bezpieczny przy wielokrotnym przetwarzaniu
- **DLQ** — ścieżka diagnostyczna dla błędnych komunikatów
- **expectEventually** — asercja stanu końcowego z limitem czasu

---

## Linki i źródła

- **[Kafka Documentation](https://kafka.apache.org/documentation/)** — wszystko o Apache Kafka
- **[RabbitMQ Documentation](https://www.rabbitmq.com/docs)** — RabbitMQ i AMQP
- **[AWS SQS Documentation](https://docs.aws.amazon.com/sqs/)** — Simple Queue Service
- **[Testing Event-Driven Systems — Confluent](https://www.confluent.io/blog/testing-event-driven-systems/)** — best practices
- **[Dead Letter Queues — AWS](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html)** — DLQ w SQS
- **[Idempotency — Stripe](https://stripe.com/blog/idempotent-requests)** — jak Stripe implementuje idempotencję