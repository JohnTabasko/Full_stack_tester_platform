# Optymalizacja wydajności testów, CDP i profilowanie

> **Perspektywa Full Stack Testera**
> Test suite trwający 40 minut to nie problem techniczny — to problem kulturowy. Programiści zaczynają omijać testy, QA traci wiarygodność, a feedback loop staje się bezużyteczny. Wydajność testów nie jest tylko inżynierskim zadaniem optymalizacji — to fundament developer experience i biznesowej efektywności zespołu. 

Wydajne testy Playwright, jak wyjaśniają Kelhini i Mayhew w książce *"Hands-On Automated Testing with Playwright" (2026)*, wymagają **aktywnego zarządzania ruchem sieciowym** oraz stosowania nowoczesnych metod profilowania za pomocą **Chrome DevTools Protocol (CDP)** do namierzania wycieków pamięci i wąskich gardeł renderowania.

---

## 1. Blokowanie ciężkich zasobów sieciowych przez `page.route`

Większość czasu trwania testu to oczekiwanie na pobranie i wyrenderowanie ciężkich zasobów, które nie mają żadnego wpływu na stabilność logiki testu: obrazy, wideo, czcionki webowe, skrypty analityczne, piksele śledzące i reklamy.

Blokując te żądania na poziomie sieciowym, możemy skrócić czas ładowania strony nawet o **50-70%**, oszczędzając jednocześnie pamięć RAM procesów workerów:

```typescript
import { test } from '@playwright/test';

test('zoptymalizowany zakup produktu', async ({ page }) => {
  // Blokowanie obrazów, czcionek i skryptów analitycznych
  await page.route('**/*', (route) => {
    const resourceType = route.request().resourceType();
    const url = route.request().url();

    if (
      ['image', 'media', 'font'].includes(resourceType) ||
      url.includes('google-analytics.com') ||
      url.includes('facebook.net')
    ) {
      // Błyskawicznie przerwij żądanie bez pobierania danych
      route.abort('blockedbyclient');
    } else {
      route.continue();
    }
  });

  await page.goto('/shop');
  // ... test trwa dalej bez marnowania czasu na rendering grafik
});
```

---

## 2. Profilowanie metryk i pamięci za pomocą CDP (Chrome DevTools Protocol)

Gdy testy stają się powolne lub niestabilne (flaky) z powodu wycieków pamięci na frontendzie, tradycyjne logi nie wystarczą. Playwright umożliwia bezpośrednie otwarcie sesji **CDP (Chrome DevTools Protocol)** i pobranie dokładnych metryk wydajności przeglądarki Chromium.

```typescript
import { test, expect } from '@playwright/test';

test('pomiar wydajności i zużycia pamięci strony', async ({ page }) => {
  // 1. Inicjalizacja sesji CDP (Książka 1, Rozdział 6)
  const client = await page.context().newCDPSession(page);
  
  // Włączenie zbierania metryk wydajności
  await client.send('Performance.enable');

  await page.goto('/dashboard');

  // Pobranie metryk systemowych
  const performanceMetrics = await client.send('Performance.getMetrics');
  
  // Wyszukaj zużycie pamięci (JS Heap Size) i czas procesora (Task Duration)
  const jsHeapMetric = performanceMetrics.metrics.find(m => m.name === 'JSHeapUsedSize');
  const jsHeapMB = jsHeapMetric ? (jsHeapMetric.value / 1024 / 1024).toFixed(2) : '0';
  
  console.log(`Zużycie pamięci JS Heap: ${jsHeapMB} MB`);

  // Wykrycie potencjalnego wycieku pamięci (np. powyżej 150 MB)
  expect(Number(jsHeapMB)).toBeLessThan(150);
});
```

---

## 3. Optymalizacja Artefaktów (Trace, Screenshot, Video)

Generowanie zrzutów ekranu (`screenshot`), nagrań wideo oraz plików śledzenia (`trace`) to olbrzymi narzut wydajnościowy (overhead) dla dysku i procesora na maszynach CI. 

### Rekomendowana konfiguracja `playwright.config.ts` (Book 1 & 2):
Zamiast generować pliki diagnostyczne dla każdego testu, włącz je **tylko w przypadku niepowodzenia pierwszego podejścia**:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    // Generuj trace tylko przy pierwszej próbie ponowienia po błędzie
    trace: 'on-first-retry',
    
    // Zapisz screenshoty i wideo wyłącznie przy błędach
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  // Wymuś pełną izolację i współbieżność
  fullyParallel: true,
});
```

---

## 4. Checklista Wydajnościowa Frameworka
- [ ] Czy w konfiguracji CI masz włączoną współbieżność (`fullyParallel: true`) z optymalną liczbą workerów?
- [ ] Czy blokujesz pobieranie ciężkich multimediów i skryptów śledzących w testach, które ich nie weryfikują?
- [ ] Czy diagnostykę (trace, video) ograniczyłeś wyłącznie do przypadków błędów (`on-first-retry` / `only-on-failure`)?
- [ ] Czy używasz mechanizmu **Sharding** do rozdzielenia zestawu testów na kilka maszyn wirtualnych w CI?

---

## Bibliografia i Linki
*   *Faraz K. Kelhini & Butch Mayhew, Hands-On Automated Testing with Playwright (2026), Chapter 6: Test Parallelization and Performance Optimization*
*   *Jean-François Greffier, Practical Playwright Test (2026), Chapter 5: Make It Fast*
*   [Oficjalna Dokumentacja Playwright Test Parallelism](https://playwright.dev/docs/test-parallel)
