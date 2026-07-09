# Testowanie komponentów w Playwright

> Moduł szesnasty dotyczy przypadków, które pojawiają się w dojrzałych projektach: kontenery, poczta, komunikacja w czasie rzeczywistym, testy komponentowe i integracje zewnętrzne. To tematy, w których granica systemu jest równie ważna jak sam kod testu.

## Jak czytać ten moduł

Czytaj ten moduł jak podręcznik kontroli środowiska i zależności. Im więcej usług, kontenerów, wiadomości i dostawców, tym ważniejsze stają się: gotowość środowiska, idempotencja, retry, diagnostyka i świadome rozróżnienie mocka od prawdziwej integracji.

Trzy zasady modułu:

1. **Środowisko musi być kontrolowane.** Test nie powinien zgadywać, czy baza, poczta albo zależność jest gotowa.
2. **Integracja musi mieć zakres.** Nie każdy test powinien używać prawdziwego dostawcy.
3. **Awaria jest scenariuszem.** Retry, fallback, idempotencja i komunikaty błędów są częścią jakości.


## Cel lekcji

Ta lekcja koncentruje się na: **testowanie komponentów React/Vue/Svelte, mount, props, stan, regresja wizualna komponentu i porównanie CT, E2E oraz testów jednostkowych**. Główne ryzyko: **zespół sprawdza każdy wariant komponentu przez wolne testy E2E, mimo że szybciej i dokładniej można zrobić to na poziomie komponentu**. Po lekturze powinieneś umieć dobrać strategię testu do granicy systemu i zapewnić diagnostykę awarii zależności.

## Sytuacja przewodnia

komponent DatePicker ma wiele stanów: pusty, wybrana data, błąd walidacji, disabled, mobile i tryb ciemny

## 1. Po co testy komponentowe

Test komponentowy sprawdza zachowanie komponentu bez kosztu pełnej aplikacji. Jest szybszy niż E2E i bliższy użytkownikowi niż czysty test jednostkowy.

## 2. Mount

`mount` renderuje komponent w środowisku testowym. Test może używać lokatorów Playwright, asercji i screenshotów.

## 3. Props i stan

Komponenty mają warianty przez propsy i stan. Test komponentowy dobrze nadaje się do sprawdzenia macierzy wariantów.

## 4. Regresja wizualna

Screenshot komponentu jest tańszy i bardziej stabilny niż screenshot całej strony, jeśli dane i viewport są kontrolowane.

## 5. CT vs E2E vs unit

Test jednostkowy sprawdza logikę, komponentowy zachowanie elementu, a E2E integrację przepływu. Poziomy powinny się uzupełniać.

## Przykład referencyjny

```typescript
import { test, expect } from '@playwright/experimental-ct-react';
import { DatePicker } from './DatePicker';

test('DatePicker pokazuje błąd dla daty z przeszłości', async ({ mount }) => {
  const component = await mount(<DatePicker minDate="2026-01-01" />);
  await component.getByLabel('Data').fill('2025-12-01');
  await expect(component.getByRole('alert')).toContainText('Data jest zbyt wczesna');
});
```

Przykład pokazuje, że specjalistyczne integracje wymagają jawnej kontroli środowiska i asercji skutku. Samo wywołanie usługi nie wystarcza.

## Lista kontrolna

- Czy środowisko ma healthcheck albo inny dowód gotowości?
- Czy test wie, czy używa mocka, sandboxa czy prawdziwej usługi?
- Czy scenariusz awarii jest testowany?
- Czy operacja jest idempotentna lub zabezpieczona przed duplikatem?
- Czy artefakty pozwolą zdiagnozować problem zależności?
- Czy test nie generuje kosztów lub efektów ubocznych poza środowiskiem testowym?


## Dobre praktyki i perspektywa inżynierska
Automatyzacja to proces ciągłego doskonalenia. Aby Twoje testy niosły realną wartość, stosuj się do poniższych zasad:
- **Testuj zachowanie, nie kod**: Skup się na tym, co widzi i robi użytkownik. Zmienne nazwy klas CSS nie powinny psuć Twoich testów.
- **Fail-fast**: Test powinien dawać jasny sygnał o błędzie tak szybko, jak to możliwe. Unikaj "wiszących" testów, które blokują kolejkę CI.
- **Ewoluuj**: Regularnie przeglądaj swoje testy. Usuwaj te, które są niestabilne i nie dają wartości, a refaktoryzuj te, które stają się zbyt skomplikowane.
