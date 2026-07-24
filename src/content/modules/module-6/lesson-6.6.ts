import type { Lesson } from '../../../renderer/types';
import theory6_6 from './lesson-6.6.md?raw';

export const lesson6_6: Lesson = {
  "id": "6.6",
  "moduleId": 6,
  "title": "Wzorzec obiektu strony z fiksturami",
  "description": "Zintegruj Page Object Model z systemem fixture-ów Playwright. Wyeliminuj ręczne instancjonowanie klas stron i wdróż wstrzykiwanie zależności.",
  "order": 6,
  "difficulty": "intermediate",
  "tags": ["POM", "fixtures", "dependency-injection", "customTest", "clean-code"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz wyeliminować kruchy kod inicjalizacji stron z plików testowych, rozszerzyć bazowy test Playwright o własne fixtury Page Objects oraz poprawnie wstrzykiwać otypowane instancje do testów.",
    "theory": theory6_6,
    "codeExamples": [
      `// Przykład rejestracji stron jako fixtures (Książka 2 - Greffier)
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

export const test = base.extend<{ loginPage: LoginPage }>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  }
});`
    ],
    "exercises": [
      {
        "id": "ex-6-6-1",
        "title": "Przepisanie testu na wstrzykiwanie fixtur",
        "description": "Weź istniejący plik testowy, w którym na początku każdego testu tworzone są instancje `new LoginPage(page)` i `new DashboardPage(page)`. Przepisz go w całości na wstrzykiwanie gotowych fixtur stron."
      }
    ],
    "quiz": [
      {
        "id": "q2-6-6",
        "question": "Jaka jest główna zaleta integrowania klas Page Object z systemem fixture-ów w Playwright?",
        "options": [
          "Wstrzykuje instancje stron do testów automatycznie i leniwie (tylko wtedy, gdy test o nie poprosi), eliminując powtarzalny kod instancjacji",
          "Automatycznie naprawia zepsute selektory CSS",
          "Pozwala na uruchamianie testów bez przeglądarki",
          "Wymaga pisania testów wyłącznie w języku angielskim"
        ],
        "correctAnswer": 0,
        "explanation": "Dzięki integracji z fixturami, test staje się czystym opisem scenariusza biznesowego, a Playwright automatycznie i leniwie (lazy-loading) dba o powołanie do życia odpowiednich obiektów stron."
      }
    ],
    "references": [
      {
        "title": "Practical Playwright Test (Jean-François Greffier, 2026)",
        "url": "https://doi.org/10.1007/979-8-8688-2160-8",
        "description": "Chapter 7: POM with Fixture integration."
      }
    ],
    "tipsAndTricks": [
      "Stosuj wstrzykiwanie klas POM przez fixtury we wszystkich komercyjnych projektach. To chroni przed powstawaniem długu technologicznego na wczesnym etapie."
    ],
    "commonMistakes": [
      {
        "mistake": "Ręczne wywoływanie instancji klas stron wewnątrz beforeEach przy włączonych fixturach",
        "solution": "Pozwól systemowi wtryskiwania Playwright na pełne i automatyczne zarządzanie cyklem życia obiektów stron."
      }
    ]
  }
};