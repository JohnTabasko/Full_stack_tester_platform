import type { Lesson } from "../../../renderer/types";
import theory24_4 from './lesson-24.4.md?raw';

export const lesson24_4: Lesson = {
  "id": "24.4",
  "moduleId": 24,
  "title": "Analiza wąskich gardeł i budżet wydajności",
  "description": "Analiza bottlenecków: latency, throughput, error rate, percentyle, saturation, DB/app/API/generator, budżety wydajności i raport.",
  "order": 4,
  "difficulty": "advanced",
  "tags": [
    "wąskie gardło",
    "p95",
    "p99",
    "przepustowość",
    "performance-budget",
    "baseline"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz interpretować wyniki testów wydajnościowych, odróżniać objaw od przyczyny, definiować budżet wydajności i przygotować raport prowadzący do decyzji technicznych.",
    "theory": theory24_4,
    "codeExamples": [
      "const performanceFinding = {\n  endpoint: 'POST /api/orders',\n  p95: 2200,\n  errorRate: 0.005,\n  suspectedBottleneck: 'database_missing_index',\n  evidence: ['db_cpu=95%', 'slow_query_detected', 'api_cpu=45%'],\n};\nexpect(performanceFinding.p95).toBeGreaterThan(1000);"
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
        "title": "k6 Metrics",
        "url": "https://grafana.com/docs/k6/latest/using-k6/metrics/",
        "description": "Metryki k6."
      },
      {
        "title": "Prometheus Overview",
        "url": "https://prometheus.io/docs/introduction/overview/",
        "description": "Metryki i monitoring systemów."
      },
      {
        "title": "OpenTelemetry",
        "url": "https://opentelemetry.io/docs/",
        "description": "Traces, metrics i logs do diagnozy."
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
