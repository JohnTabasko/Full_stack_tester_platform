# Testowanie systemów kolejkowych i asynchronicznych (Message Queues)

W architekturze mikroserwisowej (Microservices), komunikacja synchroniczna (np. przez tradycyjne HTTP REST API) jest często zastępowana szybszą i bardziej niezawodną **komunikacją asynchroniczną opartą na zdarzeniach (Event-Driven Architecture)**. Usługi wymieniają informacje, przesyłając komunikaty (Events/Messages) przez centralnych pośredników – tzw. **Message Brokers** (np. **Apache Kafka**, **RabbitMQ**).

Testowanie systemów opartych o kolejki różni się diametralnie od tradycyjnego API: nie możemy tu po prostu odpytać o natychmiastową odpowiedź (Request/Response). Musimy sprawdzić, czy wysłanie komunikatu wywoła poprawną reakcję asynchroniczną w innym systemie (często po upływie określonego czasu).

---

## 1. Architektura testów systemów kolejkowych (Kafka / RabbitMQ)

W testach integracyjnych, nasz test pełnić może dwie role jednocześnie:
1.  **Producenta (Producer)** – wstrzykuje komunikat bezpośrednio do kolejki (np. "utworzono zamówienie") i sprawdza, czy docelowy mikroserwis poprawnie go przetworzył.
2.  **Konsumenta (Consumer)** – wywołuje akcję (np. przez UI) i nasłuchuje na kolejce, czy system wygenerował oczekiwany komunikat systemowy.

```
+------------------+                   +--------------------+
|  Playwright Test | -- Publish ---->  |   Message Broker   |
|   (Producer)     |                   |  (RabbitMQ/Kafka)  |
+------------------+                   +--------------------+
                                                 |
                                               Event
                                                 v
+------------------+                   +--------------------+
|  Order-Service   |                   |  Inventory-Service |
| (Target system)  |                   | (Aktualizuje stan) |
+------------------+                   +--------------------+
```

---

## 2. Implementacja testu integracji z kolejkowaniem w RabbitMQ

Napiszmy test weryfikujący, czy wysłanie komunikatu o nowym zamówieniu do RabbitMQ powoduje asynchroniczną aktualizację stanu magazynowego w bazie danych:

```typescript
import { test, expect } from '@playwright/test';
import amqp from 'amqplib'; // Biblioteka do obsługi RabbitMQ
import { DatabaseClient } from '../utils/db';

test('wysłanie zdarzenia ORDER_CREATED aktualizuje stan magazynowy', async () => {
  const db = new DatabaseClient();
  await db.connect();
  
  // Ustaw stan magazynowy produktu na 10 sztuk
  await db.query('UPDATE products SET stock = 10 WHERE id = 1');

  // 1. Połącz się z brokerem RabbitMQ
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  const queueName = 'order-events';

  await channel.assertQueue(queueName, { durable: true });

  // 2. Act: Wyślij komunikat (Event) o nowym zamówieniu
  const eventPayload = {
    eventId: 'evt-102',
    type: 'ORDER_CREATED',
    productId: 1,
    quantity: 2
  };

  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(eventPayload)), {
    persistent: true
  });

  // 3. Assert: Weryfikacja spójności (stanu) magazynu.
  // Ponieważ konsumowanie wiadomości i zapis do bazy trwają kilkadziesiąt ms,
  // musimy użyć asynchronicznej pętli odpytywania (expect.poll)!
  await expect.poll(async () => {
    const result = await db.query('SELECT stock FROM products WHERE id = 1');
    return result[0].stock;
  }, {
    timeout: 5000,     // Czekaj maksymalnie 5 sekund
    intervals: [500],  // Odpytuj bazę co 500 milisekund
  }).toBe(8); // 10 - 2 = 8 sztuk!

  // Sprzątanie połączeń
  await channel.close();
  await connection.close();
  await db.disconnect();
});
```

---

## 3. Zarządzanie komunikatami uszkodzonymi (Dead Letter Queue)

Jeśli konsument nie potrafi przetworzyć wiadomości (np. z powodu błędu walidacji danych), wiadomość nie powinna zniknąć ani zablokować kolejki. Dobrą praktyką architektoniczną jest jej automatyczne przeniesienie do dedykowanej kolejki błędów – tzw. **DLQ (Dead Letter Queue)**. 
Twoje testy negatywne muszą sprawdzać, czy wysłanie wadliwego komunikatu skutkuje jego poprawnym przekierowaniem do DLQ.

---

## 4. Checklista Testowania Kolejek
- [ ] Czy do weryfikacji asynchronicznych zmian stanów w baze po wysłaniu komunikatu stosujesz pętlę odpytywania (`expect.poll`)?
- [ ] Czy poprawnie zarządzasz cyklem życia połączeń z brokerem wiadomości (zamykanie kanałów w fazie sprzątania)?
- [ ] Czy weryfikujesz odporność konsumenta na uszkodzone komunikaty i ich przenoszenie do DLQ?