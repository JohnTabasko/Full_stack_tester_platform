import type { Lesson } from "../../../renderer/types";
import theory11_5 from './lesson-11.5.md?raw';

export const lesson11_5: Lesson = {
  "id": "11.5",
  "moduleId": 11,
  "title": "Dobre praktyki i optymalizacja CI/CD",
  "description": "Szybki feedback, cache, dzielenie testów, bramki jakości, obsługa niestabilnych testów, bezpieczeństwo, optymalizacja kosztów i strategia tagowania.",
  "order": 5,
  "difficulty": "advanced",
  "tags": [
    "ci-cd",
    "playwright",
    "pipeline",
    "artefakty"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz zaprojektować pipeline dla tematu „Dobre praktyki i optymalizacja CI/CD”, który daje szybki feedback, publikuje artefakty diagnostyczne i bezpiecznie obsługuje konfigurację oraz sekrety.",
    "theory": theory11_5,
    "codeExamples": [
      "# Przykład warstw pipeline\nPR:\n  - lint\n  - typecheck\n  - @smoke\nNightly:\n  - full regression\n  - visual tests\n  - API contract checks\nRelease:\n  - cross-browser\n  - performance smoke\n  - manual approval if critical failures\n",
      "type QualityGate = {\n  smokePassed: boolean;\n  criticalFailures: number;\n  flakyRate: number;\n  maxDurationMinutes: number;\n};\n\nfunction canMerge(gate: QualityGate) {\n  return gate.smokePassed && gate.criticalFailures === 0 && gate.flakyRate < 0.02;\n}\n"
    ],
    "exercises": [
      {
        "id": "ex-11-5-1",
        "title": "Pipeline podstawowy",
        "description": "Dla tematu „Dobre praktyki i optymalizacja CI/CD” zaprojektuj pipeline: install, typecheck/lint, test, artefakty."
      },
      {
        "id": "ex-11-5-2",
        "title": "Smoke vs full",
        "description": "Podziel testy na szybki zestaw PR i pełną regresję nocną."
      },
      {
        "id": "ex-11-5-3",
        "title": "Artefakty",
        "description": "Dodaj publikację HTML, JUnit, trace i screenshotów nawet przy failed job."
      },
      {
        "id": "ex-11-5-4",
        "title": "Sekrety",
        "description": "Wskaż zmienne wrażliwe i opisz, jak przechowywać je w danej platformie CI."
      },
      {
        "id": "ex-11-5-5",
        "title": "Równoległość",
        "description": "Zaprojektuj matrix albo sharding i opisz wymagania izolacji danych."
      },
      {
        "id": "ex-11-5-6",
        "title": "Quality gate",
        "description": "Zdefiniuj warunki blokujące merge lub release."
      }
    ],
    "quiz": [
      {
        "id": "q11-5-1",
        "question": "Jaki jest główny cel CI dla testów Playwright?",
        "options": [
          "Szybka, powtarzalna i diagnostyczna informacja o jakości zmiany",
          "Uruchamianie losowych testów",
          "Ukrywanie błędów",
          "Zastąpienie review"
        ],
        "correctAnswer": 0,
        "explanation": "CI ma dostarczać wiarygodny sygnał decyzyjny dla zespołu."
      },
      {
        "id": "q11-5-2",
        "question": "Dlaczego publikujemy artefakty przy failed job?",
        "options": [
          "Bez nich diagnoza awarii w CI jest wolniejsza lub niemożliwa",
          "Bo zwiększają liczbę testów",
          "Bo zastępują asercje",
          "Nie należy ich publikować"
        ],
        "correctAnswer": 0,
        "explanation": "Trace i raport HTML są podstawą analizy nieudanego przebiegu."
      },
      {
        "id": "q11-5-3",
        "question": "Co oznacza matrix strategy?",
        "options": [
          "Uruchomienie jobów dla wielu konfiguracji, np. przeglądarek lub shardów",
          "Tabelę CSS",
          "Ręczny deploy",
          "Brak równoległości"
        ],
        "correctAnswer": 0,
        "explanation": "Matrix skaluje wykonanie przez kombinacje parametrów."
      },
      {
        "id": "q11-5-4",
        "question": "Kiedy sharding ma sens?",
        "options": [
          "Gdy suite jest duża i testy są niezależne",
          "Gdy testy współdzielą dane",
          "Dla jednego testu",
          "Zamiast cleanupu"
        ],
        "correctAnswer": 0,
        "explanation": "Sharding wymaga niezależnych testów i izolowanych danych."
      },
      {
        "id": "q11-5-5",
        "question": "Co powinien zawierać quality gate?",
        "options": [
          "Warunki pass/fail powiązane z ryzykiem, np. smoke 100%, brak critical failures",
          "Wyłącznie czas zegara",
          "Sekret produkcyjny",
          "Brak kryteriów"
        ],
        "correctAnswer": 0,
        "explanation": "Quality gate zamienia wymagania jakościowe w decyzję pipeline."
      },
      {
        "id": "q11-5-6",
        "question": "Dlaczego cache bywa ryzykowny?",
        "options": [
          "Niepoprawny klucz cache może użyć starych zależności",
          "Bo zawsze spowalnia",
          "Bo usuwa raport",
          "Bo zastępuje npm ci"
        ],
        "correctAnswer": 0,
        "explanation": "Cache musi być powiązany z lockfile i wersją środowiska."
      },
      {
        "id": "q11-5-7",
        "question": "Jak traktować flaky test w CI?",
        "options": [
          "Jako defekt wymagający klasyfikacji i naprawy",
          "Jako normalny stan bez reakcji",
          "Jako powód do usunięcia CI",
          "Jako sekret"
        ],
        "correctAnswer": 0,
        "explanation": "Flaky test niszczy zaufanie do pipeline."
      },
      {
        "id": "q11-5-8",
        "question": "Najważniejsza zasada lekcji „Dobre praktyki i optymalizacja CI/CD” to:",
        "options": [
          "Pipeline ma skracać drogę od zmiany do decyzji bez utraty diagnostyki",
          "Pipeline powinien być jak najdłuższy",
          "Niepotrzebne są raporty",
          "Sekrety można commitować"
        ],
        "correctAnswer": 0,
        "explanation": "CI/CD jest systemem informacji o jakości."
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
        "title": "Playwright CI",
        "url": "https://playwright.dev/docs/ci",
        "description": "Oficjalne zalecenia uruchamiania Playwright w CI."
      },
      {
        "title": "GitHub Actions",
        "url": "https://docs.github.com/en/actions",
        "description": "Dokumentacja workflow, matrix, artefakty, cache i sekrety."
      },
      {
        "title": "GitLab CI/CD",
        "url": "https://docs.gitlab.com/ee/ci/",
        "description": "Dokumentacja stages, jobs, artefakty, cache, pages i parallel."
      },
      {
        "title": "Jenkins Pipeline",
        "url": "https://www.jenkins.io/doc/book/pipeline/",
        "description": "Dokumentacja Jenkinsfile i pipeline declarative."
      }
    ],
    "tipsAndTricks": [
      "Zawsze opieraj architekturę testów na zasadach SOLID, unikając przedwczesnej abstrakcji zgodnie z zasadą WET (Write Everything Twice) z podręczników 2026.",
      
      "Pipeline jest częścią produktu testowego: powinien być szybki, powtarzalny, diagnostyczny i bezpieczny.",
      "Najpierw optymalizuj feedback dla PR, dopiero potem pełną regresję.",
      "Artefakty po porażce są obowiązkowe: raport HTML, JUnit, trace, screenshoty i logi.",
      "Cache i sharding przyspieszają dopiero wtedy, gdy dane i środowisko są izolowane."
    ],
    "commonMistakes": [
      {
        "mistake": "Pipeline uruchamia pełną regresję przy każdym małym PR",
        "solution": "Podziel testy na smoke, affected/critical, nightly i release."
      },
      {
        "mistake": "Brak artefaktów po failed job",
        "solution": "Publikuj raporty zawsze, także przy porażce, używając warunku always/when: always."
      },
      {
        "mistake": "Sekrety w YAML lub logach",
        "solution": "Używaj sekrety/variables platformy i redakcji logów."
      },
      {
        "mistake": "Sharding bez stabilnych danych",
        "solution": "Najpierw zapewnij izolację użytkowników, tenantów i cleanup."
      }
    ]
  }
};
