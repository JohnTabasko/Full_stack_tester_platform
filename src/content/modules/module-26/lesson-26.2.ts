import type { Lesson } from "../../../renderer/types";
import theory26_2 from './lesson-26.2.md?raw';

export const lesson26_2: Lesson = {
  "id": "26.2",
  "moduleId": 26,
  "title": "Podstawy Appium",
  "description": "Appium basics: architektura client-server, drivers/plugins Appium 2/3, capabilities, lokatory mobile, gesty, waits i konteksty WebView.",
  "order": 2,
  "difficulty": "advanced",
  "tags": [
    "appium",
    "natywne-mobile",
    "capabilities",
    "lokatory",
    "gestures",
    "oczekiwania"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji rozumiesz architekturę Appium, potrafisz zaprojektować capabilities, stabilne lokatory i podstawowe scenariusze automatyzacji aplikacji mobilnej.",
    "theory": theory26_2,
    "codeExamples": [
      "const capabilities = {\n  platformName: 'Android',\n  'appium:automationName': 'UiAutomator2',\n  'appium:deviceName': 'Pixel 7',\n  'appium:app': './apps/app-debug.apk',\n  'appium:noReset': false,\n};"
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
        "title": "Appium Docs",
        "url": "https://appium.io/docs/en/latest/",
        "description": "Oficjalna dokumentacja Appium."
      },
      {
        "title": "UiAutomator",
        "url": "https://developer.android.com/training/testing/other-components/ui-automator",
        "description": "Android UiAutomator."
      },
      {
        "title": "XCTest",
        "url": "https://developer.apple.com/documentation/xctest",
        "description": "XCUITest i XCTest dla iOS."
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