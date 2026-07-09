import type { Lesson } from "../../../renderer/types";
import theory23_2 from './lesson-23.2.md?raw';

export const lesson23_2: Lesson = {
  "id": "23.2",
  "moduleId": 23,
  "title": "Identyfikator korelacji w testach",
  "description": "Łączenie testów z logami backendu, ślady wykonania ID w żądaniach, propagowane nagłówki i diagnostyka przepływów E2E.",
  "order": 2,
  "difficulty": "advanced",
  "tags": [
    "correlation-id",
    "ślady wykonania-id",
    "diagnostics",
    "e2e",
    "headers"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz zaprojektować przepływ correlation ID od testu przez frontend, API, kolejki i logi oraz wykorzystać go do szybkiej analizy awarii w CI.",
    "theory": theory23_2,
    "codeExamples": [
      "test('checkout exposes correlation id for diagnostics', async ({ page, context }, testInfo) => {\n  const correlationId = `checkout-${Date.now()}`;\n  await context.setExtraHTTPHeaders({ 'x-correlation-id': correlationId });\n\n  await page.goto('/checkout');\n  await page.getByRole('button', { name: 'Zapłać' }).click();\n\n  await testInfo.attach('correlation-id.txt', {\n    body: correlationId,\n    contentType: 'text/plain',\n  });\n});\n",
      "// Propagacja w komunikacie zdarzeniowym.\nawait eventBus.publish('order.paid', {\n  payload: { orderId },\n  headers: { correlationId, causationId: commandId },\n});\n"
    ],
    "exercises": [
      {
        "id": "ex-23-2-1",
        "title": "Mapa sygnałów",
        "description": "Dla przepływu „Identyfikator korelacji w testach” wypisz logi, metryki i ślady wykonania potrzebne do diagnozy awarii."
      },
      {
        "id": "ex-23-2-2",
        "title": "Correlation ID",
        "description": "Zaprojektuj sposób przekazywania correlation ID z testu przez API, kolejki i logi."
      },
      {
        "id": "ex-23-2-3",
        "title": "Panel diagnostyczny",
        "description": "Opisz panel Grafany dla krytycznego endpointu: p95, error rate, throughput i saturacja."
      },
      {
        "id": "ex-23-2-4",
        "title": "Alert użyteczny",
        "description": "Zaproponuj alert, który oznacza realny problem użytkownika, a nie tylko techniczny szum."
      },
      {
        "id": "ex-23-2-5",
        "title": "Analiza incydentu",
        "description": "Na podstawie przykładowej awarii opisz, jak przejdziesz od testu do logów, ślady wykonania i przyczyny."
      },
      {
        "id": "ex-23-2-6",
        "title": "SLO dla funkcji",
        "description": "Zdefiniuj SLI, SLO i error budget dla logowania, checkoutu albo eksportu danych."
      }
    ],
    "quiz": [
      {
        "id": "q23-2-1",
        "question": "Jakie są trzy klasyczne filary obserwowalności?",
        "options": [
          "Logi, metryki i ślady wykonania",
          "HTML, CSS i JS",
          "Unit, mock i spy",
          "Merge, rebase i commit"
        ],
        "correctAnswer": 0,
        "explanation": "Logi, metryki i ślady rozproszone pokazują różne wymiary zachowania systemu."
      },
      {
        "id": "q23-2-2",
        "question": "Po co stosować correlation ID?",
        "options": [
          "Aby połączyć zdarzenia jednego przepływu w wielu usługach",
          "Aby przyspieszyć CSS",
          "Aby zastąpić testy",
          "Aby ukryć błędy"
        ],
        "correctAnswer": 0,
        "explanation": "Correlation ID umożliwia prześledzenie requestu przez frontend, API, kolejki i backend."
      },
      {
        "id": "q23-2-3",
        "question": "Czym jest SLI?",
        "options": [
          "Mierzalnym wskaźnikiem poziomu usługi",
          "Losowym logiem",
          "Typem testu manualnego",
          "Nazwą branchy"
        ],
        "correctAnswer": 0,
        "explanation": "SLI to konkretna miara, np. procent udanych żądań lub p95 czasu odpowiedzi."
      },
      {
        "id": "q23-2-4",
        "question": "Czym jest SLO?",
        "options": [
          "Docelowym poziomem SLI uzgodnionym z biznesem lub zespołem",
          "Dowolnym screenshotem",
          "Narzędziem do mocków",
          "Formatem commita"
        ],
        "correctAnswer": 0,
        "explanation": "SLO określa oczekiwany poziom jakości usługi."
      },
      {
        "id": "q23-2-5",
        "question": "Co oznacza zmęczenie alertami?",
        "options": [
          "Zobojętnienie na zbyt liczne lub mało użyteczne alerty",
          "Brak testów jednostkowych",
          "Szybki endpoint",
          "Udany deploy"
        ],
        "correctAnswer": 0,
        "explanation": "Zbyt wiele alertów niskiej jakości sprawia, że zespół przestaje reagować."
      },
      {
        "id": "q23-2-6",
        "question": "Kiedy ślady wykonania rozproszony jest szczególnie przydatny?",
        "options": [
          "Gdy request przechodzi przez wiele usług",
          "Tylko przy lokalnym CSS",
          "Wyłącznie w README",
          "Nigdy w mikroserwisach"
        ],
        "correctAnswer": 0,
        "explanation": "Trace pokazuje segmenty przepływu i opóźnienia między usługami."
      },
      {
        "id": "q23-2-7",
        "question": "Co powinien zrobić test po wykryciu awarii krytycznego przepływu?",
        "options": [
          "Zostawić kontekst diagnostyczny: correlation ID, ślady wykonania, screenshot lub logi",
          "Ukryć błąd",
          "Usunąć raport",
          "Zawsze powtórzyć bez zapisu"
        ],
        "correctAnswer": 0,
        "explanation": "Dobry test skraca drogę od objawu do przyczyny."
      },
      {
        "id": "q23-2-8",
        "question": "Najważniejsza idea lekcji „Identyfikator korelacji w testach” to:",
        "options": [
          "Jakość trzeba umieć obserwować, nie tylko testować",
          "Metryki zastępują wymagania",
          "Alertów powinno być jak najwięcej",
          "Logi są zbędne"
        ],
        "correctAnswer": 0,
        "explanation": "Obserwowalność rozszerza testowanie o zdolność rozumienia działania systemu."
      }
    ],
    "references": [
      {
        "title": "OpenTelemetry Documentation",
        "url": "https://opentelemetry.io/docs/",
        "description": "Standard zbierania metryk, logów i śladów rozproszonych."
      },
      {
        "title": "Prometheus Documentation",
        "url": "https://prometheus.io/docs/introduction/overview/",
        "description": "System metryk i alertowania powszechnie używany w środowiskach cloud native."
      },
      {
        "title": "Grafana Documentation",
        "url": "https://grafana.com/docs/",
        "description": "Platforma wizualizacji metryk, logów i śladów."
      },
      {
        "title": "Google SRE Book",
        "url": "https://sre.google/sre-book/table-of-contents/",
        "description": "Klasyczne źródło wiedzy o SLI, SLO, error budget i niezawodności."
      }
    ],
    "tipsAndTricks": [
      "Każdy krytyczny test E2E powinien zostawiać identyfikator korelacyjny możliwy do znalezienia w logach backendu.",
      "Metryka bez kontekstu biznesowego bywa szumem; alert powinien oznaczać potrzebę działania.",
      "Trace rozproszony jest szczególnie cenny tam, gdzie request przechodzi przez kilka usług i kolejkę.",
      "SLO powinno wynikać z doświadczenia użytkownika, a nie wyłącznie z wygody infrastruktury."
    ],
    "commonMistakes": [
      {
        "mistake": "Logi bez correlation ID",
        "solution": "Dodawaj identyfikator przepływu do requestów, zdarzeń, logów i załączników testowych."
      },
      {
        "mistake": "Alerty na każdą drobną anomalię",
        "solution": "Projektuj alerty wokół SLO i wpływu na użytkownika, aby uniknąć zmęczenie alertami."
      },
      {
        "mistake": "Brak dashboardu dla testowanych przepływów",
        "solution": "Dla krytycznych scenariuszy przygotuj metryki i widoki diagnostyczne."
      },
      {
        "mistake": "Test kończy się na błędzie bez kontekstu",
        "solution": "Dołącz ślady wykonania, logi, request/response i dane środowiskowe do raportu testu."
      }
    ]
  }
};
