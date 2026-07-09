# API lokatorów: Praca z wieloma elementami

W prawdziwych aplikacjach rzadko pracujemy z pojedynczym przyciskiem. Często mamy tabele, listy produktów czy nawigację. Jako Full Stack Tester musisz umieć sprawnie operować na kolekcjach elementów.

## 1. Pobieranie wielu elementów (`all()`)

Jeśli Twój lokator pasuje do wielu elementów, metoda `all()` zwróci tablicę lokatorów, po której możesz iterować:
```typescript
const rows = await page.getByRole('row').all();
for (const row of rows) {
  const text = await row.innerText();
  console.log(text);
}
```
*Full Stack Tip*: Pamiętaj, że `all()` nie czeka na pojawienie się wszystkich elementów. Jeśli chcesz mieć pewność, że lista jest załadowana, użyj najpierw asercji `toHaveCount()`.

## 2. Filtrowanie (Metoda `filter()`)

To najpotężniejsze narzędzie w arsenale lokatorów. Pozwala na precyzyjne zawężenie wyników:
- **Po tekście**: `.filter({ hasText: 'iPhone 15' })`
- **Po innym lokatorze wewnątrz**: `.filter({ has: page.getByRole('button', { name: 'Usuń' }) })`

Przykład: Wybierz wiersz tabeli, który zawiera konkretne ID zamówienia i kliknij w nim przycisk "Szczegóły".
```typescript
await page.getByRole('row')
  .filter({ hasText: 'ORD-12345' })
  .getByRole('button', { name: 'Szczegóły' })
  .click();
```

## 3. Wybieranie po indeksie (`nth()`, `first()`, `last()`)

- `first()`: Pierwszy pasujący element.
- `last()`: Ostatni pasujący element.
- `nth(index)`: Element o konkretnym numerze (indeksowanie od 0).

*Ostrzeżenie inżynierskie*: Unikaj używania `nth()`. Kolejność elementów w interfejsie często się zmienia (np. po sortowaniu). Twoje testy będą znacznie stabilniejsze, jeśli będziesz filtrować po unikalnej treści, a nie po pozycji w kodzie HTML.

## 4. Agregacja: `count()`

Metoda `count()` zwraca aktualną liczbę pasujących elementów.
```typescript
const count = await page.getByRole('listitem').count();
expect(count).toBeGreaterThan(0);
```

## 5. Praca z Iframe (Shadow DOM)

Playwright natywnie wspiera przechodzenie przez Shadow DOM i Iframe. Do tych drugich używamy:
```typescript
const frame = page.frameLocator('#payment-iframe');
await frame.getByLabel('Numer karty').fill('4242 4242 4242');
```

## Podsumowanie dobrych praktyk
1. **Lokalność**: Zawsze staraj się definiować lokatory w obrębie kontenera (np. najpierw znajdź wiersz, potem przycisk w tym wierszu).
2. **Czytelność**: Kod `page.getByRole('row').filter(...)` czyta się niemal jak zdanie w języku angielskim. To klucz do łatwego utrzymania testów.

## Linki
- [Playwright Locator API](https://playwright.dev/docs/api/class-locator)
