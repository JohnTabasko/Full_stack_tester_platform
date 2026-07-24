# Testowanie komponentów frontendowych w JSDOM (React Testing Library)

Podczas gdy Playwright Component Testing (CT) renderuje komponenty w rzeczywistych przeglądarkach, tradycyjnym i niesamowicie szybkim standardem w rurociągach testów jednostkowych frontendu jest weryfikacja przy użyciu **React Testing Library (RTL)** uruchamianego w konsoli wewnątrz emulowanego środowiska **JSDOM**.

Projektowanie stabilnych testów RTL opiera się na unikalnych zasadach przewodnich (Guiding Principles) sformułowanych przez twórcę biblioteki, Kenta C. Doddsa. W tej lekcji nauczysz się pisać testy odporne na zmiany implementacyjne.

---

## 1. Złota Zasada RTL: Testowanie zachowania, nie szczegółów (Guiding Principle)

> *„Im bardziej Twoje testy przypominają sposób, w jaki użytkownik korzysta z aplikacji, tym więcej zaufania mogą Ci przynieść.”*

React Testing Library odrzuca testowanie szczegółów technicznych (takich jak sprawdzanie wewnętrznego stanu komponentu `state`, nazw funkcji pomocniczych czy struktury drzewa propsów). Test ma traktować komponent jak **czarną skrzynkę**:
*   Renderujemy komponent w JSDOM.
*   Wyszukujemy elementy przy użyciu lokalizatorów semantycznych (dokładnie tak, jak w Playwright!).
*   Symulujemy fizyczne akcje użytkownika.
*   Sprawdzamy zmiany w strukturze strony.

---

## 2. Prawidłowy dobór zapytań (RTL Queries)

Wyszukiwanie elementów w RTL posiada identyczną hierarchię priorytetów co w Playwright. Zawsze wybieraj lokalizatory semantyczne i oparte o dostępność:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WelcomeCard } from './WelcomeCard';

test('komponent wita użytkownika po kliknięciu', async () => {
  // 1. Wyrenderuj komponent w JSDOM
  render(<WelcomeCard title="Witaj na pokładzie" />);

  // 2. Wyszukaj przycisk semantyczną rolą (A11y)
  const button = screen.getByRole('button', { name: 'Rozpocznij' });
  expect(button).toBeInTheDocument();

  // 3. Symuluj interakcję za pomocą pakietu user-event (Rekomendowane)
  await userEvent.click(button);

  // 4. Weryfikuj zmianę stanu wizualnego
  expect(screen.getByText('Proces został uruchomiony!')).toBeInTheDocument();
});
```

---

## 3. `userEvent` vs `fireEvent` (Pułapka Antywzorca)

W starszych testach możesz spotkać metodę `fireEvent.click(element)`. Jest to **antywzorzec**:
*   `fireEvent` wyzwala surowe zdarzenie w drzewie DOM w ułamku sekundy, ignorując zachowanie prawdziwego systemu (nie sprawdza, czy element jest włączony, nie najeżdża myszką itp.).
*   `userEvent` w pełni emuluje fizyczny cykl życia zdarzenia klawiatury/myszy (wyzwala kolejno `hover`, `focus`, `mousedown`, `click`), co gwarantuje najwyższą spójność z rzeczywistością.

---

## 4. Checklista React Testing Library
- [ ] Czy Twoje testy RTL sprawdzają zachowanie komponentu z perspektywy użytkownika, całkowicie ignorując stan wewnętrzny (`state`/`props`)?
- [ ] Czy do wyszukiwania elementów stosujesz wyłącznie zapytania semantyczne (`getByRole`, `getByLabelText`)?
- [ ] Czy do symulowania interakcji konsekwentnie stosujesz nowoczesny pakiet `@testing-library/user-event`?
- [ ] Czy wyeliminowałeś przestarzałe wywołania `fireEvent` ze swoich testów frontendowych?