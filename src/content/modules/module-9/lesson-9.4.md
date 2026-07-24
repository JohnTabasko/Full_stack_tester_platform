# Walka z Flakiness: Projektowanie stabilnych i niezawodnych testów

Niestabilne testy (tzw. **Flaky Tests** – testy, które raz przechodzą pomyślnie, a raz nie, bez żadnej zmiany w kodzie aplikacji) to największy wróg automatyzacji. Niszczą zaufanie zespołu do wyników testów, spowalniają wdrażanie kodu i generują ogromne koszty utrzymania.

Jak podkreśla Jean-François Greffier w książce *"Practical Playwright Test" (2026)*, stabilność nie jest dziełem przypadku – to efekt rygorystycznego przestrzegania zasad inżynierskich. W tej lekcji nauczysz się identyfikować, diagnozować i trwale eliminować przyczyny niestabilności testów.

---

## 1. Najczęstsze przyczyny powstawania Flaky Tests

Większość niestabilności w testach UI wynika z trzech głównych błędów:

### A. Wyścigi Stanów (Race Conditions)
Test zakłada, że elementy wyrenderują się natychmiast, zamiast czekać na ich stan za pomocą asercji Web-First.
*   *Rozwiązanie*: Nigdy nie używaj pobierania stanów synchronicznych (np. `locator.isVisible()`). Zawsze stosuj `await expect(locator).toBeVisible()`.

### B. Brak Izolacji Środowiskowej (Data Leaks)
Równoległe testy modyfikują ten sam rekord w bazie danych lub współdzielą jedno konto użytkownika.
*   *Rozwiązanie*: Każdy test musi operować na unikalnych danych i odizolowanej sesji (BrowserContext).

### C. Niewłaściwe Oczekiwanie na Zdarzenia Sieciowe
Test klika przycisk nawigacji i natychmiast próbuje kliknąć element na kolejnej stronie, zanim ta zdąży się wczytać.
*   *Rozwiązanie*: Korzystaj z weryfikacji URL (`expect(page).toHaveURL()`) przed interakcją z elementami docelowymi.

---

## 2. Diagnozowanie wyścigów stanów: Pętla Polling w Asercjach

Czasami asercja Web-First potrzebuje więcej czasu niż domyślne 5 sekund z powodu powolnego zapytania backendowego. Zamiast wydłużać timeout globalnie dla wszystkich testów (co wydłużyłoby czas wykrywania prawdziwych błędów), zwiększ próg tolerancji dla tego jednego, konkretnego wywołania:

```typescript
// Pozwól tej konkretnej asercji czekać do 15 sekund
await expect(page.locator('.generation-status')).toHaveText('Zakończono', { timeout: 15000 });
```

---

## 3. Kontrola Flakiness przy użyciu wbudowanego mechanizmu Retries

Playwright Test pozwala na automatyczne ponawianie nieudanych testów w przypadku wykrycia awarii (tzw. Retries). Jeśli test nie przejdzie przy pierwszym podejściu, ale przejdzie przy ponowieniu, Playwright oznaczy go w raportach jako **Flaky**:

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Ponów nieudany test maksymalnie 2 razy w środowisku CI
  retries: process.env.CI ? 2 : 0,
});
```

**Złota zasada**: Retries to doskonała poduszka bezpieczeństwa dla CI, ale **nigdy nie powinny służyć jako wymówka dla ignorowania niestabilnych testów!** Każdy test oznaczony jako Flaky wymaga rzetelnego zbadania przyczyny przy użyciu Trace Viewera i refaktoryzacji kodu.

---

## 4. Checklista Stabilności Testów
- [ ] Czy wyeliminowałeś wszystkie synchroniczne asercje na stanach UI z kodu testów?
- [ ] Czy każdy test tworzy własne unikalne rekordy w bazie i operuje na odizolowanej sesji, zapobiegając wyciekom danych?
- [ ] Czy ustawiłeś elastyczny timeout dla powolnych procesów bezpośrednio w parametrach asercji?
- [ ] Czy rzetelnie badasz przyczyny każdego testu oznaczonego w raportach jako Flaky?