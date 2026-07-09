# Analiza wąskich gardeł i budżet wydajności

Test wydajnościowy bez analizy jest tylko generowaniem ruchu. Najważniejsza praca zaczyna się po teście: interpretacja metryk, korelacja z logami i infrastrukturą, wskazanie wąskiego gardła oraz decyzja, czy wynik spełnia budżet wydajności.

Wąskie gardło to element systemu, który ogranicza przepustowość lub zwiększa opóźnienia. Może znajdować się w aplikacji, bazie, cache, sieci, zewnętrznym API, konfiguracji kontenerów albo w samym generatorze obciążenia.

## 1. Latency, throughput i error rate

Podstawowe metryki:

- **latency** — czas odpowiedzi;
- **throughput** — liczba obsłużonych requestów na sekundę;
- **error rate** — procent błędów;
- **concurrency** — liczba równoległych użytkowników/operacji;
- **saturation** — stopień wykorzystania zasobów.

Nie interpretuj czasu odpowiedzi bez błędów. System może być szybki, bo zwraca 500 dla połowy żądań.

## 2. Percentyle

Średnia jest często myląca. Percentyle pokazują ogon rozkładu:

- p50 — mediana;
- p90 — 90% requestów było nie wolniejsze niż ta wartość;
- p95 — standardowy próg dla wielu SLA/SLO;
- p99 — doświadczenie najwolniejszych użytkowników.

Przykład:

```text
avg = 220 ms
p95 = 900 ms
p99 = 2500 ms
```

Średnia wygląda dobrze, ale część użytkowników czeka bardzo długo. To może oznaczać locki, GC, cold cache, wolne zapytania albo zewnętrzną zależność.

## 3. Saturation

Saturation mówi, czy zasób jest blisko limitu:

- CPU 95%;
- pula połączeń DB zajęta;
- kolejka rośnie;
- dysk ma wysokie I/O wait;
- liczba połączeń HTTP przekracza limit;
- memory rośnie bez spadku.

Jeśli latency rośnie wraz z saturacją, masz silny trop.

## 4. Baza danych jako wąskie gardło

Objawy:

- rosnące p95/p99;
- wolne zapytania;
- lock waits;
- wysoki CPU DB;
- pula połączeń wyczerpana;
- brak indeksu;
- zbyt duży payload.

Diagnostyka:

- slow query log;
- `EXPLAIN ANALYZE`;
- metryki połączeń;
- lock monitoring;
- porównanie danych testowych z produkcyjnymi.

## 5. Aplikacja jako wąskie gardło

Objawy:

- wysokie CPU aplikacji;
- długie GC;
- thread pool wyczerpany;
- event loop lag;
- rosnący memory usage;
- endpointy synchronicznie czekają na zewnętrzne API.

Dla Node.js warto obserwować event loop delay, CPU, heap, liczbę requestów i błędy.

## 6. Zewnętrzne API

Jeżeli system zależy od płatności, email, SMS albo SSO, p95 może być ograniczony przez dostawcę. Wtedy test powinien rozróżniać:

- wydajność własnego systemu;
- wydajność integracji;
- zachowanie fallback/retry;
- wpływ timeoutów.

Nie optymalizuj aplikacji, jeśli bottleneck jest po stronie sandboxa dostawcy.

## 7. Generator obciążenia jako wąskie gardło

Czasem problemem nie jest system, ale maszyna generująca ruch. Objawy:

- CPU generatora 100%;
- brak sieci;
- błędy połączeń lokalnie;
- wyniki różnią się przy większym injectorze.

Monitoruj generatory tak samo jak system testowany.

## 8. Budżet wydajności

Budżet wydajności to jawny próg akceptacji:

```text
GET /api/products p95 < 500 ms
POST /api/orders p95 < 1000 ms
error rate < 1%
payload produktów < 200 KB
checkout API flow < 2 s
```

Budżet musi mieć właściciela. Jeśli nikt nie reaguje na przekroczenie, metryka staje się szumem.

## 9. Korelacja z obserwowalnością

Najlepsza analiza łączy:

- wynik k6/JMeter;
- metryki Prometheus;
- dashboard Grafana;
- logi Loki/Kibana;
- traces OpenTelemetry;
- slow query log;
- deployment/change log.

Pytanie nie brzmi tylko „czy było wolno?”, ale „co było wąskim gardłem i dlaczego?”.

## 10. Raport z analizy

Dobry raport zawiera:

- cel testu;
- wersję aplikacji;
- środowisko;
- profil obciążenia;
- dataset;
- wyniki p50/p95/p99;
- error rate;
- throughput;
- metryki infrastruktury;
- hipotezę bottlenecku;
- rekomendacje;
- decyzję: pass/fail/needs investigation.

## 11. Checklista analizy

- Czy odpowiedzi były poprawne funkcjonalnie?
- Czy patrzysz na p95/p99, nie tylko średnią?
- Czy error rate jest akceptowalny?
- Czy generator obciążenia nie jest limitem?
- Czy dataset jest realistyczny?
- Czy masz metryki aplikacji, DB i infrastruktury?
- Czy raport wskazuje konkretną rekomendację?

## Linki

- [k6 Metrics](https://grafana.com/docs/k6/latest/using-k6/metrics/)
- [k6 Thresholds](https://grafana.com/docs/k6/latest/using-k6/thresholds/)
- [JMeter Dashboard Report](https://jmeter.apache.org/usermanual/generating-dashboard.html)
- [Prometheus Overview](https://prometheus.io/docs/introduction/overview/)
- [OpenTelemetry Docs](https://opentelemetry.io/docs/)

## 12. Przykład diagnozy

Sytuacja:

```text
p95 /api/orders = 2200 ms
error rate = 0.5%
CPU API = 45%
CPU DB = 95%
slow query: SELECT orders with missing index
```

Wniosek: aplikacja nie jest głównym bottleneckiem. Najpierw sprawdź indeksy, plan zapytania i rozmiar tabeli. Optymalizacja kodu kontrolera prawdopodobnie nie rozwiąże problemu.

## 13. Budżet frontend vs backend

Budżet wydajności może dotyczyć różnych warstw:

- API p95;
- czas renderowania strony;
- rozmiar JS bundle;
- LCP/CLS/INP;
- czas pełnego checkoutu;
- czas generowania raportu.

Nie mieszaj ich w jednym wyniku. Każda warstwa ma inne narzędzia i właścicieli.

## 14. Zasada końcowa

Analiza wydajności jest pracą detektywistyczną. Wynik testu wskazuje symptom, ale dopiero korelacja z metrykami, logami i traces pozwala znaleźć przyczynę.

## 15. Capacity planning

Wyniki testów wydajnościowych można wykorzystać do planowania pojemności. Jeśli system obsługuje 200 RPS przy CPU 70%, a biznes oczekuje 400 RPS w kampanii promocyjnej, potrzebujesz skalowania albo optymalizacji. Test powinien pokazywać nie tylko pass/fail, ale też zapas względem celu.

## 16. Regresja wydajności

Regresja to pogorszenie względem baseline. Dlatego zapisuj wyniki historyczne. Pojedynczy test mówi, jak było dziś. Trend mówi, czy system zwalnia po kolejnych zmianach.
