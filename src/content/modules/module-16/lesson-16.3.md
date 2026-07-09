# Testowanie WebSocket i SSE

Aplikacje realtime używają WebSocketów i Server-Sent Events do czatów, powiadomień, statusów zamówień, dashboardów i współpracy wielu użytkowników. Testowanie realtime wymaga innego myślenia niż klasyczny request-response. Nie wystarczy kliknąć i natychmiast sprawdzić DOM. Trzeba poczekać na zdarzenie, wiadomość albo zmianę stanu.

## 1. Obserwowanie WebSocketów

Playwright pozwala nasłuchiwać WebSocketów:

```typescript
page.on('websocket', ws => {
  console.log('WebSocket:', ws.url());
  ws.on('framesent', frame => console.log('sent', frame.payload));
  ws.on('framereceived', frame => console.log('received', frame.payload));
});
```

To jest szczególnie przydatne przy diagnostyce w CI. W raporcie możesz dołączyć wybrane ramki jako attachment.

## 2. Test zachowania UI

Nie testuj tylko, że ramka przyszła. Testuj, że użytkownik widzi rezultat:

```typescript
await page.goto('/orders/ORD-123');
await expect(page.getByText('Status: oczekuje')).toBeVisible();

await triggerOrderStatusChangeByApi(request, 'ORD-123', 'PAID');

await expect(page.getByText('Status: opłacone')).toBeVisible();
```

## 3. Dwie strony / dwóch użytkowników

```typescript
const admin = await context.newPage();
const customer = await context.newPage();

await customer.goto('/chat');
await admin.goto('/admin/chat');

await admin.getByLabel('Wiadomość').fill('Dzień dobry');
await admin.getByRole('button', { name: 'Wyślij' }).click();

await expect(customer.getByText('Dzień dobry')).toBeVisible();
```

## 4. SSE

SSE to jednokierunkowy strumień z serwera do klienta. Z perspektywy testu najczęściej weryfikujesz skutek w UI albo request inicjujący strumień:

```typescript
const responsePromise = page.waitForResponse(response =>
  response.url().includes('/events') && response.status() === 200
);
await page.goto('/dashboard');
await responsePromise;
```

## 5. WebSocketRoute i mockowanie realtime

Nowsze API Playwright pozwala w wybranych scenariuszach routować WebSockety. To przydatne do symulowania wiadomości, błędów i rozłączeń. Używaj tego do testów obsługi edge case, ale zostaw przynajmniej kilka testów na prawdziwej integracji realtime.

## 6. Typowe problemy

- test nie czeka na realny stan UI;
- wiadomość przychodzi przed subskrypcją;
- kilka testów używa tego samego kanału;
- brak cleanupu subskrypcji;
- środowisko CI blokuje połączenia websocket;
- retry ukrywa problem synchronizacji.

## 7. Checklista

- Czy subskrypcja jest aktywna przed wywołaniem zdarzenia?
- Czy test sprawdza UI, nie tylko ramkę?
- Czy kanały i dane są izolowane per test?
- Czy logi websocket są dostępne przy awarii?
- Czy mock realtime nie zastępuje całej integracji?

## Linki

- [WebSocket API](https://playwright.dev/docs/api/class-websocket)
- [Events](https://playwright.dev/docs/events)
- [Network](https://playwright.dev/docs/network)

## 8. Izolacja kanałów realtime

Każdy test powinien używać własnego kanału, pokoju, zamówienia albo użytkownika. Jeśli kilka testów słucha tego samego kanału `notifications`, wiadomości mogą się mieszać.

```typescript
const roomId = `room-${testInfo.parallelIndex}-${crypto.randomUUID()}`;
await page.goto(`/chat/${roomId}`);
```

## 9. Diagnostyka realtime

Przy awarii zapisz:

- URL WebSocket;
- ostatnie wysłane ramki;
- ostatnie odebrane ramki;
- identyfikator kanału;
- correlation ID;
- screenshot UI.

```typescript
await testInfo.attach('websocket-frames.json', {
  body: JSON.stringify(frames, null, 2),
  contentType: 'application/json',
});
```

## 10. Test rozłączenia

Realtime musi obsługiwać utratę połączenia. Możesz mockować offline albo zasymulować błąd zależności. Asercja powinna dotyczyć UI: komunikat „utracono połączenie”, próba reconnect albo fallback polling.

## 11. Polling jako fallback

Niektóre systemy mają fallback z WebSocket na polling. Test może sprawdzić oba warianty: realtime dla normalnego połączenia i polling/offline fallback dla awarii. W takiej sytuacji nie sprawdzaj implementacji transportu jako celu samego w sobie. Sprawdź, że użytkownik nadal otrzyma aktualny status.

## 12. Typowa strategia testów realtime

- Jeden test smoke na prawdziwym WebSocket/SSE.
- Kilka testów UI na mockowanych wiadomościach.
- Test rozłączenia i reconnect.
- Test izolacji kanałów.
- Monitoring błędów realtime w logach.

Dzięki temu zachowujesz balans między realizmem a stabilnością.

## 13. Asercje dla kolejności wiadomości

W systemach realtime czasem ważna jest kolejność wiadomości. Test powinien sprawdzić ją jawnie:

```typescript
await expect(page.getByTestId('message')).toHaveText([
  'Pierwsza wiadomość',
  'Druga wiadomość',
]);
```

Jeśli kolejność nie jest częścią kontraktu, nie stabilizuj jej przypadkowo.

## 14. Reconnect i stan po odświeżeniu

Po utracie połączenia aplikacja powinna odzyskać stan. Dobry test może odświeżyć stronę albo zasymulować reconnect i sprawdzić, że użytkownik nadal widzi aktualne dane. W realtime ważne jest nie tylko odebranie eventu, ale spójność stanu po przerwie.

## 15. WebSocket w CI

Niektóre proxy i środowiska CI mają ograniczenia dla WebSocket. Jeżeli testy realtime padają tylko w CI, sprawdź konfigurację sieci, timeouty, nagłówki upgrade i logi serwera. Publikuj ramki i URL połączenia jako artefakty.

## 16. Test wielu subskrybentów

Realtime często oznacza, że wiele klientów widzi ten sam stan. Test może otworzyć dwie strony w dwóch kontekstach i sprawdzić synchronizację. Używaj osobnych kont, jeśli uprawnienia mają znaczenie.

## 17. Timeouty realtime

Nie ustawiaj ogromnych timeoutów globalnie. Dla zdarzeń realtime użyj lokalnego timeoutu z opisem:

```typescript
await expect(page.getByText('Nowe powiadomienie'), 'powiadomienie realtime powinno dotrzeć').toBeVisible({ timeout: 15_000 });
```

Jeśli zdarzenie nie dociera, trace i logi websocket powinny pokazać, czy problem jest w subskrypcji, backendzie czy UI.

## 18. Testowanie uprawnień realtime

Realtime często zależy od uprawnień. Użytkownik nie powinien otrzymywać wiadomości z cudzego kanału. Testuj przypadki negatywne: subskrypcja do zasobu innego użytkownika, brak roli admina, wygasła sesja podczas połączenia.

## 19. Backpressure i duża liczba wiadomości

Dla dashboardów realtime ważne jest zachowanie przy serii wiadomości. Nie musisz robić load testu w Playwright, ale możesz sprawdzić, że UI nie gubi ostatniego stanu po kilku szybkich eventach.

## 20. Zasada końcowa

W testach realtime najważniejsza jest obserwowalna spójność stanu. Transport może być WebSocket, SSE albo polling, ale użytkownik powinien widzieć aktualne i poprawne dane.
