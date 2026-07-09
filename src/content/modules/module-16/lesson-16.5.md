# Testowanie integracji zewnętrznych

> Moduł szesnasty dotyczy przypadków, które pojawiają się w dojrzałych projektach: kontenery, poczta, komunikacja w czasie rzeczywistym, testy komponentowe i integracje zewnętrzne. To tematy, w których granica systemu jest równie ważna jak sam kod testu.

## Jak czytać ten moduł

Czytaj ten moduł jak podręcznik kontroli środowiska i zależności. Im więcej usług, kontenerów, wiadomości i dostawców, tym ważniejsze stają się: gotowość środowiska, idempotencja, retry, diagnostyka i świadome rozróżnienie mocka od prawdziwej integracji.

Trzy zasady modułu:

1. **Środowisko musi być kontrolowane.** Test nie powinien zgadywać, czy baza, poczta albo zależność jest gotowa.
2. **Integracja musi mieć zakres.** Nie każdy test powinien używać prawdziwego dostawcy.
3. **Awaria jest scenariuszem.** Retry, fallback, idempotencja i komunikaty błędów są częścią jakości.


## Cel lekcji

Ta lekcja koncentruje się na: **webhooki, upload plików, integracje płatności, mapy, SMS, Circuit Breaker, zapasowy interfejs użytkownika i chaos testing**. Główne ryzyko: **testy zależą od prawdziwych usług zewnętrznych w każdym przebiegu albo całkowicie je mockują i nie wykrywają problemów integracji**. Po lekturze powinieneś umieć dobrać strategię testu do granicy systemu i zapewnić diagnostykę awarii zależności.

## Sytuacja przewodnia

aplikacja przyjmuje płatność, wysyła SMS, zapisuje webhook i pokazuje użytkownikowi zapasowy komunikat przy awarii dostawcy

## 1. Granica integracji

Najpierw określ, czy testujesz swoją aplikację, kontrakt z dostawcą, czy prawdziwą usługę. Każda odpowiedź prowadzi do innej strategii.

## 2. Webhooki

Webhook powinien mieć weryfikację podpisu, idempotencję i obsługę ponowień. Testuj duplikat oraz niepoprawną sygnaturę.

## 3. Płatności i SMS

Integracje płatności i SMS są kosztowne i często limitowane. Używaj sandboxów, mocków i ograniczonych testów end-to-end.

## 4. Circuit Breaker

Aplikacja powinna mieć zachowanie zapasowe, gdy dostawca jest niedostępny. Testuj komunikat, retry i brak podwójnego skutku.

## 5. Chaos testing

Chaos w testach integracji musi być kontrolowany. Symuluj awarię świadomie i tylko w środowisku, które jest na to przygotowane.

## Przykład referencyjny

```typescript
await page.route('**/api/payment-provider/**', async route => {
  await route.fulfill({
    status: 503,
    contentType: 'application/json',
    body: JSON.stringify({ message: 'provider unavailable' }),
  });
});

await page.goto('/checkout');
await page.getByRole('button', { name: 'Zapłać' }).click();
await expect(page.getByRole('alert')).toContainText('Płatność chwilowo niedostępna');
```

Przykład pokazuje, że specjalistyczne integracje wymagają jawnej kontroli środowiska i asercji skutku. Samo wywołanie usługi nie wystarcza.

## Lista kontrolna

- Czy środowisko ma healthcheck albo inny dowód gotowości?
- Czy test wie, czy używa mocka, sandboxa czy prawdziwej usługi?
- Czy scenariusz awarii jest testowany?
- Czy operacja jest idempotentna lub zabezpieczona przed duplikatem?
- Czy artefakty pozwolą zdiagnozować problem zależności?
- Czy test nie generuje kosztów lub efektów ubocznych poza środowiskiem testowym?


## Dobre praktyki i perspektywa inżynierska
Automatyzacja to proces ciągłego doskonalenia. Aby Twoje testy niosły realną wartość, stosuj się do poniższych zasad:
- **Testuj zachowanie, nie kod**: Skup się na tym, co widzi i robi użytkownik. Zmienne nazwy klas CSS nie powinny psuć Twoich testów.
- **Fail-fast**: Test powinien dawać jasny sygnał o błędzie tak szybko, jak to możliwe. Unikaj "wiszących" testów, które blokują kolejkę CI.
- **Ewoluuj**: Regularnie przeglądaj swoje testy. Usuwaj te, które są niestabilne i nie dają wartości, a refaktoryzuj te, które stają się zbyt skomplikowane.
