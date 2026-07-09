# Testowanie dostępności (WCAG & Axe) — profesjonalny przewodnik

> **Perspektywa Full Stack Testera**
> Internet jest dla wszystkich. Osoby z niepełnosprawnościami wzroku, słuchu, motorycznymi lub poznawczymi polegają na technologiach asystujących (czytniki ekranu, przełączniki, powiększacze), aby korzystać z aplikacji webowych. Jako Full Stack Tester masz nie tylko etyczny, ale często także prawny obowiązek zapewnienia, że Twoja aplikacja jest dostępna. Standard WCAG (Web Content Accessibility Guidelines) definiuje międzynarodowe kryteria dostępności, a narzędzia takie jak Axe automatyzują wykrywanie wielu błędów dostępności w CI/CD. Umiejętność integracji testów accessibility w pipeline to kompetencja, która czyni Cię prawdziwym inżynierem QA, nie tylko "testerem funkcjonalnym".

## Cel lekcji

Po ukończeniu tej lekcji rozumiesz poziomy WCAG (A, AA, AAA) i ich wymagania, potrafisz integrować `@axe-core/playwright` do automatycznych testów dostępności, znasz ręczne techniki weryfikacji (nawigacja klawiaturą, powiększenie, czytnik ekranu), rozumiesz ograniczenia automatyki (Axe wykrywa ~30-40% błędów), konfigurujesz baseline dostępności i zarządzasz naruszeniami, i wiesz, jak interpretować raporty Axe iプライorisować naprawy.

---

## Wprowadzenie do WCAG — czym jest dostępność?

### Web Content Accessibility Guidelines (WCAG)

WCAG to międzynarodowy standard opracowany przez W3C (World Wide Web Consortium), który definiuje, jak tworzyć dostępne treści internetowe. Aktualna wersja to WCAG 2.1 (z rozszerzeniem 2.2 z 2023).

### Cztery zasady pomocnicze (POUR)

Każde kryterium WCAG opiera się na czterech zasadach:

**1. Perceivable (Postrzegalność)** — informacje muszą być dostępne dla wszystkich zmysłów
- Tekst alternatywny dla obrazów (`alt`)
- Napisy dla materiałów wideo
- Kontrast kolorów minimum 4.5:1 dla tekstu
- Możliwość powiększenia tekstu bez utraty treści

**2. Operable (Obsługiwalność)** — interfejs musi być obsługiwany przez wszystkich
- Pełna nawigacja klawiaturą (bez myszy)
- Czas na czytanie treści (nie migające animacje)
- Możliwość pauzy automatycznych mediów
- Brak pułapek klawiaturowych (focus trap bez wyjścia)

**3. Understandable (Zrozumiałość)** — informacje muszą być zrozumiałe
- Jasny, przewidywalny sposób działania
- Mechanizmy korekty błędów (sugestie poprawek)
- Czytelna terminologia i etykiety

**4. Robust (Solidność)** — treść musi działać z technologiami asystującymi
- Poprawny HTML semantyczny
- Kompatybilność z czytnikami ekranu (ARIA labels, roles)
- Poprawna struktura nagłówków (h1 → h2 → h3)

### Poziomy zgodności

| Poziom | Opis | Wymagania prawne | Pokrycie przez Axe |
|---|---|---|---|
| **A** (minimum) | Podstawowe — bez tego treść jest nieosiągalna | Często wymagane przez prawo | ~70% automatycznych |
| **AA** (standard) | Zalecane — realna użyteczność dla większości | Standard w sektorze publicznym, finansowym | ~50% automatycznych |
| **AAA** (enhanced) | Wysokie — najlepsza dostępność | Rzadko wymagane w całości | ~30% automatycznych |

**Polskie regulacje**: Ustawa o dostępności cyfrowej (2019) wymaga zgodności z WCAG 2.1 poziom AA dla:
- Stron publicznych instytucji (urzędy, szkoły, szpitale)
- Sklepów internetowych z obrotem >500k PLN
- Aplikacji mobilnych sektora publicznego

---

## Automatyzacja z @axe-core/playwright

### Instalacja i konfiguracja

```bash
npm install -D @axe-core/playwright
```

### Podstawowe użycie

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Dostępność strony głównej', () => {
  
  test('brak krytycznych naruszeń WCAG AA', async ({ page }) => {
    await page.goto('/');
    
    // Konfiguracja skanera Axe
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])  // Tagi WCAG do sprawdzenia
      .include('#main-content')                      // Obszar do skanowania (opcjonalnie)
      .exclude('.advertisement')                     // Wyklucz reklamy (opcjonalnie)
      .analyze();
    
    // Raportowanie naruszeń
    if (accessibilityScanResults.violations.length > 0) {
      console.log('=== Naruszenia dostępności ===');
      for (const violation of accessibilityScanResults.violations) {
        console.log(`[${violation.impact}] ${violation.description}`);
        console.log(`  IDs: ${violation.id}`);
        console.log(`  Element: ${violation.nodes[0]?.html}`);
        for (const node of violation.nodes) {
          console.log(`  - ${node.html}`);
        }
      }
    }
    
    // Asercja — brak naruszeń
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

### Analiza konkretnych komponentów

```typescript
test('modal dialog ma poprawną dostępność', async ({ page }) => {
  await page.goto('/checkout');
  
  // Otwórz modal
  await page.getByRole('button', { name: 'Wybierz metodę płatności' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  
  // Skanuj tylko modal (nie całą stronę)
  const modalAccessibility = await new AxeBuilder({ page })
    .include('[role="dialog"]')  // Tylko modal
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  
  expect(modalAccessibility.violations).toEqual([]);
});
```

### Raportowanie z HTML

```typescript
test('dostępność formularza kontaktowego', async ({ page }) => {
  await page.goto('/contact');
  
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  
  // Generuj raport HTML z naruszeniami
  for (const violation of results.violations) {
    // Dla każdego naruszenia: ID, opis, wpływ, elementy
    const nodes = violation.nodes.map(n => n.html).join(', ');
    console.log(
      `[${violation.impact.toUpperCase()}] ${violation.id}: ${violation.description}`
    );
    console.log(`  Affects: ${nodes}`);
    console.log(`  Help: ${violation.helpUrl}`);
    console.log('');
  }
  
  // Zweryfikuj brak krytycznych naruszeń
  const criticalViolations = results.violations.filter(
    v => v.impact === 'critical' || v.impact === 'serious'
  );
  
  expect(criticalViolations).toEqual([]);
});
```

---

## Ręczne techniki weryfikacji dostępności

### Automatycja wyłapuje ~30-40% błędów. Resztę musisz sprawdzić ręcznie.

### Test 1: Nawigacja klawiaturą (Keyboard Navigation)

```typescript
test('pełna nawigacja strony klawiaturą', async ({ page }) => {
  await page.goto('/');
  
  // Rozpocznij od początku strony (Tab przenosi focus do pierwszego elementu)
  await page.keyboard.press('Tab');  // Pierwszy interaktywny element
  
  // Przechodź przez wszystkie elementy Tab-em
  let tabCount = 0;
  const focusedElements: string[] = [];
  
  while (tabCount < 30) { // Limit 30 Tabów — rozsądny dla większości stron
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? `${el.tagName} [${el.getAttribute('role') || 'no-role'}]: ${el.textContent?.trim().slice(0, 30)}` : 'none';
    });
    
    if (focusedElements.includes(focused)) {
      // Zapętlenie — nic nowego, zakończ
      console.log(`Zapętlenie na: ${focused}`);
      break;
    }
    
    focusedElements.push(focused);
    console.log(`Tab ${tabCount + 1}: ${focused}`);
    
    // Jeśli element jest przyciskiem, spróbuj go aktywować
    const isButton = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.getAttribute('role') === 'button' || el?.tagName === 'BUTTON';
    });
    
    if (isButton) {
      await page.keyboard.press('Enter'); // Aktywuj klawiszem Enter
      await page.waitForTimeout(500);     // Poczekaj na reakcję
    }
    
    await page.keyboard.press('Tab');
    tabCount++;
  }
  
  // Weryfikacja: czy focus jest widoczny?
  await expect(page.locator(':focus')).toBeVisible();
});
```

### Test 2: Weryfikacja kontrastu kolorów

```typescript
test('weryfikacja kontrastu kolorów tekstu', async ({ page }) => {
  await page.goto('/products');
  
  // Pobierz wszystkie elementy tekstowe
  const elements = await page.evaluate(() => {
    const textElements = document.querySelectorAll('p, span, a, h1, h2, h3, h4, h5, h6, button, label');
    return Array.from(textElements).map(el => {
      const style = getComputedStyle(el);
      return {
        tag: el.tagName,
        text: el.textContent?.trim().slice(0, 50),
        color: style.color,         // np. "rgb(255, 255, 255)"
        background: style.backgroundColor,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
      };
    });
  });
  
  // Kontrast ratio to stosunek luminancji dwóch kolorów
  // Minimum WCAG AA dla normalnego tekstu: 4.5:1
  // Minimum WCAG AA dla dużego tekstu (18pt+): 3:1
  for (const el of elements.slice(0, 20)) { // Sprawdź pierwsze 20
    console.log(`${el.tag}: "${el.text}" — ${el.color} / ${el.background}`);
    // Użyj narzędzia typu axe DevTools lub Lighthouse do dokładnej analizy
  }
});
```

### Test 3: Powiększenie 200% (Zoom)

```typescript
test('strona jest czytelna przy powiększeniu 200%', async ({ page }) => {
  // Ustaw viewport na 1280x720 i zoom 200%
  await page.setViewportSize({ width: 640, height: 360 }); // 200% z 1280x720
  // Lub użyj CSS transform:
  await page.addStyleTag({
    content: `body { transform: scale(2); transform-origin: top left; }`,
  });
  
  await page.goto('/products');
  
  // Sprawdź, czy treść jest czytelna:
  // 1. Czy tekst jest obcięty przez container?
  const overflow = await page.evaluate(() => {
    const body = document.body;
    return {
      scrollWidth: body.scrollWidth,
      scrollHeight: body.scrollHeight,
      clientWidth: body.clientWidth,
      clientHeight: body.clientHeight,
      hasOverflow: body.scrollWidth > body.clientWidth || body.scrollHeight > body.clientHeight,
    };
  });
  
  console.log('Czy strona wymaga przewijania przy 200%?', overflow.hasOverflow);
  // Przewijanie jest OK, ale treść nie powinna być ukryta
});
```

---

## Konfiguracja baseline i zarządzanie naruszeniami

### Przypadek: Istniejący projekt z wieloma naruszeniami

Gdy masz projekt z 200 naruszeniami accessibility, nie próbuj naprawić wszystkiego na raz. Zbuduj baseline i pilnuj, aby nie dochodziły nowe:

```typescript
// playwright.config.ts
export default defineConfig({
  // Wyklucz znane naruszenia — pilnuj tylko, by nie było nowych
  projects: [
    {
      name: 'accessibility-baseline',
      testMatch: /.*\.spec\.ts/,
      use: {
        // Automatycznie wyklucz wszystkie znane naruszenia
      },
    },
  ],
});
```

```typescript
// test-accessibility.spec.ts — dedykowany plik testów dostępności
test.describe('Accessibility Baseline', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });
  
  test('brak NOWYCH naruszeń dostępności (baseline check)', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    // Filtruj tylko NOWE naruszenia (nie znane z baseline)
    const newViolations = results.violations.filter(v => {
      const knownIds = KNOWN_ACCESSIBILITY_ISSUES; // Zdefiniowane w bazie wiedzy
      return !knownIds.includes(v.id);
    });
    
    if (newViolations.length > 0) {
      console.log('⚠️ NOWE naruszenia dostępności:');
      newViolations.forEach(v => {
        console.log(`  [${v.impact}] ${v.id}: ${v.description}`);
      });
    }
    
    expect(newViolations).toEqual([]);
  });
});

// Lista znanych naruszeń (utrzymywana jako techniczny dług)
const KNOWN_ACCESSIBILITY_ISSUES = [
  'color-contrast',       // Zgłoszone jako TECH-DEBT-001
  'aria-required-attr',   // Zgłoszone jako TECH-DEBT-002
  'label-content-accessible', // Zgłoszone jako TECH-DEBT-003
];
```

### Priorytetyzacja napraw

Nie wszystkie naruszenia są sobie równe. Priorytetyzuj według wpływu:

| Wpływ Axe | WCAG poziom | Czas naprawy | Wartość biznesowa |
|---|---|---|---|
| **critical** | A | Godzina | Natychmiast napraw |
| **serious** | A/AA | 2-4h | Priorytet wysoki |
| **moderate** | AA | Dzień | Zaplanuj w sprincie |
| **minor** | AAA | Tydzień | Niższy priorytet |

---

## Perspektywa Full Stack Testera — accessibility jako standard

Dostępność to nie jest "dodatkowy feature" — to fundamentalny wymóg jakościowy. Aplikacja, która nie jest dostępna, wyklucza użytkowników i naraża firmę na ryzyko prawne.

Umiejętność integracji Axe w CI/CD, interpretacji raportów accessibility i priorytetyzacji napraw to kompetencja, która czyni Cię pełnoprawnym inżynierem QA — nie tylko "testerem funkcjonalnym".

---

## Podsumowanie

1. **WCAG 2.1/2.2**: Cztery zasady (POUR), trzy poziomy (A, AA, AAA).
2. **@axe-core/playwright**: Automatyczne skanowanie dostępności w testach.
3. **Ręczne testy**: Nawigacja klawiaturą, kontrast kolorów, powiększenie 200%.
4. **Ograniczenia Axe**: Automatyzacja wykrywa ~30-40% błędów — reszta wymaga testów manualnych.
5. **Baseline**: Nie próbuj naprawić wszystkiego na raz — buduj bazę wiedzy i pilnuj, by nie było nowych naruszeń.

---

## Linki i źródła

- [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
- [Axe Core Documentation](https://www.deque.com/axe/)
- [WCAG 2.1 — W3C Official](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Lighthouse Accessibility Audits](https://developer.chrome.com/docs/lighthouse/accessibility/)