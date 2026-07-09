import type { Lesson } from "../../../renderer/types";
import theory19_3 from './lesson-19.3.md?raw';

export const lesson19_3: Lesson = {
  "id": "19.3",
  "moduleId": 19,
  "title": "React Testing Library i testowanie komponentów",
  "description": "Testowanie komponentów przez zachowanie użytkownika, zapytania dostępnościowe, zdarzenia, granice komponentów i relacja z testowaniem komponentów w Playwright.",
  "order": 3,
  "difficulty": "intermediate",
  "tags": [
    "react-testing-library",
    "component-testing",
    "accessibility",
    "user-event",
    "frontend"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz testować komponenty przez ich zachowanie, używać zapytań dostępnościowych, odróżniać test komponentu od testu E2E i unikać wiązania testów z implementacją Reacta.",
    "theory": theory19_3,
    "codeExamples": [
      "import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\nimport { expect, it, vi } from 'vitest';\n\nit('shows validation error for empty login form', async () => {\n  const user = userEvent.setup();\n  const onSubmit = vi.fn();\n\n  render(<LoginForm onSubmit={onSubmit} />);\n  await user.click(screen.getByRole('button', { name: /zaloguj/i }));\n\n  expect(screen.getByText(/podaj adres e-mail/i)).toBeVisible();\n  expect(onSubmit).not.toHaveBeenCalled();\n});\n",
      "// Antywzorzec: test szczegółów implementacji.\nexpect(wrapper.state('isLoading')).toBe(true);\n\n// Lepsze: test obserwowalnego zachowania.\nexpect(screen.getByRole('status', { name: /logowanie/i })).toBeVisible();\n"
    ],
    "exercises": [
      {
        "id": "ex-19-3-1",
        "title": "Formularz logowania",
        "description": "Napisz test komponentu sprawdzający walidację pustych pól."
      },
      {
        "id": "ex-19-3-2",
        "title": "Stan ładowania",
        "description": "Przetestuj spinner lub komunikat statusu podczas wysyłki formularza."
      },
      {
        "id": "ex-19-3-3",
        "title": "Dostępne zapytania",
        "description": "Przepisz test używający querySelector na getByRole i getByLabelText."
      },
      {
        "id": "ex-19-3-4",
        "title": "Błąd API",
        "description": "Zamockuj odpowiedź błędu i sprawdź komunikat użytkownika."
      },
      {
        "id": "ex-19-3-5",
        "title": "Granice komponentu",
        "description": "Wskaż, co powinno zostać w teście komponentu, a co przenieść do E2E."
      },
      {
        "id": "ex-19-3-6",
        "title": "Review dostępności",
        "description": "Na podstawie testu wskaż brakujące role, etykiety lub komunikaty statusu."
      }
    ],
    "quiz": [
      {
        "id": "q19-3-1",
        "question": "Jaka jest główna zasada React Testing Library?",
        "options": [
          "Testuj komponent przez zachowanie użytkownika",
          "Testuj prywatne metody",
          "Testuj klasy CSS",
          "Unikaj asercji"
        ],
        "correctAnswer": 0,
        "explanation": "RTL promuje testowanie publicznego zachowania komponentu."
      },
      {
        "id": "q19-3-2",
        "question": "Dlaczego getByRole jest wartościowe?",
        "options": [
          "Łączy test z semantyką i dostępnością",
          "Zawsze jest krótsze",
          "Ukrywa błędy",
          "Działa tylko w E2E"
        ],
        "correctAnswer": 0,
        "explanation": "Role odzwierciedlają sposób, w jaki technologie wspomagające widzą interfejs użytkownika."
      },
      {
        "id": "q19-3-3",
        "question": "Co jest antywzorcem w testach komponentów?",
        "options": [
          "Sprawdzanie stanu wewnętrznego zamiast zachowania",
          "Użycie user-event",
          "Asercja komunikatu błędu",
          "Test dostępności"
        ],
        "correctAnswer": 0,
        "explanation": "Stan wewnętrzny jest szczegółem implementacji."
      },
      {
        "id": "q19-3-4",
        "question": "Kiedy komponent testing jest szczególnie użyteczny?",
        "options": [
          "Przy wielu wariantach interfejs użytkownika i walidacjach",
          "Do pełnej płatności produkcyjnej",
          "Do testów bazy danych",
          "Do deploymentu"
        ],
        "correctAnswer": 0,
        "explanation": "Komponenty dobrze testują warianty stanu interfejs użytkownika szybko i lokalnie."
      },
      {
        "id": "q19-3-5",
        "question": "Po co używać user-event?",
        "options": [
          "Aby modelować interakcje bliższe użytkownikowi",
          "Aby ominąć DOM",
          "Aby usunąć asercje",
          "Aby pisać mniej czytelne testy"
        ],
        "correctAnswer": 0,
        "explanation": "user-event lepiej odwzorowuje wpisywanie, kliknięcia i klawiaturę."
      },
      {
        "id": "q19-3-6",
        "question": "Co powinien sprawdzić test błędu API w komponencie?",
        "options": [
          "Komunikat widoczny dla użytkownika",
          "Prywatną nazwę hooka",
          "Kolejność importów",
          "Kolor w edytorze"
        ],
        "correctAnswer": 0,
        "explanation": "Użytkownika interesuje czytelna informacja o błędzie."
      },
      {
        "id": "q19-3-7",
        "question": "Czy test komponentu zastępuje E2E?",
        "options": [
          "Nie, uzupełnia go na niższym poziomie",
          "Tak, zawsze",
          "Tylko w backendzie",
          "Nie można testować komponentów"
        ],
        "correctAnswer": 0,
        "explanation": "Test komponentu jest szybszy, ale mniej realistyczny niż E2E."
      },
      {
        "id": "q19-3-8",
        "question": "Co może ujawnić trudność w użyciu getByRole?",
        "options": [
          "Problem semantyki lub dostępności komponentu",
          "Brak TypeScriptu",
          "Zawsze błąd Playwrighta",
          "Konieczność usunięcia testu"
        ],
        "correctAnswer": 0,
        "explanation": "Jeśli element nie ma roli lub nazwy, może być też trudny dla technologii wspomagających."
      }
    ],
    "references": [
      {
        "title": "Vitest Guide",
        "url": "https://vitest.dev/guide/",
        "description": "Dokumentacja nowoczesnego runnera testów jednostkowych dla ekosystemu Vite."
      },
      {
        "title": "Jest Documentation",
        "url": "https://jestjs.io/docs/getting-started",
        "description": "Klasyczne narzędzie testowe, którego pojęcia są nadal powszechne w projektach JavaScript/TypeScript."
      },
      {
        "title": "Testing Library Documentation",
        "url": "https://testing-library.com/docs/",
        "description": "Podejście do testowania komponentów przez zachowanie użytkownika, a nie szczegóły implementacji."
      },
      {
        "title": "Martin Fowler - Test Double",
        "url": "https://martinfowler.com/bliki/TestDouble.html",
        "description": "Klasyczny opis dublerów testowych: dummy, fake, stub, spy i mock."
      }
    ],
    "tipsAndTricks": [
      "Zaczynaj od getByRole i getByLabelText; test będzie bliżej użytkownika.",
      "Nie testuj hooków i stanu, jeśli możesz sprawdzić tekst, rolę lub zachowanie.",
      "Komponent testing jest świetny dla wariantów błędów i stanów ładowania.",
      "Trudny test często sygnalizuje zbyt duży komponent."
    ],
    "commonMistakes": [
      {
        "mistake": "Selektory CSS w testach komponentów",
        "solution": "Preferuj zapytania dostępnościowe."
      },
      {
        "mistake": "Testowanie implementacji Reacta",
        "solution": "Sprawdzaj DOM i zachowanie widoczne dla użytkownika."
      },
      {
        "mistake": "Zbyt duży zakres testu komponentu",
        "solution": "Prawdziwe integracje zostaw testom API/E2E."
      },
      {
        "mistake": "Brak testów stanów błędu",
        "solution": "Mockuj odpowiedź błędną i sprawdzaj komunikat."
      }
    ]
  }
};
