# Analiza wąskich gardeł i budżet wydajności

> Moduł dwudziesty czwarty uczy prowadzić testy wydajnościowe jako eksperyment inżynierski. Obciążenie bez hipotezy, metryk i progów jest tylko ruchem generowanym w systemie.

## Jak czytać ten moduł

Czytaj ten moduł przez pryzmat pytania: jaką decyzję ma wspierać test wydajnościowy? Czy system wytrzyma normalny ruch, gdzie jest granica, co stanie się przy piku, czy długotrwała praca degraduje usługę i czy wynik mieści się w budżecie?

Trzy zasady modułu:

1. **Najpierw hipoteza, potem ruch.** Test bez celu nie daje wiedzy.
2. **Percentyle są ważniejsze niż średnia.** Użytkownik w ogonie rozkładu też jest użytkownikiem.
3. **Wynik wymaga metryk systemu.** Bez CPU, pamięci, bazy i logów znasz objaw, nie przyczynę.


## Cel lekcji

Ta lekcja koncentruje się na: **p95/p99, RPS, throughput, error rate, zasoby, baseline, wąskie gardła, regresje i raportowanie wyników wydajnościowych**. Główne ryzyko: **zespół ma wyniki testu obciążeniowego, ale nie potrafi odróżnić objawu od przyczyny ani podjąć decyzji technicznej**. Po lekturze powinieneś umieć zaprojektować test wydajnościowy z hipotezą, profilem obciążenia, progami i interpretacją wyników.

## Sytuacja przewodnia

pod obciążeniem rośnie p95 checkoutu, ale nie wiadomo, czy przyczyną jest baza, API płatności, CPU, kolejka czy brak cache

## 1. Objaw a przyczyna

Wysoki p95 jest objawem. Przyczyną może być baza, CPU, sieć, locki, kolejka, zewnętrzne API, GC albo kod aplikacji.

## 2. Percentyle

P95 i P99 pokazują doświadczenie użytkowników w ogonie rozkładu. Średnia może wyglądać dobrze, gdy część użytkowników cierpi.

## 3. Throughput i RPS

RPS mówi o liczbie żądań na sekundę, throughput o przepustowości. Interpretuj je razem z błędami i opóźnieniami.

## 4. Baseline i regresja

Baseline pozwala wykryć zmianę względem wcześniejszego stanu. Bez baseline trudno ocenić, czy wynik jest problemem.

## 5. Budżet wydajności

Performance budget powinien być liczbowy, uzasadniony i powiązany z ryzykiem. Może dotyczyć p95, błędów, rozmiaru zasobów albo czasu procesu.

## Przykład referencyjny

```markdown
# Raport wydajności checkoutu

Baseline: p95 = 420 ms przy 100 RPS
Aktualny wynik: p95 = 870 ms przy 100 RPS
Error rate: 0.3% → 2.8%
CPU payment-api: 40% → 85%
DB slow queries: wzrost z 2/min do 120/min
Wniosek: regresja prawdopodobnie w zapytaniu pobierania metod płatności
Decyzja: blokada wydania do analizy indeksu i cache
```

Przykład pokazuje, że test wydajnościowy powinien mieć profil ruchu, checks, thresholds i sposób interpretacji. Samo wysłanie wielu żądań nie wystarcza.

## Lista kontrolna

- Czy test ma hipotezę?
- Czy profil obciążenia odpowiada realnemu lub planowanemu ruchowi?
- Czy są progi p95/p99, error rate i throughput?
- Czy środowisko jest kontrolowane?
- Czy zbierasz metryki aplikacji i infrastruktury?
- Czy raport prowadzi do decyzji technicznej?


## Dobre praktyki i perspektywa inżynierska
Automatyzacja to proces ciągłego doskonalenia. Aby Twoje testy niosły realną wartość, stosuj się do poniższych zasad:
- **Testuj zachowanie, nie kod**: Skup się na tym, co widzi i robi użytkownik. Zmienne nazwy klas CSS nie powinny psuć Twoich testów.
- **Fail-fast**: Test powinien dawać jasny sygnał o błędzie tak szybko, jak to możliwe. Unikaj "wiszących" testów, które blokują kolejkę CI.
- **Ewoluuj**: Regularnie przeglądaj swoje testy. Usuwaj te, które są niestabilne i nie dają wartości, a refaktoryzuj te, które stają się zbyt skomplikowane.
