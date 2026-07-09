import type { Lesson } from "../../../renderer/types";
import theory25_4 from './lesson-25.4.md?raw';

export const lesson25_4: Lesson = {
  "id": "25.4",
  "moduleId": 25,
  "title": "Kubernetes, sekrety i flagi funkcji",
  "description": "Kubernetes dla testera: Pod, Deployment, Service, Ingress, ConfigMap, Secret, probes, kubectl diagnostics, feature flags i environments.",
  "order": 4,
  "difficulty": "advanced",
  "tags": [
    "kubernetes",
    "sekrety",
    "feature-flags",
    "rollout",
    "ephemeral-environments"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji rozumiesz podstawowe pojęcia Kubernetes, potrafisz czytać manifesty i status wdrożenia, znasz zasady bezpiecznej obsługi sekretów oraz rozumiesz testowanie feature flag i rolloutów.",
    "theory": theory25_4,
    "codeExamples": [
      "# Przydatne komendy diagnostyczne\nkubectl get pods -n staging\nkubectl describe pod orders-api-abc123 -n staging\nkubectl logs deploy/orders-api -n staging --tail=100\nkubectl rollout status deploy/orders-api -n staging\n",
      "// Test zapisuje stan flagi w raporcie.\nconst flags = await featureFlagsClient.getAllForUser(testUser.id);\nawait testInfo.attach('feature-flags.json', {\n  body: JSON.stringify(flags, null, 2),\n  contentType: 'application/json',\n});\n"
    ],
    "exercises": [
      {
        "id": "ex-25-4-1",
        "title": "Procedura diagnostyczna",
        "description": "Dla tematu „Kubernetes, sekrety i flagi funkcji” zapisz procedurę: komendy, oczekiwane wyniki i możliwe wnioski."
      },
      {
        "id": "ex-25-4-2",
        "title": "Automatyzacja setupu",
        "description": "Zaprojektuj skrypt lub konfigurację uruchamiającą środowisko testowe od zera."
      },
      {
        "id": "ex-25-4-3",
        "title": "Healthcheck",
        "description": "Dodaj mechanizm czekania na gotowość usługi bez użycia stałego timeoutu."
      },
      {
        "id": "ex-25-4-4",
        "title": "Bezpieczeństwo konfiguracji",
        "description": "Wskaż, które dane są sekretami i jak powinny być przekazywane w CI."
      },
      {
        "id": "ex-25-4-5",
        "title": "Awaria zależności",
        "description": "Opisz, jak zasymulujesz niedostępność usługi i jak sprawdzisz zachowanie aplikacji."
      },
      {
        "id": "ex-25-4-6",
        "title": "Dokumentacja operacyjna",
        "description": "Napisz krótki runbook dla testera uruchamiającego środowisko lokalnie."
      }
    ],
    "quiz": [
      {
        "id": "q25-4-1",
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
        "id": "q25-4-2",
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
        "id": "q25-4-3",
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
        "id": "q25-4-4",
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
        "id": "q25-4-5",
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
        "id": "q25-4-6",
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
        "id": "q25-4-7",
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
        "id": "q25-4-8",
        "question": "Najważniejsza idea lekcji „Kubernetes, sekrety i flagi funkcji” to:",
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
        "title": "Kubernetes Docs",
        "url": "https://kubernetes.io/docs/home/",
        "description": "Oficjalna dokumentacja Kubernetes."
      },
      {
        "title": "kubectl Quick Reference",
        "url": "https://kubernetes.io/docs/reference/kubectl/quick-reference/",
        "description": "Podstawowe komendy diagnostyczne kubectl."
      },
      {
        "title": "Kubernetes Secrets",
        "url": "https://kubernetes.io/docs/concepts/configuration/secret/",
        "description": "Obsługa sekretów w Kubernetes."
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
