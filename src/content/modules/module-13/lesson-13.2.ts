import type { Lesson } from '../../../renderer/types';
import theory13_2 from './lesson-13.2.md?raw';

export const lesson13_2: Lesson = {
  "id": "13.2",
  "moduleId": 13,
  "title": "Testowanie wydajności aplikacji",
  "description": "Natywne testowanie wydajności frontendu. Poznaj API Navigation Timing, pomiar Core Web Vitals (FCP, LCP, CLS) bezpośrednio w przeglądarce oraz wdrażanie budżetów wydajnościowych.",
  "order": 2,
  "difficulty": "advanced",
  "tags": ["performance", "Web-Vitals", "LCP", "Navigation-Timing", "optimization"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz pisać automatyczne testy wydajnościowe, odpytywać interfejsy Performance API przeglądarki, mierzyć kluczowe metryki Core Web Vitals (LCP, CLS) oraz kontrolować budżety wydajnościowe w CI/CD.",
    "theory": theory13_2,
    "codeExamples": [
      `// Pomiar czasu Navigation Timing (Książka 1 - Kelhini)
const duration = await page.evaluate(() => performance.getEntriesByType('navigation')[0].duration);
expect(duration).toBeLessThan(2000);`
    ],
    "exercises": [
      {
        "id": "ex-13-2-1",
        "title": "Pomiar metryki CLS",
        "description": "Zaimplementuj skrypt weryfikujący Cumulative Layout Shift (CLS) podczas ładowania strony głównej i upewnij się, że wartość CLS jest mniejsza niż 0.1 (standard stabilności wizualnej)."
      }
    ],
    "quiz": [
      {
        "id": "q13-2-1",
        "question": "Która metryka Core Web Vitals mierzy czas załadowania i wyrenderowania największego elementu graficznego (np. baneru głównego) na ekranie?",
        "options": [
          "Largest Contentful Paint (LCP)",
          "First Contentful Paint (FCP)",
          "Cumulative Layout Shift (CLS)",
          "Time to Interactive (TTI)"
        ],
        "correctAnswer": 0,
        "explanation": "LCP (Largest Contentful Paint) ocenia prędkość renderowania kluczowej, największej zawartości strony widzianej przez użytkownika."
      }
    ],
    "references": [
      {
        "title": "Hands-On Automated Testing with Playwright (Faraz K. Kelhini, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Chapter 6: Test Parallelization and Performance Optimization (Built-in browser performance APIs)."
      }
    ],
    "tipsAndTricks": [
      "Wykorzystuj PerformanceObserver do asynchronicznego nasłuchiwania zdarzeń renderowania bez spowalniania głównego wątku przeglądarki."
    ],
    "commonMistakes": [
      {
        "mistake": "Mierzenie wydajności na niestabilnym łączu bez wcześniejszego zasymulowania stałych warunków sieciowych",
        "solution": "Użyj opcji emulacji sieci w Playwright w celu ujednolicenia pasma (np. profil Broadband) przed dokonaniem pomiaru czasów."
      }
    ]
  }
};