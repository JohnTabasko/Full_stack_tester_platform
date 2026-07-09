# Async/Await i Promises — TypeScript Mastery dla Playwright

> **Perspektywa Full Stack Testera**
> Większość problemów z testami Playwright wynika z niezrozumienia asynchroniczności. `page.goto()` nie kończy się "natychmiast" — zwraca Promise, które rozwiązuje się, gdy przeglądarka załaduje stronę. Jeśli nie rozumiesz, jak to działa, będziesz pisać testy, które "losowo" przechodzą lub padają, z komunikatami błędów, które wyglądają jak magia. Opanowanie async/await to fundament — bez niego nie będziesz w stanie pisać nawet prostego testu Playwright, a co dopiero zaawansowanych fixture'ów czy helperów. Ta lekcja zamienia Cię z kogoś, kto "klepie await" bez zrozumienia, w inżyniera, który świadomie projektuje asynchroniczne przepływy.

## Cel lekcji

Po ukończeniu tej lekcji rozumiesz model Promise w JavaScript/TypeScript, potrafisz używać async/await poprawnie i świadomie, znasz techniki równoległego wykonania (Promise.all, Promise.allSettled), rozumiesz obsługę błędów w kontekście asynchronicznym (try/catch, throw), potrafisz diagnozować problemy z "zagubionym await", i wiesz, jak projektować asynchroniczne helpery i fixture'y.

---

## Model Promise — co to jest i dlaczego istnieje

### Synchroniczność vs. Asynchroniczność

**Kod synchroniczny** — wykonuje się linia po linii, każda operacja czeka na poprzednią:

```typescript
// Synchroniczne (nie używaj takiego kodu w Playwright!)
const result = someCalculation(); // ← blokuje, czeka na wynik
console.log(result);              // ← wykonuje się po wyniku
```

**Kod asynchroniczny** — operacja "startuje" i zwraca kontrolę natychmiast, a wynik przychodzi później:

```typescript
// Asynchroniczne (typowe dla Playwright)
const promise = page.goto('/products'); // ← startuje, NIE blokuje
console.log('Rozpoczęto nawigację');      // ← wykonuje się NATYCHMIAST
const response = await promise;           // ← czeka na wynik
console.log('Strona załadowana');         // ← wykonuje się PO wyniku
```

### Dlaczego Playwright jest asynchroniczny?

Playwright steruje przeglądarką przez WebSocket (protokół CDP). Komunikacja przeglądarka ↔ kod testowy odbywa się przez sieć — nawet jeśli oba działają na tym samym komputerze. Dlatego każda operacja (goto, click, fill) jest opakowana w Promise.

### Anatomia Promise

```typescript
// Promise ma 3 stany:
// 1. Pending (w trakcie) — operacja jeszcze nie zakończona
// 2. Fulfilled (sukces) — operacja zakończona sukcesem, masz wynik
// 3. Rejected (błąd) — operacja zakończona błędem, masz błąd

// Prosty przykład Promise:
const promise = new Promise<string>((resolve, reject) => {
  setTimeout(() => {
    if (Math.random() > 0.3) {
      resolve('Sukces!');  // Udane zakończenie
    } else {
      reject(new Error('Błąd!')); // Nieudane zakończenie
    }
  }, 1000);
});

// Obserwowanie Promise:
promise
  .then(result => console.log('Wynik:', result))       // Fulfilled
  .catch(error => console.error('Błąd:', error));       // Rejected
  .finally(() => console.log('Koniec (zawsze)'));
```

### Łańcuch Promise (Promise chaining)

```typescript
// Łańcuch: operacja A → wynik → operacja B → wynik → operacja C
page.goto('/login')         // Promise<Response>
  .then(response => {       // response = HTTP Response
    console.log('Status:', response.status());
    return page.getByLabel('Email').fill('test@example.pl');
    // Każda operacja zwraca Promise, którą można "łańcuchować"
  })
  .then(() => page.getByLabel('Hasło').fill('haslo123'))
  .then(() => page.getByRole('button', { name: 'Zaloguj' }).click())
  .then(() => page.waitForURL('/dashboard'))
  .catch(error => console.error('Błąd w łańcuchu:', error));
```

**Problem z łańcuchami**: Gdy masz wiele poziomów `.then()`, kod staje się nieczytelny — przypomina "callback hell". Dlatego powstał async/await.

---

## Async/Await — syntetyczny cukier nad Promise

### Podstawy async/await

```typescript
// ✅ ASYNC/AWAIT — czytelny, sekwencyjny kod
async function loginFlow() {
  await page.goto('/login');                           // Poczekaj na nawigację
  await page.getByLabel('Email').fill('test@example.pl');  // Poczekaj na fill
  await page.getByLabel('Hasło').fill('haslo123');          // Poczekaj na fill
  await page.getByRole('button', { name: 'Zaloguj' }).click(); // Poczekaj na click
  await page.waitForURL('/dashboard');                      // Poczekaj na URL
  console.log('Zalogowano poprawnie');
}

// ❌ PROMISE CHAINING — nieczytelny przy zagnieżdżeniu
function loginFlow() {
  return page.goto('/login')
    .then(() => page.getByLabel('Email').fill('test@example.pl'))
    .then(() => page.getByLabel('Hasło').fill('haslo123'))
    .then(() => page.getByRole('button', { name: 'Zaloguj' }).click())
    .then(() => page.waitForURL('/dashboard'))
    .then(() => console.log('Zalogowano poprawnie'));
}
```

### Zasada: async function ZAWSZE zwraca Promise

```typescript
// Jeśli funkcja jest async, jej zwracana wartość jest opakowana w Promise
async function getTitle(): Promise<string> {
  const title = await page.title(); // title() zwraca Promise<string>
  return title;                     // Zwracasz string, ale funkcja zwraca Promise<string>
}

// Wywołanie:
const titlePromise = getTitle();  // Promise<string> — nie masz jeszcze wyniku!
const title = await getTitle();   // string — czekasz na rozwiązanie
```

### Await może być użyty TYLKO w funkcji async

```typescript
// ❌ Błąd kompilacji: 'await' is only allowed within an async function
await page.goto('/login');

// ✅ Poprawnie: funkcja jest async
async function main() {
  await page.goto('/login'); // OK — w async function
}

// ✅ W teście Playwright — funkcja testowa jest automatycznie async
test('użytkownik może się zalogować', async ({ page }) => {
  await page.goto('/login'); // OK — test() zwraca Promise, funkcja jest async
  // ...
});
```

---

## Najczęstszy błąd: Zapomniany await

### Diagnoza problemu

```typescript
// ❌ ZAPOMNIANY AWAIT — cichy zabójca testów!
test('użytkownik może się zalogować', async ({ page }) => {
  page.goto('/login');  // ← BRAK await! Funkcja "startuje" ale nie czekasz na wynik
  await page.getByLabel('Email').fill('test@example.pl');
  await page.getByLabel('Hasło').fill('haslo123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  
  // Problem: strona jeszcze może nie być załadowana!
  // page.getByLabel('Email') może szukać elementu na starej stronie (np. /)
  // Test "przechodzi" mimo, że nie zrobił tego, co powinien!
});

// ✅ POPRAWNIE
test('użytkownik może się zalogować', async ({ page }) => {
  await page.goto('/login'); // ← czekaj na zakończenie nawigacji!
  await page.getByLabel('Email').fill('test@example.pl');
  await page.getByLabel('Hasło').fill('haslo123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
});
```

### Jak ESLint wyłapuje brak await

```javascript
// .eslintrc.js — używaj reguły @typescript-eslint/await-thenable
module.exports = {
  rules: {
    '@typescript-eslint/await-thenable': 'error',  // Błąd gdy brak await na Promise
  }
};
```

Teraz kompilator/ESLint wyrzuci błąd na `page.goto('/login')` bez `await`.

### "Niemy" błąd vs. "Głośny" błąd

```typescript
// ❌ Niemym błąd: test przechodzi mimo błędu logicznego
test('czytaj bez await', async ({ page }) => {
  page.goto('/login');  // ← startuje, NIE czeka
  // ...
  await expect(page).toHaveURL('/dashboard'); // ← może przejść przypadkowo!
  // Strona zdążyła się załadować SZYBCIEJ niż test doszedł do asercji
  // Lub NIE zdążyła — test padnie z zagadkowym "timeout on URL check"
  // Nigdy nie wiesz dlaczego!
});

// ✅ Głośny błąd: test pada i wiesz dlaczego
test('czytaj z await', async ({ page }) => {
  await page.goto('/login'); // ← czekaj, aż strona będzie gotowa
  // ...
  await expect(page).toHaveURL('/dashboard');
  // Jeśli coś pójdzie nie tak — jasny błąd "URL mismatch"
});
```

---

## Obsługa błędów w async functions

### Try/Catch/Finally

```typescript
async function loginWithErrorHandling() {
  try {
    console.log('1. Rozpoczynam nawigację');
    await page.goto('/login');
    
    console.log('2. Wypełniam formularz');
    await page.getByLabel('Email').fill('test@example.pl');
    await page.getByLabel('Hasło').fill('haslo123');
    
    console.log('3. Klikam przycisk');
    await page.getByRole('button', { name: 'Zaloguj' }).click();
    
    console.log('4. Czekam na przekierowanie');
    await page.waitForURL('/dashboard', { timeout: 10000 });
    
    console.log('5. Weryfikuję dashboard');
    await expect(page.getByRole('heading', { name: 'Witaj!' })).toBeVisible();
    
    console.log('✅ Sukces — logowanie zakończone');
    
  } catch (error) {
    console.error('❌ Błąd:', error);
    
    // Zrób screenshot na błąd — pomoże w diagnostyce
    await page.screenshot({ path: `error-login-${Date.now()}.png` });
    
    // Rzuć błąd dalej, żeby test oznaczyć jako nieudany
    throw error;
    
  } finally {
    console.log('🧹 Cleanup — zawsze wykonuje się (nawet przy sukcesie)');
    // Np.: zamknięcie przeglądarki, cleanup sesji
  }
}
```

### Async error handling — specjalne przypadki Playwright

```typescript
test('opcjonalny element może nie istnieć', async ({ page }) => {
  await page.goto('/products');
  
  try {
    // Spróbuj kliknąć opcjonalny przycisk — może go nie być
    await page.getByRole('button', { name: 'Promocja' }).click({ timeout: 2000 });
    console.log('Przycisk "Promocja" istniał i został kliknięty');
  } catch (error) {
    // TimeoutError — element nie pojawił się w ciągu 2s
    console.log('Przycisk "Promocja" nie pojawił się — to OK, jest opcjonalny');
    // Kontynuuj test normalnie
  }
  
  // Reszta testu — nawet jeśli przycisk nie istniał
  await page.getByRole('button', { name: 'Do koszyka' }).click();
  await expect(page.getByText('Koszyk')).toBeVisible();
});
```

### Różnica między try/catch a notywnym błędem

```typescript
// ❌ Catch, który ukrywa problem (antywzorzec)
test('catch ukrywa problem', async ({ page }) => {
  try {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.pl');
    // ...dalej test
  } catch (error) {
    console.log('Jakiś błąd —无所谓, kontynuuję');
    // ❌ Problem: test przechodzi mimo błędu!
    // To jest "fałszywie zielony test" — wygląda jak sukces, ale nie jest
  }
});

// ✅ Catch, który loguje i rzuca dalej
test('catch loguje i rzuca dalej', async ({ page }) => {
  try {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.pl');
    // ...dalej test
  } catch (error) {
    console.error('Test padł. URL:', page.url());
    console.error('Correlation ID:', correlationId);
    throw error; // Rzuć dalej — test musi być oznaczony jako nieudany
  }
});
```

---

## Równoległe wykonanie — Promise.all, Promise.allSettled

### Promise.all — równoległe czekanie na wiele operacji

```typescript
// ❌ Sekwencyjnie — wolne (każda operacja czeka na poprzednią)
test('sekwencyjne ładowanie', async ({ page }) => {
  const start = Date.now();
  await page.goto('/products');        // 1s
  await page.goto('/orders');          // 1s  
  await page.goto('/profile');         // 1s
  // Total: ~3s
  console.log(`Łączny czas: ${Date.now() - start}ms`);
});

// ✅ Równolegle — szybkie (wszystkie na raz)
test('równoległe ładowanie', async ({ page }) => {
  const start = Date.now();
  await Promise.all([
    page.goto('/products'),  // startuje 1s
    page.goto('/orders'),    // startuje 1s
    page.goto('/profile'),   // startuje 1s
  ]);
  // Total: ~1s (maksymalny z trzech)
  console.log(`Łączny czas: ${Date.now() - start}ms`);
});
```

### Najczęstszy wzorzec: Równoległe oczekiwanie na nowe okno/tab

```typescript
test('kliknięcie otwiera nowe okno i można w nim działać', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Uruchom dwa processy równolegle:
  // 1. Poczekaj na zdarzenie "nowa strona/tab"
  // 2. Kliknij przycisk, który tę stronę otwiera
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),    // Poczekaj na otwarcie nowego taba
    page.getByRole('link', { name: 'Otwórz w nowej karcie' }).click(),
  ]);
  
  // Gdy Promise.all się zakończy, masz uchwyt do nowej strony
  await newPage.waitForLoadState('domcontentloaded');
  await expect(newPage.getByRole('heading', { name: 'Nowa Strona' })).toBeVisible();
  
  await context.close();
});
```

### Promise.allSettled — nawet gdy jeden padnie

```typescript
test('sprawdź wiele endpointów — nie przerywaj na błąd', async ({ request }) => {
  const results = await Promise.allSettled([
    request.get('/api/health'),
    request.get('/api/products'),
    request.get('/api/orders'),
    request.get('/api/users'),
  ]);
  
  // Sprawdź każdy wynik niezależnie od sukcesu/porażki
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === 'fulfilled') {
      console.log(`✅ Endpoint ${i}: ${result.value.status()}`);
    } else {
      console.log(`❌ Endpoint ${i}: ${result.reason}`);
      // Nie przerywa — sprawdza wszystkie
    }
  }
  
  // Tylko wtedy, gdy WSZYSTKIE muszą przejść:
  const allPassed = results.every(r => r.status === 'fulfilled');
  expect(allPassed).toBeTruthy();
});
```

---

## Await w pętlach — pułapki i rozwiązania

### Await w forEach — pułapka!

```typescript
// ❌ PROBLEM: forEach nie czeka na async!
test('zły wzorzec', async ({ page }) => {
  const buttons = await page.getByRole('button').all();
  
  buttons.forEach(async (button) => {
    // UWAGA: forEach NIE czeka na zakończenie async funkcji!
    await button.click();  // "Startuje" wszystkie kliknięcia na raz!
    console.log('Kliknięto');
  });
  
  // Ten console.log wykonuje się OD RAZU, nie po kliknięciach!
  // Test kończy się PRZED kliknięciami!
});

// ✅ POPRAWNIE: for...of czeka na każdą iterację
test('poprawny wzorzec', async ({ page }) => {
  const buttons = await page.getByRole('button').all();
  
  for (const button of buttons) {
    await button.click();  // Czeka na zakończenie przed następną iteracją
    console.log('Kliknięto');
  }
  
  // Dopiero po wszystkich kliknięciach
});

// ✅ RÓWNOLEGLE: Kliknij wszystkie na raz (jeśli to ma sens)
test('równoległe kliknięcia', async ({ page }) => {
  const buttons = await page.getByRole('button').all();
  
  await Promise.all(
    buttons.map(button => button.click())
  );
  // Wszystkie kliknięcia wykonują się równolegle
});
```

---

## Projektowanie async helperów i fixture'ów

### Async helper z cleanup

```typescript
// Helper asynchroniczny z automatycznym cleanup
async function createTestUser(request: APIRequestContext) {
  const email = `test.${Date.now()}@test.pl`;
  
  try {
    const response = await request.post('/api/users', {
      data: {
        email,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
      },
    });
    
    if (!response.ok()) {
      throw new Error(`Nie udało się stworzyć użytkownika: ${response.status()}`);
    }
    
    const user = await response.json();
    return user;
    
  } finally {
    // Cleanup — zawsze się wykonuje (sukces lub błąd)
    // Ale tylko jeśli użytkownik został stworzony...
  }
}

// Użycie:
test('test z helperem', async ({ request }) => {
  const user = await createTestUser(request);  // await — czekaj na wynik!
  
  // ... reszta testu
  
  // Cleanup jest w finally bloku helpera
});
```

### Async fixture z builder pattern

```typescript
import { test as base } from '@playwright/test';
import { faker } from '@faker-js/faker';

type OrderData = {
  id: string;
  reference: string;
  customerEmail: string;
  total: number;
};

export const testWithOrder = base.extend<{
  orderData: OrderData;
}>({
  orderData: async ({ request }, use) => {
    // Setup: stwórz zamówienie przez API
    const orderResponse = await request.post('/api/orders', {
      data: {
        reference: `QA_${faker.string.alphanumeric(8)}`,
        customerEmail: `test.${Date.now()}@test.pl`,
        items: [{ productId: 'PROD-001', quantity: 2 }],
        status: 'PENDING',
      },
    });
    
    if (!orderResponse.ok()) {
      throw new Error(`Setup failed: ${orderResponse.status()}`);
    }
    
    const order = await orderResponse.json();
    
    // Przekaż dane do testu
    await use(order);
    
    // Teardown: usuń zamówienie
    await request.delete(`/api/orders/${order.id}`).catch(() => {
      console.error(`Cleanup failed for order ${order.id}`);
    });
  },
});

// Użycie w teście:
testWithOrder('weryfikuj szczegóły zamówienia', async ({ page, orderData }) => {
  await page.goto(`/orders/${orderData.id}`);
  await expect(page.getByText(orderData.reference)).toBeVisible();
  await expect(page.getByText(`${orderData.total} zł`)).toBeVisible();
});
```

---

## Perspektywa Full Stack Testera — asynchroniczność jako fundament

Zrozumienie asynchroniczności to nie jest "opcjonalna wiedza" — to fundament Playwrighta. Wszystko w Playwright jest async: page operations, request API, fixture setup/teardown, waits, assertions. Gdy opanujesz to do perfekcji:
- Rozumiesz, dlaczego test "losowo" pada z TimeoutError.
- Potrafisz projektować asynchroniczne helpery i fixture'y.
- Umiesz optymalizować testy (równoległe vs. sekwencyjne).
- Potrafisz debugować problemy z Promise (np. "zagubione await").
- Piszesz kod, który jest jednocześnie poprawny i czytelny.

---

## Podsumowanie

1. **Promise**: Stan pending → fulfilled/rejected. Łańcuchy `.then()`.
2. **async/await**: Syntetyczny cukier — sekwencyjny, czytelny kod.
3. **Zapomniany await**: Najczęstsza przyczyna "flaky tests" — wykrywaj ESLintem.
4. **Try/Catch/Finally**: Obsługa błędów w funkcjach async.
5. **Promise.all**: Równoległe wykonanie wielu operacji.
6. **forEach vs. for...of**: forEach nie czeka na async — używaj for...of.
7. **Async fixtures**: Setup/teardown z async/await, builder pattern.

---

## Linki i źródła

- [JavaScript Async/Await — javascript.info](https://javascript.info/async-await)
- [MDN — Using Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)
- [Playwright — API Class Page](https://playwright.dev/docs/api/class-page)
- [TypeScript — Async Functions](https://www.typescriptlang.org/docs/handbook/functions.html#writing-async-functions)
- [Common Async/Await Mistakes — Robin Pokorny](https://javascript.plainenglish.io/common-javascript-async-await-mistakes-you-should-avoid-96f920d4df75)