# Matryca kompetencji testera full stack

> Matryca kompetencji to mapa, która pokazuje, gdzie jesteś, dokąd zmierzasz i jak zamierzasz się tam dostać. Nie jest listą narzędzi w CV — jest narzędziem do planowania rozwoju i komunikowania poziomu dojrzałości. W tej lekcji zbudujesz matrycę dla siebie: ocenisz obecny poziom, zidentyfikujesz luki i zaplanujesz konkretne kroki rozwoju po kursie.

## Jak czytać ten moduł

Czytaj tę lekcję z perspektywą „ actionable" — każda sekcja kończy się konkretnym zadaniem, które możesz wykonać. Matryca kompetencji bez planu działania to tylko tabela. Z tabelą nie zmienisz swojej sytuacji zawodowej. Z planem — możesz.

Trzy zasady lekcji:

1. **Poziom kompetencji ≠ lata doświadczenia.** Senior nie jest tym, kto programuje od 10 lat — jest tym, kto rozumie, co testować, kiedy i jak, oraz umie komunikować te decyzje.
2. **Dowód jest lepszy niż deklaracja.** „Znam Playwright" to deklaracja. „Napisałem 50 testów Playwright, które przechodzą na CI z 99% pass rate" to dowód.
3. **Luki są Twojąmapą rozwoju.** Każda zidentyfikowana luka to nie porażka — to kierunek, w którym warto zainwestować czas.

---

## Cel lekcji

Ta lekcja koncentruje się na: **oczekiwania wobec junior, mid i senior automation QA, mapa umiejętności full stack testera, samoocena, identyfikacja luk kompetencyjnych i plan rozwoju po kursie**. Główne ryzyko: **kandydat deklaruje znajomość wielu narzędzi, ale nie potrafi pokazać poziomu samodzielności, decyzji technicznych ani wpływu na jakość projektu**. Po lekturze powinieneś umieć ocenić swój obecny poziom kompetencji, zidentyfikować konkretne luki i zapisać plan rozwoju w formie mierzalnych celów.

**Perspektywa Full Stack Testera:** Matryca kompetencji nie jest dla rekrutera — jest dla Ciebie. Rekruter patrzy na dowody. Ty patrzysz na mapę. Ta lekcja pomoże Ci zbudować obie.

---

## Sytuacja przodnia

Tester kończy kurs Playwright i chce ocenić, czy jest gotowy do roli junior automation QA, mid QA automation czy full stack testera w zespole produktowym. Nie ma pewności, gdzie jest luka — wie tylko, że nie wie wszystkiego. Matryca kompetencji pomoże mu zidentyfikować konkretne obszary i zaplanować rozwój.

---

## 1. Mapa kompetencji full stack testera

Full stack tester to nie „tester, który zna wszystko". To tester, który rozumie cały cykl życia produktu: od wymagań, przez implementację, po monitoring w produkcji. Każdy poziom dojrzałości oznacza inne zakresy odpowiedzialności i inne oczekiwania.

### Macierz poziomów kompetencji

Poniższa tabela pokazuje oczekiwania na trzech poziomach. Nie chodzi o to, żeby mieć wszystko na poziomie „expert" — chodzi o to, żeby wiedzieć, gdzie jesteś i gdzie chcesz być.

| Obszar | Junior Automation QA | Mid QA Automation | Senior QA Automation |
|---|---|---|---|
| **Playwright podstawy** | Pisze proste testy z pomocą. Rozumie locators i assertions. | Samodzielnie projektuje testy dla funkcji. Zna waits i timeouts. | Projektuje architekturę testów, refaktoryzuje istniejące, optymalizuje. |
| **Playwright zaawansowane** | Zna podstawowe config. | Retry, parallelizacja, sharding, custom reporters. | Trace viewer w CI, visual testing, multi-context testing, performance profiling. |
| **Page Object Model** | Wie, że istnieje. Stosuje gotowy wzorzec. | Samodzielnie tworzy POM z fikstrami. Rozumie enkapsulację. | Projektuje hierarchię klas POM, decyduje o podziale odpowiedzialności. |
| **API testing** | Potrafi wysłać request przez Postman. | Pisze testy API z APIRequestContext. Rozumie status codes. | Kontrakty API, walidacja schematu, testowanie edge cases, GraphQL. |
| **Baza danych** | Potrafi przeczytać zapytanie SELECT. | Pisze SELECT, INSERT, UPDATE. Rozumie cleanup. | Optymalizuje zapytania, rozumie transakcje, indeksy, schematy. |
| **Dane testowe** | Wie, że dane są potrzebne. | Tworzy fikstury z setup/teardown. Stosuje data builders. | Architektura fikstur na poziomie projektu, mockowanie danych, testowanie na produkcyjnych snapshotach. |
| **CI/CD** | Uruchamia testy w GitHub Actions z pomocą dokumentacji. | Konfiguruje pipeline, publishuje artefakty, integruje z notification. | Optymalizuje pipeline, wdraża gating, rollback strategies, trigger optimization. |
| **Debugowanie** | Wie, że można otworzyć devtools. | Używa trace viewer, analizuje screenshots, rozumie network. | Klasyfikuje flaky tests, pisze regression suite dla konkretnych bugów. |
| **Raportowanie** | Wie, że Playwright generuje raport. | Konfiguruje raporty HTML + JUnit, rozumie metryki. | Buduje dashboard metryk, śledzi pass rate, flakiness rate, coverage trend. |
| **Współpraca** | Raportuje bugi. Uczestniczy w refinements. | Proponuje testy dla user stories. Dyskutuje ryzyko z teamem. | Reprezentuje QA w architectural decisions. Mentoruje młodszych testerów. |
| **Strategia** | Wykonuje zadania z instrukcją. | Projektuje testy dla feature'u, proponuje poziom testu. | Projektuje strategię jakości dla produktu, definiuje metryki jakości, zarządza test pyramid. |

### Jak czytać tabelę

Każda komórka opisuje nie poziom wiedzy, lecz poziom działania. Senior nie „wie" o CI/CD — „projektuje" pipeline. Mid nie „zna" POM — „tworzy" go samodzielnie. Junior nie „rozumie" locators — „pisze" proste testy z pomocą.

Nie chodzi o absoluty. Chodzi o to, czy jesteś w stanie wykonać daną czynność samodzielnie, bez pomocy i z dobrze znanym wynikiem.

---

## 2. Poziom Junior Automation QA — co to znaczy w praktyce

Junior automation QA to osoba, która potrafi wykonywać zadania testowe pod kierunkiem bardziej doświadczonych kolegów. Nie projektuje strategii — realizuje ją. Nie definiuje standardów — stosuje je.

### Typowe oczekiwania

- **Playwright:** Potrafi napisać test z `test()` i `expect()`, użyć `getByRole()`, `fill()`, `click()`. Rozumie różnicę między `toBeVisible()` a `toBeAttached()`. Zna podstawową konfigurację `playwright.config.ts`.
- **Lokatory:** Wie, że `getByRole()` i `getByLabel()` są stabilniejsze niż XPath. Potrafi użyć Chrome DevTools do znalezienia elementu.
- **Struktura:** Stosuje POM, jeśli wzorzec jest pokazany. Nie projektuje go samodzielnie.
- **API:** Potrafi wysłać request w Postman i odczytać response. Rozumie, co to jest JSON.
- **Dane:** Tworzy proste dane przez UI. Wie, że po teście trzeba posprzątać.
- **CI:** Uruchamia testy w GitHub Actions, jeśli konfiguracja jest gotowa.
- **Komunikacja:** Raportuje bugi z clear steps to reproduce. Uczestniczy w refinement sessions.

### Dowody na poziom junior

Dowody na poziom junior w portfolio:

```markdown
## Demonstrated competence (Junior)

### Playwright
- Napisałem 12 testów dla przepływu logowania i rejestracji
- Stosuję POM (LoginPage, RegistrationPage) zgodnie ze wzorcem
- Testy uruchamiam w GitHub Actions na każdym PR

### Przykładowy test
```typescript
test('użytkownik widzi komunikat błędu przy nieprawidłowym haśle', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('jan@example.test', 'wrong-password');
  await expect(loginPage.errorMessage).toContainText('Nieprawidłowy adres e-mail lub hasło');
});
```

### Co wiem, że muszę rozwinąć
- Debugowanie flaky tests (kiedy test pada na CI, ale przechodzi lokalnie)
- Setup danych przez API (obecnie tworzę dane przez UI)
- Raportowanie — chcę zrozumieć, jak interpretować pass rate i trends
```

---

## 3. Poziom Mid QA Automation — co to znaczy w praktyce

Mid QA automation to osoba, która samodzielnie projektuje i realizuje testy dla funkcji. Rozumie nie tylko „jak", ale też „dlaczego". Potrafi ocenić ryzyko i zaproponować poziom testu.

### Typowe oczekiwania

- **Playwright:** Samodzielnie projektuje testy dla feature'u. Zna wszystkie typy `expect`, `waitFor`, `softExpect`. Konfiguruje retry, parallelizację, custom fixtures.
- **POM:** Samodzielnie tworzy POM z fikstrami. Rozumie różnicę między fikstrą a helperem. Enkapsuluje logikę setup i teardown.
- **API:** Pisze testy API z APIRequestContext. Rozumie REST semantics, waliduje status codes, nagłówki i ciała response. Potrafi napisać test kontraktu.
- **Baza danych:** Pisze SELECT, INSERT, UPDATE. Tworzy cleanup. RozumieForeign Key constraints i cascade.
- **Dane:** Stosuje data builder pattern. Tworzy fikstury z setup/teardown na poziomie pliku i projektu.
- **CI/CD:** Konfiguruje pipeline z artefaktami, retry, sharding. Integruje z notification tools (Slack, email).
- **Debugowanie:** Używa trace viewer, analizuje screenshots, rozumie network timeline. Klasyfikuje problemy jako timing vs. logic vs. data.
- **Raportowanie:** Konfiguruje raporty HTML + JUnit + JSON. Rozumie metryki: pass rate, flaky rate, coverage.
- **Komunikacja:** Proponuje testy dla user stories. Dyskutuje ryzyko z zespołem. Prezentuje wyniki testów na stand-up.

### Dowody na poziom mid

```markdown
## Demonstrated competence (Mid)

### Samodzielne projekty
- Zaprojektowałem strategię testów dla funkcji „Koszyk" — 24 testy (UI + API + DB)
- Zidentyfikowałem 3 flaky tests i naprawiłem je przez refaktoryzację waits
- Zmniejszyłem czas testów o 35% przez setup danych przez API zamiast UI

### Optymalizacja danych
```typescript
// BEFORE: Setup przez UI (~4s na test)
test.beforeEach(async ({ page }) => {
  await page.goto('/register');
  await page.getByLabel('Email').fill(`test-${Date.now()}@example.test`);
  // ... 10 kroków formularza
});

// AFTER: Setup przez API (~100ms na test)
test.beforeEach(async ({ request }) => {
  const user = await request.post('/api/users', {
    data: { email: `test-${Date.now()}@example.test`, role: 'customer' }
  });
  test.info().annotations.push({ type: 'user-id', description: (await user.json()).id });
});
```

### Metryki z CI
- Pass rate: 98.5% (2 testy w quarantine)
- Flaky rate: 1.5% (spadek z 8% w Q1)
- Czas regresji: 22 min → 14 min (parallelizacja 3 workerów)
```

---

## 4. Poziom Senior QA Automation — co to znaczy w praktyce

Senior QA automation projektuje strategię jakości na poziomie produktu, nie pojedynczego testu. Definiuje standardy, zarządza zespołem lub mentoruje młodszych kolegów, i reprezentuje QA w decyzjach architektonicznych.

### Typowe oczekiwania

- **Strategia:** Projektuje test pyramid dla produktu. Definiuje politykę testów (co, kiedy, gdzie). Zarządza test coverage i quality gates.
- **Architektura:** Projektuje architekturę testów na poziomie frameworka. Decyduje o podziale na POM, fixtures, helpers, utils. Zarządza wersjami i migracjami.
- **Platforma:** Wdraża unified testing platform (jedna konfiguracja dla wielu produktów). Integruje wiele narzędzi (Playwright + API + DB + Performance).
- **CI/CD:** Projektuje pipeline z feature flags, canary releases, rollback strategies. Optymalizuje koszty i czas na poziomie całego systemu.
- **Monitoring:** Wdraża observability (logs, metrics, traces). Analizuje pass rate trends, flaky tests patterns, test effectiveness.
- **Team:** Mentoruje młodszych testerów. Pisze documentation i runbooks. Reprezentuje QA w architectural decision records.
- **Kompromisy:** Świadomie wybiera między szybkością a głębokością, między pokryciem a kosztem, między automatyzacją a manualnym testingiem.

### Dowody na poziom senior

```markdown
## Demonstrated competence (Senior)

### Strategic impact
- Zaprojektowałem test pyramid dla platformy e-commerce: 
  800 unit tests + 120 API tests + 45 E2E tests
  - E2E: < 5% pokrycia kodu, ale 100% krytycznych ścieżek użytkownika
  - Feedback loop: unit < 1s, API < 30s, E2E < 15 min

### Platform development
- Wdrożyłem unified Playwright framework dla 3 produktów:
  - wspólna konfiguracja, fikstury i helpers
  - per-product test suites z override'ami
  - shared data builders i cleanup strategies
  - reduced duplicate code by 60%

### Quality metrics
- Wdrożyłem quality dashboard (Grafana + JUnit reports):
  - pass rate trend: 94% → 99.2%
  - flaky rate: 6% → 0.8%
  - mean time to detect: 4h → 45min (CI on PR)

### Mentorship
- Mentorowałem 2 juniorów: code review, pair testing, pair debugging
- Napisałem 5 runbooks: debugging flaky tests, adding new tests, CI troubleshooting
```

---

## 5. Samoocena — jak ocenić swój poziom

Samoocena jest trudna, bo ludzie mają tendencję do niedoszacowania (imposter syndrome) lub przeszacowania (Dunning-Kruger). Oto metody, które pomagają ocenić poziom obiektywnie.

### Metoda 1: Analiza portfolio

Spójrz na swoje projekty i oceń je według kryteriów:

| Pytanie | Tak/Nie |
|---|---|
| Czy umiem uruchomić projekt od zera bez pomocy? | ? |
| Czy moje testy używają stable locators (getByRole, getByLabel)? | ? |
| Czy mam fikstury z setup/teardown? | ? |
| Czy mam raport HTML z CI? | ? |
| Czy potrafię zdebugować flaky test samodzielnie? | ? |
| Czy potrafię napisać test API bez pomocy? | ? |
| Czy potrafię podłączyć się do bazy danych i napisać SELECT? | ? |
| Czy potrafię zrozumieć schemat bazy z dokumentacji? | ? |
| Czy mam retry i parallelizację w CI? | ? |
| Czy umiem wyjaśnić, dlaczego wybrałem dany wzorzec? | ? |

Liczby: 0-3 tak = junior, 4-6 tak = junior+/mid-, 7-8 tak = mid, 9-10 tak = mid+/senior.

### Metoda 2: Analiza zadań

Spójrz na swoje ostatnie zadania i oceń, ile z nich wykonałeś samodzielnie:

| Pytanie | Tak/Nie |
|---|---|
| Czy mogę napisać test Playwright bez szukania dokumentacji? | ? |
| Czy rozumiem, kiedy użyć `waitForSelector` vs `expect().toBeVisible()`? | ? |
| Czy potrafię zidentyfikować flaky test i naprawić go? | ? |
| Czy potrafię zaproponować, które testy dodać dla nowego feature'u? | ? |
| Czy potrafię ocenić ryzyko techniczne danej funkcji? | ? |
| Czy potrafię zaprojektować fiksturę dla danych testowych? | ? |
| Czy rozumiem, kiedy test API jest lepszy niż test UI? | ? |

### Metoda 3: Feedback zewnętrzny

Najdokładniejsza samoocena pochodzi od innych:

- Poproś code review od seniora i zapisz feedback
- Spytaj lidera QA, gdzie są Twoje największe luki
- Porównaj swoje testy z przykładami w dokumentacji Playwright
- Porównaj swoje CV z opisami stanowisk na LinkedIn (szukaj tych, które brzmią jak "to ja")

---

## 6. Plan rozwoju — od luki do celu

Zidentyfikowane luki są punktem wyjścia do planu rozwoju. Plan rozwoju różni się od listy życzeń tym, że ma konkretne cele, mierzalne wskaźniki i deadline.

### Szablon planu rozwoju

```markdown
## Plan rozwoju — Q3 2024

### Cel 1: Nauczyć się debugowania flaky tests
**Dlaczego:** Flaky tests blokują pipeline i obniżają zaufanie do testów. 
Problem powtarza się w CI, ale nie na lokalnej maszynie.

**Akcja:** 
1. Przeczytać dokumentację Playwright Trace Viewer (1h)
2. Przeanalizować 3 ostatnie flaky tests z trace (4h)
3. Napisać runbook "Jak diagnozować flaky tests" (2h)
4. Naprawić 2 flaky tests i dodać regression test (6h)

**Dowód:** 
- Runbook opublikowany w repo
- 2 flaky tests naprawione, pass rate wzrósł o 5%
- Regression test dla każdego naprawionego flaky test

**Deadline:** 2024-08-15

---

### Cel 2: Zbudować fikstury danych testowych z setup/teardown
**Dlaczego:** Obecnie tworzę dane przez UI, co jest wolne (4s/test) 
i niestabilne (zależy od UI). Chcę użyć API dla setupu.

**Akcja:**
1. Przeanalizować obecny setup danych w testach (1h)
2. Zidentyfikować wszystkie miejsca tworzenia danych (2h)
3. Stworzyć DataBuilder utility (4h)
4. Zmigrować 10 testów z UI setup na API setup (8h)
5. Zmierzyć czas regresji przed i po (0.5h)

**Dowód:**
- DataBuilder jest używany w 10+ testach
- Czas regresji spadł o X minut
- Testy są stabilne (0 flaky na nowym setupu)

**Deadline:** 2024-08-31

---

### Cel 3: Dodać monitoring jakości do CI (pass rate + flaky rate)
**Dlaczego:** Nie mam metryk jakości testów. 
Pass rate w CI nie jest śledzony w czasie.

**Akcja:**
1. Skonfigurować JUnit reporter w playwright.config.ts (1h)
2. Stworzyć dashboard w Grafana z JUnit data (4h)
3. Ustawić alert na flaky rate > 5% (2h)
4. Napisać weekly report automation (3h)

**Dowód:**
- Dashboard dostępny dla zespołu
- Alert działa i wysyła powiadomienia
- Weekly report generuje się automatycznie

**Deadline:** 2024-09-15
```

### Zasady pisania planu rozwoju

- **Jeden cel na raz.** Nie pisz 10 celów naraz — wybierz jeden, zrealizuj, przejdź do następnego.
- **Każda akcja jest mierzalna.** „Nauczyć się debugowania" nie jest akcją. „Przeanalizować 3 flaky tests z trace viewer" jest akcją.
- **Każdy cel ma dowód.** Skąd będziesz wiedział, że cel został osiągnięty? Dowód musi być obiektywny.
- **Każdy cel ma deadline.** Bez deadline'u plan jest listą życzeń. Deadline 3 miesiące to maksimum — w praktyce lepiej mieć 4-6 tygodni na cel.

---

## 7. Matryca jako narzędzie rekrutacyjne

Matryca kompetencji może być używana podczas rozmowy rekrutacyjnej jako mapa do dyskusji. Zamiast mówić „jestem na poziomie mid", możesz pokazać matrycę i powiedzieć:

```
„Patrząc na matrycę, jestem na poziomie mid w Playwright (samodzielne 
projektowanie testów) i mid- w API testing (APIRequestContext, ale jeszcze 
nie pisałem kontraktów). W CI/CD czuję się junior+ — potrafię skonfigurować 
pipeline, ale nie projektuję jeszcze całej strategii.

Moja największa luka to debugowanie flaky tests. Dlatego właśnie 
rozwijam się w tym kierunku — mam plan rozwoju na ten kwartał."
```

Ta wypowiedź pokazuje:

- **Samowiedza:** Wiesz, gdzie jesteś
- **Uczciwość:** Przyznajesz się do luk
- **Działanie:** Masz plan rozwoju
- **Konkretyzacja:** Mówisz o kompetencjach, nie o latach doświadczenia

---

## Przykład referencyjny: Matryca samooceny full stack testera

```markdown
# Matryca kompetencji — Jan Kowalski, QA Automation

## Playwright — poziom: mid
**Obecny poziom:** 
- Piszę testy dla funkcji samodzielnie
- Stosuję POM z fikstrami
- Konfiguruję CI z artefaktami i retry

**Dowody:**
- 85 testów w projekcie e-commerce
- Pass rate: 98.5%, flaky: 1.5%
- Pipeline na GitHub Actions z HTML report

**Luki:**
- Trace viewer w CI — używam tylko screenshots
- Visual testing — nie stosowałem nigdy
- Performance profiling — wiem, że istnieje, nie stosowałem

---

## API Testing — poziom: mid-
**Obecny poziom:**
- Piszę testy API z APIRequestContext
- Waliduję status codes i JSON body
- Rozumiem REST semantics

**Dowody:**
- 18 testów API (CRUD + błędy + autoryzacja)
- Testy kontraktu z walidacją JSON Schema

**Luki:**
- Nie pisałem testów GraphQL
- Nie używałem mock servers (MSW)
- Nie testowałem rate limiting i throttling

---

## Baza danych — poziom: junior+
**Obecny poziom:**
- Piszę SELECT i rozumiem schemat
- Tworzę cleanup danych po testach
- Używam pg z fikstrą

**Dowody:**
- 6 testów z weryfikacją zapisu w bazie
- Skrypt cleanup uruchamian afterEach

**Luki:**
- Nie rozumiem transakcji i rollback
- Nie wiem, jak testowaćForeign Key constraints
- Nie optymalizowałem zapytań

---

## Plan rozwoju — priorytety na następne 3 miesiące

| Priorytet | Cel | Deadline | Status |
|---|---|---|---|
| 1 | Trace viewer w CI (upload trace.zip jako artefakt) | 2024-07-15 | W trakcie |
| 2 | Setup danych przez API (data builder) | 2024-08-01 | Planowany |
| 3 | Mock server (MSW) dla testów API | 2024-08-15 | Planowany |
| 4 | Dashboard metryk jakości (Grafana + JUnit) | 2024-09-01 | Planowany |
```

---

## Perspektywa Full Stack Testera

Matryca kompetencji to nie jednorazowe ćwiczenie — to żywy dokument. Co kwartał przeglądaj ją i aktualizuj: co udało się rozwinąć, co nowe pojawiło się jako luka, co zmieniło się w wymaganiach rynku. Najlepsi testerzy, których znam, mają mentalną matrycę zaktualizowaną w głowie — wiedzą dokładnie, co potrafią, czego nie i co planują rozwijać. To daje im pewność na rozmowach rekrutacyjnych i klarowność w codziennej pracy.

---

## Podsumowanie

- **Mapa kompetencji:** Junior/Mid/Senior — każdy poziom ma inne oczekiwania i odpowiedzialności; poziom ≠ lata doświadczenia
- **Samoocena:** Trzy metody — analiza portfolio, analiza zadań, feedback zewnętrzny; unikaj imposter syndrome i Dunning-Kruger
- **Dowody:** Każdy poziom kompetencji powinien mieć mierzalne dowody w kodzie, metrykach i raportach
- **Luki jako plan:** Każda zidentyfikowana luka to kierunek rozwoju; plan rozwoju ma konkretne cele, akcje, dowody i deadline
- **Matryca jako narzędzie rekrutacyjne:** Pokazuje samowiedzę, uczciwość i działanie — trzy cechy, które rekrutenci cenią najbardziej
- **Aktualizacja:** Matryca jest żywym dokumentem — przeglądaj ją co kwartał, aktualizuj postępy i redefiniuj cele

---

## Linki i źródła

- [Playwright Test — Best Practices](https://playwright.dev/docs/best-practices) — oficjalne best practices, które pokazują poziom mid i senior
- [Test Automation Maturity Model — Lisa Crispin](https://www.agilealliance.org/author/lisa-crispin/) — model dojrzałości automatyzacji testów
- [Quality Assurance Competency Framework — ASTQB](https://www.astqb.org/) — ramy kompetencji QA, które mogą być używane jako matryca
- [Google's Testing Blog — Flaky Tests](https://testing.googleblog.com/) — artykuły o zarządzaniu flaky tests i metrykach jakości
- [99% Test Pass Rate — How to Get There](https://www.wearecaqa.com/post/achieving-99-test-pass-rate-playwright) — praktyczny poradnik o metrykach i stabilności testów
- [Software Testing Cupcake — Anti-Patterns](https://www.ministryoftesting.com/) — typowe błędy w architekturze testów, które pokazują poziom junior vs. senior
- [Career Ladders for Software Engineers — Sarah Drasner](https://career-ladders.dev/engineering/) — career laddering jako wzór dla matrycy kompetencji