# Akcje podstawowe — realistyczna symulacja użytkownika

Playwright pozwala wykonywać akcje użytkownika: klikać, wpisywać tekst, używać klawiatury, zaznaczać checkboxy, wybierać opcje i najeżdżać kursorem. Najważniejsze jest jednak to, aby akcje były realistyczne i czytelne. Test automatyczny nie powinien robić rzeczy, których prawdziwy użytkownik nie może zrobić, chyba że świadomie testujesz warstwę techniczną.

## 1. Kliknięcie

```typescript
await page.getByRole('button', { name: 'Zapisz' }).click();
```

`click()` korzysta z actionability: Playwright czeka, aż element będzie widoczny, stabilny, aktywny i możliwy do kliknięcia.

Opcje:

```typescript
await page.getByText('Plik').click({ button: 'right' });
await page.getByRole('button', { name: 'Otwórz' }).dblclick();
await page.getByRole('row', { name: /ORD-123/ }).click({ modifiers: ['Control'] });
await page.getByTestId('canvas').click({ position: { x: 20, y: 30 } });
```

Kliknięcie w konkretną pozycję jest przydatne dla canvasów, map i edytorów graficznych. W zwykłym UI preferuj locatory semantyczne.

## 2. `fill()` — domyślny wybór dla pól tekstowych

```typescript
await page.getByLabel('Email').fill('user@example.com');
```

`fill()` czyści pole i ustawia wartość. Jest szybkie i stabilne. Używaj go w większości formularzy.

Przykład:

```typescript
await page.getByLabel('Email').fill('user@example.com');
await page.getByLabel('Hasło').fill('Secret123!');
await page.getByRole('button', { name: 'Zaloguj' }).click();
```

## 3. `pressSequentially()` — znak po znaku

```typescript
await page.getByLabel('Szukaj').pressSequentially('laptop', { delay: 50 });
```

Używaj, gdy aplikacja reaguje na każde naciśnięcie klawisza:

- autocomplete;
- maski inputów;
- walidacja znak po znaku;
- edytory tekstu;
- komponenty, które obsługują `keydown`/`keyup`.

Nie używaj `pressSequentially()` wszędzie, bo spowolnisz testy bez potrzeby.

## 4. Klawiatura i skróty

```typescript
await page.getByLabel('Szukaj').press('Enter');
await page.keyboard.press('Control+A');
await page.keyboard.press('Backspace');
await page.keyboard.press('Escape');
```

Na macOS często używa się `Meta` zamiast `Control`. Jeśli test ma działać cross-platform, unikaj zależności od skrótów systemowych albo obsłuż warianty.

## 5. Checkboxy i radio buttons

Dla checkboxów używaj metod dedykowanych:

```typescript
await page.getByLabel('Akceptuję regulamin').check();
await expect(page.getByLabel('Akceptuję regulamin')).toBeChecked();

await page.getByLabel('Newsletter').uncheck();
await expect(page.getByLabel('Newsletter')).not.toBeChecked();
```

`check()` nie odznaczy elementu, jeśli już jest zaznaczony. To bezpieczniejsze niż zwykłe `click()`.

Radio:

```typescript
await page.getByLabel('Dostawa kurierem').check();
```

## 6. Hover i focus

```typescript
await page.getByRole('menuitem', { name: 'Produkty' }).hover();
await page.getByLabel('Email').focus();
```

`hover()` jest przydatny dla menu, tooltipów i komponentów pokazujących akcje dopiero po najechaniu.

Po hoverze zwykle dodaj asercję:

```typescript
await page.getByRole('button', { name: 'Pomoc' }).hover();
await expect(page.getByRole('tooltip')).toContainText('Centrum pomocy');
```

## 7. Select

Dla natywnego `<select>`:

```typescript
await page.getByLabel('Kraj').selectOption('PL');
await page.getByLabel('Kraj').selectOption({ label: 'Polska' });
await page.getByLabel('Kraj').selectOption({ index: 2 });
```

Dla custom selectów z bibliotek UI nie używaj `selectOption`, bo to nie jest prawdziwy element `<select>`:

```typescript
await page.getByRole('combobox', { name: 'Kraj' }).click();
await page.getByRole('option', { name: 'Polska' }).click();
```

## 8. Typowe błędy

- Klikanie `page.locator('button')` przy wielu przyciskach.
- Używanie `pressSequentially()` zamiast `fill()` bez powodu.
- Klikanie checkboxa przez `click()` i przypadkowe odznaczenie.
- Testowanie custom selecta przez `selectOption`.
- Wymuszanie `force: true`, bo locator wskazuje ukryty input zamiast widocznej kontrolki.
- Brak asercji po akcji.

## 9. Checklista akcji

- Czy akcja odpowiada temu, co może zrobić użytkownik?
- Czy locator jest jednoznaczny?
- Czy po akcji jest asercja rezultatu?
- Czy użyto dedykowanej metody dla checkboxa/selecta?
- Czy `pressSequentially()` jest potrzebne?
- Czy test nie polega na ukrytym elemencie technicznym?
- Czy brak `force: true` nie maskuje błędu UI?

## Linki

- [Input actions](https://playwright.dev/docs/input)
- [Actionability](https://playwright.dev/docs/actionability)
- [Locators](https://playwright.dev/docs/locators)

## 10. Akcja zawsze powinna mieć skutek

Kliknięcie bez asercji nie jest testem. Po każdej ważnej akcji sprawdź rezultat:

```typescript
await page.getByRole('button', { name: 'Zapisz' }).click();
await expect(page.getByRole('status')).toHaveText('Zapisano');
```

Jeśli akcja uruchamia request, możesz dodatkowo poczekać na odpowiedź, ale nadal sprawdzaj UI.

## 11. Realistyczne wprowadzanie danych

`fill()` jest najlepsze dla większości pól, ale nie sprawdza wszystkich zachowań klawiatury. Dla masek, autocomplete i pól reagujących na każde naciśnięcie używaj `pressSequentially`. Dla skrótów klawiszowych używaj `keyboard.press`.

## 12. Focus i accessibility

Akcje podstawowe są też okazją do testów dostępności:

```typescript
await page.keyboard.press('Tab');
await expect(page.getByLabel('Email')).toBeFocused();
```

Jeśli formularz nie da się obsłużyć klawiaturą, to problem jakości produktu, nie tylko testu.

## 13. Akcje myszy a testowanie canvasów i map

Czasem zwykły locator nie wystarczy, np. przy canvasie, mapie albo edytorze graficznym. Wtedy kliknięcie po pozycji jest uzasadnione:

```typescript
await page.getByTestId('map').click({ position: { x: 120, y: 80 } });
```

Taki test powinien mieć bardzo czytelną nazwę i komentarz, bo kliknięcie w koordynaty jest mniej odporne na zmianę layoutu niż locator po roli.

## 14. Akcje a walidacja formularzy

Dla formularzy sprawdzaj nie tylko sukces, ale też walidację po interakcji użytkownika:

```typescript
await page.getByLabel('Email').fill('niepoprawny-email');
await page.getByRole('button', { name: 'Zapisz' }).click();
await expect(page.getByRole('alert')).toContainText('Niepoprawny adres e-mail');
```

To potwierdza, że akcje użytkownika uruchamiają właściwe reguły UI.

## 15. Skróty klawiaturowe

Aplikacje administracyjne często mają skróty: zapis, wyszukiwanie, zamykanie modala. Test może je sprawdzić:

```typescript
await page.keyboard.press('Control+K');
await expect(page.getByRole('dialog', { name: 'Wyszukiwarka' })).toBeVisible();
await page.keyboard.press('Escape');
await expect(page.getByRole('dialog', { name: 'Wyszukiwarka' })).toBeHidden();
```

Na macOS może być potrzebny `Meta` zamiast `Control`, więc takie testy wymagają świadomego projektu.

## 16. Antywzorce akcji podstawowych

- Klikanie pierwszego lepszego `button`.
- Brak asercji po akcji.
- `force: true` bez wyjaśnienia.
- Używanie `pressSequentially` wszędzie, mimo że `fill` wystarczy.
- Testowanie ukrytych inputów zamiast widocznych kontrolek.

## 17. Zasada końcowa

Akcja w teście powinna przypominać zachowanie prawdziwego użytkownika. Jeśli test robi coś, czego użytkownik nie może zrobić, musisz mieć bardzo dobry powód i opisać go w kodzie.
