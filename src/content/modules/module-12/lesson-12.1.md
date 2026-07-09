# Zasady projektowania testów

> Moduł dwunasty zbiera zasady, które decydują o długowieczności automatyzacji. Dobre testy to nie tylko poprawne użycie Playwrighta, ale także czytelny projekt, spójne standardy, review, refaktoryzacja i unikanie antywzorców.

## Jak czytać ten moduł

Czytaj ten moduł jak poradnik utrzymania jakości kodu testowego. Każda decyzja, która dziś skraca pracę o pięć minut, może za pół roku kosztować wiele godzin, jeśli utrudni diagnostykę albo zmianę. Profesjonalny tester automatyzujący myśli nie tylko o tym, czy test przejdzie dzisiaj, ale czy będzie zrozumiały po zmianie produktu i zespołu.

Trzy zasady modułu:

1. **Test ma chronić ryzyko.** Nie automatyzuj dla samej liczby testów.
2. **Kod testowy wymaga standardów.** Bez standardów każdy autor buduje własny mini-framework.
3. **Antywzorce trzeba usuwać wcześnie.** Im dłużej istnieją, tym częściej są kopiowane.


## Cel lekcji

Ta lekcja koncentruje się na: **piramida testów, AAA, Given-When-Then, niezależność, deterministyczność, testowanie oparte na ryzyku oraz podział smoke/regression**. Główne ryzyko: **zespół automatyzuje przypadkowe scenariusze na zbyt wysokim poziomie, przez co pakiet jest wolny, kruchy i słabo powiązany z ryzykiem produktu**. Po lekturze powinieneś umieć ocenić praktykę testową pod kątem wartości, utrzymywalności i kosztu długoterminowego.

## Sytuacja przewodnia

nowa funkcja płatności ma walidację kwot, integrację z API, komunikaty UI i zapis statusu zamówienia; zespół musi zdecydować, co testować na którym poziomie

## 1. Projektowanie od ryzyka

Dobry test zaczyna się od ryzyka, a nie od narzędzia. Najpierw ustal, co może pójść źle i jaki byłby wpływ błędu na użytkownika lub biznes.

## 2. Piramida testów

Piramida testów przypomina, że większość reguł powinna być sprawdzana niżej: jednostkowo i integracyjnie. Test E2E powinien potwierdzać krytyczne przepływy, nie każdą kombinację walidacji.

## 3. AAA

Arrange, Act, Assert porządkuje test: przygotuj stan, wykonaj działanie, sprawdź rezultat. Jeśli te fazy mieszają się chaotycznie, test będzie trudny do diagnozy.

## 4. Given-When-Then

Given-When-Then pomaga opisywać zachowanie językiem biznesowym. Jest szczególnie przydatne w rozmowie z analitykami i product ownerami.

## 5. Smoke i regresja

Smoke powinien być szybkim sygnałem, że najważniejsze ścieżki żyją. Regresja może być szersza, ale powinna być nadal oparta o ryzyko.

## Przykład referencyjny

```typescript
import { test, expect } from '@playwright/test';

test.describe('płatność kartą', () => {
  test('klient widzi potwierdzenie po poprawnej płatności @critical', async ({ page }) => {
    // Arrange
    await page.goto('/checkout?cart=single-paid-product');

    // Act
    await page.getByRole('button', { name: 'Zapłać kartą' }).click();

    // Assert
    await expect(page.getByRole('heading', { name: 'Płatność przyjęta' })).toBeVisible();
    await expect(page.getByText('Status zamówienia: opłacone')).toBeVisible();
  });
});
```

Przykład pokazuje, że dobra praktyka nie jest ozdobą. Ma zmniejszać koszt zmiany, skracać diagnozę i zwiększać zaufanie do wyniku testów.

## Lista kontrolna

- Czy test chroni jasno nazwane ryzyko?
- Czy kod jest czytelny dla osoby spoza autora?
- Czy dane i zależności są jawne?
- Czy asercje potwierdzają skutek?
- Czy standard jest zapisany i egzekwowany w review?
- Czy widoczny antywzorzec został usunięty, a nie tylko obejściowo przykryty?


## Dobre praktyki i perspektywa inżynierska
Automatyzacja to proces ciągłego doskonalenia. Aby Twoje testy niosły realną wartość, stosuj się do poniższych zasad:
- **Testuj zachowanie, nie kod**: Skup się na tym, co widzi i robi użytkownik. Zmienne nazwy klas CSS nie powinny psuć Twoich testów.
- **Fail-fast**: Test powinien dawać jasny sygnał o błędzie tak szybko, jak to możliwe. Unikaj "wiszących" testów, które blokują kolejkę CI.
- **Ewoluuj**: Regularnie przeglądaj swoje testy. Usuwaj te, które są niestabilne i nie dają wartości, a refaktoryzuj te, które stają się zbyt skomplikowane.

## Głębsza analiza: Zasady projektowania testów

Dobre testy opierają się na zasadzie **AAA (Arrange, Act, Assert)**:
1. **Arrange**: Przygotuj środowisko, dane i zaloguj użytkownika.
2. **Act**: Wykonaj minimalną liczbę akcji potrzebną do wywołania zachowania.
3. **Assert**: Sprawdź skutek.
Stosuj się do **Piramidy Testów**: najwięcej testów jednostkowych, mniej integracyjnych/API, najmniej testów E2E (UI).
