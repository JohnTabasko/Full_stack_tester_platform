# Logowanie, monitoring i alerty

> Moduł dziewiąty uczy traktować awarię testu jak informację diagnostyczną, a nie przeszkodę do szybkiego obejścia. Debugowanie, stabilność i monitoring decydują o zaufaniu zespołu do automatyzacji.

## Jak czytać ten moduł

Czytaj ten moduł jak podręcznik pracy z niepewnością. Test może zawieść z powodu produktu, danych, środowiska, konfiguracji, synchronizacji, integracji zewnętrznej albo błędu w samym teście. Dojrzałość polega na szybkim rozróżnianiu tych klas problemów.

Trzy zasady modułu:

1. **Nie naprawiaj objawu bez diagnozy.** Dłuższy timeout rzadko jest prawdziwym rozwiązaniem.
2. **Artefakty są częścią testu.** Trace, screenshot, logi i odpowiedzi API muszą być dostępne wtedy, gdy test zawiedzie.
3. **Flaky test to defekt procesu.** Nie wolno go ignorować tylko dlatego, że czasem przechodzi.


## Cel lekcji

Ta lekcja koncentruje się na: **logi strukturalne, zbieranie metryk, alerty Slack, zbieranie console logów i integracja z CI**. Główne ryzyko: **awarie testów są widoczne dopiero jako czerwony pipeline, bez kontekstu, trendów i informacji, kogo należy powiadomić**. Po lekturze powinieneś umieć postawić hipotezę diagnostyczną, zebrać dowody i zaproponować naprawę przyczyny, nie tylko objawu.

## Sytuacja przewodnia

nocna regresja pada na wielu testach płatności i zespół musi szybko ustalić, czy to awaria aplikacji, bramki płatniczej czy danych

## 1. Logi strukturalne

Log strukturalny ma pola, które można filtrować: test, środowisko, correlation id, użytkownik testowy, status, czas. To lepsze niż luźny tekst.

## 2. Metryki

Metryki pokazują trendy: czas testów, liczba retry, najczęstsze awarie, flakiness rate, czas diagnostyki. Trend jest ważniejszy niż pojedynczy incydent.

## 3. Alerty

Alert powinien trafiać do właściwych osób i zawierać kontekst. Alert bez linku do raportu i artefaktów powoduje tylko hałas.

## 4. Console logs

Logi konsoli przeglądarki pomagają diagnozować błędy frontendu. Warto je zbierać przy awariach UI, ale nie zalewać nimi raportu bez potrzeby.

## 5. Integracja z CI

CI powinno publikować raporty, trace, screenshoty, wideo i dane diagnostyczne zawsze przy awarii. Bez artefaktów monitoring testów jest niepełny.

## Przykład referencyjny

```typescript
test('płatność ma kontekst diagnostyczny', async ({ page }, testInfo) => {
  const correlationId = `e2e-${crypto.randomUUID()}`;
  await page.context().setExtraHTTPHeaders({ 'x-correlation-id': correlationId });

  await testInfo.attach('correlation-id.txt', {
    body: correlationId,
    contentType: 'text/plain',
  });

  await page.goto('/checkout');
  await expect(page.getByRole('heading', { name: 'Płatność' })).toBeVisible();
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
