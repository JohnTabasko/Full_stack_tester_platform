import type { Lesson } from "../../../renderer/types";
import theory27_4 from './lesson-27.4.md?raw';

export const lesson27_4: Lesson = {
  "id": "27.4",
  "moduleId": 27,
  "title": "Ryzyka sztucznej inteligencji: prywatność, halucynacje i zarządzanie",
  "description": "Ryzyka AI: prywatność, halucynacje, prompt injection, insecure output handling, excessive agency, overreliance, NIST AI RMF i governance.",
  "order": 4,
  "difficulty": "intermediate",
  "tags": [
    "ai-zarządzanie",
    "privacy",
    "security",
    "hallucinations",
    "responsible-ai"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji rozumiesz najważniejsze ryzyka użycia AI w testowaniu, potrafisz zaproponować zasady zarządzanie i wiesz, jak chronić dane, sekrety oraz jakość decyzji technicznych.",
    "theory": theory27_4,
    "codeExamples": [
      "const aiPolicy = {\n  noSecretsInPrompts: true,\n  humanReviewRequired: true,\n  destructiveActionsRequireApproval: true,\n  modelOutputIsNotOracle: true,\n};"
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
        "description": "Najważniejsze ryzyka aplikacji LLM."
      },
      {
        "title": "OWASP GenAI Security",
        "url": "https://genai.owasp.org/",
        "description": "Projekt bezpieczeństwa GenAI."
      },
      {
        "title": "NIST AI RMF",
        "url": "https://www.nist.gov/itl/ai-risk-management-framework",
        "description": "Govern, map, measure, manage dla AI risk."
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
            "solution": "Zapisuj raporty, logi, konfigurację i metryki jako artifacts."
      }
]
  }
};
