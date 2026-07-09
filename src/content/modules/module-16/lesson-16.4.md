# Testowanie komponentów w Playwright

Playwright Component Testing pozwala testować komponenty UI w prawdziwej przeglądarce, ale bez uruchamiania całej aplikacji E2E. To poziom pośredni między testami jednostkowymi komponentów a pełnym testem end-to-end. Jest przydatny dla design systemów, formularzy, modali, tabel, komponentów dostępności i regresji wizualnej komponentów.

## 1. Kiedy testować komponent

Test komponentowy ma sens, gdy:

- komponent ma złożoną interakcję;
- chcesz sprawdzić różne propsy i stany;
- pełne E2E byłoby zbyt wolne;
- chcesz testować dostępność komponentu;
- komponent jest częścią design systemu;
- chcesz screenshot komponentu zamiast całej strony.

## 2. Przykład idei `mount`

```typescript
import { test, expect } from '@playwright/experimental-ct-react';
import { Button } from './Button';

test('button emits click', async ({ mount }) => {
  let clicked = false;
  const component = await mount(<Button onClick={() => clicked = true}>Zapisz</Button>);

  await component.getByRole('button', { name: 'Zapisz' }).click();
  expect(clicked).toBe(true);
});
```

API i konfiguracja zależą od frameworka, np. React, Vue lub Svelte. Zawsze sprawdzaj aktualną dokumentację Playwright CT.

## 3. Component tests vs E2E

Component test sprawdza komponent w izolacji. E2E sprawdza cały system. Nie zastępują się, tylko uzupełniają.

Przykład strategii:

- komponent Button: testy CT dla stanów disabled/loading/focus;
- formularz checkout: CT dla walidacji pól;
- pełna płatność: E2E smoke przez UI + API.

## 4. Mockowanie zależności

Komponent może wymagać routera, providera stanu, tłumaczeń albo klienta API. Przygotuj wrapper:

```typescript
const component = await mount(
  <TestProviders locale="pl">
    <CheckoutForm />
  </TestProviders>
);
```

Nie buduj w teście komponentowym całej aplikacji. Jeśli potrzebujesz wszystkich providerów i backendu, być może to już E2E.

## 5. Accessibility i visual komponentu

```typescript
await expect(component.getByRole('button', { name: 'Zapisz' })).toBeVisible();
await expect(component).toHaveScreenshot('button-loading.png');
```

Component testing dobrze nadaje się do ARIA, focus management i snapshotów wizualnych małych elementów.

## 6. Checklista

- Czy komponent ma wartość testowania w izolacji?
- Czy test nie odtwarza całej aplikacji?
- Czy propsy/stany są jawne?
- Czy używasz locatorów dostępnościowych?
- Czy E2E nadal pokrywa krytyczną integrację?

## Linki

- [Playwright Component Testing](https://playwright.dev/docs/test-components)
- [Locators](https://playwright.dev/docs/locators)
- [Screenshots](https://playwright.dev/docs/test-snapshots)

## 7. Component testing a testy accessibility

Komponenty są dobrym miejscem na sprawdzanie dostępności wcześniej niż w E2E:

```typescript
const component = await mount(<Modal title="Potwierdź usunięcie" />);
await expect(component.getByRole('dialog', { name: 'Potwierdź usunięcie' })).toBeVisible();
```

Jeśli komponent nie ma roli lub accessible name, E2E także będzie trudniejsze.

## 8. Dane wejściowe komponentu

Test komponentowy powinien jawnie pokazywać propsy:

```typescript
await mount(<ProductCard name="Laptop" price="1200 zł" unavailable />);
```

Dzięki temu test opisuje wariant stanu, a nie zależy od backendu.

## 9. Granice CT

Jeśli test komponentowy zaczyna wymagać prawdziwego routera, backendu, autoryzacji i kilku providerów globalnych, prawdopodobnie przesuwasz go w stronę E2E. Ustal granicę: komponent ma testować zachowanie komponentu, nie cały produkt.

## 10. Component testing w pipeline

Testy komponentowe są zwykle szybsze niż E2E, więc mogą działać w PR dla zmian frontendowych. Testy E2E zostaw dla krytycznych przepływów. Przykładowy podział:

```bash
npx playwright test-ct
npx playwright test --grep @smoke
```

## 11. Snapshot komponentu

Visual snapshot komponentu jest stabilniejszy niż snapshot całej strony, bo ma mniej dynamicznych elementów. Nadal kontroluj fonty, animacje i dane wejściowe.

```typescript
await expect(component).toHaveScreenshot('product-card-unavailable.png');
```

## 12. Checklista review CT

- Czy test dotyczy zachowania komponentu?
- Czy propsy są jawne?
- Czy wrapper nie ukrywa całej aplikacji?
- Czy użyto ról i nazw dostępności?
- Czy E2E nadal pokrywa integrację?

## 13. Mockowanie requestów w component testing

Jeśli komponent sam pobiera dane, możesz mockować warstwę network albo przekazać dane przez propsy. Preferuj propsy, gdy testujesz komponent wizualny. Mock network ma sens, gdy komponent zawiera logikę pobierania.

## 14. Component testing i design system

Dla design systemu testy komponentowe mogą być główną warstwą jakości:

- warianty buttonów;
- focus state;
- disabled/loading;
- aria attributes;
- keyboard navigation;
- visual snapshots.

To pozwala wykrywać regresje UI zanim trafią do wielu stron aplikacji.

## 15. Antywzorce CT

- Test komponentowy uruchamia całą aplikację.
- Test wymaga prawdziwego backendu.
- Snapshot jest aktualizowany bez review.
- Komponent nie ma dostępnych ról ani etykiet.
- Ten sam scenariusz jest powielony w CT i E2E bez powodu.

## 16. Testy interakcji klawiaturą w CT

Komponenty menu, dialogów i comboboxów powinny obsługiwać klawiaturę. Component testing nadaje się do tego bardzo dobrze:

```typescript
await component.getByRole('button', { name: 'Otwórz menu' }).press('Enter');
await expect(component.getByRole('menu')).toBeVisible();
await page.keyboard.press('Escape');
await expect(component.getByRole('menu')).toBeHidden();
```

## 17. CT jako szybki feedback dla frontend developerów

Jeśli E2E pada przez komponent, który można było przetestować izolowanie, przenieś część wariantów do CT. Developer dostaje szybszy feedback, a E2E zostaje dla integracji.

## 18. Dane a snapshoty komponentów

Snapshot komponentu powinien używać stabilnych danych. Dynamiczne daty, losowe avatary i animacje powodują fałszywe różnice. Przekazuj jawne propsy i wyłącz animacje, jeśli test dotyczy layoutu.

## 19. Współdzielenie helperów CT i E2E

Niektóre buildery danych i asercje dostępności mogą być współdzielone między CT i E2E. Uważaj jednak, aby helper CT nie zakładał istnienia pełnej aplikacji, routera albo backendu.
