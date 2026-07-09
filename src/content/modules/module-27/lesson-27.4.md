# Ryzyka sztucznej inteligencji: prywatność, halucynacje i zarządzanie

> Moduł dwudziesty siódmy uczy korzystać ze sztucznej inteligencji jako wsparcia pracy testera, a nie jako zamiennika myślenia. AI może przyspieszyć analizę, generowanie pomysłów i porządkowanie logów, ale wymaga kontroli prywatności, weryfikacji i odpowiedzialnego procesu.

## Jak czytać ten moduł

Czytaj ten moduł przez pryzmat odpowiedzialności. Model językowy może pomóc wygenerować listę pytań, przypadków, danych lub hipotez, ale nie zna pełnego kontekstu produktu, decyzji biznesowych i ograniczeń prawnych. Tester nadal odpowiada za jakość wniosków.

Trzy zasady modułu:

1. **AI generuje hipotezy, nie prawdę.** Każdy wynik wymaga weryfikacji.
2. **Dane są granicą bezpieczeństwa.** Nie wklejaj sekretów ani danych osobowych bez zatwierdzonego procesu.
3. **Review człowieka jest obowiązkowe.** Kod, testy i decyzje wspierane przez AI muszą być sprawdzone.


## Cel lekcji

Ta lekcja koncentruje się na: **bezpieczeństwo danych, redakcja sekretów, deterministyczność, human-in-the-loop, polityki zespołowe i odpowiedzialne użycie AI**. Główne ryzyko: **zespół używa AI bez zasad, ujawnia dane wrażliwe, akceptuje halucynacje i wprowadza kod testowy bez odpowiedzialnego review**. Po lekturze powinieneś umieć korzystać z AI tak, aby zwiększać jakość pracy testera bez utraty kontroli nad prywatnością i poprawnością decyzji.

## Sytuacja przewodnia

organizacja chce dopuścić AI do pomocy w testowaniu, ale musi chronić dane klientów, sekrety, własność intelektualną i jakość decyzji technicznych

## 1. Prywatność

Najważniejsze ryzyko AI w QA to dane. Logi, payloady, screenshoty i trace mogą zawierać dane osobowe, tokeny albo informacje poufne.

## 2. Halucynacje

Model może brzmieć pewnie i jednocześnie podać nieprawdziwą informację. Dlatego odpowiedź AI wymaga weryfikacji.

## 3. Human-in-the-loop

Człowiek powinien zatwierdzać decyzje: zakres testów, interpretację ryzyka, kod w repozytorium i wnioski z awarii.

## 4. Polityka zespołowa

Zespół powinien wiedzieć, jakie narzędzia są dozwolone, jakie dane wolno przesyłać, jak oznaczać użycie AI i kto odpowiada za review.

## 5. Deterministyczność

AI może generować różne odpowiedzi dla podobnego promptu. Materiały używane w projekcie powinny być zapisane, reviewowane i wersjonowane.

## Przykład referencyjny

```markdown
# Minimalna polityka użycia AI w QA

Dozwolone:
- generowanie szkiców przypadków testowych na danych syntetycznych
- streszczanie zanonimizowanych logów
- propozycje checklist i pytań do wymagań

Zabronione bez zgody:
- wklejanie danych osobowych
- wklejanie sekretów, tokenów, kluczy API
- wklejanie kodu objętego ograniczeniami licencyjnymi

Wymagane:
- review człowieka
- weryfikacja w dokumentacji
- oznaczenie kodu wygenerowanego lub istotnie wspieranego przez AI
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

## Głębsza analiza: Bezpieczeństwo

Testowanie bezpieczeństwa w Playwright może obejmować:
- **XSS**: Sprawdzanie czy formularze filtrują złośliwe skrypty.
- **Autoryzacja**: Weryfikacja czy użytkownik bez uprawnień nie ma dostępu do chronionych tras (nawet jeśli przycisk w menu jest ukryty).
- **Nagłówki**: Sprawdzanie obecności nagłówków bezpieczeństwa (CSP, HSTS) w odpowiedziach serwera.
