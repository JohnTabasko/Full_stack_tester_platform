# Testy regresji wizualnej

> **Perspektywa Full Stack Testera**
> Test funkcjonalny mówi "czy element istnieje i czy można go kliknąć". Test wizualny mówi "czy element wygląda prawidłowo i czy użytkownik go rozpozna". Różnica jest krytyczna: przycisk "Zapłać" może istnieć i być klikalny, ale jednocześnie znajdować się poza widocznym obszarem na mobile, być niewidoczny z powodu złego kontrastu albo być przesłonięty przez inną warstwę. Te problemy functional tests nie wykryją. Ta lekcja uczy, jak projektować testy regresji wizualnej z Playwright, które wykrywają regresje wyglądu bez fałszywych alarmów od dynamic content.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Rozumieć kiedy test wizualny ma sens** — vs. functional test, vs. manual review
- **Konfigurować screenshot testing** z `toHaveScreenshot` i threshold tolerance
- **Zarządzać baseline** — update, rollback, approval workflow
- **Maskować dynamic content** — daty, losowe dane, ads, avatars
- **Testować cross-browser visual differences** — świadoma strategia tolerancji
- **Integrować Storybook i Percy** dla component-level visual testing
- **Konfigurować responsive visual testing** na różnych viewportach

---

## Wprowadzenie: kiedy test wizualny jest potrzebny

### Co functional test pokrywa vs. co nie

| Aspekt | Functional test | Visual test |
|--------|-----------------|-------------|
| **Element istnieje** | ✅ | ❌ |
| **Element jest widoczny** | ✅ | ✅ |
| **Element jest klikalny** | ✅ | ❌ |
| **Poprawny kolor** | ❌ | ✅ |
| **Poprawny layout** | ❌ | ✅ |
| **Responsive na mobile** | ⚠️ partial | ✅ |
| **Czytelność kontrastu** | ❌ | ✅ |
| **Brak overlay rendering** | ⚠️ | ✅ |
| **Poprawna typografia** | ❌ | ✅ |

### Kiedy test wizualny jest overkill

Nie wszystko wymaga screenshot test. Używaj visual testing gdy:
- ✅ **Layout jest krytyczny** — przycisk płatności, formularz checkout, nawigacja
- ✅ **CSS changes są frequent** — redesign, refaktoryzacja UI
- ✅ **Responsive jest wymagany** — mobile-first app
- ✅ **Design system changes** — global style updates

Nie używaj gdy:
- ❌ **Content jest mostly dynamic** — social feed, news page (too many false positives)
- ❌ **Test jest already slow** — add visual test only if ROI justifies time cost
- ❌ **Layout is already tested via snapshots** — some frameworks have built-in visual diff

---

## Sekcja 1: Konfiguracja screenshot testing

### Podstawowa konfiguracja

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  
  // Screenshot configuration
  zrzuty ekranu: 'only-on-failure',  // Full-page zrzuty ekranu on failure
  
  // Projects per viewport (mobile first)
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-mobile',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'chromium-tablet',
      use: { ...devices['iPad (gen 7)'] },
    },
  ],
  
  // Timeout for visual tests (longer than functional)
  timeout: 60000,
});
```

### Basic screenshot test

```typescript
// tests/visual/visual-regression.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Setup — common for all visual tests
    await page.goto('/');
  });
  
  test('homepage matches baseline — desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('homepage-desktop.png', {
      maxDiffPixelRatio: 0.1,  // 10% tolerance
    });
  });
  
  test('homepage matches baseline — mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      maxDiffPixelRatio: 0.1,
    });
  });
  
  test('product card layout is correct', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    
    // Test specific section, not full page
    const productGrid = page.locator('.product-grid');
    
    await expect(productGrid).toHaveScreenshot('product-grid.png', {
      maxDiffPixelRatio: 0.05,  // Tighter tolerance for critical UI
    });
  });
  
  test('checkout button is visible and not covered', async ({ page }) => {
    await page.goto('/checkout');
    
    // Focus on input to simulate mobile keyboard opening
    await page.locator('#postal-code').focus();
    await page.waitForTimeout(500);  // Wait for keyboard animation
    
    // Screenshot of critical section
    const checkoutSection = page.locator('.checkout-summary');
    
    await expect(checkoutSection).toHaveScreenshot('checkout-with-keyboard.png', {
      maxDiffPixelRatio: 0.02,  // Very tight tolerance
    });
    
    // Verify button is still visible
    const payButton = page.locator('#pay-button');
    await expect(payButton).toBeVisible();
    await expect(payButton).toBeInViewport();
  });
});
```

---

## Sekcja 2: Maskowanie dynamic content

### Mask patterns

```typescript
test('dashboard with masked dynamic elements', async ({ page }) => {
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  
  // Mask elements that change frequently
  const maskElements = [
    page.locator('.user-name'),  // User's actual name
    page.locator('[data-testid="current-time"]'),  // Time display
    page.locator('.notification-badge'),  // Dynamic count
    page.locator('.ad-banner'),  // Ads
    page.locator('.random-quote'),  // Random quotes
    page.locator('img[src*="avatar"]'),  // User avatars
    page.locator('.live-indicator'),  // Live counters
  ];
  
  await expect(page).toHaveScreenshot('dashboard-masked.png', {
    mask: maskElements,
    maskColor: '#CCCCCC',  // Gray mask color
    animations: 'disabled',  // Disable CSS animations
    disabledAccessibilityViolations: true,  // Don't fail on a11y diffs in zrzuty ekranu
  });
});
```

### Mask by selector patterns

```typescript
test('product page with selective masking', async ({ page }) => {
  await page.goto('/product/test-product');
  await page.waitForLoadState('networkidle');
  
  await expect(page).toHaveScreenshot('product-page.png', {
    // Mask by CSS selectors
    mask: [
      // Dynamic pricing that changes
      page.locator('.price-update-timestamp'),
      // User-specific recommendations
      page.locator('.recommended-for-you'),
      // Ads and promotions
      page.locator('[class*="promo"]'),
      page.locator('[class*="ad-"]'),
      // Date-dependent elements
      page.locator('[data-date]'),
      // Countdown timers
      page.locator('.countdown-timer'),
      // Random testimonials
      page.locator('.testimonial-quote'),
    ],
    
    // Tolerance adjustment for mobile (more variance)
    maxDiffPixelRatio: page.viewportSize()?.width === 375 ? 0.15 : 0.05,
  });
});
```

### Time-based elements

```typescript
// tests/utils/stabilize-dynamic-content.ts

// Replace dynamic time with fixed value before screenshot
export async function stabilizeTimeDisplay(page: Page) {
  await page.evaluate(() => {
    // Find all elements showing time and replace with static value
    const timeElements = document.querySelectorAll('[data-time], .time-display, .timestamp');
    timeElements.forEach(el => {
      el.setAttribute('data-testid', 'time-masked');
      if (el.textContent) {
        el.setAttribute('data-original-time', el.textContent);
        el.textContent = '12:00 PM';
      }
    });
  });
}

// Replace random data with deterministic values
export async function stabilizeRandomContent(page: Page) {
  await page.evaluate(() => {
    // Seed random number generators used by the app
    const mockMathRandom = () => 0.5;  // Deterministic "random"
    
    // Override Math.random for this session
    Object.defineProperty(window, 'Math', {
      value: {
        ...window.Math,
        random: mockMathRandom,
      },
    });
  });
}
```

---

## Sekcja 3: Responsive testing — multi-viewport

### Viewport matrix

```typescript
// tests/visual/responsive.spec.ts
import { test, expect, devices } from '@playwright/test';

const viewports = [
  { name: 'mobile-small', width: 320, height: 568 },    // iPhone SE
  { name: 'mobile-medium', width: 375, height: 667 },    // iPhone 12
  { name: 'mobile-large', width: 414, height: 896 },     // iPhone 11 Pro Max
  { name: 'tablet', width: 768, height: 1024 },          // iPad
  { name: 'desktop-small', width: 1024, height: 768 },   // Small desktop
  { name: 'desktop-medium', width: 1280, height: 720 },  // Standard desktop
  { name: 'desktop-large', width: 1920, height: 1080 },  // Full HD
];

for (const vp of viewports) {
  test(`homepage responsive — ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot(`homepage-${vp.name}.png`, {
      maxDiffPixelRatio: vp.width < 768 ? 0.15 : 0.05,  // Higher tolerance for mobile
    });
  });
}

test.describe('Critical UI — all viewports', () => {
  test('checkout form — mobile keyboard issue detection', async ({ page }) => {
    // Test mobile layout specifically for keyboard overlay issue
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/checkout');
    
    // Fill form to trigger keyboard
    await page.locator('#email').fill('test@example.com');
    await page.locator('#postal-code').fill('00-001');
    
    // Wait for keyboard to open
    await page.waitForTimeout(500);
    
    // Check if pay button is still visible
    const payButton = page.locator('#pay-button');
    const isInViewport = await payButton.isInViewport();
    
    // This is both a functional and visual test
    expect(isInViewport, 'Pay button should be visible above keyboard').toBe(true);
    
    // Screenshot for visual evidence
    const checkoutForm = page.locator('.checkout-form');
    await expect(checkoutForm).toHaveScreenshot('checkout-mobile-keyboard.png', {
      maxDiffPixelRatio: 0.02,  // Very tight — this is critical
    });
  });
  
  test('navigation menu — hamburger on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check hamburger menu exists
    const hamburger = page.locator('.nav-hamburger, .menu-toggle');
    await expect(hamburger).toBeVisible();
    
    // Click to open menu
    await hamburger.click();
    await page.waitForTimeout(300);
    
    // Menu should be visible and not overlap critical content
    const menu = page.locator('.nav-menu, .mobile-menu');
    await expect(menu).toHaveScreenshot('nav-menu-open-mobile.png', {
      maxDiffPixelRatio: 0.05,
    });
  });
});
```

### CSS breakpoint testing

```typescript
test.describe('CSS Breakpoint Responsive', () => {
  const breakpoints = [
    { name: 'xs', width: 320 },
    { name: 'sm', width: 640 },
    { name: 'md', width: 768 },
    { name: 'lg', width: 1024 },
    { name: 'xl', width: 1280 },
  ];
  
  for (const bp of breakpoints) {
    test(`product grid at ${bp.name} breakpoint`, async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: 800 });
      await page.goto('/products');
      await page.waitForLoadState('networkidle');
      
      // Count visible product cards
      const cards = page.locator('.product-card');
      const visibleCount = await cards.count();
      
      // Should have different counts at different breakpoints
      // xs: 1 column, sm: 2 columns, md: 3 columns, etc.
      const expectedMinCards = bp.width >= 1024 ? 3 : bp.width >= 768 ? 2 : 1;
      
      expect(visibleCount).toBeGreaterThanOrEqual(expectedMinCards);
      
      await expect(page.locator('.product-grid')).toHaveScreenshot(
        `product-grid-${bp.name}.png`,
        { maxDiffPixelRatio: 0.05 }
      );
    });
  }
});
```

---

## Sekcja 4: Cross-browser visual testing

### Browser rendering differences

Different browsers render CSS slightly differently. Strategy:

```typescript
// tests/visual/cross-browser.spec.ts
import { test, expect, devices, chromium, firefox, webkit } from '@playwright/test';

test.describe('Cross-browser visual consistency', () => {
  // This test runs on multiple browsers defined in playwright.config.ts
  test('checkout page consistency', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    
    // Higher tolerance for cross-browser (browsers render slightly differently)
    await expect(page).toHaveScreenshot('checkout-page.png', {
      maxDiffPixelRatio: 0.15,  // 15% tolerance — cross-browser variance
    });
  });
  
  test('critical CTA button styling', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Focus on critical element with tight tolerance
    const ctaButton = page.locator('.cta-button, .primary-action');
    
    await expect(ctaButton).toHaveScreenshot('cta-button.png', {
      maxDiffPixelRatio: 0.02,  // Tight — this is brand-critical element
    });
  });
});

// playwright.config.ts — browser projects
export default defineConfig({
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
  
  // Different tolerance per browser
});
```

### Compare across browsers

```typescript
test.describe('Browser-specific rendering', () => {
  test('font rendering differences', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    
    // Get computed styles
    const styles = await page.evaluate(() => {
      const el = document.querySelector('.checkout-title');
      const computed = window.getComputedStyle(el);
      return {
        fontFamily: computed.fontFamily,
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        color: computed.color,
        lineHeight: computed.lineHeight,
      };
    });
    
    console.log('Checkout title styles:', styles);
    
    // Assert styles are consistent (font should be same across browsers)
    expect(styles.fontFamily).toContain('Inter');  // Brand font
    expect(styles.fontWeight).toBe('700');
  });
});
```

---

## Sekcja 5: Storybook integration

### Storybook chromatic testing

```bash
# Install Chromatic (visual testing for Storybook)
npm install -D chromatic @chromatic-com/storybook
```

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@chromatic-com/storybook'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};

export default config;
```

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

// With Chromatic visual testing
const meta: Meta<typeof Button> = {
  component: Button,
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Click me',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Cancel',
    variant: 'secondary',
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading...',
    loading: true,
  },
};
```

### Percy integration

```yaml
# .github/workflows/percy.yml
name: Visual Regression

on:
  push:
    branches: [main]

jobs:
  percy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Storybook
        run: |
          npm ci
          npx storybook build
      
      - name: Run Percy
        run: npx percy storybook:故事book build
        env:
          PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}
```

---

## Sekcja 6: Baseline management

### Update baseline workflow

```bash
# Update baseline for specific tests
npx playwright test tests/visual/ --update-snapshots

# Update specific test
npx playwright test tests/visual/homepage.spec.ts --update-snapshots

# Review changes before committing
git diff tests/visual/
```

### Baseline as code review

```typescript
// tests/visual/baseline-review.ts
import { readdirSync, readFileSync } from 'fs';
import { basename } from 'path';

test.describe('Baseline Review Workflow', () => {
  test('baseline files exist and are valid', async () => {
    const baselineDir = './tests/visual/baselines';
    
    const files = readdirSync(baselineDir);
    
    for (const file of files) {
      if (!file.endsWith('.png')) continue;
      
      const stats = readFileSync(`${baselineDir}/${file}`);
      
      // Check file is not empty
      expect(stats.length, `Baseline ${file} should not be empty`).toBeGreaterThan(1000);
      
      // Check file is valid PNG (starts with PNG signature)
      const signature = stats.slice(0, 8).toString('hex');
      expect(signature).toBe('89504e470d0a1a0a');
    }
  });
  
  test('baseline metadata documented', async () => {
    // Read baseline metadata file
    const metadataPath = './tests/visual/baseline-meta.json';
    
    const fs = await import('fs/promises');
    const content = await fs.readFile(metadataPath, 'utf-8');
    const metadata = JSON.parse(content);
    
    for (const entry of metadata.baselines) {
      expect(entry.createdAt).toBeTruthy();
      expect(entry.createdBy).toBeTruthy();
      expect(entry.purpose).toBeTruthy();
      expect(entry.viewport).toBeTruthy();
    }
  });
});
```

### Baseline metadata structure

```json
// tests/visual/baseline-meta.json
{
  "baselines": [
    {
      "name": "homepage-desktop.png",
      "createdAt": "2024-06-15T10:30:00Z",
      "createdBy": "developer@example.com",
      "purpose": "Core landing page — hero section and CTA buttons",
      "viewport": { "width": 1280, "height": 720 },
      "threshold": 0.05,
      "lastReviewed": "2024-06-15T10:30:00Z",
      "approvedBy": "designer@example.com"
    },
    {
      "name": "homepage-mobile.png",
      "createdAt": "2024-06-15T10:30:00Z",
      "createdBy": "developer@example.com",
      "purpose": "Mobile landing page — responsive hero section",
      "viewport": { "width": 375, "height": 667 },
      "threshold": 0.15,
      "lastReviewed": "2024-06-15T10:30:00Z",
      "approvedBy": "designer@example.com"
    }
  ]
}
```

---

## Sekcja 7: CI integration

```yaml
# .github/workflows/visual-regression.yml
name: Visual Regression Tests

on:
  pull_request:
    paths:
      - 'src/**'  # Only when UI code changes
      - 'tests/visual/**'

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        viewport: ['mobile', 'tablet', 'desktop']
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup
        run: |
          npm ci
          npx playwright install --with-deps
      
      - name: Run visual tests
        run: |
          npx playwright test \
            --project=chromium-${{ matrix.viewport }} \
            --reporter=list \
            2>&1 | tee visual-output.txt
      
      - name: Upload diffs on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: visual-diffs-${{ matrix.viewport }}
          path: |
            test-results/**/*.png
            test-results/**/*.diff.png
          retention-days: 7
      
      - name: Comment PR with visual diffs
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            // Upload diffs and comment on PR
            github.rest.issues.createComment({
              body: '## Visual Regression Detected\n\nVisual tests found differences. Please review the attached diffs.'
            });
  
  percy:
    needs: visual-tests
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Percy
        run: npx percy storybook:build
        env:
          PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}
```

---

## Perspektywa Full Stack Testera

Visual regression testing to obszar, gdzie automation meets design. Jako Full Stack Tester:

**Rozumiesz trade-off**: visual tests są wolniejsze i generują więcej false positives niż functional tests. Używaj strategicznie — only where visual quality matters most.

**Maskujesz smart**: dynamic content (dates, ads, random) musi być masked lub stabilized. Inaczej test generates noise, not signal.

**Zarządzasz baseline jak kodem**: baseline images are code changes. Review, approve, rollback. Don't auto-update without review.

**Priorytetyzujesz**: not every page needs visual testing. Focus on: landing pages, checkout flow, forms, mobile-responsive critical paths.

**Zintegrowane z CI**: visual tests run on UI changes only. Not on every commit. Triggers via path filters save compute.

---

## Podsumowanie

- **When to use**: layout-critical pages, responsive testing, CSS changes, design system updates. Not for content-heavy dynamic pages.
- **toHaveScreenshot**: Playwright built-in screenshot assertion with pixel ratio threshold.
- **Masking**: mask dynamic content (dates, ads, avatars, random data) to avoid false positives.
- **Responsive testing**: viewport matrix from mobile-small to desktop-large. Higher tolerance on mobile (more variance).
- **Cross-browser**: browsers render CSS slightly differently. Use 10-15% tolerance for cross-browser tests, 2-5% for same-browser.
- **Storybook/Percy**: component-level visual testing separate from E2E. Lower cost, faster feedback.
- **Baseline management**: baseline = code change. Review, approve, document metadata.
- **CI triggers**: visual tests on UI code changes only. Not on every commit.

---

## Linki i źródła

- [Playwright Screenshot Testing](https://playwright.dev/docs/test-snapshots) — official screenshot testing guide
- [Visual Testing Best Practices — Applitools](https://applitools.com/blog/visual-testing-best-practices/) — comprehensive visual testing guide
- [Chromatic — Storybook Visual Testing](https://www.chromatic.com/) — visual testing for Storybook
- [Percy — Visual Testing Platform](https://percy.io/) — continuous visual testing
- [Responsive Design Testing — Smashing Magazine](https://www.smashingmagazine.com/2022/05/responsive-design-testing-tools/) — viewport testing strategies
- [CSS Pixel Perfect — Google](https://developers.google.com/web/updates/2021/04/customize-address-bar) — cross-browser CSS rendering