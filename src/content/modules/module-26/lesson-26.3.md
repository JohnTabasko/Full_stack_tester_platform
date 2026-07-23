# Emulatory, prawdziwe urządzenia i farmy urządzeń

> Testowanie mobilne wymaga podejmowania świadomych decyzji o tym, gdzie uruchamiać testy: na emulatorach, prawdziwych urządzeniach czy w chmurowej farmie urządzeń. Każda z tych opcji ma inne koszty, stabilność i pokrycie ryzyka. W tej lekcji poznasz, kiedy używać każdej z nich, jak budować macierze urządzeń i jak efektywnie zarządzać kosztami i stabilnością pipeline'u mobilnego.

## Jak czytać ten moduł

Czytaj tę lekcję przez pryzmat decyzji inwestycyjnych. Każda opcja (emulator, real device, device farm) ma swoją cenę i swoją wartość. Celem jest nie znalezienie „najlepszej" opcji, lecz znalezienie najlepszego kompromisu dla Twojego produktu, budżetu i ryzyka. Emulator jest szybki i tani, ale nie pokazuje wszystkiego. Realne urządzenie jest najdokładniejsze, ale droższe i wolniejsze. Device farm łączy skalę z kosztem, ale wymaga zarządzania sesjami i konfiguracji.

Trzy zasady lekcji:

1. **Emulator ≠ real device.** Emulator jest wystarczający dla szybkiego feedbacku, ale nie zastępuje realnych urządzeń dla krytycznych ścieżek.
2. **Macierz urządzeń wynika z danych.** Analizuj analytics, crash reports i support tickets, zanim zbudujesz macierz.
3. **Device farm jest narzędziem, nie strategią.** Farmę używa się do zwiększania pokrycia, nie do zastępowania myślenia o ryzyku.

---

## Cel lekcji

Ta lekcja koncentruje się na: **kiedy używać emulatorów, kiedy prawdziwych urządzeń, BrowserStack/Sauce Labs, macierz urządzeń, koszty i stabilność pipeline'u mobilnego**. Główne ryzyko: **zespół testuje tylko na jednym emulatorze, a problemy wydajności, klawiatury, sieci i sprzętu pojawiają się dopiero u użytkowników**. Po lekturze powinieneś umieć zaprojektować macierz urządzeń opartą na danych, skonfigurować Appium z device farm i zarządzać kompromisami między kosztem, pokryciem i szybkością.

**Perspektywa Full Stack Testera:** Full stack tester rozumie, że każde urządzenie w macierzy ma swój koszt — finansowy i czasowy. Inteligentne zarządzanie macierzą oznacza wybieranie urządzeń, które najlepiej pokrywają ryzyko przy minimalnym koszcie. Tanie rozwiązanie nie jest dobre, jeśli nie pokrywa ryzyka. Droższe rozwiązanie nie jest dobre, jeśli pokrywa ryzyka, których nie ma.

---

## Sytuacja przewodnia

Aplikacja działa dobrze na emulatorze Pixel 7 z Androidem 14, ale na starszym iPhonie 8 checkout jest wolny, a na Xiaomi Redmi z małą pamięcią aplikacja crashuje przy ładowaniu listy produktów. Zespół nie wie, które urządzenia powinien testować, ile urządzeń jest wystarczająco i jak zarządzać kosztami testów na realnych urządzeniach.

---

## 1. Emulatory — kiedy i dlaczego

Emulator to program, który symuluje urządzenie mobilne na komputerze. Android emulator (AVD) i iOS Simulator to najpopularniejsze opcje. Są szybkie, tanie i łatwe do zintegrowania z CI.

### 1.1 Zalety emulatorów

| Zaleta | Opis |
|---|---|
| **Szybkość uruchomienia** | Emulator startuje w 30-60s; real device wymaga podłączenia i setupu |
| **Niski koszt** | Za darmo (Android SDK, Xcode); real device farm kosztuje setki $/miesiąc |
| **Repeatability** | Ten sam emulator zawsze zachowuje się tak samo; real device może się zużywać |
| **CI-friendly** | Łatwo uruchomić w CI (docker image dla Android emulator) |
| **Determinizm** | Brak zmiennych sprzętowych (GPU, RAM, bateria); testujesz dokładnie to samo |

### 1.2 Ograniczenia emulatorów

| Ograniczenie | Konsekwencja |
|---|---|
| **Nie oddaje realnej wydajności** | Aplikacja działa szybciej na emulatorze (desktop CPU > mobile CPU) |
| **Nie oddaje realnej pamięci** | Desktop RAM jest większy; OOM issues nie są widoczne |
| **Nie obsługuje wszystkich sensorów** | GPS emulowany, ale Bluetooth, NFC, kamera nie działają w pełni |
| **Różnice w WebView/Chrome** | Emulator używa innej wersji WebView niż realne urządzenie |
| **Animacje UI są szybsze** | 60fps vs. realne 30-60fps; timing issues niewidoczne |
| **Gestures touch są uproszczone** | Multi-touch nie działa tak jak na real device |
| **Nie testuje App Store distribution** | Instalacja APK/IPA bezpośrednio ≠ instalacja ze sklepu |

### 1.3 Konfiguracja emulatorów

**Android emulator — uruchomienie i konfiguracja:**

```bash
# Instalacja Android SDK components
export ANDROID_HOME=~/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools

# Lista dostępnych emulatorów
emulator -list-avds
# Output: Pixel_7_API_34, Pixel_7_API_33, Pixel_6_API_33

# Uruchom emulator w tle (bez GUI)
emulator -avd Pixel_7_API_34 \
  -no-window \
  -no-audio \
  -gpu swiftshader \
  -memory 2048 \
  -partition-size 1024 \
  -wipe-data &

# Poczekaj na boot
adb wait-for-device shell 'while [[ -z $(getprop sys.boot_completed) ]]; do sleep 1; done'

# Zainstaluj APK
adb install ./apps/shop-android-debug.apk

# Uruchom aplikację
adb shell am start -n com.example.shop/.MainActivity

# Sprawdź logcat
adb logcat | grep -i "appium\|shop\|error"
```

**iOS Simulator — uruchomienie:**

```bash
# Lista dostępnych simulatorów
xcrun simctl list devices available | grep -E "iPhone|iPad"

# Uruchom iPhone 14 simulator
xcrun simctl boot "iPhone 14"
open -a Simulator

# Zainstaluj IPA (Appium obsłuży to automatycznie)
xcrun simctl install booted ./apps/shop-ios.ipa

# Zresetuj urządzenie (czyste dane)
xcrun simctl erase booted
```

**Playwright — konfiguracja emulatorów:**

```typescript
// playwright.config.ts — mobile web z emulatorami
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/mobile',
  timeout: 30_000,
  use: {
    baseURL: 'https://shop.example.com',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    // Emulatory — PR fast feedback
    {
      name: 'emulator-android-14',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 412, height: 915 },
      },
    },
    {
      name: 'simulator-ios-17',
      use: {
        ...devices['iPhone 14'],
        viewport: { width: 390, height: 844 },
      },
    },
    // Low-end Android emulator (CI/CD)
    {
      name: 'emulator-android-13-low-end',
      use: {
        browserName: 'chromium',
        viewport: { width: 360, height: 640 },
        // Symulacja wolnego CPU przez throttling
      },
    },
  ],
});
```

**Appium — konfiguracja emulatorów:**

```typescript
// appium-emulator.config.ts — Appium z emulatorami
const EMULATOR_CAPS = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'Pixel_7_API_34', // nazwa AVD
  'appium:platformVersion': '14',
  'appium:app': './apps/shop-android-debug.apk',
  'appium:autoGrantPermissions': false,
  'appium:noReset': false,
  'appium:avd': 'Pixel_7_API_34', // auto-start emulator
  'appium:avdArgs': [
    '-no-window',
    '-no-audio',
    '-gpu', 'swiftshader',
    '-memory', '2048',
  ],
  'appium:newCommandTimeout': 30_000,
};

// xcrun simctl boot "iPhone 14"
// Uruchom Appium z UDID symulatora
const IOS_SIMULATOR_CAPS = {
  platformName: 'iOS',
  'appium:automationName': 'XCUITest',
  'appium:deviceName': 'iPhone 14',
  'appium:platformVersion': '17',
  'appium:app': './apps/shop-ios.ipa',
  'appium:udid': 'auto', // Appium automatycznie znajdzie iPhone 14 simulator
  'appium:autoAcceptAlerts': true,
  'appium:noReset': false,
};
```

### 1.4 Kiedy emulator jest wystarczający

Emulator jest dobrym wyborem dla:

- **Smoke tests na PR:** Szybki feedback, czy podstawowa funkcjonalność działa
- **Testy UI mobile web:** Viewport, touch emulation, geolocation — Playwright emuluje to dobrze
- **Testy PWA:** Service worker caching, offline simulation — działają na emulatorze
- **Debugowanie w trakcie developmentu:** Szybka pętla feedbacku przed commitowaniem
- **Testy API backendu:** Bez znaczenia, czy klient jest mobile czy desktop

---

## 2. Prawdziwe urządzenia — kiedy i dlaczego

Realne urządzenia ujawniają problemy, których emulator nie widzi. Są wolniejsze, droższe i mniej deterministyczne, ale ich wartość diagnostyczna jest nieoceniona.

### 2.1 Problemy widoczne tylko na realnych urządzeniach

| Problem | Dlaczego emulator nie widzi | Jak się objawia |
|---|---|---|
| **Performance regression** | Desktop CPU jest szybszy niż mobile CPU | Ładowanie strony: 3s desktop vs. 12s real device |
| **OOM (Out of Memory)** | Desktop RAM jest większy; emulator ma więcej pamięci | Crash przy ładowaniu listy 100 elementów na Xiaomi z 3GB RAM |
| **Thermal throttling** | Emulator nie nagrzewa się | Aplikacja zwalnia po 5 minutach intensywnego użycia |
| **GPU rendering** | Desktop GPU vs. mobile GPU (Adreno, Mali, Apple GPU) | Animacje szarpane, cienie nie renderują się |
| **Touch target size** | Emulator używa myszy | Przyciski za małe na real touch |
| **Keyboard overlap** | Emulator keyboard jest mniejszy | Pole hasła zasłonięte klawiaturą na real device |
| **Background execution** | Emulator nie ma trybu uśpienia | Powiadomienia push nie dochodzą |
| **Carrier-specific issues** | Brak SIM w emulatorze | Problemy z SMS OTP, roaming |
| **Bluetooth/NFC** | Nie emulowane | NFC payment nie działa |

### 2.2 Strategia użycia realnych urządzeń

```markdown
## Macierz realnych urządzeń — zasady selekcji

### Segmentacja użytkowników
1. Top 3 modele → zawsze testuj (pokrywają > 60% użytkowników)
2. Starsze modele (2-3 lata) → testuj, jeśli > 10% użytkowników
3. Low-end devices → testuj dla performance regression

### Strategia real device testing

| Cel | Urządzenia | Kiedy | Co testujesz |
|---|---|---|---|
| **Smoke na real devices** | 1 Android top + 1 iOS top | PR / codziennie | Happy path, instalacja, crash |
| **Critical path** | Top 3 Android + Top 3 iOS | Nightly | Główne przepływy użytkownika |
| **Full regression** | Pełna macierz (8-12 urządzeń) | Przed release | Wszystkie krytyczne ścieżki |
| **Performance** | Top device + low-end | Przed release | Timing, memory, battery |

### Konfiguracja real device w Appium

```typescript
// Appium caps dla realnego urządzenia Android (USB debugging)
const REAL_DEVICE_CAPS = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  // UDID urządzenia — znajdziesz przez `adb devices`
  'appium:udid': 'RF8N123456AB', // konkretny Samsung Galaxy A54
  'appium:platformVersion': '13', // wersja Androida na tym urządzeniu
  'appium:app': './apps/shop-android-debug.apk',
  'appium:autoGrantPermissions': false,
  'appium:noReset': false,
  // Security — Appium wymaga adb reverse na real device
  'appium:remoteADBPath': '/usr/local/bin/adb',
};

// iOS real device
const IOS_REAL_DEVICE_CAPS = {
  platformName: 'iOS',
  'appium:automationName': 'XCUITest',
  // UDID — znajdziesz przez Xcode lub iTunes
  'appium:udid': '00001234-0000123456789012', // konkretny iPhone 14 Pro
  'appium:platformVersion': '17',
  'appium:bundleId': 'com.example.shop',
  'appium:realDeviceLogger': '/usr/local/lib/node_modules/deviceconsole',
};
```

### 2.3 Lokalne zarządzanie realnymi urządzeniami

```bash
# ADB — Android Debug Bridge
adb devices
# Lista urządzeń: serial number, state (device/offline/no device)

# Przekierzenie portów (wymagane dla Appium na real device)
adb reverse tcp:4723 tcp:4723

# Pobieranie logcat
adb logcat -d > device-logcat-$(date +%Y%m%d-%H%M%S).log
adb logcat -d --thread-time | grep -E "FATAL|Exception|ANR"

# Informacje o urządzeniu
adb shell getprop ro.product.model
adb shell getprop ro.build.version.release
adb shell dumpsys meminfo com.example.shop

# Instalacja app
adb install -r ./apps/shop-android-debug.apk
adb install --instant ./apps/shop-android-debug.apk # faster

# Czyszczenie danych app
adb shell pm clear com.example.shop
adb shell am force-stop com.example.shop

# Screenshot z urządzenia
adb exec-out screencap -p > screenshot-$(date +%s).png
```

---

## 3. Device farms — BrowserStack, Sauce Labs, Firebase Test Lab

Device farm to usługa chmurowa, która udostępnia setki realnych urządzeń przez przeglądarkę lub API. Eliminuje konieczność kupowania i utrzymywania fizycznych urządzeń.

### 3.1 Porównanie głównych providerów

| Provider | Siła | Słabość | Ceny (orientacyjne) |
|---|---|---|---|
| **BrowserStack App Automate** | Świetny UX, Live Testing, wieloplatformowość | Wyższa cena | ~$100-500/miesiąc za mały plan |
| **Sauce Labs** | Enterprise features, CI integration, security | UI mniej intuicyjny | ~$150-600/miesiąc |
| **Firebase Test Lab** | Głęboka integracja z Android, free tier | Tylko Android + iOS basic, mniej UX | Free tier + ~$5/device-hour |
| **AWS Device Farm** | Integracja z AWS, native + web | Mniej popularny, gorszy UX | ~$0.17/device-minute |
| **LambdaTest** | Tanie, cross-browser mobile web | Mniej urządzeń niż BrowserStack | ~$50-200/miesiąc |

### 3.2 BrowserStack App Automate — konfiguracja

```bash
# BrowserStack — wymagane credentials
export BROWSERSTACK_USERNAME="jan.kowalski123"
export BROWSERSTACK_ACCESS_KEY="abc123xyz789"

# lub w credentials file: ~/.browserstack/config.json
```

```typescript
// appium-browserstack.config.ts — Appium + BrowserStack

export const BROWSERSTACK_CONFIG = {
  'browserstack.user': process.env['BROWSERSTACK_USERNAME'],
  'browserstack.key': process.env['BROWSERSTACK_ACCESS_KEY'],
  'browserstack.app': 'bs://<app-hash>', // App hash z BrowserStack dashboard
  'browserstack.networkLogs': true,
  'browserstack.video': true,
  'browserstack.debug': true, // console logs z WebDriver
  'browserstack.appiumVersion': '4.0.0', // wersja Appium na farmie
};

// App URL z BrowserStack — możesz uploadować APK/IPA przez API
// curl -u "username:key" -X POST "https://api.browserstack.com/app-automate/upload"
// Odpowiedź: { "app_url" : "bs://c8992a5a..." }

// Macierz urządzeń na BrowserStack
const BS_DEVICE_MATRIX = [
  { device: 'Samsung Galaxy S23', os_version: '13', browser: 'chrome' },
  { device: 'Google Pixel 7', os_version: '14', browser: 'chrome' },
  { device: 'iPhone 14', os_version: '16', browser: 'safari' },
  { device: 'Samsung Galaxy A54', os_version: '13', browser: 'chrome' },
  { device: 'Xiaomi Redmi Note 12', os_version: '12', browser: 'chrome' },
];

// Test runner z BrowserStack
import { remote } from 'webdriverio';

async function runOnBrowserStack(deviceConfig: typeof BS_DEVICE_MATRIX[0]) {
  const caps = {
    ...BROWSERSTACK_CONFIG,
    'bstack:options': {
      deviceName: deviceConfig.device,
      osVersion: deviceConfig.os_version,
      deviceOrientation: 'portrait',
      realMobile: true,
      local: false,
    },
    'goog:chromeOptions': {
      mobileEmulation: { deviceName: deviceConfig.device },
    },
  };

  const driver = await remote({
    hostname: 'hub-cloud.browserstack.com',
    port: 443,
    protocol: 'https',
    path: '/wd/hub',
    capabilities: caps,
  });

  return driver;
}

// GitHub Actions z BrowserStack
// .github/workflows/mobile-app-tests.yml
/*
name: Mobile App Tests — BrowserStack

on:
  schedule:
    - cron: '0 2 * * *' # nightly at 2 AM
  pull_request:
    branches: [main]

jobs:
  browserstack-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        device: ['Pixel7-android14', 'iPhone14-ios17', 'GalaxyA54-android13']
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm ci
      - name: Start Appium server
        run: docker run -d -p 4723:4723 appium/appium
      - name: Run Appium tests on BrowserStack
        run: npx wdio wdio.conf.ts --device=${{ matrix.device }}
        env:
          BROWSERSTACK_USER: ${{ secrets.BS_USER }}
          BROWSERSTACK_KEY: ${{ secrets.BS_KEY }}
      - name: Upload BrowserStack results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: bs-test-results-${{ matrix.device }}
          path: |
            test-results/
            logs/
            video.mp4
*/
```

### 3.3 Sauce Labs — konfiguracja

```typescript
// appium-saucelabs.config.ts — Appium + Sauce Labs

export const SAUCE_LABS_CONFIG = {
  username: process.env['SAUCE_USERNAME'], // 'jan-kowalski'
  accessKey: process.env['SAUCE_ACCESS_KEY'],
  // lub偏远: 'ondemand.saucelabs.com'
  hostname: 'ondemand.us-west-1.saucelabs.com',
  port: 443,
  
  capabilities: {
    // Data Center (US/EU/AP)
    'dataCenter': 'us-west-1',
    
    // App upload — uploaduj APK/IPA do Sauce Storage
    // lub użyj url: 'sauce-storage:my-app.apk'
    'app': 'sauce-storage:shop-android-debug.apk',
    
    // Device configuration
    'platformName': 'Android',
    'deviceName': 'Google Pixel 7',
    'platformVersion': '14',
    'automationName': 'UiAutomator2',
    
    // Sauce Labs specific
    'sauce:options': {
      appiumVersion: '4.0.0',
      build: process.env['GITHUB_RUN_NUMBER'],
      tags: ['ci', 'nightly'],
      'tunnel-identifier': process.env['GITHUB_RUN_ID'],
    },
    
    // Video i logs
    'videoUploadOnPass': true,
    'extendedDebugging': true,
  },
};

// Sauce Labs — can-i-deploy (sprawdzenie, czy build przejdzie przez all tests)
import axios from 'axios';

async function checkCanIDeploy(pactBrokerUrl: string, environment: string) {
  const response = await axios.get(`${pactBrokerUrl}/can-i-deploy`, {
    params: {
      pacticipant: 'shop-mobile-app',
      version: process.env['GIT_COMMIT'],
      environment,
    },
    auth: {
      username: process.env['PACT_BROKER_USER'],
      password: process.env['PACT_BROKER_KEY'],
    },
  });
  return response.data.allowed;
}
```

### 3.4 Firebase Test Lab — Android-first

```bash
# Firebase Test Lab — CLI
# Wymaga: Google Cloud SDK + Firebase CLI

# Uruchom testy na Device Farm Google
gcloud firebase test android run \
  --app ./apps/shop-android-debug.apk \
  --device model=Pixel7,version=14,locale=pl_PL,orientation=portrait \
  --device model=GalaxyA54,version=13,locale=pl_PL,orientation=portrait \
  --device model=XiaomiRedmiNote12,version=12,locale=pl_PL,orientation=portrait \
  --test ./tests/android-instrumentation.apk \
  --timeout 300s \
  --results-dir=gs://my-bucket/firebase-results/$(date +%Y%m%d) \
  --num-flaky-test-attempts=2

# Pobierz wyniki
gsutil -m cp -r gs://my-bucket/firebase-results/latest ./firebase-results

# Raport HTML
# https://console.firebase.google.com/project/my-project/testlab
```

```typescript
// Firebase Test Lab — wyniki z API
import { GoogleTestLab } from '@google-cloud/test-lab';

async function fetchTestResults(projectId: string, resultId: string) {
  const testLab = new GoogleTestLab();
  
  const results = await testLab.getTestResults(projectId, resultId);
  
  for (const outcome of results.testOutcomes) {
    console.log(`${outcome.testSuiteId} — ${outcome.outcome}`);
    if (outcome.outcome === 'failed') {
      console.log(`  Stack trace: ${outcome.stackTrace}`);
      console.log(`  Screenshot: ${outcome.toolOutputSequence?.find(o => o.type === 'SCREENSHOT')?.downloadUrl}`);
    }
  }
}
```

### 3.5 Optymalizacja kosztów device farm

Device farm może być droga. Oto strategie optymalizacji:

```markdown
## Strategie redukcji kosztów device farm

### 1. Sharding — równomierny podział testów
Nie uruchamiaj wszystkich testów na wszystkich urządzeniach. Podziel testy na shardy i uruchamiaj równolegle.

```yaml
# GitHub Actions — parallel sharding
strategy:
  matrix:
    shard: [1, 2, 3, 4]
    device: ['pixel7-android14', 'iphone14-ios17']
    
steps:
  - name: Run shard ${{ matrix.shard }}
    run: npx playwright test --shard=${{ matrix.shard }}/${{ matrix.device }}
```

### 2. Retries na farmie — nie na każdym urządzeniu
Retry flaky tests na tym samym urządzeniu, nie na nowym.

```
❌ Źle: 3 urządzenia × 3 retries = 9x cost
✅ Dobrze: 3 urządzenia, retry na tym samym urządzeniu = 3x cost
```

### 3. Smart device selection
Nie testuj wszystkiego na wszystkim. Testuj:
- Smoke: top 2 urządzenia (najszybszy feedback)
- Critical: top 5 urządzeń (najważniejsze ryzyka)
- Regression: full matrix (przed release)

### 4. Scheduling
Uruchamiaj full matrix rzadziej (przed release), nie na każdym PR.

```
PR: smoke na emulator + 2 real devices
Nightly: critical path na 5 real devices
Release: full matrix na 10+ real devices
```

### 5. Free tier usage
- Firebase Test Lab: free tier 10 device-hours/dzień (Android)
- BrowserStack: free试用 z ograniczonymi urządzeniami
- LambdaTest: free tier mobile web

### 6. Self-hosted farm (opcja dla dużych organizacji)
- OpenSTF / STF (Smartphone Test Farm) — open source
- Ut维护 koszty: serwer + urządzenia + admina
- Warto dla > 20 urządzeń i > 100h miesięcznie testów
```

---

## 4. Macierz urządzeń — praktyczny przewodnik budowania

### 4.1 Proces budowania macierzy

```
Krok 1: Zbierz dane o użytkownikach
  ↓ analytics: top devices, OS versions, screen sizes
Krok 2: Zbierz dane o problemach
  ↓ crash reports, support tickets, feedback
Krok 3: Zidentyfikuj ryzyka specyficzne dla produktu
  ↓ np. NFC payment (wymaga realnego urządzenia)
Krok 4: Wybierz urządzenia do macierzy
  ↓ kryterium: > 5% użytkowników LUB known issues
Krok 5: Podziel na warstwy (PR / nightly / release)
  ↓ kryterium: krytyczność × częstotliwość
Krok 6: Zdefiniuj workflow CI/CD dla każdej warstwy
```

### 4.2 Przykładowa macierz dla aplikacji e-commerce

```markdown
## Macierz urządzeń — Sklep e-commerce

### Źródło danych
- Analytics: top 10 urządzeń = 85% sesji
- Crash reports: Xiaomi Redmi Note 11 — 40% crashy
- Support: iPhone 8 — problemy z checkoutem na iOS 15

### Macierz PR (fast feedback, ~5-10 min)
| Urządzenie | OS | Typ | Pokrycie |
|---|---|---|---|
| Pixel 7 emulator | Android 14 | Emulator | 22% użytkowników |
| iPhone 14 simulator | iOS 17 | Emulator | 18% użytkowników |
| Samsung Galaxy A54 real | Android 13 | Real | 8% użytkowników |

### Macierz Nightly (regular coverage, ~20-30 min)
| Urządzenie | OS | Typ | Pokrycie | Uzasadnienie |
|---|---|---|---|---|
| Pixel 7 real | Android 14 | Real | 22% | Top Android |
| iPhone 14 real | iOS 17 | Real | 18% | Top iOS |
| Samsung Galaxy A54 real | Android 13 | Real | 8% | Mid-range |
| iPhone 12 real | iOS 16 | Real | 7% | Older iOS |
| Xiaomi Redmi Note 11 real | Android 13 | Real | 6% | High crash rate |

### Macierz Release (full coverage, ~60-90 min)
| Urządzenie | OS | Typ | Pokrycie | Uzasadnienie |
|---|---|---|---|---|
| Wszystkie z nightly | | | | |
| Samsung Galaxy S23 Ultra | Android 14 | Real | 3% | High-end GPU |
| iPhone 11 | iOS 15 | Real | 4% | Older iOS (support issue) |
| Xiaomi Redmi 12 real | Android 12 | Real | 3% | Low-end, 3GB RAM |
| Samsung Galaxy Tab S8 | Android 13 | Real | 2% | Tablet |
| Huawei P30 (bez GMS) | Android 10 | Real | 1% | Edge case — brak Google |

### Macierz specjalna (sporadycznie)
| Urządzenie | OS | Cel |
|---|---|---|
| iPhone 8 | iOS 14 | Sprawdzić checkout na iOS 15 compatibility |
| Samsung Galaxy S20 | Android 12 | Sprawdzić WebView rendering |
| OnePlus 9 | Android 13 | High-performance reference |

### Kryteria review macierzy (co kwartał)
- [ ] Czy top 3 urządzenia nadal pokrywają > 50% użytkowników?
- [ ] Czy nowe urządzenia (nowy top sprzedawca) zostały dodane?
- [ ] Czy urządzenia z crash reports są uwzględnione?
- [ ] Czy urządzenia z support tickets są uwzględnione?
- [ ] Czy macierz Release nie przekracza 90 minut łącznego czasu?
```

### 4.3 Automatyzacja generowania macierzy z analytics

```typescript
// utils/device-matrix.ts — generowanie macierzy z danych analytics
import { google } from 'googleapis';

type DeviceStats = {
  device: string;
  os: string;
  sessions: number;
  conversionRate: number;
  crashRate: number;
};

async function buildDeviceMatrixFromAnalytics(propertyId: string): Promise<DeviceStats[]> {
  const analytics = google.analyticsdata('v1beta');
  const auth = await google.auth.getClient({ zakress: ['https://www.googleapis.com/auth/analytics.readonly'] });

  const response = await analytics.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dimensions: [{ name: 'deviceCategory' }, { name: 'deviceModel' }, { name: 'operatingSystemVersion' }],
      metrics: [
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
      ],
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    },
  });

  const totalSessions = response.data.rows?.reduce(
    (sum, row) => sum + Number(row.metricValues?.[0]?.value), 0
  ) || 0;

  return (response.data.rows || []).map(row => ({
    device: row.dimensionValues?.[1]?.value || '',
    os: row.dimensionValues?.[2]?.value || '',
    sessions: Number(row.metricValues?.[0]?.value),
    sessionShare: Number(row.metricValues?.[0]?.value) / totalSessions,
    bounceRate: Number(row.metricValues?.[2]?.value),
  })).sort((a, b) => b.sessions - a.sessions);
}

async function selectDevicesForMatrix(stats: DeviceStats[]): Promise<DeviceStats[]> {
  // Weź top 10 urządzeń, które pokrywają 80%+ użytkowników
  const selected: DeviceStats[] = [];
  let coverage = 0;

  for (const device of stats) {
    if (coverage >= 0.80 && selected.length >= 8) break;
    selected.push(device);
    coverage += device.sessionShare;
  }

  // Dodaj low-end devices z wysokim crash rate (nawet jeśli mało użytkowników)
  const highCrashDevices = stats.filter(d => d.crashRate > 5 && !selected.includes(d));
  selected.push(...highCrashDevices.slice(0, 2));

  return selected;
}
```

---

## 5. Pipeline mobilny — organizacja testów

### 5.1 Trójwarstwowy pipeline

```yaml
name: Mobile Testing Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
  schedule:
    - cron: '0 3 * * *' # nightly 3 AM

env:
  APPIUM_HOST: localhost
  BROWSERSTACK_USER: ${{ secrets.BS_USER }}
  BROWSERSTACK_KEY: ${{ secrets.BS_KEY }}

jobs:
  # === WARSTWA 1: PR — szybki feedback ===
  pr-mobile-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test tests/mobile/smoke.spec.ts
        env:
          BASE_URL: ${{ vars.STAGING_URL }}
          PROJECT_ID: ${{ vars.ANALYTICS_PROPERTY }}

  pr-app-emulator:
    runs-on: ubuntu-latest
    services:
      appium:
        image: appium/appium:latest
        ports:
          - 4723:4723
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm ci
      - run: npm run appium:smoke
        env:
          APPIUM_HOST: appium
          DEVICE: 'pixel7-android14-emulator'

  # === WARSTWA 2: NIGHTLY — regular coverage ===
  nightly-android-browserstack:
    runs-on: ubuntu-latest
    if: github.event_name == 'schedule'
    strategy:
      matrix:
        device: ['pixel7-android14', 'galaxy-a54-android13', 'redmi-note11-android13']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm ci
      - name: Run Appium tests on BrowserStack
        run: npx wdio wdio.bs.conf.ts --device=${{ matrix.device }}
        env:
          BROWSERSTACK_USER: ${{ secrets.BS_USER }}
          BROWSERSTACK_KEY: ${{ secrets.BS_KEY }}
      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: bs-nightly-${{ matrix.device }}
          path: test-results/

  nightly-ios-browserstack:
    runs-on: ubuntu-latest
    if: github.event_name == 'schedule'
    strategy:
      matrix:
        device: ['iphone14-ios17', 'iphone12-ios16']
    steps:
      # ... podobne do android

  # === WARSTWA 3: RELEASE — full matrix ===
  release-full-matrix:
    needs: [nightly-android-browserstack, nightly-ios-browserstack]
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    strategy:
      matrix:
        include:
          - device: 'pixel7-android14'
          - device: 'galaxy-s23-android14'
          - device: 'xiaomi-redmi12-android12'
          - device: 'iphone14-ios17'
          - device: 'iphone11-ios15'
          - device: 'ipad-air-ipados17'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm ci
      - name: Full matrix on BrowserStack
        run: npx wdio wdio.bs.conf.ts --device=${{ matrix.device }}
        env:
          BROWSERSTACK_USER: ${{ secrets.BS_USER }}
          BROWSERSTACK_KEY: ${{ secrets.BS_KEY }}
      - name: Publish HTML report
        uses: actions/upload-artifact@v4
        with:
          name: release-report-${{ matrix.device }}
          path: playwright-report/
```

### 5.2 Artefakty przy awarii mobilnej

```markdown
## Artefakty wymagane przy awarii testu mobilnego

Każdy nieudany test na realnym urządzeniu powinien generować:

1. **Screenshot** — Playwright/Appium robi to automatycznie
2. **Video** — nagranie całego testu (ważne dla flaky tests)
3. **Logcat / syslog** — logi systemowe z momentu awarii
   ```bash
   adb logcat -d > test-results/logcat-${{ matrix.device }}.log
   ```
4. **Device info** — model, OS, wersja app, pamięć
   ```bash
   adb shell getprop ro.product.model
   adb shell getprop ro.build.version.release
   adb shell dumpsys meminfo com.example.shop
   ```
5. **Network logs** — HAR file z requestami
6. **Accessibility tree dump** — hierarchia UI w momencie awarii
   ```bash
   adb shell uiautomator dump /sdcard/ui-dump.xml
   adb pull /sdcard/ui-dump.xml
   ```

## Struktura raportu awarii mobilnej

```markdown
# Bug Report: Checkout crash na Xiaomi Redmi Note 11

## Środowisko
- Urządzenie: Xiaomi Redmi Note 11
- OS: Android 13 (MIUI 14.0.4)
- App version: 3.2.1 (build 1234)
- RAM: 3 GB (dostępne: 420 MB podczas crasha)

## Steps to Reproduce
1. Otwórz aplikację
2. Przejdź do katalogu (lista 50+ produktów)
3. Dodaj produkt do koszyka
4. Przejdź do checkoutu
5. Kliknij "Zapłać"

## Expected
Ekran płatności się ładuje.

## Actual
App crashuje z ANR (Application Not Responding).

## Logs
[Zalinkuj logcat z artefaktów]

## Screenshot / Video
[Zalinkuj screenshot i video z artefaktów]

## Analysis
RAM usage podskoczył do 2.9 GB przy ładowaniu listy produktów.
Checkout wymaga dodatkowych 300 MB → OOM kill przez system.

## Suggested fix
- Lazy loading dla listy produktów
- Image compression dla thumbnaili
- Memory profiling na low-end devices
```

---

## Perspektywa Full Stack Testera

Zarządzanie macierzą urządzeń i device farmami to umiejętność, która odróżnia doświadczonego testera mobilnego od kogoś, kto „testuje na telefonie". Wymaga zrozumienia kosztów, korzyści, danych analitycznych i strategii wydawniczej. Full stack tester, który potrafi zaprojektować macierz urządzeń, skonfigurować pipeline i zarządzać kosztami device farm, jest bardzo cenny na rynku pracy — to kompetencja, której nie nauczysz się z dokumentacji, tylko z praktyki.

---

## Podsumowanie

- **Emulatory:** Szybkie, tanie, CI-friendly — wystarczające dla smoke tests i mobile web/PWA; nie pokazują problemów sprzętowych i wydajnościowych
- **Realne urządzenia:** Najdokładniejsze — pokazują OOM, thermal throttling, GPU issues, touch target problems; wymagane dla krytycznych ścieżek
- **Device farm:** BrowserStack/Sauce Labs/Firebase Test Lab — skala bez utrzymywania fizycznych urządzeń; optymalizuj przez sharding, scheduling i smart selection
- **Macierz urządzeń:** Buduj z danych (analytics + crash reports + support), nie z listy możliwości; trójwarstwowa (PR/nightly/release)
- **Pipeline mobilny:** Trójwarstwowy z coraz szerszym pokryciem; każda warstwa ma swoje urządzenia, testy i częstotliwość
- **Artefakty przy awarii:** Screenshot + video + logcat + device info + network logs + accessibility tree = pełny kontekst do debugowania

---

## Linki i źródła

- [Android Emulator — Performance Best Practices](https://developer.android.com/studio/run/emulator-best-practices) — jak przyspieszyć emulator i poprawić stabilność
- [iOS Simulator — Xcode](https://developer.apple.com/documentation/xcode/install-and-configure-xcode-to-run-your-app-on-devices-and-simulators) — konfiguracja iOS Simulator
- [BrowserStack App Automate — Documentation](https://www.browserstack.com/docs/app-automate) — pełna dokumentacja BrowserStack z przykładami capabilities
- [Sauce Labs — Real Device Cloud](https://docs.saucelabs.com/mobile-apps/real-devices/) — konfiguracja real device testing w Sauce Labs
- [Firebase Test Lab — Pricing](https://firebase.google.com/docs/test-lab/android/model-based-testing#pricing) — cennik Firebase Test Lab z free tier
- [STF — Open Source Device Farm](https://github.com/DeviceFarmer/stf) — Self-hosted alternative do BrowserStack
- [Mobile Testing Strategy — Angie Jones](https://www.angiejones.tech/) — praktyczne podejście do strategii mobile testing
---

## Artefakty z farm urządzeń

Test na realnym urządzeniu powinien zostawiać artefakty:

- video;
- screenshot;
- Appium server log;
- device logs / logcat;
- network logs, jeśli dostępne;
- capabilities sesji;
- nazwa urządzenia i wersja OS.

Bez tych danych awaria na farmie jest trudna do odtworzenia lokalnie.

## Dane testowe na device farm

Device farm współdzieli urządzenia między testami i zespołami. Test powinien zakładać brudny stan urządzenia i sam przygotować aplikację: install/reset/login/cleanup. Nie polegaj na stanie pozostawionym przez poprzedni test.

## 📘 Suplement Inżynieryjny 2026: Testowanie Mobilne (Appium 2)
*Inspiracja: „Scalable Test Automation with Playwright” (2026), Chapter 6*
*   **Appium 2 Driver Lifecycle**: Przy automatyzacji aplikacji natywnych za pomocą Appium 2, dbaj o efektywne zarządzanie cyklem życia sterowników oraz zbieranie artefaktów (zrzuty pamięci, logi systemowe ADB/Xcode) bezpośrednio do rurociągu testowego.
