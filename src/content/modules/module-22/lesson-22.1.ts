import type { Lesson } from "../../../renderer/types";
import theory22_1 from './lesson-22.1.md?raw';

export const lesson22_1: Lesson = {
  "id": "22.1",
  "moduleId": 22,
  "title": "Architektura mikroserwisowa dla testerów",
  "description": "Testowanie kolejek i zdarzeń: Kafka topics/partitions/offsets, RabbitMQ exchanges/queues/ack/DLQ, CloudEvents i kontrakty eventów.",
  "order": 1,
  "difficulty": "advanced",
  "tags": [
    "microservices",
    "architecture",
    "service-boundaries",
    "test-strategy"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji rozumiesz konsekwencje architektury mikroserwisowej dla testowania, potrafisz mapować zależności między usługami i projektować strategię testów obejmującą kontrakty, integracje oraz krytyczne przepływy end-to-end.",
    "theory": theory22_1,
    "codeExamples": [
      "type ServiceDependency = {\n  consumer: string;\n  provider: string;\n  protocol: 'http' | 'event' | 'database' | 'webhook';\n  contractOwner: string;\n  criticality: 'low' | 'medium' | 'high';\n};\n\nconst checkoutMap: ServiceDependency[] = [\n  { consumer: 'checkout-ui', provider: 'orders-api', protocol: 'http', contractOwner: 'orders-team', criticality: 'high' },\n  { consumer: 'orders-api', provider: 'payments-api', protocol: 'http', contractOwner: 'payments-team', criticality: 'high' },\n  { consumer: 'orders-api', provider: 'inventory-events', protocol: 'event', contractOwner: 'inventory-team', criticality: 'high' },\n];\n",
      "# Pytania do mapy integracji\n- Kto jest właścicielem kontraktu?\n- Czy komunikacja jest synchroniczna czy asynchroniczna?\n- Jak wygląda ponowienia?\n- Czy operacja jest idempotentna?\n- Jak znajdziemy przepływ w logach?\n"
    ],
    "exercises": [
      {
        "id": "ex-22-1-1",
        "title": "Mapa zależności",
        "description": "Dla przepływu z lekcji „Architektura mikroserwisowa dla testerów” narysuj usługi, komunikaty, kontrakty i miejsca możliwej awarii."
      },
      {
        "id": "ex-22-1-2",
        "title": "Scenariusz duplikatu",
        "description": "Zaprojektuj test pokazujący, co stanie się po dwukrotnym dostarczeniu tego samego komunikatu lub webhooka."
      },
      {
        "id": "ex-22-1-3",
        "title": "Stan końcowy",
        "description": "Zdefiniuj asercje na stan końcowy procesu asynchronicznego w API, bazie i logach."
      },
      {
        "id": "ex-22-1-4",
        "title": "Błąd zależności",
        "description": "Opisz, jak przetestujesz niedostępność jednej usługi bez wyłączania całego środowiska."
      },
      {
        "id": "ex-22-1-5",
        "title": "Diagnostyka",
        "description": "Dodaj plan correlation ID, logów i metryk dla przepływu między usługami."
      },
      {
        "id": "ex-22-1-6",
        "title": "Strategia testów",
        "description": "Podziel testy na unit, contract, integration, async workflow i E2E. Uzasadnij wybór."
      }
    ],
    "quiz": [
      {
        "id": "q22-1-1",
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
        "id": "q22-1-2",
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
        "id": "q22-1-3",
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
        "id": "q22-1-4",
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
        "id": "q22-1-5",
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
        "id": "q22-1-6",
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
        "id": "q22-1-7",
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
        "id": "q22-1-8",
        "question": "Jaki nawyk jest kluczowy w lekcji „Architektura mikroserwisowa dla testerów”?",
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
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Enterprise-grade design patterns (PageFactory, ApiFactory, BasePage), SOLID & DRY principles, and full stack scaling."
      },
      {
        "title": "Practical Playwright Test (Jean-François Greffier, 2026)",
        "url": "https://doi.org/10.1007/979-8-8688-2160-8",
        "description": "Deep dive into Playwright runner extension, custom expectations, dependent and automatic fixtures, and component testing."
      },
      {
        "title": "Hands-On Automated Testing with Playwright (Faraz K. Kelhini, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Comprehensive guide to browser mechanics, Chrome DevTools Protocol metrics, WCAG accessibility, visual testing, and mobile web."
      },
      {
        "title": "Kafka Documentation",
        "url": "https://kafka.apache.org/documentation/",
        "description": "Topic, partition, offset i consumer groups."
      },
      {
        "title": "RabbitMQ Docs",
        "url": "https://www.rabbitmq.com/docs",
        "description": "Exchange, queue, binding, ack/nack i DLQ."
      },
      {
        "title": "CloudEvents",
        "url": "https://cloudevents.io/",
        "description": "Standard metadanych zdarzeń."
      }
    ],
    "tipsAndTricks": [
      "Zawsze opieraj architekturę testów na zasadach SOLID, unikając przedwczesnej abstrakcji zgodnie z zasadą WET (Write Everything Twice) z podręczników 2026.",
      
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
