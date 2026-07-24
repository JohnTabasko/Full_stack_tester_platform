import type { Lesson } from '../../../renderer/types';
import theory5_1 from './lesson-5.1.md?raw';

export const lesson5_1: Lesson = {
  "id": "5.1",
  "moduleId": 5,
  "title": "Runner testów Playwright",
  "description": "Zrozum niskopoziomową architekturę procesów roboczych (Workers) i silnika transpilacji esbuild. Poznaj cykl życia testu oraz odczytywanie metadanych przez testInfo.",
  "order": 1,
  "difficulty": "intermediate",
  "tags": ["test-runner", "architecture", "workers", "esbuild", "testInfo", "lifecycle"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz opisać architekturę silnika Playwright, mechanizmy izolacji procesów roboczych, zarządzać krokami testowymi przy użyciu test.step oraz wykorzystywać metadane z obiektu testInfo.",
    "theory": theory5_1,
    "codeExamples": [
      `// Przykład wykorzystania test.step oraz testInfo (Książka 1 - Kelhini)
test('złożone kroki biznesowe', async ({ page }, testInfo) => {
  await test.step('Krok 1: Logowanie', async () => {
    await page.goto('/login');
  });
  console.log(\`Test retry number: \${testInfo.retry}\`);
});`
    ],
    "exercises": [
      {
        "id": "ex-5-1-1",
        "title": "Strukturyzacja testu za pomocą test.step",
        "description": "Napisz test dla wieloetapowego procesu kasy i zgrupuj akcje w trzy niezależne bloki `test.step()`, upewniając się, że raporty HTML są dzięki temu czytelne."
      }
    ],
    "quiz": [
      {
        "id": "q5-1-1",
        "question": "W jaki sposób Playwright Test uruchamia testy współbieżnie (równolegle)?",
        "options": [
          "Uruchamia wiele niezależnych procesów systemu operacyjnego (Workers), z których każdy posiada własną, odizolowaną instancję przeglądarki",
          "Wszystkie testy wykonują się w jednym wątku przy użyciu setTimeout",
          "Wykorzystuje serwery w chmurze Microsoftu",
          "Playwright nie obsługuje testów równoległych"
        ],
        "correctAnswer": 0,
        "explanation": "Playwright orkiestruje niezależne procesy systemu operacyjnego (Workers). Gwarantuje to absolutną izolację testów i chroni przed wyciekiem stanów sesyjnych w pamięci RAM."
      }
    ],
    "references": [
      {
        "title": "Hands-On Automated Testing with Playwright (Packt, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Chapter 6: Test Parallelization and Performance Optimization."
      }
    ],
    "tipsAndTricks": [
      "Wykorzystuj test.step(), aby Twoje testy w raportach HTML wyglądały jak scenariusze biznesowe opisane ludzkim językiem."
    ],
    "commonMistakes": [
      {
        "mistake": "Współdzielenie mutowalnego stanu za pomocą zmiennych o zasięgu pliku (np. let userId) przy testach wielowątkowych",
        "solution": "Nigdy nie współdziel stanu w zmiennych globalnych pliku, ponieważ wątki robocze (workery) nadpiszą te wartości współbieżnie, powodując fałszywe błędy."
      }
    ]
  }
};