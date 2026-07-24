import type { Lesson } from '../../../renderer/types';
import theory20_4 from './lesson-20.4.md?raw';

export const lesson20_4: Lesson = {
  "id": "20.4",
  "moduleId": 20,
  "title": "Migracje, seedowanie i sprzątanie danych",
  "description": "Opanuj higienę bazy danych (Test Database Hygiene). Poznaj techniki czyszczenia danych (Truncate, Rollbacks, selektywne usuwanie po run_id), migracje schematów oraz bezpieczne seedowanie bazy.",
  "order": 4,
  "difficulty": "advanced",
  "tags": ["migrations", "seeding", "cleanup", "database-hygiene", "UUID", "teardown"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz projektować spójną politykę sprzątania i higieny bazy danych, stosować unikalne identyfikatory UUID w celach izolacji, przeprowadzać selektywny cleanup danych oraz integrować procesy seedowania z testami.",
    "theory": theory20_4,
    "codeExamples": [
      `// Przykład selektywnego usuwania po runId (Książka 3 - Uppadhyay)
test.afterAll(async () => {
  await db.query('DELETE FROM users WHERE email LIKE $1', [\`%\${runId}@test.pl\`]);
});`
    ],
    "exercises": [
      {
        "id": "ex-20-4-1",
        "title": "Implementacja transakcyjnego rollbacku",
        "description": "Napisz integracyjny test zapisu zamówienia, w którym w fazie `beforeEach` rozpoczniesz transakcję bazy `BEGIN`, wykonasz akcje zapisu, a w fazie `afterEach` wywołasz `ROLLBACK` w celu przywrócenia bazy do czystości."
      }
    ],
    "quiz": [
      {
        "id": "q20-4-1",
        "question": "Która technika czyszczenia bazy danych jest uznawana za najszybszą i najbardziej wydajną w testach integracyjnych, o ile nie testujemy procesów asynchronicznych?",
        "options": [
          "Transaction Rollback (wykonywanie testu w transakcji i wycofanie jej poleceniem ROLLBACK na koniec)",
          "TRUNCATE na wszystkich tabelach bazy danych przed każdym testem",
          "Ręczne kasowanie bazy danych i odtwarzanie jej z pliku SQL dump",
          "Playwright nie umożliwia czyszczenia baz danych"
        ],
        "correctAnswer": 0,
        "explanation": "Transakcyjny rollback trwa zaledwie kilka milisekund i nie pozostawia żadnych śladów na dysku bazy, co gwarantuje błyskawiczne wykonanie testu i pełną higienę środowiska."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 7: Managing Test Data, Environments, and Configuration (Data hygiene)."
      }
    ],
    "tipsAndTricks": [
      "Używaj unikalnych identyfikatorów (np. UUID) jako przyrostków dla nazw i loginów tworzonych w testach, co ułatwi ich selektywne usuwanie po zakończeniu pracy."
    ],
    "commonMistakes": [
      {
        "mistake": "Brak sprzątania danych wygenerowanych w testach (Database Leaks), co z czasem zapycha bazę i spowalnia działanie środowiska testowego",
        "solution": "Zawsze wdrażaj rygorystyczny Teardown (czyszczenie) w sekcjach afterEach / afterAll."
      }
    ]
  }
};