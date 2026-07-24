# Zaawansowana automatyzacja formularzy i elementów interaktywnych

Wprowadzanie danych, obsługa list rozwijanych (dropdowns), zaznaczanie opcji (checkboxes, radio) oraz manipulowanie kalendarzami to serce testów funkcjonalnych aplikacji biznesowych i sklepów e-commerce.

W tej lekcji dowiesz się, jak poprawnie symulować interakcję z formularzami, w tym z niestandardowymi polami wyboru zbudowanymi w technologiach React/Vue, które nie korzystają z tradycyjnych tagów HTML `<select>`.

---

## 1. Wprowadzanie tekstu: `fill()` vs `pressSequentially()`

Playwright udostępnia dwie metody wprowadzania tekstu do pól `<input>` oraz `<textarea>`:

### A. Metoda `fill()` (Rekomendowana, szybka)
Błyskawicznie nadpisuje całą wartość pola wejściowego, emulując zachowanie "kopiuj-wklej". Wyzwala wszystkie zdarzenia sieciowe i walidacyjne (`input`, `change`).
```typescript
await page.getByLabel('Imię i nazwisko').fill('Jan Kowalski');
```

### B. Metoda `pressSequentially()` (Powolna, emulacja klawiatury)
Wpisuje znaki po kolei, jeden po drugim, wyzwalając zdarzenia klawiatury (`keydown`, `keypress`, `keyup`).
*   **Kiedy stosować?** Używaj wyłącznie przy testowaniu pól z autouzupełnianiem (auto-complete), wyszukiwarek dynamicznych lub specyficznych masek wprowadzania (np. numerów kart kredytowych).
```typescript
// Symuluje fizyczne wciskanie klawiszy na klawiaturze z opóźnieniem 100ms między znakami
await page.getByPlaceholder('Wyszukaj produkt...').pressSequentially('buty', { delay: 100 });
```

---

## 2. Obsługa list rozwijanych (Dropdowns)

Sposób automatyzacji dropdownu zależy od jego budowy technicznej:

### A. Tradycyjny dropdown oparty o znacznik `<select>`
Jeśli deweloper użył standardowego znacznika HTML, do wyboru opcji stosujemy dedykowaną metodę `.selectOption()`:
```typescript
// Wybierz opcję na podstawie wartości (value), tekstu wyświetlanego lub indeksu
await page.getByLabel('Wybierz kraj').selectOption({ label: 'Polska' });
await page.getByLabel('Wybierz kraj').selectOption({ value: 'PL' });
```

### B. Niestandardowy dropdown (React Select / Div-based Dropdowns)
Współczesne aplikacje często używają bibliotek frontendowych tworzących dropdowny z divów i list. W ich przypadku nie zadziała metoda `.selectOption()`. Musimy zasymulować sekwencję kliknięć prawdziwego użytkownika:
```typescript
// 1. Kliknij w kontener dropdownu, aby go otworzyć
await page.getByTestId('custom-dropdown-container').click();

// 2. Kliknij w wybraną opcję z listy, która się wyrenderowała
await page.getByRole('option', { name: 'Karta Kredytowa' }).click();
```

---

## 3. Checkboxy i przyciski radiowe (Radio Buttons)

Do manipulacji stanem pól wyboru stosujemy bezpieczne metody `.check()` oraz `.uncheck()`. Przed zaznaczeniem, Playwright automatycznie upewni się, czy element nie jest już w wybranym stanie, zapobiegając przypadkowemu odznaczeniu:

```typescript
// Zaznacz checkbox (jeśli nie jest zaznaczony)
await page.getByLabel('Akceptuję regulamin sklepu').check();

// Zweryfikuj stan za pomocą dedykowanej asercji Web-First
await expect(page.getByLabel('Akceptuję regulamin sklepu')).toBeChecked();
```

---

## 4. Checklista Formularzy
- [ ] Czy dobrałeś odpowiednią metodę wprowadzania tekstu (`fill` do standardowych pól, `pressSequentially` dla wyszukiwarek/dynamic autocomplete)?
- [ ] Czy poprawnie obsłużyłeś niestandardowy dropdown symulując sekwencję otwarcia i wyboru elementu z listy?
- [ ] Czy do weryfikacji stanów pól wyboru stosujesz dedykowaną asercję Web-First `expect(locator).toBeChecked()`?