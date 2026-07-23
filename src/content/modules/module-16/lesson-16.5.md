# Testowanie integracji zewnętrznych

Integracje zewnętrzne — płatności, email, SMS, SSO, CRM, mapy, analityka — są częstym źródłem niestabilności testów. Full Stack Tester musi zdecydować, kiedy testować prawdziwą integrację, kiedy użyć sandboxa, kiedy mockować odpowiedź, a kiedy wystarczy test kontraktu.

## 1. Klasyfikacja integracji

Dla każdej integracji określ:

- czy jest krytyczna biznesowo;
- czy ma stabilny sandbox;
- czy ma limity rate limiting;
- czy generuje koszty;
- czy wspiera dane testowe;
- czy jest deterministyczna;
- jak diagnozować błędy.

## 2. Prawdziwa integracja vs mock

Prawdziwa integracja jest potrzebna dla smoke testów krytycznych ścieżek. Mock jest dobry dla błędów trudnych do wywołania: timeout, 500, 403, odrzucona płatność, brak odpowiedzi.

```typescript
await page.route('**/payment/charge', route => route.fulfill({
  status: 402,
  contentType: 'application/json',
  body: JSON.stringify({ code: 'CARD_DECLINED' }),
}));
```

## 3. HAR dla zewnętrznych usług

Jeśli zewnętrzne API jest wolne albo niestabilne, możesz użyć HAR do kontrolowanego replayu:

```typescript
await page.routeFromHAR('tests/fixtures/payment-provider.har', {
  url: '**/provider/**',
  update: false,
});
```

HAR nie zastępuje testu integracyjnego. To narzędzie stabilizacji wybranych scenariuszy.

## 4. Testowanie emaili

Dla emaili używaj testowego inboxa albo API narzędzia typu MailHog/Mailpit:

```typescript
const email = await mailClient.waitForEmail({ to: user.email, subject: /Aktywacja/ });
expect(email.body).toContain('Aktywuj konto');
```

Nie testuj poczty przez prawdziwe prywatne skrzynki.

## 5. Circuit breaker i health check

Przed pełną suite możesz sprawdzić zależności:

```typescript
const health = await request.get('/api/health/dependencies');
expect(health.status()).toBe(200);
```

Jeśli sandbox płatności leży, raport powinien powiedzieć „awaria zależności”, a nie generować dziesiątki fałszywych błędów UI.

## 6. Checklista integracji

- Czy wiadomo, które testy używają prawdziwej integracji?
- Czy sandbox jest stabilny i ma dane testowe?
- Czy mocki nie ukrywają krytycznej ścieżki?
- Czy błędy integracji są symulowane?
- Czy istnieje correlation ID lub request id?
- Czy testy nie generują kosztów ani prawdziwych wiadomości do klientów?

## Linki

- [Network mocking](https://playwright.dev/docs/mock)
- [HAR replay](https://playwright.dev/docs/network)
- [API testing](https://playwright.dev/docs/api-testing)
- [Authentication](https://playwright.dev/docs/auth)

## 7. Dane testowe dostawców

Dostawcy integracji zwykle mają specjalne dane testowe: numery kart, adresy email sandbox, testowe konta SSO, numery telefonów SMS. Trzymaj je w dokumentacji projektu i nie mieszaj ze środowiskiem produkcyjnym.

## 8. Idempotencja integracji

Test integracji może zostać uruchomiony ponownie. Operacje powinny być idempotentne albo mieć unikalny identyfikator:

```typescript
const externalId = `e2e-${runId}-${crypto.randomUUID()}`;
```

Dzięki temu retry nie stworzy konfliktu u zewnętrznego dostawcy.

## 9. Kontrakt zamiast pełnego E2E dla każdego wariantu

Nie musisz sprawdzać każdego błędu dostawcy przez prawdziwą integrację. Krytyczne happy path może działać na sandboxie, a warianty błędów mogą być pokryte przez mocki, HAR albo testy kontraktowe.

## 10. Rejestrowanie request id dostawcy

W integracjach zewnętrznych zapisuj identyfikator requestu dostawcy, jeśli jest dostępny:

```typescript
await testInfo.attach('provider-request-id', {
  body: response.headers()['x-request-id'] ?? 'missing',
  contentType: 'text/plain',
});
```

To przyspiesza kontakt z supportem dostawcy i analizę logów.

## 11. Matrix strategii integracji

| Scenariusz | Strategia |
|---|---|
| krytyczny happy path płatności | sandbox prawdziwego dostawcy |
| karta odrzucona | sandbox albo mock |
| timeout dostawcy | mock / route abort |
| format webhooka | test kontraktowy |
| treść emaila | testowy inbox / Mailpit |

Nie każda ścieżka wymaga pełnego E2E z prawdziwą integracją.

## 12. Webhooki integracji

Wiele integracji działa asynchronicznie przez webhooki. Test powinien sprawdzić idempotencję i ponowienia:

```typescript
await providerClient.sendWebhook({ eventId, type: 'payment.succeeded' });
await providerClient.sendWebhook({ eventId, type: 'payment.succeeded' });

const order = await ordersClient.getOrder(orderId);
expect(order.status).toBe('PAID');
```

Podwójny webhook nie powinien podwójnie zaksięgować płatności.

## 13. Testowanie integracji bez kosztów produkcyjnych

Upewnij się, że testy nie wysyłają prawdziwych SMS, emaili do klientów, przelewów ani faktur produkcyjnych. Każda integracja powinna mieć środowisko testowe, sandbox albo mock.

## 14. Diagnostyka integracji

Przy awarii integracji zbierz:

- request id dostawcy;
- correlation ID aplikacji;
- status HTTP;
- body błędu po zamaskowaniu sekretów;
- timestamp;
- środowisko dostawcy;
- link do dashboardu sandboxa, jeśli istnieje.

## 15. Testy kontraktowe integracji

Dla integracji zewnętrznych warto utrzymywać testy kontraktowe: jaki webhook przychodzi, jakie pola są wymagane, jakie kody błędów obsługujemy. Dzięki temu nie musisz każdej sytuacji odtwarzać przez prawdziwego dostawcę.

## 16. Tryb degradacji

Jeśli integracja jest niedostępna, aplikacja powinna mieć przewidywalny fallback: komunikat, retry, kolejkę, status „oczekuje” albo manualną obsługę. Testuj degradację tak samo jak ścieżkę sukcesu.

## 17. Checklist release dla integracji

- Czy sandbox działa?
- Czy sekrety są ustawione w CI?
- Czy webhook URL jest poprawny?
- Czy correlation ID jest widoczny w logach?
- Czy testy nie używają produkcyjnych danych?
- Czy istnieje test błędu dostawcy?

## 18. Separacja sekretów integracji

Każda integracja powinna mieć osobne sekrety dla środowiska testowego. Nie używaj produkcyjnych tokenów w CI E2E. Sekrety powinny być rotowane i ograniczone uprawnieniami.

## 19. Testy manualne jako uzupełnienie

Niektóre integracje, np. z bankiem, podpisem kwalifikowanym albo zewnętrznym SSO, mogą wymagać okresowej weryfikacji manualnej. Automatyzacja powinna pokrywać stabilne kontrakty i najważniejsze smoke, a resztę opisać w planie testów.

## 20. Zasada końcowa

Integracja zewnętrzna musi mieć świadomie dobrany poziom realizmu. Jeden test na prawdziwym sandboxie może dawać więcej wartości niż dziesięć niestabilnych E2E zależnych od dostawcy.

## 📘 Suplement Inżynieryjny 2026: Środowiska Specjalistyczne (Multi-Tenant Isolation)
*Inspiracja: „Scalable Test Automation with Playwright” (2026), Chapter 11*
*   **Multi-Tenant Isolation**: W środowiskach specjalistycznych dbaj o to, aby każdy worker operował na niezależnym podmiocie (tenant) lub wydzielonej strukturze danych, co wyeliminuje anomalie współbieżności.
