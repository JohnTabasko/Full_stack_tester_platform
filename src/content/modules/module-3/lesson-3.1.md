# Locator Assertions: Zaawansowane asercje sieciowe (Web-First)

Podczas testowania interfejsu graficznego (UI), stany elementów HTML zmieniają się w sposób asynchroniczny pod wpływem renderowania kodu JavaScript oraz zapytań sieciowych. Sprawdzanie stanu elementu w sposób statyczny (np. odpytywanie o stan widoczności tylko raz) jest najczęstszą przyczyną niestabilności testów (flakiness).

Playwright Test eliminuje ten problem poprzez **Asercje Web-First (Locator Assertions)**. Są to inteligentne, asynchroniczne matchery, które automatycznie czekają i wielokrotnie ponawiają sprawdzanie stanu elementu (auto-polling) przed podjęciem decyzji o błędzie.

---

## 1. Katalog kluczowych asercji sieciowych (Web-First Matchers)

Wszystkie asercje sieciowe w Playwright przyjmują jako główny parametr instancję lokalizatora (`Locator`) i są poprzedzone słowem kluczowym `await`.

Oto najistotniejsze asercje wykorzystywane w projektach komercyjnych:

### A. Widoczność i obecność w DOM
*   `await expect(locator).toBeVisible()`: Czeka, aż element będzie w pełni widoczny na ekranie (rozmiar większy niż 0x0, brak stylów `display: none` lub `visibility: hidden`).
*   `await expect(locator).toBeHidden()`: Czeka, aż element całkowicie zniknie ze strony lub zostanie usunięty z drzewa DOM. Idealne do sprawdzania loaderów i spinnerów sieciowych.

### B. Interaktywność i edytowalność
*   `await expect(locator).toBeEnabled()`: Czeka, aż przycisk lub pole wyboru przestanie mieć atrybut `disabled`.
*   `await expect(locator).toBeEditable()`: Weryfikuje, czy pole tekstowe jest włączone i gotowe do edycji (nie posiada atrybutu `readonly`).

### C. Stan pól wyboru (Checkboxes & Radios)
*   `await expect(locator).toBeChecked()`: Weryfikuje, czy checkbox lub przycisk radiowy jest zaznaczony.

### D. Treści, wartości i klasy CSS
*   `await expect(locator).toHaveText('Wartość')`: Weryfikuje dokładną treść tekstową elementu.
*   `await expect(locator).toContainText('fraza')`: Sprawdza, czy element zawiera określoną frazę (mniej surowa wersja `toHaveText`).
*   `await expect(locator).toHaveValue('wpisany-tekst')`: Weryfikuje bieżącą wartość wpisaną do pola formularza `<input>`.
*   `await expect(locator).toHaveClass('active-row')`: Weryfikuje, czy element posiada określoną klasę CSS (np. sprawdzanie aktywnego wiersza w tabeli).

### E. Adresy i Tytuły
*   `await expect(page).toHaveURL('/dashboard')`: Oczekuje, aż adres URL przeglądarki zmieni się na pożądany format.
*   `await expect(page).toHaveTitle('Sklep MyCommerce')`: Sprawdza tytuł karty przeglądarki.

---

## 2. Pod maską: Mechanizm Auto-Polling i Timouty

Kiedy Playwright wykonuje asercję:

```typescript
await expect(page.locator('.alert-success')).toBeVisible();
```

W tle uruchamiana jest pętla, która w odstępach kilkunastu milisekund odpytuje drzewo DOM. Pętla ta działa do momentu spełnienia warunku widoczności lub przekroczenia dopuszczalnego czasu oczekiwania.

Czas ten jest określony parametrem `expect.timeout` w pliku `playwright.config.ts` (domyślnie wynosi **5000 ms** / 5 sekund). W razie potrzeby możesz go nadpisać dla pojedynczego wywołania:

```typescript
// Pozwól na dłuższy czas oczekiwania (np. przy powolnym generowaniu faktury)
await expect(page.locator('.invoice-download-btn')).toBeVisible({ timeout: 10000 });
```

---

## 3. Negowanie asercji sieciowych (`.not`)

Wszystkie asercje Web-First można zanegować za pomocą słowa `.not`. Playwright będzie wówczas oczekiwał na **zniknięcie** danego stanu:

```typescript
// Czekaj na zniknięcie komunikatu o ładowaniu danych
await expect(page.locator('.spinner-loader')).not.toBeVisible();
```

---

## 4. Wykorzystanie Migawki ARIA (ARIA Snapshots)

Nowoczesną i rekomendowaną w 2026 r. techniką weryfikacji dużych struktur dostępności na stronie są **ARIA Snapshots**. Pozwalają one sprawdzić, czy układ ról dostępności strony (nagłówki, przyciski, listy) odpowiada zadeklarowanemu wzorcowi:

```typescript
await expect(page.locator('#navigation-sidebar')).toMatchAriaSnapshot(`
  - navigation "Główne menu":
    - link "Pulpit"
    - link "Zamówienia"
    - link "Ustawienia"
`);
```

---

## 5. Checklista Asercji Sieciowych
- [ ] Czy do weryfikacji elementów UI używasz wyłącznie asynchronicznych asercji z `await expect()`?
- [ ] Czy całkowicie wyeliminowałeś tradycyjne asercje synchroniczne na stanach logicznych (np. `expect(await locator.isVisible()).toBe(true)`)?
- [ ] Czy stosujesz `.toBeHidden()` zamiast oczekiwać na usunięcie elementu ręcznym sleepem?
- [ ] Czy dostosowałeś timeouty asercji dla powolnych, asynchronicznych procesów backendowych?