import type { Lesson } from "../../../renderer/types";
import theory24_3 from './lesson-24.3.md?raw';

export const lesson24_3: Lesson = {
  "id": "24.3",
  "moduleId": 24,
  "title": "JMeter i testy protokołów",
  "description": "JMeter: Test Plan, Thread Groups, Samplers, Config Elements, Timers, Assertions, Listeners, CSV data, non-GUI mode i raport HTML.",
  "order": 3,
  "difficulty": "advanced",
  "tags": [
    "jmeter",
    "protocol-testing",
    "samplery",
    "asercje",
    "timery"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji rozumiesz model pracy JMetera, potrafisz odróżnić test protokołu od testu interfejs użytkownika i wiesz, jak projektować plany testów, które są czytelne, parametryzowane i możliwe do utrzymania.",
    "theory": theory24_3,
    "codeExamples": [
      "# Build and debug in GUI, run load tests in non-GUI mode\njmeter -n -t checkout-load.jmx -l results.jtl -e -o report/\n\n# Archive results.jtl and report/ in CI artefakty"
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
        "title": "JMeter Getting Started",
        "url": "https://jmeter.apache.org/usermanual/get-started.html",
        "description": "Oficjalny start z JMeter."
      },
      {
        "title": "JMeter Best Practices",
        "url": "https://jmeter.apache.org/usermanual/best-practices.html",
        "description": "Dobre praktyki JMeter, w tym non-GUI mode."
      },
      {
        "title": "JMeter Component Reference",
        "url": "https://jmeter.apache.org/usermanual/component_reference.html",
        "description": "Opis elementów Test Planu."
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
