# Testy integracyjne backendu

> Moduł dziewiętnasty pokazuje, jak testować niższe poziomy aplikacji, aby nie przepychać każdego ryzyka przez wolne testy end-to-end. Testy jednostkowe, komponentowe i integracyjne skracają feedback oraz pomagają precyzyjniej wskazać przyczynę awarii.

## Jak czytać ten moduł

Czytaj ten moduł jako uzupełnienie Playwright E2E. Pytanie nie brzmi „czy pisać E2E albo unit”, lecz „który poziom testu da najlepszą informację przy najniższym koszcie”. Dobrze zaprojektowana automatyzacja łączy poziomy.

Trzy zasady modułu:

1. **Testuj możliwie nisko, ale wystarczająco realistycznie.** Reguły domenowe nie muszą iść przez UI.
2. **Mocki zmniejszają koszt i realizm.** Używaj ich świadomie.
3. **Komponent i integracja mają własną wartość.** Nie są tylko etapem pośrednim między unit i E2E.


## Cel lekcji

Ta lekcja koncentruje się na: **testy endpointów, uruchamianie aplikacji w testach, Supertest, baza testowa, transakcje, migracje i izolacja danych**. Główne ryzyko: **testy jednostkowe z mockami są zielone, ale prawdziwy endpoint nie działa z bazą, walidacją, middleware lub autoryzacją**. Po lekturze powinieneś umieć dobrać poziom testu do ryzyka i zaprojektować test niższego poziomu, który uzupełnia E2E.

## Sytuacja przewodnia

endpoint tworzenia zamówienia musi zwalidować dane, zapisać rekord, utworzyć pozycje zamówienia i zwrócić poprawny kontrakt odpowiedzi

## 1. Po co test integracyjny backendu

Test integracyjny backendu sprawdza współpracę warstw: routing, middleware, walidację, serwis, bazę i serializację odpowiedzi.

## 2. Supertest

Supertest pozwala testować endpoint bez uruchamiania prawdziwego serwera HTTP na porcie. To szybkie i wygodne dla aplikacji Node.js.

## 3. Baza testowa

Test integracyjny potrzebuje kontrolowanej bazy. Może to być osobna baza testowa, kontener, transakcja lub baza in-memory, zależnie od technologii.

## 4. Migracje

Schemat bazy w testach musi odpowiadać aplikacji. Migracje powinny być uruchamiane w setupie albo obraz testowy powinien zawierać aktualny schemat.

## 5. Izolacja danych

Każdy test powinien mieć własne dane albo transakcję. Współdzielone rekordy prowadzą do zależności od kolejności i flaky testów.

## Przykład referencyjny

```typescript
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../app';

describe('POST /api/orders', () => {
  it('tworzy zamówienie z poprawnymi pozycjami', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({ productId: 'book-1', quantity: 2 })
      .expect(201);

    expect(response.body).toEqual(expect.objectContaining({
      id: expect.any(String),
      status: 'NEW',
    }));
  });
});
```

Przykład pokazuje, że niższy poziom testu powinien mieć jasną odpowiedzialność. Test jednostkowy, komponentowy i integracyjny nie konkurują z E2E — uzupełniają go.

## Lista kontrolna

- Czy wybrany poziom testu pasuje do ryzyka?
- Czy test nie sprawdza prywatnej implementacji bez potrzeby?
- Czy mock nie kłamie o kontrakcie zależności?
- Czy dane testowe są małe i czytelne?
- Czy awaria wskazuje konkretną warstwę?
- Czy test niższego poziomu ogranicza potrzebę wolnego testu E2E?


## Dobre praktyki i perspektywa inżynierska
Automatyzacja to proces ciągłego doskonalenia. Aby Twoje testy niosły realną wartość, stosuj się do poniższych zasad:
- **Testuj zachowanie, nie kod**: Skup się na tym, co widzi i robi użytkownik. Zmienne nazwy klas CSS nie powinny psuć Twoich testów.
- **Fail-fast**: Test powinien dawać jasny sygnał o błędzie tak szybko, jak to możliwe. Unikaj "wiszących" testów, które blokują kolejkę CI.
- **Ewoluuj**: Regularnie przeglądaj swoje testy. Usuwaj te, które są niestabilne i nie dają wartości, a refaktoryzuj te, które stają się zbyt skomplikowane.
