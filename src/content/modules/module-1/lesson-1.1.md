# Czym jest Playwright?

Playwright to nowoczesny framework do testów end-to-end i automatyzacji przeglądarek rozwijany przez Microsoft. W praktyce nie jest to tylko „narzędzie do klikania po stronie”. Playwright Test dostarcza kompletny ekosystem dla testera automatyzującego: runner testów, fixtures, asercje web-first, izolację kontekstów, równoległość, raporty, trace viewer, codegen, testy API, emulację urządzeń i integrację z CI.

Dla Full Stack Testera najważniejsze jest zrozumienie, że Playwright pozwala testować aplikację z perspektywy użytkownika, ale jednocześnie daje dostęp do warstw technicznych: sieci, cookies, storage, API, wielu kontekstów, konsoli przeglądarki, plików, pobrań, geolokalizacji i uprawnień. To sprawia, że dobrze zaprojektowany test Playwright może łączyć UI, API i diagnostykę systemową w jednym kontrolowanym scenariuszu.

## 1. Co dokładnie dostajesz w Playwright Test

Oficjalna dokumentacja opisuje Playwright Test jako framework E2E dla nowoczesnych aplikacji webowych. W praktyce oznacza to kilka elementów działających razem:

- **test runner** — uruchamia testy, obsługuje projekty, retry, timeouty, workers i sharding;
- **fixtures** — przygotowują zasoby dla testów, np. `page`, `context`, `request`, zalogowanego użytkownika lub Page Object;
- **web-first assertions** — asercje automatycznie ponawiają sprawdzenie, aż UI osiągnie oczekiwany stan;
- **locators** — stabilny sposób znajdowania elementów, preferujący to, co widzi użytkownik;
- **auto-waiting** — Playwright przed akcją sprawdza, czy element jest gotowy do interakcji;
- **browser contexts** — izolowane sesje w ramach jednej przeglądarki;
- **trace viewer** — zapis wykonania testu z DOM, akcjami, siecią, konsolą i screenshotami;
- **API testing** — fixture `request` i `APIRequestContext` do testów backendu oraz przygotowania danych;
- **emulation** — urządzenia, viewport, locale, timezone, geolokalizacja, permissions, offline;
- **reporters** — HTML, list, dot, JSON, JUnit i własne reportery.

To ważne, bo początkujący często myślą o Playwright jak o Selenium z nową składnią. To błąd. Playwright jest pełnym środowiskiem testowym.

## 2. Playwright Test vs Playwright Library

W dokumentacji spotkasz dwa sposoby użycia Playwright:

1. **Playwright Test** — rekomendowany tryb dla testów automatycznych. Importujesz `test` i `expect` z `@playwright/test`.
2. **Playwright Library** — niższy poziom API do automatyzacji przeglądarki bez runnera Playwright Test.

Typowy test w Playwright Test:

```typescript
import { test, expect } from '@playwright/test';

test('użytkownik widzi stronę główną', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
```

Ten kod korzysta z runnera, fixture `page`, asercji `expect`, raportowania i konfiguracji. W większości projektów testerskich to jest właściwy punkt startu.

Przykład Playwright Library:

```typescript
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('https://example.com');
await browser.close();
```

Ten tryb ma sens dla skryptów automatyzacyjnych, crawlerów, narzędzi wewnętrznych albo niestandardowych integracji. Do testów komercyjnych zwykle wybieraj Playwright Test.

## 3. Architektura: Browser, BrowserContext, Page

Podstawowa hierarchia Playwright to:

```text
Browser
  BrowserContext
    Page
```

### Browser

`Browser` to proces przeglądarki, np. Chromium, Firefox albo WebKit. Uruchomienie przeglądarki jest względnie kosztowne, dlatego Playwright może używać jednego procesu dla wielu izolowanych kontekstów.

### BrowserContext

`BrowserContext` to izolowana sesja, podobna do osobnego profilu incognito. Ma własne cookies, localStorage, sessionStorage, permissions i storage state. To jeden z kluczowych powodów, dla których Playwright dobrze nadaje się do testów równoległych.

Przykład dwóch użytkowników w jednym teście:

```typescript
const adminContext = await browser.newContext({ storageState: 'playwright/.auth/admin.json' });
const userContext = await browser.newContext({ storageState: 'playwright/.auth/user.json' });

const adminPage = await adminContext.newPage();
const userPage = await userContext.newPage();
```

Dzięki temu możesz testować scenariusze typu: administrator zmienia status zamówienia, a użytkownik widzi aktualizację w swoim panelu.

### Page

`Page` to karta przeglądarki. Większość testów zaczyna się od fixture `page`, ponieważ runner tworzy stronę automatycznie.

## 4. Silniki przeglądarek

Playwright obsługuje trzy główne silniki:

- **Chromium** — baza Chrome, Edge i wielu innych przeglądarek;
- **Firefox** — silnik Gecko;
- **WebKit** — silnik Safari.

To nie oznacza, że zawsze testujesz dokładnie aplikację użytkownika końcowego z jego konkretną wersją przeglądarki, ale dostajesz bardzo dobre pokrycie różnic silników renderujących. Szczególnie ważny jest WebKit, bo pozwala wcześnie wykrywać problemy charakterystyczne dla Safari.

## 5. Dlaczego Playwright ogranicza flaky tests

Flaky test to test, który czasem przechodzi, a czasem pada bez zmiany w kodzie. Playwright ogranicza ten problem przez trzy mechanizmy.

### Auto-waiting

Przed kliknięciem Playwright sprawdza, czy element jest widoczny, stabilny, aktywny, niezasłonięty i gotowy do interakcji. Dlatego w większości przypadków nie potrzebujesz `waitForTimeout`.

```typescript
await page.getByRole('button', { name: 'Zapisz' }).click();
```

Ten jeden `click()` zawiera w sobie oczekiwanie na stan elementu.

### Web-first assertions

```typescript
await expect(page.getByText('Zapisano zmiany')).toBeVisible();
```

Asercja będzie ponawiana przez określony czas. To lepsze niż ręczne czekanie, bo test czeka na rezultat, który ma znaczenie biznesowe.

### Izolacja kontekstów

Każdy test może dostać świeży kontekst, więc cookies i storage nie przeciekają między testami.

## 6. Porównanie z Selenium i Cypress

### Selenium

Selenium używa WebDriver i jest dojrzałym standardem automatyzacji. Jego zaletą jest szerokie wsparcie, ale historycznie wymagało więcej ręcznej synchronizacji i konfiguracji driverów.

### Cypress

Cypress działa bardzo wygodnie dla wielu aplikacji frontendowych, ale ma inne ograniczenia architektoniczne, szczególnie przy wielu kartach, wielu domenach, pełnej kontroli kontekstów i scenariuszach cross-browser.

### Playwright

Playwright został zaprojektowany dla nowoczesnego webu: SPA, wielu przeglądarek, wielu kontekstów, testów równoległych, CI i diagnostyki. Jego przewaga nie polega na tym, że „klika szybciej”, tylko na tym, że zapewnia lepszy model synchronizacji i izolacji.

## 7. Co Playwright testuje dobrze, a czego nie zastępuje

Playwright świetnie nadaje się do:

- testów krytycznych ścieżek użytkownika;
- smoke i regression E2E;
- testów UI z prawdziwą przeglądarką;
- testów integrujących UI i API;
- walidacji ról, sesji, cookies i storage;
- podstawowej dostępności i regresji wizualnej;
- testów API wspierających setup i teardown;
- diagnostyki błędów widocznych w przeglądarce.

Playwright nie zastępuje wszystkiego:

- testów jednostkowych logiki biznesowej;
- testów kontraktowych między usługami;
- testów obciążeniowych typu k6/JMeter;
- pełnych testów penetracyjnych;
- monitoringu produkcyjnego;
- ręcznej eksploracji UX.

Full Stack Tester musi umieć dobrać poziom testu do ryzyka. Playwright jest mocnym narzędziem, ale nie powinien być jedyną warstwą jakości.

## 8. Pierwszy mentalny model testu Playwright

Dobry test Playwright odpowiada na pytania:

1. Jaki użytkownik wykonuje akcję?
2. Jaki stan początkowy jest potrzebny?
3. Jaką akcję wykonuje użytkownik?
4. Jaki rezultat powinien zobaczyć?
5. Jakie artefakty pomogą zdiagnozować awarię?
6. Czy test może działać równolegle z innymi?

Przykład:

```typescript
import { test, expect } from '@playwright/test';

test('zalogowany użytkownik widzi swoje zamówienia', async ({ page }) => {
  await page.goto('/orders');
  await expect(page.getByRole('heading', { name: 'Moje zamówienia' })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Lista zamówień' })).toBeVisible();
});
```

To prosty test, ale ma jasny cel, czytelne locatory i asercje opisujące zachowanie aplikacji.

## 9. Najważniejsze zasady na start

- Używaj Playwright Test, nie surowego API, jeśli piszesz testy.
- Preferuj locatory użytkownika: role, label, text, test id.
- Nie używaj `waitForTimeout` jako domyślnego rozwiązania.
- Izoluj dane i sesje.
- Włącz trace, screenshoty i raport HTML w rozsądnej konfiguracji.
- Pisz testy tak, aby raport był zrozumiały dla zespołu.
- Traktuj testy jak kod produkcyjny: review, refaktor, typy, standardy.

## Linki

- [Playwright Introduction](https://playwright.dev/docs/intro)
- [Writing tests](https://playwright.dev/docs/writing-tests)
- [Locators](https://playwright.dev/docs/locators)
- [Auto-waiting / Actionability](https://playwright.dev/docs/actionability)
- [Best practices](https://playwright.dev/docs/best-practices)
