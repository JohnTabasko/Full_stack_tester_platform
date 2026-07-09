# Akcje zaawansowane: Listy, Pliki i Pobieranie

Jako Full Stack Tester często napotkasz scenariusze wykraczające poza proste kliknięcia. Obsługa plików i list wyboru wymaga znajomości asynchronicznej natury przeglądarki.

## 1. Listy wyboru (Select)

Dla klasycznych elementów `<select>` używamy dedykowanej metody:
```typescript
await page.getByLabel('Wybierz kraj').selectOption('PL'); // Po wartości (value)
await page.getByLabel('Wybierz kraj').selectOption({ label: 'Polska' }); // Po tekście (label)
```
*Uwaga*: Jeśli Twoja aplikacja używa "Custom Selects" (np. z biblioteki Material UI lub Select2), to nie są to elementy `<select>`. Musisz je testować klikając w przycisk i szukając opcji na liście (używając standardowych metod `click()`).

## 2. Wysyłanie plików (File Upload)

W Playwright nie musisz klikać w przycisk "Przeglądaj". Możesz wstrzyknąć plik bezpośrednio do inputa:
```typescript
await page.setInputFiles('input[type="file"]', 'path/to/file.pdf');
```
Jeśli chcesz wysłać wiele plików:
```typescript
await page.setInputFiles('input[type="file"]', ['file1.txt', 'file2.txt']);
```

## 3. Pobieranie plików (Download)

Pobieranie plików w testach automatycznych jest trudne, bo przeglądarka zazwyczaj otwiera systemowe okno dialogowe. Playwright rozwiązuje to poprzez nasłuchiwanie zdarzenia:
```typescript
// Start waiting for download before clicking
const downloadPromise = page.waitForEvent('download');
await page.getByRole('link', { name: 'Pobierz fakturę' }).click();
const download = await downloadPromise;

// Save the file
await download.saveAs('/path/to/save/invoice.pdf');
console.log(download.suggestedFilename());
```

## 4. Dobre praktyki i perspektywa QA
- **Dane testowe**: Pliki do uploadu trzymaj w katalogu `tests/assets/` lub `data/` wewnątrz repozytorium. Nigdy nie używaj bezwzględnych ścieżek (`C:\Users\...`), bo testy padną na CI.
- **Weryfikacja pobrania**: Nie sprawdzaj tylko czy plik się pobrał. Użyj bibliotek typu `pdf-parse` lub `exceljs`, aby zajrzeć do środka pliku i sprawdzić czy dane są poprawne.

## Linki
- [Upload files](https://playwright.dev/docs/input#upload-files)
- [Downloads](https://playwright.dev/docs/downloads)
