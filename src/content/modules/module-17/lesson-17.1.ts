import type { Lesson } from "../../../renderer/types";
import theory17_1 from './lesson-17.1.md?raw';

export const lesson17_1: Lesson = {
  "id": "17.1",
  "moduleId": 17,
  "title": "Rola testera i strategia jakości",
  "description": "Jakość produktu, odpowiedzialności testera, shift-left, strategia testów, ryzyko, Definition of Done i rozmowa o jakości w zespole.",
  "order": 1,
  "difficulty": "beginner",
  "tags": [
    "qa",
    "quality",
    "strategy",
    "shift-left",
    "risk-based-testing",
    "definition-of-done"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji rozumiesz rolę testera jako inżyniera informacji o jakości, potrafisz zaprojektować zarys strategii testów dla funkcjonalności oraz wiesz, jak rozmawiać z zespołem o ryzyku, kosztach i kryteriach gotowości.",
    "theory": theory17_1,
    "codeExamples": [
      "// Przykład: zamiana ryzyk na decyzje testowe.\ntype TestLevel = 'unit' | 'integration' | 'api' | 'contract' | 'e2e' | 'exploratory' | 'monitoring';\n\ntype Risk = {\n  name: string;\n  impact: 1 | 2 | 3 | 4 | 5;\n  likelihood: 1 | 2 | 3 | 4 | 5;\n  suggestedControls: TestLevel[];\n};\n\nconst invoiceExportRisks: Risk[] = [\n  {\n    name: 'Użytkownik pobiera fakturę innego klienta',\n    impact: 5,\n    likelihood: 3,\n    suggestedControls: ['api', 'e2e', 'monitoring'],\n  },\n  {\n    name: 'Błędne sumy podatku VAT w pliku PDF',\n    impact: 4,\n    likelihood: 2,\n    suggestedControls: ['unit', 'integration'],\n  },\n];\n\nconst priorytet = (risk: Risk) => risk.impact * risk.likelihood;\nconsole.table(invoiceExportRisks.sort((a, b) => priorytet(b) - priorytet(a)));\n",
      "# Przykładowy fragment strategii testów\n\n## Cel\nZapewnić zaufanie do krytycznych przepływów sprzedażowych bez nadmiernego wydłużania pipeline'u.\n\n## Zakres kontroli przed mergem\n- testy jednostkowe logiki cen i rabatów,\n- testy kontraktowe API koszyka,\n- testy integracyjne płatności na sandboxie,\n- smoke E2E dla ścieżki zakupu.\n\n## Zakres kontroli po mergu\n- pełna regresja E2E,\n- testy wydajnościowe endpointów koszyka,\n- analiza alertów i metryk błędów płatności.\n\n## Kryteria jakości\n- brak znanych defektów krytycznych,\n- p95 koszyka poniżej 300 ms,\n- pełna obserwowalność przepływu przez correlation ID.\n"
    ],
    "exercises": [
      {
        "id": "ex-17-1-1",
        "title": "Mapa ryzyk funkcjonalności",
        "description": "Wybierz funkcję z dowolnego produktu, opisz pięć ryzyk i przypisz do nich poziomy testów. Uzasadnij, dlaczego nie każde ryzyko wymaga E2E."
      },
      {
        "id": "ex-17-1-2",
        "title": "Mini strategia testów",
        "description": "Napisz jednostronicową strategię testów dla funkcji eksportu danych. Uwzględnij zakres przed mergem, po mergu i po wdrożeniu."
      },
      {
        "id": "ex-17-1-3",
        "title": "Definition of Done",
        "description": "Zaproponuj Definition of Done dla funkcjonalności płatności cyklicznych. Dodaj wymagania dotyczące testów, logów, metryk i dokumentacji."
      },
      {
        "id": "ex-17-1-4",
        "title": "Shift-left w praktyce",
        "description": "Przeanalizuj historyczny błąd z projektu lub przykładu. Opisz, na jakim wcześniejszym etapie można było go wykryć."
      },
      {
        "id": "ex-17-1-5",
        "title": "Decyzja o nieautomatyzowaniu",
        "description": "Wskaż trzy przypadki, których nie warto automatyzować. Wyjaśnij, jaką inną technikę kontroli jakości wybierzesz."
      },
      {
        "id": "ex-17-1-6",
        "title": "Rozmowa z zespołem",
        "description": "Przygotuj pięć pytań, które tester powinien zadać podczas refinementu nowej funkcjonalności."
      }
    ],
    "quiz": [
      {
        "id": "q17-1-1",
        "question": "Które zdanie najlepiej opisuje rolę testera w dojrzałym zespole?",
        "options": [
          "Tester jest ostatnią bramką przed wdrożeniem",
          "Tester dostarcza informacji o ryzyku i jakości, wspierając decyzje zespołu",
          "Tester odpowiada samodzielnie za całą jakość produktu",
          "Tester powinien automatyzować każdy przypadek testowy"
        ],
        "correctAnswer": 1,
        "explanation": "Tester nie jest samotnym właścicielem jakości, lecz specjalistą od informacji o ryzyku, jakości i konsekwencjach zmian."
      },
      {
        "id": "q17-1-2",
        "question": "Czym jest strategia testów?",
        "options": [
          "Listą wszystkich możliwych testów",
          "Mapą decyzji o tym, co, dlaczego i jak sprawdzamy",
          "Raportem z wykonania regresji",
          "Zbiorem selektorów do automatyzacji"
        ],
        "correctAnswer": 1,
        "explanation": "Strategia testów porządkuje ryzyka, poziomy testów, zakres automatyzacji i odpowiedzialności."
      },
      {
        "id": "q17-1-3",
        "question": "Co oznacza shift-left?",
        "options": [
          "Przeniesienie testów wyłącznie na produkcję",
          "Włączanie rozmowy o jakości jak najwcześniej w proces",
          "Uruchamianie testów tylko lokalnie",
          "Redukcję liczby testów jednostkowych"
        ],
        "correctAnswer": 1,
        "explanation": "Shift-left polega na wykrywaniu problemów już podczas analizy wymagań, projektowania i implementacji."
      },
      {
        "id": "q17-1-4",
        "question": "Dlaczego liczba testów nie jest dobrą samodzielną miarą jakości?",
        "options": [
          "Bo testy automatyczne są zawsze bezużyteczne",
          "Bo liczy się informacja o ryzyku, a nie sama liczba skryptów",
          "Bo powinno się mieć tylko testy manualne",
          "Bo testy E2E zawsze wystarczą"
        ],
        "correctAnswer": 1,
        "explanation": "Wartość testów zależy od tego, jakie ryzyko pokrywają, jak szybko działają i jaką informację diagnostyczną dostarczają."
      },
      {
        "id": "q17-1-5",
        "question": "Co powinno znaleźć się w dobrej Definition of Done?",
        "options": [
          "Wyłącznie informacja, że kod został napisany",
          "Kryteria jakości, testów, dokumentacji i obserwowalności odpowiednie do ryzyka",
          "Tylko akceptacja testera",
          "Lista wszystkich możliwych edge case’ów"
        ],
        "correctAnswer": 1,
        "explanation": "Definition of Done jest zespołową umową o minimalnym standardzie ukończenia pracy."
      },
      {
        "id": "q17-1-6",
        "question": "Kiedy warto zastosować shift-right?",
        "options": [
          "Gdy chcemy uczyć się z zachowania systemu po wdrożeniu",
          "Gdy nie chcemy pisać testów",
          "Gdy ignorujemy monitoring",
          "Wyłącznie w projektach bez CI"
        ],
        "correctAnswer": 0,
        "explanation": "Shift-right wykorzystuje obserwowalność, monitoring i dane produkcyjne do dalszego uczenia się o jakości."
      },
      {
        "id": "q17-1-7",
        "question": "Który przykład najlepiej pokazuje myślenie o ryzyku?",
        "options": [
          "Dodajemy test, bo łatwo go napisać",
          "Sprawdzamy autoryzację eksportu faktur, bo wyciek danych miałby wysoki koszt",
          "Automatyzujemy każdy formularz identycznie",
          "Usuwamy testy negatywne, bo spowalniają pipeline"
        ],
        "correctAnswer": 1,
        "explanation": "Ryzyko łączy prawdopodobieństwo z wpływem awarii. Wyciek danych jest zwykle ryzykiem wysokiego wpływu."
      },
      {
        "id": "q17-1-8",
        "question": "Jaka jest najważniejsza cecha dobrej strategii jakości?",
        "options": [
          "Jest długa i szczegółowa",
          "Jest aktualna, zrozumiała i powiązana z ryzykiem",
          "Zawiera wyłącznie testy E2E",
          "Nie wymaga rozmów z zespołem"
        ],
        "correctAnswer": 1,
        "explanation": "Strategia ma pomagać w decyzjach, dlatego musi być czytelna, aktualna i praktyczna."
      }
    ],
    "references": [
      {
        "title": "ISTQB Glossary",
        "url": "https://glossary.istqb.org/",
        "description": "Słownik pojęć testowych przydatny do ujednolicania terminologii w zespole."
      },
      {
        "title": "Agile Testing Quadrants",
        "url": "https://lisacrispin.com/agile-testing-quadrants/",
        "description": "Klasyczny model rozmowy o różnych rodzajach testów w zespołach zwinnych."
      },
      {
        "title": "Google Testing Blog",
        "url": "https://testing.googleblog.com/",
        "description": "Praktyczne artykuły o strategii testów, utrzymywalności i kosztach jakości."
      }
    ],
    "tipsAndTricks": [
      "Zawsze pytaj: jaki koszt poniesiemy, jeśli ten obszar zawiedzie na produkcji?",
      "Krótka strategia testów, którą zespół naprawdę czyta, jest cenniejsza niż rozbudowany dokument utrzymywany dla formalności.",
      "Nie zaczynaj od narzędzia. Narzędzie jest odpowiedzią dopiero wtedy, gdy znasz pytanie.",
      "Definition of Done warto aktualizować po incydentach — każdy poważny błąd powinien uczyć zespół nowego kryterium jakości."
    ],
    "commonMistakes": [
      {
        "mistake": "Mierzenie jakości liczbą testów",
        "solution": "Mierz pokrycie ryzyk, stabilność pipeline’u, czas diagnozy i jakość informacji zwrotnej."
      },
      {
        "mistake": "Traktowanie QA jako ostatniej bramki",
        "solution": "Włącz testera w refinement, projektowanie kontraktów, analizę danych i code review."
      },
      {
        "mistake": "Automatyzowanie bez strategii",
        "solution": "Najpierw ustal ryzyka, poziomy testów i kryteria sukcesu; dopiero potem pisz skrypty."
      },
      {
        "mistake": "Brak obserwowalności",
        "solution": "Dodaj trace, logi, correlation ID i metryki dla krytycznych przepływów."
      }
    ]
  }
};
