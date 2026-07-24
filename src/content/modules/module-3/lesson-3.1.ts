import type { Lesson } from '../../../renderer/types';
import theory3_1 from './lesson-3.1.md?raw';

export const lesson3_1: Lesson = {
  "id": "3.1",
  "moduleId": 3,
  "title": "Asercje webowe",
  "description": "Opanuj asercje Web-First (Locator Assertions). Dowiedz się, jak działa automatyczna pętla odpytywania (auto-polling), negowanie matchera za pomocą .not oraz weryfikacja struktur ARIA.",
  "order": 1,
  "difficulty": "intermediate",
  "tags": ["assertions", "web-first", "toHaveText", "toBeVisible", "ARIA-snapshots"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz pisać wysoce stabilne, asynchroniczne asercje sieciowe na elementach HTML, poprawnie negować warunki oraz wdrożyć asercje struktur ARIA w celu weryfikacji drzewa dostępności strony.",
    "theory": theory3_1,
    "codeExamples": [
      `// Asercja Web-First z niestandardowym timeoutem (Książka 2 - Greffier)
await expect(page.getByRole('alert')).toBeVisible({ timeout: 10000 });`
    ],
    "exercises": [
      {
        "id": "ex-3-1-1",
        "title": "Weryfikacja procesu rejestracji",
        "description": "Napisz test, który po wysłaniu niepoprawnego formularza rejestracji asynchronicznie oczekuje na pojawienie się czerwonego komunikatu o błędzie o konkretnej treści."
      }
    ],
    "quiz": [
      {
        "id": "q3-1-1",
        "question": "Co odróżnia asercję Web-First od tradycyjnej asercji synchronicznej?",
        "options": [
          "Asercja Web-First automatycznie odpytuje i czeka na spełnienie warunku w tle (co kilkanaście milisekund) przez określony timeout",
          "Nie wymaga asynchroniczności (async/await)",
          "Może być uruchamiana wyłącznie bez przeglądarki",
          "Weryfikuje wyłącznie pliki JSON"
        ],
        "correctAnswer": 0,
        "explanation": "Asercje Web-First czekają i ponawiają sprawdzenia, co eliminuje problem wyścigów stanów (race conditions) w asynchronicznym UI."
      }
    ],
    "references": [
      {
        "title": "Hands-On Automated Testing with Playwright (Packt, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Chapter 2: How Playwright ensures actions happen at the right time."
      }
    ],
    "tipsAndTricks": [
      "Przekazuj do expect() zawsze cały obiekt lokatora (Locator), a nie wywołania metod pobierających tekst lub stan widoczności."
    ],
    "commonMistakes": [
      {
        "mistake": "Używanie expect(await page.url()).toBe('/dashboard') zamiast expect(page).toHaveURL('/dashboard')",
        "solution": "Tradycyjne .toBe() nie czeka na zmianę URL. Zawsze używaj dedykowanej asercji Web-First expect(page).toHaveURL()."
      }
    ]
  }
};