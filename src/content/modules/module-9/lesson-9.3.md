# Obsługa błędów i odzyskiwanie

Obsługa błędów w testach automatycznych nie polega na tym, aby test „jakoś przeszedł”. Test ma ujawnić problem, zostawić dowody i posprzątać zasoby. `try-catch`, retry, soft assertions i cleanup są narzędziami diagnostycznymi, a nie sposobem ukrywania defektów.

## 1. Kiedy używać try-catch

`try-catch` ma sens, gdy:

- dodajesz kontekst do błędu;
- załączasz artefakty;
- sprzątasz dane;
- zamieniasz techniczny błąd na komunikat domenowy;
- obsługujesz oczekiwany wariant negatywny.

Nie używaj `catch`, aby ignorować awarię:

```typescript
try {
  await page.getByRole('button', { name: 'Zapłać' }).click();
} catch {}
```

To ukrywa problem i tworzy fałszywie zielony test.

## 2. Dodawanie kontekstu

```typescript
try {
  await expect(page.getByText('Płatność przyjęta')).toBeVisible();
} catch (error) {
  throw new Error(`Nie potwierdzono płatności dla orderId=${order.id}: ${error}`);
}
```

Jeszcze lepiej: dodaj attachmenty przez `testInfo.attach`.

```typescript
await testInfo.attach('order-id', {
  body: order.id,
  contentType: 'text/plain',
});
```

## 3. Cleanup guarantee

Sprzątanie musi wykonać się także po awarii.

```typescript
test('zamówienie może zostać opłacone', async ({ page, request }) => {
  const createdOrderIds: string[] = [];

  try {
    const response = await request.post('/api/orders', { data: buildOrder() });
    const order = await response.json();
    createdOrderIds.push(order.id);

    await page.goto(`/orders/${order.id}`);
    await page.getByRole('button', { name: 'Opłać' }).click();
    await expect(page.getByRole('status')).toContainText('Opłacone');
  } finally {
    for (const orderId of createdOrderIds.reverse()) {
      await request.delete(`/api/orders/${orderId}`).catch(() => undefined);
    }
  }
});
```

W większym projekcie lepszy jest CleanupTracker albo cleanup po `runId`.

## 4. Retry z backoff

Retry ma sens dla operacji infrastrukturalnych, np. chwilowego 503 przy setupie danych. Nie powinien maskować błędów produktu.

```typescript
async function retry<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
    }
  }
  throw lastError;
}
```

Używaj ostrożnie i loguj, że retry wystąpiło.

## 5. Soft assertions

Soft assertions są dobre, gdy chcesz zebrać wiele niezależnych błędów:

```typescript
await expect.soft(page.getByTestId('name')).toHaveText('Jan');
await expect.soft(page.getByTestId('email')).toHaveText('jan@example.com');
await expect.soft(page.getByTestId('role')).toHaveText('Admin');
```

Nie używaj ich dla warunku, bez którego dalszy test jest bez sensu, np. brak zalogowania.

## 6. Circuit breaker w pipeline

Jeżeli zależność zewnętrzna masowo pada, warto odróżnić awarię środowiska od regresji produktu. Przykład: bramka płatnicza sandbox zwraca 503 dla wszystkich testów. Wtedy pipeline powinien pokazać jasny komunikat: „awaria zależności”, a nie 200 losowych błędów UI.

Można dodać szybki health check przed suite:

```typescript
const health = await request.get('/api/health/dependencies');
expect(health.status()).toBe(200);
```

## 7. Checklista

- Czy catch nie ukrywa błędu?
- Czy błąd zawiera kontekst domenowy?
- Czy cleanup działa w `finally` albo fixture teardown?
- Czy retry dotyczy infrastruktury, a nie błędu logiki?
- Czy soft assertions nie przepuszczają krytycznego błędu?
- Czy masowe awarie zależności są rozpoznawalne?

## Linki

- [Retries](https://playwright.dev/docs/test-retries)
- [Fixtures teardown](https://playwright.dev/docs/test-fixtures)
- [Assertions](https://playwright.dev/docs/test-assertions)
- [TestInfo attachments](https://playwright.dev/docs/api/class-testinfo)

## 8. `testInfo.attach` w bloku błędu

Jeśli wiesz, że dany fragment jest trudny diagnostycznie, dołącz dane zanim rzucisz błąd:

```typescript
try {
  await expect(page.getByRole('status')).toContainText('Opłacone');
} catch (error) {
  await testInfo.attach('payment-context.json', {
    body: JSON.stringify({ orderId: order.id, userId: user.id }, null, 2),
    contentType: 'application/json',
  });
  throw error;
}
```

Pamiętaj o maskowaniu sekretów.

## 9. Błędy oczekiwane vs nieoczekiwane

Scenariusz negatywny powinien jawnie oczekiwać błędu:

```typescript
const response = await request.post('/api/orders', { data: { items: [] } });
expect(response.status()).toBe(400);
```

Nie traktuj oczekiwanego błędu jako wyjątku infrastruktury. Test powinien jasno pokazywać, że błąd jest częścią kontraktu.

## 10. Cleanup w fixture teardown

Najczystszy cleanup często znajduje się w fixture:

```typescript
export const test = base.extend<{ testOrder: Order }>({
  testOrder: async ({ request }, use) => {
    const order = await createOrder(request, buildOrder());
    await use(order);
    await request.delete(`/api/orders/${order.id}`).catch(() => undefined);
  },
});
```

Test nie musi pamiętać o sprzątaniu, ale nadal widzi, że używa zasobu `testOrder`. Fixture nie powinna ukrywać złożonego flow biznesowego.

## 11. Odzyskiwanie po awarii środowiska

Niektóre błędy są infrastrukturalne: chwilowy 502, brak dostępności sandboxa, timeout bazy. Warto rozróżniać je od błędów produktu. Możesz oznaczać takie awarie w raporcie przez attachment lub annotation:

```typescript
testInfo.annotations.push({
  type: 'infra',
  description: 'payment sandbox returned 503 during setup',
});
```

Nie oznacza to, że test ma przejść. Oznacza to, że raport lepiej klasyfikuje przyczynę.

## 12. Nie łap błędów Playwright bez potrzeby

Playwright generuje dobre komunikaty błędów dla locatorów i asercji. Jeśli opakujesz wszystko w ogólny `try-catch`, możesz stracić szczegóły. Łap wyjątki tylko tam, gdzie dodajesz realny kontekst albo cleanup.

## 13. Idempotentne sprzątanie

Cleanup powinien być idempotentny. Jeśli usuwasz zasób, a on już nie istnieje, cleanup nie powinien powodować kolejnej awarii maskującej pierwotny problem.

```typescript
async function deleteOrderIfExists(request: APIRequestContext, orderId: string) {
  const response = await request.delete(`/api/orders/${orderId}`);
  expect([200, 204, 404]).toContain(response.status());
}
```

## 14. Odzyskiwanie po częściowym setupie

Najtrudniejsze są awarie w połowie setupu. Rejestruj cleanup natychmiast po utworzeniu każdego zasobu. Jeśli najpierw tworzysz usera, potem order, potem payment, każdy etap powinien dopisać własny cleanup. Dzięki temu nawet częściowy setup nie zaśmieci środowiska.

## 15. Zasada końcowa

Obsługa błędów ma zwiększać ilość informacji, a nie zmniejszać wiarygodność testu. Jeśli po dodaniu `try-catch` test częściej przechodzi, ale mniej mówi o problemie, rozwiązanie jest błędne.
