import type { Lesson } from '../../../renderer/types';
import theory17_2 from './lesson-17.2.md?raw';

export const lesson17_2: Lesson = {
  "id": "17.2",
  "moduleId": 17,
  "title": "Rodzaje testów i piramida testów",
  "description": "Zrozum mechanikę poziomów testowania. Opanuj strukturę Piramidy Testów Martina Fowlera, demaskuj antywzorzec stożka lodowego (Ice Cream Cone) oraz projektuj hybrydowe strategie regresji.",
  "order": 2,
  "difficulty": "intermediate",
  "tags": ["pyramid", "unit-testing", "API-testing", "E2E", "ice-cream-cone", "best-practices"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz prawidłowo dobierać poziomy testowania w projekcie automatyzacji, wdrażać zasady piramidy testów w celu maksymalizacji prędkości i niezawodności, oraz eliminować błędy stożka lodowego.",
    "theory": theory17_2,
    "codeExamples": [
      `// Przykład optymalnego rozkładu testów (Książka 3 - Uppadhyay)
// Walidacja ujemna wieku -> Test API (Szybki i odizolowany)
test('walidacja ujemna wieku przez API', async ({ request }) => {
  const response = await request.post('/api/user', { data: { age: -5 } });
  expect(response.status()).toBe(400);
});`
    ],
    "exercises": [
      {
        "id": "ex-17-2-1",
        "title": "Analiza rozkładu testów w projekcie",
        "description": "Przeanalizuj funkcjonalność resetowania hasła. Zaprojektuj rozkład testów dla tego modułu zgodnie z piramidą testów: wskaż, co przetestujesz jednostkowo, co w warstwie API, a co w E2E UI."
      }
    ],
    "quiz": [
      {
        "id": "q17-2-1",
        "question": "Jaka jest główna konsekwencja powstawania antywzorca 'stożka lodowego' (Ice Cream Cone) w projekcie testowym?",
        "options": [
          "Suita testowa staje się ekstremalnie wolna, trudna w utrzymaniu i podatna na fałszywe błędy (flakiness) z powodu zbyt dużej liczby testów UI E2E",
          "Wszystkie testy wykonują się w milisekundach",
          "Liczba błędów na produkcji spada do zera",
          "TypeScript przestaje kompilować pliki"
        ],
        "correctAnswer": 0,
        "explanation": "Przeładowanie suity testami UI E2E przy braku testów jednostkowych i API drastycznie spowalnia proces feedback loop i generuje olbrzymie koszty utrzymania zepsutych lokatorów."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 5: Engineering Principles for Enterprise Automation (Martin Fowler Pyramid)."
      }
    ],
    "tipsAndTricks": [
      "Przenoś 80% testów walidacji formularzy i błędów autoryzacji do warstwy API - tam wykonają się 50x szybciej i bez błędów renderowania."
    ],
    "commonMistakes": [
      {
        "mistake": "Testowanie każdego najmniejszego przypadku brzegowego w warstwie E2E (UI)",
        "solution": "Do warstwy E2E wybieraj wyłącznie kluczowe, główne przepływy biznesowe (Happy Path), a walidacje pokrywaj testami integracyjnymi/API."
      }
    ]
  }
};