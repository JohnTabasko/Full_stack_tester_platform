# Opanowanie asynchroniczności: Async/Await i Obietnice (Promises)

Automatyzacja przeglądarek i testowanie API to operacje wysoce asynchroniczne. Każda nawigacja sieciowa, kliknięcie przycisku, wyszukiwanie w DOM czy oczekiwanie na odpowiedź serwera to operacje, które wymagają czasu i zwracają w obiekty **`Promise` (Obietnice)**.

Nieprawidłowe zarządzanie asynchronicznością jest **najczęstszą przyczyną cichych sukcesów** (testów, które przechodzą na zielono, mimo że pod spodem asercje w ogóle się nie wykonały) oraz niestabilności. W tej lekcji nauczysz się w pełni kontrolować cykl asynchroniczny w Playwright.

---

## 1. Najgroźniejsza pułapka: Brakujący `await` (The Silent Pass)

Kiedy wywołujesz asynchroniczną metodę w Playwright bez słowa kluczowego `await`:

```typescript
// BŁĄD! Zapomniany await!
page.getByRole('button', { name: 'Kup' }).click();
```

Proces Node.js nie poczeka na kliknięcie przycisku. Wyśle komendę do przeglądarki i natychmiast przejdzie do kolejnej linii kodu. Test może pomyślnie dobiec końca, mimo że strona w ogóle nie została kliknięta!

### Nowoczesne zabezpieczenie (ESLint Integration):
W rzetelnie skonfigurowanych projektach stosuje się regułę lintera, która automatycznie wyłapuje brakujące słowo kluczowe `await` przed obietnicami Playwright:
```json
"rules": {
  "@typescript-eslint/no-floating-promises": "error"
}
```

---

## 2. Równoległe wykonanie asynchroniczne: `Promise.all`

Czasami w teście chcemy wywołać kilka akcji jednocześnie lub poczekać na zdarzenie sieciowe wywołane interakcją. Stosowanie sekwencyjnego oczekiwania to błąd:

```typescript
// SEKWENCYJNIE (Wolno, błąd wyścigu stanów):
await page.getByRole('button', { name: 'Zatwierdź' }).click();
await page.waitForResponse('**/api/v1/orders'); // Za późno! Zapytanie mogło już wrócić.
```

### Prawidłowe wdrożenie przy użyciu `Promise.all`:
Uruchamiamy obie operacje jednocześnie, dzięki czemu Playwright gwarantuje przechwycenie zdarzenia sieciowego bez utraty czasu:

```typescript
import { test, expect } from '@playwright/test';

test('złożenie zamówienia z przechwyceniem odpowiedzi API', async ({ page }) => {
  await page.goto('/checkout');

  // Uruchomienie równoległe (Promise.all)
  const [response] = await Promise.all([
    // 1. Czekaj na zapytanie API
    page.waitForResponse('**/api/v1/orders'),
    // 2. Wykonaj akcję kliknięcia, która to zapytanie wyzwala
    page.getByRole('button', { name: 'Zatwierdź' }).click(),
  ]);

  // Obie operacje zakończyły się pomyślnie!
  expect(response.status()).toBe(201);
});
```

---

## 3. Różnica między `Promise.all` a `Promise.race`
*   **`Promise.all`**: Czeka, aż wszystkie przekazane obietnice zakończą się sukcesem. Jeśli jakakolwiek rzuci błąd, całość natychmiast kończy się awarią.
*   **`Promise.race`**: Kończy pracę w momencie, gdy **pierwsza** z obietnic zostanie rozstrzygnięta (przydatne np. do testowania wyścigu czasowego – sprawdzania czy odpowiedź wróci przed timeoutem).

---

## 4. Checklista Asynchroniczności
- [ ] Czy upewniłeś się, że każda asynchroniczna metoda Playwright (zwracająca `Promise`) jest poprzedzona słowem `await`?
- [ ] Czy wdrożyłeś regułę `@typescript-eslint/no-floating-promises` w konfiguracji ESLint?
- [ ] Czy do weryfikacji żądań sieciowych wywoływanych kliknięciem stosujesz bezpieczną strukturę `Promise.all()`?
- [ ] Czy potrafisz poprawnie obsłużyć błędy asynchroniczne i przechwycić ich call stack przy awariach?