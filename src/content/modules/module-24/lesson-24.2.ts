import type { Lesson } from "../../../renderer/types";
import theory24_2 from './lesson-24.2.md?raw';

export const lesson24_2: Lesson = {
  "id": "24.2",
  "moduleId": 24,
  "title": "Podstawy k6",
  "description": "Podstawy k6: lifecycle, VUs, scenarios, executors, checks, thresholds, custom metrics, typy testów, dane i CI quality gates.",
  "order": 2,
  "difficulty": "advanced",
  "tags": [
    "k6",
    "vus",
    "progi jakości",
    "checks",
    "load-testing",
    "ci"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz napisać test k6 z realistycznym scenariuszem, checks, progi jakości i metrykami, a także włączyć go jako kontrolę regresji wydajnościowej w CI.",
    "theory": theory24_2,
    "codeExamples": [
      "import http from 'k6/http';\nimport { check, sleep } from 'k6';\n\nexport const options = {\n  stages: [\n    { duration: '2m', target: 50 },\n    { duration: '5m', target: 50 },\n    { duration: '1m', target: 0 },\n  ],\n  progi jakości: {\n    http_req_failed: ['rate<0.01'],\n    http_req_duration: ['p(95)<300'],\n  },\n};\n\nexport default function () {\n  const response = http.get('https://example.test/api/catalog');\n  check(response, { 'catalog status 200': (r) => r.status === 200 });\n  sleep(1);\n}\n",
      "import { Trend } from 'k6/metrics';\nexport const checkoutDuration = new Trend('checkout_duration');\n\n// checkoutDuration.add(durationMs);\n"
    ],
    "exercises": [
      {
        "id": "ex-24-2-1",
        "title": "Profil obciążenia",
        "description": "Dla scenariusza „Podstawy k6” opisz liczbę użytkowników, ramp-up, czas trwania, dane wejściowe i kryteria sukcesu."
      },
      {
        "id": "ex-24-2-2",
        "title": "Metryki sukcesu",
        "description": "Zdefiniuj p95, p99, współczynnik błędów, przepustowość i progi akceptacji dla krytycznego endpointu."
      },
      {
        "id": "ex-24-2-3",
        "title": "Analiza wąskie gardłou",
        "description": "Na podstawie hipotetycznych metryk CPU, Baza danych i latency wskaż najbardziej prawdopodobne wąskie gardło."
      },
      {
        "id": "ex-24-2-4",
        "title": "Thresholds w CI",
        "description": "Zaprojektuj progi, które blokują regresję wydajnościową, ale nie generują fałszywych alarmów."
      },
      {
        "id": "ex-24-2-5",
        "title": "Dane testowe",
        "description": "Opisz, jakie dane są potrzebne do wiarygodnego testu wydajnościowego i jak je przygotujesz."
      },
      {
        "id": "ex-24-2-6",
        "title": "Raport wydajnościowy",
        "description": "Przygotuj strukturę raportu: cel, środowisko, profil, wyniki, wnioski i rekomendacje."
      }
    ],
    "quiz": [
      {
        "id": "q24-2-1",
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
        "id": "q24-2-2",
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
        "id": "q24-2-3",
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
        "id": "q24-2-4",
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
        "id": "q24-2-5",
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
        "id": "q24-2-6",
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
        "id": "q24-2-7",
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
        "id": "q24-2-8",
        "question": "Najważniejsza myśl lekcji „Podstawy k6” to:",
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
        "title": "Grafana k6",
        "url": "https://grafana.com/docs/k6/latest/",
        "description": "Oficjalna dokumentacja k6."
      },
      {
        "title": "k6 Scenarios",
        "url": "https://grafana.com/docs/k6/latest/using-k6/scenarios/",
        "description": "Scenarios i executors."
      },
      {
        "title": "k6 Thresholds",
        "url": "https://grafana.com/docs/k6/latest/using-k6/thresholds/",
        "description": "Progi jakości jako quality gates."
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
