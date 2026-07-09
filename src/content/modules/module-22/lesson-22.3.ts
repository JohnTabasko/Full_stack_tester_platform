import type { Lesson } from "../../../renderer/types";
import theory22_3 from './lesson-22.3.md?raw';

export const lesson22_3: Lesson = {
  "id": "22.3",
  "moduleId": 22,
  "title": "Webhooki, ponowienia i idempotencja",
  "description": "Testowanie callbacków HTTP, podpisów, ponowień, timeoutów, klucze idempotencji i odporności integracji zewnętrznych.",
  "order": 3,
  "difficulty": "advanced",
  "tags": [
    "webhooks",
    "ponowienia",
    "idempotencja",
    "signatures",
    "external-integrations"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz testować webhooki i integracje zewnętrzne, weryfikować podpisy, obsługę ponowienia, idempotencję oraz bezpieczne zachowanie przy duplikatach i opóźnieniach.",
    "theory": theory22_3,
    "codeExamples": [
      "test('rejects webhook with invalid signature', async ({ request }) => {\n  const response = await request.post('/webhooks/payments', {\n    headers: { 'x-signature': 'invalid' },\n    data: { id: 'evt-1', type: 'payment.succeeded' },\n  });\n\n  expect(response.status()).toBe(401);\n});\n",
      "test('processes duplicated webhook only once', async ({ request }) => {\n  const event = signedPaymentSucceededEvent('evt-duplicate-1');\n\n  await request.post('/webhooks/payments', event);\n  await request.post('/webhooks/payments', event);\n\n  const invoices = await db.invoice.findByPaymentEvent('evt-duplicate-1');\n  expect(invoices).toHaveLength(1);\n});\n"
    ],
    "exercises": [
      {
        "id": "ex-22-3-1",
        "title": "Mapa zależności",
        "description": "Dla przepływu z lekcji „Webhooki, ponowienia i idempotencja” narysuj usługi, komunikaty, kontrakty i miejsca możliwej awarii."
      },
      {
        "id": "ex-22-3-2",
        "title": "Scenariusz duplikatu",
        "description": "Zaprojektuj test pokazujący, co stanie się po dwukrotnym dostarczeniu tego samego komunikatu lub webhooka."
      },
      {
        "id": "ex-22-3-3",
        "title": "Stan końcowy",
        "description": "Zdefiniuj asercje na stan końcowy procesu asynchronicznego w API, bazie i logach."
      },
      {
        "id": "ex-22-3-4",
        "title": "Błąd zależności",
        "description": "Opisz, jak przetestujesz niedostępność jednej usługi bez wyłączania całego środowiska."
      },
      {
        "id": "ex-22-3-5",
        "title": "Diagnostyka",
        "description": "Dodaj plan correlation ID, logów i metryk dla przepływu między usługami."
      },
      {
        "id": "ex-22-3-6",
        "title": "Strategia testów",
        "description": "Podziel testy na unit, contract, integration, async workflow i E2E. Uzasadnij wybór."
      }
    ],
    "quiz": [
      {
        "id": "q22-3-1",
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
        "id": "q22-3-2",
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
        "id": "q22-3-3",
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
        "id": "q22-3-4",
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
        "id": "q22-3-5",
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
        "id": "q22-3-6",
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
        "id": "q22-3-7",
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
        "id": "q22-3-8",
        "question": "Jaki nawyk jest kluczowy w lekcji „Webhooki, ponowienia i idempotencja”?",
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
