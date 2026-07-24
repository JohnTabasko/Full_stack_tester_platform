# 🚀 Full Stack Tester & Playwright Learning Platform

Kompleksowa, interaktywna platforma edukacyjna klasy produkcyjnej, zaprojektowana specjalnie dla inżynierów QA, deweloperów oraz aspirujących **SDET (Software Development Engineer in Test)**. Aplikacja została zbudowana jako desktopowa aplikacja **Electron** w oparciu o **React**, **TypeScript**, **Vite** i **Tailwind CSS**.

Platforma koncentruje się na dostarczaniu rzetelnej, wysoce szczegółowej i ustrukturyzowanej wiedzy inżynieryjnej opartej o najnowsze standardy **Playwright z TypeScript (stan na rok 2026)** oraz zasady inżynierii oprogramowania (SOLID, wzorce projektowe, czysty kod).

---

## 🎯 Dla kogo skierowana jest platforma?

Platforma została zaprojektowana z myślą o szerokim spektrum odbiorców, którzy chcą wznieść swoje kompetencje techniczne na poziom elity inżynierii jakości:

1.  **Początkujący testerzy automatyzujący**: Osoby, które chcą przejść z prostego „przeklikiwania scenariuszy” i pisania podstawowych skryptów (quick starts) na poziom rzetelnego projektowania skalowalnej architektury testów.
2.  **Doświadczeni inżynierowie QA (np. z Selenium / Cypress)**: Automatycy chcący poznać pod maską zaawansowane mechanizmy Playwright (CDP, WebSockets, wstrzykiwanie fixtur, custom expect matchers) i migrować swoje suity testowe.
3.  **Full Stack Deweloperzy**: Programiści pragnący opanować zaawansowane wzorce testów integracyjnych, kontraktowych (Pact), obserwowalności (Loki/Grafana), bazy danych w warunkach współbieżnych oraz testowania komponentów (Playwright CT).

---

## 📚 Co dokładnie omawia platforma? (Program 28 Modułów)

Program nauki został podzielony na **28 modułów i 134 lekcje**, tworząc kompletne i kompromisowe curriculum dla inżyniera jakości:

### Część I: Ścieżka Mistrzostwa Playwright & TypeScript (Moduły 1–16)
*   **Architektura i konfiguracja**: Przejście z HTTP (Selenium) na stałe połączenia WebSockets (Chrome DevTools Protocol). Izolacja sesji w ułamku sekundy przez konteksty przeglądarki (`BrowserContext`).
*   **Mechanika interakcji i asercje**: Leniwa ewaluacja lokatorów, maszyna stanów gotowości akcji (**Actionability Checks**), priorytety selektorów opartych o dostępność (A11y Matchers), oraz asynchroniczne asercje **Web-First (Auto-Polling)**.
*   **Zaawansowane techniki i hakowanie runnera**: Obsługa ramek `<iframe>` i natywne przenikanie przez korzenie **Shadow DOM**. Przechwytywanie sieci (`page.route`), wstrzykiwanie nagłówków, symulowanie awarii sieci (`route.abort`).
*   **Strategie uwierzytelniania**: Jednokrotne logowanie globalne przy użyciu **Setup Projects** i `storageState`. Testowanie scenariuszy wielorolowych jednocześnie.
*   **Inżynieria POM (Page Object Model)**: Scentralizowana kreacja obiektów przez **`PageFactory`**, ujednolicenie cyklu życia metodą szablonową w `BasePage` oraz kompozycja mniejszych komponentów (Component Objects) z lokalizatorami korzenia (**Root Locators**).
*   **Wydajność, Dostępność i Wizualność**: Profilowanie zużycia pamięci sterty JS i CPU przez **CDP sessions**, blokowanie ciężkich mediów, automatyczne audyty z **Axe-Core (`AxeBuilder`)** z wykluczaniem elementów obcych (`exclude`), oraz stabilna regresja wizualna (`toHaveScreenshot`) z **maskowaniem (`mask`)** i progami czułości pikseli.
*   **CI/CD i Orkiestracja**: Projektowanie zaawansowanych plików YAML (GitHub Actions/GitLab CI), chmurowe **cache'owanie zależności i binariów przeglądarek (skrócenie czasu CI o 80%)**, horyzontalny **Sharding** (podział testów na n maszyn) wraz z agregacją raportów Blob, oraz hosting na GitHub Pages.
*   **Testy Komponentów**: Wykorzystanie **Playwright Component Testing (CT)** do testowania izolowanych komponentów React w prawdziwych przeglądarkach.

### Część II: Ścieżka Inżynierii Full Stack (Moduły 17–28)
*   **Metodologie**: Strategie jakości oparte o analizę ryzyka biznesowego (**Risk-Based Testing**), zasady Shift-Left i rygorystyczne kryteria Definition of Done.
*   **TypeScript Mastery**: Bezpieczeństwo typów (zasada Type-Safe Testing), unikanie `any` na rzecz `unknown` ze strażnikami typów, oraz operator `satisfies`.
*   **Atrapy Testowe (Test Doubles)**: Rzetelny podział i implementacja **Dummy**, **Stubs** (dubler stanu), **Spies** (szpiedzy), **Mocks** (atrapy interakcji) oraz **Fakes** (np. `InMemoryDatabase`) w Vitest/Jest.
*   **Bazy Danych i transakcje**: ACID, cztery standardowe poziomy izolacji SQL w warunkach współbieżnych, symulowanie i testowanie anomalii (Lost Update, Deadlocks, Dirty Reads), oraz higiena czyszczenia danych (Transaction Rollbacks vs czyszczenie po UUID).
*   **Testy kontraktowe i asynchroniczność**:openapi jako kontrakt, CDC z użyciem **Pact** i Pact Brokera, oraz testowanie brokerów wiadomości (**Apache Kafka**, **RabbitMQ**), spójności ostatecznej, webhooków i **Idempotencji**.
*   **Obserwowalność, k6 i DevOps**: Wstrzykiwanie unikalnych nagłówków korelacji (**Correlation IDs**) do rozproszonego debugowania logów w Grafana Loki/Kibana, testy wydajności k6 z budżetami wydajnościowymi, orkiestracja kontenerów Docker Compose z testami gotowości **`healthcheck`**, oraz przygotowanie do technicznych sesji rekrutacyjnych **Live Coding i Pair Programmingu** z użyciem dokumentów **ADR (Architecture Decision Record)**.

---

## 💻 Struktura Technologiczna Aplikacji (Stack Technologiczny)

*   **Środowisko uruchomieniowe**: Node.js, Electron (opakowanie aplikacji desktopowej).
*   **Frontend**: React 18, Vite (narzędzie budujące), Tailwind CSS (stylowanie), Radix UI (komponenty dostępne), Lucide React (ikony).
*   **Zarządzanie Stanem**: Zustand (lekki, wydajny sklep stanów).
*   **Interaktywne Narzędzia**: Monaco Editor (wbudowany edytor kodu wewnątrz playgroundu/piaskownicy).
*   **Baza Danych**: Better-SQLite3 (lokalna, szybka baza danych do zapisywania postępów nauki użytkownika).
*   **Język i Linter**: TypeScript (strict mode: true), ESLint (reguły czystego kodu).

---

## 🛠️ Jak skonfigurować i uruchomić platformę?

### Wymagania wstępne:
*   Zainstalowany **Node.js** (rekomendowana wersja **v22.x LTS** lub nowsza).
*   Zainstalowany menedżer pakietów **npm** (pomyślnie zintegrowany z Node).
*   Zainstalowany **Docker** i **Docker Compose** (opcjonalnie, wymagane do uruchamiania baz danych PostgreSQL i serwera SMTP Mailpit w ramach zaawansowanych lekcji integracyjnych).

### Instrukcja uruchomienia krok po kroku:

1.  **Sklonuj repozytorium i przejdź do katalogu projektu**:
    ```bash
    git clone https://github.com/JohnTabasko/Full_stack_tester_platform.git
    cd Full_stack_tester_platform
    git checkout arena/textbook-refactor-2026
    ```

2.  **Zainstaluj zależności (czysta instalacja deweloperska)**:
    ```bash
    npm ci
    ```

3.  **Uruchom aplikację w trybie deweloperskim (concurrently)**:
    Uruchamia jednocześnie serwer deweloperski Vite dla frontendu (renderer) oraz kompilację procesów głównych Electrona (main):
    ```bash
    npm run dev
    ```

4.  **Skompiluj i zbuduj paczkę produkcyjną**:
    ```bash
    npm run build
    ```

5.  **Uruchom testy statyczne (Kompilator i Linter)**:
    Upewnij się, że kod nie posiada błędów otypowania TypeScript ani naruszeń reguł czystego kodu:
    ```bash
    npx tsc --noEmit
    npm run lint
    ```

6.  **Spakuj aplikację desktopową (Electron Builder)**:
    Generuje gotowe do uruchomienia pliki instalacyjne dla Twojego systemu operacyjnego (np. `.exe` dla Windows, `.AppImage` dla Linuxa, `.dmg` dla macOS) w folderze `release/`:
    ```bash
    npm run package
    ```

---

## 🌟 Standardy i Jakość Kodu Projektu

Projekt dba o najwyższe standardy inżynierii oprogramowania:
*   **ESLint**: Wszystkie ostrzeżenia i błędy lintera zostały pomyślnie wyeliminowane, co zapewnia 100% czystość importów i spójność kodu.
*   **Type Safety**: Wdrożono rygorystyczne opcje kompilatora TypeScript, eliminując niejawne rzutowania typów.
*   **Wzorce i Modularność**: Zawartość merytoryczna oraz struktura kodu są w pełni odseparowane i przygotowane do skalowania w zespołach deweloperskich.

*Platforma stanowi potężną pomoc dydaktyczną, która uczy rzetelnego, inżynieryjnego podejścia do automatyzacji w Playwright i TypeScript! Powodzenia w nauce!* 🚀
