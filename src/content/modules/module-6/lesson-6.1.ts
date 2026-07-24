import type { Lesson } from '../../../renderer/types';
import theory6_1 from './lesson-6.1.md?raw';

export const lesson6_1: Lesson = {
  "id": "6.1",
  "moduleId": 6,
  "title": "Wzorzec obiektu strony — fundamenty",
  "description": "Poznaj zasady Separation of Concerns i wdróż wzorzec Page Object Model (POM) w celu scentralizowania lokatorów i akcji.",
  "order": 1,
  "difficulty": "intermediate",
  "tags": ["POM", "design-patterns", "clean-code", "refactoring"],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz wyodrębnić powtarzalne interakcje z UI do dedykowanych klas Page Object oraz otypowywać je poprawnie w TypeScript.",
    "theory": theory6_1,
    "codeExamples": [
      `// Prosta klasa POM w TypeScript
export class CartPage {
  private readonly checkoutButton = this.page.locator('.checkout-btn');
  constructor(private readonly page: Page) {}
  async proceed() { await this.checkoutButton.click(); }
}`
    ],
    "exercises": [
      {
        "id": "ex-6-1-1",
        "title": "Tworzenie pierwszej klasy POM",
        "description": "Stwórz klasę `RegisterPage` hermetyzującą formularz rejestracji użytkownika i zastąp surowy kod testu metodami tej klasy."
      }
    ],
    "quiz": [
      {
        "id": "q6-1-1",
        "question": "Jaka jest główna korzyść stosowania wzorca POM w dużych projektach testowych?",
        "options": [
          "Zmniejszenie kosztu utrzymania testów poprzez scentralizowanie definicji lokatorów i akcji w jednym miejscu",
          "Skrócenie fizycznego czasu wykonywania zapytań HTTP",
          "Automatyczne tłumaczenie testów na inne języki",
          "Całkowite wyeliminowanie potrzeby posiadania przeglądarki"
        ],
        "correctAnswer": 0,
        "explanation": "Zarządzanie zmianami lokatorów w klasach POM chroni testy przed koniecznością edycji wielu plików przy każdej modyfikacji HTML."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 1: Page Object Model basics."
      }
    ],
    "tipsAndTricks": [
      "Deklaruj lokatory jako prywatne pola klasy (private readonly), aby testy nie mogły bezpośrednio manipulować elementami technicznymi stron."
    ],
    "commonMistakes": [
      {
        "mistake": "Umieszczanie asercji biznesowych typu expect() wewnątrz metod Page Objectu",
        "solution": "Page Object powinien wykonywać akcje i zwracać stan. Asercje powinny pozostać widoczne w pliku testowym."
      }
    ]
  }
};