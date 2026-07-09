# API lokatorów — praca z wieloma elementami

W realnych aplikacjach rzadko testujesz pojedynczy, unikalny przycisk. Częściej pracujesz z tabelami, listami produktów, kartami, wierszami zamówień, wynikami wyszukiwania i powtarzalnymi komponentami. Wtedy kluczowe jest nie tylko „znaleźć element”, ale znaleźć właściwy element w odpowiednim kontekście.

## 1. Locator reprezentuje zapytanie, nie gotowy element

```typescript
const rows = page.getByRole('row');
```

Ten kod nie pobiera jeszcze elementów z DOM. Tworzy locator. Dopiero akcja lub asercja powoduje wyszukanie:

```typescript
await expect(rows).toHaveCount(5);
```

To ważne, bo DOM w aplikacjach SPA często zmienia się po renderze.

## 2. `toHaveCount` przed iteracją

Metoda `all()` zwraca tablicę locatorów, ale nie czeka aż lista osiągnie oczekiwaną długość.

```typescript
const rows = page.getByRole('row');
await expect(rows).toHaveCount(10);

for (const row of await rows.all()) {
  console.log(await row.innerText());
}
```

Jeśli lista ładuje się asynchronicznie, zawsze najpierw poczekaj na stan: liczba elementów, brak loadera albo widoczny nagłówek.

## 3. `count()` — snapshot aktualnego stanu

```typescript
const count = await page.getByRole('listitem').count();
expect(count).toBeGreaterThan(0);
```

`count()` zwraca aktualną liczbę elementów. Nie jest web-first assertion. Jeśli lista może pojawić się po chwili, lepsze jest:

```typescript
await expect(page.getByRole('listitem')).toHaveCount(3);
```

## 4. Filtrowanie po tekście

Najczęstszy wzorzec dla list i tabel:

```typescript
const orderRow = page.getByRole('row').filter({ hasText: 'ORD-12345' });
await orderRow.getByRole('button', { name: 'Szczegóły' }).click();
```

To stabilniejsze niż wybieranie trzeciego wiersza. Test mówi, że interesuje go konkretne zamówienie, a nie pozycja w tabeli.

## 5. Filtrowanie po locatorze wewnętrznym

```typescript
const premiumProduct = page.getByRole('listitem').filter({
  has: page.getByRole('heading', { name: 'Pakiet Premium' }),
});

await premiumProduct.getByRole('button', { name: 'Kup' }).click();
```

`has` jest bardzo przydatne, gdy karta produktu zawiera wiele elementów: nagłówek, cenę, etykiety, przycisk.

## 6. Filtrowanie widocznych elementów

Czasem DOM zawiera wiele kopii tego samego elementu, np. wersję desktop i mobile. Wtedy można zawęzić do widocznych elementów:

```typescript
await page.getByRole('button', { name: 'Menu' }).filter({ visible: true }).click();
```

Nie traktuj tego jako lekarstwa na złą strukturę UI. Jeśli aplikacja ma wiele identycznych elementów, sprawdź, czy testowany wariant viewportu jest poprawnie ustawiony.

## 7. `first`, `last`, `nth`

```typescript
await page.getByRole('listitem').first().click();
await page.getByRole('listitem').last().click();
await page.getByRole('listitem').nth(2).click();
```

Te metody są czasem potrzebne, np. gdy testujesz sortowanie i świadomie chcesz sprawdzić pierwszy wynik. Ale przy akcjach biznesowych zwykle lepsze jest filtrowanie po treści.

Dobry przykład użycia `first()`:

```typescript
await page.getByRole('button', { name: 'Sortuj od najtańszych' }).click();
await expect(page.getByTestId('product-price').first()).toHaveText('99,00 zł');
```

Słaby przykład:

```typescript
await page.getByRole('button', { name: 'Usuń' }).nth(2).click();
```

Lepszy:

```typescript
const userRow = page.getByRole('row').filter({ hasText: 'anna@example.com' });
await userRow.getByRole('button', { name: 'Usuń' }).click();
```

## 8. Lokatory zagnieżdżone

Zaczynaj od kontenera, potem szukaj wewnątrz:

```typescript
const cart = page.getByRole('region', { name: 'Koszyk' });
await expect(cart.getByText('Laptop')).toBeVisible();
await cart.getByRole('button', { name: 'Usuń Laptop' }).click();
```

To ogranicza przypadkowe dopasowania z innych części strony.

## 9. `locator.evaluateAll`

Czasem potrzebujesz pobrać dane z wielu elementów:

```typescript
const prices = await page.getByTestId('product-price').evaluateAll(elements =>
  elements.map(element => element.textContent?.trim())
);
```

Używaj tego do odczytu i analizy, nie do klikania. Do interakcji preferuj locatory i akcje Playwright.

## 10. Iframe i frameLocator

Dla iframe używaj `frameLocator`:

```typescript
const paymentFrame = page.frameLocator('#payment-iframe');
await paymentFrame.getByLabel('Numer karty').fill('4242 4242 4242 4242');
await paymentFrame.getByLabel('Data ważności').fill('12/30');
```

Nie próbuj łapać elementów iframe zwykłym `page.getByLabel`, jeśli znajdują się wewnątrz ramki.

## 11. Checklista pracy z kolekcjami

- Czy lista jest załadowana przed iteracją?
- Czy użyto `toHaveCount`, gdy liczba elementów ma znaczenie?
- Czy wybór elementu opiera się na treści biznesowej, a nie indeksie?
- Czy locator jest zawężony do kontenera?
- Czy `nth()` ma jasne uzasadnienie?
- Czy `all()` nie jest użyte przed zakończeniem renderowania listy?
- Czy iframe obsługujesz przez `frameLocator`?

## Linki

- [Locator API](https://playwright.dev/docs/api/class-locator)
- [Locators](https://playwright.dev/docs/locators)
- [Frames](https://playwright.dev/docs/frames)
- [Assertions](https://playwright.dev/docs/test-assertions)
