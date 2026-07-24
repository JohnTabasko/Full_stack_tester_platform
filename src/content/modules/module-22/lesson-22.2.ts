import type { Lesson } from '../../../renderer/types';
import theory22_2 from './lesson-22.2.md?raw';

export const lesson22_2: Lesson = {
  "id": "22.2",
  "moduleId": 22,
  "title": "Testowanie kolejek i zdarzeń",
  "description": "Opanuj testowanie asynchronicznych architektur sterowanych zdarzeniami. Poznaj integrację z RabbitMQ/Kafka, wysyłanie i nasłuchiwanie komunikatów oraz asynchroniczne asercje stanu bazy (expect.poll).",
  "order": 2,
  "difficulty": "advanced",
  "tags": ["queues", "RabbitMQ", "Kafka", "events", "expect.poll", "asynchronous"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz projektować testy integracyjne dla systemów kolejkowych, nawiązywać połączenia z brokerami AMQP, symulować wysyłanie zdarzeń i weryfikować ich asynchroniczne przetwarzanie przy użyciu odpytywania bazy danych.",
    "theory": theory22_2,
    "codeExamples": [
      `// Przykład wysyłania zdarzenia do RabbitMQ (Książka 3 - Uppadhyay)
const conn = await amqp.connect('amqp://localhost');
const ch = await conn.createChannel();
ch.sendToQueue('orders', Buffer.from(JSON.stringify({ id: 1 })));`
    ],
    "exercises": [
      {
        "id": "ex-22-2-1",
        "title": "Wdrożenie testu DLQ w RabbitMQ",
        "description": "Napisz test integracyjny, który celowo wysyła niekompletny komunikat (np. brak id produktu) do kolejki zamówień. Zweryfikuj za pomocą expect.poll, że wiadomość została odrzucona przez konsumenta i trafiła do kolejki błędów (DLQ)."
      }
    ],
    "quiz": [
      {
        "id": "q22-2-1",
        "question": "Dlaczego podczas testowania asynchronicznych systemów kolejkowych tradycyjne, synchroniczne asercje bazy danych (np. expect(dbValue).toBe(...)) są niewskazane?",
        "options": [
          "Ponieważ przetwarzanie zdarzenia i zapis do bazy trwają kilkadziesiąt/kilkaset milisekund, co wywoła natychmiastowe fałszywe niepowodzenie synchronicznej asercji",
          "Ponieważ bazy danych nie współpracują z asercjami",
          "Ponieważ kolejki RabbitMQ blokują połączenia z bazą danych",
          "Nie ma to żadnego wpływu"
        ],
        "correctAnswer": 0,
        "explanation": "Zdarzenia są konsumowane asynchronicznie w tle. Tradycyjna asercja sprawdzi stan bazy w milisekundę po wysłaniu komunikatu – zanim baza zdąży się zaktualizować. Tylko expect.poll() gwarantuje stabilne odpytywanie w czasie."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 6: Event-driven architectures and Message broker validation."
      }
    ],
    "tipsAndTricks": [
      "Zawsze zamykaj połączenia i kanały AMQP w sekcji afterEach lub afterAll, aby zapobiec wyciekom wątków i blokowaniu procesów roboczych systemu operacyjnego."
    ],
    "commonMistakes": [
      {
        "mistake": "Wstawianie twardych opóźnień (page.waitForTimeout) po wysłaniu komunikatu do kolejki w celu 'poczekania na zapis'",
        "solution": "Zastąp ręczne sleep-y bezpiecznym, asynchronicznym odpytywaniem przy użyciu expect.poll()."
      }
    ]
  }
};