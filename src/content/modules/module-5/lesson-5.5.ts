import type { Lesson } from '../../../renderer/types';
import theory5_5 from './lesson-5.5.md?raw';

export const lesson5_5: Lesson = {
  "id": "5.5",
  "moduleId": 5,
  "title": "Organizacja testów i tagowanie",
  "description": "Struktura, nazewnictwo, tagi, smoke/regresja/krytyczne/wolne, adnotacje, własność i integracja z pipeline CI/CD.",
  "order": 5,
  "difficulty": "intermediate",
  "tags": [
    "tagging",
    "organization",
    "smoke",
    "regression",
    "annotations",
    "ownership"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz organizować testy według ryzyka i celu uruchomienia, projektować tagi dla CI oraz dodawać metadane ułatwiające własność, raportowanie i utrzymanie pakietu.",
    "theory": theory5_5,
    "codeExamples": [
      "test('gość może złożyć zamówienie @smoke @critical', async ({ page }, testInfo) => {\n  testInfo.annotations.push({ type: 'owner', description: 'team-checkout' });\n  testInfo.annotations.push({ type: 'requirement', description: 'CHECKOUT-001' });\n});\n",
      "# Przykładowe komendy CI\nnpx playwright test --grep @smoke\nnpx playwright test --grep @critical\nnpx playwright test --grep-invert @slow\n"
    ],
    "exercises": [
      {
        "id": "ex-5-5-1",
        "title": "Struktura pakietu",
        "description": "Dla tematu „Organizacja testów i tagowanie” zaprojektuj strukturę test.describe/testów lub fixture odpowiadającą realnemu modułowi aplikacji."
      },
      {
        "id": "ex-5-5-2",
        "title": "Diagnostyka testInfo",
        "description": "Dodaj test.step, attachment lub annotations tak, aby raport ułatwiał analizę awarii."
      },
      {
        "id": "ex-5-5-3",
        "title": "Izolacja danych",
        "description": "Opisz, jak dane testowe będą izolowane przy równoległym wykonaniu."
      },
      {
        "id": "ex-5-5-4",
        "title": "Konfiguracja CI",
        "description": "Zaproponuj, które testy uruchamiać w PR, nightly i release pipeline."
      },
      {
        "id": "ex-5-5-5",
        "title": "Refaktor organizacji",
        "description": "Przepisz powtarzalny setup z hooków do fixture albo helpera o jednej odpowiedzialności."
      },
      {
        "id": "ex-5-5-6",
        "title": "Review utrzymywalności",
        "description": "Przygotuj checklistę review dla organizacji testów w tym obszarze."
      }
    ],
    "quiz": [
      {
        "id": "q5-5-1",
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
        "id": "q5-5-2",
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
        "id": "q5-5-3",
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
        "id": "q5-5-4",
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
        "id": "q5-5-5",
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
        "id": "q5-5-6",
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
        "id": "q5-5-7",
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
        "id": "q5-5-8",
        "question": "Najważniejsza zasada lekcji „Organizacja testów i tagowanie” to:",
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
      "Zawsze opieraj architekturę testów na zasadach SOLID, unikając przedwczesnej abstrakcji zgodnie z zasadą WET (Write Everything Twice) z podręczników 2026.",
      
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
