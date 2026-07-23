import type { Lesson } from "../../../renderer/types";
import theory20_2 from './lesson-20.2.md?raw';

export const lesson20_2: Lesson = {
  "id": "20.2",
  "moduleId": 20,
  "title": "Relacje, ograniczenia i indeksy",
  "description": "Relacje, constraints i indeksy: FK, unique/check constraints, indeksy jako oracle danych i regresje wydajności zapytań.",
  "order": 2,
  "difficulty": "intermediate",
  "tags": [
    "constraints",
    "indexes",
    "schema",
    "foreign-key",
    "unique",
    "integrity"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji rozumiesz, jak relacje i ograniczenia chronią integralność danych, potrafisz testować constraints oraz wiesz, jak indeksy wpływają na wydajność zapytań i stabilność aplikacji.",
    "theory": theory20_2,
    "codeExamples": [
      "-- Przykładowe constraints dla zamówień.\nCREATE TABLE orders (\n  id Uinterfejs użytkownikaD PRIMARY KEY,\n  tenant_id Uinterfejs użytkownikaD NOT NULL,\n  external_id TEXT NOT NULL,\n  status TEXT NOT NULL CHECK (status IN ('new', 'paid', 'cancelled')),\n  total_gross NUMERIC NOT NULL CHECK (total_gross >= 0),\n  UNIQUE (tenant_id, external_id)\n);\n",
      "-- Diagnostyka indeksów w PostgreSQL.\nEXPLAIN ANALYZE\nSELECT id, status\nFROM orders\nWHERE tenant_id = :tenant_id AND external_id = :external_id;\n"
    ],
    "exercises": [
      {
        "id": "ex-20-2-1",
        "title": "Ograniczenia zamówień",
        "description": "Zaprojektuj constraints dla tabeli orders: status, kwota, waluta, tenant i external_id."
      },
      {
        "id": "ex-20-2-2",
        "title": "Test unique",
        "description": "Napisz test integracyjny potwierdzający, że nie można utworzyć dwóch użytkowników o tym samym e-mailu."
      },
      {
        "id": "ex-20-2-3",
        "title": "Foreign key",
        "description": "Sprawdź, że baza odrzuca order_item wskazujący na nieistniejące zamówienie."
      },
      {
        "id": "ex-20-2-4",
        "title": "Check constraint",
        "description": "Przetestuj, że ujemna kwota płatności jest odrzucana na poziomie bazy."
      },
      {
        "id": "ex-20-2-5",
        "title": "Indeks tenantowy",
        "description": "Zaproponuj indeks dla zapytania pobierającego zamówienie po tenant_id i external_id."
      },
      {
        "id": "ex-20-2-6",
        "title": "Review schematu",
        "description": "Przejrzyj schemat tabeli użytkowników i wskaż brakujące constraints."
      }
    ],
    "quiz": [
      {
        "id": "q20-2-1",
        "question": "Co chroni klucz obcy?",
        "options": [
          "Spójność relacji między tabelami",
          "Kolor interfejsu",
          "Timeout w Playwright",
          "Format commitów"
        ],
        "correctAnswer": 0,
        "explanation": "FK zapobiega rekordom wskazującym na nieistniejące dane nadrzędne."
      },
      {
        "id": "q20-2-2",
        "question": "Do czego służy UNIQUE?",
        "options": [
          "Do zapobiegania duplikatom w określonych kolumnach",
          "Do sortowania wyników",
          "Do usuwania tabel",
          "Do generowania raportu"
        ],
        "correctAnswer": 0,
        "explanation": "UNIQUE wymusza niepowtarzalność wartości lub kombinacji wartości."
      },
      {
        "id": "q20-2-3",
        "question": "Dlaczego NOT NULL jest ważne?",
        "options": [
          "Wymusza obecność danych krytycznych",
          "Przyspiesza każdy SELECT",
          "Zastępuje backup",
          "Działa tylko w interfejs użytkownika"
        ],
        "correctAnswer": 0,
        "explanation": "NOT NULL zapobiega zapisowi niekompletnych rekordów."
      },
      {
        "id": "q20-2-4",
        "question": "Co może sprawdzić CHECK constraint?",
        "options": [
          "Prostą regułę, np. kwota >= 0",
          "Responsywność interfejs użytkownika",
          "Działanie Gita",
          "Czas ładowania fontów"
        ],
        "correctAnswer": 0,
        "explanation": "CHECK zapisuje reguły poprawności wartości w schemacie."
      },
      {
        "id": "q20-2-5",
        "question": "Jaki jest koszt indeksu?",
        "options": [
          "Może spowalniać zapisy i zajmuje miejsce",
          "Usuwa constraints",
          "Blokuje SELECT",
          "Nie ma żadnego kosztu"
        ],
        "correctAnswer": 0,
        "explanation": "Indeks przyspiesza odczyty, ale zwiększa koszt utrzymania przy zapisach."
      },
      {
        "id": "q20-2-6",
        "question": "Co jest ważne w multi-tenant SaaS?",
        "options": [
          "Filtrowanie i unikalność w kontekście tenant_id",
          "Brak tenant_id w tabelach",
          "Wspólne dane wszystkich klientów",
          "Wyłącznie testy CSS"
        ],
        "correctAnswer": 0,
        "explanation": "tenant_id pomaga izolować dane organizacji."
      },
      {
        "id": "q20-2-7",
        "question": "Dlaczego constraints warto testować?",
        "options": [
          "Bo są częścią kontraktu danych",
          "Bo zastępują wszystkie testy interfejs użytkownika",
          "Bo nie mogą się zepsuć",
          "Bo są widoczne w CSS"
        ],
        "correctAnswer": 0,
        "explanation": "Migracje mogą zmienić lub usunąć constraints, dlatego warto je chronić."
      },
      {
        "id": "q20-2-8",
        "question": "Co pokazuje EXPLAIN ANALYZE?",
        "options": [
          "Plan i koszt wykonania zapytania",
          "Zrzut ekranu",
          "Historię Gita",
          "Wynik testu E2E"
        ],
        "correctAnswer": 0,
        "explanation": "EXPLAIN pomaga diagnozować wydajność zapytań."
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
        "title": "PostgreSQL Constraints",
        "url": "https://www.postgresql.org/docs/current/ddl-constraints.html",
        "description": "Ograniczenia integralności."
      },
      {
        "title": "PostgreSQL Indexes",
        "url": "https://www.postgresql.org/docs/current/indexes.html",
        "description": "Indeksy i ich zastosowanie."
      },
      {
        "title": "PostgreSQL EXPLAIN",
        "url": "https://www.postgresql.org/docs/current/using-explain.html",
        "description": "Analiza wpływu indeksów."
      }
    ],
    "tipsAndTricks": [
      "Zawsze opieraj architekturę testów na zasadach SOLID, unikając przedwczesnej abstrakcji zgodnie z zasadą WET (Write Everything Twice) z podręczników 2026.",
      
      "Reguła krytyczna biznesowo często powinna istnieć zarówno w aplikacji, jak i w bazie.",
      "Unique constraint w systemie multi-tenant zwykle dotyczy kombinacji z tenant_id.",
      "Indeks projektuj pod konkretne zapytanie, nie na zapas.",
      "Test constraints jest dobrym zabezpieczeniem przed błędną migracją."
    ],
    "commonMistakes": [
      {
        "mistake": "Walidacja tylko w interfejs użytkownika",
        "solution": "Krytyczne reguły zabezpieczaj również w API i bazie."
      },
      {
        "mistake": "Brak tenant_id w unikalności",
        "solution": "Projektuj constraints zgodnie z modelem wielodzierżawnym."
      },
      {
        "mistake": "Indeksy bez analizy zapytań",
        "solution": "Używaj EXPLAIN i rzeczywistych wzorców dostępu."
      },
      {
        "mistake": "Ignorowanie błędów migracji",
        "solution": "Dodaj testy schematu i constraints do pipeline."
      }
    ]
  }
};
