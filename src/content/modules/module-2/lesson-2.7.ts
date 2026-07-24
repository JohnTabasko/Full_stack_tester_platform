import type { Lesson } from '../../../renderer/types';
import theory2_7 from './lesson-2.7.md?raw';

export const lesson2_7: Lesson = {
  "id": "2.7",
  "moduleId": 2,
  "title": "Obsługa ramek (iframes) i Shadow DOM",
  "description": "Opanuj testowanie elementów osadzonych w ramkach iframe za pomocą frameLocator, obsługę ramek zagnieżdżonych oraz natywne przenikanie przez korzenie Shadow DOM.",
  "order": 7,
  "difficulty": "intermediate",
  "tags": ["iframes", "frameLocator", "Shadow-DOM", "nested-frames", "web-components"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz lokalizować i manipulować elementami ukrytymi wewnątrz ramek iframe oraz zagnieżdżonych struktur, a także w pełni rozumiesz zaletę natywnego wsparcia Playwright dla technologii Shadow DOM.",
    "theory": theory2_7,
    "codeExamples": [
      `// Lokalizowanie elementu wewnątrz iframe (Książka 1 - Kelhini)
const cardFrame = page.frameLocator('iframe.card-input');
await cardFrame.getByPlaceholder('Numer karty').fill('4111 2222 3333 4444');`
    ],
    "exercises": [
      {
        "id": "ex-2-7-1",
        "title": "Wprowadzanie danych w Stripe Sandbox",
        "description": "Napisz test dla strony kasy zawierającej osadzony formularz płatności w iframe. Zlokalizuj ramkę, wypełnij dane karty testowej i zatwierdź płatność."
      }
    ],
    "quiz": [
      {
        "id": "q2-7-1",
        "question": "W jaki sposób Playwright obsługuje lokalizowanie elementów ukrytych wewnątrz Shadow DOM?",
        "options": [
          "Przenika przez Shadow Roots automatycznie i natywnie, bez potrzeby stosowania żadnej dodatkowej konfiguracji ani specjalnych selektorów",
          "Wymaga użycia specjalnego selektora /deep/",
          "Nie obsługuje technologii Shadow DOM",
          "Wymaga każdorazowego wywoływania kodu page.evaluate()"
        ],
        "correctAnswer": 0,
        "explanation": "To ogromna przewaga Playwright - wszystkie standardowe lokalizatory domyślnie i bezproblemowo penetrują drzewo Shadow DOM, traktując je jak zwykły dokument."
      }
    ],
    "references": [
      {
        "title": "Hands-On Automated Testing with Playwright (Packt, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Chapter 2: Accessing an iframe & nested frames."
      }
    ],
    "tipsAndTricks": [
      "Upewnij się, że selektor przekazany do frameLocator() wskazuje jednoznacznie na element iframe, a nie na elementy wewnątrz niego."
    ],
    "commonMistakes": [
      {
        "mistake": "Używanie page.locator() do szukania elementów wewnątrz ramki iframe",
        "solution": "Zawsze najpierw wywołaj page.frameLocator('iframe-selector'), a dopiero na zwróconym obiekcie wykonuj zapytania o elementy wewnętrzne."
      }
    ]
  }
};