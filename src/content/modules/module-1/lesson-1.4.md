# Głęboka konfiguracja `playwright.config.ts` klasy produkcyjnej

Plik `playwright.config.ts` to serce i mózg Twojego frameworka testowego. To tutaj podejmujesz kluczowe decyzje inżynieryjne wpływające na czas wykonania testów, ich stabilność w trudnych warunkach sieciowych, sposób generowania artefaktów diagnostycznych oraz strategię wielowątkowości.

Ślepe kopiowanie domyślnej konfiguracji to częsty błąd początkujących deweloperów. W tej lekcji przeanalizujemy każdą zaawansowaną opcję konfiguracyjną, abyś potrafił dostosować Playwrighta do rygorystycznych wymagań systemów korporacyjnych.

---

## 1. Architektura limitów czasowych (Timeouts Hierarchy)

Stabilność testów zależy od precyzyjnego zarządzania czasem. W Playwright występuje kilka niezależnych limitów czasowych (timeouts), które ściśle ze sobą współpracują. Zrozumienie ich hierarchii zapobiega problemom z fałszywymi awariami.

```
       +------------------------------------------------+
       |             Global Timeout (CI Level)          |
       |  Maksymalny czas na wykonanie całego test suite|
       +------------------------------------------------+
                               |
                               v
       +------------------------------------------------+
       |             Test Timeout (30s - 60s)           |
       |  Maksymalny czas na jeden pojedynczy test      |
       +------------------------------------------------+
            /                  |                  \
           v                   v                   v
+--------------------+ +--------------------+ +--------------------+
|   Expect Timeout   | |   Action Timeout   | | NavigationTimeout  |
|  Asercje (5s - 10s)| |   Interakcje (10s) | |page.goto() (15-30s)|
+--------------------+ +--------------------+ +--------------------+
```

### A. Test Timeout (Domyślnie 30s)
Określa maksymalny dopuszczalny czas na wykonanie jednego testu (w tym jego faz setup i teardown). Konfiguracja w pliku:
```typescript
timeout: 30 * 1000 // 30 sekund
```

### B. Expect Timeout (Domyślnie 5s)
Czas, przez który asercje Web-First (np. `expect(locator).toBeVisible()`) będą odpytywać (poll) strukturę DOM w poszukiwaniu oczekiwanego stanu przed rzuceniem błędu.
```typescript
expect: {
  timeout: 5000 // 5 sekund
}
```

### C. Action i Navigation Timeout
*   **Action Timeout**: Maksymalny czas, jaki pojedyncza akcja (np. `click()`, `fill()`) może czekać na spełnienie warunków gotowości elementu (actionability checklist). Domyślnie brak limitu (czeka do końca testu), co jest antywzorcem – zawsze ustawiaj jawny limit.
*   **Navigation Timeout**: Maksymalny czas na załadowanie strony podczas nawigacji (`page.goto()`).

Zalecana konfiguracja limitów w bloku `use`:
```typescript
use: {
  actionTimeout: 10 * 1000,     // 10 sekund na kliknięcie/wpisanie
  navigationTimeout: 20 * 1000, // 20 sekund na załadowanie strony
}
```

---

## 2. Wielowątkowość, Workers i Sharding (Parallelism Control)

Playwright jest niesamowicie szybki, ponieważ natywnie potrafi uruchamiać testy współbieżnie przy użyciu wielu procesów roboczych (**Workers**).

### A. Model działania Workerów
*   Każdy Worker to osobny, niezależny proces systemu operacyjnego.
*   Workery nie współdzielą ze sobą żadnego stanu ani pamięci (pełna izolacja).
*   Liczba workerów zależy bezpośrednio od liczby rdzeni procesora maszyny.

Lokalnie chcemy wykorzystać pełną moc procesora, ale w środowisku CI (które często posiada mniejsze zasoby sprzętowe) zbyt duża liczba wątków przeciąży maszynę i wywoła niestabilność testów. Dlatego liczbę wątków konfigurujemy warunkowo:

```typescript
// Wykorzystaj połowę dostępnych rdzeni lokalnie, ale w CI ogranicz do 1-2 wątków
workers: process.env.CI ? 2 : '50%',
```

### B. Opcja `fullyParallel`
Domyślnie Playwright uruchamia pliki testowe równolegle, ale testy *wewnątrz* jednego pliku wykonuje sekwencyjnie. Włączenie opcji `fullyParallel: true` sprawia, że absolutnie każdy test (nawet z tego samego pliku) jest uruchamiany w osobnym wątku współbieżnym:

```typescript
fullyParallel: true,
```

---

## 3. Projekty i Emulacja Urządzeń (Multi-Project Configurations)

Blok `projects` pozwala zadeklarować matrycę środowisk testowych. Możemy zdefiniować testy dla tradycyjnych przeglądarek biurkowych oraz emulować urządzenia mobilne:

```typescript
import { devices } from '@playwright/test';

projects: [
  // 1. Testy na Chromium (Chrome)
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  // 2. Testy na WebKit (Safari)
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },
  // 3. Emulacja Mobile Safari (iPhone 14)
  {
    name: 'mobile-safari',
    use: { ...devices['iPhone 14'] },
  },
]
```

---

## 4. Strategia Zbierania Diagnostyki (Failure Artifacts)

Zbieranie trace, wideo i zrzutów ekranu jest kosztowne wydajnościowo. W środowiskach produkcyjnych stosuje się strategię **diagnozy tylko na błędach**:

```typescript
use: {
  // Wykonaj zrzut ekranu tylko, gdy test nie przejdzie
  screenshot: 'only-on-failure',
  
  // Zachowaj nagranie wideo wyłącznie dla nieudanych testów
  video: 'retain-on-failure',
  
  // Nagraj pełny Trace tylko przy pierwszej próbie ponowienia testu
  trace: 'on-first-retry',
}
```

---

## 5. Reportery i Publikacja Wyników

Playwright Test posiada bogaty zestaw wbudowanych reporterów. Można ich deklarować wiele jednocześnie w postaci tablicy:

```typescript
reporter: [
  // Reporter listowy - idealny do czytania w terminalu CI
  ['list'],
  // Reporter HTML - generuje bogaty interaktywny raport lokalny
  ['html', { open: 'never' }],
  // Reporter JUnit - generuje plik XML czytelny dla narzędzi CI (np. Azure DevOps, Jenkins)
  ['junit', { outputFile: 'results/results.xml' }]
],
```

---

## 6. Checklista Konfiguracyjna
Upewnij się, że Twój plik `playwright.config.ts` posiada:
- [ ] Precyzyjnie określoną hierarchię limitów czasowych (`timeout`, `expect.timeout`, `actionTimeout`, `navigationTimeout`).
- [ ] Warunkowe przypisywanie liczby wątków roboczych (`workers`) w zależności od środowiska (Local vs CI).
- [ ] Włączoną współbieżność na poziomie testów (`fullyParallel: true`).
- [ ] Elastyczne zbieranie artefaktów ograniczające overhead CPU (`only-on-failure` / `on-first-retry`).
- [ ] Zadeklarowane projekty dla kluczowych przeglądarek biurkowych oraz mobilnych.
