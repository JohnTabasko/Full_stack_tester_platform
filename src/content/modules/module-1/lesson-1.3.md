# Struktura projektu Playwright

## Cel lekcji
Zrozumienie, jak zorganizować pliki i katalogi w projekcie testowym, aby był on łatwy w utrzymaniu, skalowalny i czytelny dla całego zespołu (nie tylko dla testerów).

## 1. Standardowa struktura katalogów
Playwright nie narzuca sztywnej struktury, ale społeczność wypracowała standardy, które sprawdzają się w dużych projektach:
- `tests/`: Główne miejsce na pliki specyfikacji (`*.spec.ts`). Możesz je dzielić na podfoldery odpowiadające modułom aplikacji (np. `tests/auth/`, `tests/cart/`).
- `pages/` lub `pom/`: Tu mieszkają klasy Page Object Model.
- `fixtures/`: Definicje własnych rozszerzeń testów (np. automatycznie zalogowany użytkownik).
- `data/`: Pliki JSON lub TS z danymi testowymi, cennikami, słownikami.
- `utils/`: Reużywalne funkcje pomocnicze, np. generator PESEL, klient bazy danych.

## 2. Konwencje nazewnictwa
Spójne nazewnictwo to połowa sukcesu w utrzymaniu kodu.
- **Pliki testowe**: `login-flow.spec.ts` – nazwa powinna odzwierciedlać proces biznesowy.
- **Klasy POM**: `LoginPage.ts`, `ProductCardComponent.ts`.
- **Testy**: `test('powinien pozwolić na zakup przy pustym koszyku', ...)` – używaj języka korzyści użytkownika.

## 3. Zarządzanie konfiguracją
Plik `playwright.config.ts` powinien być sercem projektu. Unikaj twardego kodowania URL-i czy haseł w testach. Wykorzystuj sekcję `use`, aby przekazać `baseURL` oraz inne parametry środowiskowe do wszystkich testów.

## 4. Git i współpraca zespołowa
Projekt testowy to kod produkcyjny. Powinien podlegać tym samym zasadom:
- **.gitignore**: Pamiętaj, aby nie commitować raportów (`playwright-report/`), śladów wykonania (`test-results/`) ani plików `.env` z hasłami.
- **Branching**: Twórz osobne branche na nowe testy i poddawaj je procesowi Code Review.

## Dobre praktyki i perspektywa inżynierska
- **Płaska struktura vs Głęboka**: Na początku projektu trzymaj strukturę płaską. Dopiero gdy liczba plików przekroczy 20-30, zacznij wprowadzać głębszą hierarchię folderów.
- **Lokalizacja POM**: Jeśli budujesz testy obok kodu aplikacji (monorepo), trzymaj Page Objekty blisko komponentów frontendowych. Jeśli testy są w osobnym repo, stwórz czytelną mapę stron.
- **Readme**: Każdy projekt powinien mieć plik README.md wyjaśniający, jak zainstalować zależności, jak uruchomić testy smoke i jak przeglądać raporty.
