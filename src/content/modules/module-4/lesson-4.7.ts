import type { Lesson } from '../../../renderer/types';
import theory4_7 from './lesson-4.7.md?raw';

export const lesson4_7: Lesson = {
  "id": "4.7",
  "moduleId": 4,
  "title": "Dialogi, zdarzenia i event-first pattern",
  "description": "Zrozum zarządzanie natywnymi oknami dialogowymi (alert, confirm, prompt). Opanuj wzorzec Event-First (nasłuchiwanie przed akcją), odczytywanie komunikatów i zatwierdzanie dialogów.",
  "order": 7,
  "difficulty": "intermediate",
  "tags": ["dialogs", "events", "alerts", "confirm", "event-first"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz kontrolować cykl życia systemowych okien dialogowych, stosować wzorzec Event-First w celu zatwierdzania i odrzucania alertów, a także wprowadzać wartości do Promptów.",
    "theory": theory4_7,
    "codeExamples": [
      `// Zatwierdzenie systemowego okna dialogowego (Książka 1 - Kelhini)
page.once('dialog', dialog => dialog.accept());
await page.getByRole('button', { name: 'Skasuj dane' }).click();`
    ],
    "exercises": [
      {
        "id": "ex-4-7-1",
        "title": "Automatyzacja promptu z hasłem",
        "description": "Napisz test dla przycisku wyzwalającego prompt o wpisanie kodu rabatowego. Przechwyć okno, wpisz kod 'RABAT-2026', zatwierdź i zweryfikuj zniżkę na UI."
      }
    ],
    "quiz": [
      {
        "id": "q4-7-1",
        "question": "Jak zachowa się Playwright Test, jeśli aplikacja otworzy okno window.confirm(), a w teście nie zarejestrowano żadnej obsługi dialogu?",
        "options": [
          "Automatycznie odrzuci (dismiss) okno dialogowe, nie blokując i nie zawieszając wykonania testu",
          "Zawiesi test na 30 sekund i rzuci błąd timeout",
          "Automatycznie zatwierdzi (accept) okno dialogowe",
          "Rzuci błąd składniowy kompilacji TypeScript"
        ],
        "correctAnswer": 0,
        "explanation": "To rewolucyjna zaleta pod kątem stabilności - Playwright zapobiega zamarzaniu testów, automatycznie odrzucając dialogi systemowe, o ile nie zadeklarowano jawnego słuchacza."
      }
    ],
    "references": [
      {
        "title": "Hands-On Automated Testing with Playwright (Packt, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Chapter 11: Dealing with mobile pop-ups and dialogs."
      }
    ],
    "tipsAndTricks": [
      "Stosuj metodę page.once() zamiast page.on(), aby słuchacz zdarzeń zarejestrował się i wywołał wyłącznie dla tego jednego, konkretnego okna dialogowego."
    ],
    "commonMistakes": [
      {
        "mistake": "Klikanie przycisku otwierającego dialog, a dopiero potem rejestrowanie page.on('dialog', ...)",
        "solution": "Zawsze rejestruj słuchacza zdarzeń przed wykonaniem interakcji wyzwalającej. Przeglądarka działa zbyt szybko, aby wywołać to w odwrotnej kolejności."
      }
    ]
  }
};