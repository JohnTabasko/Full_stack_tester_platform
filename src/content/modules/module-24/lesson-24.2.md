# Podstawy k6

k6 to narzędzie do testów wydajnościowych tworzone z myślą o programistach, testerach i SRE. Scenariusze pisze się w JavaScript, ale k6 nie jest Node.js — ma własne środowisko wykonawcze zoptymalizowane pod generowanie obciążenia. W praktyce k6 świetnie nadaje się do testów HTTP API, smoke performance, load, stress, spike i soak testów oraz automatyzacji progów jakości w CI.

Celem testu k6 nie jest „wysłać dużo requestów”. Celem jest odpowiedzieć na pytanie: czy system spełnia wymagania wydajnościowe przy określonym profilu ruchu?

## 1. Minimalny test k6

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export default function () {
  const response = http.get('https://test.example.com/api/products');

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response is not empty': (r) => r.body.length > 0,
  });

  sleep(1);
}
```

Uruchomienie:

```bash
k6 run products.js
```

`check` nie zatrzymuje testu jak asercja jednostkowa. Zapisuje wynik warunku jako metrykę. Do zatrzymania pipeline używa się thresholds.

## 2. Lifecycle k6

k6 ma kilka faz:

- **init context** — kod poza funkcjami, uruchamiany przy starcie VU;
- **setup** — przygotowanie danych przed testem;
- **default function** — główny scenariusz wykonywany przez VU;
- **teardown** — sprzątanie po teście;
- **handleSummary** — generowanie raportu.

Przykład:

```javascript
export function setup() {
  return { token: 'test-token' };
}

export default function (data) {
  http.get('https://test.example.com/api/orders', {
    headers: { Authorization: `Bearer ${data.token}` },
  });
}

export function teardown(data) {
  // cleanup, jeśli potrzebny
}
```

## 3. VUs, iterations i duration

VU to virtual user. Nie oznacza zawsze człowieka 1:1, ale symuluje równoległe wykonywanie scenariusza.

```javascript
export const options = {
  vus: 20,
  duration: '5m',
};
```

Alternatywnie możesz sterować liczbą iteracji:

```javascript
export const options = {
  vus: 10,
  iterations: 1000,
};
```

## 4. Scenarios i executors

Nowoczesne k6 używa `scenarios`, które pozwalają definiować różne modele ruchu:

```javascript
export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-vus',
      vus: 30,
      duration: '10m',
    },
    ramping_load: {
      executor: 'ramping-vus',
      stages: [
        { duration: '2m', target: 20 },
        { duration: '5m', target: 20 },
        { duration: '2m', target: 0 },
      ],
    },
  },
};
```

Executors dobiera się do celu: stałe obciążenie, ramp-up, określona liczba iteracji, stały rate żądań.

## 5. Thresholds — quality gates

Thresholds zamieniają wymagania wydajnościowe w automatyczną ocenę:

```javascript
export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
  },
};
```

Jeśli próg zostanie przekroczony, k6 zakończy się niepowodzeniem. To pozwala blokować regresje wydajnościowe w CI.

## 6. Checks vs thresholds

- `checks` odpowiadają na pytanie: czy pojedyncza odpowiedź spełnia warunek?
- `thresholds` odpowiadają: czy całość testu spełniła kryteria jakości?

Przykład: endpoint może czasem zwrócić 500, ale jeśli błędów jest mniej niż 1%, threshold może przejść. Dla krytycznych operacji płatności próg powinien być znacznie surowszy.

## 7. Custom metrics

k6 ma metryki typu `Trend`, `Counter`, `Rate`, `Gauge`.

```javascript
import { Trend } from 'k6/metrics';

const checkoutDuration = new Trend('checkout_duration');

export default function () {
  const start = Date.now();
  // flow checkout API
  checkoutDuration.add(Date.now() - start);
}
```

Custom metrics pomagają mierzyć proces biznesowy, nie tylko pojedyncze requesty.

## 8. Typy testów w k6

- **smoke** — małe obciążenie, czy skrypt i system działają;
- **load** — oczekiwane obciążenie produkcyjne;
- **stress** — szukanie granicy systemu;
- **spike** — nagły wzrost ruchu;
- **soak** — długi test stabilności i wycieków zasobów.

Nie każdy test musi być duży. Performance smoke w PR może trwać 1–3 minuty, a pełny load test może działać nightly.

## 9. Dane testowe

Wydajność zależy od danych. Test na pustej bazie jest mało wartościowy. Przygotuj dataset:

- liczba produktów;
- liczba użytkowników;
- rozkład zamówień;
- koszyki z różną liczbą pozycji;
- dane hot/cold cache;
- konta testowe per VU lub per scenariusz.

## 10. Checklista k6

- Czy jest jasno opisany cel testu?
- Czy scenariusz odpowiada realnemu profilowi ruchu?
- Czy thresholds wynikają z wymagań lub SLO?
- Czy dane testowe są realistyczne?
- Czy raport zawiera p95/p99, error rate i throughput?
- Czy test nie przeciąża współdzielonego środowiska bez zgody?

## Linki

- [Grafana k6 Documentation](https://grafana.com/docs/k6/latest/)
- [k6 Options](https://grafana.com/docs/k6/latest/using-k6/k6-options/)
- [k6 Thresholds](https://grafana.com/docs/k6/latest/using-k6/thresholds/)
- [k6 Scenarios](https://grafana.com/docs/k6/latest/using-k6/scenarios/)

## 11. k6 w CI

W CI nie uruchamiaj od razu dużych testów. Zacznij od małego performance smoke:

```bash
k6 run --vus 5 --duration 1m tests/performance/smoke.js
```

Pełne load/stress/soak testy uruchamiaj nightly albo ręcznie przed release. Wyniki powinny być artefaktem pipeline: summary, JSON, wykresy albo link do Grafana Cloud k6.

## 12. Raportowanie wyniku

Raport k6 powinien zawierać:

- wersję aplikacji;
- środowisko;
- profil obciążenia;
- dataset;
- thresholds;
- p95/p99;
- error rate;
- wnioski i rekomendacje.

Bez tych danych wynik „test przeszedł” niewiele mówi.

## 13. Typowe błędy początkujących

- testowanie bez thresholds;
- brak checks poprawności odpowiedzi;
- zbyt duży test uruchamiany w każdym PR;
- brak realistycznych danych;
- ignorowanie błędów 4xx/5xx;
- porównywanie wyników z różnych środowisk bez opisu różnic;
- brak monitoringu backendu podczas testu.
