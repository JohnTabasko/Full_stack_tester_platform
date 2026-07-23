import type { Lesson } from '../../../renderer/types';
import theory13_1 from './lesson-13.1.md?raw';

export const lesson13_1: Lesson = {
  "id": "13.1",
  "moduleId": 13,
  "title": "Optymalizacja wydajności testów, CDP i profilowanie",
  "description": "Zrozum wąskie gardła w testach Playwright. Opanuj blokowanie ciężkich zasobów sieciowych przez page.route, profilowanie pamięci i metryk za pomocą Chrome DevTools Protocol (CDP) oraz optymalizację zbierania artefaktów.",
  "order": 1,
  "difficulty": "advanced",
  "tags": [
    "performance",
    "CDP",
    "network-mocking",
    "parallelism",
    "optymalizacja",
    "SOLID"
  ],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz optymalizować wydajność zestawów testowych w Playwright, wdrażać blokowanie zasobów sieciowych, przeprowadzać diagnostykę pamięci i wydajności za pomocą protokołu CDP oraz prawidłowo konfigurować zbieranie artefaktów w CI.",
    "theory": theory13_1,
    "codeExamples": [
      `// Przykład blokowania ciężkich zasobów sieciowych (Książka 1 - Kelhini)
await page.route('**/*', (route) => {
  const type = route.request().resourceType();
  if (['image', 'media', 'font'].includes(type)) {
    route.abort('blockedbyclient');
  } else {
    route.continue();
  }
});`,
      `// Inicjalizacja sesji CDP w celu pobrania JS Heap Size (Książka 1, Rozdział 6)
const client = await page.context().newCDPSession(page);
await client.send('Performance.enable');
const metrics = await client.send('Performance.getMetrics');
const jsHeap = metrics.metrics.find(m => m.name === 'JSHeapUsedSize')?.value;`
    ],
    "exercises": [
      {
        "id": "ex-13-1-1",
        "title": "Wdrożenie blokowania mediów na poziomie projektu",
        "description": "Napisz fixturę o nazwie \`fastPage\`, która automatycznie rejestruje regułę \`page.route\` blokującą pobieranie grafik, wideo i czcionek, a następnie użyj jej w wybranym teście."
      },
      {
        "id": "ex-13-1-2",
        "title": "Pomiar wycieków pamięci z CDP",
        "description": "Zaimplementuj test, który przechodzi przez kilka kroków w aplikacji typu SPA. Na każdym kroku odpytaj sesję CDP o metrykę \`JSHeapUsedSize\` i rzuć błąd asercji, jeśli rozmiar pamięci wzrośnie o więcej niż 50% w stosunku do stanu początkowego."
      },
      {
        "id": "ex-13-1-3",
        "title": "Konfiguracja Shardingu w GitHub Actions",
        "description": "Napisz fragment pliku konfiguracyjnego workflow dla GitHub Actions, który rozbija wykonanie zestawu testów na 4 niezależne maszyny (shardy), łącząc na koniec ich raporty w jeden spójny plik HTML."
      }
    ],
    "quiz": [
      {
        "id": "q13-1-1",
        "question": "W jaki sposób blokowanie zasobów sieciowych typu 'image' lub 'font' wpływa na testy UI in Playwright?",
        "options": [
          "Skraca czas ładowania stron i renderowania nawet o 50-70%, drastycznie zmniejszając narzut procesora i pamięci RAM",
          "Całkowicie uniemożliwia nawigację do witryn",
          "Automatycznie rzuca błąd asercji w teście",
          "Wymaga każdorazowej instalacji rozszerzeń Chrome"
        ],
        "correctAnswer": 0,
        "explanation": "Pobieranie i renderowanie ciężkich obrazów, czcionek czy reklam to główny narzut czasowy. Ich zablokowanie za pomocą page.route znacznie przyspiesza wykonanie testów bez wpływu na ich logikę funkcjonalną."
      },
      {
        "id": "q13-1-2",
        "question": "Jaką metrykę możemy zbadać korzystając z protokołu CDP (Chrome DevTools Protocol) w teście Playwright?",
        "options": [
          "JSHeapUsedSize (rozmiar sterty pamięci JavaScript), czas trwania zadań procesora (Task Duration) oraz pokrycie kodu JS",
          "Wyłącznie liczbę kliknięć użytkownika na stronie",
          "Prędkość połączenia internetowego dostawcy usług",
          "Adres IP maszyny CI"
        ],
        "correctAnswer": 0,
        "explanation": "Połączenie CDP umożliwia bezpośredni dostęp do wewnętrznych metryk Chromium, pozwalając diagnozować wycieki pamięci (JSHeapUsedSize) i obciążenie procesora bezpośrednio w kodzie testów."
      },
      {
        "id": "q13-1-3",
        "question": "Jakie ustawienie zbierania artefaktów diagnostycznych (trace, video, screenshot) jest optymalne dla rurociągów CI pod kątem wydajności?",
        "options": [
          "Zapisywanie wyłącznie w przypadku niepowodzenia (np. retain-on-failure lub on-first-retry), aby uniknąć marnowania czasu CPU i miejsca na dysku",
          "Zapisywanie absolutnie wszystkiego dla każdego testu (on)",
          "Całkowite wyłączenie zbierania jakichkolwiek artefaktów (off)",
          "Generowanie wyłącznie nagrań wideo w rozdzielczości 4K"
        ],
        "correctAnswer": 0,
        "explanation": "Generowanie diagnostyki obciąża wątki robocze i wydłuża testy. Konfigurowanie ich pod kątem zbierania tylko w razie niepowodzenia (failure) optymalizuje czas działania rurociągów CI."
      }
    ],
    "references": [
      {
        "title": "Hands-On Automated Testing with Playwright (Faraz K. Kelhini, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Chapter 6: Test Parallelization and Performance Optimization - CDP & network blocking."
      },
      {
        "title": "Practical Playwright Test (Jean-François Greffier, 2026)",
        "url": "https://doi.org/10.1007/979-8-8688-2160-8",
        "description": "Chapter 5: Make It Fast - parallel execution."
      }
    ],
    "tipsAndTricks": [
      "Stosuj page.route do blokowania Google Analytics, pikseli śledzących i reklam w rurociągu CI. Skróci to czas trwania testu i zapobiegnie zanieczyszczeniu rzeczywistych danych statystycznych.",
      "Otwieraj CDP tylko tam, gdzie zachodzi podejrzenie wycieku pamięci (np. w dużych aplikacjach SPA), aby nie dodawać zbędnego overheadu do wszystkich zdrowych testów."
    ],
    "commonMistakes": [
      {
        "mistake": "Generowanie pełnych nagrań wideo i śladów (trace) dla każdego pomyślnego testu w CI",
        "solution": "Skonfiguruj trace: 'on-first-retry' oraz video: 'retain-on-failure' w pliku playwright.config.ts."
      },
      {
        "mistake": "Mieszanie testów ze stanami współdzielonymi (brak izolacji danych) przy włączonym fullyParallel",
        "solution": "Upewnij się, że każdy test tworzy własnego unikalnego użytkownika i dane przed uruchomieniem."
      }
    ]
  }
};
