import type { Lesson } from '../../../renderer/types';
import theory20_3 from './lesson-20.3.md?raw';

export const lesson20_3: Lesson = {
  "id": "20.3",
  "moduleId": 20,
  "title": "Transakcje, izolacja i warunki wyścigu",
  "description": "Zrozum integralność danych w warunkach współbieżności. Poznaj cztery poziomy izolacji transakcji SQL, anomalie bazodanowe (Lost Update, Dirty Read) oraz testowanie blokad i deadlocków.",
  "order": 3,
  "difficulty": "advanced",
  "tags": ["transactions", "SQL", "PostgreSQL", "isolation-levels", "race-conditions", "deadlocks"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz opisać poziomy izolacji transakcji bazy danych, identyfikować anomalie współbieżności, pisać współbieżne testy integracyjne z użyciem blokowania jawnego (FOR UPDATE) oraz diagnozować błędy typu deadlock.",
    "theory": theory20_3,
    "codeExamples": [
      `// Przykład symulacji blokady transakcji (Książka 3 - Uppadhyay)
await dbA.query('BEGIN');
await dbA.query('SELECT stock FROM products WHERE id = 1 FOR UPDATE');
// dbB zostanie zablokowany przy próbie odczytu tego samego rekordu z FOR UPDATE!`
    ],
    "exercises": [
      {
        "id": "ex-20-3-1",
        "title": "Testowanie anomalii Dirty Read",
        "description": "Zaprojektuj scenariusz testowy weryfikujący, czy na poziomie izolacji `Read Committed` transakcja nie odczytuje niezatwierdzonych zmian z innej transakcji, która ostatecznie kończy się rollbackiem."
      }
    ],
    "quiz": [
      {
        "id": "q20-3-1",
        "question": "Która anomalia współbieżności zachodzi, gdy dwie transakcje jednocześnie odczytują ten sam rekord, modyfikują go i zapisują, w wyniku czego zapis jednej transakcji całkowicie niszczy zmiany drugiej?",
        "options": [
          "Lost Update (Utracona modyfikacja)",
          "Dirty Read (Odczyt brudny)",
          "Phantom Read (Odczyt fantomowy)",
          "Non-repeatable Read"
        ],
        "correctAnswer": 0,
        "explanation": "Lost Update to klasyczny problem braku blokad przy współbieżności - zmiany jednej transakcji są po prostu nadpisywane i niszczone przez drugą."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 7: Managing Test Data, Environments, and Configuration (Transactions & concurrency)."
      }
    ],
    "tipsAndTricks": [
      "Używaj SELECT ... FOR UPDATE w PostgreSQL do rygorystycznego blokowania rekordu na czas trwania transakcji, co całkowicie zapobiega anomalii Lost Update."
    ],
    "commonMistakes": [
      {
        "mistake": "Testowanie transakcji bazodanowych na pojedynczym, sekwencyjnym połączeniu klienckim",
        "solution": "Błędy współbieżności wymagają symulacji wyścigu. Zawsze inicjalizuj co najmniej dwa odizolowane połączenia dbClient w teście."
      }
    ]
  }
};