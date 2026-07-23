# JMeter i testy protokołów

Apache JMeter to dojrzałe narzędzie do testów obciążeniowych i testów protokołów. W przeciwieństwie do k6, JMeter jest oparty o JVM i ma graficzny interfejs do budowania planów testów. W praktyce JMeter jest często spotykany w firmach enterprise, gdzie testuje się HTTP, JDBC, JMS, SOAP, LDAP, FTP i inne protokoły.

Najważniejsza zasada z oficjalnej dokumentacji JMeter: **plan testu można budować i debugować w GUI, ale load testy uruchamia się w trybie CLI/non-GUI**. GUI zużywa zasoby i zniekształca wyniki.

## 1. Test Plan

Test Plan to główny kontener konfiguracji. Zawiera Thread Groups, samplers, config elements, timers, assertions i listeners. Test Plan powinien mieć jasny cel: np. „load test katalogu produktów przy 500 użytkownikach”.

Nie traktuj `.jmx` jak przypadkowego pliku klikniętego w GUI. To kod testowy i powinien być wersjonowany, reviewowany i opisany.

## 2. Thread Group

Thread Group definiuje użytkowników wirtualnych:

- liczba threads;
- ramp-up;
- liczba iteracji;
- czas trwania;
- zachowanie przy błędzie.

Przykład interpretacji:

```text
100 threads
ramp-up 5 minut
czas trwania 20 minut
```

To oznacza stopniowe dojście do 100 równoległych użytkowników w ciągu 5 minut i utrzymanie obciążenia.

## 3. Samplers

Sampler wykonuje operację:

- HTTP Request;
- JDBC Request;
- JMS Publisher/Subscriber;
- SOAP/XML-RPC;
- TCP Sampler.

Dla testów web/API najczęściej używasz HTTP Request. Ustawiaj metodę, URL, body, headers i parametry. Nie zapominaj o `Content-Type` i autoryzacji.

## 4. Config Elements

Config Elements dostarczają wspólną konfigurację:

- HTTP Request Defaults;
- HTTP Header Manager;
- Cookie Manager;
- Cache Manager;
- CSV Data Set Config;
- JDBC Connection Configuration.

Dzięki nim nie powtarzasz base URL, nagłówków i danych użytkowników w każdym samplerze.

## 5. Timers

Bez timerów JMeter może generować nienaturalny ruch: każdy thread wysyła requesty natychmiast po sobie. Timery symulują think time użytkownika.

Przykłady:

- Constant Timer;
- Gaussian Random Timer;
- Uniform Random Timer;
- Throughput Shaping Timer.

Think time powinien wynikać z realnego profilu ruchu, nie z przypadku.

## 6. Assertions

Assertions sprawdzają poprawność odpowiedzi:

- Response Assertion;
- JSON Assertion;
- Duration Assertion;
- Size Assertion;
- JSR223 Assertion.

Test wydajnościowy bez asercji może mierzyć szybkość błędnych odpowiedzi. Najpierw sprawdź, że odpowiedź jest poprawna, dopiero potem interpretuj latency.

## 7. Listeners

Listeners pokazują wyniki, ale w dużych testach mogą spowalniać JMeter. Do debugowania w GUI używa się View Results Tree. Do load testów lepiej zapisywać wyniki do pliku JTL i generować HTML report.

Uruchomienie CLI:

```bash
jmeter -n -t test-plan.jmx -l results.jtl -e -o report/
```

- `-n` — non-GUI mode;
- `-t` — plik test planu;
- `-l` — wyniki JTL;
- `-e -o` — generowanie HTML dashboard.

## 8. CSV Data Set Config

CSV Data Set Config pozwala zasilać test danymi:

```text
email,password
user1@example.test,secret
user2@example.test,secret
```

Dane powinny być unikalne, jeśli operacje modyfikują stan. W przeciwnym razie wirtualni użytkownicy będą blokować się nawzajem.

## 9. Distributed testing

JMeter może działać rozproszony: jeden controller i wiele generatorów obciążenia. To przydatne przy dużym ruchu, ale wymaga synchronizacji wersji JMeter, pluginów, danych i sieci.

Zanim skalujesz generator, sprawdź, czy wąskim gardłem nie jest sam injector. Monitoruj CPU, RAM, GC i sieć maszyn JMeter.

## 10. JMeter vs k6

JMeter:

- mocny w enterprise i wielu protokołach;
- GUI ułatwia start;
- JVM i pluginy;
- dobry dla JDBC/JMS/SOAP.

k6:

- skrypty jako kod JS;
- łatwiejszy w CI/Git review;
- lekki i nowoczesny;
- mocny dla HTTP/API i automatyzacji.

Wybór zależy od ekosystemu i protokołów.

## 11. Checklista JMeter

- Czy load test uruchamiasz w non-GUI mode?
- Czy Test Plan ma opisany cel i profil obciążenia?
- Czy są assertions poprawności odpowiedzi?
- Czy dane z CSV są izolowane?
- Czy listeners nie spowalniają testu?
- Czy monitorujesz maszynę generującą obciążenie?
- Czy raport HTML jest archiwizowany?

## Linki

- [Apache JMeter Getting Started](https://jmeter.apache.org/usermanual/get-started.html)
- [JMeter Best Practices](https://jmeter.apache.org/usermanual/best-practices.html)
- [JMeter Component Reference](https://jmeter.apache.org/usermanual/component_reference.html)
- [JMeter Dashboard Report](https://jmeter.apache.org/usermanual/generating-dashboard.html)

## 12. Korelacja i zmienne

JMeter potrafi wyciągać dane z odpowiedzi i używać ich w kolejnych requestach, np. token CSRF albo ID zamówienia. Służą do tego extractory:

- JSON Extractor;
- Regular Expression Extractor;
- XPath Extractor;
- CSS/JQuery Extractor.

Bez korelacji test może działać tylko na nagranym, statycznym scenariuszu i szybko przestanie być realistyczny.

## 13. CLI w CI

W CI używaj non-GUI mode:

```bash
jmeter -n -t checkout.jmx -l results.jtl -e -o report
```

Publikuj `results.jtl` i `report/` jako artefakty. Jeśli test ma progi jakości, pipeline powinien zakończyć się błędem przy ich przekroczeniu.

## 14. Dane i środowisko

JMeter potrafi wygenerować bardzo duży ruch. Nie uruchamiaj testów na współdzielonym stagingu bez uzgodnienia. Ustal okno testowe, dane, limity i monitoring. W przeciwnym razie test wydajnościowy stanie się incydentem dla innych zespołów.

## 15. Progi w JMeter

JMeter nie ma identycznego mechanizmu thresholds jak k6, ale możesz egzekwować progi przez assertions, analizę JTL albo pluginy. W CI często stosuje się skrypt, który czyta `results.jtl` i sprawdza p95, error rate oraz liczbę błędów.

## 16. Zasada końcowa

JMeter jest najcenniejszy, gdy traktujesz Test Plan jak kod: wersjonujesz, uruchamiasz w CLI, publikujesz raport i opisujesz profil obciążenia.

## 📘 Suplement Inżynieryjny 2026: Testowanie Wydajności z k6 i JMeter
*Inspiracja: „Scalable Test Automation with Playwright” (2026), Chapter 11*
*   **Performance Budgets**: Integruj testy wydajnościowe k6 z rurociągami CI, definiując precyzyjne budżety wydajności (np. 95% żądań musi odpowiedzieć w czasie poniżej 200 ms). Zapobiegnie to stopniowej degradacji szybkości systemu.
