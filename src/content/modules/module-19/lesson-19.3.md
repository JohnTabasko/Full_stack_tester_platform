# React Testing Library i testowanie komponentów

> Moduł dziewiętnasty pokazuje, jak testować niższe poziomy aplikacji, aby nie przepychać każdego ryzyka przez wolne testy end-to-end. Testy jednostkowe, komponentowe i integracyjne skracają feedback oraz pomagają precyzyjniej wskazać przyczynę awarii.

## Jak czytać ten moduł

Czytaj ten moduł jako uzupełnienie Playwright E2E. Pytanie nie brzmi „czy pisać E2E albo unit”, lecz „który poziom testu da najlepszą informację przy najniższym koszcie”. Dobrze zaprojektowana automatyzacja łączy poziomy.

Trzy zasady modułu:

1. **Testuj możliwie nisko, ale wystarczająco realistycznie.** Reguły domenowe nie muszą iść przez UI.
2. **Mocki zmniejszają koszt i realizm.** Używaj ich świadomie.
3. **Komponent i integracja mają własną wartość.** Nie są tylko etapem pośrednim między unit i E2E.


## Cel lekcji

Ta lekcja koncentruje się na: **testowanie komponentów przez zachowanie użytkownika, zapytania dostępnościowe, zdarzenia, granice komponentów i relacja z testami komponentowymi Playwright**. Główne ryzyko: **test komponentu sprawdza stan wewnętrzny Reacta albo klasy CSS zamiast zachowania widocznego dla użytkownika**. Po lekturze powinieneś umieć dobrać poziom testu do ryzyka i zaprojektować test niższego poziomu, który uzupełnia E2E.

## Sytuacja przewodnia

formularz logowania ma walidację pól, komunikat błędu i wywołanie callbacka po poprawnym wysłaniu

## 1. Filozofia RTL

React Testing Library zachęca do testowania komponentu tak, jak używa go użytkownik: przez tekst, role, etykiety i zdarzenia.

## 2. Zapytania dostępnościowe

getByRole i getByLabelText są lepsze niż selektory klas, bo sprawdzają publiczny interfejs komponentu i dostępność.

## 3. userEvent

userEvent symuluje interakcje bliższe użytkownikowi niż bezpośrednie wywołanie handlera. Dzięki temu test obejmuje walidację i zdarzenia DOM.

## 4. Granica komponentu

Komponent powinien być testowany w swoim zakresie. Jeżeli test wymaga pełnego routingu, backendu i przeglądarki, być może powinien być E2E.

## 5. RTL a Playwright CT

RTL jest szybkie i świetne dla logiki komponentu. Playwright Component Testing daje prawdziwsze środowisko przeglądarki i lepsze testy wizualne.

## Przykład referencyjny

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { LoginForm } from './LoginForm';

it('pokazuje błąd dla pustego hasła', async () => {
  const onSubmit = vi.fn();
  render(<LoginForm onSubmit={onSubmit} />);

  await userEvent.type(screen.getByLabelText('Adres e-mail'), 'anna@example.test');
  await userEvent.click(screen.getByRole('button', { name: 'Zaloguj' }));

  expect(screen.getByRole('alert')).toHaveTextContent('Hasło jest wymagane');
  expect(onSubmit).not.toHaveBeenCalled();
});
```

Przykład pokazuje, że niższy poziom testu powinien mieć jasną odpowiedzialność. Test jednostkowy, komponentowy i integracyjny nie konkurują z E2E — uzupełniają go.

## Lista kontrolna

- Czy wybrany poziom testu pasuje do ryzyka?
- Czy test nie sprawdza prywatnej implementacji bez potrzeby?
- Czy mock nie kłamie o kontrakcie zależności?
- Czy dane testowe są małe i czytelne?
- Czy awaria wskazuje konkretną warstwę?
- Czy test niższego poziomu ogranicza potrzebę wolnego testu E2E?


## Dobre praktyki i perspektywa inżynierska
Automatyzacja to proces ciągłego doskonalenia. Aby Twoje testy niosły realną wartość, stosuj się do poniższych zasad:
- **Testuj zachowanie, nie kod**: Skup się na tym, co widzi i robi użytkownik. Zmienne nazwy klas CSS nie powinny psuć Twoich testów.
- **Fail-fast**: Test powinien dawać jasny sygnał o błędzie tak szybko, jak to możliwe. Unikaj "wiszących" testów, które blokują kolejkę CI.
- **Ewoluuj**: Regularnie przeglądaj swoje testy. Usuwaj te, które są niestabilne i nie dają wartości, a refaktoryzuj te, które stają się zbyt skomplikowane.

## Głębsza analiza: Dostępność

Playwright integruje się z silnikiem `axe-core`. Możesz automatycznie skanować strony pod kątem zgodności z WCAG:
```typescript
import { injectAxe, checkA11y } from 'axe-playwright';
await injectAxe(page);
await checkA11y(page);
```
To pozwala na wykrycie błędów kontrastu, brakujących atrybutów `alt` czy niepoprawnej struktury nagłówków.
