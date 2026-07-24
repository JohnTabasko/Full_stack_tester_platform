import type { Lesson } from '../../../renderer/types';
import theory2_3 from './lesson-2.3.md?raw';

export const lesson2_3: Lesson = {
  "id": "2.3",
  "moduleId": 2,
  "title": "Selektory — szczegółowe omówienie",
  "description": "Zrozum oficjalną hierarchię selektorów. Poznaj technologię Locators-First, lokalizatory oparte o dostępność (A11y), test-id, łańcuchowanie (chaining) oraz przenikanie Shadow DOM.",
  "order": 3,
  "difficulty": "beginner",
  "tags": ["selectors", "locators", "accessibility", "test-id", "Shadow-DOM"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz dobierać stabilne lokalizatory w Playwright, stosować hierarchię priorytetów Microsoftu, lokalizować elementy dynamiczne oraz łączyć lokatory w celu przeszukiwania złożonych struktur danych.",
    "theory": theory2_3,
    "codeExamples": [
      `// Łączenie i filtrowanie lokatorów (Książka 1 - Kelhini)
const tableRow = page.locator('tr').filter({ hasText: 'Faktura #12' });
await tableRow.getByRole('button', { name: 'Pobierz PDF' }).click();`
    ],
    "exercises": [
      {
        "id": "ex-2-3-1",
        "title": "Refaktoryzacja selektorów CSS",
        "description": "Weź stary test zawierający selektory CSS typu 'div > p.info > span' i przepisz go w całości na stabilne lokalizatory semantyczne getByRole i getByText."
      }
    ],
    "quiz": [
      {
        "id": "q2-3-1",
        "question": "Który lokalizator jest najwyżej w oficjalnej hierarchii priorytetów zalecanej przez twórców Playwright?",
        "options": [
          "getByRole",
          "getByTestId",
          "locator('button.submit')",
          "locator('//xpath/button')"
        ],
        "correctAnswer": 0,
        "explanation": "Lokalizatory oparte o drzewo dostępności (np. getByRole, getByLabel) są najbardziej rekomendowane, ponieważ promują poprawne standardy A11y i są ekstremalnie odporne na zmiany struktury HTML."
      }
    ],
    "references": [
      {
        "title": "Hands-On Automated Testing with Playwright (Packt, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Chapter 2: Advanced Selectors and Handling Dynamic Content."
      }
    ],
    "tipsAndTricks": [
      "Zawsze preferuj getByRole with { exact: true } lub dopasowaniem regex, aby precyzyjnie wskazać żądany element bez ryzyka dopasowania wielu przycisków."
    ],
    "commonMistakes": [
      {
        "mistake": "Nadużywanie selektorów XPath, które są kruche i nieczytelne",
        "solution": "Zastąp je lokalizatorami semantycznymi lub dedykowanymi data-testid."
      }
    ]
  }
};