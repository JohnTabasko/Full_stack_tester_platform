# Techniki projektowania testów

Techniki projektowania testów pomagają wybierać niewielką liczbę przypadków o dużej wartości. Bez technik zespół często tworzy przypadki intuicyjnie: dużo podobnych testów, mało pokrycia wartości brzegowych i brak kontroli kombinacji. Dobra technika nie zastępuje myślenia, ale porządkuje je.

Ta lekcja jest zgodna z klasycznymi fundamentami ISTQB: klasy równoważności, wartości brzegowe, tablice decyzyjne, przejścia stanów, pairwise, use case testing i error guessing.

## 1. Od wymagania do przypadku testowego

Zanim zastosujesz technikę, rozdziel pojęcia:

- **test basis** — źródło wiedzy, np. wymaganie, user story, specyfikacja API;
- **test condition** — coś, co należy sprawdzić, np. „wiek klienta wpływa na decyzję kredytową”;
- **test case** — konkretne dane, kroki i oczekiwany rezultat;
- **test procedure** — sposób wykonania przypadku;
- **test oracle** — źródło oczekiwanego wyniku, np. wymaganie, reguła biznesowa, ekspert domenowy.

Jeżeli nie znasz oracle, nie wiesz, czy wynik jest poprawny.

## 2. Klasy równoważności

Klasy równoważności grupują dane, które system powinien traktować tak samo. Zamiast testować każdą wartość, wybierasz reprezentanta klasy.

Przykład: wiek klienta w formularzu pożyczki:

```text
< 18        — odrzucony
18–65       — standardowa ścieżka
66–120      — dodatkowa weryfikacja
> 120       — błąd walidacji
brak wieku  — błąd wymagania pola
```

Przypadki testowe:

- 17 — odrzucony;
- 30 — standard;
- 70 — dodatkowa weryfikacja;
- 130 — błąd;
- puste pole — błąd.

## 3. Analiza wartości brzegowych

Błędy często pojawiają się na granicach: minimum, maksimum, pierwszy element, ostatni element, limit długości, przejście statusu.

Dla zakresu 18–65 sprawdź:

```text
17, 18, 19
64, 65, 66
```

Dla limitu 255 znaków:

```text
254, 255, 256
```

Wartości brzegowe są jedną z najbardziej opłacalnych technik. W automatyzacji powinny często trafiać do unit/API tests, niekoniecznie do E2E.

## 4. Tablice decyzyjne

Tablice decyzyjne są dobre, gdy wynik zależy od kilku warunków.

Przykład decyzji o rabacie:

| Aktywny kupon | Koszyk >= 100 zł | Produkt wykluczony | Wynik |
|---|---|---|---|
| tak | tak | nie | rabat naliczony |
| tak | nie | nie | błąd minimalnej kwoty |
| tak | tak | tak | produkt wykluczony |
| nie | dowolnie | dowolnie | kupon nieaktywny |

Tablica pomaga zobaczyć brakujące kombinacje. Nie musisz automatyzować każdej przez UI. Część może być testem API lub jednostkowym.

## 5. Przejścia stanów

Przejścia stanów sprawdzają workflow. Przykład zamówienia:

```text
NEW -> PAID -> SHIPPED -> DELIVERED
NEW -> CANCELLED
PAID -> REFUNDED
```

Testuj:

- poprawne przejścia;
- niedozwolone przejścia, np. `DELIVERED -> NEW`;
- zdarzenia równoległe, np. płatność i anulowanie;
- skutki uboczne, np. email, faktura, event.

Przejścia stanów są bardzo ważne w systemach asynchronicznych i mikroserwisach.

## 6. Pairwise testing

Jeżeli masz wiele parametrów, pełna kombinatoryka jest zbyt droga. Pairwise zakłada, że wiele błędów wynika z interakcji dwóch parametrów.

Przykład parametrów:

- kraj: PL, DE, US;
- waluta: PLN, EUR, USD;
- typ klienta: standard, premium;
- metoda płatności: karta, przelew, BLIK.

Pełna kombinacja to 3 × 3 × 2 × 3 = 54 przypadki. Pairwise może ograniczyć zestaw do kilkunastu przypadków, zachowując sensowne pokrycie par.

## 7. Use case testing

Use case testing skupia się na ścieżkach użytkownika:

- główny scenariusz sukcesu;
- alternatywne ścieżki;
- błędy;
- przerwania;
- powrót do procesu.

Dla checkoutu:

- klient płaci poprawną kartą;
- karta odrzucona;
- klient wraca do koszyka;
- sesja wygasa w trakcie płatności;
- produkt staje się niedostępny.

## 8. Error guessing

Error guessing opiera się na doświadczeniu testera. To nie jest losowe zgadywanie. To użycie wiedzy o typowych awariach:

- puste dane;
- bardzo długie dane;
- znaki specjalne;
- emoji;
- różne locale;
- odświeżenie strony;
- back button;
- utrata sieci;
- równoległe akcje;
- wygasła sesja;
- drugi tab.

Error guessing świetnie uzupełnia eksplorację.

## 9. Łączenie technik

Dla jednej funkcji możesz połączyć techniki:

- klasy równoważności dla danych wejściowych;
- wartości brzegowe dla limitów;
- tablice decyzyjne dla reguł;
- przejścia stanów dla workflow;
- pairwise dla konfiguracji;
- eksplorację dla nieznanych ryzyk.

## 10. Checklista projektowania przypadków

- Czy znam źródło oczekiwanego wyniku?
- Czy są klasy poprawne i niepoprawne?
- Czy sprawdzono granice?
- Czy reguły z wieloma warunkami mają tablicę decyzyjną?
- Czy workflow ma model stanów?
- Czy kombinacje są ograniczone świadomie?
- Czy przypadki wysokiego ryzyka są automatyzowane na właściwym poziomie?

## Linki

- [ISTQB Certified Tester Foundation Level](https://www.istqb.org/certifications/certified-tester-foundation-level)
- [ISO/IEC/IEEE 29119](https://www.iso.org/standard/81291.html)
- [Pairwise Testing — NIST ACTS](https://csrc.nist.gov/projects/automated-combinatorial-testing-for-software)

## 11. Przykład łączenia technik dla formularza pożyczki

Dla formularza pożyczki nie twórz przypadków wyłącznie z listy pól. Zacznij od ryzyka:

- niepełnoletni klient dostaje ofertę;
- klient na granicy dochodu jest źle klasyfikowany;
- kraj spoza obsługiwanej listy przechodzi dalej;
- kwota przekracza limit produktu;
- historia klienta blokuje decyzję, ale UI pokazuje sukces.

Następnie dobierz techniki:

| Ryzyko | Technika |
|---|---|
| wiek i kwota | wartości brzegowe |
| kraj i typ klienta | klasy równoważności |
| dochód + historia + kwota | tablica decyzyjna |
| status wniosku | przejścia stanów |
| wiele konfiguracji produktu | pairwise |

Dzięki temu zestaw testów jest mniejszy, ale bardziej świadomy.

## 12. Automatyzacja technik projektowania

Technika projektowania nie mówi jeszcze, gdzie test ma być wykonany. Ten sam przypadek może trafić na różne poziomy:

- wartości brzegowe wieku — unit/API;
- tablica decyzyjna decyzji kredytowej — unit/integration;
- przejście statusu wniosku — API/integration;
- najważniejsza ścieżka użytkownika — E2E.

Full Stack Tester powinien projektować przypadki niezależnie od narzędzia, a dopiero potem zdecydować, czy użyć Vitest, API testu, Playwright, SQL czy eksploracji.
