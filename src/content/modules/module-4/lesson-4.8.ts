import type { Lesson } from '../../../renderer/types';
import theory4_8 from './lesson-4.8.md?raw';

export const lesson4_8: Lesson = {
  "id": "4.8",
  "moduleId": 4,
  "title": "Evaluating JS, handles, Clock i mockowanie API",
  "description": "Opanuj wykonywanie skryptów w przeglądarce przez page.evaluate, przekazywanie argumentów, różnicę między JSHandle a Locatorami oraz manipulację czasem przez page.clock.",
  "order": 8,
  "difficulty": "advanced",
  "tags": ["evaluate", "clock", "time-mocking", "JSHandle", "browser-API"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz bezpiecznie wykonywać dowolny kod JavaScript w kontekście przeglądarki, pobierać referencje do obiektów, a także kontrolować czas systemowy przeglądarki za pomocą wirtualnego zegara page.clock.",
    "theory": theory4_8,
    "codeExamples": [
      `// Przykład symulacji czasu systemowego zegara (Książka 1 - Kelhini)
await page.clock.install({ time: new Date('2026-07-24T12:00:00Z') });
await page.clock.fastForward('10:00'); // Przesuń o 10 minut`
    ],
    "exercises": [
      {
        "id": "ex-4-8-1",
        "title": "Pomiar czasu wygaśnięcia ciasteczka",
        "description": "Zaimplementuj test, który instaluje wirtualny zegar w przeglądarce, ustawia czas, loguje się na konto, przyspiesza czas o 2 godziny i sprawdza, czy ciasteczko sesyjne zostało automatycznie usunięte z przeglądarki."
      }
    ],
    "quiz": [
      {
        "id": "q4-8-1",
        "question": "W jakim celu stosuje się API page.clock w nowoczesnym Playwright?",
        "options": [
          "Do manipulowania, przyspieszania i zatrzymywania czasu systemowego (zegara) wewnątrz przeglądarki w celu testowania m.in. timeoutów sesji",
          "Do mierzenia czasu fizycznego wykonywania testów",
          "Do automatycznego opóźniania kliknięć na stronie",
          "API page.clock nie służy do kontroli przeglądarki"
        ],
        "correctAnswer": 0,
        "explanation": "page.clock to potężne, stabilne API pozwalające zainstalować wirtualny zegar w przeglądarce i błyskawicznie przesuwać czas w przód (fastForward), co umożliwia bezproblemowe i natychmiastowe testowanie wygasania sesji."
      }
    ],
    "references": [
      {
        "title": "Hands-On Automated Testing with Playwright (Packt, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Chapter 2: page.waitForFunction & JS Execution."
      }
    ],
    "tipsAndTricks": [
      "Przekazuj argumenty do evaluate() jako oddzielne zmienne po ciele funkcji. Pamiętaj, że funkcja w przeglądarce nie ma dostępu do zmiennych zadeklarowanych w pliku Node.js z powodu odizolowania procesów."
    ],
    "commonMistakes": [
      {
        "mistake": "Próba używania ElementHandle do manipulowania elementami DOM w nowoczesnych testach",
        "solution": "Unikaj ElementHandle. Zawsze stosuj otypowane obiekty Locator, które posiadają wbudowane mechanizmy ponowień i sprawdzania gotowości akcji."
      }
    ]
  }
};