# Czym jest Playwright?

Playwright to nowoczesne, otwartoźródłowe narzędzie do automatyzacji przeglądarek stworzone przez Microsoft. Choć wielu kojarzy go głównie z "testami klikanymi", jego rola w nowoczesnym ekosystemie deweloperskim jest znacznie szersza. Jako Full Stack Tester musisz rozumieć nie tylko *jak* używać Playwrighta, ale przede wszystkim *dlaczego* został zaprojektowany w taki, a nie inny sposób.

## 1. Architektura: Playwright vs. Selenium vs. Cypress

Zrozumienie różnic architektonicznych pozwala uniknąć walki z narzędziem.

### Selenium (WebDriver)
Selenium opiera się na protokole **HTTP (JSON Wire Protocol)**. Gdy Twój test chce kliknąć przycisk, wysyła żądanie HTTP do sterownika (drivera), który następnie komunikuje się z przeglądarką. To podejście jest wolne (duży narzut sieciowy) i podatne na problemy z synchronizacją (test "nie wie", czy przeglądarka skończyła renderować).

### Cypress
Cypress działa **wewnątrz przeglądarki**, współdzieląc z aplikacją pętlę zdarzeń (event loop). Daje to świetny wgląd w stan aplikacji, ale ogranicza narzędzie do jednej karty, braku wsparcia dla wielu domen i utrudnia testowanie scenariuszy wymagających pełnej kontroli nad systemem operacyjnym czy wieloma oknami.

### Playwright
Playwright łączy zalety obu podejść. Komunikuje się z przeglądarkami przez **WebSocket** (używając protokołów takich jak Chrome DevTools Protocol - CDP).
- **Szybkość**: Komunikacja przez binarny strumień danych jest niemal natychmiastowa.
- **Pełna kontrola**: Pozwala na sterowanie wieloma kartami, oknami, a nawet kontekstami (izolowanymi sesjami) w jednej instancji przeglądarki.
- **Niezależność**: Działa "obok" przeglądarki, co pozwala na natywne przechwytywanie ruchu sieciowego, emulację urządzeń i manipulację systemem plików.

## 2. Browser Engines (Silniki przeglądarek)

Full Stack Tester musi wiedzieć, że Playwright automatyzuje **silniki**, a nie konkretne przeglądarki-aplikacje zainstalowane w systemie:
- **Chromium**: Silnik stojący za Google Chrome, Microsoft Edge, Opera i wieloma innymi.
- **Firefox**: Silnik Gecko rozwijany przez Mozillę.
- **WebKit**: Silnik napędzający Apple Safari.

Dlaczego to ważne? Dzięki temu Playwright zapewnia **Cross-browser testing** na systemach takich jak Linux, gdzie Safari normalnie nie istnieje. Playwright dostarcza własne, zoptymalizowane pod kątem automatyzacji binaria tych silników.

## 3. Kluczowe pojęcia: Browser, Context, Page

To "Święta Trójca" hierarchii Playwrighta, którą musisz opanować do perfekcji:

1.  **Browser**: To po prostu proces przeglądarki (np. instancja Chromium). Uruchomienie go jest "droższe" (wymaga więcej RAM i czasu).
2.  **BrowserContext**: To unikalna cecha Playwrighta. Możesz go traktować jak "okno incognito". Każdy kontekst ma własne ciasteczka, localStorage i sesję, ale współdzieli proces przeglądarki z innymi kontekstami.
    - *Full Stack Insight*: Dzięki temu możesz w jednym teście symulować dwóch zalogowanych użytkowników bez konieczności uruchamiania dwóch osobnych procesów przeglądarki. To oszczędza 90% czasu i zasobów.
3.  **Page**: To pojedyncza karta (tab) wewnątrz kontekstu.

## 4. Dlaczego Playwright wygrywa w projektach komercyjnych?

1.  **Auto-waiting**: Zapomnij o `sleep()`. Playwright przed każdą akcją (np. kliknięciem) sprawdza tzw. **actionability checks**: czy element jest widoczny, czy nie jest zasłonięty, czy skończył się animować.
2.  **Web-First Assertions**: Asercje takie jak `expect(locator).toBeVisible()` automatycznie ponawiają próbę (retry) przez określony czas, co eliminuje "flaky tests" (testy losowo oblewające).
3.  **Tracing**: Playwright nagrywa "ślady" wykonania testu. Po awarii w CI (Continuous Integration) możesz otworzyć Trace Viewer i zobaczyć stan DOM, żądania sieciowe i konsolę w każdym milisekundzie testu.

## Źródła i dalsza nauka
- [Oficjalna dokumentacja Playwright](https://playwright.dev/docs/intro)
- [Video: "Playwright: A New Test Automation Framework for the Modern Web" (Microsoft)](https://www.youtube.com/watch?v=_J_X_6vT_t0)
