import type { Lesson } from "../../../renderer/types";
import theory19_4 from './lesson-19.4.md?raw';

export const lesson19_4: Lesson = {
  "id": "19.4",
  "moduleId": 19,
  "title": "Testy integracyjne backendu",
  "description": "Testy integracyjne backendu: API+baza, Testcontainers, transakcje, rollback, HTTP server, kolejki, eventy, cleanup i granica z E2E.",
  "order": 4,
  "difficulty": "intermediate",
  "tags": [
    "backend",
    "integration-testing",
    "supertest",
    "database",
    "transactions",
    "api"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz zaprojektować test integracyjny backendu, który uruchamia realne warstwy aplikacji, kontroluje bazę danych i daje większe zaufanie niż test jednostkowy z mockami.",
    "theory": theory19_4,
    "codeExamples": [
      "import request from 'supertest';\nimport { expect, it } from 'vitest';\nimport { createApp } from '../src/app';\nimport { db } from '../src/db';\n\nit('creates order and persists order items', async () => {\n  const app = createApp();\n  const runId = `it-${Date.now()}`;\n\n  const response = await request(app)\n    .post('/api/orders')\n    .send({ externalId: runId, items: [{ sku: 'SKU-1', quantity: 2 }] })\n    .expect(201);\n\n  expect(response.body).toMatchObject({ status: 'new' });\n\n  const order = await db.order.findByExternalId(runId);\n  expect(order.items).toHaveLength(1);\n  expect(order.items[0]).toMatchObject({ sku: 'SKU-1', quantity: 2 });\n});\n",
      "// Strategia transakcyjna — pseudokod.\nbeforeEach(async () => {\n  await db.beginTransaction();\n});\n\nafterEach(async () => {\n  await db.rollback();\n});\n\n// Każdy test widzi czysty stan, a dane nie przeciekają do kolejnych przypadków.\n"
    ],
    "exercises": [
      {
        "id": "ex-19-4-1",
        "title": "Endpoint create order",
        "description": "Napisz test integracyjny POST /orders sprawdzający response i zapis w bazie."
      },
      {
        "id": "ex-19-4-2",
        "title": "Autoryzacja",
        "description": "Dodaj test 401/403 dla endpointu wymagającego roli admina."
      },
      {
        "id": "ex-19-4-3",
        "title": "Walidacja błędów",
        "description": "Sprawdź response 400 i strukturę błędu dla niepoprawnego body."
      },
      {
        "id": "ex-19-4-4",
        "title": "Izolacja danych",
        "description": "Wybierz strategię izolacji danych dla testów równoległych i uzasadnij decyzję."
      },
      {
        "id": "ex-19-4-5",
        "title": "Migracje testowe",
        "description": "Opisz, kiedy uruchamiać migracje i seed w pipeline testów integracyjnych."
      },
      {
        "id": "ex-19-4-6",
        "title": "Redukcja E2E",
        "description": "Wskaż trzy scenariusze E2E, które można zastąpić testami backend integration."
      }
    ],
    "quiz": [
      {
        "id": "q19-4-1",
        "question": "Co sprawdza test integracyjny backendu?",
        "options": [
          "Współpracę realnych warstw aplikacji",
          "Tylko prywatną funkcję",
          "Wyłącznie CSS",
          "Manualną eksplorację"
        ],
        "correctAnswer": 0,
        "explanation": "Test integracyjny uruchamia kilka komponentów razem."
      },
      {
        "id": "q19-4-2",
        "question": "Co jest częstym problemem testów integracyjnych?",
        "options": [
          "Stan bazy i izolacja danych",
          "Brak możliwości asercji",
          "Brak HTTP",
          "Niemożność uruchomienia w CI"
        ],
        "correctAnswer": 0,
        "explanation": "Stan musi być kontrolowany, aby testy były powtarzalne."
      },
      {
        "id": "q19-4-3",
        "question": "Co warto sprawdzić poza statusem 201?",
        "options": [
          "Body i efekt w bazie",
          "Kolor terminala",
          "Nazwę IDE",
          "Losowy timeout"
        ],
        "correctAnswer": 0,
        "explanation": "Status nie wystarcza do potwierdzenia zachowania."
      },
      {
        "id": "q19-4-4",
        "question": "Która zależność może zostać zastąpiona sandboxem?",
        "options": [
          "Bramka płatnicza",
          "Walidacja lokalna stringa",
          "Typ TypeScript",
          "Matcher Vitest"
        ],
        "correctAnswer": 0,
        "explanation": "Zewnętrzne usługi warto kontrolować w testach."
      },
      {
        "id": "q19-4-5",
        "question": "Dlaczego test backend integration bywa lepszy niż E2E?",
        "options": [
          "Jest szybszy i precyzyjniej diagnozuje warstwę backendu",
          "Zawsze zastępuje interfejs użytkownika",
          "Nie wymaga asercji",
          "Nie potrzebuje danych"
        ],
        "correctAnswer": 0,
        "explanation": "Daje realizm backendu bez kosztu przeglądarki."
      },
      {
        "id": "q19-4-6",
        "question": "Co oznacza rollback po teście?",
        "options": [
          "Wycofanie zmian w bazie po zakończeniu testu",
          "Usunięcie repozytorium",
          "Reset przeglądarki",
          "Zmianę branchy"
        ],
        "correctAnswer": 0,
        "explanation": "Rollback pomaga utrzymać izolację danych."
      },
      {
        "id": "q19-4-7",
        "question": "Kiedy użyć unikalnego runId?",
        "options": [
          "Gdy testy mogą działać równolegle i tworzyć dane",
          "Tylko w CSS",
          "Nigdy",
          "Zamiast asercji"
        ],
        "correctAnswer": 0,
        "explanation": "runId pomaga odróżnić dane konkretnego uruchomienia."
      },
      {
        "id": "q19-4-8",
        "question": "Co jest antywzorcem?",
        "options": [
          "Test zależny od danych zostawionych przez poprzedni test",
          "Osobna baza testowa",
          "Asercja efektu w Baza danych",
          "Walidacja błędu 400"
        ],
        "correctAnswer": 0,
        "explanation": "Zależność od kolejności niszczy powtarzalność testów."
      }
    ],
    "references": [
      {
        "title": "Vitest Guide",
        "url": "https://vitest.dev/guide/",
        "description": "Runner do testów integracyjnych w ekosystemie Vite."
      },
      {
        "title": "PostgreSQL Docs",
        "url": "https://www.postgresql.org/docs/current/",
        "description": "Dokumentacja bazy używanej w testach integracyjnych."
      },
      {
        "title": "Testcontainers",
        "url": "https://testcontainers.com/",
        "description": "Uruchamianie realnych zależności w kontenerach."
      }
    ],
    "tipsAndTricks": [
      "Test integracyjny powinien uruchamiać prawdziwą ścieżkę aplikacji, ale kontrolować świat zewnętrzny.",
      "Status HTTP to początek, nie koniec asercji.",
      "Izolacja danych jest warunkiem równoległości.",
      "Jeżeli E2E pada na backendzie, rozważ przeniesienie części kontroli do integration testu."
    ],
    "commonMistakes": [
      {
        "mistake": "Współdzielony stan testów",
        "solution": "Użyj transakcji, cleanupu albo unikalnych danych."
      },
      {
        "mistake": "Sprawdzanie tylko statusu",
        "solution": "Dodaj body, bazę, audyt albo zdarzenie."
      },
      {
        "mistake": "Prawdziwe usługi zewnętrzne w każdym teście",
        "solution": "Użyj sandboxa, fake lub kontraktu."
      },
      {
        "mistake": "Brak migracji w CI",
        "solution": "Uruchamiaj migracje testowe przed suite i wykrywaj drift schematu."
      }
    ]
  }
};
