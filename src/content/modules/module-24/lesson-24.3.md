# JMeter i testy protokołów

> Moduł dwudziesty czwarty uczy prowadzić testy wydajnościowe jako eksperyment inżynierski. Obciążenie bez hipotezy, metryk i progów jest tylko ruchem generowanym w systemie.

## Jak czytać ten moduł

Czytaj ten moduł przez pryzmat pytania: jaką decyzję ma wspierać test wydajnościowy? Czy system wytrzyma normalny ruch, gdzie jest granica, co stanie się przy piku, czy długotrwała praca degraduje usługę i czy wynik mieści się w budżecie?

Trzy zasady modułu:

1. **Najpierw hipoteza, potem ruch.** Test bez celu nie daje wiedzy.
2. **Percentyle są ważniejsze niż średnia.** Użytkownik w ogonie rozkładu też jest użytkownikiem.
3. **Wynik wymaga metryk systemu.** Bez CPU, pamięci, bazy i logów znasz objaw, nie przyczynę.


## Cel lekcji

Ta lekcja koncentruje się na: **thread groups, samplers, assertions, timers, listeners, parametryzacja, korelacja i utrzymywanie dużych planów testów protokołów**. Główne ryzyko: **plan JMeter staje się nieczytelnym zbiorem samplerów, który trudno wersjonować, parametryzować i uruchamiać w CI**. Po lekturze powinieneś umieć zaprojektować test wydajnościowy z hipotezą, profilem obciążenia, progami i interpretacją wyników.

## Sytuacja przewodnia

organizacja ma istniejące testy JMeter dla HTTP i JMS, ale raporty są trudne do interpretacji, a dane użytkowników są wpisane na stałe

## 1. JMeter jako narzędzie protokołów

JMeter jest mocny w testach protokołów i starszych ekosystemach. Dobrze obsługuje HTTP, JDBC, JMS i złożone plany, ale wymaga dyscypliny organizacyjnej.

## 2. Thread groups i samplers

Thread group definiuje użytkowników i czas wykonania, a sampler wykonuje konkretną operację protokołu. Nazwy powinny opisywać zachowanie, nie tylko endpoint.

## 3. Assertions i timers

Assertions sprawdzają poprawność odpowiedzi, a timers kształtują ruch. Bez timerów test może generować nierealistyczne obciążenie.

## 4. Parametryzacja i korelacja

Dane powinny pochodzić z plików, zmiennych lub setupu, a nie być wpisane na stałe. Korelacja pozwala przenosić tokeny i identyfikatory między żądaniami.

## 5. Utrzymywalność planów

Duży plan JMeter wymaga konwencji nazw, modułów, wersjonowania i uruchamiania headless w CI. GUI jest dobre do projektowania, nie do pipeline.

## Przykład referencyjny

```text
Plan testu JMeter:

Thread Group: Checkout users
  CSV Data Set Config: users.csv
  HTTP Request Defaults: ${BASE_URL}
  Transaction Controller: Checkout
    HTTP Request: GET /products/${productId}
    HTTP Request: POST /cart
    HTTP Request: POST /checkout
  Response Assertion: status 2xx
  Constant Throughput Timer: 120 req/min
  Summary Report / JTL output
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
