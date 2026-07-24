import type { Lesson } from '../../../renderer/types';
import theory2_9 from './lesson-2.9.md?raw';

export const lesson2_9: Lesson = {
  "id": "2.9",
  "moduleId": 2,
  "title": "Testy regresji wizualnej",
  "description": "Poznaj podstawy weryfikacji wizualnej z toHaveScreenshot. Dowiedz się, jak zarządzać złotymi wzorcami (baseline), maskować dane dynamiczne i konfigurować progi czułości.",
  "order": 9,
  "difficulty": "beginner",
  "tags": ["visual-testing", "toHaveScreenshot", "masking", "snapshots", "baseline"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz pisać podstawowe testy regresji wizualnej w Playwright, stosować opcję maskowania do eliminacji niestabilności oraz dostosowywać progi tolerancji na zmiany pikseli.",
    "theory": theory2_9,
    "codeExamples": [
      `// Przykład asercji wizualnej z maskowaniem (Książka 1 - Kelhini)
await expect(page).toHaveScreenshot('dashboard.png', {
  mask: [page.locator('.dynamic-clock-widget')]
});`
    ],
    "exercises": [
      {
        "id": "ex-2-9-1",
        "title": "Pierwszy test wizualny",
        "description": "Zaimplementuj test wizualny wybranej sekcji nagłówka (Header) swojej strony. Maskuj dynamiczne powitanie użytkownika i zweryfikuj stabilność testu."
      }
    ],
    "quiz": [
      {
        "id": "q2-9-1",
        "question": "W jaki sposób najłatwiej zaktualizować wszystkie złote wzorce (Golden Snapshots) w Playwright?",
        "options": [
          "Uruchamiając testy z flagą --update-snapshots",
          "Ręcznie usuwając wszystkie pliki graficzne z dysku",
          "Zmieniając nazwy zrzutów wewnątrz testów",
          "Playwright aktualizuje wzorce automatycznie przy każdym przejściu testu"
        ],
        "correctAnswer": 0,
        "explanation": "Flaga --update-snapshots to najszyby i dedykowany sposób na nadpisanie wszystkich bazowych zrzutów ekranu nowym wyglądem aplikacji."
      }
    ],
    "references": [
      {
        "title": "Hands-On Automated Testing with Playwright (Packt, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Chapter 10: Setting Up Visual Regression Testing."
      }
    ],
    "tipsAndTricks": [
      "Zalways staraj się uruchamiać testy regresji wizualnej w kontenerach Docker w rurociągu CI, ponieważ silniki renderowania czcionek na Linuxie i macOS różnią się subpikselowo, co powoduje zbędne czerwone testy."
    ],
    "commonMistakes": [
      {
        "mistake": "Próba testowania wizualnego całych stron bez maskowania dat, banerów i dynamicznych list",
        "solution": "Zawsze przekaż lokalizatory tych dynamicznych elementów do opcji mask w toHaveScreenshot()."
      }
    ]
  }
};