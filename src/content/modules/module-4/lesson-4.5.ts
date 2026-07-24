import type { Lesson } from '../../../renderer/types';
import theory4_5 from './lesson-4.5.md?raw';

export const lesson4_5: Lesson = {
  "id": "4.5",
  "moduleId": 4,
  "title": "Strategie uwierzytelniania",
  "description": "Zoptymalizuj proces uwierzytelniania w projektach. Poznaj mechanizm zapisu i ponownego użycia sesji (storageState) przy użyciu Setup Projects oraz strategie wielorolowe.",
  "order": 5,
  "difficulty": "advanced",
  "tags": ["authentication", "storageState", "setup-project", "security", "multi-role"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz wyeliminować powtarzalny proces logowania przez UI, zaimplementować jednokrotne uwierzytelnianie przy użyciu projektu przygotowawczego Setup, zarządzać wieloma rolami oraz zabezpieczać zapisane stany przed wyciekiem.",
    "theory": theory4_5,
    "codeExamples": [
      `// Przykład zapisu stanu sesji (Książka 1 - Kelhini)
await page.context().storageState({ path: '.auth/admin.json' });`
    ],
    "exercises": [
      {
        "id": "ex-4-5-1",
        "title": "Konfiguracja globalnego logowania dla klienta",
        "description": "Zaimplementuj plik `global.setup.ts` logujący klienta i zapisujący jego stan sesji do folderu `.auth/`. Skonfiguruj plik `playwright.config.ts` tak, aby projekt 'chromium' zależał od projektu 'setup'."
      }
    ],
    "quiz": [
      {
        "id": "q4-5-1",
        "question": "Jaka jest główna zaleta stosowania mechanizmu storageState w Playwright Test?",
        "options": [
          "Radykalnie skraca czas wykonania zestawów testowych, eliminując potrzebę ponownego logowania przez UI na początku każdego testu",
          "Automatycznie szyfruje hasła w kodzie testów",
          "Zastępuje bazę danych aplikacji",
          "Uruchamia testy wyłącznie na urządzeniach mobilnych"
        ],
        "correctAnswer": 0,
        "explanation": "Zamiast logować się przez interfejs graficzny przy każdym teście, Playwright jednorazowo zapisuje pliki cookie i localStorage do pliku JSON, wstrzykując je natychmiast do nowych sesji."
      }
    ],
    "references": [
      {
        "title": "Hands-On Automated Testing with Playwright (Packt, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Chapter 14: Security and Authentication (Saving authentication data)."
      }
    ],
    "tipsAndTricks": [
      "Zawsze zabezpieczaj folder ze stanami sesji .auth/ dodając go do pliku .gitignore. Te pliki zawierają aktywne tokeny sesyjne, które dają natychmiastowy dostęp do Twoich kont testowych."
    ],
    "commonMistakes": [
      {
        "mistake": "Zapisywanie stanu sesji bez wcześniejszego poczekania na pełne załadowanie strony po zalogowaniu",
        "solution": "Zawsze przed zapisem wywołaj page.waitForURL() lub expect().toBeVisible() na elemencie kokpitu, aby upewnić się, że cookies zostały prawidłowo wygenerowane przez serwer."
      }
    ]
  }
};