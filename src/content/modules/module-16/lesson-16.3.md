# Testowanie WebSocket i SSE

> Moduł szesnasty dotyczy przypadków, które pojawiają się w dojrzałych projektach: kontenery, poczta, komunikacja w czasie rzeczywistym, testy komponentowe i integracje zewnętrzne. To tematy, w których granica systemu jest równie ważna jak sam kod testu.

## Jak czytać ten moduł

Czytaj ten moduł jak podręcznik kontroli środowiska i zależności. Im więcej usług, kontenerów, wiadomości i dostawców, tym ważniejsze stają się: gotowość środowiska, idempotencja, retry, diagnostyka i świadome rozróżnienie mocka od prawdziwej integracji.

Trzy zasady modułu:

1. **Środowisko musi być kontrolowane.** Test nie powinien zgadywać, czy baza, poczta albo zależność jest gotowa.
2. **Integracja musi mieć zakres.** Nie każdy test powinien używać prawdziwego dostawcy.
3. **Awaria jest scenariuszem.** Retry, fallback, idempotencja i komunikaty błędów są częścią jakości.


## Cel lekcji

Ta lekcja koncentruje się na: **WebSocket, Server-Sent Events, monitorowanie przez CDP, reconnect, scenariusze wielu użytkowników i komunikacja w czasie rzeczywistym**. Główne ryzyko: **test sprawdza tylko końcowy stan UI, ale nie wykrywa zerwania połączenia, duplikacji zdarzeń ani braku ponownego połączenia**. Po lekturze powinieneś umieć dobrać strategię testu do granicy systemu i zapewnić diagnostykę awarii zależności.

## Sytuacja przewodnia

dwóch użytkowników pracuje na tej samej tablicy zadań, a zmiana statusu karty ma pojawić się u drugiego użytkownika bez odświeżenia strony

## 1. Komunikacja real-time

WebSocket i SSE zmieniają model testu. Rezultat może pojawić się bez nawigacji i bez klasycznego żądania HTTP widocznego jako fetch.

## 2. WebSocket

WebSocket jest dwukierunkowy. Testuj połączenie, wiadomości, reconnect i zachowanie po utracie sieci.

## 3. SSE

Server-Sent Events są jednokierunkowe z serwera do klienta. Są częste w powiadomieniach i strumieniach statusów.

## 4. Wielu użytkowników

Scenariusze real-time często wymagają dwóch kontekstów przeglądarki i izolowanych sesji. W profesjonalnej pracy z Playwrightem, to zagadnienie jest kluczowe dla stabilności i wydajności całego procesu. Należy pamiętać o izolacji, odpowiednim doborze API oraz unikaniu typowych antywzorców, takich jak sztywne timeouty czy nadmierne poleganie na strukturze DOM.

## 5. Reconnect i idempotencja

Po rozłączeniu aplikacja powinna odtworzyć stan bez duplikatów. Test powinien sprawdzać nie tylko pojawienie się zdarzenia, ale też brak powielenia.

## Przykład referencyjny

```typescript
test('aktualizacja zadania pojawia się u drugiego użytkownika', async ({ browser }) => {
  const a = await browser.newContext({ storageState: 'auth/user-a.json' });
  const b = await browser.newContext({ storageState: 'auth/user-b.json' });
  const pageA = await a.newPage();
  const pageB = await b.newPage();

  await pageA.goto('/board');
  await pageB.goto('/board');
  await pageA.getByText('Zadanie 1').dragTo(pageA.getByRole('list', { name: 'W toku' }));
  await expect(pageB.getByRole('list', { name: 'W toku' })).toContainText('Zadanie 1');
});
```

Przykład pokazuje, że specjalistyczne integracje wymagają jawnej kontroli środowiska i asercji skutku. Samo wywołanie usługi nie wystarcza.

## Lista kontrolna

- Czy środowisko ma healthcheck albo inny dowód gotowości?
- Czy test wie, czy używa mocka, sandboxa czy prawdziwej usługi?
- Czy scenariusz awarii jest testowany?
- Czy operacja jest idempotentna lub zabezpieczona przed duplikatem?
- Czy artefakty pozwolą zdiagnozować problem zależności?
- Czy test nie generuje kosztów lub efektów ubocznych poza środowiskiem testowym?


## Dobre praktyki i perspektywa inżynierska
Automatyzacja to proces ciągłego doskonalenia. Aby Twoje testy niosły realną wartość, stosuj się do poniższych zasad:
- **Testuj zachowanie, nie kod**: Skup się na tym, co widzi i robi użytkownik. Zmienne nazwy klas CSS nie powinny psuć Twoich testów.
- **Fail-fast**: Test powinien dawać jasny sygnał o błędzie tak szybko, jak to możliwe. Unikaj "wiszących" testów, które blokują kolejkę CI.
- **Ewoluuj**: Regularnie przeglądaj swoje testy. Usuwaj te, które są niestabilne i nie dają wartości, a refaktoryzuj te, które stają się zbyt skomplikowane.
