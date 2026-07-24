# Testowanie Mobilnych Doświadczeń i Emulacja Urządzeń

Współczesny ruch internetowy jest zdominowany przez urządzenia mobilne (smartfony, tablety). Z tego powodu, rzetelne testy regresji muszą weryfikować poprawność układu responsywnego (RWD – Responsive Web Design), działanie gestów dotykowych (touch gestures) oraz zachowanie aplikacji w trudnych warunkach mobilnych (np. przy słabym zasięgu komórkowym).

Playwright Test posiada natywne, potężne wsparcie dla **emulacji urządzeń mobilnych**. W tej lekcji nauczysz się konfigurować i pisać testy dedykowane dla środowisk mobilnych.

---

## 1. Wykorzystanie wbudowanych deskryptorów urządzeń (Devices Matrix)

Playwright posiada bazę gotowych deskryptorów najpopularniejszych smartfonów (np. iPhone, Samsung Galaxy, Pixel), zawierających precyzyjne ustawienia szerokości ekranu (viewport), gęstości pikseli (`deviceScaleFactor`), wsparcia dla dotyku oraz nagłówków identyfikacyjnych (`userAgent`).

Możemy je w łatwy sposób podpiąć w pliku `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    // Projekt testów dla komputerów biurkowych
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    // Projekt testów dla smartfona iPhone 14
    {
      name: 'mobile-iphone',
      use: {
        ...devices['iPhone 14'],
        // Możesz dodatkowo emulować mobilne połączenie sieciowe 3G/4G
        offline: false,
      },
    },
  ],
});
```

---

## 2. Emulacja geolokalizacji, języka i strefy czasowej

Aplikacje często dostosowują treść na podstawie położenia użytkownika. Playwright pozwala zasymulować dowolne współrzędne geograficzne oraz strefę czasową:

```typescript
test.use({
  geolocation: { latitude: 52.2297, longitude: 21.0122 }, // Współrzędne Warszawy
  permissions: ['geolocation'], // Automatycznie zatwierdź uprawnienia systemowe
  locale: 'pl-PL',
  timezoneId: 'Europe/Warsaw',
});

test('weryfikacja lokalnego cennika dostawy', async ({ page }) => {
  await page.goto('/shipping-rates');
  await expect(page.getByText('Darmowa dostawa na terenie Warszawy!')).toBeVisible();
});
```

---

## 3. Symulowanie gestów dotykowych (Touch & Tap Gestures)

Na urządzeniach mobilnych użytkownicy nie klikają myszą – wywołują dotyk. Playwright potrafi w 100% poprawnie emulować gesty dotykowe:

```typescript
test('obsługa mobilnego menu rozsuwanego (Swipe)', async ({ page }) => {
  await page.goto('/');

  // Wywołanie tapnięcia (Tap) zamiast kliknięcia myszą
  await page.getByRole('button', { name: 'Otwórz menu' }).tap();

  await expect(page.locator('.mobile-sidebar')).toBeVisible();
});
```

---

## 4. Checklista Testowania Mobilnego
- [ ] Czy zadeklarowałeś projekty mobilne (np. `iPhone 14`, `Pixel 7`) w pliku konfiguracyjnym?
- [ ] Czy do interakcji na emulowanych urządzeniach stosujesz metodę `.tap()` zamiast `.click()`?
- [ ] Czy testujesz zachowanie aplikacji przy dynamicznych zmianach orientacji ekranu (`isMobile`, `viewport`)?
- [ ] Czy wdrożyłeś bezpieczne uprawnienia systemowe (np. `permissions: ['geolocation']`) w emulowanych kontekstach?