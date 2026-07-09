# Zaawansowane wzorce obiektu strony

> Moduł dwunasty zbiera zasady, które decydują o długowieczności automatyzacji. Dobre testy to nie tylko poprawne użycie Playwrighta, ale także czytelny projekt, spójne standardy, review, refaktoryzacja i unikanie antywzorców.

## Jak czytać ten moduł

Czytaj ten moduł jak poradnik utrzymania jakości kodu testowego. Każda decyzja, która dziś skraca pracę o pięć minut, może za pół roku kosztować wiele godzin, jeśli utrudni diagnostykę albo zmianę. Profesjonalny tester automatyzujący myśli nie tylko o tym, czy test przejdzie dzisiaj, ale czy będzie zrozumiały po zmianie produktu i zespołu.

Trzy zasady modułu:

1. **Test ma chronić ryzyko.** Nie automatyzuj dla samej liczby testów.
2. **Kod testowy wymaga standardów.** Bez standardów każdy autor buduje własny mini-framework.
3. **Antywzorce trzeba usuwać wcześnie.** Im dłużej istnieją, tym częściej są kopiowane.


## Cel lekcji

Ta lekcja koncentruje się na: **kompozycja, dekorator, strategia, repozytorium, journey pattern i świadomy dobór wzorca do problemu**. Główne ryzyko: **projekt testowy zaczyna przypominać framework dla frameworka: dużo wzorców, mało czytelności i trudna diagnostyka awarii**. Po lekturze powinieneś umieć ocenić praktykę testową pod kątem wartości, utrzymywalności i kosztu długoterminowego.

## Sytuacja przewodnia

proces zakupu ma kilka wariantów dostawy i płatności, a zespół chce uniknąć duplikacji bez ukrywania sensu scenariusza

## 1. Wzorzec ma rozwiązywać problem

Zaawansowany wzorzec ma sens tylko wtedy, gdy usuwa realny ból: duplikację, zmienność wariantów, zbyt duże klasy albo trudny setup.

## 2. Kompozycja

Kompozycja zwykle skaluje się lepiej niż dziedziczenie. Strona może składać się z komponentów, klientów API i strategii.

## 3. Strategia

Strategia jest dobra, gdy proces ma warianty: różne płatności, dostawy, logowanie, role lub konfiguracje środowiska.

## 4. Repozytorium

Repozytorium w testach może ukrywać dostęp do danych lub API, ale nie powinno udawać warstwy produkcyjnej bez potrzeby.

## 5. Journey pattern

Journey opisuje proces przez wiele ekranów. Pomaga w złożonych przepływach, ale może ukryć za dużo, jeśli staje się czarną skrzynką.

## Przykład referencyjny

```typescript
interface PaymentStrategy {
  pay(): Promise<void>;
}

class CardPayment implements PaymentStrategy {
  constructor(private readonly page: Page) {}
  async pay() {
    await this.page.getByRole('button', { name: 'Karta' }).click();
    await this.page.getByLabel('Numer karty').fill('4242 4242 4242 4242');
    await this.page.getByRole('button', { name: 'Zapłać' }).click();
  }
}

class CheckoutJourney {
  constructor(private readonly payment: PaymentStrategy) {}
  async complete() {
    await this.payment.pay();
  }
}
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
