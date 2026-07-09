import type { Lesson } from "../../../renderer/types";
import theory16_4 from './lesson-16.4.md?raw';

export const lesson16_4: Lesson = {
  "id": "16.4",
  "moduleId": 16,
  "title": "Testowanie komponentów w Playwright",
  "description": "Playwright Component Testing: mount, props/state, provider wrappers, accessibility, visual snapshots, design system i granice CT vs E2E.",
  "order": 4,
  "difficulty": "advanced",
  "tags": [
    "advanced-testing",
    "integrations",
    "playwright",
    "reliability"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz projektować testy dla obszaru „Testowanie komponentów w Playwright” z kontrolą środowiska, scenariuszami awarii, retry, idempotencją i artefaktami diagnostycznymi.",
    "theory": theory16_4,
    "codeExamples": [
      "import { test, expect } from '@playwright/experimental-ct-react';\nimport { LoginForm } from './LoginForm';\n\ntest('shows validation error', async ({ mount }) => {\n  const component = await mount(<LoginForm />);\n  await component.getByRole('button', { name: 'Zaloguj' }).click();\n  await expect(component.getByText('Podaj adres e-mail')).toBeVisible();\n});\n",
      "await expect(component).toHaveScreenshot('login-form-error.png');\n"
    ],
    "exercises": [
      {
        "id": "ex-16-4-1",
        "title": "Środowisko kontrolowane",
        "description": "Dla tematu „Testowanie komponentów w Playwright” zaprojektuj środowisko testowe: zależności, healthchecki, dane i cleanup."
      },
      {
        "id": "ex-16-4-2",
        "title": "Happy path i failure path",
        "description": "Napisz scenariusz sukcesu oraz scenariusz błędu/timeoutu/niedostępności zależności."
      },
      {
        "id": "ex-16-4-3",
        "title": "Idempotencja i retry",
        "description": "Sprawdź, co stanie się po ponowieniu tej samej operacji lub komunikatu."
      },
      {
        "id": "ex-16-4-4",
        "title": "Artefakty diagnostyczne",
        "description": "Wskaż logi, requesty, wiadomości, screenshoty lub trace potrzebne do diagnozy."
      },
      {
        "id": "ex-16-4-5",
        "title": "CI strategy",
        "description": "Zaproponuj, które testy uruchamiać w PR, nightly i release."
      },
      {
        "id": "ex-16-4-6",
        "title": "Granice testu",
        "description": "Określ, co testować unit/component/API/E2E, aby nie tworzyć zbyt ciężkiego scenariusza."
      }
    ],
    "quiz": [
      {
        "id": "q16-4-1",
        "question": "Co jest najważniejsze przy testowaniu zaawansowanych integracji?",
        "options": [
          "Kontrolowane środowisko, scenariusze błędów i diagnostyka",
          "Dostęp do produkcji",
          "Brak cleanupu",
          "Wyłącznie happy path"
        ],
        "correctAnswer": 0,
        "explanation": "Integracje zawodzą na granicach, dlatego wymagają kontroli warunków i dowodów."
      },
      {
        "id": "q16-4-2",
        "question": "Dlaczego healthcheck jest lepszy niż sleep?",
        "options": [
          "Sprawdza realną gotowość usługi",
          "Zawsze trwa dłużej",
          "Ukrywa błędy",
          "Nie działa w CI"
        ],
        "correctAnswer": 0,
        "explanation": "Sleep czeka na czas; healthcheck czeka na stan."
      },
      {
        "id": "q16-4-3",
        "question": "Co powinien obejmować test webhooka?",
        "options": [
          "Podpis, duplikat, retry, błędne body i efekt w systemie",
          "Tylko status 200",
          "Kolor przycisku",
          "Brak logów"
        ],
        "correctAnswer": 0,
        "explanation": "Webhook jest granicą zewnętrzną i musi być odporny na nadużycia oraz powtórzenia."
      },
      {
        "id": "q16-4-4",
        "question": "Kiedy component testing jest lepszy niż E2E?",
        "options": [
          "Gdy chcemy szybko sprawdzić warianty stanu pojedynczego komponentu",
          "Gdy testujemy płatność end-to-end",
          "Gdy potrzebujemy prawdziwej bazy",
          "Nigdy"
        ],
        "correctAnswer": 0,
        "explanation": "CT daje szybki feedback dla komponentu bez kosztu pełnego systemu."
      },
      {
        "id": "q16-4-5",
        "question": "Co oznacza circuit breaker?",
        "options": [
          "Mechanizm ograniczający wywołania do zawodzącej zależności",
          "Typ selektora",
          "Format raportu",
          "Nowy rodzaj cookie"
        ],
        "correctAnswer": 0,
        "explanation": "Circuit breaker chroni system przed kaskadową awarią zależności."
      },
      {
        "id": "q16-4-6",
        "question": "Co testować w e-mailach transakcyjnych?",
        "options": [
          "Dostarczenie, temat, treść, linki, bezpieczeństwo tokenów i brak danych wrażliwych",
          "Tylko kolor szablonu",
          "Wyłącznie SMTP port",
          "Nic"
        ],
        "correctAnswer": 0,
        "explanation": "E-mail jest częścią procesu biznesowego, np. aktywacji lub resetu hasła."
      },
      {
        "id": "q16-4-7",
        "question": "Co jest ważne przy testach real-time?",
        "options": [
          "Reconnect, kolejność, duplikaty i wielu użytkowników",
          "Tylko otwarcie strony",
          "Brak asercji",
          "Jeden sleep"
        ],
        "correctAnswer": 0,
        "explanation": "Komunikacja real-time ma ryzyka niedostępne w prostym HTTP."
      },
      {
        "id": "q16-4-8",
        "question": "Najważniejsza zasada lekcji „Testowanie komponentów w Playwright” to:",
        "options": [
          "Testuj granice integracji w kontrolowanych warunkach",
          "Ufaj zewnętrznej usłudze bez testów",
          "Nie zapisuj artefaktów",
          "Ignoruj retry"
        ],
        "correctAnswer": 0,
        "explanation": "Zaawansowane tematy są głównie o kontrolowaniu granic systemu."
      }
    ],
    "references": [
      {
        "title": "Component testing",
        "url": "https://playwright.dev/docs/test-components",
        "description": "Oficjalny przewodnik po Playwright CT."
      },
      {
        "title": "Locators",
        "url": "https://playwright.dev/docs/locators",
        "description": "Locatory dostępnościowe w CT."
      },
      {
        "title": "Visual comparisons",
        "url": "https://playwright.dev/docs/test-snapshots",
        "description": "Snapshoty komponentów."
      }
    ],
    "tipsAndTricks": [
      "Zaawansowane integracje testuj przez kontrolowane środowisko, nie przez przypadkowy dostęp do usług produkcyjnych.",
      "Każda integracja zewnętrzna wymaga scenariusza sukcesu, błędu, timeoutu, retry i idempotencji.",
      "Kontenery są świetne, jeśli mają healthchecki, deterministyczne dane i czysty cleanup.",
      "Komunikację real-time testuj przez stan końcowy i zdarzenia, nie przez arbitralne opóźnienia."
    ],
    "commonMistakes": [
      {
        "mistake": "Testy zależne od prawdziwej usługi zewnętrznej bez sandboxa",
        "solution": "Użyj sandboxa, mock servera, contract testu albo service virtualization."
      },
      {
        "mistake": "Brak healthchecków w docker-compose",
        "solution": "Czekaj na gotowość bazy, mail servera i aplikacji przez healthcheck, nie sleep."
      },
      {
        "mistake": "Testowanie WebSocket tylko przez otwarcie połączenia",
        "solution": "Sprawdź wysyłkę, odbiór, reconnect, duplikaty i zachowanie wielu użytkowników."
      },
      {
        "mistake": "Component testing traktowany jak pełne E2E",
        "solution": "Testuj komponent w izolacji, a integrację całego flow zostaw E2E/API."
      }
    ]
  }
};
