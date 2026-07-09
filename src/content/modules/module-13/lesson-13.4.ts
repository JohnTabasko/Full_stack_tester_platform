import type { Lesson } from "../../../renderer/types";
import theory13_4 from './lesson-13.4.md?raw';

export const lesson13_4: Lesson = {
  "id": "13.4",
  "moduleId": 13,
  "title": "Testy na rzeczywistych urządzeniach i testy mobilne",
  "description": "BrowserStack, Sauce Labs, testy na prawdziwych urządzeniach, emulacja urządzeń, viewport, throttling, locale/timezone/geolocation.",
  "order": 4,
  "difficulty": "advanced",
  "tags": [
    "performance",
    "optimization",
    "playwright",
    "metrics"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz mierzyć i optymalizować obszar „Testy na rzeczywistych urządzeniach i testy mobilne” z użyciem baseline, metryk, budżetów wydajnościowych i świadomej analizy kompromisów.",
    "theory": theory13_4,
    "codeExamples": [
      "import { devices } from '@playwright/test';\n\nexport default defineConfig({\n  projects: [\n    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },\n    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },\n  ],\n});\n",
      "await context.setOffline(true);\nawait page.goto('/catalog');\nawait expect(page.getByText(/brak połączenia/i)).toBeVisible();\n"
    ],
    "exercises": [
      {
        "id": "ex-13-4-1",
        "title": "Baseline",
        "description": "Dla tematu „Testy na rzeczywistych urządzeniach i testy mobilne” zaprojektuj pomiar bazowy i wskaż, jakie dane zapiszesz w raporcie."
      },
      {
        "id": "ex-13-4-2",
        "title": "Top bottlenecks",
        "description": "Wskaż trzy potencjalne wąskie gardła i metryki, które je potwierdzą albo obalą."
      },
      {
        "id": "ex-13-4-3",
        "title": "Performance budget",
        "description": "Zdefiniuj progi p95, error rate, czas suite albo Core Web Vitals dla wybranego scenariusza."
      },
      {
        "id": "ex-13-4-4",
        "title": "Eksperyment optymalizacyjny",
        "description": "Zaproponuj jedną zmianę, sposób pomiaru przed/po i kryterium sukcesu."
      },
      {
        "id": "ex-13-4-5",
        "title": "Raport",
        "description": "Przygotuj strukturę raportu: cel, środowisko, wyniki, porównanie z baseline i rekomendacje."
      },
      {
        "id": "ex-13-4-6",
        "title": "Ryzyka uboczne",
        "description": "Opisz, jakie ryzyko może wprowadzić dana optymalizacja i jak je przetestować."
      }
    ],
    "quiz": [
      {
        "id": "q13-4-1",
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
        "id": "q13-4-2",
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
        "id": "q13-4-3",
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
        "id": "q13-4-4",
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
        "id": "q13-4-5",
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
        "id": "q13-4-6",
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
        "id": "q13-4-7",
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
        "id": "q13-4-8",
        "question": "Najważniejsza zasada lekcji „Testy na rzeczywistych urządzeniach i testy mobilne” to:",
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
