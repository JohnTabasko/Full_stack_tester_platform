# Dynamiczne generowanie danych testowych

Dynamiczne dane testowe pozwalają uruchamiać testy równolegle i wielokrotnie bez konfliktów. Nie oznacza to jednak losowości bez kontroli. Profesjonalne generowanie danych musi być unikalne, czytelne, możliwe do powiązania z konkretnym runem i bezpieczne dla prywatności.

## 1. Losowość kontrolowana

Najprostszy generator:

```typescript
const email = `qa+${crypto.randomUUID()}@example.test`;
```

To zapewnia unikalność, ale utrudnia czasem odtworzenie awarii. Dlatego warto dodawać `runId`:

```typescript
const runId = process.env.TEST_RUN_ID ?? `local-${Date.now()}`;
const email = `qa+${runId}-${crypto.randomUUID()}@example.test`;
```

Po awarii możesz znaleźć wszystkie dane utworzone przez dany run.

## 2. Dane per test

Każdy test modyfikujący stan powinien tworzyć własne dane:

```typescript
test('użytkownik zmienia adres dostawy', async ({ request, page }) => {
  const user = await createUser(request, {
    email: `qa+${crypto.randomUUID()}@example.test`,
  });

  await page.goto(`/users/${user.id}/address`);
  // ...
});
```

Nie zakładaj, że test może bezpiecznie używać tego samego użytkownika co inne testy.

## 3. Dane per worker

Czasem koszt tworzenia konta per test jest zbyt duży. Wtedy można przypisać konto per worker:

```typescript
export const test = base.extend<{}, { workerUser: User }>({
  workerUser: [async ({ request }, use, workerInfo) => {
    const user = await createUser(request, {
      email: `qa+worker-${workerInfo.parallelIndex}@example.test`,
    });
    await use(user);
  }, { zakres: 'worker' }],
});
```

To działa, jeśli testy w workerze nie niszczą sobie stanu. Dla danych modyfikowanych nadal preferuj per test.

## 4. `testInfo` w danych

`testInfo` pomaga powiązać dane z testem:

```typescript
test('tworzy zamówienie', async ({ request }, testInfo) => {
  const marker = `${testInfo.project.name}-${testInfo.parallelIndex}-${Date.now()}`;
  const order = await createOrder(request, {
    externalId: `e2e-${marker}`,
  });
});
```

Dzięki temu w logach, bazie i raportach widzisz, który test utworzył dany rekord.

## 5. Faker i dane realistyczne

Biblioteki typu Faker pomagają tworzyć realistyczne imiona, adresy i telefony. Uważaj jednak na:

- znaki specjalne, jeśli aplikacja ich nie obsługuje;
- długości pól;
- lokalizację;
- deterministyczność;
- przypadkowe tworzenie danych podobnych do prawdziwych osób.

Dane powinny być syntetyczne i bezpieczne.

## 6. Unikaj prawdziwych danych osobowych

Nie używaj realnych emaili klientów, numerów telefonów, adresów ani danych kart płatniczych. Dla płatności używaj testowych numerów dostawcy, np. kart testowych Stripe/Adyen/PayU zgodnie z dokumentacją środowiska testowego.

## 7. Cleanup po runId

Jeśli każdy rekord ma `runId`, możesz sprzątać po całym uruchomieniu:

```typescript
await request.delete(`/api/test-data?runId=${runId}`);
```

To jest często bardziej niezawodne niż cleanup pojedynczych rekordów, szczególnie gdy test padnie w połowie setupu.

## 8. Checklista

- Czy dane są unikalne dla testu albo workera?
- Czy można powiązać rekord z konkretnym runem?
- Czy dane są syntetyczne?
- Czy generator nie tworzy przypadkowych konfliktów?
- Czy istnieje cleanup po `runId`?
- Czy awarię można odtworzyć albo przynajmniej zdiagnozować na podstawie danych?

## Linki

- [Playwright parallelism](https://playwright.dev/docs/test-parallel)
- [Fixtures](https://playwright.dev/docs/test-fixtures)
- [API testing](https://playwright.dev/docs/api-testing)

## 9. Seed losowości

Jeśli używasz biblioteki Faker, rozważ ustawienie seeda dla lokalnej reprodukcji:

```typescript
faker.seed(Number(process.env.TEST_SEED ?? Date.now()));
```

W CI możesz zapisać seed w raporcie. Gdy test padnie na nietypowych danych, łatwiej odtworzyć scenariusz.

## 10. Dynamiczne dane a asercje

Jeśli generujesz dane dynamicznie, używaj ich później w asercjach:

```typescript
const user = buildUser({ name: `Jan ${runId}` });
await usersClient.createUser(user);

await page.goto('/users');
await expect(page.getByRole('row').filter({ hasText: user.email })).toBeVisible();
```

Nie sprawdzaj ogólnego „użytkownik istnieje”. Sprawdzaj konkretny rekord utworzony przez test.

## 11. Konflikty unikalności

Najczęstsze pola konfliktowe:

- email;
- numer zamówienia;
- SKU;
- slug URL;
- nazwa organizacji;
- numer telefonu;
- identyfikator zewnętrzny.

Każde z nich powinno zawierać `runId` albo UUID, jeśli testy mogą działać równolegle.

## 12. Dane dynamiczne w raportach

Przy awarii dołącz bezpieczne metadane:

```typescript
await testInfo.attach('generated-data.json', {
  body: JSON.stringify({ runId, email: user.email, orderId: order.id }, null, 2),
  contentType: 'application/json',
});
```

Nie dołączaj haseł, tokenów ani pełnych danych osobowych. Metadane mają pomóc znaleźć rekordy w środowisku.

## 13. Reprodukcja awarii

Jeśli test używa seeda, zapisz go w logu i raporcie. Jeśli używa UUID, zapisz utworzone identyfikatory. Reprodukcja testu z tym samym stanem jest często ważniejsza niż sama losowość.

## 14. Dane dynamiczne a lokalizacja

Generatory danych powinny uwzględniać lokalizację aplikacji. Jeśli testujesz polski formularz adresowy, używaj poprawnych kodów pocztowych, znaków diakrytycznych i formatów telefonu. Jeśli aplikacja ma walidację międzynarodową, przygotuj jawne warianty: PL, DE, US, UK.

```typescript
const polishAddress = buildAddress({
  country: 'PL',
  postalCode: '02-001',
  city: 'Warszawa',
});
```

Losowe dane bez kontroli mogą tworzyć przypadki, których test nie miał sprawdzać.

## 15. Dane dynamiczne a prywatność

Nie używaj danych wyglądających jak prawdziwe dane klientów. Domena `example.test`, syntetyczne numery telefonów i testowe identyfikatory ograniczają ryzyko. Jeśli używasz zanonimizowanej próbki produkcyjnej, powinna mieć właściciela, wersję i zgodę organizacji.

## 16. Generator jako zależność projektu

Generator danych powinien być stabilny. Jeśli aktualizacja biblioteki Faker zmieni format telefonów albo adresów, wiele testów może zacząć padać. Dlatego generator traktuj jak część frameworka testowego: wersjonuj, reviewuj i opisuj zmiany.

## 17. Checklista generatora

- Czy wartości są unikalne?
- Czy są zgodne z walidacją domeny?
- Czy można znaleźć dane po `runId`?
- Czy seed jest zapisany, jeśli potrzebna jest reprodukcja?
- Czy dane są syntetyczne i bezpieczne?

## 📘 Suplement Inżynieryjny 2026: Zarządzanie Danymi Testowymi (Data Management)
*Inspiracja: „Scalable Test Automation with Playwright” (2026), Chapter 7*
*   **Izolacja Danych**: Nigdy nie współdziel mutowalnych danych między testami działającymi równolegle. Używaj generatorów (np. biblioteki Faker) do tworzenia unikalnych tożsamości i twórz stan bazy dynamicznie per test.
*   **Szybki Setup przez API**: Zamiast przeklikiwać UI w celu przygotowania danych, użyj szybkiego klienta API przed rozpoczęciem testu funkcjonalnego.
