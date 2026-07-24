# Zaawansowane i Niestandardowe Systemy Raportowania

Wbudowane reportery Playwright (takie jak reporter HTML) są doskonałe do lokalnego debugowania, ale w skali korporacyjnej ich możliwości szybko stają się niewystarczające. Duże zespoły deweloperskie i biznesowe potrzebują centralnych pulpitów nawigacyjnych (dashboards), śledzenia trendów stabilności testów w czasie, automatycznych powiadomień na komunikatorach (Slack, Microsoft Teams) oraz raportów generowanych w formatach przyjaznych dla ludzi.

W tej lekcji nauczysz się konfigurować i integrować zaawansowane reportery trzecie, takie jak **Monocart Reporter** oraz automatyczne powiadomienia **Slack Reporter**.

---

## 1. Monocart Reporter: Elitarne raportowanie HTML

**Monocart Reporter** to jeden z najbardziej zaawansowanych i elastycznych alternatywnych reporterów HTML dla Playwright. Dostarcza on niespotykane w standardowym raportowaniu funkcje:
*   **Agregacja i wyszukiwanie**: Błyskawiczne filtrowanie i wyszukiwanie testów po tagach, adnotacjach, wątkach (workers) czy statusie.
*   **Wielopliki**: Możliwość załączania dynamicznych wykresów kołowych, statystyk trendów i metryk czasowych.
*   **Wbudowana analityka**: Śledzenie, które testy trwają najdłużej (Performance Hotspots).

### Konfiguracja Monocart Reportera w `playwright.config.ts`:
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['list'], // Zachowaj logowanie w konsoli
    [
      'monocart-reporter',
      {
        name: 'Raport z Testów E2E MyCommerce',
        outputFile: './playwright-report/monocart-report.html',
        // Konfiguracja wykresów i trendów
        trend: './playwright-report/trends.json',
      },
    ],
  ],
});
```

---

## 2. Automatyczne powiadomienia na komunikatory (Slack / Teams)

Szybka informacja o stanie głównego rurociągu (build pipeline) pozwala zespołowi na natychmiastowe podjęcie działań w przypadku wykrycia błędów (regresji). 

Wygodnym rozwiązaniem jest automatyczna wysyłka podsumowania wykonania testów bezpośrednio na kanał Slack przy użyciu biblioteki `playwright-slack-report`:

### Konfiguracja Slack Reportera w `playwright.config.ts`:
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    [
      './node_modules/playwright-slack-report/dist/src/SlackReporter.js',
      {
        // Adres Webhooka skonfigurowany w panelu administratora Slack
        slackWebHookUrl: process.env.SLACK_WEBHOOK_URL,
        sendResults: 'on-failure', // Wysyłaj powiadomienie wyłącznie przy błędach!
        channels: ['alert-testy-e2e', 'build-pipeline'],
        showExpectedFailure: false,
      },
    ],
  ],
});
```

Dzięki temu, gdy test dymny na środowisku produkcyjnym nie przejdzie, zespół natychmiast otrzyma na Slacku czytelne powiadomienie zawierające nazwę uszkodzonego scenariusza, czas trwania oraz bezpośredni link do pobrania pliku Trace z CI.

---

## 3. Budowanie Niestandardowych Reporterów (Custom Reporters API)

Jeśli żaden z istniejących reporterów nie spełnia unikalnych wymagań Twojej firmy, Playwright udostępnia proste API do stworzenia własnego reportera. Wystarczy zaimplementować klasę realizującą interfejs `Reporter`:

```typescript
// src/utils/CustomConsoleReporter.ts
import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

export class CustomConsoleReporter implements Reporter {
  onTestBegin(test: TestCase) {
    console.log(`[START] Rozpoczęto wykonywanie testu: ${test.title}`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    console.log(`[KONIEC] Test: ${test.title} zakończony ze statusem: ${result.status}`);
    if (result.status === 'failed') {
      console.error(`  --> Powód błędu: ${result.error?.message}`);
    }
  }
}
```

Rejestrujemy go w konfiguracji, podając ścieżkę do pliku klasy:
```typescript
reporter: [['./src/utils/CustomConsoleReporter.ts']],
```

---

## 4. Checklista Niestandardowego Raportowania
- [ ] Czy skonfigurowałeś agregację wyników za pomocą zaawansowanych reporterów (np. Monocart) dla łatwiejszego czytania przez biznes?
- [ ] Czy zintegrowałeś automatyczne alerty (Slack/Teams) w celu natychmiastowej reakcji zespołu na błędy regresji?
- [ ] Czy nagłówki i sekrety (jak `SLACK_WEBHOOK_URL`) pobierasz bezpiecznie ze zmiennych środowiskowych, zapobiegając ich wyciekowi do Git?
- [ ] Czy wiesz, jak napisać uproszczony reporter niestandardowy przy użyciu wbudowanego interfejsu `Reporter`?