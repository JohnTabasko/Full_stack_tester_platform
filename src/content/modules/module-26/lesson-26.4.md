# Uprawnienia, linki głębokie i tryb offline

> Aplikacja mobilna nie działa w izolacji — współpracuje z systemem operacyjnym, innymi aplikacjami i siecią. Użytkownik może odmówić uprawnień, otworzyć aplikację przez link w e-mailu, znaleźć się w miejscu bez zasięgu lub stracić połączenie podczas edycji formularza. Każdy z tych scenariuszy jest realnym punktem wejścia użytkownika, a każdy z nich może zakończyć się awarią, jeśli nie zostanie przetestowany. W tej lekcji nauczysz się testować przepływy zależne od systemu operacyjnego: uprawnienia, deep linki, powiadomienia push, tryb offline i synchronizację danych.

## Jak czytać ten moduł

Czytaj tę lekcję przez pryzmat scenariuszy użytkownika. Każda sekcja zaczyna się od konkretnej sytuacji, w której użytkownik wchodzi w interakcję z systemem operacyjnym lub siecią w sposób, który może zaskoczyć aplikację. Testy tych scenariuszy różnią się od standardowych testów UI: wymagają kontroli stanu urządzenia, symulacji warunków zewnętrznych i weryfikacji zachowania aplikacji w stanach wyjątkowych.

Trzy zasady lekcji:

1. **Uprawnienia to ścieżka użytkownika.** Odmowa uprawnień, zmiana decyzji, wygasłe uprawnienia — to wszystko są realne przepływy, nie edge cases.
2. **Deep link to punkt wejścia.** Użytkownik wchodzi przez link z e-maila, push notification, SMS lub kampanii marketingowej — aplikacja musi obsłużyć każdy kontekst.
3. **Offline to stan, nie błąd.** Aplikacja musi działać (lub graceful degradation) w trybie offline, a następnie synchronizować dane po powrocie online.

---

## Cel lekcji

Ta lekcja koncentruje się na: **uprawnienia systemowe, push notifications, deep linki, utrata sieci, cache lokalny i synchronizacja po powrocie online**. Główne ryzyko: **aplikacja działa w idealnych warunkach (wszystkie uprawnienia, stałe połączenie, start z home screen), ale zawodzi przy odmowie uprawnienia, wejściu przez deep link, utracie sieci lub konflikcie synchronizacji**. Po lekturze powinieneś umieć zaprojektować i napisać testy dla każdego z tych scenariuszy.

**Perspektywa Full Stack Testera:** Scenariusze zależne od systemu operacyjnego wymagają od testera zrozumienia cyklu życia aplikacji mobilnej: install → grant permissions → foreground → background → foreground → uninstall. Każdy z tych stanów ma swoje ryzyka i swoje testy. Full stack tester, który testuje tylko happy path, pomija 40-60% realnych problemów użytkowników.

---

## Sytuacja przewodnia

Użytkownik otwiera link do zamówienia z e-maila (deep link), traci zasięg podczas edycji adresu dostawy, a po powrocie online aplikacja pokazuje, że zamówienie jest zaktualizowane — ale w bazie danych widnieje stara wartość. Jednocześnie użytkownik odmówił uprawnień geolokalizacji, a push notification z przypomnieniem o płatności nigdy nie dotarła, bo wygasł token.

---

## 1. Uprawnienia systemowe — pełny cykl życia

Uprawnienia (permissions) to mechanizm, przez który użytkownik kontroluje dostęp aplikacji do zasobów urządzenia: lokalizacji, kamery, mikrofonu, zdjęć, kontaktów, powiadomień, pamięci. Aplikacja musi obsłużyć trzy stany: przyznanie, odmowa i zmiana decyzji.

### 1.1 Typy uprawnień i ryzyka

| Uprawnienie | Android | iOS | Ryzyko | Testujesz |
|---|---|---|---|---|
| **Lokalizacja** | `ACCESS_FINE_LOCATION` | `NSLocationWhenInUseUsageDescription` | Brak lokalizacji → nie działa wyszukiwarka | Przyznanie, odmowa, only-while-using |
| **Kamera** | `CAMERA` | `NSCameraUsageDescription` | Crash przy użyciu bez uprawnień | Przyznanie, odmowa, zmiana w ustawieniach |
| **Mikrofon** | `RECORD_AUDIO` | `NSMicrophoneUsageDescription` | Brak audio → nie działa dyktowanie | Przyznanie, odmowa |
| **Powiadomienia push** | `POST_NOTIFICATIONS` (Android 13+) | `UIBackgroundModes` | Brak re-engagement | Opt-in, opt-out, token refresh |
| **Zdjęcia** | `READ_MEDIA_IMAGES` (Android 13+) | `NSPhotoLibraryUsageDescription` | Brak uploadu zdjęć | Odmowa, limited access |
| **Bluetooth** | `BLUETOOTH_*` | `NSBluetoothAlwaysUsageDescription` | Brak NFC payment | Parowanie, scanning |
| **Kontakty** | `READ_CONTACTS` | `NSContactsUsageDescription` | Brak poleceń głosowych | Odmowa → graceful degradation |

### 1.2 Testowanie uprawnień w mobile web / PWA (Playwright)

```typescript
// Playwright — testowanie uprawnień przeglądarki

test.describe('Geolocation permissions', () => {
  // Scenariusz 1: Użytkownik przyznaje uprawnienia
  test('przyznaje geolokalizację — wyszukiwarka pokazuje lokalne punkty', async ({ page, context }) => {
    const contextWithGeo = await browser.newContext({
      permissions: ['geolocation'],
      geolocation: { latitude: 52.2297, longitude: 21.0122 }, // Warszawa
    });

    const geoPage = await contextWithGeo.newPage();
    await geoPage.goto('/pickup-points');
    
    const nearestPoints = geoPage.getByText('Warszawa');
    await expect(nearestPoints).toBeVisible({ timeout: 10_000 });
    
    await contextWithGeo.close();
  });

  // Scenariusz 2: Użytkownik odmawia uprawnień
  test('odmawia geolokalizacji — aplikacja nie crashuje, pokazuje alternative', async ({ page, context }) => {
    // Bez uprawnień geolokalizacji (nie używaj grantPermissions z odmową)
    const contextWithoutGeo = await browser.newContext({
      permissions: [], // brak geolokalizacji
    });

    const noGeoPage = await contextWithoutGeo.newPage();
    await noGeoPage.goto('/pickup-points');

    // Aplikacja pokazuje pole do wprowadzenia adresu ręcznie
    const manualAddressInput = noGeoPage.getByLabel('Wpisz adres lub miasto');
    await expect(manualAddressInput).toBeVisible();

    // Lub wyświetla informację o braku uprawnień z linkiem do ustawień
    const geoPrompt = noGeoPage.getByRole('dialog').or(noGeoPage.getByText('Włącz lokalizację'));
    if (await geoPrompt.isVisible()) {
      await noGeoPage.getByRole('button', { name: 'Wpisz adres ręcznie' }).click();
    }

    await expect(noGeoPage.getByLabel('Wpisz adres lub miasto')).toBeVisible();

    await contextWithoutGeo.close();
  });

  // Scenariusz 3: Uprawnienia weryfikowane przez system (PWA)
  test('PWA obsługuje odmowę powiadomień push', async ({ page, context }) => {
    await page.goto('/notifications-settings');
    
    // Próba włączenia powiadomień
    const enableButton = page.getByRole('button', { name: 'Włącz powiadomienia' });
    await enableButton.click();

    // Przeglądarka pokazuje system prompt — NIE auto-acceptuj
    // W prawdziwym teście używasz page.context().grantPermissions(['notifications'])
    // ale chcesz też sprawdzić scenariusz odmowy:
    
    const notificationStatus = page.getByTestId('notification-status');
    
    // Jeśli user odmówił — status powinien pokazywać "Zablokowane"
    // Symuluj odmowę przez reset permissions
    await context.clearPermissions();
    await page.reload();
    
    await expect(notificationStatus).toContainText('Zablokowane w przeglądarce');
    await expect(page.getByText('Aby włączyć, zmień ustawienia przeglądarki')).toBeVisible();
  });
});
```

### 1.3 Testowanie uprawnień w aplikacji natywnej (Appium)

```typescript
// Appium — testowanie uprawnień na Androidzie

test('aplikacja obsługuje odmowę uprawnień kamery', async () => {
  const driver = await remote({ /* config */ });

  // Konfiguracja: NIE auto-acceptuj uprawnień
  await driver.launchApp();

  // Krok 1: Przejdź do funkcji wymagającej kamery
  const scanButton = await driver.$('~scan-barcode');
  await scanButton.click();

  // Krok 2: System pokazuje prompt uprawnień
  // Appium może automatycznie odpowiedzieć „Deny"
  // Lub możemy sprawdzić, czy aplikacja sama obsługuje prompt

  // Krok 3: Symuluj odmowę (Android)
  // Metoda 1: Appium auto-deny (autoGrantPermissions: false)
  // Metoda 2: Programowe ustawienie uprawnień przez ADB
  // await driver.execute('mobile: grantPermissions', {
  //   pkg: 'com.example.shop',
  //   permissions: ['android.permission.CAMERA'],
  //   grant: false, // revoke
  // });

  // Krok 4: Sprawdź UI po odmowie
  // Aplikacja powinna pokazać ekran z informacją i linkiem do ustawień
  const cameraPermissionMessage = await driver.$('~camera-permission-required');
  await expect(cameraPermissionMessage).toBeVisible();
  await expect(cameraPermissionMessage).toContainText('Włącz dostęp do kamery');

  // Krok 5: Przycisk „Otwórz ustawienia" powinien działać
  const openSettingsButton = await driver.$('~open-app-settings');
  await expect(openSettingsButton).toBeDisplayed();
  await openSettingsButton.click();

  // Aplikacja powinna otworzyć systemowe ustawienia uprawnień
  // Na Android: Intent.ACTION_APPLICATION_DETAILS_SETTINGS

  await driver.deleteSession();
});

// Appium — testowanie uprawnień na iOS
test('iOS app obsługuje odmowę powiadomień push', async () => {
  const driver = await remote({ /* config */ });

  await driver.launchApp();

  // Przejdź do ustawień powiadomień w aplikacji
  const settingsButton = await driver.$('~settings-icon');
  await settingsButton.click();
  const notificationsToggle = await driver.$('~push-notifications-toggle');

  // Włącz powiadomienia (wywoła system prompt)
  await notificationsToggle.click();

  // iOS pokaże systemowy alert — Appium może go auto-accept
  // Ale chcemy testować odmowę:
  
  // Metoda: Wyłącz powiadomienia przez Settings URL scheme
  await driver.execute('mobile: launchApp', {
    bundleId: 'com.apple.mobilesafari',
    url: 'App-Prefs:NOTIFICATIONS_ID',
  });

  // Alternatywnie: sprawdź, czy po odmowie aplikacja graceful degrades
  // Przywróć app na foreground
  await driver.execute('mobile: activateApp', { bundleId: 'com.example.shop' });

  // Sprawdź, czy push toggle jest wyłączony i pokazuje status
  const statusText = await driver.$('~notification-status-text');
  await expect(statusText).toContainText('Powiadomienia wyłączone');

  await driver.deleteSession();
});
```

### 1.4 Testowanie zmiany uprawnień po pierwszym uruchomieniu

```typescript
// Appium — testowanie scenariusza: przyznanie → odmowa → ponowne przyznanie

test('użytkownik zmienia zdanie o uprawnieniach (grant → deny → grant)', async () => {
  const driver = await remote({ /* config */ });

  // FAZA 1: Pierwsze uruchomienie — przyznaj uprawnienia
  await driver.launchApp();
  
  // System prompt — auto-accept (autoGrantPermissions: true)
  const locationPrompt = await driver.$('android=new UiSelector().text("Zezwól na dostęp do lokalizacji")');
  await driver.acceptAlert(); // Appium accept system alert

  // Zweryfikuj działanie
  const locationStatus = await driver.$('~location-status');
  await expect(locationStatus).toContainText('Lokalizacja włączona');

  // FAZA 2: Wróć do app i zmień uprawnienia w systemie (bez restart app)
  // Symuluj zmianę uprawnień przez ADB
  await driver.execute('mobile: revokePermissions', {
    pkg: 'com.example.shop',
    permissions: ['android.permission.ACCESS_FINE_LOCATION'],
  });

  // Aplikacja w foreground — sprawdź, jak obsługuje zmianę
  // (aplikacja może być wyrzucona na backstack, więc trzeba ją przywrócić)
  await driver.execute('mobile: activateApp', { bundleId: 'com.example.shop' });

  // FAZA 3: Sprawdź, czy aplikacja detekuje zmianę uprawnień
  // Dobrze napisana app powinna:
  // a) automatycznie zaktualizować UI po powrocie z tła
  // b) pokazać informację o braku uprawnień
  // c) nie crashować

  const updatedLocationStatus = await driver.$('~location-status');
  await expect(updatedLocationStatus).toContainText('Lokalizacja niedostępna');

  // FAZA 4: Ponowne przyznanie uprawnień
  await driver.execute('mobile: grantPermissions', {
    pkg: 'com.example.shop',
    permissions: ['android.permission.ACCESS_FINE_LOCATION'],
  });
  
  await driver.execute('mobile: activateApp', { bundleId: 'com.example.shop' });
  await expect(updatedLocationStatus).toContainText('Lokalizacja włączona');

  await driver.deleteSession();
});
```

---

## 2. Deep linki — punkty wejścia spoza aplikacji

Deep link (link głęboki) to URL, który otwiera konkretny ekran w aplikacji, nie tylko jej home screen. Użytkownik wchodzi przez deep link z e-maila (link do zamówienia), push notification (promo link), SMS (link do weryfikacji), social media lub kampanii marketingowej.

### 2.1 Typy deep linków

| Typ | Format | Przykład | Użycie |
|---|---|---|---|
| **Custom URL scheme** | `myapp://path` | `myapp://orders/ord-123` | Starsze iOS/Android |
| **App Links (Android)** | `https://domena.com/orders/ord-123` | Weryfikacja domeny przez AASA | Android 6+ |
| **Universal Links (iOS)** | `https://domena.com/orders/ord-123` | Weryfikacja apple-app-site-association | iOS 9+ |
| **Deferred deep link** | `myapp://?referrer=...` | Przekierowanie po instalacji | Mobile marketing |

### 2.2 Testowanie deep linków — Playwright (mobile web / PWA)

```typescript
// Playwright — deep link w PWA (tryb mobile web)

test.describe('Deep links — mobile web', () => {
  // Scenariusz 1: Deep link bez zalogowania
  test('otwiera stronę logowania z deep linkiem, który prowadzi do zamówienia', async ({ page, context }) => {
    // Symuluj deep link przez zmianę referrera
    await context.addInitScript(() => {
      // W prawdziwej aplikacji webowej deep link jest zwykłym URL
      // Tutaj symulujemy przez przekierowanie z parametrem
      history.pushState({}, '', '/?redirect=/orders/ord-123');
    });
    
    await page.goto('/');

    // Aplikacja detekuje redirect i wymusza logowanie
    await expect(page.getByRole('heading', { name: 'Logowanie' })).toBeVisible();

    // Po zalogowaniu — redirect do pierwotnego deep linku
    await page.getByLabel('Adres e-mail').fill('jan@example.test');
    await page.getByLabel('Hasło').fill('SecurePass123!');
    await page.getByRole('button', { name: 'Zaloguj się' }).click();

    // Powinien być na stronie zamówienia
    await page.waitForURL(/\/orders\/ord-123/, { timeout: 10_000 });
    await expect(page.getByText('ord-123')).toBeVisible();
  });

  // Scenariusz 2: Deep link z wygasłą sesją
  test('deep link z wygasłą sesją — logowanie i redirect', async ({ page, context }) => {
    // Symuluj wygasłą sesję przez ustawienie expired cookie
    await context.addInitScript(() => {
      document.cookie = 'session=expired_token; path=/; max-age=0';
      history.pushState({}, '', '/orders/ord-123');
    });

    await page.goto('/orders/ord-123');

    // Aplikacja wykrywa wygasłą sesję → redirect do logowania
    await expect(page.getByRole('heading', { name: 'Logowanie' })).toBeVisible();
    // URL powinien zawierać pierwotny destination
    await expect(page).toHaveURL(/redirect=/);

    await page.getByLabel('Adres e-mail').fill('jan@example.test');
    await page.getByLabel('Hasło').fill('SecurePass123!');
    await page.getByRole('button', { name: 'Zaloguj się' }).click();

    // Po zalogowaniu wraca do zamówienia
    await page.waitForURL(/\/orders\/ord-123/, { timeout: 10_000 });
  });

  // Scenariusz 3: Deep link z nieprawidłowym ID
  test('deep link z nieprawidłowym ID — 404 lub fallback', async ({ page }) => {
    await page.goto('/orders/invalid-id-xyz');

    // Aplikacja może pokazać 404 lub przekierować na listę zamówień
    const errorMessage = page.getByRole('alert').or(page.getByText('Nie znaleziono zamówienia'));
    const orderList = page.getByRole('link', { name: 'Moje zamówienia' });
    
    const hasError = await errorMessage.isVisible({ timeout: 3_000 }).catch(() => false);
    const hasList = await orderList.isVisible({ timeout: 3_000 }).catch(() => false);

    // Przynajmniej jedno z nich musi być widoczne — nie crash
    expect(hasError || hasList).toBe(true);
  });
});
```

### 2.3 Testowanie deep linków — Appium (native / hybrid)

```typescript
// Appium — deep linking na Androidzie i iOS

test('Android: deep link otwiera ekran zamówienia', async () => {
  const driver = await remote({ /* config */ });

  // Metoda 1: URL przez adb shell (Android)
  // adb shell am start -W -a android.intent.action.VIEW -d "myapp://orders/ord-123"
  
  await driver.execute('mobile: deepLink', {
    url: 'myapp://orders/ord-123',
    package: 'com.example.shop',
  });

  // Poczekaj na załadowanie ekranu
  await driver.waitUntil(async () => {
    const currentActivity = await driver.getCurrentActivity();
    return currentActivity.includes('.OrderDetailActivity');
  }, { timeout: 15_000 });

  // Sprawdź, czy wyświetlane jest zamówienie ord-123
  const orderIdText = await driver.$('~order-id');
  await expect(orderIdText).toContainText('ord-123');

  // Jeśli nie jesteś zalogowany — sprawdź redirect do logowania
  const loginScreen = await driver.$('~login-screen');
  const isOnLogin = await loginScreen.isDisplayed().catch(() => false);
  
  if (isOnLogin) {
    // Zaloguj się
    await driver.$('~login-email').setValue('jan@example.test');
    await driver.$('~login-password').setValue('SecurePass123!');
    await driver.$('~login-submit').click();

    // Po zalogowaniu wróć do deep link destination
    await driver.waitUntil(async () => {
      const activity = await driver.getCurrentActivity();
      return activity.includes('.OrderDetailActivity');
    }, { timeout: 15_000 });

    await expect(orderIdText).toContainText('ord-123');
  }

  await driver.deleteSession();
});

test('iOS: Universal Link otwiera ekran zamówienia', async () => {
  const driver = await remote({ /* config */ });

  // iOS Universal Links działają przez otwarcie URL w Safari → redirect do app
  // Metoda: otwórz URL przez Safari lub przez UIApplication openURL
  
  await driver.execute('mobile: launchApp', {
    bundleId: 'com.example.shop',
  });

  // Symuluj przyjście z Universal Link przez UIApplication
  await driver.execute('mobile: openUrl', {
    url: 'https://shop.example.com/orders/ord-123',
  });

  // Aplikacja powinna obsłużyć Universal Link i otworzyć ekran zamówienia
  await driver.waitUntil(async () => {
    const element = await driver.$('~order-detail-screen');
    return element.isDisplayed();
  }, { timeout: 15_000 });

  const orderId = await driver.$('~order-number');
  await expect(orderId).toContainText('ord-123');

  await driver.deleteSession();
});

// Scenariusz edge case: deep link do niezalogowanego użytkownika bez uprawnień
test('deep link wymaga login + uprawnień — sprawdź oba warunki', async () => {
  const driver = await remote({ /* config */ });

  // Deep link do funkcji wymagającej kamery
  await driver.execute('mobile: deepLink', {
    url: 'myapp://scan/?orderId=ord-123',
    package: 'com.example.shop',
  });

  // Krok 1: Aplikacja otwiera się → może być na ekranie logowania
  const loginScreen = await driver.$('~login-email');
  if (await loginScreen.isDisplayed({ timeout: 3_000 }).catch(() => false)) {
    // Zaloguj się
    await loginScreen.setValue('jan@example.test');
    await driver.$('~login-password').setValue('SecurePass123!');
    await driver.$('~login-submit').click();
    
    // Poczekaj na przejście dalej
    await driver.waitFor('~scan-screen', { state: 'visible', timeout: 15_000 });
  }

  // Krok 2: Teraz scan screen wymaga kamery
  // System wyświetla prompt uprawnień — aplikacja powinna go obsłużyć
  const scanPrompt = await driver.$('~camera-permission-dialog');
  
  // Jeśli user odmówił — sprawdź graceful degradation
  if (await scanPrompt.isDisplayed({ timeout: 5_000 }).catch(() => false)) {
    await driver.$('~deny-permission').click();
    const errorScreen = await driver.$('~camera-unavailable');
    await expect(errorScreen).toBeVisible();
    // Sprawdź, że nadal można ręcznie wprowadzić numer zamówienia
    const manualInput = await driver.$('~order-number-input');
    await expect(manualInput).toBeVisible();
  }

  await driver.deleteSession();
});
```

### 2.4 Testowanie Deferred Deep Link (mobile marketing)

```typescript
// Deferred Deep Link — po instalacji app przekierowuje do właściwego contentu

test('użytkownik instaluje app z kampanii i trafia na właściwy ekran', async () => {
  const driver = await remote({ /* config */ });

  // Symuluj install z referrer (Android)
  // adb shell am broadcast -a com.android.vending.INSTALL_REFERRER 
  //   --es referrer "utm_source=newsletter&utm_campaign=summer_sale&utm_content=order_ord-456"

  await driver.execute('mobile: sendBroadcast', {
    action: 'com.android.vending.INSTALL_REFERRER',
    extras: {
      referrer: 'utm_source=newsletter&utm_campaign=summer_sale&utm_content=order_ord-456',
    },
  });

  // Uruchom app po raz pierwszy
  await driver.launchApp();

  // Aplikacja parsuje referrer i przekierowuje do zamówienia
  // (lub pokazuje onboarding → logowanie → zamówienie)
  
  // Sprawdź, czy marketing data jest poprawnie przekazane
  // (np. w analytics, crash reports jako context)
  const referrerLogged = await driver.execute(
    'mobile: getContextData',
    { key: 'install_referrer_campaign' }
  );
  expect(referrerLogged).toBe('summer_sale');

  await driver.deleteSession();
});
```

---

## 3. Tryb offline — cache, lokalne dane i synchronizacja

Tryb offline to stan, w którym urządzenie nie ma połączenia z internetem. Aplikacja mobilna (szczególnie PWA i natywne) musi obsłużyć ten stan: pokazać odpowiedni feedback, zapisać dane lokalnie i zsynchronizować po powrocie online.

### 3.1 Scenariusze offline

| Scenariusz | Opis | Ryzyko |
|---|---|---|
| **Cache-first loading** | Aplikacja ładuje poprzednio cached content | Stary content, niespójność z backendem |
| **Offline form submission** | Użytkownik wysyła formularz bez sieci | Utrata danych |
| **Background Sync** | Dane zapisane lokalnie, zsynchronizowane później | Konflikty, kolejność, failure recovery |
| **Offline-first architecture** | Cała aplikacja działa offline z lokalną bazą | Skalowalność, migracja, conflict resolution |
| **Intermittent connectivity** | Sieć jest niestabilna (3G, elevator, parking) | Incomplete sync, partial data |

### 3.2 Testowanie offline — Playwright (PWA / mobile web)

```typescript
// Playwright — offline simulation z fikstrą

test.describe('Offline mode — PWA', () => {
  // Scenariusz 1: Aplikacja ładuje cached content
  test('ładuje poprzednio odwiedzoną stronę bez sieci', async ({ page, context }) => {
    // Najpierw odwiedź stronę (zapisze się w cache Service Worker)
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Teraz przełącz w tryb offline
    await context.setOffline(true);
    
    await page.goto('/products');

    // Aplikacja powinna pokazać cached version
    const cachedContent = page.getByText('Produkty');
    await expect(cachedContent).toBeVisible({ timeout: 5_000 });

    // Ale powinna też pokazać, że to cached version (jeśli PWA jest dobrze napisane)
    const offlineBanner = page.getByRole('alert').or(page.getByText('Tryb offline'));
    if (await offlineBanner.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await expect(offlineBanner).toContainText('Dane mogą być nieaktualne');
    }

    await context.setOffline(false);
  });

  // Scenariusz 2: Formularz zapisany offline (Background Sync)
  test('użytkownik wypełnia formularz offline — dane zapisane lokalnie', async ({ page, context }) => {
    await context.setOffline(true);
    
    await page.goto('/order-form');
    
    // Wypełnij formularz
    await page.getByLabel('Nazwa produktu').fill('Laptop Pro 15');
    await page.getByLabel('Ilość').fill('2');
    await page.getByRole('button', { name: 'Zapisz lokalnie' }).click();

    // Sprawdź feedback — „Zapisano lokalnie"
    const savedLocally = page.getByRole('status').or(page.getByText('Zapisano lokalnie'));
    await expect(savedLocally).toBeVisible();

    // Sprawdź, że formularz jest zablokowany (nie można wysłać)
    const submitButton = page.getByRole('button', { name: 'Wyślij' });
    const isDisabled = await submitButton.isDisabled({ timeout: 3_000 }).catch(() => false);
    expect(isDisabled).toBe(true);

    // Zweryfikuj przez direct access do localStorage/IndexedDB
    const localData = await page.evaluate(() => {
      const dbRequest = indexedDB.open('orders-db', 1);
      return new Promise((resolve) => {
        dbRequest.onsuccess = () => {
          const db = dbRequest.result;
          const tx = db.transaction('orders', 'readonly');
          const store = tx.objectStore('orders');
          const getAll = store.getAll();
          getAll.onsuccess = () => resolve(getAll.result);
        };
      });
    });
    expect(localData).toHaveLength(1);
    expect(localData[0].product).toBe('Laptop Pro 15');
    expect(localData[0].status).toBe('pending-sync');

    await context.setOffline(false);
  });

  // Scenariusz 3: Synchronizacja po powrocie online
  test('po powrocie online — dane są synchronizowane z backendem', async ({ page, context }) => {
    // Setup: dane zapisane offline
    await context.setOffline(true);
    await page.goto('/order-form');
    await page.getByLabel('Nazwa produktu').fill('Laptop Pro 15');
    await page.getByRole('button', { name: 'Zapisz lokalnie' }).click();
    
    // Poczekaj na feedback
    await expect(page.getByRole('status')).toContainText('Zapisano lokalnie');

    // FAZA SYNC: Powrót online
    await context.setOffline(false);

    // Poczekaj na Background Sync (może trwać sekundy do minut)
    // Użyj poll z timeout
    await page.waitForFunction(
      () => {
        // Sprawdź status w IndexedDB
        return new Promise((resolve) => {
          const dbRequest = indexedDB.open('orders-db', 1);
          dbRequest.onsuccess = () => {
            const db = dbRequest.result;
            const tx = db.transaction('orders', 'readonly');
            const store = tx.objectStore('orders');
            const getAll = store.getAll();
            getAll.onsuccess = () => {
              const orders = getAll.result;
              resolve(orders.every(o => o.status === 'synced'));
            };
          };
        }) as Promise<boolean>;
      },
      { timeout: 30_000 }
    );

    // Zweryfikuj, że dane są na backendzie
    const response = await page.request.get('/api/orders');
    const orders = await response.json();
    expect(orders).toContainEqual(expect.objectContaining({ product: 'Laptop Pro 15' }));

    // Sprawdź status w UI
    const syncedStatus = page.getByRole('status').or(page.getByText('Zsynchronizowano'));
    await expect(syncedStatus).toBeVisible({ timeout: 10_000 });
  });

  // Scenariusz 4: Konflikt synchronizacji (local vs. server)
  test('konflikt danych — użytkownik edytował zamówienie offline, a ktoś inny je zmienił na serwerze', async ({ page, context }) => {
    // Setup: zamówienie istnieje na serwerze
    const orderId = await setupTestOrder({ status: 'pending', note: 'original' });

    // Użytkownik edytuje offline
    await context.setOffline(true);
    await page.goto(`/orders/${orderId}/edit`);
    await page.getByLabel('Notatka').fill('updated offline');
    await page.getByRole('button', { name: 'Zapisz lokalnie' }).click();

    // W międzyczasie ktoś zmienia zamówienie na serwerze (symulacja)
    await updateOrderOnServer(orderId, { note: 'changed by support' });

    // Powrót online — synchronizacja
    await context.setOffline(false);

    // Sprawdź, jak aplikacja rozwiązuje konflikt:
    // Opcja A: „Last write wins" — serwer wygrywa
    // Opcja B: „Merge" — obie wersje
    // Opcja C: „User choice" — dialog z wyborem
    // Opcja D: „Block" — nie pozwól na sync dopóki user nie rozwiąże

    const conflictDialog = page.getByRole('dialog').or(page.getByText('Konflikt danych'));
    const conflictVisible = await conflictDialog.isVisible({ timeout: 10_000 }).catch(() => false);

    if (conflictVisible) {
      // Dobrze napisana app pokazuje conflict resolution
      await expect(page.getByText('Zamówienie zostało zmienione')).toBeVisible();
      await expect(page.getByText('Twoja wersja: "updated offline"')).toBeVisible();
      await expect(page.getByText('Wersja serwera: "changed by support"')).toBeVisible();

      // Użytkownik wybiera wersję
      await page.getByRole('button', { name: 'Zachowaj moją wersję' }).click();
      await expect(page.getByLabel('Notatka')).toHaveValue('updated offline');
    }

    // Alternatywnie: app mogła wybrać „last write wins" i zaktualizować UI
    const noteField = page.getByLabel('Notatka');
    const noteValue = await noteField.inputValue();
    // Wartość może być "updated offline" lub "changed by support" — oba są OK
    expect(['updated offline', 'changed by support']).toContain(noteValue);
  });
});
```

### 3.3 Testowanie offline w aplikacji natywnej (Appium)

```typescript
// Appium — tryb offline (symulacja utraty sieci)

test('native app obsługuje utratę sieci podczas checkoutu', async () => {
  const driver = await remote({ /* config */ });

  await driver.launchApp();
  await driver.$('~orders-tab').click();

  // Przejdź do edycji zamówienia
  const firstOrder = await driver.$('~order-item-0');
  await firstOrder.click();
  const editButton = await driver.$('~edit-order');
  await editButton.click();

  // Wypełnij zmianę
  await driver.$('~order-note-input').setValue('Delivery after 18:00');

  // Symuluj utratę sieci — Android
  // Metoda 1: Ustaw tryb samolotowy (Android 10+)
  await driver.execute('mobile: setConnectionType', {
    type: 'airplane',
  });

  // Spróbuj zapisać — powinno się nie udać z odpowiednim komunikatem
  const saveButton = await driver.$('~save-button');
  await saveButton.click();

  // Sprawdź, czy app pokazuje błąd sieci
  const networkError = await driver.$('~network-error-message');
  await expect(networkError).toContainText('Brak połączenia z internetem');

  // Sprawdź, że dane nie zostały wysłane (nie ma ich na serwerze)
  const serverNote = await checkOrderOnServer(orderId);
  expect(serverNote.note).not.toBe('Delivery after 18:00');

  // Przywróć połączenie
  await driver.execute('mobile: setConnectionType', {
    type: 'wifi',
  });

  // Teraz zapisz
  await saveButton.click();

  // Sprawdź, czy zapis się udał
  await expect(driver.$('~success-message')).toContainText('Zapisano');
  
  const syncedNote = await checkOrderOnServer(orderId);
  expect(syncedNote.note).toBe('Delivery after 18:00');

  await driver.deleteSession();
});
```

---

## 4. Push notifications — testowanie na poziomie klienta

Push notifications to mechanizm re-engagement: aplikacja wysyła powiadomienie, użytkownik klika i wraca do aplikacji. Testowanie push notifications wymaga współpracy z systemem operacyjnym i backendem.

### 4.1 Scenariusze testowe push notifications

| Scenariusz | Co testujesz | Narzędzie |
|---|---|---|
| **Opt-in flow** | Użytkownik akceptuje powiadomienia | Playwright / Appium |
| **Opt-out flow** | Użytkownik odmawia lub wyłącza | Playwright / Appium |
| **Token refresh** | Token jest odnawiany po reinstallu | Backend + Appium |
| **Background notification** | Aplikacja otrzymuje notification w background | Appium |
| **Foreground notification** | App w foreground — notification handled in-app | Appium |
| **Click action** | Klik na notification → deep link do właściwego ekranu | Appium |
| **Badge count** | Aplikacja ustawia badge na ikonie | Appium |

```typescript
// Appium — testowanie push notification click → deep link

test('użytkownik klika powiadomienie o zaległej płatności i trafia na ekran zamówienia', async () => {
  const driver = await remote({ /* config */ });

  // FAZA 1: Symuluj otrzymanie push notification
  // W prawdziwym scenariuszu: backend wysyła push, urządzenie odbiera
  // W testach: używamy Firebase Console lub testowego payload

  const notificationPayload = {
    title: 'Zaległa płatność',
    body: 'Zamówienie #ord-789 wymaga płatności w ciągu 24h',
    data: {
      url: 'myapp://orders/ord-789',
      type: 'payment_reminder',
      orderId: 'ord-789',
    },
    priority: 'high',
  };

  // Symuluj otrzymanie notification przez Appium (Android)
  // Używamy notification listener lub Firebase Test Lab
  
  // Alternatywnie: push test przez Firebase Cloud Messaging Test Lab
  // gcloud firebase test android run --type instrumentation \
  //   --test-runner-class com.example.PushNotificationTest

  // FAZA 2: Symuluj klik na notification
  // Appium może wysłać intent z danymi deep link
  await driver.execute('mobile: startActivity', {
    intent: 'myapp://orders/ord-789',
    package: 'com.example.shop',
  });

  // FAZA 3: Sprawdź, czy aplikacja otworzyła właściwy ekran
  await driver.waitUntil(async () => {
    const currentActivity = await driver.getCurrentActivity();
    return currentActivity.includes('.OrderDetailActivity');
  }, { timeout: 15_000 });

  // FAZA 4: Sprawdź content ekranu
  const orderNumber = await driver.$('~order-number');
  await expect(orderNumber).toContainText('ord-789');

  const paymentStatus = await driver.$('~payment-status');
  await expect(paymentStatus).toContainText('Oczekuje na płatność');

  // FAZA 5: Sprawdź, że deadline jest widoczny
  const deadlineText = await driver.$('~deadline-warning');
  await expect(deadlineText).toContainText('24h');

  await driver.deleteSession();
});
```

---

## 5. Raport awarii mobilnej — kompletny szablon

Każda awaria mobilna wymaga raportu z konkretnymi danymi o urządzeniu i stanie systemu. Bez tych informacji reprodukcja jest niemożliwa.

```markdown
# Bug Report: [Krótki opis]

## Środowisko
| Pole | Wartość |
|---|---|
| Urządzenie | Samsung Galaxy A54 |
| OS | Android 13 (One UI 5.1) |
| Wersja aplikacji | 3.2.1 (build 2345) |
| Rozdzielczość | 1080 × 2340 px |
| Dostępna pamięć RAM | 420 MB (przed crashem) |
| Połączenie | WiFi, słaby sygnał |
| Lokalizacja | Warszawa, Polska |
| Uprawnienia | Lokalizacja ✓, Kamera ✓, Powiadomienia ✗ |

## Steps to Reproduce
1. Otwórz aplikację
2. Przejdź do "Zamówienia" → "Historia"
3. Przewiń listę do pozycji #50
4. Kliknij na zamówienie #50 (ładowanie trwa ~3s)
5. [CRASH — ANR dialog]

## Expected
Lista zamówień ładuje się płynnie, wszystkie pozycje są widoczne.

## Actual
ANR (Application Not Responding) po kliknięciu pozycji #50.

## Frequency
10/10 attempts on Samsung Galaxy A54 (Android 13)
0/10 attempts on Pixel 7 (Android 14)

## Logcat
Zalinkuj logcat z pełnym stack trace.

## Screenshot / Video
Zalinkuj screenshot ANR dialog i video (nagranie z urządzenia).

## Diagnosis
- Memory: 420 MB dostępnej pamięci podczas ładowania listy
- Lista zamówień ładuje wszystkie obrazy miniaturek jednocześnie
- Łączna pamięć thumbnaili ≈ 350 MB → OOM kill

## Suggested Fix
1. Lazy loading miniaturek (ładuj tylko visible + 5 buffer)
2. Image downsampling dla list
3. Memory-aware loading (sprawdź available memory przed ładowaniem)
4. Placeholder skeletons zamiast spinner

## Workaround
Wyłączyć obrazy w ustawieniach → działa poprawnie.
```

---

## Perspektywa Full Stack Testera

Testowanie uprawnień, deep linków i trybu offline to nie „dodatkowe testy" — to podstawowe ścieżki użytkownika, które stanowią 40-60% realnych interakcji z aplikacją mobilną. Użytkownik, który instaluje aplikację, odmawia połowy uprawnień, otwiera ją przez link z e-maila i próbuje z niej korzystać w metrze, to typowy scenariusz, nie edge case. Full stack tester, który projektuje strategię testów mobilnych bez uwzględnienia tych scenariuszy, pomija najważniejsze ryzyka.

---

## Podsumowanie

- **Uprawnienia:** Testuj trzy stany — przyznanie, odmowa, zmiana; każdy z nich musi mieć graceful degradation w UI
- **Deep linki:** Testuj każdy punkt wejścia — bez logowania, z wygasłą sesją, bez uprawnień, z nieprawidłowym ID
- **Offline mode:** Testuj cache loading, offline form submission, background sync i conflict resolution
- **Push notifications:** Opt-in, opt-out, token refresh, deep link z notification click
- **Raport awarii:** Zawsze zawiera model urządzenia, OS, wersję app, pamięć, uprawnienia, logcat, screenshot/video, steps to reproduce
- **Cykl życia:** Każdy scenariusz testuj w kontekście cyklu życia app (install → permissions → foreground → background → offline → foreground)

---

## Linki i źródła

- [Android Permissions — Best Practices](https://developer.android.com/training/permissions/handling) — oficjalny przewodnik Google dotyczący obsługi uprawnień
- [iOS Permissions — Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/permissions) — Apple guidelines dla uprawnień iOS
- [App Links (Android) — Verification](https://developer.android.com/training/app-links/verify-site-associations) — jak weryfikować App Links
- [Universal Links (iOS) — Apple Developer](https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app) — Universal Links configuration
- [Web Push API — Notifications](https://web.dev/push-notifications/) — głęboki przewodnik po push notifications dla PWA
- [Background Sync API — Google](https://developers.google.com/web/updates/2015/12/backward-is-coming) — Background Sync dla PWA offline-first
- [IndexedDB — MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) — local storage dla offline-first apps
- [Firebase Test Lab — Push Testing](https://firebase.google.com/docs/test-lab/android/push-notification-testing) — jak testować push notifications w Firebase