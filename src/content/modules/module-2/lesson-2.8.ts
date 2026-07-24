import type { Lesson } from '../../../renderer/types';
import theory2_8 from './lesson-2.8.md?raw';

export const lesson2_8: Lesson = {
  "id": "2.8",
  "moduleId": 2,
  "title": "Praca z wieloma zakładkami i oknami",
  "description": "Zarządzaj wieloma kartami w jednym BrowserContext. Poznaj wzorzec Event-First dla zdarzenia 'page', przechwytywanie popupów i przełączanie interakcji.",
  "order": 8,
  "difficulty": "intermediate",
  "tags": ["multiple-pages", "tabs", "waitForEvent", "popups", "context-pages"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz kontrolować wielozakładkowość w Playwright, przechwytywać nowe karty i okna bez wyścigów stanów oraz wykonywać testy wymagające przełączania kontekstu między oknami.",
    "theory": theory2_8,
    "codeExamples": [
      `// Bezpieczne przechwycenie nowej karty (Książka 1 - Kelhini)
const pagePromise = context.waitForEvent('page');
await page.getByText('Otwórz pomoc').click();
const newPage = await pagePromise;
await expect(newPage).toHaveURL('/support');`
    ],
    "exercises": [
      {
        "id": "ex-2-8-1",
        "title": "Automatyzacja procesu rejestracji z regulaminem",
        "description": "Napisz test, który przechodzi do formularza rejestracji, klika link otwierający regulamin w nowej karcie, weryfikuje nagłówek na karcie regulaminu, a następnie wraca do formularza i go zatwierdza."
      }
    ],
    "quiz": [
      {
        "id": "q2-8-1",
        "question": "W jaki sposób należy prawidłowo przechwycić nowo otwartą zakładkę, wywołaną kliknięciem przycisku?",
        "options": [
          "Inicjalizując obietnicę context.waitForEvent('page') przed kliknięciem, a następnie czekając na jej rozwiązanie po kliknięciu",
          "Używając metody page.switchToWindow()",
          "Wpisując stały sleep na 5 sekund po kliknięciu",
          "Otwierając ręcznie nowy adres URL przy użyciu page.goto()"
        ],
        "correctAnswer": 0,
        "explanation": "Inicjalizacja oczekiwania na zdarzenie (waitForEvent) równolegle z kliknięciem to jedyny bezbłędny sposób zapobiegający utracie zdarzenia otwarcia karty przy szybkim renderowaniu."
      }
    ],
    "references": [
      {
        "title": "Hands-On Automated Testing with Playwright (Packt, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Chapter 11: Testing Mobile Web Experiences & Multi-tabs."
      }
    ],
    "tipsAndTricks": [
      "Wykorzystaj tablicę context.pages() do diagnozowania, ile dokładnie kart jest w danym momencie otwartych w Twojej sesji testowej."
    ],
    "commonMistakes": [
      {
        "mistake": "Próba użycia page.locator() bezpośrednio na nowym adresie bez przechwycenia referencji do nowej instancji strony",
        "solution": "Zawsze przypisz nową stronę do dedykowanej zmiennej po rozwiązaniu obietnicy waitForEvent('page') i na niej wykonuj akcje."
      }
    ]
  }
};