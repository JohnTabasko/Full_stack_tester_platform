import type { Lesson } from "../../../renderer/types";
import theory8_3 from './lesson-8.3.md?raw';

export const lesson8_3: Lesson = {
  "id": "8.3",
  "moduleId": 8,
  "title": "Kontrakty API i walidacja schematów",
  "description": "Kontrakty API: JSON Schema, Ajv, OpenAPI, błędy, autoryzacja, nagłówki, paginacja, contract drift i breaking changes.",
  "order": 3,
  "difficulty": "intermediate",
  "tags": [
    "api-testing",
    "playwright",
    "contract",
    "http"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz projektować testy API dla tematu „Kontrakty API i walidacja schematów”, obejmujące kontrakt, dane, scenariusze negatywne, sprzątanie danych i diagnostykę.",
    "theory": theory8_3,
    "codeExamples": [
      "import Ajv from 'ajv';\nconst ajv = new Ajv();\n\nconst schema = {\n  type: 'object',\n  required: ['id', 'status', 'totalGross'],\n  properties: {\n    id: { type: 'string' },\n    status: { enum: ['new', 'paid', 'cancelled'] },\n    totalGross: { type: 'number', minimum: 0 },\n  },\n};\n\nconst validate = ajv.compile(schema);\nexpect(validate(await response.json())).toBe(true);\n",
      "// Schema + semantyka\nexpect(order.status).toBe('paid');\nexpect(order.totalGross).toBeGreaterThan(0);\nexpect(order.currency).toBe('PLN');\n"
    ],
    "exercises": [
      {
        "id": "ex-8-3-1",
        "title": "Ścieżka sukcesu kontraktu",
        "description": "Dla tematu „Kontrakty API i walidacja schematów” napisz test poprawnej odpowiedzi: status, body i headers."
      },
      {
        "id": "ex-8-3-2",
        "title": "Negative path",
        "description": "Dodaj test braku autoryzacji, braku uprawnień, niepoprawnych danych albo konfliktu."
      },
      {
        "id": "ex-8-3-3",
        "title": "Dane testowe",
        "description": "Przygotuj dane przez API lub fixture i zaplanuj sprzątanie danych."
      },
      {
        "id": "ex-8-3-4",
        "title": "Walidacja schematu",
        "description": "Opisz albo zaimplementuj walidację struktury response względem schematu."
      },
      {
        "id": "ex-8-3-5",
        "title": "Paginacja lub lista",
        "description": "Sprawdź limit, sortowanie, cursor/offset i stabilność listy wyników."
      },
      {
        "id": "ex-8-3-6",
        "title": "Organizacja kodu",
        "description": "Wydziel klienta API/resource class bez ukrywania sensu asercji."
      }
    ],
    "quiz": [
      {
        "id": "q8-3-1",
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
        "id": "q8-3-2",
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
        "id": "q8-3-3",
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
        "id": "q8-3-4",
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
        "id": "q8-3-5",
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
        "id": "q8-3-6",
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
        "id": "q8-3-7",
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
        "id": "q8-3-8",
        "question": "Najważniejsza zasada lekcji „Kontrakty API i walidacja schematów” to:",
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
        "title": "Playwright API testing",
        "url": "https://playwright.dev/docs/api-testing",
        "description": "Testowanie API z Playwright."
      },
      {
        "title": "APIResponseAssertions",
        "url": "https://playwright.dev/docs/api/class-apiresponseassertions",
        "description": "Asercje odpowiedzi API."
      },
      {
        "title": "OpenAPI",
        "url": "https://www.openapis.org/",
        "description": "Specyfikacja kontraktów REST API."
      },
      {
        "title": "Ajv",
        "url": "https://ajv.js.org/",
        "description": "Walidator JSON Schema."
      }
    ],
    "tipsAndTricks": [
      "Zawsze opieraj architekturę testów na zasadach SOLID, unikając przedwczesnej abstrakcji zgodnie z zasadą WET (Write Everything Twice) z podręczników 2026.",
      
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
