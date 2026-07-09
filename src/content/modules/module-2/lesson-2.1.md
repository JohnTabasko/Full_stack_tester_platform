# Przeglądarka, kontekst i strona (Deep Dive)

Jako Full Stack Tester, zrozumienie hierarchii obiektów Playwrighta jest kluczem do pisania testów, które są szybkie, stabilne i oszczędne zasobowo. W tej lekcji przeanalizujemy, jak zarządzać cyklem życia przeglądarki w profesjonalnych scenariuszach.

## 1. Browser: Proces systemowy

Obiekt `Browser` reprezentuje instancję silnika przeglądarki (np. Chromium). Uruchomienie przeglądarki jest operacją kosztowną.
```typescript
const browser = await chromium.launch({ headless: false });
```
W profesjonalnym środowisku:
- Testy zazwyczaj uruchamiamy w trybie **headless: true** (bez widocznego okna), co jest szybsze i zużywa mniej pamięci na serwerach CI.
- Możemy sterować parametrami takimi jak `args` (flagi Chromium), `proxy` (jeśli testujemy zza firewalla) czy `slowMo` (spowolnienie każdej akcji o X milisekund - przydatne do debugowania).

## 2. BrowserContext: Izolacja sesji deweloperskiej

To tutaj dzieje się "magia" wydajności Playwrighta. `BrowserContext` to odizolowana sesja deweloperska.
- **Pełna Izolacja**: Ciasteczka, `localStorage`, `sessionStorage` oraz `IndexedDB` są unikalne dla każdego kontekstu.
- **Zero narzutu**: Tworzenie nowego kontekstu trwa milisekundy i nie wymaga uruchamiania nowego procesu przeglądarki.

### Scenariusz komercyjny: Testowanie Uprawnień
Wyobraź sobie aplikację SaaS, gdzie Admin nadaje uprawnienia Użytkownikowi. W Selenium musiałbyś uruchomić dwie osobne przeglądarki. W Playwright robisz to tak:
```typescript
const adminContext = await browser.newContext();
const userContext = await browser.newContext();

const adminPage = await adminContext.newPage();
const userPage = await userContext.newPage();

// Admin nadaje uprawnienia na adminPage
// User sprawdza efekt na userPage - bez przeładowywania i przelogowywania!
```

## 3. Page: Interakcja z dokumentem

Obiekt `Page` to pojedyncza karta. To na niej wykonujesz większość operacji:
- `page.goto(url)`: Nawigacja.
- `page.locator(selector)`: Definiowanie elementów.
- `page.on('request', ...)`: Nasłuchiwanie zdarzeń sieciowych (Full Stack skill!).

## 4. Zarządzanie stanem: StorageState

Jako Full Stack Tester będziesz często testował aplikacje wymagające logowania. Logowanie przez UI w każdym teście to błąd architektoniczny (powolność, kruchliwość).
Playwright pozwala zapisać stan zalogowanego kontekstu do pliku:
```typescript
// W teście logowania
await context.storageState({ path: 'auth/user.json' });

// W każdym innym teście
const context = await browser.newContext({ storageState: 'auth/user.json' });
```
Dzięki temu test zaczyna się od razu na stronie głównej jako użytkownik zalogowany, oszczędzając 5-10 sekund na każdym przebiegu.

## 5. Viewport i Emulacja

Kontekst pozwala na błyskawiczną emulację urządzeń:
```typescript
const mobileContext = await browser.newContext({
  ...devices['iPhone 13'],
  locale: 'pl-PL',
  geolocation: { longitude: 21.0122, latitude: 52.2297 },
  permissions: ['geolocation']
});
```
Możesz testować responsywność, formaty dat czy funkcje oparte na lokalizacji GPS bez dotykania prawdziwego telefonu.

## Podsumowanie inżynierskie
- **Browser** = Proces (ciężki).
- **Context** = Sesja/Profil (lekki, klucz do izolacji).
- **Page** = Karta (miejsce akcji).

*Pytanie kontrolne*: Dlaczego Playwright Runner domyślnie tworzy nowy kontekst dla każdego testu, a nie używa jednego wspólnego? (Podpowiedź: Ataki typu Side-channel i czystość danych).

## Linki merytoryczne
- [Playwright Architecture](https://playwright.dev/docs/intro#architecture)
- [BrowserContext API](https://playwright.dev/docs/api/class-browsercontext)
