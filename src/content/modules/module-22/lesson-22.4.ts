import type { Lesson } from "../../../renderer/types";
import theory22_4 from './lesson-22.4.md?raw';

export const lesson22_4: Lesson = {
  "id": "22.4",
  "moduleId": 22,
  "title": "Spójność ostateczna i procesy biznesowe",
  "description": "Sagi, polling, correlation ID, rozproszone workflow, asercje na stan końcowy i testowanie procesów rozłożonych w czasie.",
  "order": 4,
  "difficulty": "advanced",
  "tags": [
    "eventual-consistency",
    "saga",
    "distributed-workflow",
    "polling",
    "correlation-id"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz projektować testy procesów rozproszonych, które nie są spójne natychmiast, rozumiesz wzorzec sagi i umiesz definiować asercje na stan końcowy oraz diagnostykę przepływu.",
    "theory": theory22_4,
    "codeExamples": [
      "async function waitForOrderStatus(orderId: string, expected: string, timeoutMs = 30000) {\n  const started = Date.now();\n  while (Date.now() - started < timeoutMs) {\n    const order = await ordersApi.get(orderId);\n    if (order.status === expected) return order;\n    await new Promise((resolve) => setTimeout(resolve, 500));\n  }\n  throw new Error(`Order ${orderId} did not reach status ${expected}`);\n}\n",
      "test('compensates payment when inventory reservation fails', async () => {\n  const correlationId = `saga-${Date.now()}`;\n  const orderId = await startCheckout({ sku: 'OUT-OF-STOCK', correlationId });\n\n  const order = await waitForOrderStatus(orderId, 'cancelled');\n  expect(order.cancellationReason).toBe('inventory_unavailable');\n\n  const refund = await paymentsApi.findRefundByOrder(orderId);\n  expect(refund.status).toBe('created');\n});\n"
    ],
    "exercises": [
      {
        "id": "ex-22-4-1",
        "title": "Mapa zależności",
        "description": "Dla przepływu z lekcji „Spójność ostateczna i procesy biznesowe” narysuj usługi, komunikaty, kontrakty i miejsca możliwej awarii."
      },
      {
        "id": "ex-22-4-2",
        "title": "Scenariusz duplikatu",
        "description": "Zaprojektuj test pokazujący, co stanie się po dwukrotnym dostarczeniu tego samego komunikatu lub webhooka."
      },
      {
        "id": "ex-22-4-3",
        "title": "Stan końcowy",
        "description": "Zdefiniuj asercje na stan końcowy procesu asynchronicznego w API, bazie i logach."
      },
      {
        "id": "ex-22-4-4",
        "title": "Błąd zależności",
        "description": "Opisz, jak przetestujesz niedostępność jednej usługi bez wyłączania całego środowiska."
      },
      {
        "id": "ex-22-4-5",
        "title": "Diagnostyka",
        "description": "Dodaj plan correlation ID, logów i metryk dla przepływu między usługami."
      },
      {
        "id": "ex-22-4-6",
        "title": "Strategia testów",
        "description": "Podziel testy na unit, contract, integration, async workflow i E2E. Uzasadnij wybór."
      }
    ],
    "quiz": [
      {
        "id": "q22-4-1",
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
        "id": "q22-4-2",
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
        "id": "q22-4-3",
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
        "id": "q22-4-4",
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
        "id": "q22-4-5",
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
        "id": "q22-4-6",
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
        "id": "q22-4-7",
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
        "id": "q22-4-8",
        "question": "Jaki nawyk jest kluczowy w lekcji „Spójność ostateczna i procesy biznesowe”?",
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
