# Zarządzanie oknami dialogowymi (Dialogs) i wzorzec Event-First

Podczas automatyzacji testów UI często stykamy się z natywnymi oknami dialogowymi przeglądarki wywoływanymi przez JavaScript: alertami (`alert()`), oknami potwierdzenia (`confirm()`) oraz oknami wprowadzania wartości (`prompt()`). Te okna nie są tradycyjnymi elementami struktury DOM HTML – są renderowane bezpośrednio przez system operacyjny i przeglądarkę, co uniemożliwia ich zlokalizowanie standardowymi selektorami CSS czy XPath.

Playwright Test radzi sobie z tym wyzwaniem w sposób bezkompromisowy: **domyślnie automatycznie odrzuca (dismiss)** każde systemowe okno dialogowe, zapobiegając zawieszeniu testu. Jeśli jednak Twoim scenariuszem testowym jest celowe kliknięcie i zatwierdzenie (accept) lub wpisanie wartości do takiego okna, musisz wdrożyć zaawansowany wzorzec **Event-First Pattern**.

---

## 1. Maszyna stanów i domyślne zachowanie Playwright

Tradycyjne narzędzia automatyzacji zawieszały się na systemowych dialogach, ponieważ oczekiwały na ich renderowanie. Playwright podchodzi do tego inaczej:
*   W momencie wyzwolenia dialogu przez kod aplikacji, Playwright przechwytuje go natychmiast na poziomie protokołu CDP.
*   Jeśli nie zarejestrowałeś żadnej reguły obsługi, Playwright **automatycznie odrzuci okno** (wywoła odpowiednik wciśnięcia "Anuluj"), aby test mógł trwać dalej.

---

## 2. Wzorzec Event-First Pattern dla Dialogów

Aby zatwierdzić systemowe okno dialogowe (np. usunięcie produktu wymagające potwierdzenia), musimy zarejestrować subskrypcję zdarzenia `'dialog'` **przed** wywołaniem akcji, która fizycznie to okno otwiera:

```typescript
import { test, expect } from '@playwright/test';

test('zatwierdzenie usunięcia profilu użytkownika', async ({ page }) => {
  await page.goto('/settings');

  // 1. Zarejestruj jednorazową subskrypcję zdarzenia 'dialog' (Event-First)
  page.once('dialog', async (dialog) => {
    // Odczytaj szczegóły okna dialogowego
    console.log(`Typ okna: ${dialog.type()}`);
    console.log(`Wyświetlana treść: ${dialog.message()}`);

    // Zatwierdź dialog (odpowiednik wciśnięcia przycisku "OK")
    await dialog.accept();
  });

  // 2. Wywołaj akcję kliknięcia, która fizycznie otwiera systemowy confirm dialog
  await page.getByRole('button', { name: 'Usuń moje konto' }).click();

  // 3. Weryfikujemy rezultat asercją Web-First
  await expect(page.getByText('Twoje konto zostało usunięte.')).toBeVisible();
});
```

### Dlaczego ta kolejność jest ważna?
Jeśli najpierw klikniesz przycisk (`.click()`), a dopiero potem spróbujesz nasłuchiwać zdarzenia (`page.on('dialog', ...)`), przeglądarka zdąży automatycznie odrzucić okno zanim zdążysz zarejestrować słuchacza, a Twój test zakończy się niepowodzeniem.

---

## 3. Obsługa okien wprowadzania danych (Prompt Dialogs)

Jeśli okno dialogowe wymaga wpisania określonej wartości (np. wpisania słowa "USUŃ" w celu zatwierdzenia), tekst ten przekazujemy jako parametr wywołania metody `accept()`:

```typescript
page.once('dialog', async (dialog) => {
  // Wpisz żądaną wartość do promptu i zatwierdź
  await dialog.accept('POTWIERDZAM');
});

await page.getByRole('button', { name: 'Wymaż bazę danych' }).click();
```

---

## 4. Checklista Obsługi Dialogów
- [ ] Czy pamiętasz, że Playwright domyślnie i bezpiecznie odrzuca każde systemowe okno dialogowe, aby zapobiec zawieszeniu testów?
- [ ] Czy stosujesz rygorystyczny wzorzec **Event-First Pattern** – rejestrując słuchacza `page.once('dialog', ...)` *przed* kliknięciem przycisku wyzwalającego?
- [ ] Czy w przypadku testowania Promptów przekazujesz wymaganą wartość bezpośrednio do metody `dialog.accept(text)`?