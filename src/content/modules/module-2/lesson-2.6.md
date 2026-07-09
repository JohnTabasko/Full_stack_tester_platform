# Akcje podstawowe: Symulacja użytkownika

Pisanie testów to symulacja zachowań użytkownika. Jako Full Stack Tester musisz rozumieć różnice między metodami wprowadzania danych, aby Twoje testy były realistyczne.

## 1. Interakcje myszy: click()

Metoda `click()` jest inteligentna. Sprawdza actionability (widoczność, stabilność) zanim kliknie.
Opcje zaawansowane:
- `clickCount: 2`: Podwójne kliknięcie.
- `button: 'right'`: Kliknięcie prawym przyciskiem myszy.
- `modifiers: ['Control']`: Kliknięcie z przyciśniętym klawiszem Ctrl.
- `position: { x: 5, y: 5 }`: Kliknięcie w konkretny punkt elementu (przydatne przy testowaniu Canvas).

## 2. Wprowadzanie tekstu: fill() vs. pressSequentially() (dawniej type)

To najczęstszy błąd początkujących. 
- **`fill()`**: Najlepsza metoda w 95% przypadków. Playwright czyści pole i wstawia tekst natychmiastowo. Wyzwala zdarzenia `input`, `change`.
- **`pressSequentially()`**: Symuluje prawdziwe stukanie w klawiaturę (znak po znaku).
    - *Kiedy używać?*: Gdy testujesz pola typu "Autocomplete" lub autouzupełnianie, które reaguje na każde naciśnięcie klawisza.

## 3. Klawiatura: press()

Pozwala na wysyłanie pojedynczych klawiszy lub skrótów:
```typescript
await page.getByLabel('Szukaj').press('Enter');
await page.press('body', 'Control+A');
await page.press('body', 'Backspace');
```

## 4. Pola wyboru i radio buttony

Zamiast `click()`, używaj dedykowanych metod, które są bezpieczniejsze (nie odznaczą elementu, jeśli już jest zaznaczony):
```typescript
await page.getByLabel('Akceptuję regulamin').check();
await page.getByLabel('Subskrypcja').uncheck();
```

## 5. Dobre praktyki i błędy QA

- **Selektory a Akcje**: Nie pisz akcji na ogólnych selektorach. `page.locator('button').click()` rzuci błędem, jeśli na stronie jest więcej niż jeden przycisk. Bądź precyzyjny używając `getByRole`.
- **Actionability timeout**: Domyślny czas oczekiwania na to, by element stał się klikalny, to 30 sekund. Możesz to zmienić w konfiguracji, ale rzadko jest to zalecane.

## Zadanie
Spróbuj wypełnić formularz logowania na dowolnej stronie, używając skrótu `Control+A` i `Backspace` do wyczyszczenia pola przed wpisaniem nowych danych (mimo że `fill()` robi to automatycznie - poćwicz operowanie klawiaturą).

## Linki
- [Playwright Actions Documentation](https://playwright.dev/docs/input)
