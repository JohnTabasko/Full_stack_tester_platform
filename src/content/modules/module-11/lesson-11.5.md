# Optymalizacja i dobre praktyki rurociągów CI/CD

Wdrożenie testów w CI/CD to sukces, ale powolne testy trwające po kilkadziesiąt minut szybko stają się zmorą i wąskim gardłem zespołu. Deweloperzy zaczynają omijać testy, a czas dostarczania oprogramowania (Time-to-Market) rośnie.

Profesjonalna inżynieria rurociągów (CI Pipeline Engineering) wymaga ciągłej dbałości o wydajność i koszty maszyn wirtualnych. W tej lekcji nauczysz się zaawansowanych technik optymalizacji: **cache'owania zależności**, **równoległych kompilacji matrycowych (Matrix Builds)** oraz **publikacji raportów na GitHub Pages**.

---

## 1. Cache'owanie zależności (Skip Downloads, Save 80% Time)

Podczas każdego uruchomienia rurociągu, maszyna wirtualna pobiera od nowa setki megabajtów zależności z rejestru npm oraz binarne przeglądarki Playwright. Cache'owanie pozwala zapisać te katalogi w chmurze i przy kolejnym uruchomieniu przywrócić je w zaledwie **kilka sekund**:

```yaml
    # A. Przywróć node_modules z pamięci podręcznej (Cache)
    - name: Cache Node Modules
      uses: actions/cache@v4
      id: npm-cache
      with:
        path: ~/.npm
        key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
        restore-keys: |
          ${{ runner.os }}-node-

    # B. Przywróć binarne wersje przeglądarek Playwright
    - name: Cache Playwright Browsers
      uses: actions/cache@v4
      id: playwright-cache
      with:
        path: ~/.cache/ms-playwright
        key: ${{ runner.os }}-playwright-${{ hashFiles('**/package-lock.json') }}

    - name: Install dependencies
      run: npm ci

    # C. Pobierz przeglądarki TYLKO wtedy, gdy nie zostały przywrócone z cache
    - name: Install Playwright Browsers (Conditional)
      if: steps.playwright-cache.outputs.cache-hit != 'true'
      run: npx playwright install --with-deps
```

Dzięki temu zabiegowi, czas przygotowania środowiska na czystej maszynie spada z 5 minut do **mniej niż 45 sekund**!

---

## 2. Kompilacje Matrycowe (Matrix Builds) i wielosystemowość

Jeśli musisz zagwarantować, że aplikacja działa bezbłędnie na różnych systemach operacyjnych (Linux, macOS, Windows) oraz przeglądarkach, używanie pojedynczego joba zajmie mnóstwo czasu. 

Zamiast tego wdroż **Matrix Builds**, który uruchomi niezależne, równoległe kontenery dla każdej konfiguracji:

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false # Jeśli jeden element matrycy padnie, pozwól pozostałym skończyć
      matrix:
        os: [ ubuntu-latest, macos-latest, windows-latest ]
        browser: [ chromium, firefox ]
```

---

## 3. Automatyczna publikacja raportów na GitHub Pages

Ściąganie pliku `.zip` z raportem w GitHub Actions i rozpakowywanie go na dysku lokalnym w celu analizy błędów jest uciążliwe. 

Zalecanym standardem z 2026 r. jest **automatyczna publikacja raportu jako strony internetowej** w usłudze GitHub Pages bezpośrednio po nieudanym rurociągu:

```yaml
    # Krok publikacji raportu na GitHub Pages (wywoływany po testach)
    - name: Deploy Playwright Report to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: always()
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./playwright-report
        user_name: 'github-actions[bot]'
        user_email: 'github-actions[bot]@users.noreply.github.com'
```

Po zakończeniu testów zespół otrzymuje podsumowanie na Slacku z bezpośrednim linkiem (np. `https://my-org.github.io/my-repo/index.html`) dającym natychmiastowy dostęp do raportu i plików Trace w przeglądarce!

---

## 4. Checklista Optymalizacji CI/CD
- [ ] Czy wdrożyłeś cache'owanie katalogu `~/.npm` oraz globalnego folderu przeglądarek Playwright?
- [ ] Czy ograniczyłeś instalowanie przeglądarek warunkiem `cache-hit`?
- [ ] Czy używasz Matrix Builds do równoległych testów wielośrodowiskowych?
- [ ] Czy ułatwiłeś zespołowi analizę błędów, publikując raporty na GitHub Pages bezpośrednio z rurociągu CI?