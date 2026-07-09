# Testowanie poczty elektronicznej

> Moduł szesnasty dotyczy przypadków, które pojawiają się w dojrzałych projektach: kontenery, poczta, komunikacja w czasie rzeczywistym, testy komponentowe i integracje zewnętrzne. To tematy, w których granica systemu jest równie ważna jak sam kod testu.

## Jak czytać ten moduł

Czytaj ten moduł jak podręcznik kontroli środowiska i zależności. Im więcej usług, kontenerów, wiadomości i dostawców, tym ważniejsze stają się: gotowość środowiska, idempotencja, retry, diagnostyka i świadome rozróżnienie mocka od prawdziwej integracji.

Trzy zasady modułu:

1. **Środowisko musi być kontrolowane.** Test nie powinien zgadywać, czy baza, poczta albo zależność jest gotowa.
2. **Integracja musi mieć zakres.** Nie każdy test powinien używać prawdziwego dostawcy.
3. **Awaria jest scenariuszem.** Retry, fallback, idempotencja i komunikaty błędów są częścią jakości.


## Cel lekcji

Ta lekcja koncentruje się na: **MailHog, Mailpit, testowanie SMTP, linki aktywacyjne, reset hasła, szablony HTML i REST API skrzynki testowej**. Główne ryzyko: **test zależy od prawdziwej skrzynki pocztowej albo zewnętrznego dostawcy, przez co jest wolny, zawodny i trudny do diagnozy**. Po lekturze powinieneś umieć dobrać strategię testu do granicy systemu i zapewnić diagnostykę awarii zależności.

## Sytuacja przewodnia

użytkownik rejestruje konto, odbiera link aktywacyjny w Mailpit, klika go i kończy konfigurację profilu

## 1. Poczta jako integracja asynchroniczna

E-mail nie pojawia się natychmiast i często jest dostarczany przez zewnętrzną usługę. Test musi czekać na wiadomość, a nie na stały czas.

## 2. MailHog i Mailpit

Lokalne serwery poczty przechwytują wiadomości bez wysyłania ich na zewnątrz. Dają API do odczytu treści i linków.

## 3. Linki aktywacyjne

Link aktywacyjny powinien być wydobyty z wiadomości i użyty w przeglądarce. Test sprawdza wtedy cały proces, nie tylko wysłanie maila.

## 4. Reset hasła

Reset hasła wymaga testów pozytywnych i negatywnych: wygasły token, ponowne użycie tokena, zbyt słabe hasło, brak konta.

## 5. Szablony HTML

Szablon e-maila można testować pod kątem obecności treści, linków, podstawowej semantyki i braku wycieku danych.

## Przykład referencyjny

```typescript
const messages = await request.get('http://localhost:8025/api/v1/messages');
await expect(messages).toBeOK();
const body = await messages.json();
const activation = body.messages.find((m: any) => m.Subject.includes('Aktywacja konta'));
expect(activation).toBeTruthy();

const html = activation.HTML as string;
const activationUrl = html.match(/https?:\/\/[^"']+\/activate\/[^"']+/)?.[0];
expect(activationUrl).toBeTruthy();
await page.goto(activationUrl!);
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
