import type { Lesson } from "../../../renderer/types";
import theory19_3 from './lesson-19.3.md?raw';

export const lesson19_3: Lesson = {
  "id": "19.3",
  "moduleId": 19,
  "title": "React Testing Library i testowanie komponentów",
  "description": "React Testing Library: guiding principles, queries priority, screen, within, userEvent, async queries, MSW i porównanie RTL/CT/E2E.",
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
      "import { render, screen, within } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\n\ntest('submits login form', async () => {\n  const user = userEvent.setup();\n  const onSubmit = vi.fn();\n  render(<LoginForm onSubmit={onSubmit} />);\n\n  await user.type(screen.getByLabelText('Email'), 'qa@example.test');\n  await user.type(screen.getByLabelText('Hasło'), 'secret');\n  await user.click(screen.getByRole('button', { name: 'Zaloguj' }));\n\n  expect(onSubmit).toHaveBeenCalledWith({ email: 'qa@example.test', password: 'secret' });\n});",
      "const dialog = screen.getByRole('dialog', { name: 'Potwierdź usunięcie' });\nawait user.click(within(dialog).getByRole('button', { name: 'Usuń' }));",
      "server.use(\n  http.get('/api/products', () => HttpResponse.json({ code: 'ERROR' }, { status: 500 }))\n);\nrender(<ProductsList />);\nexpect(await screen.findByRole('alert')).toHaveTextContent('Nie udało się pobrać produktów');"
],
    "exercises": [
      {
            "id": "ex-auto-1",
            "title": "Ćwiczenie 1",
            "description": "Napisz test formularza, używając `getByLabelText`, `getByRole` i `userEvent`."
      },
      {
            "id": "ex-auto-2",
            "title": "Ćwiczenie 2",
            "description": "Przepisz test używający `querySelector` na Testing Library queries."
      },
      {
            "id": "ex-auto-3",
            "title": "Ćwiczenie 3",
            "description": "Dodaj test błędu API z MSW i `findByRole`."
      },
      {
            "id": "ex-auto-4",
            "title": "Ćwiczenie 4",
            "description": "Porównaj, które przypadki powinny zostać w RTL, a które przenieść do Playwright CT lub E2E."
      }
],
    "quiz": [
      {
            "id": "q-auto-1",
            "question": "Jaka jest główna zasada Testing Library?",
            "options": [
                  "Testy mają przypominać sposób użycia aplikacji przez użytkownika",
                  "Testy mają czytać prywatny state",
                  "Najważniejsze są klasy CSS",
                  "Snapshot zastępuje asercje"
            ],
            "correctAnswer": 0,
            "explanation": "To sprawdza zrozumienie praktycznego zastosowania lekcji."
      },
      {
            "id": "q-auto-2",
            "question": "Kiedy użyć `findBy`?",
            "options": [
                  "Gdy element pojawia się asynchronicznie",
                  "Zawsze zamiast getBy",
                  "Tylko dla CSS",
                  "Nigdy"
            ],
            "correctAnswer": 0,
            "explanation": "To sprawdza zrozumienie praktycznego zastosowania lekcji."
      },
      {
            "id": "q-auto-3",
            "question": "Po co `within`?",
            "options": [
                  "Aby zawęzić wyszukiwanie do kontenera",
                  "Aby wyłączyć dostępność",
                  "Aby mockować API",
                  "Aby uruchomić CI"
            ],
            "correctAnswer": 0,
            "explanation": "To sprawdza zrozumienie praktycznego zastosowania lekcji."
      },
      {
            "id": "q-auto-4",
            "question": "Czym jest `data-testid` według RTL?",
            "options": [
                  "Escape hatch, gdy semantyczne queries nie mają sensu",
                  "Pierwszy wybór dla każdego elementu",
                  "Zamiennik labela",
                  "Narzędzie do stylowania"
            ],
            "correctAnswer": 0,
            "explanation": "To sprawdza zrozumienie praktycznego zastosowania lekcji."
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
        "title": "React Testing Library",
        "url": "https://testing-library.com/docs/react-testing-library/intro/",
        "description": "Oficjalny wstęp do RTL."
      },
      {
        "title": "Testing Library Guiding Principles",
        "url": "https://testing-library.com/docs/guiding-principles",
        "description": "Zasada testowania jak użytkownik."
      },
      {
        "title": "Playwright Component Testing",
        "url": "https://playwright.dev/docs/test-components",
        "description": "Porównanie z component testing w prawdziwej przeglądarce."
      }
    ],
    "tipsAndTricks": [
      "Zawsze opieraj architekturę testów na zasadach SOLID, unikając przedwczesnej abstrakcji zgodnie z zasadą WET (Write Everything Twice) z podręczników 2026.",
      
      "Zaczynaj od `getByRole` i `getByLabelText`.",
      "Używaj `userEvent`, bo lepiej symuluje zachowanie użytkownika.",
      "MSW mockuje HTTP bliżej realnej granicy niż mock modułu.",
      "Jeśli test jest trudny przez brak roli/labela, popraw komponent."
],
    "commonMistakes": [
      {
            "mistake": "Testowanie klas CSS",
            "solution": "Testuj role, label, tekst i zachowanie."
      },
      {
            "mistake": "Brak await przy async UI",
            "solution": "Użyj `findBy` albo `waitFor`."
      },
      {
            "mistake": "Nadużywanie snapshotów",
            "solution": "Dodaj konkretne asercje zachowania."
      }
]
  }
};
