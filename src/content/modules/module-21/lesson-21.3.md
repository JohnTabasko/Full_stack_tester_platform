# Wersjonowanie API i Kompatybilność Wsteczna — Bezpieczna Ewolucja Kontraktów

> **Perspektywa Full Stack Testera**
> Wersjonowanie API to nie overhead — to fundament bezpiecznej ewolucji systemu rozproszonego. Gdy kilka aplikacji mobilnych, frontend webowy i usługi backendowe konsumują Twoje API, każda zmiana ma potencjalnych ofiar. Zmiana jednego pola (`customerName` → `customer.fullName`) może zepsuć pięć aplikacji naraz. W tej lekcji zdobędziesz umiejętności oceniania zmian pod kątem kompatybilności, projektowania bezpiecznej migracji i budowania polityk deprecacji, które dają konsumentom czas na adaptację. Nauczysz się też wykrywać breaking changes automatycznie w CI/CD, zanim dotrą one do produkcji.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Klasyfikować** zmiany API jako breaking lub non-breaking
- **Projektować** bezpieczną ewolucję kontraktów (additive changes)
- **Tworzyć** polityki deprecacji z jasnymi terminami i komunikacją
- **Wybierać** strategię wersjonowania odpowiednią dla organizacji
- **Wykrywać** breaking changes automatycznie w CI/CD
- **Monitorować** użycie deprecated pól w produkcji

---

## Wprowadzenie — dlaczego wersjonowanie ma znaczenie

W świecie monolitu zmiana w jednym miejscu jest widoczna natychmiast — wszystko jest w jednym repozytorium. W świecie mikrousług każda usługa żyje własnym życiem. Zmiana w `orders-api` może dotknąć `checkout-frontend`, `mobile-app-ios`, `mobile-app-android`, `analytics-service`, `email-service` i kilka integracji partnerskich.

Bez wersjonowania i polityki kompatybilności:
- Dostawca API zmienia „drobny szczegół" — nagle 5 usług przestaje działać
- Konsumenci nie wiedzą o zmianie, dopóki ich testy nie zaczną padać
- Hotfix w trybie awaryjnym = kolejne breaking changes

Z wersjonowaniem:
- Breaking changes wymagają nowej wersji API
- Konsumenci mają czas na migrację
- Stare wersje są wspierane przez określony okres
- Zmiana jest komunikowana z wyprzedzeniem

---

## Sytuacja przewodnia — migracja z customerName na customer.fullName

Zespół Orders API chce zrefaktoryzować model odpowiedzi:
- **Stare:** `customerName: "Jan Kowalski"` (string)
- **Nowe:** `customer: { firstName: "Jan", lastName: "Kowalski" }` (obiekt)

Konsumenci:
- Checkout Frontend (web) — używa `customerName`
- Mobile App (iOS) — używa `customerName`
- Mobile App (Android) — używa `customerName`
- Analytics Service — używa `customerName`
- Partner Integration (ERP) — używa `customerName`

Twój zespół testów musi: wykryć breaking change, zaproponować plan migracji i zweryfikować, że konsumenci mają czas na adaptację.

---

## 1. Kompatybilność wsteczna — klasyfikacja zmian

### 1.1 Non-breaking changes (bezpieczne)

| Zmiana | Przykład | Dlaczego bezpieczne |
|--------|----------|---------------------|
| Dodanie nowego opcjonalnego pola | `+ { "loyaltyPoints": 150 }` | Konsumenci nie używają tego pola — ignorują je |
| Dodanie nowego endpointu | `+ GET /v2/orders/export` | Istniejący konsumenci nie wiedzą o nowym endpointzie |
| Dodanie nowego parametru query (opcjonalne) | `+ ?includeItems=true` | Bez parametru — istniejące wywołania działają jak wcześniej |
| Rozszerzenie enum o nowe wartości | `+ "PLATINUM"` do statusu lojalności | Stare wartości nadal działają |
| Dodanie nowego nagłówka w odpowiedzi | `+ X-Request-Id: abc123` | Nagłówki są opcjonalne dla konsumentów |
| Zwiększenie limitu (np. page size) | `pageSize: 50 → 100` | Więcej danych, ale istniejący konsumenci nadal działają |
| Dodanie opcjonalnego parametru path | `+ /users/{userId}?includeProfile=true` | Stare wywołania bez parametru działają |

### 1.2 Breaking changes (niebezpieczne)

| Zmiana | Przykład | Dlaczego niebezpieczne |
|--------|----------|------------------------|
| Usunięcie pola | `- customerName` | Konsumenci próbują czytać nieistniejące pole |
| Zmiana typu | `total: number → string` | Kod konsumencki oczekuje liczby, dostaje string |
| Zmiana formatu | `date: "2024-06-23" → "23/06/2024"` | Parsowanie daty się psuje |
| Zmiana wymagalności | `required: [id] → required: []` | Nieprawidłowe walidacja |
| Zmiana kodu HTTP | `200 → 201` dla sukcesu | Obsługa statusów w konsumencie się psuje |
| Zmiana semantyki | `status = "PAID" → "CONFIRMED"` | Logika konsumencka oparta na wartościach enuma |
| Usunięcie endpointu | `- DELETE /orders/{id}` | Konsumenci nie mogą wywołać |
| Zmiana auth | `header → body token` | Wszystkie wywołania muszą być zmienione |
| Zmiana metody HTTP | `GET → POST` dla pobierania | Restrukturyzacja wywołań |

### 1.3 Szara strefa — zmiany zależne od kontekstu

| Zmiana | Kiedy bezpieczna | Kiedy breaking |
|--------|------------------|----------------|
| Zmiana nazwy pola | Gdy stare pole istnieje obok nowego | Gdy stare pole jest usuwane |
| Zmiana wartości enum | Gdy stara wartość jest nadal zwracana | Gdy tylko nowa wartość jest możliwa |
| Zmiana formatu błędu | Gdy stary format nadal jest wspierany | Gdy konsumenci polegają na konkretnej strukturze |
| Zmiana paginacji | Gdy stara struktura jest zachowana | Gdy konsumenci parsują konkretne pola |

---

## 2. Automatyczne wykrywanie breaking changes

### 2.1 Narzędzie openapi-diff

```bash
npm install -g openapi-diff

# Porównaj dwie wersje specyfikacji
openapi-diff \
  openapi-v1.yaml \
  openapi-v2.yaml \
  --output-format markdown \
  > breaking-changes-report.md
```

### 2.2 Wynik analizy breaking changes

```markdown
# Breaking Changes Report: v1 → v2

## 🔴 BREAKING CHANGES (3)

### 1. Removed Property
**Path:** `GET /orders/{orderId}/response/body`
**Schema:** Order
**Property:** `customerName`
**Change:** Property 'customerName' removed

### 2. Changed Property Type  
**Path:** `GET /orders/{orderId}/response/body`
**Schema:** Order
**Property:** `total`
**Old Type:** number
**New Type:** string

### 3. Changed Enumeration
**Path:** `GET /orders/{orderId}/response/body`
**Schema:** OrderStatus
**Change:** Status 'NEW' removed from enumeration
**Current Values:** [PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, COMPLETED, CANCELLED, REFUNDED]
```

### 2.3 Integracja z CI/CD

```yaml
# .github/workflows/api-changes.yml
name: API Change Analysis

on:
  pull_request:
    paths:
      - 'openapi.yaml'
      - 'api/**'

jobs:
  breaking-changes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Potrzebujemy historii Git
          
      - name: Get base OpenAPI spec
        run: |
          git show origin/main:openapi.yaml > openapi-base.yaml
          
      - name: Compare OpenAPI specs
        run: |
          npx openapi-diff openapi-base.yaml openapi.yaml \
            --output-format json \
            --exit-code 1 \
            > api-changes.json || true
          
      - name: Parse breaking changes
        run: |
          node scripts/parse-breaking-changes.js api-changes.json
          
      - name: Comment PR with breaking changes
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const changes = JSON.parse(fs.readFileSync('api-changes.json', 'utf-8'));
            const breaking = changes.breaking || [];
            
            if (breaking.length > 0) {
              const body = [
                '## ⚠️ Breaking Changes Detected',
                '',
                `Found **${breaking.length}** breaking change(s):`,
                '',
                ...breaking.map(c => `- \`${c.path}\`: ${c.description}`),
                '',
                '**This PR requires**:',
                '- [ ] Bump API version (v1 → v2)',
                '- [ ] Notify consumers: checkout-frontend, mobile-ios, mobile-android',
                '- [ ] Implement deprecation period',
              ].join('\n');
              
              github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body,
              });
            }
```

---

## 3. Bezpieczna ewolucja — krok po kroku

### 3.1 Strategy: Add, Don't Remove

```typescript
// ❌ Breaking: usunięcie customerName
// Stara wersja:
{
  "customerName": "Jan Kowalski"
}

// Nowa wersja (BREAKING):
{
  "customer": {
    "firstName": "Jan",
    "lastName": "Kowalski"
  }
}

// ✅ Non-breaking: dodanie nowego obiektu
// Nowa wersja (bezpieczna):
{
  "customerName": "Jan Kowalski",  // Zostaje — deprecated
  "customer": {                     // Nowe pole obok starego
    "firstName": "Jan",
    "lastName": "Kowalski"
  }
}
```

### 3.2 OpenAPI: oznaczanie deprecated

```yaml
components:
  schemas:
    Order:
      properties:
        customerName:
          type: string
          deprecated: true
          description: |
            ⚠️ DEPRECATED: To pole zostanie usunięte w wersji 3.0.
            Użyj `customer.firstName` i `customer.lastName`.
            Okres deprecacji: do 2025-01-01.
          x-deprecation-date: '2024-06-01'
          x-removal-date: '2025-01-01'
          x-migration-guide: 'https://api.example.com/docs/migration/v2-v3'
        customer:
          type: object
          properties:
            firstName:
              type: string
              example: "Jan"
            lastName:
              type: string
              example: "Kowalski"
```

### 3.3 Nagłówek deprecacji w odpowiedziach

```typescript
// Dodaj nagłówek Deprecation do wszystkich odpowiedzi ze starymi polami
app.get('/api/v1/orders/:id', (req, res) => {
  const order = getOrder(req.params.id);
  
  res.set({
    'Deprecation': 'true',
    'Sunset': 'Sat, 01 Jan 2025 00:00:00 GMT',
    'Link': '<https://api.example.com/docs/migration/v2-v3>; rel="deprecation"',
    'X-API-Deprecated-Fields': 'customerName,totalAsString',
  });
  
  res.json(order);
});
```

### 3.4 Plan migracji dla customerName → customer.fullName

```markdown
# Plan migracji: customerName → customer.fullName

## Faza 1: Dodanie nowego pola (tydzień 1-2)
- Dodać `customer: { firstName, lastName }` obok `customerName`
- Oznaczyć `customerName` jako `deprecated: true` w OpenAPI
- Dodać nagłówek `Deprecation` w odpowiedziach
- **Weryfikacja testowa:**
  - Test kontraktowy sprawdza obecność obu pól
  - Test E2E weryfikuje, że frontend może obsłużyć oba formaty

## Faza 2: Komunikacja (tydzień 3)
- Wysłać email do wszystkich konsumentów z planem migracji
- Utworzyć dokument migracji: https://api.example.com/docs/migration/v2-v3
- Utworzyć issue w Jirze każdego konsumenta z taskami migracji

## Faza 3: Okres deprecacji (tydzień 4-12)
- Monitorować użycie `customerName` przez telemetrię
- Wyświetlać ostrzeżenia w logach gdy `customerName` jest czytane
- Co 2 tygodnie: raport dla zespołu o postępie migracji konsumentów

## Faza 4: Usunięcie starego pola (po 12 tygodniach)
- Wszyscy konsumenci zmigrowani? → Usuń `customerName`
- Nie wszyscy? → Przedłuż okres lub utwórz LTS version

## Konsumenci i ich status:
| Konsument | Aktualne użycie | Status migracji |
|-----------|----------------|-----------------|
| checkout-frontend | `customerName` | 🔴 Do migracji |
| mobile-ios | `customerName` | 🔴 Do migracji |
| mobile-android | `customerName` | 🔴 Do migracji |
| analytics-service | `customerName` | 🔴 Do migracji |
| partner-erp | `customerName` | 🔴 Do migracji |
```

---

## 4. Strategie wersjonowania

### 4.1 URL Path Versioning (najpopularniejsze)

```yaml
servers:
  - url: https://api.example.com/v1
  - url: https://api.example.com/v2
  - url: https://api.example.com/v3

paths:
  /v2/orders/{orderId}:
    get:
      summary: Pobierz zamówienie (v2)
      # Implementacja v2
```

**Zalety:**
- Łatwe do debugowania w przeglądarce
- Jasne, której wersji używamy
- Łatwa polityka cache

**Wady:**
- Duplikacja kodu dla wspólnych ścieżek

### 4.2 Header Versioning

```yaml
paths:
  /orders/{orderId}:
    get:
      summary: Pobierz zamówienie
      parameters:
        - name: API-Version
          in: header
          required: false  # Domyślnie v1
          schema:
            type: string
            enum: [v1, v2, v3]
            default: v1
```

**Użycie:**
```bash
curl -H "API-Version: v2" https://api.example.com/orders/123
```

### 4.3 Content Negotiation (media type)

```yaml
paths:
  /orders/{orderId}:
    get:
      summary: Pobierz zamówienie
      produces:
        - application/vnd.example.v2+json
        - application/json
```

**Użycie:**
```bash
curl -H "Accept: application/vnd.example.v2+json" https://api.example.com/orders/123
```

### 4.4 Zalecenia dla organizacji

| Czynnik | Rekomendacja |
|---------|--------------|
| Mała organizacja, mało konsumentów | URL versioning — najprostsze |
| Duża organizacja, wiele zespołów | URL versioning + kontrakt testing |
| Public API (zewnętrzni konsumenci) | URL versioning + długi okres deprecacji |
| Ścisła kontrola wersji | Header versioning + semver |
| Eksperymentalne funkcje | Feature flags, nie wersje |

---

## 5. Monitorowanie użycia deprecated pól

### 5.1 Telemetria w API

```typescript
// Middleware do monitorowania deprecated pól
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  
  res.json = (data: any) => {
    const deprecatedFieldsUsed = checkDeprecatedFields(req.query, req.body);
    const deprecatedFieldsReturned = getDeprecatedFieldsInResponse(data);
    
    if (deprecatedFieldsUsed.length > 0 || deprecatedFieldsReturned.length > 0) {
      metrics.track('api.deprecated_field_usage', {
        endpoint: req.path,
        fields_used: deprecatedFieldsUsed.join(','),
        fields_returned: deprecatedFieldsReturned.join(','),
        consumer: req.headers['x-client-id'] || 'unknown',
      });
    }
    
    return originalJson(data);
  };
  
  next();
});
```

### 5.2 Dashboard użycia deprecated pól

```typescript
// Skrypt generujący raport dla zespołu
async function generateDeprecationReport() {
  const metrics = await getMetricsFromDB();
  
  const report = {
    generatedAt: new Date(),
    deprecatedFields: [
      {
        field: 'customerName',
        removedAt: '2025-01-01',
        daysRemaining: calculateDaysUntil('2025-01-01'),
        usageByConsumer: [
          { consumer: 'checkout-frontend', requests: 15420, lastUsed: '2024-06-23' },
          { consumer: 'mobile-ios', requests: 8750, lastUsed: '2024-06-23' },
          { consumer: 'mobile-android', requests: 6300, lastUsed: '2024-06-22' },
          { consumer: 'analytics-service', requests: 450, lastUsed: '2024-06-21' },
          { consumer: 'partner-erp', requests: 120, lastUsed: '2024-06-20' },
        ],
        totalRequests: 31020,
        progress: {
          migrated: 0,
          inProgress: 0,
          notStarted: 5,
        },
      },
    ],
  };
  
  console.table(report.deprecatedFields.map(f => ({
    'Pole': f.field,
    'Pozostało dni': f.daysRemaining,
    'Całkowite żądania': f.totalRequests,
    'Zmigrowano': f.progress.migrated,
    'W trakcie': f.progress.inProgress,
    'Nierozpoczęte': f.progress.notStarted,
  })));
  
  return report;
}
```

### 5.3 Alerty przy wysokim użyciu deprecated pól

```yaml
# Prometheus alert
- alert: HighDeprecatedFieldUsage
  expr: |
    rate(api_deprecated_field_usage_total[5m]) > 100
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "Wysokie użycie deprecated pól API"
    description: |
      Pole customerName jest używane przez {{ $value }} żądań/minutę.
      Konsumenci: {{ $labels.consumer }}
      Okres deprecacji kończy się 2025-01-01.
      Skontaktuj się z zespołami konsumentów.
```

---

## 6. Testowanie kompatybilności w Playwright

### 6.1 Test weryfikujący oba formaty

```typescript
// tests/api/compatibility/checkout-format-compatibility.spec.ts
import { test, expect, request as apiRequest } from '@playwright/test';

test.describe('Compatibility: stary i nowy format danych klienta', () => {
  
  test('frontend checkout obsługuje stary format customerName', async () => {
    const response = await apiRequest.get(`${process.env.API_URL}/api/v1/orders/1001`);
    
    expect(response.status()).toBe(200);
    
    const order = await response.json();
    
    // Stary format — backward compatibility
    if ('customerName' in order) {
      expect(typeof order.customerName).toBe('string');
      expect(order.customerName).toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+$/);
      console.log('Stary format customerName jest wspierany');
    }
    
    // Nowy format — dodatkowa weryfikacja
    if ('customer' in order) {
      expect(order.customer).toHaveProperty('firstName');
      expect(order.customer).toHaveProperty('lastName');
      console.log('Nowy format customer jest dostępny');
    }
  });
  
  test('API zwraca Deprecation header dla starego formatu', async () => {
    const response = await apiRequest.get(`${process.env.API_URL}/api/v1/orders/1001`);
    
    const deprecationHeader = response.headers()['deprecation'];
    const sunsetHeader = response.headers()['sunset'];
    
    // Nagłówek Deprecation powinien być obecny
    expect(deprecationHeader).toBe('true');
    
    // Nagłówek Sunset powinien wskazywać datę usunięcia
    if (sunsetHeader) {
      const sunsetDate = new Date(sunsetHeader);
      expect(sunsetDate.getTime()).toBeGreaterThan(Date.now());
      console.log(`Stare pole będzie usunięte: ${sunsetHeader}`);
    }
  });
  
  test('nowy format jest dostępny w v2', async () => {
    const response = await apiRequest.get(`${process.env.API_URL}/api/v2/orders/1001`);
    
    expect(response.status()).toBe(200);
    
    const order = await response.json();
    
    // W v2 powinno być tylko nowe pole
    expect(order).toHaveProperty('customer');
    expect(order.customer).toHaveProperty('firstName');
    expect(order.customer).toHaveProperty('lastName');
    
    // Stare pole nie powinno istnieć w v2
    expect(order).not.toHaveProperty('customerName');
  });
});
```

---

## 7. Lista kontrolna kompatybilności

| Sprawdzenie | Tak | Nie | Uwagi |
|-------------|-----|-----|-------|
| Zmiana jest non-breaking? | ☐ | ☐ | Użyj openapi-diff |
| Nowe pole jest opcjonalne? | ☐ | ☐ | Jeśli wymagane — sprawdź wszystkich konsumentów |
| Stare pole jest oznaczone deprecated? | ☐ | ☐ | Dodaj w OpenAPI i nagłówek w odpowiedzi |
| Konsumenci zostali powiadomieni? | ☐ | ☐ | Email + Slack + issue w ich Jirze |
| Okres deprecacji jest wystarczający? | ☐ | ☐ | Minimum 30 dni, rekomendowane 90 dni |
| Monitorowanie użycia jest wdrożone? | ☐ | ☐ | Telemetria + dashboard |
| Plan migracji jest gotowy? | ☐ | ☐ | Kto, co, kiedy |
| can-i-deploy blokuje przy breaking changes? | ☐ | ☐ | Pact + openapi-diff w CI |

---

## Perspektywa Full Stack Testera

Wersjonowanie API i kompatybilność wsteczna to obszar, gdzie tester może mieć ogromny wpływ na stabilność organizacji. Jako Full Stack Tester powinieneś:

- **Być strażnikiem kontraktu** — każda zmiana musi być oceniona pod kątem breaking vs non-breaking
- **Znać konsumentów** — wiedzieć, kto używa jakiego pola i jak zmiana ich dotknie
- **Pisać testy kompatybilności** — weryfikować, że stary format nadal działa
- **Monitorować deprecated pola** — raportować postęp migracji konsumentów
- **Współpracować z dostawcą API** — pomagać w projektowaniu bezpiecznej ewolucji

Pamiętaj: breaking change kosztuje organizację znacznie więcej niż tydzień dodatkowego okresu deprecacji. Lepiej wydać 30 dni na komunikację niż 30 godzin na gaszenie pożarów po awarii.

---

## Podsumowanie

- **Kompatybilność wsteczna** — zmiana jest bezpieczna, jeśli istniejący konsumenci działają bez zmian
- **Breaking change** — każda zmiana wymagająca modyfikacji konsumenta (usunięcie pola, zmiana typu, zmiana semantyki)
- **Add, don't remove** — najbezpieczniejsza strategia: dodawaj nowe, nie usuwaj stare
- **Deprecation policy** — jasny proces: oznacz → komunikuj → monitoruj → usuń
- **Wersjonowanie** — URL path (najpopularniejsze), header, content negotiation
- **Automatyczne wykrywanie** — openapi-diff w CI/CD blokuje niezweryfikowane zmiany
- **Monitoring** — telemetria użycia deprecated pól pozwala śledzić postęp migracji

---

## Linki i źródła

- **[OpenAPI Change Analysis](https://github.com/OpenAPITools/openapi-diff)** — narzędzie do wykrywania breaking changes
- **[API Compatibility Cheat Sheet — RESTful API Modeling](https://restfulapi.net/)** — zasady kompatybilności REST API
- **[Semantic Versioning 2.0.0](https://semver.org/)** — standard wersjonowania semantycznego
- **[API Deprecation Best Practices — Stripe](https://stripe.com/blog/idempotent-requests)** — jak wielkie firmy zarządzają deprecją API
- **[IETF Deprecation Header](https://tools.ietf.org/html/rfc8594)** — standard nagłówka Deprecation
- **[Sunset Header — IETF](https://tools.ietf.org/html/rfc8594)** — standard nagłówka Sunset
- **[ Pact Broker — can-i-deploy](https://docs.pact.io/pact_broker/can_i_deploy)** — weryfikacja kontraktów przed wdrożeniem
---

## SemVer i API

SemVer pomaga komunikować zmianę, ale samo zwiększenie numeru wersji nie chroni konsumentów. Dla API najważniejsze jest pytanie: czy istniejący klient nadal działa bez zmiany kodu?

Zmiany zwykle kompatybilne:

- dodanie opcjonalnego pola;
- dodanie endpointu;
- dodanie nowej wartości tylko wtedy, gdy konsumenci obsługują unknown values;
- rozszerzenie dokumentacji.

Zmiany zwykle breaking:

- usunięcie pola;
- zmiana typu;
- zmiana wymagalności;
- zmiana kodu błędu;
- zmiana domyślnego sortowania;
- zmiana semantyki pola.

## Polityka deprecacji

Bezpieczna deprecacja powinna mieć:

- datę ogłoszenia;
- datę usunięcia;
- alternatywę;
- telemetrykę użycia starego endpointu;
- komunikację do konsumentów;
- testy sprawdzające oba warianty w okresie przejściowym.

## Wersjonowanie eventów

Eventy są trudniejsze niż HTTP, bo stare komunikaty mogą istnieć w kolejce lub logu. Zasady:

- dodawaj pola kompatybilnie;
- nie zmieniaj znaczenia istniejących pól;
- konsumenci powinni ignorować nieznane pola;
- rozważ wersję schema w payloadzie lub nagłówku;
- utrzymuj testy konsumentów eventów.

## Checklista kompatybilności

- Czy zmiana wymaga aktualizacji konsumenta?
- Czy telemetryka pokazuje użycie starego kontraktu?
- Czy CI wykrywa breaking change?
- Czy istnieje plan migracji?
- Czy eventy są kompatybilne z istniejącymi konsumentami?
