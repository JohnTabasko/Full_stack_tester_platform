import type { Lesson } from '../../../renderer/types';
import theory19_3 from './lesson-19.3.md?raw';

export const lesson19_3: Lesson = {
  "id": "19.3",
  "moduleId": 19,
  "title": "React Testing Library i testowanie komponentów",
  "description": "Opanuj testowanie komponentów frontendowych w JSDOM. Poznaj zasady przewodnie React Testing Library (RTL), zapytania semantyczne oraz bezpieczną emulację zdarzeń za pomocą user-event.",
  "order": 3,
  "difficulty": "intermediate",
  "tags": ["React-Testing-Library", "RTL", "JSDOM", "user-event", "queries", "unit-testing"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz pisać stabilne testy komponentów w JSDOM, stosować zasady przewodnie RTL w celu testowania czarnej skrzynki, dobierać semantyczne zapytania oraz emulować zdarzenia użytkownika przy użyciu user-event.",
    "theory": theory19_3,
    "codeExamples": [
      `// Przykład testu w React Testing Library (Książka 2 - Greffier)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
render(<Button label="Zapisz" />);
await userEvent.click(screen.getByRole('button', { name: 'Zapisz' }));`
    ],
    "exercises": [
      {
        "id": "ex-19-3-1",
        "title": "Test komponentu rejestracji z walidacją",
        "description": "Zaprojektuj test RTL dla komponentu `RegisterForm`. Upewnij się, że po kliknięciu wyślij bez wpisania hasła, na ekranie pojawia się semantyczna etykieta błędu 'Hasło jest wymagane'."
      }
    ],
    "quiz": [
      {
        "id": "q19-3-1",
        "question": "Dlaczego stosowanie pakietu @testing-library/user-event jest rekomendowane zamiast tradycyjnego fireEvent w testach React Testing Library?",
        "options": [
          "Ponieważ user-event w pełni i asynchronicznie emuluje cały cykl fizycznych zdarzeń klawiatury/myszy (hover, focus, click), zbliżając test do realiów przeglądarki",
          "Ponieważ user-event nie wymaga stosowania słowa kluczowego await",
          "Ponieważ fireEvent nie działa w języku polskim",
          "Nie ma między nimi żadnej różnicy"
        ],
        "correctAnswer": 0,
        "explanation": "user-event symuluje pełen cykl zdarzeń systemu operacyjnego (np. przed kliknięciem najeżdża na element i ustawia na nim focus), podczas gdy fireEvent tylko wysyła bezgłowe, surowe zdarzenie do drzewa DOM."
      }
    ],
    "references": [
      {
        "title": "Practical Playwright Test (Jean-François Greffier, 2026)",
        "url": "https://doi.org/10.1007/979-8-8688-2160-8",
        "description": "Chapter 11: Beyond End-to-End Testing (Component testing principles)."
      }
    ],
    "tipsAndTricks": [
      "Korzystaj z metody screen.debug() podczas pisania testu, aby wyrenderować aktualne drzewo HTML emulowanego JSDOM bezpośrednio w oknie terminala i ułatwić lokalizowanie elementów."
    ],
    "commonMistakes": [
      {
        "mistake": "Testowanie szczegółów implementacji technicznej (np. sprawdzanie nazw metod wewnątrz klasy komponentu)",
        "solution": "Testuj komponent wyłącznie przez interakcje z perspektywy użytkownika – klikaj elementy i weryfikuj zmiany tekstu."
      }
    ]
  }
};