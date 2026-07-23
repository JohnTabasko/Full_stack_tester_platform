import type { Lesson } from "../../../renderer/types";
import theory23_4 from './lesson-23.4.md?raw';

export const lesson23_4: Lesson = {
  "id": "23.4",
  "moduleId": 23,
  "title": "SLO, SLA, SLI i testowanie odporności",
  "description": "SLO/SLA/SLI, error budget, dobre i złe SLI, testowanie odporności, chaos experiments i decyzje release oparte na niezawodności.",
  "order": 4,
  "difficulty": "advanced",
  "tags": [
    "slo",
    "sla",
    "sli",
    "reliability",
    "error-budget",
    "resilience"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji rozumiesz różnice między SLI, SLO i SLA, potrafisz zaproponować sensowny cel niezawodności dla funkcji oraz wiesz, jak łączyć testy automatyczne z sygnałami produkcyjnymi i budżetem błędów.",
    "theory": theory23_4,
    "codeExamples": [
      "type SloDefinition = {\n  feature: string;\n  sli: string;\n  target: string;\n  window: string;\n  alertWhen: string;\n};\n\nconst loginSlo: SloDefinition = {\n  feature: 'Logowanie',\n  sli: 'Procent prób logowania bez odpowiedzi 5xx',\n  target: '99.9%',\n  window: '30 dni',\n  alertWhen: 'burn rate wskazuje wyczerpanie budżetu błędów w < 48h',\n};\n",
      "// Test odporności: zależność rekomendacji niedostępna, checkout nadal działa.\nawait recommendationService.disable();\nawait page.goto('/checkout');\nawait expect(page.getByRole('heading', { name: /podsumowanie/i })).toBeVisible();\nawait expect(page.getByText(/rekomendacje niedostępne/i)).toBeVisible();\n"
    ],
    "exercises": [
      {
        "id": "ex-23-4-1",
        "title": "Mapa sygnałów",
        "description": "Dla przepływu „SLO, SLA, SLI i testowanie odporności” wypisz logi, metryki i ślady wykonania potrzebne do diagnozy awarii."
      },
      {
        "id": "ex-23-4-2",
        "title": "Correlation ID",
        "description": "Zaprojektuj sposób przekazywania correlation ID z testu przez API, kolejki i logi."
      },
      {
        "id": "ex-23-4-3",
        "title": "Panel diagnostyczny",
        "description": "Opisz panel Grafany dla krytycznego endpointu: p95, error rate, throughput i saturacja."
      },
      {
        "id": "ex-23-4-4",
        "title": "Alert użyteczny",
        "description": "Zaproponuj alert, który oznacza realny problem użytkownika, a nie tylko techniczny szum."
      },
      {
        "id": "ex-23-4-5",
        "title": "Analiza incydentu",
        "description": "Na podstawie przykładowej awarii opisz, jak przejdziesz od testu do logów, ślady wykonania i przyczyny."
      },
      {
        "id": "ex-23-4-6",
        "title": "SLO dla funkcji",
        "description": "Zdefiniuj SLI, SLO i error budget dla logowania, checkoutu albo eksportu danych."
      }
    ],
    "quiz": [
      {
        "id": "q23-4-1",
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
        "id": "q23-4-2",
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
        "id": "q23-4-3",
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
        "id": "q23-4-4",
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
        "id": "q23-4-5",
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
        "id": "q23-4-6",
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
        "id": "q23-4-7",
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
        "id": "q23-4-8",
        "question": "Najważniejsza idea lekcji „SLO, SLA, SLI i testowanie odporności” to:",
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
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Enterprise-grade design patterns (PageFactory, ApiFactory, BasePage), SOLID & DRY principles, and full stack scaling."
      },
      {
        "title": "Practical Playwright Test (Jean-François Greffier, 2026)",
        "url": "https://doi.org/10.1007/979-8-8688-2160-8",
        "description": "Deep dive into Playwright runner extension, custom expectations, dependent and automatic fixtures, and component testing."
      },
      {
        "title": "Hands-On Automated Testing with Playwright (Faraz K. Kelhini, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Comprehensive guide to browser mechanics, Chrome DevTools Protocol metrics, WCAG accessibility, visual testing, and mobile web."
      },
      {
        "title": "Google SRE Book",
        "url": "https://sre.google/sre-book/table-of-contents/",
        "description": "SLO, error budget i praktyki SRE."
      },
      {
        "title": "Prometheus Alerting",
        "url": "https://prometheus.io/docs/alerting/latest/overview/",
        "description": "Alerting i reguły."
      },
      {
        "title": "OpenTelemetry Docs",
        "url": "https://opentelemetry.io/docs/",
        "description": "Obserwowalność odporności systemu."
      }
    ],
    "tipsAndTricks": [
      "Zawsze opieraj architekturę testów na zasadach SOLID, unikając przedwczesnej abstrakcji zgodnie z zasadą WET (Write Everything Twice) z podręczników 2026.",
      
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
