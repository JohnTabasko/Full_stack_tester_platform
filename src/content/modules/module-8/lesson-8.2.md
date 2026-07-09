# API lokatorów: Zaawansowana praca z elementami

> **Perspektywa Full Stack Testera**
> Lokator to fundament każdego testu Playwright. To na nim opiera się każda interakcja z interfejsem — każde kliknięcie, każde wypełnienie formularza, każda asercja widoczności. Jako Full Stack Tester powinieneś znać lokatory Playwrighta na poziomie eksperckim: nie tylko "jak znaleźć element", ale dlaczego jeden selektor jest stabilniejszy od drugiego, kiedy używać `filter()` zamiast `nth()`, jak budować lokalne ścieżki do elementów i jak diagnozować problemy z lokatorami w Trace Viewerze. Ten rozdział zamienia Cię z początkującego, który klepie losowe selektory, w inżyniera, który projektuje strategię lokalizacji elementów.

## Cel lekcji

Po ukończeniu tej lekcji rozumiesz filozofię i hierarchię API lokatorów Playwrighta, potrafisz używać wszystkich kluczowych metod (`all()`, `filter()`, `nth()`, `first()`, `last()`, `count()`), znasz strategie budowania stabilnych, kontekstowych ścieżek do elementów, rozumiesz różnicę między lokalizacją przez rolę, etykietę i tekst, potrafisz debugować problemy z lokatorami i wiesz, jak wybierać najlepszy typ lokatora dla każdego scenariusza.

---

## Architektura Lokatorów w Playwright

### Czym jest Locator?

`Locator` to obiekt reprezentujący kryteria wyszukiwania elementu (nie sam element). Gdy wywołujesz `page.getByRole('button', { name: 'Zapisz' })`, nie znajdujesz jeszcze przycisku — tworzysz **receptę** na jego znalezienie. Element jest lokalizowany dopiero przy pierwszej interakcji (click, fill, assert).

```typescript
const locator = page.getByRole('button', { name: 'Zapisz' });

// W tym momencie NIE ma interakcji z DOM — tylko definicja
await locator.click(); // Tutaj Playwright szuka elementu

// Możesz wywołać wiele akcji na tym samym lokatorze — każda szuka elementu osobno
await locator.click();     // Szuka od nowa (przydatne przy dynamicznych stronach)
await locator.isVisible(); // Szuka od nowa
```

### Dlaczego Locator, a nie ElementHandle?

W tradycyjnym Selenium, `WebElement` to "uchwyt" na znaleziony element. Jeśli element zniknie z DOM (np. przez re-render Reacta), uchwyt staje się "stale element reference" — martwy pointer do nieistniejącego węzła DOM.

Playwright rozwiązuje to przez **leniwe lokalizowanie**: `Locator` nie trzyma referencji do węzła DOM. Za każdym razem, gdy wywołujesz akcję, Playwright szuka elementu na nowo — tym samym jest odporny na dynamiczne zmiany DOM.

```typescript
// ❌ Stary styl (Selenium-like) — podatny na stale element
const button = await page.$('button#save'); // Znajduje element RAZ, trzyma uchwyt
await button.click(); // Jeśli element zniknął i wrócił → stale element reference!

// ✅ Playwright style — odporny na dynamiczne zmiany DOM
const button = page.getByRole('button', { name: 'Zapisz' }); // Tylko definicja
await button.click(); // Szuka elementu TU i TERAZ (auto-retry)
await button.click(); // Szuka elementu NA NOWO po re-renderze
```

---

## Hierarchia typów lokatorów

Playwright oferuje hierarchię lokatorów, od najbardziej semantycznych do najbardziej niskopoziomowych:

```
🟢 Priorytet 1: Semantyczne (role, label, text) — najlepsze
🟡 Priorytet 2: Zorientowane na dane (test-id)
🠊 Priorytet 3: CSS / XPath — używaj ostrożnie
🔴 Priorytet 4: JavaScript — tylko w ostateczności
```

### Priorytet 1: getByRole() — lokator semantyczny

`getByRole()` to najlepszy lokator w Playwright. Opiera się na semantyce ARIA (Accessible Rich Internet Applications) — mówi "znajdź element o tej roli z tym imieniem", nie "znajdź element z tym CSS".

```typescript
// Znajdź przycisk
await page.getByRole('button', { name: 'Zapisz' }).click();

// Znajdź link
await page.getByRole('link', { name: 'Przejdź do koszyka' }).click();

// Znajdź pole tekstowe
await page.getByRole('textbox', { name: 'Adres email' }).fill('test@example.pl');

// Znajdź checkbox
await page.getByRole('checkbox', { name: 'Akceptuję regulamin' }).check();

// Znajdź alert
await page.getByRole('alert').getByText('Błąd krytyczny').isVisible();

// Znajdź heading (nagłówek)
await page.getByRole('heading', { name: 'Twój koszyk' }).isVisible();

// Znajdź option w liście
await page.getByRole('option', { name: 'Polska' }).click();

// Znajdź dialog (modal)
await page.getByRole('dialog', { name: 'Potwierdź usunięcie' }).isVisible();
```

**Dlaczego getByRole jest najlepszy:**
- Opiera się na semantyce, nie na implementacji (nie zależy od CSS/id/class).
- Automatycznie rozwiązuje problem "hidden labels" (element ma etykietę, ale nie jest widoczna w kodzie).
- Odzwierciedla sposób, w jaki użytkownik widzi interfejs (przycisk "Zapisz" → `button` z `name="Zapisz"`).
- Jest odporny na refaktoryzację CSS.

### Priorytet 1: getByLabel() — dla formularzy

Do pól formularzy: `getByLabel()` łączy pole input z jego etykietą tekstową. Działa na wiele sposobów łącznie (for attribute, aria-label, placeholder, title):

```typescript
// Wszystkie te scenariusze są obsługiwane przez getByLabel('Email'):

// <label for="email">Email</label> <input id="email" />
// <input aria-label="Email" />
// <input placeholder="Email" />
// <label>Email <input /></label>

await page.getByLabel('Email').fill('jan.kowalski@example.pl');
await page.getByLabel('Hasło', { exact: true }).fill('haslo123');
await page.getByLabel(/^Hasło$/).fill('haslo123'); // Regex — dokładne dopasowanie
await page.getByLabel('Szukaj...', { exact: false }).fill('produkt');
```

### Priorytet 1: getByText() — po treści

Lokator tekstowy — znajduje element zawierający określony tekst:

```typescript
// Wszystkie elementy z tekstem "Cena"
await page.getByText('Cena').isVisible();

// Dokładne dopasowanie (exact)
await page.getByText('Produkt dodany do koszyka', { exact: true }).isVisible();

// Regex pattern
await page.getByText(/Cena:\s*\d+,\d{2}/).isVisible(); // "Cena: 99,99 zł"

// Ignorowanie wielkości liter
await page.getByText('zalogowany', { exact: false }).isVisible();

// Szukaj w elemencie podrzędnym
await page.getByText('Numer zamówienia').locator('span').innerText();
```

### Priorytet 2: getByTestId() — stabilny identyfikator

`data-testid` to specjalny atrybut dodany do elementów wyłącznie na potrzeby testów. Zapewnia stabilność niezależną od CSS, treści i struktury:

```typescript
// HTML: <button data-testid="submit-form">Wyślij</button>
await page.getByTestId('submit-form').click();

// Zalety:
// - Nie zależy od CSS (class, id)
// - Nie zależy od treści (tekst może się zmienić)
// - Nie zależy od struktury DOM
// - Jednoznaczny — każdy element ma unikalny testId
```

**Konwencja namingowa dla testId:**

```typescript
// Dobrze — semantyczny, opisowy
page.getByTestId('submit-order-button')
page.getByTestId('order-summary-total')
page.getByTestId('product-card-ORD-123')

// Źle — techniczny, nieczytelny
page.getByTestId('btn1')           // Co to jest btn1?
page.getByTestId('el_123')         // Skąd ten ID?
page.getByTestId('div-container')  // Nazwa elementu, nie roli
```

### Priorytet 3: CSS i XPath — używaj rzadko

Gdy semantyczne lokatory nie wystarczą, użyj CSS/XPath — ale świadomie:

```typescript
// CSS Selector — gdy znasz strukturę
await page.locator('form.contact-form .submit-button').click();
await page.locator('table.orders tr:nth-child(2) td.price').innerText();

// XPath — dla złożonych ścieżek lub warunków tekstowych
await page.locator('xpath=//button[contains(text(), "Zapisz") and @disabled]').click();
await page.locator('xpath=//div[@class="product"][position()=1]//a[@href]').click();

// ⚠️ Ostrzeżenie: XPath w Playwright jest powolniejszy od CSS
// Używaj tylko gdy nie ma alternatywy semantycznej
```

---

## Praca z wieloma elementami jednocześnie

### all() — pobranie kolekcji elementów

`all()` zwraca tablicę lokatorów dla wszystkich elementów pasujących do kryterium:

```typescript
test('weryfikuj listę produktów', async ({ page }) => {
  await page.goto('/products');
  
  // Pobierz wszystkie wiersze tabeli
  const productRows = page.getByRole('row').all();
  
  // Liczba wierszy powinna być > 0
  const count = await productRows.length;
  expect(count).toBeGreaterThan(0);
  
  // Iteruj po każdym wierszu
  for (const row of await productRows) {
    const name = await row.getByRole('cell').nth(0).innerText();
    const price = await row.getByRole('cell').nth(1).innerText();
    
    console.log(`${name}: ${price}`);
    
    // Każdy produkt powinien mieć cenę > 0
    const priceNum = parseFloat(price.replace(/[^\d,]/g, '').replace(',', '.'));
    expect(priceNum).toBeGreaterThan(0);
  }
});

test('wszystkie przyciski akcji są widoczne', async ({ page }) => {
  const buttons = await page.getByRole('button').all();
  
  for (const button of buttons) {
    await expect(button).toBeVisible();
  }
});
```

**⚠️ Uwaga: `all()` nie czeka na elementy!**

```typescript
// ❌ Problem: all() nie czeka — jeśli lista ładuje się asynchronicznie,
// możesz dostać pustą tablicę mimo, że elementy wkrótce się pojawią
const rows = await page.locator('tr.product-row').all();
if (rows.length === 0) throw new Error('Lista jest pusta!');

// ✅ Rozwiązanie: najpierw poczekaj na widoczność listy
await expect(page.locator('tr.product-row').first()).toBeVisible();
const rows = await page.locator('tr.product-row').all();
expect(rows.length).toBeGreaterThan(0);
```

### count() — liczba elementów

```typescript
test('tabela ma dokładnie 10 wierszy', async ({ page }) => {
  await page.goto('/orders');
  
  // Oczekiwana liczba wierszy w tabeli zamówień
  const rowCount = await page.getByRole('row').count();
  expect(rowCount).toBe(10);
});

test('lista kategorii nie jest pusta', async ({ page }) => {
  const categories = await page.locator('.category-item').count();
  expect(categories).toBeGreaterThan(0);
});

test('wszystkie opcje są zaznaczone (checkboxy)', async ({ page }) => {
  await page.goto('/settings');
  
  const checkboxes = page.getByRole('checkbox').all();
  const count = await checkboxes.length;
  
  for (const checkbox of checkboxes) {
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  }
  
  expect(await page.getByRole('checkbox').count()).toBe(count); // Wszystkie zaznaczone
});
```

### nth(), first(), last() — wybór pozycji

```typescript
// Pierwszy element
const firstRow = page.getByRole('row').first();

// Ostatni element
const lastRow = page.getByRole('row').last();

// Element o konkretnym indeksie (0-based)
const thirdRow = page.getByRole('row').nth(2); // Trzeci wiersz

// Przykład: kliknij przycisk "Edytuj" w drugim wierszu tabeli
await page.getByRole('row').nth(1).getByRole('button', { name: 'Edytuj' }).click();
```

**⚠️ Ostrzeżenie: Unikaj nth() gdy możesz użyć filter()!**

Indeks to najniższy poziom stabilności. Gdy programista doda nowy wiersz na górze tabeli, `nth(2)` będzie wskazywać na inny produkt. Filter po unikalnej treści jest znacznie stabilniejszy:

```typescript
// ❌ Niestabilny — zmiana kolejności psuje test
await page.getByRole('row').nth(2).getByRole('button', { name: 'Szczegóły' }).click();

// ✅ Stabilny — szukasz konkretnego wiersza po treści
await page.getByRole('row')
  .filter({ hasText: 'iPhone 15 Pro' })
  .getByRole('button', { name: 'Szczegóły' })
  .click();
```

---

## Filter() — najpotężniejsze narzędzie lokatorów

### Filtrowanie po tekście

```typescript
// Znajdź wiersz tabeli zawierający tekst "iPhone 15"
const row = page.getByRole('row').filter({ hasText: 'iPhone 15' });

// Dokładne dopasowanie (bez częściowego)
const exactRow = page.getByRole('row').filter({ hasText: /iPhone 15 Pro$/ }); // Kończy się na tym

// Regex pattern
const highPriceRows = page.getByRole('row').filter({ hasText: /\d{3,} PLN/ }); // Wiersze z ceną > 999 PLN
```

### Filtrowanie po zagnieżdżonym lokatorze

`filter({ has: ... })` pozwala zawęzić wyniki do elementów, które zawierają inny element (lub elementy):

```typescript
// Znajdź wiersz, który zawiera przycisk "Usuń"
const deletableRows = page.getByRole('row').filter({
  has: page.getByRole('button', { name: 'Usuń' }),
});

// Znajdź kartę produktu, która zawiera tekst "Dostępny" i przycisk "Do koszyka"
const availableProducts = page.locator('.product-card').filter({
  has: page.getByText('Dostępny'),
  has: page.getByRole('button', { name: 'Do koszyka' }),
});

// Znajdź wiersz z określonym ID zamówienia i statusem
const pendingOrder = page.getByRole('row').filter({
  hasText: 'ORD-12345',
  has: page.getByText('Oczekuje na płatność'),
});
```

### Łączenie wielu filtrów

```typescript
// Znajdź wiersz z konkretnym produktem, określonym statusem i ceną
const filteredRow = page.getByRole('row').filter({
  hasText: 'iPhone 15 Pro',        // Zawiera nazwę produktu
}).filter({
  has: page.getByText('Wysłano'),  // Zawiera status "Wysłano"
}).filter({
  has: page.locator('td.price:has-text("8999")'), // Zawiera cenę
});

// Kliknij "Śledź" w przefiltrowanym wierszu
await filteredRow.getByRole('button', { name: 'Śledź przesyłkę' }).click();
```

### Łączenie filtrów z nawigacją kontekstową

Najpotężniejszy wzorzec: najpierw znajdź kontener (tabelę, sekcję), potem działaj w jego kontekście:

```typescript
test('edytuj konkretny produkt w tabeli', async ({ page }) => {
  await page.goto('/admin/products');
  
  // Krok 1: Znajdź wiersz z produktem "Samsung Galaxy S24"
  const productRow = page.locator('table.products tr').filter({
    hasText: 'Samsung Galaxy S24',
  });
  
  // Krok 2: W kontekście tego wiersza znajdź przycisk "Edytuj"
  await productRow.getByRole('button', { name: 'Edytuj' }).click();
  
  // Krok 3: Zweryfikuj, że formularz edycji się otworzył
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByLabel('Nazwa produktu')).toHaveValue('Samsung Galaxy S24');
});

test('usuń zamówienie o określonym ID', async ({ page }) => {
  await page.goto('/admin/orders');
  
  const orderRow = page.locator('tr.order-row').filter({
    hasText: 'ORD-98765',
  });
  
  // Potwierdź, że to jest właściwy wiersz — weryfikuj konkretne dane
  await expect(orderRow.getByText('Jan Kowalski')).toBeVisible();
  await expect(orderRow.getByText('499,99 zł')).toBeVisible();
  
  // Kliknij "Usuń"
  await orderRow.getByRole('button', { name: 'Usuń' }).click();
  
  // Potwierdź w modalnym dialogu
  await page.getByRole('dialog').getByRole('button', { name: 'Potwierdź usunięcie' }).click();
  
  // Wiersz powinien zniknąć
  await expect(page.locator('tr.order-row').filter({ hasText: 'ORD-98765' })).not.toBeVisible();
});
```

---

## Debugowanie problemów z lokatorami

### Pick Locator — interaktywne znajdowanie selektorów

```bash
# Uruchom tryb interaktywny — możesz najeżdżać myszą na elementy
# i Playwright podpowie najlepszy selektor
npx playwright test --ui

# Lub w Inspectorze:
npx playwright test --debug
# W oknie debuggera: kliknij element prawym przyciskiem → "Pick locator"
```

### Sprawdzanie lokatorów w konsoli

```typescript
test('diagnostyka lokatora', async ({ page }) => {
  await page.goto('/products');
  
  const locator = page.getByRole('button', { name: 'Dodaj do koszyka' });
  
  // Ile elementów pasuje do tego lokatora?
  const count = await locator.count();
  console.log(`Znaleziono ${count} elementów`);
  
  // Pierwszy element — jaki ma tekst?
  const firstText = await locator.first().innerText();
  console.log(`Pierwszy element ma tekst: "${firstText}"`);
  
  // Czy element jest widoczny?
  const isVisible = await locator.first().isVisible();
  console.log(`Element jest widoczny: ${isVisible}`);
  
  // Czy element jest włączony?
  const isEnabled = await locator.first().isEnabled();
  console.log(`Element jest włączony: ${isEnabled}`);
  
  // Lista wszystkich pasujących elementów
  const allElements = await locator.all();
  for (let i = 0; i < allElements.length; i++) {
    const tag = await allElements[i].evaluate(el => el.tagName);
    const text = await allElements[i].innerText();
    console.log(`Element ${i}: <${tag}> "${text}"`);
  }
});
```

### Typowe problemy i rozwiązania

| Problem | Przyczyna | Rozwiązanie |
|---|---|---|
| `locator.count() === 0` | Element jeszcze się nie załadował | Dodaj `await expect(locator).toBeVisible()` |
| `locator.count() > 1` | Lokator jest zbyt ogólny | Użyj `filter()` do zawężenia |
| `locator.click()` pada mimo że element istnieje | Element jest zasłonięty (overlay, modal) | Użyj `{ force: true }` lub zamknij overlay |
| Lokator działa lokalnie, nie na CI | Różne dane / asynchroniczne ładowanie | Dodaj `waitForLoadState('networkidle')` |
| Element znika po chwili | Animacja, lazy loading | Użyj `waitForSelector({ state: 'visible' })` |
| Stale element reference | Element został usunięty i dodany na nowo | Playwright automatycznie szuka na nowo — jeśli używasz Locator |

### Automatyczne generowanie tekstu asercji z Lokatora

```typescript
test('generuj snapshoty tekstów dla wszystkich elementów', async ({ page }) => {
  await page.goto('/products');
  
  const cards = page.locator('.product-card').all();
  const count = await cards.length;
  
  for (let i = 0; i < count; i++) {
    const card = cards[i];
    const name = await card.getByRole('heading').innerText();
    const price = await card.getByText(/\d+,\d{2}/).innerText();
    const button = await card.getByRole('button').innerText();
    
    console.log(`[${i + 1}] ${name} — ${price} — "${button}"`);
  }
  
  // Zapisz snapshot do pliku
  const snapshot = await page.evaluate(() => {
    const cards = document.querySelectorAll('.product-card');
    return Array.from(cards).map(c => ({
      name: c.querySelector('h3')?.textContent,
      price: c.querySelector('.price')?.textContent,
    }));
  });
  
  console.log(JSON.stringify(snapshot, null, 2));
});
```

---

## Dobre praktyki dla strategii lokalizacji

### 1. Preferuj semantyczne lokatory

```typescript
// ✅ Najlepsze — semantyczne (role, label)
await page.getByRole('button', { name: 'Zapisz' }).click();
await page.getByLabel('Email').fill('test@example.pl');
await page.getByRole('link', { name: 'Powrót do strony głównej' }).click();

// ✅ Dobre — test-id (stabilne, ale wymaga dodania do kodu)
await page.getByTestId('save-button').click();

// ⚠️ Zrób tak w ostateczności — CSS jest niestabilny
await page.locator('button.btn-primary.submit-form').click();
```

### 2. Buduj lokalne ścieżki (contextual paths)

```typescript
// ✅ Dobrze — lokalna ścieżka (kontekst kontenera)
const row = page.getByRole('row').filter({ hasText: 'ORD-123' });
await row.getByRole('button', { name: 'Szczegóły' }).click();

// ❌ Źle — globalny selektor (może pasować do wielu elementów)
await page.getByRole('button', { name: 'Szczegóły' }).click();
// Jeśli na stronie jest więcej niż jeden przycisk "Szczegóły", który zostanie kliknięty?
```

### 3. Stabilizuj dynamiczne elementy

```typescript
// Gdy lista jest dynamiczna (filtr, sortowanie), poczekaj na stabilizację
test('sortuj produkty po cenie', async ({ page }) => {
  await page.goto('/products');
  
  // Kliknij sortowanie po cenie
  await page.getByRole('button', { name: 'Sortuj: Cena rosnąco' }).click();
  
  // Poczekaj na ustabilizowanie listy (brak aktywnych żądań sieciowych)
  await page.waitForLoadState('networkidle');
  
  // Dopiero teraz sprawdź pierwszy produkt
  const firstPrice = await page.getByRole('row').first().locator('.price').innerText();
  const secondPrice = await page.getByRole('row').nth(1).locator('.price').innerText();
  
  expect(parseFloat(firstPrice)).toBeLessThanOrEqual(parseFloat(secondPrice));
});
```

### 4. Unikaj selektorów opartych na pozycji

```typescript
// ❌ Niestabilny — pozycja może się zmienić
const thirdItem = page.locator('li').nth(2);

// ✅ Stabilny — treść jest unikalna
const targetItem = page.locator('li').filter({ hasText: 'Samsung Galaxy S24' });
```

### 5. Dokumentuj nietrywialne lokatory

```typescript
// Gdy używasz złożonego lokatora, dodaj komentarz wyjaśniający
// Znajdź przycisk "Zapisz" w formularzu zamówienia — nie w formularzu kontaktu
const saveButton = page
  .locator('#order-form')                    // Konkretny formularz (nie mylić z contact-form)
  .locator('button[type="submit"]')          // Submit button (nie mylić z "Anuluj")
  .filter({ hasText: 'Zapisz zamówienie' }); // Pełny tekst (nie mylić z "Zapisz jako szkic"
```

---

## Podsumowanie

1. **Locator vs ElementHandle** — Locator to leniwa recepta, nie uchwyt do elementu. Jest odporny na dynamiczne zmiany DOM.
2. **Hierarchia priorytetów** — getByRole → getByLabel → getByText → getByTestId → CSS/XPath.
3. **Praca z kolekcjami** — `all()`, `count()`, `nth()`, `first()`, `last()`.
4. **filter()** — najpotężniejszy mechanizm zawężania wyników przez tekst, zagnieżdżony lokator lub ich kombinację.
5. **Lokalne ścieżki** — zawsze buduj selektory od kontenera w dół, nie od strony globalnej.
6. **Debugowanie** — Pick Locator, count(), evaluate() do diagnostyki problematycznych lokatorów.

---

## Linki i źródła

- [Playwright Locator API](https://playwright.dev/docs/api/class-locator)
- [Playwright Best Practices — Locators](https://playwright.dev/docs/best-practices#locators)
- [ARIA Roles Reference](https://www.w3.org/WAI/PF/ARIA/roles)
- [Testing Library —优先级 selektorów](https://testing-library.com/docs/queries/about/#priority)