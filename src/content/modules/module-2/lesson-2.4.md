# Leniwa ewaluacja lokatorów i maszyna stanów akcji

W Playwright, w odróżnieniu od Selenium, pojęcie **lokatora (Locator)** oraz fizyczne wykonanie **akcji** na elemencie są od siebie całkowicie odseparowane. Zrozumienie, że lokatory są ewaluowane w sposób leniwy (Lazy Evaluation) oraz jak działa wewnętrzna maszyna stanów akcji (Actionability Checks), pozwoli Ci pisać testy o najwyższym poziomie stabilności.

W tej lekcji przeanalizujemy pod maską cykl życia lokatora od jego deklaracji do momentu wysłania zdarzenia systemowego przez przeglądarkę.

---

## 1. Leniwa ewaluacja (Lazy Evaluation) lokatorów

Kiedy tworzysz lokalizator w kodzie testu:

```typescript
const submitBtn = page.getByRole('button', { name: 'Wyślij' });
```

**Playwright nie wykonuje żadnego zapytania do struktury DOM!** Lokator jest w tym momencie jedynie przepisem (deklaracją), instrukcją pokazującą, jak znaleźć element w przyszłości.

Dopiero w ułamku sekundy, w którym wywołujesz na nim akcję:

```typescript
await submitBtn.click();
```

Playwright odczytuje przepis lokatora, wyszukuje element w drzewie DOM i natychmiast rozpoczyna procedurę weryfikacji gotowości (Actionability Checks).

---

## 2. Maszyna stanów gotowości (Actionability Checks)

Przed kliknięciem, wpisaniem tekstu czy jakimkolwiek innym zdarzeniem interaktywnym, Playwright Test uruchamia pod maską rygorystyczny proces sprawdzania, czy element jest gotowy do interakcji. 

Aby akcja zakończyła się sukcesem, element musi spełniać następującą **listę kontrolną (Actionability Checklist)**:

```
                      +-----------------------------+
                      |       Rozpoczęcie akcji     |
                      +-----------------------------+
                                     |
                                     v
                      +-----------------------------+
                      | Attached: Czy istnieje w DOM|
                      +-----------------------------+
                                     |
                                     v
                      +-----------------------------+
                      | Visible: Czy ma rozmiar >0  |
                      +-----------------------------+
                                     |
                                     v
                      +-----------------------------+
                      | Stable: Czy animacje ustały |
                      +-----------------------------+
                                     |
                                     v
                      +-----------------------------+
                      | Enabled: Czy nie ma disabled|
                      +-----------------------------+
                                     |
                                     v
                      +-----------------------------+
                      | Editable: Czy można pisać   |
                      +-----------------------------+
                                     |
                                     v
                      +-----------------------------+
                      | Receives Events: Czy widoczny|
                      | na wierzchu (nieprzesłonięty)|
                      +-----------------------------+
                                     |
                                     v
                      +-----------------------------+
                      |      Wysłanie kliknięcia    |
                      +-----------------------------+
```

Jeśli którykolwiek z tych warunków nie jest spełniony (np. element jest przykryty przez modalny overlay lub animacja CSS wciąż przesuwa przycisk), Playwright **automatycznie czeka** i ponawia sprawdzanie do momentu upłynięcia limitu czasu (`actionTimeout`). 

To właśnie ta funkcja sprawia, że testy Playwright są niemal w 100% odporne na błędy renderowania asynchronicznego!

---

## 3. Praca z listami elementów (`count()`, `filter()`, `nth()`)

Lokalizatory mogą opisywać wiele elementów jednocześnie. Playwright dostarcza intuicyjne API do zarządzania kolekcjami:

*   **Pobieranie liczby elementów**:
    ```typescript
    const itemsCount = await page.locator('.product-card').count();
    ```
*   **Wybieranie konkretnego indeksu**:
    ```typescript
    // Wybierz pierwszy, ostatni lub n-ty element z listy
    await page.locator('.product-card').first().click();
    await page.locator('.product-card').last().click();
    await page.locator('.product-card').nth(2).click(); // 0-indexed (trzeci element)
    ```
*   **Filtrowanie kolekcji**:
    ```typescript
    // Znajdź tylko te karty produktów, które zawierają przycisk "Wyprzedaż"
    const saleProducts = page.locator('.product-card').filter({
      has: page.locator('.sale-badge')
    });
    ```

---

## 4. Zaawansowane opcje akcji kliknięcia (`click()`)

Metoda `.click()` pozwala na precyzyjne symulowanie zachowań użytkownika przy użyciu opcji zaawansowanych:

```typescript
await page.getByRole('button').click({
  button: 'right',          // Kliknięcie prawym przyciskiem myszy (Context Menu)
  clickCount: 2,            // Dwuklik (Double Click)
  modifiers: ['Control'],   // Kliknięcie z przytrzymanym klawiszem Ctrl (np. otwarcie w nowej karcie)
  force: true,              // Omiń testy gotowości (Actionability) - używaj w ostateczności!
});
```

---

## 5. Checklista Inżynierii Lokatorów
- [ ] Czy rozumiesz, że zadeklarowanie lokatora nie generuje żadnego ruchu sieciowego ani zapytań DOM?
- [ ] Czy wiesz, jakie warunki (Visibility, Stability, Enabled itp.) sprawdza Playwright przed kliknięciem?
- [ ] Czy potrafisz sprawnie przeszukiwać i filtrować listy elementów przy użyciu metod `.filter()` oraz `.nth()`?