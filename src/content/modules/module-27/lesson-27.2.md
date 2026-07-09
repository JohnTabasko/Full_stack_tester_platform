# Generowanie przypadków testowych i danych testowych

> Moduł dwudziesty siódmy uczy korzystać ze sztucznej inteligencji jako wsparcia pracy testera, a nie jako zamiennika myślenia. AI może przyspieszyć analizę, generowanie pomysłów i porządkowanie logów, ale wymaga kontroli prywatności, weryfikacji i odpowiedzialnego procesu.

## Jak czytać ten moduł

Czytaj ten moduł przez pryzmat odpowiedzialności. Model językowy może pomóc wygenerować listę pytań, przypadków, danych lub hipotez, ale nie zna pełnego kontekstu produktu, decyzji biznesowych i ograniczeń prawnych. Tester nadal odpowiada za jakość wniosków.

Trzy zasady modułu:

1. **AI generuje hipotezy, nie prawdę.** Każdy wynik wymaga weryfikacji.
2. **Dane są granicą bezpieczeństwa.** Nie wklejaj sekretów ani danych osobowych bez zatwierdzonego procesu.
3. **Review człowieka jest obowiązkowe.** Kod, testy i decyzje wspierane przez AI muszą być sprawdzone.


## Cel lekcji

Ta lekcja koncentruje się na: **tworzenie macierzy przypadków, danych brzegowych, scenariuszy negatywnych, danych syntetycznych i walidacja wyników AI**. Główne ryzyko: **wygenerowane przypadki wyglądają obszernie, ale zawierają duplikaty, niepoprawne dane, brak wartości brzegowych albo naruszają prywatność**. Po lekturze powinieneś umieć korzystać z AI tak, aby zwiększać jakość pracy testera bez utraty kontroli nad prywatnością i poprawnością decyzji.

## Sytuacja przewodnia

tester chce wygenerować dane do formularza rejestracji użytkownika w kilku krajach, z poprawnymi i błędnymi numerami telefonu, kodami pocztowymi oraz e-mailami

## 1. AI jako generator szkicu

AI świetnie przygotowuje pierwszą wersję macierzy przypadków. To nie znaczy, że macierz jest kompletna albo poprawna. Traktuj ją jak propozycję do review.

## 2. Dane syntetyczne

Dane generowane przez AI muszą być syntetyczne. Nie wolno prosić modelu o przetwarzanie prawdziwych danych osobowych, jeśli polityka organizacji tego zabrania.

## 3. Wartości brzegowe

Model często generuje typowe dane, ale pomija granice: minimalną długość, maksymalną długość, znaki specjalne, puste pola i formaty lokalne.

## 4. Scenariusze negatywne

Wygenerowane negatywne przypadki trzeba powiązać z oczekiwanym komunikatem, statusem API albo zachowaniem systemu. Samo „błędne dane” nie wystarczy.

## 5. Walidacja wyniku AI

Sprawdź duplikaty, zgodność z wymaganiami, realność danych, prywatność, pokrycie klas równoważności i wartości brzegowych.

## Przykład referencyjny

```markdown
# Prompt do danych testowych

Wygeneruj dane syntetyczne do formularza rejestracji.

Pola:
- email
- imię
- nazwisko
- kraj: PL, DE, GB
- telefon
- kod pocztowy

Wymagania:
- nie używaj prawdziwych osób
- oznacz przypadki pozytywne i negatywne
- uwzględnij wartości brzegowe długości pól
- wynik zwróć jako tabela Markdown
- dodaj uzasadnienie dla każdego przypadku
```

Przykład pokazuje, że dobry prompt ogranicza zakres, wymaga uzasadnienia i przypomina o założeniach. AI ma wspierać analizę, a nie zastępować odpowiedzialność testera.

## Lista kontrolna

- Czy prompt zawiera kontekst i oczekiwany format?
- Czy wynik AI został zweryfikowany?
- Czy nie przekazano danych osobowych ani sekretów?
- Czy oznaczono założenia i niewiadome?
- Czy decyzja końcowa należy do człowieka?
- Czy zespół ma politykę użycia AI?


## Dobre praktyki i perspektywa inżynierska
Automatyzacja to proces ciągłego doskonalenia. Aby Twoje testy niosły realną wartość, stosuj się do poniższych zasad:
- **Testuj zachowanie, nie kod**: Skup się na tym, co widzi i robi użytkownik. Zmienne nazwy klas CSS nie powinny psuć Twoich testów.
- **Fail-fast**: Test powinien dawać jasny sygnał o błędzie tak szybko, jak to możliwe. Unikaj "wiszących" testów, które blokują kolejkę CI.
- **Ewoluuj**: Regularnie przeglądaj swoje testy. Usuwaj te, które są niestabilne i nie dają wartości, a refaktoryzuj te, które stają się zbyt skomplikowane.
