# Obsługa błędów i odzyskiwanie

> Moduł dziewiąty uczy traktować awarię testu jak informację diagnostyczną, a nie przeszkodę do szybkiego obejścia. Debugowanie, stabilność i monitoring decydują o zaufaniu zespołu do automatyzacji.

## Jak czytać ten moduł

Czytaj ten moduł jak podręcznik pracy z niepewnością. Test może zawieść z powodu produktu, danych, środowiska, konfiguracji, synchronizacji, integracji zewnętrznej albo błędu w samym teście. Dojrzałość polega na szybkim rozróżnianiu tych klas problemów.

Trzy zasady modułu:

1. **Nie naprawiaj objawu bez diagnozy.** Dłuższy timeout rzadko jest prawdziwym rozwiązaniem.
2. **Artefakty są częścią testu.** Trace, screenshot, logi i odpowiedzi API muszą być dostępne wtedy, gdy test zawiedzie.
3. **Flaky test to defekt procesu.** Nie wolno go ignorować tylko dlatego, że czasem przechodzi.


## Cel lekcji

Ta lekcja koncentruje się na: **try-catch z kontekstem, retry z backoff, soft assertions, gwarancja cleanupu i circuit breaker**. Główne ryzyko: **test łapie wyjątki po to, aby przejść mimo awarii, albo nie sprząta zasobów po błędzie setupu**. Po lekturze powinieneś umieć postawić hipotezę diagnostyczną, zebrać dowody i zaproponować naprawę przyczyny, nie tylko objawu.

## Sytuacja przewodnia

test tworzy zamówienie, rezerwuje płatność i musi posprzątać dane nawet wtedy, gdy asercja UI zawiedzie

## 1. Try-catch z intencją

`try-catch` ma sens, gdy dodaje kontekst, sprząta zasoby albo zamienia błąd na czytelniejszy komunikat. Nie powinien ukrywać defektu.

## 2. Retry z backoff

Ponowienie z narastającym opóźnieniem może pomóc przy chwilowej niedostępności zależności, ale nie może maskować błędów kontraktu lub logiki.

## 3. Soft assertions

Soft assertions pozwalają zebrać kilka błędów w jednym przebiegu, ale nie powinny być używane w krytycznych punktach, od których zależy dalszy scenariusz.

## 4. Cleanup guarantee

Sprzątanie powinno działać nawet po awarii testu. Najlepiej rejestrować utworzone zasoby natychmiast po ich utworzeniu.

## 5. Circuit breaker

Jeżeli zależność zewnętrzna masowo zawodzi, pipeline powinien umieć odróżnić awarię środowiska od regresji produktu i ograniczyć szum.

## Przykład referencyjny

```typescript
const createdOrderIds: string[] = [];

test.afterEach(async ({ request }) => {
  for (const orderId of createdOrderIds.reverse()) {
    await request.delete(`/api/orders/${orderId}`).catch((error) => {
      console.warn(`Nie udało się usunąć zamówienia ${orderId}:`, error);
    });
  }
});

test('zamówienie może zostać opłacone', async ({ page, request }) => {
  const order = await (await request.post('/api/orders', { data: { productId: 'book-1' } })).json();
  createdOrderIds.push(order.id);

  await page.goto(`/orders/${order.id}`);
  await page.getByRole('button', { name: 'Opłać' }).click();
  await expect(page.getByRole('status')).toContainText('Opłacone');
});
```

Przykład pokazuje, że diagnostyka powinna być projektowana przed awarią. Po awarii jest za późno na zgadywanie, jakie dane byłyby przydatne.

## Lista kontrolna

- Czy awaria zostawia trace lub inny artefakt diagnostyczny?
- Czy test ma czytelne kroki?
- Czy dane testowe są możliwe do odtworzenia?
- Czy problem można sklasyfikować: produkt, dane, test, środowisko, integracja?
- Czy retry nie ukrywa przyczyny?
- Czy alert lub raport prowadzi do właściciela problemu?


## Dobre praktyki i perspektywa inżynierska
Automatyzacja to proces ciągłego doskonalenia. Aby Twoje testy niosły realną wartość, stosuj się do poniższych zasad:
- **Testuj zachowanie, nie kod**: Skup się na tym, co widzi i robi użytkownik. Zmienne nazwy klas CSS nie powinny psuć Twoich testów.
- **Fail-fast**: Test powinien dawać jasny sygnał o błędzie tak szybko, jak to możliwe. Unikaj "wiszących" testów, które blokują kolejkę CI.
- **Ewoluuj**: Regularnie przeglądaj swoje testy. Usuwaj te, które są niestabilne i nie dają wartości, a refaktoryzuj te, które stają się zbyt skomplikowane.
