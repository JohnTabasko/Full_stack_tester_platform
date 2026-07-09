import type { Lesson } from "../../../renderer/types";
import theory18_3 from './lesson-18.3.md?raw';

export const lesson18_3: Lesson = {
  "id": "18.3",
  "moduleId": 18,
  "title": "Node.js, npm i struktura projektu testowego",
  "description": "Node.js, npm i struktura projektu: npm ci, lockfile, ESM/CJS, env vars, package scripts, exit codes i reprodukowalne środowisko.",
  "order": 3,
  "difficulty": "beginner",
  "tags": [
    "node",
    "npm",
    "package-json",
    "env",
    "project-structure",
    "configuration"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz zorganizować projekt testowy w Node.js, świadomie używać package.json i skryptów npm, zarządzać konfiguracją środowiskową oraz projektować strukturę katalogów wspierającą utrzymanie testów.",
    "theory": theory18_3,
    "codeExamples": [
      "// src/config/env.ts\nexport function requireEnv(name: string): string {\n  const value = process.env[name];\n  if (!value) {\n    throw new Error(`Missing required environment variable: ${name}`);\n  }\n  return value;\n}\n\nexport const testEnv = {\n  baseURL: requireEnv('BASE_URL'),\n  adminEmail: requireEnv('ADMIN_EMAIL'),\n  runId: process.env.RUN_ID ?? `local-${Date.now()}`,\n};\n",
      "{\n  \"scripts\": {\n    \"test\": \"playwright test\",\n    \"test:smoke\": \"playwright test --grep @smoke\",\n    \"test:api\": \"playwright test tests/api\",\n    \"test:e2e\": \"playwright test tests/e2e\",\n    \"test:debug\": \"playwright test --debug\",\n    \"lint\": \"eslint src tests\",\n    \"typecheck\": \"tsc --noEmit\"\n  }\n}\n"
    ],
    "exercises": [
      {
        "id": "ex-18-3-1",
        "title": "Projekt package.json",
        "description": "Zaprojektuj sekcję scripts dla projektu z testami smoke, API, E2E, debug, lint i typecheck."
      },
      {
        "id": "ex-18-3-2",
        "title": "Walidacja env",
        "description": "Napisz moduł konfiguracji, który wymaga BASE_URL i ADMIN_EMAIL oraz dodaje domyślny RUN_ID."
      },
      {
        "id": "ex-18-3-3",
        "title": "Struktura katalogów",
        "description": "Zaproponuj strukturę projektu testowego dla aplikacji SaaS z interfejs użytkownika, API, Baza danych i kontraktami."
      },
      {
        "id": "ex-18-3-4",
        "title": "Gitignore",
        "description": "Przygotuj .gitignore dla projektu Playwright, uwzględniając raporty, trace, sekrety i zależności."
      },
      {
        "id": "ex-18-3-5",
        "title": "Diagnoza CI",
        "description": "Opisz procedurę diagnozy sytuacji: lokalnie działa, w CI nie działa."
      },
      {
        "id": "ex-18-3-6",
        "title": "Artefakty",
        "description": "Zaprojektuj strategię publikacji raportów i trace w CI dla testów zakończonych błędem."
      }
    ],
    "quiz": [
      {
        "id": "q18-3-1",
        "question": "Dlaczego npm ci jest preferowane w CI?",
        "options": [
          "Instaluje zależności deterministycznie z lockfile",
          "Zawsze aktualizuje zależności",
          "Nie wymaga package.json",
          "Uruchamia testy automatycznie"
        ],
        "correctAnswer": 0,
        "explanation": "npm ci używa package-lock.json i zapewnia powtarzalność instalacji."
      },
      {
        "id": "q18-3-2",
        "question": "Co powinien komunikować dobry skrypt npm?",
        "options": [
          "Intencję uruchomienia",
          "Tylko nazwisko autora",
          "Losowy skrót",
          "Sekret produkcyjny"
        ],
        "correctAnswer": 0,
        "explanation": "Nazwa skryptu powinna mówić, co zostanie uruchomione i po co."
      },
      {
        "id": "q18-3-3",
        "question": "Dlaczego walidujemy zmienne środowiskowe?",
        "options": [
          "Aby błędy konfiguracji były wczesne i czytelne",
          "Aby ukryć problemy",
          "Aby spowolnić testy",
          "Aby uniknąć TypeScriptu"
        ],
        "correctAnswer": 0,
        "explanation": "Brak konfiguracji powinien zostać wykryty przed startem długiej serii testów."
      },
      {
        "id": "q18-3-4",
        "question": "Co nie powinno trafiać do repozytorium?",
        "options": [
          "Sekrety, node_modules, raporty i trace",
          "Kod testów",
          "Konfiguracja przykładowa",
          "README"
        ],
        "correctAnswer": 0,
        "explanation": "Artefakty i sekrety są generowane lub poufne; nie powinny być commitowane."
      },
      {
        "id": "q18-3-5",
        "question": "Po co wydzielać clients dla API?",
        "options": [
          "Aby ukryć logikę requestów i ujednolicić komunikację z API",
          "Aby zwiększyć liczbę plików bez powodu",
          "Aby zastąpić asercje",
          "Tylko dla CSS"
        ],
        "correctAnswer": 0,
        "explanation": "Klienci API porządkują requesty, autoryzację i obsługę odpowiedzi."
      },
      {
        "id": "q18-3-6",
        "question": "Kiedy publikować artefakty w CI?",
        "options": [
          "Szczególnie przy błędach, najlepiej zawsze dla raportów diagnostycznych",
          "Nigdy",
          "Tylko lokalnie",
          "Wyłącznie po release"
        ],
        "correctAnswer": 0,
        "explanation": "Artefakty po awarii są kluczowe do diagnozy."
      },
      {
        "id": "q18-3-7",
        "question": "Co oznacza 'projekt testowy jest aplikacją'?",
        "options": [
          "Ma zależności, konfigurację, strukturę i cykl życia",
          "Nie wymaga utrzymania",
          "Nie potrzebuje CI",
          "Nie powinien mieć package.json"
        ],
        "correctAnswer": 0,
        "explanation": "Framework testowy musi być utrzymywany jak każdy inny projekt programistyczny."
      },
      {
        "id": "q18-3-8",
        "question": "Co jest pierwszym krokiem przy problemie 'lokalnie działa, w CI nie'?",
        "options": [
          "Porównać wersje, zależności, env i artefakty",
          "Usunąć test",
          "Dodać waitForTimeout",
          "Zignorować pipeline"
        ],
        "correctAnswer": 0,
        "explanation": "Różnice środowiskowe są częstą przyczyną takich problemów."
      }
    ],
    "references": [
      {
        "title": "Node.js Learn",
        "url": "https://nodejs.org/en/learn",
        "description": "Oficjalne materiały Node.js."
      },
      {
        "title": "npm Docs",
        "url": "https://docs.npmjs.com/",
        "description": "npm, package.json, npm ci i lockfile."
      },
      {
        "title": "Playwright Configuration",
        "url": "https://playwright.dev/docs/test-configuration",
        "description": "Konfiguracja projektu testowego."
      }
    ],
    "tipsAndTricks": [
      "Uruchom `npm run` w nowym projekcie — lista skryptów powinna sama wyjaśniać podstawowy workflow.",
      "Waliduj konfigurację na starcie, zanim testy zaczną generować mylące timeouty.",
      "Artefakty testów ignoruj w Git, ale publikuj w CI.",
      "Struktura katalogów powinna odzwierciedlać odpowiedzialności, nie osobiste preferencje autora."
    ],
    "commonMistakes": [
      {
        "mistake": "Brak lockfile albo ignorowanie go w CI",
        "solution": "Commituj package-lock.json i używaj npm ci."
      },
      {
        "mistake": "Sekrety w kodzie",
        "solution": "Używaj zmiennych środowiskowych i secret managera w CI."
      },
      {
        "mistake": "Nieczytelne skrypty",
        "solution": "Nazwij skrypty zgodnie z intencją: test:smoke, test:api, typecheck."
      },
      {
        "mistake": "Brak publikacji artefaktów",
        "solution": "Uploaduj raporty, trace i screenshoty zawsze, gdy testy mogą się nie powieść."
      }
    ]
  }
};
