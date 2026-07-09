import type { Lesson } from "../../../renderer/types";
import theory13_1 from './lesson-13.1.md?raw';

export const lesson13_1: Lesson = {
  "id": "13.1",
  "moduleId": 13,
  "title": "Wydajność wykonania testów",
  "description": "Blokowanie zasobów, ponowne użycie uwierzytelnienia, wykonanie równoległe, workery, wydajność selektorów, strategia trace, profilowanie i analiza wąskich gardeł.",
  "order": 1,
  "difficulty": "advanced",
  "tags": [
    "performance",
    "optimization",
    "playwright",
    "metrics"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz mierzyć i optymalizować obszar „Wydajność wykonania testów” z użyciem baseline, metryk, budżetów wydajnościowych i świadomej analizy kompromisów.",
    "theory": theory13_1,
    "codeExamples": [
      "test.beforeEach(async ({ page }) => {\n  await page.route('**/*', (route) => {\n    const type = route.request().resourceType();\n    if (['image', 'font'].includes(type)) return route.abort();\n    return route.continue();\n  });\n});\n",
      "# Profilowanie najwolniejszych testów z JSON reportu — koncepcyjnie\ncat test-results/results.json   | jq '.suites[].specs[].tests[] | {title, duration: .results[0].duration}'   | jq -s 'sort_by(.duration) | reverse | .[0:10]'\n"
    ],
    "exercises": [
      {
        "id": "ex-13-1-1",
        "title": "Baseline",
        "description": "Dla tematu „Wydajność wykonania testów” zaprojektuj pomiar bazowy i wskaż, jakie dane zapiszesz w raporcie."
      },
      {
        "id": "ex-13-1-2",
        "title": "Top bottlenecks",
        "description": "Wskaż trzy potencjalne wąskie gardła i metryki, które je potwierdzą albo obalą."
      },
      {
        "id": "ex-13-1-3",
        "title": "Performance budget",
        "description": "Zdefiniuj progi p95, error rate, czas suite albo Core Web Vitals dla wybranego scenariusza."
      },
      {
        "id": "ex-13-1-4",
        "title": "Eksperyment optymalizacyjny",
        "description": "Zaproponuj jedną zmianę, sposób pomiaru przed/po i kryterium sukcesu."
      },
      {
        "id": "ex-13-1-5",
        "title": "Raport",
        "description": "Przygotuj strukturę raportu: cel, środowisko, wyniki, porównanie z baseline i rekomendacje."
      },
      {
        "id": "ex-13-1-6",
        "title": "Ryzyka uboczne",
        "description": "Opisz, jakie ryzyko może wprowadzić dana optymalizacja i jak je przetestować."
      }
    ],
    "quiz": [
      {
        "id": "q13-1-1",
        "question": "Jaka jest pierwsza zasada optymalizacji?",
        "options": [
          "Najpierw mierz, potem zmieniaj",
          "Najpierw usuwaj asercje",
          "Zawsze zwiększ workers",
          "Ignoruj baseline"
        ],
        "correctAnswer": 0,
        "explanation": "Bez pomiaru nie da się odróżnić poprawy od wrażenia."
      },
      {
        "id": "q13-1-2",
        "question": "Co oznacza baseline?",
        "options": [
          "Punkt odniesienia dla przyszłych pomiarów",
          "Losowy wynik testu",
          "Brak budżetu",
          "Typ lokatora"
        ],
        "correctAnswer": 0,
        "explanation": "Baseline pozwala wykryć regresję lub poprawę."
      },
      {
        "id": "q13-1-3",
        "question": "Co jest dobrą metryką dla czasu testów?",
        "options": [
          "p95 duration i top slow tests",
          "Kolor raportu",
          "Liczba folderów",
          "Tylko średnia bez kontekstu"
        ],
        "correctAnswer": 0,
        "explanation": "p95 i najwolniejsze testy lepiej pokazują koszt suite niż sama średnia."
      },
      {
        "id": "q13-1-4",
        "question": "Czym jest performance budget?",
        "options": [
          "Ustalonym limitem jakości wydajnościowej",
          "Budżetem pieniężnym zespołu",
          "Brakiem testów",
          "Typem mocka"
        ],
        "correctAnswer": 0,
        "explanation": "Budżet zamienia wymaganie wydajności w mierzalny próg."
      },
      {
        "id": "q13-1-5",
        "question": "Dlaczego realne urządzenia są ważne w performance?",
        "options": [
          "Ujawniają ograniczenia CPU, pamięci, sieci i przeglądarek użytkowników",
          "Zawsze są szybsze",
          "Zastępują CI",
          "Nie mają znaczenia"
        ],
        "correctAnswer": 0,
        "explanation": "Emulacja nie oddaje w pełni wydajności prawdziwego sprzętu."
      },
      {
        "id": "q13-1-6",
        "question": "Co jest ryzykiem resource blocking?",
        "options": [
          "Może ukryć problem zasobu istotnego dla użytkownika",
          "Zawsze pogarsza testy",
          "Nie działa w Playwright",
          "Usuwa raporty"
        ],
        "correctAnswer": 0,
        "explanation": "Blokować należy tylko zasoby nieistotne dla testowanego zachowania."
      },
      {
        "id": "q13-1-7",
        "question": "Po co monitoring continuous performance?",
        "options": [
          "Aby wykrywać trendy i regresje w czasie",
          "Aby zastąpić wszystkie testy",
          "Aby ukryć wolne endpointy",
          "Aby pominąć baseline"
        ],
        "correctAnswer": 0,
        "explanation": "Wydajność degraduje się stopniowo; monitoring pozwala reagować wcześniej."
      },
      {
        "id": "q13-1-8",
        "question": "Najważniejsza zasada lekcji „Wydajność wykonania testów” to:",
        "options": [
          "Wydajność jest hipotezą mierzoną w kontrolowanych warunkach",
          "Wystarczy subiektywne wrażenie",
          "Nie trzeba raportu",
          "Optymalizacja nie ma kosztów"
        ],
        "correctAnswer": 0,
        "explanation": "Profesjonalna optymalizacja wymaga pomiaru, interpretacji i kontroli ryzyka."
      }
    ],
    "references": [
      {
        "title": "Playwright Best Practices",
        "url": "https://playwright.dev/docs/best-practices",
        "description": "Praktyki wpływające również na szybkość i stabilność testów Playwright."
      },
      {
        "title": "Web.dev Performance",
        "url": "https://web.dev/performance/",
        "description": "Materiały o Core Web Vitals i optymalizacji doświadczenia użytkownika."
      },
      {
        "title": "Lighthouse CI",
        "url": "https://github.com/GoogleChrome/lighthouse-ci",
        "description": "Automatyzacja audytów Lighthouse i budżety wydajnościowe w CI."
      },
      {
        "title": "Prometheus Documentation",
        "url": "https://prometheus.io/docs/introduction/overview/",
        "description": "Monitoring metryk i alertowanie użyteczne w continuous performance."
      }
    ],
    "tipsAndTricks": [
      "Optymalizację zaczynaj od pomiaru; bez baseline nie wiesz, czy poprawa jest realna.",
      "Szybszy test bez diagnostyki może być gorszy niż wolniejszy test, który daje wiarygodny sygnał.",
      "Oddziel wydajność frameworka testowego od wydajności aplikacji — to dwa różne problemy.",
      "Budżety wydajnościowe powinny być powiązane z doświadczeniem użytkownika i ryzykiem biznesowym."
    ],
    "commonMistakes": [
      {
        "mistake": "Optymalizacja na ślepo",
        "solution": "Najpierw zmierz czas testów, p95, top slow tests, network i zasoby środowiska."
      },
      {
        "mistake": "Blokowanie zasobów potrzebnych do testowanego zachowania",
        "solution": "Blokuj tylko to, co jest nieistotne dla scenariusza, np. analytics albo reklamy."
      },
      {
        "mistake": "Porównywanie wyników z różnych środowisk bez kontekstu",
        "solution": "Zapisuj wersję aplikacji, środowisko, dane, hardware, przeglądarkę i profil sieci."
      },
      {
        "mistake": "Performance budget bez quality gate",
        "solution": "Dodaj progi do CI i raportuj regresje jako osobny typ defektu."
      }
    ]
  }
};
