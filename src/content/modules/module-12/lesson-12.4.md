# Współpraca zespołowa i standardy

> Moduł dwunasty zbiera zasady, które decydują o długowieczności automatyzacji. Dobre testy to nie tylko poprawne użycie Playwrighta, ale także czytelny projekt, spójne standardy, review, refaktoryzacja i unikanie antywzorców.

## Jak czytać ten moduł

Czytaj ten moduł jak poradnik utrzymania jakości kodu testowego. Każda decyzja, która dziś skraca pracę o pięć minut, może za pół roku kosztować wiele godzin, jeśli utrudni diagnostykę albo zmianę. Profesjonalny tester automatyzujący myśli nie tylko o tym, czy test przejdzie dzisiaj, ale czy będzie zrozumiały po zmianie produktu i zespołu.

Trzy zasady modułu:

1. **Test ma chronić ryzyko.** Nie automatyzuj dla samej liczby testów.
2. **Kod testowy wymaga standardów.** Bez standardów każdy autor buduje własny mini-framework.
3. **Antywzorce trzeba usuwać wcześnie.** Im dłużej istnieją, tym częściej są kopiowane.


## Cel lekcji

Ta lekcja koncentruje się na: **Conventional Commits, szablony PR, CODEOWNERS, ADR, dzielenie wiedzy, branching, code review i Definition of Done**. Główne ryzyko: **każdy autor pisze testy inaczej, a decyzje architektoniczne żyją w rozmowach zamiast w repozytorium**. Po lekturze powinieneś umieć ocenić praktykę testową pod kątem wartości, utrzymywalności i kosztu długoterminowego.

## Sytuacja przewodnia

do projektu dołączają nowe osoby, a review testów zależy od preferencji recenzenta, bo zespół nie ma wspólnego standardu

## 1. Standard jako narzędzie skalowania

Standard nie ma ograniczać kreatywności, lecz zmniejszać liczbę przypadkowych decyzji. Dzięki niemu nowa osoba wie, jak pisać testy.

## 2. Szablony PR

Szablon PR przypomina o danych, asercjach, diagnostyce i wpływie na CI. Jest prostym sposobem podniesienia jakości review.

## 3. CODEOWNERS

CODEOWNERS pomaga kierować zmiany do osób odpowiedzialnych za obszar. W dużym pakiecie testów własność jest konieczna.

## 4. ADR

Architecture Decision Record dokumentuje ważne decyzje: strategię danych, POM, tagi, CI, retry. Dzięki temu decyzje nie giną w Slacku.

## 5. Definition of Done

Definicja ukończenia powinna mówić, kiedy test jest gotowy: dane, asercje, diagnostyka, review, dokumentacja i CI.

## Przykład referencyjny

```markdown
## Checklist PR dla testów Playwright

- [ ] Test ma nazwę opisującą zachowanie
- [ ] Dane testowe są izolowane
- [ ] Nie ma waitForTimeout bez uzasadnienia
- [ ] Lokatory są semantyczne lub oparte o test id
- [ ] Asercje sprawdzają skutek
- [ ] Artefakty diagnostyczne są dostępne w CI
- [ ] Zaktualizowano dokumentację, jeśli zmieniono standard
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
