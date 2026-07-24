import type { Lesson } from '../../../renderer/types';
import theory12_5 from './lesson-12.5.md?raw';

export const lesson12_5: Lesson = {
  "id": "12.5",
  "moduleId": 12,
  "title": "Antywzorce i typowe błędy",
  "description": "Unikaj kosztownych błędów w automatyzacji. Poznaj najgroźniejsze antywzorce: ręczne opóźnienia (waitForTimeout), nadmierną abstrakcję (over-engineering), wycieki stanów sesyjnych oraz zasady WET.",
  "order": 5,
  "difficulty": "advanced",
  "tags": ["antipatterns", "best-practices", "waitForTimeout", "WET-principle", "over-engineering"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz zidentyfikować i wyeliminować najgroźniejsze antywzorce projektowe w kodzie testów, zastąpić ręczne opóźnienia stabilnym auto-waitingiem, zapobiegać wyciekom stanu (leaking state) oraz świadomie stosować zasadę WET.",
    "theory": theory12_5,
    "codeExamples": [
      `// Przykład poprawnego auto-waiting zamiast waitForTimeout (Książka 2 - Greffier)
await expect(page.getByRole('button', { name: 'Kup' })).toBeVisible();`
    ],
    "exercises": [
      {
        "id": "ex-12-5-1",
        "title": "Audyt i czyszczenie kodu z waitForTimeout",
        "description": "Przeskanuj bazę kodu swojego projektu testowego w poszukiwaniu wywołań `page.waitForTimeout()`. Zastąp je stabilnymi weryfikacjami asynchronicznymi Web-First i zaobserwuj poprawę stabilności testów."
      }
    ],
    "quiz": [
      {
        "id": "q12-5-1",
        "question": "Dlaczego stosowanie ręcznych, stałych opóźnień (np. page.waitForTimeout(3000)) jest uważane za krytyczny błąd w automatyzacji testów?",
        "options": [
          "Ponieważ wydłuża niepotrzebnie czas wykonania pomyślnych testów, a w CI (na wolniejszych maszynach) wciąż może być zbyt krótkie, powodując losowe awarie testów",
          "Ponieważ blokuje kompilację TypeScript",
          "Ponieważ usuwa ciasteczka sesyjne z przeglądarki",
          "Nie jest błędem, to zalecana praktyka przez Microsoft"
        ],
        "correctAnswer": 0,
        "explanation": "Ręczne sleep-y to główny powód niestabilności testów (flakiness). Prawidłowym podejściem jest używanie asercji Web-First, które odpytują DOM w tle i kończą oczekiwanie natychmiast po pojawieniu się elementu."
      }
    ],
    "references": [
      {
        "title": "Practical Playwright Test (Jean-François Greffier, 2026)",
        "url": "https://doi.org/10.1007/979-8-8688-2160-8",
        "description": "Chapter 12: Solving the Test Frameworks Puzzle (WET vs DRY and over-engineering)."
      }
    ],
    "tipsAndTricks": [
      "Stosuj zasadę WET (Write Everything Twice). Wyciągaj kod do wspólnej abstrakcji dopiero przy trzeciej powtarzalności, upewniając się wcześniej, że znasz jego ostateczną, stabilną strukturę."
    ],
    "commonMistakes": [
      {
        "mistake": "Zostawianie w kodzie zaimprowizowanych waitForTimeout po zakończeniu debugowania lokalnego",
        "solution": "Zawsze usuwaj te instrukcje przed utworzeniem Commitu w systemie Git."
      }
    ]
  }
};