import type { Lesson } from '../../../renderer/types';
import theory25_3 from './lesson-25.3.md?raw';

export const lesson25_3: Lesson = {
  "id": "25.3",
  "moduleId": 25,
  "title": "Docker Compose dla środowisk testowych",
  "description": "Zaprojektuj odizolowane środowiska kontenerowe. Poznaj strukturę docker-compose.yml, sprawdziany gotowości (healthchecks), zmienne środowiskowe, wolumeny oraz uruchamianie Playwright w kontenerze.",
  "order": 3,
  "difficulty": "advanced",
  "tags": ["DevOps", "Docker", "Docker-Compose", "containers", "healthcheck", "CI-CD"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz zaprojektować kompletne środowisko testowe (baza + API + makiety usług) w pliku docker-compose.yml, konfigurować sprawdziany gotowości healthcheck w celu stabilnej orkiestracji kontenerów oraz uruchamiać testy Playwright w oficjalnym kontenerze Microsoftu.",
    "theory": theory25_3,
    "codeExamples": [
      `// Przykład definicji healthcheck w YAML (Książka 3 - Uppadhyay)
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U user"]
  interval: 5s
  timeout: 5s
  retries: 3`
    ],
    "exercises": [
      {
        "id": "ex-25-3-1",
        "title": "Zaprojektowanie docker-compose z Mailpitem",
        "description": "Zaprojektuj kompletny plik `docker-compose.yml` składający się z bazy danych SQLite/Postgres oraz usługi przechwytywania poczty Mailpit. Skonfiguruj warunki depends_on i upewnij się, że całość podnosi się prawidłowo."
      }
    ],
    "quiz": [
      {
        "id": "q25-3-1",
        "question": "Dlaczego samo zadeklarowanie depends_on w pliku docker-compose.yml jest niewystarczające, aby zapewnić stabilny start aplikacji backendowej zależnej od bazy danych?",
        "options": [
          "depends_on czeka tylko na podniesienie samego kontenera bazy, ale nie wie, czy silnik bazy danych zakończył wewnętrzną inicjalizację i nasłuchuje na porcie. Wymagane jest użycie sekcji healthcheck",
          "depends_on działa wyłącznie w systemie Windows",
          "Bazy danych nie wymagają sprawdzania gotowości",
          "Komenda depends_on jest przestarzała w Docker Compose"
        ],
        "correctAnswer": 0,
        "explanation": "To klasyczny błąd orkiestracji. Kontener bazy może mieć status Running, ale sam silnik (np. Postgres) potrzebuje kilku sekund na gotowość. Dopiero powiązanie depends_on z condition: service_healthy oparte o pg_isready gwarantuje stabilny start."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 9: CI/CD Integration and Test Execution (Docker Compose environments)."
      }
    ],
    "tipsAndTricks": [
      "Zawsze uruchamiaj testy regresji wizualnej w kontenerze mcr.microsoft.com/playwright, co całkowicie wyeliminuje fałszywe błędy renderowania subpikselowego czcionek między różnymi systemami operacyjnymi."
    ],
    "commonMistakes": [
      {
        "mistake": "Brak stosowania healthchecków w bazach danych i wynikające z tego błędy connection refused podczas startu API",
        "solution": "Wdróż rzetelny healthcheck (np. pg_isready) i depends_on z warunkiem service_healthy."
      }
    ]
  }
};