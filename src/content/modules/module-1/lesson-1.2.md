# Instalacja i konfiguracja środowiska testowego klasy korporacyjnej

W profesjonalnych projektach automatyzacji testów, proces instalacji i przygotowania środowiska nie może opierać się na mechanicznym wpisywaniu prostych komend z samouczków. Środowisko testowe musi być zaprojektowane tak, aby działało w sposób powtarzalny, niezależny od platformy (OS-agnostic) i był łatwy do odtworzenia zarówno na komputerze dewelopera, jak i na odizolowanej maszynie rurociągu CI/CD.

W tej lekcji przeanalizujemy każdy aspekt przygotowania środowiska: od doboru wersji Node.js, poprzez konfigurację TypeScript i zmiennych środowiskowych, aż po architekturę dystrybucji binariów przeglądarek w systemach operacyjnych.

---

## 1. Wybór środowiska uruchomieniowego: Strategia Node.js i NPM

### A. Wersja Node.js (LTS Strategy)
Playwright jest uruchamiany w środowisku Node.js. W projektach komercyjnych zawsze należy korzystać z wersji **LTS (Long Term Support)** Node.js (obecnie linie 22.x, 24.x lub najnowsze stabilne wydania 2026). Korzystanie z wersji eksperymentalnych lub przestarzałych (np. Node 18) grozi brakiem kompatybilności wstecznej z nowymi pakietami.

Dla zagwarantowania spójności wersji w zespole stosuje się dwa mechanizmy:
1.  **Plik `.nvmrc`**: Plik umieszczony w katalogu głównym projektu, zawierający wyłącznie numer wersji (np. `22.11.0`). Narzędzia takie jak NVM (Node Version Manager) automatycznie przełączają wersję Node po wejściu do katalogu.
2.  **Pole `engines` w `package.json`**: Blokuje możliwość uruchomienia projektu na niewłaściwej wersji Node:
    ```json
    "engines": {
      "node": ">=22.0.0"
    }
    ```

### B. Wybór menedżera pakietów
Wybór między `npm`, `yarn` a `pnpm` powinien być świadomy. Choć `npm` jest domyślny, `pnpm` zdobywa ogromną popularność dzięki lepszemu zarządzaniu pamięcią podręczną (hard-linking) i radykalnie szybszej instalacji zależności, co przekłada się na niższy koszt działania maszyn CI/CD. Bez względu na wybór, **nigdy nie mieszaj różnych menedżerów w jednym projekcie** (nie commituj jednocześnie plików `package-lock.json`, `yarn.lock` i `pnpm-lock.yaml`).

---

## 2. Architektura instalacji przeglądarek Playwright

Playwright nie korzysta z przeglądarek zainstalowanych globalnie w systemie operacyjnym użytkownika. Zamiast tego pobiera własne, zoptymalizowane pod kątem automatyzacji kompilacje open-source: **Chromium**, **Firefox** (Gecko) oraz **WebKit** (silnik przeglądarki Safari).

### A. Gdzie Playwright przechowuje przeglądarki?
Domyślnie binarne wersje przeglądarek są pobierane do globalnego katalogu pamięci podręcznej użytkownika:
*   **Linux**: `~/.cache/ms-playwright`
*   **macOS**: `~/Library/Caches/ms-playwright`
*   **Windows**: `%USERPROFILE%\AppData\Local\ms-playwright`

### B. Dostosowywanie ścieżki za pomocą `PLAYWRIGHT_BROWSERS_PATH`
W środowiskach korporacyjnych (zwłaszcza w chmurach prywatnych i kontenerach Docker, gdzie uprawnienia do zapisu w katalogach domowych mogą być zablokowane), domyślną ścieżkę pobierania można nadpisać za pomocą zmiennej środowiskowej:

```bash
export PLAYWRIGHT_BROWSERS_PATH=/opt/playwright-browsers
npx playwright install
```

### C. Instalacja zależności systemowych (System Dependencies)
Na czystych systemach Linux (np. odizolowanych kontenerach Ubuntu w rurociągach CI), same binarne wersje przeglądarek mogą nie chcieć się uruchomić z powodu braku bibliotek współdzielonych (np. `libnspr4`, `libnss3`, `libcairo2`).

Aby automatycznie zainstalować przeglądarki wraz ze wszystkimi wymaganymi zależnościami systemowymi poziomu OS, należy wykonać komendę:

```bash
npx playwright install --with-deps
```

Można również precyzyjnie wskazać pobieraną przeglądarkę, aby zaoszczędzić czas transferu i miejsce na dysku:

```bash
npx playwright install chromium --with-deps
```

---

## 3. Kompletna konfiguracja TypeScript dla Playwright (`tsconfig.json`)

TypeScript jest de facto standardem w nowoczesnej automatyzacji z Playwright. Zapewnia on autouzupełnianie kodu (IntelliSense), statyczną analizę błędów i czytelne typowanie obiektów stron (POM) oraz fixture-ów.

Oto zalecana konfiguracja `tsconfig.json` klasy produkcyjnej dla samodzielnego projektu testowego:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "rootDir": "."
  },
  "include": [
    "src/**/*.ts",
    "tests/**/*.ts",
    "playwright.config.ts"
  ]
}
```

### Wyjaśnienie kluczowych opcji:
*   `"moduleResolution": "NodeNext"` i `"module": "NodeNext"`: Najnowocześniejsze i najbezpieczniejsze ustawienia dla Node.js, zapewniające poprawne wsparcie dla modułów ESM (EcmaScript Modules) i tradycyjnych CommonJS.
*   `"strict": true`: Włącza rygorystyczne sprawdzanie typów (w tym zakaz stosowania niejawnego typu `any`), co eliminuje błędy typu *null pointer exception* na etapie pisania kodu.
*   `"esModuleInterop": true`: Zapewnia kompatybilność przy imporcie modułów CommonJS wewnątrz składni ES Modules.

---

## 4. Zarządzanie zmiennymi środowiskowymi i plikami `.env`

W testach korporacyjnych nigdy nie wolno twardo kodować (hardcoding) adresów URL środowisk, haseł ani kluczy API. Wszystkie te dane muszą być wstrzykiwane dynamicznie za pomocą zmiennych środowiskowych.

W tym celu Playwright natywnie współpracuje z plikami `.env` przy użyciu wbudowanego modułu `dotenv` w pliku konfiguracyjnym:

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Wczytaj zmienne z pliku .env z głównego katalogu
dotenv.config({ path: path.resolve(__dirname, '.env') });
```

### Struktura pliku `.env` (przykład):
```env
BASE_URL=https://staging.mycommerce.com
ADMIN_EMAIL=admin@mycommerce.com
# Nigdy nie commituj haseł i sekretów do Git!
ADMIN_PASSWORD=SuperSecretPassword123!
```

### Bezpieczeństwo sekretów w Git
Zawsze dodawaj plik `.env` do `.gitignore`. Do repozytorium commituj jedynie plik szablonowy `.env.example`, który nie zawiera rzeczywistych haseł, a jedynie spis wymaganych kluczy:

```env
BASE_URL=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

---

## 5. Konfiguracja Środowiska Programistycznego (IDE Setup)

Najlepszym edytorem dla Playwright jest **Visual Studio Code**, dzięki oficjalnemu rozszerzeniu od Microsoftu: **Playwright Test for VS Code**.

### Możliwości oficjalnego rozszerzenia:
1.  **Direct Execution**: Uruchamianie pojedynczych testów lub całych grup (describe) bezpośrednio z poziomu kodu (zielone przyciski "Play").
2.  **Visual Debugging**: Debugowanie krok po kroku z podświetlaniem aktualnie wykonywanej linii oraz automatycznym zatrzymywaniem przeglądarki na błędach.
3.  **Live Locator Picker**: Narzędzie umożliwiające dynamiczne wybieranie najstabilniejszych lokalizatorów bezpośrednio na działającej przeglądarce i automatyczne wklejanie ich do kodu edytora.

---

## 6. Rozwiązywanie typowych problemów (Troubleshooting)

Podczas instalacji początkujący mogą napotkać kilka powtarzalnych błędów. Oto profesjonalny przewodnik po ich rozwiązywaniu:

### Błąd 1: `Executable doesn't exist`
*   **Przyczyna**: Playwright nie pobrał binariów przeglądarek do globalnego cache lub zmieniła się wersja pakietu `@playwright/test` bez aktualizacji przeglądarek.
*   **Rozwiązanie**: Uruchom `npx playwright install` w terminalu projektu.

### Błąd 2: `EACCES: permission denied` na systemach Linux/macOS
*   **Przyczyna**: Uruchomienie instalacji globalnej `npm install -g` lub pobieranie przeglądarek do katalogów systemowych wymagających uprawnień roota (sudo).
*   **Rozwiązanie**: Nigdy nie używaj `sudo` do komend npm i Playwright. Skonfiguruj NVM w swoim systemie, aby zarządzać wersjami Node bez uprawnień administratora.

---

## 7. Checklista Instalacyjna Środowiska
Przed przejściem do kolejnej lekcji upewnij się, że:
- [ ] Zainstalowałeś wersję Node.js z linii LTS (np. v22+) i zadeklarowałeś ją w pliku `.nvmrc`.
- [ ] Pobrałeś binarne przeglądarki wraz z zależnościami systemowymi komendą `npx playwright install --with-deps`.
- [ ] Skonfigurowałeś rygorystyczny plik `tsconfig.json` z opcją `"strict": true` oraz `"moduleResolution": "NodeNext"`.
- [ ] Dodałeś pliki `.env` do `.gitignore` i przygotowałeś szablon `.env.example`.
- [ ] Zainstalowałeś rozszerzenie *Playwright Test* w edytorze VS Code.
