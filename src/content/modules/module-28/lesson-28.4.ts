import type { Lesson } from "../../../renderer/types";
import theory28_4 from './lesson-28.4.md?raw';

export const lesson28_4: Lesson = {
  "id": "28.4",
  "moduleId": 28,
  "title": "GitHub, CV i prezentacja portfolio",
  "description": "Zadania rekrutacyjne, live coding, trade-offy testowe, TEST_STRATEGY.md, security/privacy checklist i prezentacja decyzji.",
  "order": 4,
  "difficulty": "expert",
  "tags": [
    "portfolio",
    "github",
    "cv",
    "readme",
    "linkedin",
    "presentation"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz przygotować repozytorium portfolio, napisać profesjonalne README, opisać projekt w CV/LinkedIn oraz zaprezentować swoje decyzje techniczne w sposób wiarygodny i zrozumiały.",
    "theory": theory28_4,
    "codeExamples": [
      "# Szkielet README\n\n## Cel projektu\nFramework testów full stack dla aplikacji e-commerce demo.\n\n## Zakres\n- E2E interfejsu użytkownika: checkout i logowanie\n- API: zamówienia, autoryzacja, błędy walidacji\n- baza danych: spójność orders/order_items/audit_events\n- CI: lint, typecheck, testy, raporty\n\n## Uruchomienie\nnpm ci\nnpx playwright install\nnpm run test\n\n## Decyzje\nZobacz docs/adr/0001-test-architecture.md\n",
      "# Przykład wpisu do CV\nZaprojektowałem i wdrożyłem projekt portfolio QA Automation obejmujący testy interfejs użytkownika, API i baza danych w Playwright/TypeScript, z GitHub Actions, raportami HTML/JUnit, trace na awarii oraz strategią danych testowych opartą o run_id i cleanup.\n"
    ],
    "exercises": [
      {
        "id": "ex-28-4-1",
        "title": "Opis kompetencji",
        "description": "Dla tematu „GitHub, CV i prezentacja portfolio” zapisz, jakie kompetencje junior/mid/senior powinien pokazać kandydat."
      },
      {
        "id": "ex-28-4-2",
        "title": "Artefakt portfolio",
        "description": "Przygotuj fragment README, diagram, raport lub checklistę, który udowadnia daną umiejętność."
      },
      {
        "id": "ex-28-4-3",
        "title": "Decyzja architektoniczna",
        "description": "Napisz krótkie ADR opisujące ważny wybór w projekcie testowym i jego konsekwencje."
      },
      {
        "id": "ex-28-4-4",
        "title": "Pytanie rekrutacyjne",
        "description": "Przygotuj odpowiedź metodą STAR na pytanie dotyczące awarii, flaky testu albo wyboru strategii."
      },
      {
        "id": "ex-28-4-5",
        "title": "Quality gate",
        "description": "Zdefiniuj kryteria zaliczenia projektu: testy, lint, typy, raporty, praktyka i dokumentacja."
      },
      {
        "id": "ex-28-4-6",
        "title": "Plan rozwoju",
        "description": "Wskaż trzy braki w projekcie i zaproponuj kolejność ich uzupełniania."
      }
    ],
    "quiz": [
      {
        "id": "q28-4-1",
        "question": "Co powinno udowadniać dobre portfolio QA Automation?",
        "options": [
          "Umiejętność podejmowania decyzji testowych i utrzymania projektu, nie tylko pisania skryptów",
          "Wyłącznie liczbę plików",
          "Tylko znajomość jednego selektora",
          "Brak dokumentacji"
        ],
        "correctAnswer": 0,
        "explanation": "Portfolio ma pokazać dojrzałość inżynierską: strategię, architekturę, diagnostykę i utrzymanie."
      },
      {
        "id": "q28-4-2",
        "question": "Co jest najważniejsze w README projektu?",
        "options": [
          "Cel, zakres, instrukcja uruchomienia, struktura i interpretacja wyników",
          "Losowy cytat",
          "Same badge bez treści",
          "Brak komend"
        ],
        "correctAnswer": 0,
        "explanation": "README powinno pozwolić szybko zrozumieć projekt i uruchomić go bez zgadywania."
      },
      {
        "id": "q28-4-3",
        "question": "Po co opisywać kompromisy w projekcie?",
        "options": [
          "Aby pokazać świadomość ograniczeń i kierunki rozwoju",
          "Aby ukryć braki",
          "Aby zmniejszyć wiarygodność",
          "Nie wolno ich opisywać"
        ],
        "correctAnswer": 0,
        "explanation": "Świadome kompromisy są oznaką dojrzałości, nie słabości."
      },
      {
        "id": "q28-4-4",
        "question": "Co powinien obejmować projekt końcowy full stack testera?",
        "options": [
          "interfejs użytkownika, API, baza danych, CI, raportowanie, dane, diagnostykę i opis strategii",
          "Tylko jeden test loginu",
          "Wyłącznie screenshoty",
          "Brak asercji"
        ],
        "correctAnswer": 0,
        "explanation": "Projekt ma pokazać pracę przez cały stack jakości."
      },
      {
        "id": "q28-4-5",
        "question": "Jak odpowiadać na pytania o doświadczenie?",
        "options": [
          "Konkretnie: sytuacja, zadanie, działanie, rezultat",
          "Ogólnikami bez przykładów",
          "Tylko nazwami narzędzi",
          "Unikać liczb i efektów"
        ],
        "correctAnswer": 0,
        "explanation": "Metoda STAR pomaga opisać realny wkład i wynik działania."
      },
      {
        "id": "q28-4-6",
        "question": "Co odróżnia zadanie rekrutacyjne dobrej jakości?",
        "options": [
          "Ma jasne kryteria, czytelny kod, testy, raport i uzasadnione decyzje",
          "Jest największe możliwe",
          "Nie ma README",
          "Nie da się uruchomić"
        ],
        "correctAnswer": 0,
        "explanation": "Rekruter ocenia nie tylko wynik, ale też proces i utrzymywalność."
      },
      {
        "id": "q28-4-7",
        "question": "Czym jest matryca kompetencji?",
        "options": [
          "Opis poziomów umiejętności i oczekiwań na różnych etapach rozwoju",
          "Tabela kolorów interfejs użytkownika",
          "Lista sekretów",
          "Raport błędów produkcyjnych"
        ],
        "correctAnswer": 0,
        "explanation": "Matryca pomaga ocenić aktualny poziom i planować rozwój."
      },
      {
        "id": "q28-4-8",
        "question": "Najważniejszy rezultat lekcji „GitHub, CV i prezentacja portfolio” to:",
        "options": [
          "Umiejętność pokazania kompetencji przez działający, udokumentowany i uzasadniony projekt",
          "Zapamiętanie nazwy narzędzia",
          "Ukrycie procesu pracy",
          "Brak kryteriów zaliczenia"
        ],
        "correctAnswer": 0,
        "explanation": "Portfolio i egzamin mają potwierdzać praktyczne kompetencje, nie tylko wiedzę teoretyczną."
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
        "title": "GitHub Docs",
        "url": "https://docs.github.com/",
        "description": "Przygotowanie publicznego repozytorium."
      },
      {
        "title": "Conventional Commits",
        "url": "https://www.conventionalcommits.org/",
        "description": "Czytelna historia commitów."
      },
      {
        "title": "OWASP Top 10",
        "url": "https://owasp.org/www-project-top-ten/",
        "description": "Security checklist dla projektów web."
      }
    ],
    "tipsAndTricks": [
      "Zawsze opieraj architekturę testów na zasadach SOLID, unikając przedwczesnej abstrakcji zgodnie z zasadą WET (Write Everything Twice) z podręczników 2026.",
      
      "Portfolio powinno pokazywać decyzje inżynierskie, nie tylko liczbę testów.",
      "README projektu jest pierwszym code review rekrutera — musi wyjaśniać cel, zakres, uruchomienie i interpretację wyników.",
      "Projekt końcowy powinien mieć znane kompromisy i opisane ograniczenia; to buduje wiarygodność.",
      "Na rozmowie technicznej mów językiem ryzyka, diagnostyki i decyzji, nie tylko narzędzi."
    ],
    "commonMistakes": [
      {
        "mistake": "Portfolio jako zrzut przypadkowych testów",
        "solution": "Zbuduj spójny projekt z architekturą, strategią testów, raportami i uzasadnieniem decyzji."
      },
      {
        "mistake": "README bez instrukcji uruchomienia",
        "solution": "Dodaj wymagania, instalację, komendy, strukturę projektu i przykładowe wyniki."
      },
      {
        "mistake": "Brak opisu kompromisów",
        "solution": "Napisz, co świadomie pominięto, dlaczego i jak rozwinąć projekt dalej."
      },
      {
        "mistake": "Przygotowanie tylko pod programowanie na żywo",
        "solution": "Ćwicz również rozmowę o strategii, debugowaniu, CI, danych i obserwowalności."
      }
    ]
  }
};
