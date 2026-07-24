import type { Lesson } from '../../../renderer/types';
import theory6_3 from './lesson-6.3.md?raw';

export const lesson6_3: Lesson = {
  "id": "6.3",
  "moduleId": 6,
  "title": "Wzorzec komponentu",
  "description": "Zastosuj zasadę kompozycji ponad dziedziczeniem. Projektuj niezależne obiekty komponentów (Component Objects) z zawężonym lokalizatorem Root Locator.",
  "order": 3,
  "difficulty": "intermediate",
  "tags": ["Component-Objects", "composition", "clean-code", "root-locator", "SRP"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz wyodrębniać powtarzalne sekcje interfejsu do niezależnych klas komponentów, poprawnie wdrażać lokalizator korzenia (Root Locator) oraz budować elastyczne Page Objecty za pomocą kompozycji.",
    "theory": theory6_3,
    "codeExamples": [
      `// Przykład komponentu z Root Lokatorem (Książka 3 - Uppadhyay)
export class HeaderComponent {
  private readonly root = this.page.locator('header');
  private readonly search = this.root.getByPlaceholder('Szukaj');
  constructor(private readonly page: Page) {}
}`
    ],
    "exercises": [
      {
        "id": "ex-6-3-1",
        "title": "Wdrożenie komponentu paska wyszukiwania",
        "description": "Zidentyfikuj pasek wyszukiwania w nagłówku strony i przenieś jego lokatory oraz akcje do osobnej klasy `SearchComponent`, a następnie zintegruj go z klasą `MainPage` za pomocą kompozycji."
      }
    ],
    "quiz": [
      {
        "id": "q2-6-3",
        "question": "Jaka jest rola lokalizatora korzenia (Root Locator) w projektowaniu Component Objects?",
        "options": [
          "Ogranicza obszar wyszukiwania elementów wewnętrznych komponentu wyłącznie do wyznaczonego kontenera HTML, zapobiegając kolizjom selektorów",
          "Służy wyłącznie do sprawdzania uprawnień administratora",
          "Automatycznie wyłącza obsługę stylów CSS",
          "Nie ma wpływu na wyszukiwanie elementów"
        ],
        "correctAnswer": 0,
        "explanation": "Używanie rootLocator.locator(...) sprawia, że komponent szuka elementów tylko wewnątrz swoich granic (np. w obrębie kontenera Headeru), co eliminuje błędy duplikacji selektorów na stronie."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 3: Composition over Inheritance & Component Objects."
      }
    ],
    "tipsAndTricks": [
      "Stosuj kompozycję dla wspólnych sekcji takich jak nagłówki, stopki, menu boczne czy tabele z danymi, aby drastycznie skrócić rozmiary klas stron POM."
    ],
    "commonMistakes": [
      {
        "mistake": "Pozwalanie obiektom komponentów na globalne wyszukiwanie na poziomie page.locator()",
        "solution": "Zawsze wyszukuj elementy wewnątrz rootLocator (np. this.rootLocator.locator(...))."
      }
    ]
  }
};