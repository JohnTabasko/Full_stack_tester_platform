# Wydajność i testy obciążeniowe API

Playwright może mierzyć czasy odpowiedzi API i wykrywać oczywiste regresje wydajnościowe, ale nie zastępuje narzędzi obciążeniowych takich jak k6, JMeter czy Gatling. W module Playwright celem jest nauczyć się, jak dodać lekkie asercje wydajnościowe do testów API i jak nie pomylić smoke performance z prawdziwym load testem.

## 1. Co Playwright robi dobrze

Playwright dobrze nadaje się do:

- sprawdzania, czy endpoint odpowiada w rozsądnym czasie;
- porównania prostego SLA dla krytycznego API;
- smoke testów po deployu;
- diagnostyki payloadu i nagłówków;
- setupu danych do testów UI;
- testów pojedynczych requestów w CI.

Nie nadaje się jako główne narzędzie do generowania tysięcy użytkowników i długich testów obciążeniowych.

## 2. Prosty pomiar czasu

```typescript
test('lista produktów odpowiada szybko', async ({ request }) => {
  const start = performance.now();
  const response = await request.get('/api/products');
  const duration = performance.now() - start;

  await expect(response).toBeOK();
  expect(duration).toBeLessThan(500);
});
```

Taka asercja powinna mieć rozsądny próg. Nie ustawiaj 50 ms, jeśli CI działa w zmiennych warunkach.

## 3. Progi jakości

Przykładowe progi:

- endpoint health: < 200 ms;
- krytyczny odczyt: < 500 ms;
- złożone wyszukiwanie: < 1500 ms;
- eksport raportu: osobny test async, nie zwykły request timeout.

Progi powinny wynikać z wymagań, SLO albo obserwacji produkcyjnych, nie z życzeń testera.

## 4. Percentyle zamiast pojedynczego wyniku

Pojedynczy request może być przypadkowo szybki albo wolny. Dla lekkiego smoke możesz wykonać kilka prób:

```typescript
const durations: number[] = [];

for (let i = 0; i < 5; i++) {
  const start = performance.now();
  const response = await request.get('/api/products');
  await expect(response).toBeOK();
  durations.push(performance.now() - start);
}

const max = Math.max(...durations);
expect(max).toBeLessThan(1000);
```

Do prawdziwych percentyli i obciążenia użyj k6/JMeter.

## 5. Payload size

Wydajność API to nie tylko czas. Zbyt duży payload spowalnia frontend.

```typescript
const response = await request.get('/api/products');
const body = await response.text();
expect(Buffer.byteLength(body, 'utf8')).toBeLessThan(200_000);
```

To dobre dla endpointów, które przypadkowo zaczynają zwracać za dużo danych.

## 6. Rate limiting i timeouty

Playwright może sprawdzić zachowanie przy rate limit:

```typescript
const response = await request.get('/api/search?q=test');
if (response.status() === 429) {
  expect(response.headers()['retry-after']).toBeTruthy();
}
```

Nie przeciążaj współdzielonego stagingu testami wydajnościowymi bez zgody zespołu. Możesz spowodować flaky tests u innych.

## 7. Kiedy użyć k6/JMeter

Użyj narzędzia load testing, gdy chcesz sprawdzić:

- wielu użytkowników równocześnie;
- throughput;
- percentyle p95/p99;
- soak test;
- stress test;
- spike test;
- limity infrastruktury;
- degradację pod obciążeniem.

Playwright testuje poprawność i lekkie progi. k6/JMeter testują zachowanie systemu pod obciążeniem.

## 8. Checklista

- Czy próg czasu jest uzasadniony?
- Czy test nie przeciąża środowiska?
- Czy mierzysz także rozmiar payloadu, jeśli ma znaczenie?
- Czy rozróżniasz smoke performance od load testu?
- Czy wynik w CI nie będzie losowo flaky?
- Czy prawdziwe testy obciążeniowe są w osobnym pipeline?

## Linki

- [Playwright API testing](https://playwright.dev/docs/api-testing)
- [Test limity czasu](https://playwright.dev/docs/test-limity czasu)
- [k6 documentation](https://grafana.com/docs/k6/latest/)
- [JMeter](https://jmeter.apache.org/)

## 9. Budżet wydajności API

Budżet wydajności to jawna granica akceptowalnego czasu lub rozmiaru odpowiedzi. Przykład:

```typescript
const apiBudget = {
  productsListMs: 700,
  productDetailsMs: 400,
  maxProductsPayloadBytes: 200_000,
};
```

Budżet powinien być uzgodniony z zespołem, a nie przypadkowo wpisany w test. Jeśli endpoint regularnie przekracza budżet, to sygnał do analizy, nie do automatycznego zwiększenia progu.

## 10. Oddziel performance smoke od regresji funkcjonalnej

Nie każdy test API powinien mierzyć czas. Jeśli w każdej asercji dodasz timing, suite stanie się niestabilna. Wybierz kilka krytycznych endpointów i uruchamiaj performance smoke w osobnym jobie albo jako osobną grupę tagów.

## 11. Flakiness testów wydajnościowych

Testy timingowe są podatne na szum CI. Aby ograniczyć flakiness:

- używaj rozsądnych progów;
- mierz kilka próbek;
- nie uruchamiaj ciężkich testów równolegle z pełną regresją;
- zapisuj metryki jako trend;
- nie traktuj jednego wolniejszego requestu jak dowodu regresji bez kontekstu.

## 12. Diagnostyka przekroczenia budżetu

Gdy endpoint przekroczy budżet, dołącz status, czas, rozmiar payloadu i correlation ID. Sam komunikat „było wolno” nie wystarczy do naprawy.

## 13. Testy wydajnościowe a dane

Wynik wydajności zależy od danych. Endpoint z dziesięcioma rekordami będzie szybszy niż z dziesięcioma tysiącami. Dlatego performance smoke powinien jasno określać dataset:

```typescript
const response = await request.get('/api/products?dataset=performance-smoke');
```

Jeśli dataset zmienia się losowo, trend wydajnościowy będzie mało wiarygodny.

## 14. Oddziel regresję wydajności od awarii funkcjonalnej

Jeśli endpoint zwraca 500, to nie jest problem wydajnościowy, tylko funkcjonalny lub infrastrukturalny. Test performance najpierw powinien sprawdzić sukces odpowiedzi, a dopiero potem analizować czas.

```typescript
await expect(response).toBeOK();
expect(duration).toBeLessThan(apiBudget.productsListMs);
```

## 15. Raportowanie metryk

Nawet jeśli test nie przekroczy progu, warto zapisać metrykę do raportu lub JSON. Trendy są bardziej wartościowe niż pojedynczy wynik.

## 16. Zasada końcowa

Playwright może pilnować lekkich budżetów API w CI, ale prawdziwą odpowiedź na pytanie „ile system wytrzyma” dają narzędzia load testing i obserwowalność produkcyjna.

Budżet wydajności ma sens tylko wtedy, gdy zespół na niego reaguje.

Metryki bez właściciela i trendu szybko stają się tylko szumem raportowym.

Koniec.
