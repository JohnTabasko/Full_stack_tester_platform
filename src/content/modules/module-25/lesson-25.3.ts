import type { Lesson } from "../../../renderer/types";
import theory25_3 from './lesson-25.3.md?raw';

export const lesson25_3: Lesson = {
  "id": "25.3",
  "moduleId": 25,
  "title": "Docker Compose dla środowisk testowych",
  "description": "Uruchamianie aplikacji, baz i zależności, healthchecki, sieci, wolumeny, seedowanie kontenerów i powtarzalność środowiska.",
  "order": 3,
  "difficulty": "intermediate",
  "tags": [
    "docker-compose",
    "containers",
    "test-environment",
    "healthcheck",
    "seed"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz zaprojektować środowisko testowe w Docker Compose, dodać healthchecki, kontrolować dane i uruchamiać zależności w sposób powtarzalny lokalnie oraz w CI.",
    "theory": theory25_3,
    "codeExamples": [
      "services:\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: test\n      POSTGRES_Baza danych: app_test\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U postgres\"]\n      interval: 5s\n      timeout: 3s\n      retries: 20\n\n  api:\n    build: .\n    depends_on:\n      db:\n        condition: service_healthy\n    environment:\n      DATABASE_URL: postgres://postgres:test@db:5432/app_test\n",
      "#!/usr/bin/env bash\nset -euo pipefail\n\ndocker compose up -d --build\ndocker compose ps\nnpm run test:integration\ndocker compose logs --no-color > compose.log\n"
    ],
    "exercises": [
      {
        "id": "ex-25-3-1",
        "title": "Procedura diagnostyczna",
        "description": "Dla tematu „Docker Compose dla środowisk testowych” zapisz procedurę: komendy, oczekiwane wyniki i możliwe wnioski."
      },
      {
        "id": "ex-25-3-2",
        "title": "Automatyzacja setupu",
        "description": "Zaprojektuj skrypt lub konfigurację uruchamiającą środowisko testowe od zera."
      },
      {
        "id": "ex-25-3-3",
        "title": "Healthcheck",
        "description": "Dodaj mechanizm czekania na gotowość usługi bez użycia stałego timeoutu."
      },
      {
        "id": "ex-25-3-4",
        "title": "Bezpieczeństwo konfiguracji",
        "description": "Wskaż, które dane są sekretami i jak powinny być przekazywane w CI."
      },
      {
        "id": "ex-25-3-5",
        "title": "Awaria zależności",
        "description": "Opisz, jak zasymulujesz niedostępność usługi i jak sprawdzisz zachowanie aplikacji."
      },
      {
        "id": "ex-25-3-6",
        "title": "Dokumentacja operacyjna",
        "description": "Napisz krótki runbook dla testera uruchamiającego środowisko lokalnie."
      }
    ],
    "quiz": [
      {
        "id": "q25-3-1",
        "question": "Dlaczego tester full stack powinien znać podstawy DevOps?",
        "options": [
          "Bo testy zależą od środowiska, sieci, konfiguracji i procesu uruchomienia",
          "Aby zastąpić cały zespół platformowy",
          "Wyłącznie dla ozdoby CV",
          "Nie powinien ich znać"
        ],
        "correctAnswer": 0,
        "explanation": "Wiele awarii testów wynika ze środowiska, a nie z samego kodu testowego."
      },
      {
        "id": "q25-3-2",
        "question": "Co jest lepsze niż sleep przy starcie zależności?",
        "options": [
          "Healthcheck lub oczekiwanie na konkretny stan usługi",
          "Dłuższy sleep",
          "Losowy retry bez logów",
          "Ignorowanie błędu"
        ],
        "correctAnswer": 0,
        "explanation": "Healthcheck sprawdza gotowość, a nie upływ czasu."
      },
      {
        "id": "q25-3-3",
        "question": "Gdzie nie powinny znajdować się sekrety?",
        "options": [
          "W repozytorium i logach",
          "W secret managerze",
          "W bezpiecznych zmiennych CI",
          "W kontrolowanym vault"
        ],
        "correctAnswer": 0,
        "explanation": "Sekret zapisany w repozytorium lub logu jest potencjalnie ujawniony."
      },
      {
        "id": "q25-3-4",
        "question": "Po co używać Docker Compose w testach?",
        "options": [
          "Aby odtwarzać zestaw zależności w kontrolowany sposób",
          "Aby ręcznie klikać interfejs użytkownika",
          "Aby zastąpić asercje",
          "Aby wyłączyć bazę danych"
        ],
        "correctAnswer": 0,
        "explanation": "Compose pozwala uruchomić aplikację, bazę i zależności jako powtarzalne środowisko."
      },
      {
        "id": "q25-3-5",
        "question": "Co pomaga diagnozować problemy DNS?",
        "options": [
          "dig lub nslookup",
          "toHaveText",
          "git revert",
          "screenshot interfejs użytkownika"
        ],
        "correctAnswer": 0,
        "explanation": "Narzędzia DNS pozwalają sprawdzić rozwiązywanie nazw."
      },
      {
        "id": "q25-3-6",
        "question": "Czym jest feature flag?",
        "options": [
          "Mechanizmem kontrolowanego włączania funkcji bez osobnego deployu",
          "Nowym typem bazy",
          "Zrzutem ekranu",
          "Rodzajem mocka"
        ],
        "correctAnswer": 0,
        "explanation": "Flagi pozwalają sterować dostępnością funkcji i rolloutem."
      },
      {
        "id": "q25-3-7",
        "question": "Co oznacza ephemeral environment?",
        "options": [
          "Tymczasowe środowisko tworzone np. dla PR lub testu",
          "Stałą produkcję",
          "Lokalny plik tekstowy",
          "Wyłącznie branch w Git"
        ],
        "correctAnswer": 0,
        "explanation": "Środowiska efemeryczne są tworzone i usuwane automatycznie."
      },
      {
        "id": "q25-3-8",
        "question": "Najważniejsza idea lekcji „Docker Compose dla środowisk testowych” to:",
        "options": [
          "Środowisko testowe musi być powtarzalne, obserwowalne i bezpiecznie konfigurowane",
          "Testy powinny zależeć od ręcznej konfiguracji",
          "Sekrety można logować",
          "Healthchecki są zbędne"
        ],
        "correctAnswer": 0,
        "explanation": "Powtarzalność i bezpieczeństwo środowiska decydują o wiarygodności testów."
      }
    ],
    "references": [
      {
        "title": "The Linux Command Line",
        "url": "https://linuxcommand.org/tlcl.php",
        "description": "Przystępne wprowadzenie do pracy w terminalu Linux."
      },
      {
        "title": "Docker Compose Documentation",
        "url": "https://docs.docker.com/compose/",
        "description": "Dokumentacja uruchamiania wielokontenerowych środowisk lokalnych i testowych."
      },
      {
        "title": "Kubernetes Documentation",
        "url": "https://kubernetes.io/docs/home/",
        "description": "Oficjalna dokumentacja Kubernetes."
      },
      {
        "title": "Mozilla MDN - HTTP",
        "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP",
        "description": "Rzetelne źródło wiedzy o HTTP, nagłówkach, ciasteczka, CORS i TLS."
      }
    ],
    "tipsAndTricks": [
      "Środowisko testowe jest częścią produktu testowego — musi być wersjonowane, opisane i odtwarzalne.",
      "Każda komenda diagnostyczna powinna prowadzić do hipotezy: co sprawdzam i jaki wynik potwierdzi problem?",
      "Sekrety nigdy nie powinny trafiać do repozytorium ani do logów testowych.",
      "Feature flagi testuj jak kontrakt: wariant włączony, wyłączony, rollout częściowy i rollback."
    ],
    "commonMistakes": [
      {
        "mistake": "Ręczna konfiguracja środowiska bez dokumentacji",
        "solution": "Automatyzuj setup przez skrypty, Docker Compose lub manifesty i opisuj wymagane zmienne."
      },
      {
        "mistake": "Debugowanie sieci bez podstaw HTTP/DNS/TLS",
        "solution": "Używaj curl, dig/nslookup, nagłówków i logów proxy, aby rozdzielać warstwy problemu."
      },
      {
        "mistake": "Sekrety w plikach konfiguracyjnych",
        "solution": "Korzystaj z secret managera, zmiennych środowiskowych i bezpiecznej redakcji logów."
      },
      {
        "mistake": "Brak healthchecków usług w testach",
        "solution": "Czekaj na gotowość zależności przez healthcheck, nie przez arbitralny sleep."
      }
    ]
  }
};
