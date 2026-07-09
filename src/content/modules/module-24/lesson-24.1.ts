import type { Lesson } from "../../../renderer/types";
import theory24_1 from './lesson-24.1.md?raw';

export const lesson24_1: Lesson = {
  "id": "24.1",
  "moduleId": 24,
  "title": "Testy obciążenia, przeciążenia, skoków ruchu i długotrwałej pracy",
  "description": "Rodzaje testów wydajnościowych, cele, profile obciążenia, ramp-up, kryteria zakończenia i interpretacja wyników.",
  "order": 1,
  "difficulty": "advanced",
  "tags": [
    "performance",
    "load-testing",
    "stress-testing",
    "spike-testing",
    "soak-testing"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji rozumiesz różnice między load, stress, spike i soak testingiem, potrafisz zaprojektować profil obciążenia oraz dobrać rodzaj testu do ryzyka biznesowego.",
    "theory": theory24_1,
    "codeExamples": [
      "type PerformanceScenario = {\n  name: string;\n  kind: 'load' | 'stress' | 'spike' | 'soak';\n  users: number;\n  duration: string;\n  successCriteria: string[];\n};\n\nconst campaignLoad: PerformanceScenario = {\n  name: 'Black Friday checkout',\n  kind: 'spike',\n  users: 5000,\n  duration: '20m',\n  successCriteria: ['p95 checkout < 1200ms', 'współczynnik błędów < 1%', 'no payment duplicates'],\n};\n",
      "# Przykładowy profil obciążenia\n- 70% przeglądanie katalogu\n- 20% dodanie do koszyka\n- 8% checkout\n- 2% płatność\nRamp-up: 10 minut\nCzas trwania: 45 minut\n"
    ],
    "exercises": [
      {
        "id": "ex-24-1-1",
        "title": "Profil obciążenia",
        "description": "Dla scenariusza „Testy obciążenia, przeciążenia, skoków ruchu i długotrwałej pracy” opisz liczbę użytkowników, ramp-up, czas trwania, dane wejściowe i kryteria sukcesu."
      },
      {
        "id": "ex-24-1-2",
        "title": "Metryki sukcesu",
        "description": "Zdefiniuj p95, p99, współczynnik błędów, przepustowość i progi akceptacji dla krytycznego endpointu."
      },
      {
        "id": "ex-24-1-3",
        "title": "Analiza wąskiego gardła",
        "description": "Na podstawie hipotetycznych metryk CPU, baza danych i latency wskaż najbardziej prawdopodobne wąskie gardło."
      },
      {
        "id": "ex-24-1-4",
        "title": "Thresholds w CI",
        "description": "Zaprojektuj progi, które blokują regresję wydajnościową, ale nie generują fałszywych alarmów."
      },
      {
        "id": "ex-24-1-5",
        "title": "Dane testowe",
        "description": "Opisz, jakie dane są potrzebne do wiarygodnego testu wydajnościowego i jak je przygotujesz."
      },
      {
        "id": "ex-24-1-6",
        "title": "Raport wydajnościowy",
        "description": "Przygotuj strukturę raportu: cel, środowisko, profil, wyniki, wnioski i rekomendacje."
      }
    ],
    "quiz": [
      {
        "id": "q24-1-1",
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
        "id": "q24-1-2",
        "question": "Dlaczego średnia latency bywa myląca?",
        "options": [
          "Ukrywa ogon rozkładu i problemy części użytkowników",
          "Zawsze jest równa p95",
          "Nie da się jej policzyć",
          "Dotyczy tylko interfejsu użytkownika"
        ],
        "correctAnswer": 0,
        "explanation": "Percentyle pokazują doświadczenie wolniejszych żądań, których średnia może nie ujawniać."
      },
      {
        "id": "q24-1-3",
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
        "id": "q24-1-4",
        "question": "Czym różni się load test od stress testu?",
        "options": [
          "Load sprawdza oczekiwane obciążenie, stress szuka granic systemu",
          "To dokładnie to samo",
          "Stress jest tylko dla interfejsu użytkownika",
          "Load nie używa metryk"
        ],
        "correctAnswer": 0,
        "explanation": "Load test weryfikuje normalny lub przewidywany ruch, stress test przeciąża system."
      },
      {
        "id": "q24-1-5",
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
        "id": "q24-1-6",
        "question": "Co jest typowym wąskim gardłem?",
        "options": [
          "baza danych, CPU, zewnętrzne API, blokady albo pula połączeń",
          "Kolor tekstu",
          "Nazwa commita",
          "Brak screenshotu"
        ],
        "correctAnswer": 0,
        "explanation": "Wąskie gardło może znajdować się w aplikacji, bazie, sieci lub zależności."
      },
      {
        "id": "q24-1-7",
        "question": "Dlaczego dane testowe są ważne w performance testingu?",
        "options": [
          "Rozmiar i rozkład danych wpływają na czas odpowiedzi",
          "Nie mają znaczenia",
          "Zawsze powinny być puste",
          "Służą tylko do interfejsu użytkownika"
        ],
        "correctAnswer": 0,
        "explanation": "Zapytania na pustej bazie mogą wyglądać świetnie, a na realistycznych danych — fatalnie."
      },
      {
        "id": "q24-1-8",
        "question": "Najważniejsza myśl lekcji „Testy obciążenia, przeciążenia, skoków ruchu i długotrwałej pracy” to:",
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
        "title": "Grafana k6 Documentation",
        "url": "https://grafana.com/docs/k6/latest/",
        "description": "Dokumentacja k6: scenariusze, metryki, progi jakości i uruchamianie testów obciążeniowych."
      },
      {
        "title": "Apache JMeter User Manual",
        "url": "https://jmeter.apache.org/usermanual/get-started.html",
        "description": "Podręcznik JMetera do testów protokołów i planów obciążenia."
      },
      {
        "title": "Google Web.dev Performance",
        "url": "https://web.dev/performance/",
        "description": "Materiały o wydajności aplikacji webowych i doświadczeniu użytkownika."
      },
      {
        "title": "SRE Book - Monitoring Distributed Systems",
        "url": "https://sre.google/sre-book/monitoring-distributed-systems/",
        "description": "Kontekst metryk, alertów i niezawodności w systemach produkcyjnych."
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
