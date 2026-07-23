# Evaluating JavaScript, handles, clock i mockowanie API przeglądarki

Playwright pozwala nie tylko klikać w UI, ale też wykonywać kod JavaScript w kontekście strony, pracować z uchwytami do obiektów, kontrolować czas i mockować wybrane API przeglądarki. To potężne możliwości, ale powinny być używane ostrożnie. Test E2E ma przede wszystkim sprawdzać zachowanie użytkownika. Bezpośrednie manipulowanie JavaScriptem może łatwo ominąć realny problem UI.

## 1. `page.evaluate` — kod w kontekście strony

`page.evaluate` wykonuje funkcję w przeglądarce, a nie w Node.js.

```typescript
const userAgent = await page.evaluate(() => navigator.userAgent);
expect(userAgent).toContain('Chrome');
```

Możesz przekazywać argumenty:

```typescript
const title = await page.evaluate(selector => {
  return document.querySelector(selector)?.textContent;
}, '[data-testid="title"]');
```

Pamiętaj: funkcja przekazana do `evaluate` działa w innym świecie. Nie ma dostępu do zmiennych Node.js, chyba że przekażesz je jako argument.

## 2. Kiedy używać `evaluate`

Dobre zastosowania:

- odczyt właściwości przeglądarki;
- diagnostyka techniczna;
- sprawdzenie stanu localStorage/sessionStorage;
- przygotowanie mocka API przeglądarki przed załadowaniem strony;
- praca z canvasem albo niestandardowym komponentem, gdy brak lepszego publicznego API.

Złe zastosowania:

- klikanie elementu przez `element.click()` zamiast akcji Playwright;
- ustawianie wartości inputa bez eventów użytkownika;
- omijanie walidacji UI;
- naprawianie testu przez manipulację DOM.

Antywzorzec:

```typescript
await page.evaluate(() => document.querySelector('button')?.click());
```

Lepsze:

```typescript
await page.getByRole('button', { name: 'Zapisz' }).click();
```

## 3. `evaluateHandle`, JSHandle i ElementHandle

`evaluateHandle` zwraca uchwyt do obiektu w przeglądarce:

```typescript
const windowHandle = await page.evaluateHandle(() => window);
await windowHandle.dispose();
```

`JSHandle` i `ElementHandle` są niższopoziomowe. W testach Playwright preferuj locatory, bo są retry-aware i lepiej radzą sobie z re-renderem SPA.

Antywzorzec:

```typescript
const button = await page.$('button');
await button?.click();
```

Lepsze:

```typescript
await page.getByRole('button', { name: 'Zapisz' }).click();
```

ElementHandle może wskazywać stary element po re-renderze. Locator wyszukuje element ponownie w momencie akcji.

## 4. `addInitScript` — kod przed aplikacją

Jeśli chcesz nadpisać API przed startem aplikacji, użyj `addInitScript`:

```typescript
await page.addInitScript(() => {
  Math.random = () => 0.42;
});

await page.goto('/');
```

To przydatne do stabilizacji losowości, dat, feature flag lub API przeglądarki.

## 5. Mockowanie czasu przez Clock

Playwright udostępnia mechanizmy kontroli czasu. Dzięki nim testy liczników, timeoutów, sesji i dat mogą być deterministyczne.

Przykład idei:

```typescript
await page.clock.install({ time: new Date('2026-07-09T10:00:00Z') });
await page.goto('/promotions');
await expect(page.getByText('Promocja aktywna')).toBeVisible();

await page.clock.fastForward('01:00:00');
await expect(page.getByText('Promocja zakończona')).toBeVisible();
```

Kontrola czasu jest lepsza niż czekanie realnej godziny albo manipulowanie backendem tylko po to, aby sprawdzić zmianę stanu.

## 6. Mockowanie API przeglądarki

Niektóre funkcje aplikacji zależą od API przeglądarki: clipboard, geolokalizacja, permissions, media devices, notifications, `navigator.onLine`.

Część z nich lepiej ustawić przez kontekst:

```typescript
const context = await browser.newContext({
  geolocation: { latitude: 52.2297, longitude: 21.0122 },
  permissions: ['geolocation'],
});
```

Część można mockować przez init script:

```typescript
await page.addInitScript(() => {
  Object.defineProperty(navigator, 'onLine', {
    get: () => false,
  });
});
```

Najpierw sprawdź, czy Playwright ma oficjalną opcję kontekstu. Mock przez JS zostaw dla API, których nie da się inaczej kontrolować.

## 7. LocalStorage i sessionStorage

Odczyt:

```typescript
const theme = await page.evaluate(() => localStorage.getItem('theme'));
expect(theme).toBe('dark');
```

Ustawienie przed startem aplikacji:

```typescript
await page.addInitScript(() => {
  localStorage.setItem('theme', 'dark');
});
await page.goto('/');
```

Dla logowania preferuj `storageState`, a nie ręczne ustawianie tokenów w localStorage, chyba że świadomie testujesz mechanizm storage.

## 8. Bezpieczeństwo i serializacja

Wartości zwracane z `evaluate` muszą dać się zserializować. Nie każdy obiekt DOM da się po prostu zwrócić do Node.js. Jeśli potrzebujesz uchwytu do obiektu, użyj `evaluateHandle`, ale pamiętaj o `dispose()`.

Nie przekazuj sekretów do strony bez potrzeby. Kod wykonywany w kontekście strony działa w środowisku aplikacji.

## 9. Antywzorce

- `evaluate` użyte do klikania zamiast locatorów.
- `ElementHandle` przechowywany długo w aplikacji SPA.
- Ręczne ustawianie tokena zamiast `storageState`.
- Mockowanie API przeglądarki bez asercji, że aplikacja zachowała się poprawnie.
- Brak `dispose()` dla uchwytów.
- Test zależny od realnej daty i godziny.

## 10. Checklista

- Czy da się użyć locatora zamiast `evaluate`?
- Czy manipulacja JS nie omija zachowania użytkownika?
- Czy mock jest ustawiony przed `page.goto`?
- Czy do czasu używasz clock zamiast realnego czekania?
- Czy preferujesz opcje kontekstu nad ręcznym mockiem JS?
- Czy uchwyty są zwalniane przez `dispose()`?
- Czy test nadal sprawdza rezultat widoczny dla użytkownika?

## Linki

- [Evaluating JavaScript](https://playwright.dev/docs/evaluating)
- [Handles](https://playwright.dev/docs/handles)
- [Clock](https://playwright.dev/docs/clock)
- [Mock browser APIs](https://playwright.dev/docs/mock-browser-apis)
- [Emulation](https://playwright.dev/docs/emulation)

## 11. Evaluate a bezpieczeństwo testu

Kod w `page.evaluate` działa w kontekście strony. To oznacza, że widzi `window`, `document`, localStorage i inne API przeglądarki. Nie przekazuj tam sekretów bez potrzeby. Jeśli test musi ustawić stan, preferuj oficjalne opcje kontekstu albo API aplikacji.

## 12. Evaluate jako narzędzie diagnostyczne

`evaluate` jest świetne do diagnostyki:

```typescript
const storage = await page.evaluate(() => ({
  theme: localStorage.getItem('theme'),
  online: navigator.onLine,
  title: document.title,
}));
```

Taki odczyt nie omija zachowania użytkownika, tylko zbiera kontekst. To znacznie bezpieczniejsze niż klikanie przez `document.querySelector().click()`.

## 13. Clock i procesy zależne od czasu

Kontrola czasu jest przydatna dla:

- wygasłych tokenów;
- promocji czasowych;
- debounce;
- retry po czasie;
- sesji wygasającej po bezczynności;
- komunikatów toast z auto-hide.

Zamiast czekać realne minuty, przesuwasz zegar i sprawdzasz stan.

## 14. Mock browser APIs vs emulation

Najpierw użyj oficjalnej emulacji Playwright:

- permissions;
- geolocation;
- locale;
- timezone;
- colorScheme;
- reducedMotion;
- offline.

Dopiero gdy Playwright nie ma opcji dla danego API, użyj `addInitScript`.

## 15. Handle lifecycle

Jeśli używasz `evaluateHandle`, pamiętaj o `dispose`. Uchwyty trzymają referencje do obiektów w przeglądarce. W długich testach i helperach brak zwalniania może powodować wycieki pamięci.

## 16. Zasada końcowa

JavaScript evaluation to skalpel, nie młotek. Używaj go tam, gdzie Playwrightowe locatory, akcje i konteksty nie rozwiązują problemu w sposób bliższy użytkownikowi.

## 📘 Suplement Inżynieryjny 2026: Mechanizmy Zaawansowane (Dialogs & Interception)
*Inspiracja: „Hands-On Automated Testing with Playwright” (2026), Chapter 11 & 12*
*   **Event-First Pattern dla Dialogów**: Playwright automatycznie odrzuca systemowe dialogi (`alert`, `confirm`). Jeśli chcesz je zatwierdzić, musisz zarejestrować subskrypcję zdarzenia *przed* wywołaniem akcji wyzwalającej: `page.once('dialog', dialog => dialog.accept())`.
*   **Intercepcja Sieciowa (`route.fallback`)**: Nowoczesne mockowanie API opiera się na elastycznych regułach przechwytywania, umożliwiających przekazywanie żądań do rzeczywistego serwera lub nadpisywanie nagłówków w locie.
