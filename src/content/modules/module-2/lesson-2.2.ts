import type { Lesson } from '../../../renderer/types';
import theory2_2 from './lesson-2.2.md?raw';

export const lesson2_2: Lesson = {
  "id": "2.2",
  "moduleId": 2,
  "title": "Nawigacja",
  "description": "Opanuj metody nawigacji i strategie oczekiwania sieciowego: domcontentloaded, load, commit oraz networkidle w aplikacjach tradycyjnych i SPA.",
  "order": 2,
  "difficulty": "beginner",
  "tags": ["navigation", "waitUntil", "networkidle", "SPA", "routing"],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz kontrolować cykl życia nawigacji w Playwright, wybierać odpowiednie strategie waitUntil oraz pisać stabilne testy dla aplikacji typu Single Page Application.",
    "theory": theory2_2,
    "codeExamples": [
      `// Oczekiwanie na stabilizację sieci (networkidle)
await page.goto('/checkout', { waitUntil: 'networkidle' });`
    ],
    "exercises": [
      {
        "id": "ex-2-2-1",
        "title": "Nawigacja SPA z weryfikacją adresu",
        "description": "Napisz test dla aplikacji typu SPA, który klika w link nawigacyjny i asynchronicznie oczekuje na załadowanie nowego widoku przy użyciu asercji toHaveURL."
      }
    ],
    "quiz": [
      {
        "id": "q2-2-1",
        "question": "Która opcja waitUntil w metodzie page.goto oczekuje, aż przez co najmniej 500 ms nie będzie żadnych zapytań sieciowych?",
        "options": [
          "networkidle",
          "domcontentloaded",
          "load",
          "commit"
        ],
        "correctAnswer": 0,
        "explanation": "Opcja networkidle czeka na brak aktywności sieciowej, co jest przydatne do weryfikacji załadowania dynamicznych zasobów, ale może powodować błędy przy stałym odpytywaniu API."
      }
    ],
    "references": [
      {
        "title": "Hands-On Automated Testing with Playwright (Packt, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Chapter 2: Navigation and Waits."
      }
    ],
    "tipsAndTricks": [
      "W aplikacjach SPA unikaj opcji networkidle - jeśli aplikacja stale przesyła logi lub analitykę w tle, test zakończy się błędem timeout."
    ],
    "commonMistakes": [
      {
        "mistake": "Stosowanie page.waitForTimeout() po przejściu na nową stronę",
        "solution": "Użyj asercji Web-First weryfikujących widoczność charakterystycznego elementu docelowej strony."
      }
    ]
  }
};