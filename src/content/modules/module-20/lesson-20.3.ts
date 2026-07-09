import type { Lesson } from "../../../renderer/types";
import theory20_3 from './lesson-20.3.md?raw';

export const lesson20_3: Lesson = {
  "id": "20.3",
  "moduleId": 20,
  "title": "Transakcje, izolacja i warunki wyścigu",
  "description": "Transakcje i współbieżność: isolation levels, dirty/non-repeatable/phantom reads, lost update, deadlocki i retry.",
  "order": 3,
  "difficulty": "advanced",
  "tags": [
    "transactions",
    "acid",
    "isolation",
    "race-condition",
    "deadlock",
    "concurrency"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji rozumiesz podstawy transakcji i izolacji, potrafisz rozpoznać typowe problemy współbieżności oraz zaprojektować testy wykrywające utracona aktualizacja, duplikaty i niespójny stan procesu.",
    "theory": theory20_3,
    "codeExamples": [
      "import { expect, test } from '@playwright/test';\n\ntest('only one user can reserve the last item', async ({ request }) => {\n  const productId = await createProduct({ stock: 1 });\n\n  const [first, second] = await Promise.all([\n    request.post('/api/reservations', { data: { productId, idempotencyKey: 'r-1' } }),\n    request.post('/api/reservations', { data: { productId, idempotencyKey: 'r-2' } }),\n  ]);\n\n  const statuses = [first.status(), second.status()].sort();\n  expect(statuses).toEqual([201, 409]);\n\n  const stock = await readStockFromDb(productId);\n  expect(stock).toBe(0);\n});\n",
      "-- Ochrona przed utracona aktualizacja przez warunkowy UPDATE.\nUPDATE products\nSET stock = stock - 1\nWHERE id = :product_id\n  AND stock > 0;\n\n-- Test powinien sprawdzić liczbę zmienionych wierszy.\n"
    ],
    "exercises": [
      {
        "id": "ex-20-3-1",
        "title": "Ostatnia sztuka",
        "description": "Zaprojektuj test równoległej rezerwacji produktu ze stanem magazynu 1."
      },
      {
        "id": "ex-20-3-2",
        "title": "Idempotency key",
        "description": "Sprawdź, że ponowienie płatności z tym samym kluczem nie tworzy drugiej transakcji."
      },
      {
        "id": "ex-20-3-3",
        "title": "Lost update",
        "description": "Opisz scenariusz, w którym dwa równoległe zapisy mogłyby nadpisać wynik."
      },
      {
        "id": "ex-20-3-4",
        "title": "Rollback",
        "description": "Napisz pseudokod testu, który po błędzie w połowie procesu potwierdza rollback."
      },
      {
        "id": "ex-20-3-5",
        "title": "Deadlock diagnostics",
        "description": "Wskaż logi i metryki potrzebne do analizy deadlocka."
      },
      {
        "id": "ex-20-3-6",
        "title": "Poziom izolacji",
        "description": "Dla procesu raportowego i płatności zaproponuj wymagania izolacji i uzasadnij różnice."
      }
    ],
    "quiz": [
      {
        "id": "q20-3-1",
        "question": "Co oznacza atomicity?",
        "options": [
          "Transakcja wykonuje się w całości albo wcale",
          "Zapytanie jest szybkie",
          "Tabela ma indeks",
          "Użytkownik ma rolę admina"
        ],
        "correctAnswer": 0,
        "explanation": "Atomicity chroni przed częściowym zapisem procesu."
      },
      {
        "id": "q20-3-2",
        "question": "Czym jest utracona aktualizacja?",
        "options": [
          "Nadpisaniem zmiany przez równoległy zapis",
          "Brakiem CSS",
          "Usunięciem testu",
          "Typem mocka"
        ],
        "correctAnswer": 0,
        "explanation": "Dwa procesy mogą zapisać wynik oparty na starym odczycie."
      },
      {
        "id": "q20-3-3",
        "question": "Co oznacza idempotencja?",
        "options": [
          "Ponowienie operacji nie powoduje podwójnego skutku",
          "Operacja zawsze jest wolna",
          "Brak transakcji",
          "Dowolny status HTTP"
        ],
        "correctAnswer": 0,
        "explanation": "Idempotencja chroni przed skutkami retry i duplikatów."
      },
      {
        "id": "q20-3-4",
        "question": "Jak testować współbieżność?",
        "options": [
          "Równoległe żądania i asercja końcowego stanu",
          "Tylko screenshot",
          "SELECT bez WHERE",
          "Jedno kliknięcie lokalnie"
        ],
        "correctAnswer": 0,
        "explanation": "Liczy się końcowa spójność po równoległych operacjach."
      },
      {
        "id": "q20-3-5",
        "question": "Czym jest deadlock?",
        "options": [
          "Wzajemne oczekiwanie transakcji na zablokowane zasoby",
          "Błąd literówki",
          "Brak indeksu CSS",
          "Test manualny"
        ],
        "correctAnswer": 0,
        "explanation": "Deadlock wymaga obsługi i diagnostyki w aplikacji."
      },
      {
        "id": "q20-3-6",
        "question": "Co sprawdzić przy zakupie ostatniej sztuki?",
        "options": [
          "Liczbę udanych rezerwacji i końcowy stock",
          "Tylko tekst przycisku",
          "Wyłącznie status pierwszego requestu",
          "Nic w bazie"
        ],
        "correctAnswer": 0,
        "explanation": "Statusy HTTP i stan bazy muszą być spójne."
      },
      {
        "id": "q20-3-7",
        "question": "Co pomaga przy testach probabilistycznych?",
        "options": [
          "Powtórzenia, równoległość i końcowe asercje stanu",
          "Brak asercji",
          "Losowy sleep",
          "Usunięcie logów"
        ],
        "correctAnswer": 0,
        "explanation": "Błędy współbieżności mogą wymagać wielu prób i dobrej obserwowalności."
      },
      {
        "id": "q20-3-8",
        "question": "Dlaczego poziom izolacji jest kompromisem?",
        "options": [
          "Wpływa na spójność i wydajność",
          "Dotyczy tylko interfejs użytkownika",
          "Zastępuje indeksy",
          "Nie wpływa na system"
        ],
        "correctAnswer": 0,
        "explanation": "Silniejsza izolacja zwiększa bezpieczeństwo, ale może kosztować przepustowość."
      }
    ],
    "references": [
      {
        "title": "PostgreSQL Transactions",
        "url": "https://www.postgresql.org/docs/current/tutorial-transactions.html",
        "description": "Transakcje w PostgreSQL."
      },
      {
        "title": "PostgreSQL Isolation",
        "url": "https://www.postgresql.org/docs/current/transaction-iso.html",
        "description": "Poziomy izolacji i anomalie."
      },
      {
        "title": "PostgreSQL Explicit Locking",
        "url": "https://www.postgresql.org/docs/current/explicit-locking.html",
        "description": "Locki i deadlocki."
      }
    ],
    "tipsAndTricks": [
      "Współbieżność testuj na końcowym stanie, nie tylko na statusach odpowiedzi.",
      "Idempotency key powinien pojawić się w testach płatności i webhooków.",
      "Deadlock bez logów jest koszmarem diagnostycznym — dodaj correlation ID.",
      "Warunkowy UPDATE często jest prostszą ochroną niż skomplikowana logika aplikacji."
    ],
    "commonMistakes": [
      {
        "mistake": "Testowanie współbieżności jednym requestem",
        "solution": "Użyj równoległych operacji i sprawdź stan końcowy."
      },
      {
        "mistake": "Brak idempotencji",
        "solution": "Dodaj klucze idempotencji i testy ponowienia."
      },
      {
        "mistake": "Ignorowanie rollbacku",
        "solution": "Sprawdzaj, że częściowy błąd nie zostawia połowicznego stanu."
      },
      {
        "mistake": "Brak diagnostyki deadlocków",
        "solution": "Loguj transakcje, correlation ID i konflikty blokad."
      }
    ]
  }
};
