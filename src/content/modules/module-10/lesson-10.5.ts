import type { Lesson } from "../../../renderer/types";
import theory10_5 from './lesson-10.5.md?raw';

export const lesson10_5: Lesson = {
  "id": "10.5",
  "moduleId": 10,
  "title": "Zaawansowane strategie raportowania",
  "description": "Raportowanie wielopoziomowe, streszczenia zarządcze, bramki jakości, dashboardy, alerty Slack, raporty e-mail i trendy metryk.",
  "order": 5,
  "difficulty": "intermediate",
  "tags": [
    "reporting",
    "analytics",
    "playwright",
    "ci"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz zaprojektować raportowanie dla tematu „Zaawansowane strategie raportowania” tak, aby wspierało diagnozę, decyzje zespołu i jakość procesu CI/CD.",
    "theory": theory10_5,
    "codeExamples": [
      "type ExecutiveSummary = {\n  releaseCandidate: string;\n  status: 'go' | 'no-go' | 'needs-investigation';\n  criticalFailures: number;\n  flakyRate: number;\n  recommendation: string;\n  reportUrl: string;\n};\n",
      "const qualityGate = {\n  smokePassRate: 1,\n  maxFlakyRate: 0.02,\n  maxSuiteDurationMinutes: 30,\n  allowCriticalFailures: false,\n};\n"
    ],
    "exercises": [
      {
        "id": "ex-10-5-1",
        "title": "Raport dla odbiorcy",
        "description": "Dla tematu „Zaawansowane strategie raportowania” zaprojektuj raport dla developera, QA leada i managera."
      },
      {
        "id": "ex-10-5-2",
        "title": "Artefakty awarii",
        "description": "Dodaj listę artefaktów potrzebnych do diagnozy failed testu w CI."
      },
      {
        "id": "ex-10-5-3",
        "title": "Format maszynowy",
        "description": "Opisz, jak JSON/JUnit może zasilić pipeline, dashboard lub quality gate."
      },
      {
        "id": "ex-10-5-4",
        "title": "Metryki trendu",
        "description": "Zdefiniuj metryki pass rate, flaky rate, duration p95 i liczbę testów krytycznych."
      },
      {
        "id": "ex-10-5-5",
        "title": "Alert",
        "description": "Przygotuj treść alertu Slack/Teams dla awarii smoke suite."
      },
      {
        "id": "ex-10-5-6",
        "title": "Review raportowania",
        "description": "Ułóż checklistę sprawdzającą, czy raport pomaga w decyzji i diagnozie."
      }
    ],
    "quiz": [
      {
        "id": "q10-5-1",
        "question": "Jaki jest główny cel raportu testowego?",
        "options": [
          "Dostarczyć informacji potrzebnej do decyzji i diagnozy",
          "Zająć jak najwięcej miejsca",
          "Ukryć błędy",
          "Zastąpić testy"
        ],
        "correctAnswer": 0,
        "explanation": "Raport ma skracać drogę od wyniku testu do działania."
      },
      {
        "id": "q10-5-2",
        "question": "Dlaczego warto mieć JUnit w CI?",
        "options": [
          "CI potrafi interpretować wyniki i pokazywać je w interfejsie",
          "Bo JUnit robi screenshoty",
          "Bo zastępuje HTML",
          "Bo ukrywa flaky"
        ],
        "correctAnswer": 0,
        "explanation": "JUnit XML jest standardowym formatem maszynowym dla wyników testów."
      },
      {
        "id": "q10-5-3",
        "question": "Kiedy HTML report jest szczególnie przydatny?",
        "options": [
          "Do lokalnej i zespołowej analizy kroków, trace i screenshotów",
          "Do zastąpienia wszystkich metryk",
          "Do ukrycia logów",
          "Tylko dla managerów"
        ],
        "correctAnswer": 0,
        "explanation": "HTML report jest czytelny dla ludzi i wspiera analizę awarii."
      },
      {
        "id": "q10-5-4",
        "question": "Co oznacza flaky rate?",
        "options": [
          "Odsetek testów o niestabilnym wyniku",
          "Średnią długość nazwy testu",
          "Liczbę screenshotów",
          "Liczbę tagów"
        ],
        "correctAnswer": 0,
        "explanation": "Flaky rate jest kluczową metryką zdrowia suite."
      },
      {
        "id": "q10-5-5",
        "question": "Co powinien zawierać alert po awarii?",
        "options": [
          "Zakres wpływu, właściciela, środowisko i link do raportu",
          "Tylko słowo failed",
          "Brak linków",
          "Sekrety"
        ],
        "correctAnswer": 0,
        "explanation": "Alert ma prowadzić do działania, nie tylko przeszkadzać."
      },
      {
        "id": "q10-5-6",
        "question": "Po co custom reporter?",
        "options": [
          "Aby wysłać lub przekształcić wyniki w specyficzny dla zespołu sposób",
          "Aby uniknąć asercji",
          "Aby zastąpić Playwright",
          "Aby usunąć trace"
        ],
        "correctAnswer": 0,
        "explanation": "niestandardowy reporter integruje wyniki z narzędziami i procesem organizacji."
      },
      {
        "id": "q10-5-7",
        "question": "Co jest ryzykiem executive summary?",
        "options": [
          "Nadmierne uproszczenie bez linku do danych źródłowych",
          "Zbyt jasny wykres",
          "Link do raportu",
          "Podsumowanie trendu"
        ],
        "correctAnswer": 0,
        "explanation": "Podsumowanie musi być krótkie, ale weryfikowalne."
      },
      {
        "id": "q10-5-8",
        "question": "Najważniejsza zasada lekcji „Zaawansowane strategie raportowania” to:",
        "options": [
          "Raportowanie jest elementem diagnostyki i zarządzania jakością",
          "Raport jest dekoracją",
          "Wystarczy pass/fail",
          "Metryki nie są potrzebne"
        ],
        "correctAnswer": 0,
        "explanation": "Raporty i analityka zamieniają testy w użyteczną informację."
      }
    ],
    "references": [
      {
        "title": "Playwright Reporters",
        "url": "https://playwright.dev/docs/test-reporters",
        "description": "Oficjalna dokumentacja reporterów wbudowanych i niestandardowych."
      },
      {
        "title": "Playwright Trace Viewer",
        "url": "https://playwright.dev/docs/trace-viewer",
        "description": "Trace jako podstawowy artefakt diagnostyczny raportu."
      },
      {
        "title": "Allure Report",
        "url": "https://allurereport.org/docs/playwright/",
        "description": "Dokumentacja integracji Allure z Playwright."
      },
      {
        "title": "JUnit XML Format",
        "url": "https://llg.cubic.org/docs/junit/",
        "description": "Opis formatu JUnit XML używanego przez wiele systemów CI."
      }
    ],
    "tipsAndTricks": [
      "Raport ma służyć decyzji: naprawić, zignorować, powtórzyć, eskalować albo wdrożyć.",
      "Inny raport jest potrzebny programiście, inny liderowi technicznemu, a inny biznesowi.",
      "Artefakty z awarii są cenniejsze niż raport sukcesu; dbaj o trace, screenshoty, video i logi.",
      "Metryki testów bez trendu historiacznego szybko tracą kontekst."
    ],
    "commonMistakes": [
      {
        "mistake": "Raport zawiera wyłącznie pass/fail",
        "solution": "Dodaj kroki, załączniki, trace, właściciela, ryzyko i linki do wymagań."
      },
      {
        "mistake": "Brak JUnit/JSON w CI",
        "solution": "Publikuj format maszynowy dla pipeline’u i format czytelny dla ludzi."
      },
      {
        "mistake": "Alert bez kontekstu",
        "solution": "Wysyłaj właściciela, środowisko, link do raportu, liczbę failed/flaky i najważniejsze artefakty."
      },
      {
        "mistake": "Metryki bez quality gate",
        "solution": "Zdefiniuj progi dla flaky rate, pass rate, czasu suite i krytycznych testów."
      }
    ]
  }
};
