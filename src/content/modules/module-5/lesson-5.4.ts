import type { Lesson } from '../../../renderer/types';
import theory5_4 from './lesson-5.4.md?raw';

export const lesson5_4: Lesson = {
  "id": "5.4",
  "moduleId": 5,
  "title": "Równoległość i dzielenie testów",
  "description": "Workery, fullyParallel, dzielenie testów, tryb serial i parallel, warunki wyścigu, izolacja danych i skalowanie testów w CI.",
  "order": 4,
  "difficulty": "intermediate",
  "tags": [
    "parallelization",
    "sharding",
    "workers",
    "race-condition",
    "ci-scaling"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz bezpiecznie przyspieszać pakiet testów przez workery i dzielenie testów, rozumiesz ryzyka równoległości oraz umiesz projektować dane i środowisko odporne na warunki wyścigu.",
    "theory": theory5_4,
    "codeExamples": [
      "export default defineConfig({\n  fullyParallel: true,\n  workers: process.env.CI ? 4 : undefined,\n  retries: process.env.CI ? 2 : 0,\n});\n",
      "# Sharding w CI\nnpx playwright test --shard=1/4\nnpx playwright test --shard=2/4\nnpx playwright test --shard=3/4\nnpx playwright test --shard=4/4\n"
    ],
    "exercises": [
      {
        "id": "ex-5-4-1",
        "title": "Struktura pakietu",
        "description": "Dla tematu „Równoległość i dzielenie testów” zaprojektuj strukturę test.describe/testów lub fixture odpowiadającą realnemu modułowi aplikacji."
      },
      {
        "id": "ex-5-4-2",
        "title": "Diagnostyka testInfo",
        "description": "Dodaj test.step, attachment lub annotations tak, aby raport ułatwiał analizę awarii."
      },
      {
        "id": "ex-5-4-3",
        "title": "Izolacja danych",
        "description": "Opisz, jak dane testowe będą izolowane przy równoległym wykonaniu."
      },
      {
        "id": "ex-5-4-4",
        "title": "Konfiguracja CI",
        "description": "Zaproponuj, które testy uruchamiać w PR, nightly i release pipeline."
      },
      {
        "id": "ex-5-4-5",
        "title": "Refaktor organizacji",
        "description": "Przepisz powtarzalny setup z hooków do fixture albo helpera o jednej odpowiedzialności."
      },
      {
        "id": "ex-5-4-6",
        "title": "Review utrzymywalności",
        "description": "Przygotuj checklistę review dla organizacji testów w tym obszarze."
      }
    ],
    "quiz": [
      {
        "id": "q5-4-1",
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
        "id": "q5-4-2",
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
        "id": "q5-4-3",
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
        "id": "q5-4-4",
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
        "id": "q5-4-5",
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
        "id": "q5-4-6",
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
        "id": "q5-4-7",
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
        "id": "q5-4-8",
        "question": "Najważniejsza zasada lekcji „Równoległość i dzielenie testów” to:",
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
        "url": "https://playwright.dev/docs/test-intro",
        "description": "Oficjalny przewodnik po runnerze Playwright Test."
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
