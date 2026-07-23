# Asercje webowe — Web-First Assertions

Asercje są miejscem, w którym test przestaje być sekwencją akcji, a zaczyna być dowodem jakości. Kliknięcie przycisku nie oznacza jeszcze, że aplikacja działa. Dopiero asercja mówi: „po tej akcji system osiągnął oczekiwany stan”.

Playwright ma specjalny rodzaj asercji dla aplikacji webowych: **web-first assertions**. Są one dostosowane do dynamicznego UI, czyli do aplikacji, które renderują dane po odpowiedzi API, animują elementy, przeładowują komponenty albo zmieniają stan bez pełnej nawigacji.

## 1. Dlaczego zwykłe odczyty są kruche

Antywzorzec:

```typescript
const text = await page.getByTestId('status').textContent();
expect(text).toBe('Gotowe');
```

Ten kod odczytuje tekst tylko raz. Jeśli aplikacja pokaże `Gotowe` 100 ms później, test padnie, mimo że produkt działa poprawnie.

Lepsza wersja:

```typescript
await expect(page.getByTestId('status')).toHaveText('Gotowe');
```

Playwright będzie ponawiał sprawdzenie aż do spełnienia warunku albo przekroczenia timeoutu asercji.

## 2. Web-first assertion — co to znaczy

Web-first assertion:

- przyjmuje locator albo page;
- automatycznie ponawia sprawdzenie;
- dobrze współpracuje z auto-waiting;
- daje czytelny komunikat błędu;
- jest odporna na krótkie opóźnienia renderowania.

Przykład:

```typescript
await page.getByRole('button', { name: 'Zapisz' }).click();
await expect(page.getByText('Zapisano zmiany')).toBeVisible();
```

Nie trzeba dodawać `waitForTimeout`. Asercja sama czeka na widoczny komunikat.

## 3. Widoczność i obecność elementu

Najczęstsze asercje:

```typescript
await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
await expect(page.getByText('Ładowanie')).toBeHidden();
await expect(page.getByTestId('toast')).toBeAttached();
await expect(page.getByTestId('deleted-item')).not.toBeAttached();
```

Różnice:

- `toBeVisible()` — element jest w DOM i widoczny dla użytkownika;
- `toBeHidden()` — element nie jest widoczny albo nie istnieje;
- `toBeAttached()` — element jest podłączony do DOM;
- `not.toBeAttached()` — element nie istnieje w DOM.

Jeśli sprawdzasz rezultat użytkownika, zwykle wybieraj `toBeVisible`. Jeśli sprawdzasz cleanup DOM, użyj `toBeAttached` / `not.toBeAttached`.

## 4. Tekst

```typescript
await expect(page.getByTestId('order-status')).toHaveText('Opłacone');
await expect(page.getByTestId('summary')).toContainText('Razem: 120,00 zł');
await expect(page.getByRole('alert')).toHaveText(/niepoprawne hasło/i);
```

`toHaveText` sprawdza pełny tekst elementu. `toContainText` sprawdza fragment. Regex jest dobry dla tekstów częściowo dynamicznych, ale nie powinien być zbyt szeroki.

Dla list:

```typescript
await expect(page.getByRole('listitem')).toHaveText([
  'Produkt A',
  'Produkt B',
  'Produkt C',
]);
```

To sprawdza treść i kolejność elementów.

## 5. Formularze

```typescript
await expect(page.getByLabel('Email')).toHaveValue('user@example.com');
await expect(page.getByLabel('Akceptuję regulamin')).toBeChecked();
await expect(page.getByRole('button', { name: 'Zapisz' })).toBeEnabled();
await expect(page.getByRole('button', { name: 'Zapisz' })).toBeDisabled();
await expect(page.getByLabel('Opis')).toBeEditable();
```

Te asercje są lepsze niż pobieranie atrybutów ręcznie, bo opisują intencję użytkownika.

## 6. Atrybuty, CSS i klasy

```typescript
await expect(page.getByRole('link', { name: 'Profil' })).toHaveAttribute('href', '/profile');
await expect(page.getByTestId('status-badge')).toHaveClass(/success/);
await expect(page.getByTestId('modal')).toHaveCSS('position', 'fixed');
```

Asercje CSS i klas są przydatne, ale używaj ich ostrożnie. Jeśli testujesz zachowanie, zwykle lepsza jest asercja tekstu, roli lub stanu. Asercje CSS mają sens przy komponentach UI, regresji wizualnej albo stylach krytycznych dla używalności.

## 7. Liczność elementów

```typescript
await expect(page.getByRole('row')).toHaveCount(10);
await expect(page.getByTestId('cart-item')).toHaveCount(3);
```

`toHaveCount` jest web-first. To lepsze niż:

```typescript
expect(await page.getByRole('row').count()).toBe(10);
```

`count()` sprawdza aktualny stan tylko raz, a `toHaveCount` czeka na oczekiwaną liczbę.

## 8. PageAssertions

Asercje mogą dotyczyć całej strony:

```typescript
await expect(page).toHaveURL(/\/checkout\/success$/);
await expect(page).toHaveTitle(/Panel użytkownika/);
```

Po nawigacji SPA często warto łączyć URL i widoczny stan:

```typescript
await expect(page).toHaveURL(/\/settings$/);
await expect(page.getByRole('heading', { name: 'Ustawienia' })).toBeVisible();
```

Sam URL nie zawsze oznacza, że dane zostały wyrenderowane.

## 9. Soft assertions

Soft assertion nie przerywa testu natychmiast po porażce:

```typescript
await expect.soft(page.getByTestId('user-name')).toHaveText('Jan Kowalski');
await expect.soft(page.getByTestId('user-email')).toHaveText('jan@example.com');
await expect.soft(page.getByTestId('user-role')).toHaveText('Admin');
```

To dobre przy formularzach, profilach, raportach i widokach, gdzie chcesz zebrać kilka błędów naraz. Nie używaj soft assertions do krytycznego warunku, bez którego dalsze kroki nie mają sensu.

## 10. Własny opis asercji

```typescript
await expect(
  page.getByRole('alert'),
  'Po błędnym haśle powinien pojawić się komunikat walidacyjny'
).toBeVisible();
```

Opis asercji jest bardzo pomocny w raporcie CI. Używaj go dla warunków domenowych i miejsc, które często się psują.

## 11. Timeout asercji

Domyślny timeout asercji jest konfigurowany w `playwright.config.ts`:

```typescript
export default defineConfig({
  expect: {
    timeout: 5_000,
  },
});
```

Możesz nadpisać lokalnie:

```typescript
await expect(page.getByText('Import zakończony')).toBeVisible({ timeout: 30_000 });
```

Lokalny dłuższy timeout ma sens dla długiego procesu domenowego. Nie ustawiaj ogromnego globalnego timeoutu tylko dlatego, że jeden import trwa długo.

## 12. Asercje negatywne

```typescript
await expect(page.getByText('Błąd serwera')).not.toBeVisible();
await expect(page.getByRole('button', { name: 'Usuń' })).not.toBeEnabled();
```

Uważaj: asercja negatywna może przejść z nieoczekiwanego powodu. `not.toBeVisible()` przejdzie także wtedy, gdy element nie istnieje. Jeśli chcesz sprawdzić, że element istnieje, ale jest ukryty, dopisz osobny warunek.

## 13. Antywzorce

- Brak asercji po akcji.
- `expect(await locator.textContent()).toBe(...)` dla dynamicznego UI.
- `waitForTimeout` przed asercją.
- Sprawdzanie zbyt technicznych szczegółów zamiast rezultatu użytkownika.
- Same asercje negatywne bez potwierdzenia pozytywnego stanu.
- Brak `await` przed `expect(locator)`.

## 14. Checklista asercji webowych

- Czy asercja sprawdza realny rezultat użytkownika?
- Czy używa web-first matcherów zamiast jednorazowego odczytu?
- Czy locator jest jednoznaczny?
- Czy timeout jest uzasadniony?
- Czy komunikat błędu będzie zrozumiały w CI?
- Czy asercja negatywna nie przechodzi przypadkiem?
- Czy po zmianie URL sprawdzasz też widoczny stan strony?

## Linki

- [Assertions](https://playwright.dev/docs/test-assertions)
- [LocatorAssertions API](https://playwright.dev/docs/api/class-locatorassertions)
- [PageAssertions API](https://playwright.dev/docs/api/class-pageassertions)
- [Best practices](https://playwright.dev/docs/best-practices)

## 15. Asercje dostępnościowe

Playwright udostępnia asercje związane z dostępnością, np. accessible name, description czy error message. Są przydatne, gdy chcesz wykryć regresję niewidoczną wizualnie, ale ważną dla technologii asystujących.

```typescript
await expect(page.getByRole('button', { name: 'Zapisz' })).toHaveAccessibleName('Zapisz');
await expect(page.getByLabel('Email')).toHaveAccessibleErrorMessage('Email jest wymagany');
```

Nie zastępuje to pełnego audytu WCAG, ale wzmacnia zwykłe testy UI.

## 16. Asercje snapshotowe

Dla wybranych przypadków możesz użyć snapshotów wizualnych lub ARIA. Nie stosuj ich jako zamiennika jasnej asercji biznesowej. Snapshot jest dobry dla struktury lub layoutu, ale komunikat „zamówienie opłacone” nadal warto sprawdzić przez `toHaveText`.

## 17. Zasada końcowa

Dobra asercja webowa odpowiada na pytanie: jaki stan użytkownik lub system ma zobaczyć po akcji? Jeśli asercja nie odpowiada na to pytanie, prawdopodobnie jest zbyt techniczna albo zbyt słaba.

## 📘 Suplement Inżynieryjny 2026: Asercje i Weryfikacje (Web-First Assertions)
*Inspiracja: „Practical Playwright Test” (2026), Chapter 6*
*   **Asercje Web-First**: Zawsze używaj asynchronicznych asercji, takich jak `expect(locator).toBeVisible()`. Te asercje automatycznie ponawiają sprawdzenie (poll) przez określony timeout (domyślnie 5s), zapobiegając niestabilności spowodowanej powolnym renderowaniem sieciowym.
*   **Custom Matchers (`expect.extend`)**: Dla zachowania czystości kodu domenowego wyodrębniaj techniczne aserty do niestandardowych metod weryfikujących (np. `expect(page).toBeAuthenticated()`).
