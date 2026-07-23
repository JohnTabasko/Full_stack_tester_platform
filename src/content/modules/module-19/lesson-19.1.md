# Podstawy Vitest i Jest

Testy jednostkowe są najtańszą warstwą automatyzacji. Dają szybki feedback o logice, walidacji, mapperach, helperach i regułach domenowych. Dobrze zaprojektowane testy jednostkowe ograniczają liczbę wolnych testów E2E, bo nie każdą kombinację trzeba przepychać przez przeglądarkę.

Vitest i Jest mają podobny styl pracy: `describe`, `test`/`it`, `expect`, matchery, setup/teardown, mocki, fake timers i coverage. W projektach Vite naturalnym wyborem jest często Vitest, bo integruje się z Vite i jest szybki. Jest nadal jest bardzo popularny i dojrzały, szczególnie w starszych projektach.

## 1. Kiedy pisać test jednostkowy

Test jednostkowy jest dobry dla:

- funkcji obliczeniowych;
- walidatorów;
- transformacji danych;
- parserów;
- reguł biznesowych;
- helperów używanych w testach;
- builderów danych;
- funkcji obsługi błędów.

Przykład: obliczanie rabatu ma wiele wariantów. Testowanie każdego przez UI byłoby wolne i kruche. Test jednostkowy jest lepszy.

## 2. Minimalny test Vitest

```typescript
import { describe, expect, it } from 'vitest';
import { calculateDiscount } from './discounts';

describe('calculateDiscount', () => {
  it('nalicza rabat procentowy do maksymalnej kwoty', () => {
    const result = calculateDiscount({
      cartTotal: 300,
      coupon: { type: 'percent', value: 20, maxDiscount: 50 },
    });

    expect(result.discount).toBe(50);
    expect(result.totalAfterDiscount).toBe(250);
  });
});
```

Test ma Arrange, Act i Assert. Dane są małe, a asercja mówi o zachowaniu domenowym.

## 3. Minimalny test Jest

```typescript
import { calculateDiscount } from './discounts';

test('nalicza rabat kwotowy', () => {
  const result = calculateDiscount({
    cartTotal: 100,
    coupon: { type: 'fixed', value: 15 },
  });

  expect(result.totalAfterDiscount).toBe(85);
});
```

Jest i Vitest mają podobne matchery. Różnice pojawiają się w konfiguracji, integracji z Vite, ESM, wydajności i API mockowania.

## 4. Matchery

Dobieraj matcher do intencji:

```typescript
expect(total).toBe(100);
expect(order).toEqual({ id: '1', status: 'PAID' });
expect(order).toMatchObject({ status: 'PAID' });
expect(items).toEqual(expect.arrayContaining(['BOOK-1']));
expect(email).toMatch(/@example\.test$/);
expect(() => parseAmount('abc')).toThrow('Invalid amount');
```

Nie używaj zbyt ogólnych asercji:

```typescript
expect(result).toBeTruthy(); // za słabe
```

## 5. Setup i teardown

```typescript
beforeEach(() => {
  // przygotuj świeży stan
});

afterEach(() => {
  // posprzątaj mocki, timery, globalny stan
});
```

W testach jednostkowych unikaj współdzielonego mutowalnego stanu. Jeśli testy zależą od kolejności, są źle zaprojektowane.

## 6. Testy parametryzowane

Dla wielu wariantów użyj `it.each` / `test.each`:

```typescript
it.each([
  { input: 0, expected: false },
  { input: 18, expected: true },
  { input: 65, expected: true },
  { input: 66, expected: false },
])('waliduje wiek $input', ({ input, expected }) => {
  expect(isEligibleAge(input)).toBe(expected);
});
```

To dobre dla wartości brzegowych i klas równoważności.

## 7. Coverage

Coverage pokazuje, które linie zostały wykonane. Nie mówi, czy testy mają sens. 100% coverage z asercjami `toBeTruthy` może być mniej wartościowe niż 60% coverage dobrze dobranych reguł biznesowych.

Używaj coverage do wykrywania luk, ale nie jako jedynej miary jakości.

## 8. Fake timers

Dla kodu zależnego od czasu używaj fake timers:

```typescript
import { vi } from 'vitest';

vi.useFakeTimers();
const callback = vi.fn();
setTimeout(callback, 1000);
vi.advanceTimersByTime(1000);
expect(callback).toHaveBeenCalled();
vi.useRealTimers();
```

To lepsze niż realne czekanie.

## 9. Vitest vs Jest — praktyczny wybór

Vitest:

- naturalny dla Vite;
- szybki watch mode;
- dobre wsparcie ESM;
- API podobne do Jest.

Jest:

- bardzo dojrzały ekosystem;
- wiele istniejących projektów;
- bogata dokumentacja;
- czasem trudniejsza integracja z nowoczesnym ESM/Vite.

Wybór narzędzia jest mniej ważny niż zasady: testuj zachowanie, trzymaj dane małe, unikaj nadmiernego mockowania.

## 10. Checklista testu jednostkowego

- Czy test sprawdza zachowanie, nie implementację?
- Czy dane są małe i czytelne?
- Czy asercja jest konkretna?
- Czy test nie zależy od kolejności?
- Czy warianty brzegowe są pokryte?
- Czy fake timers zastępują realne czekanie?
- Czy test jednostkowy ogranicza potrzebę wolnego E2E?

## Linki

- [Vitest Getting Started](https://vitest.dev/guide/)
- [Jest Getting Started](https://jestjs.io/docs/getting-started)
- [Jest Matchers](https://jestjs.io/docs/using-matchers)
- [Testing Library Guiding Principles](https://testing-library.com/docs/guiding-principles)

## 11. Organizacja plików

Typowe konwencje:

```text
src/discounts.ts
src/discounts.test.ts
```

albo:

```text
src/discounts.ts
__tests__/discounts.spec.ts
```

Najważniejsza jest spójność. Testy jednostkowe powinny być blisko kodu albo łatwe do odnalezienia. W projektach TypeScript warto uruchamiać też `tsc --noEmit`, bo runner testów nie zawsze pełni rolę pełnego typechecku.

## 12. Testowanie błędów

Nie testuj tylko ścieżki sukcesu. Dla funkcji domenowej sprawdź błędne dane:

```typescript
expect(() => calculateDiscount({ cartTotal: -1, coupon })).toThrow('Invalid cart total');
```

Jeśli funkcja jest asynchroniczna:

```typescript
await expect(service.createOrder({ items: [] })).rejects.toThrow(/validation/i);
```

## 13. Antywzorce unit tests

- testowanie prywatnych metod zamiast publicznego zachowania;
- snapshoty dużych obiektów bez intencji;
- asercje `toBeTruthy` bez sprawdzenia wartości;
- wiele niezależnych przypadków w jednym teście;
- mockowanie wszystkiego bez testu integracyjnego;
- ignorowanie wartości brzegowych.

## 14. Testy jednostkowe a projektowanie API funkcji

Jeśli funkcja jest trudna do przetestowania jednostkowo, to często sygnał złego projektu. Funkcja, która czyta czas, environment, bazę i sieć jednocześnie, będzie trudna do izolacji. Wydziel zależności jako argumenty albo adaptery.

```typescript
calculateDiscount(cart, coupon, { now: fixedDate })
```

Taki kod jest łatwiejszy do testowania niż funkcja, która sama wywołuje `new Date()` i pobiera konfigurację globalną.

## 15. Testy jednostkowe w CI

Unit suite powinien być szybki i działać w każdym PR. Jeśli testy jednostkowe trwają długo, sprawdź, czy przypadkiem nie uruchamiają prawdziwych baz, sieci albo przeglądarki. Takie testy należą raczej do integracyjnych.

## 16. Co powinien zobaczyć reviewer

Reviewer testu jednostkowego powinien łatwo zrozumieć:

- jakie zachowanie jest sprawdzane;
- jakie dane są istotne;
- dlaczego oczekiwany wynik jest poprawny;
- czy są przypadki brzegowe;
- czy test nie jest zbyt mocno związany z implementacją.

## 📘 Suplement Inżynieryjny 2026: Testy Jednostkowe, Integracyjne i Komponentowe
*Inspiracja: „Practical Playwright Test” (2026), Chapter 11*
*   **Playwright Component Testing (CT)**: Testowanie komponentów w rzeczywistym środowisku przeglądarki (np. React, Vue) łączy realizm testów E2E z szybkością wykonania testów jednostkowych, tworząc optymalne środowisko do testowania odizolowanego UI.
