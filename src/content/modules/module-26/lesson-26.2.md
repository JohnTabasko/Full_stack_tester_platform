# Fundamenty i architektura automatyzacji mobilnej: Appium 2

Podczas gdy Playwright doskonale emuluje mobilne wersje przeglądarek (viewport, userAgent) na komputerach biurkowych, weryfikacja **rzeczywistych aplikacji mobilnych (natywnych i hybrydowych)** dla systemów Android oraz iOS wymaga dedykowanego, niskopoziomowego narzędzia. 

Niezaprzeczalnym standardem rynkowym jest **Appium** (w najnowszej, w pełni modularnej wersji **Appium 2**). W tej lekcji przeanalizujesz od podszewki architekturę Appium, proces zarządzania sterownikami (Drivers) oraz nauczysz się pisać silnie otypowane skrypty testów mobilnych w TypeScript.

---

## 1. Modularna Architektura Appium 2 (Client-Server Model)

Appium działa w architekturze **Klient-Serwer** w oparciu o protokół **W3C WebDriver Protocol**:

```
+------------------+                   +--------------------+
|  Playwright Test | -- HTTP JSON ---->|   Appium Server    |
| / WebdriverIO    |   (W3C WebDriver) | (Uruchomiony local)|
+------------------+                   +--------------------+
                                                 |
                                            Uruchamia
                                                 v
+------------------+                   +--------------------+
|  XCUITest Driver | <---- iOS         | UiAutomator2 Driver| <--- Android
|  (Silnik Apple)  |                   | (Silnik Google)    |
+------------------+                   +--------------------+
```

### Podstawowe elementy:
1.  **Appium Client (Kod testu)**: Twój program testowy napisany w TypeScript (używający biblioteki klienta, np. WebdriverIO lub Appium WebDriver).
2.  **Appium Server**: Lekki serwer Node.js nasłuchujący komend klienta i tłumaczący je na komendy zrozumiałe dla sterowników systemowych.
3.  **Drivers (Sterowniki)**: Wersja Appium 2 jest w pełni modularna. Serwer nie posiada domyślnych sterowników – musisz je doinstalować ręcznie w zależności od potrzeb:
    *   `uiautomator2` – do automatyzacji urządzeń Android.
    *   `xcuitest` – do automatyzacji urządzeń iOS.

Instalacja sterownika w Appium 2:
```bash
appium driver install uiautomator2
```

---

## 2. Konfiguracja Możliwości Urządzenia (Appium Capabilities)

Przed nawiązaniem połączenia, klient musi przekazać do serwera obiekt **W3C Capabilities** definiujący parametry techniczne urządzenia oraz ścieżkę do instalowanej aplikacji `.apk` lub `.app`/`.ipa`:

```typescript
const capabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'Android_Emulator',
  'appium:app': '/path/to/my-app.apk',
  'appium:appPackage': 'com.mycommerce.app',
  'appium:appActivity': 'com.mycommerce.app.MainActivity',
  'appium:noReset': true, // Zachowaj stan aplikacji (nie usuwaj danych) między testami
};
```

---

## 3. Kompletny skrypt testu mobilnego w TypeScript

Do pisania kodu testu w TypeScript najwygodniej użyć nowoczesnej biblioteki klienta **WebdriverIO**:

```typescript
import { remote } from 'webdriverio';

test('mobilny zakup produktu w aplikacji natywnej Android', async () => {
  // 1. Arrange: Nawiąż połączenie z serwerem Appium przekazując capabilities
  const driver = await remote({
    protocol: 'http',
    hostname: '127.0.0.1',
    port: 4723,
    path: '/',
    capabilities: {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': 'Emulator_S24',
      'appium:app': './apps/ecommerce-app.apk',
    }
  });

  // 2. Act: Wykonanie interakcji na elementach natywnych (używając lokatorów accessibility-id)
  const loginButton = await driver.$('~login-button-accessibility-id');
  await loginButton.click();

  const emailInput = await driver.$('android=new UiSelector().resourceId("com.mycommerce.app:id/email")');
  await emailInput.setValue('tester@arena.ai');

  const passwordInput = await driver.$('android=new UiSelector().resourceId("com.mycommerce.app:id/password")');
  await passwordInput.setValue('Password123!');

  const submitButton = await driver.$('~submit-login');
  await submitButton.click();

  // 3. Assert: Weryfikacja zalogowania
  const homeHeader = await driver.$('~home-screen-header');
  expect(await homeHeader.isDisplayed()).toBe(true);

  // Teardown: Zamknij sesję sterownika i usuń aplikację z emulatora
  await driver.deleteSession();
});
```

---

## 4. Checklista Podstaw Appium
- [ ] Czy zainstalowałeś serwer Appium 2 oraz właściwe sterowniki (`uiautomator2` / `xcuitest`)?
- [ ] Czy poprawnie konfigurujesz obiekt W3C Capabilities, określając właściwe wartości pakietów i aktywności startowych?
- [ ] Czy do wyszukiwania elementów w aplikacjach natywnych stosujesz unikalne identyfikatory dostępności (Accessibility IDs – oznaczone w kodzie tyldą `~`)?
- [ ] Czy pamiętasz o zamykaniu sesji sterownika (`deleteSession()`) w fazie Teardownu?