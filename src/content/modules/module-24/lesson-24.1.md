# Testy wydajnościowe i obciążeniowe — kompletny przewodnik

> **Perspektywa Full Stack Testera**
> Aplikacja, która działa poprawnie dla jednego użytkownika, może paść przy 1000 jednoczesnych użytkowników. I odwrotnie — funkcjonalność może być perfekcyjna, ale jeśli strona ładuje się 8 sekund, użytkownicy odejdą. Testy wydajnościowe to nie jest "nice to have" — to fundament jakości w środowiskach produkcyjnych. Playwright nie jest narzędziem do load testingu (jego testy są zbyt ciężkie), ale standardem rynkowym dla tego celu jest **k6** — narzędzie oparte na JavaScript/Go, które symuluje tysiące użytkowników z jednego laptopa. Ta lekcja łączy Playwright (funkcjonalność) z k6 (wydajność), tworząc pełny obraz jakości systemu.

## Cel lekcji

Po ukończeniu tej lekcji rozumiesz różnicę między testami wydajnościowymi, obciążeniowymi i stresowymi, potrafisz pisać skrypty k6 do symulacji obciążenia, znasz kluczowe metryki (VUs, RPS, latency p95/p99, error rate), konfigurujesz budżety wydajnościowe i alerty w CI, potrafisz interpretować raporty k6, i wiesz, jak połączyć Playwright (E2E) z k6 (performance) w jednym pipeline.

---

## Rodzaje testów wydajnościowych

### 1. Testy obciążeniowe (Load Testing)

**Cel**: Sprawdzenie, jak system zachowuje się pod oczekiwanym obciążeniem.

```typescript
// Cel: Czy system wytrzymuje 100 jednoczesnych użytkowników w normalnych warunkach?
// - Czy odpowiedź < 2s dla 95% żądań?
// - Czy error rate < 1%?
// - Czy przepustowość > 500 RPS?
```

### 2. Testy stresowe (Stress Testing)

**Cel**: Znalezienie punktu przełamania systemu.

```typescript
// Cel: Ile użytkowników system wytrzymuje zanim zacznie się psuć?
// - Stopniowo zwiększaj obciążenie: 100 → 200 → 500 → 1000 → 2000
// - Zidentyfikuj punkt, w którym latency rośnie dramatycznie
// - Zidentyfikuj punkt, w którym zaczynają się błędy
```

### 3. Testy soak (Endurance Testing)

**Cel**: Czy system działa stabilnie przez długi czas pod stałym obciążeniem?

```typescript
// Cel: Czy po 8 godzinach pod stałym obciążeniem nie ma:
// - Memory leaks
// - Degradacji wydajności
// - Problemów z bazą danych
```

### 4. Testy spike (Spike Testing)

**Cel**: Jak system reaguje na nagły, dramatyczny skok ruchu?

```typescript
// Cel: System ma 50 użytkowników, nagle skok do 1000, potem powrót do 50
// - Czy system nie pada?
// - Czy recovery time jest akceptowalny?
```

---

## k6 — narzędzie do load testingu

### Dlaczego Playwright ≠ load testing?

Playwright uruchamia prawdziwą przeglądarkę (Chromium), która zużywa ~100-200MB RAM na instancję. Symulacja 1000 użytkowników = 100-200GB RAM. To nie jest praktyczne.

k6 symuluje ruch HTTP bez przeglądarki — każdy VU (Virtual User) to lekki proces (~1-2MB RAM). 1000 VUs = ~1-2GB RAM. Możliwe nawet z laptopa.

### Instalacja k6

```bash
# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /tmp/k6-keyring.gpg --keyserver hkp://keyserver.ubuntu.com --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
sudo gpg --no-default-keyring --keyring /tmp/k6-keyring.gpg --export C5AD17C747E3415A3642D57D77C6C491D6AC1D69 | sudo tee /etc/apt/trusted.gpg.d/k6.gpg > /dev/null
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows: pobierz z https://k6.io/docs/getting-started/installation/
```

---

## Pierwszy skrypt k6 — load test API

### Podstawowy skrypt (scenarios/smoke-test.js)

```javascript
// scenarios/smoke-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // Konfiguracja etapów obciążenia
  stages: [
    { duration: '30s', target: 10 },   // Ramp-up: 0 → 10 VUs w 30s
    { duration: '1m', target: 10 },    // Stałe obciążenie: 10 VUs przez 1 min
    { duration: '30s', target: 0 },    // Ramp-down: 10 → 0 VUs w 30s
  ],
  
  // Globalne limity
  thresholds: {
    http_req_duration: ['p(95)<500'],   // 95% żądań < 500ms
    http_req_failed: ['rate<0.05'],     // Mniej niż 5% błędów
    http_reqs: ['rate>10'],             // Co najmniej 10 RPS
  },
};

const BASE_URL = 'https://api.mojaaplikacja.pl';

export default function () {
  // ============================================================
  // SCENARIUSZ 1: Pobranie listy produktów
  // ============================================================
  const productsRes = http.get(`${BASE_URL}/api/products?limit=20`);
  
  check(productsRes, {
    'produkty: status 200': (r) => r.status === 200,
    'produkty: czas < 500ms': (r) => r.timings.duration < 500,
    'produkty: zawiera dane': (r) => JSON.parse(r.body).length > 0,
  });

  // ============================================================
  // SCENARIUSZ 2: Pobranie szczegółów produktu
  // ============================================================
  const productId = 'PROD-001';
  const productRes = http.get(`${BASE_URL}/api/products/${productId}`);
  
  check(productRes, {
    'produkt: status 200': (r) => r.status === 200,
    'produkt: cena istnieje': (r) => JSON.parse(r.body).price !== undefined,
  });

  // ============================================================
  // SCENARIUSZ 3: Autoryzacja użytkownika
  // ============================================================
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, 
    JSON.stringify({ email: 'loadtest@example.pl', password: 'LoadTest123!' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  check(loginRes, {
    'login: status 200': (r) => r.status === 200,
    'login: token istnieje': (r) => JSON.parse(r.body).token !== undefined,
  });
  
  // Symulacja czasu "myślenia" użytkownika (1-3 sekundy)
  sleep(1 + Math.random() * 2);
}
```

### Uruchomienie i interpretacja wyników

```bash
# Uruchomienie testu
k6 run scenarios/smoke-test.js

# Wynik:
# running (0m45s) ← czas trwania
#     10 VUs      ← aktywne Virtual Users
#
# http_req_duration........: avg=142ms p(95)=298ms p(99)=412ms
#     ✓ p(95) < 500ms
#
# http_req_failed..........: 0.00%   ← 0% błędów
#     ✓ rate < 0.05
#
# http_reqs................: 47.45   ← 47.45 requests per second
#     ✓ rate > 10
#
# checks...................: 100.00% ← 100% checks passed

# status: ✓ Test passed (no thresholds violated)
```

---

## Zaawansowany skrypt k6 — realistic user flow

### Scenariusz zakupowy (scenarios/checkout-flow.js)

```javascript
// scenarios/checkout-flow.js
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Własne metryki
const checkoutDuration = new Trend('checkout_duration');
const loginDuration = new Trend('login_duration');
const errorRate = new Rate('checkout_errors');

const BASE_URL = 'https://api.mojaaplikacja.pl';

export const options = {
  // Test obciążeniowy: 50 użytkowników przez 5 minut
  stages: [
    { duration: '2m', target: 50 },    // Powolny ramp-up
    { duration: '5m', target: 50 },    // Stałe obciążenie 50 VUs
    { duration: '2m', target: 0 },     // Cool-down
  ],
  
  thresholds: {
    'checkout_duration': ['p(95)<3000', 'p(99)<5000'], // 95% < 3s, 99% < 5s
    'login_duration': ['p(95)<1000'],
    'checkout_errors': ['rate<0.02'],   // Mniej niż 2% błędów checkout
    'http_req_duration': ['p(95)<2000'],
  },
};

export default function () {
  const results = { success: false, errors: [] };
  
  // ============================================================
  // GRUPY — organizacja timingów w raporcie
  // ============================================================
  group('Login', () => {
    const loginStart = Date.now();
    const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
      email: `loadtest.${Date.now()}@test.pl`,
      password: 'TestPassword123!',
    }), { headers: { 'Content-Type': 'application/json' } });
    
    loginDuration.add(Date.now() - loginStart);
    
    if (loginRes.status !== 200) {
      errorRate.add(1);
      results.errors.push(`Login failed: ${loginRes.status}`);
      return;
    }
    
    const token = JSON.parse(loginRes.body).token;
    const authHeader = { Authorization: `Bearer ${token}` };
    
    // ============================================================
    // GRUPY — Proces zakupowy
    // ============================================================
    group('Browse Products', () => {
      const productsRes = http.get(`${BASE_URL}/api/products?limit=10`, { headers: authHeader });
      
      check(productsRes, {
        'produkty pobrane': (r) => r.status === 200,
        'lista niepusta': (r) => JSON.parse(r.body).length > 0,
      });
      
      sleep(2 + Math.random() * 3);
    });
    
    group('Add to Cart', () => {
      const cartRes = http.post(`${BASE_URL}/api/cart/items`,
        JSON.stringify({ productId: 'PROD-001', quantity: 1 }),
        { headers: { ...authHeader, 'Content-Type': 'application/json' } }
      );
      
      check(cartRes, {
        'produkt dodany': (r) => r.status === 201,
      });
      
      sleep(1 + Math.random() * 2);
    });
    
    group('Checkout', () => {
      const checkoutStart = Date.now();
      
      const checkoutRes = http.post(`${BASE_URL}/api/orders`,
        JSON.stringify({
          shippingAddress: { city: 'Warszawa', street: 'Marszałkowska 10' },
          paymentMethod: 'card',
        }),
        { headers: { ...authHeader, 'Content-Type': 'application/json' } }
      );
      
      checkoutDuration.add(Date.now() - checkoutStart);
      
      const passed = check(checkoutRes, {
        'checkout: status 201': (r) => r.status === 201,
        'checkout: order id': (r) => JSON.parse(r.body).id !== undefined,
      });
      
      if (!passed) {
        errorRate.add(1);
        results.errors.push(`Checkout failed: ${checkoutRes.status}`);
      } else {
        results.success = true;
      }
    });
  });
  
  sleep(3 + Math.random() * 5); // Czas między sesjami
}
```

---

## Metryki wydajnościowe — co oznaczają i jak interpretować

### Kluczowe metryki k6

| Metryka | Opis | Co mówi | Próg jakościowy |
|---|---|---|---|
| **VUs** | Virtual Users — równoległe sesje | Jak duże obciążenie symulujesz | Zależy od projektu |
| **RPS** | Requests Per Second — przepustowość | Ile żądań system obsługuje na sekundę | > 100 dla typowej aplikacji |
| **p50 (median)** | Mediana — połowa żądań szybsza, połowa wolniejsza | "Typowy" czas odpowiedzi | < 500ms dla API |
| **p95** | 95. percentyl — 95% żądań szybsze, 5% wolniejsze | Doświadczenie niemal wszystkich użytkowników | < 1000ms |
| **p99** | 99. percentyl — 99% szybsze, 1% wolniejsze | "Outliers" — użytkownicy w ekstremalnych warunkach | < 2000ms |
| **avg** | Średnia arytmetyczna | Bardzo podatna na outliers | Myląca — zawsze patrz na p95! |
| **Error Rate** | % żądań z błędem (4xx, 5xx, timeout) | Stabilność systemu | < 1% dla krytycznych, < 5% dla standardowych |
| **Duration** | Czas trwania pojedynczego żądania | Konkretna operacja | Zależy od operacji |

### Budżety wydajnościowe

```javascript
export const options = {
  thresholds: {
    // API ogólne
    'http_req_duration': ['p(95)<1000'],        // 95% żądań < 1s
    
    // Konkretne endpointy
    'http_req_duration{type:api-products}': ['p(95)<500'],
    'http_req_duration{type:api-checkout}': ['p(95)<3000'],
    'http_req_duration{type:api-login}': ['p(95)<1000'],
    
    // Metryki custom
    'checkout_duration': ['p(95)<3000', 'avg<2000'],
    'login_duration': ['p(95)<1000'],
    
    // Error rate
    'http_req_failed': ['rate<0.01'],           // < 1% błędów
    'checkout_errors': ['rate<0.001'],          // < 0.1% błędów checkout
    
    // Przepustowość
    'http_reqs': ['rate>50'],                   // Co najmniej 50 RPS
  },
};
```

---

## Integracja k6 z CI/CD

### GitHub Actions z alertami

```yaml
# .github/workflows/performance.yml
name: Performance Tests

on:
  schedule:
    - cron: '0 6 * * *'  # Codziennie o 6:00 rano

jobs:
  k6-load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install k6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /tmp/k6-keyring.gpg --keyserver hkp://keyserver.ubuntu.com --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          sudo gpg --no-default-keyring --keyring /tmp/k6-keyring.gpg --export C5AD17C747E3415A3642D57D77C6C491D6AC1D69 | sudo tee /etc/apt/trusted.gpg.d/k6.gpg > /dev/null
          echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update && sudo apt-get install k6

      - name: Run load test
        env:
          K6_CLOUD_TOKEN: ${{ secrets.K6_CLOUD_TOKEN }}
        run: |
          k6 run \
            --out cloud \
            --summary-export=results.json \
            scenarios/smoke-test.js

      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: k6-results-${{ github.run_id }}
          path: results.json

      - name: Alert on degradation
        if: failure()
        run: |
          echo "⚠️ Performance test failed! Check results at https://app.k6.io"
          echo "Common issues:"
          echo "  - p95 > 1000ms: API response time degraded"
          echo "  - Error rate > 1%: Backend instability"
          echo "  - RPS dropped: System can't handle load"
```

---

## Łączenie Playwright (E2E) z k6 (Performance) w pipeline

### Komplementarność narzędzi

| Aspekt | Playwright | k6 |
|---|---|---|
| Cel | Czy system ROBI to, co powinien? | Czy system JEST wystarczająco szybki? |
| Metoda | Symulacja użytkownika przez prawdziwą przeglądarkę | Symulacja ruchu HTTP |
| Prędkość | Wolne (sekundy na test) | Bardzo szybkie (tysiące RPS) |
| Pokrycie | UI, rendering, JavaScript | Backend API, przepustowość |
| Kiedy uruchamiać | Każdy commit (smoke) | Dla krytycznych ścieżek (daily/weekly) |

### Kompletny pipeline

```yaml
# .github/workflows/qa.yml
jobs:
  # 1. Szybkie testy funkcjonalne — Playwright smoke (2-5 min)
  e2e-smoke:
    runs-on: ubuntu-latest
    steps: [run playwright --grep "@smoke"]
    
  # 2. Testy regresji — Playwright full suite (30-60 min)
  e2e-regression:
    runs-on: ubuntu-latest
    needs: e2e-smoke
    steps: [run playwright --project=chromium]
    
  # 3. Testy wydajności — k6 smoke (5 min, codziennie)
  performance-smoke:
    runs-on: ubuntu-latest
    needs: e2e-regression
    steps: [run k6 run scenarios/smoke-test.js]
    
  # 4. Testy obciążeniowe — k6 full (30 min, tygodniowo)
  performance-load:
    runs-on: ubuntu-latest
    schedule: ['0 6 * * 1']  # Co poniedziałek
    steps: [run k6 run scenarios/full-load-test.js]
```

---

## Perspektywa Full Stack Testera — jakość = funkcjonalność + wydajność

System, który działa idealnie, ale ładuje się 10 sekund, jest bezużyteczny. System, który ładuje się w 100ms, ale daje błędne dane, też jest bezużyteczny.

Jako Full Stack Tester z perspektywą wydajnościową:
- Rozumiesz, że "średnia" latency jest Myląca — zawsze patrz na p95/p99.
- Wiesz, że breakpoint (punkt przełamania) jest ważniejszy niż spełnienie SLA przy niskim obciążeniu.
- Potrafisz interpretować metryki w kontekście doświadczenia użytkownika (nie abstrakcyjnych liczb).
- Integrujesz testy wydajności w CI, aby wykrywać regresje zanim trafią na produkcję.

Umiejętność łączenia Playwright (funkcjonalność) z k6 (wydajność) czyni Cię pełnoprawnym inżynierem QA — nie tylko "testerem klikającym".

---

## Podsumowanie

1. **Rodzaje testów**: Load (oczekiwane obciążenie), Stress (punkt przełamania), Soak (długotrwałe), Spike (nagły skok).
2. **k6**: Lekkie narzędzie do symulacji tysięcy VUs z jednego laptopa.
3. **Skrypty k6**: Symulacja realistic user flows z własnymi metrykami (Trend, Rate).
4. **Metryki**: p95/p99 (kluczowe), avg (mylące), RPS, error rate.
5. **Budżety wydajnościowe**: Progi jakościowe w konfiguracji k6.
6. **Integracja CI/CD**: Codzienne smoke + tygodniowe load w pipeline.

---

## Linki i źródła

- [k6 Documentation](https://k6.io/docs/)
- [k6 Load Testing Best Practices](https://k6.io/docs/testing-guides/load-testing)
- [k6 Cloud — Results Visualization](https://k6.io/docs/cloud/analyzing-results/)
- [Performance Testing vs. Load Testing vs. Stress Testing](https://www.blazemeter.com/blog/performance-testing-vs-load-testing-vs-stress-testing)
- [k6 Thresholds Guide](https://k6.io/docs/testing-guides/load-testing#:~:text=Thresholds)

## 📘 Suplement Inżynieryjny 2026: Testowanie Wydajności z k6 i JMeter
*Inspiracja: „Scalable Test Automation with Playwright” (2026), Chapter 11*
*   **Performance Budgets**: Integruj testy wydajnościowe k6 z rurociągami CI, definiując precyzyjne budżety wydajności (np. 95% żądań musi odpowiedzieć w czasie poniżej 200 ms). Zapobiegnie to stopniowej degradacji szybkości systemu.
