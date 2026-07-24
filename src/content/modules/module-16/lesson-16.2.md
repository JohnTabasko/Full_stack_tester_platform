# Testowanie komunikatów poczty elektronicznej (Email Testing)

Wiele krytycznych procesów rejestracji, uwierzytelniania dwuskładnikowego (2FA) czy odzyskiwania haseł opiera się na wysyłce wiadomości e-mail do użytkownika. Przetestowanie tych procesów E2E stanowi poważne wyzwanie, ponieważ testy nie mogą wysyłać wiadomości na prawdziwe serwery pocztowe (grozi to spamem, blokowaniem adresów IP oraz trudnością w automatycznym odczytaniu treści).

Najlepszym inżynieryjnym podejściem jest wdrożenie lokalnego, odizolowanego serwera przechwytującego pocztę (**SMTP Mock/Catcher**, np. **Mailpit** lub **Mailhog**) uruchamianego w kontenerze Docker. W tej lekcji nauczysz się, jak odczytywać wiadomości i wyodrębniać z nich linki aktywacyjne bezpośrednio z kodu testu w Playwright.

---

## 1. Architektura przechwytywania i odczytu poczty

W środowiskach testowych konfiguracja aplikacji (backend) zostaje przekierowana tak, aby wysyłała wszystkie wiadomości e-mail na lokalny, testowy serwer SMTP:

```
+------------------+                   +--------------------+
|  Backend App     | -- SMTP (1025) -> |   SMTP Mailpit     |
| (Wysyła e-mail)  |                   | (Mock Mail Server) |
+------------------+                   +--------------------+
                                                 |
                                           REST API (8025)
                                                 |
                                                 v
                                       +--------------------+
                                       |  Playwright Test   |
                                       | (Pobiera e-mail)   |
                                       +--------------------+
```

Playwright Test za pomocą wbudowanej fixtury `request` (klienta API) odpytuje serwer Mailpit o ostatnio odebrane wiadomości, filtruje je po adresacie i pobiera ciało HTML wiadomości.

---

## 2. Implementacja testu: Odzyskiwanie hasła i link aktywacyjny

Napiszmy kompletny, stabilny test dla procesu resetowania hasła:

```typescript
import { test, expect } from '@playwright/test';

test('użytkownik może zresetować hasło za pomocą linku e-mail', async ({ page, request }) => {
  const testEmail = 'user-reset@mycommerce.pl';

  // 1. Act (UI): Wyślij prośbę o zresetowanie hasła
  await page.goto('/forgot-password');
  await page.getByLabel('E-mail').fill(testEmail);
  await page.getByRole('button', { name: 'Wyślij link' }).click();

  // 2. Arrange (API): Odpytaj serwer Mailpit o ostatnią wiadomość dla tego adresata
  // Wykorzystujemy pętlę ponowień (polling), ponieważ wysyłka poczty może zająć kilkaset ms
  let emailMessage: any = null;
  await expect.poll(async () => {
    const response = await request.get('http://localhost:8025/api/v1/messages');
    const data = await response.json();
    
    // Wyszukaj najnowszą wiadomość wysłaną do testEmail
    emailMessage = data.messages.find((m: any) => m.To[0].Address === testEmail);
    return emailMessage;
  }, {
    timeout: 10000, // Czekaj maksymalnie 10 sekund
    intervals: [1000], // Odpytuj co 1 sekundę
  }).toBeDefined();

  // 3. Pobierz pełne ciało HTML wiadomości e-mail z Mailpit
  const messageId = emailMessage.ID;
  const contentResponse = await request.get(`http://localhost:8025/api/v1/message/${messageId}`);
  const messageData = await contentResponse.json();
  const htmlBody = messageData.HTML;

  // 4. Wyodrębnij link resetujący hasło za pomocą wyrażenia regularnego (Regex)
  const linkRegex = /href="([^"]+)"/;
  const match = htmlBody.match(linkRegex);
  if (!match) {
    throw new Error('Nie znaleziono linku resetującego w treści e-maila!');
  }
  const resetPasswordUrl = match[1];

  // 5. Act (UI): Przejdź bezpośrednio pod wyodrębniony link i zmień hasło
  await page.goto(resetPasswordUrl);
  await page.getByLabel('Nowe hasło').fill('NewStrongPassword123!');
  await page.getByRole('button', { name: 'Zapisz' }).click();

  // 6. Assert: Potwierdź sukces
  await expect(page.getByText('Hasło zostało zmienione.')).toBeVisible();
});
```

---

## 3. Checklista Testowania Poczty Elektronicznej
- [ ] Czy w środowiskach testowych przekierowałeś ruch SMTP na odizolowany serwer przechwytujący (np. Mailpit)?
- [ ] Czy do odpytywania API Mailpit stosujesz bezpieczne ponowienia asynchroniczne (`expect.poll()`)?
- [ ] Czy poprawnie filtrujesz listy wiadomości po unikalnym adresie odbiorcy?
- [ ] Czy wyodrębniane linki aktywacyjne są walidowane za pomocą wyrażeń regularnych (Regex)?