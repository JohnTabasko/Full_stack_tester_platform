import type { Lesson } from '../../../renderer/types';
import theory6_5 from './lesson-6.5.md?raw';

export const lesson6_5: Lesson = {
  "id": "6.5",
  "moduleId": 6,
  "title": "Dobre praktyki i antywzorce obiektu strony",
  "description": "SOLID we wzorcu obiektu strony, obiekt-bóg, silne sprzężenie, kruche selektory, refaktoryzacja i organizacja plików.",
  "order": 5,
  "difficulty": "intermediate",
  "tags": [
    "pom",
    "page-object",
    "architecture",
    "playwright"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz zastosować temat „Dobre praktyki i antywzorce obiektu strony” w architekturze testów Playwright, rozumiesz jego zalety, ograniczenia i typowe antywzorce.",
    "theory": theory6_5,
    "codeExamples": [
      "// Antywzorzec\nclass PanelPage {\n  async doEverything() { /* login, create order, pay, assert, cleanup */ }\n}\n\n// Lepsze: małe obiekty i jawny scenariusz.\nawait loginPage.loginAs(admin);\nawait ordersPage.open();\nawait ordersPage.expectOrderVisible(orderId);\n",
      "// Nazwa mówi, że metoda asercyjna weryfikuje stan.\nawait checkoutPage.expectPaymentSummary({ total: '120,00 zł', currency: 'PLN' });\n"
    ],
    "exercises": [
      {
        "id": "ex-6-5-1",
        "title": "Projekt klasy",
        "description": "Zaprojektuj Page Object lub komponent dla tematu „Dobre praktyki i antywzorce obiektu strony”, wskazując odpowiedzialności publiczne i prywatne."
      },
      {
        "id": "ex-6-5-2",
        "title": "Refaktor testu",
        "description": "Przepisz test używający surowych lokatorów na test korzystający z wzorzec obiektu strony/komponentów."
      },
      {
        "id": "ex-6-5-3",
        "title": "Granice asercji",
        "description": "Zdecyduj, które oczekiwania zostają w teście, a które mogą trafić do metody domenowej."
      },
      {
        "id": "ex-6-5-4",
        "title": "Kompozycja",
        "description": "Wydziel powtarzalny fragment interfejs użytkownika do komponentu i użyj go w dwóch stronach."
      },
      {
        "id": "ex-6-5-5",
        "title": "Fixture",
        "description": "Dostarcz Page Object przez fikstura Playwright i usuń ręczne `new` z testu."
      },
      {
        "id": "ex-6-5-6",
        "title": "Audyt antywzorców",
        "description": "Wskaż trzy symptomy obiekt-bóg, silne sprzężenie albo kruche selektory i zaproponuj poprawki."
      }
    ],
    "quiz": [
      {
        "id": "q6-5-1",
        "question": "Po co stosować Wzorzec obiektu strony?",
        "options": [
          "Aby oddzielić intencję testu od szczegółów interfejsu",
          "Aby ukryć wszystkie asercje",
          "Aby pisać więcej klas bez celu",
          "Aby zastąpić test runner"
        ],
        "correctAnswer": 0,
        "explanation": "wzorzec obiektu strony zwiększa utrzymywalność, gdy izoluje selektory i akcje strony."
      },
      {
        "id": "q6-5-2",
        "question": "Co jest objawem God Page Object?",
        "options": [
          "Jedna klasa obsługuje zbyt wiele niezależnych obszarów strony",
          "Ma czytelną nazwę",
          "Używa kompozycji",
          "Ma mało metod"
        ],
        "correctAnswer": 0,
        "explanation": "Zbyt duża klasa staje się trudna w review i refaktorze."
      },
      {
        "id": "q6-5-3",
        "question": "Kiedy komponent jest lepszy niż dziedziczenie?",
        "options": [
          "Gdy ten sam fragment interfejs użytkownika występuje na wielu stronach",
          "Gdy chcemy ukryć błąd",
          "Nigdy",
          "Tylko w API"
        ],
        "correctAnswer": 0,
        "explanation": "Kompozycja dobrze modeluje powtarzalne części interfejsu."
      },
      {
        "id": "q6-5-4",
        "question": "Co powinien zawierać BasePage?",
        "options": [
          "Mały zestaw wspólnych, naprawdę uniwersalnych operacji",
          "Całą logikę aplikacji",
          "Wszystkie asercje biznesowe",
          "Każdy selektor z projektu"
        ],
        "correctAnswer": 0,
        "explanation": "BasePage powinien być stabilnym fundamentem, nie workiem na wszystko."
      },
      {
        "id": "q6-5-5",
        "question": "Dlaczego fiksturas pasują do wzorzec obiektu strony?",
        "options": [
          "Dostarczają gotowe zależności i upraszczają setup testów",
          "Zastępują lokatory",
          "Usuwają potrzebę obiektów stron",
          "Działają tylko w unit testach"
        ],
        "correctAnswer": 0,
        "explanation": "Fixture może tworzyć i wstrzykiwać Page Objecty oraz dane."
      },
      {
        "id": "q6-5-6",
        "question": "Co jest antywzorcem w metodzie login()?",
        "options": [
          "Ukrywanie wielu niejawnych asercji i przekierowań bez nazwy",
          "Wypełnienie pól i kliknięcie submit",
          "Czytelne parametry",
          "Stabilne lokatory"
        ],
        "correctAnswer": 0,
        "explanation": "Metoda powinna jasno komunikować, czy tylko wykonuje akcję, czy też weryfikuje wynik."
      },
      {
        "id": "q6-5-7",
        "question": "Jak ograniczyć kruche selektory w wzorzec obiektu strony?",
        "options": [
          "Używać getByRole/getByLabel/getByTestId i centralizować lokatory",
          "Używać nth-child wszędzie",
          "Kopiować XPath z DevTools",
          "Nie robić review"
        ],
        "correctAnswer": 0,
        "explanation": "Stabilne lokatory i enkapsulacja zmniejszają koszt zmian interfejs użytkownika."
      },
      {
        "id": "q6-5-8",
        "question": "Najważniejsza zasada lekcji „Dobre praktyki i antywzorce obiektu strony” to:",
        "options": [
          "Abstrakcja ma zwiększać czytelność i utrzymywalność, nie ukrywać sens testu",
          "Im więcej klas, tym lepiej",
          "wzorzec obiektu strony zastępuje strategię testów",
          "Każdy test musi być fluent"
        ],
        "correctAnswer": 0,
        "explanation": "wzorzec obiektu strony jest narzędziem, nie celem samym w sobie."
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
        "title": "Playwright Wzorzec obiektu stronys",
        "url": "https://playwright.dev/docs/pom",
        "description": "Oficjalny przewodnik po Wzorzec obiektu strony w Playwright."
      },
      {
        "title": "Martin Fowler - Page Object",
        "url": "https://martinfowler.com/bliki/PageObject.html",
        "description": "Klasyczny tekst opisujący sens i granice wzorca Page Object."
      },
      {
        "title": "Playwright fiksturami",
        "url": "https://playwright.dev/docs/test-fiksturas",
        "description": "Dokumentacja fiksturas i dependency injection w Playwright Test."
      },
      {
        "title": "Clean Code TypeScript",
        "url": "https://github.com/labs42io/clean-code-typescript",
        "description": "Praktyczne zasady czystego kodu w TypeScript, przydatne w architekturze testów."
      }
    ],
    "tipsAndTricks": [
      "Zawsze opieraj architekturę testów na zasadach SOLID, unikając przedwczesnej abstrakcji zgodnie z zasadą WET (Write Everything Twice) z podręczników 2026.",
      
      "Page Object ma ukrywać szczegóły interfejsu, ale nie sens scenariusza biznesowego.",
      "Nie wkładaj do wzorzec obiektu strony każdej asercji — akcje, odczyty i oczekiwania domenowe rozdzielaj świadomie.",
      "Kompozycja komponentów często jest lepsza niż głęboka hierarchia dziedziczenia.",
      "Page Object i fiksturas powinny współpracować: fikstura dostarcza gotowy kontekst, wzorzec obiektu strony opisuje zachowanie strony."
    ],
    "commonMistakes": [
      {
        "mistake": "God Page Object",
        "solution": "Podziel dużą klasę na stronę, komponenty i wyspecjalizowane helpery domenowe."
      },
      {
        "mistake": "Publiczne lokatory używane bezpośrednio w testach",
        "solution": "Udostępniaj metody lub czytelne gettery opisujące intencję, nie surową strukturę DOM."
      },
      {
        "mistake": "Asercje ukryte w metodach akcji",
        "solution": "Oddziel akcję od weryfikacji albo nazwij metodę jednoznacznie, np. expectLoginError."
      },
      {
        "mistake": "Dziedziczenie BasePage z dziesiątkami metod",
        "solution": "BasePage utrzymuj mały; resztę przenieś do komponentów, usług lub kompozycji."
      }
    ]
  }
};
