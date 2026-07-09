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
