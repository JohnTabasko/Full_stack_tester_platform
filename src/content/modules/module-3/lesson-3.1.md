# Asercje webowe (Web-First Assertions)

Asercje to serce testu. To one decydują, czy test przeszedł, czy padł. Playwright wprowadza mechanizm **Web-First Assertions**, który radykalnie zmienia sposób weryfikacji aplikacji webowych.

## 1. Filozofia: Auto-retrying Assertions

W tradycyjnych testach (np. Jest + Vanilla JS):
```javascript
const text = await page.innerText('.status');
expect(text).toBe('Gotowe');
```
Jeśli tekst 'Gotowe' pojawi się 10ms *po* wykonaniu pierwszej linii – test padnie.

W Playwright:
```typescript
await expect(page.locator('.status')).toHaveText('Gotowe');
```
Playwright nie sprawdza warunku raz. Będzie go sprawdzał w pętli przez określony czas (domyślnie **5 sekund**). Jeśli warunek zostanie spełniony w dowolnym momencie tego okna – asercja przechodzi natychmiast.

## 2. Najważniejsze asercje webowe

Jako Full Stack Tester musisz znać te metody na pamięć:
- `toBeVisible()` / `toBeHidden()`: Weryfikacja widoczności.
- `toHaveText('xyz')`: Sprawdza dokładny tekst (ignoruje białe znaki).
- `toContainText('xyz')`: Sprawdza, czy element zawiera fragment tekstu.
- `toHaveValue('123')`: Sprawdza wartość w polu `input`, `textarea` lub `select`.
- `toBeChecked()`: Sprawdza stan checkboxa lub radio buttona.
- `toHaveURL(/.*checkout/)`: Sprawdza aktualny adres URL (wspiera Regex!).

## 3. Miękkie asercje (Soft Assertions)

Zwykła asercja przerywa test natychmiast po błędzie. Czasem jednak chcesz sprawdzić kilka rzeczy na raz i zobaczyć listę wszystkich błędów na końcu.
```typescript
await expect.soft(page.getByTestId('user-name')).toHaveText('Jan');
await expect.soft(page.getByTestId('user-email')).toHaveText('jan@example.com');
```
Jeśli nazwa będzie błędna, Playwright odnotuje to w raporcie, ale **kontynuuje test**, aby sprawdzić e-mail. To oszczędza czas przy diagnozowaniu błędów w dużych formularzach.

## 4. Własne komunikaty błędów

W profesjonalnych raportach standardowe komunikaty mogą być mało czytelne. Możesz dodać własny opis:
```typescript
await expect(page.getByRole('alert'), 'Komunikat o błędzie logowania nie pojawił się!').toBeVisible();
```

## 5. Negacja asercji

Każda asercja może zostać zanegowana przez słowo `not`:
```typescript
await expect(page.getByRole('button')).not.toBeDisabled();
```

## Dobre praktyki i perspektywa QA
- **Zawsze używaj `await`**: Asercje webowe są asynchroniczne. Pominięcie `await` sprawi, że test przejdzie dalej przed zakończeniem sprawdzania!
- **Preferuj asercje specyficzne**: `toHaveText()` jest lepsze niż pobranie tekstu do zmiennej i użycie `toBe()`, ponieważ tylko to pierwsze posiada mechanizm auto-retry.

## Linki
- [Playwright Assertions Reference](https://playwright.dev/docs/test-assertions)
