# Asercje ogólne — matchery `expect` dla danych, obiektów i błędów

Nie każda asercja w Playwright dotyczy widocznego elementu na stronie. Full Stack Tester często sprawdza dane zwrócone przez API, wynik działania helpera, obiekt domenowy, payload eventu, zawartość pliku albo błąd walidacji. Do tego służą asercje ogólne, czyli matchery `expect` dla wartości JavaScript/TypeScript.

Najważniejsze pytanie brzmi: **co dokładnie jest kontraktem?** Czy liczy się pełna struktura obiektu, tylko kilka pól, kolejność elementów, typ wartości, format daty, czy fakt rzucenia błędu?

## 1. `toBe` — wartości prymitywne i tożsamość

```typescript
expect(response.status()).toBe(200);
expect(order.status).toBe('PAID');
expect(isValid).toBe(true);
```

`toBe` używa porównania podobnego do `Object.is`. Jest idealne dla stringów, liczb, booleanów i `null`/`undefined`.

Nie używaj `toBe` do porównywania obiektów:

```typescript
expect({ status: 'PAID' }).toBe({ status: 'PAID' }); // źle
```

Dwa obiekty o tej samej zawartości nadal są różnymi referencjami.

## 2. `toEqual` i `toStrictEqual`

```typescript
expect(order).toEqual({
  id: 'ORD-123',
  status: 'PAID',
  total: 120,
});
```

`toEqual` porównuje strukturę. `toStrictEqual` jest bardziej rygorystyczne: rozróżnia m.in. brak pola od pola z `undefined`.

```typescript
expect({ a: undefined }).toEqual({});       // może przejść w zależności od semantyki matcherów
expect({ a: undefined }).toStrictEqual({}); // nie powinno przejść
```

W testach kontraktu API pełne `toStrictEqual` ma sens tylko wtedy, gdy naprawdę chcesz zamrozić całą odpowiedź. W wielu przypadkach lepsze są asercje częściowe.

## 3. Asercje częściowe obiektów

API często zwraca pola techniczne: `createdAt`, `updatedAt`, `links`, `metadata`, `traceId`. Test nie zawsze powinien wiązać się z każdym polem.

```typescript
expect(order).toEqual(expect.objectContaining({
  id: expect.any(String),
  status: 'PAID',
  totalGross: expect.any(Number),
  currency: 'PLN',
}));
```

Albo:

```typescript
expect(order).toMatchObject({
  status: 'PAID',
  customer: {
    email: 'jan@example.com',
  },
});
```

To sprawdza pola ważne dla scenariusza bez stabilizowania całego obiektu.

## 4. Typy dynamiczne

```typescript
expect(order.id).toEqual(expect.any(String));
expect(order.totalGross).toEqual(expect.any(Number));
expect(order.items).toEqual(expect.any(Array));
```

`expect.any()` jest dobre dla pól dynamicznych, ale nie wystarczy, jeśli format ma znaczenie. Dla ID albo daty lepiej dodać regex.

```typescript
expect(order.id).toMatch(/^ORD-[0-9]+$/);
expect(order.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
```

## 5. Tablice: kolejność czy zawartość?

Jeśli kolejność jest kontraktem, użyj `toEqual`:

```typescript
expect(statuses).toEqual(['NEW', 'PAID', 'SHIPPED']);
```

Jeśli ważna jest obecność elementów, a kolejność nie:

```typescript
expect(user.roles).toEqual(expect.arrayContaining(['ADMIN', 'BILLING']));
```

Dla tablic obiektów:

```typescript
expect(order.items).toEqual(expect.arrayContaining([
  expect.objectContaining({ sku: 'BOOK-1', quantity: 1 }),
]));
```

Nie używaj `arrayContaining`, jeśli testujesz sortowanie. Wtedy kolejność jest sednem testu.

## 6. Stringi i regex

```typescript
expect(message).toContain('Niepoprawne hasło');
expect(invoiceNumber).toMatch(/^FV\/2026\/\d+$/);
expect(email).toMatch(/^[^@]+@[^@]+\.[^@]+$/);
```

Regex nie powinien być zbyt szeroki. `/.+/` prawie niczego nie sprawdza.

## 7. Liczby

```typescript
expect(total).toBeGreaterThan(0);
expect(discount).toBeGreaterThanOrEqual(0);
expect(taxRate).toBeCloseTo(0.23, 2);
```

Dla pieniędzy unikaj porównań floatów bez tolerancji, jeśli wartości są wynikiem obliczeń zmiennoprzecinkowych. W systemach finansowych preferuj grosze/cents jako liczby całkowite.

## 8. Błędy synchroniczne i asynchroniczne

Kod synchroniczny:

```typescript
function parseAmount(value: string) {
  if (!/^\d+\.\d{2}$/.test(value)) throw new Error('Invalid amount');
  return Number(value);
}

expect(() => parseAmount('abc')).toThrow('Invalid amount');
```

Kod asynchroniczny:

```typescript
await expect(api.createOrder({ items: [] })).rejects.toThrow(/validation/i);
```

Nie pisz:

```typescript
expect(async () => api.createOrder({})).toThrow(); // źle
```

To częsty błąd — `toThrow` nie sprawdza odrzuconej obietnicy w taki sposób.

## 9. `expect.soft` dla danych

Soft assertions działają również dla zwykłych wartości:

```typescript
expect.soft(order.status).toBe('PAID');
expect.soft(order.currency).toBe('PLN');
expect.soft(order.totalGross).toBeGreaterThan(0);
```

To przydatne w walidacji raportów i dużych struktur, gdy chcesz zobaczyć kilka błędów naraz. Nie stosuj soft assertions, jeśli dalsze kroki zależą od krytycznego warunku.

## 10. `expect.poll` i `expect.toPass`

Czasem oczekiwany stan pojawia się poza UI, np. w API po procesie asynchronicznym.

```typescript
await expect.poll(async () => {
  const response = await request.get('/api/orders/ORD-123');
  const order = await response.json();
  return order.status;
}).toBe('PAID');
```

`expect.toPass` pozwala ponawiać blok asercji:

```typescript
await expect(async () => {
  const response = await request.get('/api/orders/ORD-123');
  expect(response.status()).toBe(200);
  const order = await response.json();
  expect(order.status).toBe('PAID');
}).toPass({ timeout: 30_000 });
```

To dobre dla eventual consistency, kolejek, webhooków i procesów backendowych.

## 11. Antywzorce

- `expect(true).toBeTruthy()` po akcji.
- Pełne porównanie obiektu API, gdy istotne są tylko trzy pola.
- `arrayContaining` w teście sortowania.
- Zbyt szeroki regex.
- Mylenie `toThrow` z `rejects.toThrow`.
- Ignorowanie typu i formatu pól dynamicznych.
- Brak komunikatu przy trudnej asercji domenowej.

## 12. Checklista asercji ogólnych

- Czy matcher odpowiada intencji kontraktu?
- Czy porównujesz pełny obiekt tylko wtedy, gdy to potrzebne?
- Czy pola dynamiczne są sprawdzane przez typ lub format?
- Czy kolejność tablicy jest ważna?
- Czy błędy async są sprawdzane przez `rejects`?
- Czy `expect.poll`/`toPass` ma sens dla procesu asynchronicznego?
- Czy asercja nie jest zbyt słaba ani zbyt krucha?

## Linki

- [Assertions](https://playwright.dev/docs/test-assertions)
- [GenericAssertions API](https://playwright.dev/docs/api/class-genericassertions)
- [Jest Expect](https://jestjs.io/docs/expect)
- [API testing](https://playwright.dev/docs/api-testing)

## 13. Asymmetric matchers

Asymmetric matchers pomagają sprawdzać tylko istotne fragmenty danych:

```typescript
expect(order).toEqual(expect.objectContaining({
  id: expect.any(String),
  status: 'PAID',
  total: expect.any(Number),
}));
```

To dobre dla API, które zwraca dynamiczne pola, np. `createdAt`, `updatedAt`, `requestId`.

## 14. Własny komunikat asercji

W trudnych przypadkach dodaj opis:

```typescript
expect(order.total, 'suma zamówienia po rabacie powinna być dodatnia').toBeGreaterThan(0);
```

Komunikat powinien wyjaśniać intencję domenową, nie powtarzać matcher.

## 15. Snapshoty danych — ostrożnie

Snapshot dużego obiektu bywa wygodny, ale często stabilizuje zbyt dużo szczegółów. Preferuj jawne asercje pól ważnych dla kontraktu. Snapshot ma sens dla stabilnych struktur, które są reviewowane i nie zawierają danych losowych.

## 16. Zasada końcowa

Asercje ogólne są najmocniejsze, gdy wyrażają kontrakt danych: typ, format, wymagane pola, kolejność i obsługę błędów. Nie porównuj więcej, niż wymaga scenariusz.
