import type { Lesson } from "../../../renderer/types";
import theory15_3 from './lesson-15.3.md?raw';

export const lesson15_3: Lesson = {
  "id": "15.3",
  "moduleId": 15,
  "title": "Pełna konfiguracja projektu z CI/CD",
  "description": "Konfiguracja repozytorium, CI/CD, bramki jakości, Conventional Commits, konwencje, dokumentacja, sekrety i workflow wydawniczy.",
  "order": 3,
  "difficulty": "expert",
  "tags": [
    "real-world",
    "portfolio",
    "capstone",
    "qa-automation"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz zaprojektować i ocenić projekt „Pełna konfiguracja projektu z CI/CD” jako spójny system testów full stack z danymi, CI, raportowaniem i dokumentacją.",
    "theory": theory15_3,
    "codeExamples": [
      "name: quality-gate\non: [pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: 22, cache: 'npm' }\n      - run: npm ci\n      - run: npx playwright install --with-deps\n      - run: npm run lint\n      - run: npm run typecheck\n      - run: npm run test:smoke\n      - uses: actions/upload-artifact@v4\n        if: always()\n        with: { name: playwright-report, path: playwright-report }\n",
      "# PR checklist\n- [ ] Ryzyko opisane\n- [ ] Dane testowe izolowane\n- [ ] Raport i trace dostępne\n- [ ] Brak sekretów\n- [ ] README zaktualizowane\n"
    ],
    "exercises": [
      {
        "id": "ex-15-3-1",
        "title": "Mapa zakresu",
        "description": "Dla projektu „Pełna konfiguracja projektu z CI/CD” zapisz moduły funkcjonalne, ryzyka i poziomy testów."
      },
      {
        "id": "ex-15-3-2",
        "title": "Architektura frameworka",
        "description": "Zaprojektuj foldery: pages, clients, builders, fixtures, assertions, config i tests."
      },
      {
        "id": "ex-15-3-3",
        "title": "Dane testowe",
        "description": "Opisz strategię danych, izolacji i cleanupu dla krytycznych scenariuszy."
      },
      {
        "id": "ex-15-3-4",
        "title": "Pipeline",
        "description": "Zaprojektuj CI: lint, typecheck, smoke, full regression, artefakty i quality gate."
      },
      {
        "id": "ex-15-3-5",
        "title": "Raport portfolio",
        "description": "Przygotuj fragment README opisujący cel, zakres, uruchomienie i interpretację wyników."
      },
      {
        "id": "ex-15-3-6",
        "title": "Ocena projektu",
        "description": "Stwórz checklistę odbioru projektu: stabilność, czytelność, diagnostyka, pokrycie ryzyk."
      }
    ],
    "quiz": [
      {
        "id": "q15-3-1",
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
        "id": "q15-3-2",
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
        "id": "q15-3-3",
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
        "id": "q15-3-4",
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
        "id": "q15-3-5",
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
        "id": "q15-3-6",
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
        "id": "q15-3-7",
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
        "id": "q15-3-8",
        "question": "Najważniejsza zasada lekcji „Pełna konfiguracja projektu z CI/CD” to:",
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
      "Zawsze opieraj architekturę testów na zasadach SOLID, unikając przedwczesnej abstrakcji zgodnie z zasadą WET (Write Everything Twice) z podręczników 2026.",
      
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
