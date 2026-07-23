import type { Lesson } from "../../../renderer/types";
import theory18_4 from './lesson-18.4.md?raw';

export const lesson18_4: Lesson = {
  "id": "18.4",
  "moduleId": 18,
  "title": "Przepływ pracy testera w Git",
  "description": "Git workflow dla testera: branch, commit, rebase, merge, revert, reset, bisect, conventional commits i historia jako diagnostyka.",
  "order": 4,
  "difficulty": "beginner",
  "tags": [
    "git",
    "pull-request",
    "code-review",
    "rebase",
    "merge",
    "bisect",
    "conventional-commits"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz bezpiecznie pracować z Gitem w projekcie testowym, przygotować czytelny pull request, rozwiązać konflikt, cofnąć zmianę i użyć historii repozytorium do diagnozy regresji.",
    "theory": theory18_4,
    "codeExamples": [
      "# Przykładowy opis pull requesta\n\n## Cel\nDodanie smoke testu dla zakupu gościa w checkout.\n\n## Ryzyko pokrywane przez zmianę\nAwaria krytycznego przepływu sprzedażowego po zmianach w koszyku lub płatności.\n\n## Zakres\n- jeden test E2E oznaczony @smoke,\n- helper do utworzenia produktu testowego przez API,\n- publikacja trace przy awarii.\n\n## Weryfikacja\n- npm run test:smoke\n- npm run lint\n- npx tsc --noEmit\n",
      "# Automatyczny git bisect dla regresji testu\n\ngit bisect start\ngit bisect bad HEAD\ngit bisect good v1.24.0\n\ngit bisect run npm run test:smoke -- --grep \"guest checkout\"\n\ngit bisect reset\n"
    ],
    "exercises": [
      {
        "id": "ex-18-4-1",
        "title": "Opis PR",
        "description": "Napisz opis pull requesta dodającego test API dla autoryzacji eksportu faktur."
      },
      {
        "id": "ex-18-4-2",
        "title": "Conventional commits",
        "description": "Zaproponuj pięć commit message dla zmian: test, fix, refactor, chore i docs."
      },
      {
        "id": "ex-18-4-3",
        "title": "Konflikt w testach",
        "description": "Opisz, jak rozwiążesz konflikt w pliku Page Object, aby nie utracić asercji dodanej przez inną osobę."
      },
      {
        "id": "ex-18-4-4",
        "title": "Revert czy reset",
        "description": "Dla czterech sytuacji zdecyduj, czy użyć revert, reset czy checkout, i uzasadnij wybór."
      },
      {
        "id": "ex-18-4-5",
        "title": "Git bisect",
        "description": "Przygotuj procedurę użycia git bisect do znalezienia commita psującego test logowania."
      },
      {
        "id": "ex-18-4-6",
        "title": "Review testu",
        "description": "Przygotuj checklistę przegląd kodu dla testu E2E i zastosuj ją do przykładowego scenariusza."
      }
    ],
    "quiz": [
      {
        "id": "q18-4-1",
        "question": "Dlaczego małe commity są korzystne?",
        "options": [
          "Ułatwiają review, revert i analizę historii",
          "Zawsze przyspieszają testy",
          "Zastępują CI",
          "Nie mają znaczenia"
        ],
        "correctAnswer": 0,
        "explanation": "Mały, spójny commit jest łatwiejszy do zrozumienia i cofnięcia."
      },
      {
        "id": "q18-4-2",
        "question": "Kiedy preferować git revert?",
        "options": [
          "Gdy cofamy zmianę obecną we współdzielonej historii",
          "Zawsze przed pierwszym commitem",
          "Tylko lokalnie bez commitów",
          "Nigdy"
        ],
        "correctAnswer": 0,
        "explanation": "Revert tworzy nowy commit i nie niszczy wspólnej historii."
      },
      {
        "id": "q18-4-3",
        "question": "Do czego służy git bisect?",
        "options": [
          "Do znalezienia commita wprowadzającego regresję",
          "Do formatowania kodu",
          "Do instalacji zależności",
          "Do publikacji raportów"
        ],
        "correctAnswer": 0,
        "explanation": "Bisect używa wyszukiwania binarnego w historii commitów."
      },
      {
        "id": "q18-4-4",
        "question": "Co powinien zawierać PR z testem?",
        "options": [
          "Cel, ryzyko, zakres i sposób weryfikacji",
          "Tylko screenshot",
          "Same commity bez opisu",
          "Wyłącznie link do zadania"
        ],
        "correctAnswer": 0,
        "explanation": "Opis PR powinien pomóc reviewerowi zrozumieć sens zmiany."
      },
      {
        "id": "q18-4-5",
        "question": "Co jest ryzykiem przy rozwiązywaniu konfliktów w testach?",
        "options": [
          "Utrata asercji lub diagnostyki dodanej przez inną osobę",
          "Zawsze szybszy pipeline",
          "Automatyczne naprawienie flaky testów",
          "Brak konieczności uruchamiania testów"
        ],
        "correctAnswer": 0,
        "explanation": "Konflikty w testach mogą przypadkowo usunąć ważne zabezpieczenia."
      },
      {
        "id": "q18-4-6",
        "question": "Co oznacza conventional commit typu test?",
        "options": [
          "Zmianę dotyczącą testów",
          "Błąd produkcyjny",
          "Zmianę stylów",
          "Release aplikacji"
        ],
        "correctAnswer": 0,
        "explanation": "Typ test opisuje dodanie lub zmianę testów."
      },
      {
        "id": "q18-4-7",
        "question": "Dlaczego rebase publicznego brancha wymaga ostrożności?",
        "options": [
          "Przepisuje historię, z której mogą korzystać inni",
          "Usuwa Node.js",
          "Zawsze psuje testy",
          "Nie działa z GitHubem"
        ],
        "correctAnswer": 0,
        "explanation": "Rebase zmienia identyfikatory commitów i może utrudnić pracę innym osobom."
      },
      {
        "id": "q18-4-8",
        "question": "Jaki komentarz review jest najbardziej konstruktywny?",
        "options": [
          "Źle",
          "Czy możemy przenieść tę walidację na niższy poziom testu, bo dotyczy deterministycznej reguły?",
          "Nie podoba mi się",
          "Usuń wszystko"
        ],
        "correctAnswer": 1,
        "explanation": "Dobry komentarz wyjaśnia ryzyko i proponuje kierunek poprawy."
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
        "title": "Git Docs",
        "url": "https://git-scm.com/docs",
        "description": "Oficjalna dokumentacja Git."
      },
      {
        "title": "Git Workflows",
        "url": "https://git-scm.com/docs/gitworkflows",
        "description": "Przepływy pracy w Git."
      },
      {
        "title": "Conventional Commits",
        "url": "https://www.conventionalcommits.org/",
        "description": "Standard komunikatów commitów."
      }
    ],
    "tipsAndTricks": [
      "Zawsze opieraj architekturę testów na zasadach SOLID, unikając przedwczesnej abstrakcji zgodnie z zasadą WET (Write Everything Twice) z podręczników 2026.",
      
      "Opis PR powinien mówić o ryzyku, a nie tylko o plikach zmienionych w diffie.",
      "Po konflikcie w testach zawsze uruchom testy z konfliktowanego obszaru.",
      "git bisect jest jednym z najbardziej niedocenianych narzędzi diagnostycznych testera.",
      "Conventional commits ułatwiają filtrowanie historii i automatyczny changelog."
    ],
    "commonMistakes": [
      {
        "mistake": "Duże, mieszane commity",
        "solution": "Dziel zmiany według intencji: test, refactor, config, docs."
      },
      {
        "mistake": "PR bez opisu ryzyka",
        "solution": "Opisz, jaki problem jakościowy rozwiązuje zmiana."
      },
      {
        "mistake": "Reset współdzielonej historii",
        "solution": "Dla zmian wypchniętych używaj revert, chyba że zespół uzgodni inaczej."
      },
      {
        "mistake": "Review wyłącznie składni",
        "solution": "Oceniaj poziom testu, dane, asercje, diagnostykę i koszt utrzymania."
      }
    ]
  }
};
