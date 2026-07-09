# Logowanie, monitoring i alerty

Raport Playwright pokazuje, który test padł. Monitoring i logowanie pomagają odpowiedzieć, dlaczego padł i kto powinien zareagować. W dojrzałym projekcie awaria testu nie jest tylko czerwonym pipeline’em. Jest zdarzeniem diagnostycznym z kontekstem: środowisko, commit, test, użytkownik testowy, request id, trace, screenshot, logi konsoli i odpowiedzi API.

## 1. Logi strukturalne

Log strukturalny ma pola, które można filtrować:

```json
{
  "test": "checkout payment",
  "environment": "staging",
  "runId": "e2e-20260709-123",
  "correlationId": "corr-abc",
  "orderId": "ORD-123",
  "status": "failed"
}
```

To jest lepsze niż luźny tekst „coś nie działa”.

## 2. Correlation ID

Correlation ID łączy test z logami backendu:

```typescript
const correlationId = `e2e-${crypto.randomUUID()}`;
await page.context().setExtraHTTPHeaders({
  'x-correlation-id': correlationId,
});

await testInfo.attach('correlation-id.txt', {
  body: correlationId,
  contentType: 'text/plain',
});
```

Po awarii programista może wyszukać ten identyfikator w Kibanie, Grafanie, Loki albo innym narzędziu logów.

## 3. Console logs i page errors

```typescript
export const test = base.extend<{ consoleDiagnostics: void }>({
  consoleDiagnostics: [async ({ page }, use, testInfo) => {
    const messages: string[] = [];

    page.on('console', msg => messages.push(`${msg.type()}: ${msg.text()}`));
    page.on('pageerror', error => messages.push(`pageerror: ${error.message}`));

    await use();

    if (testInfo.status !== testInfo.expectedStatus) {
      await testInfo.attach('browser-console.log', {
        body: messages.join('\n'),
        contentType: 'text/plain',
      });
    }
  }, { auto: true }],
});
```

Nie zalewaj raportu logami przy każdym sukcesie. Największą wartość mają przy awarii.

## 4. Metryki testów

Monitoruj:

- czas całej suite;
- czas najwolniejszych testów;
- liczbę retry;
- flaky rate;
- najczęstsze błędy;
- czas setupu danych;
- liczbę testów pominiętych;
- trendy per moduł.

Pojedyncza awaria jest incydentem. Trend pokazuje problem procesu.

## 5. Alerty

Dobry alert zawiera:

- nazwę suite;
- środowisko;
- commit/branch;
- link do workflow;
- link do HTML report;
- liczbę failed/flaky/skipped;
- właściciela obszaru;
- krótką klasyfikację problemu, jeśli jest dostępna.

Alert bez linku do raportu jest hałasem.

## 6. Integracja z CI

W CI publikuj zawsze:

- `playwright-report/`;
- `test-results/`;
- trace zip;
- screenshoty;
- video, jeśli włączone;
- JUnit/JSON dla narzędzi analitycznych.

W GitHub Actions:

```yaml
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

## 7. Bezpieczeństwo diagnostyki

Nie załączaj do raportów:

- tokenów;
- cookies;
- haseł;
- pełnych danych osobowych;
- numerów kart;
- sekretów środowiska.

Diagnostyka ma pomagać, ale nie może tworzyć incydentu bezpieczeństwa.

## 8. Checklista

- Czy testy mają correlation ID?
- Czy console/pageerror są zbierane przy awarii?
- Czy CI publikuje raporty i trace?
- Czy alert zawiera linki do artefaktów?
- Czy metryki pokazują trendy flaky tests?
- Czy diagnostyka nie ujawnia sekretów?
- Czy właściciel problemu jest jasny?

## Linki

- [Reporters](https://playwright.dev/docs/test-reporters)
- [TestInfo.attach](https://playwright.dev/docs/api/class-testinfo)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [CI](https://playwright.dev/docs/ci)

## 9. Dashboard jakości testów

Warto budować dashboard z trendami:

- liczba testów per moduł;
- procent przejść;
- flaky rate;
- średni czas testu;
- top 10 najwolniejszych testów;
- top 10 najczęstszych błędów;
- liczba testów w quarantine.

Dzięki temu rozmawiasz o jakości na podstawie danych, nie odczuć.

## 10. Alert fatigue

Jeśli alerty przychodzą za często i bez kontekstu, zespół przestaje je czytać. Alertuj tylko o rzeczach wymagających reakcji. Dla nightly regression wystarczy jeden dobry raport zbiorczy zamiast 50 wiadomości z pojedynczych testów.

## 11. Bezpieczne logowanie danych

Przed dołączeniem requestu lub response do raportu usuń:

- `Authorization`;
- cookies;
- tokeny resetu hasła;
- numery kart;
- dane osobowe.

Diagnostyka nie może tworzyć incydentu bezpieczeństwa.

## 12. Przykład alertu Slack/Teams

Dobry alert powinien wyglądać jak skrócony raport decyzyjny:

```text
❌ Playwright regression failed
Environment: staging
Branch: feature/payment-refactor
Failed: 4 / 320
Flaky after retry: 2
Area: payments
Report: <link>
Artefakty trace: <link>
Correlation IDs: e2e-abc, e2e-def
Owner: team-payments
```

Taki alert mówi, kto powinien działać i gdzie są dowody.

## 13. Metryki jako Definition of Health

Możesz ustalić progi zdrowia suite:

- flaky rate < 2%;
- smoke suite < 10 minut;
- brak testów `@flaky` starszych niż 14 dni;
- 100% awarii ma trace;
- 0 testów z `waitForTimeout` bez uzasadnienia.

To zmienia rozmowę z „testy czasem padają” na konkretne wskaźniki.

## 14. Integracja z obserwowalnością systemu

Jeśli aplikacja używa OpenTelemetry, correlation ID z testu powinien pojawiać się w trace backendowym. Dzięki temu test E2E staje się wejściem do full stack debuggingu: UI → request → backend → baza → kolejka.

## 15. Logi sieciowe jako artefakt

Dla krytycznych flow możesz zbierać skrócone logi sieciowe:

```typescript
const network: Array<{ method: string; url: string; status?: number }> = [];
page.on('request', r => network.push({ method: r.method(), url: r.url() }));
page.on('response', r => network.push({ method: r.request().method(), url: r.url(), status: r.status() }));
```

Przy awarii dołącz je do raportu po odfiltrowaniu tokenów i zewnętrznych trackingów.

## 16. Alerty a właścicielstwo domeny

Alert powinien mapować test na domenę produktu. `@payments` powinno trafiać do zespołu płatności, `@auth` do zespołu identity, a `@search` do zespołu wyszukiwania. Bez właściciela alert jest tylko hałasem.

## 17. Retencja artefaktów

Trace i video mogą zajmować dużo miejsca. Ustal retencję: np. 7 dni dla trace, 30 dni dla raportów release, krócej dla branchy developerskich. Retencja jest kompromisem między kosztem a możliwością analizy po czasie.
