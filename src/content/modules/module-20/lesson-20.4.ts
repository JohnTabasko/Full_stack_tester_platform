import type { Lesson } from "../../../renderer/types";
import theory20_4 from './lesson-20.4.md?raw';

export const lesson20_4: Lesson = {
  "id": "20.4",
  "moduleId": 20,
  "title": "Migracje, seedowanie i sprzątanie danych",
  "description": "Strategie migracji schematu, seed danych, rollback, fikstury bazy danych, czyszczenie środowiska i testowanie zmian struktury bazy.",
  "order": 4,
  "difficulty": "intermediate",
  "tags": [
    "migrations",
    "seed",
    "sprzątanie danych",
    "fixtures",
    "rollback",
    "test-data"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz zaplanować bezpieczne migracje bazy, przygotować deterministyczne seedowanie i sprzątanie danych testowych oraz włączyć kontrolę migracji do pipeline’u jakości.",
    "theory": theory20_4,
    "codeExamples": [
      "-- Cleanup danych konkretnego przebiegu testów.\nDELETE FROM audit_events WHERE correlation_id = :run_id;\nDELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE external_id = :run_id);\nDELETE FROM orders WHERE external_id = :run_id;\n",
      "-- Migracja wieloetapowa, przykład koncepcyjny.\n-- 1. Dodaj kolumnę nullable.\nALTER TABLE orders ADD COLUMN tenant_id Uinterfejs użytkownikaD;\n\n-- 2. Uzupełnij dane historyczne.\nUPDATE orders SET tenant_id = customers.tenant_id\nFROM customers\nWHERE customers.id = orders.customer_id;\n\n-- 3. Dopiero po weryfikacji wymuś NOT NULL i indeks.\nALTER TABLE orders ALTER COLUMN tenant_id SET NOT NULL;\nCREATE INDEX idx_orders_tenant_external ON orders (tenant_id, external_id);\n"
    ],
    "exercises": [
      {
        "id": "ex-20-4-1",
        "title": "Plan migracji",
        "description": "Zaprojektuj migrację dodającą tenant_id do istniejącej tabeli orders."
      },
      {
        "id": "ex-20-4-2",
        "title": "Seed minimalny",
        "description": "Przygotuj minimalny zestaw danych startowych dla testów koszyka."
      },
      {
        "id": "ex-20-4-3",
        "title": "Cleanup po run_id",
        "description": "Napisz zapytania usuwające dane testowe powiązane z jednym run_id."
      },
      {
        "id": "ex-20-4-4",
        "title": "Test rollbacku",
        "description": "Opisz, jak sprawdzisz plan awaryjny dla migracji usuwającej kolumnę."
      },
      {
        "id": "ex-20-4-5",
        "title": "Dane produkcyjnie podobne",
        "description": "Wskaż, jakie dane są potrzebne do testu migracji dużej tabeli zamówień."
      },
      {
        "id": "ex-20-4-6",
        "title": "Review migracji",
        "description": "Przygotuj checklistę review dla migracji bazy danych."
      }
    ],
    "quiz": [
      {
        "id": "q20-4-1",
        "question": "Dlaczego migracje są kodem?",
        "options": [
          "Zmieniają zachowanie systemu i muszą być wersjonowane oraz reviewowane",
          "Bo są napisane w HTML",
          "Bo nie wpływają na dane",
          "Bo służą tylko testerom"
        ],
        "correctAnswer": 0,
        "explanation": "Migracja może zepsuć produkcję tak samo jak błąd aplikacji."
      },
      {
        "id": "q20-4-2",
        "question": "Jaki powinien być dobry seed testowy?",
        "options": [
          "Minimalny i deterministyczny",
          "Ogromny i nieopisany",
          "Losowy bez kontroli",
          "Taki sam jak produkcja z danymi osobowymi"
        ],
        "correctAnswer": 0,
        "explanation": "Seed powinien wspierać testy, nie tworzyć ukryte zależności."
      },
      {
        "id": "q20-4-3",
        "question": "Jak bezpiecznie sprzątać dane w środowisku współdzielonym?",
        "options": [
          "Po run_id lub innym jednoznacznym filtrze",
          "DELETE FROM users bez WHERE",
          "Ręcznie raz w miesiącu",
          "Nie sprzątać"
        ],
        "correctAnswer": 0,
        "explanation": "Cleanup musi usuwać wyłącznie dane danego testu."
      },
      {
        "id": "q20-4-4",
        "question": "Co testować przy migracji istniejących danych?",
        "options": [
          "Pustą bazę i bazę z realistycznymi danymi",
          "Tylko nowy interfejs użytkownika",
          "Wyłącznie lint",
          "Nic"
        ],
        "correctAnswer": 0,
        "explanation": "Migracja często działa na pustej bazie, a pada na danych historycznych."
      },
      {
        "id": "q20-4-5",
        "question": "Kiedy migracja powinna być wieloetapowa?",
        "options": [
          "Gdy zmiana może złamać kompatybilność lub dotyczy dużych danych",
          "Zawsze dla literówki",
          "Nigdy",
          "Tylko w CSS"
        ],
        "correctAnswer": 0,
        "explanation": "Wieloetapowość zmniejsza ryzyko wdrożenia."
      },
      {
        "id": "q20-4-6",
        "question": "Co jest antywzorcem sprzątanie danychu?",
        "options": [
          "Szeroki DELETE bez filtra",
          "Usuwanie po run_id",
          "Rollback transakcji",
          "Kontener efemeryczny"
        ],
        "correctAnswer": 0,
        "explanation": "DELETE bez filtra może zniszczyć cudze dane."
      },
      {
        "id": "q20-4-7",
        "question": "Dlaczego testować czas migracji?",
        "options": [
          "Duże tabele mogą blokować wdrożenie lub aplikację",
          "Bo każdy test musi mierzyć czas interfejs użytkownika",
          "To nie ma znaczenia",
          "Tylko dla aplikacji mobilnych"
        ],
        "correctAnswer": 0,
        "explanation": "Długa migracja może być ryzykiem operacyjnym."
      },
      {
        "id": "q20-4-8",
        "question": "Co powinno znaleźć się w review migracji?",
        "options": [
          "Rollback, wpływ na dane, indeksy, constraints i kompatybilność",
          "Tylko nazwa pliku",
          "Kolor terminala",
          "Lista testerów"
        ],
        "correctAnswer": 0,
        "explanation": "Review migracji musi uwzględniać bezpieczeństwo danych i wdrożenia."
      }
    ],
    "references": [
      {
        "title": "PostgreSQL Documentation",
        "url": "https://www.postgresql.org/docs/",
        "description": "Dokumentacja jednej z najpopularniejszych relacyjnych baz danych."
      },
      {
        "title": "SQLite Documentation",
        "url": "https://www.sqlite.org/docs.html",
        "description": "Przystępne źródło wiedzy o SQL, transakcjach i działaniu lekkiej bazy relacyjnej."
      },
      {
        "title": "Use The Index, Luke",
        "url": "https://use-the-index-luke.com/",
        "description": "Praktyczny przewodnik po indeksach i wydajności zapytań SQL."
      },
      {
        "title": "Martin Fowler - Evolutionary Database Design",
        "url": "https://martinfowler.com/articles/evodb.html",
        "description": "Klasyczny tekst o migracjach i ewolucji schematu bazy danych."
      }
    ],
    "tipsAndTricks": [
      "Migrację testuj na danych istniejących, nie tylko na pustej bazie.",
      "Seed powinien być mały i jawny; resztę danych twórz w testach.",
      "Cleanup bez filtra jest defektem bezpieczeństwa środowiska.",
      "Przy dużych zmianach schematu myśl o kompatybilności starej i nowej wersji aplikacji."
    ],
    "commonMistakes": [
      {
        "mistake": "Migracje bez rollbacku lub planu awaryjnego",
        "solution": "Opisz, jak cofnąć zmianę albo jak bezpiecznie przejść przez wdrożenie."
      },
      {
        "mistake": "Zbyt duży seed",
        "solution": "Utrzymuj minimalne dane bazowe i twórz resztę per test."
      },
      {
        "mistake": "Cleanup usuwający cudze dane",
        "solution": "Filtruj po run_id, tenant_id lub danych utworzonych przez test."
      },
      {
        "mistake": "Brak testu na danych historycznych",
        "solution": "Uruchamiaj migrację na reprezentatywnej kopii danych."
      }
    ]
  }
};
