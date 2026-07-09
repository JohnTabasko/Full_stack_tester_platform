import type { Lesson } from "../../../renderer/types";
import theory18_2 from './lesson-18.2.md?raw';

export const lesson18_2: Lesson = {
  "id": "18.2",
  "moduleId": 18,
  "title": "Async/await, obietnice i obsługa błędów",
  "description": "Asynchroniczność w testach, Promise, await, warunki wyścigu, timeouty, ponowienia, równoległość i poprawne raportowanie błędów.",
  "order": 2,
  "difficulty": "beginner",
  "tags": [
    "async",
    "await",
    "promise",
    "error-handling",
    "race-condition",
    "timeouts"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji rozumiesz model asynchroniczny JavaScriptu, potrafisz unikać typowych warunki wyścigu w testach Playwright oraz projektować czytelną obsługę błędów i ponowienia bez ukrywania defektów.",
    "theory": theory18_2,
    "codeExamples": [
      "import { test, expect } from '@playwright/test';\n\ntest('pobranie faktury czeka na response wywołany kliknięciem', async ({ page }) => {\n  await page.goto('/invoices/123');\n\n  const [response] = await Promise.all([\n    page.waitForResponse((res) => res.url().includes('/invoice.pdf') && res.status() === 200),\n    page.getByRole('button', { name: 'Pobierz fakturę' }).click(),\n  ]);\n\n  expect(response.headers()['content-type']).toContain('application/pdf');\n});\n",
      "import type { Page, TestInfo } from '@playwright/test';\n\nasync function attachDiagnosticsOnFailure<T>(\n  page: Page,\n  testInfo: TestInfo,\n  action: () => Promise<T>,\n): Promise<T> {\n  try {\n    return await action();\n  } catch (error) {\n    await testInfo.attach('page-url', { body: page.url(), contentType: 'text/plain' });\n    await testInfo.attach('screenshot', { body: await page.screenshot(), contentType: 'image/png' });\n    throw error;\n  }\n}\n"
    ],
    "exercises": [
      {
        "id": "ex-18-2-1",
        "title": "Brakujący await",
        "description": "Znajdź w przykładowym teście trzy miejsca, w których brak await może spowodować race condition."
      },
      {
        "id": "ex-18-2-2",
        "title": "Promise.all",
        "description": "Przepisz test pobierania pliku tak, aby czekanie na download/response rozpoczęło się przed kliknięciem."
      },
      {
        "id": "ex-18-2-3",
        "title": "Zastąp timeout",
        "description": "Usuń waitForTimeout z testu i zastąp go oczekiwaniem na konkretny stan interfejs użytkownika lub API."
      },
      {
        "id": "ex-18-2-4",
        "title": "Diagnostyka w catch",
        "description": "Napisz wrapper, który w razie błędu dodaje screenshot i kontekst, a następnie ponownie rzuca błąd."
      },
      {
        "id": "ex-18-2-5",
        "title": "Analiza ponowienia",
        "description": "Opisz trzy sytuacje, w których ponowienia jest uzasadnione, i trzy, w których maskuje defekt."
      },
      {
        "id": "ex-18-2-6",
        "title": "Oczekiwanie na proces async",
        "description": "Zaprojektuj test, który po akcji interfejs użytkownika czeka na stan w API albo bazie zamiast na arbitralny czas."
      }
    ],
    "quiz": [
      {
        "id": "q18-2-1",
        "question": "Co oznacza brak await przy operacji Playwrighta?",
        "options": [
          "Operacja zawsze wykona się szybciej",
          "Test może przejść dalej przed zakończeniem operacji",
          "Playwright automatycznie zatrzyma cały test",
          "Nie ma to znaczenia"
        ],
        "correctAnswer": 1,
        "explanation": "Bez await test nie czeka na zakończenie Promise."
      },
      {
        "id": "q18-2-2",
        "question": "Kiedy Promise.all jest szczególnie przydatne?",
        "options": [
          "Gdy czekamy na zdarzenie wywołane akcją",
          "Do dowolnego opóźnienia",
          "Zawsze zamiast await",
          "Tylko w testach unit"
        ],
        "correctAnswer": 0,
        "explanation": "Najpierw rejestrujemy oczekiwanie na zdarzenie, a równolegle wykonujemy akcję."
      },
      {
        "id": "q18-2-3",
        "question": "Dlaczego waitForTimeout jest antywzorcem?",
        "options": [
          "Bo czeka na czas, a nie na znaczący stan systemu",
          "Bo nie działa w Chromium",
          "Bo zawsze kończy test błędem",
          "Bo zastępuje asercje"
        ],
        "correctAnswer": 0,
        "explanation": "Stały czas nie gwarantuje, że system osiągnął właściwy stan."
      },
      {
        "id": "q18-2-4",
        "question": "Co powinien zrobić catch, który dodaje diagnostykę?",
        "options": [
          "Połknąć błąd",
          "Dodać kontekst i ponownie rzucić błąd",
          "Zawsze oznaczyć test jako passed",
          "Usunąć trace"
        ],
        "correctAnswer": 1,
        "explanation": "Diagnostyka ma pomóc zrozumieć awarię, nie ukrywać jej."
      },
      {
        "id": "q18-2-5",
        "question": "Kiedy ponowienia może być uzasadnione?",
        "options": [
          "Przy przejściowym problemie infrastruktury",
          "Przy każdym błędzie asercji",
          "Zamiast naprawy flaky testu",
          "Tylko lokalnie"
        ],
        "correctAnswer": 0,
        "explanation": "Retry pomaga przy przejściowych awariach, ale nie może maskować deterministycznych defektów."
      },
      {
        "id": "q18-2-6",
        "question": "Co jest najlepszym oczekiwaniem po kliknięciu 'Zapisz'?",
        "options": [
          "waitForTimeout(5000)",
          "Oczekiwanie na komunikat, response, URL albo zapisany stan",
          "Brak oczekiwania",
          "Odświeżenie strony"
        ],
        "correctAnswer": 1,
        "explanation": "Czekamy na rezultat, który ma znaczenie dla testowanego zachowania."
      },
      {
        "id": "q18-2-7",
        "question": "Czym jest race condition?",
        "options": [
          "Błędem zależnym od niekontrolowanej kolejności zdarzeń",
          "Rodzajem testu wydajności",
          "Opcją Playwright config",
          "Sposobem pisania CSS"
        ],
        "correctAnswer": 0,
        "explanation": "Race condition pojawia się, gdy kolejność zdarzeń wpływa na wynik testu."
      },
      {
        "id": "q18-2-8",
        "question": "Co oznacza auto-waiting Playwrighta?",
        "options": [
          "Playwright czeka na pewne warunki akcji i asercji",
          "Playwright zna wszystkie procesy backendowe",
          "Nie trzeba pisać asercji",
          "Testy nigdy nie będą flaky"
        ],
        "correctAnswer": 0,
        "explanation": "Auto-waiting pomaga przy interfejs użytkownika, ale nie zastępuje oczekiwania na procesy domenowe."
      }
    ],
    "references": [
      {
        "title": "TypeScript Handbook",
        "url": "https://www.typescriptlang.org/docs/",
        "description": "Oficjalny podręcznik języka TypeScript."
      },
      {
        "title": "Node.js Documentation",
        "url": "https://nodejs.org/docs/latest/api/",
        "description": "Dokumentacja środowisko uruchomieniowe’u Node.js i jego standardowych modułów."
      },
      {
        "title": "Git Documentation",
        "url": "https://git-scm.com/doc",
        "description": "Oficjalna dokumentacja systemu kontroli wersji Git."
      },
      {
        "title": "Conventional Commits",
        "url": "https://www.conventionalcommits.org/",
        "description": "Standard opisywania zmian w historii repozytorium."
      }
    ],
    "tipsAndTricks": [
      "Jeżeli masz ochotę użyć waitForTimeout, zapytaj: jaki stan naprawdę chcę zobaczyć?",
      "Czekanie na response rejestruj przed akcją, która ten response wywołuje.",
      "Retry bez trace i analizy flaky testów jest tylko odroczeniem problemu.",
      "Catch w teście powinien wzbogacać błąd, a nie go ukrywać."
    ],
    "commonMistakes": [
      {
        "mistake": "Brak await przy kliknięciu lub asercji",
        "solution": "Każdą operację zwracającą Promise świadomie awaituj albo uruchamiaj w kontrolowanym Promise.all."
      },
      {
        "mistake": "Stałe timeouty",
        "solution": "Czekaj na URL, tekst, status API, rekord w bazie albo zdarzenie domenowe."
      },
      {
        "mistake": "Retry jako maskowanie błędów",
        "solution": "Analizuj każde ponowienie i naprawiaj źródło niestabilności."
      },
      {
        "mistake": "Połykanie błędów w catch",
        "solution": "Po dodaniu diagnostyki zawsze ponownie rzuć błąd."
      }
    ]
  }
};
