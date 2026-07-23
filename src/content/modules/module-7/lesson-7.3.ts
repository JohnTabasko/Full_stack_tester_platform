import type { Lesson } from '../../../renderer/types';
import theory7_3 from './lesson-7.3.md?raw';

export const lesson7_3: Lesson = {
  "id": "7.3",
  "moduleId": 7,
  "title": "Dynamiczne generowanie danych testowych",
  "description": "Dynamiczne dane testowe: runId, dane per test i per worker, seed, Faker, lokalizacja, prywatność i reprodukcja awarii.",
  "order": 3,
  "difficulty": "intermediate",
  "tags": [
    "test-data",
    "data-management",
    "fixtures",
    "builders"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz zaprojektować i utrzymywać dane testowe dla tematu „Dynamiczne generowanie danych testowych”, z uwzględnieniem izolacji, powtarzalności, prywatności i sprzątania danych.",
    "theory": theory7_3,
    "codeExamples": [
      "import { fakerPL as faker } from '@faker-js/faker';\n\nfaker.seed(123);\n\nconst user = {\n  email: faker.internet.email().toLowerCase(),\n  firstName: faker.person.firstName(),\n  lastName: faker.person.lastName(),\n  city: faker.location.city(),\n};\n",
      "function generateSku(prefix = 'QA') {\n  return `${prefix}-${Date.now()}-${faker.string.alphanumeric(6).toUpperCase()}`;\n}\n"
    ],
    "exercises": [
      {
        "id": "ex-7-3-1",
        "title": "Strategia danych",
        "description": "Dla tematu „Dynamiczne generowanie danych testowych” wybierz strategię danych i uzasadnij ją przez ryzyko, koszt i powtarzalność."
      },
      {
        "id": "ex-7-3-2",
        "title": "Builder lub factory",
        "description": "Zaprojektuj builder/factory dla użytkownika, produktu albo zamówienia."
      },
      {
        "id": "ex-7-3-3",
        "title": "Cleanup",
        "description": "Opisz, jak usuniesz lub odizolujesz dane po teście równoległym."
      },
      {
        "id": "ex-7-3-4",
        "title": "Scenariusz negatywny",
        "description": "Przygotuj dane niepoprawne lub brzegowe i sprawdź odpowiedni błąd systemu."
      },
      {
        "id": "ex-7-3-5",
        "title": "Prywatność",
        "description": "Wskaż, które dane są wrażliwe i jak je zastąpić danymi syntetycznymi."
      },
      {
        "id": "ex-7-3-6",
        "title": "Walidacja danych",
        "description": "Dodaj walidację schematu lub typu dla danych testowych używanych w scenariuszu."
      }
    ],
    "quiz": [
      {
        "id": "q7-3-1",
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
        "id": "q7-3-2",
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
        "id": "q7-3-3",
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
        "id": "q7-3-4",
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
        "id": "q7-3-5",
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
        "id": "q7-3-6",
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
        "id": "q7-3-7",
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
        "id": "q7-3-8",
        "question": "Najważniejsza zasada lekcji „Dynamiczne generowanie danych testowych” to:",
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
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Enterprise-grade design patterns (PageFactory, ApiFactory, BasePage), SOLID & DRY principles, and full stack scaling."
      },
      {
        "title": "Practical Playwright Test (Jean-François Greffier, 2026)",
        "url": "https://doi.org/10.1007/979-8-8688-2160-8",
        "description": "Deep dive into Playwright runner extension, custom expectations, dependent and automatic fixtures, and component testing."
      },
      {
        "title": "Hands-On Automated Testing with Playwright (Faraz K. Kelhini, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Comprehensive guide to browser mechanics, Chrome DevTools Protocol metrics, WCAG accessibility, visual testing, and mobile web."
      },
      {
        "title": "Playwright Parallelism",
        "url": "https://playwright.dev/docs/test-parallel",
        "description": "Worker index, parallel index i izolacja danych przy równoległości."
      },
      {
        "title": "Playwright Fixtures",
        "url": "https://playwright.dev/docs/test-fixtures",
        "description": "Dane per test/per worker jako fixtures."
      },
      {
        "title": "Faker",
        "url": "https://fakerjs.dev/",
        "description": "Generowanie realistycznych, syntetycznych danych testowych."
      }
    ],
    "tipsAndTricks": [
      "Zawsze opieraj architekturę testów na zasadach SOLID, unikając przedwczesnej abstrakcji zgodnie z zasadą WET (Write Everything Twice) z podręczników 2026.",
      
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
