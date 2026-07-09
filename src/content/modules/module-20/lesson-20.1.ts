import type { Lesson } from "../../../renderer/types";
import theory20_1 from './lesson-20.1.md?raw';

export const lesson20_1: Lesson = {
  "id": "20.1",
  "moduleId": 20,
  "title": "Podstawy SQL",
  "description": "SQL dla testerów: SELECT/JOIN/agregacje, dialekty PostgreSQL/MySQL/SQLite, EXPLAIN ANALYZE i weryfikacja danych po UI/API.",
  "order": 1,
  "difficulty": "intermediate",
  "tags": [
    "sql",
    "select",
    "join",
    "group-by",
    "data-validation",
    "database-testing"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz pisać czytelne zapytania SQL do weryfikacji danych testowych, rozumiesz podstawowe operacje SELECT/JOIN/GROUP BY i wiesz, jak używać SQL jako narzędzia diagnostycznego w pracy full stack testera.",
    "theory": theory20_1,
    "codeExamples": [
      "-- Weryfikacja zamówienia i jego pozycji po teście API/interfejsu użytkownika.\nSELECT\n  o.id,\n  o.status,\n  o.total_gross,\n  i.sku,\n  i.quantity\nFROM orders o\nJOIN order_items i ON i.order_id = o.id\nWHERE o.external_id = :run_id\nORDER BY i.sku;\n",
      "-- Wykrywanie duplikatów zdarzeń audytowych.\nSELECT event_type, entity_id, COUNT(*) AS occurrences\nFROM audit_events\nWHERE correlation_id = :correlation_id\nGROUP BY event_type, entity_id\nHAVING COUNT(*) > 1;\n"
    ],
    "exercises": [
      {
        "id": "ex-20-1-1",
        "title": "SELECT diagnostyczny",
        "description": "Napisz zapytanie pobierające tylko pola potrzebne do potwierdzenia statusu zamówienia utworzonego w teście."
      },
      {
        "id": "ex-20-1-2",
        "title": "JOIN zamówienia i pozycji",
        "description": "Połącz tabele orders i order_items, filtrując po external_id testu."
      },
      {
        "id": "ex-20-1-3",
        "title": "Agregacja",
        "description": "Policz liczbę pozycji i łączną ilość produktów w zamówieniu."
      },
      {
        "id": "ex-20-1-4",
        "title": "Duplikaty",
        "description": "Napisz zapytanie wykrywające zdublowane wpisy audytu dla jednego correlation_id."
      },
      {
        "id": "ex-20-1-5",
        "title": "Ostatni status",
        "description": "Pobierz ostatni wpis z historii statusów zamówienia, uwzględniając sortowanie deterministyczne."
      },
      {
        "id": "ex-20-1-6",
        "title": "SQL jako asercja",
        "description": "Opisz, które zapytania SQL dodasz do testu checkoutu i dlaczego."
      }
    ],
    "quiz": [
      {
        "id": "q20-1-1",
        "question": "Po co testerowi SQL?",
        "options": [
          "Do weryfikacji i diagnozy stanu systemu w bazie danych",
          "Wyłącznie do stylowania interfejs użytkownika",
          "Do zastąpienia wszystkich testów",
          "Tylko dla administratorów baz"
        ],
        "correctAnswer": 0,
        "explanation": "SQL pozwala sprawdzić rzeczywisty stan danych po operacjach interfejsu użytkownika/API."
      },
      {
        "id": "q20-1-2",
        "question": "Dlaczego warto unikać SELECT * w testach?",
        "options": [
          "Bo pobiera pola nieistotne i zaciemnia intencję asercji",
          "Bo SQL go nie obsługuje",
          "Bo zawsze zmienia dane",
          "Bo działa tylko w produkcji"
        ],
        "correctAnswer": 0,
        "explanation": "Precyzyjny SELECT dokumentuje, które dane są dowodem poprawności."
      },
      {
        "id": "q20-1-3",
        "question": "Do czego służy JOIN?",
        "options": [
          "Do łączenia powiązanych danych z wielu tabel",
          "Do usuwania indeksów",
          "Do formatowania kodu",
          "Do instalacji zależności"
        ],
        "correctAnswer": 0,
        "explanation": "JOIN pozwala sprawdzić relacje, np. zamówienie i jego pozycje."
      },
      {
        "id": "q20-1-4",
        "question": "Jak wykryć duplikaty?",
        "options": [
          "GROUP BY z HAVING COUNT(*) > 1",
          "ORDER BY bez WHERE",
          "SELECT bez tabeli",
          "Tylko przez interfejs użytkownika"
        ],
        "correctAnswer": 0,
        "explanation": "Grupowanie i HAVING pozwalają znaleźć powtarzające się rekordy."
      },
      {
        "id": "q20-1-5",
        "question": "Po co używać run_id?",
        "options": [
          "Aby jednoznacznie powiązać dane z przebiegiem testu",
          "Aby spowolnić zapytania",
          "Aby ukryć dane",
          "Aby zastąpić sprzątanie danych"
        ],
        "correctAnswer": 0,
        "explanation": "run_id pomaga filtrować dane i diagnozować testy równoległe."
      },
      {
        "id": "q20-1-6",
        "question": "Co jest częstym błędem w SQL testowym?",
        "options": [
          "Brak precyzyjnego WHERE",
          "Użycie aliasów",
          "Sprawdzenie COUNT",
          "JOIN po kluczu obcym"
        ],
        "correctAnswer": 0,
        "explanation": "Bez WHERE test może korzystać ze starych lub cudzych danych."
      },
      {
        "id": "q20-1-7",
        "question": "Która agregacja policzy rekordy?",
        "options": [
          "COUNT(*)",
          "SUM(text)",
          "ORDER BY",
          "LIMIT"
        ],
        "correctAnswer": 0,
        "explanation": "COUNT zwraca liczbę rekordów w grupie lub wyniku."
      },
      {
        "id": "q20-1-8",
        "question": "Jak pobrać najnowszy wpis historii?",
        "options": [
          "ORDER BY created_at DESC, id DESC LIMIT 1",
          "SELECT * bez sortowania",
          "DELETE FROM history",
          "GROUP BY bez agregacji"
        ],
        "correctAnswer": 0,
        "explanation": "Sortowanie malejące i LIMIT pozwalają wskazać ostatni rekord."
      }
    ],
    "references": [
      {
        "title": "PostgreSQL Tutorial",
        "url": "https://www.postgresql.org/docs/current/tutorial.html",
        "description": "SQL i relacyjne podstawy PostgreSQL."
      },
      {
        "title": "PostgreSQL EXPLAIN",
        "url": "https://www.postgresql.org/docs/current/using-explain.html",
        "description": "Analiza planów zapytań."
      },
      {
        "title": "SQLite Docs",
        "url": "https://www.sqlite.org/docs.html",
        "description": "Różnice lekkich baz i SQLite."
      }
    ],
    "tipsAndTricks": [
      "Każde zapytanie testowe powinno mieć jasną hipotezę.",
      "Unikalny identyfikator przebiegu testu ułatwia asercje i sprzątanie danych.",
      "JOIN jest często lepszym dowodem niż kilka niezależnych SELECT-ów.",
      "SQL w testach powinien być czytelny dla osoby diagnozującej awarię."
    ],
    "commonMistakes": [
      {
        "mistake": "Brak WHERE",
        "solution": "Filtruj po ID utworzonym przez test, run_id lub correlation_id."
      },
      {
        "mistake": "SELECT * jako asercja",
        "solution": "Pobieraj tylko pola istotne dla sprawdzanej hipotezy."
      },
      {
        "mistake": "Ignorowanie relacji",
        "solution": "Sprawdzaj tabele zależne przez JOIN."
      },
      {
        "mistake": "Asercje oparte na starych danych",
        "solution": "Twórz dane deterministycznie i izoluj je per test."
      }
    ]
  }
};
