# Podstawy Vitest i Jest

> Moduł dziewiętnasty pokazuje, jak testować niższe poziomy aplikacji, aby nie przepychać każdego ryzyka przez wolne testy end-to-end. Testy jednostkowe, komponentowe i integracyjne skracają feedback oraz pomagają precyzyjniej wskazać przyczynę awarii.

## Jak czytać ten moduł

Czytaj ten moduł jako uzupełnienie Playwright E2E. Pytanie nie brzmi „czy pisać E2E albo unit”, lecz „który poziom testu da najlepszą informację przy najniższym koszcie”. Dobrze zaprojektowana automatyzacja łączy poziomy.

Trzy zasady modułu:

1. **Testuj możliwie nisko, ale wystarczająco realistycznie.** Reguły domenowe nie muszą iść przez UI.
2. **Mocki zmniejszają koszt i realizm.** Używaj ich świadomie.
3. **Komponent i integracja mają własną wartość.** Nie są tylko etapem pośrednim między unit i E2E.


## Cel lekcji

Ta lekcja koncentruje się na: **struktura testów jednostkowych, matchery, setup, coverage, testowanie funkcji domenowych i rola testów jednostkowych w piramidzie testów**. Główne ryzyko: **zespół przenosi zbyt wiele logiki do wolnych testów E2E albo pisze testy jednostkowe związane z implementacją zamiast z zachowaniem funkcji**. Po lekturze powinieneś umieć dobrać poziom testu do ryzyka i zaprojektować test niższego poziomu, który uzupełnia E2E.

## Sytuacja przewodnia

funkcja obliczania rabatu ma wiele wariantów: kod procentowy, limit kwoty, minimalna wartość koszyka, wygasły kupon i wykluczone kategorie

## 1. Miejsce testów jednostkowych

Test jednostkowy daje szybki feedback o małym fragmencie logiki. Nie sprawdza całego systemu, ale świetnie nadaje się do reguł obliczeniowych, walidacji i funkcji domenowych.

## 2. Vitest i Jest

Vitest i Jest mają podobny styl: describe, it/test, expect, setup, mocki i coverage. Wybór narzędzia jest mniej ważny niż jakość projektowania testów.

## 3. Struktura testu

Czytelny test ma przygotowanie, działanie i asercję. Jeśli w jednym teście jest wiele niezależnych przypadków, diagnoza awarii będzie trudniejsza.

## 4. Matchery

Matchery powinny odpowiadać typowi danych i intencji. Inaczej porównujesz liczby, inaczej obiekty, inaczej błędy i kolekcje.

## 5. Coverage

Coverage mówi, które linie zostały wykonane, ale nie mówi, czy sprawdzono sensowne zachowanie. Wysokie pokrycie bez asercji wartościowych jest złudzeniem.

## Przykład referencyjny

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
