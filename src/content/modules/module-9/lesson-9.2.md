# Typowe problemy i rozwiązania

Awaria testu Playwright jest informacją diagnostyczną. Nie należy zaczynać od wydłużenia timeoutu albo dodania `waitForTimeout`. Najpierw trzeba ustalić klasę problemu: produkt, dane, lokator, synchronizacja, środowisko, konfiguracja, integracja zewnętrzna albo błąd w samym teście.

## 1. Timeout

Timeout oznacza, że oczekiwany warunek nie został spełniony w czasie. Przyczyny mogą być różne:

- zły locator;
- element jest zasłonięty;
- dane testowe nie istnieją;
- użytkownik ma złą rolę;
- backend zwraca błąd;
- aplikacja nadal się ładuje;
- test czeka na zły stan.

Zła reakcja:

```typescript
await page.waitForTimeout(10000);
```

Lepsza reakcja:

```typescript
await expect(page.getByRole('heading', { name: 'Wyniki wyszukiwania' })).toBeVisible();
await expect(page.getByRole('listitem')).toHaveCount(1);
```

## 2. Element not found

Jeżeli element nie istnieje, sprawdź:

- czy test jest na właściwym URL;
- czy użytkownik jest zalogowany;
- czy dane istnieją;
- czy locator odpowiada dostępności UI;
- czy aplikacja nie renderuje innego wariantu dla mobile/desktop;
- czy nie ma błędu w konsoli.

Praktyczny wzorzec:

```typescript
await expect(page, 'test powinien być na stronie zamówień').toHaveURL(/\/orders/);
await expect(page.getByRole('heading', { name: 'Zamówienia' })).toBeVisible();
```

Najpierw potwierdź kontekst, potem szukaj elementu szczegółowego.

## 3. Strict mode violation

Strict mode oznacza, że locator pasuje do wielu elementów, a akcja wymaga jednego.

Źle:

```typescript
await page.getByRole('button', { name: 'Usuń' }).click();
```

Lepiej:

```typescript
const row = page.getByRole('row').filter({ hasText: 'ORD-123' });
await row.getByRole('button', { name: 'Usuń' }).click();
```

Nie walcz ze strict mode. To mechanizm chroniący przed kliknięciem złego elementu.

## 4. Test działa lokalnie, pada w CI

Różnice CI vs lokalnie:

- wolniejsze CPU;
- inny system operacyjny;
- headless vs headed;
- brak fontów;
- inne zmienne środowiskowe;
- brak sekretów;
- większa równoległość;
- wolniejsze środowisko backendowe;
- brak zależności systemowych przeglądarek.

Diagnoza:

```bash
npx playwright test --trace=on
npx playwright show-report
```

W CI zawsze publikuj `playwright-report`, `test-results`, trace, screenshoty i video.

## 5. Problemy z autoryzacją

Objawy:

- test trafia na `/login` zamiast `/dashboard`;
- API zwraca 401/403;
- element admina nie istnieje;
- storage state wygasł.

Rozwiązania:

- użyj setup project;
- odśwież `storageState`;
- rozdziel role użytkowników;
- nie używaj jednego konta do testów równoległych;
- dodaj asercję po logowaniu.

## 6. Błędy sieci i API

Dla trudnych awarii zbieraj request/response:

```typescript
page.on('response', async response => {
  if (response.status() >= 500) {
    console.log(response.status(), response.url());
  }
});
```

W testach krytycznych możesz dodać `waitForResponse` i załącznik z odpowiedzią API.

## 7. Triage awarii

Minimalna procedura:

1. Otwórz HTML report.
2. Sprawdź pierwszy błąd i krok `test.step`.
3. Otwórz trace.
4. Sprawdź DOM, screenshot, network i console.
5. Ustal klasę problemu.
6. Dopiero potem napraw kod, dane albo produkt.

## 8. Checklista

- Czy test ma trace przy awarii?
- Czy komunikat błędu mówi, jaki stan był oczekiwany?
- Czy locator jest jednoznaczny?
- Czy dane są izolowane?
- Czy CI publikuje artefakty?
- Czy retry nie maskuje problemu?
- Czy problem zaklasyfikowano przed naprawą?

## Linki

- [Debugging tests](https://playwright.dev/docs/debug)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [Actionability](https://playwright.dev/docs/actionability)
- [Locators](https://playwright.dev/docs/locators)

## 9. Playwright Inspector i UI Mode w triage

Lokalnie użyj Inspector, gdy chcesz zatrzymać test i zobaczyć locatory:

```bash
PWDEBUG=1 npx playwright test tests/search.spec.ts
npx playwright test --debug
```

UI Mode jest dobry do analizy kroków, watch mode i szybkiego ponawiania testu:

```bash
npx playwright test --ui
```

Nie debuguj wyłącznie przez `console.log`. W Playwright masz trace, inspector, UI Mode, screenshoty, network i console logs.

## 10. Minimalny pakiet dowodów do błędu

Zgłoszenie awarii automatycznej powinno zawierać:

- nazwę testu i projekt przeglądarki;
- URL środowiska;
- commit;
- trace lub HTML report;
- dane testowe: runId, userId, orderId;
- correlation ID;
- klasyfikację: produkt/test/dane/środowisko.

Bez tych danych zespół traci czas na odtwarzanie problemu.

## 11. Debugowanie locatorów krok po kroku

Gdy locator nie działa, nie zgaduj. Użyj narzędzi:

```bash
npx playwright test --debug
npx playwright codegen http://localhost:3000
```

W Inspectorze sprawdź, czy element ma rolę i accessible name. Jeśli `getByRole` nie znajduje przycisku, możliwe, że komponent jest źle zbudowany dostępnościowo. Wtedy poprawka powinna trafić do aplikacji, nie tylko do testu.

Przykładowa kolejność diagnozy:

1. Sprawdź, czy jesteś na właściwej stronie.
2. Sprawdź, czy dane testowe istnieją.
3. Użyj Pick Locator.
4. Porównaj locator wygenerowany z intencją biznesową.
5. Jeśli locator jest zbyt ogólny, zawęź go przez kontener.

## 12. Debugowanie network w trace

Trace Viewer pokazuje requesty i response’y. Przy awarii UI sprawdź, czy API zwróciło poprawne dane. Jeśli UI nie pokazuje produktu, a `/api/products` zwróciło pustą listę, problemem nie jest locator.

Typowe pytania:

- Czy request został wysłany?
- Jaki był status HTTP?
- Czy body zawiera oczekiwane dane?
- Czy request miał właściwe cookies/token?
- Czy service worker nie zwrócił starego cache?

## 13. Debugowanie przez redukcję

Jeśli test jest duży, wyizoluj najmniejszy fragment, który nadal pada. Usuń kroki niepowiązane z awarią, przygotuj dane przez API i uruchom tylko jeden projekt przeglądarki. Redukcja zmniejsza liczbę hipotez i przyspiesza naprawę.

Diagnoza poprzedza każdą trwałą poprawkę.

## 📘 Suplement Inżynieryjny 2026: Debugowanie i Rozwiązywanie Problemów
*Inspiracja: „Hands-On Automated Testing with Playwright” (2026), Chapter 8*
*   **Diagnostyka Trace Viewer**: W przypadku awarii w CI, plik trace jest Twoim najważniejszym dowodem. Zawiera nagranie DOM, historię sieci, logi konsoli przeglądarki oraz zrzuty ekranu przed i po każdej akcji.
*   **UI Mode**: Wykorzystaj interaktywny tryb UI (`npx playwright test --ui`) do błyskawicznego pisania, debugowania i podróżowania w czasie (time-travel) w kodzie testów.
