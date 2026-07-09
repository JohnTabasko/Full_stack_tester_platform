# Wzorzec komponentu

> Moduł szósty porządkuje architekturę kodu testowego. Wcześniejsze moduły uczyły, jak sterować przeglądarką i jak potwierdzać rezultat. Teraz pytanie brzmi: jak zorganizować ten kod, aby był czytelny, rozszerzalny i możliwy do utrzymania przez zespół.

## Jak czytać ten moduł

Nie traktuj wzorca obiektu strony jako obowiązkowego rytuału. POM jest narzędziem do zmniejszania kosztu zmiany, a nie celem samym w sobie. Dobry POM sprawia, że testy są bliżej języka domeny. Zły POM tylko przenosi chaos z testów do klas pomocniczych.

Trzy zasady modułu:

1. **Abstrakcja ma nazywać intencję.** Metoda `loginAs` jest lepsza niż `clickLoginButton`.
2. **Odpowiedzialność ma być mała.** Strona, komponent, journey i helper powinny mieć jasne granice.
3. **Czytelność testu jest nadrzędna.** Jeżeli abstrakcja utrudnia zrozumienie scenariusza, jest zła.


## Cel lekcji

Ta lekcja koncentruje się na: **komponenty interfejsu: modal, tabela, nagłówek, paginacja, root locator i kompozycja zamiast dziedziczenia**. Główne ryzyko: **jedna ogromna klasa strony zna każdy przycisk, modal i tabelę, przez co staje się trudna do utrzymania**. Po lekturze powinieneś umieć ocenić, czy abstrakcja rzeczywiście pomaga, czy tylko ukrywa złożoność.

## Sytuacja przewodnia

ta sama tabela zamówień występuje w panelu administratora i panelu klienta, z różnymi akcjami w wierszach

## 1. Komponent jako część strony

Komponent reprezentuje powtarzalny fragment interfejsu: tabelę, modal, nagłówek, kartę produktu, paginację. Dzięki temu nie tworzysz monolitycznych klas stron.

## 2. Root locator

Komponent powinien mieć korzeń lokatora. Wszystkie jego lokatory są szukane wewnątrz tego korzenia, dzięki czemu komponent działa w różnych miejscach.

## 3. Kompozycja

Strona może składać się z komponentów. To zwykle elastyczniejsze niż głęboka hierarchia dziedziczenia.

## 4. Granice komponentu

Komponent powinien znać własne elementy i zachowania, ale nie cały proces biznesowy. Modal nie powinien wiedzieć, jak działa płatność.

## 5. Reużywalność z umiarem

Nie każdy fragment UI musi być komponentem. Twórz komponent, gdy widzisz realne powtórzenie lub złożoność.

## Przykład referencyjny

```typescript
import { expect, type Locator } from '@playwright/test';

export class OrdersTable {
  constructor(private readonly root: Locator) {}

  rowByOrderId(orderId: string) {
    return this.root.getByRole('row', { name: new RegExp(orderId) });
  }

  async openDetails(orderId: string) {
    await this.rowByOrderId(orderId).getByRole('button', { name: 'Szczegóły' }).click();
  }

  async expectStatus(orderId: string, status: string) {
    await expect(this.rowByOrderId(orderId)).toContainText(status);
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
