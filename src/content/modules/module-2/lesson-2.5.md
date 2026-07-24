# Asercje Web-First i automatyczne odpytywanie stanów

Tradycyjne biblioteki asercji (np. te wbudowane w Jest czy Mocha, takie jak `expect(value).toBe(true)`) sprawdzają warunek dokładnie raz w ułamku milisekundy, w którym linia kodu zostaje wykonana. Jeśli aplikacja potrzebuje choćby 100 ms na wyrenderowanie komunikatu po zapytaniu sieciowym, tradycyjna asercja natychmiast zakończy się niepowodzeniem.

Playwright rozwiązuje ten problem, wprowadzając **Asercje Web-First**. Te potężne, asynchroniczne asercje automatycznie czekają i ponawiają sprawdzanie warunku, eliminując potrzebę pisania ręcznych opóźnień.

---

## 1. Różnica między asercjami tradycyjnymi a Web-First

Zrozumienie tej różnicy decyduje o stabilności całego frameworka testowego:

### Tradycyjna asercja synchroniczna (Antywzorzec w testach UI):
```typescript
// POBIERZ stan elementu (sprawdza raz)
const isVisible = await page.locator('.success-alert').isVisible();
// SPRAWDŹ pobraną wartość
expect(isVisible).toBe(true);
```
*   **Dlaczego to błąd?** Jeśli serwer potrzebuje 500 ms na przetworzenie zapytania, metoda `isVisible()` natychmiast zwróci `false` i test padnie, pomimo że aplikacja działa prawidłowo.

### Asercja Web-First (Prawidłowa):
```typescript
// Przekaż LOKATOR bezpośrednio do expect() i wywołaj asynchroniczną metodę
await expect(page.locator('.success-alert')).toBeVisible();
```
*   **Jak to działa?** Playwright nie pobiera wartości na ślepo. Przekazujesz lokator, a asercja w tle uruchamia **pętlę ponowień (polling loop)**, sprawdzając widoczność elementu co kilkanaście milisekund, aż do momentu załadowania elementu lub upłynięcia limitu czasu `expect.timeout` (domyślnie 5 sekund).

---

## 2. Negacja asercji (Negated Assertions)

Wszystkie asercje Web-First można bez problemu negować za pomocą słowa kluczowego `.not`. W tym przypadku asercja będzie odpytywać stronę i oczekiwać na **zniknięcie** określonego stanu (np. ukrycie loadera):

```typescript
// Czekaj, aż loader całkowicie zniknie ze struktury DOM
await expect(page.locator('.spinner-loader')).not.toBeVisible();
```

---

## 3. Miękkie asercje (Soft Assertions)

Domyślnie, jeśli jakakolwiek asercja w teście zakończy się błędem, Playwright natychmiast przerywa wykonywanie całego testu. Czasami jednak chcemy sprawdzić kilka niezależnych elementów na raz (np. poprawność kilku pól w podsumowaniu zamówienia) i zebrać wszystkie błędy bez przerywania testu.

Służą do tego **Miękkie asercje (Soft Assertions)**:

```typescript
import { test, expect } from '@playwright/test';

test('podsumowanie profilu użytkownika', async ({ page }) => {
  await page.goto('/profile');

  // Te asercje nie przerwą testu w przypadku błędu. Zostaną odnotowane w raporcie na koniec.
  await expect.soft(page.locator('.user-email')).toHaveText('jan@example.com');
  await expect.soft(page.locator('.user-phone')).toHaveText('+48 123 456 789');
  await expect.soft(page.locator('.user-role')).toHaveText('Administrator');
  
  // Test zakończy się błędem dopiero na samym końcu, wskazując wszystkie niespełnione asercje soft!
});
```

---

## 4. Customowe timouty asercji

Jeśli wiesz, że określona operacja na serwerze (np. generowanie dużego raportu PDF) trwa dłużej niż domyślny limit asercji (5s), możesz precyzyjnie nadpisać timeout dla pojedynczego wywołania:

```typescript
await expect(page.locator('.pdf-download-link')).toBeVisible({
  timeout: 15000 // Poczekaj maksymalnie 15 sekund na ten konkretny element
});
```

---

## 5. Checklista Stabilnych Asercji
- [ ] Czy do weryfikacji stanów UI przekazujesz do `expect()` otypowany obiekt `Locator`, a nie surowe wartości boolean?
- [ ] Czy całkowicie wyeliminowałeś tradycyjne asercje `expect(await page.locator(...).isVisible()).toBe(true)`?
- [ ] Czy świadomie stosujesz miękkie asercje (`expect.soft`) do niezależnych weryfikacji estetycznych/podsumowań?
- [ ] Czy w razie potrzeby nadpisujesz timeout bezpośrednio w parametrach asercji?