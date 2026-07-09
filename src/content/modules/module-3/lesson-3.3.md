# Testowanie i asercje API (Full Stack Approach)

Prawdziwa potęga Full Stack Testera objawia się w łączeniu testów UI i API. Playwright pozwala na wykonywanie żądań sieciowych bezpośrednio wewnątrz testów, bez konieczności uruchamiania przeglądarki dla każdego kroku.

## 1. Request Fixture

Używamy fixture `request`, aby wysyłać zapytania do backendu:
```typescript
test('powinien pobrać listę produktów przez API', async ({ request }) => {
  const response = await request.get('/api/products');
  expect(response.ok()).toBeTruthy(); // Status 200-299
  
  const body = await response.json();
  expect(body.length).toBeGreaterThan(0);
});
```

## 2. Asercje na ciele odpowiedzi (JSON)

Weryfikacja struktury danych jest kluczowa dla stabilności kontraktu między frontendem a backendem.
```typescript
const user = await response.json();
expect(user).toMatchObject({
  id: expect.any(Number),
  email: 'test@example.com',
  roles: expect.arrayContaining(['ADMIN'])
});
```

## 3. Hybrydowe testowanie (UI + API)

To najważniejszy wzorzec w projektach komercyjnych. Wyobraź sobie, że musisz przetestować edycję produktu. 
Zamiast:
1. Logować się przez UI.
2. Wchodzić w listę produktów.
3. Klikać "Dodaj produkt" i wypełniać 20 pól.
4. Dopiero teraz klikać "Edytuj" (to na czym nam zależy).

Zrób to jak pro:
1. Stwórz produkt przez `request.post()`.
2. Przejdź bezpośrednio pod adres edycji: `page.goto('/product/edit/' + id)`.
**Zysk**: Oszczędzasz 15 sekund na każdym teście i eliminujesz 3 miejsca, w których UI mógłby się wyłożyć.

## 4. Walidacja Nagłówków i Ciasteczek

Często musimy sprawdzić bezpieczeństwo lub format danych:
```typescript
expect(response.headers()['content-type']).toContain('application/json');
```

## Dobre praktyki
- **Baza URL**: Skonfiguruj `baseURL` w `playwright.config.ts`, aby w testach używać tylko ścieżek relatywnych.
- **Dane wrażliwe**: Tokeny API czy hasła przechowuj w zmiennych środowiskowych (`process.env.API_KEY`).

## Linki
- [API Testing in Playwright](https://playwright.dev/docs/api-testing)
