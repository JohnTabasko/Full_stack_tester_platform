# Webhooki, Ponowienia i Idempotencja — Bezpieczna Obsługa Zdarzeń Zewnętrznych

> **Perspektywa Full Stack Testera**
> Bramka płatności (Stripe, Przelewy24, PayU) nie czeka na Twoją odpowiedź HTTP. Wysyła webhook i przechodzi dalej. Jeśli Twój system odbierze ten webhook, ale nie oznaczy zamówienia jako opłacone — bo obsłużył webhook dwa razy, albo podpis był nieprawidłowy, albo przetwarzanie trwało zbyt długo — pieniądze klienta wiszą w powietrzu. W tej lekcji zdobędziesz umiejętności testowania webhooków: weryfikacji podpisów, obsługi ponowień, idempotencji i timeoutów.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Testować** endpoint webhook z walidacją podpisu
- **Weryfikować** obsługę duplikatów webhooków (idempotencja)
- **Symulować** ponowienia webhooków przez dostawcę
- **Testować** timeouty i szybkie akceptowanie + async processing
- **Piszować** testy idempotency keys

---

## Wprowadzenie — dlaczego webhooki są ryzykowne

Webhook to żądanie HTTP od systemu zewnętrznego, które przychodzi bez zaproszenia. W przeciwieństwie do API, gdzie Ty decydujesz kiedy wywołać, webhook przychodzi w dowolnym momencie i może przyjść wielokrotnie. Dlatego:

- **Nieufność** — zawsze waliduj podpis
- **Idempotencja** — ten sam webhook może przyjść wielokrotnie
- **Szybka akceptacja** — 202 Accepted + async processing
- **Logging** — zapisuj każdy webhook dla diagnostyki

---

## 1. Struktura webhooka PaymentCaptured

### 1.1 Payload webhooka

```typescript
interface StripeWebhookPayload {
  id: string;           // evt_xxx
  type: 'payment_intent.succeeded';
  created: number;      // Unix timestamp
  data: {
    object: {
      id: string;       // pi_xxx
      amount: number;   // w centach
      currency: string;
      status: string;
      metadata: {
        orderId: string;
        correlationId: string;
      };
    };
  };
}
```

### 1.2 Weryfikacja podpisu

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf-8')
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(`v1=${expectedSignature}`)
  );
}

// W teście — symuluj webhook z prawidłowym podpisem
async function sendWebhook(
  request: APIRequestContext,
  payload: object,
  webhookSecret: string
) {
  const payloadString = JSON.stringify(payload);
  const signature = `v1=${crypto
    .createHmac('sha256', webhookSecret)
    .update(payloadString, 'utf-8')
    .digest('hex')}`;
  
  return request.post('/webhooks/stripe', {
    headers: {
      'Content-Type': 'application/json',
      'Stripe-Signature': signature,
      'X-Idempotency-Key': `webhook-${Date.now()}`,
    },
    data: payloadString,
  });
}
```

---

## 2. Testy webhooków w Playwright

### 2.1 Podstawowy test webhooka

```typescript
// tests/webhooks/payment-webhook.spec.ts
import { test, expect, request as apiRequest } from '@playwright/test';
import crypto from 'crypto';

test.describe('Payment Webhook Processing', () => {
  
  test('webhook marks order as paid on valid signature', async ({ request }) => {
    const orderId = 12345;
    const correlationId = `webhook-test-${Date.now()}`;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test';
    
    // Przygotuj payload webhooka
    const payload = {
      id: `evt_test_${Date.now()}`,
      type: 'payment_intent.succeeded',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: `pi_test_${Date.now()}`,
          amount: 19999,  // 199.99 PLN w centach
          currency: 'pln',
          status: 'succeeded',
          metadata: {
            orderId: String(orderId),
            correlationId,
          },
        },
      },
    };
    
    // Oblicz podpis
    const payloadString = JSON.stringify(payload);
    const signature = `v1=${crypto
      .createHmac('sha256', webhookSecret)
      .update(payloadString, 'utf-8')
      .digest('hex')}`;
    
    // Wyślij webhook
    const response = await request.post('/webhooks/stripe', {
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': signature,
      },
      data: payloadString,
    });
    
    // Webhook powinien być zaakceptowany (202 Accepted = async processing)
    expect([200, 202]).toContain(response.status());
    
    // Poczekaj na przetworzenie (async)
    await expectEventually(
      async () => {
        const order = await db.getOne<{ status: string; paidAt: Date | null }>(
          'SELECT status, paid_at FROM orders WHERE id = $1',
          [orderId]
        );
        
        if (!order) throw new Error('Order not found');
        if (order.status !== 'PAID') throw new Error(`Status is ${order.status}`);
        if (!order.paidAt) throw new Error('paidAt is null');
        
        return order;
      },
      { timeoutMs: 15000, description: 'order status = PAID' }
    );
  });
  
  test('webhook is rejected with invalid signature', async ({ request }) => {
    const payload = {
      id: `evt_invalid_${Date.now()}`,
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_invalid', amount: 1000 } },
    };
    
    const response = await request.post('/webhooks/stripe', {
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': 'v1=invalid_signature_here',
      },
      data: JSON.stringify(payload),
    });
    
    // Nieprawidłowy podpis → 401 Unauthorized
    expect(response.status()).toBe(401);
    
    // Zamówienie NIE powinno być oznaczone jako opłacone
    const order = await db.getOne<{ status: string }>(
      'SELECT status FROM orders WHERE id = $1',
      [12345]
    );
    expect(order?.status).not.toBe('PAID');
  });
  
  test('duplicate webhook does not create double payment', async ({ request }) => {
    const orderId = 99999;
    const correlationId = `webhook-dup-${Date.now()}`;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test';
    
    const payload = {
      id: `evt_dup_${Date.now()}`,
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: `pi_dup_${Date.now()}`,
          amount: 5000,
          metadata: { orderId: String(orderId), correlationId },
        },
      },
    };
    
    const payloadString = JSON.stringify(payload);
    const signature = `v1=${crypto
      .createHmac('sha256', webhookSecret)
      .update(payloadString, 'utf-8')
      .digest('hex')}`;
    
    // Wyślij TEN SAM webhook DWUKROTNIE (symulacja retry)
    const response1 = await request.post('/webhooks/stripe', {
      headers: { 'Stripe-Signature': signature },
      data: payloadString,
    });
    
    const response2 = await request.post('/webhooks/stripe', {
      headers: { 'Stripe-Signature': signature },
      data: payloadString,
    });
    
    expect([200, 202]).toContain(response1.status());
    expect([200, 202]).toContain(response2.status());  // Też OK (idempotencja!)
    
    // Poczekaj na przetworzenie
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Sprawdź stan: dokładnie JEDEN payment event!
    const paymentEvents = await db.query(
      'SELECT id FROM payment_events WHERE order_id = $1',
      [orderId]
    );
    
    expect(paymentEvents.rows.length).toBe(1);
    
    const order = await db.getOne<{ paidAmount: number }>(
      'SELECT paid_amount FROM orders WHERE id = $1',
      [orderId]
    );
    
    // Kwota nie jest podwojona!
    expect(order!.paidAmount).toBe(50.00);  // 5000 centów = 50.00 PLN
  });
});
```

### 2.2 Test obsługi timeoutu dostawcy

```typescript
test('webhook accepts quickly even if processing is slow', async ({ request }) => {
  const webhookPayload = { /* ... */ };
  
  const startTime = Date.now();
  
  // Webhook powinien zwrócić 202 Accepted w < 500ms
  const response = await request.post('/webhooks/stripe', {
    data: webhookPayload,
    headers: { 'Stripe-Signature': calculateSignature(webhookPayload) },
  });
  
  const acceptTime = Date.now() - startTime;
  
  // Szybka akceptacja!
  expect(response.status()).toBe(202);
  expect(acceptTime).toBeLessThan(500);
  
  console.log(`Webhook accepted in ${acceptTime}ms, processing async`);
  
  // Przetwarzanie może trwać dłużej (async)
  await expectEventually(
    async () => {
      const order = await db.getOne('SELECT status FROM orders WHERE id = $1', [12345]);
      if (order?.status !== 'PAID') throw new Error('Still processing');
      return order;
    },
    { timeoutMs: 30000 }
  );
});
```

---

## 3. Idempotency key w webhookach

### 3.1 Weryfikacja idempotency key

```typescript
// Test: wielokrotne wywołanie z tym samym idempotency key
test('webhook with same idempotency key is processed once', async ({ request }) => {
  const idempotencyKey = `stripe-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  
  for (let i = 0; i < 3; i++) {
    const response = await request.post('/webhooks/stripe', {
      data: {
        id: `evt_${Date.now()}_${i}`,
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: `pi_${Date.now()}`,
            amount: 10000,
            metadata: { orderId: '99999' },
          },
        },
      },
      headers: {
        'Stripe-Signature': calculateSignature(payload),
        'Idempotency-Key': idempotencyKey,  // TEN SAM KLUCZ!
      },
    });
    
    // Wszystkie zwracają 200/202 (sukces idempotentny)
    expect([200, 202]).toContain(response.status());
  }
  
  // Sprawdź, że tylko raz przetworzone
  const paymentCount = await db.getValue<number>(
    'SELECT COUNT(*) FROM payment_events WHERE order_id = 99999'
  );
  
  expect(paymentCount).toBe(1);
});
```

### 3.2 Retry test — symulacja ponowienia przez Stripe

```typescript
test('provider retry does not cause double processing', async ({ request }) => {
  // Symuluj zachowanie Stripe przy network timeout:
  // Stripe wysyła webhook → nie dostaje 200 → retry po 1s → retry po 5s
  
  const payload = { eventId: `evt_retry_${Date.now()}`, amount: 5000 };
  const response1 = await request.post('/webhooks/stripe', {
    data: payload,
    timeout: 1000,  // Symuluj timeout
  });
  
  // Timeout → Stripe uznał że nie dostał odpowiedzi → retry
  // Drugie wywołanie po 1s
  await new Promise(resolve => setTimeout(resolve, 1100));
  const response2 = await request.post('/webhooks/stripe', {
    data: payload,
  });
  
  // Obie odpowiedzi OK (system obsługuje retry)
  expect(response2.status()).toBeLessThan(300);
  
  // Stan końcowy: JEDNO przetworzenie
  const count = await db.getValue<number>(
    'SELECT COUNT(*) FROM payments WHERE event_id = $1',
    [payload.eventId]
  );
  
  expect(count).toBe(1);
});
```

---

## Perspektywa Full Stack Testera

Webhook to jedno z najtrudniejszych wejść do testowania, ponieważ:

- **Nieufne wejście** — każdy webhook może być fałszywy, musisz walidować podpis
- **Retry semantics** — dostawcy ponawiają, Twoja aplikacja musi być idempotentna
- **Async processing** — szybka akceptacja + kolejne przetwarzanie to wzorzec
- **Stan końcowy** — test musi poczekać, nie zakładać natychmiastowej spójności

Pamiętaj: webhook bez walidacji podpisu = otwarte drzwi dla atakującego. Idempotencja = warunek bezpieczeństwa, nie dodatek.

---

## Podsumowanie

- **Webhook = nieufne wejście** — zawsze waliduj podpis HMAC
- **Idempotencja** — ten sam webhook może przyjść wielokrotnie; stan końcowy musi być pojedynczy
- **Szybka akceptacja** — 202 Accepted + async processing; nie czekaj na przetwarzanie w respondzie
- **Retry simulation** — testuj, że dostawcy retry (Stripe, PayU) nie powodują podwójnego skutku
- **Idempotency key** — deduplikacja po ключу, nie po event ID

---

## Linki i Źródła

- **[Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)** — oficjalna dokumentacja Stripe
- **[Webhook Security Best Practices](https://docs.stripe.com/webhooks/best-practices)** — podpisy i walidacja
- **[Idempotency — Stripe](https://stripe.com/docs/idempotency)** — jak Stripe implementuje idempotencję
- **[Webhook Reliability — Twilio](https://www.twilio.com/docs/usage/webhooks/replay-webhooks)** — strategie ponowień
---

## Podpisy webhooków

Webhook powinien być podpisany, aby odbiorca mógł sprawdzić autentyczność. Testuj:

- poprawny podpis;
- błędny podpis;
- brak podpisu;
- stary timestamp;
- ponowne użycie tego samego event id.

Przykład asercji:

```text
POST /webhooks/payment bez poprawnego podpisu zwraca 401/403 i nie zmienia statusu zamówienia.
```

## Idempotency key

Idempotency key pozwala bezpiecznie powtórzyć request. Dla płatności i webhooków to krytyczne.

Test:

1. Wyślij webhook `payment.succeeded` z `eventId=evt-1`.
2. Wyślij ten sam webhook ponownie.
3. Sprawdź, że zamówienie jest opłacone raz, bez podwójnej faktury i podwójnego eventu.

## Retry i DLQ

Webhooki mogą być ponawiane. Jeśli konsument stale zawodzi, komunikat powinien trafić do DLQ albo zostać oznaczony do ręcznej obsługi. Testuj zarówno sukces po retry, jak i kontrolowaną awarię po przekroczeniu limitu.
