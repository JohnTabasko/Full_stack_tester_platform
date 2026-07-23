# Debugowanie: Playwright Inspector i Trace Viewer — profesjonalny przewodnik

> **Perspektywa Full Stack Testera**
> Prawdziwy inżynier nie zgaduje, dlaczego test padł — on to sprawdza. Playwright oferuje najpotężniejsze narzędzia diagnostyczne w ekosystemie testowania automatycznego: Playwright Inspector (debugowanie interaktywne), Trace Viewer ("czarna skrzynka" testu z możliwością podróży w czasie) i UI Mode (połączone środowisko pracy). Gdy test pada na CI, nie masz dostępu do okna przeglądarki. Ale masz Trace — plik, który zawiera kompletny zapis stanu testu w każdej milisekundzie. Umiejętność czytania Trace'a to kompetencja, która odróżnia dobrego testera od eksperta.

## Cel lekcji

Po ukończeniu tej lekcji potrafisz używać Playwright Inspector do interaktywnego debugowania, rozumiesz architekturę i możliwości Trace Viewera, znasz wszystkie zakładki Trace Viewera (Timeline, Action, Network, Console, Source), potrafisz diagnozować problemy z actionability i timeoutami, konfigurujesz trace na CI (`retain-on-failure`), i wiesz, jak analizować trace'y z poprzednich uruchomień na CI.

---

## Playwright Inspector — debugowanie interaktywne

### Uruchomienie trybu debugowania

```bash
# Podstawowe uruchomienie
npx playwright test --debug

# Debug z otwartym UI
npx playwright test --ui

# Debug z określonego pliku
npx playwright test tests/checkout.spec.ts --debug

# Debug z określonego testu (po nazwie)
npx playwright test --debug --grep "złóż zamówienie"

# Debug z zatrzymaniem na początku (break on first action)
npx playwright test --debug --pause-on-first-failure
```

### Co oferuje Inspector?

**Okno Inspectora** składa się z:
- **Panel przeglądarki** — live preview strony podczas debugowania.
- **Panel kodu** — kod testu z podświetloną aktualnie wykonywaną linią.
- **Panel locators** — lista wszystkich znalezionych elementów na stronie.
- **Konsola Playwright** — interaktywna konsola do wpisywania komend Playwright.

### Pick Locator — interaktywne znajdowanie selektorów

```bash
# W oknie Inspectora:
# 1. Kliknij przycisk "Pick locator" (ikona kursora myszy z celownikiem)
# 2. Najedź myszą na element na stronie
# 3. Playwright podpowie najlepszy selektor (getByRole, getByLabel, CSS)

# Przykładowy workflow:
# 1. Uruchom: npx playwright test tests/login.spec.ts --debug
# 2. W oknie Inspectora kliknij "Pick locator"
# 3. Najedź na pole email → podpowiedź:
#    "page.getByLabel('Email')"
# 4. Kliknij na pole → podpowiedź zostaje skopiowana do schowka
# 5. Wklej do kodu testu
```

### Praca z breakpointami

```typescript
// W kodzie testu — debugger zatrzyma się przed tą linią
test('debugowanie testu logowania', async ({ page }) => {
  await page.goto('/login');
  
  // Breakpoint: debugger zatrzyma się tutaj
  // (tylko w trybie --inspect or --debug)
  await page.pause();  // Specjalna metoda Playwright do zatrzymania
  
  await page.getByLabel('Email').fill('test@example.pl');
  await page.getByLabel('Hasło').fill('haslo123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  
  await expect(page).toHaveURL('/dashboard');
});
```

### Inspekcja stanu strony w Inspectorze

```typescript
test('debugowanie stanu DOM', async ({ page }) => {
  await page.goto('/products');
  
  // Wpisz w konsolę Inspectora (nie w kodzie!):
  // await page.evaluate(() => console.log(document.body.innerHTML))
  
  // Lub w kodzie — sprawdź co jest w DOM:
  const allButtons = await page.locator('button').all();
  console.log(`Na stronie jest ${allButtons.length} przycisków`);
  
  for (let i = 0; i < allButtons.length; i++) {
    const text = await allButtons[i].innerText();
    const isVisible = await allButtons[i].isVisible();
    console.log(`[${i}] "${text}" — visible: ${isVisible}`);
  }
  
  // Sprawdź widoczność konkretnego elementu
  const checkoutButton = page.getByRole('button', { name: 'Złóż zamówienie' });
  const count = await checkoutButton.count();
  const firstVisible = await checkoutButton.first().isVisible();
  
  console.log(`Znaleziono ${count} przycisków "Złóż zamówienie", ${firstVisible ? 'pierwszy widoczny' : 'żaden widoczny'}`);
});
```

---

## Trace Viewer — czarna skrzynka testu

### Architektura Trace'a

Trace to kompletny zapis wykonania testu, zapisany do pliku `.zip`. Zawiera:

```
trace.zip/
├── trace.json        # Metadane, timeline, lista akcji
├── trace.network/    # Przechwycone żądania/odpowiedzi HTTP
├── actions/          # Screenshots i DOM snapshots każdej akcji
└── events/           # Zdarzenia przeglądarki (console logs, etc.)
```

Każda akcja testu jest zapisana jako:
- **Screenshot** (snapshot wizualny strony PRZED i PO akcji).
- **DOM snapshot** (pełny HTML strony w danym momencie).
- **Network log** (żądania/odpowiedzi HTTP z tamtego momentu).
- **Console log** (wszystkie logi JS z tamtego momentu).
- **Metadata** (timeout, actionability checks, error messages).

### Konfiguracja trace

```typescript
// playwright.config.ts
export default defineConfig({
  // Trace zapisuj tylko gdy test padnie (nie na sukces — oszczędza miejsce)
  trace: 'retain-on-failure',
  
  // Lub zapisuj zawsze (dla lepszego debugowania, ale więcej miejsca)
  // trace: 'on',
  
  // Konfiguracja screenshotów na awarię
  screenshot: 'only-on-failure',
  
  // Konfiguracja wideo na awarię  
  video: 'retain-on-failure',
  
  // Dla CI: playwright-report jako artifact
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
  ],
});
```

### Uruchomienie Trace Viewera

```bash
# Lokalne trace'y (z poprzedniego uruchomienia)
npx playwright show-trace trace.zip

# Otwórz Trace z artifact CI (GitHub Actions)
# Ściągnij plik z artifactów i otwórz:
npx playwright show-trace ./playwright-report/trace.zip

# Lub otwórz bezpośrednio w przeglądarce (online)
# Wejdź na https://trace.playwright.dev i przeciągnij plik .zip
```

### Zakładki Trace Viewera — kompletny przewodnik

**1. Timeline (Oś czasu):**
```
──────●──────●──────●──────●──────●────────────────→ czas

● = akcja testu (goto, click, fill, expect)
Linia pod osią = screenshot strony w danym momencie

Jak czytać timeline:
- Długi segment (np. 15s) = wolna operacja (np. page.goto)
- Krótki segment (np. 50ms) = szybka akcja (np. click)
- Czerwony punkt = błąd
- Kliknięcie na punkt = przejście do szczegółów akcji
```

**2. Action (Szczegóły akcji):**
```
Zakładka "Action" pokazuje dla wybranej akcji:
- Nazwa akcji: page.getByRole('button', { name: 'Złóż zamówienie' }).click()
- Czas trwania: 2.3s
- Wynik: TIMEOUT — exceeded 30s

Actionability checks (co sprawdzał Playwright przed wykonaniem):
✓ Attached: element jest w DOM
✓ Visible: element jest widoczny
✗ Stable: element NIE jest stabilny (w trakcie animacji!)
✗ Enabled: element jest wyłączony (disabled)
✗ Receiving Events: element jest zasłonięty przez overlay "Ładowanie..."

→ To jest przyczyna błędu! Przycisk ma animację / jest wyłączony / jest pod overlayem
```

**3. Network (Żądania sieciowe):**
```
Lista wszystkich żądań HTTP wykonanych między poprzednią a aktualną akcją:
- GET /api/products → 200 OK (czas: 150ms)
- GET /api/user → 401 Unauthorized (czas: 50ms)
- POST /api/cart → 201 Created (czas: 200ms)

Jak używać:
- Kliknij żądanie → zobacz request headers, body, response body
- Filtrowanie: wszystkie / xhr / fetch / doc / img / css / js / other
- Szukaj po URL: /api/orders

Pomaga zidentyfikować:
- Czy API zwróciło poprawne dane?
- Czy był błąd 500/403 na backendzie?
- Czy żądanie w ogóle zostało wysłane?
```

**4. Console (Logi JavaScript):**
```
Wszystkie console.log(), console.error(), console.warn() z danej chwili:
[INFO] Application początkowyized
[INFO] User session loaded from localStorage
[WARN] API response time exceeded 1000ms
[ERROR] Failed to fetch product data: NetworkError

Jak używać:
- Screenshot + console log = complete context of failure
- Szukaj "Error" → szybko znajdujesz błąd JavaScript
- Kliknij na log → snapshot strony z tamtej chwili
```

**5. Source (Kod źródłowy):**
```
Kod testu z podświetloną linią, która wywołała daną akcję:
test('złóż zamówienie', async ({ page }) => {
  12  await page.goto('/checkout');
  13  await page.getByRole('button', { name: 'Złóż zamówienie' }).click();
                              ↑ ← linia 13 wykonała się z błędem
  14  await expect(page.getByText('Zamówienie potwierdzone')).toBeVisible();
})

Jak używać:
- Szybko mapuj błąd na linię kodu
- Zobacz full context (gdzie jesteś w teście)
```

### Praktyczny przykład diagnostyki przez Trace

Scenariusz: Test "Złóż zamówienie" pada z TimeoutError.

**Krok 1: Pobierz trace z CI**

```bash
# W GitHub Actions artifact jest automatycznie przechowywany
# Ściągnij z: Actions → Run → Summary → Artifacts → playwright-trace
```

**Krok 2: Otwórz w Trace Viewer**

```bash
npx playwright show-trace trace-from-ci.zip
```

**Krok 3: Analiza timeline**

Widzisz timeline:
- goto /checkout → 3.2s ✅
- click #submit → 30s ❌ (timeout!)

**Krok 4: Analiza akcji (Action)**

Klikasz na akcję click. Zakładka Action pokazuje:
```
TimeoutError: Timed out 30000ms waiting for the element to be visible,
enabled and stable.

Action: click
Selector: #submit
Timeout: 30000ms

Actionability checks:
✓ Attached (element is in DOM)
✓ Visible (element is visible, not hidden)
✗ Stable (element was animating — transition duration 5s)
✗ Enabled (element was disabled by CSS class .loading)
✗ Receiving Events (element is covered by overlay div.loading-overlay)
```

**Wynik analizy:** Przycisk "Złóż zamówienie" jest wyłączony (disabled) i przykryty overlayem "Ładowanie" podczas animacji. Animacja trwa 5 sekund. Playwright próbował przez 30 sekund — i timeout.

**Rozwiązanie:**
```typescript
// W kodzie testu — poczekaj na zakończenie animacji przed interakcją:
await page.waitForSelector('#submit:not(.loading)', { state: 'visible' });
await page.locator('#submit').click({ force: true }); // force = ignoruj overlay (tylko debug!)
```

---

## UI Mode — zintegrowane środowisko pracy

```bash
# Uruchom UI Mode
npx playwright test --ui

# Z UI Mode możesz:
# 1. Przeglądać pliki testowe i klikać "Play" przy wybranym teście
# 2. Watch mode: test uruchamia się automatycznie po zapisaniu pliku
# 3. Debugowanie interaktywne (breakpoints)
# 4. Podgląd trace po zakończeniu testu
# 5. Filtrowanie testów po tagach, statusach, plikach
```

**Tryb Watch** (automatyczne uruchomienie po zapisie):

```bash
npx playwright test --ui --watch
# Teraz: zapisz plik → test uruchamia się automatycznie
# Idealny do pisania nowego testu — efekt widać natychmiast
```

---

## Konfiguracja trace na CI

### GitHub Actions

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  playwright:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run Playwright tests
        run: npx playwright test
        
      - name: Upload Trace on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-trace-${{ github.run_id }}
          path: |
            playwright-report/
            test-results/
          retention-days: 30
          if-no-files-found: ignore
```

### Odzyskiwanie trace z nieudanego builda

```bash
# Pobierz artifact z poprzedniego builda
gh run download <run-id> --name playwright-trace-<id>

# Otwórz w Trace Viewerze
npx playwright show-trace ./playwright-trace/trace.zip

# Lub uploaduj na trace.playwright.dev (online)
# Przeciągnij plik .zip do okna przeglądarki
```

---

## Perspektywa Full Stack Testera — diagnostyka jako kompetencja

Umiejętność diagnozowania problemów przez Trace Viewer to najważniejsza kompetencja eksperta Playwrighta. Gdy potrafisz:
- Odczytać timeline i zidentyfikować, która akcja trwała najdłużej.
- Sprawdzić Actionability Checks, aby zrozumieć, dlaczego Playwright nie mógł wykonać akcji.
- Przejrzeć Network logs, aby sprawdzić, czy backend odpowiada poprawnie.
- Zidentyfikować Console logs z błędami JavaScript.
- Powiązać błąd z konkretną linią kodu w Source.

...wtedy nie musisz zgadywać, dlaczego test padł. Zaglądasz do "czarnej skrzynki" i masz kompletną odpowiedź. Programiści pokochają Cię za to — zamiast "u mnie działa" masz dla nich "tu jest błąd, oto dowód".

---

## Podsumowanie

1. **Playwright Inspector** — interaktywne debugowanie, Pick Locator, breakpoints, live console.
2. **Trace Viewer** — pełny zapis stanu testu. Timeline, Action, Network, Console, Source.
3. **Zakładki Trace**: Actionability checks, Network logs, Console logs, Source mapping.
4. **Konfiguracja CI**: `retain-on-failure`, upload artifact, Trace jako artefakt builda.
5. **UI Mode**: Zintegrowane środowisko + watch mode dla szybkiego feedbacku.
6. **trace.playwright.dev**: Otwieranie trace'ów online bez instalacji.

---

## Linki i źródła

- [Debugging in Playwright](https://playwright.dev/docs/debug)
- [Trace Viewer Guide](https://playwright.dev/docs/trace-viewer)
- [Trace Viewer — Online](https://trace.playwright.dev)
- [Playwright UI Mode](https://playwright.dev/docs/ui-mode)
- [Best Practices — Trace Viewer](https://playwright.dev/docs/best-practices#recording-a-trace)

## 📘 Suplement Inżynieryjny 2026: Debugowanie i Rozwiązywanie Problemów
*Inspiracja: „Hands-On Automated Testing with Playwright” (2026), Chapter 8*
*   **Diagnostyka Trace Viewer**: W przypadku awarii w CI, plik trace jest Twoim najważniejszym dowodem. Zawiera nagranie DOM, historię sieci, logi konsoli przeglądarki oraz zrzuty ekranu przed i po każdej akcji.
*   **UI Mode**: Wykorzystaj interaktywny tryb UI (`npx playwright test --ui`) do błyskawicznego pisania, debugowania i podróżowania w czasie (time-travel) w kodzie testów.
