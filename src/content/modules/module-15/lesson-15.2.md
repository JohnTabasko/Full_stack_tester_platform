# Testowanie panelu aplikacji SaaS

> **Perspektywa Full Stack Testera**
> Aplikacja SaaS to system z wieloma użytkownikami, rolami, organizacjami (tenantami) i uprawnieniami. Testowanie panelu SaaS wymaga myślenia o izolacji, RBAC, multi-tenancy i audycie — problemów, których nie ma w prostych aplikacjach e-commerce. Panel, który "działa" dla jednego użytkownika, może wyciekać dane innych tenantów. Ta lekcja uczy, jak zaprojektować testy panelu SaaS, które weryfikują izolację, uprawnienia i krytyczne przepływy biznesowe.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Testować multi-tenant isolation** — verify tenant A cannot access tenant B data
- **Weryfikować RBAC** — role-based access control matrix testing
- **Testować billing i subscriptions** — trial, plan limits, upgrades, cancellations
- **Testować audit trails** — operations logging, compliance evidence
- **Testować dashboardy i real-time** — data visualization, live updates
- **Testować webhooks i integrations** — external system communication

---

## Wprowadzenie: SaaS testing challenges

### Czym SaaS różni się od e-commerce

| Aspekt | E-commerce | SaaS |
|--------|-----------|------|
| **User model** | Guest + Customer | Member + Admin + Owner |
| **Data isolation** | Shared products | Tenant-separated data |
| **Roles** | Simple (customer/admin) | Complex RBAC |
| **Billing** | Per-transaction | Subscription plans |
| **Multi-tenancy** | N/A | Core concept |
| **Integrations** | Payment providers | Many external services |

### Key risks in SaaS

1. **Data leakage between tenants** — user A sees user B's data
2. **Privilege escalation** — regular user gains admin access
3. **RBAC bypass** — role check fails, unauthorized action allowed
4. **Billing errors** — overcharging, incorrect limits, failed upgrades
5. **Audit gap** — operations not logged, compliance failure

---

## Sekcja 1: Multi-tenant isolation testing

### Architecture for multi-tenant tests

```typescript
// tests/saas/tenant-isolation.spec.ts
import { test, expect, request } from '@playwright/test';
import { CustomerBuilder } from '../builders/customer.builder';

test.describe('Multi-Tenant Data Isolation', () => {
  let tenantA: { id: string; token: string; user: any };
  let tenantB: { id: string; token: string; user: any };
  
  test.beforeAll(async ({ request }) => {
    // Create two completely separate tenants
    tenantA = await createTenant(request, 'Tenant A Company');
    tenantB = await createTenant(request, 'Tenant B Company');
  });
  
  test.afterAll(async ({ request }) => {
    // Cleanup
    await deleteTenant(request, tenantA.id);
    await deleteTenant(request, tenantB.id);
  });
  
  test('user A cannot see tenant B projects', async ({ page }) => {
    // Login as tenant A user
    await page.goto('/login');
    await page.getByLabel('Email').fill(tenantA.user.email);
    await page.getByLabel('Hasło').fill(tenantA.user.password);
    await page.getByRole('button', { name: 'Zaloguj' }).click();
    
    // Navigate to projects
    await page.goto('/projects');
    
    // Should see only tenant A projects
    const projectCount = await page.locator('.project-card').count();
    expect(projectCount).toBeGreaterThan(0);  // Tenant A has projects
    
    // Search for tenant B's project name
    const tenantBProjectName = await getTenantBProjectName(tenantB.id);
    await page.getByPlaceholder('Szukaj...').fill(tenantBProjectName);
    
    // Should find nothing
    await expect(page.getByText(tenantBProjectName)).not.toBeVisible();
  });
  
  test('user A cannot access tenant B project by direct URL', async ({ page }) => {
    // Get tenant B project ID
    const tenantBProject = await getTenantBProject(tenantB.id);
    
    // Login as tenant A
    await page.goto('/login');
    await loginAs(tenantA.user);
    
    // Try to access tenant B project directly
    await page.goto(`/projects/${tenantBProject.id}`);
    
    // Should show error or redirect
    await expect(page.getByText(/brak dostępu|nie znaleziono|403/i)).toBeVisible({ timeout: 3000 });
  });
  
  test('user A cannot see tenant B users in team', async ({ page }) => {
    // Login as tenant A admin
    await loginAsAdmin(tenantA);
    
    await page.goto('/settings/team');
    
    // Should see only tenant A users
    const users = await page.locator('.team-member').allTextContents();
    
    for (const user of users) {
      expect(user).not.toContain(tenantB.user.email);
    }
    
    // Search for tenant B user
    await page.getByPlaceholder('Szukaj...').fill(tenantB.user.email);
    
    await expect(page.getByText(tenantB.user.email)).not.toBeVisible();
  });
  
  test('API: tenant A cannot query tenant B data via API', async ({ request }) => {
    // Try to get tenant B data using tenant A's token
    const response = await request.get(`/api/tenants/${tenantB.id}`, {
      headers: { Authorization: `Bearer ${tenantA.token}` },
    });
    
    // Should be forbidden
    expect([403, 404]).toContain(response.status());
  });
  
  test('API: cross-tenant data modification is blocked', async ({ request }) => {
    // Try to update tenant B project using tenant A token
    const response = await request.patch(`/api/projects/${tenantB.projectId}`, {
      headers: { Authorization: `Bearer ${tenantA.token}` },
      data: { name: 'Hacked Project Name' },
    });
    
    expect(response.status()).toBe(403);
    
    // Verify tenant B project unchanged
    const tenantBProject = await getTenantBProject(tenantB.id);
    expect(tenantBProject.name).not.toBe('Hacked Project Name');
  });
});

// Helper functions
async function createTenant(request: APIRequestContext, name: string) {
  // Create tenant
  const tenantResp = await request.post('/api/tenants', {
    data: { name },
  });
  const tenant = await tenantResp.json();
  
  // Create admin user
  const user = new CustomerBuilder();
  const userResp = await request.post(`/api/tenants/${tenant.id}/users`, {
    data: {
      ...user.build(),
      role: 'admin',
    },
  });
  const createdUser = await userResp.json();
  
  // Get token
  const loginResp = await request.post('/api/auth/login', {
    data: { email: createdUser.email, password: 'TestPassword123!' },
  });
  const { token } = await loginResp.json();
  
  // Create sample project
  const projectResp = await request.post('/api/projects', {
    headers: { Authorization: `Bearer ${token}` },
    data: { name: `${name} Project`, tenantId: tenant.id },
  });
  const project = await projectResp.json();
  
  return {
    id: tenant.id,
    token,
    user: createdUser,
    projectId: project.id,
  };
}
```

### Data isolation in API tests

```typescript
// tests/api/tenant-isolation.spec.ts
test.describe('API Tenant Isolation', () => {
  test('users can only access their own tenant data', async ({ request }) => {
    const tenant1 = await createTenant(request, 'Acme Corp');
    const tenant2 = await createTenant(request, 'Globex Inc');
    
    // Create projects for both tenants
    const project1 = await api.projects.create(tenant1.token, { name: 'Acme Project' });
    const project2 = await api.projects.create(tenant2.token, { name: 'Globex Project' });
    
    // Tenant 1 tries to list all projects (should only see their own)
    const tenant1Projects = await api.projects.list(tenant1.token);
    
    expect(tenant1Projects).toHaveLength(1);
    expect(tenant1Projects[0].name).toBe('Acme Project');
    expect(tenant1Projects[0].id).toBe(project1.id);
    
    // Tenant 1 cannot see tenant 2 project
    const tenant1ProjectIds = tenant1Projects.map(p => p.id);
    expect(tenant1ProjectIds).not.toContain(project2.id);
    
    // Direct access to tenant 2 project is blocked
    const accessDenied = await api.projects.get(tenant1.token, project2.id);
    expect(accessDenied.status()).toBe(403);
  });
  
  test('admin from tenant A cannot manage tenant B users', async ({ request }) => {
    const adminA = await createAdminUser(request, 'Tenant A');
    const tenantB = await createTenant(request, 'Tenant B');
    
    // Admin A tries to invite user to tenant B
    const response = await request.post(`/api/tenants/${tenantB.id}/users`, {
      headers: { Authorization: `Bearer ${adminA.token}` },
      data: { email: 'newuser@example.com', role: 'member' },
    });
    
    expect(response.status()).toBe(403);
  });
});
```

---

## Sekcja 2: RBAC testing — role matrix

### Role-based access control matrix

```typescript
// tests/saas/rbac.spec.ts
import { test, expect, request } from '@playwright/test';

test.describe('RBAC — Role-Based Access Control', () => {
  // Role definitions
  const roles = ['owner', 'admin', 'member', 'viewer'];
  
  // Actions that should be tested
  const actions = [
    { name: 'view_dashboard', allowed: ['owner', 'admin', 'member', 'viewer'] },
    { name: 'create_project', allowed: ['owner', 'admin', 'member'] },
    { name: 'delete_project', allowed: ['owner', 'admin'] },
    { name: 'invite_user', allowed: ['owner', 'admin'] },
    { name: 'remove_user', allowed: ['owner'] },
    { name: 'manage_billing', allowed: ['owner'] },
    { name: 'view_audit_log', allowed: ['owner', 'admin'] },
    { name: 'export_data', allowed: ['owner', 'admin', 'member'] },
  ];
  
  test('role matrix is enforced — UI', async ({ page }) => {
    // Test each role's ability to access billing
    for (const role of roles) {
      const user = await createUserWithRole(role);
      
      await page.goto('/login');
      await loginAs(user);
      await page.goto('/settings/billing');
      
      const hasAccess = await page.getByRole('heading', { name: /billing|plan/i }).isVisible().catch(() => false);
      
      const shouldHaveAccess = ['owner', 'admin'].includes(role);
      expect(hasAccess).toBe(shouldHaveAccess ? true : false);
    }
  });
  
  test('role matrix is enforced — API', async ({ request }) => {
    for (const role of roles) {
      const user = await createUserWithRole(role);
      const token = user.token;
      
      // Test billing endpoint
      const billingResponse = await request.get('/api/billing', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const expectedStatus = ['owner'].includes(role) ? 200 : 403;
      expect(billingResponse.status()).toBe(expectedStatus);
    }
  });
  
  test('viewer cannot create resources', async ({ page }) => {
    const viewer = await createUserWithRole('viewer');
    
    await page.goto('/login');
    await loginAs(viewer);
    
    // Try to create project
    await page.goto('/projects/new');
    
    // Should show access denied or hide the page
    await expect(page.getByText(/brak dostępu|403|nieautoryzowany/i)).toBeVisible({ timeout: 3000 }).catch(() => {
      // Or button should be disabled
      const createButton = page.getByRole('button', { name: 'Utwórz' });
      expect(createButton).toBeDisabled();
    });
  });
  
  test('admin cannot remove owner', async ({ page }) => {
    const admin = await createUserWithRole('admin');
    const owner = await getTenantOwner();
    
    await page.goto('/login');
    await loginAs(admin);
    await page.goto('/settings/team');
    
    // Try to remove owner
    const ownerRow = page.locator('.team-member').filter({ hasText: owner.email });
    const removeButton = ownerRow.getByRole('button', { name: 'Usuń' });
    
    await expect(removeButton).toBeDisabled();
  });
  
  test('new role gets access to existing resources', async ({ page, request }) => {
    // Create project with existing team
    const project = await api.projects.create(getAdminToken(), { name: 'Shared Project' });
    
    // Add new member
    const newMember = await createUserWithRole('member');
    await api.tenants.addUser(getTenantId(), newMember.user.id, 'member');
    
    // New member should immediately see the project
    await page.goto('/login');
    await loginAs(newMember.user);
    await page.goto('/projects');
    
    await expect(page.getByText('Shared Project')).toBeVisible();
  });
});
```

### Permission testing helpers

```typescript
// src/utils/rbac-helpers.ts

interface PermissionTestCase {
  role: string;
  action: string;
  resourceId?: string;
  expectedStatus: number;
}

export async function testPermission(
  request: APIRequestContext,
  testCase: PermissionTestCase
): Promise<boolean> {
  const response = await makeAPIRequest(request, testCase);
  return response.status() === testCase.expectedStatus;
}

export function generateRBACMatrix(roles: string[], actions: Action[]): PermissionTestCase[] {
  const cases: PermissionTestCase[] = [];
  
  for (const role of roles) {
    for (const action of actions) {
      cases.push({
        role,
        action: action.name,
        expectedStatus: action.allowed.includes(role) ? 200 : 403,
      });
    }
  }
  
  return cases;
}

// Run matrix in test
test('RBAC matrix is consistent', async ({ request }) => {
  const matrix = generateRBACMatrix(roles, actions);
  
  for (const testCase of matrix) {
    const user = await getUserWithRole(testCase.role);
    const result = await testPermission(request, {
      ...testCase,
      token: user.token,
    });
    
    expect(result, `Role ${testCase.role} + action ${testCase.action}`).toBe(true);
  }
});
```

---

## Sekcja 3: Billing and subscription tests

### Subscription lifecycle tests

```typescript
// tests/saas/billing.spec.ts
import { test, expect, request } from '@playwright/test';

test.describe('Billing and Subscriptions', () => {
  test('trial user sees upgrade prompt', async ({ page }) => {
    const trialUser = await createTrialUser();
    
    await page.goto('/login');
    await loginAs(trialUser);
    await page.goto('/dashboard');
    
    // Should see trial banner or upgrade prompt
    const upgradePrompt = page.locator('.trial-banner, .upgrade-prompt');
    await expect(upgradePrompt).toBeVisible();
    
    // Should show days remaining
    await expect(upgradePrompt).toContainText(/dni|days/i);
  });
  
  test('trial user can upgrade to paid plan', async ({ page }) => {
    const trialUser = await createTrialUser();
    
    await page.goto('/login');
    await loginAs(trialUser);
    await page.goto('/settings/billing');
    
    // Select plan
    await page.getByRole('button', { name: 'Wybież plan Pro' }).click();
    
    // Fill payment
    await page.getByLabel('Numer karty').fill('4242424242424242');
    await page.getByLabel('MM/RR').fill('1230');
    await page.getByLabel('CVV').fill('123');
    
    await page.getByRole('button', { name: 'Zapisz i aktywuj' }).click();
    
    // Verify upgrade
    await expect(page.getByText(/plan.*aktywowany|subskrypcja.*aktywna/i)).toBeVisible();
  });
  
  test('paid user sees usage limits', async ({ page }) => {
    const paidUser = await createPaidUser();
    
    await page.goto('/login');
    await loginAs(paidUser);
    await page.goto('/settings/billing');
    
    // Should show current plan and limits
    await expect(page.getByText(/plan.*Pro|limity.*użycia/i)).toBeVisible();
    
    // Should show usage bar
    const usageBar = page.locator('.usage-bar, .quota-bar');
    await expect(usageBar).toBeVisible();
  });
  
  test('user cannot exceed plan limits', async ({ page }) => {
    const limitedUser = await createUserWithPlanLimits({ 
      projects: 2, 
      users: 3 
    });
    
    await page.goto('/login');
    await loginAs(limitedUser);
    
    // Try to create 4th user (over 3 user limit)
    await page.goto('/settings/team');
    await page.getByRole('button', { name: 'Zaproś użytkownika' }).click();
    await page.getByLabel('Email').fill('newuser@example.com');
    await page.getByRole('button', { name: 'Wyślij zaproszenie' }).click();
    
    // Should show limit exceeded error
    await expect(page.getByText(/limit.*przekroczony|maksimum.*użytkownik/i)).toBeVisible();
  });
  
  test('user can cancel subscription', async ({ page }) => {
    const paidUser = await createPaidUser();
    
    await page.goto('/login');
    await loginAs(paidUser);
    await page.goto('/settings/billing');
    
    // Navigate to cancellation
    await page.getByLink('Anuluj subskrypcję').click();
    
    // Confirm cancellation
    await page.getByRole('button', { name: 'Potwierdzam anulowanie' }).click();
    
    // Should show cancellation confirmation
    await expect(page.getByText(/anulowanie.*potwierdzone/i)).toBeVisible();
    
    // Access should continue until end of billing period
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });
  
  test('payment failure is handled gracefully', async ({ page }) => {
    const paidUser = await createPaidUser();
    
    await page.goto('/login');
    await loginAs(paidUser);
    await page.goto('/settings/billing');
    
    // Try to update with declined card
    await page.getByRole('button', { name: 'Zaktualizuj kartę' }).click();
    await page.getByLabel('Numer karty').fill('4000000000000002');  // Decline
    await page.getByLabel('MM/RR').fill('1230');
    await page.getByLabel('CVV').fill('123');
    await page.getByRole('button', { name: 'Zapisz' }).click();
    
    // Should show error message
    await expect(page.getByText(/odmówiono|karta.*odrzucona|błąd.*płatności/i)).toBeVisible();
  });
});
```

### Webhook testing

```typescript
// tests/saas/webhooks.spec.ts
import { test, expect, request } from '@playwright/test';
import { randomBytes } from 'crypto';

test.describe('Webhook Integrations', () => {
  test('webhook is triggered on project creation', async ({ page }) => {
    const user = await createAdminUser();
    
    // Create webhook endpoint to capture events
    const webhookId = await setupTestWebhook();
    
    await page.goto('/login');
    await loginAs(user);
    
    // Create project
    await page.goto('/projects/new');
    await page.getByLabel('Nazwa projektu').fill('Webhook Test Project');
    await page.getByRole('button', { name: 'Utwórz' }).click();
    
    // Wait for webhook to be called
    const webhookCall = await waitForWebhookCall(webhookId, 'project.created', 10000);
    
    expect(webhookCall.payload.projectId).toBeDefined();
    expect(webhookCall.payload.action).toBe('created');
  });
  
  test('webhook retry on failure', async ({ page, request }) => {
    // Setup webhook that returns 500 first, then 200
    const webhook = await api.webhooks.create({
      url: 'https://webhook.site/failing-first',
      events: ['project.created'],
      retryUntilSuccess: true,
    });
    
    const user = await createAdminUser();
    await page.goto('/login');
    await loginAs(user);
    
    // Create project — should trigger webhook
    await page.goto('/projects/new');
    await page.getByLabel('Nazwa projektu').fill('Retry Test');
    await page.getByRole('button', { name: 'Utwórz' }).click();
    
    // Verify webhook eventually succeeded
    const calls = await api.webhooks.getCalls(webhook.id);
    expect(calls.length).toBeGreaterThan(1);  // Retry happened
  });
  
  test('webhook signature is valid', async ({ request }) => {
    const webhook = await api.webhooks.create({
      url: 'https://webhook.site/verify-sig',
      events: ['project.created'],
    });
    
    // Create event
    const project = await api.projects.create(getAdminToken(), { name: 'Sig Test' });
    
    // Verify signature header is present and valid
    const calls = await api.webhooks.getCalls(webhook.id);
    const latestCall = calls[0];
    
    const signature = latestCall.headers['x-webhook-signature'];
    expect(signature).toBeDefined();
    
    // Verify signature matches payload
    const expectedSig = computeHMAC(latestCall.payload, webhook.secret);
    expect(signature).toBe(expectedSig);
  });
});
```

---

## Sekcja 4: Audit trail testing

```typescript
// tests/saas/audit-trail.spec.ts
import { test, expect, request } from '@playwright/test';

test.describe('Audit Trail', () => {
  test('user actions are logged', async ({ page }) => {
    const user = await createAdminUser();
    
    await page.goto('/login');
    await loginAs(user);
    
    // Perform several actions
    await page.goto('/projects/new');
    await page.getByLabel('Nazwa projektu').fill('Audit Test Project');
    await page.getByRole('button', { name: 'Utwórz' }).click();
    
    await page.goto('/settings/team');
    await page.getByRole('button', { name: 'Zaproś użytkownika' }).click();
    await page.getByLabel('Email').fill('audit-test@example.com');
    await page.getByRole('button', { name: 'Wyślij zaproszenie' }).click();
    
    // Check audit log
    await page.goto('/settings/audit-log');
    
    // Should see project creation
    await expect(page.getByText('Utworzono projekt: Audit Test Project')).toBeVisible();
    
    // Should see user invitation
    await expect(page.getByText(/zaproszono.*audit-test@example.com/i)).toBeVisible();
  });
  
  test('audit log shows who, what, when', async ({ page }) => {
    const user = await createAdminUser();
    
    await page.goto('/login');
    await loginAs(user);
    
    // Create project
    await page.goto('/projects/new');
    await page.getByLabel('Nazwa projektu').fill('Audit Details Test');
    await page.getByRole('button', { name: 'Utwórz' }).click();
    
    // Check audit entry
    await page.goto('/settings/audit-log');
    const firstEntry = page.locator('.audit-entry').first();
    
    // Verify entry has required fields
    await expect(firstEntry.getByText(user.email)).toBeVisible();  // Who
    await expect(firstEntry.getByText(/utworzono projekt/i)).toBeVisible();  // What
    await expect(firstEntry.locator('time')).toBeVisible();  // When
    await expect(firstEntry.getByText(/\d{2}:\d{2}/)).toBeVisible();  // Timestamp
  });
  
  test('audit log is searchable', async ({ page }) => {
    const user = await createAdminUser();
    
    await page.goto('/login');
    await loginAs(user);
    await page.goto('/settings/audit-log');
    
    // Search by user email
    await page.getByPlaceholder('Szukaj...').fill(user.email);
    await page.getByRole('button', { name: 'Szukaj' }).click();
    
    // Should show only entries from that user
    const entries = await page.locator('.audit-entry').all();
    for (const entry of entries) {
      const text = await entry.textContent();
      expect(text).toContain(user.email);
    }
  });
  
  test('admin can export audit log', async ({ page }) => {
    const admin = await createAdminUser();
    
    await page.goto('/login');
    await loginAs(admin);
    await page.goto('/settings/audit-log');
    
    // Export button should be visible
    const exportButton = page.getByRole('button', { name: 'Eksportuj' });
    await expect(exportButton).toBeVisible();
    
    // Click export
    await exportButton.click();
    
    // Should trigger download or show export options
    const exportModal = page.locator('.export-modal, [role="dialog"]');
    await expect(exportModal).toBeVisible();
  });
  
  test('audit log cannot be deleted by users', async ({ request }) => {
    const user = await createAdminUser();
    
    // Try to delete audit entry via API
    const response = await request.delete('/api/audit/entries/123', {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    
    expect(response.status()).toBe(403);
  });
});
```

---

## Sekcja 5: Dashboard and real-time testing

```typescript
// tests/saas/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard and Real-Time Updates', () => {
  test('dashboard loads with key metrics', async ({ page }) => {
    const user = await createUser();
    
    await page.goto('/login');
    await loginAs(user);
    await page.goto('/dashboard');
    
    // Should show key metrics
    await expect(page.getByText(/projekty|projects/i)).toBeVisible();
    await expect(page.getByText(/użytkownicy|users/i)).toBeVisible();
    await expect(page.getByText(/aktywność|activity/i)).toBeVisible();
  });
  
  test('dashboard updates in real-time', async ({ page }) => {
    const admin = await createAdminUser();
    
    await page.goto('/login');
    await loginAs(admin);
    await page.goto('/dashboard');
    
    // Get początkowy project count
    const initialCount = await page.locator('.metric-card:has-text("Projekty") .value').textContent();
    
    // Create project in another tab (simulating other user)
    const newProject = await api.projects.create(admin.token, { name: 'Real-time Test' });
    
    // Wait for dashboard to update (real-time or polling)
    await page.waitForTimeout(2000);
    
    // Dashboard should show updated count
    const updatedCount = await page.locator('.metric-card:has-text("Projekty") .value').textContent();
    expect(parseInt(updatedCount ?? '0')).toBeGreaterThan(parseInt(initialCount ?? '0'));
  });
  
  test('charts render correctly', async ({ page }) => {
    const user = await createUserWithData();
    
    await page.goto('/login');
    await loginAs(user);
    await page.goto('/dashboard');
    
    // Chart should be visible
    const chart = page.locator('.chart, .recharts-wrapper, [data-chart]');
    await expect(chart).toBeVisible();
    
    // Chart should have data points
    const dataPoints = page.locator('.recharts-bar, .recharts-line, canvas');
    const count = await dataPoints.count();
    expect(count).toBeGreaterThan(0);
  });
  
  test('empty state is displayed gracefully', async ({ page }) => {
    const emptyUser = await createUserWithNoData();
    
    await page.goto('/login');
    await loginAs(emptyUser);
    await page.goto('/dashboard');
    
    // Should show empty state message, not error
    const emptyState = page.locator('.empty-state, .no-data');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText(/brak.*danych|no.*projects|tworzenie/i);
  });
});
```

---

## Sekcja 6: CI/CD for SaaS testing

```yaml
# .github/workflows/saas-tests.yml
name: SaaS Panel Tests

on:
  push:
    branches: [main, develop]
  pull_request:

env:
  BASE_URL: ${{ vars.SAAS_APP_URL }}

jobs:
  smoke:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Install and test
        run: |
          npm ci
          npx playwright install --with-deps
      
      # Test critical flows with fresh tenants
      - name: Tenant isolation smoke
        run: npx playwright test tests/saas/tenant-isolation/smoke.spec.ts
      
      - name: RBAC smoke
        run: npx playwright test tests/saas/rbac/smoke.spec.ts
      
      - name: Billing smoke
        run: npx playwright test tests/saas/billing/smoke.spec.ts
      
      - name: Upload results
        uses: actions/upload-artifact@v4
        with:
          name: saas-smoke-results
          path: test-results/

  security-tests:
    needs: smoke
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Tenant isolation full
        run: npx playwright test tests/saas/tenant-isolation/
      
      - name: RBAC matrix
        run: npx playwright test tests/saas/rbac/
      
      - name: Upload audit trail
        uses: actions/upload-artifact@v4
        with:
          name: security-test-results
          path: test-results/
```

---

## Perspektywa Full Stack Testera

Testowanie SaaS to testowanie systemów z złożoną logiką uprawnień i izolacji. Jako Full Stack Tester:

**Multi-tenancy first**: Każdy test musi zakładać, że może działać w wielu tenantach jednocześnie. Izolacja jest fundamentalna.

**RBAC jako matrix**: Role nie są prostym boolean. Jest macierz: kto może co robić na jakim zasobie. Testuj całą macierz.

**Billing is critical**: Problemy z billingiem to realne straty finansowe. Testuj trial→paid→limit→cancel lifecycle.

**Audit trails are evidence**: Audit logs to compliance requirement. Testuj, że wszystkie operations są logged.

**Webhooks need testing**: External integrations są część systemu. Testuj delivery, retries, signatures.

---

## Podsumowanie

- **Multi-tenant isolation**: Tenant A cannot see/modify tenant B data. Test via UI and API.
- **RBAC matrix**: Role-based access testing. Test each role × action combination.
- **Billing lifecycle**: Trial → paid → limits → upgrade → cancel. Critical path.
- **Audit trails**: Operations are logged with who, what, when. Compliance evidence.
- **Real-time updates**: Dashboard updates, webhooks, live data.
- **Webhook testing**: Delivery, retry, signature validation.
- **CI integration**: Tenant isolation and RBAC tests on every PR.

---

## Linki i Źródła

- [Multi-Tenant SaaS Testing Strategies — TestRail](https://blog.gurock.com/multi-tenant-testing/)
- [RBAC Testing Checklist — OWASP](https://owasp.org/www-project-web-security-testing-guide/)
- [Subscription Billing Testing — Stripe](https://stripe.com/docs/testing)
- [Webhook Testing Patterns](https://webhooks.tech/webhook-testing-best-practices)
- [Audit Logging for Compliance](https://www.cms.gov/privacy/guidance-for-compliance)