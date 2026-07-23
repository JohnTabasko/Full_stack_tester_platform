import type { Lesson } from '../../../renderer/types';
import theory5_2 from './lesson-5.2.md?raw';

export const lesson5_2: Lesson = {
  "id": "5.2",
  "moduleId": 5,
  "title": "Fikstury — omówienie szczegółowe",
  "description": "Wstrzykiwanie zależności w Playwright: własne fikstury, zależności między fiksturami, automatyczna diagnostyka za pomocą testInfo.attach, cykl życia oraz zakres testu i workera.",
  "order": 2,
  "difficulty": "intermediate",
  "tags": [
    "fixtures",
    "dependency-injection",
    "worker-fixtures",
    "page-objects",
    "diagnostics"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz projektować zaawansowane fikstury jako mechanizm wstrzykiwania zależności, rozumiesz graf zależności fikstur, umiesz tworzyć automatyczne fikstury diagnostyczne z załącznikami oraz efektywnie dobierać zakres testowy i workerowy.",
    "theory": theory5_2,
    "codeExamples": [
      `// Przykład powiązanych fikstur (Książka 2 - Greffier)
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

type Fixtures = {
  loginPage: LoginPage;
  loggedInAdminPage: Page;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  loggedInAdminPage: async ({ page, loginPage }, use) => {
    await loginPage.navigate('/');
    await loginPage.login('admin@example.com', 'secret');
    await use(page);
  }
});`,
      `// Przykład automatycznej fixtury diagnostycznej (Książka 1 - Kelhini)
export const testWithDiagnostics = test.extend({
  consoleErrors: [async ({ page }, use, testInfo) => {
    const errors: string[] = [];
    page.on('console', msg => msg.type() === 'error' && errors.push(msg.text()));
    await use(errors);
    if (testInfo.status !== testInfo.expectedStatus && errors.length > 0) {
      await testInfo.attach('console-errors', {
        body: JSON.stringify(errors, null, 2),
        contentType: 'application/json'
      });
    }
  }, { auto: true }]
});`
    ],
    "exercises": [
      {
        "id": "ex-5-2-1",
        "title": "Projektowanie fixtury zalogowanego użytkownika",
        "description": "Zaimplementuj wstrzykiwanie zależności za pomocą powiązanych fixtur: stwórz fixturę \`userSessionPage\`, która pobiera stan sesji \`user.json\` zapożyczony z globalnego logowania i wstrzykuje skonfigurowany kontekst do testu."
      },
      {
        "id": "ex-5-2-2",
        "title": "Automatyczny zbieracz wolnych zapytań sieciowych",
        "description": "Napisz automatyczną fixturę (auto: true), która analizuje czas trwania zapytań API i dołącza plik JSON z powolnymi zapytaniami sieciowymi (trwającymi powyżej 1000ms) do raportu przy użyciu \`testInfo.attach()\`."
      },
      {
        "id": "ex-5-2-3",
        "title": "Izolacja danych bazodanowych per worker",
        "description": "Zaprojektuj fixturę o zakresie \`worker\`, która inicjalizuje połączenie z bazą danych i zapewnia czyszczenie tabel po zakończeniu działania wszystkich testów w tym wątku roboczym."
      }
    ],
    "quiz": [
      {
        "id": "q5-2-1",
        "question": "Które stwierdzenie najlepiej opisuje zasadę działania fixtur w Playwright?",
        "options": [
          "Są inicjalizowane leniwie (lazy loading) - uruchamiają się tylko wtedy, gdy test zażąda ich w parametrach",
          "Zawsze uruchamiają się wszystkie zadeklarowane fixtury dla każdego testu w projekcie",
          "Są przeznaczone wyłącznie do otwierania i zamykania okna przeglądarki",
          "Można ich używać wyłącznie w pliku konfiguracyjnym"
        ],
        "correctAnswer": 0,
        "explanation": "Leniwa inicjalizacja (lazy evaluation) to kluczowa zaleta fixtur - jeśli test nie potrzebuje danej fixtury, nie jest marnowany czas na jej setup."
      },
      {
        "id": "q5-2-2",
        "question": "W jaki sposób fixtura automatyczna (auto: true) różni się od standardowej?",
        "options": [
          "Uruchamia się dla każdego testu, nawet jeśli nie została w nim zadeklarowana jako parametr",
          "Działa wyłącznie na poziomie całego pakietu (global setup)",
          "Nie posiada fazy sprzątania (teardown)",
          "Zastępuje wbudowaną fixturę page"
        ],
        "correctAnswer": 0,
        "explanation": "Automatyczne fixtury (auto fixtures) są wywoływane przez runner automatycznie dla każdego testu, co jest doskonałe do globalnej diagnostyki lub logowania."
      },
      {
        "id": "q5-2-3",
        "question": "Kiedy należy zastosować zakres worker (scope: 'worker') dla własnej fixtury?",
        "options": [
          "Gdy zasób jest ciężki i kosztowny w inicjalizacji, np. połączenie z bazą danych lub kontener Docker Compose",
          "Dla każdego standardowego obiektu Page Object",
          "Zawsze, gdy chcemy uruchomić testy na urządzeniach mobilnych",
          "Gdy chcemy całkowicie odizolować od siebie ciasteczka w każdym teście"
        ],
        "correctAnswer": 0,
        "explanation": "Scope worker współdzieli zasób między wieloma testami uruchamianymi w tym samym wątku, co oszczędza cenny czas na ciężki setup bazy lub środowiska."
      },
      {
        "id": "q5-2-4",
        "question": "Jak uzyskać dostęp do cyklu życia teardown (sprzątania) wewnątrz definicji fixtury?",
        "options": [
          "Kod umieszczony po słowie kluczowym use() działa jako teardown",
          "Należy jawnie zadeklarować funkcję afterEach() wewnątrz tablicy",
          "Należy użyć metody testInfo.cleanup()",
          "Playwright nie wspiera fazy sprzątania wewnątrz fixtur"
        ],
        "correctAnswer": 0,
        "explanation": "Wszystko, co znajdzie się przed use() to faza Setup (Arrange). Wywołanie use() przekazuje kontrolę do testu, a kod umieszczony po nim to faza Teardown (sprzątanie)."
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
        "title": "Practical Playwright Test (Jean-François Greffier, 2026)",
        "url": "https://doi.org/10.1007/979-8-8688-2160-8",
        "description": "Chapter 7: Fixtures Deep Dive - wstrzykiwanie zależności i czysty kod."
      },
      {
        "title": "Hands-On Automated Testing with Playwright (Packt, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Chapter 5: Crafting Scalable Tests with the Fixture System - cykl życia i integracja."
      }
    ],
    "tipsAndTricks": [
      "Zawsze opieraj architekturę testów na zasadach SOLID, unikając przedwczesnej abstrakcji zgodnie z zasadą WET (Write Everything Twice) z podręczników 2026.",
      
      "Wykorzystaj fixtury zależne, aby ukryć procesy logowania (np. zalogowanie jako admin, zalogowanie jako klient). Dzięki temu testy stają się deklaratywne i skupione na scenariuszu.",
      "Dołączaj pliki zrzutów i logów sieciowych za pomocą testInfo.attach() podczas błędu, co drastycznie skróci debugowanie w CI.",
      "Zawsze staraj się sprzątać zasoby w fazie teardown fixtury (po wywołaniu use), aby zapobiec wyciekom pamięci oraz zanieczyszczeniu bazy danych."
    ],
    "commonMistakes": [
      {
        "mistake": "Przechowywanie stanu testu w zmiennych globalnych o zasięgu pliku (let user)",
        "solution": "Używaj otypowanych parametrów zwracanych bezpośrednio przez fixturę w sygnaturze testu."
      },
      {
        "mistake": "Inicjalizowanie bazy danych w beforeEach na poziomie całego pliku",
        "solution": "Zastąp to fixturą o zakresie worker (scope: 'worker') w celu współdzielenia puli połączeń i znacznego przyspieszenia testów."
      }
    ]
  }
};
