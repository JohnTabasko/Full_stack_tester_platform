# Logi, Metryki i Ślady Wykonania — Trzy Filary Obserwowalności Systemów

> **Perspektywa Full Stack Testera**
> Nocna regresja płatności kończy się błędem. UI pokazuje: „Wystąpił błąd podczas przetwarzania płatności". To wszystko. Co teraz robi zespół? Frontend developer mówi „to backend". Backend developer mówi „to kolejka". DevOps mówi „to dostawca płatności". Tracą 3 godziny na meetings, zanim ktoś w końcu otworzy trace w Grafanie i zobaczy, że API dostawcy płatności odpowiadało 8 sekund zamiast 500ms. Obserwowalność — rozumne logi, metryki i trace — to narzędzie, które skraca tę drogę z godzin do minut. W tej lekcji zdobędziesz praktyczne umiejętności korzystania z sygnałów diagnostycznych, projektowania testów, które zostawiają ślad, i powiązania raportu testu z konkretnym żądaniem w systemie.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Rozumieć** trzy filary obserwowalności: logi, metryki, trace
- **Czytać** logi strukturalne i wykorzystywać correlation ID do śledzenia żądań
- **Interpretować** metryki w modelach RED i USE
- **Nawigować** ślady rozproszone w Grafanie/Jaeger
- **Projektować** testy E2E, które zostawiają identyfikatory diagnostyczne
- **Powiązywać** wynik testu z konkretnym śladem w systemie

---

## Wprowadzenie — dlaczego obserwowalność ma znaczenie dla testera

Wyobraź sobie dwa scenariusze:

**Bez obserwowalności:**
1. Test E2E pada na stronie checkout
2. Komunikat: „Płatność nie powiodła się"
3. Zespół nie wie, czy błąd jest w UI, API, bazie, kolejce czy zewnętrznym dostawcy
4. Godziny debugowania,多位 ludzie, wiele meetingów
5. Problem rozwiązany, ale nikt nie wie dokładnie dlaczego

**Z obserwowalnością:**
1. Test E2E pada, ale raport zawiera `correlationId = e2e-abc123`
2. Tester otwiera Grafanę, wpisuje correlation ID
3. Widzi trace: `UI → checkout-api → payment-queue → payment-provider (timeout 8s) → rollback`
4. W 5 minut wiadomo, że dostawca płatności miał timeout
5. Problem rozwiązany w 30 minut z pełnym zrozumieniem przyczyny

Różnica jest dramatyczna. Obserwowalność nie jest tylko dla DevOps — to narzędzie diagnostyczne testera.

---

## Sytuacja przewodnia — nocna regresja płatności

Nocna regresja E2E kończy się niepowodzeniem na kroku „finalizacja płatności". UI pokazuje ogólny komunikat błędu. Przyczyna może leżeć w:
- Frontend (niepoprawna obsługa odpowiedzi błędu)
- API checkout (błąd walidacji, timeout, błąd 500)
- Kolejka płatności (wiadomość nie doszła, przetwarzanie trwa)
- Baza danych (constraint violation, deadlock)
- Dostawca płatności (odmowa, timeout, błąd 3DS)

Twój zespół testów musi powiązać wynik testu z trace, żeby wiedzieć gdzie dokładnie szukać.

---

## 1. Trzy filary obserwowalności

### 1.1 Logi — „co się wydarzyło"

**Definicja:** Uporządkowany zapis zdarzeń w systemie z kontekstem (kto, co, kiedy, gdzie, dlaczego).

**Charakterystyki:**
- Szczegółowe — opisują konkretne zdarzenie
-punktowe — każdy wpis to jedno zdarzenie
- Dyskretne — log nie mówi nic o trendzie ani объеме

**Kiedy używać:** Debugowanie konkretnego błędu, analiza sekwencji zdarzeń, audit trail.

### 1.2 Metryki — „jak system się zachowuje"

**Definicja:** Wartości liczbowe mierzone w czasie — agregaty, średnie, percentyle.

**Charakterystyki:**
- Agregowane — nie widać pojedynczego żądania
- Ciągłe — mówią o trendzie, nie o pojedynczym zdarzeniu
- Kompaktowe — mało danych, dużo informacji

**Kiedy używać:** Monitorowanie zdrowia systemu, wykrywanie anomalii, SLO/SLA.

### 1.3 Trace — „jak żądanie podróżowało przez system"

**Definicja:** Rekonstrukcja drogi pojedynczego żądania przez wiele usług.

**Charakterystyki:**
- End-to-end — jedno żądanie, wiele usług
- Czasowa — widać opóźnienia w każdej usłudze
- Szczegółowa — każdy span to fragment pracy

**Kiedy używać:** Diagnozowanie latencji, znajdowanie bottlenecków, zrozumienie przepływu.

### 1.4 Wzajemne uzupełnianie

```
Test E2E pada
    │
    ├─→ METRYKI → „średnie opóźnienie checkout-api wzrosło 3x w ostatniej godzinie"
    │                    │
    │                    ▼
    │               „Gateway ma problem z dostawcą płatności?"
    │
    ├─→ LOGI → „checkout-api: timeout przy wywołaniu payment-provider"
    │              │
    │              ▼
    │         „Błąd: Connection timeout after 5000ms"
    │
    └─→ TRACE → „checkout-api (50ms) → payment-queue (10ms) → payment-provider (TIMEOUT 8000ms)"
                    │
                    ▼
               „Usługa payment-provider ma problem"
```

---

## 2. Logi strukturalne

### 2.1 Co to jest log strukturalny?

Tradycyjny log (tekst):
```
2024-06-23 10:30:15 ERROR [checkout-api] Payment failed for user 123, order 456
```

Log strukturalny (JSON):
```json
{
  "timestamp": "2024-06-23T10:30:15.123Z",
  "level": "ERROR",
  "service": "checkout-api",
  "correlationId": "req-abc123",
  "userId": 123,
  "orderId": 456,
  "error": {
    "code": "PAYMENT_TIMEOUT",
    "message": "Timeout calling payment provider after 5000ms",
    "provider": "stripe",
    "retryable": true
  },
  "context": {
    "endpoint": "/api/checkout/finalize",
    "method": "POST",
    "duration_ms": 5012
  }
}
```

### 2.2 Correlation ID — łączenie logów z żądaniem

**Co to jest:** Unikalny identyfikator przydzielony żądaniu, który przechodzi przez wszystkie usługi.

**Jak działa:**
```
Request (correlationId: abc123)
  → checkout-api (log z correlationId: abc123)
    → payment-queue (log z correlationId: abc123)
      → payment-provider (log z correlationId: abc123)
```

**Generowanie w Playwright:**

```typescript
test('płatność zostawia correlation ID w trace', async ({ page }, testInfo) => {
  // Generuj unikalny correlation ID dla tego testu
  const correlationId = `e2e-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  // Ustaw w nagłówkach całego kontekstu przeglądarki
  await page.context().setExtraHTTPHeaders({
    'X-Correlation-ID': correlationId,
    'X-Request-Source': 'playwright-e2e',
  });
  
  // Zapisz correlation ID jako artifact testowy
  await testInfo.attach('correlation-id.txt', {
    body: correlationId,
    contentType: 'text/plain',
  });
  
  // Dodaj do środowiska (dla późniejszego dostępu)
  process.env.TEST_CORRELATION_ID = correlationId;
  
  // Wykonaj test
  await page.goto('/checkout');
  await page.getByRole('button', { name: 'Zapłać' }).click();
  
  // Sprawdź czy UI pokazuje wynik
  await expect(page.getByRole('status')).toContainText(/opłacone|przyjęte|błąd/i, { timeout: 10000 });
});

test.afterEach(async ({}, testInfo) => {
  // Po teście — wgraj correlation ID do raportu
  if (process.env.TEST_CORRELATION_ID) {
    await testInfo.attach('system-trace-url.txt', {
      body: `https://grafana.example.com/explore?left=["eyJ..."]&query=${process.env.TEST_CORRELATION_ID}`,
      contentType: 'text/plain',
    });
  }
});
```

### 2.3Czytanie logów w praktyce

```bash
# Szukaj logów po correlation ID
grep "abc123" /var/log/checkout-api.log | jq '.'

# Szukaj błędów w danym czasie
jq 'select(.level == "ERROR" and .timestamp > "2024-06-23T10:00:00")' /var/log/checkout-api.log

# Agregacja błędów po typie
jq -r 'select(.level == "ERROR") | .error.code' /var/log/checkout-api.log | sort | uniq -c | sort -rn
```

### 2.4 Logowanie w testach API

```typescript
// tests/utils/logger.ts
export async function withLogging<T>(
  operation: string,
  fn: () => Promise<T>,
  context: Record<string, any>
): Promise<T> {
  const startTime = Date.now();
  const correlationId = context.correlationId || crypto.randomUUID();
  
  console.log(JSON.stringify({
    event: 'test_operation_start',
    operation,
    correlationId,
    timestamp: new Date().toISOString(),
    ...context,
  }));
  
  try {
    const result = await fn();
    
    console.log(JSON.stringify({
      event: 'test_operation_success',
      operation,
      correlationId,
      duration_ms: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      ...context,
    }));
    
    return result;
  } catch (error) {
    console.log(JSON.stringify({
      event: 'test_operation_failure',
      operation,
      correlationId,
      duration_ms: Date.now() - startTime,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
      } : String(error),
      timestamp: new Date().toISOString(),
      ...context,
    }));
    
    throw error;
  }
}

// Użycie w teście
const order = await withLogging(
  'create_test_order',
  () => api.createOrder({ productId: 42, quantity: 1 }),
  { testName: 'checkout-flow', userId: 123 }
);
```

---

## 3. Metryki — modele RED i USE

### 3.1 Model RED — dla usług (latarnia wysokiego poziomu)

**Rate** — ile żądań na sekundę
**Errors** — ile błędów na sekundę  
**Duration** — czas odpowiedzi (percentyle)

```typescript
// Przykładowe metryki w Prometheus
const checkoutApiMetrics = {
  // Rate: żądania na sekundę
  http_requests_total: counter({
    labels: ['method', 'endpoint', 'status'],
  }),
  
  // Errors: błędy na sekundę (status >= 500)
  http_errors_total: counter({
    labels: ['method', 'endpoint', 'error_code'],
  }),
  
  // Duration: histogram czasów odpowiedzi
  http_request_duration_seconds: histogram({
    labels: ['method', 'endpoint'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  }),
};

// Instrumentacja w Express
app.use((req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const [s, ns] = process.hrtime(start);
    const duration = s + ns / 1e9;
    
    http_requests_total.labels(req.method, req.route?.path || req.path, res.statusCode).inc();
    
    if (res.statusCode >= 500) {
      http_errors_total.labels(req.method, req.route?.path || req.path, '5xx').inc();
    }
    
    http_request_duration_seconds.labels(req.method, req.route?.path || req.path).observe(duration);
  });
  
  next();
});
```

### 3.2 Model USE — dla zasobów (infrastruktura)

**Utilization** — ile % zasobu jest wykorzystane
**Saturation** — ile kolejki/bufora jest zapełnione
**Errors** — błędy zasobu

```yaml
# Prometheus queries dla infrastruktury
# CPU Utilization
100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory Saturation  
node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes < 0.1

# Disk I/O Saturation
rate(node_disk_io_time_seconds_total[5m]) > 0.8

# Network Saturation
rate(node_network_receive_bytes_total[5m]) > 0.9 * interface_speed
```

### 3.3 Interpretacja metryk w testowaniu

```typescript
// test sprawdzający czy metryki mieszczą się w normie po teście
test('checkout API response time within SLO after payment test', async ({ request }) => {
  // Wykonaj test
  const response = await request.post('/api/checkout/finalize', {
    data: { orderId: 123, paymentMethod: 'CARD' },
    headers: { 'Authorization': `Bearer ${process.env.API_TOKEN}` },
  });
  
  expect(response.status()).toBeGreaterThanOrEqual(200);
  expect(response.status()).toBeLessThan(300);
  
  // Sprawdź metryki w Prometheus
  const metricsResponse = await request.get(`${process.env.PROMETHEUS_URL}/api/v1/query`, {
    params: {
      query: 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{endpoint="/api/checkout/finalize"}[5m]))',
    },
  });
  
  const result = await metricsResponse.json();
  const p95Latency = parseFloat(result.data.result[0].value[1]);
  
  // SLO: p95 < 500ms
  expect(p95Latency).toBeLessThan(0.5);  // 500ms w sekundach
});
```

---

## 4. Ślady rozproszone (Distributed Tracing)

### 4.1 Co to jest trace?

Trace to zapis całej podróży pojedynczego żądania przez wszystkie usługi. Każdy „krok" w podróży to span.

```
Trace: req-abc123 (całkowity czas: 1200ms)
├── Span: frontend (0-50ms)
│   └── Render checkout page
├── Span: checkout-api (50-400ms)
│   ├── DB: find user (50-80ms)
│   ├── Queue: send payment message (80-100ms)
│   └── Response to frontend (350-400ms)
├── Span: payment-queue (100-150ms)
│   └── Process message
├── Span: payment-service (150-1100ms)
│   ├── Validate (150-180ms)
│   ├── Provider: call Stripe (180-950ms) ← TUTAJ JEST SLOW!
│   └── Update DB (950-1100ms)
└── Span: notification-service (1100-1200ms)
    └── Send confirmation email
```

### 4.2 OpenTelemetry — standard śledzenia

```typescript
// Instrumentacja OpenTelemetry w Node.js
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'checkout-api',
    [SemanticResourceAttributes.SERVICE_VERSION]: '2.1.0',
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  }),
});

sdk.start();

// Automatic instrumentation for HTTP, Express, etc.
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdkWithAuto = new NodeSDK({
  ...autoInstrumentations: getNodeAutoInstrumentations({
    '@opentelemetry/instrumentation-http': {
      ignoreIncomingPaths: ['/health', '/metrics'],
    },
  }),
});
```

### 4.3 Propagation correlation ID w trace

```typescript
// Middleware przekazujący correlation ID przez usługi
import { trace, context } from '@opentelemetry/api';

app.use((req, res, next) => {
  const incomingCorrelationId = req.headers['x-correlation-id'] as string;
  const correlationId = incomingCorrelationId || crypto.randomUUID();
  
  // Ustaw jako atrybut spanu
  const currentSpan = trace.getActiveSpan();
  if (currentSpan) {
    currentSpan.setAttribute('correlation.id', correlationId);
    currentSpan.setAttribute('http.request_id', correlationId);
  }
  
  // Przekaż do odpowiedzi
  res.setHeader('X-Correlation-ID', correlationId);
  
  // Przekaż do kolejki/komunikacji z innymi usługami
  req.correlationId = correlationId;
  
  next();
});
```

### 4.4 Przykładowy trace w Jaeger/Grafana

```bash
# Szukaj trace po correlation ID
curl -G "http://jaeger:14268/api/traces" \
  --data-urlencode "service=checkout-api" \
  --data-urlencode "tags={\"correlation.id\":\"abc123\"}"
```

```typescript
// Test powiązujący wynik z trace
test('trace accessible from test failure', async ({ page }, testInfo) => {
  const correlationId = `e2e-${Date.now()}`;
  await page.context().setExtraHTTPHeaders({ 'X-Correlation-ID': correlationId });
  
  try {
    await page.goto('/checkout');
    await page.getByRole('button', { name: 'Zapłać' }).click();
    
    // Oczekuj sukcesu
    await expect(page.getByText('Płatność zakończona')).toBeVisible({ timeout: 15000 });
    
  } catch (error) {
    // Jeśli test padnie — wygeneruj link do trace
    const grafanaTraceUrl = `https://grafana.example.com/explore?left={"queries":[{"refId":"A","expr":"correlation_id=\\"${correlationId}\\"","datasource":"tempo"}]}`;
    
    await testInfo.attach('trace-link.txt', {
      body: grafanaTraceUrl,
      contentType: 'text/plain',
    });
    
    throw error;  // Przekaż błąd dalej
  }
});
```

---

## 5. Obserwowalność w testach Playwright

### 5.1 Helper walidujący metryki po teście

```typescript
// tests/helpers/metrics-helper.ts
export async function validateServiceHealth(
  request: APIRequestContext,
  serviceName: string,
  prometheusUrl: string
): Promise<{ healthy: boolean; metrics: Record<string, number> }> {
  const queries = {
    errorRate: `rate(http_errors_total{service="${serviceName}"}[5m])`,
    p95Latency: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{service="${serviceName}"}[5m]))`,
    requestRate: `rate(http_requests_total{service="${serviceName}"}[5m])`,
  };
  
  const results: Record<string, number> = {};
  
  for (const [name, query] of Object.entries(queries)) {
    const response = await request.get(`${prometheusUrl}/api/v1/query`, {
      params: { query },
    });
    
    const data = await response.json();
    results[name] = parseFloat(data.data.result[0]?.value[1] || '0');
  }
  
  const healthy = 
    results.errorRate < 0.01 &&        // Mniej niż 1% błędów
    results.p95Latency < 0.5;          // P95 poniżej 500ms
  
  return { healthy, metrics: results };
}

test('checkout service healthy after E2E flow', async ({ request }) => {
  // ... wykonaj test E2E ...
  
  const { healthy, metrics } = await validateServiceHealth(
    request,
    'checkout-api',
    process.env.PROMETHEUS_URL || 'http://prometheus:9090'
  );
  
  console.log(`Health check: ${healthy ? '✅' : '❌'}`);
  console.log(`  Error rate: ${(metrics.errorRate * 100).toFixed(2)}%`);
  console.log(`  P95 latency: ${(metrics.p95Latency * 1000).toFixed(0)}ms`);
  console.log(`  Request rate: ${metrics.requestRate.toFixed(2)}/s`);
  
  expect(healthy).toBe(true);
});
```

### 5.2 Test sprawdzający SLO

```typescript
test('payment endpoint SLO compliance check', async ({ request }) => {
  // Pobierz metryki z ostatniej godziny
  const hourAgo = Math.floor((Date.now() - 3600000) / 1000);
  
  const response = await request.get(`${process.env.PROMETHEUS_URL}/api/v1/query_range`, {
    params: {
      query: 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{endpoint="/api/payments"}[5m]))',
      start: hourAgo,
      end: Math.floor(Date.now() / 1000),
      step: '60',
    },
  });
  
  const data = await response.json();
  const latencies = data.data.result[0].values.map((v: any[]) => parseFloat(v[1]));
  
  // SLO: p95 < 1s przez 99% czasu w ciągu godziny
  const sloViolationCount = latencies.filter(l => l > 1).length;
  const sloCompliance = 1 - sloViolationCount / latencies.length;
  
  console.log(`SLO compliance: ${(sloCompliance * 100).toFixed(2)}%`);
  
  expect(sloCompliance).toBeGreaterThan(0.99);
});
```

---

## 6. Dashboardy diagnostyczne

### 6.1 Dashboard Grafana dla testera E2E

```yaml
# grafana-dashboard.json (fragment)
{
  "title": "E2E Test Diagnostics",
  "panels": [
    {
      "title": "Flaky Tests — ostatnie 7 dni",
      "type": "stat",
      "targets": [
        {
          "expr": "count(test_executions_total{status=\"flaky\"})",
          "legendFormat": "Flaky tests"
        }
      ]
    },
    {
      "title": "Średni czas wykonania testu",
      "type": "timeseries",
      "targets": [
        {
          "expr": "rate(test_duration_seconds_sum[5m]) / rate(test_duration_seconds_count[5m])",
          "legendFormat": "Avg test duration"
        }
      ]
    },
    {
      "title": "Correlation IDs z błędami — ostatnia doba",
      "type": "table",
      "targets": [
        {
          "expr": "topk(10, count by (correlation_id) (error_logs_total{correlation_id!=\"\"}))",
          "legendFormat": "{{correlation_id}}"
        }
      ]
    },
    {
      "title": "Error rate w usługach",
      "type": "timeseries",
      "targets": [
        {
          "expr": "rate(http_errors_total{service=~\".+\"}[5m])",
          "legendFormat": "{{service}}"
        }
      ]
    }
  ]
}
```

### 6.2 Lista kontrolna obserwowalności dla testera

| Sprawdzenie | Tak | Nie | Uwagi |
|-------------|-----|-----|-------|
| Test przekazuje correlation ID | ☐ | ☐ | |
| Correlation ID jest zapisany w artifactach testu | ☐ | ☐ | |
| Wiadomo, gdzie szukać logów po correlation ID | ☐ | ☐ | |
| Dashboard pokazuje trend, nie pojedynczy punkt | ☐ | ☐ | |
| Metryki odpowiadają na konkretne pytanie | ☐ | ☐ | |
| Trace jest dostępny w Grafana/Jaeger | ☐ | ☐ | |
| Błąd testu jest powiązany z trace | ☐ | ☐ | |
| Alert ma właściciela i próg | ☐ | ☐ | |

---

## Perspektywa Full Stack Testera

Obserwowalność to kompetencja, która wyróżnia profesjonalnego testera. Gdy rozumiesz:
- **Logi strukturalne** — wiesz, gdzie szukać szczegółów błędu
- **Metryki RED/USE** — wiesz, czy system jest zdrowy w danej chwili
- **Trace rozproszone** — wiesz, gdzie dokładnie żądanie się zepsuło
- **Correlation ID** — wiesz, jak połączyć raport testu z konkretnym żądaniem

...skracasz czas diagnozy z godzin do minut, stajesz się autonomiczny w rozwiązywaniu problemów i zyskujesz szacunek zespołu jako osoba, która rozumie system na głębokość.

Pamiętaj: test E2E wykrywa, że coś nie działa. Obserwowalność mówi dlaczego.

---

## Podsumowanie

- **Trzy filary obserwowalności:** logi (co się wydarzyło), metryki (jak system się zachowuje), trace (jak żądanie podróżowało)
- **Correlation ID** łączy wszystkie sygnały z pojedynczym żądaniem
- **Logi strukturalne (JSON)** są łatwiejsze do parsowania i agregacji niż logi tekstowe
- **Model RED** — Rate, Errors, Duration — dla usług HTTP
- **Model USE** — Utilization, Saturation, Errors — dla infrastruktury
- **OpenTelemetry** to standard śledzenia rozproszonego
- **Testy powinny zostawiać ślad** — correlation ID jako artifact, link do trace w raporcie

---

## Linki i źródła

- **[Observability — Charity Majors](https://charity.wtf/)** — blog założycielki Honeycomb o obserwowalności
- **[OpenTelemetry](https://opentelemetry.io/)** — standard śledzenia rozproszonego
- **[Grafana + Tempo](https://grafana.com/docs/tempo/)** — wizualizacja trace w Grafanie
- **[Prometheus — Querying](https://prometheus.io/docs/prometheus/latest/querying/basics/)** — podstawy zapytań Prometheus
- **[USE Method — Brendan Gregg](http://www.brendangregg.com/usemethod.html)** — metodologia metryk infrastruktury
- **[RED Method — Tom Wilkie](https://www.weave.works/blog/the-red-method-three-metrics-you-need/)** — metodologia metryk usług
- **[Distributed Tracing — OpenCensus](https://opencensus.io/)** — alternatywa dla OpenTelemetry
---

## OpenTelemetry Collector

OpenTelemetry Collector jest pośrednikiem telemetrycznym. Może odbierać, przetwarzać i eksportować dane telemetryczne bez wiązania aplikacji z jednym vendorem.

Podstawowe elementy:

- **receivers** — odbierają dane, np. OTLP;
- **processors** — modyfikują dane, np. batch, memory limiter, attributes;
- **exporters** — wysyłają dane, np. do Prometheus, Jaeger, Tempo, Loki;
- **pipelines** — łączą receivers, processors i exporters.

Dla testera oznacza to, że brak trace w Grafanie może wynikać nie z aplikacji, ale z konfiguracji Collectora.

## Semantic conventions

Semantic conventions standaryzują nazwy atrybutów, np. HTTP method, route, status code, database system, messaging destination. Dzięki nim dashboardy i zapytania są spójne między usługami.

Przykład pytań testera:

- czy span HTTP ma route i status code?
- czy span DB ma nazwę systemu i statement bez sekretów?
- czy messaging span ma topic/queue i message id?
