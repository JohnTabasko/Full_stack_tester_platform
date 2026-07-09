import React, { useState } from 'react';
import { Copy, Download, CheckCircle2, FolderTree, Package, File, FolderOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@lib/utils';

interface TemplateFile {
  name: string;
  content: string;
  description?: string;
}

interface ProjectTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tags: string[];
  files: TemplateFile[];
}

const templates: ProjectTemplate[] = [
  {
    id: 'basic',
    title: 'Playwright Basic',
    description: 'Minimalna konfiguracja Playwright z TypeScript. Idealna do nauki i malych projektow.',
    icon: <Package size={16} />,
    tags: ['playwright', 'typescript', 'starter'],
    files: [
      {
        name: 'package.json',
        description: 'Konfiguracja projektu i zaleznosci',
        content: `{
  "name": "playwright-basic-project",
  "version": "1.0.0",
  "scripts": {
    "test": "npx playwright test",
    "test:headed": "npx playwright test --headed",
    "test:ui": "npx playwright test --ui",
    "test:debug": "npx playwright test --debug",
    "report": "npx playwright show-report"
  },
  "devDependencies": {
    "@playwright/test": "^1.60.0",
    "typescript": "^5.5.0"
  }
}`,
      },
      {
        name: 'playwright.config.ts',
        description: 'Konfiguracja Playwright - przegladarki, retries, reportery',
        content: `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 3 : 0,
  workers: process.env.CI ? 3 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});`,
      },
      {
        name: 'tsconfig.json',
        description: 'Konfiguracja TypeScript',
        content: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["tests/**/*.ts", "playwright.config.ts"]
}`,
      },
      {
        name: 'tests/example.spec.ts',
        description: 'Przykladowy test',
        content: `import { test, expect } from '@playwright/test';

test.describe('Przykladowe testy', () => {
  test('strona glowna - tytul', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Moja Aplikacja/);
  });

  test('nawigacja - linki', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    await expect(nav.locator('a')).toHaveCount(3);
  });
});`,
      },
      {
        name: '.gitignore',
        description: 'Pliki ignorowane przez Git',
        content: `node_modules/
test-results/
playwright-report/
playwright/.cache/
results.json
auth/state.json`,
      },
    ],
  },
  {
    id: 'pom',
    title: 'Playwright + POM',
    description: 'Szablon z Wzorzec obiektu strony, komponentami i fixtures. Dla srednich i duzych projektow.',
    icon: <FolderTree size={16} />,
    tags: ['playwright', 'pom', 'components', 'fixtures'],
    files: [
      {
        name: 'package.json',
        description: 'Konfiguracja projektu',
        content: `{
  "name": "playwright-pom-project",
  "version": "1.0.0",
  "scripts": {
    "test": "npx playwright test",
    "test:smoke": "npx playwright test --grep @smoke",
    "test:headed": "npx playwright test --headed",
    "report": "npx playwright show-report"
  },
  "devDependencies": {
    "@playwright/test": "^1.60.0",
    "@faker-js/faker": "^9.0.0",
    "typescript": "^5.5.0",
    "dotenv": "^16.0.0"
  }
}`,
      },
      {
        name: 'src/pom/pages/BasePage.ts',
        description: 'Bazowa klasa Page Object',
        content: `import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;
  protected abstract readonly path: string;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.path);
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  protected locator(selector: string): Locator {
    return this.page.locator(selector);
  }
}`,
      },
      {
        name: 'src/pom/pages/LoginPage.ts',
        description: 'Page Object dla strony logowania',
        content: `import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  protected readonly path = '/login';

  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = this.locator('[data-testid="email-input"]');
    this.passwordInput = this.locator('[data-testid="password-input"]');
    this.submitButton = this.locator('[data-testid="submit-button"]');
    this.errorMessage = this.locator('[data-testid="error-message"]');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  async expectLoginError(): Promise<void> {
    await this.errorMessage.waitFor({ state: 'visible' });
  }
}`,
      },
      {
        name: 'src/pom/components/Header.ts',
        description: 'Komponent naglowka',
        content: `import { Locator } from '@playwright/test';

export class HeaderComponent {
  private readonly root: Locator;
  readonly logo: Locator;
  readonly navLinks: Locator;
  readonly userMenu: Locator;

  constructor(root: Locator) {
    this.root = root;
    this.logo = root.locator('.logo');
    this.navLinks = root.locator('nav a');
    this.userMenu = root.locator('.user-menu');
  }

  async clickLogo(): Promise<void> {
    await this.logo.click();
  }

  async getNavLinkCount(): Promise<number> {
    return await this.navLinks.count();
  }
}`,
      },
      {
        name: 'src/fixtures/app.ts',
        description: 'Fixture dostarczajacy gotowe page objects',
        content: `import { test as base } from '@playwright/test';
import { LoginPage } from '../pom/pages/LoginPage';
import { HeaderComponent } from '../pom/components/Header';

type AppFixtures = {
  loginPage: LoginPage;
  header: HeaderComponent;
};

export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  header: async ({ page }, use) => {
    await use(new HeaderComponent(page.locator('header')));
  },
});

export { expect } from '@playwright/test';`,
      },
      {
        name: 'tests/login.spec.ts',
        description: 'Testy logowania z POM',
        content: `import { test, expect } from '../src/fixtures/app';

test.describe('Logowanie', () => {
  test('@smoke poprawne logowanie', async ({ loginPage, page }) => {
    await loginPage.navigate();
    await loginPage.login('test@test.pl', 'Test123!');
    await expect(page).toHaveURL('/dashboard');
  });

  test('bledne haslo', async ({ loginPage }) => {
    await loginPage.navigate();
    await loginPage.login('test@test.pl', 'wrong');
    await loginPage.expectLoginError();
  });
});`,
      },
    ],
  },
  {
    id: 'ci-cd',
    title: 'Playwright + CI/CD',
    description: 'Szablon z gotowym pipeline GitHub Actions, shardingiem i cache.',
    icon: <FolderOpen size={16} />,
    tags: ['playwright', 'ci-cd', 'github-actions', 'docker'],
    files: [
      {
        name: '.github/workflows/playwright.yml',
        description: 'Pipeline GitHub Actions',
        content: `name: Playwright Tests
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    timeout-minutes: 30
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
        browser: [chromium, firefox]

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }

      - name: Cache Playwright browsers
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: pw-\${{ runner.os }}-\${{ hashFiles('package-lock.json') }}

      - run: npm ci
      - run: npx playwright install --with-deps \${{ matrix.browser }}

      - name: Run tests
        run: npx playwright test \\
          --project=\${{ matrix.browser }} \\
          --shard=\${{ matrix.shard }}/4

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: pw-report-\${{ matrix.browser }}-\${{ matrix.shard }}
          path: playwright-report/

      - name: Quality Gate
        if: always()
        run: node scripts/quality-gate.js

  report:
    needs: [test]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with: { pattern: 'pw-report-*', merge-multiple: true }
      - uses: actions/upload-artifact@v4
        with: { name: 'merged-report', path: 'playwright-report/' }`,
      },
      {
        name: 'scripts/quality-gate.js',
        description: 'Quality gate - blokuje release przy zbyt wielu failach',
        content: `const fs = require('fs');

try {
  const report = JSON.parse(fs.readFileSync('results.json', 'utf-8'));
  const { stats } = report.suites[0] || {};

  const expected = stats?.expected || 0;
  const unexpected = stats?.unexpected || 0;
  const total = expected + unexpected;
  const successRate = total > 0 ? (expected / total) * 100 : 0;

  console.log('Success Rate:', successRate.toFixed(1) + '%');
  console.log('Passed:', expected, 'Failed:', unexpected);

  if (unexpected > 0) {
    console.log('Unexpected failures:', unexpected);
    // List failed tests
    for (const suite of report.suites) {
      for (const spec of suite.specs || []) {
        for (const test of spec.tests || []) {
          const outcome = test.results?.[0]?.status;
          if (outcome !== 'passed' && outcome !== 'skipped') {
            console.log('  FAILED:', test.title);
          }
        }
      }
    }
  }

  if (successRate < 95) {
    console.error('\\nQUALITY GATE FAILED');
    process.exit(1);
  }
  console.log('\\nQUALITY GATE PASSED');
} catch (err) {
  console.error('Failed to read report:', err.message);
  process.exit(1);
}`,
      },
      {
        name: 'Dockerfile',
        description: 'Obraz Docker dla testow',
        content: `FROM mcr.microsoft.com/playwright:v1.60.0-focal

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

CMD ["npx", "playwright", "test"]`,
      },
      {
        name: 'package.json',
        description: 'Konfiguracja z CI scripts',
        content: `{
  "name": "playwright-ci-cd",
  "version": "1.0.0",
  "scripts": {
    "test": "npx playwright test",
    "test:ci": "npx playwright test --reporter=json > results.json",
    "quality-gate": "node scripts/quality-gate.js",
    "ci": "npm run test:ci && npm run quality-gate"
  },
  "devDependencies": {
    "@playwright/test": "^1.60.0",
    "typescript": "^5.5.0"
  }
}`,
      },
    ],
  },
];

export function ProjectTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [expandedFile, setExpandedFile] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopyFile = async (content: string, name: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(name);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownloadTemplate = (template: ProjectTemplate) => {
    let allContent = '# ' + template.title + '\n# ' + '='.repeat(40) + '\n\n';
    for (const file of template.files) {
      allContent += '## ' + file.name + '\n';
      if (file.description) allContent += '// ' + file.description + '\n';
      allContent += '\n' + file.content + '\n\n';
      allContent += '-'.repeat(60) + '\n\n';
    }
    const blob = new Blob([allContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = template.id + '-template.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (selectedTemplate) {
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return null;
    return (
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <button onClick={() => setSelectedTemplate(null)} className="text-xs text-primary hover:underline mb-3">&larr; Wroc do szablonow</button>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold">{template.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
          </div>
          <button onClick={() => handleDownloadTemplate(template)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20">
            <Download size={14} /> Pobierz wszystkie
          </button>
        </div>
        <div className="space-y-1">
          {template.files.map(file => (
            <div key={file.name} className="border border-border rounded-lg overflow-hidden">
              <button onClick={() => setExpandedFile(expandedFile === file.name ? null : file.name)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-card hover:bg-accent/50 transition-colors text-left">
                <File size={14} className="text-primary shrink-0" />
                <span className="text-xs font-medium flex-1">{file.name}</span>
                <span className="text-[10px] text-muted-foreground mr-2">{file.description}</span>
                {expandedFile === file.name ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {expandedFile === file.name && (
                <div className="relative">
                  <button onClick={() => handleCopyFile(file.content, file.name)}
                    className="absolute top-2 right-2 p-1.5 rounded bg-background/80 hover:bg-accent text-muted-foreground z-10">
                    {copied === file.name ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                  <pre className="p-3 bg-background text-[11px] font-mono overflow-x-auto whitespace-pre max-h-96">
                    {file.content}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold">\ud83d\udce6 Szablony projektow</h2>
        <p className="text-xs text-muted-foreground mt-1">Gotowe struktury projektow Playwright</p>
      </div>

      <div className="space-y-3">
        {templates.map(tmpl => (
          <div key={tmpl.id} className="border border-border rounded-lg overflow-hidden">
            <button onClick={() => setSelectedTemplate(tmpl.id)}
              className="w-full flex items-start gap-3 p-4 hover:bg-accent/50 transition-colors text-left">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">{tmpl.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{tmpl.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{tmpl.description}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  {tmpl.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="text-xs text-muted-foreground shrink-0 self-center">
                {tmpl.files.length} plikow
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
