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
      "test('creates order through API and database', async () => {\n  const response = await request(app).post('/orders').send(buildOrder());\n  expect(response.status).toBe(201);\n\n  const row = await db.query('select status from orders where id = $1', [response.body.id]);\n  expect(row.rows[0].status).toBe('NEW');\n});",
      "const postgres = await new PostgreSqlContainer('postgres:16').start();\nprocess.env.DATABASE_URL = postgres.getConnectionUri();",
      "await expect.poll(async () => {\n  const event = await eventsRepository.findByOrderId(orderId);\n  return event?.type;\n}).toBe('OrderCreated');"
],
    "exercises": [
      {
            "id": "ex-auto-1",
            "title": "Ćwiczenie 1",
            "description": "Zaprojektuj test API + baza dla tworzenia zamówienia."
      },
      {
            "id": "ex-auto-2",
            "title": "Ćwiczenie 2",
            "description": "Dodaj Testcontainers dla PostgreSQL i uruchom migracje przed testem."
      },
      {
            "id": "ex-auto-3",
            "title": "Ćwiczenie 3",
            "description": "Przetestuj konflikt unikalnego klucza i poprawną odpowiedź API."
      },
      {
            "id": "ex-auto-4",
            "title": "Ćwiczenie 4",
            "description": "Opisz, które testy integracyjne można zastąpić kontraktami."
      }
],
    "quiz": [
      {
            "id": "q-auto-1",
            "question": "Co testuje test integracyjny?",
            "options": [
                  "Współpracę kilku realnych elementów systemu",
                  "Tylko prywatną funkcję",
                  "Wyłącznie kolor przycisku",
                  "Manualną checklistę"
            ],
            "correctAnswer": 0,
            "explanation": "To sprawdza zrozumienie praktycznego zastosowania lekcji."
      },
      {
            "id": "q-auto-2",
            "question": "Kiedy rollback może nie wystarczyć?",
            "options": [
                  "Gdy test publikuje eventy, pliki lub modyfikuje cache poza transakcją",
                  "Zawsze wystarcza",
                  "Tylko w unit testach",
                  "Nigdy nie działa"
            ],
            "correctAnswer": 0,
            "explanation": "To sprawdza zrozumienie praktycznego zastosowania lekcji."
      },
      {
            "id": "q-auto-3",
            "question": "Po co Testcontainers?",
            "options": [
                  "Aby uruchomić realne zależności w kontrolowanych kontenerach",
                  "Aby zastąpić TypeScript",
                  "Aby tworzyć screenshoty",
                  "Aby wyłączyć bazę"
            ],
            "correctAnswer": 0,
            "explanation": "To sprawdza zrozumienie praktycznego zastosowania lekcji."
      },
      {
            "id": "q-auto-4",
            "question": "Co jest antywzorcem?",
            "options": [
                  "Test integracyjny na produkcyjnej bazie",
                  "Izolowana baza testowa",
                  "Cleanup po runId",
                  "Migracje przed testem"
            ],
            "correctAnswer": 0,
            "explanation": "To sprawdza zrozumienie praktycznego zastosowania lekcji."
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
      "Kontroluj bazę i migracje w testach integracyjnych.",
      "Cleanup musi działać po awarii, nie tylko po sukcesie.",
      "Nie każdy test integracyjny powinien uruchamiać cały system.",
      "Waliduj eventy i kontrakty tam, gdzie są granice usług."
],
    "commonMistakes": [
      {
            "mistake": "Wspólna baza bez izolacji",
            "solution": "Użyj osobnej bazy, schematu, transakcji lub runId."
      },
      {
            "mistake": "Brak migracji w teście",
            "solution": "Uruchamiaj migracje tak jak w prawdziwym środowisku."
      },
      {
            "mistake": "Zbyt duży zakres testu",
            "solution": "Rozbij test na integracyjny, kontraktowy i E2E."
      }
]
  }
};
