# Spójność Ostateczna i Procesy Biznesowe — Testowanie Stanów Rozproszonych

> **Perspektywa Full Stack Testera**
> Po opłaceniu zamówienia faktura może pojawić się po 5 sekundach, e-mail po 10, a raport w analytics po minucie. Test, który sprawdza tylko odpowiedź HTTP na etapie płatności, nie weryfikuje całego procesu biznesowego. Spójność ostateczna (eventual consistency) wymaga od testera myślenia w kategoriach stanów rozłożonych w czasie — i umiejętności oczekiwania na stan końcowy z limitem, logiką retry i diagnostyką. W tej lekcji zdobędziesz umiejętności testowania saga patterns, pollingu, correlation ID w procesach biznesowych i asercji stanów rozproszonych.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Testować** saga patterns z kompensacjami w przypadku błędu
- **Implementować** polling z limitem i interwałem
- **Używać** correlation ID do śledzenia procesu przez wiele usług
- **Asertywować** stan końcowy rozproszonego procesu
- **Projektować** testy dla procesów biznesowych z wieloma krokami

---

## Wprowadzenie — dlaczego testowanie eventual consistency jest trudne

W systemie synchronicznym: wywołujesz → natychmiast widzisz wynik. Proste.

W systemie asynchronicznym: wywołujesz → publikujesz zdarzenie → (tu mija czas) → konsument przetwarza → stan zmienia się → wynik gotowy.

**Pułapki:**
- Test sprawdza stan natychmiast → widzi „w trakcie" → fałszywy negatyw
- Test nie czeka na stan końcowy → wszystkie asercje przechodzą → fałszywy pozytyw
- Test nie ma correlation ID → nie wie, które żądanie śledzić

---

## 1. Spójność ostateczna — czym jest i jak ją testować

### 1.1 Model spójności

```
T=0:   Zamówienie złożone    [status: PENDING]
T=2s:  Płatność przechwycona  [status: PAID]         ← Pojawił się pierwszy sygnał
T=5s:  Magazyn zarezerwowany   [status: PROCESSING]   ← Kolejny sygnał
T=8s:  Faktura wystawiona      [status: INVOICED]     ← Dalej
T=15s: Email wysłany           [status: COMPLETED]    ← Stan końcowy!
```

Test, który sprawdza status po 1 sekundzie, widzi „PENDING". Test, który sprawdza po 10 sekundach, widzi „PROCESSING". Test, który czeka na „COMPLETED" z limitem 30s, w końcu widzi sukces.

### 1.2 expectEventually — helper do eventual consistency

```typescript
// tests/helpers/eventually.ts — rozszerzona wersja
export async function expectEventually<T>(
  assertion: () => Promise<T>,
  options: {
    timeoutMs?: number;
    intervalMs?: number;
    description?: string;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const { 
    timeoutMs = 30000, 
    intervalMs = 1000, 
    description = 'condition',
    onRetry,
  } = options;
  
  const deadline = Date.now() + timeoutMs;
  let attempts = 0;
  let lastError: Error | null = null;
  
  while (Date.now() < deadline) {
    attempts++;
    
    try {
      const result = await assertion();
      if (attempts > 1) {
        console.log(`✓ Condition met after ${attempts} attempts`);
      }
      return result;
    } catch (error) {
      lastError = error as Error;
      onRetry?.(attempts, lastError);
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
  
  throw new Error(
    `expectEventually: condition "${description}" not met within ${timeoutMs}ms ` +
    `(${attempts} attempts). Last error: ${lastError?.message}`
  );
}

// Użycie z reporterem
test('full order completion within SLA', async ({ page }) => {
  await page.goto('/checkout');
  await page.fill('#card-number', '4242424242424242');
  await page.click('#pay-button');
  await expect(page.getByText('Płatność zakończona')).toBeVisible({ timeout: 15000 });
  
  const orderId = await page.locator('[data-testid="order-id"]').textContent();
  
  // Oczekuj na COMPLETED z reporterem postępu
  const order = await expectEventually(
    async () => {
      const result = await db.getOne<{ status: string }>(
        'SELECT status FROM orders WHERE id = $1',
        [orderId]
      );
      
      if (!result) throw new Error('Order not found');
      if (result.status !== 'COMPLETED') {
        throw new Error(`Status is ${result.status}, waiting for COMPLETED`);
      }
      
      return result;
    },
    {
      timeoutMs: 60000,
      intervalMs: 2000,
      description: 'order status = COMPLETED',
      onRetry: (attempt, error) => {
        console.log(`  Attempt ${attempt}: ${error.message}`);
      },
    }
  );
  
  expect(order.status).toBe('COMPLETED');
  console.log(`Order ${orderId} completed within SLA`);
});
```

---

## 2. Sagas — orkiestracja procesów wielousługowych

### 2.1 Test saga pattern z kompensacją

```typescript
// tests/integration/order-saga.spec.ts
import { test, expect, request as apiRequest } from '@playwright/test';

test.describe('Order Saga — Full Business Process', () => {
  
  test('successful order saga: payment → inventory → invoice → notification', async ({ page }) => {
    const correlationId = `saga-${Date.now()}`;
    
    // Krok 1: Złóż zamówienie
    await page.goto('/checkout');
    await page.fill('#card-number', '4242424242424242');
    await page.click('#pay-button');
    await expect(page.getByText('Zamówienie przyjęte')).toBeVisible({ timeout: 10000 });
    
    const orderId = await page.locator('[data-testid="order-id"]').textContent();
    
    // Krok 2: Weryfikuj całą sagę — wszystkie kroki po kolei
    // Payment captured
    const paymentEvent = await waitForEvent('payments', (e: any) =>
      e.correlationId === correlationId && e.eventType === 'PaymentCaptured',
      15000
    );
    expect(paymentEvent.payload.orderId).toBe(orderId);
    
    // Inventory reserved
    const inventoryEvent = await waitForEvent('inventory', (e: any) =>
      e.payload.orderId === orderId && e.eventType === 'InventoryReserved',
      20000
    );
    expect(inventoryEvent.payload.reserved).toBe(true);
    
    // Invoice issued
    const invoiceEvent = await waitForEvent('invoices', (e: any) =>
      e.payload.orderId === orderId && e.eventType === 'InvoiceIssued',
      30000
    );
    expect(invoiceEvent.payload.status).toBe('ISSUED');
    
    // Email notification sent
    const notificationEvent = await waitForEvent('notifications', (e: any) =>
      e.payload.orderId === orderId && e.eventType === 'EmailSent',
      40000
    );
    expect(notificationEvent.payload.channel).toBe('EMAIL');
    
    // Stan końcowy zamówienia
    const finalOrder = await expectEventually(
      async () => {
        const order = await db.getOne<{ status: string; invoiceId: number | null }>(
          'SELECT status, invoice_id FROM orders WHERE id = $1',
          [orderId]
        );
        
        if (!order) throw new Error('Order not found');
        if (order.status !== 'COMPLETED') throw new Error(`Status: ${order.status}`);
        if (!order.invoiceId) throw new Error('No invoice created');
        
        return order;
      },
      { timeoutMs: 60000, description: 'order COMPLETED with invoice' }
    );
    
    expect(finalOrder.status).toBe('COMPLETED');
    console.log(`Saga completed for order ${orderId}`);
  });
  
  test('saga compensation: failed payment reverts inventory reservation', async ({ request }) => {
    const correlationId = `saga-comp-${Date.now()}`;
    
    // Symuluj failed payment przez ustawienie testowej flagi
    const response = await request.post('/api/orders/create', {
      data: {
        items: [{ productId: 42, quantity: 5 }],
        paymentMethod: 'CARD',
        simulatePaymentFailure: true,  // Test flag
      },
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
        'X-Correlation-ID': correlationId,
      },
    });
    
    // Zamówienie utworzone, ale payment failed
    const orderId = await response.json().then(r => r.orderId);
    
    // Poczekaj na kompensację (inventory rollback)
    const compensationEvent = await waitForEvent('inventory', (e: any) =>
      e.eventType === 'InventoryRolledBack' && e.payload.orderId === orderId,
      30000
    );
    
    expect(compensationEvent.payload.reason).toContain('payment_failed');
    expect(compensationEvent.payload.rollbackComplete).toBe(true);
    
    // Stan końcowy: zamówienie anulowane
    const order = await expectEventually(
      async () => {
        const o = await db.getOne<{ status: string }>(
          'SELECT status FROM orders WHERE id = $1',
          [orderId]
        );
        if (!o || o.status !== 'CANCELLED') throw new Error('Not cancelled yet');
        return o;
      },
      { timeoutMs: 40000 }
    );
    
    expect(order.status).toBe('CANCELLED');
    console.log('Compensation completed: inventory rolled back');
  });
});
```

---

## 3. Correlation ID w procesach biznesowych

### 3.1 Propagation correlation ID przez całą sagę

```typescript
// Helper propagujący correlation ID przez wszystkie usługi
async function executeOrderSaga(correlationId: string) {
  // Krok 1: Utwórz zamówienie
  const orderResponse = await api.post('/api/orders', {
    data: { items: [...], correlationId },
    headers: { 'X-Correlation-ID': correlationId },
  });
  
  const orderId = orderResponse.orderId;
  
  // Krok 2: Rozpocznij sagę
  await api.post('/api/orders/${orderId}/saga/start', {
    data: { correlationId },
    headers: { 'X-Correlation-ID': correlationId },
  });
  
  return { orderId, correlationId };
}

// Weryfikuj wszystkie zdarzenia mają ten sam correlation ID
async function verifySagaCorrelation(orderId: string, correlationId: string) {
  const events = await Promise.all([
    queryKafka('payments', { correlationId }),
    queryKafka('inventory', { correlationId }),
    queryKafka('invoices', { correlationId }),
    queryKafka('notifications', { correlationId }),
  ]);
  
  const allEvents = events.flat();
  
  // Wszystkie zdarzenia mają ten sam correlation ID
  const invalidEvents = allEvents.filter(e => e.correlationId !== correlationId);
  expect(invalidEvents).toHaveLength(0);
  
  console.log(`✓ All ${allEvents.length} events share correlation ID ${correlationId}`);
  
  // Kolejność zdarzeń
  const sortedEvents = allEvents.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  return sortedEvents;
}
```

---

## 4. Kompletna asercja stanu rozproszonego

### 4.1 Test weryfikujący pełny stan procesu

```typescript
test('full business process state verification', async ({ page }) => {
  // 1. Wykonaj akcję biznesową
  const correlationId = `full-state-${Date.now()}`;
  await page.context().setExtraHTTPHeaders({ 'X-Correlation-ID': correlationId });
  
  await page.goto('/checkout');
  await page.fill('#card-number', '4242424242424242');
  await page.click('#pay-button');
  await expect(page.getByText('Płatność zakończona')).toBeVisible({ timeout: 15000 });
  
  const orderId = await page.locator('[data-testid="order-id"]').textContent();
  
  // 2. Oczekuj na COMPLETED z pełną weryfikacją stanu
  await expectEventually(
    async () => {
      // Pobierz wszystkie dane równolegle
      const [order, invoice, emailLog, inventoryReservation] = await Promise.all([
        db.getOne<{ 
          status: string; 
          totalPrice: number; 
          paidAt: Date | null;
        }>('SELECT status, total_price, paid_at FROM orders WHERE id = $1', [orderId]),
        
        db.getOne<{ 
          id: number; 
          status: string; 
          amount: number;
        }>('SELECT id, status, amount FROM invoices WHERE order_id = $1', [orderId]),
        
        db.query<{ subject: string }>(
          'SELECT subject FROM email_logs WHERE correlation_id = $1',
          [correlationId]
        ),
        
        db.getOne<{ reserved: boolean; quantity: number }>(
          'SELECT reserved, quantity FROM inventory_reservations WHERE order_id = $1',
          [orderId]
        ),
      ]);
      
      // Waliduj wszystkie warunki naraz
      if (!order) throw new Error('Order not found');
      if (order.status !== 'COMPLETED') throw new Error(`Order status: ${order.status}`);
      if (!order.paidAt) throw new Error('Order not paid');
      if (!invoice) throw new Error('Invoice not found');
      if (invoice.status !== 'ISSUED') throw new Error(`Invoice status: ${invoice.status}`);
      if (invoice.amount !== order.totalPrice) throw new Error('Invoice amount mismatch');
      if (emailLog.rows.length === 0) throw new Error('No email sent');
      if (!inventoryReservation?.reserved) throw new Error('Inventory not reserved');
      
      // Wszystkie warunki spełnione!
      return { order, invoice, emailLog: emailLog.rows[0], inventoryReservation };
    },
    {
      timeoutMs: 90000,  // 90s dla pełnego procesu
      intervalMs: 2000,
      description: 'FULL state: order COMPLETED, invoice ISSUED, email sent, inventory reserved',
    }
  );
  
  console.log('✓ Full business process verified');
});
```

### 4.2 Dashboard stanu procesu w testach

```typescript
// Helper pokazujący aktualny stan procesu
async function getProcessState(orderId: string) {
  const [order, paymentEvents, invoice, inventory, notifications] = await Promise.all([
    db.getOne('SELECT * FROM orders WHERE id = $1', [orderId]),
    db.query('SELECT * FROM payment_events WHERE order_id = $1', [orderId]),
    db.getOne('SELECT * FROM invoices WHERE order_id = $1', [orderId]),
    db.getOne('SELECT * FROM inventory_reservations WHERE order_id = $1', [orderId]),
    db.query('SELECT * FROM notifications WHERE entity_id = $1', [orderId]),
  ]);
  
  const state = {
    order: order?.status,
    paymentEventsCount: paymentEvents.rows.length,
    invoice: invoice?.status,
    inventory: inventory?.reserved,
    notificationsCount: notifications.rows.length,
  };
  
  console.table(state);
  return state;
}

// Użycie w testach
test('debug process state', async ({ page }) => {
  const orderId = '12345';
  await getProcessState(orderId);  // Wyświetla aktualny stan
  
  // Potem kontynuuj test...
});
```

---

## Perspektywa Full Stack Testera

Testowanie eventual consistency wymaga od testera myślenia w kategoriach stanów rozłożonych w czasie. Kluczowe umiejętności:

- **Nie testuj przypadkowego momentu** — czekaj na stan końcowy
- **expectEventually** — asercja z limitem, interwałem i diagnostyką
- **Correlation ID** — łączy wszystkie zdarzenia w jeden proces
- **Sagas** — rozumiej, że proces biznesowy może mieć kompensacje
- **Kompletna asercja** — sprawdzaj WSZYSTKIE elementy stanu końcowego

Pamiętaj: test, który sprawdza tylko odpowiedź HTTP, testuje tylko powierzchnię systemu. Prawdziwa weryfikacja procesu biznesowego wymaga dostępu do wielu źródeł danych i umiejętności czekania na stan końcowy.

---

## Podsumowanie

- **Spójność ostateczna** — stan końcowy pojawia się po czasie; test musi na niego czekać
- **expectEventually** — asercja z timeoutem, interwałem i diagnostyką postępu
- **Sagas** — orkiestracja wielu usług; weryfikuj też kompensacje przy błędach
- **Correlation ID** — propagowany przez całą sagę; łączy wszystkie zdarzenia
- **Kompletna asercja stanu** — sprawdź wszystkie elementy procesu naraz, nie tylko UI

---

## Linki i Źródła

- **[Eventual Consistency — AWS](https://aws.amazon.com/blogs/database/tag/eventual-consistency/)** — eventual consistency w praktyce
- **[Saga Pattern — microservices.io](https://microservices.io/patterns/data/saga.html)** — saga jako pattern orkiestracji
- **[Choreography vs Orchestration](https://event driven.io/en/choreography_vs_orchestration/)** — dwa podejścia do koordynacji
- **[Testing Distributed Systems](https://github.com/apyc/awesome-testing/blob/main/distributed-systems.md)** — zbiór zasobów o testowaniu systemów rozproszonych
- **[Polling vs Webhooks](https://event driven.io/en/polling_or_webhooks/)** — kiedy polling, kiedy webhooki