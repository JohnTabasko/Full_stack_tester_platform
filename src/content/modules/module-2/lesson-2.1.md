# Hierarchia przeglądarki, kontekstu i strony w Playwright

W tradycyjnych frameworkach, takich jak Selenium, instancja przeglądarki jest bezpośrednio utożsamiana z pojedynczą sesją testową. Jeśli chcemy odizolować od siebie testy, musimy zamknąć całą przeglądarkę i uruchomić ją na nowo, co generuje olbrzymi koszt czasowy i procesorowy.

Playwright wprowadza rewolucyjną pod kątem wydajności hierarchię obiektów: **Browser (Przeglądarka) -> BrowserContext (Kontekst) -> Page (Strona)**. Zrozumienie tej trójstopniowej hierarchii jest absolutnym fundamentem projektowania stabilnych i szybkich testów współbieżnych.

---

## 1. Trójstopniowa Hierarchia Obiektów

```
+--------------------------------------------------+
|                  BROWSER                         |  <-- Uruchamiany raz na worker
|            (Chromium / Firefox / WebKit)         |
+--------------------------------------------------+
           /                           \
          v                             v
+-----------------------+     +-----------------------+
|    BROWSER CONTEXT    |     |    BROWSER CONTEXT    |  <-- Lekkie profile incognito
| (Sesja 1: Cookies, LS)|     | (Sesja 2: Cookies, LS)|
+-----------------------+     +-----------------------+
           |                             |
           v                             v
+-----------------------+     +-----------------------+
|         PAGE          |     |         PAGE          |  <-- Pojedyncze karty (tabs)
| (Karta 1: Sklep UI)   |     | (Karta 2: Panel Admin)|
+-----------------------+     +-----------------------+
```

### A. Poziom 1: Browser (Przeglądarka)
Reprezentuje fizyczny proces przeglądarki (np. proces Chromium lub Firefox) uruchomiony w systemie operacyjnym. Uruchomienie tego procesu jest stosunkowo drogie pod kątem zasobów. 
*   **Zasada skali**: W Playwright proces przeglądarki uruchamia się **tylko raz na worker (wątek roboczy)** i jest współdzielony przez wszystkie testy wykonywane w tym workerze.

### B. Poziom 2: BrowserContext (Kontekst)
To rewolucyjna, lekka abstrakcja odpowiadająca odizolowanej sesji przeglądarki. Działa dokładnie tak, jak **nowe okno incognito**. 
*   Każdy kontekst posiada własną, całkowicie odizolowaną przestrzeń pamięci: osobne pliki cookie, `localStorage`, `sessionStorage`, pamięć podręczną (cache) oraz uprawnienia.
*   Powołanie nowego kontekstu trwa zaledwie **kilka milisekund** i zużywa minimalne ilości pamięci RAM. Dzięki temu Playwright gwarantuje 100% izolację każdego testu bez spowalniania czasu ich trwania.

### C. Poziom 3: Page (Strona)
Reprezentuje pojedynczą kartę (tab) wewnątrz określonego kontekstu przeglądarki. To na tym poziomie wykonujemy fizyczne akcje, takie jak kliknięcia, wypełnianie formularzy i weryfikacje wizualne. 
*   Jeden kontekst może posiadać wiele stron (kart), co umożliwia testowanie interakcji wielozakładkowych (np. kliknięcie linku otwierającego nową kartę).

---

## 2. Praktyczne zastosowanie: Scenariusze wieloużytkownikowe (Multi-User Sessions)

Dzięki architekturze kontekstów, Playwright pozwala wewnątrz jednego testu symulować interakcję dwóch różnych, całkowicie odizolowanych użytkowników (np. czat między administratorem a klientem) w czasie rzeczywistym:

```typescript
import { test, expect } from '@playwright/test';

test('czat w czasie rzeczywistym między klientem a adminem', async ({ browser }) => {
  // 1. Stwórz niezależny kontekst dla klienta
  const customerContext = await browser.newContext();
  const customerPage = await customerContext.newPage();
  await customerPage.goto('/store');

  // 2. Stwórz niezależny kontekst dla administratora
  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  await adminPage.goto('/admin');

  // Obie sesje są w 100% odizolowane - nie współdzielą ciasteczek ani logowania!
  await customerContext.close();
  await adminContext.close();
});
```

---

## 3. Trwały kontekst (Persistent Context)

W rzadkich przypadkach (np. gdy testujemy rozszerzenia przeglądarki lub gdy aplikacja wymaga specyficznego, trwałego profilu użytkownika na dysku), Playwright umożliwia uruchomienie przeglądarki z tzw. trwałym kontekstem (**Persistent Context**):

```typescript
import { chromium } from '@playwright/test';

const userDataDir = './user-data-dir';
const context = await chromium.launchPersistentContext(userDataDir, {
  headless: false,
  viewport: { width: 1280, height: 720 }
});

const page = context.pages()[0];
await page.goto('https://example.com');
await context.close();
```

---

## 4. Checklista Zrozumienia Hierarchii
- [ ] Czy potrafisz wytłumaczyć, dlaczego kontekst przeglądarki jest szybszy niż uruchamianie nowej przeglądarki?
- [ ] Czy rozumiesz, że ciasteczka i pamięć lokalna nie wyciekają między kontekstami?
- [ ] Czy wiesz, jak przetestować scenariusz wieloużytkownikowy w jednym teście?

---

## Bibliografia
*   *Jean-François Greffier, Practical Playwright Test (2026), Chapter 1: Getting Started (Architecture)*
*   *Faraz K. Kelhini & Butch Mayhew, Hands-On Automated Testing with Playwright (2026), Chapter 3: Browser-Agnostic Testing*