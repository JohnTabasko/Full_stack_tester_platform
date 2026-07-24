# Podstawy automatycznego testowania bezpieczeństwa (Security Testing)

W tradycyjnym cyklu życia projektu, testy bezpieczeństwa są wykonywane na samym końcu, tuż przed wdrożeniem produkcyjnym, przez zewnętrznych audytorów. W nowoczesnych rurociągach DevSecOps, dążymy do przesunięcia bezpieczeństwa w lewo (**Shift-Left Security**), automatyzując podstawowe testy podatności oraz weryfikację polityk bezpieczeństwa bezpośrednio na poziomie codziennych testów regresyjnych.

Jako Full Stack Tester, potrafisz w ułamku sekundy automatycznie zweryfikować poprawność nagłówków bezpieczeństwa serwera oraz odporność formularzy na podstawowe ataki sieciowe.

---

## 1. Automatyczny audyt nagłówków bezpieczeństwa (Security Headers)

Serwery WWW muszą wymuszać rygorystyczne polityki bezpieczeństwa przeglądarki w celu ochrony użytkowników przed atakami typu Clickjacking, XSS czy kradzieżą sesji. 

Możemy napisać test automatyczny, który pobierze nagłówki odpowiedzi i zweryfikuje ich poprawność:

```typescript
import { test, expect } from '@playwright/test';

test('audyt nagłówków bezpieczeństwa i polityki CSP serwera', async ({ request }) => {
  const response = await request.get('/');
  await expect(response).toBeOK();
  
  const headers = response.headers();

  // 1. CSP (Content-Security-Policy) - chroni przed złośliwymi skryptami z obcych domen
  expect(headers['content-security-policy']).toBeDefined();
  expect(headers['content-security-policy']).toContain("default-src 'self'");

  // 2. X-Frame-Options - zapobiega osadzaniu strony w ramkach na obcych witrynach (Clickjacking)
  expect(headers['x-frame-options']).toMatch(/DENY|SAMEORIGIN/i);

  // 3. Strict-Transport-Security (HSTS) - wymusza bezpieczne połączenie szyfrowane HTTPS
  expect(headers['strict-transport-security']).toBeDefined();
});
```

---

## 2. Automatyczna weryfikacja podatności Cross-Site Scripting (XSS)

Atak **XSS** polega na wstrzyknięciu złośliwego kodu JavaScript do pól formularza, który po wyrenderowaniu na ekranie innego użytkownika wykonuje się w jego przeglądarce (np. kradnąc ciasteczka sesyjne).

Możemy napisać test automatyczny weryfikujący, czy nasza aplikacja poprawnie filtruje i neutralizuje (escapuje) złośliwe znaczniki przed ich wyrenderowaniem:

```typescript
test('formularz opinii o produkcie jest odporny na wstrzykiwanie kodu XSS', async ({ page }) => {
  await page.goto('/product/101');

  // Złośliwy kod XSS próbujący wywołać alert systemowy
  const xssPayload = '<script>alert("Hacked!")</script>';

  // Wpisz i wyślij payload w formularzu opinii
  await page.getByPlaceholder('Wpisz swoją opinię...').fill(xssPayload);
  await page.getByRole('button', { name: 'Wyślij opinię' }).click();

  // Weryfikacja: Upewnij się, że kod nie wykonał się jako skrypt, lecz został potraktowany jako zwykły tekst
  const opinionText = page.locator('.product-opinion-item').first();
  await expect(opinionText).toContainText(xssPayload); // Tekst wyświetla się bezpiecznie

  // Dodatkowa weryfikacja: upewnij się, że nie wyzwolił się żaden systemowy dialog alertu
  page.on('dialog', () => {
    throw new Error('WYKRYTO PODATNOŚĆ XSS! Wyzwoliło się systemowe okno alert()!');
  });
});
```

---

## 3. Checklista Podstaw Bezpieczeństwa
- [ ] Czy Twój serwer poprawnie wysyła krytyczne nagłówki bezpieczeństwa (`Content-Security-Policy`, `X-Frame-Options`, `HSTS`)?
- [ ] Czy automatycznie weryfikujesz odporność formularzy na wstrzykiwanie skryptów (XSS)?
- [ ] Czy upewniłeś się, że błędy bezpieczeństwa są natychmiast zgłaszane jako awarie testu w rurociągu CI/CD?