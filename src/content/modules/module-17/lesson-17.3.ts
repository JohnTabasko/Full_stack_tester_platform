import type { Lesson } from "../../../renderer/types";
import theory17_3 from './lesson-17.3.md?raw';

export const lesson17_3: Lesson = {
  "id": "17.3",
  "moduleId": 17,
  "title": "Techniki projektowania testów",
  "description": "Klasy równoważności, wartości brzegowe, tablice decyzyjne, przejścia stanów, testowanie parami i projektowanie danych testowych.",
  "order": 3,
  "difficulty": "beginner",
  "tags": [
    "test-design",
    "equivalence-partitioning",
    "boundary-value-analysis",
    "decision-table",
    "state-transition",
    "pairwise"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz projektować przypadki testowe metodycznie, ograniczać liczbę testów bez utraty pokrycia ryzyk oraz dobierać technikę projektowania do charakteru funkcjonalności.",
    "theory": theory17_3,
    "codeExamples": [
      "// Przykład: generowanie przypadków dla wartości brzegowych.\nfunction boundaryValues(min: number, max: number): number[] {\n  return [min - 1, min, min + 1, max - 1, max, max + 1];\n}\n\nconst ageCases = boundaryValues(18, 99);\nconsole.log(ageCases); // [17, 18, 19, 98, 99, 100]\n",
      "// Przykład: tablica decyzyjna jako dane testowe.\ntype ShippingRuleCase = {\n  cartTotal: number;\n  premium: boolean;\n  freeShippingCode: boolean;\n  expectedFreeShipping: boolean;\n};\n\nconst cases: ShippingRuleCase[] = [\n  { cartTotal: 250, premium: false, freeShippingCode: false, expectedFreeShipping: true },\n  { cartTotal: 100, premium: true, freeShippingCode: false, expectedFreeShipping: true },\n  { cartTotal: 100, premium: false, freeShippingCode: true, expectedFreeShipping: true },\n  { cartTotal: 100, premium: false, freeShippingCode: false, expectedFreeShipping: false },\n];\n"
    ],
    "exercises": [
      {
        "id": "ex-17-3-1",
        "title": "Klasy równoważności",
        "description": "Wyznacz klasy równoważności dla pola hasła z wymaganiami: 12–64 znaki, wielka litera, cyfra, znak specjalny."
      },
      {
        "id": "ex-17-3-2",
        "title": "Wartości brzegowe",
        "description": "Zaprojektuj przypadki brzegowe dla paginacji przy parametrach page i pageSize."
      },
      {
        "id": "ex-17-3-3",
        "title": "Tablica decyzyjna",
        "description": "Utwórz tablicę decyzyjną dla rabatu zależnego od wartości koszyka, typu klienta i kodu promocyjnego."
      },
      {
        "id": "ex-17-3-4",
        "title": "Przejścia stanów",
        "description": "Narysuj stany zamówienia i wskaż co najmniej trzy przejścia niedozwolone."
      },
      {
        "id": "ex-17-3-5",
        "title": "Pairwise",
        "description": "Dla formularza z czterema polami po trzy wartości zaproponuj zredukowany zestaw przypadków pairwise."
      },
      {
        "id": "ex-17-3-6",
        "title": "Uzasadnienie wyboru",
        "description": "Wybierz technikę projektowania dla funkcji resetu hasła i uzasadnij decyzję."
      }
    ],
    "quiz": [
      {
        "id": "q17-3-1",
        "question": "Czym jest klasa równoważności?",
        "options": [
          "Zbiorem danych traktowanych przez system tak samo",
          "Listą wszystkich testów E2E",
          "Raportem z błędów",
          "Rodzajem mocka"
        ],
        "correctAnswer": 0,
        "explanation": "Klasa równoważności pozwala wybrać reprezentatywne dane zamiast testować każdą wartość."
      },
      {
        "id": "q17-3-2",
        "question": "Dlaczego testujemy wartości brzegowe?",
        "options": [
          "Bo zawsze są najłatwiejsze",
          "Bo błędy często pojawiają się na granicach zakresów",
          "Bo zastępują wszystkie inne testy",
          "Bo wymagają interfejs użytkownika"
        ],
        "correctAnswer": 1,
        "explanation": "Granice zakresów są miejscem częstych pomyłek implementacyjnych."
      },
      {
        "id": "q17-3-3",
        "question": "Kiedy warto użyć tablicy decyzyjnej?",
        "options": [
          "Gdy rezultat zależy od kombinacji kilku warunków",
          "Gdy mamy jeden prosty input",
          "Tylko dla testów wydajności",
          "Wyłącznie w SQL"
        ],
        "correctAnswer": 0,
        "explanation": "Tablice decyzyjne porządkują reguły zależne od wielu warunków."
      },
      {
        "id": "q17-3-4",
        "question": "Co jest istotą testowania przejść stanów?",
        "options": [
          "Sprawdzanie tylko stanu początkowego",
          "Weryfikacja dozwolonych i niedozwolonych przejść między stanami",
          "Pomiar czasu odpowiedzi",
          "Testowanie kolorów interfejs użytkownika"
        ],
        "correctAnswer": 1,
        "explanation": "Błędy często pojawiają się w nielegalnych przejściach, nie tylko w samych stanach."
      },
      {
        "id": "q17-3-5",
        "question": "Do czego służy testowanie parami?",
        "options": [
          "Do pełnego sprawdzenia wszystkich kombinacji",
          "Do redukcji kombinacji przy zachowaniu pokrycia par wartości",
          "Do testowania tylko dwóch użytkowników",
          "Do zastąpienia analizy ryzyka"
        ],
        "correctAnswer": 1,
        "explanation": "Pairwise ogranicza liczbę przypadków, zachowując pokrycie par parametrów."
      },
      {
        "id": "q17-3-6",
        "question": "Która technika najlepiej pasuje do pola wieku 18–99?",
        "options": [
          "Analiza wartości brzegowych",
          "Testy wizualne",
          "Monitoring produkcji",
          "Chaos engineering"
        ],
        "correctAnswer": 0,
        "explanation": "Zakres liczbowy jest klasycznym kandydatem do testów brzegowych."
      },
      {
        "id": "q17-3-7",
        "question": "Jaki jest częsty błąd przy projektowaniu testów?",
        "options": [
          "Uzasadnienie wyboru danych",
          "Losowy wybór przypadków bez odniesienia do ryzyka",
          "Użycie tablicy decyzyjnej",
          "Weryfikacja scenariuszy negatywnych"
        ],
        "correctAnswer": 1,
        "explanation": "Przypadki testowe powinny wynikać z techniki lub ryzyka, nie z przypadkowej intuicji."
      },
      {
        "id": "q17-3-8",
        "question": "Czy jedna technika projektowania wystarcza dla złożonej funkcji?",
        "options": [
          "Zawsze tak",
          "Zwykle nie; często łączy się kilka technik",
          "Tylko gdy testujemy API",
          "Nie wolno łączyć technik"
        ],
        "correctAnswer": 1,
        "explanation": "Złożone funkcje wymagają połączenia klas, granic, stanów i decyzji."
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
      "Jeśli nie potrafisz uzasadnić danych testowych, prawdopodobnie wybrałeś je przypadkowo.",
      "Dla każdej walidacji liczbowej automatycznie pytaj o wartości: min-1, min, min+1, max-1, max, max+1.",
      "Tablica decyzyjna jest świetnym narzędziem rozmowy z analitykiem lub product ownerem.",
      "Pairwise redukuje liczbę testów, ale nie zastępuje testów ryzyk krytycznych."
    ],
    "commonMistakes": [
      {
        "mistake": "Testowanie wielu podobnych wartości z tej samej klasy",
        "solution": "Wybierz reprezentanta klasy i skup się na granicach oraz klasach niepoprawnych."
      },
      {
        "mistake": "Brak scenariuszy niedozwolonych przejść",
        "solution": "Dla procesów stanowych testuj zarówno przejścia legalne, jak i odrzucane."
      },
      {
        "mistake": "Nadmierna kombinatoryka",
        "solution": "Użyj pairwise albo analizy ryzyka, aby ograniczyć liczbę przypadków."
      },
      {
        "mistake": "Projektowanie przypadków po implementacji bez rozmowy o wymaganiach",
        "solution": "Używaj technik projektowania już podczas refinementu."
      }
    ]
  }
};
