# Współpraca zespołowa i standardy

Automatyzacja Playwright jest projektem zespołowym. Jeśli każdy autor pisze testy według własnego stylu, po kilku miesiącach powstaje kilka mini-frameworków, niespójne dane, różne sposoby logowania i raporty trudne do analizy. Standardy nie służą biurokracji. Służą temu, aby testy były czytelne, przewidywalne i łatwe do review.

## 1. Standard testu Playwright

Zespół powinien ustalić:

- strukturę katalogów;
- sposób importowania własnego `test` z fixtures;
- strategię locatorów;
- sposób tworzenia danych;
- nazewnictwo testów;
- tagi `@smoke`, `@regression`, `@critical`, `@api`;
- konfigurację trace/screenshot/video;
- sposób publikowania raportów;
- zasady quarantine flaky tests.

## 2. Code review testów

Review testu powinno sprawdzać więcej niż składnię:

- jakie ryzyko pokrywa test?
- czy test może działać równolegle?
- czy dane są izolowane?
- czy nie ma `waitForTimeout`?
- czy locatory są widoczne dla użytkownika?
- czy asercje potwierdzają skutek?
- czy awaria zostawi diagnostykę?

## 3. Definition of Done dla testów

Przykładowe DoD:

- test ma jasną nazwę;
- ma tag zgodny ze strategią;
- działa lokalnie i w CI;
- nie wymaga kolejności innych testów;
- ma dane per test albo per worker;
- ma stabilne locatory;
- raport zawiera trace/screenshot przy awarii;
- jest opisany w PR, jeśli dotyczy krytycznego flow.

## 4. Wspólne fixtures

Własne fixtures powinny być jednym standardowym wejściem do projektu:

```typescript
import { test, expect } from '../fixtures/base-test';
```

Nie mieszaj w specach importów z `@playwright/test` i różnych lokalnych wersji `test`, jeśli projekt wymaga wspólnych fixtures.

## 5. Dokumentacja

README powinno zawierać:

```text
npm ci
npx playwright install --with-deps
npm run test:smoke
npm run test:ui
npm run report
```

Oraz opis wymaganych zmiennych środowiskowych i sposobu pobrania artefaktów CI.

## 6. Checklista standardów zespołu

- Czy istnieje wspólny `base-test.ts`?
- Czy strategia tagów jest opisana?
- Czy review sprawdza stabilność, nie tylko styl?
- Czy flaky tests mają właściciela i ticket?
- Czy raporty CI są dostępne dla całego zespołu?
- Czy nowa osoba może uruchomić testy z README?

## Linki

- [Best practices](https://playwright.dev/docs/best-practices)
- [Fixtures](https://playwright.dev/docs/test-fixtures)
- [Annotations](https://playwright.dev/docs/test-annotations)
- [Reporters](https://playwright.dev/docs/test-reporters)

## 7. Standard Pull Request dla testów

Dobry opis PR z testami powinien zawierać:

- jakie ryzyko pokryto;
- jakie tagi dodano;
- jak uruchomić test lokalnie;
- czy test wymaga nowych sekretów lub danych;
- gdzie znaleźć raport po awarii;
- czy dodano lub zmieniono fixtures.

Przykład:

```text
Dodano @smoke test checkoutu dla płatności kartą.
Uruchomienie: npx playwright test --grep @checkout --project=chromium
Dane: użytkownik i zamówienie tworzone przez API, cleanup po runId.
Artefakty: trace on-first-retry, screenshot only-on-failure.
```

## 8. Wspólna definicja flakiness

Zespół powinien jasno definiować flaky test: test, który dla tego samego kodu i danych daje różne wyniki. Taki test nie może być ignorowany. Powinien mieć właściciela, ticket i termin naprawy.

## 9. Pairing QA + Dev

Najlepsze standardy powstają wspólnie. Tester zna ryzyka i diagnostykę, developer zna implementację i dostępne punkty testowe. Wspólnie mogą zdecydować, czy lepszy będzie test UI, API, kontraktowy czy komponentowy.

## 10. Checklista współpracy

- Czy standardy są zapisane w repozytorium?
- Czy PR testowy ma instrukcję uruchomienia?
- Czy flaky tests są widoczne i przypisane?
- Czy QA i Dev wspólnie projektują punkty testowe, np. `data-testid`, API setup i logi korelacyjne?

## 11. Standard obsługi `data-testid`

`data-testid` jest przydatne, ale nie powinno zastępować semantyki HTML. Zespół powinien ustalić, kiedy go używać:

- gdy element nie ma naturalnej roli ani stabilnego tekstu;
- dla wartości technicznych, np. `cart-total`, `order-id`, `current-balance`;
- dla komponentów dynamicznych, gdzie tekst zależy od lokalizacji;
- jako świadomy kontrakt między frontendem a testami.

Nie używaj `data-testid` jako obejścia dla niedostępnego przycisku. Jeśli przycisk nie ma accessible name, problemem jest komponent, nie test.

## 12. Standard artefaktów diagnostycznych

Wspólny standard powinien mówić, jakie artefakty są wymagane:

```typescript
use: {
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```

Dla krytycznych flow warto dodatkowo dołączać:

- correlation ID;
- identyfikatory danych testowych;
- response body kluczowych API, po zamaskowaniu sekretów;
- logi konsoli przy awarii.

## 13. Standard nazw testów

Nazwa testu powinna być zrozumiała w raporcie:

```typescript
test('klient może opłacić zamówienie kartą testową @smoke @payments', async () => {});
```

Słabe nazwy:

```typescript
test('test 1', async () => {});
test('click payment', async () => {});
```

Raport jest czytany przez ludzi spoza zespołu QA. Nazwa testu powinna mówić, jakie zachowanie biznesowe nie działa.

## 14. Standard przeglądów okresowych

Raz w sprincie lub miesiącu przejrzyj:

- najwolniejsze testy;
- testy z retry;
- testy oznaczone `@flaky`;
- testy bez właściciela;
- testy z `waitForTimeout`;
- testy bez jasnej asercji skutku.

Standardy działają tylko wtedy, gdy są egzekwowane.

## 15. Standard wersjonowania helperów

Zmiana wspólnego helpera może wpłynąć na dziesiątki testów. Dlatego helpery i fixtures powinny mieć review tak samo rygorystyczne jak kod produkcyjny. Jeśli zmieniasz zachowanie `loginAs`, opisz w PR, które suite’y mogą być dotknięte.

## 16. Wspólne słownictwo

Ustal, co znaczą słowa: smoke, regression, critical, flaky, quarantine, setup, fixture, factory, builder. Bez wspólnego słownika zespół może używać tych samych tagów w różnych znaczeniach.

## 17. Onboarding nowych osób

Nowa osoba powinna dostać krótki przewodnik:

1. jak zainstalować Playwright;
2. jak uruchomić smoke;
3. jak debugować trace;
4. jak dodać test;
5. jak przygotować dane;
6. jak opisać PR.

Jeśli onboarding wymaga przekazywania wiedzy ustnie, standard nie jest kompletny.
