# Debugowanie wspierane przez sztuczną inteligencję i analiza logów

> Moduł dwudziesty siódmy uczy korzystać ze sztucznej inteligencji jako wsparcia pracy testera, a nie jako zamiennika myślenia. AI może przyspieszyć analizę, generowanie pomysłów i porządkowanie logów, ale wymaga kontroli prywatności, weryfikacji i odpowiedzialnego procesu.

## Jak czytać ten moduł

Czytaj ten moduł przez pryzmat odpowiedzialności. Model językowy może pomóc wygenerować listę pytań, przypadków, danych lub hipotez, ale nie zna pełnego kontekstu produktu, decyzji biznesowych i ograniczeń prawnych. Tester nadal odpowiada za jakość wniosków.

Trzy zasady modułu:

1. **AI generuje hipotezy, nie prawdę.** Każdy wynik wymaga weryfikacji.
2. **Dane są granicą bezpieczeństwa.** Nie wklejaj sekretów ani danych osobowych bez zatwierdzonego procesu.
3. **Review człowieka jest obowiązkowe.** Kod, testy i decyzje wspierane przez AI muszą być sprawdzone.


## Cel lekcji

Ta lekcja koncentruje się na: **podsumowanie trace, logów, stack trace, hipotezy przyczyn, analiza flaky testów i ograniczenia automatycznych rekomendacji**. Główne ryzyko: **tester wkleja do AI wrażliwe logi albo przyjmuje halucynowaną przyczynę awarii bez weryfikacji w dowodach**. Po lekturze powinieneś umieć korzystać z AI tak, aby zwiększać jakość pracy testera bez utraty kontroli nad prywatnością i poprawnością decyzji.

## Sytuacja przewodnia

test płatności pada w CI, raport zawiera trace, logi konsoli i kilka odpowiedzi API, a tester chce uporządkować hipotezy przyczyn

## 1. AI porządkuje, ale nie dowodzi

Model może streścić logi i zaproponować hipotezy. Nie ma jednak dostępu do prawdy systemu, jeśli nie dostarczysz dowodów. Hipotezy trzeba potwierdzić.

## 2. Anonimizacja

Przed wklejeniem logów usuń tokeny, hasła, dane osobowe, identyfikatory klientów i sekrety. Najlepiej używać narzędzia zatwierdzonego przez organizację.

## 3. Hipotezy przyczyn

Dobry prompt prosi o hipotezy i dowody, nie o jedną pewną odpowiedź. To zmniejsza ryzyko halucynacji i wspiera myślenie diagnostyczne.

## 4. Flaky testy

AI może pomóc grupować objawy niestabilności: timeouty, dane, sieć, równoległość, środowisko. Nadal potrzebujesz metryk i powtarzalnych eksperymentów.

## 5. Ograniczenia rekomendacji

Model może zasugerować nieistniejącą opcję Playwrighta albo błędną komendę. Każdą rekomendację techniczną sprawdź w dokumentacji lub eksperymencie.

## Przykład referencyjny

```markdown
# Prompt do analizy awarii

Oto zanonimizowane dane z awarii testu Playwright.
Nie zgaduj jednej przyczyny. Przygotuj listę hipotez z dowodami do sprawdzenia.

Dane:
- krok: kliknięcie „Zapłać”
- oczekiwano: status „Opłacone”
- aktualny URL: /checkout
- response POST /api/payments: 502
- console error: Payment provider unavailable

Zwróć:
1. najbardziej prawdopodobne hipotezy
2. dowody za i przeciw
3. kolejne komendy lub artefakty do sprawdzenia
4. czego nie da się ustalić z tych danych
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
