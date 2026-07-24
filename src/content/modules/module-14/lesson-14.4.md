# Automatyzacja podstawowych testów penetracyjnych (Fuzzing & Broken Access)

Podczas gdy tradycyjne testy bezpieczeństwa weryfikują konfigurację (np. nagłówki serwera), **testy penetracyjne (Penetration Testing)** polegają na celowej symulacji ataków w celu odnalezienia podatności logicznych w aplikacji. 

Do najgroźniejszych podatności według klasyfikacji **OWASP Top 10** należą:
1.  **SQL Injection (SQLi)**: Wstrzykiwanie złośliwych zapytań SQL do pól wejściowych w celu kradzieży danych z bazy.
2.  **Broken Access Control (Uszkodzona kontrola dostępu)**: Możliwość wejścia na zablokowane strony administratora przez zwykłego, zalogowanego gościa.

W tej lekcji nauczysz się, jak zautomatyzować weryfikację tych krytycznych ryzyk przy użyciu Playwright.

---

## 1. Automatyczne wykrywanie SQL Injection za pomocą techniki Fuzzingu

Metodologia **Fuzzingu** polega na automatycznym wstrzykiwaniu losowych lub przygotowanych w słowniku, niepoprawnych danych (payloads) do formularzy i obserwowaniu, czy system nie rzuca błędów bazy danych (np. błędów PostgreSQL/MySQL) dających hakerom dostęp do informacji.

```typescript
import { test, expect } from '@playwright/test';

// Słownik podstawowych zapytań SQL Injection (Fuzzing Dictionary)
const sqlPayloads = [
  "1' OR '1'='1",
  "admin' --",
  "'; DROP TABLE users; --",
];

for (const payload of sqlPayloads) {
  test(`Wyszukiwarka produktów jest odporna na payload: ${payload}`, async ({ page }) => {
    await page.goto('/shop');

    // Wpisz złośliwy payload do paska wyszukiwania i zatwierdź
    await page.getByPlaceholder('Szukaj...').fill(payload);
    await page.getByPlaceholder('Szukaj...').press('Enter');

    // Weryfikacja: Upewnij się, że system bezpiecznie obsłużył błąd (brak produktów),
    // a na ekranie nie wyrenderowały się krytyczne błędy bazy danych dające dostęp do bazy!
    const consoleLogs: string[] = [];
    page.on('console', msg => consoleLogs.push(msg.text()));

    await expect(page.getByText('Nie znaleziono produktów spełniających kryteria')).toBeVisible();
    
    // Upewnij się, że w logach konsoli przeglądarki nie ma wycieków struktury SQL
    const sqlErrorDetected = consoleLogs.some(log => log.toLowerCase().includes('sql') || log.toLowerCase().includes('database'));
    expect(sqlErrorDetected).toBe(false);
  });
}
```

---

## 2. Weryfikacja Broken Access Control (Testy Uprawnień)

Atakujący często modyfikują adresy URL w celu obejścia uwierzytelnienia (np. zmieniają adres z `/account` na `/admin-dashboard`). Testy automatyczne muszą dbać o to, aby zalogowany użytkownik o uprawnieniach klienta (`customer`) otrzymał status odmowy dostępu:

```typescript
test('klient nie może wejść do panelu administratora (Broken Access Control)', async ({ browser }) => {
  // 1. Arrange: Załaduj stan sesji zwykłego klienta
  const context = await browser.newContext({ storageState: '.auth/customer.json' });
  const page = await context.newPage();

  // 2. Act: Spróbuj wejść bezpośrednio pod tajny adres administratora
  await page.goto('/admin/users-list');

  // 3. Assert: Upewnij się, że serwer poprawnie zablokował dostęp i przekierował do strony 403 lub logowania
  await expect(page).not.toHaveURL('/admin/users-list');
  await expect(
    page.getByText('Brak uprawnień')
      .or(page.getByText('Access Denied'))
      .or(page.getByRole('heading', { name: 'Logowanie' }))
  ).toBeVisible();

  await context.close();
});
```

---

## 3. Checklista Testów Penetracyjnych
- [ ] Czy formularze w Twojej aplikacji są automatycznie fuzzowane pod kątem ataków SQL Injection?
- [ ] Czy testujesz szczelność uprawnień (Broken Access Control), próbując wejść na adresy administracyjne z kontekstu zwykłego użytkownika?
- [ ] Czy dbasz o to, aby w przypadku wykrycia wycieków logów bazy danych test natychmiast zgłaszał awarię?