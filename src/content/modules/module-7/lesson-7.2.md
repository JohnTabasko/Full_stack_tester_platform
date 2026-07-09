# Budowniczowie danych i fabryki

> Moduł siódmy dotyczy jednego z najczęstszych źródeł niestabilności automatyzacji: danych testowych. Test może mieć idealne lokatory i asercje, ale jeśli opiera się na przypadkowym stanie środowiska, nie będzie wiarygodny.

## Jak czytać ten moduł

Czytaj ten moduł jak podręcznik projektowania stanu. Dane nie są dodatkiem do testu; są częścią scenariusza. Każdy test ma stan początkowy, dane wejściowe i oczekiwany stan końcowy. Im bardziej jawnie je opiszesz, tym łatwiej utrzymać automatyzację.

Trzy zasady modułu:

1. **Dane muszą być deterministyczne.** Nawet jeśli są generowane, muszą dać się odtworzyć.
2. **Dane muszą być izolowane.** Równoległe testy nie mogą walczyć o ten sam rekord, konto lub koszyk.
3. **Dane muszą być bezpieczne.** Sekrety i prawdziwe dane osobowe nie należą do repozytorium testowego.


## Cel lekcji

Ta lekcja koncentruje się na: **wzorzec fabryki, wzorzec budowniczego, płynny interfejs, budowniczowie zagnieżdżeni, Object Mother i typowane dane domenowe**. Główne ryzyko: **testy są pełne powtarzalnych obiektów z dziesiątkami pól, przez co nie widać, które dane są naprawdę istotne dla scenariusza**. Po lekturze powinieneś umieć dobrać strategię danych do poziomu testu, ryzyka i kosztu utrzymania.

## Sytuacja przewodnia

w testach zamówień trzeba często tworzyć klienta, adres, produkt, pozycje koszyka i płatność w różnych wariantach

## 1. Po co builder

Builder tworzy poprawny obiekt domyślnie, a test nadpisuje tylko pola istotne dla scenariusza. Dzięki temu test mówi o ryzyku, nie o technicznym kształcie całego obiektu.

## 2. Fabryka danych

Fabryka może nie tylko zbudować obiekt, ale też zapisać go przez API albo bazę. Wtedy musi jasno komunikować, że tworzy stan w systemie.

## 3. Płynny interfejs

Fluent interface może poprawić czytelność, jeśli opisuje domenę. Może też przesadzić z teatralną składnią, jeśli ukrywa proste dane.

## 4. Object Mother

Object Mother bywa wygodny dla kilku znanych wariantów, np. admin, klient premium, produkt wyprzedany. Nadużyty staje się katalogiem magicznych przypadków.

## 5. Typy domenowe

TypeScript pomaga dokumentować wymagane pola i ograniczać błędy. Builder powinien korzystać z typów, a nie zwracać anonimowe obiekty bez kontraktu.

## Przykład referencyjny

```typescript
type User = {
  email: string;
  password: string;
  role: 'customer' | 'admin';
};

export function buildUser(overrides: Partial<User> = {}): User {
  return {
    email: `qa+${crypto.randomUUID()}@example.test`,
    password: 'Correct-Horse-Battery-7!',
    role: 'customer',
    ...overrides,
  };
}

const admin = buildUser({ role: 'admin' });
```

Przykład pokazuje, że dane testowe powinny być jawne, typowane i powtarzalne. Najważniejsze jest nie to, że dane istnieją, lecz to, że test wie, skąd się wzięły i jak je powiązać z wynikiem.

## Lista kontrolna

- Czy dane są tworzone jawnie?
- Czy test może działać równolegle z innymi testami?
- Czy awarię da się odtworzyć na tych samych danych?
- Czy dane testowe nie zawierają sekretów ani danych osobowych?
- Czy istnieje strategia sprzątania?
- Czy warianty danych są nazwane językiem domeny?


## Dobre praktyki i perspektywa inżynierska
Automatyzacja to proces ciągłego doskonalenia. Aby Twoje testy niosły realną wartość, stosuj się do poniższych zasad:
- **Testuj zachowanie, nie kod**: Skup się na tym, co widzi i robi użytkownik. Zmienne nazwy klas CSS nie powinny psuć Twoich testów.
- **Fail-fast**: Test powinien dawać jasny sygnał o błędzie tak szybko, jak to możliwe. Unikaj "wiszących" testów, które blokują kolejkę CI.
- **Ewoluuj**: Regularnie przeglądaj swoje testy. Usuwaj te, które są niestabilne i nie dają wartości, a refaktoryzuj te, które stają się zbyt skomplikowane.
