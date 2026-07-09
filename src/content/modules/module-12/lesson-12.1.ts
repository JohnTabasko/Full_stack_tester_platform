import type { Lesson } from "../../../renderer/types";
import theory12_1 from './lesson-12.1.md?raw';

export const lesson12_1: Lesson = {
  "id": "12.1",
  "moduleId": 12,
  "title": "Zasady projektowania testów",
  "description": "Piramida testów, AAA, Given-When-Then, niezależność, deterministyczność, testowanie oparte na ryzyku oraz smoke/regresja.",
  "order": 1,
  "difficulty": "advanced",
  "tags": [
    "best-practices",
    "patterns",
    "quality",
    "maintainability"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz zastosować temat „Zasady projektowania testów” w sposób świadomy: rozpoznajesz korzyści, ograniczenia, antywzorce i wpływ na utrzymywalność testów.",
    "theory": theory12_1,
    "codeExamples": [
      "test('użytkownik bez uprawnień nie może eksportować danych', async ({ page }) => {\n  // Arrange\n  const user = await usersApi.create({ role: 'viewer' });\n  await loginAs(user);\n\n  // Act\n  await page.goto('/reports');\n  await page.getByRole('button', { name: 'Eksportuj' }).click();\n\n  // Assert\n  await expect(page.getByRole('alert')).toContainText('Brak uprawnień');\n});\n",
      "type TestPriority = 'P0' | 'P1' | 'P2' | 'P3';\nconst checkoutSmoke = { priority: 'P0' as TestPriority, reason: 'krytyczny przepływ przychodowy' };\n"
    ],
    "exercises": [
      {
        "id": "ex-12-1-1",
        "title": "Audyt praktyki",
        "description": "Dla obszaru „Zasady projektowania testów” przeanalizuj istniejący test i wskaż trzy usprawnienia."
      },
      {
        "id": "ex-12-1-2",
        "title": "Refaktor kontrolowany",
        "description": "Wykonaj mały refaktor testu, zachowując ten sam zakres asercji i poprawiając czytelność."
      },
      {
        "id": "ex-12-1-3",
        "title": "Standard zespołowy",
        "description": "Napisz krótki standard lub checklistę dotyczącą tej praktyki."
      },
      {
        "id": "ex-12-1-4",
        "title": "Antywzorzec",
        "description": "Opisz przykład antywzorca, jego krótkoterminową wygodę i długoterminowy koszt."
      },
      {
        "id": "ex-12-1-5",
        "title": "Metryka utrzymywalności",
        "description": "Zaproponuj metrykę lub obserwację, która pokaże, czy praktyka działa."
      },
      {
        "id": "ex-12-1-6",
        "title": "Code review",
        "description": "Przygotuj komentarz review, który jest konkretny, uprzejmy i prowadzi do lepszego rozwiązania."
      }
    ],
    "quiz": [
      {
        "id": "q12-1-1",
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
        "id": "q12-1-2",
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
        "id": "q12-1-3",
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
        "id": "q12-1-4",
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
        "id": "q12-1-5",
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
        "id": "q12-1-6",
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
        "id": "q12-1-7",
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
        "id": "q12-1-8",
        "question": "Najważniejsza zasada lekcji „Zasady projektowania testów” to:",
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
        "title": "Playwright Best Practices",
        "url": "https://playwright.dev/docs/best-practices",
        "description": "Oficjalne dobre praktyki Playwright."
      },
      {
        "title": "Martin Fowler - Test Pyramid",
        "url": "https://martinfowler.com/articles/practical-test-pyramid.html",
        "description": "Praktyczne omówienie piramidy testów."
      },
      {
        "title": "Conventional Commits",
        "url": "https://www.conventionalcommits.org/",
        "description": "Standard opisywania commitów."
      },
      {
        "title": "Architecture Decision Records",
        "url": "https://adr.github.io/",
        "description": "Materiały o dokumentowaniu decyzji architektonicznych."
      }
    ],
    "tipsAndTricks": [
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
