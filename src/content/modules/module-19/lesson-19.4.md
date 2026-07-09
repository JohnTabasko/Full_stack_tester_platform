# Testy integracyjne backendu

Testy integracyjne backendu sprawdzają współpracę kilku elementów systemu: API, serwisu, bazy danych, kolejek, cache, autoryzacji albo zewnętrznego adaptera. Są wolniejsze niż unit tests, ale znacznie szybciej i precyzyjniej wykrywają problemy niż pełne E2E przez UI.

Dla Full Stack Testera to kluczowa warstwa. Dzięki niej wiele ryzyk można sprawdzić bez przeglądarki, a E2E zostawić dla najważniejszych przepływów użytkownika.

## 1. Co testować integracyjnie

Dobre kandydaty:

- endpoint API + walidacja + baza;
- autoryzacja ról;
- zapis i odczyt danych;
- transakcje;
- migracje;
- obsługa błędów 400/401/403/404/409;
- publikacja eventu po zmianie stanu;
- integracja z cache;
- adapter zewnętrznego systemu przez sandbox/mock.

Przykład: zamiast testować przez UI wszystkie błędy walidacji zamówienia, większość sprawdź przez API integration tests.

## 2. Test database

Testy integracyjne powinny używać kontrolowanej bazy:

- osobna baza testowa;
- kontener PostgreSQL/MySQL;
- SQLite in-memory, jeśli zgodne z produkcyjną semantyką;
- migracje przed testami;
- seed danych referencyjnych;
- cleanup po teście lub transakcja.

Nie uruchamiaj testów integracyjnych na bazie współdzielonego stagingu bez izolacji.

## 3. Testcontainers

Testcontainers pozwala uruchomić prawdziwe zależności w kontenerach:

```typescript
const postgres = await new PostgreSqlContainer('postgres:16').start();
process.env.DATABASE_URL = postgres.getConnectionUri();
```

To daje większy realizm niż in-memory fake, ale kosztuje więcej czasu. Warto używać dla krytycznych integracji z bazą.

## 4. Transakcje i rollback

W wielu testach integracyjnych można otworzyć transakcję i wycofać ją po teście. To szybkie, ale nie zawsze wystarczy:

- eventy wysłane do kolejki nie cofną się;
- pliki zapisane w storage zostaną;
- cache może mieć stary stan;
- procesy asynchroniczne mogą działać poza transakcją.

Dlatego rollback jest dobry, ale nie jest uniwersalnym cleanupem.

## 5. HTTP server w teście

Test integracyjny API może uruchomić aplikację lub jej część i wysyłać requesty:

```typescript
const response = await request(app).post('/orders').send(buildOrder());
expect(response.status).toBe(201);
expect(response.body.status).toBe('NEW');
```

W Node często używa się Supertest, Fastify inject albo natywnego klienta HTTP. Ważne, aby test przechodził przez prawdziwą walidację i routing.

## 6. MSW i testy backend/frontend boundary

MSW może mockować HTTP w testach frontendu i integracyjnych. Dla backendu częściej użyjesz fake servera, sandboxa lub kontraktu. Zasada jest taka sama: mock ma być zgodny z kontraktem.

## 7. Kolejki i eventy

Jeśli endpoint publikuje event, test może sprawdzić:

- czy event został wysłany;
- czy ma poprawny schema;
- czy consumer go przetwarza;
- czy duplicate event jest idempotentny;
- czy błąd trafia do DLQ.

Nie wszystko musi być jednym testem. Możesz mieć osobny test producenta i osobny test konsumenta.

## 8. Antywzorce

- Test integracyjny bez realnej integracji.
- Test używa produkcyjnej bazy.
- Cleanup działa tylko po sukcesie.
- Test zależy od kolejności innych testów.
- Mock niezgodny z kontraktem.
- E2E UI używane do każdej walidacji backendu.
- Brak migracji w test environment.

## 9. Checklista testu integracyjnego

- Czy test przechodzi przez realną granicę integracji?
- Czy baza jest izolowana?
- Czy migracje i seed są kontrolowane?
- Czy cleanup działa po awarii?
- Czy scenariusze negatywne są pokryte?
- Czy eventy/cache/pliki są uwzględnione?
- Czy wynik awarii wskazuje konkretną warstwę?

## Linki

- [Vitest Guide](https://vitest.dev/guide/)
- [Jest Getting Started](https://jestjs.io/docs/getting-started)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/current/)
- [Testcontainers](https://testcontainers.com/)
- [MSW Documentation](https://mswjs.io/docs/)

## 10. Testowanie migracji

Jeśli aplikacja używa migracji bazy, test integracyjny może uruchomić migracje na pustej bazie i sprawdzić, czy aplikacja startuje. Dla krytycznych migracji warto testować także migrację z przykładowego starego schematu.

## 11. Testowanie błędów infrastrukturalnych

Test integracyjny może symulować błąd zależności:

- baza niedostępna;
- timeout zewnętrznego API;
- konflikt unikalnego klucza;
- błąd walidacji eventu;
- brak uprawnień do zasobu.

Nie każdy taki przypadek musi być E2E. Warstwa backend integration jest zwykle szybsza i bardziej precyzyjna.

## 12. Integracja a obserwowalność

W testach integracyjnych warto sprawdzać, czy system generuje diagnostykę: correlation ID, log błędu, metrykę albo event. To pomaga później w debugowaniu E2E i produkcji.

## 13. Testy integracyjne a kontrakty

Test integracyjny może sprawdzić rzeczywiste zachowanie provider endpointu, ale kontrakt powinien być opisany jawnie. Jeśli API jest używane przez frontend, warto połączyć test integracyjny z walidacją OpenAPI albo JSON Schema.

## 14. Równoległość testów integracyjnych

Testy integracyjne często współdzielą bazę. Aby działały równolegle:

- używaj unikalnych danych;
- izoluj schemat lub bazę per worker;
- sprzątaj po `runId`;
- unikaj globalnych rekordów modyfikowanych przez testy;
- nie zakładaj kolejności.

## 15. Kiedy test integracyjny jest za duży

Jeśli test uruchamia frontend, backend, bazę, kolejkę, zewnętrzne API i przeglądarkę, to prawdopodobnie jest E2E. Test integracyjny powinien mieć jasną granicę. Im większy zakres, tym trudniejsza diagnoza.

## 16. Checklista review testu integracyjnego

- Czy zależności są kontrolowane?
- Czy test działa lokalnie i w CI?
- Czy dane są izolowane?
- Czy cleanup jest idempotentny?
- Czy wynik awarii wskazuje konkretny komponent systemu?
- Czy test nie powinien być rozbity na mniejsze warstwy?

## 17. Zasada końcowa

Test integracyjny jest najbardziej wartościowy wtedy, gdy sprawdza realną granicę systemu i nadal pozwala szybko wskazać przyczynę awarii.
