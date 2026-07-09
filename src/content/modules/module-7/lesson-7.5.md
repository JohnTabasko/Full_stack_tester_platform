# Organizacja i utrzymanie danych testowych

> Moduł siódmy dotyczy jednego z najczęstszych źródeł niestabilności automatyzacji: danych testowych. Test może mieć idealne lokatory i asercje, ale jeśli opiera się na przypadkowym stanie środowiska, nie będzie wiarygodny.

## Jak czytać ten moduł

Czytaj ten moduł jak podręcznik projektowania stanu. Dane nie są dodatkiem do testu; są częścią scenariusza. Każdy test ma stan początkowy, dane wejściowe i oczekiwany stan końcowy. Im bardziej jawnie je opiszesz, tym łatwiej utrzymać automatyzację.

Trzy zasady modułu:

1. **Dane muszą być deterministyczne.** Nawet jeśli są generowane, muszą dać się odtworzyć.
2. **Dane muszą być izolowane.** Równoległe testy nie mogą walczyć o ten sam rekord, konto lub koszyk.
3. **Dane muszą być bezpieczne.** Sekrety i prawdziwe dane osobowe nie należą do repozytorium testowego.


## Cel lekcji

Ta lekcja koncentruje się na: **struktura folderów, nazewnictwo, dane wrażliwe, walidacja schematów JSON, refaktoryzacja i zarządzanie danymi testowymi**. Główne ryzyko: **dane testowe rozrastają się bez właściciela, zawierają sekrety albo prawdziwe dane osobowe i nikt nie wie, które pliki są używane**. Po lekturze powinieneś umieć dobrać strategię danych do poziomu testu, ryzyka i kosztu utrzymania.

## Sytuacja przewodnia

po roku projekt ma setki fixture JSON, wiele builderów i kilka środowisk, a usunięcie jednego pola psuje losowe testy

## 1. Dane mają właściciela

Dane testowe powinny mieć jasną odpowiedzialność. Kto utrzymuje seed? Kto aktualizuje schemat? Kto usuwa stare dane? Bez właściciela dane gniją.

## 2. Struktura folderów

Oddziel dane referencyjne, buildery, generatory, fixture JSON i setup środowiska. Jeden folder `data` bez zasad szybko staje się śmietnikiem.

## 3. Dane wrażliwe

Nie trzymaj prawdziwych danych osobowych ani sekretów w repozytorium. Używaj danych syntetycznych, anonimizacji i sekretów platformy CI.

## 4. Walidacja schematów

Fixture JSON powinny być walidowane. Schemat wykrywa brak pola wcześniej niż test UI, który padnie dopiero kilka kroków później.

## 5. Refaktoryzacja danych

Dane testowe wymagają refaktoryzacji jak kod. Usuwaj nieużywane fixture, łącz duplikaty i dokumentuj warianty domenowe.

## Przykład referencyjny

```typescript
import { z } from 'zod';

const UserFixtureSchema = z.object({
  email: z.string().email(),
  role: z.enum(['customer', 'admin']),
  active: z.boolean(),
});

export function parseUserFixture(input: unknown) {
  return UserFixtureSchema.parse(input);
}
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
