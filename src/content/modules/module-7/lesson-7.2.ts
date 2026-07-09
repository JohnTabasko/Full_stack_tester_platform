import type { Lesson } from '../../../renderer/types';
import theory7_2 from './lesson-7.2.md?raw';

export const lesson7_2: Lesson = {
  "id": "7.2",
  "moduleId": 7,
  "title": "Budowniczowie danych i fabryki",
  "description": "Budowniczowie danych, factory, warianty domenowe, unikalność, zgodność z kontraktem API i review danych testowych.",
  "order": 2,
  "difficulty": "intermediate",
  "tags": [
    "test-data",
    "data-management",
    "fixtures",
    "builders"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz zaprojektować i utrzymywać dane testowe dla tematu „Budowniczowie danych i fabryki”, z uwzględnieniem izolacji, powtarzalności, prywatności i sprzątania danych.",
    "theory": theory7_2,
    "codeExamples": [
      "type User = { email: string; role: 'admin' | 'customer'; active: boolean };\n\nclass UserBuilder {\n  private user: User = { email: `qa-${Date.now()}@example.test`, role: 'customer', active: true };\n  asAdmin() { this.user.role = 'admin'; return this; }\n  inactive() { this.user.active = false; return this; }\n  withEmail(email: string) { this.user.email = email; return this; }\n  build(): User { return { ...this.user }; }\n}\n",
      "const Users = {\n  admin: () => new UserBuilder().asAdmin().build(),\n  inactiveCustomer: () => new UserBuilder().inactive().build(),\n};\n"
    ],
    "exercises": [
      {
        "id": "ex-7-2-1",
        "title": "Strategia danych",
        "description": "Dla tematu „Budowniczowie danych i fabryki” wybierz strategię danych i uzasadnij ją przez ryzyko, koszt i powtarzalność."
      },
      {
        "id": "ex-7-2-2",
        "title": "Builder lub factory",
        "description": "Zaprojektuj builder/factory dla użytkownika, produktu albo zamówienia."
      },
      {
        "id": "ex-7-2-3",
        "title": "Cleanup",
        "description": "Opisz, jak usuniesz lub odizolujesz dane po teście równoległym."
      },
      {
        "id": "ex-7-2-4",
        "title": "Scenariusz negatywny",
        "description": "Przygotuj dane niepoprawne lub brzegowe i sprawdź odpowiedni błąd systemu."
      },
      {
        "id": "ex-7-2-5",
        "title": "Prywatność",
        "description": "Wskaż, które dane są wrażliwe i jak je zastąpić danymi syntetycznymi."
      },
      {
        "id": "ex-7-2-6",
        "title": "Walidacja danych",
        "description": "Dodaj walidację schematu lub typu dla danych testowych używanych w scenariuszu."
      }
    ],
    "quiz": [
      {
        "id": "q7-2-1",
        "question": "Jaka cecha danych testowych jest najważniejsza w CI?",
        "options": [
          "Powtarzalność i izolacja",
          "Losowość bez kontroli",
          "Wspólne konto dla wszystkich",
          "Brak sprzątania danych"
        ],
        "correctAnswer": 0,
        "explanation": "CI uruchamia testy równolegle i często; dane muszą być deterministyczne oraz niezależne."
      },
      {
        "id": "q7-2-2",
        "question": "Po co używać run_id?",
        "options": [
          "Aby powiązać dane z konkretnym przebiegiem testów",
          "Aby ukryć dane",
          "Aby zastąpić asercje",
          "Aby zwiększyć flakiness"
        ],
        "correctAnswer": 0,
        "explanation": "run_id ułatwia filtrowanie, diagnostykę i sprzątanie danych danych."
      },
      {
        "id": "q7-2-3",
        "question": "Kiedy builder jest lepszy niż hard-coded object?",
        "options": [
          "Gdy obiekt ma wiele pól, a test chce nadpisać tylko istotne",
          "Nigdy",
          "Tylko w CSS",
          "Gdy nie potrzebujemy typów"
        ],
        "correctAnswer": 0,
        "explanation": "Builder tworzy kompletne, czytelne dane z lokalnymi nadpisaniami."
      },
      {
        "id": "q7-2-4",
        "question": "Co oznacza seed w generatorze danych?",
        "options": [
          "Ustawienie powtarzalnego źródła losowości",
          "Usunięcie danych",
          "Szyfrowanie hasła",
          "Uruchomienie przeglądarki"
        ],
        "correctAnswer": 0,
        "explanation": "Seed pozwala odtworzyć te same dane w kolejnym przebiegu."
      },
      {
        "id": "q7-2-5",
        "question": "Dlaczego dane produkcyjne są ryzykowne w testach?",
        "options": [
          "Mogą zawierać dane osobowe, sekrety i niekontrolowany stan",
          "Zawsze są zbyt małe",
          "Nie da się ich czytać",
          "Zastępują testy"
        ],
        "correctAnswer": 0,
        "explanation": "Dane produkcyjne wymagają anonimizacji i kontroli prawnej oraz technicznej."
      },
      {
        "id": "q7-2-6",
        "question": "Co jest dobrą strategią sprzątania danych?",
        "options": [
          "Usuwanie zasobów po ID zebranych w teście lub rollback transakcji",
          "DELETE bez WHERE",
          "Ręczne czyszczenie raz w miesiącu",
          "Brak sprzątania"
        ],
        "correctAnswer": 0,
        "explanation": "Cleanup musi być precyzyjny i bezpieczny dla innych testów."
      },
      {
        "id": "q7-2-7",
        "question": "Po co walidować dane testowe schematem?",
        "options": [
          "Aby wykrywać błędy w fixture zanim dotrą do testu",
          "Aby spowolnić pipeline",
          "Aby ukryć wartości",
          "Aby zastąpić API"
        ],
        "correctAnswer": 0,
        "explanation": "Walidacja danych wejściowych skraca diagnozę błędów testowych."
      },
      {
        "id": "q7-2-8",
        "question": "Najważniejsza zasada lekcji „Budowniczowie danych i fabryki” to:",
        "options": [
          "Dane są częścią architektury testu i muszą być projektowane świadomie",
          "Dane można traktować przypadkowo",
          "Cleanup jest opcjonalny",
          "Produkcja to najlepszy seed"
        ],
        "correctAnswer": 0,
        "explanation": "Test jest wiarygodny tylko wtedy, gdy kontroluje swoje dane."
      }
    ],
    "references": [
      {
        "title": "Playwright Fixtures",
        "url": "https://playwright.dev/docs/test-fixtures",
        "description": "Fixtures jako miejsce setupu i teardownu danych testowych."
      },
      {
        "title": "API testing",
        "url": "https://playwright.dev/docs/api-testing",
        "description": "Tworzenie stanu przez API i weryfikacja odpowiedzi."
      },
      {
        "title": "Test Data Builder",
        "url": "https://martinfowler.com/bliki/TestDataBuilder.html",
        "description": "Klasyczny opis wzorca Test Data Builder."
      }
    ],
    "tipsAndTricks": [
      "Dane testowe powinny być jawne, izolowane i możliwe do posprzątania po przebiegu.",
      "Nie używaj danych produkcyjnych, jeśli nie są zanonimizowane i zgodne z polityką organizacji.",
      "Buildery i factory mają zwiększać czytelność scenariusza, a nie ukrywać ryzyko testowe.",
      "Każdy test tworzący dane powinien mieć strategię sprzątania danych albo działać w izolowanym środowisku."
    ],
    "commonMistakes": [
      {
        "mistake": "Współdzielone konto testowe dla wielu równoległych testów",
        "solution": "Używaj unikalnych użytkowników, tenantów, run_id albo izolowanych storageState."
      },
      {
        "mistake": "Losowe dane bez seed i bez zapisu kontekstu",
        "solution": "Ustawiaj seed lub zapisuj wygenerowane dane w raporcie testu."
      },
      {
        "mistake": "Brak sprzątania danych danych tworzonych przez API",
        "solution": "Zbieraj identyfikatory utworzonych zasobów i usuwaj je w afterEach albo fixture."
      },
      {
        "mistake": "Dane testowe zaszyte w wielu testach",
        "solution": "Wydziel buildery, factory i scenariusze danych, aby zmiany były lokalne."
      }
    ]
  }
};
