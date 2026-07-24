# Zaawansowane strategie raportowania i zarządzanie adnotacjami

W miarę rozwoju dużych systemów testowych, rzetelne informowanie o statusie testów wymaga czegoś więcej niż standardowego raportu. Musimy umieć powiązać nieudane testy ze zgłoszeniami błędów (Jira/GitHub), publikować automatyczne podsumowania w rurociągach CI/CD (np. GitHub Job Summaries) oraz precyzyjnie kategoryzować powody awarii.

W tej lekcji nauczysz się projektować i wdrażać zaawansowane strategie raportowania, które wzniosą transparentność Twoich testów w organizacji na najwyższy poziom.

---

## 1. Dynamiczne Job Summaries w GitHub Actions

Gdy programista wypycha kod i uruchamia testy w GitHub Actions, musi wejść głęboko w logi akcji, aby dowiedzieć się, co dokładnie poszło nie tak. 

Najlepszą praktyką jest generowanie dynamicznego, sformatowanego w tabeli podsumowania bezpośrednio na ekranie głównym uruchomienia zadania (**Job Summary**):

```typescript
// src/utils/githubSummary.ts
import { test } from '@playwright/test';
import fs from 'fs';

export async function writeGithubSummary(testInfo: any) {
  // Sprawdź, czy test działa w środowisku GitHub Actions
  if (process.env.GITHUB_STEP_SUMMARY) {
    const summaryText = `
### ❌ Awaria Testu: **${testInfo.title}**
*   **Moduł**: ${testInfo.project.name}
*   **Czas trwania**: ${(testInfo.duration / 1000).toFixed(2)}s
*   **Próba**: ${testInfo.retry + 1}
*   **Komunikat błędu**: \`${testInfo.errors[0]?.message}\`
---
`;
    // Dopisz sformatowany tekst Markdown bezpośrednio do systemowego pliku podsumowania GitHub
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summaryText);
  }
}
```

Możesz wywołać tę metodę wewnątrz hooka `afterEach` w swoim custom runnerze:
```typescript
test.afterEach(async ({}, testInfo) => {
  if (testInfo.status === 'failed') {
    await writeGithubSummary(testInfo);
  }
});
```

---

## 2. Oznaczanie znanych błędów (GitHub / Jira Linkage)

Jeśli test zawodzi z powodu znanego błędu w aplikacji (który jest już opisany w systemie Jira lub GitHub Issues), nie powinieneś po prostu wyłączać testu (`skip`). Lepiej oznaczyć go adnotacją, która zostanie automatycznie przekonwertowana w link w raporcie HTML:

```typescript
import { test } from '@playwright/test';

test('zakup kartą kredytową Visa @regression', async ({ page }, testInfo) => {
  // Dodaj adnotację o znanym błędzie (Linkage)
  testInfo.annotations.push({
    type: 'issue',
    description: 'https://github.com/my-org/my-app/issues/1402',
  });

  await page.goto('/checkout');
  // ... test wywali się, ale w raporcie HTML link do błędu będzie czytelny dla całego zespołu!
});
```

Gdy deweloperzy zamkną zgłoszenie, od razu zauważysz, że test należy ustabilizować lub usunąć adnotację.

---

## 3. Checklista Zaawansowanych Strategii
- [ ] Czy wdrożyłeś automatyczne Job Summaries w GitHub Actions, dając deweloperom błyskawiczny wgląd w błędy bez czytania logów?
- [ ] Czy powiązałeś uszkodzone testy z systemem Jira/GitHub przy użyciu adnotacji typu `issue`?
- [ ] Czy regularnie czyścisz adnotacje znanych błędów po wdrożeniu poprawek przez deweloperów?