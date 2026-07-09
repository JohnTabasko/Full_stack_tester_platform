# Dynamiczne generowanie danych testowych

> Moduł siódmy dotyczy jednego z najczęstszych źródeł niestabilności automatyzacji: danych testowych. Test może mieć idealne lokatory i asercje, ale jeśli opiera się na przypadkowym stanie środowiska, nie będzie wiarygodny.

## Jak czytać ten moduł

Czytaj ten moduł jak podręcznik projektowania stanu. Dane nie są dodatkiem do testu; są częścią scenariusza. Każdy test ma stan początkowy, dane wejściowe i oczekiwany stan końcowy. Im bardziej jawnie je opiszesz, tym łatwiej utrzymać automatyzację.

Trzy zasady modułu:

1. **Dane muszą być deterministyczne.** Nawet jeśli są generowane, muszą dać się odtworzyć.
2. **Dane muszą być izolowane.** Równoległe testy nie mogą walczyć o ten sam rekord, konto lub koszyk.
3. **Dane muszą być bezpieczne.** Sekrety i prawdziwe dane osobowe nie należą do repozytorium testowego.


## Cel lekcji

Ta lekcja koncentruje się na: **Faker.js, seed, lokalizacja, własne generatory, dane masowe i kontrola losowości**. Główne ryzyko: **losowe dane czynią testy niepowtarzalnymi, a awarii nie da się odtworzyć, bo nikt nie wie, jakie wartości zostały użyte**. Po lekturze powinieneś umieć dobrać strategię danych do poziomu testu, ryzyka i kosztu utrzymania.

## Sytuacja przewodnia

test rejestracji generuje użytkowników, adresy i numery telefonów dla wielu lokalizacji oraz musi umożliwiać odtworzenie błędu

## 1. Losowość kontrolowana

Losowość w testach jest użyteczna tylko wtedy, gdy można ją odtworzyć. Seed powinien być znany, logowany i możliwy do powtórzenia.

## 2. Lokalizacja danych

Dane zależne od języka i kraju wpływają na formaty, walidacje i długości pól. Test dla Polski może nie ujawnić problemu z adresem z Wielkiej Brytanii.

## 3. Własne generatory

Faker tworzy realistyczne dane ogólne, ale domena często wymaga własnych generatorów: NIP, PESEL testowy, SKU, numer faktury, tenant.

## 4. Dane masowe

Bulk data przydaje się do paginacji i wydajności, ale wymaga kontroli kosztu oraz sprzątania. Nie generuj tysięcy rekordów w każdym teście UI.

## 5. Logowanie wartości

Przy awarii raport powinien pokazać wygenerowane identyfikatory. Bez tego nie odtworzysz problemu. W profesjonalnej pracy z Playwrightem, to zagadnienie jest kluczowe dla stabilności i wydajności całego procesu. Należy pamiętać o izolacji, odpowiednim doborze API oraz unikaniu typowych antywzorców, takich jak sztywne timeouty czy nadmierne poleganie na strukturze DOM.

## Przykład referencyjny

```typescript
import { faker } from '@faker-js/faker';

export function createDeterministicUser(seed: number) {
  faker.seed(seed);
  return {
    email: faker.internet.email({ provider: 'example.test' }).toLowerCase(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    phone: faker.phone.number(),
  };
}

const user = createDeterministicUser(20260621);
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
