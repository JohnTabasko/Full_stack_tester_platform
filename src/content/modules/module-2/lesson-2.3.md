# Strategie selektorów i lokalizowanie elementów (Locators-First)

Jednym z najczęstszych powodów kruchości (flakiness) i wysokiego kosztu utrzymania testów automatycznych jest stosowanie złych strategii lokalizowania elementów HTML. Tradycyjne opieranie się na surowych selektorach CSS (np. `div.container > ul.list > li:nth-child(3)`) lub skomplikowanych ścieżkach XPath sprawia, że jakakolwiek kosmetyczna zmiana w strukturze strony przez programistów frontendowych natychmiast psuje testy.

Playwright rewolucjonizuje to podejście, wprowadzając strategię **Locators-First** opartą o semantykę i dostępność (Accessibility). W tej lekcji nauczysz się projektować stabilne i elastyczne lokalizatory odporne na zmiany w kodzie aplikacji.

---

## 1. Oficjalna hierarchia priorytetów lokalizatorów (Lokalizatory Semantyczne)

Zgodnie z najlepszymi praktykami zalecanymi przez Microsoft oraz autorów książek z 2026 roku, lokalizatory należy dobierać według ściśle określonej hierarchii priorytetów. Zawsze wybieraj lokalizator znajdujący się najwyżej na poniższej liście:

### Priorytet 1: Lokalizatory oparte o Dostępność (A11y Matchers)
Są to najpotężniejsze lokalizatory, ponieważ weryfikują stronę dokładnie tak, jak widzi ją i interpretuje czytnik ekranu osoby niepełnosprawnej. Promują one poprawne pisanie kodu HTML (Accessibility First).

*   `page.getByRole(role, options)`: Lokalizuje elementy na podstawie ich roli w drzewie dostępności (Accessibility Tree).
    ```typescript
    // Bardzo stabilne, nie zależy od klas CSS ani struktury HTML
    await page.getByRole('button', { name: 'Zatwierdź zamówienie' }).click();
    ```
*   `page.getByLabel(text)`: Lokalizuje pole formularza na podstawie powiązanej z nim etykiety `<label>`.
    ```typescript
    await page.getByLabel('Adres e-mail').fill('tester@arena.ai');
    ```
*   `page.getByPlaceholder(text)`: Lokalizuje pole tekstowe na podstawie tekstu pomocniczego (placeholder).
    ```typescript
    await page.getByPlaceholder('Wpisz kod pocztowy...').fill('00-001');
    ```

### Priorytet 2: Lokalizatory tekstowe i wizualne
*   `page.getByText(text)`: Lokalizuje element na podstawie wyświetlanego na ekranie tekstu. Doskonałe do weryfikacji nagłówków, akapitów i komunikatów o sukcesie.
    ```typescript
    await expect(page.getByText('Produkt pomyślnie dodany do koszyka')).toBeVisible();
    ```
*   `page.getByAltText(text)`: Lokalizuje elementy graficzne (np. `<img>`) na podstawie opisu alternatywnego `alt`.
*   `page.getByTitle(text)`: Lokalizuje elementy posiadające atrybut HTML `title`.

### Priorytet 3: Dedykowane identyfikatory testowe (`data-testid`)
Gdy element jest dynamiczny, skomplikowany i nie posiada jednoznacznej roli semantycznej, najlepszą praktyką inżynieryjną jest dodanie do niego dedykowanego atrybutu testowego w kodzie aplikacji (np. `data-test-id` lub `data-testid`).

*   `page.getByTestId(id)`: Lokalizuje element na podstawie unikalnego identyfikatora testowego.
    ```typescript
    await page.getByTestId('cart-checkout-button').click();
    ```

### Ostatnia deska ratunku: CSS i XPath
Surowe selektory CSS (np. `page.locator('button.submit-btn')`) oraz XPath są uznawane za **antywzorzec** i powinny być stosowane wyłącznie w ostateczności (np. przy testowaniu starych, zastanych systemów legacy, których nie możemy modyfikować).

---

## 2. Dynamiczne odpytywanie i łączenie lokalizatorów (Chaining)

Lokalizatory w Playwright można w prosty sposób łączyć ze sobą, aby zawęzić obszar poszukiwań. Pozwala to na lokalizowanie elementów wewnątrz określonych sekcji strony (np. konkretnego wiersza w tabeli):

```typescript
// Znajdź wiersz tabeli o nazwie "Zamówienie #1024", a następnie kliknij przycisk "Szczegóły" wewnątrz tego wiersza
const orderRow = page.locator('tr').filter({ hasText: 'Zamówienie #1024' });
await orderRow.getByRole('button', { name: 'Szczegóły' }).click();
```

---

## 3. Shadow DOM i Iframe - natywna obsługa

Playwright wyróżnia się na tle konkurencji tym, że **natywnie przenika przez Shadow DOM**. Nie musisz stosować skomplikowanych selektorów typu `/deep/` ani pisać kodu JS – standardowe lokatory bez problemu znajdą elementy ukryte wewnątrz Shadow Roots.

Dla ramek (`<iframe>`) Playwright udostępnia dedykowany lokalizator ramek, o którym szerzej powiemy w kolejnych lekcjach:
```typescript
const frame = page.frameLocator('#payment-iframe');
await frame.getByLabel('Numer karty').fill('4111...');
```

---

## 4. Checklista Dobrych Praktyk Selektorów
- [ ] Czy całkowicie wyeliminowałeś kruche selektory CSS i XPath z kodu testu?
- [ ] Czy dążysz do używania lokalizatorów semantycznych opartych o dostępność (`getByRole`, `getByLabel`)?
- [ ] Czy w przypadku trudnych elementów uzgodniłeś z zespołem deweloperskim dodanie atrybutów `data-testid`?
- [ ] Czy filtrujesz listy i tabele dynamicznie za pomocą `.filter({ hasText: ... })`?