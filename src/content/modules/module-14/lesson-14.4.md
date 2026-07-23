# Podstawy testów penetracyjnych

Testy penetracyjne i testowanie bezpieczeństwa mają wspólny cel: znaleźć ryzyka, które mogą doprowadzić do naruszenia poufności, integralności albo dostępności systemu. Nie są jednak tym samym. Tester automatyzujący może i powinien wykonywać podstawowe testy bezpieczeństwa aplikacji, ale pełny pentest wymaga formalnego zakresu, zgody, doświadczenia i często osobnej roli specjalisty security.

Ta lekcja pokazuje, jak Full Stack Tester może bezpiecznie i odpowiedzialnie włączyć podstawy testów penetracyjnych do procesu jakości, nie przekraczając granic etycznych i organizacyjnych.

## 1. Pentest vs security testing w QA

**Security testing w QA** to regularne sprawdzanie znanych klas ryzyka w kontrolowany sposób:

- autoryzacja;
- uwierzytelnianie;
- walidacja danych wejściowych;
- nagłówki bezpieczeństwa;
- cookies;
- CORS;
- rate limiting;
- brak wycieku danych w odpowiedziach i logach.

**Pentest** to głębsza, często manualna próba znalezienia i wykorzystania podatności w uzgodnionym zakresie. Może obejmować chainowanie podatności, omijanie zabezpieczeń, testy konfiguracji infrastruktury i techniki ofensywne.

Tester QA powinien znać podstawy, ale nie powinien wykonywać agresywnych testów bez pisemnej zgody i zakresu.

## 2. Zasady etyczne i zakres

Przed testami bezpieczeństwa ustal:

- środowisko: local, test, staging, nigdy produkcja bez zgody;
- zakres endpointów i funkcji;
- zakazane techniki, np. DoS, brute force, skan całej sieci;
- konta testowe i role;
- sposób zgłaszania podatności;
- osoby kontaktowe;
- okno testowe;
- zasady pracy z danymi.

Nie testuj cudzych systemów, produkcji, usług zewnętrznych ani kont prawdziwych użytkowników bez formalnej zgody.

## 3. OWASP jako mapa ryzyk

Najważniejsze źródła:

- OWASP Top 10 — klasy ryzyk webowych;
- OWASP Web Security Testing Guide — techniki testowania;
- OWASP API Security Top 10 — ryzyka API;
- OWASP Cheat Sheet Series — praktyczne zabezpieczenia.

Dla Full Stack Testera szczególnie ważne są:

- broken access control;
- injection;
- authentication/session issues;
- security misconfiguration;
- vulnerable components;
- logging and monitoring failures;
- SSRF jako świadomość ryzyka;
- API authorization i mass assignment.

## 4. Testy autoryzacji i IDOR

IDOR występuje, gdy użytkownik może dostać się do cudzego zasobu przez zmianę identyfikatora.

Przykład testu API:

```typescript
const response = await request.get(`/api/orders/${otherUserOrderId}`, {
  headers: { Authorization: `Bearer ${regularUserToken}` },
});

expect([403, 404]).toContain(response.status());
```

Ważne przypadki:

- użytkownik A czyta zasób użytkownika B;
- użytkownik bez roli admina wykonuje akcję admina;
- tenant A próbuje zobaczyć tenant B;
- zmiana `userId`, `orderId`, `tenantId` w URL albo body;
- masowe przypisanie roli przez dodatkowe pole w payloadzie.

Testy IDOR są jednymi z najbardziej wartościowych automatycznych testów security.

## 5. Injection — SQL, NoSQL, command, template

Tester nie musi wykonywać destrukcyjnych exploitów, ale powinien sprawdzać, czy aplikacja bezpiecznie obsługuje podejrzane wejścia.

Przykładowe payloady testowe:

```text
' OR '1'='1
<script>alert(1)</script>
../../etc/passwd
${{7*7}}
```

Bezpieczny test sprawdza, że aplikacja:

- nie zwraca stack trace;
- nie wykonuje payloadu;
- waliduje dane;
- loguje błąd bez sekretów;
- zwraca kontrolowany status 400/422.

Nie wykonuj destructive payloadów na niekontrolowanym środowisku.

## 6. XSS

XSS oznacza wykonanie niechcianego JavaScriptu w kontekście aplikacji. Automatyczny test może sprawdzić, że tekst jest renderowany jako tekst, a nie HTML.

```typescript
await page.getByLabel('Komentarz').fill('<img src=x onerror=alert(1)>');
await page.getByRole('button', { name: 'Zapisz' }).click();

await expect(page.getByText('<img src=x onerror=alert(1)>')).toBeVisible();
await expect(page.locator('img[src="x"]')).toHaveCount(0);
```

Testuj szczególnie:

- komentarze;
- nazwy produktów;
- profile użytkownika;
- pola admina wyświetlane klientom;
- import CSV;
- treści zewnętrzne.

## 7. CSRF, cookies i sesje

W aplikacjach używających cookies sprawdzaj:

- `HttpOnly`;
- `Secure`;
- `SameSite`;
- czas życia sesji;
- logout invaliduje sesję;
- back button po logout nie pokazuje danych;
- token CSRF jest wymagany dla operacji zmieniających stan.

Przykład inspekcji cookies w Playwright:

```typescript
const cookies = await page.context().cookies();
const session = cookies.find(cookie => cookie.name === 'session');
expect(session?.httpOnly).toBe(true);
expect(session?.secure).toBe(true);
expect(['Lax', 'Strict']).toContain(session?.sameSite);
```

## 8. Nagłówki bezpieczeństwa

Podstawowe nagłówki:

- `Content-Security-Policy`;
- `X-Frame-Options` lub `frame-ancestors` w CSP;
- `Strict-Transport-Security`;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy`;
- `Permissions-Policy`.

Przykład:

```typescript
const response = await request.get('/');
const headers = response.headers();

expect(headers['content-security-policy']).toBeTruthy();
expect(headers['x-content-type-options']).toBe('nosniff');
```

Nagłówki nie zastępują bezpiecznego kodu, ale są ważną warstwą obrony.

## 9. Rate limiting i brute force

Testuj kontrolowanie liczby prób:

- logowanie z błędnym hasłem;
- reset hasła;
- wysyłka kodu SMS/email;
- publiczne API wyszukiwania;
- endpointy kosztowne obliczeniowo.

Przykład:

```typescript
for (let i = 0; i < 6; i++) {
  await request.post('/api/login', {
    data: { email: 'qa@example.test', password: `wrong-${i}` },
  });
}

const blocked = await request.post('/api/login', {
  data: { email: 'qa@example.test', password: 'wrong-final' },
});

expect([429, 423, 403]).toContain(blocked.status());
```

Nie uruchamiaj masowego brute force bez uzgodnienia zakresu.

## 10. OWASP ZAP i automatyczne skanery

OWASP ZAP baseline scan może być częścią CI dla środowiska testowego:

```bash
docker run -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
  -t https://staging.example.test \
  -r zap-report.html
```

Ograniczenia skanera:

- nie zna kontekstu biznesowego;
- może generować false positives;
- nie zastępuje testów autoryzacji;
- wymaga interpretacji;
- może pominąć logikę zależną od roli i danych.

Skaner jest narzędziem pomocniczym, nie pełnym pentestem.

## 11. Raportowanie podatności

Raport security powinien zawierać:

- tytuł i typ podatności;
- środowisko;
- zakres;
- kroki reprodukcji;
- oczekiwany i rzeczywisty rezultat;
- wpływ biznesowy;
- dowody;
- potencjalną kategorię OWASP;
- severity i priority;
- rekomendację naprawy;
- informację, czy dane zostały naruszone.

Nie publikuj szczegółów podatności publicznie przed naprawą.

## 12. CVSS i priorytetyzacja

CVSS pomaga opisać techniczną powagę podatności, ale priorytet naprawy zależy też od kontekstu biznesowego:

- czy funkcja jest publiczna?
- czy wymaga konta?
- czy dotyczy danych osobowych?
- czy istnieje exploit?
- czy jest workaround?
- czy podatność dotyczy produkcji?

Tester powinien umieć opisać wpływ, nie tylko wskazać payload.

## 13. Checklista podstawowego security testingu QA

- Czy użytkownik nie może dostać się do cudzych zasobów?
- Czy role są egzekwowane po stronie API?
- Czy wejścia są walidowane i escapowane?
- Czy aplikacja nie zwraca stack trace użytkownikowi?
- Czy cookies mają bezpieczne flagi?
- Czy nagłówki bezpieczeństwa są obecne?
- Czy rate limiting działa dla krytycznych endpointów?
- Czy logi nie zawierają sekretów?
- Czy testy są wykonywane tylko w uzgodnionym zakresie?

## Linki

- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [OWASP ZAP](https://www.zaproxy.org/)
- [FIRST CVSS](https://www.first.org/cvss/)

## 📘 Suplement Inżynieryjny 2026: Dostępność i Regresja Wizualna (A11y & Masking)
*Inspiracja: „Hands-On Automated Testing with Playwright” (2026), Chapters 9 & 10*
*   **Axe Scoping**: Skanuj dostępność aplikacji tylko w obszarach, nad którymi masz kontrolę, wykluczając elementy zewnętrzne przez `.exclude()`.
*   **Maskowanie i Progi Tolerancji**: Przy testach wizualnych maskuj elementy dynamiczne (np. daty) za pomocą `mask`, a progi czułości pikseli kontroluj przez `maxDiffPixelRatio`.
