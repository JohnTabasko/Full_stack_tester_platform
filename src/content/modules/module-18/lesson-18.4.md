# Przepływ Pracy Testera w Git — Współpraca, Review i Diagnostyka

> **Perspektywa Full Stack Testera**
> Git to nie tylko miejsce, gdzie zapisujesz kod. To narzędzie, które pozwala Ci współpracować z zespołem, recenzować zmiany innych, diagnozować problemy i odtwarzać przeszłe stany projektu. Gdy smoke test zaczyna padać po merge do main, a zespół potrzebuje szybko znaleźć winowajcę — Git jest Twoim pierwszym sprzymierzeńcem. W tej lekcji zdobędziesz praktyczne umiejętności zarządzania gałęziami, pisania czytelnych commitów, przeprowadzania efektywnych review i wykorzystywania historii Git do diagnozowania regresji. Nauczysz się również, jak pisać commit messages, które będą dokumentacją decyzji, nie tylko listą zmian.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Organizować** pracę z testami w gałęziach Git
- **Pisać** commit messages zgodne z konwencją Conventional Commits
- **Tworzyć** pull requesty z jasnym opisem ryzyka i sposobu weryfikacji
- **Rozwiązywać** konflikty merge w sposób bezpieczny dla testów
- **Korzystać** z `git bisect` do znajdowania commitów wprowadzających regresję
- **Stosować** rebase i merge w odpowiednich kontekstach
- **Wykorzystywać** historię Git do diagnostyki problemów

---

## Wprowadzenie — Git jako narzędzie jakości oprogramowania

Git jest repozytorium decyzji. Każdy commit to zapis: „w tym momencie podjęliśmy taką decyzję, zmieniliśmy to i tamto, z tego powodu". Dla testera automatyzującego ta historia jest bezcenna, ponieważ pozwala:

- **Znaleźć**, kto i kiedy zmienił zachowanie testu
- **Zrozumieć**, dlaczego test zaczął padać (czy to zmiana w testach, czy w aplikacji?)
- **Odtworzyć** stan sprzed regresji i potwierdzić, że problem rzeczywiście istniał
- **Wycofać** zmiany w sposób kontrolowany

---

## Sytuacja przewodnia — regresja po merge

Po merge gałęzi `feature/new-checkout` do `main` zaczyna padać smoke test na ścieżce checkout. Zespół ma 2 godziny na znalezienie przyczyny i naprawę przed release'em. Twoja rola jako testera: pomóc zidentyfikować commit, przygotować szybki fix i zachować czytelną historię.

---

## 1. Branching — organizacja pracy z testami

### 1.1 Konwencja nazewnictwa gałęzi

```bash
# ✅ DOBRZE: opisowe nazwy z prefiksem
feature/add-checkout-tests
feature/test-user-registration
bugfix/fix-flaky-login-test
hotfix/smoke-checkout-regression
refactor/improve-page-objects

# ❌ ŹLE: bezsensowne nazwy
fix
test
temp
asdf1234
```

### 1.2 Workflow Git dla testera

```bash
# 1. Rozpocznij od aktualnego main
git checkout main
git pull origin main

# 2. Utwórz gałąź dla nowego testu
git checkout -b feature/test-order-history

# 3. Pracuj — commity małe i częste
git add tests/e2e/orders/order-history.spec.ts
git commit -m "feat(tests): add order history smoke test

- verifies orders list loads within 3s
- checks pagination works correctly
- validates filtering by date range

Issue: QA-1234"

# 4. Push i otwórz PR
git push -u origin feature/test-order-history
```

### 1.3 Zakres commita — ile zmian?

**Zasada:** Jeden commit = jedna logiczna zmiana.

```bash
# ✅ DOBRZE: mały, skoncentrowany commit
git commit -m "test: add smoke test for login page

Adds @smoke test covering:
- successful login with valid credentials
- error message on invalid password
- redirect to dashboard after login

Issue: QA-567"

# ❌ ŹLE: zbyt duży commit — mieszanka niezwiązanych zmian
git commit -m "lots of changes"
# Nie da się tego review'ować ani wycofać selektywnie
```

### 1.4 Amend — poprawianie ostatniego commita

```bash
# Zapomniałeś dodać plik lub źle napisałeś message?
git add forgotten-file.ts
git commit --amend  # Zmienia SHA ostatniego commita!

# ⚠️ Uwaga: nie amenduj commitów już wypushowanych na współdzieloną gałąź!
# Tylko na gałęzi lokalnej lub PR w statusie draft
```

---

## 2. Conventional Commits — konwencja commit messages

### 2.1 Format Conventional Commits

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Typy (types):**

| Typ | Zastosowanie |
|-----|-------------|
| `feat` | Nowa funkcjonalność testowa |
| `fix` | Naprawa błędu w teście |
| `test` | Dodanie lub modyfikacja testów |
| `refactor` | Refaktoryzacja kodu testowego |
| `chore` | Zmiany konfiguracyjne (package.json, tsconfig) |
| `docs` | Dokumentacja |
| `perf` | Optymalizacja wydajności testów |
| `ci` | Zmiany w CI/CD pipeline |

**Scope** — opcjonalny zakres (np. nazwa modułu, strony, komponentu)

### 2.2 Przykłady commit messages

```bash
# Nowy test E2E
git commit -m "feat(checkout): add full checkout flow E2E test

- tests complete checkout from cart to confirmation
- verifies payment processing via Stripe mock
- validates order confirmation email trigger

Closes QA-1234"

# Naprawa flaky testu
git commit -m "fix(login): resolve intermittent timeout on forgot password

The test was failing due to insufficient wait time for email API.
Increased timeout from 5s to 15s and added retry logic.

Fixes QA-2345"

# Refaktoryzacja
git commit -m "refactor(pages): extract common form component

Replaces duplicate form handling across login, registration,
and password reset pages with shared FormComponent class.

No functional changes."

# Zmiana konfiguracji
git commit -m "chore(config): increase default timeout to 30s

Tests running on CI are slower than local execution.
Adjusting default timeout to reduce false negatives.

Related to infra#456"

# Fix produkcyjny
git commit -m "fix(critical): revert broken API test assertion

The test was asserting on wrong field name (totalPrice vs orderTotal.amount).
Reverting to make CI green while backend team fixes the contract.

Hotfix for release v2.1.0
Regression introduced in 3a2b4c5"
```

### 2.3 Lint commit messages automatycznie

```bash
# Zainstaluj commitlint
npm install --save-dev @commitlint/cli @commitlint/config-conventional

# commitlint.config.js
export default { extends: ['@commitlint/config-conventional'] };

# Skonfiguruj Husky do automatycznego lintowania
npx husky add .husky/commit-msg 'npx commitlint --edit $1'
```

---

## 3. Pull Request — skuteczna współpraca

### 3.1 Szablon PR dla testów

```markdown
<!-- .github/pull_request_template.md -->

## Opis

<!-- Co zostało zmienione i dlaczego? -->

## Typ zmiany

- [ ] Nowy test E2E
- [ ] Modyfikacja istniejącego testu
- [ ] Naprawa flaky testu
- [ ] Refaktoryzacja
- [ ] Zmiana konfiguracji

## Scenariusze testowe

<!-- Jakie scenariusze są pokryte? -->

1. Logowanie poprawnymi danymi → przekierowanie na dashboard
2. Logowanie błędnym hasłem → komunikat błędu
3. Przypomnienie hasła → email wysłany

## Ryzyko

<!-- Co może się zepsuć? Na co zwrócić uwagę przy review? -->

- ⚠️ Test zależy od zewnętrznego API (Stripe) — mock może się różnić od produkcji
- ⚠️ Timeout 10s może być za krótki na CI — sprawdzić na staging
- ✅ Niska ryzyko — tylko UI changes, brak zmian w logice backendu

## Weryfikacja

<!-- Jak reviewer może przetestować zmianę? -->

```bash
npm run test:smoke
npm run test --grep "@login"
npx playwright test tests/e2e/auth/login.spec.ts --debug
```

## Screenshots / Nagrania

<!-- Załącz screenshot z trace lub video błędu (jeśli dotyczy) -->

## Checklist

- [ ] Testy przechodzą lokalnie (`npm test`)
- [ ] TypeScript kompiluje się bez błędów (`npm run typecheck`)
- [ ] ESLint nie zgłasza problemów (`npm run lint`)
- [ ] Nowe testy mają `@tag` (np. `@smoke`, `@regression`)
- [ ] Commit messages zgodne z Conventional Commits
```

### 3.2 Strategia review dla testów

**Co reviewer powinien sprawdzić:**

1. **Czy test pokrywa realny scenariusz użytkownika?**
   - Czy to nie jest test przypadkowy „bo łatwo napisać"?
   - Czy test weryfikuje zachowanie, nie implementację?

2. **Czy test jest stabilny?**
   - Czy są odpowiednie waitForSelector zamiast waitForTimeout?
   - Czy timeouty są wystarczające dla CI?

3. **Czy typy są poprawne?**
   - Czy odpowiedzi API są typowane?
   - Czy helpery są generyczne gdzie trzeba?

4. **Czy kod jest czytelny?**
   - Czy Page Objects są używane zamiast selectorów w teście?
   - Czy nazwy testów są opisowe?

5. **Czy są odpowiednie asercje?**
   - Czy test sprawdza najważniejsze elementy, nie wszystko?
   - Czy błąd w teście da jasny komunikat?

### 3.3 Współpraca z developerem przy testach

```bash
# PR zawiera tylko testy, ale wymaga zmiany API contract
# W PR description wyraźnie zaznacz to:

## ⚠️ Wymaga współpracy z Backend

Ta zmiana testuje nowe pole `orderTotal.amount` w odpowiedzi API.
**Backend musi dodać to pole PRZED merge, inaczej test nie przejdzie.**

- Backend issue: BE-789
- Estimated: Sprint 24

Albo: rozważ użycie mocka/stuba dla tego pola.

## Alternatywne podejście

```typescript
// Tymczasowo użyj mock API dopóki backend nie doda pola
test('checkout calculates total correctly', async ({ page, apiMock }) => {
  apiMock.mockResponse('/api/order', {
    orderTotal: { amount: 199.99, currency: 'PLN' }
  });
  
  // Test...
});
```

---

## 4. Rebase vs Merge — kiedy co wybrać?

### 4.1 Merge — zachowuje historię

```bash
# Merge gałęzi feature do main
git checkout main
git merge feature/test-checkout

# Historia:
# main:     A---B---C---M (merge)
#                \     /
# feature:       D---E
```

**Kiedy używać:** Na współdzielonych gałęziach (main, release). Zachowuje pełną historię integracji — widać, kiedy gałąź feature została włączona.

### 4.2 Rebase — porządkuje historię lokalną

```bash
# Rebase feature na aktualny main
git checkout feature/test-checkout
git rebase main

# Historia po rebase:
# main:     A---B---C
# feature:            D'---E' (nowe commity na szczycie main)
```

**Kiedy używać:** Na gałęziach lokalnych PR. Tworzy liniową, czystą historię. Łatwiejsza do czytania `git log`.

### 4.3 Interactive rebase — sprzątanie historii

```bash
# Zmień ostatnie 5 commitów
git rebase -i HEAD~5

# W edytorze:
pick a1b2c3d feat: add login test
pick d4e5f6g feat: add logout test
pick g7h8i9j test: fix typo in login test
pick j1k2l3m test: add checkout test
pick m4n5o6p chore: update timeout

# Możesz:
# - squashać (s) kilka commitów w jeden
# - rewordować (r) commit message
# - usunąć (d) commit
# - zmienić kolejność (przeciągnąć)

# Po zapisie — nowe commity z edytowanymi message:
pick a1b2c3d feat: add authentication tests
s d4e5f6g <-- squash into previous
s g7h8i9j <-- fix typo, include in squash
pick j1k2l3m feat: add checkout test
pick m4n5o6p chore: update timeout
```

### 4.4 Bezpieczne praktyki

```bash
# ❌ NIGDY nie rób rebase na współdzielonej gałęzi!
git rebase origin/main  # OK dla własnej gałęzi
# ale:
git rebase origin/main  # ❌ GROŹNE jeśli ktoś inny też na niej pracuje

# ✅ Zawsze miej aktualny main przed rebase
git checkout feature/test-checkout
git fetch origin
git rebase origin/main

# ✅ Jeśli współdzielona gałąź ma nowe commity — merge (nie rebase)
git checkout feature/test-checkout
git merge origin/main  # Bezpieczne, zachowuje historię
```

---

## 5. Git bisect — znajdowanie regresji

### 5.1 Kiedy używać?

Gdy masz:
- **Powtarzalny test**, który pada
- **Znaną wersję**, która działała (np. tag `v1.2.0`)
- **Znaną wersję**, która nie działa (np. obecny `HEAD`)

Git bisect binary search po historii, aby znaleźć commit wprowadzający regresję.

### 5.2 Przykład użycia

```bash
# 1. Rozpocznij bisect
git bisect start

# 2. Oznacz obecną wersję jako złą (regresja)
git bisect bad

# 3. Oznacz ostatnią działającą wersję jako dobrą
git bisect good v1.12.0

# Git wskazuje commity do przetestowania:
# Bisecting: 15 commits left to test after this (roughly 4 steps)
# [abc123d] feat: add user profile page

# 4. Uruchom test na wskazanym commicie
git checkout abc123d
npm install
npm run test:smoke  # lub konkretny test

# 5. Oznacz wynik
git bisect bad  # jeśli test pada
# lub
git bisect good  # jeśli test działa

# Git automatycznie przechodzi do następnego commita
# Powtarzaj kroki 4-5 aż Git wskaże podejrzany commit:

# abc4567 is the first bad commit
# commit abc4567
# Author: Developer Name <dev@example.com>
# Date:   Mon Jun 23 10:30:00 2024
#
#     fix(checkout): change total price calculation
#     
#     - moved calculation to frontend for performance
#     - WARNING: may cause precision issues with decimals
```

### 5.3 Automatyczny bisect

```bash
# Uruchom bisect automatycznie z skryptem
git bisect start
git bisect bad
git bisect good v1.12.0
git bisect run npm run test:smoke

# Git automatycznie uruchomi test i oznaczy commity
# Po zakończeniu wskaże winowajcę:
# 3b4c5d6 is the first bad commit
```

### 5.4 Cleanup po bisect

```bash
# Zakończ bisect — wróć do pierwotnej gałęzi
git bisect reset

# Alternatywnie: wróć do main
git bisect reset HEAD
git checkout main
```

---

## 6. Rozwiązywanie konfliktów

### 6.1 Kiedy powstają konflikty?

Konflikty powstają, gdy dwie gałęzie zmieniły tę samą część pliku. Git nie wie, którą wersję wybrać.

```bash
# Konflikt podczas merge
git merge feature/test-checkout
# Auto-merging tests/e2e/checkout/checkout.spec.ts
# CONFLICT (content): Merge conflict in tests/e2e/checkout/checkout.spec.ts
```

### 6.2 Struktura konfliktu

```typescript
<<<<<<< HEAD (nasze zmiany)
const expectedStatus = 'COMPLETED';
=======
const expectedStatus = 'PAID';
>>>>>>> feature/test-checkout (ich zmiany)
```

### 6.3 Rozwiązywanie krok po kroku

```bash
# 1. Sprawdź, które pliki mają konflikty
git status
# both modified:   tests/e2e/checkout/checkout.spec.ts

# 2. Otwórz plik i rozwiąż konflikt
# Edytuj ręcznie — zachowaj jedną wersję lub połącz obie

# 3. Oznacz jako rozwiązane
git add tests/e2e/checkout/checkout.spec.ts

# 4. Zakończ merge
git commit  # Git otworzy editor z domyślnym message
```

### 6.4 Strategie rozwiązywania konfliktów w testach

```typescript
// Scenariusz: konflikt w timeoutach

<<<<<<< HEAD
const timeout = 5000;
=======
const timeout = 15000;
>>>>>>> feature/test-checkout

// Rozwiązanie: jeśli oba podejścia są słuszne — połącz je
const timeout = Math.max(5000, 15000);  // bezpieczniejsze dla CI

// LUB: zostaw dłuższą wartość (bezpieczniejsza)
const timeout = 15000;
```

### 6.5 Abort — anulowanie ryzykownego merge

```bash
# Nie podoba Ci się merge?
git merge --abort

# Cofasz wszystko — wracasz do stanu sprzed merge
```

---

## 7. Revert i Cherry-pick — kontrola historii

### 7.1 Revert — bezpieczne wycofanie

```bash
# Wycofanie konkretnego commita (bez usuwania z historii)
git revert abc4567

# Tworzy nowy commit z odwrotną zmianą:
# Revert "fix(checkout): change total price calculation"
# 
# This reverts commit abc4567.

# ✅ BEZPIECZNE dla współdzielonych gałęzi — nie modyfikuje historii
```

### 7.2 Cherry-pick — przenoszenie pojedynczego commita

```bash
# Przenieś commit z feature na release branch
git checkout release/v2.1
git cherry-pick abc4567

# Tworzy kopię commita abc4567 na obecnej gałęzi
# Idealne do hotfixów — przenieś poprawkę bez merge całej gałęzi

# Cherry-pick z message:
git cherry-pick -x abc4567  # -x dodaje info o oryginalnym commicie
```

### 7.3 Praktyczny przykład: hotfix release

```bash
# 1. Znajdź commit z poprawką na main
git log --oneline main | head -10
# abc4567 fix(checkout): resolve total price rounding (2 hours ago)
# def7890 feat(checkout): new checkout flow (5 hours ago)

# 2. Przenieś na release branch
git checkout release/v2.0
git cherry-pick -x abc4567
# [release/v2.0 abc1234] fix(checkout): resolve total price rounding
# (cherry picked from commit abc4567)

# 3. Push i deploy
git push origin release/v2.0

# 4. Wróć do pracy
git checkout main
```

---

## 8. Gitignore — kontrolowanie tego, co trafia do repo

### 8.1 Typowy .gitignore dla projektu Playwright

```gitignore
# === Build outputs ===
node_modules/
dist/
build/

# === Playwright artifacts ===
test-results/
playwright-report/
playwright/.cache/
videos/
traces/
*.trace
*.zip

# === Environment ===
.env
.env.local
.env.production

# === IDE ===
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# === Logs ===
*.log
npm-debug.log*

# === Temporary ===
*.tmp
*.temp
.tmp/

# === Coverage ===
coverage/
.nyc_output/

# === Secrets ===
*.pem
*.key
credentials.json
secrets.yml
```

### 8.2 Sprawdzenie, co jest ignorowane

```bash
# Sprawdź status z ignorowanymi plikami
git status --ignored

# Sprawdź czy plik jest ignorowany
git check-ignore -v some-file.env
```

---

## 9. Lista kontrolna Git dla testera

| Element | Status | Uwagi |
|---------|--------|-------|
| Nazwy gałęzi z prefiksem (feature/, bugfix/) | ☐ | |
| Commit messages zgodne z Conventional Commits | ☐ | |
| Małe, skoncentrowane commity | ☐ | |
| PR z opisem ryzyka i sposobu weryfikacji | ☐ | |
| Brak sekretów w repozytorium | ☐ | |
| .gitignore obejmuje wszystkie artifact-y | ☐ | |
| Konflikty rozwiązywane świadomie | ☐ | |
| git bisect znany i używany w razie regresji | ☐ | |

---

## Perspektywa Full Stack Testera

Git to narzędzie, które zamienia Cię z „pisarza testów" w „inżyniera jakości". Gdy rozumiesz:
- **Historię commitów** — możesz wskazać, kiedy i dlaczego test zaczął padać
- **Mechanizmy merge** — wiesz, jak bezpiecznie integrować zmiany z zespołem
- **git bisect** — możesz znaleźć winowajcę regresji w minutach, nie godzinach
- **Konwencje commitów** — Twoje zmiany są czytelne dla całego zespołu

...zyskujesz pozycję osoby, która nie tylko pisze testy, ale też chroni jakość na poziomie całego procesu deweloperskiego.

---

## Podsumowanie

- **Konwencja nazewnictwa gałęzi** (feature/, bugfix/, hotfix/) porządkuje pracę
- **Conventional Commits** (feat, fix, test, chore) tworzą czytelną historię
- **Pull Request template** dokumentuje cel, ryzyko i sposób weryfikacji zmiany
- **Rebase vs merge** — rebase dla lokalnej historii, merge dla współdzielonych gałęzi
- **git bisect** to najszybszy sposób na znalezienie commita wprowadzającego regresję
- **Konflikty** rozwiązuj świadomie — nie automatycznie akceptuj „ich" wersję
- **Revert i cherry-pick** pozwalają na kontrolowane zarządzanie historią

---

## Linki i źródła

- **[Conventional Commits](https://www.conventionalcommits.org/)** — oficjalna specyfikacja
- **[Git Branching Strategies](https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows)** — różne podejścia do branchingu
- **[Git Bisect — Pro Git Book](https://git-scm.com/book/en/v2/Git-Tools-Debugging-with-Git)** — szczegółowy opis bisect
- **[Git Workflows — Atlassian](https://www.atlassian.com/git/tutorials/comparing-workflows)** — porównanie workflowów Git
- **[Writing Good Commit Messages — FreeCodeCamp](https://www.freecodecamp.org/news/writing-good-commit-messages-a-practical-guide/)** — praktyczny przewodnik
- **[Husky — Git Hooks](https://typicode.github.io/husky/)** — automatyzacja lintowania commitów
- **[Git Extras — CLI Tools](https://github.com/tj/git-extras)** — dodatkowe polecenia Git
---

## Rebase, merge, revert i reset

Tester pracujący z kodem musi rozumieć podstawowe operacje Git:

- `merge` zachowuje historię gałęzi;
- `rebase` przepisuje historię lokalnej gałęzi na nowszą bazę;
- `revert` tworzy commit odwracający zmianę;
- `reset` przesuwa wskaźnik branch — ostrożnie, szczególnie na gałęziach współdzielonych.

W pracy zespołowej bezpieczniej odwrócić zmianę przez `git revert` niż przepisywać historię main.

## `git bisect` jako narzędzie testera

Jeśli nie wiadomo, który commit wprowadził regresję, `git bisect` pozwala znaleźć winny commit przez binarne przeszukiwanie historii.

```bash
git bisect start
git bisect bad
git bisect good <known-good-commit>
# uruchamiaj test i oznaczaj good/bad
```

To bardzo praktyczne przy regresjach E2E i performance.

## Conventional Commits i czytelna historia

Komunikaty commitów pomagają w release notes i analizie zmian:

```text
feat(auth): add storage state setup
fix(checkout): preserve coupon after refresh
test(api): add contract tests for orders
```

Historia Git jest narzędziem diagnostycznym, nie tylko archiwum kodu.
