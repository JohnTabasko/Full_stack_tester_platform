# Integracja z rurociągami CI/CD: GitHub Actions

Automatyzacja testów daje pełną wartość biznesową dopiero wtedy, gdy staje się nieodłączną częścią procesu ciągłej integracji i wdrażania (**CI/CD – Continuous Integration / Continuous Deployment**). Każda zmiana w kodzie aplikacji wprowadzana przez programistów powinna automatycznie uruchamiać zestaw testów (jako tzw. bramka jakości – **Quality Gate**), blokując wdrożenie regresji na środowiska produkcyjne.

**GitHub Actions** to obecnie najpopularniejsza chmurowa platforma orkiestracji procesów CI/CD. W tej lekcji nauczysz się projektować od podstaw kompletny, profesjonalny i odporny na awarie rurociąg testowy dla Playwright.

---

## 1. Kompletny rurociąg produkcyjny (`playwright.yml`)

Konfigurację rurociągów GitHub Actions zapisujemy w formacie YAML w dedykowanej ścieżce `.github/workflows/playwright.yml` w głównym katalogu projektu:

```yaml
name: Playwright Regression Tests

# 1. Zdarzenia wyzwalające (Triggers)
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  # Pozwala na ręczne uruchomienie testów z panelu GitHub (Manual Trigger)
  workflow_dispatch:

jobs:
  test:
    name: Run E2E Tests
    timeout-minutes: 60
    runs-on: ubuntu-latest # Wykonaj testy na odizolowanej maszynie Linux

    steps:
    # Krok A: Pobranie kodu repozytorium
    - name: Checkout repository
      uses: actions/checkout@v4

    # Krok B: Przygotowanie środowiska Node.js
    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 22 # Zawsze korzystaj z deklarowanej wersji LTS
        cache: 'npm'     // Automatycznie cache'uj zależności npm

    # Krok C: Czysta instalacja pakietów
    - name: Install dependencies
      run: npm ci

    # Krok D: Instalacja przeglądarek Playwright wraz z zależnościami OS
    - name: Install Playwright browsers and system deps
      run: npx playwright install --with-deps

    # Krok E: Wykonanie testów
    - name: Run Playwright tests
      run: npx playwright test
      env:
        # Bezpieczne wstrzyknięcie zmiennych i sekretów środowiskowych
        BASE_URL: ${{ secrets.STAGING_URL }}
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

    # Krok F: Eksport i zachowanie raportu HTML (zawsze, nawet przy błędzie!)
    - name: Upload Playwright Report
      uses: actions/upload-artifact@v4
      if: always() # Upewnij się, że raport zostanie pobrany nawet przy awarii
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30 # Przechowuj raport przez 30 dni
```

---

## 2. Kluczowe elementy architektury YAML w CI
*   **`on: pull_request`**: Gwarantuje, że przed złączeniem (merge) kodu dewelopera do gałęzi głównej, Playwright uruchomi testy i potwierdzi brak błędów.
*   **`npx playwright install --with-deps`**: Pobiera dedykowane binarne przeglądarki i instaluje brakujące współdzielone biblioteki systemowe na maszynie wirtualnej Ubuntu.
*   **`if: always()`**: Warunek logiczny zapewniający pobranie raportu i trace pliku `.zip` nawet wtedy, gdy testy zakończą się niepowodzeniem (jest to kluczowe pod kątem diagnostyki błędu).

---

## 3. Zarządzanie Sekretami (`secrets`)

Nigdy nie wpisuj haseł bezpośrednio do pliku YAML. Wszystkie poufne klucze (tokeny, hasła bazy danych, adresy URL) zapisujemy w ustawieniach projektu w GitHub w sekcji **Settings -> Secrets and variables -> Actions** i wstrzykujemy je dynamicznie za pomocą składni `${{ secrets.NAZWA_SEKRETU }}`.

---

## 4. Checklista Integracji CI
- [ ] Czy Twój plik YAML jest umieszczony w prawidłowej ścieżce `.github/workflows/`?
- [ ] Czy skonfigurowałeś uruchamianie testów przy zdarzeniach `pull_request` w celu ochrony gałęzi głównej?
- [ ] Czy upewniłeś się, że krok `upload-artifact` posiada flagę `if: always()`, aby zapobiec utracie raportów przy awariach?
- [ ] Czy wszystkie hasła i Webhooki wstrzykujesz dynamicznie za pomocą mechanizmu `secrets`?