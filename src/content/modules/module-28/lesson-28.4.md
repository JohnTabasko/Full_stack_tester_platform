# Zadania rekrutacyjne i programowanie na żywo

> Live coding i zadania rekrutacyjne to nie egzaminy — to rozmowy techniczne prowadzone przez pisanie kodu. Rekruter ocenia nie tylko poprawność rozwiązania, ale też sposób myślenia, komunikację założeń i umiejętność dyskusji o kompromisach. W tej lekcji przygotujesz się do typowych zadań QA automation: od debugowania niestabilnego testu, przez pisanie testu API, po live coding z czasowym ograniczeniem.

## Jak czytać ten moduł

Czytaj tę lekcję z perspektywą „praktyki", nie „teorii". Każda sekcja zawiera przykładowe zadanie z rozwiązaniem i omówieniem. Po przeczytaniu spróbuj rozwiązać zadanie samodzielnie, a dopiero potem sprawdź rozwiązanie. Najlepsze przygotowanie do live coding to regularna praktyka — codziennie jedno zadanie, 15-30 minut.

Trzy zasady lekcji:

1. **Myśl na głos.** W live coding rekruter słucha Twojego procesu myślowego. Milczenie to najgorsza strategia.
2. **Zacznij od czegoś, co działa.** Nie próbuj od razu pisać idealnego rozwiązania. Napisz wersję, która działa, a potem ją ulepszaj.
3. **Pytaj o założenia.** Założenia to najczęstsze źródła błędów w live coding. Lepiej pytać na początku niż pisać nie to, czego oczekuje rekruter.

---

## Cel lekcji

Ta lekcja koncentruje się na: **typowe zadania QA automation, debugowanie niestabilnego testu, zadanie API, zadanie SQL, live coding i rozmowa techniczna metodą STAR**. Główne ryzyko: **kandydat zna narzędzia, ale podczas rozmowy nie komunikuje założeń, nie diagnozuje metodycznie i nie uzasadnia kompromisów**. Po lekturze powinieneś umieć podejść do live coding z jasnym procesem, odpowiedzieć na typowe pytania rekrutacyjne i pokazać, że potrafisz nie tylko pisać testy, ale też myśleć o nich strategicznie.

**Perspektywa Full Stack Testera:** Rekruter nie szuka osoby, która wie wszystko — szuka osoby, która potrafi myśleć, komunikować i rozwiązywać problemy. Live coding pokazuje te cechy lepiej niż CV.

---

## Sytuacja przewodnia

Podczas live coding kandydat dostaje test Playwright, który ma problemy: używa `waitForTimeout`, ma kruchy XPath locator i brak asercji skutku. Rekruter pyta: „Co jest nie tak z tym testem? Jak to naprawisz? Dlaczego tak?" — to nie tylko test umiejętności, ale test sposobu myślenia.

---

## 1. Live coding jako komunikacja

W live coding chodzi o coś innego niż szybkość pisania. Chodzi o:

- **Komunikację procesu:** pokazujesz, jak myślisz o problemie
- **Współpracę:** pytasz o założenia, weryfikujesz rozumienie
- **Adaptację:** dostosowujesz rozwiązanie do feedbacku
- **Świadomość kompromisów:** wiesz, że idealne rozwiązanie nie istnieje

### Schemat odpowiedzi podczas live coding

```
1. Powtórz wymaganie własnymi słowami.
   „Czyli mam napisać test, który sprawdza formularz logowania?"

2. Zapytaj o założenia i dane.
   „Czy mam dostęp do już zalogowanego użytkownika? 
   Czy formularz jest na stronie /login? 
   Co się dzieje przy błędzie — jest alert czy komunikat inline?"

3. Zaproponuj plan.
   „Najpierw napiszę wersję prostą (fill + click + expect), 
   żeby zobaczyć, czy działa. Potem dodam lepsze lokatory 
   i asercje."

4. Pisz kod iteracyjnie.
   Pisz po jednym kroku, uruchamiaj, pokazuj wynik.

5. Opisz, co poprawiłbyś w produkcji.
   „W produkcji dodałbym soft assertions, screenshot na awarię, 
   parallelizację i data builder zamiast losowych danych."

6. Podziękuj i zapytaj o feedback.
   „Czy jest coś, co chciałbyś, żebym rozwinął lub zmienił?"
```

### Czego unikać

- **Nie milcz.** Rekruter nie widzi Twoich myśli. Mów, co robisz i dlaczego.
- **Nie pytaj za dużo na raz.** Jedno pytanie naraz — po odpowiedzi idź dalej.
- **Nie trać czasu na formatowanie.** Playwright nie wymaga perfect indentation pod presją czasu.
- **Nie ignoruj błędów kompilacji.** Jeśli TypeScript krzyczy, napraw to — w produkcji też byś naprawił.

---

## 2. Typowe zadania Playwright — seria A (formularz logowania)

### Zadanie A1: Napisz test logowania

**Treść:** Napisz test, który sprawdza, że użytkownik może się zalogować prawidłowymi danymi.

**Założenia do zweryfikowania:**
- Jaki jest URL strony logowania?
- Jakie są etykiety pól email i hasła?
- Co się dzieje po udanym logowaniu — jaki jest URL lub element potwierdzający?
- Jakie dane testowe mam użyć?

**Rozwiązanie krok po kroku:**

```typescript
// Krok 1: Zrozum strukturę strony
// Sprawdź w devtools: jakie są atrybuty role, label, test-id?

// Krok 2: Napisz test prosty (działa, nie idealny)
test('użytkownik loguje się prawidłowymi danymi', async ({ page }) => {
  await page.goto('/login');
  
  // Użyj semantycznych lokatorów — stabilniejsze niż CSS/XPath
  await page.getByLabel('Adres e-mail').fill('test@example.test');
  await page.getByLabel('Hasło').fill('Correct-Horse-Battery-7!');
  await page.getByRole('button', { name: 'Zaloguj się' }).click();
  
  // Asercja skutku — nie tylko „nie ma błędu", ale „jest sukces"
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('heading', { name: 'Witaj' })).toBeVisible();
});
```

**Co poprawić w produkcji:**

```typescript
// Wersja produkcyjna — z fikstrą, soft assertions, cleanup
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { test as authenticatedTest } from '../fixtures/auth.fixture';

authenticatedTest('użytkownik loguje się prawidłowymi danymi', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  await expect(loginPage.emailInput).toBeVisible();
  await loginPage.login('test@example.test', 'Correct-Horse-Battery-7!');
  
  // Soft assertion — nie failuj na pierwszym błędzie
  await expect.soft(page).toHaveURL(/\/dashboard/);
  await expect.soft(page.getByRole('heading')).toContainText('Witaj');
  
  // Potwierdzenie w bazie danych
  const session = await db.query(
    'SELECT user_id FROM sessions WHERE user_email = $1 LIMIT 1',
    ['test@example.test']
  );
  expect(session.rows).toHaveLength(1);
});
```

---

### Zadanie A2: Debugowanie flaky test

**Treść:** Ten test czasem pada na CI, ale przechodzi lokalnie. Co jest nie tak?

```typescript
// BAD: flaky.spec.ts
test('użytkownik widzi komunikat po zapisaniu', async ({ page }) => {
  await page.goto('/profile');
  await page.click('[data-testid="save-button"]'); // kruchy CSS selector
  await page.waitForTimeout(2000); // waitForTimeout — ANTY-PATTERN
  await expect(page.locator('.message.success')).toBeVisible(); // kruchy class selector
});
```

**Diagnoza:**

1. **Problem:** `waitForTimeout(2000)` — czas jest losowy. Jeśli backend potrzebuje 3s, test pada.
2. **Problem:** `[data-testid="save-button"]` — atrybut może się zmienić. Jeśli developer przepisze komponent, test się zepsuje.
3. **Problem:** `.message.success` — nazwa klasy może być generowana (BEM, CSS modules). To kruchy locator.

**Rozwiązanie:**

```typescript
// GOOD: stabilne rozwiązanie
test('użytkownik widzi komunikat po zapisaniu', async ({ page }) => {
  await page.goto('/profile');
  
  // Semantyczny lokator zamiast data-testid
  const saveButton = page.getByRole('button', { name: 'Zapisz zmiany' });
  
  await saveButton.click();
  
  // Czekaj na komunikat sukcesu — nie na czas, ale na stan
  const successMessage = page.getByRole('status').or(
    page.getByText('Zapisano pomyślnie')
  );
  await expect(successMessage).toBeVisible({ timeout: 10_000 });
});
```

**Metoda debugowania flaky test:**

```
1. Klasyfikuj problem:
   - Timing: test pada losowo, zależy od sieci/procesora
   - Data: test pada zależnie od stanu bazy/sesji
   - Logic: test pada zawsze, ale na różnych krokach
   - Infrastructure: test pada tylko na CI (środowisko)

2. Zbierz artefakty:
   - screenshot na awarię (Playwright robi to automatycznie)
   - trace viewer (uploaduj przy awarii)
   - video (przydatne przy timing issues)
   - logs z CI

3. Hipotezy:
   - „Może to timing issue" → sprawdź, czy waitForTimeout jest w kodzie
   - „Może to race condition" → uruchom test 10x z `--repeat-each`
   - „Może to dane" → sprawdź, czy cleanup działa między testami

4. Eksperyment:
   - Usuń waitForTimeout, zamień na expect
   - Dodaj logging przed kluczowymi krokami
   - Zmniejsz parallelizację, sprawdź czy flaky znika

5. Trwała naprawa:
   - Zamień flaky test na deterministyczny
   - Dodaj regression test, żeby flaky nie wrócił
   - Jeśli nie możesz naprawić — dodaj do quarantine z alertem
```

---

## 3. Typowe zadania Playwright — seria B (API testing)

### Zadanie B1: Test kontraktu API

**Treść:** Napisz test API, który sprawdza kontrakt punktu `/api/products`.

```typescript
// Krok 1: Pobierz response
// Sprawdź status code, headers, body structure

test('GET /api/products zwraca poprawny kontrakt', async ({ request }) => {
  const response = await request.get('/api/products');
  
  // Status code — zgodny z REST semantics
  expect(response.status()).toBe(200);
  
  // Content-Type
  expect(response.headers()['content-type']).toContain('application/json');
  
  // Body structure — JSON Schema validation
  const body = await response.json();
  expect(Array.isArray(body)).toBe(true);
  
  if (body.length > 0) {
    const product = body[0];
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('price');
    expect(typeof product.price).toBe('number');
    expect(product.price).toBeGreaterThan(0);
  }
});

test('GET /api/products/{id} zwraca 404 dla nieistniejącego produktu', async ({ request }) => {
  const response = await request.get('/api/products/non-existent-id');
  expect(response.status()).toBe(404);
  
  const body = await response.json();
  expect(body).toHaveProperty('error');
  expect(body.error).toMatch(/not found/i);
});
```

### Zadanie B2: CRUD przez API z walidacją w bazie

**Treść:** Napisz test, który tworzy produkt przez API, sprawdza zapis w bazie, aktualizuje, usuwa i sprawdza cleanup.

```typescript
test('CRUD produktu — pełny cykl z weryfikacją w bazie', async ({ request, db }) => {
  // CREATE
  const createResponse = await request.post('/api/products', {
    data: {
      name: 'Test Product',
      price: 99.99,
      categoryId: 'cat-electronics',
    },
  });
  expect(createResponse.status()).toBe(201);
  const created = await createResponse.json();
  const productId = created.id;
  expect(productId).toBeDefined();
  
  // VERIFY in DB — create
  const dbResult = await db.query(
    'SELECT name, price FROM products WHERE id = $1',
    [productId]
  );
  expect(dbResult.rows).toHaveLength(1);
  expect(dbResult.rows[0].name).toBe('Test Product');
  expect(Number(dbResult.rows[0].price)).toBe(99.99);
  
  // UPDATE
  const updateResponse = await request.patch(`/api/products/${productId}`, {
    data: { price: 79.99 },
  });
  expect(updateResponse.status()).toBe(200);
  
  // VERIFY in DB — update
  const updated = await db.query('SELECT price FROM products WHERE id = $1', [productId]);
  expect(Number(updated.rows[0].price)).toBe(79.99);
  
  // DELETE
  const deleteResponse = await request.delete(`/api/products/${productId}`);
  expect(deleteResponse.status()).toBe(204);
  
  // VERIFY in DB — delete
  const deleted = await db.query('SELECT id FROM products WHERE id = $1', [productId]);
  expect(deleted.rows).toHaveLength(0);
});
```

---

## 4. Typowe zadania Playwright — seria C (SQL i baza danych)

### Zadanie C1: Setup i cleanup danych przez bazę

**Treść:** Napisz fiksturę, która tworzy użytkownika bezpośrednio w bazie i usuwa go po teście.

```typescript
// fixtures/db-user.fixture.ts
import { test as base, Page } from '@playwright/test';
import { Pool } from 'pg';

type DbUserFixture = {
  dbUser: {
    id: string;
    email: string;
    name: string;
  };
  page: Page; // strona zalogowana jako ten użytkownik
};

export const test = base.extend<DbUserFixture>({
  dbUser: async ({ dbPool }, use) => {
    const client = await dbPool.connect();
    
    // Generate unique email
    const timestamp = Date.now();
    const email = `qa-auto-${timestamp}@example.test`;
    
    // CREATE
    const result = await client.query(
      `INSERT INTO users (email, name, role, created_at)
       VALUES ($1, $2, 'customer', NOW())
       RETURNING id, email, name`,
      [email, `Test User ${timestamp}`]
    );
    const user = result.rows[0];
    
    // Use fixture
    await use(user);
    
    // CLEANUP
    try {
      await client.query('DELETE FROM sessions WHERE user_id = $1', [user.id]);
      await client.query('DELETE FROM orders WHERE user_id = $1', [user.id]);
      await client.query('DELETE FROM users WHERE id = $1', [user.id]);
    } catch (cleanupError) {
      console.error('Cleanup failed:', cleanupError);
    } finally {
      client.release();
    }
  },
  
  page: async ({ browser, dbUser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Setup cookies/session for this user
    // (e.g., by using API to get auth token, then setting cookie)
    
    await use(page);
    await context.close();
  },
});

// Usage in test
test('użytkownik widzi swoje zamówienia', async ({ dbUser, page }) => {
  await page.goto('/orders');
  await expect(page.getByText(dbUser.email)).toBeVisible();
});
```

### Zadanie C2: Walidacja integralności danych

**Treść:** Po rejestracji użytkownika przez UI sprawdź, że rekord w bazie zawiera poprawne dane, timestamp i domyślne wartości.

```typescript
test('rejestracja użytkownika tworzy poprawny rekord w bazie', async ({ page, dbPool }) => {
  const uniqueEmail = `test-${Date.now()}@example.test`;
  
  // Act — register through UI
  await page.goto('/register');
  await page.getByLabel('Imię i nazwisko').fill('Jan Kowalski');
  await page.getByLabel('Adres e-mail').fill(uniqueEmail);
  await page.getByLabel('Hasło').fill('SecurePass123!');
  await page.getByRole('button', { name: 'Zarejestruj się' }).click();
  
  // Assert — verify in database
  const result = await dbPool.query(
    `SELECT name, email, role, email_verified, created_at 
     FROM users WHERE email = $1`,
    [uniqueEmail]
  );
  
  expect(result.rows).toHaveLength(1);
  const user = result.rows[0];
  expect(user.name).toBe('Jan Kowalski');
  expect(user.email).toBe(uniqueEmail);
  expect(user.role).toBe('customer'); // default value
  expect(user.email_verified).toBe(false); // default value
  expect(user.created_at).toBeTruthy(); // timestamp is set
  
  // Verify timestamp is recent (within last 10 seconds)
  const createdAt = new Date(user.created_at).getTime();
  const now = Date.now();
  expect(now - createdAt).toBeLessThan(10_000);
});
```

---

## 5. Rozmowa techniczna metodą STAR

STAR (Situation, Task, Action, Result) to metoda strukturyzowania odpowiedzi na pytania behawioralne. W kontekście QA automation dodajemy jeszcze metrykę lub dowód.

### Format STAR+Metric

```
SITUATION: W jakim kontekście to się wydarzyło?
  „W firmie X pracowałem w zespole 5-osobowym, który odpowiadał za 
   automatyzację testów aplikacji SaaS."

TASK: Jaki był Twój cel lub wyzwanie?
  „Mój cel polegał na zmniejszeniu czasu regresji z 45 do 20 minut, 
   żeby feedback dla programistów był szybszy."

ACTION: Co konkretnie zrobiłeś?
  „Przeanalizowałem logi i zidentyfikowałem, że setup danych (tworzenie 
   użytkowników przez UI) zajął 4 sekundy na test. Przetestowałem trzy 
   opcje: setup przez UI, API i bezpośrednio w bazie. Wybrałem API 
   (APIRequestContext) — 100ms zamiast 4s. Dodałem parallelizację 
   (sharding 3 workerów). Zmieniłem retry policy z 0 na 1."

RESULT: Co osiągnąłeś i jak to zmierzyłeś?
  „Czas regresji spadł z 45 do 18 minut (60% redukcja). 
   Pass rate wzrósł z 96% do 99.2%. 
   Zmniejszyłem liczbę flaky tests z 8 do 1."

METRIC: Jaka jest konkretna liczba?
  „Zmniejszyłem czas regresji o 60%, co przełożyło się na szybszy 
   feedback dla zespołu deweloperskiego (z 45 do 18 minut)."
```

### Typowe pytania STAR w QA automation

| Pytanie | Co oczekiwane |
|---|---|
| „Opowiedz o sytuacji, gdy musiałeś naprawić niestabilny test." | Opis problemu, analizy, hipotezy, naprawy i wyników |
| „Opowiedz o sytuacji, gdy nie zgadzałeś się z decyzją zespołu." | Sytuacja, argumentacja, kompromis lub escalacja |
| „Opowiedz o najtrudniejszym bugu, który znalazłeś." | Reprodukcja, izolacja, współpraca z developerem, dowód |
| „Opowiedz o sytuacji, gdy musiałeś pracować pod presją czasu." | Priorytetyzacja, komunikacja, wynik |
| „Opowiedz o sytuacji, gdy nauczyłeś się czegoś nowego na własną rękę." | Samodzielność, proces nauki, zastosowanie |

---

## 6. Przykładowe pytania na rozmowach technicznych QA Automation

### Pytania o strategię

**Q: Jak decydujesz, które testy zautomatyzować?**
```
A: Analizuję ryzyko: prawdopodobieństwo awarii × koszt awarii. 
   Priorytetyzuję krytyczne ścieżki użytkownika (happy path) 
   i regresyjne ryzyko zmian. Automatyzuję testy, które:
   - Są wykonywane często (regresja na każdym PR)
   - Mają niski koszt automatyzacji vs. wysoki koszt awarii manualnej
   - Są stabilne (nie zmieniają się często)
   
   Nie automatyzuję:
   - Testów eksploracyjnych
   - Testów jednorazowych
   - Testów niestabilnych funkcjonalności (early development)
```

**Q: Jak mierzysz skuteczność testów automatycznych?**
```
A: Mierzę kilka metryk:
   - Pass rate: > 98% na PR, > 95% na nightly
   - Flaky rate: < 2% (cel: 0%)
   - Mean time to detect (MTTD): ile minęło od commitu do detekcji
   - Mean time to repair (MTTR): ile minęło od detekcji do naprawy
   - Coverage: % krytycznych ścieżek pokrytych testami
   
   Regularnie przeglądam metryki i usuwam testy, które nie dają 
   wartości (redundantne, niestabilne, zbyt wolne).
```

### Pytania o narzędzia

**Q: Dlaczego Playwright, a nie Cypress lub Selenium?**
```
A: Wybrałem Playwright, bo:
   - Wsparcie dla wielu przeglądarek (Chromium, Firefox, WebKit)
   - APIRequestContext do testów API bez osobnej biblioteki
   - Trace viewer — najlepsze narzędzie do debugowania
   - Parallelizacja out of the box
   - Strong typing z TypeScript
   
   Cypress jest dobry dla prostych testów React, ale ma 
   ograniczenia w multi-tab i API testing.
   Selenium jest dojrzały, ale wolniejszy i wymaga więcej boilerplate.
```

**Q: Jak radzisz sobie z flaky tests?**
```
A: Mój proces:
   1. Klasyfikacja: timing vs. data vs. logic vs. infrastructure
   2. Artefakty: screenshot, trace, video, logs
   3. Hipotezy: ustalenia przyczyny root cause
   4. Naprawa: determinystyczne waitFor zamiast timeout, 
      izolacja danych, retry policy
   5. Prewencja: regression test dla każdego naprawionego flaky test,
      quarantine dla nienaprawialnych, monitoring flaky rate w CI
```

### Pytania o współpracę

**Q: Jak współpracujesz z programistami?**
```
A: Kilka praktyk:
   - Uczestniczę w refinement — proponuję testy na podstawie AC
   - Robię code review testów (Pull Request reviews)
   - Komunikuję wyniki testów na stand-up (krótko, bez detali)
   - Piszę bug reports z clear steps to reproduce i screenshotami
   - Dyskutuję ryzyko przed release'em — nie wszystko musi być naprawione
```

**Q: Co robisz, gdy test pada na CI, ale nie na lokalnej maszynie?**
```
A: Krok po kroku:
   1. Pobieram trace z CI — analizuję network, console, steps
   2. Sprawdzam różnice w środowisku (Node version, system libs)
   3. Uruchamiam test wielokrotnie lokalnie z `--repeat-each`
   4. Sprawdzam różnice w danych (czy CI ma czystą bazę?)
   5. Sprawdzam timing — CI może być wolniejszy pod load
   6. Jeśli nie mogę zreprodukować — dodaję logging i retry
```

---

## 7. Checklisty przygotowania do rozmowy

### Przed rozmową — pipeline testów (pipeline review)

Przejrzyj swój projekt przed rozmową i upewnij się, że:

- [ ] Testy przechodzą lokalnie bez błędów
- [ ] Pipeline CI kończy się sukcesem
- [ ] README wyjaśnia projekt i decyzje architektoniczne
- [ ] Masz screenshoty raportów, trace viewer i CI pipeline
- [ ] Potrafisz uruchomić testy od zera na czystej maszynie
- [ ] Znasz metryki: pass rate, flaky rate, czas regresji

### Przed live coding — praktyka

Przećwicz przed lustrem lub z kolegą:

- [ ] Napisz test logowania z POM i fikstrą
- [ ] Napisz test API (GET, POST, 404)
- [ ] Napisz test bazy danych (SELECT, INSERT, cleanup)
- [ ] Debuguj flaky test: znajdź problem, zaproponuj naprawę
- [ ] Opowiedz o projekcie w 2 minuty (problem → rozwiązanie → wynik)
- [ ] Odpowiedz na 5 typowych pytań STAR

### Checklist na dzień przed rozmową

- [ ] Sprawdź URL rozmowy i wszystkie linki
- [ ] Przygotuj link do portfolio/GitHuba
- [ ] Przygotuj laptop z uruchomionym projektem
- [ ] Sprawdź connection internetu i jakość audio
- [ ] Przygotuj wodę — będziesz mówić przez godzinę
- [ ] Przygotuj pytania do rekrutera (zawsze zadawaj pytania)

---

## Perspektywa Full Stack Testera

Rozmowa rekrutacyjna to dwukierunkowa rozmowa: rekruter ocenia Ciebie, Ty oceniasz firmę. Najlepsi kandydaci traktują rozmowę jako okazję do pokazania sposobu myślenia, nie tylko wiedzy. Potrafią przyznać się do luk, ale też pokazać, jak je zamykają. Potrafią mówić o kompromisach, bo wiedzą, że idealne rozwiązanie nie istnieje. I potrafią się uczyć — bo w tech jedyną stałą jest zmiana.

---

## Podsumowanie

- **Live coding:** Myśl na głos, zacznij od działającego rozwiązania, pytaj o założenia, iteruj
- **Debugowanie flaky tests:** Klasyfikuj → zbierz artefakty → hipotezy → eksperyment → trwała naprawa
- **Zadania API:** Testuj kontrakt (status, headers, body), testuj CRUD z weryfikacją w bazie
- **Zadania SQL:** Setup/teardown przez bazę, walidacja integralności danych
- **STAR+Metric:** Situation → Task → Action → Result → Metric — struktura odpowiedzi na pytania behawioralne
- **Pytania techniczne:** Strategia, narzędzia, współpraca — przygotuj przykłady z własnego doświadczenia
- **Przed rozmową:** Przećwicz live coding, przejrzyj pipeline, przygotuj portfolio

---

## Linki i źródła

- [Playwright Best Practices — Timeouts](https://playwright.dev/docs/api/class-locator#locator-wait-for) — jak prawidłowo czekać na elementy, unikając waitForTimeout
- [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer) — oficjalna dokumentacja najpotężniejszego narzędzia debugowania Playwright
- [STAR Method — USAJobs](https://www.usaJOBS.gov/careerplanning/STAR.aspx) — oryginalna metoda STAR dla odpowiedzi behawioralnych
- [Flaky Tests — Martin Fowler](https://martinfowler.com/articles/nonDeterminism.html) — głęboka analiza niesteterminizmu w testach
- [API Testing Best Practices — Restful Booker](https://restful-booker.herokuapp.com/) — otwarta aplikacja do ćwiczenia testów API
- [SQL Exercises — SQLZoo](https://sqlzoo.io/) — interaktywne ćwiczenia SQL, przydatne do przygotowania zadań bazodanowych
- [Code Interview Practice — Excalidraw](https://excalidraw.com/) — narzędzie do wspólnego rysowania diagramów podczas rozmowy (przydatne do wyjaśniania architektury)
---

## Zadania rekrutacyjne — jak pokazać trade-offy

W zadaniu rekrutacyjnym nie chodzi o napisanie maksymalnej liczby testów. Rekruter chce zobaczyć decyzje:

- co testujesz przez UI;
- co przez API;
- co zostawiasz jako unit/contract;
- jakie ryzyka pomijasz świadomie;
- jak debugujesz awarię;
- jak przygotowujesz dane.

Dobrą praktyką jest dodanie krótkiego pliku `TEST_STRATEGY.md`, nawet jeśli zadanie tego nie wymaga.

## Security/privacy checklist dla publicznego repo

Przed publikacją portfolio sprawdź:

- brak tokenów i sekretów;
- brak prawdziwych danych osobowych;
- `.env.example` zamiast `.env`;
- storageState nie jest w repo;
- screenshoty nie pokazują prywatnych danych;
- historia Git nie zawiera przypadkowo sekretów.
