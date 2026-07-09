# Podstawy testowania bezpieczeństwa

> **Perspektywa Full Stack Testera**
> Aplikacja, która funkcjonuje poprawnie, ale pozwala na wyciek danych osobowych, obejście uprawnień albo kradzież sesji, jest gorsza niż aplikacja, która odmawia działania. Bezpieczeństwo to nie feature — to fundament, na którym buduje się zaufanie użytkowników i zgodność z regulacjami. Testowanie bezpieczeństwa z Playwright nie zastąpi audytu penetra-cyjnego, ale może wykrywać regresje w krytycznych kontrolach dostępu i nagłówkach bezpieczeństwa. Ta lekcja uczy, jak projektować testy bezpieczeństwa, które dają użyteczny dowód w CI, jednocześnie rozumiejąc granice automatyzacji.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Rozumieć zakres automatyzacji bezpieczeństwa** — co Playwright może testować vs. co wymaga eksperta
- **Testować kontrolę dostępu (IDOR)** — weryfikacja, że użytkownik nie ma dostępu do zasobów innych użytkowników
- **Sprawdzać nagłówki bezpieczeństwa** — CSP, HSTS, X-Frame-Options, CORS, HttpOnly, SameSite
- **Testować podstawowe ataki** — XSS reflected/dom, basic SQL injection, CSRF token presence
- **Weryfikować sesję i autentykację** — token expiration, secure cookies, logout effectiveness
- **Prowadzić audyt zależności** — wykrywanie known vulnerabilities w bibliotekach

---

## Wprowadzenie: bezpieczeństwo jako warstwa jakości

Testowanie bezpieczeństwa w Playwright różni się od testowania funkcjonalnego:

| Aspekt | Testy funkcjonalne | Testy bezpieczeństwa |
|--------|-------------------|---------------------|
| **Cel** | Czy feature działa zgodnie ze specyfikacją | Czy system chroni przed zagrożeniami |
| **Podejście** | Happy path + edge cases | Threat modeling + attack vectors |
| **Wynik** | Pass/fail dla funkcji | Risk assessment + evidence |
| **Ograniczenia** | Testuje zachowanie, nie architekturę | Nie zastępuje audytu penetra-cyjnego |

Zasada nr 1: **automatyzacja wykrywa regresje, nie nowe podatności**. Jeśli wczoraj strona miała CSP header, test wykryje, że dzisiaj header zniknął. Ale nie powie ci, czy nowy endpoint jest podatny na SSRF.

Zasada nr 2: **test bezpieczeństwa musi być audytowalny**. Co dokładnie sprawdzono? Kiedy? Z jakim wynikiem? To ważne dla compliance i incident response.

---

## Sekcja 1: OWASP Top 10 — kontekst dla testera

### OWASP Top 10 (2021) — co można testować automatycznie

| OWASP Category | Automatable? | How | Limitation |
|---------------|--------------|-----|------------|
| **A01 Broken Access Control** | ✅ Yes | IDOR tests, privilege escalation | Can't find new IDORs, only regression |
| **A02 Cryptographic Failures** | ⚠️ Partial | Header checks, HTTPS enforcement | Can't test crypto implementation |
| **A03 Injection** | ⚠️ Partial | XSS reflected checks, input sanitization | SQL injection requires DB access |
| **A04 Insecure Design** | ❌ No | N/A | Design flaws require architecture review |
| **A05 Security Misconfiguration** | ✅ Yes | Header checks, default creds | Only known misconfigs |
| **A06 Vulnerable Components** | ✅ Yes | npm audit, dependency scanning | Only known CVEs |
| **A07 Auth & Session Failures** | ⚠️ Partial | Cookie attributes, token expiration | Can't test auth logic comprehensively |
| **A08 Data Integrity Failures** | ⚠️ Partial | CSRF token presence | Can't test all data flows |
| **A09 Logging Failures** | ⚠️ Partial | Audit trail existence | Quality of logging hard to assess |
| **A10 SSRF** | ❌ No | N/A | Requires security expertise |

Dla kategorii A01, A02, A05, A06 Playwright + API testing może dać realną wartość. Dla reszty — to sygnał do dalszej analizy, nie rozstrzygający dowód.

### Threat modeling — od czego zacząć

Przed pisaniem testów bezpieczeństwa odpowiedz na pytania:

1. **Co chronimy?** (np. dane osobowe, sesje użytkowników, dane finansowe)
2. **Przed kim?** (np. anonymous users, authenticated users, insiders)
3. **Jakie są główne zagrożenia?** (np. IDOR, XSS, session hijacking)
4. **Co jest krytyczne?** (np. admin panel, payment flow, user profile)

```typescript
// tests/security/threat-model.ts
interface SecurityTestScope {
  protectedResources: string[];  // URLs/resource IDs that require protection
  attackVectors: string[];       // Types of attacks to test (IDOR, XSS, etc.)
  userRoles: Record<string, string[]>;  // role → allowed resources
  criticalFlows: string[];       // Flows that must remain secure
}

const securityScope: SecurityTestScope = {
  protectedResources: [
    '/api/orders/*',      // Order data - user's own only
    '/api/profile',       // User profile - own only
    '/api/admin/*',       // Admin panel - admin role only
    '/api/users/*',       // User management - admin only
  ],
  attackVectors: ['IDOR', 'XSS', 'CSRF', 'Session Hijacking'],
  userRoles: {
    guest: [],
    customer: ['/api/orders/*', '/api/profile'],
    admin: ['/api/orders/*', '/api/profile', '/api/admin/*', '/api/users/*'],
  },
  criticalFlows: ['Checkout', 'Login', 'Profile Update', 'Password Change'],
};
```

---

## Sekcja 2: Kontrola dostępu — IDOR testing

### Czym jest IDOR

IDOR (Insecure Direct Object Reference) — użytkownik może uzyskać dostęp do zasobu innego użytkownika, bo aplikacja nie weryfikuje uprawnień na poziomie zasobu:

```
Użytkownik A zamówienie ID: 12345
Użytkownik B zamówienie ID: 12346

Atak: Użytkownik B próbuje GET /api/orders/12345
Oczekiwany: 403 Forbidden
W rzeczywistości: 200 OK → wyciek danych
```

### Test IDOR — user order access

```typescript
// tests/security/idor.spec.ts
import { test, expect, request } from '@playwright/test';

test.describe('IDOR — Insecure Direct Object Reference', () => {
  let customerA: { token: string; userId: string; orderId: string };
  let customerB: { token: string; userId: string; orderId: string };
  
  test.beforeAll(async ({ request }) => {
    // Setup: stwórz dwóch użytkowników z zamówieniami
    customerA = await createTestUserWithOrder(request, 'customer-a@test.com');
    customerB = await createTestUserWithOrder(request, 'customer-b@test.com');
  });
  
  test.afterAll(async ({ request }) => {
    // Cleanup
    await deleteTestUser(request, customerA.userId);
    await deleteTestUser(request, customerB.userId);
  });
  
  test('user A cannot access user B order', async ({ request }) => {
    // Customer A próbuje pobrać order Customer B
    const response = await request.get(`/api/orders/${customerB.orderId}`, {
      headers: { Authorization: `Bearer ${customerA.token}` },
    });
    
    // Oczekiwane zachowanie: 403 Forbidden lub 404 Not Found
    // NIE akceptujemy 200 OK (to byłby IDOR!)
    expect(
      response.status(),
      `IDOR DETECTED: User A accessed User B's order. Expected 403/404, got ${response.status()}`
    ).toMatch(/403|404/);
  });
  
  test('user B cannot access user A order', async ({ request }) => {
    const response = await request.get(`/api/orders/${customerA.orderId}`, {
      headers: { Authorization: `Bearer ${customerB.token}` },
    });
    
    expect(response.status()).toMatch(/403|404/);
  });
  
  test('user can access own order', async ({ request }) => {
    // Positive case: właściciel order ma dostęp
    const response = await request.get(`/api/orders/${customerA.orderId}`, {
      headers: { Authorization: `Bearer ${customerA.token}` },
    });
    
    expect(response.status()).toBe(200);
    
    const order = await response.json();
    expect(order.id).toBe(customerA.orderId);
    expect(order.customerId).toBe(customerA.userId);
  });
  
  test('unauthenticated user cannot access any order', async ({ request }) => {
    const response = await request.get(`/api/orders/${customerA.orderId}`);
    
    expect(response.status()).toBe(401);
  });
});

async function createTestUserWithOrder(
  request: APIRequestContext,
  email: string
): Promise<{ token: string; userId: string; orderId: string }> {
  // Register
  const registerResp = await request.post('/api/auth/register', {
    data: { email, password: 'Test123!', name: 'Test User' },
  });
  const { user } = await registerResp.json();
  
  // Login
  const loginResp = await request.post('/api/auth/login', {
    data: { email, password: 'Test123!' },
  });
  const { token } = await loginResp.json();
  
  // Create order
  const orderResp = await request.post('/api/orders', {
    headers: { Authorization: `Bearer ${token}` },
    data: { items: [{ productId: 'test-product-1', quantity: 1 }] },
  });
  const { id: orderId } = await orderResp.json();
  
  return { token, userId: user.id, orderId };
}
```

### Test privilege escalation

```typescript
test.describe('Privilege Escalation', () => {
  let customerToken: string;
  let adminToken: string;
  
  test.beforeAll(async ({ request }) => {
    customerToken = await getToken(request, 'customer@test.com');
    adminToken = await getToken(request, 'admin@test.com');
  });
  
  test('customer cannot access admin endpoints', async ({ request }) => {
    const adminEndpoints = [
      '/api/admin/users',
      '/api/admin/stats',
      '/api/admin/config',
      '/api/users/delete',
    ];
    
    for (const endpoint of adminEndpoints) {
      const response = await request.get(endpoint, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      
      expect(
        response.status(),
        `Privilege escalation detected: customer accessed ${endpoint}`
      ).toBe(403);
    }
  });
  
  test('customer cannot access other user profiles', async ({ request }) => {
    // Pobierz listę użytkowników (powinien być forbidden)
    const response = await request.get('/api/users', {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    
    expect(response.status()).toBe(403);
  });
  
  test('customer cannot modify other user data', async ({ request }) => {
    const otherUserId = 'other-user-id-123';
    
    const response = await request.patch(`/api/users/${otherUserId}`, {
      headers: { Authorization: `Bearer ${customerToken}` },
      data: { name: 'Hacked Name' },
    });
    
    expect(response.status()).toBe(403);
  });
  
  test('admin can access admin endpoints', async ({ request }) => {
    const response = await request.get('/api/admin/stats', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    
    // Admin ma dostęp
    expect(response.status()).toBe(200);
  });
});
```

---

## Sekcja 3: Nagłówki bezpieczeństwa

### Check security headers

```typescript
// tests/security/headers.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Security Headers', () => {
  interface SecurityHeaderCheck {
    name: string;
    expected: string | RegExp;
    severity: 'critical' | 'high' | 'medium' | 'low';
  }
  
  const securityHeaders: SecurityHeaderCheck[] = [
    {
      name: 'Strict-Transport-Security',
      expected: /max-age=\d+/,
      severity: 'critical',
    },
    {
      name: 'Content-Security-Policy',
      expected: /script-src/i,
      severity: 'high',
    },
    {
      name: 'X-Frame-Options',
      expected: /^(DENY|SAMEORIGIN)$/i,
      severity: 'medium',
    },
    {
      name: 'X-Content-Type-Options',
      expected: /^nosniff$/i,
      severity: 'medium',
    },
    {
      name: 'Referrer-Policy',
      expected: /^(no-referrer|strict-origin-when-cross-origin|same-origin)$/i,
      severity: 'low',
    },
    {
      name: 'Permissions-Policy',
      expected: /.+/,
      severity: 'low',
    },
  ];
  
  test('critical security headers are present', async ({ page }) => {
    await page.goto('/');
    
    const response = page.request;
    const headers = (await response.get('/')).headers();
    
    const violations: string[] = [];
    
    for (const check of securityHeaders) {
      const value = headers[check.name.toLowerCase()];
      
      if (!value) {
        violations.push(`${check.name}: MISSING (severity: ${check.severity})`);
        continue;
      }
      
      if (!check.expected.test(value)) {
        violations.push(
          `${check.name}: INVALID value "${value}" (expected: ${check.expected}, severity: ${check.severity})`
        );
      }
    }
    
    // Fail on critical/high violations only
    const criticalViolations = violations.filter(v => 
      v.includes('severity: critical') || v.includes('severity: high')
    );
    
    if (criticalViolations.length > 0) {
      console.error('Critical security header violations:');
      criticalViolations.forEach(v => console.error(`  - ${v}`));
    }
    
    // Medium/low jako warnings
    const mediumViolations = violations.filter(v => v.includes('severity: medium'));
    if (mediumViolations.length > 0) {
      console.warn('Medium severity header issues:');
      mediumViolations.forEach(v => console.warn(`  - ${v}`));
    }
    
    // Jeśli critical violations → fail
    // Jeśli tylko medium/low → pass z warning
    expect(criticalViolations.length, `Critical header violations: ${criticalViolations.join(', ')}`).toBe(0);
  });
  
  test('HTTPS is enforced', async ({ page }) => {
    // Próba HTTP → powinna przekierować na HTTPS
    const httpUrl = page.url().replace('https://', 'http://');
    
    const response = await page.request.get(httpUrl, { 
      maxRedirects: 0,
      failOnStatusCode: false,
    });
    
    // Oczekiwane: przekierowanie lub status z HTTPS
    // Niedopuszczalne: 200 OK na HTTP bez przekierowania
    const finalUrl = response.url();
    
    expect(
      finalUrl.startsWith('https://'),
      `HTTPS not enforced: request to ${httpUrl} resulted in ${finalUrl}`
    ).toBe(true);
  });
});
```

### Cookie security attributes

```typescript
test.describe('Cookie Security', () => {
  test('session cookie has security attributes', async ({ page, context }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Hasło').fill('password');
    await page.getByRole('button', { name: 'Zaloguj' }).click();
    
    await page.waitForURL(/\/dashboard/);
    
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c => c.name === 'session' || c.name === 'sessionId');
    
    if (sessionCookie) {
      console.log('Session cookie found:', sessionCookie.name);
      
      // HttpOnly — nie dostępny z JavaScript
      expect(sessionCookie.httpOnly, 'Session cookie should be HttpOnly').toBe(true);
      
      // Secure — tylko HTTPS
      expect(sessionCookie.secure, 'Session cookie should be Secure (HTTPS only)').toBe(true);
      
      // SameSite — ochrona przed CSRF
      expect(
        ['strict', 'lax'].includes(sessionCookie.sameSite),
        `SameSite should be Strict or Lax, got: ${sessionCookie.sameSite}`
      ).toBe(true);
      
      // Path — nie szerszy niż potrzeba
      expect(sessionCookie.path).toBe('/');
    } else {
      console.log('No session cookie found — using Authorization header');
      // Używamy token-based auth, nie cookie
    }
  });
  
  test('logout invalidates session', async ({ page, context }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Hasło').fill('password');
    await page.getByRole('button', { name: 'Zaloguj' }).click();
    await page.waitForURL(/\/dashboard/);
    
    // Get session token
    const cookiesBefore = await context.cookies();
    const sessionToken = cookiesBefore.find(c => c.name === 'session')?.value;
    
    // Logout
    await page.getByRole('button', { name: 'Wyloguj' }).click();
    await page.waitForURL('/');
    
    // Verify cookie invalidated
    const cookiesAfter = await context.cookies();
    const sessionAfter = cookiesAfter.find(c => c.name === 'session');
    
    // Token powinien być unieważniony (inny lub usunięty)
    if (sessionAfter) {
      expect(sessionAfter.value).not.toBe(sessionToken);
    }
    
    // Verify cannot access protected page with old token
    const response = await page.request.get('/api/profile', {
      headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
    });
    
    expect(response.status()).toBe(401);
  });
});
```

---

## Sekcja 4: XSS testing — podstawowe wykrywanie

### XSS reflected — input reflection check

```typescript
test.describe('XSS — Cross-Site Scripting', () => {
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '"><script>alert("XSS")</script>',
    "javascript:alert('XSS')",
  ];
  
  test('search input reflects XSS payload unescaped', async ({ page }) => {
    const url = page.url();
    
    for (const payload of xssPayloads) {
      await page.goto(url);
      await page.getByPlaceholder('Szukaj...').fill(payload);
      await page.getByRole('button', { name: 'Szukaj' }).click();
      
      // Sprawdź czy payload jest reflected w odpowiedzi bez escaping
      const pageContent = await page.content();
      const isReflected = pageContent.includes(payload) && !pageContent.includes('&lt;script');
      
      if (isReflected) {
        console.error(`XSS VULNERABILITY: Payload "${payload}" reflected without escaping`);
        // W rzeczywistym teście → fail
        // W tutorialu → warning
      }
    }
  });
  
  test('form inputs sanitize XSS', async ({ page }) => {
    // Test formularz kontaktowy
    await page.goto('/contact');
    
    const xssPayload = '<img src=x onerror=alert(document.cookie)>';
    
    await page.getByLabel('Imię').fill(xssPayload);
    await page.getByLabel('Wiadomość').fill('Test message with XSS payload');
    await page.getByRole('button', { name: 'Wyślij' }).click();
    
    // Poczekaj na odpowiedź
    await page.waitForTimeout(1000);
    
    // Sprawdź czy payload jest escaped w UI lub komunikacie
    const pageText = await page.textContent('body');
    
    // Payload NIE powinien być wykonany jako JS
    // Może być wyświetlony jako text (escaped) lub zablokowany
    expect(pageText).not.toContain('<img src=x onerror');
  });
  
  test('dangerous characters are filtered in API', async ({ request }) => {
    const dangerousInput = '<script>alert("XSS")</script>';
    
    const response = await request.post('/api/contact', {
      data: {
        name: dangerousInput,
        email: 'test@test.com',
        message: 'Test',
      },
    });
    
    const body = await response.json();
    
    // API powinno either:
    // 1. Escape the input (convert < to &lt;)
    // 2. Reject the input (400 Bad Request)
    // 3. Strip dangerous tags
    
    // Check response doesn't contain unescaped script
    const responseStr = JSON.stringify(body);
    expect(responseStr).not.toContain('<script>alert');
  });
});
```

---

## Sekcja 5: CSRF protection

```typescript
test.describe('CSRF — Cross-Site Request Forgery', () => {
  test('state-changing requests include CSRF token', async ({ page, request }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Hasło').fill('password');
    await page.getByRole('button', { name: 'Zaloguj' }).click();
    await page.waitForURL(/\/dashboard/);
    
    // Get CSRF token from page
    const csrfToken = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="csrf-token"]');
      const input = document.querySelector('input[name="csrf_token"]');
      return meta?.getAttribute('content') || input?.getAttribute('value');
    });
    
    if (!csrfToken) {
      console.warn('No CSRF token found on page — checking if tokens are in cookies');
      
      // Może być cookie-based CSRF
      const cookies = await page.context().cookies();
      const csrfCookie = cookies.find(c => c.name.includes('csrf'));
      
      if (!csrfCookie) {
        console.error('No CSRF protection detected!');
      }
    }
    
    // State-changing API call without CSRF should fail
    const noTokenResponse = await request.post('/api/profile', {
      data: { name: 'Hacked Name' },
    });
    
    // 403 = CSRF protection working
    // 200 = VULNERABLE (no CSRF protection)
    expect(
      noTokenResponse.status(),
      `CSRF vulnerability: request without token returned ${noTokenResponse.status()}`
    ).toBe(403);
    
    // Same request WITH token should succeed
    if (csrfToken) {
      const withTokenResponse = await request.post('/api/profile', {
        headers: { 'X-CSRF-Token': csrfToken },
        data: { name: 'Valid Name' },
      });
      
      expect(withTokenResponse.status()).toBe(200);
    }
  });
});
```

---

## Sekcja 6: Dependency audit

```typescript
// tests/security/dependencies.spec.ts
import { execSync } from 'child_process';

test.describe('Dependency Security Audit', () => {
  test('no known vulnerabilities in dependencies', () => {
    try {
      // Uruchom npm audit
      const result = execSync('npm audit --json', { encoding: 'utf-8' });
      const auditResult = JSON.parse(result);
      
      const vulnerabilities = auditResult.metadata?.vulnerabilities ?? {};
      const totalVulns = Object.values(vulnerabilities).reduce(
        (sum: number, count: any) => sum + (count as number),
        0
      ) as number;
      
      if (totalVulns > 0) {
        console.error(`Found ${totalVulns} vulnerabilities:`);
        for (const [severity, data] of Object.entries(vulnerabilities)) {
          const count = data as any;
          console.error(`  ${severity}: ${count}`);
        }
        
        // Fail if critical/high vulnerabilities
        const criticalCount = (vulnerabilities.critical as number) ?? 0;
        const highCount = (vulnerabilities.high as number) ?? 0;
        
        expect(
          criticalCount,
          `Critical vulnerabilities found: ${criticalCount}`
        ).toBe(0);
        
        expect(
          highCount,
          `High severity vulnerabilities found: ${highCount}`
        ).toBe(0);
      }
      
      console.log(`✅ No critical/high vulnerabilities in dependencies`);
    } catch (error: any) {
      if (error.status === 1) {
        // npm audit returned non-zero (vulnerabilities found)
        console.error('Dependency audit found vulnerabilities');
        
        const result = JSON.parse(error.stdout as string);
        console.error(JSON.stringify(result.metadata?.vulnerabilities, null, 2));
        
        fail('Dependency vulnerabilities detected');
      }
      throw error;
    }
  });
  
  test('playwright version is up to date', () => {
    const playwrightVersion = require('@playwright/test/package.json').version;
    const [major, minor, patch] = playwrightVersion.split('.').map(Number);
    
    // Sprawdź czy wersja nie jest starsza niż 6 miesięcy
    // W praktyce: użyj npm outdated lub Renovate Bot
    console.log(`Playwright version: ${playwrightVersion}`);
    
    // Placeholder check — w rzeczywistości użyj external service
    expect(playwrightVersion).toBeTruthy();
  });
});
```

---

## Sekcja 7: Bezpieczeństwo w CI pipeline

```yaml
# .github/workflows/security.yml
name: Security Tests

on:
  push:
    branches: [main, develop]
  schedule:
    - cron: '0 6 * * *'  # Daily dependency audit

jobs:
  security-headers:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Run app
        run: npm run start &
        background: true
      
      - name: Security header tests
        run: npx playwright test tests/security/headers.spec.ts
      
      - name: IDOR tests
        run: npx playwright test tests/security/idor.spec.ts
  
  dependency-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Audit dependencies
        run: npm audit --audit-level=high
      
      - name: Check for outdated packages
        run: npm outdated --json | tee outdated.json
        continue-on-error: true
      
      - name: Report outdated
        if: always()
        run: |
          if [ -s outdated.json ]; then
            echo "Outdated packages found. Review and update."
            cat outdated.json
          fi
```

---

## Perspektywa Full Stack Testera

Testowanie bezpieczeństwa z Playwright to punkt, w którym automatyzacja spotyka się z cyberbezpieczeństwem. Jako Full Stack Tester:

**Rozumiesz granice**: automatyzacja wykrywa regresje w已知 security controls. Nie znajdzie nowych podatności. Nie zastąpi audytu penetra-cyjnego.

**Testujesz z perspektywy atakującego**: co się stanie, gdy użytkownik próbuje uzyskać dostęp do zasobu, do którego nie powinien mieć prawa? Co się stanie, gdy wstrzyknie złośliwy payload?

**Dokumentujesz dowód**: test bezpieczeństwa musi być audytowalny. Co sprawdzono? Kiedy? Z jakim wynikiem? To jest evidence dla compliance i incident response.

**Priorytetyzujesz**: nie wszystko jest krytyczne. IDOR na danych osobowych > missing CSP header. Testuj najpierw highest impact vulnerabilities.

**Utrzymujesz w CI**: security tests w CI = automated regression detection. Bez automatyzacji security staje się "testuj ręcznie raz na kwartał" = rarely tested.

---

## Podsumowanie

- **Scope awareness** — Playwright testuje regresje w controls, nie new vulnerabilities. Nie zastępuje eksperta.
- **IDOR testing** — najważniejszy automated security test. Weryfikuj że user A nie może czytać/modifikować resource of user B.
- **Security headers** — automated check for CSP, HSTS, X-Frame-Options, HttpOnly, SameSite. Critical = fail, medium = warning.
- **XSS detection** — basic reflection check. Nie jest to pełny scan, ale wykrywa obvious regressions.
- **CSRF protection** — verify że state-changing requests wymagają token.
- **Cookie security** — verify HttpOnly, Secure, SameSite attributes.
- **Dependency audit** — npm audit jako automated check for known CVEs.
- **Security in CI** — automated security tests on every push. Daily dependency audit.

---

## Linki i źródła

- [OWASP Top 10 — 2021](https://owasp.org/Top10/) — authoritative list of web application security risks
- [Playwright Security Testing — official docs](https://playwright.dev/docs/security) — security testing guide
- [Security Headers — MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#security) — HTTP security headers reference
- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/) — comprehensive security testing methodology
- [npm audit](https://docs.npmjs.com/cli/v9/commands/npm-audit) — dependency vulnerability scanning
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/) — CSP policy validator
- [Security Headers — observatory.mozilla.org](https://observatory.mozilla.org/) — security header scanner