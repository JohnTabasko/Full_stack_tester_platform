# Testowanie zgodności i wymagań regulacyjnych

> **Perspektywa Full Stack Testera**
> System może działać funkcjonalnie i być bezpieczny, a jednocześnie naruszać wymagania prawne: RODO, WCAG, PCI DSS, czy regulacje branżowe. Te naruszenia to nie tylko ryzyko kar finansowych, ale również utraty zaufania klientów i reputacji. Testowanie compliance z Playwright nie zastąpi audytu prawnego, ale może wykrywać regresje w wymaganiach technicznych: HTTPS enforcement, cookie consent, privacy policy, audit trails. Ta lekcja uczy, jak projektować testy compliance, które dają audytowalny dowód zgodności, jednocześnie rozumiejąc granice automatyzacji.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Rozumieć zakres automatyzacji compliance** — co Playwright może testować vs. wymaga eksperta/audytora
- **Testować wymogi RODO/GDPR** — prawo do usunięcia, prawo do dostępu, zgoda cookies
- **Weryfikować HTTPS enforcement** — przekierowania, certificate validity, HSTS
- **Sprawdzać WCAG accessibility compliance** — kontrast, focus order, alt texts, keyboard navigation
- **Testować audit trails** — logging actions, data access, consent changes
- **Weryfikować cookie consent** — display, acceptance, rejection, preference changes
- **Prowadzić dokumentację compliance** — audytowalny dowód zgodności

---

## Wprowadzenie: compliance jako warstwa jakości

Testowanie compliance różni się od testowania funkcjonalnego:

| Aspekt | Testy funkcjonalne | Testy compliance |
|--------|-------------------|------------------|
| **Cel** | Czy feature działa | Czy system jest zgodny z wymaganiami prawnymi |
| **Podejście** | Happy path + edge cases | Regulatory requirements mapping |
| **Wynik** | Pass/fail | Evidence for audit |
| **Odpowiedzialność** | QA | Legal/Compliance + QA |
| **Częstotliwość** | Every sprint | Every release (audit-ready) |

### Key regulations for web apps

| Regulation | Domain | What it means |
|------------|--------|---------------|
| **RODO/GDPR** | Privacy | User data rights, consent, erasure |
| **WCAG 2.1** | Accessibility | Screen reader support, keyboard nav, contrast |
| **PCI DSS** | Payments | Secure card data handling |
| **ePrivacy** | Cookies | Cookie consent, tracking permissions |
| **SOC 2** | Security + Privacy | Audit trails, access logging, data protection |

---

## Sekcja 1: RODO/GDPR compliance testing

### Right to access — data export

```typescript
// tests/compliance/gdpr-access.spec.ts
import { test, expect, request } from '@playwright/test';

test.describe('RODO — Prawo dostępu do danych', () => {
  let userToken: string;
  let userId: string;
  
  test.beforeAll(async ({ request }) => {
    // Create test user with known data
    const registerResp = await request.post('/api/auth/register', {
      data: {
        email: 'gdpr-test@example.com',
        password: 'TestPassword123!',
        name: 'Jan Kowalski',
        phone: '+48123456789',
        address: 'ul. Testowa 1, 00-001 Warszawa',
      },
    });
    
    const user = await registerResp.json();
    userId = user.id;
    
    // Login to get token
    const loginResp = await request.post('/api/auth/login', {
      data: { email: 'gdpr-test@example.com', password: 'TestPassword123!' },
    });
    userToken = (await loginResp.json()).token;
  });
  
  test.afterAll(async ({ request }) => {
    // Cleanup — delete user (GDPR erasure)
    await request.delete(`/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
  });
  
  test('user can export all personal data', async ({ page }) => {
    await page.goto('/privacy');
    
    // Navigate to data export section
    await page.getByRole('link', { name: 'Pobierz moje dane' }).click();
    
    // Request data export
    await page.getByRole('button', { name: 'Wyślij żądanie eksportu' }).click();
    
    // Verify confirmation
    await expect(page.getByRole('status')).toContainText('Żądanie przyjęte');
    
    // Check email (in real test, would check actual email)
    const statusMessage = await page.getByRole('status').textContent();
    expect(statusMessage).toMatch(/przyjęte|procesowanie|e-mail/);
  });
  
  test('GDPR data export via API', async ({ request }) => {
    // API endpoint for data export
    const response = await request.get('/api/gdpr/export', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    
    expect(response.status()).toBe(200);
    
    const exportData = await response.json();
    
    // Verify export contains all required data categories
    expect(exportData).toHaveProperty('personalInfo');
    expect(exportData).toHaveProperty('orderHistory');
    expect(exportData).toHaveProperty('paymentHistory');
    expect(exportData).toHaveProperty('consentHistory');
    expect(exportData).toHaveProperty('accessLogs');
    
    // Verify personal data is correct
    expect(exportData.personalInfo.email).toBe('gdpr-test@example.com');
    expect(exportData.personalInfo.name).toBe('Jan Kowalski');
  });
  
  test('export includes consent history', async ({ request }) => {
    const response = await request.get('/api/gdpr/consent-history', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    
    const consentHistory = await response.json();
    
    // Should have record of all consent actions
    expect(Array.isArray(consentHistory)).toBe(true);
    
    // Each consent should have timestamp and type
    for (const consent of consentHistory) {
      expect(consent).toHaveProperty('timestamp');
      expect(consent).toHaveProperty('type');
      expect(consent).toHaveProperty('action');  // 'given', 'withdrawn', 'updated'
    }
  });
});
```

### Right to erasure — account deletion

```typescript
// tests/compliance/gdpr-erasure.spec.ts
test.describe('RODO — Prawo do usunięcia danych', () => {
  let userToken: string;
  let userId: string;
  
  test.beforeAll(async ({ request }) => {
    // Setup
    const registerResp = await request.post('/api/auth/register', {
      data: { email: 'erasure-test@example.com', password: 'TestPassword123!' },
    });
    const user = await registerResp.json();
    userId = user.id;
    
    const loginResp = await request.post('/api/auth/login', {
      data: { email: 'erasure-test@example.com', password: 'TestPassword123!' },
    });
    userToken = (await loginResp.json()).token;
  });
  
  test('user can request account deletion', async ({ page }) => {
    await page.goto('/settings');
    
    // Navigate to deletion section
    await page.getByRole('link', { name: 'Usuń konto' }).click();
    
    // Confirm deletion
    await expect(page.getByRole('heading', { name: 'Usuń konto' })).toBeVisible();
    
    await page.getByRole('button', { name: 'Potwierdzam usunięcie' }).click();
    
    // Verify confirmation message
    const status = page.getByRole('status');
    await expect(status).toContainText('przyjęte');
  });
  
  test('audit trail records erasure request', async ({ request }) => {
    const response = await request.get('/api/audit/deletion-requests', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    
    const auditTrail = await response.json();
    
    // Find the deletion request in audit trail
    const deletionRequest = auditTrail.find(
      (entry: any) => entry.userId === userId && entry.action === 'DATA_ERASURE_REQUESTED'
    );
    
    expect(deletionRequest, 'Deletion request should be in audit trail').toBeDefined();
    expect(deletionRequest.timestamp).toBeDefined();
    expect(deletionRequest.initiatedBy).toBe('user');
  });
  
  test('deleted user cannot login', async ({ page }) => {
    // Try to login with deleted account
    await page.goto('/login');
    await page.getByLabel('Email').fill('erasure-test@example.com');
    await page.getByLabel('Hasło').fill('TestPassword123!');
    await page.getByRole('button', { name: 'Zaloguj' }).click();
    
    // Should show error — account deleted
    await expect(page.getByText(/nie istnieje|usunięte|nieaktywne/i)).toBeVisible();
  });
  
  test('user data is anonymized or deleted', async ({ request }) => {
    // Direct DB check (requires DB access in real test)
    // This is example — actual implementation depends on your architecture
    
    const response = await request.get(`/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
    });
    
    // Deleted user should return 404 or anonymized data
    expect([404, 200]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      
      // If data exists, it should be anonymized
      expect(data.email).not.toBe('erasure-test@example.com');
      expect(data.name).not.toBe('Test User');
    }
  });
});
```

---

## Sekcja 2: Cookie consent testing

### Cookie banner and preferences

```typescript
// tests/compliance/cookie-consent.spec.ts
import { test, expect, request } from '@playwright/test';

test.describe('ePrivacy — Cookie Consent', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear all cookies to see consent banner
    await context.clearCookies();
  });
  
  test('cookie consent banner is displayed', async ({ page }) => {
    await page.goto('/');
    
    // Consent banner should appear
    const banner = page.locator('.cookie-banner, #cookie-consent, .cookie-notice');
    
    // Banner is visible on first visit
    await expect(banner).toBeVisible({ timeout: 5000 });
    
    // Banner contains required information
    await expect(banner).toContainText(/plików cookie|cookies/i);
    await expect(banner).toContainText(/zgoda|accept|akceptuj/i);
    await expect(banner).toContainText(/polityka|prywatność|privacy/i);
  });
  
  test('user can accept all cookies', async ({ page }) => {
    await page.goto('/');
    
    // Accept all cookies
    const acceptButton = page.locator('.cookie-accept-all, #accept-all-cookies');
    await acceptButton.click();
    
    // Banner should disappear
    const banner = page.locator('.cookie-banner');
    await expect(banner).not.toBeVisible({ timeout: 2000 });
    
    // Consent cookie should be set
    const cookies = await page.context().cookies();
    const consentCookie = cookies.find(c => c.name.includes('consent'));
    
    expect(consentCookie).toBeDefined();
    expect(consentCookie?.value).toMatch(/accepted|granted/);
  });
  
  test('user can customize cookie preferences', async ({ page }) => {
    await page.goto('/');
    
    // Open preferences
    const customizeButton = page.locator('.cookie-customize, #manage-preferences');
    await customizeButton.click();
    
    // Preferences modal should open
    const modal = page.locator('.cookie-preferences-modal, #cookie-preferences');
    await expect(modal).toBeVisible();
    
    // Toggle analytics cookies off
    await page.locator('#analytics-cookies').click();
    
    // Save preferences
    await page.getByRole('button', { name: 'Zapisz preferencje' }).click();
    
    // Verify preferences saved
    const cookies = await page.context().cookies();
    const consentCookie = cookies.find(c => c.name.includes('consent'));
    
    expect(consentCookie).toBeDefined();
    expect(consentCookie?.value).toContain('analytics=false');
  });
  
  test('user can reject non-essential cookies', async ({ page }) => {
    await page.goto('/');
    
    // Click reject button
    const rejectButton = page.locator('.cookie-reject, #reject-all-cookies');
    await rejectButton.click();
    
    // Only essential cookies should remain
    const cookies = await page.context().cookies();
    
    // Check no tracking cookies set
    const trackingCookies = cookies.filter(c => 
      c.name.includes('analytics') || 
      c.name.includes('tracking') ||
      c.name.includes('_ga') ||
      c.name.includes('_gid')
    );
    
    expect(trackingCookies.length, 'No tracking cookies should be set after rejection').toBe(0);
    
    // Essential cookies may still exist
    const essentialCookies = cookies.filter(c => c.name.includes('consent') || c.name.includes('session'));
    expect(essentialCookies.length).toBeGreaterThan(0);
  });
  
  test('user can change cookie preferences', async ({ page }) => {
    // First, accept cookies
    await page.goto('/');
    await page.locator('.cookie-accept-all').click();
    
    // Navigate to preferences
    await page.goto('/privacy');
    await page.getByLink('Zarządzaj plikami cookie').click();
    
    // Change preferences
    await page.locator('#marketing-cookies').click();  // Turn off marketing
    
    // Save
    await page.getByRole('button', { name: 'Zapisz preferencje' }).click();
    
    // Verify update
    const cookies = await page.context().cookies();
    const consentCookie = cookies.find(c => c.name.includes('consent'));
    
    expect(consentCookie?.value).toContain('marketing=false');
  });
});
```

---

## Sekcja 3: HTTPS and security compliance

```typescript
// tests/compliance/https-compliance.spec.ts
import { test, expect, request } from '@playwright/test';

test.describe('Security Compliance — HTTPS', () => {
  test('HTTP redirects to HTTPS', async ({ page }) => {
    // Get base URL and convert to HTTP
    const baseUrl = page.url();
    const httpUrl = baseUrl.replace('https://', 'http://');
    
    const response = await page.request.get(httpUrl, {
      maxRedirects: 0,
      failOnStatusCode: false,
    });
    
    // Should redirect, not serve HTTP content
    const finalUrl = response.url();
    expect(finalUrl, 'HTTP should redirect to HTTPS').toStartWith('https://');
  });
  
  test('all resources loaded via HTTPS', async ({ page }) => {
    const failedResources: string[] = [];
    
    page.on('requestfailed', (request) => {
      const url = request.url();
      if (!url.startsWith('data:') && !url.startsWith('blob:')) {
        failedResources.push(`${request.failure()?.errorText}: ${url}`);
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // No resources should fail to load over mixed content
    if (failedResources.length > 0) {
      console.error('Failed resources:', failedResources);
    }
    
    expect(failedResources, `Mixed content issues: ${failedResources.join(', ')}`).toHaveLength(0);
  });
  
  test('security headers present', async ({ page, request }) => {
    const response = await request.get('/');
    const headers = response.headers();
    
    const requiredHeaders = {
      'strict-transport-security': /max-age/i,
      'x-content-type-options': 'nosniff',
      'x-frame-options': /^(deny|sameorigin)$/i,
      'referrer-policy': /.+/,
    };
    
    const missingHeaders: string[] = [];
    
    for (const [header, expected] of Object.entries(requiredHeaders)) {
      const value = headers[header.toLowerCase()];
      
      if (!value) {
        missingHeaders.push(header);
        continue;
      }
      
      if (typeof expected === 'string' && value !== expected) {
        missingHeaders.push(`${header}: expected "${expected}", got "${value}"`);
      } else if (expected instanceof RegExp && !expected.test(value)) {
        missingHeaders.push(`${header}: invalid value "${value}"`);
      }
    }
    
    expect(missingHeaders, `Missing or invalid security headers: ${missingHeaders.join(', ')}`).toHaveLength(0);
  });
});
```

---

## Sekcja 4: WCAG accessibility compliance

### Basic accessibility checks

```typescript
// tests/compliance/wcag-accessibility.spec.ts
import { test, expect } from '@playwright/test';

test.describe('WCAG 2.1 Compliance — Accessibility', () => {
  test('images have alt text', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const imageCount = await images.count();
    
    const missingAlt: string[] = [];
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const src = await img.getAttribute('src');
      
      // Images with empty alt are decorative (OK)
      // Images without alt attribute are problematic
      if (alt === null && !src?.includes('data:')) {
        missingAlt.push(`img at position ${i}: no alt attribute`);
      }
    }
    
    expect(missingAlt, `Images missing alt: ${missingAlt.join(', ')}`).toHaveLength(0);
  });
  
  test('form inputs have labels', async ({ page }) => {
    await page.goto('/login');
    
    const inputs = page.locator('input:not([type="hidden"]):not([type="submit"])');
    const inputCount = await inputs.count();
    
    const missingLabel: string[] = [];
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      
      // Check for associated label
      const hasLabel = id 
        ? await page.locator(`label[for="${id}"]`).count() > 0
        : await input.locator('xpath=ancestor::label').count() > 0;
      
      // Check for aria-label or aria-labelledby
      const hasAriaLabel = await input.getAttribute('aria-label') !== null;
      const hasAriaLabelledBy = await input.getAttribute('aria-labelledby') !== null;
      
      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
        const type = await input.getAttribute('type');
        missingLabel.push(`input type="${type}" at position ${i}: no label`);
      }
    }
    
    expect(missingLabel, `Inputs missing labels: ${missingLabel.join(', ')}`).toHaveLength(0);
  });
  
  test('color contrast meets WCAG AA', async ({ page }) => {
    await page.goto('/');
    
    // Get all text elements and check contrast
    const contrastIssues = await page.evaluate(() => {
      const issues: { selector: string; contrast: number; required: number }[] = [];
      
      const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button, label');
      
      for (const el of elements) {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const backgroundColor = style.backgroundColor;
        
        if (color === 'rgba(0, 0, 0, 0)' || backgroundColor === 'rgba(0, 0, 0, 0)') {
          // Transparent — skip
          continue;
        }
        
        // Simple contrast check (in real test, use a library like axe-core)
        // For demo: just check if colors are set
        if (!color || color === 'transparent') {
          issues.push({
            selector: getSelector(el),
            contrast: 0,
            required: 4.5,
          });
        }
      }
      
      return issues.slice(0, 10);  // Report first 10 issues
    });
    
    if (contrastIssues.length > 0) {
      console.log('Potential contrast issues:', contrastIssues);
    }
    
    // In real test, use: await page.evaluate(() => {
    //   const issues = await new axe.AxeBuilder({ page }).analyze();
    //   // analyze accessibility
    // });
  });
  
  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Start from top of page
    await page.keyboard.press('Tab');
    
    const focusableElements: string[] = [];
    let tabCount = 0;
    
    // Tab through page — collect focused elements
    while (tabCount < 20) {  // Limit to prevent infinite loop
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? el.tagName + (el.className ? '.' + el.className.split(' ')[0] : '') : null;
      });
      
      if (focused) {
        focusableElements.push(focused);
      } else {
        break;
      }
      
      await page.keyboard.press('Tab');
      tabCount++;
    }
    
    // Verify focus order is logical (starts with navigation)
    console.log('Focus order:', focusableElements);
    
    // First focusable element should be in navigation or skip link
    const firstFocusable = focusableElements[0];
    expect(firstFocusable, 'First focusable should be in nav or skip link').toMatch(/nav|skip|header/i);
    
    // Navigation elements should be focusable
    const hasNavFocus = focusableElements.some(e => e.toLowerCase().includes('nav') || e.includes('menu'));
    expect(hasNavFocus, 'Navigation should be keyboard accessible').toBe(true);
  });
  
  test('page has skip navigation link', async ({ page }) => {
    await page.goto('/');
    
    // Check for skip link (WCAG requirement)
    const skipLink = page.locator('a[href="#main"], a[href="#content"], .skip-link, [class*="skip"]');
    
    // Skip link is optional but recommended
    const skipLinkExists = await skipLink.count() > 0;
    
    if (skipLinkExists) {
      // If skip link exists, it should be focusable
      await page.keyboard.press('Tab');
      const firstFocusable = await page.evaluate(() => document.activeElement?.textContent);
      
      expect(firstFocusable, 'First focus should be skip link or navigation').toBeTruthy();
    }
    
    // This is a warning, not hard failure
    console.log(`Skip link present: ${skipLinkExists}`);
  });
});
```

### Advanced accessibility testing with axe

```typescript
// tests/compliance/axe-accessibility.spec.ts
import { test, expect } from '@playwright/test';

// Requires: npm install @axe-core/playwright
test.describe('WCAG Accessibility with axe-core', () => {
  test('no critical accessibility violations on homepage', async ({ page }) => {
    const violations: any[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Inject axe-core
    await page.evaluate(() => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.0/axe.min.js';
      document.head.appendChild(script);
    });
    
    // Wait for axe to load
    await page.waitForTimeout(1000);
    
    // Run accessibility scan
    const results = await page.evaluate(async () => {
      // @ts-ignore
      return await window.axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'best-practice'],
        },
      });
    });
    
    if (results.violations && results.violations.length > 0) {
      console.log('Accessibility violations found:', results.violations.length);
      
      for (const violation of results.violations) {
        console.log(`\n${violation.id}: ${violation.description}`);
        console.log(`Impact: ${violation.impact}`);
        console.log(`Affected: ${violation.nodes.length} elements`);
        
        if (violation.impact === 'critical' || violation.impact === 'serious') {
          violations.push(violation);
        }
      }
    }
    
    // Fail only on critical/serious violations
    expect(
      violations.length,
      `Critical accessibility violations: ${violations.map(v => v.id).join(', ')}`
    ).toBe(0);
  });
});
```

---

## Sekcja 5: Audit trail testing

```typescript
// tests/compliance/audit-trail.spec.ts
import { test, expect, request } from '@playwright/test';

test.describe('Audit Trail — Compliance Logging', () => {
  test('login attempts are logged', async ({ page, request }) => {
    // Login with wrong password
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Hasło').fill('wrongpassword');
    await page.getByRole('button', { name: 'Zaloguj' }).click();
    
    // Wait for response
    await page.waitForTimeout(500);
    
    // Check audit log
    const auditResponse = await request.get('/api/audit/auth-events', {
      headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
    });
    
    const auditEvents = await auditResponse.json();
    
    // Find failed login event
    const failedLogin = auditEvents.find(
      (e: any) => 
        e.action === 'LOGIN_FAILED' && 
        e.email === 'test@example.com' &&
        new Date(e.timestamp).getTime() > Date.now() - 60000  // Last minute
    );
    
    expect(failedLogin, 'Failed login should be in audit trail').toBeDefined();
    expect(failedLogin.ip).toBeDefined();
    expect(failedLogin.userAgent).toBeDefined();
  });
  
  test('data access is logged', async ({ request }) => {
    // Create user and get token
    const userToken = await getTestUserToken(request, 'audit-test@example.com');
    
    // Access own data
    await request.get('/api/profile', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    
    // Check audit log for data access
    const auditResponse = await request.get('/api/audit/data-access', {
      headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
    });
    
    const accessLog = await auditResponse.json();
    
    const dataAccessEvent = accessLog.find(
      (e: any) => 
        e.action === 'DATA_ACCESS' &&
        e.resource === 'user_profile' &&
        e.userId // Should log WHO accessed
    );
    
    expect(dataAccessEvent).toBeDefined();
    expect(dataAccessEvent.timestamp).toBeDefined();
  });
  
  test('consent changes are logged', async ({ page, request }) => {
    // Get user token
    const userToken = await getTestUserToken(request, 'consent-test@example.com');
    
    // Change consent via API
    await request.post('/api/consent/update', {
      headers: { Authorization: `Bearer ${userToken}` },
      data: { analytics: false, marketing: false },
    });
    
    // Check consent history
    const consentResponse = await request.get('/api/consent/history', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    
    const consentHistory = await consentResponse.json();
    
    const consentChange = consentHistory.find(
      (h: any) => h.action === 'CONSENT_UPDATED' && h.timestamp
    );
    
    expect(consentChange).toBeDefined();
    expect(consentChange.analytics).toBe(false);
    expect(consentChange.marketing).toBe(false);
    expect(consentChange.timestamp).toBeDefined();
  });
});
```

---

## Sekcja 6: PCI DSS compliance (basic)

```typescript
// tests/compliance/pci-dss.spec.ts
import { test, expect, request } from '@playwright/test';

test.describe('PCI DSS — Payment Card Data Protection', () => {
  test('no card data in URL parameters', async ({ page }) => {
    await page.goto('/checkout');
    
    // Fill payment form
    await page.getByLabel('Numer karty').fill('4111111111111111');
    await page.getByLabel('MM/RR').fill('12/26');
    await page.getByLabel('CVV').fill('123');
    
    // Submit
    await page.getByRole('button', { name: 'Zapłać' }).click();
    
    // Wait for redirect
    await page.waitForTimeout(2000);
    
    // Check URL doesn't contain card data
    const currentUrl = page.url();
    const urlParams = new URL(currentUrl).searchParams;
    
    for (const [key, value] of urlParams.entries()) {
      expect(key.toLowerCase()).not.toMatch(/card|cvv|cvc|pan|exp/);
      expect(value.toLowerCase()).not.toMatch(/\d{13,19}/);  // Card number pattern
    }
  });
  
  test('card data sent to payment processor only', async ({ page }) => {
    // Capture all requests
    const paymentRequests: string[] = [];
    
    page.on('request', (request) => {
      const url = request.url();
      const postData = request.postData();
      
      // Check if sensitive data sent to wrong endpoint
      if (postData) {
        const hasCardData = /\d{13,19}/.test(postData);
        
        if (hasCardData) {
          paymentRequests.push(url);
          
          // Card data should only go to payment processor
          const allowedDomains = ['stripe.com', 'braintree', 'paypal.com'];
          const isAllowed = allowedDomains.some(d => url.includes(d));
          
          expect(
            isAllowed,
            `Card data sent to non-payment endpoint: ${url}`
          ).toBe(true);
        }
      }
    });
    
    await page.goto('/checkout');
    await page.getByLabel('Numer karty').fill('4111111111111111');
    await page.getByLabel('CVV').fill('123');
    await page.getByRole('button', { name: 'Zapłać' }).click();
    
    await page.waitForTimeout(2000);
    
    // At least one payment request should have been made
    expect(paymentRequests.length).toBeGreaterThan(0);
  });
  
  test('HTTPS enforced for payment pages', async ({ page }) => {
    await page.goto('/checkout');
    
    // Verify HTTPS
    expect(page.url()).toStartWith('https://');
    
    // Verify no mixed content
    const mixedContent = await page.evaluate(() => {
      const resources = document.querySelectorAll('script[src], link[href], img[src]');
      return Array.from(resources)
        .filter(r => {
          const src = (r as any).src || (r as any).href;
          return src && !src.startsWith('https://') && !src.startsWith('//') && !src.startsWith('data:');
        })
        .map(r => (r as any).src || (r as any).href);
    });
    
    expect(mixedContent, `Mixed content found: ${mixedContent.join(', ')}`).toHaveLength(0);
  });
});
```

---

## Sekcja 7: Compliance reporting

```typescript
// tests/compliance/compliance-report.ts
import { test, expect, request } from '@playwright/test';

test.describe('Compliance Report Generation', () => {
  test('generate compliance report for audit', async ({ page, request }) => {
    const report: any = {
      generatedAt: new Date().toISOString(),
      zakres: 'Full Compliance Audit',
      version: '1.0',
      results: {},
    };
    
    // GDPR Tests
    const gdprResponse = await request.get('/api/compliance/gdpr-status', {
      headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
    });
    report.results.gdpr = await gdprResponse.json();
    
    // Security Tests
    const securityHeaders = await page.evaluate(async () => {
      const response = await fetch('/');
      const headers = response.headers;
      return {
        hsts: headers.get('strict-transport-security'),
        csp: headers.get('content-security-policy'),
        xFrameOptions: headers.get('x-frame-options'),
      };
    });
    report.results.security = securityHeaders;
    
    // Cookie Consent
    const cookieResponse = await request.get('/api/compliance/cookie-status');
    report.results.cookies = await cookieResponse.json();
    
    // Accessibility
    const accessibilityResponse = await request.get('/api/compliance/accessibility-status');
    report.results.accessibility = await accessibilityResponse.json();
    
    // Generate report
    console.log('\n=== COMPLIANCE REPORT ===');
    console.log(JSON.stringify(report, null, 2));
    console.log('========================\n');
    
    // Verify critical compliance requirements
    expect(report.results.gdpr.dataErasureEnabled).toBe(true);
    expect(report.results.gdpr.consentManagementEnabled).toBe(true);
    expect(report.results.security.hsts).toBeTruthy();
    expect(report.results.cookies.consentBannerDisplayed).toBe(true);
    
    // Save report
    const fs = await import('fs/promises');
    await fs.writeFile(
      `./test-results/compliance-report-${Date.now()}.json`,
      JSON.stringify(report, null, 2)
    );
  });
});
```

---

## Perspektywa Full Stack Testera

Testowanie compliance z Playwright to most między technical implementation a regulatory requirements. Jako Full Stack Tester:

**Rozumiesz zakres**: automated tests sprawdzają technical implementation compliance, not legal interpretation. Legal audit still required.

**Dokumentujesz dowód**: compliance report musi być audytowalny. Co sprawdzono? Kiedy? Z jakim wynikiem? To evidence for regulators.

**Mapujesz requirements na tests**: każdy regulatory requirement → automated test. Nie ma requirement bez test coverage.

**Automatyzujesz regression detection**: compliance requirements change. Automated tests detect when implementation regresses.

**Współpracujesz z prawnikami**: test coverage to technical view, legal view may differ. Collaboration is key.

---

## Podsumowanie

- **GDPR access**: user data export via API, verify all data categories present.
- **GDPR erasure**: account deletion, verify audit trail, verify data anonymized/deleted.
- **Cookie consent**: banner display, accept/reject/customize, preference changes, no tracking without consent.
- **HTTPS enforcement**: HTTP redirects to HTTPS, no mixed content, security headers present.
- **WCAG accessibility**: alt texts, form labels, keyboard navigation, focus order, contrast.
- **Audit trails**: login attempts, data access, consent changes — all logged with timestamps.
- **PCI DSS**: no card data in URLs, card data only to payment processor, HTTPS enforced.
- **Compliance reporting**: generate audit-ready evidence document with all test results.

---

## Linki i źródła

- [RODO/GDPR — UODO](https://uodo.gov.pl/) — Polish data protection authority
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) — official WCAG reference
- [axe-core — Accessibility Testing](https://www.deque.com/axe/) — accessibility testing library
- [PCI DSS Requirements](https://www.pcisecuritystandards.org/) — payment card industry standards
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/) — security header implementation guide
- [GDPR Testing Checklist — GDPR.eu](https://gdpr.eu/what-is-gdpr/) — practical GDPR compliance checklist