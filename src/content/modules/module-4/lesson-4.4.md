# Zaawansowana intercepcja sieciowa i mockowanie API (Network Interception)

Podczas testowania aplikacji typu Single Page Application (SPA), interfejs użytkownika stale komunikuje się z wieloma zewnętrznymi i wewnętrznymi mikrousługami przez API. Testowanie pełnego przepływu E2E z rzeczywistymi usługami zewnętrznymi (np. systemami płatności, zewnętrznym systemem kurierskim) bywa powolne, kosztowne, trudne do zreplikowania oraz podatne na awarie niezależne od naszej aplikacji.

Playwright udostępnia jeden z najpotężniejszych na rynku silników **intercepcji sieciowej (Network Interception)**. Za pomocą metody `page.route()` możemy przechwycić dowolne żądanie HTTP na poziomie sieciowym przeglądarki i błyskawicznie je zmodyfikować, zablokować lub dostarczyć udawaną odpowiedź (mock) bez obciążania rzeczywistego backendu.

---

## 1. Architektura przechwytywania żądań sieciowych (`page.route`)

Kiedy rejestrujemy regułę `page.route()`, Playwright konfiguruje na poziomie przeglądarki filtr sieciowy. Każde żądanie pasujące do podanego wzorca URL (lub wyrażenia regularnego) zostaje zatrzymane, dając nam pełną kontrolę nad jego cyklem życia.

```
       +-------------------------------------------------+
       |              Żądanie sieciowe z UI              |
       +-------------------------------------------------+
                                |
                                v
       +-------------------------------------------------+
       |         Filtr sieciowy Playwright (page.route)  |
       +-------------------------------------------------+
            /                  |                  \
           v                   v                   v
+--------------------+ +--------------------+ +--------------------+
|   route.abort()    | |  route.fulfill()   | |  route.continue()  |
| Blokuje żądanie    | | Zwraca gotową odpowiedź| Przepuszcza dalej |
| (np. błąd sieci)   | | (pełne mockowanie) | | (opcjonalnie modyf)|
+--------------------+ +--------------------+ +--------------------+
```

---

## 2. Podstawowe mockowanie odpowiedzi (`route.fulfill`)

Wzorce `route.fulfill()` służą do symulowania gotowych odpowiedzi serwera (np. w formacie JSON) wraz z określeniem kodu statusu oraz nagłówków:

```typescript
import { test, expect } from '@playwright/test';

test('symulacja pustej listy produktów w sklepie', async ({ page }) => {
  // Przechwyć każde zapytanie GET do endpointu produktów
  await page.route('**/api/v1/products', async (route) => {
    // Fulfill błyskawicznie zwraca naszą udawaną odpowiedź JSON
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]), // Zwróć pustą listę produktów
    });
  });

  await page.goto('/shop');
  
  // Weryfikujemy, czy interfejs poprawnie reaguje na brak produktów (błyskawiczny test!)
  await expect(page.getByText('Brak produktów w wybranej kategorii')).toBeVisible();
});
```

---

## 3. Modyfikacja i przepuszczanie żądań (`route.continue` & `route.fallback`)

Czasami nie chcemy całkowicie mockować odpowiedzi, ale zależy nam na **zmianie parametrów żądania** (np. dodaniu nagłówka autoryzacyjnego) i przepuszczeniu go do rzeczywistego serwera:

```typescript
await page.route('**/api/v1/orders', async (route) => {
  // Pobierz oryginalne żądanie
  const request = route.request();
  
  // Kontynuuj żądanie do serwera, ale z nowymi nagłówkami
  await route.continue({
    headers: {
      ...request.headers(),
      'X-Test-Session-Id': 'arena-automation-2026',
    }
  });
});
```

Możemy również dynamicznie wywołać `route.fallback()`, jeśli chcemy zarejestrować wiele filtrów dla tego samego adresu URL, które będą wykonywane po kolei w formie łańcucha filtrów.

---

## 4. Symulowanie błędów sieciowych i awarii backendu (`route.abort`)

Weryfikacja zachowania aplikacji w sytuacjach krytycznych (np. gdy serwer leży, połączenie internetowe zostało zerwane lub nastąpił timeout bramki) jest niezwykle trudna przy tradycyjnych testach. Playwright pozwala zasymulować te stany w ułamku sekundy przy użyciu metody `route.abort()`:

```typescript
test('obsługa awarii sieci podczas płatności', async ({ page }) => {
  await page.goto('/checkout');

  // Przechwyć zapytanie płatności i celowo zerwij połączenie na poziomie klienta
  await page.route('**/api/v1/pay', async (route) => {
    await route.abort('failed'); // Symuluje błąd połączenia TCP/IP
  });

  await page.getByRole('button', { name: 'Zapłać teraz' }).click();

  // Weryfikujemy, czy aplikacja nie wywala się błędem konsoli, ale pokazuje przyjazny komunikat
  await expect(page.getByText('Wystąpił problem z połączeniem. Spróbuj ponownie.')).toBeVisible();
});
```

Dozwolone wartości błędu dla `abort()` to m.in.: `'failed'`, `'timedout'`, `'connectionrefused'`, `'accessdenied'`.

---

## 5. Checklista Intercepcji Sieciowej
- [ ] Czy używasz precyzyjnych wzorców adresów URL (lub wyrażeń regularnych) w `page.route()`, aby nie przechwycić przypadkowo innych zasobów?
- [ ] Czy do symulacji gotowych odpowiedzi JSON stosujesz metodę `route.fulfill()` wraz z określeniem odpowiedniego status code i `contentType: 'application/json'`?
- [ ] Czy weryfikujesz zachowanie aplikacji w trudnych warunkach sieciowych (błędy połączenia) za pomocą `route.abort()`?
- [ ] Czy pamiętasz, że reguły `page.route` muszą zostać zadeklarowane *przed* wywołaniem akcji, która wyzwala dane zapytanie sieciowe?