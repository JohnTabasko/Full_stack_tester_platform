import type { Lesson } from "../../../renderer/types";
import theory12_5 from './lesson-12.5.md?raw';

export const lesson12_5: Lesson = {
  "id": "12.5",
  "moduleId": 12,
  "title": "Antywzorce i typowe błędy",
  "description": "Antywzorce Playwright: waitForTimeout, kruche locatory, kolejność testów, over-mocking, brak asercji, magiczne dane i koszt CI.",
  "order": 5,
  "difficulty": "advanced",
  "tags": [
    "best-practices",
    "patterns",
    "quality",
    "maintainability"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz zastosować temat „Antywzorce i typowe błędy” w sposób świadomy: rozpoznajesz korzyści, ograniczenia, antywzorce i wpływ na utrzymywalność testów.",
    "theory": theory12_5,
    "codeExamples": [
      "// Antywzorzec\nawait page.waitForTimeout(5000);\nawait page.locator('.btn-primary').click();\n\n// Refaktor\nawait expect(page.getByRole('button', { name: 'Zapisz' })).toBeEnabled();\nawait page.getByRole('button', { name: 'Zapisz' }).click();\nawait expect(page.getByText('Zapisano')).toBeVisible();\n",
      "// Antywzorzec: test zależny od poprzedniego.\n// Lepsze: utwórz dane przez API w Arrange i usuń je w cleanup.\n"
    ],
    "exercises": [
      {
        "id": "ex-12-5-1",
        "title": "Audyt praktyki",
        "description": "Dla obszaru „Antywzorce i typowe błędy” przeanalizuj istniejący test i wskaż trzy usprawnienia."
      },
      {
        "id": "ex-12-5-2",
        "title": "Refaktor kontrolowany",
        "description": "Wykonaj mały refaktor testu, zachowując ten sam zakres asercji i poprawiając czytelność."
      },
      {
        "id": "ex-12-5-3",
        "title": "Standard zespołowy",
        "description": "Napisz krótki standard lub checklistę dotyczącą tej praktyki."
      },
      {
        "id": "ex-12-5-4",
        "title": "Antywzorzec",
        "description": "Opisz przykład antywzorca, jego krótkoterminową wygodę i długoterminowy koszt."
      },
      {
        "id": "ex-12-5-5",
        "title": "Metryka utrzymywalności",
        "description": "Zaproponuj metrykę lub obserwację, która pokaże, czy praktyka działa."
      },
      {
        "id": "ex-12-5-6",
        "title": "Code review",
        "description": "Przygotuj komentarz review, który jest konkretny, uprzejmy i prowadzi do lepszego rozwiązania."
      }
    ],
    "quiz": [
      {
        "id": "q12-5-1",
        "question": "Po co zespołowi dobre praktyki testowe?",
        "options": [
          "Aby zmniejszać koszt utrzymania i zwiększać wiarygodność testów",
          "Aby tworzyć więcej dokumentów",
          "Aby ukrywać błędy",
          "Aby zastąpić myślenie"
        ],
        "correctAnswer": 0,
        "explanation": "Dobre praktyki mają wspierać decyzje i utrzymywalność."
      },
      {
        "id": "q12-5-2",
        "question": "Czym jest antywzorzec?",
        "options": [
          "Rozwiązaniem pozornie wygodnym, które długoterminowo zwiększa koszt lub ryzyko",
          "Każdym wzorcem projektowym",
          "Każdym testem E2E",
          "Synonimem refaktoru"
        ],
        "correctAnswer": 0,
        "explanation": "Antywzorzec często działa na początku, ale szkodzi przy skali."
      },
      {
        "id": "q12-5-3",
        "question": "Co jest celem przegląd kodu testów?",
        "options": [
          "Poprawa jakości informacji, stabilności i utrzymywalności",
          "Szukanie winnych",
          "Formatowanie dla sportu",
          "Zastąpienie CI"
        ],
        "correctAnswer": 0,
        "explanation": "Review testów powinno oceniać wartość, koszt i diagnostykę."
      },
      {
        "id": "q12-5-4",
        "question": "Kiedy refaktoryzować testy?",
        "options": [
          "Gdy duplikacja, kruchość lub brak czytelności zwiększa koszt zmian",
          "Nigdy",
          "Tylko gdy wszystkie testy są czerwone",
          "Bez uruchamiania suite"
        ],
        "correctAnswer": 0,
        "explanation": "Refaktor powinien odpowiadać na konkretny problem utrzymaniowy."
      },
      {
        "id": "q12-5-5",
        "question": "Co oznacza test independence?",
        "options": [
          "Test sam przygotowuje i sprząta potrzebny stan",
          "Test wymaga poprzedniego testu",
          "Test nie ma danych",
          "Test nie ma asercji"
        ],
        "correctAnswer": 0,
        "explanation": "Niezależność umożliwia równoległość i powtarzalność."
      },
      {
        "id": "q12-5-6",
        "question": "Co jest dobrą cechą standardu zespołowego?",
        "options": [
          "Jest krótki, praktyczny i egzekwowalny w review/CI",
          "Jest długi i nieczytany",
          "Nie ma właściciela",
          "Jest sprzeczny z praktyką"
        ],
        "correctAnswer": 0,
        "explanation": "Standard musi pomagać zespołowi w codziennej pracy."
      },
      {
        "id": "q12-5-7",
        "question": "Dlaczego ADR jest przydatny?",
        "options": [
          "Zapisuje kontekst, decyzję i konsekwencje ważnego wyboru",
          "Zastępuje testy",
          "Ukrywa dług techniczny",
          "Jest tylko dla managerów"
        ],
        "correctAnswer": 0,
        "explanation": "ADR zachowuje pamięć decyzji architektonicznej."
      },
      {
        "id": "q12-5-8",
        "question": "Najważniejsza zasada lekcji „Antywzorce i typowe błędy” to:",
        "options": [
          "Praktyki mają służyć jakości i utrzymaniu, nie być dekoracją procesu",
          "Najważniejsza jest liczba wzorców",
          "Każdy test ma być maksymalnie abstrakcyjny",
          "Standardy są zbędne"
        ],
        "correctAnswer": 0,
        "explanation": "Profesjonalizm polega na świadomym doborze praktyk do kontekstu."
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
        "title": "Best Practices",
        "url": "https://playwright.dev/docs/best-practices",
        "description": "Oficjalna lista dobrych praktyk i antywzorców."
      },
      {
        "title": "Actionability",
        "url": "https://playwright.dev/docs/actionability",
        "description": "Dlaczego nie używać sleepów."
      },
      {
        "title": "Trace Viewer",
        "url": "https://playwright.dev/docs/trace-viewer",
        "description": "Diagnostyka zamiast zgadywania."
      }
    ],
    "tipsAndTricks": [
      "Zawsze opieraj architekturę testów na zasadach SOLID, unikając przedwczesnej abstrakcji zgodnie z zasadą WET (Write Everything Twice) z podręczników 2026.",
      
      "Dobra praktyka jest dobra tylko wtedy, gdy rozwiązuje realny problem w Twoim kontekście.",
      "Standardy zespołowe powinny zmniejszać tarcie, nie tworzyć rytuały bez wartości.",
      "Refaktoryzuj testy tak samo świadomie jak kod aplikacji: małymi krokami i z zachowaniem sensu asercji.",
      "Antywzorzec rozpoznasz po tym, że lokalnie daje wygodę, a zespołowo zwiększa koszt utrzymania."
    ],
    "commonMistakes": [
      {
        "mistake": "Ślepe kopiowanie wzorców",
        "solution": "Najpierw nazwij problem: duplikacja, złożoność, brak diagnostyki, sprzężenie albo koszt CI."
      },
      {
        "mistake": "Brak standardów review testów",
        "solution": "Ustal checklistę obejmującą ryzyko, dane, lokatory, asercje, diagnostykę i poziom testu."
      },
      {
        "mistake": "Refaktor bez testu zabezpieczającego",
        "solution": "Zmieniaj architekturę testów małymi krokami i uruchamiaj suite po każdej zmianie."
      },
      {
        "mistake": "Ignorowanie antywzorców, bo testy są zielone",
        "solution": "Zielony wynik nie oznacza utrzymywalności; oceniaj też koszt zmian i flaky rate."
      }
    ]
  }
};
