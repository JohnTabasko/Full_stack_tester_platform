import type { Lesson } from '../../../renderer/types';
import theory6_2 from './lesson-6.2.md?raw';

export const lesson6_2: Lesson = {
  "id": "6.2",
  "moduleId": 6,
  "title": "Wzorzec strony bazowej",
  "description": "Zaprojektuj abstrakcyjną klasę BasePage. Poznaj zasady dziedziczenia w TypeScript, modyfikatory dostępu protected oraz wzorzec projektowy Metody Szablonowej.",
  "order": 2,
  "difficulty": "intermediate",
  "tags": ["BasePage", "inheritance", "TypeScript", "Template-Method", "design-patterns"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz zaprojektować klasę abstrakcyjną BasePage, poprawnie zarządzać modyfikatorami dostępu protected, zaimplementować metodę szablonową z hookami oraz rozszerzać ją w klasach pochodnych.",
    "theory": theory6_2,
    "codeExamples": [
      `// Przykład klasy bazowej BasePage (Książka 3 - Uppadhyay)
export abstract class BasePage {
  constructor(protected readonly page: Page) {}
  public async navigate(path: string) {
    await this.page.goto(path);
  }
}`
    ],
    "exercises": [
      {
        "id": "ex-6-2-1",
        "title": "Wdrożenie hooka afterNavigate",
        "description": "Zaimplementuj w klasie bazowej `BasePage` hook `afterNavigate()`, który automatycznie sprawdza obecność nagłówka błędu 404 lub 500 na stronie i rzuca wyjątek przerywający test."
      }
    ],
    "quiz": [
      {
        "id": "q2-6-1",
        "question": "Dlaczego klasa bazowa BasePage powinna być zadeklarowana jako abstrakcyjna (abstract class)?",
        "options": [
          "Aby zablokować możliwość tworzenia jej bezpośrednich instancji w testach, rezerwując ją wyłącznie jako szablon i fundament do rozszerzania",
          "Aby przyspieszyć działanie kompilatora esbuild",
          "Ponieważ Playwright nie wspiera zwykłych klas TypeScript",
          "Aby automatycznie zintegrować ją z bazą danych"
        ],
        "correctAnswer": 0,
        "explanation": "Słowo kluczowe abstract w TypeScript gwarantuje, że nikt nie powoła błędnie do życia czystego obiektu BasePage, wymuszając poprawne korzystanie z dziedziczenia."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 3: Building a Scalable UI Framework (BasePage & Template Method)."
      }
    ],
    "tipsAndTricks": [
      "Deklaruj pola jako protected, aby podklasy miały do nich bezpośredni dostęp, ale zablokuj dostęp dla kodu zewnętrznego (np. plików testowych)."
    ],
    "commonMistakes": [
      {
        "mistake": "Tworzenie głębokich, wielopoziomowych hierarchii dziedziczenia (np. BasePage -> AuthenticatedPage -> AdminPage -> UsersPage)",
        "solution": "Unikaj głębokiego dziedziczenia. Zamiast tego stosuj kompozycję i system fixture-ów. Dziedziczenie powinno mieć maksymalnie 1 poziom (BasePage -> Strona)."
      }
    ]
  }
};