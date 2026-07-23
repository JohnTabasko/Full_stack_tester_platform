import type { Lesson } from "../../../renderer/types";
import theory28_1 from './lesson-28.1.md?raw';

export const lesson28_1: Lesson = {
  "id": "28.1",
  "moduleId": 28,
  "title": "Matryca kompetencji testera full stack",
  "description": "Oczekiwania junior/mid/senior, mapa umiejętności, samoocena, luki kompetencyjne i plan rozwoju po kursie.",
  "order": 1,
  "difficulty": "expert",
  "tags": [
    "career",
    "skills-matrix",
    "competency-model",
    "growth-plan"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz ocenić własne kompetencje full stack testera, odróżnić wymagania junior, mid i senior oraz zaplanować dalszy rozwój na podstawie konkretnych luk, a nie ogólnych deklaracji.",
    "theory": theory28_1,
    "codeExamples": [
      "type SkillLevel = 'learning' | 'working' | 'independent' | 'mentor';\n\ntype SkillEvidence = {\n  skill: string;\n  level: SkillLevel;\n  evidence: string;\n  nextStep: string;\n};\n\nconst mySkills: SkillEvidence[] = [\n  {\n    skill: 'API contract testing',\n    level: 'working',\n    evidence: 'OpenAPI validation in CI for Orders API',\n    nextStep: 'Add consumer-driven Pact example',\n  },\n];\n",
      "# Przykład dowodu kompetencji\nKompetencja: SQL i dane testowe\nDowód: test integracyjny checkoutu sprawdzający orders, order_items i audit_events przez JOIN.\nNastępny krok: dodać test race condition dla ostatniej sztuki produktu.\n"
    ],
    "exercises": [
      {
        "id": "ex-28-1-1",
        "title": "Opis kompetencji",
        "description": "Dla tematu „Matryca kompetencji testera full stack” zapisz, jakie kompetencje junior/mid/senior powinien pokazać kandydat."
      },
      {
        "id": "ex-28-1-2",
        "title": "Artefakt portfolio",
        "description": "Przygotuj fragment README, diagram, raport lub checklistę, który udowadnia daną umiejętność."
      },
      {
        "id": "ex-28-1-3",
        "title": "Decyzja architektoniczna",
        "description": "Napisz krótkie ADR opisujące ważny wybór w projekcie testowym i jego konsekwencje."
      },
      {
        "id": "ex-28-1-4",
        "title": "Pytanie rekrutacyjne",
        "description": "Przygotuj odpowiedź metodą STAR na pytanie dotyczące awarii, flaky testu albo wyboru strategii."
      },
      {
        "id": "ex-28-1-5",
        "title": "Quality gate",
        "description": "Zdefiniuj kryteria zaliczenia projektu: testy, lint, typy, raporty, praktyka i dokumentacja."
      },
      {
        "id": "ex-28-1-6",
        "title": "Plan rozwoju",
        "description": "Wskaż trzy braki w projekcie i zaproponuj kolejność ich uzupełniania."
      }
    ],
    "quiz": [
      {
        "id": "q28-1-1",
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
        "id": "q28-1-2",
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
        "id": "q28-1-3",
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
        "id": "q28-1-4",
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
        "id": "q28-1-5",
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
        "id": "q28-1-6",
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
        "id": "q28-1-7",
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
        "id": "q28-1-8",
        "question": "Najważniejszy rezultat lekcji „Matryca kompetencji testera full stack” to:",
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
        "title": "GitHub Docs - About READMEs",
        "url": "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes",
        "description": "Jak pisać czytelne README dla projektu publikowanego na GitHubie."
      },
      {
        "title": "GitHub Skills",
        "url": "https://skills.github.com/",
        "description": "Praktyczne materiały GitHuba pomagające przygotować repozytorium i workflow."
      },
      {
        "title": "The STAR Method",
        "url": "https://www.themuse.com/advice/star-interview-method",
        "description": "Popularna metoda opowiadania o doświadczeniu podczas rozmowy rekrutacyjnej."
      },
      {
        "title": "Playwright Best Practices",
        "url": "https://playwright.dev/docs/best-practices",
        "description": "Oficjalne dobre praktyki Playwright przydatne w projekcie portfolio."
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
