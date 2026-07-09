# Przechwytywanie i modyfikacja sieci (Mocking & Interception)

> **Perspektywa Full Stack Testera**
> Mockowanie (symulowanie odpowiedzi API zamiast korzystania z prawdziwego serwera) to jedna z najpotężniejszych technik w arsenale testera automatycznego. Pozwala na testowanie frontendu bez backendu, symulowanie błędów (500, 403, timeout), tworzenie deterministycznych scenariuszy (te same dane za każdym razem) i przyspieszanie testów (blokowanie ciężkich zasobów). Jako Full Stack Tester powinieneś opanować `page.route()` i wiedzieć, kiedy mockować, a kiedy tego nie robić — bo w testach E2E over-mockowanie może ukryć prawdziwe problemy integracyjne.

## Cel lekcji

Po ukończeniu tej lekcji rozumiesz architekturę `page.route()` i mechanizmu interception, potrafisz mockować odpowiedzi API (fulfill), symulować błędy HTTP (abort, error status), blokować zasoby dla przyspieszenia testów, modyfikować żądania w locie (intercept & modify), konfigurujesz mocks w fixture i rozumiesz granicę między mockowaniem a testami E2E.

---

## Architektura page.route() — jak działa interception

### Mechanizm działania

`page.route()` przechwytuje żądania HTTP na poziomie sieciowym (przez Chrome DevTools Protocol). Każde żądanie wychodzące z przeglądarki przechodzi przez "warstwę intercept", gdzie możesz je:
- **Zastąpić** własną odpowiedzią (mock).
- **Zmodyfikować** i puścić dalej do prawdziwego serwera.
- **Zablokować** (nie puścić dalej).
- **Zwlekać** (dodać opóźnienie).
- **Powtórzyć** (nagrać i zapętlić).

```typescript
// Rejestracja interceptora — PRZED nawigacją!
await page.route('**/api/products', async (route) => {
  // route = przechwycone żądanie
  // Możesz: route.fulfill(), route.continue(), route.abort()
});

await page.goto('/products');
// Teraz wszystkie żądania do /api/products są przechwytywane przez powyższy handler
```

### Ważne: Rejestruj interceptory PRZED nawigacją

```typescript
// ✅ Poprawnie — interceptor zarejestrowany przed goto
test('mockowanie API', async ({ page }) => {
  await page.route('**/api/products', route => {
    route.fulfill({ status: 200, body: '[]' });
  });
  await page.goto('/products'); // Strona wczytuje się z mockiem
});

// ❌ Problem — interceptor może nie złapać pierwszego żądania
test('błędna kolejność', async ({ page }) => {
  await page.goto('/products'); // Żądanie może się wykonać PRZED rejestracją interceptora
  await page.route('**/api/products', route => { /* ... */ }); // Za późno!
});
```

### Wzorzec URL (glob vs regex)

```typescript
// Glob pattern — prosty i czytelny
await page.route('**/api/products', route => { /* ... */ });         // Wszystko po /api/products
await page.route('**/api/v1/**', route => { /* ... */ });            // Wszystko z prefixem v1
await page.route('**/fonts/*', route => route.abort());              // Blokuj fonty

// Regex — dla precyzyjnej kontroli
await page.route(/\/api\/products\?.*category=electronics/, route => {
  // Tylko żądania z parametrem category=electronics
  route.fulfill({ body: '[]' });
});

await page.route(new RegExp('https://cdn\\.mysite\\.com/.*\\.(png|jpg)'), route => {
  // Blokuj obrazy z CDN
  route.abort();
});
```

---

## Mockowanie odpowiedzi API — fulfill()

### Prosty mock JSON

```typescript
test('wyświetl listę produktów z mocka', async ({ page }) => {
  // Rejestruj interceptor PRZED nawigacją
  await page.route('**/api/products', async (route) => {
    const mockProducts = [
      { id: '1', name: 'iPhone 15 Pro', price: 5999, stock: 10 },
      { id: '2', name: 'MacBook Air M3', price: 7999, stock: 5 },
      { id: '3', name: 'AirPods Pro', price: 1299, stock: 20 },
    ];
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockProducts),
    });
  });
  
  await page.goto('/products');
  
  // Strona wyświetla produkty z mocka — bez prawdziwego backendu!
  await expect(page.getByText('iPhone 15 Pro')).toBeVisible();
  await expect(page.getByText('MacBook Air M3')).toBeVisible();
  await expect(page.getByText('5999 zł')).toBeVisible();
});
```

### Dynamiczny mock — odpowiedź zależna od requestu

```typescript
test('mock odpowiada na podstawie parametrów żądania', async ({ page }) => {
  await page.route('**/api/products', async (route) => {
    const url = route.request().url();
    const params = new URL(url).searchParams;
    const category = params.get('category');
    const minPrice = params.get('minPrice');
    
    // Różna odpowiedź w zależności od parametrów
    let products = [];
    
    if (category === 'electronics') {
      products = [
        { id: '1', name: 'iPhone', price: 5999, category: 'electronics' },
        { id: '2', name: 'MacBook', price: 7999, category: 'electronics' },
      ];
    } else if (category === 'accessories') {
      products = [
        { id: '3', name: 'AirPods', price: 1299, category: 'accessories' },
      ];
    } else {
      products = []; // Pusta kategoria
    }
    
    // Filtrowanie po cenie
    if (minPrice) {
      products = products.filter(p => p.price >= parseFloat(minPrice));
    }
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(products),
    });
  });
  
  // Test różnych scenariuszy z tym samym interceptorem
  await page.goto('/products?category=electronics&minPrice=5000');
  await expect(page.getByText('iPhone 15 Pro')).toBeVisible();
  
  await page.goto('/products?category=accessories');
  await expect(page.getByText('AirPods Pro')).toBeVisible();
});
```

### Mock z nagłówkami i ciasteczkami

```typescript
test('mock odpowiedzi z nagłówkami CORS i cache', async ({ page }) => {
  await page.route('**/api/user', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: '1', name: 'Jan Kowalski', email: 'jan@example.pl' }),
      headers: {
        'X-Request-Id': `mock-${Date.now()}`,
        'Cache-Control': 'max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  });
  
  await page.goto('/profile');
  // Nagłówek X-Request-Id jest widoczny w Network w Trace Viewerze
});
```

---

## Symulacja błędów HTTP — negative testing

### Testowanie błędów, których nie da się łatwo wywołać w prawdziwej aplikacji

```typescript
test('aplikacja wyświetla komunikat przy błędzie 500', async ({ page }) => {
  await page.route('**/api/orders', async (route) => {
    // Symuluj wewnętrzny błąd serwera
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: 'Baza danych jest недоступна',
        code: 'DB_CONNECTION_FAILED',
      }),
    });
  });
  
  await page.goto('/checkout');
  await page.getByRole('button', { name: 'Złóż zamówienie' }).click();
  
  // Aplikacja powinna wyświetlić komunikat błędu (nie crash!)
  await expect(page.getByText(/błąd|nie udało się|przepraszamy/i)).toBeVisible({ timeout: 5000 });
});

test('aplikacja wyświetla komunikat przy błędzie 403 (brak uprawnień)', async ({ page }) => {
  await page.route('**/api/admin/**', async (route) => {
    await route.fulfill({
      status: 403,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Forbidden',
        message: 'Brak uprawnień do zasobu',
        code: 'ACCESS_DENIED',
      }),
    });
  });
  
  await page.goto('/admin/dashboard');
  
  // Aplikacja powinna przekierować na stronę logowania lub wyświetlić komunikat
  await expect(page).toHaveURL(/\/(login|unauthorized)/);
});

test('aplikacja obsługuje timeout API', async ({ page }) => {
  await page.route('**/api/slow-endpoint', async (route) => {
    // Symuluj wolny serwer — odpowiedz po 30s
    await route.abort('timedOut');
  });
  
  await page.goto('/data-heavy-page');
  await page.getByRole('button', { name: 'Pobierz dane' }).click();
  
  // Aplikacja powinna wyświetlić timeout error
  await expect(page.getByText(/timeout|przekroczono czas|nie udało się pobrać/i)).toBeVisible({ timeout: 5000 });
});

test('aplikacja obsługuje brak połączenia (offline)', async ({ page }) => {
  await page.route('**/api/**', async (route) => {
    // Symuluj brak połączenia sieciowego
    await route.abort('failed');
  });
  
  await page.goto('/products');
  
  // Aplikacja powinna wyświetlić komunikat "Brak połączenia" lub "Offline"
  await expect(page.getByText(/brak połączenia|offline|nie można połączyć/i)).toBeVisible({ timeout: 5000 });
});
```

### Symulacja Rate Limiting (429)

```typescript
test('aplikacja obsługuje rate limiting', async ({ page }) => {
  let requestCount = 0;
  
  await page.route('**/api/search', async (route) => {
    requestCount++;
    
    if (requestCount > 3) {
      // Symuluj rate limit po 3 żądaniach
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Too Many Requests',
          message: 'Przekroczono limit zapytań. Spróbuj ponownie za chwilę.',
          retryAfter: 60,
        }),
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Remaining': '0',
        },
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ results: [] }),
      });
    }
  });
  
  await page.goto('/search');
  
  // Wyślij 4 żądania
  for (let i = 0; i < 4; i++) {
    await page.getByPlaceholder('Szukaj...').fill(`query-${i}`);
    await page.getByRole('button', { name: 'Szukaj' }).click();
    await page.waitForTimeout(500);
  }
  
  // 4. żądanie powinno pokazać komunikat rate limit
  await expect(page.getByText(/przekroczono limit|zbyt wiele żądań/i)).toBeVisible({ timeout: 5000 });
});
```

---

## Blokowanie zasobów dla przyspieszenia testów

### Typowy scenario: Strona ładuje się 10s przez ciężkie zasoby

```typescript
test('szybki test — blokuj heaviest', async ({ page }) => {
  // Blokuj obrazy (Playwright nadal renderuje, ale nie pobiera)
  await page.route('**/*.{png,jpg,jpeg,gif,webp,svg}', route => route.abort());
  
  // Blokuj trackery i analitykę (Google Analytics, Facebook Pixel, Hotjar)
  await page.route('**/google-analytics.com/**', route => route.abort());
  await page.route('**/googletagmanager.com/**', route => route.abort());
  await page.route('**/facebook.net/**', route => route.abort());
  await page.route('**/hotjar.com/**', route => route.abort());
  
  // Blokuj fonty (jeśli masz już fonty w systemie)
  await page.route('**/fonts.googleapis.com/**', route => route.abort());
  await page.route('**/fonts.gstatic.com/**', route => route.abort());
  
  // Blokuj video/audio
  await page.route('**/*.{mp4,webm,mp3,wav}', route => route.abort());
  
  // Blokuj reklamy
  await page.route('**/doubleclick.net/**', route => route.abort());
  await page.route('**/googlesyndication.com/**', route => route.abort());
  
  const start = Date.now();
  await page.goto('/');
  const loadTime = Date.now() - start;
  
  console.log(`Strona załadowała się w ${loadTime}ms (z zablokowanymi zasobami)`);
  
  // Reszta testu — działa normalnie, ale szybciej
  await expect(page.getByRole('main')).toBeVisible();
});
```

**UWAGA**: Blokowanie zasobów to kompromis — test jest szybszy, ale nie weryfikuje realnego load time strony. Używaj tej techniki dla testów, gdzie zależy Ci na logice, nie na wydajności ładowania.

---

## Intercept & Modify — modyfikacja żądań w locie

### Dodawanie nagłówków do istniejących żądań

```typescript
test('intercept — dodaj Correlation ID do każdego żądania', async ({ page }) => {
  const correlationId = `test-${Date.now()}`;
  
  await page.route('**/*', async (route) => {
    const headers = {
      ...route.request().headers(),
      'x-correlation-id': correlationId,
      'x-test-environment': 'ci',
    };
    
    // Puść żądanie dalej do prawdziwego serwera, ale z dodanymi nagłówkami
    await route.continue({ headers });
  });
  
  await page.goto('/dashboard');
  // Każde żądanie HTTP ma teraz dodane nagłówki
  // Przydatne do śledzenia w Kibana/Grafana
});
```

### Modyfikacja parametrów żądania

```typescript
test('intercept — zmień parametry żądania', async ({ page }) => {
  await page.route('**/api/products', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    
    // Zmień parametr category z 'all' na 'electronics'
    if (url.searchParams.get('category') === 'all') {
      url.searchParams.set('category', 'electronics');
    }
    
    // Puść zmodyfikowane żądanie pod nowym URL
    await route.continue({
      url: url.toString(),
    });
  });
  
  await page.goto('/products?category=all');
  // Faktycznie zostanie załadowane '?category=electronics'
});
```

### Nagrywanie i powtarzanie (Record & Replay)

```typescript
test('nagrywanie odpowiedzi API do pliku', async ({ page }) => {
  const responses: { url: string; body: unknown; status: number }[] = [];
  
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = request.url();
    
    // Najpierw puść żądanie do prawdziwego serwera (Record)
    await route.continue();
    
    // Po odpowiedzi — zapisz ją do tablicy (dla dalszego użycia)
    try {
      const response = await route.fetch();
      const body = await response.json();
      responses.push({ url, body, status: response.status() });
    } catch (e) {
      // Żądanie nie zwróciło JSON — pomijaj
    }
  });
  
  await page.goto('/products');
  await page.goto('/orders');
  await page.goto('/profile');
  
  // Zapisz nagrane odpowiedzi do pliku (do późniejszego replay)
  console.log(JSON.stringify(responses, null, 2));
  // Użyj tych danych do mocków w przyszłych testach
});
```

---

## Kiedy mockować, a kiedy nie — granica E2E

### Mockuj gdy:
- **Frontend jeszcze nie ma backendu** (backend w trakcie разработки).
- **Chcesz przetestować błąd 500/403/429/timeout** (trudne do wywołania w prawdziwej aplikacji).
- **Testujesz czysty frontend** (logikę UI niezależnie od backendu).
- **Potrzebujesz deterministycznych danych** (za każdym razem ten sam produkt, ta sama cena).
- **Chcesz przyspieszyć testy** (blokujesz ciężkie zasoby).

### Nie mockuj gdy:
- **To jest test E2E** — ma potwierdzić, że CAŁY system (front + back + baza) działa razem.
- **Testujesz integrację z zewnętrznym API** (Stripe, SendGrid, external SSO).
- **Chcesz wykryć regresję backendu** (zmiana w API psuje front — mock by to ukrył).
- **Testujesz krytyczne ścieżki** (płatności, logowanie, zakupy) — tu potrzebujesz prawdziwej integracji.

### Hybrydowe podejście

```typescript
test('test E2E z częściowym mockiem', async ({ page, request }) => {
  // 1. Stwórz środowisko przez API (prawdziwe dane)
  const user = await (await request.post('/api/users', {
    data: { email: `test.${Date.now()}@test.pl`, name: 'Test' },
  })).json();
  
  // 2. Zaloguj się przez prawdziwy flow
  await page.goto('/login');
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Hasło').fill('haslo123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  
  // 3. Mockuj tylko statyczne zasoby (nie krytyczne API)
  await page.route('**/fonts/**', route => route.abort());  // Fonty — nieistotne
  await page.route('**/analytics/**', route => route.abort()); // Analityka — nieistotne
  
  // 4. KRYTYCZNE API — prawdziwe, nie mockowane
  // Tu testujesz prawdziwą integrację front-back
  
  // Cleanup
  await request.delete(`/api/users/${user.id}`);
});
```

---

## Podsumowanie

1. **page.route()**: Przechwytuje żądania HTTP przed wykonaniem.
2. **fulfill()**: Zwraca własną odpowiedź (mock JSON).
3. **continue()**: Puści żądanie dalej z modyfikacją.
4. **abort()**: Blokuje żądanie (np. obrazy, trackery).
5. **Negative testing**: Symulacja błędów 500/403/429/offline/timeout.
6. **Granica mock/E2E**: Mockuj frontend, nie krytyczne integracje backendowe.

---

## Linki i źródła

- [Playwright Network Handling](https://playwright.dev/docs/network)
- [Mocking API Responses](https://playwright.dev/docs/api/class-apirequestcontext)
- [REST API mocking patterns](https://mmazzarolo.com/blog/2022-04-16-playwright-e2e-tests-with-mocked-apis/)
- [Mocking Best Practices](https://kentcdodds.com/blog/interface-segregation-principle-and-testing)