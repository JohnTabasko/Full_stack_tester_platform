import type { Lesson } from "../../../renderer/types";
import theory16_2 from './lesson-16.2.md?raw';

export const lesson16_2: Lesson = {
  "id": "16.2",
  "moduleId": 16,
  "title": "Testowanie poczty elektronicznej",
  "description": "Testowanie poczty: MailHog/Mailpit, polling skrzynki, linki aktywacyjne, reset hasła, izolacja skrzynek i diagnostyka email.",
  "order": 2,
  "difficulty": "advanced",
  "tags": [
    "advanced-testing",
    "integrations",
    "playwright",
    "reliability"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz projektować testy dla obszaru „Testowanie poczty elektronicznej” z kontrolą środowiska, scenariuszami awarii, retry, idempotencją i artefaktami diagnostycznymi.",
    "theory": theory16_2,
    "codeExamples": [
      "const messages = await mailhogApi.search('user@example.test');\nconst resetEmail = messages.find(m => m.subject.includes('Reset hasła'));\nexpect(resetEmail).toBeTruthy();\n\nconst resetLink = extractLink(resetEmail.html, /reset-password/);\nawait page.goto(resetLink);\nawait expect(page.getByRole('heading', { name: 'Ustaw nowe hasło' })).toBeVisible();\n",
      "// Sprawdź, że e-mail nie zawiera sekretów.\nexpect(email.text).not.toContain('password');\nexpect(email.text).not.toContain('Bearer ');\n"
    ],
    "exercises": [
      {
        "id": "ex-16-2-1",
        "title": "Środowisko kontrolowane",
        "description": "Dla tematu „Testowanie poczty elektronicznej” zaprojektuj środowisko testowe: zależności, healthchecki, dane i cleanup."
      },
      {
        "id": "ex-16-2-2",
        "title": "Happy path i failure path",
        "description": "Napisz scenariusz sukcesu oraz scenariusz błędu/timeoutu/niedostępności zależności."
      },
      {
        "id": "ex-16-2-3",
        "title": "Idempotencja i retry",
        "description": "Sprawdź, co stanie się po ponowieniu tej samej operacji lub komunikatu."
      },
      {
        "id": "ex-16-2-4",
        "title": "Artefakty diagnostyczne",
        "description": "Wskaż logi, requesty, wiadomości, screenshoty lub trace potrzebne do diagnozy."
      },
      {
        "id": "ex-16-2-5",
        "title": "CI strategy",
        "description": "Zaproponuj, które testy uruchamiać w PR, nightly i release."
      },
      {
        "id": "ex-16-2-6",
        "title": "Granice testu",
        "description": "Określ, co testować unit/component/API/E2E, aby nie tworzyć zbyt ciężkiego scenariusza."
      }
    ],
    "quiz": [
      {
        "id": "q16-2-1",
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
        "id": "q16-2-2",
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
        "id": "q16-2-3",
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
        "id": "q16-2-4",
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
        "id": "q16-2-5",
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
        "id": "q16-2-6",
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
        "id": "q16-2-7",
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
        "id": "q16-2-8",
        "question": "Najważniejsza zasada lekcji „Testowanie poczty elektronicznej” to:",
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
        "title": "API testing",
        "url": "https://playwright.dev/docs/api-testing",
        "description": "Odczyt skrzynki testowej przez API."
      },
      {
        "title": "Assertions poll",
        "url": "https://playwright.dev/docs/test-assertions",
        "description": "expect.poll zamiast sleep."
      },
      {
        "title": "Docker",
        "url": "https://playwright.dev/docs/docker",
        "description": "Uruchamianie zależności testowych w kontenerach."
      }
    ],
    "tipsAndTricks": [
      "Zawsze opieraj architekturę testów na zasadach SOLID, unikając przedwczesnej abstrakcji zgodnie z zasadą WET (Write Everything Twice) z podręczników 2026.",
      
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
