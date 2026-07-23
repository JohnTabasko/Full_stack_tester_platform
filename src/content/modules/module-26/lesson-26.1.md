# Aplikacje mobilne webowe, natywne i hybrydowe

> Moduł testowania mobilnego przenosi strategię jakości na urządzenia przenośne. Mobile to nie tylko mniejszy ekran. To system operacyjny, uprawnienia, sieć, bateria, klawiatura ekranowa, dziesiątki konfiguracji sprzętowych, sklepy aplikacji i fundamentalnie inne zachowanie użytkownika w ruchu. W tej lekcji poznasz cztery typy aplikacji mobilnych i dobierzesz do każdego z nich właściwą strategię testów, narzędzia i macierz ryzyka.

## Jak czytać ten moduł

Czytaj ten moduł przez pryzmat warunków rzeczywistego użycia. Test mobilny powinien odpowiadać na pytanie, czy użytkownik może wykonać zadanie na urządzeniu, w sieci i z uprawnieniami, które realnie występują. Emulacja jest pomocna, ale nie wyczerpuje tematu. Skup się na tym, co decyduje o sukcesie lub porażce aplikacji mobilnej: stany systemowe, przełączanie kontekstów, zmienność środowiska i zależność od systemu operacyjnego.

Trzy zasady modułu:

1. **Dobierz narzędzie do typu produktu.** Mobile web, PWA, native i hybrid mają różne ryzyka, różne narzędzia i różne strategie testów.
2. **Macierz urządzeń wynika z ryzyka, nie z listy możliwości.** Nie testuj wszystkiego na wszystkim — testuj to, co jest krytyczne dla Twoich użytkowników.
3. **Warunki systemowe są częścią testu.** Uprawnienia, offline, deep linki i powiadomienia to realne ścieżki użytkownika, nie opcjonalne dodatki.

---

## Cel lekcji

Ta lekcja koncentruje się na: **różnice między mobile web, PWA, aplikacją natywną i hybrydową oraz ich konsekwencje dla strategii testów, narzędzi i ryzyk**. Główne ryzyko: **zespół traktuje wszystkie produkty mobilne tak samo i używa niewłaściwego narzędzia albo pomija ryzyka specyficzne dla platformy**. Po lekturze powinieneś umieć zaprojektować strategię testów mobilnych opartą na typie aplikacji, macierzy urządzeń i warunkach systemowych — z konkretnymi narzędziami, testami i artefaktami dla każdego typu.

**Perspektywa Full Stack Testera:** Full stack tester rozumie, że aplikacja mobilna to nie „strona na telefonie" — to system złożony z warstwy prezentacji, logiki klienta, warstwy sieciowej, backendu i głębokiej integracji z systemem operacyjnym. Każda z tych warstw ma swoje ryzyka i wymaga innego podejścia do testowania.

---

## Sytuacja przewodnia

Firma posiada trzy produkty mobilne: responsywny sklep webowy dostępny w przeglądarce, PWA z trybem offline do programu lojalnościowego i aplikację hybrydową do zarządzania zamówieniami. Każdy produkt wymaga innej strategii testów, innej macierzy urządzeń i innych narzędzi. Zespół QA musi podjąć decyzje: czym testować, na czym testować i jakie ryzyka pokryć w pierwszej kolejności.

---

## 1. Cztery typy aplikacji mobilnych — anatomia i ryzyka

Zrozumienie typu aplikacji jest fundamentalne dla strategii testów. Błędna klasyfikacja prowadzi do błędnych decyzji: testowania niewłaściwymi narzędziami, pomijania krytycznych ryzyk lub nadmiernych kosztów tam, gdzie nie są potrzebne.

### 1.1 Mobile Web (Responsive Web Design)

**Definicja:** Aplikacja webowa używana w przeglądarce mobilnej. Ta sama strona, która działa na desktopie, wyświetlana na mniejszym ekranie z adaptowanym układem. Bez instalacji, bez native API.

**Charakterystyka:**
- Działa w przeglądarce (Chrome, Safari, Firefox na iOS/Android)
- Ten sam backend, co wersja desktop
- Responsywny layout (CSS media queries, flexible grid)
- Brak dostępu do native API urządzenia
- Nie wymaga instalacji ze sklepu

**Ryzyka specyficzne dla mobile web:**

| Kategoria ryzyka | Przykład | Konsekwencja |
|---|---|---|
| **Layout responsywny** | Pole na hasło zasłonięte klawiaturą ekranową | Użytkownik nie może się zalogować |
| **Touch targets** | Przycisk 10×10px zbyt mały na dotyk | Fałszywe kliknięcia, frustracja |
| **Performance** | Heavy JS na wolnym procesorze mobilnym | Długi czas ładowania, ANR |
| **Viewport** | Element pozycjonowany poza widocznym obszarem | Ukryte formularze, niewidoczne błędy |
| **User agent** | Backend zwraca różne HTML dla mobile | Niespójne zachowanie między platformami |
| **Orientacja** | Layout landscape obcina pasek nawigacji | Niemożność nawigacji |

**Narzędzia testowe:**
- **Playwright** — mobile viewport, touch emulation, geolocation, network throttling
- **Chrome DevTools Device Mode** — emulacja urządzeń, throttle CPU, Network panel
- **Lighthouse** — performance audit mobile, PWA audit, accessibility
- **Realne urządzenia** — ostateczna weryfikacja krytycznych ścieżek (checkout, logowanie)

**Przykładowa strategia:**

```typescript
// Playwright — mobile web testing z viewport i touch
test('checkout działa na mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
  await page.goto('/checkout');
  
  // Touch-friendly — swipe na carousel
  const carousel = page.locator('.product-carousel');
  await carousel.touch().swipeLeft();
  
  // Klawiatura ekranowa — pole nie jest zasłonięte
  const passwordField = page.getByLabel('Hasło');
  const passwordBox = await passwordField.boundingBox();
  const keyboardHeight = 291; // typowa wysokość iOS keyboard
  
  // Pole powinno być widoczne nad klawiaturą
  expect(passwordBox!.y + passwordBox!.height)
    .toBeLessThan(667 - keyboardHeight);
});

// Geolocation — mobile web z lokalizacją
test('wyszukiwarka punktów odbioru pokazuje lokalne wyniki', async ({ page, context }) => {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 52.2297, longitude: 21.0122 }); // Warszawa
  
  await page.goto('/pickup-points');
  await expect(page.getByText('Warszawa')).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount({ minimum: 3 });
});
```

---

### 1.2 PWA — Progressive Web App

**Definicja:** Aplikacja webowa z rozszerzonymi możliwościami: service worker, cache offline, instalacja na ekranie głównym, push notifications, Background Sync. Działa w przeglądarce, ale zachowuje się jak natywna aplikacja.

**Charakterystyka:**
- Instalowalna na ekranie głównym (bez App Store)
- Tryb offline (service worker cache)
- Push notifications (Web Push API)
- Background Sync (aktualizacja danych po powrocie online)
- Standalone display (bez paska przeglądarki)
- HTTPS wymagany (service worker只能在安全上下文)

**Ryzyka specyficzne dla PWA:**

| Kategoria ryzyka | Przykład | Konsekwencja |
|---|---|---|
| **Service worker cache** | Stary JS/HTML cached mimo aktualizacji | Użytkownik widzi zepsuty UI |
| **Offline mode** | Formularz wysłany bez sieci, nie zapisany | Utrata danych |
| **Update strategy** | Aktualizacja service worker wymaga restartu | Użytkownik nie widzi nowej wersji |
| **Background Sync** | Dane zsynchronizowane w złej kolejności | Niespójność danych |
| **Install prompt** | Prompt instalacji nigdy nie pokazany | Utrata engagement |
| **Push permissions** | Użytkownik blokuje powiadomienia | Brak re-engagement |

**Narzędzia testowe:**
- **Playwright** — service worker intercept, offline simulation, install prompt
- **Chrome DevTools Application tab** — Service Workers, Cache Storage, Background Sync
- **Lighthouse PWA audit** — manifest, service worker coverage, offline score
- **Workbox** — library do service worker, testowanie cache strategies
- **Realne urządzenia** — instalacja, deinstalacja, update na prawdziwym telefonie

**Przykładowa strategia:**

```typescript
// Playwright — testowanie PWA offline mode
test('PWA zapisuje dane offline i synchronizuje po powrocie online', async ({ page, context }) => {
  // Symuluj offline przed interakcją
  await context.setOffline(true);
  
  await page.goto('/order-form');
  await page.getByLabel('Nazwa produktu').fill('Laptop Pro 15');
  await page.getByRole('button', { name: 'Zapisz lokalnie' }).click();
  
  // Aplikacja informuje o zapisie offline
  await expect(page.getByRole('status')).toContainText('Zapisano lokalnie');
  
  // Symuluj powrót online
  await context.setOffline(false);
  
  // Poczekaj na synchronizację (Background Sync)
  await page.waitForFunction(() => {
    const status = document.querySelector('[data-sync-status]');
    return status?.textContent === 'Zsynchronizowano';
  }, { timeout: 10_000 });
  
  // Zweryfikuj przez API
  const response = await page.request.get('/api/orders');
  const orders = await response.json();
  expect(orders).toContainEqual(expect.objectContaining({ name: 'Laptop Pro 15' }));
});

// Testowanie cache busting — czy aktualizacja jest widoczna?
test('po aktualizacji service worker użytkownik widzi nową wersję', async ({ page, context }) => {
  // Zarejestruj service worker z wersją cache
  const swFile = './sw-v1.js';
  await context.addInitScript((scriptPath) => {
    navigator.serviceWorker.register(scriptPath);
  }, swFile);
  
  // Symuluj deploy nowej wersji
  await context.addInitScript(() => {
    navigator.serviceWorker.register('./sw-v2.js');
  });
  
  // Accept update prompt
  await page.evaluate(() => {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      location.reload();
    });
  });
  
  await page.reload();
  await expect(page).toHaveTitle(/Nowa wersja/);
});
```

---

### 1.3 Aplikacje natywne (Native Apps)

**Definicja:** Aplikacja napisana w natywnym języku platformy (Swift/Kotlin), skompilowana do kodu maszynowego, zainstalowana przez App Store/Google Play, z pełnym dostępem do API systemu operacyjnego.

**Charakterystyka:**
- Napisana w Swift (iOS) lub Kotlin/Java (Android)
- Skompilowana do natywnego kodu
- Instalowana z App Store / Google Play
- Pełny dostęp do API systemu: kamera, GPS, Bluetooth, kontakty, push
- Dystrybuowana przez sklep z weryfikacją bezpieczeństwa
- Aktualizacje przez sklep

**Ryzyka specyficzne dla native apps:**

| Kategoria ryzyka | Przykład | Konsekwencja |
|---|---|---|
| **Upgrade bazy danych** | Schema migration po aktualizacji | Crash na starcie |
| **Uprawnienia systemowe** | Aplikacja crashuje przy odmowie kamery | Breakage na poziomie OS |
| **Różnice między wersjami OS** | API działa na iOS 17, nie na iOS 15 | Fragmentacja |
| **App Store review** | Funkcja odrzucona przez Apple review | Opóźnienie release'u |
| **Push notifications** | Token nie odświeżony po reinstalacji | Utracone powiadomienia |
| **Background execution** | Zadanie background killed przez OS | Niedokończona operacja |
| **Device fragmentation** | Różne GPU, CPU, pamięć na różnych modelach | Performance regression |

**Narzędzia testowe:**
- **Appium** — WebDriver-based automation dla iOS i Android
- **XCUITest** (iOS) — native framework Apple do UI testing
- **Espresso** (Android) — native framework Google do UI testing
- **Detox** — React Native specific testing
- **Firebase Test Lab** — device farm Google
- **BrowserStack / Sauce Labs** — cross-device farm testing

**Przykładowa strategia:**

```typescript
// Appium — testowanie aplikacji natywnej (pseudokod)
import { remote } from 'webdriverio';

const ANDROID_CAPABILITIES = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'Pixel_7_API_34',
  'appium:app': '/path/to/app.apk',
  'appium:platformVersion': '14',
  'appium:autoGrantPermissions': false, // testuj odmowę!
  'appium:noReset': false, // clean state
};

test('użytkownik może zalogować się w aplikacji natywnej', async () => {
  const driver = await remote({
    hostname: 'localhost',
    port: 4723,
    capabilities: ANDROID_CAPABILITIES,
  });

  // Accessibility ID — najstabilniejszy lokator na Android
  const emailField = await driver.$('~email-input');
  await emailField.setValue('jan@example.test');

  const passwordField = await driver.$('~password-input');
  await passwordField.setValue('SecurePass123!');

  const loginButton = await driver.$('~login-button');
  await loginButton.click();

  // Oczekuj na przejście do głównego ekranu
  await driver.waitUntil(async () => {
    const currentActivity = await driver.getCurrentActivity();
    return currentActivity.includes('.MainActivity');
  }, { timeout: 10_000 });

  // Verify success element
  const welcomeText = await driver.$('~welcome-message');
  await expect(welcomeText).toBeDisplayed();

  await driver.deleteSession();
});
```

---

### 1.4 Aplikacje hybrydowe (Hybrid Apps)

**Definicja:** Aplikacja z natywną powłoką (shell), która wyświetla treść webową (WebView). Łączy dostęp do native API z elastycznością webową. Frameworki: React Native, Flutter, Cordova, Ionic.

**Charakterystyka:**
- Natywny shell z WebView (renderuje HTML/JS wewnątrz natywnej ramki)
- Może przełączać konteksty między natywnym UI a webview
- Dostęp do native API przez bridge (JavaScript ↔ native)
- Szybszy development niż pure native
- Cross-platform (jeden kod na iOS i Android — teoretycznie)

**Ryzyka specyficzne dla hybrid apps:**

| Kategoria ryzyka | Przykład | Konsekwencja |
|---|---|---|
| **Konteksty (context switching)** | Element w webview vs. natywny dialog | Zły kontekst = element nie znaleziony |
| **Bridge API** | Komunikacja JS↔Native zawodzi na konkretnej wersji OS | Breakage |
| **WebView version** | Starszy WebView renderer = CSS/JS nie działa | Inconsistent rendering |
| **Hybrid navigation** | Back button działa różnie na iOS vs. Android | Niemożność nawigacji |
| **Hybrid keyboard** | Klawiatura ekranowa zachowuje się inaczej w WebView | Formularze nie działają |

**Narzędzia testowe:**
- **Appium** z `chromedriverExecutableDir` — automatyzuje WebView i native context
- **Playwright** z trybem mobile web — jeśli WebView zachowuje się jak przeglądarka
- **Chrome DevTools Remote Debugging** — inspect WebView content
- **Realne urządzenia** — konteksty WebView zachowują się inaczej na różnych urządzeniach

**Przykładowa strategia:**

```typescript
// Appium — przełączanie kontekstów w aplikacji hybrydowej
import { remote } from 'webdriverio';

test('aplikacja hybrydowa — natywny dialog logowania, webview panel klienta', async () => {
  const driver = await remote({
    hostname: 'localhost',
    port: 4723,
    capabilities: {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': 'Pixel_7_API_34',
      'appium:app': '/path/to/hybrid-app.apk',
    },
  });

  // Kontekst NATYWNY — ekran logowania jest natywny
  const nativeContext = await driver.getContext();
  console.log('Current contexts:', await driver.getContexts());
  
  // Lokatory natywne (accessibility id)
  await driver.$('~email-input').setValue('jan@example.test');
  await driver.$('~password-input').setValue('SecurePass123!');
  await driver.$('~login-submit').click();

  // Poczekaj na załadowanie WebView
  await driver.waitUntil(async () => {
    const contexts = await driver.getContexts();
    return contexts.some(c => c.id.includes('WEBVIEW'));
  }, { timeout: 15_000 });

  // Przełącz na KONTEKST WEBVIEW
  const webviewContext = (await driver.getContexts())
    .find(c => c.id.startsWith('WEBVIEW'));
  await driver.switchContext(webviewContext.id);

  // Teraz można używać selektorów webowych
  const customerPanel = await driver.$('h1.customer-name');
  await expect(customerPanel).toContainText('Jan');

  // Wróć do natywnego kontekstu
  await driver.switchContext(nativeContext.id);

  // Natywny element — na przykład natywny pasek boczny
  const sideMenuButton = await driver.$('~menu-toggle');
  await sideMenuButton.click();

  await driver.deleteSession();
});
```

---

## 2. Macierz urządzeń — jak wybrać, co testować

Macierz urządzeń nie jest listą wszystkich możliwych modeli — jest kompromisem między pokryciem a kosztem. Każde urządzenie w macierzy musi być uzasadnione ryzykiem i danymi o użytkownikach.

### 2.1 Zasady budowania macierzy

**Zasada Pareto:** 20% urządzeń pokrywa 80% Twoich użytkowników. Skup się na tym, co realnie tworzy ruch.

**Źródła danych do budowania macierzy:**

```markdown
1. Analytics (Google Analytics, Mixpanel, Amplitude)
   - Top 10 modeli urządzeń (% sesji)
   - Wersje OS (% użytkowników)
   - Rozdzielczości ekranów
   - Procent mobile vs. desktop

2. App Store / Google Play Console
   - Statystyki urządzeń z Installed Base
   - Device catalog z coverage

3. Support tickets i crash reports
   - Które urządzenia generują najwięcej problemów?

4. Beta testers
   - Feedback od użytkowników z różnych urządzeń

5. Konkurencja
   - Na jakich urządzeniach konkurenci testują?
```

### 2.2 Macierz trójwarstwowa (pull request / nightly / release)

Nie każdy test musi być uruchomiony na każdym urządzeniu. Macierz dzieli testy na trzy warstwy:

| Warstwa | Cel | Urządzenia | Testy | Kiedy |
|---|---|---|---|---|
| **PR / commit** | Szybki feedback | 1 emulator Android + 1 emulowany iPhone | Smoke: logowanie, główny przepływ | Na każdym PR |
| **Nightly** | Szersze pokrycie | 2-3 realne urządzenia (top models) | Critical path + uprawnienia | Każda noc |
| **Release** | Kompletność | Pełna macierz (5-8 urządzeń) | Wszystkie krytyczne ścieżki | Przed wydaniem |

### 2.3 Przykładowa macierz dla sklepu e-commerce

```markdown
## Macierz urządzeń — sklep e-commerce (mobile web + PWA + app hybrydowa)

### Warstwa 1: PR / Pull Request (szybki feedback)
| Urządzenie | OS | Typ | Uzasadnienie |
|---|---|---|---|
| Pixel 7 emulator | Android 14 | Emulator | Szybki smoke Android, CI-friendly |
| iPhone 14 simulator | iOS 17 | Emulator | Szybki smoke iOS, CI-friendly |
| Moto G Power (opcjonalnie) | Android 13 | Real device | Low-end Android — performance smoke |

### Warstwa 2: Nightly (regular coverage)
| Urządzenie | OS | Typ | Uzasadnienie |
|---|---|---|---|
| Pixel 7 real | Android 14 | Real | Top Android model w Polsce |
| iPhone 14 real | iOS 17 | Real | Top iOS model w Polsce |
| Samsung Galaxy A54 | Android 14 | Real | Średnia półka — różnorodność GPU |
| iPhone 12 | iOS 16 | Real | Representative older iOS |

### Warstwa 3: Release (full matrix)
| Urządzenie | OS | Typ | Uzasadnienie |
|---|---|---|---|
| Wszystkie z nightly | | | |
| Samsung Galaxy S23 Ultra | Android 14 | Real | Flagowiec — high-end GPU |
| Xiaomi Redmi Note 12 | Android 13 | Real | Low-end — slow CPU, little RAM |
| iPad Air (tablet) | iPadOS 17 | Real | Tablet viewport, landscape/portrait |
| Huawei P30 (bez GMS) | Android 10 | Real | Edge case — brak Google Services |

## Kryteria wyboru urządzenia do macierzy

| Kryterium | Co sprawdzić |
|---|---|
| **Segment użytkowników** | Czy > 5% sesji pochodzi z tego urządzenia? |
| **Różnorodność OS** | Czy pokrywamy poprzednią wersję OS (min. 2 wersje wstecz)? |
| **Różnorodność sprzętowa** | Czy mamy low-end, mid-range i high-end? |
| **Nowości** | Czy nowe urządzenia top sprzedawców są uwzględnione? |
| **Problemy historyczne** | Czy urządzenie z support tickets jest w macierzy? |
```

---

## 3. Strategia testów według typu aplikacji

Dla każdego typu aplikacji mobilnej istnieje optymalna kombinacja narzędzi, poziomów testów i artefaktów. Poniższa tabela podsumowuje decyzje strategiczne.

### Tabela decyzyjna

| Kryterium | Mobile Web | PWA | Native | Hybrid |
|---|---|---|---|---|
| **Narzędzie główne** | Playwright | Playwright + Lighthouse | Appium / XCUITest / Espresso | Appium |
| **Emulator vs. real** | Głównie emulatory + 1 real | Emulatory + real smoke | Real devices (kluczowe) | Real devices |
| **Offline testing** | Network throttling | Wymagane (service worker) | Wymagane | Wymagane |
| **Uprawnienia** | Browser permissions | Notification permission | Full OS permissions | Native + WebView permissions |
| **Performance** | Lighthouse mobile | Lighthouse + real device | Profiler (Instruments/Xcode) | Profiler + Chrome DevTools |
| **CI compatibility** | Wysokie | Wysokie | Średnie (device farm) | Średnie (device farm) |
| **Koszt** | Niski | Niski | Wysoki (device farm) | Wysoki (device farm) |
| **Najwyższe ryzyko** | Layout, touch targets | Cache invalidation, sync | OS fragmentation, permissions | Context switching, bridge API |

### Strategia dla mobile web / PWA (Playwright-first)

```typescript
// playwright.config.ts — mobile web / PWA configuration
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/mobile',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: 'https://shop.example.com',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // Emulatory — PR / szybki feedback
    {
      name: 'mobile-chrome-android',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 412, height: 915 },
      },
    },
    {
      name: 'mobile-safari-iphone',
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 390, height: 844 },
      },
    },
    // Real devices — nightly / release smoke
    {
      name: 'real-android-nightly',
      use: {
        browserName: 'chromium',
        viewport: { width: 412, height: 915 },
        // URL do BrowserStack lub Sauce Labs
      },
    },
    // Tablet
    {
      name: 'tablet-ipad',
      use: {
        ...devices['iPad (gen 7)'],
        viewport: { width: 810, height: 1080 },
      },
    },
  ],
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/mobile-results.xml' }],
  ],
});
```

### Strategia dla native / hybrid apps (Appium-first)

```typescript
// appium.config.ts — konfiguracja Appium z macierzą urządzeń
import { remote } from 'webdriverio';

type DeviceConfig = {
  platformName: 'Android' | 'iOS';
  deviceName: string;
  platformVersion: string;
  automationName: 'UiAutomator2' | 'XCUITest';
  appPath: string;
  autoGrantPermissions: boolean;
};

const DEVICE_MATRIX: Record<string, DeviceConfig> = {
  'pixel7-android14': {
    platformName: 'Android',
    deviceName: 'Pixel 7',
    platformVersion: '14',
    automationName: 'UiAutomator2',
    appPath: './apps/shop-android.apk',
    autoGrantPermissions: false, // testuj odmowę!
  },
  'iphone14-ios17': {
    platformName: 'iOS',
    deviceName: 'iPhone 14',
    platformVersion: '17',
    automationName: 'XCUITest',
    appPath: './apps/shop-ios.ipa',
    autoGrantPermissions: false,
  },
  'galaxy-a54-android14': {
    platformName: 'Android',
    deviceName: 'Samsung Galaxy A54',
    platformVersion: '14',
    automationName: 'UiAutomator2',
    appPath: './apps/shop-android.apk',
    autoGrantPermissions: false,
  },
};

export async function createDriver(deviceKey: string) {
  const config = DEVICE_MATRIX[deviceKey];
  return remote({
    hostname: 'localhost',
    port: 4723,
    capabilities: {
      'appium:deviceName': config.deviceName,
      'appium:platformVersion': config.platformVersion,
      'appium:automationName': config.automationName,
      'appium:app': config.appPath,
      'appium:autoGrantPermissions': config.autoGrantPermissions,
      'appium:noReset': false,
      'appium:newCommandTimeout': 30000,
    },
  });
}
```

---

## 4. Warunki systemowe — stan urządzenia jako zmienna testowa

W aplikacjach mobilnych stan urządzenia jest częścią testu, nie tłem. Oto zmienne, które musisz kontrolować:

### 4.1 Stan uprawnień

Uprawnienia to nie tylko happy path. Użytkownik może odmówić, a potem zmienić zdanie w ustawieniach. Aplikacja musi obsłużyć każdy stan.

```typescript
// Playwright — testowanie uprawnień w mobile web / PWA
test('aplikacja obsługuje odmowę uprawnień geolokalizacji', async ({ page, context }) => {
  // Symuluj odmowę — nie używaj grantPermissions
  const contextWithoutGeo = await browser.newContext({
    permissions: [], // bez geolokalizacji
    geolocation: undefined,
  });

  const page2 = await contextWithoutGeo.newPage();
  await page2.goto('/pickup-points');

  // Aplikacja pokazuje prośbę o uprawnienia lub informuje o braku dostępu
  const geoPrompt = page2.getByRole('dialog').or(page2.getByText('Włącz lokalizację'));
  
  if (await geoPrompt.isVisible()) {
    // Użytkownik klika "Odmów"
    await page2.getByRole('button', { name: 'Odmów' }).click();
  }

  // Po odmowie — aplikacja nie crashuje, pokazuje alternative
  await expect(page2.getByText('Wprowadź adres ręcznie')).toBeVisible();

  await contextWithoutGeo.close();
});

// Appium — uprawnienia natywne
test('aplikacja obsługuje odmowę kamery na Android', async () => {
  const driver = await remote({ /* ... */ });

  // Najpierw uruchom aplikację bez autoGrantPermissions
  await driver.launchApp();

  // Próba użycia kamery w aplikacji
  const cameraButton = await driver.$('~open-camera');
  await cameraButton.click();

  // System wyświetla prompt —Appium automatycznie odpowie "Deny"
  // Alternatywnie: ustaw autoDenyPermissions
    
  // Sprawdź, czy aplikacja pokazuje informację o braku uprawnień
  const permissionDeniedMessage = await driver.$('~camera-permission-denied');
  await expect(permissionDeniedMessage).toBeDisplayed();

  // Sprawdź, czy przycisk do ustawień jest dostępny
  const openSettingsButton = await driver.$('~open-app-settings');
  await expect(openSettingsButton).toBeDisplayed();
});
```

### 4.2 Stan sieci

```typescript
// Playwright — symulacja warunków sieciowych
test.describe('Network conditions', () => {
  test('checkout działa w słabej sieci (3G)', async ({ page, context }) => {
    // Throttle do 3G
    await context.setExtraHTTPHeaders({});
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 100 * 1024 / 8, // 100 KB/s
      uploadThroughput: 50 * 1024 / 8,
      latency: 400, // 400ms RTT
    });

    await page.goto('/checkout');
    await page.getByLabel('Numer karty').fill('4111111111111111');
    
    // Przycisk nie powinien timeoutować — timeout jest dostosowany
    await expect(page.getByRole('button', { name: 'Zapłać' })).toBeEnabled({ timeout: 30_000 });
  });

  test('aplikacja pokazuje offline state przy utracie sieci', async ({ page, context }) => {
    await page.goto('/dashboard');
    
    // Symuluj utratę sieci w trakcie sesji
    await context.setOffline(true);
    
    // Sprawdź, czy aplikacja informuje użytkownika
    const offlineBanner = page.getByRole('alert').or(page.getByText('Brak połączenia'));
    await expect(offlineBanner).toBeVisible({ timeout: 5_000 });
    
    // Sprawdź, czy formularz można wypełnić offline (PWA)
    const formField = page.getByLabel('Notatka');
    await formField.fill('Test offline');
    await expect(page.getByRole('status').or(page.getByText('Zapisano'))).toBeVisible();
    
    await context.setOffline(false);
  });
});
```

### 4.3 Orientacja i gesty

```typescript
// Playwright — zmiana orientacji
test('formularz jest użyteczny w trybie landscape', async ({ page, context }) => {
  // Start portrait
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/profile/edit');
  
  // Rotate to landscape
  await page.setViewportSize({ width: 844, height: 390 });
  
  // Sprawdź, czy formularz nie jest obcięty
  const saveButton = page.getByRole('button', { name: 'Zapisz zmiany' });
  await expect(saveButton).toBeVisible();
  
  // Rotate back
  await page.setViewportSize({ width: 390, height: 844 });
});

// Appium — gesty touch
test('użytkownik może przewijać listę produktów gestem swipe', async () => {
  const driver = await remote({ /* ... */ });

  // Znajdź element listy
  const productList = await driver.$('~product-list');
  const listBox = await productList.getLocation();

  // Wykonaj swipe up (scroll down)
  await driver.touchPerform([
    { action: 'press', options: { x: listBox.x + 100, y: listBox.y + listBox.height - 50 } },
    { action: 'moveTo', options: { x: listBox.x + 100, y: listBox.y + 50 } },
    { action: 'release', options: {} },
  ]);

  // Sprawdź, czy widoczny jest nowy element
  const nextProduct = await driver.$('~product-item-10');
  await expect(nextProduct).toBeDisplayed();
});

// Long press gesture
test('użytkownik może usunąć produkt przez long press', async () => {
  const driver = await remote({ /* ... */ });

  const product = await driver.$('~product-item-1');
  const productBox = await product.getLocation();

  // Long press (1000ms)
  await driver.touchPerform([
    { action: 'press', options: { x: productBox.x + 50, y: productBox.y + 50 } },
  ]);
  await driver.pause(1000); // 1s hold
  await driver.touchPerform([{ action: 'release', options: {} }]);

  // Menu kontekstowe powinno się pojawić
  const deleteOption = await driver.$('~delete-product');
  await expect(deleteOption).toBeDisplayed();
  await deleteOption.click();
});
```

---

## 5. Przykład referencyjny — macierz strategii mobilnej

```markdown
# Macierz strategii mobilnej — Firma XYZ

## Produkty mobilne firmy

| Produkt | Typ | Stack | Narzędzie testowe | Priorytet |
|---|---|---|---|---|
| Sklep internetowy (responsive) | Mobile Web | React, Tailwind | Playwright | Wysoki |
| Program lojalnościowy | PWA | Vue, Workbox | Playwright + Lighthouse | Średni |
| App zarządzania zamówieniami | Hybryda | React Native | Appium | Wysoki |

## Macierz urządzeń — Pull Request (szybki feedback)

| Urządzenie | OS | Typ | Pokrywa |
|---|---|---|---|
| Pixel 7 emulator | Android 14 | Emulator | Mobile web + PWA |
| iPhone 14 simulator | iOS 17 | Emulator | Mobile web + PWA |
| Pixel 7 real | Android 14 | Real | App hybrydowa smoke |

## Macierz urządzeń — Nightly (regular coverage)

| Urządzenie | OS | Typ | Pokrywa |
|---|---|---|---|
| Pixel 7 real | Android 14 | Real | App hybrydowa |
| iPhone 14 real | iOS 17 | Real | App hybrydowa |
| Samsung Galaxy A54 | Android 13 | Real | App hybrydowa |
| iPhone 12 | iOS 16 | Real | App hybrydowa |

## Macierz urządzeń — Release (completeness)

| Urządzenie | OS | Typ | Pokrywa |
|---|---|---|---|
| Wszystkie z nightly | | | |
| Xiaomi Redmi 12 | Android 13 | Real | Low-end Android |
| Samsung Galaxy S23 | Android 14 | Real | High-end |
| iPad Air | iPadOS 17 | Real | Tablet |

## Ryzyka specyficzne dla produktów

### Sklep internetowy (Mobile Web)
- **Krytyczne:** checkout na mobile (keyboard zasłania CVC), touch targets na małych ekranach, performance na slow CPU
- **Narzędzia:** Playwright (viewport 375-428px), Lighthouse mobile audit

### Program lojalnościowy (PWA)
- **Krytyczne:** offline mode (stempel czasowy zapisywany offline), service worker update, notification opt-in
- **Narzędzia:** Playwright (offline simulation), Chrome DevTools Application tab, Lighthouse PWA score

### App zarządzania zamówieniami (Hybryda)
- **Krytyczne:** kontekst switching WebView↔Native, push notifications, deep links z e-maili
- **Narzędzia:** Appium z context switching, BrowserStack dla real devices, logcat/syslog

## CI Pipeline mobile

```yaml
# .github/workflows/mobile-tests.yml
name: Mobile Tests

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  mobile-web-pr:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:mobile-web:smoke
        env:
          BASE_URL: ${{ vars.STAGING_URL }}

  app-hybrid-nightly:
    runs-on: ubuntu-latest
    if: github.event_name == 'schedule' # nightly only
    steps:
      - uses: actions/checkout@v4
      - name: Start Appium server
        run: docker run -d -p 4723:4723 appium/appium
      - name: Run Appium tests on BrowserStack
        run: npm run test:app:smoke -- --device=browserstack
        env:
          BROWSERSTACK_USER: ${{ secrets.BS_USER }}
          BROWSERSTACK_KEY: ${{ secrets.BS_KEY }}
```

---

## Perspektywa Full Stack Testera

Testowanie mobilne wymaga od testera pełnego zrozumienia, że aplikacja mobilna to nie „desktop na małym ekranie". To zupełnie inny produkt z innymi ryzykami, narzędziami i metrykami sukcesu. Full stack tester, który rozumie różnice między mobile web, PWA, native i hybrid, potrafi dobrać strategię do produktu, a nie odwrotnie — nie będzie próbował testować natywnej aplikacji Playwrightem ani wymagać od mobile web pełnej macierzy urządzeń Appium. Ta elastyczność i świadomość narzędzi to cecha dojrzałego testera.

---

## Podsumowanie

- **Cztery typy aplikacji:** Mobile Web, PWA, Native, Hybrid — każdy ma inne ryzyka, narzędzia i strategie
- **Playwright** sprawdza się dla Mobile Web i PWA — viewport emulation, geolocation, offline, Lighthouse
- **Appium** jest standardem dla Native i Hybrid — kontekst switching, native locators, gesture support
- **Macierz urządzeń** buduj z danych analytics, nie z listy wszystkich możliwości — trójwarstwowa (PR/nightly/release)
- **Warunki systemowe** są częścią testu: uprawnienia, sieć, orientacja, gesty — kontroluj je jawnie
- **Strategia = typ produktu + ryzyko + narzędzie + macierz urządzeń + CI pipeline** — nie jedno bez drugiego

---

## Linki i źródła

- [Playwright — Device Descriptors](https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/deviceDescriptors.ts) — gotowe definicje urządzeń mobilnych
- [Playwright — Geolocation](https://playwright.dev/docs/api/class-browsercontext#browser-context-set-geolocation) — emulacja geolokalizacji w testach
- [Appium — Platform-Specific Drivers](https://appium.io/docs/en/latest/intro/drivers/) — UiAutomator2, XCUITest, Espresso drivers
- [Lighthouse — PWA Audit](https://developer.chrome.com/docs/lighthouse/pwa/) — audyt PWA: installability, offline, performance
- [BrowserStack — App Automate](https://www.browserstack.com/docs/app-automate) — device farm dla testów natywnych i hybrydowych
- [Progressive Web App — Google Web Fundamentals](https://developers.google.com/web/updates/2015/12/getting-started-pwa) — deep dive w service workers i PWA patterns
- [Mobile Testing Strategy — Ministry of Testing](https://www.ministryoftesting.com/) — ramy strategii testów mobilnych

## 📘 Suplement Inżynieryjny 2026: Testowanie Mobilne (Appium 2)
*Inspiracja: „Scalable Test Automation with Playwright” (2026), Chapter 6*
*   **Appium 2 Driver Lifecycle**: Przy automatyzacji aplikacji natywnych za pomocą Appium 2, dbaj o efektywne zarządzanie cyklem życia sterowników oraz zbieranie artefaktów (zrzuty pamięci, logi systemowe ADB/Xcode) bezpośrednio do rurociągu testowego.
