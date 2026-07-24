import type { Lesson } from '../../../renderer/types';
import theory9_1 from './lesson-9.1.md?raw';

export const lesson9_1: Lesson = {
  "id": "9.1",
  "moduleId": 9,
  "title": "Narzędzia debugowania w Playwright",
  "description": "Opanuj wizualne i niskopoziomowe debugowanie testów. Poznaj interaktywny Tryb UI (UI Mode), Playwright Inspector (page.pause) oraz Trace Viewer do analizy awarii w CI.",
  "order": 1,
  "difficulty": "intermediate",
  "tags": ["debugging", "UI-mode", "Inspector", "page.pause", "Trace-Viewer"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz sprawnie uruchamiać testy w trybie graficznym i debugować je linijka po linijce, wybierać stabilne lokalizatory narzędziem Pick Locator, a także analizować błędy na maszynach CI przy użyciu plików Trace.",
    "theory": theory9_1,
    "codeExamples": [
      `// Wykorzystanie page.pause() do debugowania (Książka 1 - Kelhini)
test('debugowanie formularza', async ({ page }) => {
  await page.goto('/login');
  await page.pause(); // Zatrzyma wykonanie i otworzy Inspector
});`
    ],
    "exercises": [
      {
        "id": "ex-9-1-1",
        "title": "Analiza błędu w UI Mode",
        "description": "Celowo wprowadź błąd w selektorze jednego z testów. Uruchom platformę w trybie UI (`--ui`) i prześledź stan DOM za pomocą zakładki Time-Travel, aby precyzyjnie zdiagnozować przyczynę awarii."
      }
    ],
    "quiz": [
      {
        "id": "q9-1-1",
        "question": "Które narzędzie w Playwright jest uważane za kluczowe do analizowania przyczyn awarii testów na serwerach CI/CD?",
        "options": [
          "Trace Viewer",
          "Playwright Inspector (--debug)",
          "Zwykły zrzut konsoli terminala",
          "Tryb UI (UI Mode)"
        ],
        "correctAnswer": 0,
        "explanation": "Trace Viewer pozwala otworzyć kompletny plik .zip wygenerowany w CI, zawierający zrzuty DOM, logi konsoli, pełną historię sieci oraz wideo z przebiegu testu, co umożliwia bezproblemową rekonstrukcję błędu."
      }
    ],
    "references": [
      {
        "title": "Hands-On Automated Testing with Playwright (Faraz K. Kelhini, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Chapter 8: Headless Testing and Debugging (Playwright Inspector)."
      }
    ],
    "tipsAndTricks": [
      "Korzystaj z zakładki Network w Trace Viewerze, aby sprawdzić, czy przyczyną wywalenia się asercji na przycisku nie był po prostu błąd 500 lub timeout zapytania API w tle."
    ],
    "commonMistakes": [
      {
        "mistake": "Commitowanie i wypychanie (push) kodu zawierającego instrukcję await page.pause() do repozytorium Git",
        "solution": "Zawsze usuwaj page.pause() przed commitem. Na serwerze CI test uruchamiany bezgłowo (headless) zawiesi się i padnie na limicie czasu."
      }
    ]
  }
};