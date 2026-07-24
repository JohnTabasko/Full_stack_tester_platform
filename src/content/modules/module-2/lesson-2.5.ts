import type { Lesson } from '../../../renderer/types';
import theory2_5 from './lesson-2.5.md?raw';

export const lesson2_5: Lesson = {
  "id": "2.5",
  "moduleId": 2,
  "title": "Wbudowane asercje i auto-wait",
  "description": "Opanuj asercje Web-First w Playwright Test. Zrozum pętlę odpytywania stanów (auto-polling), negowanie asercji, miękkie asercje (expect.soft) oraz nadpisywanie limitów czasu.",
  "order": 5,
  "difficulty": "beginner",
  "tags": ["assertions", "web-first", "polling", "soft-assertions", "expect"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz pisać stabilne, asynchroniczne asercje Web-First, poprawnie negować warunki, stosować miękkie asercje w celu weryfikacji wielopunktowej oraz dostosowywać limity czasowe asercji.",
    "theory": theory2_5,
    "codeExamples": [
      `// Przykład asercji Web-First z niestandardowym timeoutem (Książka 2 - Greffier)
await expect(page.getByRole('alert')).toBeVisible({ timeout: 10000 });`
    ],
    "exercises": [
      {
        "id": "ex-2-5-1",
        "title": "Wdrożenie miękkich asercji",
        "description": "Napisz test weryfikujący podsumowanie profilu użytkownika (imię, nazwisko, wiek). Zastosuj miękkie asercje, tak aby błąd w pisowni imienia nie blokował weryfikacji wieku."
      }
    ],
    "quiz": [
      {
        "id": "q2-5-1",
        "question": "Dlaczego asercje Web-First (np. expect(locator).toBeVisible()) są uważane za bezpieczne w testach UI?",
        "options": [
          "Ponieważ automatycznie czekają i cyklicznie odpytują (poll) drzewo DOM, aż element osiągnie pożądany stan lub minie timeout",
          "Ponieważ wyłączają asynchroniczność w kodzie testu",
          "Ponieważ nie potrzebują lokatorów do działania",
          "Ponieważ są uruchamiane po stronie serwera"
        ],
        "correctAnswer": 0,
        "explanation": "Asercje te czekają asynchronicznie na spełnienie warunku przez określony czas, co eliminuje problem wyścigów stanów (race conditions) w asynchronicznym UI."
      }
    ],
    "references": [
      {
        "title": "Practical Playwright Test (Apress, 2026)",
        "url": "https://doi.org/10.1007/979-8-8688-2160-8",
        "description": "Chapter 6: Custom expect & Web-First Assertions."
      }
    ],
    "tipsAndTricks": [
      "Przekazuj do expect() zawsze cały obiekt lokatora (Locator), a nie wywołania metod pobierających tekst lub stan widoczności."
    ],
    "commonMistakes": [
      {
        "mistake": "Używanie expect(await page.url()).toBe('/dashboard') zamiast expect(page).toHaveURL('/dashboard')",
        "solution": "Tradycyjne .toBe() nie czeka na zmianę URL. Zawsze używaj dedykowanej asercji Web-First expect(page).toHaveURL()."
      }
    ]
  }
};