# Akcje zaawansowane — listy, pliki, pobieranie i scenariusze asynchroniczne

Po prostym klikaniu i wpisywaniu tekstu przychodzą scenariusze, które często sprawiają problemy w CI: upload plików, pobieranie faktur, custom selecty, drag and drop, systemowe okna wyboru pliku i weryfikacja zawartości plików. Playwright daje do tego stabilne API, ale wymaga poprawnego wzorca oczekiwania.

## 1. Natywne listy `<select>`

Dla klasycznych elementów HTML używaj `selectOption`:

```typescript
await page.getByLabel('Kraj').selectOption('PL');
await page.getByLabel('Kraj').selectOption({ label: 'Polska' });
await page.getByLabel('Kraj').selectOption({ index: 1 });
```

Po wyborze dodaj asercję:

```typescript
await expect(page.getByLabel('Kraj')).toHaveValue('PL');
```

## 2. Custom selecty

Biblioteki UI często tworzą select, który technicznie jest zestawem `button`, `div`, `listbox` i `option`. Wtedy `selectOption` nie zadziała.

```typescript
await page.getByRole('combobox', { name: 'Kraj' }).click();
await page.getByRole('option', { name: 'Polska' }).click();
await expect(page.getByRole('combobox', { name: 'Kraj' })).toContainText('Polska');
```

Jeśli komponent nie ma ról dostępności, testy będą trudniejsze. To sygnał, że komponent wymaga poprawy accessibility.

## 3. Upload pliku przez input

Najstabilniejszy wariant:

```typescript
await page.getByLabel('Załącz fakturę').setInputFiles('tests/assets/invoice.pdf');
await expect(page.getByText('invoice.pdf')).toBeVisible();
```

Możesz przesłać wiele plików:

```typescript
await page.getByLabel('Załączniki').setInputFiles([
  'tests/assets/file-1.txt',
  'tests/assets/file-2.txt',
]);
```

Wyczyszczenie inputa:

```typescript
await page.getByLabel('Załączniki').setInputFiles([]);
```

Nie używaj ścieżek typu `C:\Users\Jan\Desktop\plik.pdf`. Test musi działać w CI.

## 4. File chooser

Jeśli aplikacja otwiera systemowy wybór pliku po kliknięciu przycisku, użyj event-first pattern:

```typescript
const fileChooserPromise = page.waitForEvent('filechooser');
await page.getByRole('button', { name: 'Wybierz plik' }).click();
const fileChooser = await fileChooserPromise;
await fileChooser.setFiles('tests/assets/avatar.png');
```

Najpierw zaczynasz czekać na zdarzenie, potem klikasz. Dzięki temu nie przegapisz szybko wyemitowanego eventu.

## 5. Pobieranie plików

```typescript
const downloadPromise = page.waitForEvent('download');
await page.getByRole('link', { name: 'Pobierz fakturę' }).click();
const download = await downloadPromise;

expect(download.suggestedFilename()).toMatch(/faktura.*\.pdf/);
await download.saveAs(`test-results/${download.suggestedFilename()}`);
```

`download.path()` może mieć ograniczenia przy zdalnym połączeniu z przeglądarką. `saveAs()` jest zwykle bezpieczniejszym wyborem.

## 6. Weryfikacja zawartości pliku

Samo pobranie pliku nie zawsze wystarcza. Jeśli testujesz fakturę, raport CSV albo eksport XLSX, sprawdź zawartość.

Przykład dla prostego CSV:

```typescript
const downloadPromise = page.waitForEvent('download');
await page.getByRole('button', { name: 'Eksport CSV' }).click();
const download = await downloadPromise;
const path = `test-results/${download.suggestedFilename()}`;
await download.saveAs(path);

const content = await fs.promises.readFile(path, 'utf-8');
expect(content).toContain('ORD-12345');
```

## 7. Drag and drop

Dla elementów wewnątrz strony:

```typescript
await page.getByText('Zadanie A').dragTo(page.getByTestId('done-column'));
```

Dla upload zones coraz częściej potrzebne są specjalne mechanizmy DataTransfer. Playwright rozwija API wokół drag/drop, ale zawsze sprawdzaj aktualną dokumentację i zachowanie komponentu.

## 8. Typowe problemy

- Upload działa lokalnie, ale nie w CI, bo ścieżka jest absolutna.
- Test czeka na download po kliknięciu, ale event już się wydarzył — brak event-first pattern.
- Test sprawdza tylko nazwę pliku, ale nie zawartość.
- Custom select jest testowany jak natywny `<select>`.
- Pliki testowe są generowane w katalogu nieczyszczonym między runami.

## 9. Checklista

- Czy pliki testowe są w repozytorium, np. `tests/assets`?
- Czy upload używa ścieżek względnych?
- Czy download używa event-first pattern?
- Czy sprawdzasz nazwę i zawartość pliku?
- Czy custom select jest obsługiwany przez role `combobox`/`option`?
- Czy artefakty są zapisywane w `test-results` albo innym katalogu CI?
- Czy test sprząta pliki tymczasowe, jeśli generuje ich dużo?

## Linki

- [Input — upload files](https://playwright.dev/docs/input#upload-files)
- [Downloads](https://playwright.dev/docs/downloads)
- [Events](https://playwright.dev/docs/events)
- [Locator dragTo API](https://playwright.dev/docs/api/class-locator#locator-drag-to)
