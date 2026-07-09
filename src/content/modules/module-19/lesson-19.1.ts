import type { Lesson } from "../../../renderer/types";
import theory19_1 from './lesson-19.1.md?raw';

export const lesson19_1: Lesson = {
  "id": "19.1",
  "moduleId": 19,
  "title": "Podstawy Vitest i Jest",
  "description": "Vitest i Jest: struktura testów jednostkowych, matchery, setup/teardown, testy parametryzowane, coverage, fake timers i wybór narzędzia.",
  "order": 1,
  "difficulty": "intermediate",
  "tags": [
    "vitest",
    "jest",
    "unit-testing",
    "matchers",
    "pokrycie kodu",
    "test-pyramid"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz zaprojektować testy jednostkowe dla logiki domenowej, używać matcherów i setupu testowego, interpretować pokrycie kodu oraz odróżnić wartościowy test unit od testu kruchego i nadmiernie związanego z implementacją.",
    "theory": theory19_1,
    "codeExamples": [
      "import { describe, expect, it } from 'vitest';\n\ntype CustomerType = 'regular' | 'premium';\n\nexport function calculateDiscount(total: number, customer: CustomerType, promoCode?: string): number {\n  const baseRate = customer === 'premium' ? 0.1 : 0;\n  const promoRate = promoCode === 'PROMO15' ? 0.15 : baseRate;\n  return Math.min(total * promoRate, 200);\n}\n\ndescribe('calculateDiscount', () => {\n  it.each([\n    { total: 100, customer: 'regular' as const, promoCode: undefined, expected: 0 },\n    { total: 100, customer: 'premium' as const, promoCode: undefined, expected: 10 },\n    { total: 1000, customer: 'premium' as const, promoCode: 'PROMO15', expected: 150 },\n    { total: 3000, customer: 'premium' as const, promoCode: 'PROMO15', expected: 200 },\n  ])('returns $expected for %#', ({ total, customer, promoCode, expected }) => {\n    expect(calculateDiscount(total, customer, promoCode)).toBe(expected);\n  });\n});",
      "// Przykład asercji częściowej dla dużego obiektu.\nexpect(order).toMatchObject({\n  status: 'paid',\n  customer: {\n    type: 'premium',\n  },\n});\n\n// Test nie wiąże się z polami nieistotnymi dla scenariusza,\n// np. identyfikatorem technicznym albo datą aktualizacji.\n"
    ],
    "exercises": [
      {
        "id": "ex-19-1-1",
        "title": "Reguła rabatu",
        "description": "Napisz testy tabelaryczne dla funkcji naliczającej rabat z limitem maksymalnym."
      },
      {
        "id": "ex-19-1-2",
        "title": "Dobór matcherów",
        "description": "Dla pięciu asercji wybierz właściwy matcher i uzasadnij decyzję."
      },
      {
        "id": "ex-19-1-3",
        "title": "Granice i klasy",
        "description": "Zaprojektuj testy jednostkowe dla walidacji wieku 18–99."
      },
      {
        "id": "ex-19-1-4",
        "title": "Coverage review",
        "description": "Przeanalizuj raport pokrycie kodu i wskaż miejsca, gdzie brakuje sensownych asercji."
      },
      {
        "id": "ex-19-1-5",
        "title": "Refaktor testu",
        "description": "Przepisz długi test z wieloma przypadkami na test tabelaryczny."
      },
      {
        "id": "ex-19-1-6",
        "title": "Unit czy E2E",
        "description": "Wskaż, które elementy procesu checkout powinny być testowane jednostkowo, a które E2E."
      }
    ],
    "quiz": [
      {
        "id": "q19-1-1",
        "question": "Co jest główną zaletą testów jednostkowych?",
        "options": [
          "Realizm pełnego systemu",
          "Szybkość i precyzyjna diagnoza logiki",
          "Brak potrzeby asercji",
          "Zastąpienie wszystkich innych testów"
        ],
        "correctAnswer": 1,
        "explanation": "Testy unit szybko wskazują problem w małej jednostce zachowania."
      },
      {
        "id": "q19-1-2",
        "question": "Co oznacza struktura Arrange–Act–Assert?",
        "options": [
          "Przygotowanie, wykonanie i sprawdzenie",
          "Instalację, deploy i monitoring",
          "Trzy typy commitów",
          "Rodzaj pokrycie kodu"
        ],
        "correctAnswer": 0,
        "explanation": "AAA porządkuje narrację testu."
      },
      {
        "id": "q19-1-3",
        "question": "Dlaczego 100% pokrycie kodu nie gwarantuje jakości?",
        "options": [
          "Bo pokrycie kodu nie mówi, czy asercje sprawdzają sensowne zachowanie",
          "Bo pokrycie kodu zawsze jest błędny",
          "Bo działa tylko w E2E",
          "Bo usuwa testy"
        ],
        "correctAnswer": 0,
        "explanation": "Kod może być wykonany bez wartościowej weryfikacji."
      },
      {
        "id": "q19-1-4",
        "question": "Kiedy użyć testów tabelarycznych?",
        "options": [
          "Gdy ta sama reguła ma wiele wariantów danych",
          "Tylko przy screenshotach",
          "Nigdy w TypeScript",
          "Wyłącznie w testach manualnych"
        ],
        "correctAnswer": 0,
        "explanation": "Testy tabelaryczne redukują duplikację i ujawniają przypadki."
      },
      {
        "id": "q19-1-5",
        "question": "Który element checkoutu najlepiej testować jednostkowo?",
        "options": [
          "Obliczanie rabatu",
          "Pełną płatność przez interfejs użytkownika",
          "Logowanie przez przeglądarkę",
          "Renderowanie całego portalu"
        ],
        "correctAnswer": 0,
        "explanation": "Reguła obliczeniowa jest deterministyczna i tania do sprawdzenia nisko."
      },
      {
        "id": "q19-1-6",
        "question": "Jaki jest częsty antywzorzec testu unit?",
        "options": [
          "Testowanie prywatnych szczegółów implementacji zamiast zachowania",
          "Użycie danych brzegowych",
          "Czytelna nazwa testu",
          "Asercja wyniku"
        ],
        "correctAnswer": 0,
        "explanation": "Test związany z implementacją utrudnia refaktor bez zmiany zachowania."
      },
      {
        "id": "q19-1-7",
        "question": "Do czego służy toMatchObject?",
        "options": [
          "Do sprawdzenia istotnego fragmentu obiektu",
          "Do kliknięcia przycisku",
          "Do instalacji zależności",
          "Do uruchomienia CI"
        ],
        "correctAnswer": 0,
        "explanation": "Matcher pozwala uniknąć wiązania testu z nieistotnymi polami."
      },
      {
        "id": "q19-1-8",
        "question": "Co powinien komunikować dobry test jednostkowy?",
        "options": [
          "Konkretną regułę i oczekiwany rezultat",
          "Nazwę IDE autora",
          "Kolor tła aplikacji",
          "Losową wartość"
        ],
        "correctAnswer": 0,
        "explanation": "Nazwa i asercje powinny opisywać zachowanie domenowe."
      }
    ],
    "references": [
      {
        "title": "Vitest Guide",
        "url": "https://vitest.dev/guide/",
        "description": "Oficjalny przewodnik Vitest."
      },
      {
        "title": "Jest Getting Started",
        "url": "https://jestjs.io/docs/getting-started",
        "description": "Oficjalny start z Jest."
      },
      {
        "title": "Jest Matchers",
        "url": "https://jestjs.io/docs/using-matchers",
        "description": "Matchery expect w Jest."
      }
    ],
    "tipsAndTricks": [
      "Test jednostkowy powinien padać z powodu jednej reguły, nie całego systemu.",
      "Jeżeli test unit wymaga bazy i przeglądarki, prawdopodobnie nie jest unit.",
      "Coverage traktuj jako mapę pytań, nie jako medal jakości.",
      "Testy tabelaryczne świetnie łączą się z technikami projektowania przypadków."
    ],
    "commonMistakes": [
      {
        "mistake": "Testowanie implementacji",
        "solution": "Sprawdzaj rezultat widoczny w API funkcji, nie prywatne kroki."
      },
      {
        "mistake": "Brak przypadków brzegowych",
        "solution": "Dodaj dane wynikające z klas równoważności i wartości brzegowych."
      },
      {
        "mistake": "Ślepa pogoń za pokrycie kodu",
        "solution": "Oceniaj jakość asercji i pokrycie ryzyka."
      },
      {
        "mistake": "Duplikacja testów",
        "solution": "Użyj testów tabelarycznych lub helperów danych."
      }
    ]
  }
};
