# Identyfikatory korelacji w testach E2E (Correlation IDs)

W rozproszonych architekturach mikroserwisowych, pojedyncze kliknięcie przycisku przez użytkownika na frontendzie wyzwala lawinę asynchronicznych zapytań wewnętrznych między wieloma mikrousługami, bazami danych i kolejkami. Gdy test E2E zakończy się błędem (np. status `500 Internal Server Error`), odnalezienie przyczyny w gigantycznym gąszczu logów systemowych graniczy z cudem.

Rozwiązaniem tego problemu jest **śledzenie rozproszone (Distributed Tracing)** oparte o **Identyfikatory Korelacji (Correlation IDs)**. W tej lekcji nauczysz się, jak dynamicznie generować i wstrzykiwać identyfikatory korelacji w testach Playwright w celu natychmiastowego powiązania błędów testowych z logami serwera w systemach takich jak Grafana Loki czy Kibana.

---

## 1. Koncepcja Identyfikatora Korelacji (Correlation ID)

### Czym jest Correlation ID?
To unikalny, losowo generowany ciąg znaków (najczęściej w formacie UUIDv4), który jest dołączany jako niestandardowy nagłówek HTTP (np. `X-Correlation-Id` lub `traceparent` zgodny ze standardem W3C Trace Context) do każdego żądania wysyłanego z klienta.

### Przepływ diagnostyczny (Debugging Flow):
1.  **Playwright** generuje `Correlation-ID: 99c7-44bf...` i wysyła go w nagłówku do API.
2.  **API Gateway** odczytuje nagłówek i przekazuje go dalej do wszystkich wewnętrznych mikroserwisów (Orders, Inventory, Shipping).
3.  **Wszystkie systemy** zapisują ten sam `Correlation-ID` w każdej linii generowanych logów.
4.  **W razie awarii**, tester pobiera `Correlation-ID` z raportu Playwright, wpisuje go do Grafana Loki i w ułamku sekundy otrzymuje **kompletny, chronologiczny zapis logów ze wszystkich serwerów** uczestniczących w obsłudze tego konkretnego kliknięcia!

---

## 2. Implementacja wstrzykiwania Correlation ID w Playwright

W Playwright możemy automatycznie wygenerować i wstrzyknąć unikalny nagłówek korelacji do wszystkich wychodzących żądań sieciowych za pomocą customowych opcji kontekstu lub intercepcji sieciowej:

```typescript
import { test as base, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

// Rozszerzamy runner o automatyczne wstrzykiwanie nagłówka korelacji
export const test = base.extend<{ correlationId: string }>({
  correlationId: async ({}, use) => {
    // Generujemy unikalny identyfikator korelacji dla danego testu
    const cid = uuidv4();
    await use(cid);
  },

  // Konfigurujemy kontekst tak, aby automatycznie dodawał nagłówek do każdego żądania
  page: async ({ page, correlationId }, use) => {
    // Przechwyć każde zapytanie sieciowe i wstrzyknij nagłówek X-Correlation-ID
    await page.route('**/*', async (route) => {
      const headers = {
        ...route.request().headers(),
        'X-Correlation-Id': correlationId,
      };
      await route.continue({ headers });
    });

    await use(page);
  },
});
```

---

## 3. Wykorzystanie Correlation ID w Asercjach i Raportach

W przypadku awarii, niezwykle ważne jest, aby identyfikator korelacji został automatycznie zapisany w adnotacjach testu oraz dołączony do raportu końcowego (np. jako załącznik), ułatwiając pracę deweloperom:

```typescript
// tests/checkout-debug.spec.ts
import { test } from '../src/utils/customTest';
import { expect } from '@playwright/test';

test('złożenie zamówienia z pełnym śledzeniem logów', async ({ page, correlationId }, testInfo) => {
  // Zapisz Correlation ID w adnotacji raportu HTML
  testInfo.annotations.push({
    type: 'Correlation-ID',
    description: correlationId,
  });

  await page.goto('/checkout');
  await page.getByRole('button', { name: 'Kupuję i płacę' }).click();

  // W razie niepowodzenia, deweloper po prostu kopiuje wartość z raportu i wpisuje do Grafany!
  await expect(page.getByText('Dziękujemy za zamówienie')).toBeVisible();
});
```

---

## 4. Checklista Śledzenia Rozproszonego (Correlation Tracking)
- [ ] Czy Twój system generuje unikalne identyfikatory korelacji (Correlation ID / UUIDv4) dla każdego testu E2E?
- [ ] Czy wstrzykujesz ten identyfikator jako niestandardowy nagłówek HTTP (np. `X-Correlation-Id`) do wszystkich wychodzących żądań sieciowych przeglądarki?
- [ ] Czy w przypadku awarii testu, identyfikator korelacji jest automatycznie zapisywany w adnotacjach (`testInfo.annotations`) lub załącznikach raportu HTML?
- [ ] Czy potrafisz wyszukać logi systemowe powiązane z danym identyfikatorem w usłudze Grafana Loki lub Kibana?