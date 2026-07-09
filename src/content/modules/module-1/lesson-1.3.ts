import type { Lesson } from '../../../renderer/types';
import theory1_3 from './lesson-1.3.md?raw';

export const lesson1_3: Lesson = {
  "id": "1.3",
  "moduleId": 1,
  "title": "Struktura projektu Playwright",
  "description": "Profesjonalna organizacja katalogów, konwencje nazewnictwa, testy, fixtures, page objects, dane i artefakty.",
  "order": 3,
  "difficulty": "beginner",
  "tags": [
    "project-structure",
    "fixtures",
    "page-objects",
    "naming",
    "artefakty"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz zaprojektować czytelną strukturę projektu Playwright, oddzielić testy od helperów i danych oraz przygotować repozytorium do pracy zespołowej i CI.",
    "theory": theory1_3,
    "codeExamples": [
      "tests/\n  e2e/\n    checkout.spec.ts\n    login.spec.ts\n  api/\n    orders.api.spec.ts\nsrc/\n  pages/\n    LoginPage.ts\n    CheckoutPage.ts\n  clients/\n    OrdersClient.ts\n  builders/\n    userBuilder.ts\n  fixtures/\n    test.ts\n  config/\n    env.ts\n",
      "# .gitignore\nnode_modules/\nplaywright-report/\ntest-results/\n.env\n.env.*\n"
    ],
    "exercises": [
      {
        "id": "ex-1-3-1",
        "title": "Notatka koncepcyjna",
        "description": "Wyjaśnij własnymi słowami temat „Struktura projektu Playwright” i wskaż, jakie ryzyko rozwiązuje w projekcie testowym."
      },
      {
        "id": "ex-1-3-2",
        "title": "Minimalny przykład",
        "description": "Przygotuj najprostszy działający przykład kodu lub konfiguracji i opisz każdy jego fragment komentarzem."
      },
      {
        "id": "ex-1-3-3",
        "title": "Wariant profesjonalny",
        "description": "Rozbuduj przykład o diagnostykę, czytelne nazwy, obsługę konfiguracji albo stabilne lokatory."
      },
      {
        "id": "ex-1-3-4",
        "title": "Antywzorzec",
        "description": "Zapisz przykład błędnego podejścia do tego tematu i wyjaśnij, dlaczego będzie problematyczny w CI."
      },
      {
        "id": "ex-1-3-5",
        "title": "Checklist review",
        "description": "Ułóż krótką checklistę code review dla tego zagadnienia."
      },
      {
        "id": "ex-1-3-6",
        "title": "Połączenie z praktyką",
        "description": "Wskaż, jak ten temat wpływa na stabilność, wydajność albo diagnostykę testów w realnym projekcie."
      }
    ],
    "quiz": [
      {
        "id": "q1-3-1",
        "question": "Jaki jest najważniejszy cel lekcji „Struktura projektu Playwright”?",
        "options": [
          "Zrozumienie fundamentu, na którym będą budowane stabilne testy",
          "Zapamiętanie przypadkowej komendy",
          "Pominięcie konfiguracji",
          "Pisanie testów bez asercji"
        ],
        "correctAnswer": 0,
        "explanation": "Początkowe lekcje budują pojęcia, które decydują o jakości całego frameworka testowego."
      },
      {
        "id": "q1-3-2",
        "question": "Dlaczego projekt testowy powinien mieć jawne skrypty npm?",
        "options": [
          "Bo skrypty dokumentują sposób uruchamiania i ułatwiają CI",
          "Bo są wymagane do działania HTML",
          "Bo zastępują wszystkie testy",
          "Bo ukrywają zależności"
        ],
        "correctAnswer": 0,
        "explanation": "Czytelne skrypty zmniejszają próg wejścia i ograniczają różnice między lokalnym uruchomieniem a CI."
      },
      {
        "id": "q1-3-3",
        "question": "Co jest lepsze niż stały timeout w teście?",
        "options": [
          "Oczekiwanie na znaczący stan strony, API albo procesu",
          "Dłuższy timeout",
          "Losowy sleep",
          "Brak asercji"
        ],
        "correctAnswer": 0,
        "explanation": "Stabilne testy czekają na warunek, który ma znaczenie dla scenariusza."
      },
      {
        "id": "q1-3-4",
        "question": "Po co od początku włączać diagnostykę?",
        "options": [
          "Aby awaria w CI prowadziła do przyczyny, a nie tylko do komunikatu o błędzie",
          "Aby test był wolniejszy",
          "Aby ukryć błędy",
          "Aby zastąpić review"
        ],
        "correctAnswer": 0,
        "explanation": "Trace, screenshoty i czytelne kroki skracają czas diagnozy."
      },
      {
        "id": "q1-3-5",
        "question": "Co powinno znaleźć się w pierwszym review testu Playwright?",
        "options": [
          "Cel testu, asercje, lokatory, dane, diagnostyka i konfiguracja",
          "Wyłącznie długość pliku",
          "Kolor terminala",
          "Tylko liczba kliknięć"
        ],
        "correctAnswer": 0,
        "explanation": "Review testu powinno oceniać utrzymywalność i wartość diagnostyczną."
      },
      {
        "id": "q1-3-6",
        "question": "Dlaczego TypeScript jest przydatny od początku?",
        "options": [
          "Pomaga wykrywać błędy kontraktów i danych przed uruchomieniem testu",
          "Zastępuje przeglądarkę",
          "Usuwa potrzebę asercji",
          "Działa tylko z CSS"
        ],
        "correctAnswer": 0,
        "explanation": "Typy zwiększają bezpieczeństwo kodu testowego i dokumentują oczekiwane struktury."
      },
      {
        "id": "q1-3-7",
        "question": "Co oznacza, że Playwright ma auto-waiting?",
        "options": [
          "Wiele akcji i asercji automatycznie czeka na odpowiednie warunki elementu",
          "Playwright zna wszystkie procesy backendowe",
          "Nie trzeba pisać testów",
          "Każdy sleep jest bezpieczny"
        ],
        "correctAnswer": 0,
        "explanation": "Auto-waiting pomaga przy interfejs użytkownika, ale nie zastępuje oczekiwania na procesy domenowe."
      },
      {
        "id": "q1-3-8",
        "question": "Jaki jest dobry nawyk przy tworzeniu pierwszych testów?",
        "options": [
          "Nazywać testy językiem zachowania użytkownika i dodawać jasne asercje",
          "Używać wyłącznie XPath",
          "Pomijać expect",
          "Commitować node_modules"
        ],
        "correctAnswer": 0,
        "explanation": "Czytelne nazwy i asercje sprawiają, że testy są zrozumiałe dla zespołu."
      }
    ],
    "references": [
      {
        "title": "Playwright Documentation",
        "url": "https://playwright.dev/docs/intro",
        "description": "Oficjalna dokumentacja Playwright: instalacja, runner, lokatory i dobre praktyki."
      },
      {
        "title": "Playwright Best Practices",
        "url": "https://playwright.dev/docs/best-practices",
        "description": "Oficjalne zalecenia dotyczące stabilnych i czytelnych testów."
      },
      {
        "title": "TypeScript Handbook",
        "url": "https://www.typescriptlang.org/docs/",
        "description": "Podstawy języka TypeScript używanego w profesjonalnych projektach Playwright."
      },
      {
        "title": "Node.js Documentation",
        "url": "https://nodejs.org/docs/latest/api/",
        "description": "Dokumentacja runtime’u Node.js, na którym opiera się ekosystem narzędzi testowych."
      }
    ],
    "tipsAndTricks": [
      "Już od pierwszego dnia traktuj projekt testowy jak kod produkcyjny: z wersjonowaniem, review i jasnymi skryptami.",
      "Nie ucz się Playwrighta przez zapamiętywanie metod. Ucz się przez rozumienie problemów: synchronizacja, izolacja danych, diagnostyka i czytelność.",
      "Każdy test powinien odpowiadać na pytanie: jakie ryzyko zmniejszam i skąd będę wiedzieć, co zawiodło?",
      "Konfigurację zapisuj jawnie; domyślne wartości są wygodne, ale w zespole muszą być świadome."
    ],
    "commonMistakes": [
      {
        "mistake": "Rozpoczynanie od przypadkowego kopiowania testów",
        "solution": "Najpierw zrozum strukturę testu, konfigurację runnera i mechanizm auto-waiting."
      },
      {
        "mistake": "Brak deterministycznego środowiska",
        "solution": "Ustal wersję Node.js, zależności, skrypty npm i wymagane zmienne środowiskowe."
      },
      {
        "mistake": "Pierwsze testy bez diagnostyki",
        "solution": "Od początku używaj trace, screenshotów na awarii i czytelnych nazw testów."
      },
      {
        "mistake": "Traktowanie konfiguracji jako magii",
        "solution": "Przejdź przez playwright.config.ts opcja po opcji i zapisz, po co jej używasz."
      }
    ]
  }
};
