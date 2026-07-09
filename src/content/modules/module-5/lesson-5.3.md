# Zaawansowana konfiguracja testów

> Moduł piąty pokazuje, że profesjonalna automatyzacja to nie tylko kod w plikach `.spec.ts`. Runner testów, fikstury, konfiguracja, równoległość i tagowanie decydują o tym, czy testy są użyteczne w codziennej pracy zespołu.

## Jak czytać ten moduł

Czytaj ten moduł z perspektywy osoby odpowiedzialnej za cały pakiet testowy. Pojedynczy test może być poprawny, ale pakiet jako całość może być wolny, niestabilny i trudny w diagnozie. Playwright Test dostarcza mechanizmy organizacyjne; trzeba ich używać świadomie.

Trzy zasady modułu:

1. **Jawne zależności.** Test powinien wiedzieć, skąd bierze stronę, dane, klienta API i użytkownika.
2. **Powtarzalne wykonanie.** Lokalnie i w CI testy powinny działać według tych samych zasad, z kontrolowanymi różnicami.
3. **Szybki feedback.** Organizacja, tagi, sharding i równoległość mają skracać czas do wiarygodnej informacji, nie ukrywać problemy.


## Cel lekcji

Ta lekcja koncentruje się na: **wiele środowisk, projekty, global setup, walidacja zmiennych środowiskowych, kompozycja konfiguracji i ustawienia CI**. Główne ryzyko: **konfiguracja rośnie chaotycznie, środowiska różnią się niejawnie, a testy działają inaczej lokalnie i w CI**. Po lekturze powinieneś umieć projektować nie tylko pojedynczy test, ale element większego systemu wykonania.

## Sytuacja przewodnia

ten sam pakiet testów ma działać lokalnie, na środowisku testowym, stagingu i w nocnej regresji wieloprzeglądarkowej

## 1. Konfiguracja jako dokument decyzji

Zaawansowana konfiguracja nie polega na dodaniu wielu opcji. Polega na zapisaniu decyzji zespołu: gdzie testujemy, jak diagnozujemy i jak odróżniamy lokalne uruchomienie od CI.

## 2. Wiele środowisk

Lokalne środowisko, test, staging i produkcyjny smoke mogą mieć inne adresy, dane, sekrety i ograniczenia. Różnice muszą być jawne.

## 3. Walidacja env

Brak wymaganej zmiennej w CI powinien dawać szybki, czytelny błąd. Cichy fallback do złego adresu jest niebezpieczny.

## 4. Global setup

Global setup jest dobry do przygotowania stanu wspólnego, np. storageState. Nie powinien jednak tworzyć ukrytej magii, której testy nie rozumieją.

## 5. Kompozycja konfiguracji

Jeżeli konfiguracja rośnie, wydziel helpery i stałe. Nie duplikuj całych plików dla każdego środowiska bez powodu.

## Przykład referencyjny

```typescript
import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL;
if (!baseURL && process.env.CI) {
  throw new Error('BASE_URL musi być ustawiony w CI');
}

export default defineConfig({
  testDir: './tests',
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: baseURL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
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
