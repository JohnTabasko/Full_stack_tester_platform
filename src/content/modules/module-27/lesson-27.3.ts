import type { Lesson } from "../../../renderer/types";
import theory27_3 from './lesson-27.3.md?raw';

export const lesson27_3: Lesson = {
  "id": "27.3",
  "moduleId": 27,
  "title": "Debugowanie wspierane przez sztuczną inteligencję i analiza logów",
  "description": "AI-assisted debugging: analiza logów, trace, stack trace, hipotezy, redakcja danych, evals jakości odpowiedzi i human verification.",
  "order": 3,
  "difficulty": "intermediate",
  "tags": [
    "ai-debugging",
    "logs",
    "trace-analysis",
    "flaky-tests",
    "root-cause"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz bezpiecznie używać AI do porządkowania logów, generowania hipotez przyczyn awarii i analizy niestabilnych testów, zachowując kontrolę nad prywatnością oraz weryfikacją dowodów.",
    "theory": theory27_3,
    "codeExamples": [
      "const prompt = `Analyze this anonymized Playwright failure.\nReturn hypotheses grouped by locator/data/auth/network/environment.\nFor each hypothesis provide evidence needed to confirm or reject it.\nDo not invent missing facts.`;"
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
        "title": "OWASP LLM Top 10",
        "url": "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
        "description": "Bezpieczeństwo i ryzyka LLM."
      },
      {
        "title": "OpenTelemetry",
        "url": "https://opentelemetry.io/docs/",
        "description": "Telemetry data: traces, metrics, logs."
      },
      {
        "title": "Playwright Trace Viewer",
        "url": "https://playwright.dev/docs/trace-viewer",
        "description": "Trace jako źródło dowodów."
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
