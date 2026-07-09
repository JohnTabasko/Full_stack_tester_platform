import type { Lesson, Module } from '../../renderer/types';

export const allModules: Module[] = [
  {
    "id": 1,
    "title": "Wprowadzenie i konfiguracja",
    "description": "Poznaj Playwright - od podstaw architektury po pełną konfigurację środowiska i pierwszy test",
    "level": "beginner",
    "icon": "🚀",
    "order": 1,
    "lessons": [
      {
        "id": "1.1",
        "moduleId": 1,
        "title": "Czym jest Playwright?",
        "description": "Poznaj historię, architekturę i ekosystem Playwright oraz porównaj go z konkurencją",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Wyjaśnić genezę i historię Playwright\n- Porównać Playwright z Selenium, Cypress i Puppeteer\n- Opisać architekturę client-server Playwrighta\n- Zidentyfikować kluczowe cechy i możliwości narzędzia\n- Rozróżnić browser engines i ich zastosowania\n- Nawigować po ekosystemie narzędzi Playwright",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 1,
        "prerequisites": [],
        "tags": [
          "wprowadzenie",
          "architektura",
          "porównanie",
          "browser-engines",
          "ekosystem"
        ],
        "difficulty": "beginner"
      },
      {
        "id": "1.2",
        "moduleId": 1,
        "title": "Instalacja i konfiguracja środowiska",
        "description": "Zainstaluj Playwright, skonfiguruj TypeScript i przygotuj środowisko do pisania testów",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Zainstalować Playwright na różnych systemach operacyjnych\n- Skonfigurować TypeScript do pracy z Playwright\n- Skonfigurować VS Code do efektywnego pisania testów\n- Zarządzać zmiennymi środowiskowymi\n- Rozwiązywać typowe problemy z instalacją\n- Aktualizować Playwright bezpiecznie",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 2,
        "prerequisites": [],
        "tags": [
          "instalacja",
          "konfiguracja",
          "npm",
          "typescript",
          "vscode",
          "troubleshooting"
        ],
        "difficulty": "beginner"
      },
      {
        "id": "1.3",
        "moduleId": 1,
        "title": "Struktura projektu Playwright",
        "description": "Poznaj profesjonalną organizację projektu testowego, konwencje nazewnictwa i najlepsze praktyki",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Zorganizować projekt testowy zgodnie z najlepszymi praktykami\n- Stosować konwencje nazewnictwa\n- Wybrać strategię organizacji testów\n- Zarządzać danymi testowymi i konfiguracjami\n- Przygotować projekt do współpracy zespołowej",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 3,
        "prerequisites": [],
        "tags": [
          "struktura",
          "organizacja",
          "page-object",
          "naming",
          "monorepo",
          "git"
        ],
        "difficulty": "beginner"
      },
      {
        "id": "1.4",
        "moduleId": 1,
        "title": "Konfiguracja playwright.config.ts — omówienie szczegółowe",
        "description": "Opanuj każdą opcję konfiguracji Playwright - od timeoutów po zaawansowane projekty i reportery",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Skonfigurować globalne opcje testów\n- Zarządzać timeoutami dla różnych scenariuszy\n- Tworzyć multi-project configuration (desktop + mobile)\n- Konfigurować reportery (HTML, JSON, JUnit)\n- Optymalizować wydajność (workers, sharding)\n- Tworzyć environment-specific configs",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 4,
        "prerequisites": [],
        "tags": [
          "konfiguracja",
          "timeout",
          "projects",
          "reporter",
          "performance",
          "bezpieczeństwo"
        ],
        "difficulty": "beginner"
      },
      {
        "id": "1.5",
        "moduleId": 1,
        "title": "Pierwszy test — anatomia testu Playwright",
        "description": "Napisz i zrozum swój pierwszy test Playwright - od importu po asercje i debugowanie",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Napisać kompletny test Playwright od podstaw\n- Używać \\`test.describe\\` do grupowania testów\n- Stosować hooki (\\`beforeEach\\`, \\`afterEach\\`)\n- Pisać asercje web-first\n- Debugować testy używając Inspector i --debug\n- Unikać najczęstszych błędów początkujących",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 5,
        "prerequisites": [],
        "tags": [
          "pierwszy-test",
          "syntax",
          "asercje",
          "debugging",
          "fiksturas",
          "hooks"
        ],
        "difficulty": "beginner"
      }
    ]
  },
  {
    "id": 2,
    "title": "Podstawy Playwright",
    "description": "Opanuj hierarchię przeglądarka/kontekst/strona, selektory, lokatory, nawigację, akcje i testy wizualne",
    "level": "beginner",
    "icon": "⚙️",
    "order": 2,
    "lessons": [
      {
        "id": "2.1",
        "moduleId": 2,
        "title": "Przeglądarka, kontekst i strona",
        "description": "Zrozum hierarchię przeglądarka → kontekst → strona oraz zarządzania instancjami przeglądarki",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Wyjaśnić hierarchię przeglądarka → kontekst → strona\n- Uruchamiać przeglądarkę z różnymi opcjami\n- Tworzyć konteksty przeglądarki i zarządzać nimi\n- Pracować z wieloma stronami w jednym kontekście\n- Używać trwałego kontekstu i zapisanego stanu sesji\n- Projektować pulę przeglądarek z myślą o wydajności",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 1,
        "prerequisites": [],
        "tags": [
          "browser",
          "context",
          "page",
          "hierarchia",
          "launch",
          "izolacja"
        ],
        "difficulty": "beginner"
      },
      {
        "id": "2.2",
        "moduleId": 2,
        "title": "Nawigacja",
        "description": "Opanuj page.goto(), strategie waitUntil, nawigację w aplikacjach SPA i obsługę błędów",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Używać page.goto() z wszystkimi opcjami waitUntil\n- Obsługiwać różne metody nawigacji (reload, goBack, goForward)\n- Nawigować w aplikacjach SPA z routingiem po stronie klienta\n- Obsługiwać błędy nawigacji: timeout, SSL i 404\n- Optymalizować nawigację przez blokowanie zasobów",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 2,
        "prerequisites": [],
        "tags": [
          "nawigacja",
          "goto",
          "waitUntil",
          "SPA",
          "url",
          "error-handling"
        ],
        "difficulty": "beginner"
      },
      {
        "id": "2.3",
        "moduleId": 2,
        "title": "Selektory — szczegółowe omówienie",
        "description": "Opanuj strategie selektorów: role, tekst, etykiety, identyfikatory testowe, CSS, XPath i selektory layoutu",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Wybrać odpowiednią strategię selektora dla każdej sytuacji\n- Budować odporne selektory\n- Używać reguły priorytetu: identyfikator testowy > rola > etykieta > placeholder > tekst > CSS > XPath\n- Pracować z iframe i Shadow DOM\n- Debugować problemy z selektorami",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 3,
        "prerequisites": [],
        "tags": [
          "selektory",
          "CSS",
          "XPath",
          "text",
          "role",
          "testid",
          "shadow-dom",
          "iframe"
        ],
        "difficulty": "beginner"
      },
      {
        "id": "2.4",
        "moduleId": 2,
        "title": "Automatyczne oczekiwanie i limity czasu",
        "description": "Zrozum automatyczne oczekiwanie, sprawdzanie gotowości elementu do akcji i konfigurację limitów czasu",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Wyjaśnić jak działa automatyczne oczekiwanie Playwrighta\n- Rozumieć sprawdzanie gotowości elementu do akcji dla każdej akcji\n- Konfigurować timeouty na różnych poziomach\n- Unikać antywzorców (waitForTimeout)\n- Radzić sobie z warunkami wyścigu",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 4,
        "prerequisites": [],
        "tags": [
          "auto-waiting",
          "timeout",
          "actionability",
          "wait",
          "race-conditions"
        ],
        "difficulty": "beginner"
      },
      {
        "id": "2.5",
        "moduleId": 2,
        "title": "API lokatorów",
        "description": "API lokatorów: tworzenie, akcje, zapytania, filtrowanie, kolekcje i asercje",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Tworzyć lokatory wszystkimi metodami (getByRole, getByText, locator)\n- Wykonywać wszystkie typy akcji na lokatorach\n- Filtrować i łączyć lokatory\n- Pracować z kolekcjami elementów (all, nth, count)\n- Używać wszystkich asercji dla lokatorów",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 5,
        "prerequisites": [],
        "tags": [
          "lokatory",
          "API",
          "actions",
          "filtering",
          "asercje",
          "collections"
        ],
        "difficulty": "beginner"
      },
      {
        "id": "2.6",
        "moduleId": 2,
        "title": "Akcje podstawowe",
        "description": "Opanuj wszystkie aspekty klikania, wypełniania formularzy i pisania na klawiaturze",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Używać click z wszystkimi opcjami (button, clickCount, modifiers, position, force, trial)\n- Wypełniać formularze za pomocą fill(), type() i clear()\n- Symulować klawiaturę z press() i skrótami klawiszowymi\n- Obsługiwać różne typy pól formularzy\n- Debugować problemy z akcjami",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 6,
        "prerequisites": [],
        "tags": [
          "click",
          "fill",
          "type",
          "formularze",
          "klawiatura",
          "input"
        ],
        "difficulty": "beginner"
      },
      {
        "id": "2.7",
        "moduleId": 2,
        "title": "Akcje zaawansowane",
        "description": "Opanuj zaawansowane kontrolki: checkboxy, przyciski radio, listy wyboru, wysyłanie i pobieranie plików",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Obsługiwać checkboxy, przyciski radio i przełączniki\n- Pracować z natywnymi i niestandardowymi listami wyboru\n- Wysyłać i pobierać pliki\n- Testować wybór daty, wybór koloru i suwaki",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 7,
        "prerequisites": [],
        "tags": [
          "checkbox",
          "select",
          "dropdown",
          "file-upload",
          "download",
          "custom-components"
        ],
        "difficulty": "beginner"
      },
      {
        "id": "2.8",
        "moduleId": 2,
        "title": "Najechanie, fokus oraz przeciąganie i upuszczanie",
        "description": "Opanuj interakcje myszy i klawiatury: najechanie, fokus, przeciąganie i upuszczanie oraz zdarzenia dotykowe",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Testować efekty najechania kursorem: tooltipy, menu i podglądy\n- Zarządzać focusem i testować nawigację klawiaturą\n- Implementować operacje przeciągania i upuszczania\n- Testować gesty dotykowe na urządzeniach mobilnych",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 8,
        "prerequisites": [],
        "tags": [
          "hover",
          "focus",
          "drag-drop",
          "klawiatura",
          "touch",
          "accessibility"
        ],
        "difficulty": "beginner"
      },
      {
        "id": "2.9",
        "moduleId": 2,
        "title": "Zrzuty ekranu i testy wizualne",
        "description": "Opanuj zrzuty ekranu, testy regresji wizualnej i maskowanie dynamicznej treści",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Robić screenshoty stron i elementów\n- Konfigurować testy regresji wizualnej z toHaveScreenshot()\n- Maskować dynamiczną treść (daty, reklamy)\n- Zarządzać obrazami bazowymi i zrzutami różnic",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 9,
        "prerequisites": [],
        "tags": [
          "screenshot",
          "testy wizualne-testing",
          "regression",
          "mask",
          "baseline"
        ],
        "difficulty": "beginner"
      }
    ]
  },
  {
    "id": 3,
    "title": "Asercje i weryfikacje",
    "description": "Opanuj web-first asercje, API testing, custom matchers i helper functions",
    "level": "beginner",
    "icon": "✅",
    "order": 3,
    "lessons": [
      {
        "id": "3.1",
        "moduleId": 3,
        "title": "Asercje webowe — kompletny przewodnik",
        "description": "Opanuj wszystkie web-first asercje Playwrighta: visibility, text, value, attributes, CSS, count i więcej",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Używać wszystkich web-first asercje Playwrighta\n- Rozumieć mechanizm auto-ponowienia i pollingu\n- Stosować miękkie asercje (expect.soft)\n- Konfigurować timeouty i custom messages dla asercji\n- Wybierać odpowiednią asercję dla każdego scenariusza",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 1,
        "prerequisites": [],
        "tags": [
          "asercje",
          "expect",
          "web-first",
          "auto-ponowienia",
          "soft-asercje",
          "visibility",
          "text",
          "URL"
        ],
        "difficulty": "beginner"
      },
      {
        "id": "3.2",
        "moduleId": 3,
        "title": "Asercje ogólne",
        "description": "Opanuj uniwersalne matchery: toBe, toEqual, toMatch, toContain, toThrow i wiele więcej",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Używać generic matchers do weryfikacji danych poza DOM\n- Rozróżniać toBe(), toEqual() i toStrictEqual()\n- Testować stringi, tablice i obiekty\n- Obsługiwać błędy z toThrow()\n- Tworzyć własne custom matchers",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 2,
        "prerequisites": [],
        "tags": [
          "generic",
          "matchers",
          "toBe",
          "toEqual",
          "toMatch",
          "toThrow",
          "snapshots"
        ],
        "difficulty": "beginner"
      },
      {
        "id": "3.3",
        "moduleId": 3,
        "title": "Asercje odpowiedzi API",
        "description": "Testuj API z Playwright: status codes, JSON validation, nagłóweks, schema, paginacja i CRUD",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Wykonywać requesty API używając request fikstura\n- Walidować status codes, nagłóweks i body odpowiedzi\n- Sprawdzać strukturę JSON (schema validation)\n- Testować paginację, sortowanie i filtrowanie\n- Obsługiwać błędy API (4xx, 5xx)\n- Testować pełny przepływ CRUD",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 3,
        "prerequisites": [],
        "tags": [
          "API",
          "request",
          "response",
          "JSON",
          "status",
          "nagłóweks",
          "schema",
          "pagination",
          "CRUD"
        ],
        "difficulty": "beginner"
      },
      {
        "id": "3.4",
        "moduleId": 3,
        "title": "Własne asercje i funkcje pomocnicze",
        "description": "Twórz własne matchery, helpery, generatory danych i organizuj kod testowy profesjonalnie",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Tworzyć custom matchers z expect.extend()\n- Budować helper functions dla akcji, waitów i danych\n- Organizować utils/ folder profesjonalnie\n- Pisać type-safe helpery w TypeScript",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 4,
        "prerequisites": [],
        "tags": [
          "custom",
          "helpers",
          "utils",
          "organization",
          "matchers",
          "typescript"
        ],
        "difficulty": "beginner"
      }
    ]
  },
  {
    "id": 4,
    "title": "Interakcje Zaawansowane",
    "description": "Wiele stron i okien, ramki iframe, Shadow DOM, przechwytywanie sieci, uwierzytelnianie i emulacja urządzeń",
    "level": "intermediate",
    "icon": "🔮",
    "order": 4,
    "lessons": [
      {
        "id": "4.1",
        "moduleId": 4,
        "title": "Wiele stron i okien",
        "description": "Opanuj obsługę wielu kart, okien i wyskakujących okien w Playwright",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Otwierać i wykrywać nowe strony/popupy\n- Przełączać się między wieloma stronami\n- Obsługiwać OAuth i popup uwierzytelnianieentication\n- Zarządzać cyklem życia stron (otwieranie, używanie, zamykanie)\n- Komunikować się między stronami (postMessage, localStorage)",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 1,
        "prerequisites": [],
        "tags": [
          "multi-page",
          "popup",
          "tabs",
          "windows",
          "cross-page",
          "bringToFront"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "4.2",
        "moduleId": 4,
        "title": "Ramki iframe i ramki zagnieżdżone",
        "description": "Opanuj pracę z iframe: lokalizowanie, interakcje, ramki zagnieżdżone i cross-origin",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Lokalizować iframe używając frameLocator()\n- Interaktywnie pracować z elementami wewnątrz iframe\n- Obsługiwać zagnieżdżone (nested) iframes\n- Radzić sobie z cross-origin iframes\n- Testować sandboxed iframes i dynamiczne iframe",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 2,
        "prerequisites": [],
        "tags": [
          "iframe",
          "frames",
          "nested",
          "frameLocator",
          "cross-origin",
          "sandbox"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "4.3",
        "moduleId": 4,
        "title": "Shadow DOM",
        "description": "Opanuj piercing Shadow DOM, Web Components, open/closed shadows i slot mechanism",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Pierce'ować Shadow DOM (open i closed)\n- Pracować z Web Components (Lit, Stencil, Material)\n- Obsługiwać slot mechanism i slotted content\n- Testować event propagation w Shadow DOM",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 3,
        "prerequisites": [],
        "tags": [
          "shadow-dom",
          "web-components",
          "piercing",
          "slots",
          "open-closed"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "4.4",
        "moduleId": 4,
        "title": "Przechwytywanie sieci i mockowanie",
        "description": "Mockuj API, blokuj zasoby, modyfikuj requesty i odpowiedzi z page.route()",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Mockować odpowiedzi API z page.route() i route.fulfill()\n- Blokować niepotrzebne zasoby (obrazy, fonty, analytics)\n- Modyfikować requesty i odpowiedzi w locie\n- Nagrywać i odtwarzać HAR (HTTP Archive)\n- Symulować błędy sieciowe (4xx, 5xx, timeout)",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 4,
        "prerequisites": [],
        "tags": [
          "network",
          "mock",
          "route",
          "interception",
          "API",
          "HAR",
          "block"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "4.5",
        "moduleId": 4,
        "title": "Strategie uwierzytelniania",
        "description": "Opanuj logowanie: storageState, JWT, OAuth, MFA, SSO i globalSetup",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Implementować globalSetup z logowaniem raz na wszystkie testy\n- Używać storageState do pomijania logowania\n- Testować JWT, OAuth 2.0, MFA i SSO\n- Zarządzać wieloma rolami użytkowników\n- Bezpiecznie przechowywać credentials",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 5,
        "prerequisites": [],
        "tags": [
          "uwierzytelnianie",
          "login",
          "JWT",
          "OAuth",
          "storageState",
          "MFA",
          "SSO",
          "globalSetup"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "4.6",
        "moduleId": 4,
        "title": "Geolokalizacja, uprawnienia i emulacja urządzeń",
        "description": "Testuj geolokalizację, uprawnienia, emulację urządzeń, dark mode i offline",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Ustawiać geolokalizację i testować permission dialogs\n- Emulować urządzenia mobilne (iPhone, Pixel, tablety)\n- Testować dark/light mode, offline i slow network\n- Konfigurować timezone, locale i reduced motion",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 6,
        "prerequisites": [],
        "tags": [
          "geolocation",
          "permissions",
          "device",
          "emulation",
          "dark-mode",
          "offline",
          "responsive"
        ],
        "difficulty": "intermediate"
      }
    ]
  },
  {
    "id": 5,
    "title": "Runner testów i fikstury",
    "description": "Opanuj Runner testów Playwright, fiksturas, konfigurację, parallelization i organizację testów",
    "level": "intermediate",
    "icon": "🏃",
    "order": 5,
    "lessons": [
      {
        "id": "5.1",
        "moduleId": 5,
        "title": "Runner testów Playwright — kompletny przewodnik",
        "description": "Opanuj test(), describe(), hooks, kroki, adnotacje, retries, limity czasu i tryby wykonania",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Strukturyzować testy z test() i test.describe()\n- Używać hooków (beforeEach, afterAll, beforeAll, afterEach)\n- Stosować test.step() dla czytelnych raportów\n- Konfigurować ponowienia, timeouty i adnotacje (skip, only, fixme, fail)\n- Uruchamiać testy w trybie serial, parallel, interfejsu użytkownika i debug",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 1,
        "prerequisites": [],
        "tags": [
          "test-runner",
          "describe",
          "hooks",
          "test-step",
          "ponowienia",
          "tags",
          "timeout",
          "parallel"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "5.2",
        "moduleId": 5,
        "title": "Fikstury — omówienie szczegółowe",
        "description": "Opanuj dependency injection z fiksturas: custom, worker-zakresd, Page Object, API i auto-fiksturas",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Rozumieć wbudowane fiksturas (page, context, browser, request)\n- Tworzyć custom fiksturas z test.extend()\n- Wybierać odpowiedni zakres (test vs worker)\n- Tworzyć Page Object fiksturas i API fiksturas\n- Używać auto-fiksturas do automatycznego setupu",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 2,
        "prerequisites": [],
        "tags": [
          "fiksturas",
          "test-extend",
          "worker-zakres",
          "auto-fikstura",
          "wzorzec obiektu strony",
          "dependency-injection"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "5.3",
        "moduleId": 5,
        "title": "Zaawansowana konfiguracja testów",
        "description": "Opanuj zaawansowaną konfigurację: multi-environment, projekty, globalSetup, sharding, CI/CD",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Tworzyć konfiguracje dla wielu środowisk (dev, staging, prod, CI)\n- Rozszerzać bazową konfigurację (config composition)\n- Używać globalSetup/globalTeardown\n- Konfigurować reportery, sharding i web server",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 3,
        "prerequisites": [],
        "tags": [
          "configuration",
          "projects",
          "multi-env",
          "globalSetup",
          "sharding",
          "CI/CD",
          "reporters"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "5.4",
        "moduleId": 5,
        "title": "Równoległość i dzielenie testów",
        "description": "Skaluj testy: workers, fullyParallel, sharding, serial vs parallel, warunkami wyścigu",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Konfigurować workers dla optymalnej parallelizacji\n- Używać describe.parallel() i describe.serial()\n- Implementować sharding dla CI/CD (GitHub Actions, GitLab)\n- Wykrywać i naprawiać warunkami wyścigu\n- Optymalizować wydajność dużych suit testowych",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 4,
        "prerequisites": [],
        "tags": [
          "parallel",
          "sharding",
          "workers",
          "serial",
          "race-conditions",
          "CI/CD",
          "performance"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "5.5",
        "moduleId": 5,
        "title": "Organizacja testów i tagowanie",
        "description": "Organizuj testy profesjonalnie: struktura, nazewnictwo, tagi, smoke/regression, CI/CD pipeline",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Organizować testy według feature, typu i priorytetu\n- Stosować konwencje nazewnictwa (Given-When-Then)\n- Implementować system tagów (@smoke, @regression, @critical)\n- Tworzyć smoke i regression suity dla CI/CD\n- Zarządzać dużymi suitami testowymi",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 5,
        "prerequisites": [],
        "tags": [
          "organization",
          "tagging",
          "smoke",
          "regression",
          "naming",
          "suites",
          "CI/CD"
        ],
        "difficulty": "intermediate"
      }
    ]
  },
  {
    "id": 6,
    "title": "Wzorzec obiektu strony",
    "description": "Opanuj wzorzec obiektu strony: od podstaw przez BasePage, Component Pattern, zaawansowane wzorce po integrację z fiksturami",
    "level": "intermediate",
    "icon": "📄",
    "order": 6,
    "lessons": [
      {
        "id": "6.1",
        "moduleId": 6,
        "title": "Wzorzec obiektu strony — fundamenty",
        "description": "Poznaj wzorzec wzorzec obiektu strony: enkapsulacja, organizacja lokatorów, metody akcji i asercji",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Tworzyć klasy Page Object z enkapsulacją selektorów\n- Organizować lokatory jako readonly properties\n- Implementować metody akcji (click, fill, navigate)\n- Oddzielać logikę testu od logiki strony\n- Stosować płynny interfejs (method chaining)",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 1,
        "prerequisites": [],
        "tags": [
          "wzorzec obiektu strony",
          "page-object",
          "enkapsulacja",
          "lokatory",
          "actions",
          "type-safety"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "6.2",
        "moduleId": 6,
        "title": "Wzorzec strony bazowej",
        "description": "Wspolna klasa bazowa: nawigacja, wait, screenshot, scroll, logging - dziedziczenie w akcji",
        "content": {
          "objective": "Po ukonczeniu tej lekcji bedziesz umial: tworzyc klase BasePage z wspolna funkcjonalnoscia, dziedziczyc we wszystkich stronach, implementowac utility methods.",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 2,
        "prerequisites": [],
        "tags": [
          "BasePage",
          "inheritance",
          "utilities",
          "navigation",
          "logging"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "6.3",
        "moduleId": 6,
        "title": "Wzorzec komponentu",
        "description": "Reusable komponenty interfejsu użytkownika: Modal, Table, Header, Pagination — kompozycja ponad dziedziczenie",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał: identyfikować powtarzalne fragmenty interfejsu użytkownika i wyodrębniać je jako komponenty, tworzyć komponenty z root locator dla pełnej izolacji, komponować strony z komponentów zamiast dziedziczenia.",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 3,
        "prerequisites": [],
        "tags": [
          "component",
          "reusable",
          "modal",
          "table",
          "composition"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "6.4",
        "moduleId": 6,
        "title": "Zaawansowane wzorce obiektu strony",
        "description": "Page Factory, Fluent API, journey Pattern, Facade, strategia, Builder, wstrzykiwanie zależności",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Implementować Page Factory z leniwa inicjalizacja i cachingiem\n- Tworzyć Fluent Page Objects z method chaining\n- Budować journey Pattern dla wieloetapowych przepływów biznesowych\n- Stosować Facade, strategia i Builder pattern w wzorzec obiektu strony\n- Wybierać odpowiedni wzorzec dla danego problemu",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 4,
        "prerequisites": [],
        "tags": [
          "page-factory",
          "fluent",
          "journey",
          "facade",
          "strategy",
          "builder",
          "DI"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "6.5",
        "moduleId": 6,
        "title": "Dobre praktyki i antywzorce obiektu strony",
        "description": "SOLID w wzorzec obiektu strony, obiekt-bóg, Tight Coupling, kruche selektory, refaktoryzacja, organizacja plików",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Stosować zasady SOLID w Wzorzec obiektu strony\n- Rozpoznawać i naprawiać 5 najczęstszych antywzorców (obiekt-bóg, Tight Coupling, Fragile Selectors, Test Logic in wzorzec obiektu strony, Over-Abstraction)\n- Organizować pliki wzorzec obiektu strony profesjonalnie\n- Wiedzieć kiedy i jak refaktorować kod testowy",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 5,
        "prerequisites": [],
        "tags": [
          "best-practices",
          "antywzorce",
          "refactoring",
          "SOLID",
          "clean-code"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "6.6",
        "moduleId": 6,
        "title": "Wzorzec obiektu strony z fiksturami",
        "description": "PageObject jako fikstura, Application fikstura, auto-fiksturas, worker-zakresd, migracja z new PageObject()",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Zamieniać PageObjects na fiksturas z test.extend() — czystszy kod, automatyczny lifecycle\n- Tworzyć Application fikstura z centralnym dostępem do wszystkich stron\n- Używać auto-fiksturas (auto: true) do automatycznego setupu\n- Stosować worker-zakresd fiksturas dla wydajności\n- Migrować istniejące testy z new PageObject() na fiksturas",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 6,
        "prerequisites": [],
        "tags": [
          "fiksturas",
          "wzorzec obiektu strony",
          "test-extend",
          "auto-fikstura",
          "application-fikstura"
        ],
        "difficulty": "intermediate"
      }
    ]
  },
  {
    "id": 7,
    "title": "Zarządzanie danymi testowymi",
    "description": "Opanuj strategie danych testowych: builders, factories, Faker.js, database seeding, organizację",
    "level": "intermediate",
    "icon": "🗄️",
    "order": 7,
    "lessons": [
      {
        "id": "7.1",
        "moduleId": 7,
        "title": "Strategie danych testowych",
        "description": "Poznaj i wybierz najlepszą strategię danych: hard-coded, JSON, Factory, Builder, Faker.js",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Wybrać odpowiednią strategię danych testowych dla każdego scenariusza\n- Odróżnić zalety i wady hard-coded data, plików JSON, Factory, Buildera i Faker.js\n- Zaimplementować wzorzec fabryki z domyślnymi wartościami i wariantami (admin, user)\n- Zbudować wzorzec budowniczego z płynnym interfejsem (płynny interfejs)\n- Zapewnić izolację danych testowych przez sprzątanie danych tracker w afterEach\n- Używać faker.seed() dla deterministycznych, powtarzalnych danych",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 1,
        "prerequisites": [],
        "tags": [
          "test-data",
          "factory",
          "builder",
          "faker",
          "JSON",
          "sprzątanie danych",
          "izolacja"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "7.2",
        "moduleId": 7,
        "title": "Budowniczowie danych i fabryki",
        "description": "wzorzec fabryki, wzorzec budowniczego z płynny interfejs, budowniczowie zagnieżdżeni, Object Mother",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Zaimplementować wzorzec fabryki z wariantami (admin, user, guest)\n- Zbudować wzorzec budowniczego z płynnym interfejsem i walidacją\n- Tworzyć zagnieżdżone buildery dla złożonych obiektów\n- Stosować Object Mother Pattern dla typowych scenariuszy\n- Łączyć Buildera z Faker.js dla realistycznych danych\n- Wybrać odpowiedni wzorzec (Factory vs Builder) dla scenariusza",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 2,
        "prerequisites": [],
        "tags": [
          "builder",
          "factory",
          "fluent",
          "nested",
          "Object-Mother"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "7.3",
        "moduleId": 7,
        "title": "Dynamiczne generowanie danych testowych",
        "description": "Faker.js: person, address, commerce, finance, date, seed, localization, własne generatory, bulk",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Generować realistyczne dane testowe z Faker.js (person, address, commerce, finance, date)\n- Używać faker.seed() dla powtarzalnych, deterministycznych testów\n- Stosować lokalizację (fakerPL) dla polskich danych\n- Tworzyć własne generatory (NIP, PESEL, ISBN)\n- Generować dane hurtowo (bulk generation)",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 3,
        "prerequisites": [],
        "tags": [
          "faker",
          "dynamic",
          "seed",
          "localization",
          "custom-generators",
          "bulk"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "7.4",
        "moduleId": 7,
        "title": "Dane testowe z bazy danych i API",
        "description": "Seedowanie bazy danych, rollback transakcji, setup przez API, tracker sprzątania, baza in-memory",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Seedować bazę danych przed testami (SQL INSERT)\n- Używać transakcji (BEGIN/ROLLBACK) dla automatycznej izolacji\n- Tworzyć dane testowe przez API (POST) i sprzątać przez DELETE\n- Implementować sprzątanie danych tracker dla automatycznego usuwania danych\n- Wybrać między bazą w pamięci a rzeczywistą bazą",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 4,
        "prerequisites": [],
        "tags": [
          "database",
          "API",
          "seed",
          "transaction",
          "sprzątanie danych"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "7.5",
        "moduleId": 7,
        "title": "Organizacja i utrzymanie danych testowych",
        "description": "Struktura folderów, nazewnictwo, dane wrażliwe, schematów JSON validation, refaktoryzacja",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Zorganizować dane testowe w profesjonalnej strukturze folderów\n- Stosować konwencje nazewnictwa dla plików, klas i skryptów\n- Bezpiecznie zarządzać danymi wrażliwymi (.env, .gitignore)\n- Walidować strukturę danych przez schematów JSON\n- Identyfikować momenty kiedy dane wymagają refaktoryzacji",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 5,
        "prerequisites": [],
        "tags": [
          "organization",
          "maintenance",
          "versioning",
          "bezpieczeństwo",
          "validation"
        ],
        "difficulty": "intermediate"
      }
    ]
  },
  {
    "id": 8,
    "title": "Zaawansowane testowanie API",
    "description": "REST API, GraphQL, testy kontraktowe, testy wydajnościowe i organizacja testów API",
    "level": "intermediate",
    "icon": "🔌",
    "order": 8,
    "lessons": [
      {
        "id": "8.1",
        "moduleId": 8,
        "title": "Kompletne testowanie REST API",
        "description": "HTTP methods, CRUD, status codes, uwierzytelnianie, pagination, schematów JSON, rate limiting, error handling",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Używać wszystkich metod HTTP (GET, POST, PUT, PATCH, DELETE) z poprawną semantyką\n- Implementować pełny przepływ CRUD z walidacją statusów\n- Testować paginację API (pobieranie wszystkich stron)\n- Walidować odpowiedzi schematów JSON (struktura i typy danych)\n- Obsługiwać błędy API (4xx, 5xx) i rate limiting (429)",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 1,
        "prerequisites": [],
        "tags": [
          "REST",
          "API",
          "CRUD",
          "status-codes",
          "pagination",
          "JSON-Schema",
          "rate-limiting"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "8.2",
        "moduleId": 8,
        "title": "Testowanie GraphQL",
        "description": "GraphQL queries, mutations, variables, fragments, errors, pagination, introspection",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Pisać GraphQL queries i mutations z variables\n- Rozumieć różnice między GraphQL a REST (status codes, errors, over-fetching)\n- Używać fragments do współdzielenia zestawów pól\n- Testować paginację cursor-based (Relay-style)\n- Obsługiwać GraphQL errors (inne niż HTTP errors!)",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 2,
        "prerequisites": [],
        "tags": [
          "GraphQL",
          "query",
          "mutation",
          "variables",
          "fragments",
          "errors",
          "pagination"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "8.3",
        "moduleId": 8,
        "title": "Kontrakty API i walidacja schematów",
        "description": "OpenAPI, schematów JSON, Ajv, Pact consumer/provider testing, Pact Broker, zmiany niekompatybilne detection, API versioning, contract-first development",
        "content": {
          "objective": "Po ukonczeniu tej lekcji:\n- Tworzysz specyfikacje OpenAPI dla REST API\n- Walidujesz odpowiedzi API z schematów JSON przez Ajv\n- Implementujesz contract testing consumer-driven z Pact\n- Publikujesz kontrakty do Pact Broker i weryfikujesz provider\n- Automatycznie wykrywasz zmiany niekompatybilne przez openapi-diff\n- Wybierasz strategie wersjonowania API dopasowana do projektu",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 3,
        "prerequisites": [],
        "tags": [
          "OpenAPI",
          "JSON-Schema",
          "Ajv",
          "contract",
          "Pact",
          "versioning",
          "breaking-changes",
          "Pact-Broker",
          "consumer-driven"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "8.4",
        "moduleId": 8,
        "title": "Wydajność i testy obciążeniowe API",
        "description": "k6, testy load/stress/spike/soak, wirtualni użytkownicy, percentyle i progi jakości, Artillery",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Rozróżniać typy testów wydajnościowych (load, stress, spike, soak)\n- Pisać testy k6 z wirtualni użytkownicy, stages i progi jakości\n- Rozumieć różnicę między checks a progi jakości\n- Używać percentyli (p95, p99) zamiast średniej\n- Mierzyć czasy odpowiedzi API w Playwright",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 4,
        "prerequisites": [],
        "tags": [
          "performance",
          "load-testing",
          "k6",
          "metrics",
          "progi jakości",
          "percentiles"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "8.5",
        "moduleId": 8,
        "title": "Organizacja testów API i wzorce",
        "description": "API client, Resource classes, fiksturas, sprzątanie danych tracker, ponowienia, folder structure",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał:\n- Zorganizować testy API w profesjonalnej strukturze folderów\n- Stworzyć klasę ApiClient enkapsulującą konfigurację żądań\n- Implementować Resource Classes (UsersResource, ProductsResource)\n- Zastosować CleanupTracker do automatycznego sprzątania danych",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 5,
        "prerequisites": [],
        "tags": [
          "organization",
          "api-client",
          "patterns",
          "fiksturas",
          "sprzątanie danych",
          "ponowienia"
        ],
        "difficulty": "intermediate"
      }
    ]
  },
  {
    "id": 9,
    "title": "Debugowanie i rozwiązywanie problemów",
    "description": "Narzędzia debugowania, typowe problemy, obsługa błędów, stabilność testów, logowanie i monitoring",
    "level": "intermediate",
    "icon": "🐛",
    "order": 9,
    "lessons": [
      {
        "id": "9.1",
        "moduleId": 9,
        "title": "Narzędzia debugowania w Playwright",
        "description": "Playwright Inspector, Trace Viewer, tryb UI, page.pause(), VS Code, debugowanie konsoli i sieci, CI artefakty",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał: uruchomić Inspector (--debug) i przechodzić test krok po kroku, analizować Trace Viewer (time-travel debugging), używać tryb UI, debugować w VS Code, zbierać artefakty w CI.",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 1,
        "prerequisites": [],
        "tags": [
          "debugging",
          "inspector",
          "ślady wykonania",
          "tryb-ui",
          "VS-Code",
          "console",
          "CI"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "9.2",
        "moduleId": 9,
        "title": "Typowe problemy i rozwiązania",
        "description": "Timeouty, element not found, niestabilne testy, strict mode, uwierzytelnianie, CI kontra lokalnie",
        "content": {
          "objective": "Po lekcji: diagnozujesz timeouty, element not found, niestabilne testy, strict mode, uwierzytelnianie issues, CI differences.",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 2,
        "prerequisites": [],
        "tags": [
          "troubleshooting",
          "flaky",
          "timeout",
          "strict-mode",
          "uwierzytelnianie",
          "CI"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "9.3",
        "moduleId": 9,
        "title": "Obsługa błędów i odzyskiwanie",
        "description": "Try-catch z kontekstem, ponowienia z exponential backoff, miękkie asercje, sprzątanie danych guarantee, Circuit Breaker",
        "content": {
          "objective": "Po ukończeniu tej lekcji będziesz umiał: zbierać kontekst błędów (screenshot, URL, logi), implementować ponowienia z exponential backoff, używać expect.soft() do wielu asercji, gwarantować sprzątanie danych przez finally.",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 3,
        "prerequisites": [],
        "tags": [
          "error-handling",
          "ponowienia",
          "soft-asercje",
          "sprzątanie danych",
          "circuit-breaker"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "9.4",
        "moduleId": 9,
        "title": "Stabilnosc i niezawodnosc testow",
        "description": "Deterministic tests, test independence, warunkami wyścigu, strategia ponowień, wykrywanie niestabilności, mocking external APIs, izolacja workerów, systematic flaky management",
        "content": {
          "objective": "Po ukonczeniu tej lekcji:\n- Rozumiesz 3 glowne przyczyny flaky testow i potrafisz je eliminowac\n- Tworzysz deterministyczne, niezalezne testy z wlasnymi danymi\n- Zapobiegasz warunkami wyścigu przez Promise.all i waitForURL\n- Konfigurujesz strategie ponowienia: CI vs lokalnie\n- Wykrywasz flaky testy przez --repeat-each\n- Mockujesz zewnetrzne zaleznosci dla pelnej kontroli\n- Stosujesz systematyczny proces: detect -> quarantine -> fix -> verify",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 4,
        "prerequisites": [],
        "tags": [
          "stability",
          "flaky",
          "isolation",
          "ponowienia",
          "race-condition",
          "mocking",
          "deterministic"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "9.5",
        "moduleId": 9,
        "title": "Logowanie, monitoring i alerty",
        "description": "Winston structured logging, zbieranie metryk, Slack alerts, zbieranie logów konsoli, CI integration",
        "content": {
          "objective": "Po ukończeniu: implementujesz structured logging, zbierasz metryki (success rate, p95), konfigurujesz Slack alerts.",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 5,
        "prerequisites": [],
        "tags": [
          "logging",
          "monitoring",
          "alertowanie",
          "metrics",
          "Winston",
          "Slack"
        ],
        "difficulty": "intermediate"
      }
    ]
  },
  {
    "id": 10,
    "title": "Reporting i Analytics",
    "description": "Wbudowane i niestandardowe reportery, analityka testów, Allure i zaawansowane strategie raportowania",
    "level": "intermediate",
    "icon": "📊",
    "order": 10,
    "lessons": [
      {
        "id": "10.1",
        "moduleId": 10,
        "title": "Raportowanie wbudowane",
        "description": "HTML, JSON, JUnit, GitHub, List, Dot, Line, Blob reporters + załączniki",
        "content": {
          "objective": "Po ukonczeniu tej lekcji bedziesz umial: konfigurowac wszystkie wbudowane reporters, dodawac załączniki, dobierac strategie raportowania per srodowisko.",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 1,
        "prerequisites": [],
        "tags": [
          "reporters",
          "HTML",
          "JSON",
          "JUnit",
          "GitHub",
          "blob"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "10.2",
        "moduleId": 10,
        "title": "Niestandardowe reportery",
        "description": "niestandardowy reporter interface, Slack/Teams webhook, CSV/JSON/Markdown wyjście",
        "content": {
          "objective": "Po ukonczeniu tej lekcji bedziesz umial: tworzyc wlasne reporters implementujace interface Reporter, integrowac Slack/Teams przez webhook, generowac wyniki w CSV/JSON/Markdown.",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 2,
        "prerequisites": [],
        "tags": [
          "custom-reporter",
          "Slack",
          "CSV",
          "Markdown",
          "integration"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "10.3",
        "moduleId": 10,
        "title": "Analityka testów i metryki",
        "description": "zbieranie metryk, success rate, p95, Grafana, wykrywanie niestabilności",
        "content": {
          "objective": "Po lekcji: zbierasz metryki z każdego CI runu, obliczasz success rate, p95, tworzysz dashboardy w Grafanie, wykrywasz flaky testy.",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 3,
        "prerequisites": [],
        "tags": [
          "analytics",
          "metrics",
          "Grafana",
          "flakiness",
          "dashboardy"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "10.4",
        "moduleId": 10,
        "title": "Integracja z Allure",
        "description": "konfiguracja Allure, adnotacje (waga błędu, epic, feature), kroki, kategorie, CI/CD hosting",
        "content": {
          "objective": "Po lekcji: instalujesz Allure, dodajesz waga błędu/epic/feature/owner adnotacje, używasz kroki i kategorie, hostujesz raport na GitHub Pages.",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 4,
        "prerequisites": [],
        "tags": [
          "Allure",
          "adnotacje",
          "waga błędu",
          "epic",
          "kroki",
          "kategorie",
          "CI"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "10.5",
        "moduleId": 10,
        "title": "Zaawansowane strategie raportowania",
        "description": "raportowanie wielopoziomowe, streszczenia zarządcze, bramki jakości, dashboardy, automation, Slack alerts, raporty e-mail, metrics trends, Grafana integration",
        "content": {
          "objective": "Po ukonczeniu tej lekcji:\n- Tworzysz raporty wielopoziomowe: executive summary, management, technical\n- Implementujesz bramki jakości: success rate, critical failures, flaky rate, performance\n- Budujesz dashboard z trendami (Grafana, ReportPortal)\n- Automatyzujesz raportowanie: CI, cron, Slack/Teams alerty\n- Generujesz raporty e-mail z formatowaniem HTML\n- Rozumiesz KTO potrzebuje JAKICH informacji i DLACZEGO",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 5,
        "prerequisites": [],
        "tags": [
          "reporting",
          "executive",
          "quality-gates",
          "dashboardy",
          "automation",
          "slack",
          "grafana",
          "metrics"
        ],
        "difficulty": "intermediate"
      }
    ]
  },
  {
    "id": 11,
    "title": "Pełna integracja z CI/CD",
    "description": "GitHub Actions, GitLab CI, Jenkins, Azure DevOps, CircleCI, dobre praktyki i optymalizacja",
    "level": "advanced",
    "icon": "🔄",
    "order": 11,
    "lessons": [
      {
        "id": "11.1",
        "moduleId": 11,
        "title": "Integracja z GitHub Actions",
        "description": "Workflows, matrix strategy, sharding, cache, artefakty, sekrety, PR comments, uruchomienia harmonogramem",
        "content": {
          "objective": "Po lekcji: tworzysz kompletny workflow z matrix, sharding, cache, artefakty, sekrety, PR comments.",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 1,
        "prerequisites": [],
        "tags": [
          "GitHub-Actions",
          "CI/CD",
          "workflow",
          "matrix",
          "sharding",
          "cache",
          "sekrety"
        ],
        "difficulty": "advanced"
      },
      {
        "id": "11.2",
        "moduleId": 11,
        "title": "Integracja z GitLab CI/CD",
        "description": ".gitlab-ci.yml, stages, cache, parallel, artefakty, GitLab Pages, MR pipelines",
        "content": {
          "objective": "Po lekcji: tworzysz .gitlab-ci.yml z stages, cache, parallel execution, artefakty, JUnit reports, GitLab Pages hosting.",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 2,
        "prerequisites": [],
        "tags": [
          "GitLab",
          "CI/CD",
          "stages",
          "parallel",
          "artefakty",
          "pages",
          "cache"
        ],
        "difficulty": "advanced"
      },
      {
        "id": "11.3",
        "moduleId": 11,
        "title": "Integracja z Jenkinsem",
        "description": "Jenkinsfile, Declarative Pipeline, etapy równoległe, JUnit, HTML Publisher, Docker agent, akcje końcowe",
        "content": {
          "objective": "Po ukonczeniu tej lekcji bedziesz umial: tworzyc Jenkinsfile, konfigurowac etapy równoległe z Docker agent, publikowac JUnit/HTML reports, dodawac akcje końcowe z powiadomieniami.",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 3,
        "prerequisites": [],
        "tags": [
          "Jenkins",
          "Jenkinsfile",
          "pipeline",
          "parallel",
          "JUnit",
          "Docker"
        ],
        "difficulty": "advanced"
      },
      {
        "id": "11.4",
        "moduleId": 11,
        "title": "Azure DevOps i inne platformy CI/CD",
        "description": "Azure Pipelines, CircleCI, Bitbucket, GitLab CI, Jenkins, testowanie w chmurze BrowserStack, SauceLabs, matrix strategy, parallelism, wieloprzeglądarkowe cloud",
        "content": {
          "objective": "Po ukonczeniu tej lekcji:\n- Tworzysz pelna konfiguracje Azure Pipelines z stages, jobs i matrix strategy\n- Konfigurujesz CircleCI z parallelism i shardingiem\n- Tworzysz Bitbucket Pipelines z parallel kroki\n- Integrujesz testowanie w chmurze: BrowserStack i SauceLabs\n- Rozumiesz roznice miedzy platformami i wybierasz odpowiednia dla projektu\n- Znasz GitLab CI i Jenkins jako alternatywy",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 4,
        "prerequisites": [],
        "tags": [
          "Azure-DevOps",
          "CircleCI",
          "Bitbucket",
          "cloud-testing",
          "BrowserStack",
          "SauceLabs",
          "GitLab-CI",
          "Jenkins"
        ],
        "difficulty": "advanced"
      },
      {
        "id": "11.5",
        "moduleId": 11,
        "title": "Dobre praktyki i optymalizacja CI/CD",
        "description": "Fast feedback, caching, sharding, bramki jakości, obsługa niestabilnych testów process, bezpieczeństwo, optymalizacja kosztów, smoke tests, strategia tagowania testów",
        "content": {
          "objective": "Po ukonczeniu tej lekcji:\n- Projektujesz pipeline z fast feedback: smoke <5min na PR, full nightly\n- Konfigurujesz caching npm + Playwright browsers - 10x szybciej\n- Implementujesz sharding dla rownoleglego wykonania 300+ testow\n- Tworzysz automatyczne bramki jakości blokujace zle releasy\n- Stosujesz systematyczny proces obslugi flaky testow\n- Zabezpieczasz pipeline: sekrety, npm audit, least privilege\n- Optymalizujesz koszty: spot instances, right-size runners, clean artefakty",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 5,
        "prerequisites": [],
        "tags": [
          "best-practices",
          "optimization",
          "caching",
          "quality-gates",
          "flaky",
          "bezpieczeństwo",
          "cost",
          "sharding",
          "smoke"
        ],
        "difficulty": "advanced"
      }
    ]
  },
  {
    "id": 12,
    "title": "Dobre praktyki i wzorce",
    "description": "Test design principles, advanced wzorzec obiektu strony patterns, jakość kodu, współpraca zespołowa, antywzorce",
    "level": "intermediate",
    "icon": "🌟",
    "order": 12,
    "lessons": [
      {
        "id": "12.1",
        "moduleId": 12,
        "title": "Zasady projektowania testów",
        "description": "Piramida testów, wzorzec AAA, Given-When-Then, niezależność testów, testy deterministyczne i testowanie oparte na ryzyku",
        "content": {
          "objective": "Po lekcji: stosujesz testing pyramid, AAA, Given-When-Then, test independence, deterministic tests, smoke vs regression.",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 1,
        "prerequisites": [],
        "tags": [
          "testing-pyramid",
          "AAA",
          "BDD",
          "independence",
          "deterministic",
          "risk-based",
          "smoke-regression"
        ],
        "difficulty": "advanced"
      },
      {
        "id": "12.2",
        "moduleId": 12,
        "title": "Zaawansowane wzorce obiektu strony",
        "description": "kompozycja, dekorator, strategia, repozytorium, journey — pattern selection guide",
        "content": {
          "objective": "Po lekcji: wybierasz i stosujesz composition, decorator, strategy, repository, journey patterns.",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 2,
        "prerequisites": [],
        "tags": [
          "wzorzec obiektu strony",
          "composition",
          "decorator",
          "strategy",
          "repository",
          "journey"
        ],
        "difficulty": "advanced"
      },
      {
        "id": "12.3",
        "moduleId": 12,
        "title": "Jakosc kodu i utrzymywalnosc",
        "description": "SOLID, ESLint, Prettier, Husky, lint-staged, refactoring techniques, TypeScript strict mode, code metrics, cyclomatic complexity, extract method",
        "content": {
          "objective": "Po ukonczeniu tej lekcji:\n- Stosujesz SOLID w kodzie testowym: Single Responsibility, Open/Closed, Dependency Inversion\n- Konfigurujesz ESLint z pluginem Playwright i Prettier dla spojnego formatowania\n- Uzywasz Husky + lint-staged do blokowania zlego kodu przed commitem\n- Stosujesz techniki refaktoryzacji: Extract Method, Replace Magic Number\n- Konfigurujesz TypeScript strict mode dla bezpieczenstwa typow\n- Sledzisz metryki kodu: zlozonosc, dlugosc funkcji, duplikacja",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 3,
        "prerequisites": [],
        "tags": [
          "SOLID",
          "ESLint",
          "Prettier",
          "Husky",
          "refactoring",
          "TypeScript",
          "code-quality",
          "metrics"
        ],
        "difficulty": "advanced"
      },
      {
        "id": "12.4",
        "moduleId": 12,
        "title": "Wspolpraca zespolowa i standardy",
        "description": "Conventional Commits, szablony PR, CODEOWNERS, ADR, dzielenie wiedzy, branching strategy, przegląd kodu, pair programming, DoD",
        "content": {
          "objective": "Po ukonczeniu tej lekcji:\n- Znasz format Conventional Commits i stosujesz go w codziennej pracy\n- Tworzysz pull request template przyspieszajacy przegląd kodu\n- Konfigurujesz plik CODEOWNERS do automatycznego przypisywania reviewerow\n- Dokumentujesz decyzje architektoniczne za pomoca ADR\n- Rozumiesz rozne strategie branchingowe i wybierasz odpowiednia dla zespolu\n- Stosujesz techniki dzielenie wiedzy\n- Definiujesz Definition of Done dla testow automatycznych",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 4,
        "prerequisites": [],
        "tags": [
          "team",
          "standards",
          "conventional-commits",
          "PR-template",
          "ADR",
          "branching",
          "code-review",
          "pair-programming",
          "DoD"
        ],
        "difficulty": "advanced"
      },
      {
        "id": "12.5",
        "moduleId": 12,
        "title": "Antywzorce i typowe błędy",
        "description": "oczekiwania wpisane na stałe, kruche selektory, zależności między testami, obiekty-bogi, test logic in wzorzec obiektu strony",
        "content": {
          "objective": "Po ukonczeniu tej lekcji bedziesz umial: identyfikowac i naprawiac 5 najczestszych antywzorcow: hardcoded oczekiwania, kruche selektory, zależności między testami, obiekty-bogi, test logic in wzorzec obiektu strony.",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 5,
        "prerequisites": [],
        "tags": [
          "antywzorce",
          "hardcoded-oczekiwania",
          "fragile-selectors",
          "god-object"
        ],
        "difficulty": "intermediate"
      }
    ]
  },
  {
    "id": 13,
    "title": "Wydajność i optymalizacja",
    "description": "Wydajność wykonywania testów, testowanie wydajności aplikacji, strategie optymalizacji, testy na prawdziwych urządzeniach i ciągłe monitorowanie wydajności",
    "level": "advanced",
    "icon": "⚡",
    "order": 13,
    "lessons": [
      {
        "id": "13.1",
        "moduleId": 13,
        "title": "Wydajnosc wykonania testow",
        "description": "Resource blocking, uwierzytelnianie reuse, parallel execution, workers optimization, selector performance, ślady wykonania strategy, profiling, analiza wąskich gardeł",
        "content": {
          "objective": "Po ukonczeniu tej lekcji:\n- Eliminujesz zbedne requesty przez resource blocking - 2-3x szybciej\n- Implementujesz uwierzytelnianie reuse - logowanie raz, uzywasz w calej suicie\n- Optymalizujesz workers: CI vs lokalnie, fullyParallel\n- Wybierasz najszybsze selektory: CSS/data-testid > XPath (3x roznica)\n- Konfigurujesz ślady wykonania: retain-on-failure zamiast on\n- Profilujesz testy: identyfikujesz bottle necki i najwolniejsze testy",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 1,
        "prerequisites": [],
        "tags": [
          "performance",
          "parallel",
          "resource-blocking",
          "uwierzytelnianie-reuse",
          "workers",
          "selector-performance",
          "profiling"
        ],
        "difficulty": "advanced"
      },
      {
        "id": "13.2",
        "moduleId": 13,
        "title": "Testowanie wydajnosci aplikacji",
        "description": "Core Web Vitals (LCP, CLS, INP), Lighthouse CI, metryki ładowania strony, network/CPU throttling, budżety wydajnościowe, Navigation Timing API, Slow 3G testing",
        "content": {
          "objective": "Po ukonczeniu tej lekcji:\n- Mierzysz Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms\n- Integrujesz Lighthouse CI z progami performance/accessibility/seo\n- Mierzysz page load time przez Performance API i navigation timing\n- Testujesz z network throttlingiem: Slow 3G, Fast 3G, 4G\n- Ustawiasz budżety wydajnościowe: rozmiar strony, liczba requestow, JS size\n- Rozumiesz wplyw wydajnosci na SEO i konwersje",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 2,
        "prerequisites": [],
        "tags": [
          "performance",
          "Core-Web-Vitals",
          "Lighthouse",
          "throttling",
          "budgets",
          "LCP",
          "CLS",
          "INP"
        ],
        "difficulty": "advanced"
      },
      {
        "id": "13.3",
        "moduleId": 13,
        "title": "Strategie optymalizacji",
        "description": "Najpierw pomiar principle, HTTP caching, pula przeglądarek, batching, leniwa inicjalizacja, analiza kompromisów, narzędzia profilowania, continuous optimization, ROI-driven approach",
        "content": {
          "objective": "Po ukonczeniu tej lekcji:\n- Stosujesz zasade measure-first: profiluj zanim optymalizujesz\n- Implementujesz HTTP response caching dla powtarzalnych API calls\n- Tworzysz Browser Pool by uniknac restartow przegladarki\n- Uzywasz Promise.all batching zamiast sekwencyjnych requestow\n- Stosujesz leniwa inicjalizacja dla ciezkich zasobow\n- Analizujesz trade-offy: kazda optymalizacja ma zysk I koszt\n- Masz proces continuous optimization w CI",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 3,
        "prerequisites": [],
        "tags": [
          "optimization",
          "caching",
          "pooling",
          "batching",
          "profiling",
          "trade-offs",
          "lazy-init",
          "measure-first"
        ],
        "difficulty": "advanced"
      },
      {
        "id": "13.4",
        "moduleId": 13,
        "title": "Testy na rzeczywistych urzadzeniach i testy mobilne",
        "description": "BrowserStack, SauceLabs, testy na prawdziwych urządzeniach, emulacja urządzeń, viewport testing, network throttling, tryb offline, locale/timezone/geolocation testing, mobile strategy",
        "content": {
          "objective": "Po ukonczeniu tej lekcji:\n- Rozumiesz roznice miedzy emulacja a testami na realnych urzadzeniach\n- Konfigurujesz BrowserStack i SauceLabs dla testow Playwright\n- Uzywasz wbudowanej emulacji urzadzen (devices, viewport, locale, timezone)\n- Testujesz tryb offline i wolne polaczenia sieciowe\n- Testujesz wiele jezykow/lokalizacji jednoczesnie\n- Masz strategie: emulacja jako baza, real device dla krytycznych sciezek",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 4,
        "prerequisites": [],
        "tags": [
          "real-device",
          "BrowserStack",
          "SauceLabs",
          "mobile",
          "emulation",
          "viewport",
          "locale",
          "offline",
          "throttling"
        ],
        "difficulty": "advanced"
      },
      {
        "id": "13.5",
        "moduleId": 13,
        "title": "Monitorowanie wydajności i ciągła kontrola wydajności",
        "description": "Prometheus, Grafana, performance wykrywanie regresji, CI budżety wydajnościowe, alertowanie, długoterminowe śledzenie, Pushgateway, porównanie z baseline, PostgreSQL metrics",
        "content": {
          "objective": "Po ukonczeniu tej lekcji:\n- Implementujesz monitoring wydajnosci: Prometheus + Grafana\n- Wykrywasz performance regression automatycznie przez porownanie z baseline\n- Konfigurujesz CI budżety wydajnościowe z alertami Slack\n- Zapisujesz metryki do bazy czasu dla dlugoterminowych trendow\n- Masz strategie alertowania: info/warning/critical/emergency\n- Rozumiesz architekture Continuous Performance: mierz -> zapisz -> wizualizuj -> alertuj",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 5,
        "prerequisites": [],
        "tags": [
          "monitoring",
          "Prometheus",
          "Grafana",
          "regression",
          "alertowanie",
          "baseline",
          "continuous-performance",
          "metrics"
        ],
        "difficulty": "advanced"
      }
    ]
  },
  {
    "id": 14,
    "title": "Testowanie bezpieczeństwa i dostępności",
    "description": "OWASP Top 10, testowanie dostępności WCAG, podstawy testów penetracyjnych i testowanie zgodności (RODO/GDPR, PCI DSS)",
    "level": "advanced",
    "icon": "🛡️",
    "order": 14,
    "lessons": [
      {
        "id": "14.1",
        "moduleId": 14,
        "title": "Podstawy testowania bezpieczeństwa",
        "description": "OWASP Top 10, XSS, CSRF, SQLi, uwierzytelnianie, bezpieczeństwo nagłóweks, ciasteczka, CORS, dependency audit",
        "content": {
          "objective": "Po lekcji: testujesz uwierzytelnianieentication, uwierzytelnianieorization, bezpieczeństwo nagłóweks, ciasteczka, CSRF, XSS, SQL injection, CORS, dependency audit.",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 1,
        "prerequisites": [],
        "tags": [
          "bezpieczeństwo",
          "OWASP",
          "XSS",
          "CSRF",
          "SQL-injection",
          "uwierzytelnianie",
          "nagłóweks",
          "CORS"
        ],
        "difficulty": "advanced"
      },
      {
        "id": "14.2",
        "moduleId": 14,
        "title": "Kompletne testowanie dostępności",
        "description": "WCAG 2.2, axe-core, keyboard nav, ARIA, kontrast kolorów, semantyczny HTML, czytniki ekranu",
        "content": {
          "objective": "Po lekcji: setup axe-core, WCAG compliance, nawigacja klawiaturą, ARIA, kontrast kolorów, screen reader testing.",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 2,
        "prerequisites": [],
        "tags": [
          "accessibility",
          "WCAG",
          "axe-core",
          "ARIA",
          "keyboard",
          "color-contrast"
        ],
        "difficulty": "advanced"
      },
      {
        "id": "14.3",
        "moduleId": 14,
        "title": "Testy regresji wizualnej",
        "description": "toHaveScreenshot, baseline, maskowanie, wieloprzeglądarkowe, Percy, Storybook, responsive",
        "content": {
          "objective": "Po lekcji: toHaveScreenshot, baseline management, maskowanie, wieloprzeglądarkowe, Percy, responsive testy wizualne, CI.",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 3,
        "prerequisites": [],
        "tags": [
          "testy wizualne-testing",
          "screenshot",
          "baseline",
          "mask",
          "Percy",
          "wieloprzeglądarkowe",
          "responsive"
        ],
        "difficulty": "advanced"
      },
      {
        "id": "14.4",
        "moduleId": 14,
        "title": "Podstawy testow penetracyjnych",
        "description": "OWASP ZAP integration, testowanie SQL injection, wykrywanie XSS, bezpieczeństwo nagłóweks, uwierzytelnianieentication bypass, rate limiting, przechowywanie JWT bezpieczeństwo",
        "content": {
          "objective": "Po ukonczeniu tej lekcji:\n- Integrujesz OWASP ZAP z Playwright do automatycznego skanowania\n- Testujesz podstawowe wektory SQL Injection na formularzach\n- Wykrywasz XSS (reflected i stored) przez page.on(\\\"dialog\\\")\n- Sprawdzasz bezpieczeństwo nagłóweks: CSP, HSTS, X-Frame-Options\n- Testujesz rate limiting i brute force protection\n- Weryfikujesz bezpieczne przechowywanie tokenow (httpOnly cookie)",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 4,
        "prerequisites": [],
        "tags": [
          "penetration-testing",
          "OWASP-ZAP",
          "SQLi",
          "XSS",
          "bezpieczeństwo-nagłóweks",
          "uwierzytelnianieentication",
          "rate-limiting",
          "JWT"
        ],
        "difficulty": "advanced"
      },
      {
        "id": "14.5",
        "moduleId": 14,
        "title": "Testowanie zgodnosci i compliance",
        "description": "RODO/GDPR, zgoda ciasteczka, prawo do usunięcia danych, WCAG 2.1/2.2 accessibility, axe-core, ślad audytowy, data privacy (PII), PCI DSS, wymuszanie HTTPS",
        "content": {
          "objective": "Po ukonczeniu tej lekcji:\n- Testujesz RODO/GDPR: zgoda ciasteczka, prawo do usunięcia danych, data access\n- Automatyzujesz testy dostepnosci WCAG 2.1 AA przez axe-core\n- Weryfikujesz ślad audytowy: kazda istotna akcja jest logowana\n- Testujesz data privacy: PII nie wycieka, API nie zwraca nadmiarowych danych\n- Sprawdzasz PCI DSS: dane kart nie trafiaja do logow, platnosci tylko HTTPS\n- Rozumiesz ze compliance to feature - testujesz go jak kazdy inny",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 5,
        "prerequisites": [],
        "tags": [
          "compliance",
          "RODO",
          "GDPR",
          "WCAG",
          "accessibility",
          "audit-trail",
          "PII",
          "PCI-DSS",
          "data-privacy"
        ],
        "difficulty": "advanced"
      }
    ]
  },
  {
    "id": 15,
    "title": "Real-World Projects",
    "description": "Projekt e-commerce, panel SaaS, pełna konfiguracja CI/CD, projekt końcowy i certyfikacja",
    "duration": "30-40 godzin",
    "level": "expert",
    "icon": "🏆",
    "order": 15,
    "lessons": [
      {
        "id": "15.1",
        "moduleId": 15,
        "title": "Projekt testowania aplikacji e-commerce",
        "description": "Kompletny projekt e-commerce: uwierzytelnianie, produkty, koszyk, checkout, API, testy wizualne, bezpieczeństwo",
        "content": {
          "objective": "Po lekcji: budujesz kompletny test suite e-commerce: uwierzytelnianie, produkty, koszyk, checkout, API, testy wizualne, bezpieczeństwo.",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 1,
        "prerequisites": [],
        "tags": [
          "e-commerce",
          "project",
          "checkout",
          "koszyk",
          "produkty",
          "uwierzytelnianie"
        ],
        "difficulty": "expert"
      },
      {
        "id": "15.2",
        "moduleId": 15,
        "title": "Testowanie panelu aplikacji SaaS",
        "description": "Multi-tenant, subscriptions, RBAC, dashboardy, w czasie rzeczywistym, flagi funkcji, integracje",
        "content": {
          "objective": "Po lekcji: testujesz SaaS: multi-tenancy, subscriptions, RBAC, dashboardy, w czasie rzeczywistym, flagi funkcji, integracje.",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 2,
        "prerequisites": [],
        "tags": [
          "SaaS",
          "multi-tenant",
          "subscription",
          "RBAC",
          "dashboard",
          "feature-flags",
          "w czasie rzeczywistym"
        ],
        "difficulty": "expert"
      },
      {
        "id": "15.3",
        "moduleId": 15,
        "title": "Pełna konfiguracja projektu z CI/CD",
        "description": "konfiguracja repozytorium, CI/CD, bramki jakości, Conventional Commits, conventions, dokumentacja",
        "content": {
          "objective": "Po lekcji: zakladasz repo, konfigurujesz CI/CD, bramki jakości, Conventional Commits, dokumentacje, monitoring.",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 3,
        "prerequisites": [],
        "tags": [
          "project-setup",
          "CI/CD",
          "quality-gates",
          "conventional-commits",
          "dokumentacja"
        ],
        "difficulty": "expert"
      },
      {
        "id": "15.4",
        "moduleId": 15,
        "title": "Projekt końcowy i ocena finalna",
        "description": "Capstone project, kryteria certyfikacji, ścieżki kariery, ciągła nauka",
        "content": {
          "objective": "Po lekcji: planujesz capstone project, znasz wymagania certyfikacji, rozumiesz sciezki kariery.",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 4,
        "prerequisites": [],
        "tags": [
          "capstone",
          "certyfikacja",
          "career",
          "assessment"
        ],
        "difficulty": "expert"
      }
    ]
  },
  {
    "id": 16,
    "title": "Zaawansowane Tematy Testerskie",
    "description": "testowanie w Dockerze, testowanie poczty elektronicznej, WebSocket/SSE, testowaniem komponentów w Playwright, external integracje, webhooks, upload plików, Circuit Breaker",
    "level": "advanced",
    "icon": "🚀",
    "order": 16,
    "lessons": [
      {
        "id": "16.1",
        "moduleId": 16,
        "title": "Testowanie w Dockerze",
        "description": "Docker Compose for tests, Playwright Docker image, Testcontainers (PostgreSQL, Redis), tmpfs databases, healthchecks, CI parity, reproducible environments",
        "content": {
          "objective": "Po ukonczeniu tej lekcji:\n- Tworzysz docker-compose.test.yml z pelnym srodowiskiem testowym\n- Uruchamiasz testy Playwright w kontenerze Docker\n- Uzywasz Testcontainers do programatycznego zarzadzania kontenerami\n- Konfigurujesz tmpfs dla baz danych - 10x szybsze testy\n- Eliminujesz \"u mnie dziala\" przez identyczne srodowiska\n- Rozumiesz kiedy docker-compose a kiedy Testcontainers",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 1,
        "prerequisites": [],
        "tags": [
          "Docker",
          "docker-compose",
          "Testcontainers",
          "PostgreSQL",
          "Redis",
          "Playwright-Docker",
          "environment"
        ],
        "difficulty": "advanced"
      },
      {
        "id": "16.2",
        "moduleId": 16,
        "title": "Testowanie poczty elektronicznej",
        "description": "MailHog, Mailpit, testowanie SMTP, linki aktywacyjne, reset hasła flow, HTML template validation, email content asercje, REST API for emails",
        "content": {
          "objective": "Po ukonczeniu tej lekcji:\n- Konfigurujesz MailHog/Mailpit jako lokalny serwer SMTP\n- Testujesz czy email zostal wyslany po akcji uzytkownika\n- Sprawdzasz tresc emaila: temat, body, linki, dane osobowe\n- Testujesz pelny flow: rejestracja → email → link aktywacyjny\n- Testujesz reset hasla: zadanie → link → nowe haslo → logowanie\n- Walidujesz szablony HTML: brak placeholderow, poprawna struktura",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 2,
        "prerequisites": [],
        "tags": [
          "email",
          "MailHog",
          "Mailpit",
          "SMTP",
          "activation",
          "reset-password",
          "HTML-email",
          "transactional"
        ],
        "difficulty": "intermediate"
      },
      {
        "id": "16.3",
        "moduleId": 16,
        "title": "Testowanie WebSocket i SSE",
        "description": "WebSocket testing, SSE (Server-Sent Events), monitoring CDP, ponowne połączenie testing, scenariusze wielu użytkowników, w czasie rzeczywistym communication, page.evaluate WebSocket",
        "content": {
          "objective": "Po ukonczeniu tej lekcji:\n- Testujesz WebSocket: polaczenie, wysylanie/odbieranie wiadomosci\n- Monitorujesz WebSocket ramki przez Chrome DevTools Protocol (CDP)\n- Testujesz SSE (Server-Sent Events): notyfikacje, event stream\n- Testujesz ponowne połączenie: rozlaczenie → automatyczne ponowne polaczenie\n- Testujesz scenariusze multi-user z wieloma page\n- Rozumiesz ograniczenia Playwright dla WebSocket i jak je omijac",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 3,
        "prerequisites": [],
        "tags": [
          "WebSocket",
          "SSE",
          "w czasie rzeczywistym",
          "CDP",
          "ponowne połączenie",
          "multi-user",
          "chat",
          "notifications"
        ],
        "difficulty": "advanced"
      },
      {
        "id": "16.4",
        "moduleId": 16,
        "title": "testowaniem komponentów w Playwright",
        "description": "Testowanie komponentów (CT), React/Vue/Svelte components, mount(), testy wizualne regression per component, props/state testing, mockowanie API w CT, CT vs E2E vs unit",
        "content": {
          "objective": "Po ukonczeniu tej lekcji:\n- Konfigurujesz testowaniem komponentów w Playwright dla React/Vue/Svelte\n- Testujesz komponenty w izolacji przez mount()\n- Testujesz rozne propsy, stany i warianty komponentu\n- Robisz screenshoty pojedynczych komponentow (testy wizualne regression)\n- Mockujesz API w CT przez page.route()\n- Rozumiesz kiedy CT, kiedy E2E, kiedy unit test",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 4,
        "prerequisites": [],
        "tags": [
          "component-testing",
          "CT",
          "React",
          "Vue",
          "Svelte",
          "mount",
          "testy wizualne-regression",
          "component-isolation"
        ],
        "difficulty": "advanced"
      },
      {
        "id": "16.5",
        "moduleId": 16,
        "title": "Testowanie integracji zewnetrznych",
        "description": "Webhooks testing, file upload (single/multiple/drag-drop), integracje płatności (Stripe), maps, SMS (Twilio), Circuit Breaker, zapasowy interfejsu użytkownika, chaos testing",
        "content": {
          "objective": "Po ukonczeniu tej lekcji:\n- Testujesz webhooki: symulacja payloadu, weryfikacja sygnatur, sprawdzanie efektu\n- Testujesz upload plikow: pojedynczy, wielokrotny, drag & drop, walidacja typow\n- Mockujesz integracje platnosci (Stripe), mapy, SMS (Twilio)\n- Testujesz Circuit Breaker: awaria zewnetrznego API → zapasowy interfejsu użytkownika\n- Masz strategie: mock (szybko), sandbox (realistycznie), chaos (odpornosc)",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 5,
        "prerequisites": [],
        "tags": [
          "webhooks",
          "file-upload",
          "Stripe",
          "maps",
          "Twilio",
          "Circuit-Breaker",
          "fallback",
          "chaos",
          "integration"
        ],
        "difficulty": "advanced"
      }
    ]
  },
  {
    "id": 17,
    "title": "Fundamenty QA i strategia testowania",
    "description": "Teoria jakości, piramida testów, techniki projektowania przypadków, testowanie oparte na ryzyku, testowanie eksploracyjne i raportowanie błędów",
    "duration": "14-18 godzin",
    "level": "beginner",
    "icon": "🧭",
    "order": 17,
    "lessons": [
      {
        "id": "17.1",
        "moduleId": 17,
        "title": "Rola testera i strategia jakości",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 1,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "17.2",
        "moduleId": 17,
        "title": "Rodzaje testów i piramida testów",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 2,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "17.3",
        "moduleId": 17,
        "title": "Techniki projektowania testów",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 3,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "17.4",
        "moduleId": 17,
        "title": "Testowanie eksploracyjne i raportowanie błędów",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 4,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      }
    ]
  },
  {
    "id": 18,
    "title": "TypeScript, Node.js i Git dla testerów",
    "description": "Praktyczne podstawy języka, środowisko uruchomieniowe, npm, debugowania oraz pracy w repozytorium",
    "duration": "18-24 godzin",
    "level": "beginner",
    "icon": "🧑‍💻",
    "order": 18,
    "lessons": [
      {
        "id": "18.1",
        "moduleId": 18,
        "title": "Podstawy TypeScript dla automatyzacji",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 1,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "18.2",
        "moduleId": 18,
        "title": "Async/await, obietnice i obsługa błędów",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 2,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "18.3",
        "moduleId": 18,
        "title": "Node.js, npm i struktura projektu testowego",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 3,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "18.4",
        "moduleId": 18,
        "title": "Przepływ pracy testera w Git",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 4,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      }
    ]
  },
  {
    "id": 19,
    "title": "Testy jednostkowe, integracyjne i komponentowe",
    "description": "Testy niższych poziomów: Vitest/Jest, mocki, React Testing Library, integracje backendowe i dobór poziomu testu",
    "duration": "16-22 godzin",
    "level": "intermediate",
    "icon": "🧪",
    "order": 19,
    "lessons": [
      {
        "id": "19.1",
        "moduleId": 19,
        "title": "Podstawy Vitest i Jest",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 1,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "19.2",
        "moduleId": 19,
        "title": "Mocki, stuby, obiekty pozorne i szpiedzy",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 2,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "19.3",
        "moduleId": 19,
        "title": "React Testing Library i testowanie komponentów",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 3,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "19.4",
        "moduleId": 19,
        "title": "Testy integracyjne backendu",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 4,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      }
    ]
  },
  {
    "id": 20,
    "title": "SQL i bazy danych dla testerów",
    "description": "SQL, schematy, transakcje, migracje, seedowanie, sprzątanie danych i weryfikacja danych po interfejsu użytkownika/API",
    "duration": "16-20 godzin",
    "level": "intermediate",
    "icon": "🗄️",
    "order": 20,
    "lessons": [
      {
        "id": "20.1",
        "moduleId": 20,
        "title": "Podstawy SQL",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 1,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "20.2",
        "moduleId": 20,
        "title": "Relacje, ograniczenia i indeksy",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 2,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "20.3",
        "moduleId": 20,
        "title": "Transakcje, izolacja i warunki wyścigu",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 3,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "20.4",
        "moduleId": 20,
        "title": "Migracje, seedowanie i sprzątanie danych",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 4,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      }
    ]
  },
  {
    "id": 21,
    "title": "Testy kontraktowe i zarządzanie API",
    "description": "OpenAPI, Pact, kontrakty sterowane przez konsumenta, wersjonowanie, zmiany niekompatybilne i kontrakty w CI/CD",
    "duration": "14-18 godzin",
    "level": "advanced",
    "icon": "📜",
    "order": 21,
    "lessons": [
      {
        "id": "21.1",
        "moduleId": 21,
        "title": "OpenAPI jako kontrakt",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 1,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "21.2",
        "moduleId": 21,
        "title": "Testy kontraktowe sterowane przez konsumenta z Pact",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 2,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "21.3",
        "moduleId": 21,
        "title": "Wersjonowanie API i kompatybilność wsteczna",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 3,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "21.4",
        "moduleId": 21,
        "title": "Testy kontraktowe w CI/CD",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 4,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      }
    ]
  },
  {
    "id": 22,
    "title": "Mikroserwisy i systemy asynchroniczne",
    "description": "testowanie event-driven, kolejki, webhooki, ponowienia, idempotencja, spójność ostateczna i wirtualizacja usług",
    "duration": "18-24 godzin",
    "level": "advanced",
    "icon": "🕸️",
    "order": 22,
    "lessons": [
      {
        "id": "22.1",
        "moduleId": 22,
        "title": "Architektura mikroserwisowa dla testerów",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 1,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "22.2",
        "moduleId": 22,
        "title": "Testowanie kolejek i zdarzeń",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 2,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "22.3",
        "moduleId": 22,
        "title": "Webhooki, ponowienia i idempotencja",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 3,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "22.4",
        "moduleId": 22,
        "title": "Spójność ostateczna i procesy biznesowe",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 4,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      }
    ]
  },
  {
    "id": 23,
    "title": "Obserwowalność i diagnostyka systemów",
    "description": "Logi, metryki, ślady wykonania, OpenTelemetry, identyfikator korelacji, Grafana, Prometheus, SLO i diagnoza incydentów",
    "duration": "14-20 godzin",
    "level": "advanced",
    "icon": "🔭",
    "order": 23,
    "lessons": [
      {
        "id": "23.1",
        "moduleId": 23,
        "title": "Logi, metryki i ślady wykonania",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 1,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "23.2",
        "moduleId": 23,
        "title": "Identyfikator korelacji w testach",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 2,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "23.3",
        "moduleId": 23,
        "title": "Grafana, Prometheus, Loki i Kibana",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 3,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "23.4",
        "moduleId": 23,
        "title": "SLO, SLA, SLI i testowanie odporności",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 4,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      }
    ]
  },
  {
    "id": 24,
    "title": "Testowanie wydajności z k6 i JMeter",
    "description": "Load, stress, spike, soak, k6, JMeter, percentyle, progi jakości, analiza wąskich gardeł i budżety wydajnościowe",
    "duration": "18-24 godzin",
    "level": "advanced",
    "icon": "⚡",
    "order": 24,
    "lessons": [
      {
        "id": "24.1",
        "moduleId": 24,
        "title": "Testy obciążenia, przeciążenia, skoków ruchu i długotrwałej pracy",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 1,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "24.2",
        "moduleId": 24,
        "title": "Podstawy k6",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 2,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "24.3",
        "moduleId": 24,
        "title": "JMeter i testy protokołów",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 3,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "24.4",
        "moduleId": 24,
        "title": "Analiza wąskich gardeł i budżet wydajności",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 4,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      }
    ]
  },
  {
    "id": 25,
    "title": "Podstawy DevOps i środowiska testowe",
    "description": "Linux, bash, networking, Docker Compose, podstawy Kubernetes, sekrety, flagi funkcji i środowiska efemeryczne",
    "duration": "16-22 godzin",
    "level": "intermediate",
    "icon": "🛠️",
    "order": 25,
    "lessons": [
      {
        "id": "25.1",
        "moduleId": 25,
        "title": "Wiersz poleceń Linuksa i bash dla testerów",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 1,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "25.2",
        "moduleId": 25,
        "title": "Podstawy sieci",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 2,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "25.3",
        "moduleId": 25,
        "title": "Docker Compose dla środowisk testowych",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 3,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "25.4",
        "moduleId": 25,
        "title": "Kubernetes, sekrety i flagi funkcji",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 4,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      }
    ]
  },
  {
    "id": 26,
    "title": "Testowanie mobilne",
    "description": "Mobile web, PWA, aplikacje natywne i hybrydowe, Appium, farmy urządzeń, uprawnienia, gesty, deep linki i tryb offline",
    "duration": "14-20 godzin",
    "level": "advanced",
    "icon": "📱",
    "order": 26,
    "lessons": [
      {
        "id": "26.1",
        "moduleId": 26,
        "title": "Aplikacje mobilne webowe, natywne i hybrydowe",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 1,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "26.2",
        "moduleId": 26,
        "title": "Podstawy Appium",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 2,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "26.3",
        "moduleId": 26,
        "title": "Emulatory, prawdziwe urządzenia i farmy urządzeń",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 3,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "26.4",
        "moduleId": 26,
        "title": "Uprawnienia, linki głębokie i tryb offline",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 4,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      }
    ]
  },
  {
    "id": 27,
    "title": "Testowanie wspierane przez sztuczną inteligencję",
    "description": "AI do analizy wymagań, generowania przypadków testowych, danych, debugowania, przeglądu kodu i zarządzania ryzykami prywatności",
    "duration": "10-14 godzin",
    "level": "intermediate",
    "icon": "🤖",
    "order": 27,
    "lessons": [
      {
        "id": "27.1",
        "moduleId": 27,
        "title": "Sztuczna inteligencja w analizie wymagań i ryzyk",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 1,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "27.2",
        "moduleId": 27,
        "title": "Generowanie przypadków testowych i danych testowych",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 2,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "27.3",
        "moduleId": 27,
        "title": "Debugowanie wspierane przez sztuczną inteligencję i analiza logów",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 3,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "27.4",
        "moduleId": 27,
        "title": "Ryzyka sztucznej inteligencji: prywatność, halucynacje i zarządzanie",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 4,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      }
    ]
  },
  {
    "id": 28,
    "title": "Portfolio i egzamin testera full stack",
    "description": "Projekt końcowy interfejsu użytkownika + API+baza danych+CI+obserwowalności, matryca kompetencji, zadania rekrutacyjne i portfolio",
    "duration": "25-35 godzin",
    "level": "expert",
    "icon": "🎓",
    "order": 28,
    "lessons": [
      {
        "id": "28.1",
        "moduleId": 28,
        "title": "Matryca kompetencji testera full stack",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 1,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "28.2",
        "moduleId": 28,
        "title": "Projekt końcowy: interfejsu użytkownika, API, baza danych i CI",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 2,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "28.3",
        "moduleId": 28,
        "title": "Zadania rekrutacyjne i programowanie na żywo",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 3,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      },
      {
        "id": "28.4",
        "moduleId": 28,
        "title": "GitHub, CV i prezentacja portfolio",
        "description": "",
        "content": {
          "objective": "",
          "theory": "",
          "codeExamples": [],
          "exercises": [],
          "quiz": [],
          "references": [],
          "tipsAndTricks": [],
          "commonMistakes": []
        },
        "order": 4,
        "prerequisites": [],
        "tags": [],
        "difficulty": "beginner"
      }
    ]
  },
];

export const MODULES_MAP = new Map<number, Module>(allModules.map((m) => [m.id, m]));

export function getModuleById(id: number): Module | undefined {
  return MODULES_MAP.get(id);
}

export function getLessonById(moduleId: number, lessonId: string) {
  const module = getModuleById(moduleId);
  return module?.lessons.find((l) => l.id === lessonId);
}

export async function loadLessonById(moduleId: number, lessonId: string): Promise<Lesson | undefined> {
  const key = `${moduleId}-${lessonId}`;
  switch (key) {
    case '1-1.1': return (await import('./module-1/lesson-1.1')).lesson1_1;
    case '1-1.2': return (await import('./module-1/lesson-1.2')).lesson1_2;
    case '1-1.3': return (await import('./module-1/lesson-1.3')).lesson1_3;
    case '1-1.4': return (await import('./module-1/lesson-1.4')).lesson1_4;
    case '1-1.5': return (await import('./module-1/lesson-1.5')).lesson1_5;
    case '2-2.1': return (await import('./module-2/lesson-2.1')).lesson2_1;
    case '2-2.2': return (await import('./module-2/lesson-2.2')).lesson2_2;
    case '2-2.3': return (await import('./module-2/lesson-2.3')).lesson2_3;
    case '2-2.4': return (await import('./module-2/lesson-2.4')).lesson2_4;
    case '2-2.5': return (await import('./module-2/lesson-2.5')).lesson2_5;
    case '2-2.6': return (await import('./module-2/lesson-2.6')).lesson2_6;
    case '2-2.7': return (await import('./module-2/lesson-2.7')).lesson2_7;
    case '2-2.8': return (await import('./module-2/lesson-2.8')).lesson2_8;
    case '2-2.9': return (await import('./module-2/lesson-2.9')).lesson2_9;
    case '3-3.1': return (await import('./module-3/lesson-3.1')).lesson3_1;
    case '3-3.2': return (await import('./module-3/lesson-3.2')).lesson3_2;
    case '3-3.3': return (await import('./module-3/lesson-3.3')).lesson3_3;
    case '3-3.4': return (await import('./module-3/lesson-3.4')).lesson3_4;
    case '4-4.1': return (await import('./module-4/lesson-4.1')).lesson4_1;
    case '4-4.2': return (await import('./module-4/lesson-4.2')).lesson4_2;
    case '4-4.3': return (await import('./module-4/lesson-4.3')).lesson4_3;
    case '4-4.4': return (await import('./module-4/lesson-4.4')).lesson4_4;
    case '4-4.5': return (await import('./module-4/lesson-4.5')).lesson4_5;
    case '4-4.6': return (await import('./module-4/lesson-4.6')).lesson4_6;
    case '5-5.1': return (await import('./module-5/lesson-5.1')).lesson5_1;
    case '5-5.2': return (await import('./module-5/lesson-5.2')).lesson5_2;
    case '5-5.3': return (await import('./module-5/lesson-5.3')).lesson5_3;
    case '5-5.4': return (await import('./module-5/lesson-5.4')).lesson5_4;
    case '5-5.5': return (await import('./module-5/lesson-5.5')).lesson5_5;
    case '6-6.1': return (await import('./module-6/lesson-6.1')).lesson6_1;
    case '6-6.2': return (await import('./module-6/lesson-6.2')).lesson6_2;
    case '6-6.3': return (await import('./module-6/lesson-6.3')).lesson6_3;
    case '6-6.4': return (await import('./module-6/lesson-6.4')).lesson6_4;
    case '6-6.5': return (await import('./module-6/lesson-6.5')).lesson6_5;
    case '6-6.6': return (await import('./module-6/lesson-6.6')).lesson6_6;
    case '7-7.1': return (await import('./module-7/lesson-7.1')).lesson7_1;
    case '7-7.2': return (await import('./module-7/lesson-7.2')).lesson7_2;
    case '7-7.3': return (await import('./module-7/lesson-7.3')).lesson7_3;
    case '7-7.4': return (await import('./module-7/lesson-7.4')).lesson7_4;
    case '7-7.5': return (await import('./module-7/lesson-7.5')).lesson7_5;
    case '8-8.1': return (await import('./module-8/lesson-8.1')).lesson8_1;
    case '8-8.2': return (await import('./module-8/lesson-8.2')).lesson8_2;
    case '8-8.3': return (await import('./module-8/lesson-8.3')).lesson8_3;
    case '8-8.4': return (await import('./module-8/lesson-8.4')).lesson8_4;
    case '8-8.5': return (await import('./module-8/lesson-8.5')).lesson8_5;
    case '9-9.1': return (await import('./module-9/lesson-9.1')).lesson9_1;
    case '9-9.2': return (await import('./module-9/lesson-9.2')).lesson9_2;
    case '9-9.3': return (await import('./module-9/lesson-9.3')).lesson9_3;
    case '9-9.4': return (await import('./module-9/lesson-9.4')).lesson9_4;
    case '9-9.5': return (await import('./module-9/lesson-9.5')).lesson9_5;
    case '10-10.1': return (await import('./module-10/lesson-10.1')).lesson10_1;
    case '10-10.2': return (await import('./module-10/lesson-10.2')).lesson10_2;
    case '10-10.3': return (await import('./module-10/lesson-10.3')).lesson10_3;
    case '10-10.4': return (await import('./module-10/lesson-10.4')).lesson10_4;
    case '10-10.5': return (await import('./module-10/lesson-10.5')).lesson10_5;
    case '11-11.1': return (await import('./module-11/lesson-11.1')).lesson11_1;
    case '11-11.2': return (await import('./module-11/lesson-11.2')).lesson11_2;
    case '11-11.3': return (await import('./module-11/lesson-11.3')).lesson11_3;
    case '11-11.4': return (await import('./module-11/lesson-11.4')).lesson11_4;
    case '11-11.5': return (await import('./module-11/lesson-11.5')).lesson11_5;
    case '12-12.1': return (await import('./module-12/lesson-12.1')).lesson12_1;
    case '12-12.2': return (await import('./module-12/lesson-12.2')).lesson12_2;
    case '12-12.3': return (await import('./module-12/lesson-12.3')).lesson12_3;
    case '12-12.4': return (await import('./module-12/lesson-12.4')).lesson12_4;
    case '12-12.5': return (await import('./module-12/lesson-12.5')).lesson12_5;
    case '13-13.1': return (await import('./module-13/lesson-13.1')).lesson13_1;
    case '13-13.2': return (await import('./module-13/lesson-13.2')).lesson13_2;
    case '13-13.3': return (await import('./module-13/lesson-13.3')).lesson13_3;
    case '13-13.4': return (await import('./module-13/lesson-13.4')).lesson13_4;
    case '13-13.5': return (await import('./module-13/lesson-13.5')).lesson13_5;
    case '14-14.1': return (await import('./module-14/lesson-14.1')).lesson14_1;
    case '14-14.2': return (await import('./module-14/lesson-14.2')).lesson14_2;
    case '14-14.3': return (await import('./module-14/lesson-14.3')).lesson14_3;
    case '14-14.4': return (await import('./module-14/lesson-14.4')).lesson14_4;
    case '14-14.5': return (await import('./module-14/lesson-14.5')).lesson14_5;
    case '15-15.1': return (await import('./module-15/lesson-15.1')).lesson15_1;
    case '15-15.2': return (await import('./module-15/lesson-15.2')).lesson15_2;
    case '15-15.3': return (await import('./module-15/lesson-15.3')).lesson15_3;
    case '15-15.4': return (await import('./module-15/lesson-15.4')).lesson15_4;
    case '16-16.1': return (await import('./module-16/lesson-16.1')).lesson16_1;
    case '16-16.2': return (await import('./module-16/lesson-16.2')).lesson16_2;
    case '16-16.3': return (await import('./module-16/lesson-16.3')).lesson16_3;
    case '16-16.4': return (await import('./module-16/lesson-16.4')).lesson16_4;
    case '16-16.5': return (await import('./module-16/lesson-16.5')).lesson16_5;
    case '17-17.1': return (await import('./module-17/lesson-17.1')).lesson17_1;
    case '17-17.2': return (await import('./module-17/lesson-17.2')).lesson17_2;
    case '17-17.3': return (await import('./module-17/lesson-17.3')).lesson17_3;
    case '17-17.4': return (await import('./module-17/lesson-17.4')).lesson17_4;
    case '18-18.1': return (await import('./module-18/lesson-18.1')).lesson18_1;
    case '18-18.2': return (await import('./module-18/lesson-18.2')).lesson18_2;
    case '18-18.3': return (await import('./module-18/lesson-18.3')).lesson18_3;
    case '18-18.4': return (await import('./module-18/lesson-18.4')).lesson18_4;
    case '19-19.1': return (await import('./module-19/lesson-19.1')).lesson19_1;
    case '19-19.2': return (await import('./module-19/lesson-19.2')).lesson19_2;
    case '19-19.3': return (await import('./module-19/lesson-19.3')).lesson19_3;
    case '19-19.4': return (await import('./module-19/lesson-19.4')).lesson19_4;
    case '20-20.1': return (await import('./module-20/lesson-20.1')).lesson20_1;
    case '20-20.2': return (await import('./module-20/lesson-20.2')).lesson20_2;
    case '20-20.3': return (await import('./module-20/lesson-20.3')).lesson20_3;
    case '20-20.4': return (await import('./module-20/lesson-20.4')).lesson20_4;
    case '21-21.1': return (await import('./module-21/lesson-21.1')).lesson21_1;
    case '21-21.2': return (await import('./module-21/lesson-21.2')).lesson21_2;
    case '21-21.3': return (await import('./module-21/lesson-21.3')).lesson21_3;
    case '21-21.4': return (await import('./module-21/lesson-21.4')).lesson21_4;
    case '22-22.1': return (await import('./module-22/lesson-22.1')).lesson22_1;
    case '22-22.2': return (await import('./module-22/lesson-22.2')).lesson22_2;
    case '22-22.3': return (await import('./module-22/lesson-22.3')).lesson22_3;
    case '22-22.4': return (await import('./module-22/lesson-22.4')).lesson22_4;
    case '23-23.1': return (await import('./module-23/lesson-23.1')).lesson23_1;
    case '23-23.2': return (await import('./module-23/lesson-23.2')).lesson23_2;
    case '23-23.3': return (await import('./module-23/lesson-23.3')).lesson23_3;
    case '23-23.4': return (await import('./module-23/lesson-23.4')).lesson23_4;
    case '24-24.1': return (await import('./module-24/lesson-24.1')).lesson24_1;
    case '24-24.2': return (await import('./module-24/lesson-24.2')).lesson24_2;
    case '24-24.3': return (await import('./module-24/lesson-24.3')).lesson24_3;
    case '24-24.4': return (await import('./module-24/lesson-24.4')).lesson24_4;
    case '25-25.1': return (await import('./module-25/lesson-25.1')).lesson25_1;
    case '25-25.2': return (await import('./module-25/lesson-25.2')).lesson25_2;
    case '25-25.3': return (await import('./module-25/lesson-25.3')).lesson25_3;
    case '25-25.4': return (await import('./module-25/lesson-25.4')).lesson25_4;
    case '26-26.1': return (await import('./module-26/lesson-26.1')).lesson26_1;
    case '26-26.2': return (await import('./module-26/lesson-26.2')).lesson26_2;
    case '26-26.3': return (await import('./module-26/lesson-26.3')).lesson26_3;
    case '26-26.4': return (await import('./module-26/lesson-26.4')).lesson26_4;
    case '27-27.1': return (await import('./module-27/lesson-27.1')).lesson27_1;
    case '27-27.2': return (await import('./module-27/lesson-27.2')).lesson27_2;
    case '27-27.3': return (await import('./module-27/lesson-27.3')).lesson27_3;
    case '27-27.4': return (await import('./module-27/lesson-27.4')).lesson27_4;
    case '28-28.1': return (await import('./module-28/lesson-28.1')).lesson28_1;
    case '28-28.2': return (await import('./module-28/lesson-28.2')).lesson28_2;
    case '28-28.3': return (await import('./module-28/lesson-28.3')).lesson28_3;
    case '28-28.4': return (await import('./module-28/lesson-28.4')).lesson28_4;
    default: return undefined;
  }
}

export function getNextLesson(moduleId: number, lessonId: string): { moduleId: number; lessonId: string } | null {
  const module = getModuleById(moduleId);
  if (!module) return null;
  const currentIndex = module.lessons.findIndex((l) => l.id === lessonId);
  if (currentIndex === -1) return null;
  if (currentIndex < module.lessons.length - 1) return { moduleId, lessonId: module.lessons[currentIndex + 1].id };
  const sortedModules = [...allModules].sort((a, b) => a.order - b.order);
  const moduleIndex = sortedModules.findIndex((m) => m.id === moduleId);
  const nextModule = sortedModules[moduleIndex + 1];
  return nextModule?.lessons.length ? { moduleId: nextModule.id, lessonId: nextModule.lessons[0].id } : null;
}

export function getPrevLesson(moduleId: number, lessonId: string): { moduleId: number; lessonId: string } | null {
  const module = getModuleById(moduleId);
  if (!module) return null;
  const currentIndex = module.lessons.findIndex((l) => l.id === lessonId);
  if (currentIndex === -1) return null;
  if (currentIndex > 0) return { moduleId, lessonId: module.lessons[currentIndex - 1].id };
  const sortedModules = [...allModules].sort((a, b) => a.order - b.order);
  const moduleIndex = sortedModules.findIndex((m) => m.id === moduleId);
  const prevModule = sortedModules[moduleIndex - 1];
  return prevModule?.lessons.length ? { moduleId: prevModule.id, lessonId: prevModule.lessons[prevModule.lessons.length - 1].id } : null;
}

export function searchLessons(query: string): { module: Module; lesson: Module['lessons'][0] }[] {
  const results: { module: Module; lesson: Module['lessons'][0] }[] = [];
  const lowerQuery = query.toLowerCase();
  for (const module of allModules) {
    for (const lesson of module.lessons) {
      if (lesson.title.toLowerCase().includes(lowerQuery) || lesson.description.toLowerCase().includes(lowerQuery) || lesson.tags?.some((t) => t.toLowerCase().includes(lowerQuery)) || lesson.content.objective.toLowerCase().includes(lowerQuery)) {
        results.push({ module, lesson });
      }
    }
  }
  return results;
}

export function getAllLessons(): { module: Module; lesson: Module['lessons'][0] }[] {
  return allModules.flatMap((module) => module.lessons.map((lesson) => ({ module, lesson })));
}

export function getTotalLessonsCount(): number {
  return allModules.reduce((acc, m) => acc + m.lessons.length, 0);
}
