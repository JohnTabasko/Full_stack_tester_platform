# Konfiguracja playwright.config.ts — omówienie szczegółowe

## Cel lekcji
Dogłębne poznanie możliwości pliku konfiguracyjnego, który pozwala na dostosowanie Playwrighta do specyfiki Twojej aplikacji i infrastruktury CI.

## 1. Globalne timeouty
W Playwright mamy kilka rodzajów limitów czasu, które konfigurujemy w obiekcie `defineConfig`:
- `timeout`: Czas trwania całego testu (domyślnie 30s).
- `expect`: Czas na spełnienie asercji web-first (domyślnie 5s).
- `actionTimeout`: Czas na pojedynczą akcję, jak kliknięcie.
- `navigationTimeout`: Czas na załadowanie strony przez `page.goto`.

## 2. Projekty i wieloprzeglądarkowość
Sekcja `projects` pozwala na definiowanie różnych środowisk uruchomieniowych:
```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
]
```
Dzięki temu jednym poleceniem możesz sprawdzić, czy Twoja aplikacja działa poprawnie na różnych silnikach i urządzeniach.

## 3. Artefakty i diagnostyka
Konfiguracja pozwala określić, co ma się dziać w przypadku błędu:
- `trace`: 'on-first-retry' lub 'retain-on-failure' – zapisuje pełną historię interakcji.
- `screenshot`: 'only-on-failure' – robi zdjęcie ekranu w momencie awarii.
- `video`: 'retain-on-failure' – nagrywa przebieg testu.

## 4. WebServer — automatyzacja lokalna
Playwright potrafi sam uruchomić Twoją aplikację przed startem testów:
```typescript
webServer: {
  command: 'npm run start',
  url: 'http://127.0.0.1:3000',
  reuseExistingServer: !process.env.CI,
},
```
To kluczowe dla stabilnych testów w środowisku CI, gdzie aplikacja musi zostać "podniesiona" przed rozpoczęciem weryfikacji.

## Dobre praktyki i perspektywa inżynierska
- **Zmienne środowiskowe**: Używaj pakietu `dotenv`, aby ładować konfigurację specyficzną dla środowiska (dev, staging, prod).
- **Workers**: Dostosuj liczbę workerów do zasobów maszyny. Na CI zazwyczaj używamy mniejszej liczby (`workers: 1` lub `2`), aby uniknąć przeciążenia procesora.
- **Fully Parallel**: Włącz `fullyParallel: true` dla testów, które są w 100% odizolowane, aby drastycznie skrócić czas trwania suity.
