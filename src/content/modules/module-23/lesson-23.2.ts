import type { Lesson } from '../../../renderer/types';
import theory23_2 from './lesson-23.2.md?raw';

export const lesson23_2: Lesson = {
  "id": "23.2",
  "moduleId": 23,
  "title": "Identyfikator korelacji w testach",
  "description": "Opanuj śledzenie rozproszone (Distributed Tracing) i debugowanie Full Stack. Poznaj koncepcję Correlation ID, automatyczne wstrzykiwanie nagłówków X-Correlation-Id w Playwright oraz integrację z Grafana Loki.",
  "order": 2,
  "difficulty": "advanced",
  "tags": ["correlation-ID", "observability", "distributed-tracing", "headers", "CDP", "UUID"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz wygenerować i wstrzykiwać unikalne identyfikatory korelacji w testach Playwright, rejestrować je w adnotacjach testowych oraz przeszukiwać rozproszone logi mikroserwisów w usłudze Grafana Loki.",
    "theory": theory23_2,
    "codeExamples": [
      `// Przykład automatycznego wstrzykiwania nagłówków (Książka 3 - Uppadhyay)
await page.route('**/*', async (route) => {
  const headers = { ...route.request().headers(), 'X-Correlation-ID': correlationId };
  await route.continue({ headers });
});`
    ],
    "exercises": [
      {
        "id": "ex-23-2-1",
        "title": "Wdrożenie fixtury z automatycznym Correlation ID",
        "description": "Stwórz w swoim projekcie customową fixturę `traceablePage` rozszerzającą bazową stronę Playwright, która automatycznie generuje UUIDv4 i wstrzykuje go jako nagłówek `X-Correlation-Id` do każdego zapytania sieciowego."
      }
    ],
    "quiz": [
      {
        "id": "q23-2-1",
        "question": "Jaki jest cel wstrzykiwania nagłówka X-Correlation-Id w testach E2E Playwright?",
        "options": [
          "Pozwala na jednoznaczne powiązanie awarii konkretnego testu z powiązanymi logami systemowymi ze wszystkich mikroserwisów (np. w Grafana Loki)",
          "Służy do szyfrowania połączeń sieciowych SSL",
          "Automatycznie zapobiega powstawaniu błędów 500 na serwerze",
          "Zastępuje wbudowane asercje Web-First"
        ],
        "correctAnswer": 0,
        "explanation": "Correlation ID to unikalny identyfikator, który przechodzi przez wszystkie mikroserwisy i jest zapisywany w ich logach, co pozwala w ułamku sekundy odnaleźć pełną ścieżkę logów dla zepsutego testu."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 10: Observability and Governance in Test Automation (Distributed tracing)."
      }
    ],
    "tipsAndTricks": [
      "Dodawaj wygenerowany Correlation ID do adnotacji testInfo.annotations, dzięki czemu deweloperzy badający błąd w raporcie HTML mogą od razu go skopiować do wyszukiwarki logów."
    ],
    "commonMistakes": [
      {
        "mistake": "Brak wstrzykiwania Correlation ID w zapytaniach API (request fixture) podczas testów hybrydowych",
        "solution": "Upewnij się, że rozszerzasz również konfigurację APIRequestContext, aby dodawała nagłówek korelacji do wszystkich żądań HTTP."
      }
    ]
  }
};