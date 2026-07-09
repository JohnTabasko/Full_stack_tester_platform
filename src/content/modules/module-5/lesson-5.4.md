# Równoległość i dzielenie testów

> Moduł piąty pokazuje, że profesjonalna automatyzacja to nie tylko kod w plikach `.spec.ts`. Runner testów, fikstury, konfiguracja, równoległość i tagowanie decydują o tym, czy testy są użyteczne w codziennej pracy zespołu.

## Jak czytać ten moduł

Czytaj ten moduł z perspektywy osoby odpowiedzialnej za cały pakiet testowy. Pojedynczy test może być poprawny, ale pakiet jako całość może być wolny, niestabilny i trudny w diagnozie. Playwright Test dostarcza mechanizmy organizacyjne; trzeba ich używać świadomie.

Trzy zasady modułu:

1. **Jawne zależności.** Test powinien wiedzieć, skąd bierze stronę, dane, klienta API i użytkownika.
2. **Powtarzalne wykonanie.** Lokalnie i w CI testy powinny działać według tych samych zasad, z kontrolowanymi różnicami.
3. **Szybki feedback.** Organizacja, tagi, sharding i równoległość mają skracać czas do wiarygodnej informacji, nie ukrywać problemy.


## Cel lekcji

Ta lekcja koncentruje się na: **workers, fullyParallel, sharding, tryb serial i parallel, warunki wyścigu, izolacja danych i skalowanie w CI**. Główne ryzyko: **przyspieszenie testów ujawnia konflikty danych, zależność od kolejności i współdzielenie zasobów**. Po lekturze powinieneś umieć projektować nie tylko pojedynczy test, ale element większego systemu wykonania.

## Sytuacja przewodnia

pakiet regresji trwa 70 minut, więc zespół chce uruchamiać go na czterech workerach i dzielić między kilka maszyn CI

## 1. Równoległość jako test architektury danych

Jeżeli testy padają po włączeniu równoległości, problem często leży w danych, nie w runnerze. Równoległość ujawnia ukryte zależności.

## 2. Workers

Worker to proces wykonujący część testów. Każdy worker może mieć własne fixture workerowe i własne zasoby.

## 3. Sharding

Sharding dzieli pakiet testów między maszyny. Wymaga, aby testy były niezależne od kolejności i od siebie nawzajem.

## 4. Serial vs parallel

Tryb serial powinien być wyjątkiem. Jeżeli testy muszą działać w kolejności, prawdopodobnie testują proces, który powinien być podzielony inaczej.

## 5. Izolacja danych

Unikalne dane, osobne konta, tenanty, cleanup i deterministyczne seedowanie są warunkiem bezpiecznej równoległości.

## Przykład referencyjny

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,
  retries: process.env.CI ? 2 : 0,
});

// CI:
// npx playwright test --shard=1/4
// npx playwright test --shard=2/4
// npx playwright test --shard=3/4
// npx playwright test --shard=4/4
```

Przykład pokazuje mechanizm, ale najważniejsza jest decyzja projektowa: kiedy użyć danego mechanizmu, jaki koszt wprowadza i jaką informację daje po awarii.

## Lista kontrolna

- Czy zależności testu są jawne?
- Czy setup nie ukrywa zbyt wielu działań?
- Czy konfiguracja działa lokalnie i w CI?
- Czy raport po awarii jest czytelny?
- Czy testy mogą działać równolegle?
- Czy tagi i organizacja wspierają realny pipeline?


## Dobre praktyki i perspektywa inżynierska
Automatyzacja to proces ciągłego doskonalenia. Aby Twoje testy niosły realną wartość, stosuj się do poniższych zasad:
- **Testuj zachowanie, nie kod**: Skup się na tym, co widzi i robi użytkownik. Zmienne nazwy klas CSS nie powinny psuć Twoich testów.
- **Fail-fast**: Test powinien dawać jasny sygnał o błędzie tak szybko, jak to możliwe. Unikaj "wiszących" testów, które blokują kolejkę CI.
- **Ewoluuj**: Regularnie przeglądaj swoje testy. Usuwaj te, które są niestabilne i nie dają wartości, a refaktoryzuj te, które stają się zbyt skomplikowane.
