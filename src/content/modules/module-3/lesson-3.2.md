# Asercje ogólne i bezpieczne porównywanie typów (Generic Assertions)

Podczas pisania testów, nie wszystkie weryfikacje zachodzą bezpośrednio na poziomie elementów graficznych (UI) przeglądarki. Bardzo często musimy sprawdzić dane w pamięci TypeScript, struktury obiektów, tablice, wartości zmiennych lokalnych, a także rezultaty operacji matematycznych czy logicznych.

W tym celu Playwright Test dziedziczy potężny silnik **asercji ogólnych (Generic Assertions)** kompatybilny z biblioteką `expect` z ekosystemu Jest/Vitest. Zrozumienie różnic między różnymi typami dopasowań (matchers) decyduje o bezpieczeństwie typów Twojego kodu testowego.

---

## 1. Różnica między `.toBe()` a `.toEqual()` (Płytka vs Głęboka Równość)

To jedno z najważniejszych pytań rekrutacyjnych i pułapek inżynierskich w TypeScript:

### A. Matcher `.toBe()` (Ścisła Równość referencyjna `===`)
Służy do porównywania wartości prostych (prymitywnych): liczb, ciągów znaków (strings), wartości boolean oraz dokładnych referencji w pamięci.
```typescript
const count = 5;
expect(count).toBe(5); // Prawda
```

*   **Pułapka**: Nigdy nie używaj `.toBe()` do porównywania obiektów ani tablic!
    ```typescript
    const userA = { name: 'Jan' };
    const userB = { name: 'Jan' };
    expect(userA).toBe(userB); // BŁĄD! Referencje w pamięci są różne, mimo identycznej zawartości!
    ```

### B. Matcher `.toEqual()` (Głęboka równość strukturalna)
Rekurencyjnie porównuje wszystkie właściwości obiektów lub elementy tablic, ignorując referencje w pamięci.
```typescript
const userA = { name: 'Jan' };
const userB = { name: 'Jan' };
expect(userA).toEqual(userB); // PRAWDA! Struktura i wartości pól są identyczne.
```

*   **Wskazówka**: Jeśli chcesz sprawdzić, czy dany obiekt zawiera określony podzbiór pól (nie martwiąc się o pozostałe), użyj matchera `.toStrictEqual()` lub asercji częściowej:
    ```typescript
    expect(userA).slice({ name: 'Jan' }); // asercja częściowa
    ```

---

## 2. Dopasowanie tablic i ciągów znaków

### A. Weryfikacja tablic (Arrays)
*   `expect(array).toContain(item)`: Sprawdza, czy tablica zawiera określony element.
*   `expect(array).toHaveLength(expectedSize)`: Weryfikuje rozmiar kolekcji.
    ```typescript
    const items = ['buty', 'koszula', 'pasek'];
    expect(items).toContain('koszula');
    expect(items).toHaveLength(3);
    ```

### B. Wyszukiwanie wzorców tekstowych (Regex)
*   Do elastycznej weryfikacji tekstów, zamiast sztywnych ciągów znaków, używaj wyrażeń regularnych (Regex):
    ```typescript
    const message = 'Konto użytkownika #1203 zostało utworzone.';
    expect(message).toMatch(/Konto użytkownika #\d+ zostało utworzone/);
    ```

---

## 3. Asercje asynchroniczne na obietnice (Promise Resolvers)

Jeśli testujesz funkcje asynchroniczne lub bezpośrednio obietnice (Promises), możesz sprawdzić, czy zakończą się one sukcesem lub rzuceniem wyjątku bez pisania bloków `try/catch`:

```typescript
// Sprawdź, czy obietnica pomyślnie się rozwiąże (resolve) i zwróci określoną wartość
await expect(database.fetchUser('12')).resolves.toEqual({ name: 'Jan' });

// Sprawdź, czy funkcja rzuci oczekiwany błąd (reject)
await expect(database.fetchUser('invalid')).rejects.toThrow('User not found');
```

---

## 4. Checklista Asercji Ogólnych
- [ ] Czy poprawnie dobierasz `.toBe()` do wartości prymitywnych oraz `.toEqual()` do obiektów i tablic?
- [ ] Czy unikasz powielania kodu asercji, wykorzystując dopasowania wyrażeń regularnych (`toMatch`)?
- [ ] Czy asynchroniczne błędy obietnic weryfikujesz za pomocą `rejects.toThrow()`?