import type { Lesson } from "../../../renderer/types";
import theory22_2 from './lesson-22.2.md?raw';

export const lesson22_2: Lesson = {
  "id": "22.2",
  "moduleId": 22,
  "title": "Testowanie kolejek i zdarzeń",
  "description": "Kafka, RabbitMQ/SQS, publikacja i konsumpcja komunikatów, kolejność, duplikaty, ponowienia i dead-letter queues.",
  "order": 2,
  "difficulty": "advanced",
  "tags": [
    "kafka",
    "rabbitmq",
    "events",
    "queues",
    "dlq",
    "message-testing"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz projektować testy publikacji i konsumpcji zdarzeń, rozumiesz problem duplikatów, kolejności i DLQ oraz wiesz, jak weryfikować procesy event-driven.",
    "theory": theory22_2,
    "codeExamples": [
      "// Pseudokod testu publikacji zdarzenia.\nconst correlationId = `test-${Date.now()}`;\nawait payOrder(orderId, { correlationId });\n\nconst event = await eventProbe.waitFor('order.paid', { correlationId });\nexpect(event.payload).toMatchObject({ orderId, status: 'paid' });\nexpect(event.headers['correlation-id']).toBe(correlationId);\n",
      "// Test idempotencji konsumenta.\nawait consumer.handle(orderPaidEvent);\nawait consumer.handle(orderPaidEvent);\n\nconst invoices = await db.invoice.findByOrderId(orderId);\nexpect(invoices).toHaveLength(1);\n"
    ],
    "exercises": [
      {
        "id": "ex-22-2-1",
        "title": "Mapa zależności",
        "description": "Dla przepływu z lekcji „Testowanie kolejek i zdarzeń” narysuj usługi, komunikaty, kontrakty i miejsca możliwej awarii."
      },
      {
        "id": "ex-22-2-2",
        "title": "Scenariusz duplikatu",
        "description": "Zaprojektuj test pokazujący, co stanie się po dwukrotnym dostarczeniu tego samego komunikatu lub webhooka."
      },
      {
        "id": "ex-22-2-3",
        "title": "Stan końcowy",
        "description": "Zdefiniuj asercje na stan końcowy procesu asynchronicznego w API, bazie i logach."
      },
      {
        "id": "ex-22-2-4",
        "title": "Błąd zależności",
        "description": "Opisz, jak przetestujesz niedostępność jednej usługi bez wyłączania całego środowiska."
      },
      {
        "id": "ex-22-2-5",
        "title": "Diagnostyka",
        "description": "Dodaj plan correlation ID, logów i metryk dla przepływu między usługami."
      },
      {
        "id": "ex-22-2-6",
        "title": "Strategia testów",
        "description": "Podziel testy na unit, contract, integration, async workflow i E2E. Uzasadnij wybór."
      }
    ],
    "quiz": [
      {
        "id": "q22-2-1",
        "question": "Co jest największym wyzwaniem w testowaniu mikroserwisów?",
        "options": [
          "Granice między usługami, kontrakty i zachowanie asynchroniczne",
          "Kolor przycisków",
          "Brak możliwości pisania testów",
          "Wyłącznie składnia TypeScript"
        ],
        "correctAnswer": 0,
        "explanation": "Mikroserwisy wprowadzają niezależne wdrożenia, sieć, kolejki i spójność ostateczna."
      },
      {
        "id": "q22-2-2",
        "question": "Czym jest spójność ostateczna?",
        "options": [
          "Stan systemu staje się spójny po pewnym czasie",
          "Natychmiastowa blokada każdego rekordu",
          "Brak spójności na zawsze",
          "Rodzaj selektora CSS"
        ],
        "correctAnswer": 0,
        "explanation": "W systemach asynchronicznych spójność może pojawić się dopiero po przetworzeniu zdarzeń."
      },
      {
        "id": "q22-2-3",
        "question": "Po co stosować correlation ID?",
        "options": [
          "Aby prześledzić jeden przepływ przez wiele usług",
          "Aby zmienić kolor logów",
          "Aby zastąpić testy",
          "Aby ukryć błędy"
        ],
        "correctAnswer": 0,
        "explanation": "Correlation ID łączy requesty, zdarzenia i logi jednego procesu biznesowego."
      },
      {
        "id": "q22-2-4",
        "question": "Dlaczego idempotencja jest ważna?",
        "options": [
          "Bo ponowienia i duplikaty nie powinny powodować podwójnego skutku",
          "Bo usuwa potrzebę logów",
          "Bo przyspiesza CSS",
          "Bo działa tylko w interfejs użytkownika"
        ],
        "correctAnswer": 0,
        "explanation": "Systemy rozproszone muszą radzić sobie z powtórzeniami komunikatów i żądań."
      },
      {
        "id": "q22-2-5",
        "question": "Co oznacza DLQ?",
        "options": [
          "Dead-letter queue dla komunikatów nieprzetworzonych",
          "Dynamiczny locator query",
          "Dokumentację lokalną jakości",
          "Deployment lock queue"
        ],
        "correctAnswer": 0,
        "explanation": "DLQ przechowuje komunikaty, których nie udało się poprawnie obsłużyć."
      },
      {
        "id": "q22-2-6",
        "question": "Jak testować proces asynchroniczny?",
        "options": [
          "Asercjami na stan końcowy i kontrolowanym oczekiwaniem",
          "Jednym sleep bez sprawdzania",
          "Tylko screenshotem",
          "Bez danych"
        ],
        "correctAnswer": 0,
        "explanation": "Test powinien czekać na znaczący rezultat, a nie na arbitralny czas."
      },
      {
        "id": "q22-2-7",
        "question": "Co jest celem wirtualizacja usług?",
        "options": [
          "Kontrolowane zastąpienie zależności w testach integracji",
          "Usunięcie API",
          "Zastąpienie bazy fontem",
          "Wyłączenie CI"
        ],
        "correctAnswer": 0,
        "explanation": "Wirtualizacja usług pozwala testować scenariusze trudne lub kosztowne na prawdziwych zależnościach."
      },
      {
        "id": "q22-2-8",
        "question": "Jaki nawyk jest kluczowy w lekcji „Testowanie kolejek i zdarzeń”?",
        "options": [
          "Myślenie o przepływie przez granice usług i awarie pośrednie",
          "Pisanie tylko E2E",
          "Ignorowanie kolejek",
          "Brak obserwowalności"
        ],
        "correctAnswer": 0,
        "explanation": "W systemie rozproszonym jakość zależy od zachowania całego przepływu, nie pojedynczej funkcji."
      }
    ],
    "references": [
      {
        "title": "Martin Fowler - Microservices",
        "url": "https://martinfowler.com/articles/microservices.html",
        "description": "Klasyczne omówienie architektury mikroserwisowej i jej konsekwencji organizacyjnych."
      },
      {
        "title": "Enterprise Integration Patterns",
        "url": "https://www.enterpriseintegrationpatterns.com/",
        "description": "Katalog wzorców integracji systemów, kolejek, routerów i transformacji komunikatów."
      },
      {
        "title": "Kafka Documentation",
        "url": "https://kafka.apache.org/documentation/",
        "description": "Dokumentacja platformy zdarzeniowej Apache Kafka."
      },
      {
        "title": "Webhook Bezpieczeństwo Guidelines",
        "url": "https://owasp.org/www-project-web-security-testing-guide/",
        "description": "Praktyki bezpieczeństwa przy komunikacji HTTP i integracjach zewnętrznych."
      }
    ],
    "tipsAndTricks": [
      "W systemach asynchronicznych testuj stan końcowy i zdarzenia pośrednie, nie tylko status pierwszego żądania.",
      "Każdy przepływ między usługami powinien mieć correlation ID widoczne w logach i komunikatach.",
      "Retry bez idempotencji jest prostą drogą do duplikatów i niespójności danych.",
      "W testach mikroserwisów jawnie zapisuj, które zależności są prawdziwe, które zamockowane, a które zwirtualizowane."
    ],
    "commonMistakes": [
      {
        "mistake": "Testowanie mikroserwisu jak monolitu",
        "solution": "Oddziel testy kontraktów, integracji, zdarzeń i przepływów end-to-end."
      },
      {
        "mistake": "Brak idempotencji przy ponowienia",
        "solution": "Stosuj klucze idempotencji i testuj ponowienia oraz duplikaty komunikatów."
      },
      {
        "mistake": "Asercje natychmiast po operacji async",
        "solution": "Czekaj na obserwowalny stan końcowy z rozsądnym pollingiem i timeoutem."
      },
      {
        "mistake": "Brak dead-letter queue w testach kolejek",
        "solution": "Sprawdzaj zachowanie dla komunikatów niepoprawnych i nieprzetwarzalnych."
      }
    ]
  }
};
