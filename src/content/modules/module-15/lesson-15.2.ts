import type { Lesson } from "../../../renderer/types";
import theory15_2 from './lesson-15.2.md?raw';

export const lesson15_2: Lesson = {
  "id": "15.2",
  "moduleId": 15,
  "title": "Testowanie panelu aplikacji SaaS",
  "description": "Multi-tenant, subskrypcje, RBAC, dashboardy, dane w czasie rzeczywistym, flagi funkcji, integracje i audyt.",
  "order": 2,
  "difficulty": "expert",
  "tags": [
    "real-world",
    "portfolio",
    "capstone",
    "qa-automation"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz zaprojektować i ocenić projekt „Testowanie panelu aplikacji SaaS” jako spójny system testów full stack z danymi, CI, raportowaniem i dokumentacją.",
    "theory": theory15_2,
    "codeExamples": [
      "type TenantScenario = {\n  actorTenant: string;\n  targetTenant: string;\n  expectedStatus: 200 | 403 | 404;\n};\n\nconst cases: TenantScenario[] = [\n  { actorTenant: 'A', targetTenant: 'A', expectedStatus: 200 },\n  { actorTenant: 'A', targetTenant: 'B', expectedStatus: 403 },\n];\n",
      "// Test flagi funkcjonalnej — koncepcyjnie\nawait featureFlags.set('new-dashboard', true, { tenantId });\nawait page.goto('/dashboard');\nawait expect(page.getByText('Nowy dashboard')).toBeVisible();\n"
    ],
    "exercises": [
      {
        "id": "ex-15-2-1",
        "title": "Mapa zakresu",
        "description": "Dla projektu „Testowanie panelu aplikacji SaaS” zapisz moduły funkcjonalne, ryzyka i poziomy testów."
      },
      {
        "id": "ex-15-2-2",
        "title": "Architektura frameworka",
        "description": "Zaprojektuj foldery: pages, clients, builders, fixtures, assertions, config i tests."
      },
      {
        "id": "ex-15-2-3",
        "title": "Dane testowe",
        "description": "Opisz strategię danych, izolacji i cleanupu dla krytycznych scenariuszy."
      },
      {
        "id": "ex-15-2-4",
        "title": "Pipeline",
        "description": "Zaprojektuj CI: lint, typecheck, smoke, full regression, artifacts i quality gate."
      },
      {
        "id": "ex-15-2-5",
        "title": "Raport portfolio",
        "description": "Przygotuj fragment README opisujący cel, zakres, uruchomienie i interpretację wyników."
      },
      {
        "id": "ex-15-2-6",
        "title": "Ocena projektu",
        "description": "Stwórz checklistę odbioru projektu: stabilność, czytelność, diagnostyka, pokrycie ryzyk."
      }
    ],
    "quiz": [
      {
        "id": "q15-2-1",
        "question": "Co powinien udowadniać projekt real-world?",
        "options": [
          "Umiejętność zaprojektowania systemu testów wokół ryzyka i utrzymania",
          "Wyłącznie znajomość jednego lokatora",
          "Liczbę plików",
          "Brak README"
        ],
        "correctAnswer": 0,
        "explanation": "Projekt ma pokazać sposób myślenia, architekturę i jakość decyzji."
      },
      {
        "id": "q15-2-2",
        "question": "Dlaczego projekt powinien mieć testy na różnych poziomach?",
        "options": [
          "Bo różne ryzyka najtaniej sprawdza się na różnych warstwach",
          "Bo E2E zawsze wystarczy",
          "Bo API jest zbędne",
          "Bo SQL nie dotyczy testów"
        ],
        "correctAnswer": 0,
        "explanation": "Full stack testing oznacza dobór poziomu testu do ryzyka."
      },
      {
        "id": "q15-2-3",
        "question": "Co jest ważne w projekcie portfolio?",
        "options": [
          "Instrukcja uruchomienia, raporty, decyzje architektoniczne i przykładowe wyniki",
          "Ukrycie konfiguracji",
          "Brak CI",
          "Same screeny"
        ],
        "correctAnswer": 0,
        "explanation": "Portfolio musi być czytelne i możliwe do zweryfikowania."
      },
      {
        "id": "q15-2-4",
        "question": "Co powinien robić quality gate projektu?",
        "options": [
          "Blokować merge/release przy naruszeniu ustalonych kryteriów jakości",
          "Zawsze przepuszczać zmiany",
          "Ukrywać flaky testy",
          "Pomijać raporty"
        ],
        "correctAnswer": 0,
        "explanation": "Quality gate zamienia wymagania jakościowe w decyzję pipeline."
      },
      {
        "id": "q15-2-5",
        "question": "Dlaczego warto opisać kompromisy?",
        "options": [
          "Pokazują świadomość ograniczeń i dojrzałość inżynierską",
          "Obniżają wartość projektu",
          "Są zbędne",
          "Ukrywają błędy"
        ],
        "correctAnswer": 0,
        "explanation": "Świadomy kompromis jest lepszy niż pozorna kompletność."
      },
      {
        "id": "q15-2-6",
        "question": "Co jest antywzorcem projektu końcowego?",
        "options": [
          "Dużo testów bez strategii, danych i raportów",
          "Jasny zakres",
          "CI z artefaktami",
          "README"
        ],
        "correctAnswer": 0,
        "explanation": "Liczba testów bez spójnej architektury nie dowodzi kompetencji."
      },
      {
        "id": "q15-2-7",
        "question": "Co powinno znaleźć się w README?",
        "options": [
          "Cel, zakres, instalacja, komendy, struktura, raporty i decyzje",
          "Tylko nazwa repo",
          "Sekrety",
          "Brak wymagań"
        ],
        "correctAnswer": 0,
        "explanation": "README jest interfejsem projektu dla osoby oceniającej."
      },
      {
        "id": "q15-2-8",
        "question": "Najważniejsza zasada lekcji „Testowanie panelu aplikacji SaaS” to:",
        "options": [
          "Projekt ma być spójny, uruchamialny i diagnostyczny",
          "Ma być jak największy",
          "Nie musi działać",
          "Nie wymaga testów API"
        ],
        "correctAnswer": 0,
        "explanation": "Real-world project jest dowodem praktycznej kompetencji."
      }
    ],
    "references": [
      {
        "title": "Playwright Best Practices",
        "url": "https://playwright.dev/docs/best-practices",
        "description": "Dobre praktyki przy projektowaniu stabilnych testów E2E."
      },
      {
        "title": "GitHub Actions",
        "url": "https://docs.github.com/en/actions",
        "description": "Automatyzacja CI/CD dla projektu portfolio."
      },
      {
        "title": "OWASP Testing Guide",
        "url": "https://owasp.org/www-project-web-bezpieczeństwo-testing-guide/",
        "description": "Źródło inspiracji dla scenariuszy bezpieczeństwa w projektach końcowych."
      },
      {
        "title": "Testing Library Guiding Principles",
        "url": "https://testing-library.com/docs/guiding-principles/",
        "description": "Zasady testowania z perspektywy użytkownika."
      }
    ],
    "tipsAndTricks": [
      "Projekt real-world powinien pokazywać decyzje, kompromisy i ryzyka, nie tylko dużą liczbę testów.",
      "Każdy projekt portfolio potrzebuje README, komend uruchomieniowych, raportów i przykładowej awarii z diagnostyką.",
      "Zakres projektu dobieraj tak, aby dało się go utrzymać; pełny stack w małej skali jest lepszy niż ogromny chaos.",
      "W projekcie końcowym pokaż interfejs użytkownika, API, dane, CI i raportowanie jako jeden spójny system jakości."
    ],
    "commonMistakes": [
      {
        "mistake": "Projekt jest zbiorem przypadkowych testów",
        "solution": "Zacznij od strategii: zakres, ryzyka, poziomy testów i kryteria zaliczenia."
      },
      {
        "mistake": "Brak danych i cleanupu",
        "solution": "Użyj builderów, API setup, run_id i cleanup trackera."
      },
      {
        "mistake": "Brak dokumentacji uruchomienia",
        "solution": "README musi pozwalać uruchomić projekt od zera."
      },
      {
        "mistake": "CI bez artefaktów",
        "solution": "Publikuj HTML/JUnit/trace/screenshoty, szczególnie przy awarii."
      }
    ]
  }
};
