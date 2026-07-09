import React, { useState } from 'react';
import { FileText, Download, Copy, Check, ChevronDown, ChevronRight, Printer, ExternalLink } from 'lucide-react';

type SheetCategory = 'locators' | 'actions' | 'assertions' | 'config' | 'cli' | 'fixtures';

interface Sheet {
  id: SheetCategory;
  title: string;
  icon: string;
  content: string;
}

const SHEETS: Sheet[] = [
  {
    id: 'locators', title: 'Selektory (Locators)', icon: '🔍',
    content: `# Selektory Playwright — ściąga

## Priorytet selektorów (od najlepszego)
1. data-testid — page.getByTestId('submit-btn')
2. ARIA role — page.getByRole('button', { name: 'Submit' })
3. Label — page.getByLabel('Email')
4. Placeholder — page.getByPlaceholder('Enter email')
5. Text — page.getByText('Submit')
6. CSS — page.locator('.btn-primary')
7. XPath — page.locator('//button[@type="submit"]')

## CSS Selectors
page.locator('button')                    // tag
page.locator('.btn-primary')              // class
page.locator('#submit')                   // id
page.locator('[data-testid="login"]')     // attribute
page.locator('form .input')               // descendant
page.locator('form > .input')             // child
page.locator('h1 + p')                    // adjacent sibling
page.locator('[class*="btn"]')            // contains
page.locator('[class^="btn-"]')           // starts with
page.locator('[class$="-primary"]')       // ends with
page.locator('li:first-child')            // first child
page.locator('li:nth-child(2)')           // nth child
page.locator('button:not(.disabled)')     // negation

## Text Selectors
page.getByText('Submit')                  // exact
page.getByText('Submit', { exact: true }) // case-sensitive
page.getByText(/submit/i)                 // regex
page.getByText('Witaj').first()           // first match

## Role Selectors
page.getByRole('button', { name: 'OK' })
page.getByRole('link', { name: /home/i })
page.getByRole('textbox', { name: 'Email' })
page.getByRole('checkbox', { name: /regulamin/i })
page.getByRole('radio', { name: 'Opcja A' })
page.getByRole('heading', { level: 1 })
page.getByRole('alert')
page.getByRole('dialog')

## Chaining i filtrowanie
page.locator('tr').filter({ hasText: 'Kowalski' })
page.locator('button').filter({ has: page.locator('.icon') })
page.locator('li').first()
page.locator('li').last()
page.locator('li').nth(2)
page.locator('button').or(page.locator('[role="button"]'))

## iframe i Shadow DOM
page.frameLocator('#my-iframe').locator('button')
page.frameLocator('#outer').frameLocator('#inner').locator('input')
page.locator('custom-element').locator('button') // Shadow DOM auto-piercing`
  },
  {
    id: 'actions', title: 'Akcje (Actions)', icon: '🖱️',
    content: `# Akcje Playwright — ściąga

## Click
await page.locator('#btn').click()
await page.locator('#btn').click({ button: 'right' })     // right click
await page.locator('#btn').dblclick()                      // double click
await page.locator('#btn').click({ clickCount: 3 })        // triple click
await page.locator('#btn').click({ modifiers: ['Shift'] }) // Shift+click
await page.locator('#btn').click({ position: { x: 10, y: 10 } })// specific point
await page.locator('#btn').click({ force: true })          // skip checks
await page.locator('#btn').click({ trial: true })          // dry run
await page.locator('#btn').click({ noWaitAfter: true })    // don't wait for nav
await page.locator('#btn').click({ timeout: 5000 })        // custom timeout

## Fill / Type / Clear
await page.locator('input').fill('text')       // instant
await page.locator('input').type('text')       // char by char
await page.locator('input').type('text', { delay: 100 })  // with delay
await page.locator('input').clear()            // clear input

## Press (keyboard)
await page.locator('input').press('Enter')
await page.locator('input').press('Tab')
await page.locator('input').press('Escape')
await page.locator('input').press('Backspace')
await page.locator('input').press('Control+A')
await page.keyboard.press('Control+C')

## Checkbox / Radio
await page.locator('input[type=checkbox]').check()
await page.locator('input[type=checkbox]').uncheck()
await page.locator('input[type=checkbox]').setChecked(true)
await page.locator('input[type=checkbox]').isChecked()
await page.locator('input[type=radio]').check()

## Select (dropdown)
await page.locator('select').selectOption('value')
await page.locator('select').selectOption({ label: 'Polska' })
await page.locator('select').selectOption({ index: 0 })
await page.locator('select').selectOption(['v1', 'v2'])  // multi-select

## File upload
await page.locator('input[type=file]').setInputFiles('file.pdf')
await page.locator('input[type=file]').setInputFiles(['f1.pdf', 'f2.jpg'])
await page.locator('input[type=file]').setInputFiles([])  // clear

## Hover / Focus / Drag
await page.locator('.menu').hover()
await page.locator('input').focus()
await page.locator('input').blur()
await page.locator('.item').dragTo(page.locator('.target'))

## Mobile
await page.locator('button').tap()           // tap (mobile)
await page.locator('button').tap({ position: { x: 50, y: 50 } })`
  },
  {
    id: 'assertions', title: 'Asercje (Assertions)', icon: '✅',
    content: `# Asercje Playwright — ściąga

## Visibility
await expect(page.locator('.msg')).toBeVisible()
await expect(page.locator('.msg')).toBeHidden()
await expect(page.locator('.msg')).toBeAttached()
await expect(page.locator('.msg')).toBeDetached()

## State
await expect(page.locator('button')).toBeEnabled()
await expect(page.locator('button')).toBeDisabled()
await expect(page.locator('input')).toBeEditable()
await expect(page.locator('input')).toBeChecked()
await expect(page.locator('div')).toBeEmpty()
await expect(page.locator('input')).toBeFocused()

## Text
await expect(page.locator('.msg')).toHaveText('Sukces!')
await expect(page.locator('.msg')).toContainText('Sukces')
await expect(page.locator('.msg')).toHaveText(/sukces/i)
await expect(items).toHaveText(['A', 'B', 'C'])  // array

## Value
await expect(page.locator('input')).toHaveValue('test@test.pl')
await expect(page.locator('select')).toHaveValues(['v1', 'v2'])

## Attribute
await expect(page.locator('a')).toHaveAttribute('href', '/about')
await expect(page.locator('div')).toHaveAttribute('data-active', 'true')
await expect(page.locator('div')).toHaveAttribute('aria-expanded')

## Class
await expect(page.locator('div')).toHaveClass('active')
await expect(page.locator('div')).toHaveClass('btn btn-primary')
await expect(page.locator('div')).toHaveClass(/active/)

## CSS
await expect(page.locator('div')).toHaveCSS('color', 'rgb(255, 0, 0)')
await expect(page.locator('div')).toHaveCSS('display', 'block')

## Count
await expect(page.locator('li')).toHaveCount(5)

## URL / Title
await expect(page).toHaveURL('https://example.com/dashboard')
await expect(page).toHaveURL(/.*dashboard/)
await expect(page).toHaveTitle('Panel')
await expect(page).toHaveTitle(/Panel/)

## ID / JS Property
await expect(page.locator('#main')).toHaveId('main')
await expect(page.locator('input')).toHaveJSProperty('checked', true)

## Screenshot
await expect(page).toHaveScreenshot('homepage.png')
await expect(page.locator('.card')).toHaveScreenshot('card.png')

## Soft assertions
await expect.soft(page.locator('.header')).toBeVisible()
await expect.soft(page.locator('.footer')).toBeVisible()

## Generic (dla danych, nie DOM)
expect(5).toBe(5)
expect({ a: 1 }).toEqual({ a: 1 })
expect('Hello').toContain('ell')
expect([1,2,3]).toHaveLength(3)
expect(() => fn()).toThrow('error')`
  },
  {
    id: 'config', title: 'Konfiguracja (Config)', icon: '⚙️',
    content: `# Konfiguracja Playwright — ściąga

## playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 5000 },
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  
  reporter: [
    ['html', { open: 'on-failure' }],
    ['json', { outputFile: 'results.json' }],
    ['junit', { outputFile: 'junit.xml' }],
    ['github'],
  ],
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});

## CLI Commands
npx playwright test                    # all tests
npx playwright test --headed           # headed mode
npx playwright test --debug            # Inspector
npx playwright test --ui               # tryb UI
npx playwright test --grep @smoke      # filter by tag
npx playwright test --project=chromium # specific browser
npx playwright test --shard=1/4        # sharding
npx playwright test --repeat-each=10   # repeat for flaky detection
npx playwright test --update-snapshots # update baselines
npx playwright codegen                 # record test
npx playwright show-report             # open HTML report
npx playwright show-trace trace.zip    # open trace`
  },
  {
    id: 'cli', title: 'CLI & Test Runner', icon: '💻',
    content: `# Test Runner i CLI — ściąga

## test() i test.describe()
test('nazwa testu', async ({ page }) => { ... })
test.describe('grupa testów', () => { ... })
test.describe.parallel('równoległe', () => { ... })
test.describe.serial('sekwencyjne', () => { ... })

## Hooks
test.beforeAll(async () => { ... })
test.beforeEach(async ({ page }) => { ... })
test.afterEach(async ({ page }) => { ... })
test.afterAll(async () => { ... })

## Annotations
test.skip('pomiń', async () => { ... })
test.skip(condition, 'reason')
test.fixme('do naprawienia', async () => { ... })
test.fail('oczekiwany fail', async () => { ... })
test.slow('wolny test — 2x timeout', async () => { ... })
test.only('tylko ten', async () => { ... })  // ❌ tylko dev!

## test.step() — czytelne raporty
await test.step('Otwórz stronę', async () => { await page.goto('/'); });
await test.step('Wypełnij formularz', async () => { ... });
await test.step('Wyślij i zweryfikuj', async () => { ... });

## test.info()
test('z info', async ({ page }, testInfo) => {
  console.log(testInfo.title);       // nazwa testu
  console.log(testInfo.status);      // 'passed' | 'failed'
  console.log(testInfo.retry);       // numer retry (0 = pierwsze)
  await testInfo.attach('screen', { body: await page.screenshot(), contentType: 'image/png' });
});

## Tags
test('Logowanie @auth @smoke @critical', async () => { ... })
// npx playwright test --grep "@smoke"
// npx playwright test --grep "@critical"
// npx playwright test --grep "@auth|@checkout"
// npx playwright test --grep-invert "@slow"

## Timeouty
test.setTimeout(120000);             // per test
// playwright.config.ts:
timeout: 60000,                       // global
expect: { timeout: 10000 },           // assertions
use: { actionTimeout: 15000 }         // actions`
  },
  {
    id: 'fixtures', title: 'Fikstury', icon: '🔧',
    content: `# Fixtures Playwright — ściąga

## Wbudowane fixtures
test('test', async ({ 
  page,          // izolowana strona
  context,       // browser context
  browser,       // instancja przeglądarki
  browserName,   // 'chromium' | 'firefox' | 'webkit'
  request,       // API request context
}) => { ... });

## Custom fixture (test.extend)
import { test as base, expect } from '@playwright/test';

type MyFixtures = {
  loginPage: LoginPage;
  adminUser: { email: string; password: string };
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));  // setup → test → teardown
  },
  adminUser: async ({}, use) => {
    const user = { email: 'admin@test.pl', password: 'secret' };
    await use(user);
  },
});
export { expect };

## Worker-scoped (współdzielony)
type WorkerFixtures = { db: Database };
const test = base.extend<{}, WorkerFixtures>({
  db: [async ({}, use) => {
    const db = await Database.connect();
    await use(db);
    await db.close();
  }, { scope: 'worker' }],  // ← worker scope!
});

## Auto-fixture (auto: true)
const test = base.extend<{ logger: Logger }>({
  logger: [async ({}, use) => {
    await use(new Logger());
  }, { auto: true }],  // ← dostępny automatycznie!
});

## Page Object jako fixture
type PageFixtures = {
  loginPage: LoginPage;
  productsPage: ProductsPage;
  checkoutPage: CheckoutPage;
};
export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  productsPage: async ({ page }, use) => { await use(new ProductsPage(page)); },
  checkoutPage: async ({ page }, use) => { await use(new CheckoutPage(page)); },
});

## Application fixture (centralny dostęp)
class Application {
  public login: LoginPage;
  public products: ProductsPage;
  constructor(page: Page) {
    this.login = new LoginPage(page);
    this.products = new ProductsPage(page);
  }
}
type AppFixtures = { app: Application };
export const test = base.extend<AppFixtures>({
  app: async ({ page }, use) => { await use(new Application(page)); },
});

## Fixture zależności
const test = base.extend<{ db: Database; dbUser: User }>({
  db: async ({}, use) => { /* ... */ },
  dbUser: async ({ db }, use) => {  // zależy od db!
    const user = await db.createUser();
    await use(user);
    await db.deleteUser(user.id); // cleanup
  },
});

## Override wbudowanego page
const test = base.extend<{ page: Page }>({
  page: async ({ browser }, use) => {
    const context = await browser.newContext({ locale: 'pl-PL' });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});`
  },
];

export function CheatSheets() {
  const [expanded, setExpanded] = useState<Set<SheetCategory>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);

  const toggle = (id: SheetCategory) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handlePrint = (content: string) => {
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(`<pre style="font-family:monospace;font-size:12px;line-height:1.5;padding:20px;white-space:pre-wrap">${content}</pre>`);
      w.document.close();
      setTimeout(() => w.print(), 500);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <FileText size={20} /> Ściągi (Cheat Sheets)
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Szybkie referencje do wydrukowania. Kliknij aby rozwinąć, skopiuj lub wydrukuj.
        </p>

        <div className="space-y-3">
          {SHEETS.map(sheet => {
            const isOpen = expanded.has(sheet.id);
            return (
              <div key={sheet.id} className="border border-border rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 p-3 hover:bg-accent/50 cursor-pointer" onClick={() => toggle(sheet.id)}>
                  <span className="text-xl">{sheet.icon}</span>
                  <span className="font-medium flex-1">{sheet.title}</span>
                  <button onClick={(e) => { e.stopPropagation(); handleCopy(sheet.content, sheet.id); }}
                    className="p-1.5 rounded hover:bg-accent transition-colors" title="Kopiuj">
                    {copied === sheet.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handlePrint(sheet.content); }}
                    className="p-1.5 rounded hover:bg-accent transition-colors" title="Drukuj">
                    <Printer size={14} />
                  </button>
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
                {isOpen && (
                  <div className="border-t border-border bg-card">
                    <pre className="p-4 text-xs font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                      {sheet.content}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20 text-sm text-center">
          <p>📥 Pobierz wszystkie ściągi jako jeden plik PDF (funkcja dostępna wkrótce).</p>
          <p className="text-xs text-muted-foreground mt-1">
            Możesz też wydrukować każdą ściągę osobno — kliknij ikonę 🖨️.
          </p>
        </div>
      </div>
    </div>
  );
}
