import type { Lesson } from "../../../renderer/types";
import theory8_4 from './lesson-8.4.md?raw';

export const lesson8_4: Lesson = {
  "id": "8.4",
  "moduleId": 8,
  "title": "Wydajność i testy obciążeniowe API",
  "description": "Lekkie testy wydajnościowe API w Playwright: timing, payload size, budżety, dataset, flakiness i granica z k6/JMeter.",
  "order": 4,
  "difficulty": "intermediate",
  "tags": [
    "api-testing",
    "playwright",
    "contract",
    "http"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz projektować testy API dla tematu „Wydajność i testy obciążeniowe API”, obejmujące kontrakt, dane, scenariusze negatywne, sprzątanie danych i diagnostykę.",
    "theory": theory8_4,
    "codeExamples": [
      "import http from 'k6/http';\nimport { check } from 'k6';\n\nexport const options = {\n  thresholds: {\n    http_req_failed: ['rate<0.01'],\n    http_req_duration: ['p(95)<300'],\n  },\n};\n\nexport default function () {\n  const res = http.get('https://api.example.test/orders');\n  check(res, { 'status is 200': (r) => r.status === 200 });\n}\n",
      "// Minimalny performance smoke w CI:\n// - krótki czas\n// - małe obciążenie\n// - progi regresji\n// - artefakt z wynikami\n"
    ],
    "exercises": [
      {
        "id": "ex-8-4-1",
        "title": "Ścieżka sukcesu kontraktu",
        "description": "Dla tematu „Wydajność i testy obciążeniowe API” napisz test poprawnej odpowiedzi: status, body i headers."
      },
      {
        "id": "ex-8-4-2",
        "title": "Negative path",
        "description": "Dodaj test braku autoryzacji, braku uprawnień, niepoprawnych danych albo konfliktu."
      },
      {
        "id": "ex-8-4-3",
        "title": "Dane testowe",
        "description": "Przygotuj dane przez API lub fixture i zaplanuj sprzątanie danych."
      },
      {
        "id": "ex-8-4-4",
        "title": "Walidacja schematu",
        "description": "Opisz albo zaimplementuj walidację struktury response względem schematu."
      },
      {
        "id": "ex-8-4-5",
        "title": "Paginacja lub lista",
        "description": "Sprawdź limit, sortowanie, cursor/offset i stabilność listy wyników."
      },
      {
        "id": "ex-8-4-6",
        "title": "Organizacja kodu",
        "description": "Wydziel klienta API/resource class bez ukrywania sensu asercji."
      }
    ],
    "quiz": [
      {
        "id": "q8-4-1",
        "question": "Co powinien sprawdzać dobry test API?",
        "options": [
          "Status, ciało odpowiedzi, nagłówki, kontrakt i semantykę odpowiedzi",
          "Wyłącznie 200 OK",
          "Tylko screenshot",
          "Kolor przycisku"
        ],
        "correctAnswer": 0,
        "explanation": "API to kontrakt obejmujący więcej niż sam status."
      },
      {
        "id": "q8-4-2",
        "question": "Czym różni się 401 od 403?",
        "options": [
          "401 oznacza brak/niepoprawne uwierzytelnienie, 403 brak uprawnień",
          "To zawsze to samo",
          "403 oznacza brak tokena",
          "401 oznacza błąd walidacji"
        ],
        "correctAnswer": 0,
        "explanation": "Rozróżnienie jest ważne dla bezpieczeństwa i UX klienta API."
      },
      {
        "id": "q8-4-3",
        "question": "Dlaczego warto walidować schema response?",
        "options": [
          "Aby wykryć regresje kontraktu struktury danych",
          "Aby zastąpić wszystkie asercje",
          "Aby ukryć błędy",
          "Aby uniknąć danych testowych"
        ],
        "correctAnswer": 0,
        "explanation": "Schema validation wykrywa zmiany pól, typów i wymaganych struktur."
      },
      {
        "id": "q8-4-4",
        "question": "Co oznacza idempotentność?",
        "options": [
          "Wielokrotne wykonanie tej samej operacji daje ten sam skutek",
          "Operacja zawsze jest szybka",
          "Brak autoryzacji",
          "Losową odpowiedź"
        ],
        "correctAnswer": 0,
        "explanation": "Idempotencja jest kluczowa przy retry, PUT, DELETE i płatnościach."
      },
      {
        "id": "q8-4-5",
        "question": "Co jest ważne przy testach paginacji?",
        "options": [
          "Limit, cursor/offset, sortowanie i brak duplikatów między stronami",
          "Tylko pierwszy element",
          "Brak asercji",
          "Wyłącznie interfejs użytkownika"
        ],
        "correctAnswer": 0,
        "explanation": "Paginacja często psuje się na granicach i przy sortowaniu."
      },
      {
        "id": "q8-4-6",
        "question": "Po co sprzątanie danych tracker w API tests?",
        "options": [
          "Aby usuwać zasoby utworzone w teście",
          "Aby przyspieszać CSS",
          "Aby ukrywać tokeny",
          "Aby zastąpić requesty"
        ],
        "correctAnswer": 0,
        "explanation": "Testy API często tworzą dane, które trzeba bezpiecznie usunąć."
      },
      {
        "id": "q8-4-7",
        "question": "Jaki jest problem nadmiernie ukrytego API clienta?",
        "options": [
          "Test przestaje pokazywać, jaki kontrakt i rezultat sprawdza",
          "Test staje się zawsze szybszy",
          "API znika",
          "Nie da się użyć TypeScript"
        ],
        "correctAnswer": 0,
        "explanation": "Klient ma upraszczać transport, ale asercje powinny być czytelne."
      },
      {
        "id": "q8-4-8",
        "question": "Najważniejsza zasada lekcji „Wydajność i testy obciążeniowe API” to:",
        "options": [
          "API testuje kontrakt i zachowanie usługi, nie tylko techniczne połączenie",
          "Wystarczy response.ok",
          "Nie trzeba negatywnych testów",
          "Dane mogą zostać w środowisku"
        ],
        "correctAnswer": 0,
        "explanation": "Wartość testu API wynika z jasnej weryfikacji kontraktu i skutków."
      }
    ],
    "references": [
      {
        "title": "Playwright API testing",
        "url": "https://playwright.dev/docs/api-testing",
        "description": "Pomiar i walidacja odpowiedzi API."
      },
      {
        "title": "Test timeouts",
        "url": "https://playwright.dev/docs/test-timeouts",
        "description": "Timeouty testów i asercji."
      },
      {
        "title": "k6",
        "url": "https://grafana.com/docs/k6/latest/",
        "description": "Dedykowane narzędzie do testów obciążeniowych."
      }
    ],
    "tipsAndTricks": [
      "Test API powinien weryfikować kontrakt, semantykę i skutki uboczne, nie tylko status HTTP.",
      "Scenariusze negatywne API są równie ważne jak happy path: auth, validation, forbidden, conflict i not found.",
      "Dane tworzone przez API muszą mieć sprzątanie danych albo unikalny identyfikator przebiegu.",
      "Klient API w testach powinien upraszczać requesty, ale nie ukrywać istotnych asercji."
    ],
    "commonMistakes": [
      {
        "mistake": "Sprawdzanie wyłącznie response.ok()",
        "solution": "Dodaj asercje statusu, ciało odpowiedzi, nagłówki, kontraktu i skutku w systemie."
      },
      {
        "mistake": "Brak testów 401/403/404/409/422",
        "solution": "Projektuj negatywne scenariusze jako część kontraktu API."
      },
      {
        "mistake": "Tworzenie danych bez sprzątanie danychu",
        "solution": "Używaj sprzątanie danych trackera, run_id albo fixture usuwającej zasoby po teście."
      },
      {
        "mistake": "Wartości wklejane w string GraphQL",
        "solution": "Używaj variables, aby uniknąć błędów formatowania i injection."
      }
    ]
  }
};
