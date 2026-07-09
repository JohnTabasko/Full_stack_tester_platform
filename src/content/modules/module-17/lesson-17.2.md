# Rodzaje testów i piramida testów

> Moduł siedemnasty wraca do fundamentów zawodu testera. Automatyzacja jest skuteczna tylko wtedy, gdy wynika z dobrego rozumienia jakości, ryzyka, rodzajów testów, projektowania przypadków i komunikacji defektów.

## Jak czytać ten moduł

Czytaj ten moduł niezależnie od narzędzi. Playwright, API, CI i baza danych są sposobami zdobywania informacji. Tester musi wiedzieć, jakiej informacji potrzebuje zespół, zanim wybierze narzędzie.

Trzy zasady modułu:

1. **Tester dostarcza informację o ryzyku.** Nie tylko wykonuje przypadki testowe.
2. **Technika testowania dobiera się do problemu.** Nie każdy błąd wymaga E2E, nie każde ryzyko da się złapać testem jednostkowym.
3. **Komunikacja jest częścią jakości.** Źle opisany błąd wydłuża naprawę nawet wtedy, gdy został poprawnie znaleziony.


## Cel lekcji

Ta lekcja koncentruje się na: **testy jednostkowe, integracyjne, kontraktowe, API, end-to-end, smoke, sanity, regresyjne i akceptacyjne oraz ekonomia informacji**. Główne ryzyko: **zespół sprawdza zbyt wiele reguł przez wolne testy E2E albo zbyt wiele ryzyk pomija, bo ma tylko testy jednostkowe**. Po lekturze powinieneś umieć używać wiedzy testerskiej do projektowania lepszych testów manualnych, eksploracyjnych i automatycznych.

## Sytuacja przewodnia

funkcja rabatów wymaga testów kalkulacji, kontraktu API, integracji z koszykiem i jednego krytycznego przepływu UI

## 1. Piramida jako model ekonomii

Piramida testów nie jest dogmatem. To model kosztu informacji: im niżej testujesz, tym szybciej i taniej dostajesz feedback, ale z mniejszym realizmem pełnego systemu.

## 2. Testy jednostkowe

Testy jednostkowe są dobre do logiki deterministycznej: obliczeń, walidacji, mapowania i reguł biznesowych bez zależności zewnętrznych.

## 3. Testy integracyjne

Testy integracyjne sprawdzają współpracę kilku elementów: serwisu z bazą, kontrolera z walidacją, komponentu z adapterem.

## 4. Testy kontraktowe i API

Testy kontraktowe chronią konsumentów API. Testy API sprawdzają zachowanie usługi szybciej niż UI. W profesjonalnej pracy z Playwrightem, to zagadnienie jest kluczowe dla stabilności i wydajności całego procesu. Należy pamiętać o izolacji, odpowiednim doborze API oraz unikaniu typowych antywzorców, takich jak sztywne timeouty czy nadmierne poleganie na strukturze DOM.

## 5. Testy E2E

Testy end-to-end są najdroższe, ale potwierdzają realny przepływ użytkownika przez wiele warstw. Używaj ich dla krytycznych ścieżek.

## Przykład referencyjny

```markdown
# Rozkład testów dla funkcji rabatów

- Unit: obliczanie rabatu, zaokrąglenia, limity
- Integration: koszyk + silnik promocji
- API: zastosowanie kuponu, błędy, autoryzacja
- Contract: odpowiedź /api/cart zawiera discountTotal jako number
- E2E: klient używa kuponu w checkout i widzi poprawną kwotę
- Smoke: najważniejszy kupon działa po deployu
```

Przykład pokazuje, że praca testera zaczyna się od jasnego opisu ryzyka, danych, oczekiwań i dowodów. Narzędzie wykonawcze jest dopiero kolejnym krokiem.

## Lista kontrolna

- Czy znasz ryzyko, które sprawdzasz?
- Czy wybrałeś właściwy poziom testu?
- Czy przypadki testowe nie powielają się bez wartości?
- Czy uwzględniasz wartości brzegowe i scenariusze negatywne?
- Czy wynik testu jest zrozumiały dla zespołu?
- Czy raport błędu pozwala odtworzyć problem?


## Dobre praktyki i perspektywa inżynierska
Automatyzacja to proces ciągłego doskonalenia. Aby Twoje testy niosły realną wartość, stosuj się do poniższych zasad:
- **Testuj zachowanie, nie kod**: Skup się na tym, co widzi i robi użytkownik. Zmienne nazwy klas CSS nie powinny psuć Twoich testów.
- **Fail-fast**: Test powinien dawać jasny sygnał o błędzie tak szybko, jak to możliwe. Unikaj "wiszących" testów, które blokują kolejkę CI.
- **Ewoluuj**: Regularnie przeglądaj swoje testy. Usuwaj te, które są niestabilne i nie dają wartości, a refaktoryzuj te, które stają się zbyt skomplikowane.
