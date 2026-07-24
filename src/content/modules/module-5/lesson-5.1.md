# Architektura i cykl życia silnika testowego Playwright Test

Playwright Test to nie jest zwykła biblioteka asercyjna, którą podłączamy do losowego runnera. To kompletny, wysoce zoptymalizowany pod kątem współbieżności i wydajności **silnik wykonawczy (test runner)**. Samodzielnie odpowiada za pełen cykl życia testów: od transpilacji kodu TypeScript w locie, poprzez orkiestrację procesów workerów, aż po diagnostykę i generowanie raportów.

Zrozumienie niskopoziomowej architektury silnika Playwright Test pozwoli Ci projektować testy, które są szybkie, stabilne i łatwe w debugowaniu w środowiskach CI/CD.

---

## 1. Jak Playwright przetwarza kod testu? (In-Memory Transpilation)

Kiedy uruchamiasz komendę `npx playwright test`:
1.  **Analiza konfiguracji**: Playwright wczytuje plik `playwright.config.ts`, sprawdzając parametry środowiskowe, timeouty, projekty i reportery.
2.  **Transpilacja w pamięci (On-the-fly Transpilation)**: Playwright nie wymaga wcześniejszego kompilowania kodu TypeScript do JavaScript za pomocą `tsc`. Silnik posiada wbudowany kompilator **esbuild**. Kod testów, klas POM i helperów jest błyskawicznie kompilowany do JS bezpośrednio w pamięci RAM roboczej przed wykonaniem.
3.  **Discovery (Skanowanie plików)**: Skanowane są foldery testowe w poszukiwaniu plików pasujących do wzorca `testMatch` (np. `.spec.ts`).

---

## 2. Architektura procesów roboczych (Worker Threads)

Playwright Test realizuje model **pełnej izolacji procesów (Process Isolation)**:
*   **Główny proces orkiestrujący (Test Runner Coordinator)**: Odpowiada za wczytanie konfiguracji, planowanie zadań i agregację wyników. Nie uruchamia sam testów.
*   **Procesy robocze (Workers)**: Główny proces uruchamia niezależne procesy systemu operacyjnego (Worker Processes). Każdy worker wykonuje testy w swoim własnym wątku roboczym i posiada własną instancję przeglądarki.

```
       +-------------------------------------------------+
       |           Główny proces orkiestrujący           |
       |             (Playwright Coordinator)            |
       +-------------------------------------------------+
              /                  |                  \
             v                   v                   v
+--------------------+ +--------------------+ +--------------------+
|  Worker Process 1  | |  Worker Process 2  | |  Worker Process N  |
| (Chromium Instance)| | (Firefox Instance) | | (WebKit Instance)  |
+--------------------+ +--------------------+ +--------------------+
```

### Konsekwencje izolacji:
1.  **Brak współdzielenia pamięci**: Zmienne globalne w plikach testowych nie są współdzielone między różnymi wątkami roboczymi (workerami). Każdy test musi sam przygotować i sprzątnąć swój stan.
2.  **Odporność na awarie**: Jeśli test w wątku roboczym 1 wywoła błąd krytyczny przeglądarki (crash), proces workera 1 zostanie natychmiast ubity przez koordynatora, a pozostałe procesy (workery 2..N) będą kontynuować bez zakłóceń. Koordynator powoła nowy proces workera 1 do wykonania pozostałych zaplanowanych dla niego testów.

---

## 3. Cykl życia wykonania testu (Test Lifecycle Timeline)

Cykl życia pojedynczego testu składa się z trzech nadrzędnych faz:

```
[Start Test] ──> Faza Setup (beforeAll / beforeEach)
                      │
                      v
                 Faza Act (Kod testu / test.step)
                      │
                      v
                 Faza Teardown (afterEach / afterAll) ──> [End Test]
```

### A. Faza Setup (Przygotowanie)
Uruchamiane są powiązane hooki `beforeAll` i `beforeEach` oraz inicjalizowane są fixtury zadeklarowane w parametrach testu (np. tworzenie strony, wczytywanie sesji użytkownika).

### B. Faza Act (Wykonanie i Dokumentowanie Kroki)
Wykonanie właściwego kodu scenariusza testowego. Aby zachować maksymalną przejrzystość w raportach, kroki biznesowe należy grupować przy użyciu metody `test.step()`:

```typescript
await test.step('Krok 1: Dodanie produktu do koszyka', async () => {
  await page.getByRole('button', { name: 'Dodaj' }).click();
  await expect(page.locator('.badge')).toHaveText('1');
});
```

### C. Faza Teardown (Sprzątanie)
Uruchamiane są hooki `afterEach` i `afterAll`. Następuje wyłączenie kontekstów przeglądarki oraz ewentualny eksport logów, trace i nagrań wideo w przypadku wykrycia błędów.

---

## 4. Odczyt metadanych w locie (`testInfo`)

Obiekt `testInfo` jest przekazywany jako automatyczny parametr do każdego testu i daje pełen wgląd w metadane i parametry uruchomienia testu:

```typescript
test('sprawdzenie parametrów środowiskowych', async ({ page }, testInfo) => {
  console.log(`Aktualna próba: ${testInfo.retry}`); // Pokazuje numer ponowienia (0, 1, 2)
  console.log(`Nazwa projektu: ${testInfo.project.name}`); // np. 'chromium'
  console.log(`Ścieżka do wyników: ${testInfo.outputPath()}`);
});
```

---

## 5. Checklista Architektury Runnera
- [ ] Czy rozumiesz, że każdy Worker to całkowicie niezależny proces systemu operacyjnego i nie współdzielą one pamięci globalnej?
- [ ] Czy grupujesz logiczne etapy testu w czytelne kroki biznesowe przy użyciu `test.step`?
- [ ] Czy wykorzystujesz obiekt `testInfo` do dynamicznego odczytu metadanych wykonania testu (np. numeru ponowienia `retry`)?