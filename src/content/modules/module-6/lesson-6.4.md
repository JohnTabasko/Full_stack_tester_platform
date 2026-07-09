# Zaawansowane wzorce POM

> Moduł szósty porządkuje architekturę kodu testowego. Wcześniejsze moduły uczyły, jak sterować przeglądarką i jak potwierdzać rezultat. Teraz pytanie brzmi: jak zorganizować ten kod, aby był czytelny, rozszerzalny i możliwy do utrzymania przez zespół.

## Jak czytać ten moduł

Nie traktuj wzorca obiektu strony jako obowiązkowego rytuału. POM jest narzędziem do zmniejszania kosztu zmiany, a nie celem samym w sobie. Dobry POM sprawia, że testy są bliżej języka domeny. Zły POM tylko przenosi chaos z testów do klas pomocniczych.

Trzy zasady modułu:

1. **Abstrakcja ma nazywać intencję.** Metoda `loginAs` jest lepsza niż `clickLoginButton`.
2. **Odpowiedzialność ma być mała.** Strona, komponent, journey i helper powinny mieć jasne granice.
3. **Czytelność testu jest nadrzędna.** Jeżeli abstrakcja utrudnia zrozumienie scenariusza, jest zła.


## Cel lekcji

Ta lekcja koncentruje się na: **fabryka stron, płynne API, journey pattern, fasada, strategia, builder i wstrzykiwanie zależności**. Główne ryzyko: **zespół dodaje wzorce dla samej architektury, przez co testy stają się trudniejsze do czytania niż proste scenariusze**. Po lekturze powinieneś umieć ocenić, czy abstrakcja rzeczywiście pomaga, czy tylko ukrywa złożoność.

## Sytuacja przewodnia

proces checkout składa się z wielu ekranów i wariantów płatności, ale testy powinny pozostać krótkie i zrozumiałe

## 1. Po co wzorce zaawansowane

Zaawansowane wzorce są przydatne, gdy projekt ma realną złożoność. Nie powinny być stosowane tylko dlatego, że brzmią profesjonalnie.

## 2. Journey pattern

Journey opisuje proces przechodzący przez kilka stron. Dobrze nazywa przepływ, ale może ukryć zbyt wiele szczegółów, jeśli jest nadużywany.

## 3. Fasada

Fasada upraszcza dostęp do złożonego podsystemu. W testach może ukryć zestaw stron i klientów API, ale powinna pozostać przejrzysta.

## 4. Strategia

Strategia jest dobra, gdy ten sam proces ma różne warianty, np. płatność kartą, przelewem i BLIK. W profesjonalnej pracy z Playwrightem, to zagadnienie jest kluczowe dla stabilności i wydajności całego procesu. Należy pamiętać o izolacji, odpowiednim doborze API oraz unikaniu typowych antywzorców, takich jak sztywne timeouty czy nadmierne poleganie na strukturze DOM.

## 5. Builder i DI

Builder pomaga tworzyć dane, a wstrzykiwanie zależności pomaga kontrolować obiekty. Oba wzorce mają sens, gdy zmniejszają sprzężenie.

## Przykład referencyjny

```typescript
export class CheckoutJourney {
  constructor(
    private readonly cartPage: CartPage,
    private readonly checkoutPage: CheckoutPage,
    private readonly paymentPage: PaymentPage,
  ) {}

  async payForSingleProduct(user: TestUser, product: Product) {
    await this.cartPage.addProduct(product);
    await this.checkoutPage.fillCustomerData(user);
    await this.paymentPage.payByCard(user.card);
  }
}
```

Przykład pokazuje kierunek projektowania: klasa lub komponent ma jedną odpowiedzialność, używa stabilnych lokatorów i nie ukrywa celu testu.

## Lista kontrolna

- Czy nazwa klasy odpowiada odpowiedzialności?
- Czy metoda opisuje zachowanie, a nie techniczny klik?
- Czy lokatory są semantyczne lub świadomie oparte o test id?
- Czy klasa nie zna zbyt wielu obszarów produktu?
- Czy test po użyciu abstrakcji nadal jest zrozumiały?
- Czy awaria prowadzi do czytelnej przyczyny?


## Dobre praktyki i perspektywa inżynierska
Automatyzacja to proces ciągłego doskonalenia. Aby Twoje testy niosły realną wartość, stosuj się do poniższych zasad:
- **Testuj zachowanie, nie kod**: Skup się na tym, co widzi i robi użytkownik. Zmienne nazwy klas CSS nie powinny psuć Twoich testów.
- **Fail-fast**: Test powinien dawać jasny sygnał o błędzie tak szybko, jak to możliwe. Unikaj "wiszących" testów, które blokują kolejkę CI.
- **Ewoluuj**: Regularnie przeglądaj swoje testy. Usuwaj te, które są niestabilne i nie dają wartości, a refaktoryzuj te, które stają się zbyt skomplikowane.
