import type { Lesson } from "../../../renderer/types";
import theory24_3 from './lesson-24.3.md?raw';

export const lesson24_3: Lesson = {
  "id": "24.3",
  "moduleId": 24,
  "title": "JMeter i testy protokołów",
  "description": "JMeter: Test Plan, Thread Groups, Samplers, Config Elements, Timers, Assertions, Listeners, CSV data, non-GUI mode i raport HTML.",
  "order": 3,
  "difficulty": "advanced",
  "tags": [
    "jmeter",
    "protocol-testing",
    "samplery",
    "asercje",
    "timery"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji rozumiesz model pracy JMetera, potrafisz odróżnić test protokołu od testu interfejs użytkownika i wiesz, jak projektować plany testów, które są czytelne, parametryzowane i możliwe do utrzymania.",
    "theory": theory24_3,
    "codeExamples": [
      "# Struktura planu JMeter — opis koncepcyjny\nTest Plan\n  Thread Group: 100 users, ramp-up 5 min\n    CSV Data Set Config: users.csv\n    HTTP Request: POST /login\n    JSON Extractor: token\n    HTTP Header Manager: Authorization: Bearer ${token}\n    HTTP Request: GET /orders\n    Response Assertion: status 200\n",
      "# Zasada interpretacji\nJeżeli chcesz zmierzyć backend API — JMeter/k6 są właściwe.\nJeżeli chcesz zmierzyć doświadczenie użytkownika w przeglądarce — użyj także Web Vitals, Lighthouse albo testów syntetycznych interfejs użytkownika.\n"
    ],
    "exercises": [
      {
        "id": "ex-24-3-1",
        "title": "Profil obciążenia",
        "description": "Dla scenariusza „JMeter i testy protokołów” opisz liczbę użytkowników, ramp-up, czas trwania, dane wejściowe i kryteria sukcesu."
      },
      {
        "id": "ex-24-3-2",
        "title": "Metryki sukcesu",
        "description": "Zdefiniuj p95, p99, współczynnik błędów, przepustowość i progi akceptacji dla krytycznego endpointu."
      },
      {
        "id": "ex-24-3-3",
        "title": "Analiza wąskie gardłou",
        "description": "Na podstawie hipotetycznych metryk CPU, Baza danych i latency wskaż najbardziej prawdopodobne wąskie gardło."
      },
      {
        "id": "ex-24-3-4",
        "title": "Thresholds w CI",
        "description": "Zaprojektuj progi, które blokują regresję wydajnościową, ale nie generują fałszywych alarmów."
      },
      {
        "id": "ex-24-3-5",
        "title": "Dane testowe",
        "description": "Opisz, jakie dane są potrzebne do wiarygodnego testu wydajnościowego i jak je przygotujesz."
      },
      {
        "id": "ex-24-3-6",
        "title": "Raport wydajnościowy",
        "description": "Przygotuj strukturę raportu: cel, środowisko, profil, wyniki, wnioski i rekomendacje."
      }
    ],
    "quiz": [
      {
        "id": "q24-3-1",
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
        "id": "q24-3-2",
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
        "id": "q24-3-3",
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
        "id": "q24-3-4",
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
        "id": "q24-3-5",
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
        "id": "q24-3-6",
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
        "id": "q24-3-7",
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
        "id": "q24-3-8",
        "question": "Najważniejsza myśl lekcji „JMeter i testy protokołów” to:",
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
        "title": "JMeter Getting Started",
        "url": "https://jmeter.apache.org/usermanual/get-started.html",
        "description": "Oficjalny start z JMeter."
      },
      {
        "title": "JMeter Best Practices",
        "url": "https://jmeter.apache.org/usermanual/best-practices.html",
        "description": "Dobre praktyki JMeter, w tym non-GUI mode."
      },
      {
        "title": "JMeter Component Reference",
        "url": "https://jmeter.apache.org/usermanual/component_reference.html",
        "description": "Opis elementów Test Planu."
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
