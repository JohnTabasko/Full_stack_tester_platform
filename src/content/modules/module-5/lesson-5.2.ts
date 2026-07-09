import type { Lesson } from '../../../renderer/types';
import theory5_2 from './lesson-5.2.md?raw';

export const lesson5_2: Lesson = {
  "id": "5.2",
  "moduleId": 5,
  "title": "Fikstury — omówienie szczegółowe",
  "description": "Wstrzykiwanie zależności w Playwright: własne fikstury, fikstury workerowe, obiekty stron, klienci API i automatyczne fikstury i cykl życia zasobów.",
  "order": 2,
  "difficulty": "intermediate",
  "tags": [
    "fixtures",
    "dependency-injection",
    "worker-fixtures",
    "page-objects",
    "api-clients"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz projektować fikstury jako mechanizm wstrzykiwania zależności, rozumiesz różnicę między zakresem testowym i workerowym oraz umiesz tworzyć fikstury dla obiektów stron, klientów API i danych testowych.",
    "theory": theory5_2,
    "codeExamples": [
      "import { test as base } from '@playwright/test';\nimport { LoginPage } from '../pages/LoginPage';\nimport { OrdersClient } from '../clients/OrdersClient';\n\ntype Fixtures = {\n  loginPage: LoginPage;\n  ordersClient: OrdersClient;\n};\n\nexport const test = base.extend<Fixtures>({\n  loginPage: async ({ page }, use) => {\n    await use(new LoginPage(page));\n  },\n  ordersClient: async ({ request }, use) => {\n    await use(new OrdersClient(request));\n  },\n});\n",
      "export const test = base.extend<{ testUser: User }>({\n  testUser: async ({}, use) => {\n    const user = await createUser({ role: 'customer' });\n    await use(user);\n    await deleteUser(user.id);\n  },\n});\n"
    ],
    "exercises": [
      {
        "id": "ex-5-2-1",
        "title": "Struktura pakietu",
        "description": "Dla tematu „Fikstury — omówienie szczegółowe” zaprojektuj strukturę test.describe/testów lub fixture odpowiadającą realnemu modułowi aplikacji."
      },
      {
        "id": "ex-5-2-2",
        "title": "Diagnostyka testInfo",
        "description": "Dodaj test.step, attachment lub annotations tak, aby raport ułatwiał analizę awarii."
      },
      {
        "id": "ex-5-2-3",
        "title": "Izolacja danych",
        "description": "Opisz, jak dane testowe będą izolowane przy równoległym wykonaniu."
      },
      {
        "id": "ex-5-2-4",
        "title": "Konfiguracja CI",
        "description": "Zaproponuj, które testy uruchamiać w PR, nightly i release pipeline."
      },
      {
        "id": "ex-5-2-5",
        "title": "Refaktor organizacji",
        "description": "Przepisz powtarzalny setup z hooków do fixture albo helpera o jednej odpowiedzialności."
      },
      {
        "id": "ex-5-2-6",
        "title": "Review utrzymywalności",
        "description": "Przygotuj checklistę review dla organizacji testów w tym obszarze."
      }
    ],
    "quiz": [
      {
        "id": "q5-2-1",
        "question": "Jaka jest rola Runner testów Playwrighta?",
        "options": [
          "Organizuje uruchamianie testów, izolację, fixtures, raporty i równoległość",
          "Zastępuje aplikację backendową",
          "Służy tylko do screenshotów",
          "Nie ma wpływu na CI"
        ],
        "correctAnswer": 0,
        "explanation": "Runner jest mechanizmem wykonawczym całego projektu testowego."
      },
      {
        "id": "q5-2-2",
        "question": "Kiedy fixture jest dobrym rozwiązaniem?",
        "options": [
          "Gdy powtarzalny kontekst ma jasną odpowiedzialność i jest używany w wielu testach",
          "Gdy chcemy ukryć cały test",
          "Zawsze zamiast asercji",
          "Tylko dla CSS"
        ],
        "correctAnswer": 0,
        "explanation": "Fixture powinien upraszczać setup i dependency injection."
      },
      {
        "id": "q5-2-3",
        "question": "Co jest warunkiem bezpiecznej równoległości?",
        "options": [
          "Izolowane dane, konta i zasoby",
          "Wspólny globalny użytkownik",
          "Brak cleanupu",
          "Jedna baza produkcyjna"
        ],
        "correctAnswer": 0,
        "explanation": "Bez izolacji testy równoległe wpływają na siebie nawzajem."
      },
      {
        "id": "q5-2-4",
        "question": "Do czego służą tagi testów?",
        "options": [
          "Do selekcji suite w CI i opisania intencji testu",
          "Do ukrywania błędów",
          "Do zmiany przeglądarki losowo",
          "Do usuwania raportów"
        ],
        "correctAnswer": 0,
        "explanation": "Tagi pozwalają uruchamiać smoke, regression, critical czy slow w odpowiednich pipeline’ach."
      },
      {
        "id": "q5-2-5",
        "question": "Co jest antywzorcem w hooks?",
        "options": [
          "Ukrywanie w beforeEach złożonego flow, którego znaczenie nie jest widoczne w teście",
          "Krótki setup wspólny",
          "Cleanup zasobu",
          "Czytelny test.step"
        ],
        "correctAnswer": 0,
        "explanation": "Zbyt rozbudowane hooki utrudniają zrozumienie scenariusza."
      },
      {
        "id": "q5-2-6",
        "question": "Kiedy użyć sharding?",
        "options": [
          "Gdy suite jest duża i chcemy podzielić ją między maszyny CI",
          "Dla jednego testu lokalnego",
          "Zamiast asercji",
          "Do mockowania API"
        ],
        "correctAnswer": 0,
        "explanation": "Sharding skaluje wykonanie testów w wielu procesach/maszynach."
      },
      {
        "id": "q5-2-7",
        "question": "Co powinien zawierać dobry raport testu?",
        "options": [
          "Kroki, artefakty, adnotacje i czytelny błąd",
          "Tylko nazwę pliku",
          "Brak trace",
          "Same logi npm"
        ],
        "correctAnswer": 0,
        "explanation": "Raport powinien skracać czas diagnozy."
      },
      {
        "id": "q5-2-8",
        "question": "Najważniejsza zasada lekcji „Fikstury — omówienie szczegółowe” to:",
        "options": [
          "Organizacja wykonania testów jest elementem strategii jakości",
          "Runner nie wymaga konfiguracji",
          "Równoległość zawsze jest bezpieczna",
          "Tagi są zbędne"
        ],
        "correctAnswer": 0,
        "explanation": "Sposób uruchamiania testów wpływa na szybkość, stabilność i zaufanie do wyników."
      }
    ],
    "references": [
      {
        "title": "Runner testów Playwright",
        "url": "https://playwright.dev/docs/writing-tests",
        "description": "Oficjalny przewodnik po pisaniu testów w Playwright Test."
      },
      {
        "title": "Playwright Fixtures",
        "url": "https://playwright.dev/docs/test-fixtures",
        "description": "Dokumentacja fixtures i dependency injection w Playwright."
      },
      {
        "title": "Playwright Parallelism",
        "url": "https://playwright.dev/docs/test-parallel",
        "description": "Równoległość, workers, sharding i tryby wykonywania testów."
      },
      {
        "title": "Playwright Annotations",
        "url": "https://playwright.dev/docs/test-annotations",
        "description": "Tagi, adnotacje, skip, fixme, slow i metadane testów."
      }
    ],
    "tipsAndTricks": [
      "Runner jest częścią architektury testów: organizuje izolację, równoległość, retry, raportowanie i konfigurację.",
      "Fixtures powinny ukrywać przygotowanie kontekstu, ale nie powinny ukrywać sensu scenariusza.",
      "Równoległość przyspiesza suite tylko wtedy, gdy dane i środowisko są naprawdę izolowane.",
      "Tagi i adnotacje są kontraktem z CI — projektuj je tak, aby pipeline mógł podejmować decyzje."
    ],
    "commonMistakes": [
      {
        "mistake": "Nadmierne używanie beforeEach do wszystkiego",
        "solution": "Przygotowanie powtarzalnego kontekstu przenieś do fixtures, a w hookach zostaw tylko logikę wspólną dla suite."
      },
      {
        "mistake": "Fixture robi zbyt wiele",
        "solution": "Fixture powinien mieć jedną odpowiedzialność i czytelną nazwę domenową."
      },
      {
        "mistake": "Równoległość bez izolacji danych",
        "solution": "Używaj unikalnych danych per test, osobnych kont, tenantów lub cleanupu po run_id."
      },
      {
        "mistake": "Tagi bez strategii",
        "solution": "Zdefiniuj znaczenie @smoke, @regression, @slow, @critical i powiąż je z pipeline."
      }
    ]
  }
};
