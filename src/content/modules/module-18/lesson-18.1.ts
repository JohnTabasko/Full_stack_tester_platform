import type { Lesson } from "../../../renderer/types";
import theory18_1 from './lesson-18.1.md?raw';

export const lesson18_1: Lesson = {
  "id": "18.1",
  "moduleId": 18,
  "title": "Podstawy TypeScript dla automatyzacji",
  "description": "Typy, interfejsy, typy unii, typy generyczne, typy narzędziowe i modelowanie danych testowych w kodzie automatyzacji.",
  "order": 1,
  "difficulty": "beginner",
  "tags": [
    "typescript",
    "types",
    "interfaces",
    "typy generyczne",
    "test-data",
    "type-safety"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji rozumiesz, jak TypeScript zwiększa bezpieczeństwo i czytelność kodu testowego, potrafisz modelować dane testowe typami oraz świadomie używać interfejsów, typy unii i typy generyczne w automatyzacji.",
    "theory": theory18_1,
    "codeExamples": [
      "import { expect, type APIResponse } from '@playwright/test';\n\ntype UserRole = 'admin' | 'manager' | 'customer';\ntype OrderStatus = 'new' | 'paid' | 'cancelled';\n\ninterface OrderSummary {\n  id: string;\n  status: OrderStatus;\n  totalGross: number;\n  ownerRole: UserRole;\n}\n\nasync function getJson<T>(response: APIResponse): Promise<T> {\n  expect(response.headers()['content-type']).toContain('application/json');\n  return await response.json() as T;\n}\n\nconst order = await getJson<OrderSummary>(response);\nexpect(order.status).toBe('paid');\n",
      "type Environment = 'local' | 'staging' | 'production';\n\ninterface TestConfig {\n  baseURL: string;\n  retries: number;\n  destructiveTestsEnabled: boolean;\n}\n\nconst configByEnvironment: Record<Environment, TestConfig> = {\n  local: { baseURL: 'http://localhost:3000', retries: 0, destructiveTestsEnabled: true },\n  staging: { baseURL: 'https://staging.example.test', retries: 2, destructiveTestsEnabled: true },\n  production: { baseURL: 'https://example.com', retries: 0, destructiveTestsEnabled: false },\n};\n"
    ],
    "exercises": [
      {
        "id": "ex-18-1-1",
        "title": "Model domeny",
        "description": "Zaprojektuj typy dla użytkownika, zamówienia i płatności w aplikacji e-commerce. Uwzględnij role i statusy jako typy unii."
      },
      {
        "id": "ex-18-1-2",
        "title": "Builder danych",
        "description": "Napisz funkcję buildUser(overrides), która używa Partial<T> i zawsze zwraca kompletny obiekt użytkownika."
      },
      {
        "id": "ex-18-1-3",
        "title": "Unknown zamiast any",
        "description": "Przepisz funkcję przyjmującą any tak, aby przyjmowała unknown i wykonywała jawne sprawdzenie typu."
      },
      {
        "id": "ex-18-1-4",
        "title": "Typowana odpowiedź API",
        "description": "Napisz helper getJson<T>() i użyj go w teście endpointu zamówień."
      },
      {
        "id": "ex-18-1-5",
        "title": "Utility types",
        "description": "Użyj Pick i Omit do utworzenia typów CreateUserRequest oraz PublicUserProfile."
      },
      {
        "id": "ex-18-1-6",
        "title": "Code review typów",
        "description": "Przejrzyj przykładowy helper testowy i wskaż miejsca, w których any ukrywa ryzyko."
      }
    ],
    "quiz": [
      {
        "id": "q18-1-1",
        "question": "Jaka jest główna korzyść z TypeScriptu w automatyzacji?",
        "options": [
          "Szybsze kliknięcia w interfejs użytkownika",
          "Wcześniejsze wykrywanie niespójności danych i kontraktów",
          "Brak potrzeby testów",
          "Automatyczna naprawa flaky testów"
        ],
        "correctAnswer": 1,
        "explanation": "TypeScript wykrywa wiele problemów już podczas pisania i kompilacji kodu."
      },
      {
        "id": "q18-1-2",
        "question": "Kiedy warto użyć union type?",
        "options": [
          "Dla skończonej listy statusów lub ról",
          "Dla dowolnego JSON-a bez struktury",
          "Tylko w CSS",
          "Nigdy w testach"
        ],
        "correctAnswer": 0,
        "explanation": "Union types dobrze modelują ograniczony zbiór możliwych wartości."
      },
      {
        "id": "q18-1-3",
        "question": "Dlaczego any jest ryzykowne?",
        "options": [
          "Bo wyłącza kontrolę typów",
          "Bo zawsze spowalnia testy",
          "Bo nie działa w Playwright",
          "Bo służy tylko do stringów"
        ],
        "correctAnswer": 0,
        "explanation": "any pozwala na dowolne operacje, więc błędy wychodzą dopiero w środowisko uruchomieniowe."
      },
      {
        "id": "q18-1-4",
        "question": "Do czego służy Partial<T>?",
        "options": [
          "Do oznaczenia wszystkich pól jako opcjonalnych",
          "Do usunięcia wszystkich pól",
          "Do zmiany typu na string",
          "Do walidacji środowisko uruchomieniowe"
        ],
        "correctAnswer": 0,
        "explanation": "Partial<T> jest przydatne np. w builderach danych testowych z nadpisaniami."
      },
      {
        "id": "q18-1-5",
        "question": "Czego TypeScript nie gwarantuje samodzielnie?",
        "options": [
          "Poprawności danych przychodzących z API w środowisko uruchomieniowe",
          "Podpowiedzi pól w edytorze",
          "Spójności union type",
          "Błędów kompilacji przy złym typie"
        ],
        "correctAnswer": 0,
        "explanation": "Dane z zewnątrz wymagają walidacji środowisko uruchomieniowe, np. schematem."
      },
      {
        "id": "q18-1-6",
        "question": "Co jest dobrą praktyką przy danych z pliku lub API?",
        "options": [
          "Od razu traktować je jako any",
          "Przyjąć unknown i jawnie zwalidować lub zmapować do typu",
          "Ignorować typy",
          "Zawsze parsować jako string"
        ],
        "correctAnswer": 1,
        "explanation": "Granice systemu wymagają walidacji, bo TypeScript nie widzi środowisko uruchomieniowe’u."
      },
      {
        "id": "q18-1-7",
        "question": "Co najlepiej opisuje typ jako dokumentację?",
        "options": [
          "Typ mówi, jakiego kształtu danych oczekuje kod",
          "Typ zastępuje wszystkie komentarze",
          "Typ jest widoczny tylko w przeglądarce",
          "Typ nie ma znaczenia dla review"
        ],
        "correctAnswer": 0,
        "explanation": "Typy opisują kontrakty funkcji, helperów i danych testowych."
      },
      {
        "id": "q18-1-8",
        "question": "Kiedy typy generyczne są przydatne?",
        "options": [
          "Gdy helper ma działać dla wielu typów, zachowując informację typową",
          "Tylko przy CSS",
          "Wyłącznie w testach manualnych",
          "Nigdy w API"
        ],
        "correctAnswer": 0,
        "explanation": "Generics pozwalają pisać elastyczne i typowane funkcje pomocnicze."
      }
    ],
    "references": [
      {
        "title": "TypeScript Handbook",
        "url": "https://www.typescriptlang.org/docs/",
        "description": "Oficjalny podręcznik języka TypeScript."
      },
      {
        "title": "Node.js Documentation",
        "url": "https://nodejs.org/docs/latest/api/",
        "description": "Dokumentacja środowisko uruchomieniowe’u Node.js i jego standardowych modułów."
      },
      {
        "title": "Git Documentation",
        "url": "https://git-scm.com/doc",
        "description": "Oficjalna dokumentacja systemu kontroli wersji Git."
      },
      {
        "title": "Conventional Commits",
        "url": "https://www.conventionalcommits.org/",
        "description": "Standard opisywania zmian w historii repozytorium."
      }
    ],
    "tipsAndTricks": [
      "Typuj dane domenowe, nie tylko parametry funkcji. To ułatwia rozmowę o wymaganiach.",
      "Unikaj any w helperach współdzielonych — tam błąd rozprzestrzenia się na cały projekt.",
      "Union type dla statusów procesu często ujawnia nieobsłużone przypadki podczas review.",
      "TypeScript nie zastępuje walidacji odpowiedzi API; łącz typy z kontraktami lub schematami środowisko uruchomieniowe."
    ],
    "commonMistakes": [
      {
        "mistake": "Używanie any dla wygody",
        "solution": "Zastąp any typem domenowym, generic albo unknown z walidacją."
      },
      {
        "mistake": "Zbyt ogólne stringi dla statusów",
        "solution": "Użyj union type, np. 'new' | 'paid' | 'cancelled'."
      },
      {
        "mistake": "Brak typów w builderach danych",
        "solution": "Builder powinien przyjmować Partial<T> i zwracać kompletny T."
      },
      {
        "mistake": "Wiara, że typ gwarantuje poprawność JSON-a z API",
        "solution": "Waliduj dane zewnętrzne schematem lub jawnie sprawdzaj kształt odpowiedzi."
      }
    ]
  }
};
