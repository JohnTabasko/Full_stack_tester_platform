# Raportowanie wbudowane — kompletny przewodnik po reporterach Playwright

> **Perspektywa Full Stack Testera**
> Testy nie są uruchamiane po to, aby wygenerować pliki. Są uruchamiane po to, aby zespół mógł podjąć decyzję: naprawiamy kod, wydajemy wersję, analizujemy problemy, cofamy zmianę albo stabilizujemy środowisko. Raportowanie to proces zamiany surowych wyników testów w informację, która prowadzi do konkretnego działania. Dobry raport odpowiada na pytania: co zawiodło? gdzie? kiedy? w jakim środowisku? z jakimi dowodami? kto powinien działać? Brak raportowania lub raportowanie bez struktury to jak jechać samochodem bez deski rozdzielczej — wiesz, że jedziesz, ale nie wiesz, czy jedziesz za szybko, za wolno, i czy masz paliwo.

## Cel lekcji

Po ukończeniu tej lekcji rozumiesz filozofię raportowania w Playwright, konfigurujesz wbudowane reportery (list, line, dot, HTML, JSON, JUnit, GitHub), potrafisz łączyć wiele reporterów jednocześnie, konfigurujesz załączniki testInfo i rozumiesz ich znaczenie dla diagnostyki, projektujesz raportowanie dla różnych odbiorców (autor testu, programista, lider QA, release manager), i wiesz, kiedy używać którego formatu.

---

## Architektura reporterów w Playwright

### Co to jest reporter?

Reporter to obiekt, który nasłuchuje zdarzeń z test runnera i reaguje na nie — zapisując dane do pliku, wyświetlając informację w konsoli lub wysyłając powiadomienia.

```typescript
// Każdy reporter implementuje interfejs Reporter
interface Reporter {
  onBegin(config: Configuration, suite: Suite): void;        // Na początku całej sesji
  onTestBegin(test: Test, result: TestResult): void;          // Gdy test się zaczyna
  onTestEnd(test: Test, result: TestResult): void;            // Gdy test się kończy
  onStepBegin(step: TestStep, result: TestResult): void;      // Gdy krok się zaczyna
  onStepEnd(step: TestStep, result: TestResult): void;         // Gdy krok się kończy
  onEnd(result: FullResult): void;                            // Na końcu sesji
}
```

Playwright ma wbudowane reportery dla każdego głównego zastosowania:

| Reporter | Zastosowanie | Format wyjścia | Odbiorca |
|---|---|---|---|
| `list` | Lokalny rozwój, CI (konsola) | Terminal | Tester/Developer |
| `line` | CI (konsola, mniej szczegółów) | Terminal | Developer |
| `dot` | CI (minimalistyczny) | Terminal | Developer |
| `html` | Przeglądanie wyników | Katalog HTML | Wszyscy |
| `json` | Dalsza obróbka | Plik JSON | Narzędzia/Analytics |
| `junit` | CI integration (Azure DevOps, Jenkins) | XML (JUnit) | CI System |
| `github` | Annotations w PR | GitHub API | Developer |
| `blob` | Kompaktowy storage | Plik binarny | Playwright Portal |

---

## Konfiguracja wielu reporterów jednocześnie

### Praktyka: Nigdy nie używaj jednego reportera

W profesjonalnym projekcie potrzebujesz różnych formatów dla różnych odbiorców:

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    // 1. Reporter konsolowy — dla developera uruchamiającego testy lokalnie
    ['list', {
      printSteps: true,         // Pokaż każdy test.step()
      timeout: 0,               // Nie skracaj timeoutów w output
    }],
    
    // 2. Reporter HTML — dla przeglądania wyników (ćwiczenia w aplikacji)
    ['html', {
      outputFolder: 'playwright-report',
      open: 'never',            // Nigdy nie otwieraj automatycznie (CI!)
    }],
    
    // 3. Reporter JSON — dla zewnętrznych narzędzi analitycznych
    ['json', {
      outputFile: 'test-results/results.json',
    }],
    
    // 4. Reporter JUnit — dla CI systemów (Jenkins, Azure DevOps)
    ['junit', {
      outputFile: 'test-results/junit.xml',
      includeProjectInTestNameParent: true,  // Pełna ścieżka: project/test/file
    }],
    
    // 5. Reporter GitHub — annotations w Pull Request
    ['github', {
      checkName: 'Playwright E2E Tests',    // Nazwa w GitHub Checks
      stripANSIControlSequences: false,
    }],
  ],
  
  use: {
    // Artefakty na awarię — najważniejsze dla diagnostyki
    trace: 'retain-on-failure',      // Ślad wykonania (playwright.dev/trace)
    screenshot: 'only-on-failure',   // Screenshot ekranu
    video: 'retain-on-failure',      // Nagranie video (dla powolnych testów)
  },
});
```

### Różnice między list, line, dot

```typescript
// list — najbardziej szczegółowy
// Output:
// ✓ auth/login.spec.ts:użytkownik może się zalogować [12.4s]
//   └─ 1. Użytkownik otwiera stronę logowania [500ms]
//   └─ 2. Wypełnia formularz [200ms]
//   └─ 3. Klika przycisk Zaloguj [100ms]
//   └─ 4. System przekierowuje do dashboard [300ms]
// ✓ checkout/cart.spec.ts:dodanie produktu do koszyka [8.2s]

// line — średnia szczegółowość
// Output:
//   auth/login.spec.ts:użytkownik może się zalogować [12.4s]
//   checkout/cart.spec.ts:dodanie produktu do koszyka [8.2s]
//   checkout/cart.spec.ts:edycja ilości w koszyku [5.1s]
// ✗ checkout/payment.spec.ts:błędna karta — komunikat błędu [3.2s]

// dot — najmniej szczegółowy (tylko kropki)
// Output:
//   ✓····✓✓✓··✓····✗·✓✓·
//   32 passed, 1 failed, 2 skipped
```

**Kiedy który**: `list` — lokalny rozwój (widzisz wszystkie kroki). `line` — CI z moderate output. `dot` — CI z dużą ilością testów (nie zaśmieca logów).

---

## Reporter HTML — pełne wykorzystanie

### Struktura raportu HTML

```
playwright-report/
├── index.html                 # Strona główna z podsumowaniem
├── file-viewer/              # Przeglądarka kodu źródłowego
├── trace/                    # Trace Viewer (Playwright)
├── data/                     # Surowe dane (JSON)
├── media/                    # Screenshots i nagrania
├── screenshot/               # Screenshots na awarię
└── video/                    # Nagrania video na awarię
```

### Otwieranie raportu

```bash
# Lokalnie
npx playwright show-report

# Na serwerze (przez przeglądarkę)
# Otwórz playwright-report/index.html

# W CI (przez artifact GitHub Actions)
# GitHub → Actions → Run → Artifacts → playwright-report → Download
# Rozpakuj → otwórz index.html
```

### Optymalizacja raportu HTML

```typescript
['html', {
  outputFolder: 'playwright-report',
  open: 'never',
  
  // Zmniejsz rozmiar — wyklucz screenshoty z raportu (są w artifact)
  // Oszczędza miejsce, przyspiesza upload
  // Screenshots i tak masz w test-results/
}],
```

---

## Reporter JUnit — integracja z CI systems

### Format JUnit XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="playwright" tests="156" failures="2" skipped="1">
  <testsuite name="chromium" tests="156" failures="2" skipped="1" time="412.5">
    
    <testcase classname="auth.login" name="użytkownik może się zalogować" time="12.4">
      <!-- Sukces — brak elementu failure -->
    </testcase>
    
    <testcase classname="checkout.payment" name="błędna karta wyświetla komunikat" time="3.2">
      <failure message="Expected toBeVisible: true, got false">
        Test failed at step 3: await expect(locator).toBeVisible()
        Timeout: 5000ms exceeded.
      </failure>
    </testcase>
    
    <testcase classname="checkout.payment" name="timeout bramki płatności" time="30002">
      <skipped message="Test skipped due to previous failure in suite"/>
    </testcase>
    
  </testsuite>
</testsuites>
```

### Integracja z Jenkins

```groovy
// Jenkinsfile
pipeline {
  agent any
  
  stages {
    stage('E2E Tests') {
      steps {
        sh 'npx playwright test --reporter=junit'
      }
    }
  }
  
  post {
    always {
      junit 'test-results/junit.xml'
    }
  }
}
```

**Korzyść z JUnit w Jenkins**: Każdy wynik testu pojawia się jako osobny "Test Result" w Jenkins. Możesz klikać w konkretny test, który padł, i widzieć stack trace.

### Integracja z Azure DevOps

```yaml
# azure-pipelines.yml
- task: NodeTool@0
  inputs:
    versionSpec: '20'

- task: CmdLine@2
  displayName: 'Run Playwright Tests'
  inputs:
    script: |
      npx playwright test --reporter=junit --reporter=list
    continueOnError: true

- task: PublishTestResults@2
  inputs:
    testResultsFormat: 'junit'
    testResultsFiles: 'test-results/junit.xml'
    mergeResults: false
    failTaskOnFailedTests: true
```

---

## Reporter JSON — dla zewnętrznych narzędzi

### Struktura danych JSON

```json
{
  "config": {
    "version": "1.45.0",
    "projects": ["chromium", "firefox"],
    "suites": 12
  },
  "suites": [
    {
      "title": "auth",
      "file": "tests/auth.spec.ts",
      "specs": [
        {
          "title": "użytkownik może się zalogować",
          "tests": [
            {
              "id": "auth-login-1",
              "title": "użytkownik może się zalogować",
              "status": "passed",
              "duration": 12400,
              "steps": [
                { "title": "1. Użytkownik otwiera stronę logowania", "duration": 500 },
                { "title": "2. Wypełnia formularz", "duration": 200 }
              ]
            }
          ]
        }
      ]
    }
  ],
  "stats": {
    "total": 156,
    "passed": 140,
    "failed": 3,
    "skipped": 13,
    "unexpected": 0
  }
}
```

### Analiza przez zewnętrze narzędzie

```typescript
import { readFileSync } from 'fs';

// Analizator metryk z raportu JSON
function analyzeResults(jsonPath: string) {
  const results = JSON.parse(readFileSync(jsonPath, 'utf-8'));
  
  // Znajdź najwolniejsze testy
  const slowTests = results.suites
    .flatMap(s => s.specs)
    .flatMap(spec => spec.tests)
    .filter(t => t.status === 'passed')
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10);
  
  console.log('Top 10 najwolniejszych testów:');
  for (const t of slowTests) {
    console.log(`  ${t.title}: ${(t.duration / 1000).toFixed(1)}s`);
  }
  
  // Znajdź flaky testy (przeszły ale z retry)
  const flaky = results.suites
    .flatMap(s => s.specs)
    .flatMap(spec => spec.tests)
    .filter(t => t.status === 'passed' && t.retries > 0);
    
  console.log(`Flaky tests (przeszły po retry): ${flaky.length}`);
}
```

---

## Załączniki testInfo.attach — dowód w raporcie

### Co to są załączniki?

`testInfo.attach()` dodaje dowolny plik lub tekst do raportu. To kluczowe dla diagnostyki:

```typescript
import { test, expect } from '@playwright/test';

test('tworzenie zamówienia zapisuje dane do backendu', async ({ page, request }, testInfo) => {
  // 1. Załącz odpowiedź API do raportu
  const orderResponse = await request.post('/api/orders', {
    data: { items: [{ productId: 'PROD-001', quantity: 2 }] },
  });
  
  const orderData = await orderResponse.json();
  
  // Załącz odpowiedź JSON — programista może ją przeczytać w raporcie
  await testInfo.attach('order-api-response', {
    contentType: 'application/json',
    body: JSON.stringify(orderData, null, 2),
  });
  
  // 2. Załącz Correlation ID — klucz do Kibana/Grafana
  await testInfo.attach('correlation-id', {
    contentType: 'text/plain',
    body: `correlation-id: ${orderData.correlationId}\ntrace: https://kibana.app.pl/app/discover?_g=...`,
  });
  
  // 3. Załącz screenshot strony w momencie błędu
  await testInfo.attach('screenshot-on-check', {
    contentType: 'image/png',
    body: await page.screenshot(),
  });
  
  // 4. Załącz request/response HTTP jako HAR-like JSON
  await testInfo.attach('order-request', {
    contentType: 'application/json',
    body: JSON.stringify({
      method: 'POST',
      url: '/api/orders',
      requestBody: { items: [{ productId: 'PROD-001', quantity: 2 }] },
      responseStatus: orderResponse.status(),
      responseBody: orderData,
    }, null, 2),
  });
  
  await expect(orderResponse.ok()).toBeTruthy();
});
```

### Dostęp do załączników w raporcie HTML

W raporcie HTML każdy załącznik pojawia się jako link lub podgląd w zakładce "Attachments" dla danego testu:

```
Test: "tworzenie zamówienia zapisuje dane do backendu"
Status: ✅ Passed (12.4s)

Attachments:
📄 order-api-response (application/json, 1.2KB) — Pokaż | Pobierz
📄 correlation-id (text/plain, 156B) — Pokaż | Pobierz
🖼 screenshot-on-check (image/png, 340KB) — Pokaż | Pobierz
📄 order-request (application/json, 2.1KB) — Pokaż | Pobierz
```

### Automatyczne załączniki dla wszystkich błędów

```typescript
// playwright.config.ts — globalnie dla wszystkich testów
export default defineConfig({
  // Automatycznie załączaj screenshot i trace na każdą awarię
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  
  // Ale dodaj też własne załączniki przez hook:
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
  ],
});

// W global setup — załącz metadane środowiska do każdego testu
test.beforeEach(async ({}, testInfo) => {
  await testInfo.attach('environment', {
    contentType: 'application/json',
    body: JSON.stringify({
      timestamp: new Date().toISOString(),
      branch: process.env.GITHUB_REF_NAME,
      commit: process.env.GITHUB_SHA,
      runner: process.env.RUNNER_NAME,
    }),
  });
});
```

---

## Konfiguracja dla różnych odbiorców

### Konfiguracja lokalna (developer)

```typescript
// playwright.config.local.ts
export default defineConfig({
  reporter: [
    ['list', { printSteps: true }],
    ['html', { outputFolder: 'playwright-report', open: 'on-failure' }],
  ],
});
```

### Konfiguracja CI (GitHub Actions)

```typescript
// playwright.config.ci.ts
export default defineConfig({
  reporter: [
    // Konsolowy — widoczny w logach CI
    ['list'],
    // HTML — artifact do pobrania
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    // JSON — dla zewnętrznych narzędzi
    ['json', { outputFile: 'test-results/results.json' }],
    // JUnit — dla GitHub Actions summary
    ['junit', { outputFile: 'test-results/junit.xml' }],
    // GitHub annotations
    ['github'],
  ],
});
```

---

## Perspektywa Full Stack Testera — raport jako produkt

Raportowanie to nie jest "coś na koniec". To integralna część procesu testowania. Dobrze zaprojektowane raportowanie pozwala:
- **Autorowi testu**: Szybko zidentyfikować, co poszło nie tak i gdzie szukać dowodów.
- **Programiście**: Zrozumieć kontekst błędu bez uruchamiania testu samodzielnie.
- **Liderowi QA**: Zobaczyć trendy jakości i zdecydować, czy release jest bezpieczny.
- **Release Managerowi**: Podjąć decyzję o wydaniu na podstawie danych, nie domysłów.

Zasada: projektuj raportowanie z myślą o odbiorcy i decyzji, którą ma wspierać.

---

## Podsumowanie

1. **Wiele reporterów jednocześnie**: Każdy format dla innego odbiorcy.
2. **list/line/dot**: Różne poziomy szczegółowości w konsoli.
3. **HTML**: Pełne raporty z screenshotami, trace, załącznikami.
4. **JUnit**: Integracja z CI systems (Jenkins, Azure DevOps, GitLab).
5. **JSON**: Surowe dane dla zewnętrznej analityki i narzędzi.
6. **testInfo.attach**: Dowody w raporcie — odpowiedzi API, Correlation ID, zrzuty ekranu.
7. **Konfiguracja środowiskowa**: Różne konfiguracje dla lokalnego i CI.

---

## Linki i źródła

- [Playwright Reporters](https://playwright.dev/docs/test-reporters)
- [JUnit XML Format](https://github.com/testmoapp/junitxml)
- [GitHub Actions Artifacts](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts)
- [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer)

## 📘 Suplement Inżynieryjny 2026: Raportowanie i Analityka
*Inspiracja: „Practical Playwright Test” (2026), Chapter 6*
*   **Raporty dla Biznesu**: Dobry raport to nie tylko statystyka "passed/failed". Używaj zaawansowanych reporterów (np. Monocart) i dołączaj bogate załączniki za pomocą `testInfo.attach()` w fazie teardownu.
*   **Oznaczanie znanych błędów**: Korzystaj z adnotacji testowych (np. `test.info().annotations.push(...)`), aby powiązać błędy w testach z otwartymi zgłoszeniami w systemach typu GitHub Issues lub Jira.
