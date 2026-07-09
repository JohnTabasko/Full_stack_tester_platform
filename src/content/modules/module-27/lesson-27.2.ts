import type { Lesson } from "../../../renderer/types";
import theory27_2 from './lesson-27.2.md?raw';

export const lesson27_2: Lesson = {
  "id": "27.2",
  "moduleId": 27,
  "title": "Generowanie przypadków testowych i danych testowych",
  "description": "AI do generowania przypadków i danych: prompt patterns, traceability, review, dane syntetyczne, prywatność, halucynacje i poziom testu.",
  "order": 2,
  "difficulty": "intermediate",
  "tags": [
    "ai",
    "test-cases",
    "test-data",
    "synthetic-data",
    "boundary-values"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz używać AI do generowania szkiców przypadków testowych i danych syntetycznych, a następnie oceniać ich pokrycie, poprawność, bezpieczeństwo i przydatność w automatyzacji.",
    "theory": theory27_2,
    "codeExamples": [
      "const prompt = `Generate test cases for POST /orders.\nInclude equivalence classes, boundary values, negative cases, auth, idempotency.\nReturn: risk, data, expected result, test level.\nDo not use personal data.`;"
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
        "title": "NIST AI RMF",
        "url": "https://www.nist.gov/itl/ai-risk-management-framework",
        "description": "Ramy zarządzania ryzykiem AI."
      },
      {
        "title": "OWASP LLM Top 10",
        "url": "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
        "description": "Ryzyka aplikacji LLM."
      },
      {
        "title": "OpenAI API Docs",
        "url": "https://platform.openai.com/docs",
        "description": "Dokumentacja API i pracy z modelami."
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
