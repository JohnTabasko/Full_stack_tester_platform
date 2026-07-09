# Dialogi, zdarzenia i event-first pattern

Nowoczesne aplikacje webowe nie składają się wyłącznie z kliknięć i asercji na elementach. Przeglądarka emituje zdarzenia: otwarcie popupu, pobranie pliku, pojawienie się dialogu, request sieciowy, komunikat konsoli, błąd strony, WebSocket albo nowa karta. Playwright pozwala te zdarzenia przechwytywać i kontrolować.

Najważniejsza zasada tej lekcji: **najpierw zacznij czekać na zdarzenie, potem wykonaj akcję, która je wywołuje**. To jest event-first pattern.

## 1. Dlaczego event-first pattern jest ważny

Antywzorzec:

```typescript
await page.getByRole('button', { name: 'Otwórz raport' }).click();
const popup = await page.waitForEvent('popup');
```

Jeśli popup otworzy się bardzo szybko, test może przegapić zdarzenie i czekać aż do timeoutu.

Poprawny wzorzec:

```typescript
const popupPromise = page.waitForEvent('popup');
await page.getByRole('button', { name: 'Otwórz raport' }).click();
const popup = await popupPromise;
await expect(popup.getByRole('heading', { name: 'Raport' })).toBeVisible();
```

## 2. Dialogi: alert, confirm, prompt

Przeglądarkowe dialogi blokują stronę. Playwright musi je obsłużyć jawnie.

```typescript
page.on('dialog', async dialog => {
  expect(dialog.type()).toBe('confirm');
  expect(dialog.message()).toContain('Czy na pewno usunąć?');
  await dialog.accept();
});

await page.getByRole('button', { name: 'Usuń konto' }).click();
```

Dla prompt:

```typescript
page.on('dialog', async dialog => {
  await dialog.accept('Powód anulowania');
});
```

Dla anulowania:

```typescript
page.on('dialog', async dialog => {
  await dialog.dismiss();
});
```

## 3. `once` zamiast `on`

Jeśli dialog ma pojawić się tylko raz, użyj `once`, aby handler nie został aktywny dla kolejnych dialogów:

```typescript
page.once('dialog', async dialog => {
  await dialog.accept();
});
```

To ogranicza przypadkowe interakcje w dalszej części testu.

## 4. Beforeunload

Niektóre aplikacje pokazują ostrzeżenie przy opuszczaniu strony z niezapisanymi zmianami.

```typescript
page.once('dialog', async dialog => {
  expect(dialog.type()).toBe('beforeunload');
  await dialog.accept();
});

await page.close({ runBeforeUnload: true });
```

Takie testy są przydatne dla formularzy, edytorów i paneli administracyjnych.

## 5. Popup i nowe karty

```typescript
const pagePromise = context.waitForEvent('page');
await page.getByRole('link', { name: 'Dokumentacja' }).click();
const newPage = await pagePromise;
await newPage.waitForLoadState();
await expect(newPage).toHaveURL(/docs/);
```

Jeśli popup jest bezpośrednio związany z konkretną stroną, możesz użyć `page.waitForEvent('popup')`. Jeśli chcesz złapać dowolną nową stronę w kontekście, użyj `context.waitForEvent('page')`.

## 6. Download jako zdarzenie

```typescript
const downloadPromise = page.waitForEvent('download');
await page.getByRole('link', { name: 'Pobierz fakturę' }).click();
const download = await downloadPromise;
await download.saveAs(`test-results/${download.suggestedFilename()}`);
```

Ten wzorzec jest obowiązkowy dla downloadów, bo kliknięcie i zdarzenie pobrania dzieją się asynchronicznie.

## 7. File chooser jako zdarzenie

```typescript
const chooserPromise = page.waitForEvent('filechooser');
await page.getByRole('button', { name: 'Wybierz plik' }).click();
const chooser = await chooserPromise;
await chooser.setFiles('tests/assets/avatar.png');
```

Jeśli masz dostęp do inputa, `setInputFiles` jest prostsze. File chooser jest potrzebny, gdy upload jest ukryty za przyciskiem.

## 8. Console i page errors

Zdarzenia konsoli pomagają diagnozować błędy frontendowe:

```typescript
const errors: string[] = [];
page.on('console', message => {
  if (message.type() === 'error') errors.push(message.text());
});

page.on('pageerror', error => {
  errors.push(error.message);
});
```

W fixture możesz dołączać te logi do raportu przy awarii przez `testInfo.attach`.

## 9. Request i response events

```typescript
page.on('request', request => {
  console.log('>>', request.method(), request.url());
});

page.on('response', response => {
  console.log('<<', response.status(), response.url());
});
```

Do asercji zwykle lepsze jest `waitForResponse`, ale eventy są bardzo dobre do diagnostyki i logowania.

## 10. WebSocket events

```typescript
page.on('websocket', ws => {
  console.log(`WebSocket opened: ${ws.url()}`);
  ws.on('framesent', event => console.log('sent', event.payload));
  ws.on('framereceived', event => console.log('received', event.payload));
});
```

To przydatne przy aplikacjach realtime: czaty, powiadomienia, dashboardy i statusy zamówień.

## 11. Antywzorce

- Czekanie na event po akcji, która mogła już go wyemitować.
- Stałe handlery `page.on('dialog')` zostawione na cały test bez potrzeby.
- Brak asercji na treść dialogu.
- Test downloadu, który nie sprawdza nazwy ani zawartości pliku.
- Ignorowanie błędów konsoli w krytycznych flow.

## 12. Checklista

- Czy oczekiwanie na event zaczyna się przed akcją?
- Czy dialog jest zaakceptowany albo odrzucony świadomie?
- Czy popup ma asercję URL albo widocznego stanu?
- Czy download jest zapisany i zweryfikowany?
- Czy logi konsoli pomagają w diagnostyce?
- Czy handler `on` nie powinien być `once`?

## Linki

- [Events](https://playwright.dev/docs/events)
- [Dialogs](https://playwright.dev/docs/dialogs)
- [Pages](https://playwright.dev/docs/pages)
- [Downloads](https://playwright.dev/docs/downloads)
- [Network](https://playwright.dev/docs/network)
