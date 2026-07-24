# Profesjonalna struktura i organizacja projektu testowego

W testach na poziomie hobbystycznym lub demonstracyjnym, wszystkie testy, pomocnicy i lokatory trzyma się w jednym katalogu, a czasem nawet w jednym pliku testowym. W systemach klasy korporacyjnej, gdzie zestaw testów zawiera setki scenariuszy i jest rozwijany przez wielu automatyków, taka architektura natychmiast prowadzi do chaosu, duplikacji kodu i paraliżu rurociągów CI/CD.

Dobre zaprojektowanie struktury katalogów i konwencji nazewnictwa na samym początku projektu jest kluczową decyzją architektoniczną. W tej lekcji nauczysz się, jak zorganizować repozytorium testów zgodnie z najlepszymi praktykami inżynierii oprogramowania.

---

## 1. Wybór architektury repozytorium: Standalone vs Monorepo

Przed utworzeniem pierwszego folderu musisz podjąć decyzję, gdzie będą znajdować się Twoje testy:

### A. Repozytorium dedykowane (Standalone)
Testy automatyczne żyją we własnym, niezależnym repozytorium Git, oddzielonym od kodu aplikacji produkcyjnej.
*   **Zalety**: Całkowita izolacja od kodu deweloperskiego, czysta historia zmian w Git skupiona tylko na testach, brak zakłóceń w budowaniu aplikacji frontendowych.
*   **Wady**: Trudniejsza synchronizacja wydań (testy muszą być dostosowane do aktualnej wersji środowiska), brak łatwego dostępu do typów TypeScript kodu frontendowego.

### B. Monorepo (Co-location)
Kod testów automatycznych znajduje się w tym samym repozytorium co kod aplikacji frontendowej/backendowej (np. w podkatalogu `/tests` lub `/e2e`).
*   **Zalety**: Błyskawiczna synchronizacja – zmiana w kodzie aplikacji i dostosowanie testu znajdują się w tym samym commicie Git. Testy mogą wprost importować interfejsy i typy TypeScript z kodu frontendowego.
*   **Wady**: Ryzyko spowolnienia operacji Git przy gigantycznych projektach, potencjalne mieszanie zależności npm w głównym pliku `package.json`.

---

## 2. Standardowa struktura katalogów dla skali korporacyjnej

Aby zachować pełną czytelność, łatwość nawigacji i zgodność z zasadą **Separation of Concerns (Podziału Odpowiedzialności)**, zaleca się stosowanie płaskiej, modularnej struktury katalogów:

```text
my-playwright-project/
├── .auth/                 <-- Katalog na zapisane stany sesji (storageState)
├── .github/
│   └── workflows/         <-- Konfiguracja rurociągów CI/CD (GitHub Actions)
├── src/
│   ├── pages/             <-- Klasy Page Object Model (POM)
│   │   ├── BasePage.ts
│   │   ├── LoginPage.ts
│   │   └── InventoryPage.ts
│   ├── components/        <-- Reużywalne obiekty komponentów wspólnych
│   │   ├── Header.ts
│   │   └── Footer.ts
│   ├── api/               <-- Klasy API Object Model (AOM) i klienci HTTP
│   │   └── UserApi.ts
│   ├── fixtures/          <-- Niestandardowe i automatyczne fixtury
│   │   └── customTest.ts
│   └── utils/             <-- Fabryki, helpery, generatory danych
│       ├── PageFactory.ts
│       └── dbHelper.ts
├── tests/                 <-- Pliki ze scenariuszami testowymi (.spec.ts)
│   ├── setup/             <-- Projekty przygotowawcze (np. globalne logowanie)
│   ├── smoke/             <-- Szybkie testy krytycznych ścieżek
│   └── regression/        <-- Pełne testy regresji funkcjonalnej
├── data/                  <-- Pliki z danymi testowymi i assetami (np. PDFs do uploadu)
│   └── test-users.json
├── playwright.config.ts   <-- Główny plik konfiguracyjny
├── tsconfig.json          <-- Konfiguracja kompilatora TypeScript
├── .gitignore
├── README.md
└── package.json
```

---

## 3. Konwencje nazewnictwa i rozszerzeń plików

Spójność nazewnictwa eliminuje domysły i ułatwia automatyczne filtrowanie testów przez runner.

### A. Rozszerzenia plików testowych
Wszystkie pliki zawierające rzeczywiste scenariusze testowe powinny kończyć się sufiksem `.spec.ts` (np. `cart.spec.ts`). Niektórzy deweloperzy wolą stosować `.e2e.ts`. Najważniejsza jest spójność w całym zespole.
Pliki pomocnicze, klasy POM czy definicje typów TypeScript powinny mieć tradycyjne rozszerzenie `.ts` (bez `spec`), aby runner nie próbował ich uruchamiać jako samodzielnych testów.

### B. Nazewnictwo plików i katalogów (Kebab-case)
Zaleca się stosowanie konwencji **kebab-case** (małe litery oddzielone myślnikami) dla wszystkich plików i katalogów wewnątrz repozytorium:
*   Dobrze: `product-details.spec.ts`
*   Źle: `productDetails.spec.ts`, `Product_Details.Spec.ts`

---

## 4. Przechowywanie stanów uwierzytelnienia (`.auth/`)

Katalog `.auth/` służy do automatycznego przechowywania plików JSON zawierających zapisany stan sesji (cookies, localStorage) zalogowanych użytkowników. 
Pliki te są niezwykle wrażliwe, ponieważ dają pełny dostęp do kont testowych bez znajomości hasła.

### Rygorystyczna zasada bezpieczeństwa Git
**Katalog `.auth/` musi znajdować się w pliku `.gitignore`!** Przypadkowe wypchnięcie (commit) pliku sesji na publiczny serwer GitHub jest krytycznym incydentem bezpieczeństwa i grozi natychmiastowym przejęciem kont testowych.

Dopisz do swojego `.gitignore`:
```text
node_modules/
test-results/
playwright-report/
blob-report/
playwright/.local-browsers/
.auth/
.env
```

---

## 5. Checklista Strukturalna Projektu
Zanim napiszesz pierwszy test, upewnij się, że struktura projektu spełnia następujące wymagania:
- [ ] Zdecydowałeś o typie repozytorium (Standalone vs Monorepo) w porozumieniu z zespołem deweloperskim.
- [ ] Wydzieliłeś katalog `tests/` na scenariusze testowe oraz `src/` na kod wspierający (Page Objecty, fixtury, fabryki).
- [ ] Zastosowałeś konwencję `kebab-case` do nazywania wszystkich plików i folderów.
- [ ] Dodałeś katalog `.auth/` oraz plik `.env` do swojego pliku `.gitignore`.
- [ ] Pliki testowe posiadają jednolite rozszerzenie `.spec.ts`.
