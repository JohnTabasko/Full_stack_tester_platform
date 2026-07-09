# Selektory i Lokatory (Strategia Full Stack)

Wiele osób myśli, że wybór elementu to tylko kwestia znalezienia `id` lub `class`. Jako Full Stack Tester musisz myśleć o **utrzymywalności (maintainability)** i **dostępności (accessibility)**. Źle dobrany selektor to najczęstsza przyczyna "kruchych testów" (fragile tests).

## 1. Lokator vs Selektor

- **Selektor**: To tylko string (np. `css=.btn`), który opisuje sposób znalezienia elementu.
- **Lokator (`Locator`)**: To obiekt Playwrighta, który enkapsuluje logikę wyszukiwania. Lokatory są **leniwe (lazy)** – Playwright nie szuka elementu w momencie definicji, ale dopiero w momencie wykonywania akcji (np. `click()`).

## 2. Zalecana hierarchia wyboru (Best Practices)

Zawsze staraj się wybierać elementy w tej kolejności:

### Poziom 1: Role i Dostępność (Najmocniejsze)
Używaj `getByRole`. To najbardziej odporny sposób, ponieważ odzwierciedla to, jak użytkownik (i czytnik ekranu) widzi stronę.
```typescript
await page.getByRole('button', { name: 'Zaloguj' }).click();
await page.getByRole('heading', { level: 1 }).innerText();
```
*Full Stack Insight*: Jeśli deweloper zmieni styl przycisku z klasy `.blue-btn` na `.red-btn`, ten test nadal przejdzie. Jeśli jednak zmieni przycisk na zwykły link `<a>`, test słusznie padnie, informując Cię o zmianie semantyki.

### Poziom 2: Etykiety i Tekst
Dobre dla pól formularzy i unikalnych tekstów.
- `getByLabel('Adres e-mail')`: Szuka pola powiązanego z etykietą `<label>`.
- `getByPlaceholder('Hasło')`: Szuka pola po podpowiedzi wewnątrz.
- `getByText('Produkt został dodany')`: Dobre do komunikatów sukcesu.

### Poziom 3: Test ID (Ostatnia deska ratunku dla logiki)
Jeśli element nie ma jasnej roli ani stałego tekstu, użyj atrybutu dedykowanego pod testy:
```html
<div data-testid="cart-total">120.00 zł</div>
```
```typescript
await page.getByTestId('cart-total').isVisible();
```

## 3. Czego UNIKAĆ?

1.  **Selektory CSS oparte na strukturze**: `.container > div > span:nth-child(2)`. Dodanie jednego `div` dla stylowania psuje taki test.
2.  **Klasy techniczne**: `.jss123` (klasy generowane przez biblioteki jak MaterialUI/Tailwind). Zmieniają się przy każdym buildzie!
3.  **XPath**: Jest trudny do czytania i wolniejszy niż natywne lokatory.

## 4. Filtrowanie i Lokatory Zagnieżdżone

Czasem na stronie jest wiele takich samych przycisków. Wtedy używamy filtrów:
```typescript
const product = page.getByRole('listitem').filter({ hasText: 'iPhone 15' });
await product.getByRole('button', { name: 'Kup' }).click();
```

## 5. Debugowanie lokatorów (Playwright Inspector)

Jeśli nie wiesz, jak nazwać element, uruchom test z flagą `--debug`. Otworzy się **Playwright Inspector**, gdzie możesz użyć narzędzia **"Pick Locator"**. Klikasz w element w przeglądarce, a Playwright generuje dla Ciebie najmocniejszy możliwy lokator.

## Zadanie dla eksperta
Zidentyfikuj na swojej ulubionej stronie element, którego nie da się łatwo złapać przez `getByRole`. Spróbuj użyć metody `filter()` łącząc tekst i inny element wewnątrz.

## Źródła
- [Playwright: Best Practices for Locators](https://playwright.dev/docs/locators#best-practices)
