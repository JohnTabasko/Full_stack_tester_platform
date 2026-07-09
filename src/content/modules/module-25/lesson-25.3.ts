import type { Lesson } from "../../../renderer/types";
import theory25_3 from './lesson-25.3.md?raw';

export const lesson25_3: Lesson = {
  "id": "25.3",
  "moduleId": 25,
  "title": "Docker Compose dla środowisk testowych",
  "description": "Docker Compose dla testów: services, networks, volumes, environment, healthcheck, seed, migracje, profiles, logi, CI i sekrety.",
  "order": 3,
  "difficulty": "intermediate",
  "tags": [
    "docker-compose",
    "containers",
    "test-environment",
    "healthcheck",
    "seed"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz zaprojektować środowisko testowe w Docker Compose, dodać healthchecki, kontrolować dane i uruchamiać zależności w sposób powtarzalny lokalnie oraz w CI.",
    "theory": theory25_3,
    "codeExamples": [
      "services:\n  db:\n    image: postgres:16\n    healthcheck:\n      test: ['CMD-SHELL', 'pg_isready -U app']\n      interval: 5s\n      timeout: 3s\n      retries: 20\n  api:\n    build: .\n    depends_on:\n      db:\n        condition: service_healthy"
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
        "title": "Docker Compose",
        "url": "https://docs.docker.com/compose/",
        "description": "Oficjalna dokumentacja Compose."
      },
      {
        "title": "Dockerfile Reference",
        "url": "https://docs.docker.com/reference/dockerfile/",
        "description": "Budowanie obrazów."
      },
      {
        "title": "Playwright Docker",
        "url": "https://playwright.dev/docs/docker",
        "description": "Playwright w kontenerach."
      }
    ],
    "tipsAndTricks": [
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
