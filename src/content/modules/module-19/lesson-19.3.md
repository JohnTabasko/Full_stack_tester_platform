# React Testing Library i testowanie komponentów

React Testing Library pomaga testować komponenty z perspektywy użytkownika. Jej podstawowa zasada brzmi: im bardziej test przypomina sposób użycia aplikacji przez użytkownika, tym większą daje pewność. To podejście jest spójne z Playwright: preferuj role, label, tekst i dostępność zamiast szczegółów implementacji.

RTL nie jest runnerem testów. Najczęściej używa się jej z Vitest albo Jest. RTL dostarcza narzędzia do renderowania komponentów, wyszukiwania elementów i wykonywania interakcji.

## 1. Kiedy używać React Testing Library

RTL jest dobra dla:

- komponentów formularzy;
- modali;
- menu;
- komponentów z walidacją;
- komponentów reagujących na propsy;
- komponentów z prostym stanem;
- dostępności i keyboard interactions.

Nie zastępuje E2E. RTL sprawdza komponent w izolacji, a Playwright E2E sprawdza cały system.

## 2. Minimalny test

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

test('wysyła formularz logowania', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();

  render(<LoginForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText('Email'), 'user@example.com');
  await user.type(screen.getByLabelText('Hasło'), 'secret');
  await user.click(screen.getByRole('button', { name: 'Zaloguj' }));

  expect(onSubmit).toHaveBeenCalledWith({
    email: 'user@example.com',
    password: 'secret',
  });
});
```

Test używa labeli i roli przycisku — tak jak użytkownik i czytnik ekranu.

## 3. Priorytet queries

Testing Library promuje kolejność queries:

1. `getByRole`;
2. `getByLabelText`;
3. `getByPlaceholderText`;
4. `getByText`;
5. `getByDisplayValue`;
6. `getByAltText`;
7. `getByTitle`;
8. `getByTestId` jako escape hatch.

`data-testid` jest użyteczne, ale nie powinno zastępować poprawnej semantyki HTML.

## 4. `screen`, `within` i kontenery

```typescript
const dialog = screen.getByRole('dialog', { name: 'Potwierdź usunięcie' });
await user.click(within(dialog).getByRole('button', { name: 'Usuń' }));
```

`within` ogranicza wyszukiwanie do konkretnego kontenera, podobnie jak zagnieżdżone locatory w Playwright.

## 5. Async queries

Jeśli element pojawia się po czasie:

```typescript
await user.click(screen.getByRole('button', { name: 'Zapisz' }));
expect(await screen.findByText('Zapisano')).toBeInTheDocument();
```

`findBy` czeka na element. `getBy` jest natychmiastowe i rzuca błąd, jeśli elementu nie ma.

`waitFor` jest dobre, gdy czekasz na warunek:

```typescript
await waitFor(() => {
  expect(api.save).toHaveBeenCalledTimes(1);
});
```

## 6. userEvent zamiast fireEvent

`userEvent` lepiej symuluje realne zachowanie użytkownika: focus, keyboard, input events. `fireEvent` jest niższopoziomowe i powinno być używane rzadziej.

## 7. Mockowanie API w komponentach

Jeśli komponent pobiera dane, użyj MSW albo przekaż dane przez propsy. MSW jest dobre, gdy chcesz testować zachowanie komponentu wobec HTTP:

```typescript
server.use(
  http.get('/api/products', () => HttpResponse.json([{ id: 'p1', name: 'Laptop' }]))
);
```

Nie mockuj wewnętrznych szczegółów komponentu, jeśli możesz mockować granicę HTTP.

## 8. RTL vs Playwright Component Testing vs E2E

RTL:

- szybkie testy komponentów w jsdom;
- dobre dla logiki UI i formularzy;
- nie jest prawdziwą przeglądarką.

Playwright Component Testing:

- komponent w prawdziwej przeglądarce;
- dobre dla layoutu, focusu, visual snapshots;
- cięższe niż RTL.

Playwright E2E:

- cały system;
- najlepsze dla krytycznych flow;
- najdroższe.

## 9. Antywzorce

- Testowanie state hooków zamiast zachowania UI.
- Wyszukiwanie po klasach CSS.
- Nadużywanie `data-testid`.
- Mockowanie całych komponentów potomnych bez potrzeby.
- Asercje na szczegóły implementacji.
- Brak testów klawiatury dla komponentów interaktywnych.

## 10. Checklista RTL

- Czy test używa queries jak użytkownik?
- Czy komponent ma accessible roles/labels?
- Czy interakcje używają `userEvent`?
- Czy async UI używa `findBy`/`waitFor`?
- Czy mocki są na granicy systemu, np. HTTP?
- Czy test nie dubluje pełnego E2E bez potrzeby?

## Linki

- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Guiding Principles](https://testing-library.com/docs/guiding-principles)
- [Vitest Guide](https://vitest.dev/guide/)
- [MSW Documentation](https://mswjs.io/docs/)
- [Playwright Component Testing](https://playwright.dev/docs/test-components)

## 11. Testowanie formularzy

Formularze testuj przez etykiety i komunikaty:

```typescript
await user.click(screen.getByRole('button', { name: 'Zapisz' }));
expect(await screen.findByRole('alert')).toHaveTextContent('Email jest wymagany');
```

To sprawdza zachowanie użytkownika, a nie implementację walidatora.

## 12. Testy klawiatury

Komponenty dostępne powinny działać klawiaturą:

```typescript
await user.tab();
expect(screen.getByRole('button', { name: 'Zapisz' })).toHaveFocus();
await user.keyboard('{Enter}');
```

Takie testy często wykrywają problemy dostępności wcześniej niż E2E.

## 13. Antywzorce RTL

- `container.querySelector('.btn')` zamiast `getByRole`;
- sprawdzanie nazw klas CSS;
- testowanie wewnętrznego state;
- nadużywanie snapshotów;
- brak `await` przy async UI;
- zbyt dużo mocków komponentów potomnych.

## 14. Render z providerami

Komponenty często wymagają routera, store, i18n albo theme providera. Stwórz helper:

```typescript
function renderWithProviders(ui: React.ReactElement) {
  return render(
    <TestProviders locale="pl" theme="light">
      {ui}
    </TestProviders>
  );
}
```

Helper powinien być mały i jawny. Jeśli odtwarza całą aplikację, test komponentu traci sens.

## 15. Testowanie błędów API w komponencie

Komponent powinien pokazać błąd, gdy API zwróci 500:

```typescript
server.use(http.get('/api/products', () => HttpResponse.json({ code: 'ERROR' }, { status: 500 })));
renderWithProviders(<ProductsList />);
expect(await screen.findByRole('alert')).toHaveTextContent('Nie udało się pobrać produktów');
```

Taki test jest szybszy niż E2E i pozwala sprawdzić edge case, który trudno wywołać w stagingu.

## 16. RTL a dostępność

Jeśli test nie może znaleźć pola przez label albo przycisku przez role/name, prawdopodobnie komponent ma problem dostępności. Nie traktuj `data-testid` jako pierwszego rozwiązania. Najpierw popraw semantykę.

## 17. Zasada końcowa

Test komponentu powinien dawać pewność, że użytkownik może wykonać interakcję, a nie że wewnętrzne hooki zmieniły stan w oczekiwany sposób.

Koniec.
 Gotowe.
 Teraz.

## 📘 Suplement Inżynieryjny 2026: Testy Jednostkowe, Integracyjne i Komponentowe
*Inspiracja: „Practical Playwright Test” (2026), Chapter 11*
*   **Playwright Component Testing (CT)**: Testowanie komponentów w rzeczywistym środowisku przeglądarki (np. React, Vue) łączy realizm testów E2E z szybkością wykonania testów jednostkowych, tworząc optymalne środowisko do testowania odizolowanego UI.
