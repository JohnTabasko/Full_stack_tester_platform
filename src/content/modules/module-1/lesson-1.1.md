# Czym jest Playwright? Ekosystem i Architektura

Playwright to nowoczesny, profesjonalny framework do testów end-to-end i automatyzacji przeglądarek rozwijany przez firmę Microsoft. Stanowi on przełom technologiczny w porównaniu do starszych narzędzi (takich jak Selenium). 

Zrozumienie **architektury** Playwrighta jest kluczowe dla każdego Full Stack Testera, ponieważ wyjaśnia, dlaczego testy są tak szybkie i dlaczego nie cierpią na odwieczny problem „flakiness” (niestabilności) znany z Selenium.

---

## 1. Rewolucja Architektoniczna: WebSockets (CDP) vs HTTP JSON Wire Protocol

Aby zrozumieć wyższość Playwright, musimy porównać jego architekturę z Selenium:

### A. Architektura Selenium (WebDriver)
Selenium opiera się na protokole **HTTP JSON Wire Protocol** (lub nowszym standardzie W3C WebDriver). 
*   Każda komenda testu (np. kliknięcie przycisku, wpisanie tekstu) jest przesyłana jako **osobne zapytanie HTTP** z Twojego test runnera, poprzez zewnętrzny plik binarny (np. `chromedriver`), aż do przeglądarki.
*   Z powodu braku stałego połączenia i ciągłego narzutu protokołu HTTP, komunikacja jest powolna.
*   Selenium nie wie, co dzieje się wewnątrz przeglądarki (np. czy strona renderuje asynchronicznie) i wymaga ciągłego, kłopotliwego definiowania okresów oczekiwania (`sleep` / `wait`).

### B. Architektura Playwright (Chrome DevTools Protocol - CDP)
Playwright odrzuca protokół HTTP na rzecz stałego, dwukierunkowego połączenia sieciowego za pomocą **WebSockets**:
*   Po uruchomieniu przeglądarki, Playwright nawiązuje z nią bezpośrednie połączenie przez WebSocket i wysyła komendy bezpośrednio przez protokół **Chrome DevTools Protocol (CDP)** (lub jego odpowiedniki w Firefox i WebKit).
*   Komunikacja zachodzi w ułamkach milisekund, bez narzutu żądań HTTP.
*   Przeglądarka **aktywnie informuje** test runner o zachodzących zdarzeniach (np. zmiana struktury DOM, zakończenie zapytania API, rzucenie błędu konsoli JS). Dzięki temu Playwright doskonale wie, kiedy strona skończyła się renderować i może zaimplementować natywny **auto-waiting**.

```
+--------------------+                     +--------------------+
|    Playwright      |  <-- WebSocket -->  |     Przeglądarka   |
|    Test Runner     |  (CDP / WebSockets) | (Chromium/FF/WK)   |
+--------------------+                     +--------------------+
```

---

## 2. Podział Ekosystemu: Playwright Test vs Playwright Library

W bibliografii i oficjalnej dokumentacji spotkasz dwa pojęcia:

1.  **Playwright Test** (rekomendowany dla inżynierów QA):
    *   Kompletny framework testowy dostarczający runner testów, asercje, raporty, śledzenie (trace viewer) oraz system fixture-ów.
    *   Importujesz `test` i `expect` z pakietu `@playwright/test`.
2.  **Playwright Library** (dla programistów / skrobaków danych - scrapers):
    *   Surowe API do automatyzacji samej przeglądarki, pozbawione asercji czy runnera.
    *   Służy np. do generowania plików PDF ze stron internetowych, web scrapingu czy automatyzacji formularzy wewnątrz skryptów Node.js.
    *   Importujesz `chromium`, `firefox` lub `webkit` z pakietu `playwright`.

---

## 3. Izolacja sesji w ułamku sekundy (Browser Contexts)

Klasyczne testy Selenium wymagały zamykania i otwierania całego okna przeglądarki (`browser.close()` / `browser.launch()`) dla każdego testu w celu oczyszczenia sesji, co drastycznie spowalniało wykonanie testu (trwało to od 3 do 10 sekund).

Playwright wprowadza koncepcję **Browser Contexts** (kontekstów przeglądarki):
*   Przeglądarka uruchamia się **tylko raz** na worker (proces roboczy).
*   Dla każdego pojedynczego testu Playwright tworzy nowy, lekki kontekst (`context`), który działa jak całkowicie **nowe okno incognito**. Posiada własne, odizolowane pliki cookie, pamięć lokalną (`localStorage`) oraz pamięć podręczną.
*   Powołanie kontekstu trwa zaledwie **kilka milisekund**, co pozwala na pełną izolację każdego testu przy zachowaniu ekstremalnej prędkości wykonania.

---

## 4. Checklista Zrozumienia Architektury
- [ ] Czy rozumiesz, dlaczego Playwright jest szybszy od Selenium dzięki architekturze WebSocket?
- [ ] Czy potrafisz wyjaśnić różnicę między Playwright Test a surowym Playwright Library?
- [ ] Czy wiesz, jak kontekst przeglądarki (incognito) przyspiesza czas trwania testu, zapobiegając wyciekom sesji?

---

## Bibliografia i Linki
*   *Faraz K. Kelhini & Butch Mayhew, Hands-On Automated Testing with Playwright (2026), Chapter 1: Quick Setup Refresher (Playwright Library vs Playwright Test)*
*   *Jean-François Greffier, Practical Playwright Test (2026), Chapter 1: Getting Started (Why Choose Playwright)*
*   [Oficjalna Dokumentacja Architektury Playwright](https://playwright.dev/docs/intro)
