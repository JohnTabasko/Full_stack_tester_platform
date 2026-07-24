import type { Lesson } from '../../../renderer/types';
import theory16_4 from './lesson-16.4.md?raw';

export const lesson16_4: Lesson = {
  "id": "16.4",
  "moduleId": 16,
  "title": "Testowanie komponentów w Playwright",
  "description": "Poznaj rewolucyjną alternatywę dla JSDOM. Opanuj Playwright Component Testing (CT), renderowanie komponentów metodą mount() w rzeczywistych przeglądarkach oraz asercje interakcji.",
  "order": 4,
  "difficulty": "advanced",
  "tags": ["component-testing", "mount", "React", "Vue", "Shadow-DOM", "clean-code"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz skonfigurować środowisko Playwright CT w swoim projekcie frontendowym, renderować odizolowane komponenty metodą mount(), przekazywać parametry i zdarzenia oraz pisać szybkie i stabilne testy komponentów w prawdziwej przeglądarce.",
    "theory": theory16_4,
    "codeExamples": [
      `// Przykład testu komponentu w Playwright CT (Książka 2 - Greffier)
import { test, expect } from '@playwright/experimental-ct-react';
test('test przycisku', async ({ mount }) => {
  const component = await mount(<Button label="Zapisz" />);
  await expect(component).toHaveText('Zapisz');
});`
    ],
    "exercises": [
      {
        "id": "ex-16-4-1",
        "title": "Test komponentu wejściowego Input",
        "description": "Napisz test dla komponentu pola tekstowego `InputField`. Przekaż mu domyślny tekst pomocniczy (placeholder), wpisz wartość za pomocą `.fill()`, upewnij się, że poprawnie wyzwala zdarzenie `onChange` i waliduje pustą wartość."
      }
    ],
    "quiz": [
      {
        "id": "q16-4-1",
        "question": "Jaka jest główna zaleta stosowania Playwright Component Testing (CT) w porównaniu do tradycyjnego React Testing Library opartego na JSDOM?",
        "options": [
          "Playwright CT renderuje i testuje komponenty w rzeczywistym, prawdziwym silniku przeglądarki (Chromium/Firefox/Safari), co pozwala na pełną i trafną weryfikację m.in. stylów CSS i responsywności",
          "Jest znacznie wolniejszy",
          "Nie obsługuje języka TypeScript",
          "Działa wyłącznie w trybie tekstowym bez grafiki"
        ],
        "correctAnswer": 0,
        "explanation": "JSDOM to jedynie tekstowa imitacja przeglądarki uruchamiana w konsoli Node.js, która ignoruje style CSS i renderowanie. Playwright CT daje 100% realizm działania komponentu w rzeczywistym silniku przeglądarki."
      }
    ],
    "references": [
      {
        "title": "Practical Playwright Test (Jean-François Greffier, 2026)",
        "url": "https://doi.org/10.1007/979-8-8688-2160-8",
        "description": "Chapter 11: Beyond End-to-End Testing (Component Testing)."
      }
    ],
    "tipsAndTricks": [
      "Używaj Playwright CT do budowania i testowania bibliotek komponentów (Design Systems), gwarantując ich bezbłędne renderowanie i działanie we wszystkich głównych przeglądarkach."
    ],
    "commonMistakes": [
      {
        "mistake": "Próba uruchomienia testów Playwright CT za pomocą zwykłego runnera npx playwright test",
        "solution": "Testy komponentowe wymagają dedykowanej konfiguracji i są uruchamiane osobnym skryptem zdefiniowanym przy konfiguracji projektu CT."
      }
    ]
  }
};