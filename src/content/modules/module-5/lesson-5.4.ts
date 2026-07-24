import type { Lesson } from '../../../renderer/types';
import theory5_4 from './lesson-5.4.md?raw';

export const lesson5_4: Lesson = {
  "id": "5.4",
  "moduleId": 5,
  "title": "Równoległość i dzielenie testów",
  "description": "Opanuj zaawansowaną optymalizację czasu CI. Poznaj konfigurację procesów roboczych (Workers), zasady bezpiecznej izolacji danych współbieżnych, mechanizm Shardingu oraz scalanie raportów Blob.",
  "order": 4,
  "difficulty": "advanced",
  "tags": ["concurrency", "parallelism", "workers", "sharding", "merge-reports"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz projektować zestawy testów odporne na błędy współbieżności, konfigurować limit wątków roboczych dla maszyn deweloperskich i serwerów CI, a także wdrożyć zaawansowane dzielenie testów (sharding) na wiele maszyn w rurociągach GitHub Actions.",
    "theory": theory5_4,
    "codeExamples": [
      `// Przykład wykorzystania workerIndex do unikalności danych (Książka 3 - Uppadhyay)
test('unikalna nazwa transakcji', async ({ page }, testInfo) => {
  const transactionName = \`transakcja-worker-\${testInfo.workerIndex}\`;
  // ... test działa na odizolowanych danych!
});`
    ],
    "exercises": [
      {
        "id": "ex-5-4-1",
        "title": "Wdrożenie Shardingu w rurociągu CI",
        "description": "Zaprojektuj uproszczony plik konfiguracyjny rurociągu CI (np. YAML dla GitHub Actions), który rozbije uruchomienie testów na 3 niezależne maszyny robocze i na końcu scali ich raporty za pomocą `merge-reports`."
      }
    ],
    "quiz": [
      {
        "id": "q5-4-1",
        "question": "Który parametr obiektu testInfo w Playwright pozwala na bezproblemowe zapewnienie unikalności danych (np. e-maila) per proces roboczy (Worker Thread)?",
        "options": [
          "testInfo.workerIndex",
          "testInfo.title",
          "testInfo.retry",
          "testInfo.expectedStatus"
        ],
        "correctAnswer": 0,
        "explanation": "testInfo.workerIndex zwraca unikalny numer wątku (np. 0, 1, 2), co umożliwia przydzielanie unikalnych kont lub danych testowych bez ryzyka kolizji podczas testów współbieżnych."
      }
    ],
    "references": [
      {
        "title": "Hands-On Automated Testing with Playwright (Faraz K. Kelhini, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Chapter 6: Test Parallelization and Performance Optimization (Sharding)."
      }
    ],
    "tipsAndTricks": [
      "Stosuj fullyParallel: true tylko wtedy, gdy masz 100% pewności, że Twoje testy są w pełni niezależne i nie współdzielą żadnych mutowalnych zasobów w bazie."
    ],
    "commonMistakes": [
      {
        "mistake": "Włączanie fullyParallel przy jednoczesnym korzystaniu z jednego, twardo kodowanego konta użytkownika w testach",
        "solution": "Rozdziel konta użytkowników per worker lub twórz je dynamicznie za pomocą API przed rozpoczęciem każdego testu."
      }
    ]
  }
};