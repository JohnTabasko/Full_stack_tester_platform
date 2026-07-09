import type { Lesson } from "../../../renderer/types";
import theory19_1 from './lesson-19.1.md?raw';

export const lesson19_1: Lesson = {
  "id": "19.1",
  "moduleId": 19,
  "title": "Podstawy Vitest i Jest",
  "description": "Vitest i Jest: struktura testów jednostkowych, matchery, setup/teardown, testy parametryzowane, coverage, fake timers i wybór narzędzia.",
  "order": 1,
  "difficulty": "intermediate",
  "tags": [
    "vitest",
    "jest",
    "unit-testing",
    "matchers",
    "pokrycie kodu",
    "test-pyramid"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz zaprojektować testy jednostkowe dla logiki domenowej, używać matcherów i setupu testowego, interpretować pokrycie kodu oraz odróżnić wartościowy test unit od testu kruchego i nadmiernie związanego z implementacją.",
    "theory": theory19_1,
    "codeExamples": [
      "import { describe, expect, it } from 'vitest';\nimport { calculateDiscount } from './discounts';\n\ndescribe('calculateDiscount', () => {\n  it.each([\n    { total: 100, value: 10, expected: 90 },\n    { total: 50, value: 20, expected: 40 },\n  ])('applies percent discount', ({ total, value, expected }) => {\n    expect(calculateDiscount(total, { type: 'percent', value })).toBe(expected);\n  });\n});",
      "import { expect, test, vi } from 'vitest';\n\ntest('expires promotion after configured time', () => {\n  vi.useFakeTimers();\n  vi.setSystemTime(new Date('2026-07-09T10:00:00Z'));\n\n  expect(isPromotionActive('2026-07-09T11:00:00Z')).toBe(true);\n\n  vi.setSystemTime(new Date('2026-07-09T12:00:00Z'));\n  expect(isPromotionActive('2026-07-09T11:00:00Z')).toBe(false);\n\n  vi.useRealTimers();\n});"
],
    "exercises": [
      {
            "id": "ex-auto-1",
            "title": "Zaprojektuj testy jednostkowe dla walidacji kuponu",
            "description": "Zaprojektuj testy jednostkowe dla walidacji kuponu: aktywny, wygasły, przekroczony limit użyć i za mała wartość koszyka."
      },
      {
            "id": "ex-auto-2",
            "title": "Ćwiczenie 2",
            "description": "Przepisz wolny test E2E walidacji rabatu na zestaw testów jednostkowych z `it.each`."
      },
      {
            "id": "ex-auto-3",
            "title": "Ćwiczenie 3",
            "description": "Dodaj fake timers do funkcji zależnej od daty i usuń realne czekanie."
      },
      {
            "id": "ex-auto-4",
            "title": "Ćwiczenie 4",
            "description": "Zdefiniuj minimalny próg coverage oraz opisz, dlaczego sam coverage nie wystarcza."
      }
],
    "quiz": [
      {
            "id": "q-auto-1",
            "question": "Co najlepiej testować jednostkowo?",
            "options": [
                  "Deterministyczne reguły domenowe i walidacje",
                  "Pełny checkout z płatnością",
                  "Ręczne testy eksploracyjne",
                  "Konfigurację DNS"
            ],
            "correctAnswer": 0,
            "explanation": "To sprawdza zrozumienie praktycznego zastosowania lekcji."
      },
      {
            "id": "q-auto-2",
            "question": "Dlaczego `toBeTruthy()` bywa słabą asercją?",
            "options": [
                  "Nie opisuje konkretnej oczekiwanej wartości",
                  "Jest wolniejsze od E2E",
                  "Nie działa w Vitest",
                  "Zawsze rzuca wyjątek"
            ],
            "correctAnswer": 0,
            "explanation": "To sprawdza zrozumienie praktycznego zastosowania lekcji."
      },
      {
            "id": "q-auto-3",
            "question": "Kiedy użyć fake timers?",
            "options": [
                  "Gdy kod zależy od czasu, timeoutów lub dat",
                  "Do testowania CSS",
                  "Do uruchomienia bazy",
                  "Do publikacji raportu"
            ],
            "correctAnswer": 0,
            "explanation": "To sprawdza zrozumienie praktycznego zastosowania lekcji."
      },
      {
            "id": "q-auto-4",
            "question": "Co oznacza test parametryzowany?",
            "options": [
                  "Ten sam test uruchomiony dla wielu zestawów danych",
                  "Test bez asercji",
                  "Test wyłącznie manualny",
                  "Test z losowym wynikiem"
            ],
            "correctAnswer": 0,
            "explanation": "To sprawdza zrozumienie praktycznego zastosowania lekcji."
      }
],
    "references": [
      {
        "title": "Vitest Guide",
        "url": "https://vitest.dev/guide/",
        "description": "Oficjalny przewodnik Vitest."
      },
      {
        "title": "Jest Getting Started",
        "url": "https://jestjs.io/docs/getting-started",
        "description": "Oficjalny start z Jest."
      },
      {
        "title": "Jest Matchers",
        "url": "https://jestjs.io/docs/using-matchers",
        "description": "Matchery expect w Jest."
      }
    ],
    "tipsAndTricks": [
      "Unit test powinien być szybki, mały i jednoznaczny diagnostycznie.",
      "Używaj `it.each` dla wartości brzegowych i klas równoważności.",
      "Coverage traktuj jako wskaźnik pomocniczy, nie dowód jakości.",
      "Jeśli unit test wymaga wielu mocków, sprawdź projekt funkcji."
],
    "commonMistakes": [
      {
            "mistake": "Testowanie prywatnej implementacji",
            "solution": "Testuj publiczne zachowanie funkcji lub modułu."
      },
      {
            "mistake": "Brak przypadków negatywnych",
            "solution": "Dodaj błędy walidacji, wartości brzegowe i wyjątki."
      },
      {
            "mistake": "Realne czekanie w unit testach",
            "solution": "Użyj fake timers zamiast sleepów."
      }
]
  }
};
