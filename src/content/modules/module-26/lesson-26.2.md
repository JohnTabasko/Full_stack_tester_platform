# Podstawy Appium

> Appium to standard przemysłowy do automatyzacji testów aplikacji natywnych i hybrydowych. Działa na zasadzie klient-serwer: test wysyła polecenia WebDriver do serwera Appium, który komunikuje się z driverem platformy (UiAutomator2 dla Androida, XCUITest dla iOS). W tej lekcji poznasz architekturę Appium, nauczysz się konfigurować capabilities, pisać stabilne lokatory, wykonywać gesty i zarządzać kontekstami w aplikacjach hybrydowych.

## Jak czytać ten moduł

Czytaj tę lekcję z aktywnym podejściem — po przeczytaniu każdej sekcji spróbuj napisać odpowiedni fragment kodu samodzielnie, zanim spojrzysz na przykład. Appium jest narzędziem, które wymaga praktyki: konfiguracja capabilities, przełączanie kontekstów i nawigacja po natywnych elementach różnią się od tego, co znasz z Playwright. Zrozumienie architektury pozwoli Ci debugować problemy, które napotkasz w codziennej pracy.

Trzy zasady lekcji:

1. **Capabilities są fundamentem.** Błędna konfiguracja capabilities to najczęstsza przyczyna problemów z Appium. Naucz się je czytać i rozumieć.
2. **Lokatory accessibility id są najstabilniejsze.** Unikaj XPath tam, gdzie to możliwe — są wolniejsze i bardziej kruche na mobile.
3. **Konteksty to specyfika hybryd.** Jeśli testujesz aplikację hybrydową, przełączanie kontekstów musi być częścią Twojego workflow.

---

## Cel lekcji

Ta lekcja koncentruje się na: **architektura Appium, capabilities, lokatory, gesty, oczekiwania i stabilność testów aplikacji natywnych i hybrydowych**. Główne ryzyko: **testy mobilne są kruche, bo używają przypadkowych lokatorów, źle ustawionych capabilities i nie rozumieją różnicy między kontekstem natywnym a webview**. Po lekturze powinieneś umieć skonfigurować sesję Appium, napisać stabilne testy z dobrymi lokatorami, wykonywać gesty touch i zarządzać kontekstami w aplikacjach hybrydowych.

**Perspektywa Full Stack Testera:** Appium wymaga od testera zrozumienia warstwy systemu operacyjnego. W Playwright pracujesz głównie z przeglądarką. W Appium pracujesz z Androidem/iOS-em, ich driverami, uprawnieniami systemowymi i cyklem życia aplikacji. To poszerza kompetencje full stack testera o wymiar mobilny.

---

## Sytuacja przewodnia

Zespół QA dostał zadanie zautomatyzowania testów aplikacji hybrydowej. Aplikacja ma ekran logowania natywny (dla bezpieczeństwa), a po zalogowaniu otwiera panel klienta w osadzonym WebView. Test musi rozumieć przełączanie kontekstów, używać stabilnych lokatorów i obsługiwać gesty dotykowe. Zespół zna Playwright, ale Appium jest dla nich nowością.

---

## 1. Architektura Appium — jak to działa

### 1.1 Komponenty systemu

Appium to warstwa abstrakcji między kodem testowym a platformą mobilną. System składa się z czterech warstw:

```
[KOD TESTOWY — WebdriverIO / Java / Python / JS]
        ↓
[SERWER APPIUM — HTTP Server (port 4723)]
        ↓
[DRIVER PLATFORMY]
  ├─ UiAutomator2 (Android)
  ├─ XCUITest (iOS)
  └─ Espresso (Android)
        ↓
[URZĄDZENIE FIZYCZNE LUB EMULATOR]
```

**Serwer Appium** odbiera komendy HTTP w formacie WebDriver JSONWireProtocol i tłumaczy je na polecenia specyficzne dla platformy.

**Drivery platformy:**
- **UiAutomator2** — oficjalny driver Google dla Android 6+; używa UiAutomator2 framework
- **XCUITest** — oficjalny driver Apple dla iOS; używa XCUITest framework
- **Espresso** — driver Google dla Android z naciskiem na synchronizację; testy Espresso są szybsze niż UiAutomator2

### 1.2 Klienty Appium

Appium ma biblioteki klienta dla wielu języków. Wybór zależy od stacku zespołu:

| Język | Biblioteka | Popularność |
|---|---|---|
| **JavaScript/TypeScript** | webdriverio + appium-webdriverio | Wysoka (webdriverio jest dojrzałe) |
| **Java** | appium/java-client | Bardzo wysoka (główny język Androida) |
| **Python** | appium/python-client | Średnia |
| **Java** (JUnit/TestNG) | appium/java-client | Wysoka |

```typescript
// JavaScript/TypeScript — webdriverio
import { remote } from 'webdriverio';

// Python — appium-python-client
// from appium import webdriver
// class AppiumTest:
//     def setUp(self):
//         self.driver = webdriver.Remote(
//             command_executor='http://localhost:4723/wd/hub',
//             desired_capabilities={ ... }
//         )
```

### 1.3 Start serwera Appium

```bash
# Start Appium server lokalnie
npx appium

# Lub przez Docker
docker run -d -p 4723:4723 appium/appium:latest

# Weryfikacja, że serwer działa
curl http://localhost:4723/status
# {"value":{"message":"Appium REST interface active","build":{...},"session":""}}
```

```typescript
// WebdriverIO — konfiguracja Appium z TypeScript
import { remote } from 'webdriverio';

const config = {
  hostname: process.env['APPIUM_HOST'] || 'localhost',
  port: parseInt(process.env['APPIUM_PORT'] || '4723', 10),
  logLevel: 'debug' as const,
  capabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': 'Pixel_7_API_34',
    'appium:platformVersion': '14',
    'appium:app': '/Users/user/projects/shop-app/android/app-debug.apk',
    'appium:appPackage': 'com.example.shop',
    'appium:appActivity': '.MainActivity',
    'appium:autoGrantPermissions': false,
    'appium:noReset': false,
    'appium:newCommandTimeout': 30_000,
    'appium:chromeDriverExecutable': '/path/to/chromedriver',
  },
};

export async function createAppiumDriver(deviceType: string) {
  return remote(config);
}
```

---

## 2. Capabilities — konfiguracja sesji

Capabilities to zbiór parametrów, które opisują urządzenie, platformę, aplikację i sposób automatyzacji. Błędna konfiguracja capabilities to najczęstsza przyczyna błędów „session not created" lub „app not installed".

### 2.1 Capabilities obowiązkowe vs. opcjonalne

**Obowiązkowe (always required):**

```typescript
const MANDATORY_CAPABILITIES = {
  platformName: 'Android', // lub 'iOS'
  'appium:automationName': 'UiAutomator2', // lub 'XCUITest' / 'Espresso'
  'appium:deviceName': 'Pixel_7_API_34', // nazwa urządzenia/emulatora
};
```

**Krytyczne dla Androida:**

```typescript
const ANDROID_CAPABILITIES = {
  // Automacja
  'appium:automationName': 'UiAutomator2', // UiAutomator2 lub Espresso
  'appium:platformVersion': '14', // wersja Androida
  
  // Aplikacja — jedno z poniższych:
  'appium:app': '/path/to/app.apk', // lokalna ścieżka do APK
  'appium:appPackage': 'com.example.shop', // tylko jeśli app jest już zainstalowana
  'appium:appActivity': '.MainActivity', // główna aktywność
  'appium:appWaitActivity': 'com.example.shop.*', // którykolwiek ekran startowy
  
  // Uprawnienia
  'appium:autoGrantPermissions': false, // NIE auto-akceptuj uprawnień (testuj odmowę!)
  
  // Stan aplikacji
  'appium:noReset': false, // true = nie usuwaj danych app między testami
  'appium:fullReset': false, // true = odinstaluj app po każdym teście
  'appium:forceDeviceRestart': false, // restart urządzenia między testami
  
  // Timeouty
  'appium:newCommandTimeout': 30_000, // ms bez odpowiedzi przed timeoutem
  'appium:androidScreenshotPath': '/sdcard/screenshots', // gdzie zapisywać screenshoty
  
  // ChromeDriver (dla WebView testing)
  'appium:chromeDriverExecutable': '/path/to/chromedriver',
  'appium:chromeDriverArguments': ['--no-sandbox'],
};
```

**Krytyczne dla iOS:**

```typescript
const IOS_CAPABILITIES = {
  'appium:automationName': 'XCUITest',
  'appium:platformVersion': '17',
  'appium:deviceName': 'iPhone 14',
  'appium:bundleId': 'com.example.shop', // bundle ID z App Store
  'appium:udid': 'auto', // lub konkretny UDID urządzenia
  'appium:fullReset': false,
  'appium:autoAcceptAlerts': true, // auto-accept system alerts (permissions)
  'appium:allowScreenshot': true,
  'appium:orientation': 'PORTRAIT', // lub LANDSCAPE
  'appium:screenshotWaitTimeout': 10_000,
  'appium:waitForIdleTimeout': 1000, // jak długo czekać na spokojny UI
};
```

### 2.2 Capability prefixes — co oznaczają

| Prefix | Znaczenie | Przykład |
|---|---|---|
| Brak prefixu | W3C WebDriver standard | `platformName`, `browserName` |
| `appium:` | Appium-specific (dla wszystkich platform) | `appium:automationName`, `appium:deviceName` |
| `goog:` | Chrome-specific (Android only) | `goog:chromeOptions` |
| `safari:` | Safari-specific (iOS only) | `safari:initialUrl` |

### 2.3 Weryfikacja capabilities przed sesją

```typescript
// Walidacja capabilities — funkcja pomocnicza
function validateAndroidCapabilities(caps: Record<string, unknown>) {
  const required = ['platformName', 'appium:automationName', 'appium:deviceName'];
  const missing = required.filter(key => !caps[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required capabilities: ${missing.join(', ')}`);
  }

  const hasApp = caps['appium:app'] || (caps['appium:appPackage'] && caps['appium:appActivity']);
  if (!hasApp) {
    throw new Error('Must provide either app path or appPackage + appActivity');
  }

  const validAutomations = ['UiAutomator2', 'Espresso'];
  if (!validAutomations.includes(caps['appium:automationName'])) {
    throw new Error(`Invalid automationName. Must be one of: ${validAutomations.join(', ')}`);
  }

  console.log('✅ Capabilities validated:', JSON.stringify(caps, null, 2));
}

validateAndroidCapabilities({
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'Pixel_7_API_34',
  'appium:app': '/path/to/app.apk',
});
```

---

## 3. Lokatory w Appium — jak znaleźć elementy stabilnie

Wybór lokatorów w Appium ma dramatyczny wpływ na stabilność testów. Zasada jest prosta: im bardziej semantyczny i bliższy intencji programisty, tym stabilniejszy lokator.

### 3.1 Hierarchia stabilności lokatorów

| Priorytet | Typ lokatora | Dlaczego stabilny | Przykład |
|---|---|---|---|
| **1** | Accessibility ID | Zdefiniowany przez developera jako stabilny identyfikator | `~login-email` |
| **2** | ID (resource-id Android, name iOS) | Rzadko się zmienia | `com.example.shop:id/email_field` |
| **3** | Class name | Semantyczny, ale może się zmienić przy refaktoryzacji | `android.widget.EditText` |
| **4** | XPath | Elastyczny, ale kruchy i wolny | `//android.widget.EditText[@text='Adres e-mail']` |
| **5** | CSS selector (WebView) | Jak w przeglądarce | `input#email` |

### 3.2 Android — UiAutomator2 locators

```typescript
// Appium WebdriverIO — lokatory Android

test('elementy logowania na Android', async () => {
  const driver = await remote({ /* config */ });

  // ✅ NAJLEPSZY: Accessibility ID (accessibility label w XML)
  const emailField = await driver.$('~login-email');
  await emailField.setValue('jan@example.test');

  // ✅ DOBRY: ID (resource-id z layoutu XML)
  const emailById = await driver.$('com.example.shop:id/email_field');

  // ✅ DOBRY: Text (content-desc lub text)
  const submitButton = await driver.$('android=new UiSelector().text("Zaloguj się")');
  
  // ✅ DOBRY: Class + instance
  const firstEditText = await driver.$('android=new UiSelector().className("android.widget.EditText").instance(0)');

  // ⚠️ AKCEPTOWALNY: XPath (ale wolniejszy!)
  const emailByXPath = await driver.$('//android.widget.EditText[@text="Adres e-mail"]');

  // ❌ UNIKAJ: Absolute XPath (bardzo kruchy)
  const badXPath = await driver.$('/hierarchy/android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/...');

  await driver.deleteSession();
});
```

```java
// Java — UiSelector API dla Android
// UiSelector jest szybszy niż XPath w UiAutomator2

// Znajdź pole tekstowe z OKREŚLONYM tekstem
UiObject emailField = driver.findElement(
  new UiSelector()
    .text("Adres e-mail")
    .className("android.widget.EditText")
);

// Znajdź przycisk z OKREŚLONĄ treścią
UiObject loginButton = driver.findElement(
  new UiSelector()
    .textContains("Zaloguj")
    .className("android.widget.Button")
);

// Znajdź pole hasła (has password type)
UiObject passwordField = driver.findElement(
  new UiSelector()
    .className("android.widget.EditText")
    .resourceId("com.example.shop:id/password")
);
```

### 3.3 iOS — XCUITest locators

```typescript
// Appium WebdriverIO — lokatory iOS

test('elementy logowania na iOS', async () => {
  const driver = await remote({ /* config */ });

  // ✅ NAJLEPSZY: Accessibility ID
  const emailField = await driver.$('~login-email');
  await emailField.setValue('jan@example.test');

  // ✅ DOBRY: Class chain (iOS-specific, szybki)
  const submitButton = await driver.$(
    '*-ios class chain:**/XCUIElementTypeTextField[`label == "Adres e-mail"`]'
  );

  // ✅ DOBRY: Predicate string (bardziej czytelny niż XPath)
  const emailByPredicate = await driver.$(
    '*-ios predicate string:type == "XCUIElementTypeTextField" && label == "Adres e-mail"'
  );

  // ⚠️ XPath (działa, ale wolniejszy)
  const emailByXPath = await driver.$('//XCUIElementTypeTextField[@value="Adres e-mail"]');

  await driver.deleteSession();
});
```

### 3.4 Jak znaleźć lokatory — inspektory

**Android:** `uiautomatorviewer` (w Android SDK) lub Appium Inspector
```bash
# Start Android SDK uiautomatorviewer
# Znajduje się w: $ANDROID_HOME/tools/bin/uiautomatorviewer
# Po uruchomieniu: kliknij "Device Screenshot" → kliknij element → zobacz resource-id, text, bounds
```

**iOS:** Appium Inspector lub Xcode Accessibility Inspector
```bash
# Start Appium Inspector
npx appium inspector
# Połączy się z serwerem Appium i pokaże hierarchię UI z możliwością wpisywania lokatorów
```

```typescript
// Appium Inspector — screenshot z inspektora
// Ważne: sprawdź atrybut accessibilityIdentifier (najlepszy) lub label/name

// Dobry element (z accessibilityIdentifier):
// <EditText
//   android:id="@+id/email_field"
//   android:accessibilityLabel="login-email"
// />

// Zły element (bez żadnego identyfikatora):
// <EditText
//   android:id="@+id/editText3"
//   android:layout_width="match_parent"
// />

// Programista powinien dodać android:accessibilityLabel do każdego interaktywnego elementu
```

### 3.5 Strategia tworzenia stabilnych lokatorów

```typescript
// Strategia: accessibility ID w pierwszej kolejności

// Jeśli developer dodał accessibility IDs:
// ✅ '~login-email' — działa na Android i iOS (Accessibilty Label / Identifier)
// ✅ '~add-to-cart-button' — semantyczna nazwa
// ✅ '~order-details-screen' — identyfikator ekranu

// Jeśli developer NIE dodał accessibility IDs:
// ✅ Najpierw sprawdź resource-id (Android) / name (iOS)
// const email = await driver.$('com.example.shop:id/email_field');
// const email = await driver.$('XCUIElementTypeTextField');

// Jeśli nie ma ID — XPath z atrybutem 'text' lub 'label'
// ⚠️ Ale XPath z text jest kruchy — text może się zmienić przy l10n
// const submit = await driver.$('android=new UiSelector().text("Zaloguj się")');

// REGUŁA: Zawsze pytaj developera o accessibility labels
// To jest najlepsza praktyka, która poprawia testability całego projektu
```

---

## 4. Gesty dotykowe (Touch Actions)

Mobile to nie tylko tapnięcie. Użytkownik swipe'uje, przewija, przytrzymuje i przeciąga. Appium pozwala na pełną kontrolę gestów.

### 4.1 Podstawowe gesty

```typescript
// WebdriverIO — gestures API

test('gesty dotykowe w aplikacji sklepowej', async () => {
  const driver = await remote({ /* config */ });
  await driver.launchApp();

  // TAP — tapnięcie na element
  const addButton = await driver.$('~add-to-cart');
  await addButton.click(); // proste click = tap

  // TAP z precyzyjną lokalizacją
  const productImage = await driver.$('~product-image-1');
  const box = await productImage.getLocation();
  // Tap w środek obrazu
  await driver.touchPerform([
    {
      action: 'tap',
      options: { x: box.x + box.width / 2, y: box.y + box.height / 2 },
    },
  ]);

  // SWIPE — przewinięcie listy
  const productList = await driver.$('~product-list');
  const listBox = await productList.getLocation();
  
  // Swipe up (przewiń w górę = następne elementy)
  await driver.touchPerform([
    { action: 'press', options: { x: listBox.x + 100, y: listBox.y + listBox.height - 50 } },
    { action: 'moveTo', options: { x: listBox.x + 100, y: listBox.y + 50 } },
    { action: 'release', options: {} },
  ]);

  // SWIPE LEFT — usunięcie elementu (np. swipe left na notyfikacji)
  const notification = await driver.$('~notification-item-1');
  const notifBox = await notification.getLocation();
  
  await driver.touchPerform([
    { action: 'press', options: { x: notifBox.x + 50, y: notifBox.y + 25 } },
    { action: 'moveTo', options: { x: notifBox.x - 200, y: notifBox.y + 25 } },
    { action: 'release', options: {} },
  ]);

  // LONG PRESS — menu kontekstowe
  const productCard = await driver.$('~product-card-1');
  const cardBox = await productCard.getLocation();
  
  await driver.touchPerform([
    { action: 'press', options: { x: cardBox.x + 50, y: cardBox.y + 50 } },
  ]);
  await driver.pause(1000); // 1 sekunda przytrzymania
  await driver.touchPerform([{ action: 'release', options: {} }]);
  
  // Menu kontekstowe powinno się pojawić
  const deleteOption = await driver.$('~context-menu-delete');
  await expect(deleteOption).toBeDisplayed();

  await driver.deleteSession();
});
```

### 4.2 Gesty multi-touch

```typescript
// Multi-touch — pinch to zoom (scale gesture)
test('użytkownik może zoomować obraz produktu', async () => {
  const driver = await remote({ /* config */ });

  const productImage = await driver.$('~product-image');
  const box = await productImage.getLocation();
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  // Pinch: dwa palce zbliżają się do środka (zoom out) lub oddalają (zoom in)
  // Lewy palec (zoom in)
  const leftFinger = { action: 'press', options: { x: centerX - 100, y: centerY } };
  const rightFinger = { action: 'press', options: { x: centerX + 100, y: centerY } };
  const release = { action: 'release', options: {} };

  await driver.touchPerform([
    leftFinger, rightFinger,
    { action: 'moveTo', options: { x: centerX - 150, y: centerY } },
    { action: 'moveTo', options: { x: centerX + 150, y: centerY } },
    release, release,
  ]);

  // Sprawdź, czy zoom się zmienił (np. widok szczegółów)
  await expect(driver.$('~zoom-level-indicator')).toContainText('200%');

  await driver.deleteSession();
});
```

### 4.3 Scroll i swipe z waitFor

```typescript
// Scroll do elementu — waitForVisible z scrollIntoView
test('aplikacja przewija do elementu, który jest poza ekranem', async () => {
  const driver = await remote({ /* config */ });

  // Metoda 1: Użyj scrollIntoView (dla Android z UiScrollable)
  await driver.execute('mobile: scroll', {
    element: await driver.$('~settings-menu-item'),
    strategy: 'android.view.View',
    selector: '@content-desc="Ustawienia"',
  });

  // Metoda 2: Użyj Actions API (nowsze, cleaner)
  const settingsItem = await driver.$('~settings-menu-item');
  await settingsItem.scrollIntoView();

  // Metoda 3: Manual swipe + retry
  async function swipeUntilVisible(selector: string, maxAttempts = 5) {
    for (let i = 0; i < maxAttempts; i++) {
      const element = await driver.$(selector);
      if (await element.isDisplayed()) return;
      
      const container = await driver.$('~scrollable-container');
      const box = await container.getLocation();
      await driver.touchPerform([
        { action: 'press', options: { x: box.x + 100, y: box.y + box.height - 50 } },
        { action: 'moveTo', options: { x: box.x + 100, y: box.y + 50 } },
        { action: 'release', options: {} },
      ]);
      await driver.pause(500);
    }
    throw new Error(`Element ${selector} not visible after ${maxAttempts} swipes`);
  }

  await swipeUntilVisible('~last-product-item');

  await driver.deleteSession();
});
```

---

## 5. Konteksty w aplikacjach hybrydowych

Aplikacja hybrydowa to najtrudniejszy przypadek w testowaniu mobilnym. Ma natywny shell (ramkę) i osadzoną treść webową (WebView). Każdy z tych elementów wymaga innego podejścia.

### 5.1 Czym jest kontekst?

Kontekst w Appium to session connected do jednej warstwy UI:

- **NATIVE_APP** — natywny interfejs (Android Activity / iOS ViewController)
- **WEBVIEW** — osadzona przeglądarka (Chromium WebView na Android, WKWebView na iOS)

```typescript
// Pobieranie i przełączanie kontekstów
test('przełączanie kontekstów w aplikacji hybrydowej', async () => {
  const driver = await remote({ /* config */ });
  await driver.launchApp();

  // Lista dostępnych kontekstów
  const contexts = await driver.getContexts();
  console.log('Available contexts:', contexts);
  // Przykładowy output:
  // ['NATIVE_APP', 'WEBVIEW_com.example.shop', 'WEBVIEW_chrome']

  // Kontekst natywny — ekran logowania
  const nativeContext = contexts.find(c => c.id === 'NATIVE_APP');
  
  // Znajdź i wypełnij natywne pola
  const emailField = await driver.$('~login-email');
  await emailField.setValue('jan@example.test');
  await driver.$('~login-password').setValue('SecurePass123!');
  await driver.$('~login-submit').click();

  // Poczekaj na załadowanie WebView
  await driver.waitUntil(async () => {
    const newContexts = await driver.getContexts();
    return newContexts.some(c => c.id.includes('WEBVIEW'));
  }, { timeout: 15_000 });

  // Przełącz na WebView
  const webviewContext = (await driver.getContexts())
    .find(c => c.id.includes('WEBVIEW'));
  await driver.switchContext(webviewContext.id);

  // TERAZ można używać selektorów WEB (CSS, XPath webowy)
  const customerName = await driver.$('h1.customer-name');
  await expect(customerName).toContainText('Jan');

  // Zweryfikuj przez API, że kontekst się zmienił
  const currentContext = await driver.getContext();
  expect(currentContext).toContain('WEBVIEW');

  // Wróć do natywnego kontekstu
  await driver.switchContext('NATIVE_APP');
  
  // Znów masz dostęp do natywnych elementów
  const backButton = await driver.$('~back-button');
  await backButton.click();

  await driver.deleteSession();
});
```

### 5.2 Debugowanie WebView w Appium

```typescript
// Włącz debugowanie WebView w Androidzie
// W capabilities:
const WEBVIEW_CAPABILITIES = {
  'appium:chromeDriverExecutable': '/path/to/chromedriver', // musisz mieć chromedriver
  'goog:chromeOptions': {
    androidPackage: 'com.example.shop',
    androidDeviceSocket: 'webview_devtools_remote',
  },
};

// Debug WebView w Chrome DevTools
// Na urządzeniu przejdź do: chrome://inspect
// Zobaczysz listę WebViews z możliwością inspect

test('debug WebView content w aplikacji hybrydowej', async () => {
  const driver = await remote({ /* config */ });
  await driver.launchApp();

  // Przełącz na WebView
  await driver.switchContext('WEBVIEW_com.example.shop');

  // Wykonaj JavaScript w WebView
  const pageTitle = await driver.execute(
    '() => document.title'
  );
  console.log('WebView page title:', pageTitle);

  const allLinks = await driver.execute(
    '() => Array.from(document.querySelectorAll("a")).map(a => ({ href: a.href, text: a.textContent }))'
  );
  console.log('All links:', allLinks);

  // Sprawdź console logs z WebView
  const logs = await driver.execute(
    '() => window.__appLogs || []'
  );

  await driver.deleteSession();
});
```

### 5.3 Hybrydowy test end-to-end

```typescript
// Kompletny test hybrydowy: login (native) → WebView (customer panel) → back (native)
test('pełny przepływ użytkownika w aplikacji hybrydowej', async () => {
  const driver = await remote({ /* config */ });

  // === FAZA 1: NATYWNY ekran logowania ===
  const nativeCtx = await driver.getContext();
  console.log('Starting in context:', nativeCtx);

  // Wypełnij formularz natywny
  await driver.$('~login-email').setValue('jan@example.test');
  await driver.$('~login-password').setValue('SecurePass123!');
  
  // Sprawdź widoczność przycisku przed tapnięciem
  const loginButton = await driver.$('~login-submit');
  await expect(loginButton).toBeDisplayed();
  await loginButton.click();

  // === FAZA 2: Czekanie na WebView ===
  await driver.waitUntil(async () => {
    const contexts = await driver.getContexts();
    return contexts.some(c => c.id.includes('WEBVIEW'));
  }, { timeout: 20_000, timeoutMsg: 'WebView nie załadował się' });

  // === FAZA 3: WEBVIEW panel klienta ===
  const webviewCtx = (await driver.getContexts()).find(c => c.id.includes('WEBVIEW'));
  await driver.switchContext(webviewCtx.id);

  // Web-style selectors
  await expect(driver.$('h1')).toContainText('Panel Klienta', { timeout: 10_000 });
  
  // Kliknij produkt w liście webowej
  const firstProduct = await driver.$('.product-item:first-child a');
  await firstProduct.click();

  // Sprawdź stronę szczegółów
  await expect(driver.$('.product-detail h2')).toBeVisible();

  // === FAZA 4: Powrót do NATYWNEGO kontekstu ===
  // Wróć do natywnej nawigacji — np. przez przycisk back
  await driver.switchContext('NATIVE_APP');
  
  const backButton = await driver.$('~back-nav');
  await expect(backButton).toBeDisplayed();
  await backButton.click();

  // Sprawdź, że wróciliśmy do listy
  await expect(driver.$('~product-list')).toBeDisplayed();

  await driver.deleteSession();
});
```

---

## 6. Oczekiwania (Waits) — synchronizacja w Appium

Asynchroniczność to największe wyzwanie w testach mobilnych. Aplikacja może być zajęta (animacja, ładowanie, network request), a test próbuje interacting przedwcześnie.

### 6.1 Typy waitów

```typescript
// Implicit wait — globalny timeout dla wszystkich poleceń
// Ustawiany raz na początku sesji
await driver.setImplicitTimeout(10_000); // 10s dla każdego findElement

// Explicit wait — czekaj na konkretny warunek
await driver.waitUntil(
  async () => {
    const element = await driver.$('~loading-indicator');
    const isVisible = await element.isDisplayed();
    return !isVisible; // czekaj, aż loading zniknie
  },
  { timeout: 15_000, timeoutMsg: 'Loading nie zniknął w 15s' }
);

// Smart wait — funkcja mobilitiesAppium waitFor
test('oczekiwanie na element z custom wait', async () => {
  const driver = await remote({ /* config */ });

  // Poczekaj, aż element będzie clickable (enabled + visible + stable)
  const addButton = await driver.waitFor(
    '~add-to-cart',
    { state: 'visible', timeout: 10_000, interval: 500 }
  );
  await addButton.click();

  // Poczekaj na zniknięcie
  const loadingSpinner = await driver.$('~loading-spinner');
  await driver.waitFor(loadingSpinner, { state: 'hidden', timeout: 15_000 });

  await driver.deleteSession();
});
```

### 6.2 Android-specific waits (UiAutomator2)

```typescript
// UiAutomator2 ma dedykowane metody waitFor
test('Android-specific waits', async () => {
  const driver = await remote({ /* config */ });

  // mobile: waitForModuleState — czekaj na stan modułu
  await driver.execute('mobile: waitForModuleState', {
    module: 'webview',
    state: 'attached',
    timeout: 10_000,
  });

  // mobile: freezeRotation — zablokuj rotację podczas testu
  await driver.execute('mobile: freezeRotation');

  // mobile: deviceInfo — informacje o urządzeniu
  const deviceInfo = await driver.execute('mobile: deviceInfo');
  console.log('Screen size:', deviceInfo.screenWidth, 'x', deviceInfo.screenHeight);
  console.log('Available memory:', deviceInfo.availMem);

  await driver.deleteSession();
});
```

### 6.3 Wzorzec Page Object dla Appium

```typescript
// pages/HybridLoginPage.ts — Page Object dla aplikacji hybrydowej

export class HybridLoginPage {
  constructor(private readonly driver: WebdriverIO.Browser) {}

  // === NATYWNE ELEMENTY ===
  get emailField() {
    return this.driver.$('~login-email');
  }

  get passwordField() {
    return this.driver.$('~login-password');
  }

  get submitButton() {
    return this.driver.$('~login-submit');
  }

  get errorMessage() {
    return this.driver.$('~login-error-message');
  }

  // === NATYWNE METODY ===
  async login(email: string, password: string): Promise<void> {
    await this.emailField.setValue(email);
    await this.passwordField.setValue(password);
    await this.submitButton.click();
  }

  async expectErrorVisible(): Promise<void> {
    const error = this.errorMessage;
    await error.waitFor({ state: 'visible', timeout: 5_000 });
    await expect(error).toBeDisplayed();
  }

  async switchToWebView(): Promise<void> {
    const contexts = await this.driver.getContexts();
    const webviewCtx = contexts.find(c => c.id.includes('WEBVIEW'));
    if (!webviewCtx) throw new Error('No WebView context found');
    await this.driver.switchContext(webviewCtx.id);
  }

  async switchToNative(): Promise<void> {
    await this.driver.switchContext('NATIVE_APP');
  }
}

// tests/hybrid-login.spec.ts
import { remote } from 'webdriverio';
import { HybridLoginPage } from '../pages/HybridLoginPage';

test('użytkownik loguje się i widzi panel klienta w WebView', async () => {
  const driver = await remote({ /* config */ });
  const loginPage = new HybridLoginPage(driver);

  await driver.launchApp();
  await loginPage.login('jan@example.test', 'SecurePass123!');

  // Poczekaj na WebView
  await driver.waitUntil(async () => {
    const ctxs = await driver.getContexts();
    return ctxs.some(c => c.id.includes('WEBVIEW'));
  }, { timeout: 20_000 });

  await loginPage.switchToWebView();

  // Teraz sprawdź WebView content
  const welcomeHeading = await driver.$('h1');
  await expect(welcomeHeading).toContainText('Panel Klienta');

  await driver.deleteSession();
});
```

---

## Przykład referencyjny — konfiguracja Appium z macierzą urządzeń i fikstrami

```typescript
// appium.config.ts — kompletna konfiguracja Appium z fikstrą i macierzą
import { remote, WebdriverIO } from 'webdriverio';

type DeviceProfile = {
  platformName: 'Android' | 'iOS';
  deviceName: string;
  platformVersion: string;
  automationName: string;
  appPath: string;
  autoGrantPermissions: boolean;
};

const DEVICE_MATRIX: Record<string, DeviceProfile> = {
  'pixel7-android14': {
    platformName: 'Android',
    deviceName: 'Pixel 7',
    platformVersion: '14',
    automationName: 'UiAutomator2',
    appPath: './apps/shop-android-debug.apk',
    autoGrantPermissions: false,
  },
  'galaxy-a54-android13': {
    platformName: 'Android',
    deviceName: 'Samsung Galaxy A54',
    platformVersion: '13',
    automationName: 'UiAutomator2',
    appPath: './apps/shop-android-debug.apk',
    autoGrantPermissions: false,
  },
  'iphone14-ios17': {
    platformName: 'iOS',
    deviceName: 'iPhone 14',
    platformVersion: '17',
    automationName: 'XCUITest',
    appPath: './apps/shop-ios.ipa',
    autoGrantPermissions: false,
  },
};

export async function createAppiumSession(deviceKey: string) {
  const device = DEVICE_MATRIX[deviceKey];
  if (!device) throw new Error(`Unknown device: ${deviceKey}`);

  const caps = {
    platformName: device.platformName,
    'appium:automationName': device.automationName,
    'appium:deviceName': device.deviceName,
    'appium:platformVersion': device.platformVersion,
    'appium:app': device.appPath,
    'appium:autoGrantPermissions': device.autoGrantPermissions,
    'appium:noReset': false,
    'appium:newCommandTimeout': 30_000,
  };

  const driver = await remote({
    hostname: process.env['APPIUM_HOST'] || 'localhost',
    port: parseInt(process.env['APPIUM_PORT'] || '4723', 10),
    capabilities: caps,
  });

  return driver;
}

// Usage:
test('login na Pixel 7', async () => {
  const driver = await createAppiumSession('pixel7-android14');
  // ... test
  await driver.deleteSession();
});

test('login na Samsung Galaxy A54 (średnia półka)', async () => {
  const driver = await createAppiumSession('galaxy-a54-android13');
  // ... test
  await driver.deleteSession();
});
```

---

## Perspektywa Full Stack Testera

Appium to narzędzie, które wymaga od testera pełnego zrozumienia warstwy systemu operacyjnego — Android SDK, Xcode, UiAutomator2 API, XCUITest API. To poszerza kompetencje full stack testera o wymiar mobilny, który jest coraz ważniejszy w dzisiejszych projektach. Pamiętaj, że Appium nie jest zamiennikiem Playwright — są to narzędzia do różnych produktów. Playwright dla mobile web i PWA, Appium dla natywnych i hybrydowych aplikacji.

---

## Podsumowanie

- **Architektura Appium:** Klient → Serwer → Driver (UiAutomator2/XCUITest) → Urządzenie; WebDriver protocol jako standard
- **Capabilities:** Poprawna konfiguracja to fundament — platformName, automationName, deviceName, app, autoGrantPermissions
- **Lokatory:** Accessibility ID > resource-id/name > text > XPath; zawsze proś developera o accessibility labels
- **Gesty:** Tap, swipe, long press, multi-touch, scroll — wszystkie z waitFor synchronizacji
- **Konteksty:** NATIVE_APP vs. WEBVIEW — przełączanie kontekstu jest kluczowe dla hybrydowych aplikacji
- **Oczekiwania:** Implicit + explicit waits; synchronizacja to podstawa stabilności
- **Page Object:** Enkapsulacja natywnych lokatorów i kontekstów — czytelność i łatwość utrzymania

---

## Linki i źródła

- [Appium Official Documentation](https://appium.io/docs/en/latest/) — oficjalna dokumentacja Appium z wszystkimi komendami
- [WebdriverIO — Appium Integration](https://webdriver.io/docs/appium) — webdriverio API dla Appium z TypeScript
- [UiAutomator2 — UiSelector](https://developer.android.com/training/testing/other-components/ui-automator) — UiSelector API dla Android
- [XCUITest — XCUIElement](https://developer.apple.com/documentation/xctest/xcuielement) — XCUITest API dla iOS
- [Appium Inspector](https://github.com/appium/appium-inspector) — graficzny inspektor elementów mobile
- [Appium Desktop](https://github.com/appium/appium-desktop) — desktop Appium server z inspektorem
- [BrowserStack — App Automate](https://www.browserstack.com/docs/app-automate) — jak połączyć BrowserStack z Appium