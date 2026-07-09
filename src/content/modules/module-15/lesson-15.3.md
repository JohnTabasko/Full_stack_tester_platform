# Pełna konfiguracja projektu z CI/CD

> **Perspektywa Full Stack Testera**
> Projekt testowy, który działa tylko na lokalnej maszynie developera, jest hobby project. Projekt, który ma CI/CD, dokumentację, standardy i workflow dla wielu osób, jest profesjonalnym narzędziem. Różnica między tymi dwoma podejściami to kwestia architektury repozytorium, konwencji kodowania, secrets management, pipeline configuration i dokumentacji. Ta lekcja uczy, jak zbudować profesjonalny projekt testowy, który jest gotowy na współpracę zespołową i CI/CD.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Zbudować profesjonalną strukturę repozytorium** z clear separation of concerns
- **Skonfigurować lint, types i formatowanie** dla consistency
- **Zarządzać sekretami** bezpiecznie przez environment variables
- **Skonfigurować CI/CD pipeline** z stages, artefakty i quality gates
- **Dokumentować projekt** przez README, CONTRIBUTING i ADR
- **Ustanowić konwencje** dla commit messages, PR reviews i release workflow

---

## Wprowadzenie: projekt jako produkt wewnętrzny

Projekt testowy to produkt wewnętrzny z użytkownikami (inny developerzy, QA team), stakeholders (product owners, managers) i kosztami utrzymania. Tak samo jak produkcyjny kod, wymaga:

- **Standardów** — konwencje kodowania, naming, structure
- **Dokumentacji** — README, CONTRIBUTING, API docs
- **CI/CD** — automated pipeline, quality gates
- **Maintenance** — dependency updates, refactoring, cleanup
- **Communication** — PR templates, issue templates, changelog

Bez tych elementów projekt staje się unreadable, unmaintainable i w końcu porzucony.

---

## Sekcja 1: Struktura repozytorium

### Professional repository structure

```
test-automation/
├── .github/
│   ├── workflows/
│   │   ├── e2e-smoke.yml
│   │   ├── e2e-regression.yml
│   │   ├── security-tests.yml
│   │   ├── dependency-audit.yml
│   │   └── code-quality.yml
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
├── tests/
│   ├── smoke/                    # Critical path tests
│   ├── regression/               # Full suite
│   ├── api/                      # API contract tests
│   ├── security/                 # Security tests
│   ├── compliance/               # Compliance tests
│   └── visual/                   # Visual regression
├── src/
│   ├── pages/                    # Page Object Models
│   ├── components/               # Reusable UI components
│   ├── api/                      # API clients
│   ├── fixtures/                 # Test fixtures
│   ├── builders/                 # Data builders
│   ├── utils/                    # Utilities
│   └── constants/                # Shared constants
├── docs/
│   ├── architecture.md
│   ├── test-strategy.md
│   ├── rbac-matrix.md
│   └── adr/                      # Architecture Decision Records
│       ├── 0001-use-page-objects.md
│       ├── 0002-use-data-builders.md
│       └── 0003-use-fixtures.md
├── scripts/
│   ├── generate-report.js
│   ├── analyze-flakiness.js
│   └── setup-test-data.js
├── playwright.config.ts
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
├── README.md
└── CHANGELOG.md
```

### Package.json scripts

```json
{
  "name": "playwright-automation",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "lint": "eslint src tests --ext .ts,.tsx",
    "lint:fix": "eslint src tests --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.ts\" \"tests/**/*.ts\"",
    "typecheck": "tsc --noEmit",
    "test": "playwright test",
    "test:smoke": "playwright test tests/smoke",
    "test:regression": "playwright test tests/regression",
    "test:api": "playwright test tests/api",
    "test:security": "playwright test tests/security",
    "test:visual": "playwright test tests/visual --update-snapshots",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "report": "node scripts/generate-report.js",
    "flakiness": "node scripts/analyze-flakiness.js",
    "setup": "node scripts/setup-test-data.js",
    "clean": "rm -rf test-results playwright-report .auth"
  },
  "devDependencies": {
    "@playwright/test": "^1.47.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.45.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## Sekcja 2: Linting i type checking

### ESLint configuration

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'playwright/test'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:playwright/recommended',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'playwright/no-skipped-test': 'off',
    'playwright/no-focus-events': 'off',
  },
  overrides: [
    {
      files: ['tests/**/*.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      },
    },
  ],
};
```

### Prettier configuration

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### Git hooks — pre-commit

```bash
# .husky/pre-commit
#!/bin/sh

echo "Running pre-commit checks..."

# Run lint
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Lint failed. Please fix errors before committing."
  exit 1
fi

# Run type check
npm run typecheck
if [ $? -ne 0 ]; then
  echo "❌ Type check failed. Please fix errors before committing."
  exit 1
fi

echo "✅ Pre-commit checks passed"
```

### Package.json husky setup

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm run typecheck"
    }
  }
}
```

---

## Sekcja 3: Environment variables i secrets

### .env.example

```bash
# Application under test
BASE_URL=https://staging.example.com

# Authentication
E2E_USER=test@example.com
E2E_PASSWORD=your-test-password-here

# API Keys (use CI secrets, never commit real keys)
STRIPE_SANDBOX_KEY=sk_test_xxxx
SENDGRID_API_KEY=SG.xxxx

# BrowserStack / Sauce Labs (for cross-browser)
BROWSERSTACK_USERNAME=your-username
BROWSERSTACK_ACCESS_KEY=your-access-key

# Screenshot storage
SCREENSHOT_AWS_BUCKET=test-zrzuty ekranu
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx

# Database (for direct DB checks in tests)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=test_db
DB_USER=test
DB_PASSWORD=xxx
```

### Secrets in CI — GitHub Actions

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  push:
    branches: [main]

env:
  BASE_URL: ${{ vars.STAGING_URL }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup
        run: npm ci
      
      # Secrets from GitHub Actions secrets
      - name: Run tests
        run: npx playwright test
        env:
          E2E_USER: ${{ secrets.E2E_USER }}
          E2E_PASSWORD: ${{ secrets.E2E_PASSWORD }}
          STRIPE_SANDBOX_KEY: ${{ secrets.STRIPE_SANDBOX_KEY }}
      
      - name: Upload report
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: playwright-report
```

### .gitignore

```gitignore
# Dependencies
node_modules/

# Test results
test-results/
playwright-report/
playwright/*.zip

# Auth state
.auth/
*.auth.json

# Environment files (contain secrets!)
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Build
dist/
build/
```

---

## Sekcja 4: CI/CD Pipeline

### GitHub Actions — Complete pipeline

```yaml
# .github/workflows/full-ci.yml
name: E2E Test Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  BASE_URL: ${{ vars.APP_URL }}

jobs:
  # Stage 1: Code Quality (fast, fail fast)
  code-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run typecheck
      
      - name: Format check
        run: npx prettier --check "src/**/*.ts" "tests/**/*.ts"

  # Stage 2: Smoke Tests (fast feedback)
  smoke-tests:
    needs: code-quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Install
        run: |
          npm ci
          npx playwright install --with-deps
      
      - name: Run smoke tests
        run: npx playwright test tests/smoke --reporter=line,junit,json
      
      - name: Upload results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: smoke-results
          path: |
            test-results/
            playwright-report/

  # Stage 3: Full Regression (parallel, slower)
  regression:
    needs: smoke-tests
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shard: [1, 2, 3, 4]
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      
      - name: Install
        run: |
          npm ci
          npx playwright install --with-deps chromium
      
      - name: Run regression shard
        run: npx playwright test --shard=${{ matrix.shard }}/4
      
      - name: Upload results
        uses: actions/upload-artifact@v4
        with:
          name: regression-shard-${{ matrix.shard }}
          path: test-results/

  # Stage 4: Security Tests
  security:
    needs: smoke-tests
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run security tests
        run: npx playwright test tests/security
      
      - name: Upload report
        uses: actions/upload-artifact@v4
        with:
          name: security-report
          path: test-results/security/

  # Stage 5: Merge results and publish
  merge-results:
    needs: [regression, security]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          pattern: regression-shard-*
          path: test-results/shards
      
      - name: Merge JUnit
        run: |
          npm install -g junit-merge
          junit-merge -d test-results/shards -o test-results/merged.xml
      
      - name: Publish HTML report
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: playwright-report
          keep_files: true

  # Stage 6: Quality Gate
  quality-gate:
    needs: merge-results
    runs-on: ubuntu-latest
    steps:
      - name: Evaluate quality gate
        run: node scripts/quality-gate.js
      
      - name: Comment on PR
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              body: '## E2E Tests: ${{ needs.smoke-tests.result }}\n\n'
                    + 'Regression: ${{ needs.regression.result }}\n'
                    + 'Security: ${{ needs.security.result }}\n\n'
                    + '[📊 Report](${{ env.BASE_URL }}/report)'
            });

  # Stage 7: Dependency audit (daily)
  dependency-audit:
    schedule:
      - cron: '0 6 * * *'
    if: github.event_name == 'schedule'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Audit
        run: |
          npm audit --audit-level=high
          npm outdated --json | tee outdated.json
```

### Quality gate implementation

```typescript
// scripts/quality-gate.ts
interface QualityGate {
  name: string;
  threshold: number;
  actual: number;
  passed: boolean;
}

async function evaluateGate(): Promise<void> {
  const results = await loadTestResults();
  
  const gates: QualityGate[] = [
    {
      name: 'Pass Rate',
      threshold: 95,
      actual: results.passRate,
      passed: results.passRate >= 95,
    },
    {
      name: 'Critical Failures',
      threshold: 0,
      actual: results.criticalFailures,
      passed: results.criticalFailures === 0,
    },
    {
      name: 'Flaky Rate',
      threshold: 5,
      actual: results.flakyRate,
      passed: results.flakyRate <= 5,
    },
  ];
  
  console.log('\n=== Quality Gate Evaluation ===');
  for (const gate of gates) {
    const status = gate.passed ? '✅' : '❌';
    console.log(`${status} ${gate.name}: ${gate.actual} (required: ${gate.threshold})`);
  }
  
  const failed = gates.filter(g => !g.passed);
  if (failed.length > 0) {
    console.log('\n❌ Quality gate FAILED');
    console.log('Failed gates:', failed.map(f => f.name).join(', '));
    process.exit(1);
  }
  
  console.log('\n✅ All gates passed');
}

evaluateGate();
```

---

## Sekcja 5: Documentation

### README.md structure

```markdown
# E2E Test Automation Suite

> Automated end-to-end tests for [Application Name]

## Quick Start

```bash
# Prerequisites
node >= 20
npx playwright install --with-deps

# Install
npm ci

# Run tests
npm run test:smoke          # Fast smoke tests
npm run test                # Full regression

# Open report
npx playwright show-report
```

## Project Structure

```
├── tests/           # Test specifications
│   ├── smoke/       # Critical path tests
│   ├── regression/  # Full test suite
│   └── api/         # API contract tests
├── src/
│   ├── pages/       # Page Object Models
│   ├── api/         # API clients
│   ├── fixtures/    # Test fixtures
│   └── builders/    # Data builders
└── docs/            # Documentation
```

## Architecture

### Test Strategy

We follow risk-based testing approach:
- **Smoke** (PR): Critical paths — checkout, login, core flows
- **Regression** (main): Full coverage of business flows
- **API** (every PR): Contract validation
- **Security** (daily): Access control, data isolation

### Key Design Decisions

See [Architecture Decision Records](docs/adr/).

## CI/CD

Tests run automatically on:
- Every PR → smoke tests
- Push to main → full regression + security
- Daily → dependency audit

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Internal use only.
```

### CONTRIBUTING.md

```markdown
# Contributing to E2E Test Suite

## Setup

1. Clone repository
2. Run `npm ci`
3. Run `npx playwright install --with-deps`
4. Copy `.env.example` to `.env` and fill in credentials

## Making Changes

### Branches

- `main` — production-ready tests
- `develop` — integration branch
- `feature/*` — new test features
- `fix/*` — bug fixes

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(cart): add coupon test
fix(checkout): correct payment selector
docs(readme): update setup instructions
```

### Pull Requests

1. Create PR from `feature/*` to `develop`
2. All checks must pass
3. At least 1 review required
4. Squash and merge

## Test Guidelines

### Writing Tests

- Use Page Object Models — never selectors in tests
- Use data builders — never hardcoded test data
- Use fixtures for shared setup
- Tag tests appropriately: `@smoke`, `@critical`, `@slow`

### Test Structure

```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
  });
  
  test('happy path @smoke', async ({ page }) => {
    // Test
  });
  
  test('error handling', async ({ page }) => {
    // Test
  });
});
```

### Locator Priority

1. `getByRole()` — semantic, accessible
2. `getByLabel()` — form fields
3. `getByText()` — visible text
4. `getByTestId()` — last resort
5. CSS selectors — avoid

## Troubleshooting

### Tests are flaky

1. Run `npm run flakiness` to analyze
2. Check for timing issues
3. Verify test data is isolated

### Cannot run locally

1. Verify `.env` is configured
2. Check app is running at `BASE_URL`
3. Run `npx playwright test --headed` for visibility
```

### ADR — Architecture Decision Records

```markdown
# ADR-0001: Use Page Object Models

## Status
Accepted

## Context
Tests are using selectors directly, making them brittle and hard to maintain.

## Decision
Introduce Page Object Models in `src/pages/`.

## Consequences
- Tests become more maintainable
- Selectors centralized in one place
- Requires discipline to keep POMs updated
```

---

## Sekcja 6: Conventional Commits i Release workflow

### Commit message format

```
<type>(<zakres>): <description>

[optional body]

[optional footer(s)]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```bash
feat(cart): add coupon application test
fix(checkout): correct selectors after redesign
docs(readme): update setup instructions
test(security): add tenant isolation tests
chore(ci): add parallel sharding
```

### Release workflow

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Extract version
        run: echo "VERSION=${GITHUB_REF#refs/tags/v}" >> $GITHUB_ENV
      
      - name: Run full test suite
        run: npm ci && npx playwright test
      
      - name: Generate release notes
        run: |
          npx conventional-changelog -p angular -i CHANGELOG.md -s
          
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          body_path: CHANGELOG.md
          tag_name: ${{ env.VERSION }}
          generate_release_notes: true
```

### CHANGELOG.md structure

```markdown
# Changelog

## [1.0.0] - 2024-06-15

### Added
- Smoke test suite for checkout flow
- Tenant isolation tests
- RBAC matrix tests
- CI/CD pipeline with quality gates

### Changed
- Migrated to Page Object Models
- Updated Playwright to 1.47.0

### Fixed
- Fixed flaky coupon test
- Corrected selectors after redesign

### Security
- Added security headers verification
- Added IDOR protection tests
```

---

## Perspektywa Full Stack Testera

Profesjonalny projekt testowy to nie tylko testy. To:

**Architecture**: Structure, conventions, patterns. Projekt musi być zrozumiały dla nowej osoby w zespole.

**CI/CD**: Automatyzacja to podstawa. Każdy commit musi być weryfikowany. Każdy PR musi mieć feedback.

**Documentation**: README, CONTRIBUTING, ADR. Bez nich wiedza żyje tylko w głowach autorów.

**Standards**: Lint, types, formatowanie. Consistency enables collaboration.

**Quality gates**: Automatyczne blocks na regresje. Człowiek nie może wszystkiego sprawdzić.

**Release management**: Wersjonowanie, changelog, release notes. Profesjonalny projekt ma historię.

---

## Podsumowanie

- **Repository structure**: Clear separation — tests, src, docs, scripts.
- **Code quality**: ESLint, Prettier, TypeScript — consistency in every commit.
- **Secrets management**: Environment variables, CI secrets, .gitignore.
- **CI/CD pipeline**: Stages (quality → smoke → regression → security → gate), parallel execution, artifact publishing.
- **Documentation**: README, CONTRIBUTING, ADR — everything needed to understand and maintain.
- **Conventional Commits**: Standardized commit messages, changelog, release workflow.
- **Quality gates**: Automated blocks on regression — pass rate, critical failures, flaky rate.

---

## Linki i Źródła

- [Conventional Commits](https://www.conventionalcommits.org/) — commit message standard
- [ADR — Architecture Decision Records](https://adr.github.io/) — documenting architectural decisions
- [GitHub Actions Documentation](https://docs.github.com/en/actions) — CI/CD configuration
- [Playwright CI Best Practices](https://playwright.dev/docs/ci-best-practices/) — CI/CD recommendations
- [ESLint Configuration](https://eslint.org/docs/user-guide/configuring/) — linting setup
- [Husky — Git hooks](https://typicode.github.io/husky/) — pre-commit hooks