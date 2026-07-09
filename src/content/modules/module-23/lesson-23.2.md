# Identyfikatory korelacji (Full Stack Debugging)

> **Perspektywa Full Stack Testera**
> W nowoczesnych systemach rozproszonych (mikroserwisy, message queues, distributed tracing) jeden błąd w UI może wynikać z awarii piątego serwisu w łańcuchu. Jeden błąd w interfejsie użytkownika może być spowodowany timeoutem w serwisie płatności, który z kolei nie mógł się połączyć z bazą danych, która miała problem z dyskiem. Zrozumienie, co się dzieje "pod maską" — to rola Full Stack Testera, który widzi cały stos technologiczny. Narzędziem, które to umożliwia, jest Correlation ID — unikalny identyfikator, który "podróżuje" przez wszystkie serwisy i pozwala na prześledzenie ścieżki błędu od początku do końca.

## Cel lekcji

Po ukończeniu tej lekcji rozumiesz architekturę systemów rozproszonych i dlaczegoCorrelation ID jest niezbędny, potrafisz implementować Correlation ID w testach Playwright, znasz narzędzia do analizy logów (Kibana, Grafana Loki, Jaeger), rozumiesz kontekst OpenTelemetry i distributed tracing, i wiesz, jak pisać raporty błędów z użyciem Correlation ID, które programiści pokochają.

---

## Dlaczego tradycyjne debugowanie nie działa w systemach rozproszonych

### Anatomia systemu rozproszonego

We współczesnych aplikacjach webowych rzadko masz do czynienia z jednym serwerem. Zazwyczaj masz:

```
Użytkownik → Frontend (React) → API Gateway → Serwis Zamówień 
                                          → Serwis Płatności 
                                          → Serwis Produktów 
                                          → Baza Danych (PostgreSQL)
                                          → Cache (Redis)
                                          → Kolejka Wiadomości (RabbitMQ)
                                          → Serwis Email
                                          → Serwis Logistyczny
                                          → ... (i tak dalej, i tak dalej)
```

Gdy użytkownik klika "Złóż zamówienie" i widzi błąd "Coś poszło nie tak" — co poszło nie tak? Który serwis zawiódł? Dlaczego? Gdzie w logach szukać?

Tradycyjne metody debugowania (log z jednego serwera, request z jednego API) nie wystarczą, bo błąd może być w dowolnym miejscu łańcucha.

### Dlaczego to jest problem testerski

Gdy test E2E padnie z błędem "Zamówienie nie zostało złożone", masz kilka opcji:

**Zła opcja (częsta w początkowych zespołach):**
- Pytasz programistę: "coś nie działa, pomocy"
- Programista patrzy w logi swojego serwisu — nic nie widzi
- Godziny dyskusji "u mnie działa"
- Ostatecznie: błąd jest gdzieś indziej, programista musi przekopać się przez 5 serwisów

**Dobra opcja (Full Stack Tester):**
- W raporcie testowym podajesz: "Correlation ID: abc-123-xyz-789"
- Programista wkleja `abc-123-xyz-789` do Kibana
- Widzi pełną ścieżkę: Zamówienie → Płatności → Baza (timeout na połączeniu)
- W 5 minut wie, co naprawić — bez Twojej pomocy

---

## Correlation ID — definicja i architektura

### Co to jest Correlation ID?

**Correlation ID** (czasem nazywany Request ID, Trace ID, Transaction ID) to unikalny ciąg znaków (zazwyczaj UUID v4), który jest generowany na początku żądania użytkownika i "podróżuje" przez wszystkie serwisy, logi, bazy danych i kolejki wiadomości.

```
Żądanie użytkownika
│
├─→ Frontend: Generuje correlation ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
│     └─→ Dodaje do wszystkich żądań HTTP: Header "X-Correlation-ID: a1b2c3d4..."
│
├─→ API Gateway: Odbiera request z "X-Correlation-ID: a1b2c3d4..."
│     └─→ Przekazuje header dalej do serwisów
│
├─→ Serwis Zamówień: Loguje "Processing order. Correlation ID: a1b2c3d4..."
│     └─→ Wywołuje Płatności z tym samym headerem
│
├─→ Serwis Płatności: Loguje "Payment failed. Correlation ID: a1b2c3d4..."
│     └─→ Błąd jest tutaj! Log: "Connection timeout to DB. Correlation ID: a1b2c3d4..."
│
└─→ Baza Danych: Loguje "Query timeout. Correlation ID: a1b2c3d4..."
```

Każdy log, każdy request, każda operacja w łańcuchu ma ten sam Correlation ID. Dzięki temu możesz "przeglądać" całą ścieżkę błędu przez wyszukiwanie po jednym ID.

### Format Correlation ID

Najczęściej używane formaty:

```typescript
// UUID v4 — standard branżowy
// Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
// Przykład: a1b2c3d4-e5f6-7890-abcd-ef1234567890
import { v4 as uuidv4 } from 'uuid';

const correlationId = uuidv4();
// Wynik: '9b1deb4d-3b7d-4bad-9bcd-65789a5d1b0a'

// ULID — lepsza sortowalność niż UUID
// Przykład: 01ARZ3NDEKTSV4RRFFQ69G5FAV
import { ulid } from 'ulid';
const correlationId = ulid();

// Timestamp-based — łatwiejszy do debugowania ludzkiego oka
// Przykład: req-20240623-143052-a1b2c3
const correlationId = `req-${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}-${Math.random().toString(36).slice(2,8)}`;
```

---

## Implementacja Correlation ID w Playwright

### Strategia 1: Globalny nagłówek dla wszystkich requestów

Najprostsze podejście: ustaw nagłówek `X-Correlation-ID` na poziomie kontekstu przeglądarki, aby był przekazywany do wszystkich żądań HTTP:

```typescript
import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

test.describe('Zamówienia — Correlation ID Tracing', () => {
  
  let correlationId: string;
  
  test.beforeEach(async ({ page }) => {
    // Generuj unikalny Correlation ID na początku każdego testu
    correlationId = uuidv4();
    
    // Dodaj nagłówek do wszystkich żądań HTTP z tej strony
    await page.setExtraHTTPHeaders({
      'X-Correlation-ID': correlationId,
    });
    
    // Wydrukuj do konsoli — łatwo skopiować z raportu CI
    console.log(`[${new Date().toISOString()}] Test started. Correlation ID: ${correlationId}`);
  });
  
  test('złóż zamówienie — pełny flow z tracingiem', async ({ page }) => {
    await page.goto('/products');
    await page.getByRole('button', { name: 'Dodaj do koszyka' }).first().click();
    await page.getByRole('link', { name: 'Koszyk' }).click();
    await page.getByRole('button', { name: 'Złóż zamówienie' }).click();
    
    // Jeśli test padnie, raport pokaże Correlation ID
    // Programista użyje go do śledzenia błędu w Kibana/Grafana
    await expect(page.getByText('Zamówienie zostało złożone')).toBeVisible({ timeout: 15000 });
  });
  
  test.afterEach(async ({}, testInfo) => {
    // Po każdym teście (niezależnie od sukcesu/porażki) zapisz Correlation ID
    if (correlationId) {
      console.log(
        `[${new Date().toISOString()}] Test "${testInfo.title}" ${testInfo.status}. ` +
        `Correlation ID: ${correlationId}. ` +
        `Trace: https://kibana.company.com/app/discover?_g=(filters:!(),query:(match:(${correlationId})))`
      );
    }
  });
});
```

### Strategia 2: Nagłówek w żądaniach API (request fixture)

Dla testów API, nagłówek Correlation ID musi być ustawiony jawnie dla każdego żądania:

```typescript
import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

test.describe('API Orders — Correlation ID', () => {
  
  test('stwórz zamówienie z Correlation ID', async ({ request }) => {
    const correlationId = uuidv4();
    
    // Wysyłaj request z nagłówkiem Correlation ID
    const response = await request.post('/api/orders', {
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-ID': correlationId,
      },
      data: {
        items: [{ productId: 'PROD-001', quantity: 2 }],
        shippingAddress: { city: 'Warszawa', street: 'Marszałkowska 10' },
      },
    });
    
    const body = await response.json();
    
    // Zweryfikuj, że odpowiedź zawiera ten sam Correlation ID (jeśli backend go zwraca)
    if (body.correlationId) {
      expect(body.correlationId).toBe(correlationId);
    }
    
    // Loguj dla debugowania
    console.log(`Created order ${body.id} with Correlation ID: ${correlationId}`);
    
    // Cleanup
    if (response.status() === 201) {
      await request.delete(`/api/orders/${body.id}`);
    }
  });
  
  test('symuluj błąd 500 z Correlation ID', async ({ request }) => {
    const correlationId = uuidv4();
    
    // Wyślij request, który celowo wywoła błąd (np. brak wymaganego pola)
    const response = await request.post('/api/orders', {
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-ID': correlationId,
      },
      data: {
        // Celowo brak wymaganego pola 'items'
      },
    });
    
    // Sprawdź, że błąd został zalogowany zCorrelation ID
    expect(response.status()).toBe(422);
    const error = await response.json();
    
    console.log(
      `Error 422 with Correlation ID: ${correlationId}. ` +
      `Details: ${error.message}. ` +
      `Search in Kibana: correlationId=${correlationId}`
    );
  });
});
```

### Strategia 3: Automatyczne wstrzykiwanie przez intercepcję

Zaawansowane podejście: przechwyć wszystkie żądania i automatycznie dodawaj nagłówek bez modyfikowania każdego requestu:

```typescript
import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

// Helper do automatycznego wstrzykiwania nagłówka Correlation ID
async function setupCorrelationTracing(page: Page, correlationId: string) {
  await page.route('**/*', async (route) => {
    const headers = {
      ...route.request().headers(),
      'x-correlation-id': correlationId,
    };
    await route.continue({ headers });
  });
}

test.describe('Correlation Tracing — Auto-inject', () => {
  
  test.beforeEach(async ({ page }) => {
    const correlationId = uuidv4();
    await setupCorrelationTracing(page, correlationId);
    
    // Zapisz correlation ID do globalnego zakres testu (dostępny później)
    (global as { correlationId?: string }).correlationId = correlationId;
    
    console.log(`Correlation ID: ${correlationId}`);
  });
  
  test('złóż zamówienie z pełnym tracingiem', async ({ page }) => {
    // Correlation ID jest automatycznie dodawany do WSZYSTKICH żądań
    // (HTML, CSS, JS, API, obrazy, fonty — wszystko)
    await page.goto('/checkout');
    await page.getByRole('button', { name: 'Złóż zamówienie' }).click();
    await expect(page.getByText('Zamówienie potwierdzone')).toBeVisible();
  });
});
```

---

## Narzędzia do analizy Correlation ID

### Kibana (Elasticsearch) — wyszukiwanie logów

Kibana to najpopularniejsze narzędzie do analizy logów w środowiskach enterprise:

```bash
# Wyszukiwanie po Correlation ID w Kibana (KQL syntax)
correlationId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"

# Bardziej złożone zapytanie:
correlationId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" AND level: "ERROR"

# Szukaj we wszystkich serwisach (wielu indeksach):
trace.correlationId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

**Co zobaczysz w Kibana:**
- Wszystkie logi z tym Correlation ID, posortowane chronologicznie
- Kolejność: frontend → gateway → serwis A → serwis B → baza → błąd
- Czas trwania każdego etapu
- Szczegóły błędu (stack trace, message, parameters)

### Grafana Loki / Promtail — logi dla Kubernetes

```bash
# Zapytanie LogQL w Grafana
{service="order-service"} |= "a1b2c3d4-e5f6-7890-abcd-ef1234567890"

# Z agregacją czasu (timeline błędu)
{service=~".*"} |= "a1b2c3d4-e5f6-7890-abcd-ef1234567890" | json | line_format "{{.timestamp}} {{.service}} {{.message}}"
```

### Jaeger — distributed tracing

Jaeger to narzędzie do wizualizacji distributed tracing (OpenTelemetry):

```bash
# Szukaj trace po Correlation ID
jaegertracing.io/traceId: a1b2c3d4e5f67890abcd

# W UI Jaeger zobaczysz:
# - Graf z węzłami (każdy węzeł = serwis)
# - Krawędzie z czasem odpowiedzi
# - Szczegóły każdego span (operacji)
# - Gdzie jest najdłuższy timeout
```

---

## Pisanie raportów błędów z Correlation ID

### Szablon raportu błędu dla programisty

Gdy test padnie, Twój raport powinien zawierać:

```
Temat: [E2E FAIL] Test "Złóż zamówienie" pada na CI
Correlation ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890

=== Co testował ===
Scenariusz: Użytkownik dodaje produkt do koszyka i składa zamówienie kartą.
Kroki:
1. Otwórz /products
2. Kliknij "Dodaj do koszyka" (pierwszy produkt)
3. Przejdź do /cart
4. Kliknij "Złóż zamówienie"
5. Wybierz metodę płatności "Karta"
6. Wypełnij formularz Stripe test card
7. Kliknij "Zapłać"

=== Co się stało ===
TimeoutError: Nie można zlokalizować elementu "Zamówienie potwierdzone" 
po 30 sekundach od kliknięcia "Zapłać".

=== Correlation ID ===
a1b2c3d4-e5f6-7890-abcd-ef1234567890

=== Linki do narzędzi diagnostycznych ===
Kibana: https://kibana.company.com/app/discover?_g=()&_a=(columns:!(_source),filters:!((meta:(index:'logs-*',value:'logs-*'),query:(match:(correlationId:(query:'a1b2c3d4-e5f6-7890-abcd-ef1234567890',type:phrase)))))
Grafana: https://grafana.company.com/explore?left={"queries":[{"expr":"{service=~\".*\"} |= \"a1b2c3d4-e5f6-7890-abcd-ef1234567890\""}]}
Jaeger: https://jaeger.company.com/trace/a1b2c3d4e5f67890

=== Plik trace Playwright ===
/artefakty/test-results/trace-a1b2c3d4.zip (załączony jako artifact CI)

=== Środowisko ===
Branch: feature/new-payment-flow
Commit: abc123def
CI Runner: GitHub Actions (ubuntu-22.04)
Time: 2024-06-23 14:30:52 UTC
```

**Dlaczego to jest lepsze od "coś nie działa"?**
Programista otwiera Kibana, wkleja Correlation ID i w 2 minuty wie:
1. Żądanie doszło do API Gateway (14:30:50)
2. Serwis Zamówień je przetworzył (14:30:51)
3. Serwis Płatności zwrócił 500 Internal Server Error (14:30:52)
4. Błąd: "Connection refused to Stripe API" — timeout 30s

Nie musi sięgać do Ciebie. Nie musi zgadywać. Ma dokładną ścieżkę.

---

## Zaawansowane wzorce: OpenTelemetry i Auto-instrumentacja

### OpenTelemetry — standard przemysłowy

OpenTelemetry (OTel) to otwarty standard do observability (telemetry, tracing, logging). Coraz więcej firm migrates from własnych rozwiązań correlation ID na OTel:

```typescript
// W Playwright, jeśli Twój backend używa OpenTelemetry:
// Możesz przekazać trace context przez W3C Trace Context headers

test.beforeEach(async ({ page }) => {
  // W3C Trace Context to standardowe nagłówki:
  // traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01
  // tracestate: Conrad=s:sc,congo=t:61g3HZJxR5
  
  await page.setExtraHTTPHeaders({
    'traceparent': '00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01',
    'tracestate': 'congo=t:61g3HZJxR5',
  });
});
```

### Auto-instrumentacja w Node.js

Jeśli backend jest napisany w Node.js, OpenTelemetry automatycznie dodaje Correlation ID do wszystkich requestów bez ręcznej implementacji:

```typescript
// Node.js z OpenTelemetry
// Wystarczy zainstalować i skonfigurować raz:
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: 'https://otel-collector.company.com:4318/v1/traces',
  }),
});

sdk.start();
// Od teraz KAŻDY request HTTP maCorrelation ID automatycznie
// Nagłówek traceparent jest propagowany przez wszystkie serwisy
```

---

## Dobre praktyki Correlation ID

### Co ROBIĆ:

1. **Generuj na początku żądania** — na poziomie frontend/API gateway, nie w każdym serwisie.
2. **Przekazuj przez wszystkie warstwy** — HTTP headers, message queues, database queries, logs.
3. **Loguj przy każdym wpisie** — correlation ID powinien być w każdym logu, aby umożliwić pełne prześledzenie.
4. **Zapisuj w raporcie testowym** — jeśli test padnie, correlation ID powinien być na widocznym miejscu.
5. **Używaj UUID v4 lub ULID** — unikalność gwarantowana, brak kolizji.

### Czego UNIKAĆ:

1. **Nie generuj w każdym serwisie osobno** — każdy serwis generujący własny ID = brak możliwości śledzenia end-to-end.
2. **Nie używaj losowych stringów bez standardu** — jeśli masz Correlation ID w jednym formacie, trzymaj się go konsekwentnie.
3. **Nie loguj tylko na błędach** — loguj CAŁĄ ścieżkę, aby wiedzieć dokładnie, co się wydarzyło PRZED błędem.
4. **Nie zostawiaj Correlation ID tylko w backendzie** — test automatyczny powinien go mieć, aby móc szybko zgłosić błąd.

---

## Perspektywa Full Stack Testera — od zgłoszenia do współpracy

Umiejętność używania Correlation ID to moment, w którym przekraczasz granicę między "testerem manualnym" a "inżynierem QA". Gdy potrafisz:
- Napisać test, który generuje i przekazuje Correlation ID przez całą ścieżkę requestu.
- Przeanalizować logi w Kibana lub Grafana Loki, aby znaleźć przyczynę błędu.
- Napisać raport z Correlation ID i linkami do narzędzi diagnostycznych.

...wtedy programista nie musi sięgać po latarkę i szukać igły w stogu siana. Podajesz mu mapę z zaznaczonym miejscem, gdzie jest igła. To jest Full Stack Testing na poziomie eksperckim — umiejętność, która czyni Cię nieocenionym w każdym zespole.

---

## Podsumowanie

1. **Problem systemów rozproszonych** — jeden błąd w UI może wynikać zawodności w piątym serwisie łańcucha.
2. **Correlation ID** — unikalny identyfikator podróżujący przez wszystkie serwisy i logi.
3. **Implementacja w Playwright** — `setExtraHTTPHeaders()`, `page.route()`, nagłówki w API.
4. **Narzędzia analityczne** — Kibana, Grafana Loki, Jaeger, OpenTelemetry.
5. **Raportowanie** — szablon raportu z Correlation ID i linkami do narzędzi diagnostycznych.
6. **Dobre praktyki** — generuj na początku, przekazuj przez wszystkie warstwy, loguj konsekwentnie.

---

## Linki i źródła

- [OpenTelemetry — Distributed Tracing](https://opentelemetry.io/docs/concepts/signals/traces/)
- [Microservices Patterns: Correlation ID](https://microservices.io/patterns/observability/correlation-id.html)
- [W3C Trace Context Specification](https://www.w3.org/TR/trace-context/)
- [Elasticsearch / Kibana — Getting Started](https://www.elastic.co/guide/en/kibana/current/tutorial-load-dataset.html)
- [Grafana Loki — LogQL](https://grafana.com/docs/loki/latest/logql/)
---

## W3C Trace Context

Standard W3C Trace Context definiuje nagłówki `traceparent` i `tracestate`, które pozwalają propagować trace przez usługi. Jeśli test E2E ustawia correlation ID, a system używa OpenTelemetry, warto sprawdzić, czy trace przechodzi przez frontend, API, worker i bazę.

Przykładowe pytania:

- czy request z UI ma `traceparent`?
- czy backend tworzy child span?
- czy event do kolejki zachowuje kontekst?
- czy logi zawierają trace id?

## Baggage

Baggage pozwala przenosić dodatkowe metadane. Trzeba używać go ostrożnie, bo może zwiększać payload i ujawniać dane. Nigdy nie wkładaj do baggage sekretów ani danych osobowych.

## Correlation ID vs trace ID

Correlation ID jest często domenowym identyfikatorem diagnostycznym. Trace ID pochodzi z systemu tracingu. Mogą współistnieć. Najlepszy raport testu zawiera oba, jeśli są dostępne.
