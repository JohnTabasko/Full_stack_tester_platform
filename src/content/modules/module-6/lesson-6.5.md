# Dobre praktyki i antywzorce POM

> Moduł szósty porządkuje architekturę kodu testowego. Wcześniejsze moduły uczyły, jak sterować przeglądarką i jak potwierdzać rezultat. Teraz pytanie brzmi: jak zorganizować ten kod, aby był czytelny, rozszerzalny i możliwy do utrzymania przez zespół.

## Jak czytać ten moduł

Nie traktuj wzorca obiektu strony jako obowiązkowego rytuału. POM jest narzędziem do zmniejszania kosztu zmiany, a nie celem samym w sobie. Dobry POM sprawia, że testy są bliżej języka domeny. Zły POM tylko przenosi chaos z testów do klas pomocniczych.

Trzy zasady modułu:

1. **Abstrakcja ma nazywać intencję.** Metoda `loginAs` jest lepsza niż `clickLoginButton`.
2. **Odpowiedzialność ma być mała.** Strona, komponent, journey i helper powinny mieć jasne granice.
3. **Czytelność testu jest nadrzędna.** Jeżeli abstrakcja utrudnia zrozumienie scenariusza, jest zła.


## Cel lekcji

Ta lekcja koncentruje się na: **SOLID w POM, God Object, silne sprzężenie, kruche selektory, refaktoryzacja i organizacja plików**. Główne ryzyko: **POM staje się warstwą, która ukrywa chaos zamiast go porządkować: ogromne klasy, przypadkowe helpery i selektory trudne do zmiany**. Po lekturze powinieneś umieć ocenić, czy abstrakcja rzeczywiście pomaga, czy tylko ukrywa złożoność.

## Sytuacja przewodnia

klasa DashboardPage ma tysiąc linii, obsługuje menu, tabele, modal, użytkowników, faktury i ustawienia konta

## 1. SOLID w praktyce

Zasady SOLID w testach nie są akademicką teorią. Chodzi o małe odpowiedzialności, łatwą zmianę i brak zależności od przypadkowych szczegółów.

## 2. God Object

Najczęstszy antywzorzec POM to jedna ogromna klasa strony. Z czasem trafia do niej wszystko, a każda zmiana grozi efektem ubocznym.

## 3. Silne sprzężenie

Page object nie powinien znać danych bazy, konfiguracji CI i całego procesu biznesowego. Im więcej zależności, tym trudniejszy test.

## 4. Kruche selektory

POM nie naprawi złych lokatorów. Jeśli w klasie ukryjesz `nth-child`, problem nadal istnieje — tylko trudniej go zobaczyć.

## 5. Refaktoryzacja

Refaktoryzuj po zauważeniu powtórzeń. Nie buduj z góry skomplikowanego frameworka na podstawie przewidywań.

## Przykład referencyjny

```typescript
// Antywzorzec: jedna klasa wie wszystko.
// class DashboardPage { openUserModal(); payInvoice(); changePassword(); exportCsv(); ... }

// Lepszy kierunek: komponenty i odpowiedzialności.
class DashboardPage {
  readonly navigation = new Navigation(this.page.getByRole('navigation'));
  readonly invoices = new InvoicesTable(this.page.getByTestId('invoices-table'));
  readonly userMenu = new UserMenu(this.page.getByTestId('user-menu'));
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
