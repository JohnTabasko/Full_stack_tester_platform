import type { Lesson } from "../../../renderer/types";
import theory17_2 from './lesson-17.2.md?raw';

export const lesson17_2: Lesson = {
  "id": "17.2",
  "moduleId": 17,
  "title": "Rodzaje testów i piramida testów",
  "description": "Rodzaje testów, piramida testów, testy jednostkowe, integracyjne, API, kontraktowe, E2E, smoke/sanity/regresja i dobór poziomu do ryzyka.",
  "order": 2,
  "difficulty": "beginner",
  "tags": [
    "test-pyramid",
    "unit-testing",
    "integration-testing",
    "contract-testing",
    "e2e",
    "regression"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz odróżnić najważniejsze rodzaje testów, dobrać właściwy poziom testu do ryzyka oraz wyjaśnić, dlaczego piramida testów jest modelem ekonomii informacji, a nie sztywnym przepisem.",
    "theory": theory17_2,
    "codeExamples": [
      "// Przykład: ta sama funkcjonalność na różnych poziomach testów.\n\n// 1. Unit: reguła rabatu\nexport function calculateDiscount(total: number): number {\n  return total >= 500 ? total * 0.1 : 0;\n}\n\n// 2. API: endpoint koszyka\n// await request.post('/api/cart/apply-coupon', { data: { code: 'PROMO10' } });\n\n// 3. E2E: użytkownik widzi obniżoną cenę w checkout\n// await expect(page.getByTestId('order-total')).toContainText('450,00 zł');\n",
      "type TestDecision = {\n  risk: string;\n  preferredLevel: 'unit' | 'integration' | 'contract' | 'api' | 'e2e' | 'exploratory';\n  reason: string;\n};\n\nconst checkoutDecisions: TestDecision[] = [\n  {\n    risk: 'Błędne naliczenie podatku',\n    preferredLevel: 'unit',\n    reason: 'Reguła obliczeniowa jest deterministyczna i tania do sprawdzenia bez interfejs użytkownika.',\n  },\n  {\n    risk: 'Brak możliwości złożenia zamówienia przez użytkownika',\n    preferredLevel: 'e2e',\n    reason: 'To krytyczny przepływ biznesowy obejmujący wiele warstw systemu.',\n  },\n];\n"
    ],
    "exercises": [
      {
        "id": "ex-17-2-1",
        "title": "Rozkład testów dla funkcji",
        "description": "Wybierz funkcję, np. reset hasła, i rozpisz testy na poziomach unit, integration, API, E2E i exploratory."
      },
      {
        "id": "ex-17-2-2",
        "title": "Smoke suite",
        "description": "Zaprojektuj zestaw pięciu testów smoke dla aplikacji e-commerce. Uzasadnij, dlaczego każdy z nich jest krytyczny."
      },
      {
        "id": "ex-17-2-3",
        "title": "Redukcja E2E",
        "description": "Weź listę dziesięciu testów E2E i zaproponuj, które można przenieść na niższy poziom."
      },
      {
        "id": "ex-17-2-4",
        "title": "Cel kontra poziom",
        "description": "Dla pięciu przykładów określ osobno poziom techniczny testu i cel jego uruchomienia."
      },
      {
        "id": "ex-17-2-5",
        "title": "Kontrakt zamiast E2E",
        "description": "Opisz sytuację, w której test kontraktowy daje lepszą informację niż test przez interfejs użytkownika."
      },
      {
        "id": "ex-17-2-6",
        "title": "Strategia regresji",
        "description": "Zaprojektuj podział regresji na testy przed mergem, nocne i przed wydaniem."
      }
    ],
    "quiz": [
      {
        "id": "q17-2-1",
        "question": "Co najlepiej opisuje piramidę testów?",
        "options": [
          "Sztywny nakaz liczby testów",
          "Model ekonomii informacji i kosztu utrzymania testów",
          "Lista narzędzi testowych",
          "Zasada, że E2E są zawsze najważniejsze"
        ],
        "correctAnswer": 1,
        "explanation": "Piramida pomaga rozkładać testy tak, aby szybkie i precyzyjne kontrole były możliwie nisko."
      },
      {
        "id": "q17-2-2",
        "question": "Który przypadek najlepiej pasuje do testu jednostkowego?",
        "options": [
          "Pełny zakup z płatnością",
          "Obliczenie rabatu dla wartości koszyka",
          "Sprawdzenie działania wszystkich mikroserwisów",
          "Test dostępności całej aplikacji"
        ],
        "correctAnswer": 1,
        "explanation": "Reguły obliczeniowe są zwykle idealnymi kandydatami na testy jednostkowe."
      },
      {
        "id": "q17-2-3",
        "question": "Czym różni się smoke test od testu E2E?",
        "options": [
          "Smoke opisuje cel szybkiej kontroli, E2E poziom techniczny testu",
          "To dokładnie to samo",
          "Smoke zawsze musi być manualny",
          "E2E nigdy nie może być smoke testem"
        ],
        "correctAnswer": 0,
        "explanation": "Smoke suite może zawierać testy E2E, API lub inne — nazwa opisuje cel uruchomienia."
      },
      {
        "id": "q17-2-4",
        "question": "Dlaczego nie warto wszystkiego testować przez interfejs użytkownika?",
        "options": [
          "Bo interfejs użytkownika nigdy nie ma błędów",
          "Bo testy interfejs użytkownika są zwykle wolniejsze, droższe i mniej precyzyjne diagnostycznie",
          "Bo Playwright nie obsługuje interfejs użytkownika",
          "Bo użytkownicy nie korzystają z interfejs użytkownika"
        ],
        "correctAnswer": 1,
        "explanation": "Testy przez interfejs użytkownika są potrzebne, lecz powinny chronić przede wszystkim krytyczne przepływy."
      },
      {
        "id": "q17-2-5",
        "question": "Jaki problem rozwiązują testy kontraktowe?",
        "options": [
          "Sprawdzają wygląd przycisków",
          "Chronią zgodność oczekiwań między konsumentem i dostawcą API",
          "Zastępują monitoring",
          "Służą tylko do testowania baz danych"
        ],
        "correctAnswer": 1,
        "explanation": "Testy kontraktowe wykrywają niezgodności interfejsów usług przed pełną integracją."
      },
      {
        "id": "q17-2-6",
        "question": "Kiedy sanity test jest użyteczny?",
        "options": [
          "Po konkretnej poprawce, aby szybko sprawdzić wąski obszar",
          "Tylko raz w roku",
          "Wyłącznie dla testów wydajnościowych",
          "Jako pełna regresja całego systemu"
        ],
        "correctAnswer": 0,
        "explanation": "Sanity test daje szybką informację, czy konkretna zmiana zachowuje się rozsądnie."
      },
      {
        "id": "q17-2-7",
        "question": "Co jest główną zaletą testów integracyjnych?",
        "options": [
          "Nie wymagają żadnego środowiska",
          "Wykrywają błędy na granicach komponentów",
          "Zawsze są szybsze od unit testów",
          "Nie potrzebują danych"
        ],
        "correctAnswer": 1,
        "explanation": "Integracja często psuje się na granicach: formaty, konfiguracja, transakcje, zależności."
      },
      {
        "id": "q17-2-8",
        "question": "Jak wybrać poziom testu?",
        "options": [
          "Zawsze najwyższy możliwy",
          "Najtańszy poziom, który daje wiarygodną informację o ryzyku",
          "Losowo",
          "Tylko zgodnie z preferencją testera"
        ],
        "correctAnswer": 1,
        "explanation": "Dobór poziomu testu jest decyzją ekonomiczną i diagnostyczną."
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
        "title": "ISTQB CTFL",
        "url": "https://www.istqb.org/certifications/certified-tester-foundation-level",
        "description": "Fundamenty rodzajów testów i strategii testowania."
      },
      {
        "title": "ISO/IEC/IEEE 29119",
        "url": "https://www.iso.org/standard/81291.html",
        "description": "Standardy procesu testowania oprogramowania."
      },
      {
        "title": "Pact",
        "url": "https://docs.pact.io/",
        "description": "Testy kontraktowe jako tańsza alternatywa dla części integracji E2E."
      }
    ],
    "tipsAndTricks": [
      "Zawsze opieraj architekturę testów na zasadach SOLID, unikając przedwczesnej abstrakcji zgodnie z zasadą WET (Write Everything Twice) z podręczników 2026.",
      
      "Jeżeli test E2E sprawdza tylko regułę obliczeniową, prawdopodobnie znajduje się za wysoko.",
      "Smoke suite powinna być krótka, stabilna i bezwzględnie związana z gotowością systemu do dalszych testów.",
      "Testy kontraktowe są szczególnie cenne tam, gdzie wiele zespołów rozwija usługi niezależnie.",
      "Przegląd regresji powinien obejmować usuwanie testów, które nie dostarczają już istotnej informacji."
    ],
    "commonMistakes": [
      {
        "mistake": "Mylenie celu testu z poziomem testu",
        "solution": "Oddziel nazwy typu smoke/regression od poziomów unit/API/E2E."
      },
      {
        "mistake": "Nadmierna liczba E2E",
        "solution": "Przenieś walidacje reguł, kontraktów i statusów na niższe poziomy."
      },
      {
        "mistake": "Brak testów negatywnych w API",
        "solution": "Sprawdzaj autoryzację, walidację wejścia i błędne stany, nie tylko happy path."
      },
      {
        "mistake": "Regresja jako niekontrolowany worek testów",
        "solution": "Podziel regresję według ryzyka, częstotliwości i czasu wykonania."
      }
    ]
  }
};
