# Zarządzanie wieloma zakładkami i oknami przeglądarki

W rzeczywistych scenariuszach biznesowych aplikacje często otwierają nowe zakładki lub okna przeglądarki (np. po kliknięciu odnośnika typu "Regulamin" z atrybutem `target="_blank"`, lub podczas autoryzacji przez zewnętrznych dostawców OAuth, takich jak Google czy Microsoft).

W Playwright, wszystkie zakładki (tabs) i okna otwarte w ramach jednego profilu współdzielą ten sam **BrowserContext**. W tej lekcji nauczysz się, jak poprawnie przechwytywać nowo powstałe strony i płynnie przełączać interakcję między nimi.

---

## 1. Przechwytywanie nowej zakładki (Event-First Pattern)

Częstym błędem w automatyzacji jest kliknięcie przycisku otwierającego nowe okno, a następnie próba natychmiastowego odwołania się do niego. Może to wywołać wyścig stanów (race condition) – strona może nie zdążyć się zainicjalizować.

Prawidłowym podejściem inżynieryjnym jest zastosowanie wzorca **Event-First Pattern**: rejestrujemy oczekiwanie na zdarzenie `page` w kontekście przeglądarki *jednocześnie* z wykonaniem akcji wyzwalającej to kliknięcie:

```typescript
import { test, expect } from '@playwright/test';

test('obsługa otwarcia nowej zakładki z regulaminem', async ({ context, page }) => {
  await page.goto('/register');

  // 1. Uruchom asynchroniczne oczekiwanie na pojawienie się nowej strony w kontekście
  const pagePromise = context.waitForEvent('page');

  // 2. Wykonaj akcję kliknięcia, która fizycznie otwiera nową kartę (target="_blank")
  await page.getByRole('link', { name: 'Przeczytaj Regulamin' }).click();

  // 3. Oczekaj na rozwiązanie obietnicy (Promise) i przypisz nową stronę do zmiennej
  const newTabPage = await pagePromise;

  // Nowa strona jest gotowa do stabilnej interakcji!
  await newTabPage.waitForLoadState();
  await expect(newTabPage).toHaveURL('/terms-and-conditions');
  await expect(newTabPage.getByRole('heading', { name: 'Regulamin Sklepu' })).toBeVisible();

  // Możemy bez problemu wrócić do interakcji na pierwotnej karcie:
  await page.getByLabel('Akceptuję regulamin').check();
});
```

---

## 2. Obsługa wyskakujących okien (Popups)

Jeśli nowe okno jest otwierane za pomocą skryptu JavaScript (`window.open()`), możemy przechwycić je bezpośrednio na poziomie instancji `page` przy użyciu zdarzenia `'popup'`:

```typescript
// Oczekuj na wyzwolenie popupu na bieżącej karcie
const popupPromise = page.waitForEvent('popup');

await page.getByRole('button', { name: 'Zaloguj przez Google' }).click();

const popupPage = await popupPromise;
await popupPage.getByLabel('E-mail').fill('user@gmail.com');
```

---

## 3. Pobieranie listy wszystkich otwartych stron

W dowolnym momencie możesz odpytać kontekst przeglądarki o tablicę zawierającą wszystkie aktywne karty (strony):

```typescript
// Pobierz wszystkie otwarte karty w tym kontekście
const allPages = context.pages();
console.log(`Liczba aktywnych zakładek: ${allPages.length}`);

// Odwołaj się do pierwszej karty
const homePage = allPages[0];
```

---

## 4. Checklista Zarządzania Kartami
- [ ] Czy do przechwytywania nowych kart wykorzystujesz asynchroniczne obietnice (`context.waitForEvent('page')`) w celu uniknięcia wyścigów stanów?
- [ ] Czy po przechwyceniu nowej strony upewniasz się, że osiągnęła stan stabilności za pomocą `.waitForLoadState()`?
- [ ] Czy pamiętasz, że wszystkie karty otwarte w ramach jednego kontekstu współdzielą stan autoryzacji (cookies)?