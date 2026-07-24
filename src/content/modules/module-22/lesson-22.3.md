# Webhooki, ponowienia (Retries) i testowanie Idempotencji

W architekturze rozproszonej, **Webhook** to mechanizm, w którym system zewnętrzny (np. bramka płatności Stripe czy PayPal) wysyła asynchroniczne żądanie HTTP typu POST bezpośrednio do Twojego systemu w celu poinformowania o ważnym zdarzeniu biznesowym (np. "płatność za zamówienie #102 zakończyła się sukcesem").

Testowanie Webhooków wymaga od testera weryfikacji odporności systemu na **niepoprawne klucze autoryzacyjne**, **mechanizmy ponowień (Retries)** w przypadku awarii sieci oraz niezwykle ważną cechę – **idempotencję (Idempotency)**.

---

## 1. Koncepcja Idempotencji (Idempotency)

### Co to jest Idempotencja?
Idempotencja to właściwość operacji, która sprawia, że jej wielokrotne wywołanie daje **identyczny rezultat** i nie wywołuje żadnych skutków ubocznych. 
*   **Przykład**: Jeśli sieć ulegnie chwilowej awarii, Stripe wyśle ten sam Webhook o udanej płatności 3 razy. System musi obsłużyć go prawidłowo: zaksięgować płatność raz, a pozostałe dwa żądania zignorować. Brak idempotencji grozi np. trzykrotnym pobraniem pieniędzy z konta klienta lub trzykrotnym wygenerowaniem tej samej faktury!

### Idempotency Key (Klucz Idempotencji)
Aby rozróżnić duplikaty, zapytania Webhook posiadają w nagłówkach lub ciele unikalny klucz idempotencji (np. UUID transakcji). System zapisuje przetworzone klucze w bazie danych i przed każdą operacją sprawdza, czy dany klucz był już wcześniej obsłużony.

---

## 2. Implementacja testu weryfikacji Idempotencji Webhooka

Napiszmy test integracyjny sprawdzający, czy potrójne wysłanie tego samego Webhooka o płatności nie generuje zduplikowanych transakcji w bazie danych:

```typescript
import { test, expect } from '@playwright/test';
import { DatabaseClient } from '../utils/db';

test('potrójne wysłanie Webhooka płatności tworzy tylko jedną transakcję w bazie (Idempotencja)', async ({ request }) => {
  const db = new DatabaseClient();
  await db.connect();

  const orderId = 'order-999';
  const idempotencyKey = 'idemp-key-555'; // Unikalny klucz transakcji

  // Przygotuj zamówienie w bazie o statusie 'pending'
  await db.query('INSERT INTO orders (id, status) VALUES ($1, \'pending\')', [orderId]);

  const webhookPayload = {
    event: 'payment.succeeded',
    orderId: orderId,
    idempotencyKey: idempotencyKey,
    amount: 150.00
  };

  // 1. Act: Wyślij Webhook po raz PIERWSZY
  const response1 = await request.post('/api/v1/webhooks/stripe', { data: webhookPayload });
  expect(response1.status()).toBe(200);

  // 2. Act: Wyślij ten sam Webhook po raz DRUGI i TRZECI (symulacja ponowień sieciowych)
  const response2 = await request.post('/api/v1/webhooks/stripe', { data: webhookPayload });
  const response3 = await request.post('/api/v1/webhooks/stripe', { data: webhookPayload });

  // Serwer powinien bezpiecznie zwrócić status sukcesu (np. 200), ale zignorować operację w bazie!
  expect(response2.status()).toBe(200);
  expect(response3.status()).toBe(200);

  // 3. Assert: Upewnij się, że status zamówienia to 'paid' (zaktualizowany raz)
  const orderStatus = await db.query('SELECT status FROM orders WHERE id = $1', [orderId]);
  expect(orderStatus[0].status).toBe('paid');

  // KRYTYCZNA ASERCJA: Upewnij się, że w tabeli transakcji powstał dokładnie JEDEN wpis!
  const transactionsCount = await db.query('SELECT COUNT(*) as count FROM transactions WHERE order_id = $1', [orderId]);
  expect(transactionsCount[0].count).toBe(1); // Dokładnie jedna transakcja!

  // Teardown
  await db.query('DELETE FROM transactions WHERE order_id = $1', [orderId]);
  await db.query('DELETE FROM orders WHERE id = $1', [orderId]);
  await db.disconnect();
});
```

---

## 3. Checklista Testowania Webhooków i Idempotencji
- [ ] Czy Twój system poprawnie weryfikuje podpisy kryptograficzne (signatures) w nagłówkach Webhooka w celu ochrony przed sfałszowaniem żądań?
- [ ] Czy przetestowałeś odporność systemu na duplikaty (Idempotency) poprzez wielokrotne wysłanie tego samego payloadu?
- [ ] Czy zweryfikowałeś zachowanie aplikacji w przypadku awarii sieci i automatycznych ponowień (Retries) ze strony dostawcy?