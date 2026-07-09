# Organizacja testów i tagowanie

> Moduł piąty pokazuje, że profesjonalna automatyzacja to nie tylko kod w plikach `.spec.ts`. Runner testów, fikstury, konfiguracja, równoległość i tagowanie decydują o tym, czy testy są użyteczne w codziennej pracy zespołu.

## Jak czytać ten moduł

Czytaj ten moduł z perspektywy osoby odpowiedzialnej za cały pakiet testowy. Pojedynczy test może być poprawny, ale pakiet jako całość może być wolny, niestabilny i trudny w diagnozie. Playwright Test dostarcza mechanizmy organizacyjne; trzeba ich używać świadomie.

Trzy zasady modułu:

1. **Jawne zależności.** Test powinien wiedzieć, skąd bierze stronę, dane, klienta API i użytkownika.
2. **Powtarzalne wykonanie.** Lokalnie i w CI testy powinny działać według tych samych zasad, z kontrolowanymi różnicami.
3. **Szybki feedback.** Organizacja, tagi, sharding i równoległość mają skracać czas do wiarygodnej informacji, nie ukrywać problemy.


## Cel lekcji

Ta lekcja koncentruje się na: **struktura pakietu, nazewnictwo, tagi, smoke, regression, critical, slow, adnotacje, ownership i integracja z pipeline CI/CD**. Główne ryzyko: **zespół ma dużo testów, ale nie potrafi wybrać właściwego zestawu do pull requestu, regresji, hotfixa albo wydania**. Po lekturze powinieneś umieć projektować nie tylko pojedynczy test, ale element większego systemu wykonania.

## Sytuacja przewodnia

przed pull requestem mają działać tylko szybkie testy krytyczne, a pełna regresja i testy wolne mają działać nocą

## 1. Organizacja według ryzyka

Testy powinny być organizowane tak, aby łatwo wybrać pakiet odpowiadający ryzyku: smoke, regresja, krytyczne ścieżki, testy wolne, testy wizualne.

## 2. Nazewnictwo

Nazwa testu trafia do raportu. Powinna opisywać zachowanie, nie implementację. Nazwa pliku powinna wskazywać domenę lub typ testu.

## 3. Tagi

Tagi pomagają wybierać zestawy testów. Nie powinny być przypadkowe. Zespół musi wiedzieć, co oznacza `@smoke`, `@critical`, `@slow`.

## 4. Adnotacje

Adnotacje Playwright, takie jak skip, fixme, fail i slow, powinny być używane oszczędnie i z uzasadnieniem.

## 5. Ownership

Duży pakiet testów potrzebuje właścicieli. Gdy test pada, musi być jasne, kto analizuje problem i jaki obszar produktu jest dotknięty.

## Przykład referencyjny

```typescript
import { test, expect } from '@playwright/test';

test('klient może rozpocząć płatność @smoke @critical', async ({ page }) => {
  await page.goto('/checkout');
  await page.getByRole('button', { name: 'Przejdź do płatności' }).click();
  await expect(page.getByRole('heading', { name: 'Płatność' })).toBeVisible();
});

// CI:
// npx playwright test --grep @smoke
// npx playwright test --grep-invert @slow
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
