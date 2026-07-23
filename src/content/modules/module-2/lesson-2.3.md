# Selektory i lokatory — strategia stabilnego znajdowania elementów

Locatory są jednym z najważniejszych tematów w Playwright. Większość niestabilnych testów UI zaczyna się od źle wybranego sposobu znalezienia elementu: kruchego CSS, przypadkowego XPath, zbyt ogólnego tekstu albo `nth()` użytego bez zrozumienia. Dobry Full Stack Tester traktuje locator jak część kontraktu między testem, UI i dostępnością aplikacji.

## 1. Selektor vs Locator

Selektor to zwykle tekst opisujący sposób znalezienia elementu, np. `.btn-primary` albo `//button[1]`. Locator to obiekt Playwright, który przechowuje strategię wyszukiwania i wykonuje ją dopiero w momencie akcji lub asercji.

```typescript
const saveButton = page.getByRole('button', { name: 'Zapisz' });
await saveButton.click();
await expect(saveButton).toBeHidden();
```

Locator jest „leniwy”. Jeśli element zostanie wyrenderowany dopiero po chwili, locator nadal może działać poprawnie, bo Playwright wyszuka element w momencie `click()` lub `expect()`.

## 2. Strictness — Playwright wymaga jednoznaczności

Jeżeli akcja wymaga jednego elementu, locator powinien wskazywać dokładnie jeden element. Gdy pasuje wiele elementów, Playwright zgłosi błąd strict mode.

```typescript
await page.getByRole('button', { name: 'Kup' }).click();
```

Jeśli na stronie jest wiele przycisków „Kup”, ten kod jest niejednoznaczny. Lepsze podejście:

```typescript
const product = page.getByRole('listitem').filter({ hasText: 'Laptop Pro 14' });
await product.getByRole('button', { name: 'Kup' }).click();
```

Błąd strict mode jest dobry. Informuje, że test nie opisuje precyzyjnie intencji.

## 3. Rekomendowana hierarchia locatorów

Oficjalne dobre praktyki Playwright preferują locatory widoczne dla użytkownika.

### `getByRole`

Najmocniejsza strategia dla przycisków, linków, nagłówków, tabel, list, pól i elementów semantycznych.

```typescript
await page.getByRole('button', { name: 'Zaloguj' }).click();
await expect(page.getByRole('heading', { name: 'Panel użytkownika' })).toBeVisible();
```

`getByRole` wykorzystuje accessible role i accessible name. Jeśli test nie może znaleźć przycisku przez rolę, może to oznaczać problem z dostępnością.

### `getByLabel`

Najlepszy wybór dla pól formularzy z etykietą.

```typescript
await page.getByLabel('Adres e-mail').fill('user@example.com');
await page.getByLabel('Hasło').fill('Secret123!');
```

### `getByPlaceholder`

Przydatny, ale słabszy niż label, bo placeholder nie zastępuje etykiety dostępności.

```typescript
await page.getByPlaceholder('Wpisz nazwę produktu').fill('Laptop');
```

### `getByText`

Dobre dla komunikatów, etykiet, statusów i tekstów informacyjnych.

```typescript
await expect(page.getByText('Produkt dodany do koszyka')).toBeVisible();
```

Uważaj na teksty powtarzające się w wielu miejscach.

### `getByAltText` i `getByTitle`

Przydatne dla obrazów i elementów z tytułem.

```typescript
await expect(page.getByAltText('Logo firmy')).toBeVisible();
await page.getByTitle('Pomoc').click();
```

### `getByTestId`

Dobra strategia dla elementów, które nie mają stabilnej roli ani tekstu, np. wartości technicznych.

```html
<span data-testid="cart-total">120,00 zł</span>
```

```typescript
await expect(page.getByTestId('cart-total')).toHaveText('120,00 zł');
```

Test ID nie powinien być pierwszym wyborem dla zwykłych przycisków i pól. Jeśli użytkownik widzi element jako przycisk „Zapisz”, test też powinien go tak znaleźć.

## 4. Konfiguracja test id

Jeśli zespół używa innego atrybutu niż `data-testid`, można to ustawić w konfiguracji:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    testIdAttribute: 'data-pw',
  },
});
```

Wtedy:

```typescript
await page.getByTestId('cart-total').click();
```

będzie szukać `data-pw="cart-total"`.

## 5. Filtrowanie locatorów

Filtry pozwalają zawęzić listę elementów.

```typescript
const order = page.getByRole('row').filter({ hasText: 'ORD-123' });
await order.getByRole('button', { name: 'Szczegóły' }).click();
```

Można filtrować po tekście, widoczności i posiadaniu innego locatora:

```typescript
const product = page.getByRole('listitem').filter({
  has: page.getByRole('heading', { name: 'Laptop Pro' }),
});
```

To dużo stabilniejsze niż `.product:nth-child(3)`.

## 6. `first`, `last`, `nth` — używaj ostrożnie

```typescript
await page.getByRole('button', { name: 'Usuń' }).nth(2).click();
```

`nth()` bywa potrzebne, ale często ukrywa brak precyzji. Jeśli kolejność elementów się zmieni, test może kliknąć zły przycisk. Lepsze jest zawężenie przez kontekst biznesowy:

```typescript
const userRow = page.getByRole('row').filter({ hasText: 'anna@example.com' });
await userRow.getByRole('button', { name: 'Usuń' }).click();
```

## 7. CSS i XPath — kiedy używać

Playwright nadal obsługuje CSS i XPath:

```typescript
await page.locator('css=.product-card').click();
await page.locator('//button[text()="Zapisz"]').click();
```

Traktuj je jako wyjątek, nie domyślną strategię. CSS jest przydatny dla technicznych struktur DOM, ale klasy stylujące często się zmieniają. XPath jest trudniejszy w utrzymaniu i mniej czytelny dla zespołu.

CSS/XPath mają sens, gdy:

- testujesz bardzo techniczny element bez semantyki;
- pracujesz z legacy UI bez możliwości dodania atrybutów;
- potrzebujesz tymczasowego obejścia, które później zostanie zastąpione lepszym locatorem.

## 8. Shadow DOM

Playwright potrafi przechodzić przez otwarty Shadow DOM w wielu locatorach. Nie przechodzi przez zamknięty Shadow DOM. Jeśli komponent ma closed shadow root, testy muszą korzystać z zachowania widocznego dla użytkownika albo z publicznego API komponentu.

## 9. Debugowanie locatorów

Narzędzia:

```bash
npx playwright test --debug
npx playwright codegen http://localhost:3000
```

W Playwright Inspector i VS Code Extension możesz użyć Pick Locator. To świetny sposób nauki, ale wygenerowany locator zawsze przejrzyj. Narzędzie nie zna intencji biznesowej testu.

## 10. Antywzorce

- `.container > div:nth-child(2) > button` — zależność od struktury DOM.
- `.btn-primary` — zależność od stylu.
- `xpath=/html/body/div[3]/div[2]/button` — skrajnie kruche.
- `getByText('OK')` przy wielu przyciskach OK.
- `nth(0)` zamiast zawężenia przez kontekst.
- Test ID używany wszędzie, mimo że element ma dobrą rolę i nazwę.

## 11. Checklista locatorów

- Czy locator opisuje to, co widzi użytkownik?
- Czy jest jednoznaczny w strict mode?
- Czy preferuje `getByRole`, `getByLabel` lub tekst?
- Czy `getByTestId` ma uzasadnienie?
- Czy uniknięto zależności od klas CSS i struktury DOM?
- Czy `nth()` jest naprawdę konieczne?
- Czy locator będzie czytelny w Page Object?
- Czy problem ze znalezieniem elementu nie ujawnia problemu dostępności?

## Linki

- [Locators](https://playwright.dev/docs/locators)
- [Other locators](https://playwright.dev/docs/other-locators)
- [Best practices](https://playwright.dev/docs/best-practices)
- [Accessibility testing](https://playwright.dev/docs/accessibility-testing)
- [Codegen](https://playwright.dev/docs/codegen-intro)

## 📘 Suplement Inżynieryjny 2026: Podstawy Playwright (Locators & Actions)
*Inspiracja: „Hands-On Automated Testing with Playwright” (2026), Chapter 2*
*   **Priorytet Dostępności (A11y)**: Współczesne testy odrzucają surowe selektory CSS i XPath. Zawsze dąż do używania lokalizatorów semantycznych (`getByRole`, `getByLabel`), które imitują interakcję prawdziwego użytkownika i ułatwiają zachowanie standardów dostępności w kodzie produkcyjnym.
*   **Auto-Waiting State Machine**: Playwright przed kliknięciem elementu automatycznie sprawdza jego stan (czy jest widoczny, stabilny, włączony i klikalny). Zrozumienie tej maszyny stanów zapobiega pisaniu zbędnych oczekiwań (np. `sleep`).
