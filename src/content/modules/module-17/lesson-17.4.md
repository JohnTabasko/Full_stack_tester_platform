# Testowanie eksploracyjne i raportowanie błędów

> Moduł siedemnasty wraca do fundamentów zawodu testera. Automatyzacja jest skuteczna tylko wtedy, gdy wynika z dobrego rozumienia jakości, ryzyka, rodzajów testów, projektowania przypadków i komunikacji defektów.

## Jak czytać ten moduł

Czytaj ten moduł niezależnie od narzędzi. Playwright, API, CI i baza danych są sposobami zdobywania informacji. Tester musi wiedzieć, jakiej informacji potrzebuje zespół, zanim wybierze narzędzie.

Trzy zasady modułu:

1. **Tester dostarcza informację o ryzyku.** Nie tylko wykonuje przypadki testowe.
2. **Technika testowania dobiera się do problemu.** Nie każdy błąd wymaga E2E, nie każde ryzyko da się złapać testem jednostkowym.
3. **Komunikacja jest częścią jakości.** Źle opisany błąd wydłuża naprawę nawet wtedy, gdy został poprawnie znaleziony.


## Cel lekcji

Ta lekcja koncentruje się na: **testowanie eksploracyjne, heurystyki, session-based testing, reprodukcja błędów, severity, priority i profesjonalne raporty defektów**. Główne ryzyko: **tester znajduje błędy, ale raporty są nieprecyzyjne, trudne do odtworzenia i nie pomagają zespołowi podjąć decyzji**. Po lekturze powinieneś umieć używać wiedzy testerskiej do projektowania lepszych testów manualnych, eksploracyjnych i automatycznych.

## Sytuacja przewodnia

podczas eksploracji checkoutu tester zauważa, że po odświeżeniu strony znika rabat, ale status zamówienia pozostaje niejednoznaczny

## 1. Eksploracja jako uczenie się

Testowanie eksploracyjne łączy projektowanie, wykonanie i uczenie się. Nie jest chaotycznym klikaniem, lecz świadomą sesją badania ryzyka.

## 2. Heurystyki

Heurystyki pomagają szukać problemów: granice, role, dane puste, przerwana sieć, cofnięcie, odświeżenie, wiele kart, uprawnienia.

## 3. Session-based testing

Sesja eksploracyjna ma charter, czas, notatki, obserwacje i podsumowanie. Dzięki temu eksploracja jest rozliczalna.

## 4. Severity i priority

Severity opisuje wpływ błędu, priority kolejność naprawy. Krytyczny błąd może mieć niski priorytet, jeśli dotyczy rzadkiego przypadku — i odwrotnie.

## 5. Dobry raport defektu

Raport powinien zawierać kroki, dane, środowisko, rezultat rzeczywisty, oczekiwany, dowody i wpływ. Celem jest szybka decyzja, nie udowodnienie winy.

## Przykład referencyjny

```markdown
# Raport błędu

Tytuł: Rabat znika po odświeżeniu checkoutu

Środowisko: staging, Chrome, użytkownik qa+checkout@example.test
Kroki:
1. Dodaj produkt BOOK-1 do koszyka
2. Zastosuj kupon PROMO10
3. Przejdź do checkoutu
4. Odśwież stronę

Rezultat rzeczywisty: suma wraca do pełnej kwoty
Rezultat oczekiwany: rabat pozostaje aktywny
Wpływ: klient może zapłacić więcej niż oczekuje
Dowody: screenshot, HAR, orderId=12345
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
