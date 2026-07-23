# Automatyczne oczekiwanie i actionability — dlaczego Playwright nie potrzebuje `sleep`

Automatyczne oczekiwanie jest jedną z największych przewag Playwright. W starszych frameworkach tester często musiał ręcznie czekać na element, animację, zniknięcie loadera albo zakończenie żądania. Playwright robi dużą część tej pracy automatycznie, ale tylko wtedy, gdy rozumiesz, na co faktycznie czeka.

Actionability to zestaw warunków, które element musi spełnić, zanim Playwright wykona akcję użytkownika, np. `click`, `fill`, `check`, `hover` albo `dragTo`.

## 1. Auto-waiting nie oznacza magii

Ten kod:

```typescript
await page.getByRole('button', { name: 'Zapisz' }).click();
```

nie klika natychmiast pierwszego znalezionego elementu. Playwright najpierw ponawia wyszukiwanie locatora i sprawdza, czy element jest gotowy do interakcji. Jeśli warunki nie zostaną spełnione w czasie timeoutu, test zakończy się błędem.

Auto-waiting działa dla locatorów i akcji Playwright. Nie oznacza, że Playwright zna semantykę Twojego backendu, kolejki, procesu płatności albo asynchronicznego importu danych. Dla procesów domenowych nadal musisz czekać na właściwy rezultat.

## 2. Główne warunki actionability

Najważniejsze warunki:

| Warunek | Znaczenie |
|---|---|
| Visible | element jest widoczny i ma niezerowy rozmiar |
| Stable | element nie zmienia położenia/rozmiaru, np. zakończyła się animacja |
| Receives Events | element nie jest zasłonięty i może otrzymać kliknięcie |
| Enabled | element nie jest wyłączony |
| Editable | pole można edytować, jeśli akcja tego wymaga |

Różne akcje wymagają różnych warunków. `click()` wymaga m.in. widoczności, stabilności, odbierania zdarzeń i enabled. `fill()` wymaga edytowalności. Asercje web-first mają własny mechanizm ponawiania.

## 3. Przykład: loader zasłania przycisk

Aplikacja pokazuje przycisk „Zapisz”, ale przez chwilę zasłania go overlay ładowania. Człowiek nie może kliknąć przycisku, więc test też nie powinien.

```typescript
await page.getByRole('button', { name: 'Zapisz' }).click();
```

Playwright będzie czekał, aż przycisk będzie mógł otrzymać event. Jeśli overlay nie zniknie, błąd jest wartościowy: UI faktycznie blokuje użytkownika.

Możesz też jawnie poczekać na zniknięcie loadera, jeśli jest to ważny stan scenariusza:

```typescript
await expect(page.getByTestId('global-loader')).toBeHidden();
await page.getByRole('button', { name: 'Zapisz' }).click();
```

## 4. Web-first assertions

Asercje Playwright również czekają:

```typescript
await expect(page.getByText('Zapisano zmiany')).toBeVisible();
await expect(page.getByRole('button', { name: 'Zapisz' })).toBeEnabled();
await expect(page).toHaveURL(/\/dashboard$/);
```

To lepsze niż ręczne pętle i timeouty. Asercja opisuje oczekiwany stan użytkownika.

## 5. Timeouty akcji i asercji

Timeout akcji i timeout asercji to różne rzeczy.

```typescript
export default defineConfig({
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },
});
```

Jeśli asercja ma czas 5 sekund, Playwright będzie ponawiał sprawdzenie przez 5 sekund. Jeśli akcja ma timeout 10 sekund, Playwright będzie próbował doprowadzić element do stanu actionability przez 10 sekund.

Nie ustawiaj globalnie ogromnych timeoutów jako lekarstwa na flaky tests. Najpierw ustal, na jaki stan powinien czekać test.

## 6. `force: true` — obejście, nie standard

```typescript
await page.getByLabel('Akceptuję regulamin').click({ force: true });
```

`force: true` pomija część sprawdzeń actionability, np. czy element może otrzymać event. Czasem jest uzasadnione przy niestandardowo stylowanych kontrolkach, ale często maskuje prawdziwy błąd UI.

Pytania przed użyciem `force`:

- Czy prawdziwy użytkownik może wykonać tę akcję?
- Czy klikam właściwy element, czy ukryty input pod stylowanym komponentem?
- Czy lepszy byłby locator po labelu albo kliknięcie widocznego wrappera?
- Czy komponent nie ma błędu dostępności?

## 7. `trial: true` — sprawdzenie gotowości bez akcji

Niektóre akcje wspierają tryb próbny:

```typescript
await page.getByRole('button', { name: 'Zapisz' }).click({ trial: true });
```

Playwright sprawdzi actionability, ale nie wykona kliknięcia. To przydatne w diagnostyce i rzadkich przypadkach, gdy chcesz upewnić się, że element jest gotowy.

## 8. Kiedy trzeba czekać ręcznie

Auto-waiting nie rozwiązuje wszystkiego. Ręczne oczekiwanie jest potrzebne, gdy czekasz na zdarzenie niebędące bezpośrednią akcją na elemencie.

Przykłady:

```typescript
await page.waitForResponse(response =>
  response.url().includes('/api/orders') && response.status() === 200
);

await page.waitForURL('**/checkout/success');

const downloadPromise = page.waitForEvent('download');
await page.getByRole('link', { name: 'Pobierz raport' }).click();
const download = await downloadPromise;
```

Nadal obowiązuje zasada: czekaj na znaczący stan, nie na losową liczbę sekund.

## 9. `waitForTimeout` — dlaczego to antywzorzec

```typescript
await page.waitForTimeout(3000); // źle jako standard
```

Problemy:

- spowalnia testy, gdy aplikacja jest szybka;
- nie wystarcza, gdy aplikacja jest wolniejsza niż zwykle;
- ukrywa prawdziwy warunek gotowości;
- zwiększa niestabilność w CI.

Lepsze wersje:

```typescript
await expect(page.getByText('Import zakończony')).toBeVisible();
```

```typescript
await expect(page.getByRole('button', { name: 'Zapisz' })).toBeEnabled();
```

```typescript
await page.waitForResponse('**/api/import/status');
```

## 10. Debugowanie actionability

Gdy akcja kończy się timeoutem, otwórz trace viewer. Zobaczysz, czy element był:

- niewidoczny;
- zasłonięty;
- disabled;
- niestabilny przez animację;
- znajdowany w wielu kopiach;
- usuwany i dodawany ponownie do DOM.

Komendy przydatne lokalnie:

```bash
npx playwright test --debug
npx playwright test --ui
npx playwright show-trace trace.zip
```

## 11. Typowe scenariusze flakiness

### Animacje

Element jest widoczny, ale nadal się przesuwa. Playwright czeka na stabilność. Jeśli animacja trwa długo albo zapętla się, test padnie.

### Overlay

Element jest widoczny, ale nie otrzymuje eventów, bo zasłania go loader, cookie banner albo modal.

### Disabled button

Przycisk pojawia się od razu, ale jest aktywny dopiero po walidacji formularza.

### Re-render SPA

Locator znajduje element, ale framework usuwa go i tworzy ponownie. Użycie locatorów zamiast ElementHandle pomaga ograniczyć ten problem.

## 12. Checklista oczekiwania

- Czy test używa locatorów, a nie zapisanych ElementHandle?
- Czy akcja czeka na actionability zamiast ręcznego sleep?
- Czy asercja opisuje stan użytkownika?
- Czy `force: true` ma uzasadnienie?
- Czy dla procesów API użyto `waitForResponse` albo asercji UI?
- Czy timeouty są lokalne i uzasadnione?
- Czy trace pokazuje konkretną przyczynę timeoutu?
- Czy problem nie wynika z błędu dostępności albo overlayu?

## Linki

- [Actionability](https://playwright.dev/docs/actionability)
- [Assertions](https://playwright.dev/docs/test-assertions)
- [Auto-waiting best practices](https://playwright.dev/docs/best-practices)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)

## 📘 Suplement Inżynieryjny 2026: Podstawy Playwright (Locators & Actions)
*Inspiracja: „Hands-On Automated Testing with Playwright” (2026), Chapter 2*
*   **Priorytet Dostępności (A11y)**: Współczesne testy odrzucają surowe selektory CSS i XPath. Zawsze dąż do używania lokalizatorów semantycznych (`getByRole`, `getByLabel`), które imitują interakcję prawdziwego użytkownika i ułatwiają zachowanie standardów dostępności w kodzie produkcyjnym.
*   **Auto-Waiting State Machine**: Playwright przed kliknięciem elementu automatycznie sprawdza jego stan (czy jest widoczny, stabilny, włączony i klikalny). Zrozumienie tej maszyny stanów zapobiega pisaniu zbędnych oczekiwań (np. `sleep`).
