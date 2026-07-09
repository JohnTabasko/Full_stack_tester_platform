# Kontrakty API i walidacja schematów

> Moduł ósmy pokazuje, jak testować system szybciej i precyzyjniej przez warstwę API. Testy API są doskonałe do kontraktów, reguł biznesowych, autoryzacji, przygotowania danych i diagnostyki. Nie zastępują testów UI, ale pozwalają nie przeciążać przeglądarki problemami, które lepiej sprawdzić niżej.

## Jak czytać ten moduł

Czytaj ten moduł jak podręcznik kontraktu między systemami. Endpoint nie jest tylko adresem URL. Jest obietnicą: jakie dane przyjmuje, jakie zwraca, jakie błędy są możliwe, kto ma prawo go użyć i jak zachowuje się pod obciążeniem.

Trzy zasady modułu:

1. **Status HTTP nie wystarcza.** Sprawdzaj ciało odpowiedzi, nagłówki, semantykę danych i scenariusze błędów.
2. **API jest świetne do setupu danych.** Przygotowanie przez API jest zwykle szybsze i stabilniejsze niż przez UI.
3. **Kontrakt musi chronić konsumentów.** Test ma wykryć zmianę, która zepsuje klienta, zanim trafi na środowisko użytkownika.


## Cel lekcji

Ta lekcja koncentruje się na: **OpenAPI, JSON Schema, Ajv, Pact, wykrywanie zmian niekompatybilnych, wersjonowanie i podejście contract-first**. Główne ryzyko: **dostawca API zmienia pole, typ albo kod błędu, a konsumenci dowiadują się o tym dopiero po wdrożeniu**. Po lekturze powinieneś umieć zaprojektować test API, który sprawdza kontrakt, dane, uprawnienia i diagnostykę, a nie tylko status techniczny.

## Sytuacja przewodnia

frontend wymaga pola total jako number, ale backend po refaktoryzacji zaczyna zwracać string

## 1. Kontrakt jako umowa

Kontrakt API opisuje, czego konsument może oczekiwać. Nie jest dokumentacją marketingową, lecz umową techniczną między zespołami.

## 2. OpenAPI

OpenAPI pozwala opisać endpointy, parametry, odpowiedzi i błędy. Testy mogą weryfikować zgodność implementacji z opisem.

## 3. JSON Schema i Ajv

Schema waliduje kształt danych. Pomaga wykryć zmianę typu, brak pola albo niepoprawny enum szybciej niż test UI.

## 4. Pact

Testy kontraktowe sterowane przez konsumenta opisują realne potrzeby klienta API. Dostawca sprawdza, czy nadal je spełnia.

## 5. Wersjonowanie

Zmiana kompatybilna wstecz dodaje możliwości bez łamania istniejących konsumentów. Usunięcie pola albo zmiana typu to zwykle breaking change.

## Przykład referencyjny

```typescript
import Ajv from 'ajv';

const schema = {
  type: 'object',
  required: ['id', 'total', 'status'],
  properties: {
    id: { type: 'string' },
    total: { type: 'number' },
    status: { enum: ['NEW', 'PAID', 'CANCELLED'] },
  },
};

const ajv = new Ajv();
const validate = ajv.compile(schema);
expect(validate(await response.json())).toBe(true);
```

Przykład pokazuje styl testowania API: jawne żądanie, asercja statusu, sprawdzenie kontraktu i odniesienie do semantyki danych.

## Lista kontrolna

- Czy test sprawdza więcej niż status HTTP?
- Czy scenariusz ma wariant negatywny?
- Czy autoryzacja jest sprawdzona dla właściwych ról?
- Czy kontrakt odpowiedzi jest jawny?
- Czy dane tworzone przez test są sprzątane?
- Czy awaria zostawia request id, ciało odpowiedzi lub inne dane diagnostyczne?


## Dobre praktyki i perspektywa inżynierska
Automatyzacja to proces ciągłego doskonalenia. Aby Twoje testy niosły realną wartość, stosuj się do poniższych zasad:
- **Testuj zachowanie, nie kod**: Skup się na tym, co widzi i robi użytkownik. Zmienne nazwy klas CSS nie powinny psuć Twoich testów.
- **Fail-fast**: Test powinien dawać jasny sygnał o błędzie tak szybko, jak to możliwe. Unikaj "wiszących" testów, które blokują kolejkę CI.
- **Ewoluuj**: Regularnie przeglądaj swoje testy. Usuwaj te, które są niestabilne i nie dają wartości, a refaktoryzuj te, które stają się zbyt skomplikowane.
