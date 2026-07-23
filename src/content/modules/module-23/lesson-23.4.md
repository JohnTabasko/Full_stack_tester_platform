# SLO, SLA, SLI i Testowanie Odporności — Mierzalna Jakość i Niezawodność

> **Perspektywa Full Stack Testera**
> „System ma działać" to niecel. Jaki procent żądań? W jakim czasie? Jak często może nie działać? Bez konkretnych liczb zespół albo ignoruje realne problemy (bo „nie wiedzieliśmy, że to ważne"), albo reaguje na każdy drobny incydent z taką samą intensywnością (alert fatigue). SLO (Service Level Objective) zamienia jakość w mierzalny cel. Budżet błędów pozwala podejmować świadome decyzje: przyspieszyć rozwój czy najpierw ustabilizować? W tej lekcji zdobędziesz umiejętności definiowania SLI/SLO/SLA, monitorowania budżetu błędów i projektowania testów odporności (resilience testing), które weryfikują zachowanie systemu przy awariach zależności.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Definiować** SLI (Service Level Indicator) na podstawie用户体验
- **Ustalać** realistyczne SLO (Service Level Objective) z budżetem błędów
- **Rozumieć** różnicę między SLO a SLA i konsekwencje każdego
- **Monitorować** budżet błędów i alertować przy jego wyczerpaniu
- **Projektować** testy odporności (resilience tests) dla scenariuszy awaryjnych
- **Testować** circuit breakers, retry logic i graceful degradation

---

## Wprowadzenie — jakość ma wymiar biznesowy

SLO bez budżetu błędów to cel bez kontekstu. Zespół może powiedzieć: „dostępność 99.9%" — brzmi dobrze. Ale co to oznacza w praktyce?

**99.9% dostępności miesięcznie:**
- ~43 minuty downtime miesięcznie
- ~8.6 godziny downtime rocznie

Jeśli checkout jest krytyczny dla przychodu (średnio 1000 PLN/minutę przy konwersji), te 43 minuty to ~43,000 PLN potencjalnej utraty. Ale jeśli budżet błędów to 0.1% miesięcznie, a realnie masz 99.95% (2x lepiej niż SLO) — nie ma powodu do alarmu. Możesz przyspieszyć rozwój.

SLO i budżet błędów zamieniają dyskusje jakościowe w decyzje ilościowe.

---

## Sytuacja przewodnia — budżet błędów checkoutu

Checkout ma być dostępny dla 99.9% żądań miesięcznie. Testy i monitoring muszą pokazywać, kiedy budżet błędów jest zagrożony.

Obecny stan:
- 30-dniowy error rate: 0.05% (lepiej niż SLO — luz w budżecie)
- Ostatnie 7 dni: 0.08% (trend wzrostowy — zbliżamy się do granicy!)
-Alert: 50% budżetu spalone w 24h

Pytanie: czy można przyspieszyć wdrożenie nowej funkcji, czy najpierw trzeba ustabilizować system?

---

## 1. SLI — co mierzymy?

### 1.1 Definicja SLI

**SLI (Service Level Indicator)** to konkretna metryka mierzona w czasie, która odpowiada na pytanie „czy usługa działa dla użytkownika?"

| SLI | Formuła | Cel |
|-----|---------|-----|
| **Availability** | (successful requests / total requests) × 100 | 99.9% |
| **Latency** | p95 response time | < 500ms |
| **Error Rate** | (5xx requests / total requests) × 100 | < 0.1% |
| **Throughput** | requests per second | > 1000 rps |
| **Durability** | (successful writes / total writes) × 100 | 99.999% |

### 1.2 SLI dla checkoutu

```promql
# Availability — procent udanych żądań
(
  sum(rate(http_requests_total{service="checkout-api", status=~"2.."}[30d]))
  /
  sum(rate(http_requests_total{service="checkout-api"}[30d]))
) * 100

# Latency — P95
histogram_quantile(0.95,
  sum(rate(http_request_duration_seconds_bucket{service="checkout-api"}[30d])) by (le)
)

# Error Rate — tylko 5xx
(
  sum(rate(http_requests_total{service="checkout-api", status=~"5.."}[30d]))
  /
  sum(rate(http_requests_total{service="checkout-api"}[30d]))
) * 100

# Error Budget Burn Rate (ilu razy szybciej niż cel)
(
  sum(rate(http_requests_total{service="checkout-api", status=~"5.."}[1h]))
  /
  sum(rate(http_requests_total{service="checkout-api"}[1h]))
) 
/
0.001  # SLO target (0.1%)
```

### 1.3 Weryfikacja SLI w testach Playwright

```typescript
// tests/e2e/checkout-slo-verification.spec.ts
import { test, expect, request as apiRequest } from '@playwright/test';

test.describe('Checkout SLO Verification', () => {
  
  test('checkout endpoint availability within SLO', async ({ request }) => {
    const samples = 100;
    let successes = 0;
    let failures = 0;
    
    for (let i = 0; i < samples; i++) {
      const response = await request.post('/api/checkout/finalize', {
        data: { orderId: 1000 + i, paymentMethod: 'CARD' },
        headers: { 'Authorization': `Bearer ${process.env.API_TOKEN}` },
      });
      
      if (response.status() >= 200 && response.status() < 300) {
        successes++;
      } else if (response.status() >= 500) {
        failures++;  // Tylko 5xx są naruszeniem SLO
      }
      // 4xx to kontrolowany błąd, nie narusza SLO availability
    }
    
    const availability = (successes / samples) * 100;
    console.log(`Checkout availability: ${availability.toFixed(2)}%`);
    
    // SLO: 99.9% availability
    expect(availability).toBeGreaterThan(99.5);  // Tolerancja dla testu
  });
  
  test('checkout latency within SLO', async ({ request }) => {
    const samples = 50;
    const latencies: number[] = [];
    
    for (let i = 0; i < samples; i++) {
      const start = Date.now();
      await request.post('/api/checkout/finalize', {
        data: { orderId: 2000 + i, paymentMethod: 'CARD' },
      });
      latencies.push(Date.now() - start);
    }
    
    // Sortuj i znajdź P95
    latencies.sort((a, b) => a - b);
    const p95Index = Math.floor(samples * 0.95);
    const p95Latency = latencies[p95Index];
    
    console.log(`Checkout P95 latency: ${p95Latency}ms`);
    
    // SLO: P95 < 500ms
    expect(p95Latency).toBeLessThan(500);
  });
});
```

---

## 2. SLO — cel jakościowy

### 2.1 Jak ustalać SLO?

**Zasady:**
1. Opieraj na realnym用户体验 — nie na tym, co łatwo zmierzyć
2. Bądź ambitny, ale realistyczny — za niski cel = brak motywacji
3. Dokumentuj założenia — kiedy SLO jest spełnione?
4. Review regularnie — SLO evolves with business

**Proces:**
1. Zbierz dane historyczne (last 30/60/90 days)
2. Oblicz obecny poziom (baseline)
3. Usuń planowane downtime (maintenance windows)
4. Dodaj margines bezpieczeństwa (10-20%)
5. Ustal cel i dokumentuj reasoning

### 2.2 Przykład SLO dla checkoutu

```yaml
# checkout-slo.yaml
service: checkout-api
owner: platform-team

sli:
  availability:
    description: "Procent udanych żądań checkout"
    query: |
      sum(rate(http_requests_total{service="checkout-api", status=~"2.."}[30d]))
      /
      sum(rate(http_requests_total{service="checkout-api"}[30d]))
    good: "> 99.9%"
    
  latency:
    description: "P95 latencja żądań checkout"
    query: |
      histogram_quantile(0.95,
        sum(rate(http_request_duration_seconds_bucket{service="checkout-api"}[30d])) by (le)
      )
    good: "< 500ms"
    
  error_rate:
    description: "Odsetek błędów 5xx"
    query: |
      sum(rate(http_requests_total{service="checkout-api", status=~"5.."}[30d]))
      /
      sum(rate(http_requests_total{service="checkout-api"}[30d]))
    good: "< 0.1%"

slo:
  availability: 99.9  # Miesięcznie
  latency: 99.0       # 99% żądań poniżej 500ms
  error_rate: 99.9    # Miesięcznie

error_budget:
  availability: 43.8 minutes/month  # 0.1% * 43,200 min
  latency: 21.9 minutes/month       # 0.1% * 43,200 min
  error_rate: 43.8 minutes/month    # 0.1% * 43,200 min

alerts:
  budget_50_percent:
    description: "50% budżetu błędów spalone w 24h"
    condition: "burn_rate > 14.4"  # 50% / 24h vs 30d target
    action: "notify-slack"
    
  budget_100_percent:
    description: "100% budżetu błędów spalone"
    condition: "burn_rate > 14.4 AND budget_remaining < 0"
    action: "page-team"
```

### 2.3 Dashboard SLO w Grafana

```yaml
# grafana-slo-dashboard.json
{
  "title": "Checkout SLO Dashboard",
  "panels": [
    {
      "title": "SLO Status — Availability",
      "type": "gauge",
      "targets": [
        {
          "expr": "(\n  sum(rate(http_requests_total{service=\"checkout-api\", status=~\"2..\"}[30d]))\n  /\n  sum(rate(http_requests_total{service=\"checkout-api\"}[30d]))\n) * 100",
          "legendFormat": "Availability %"
        }
      ],
      "fieldConfig": {
        "defaults": {
          "min": 99,
          "max": 100,
          "thresholds": {
            "steps": [
              { "value": 99, "color": "red", "name": "Below SLO" },
              { "value": 99.9, "color": "yellow", "name": "Warning" },
              { "value": 99.95, "color": "green", "name": "Healthy" }
            ]
          },
          "unit": "percent"
        }
      }
    },
    {
      "title": "Error Budget Remaining",
      "type": "stat",
      "targets": [
        {
          "expr": "100 - (\n  (\n    sum(rate(http_requests_total{service=\"checkout-api\", status=~\"5..\"}[30d]))\n    /\n    sum(rate(http_requests_total{service=\"checkout-api\"}[30d]))\n  ) * 100\n  /\n  0.1 * 100\n) * 100",
          "legendFormat": "Budget Remaining %"
        }
      ],
      "options": {
        "colorMode": "value",
        "graphMode": "none"
      }
    },
    {
      "title": "Budget Burn Rate — 24h vs 30d target",
      "type": "timeseries",
      "targets": [
        {
          "expr": "(\n  sum(rate(http_requests_total{service=\"checkout-api\", status=~\"5..\"}[1h]))\n  /\n  sum(rate(http_requests_total{service=\"checkout-api\"}[1h]))\n) / 0.001",
          "legendFormat": "Burn rate (1h vs 30d target)"
        }
      ],
      "fieldConfig": {
        "defaults": {
          "thresholds": {
            "steps": [
              { "value": 0, "color": "green" },
              { "value": 1, "color": "yellow" },
              { "value": 14.4, "color": "orange" },
              { "value": 50, "color": "red" }
            ]
          }
        }
      }
    }
  ]
}
```

---

## 3. SLA — zobowiązanie wobec klienta

### 3.1 SLO vs SLA

| Aspekt | SLO | SLA |
|--------|-----|-----|
| **Adresat** | Wewnętrzne (zespół) | Zewnętrzne (klient) |
| **Konsekwencje** | Operacyjne | Biznesowe/prawne |
| **Elastyczność** | Wysoka | Niska |
| **Dokumentacja** | Notatki, runbook | Kontrakt |
| **Przykład** | 99.9% availability | „Jeśli < 99.5%, zwracamy 10% opłaty" |

### 3.2 Przykład SLA dla enterprise klienta

```markdown
# SLA — Enterprise Checkout Integration

## Gwarantowana Dostępność
- **Target:** 99.5% miesięcznie
- **Measurement:** Successful checkout completions / Total checkout attempts
- **Exclusions:** Planned maintenance (up to 4h/month, notified 48h in advance)

## Rekompensaty
| Availability | Compensation |
|--------------|-------------|
| 99.0% - 99.5% | 5% credit on monthly fee |
| 95.0% - 99.0% | 15% credit |
| < 95.0% | 30% credit + incident review |

## Monitoring
Both parties have access to real-time SLO dashboard at:
https://dashboard.example.com/slo/checkout-enterprise
```

---

## 4. Budżet błędów — decyzje na podstawie liczb

### 4.1 Obliczanie budżetu błędów

```typescript
// Oblicz ile „czasu błędów" masz w budżecie
function calculateErrorBudget(sloTarget: number, periodDays: number): number {
  const minutesInPeriod = periodDays * 24 * 60;
  const errorBudgetPercent = 100 - sloTarget;  // 100 - 99.9 = 0.1%
  const errorBudgetMinutes = minutesInPeriod * (errorBudgetPercent / 100);
  
  return errorBudgetMinutes;
}

// Dla 99.9% przez 30 dni:
const budget = calculateErrorBudget(99.9, 30);
console.log(`Budget: ${budget.toFixed(1)} minutes`);  // 43.8 minutes

// Dla 99.99% przez 30 dni:
const budget2 = calculateErrorBudget(99.99, 30);
console.log(`Budget: ${budget2.toFixed(1)} minutes`);  // 4.38 minutes
```

### 4.2 Burn rate — ile szybko spalasz budżet?

```promql
# Burn rate = (obecny error rate) / (target error rate)
# > 1.0 = spalasz szybciej niż plan
# > 14.4 (dla 30d) = 50% budżetu w 24h

# Burn rate dla checkout (1h window vs 30d target)
(
  sum(rate(http_requests_total{service="checkout-api", status=~"5.."}[1h]))
  /
  sum(rate(http_requests_total{service="checkout-api"}[1h]))
)
/
0.001  # target: 0.1% errors = 0.001
```

### 4.3 Dashboard burn rate

```yaml
# Alert: 50% budżetu w 24h
# Warunek: burn_rate > 14.4 przez 1h
# 14.4 = (50% / 24h) * 30d = 0.5 / 24 * 30 = 0.625... 
# Upraszczając: jeśli error rate jest 14.4x wyższy niż cel, 
# spalisz 50% budżetu w 24h

# Alert: 100% budżetu wyczerpane
# Warunek: budget_remaining <= 0 przez 1h
100 - (
  sum(rate(http_requests_total{service="checkout-api", status=~"5.."}[30d]))
  /
  sum(rate(http_requests_total{service="checkout-api"}[30d]))
) / 0.001 * 100
```

### 4.4 Decision framework

```
Czy budżet błędów > 50%?
  ├─ TAK → Można przyspieszyć rozwój. SLO jest zdrowe.
  │
  └─ NIE → Stabilizuj system. SLO jest zagrożone.
  
Czy budżet błędów < 10%?
  ├─ TAK → Wstrzymaj nowe funkcje. Focus na reliability.
  │
  └─ NIE → Monitoruj trend. Alert przy 5% remaining.
```

---

## 5. Testowanie odporności (Resilience Testing)

### 5.1 Co to jest resilience testing?

Testowanie zachowania systemu przy:
- **Awarii zależności** — usługa X nie odpowiada
- **Opóźnieniu zależności** — usługa X odpowiada 10x wolniej
- **Przeciążeniu** — ruch 10x większy niż normalnie
- **Częściowej niedostępności** — tylko część instancji działa

### 5.2 Narzędzia chaos engineering

```bash
# Chaos Monkey (Netflix) — losowe wyłączanie instancji
# Gremlin — kontrolowane ataki na zasoby
# Toxiproxy — symulacja wolnych/zepsutych zależności
# Istio/Linkerd — fault injection w service mesh

# Toxiproxy — symulacja wolnego dostawcy płatności
docker run -d --name toxiproxy -p 8474:8474 shopify/toxiproxy

# Dodaj proxy dla Stripe
./toxiproxy-cli create --listen 127.0.0.1:9000 --upstream api.stripe.com

# Symuluj timeout (1000ms latency)
./toxiproxy-cli toxic add payment-proxy --type latency --attribute latency=1000
```

### 5.3 Test odporności w Playwright z Toxiproxy

```typescript
// tests/resilience/payment-resilience.spec.ts
import { test, expect, request as apiRequest } from '@playwright/test';

test.describe('Resilience — Payment Provider Failures', () => {
  
  test.beforeAll(async () => {
    // Start Toxiproxy container
    // Skonfiguruj proxy dla payment providera
  });
  
  test('checkout completes despite payment provider timeout', async ({ page }) => {
    // Symuluj timeout payment providera (2s zamiast 200ms)
    await setupToxiproxyToxic('payment-proxy', {
      type: 'latency',
      latency: 2000,
    });
    
    try {
      await page.goto('/checkout');
      await page.fill('#card-number', '4242424242424242');
      await page.click('#pay-button');
      
      // Oczekuj: checkout kończy się błędem użytkownika (nie crash!)
      await expect(page.locator('.error-message')).toBeVisible({ timeout: 10000 });
      
      // Ale strona NIE pada — graceful degradation
      await expect(page.locator('body')).toBeVisible();
      
    } finally {
      // Usuń toxic — przywróć normalność
      await removeToxiproxyToxic('payment-proxy');
    }
  });
  
  test('checkout retries on transient payment error', async ({ page }) => {
    // Symuluj jeden timeout, potem sukces (2 próby)
    let attempts = 0;
    
    await setupDynamicToxic('payment-proxy', async () => {
      attempts++;
      if (attempts === 1) {
        return { type: 'latency', latency: 5000 };  // Timeout
      } else {
        return null;  // Normal
      }
    });
    
    await page.goto('/checkout');
    await page.fill('#card-number', '4242424242424242');
    await page.click('#pay-button');
    
    // System powinien się zretryować i最终 przejść
    // (lub dać jasny komunikat po maksymalnych próbach)
    await expect(
      page.locator('.success-message, .error-message')
    ).toBeVisible({ timeout: 30000 });
  });
  
  test('circuit breaker opens after repeated failures', async ({ request }) => {
    // Symuluj 5 kolejnych błędów payment providera
    let callCount = 0;
    
    for (let i = 0; i < 5; i++) {
      const response = await request.post('/api/checkout/finalize', {
        data: { orderId: 5000 + i, paymentMethod: 'CARD' },
        headers: {
          'X-Simulate-Payment-Error': 'true',
          'X-Error-Type': 'timeout',
        },
      });
      
      callCount++;
      
      // Po kilku błędach circuit breaker powinien się otworzyć
      // i szybko zwracać 503 bez próby wywołania payment providera
      if (callCount >= 3) {
        // Circuit breaker może już być otwarty
        // Szybka odpowiedź bez timeout (cecha circuit breaker)
        const responseTime = Date.now();  // measure
        expect(responseTime).toBeLessThan(500);  // Szybka, nie timeout!
      }
    }
    
    // Sprawdź metryki circuit breakera
    const cbMetrics = await request.get(`${process.env.PROMETHEUS_URL}/api/v1/query`, {
      params: {
        query: 'circuit_breaker_state{service="payment-provider"}',
      },
    });
    
    const data = await cbMetrics.json();
    const state = data.data.result[0]?.value[1];
    
    // Stan OPEN oznacza, że circuit breaker działa
    expect(['OPEN', 'HALF_OPEN']).toContain(state);
  });
});
```

### 5.4 Test graceful degradation

```typescript
test('checkout shows cached content when products API is down', async ({ page }) => {
  // Symuluj awarię products API
  await setupToxiproxyToxic('products-proxy', {
    type: 'timeout',
  });
  
  try {
    await page.goto('/checkout');
    
    // Oczekuj: strona ładuje się (nie crash!)
    await expect(page.locator('header')).toBeVisible();
    
    // Sekcja produktów może nie być dostępna — graceful degradation
    const productsSection = page.locator('.products-section');
    if (await productsSection.isVisible()) {
      // Jeśli widoczna — sprawdź czy to cache
      const cachedIndicator = page.locator('[data-testid="cached-data"]');
      if (await cachedIndicator.isVisible()) {
        console.log('Products loaded from cache (graceful degradation)');
      }
    } else {
      console.log('Products section hidden — graceful degradation');
    }
    
    // Cena może być stara (cache), ale strona działa
    await expect(page.locator('.cart-total')).toBeVisible();
    
  } finally {
    await removeToxiproxyToxic('products-proxy');
  }
});
```

### 5.5 Chaos experiments — integracja z CI

```yaml
# .github/workflows/chaos-experiments.yml
name: Resilience Tests

on:
  schedule:
    # Uruchamiaj raz dziennie w weekendy (mniej ruchu)
    - cron: '0 3 * * 6,0'
  workflow_dispatch:

jobs:
  chaos:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Start Toxiproxy
        run: docker run -d --name toxiproxy -p 8474:8474 shopify/toxiproxy
        
      - name: Run resilience tests
        run: npx playwright test tests/resilience --reporter=json
        
      - name: Cleanup
        if: always()
        run: docker stop toxiproxy || true
```

---

## 6. Lista kontrolna SLO i resilience

| Element | Status | Uwagi |
|---------|--------|-------|
| SLI są mierzalne i powiązane z用户体验 | ☐ | |
| SLO są ambitne, ale realistyczne | ☐ | |
| SLA rozróżnia się od SLO | ☐ | |
| Budżet błędów jest monitorowany | ☐ | |
| Alerty mają jasne progi i właścicieli | ☐ | |
| Resilience tests pokrywają główne scenariusze awaryjne | ☐ | |
| Circuit breakers są testowane | ☐ | |
| Graceful degradation jest weryfikowana | ☐ | |

---

## Perspektywa Full Stack Testera

SLO i budżet błędów to nie tylko dla DevOps. Jako Full Stack Tester powinieneś:

- **Rozumieć cele jakościowe** — wiesz, co jest akceptowalne, a co nie
- **Weryfikować SLO w testach** — testy E2E mogą mierzyć SLI!
- **Znać budżet błędów** — decyzja „stabilizować czy rozwijać" zależy od tych liczb
- **Pisać resilience tests** — system powinien działać nawet gdy zależności padają

Pamiętaj: test, który weryfikuje SLO, ma większą wartość niż test, który tylko sprawdza funkcjonalność. Funcjonalność to podstawa — niezawodność to cecha, która wyróżnia profesjonalny system.

---

## Podsumowanie

- **SLI** (Service Level Indicator) — konkretna metryka (availability, latency, error rate)
- **SLO** (Service Level Objective) — cel jakościowy, np. 99.9% availability
- **SLA** (Service Level Agreement) — zobowiązanie wobec klienta z konsekwencjami
- **Error Budget** — ile „błędów" możesz sobie pozwolić w danym okresie
- **Burn Rate** — ile szybko spalasz budżet błędów (monitoruj w Grafanie!)
- **Resilience Testing** — testowanie zachowania przy awariach zależności
- **Chaos Engineering** — kontrolowane wprowadzanie awarii w testach

---

## Linki i Źródła

- **[SRE Book — Chapter 5: Eliminating Toil](https://sre.google/sre-book/eliminating-toil/)** — SLI/SLO w praktyce Site Reliability Engineering
- **[Google SRE — SLI/SLO Workbook](https://cloud.google.com/blog/products/operations/defining-slos-that-work-for-you-and-your-users)** — praktyczny przewodnik definiowania SLO
- **[Error Budget Policy — Spotify Engineering](https://engineering.atspotify.com/)** — jak Spotify zarządza budżetem błędów
- **[Toxiproxy — Simulate Network Conditions](https://github.com/Shopify/toxiproxy)** — narzędzie do symulacji awarii sieciowych
- **[Resilience Testing — ThoughtWorks](https://www.thoughtworks.com/developer-tools)** — testowanie odporności w praktyce
- **[Circuit Breaker Pattern — Martin Fowler](https://martinfowler.com/articles/patterns-of-distributed-systems/)** — wzorzec circuit breaker
- **[Chaos Engineering — Principle](https://principlesofchaos.org/)** — zasady chaos engineering
---

## Error budget

Error budget wynika z SLO. Jeśli SLO mówi 99.9% dostępności, to 0.1% czasu lub żądań może być błędne. Error budget pomaga podejmować decyzje: czy zespół może wdrażać szybciej, czy powinien skupić się na stabilizacji.

Dla testera oznacza to, że pojedynczy błąd nie zawsze blokuje release, ale trend spalania error budgetu może blokować.

## SLI dobre i złe

Dobry SLI jest blisko doświadczenia użytkownika:

- odsetek udanych checkoutów;
- p95 czasu logowania;
- odsetek poprawnie przetworzonych webhooków;
- czas dostarczenia emaila aktywacyjnego.

Słaby SLI jest techniczny, ale nie mówi o użytkowniku, np. sam CPU bez kontekstu.

## Testowanie odporności

Odporność testuj przez kontrolowane eksperymenty:

- timeout zewnętrznego API;
- restart jednej repliki;
- opóźnienie kolejki;
- błąd bazy read replica;
- brak dostępu do cache.

Każdy eksperyment powinien mieć hipotezę i kryterium zakończenia. Nie rób chaos testingu bez zgody zespołu i obserwowalności.

## 📘 Suplement Inżynieryjny 2026: Obserwowalność i Diagnostyka Systemów
*Inspiracja: „Scalable Test Automation with Playwright” (2026), Chapter 10*
*   **Correlation IDs**: W testach E2E zawsze wstrzykuj unikalny identyfikator korelacji (Correlation ID) do nagłówków żądań HTTP. Umożliwi to pełne śledzenie rozproszone (Distributed Tracing) i powiązanie awarii w teście z konkretnymi logami i śladami na backendzie.
