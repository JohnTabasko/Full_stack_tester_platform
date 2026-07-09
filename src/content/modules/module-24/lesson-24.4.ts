import type { Lesson } from "../../../renderer/types";
import theory24_4 from './lesson-24.4.md?raw';

export const lesson24_4: Lesson = {
  "id": "24.4",
  "moduleId": 24,
  "title": "Analiza wąskich gardeł i budżet wydajności",
  "description": "Analiza bottlenecków: latency, throughput, error rate, percentyle, saturation, DB/app/API/generator, budżety wydajności i raport.",
  "order": 4,
  "difficulty": "advanced",
  "tags": [
    "wąskie gardło",
    "p95",
    "p99",
    "przepustowość",
    "performance-budget",
    "baseline"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz interpretować wyniki testów wydajnościowych, odróżniać objaw od przyczyny, definiować budżet wydajności i przygotować raport prowadzący do decyzji technicznych.",
    "theory": theory24_4,
    "codeExamples": [
      "type PerformanceBudget = {\n  metric: string;\n  threshold: string;\n  reason: string;\n};\n\nconst budgets: PerformanceBudget[] = [\n  { metric: 'checkout_api_p95', threshold: '< 800ms', reason: 'Checkout wpływa bezpośrednio na konwersję' },\n  { metric: 'http_error_rate', threshold: '< 1%', reason: 'Błędy niszczą wiarygodność testu obciążeniowego' },\n  { metric: 'frontend_lcp_p75', threshold: '< 2500ms', reason: 'Core Web Vitals i doświadczenie użytkownika' },\n];\n",
      "# Minimalna struktura raportu\n1. Cel testu\n2. Środowisko i wersja aplikacji\n3. Profil obciążenia\n4. Dane testowe\n5. Wyniki: p50/p95/p99, RPS, współczynnik błędów\n6. Metryki systemowe\n7. Porównanie z baseline\n8. Wnioski i rekomendacje\n"
    ],
    "exercises": [
      {
        "id": "ex-24-4-1",
        "title": "Profil obciążenia",
        "description": "Dla scenariusza „Analiza wąskich gardeł i budżet wydajności” opisz liczbę użytkowników, ramp-up, czas trwania, dane wejściowe i kryteria sukcesu."
      },
      {
        "id": "ex-24-4-2",
        "title": "Metryki sukcesu",
        "description": "Zdefiniuj p95, p99, współczynnik błędów, przepustowość i progi akceptacji dla krytycznego endpointu."
      },
      {
        "id": "ex-24-4-3",
        "title": "Analiza wąskie gardłou",
        "description": "Na podstawie hipotetycznych metryk CPU, Baza danych i latency wskaż najbardziej prawdopodobne wąskie gardło."
      },
      {
        "id": "ex-24-4-4",
        "title": "Thresholds w CI",
        "description": "Zaprojektuj progi, które blokują regresję wydajnościową, ale nie generują fałszywych alarmów."
      },
      {
        "id": "ex-24-4-5",
        "title": "Dane testowe",
        "description": "Opisz, jakie dane są potrzebne do wiarygodnego testu wydajnościowego i jak je przygotujesz."
      },
      {
        "id": "ex-24-4-6",
        "title": "Raport wydajnościowy",
        "description": "Przygotuj strukturę raportu: cel, środowisko, profil, wyniki, wnioski i rekomendacje."
      }
    ],
    "quiz": [
      {
        "id": "q24-4-1",
        "question": "Co jest pierwszym krokiem testu wydajnościowego?",
        "options": [
          "Określenie celu, profilu obciążenia i kryteriów sukcesu",
          "Uruchomienie maksymalnej liczby wątków",
          "Losowy wybór endpointu",
          "Wyłączenie logów"
        ],
        "correctAnswer": 0,
        "explanation": "Bez celu i profilu obciążenia wynik jest trudny do interpretacji."
      },
      {
        "id": "q24-4-2",
        "question": "Dlaczego średnia latency bywa myląca?",
        "options": [
          "Ukrywa ogon rozkładu i problemy części użytkowników",
          "Zawsze jest równa p95",
          "Nie da się jej policzyć",
          "Dotyczy tylko interfejs użytkownika"
        ],
        "correctAnswer": 0,
        "explanation": "Percentyle pokazują doświadczenie wolniejszych żądań, których średnia może nie ujawniać."
      },
      {
        "id": "q24-4-3",
        "question": "Co oznacza p95?",
        "options": [
          "95% żądań zakończyło się nie wolniej niż ta wartość",
          "Średnią z 95 żądań",
          "Błąd 95% testów",
          "Liczbę użytkowników"
        ],
        "correctAnswer": 0,
        "explanation": "p95 jest percentylem czasu odpowiedzi."
      },
      {
        "id": "q24-4-4",
        "question": "Czym różni się load test od stress testu?",
        "options": [
          "Load sprawdza oczekiwane obciążenie, stress szuka granic systemu",
          "To dokładnie to samo",
          "Stress jest tylko dla interfejs użytkownika",
          "Load nie używa metryk"
        ],
        "correctAnswer": 0,
        "explanation": "Load test weryfikuje normalny lub przewidywany ruch, stress test przeciąża system."
      },
      {
        "id": "q24-4-5",
        "question": "Po co progi jakości w k6?",
        "options": [
          "Aby automatycznie ocenić, czy wynik spełnia kryteria",
          "Aby ukryć błędy",
          "Aby wyłączyć metryki",
          "Aby zastąpić scenariusze"
        ],
        "correctAnswer": 0,
        "explanation": "Thresholds zamieniają wymagania wydajnościowe w automatyczny quality gate."
      },
      {
        "id": "q24-4-6",
        "question": "Co jest typowym wąskie gardłoiem?",
        "options": [
          "Baza danych, CPU, zewnętrzne API, blokady albo pula połączeń",
          "Kolor tekstu",
          "Nazwa commita",
          "Brak screenshotu"
        ],
        "correctAnswer": 0,
        "explanation": "Wąskie gardło może znajdować się w aplikacji, bazie, sieci lub zależności."
      },
      {
        "id": "q24-4-7",
        "question": "Dlaczego dane testowe są ważne w performance testingu?",
        "options": [
          "Rozmiar i rozkład danych wpływają na czas odpowiedzi",
          "Nie mają znaczenia",
          "Zawsze powinny być puste",
          "Służą tylko do interfejs użytkownika"
        ],
        "correctAnswer": 0,
        "explanation": "Zapytania na pustej bazie mogą wyglądać świetnie, a na realistycznych danych — fatalnie."
      },
      {
        "id": "q24-4-8",
        "question": "Najważniejsza myśl lekcji „Analiza wąskich gardeł i budżet wydajności” to:",
        "options": [
          "Wydajność jest mierzalnym wymaganiem, nie subiektywnym wrażeniem",
          "Testy wydajnościowe nie wymagają celu",
          "Zawsze wystarczy jeden użytkownik",
          "Raport jest zbędny"
        ],
        "correctAnswer": 0,
        "explanation": "Profesjonalny test wydajnościowy zaczyna się od wymagań i kończy interpretacją wyników."
      }
    ],
    "references": [
      {
        "title": "k6 Metrics",
        "url": "https://grafana.com/docs/k6/latest/using-k6/metrics/",
        "description": "Metryki k6."
      },
      {
        "title": "Prometheus Overview",
        "url": "https://prometheus.io/docs/introduction/overview/",
        "description": "Metryki i monitoring systemów."
      },
      {
        "title": "OpenTelemetry",
        "url": "https://opentelemetry.io/docs/",
        "description": "Traces, metrics i logs do diagnozy."
      }
    ],
    "tipsAndTricks": [
      "Test wydajnościowy bez celu biznesowego jest tylko generowaniem ruchu.",
      "Zawsze ustal baseline przed optymalizacją; bez punktu odniesienia nie wiesz, czy jest lepiej.",
      "Patrz na percentyle, nie tylko średnią — użytkowników bolą ogony rozkładu.",
      "Wynik testu wydajnościowego interpretuj razem z metrykami infrastruktury i logami aplikacji."
    ],
    "commonMistakes": [
      {
        "mistake": "Brak jasno określonego profilu obciążenia",
        "solution": "Opisz liczbę użytkowników, ramp-up, czas trwania, dane i oczekiwane RPS."
      },
      {
        "mistake": "Analiza wyłącznie średniego czasu odpowiedzi",
        "solution": "Używaj p90, p95, p99, współczynnik błędów i przepustowość."
      },
      {
        "mistake": "Testy na nierealistycznych danych",
        "solution": "Przygotuj dane zbliżone rozmiarem i rozkładem do produkcyjnych."
      },
      {
        "mistake": "Brak progi jakości w CI",
        "solution": "Dodaj progi jakości, które automatycznie wykrywają regresje wydajności."
      }
    ]
  }
};
