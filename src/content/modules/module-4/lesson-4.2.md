# Ramki iframe i ramki zagnieżdżone — kompletny przewodnik

> **Perspektywa Full Stack Testera**
> Ramki iframe to jedno z tych miejsc w nowoczesnych aplikacjach webowych, gdzie granica między frontendem a backendem, między Twoją domeną a zewnętrznym dostawcą, staje się najbardziej widoczna. Jako tester automatyczny musisz rozumieć, jak te ramki działają, dlaczego zostały zaprojektowane w określony sposób i jak radzić sobie z wyzwaniami, które za sobą niosą — od problemów z synchronizacją, przez izolację bezpieczeństwa, po diagnostykę awarii w środowisku rozproszonym.

## Cel lekcji

Po ukończeniu tej lekcji rozumiesz architekturę ramek iframe w kontekście nowoczesnych aplikacji webowych, potrafisz identyfikować różne typy iframe występujące w projektach komercyjnych, swobodnie nawigujesz po zagnieżdżonych strukturach ramek w Playwright, rozumiesz różnice między ramkami same-origin i cross-origin oraz wiesz, jak diagnozować problemy z iframe w środowisku CI.

---

## Wprowadzenie: Czym jest iframe i dlaczego tester musi to rozumieć

Ramka iframe (Inline Frame) to element HTML, który pozwala osadzić jedną stronę internetową wewnątrz drugiej. Z perspektywy technicznej jest to osobny dokument HTML wczytany w izolowanym kontekście wewnątrz głównego dokumentu strony. Ta izolacja jest zarówno zaletą, jak i źródłem wyzwań testerskich.

Współczesne aplikacje webowe wykorzystują iframe na szeroką skalę:

- **Widgety płatnicze**: Stripe, PayPal, Przelewy24 — każdy z tych dostawców osadza swój interfejs w iframe, aby izolować dane wrażliwe (numery kart, hasła) od głównej domeny aplikacji. Ma to kluczowe znaczenie dla zgodności z PCI DSS.
- **Czat i wsparcie live**: Intercom, Zendesk, Crisp — widgety wsparcia klienta działają w izolowanym iframe, aby ich kod nie kolidował z kodem aplikacji hosta.
- **Reklamy i remarketing**: Banerowe systemy reklamowe (Google AdSense, Meta Pixel) osadzają się w iframe, aby izolować śledzenie od głównej aplikacji.
- **Filmy i multimedia**: YouTube, Vimeo — osadzanie filmów przez iframe to standard branżowy.
- **Autoryzacja OAuth**: Okna logowania Google, GitHub, Facebook często otwierają się jako iframe lub popup z izolowaną domeną.
- **Dokumenty wbudowane**: PDF.js, przeglądarki dokumentów Office 365 osadzane przez iframe.
- **Mikro-frontendy**: W architekturze mikro-frontendów poszczególne moduły aplikacji mogą być osadzone jako iframe (model Shell + Remote).

Zrozumienie iframe jest krytyczne, ponieważ jako tester Full Stack będziesz musiał:
1. Weryfikować interakcje użytkownika z widgetami zewnętrznymi.
2. Sprawdzać, czy komunikacja między ramką a aplikacją hostem działa poprawnie.
3. Diagnozować problemy z ładowaniem, timeoutem lub błędami bezpieczeństwa iframe.
4. Pisać testy odporne na zmiany w zewnętrznych dostawcach.

---

## Architektura iframe: Model Document-tree i relacja nadrzędna-podrzędna

### Struktura DOM w iframe

Gdy przeglądarka napotyka element `<iframe>`, tworzy nowy dokument HTML wewnątrz ramki. Ten dokument ma własny model DOM (Document Object Model), własne okno (`window`) i — w przypadku cross-origin — własny kontekst bezpieczeństwa (origin).

Struktura DOM wygląda następująco:

```
┌──────────────────────────────────────────────────────────┐
│  Główna strona (Parent Document)                         │
│  ├── <html>                                              │
│  │   ├── <head>...</head>                                │
│  │   └── <body>                                          │
│  │       ├── <header>...</header>                        │
│  │       ├── <main>                                      │
│  │       │   └── <iframe id="payment-widget"            │
│  │       │       src="https://checkout.stripe.com">     │
│  │       │       ┌──────────────────────────────┐       │
│  │       │       │  iframe Document (Child)     │       │
│  │       │       │  ├── <html>                  │       │
│  │       │       │  ├── <head>...</head>        │       │
│  │       │       │   └── <body>                 │       │
│  │       │       │       ├── formularz kart...  │       │
│  │       │       │       └── przycisk "Pay"     │       │
│  │       │       └──────────────────────────────┘       │
│  │       └── <footer>...</footer>                        │
└──────────────────────────────────────────────────────────┘
```

Kluczowe pojęcie: **Document-tree to hierarchia, w której iframe nie jest zwykłym elementem HTML — jest bramą do oddzielnego dokumentu**. Z perspektywy DOM iframe jest elementem, ale jego zawartość to osobny dokument.

### Kontekst okna i izolacja

Każdy iframe ma własny obiekt `window`, co oznacza:
- Własny JavaScript kontekst uruchomienia.
- Własny global zakres (`window` ≠ nadrzędny `window`).
- Własne ciasteczka (podlegające regułom `SameSite`).
- Własny `localStorage` i `sessionStorage` (jeśli origin się zgadza).
- Własne timer (`setTimeout`, `setInterval`).

To właśnie ta izolacja sprawia, że iframe jest bezpiecznym mechanizmem osadzania zewnętrznego kodu — skrypt uruchomiony w iframe payment-widget nie ma bezpośredniego dostępu do DOM ani danych głównej aplikacji (chyba że oba originy są tożsame i ramka jest jawnie skonfigurowana do komunikacji).

### Same-Origin vs Cross-Origin

**Origin** to kombinacja trzech składników: `scheme://domain:port`. Dwa originy są identyczne wtedy i tylko wtedy, gdy wszystkie trzy składniki się zgadzają.

**Same-Origin iframe**: Ramka osadzona na tym samym originie co strona hosta. Przykład: strona `https://mojaaplikacja.pl/kasa` osadza iframe `https://mojaaplikacja.pl/widget-koszyk`. W tym przypadku JavaScript z ramki ma pełny dostęp do nadrzędnej strony przez `parent.window`, a kod z głównej strony może bezpośrednio manipulować DOM ramki.

**Cross-Origin iframe**: Ramka z innego originu niż strona hosta. Przykład: strona `https://mojaaplikacja.pl` osadza iframe `https://checkout.stripe.com`. Ze względów bezpieczeństwa (Same-Origin Policy) strona hosta NIE ma dostępu do DOM, JavaScript ani danych ramki cross-origin. To fundamentalne ograniczenie — nawet jeśli znasz strukturę DOM Stripe'a, nie możesz jej czytać ani modyfikować z poziomu strony hosta.

Playwright rozwiązuje problem cross-origin przez komunikację z ramką jako z pełnym, izolowanym dokumentem — ma dostęp do DOM ramki, ale nie do DOM strony hosta i odwrotnie. To właśnie ta izolacja jest jednocześnie wyzwaniem (testy nie mogą "zajrzeć" z ramki do strony hosta) i zabezpieczeniem (zewnętrzny dostawca nie może manipulować Twoją aplikacją).

---

## Metody interakcji z iframe w Playwright

### frameLocator() — podstawowe narzędzie

`frameLocator()` to główna metoda w Playwright do pracy z ramkami iframe. Tworzy ona obiekt `FrameLocator`, który reprezentuje kontekst ramki i pozwala na wykonywanie wszystkich standardowych operacji Playwright (lokalizatory, akcje, asercje) w kontekście zawartości ramki.

**Składnia podstawowa:**

```typescript
import { test, expect } from '@playwright/test';

test('użytkownik może zapłacić kartą przez widget Stripe', async ({ page }) => {
  // Przejdź do strony z widgetem płatności
  await page.goto('https://mojaaplikacja.pl/checkout');
  
  // Utwórz lokalizator ramki
  // Możesz identyfikować iframe przez różne atrybuty:
  const frame = page.frameLocator('#payment-frame');
  
  // Teraz wszystkie operacje wykonywane są w kontekście ramki iframe
  await frame.getByLabel('Numer karty').fill('4242 4242 4242 4242');
  await frame.getByLabel('Data ważności').fill('12/28');
  await frame.getByLabel('CVC').fill('123');
  
  // Kliknij przycisk płatności wewnątrz ramki
  await frame.getByRole('button', { name: 'Zapłać' }).click();
  
  // Zweryfikuj komunikat potwierdzający (też wewnątrz ramki)
  await expect(frame.getByText('Płatność zakończona pomyślnie')).toBeVisible({ timeout: 10000 });
});
```

**Identyfikacja iframe — różne strategie:**

```typescript
// Przez atrybut id
const frame1 = page.frameLocator('#payment-widget');

// Przez atrybut name
const frame2 = page.frameLocator('iframe[name="stripe-frame"]');

// Przez atrybut src (pełny lub częściowy URL)
const frame3 = page.frameLocator('iframe[src*="checkout.stripe.com"]');

// Przez atrybut data-*
const frame4 = page.frameLocator('iframe[data-widget-type="payment"]');

// Przez URL regex (gdy src jest dynamiczny)
const frame5 = page.frameLocator('iframe[src^="https://sdk.stripe.com"]');

// Przez relację w strukturze DOM
// Jeśli iframe jest wewnątrz konkretnego kontenera:
const frame6 = page.frameLocator('#checkout-section iframe');
```

### frameLocator() vs page.frame() — kiedy co wybrać?

Playwright oferuje dwie metody pracy z ramkami. Warto zrozumieć różnicę, aby wybierać świadomie:

| Cecha | `frameLocator()` | `page.frame()` |
|---|---|---|
| **Typ zwracany** | `FrameLocator` | `Frame \| null` |
| **Oczekiwanie na ramkę** | Automatyczne | Brak — ramka musi istnieć |
| **Nawigacja ramki** | Łączenie łańcuchowe | Brak (ramka to statyczny obiekt) |
| **Identyfikacja** | Selektor (dowolny) | Lokalizator lub name |
| **Zagnieżdżanie** | Łatwe (łańcuchowanie) | Możliwe, ale mniej czytelne |
| **Auto-retry** | Tak (jak standardowe lokatory) | Nie |
| **Wydajność** | Lekko wolniejszy (tworzy obiekt locator) | Szybszy (bezpośredni dostęp do ramki) |

**Kiedy używać `frameLocator()` (zalecane):**

```typescript
// Wygodne łączenie łańcuchowe dla ramek zagnieżdżonych
const innerFrame = page.frameLocator('#outer-frame').frameLocator('#inner-frame');
await innerFrame.getByRole('button').click();

// Automatyczne czekanie na dostępność ramki
await expect(page.frameLocator('#payment')).toBeVisible();
```

**Kiedy używać `page.frame()`:**

```typescript
// Gdy potrzebujesz bezpośredniego dostępu do obiektu ramki (np. do nawigacji)
const frame = page.frame({ name: 'stripe-checkout' });
if (frame) {
  await frame.goto('https://stripe.com/payment');
}

// Gdy ramka ma stałą nazwę i chcesz szybki dostęp
const namedFrame = page.frame('payment-iframe');
await namedFrame?.fill('#card-number', '4242424242424242');
```

**Rekomendacja**: Dla większości scenariuszy testowych używaj `frameLocator()`. Daje on automatyczne oczekiwanie, czytelne łańcuchy dla ramek zagnieżdżonych i spójne API z resztą Playwrighta. Używaj `page.frame()` tylko wtedy, gdy potrzebujesz specyficznych operacji na obiekcie `Frame` (np. nawigacja ramki).

---

## Ramki zagnieżdżone (Nested iframes)

### Struktura zagnieżdżenia

W rzeczywistych aplikacjach iframe mogą być zagnieżdżone w wielu poziomach. Typowy scenariusz: strona hosta → iframe konfiguracji → iframe z formularzem płatności → iframe z kodem CAPTCHA.

Struktura zagnieżdżenia:

```
Strona hosta (https://mojaaplikacja.pl)
  └── iframe#outer (ten sam origin lub cross-origin)
        └── iframe#middle (cross-origin)
              └── iframe#inner (ten sam origin co #middle)
                    └── <form>...</form>
```

### Łączenie frameLocatorów

Playwright pozwala na naturalne łączenie lokalizatorów ramek. Każde wywołanie `frameLocator()` przechodzi "w głąb" struktury zagnieżdżenia:

```typescript
test('formularz w zagnieżdżonej ramce działa poprawnie', async ({ page }) => {
  await page.goto('https://mojaaplikacja.pl/reservation');
  
  // Nawigacja przez trzy poziomy zagnieżdżenia
  const formFrame = page
    .frameLocator('#payment-configurator')     // Poziom 1
    .frameLocator('iframe[name="checkout"]')   // Poziom 2
    .frameLocator('#card-form');               // Poziom 3
  
  // Teraz działamy na formularzu w trzecim poziomie zagnieżdżenia
  await formFrame.getByLabel('Imię i nazwisko').fill('Jan Kowalski');
  await formFrame.getByLabel('Email').fill('jan.kowalski@example.pl');
  
  // Kliknij przycisk zlokalizowany w trzecim poziomie zagnieżdżenia
  await formFrame.getByRole('button', { name: 'Dalej' }).click();
});
```

### Identyfikacja ramek w strukturze zagnieżdżonej

Gdy masz do czynienia z wieloma zagnieżdżonymi ramkami, identyfikacja właściwej ramki może być wyzwaniem. Oto strategie:

**1. Używaj atrybutów stabilnych:**

```typescript
// Unikaj identyfikacji przez indeks lub losowy identyfikator
// ✅ Dobrze — atrybut data-* z明确 semantyką
const formFrame = page.frameLocator('[data-testid="payment-form-frame"]');

// ❌ Źle — indeks ramki może się zmienić
const formFrame = page.frameLocator('iframe >> nth=2');
```

**2. Sprawdź URL ramki:**

```typescript
test('zweryfikuj, że poprawna ramka została wczytana', async ({ page }) => {
  await page.goto('https://mojaaplikacja.pl/checkout');
  
  const frame = page.frameLocator('iframe[name="payment-gateway"]');
  
  // Pobierz URL aktualnie wczytanej ramki
  const frameUrl = await frame.locator(':root').getAttribute('src');
  
  // Zweryfikuj, że ramka wczytała poprawnego dostawcę
  expect(frameUrl).toContain('stripe.com/v3');
});
```

**3. Wyszukaj iframe przez widoczny znacznik:**

```typescript
// Jeśli ramka zawiera charakterystyczny element (np. logo dostawcy),
// możesz najpierw zweryfikować, że to właściwa ramka
await expect(page.frameLocator('iframe[name="payment"]').locator('img[alt="Stripe"]')).toBeVisible({ timeout: 5000 });
```

---

## Ramki cross-origin — wyzwania i rozwiązania

### Problem izolacji cross-origin

Gdy ramka iframe należy do innego originu niż strona hosta, obowiązuje **Same-Origin Policy (SOP)**. Oznacza to, że:

1. Strona hosta NIE może odczytać DOM ramki cross-origin.
2. Kod ramki cross-origin NIE może odczytać DOM strony hosta.
3. Komunikacja jest możliwa tylko przez mechanizmy jawne (postMessage API).
4. Ciasteczka ramki podlegają regułom `SameSite` — domyślnie `Lax` lub `Strict`.

Dla testera oznacza to, że:
- Nie możesz "zajrzeć" z poziomu testu do iframe Stripe'a i sprawdzić, jakie wartości użytkownik wpisał.
- Nie możesz bezpośrednio wywołać akcji wewnątrz ramki cross-origin ze strony hosta (musisz symulować interakcję użytkownika).
- Problemy z ładowaniem ramki cross-origin wymagają diagnostyki na poziomie żądań sieciowych.

### Playwright a cross-origin — jak sobie radzi

Playwright komunikuje się z ramką cross-origin tak samo jak z ramką same-origin — przez WebSocket i CDP (Chrome DevTools Protocol). Ramka jest traktowana jako izolowany dokument, do którego Playwright ma pełny dostęp (tak jak w prawdziwej przeglądarce). Różnica polega na tym, że strona hosta (Twoja aplikacja) nie ma dostępu — i Twój kod testowy też nie ma tego dostępu (bo działa w kontekście strony hosta).

**Praktyczny przykład — testowanie widgetu Stripe:**

```typescript
test('użytkownik może zakończyć płatność przez widget Stripe', async ({ page }) => {
  await page.goto('https://mojaaplikacja.pl/checkout/cart');
  
  // Kliknij przycisk "Przejdź do płatności" w głównej aplikacji
  await page.getByRole('button', { name: 'Zapłać' }).click();
  
  // Poczekaj na załadowanie ramki iframe dostawcy płatności
  // Playwright automatycznie czeka na dostępność ramki
  const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]');
  
  // Wypełnij formularz w ramce — Playwright symuluje interakcję użytkownika
  // Tak jak prawdziwy użytkownik klika i wpisuje w iframe
  await stripeFrame.getByLabel('Card number').fill('4242424242424242');
  await stripeFrame.getByLabel('MM / YY').fill('1230');
  await stripeFrame.getByLabel('CVC').fill('123');
  
  // Złóż zamówienie
  await stripeFrame.getByRole('button', { name: /pay|submit|complete/i }).click();
  
  // Poczekaj na przekierowanie na stronę sukcesu (strona hosta, nie iframe)
  // Tu ramka iframe zniknie (dostawca przekieruje na success URL)
  await expect(page).toHaveURL(/\/checkout\/success/);
  
  // Zweryfikuj komunikat potwierdzający na stronie hosta
  await expect(page.getByRole('heading', { name: 'Dziękujemy za zamówienie!' })).toBeVisible();
});
```

### Kiedy ramka cross-origin może sprawiać problemy w testach

**1. Content Security Policy (CSP):**

Niektóre strony hosta mają nagłówki CSP blokujące osadzanie treści z zewnętrznych domen. Jeśli CSP zabrania `<iframe>` z `frame-src` lub `child-src`, ramka nie załaduje się, a test padnie.

```typescript
test('płatność działa mimo CSP strony', async ({ page }) => {
  // Gdy strona hosta ma restrykcyjne CSP, możesz je obejść w testach:
  await page.goto('https://mojaaplikacja.pl/checkout', {
    // Opcja tylko do testów! Nigdy nie używaj w produkcji!
    // Ta opcja jest przydatna, gdy CSP jest nadmiernie restrykcyjne
    // i blokuje legalne widgety (np. płatności).
    // W produkcji napraw CSP, nie testy.
  });
  // ...reszta testu
});
```

**2. X-Frame-Options i ramki blokujące:**

Serwer może wysyłać nagłówek `X-Frame-Options: DENY` lub `X-Frame-Options: SAMEORIGIN`, który instruuje przeglądarkę, aby nie osadzać strony w iframe. Jest to popularny mechanizm ochrony przed atakami clickjacking.

```typescript
test('strona nie pozwala na osadzenie w ramce', async ({ page }) => {
  // Ten test sprawdza, czy strona ma odpowiednie zabezpieczenia przed clickjackingiem
  const response = await page.request.get('https://strona-bankowa.pl/login');
  
  // Sprawdź nagłówek X-Frame-Options
  const xFrameOptions = response.headers()['x-frame-options'];
  
  // Strona bankowa powinna mieć ten nagłówek ustawiony
  expect(xFrameOptions).toBeDefined();
});
```

**3. Ramki lazy-loaded:**

Niektóre ramki ładują się leniwie — dopiero gdy użytkownik przewinie do miejsca, gdzie iframe jest widoczny, lub gdy zajdzie określone zdarzenie (kliknięcie przycisku "Pokaż metodę płatności").

```typescript
test('widget płatności ładuje się po kliknięciu przycisku', async ({ page }) => {
  await page.goto('https://mojaaplikacja.pl/checkout');
  
  // Ramka iframe jeszcze nie istnieje — jest ukryta/wylogowana
  await expect(page.locator('iframe[name="payment"]')).not.toBeAttached();
  
  // Kliknij przycisk, który inicjuje ładowanie widgetu
  await page.getByRole('button', { name: 'Wybierz metodę płatności' }).click();
  
  // Teraz ramka powinna się pojawić — Playwright automatycznie czeka
  const frame = page.frameLocator('iframe[name="payment"]');
  
  // Zweryfikuj, że ramka wczytała widget
  await expect(frame.getByText('Wybierz kartę')).toBeVisible({ timeout: 15000 });
});
```

---

## Automatyczne oczekiwanie i synchronizacja w ramkach iframe

### Mechanizm auto-waiting w frameLocator

Jedną z największych zalet Playwrighta jest mechanizm auto-waiting, który działa również wewnątrz ramek iframe. Oznacza to, że:

```typescript
const frame = page.frameLocator('#payment-form');

// Playwright automatycznie:
await frame.getByLabel('Numer karty').fill('4242 4242 4242 4242');
// 1. Poczeka, aż iframe będzie dostępny w DOM
// 2. Poczeka, aż element z etykietą "Numer karty" pojawi się w ramce
// 3. Poczeka, aż element będzie "actionable" (widoczny, włączony, nie zasłonięty)
// 4. Dopiero wtedy wykona fill()
```

### Timeouty specyficzne dla ramek

Gdy ramka ładuje się wolno (np. zewnętrzny dostawca płatności ma opóźnienia), możesz potrzebować zwiększyć timeout:

```typescript
// Ustawienie timeoutu dla operacji w ramce
const frame = page.frameLocator('#payment-widget');

// Timeout 30 sekund na wypełnienie pola (domyślnie mniej)
await frame.getByLabel('Numer karty').fill('4242 4242 4242 4242', { timeout: 30000 });

// Globalne ustawienie timeoutu dla wszystkich operacji w ramce
const slowFrame = page.frameLocator('#external-widget').withTimeout(60000);
```

### Oczekiwanie na URL ramki

Gdy ramka ładuje dynamiczną zawartość (np. przekierowanie na kolejną stronę w ramce):

```typescript
test('formularz przekierowuje w ramce na stronę sukcesu', async ({ page }) => {
  await page.goto('https://mojaaplikacja.pl/checkout');
  
  const frame = page.frameLocator('#payment-form');
  
  // Wypełnij formularz i wyślij
  await frame.getByLabel('Card number').fill('4242424242424242');
  await frame.getByRole('button', { name: 'Pay' }).click();
  
  // Poczekaj, aż ramka zmieni URL na stronę sukcesu
  await expect(frame).toHaveURL(/\/success/, { timeout: 30000 });
  
  // Zweryfikuj komunikat w ramce po przekierowaniu
  await expect(frame.getByText('Payment successful')).toBeVisible();
});
```

---

## Praktyczne wzorce testowe dla iframe w projektach komercyjnych

### Wzorzec 1: Testowanie widgetu płatności (Stripe/PayPal)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Widget płatności', () => {
  
  test.beforeEach(async ({ page }) => {
    // Przygotuj koszyk z przedmiotem
    await page.goto('https://mojaaplikacja.pl/cart');
    await page.getByRole('button', { name: 'Dodaj do koszyka' }).first().click();
    await page.getByRole('link', { name: 'Przejdź do kasy' }).click();
  });
  
  test('poprawna płatność kartą przez Stripe', async ({ page }) => {
    // Przejdź do strony płatności
    await page.goto('https://mojaaplikacja.pl/checkout/payment');
    
    // Wybierz metodę płatności kartą (to może być pole radio w głównej aplikacji)
    await page.locator('input[name="paymentMethod"][value="card"]').check();
    
    // POCZEKAJ na pojawienie się iframe z widgetem Stripe
    // Ramka może pojawić się z opóźnieniem po wybraniu metody płatności
    await expect(page.locator('iframe[name^="__privateStripeFrame"]')).toBeAttached({ timeout: 10000 });
    
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]');
    
    // Wypełnij dane karty — test używa karty testowej Stripe
    // Używaj kartek testowych: https://stripe.com/docs/testing
    await stripeFrame.getByLabel(/numer\s*karty/i).fill('4242424242424242');
    await stripeFrame.getByLabel(/data\s*ważności/i).fill('1228');
    await stripeFrame.getByLabel(/cvc/i).fill('123');
    await stripeFrame.getByLabel(/email/i).fill('test@example.pl');
    
    // Złóż zamówienie
    await stripeFrame.getByRole('button', { name: /zapłać|złóż\s*zamówienie/i }).click();
    
    // POCZEKAJ na przekierowanie do strony sukcesu (w domenie głównej)
    await expect(page).toHaveURL(/\/order\/confirmed/, { timeout: 30000 });
    await expect(page.getByText('Twoje zamówienie zostało zrealizowane')).toBeVisible();
  });
  
  test('błędna karta wyświetla komunikat błędu', async ({ page }) => {
    await page.goto('https://mojaaplikacja.pl/checkout/payment');
    await page.locator('input[name="paymentMethod"][value="card"]').check();
    
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]');
    
    // Wypełnij błędną kartą — Symbole '0000' w numerze karty to błąd Stripe
    await stripeFrame.getByLabel(/numer\s*karty/i).fill('0000000000000000');
    await stripeFrame.getByLabel(/data\s*ważności/i).fill('1228');
    await stripeFrame.getByLabel(/cvc/i).fill('123');
    
    await stripeFrame.getByRole('button', { name: /zapłać/i }).click();
    
    // Ramka pozostaje otwarta — komunikat błędu pojawia się w iframe
    await expect(stripeFrame.getByText(/karta\s*została\s*odrzucona/i)).toBeVisible({ timeout: 15000 });
    
    // Strona hosta nadal pozostaje na etapie płatności
    await expect(page).not.toHaveURL(/\/order\/confirmed/);
  });
});
```

### Wzorzec 2: Testowanie chat widgetu (Intercom)

```typescript
test('chat otwiera się po kliknięciu ikony wsparcia', async ({ page }) => {
  await page.goto('https://mojaaplikacja.pl/dashboard');
  
  // Ikona chatu zazwyczaj znajduje się w fixed/sticky div
  const chatButton = page.locator('[data-intercom-target="messenger-button"]');
  
  // Chat nie jest widoczny na starcie
  await expect(page.locator('.intercom-app')).not.toBeVisible();
  
  // Kliknij przycisk chatu
  await chatButton.click();
  
  // Ramka Intercom ładuje się po kliknięciu
  const chatFrame = page.frameLocator('[data-intercom-target="messenger-iframe"]');
  
  // Poczekaj na załadowanie okna chatu
  await expect(chatFrame.getByRole('button', { name: /wiadomość/i })).toBeVisible({ timeout: 15000 });
  
  // Wpisz wiadomość do chatu
  await chatFrame.getByPlaceholder('Napisz wiadomość...').fill('Mam problem z zamówieniem #12345');
  await chatFrame.getByRole('button', { name: 'Wyślij' }).click();
  
  // Zweryfikuj, że wiadomość została wysłana (pojawia się w oknie chatu)
  await expect(chatFrame.getByText('Mam problem z zamówieniem #12345')).toBeVisible();
});
```

### Wzorzec 3: Testowanie dokumentu osadzonego (PDF)

```typescript
test('dokument PDF wyświetla się poprawnie', async ({ page }) => {
  await page.goto('https://mojaaplikacja.pl/documents/contract/123');
  
  // POCZEKAJ na załadowanie ramki z dokumentem
  const pdfFrame = page.frameLocator('#pdf-viewer iframe');
  
  // Narzędzie PDF.js zazwyczaj ma kontrolki widoczne w ramce
  await expect(pdfFrame.getByTitle('Pokaż wszystkie strony')).toBeVisible({ timeout: 20000 });
  
  // Sprawdź, że dokument ma więcej niż jedną stronę
  await pdfFrame.getByTitle('Następna strona').click();
  
  // Numer strony powinien się zmienić
  await expect(pdfFrame.getByText(/strona\s*2/i)).toBeVisible();
  
  // Pobierz przycisk pobierania
  const downloadButton = pdfFrame.getByRole('link', { name: /pobierz|pobierz\s*pdf/i });
  
  // Zweryfikuj, że link prowadzi do pliku PDF
  const href = await downloadButton.getAttribute('href');
  expect(href).toMatch(/\.pdf$/i);
});
```

---

## Debugowanie problemów z iframe w Playwright

### Techniki diagnostyczne

**1. Sprawdzenie, czy iframe istnieje w DOM:**

```typescript
test('diagnostyka — iframe jest obecny w DOM', async ({ page }) => {
  await page.goto('https://mojaaplikacja.pl/checkout');
  
  // Lista wszystkich iframe na stronie
  const iframes = await page.locator('iframe').all();
  console.log(`Znaleziono ${iframes.length} iframe na stronie`);
  
  for (const iframe of iframes) {
    const src = await iframe.getAttribute('src');
    const id = await iframe.getAttribute('id');
    const name = await iframe.getAttribute('name');
    console.log(`  iframe: id=${id}, name=${name}, src=${src}`);
  }
  
  // Sprawdź, czy konkretny iframe istnieje
  const targetIframe = page.locator('iframe[name="payment-gateway"]');
  await expect(targetIframe).toBeAttached();
});
```

**2. Inspekcja żądań sieciowych ramki:**

```typescript
test('debugowanie ładowania iframe', async ({ page }) => {
  // Przechwyć żądania sieciowe
  const frameRequests: string[] = [];
  
  page.on('request', request => {
    if (request.url().includes('stripe')) {
      frameRequests.push(request.url());
    }
  });
  
  await page.goto('https://mojaaplikacja.pl/checkout');
  
  // Poczekaj na załadowanie strony
  await page.waitForLoadState('networkidle');
  
  console.log('Żądania do Stripe:', frameRequests);
  
  // Sprawdź, czy ramka w ogóle wysłała żądanie
  expect(frameRequests.some(url => url.includes('iframe'))).toBeTruthy();
});
```

**3. Analiza stanu ramki przez CDP:**

```typescript
test('sprawdź stan ładowania ramki', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://mojaaplikacja.pl/checkout');
  
  // Pobierz wszystkie ramki z kontekstu przeglądarki
  const allFrames = page.frames();
  console.log('Wszystkie ramki:', allFrames.map(f => ({ url: f.url(), name: f.name() })));
  
  // Znajdź ramkę po nazwie
  const stripeFrame = allFrames.find(f => f.url().includes('stripe.com'));
  if (stripeFrame) {
    console.log('Ramka Stripe URL:', stripeFrame.url());
    console.log('Ramka jest nadal aktywna:', !stripeFrame.isDetached());
  }
});
```

### Typowe problemy i rozwiązania

| Problem | Przyczyna | Rozwiązanie |
|---|---|---|
| `frameLocator` nie znajduje ramki | Ramka jeszcze się nie załadowała | Dodaj `await expect(locator).toBeAttached()` lub `waitForSelector` |
| Test pada na kliknięciu w ramce | Element jest zasłonięty przez overlay | Sprawdź czy ramka ma `z-index` > overlay, użyj `{ force: true }` |
| Ramka cross-origin nie ładuje się | CSP lub X-Frame-Options | Zweryfikuj nagłówki, skontaktuj się z dostawcą |
|rameLocator zwalnia po wielu operacjach | Memory leak (nie zwalniasz referencji) | Używaj lokalnych zmiennych, nieglobalnych referencji do ramek |
|rame zniknęła po akcji | Dostawca przekierował na inny URL | Sprawdź czy oczekujesz przekierowania na właściwy typ strony |
|rame ładuje się asynchronicznie | Lazy loading | Kliknij element inicjujący lub użyj `waitForURL` |

---

## Bezpieczeństwo i ramki iframe

### Content Security Policy (CSP) a testowanie

Nagłówki CSP mogą blokować ładowanie ramek z określonych domen. W środowisku testowym możesz potrzebować:

```typescript
// Konfiguracja dla testów, które wymagają obejścia CSP
// UWAGA: Tylko do celów testowych!
test('test z wyłączonym CSP', async ({ page }) => {
  // W prawdziwej aplikacji napraw CSP, nie omijaj go w testach
  // To narzędzie jest przydatne gdy testujesz na własnych stronach z CSP
  await context.addInitScript(() => {
    // Wyłącz CSP dla testów end-to-end
    // Działa tylko w kontekście przeglądarki uruchomionej przez Playwright
  });
  
  await page.goto('https://mojaaplikacja.pl/checkout');
  // ...reszta testu
});
```

### X-Frame-Options — zabezpieczenie przed clickjackingiem

Serwisy bankowe i platności często wysyłają `X-Frame-Options: DENY`, aby zapobiec osadzeniu w ramce (ochrona przed atakami clickjacking, gdzie atakujący umieszcza złośliwą stronę nad legalnym przyciskiem).

```typescript
test('strona logowania ma zabezpieczenie przed clickjackingiem', async ({ page }) => {
  const response = await page.request.get('https://secure.mojaaplikacja.pl/login');
  
  const frameOptions = response.headers()['x-frame-options'];
  
  // Strona logowania powinna mieć ograniczenie osadzania
  // (albo CSP z odpowiednimi directive'ami)
  expect(frameOptions ?? response.headers()['content-security-policy']).toBeDefined();
});
```

### SameSite cookies w ramkach cross-origin

Ciasteczka z atrybutem `SameSite=Strict` nie są wysyłane w żądaniach z iframe cross-origin. To może powodować problemy z autoryzacją widgetów płatności.

```typescript
test('sesja w ramce płatności jest prawidłowa', async ({ page }) => {
  // Upewnij się, że kontekst ma odpowiednie ciasteczka
  const context = await browser.newContext({
    // W testach warto sprawdzić, czy ciasteczko ma właściwy atrybut SameSite
  });
  
  await page.goto('https://mojaaplikacja.pl/checkout');
  
  const paymentFrame = page.frameLocator('iframe[name="payment"]');
  
  // Jeśli widget wymaga autoryzacji przez ciasteczko, sprawdź czy sesja jest aktywna
  // przez odczytanie widocznego stanu w ramce (np. nazwa użytkownika)
  await expect(paymentFrame.getByText(/zalogowany.*jan/i)).toBeVisible({ timeout: 10000 });
});
```

---

## Dobre praktyki dla testowania iframe

### 1. Unikalne selektory dla ramek

Unikaj identyfikacji ramek przez losowe atrybuty lub indeksy. Szukaj stabilnych identyfikatorów:

```typescript
// ✅ Dobrze — semantyczny atrybut
const frame = page.frameLocator('[data-testid="stripe-payment-frame"]');

// ✅ Dobrze — nazwa z kontraktu dostawcy
const frame = page.frameLocator('iframe[name="stripe-frame"]');

// ✅ Dobrze — stały URL iframe
const frame = page.frameLocator('iframe[src^="https://checkout.stripe.com"]');

// ❌ Źle — indeks może się zmienić przy dodaniu nowych iframe
const frame = page.frameLocator('iframe >> nth=2');
```

### 2. Izolacja testów iframe

Gdy testujesz widget zewnętrzny, zisoluj go od logiki aplikacji hosta:

```typescript
test.describe('Walidacja iframe payment gateway', () => {
  test.beforeEach(async ({ page }) => {
    // Idź bezpośrednio do strony checkout — nie przechodź przez cały flow
    await page.goto('https://mojaaplikacja.pl/checkout/payment');
    
    // Wybierz metodę płatności
    await page.getByRole('radio', { name: 'Karta płatnicza' }).check();
    
    // Poczekaj na załadowanie iframe
    await expect(page.locator('iframe[name="payment"]')).toBeAttached({ timeout: 10000 });
  });
  
  test('pole numeru karty akceptuje tylko cyfry', async ({ page }) => {
    const frame = page.frameLocator('iframe[name="payment"]');
    
    // Próba wstawienia literek — pole powinno je odrzucić
    await frame.getByLabel('Numer karty').fill('abcd1234efgh5678');
    
    // Sprawdź, że wartość pola zawiera tylko cyfry i spacje
    const value = await frame.getByLabel('Numer karty').inputValue();
    expect(value.replace(/\s/g, '')).toMatch(/^\d+$/);
  });
});
```

### 3. Timeouty kontekstowe vs. globalne

Ustawiaj timeouty na poziomie adekwatnym do rzeczywistego czasu ładowania dostawcy:

```typescript
// Timeouty powinny odzwierciedlać realne czasy odpowiedzi dostawcy
// Widget Stripe może ładować się 5-15s na wolnym połączeniu
const paymentFrame = page.frameLocator('iframe[name="stripe"]').withTimeout(30000);

// Lokalne timeouty dla krytycznych interakcji
await frame.getByLabel('Numer karty').fill('4242 4242 4242 4242', { timeout: 10000 });
```

### 4. Weryfikacja URL ramki jako kontrakt z dostawcą

Gdy zależy Ci na stabilności testów mimo zmian u dostawcy:

```typescript
test('ramka płatności należy do wiarygodnego dostawcy', async ({ page }) => {
  await page.goto('https://mojaaplikacja.pl/checkout');
  
  const frame = page.frameLocator('iframe[name="payment-gateway"]');
  
  // Pobierz źródło ramki jako atrybut (nie nawiguj do URL ramki)
  const src = await frame.locator(':root').getAttribute('src');
  
  // Zweryfikuj, że ramka pochodzi od znanego dostawcy
  // To daje early warning, gdy dostawca zmieni subdomenę lub path
  expect(src).toMatch(/https:\/\/checkout\.(stripe|paypal)\.com/);
});
```

---

## Perspektywa Full Stack Testera — iframe jako punkt integracji

Iframe to miejsce, w którym Twoja aplikacja (frontend) łączy się z usługą zewnętrzną (backend trzeciej strony). Jako Full Stack Tester masz unikalną perspektywę — widzisz obie strony tej granicy:

**Frontend (Twoja aplikacja):**
- Czy przycisk "Pokaż metody płatności" działa poprawnie?
- Czy callback po udanej płatności przekierowuje na właściwą stronę?
- Czy wyświetlasz użytkownikowi jasne komunikaty w przypadku błędu iframe?

**Integracja (iframe):**
- Czy Twoja strona przekazuje poprawne parametry (amount, currency, orderId) do ramki?
- Czy callback URL jest poprawnie skonfigurowany?
- Czy sesja użytkownika jest przekazywana do ramki (lub ramka ma własną autoryzację)?

**Backend trzeciej strony:**
- Czy webhook z płatności jest poprawnie odbierany przez Twój serwer?
- Czy identyfikator korelacji pozwala na śledzenie transakcji w logach dostawcy?
- Czy obsługujesz scenariusze błędów (odmowa karty, timeout, fraud detection)?

Umiejętność testowania iframe na wszystkich trzech poziomach odróżnia profesjonalnego Full Stack Testera od kogoś, kto potrafi tylko "kliknąć w iframe". Zrozumienie architektury iframe, izolacji cross-origin i mechanizmów komunikacji pozwala pisać testy, które nie tylko przechodzą w idealnych warunkach, ale także dają wartościowe informacje diagnostyczne, gdy coś pójdzie nie tak w środowisku produkcyjnym.

---

## Podsumowanie

Ramki iframe to fundamentalny element nowoczesnych aplikacji webowych, szczególnie w kontekście integracji z zewnętrznymi dostawcami płatności, wsparcia klienta i usług trzecich stron. Playwright oferuje potężne narzędzia (`frameLocator`, `page.frame()`) do interakcji z ramkami na wszystkich poziomach zagnieżdżenia, w tym ramkami cross-origin. Kluczem do skutecznego testowania iframe jest:

1. **Zrozumienie architektury** — wiedza, czym jest iframe w modelu DOM, jak działa izolacja originów i jakie mechanizmy bezpieczeństwa obowiązują.
2. **Świadomy wybór metody** — `frameLocator()` dla większości scenariuszy, `page.frame()` dla specyficznych operacji wymagających obiektu `Frame`.
3. **Obsługa zagnieżdżenia** — łączenie lokalizatorów ramek dla wielopoziomowych struktur.
4. **Zarządzanie timeoutami** — dostosowanie czasów oczekiwania do realnych warunków ładowania zewnętrznych widgetów.
5. **Diagnostyka problemów** — techniki inspekcji ramek, żądań sieciowych i stanu ładowania.
6. **Rozumienie kontekstu bezpieczeństwa** — CSP, X-Frame-Options, SameSite cookies i ich wpływ na testy.

---

## Linki i źródła

- [Playwright — Frame Locators](https://playwright.dev/docs/frames)
- [Same-Origin Policy — MDN](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)
- [Stripe — Testing with iframe](https://stripe.com/docs/testing)
- [Content Security Policy — MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [X-Frame-Options — OWASP](https://owasp.org/www-community/attacks/Clickjacking)