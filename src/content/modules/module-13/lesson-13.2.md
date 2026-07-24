# Testowanie Wydajności Aplikacji i Metryk Web Vitals

Automatyzacja nie powinna ograniczać się wyłącznie do sprawdzania, czy aplikacja działa poprawnie pod kątem funkcjonalnym. Równie krytycznym aspektem jakości jest szybkość jej ładowania i stabilność renderowania graficznego (**Performance & Web Vitals**). Powolna strona powoduje spadek konwersji użytkowników, podnosi współczynnik odrzuceń (Bounce Rate) oraz obniża pozycję witryny w wyszukiwarkach (SEO).

Playwright Test posiada bezpośredni dostęp do silnika przeglądarki, co umożliwia natywny **pomiar czasów nawigacji, ładowania zasobów oraz metryk Web Vitals** wprost z kodu testów.

---

## 1. Wykorzystanie standardowych interfejsów Performance API

Możemy odczytać czasy ładowania bezpośrednio z wbudowanego interfejsu przeglądarki `window.performance`:

```typescript
import { test, expect } from '@playwright/test';

test('audyt czasów ładowania strony (Navigation Timing)', async ({ page }) => {
  await page.goto('/shop');

  // Pobieramy metryki Navigation Timing bezpośrednio z przeglądarki
  const timing = await page.evaluate(() => {
    const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    return {
      duration: entry.duration,               // Całkowity czas ładowania strony
      domContentLoaded: entry.domContentLoadedEventEnd, // Czas parsowania DOM
      responseEnd: entry.responseEnd,         // Czas powrotu nagłówków HTTP z serwera
    };
  });

  console.log(`Całkowity czas ładowania strony: ${timing.duration.toFixed(2)}ms`);

  // Asercja budżetu wydajnościowego: Strona musi załadować się w czasie poniżej 1.5 sekundy!
  expect(timing.duration).toBeLessThan(1500);
});
```

---

## 2. Pomiar metryk Web Vitals (FCP, LCP, CLS)

Metryki **Core Web Vitals** to standardy Google oceniające jakość doświadczeń użytkownika (User Experience):
*   **FCP (First Contentful Paint)**: Czas renderowania pierwszego elementu graficznego (tekst/obraz).
*   **LCP (Largest Contentful Paint)**: Czas wyrenderowania największego elementu na ekranie (np. głównego baneru).
*   **CLS (Cumulative Layout Shift)**: Suma nieoczekiwanych przesunięć elementów graficznych podczas ładowania (miara stabilności wizualnej).

Możemy napisać test zbierający te metryki w ustrukturyzowany sposób:

```typescript
test('audyt Core Web Vitals (LCP & CLS)', async ({ page }) => {
  await page.goto('/article');

  // Wstrzykujemy skrypt nasłuchujący PerformanceObserver bezpośrednio w przeglądarce
  const lcp = await page.evaluate(() => {
    return new Promise<number>((resolve) => {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    });
  });

  console.log(`Largest Contentful Paint (LCP): ${lcp.toFixed(2)}ms`);

  // Asercja: LCP musi być poniżej 2500ms (standard "Good" według Google)
  expect(lcp).toBeLessThan(2500);
});
```

---

## 3. Definiowanie budżetów wydajnościowych (Performance Budgets)

Najlepszą praktyką inżynieryjną jest wdrożenie **Budżetów Wydajnościowych (Performance Budgets)** w rurociągu CI/CD. Jeśli nowo wdrożone skrypty frontendowe spowolnią aplikację powyżej zadeklarowanych limitów, rurociąg zakończy się błędem, nie dopuszczając powolnego kodu na produkcję.

---

## 4. Checklista Testowania Wydajności Aplikacji
- [ ] Czy mierzysz czasy nawigacji bezpośrednio w przeglądarce za pomocą `window.performance`?
- [ ] Czy wdrożyłeś weryfikację krytycznych metryk Web Vitals (LCP, CLS)?
- [ ] Czy zdefiniowałeś i egzekwujesz budżety wydajnościowe (np. czas do pierwszego bajtu < 500 ms) w testach?