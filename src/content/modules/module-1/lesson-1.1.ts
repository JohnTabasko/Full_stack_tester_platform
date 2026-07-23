import type { Lesson } from '../../../renderer/types';
import theory1_1 from './lesson-1.1.md?raw';

export const lesson1_1: Lesson = {
  "id": "1.1",
  "moduleId": 1,
  "title": "Czym jest Playwright?",
  "description": "Architektura Playwrighta, porównanie WebSocket (CDP) z protokołem HTTP Selenium, hierarchia Browser → Context → Page oraz dlaczego Playwright Test eliminuje flakiness.",
  "order": 1,
  "difficulty": "beginner",
  "tags": [
    "playwright",
    "introduction",
    "architecture",
    "e2e",
    "automation",
    "CDP"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji rozumiesz architekturę Playwright, znasz różnicę między WebSocket (CDP) a HTTP, potrafisz odróżnić Playwright Test od Playwright Library oraz wyjaśnić koncepcję izolowanych kontekstów przeglądarki.",
    "theory": theory1_1,
    "codeExamples": [
      `// Przykład testu w Playwright Test (rekomendowany)
import { test, expect } from '@playwright/test';

test('użytkownik widzi stronę główną', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('main')).toBeVisible();
});`,
      `// Przykład użycia surowego Playwright Library (bez runnera)
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.screenshot({ path: 'example.png' });
  await browser.close();
})();`
    ],
    "exercises": [
      {
        "id": "ex-1-1-1",
        "title": "Wyjaśnienie różnic architektonicznych",
        "description": "Opisz własnymi słowami różnice między architekturą Selenium (HTTP JSON Wire Protocol) a architekturą Playwright (WebSocket/CDP)."
      },
      {
        "id": "ex-1-1-2",
        "title": "Szkicowanie hierarchii instancji",
        "description": "Narysuj lub opisz strukturę hierarchii obiektów w Playwright: Browser -> BrowserContext -> Page, wyjaśniając, na którym poziomie zachodzi izolacja sesji użytkownika."
      }
    ],
    "quiz": [
      {
        "id": "q1-1-1",
        "question": "Jaki protokół komunikacji wykorzystuje Playwright do bezpośredniego i szybkiego kontrolowania przeglądarki Chromium?",
        "options": [
          "Chrome DevTools Protocol (CDP) przez WebSockets",
          "HTTP JSON Wire Protocol",
          "gRPC over HTTP/2",
          "REST API over XML"
        ],
        "correctAnswer": 0,
        "explanation": "Playwright nawiązuje dwukierunkowe, stałe połączenie WebSocket i wysyła komendy bezpośrednio za pomocą CDP (lub jego odpowiedników), co eliminuje narzut HTTP i pozwala na natywny auto-waiting."
      },
      {
        "id": "q1-1-2",
        "question": "Czym różni się Playwright Test od Playwright Library?",
        "options": [
          "Playwright Test to kompletny framework testowy z runnerem i asercjami, podczas gdy Playwright Library to surowa biblioteka programistyczna do samej automatyzacji przeglądarki",
          "Playwright Test działa wyłącznie w chmurze, a Library tylko lokalnie",
          "Playwright Library obsługuje więcej języków programowania niż Playwright Test",
          "Nie ma między nimi żadnej różnicy"
        ],
        "correctAnswer": 0,
        "explanation": "Playwright Test rozszerza Library o kompletny silnik wykonawczy, system fixture-ów, asercje oraz narzędzia takie jak Trace Viewer."
      },
      {
        "id": "q1-1-3",
        "question": "Dlaczego Browser Contexts (konteksty przeglądarki) w Playwright są tak wydajne?",
        "options": [
          "Ponieważ działają jak lekkie profile incognito, które powołuje się w ułamkach milisekund, bez konieczności ponownego uruchamiania całego procesu przeglądarki",
          "Ponieważ automatycznie wyłączają obsługę obrazów i CSS",
          "Ponieważ nie potrzebują pamięci RAM",
          "Ponieważ są uruchamiane wyłącznie na serwerach Microsoftu"
        ],
        "correctAnswer": 0,
        "explanation": "Dzięki kontekstom przeglądarki Playwright gwarantuje 100% izolację danych, ciasteczek i cache-u dla każdego testu, bez spowalniania wykonania całego zestawu."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Enterprise-grade design patterns (PageFactory, ApiFactory, BasePage), SOLID & DRY principles, and full stack scaling."
      },
      {
        "title": "Practical Playwright Test (Jean-François Greffier, 2026)",
        "url": "https://doi.org/10.1007/979-8-8688-2160-8",
        "description": "Deep dive into Playwright runner extension, custom expectations, dependent and automatic fixtures, and component testing."
      },
      {
        "title": "Hands-On Automated Testing with Playwright (Faraz K. Kelhini, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Comprehensive guide to browser mechanics, Chrome DevTools Protocol metrics, WCAG accessibility, visual testing, and mobile web."
      },
      {
        "title": "Hands-On Automated Testing with Playwright (Packt, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Chapter 1: Quick Setup Refresher - różnice architektoniczne i ekosystem."
      },
      {
        "title": "Practical Playwright Test (Apress, 2026)",
        "url": "https://doi.org/10.1007/979-8-8688-2160-8",
        "description": "Chapter 1: Getting Started - geneza i przewaga nad konkurencją."
      }
    ],
    "tipsAndTricks": [
      "Zawsze opieraj architekturę testów na zasadach SOLID, unikając przedwczesnej abstrakcji zgodnie z zasadą WET (Write Everything Twice) z podręczników 2026.",
      
      "Nie zamykaj i nie otwieraj przeglądarki ręcznie w testach. Pozwól Playwrightowi zarządzać cyklem życia za pomocą fixture-a page, który automatycznie tworzy nowy, ultra-szybki Browser Context dla każdego testu.",
      "Zawsze wybieraj pakiet @playwright/test do automatyzacji QA. Posiada on natywne, stabilne asercje asynchroniczne i wbudowany system raportowania."
    ],
    "commonMistakes": [
      {
        "mistake": "Traktowanie Playwright jak Selenium i pisanie długich, stałych sleep-ów (np. page.waitForTimeout)",
        "solution": "Pozwól działać wbudowanemu auto-waitingowi, który przed kliknięciem sprawdza, czy element jest widoczny, stabilny i klikalny."
      },
      {
        "mistake": "Mieszanie w pliku testowym komend z biblioteki 'playwright' oraz '@playwright/test'",
        "solution": "Zawsze importuj test i expect wyłącznie z '@playwright/test'."
      }
    ]
  }
};
