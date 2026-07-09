# Mocki, stuby, obiekty pozorne i szpiedzy

Mockowanie pomaga izolować testowany kod od zależności: sieci, bazy, czasu, systemu plików, kolejki, zewnętrznego API. Dobrze użyte mocki przyspieszają testy i pozwalają symulować trudne błędy. Źle użyte mocki sprawiają, że testy przechodzą, mimo że prawdziwa integracja jest zepsuta.

Najważniejsza zasada: mock ma upraszczać test, ale nie może kłamać o kontrakcie zależności.

## 1. Słownik pojęć

W praktyce zespoły mieszają nazwy, ale warto rozumieć różnice:

- **dummy** — obiekt przekazany tylko dlatego, że metoda wymaga argumentu;
- **stub** — zwraca zaprogramowaną odpowiedź;
- **fake** — uproszczona działająca implementacja, np. in-memory repository;
- **spy** — obserwuje wywołania funkcji;
- **mock** — obiekt z oczekiwaniami dotyczącymi interakcji.

Przykład spy:

```typescript
const logger = { error: vi.fn() };
service.doWork(logger);
expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('failed'));
```

## 2. `vi.fn` i `jest.fn`

```typescript
import { vi, expect, test } from 'vitest';

test('wywołuje callback po sukcesie', () => {
  const onSuccess = vi.fn();
  saveForm({ valid: true }, onSuccess);
  expect(onSuccess).toHaveBeenCalledTimes(1);
});
```

W Jest analogicznie użyjesz `jest.fn()`.

## 3. `vi.spyOn` / `jest.spyOn`

Spy jest dobry, gdy chcesz obserwować istniejącą metodę:

```typescript
const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

runWithError();

expect(spy).toHaveBeenCalled();
spy.mockRestore();
```

Zawsze przywracaj mocki, aby nie wpływały na inne testy.

## 4. Mockowanie modułów

```typescript
vi.mock('./paymentGateway', () => ({
  chargeCard: vi.fn().mockResolvedValue({ status: 'PAID' }),
}));
```

Mockowanie modułów jest potężne, ale łatwo związać test z implementacją. Jeśli test wie zbyt dużo o tym, który moduł jest importowany, refaktor może łamać test mimo braku zmiany zachowania.

## 5. Mockowanie czasu

Czas jest częstą przyczyną niestabilności:

```typescript
vi.useFakeTimers();
vi.setSystemTime(new Date('2026-07-09T10:00:00Z'));

expect(isPromotionActive()).toBe(true);

vi.useRealTimers();
```

Używaj fake timers dla kodu zależnego od daty, timeoutów i debounce.

## 6. MSW jako mock sieci

Mock Service Worker pozwala mockować HTTP na poziomie requestów, a nie wewnętrznych modułów. To często lepsze dla komponentów i integracji frontendu:

```typescript
http.get('/api/products', () => {
  return HttpResponse.json([{ id: 'p1', name: 'Laptop' }]);
});
```

MSW pomaga utrzymać kontrakt request/response bliżej prawdziwego API.

## 7. Kiedy mockować

Mockuj, gdy:

- zależność jest wolna;
- zależność jest niedeterministyczna;
- chcesz wywołać rzadki błąd;
- testujesz logikę jednostki;
- integracja jest pokryta gdzie indziej.

Nie mockuj, gdy:

- celem testu jest sama integracja;
- mock powiela implementację;
- test ma dać zaufanie do realnego kontraktu;
- mock ukrywa błąd autoryzacji, serializacji albo nagłówków.

## 8. Nadmierne mockowanie

Antywzorzec:

```typescript
expect(paymentGateway.charge).toHaveBeenCalledWith(...);
```

Jeśli jedyną asercją jest to, że kod wywołał zależność, test może sprawdzać implementację zamiast zachowania. Lepsza asercja często dotyczy wyniku domenowego:

```typescript
expect(order.status).toBe('PAID');
```

## 9. Test doubles a kontrakt

Jeśli stub API zwraca pole `total` jako string, a prawdziwe API zwraca number, testy frontendu mogą dawać fałszywe wyniki. Mocki powinny być zgodne z OpenAPI, JSON Schema albo typami generowanymi z kontraktu.

## 10. Checklista mockowania

- Czy mock jest potrzebny?
- Czy nie ukrywa testowanej integracji?
- Czy jest zgodny z kontraktem?
- Czy po teście jest czyszczony?
- Czy asercja sprawdza zachowanie, nie tylko implementację?
- Czy istnieje test integracyjny dla prawdziwej zależności?

## Linki

- [Vitest Mocking](https://vitest.dev/guide/mocking)
- [Jest Mock Functions](https://jestjs.io/docs/mock-functions)
- [MSW Documentation](https://mswjs.io/docs/)
- [Testing Library Guiding Principles](https://testing-library.com/docs/guiding-principles)

## 11. Mocki a testy kontraktowe

Jeśli mockujesz API, upewnij się, że odpowiedź jest zgodna z kontraktem. Dobrym wzorcem jest generowanie typów z OpenAPI albo walidacja mocków przez JSON Schema. Inaczej frontend może przechodzić testy na danych, których prawdziwy backend nigdy nie zwróci.

## 12. Resetowanie mocków

W Vitest i Jest po każdym teście warto czyścić mocki:

```typescript
afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});
```

Brak resetu powoduje zależności między testami. Jeden test może „odziedziczyć” wywołania albo implementację mocka z poprzedniego.

## 13. Fake repository

Czasem zamiast mocka lepszy jest fake:

```typescript
class InMemoryOrdersRepository {
  private orders = new Map<string, Order>();
  save(order: Order) { this.orders.set(order.id, order); }
  findById(id: string) { return this.orders.get(id) ?? null; }
}
```

Fake pozwala testować więcej zachowania niż prosty stub, ale nadal jest tańszy niż prawdziwa baza.

## 14. Mockowanie błędów

Mocki są szczególnie przydatne do błędów trudnych do wywołania:

```typescript
paymentGateway.charge.mockRejectedValue(new Error('provider timeout'));

await expect(service.pay(order)).rejects.toThrow('provider timeout');
```

Dzięki temu możesz sprawdzić fallback, retry, komunikat błędu i logowanie bez czekania na prawdziwą awarię dostawcy.

## 15. Mocki a obserwowalność

Jeśli testujesz obsługę błędu, sprawdź nie tylko wynik, ale też diagnostykę:

```typescript
expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('provider timeout'));
```

Nie każdy test musi sprawdzać logi, ale dla krytycznych błędów warto potwierdzić, że system zostawia ślad.

## 16. Granica mockowania

Dobra praktyka: mockuj zależności poza granicą testowanej jednostki. Nie mockuj funkcji, którą właśnie chcesz przetestować. Jeśli musisz mockować pół modułu, być może testujesz na zbyt niskim poziomie albo kod wymaga refaktoru.

## 17. Checklista przed dodaniem mocka

- Czy zależność jest naprawdę problemem dla testu?
- Czy istnieje test integracyjny dla tej zależności?
- Czy mock zwraca dane zgodne z kontraktem?
- Czy mock jest resetowany po teście?
- Czy test nadal sprawdza zachowanie domenowe?

Mock ma być kontrolowaną protezą zależności, nie alternatywną rzeczywistością systemu.

Koniec.
