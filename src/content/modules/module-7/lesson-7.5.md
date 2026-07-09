# Organizacja i utrzymanie danych testowych

Dane testowe wymagają utrzymania tak samo jak kod testów. Jeśli nie masz standardu nazw, cleanupu, izolacji i dokumentacji, środowisko testowe stopniowo zamieni się w śmietnik: tysiące użytkowników, porzucone zamówienia, konflikty emaili, niestabilne testy i trudne do odtworzenia awarie.

## 1. Zasady organizacji danych

Każdy projekt powinien mieć odpowiedzi na pytania:

- kto tworzy dane?
- gdzie są buildery?
- gdzie są factory zapisujące dane w systemie?
- jak oznaczamy dane danego runu?
- kto sprząta dane?
- jakie dane są współdzielone, a jakie per test?
- czy dane zawierają sekrety lub PII?

## 2. Proponowana struktura

```text
tests/
  data/
    builders/
      userBuilder.ts
      orderBuilder.ts
      productBuilder.ts
    factories/
      userFactory.ts
      orderFactory.ts
    clients/
      usersClient.ts
      ordersClient.ts
    cleanup/
      cleanupTracker.ts
      cleanupByRunId.ts
    fixtures/
      testData.fixture.ts
```

Builder tworzy obiekt. Factory używa klienta API/DB, aby utworzyć realny stan. Cleanup usuwa stan.

## 3. Run ID

Każde uruchomienie suite powinno mieć identyfikator:

```typescript
export const runId = process.env.TEST_RUN_ID ?? `local-${Date.now()}`;
```

Dodawaj go do danych:

```typescript
const user = buildUser({
  email: `qa+${runId}-${crypto.randomUUID()}@example.test`,
  metadata: { runId },
});
```

Dzięki temu można znaleźć dane po awarii i posprzątać je zbiorczo.

## 4. Dane referencyjne vs dane testowe

**Dane referencyjne** są wspólne i stabilne: kraje, waluty, typy podatków, konfiguracje słownikowe. Mogą być seedowane raz.

**Dane testowe** są tworzone dla testu lub runu: użytkownicy, koszyki, zamówienia, faktury. Powinny być izolowane i sprzątane.

Nie mieszaj tych kategorii. Test nie powinien usuwać danych referencyjnych.

## 5. Retencja danych

Nie zawsze trzeba usuwać dane natychmiast. Czasem po awarii warto zostawić je do diagnostyki. Ustal politykę:

- lokalnie — cleanup od razu;
- CI green — cleanup po runie;
- CI failed — dane zostają 24h z runId;
- nightly — cleanup starszych niż X dni.

Ważne, aby była automatyzacja sprzątania starych danych.

## 6. Sekrety i prywatność

Nie przechowuj w repozytorium:

- prawdziwych emaili klientów;
- numerów telefonów;
- adresów;
- tokenów API;
- plików storageState;
- danych kart płatniczych.

Używaj danych syntetycznych i domen typu `example.test`. Sekrety trzymaj w CI secrets albo lokalnym `.env` niecommitowanym do repozytorium.

## 7. Fixtures danych

```typescript
export const test = base.extend<{ testUser: User }>({
  testUser: async ({ request }, use) => {
    const user = await createUser(request, buildUser());
    await use(user);
    await request.delete(`/api/users/${user.id}`);
  },
});
```

Fixture jest dobrym miejscem dla setupu i teardownu zasobu, jeśli zasób jest potrzebny w wielu testach.

## 8. Monitoring środowiska testowego

Dojrzały zespół monitoruje:

- liczbę rekordów testowych;
- dane starsze niż polityka retencji;
- konflikty unikalnych pól;
- testy zostawiające dane po awarii;
- czas setupu danych;
- błędy cleanupu.

To ogranicza flaky tests wynikające z brudnego środowiska.

## 9. Checklista utrzymania danych

- Czy każdy rekord testowy ma właściciela albo `runId`?
- Czy buildery i factory są rozdzielone?
- Czy cleanup działa zbiorczo i per test?
- Czy dane referencyjne są chronione?
- Czy sekrety i PII nie trafiają do repozytorium?
- Czy polityka retencji jest opisana?
- Czy środowisko ma automatyczne sprzątanie starych danych?
- Czy awarie cleanupu są widoczne w raporcie?

## Linki

- [Playwright fixtures](https://playwright.dev/docs/test-fixtures)
- [Authentication](https://playwright.dev/docs/auth)
- [API testing](https://playwright.dev/docs/api-testing)
- [Parallelism](https://playwright.dev/docs/test-parallel)

## 10. Standard nazewnictwa danych

Ustal wspólny standard:

```text
qa+<runId>-<worker>-<uuid>@example.test
E2E_<runId>_<domain>_<shortId>
```

Dzięki temu dane testowe są rozpoznawalne w bazie, logach, panelu admina i narzędziach obserwowalności.

## 11. Raportowanie danych testowych

Przy trudnych awariach warto dołączyć do raportu bezpieczny opis danych:

```typescript
await testInfo.attach('test-data.json', {
  body: JSON.stringify({ runId, userId: user.id, orderId: order.id }, null, 2),
  contentType: 'application/json',
});
```

Nie załączaj haseł, tokenów, cookies ani danych osobowych. Raport ma pomagać w diagnostyce, nie tworzyć ryzyko bezpieczeństwa.

## 12. Przegląd higieny danych

Raz na jakiś czas wykonaj przegląd środowiska:

- ile danych testowych jest starszych niż 7 dni;
- które testy najczęściej zostawiają dane;
- które cleanupy kończą się błędem;
- czy są konflikty unikalnych emaili/SKU;
- czy dane testowe nie przypominają prawdziwych danych osobowych.

To jest część utrzymania automatyzacji, nie zadanie poboczne.

## 13. Właściciel danych

Dane testowe powinny mieć właściciela: zespół, moduł albo run. Bez tego nikt nie wie, czy rekord można usunąć. Najprościej: `runId`, `createdBy: e2e`, `team`, `expiresAt`.

## 14. Dane testowe w wielu środowiskach

Dev, staging i preview environments mogą mieć różne polityki danych. Lokalnie możesz czyścić dane agresywnie. Na stagingu po awarii warto zostawić je krótko do diagnostyki. W preview environment dane mogą być usuwane razem z całym środowiskiem.

Standard powinien opisywać różnice:

| Środowisko | Strategia danych |
|---|---|
| local | szybki cleanup po teście |
| preview | dane żyją do usunięcia środowiska |
| staging | cleanup po runId, retencja awarii |
| production smoke | wyłącznie bezpieczne dane syntetyczne i read-only, jeśli możliwe |

## 15. Audyt danych testowych

Raz na jakiś czas sprawdź, czy dane testowe nie naruszają zasad:

- brak prawdziwych danych osobowych;
- brak aktywnych tokenów w rekordach;
- brak starych danych bez właściciela;
- brak rekordów blokujących unikalne wartości;
- brak danych testowych w produkcji poza świadomymi smoke tests.

## 16. Test data contract

W dojrzałym projekcie dane testowe są kontraktem. Buildery, factory, endpointy test-support i cleanup powinny być opisane tak, aby nowa osoba mogła dodać scenariusz bez kopiowania przypadkowych rekordów z istniejącego testu.

## 17. Zasada końcowa

Dane testowe są częścią testu. Jeśli nie wiesz, skąd się wzięły, kto je usuwa i czy mogą działać równolegle, test nie jest gotowy do stabilnego CI.
