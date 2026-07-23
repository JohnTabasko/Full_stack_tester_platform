import type { Lesson } from "../../../renderer/types";
import theory24_2 from './lesson-24.2.md?raw';

export const lesson24_2: Lesson = {
  "id": "24.2",
  "moduleId": 24,
  "title": "Podstawy k6",
  "description": "Podstawy k6: lifecycle, VUs, scenarios, executors, checks, thresholds, custom metrics, typy testów, dane i CI quality gates.",
  "order": 2,
  "difficulty": "advanced",
  "tags": [
    "k6",
    "vus",
    "progi jakości",
    "checks",
    "load-testing",
    "ci"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz napisać test k6 z realistycznym scenariuszem, checks, progi jakości i metrykami, a także włączyć go jako kontrolę regresji wydajnościowej w CI.",
    "theory": theory24_2,
    "codeExamples": [
      "import http from 'k6/http';\nimport { check, sleep } from 'k6';\n\nexport const options = {\n  scenarios: { load: { executor: 'ramping-vus', stages: [\n    { duration: '2m', target: 20 },\n    { duration: '5m', target: 20 },\n    { duration: '1m', target: 0 },\n  ]}},\n  thresholds: {\n    http_req_failed: ['rate<0.01'],\n    http_req_duration: ['p(95)<500'],\n  },\n};\n\nexport default function () {\n  const res = http.get(`${__ENV.BASE_URL}/api/products`);\n  check(res, { 'status 200': r => r.status === 200 });\n  sleep(1);\n}"
],
    "exercises": [
      {
            "id": "ex-auto-1",
            "title": "Ćwiczenie 1",
            "description": "Zaprojektuj scenariusz zgodny z oficjalną dokumentacją narzędzia i opisz cel testu."
      },
      {
            "id": "ex-auto-2",
            "title": "Ćwiczenie 2",
            "description": "Dodaj wariant negatywny oraz kryterium sukcesu/fail dla pipeline CI."
      },
      {
            "id": "ex-auto-3",
            "title": "Ćwiczenie 3",
            "description": "Przygotuj checklistę diagnostyczną i listę artefaktów potrzebnych po awarii."
      },
      {
            "id": "ex-auto-4",
            "title": "Ćwiczenie 4",
            "description": "Wskaż, które elementy powinny zostać zautomatyzowane, a które opisane jako manual/exploratory."
      }
],
    "quiz": [
      {
            "id": "q-auto-1",
            "question": "Co jest najważniejsze przy użyciu tego narzędzia?",
            "options": [
                  "Jasny cel, kontrolowane dane i interpretowalne wyniki",
                  "Uruchomienie bez asercji",
                  "Maksymalna liczba opcji",
                  "Brak raportu"
            ],
            "correctAnswer": 0,
            "explanation": "Poprawna odpowiedź wynika z dobrych praktyk danego narzędzia."
      },
      {
            "id": "q-auto-2",
            "question": "Co powinno trafić do CI?",
            "options": [
                  "Mały, stabilny zestaw z jasnymi progami i artefaktami",
                  "Najcięższy test bez limitów",
                  "Sekrety w logach",
                  "Testy bez właściciela"
            ],
            "correctAnswer": 0,
            "explanation": "Poprawna odpowiedź wynika z dobrych praktyk danego narzędzia."
      },
      {
            "id": "q-auto-3",
            "question": "Co jest antywzorcem?",
            "options": [
                  "Ukrywanie problemu zamiast diagnozy",
                  "Jawne kryteria sukcesu",
                  "Artefakty po awarii",
                  "Dokumentacja środowiska"
            ],
            "correctAnswer": 0,
            "explanation": "Poprawna odpowiedź wynika z dobrych praktyk danego narzędzia."
      },
      {
            "id": "q-auto-4",
            "question": "Po co aktualne oficjalne źródła?",
            "options": [
                  "Aby unikać przestarzałych API i błędnych praktyk",
                  "Aby zastąpić review",
                  "Aby nie pisać testów",
                  "Aby wyłączyć lint"
            ],
            "correctAnswer": 0,
            "explanation": "Poprawna odpowiedź wynika z dobrych praktyk danego narzędzia."
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
        "title": "Grafana k6",
        "url": "https://grafana.com/docs/k6/latest/",
        "description": "Oficjalna dokumentacja k6."
      },
      {
        "title": "k6 Scenarios",
        "url": "https://grafana.com/docs/k6/latest/using-k6/scenarios/",
        "description": "Scenarios i executors."
      },
      {
        "title": "k6 Thresholds",
        "url": "https://grafana.com/docs/k6/latest/using-k6/thresholds/",
        "description": "Progi jakości jako quality gates."
      }
    ],
    "tipsAndTricks": [
      "Zawsze opieraj architekturę testów na zasadach SOLID, unikając przedwczesnej abstrakcji zgodnie z zasadą WET (Write Everything Twice) z podręczników 2026.",
      
      "Zaczynaj od celu i ryzyka, nie od składni narzędzia.",
      "Publikuj artefakty diagnostyczne w CI.",
      "Nie używaj danych produkcyjnych ani sekretów w przykładach.",
      "Porównuj wyniki z baseline i oficjalną dokumentacją."
],
    "commonMistakes": [
      {
            "mistake": "Brak celu testu",
            "solution": "Zapisz hipotezę i kryteria sukcesu przed implementacją."
      },
      {
            "mistake": "Brak izolacji danych",
            "solution": "Użyj runId, osobnych kont lub kontrolowanego datasetu."
      },
      {
            "mistake": "Brak artefaktów",
            "solution": "Zapisuj raporty, logi, konfigurację i metryki jako artefakty."
      }
]
  }
};
