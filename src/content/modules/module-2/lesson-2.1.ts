import type { Lesson } from '../../../renderer/types';
import theory2_1 from './lesson-2.1.md?raw';

export const lesson2_1: Lesson = {
  "id": "2.1",
  "moduleId": 2,
  "title": "Przeglądarka, kontekst i strona",
  "description": "Zrozum trójstopniową hierarchię obiektów Playwright: Browser, BrowserContext i Page. Poznaj techniki izolacji sesji i symulacji wielu użytkowników.",
  "order": 1,
  "difficulty": "beginner",
  "tags": ["browser", "context", "page", "isolation", "architecture"],
  "content": {
    "objective": "Po ukończeniu lekcji rozumiesz architekturę hierarchiczną Playwright, potrafisz tworzyć i zamykać izolowane konteksty przeglądarki oraz projektować testy symulujące wielu użytkowników jednocześnie.",
    "theory": theory2_1,
    "codeExamples": [
      `// Tworzenie izolowanych kontekstów dla wielu użytkowników
const userContext = await browser.newContext();
const adminContext = await browser.newContext();
const userPage = await userContext.newPage();
const adminPage = await adminContext.newPage();`
    ],
    "exercises": [
      {
        "id": "ex-2-1-1",
        "title": "Wieloużytkownikowe logowanie",
        "description": "Napisz test, który otwiera dwa niezależne konteksty przeglądarki, loguje się na dwa różne konta użytkowników i weryfikuje, że sesje nie nakładają się na siebie."
      }
    ],
    "quiz": [
      {
        "id": "q2-1-1",
        "question": "Który obiekt w hierarchii Playwright odpowiada za odizolowaną sesję incognito (ciasteczka, localStorage)?",
        "options": [
          "BrowserContext",
          "Browser",
          "Page",
          "PlaywrightTest"
        ],
        "correctAnswer": 0,
        "explanation": "BrowserContext reprezentuje niezależną, lekką sesję przeglądarki posiadającą własne ciasteczka i pamięć lokalną."
      }
    ],
    "references": [
      {
        "title": "Practical Playwright Test (Jean-François Greffier, 2026)",
        "url": "https://doi.org/10.1007/979-8-8688-2160-8",
        "description": "Chapter 1: Getting Started."
      }
    ],
    "tipsAndTricks": [
      "Korzystaj z wbudowanej fixtury page - pod maską automatycznie tworzy ona nowy, odizolowany BrowserContext dla każdego testu, co oszczędza czas."
    ],
    "commonMistakes": [
      {
        "mistake": "Ręczne uruchamianie nowej przeglądarki (browser.launch) w każdym teście",
        "solution": "Pozwól Playwrightowi zarządzać przeglądarką na poziomie workera i twórz jedynie lekkie konteksty BrowserContext."
      }
    ]
  }
};