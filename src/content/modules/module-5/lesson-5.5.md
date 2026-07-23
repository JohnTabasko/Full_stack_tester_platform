# Organizacja testów, tagowanie i adnotacje — jak utrzymać duży projekt Playwright

Gdy projekt ma kilkanaście testów, organizacja wydaje się mało ważna. Gdy ma kilkaset lub kilka tysięcy testów, struktura katalogów, nazewnictwo, tagi, adnotacje i reguły uruchamiania decydują o tym, czy zespół ufa automatyzacji.

Dobra organizacja odpowiada na pytania:

- gdzie dodać nowy test?
- jak uruchomić tylko smoke tests?
- które testy są krytyczne dla release?
- które testy są wolne albo niestabilne?
- kto jest właścicielem danego obszaru?
- jakie testy mają działać w pull request, nightly i przed produkcją?

## 1. Proponowana struktura projektu

Nie istnieje jedna idealna struktura, ale w projektach Playwright dobrze sprawdza się podział według odpowiedzialności.

```text
tests/
  fixtures/
    base-test.ts
    auth.fixture.ts
    api.fixture.ts
    pages.fixture.ts
  pages/
    LoginPage.ts
    CheckoutPage.ts
    AdminProductsPage.ts
  specs/
    smoke/
      login.spec.ts
      checkout.spec.ts
    regression/
      account.spec.ts
      discounts.spec.ts
    api/
      products.api.spec.ts
      orders.api.spec.ts
    visual/
      product-card.visual.spec.ts
  test-data/
    users.ts
    products.ts
  utils/
    run-id.ts
    cleanup.ts
playwright.config.ts
```

Alternatywnie można organizować testy domenowo:

```text
tests/
  checkout/
    checkout.spec.ts
    checkout.fixtures.ts
    CheckoutPage.ts
  account/
    account.spec.ts
    AccountPage.ts
  admin/
    products.spec.ts
    AdminProductsPage.ts
```

Wybór zależy od zespołu. Najważniejsze, aby był spójny.

## 2. Nazewnictwo testów

Nazwa testu powinna opisywać zachowanie biznesowe, a nie tylko techniczny krok.

Słabo:

```typescript
test('click button', async ({ page }) => {});
```

Lepiej:

```typescript
test('gość może dodać produkt do koszyka z karty produktu', async ({ page }) => {});
```

Dobra nazwa ma trzy cechy:

1. mówi, kto wykonuje akcję;
2. mówi, jaki rezultat biznesowy jest oczekiwany;
3. jest zrozumiała w raporcie bez otwierania kodu.

## 3. `test.describe` jako struktura, nie dekoracja

`test.describe` grupuje testy logicznie. Używaj go do obszarów funkcjonalnych, wariantów albo kontekstu.

```typescript
import { test, expect } from '../fixtures/base-test';

test.describe('Checkout / płatność kartą', () => {
  test.beforeEach(async ({ checkoutPage }) => {
    await checkoutPage.openWithProduct('Laptop');
  });

  test('klient może zapłacić poprawną kartą @smoke @payments', async ({ checkoutPage }) => {
    await checkoutPage.payByCard('4111111111111111');
    await checkoutPage.expectSuccess();
  });

  test('klient widzi błąd dla odrzuconej karty @regression @payments', async ({ checkoutPage }) => {
    await checkoutPage.payByCard('4000000000000002');
    await checkoutPage.expectPaymentDeclined();
  });
});
```

Nie nadużywaj `beforeEach`. Jeżeli setup jest złożony albo domenowy, często lepsza będzie fixture.

## 4. Tagi w Playwright

Playwright obsługuje tagi w nazwach testów oraz w szczegółach testu.

Najprostszy wariant:

```typescript
test('użytkownik może się zalogować @smoke @auth', async ({ page }) => {
  // ...
});
```

Uruchomienie testów po tagu:

```bash
npx playwright test --grep @smoke
npx playwright test --grep "@smoke|@critical"
npx playwright test --grep-invert @slow
```

Nowszy, czytelniejszy wariant to tagi w obiekcie szczegółów:

```typescript
test('użytkownik może się zalogować', {
  tag: ['@smoke', '@auth'],
}, async ({ page }) => {
  // ...
});
```

Tagi powinny mieć zdefiniowane znaczenie. Nie dodawaj `@important`, jeśli nikt nie wie, czym różni się od `@critical`.

## 5. Przykładowa taksonomia tagów

| Tag | Znaczenie | Kiedy uruchamiać |
|---|---|---|
| `@smoke` | krytyczne scenariusze potwierdzające, że system działa | każdy PR, deploy |
| `@regression` | szerszy zestaw testów regresji | nightly, przed release |
| `@critical` | przepływy o wysokim ryzyku biznesowym | PR dla danego obszaru, release |
| `@payments` | obszar płatności | zmiany w płatnościach |
| `@auth` | logowanie, sesje, role | zmiany w auth/security |
| `@slow` | testy długie | nightly, poza szybkim PR |
| `@visual` | testy screenshot/snapshot | osobny pipeline visual |
| `@api` | testy API | PR backendowy i nightly |
| `@flaky` | tymczasowa kwarantanna | nie jako stałe rozwiązanie |

Tag `@flaky` nie powinien być śmietnikiem. Każdy taki test musi mieć ticket naprawczy.

## 6. Adnotacje: `skip`, `fixme`, `fail`, `slow`

Playwright ma wbudowane adnotacje sterujące zachowaniem testu.

### `test.skip`

```typescript
test.skip(({ browserName }) => browserName === 'webkit', 'Funkcja nie jest wspierana w WebKit');
```

Używaj `skip`, gdy test nie ma sensu w danym wariancie, np. funkcja nie jest wspierana.

### `test.fixme`

```typescript
test.fixme('BUG-1234: koszyk traci rabat po odświeżeniu');
```

`fixme` oznacza znany problem, który powinien zostać naprawiony. Nie zostawiaj go bez identyfikatora błędu.

### `test.fail`

```typescript
test.fail(({ browserName }) => browserName === 'firefox', 'BUG-2345: znany błąd w Firefox');
```

Test ma obecnie prawo się wywalić. Jeśli nagle przejdzie, Playwright zgłosi to jako niespodziewany wynik — to sygnał, że błąd mógł zostać naprawiony.

### `test.slow`

```typescript
test.slow();
```

`slow` wydłuża timeout testu. Używaj tylko tam, gdzie scenariusz naprawdę jest długi, a nie jako plaster na niestabilność.

## 7. Adnotacje własne i metadane

Można dodawać własne adnotacje do raportu:

```typescript
test('checkout kartą', async ({ page }, testInfo) => {
  testInfo.annotations.push({
    type: 'risk',
    description: 'critical revenue flow',
  });

  testInfo.annotations.push({
    type: 'owner',
    description: 'team-payments',
  });
});
```

To pomaga w raportach i analizie wyników.

## 8. `test.step` jako czytelność raportu

Dobrze zorganizowany test ma kroki widoczne w raporcie i trace viewerze.

```typescript
test('klient składa zamówienie @smoke', async ({ page }) => {
  await test.step('Dodanie produktu do koszyka', async () => {
    await page.goto('/products/laptop');
    await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  });

  await test.step('Przejście przez checkout', async () => {
    await page.getByRole('link', { name: 'Koszyk' }).click();
    await page.getByRole('button', { name: 'Zamów' }).click();
  });

  await test.step('Weryfikacja potwierdzenia', async () => {
    await expect(page.getByText('Dziękujemy za zamówienie')).toBeVisible();
  });
});
```

`test.step` nie powinien zastępować dobrych nazw metod Page Object. Jego celem jest diagnostyka i czytelny raport.

## 9. Selekcja testów w CLI

Najważniejsze komendy:

```bash
# konkretny plik
npx playwright test tests/specs/smoke/login.spec.ts

# test po nazwie
npx playwright test -g "użytkownik może się zalogować"

# tag
npx playwright test --grep @smoke

# wykluczenie tagu
npx playwright test --grep-invert @slow

# projekt
npx playwright test --project=chromium

# headed
npx playwright test --headed

# UI mode
npx playwright test --ui

# debug
npx playwright test --debug
```

To powinno być znane każdej osobie pracującej z projektem.

## 10. Mapowanie tagów na pipeline CI

Przykładowa strategia:

| Pipeline | Komenda | Cel |
|---|---|---|
| Pull Request | `npx playwright test --grep @smoke` | szybka informacja zwrotna |
| PR dla backendu | `npx playwright test --grep "@smoke|@api"` | UI smoke + API |
| Nightly | `npx playwright test --grep-invert @manual` | pełna regresja |
| Release candidate | `npx playwright test --grep "@critical|@payments|@auth"` | obszary wysokiego ryzyka |
| Visual | `npx playwright test --grep @visual` | snapshoty i screenshoty |

Tagi są kontraktem między kodem testów a pipeline CI.

## 11. Kwarantanna testów niestabilnych

Jeśli test jest flaky, nie powinien blokować wszystkich prac w nieskończoność, ale nie wolno go też ignorować.

Dobra procedura:

1. oznacz test `@flaky` albo `test.fixme` z numerem ticketu;
2. dodaj właściciela;
3. zbierz trace/video/screenshot;
4. zdecyduj, czy problem leży w teście, aplikacji czy środowisku;
5. ustaw termin naprawy;
6. usuń tag po naprawie.

Zła procedura: zwiększyć timeout i zapomnieć.

## 12. Właścicielstwo i dokumentacja

W dużych projektach warto dodać metadane:

```typescript
test('zwrot płatności', {
  tag: ['@payments', '@critical'],
  annotation: [
    { type: 'owner', description: 'team-payments' },
    { type: 'requirement', description: 'PAY-REQ-17' },
  ],
}, async ({ page }) => {
  // ...
});
```

Dzięki temu raport testów staje się narzędziem zarządzania ryzykiem, a nie tylko listą zielonych i czerwonych testów.

## 13. Typowe błędy organizacyjne

### Tagi bez definicji

Jeśli `@smoke`, `@critical` i `@regression` są używane losowo, selekcja testów przestaje mieć sens.

### Zbyt duże pliki spec

Plik z 2000 liniami i wieloma domenami jest trudny w utrzymaniu. Dziel testy po obszarach.

### Ukrywanie flow w hookach

Jeżeli `beforeEach` robi 15 kroków biznesowych, test przestaje być czytelny. Użyj fixture albo jawnych kroków.

### Brak właściciela testu

Gdy test pada, nikt nie wie, kto ma go naprawić.

### `@flaky` jako stały status

Flaky test to incydent jakościowy, nie normalny stan.

## 14. Checklista organizacji testów

- Czy nazwa testu opisuje rezultat biznesowy?
- Czy pliki są podzielone według domeny albo typu testu?
- Czy tagi mają spisane definicje?
- Czy pipeline używa tagów konsekwentnie?
- Czy `@slow` i `@flaky` są monitorowane?
- Czy testy krytyczne mają właściciela?
- Czy `test.step` poprawia czytelność raportu?
- Czy hooki nie ukrywają sensu scenariusza?
- Czy znane błędy mają `fixme` z numerem ticketu?
- Czy można łatwo uruchomić smoke, regression, API i visual tests?

## 15. Ćwiczenie praktyczne

Dla projektu e-commerce zaprojektuj system tagów i strukturę katalogów.

Wymagania:

1. Smoke tests mają działać w każdym PR.
2. Testy płatności i logowania mają być oznaczone jako krytyczne.
3. Testy visual mają działać w osobnym pipeline.
4. Testy długie mają być wykluczone z PR.
5. Każdy test krytyczny ma mieć właściciela i powiązanie z wymaganiem.
6. Przygotuj komendy CLI dla PR, nightly i release candidate.

## Linki

- [Playwright Annotations](https://playwright.dev/docs/test-annotations)
- [Running tests](https://playwright.dev/docs/running-tests)
- [Playwright CLI](https://playwright.dev/docs/test-cli)
- [Reporters](https://playwright.dev/docs/test-reporters)
- [Best practices](https://playwright.dev/docs/best-practices)

## 📘 Suplement Inżynieryjny 2026: Runner Testów i Fixtury (Fixtures Deep Dive)
*Inspiracja: „Practical Playwright Test” (2026), Chapter 7*
*   **Fixtury Zależne i Automatyczne**: Odrzuć kruche bloki `beforeEach`/`afterEach`. Projektuj modularne fixtury, które mogą od siebie zależeć (np. `loggedInAdminPage` polega na `loginPage`). Używaj automatycznych fixtur (`auto: true`) do globalnego zbierania metryk.
*   **Scope Worker**: Inicjalizuj ciężkie zasoby (np. połączenia DB) na poziomie workera (`scope: 'worker'`), współdzieląc je bezpiecznie między testami w tym samym procesie.
