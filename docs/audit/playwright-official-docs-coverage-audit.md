# Audyt pokrycia Playwright w aplikacji

Data audytu: 2026-07-09  
Gałąź robocza: `arena/workspace-changes`  
Zakres: oficjalna dokumentacja Playwright stable z `https://playwright.dev/docs/*`, z pominięciem na razie tematów MCP/Agent CLI oraz innych narzędzi full-stack, które będą audytowane osobno.

## 1. Źródło prawdy

Jako źródło prawdy przyjmuję oficjalną dokumentację Playwright:

- `https://playwright.dev/docs/intro`
- `https://playwright.dev/docs/writing-tests`
- `https://playwright.dev/docs/running-tests`
- `https://playwright.dev/docs/locators`
- `https://playwright.dev/docs/other-locators`
- `https://playwright.dev/docs/actionability`
- `https://playwright.dev/docs/test-assertions`
- `https://playwright.dev/docs/test-fixtures`
- `https://playwright.dev/docs/test-configuration`
- `https://playwright.dev/docs/test-use-options`
- `https://playwright.dev/docs/test-projects`
- `https://playwright.dev/docs/test-annotations`
- `https://playwright.dev/docs/test-timeouts`
- `https://playwright.dev/docs/test-retries`
- `https://playwright.dev/docs/test-parallel`
- `https://playwright.dev/docs/test-sharding`
- `https://playwright.dev/docs/test-reporters`
- `https://playwright.dev/docs/test-snapshots`
- `https://playwright.dev/docs/test-ui-mode`
- `https://playwright.dev/docs/debug`
- `https://playwright.dev/docs/trace-viewer`
- `https://playwright.dev/docs/codegen-intro`
- `https://playwright.dev/docs/codegen`
- `https://playwright.dev/docs/auth`
- `https://playwright.dev/docs/api-testing`
- `https://playwright.dev/docs/network`
- `https://playwright.dev/docs/mock`
- `https://playwright.dev/docs/mock-browser-apis`
- `https://playwright.dev/docs/browsers`
- `https://playwright.dev/docs/browser-contexts`
- `https://playwright.dev/docs/pages`
- `https://playwright.dev/docs/navigations`
- `https://playwright.dev/docs/input`
- `https://playwright.dev/docs/dialogs`
- `https://playwright.dev/docs/downloads`
- `https://playwright.dev/docs/screenshots`
- `https://playwright.dev/docs/videos`
- `https://playwright.dev/docs/emulation`
- `https://playwright.dev/docs/frames`
- `https://playwright.dev/docs/handles`
- `https://playwright.dev/docs/evaluating`
- `https://playwright.dev/docs/events`
- `https://playwright.dev/docs/clock`
- `https://playwright.dev/docs/pom`
- `https://playwright.dev/docs/accessibility-testing`
- `https://playwright.dev/docs/aria-snapshots`
- `https://playwright.dev/docs/test-components`
- `https://playwright.dev/docs/ci-intro`
- `https://playwright.dev/docs/ci`
- `https://playwright.dev/docs/docker`
- `https://playwright.dev/docs/best-practices`
- `https://playwright.dev/docs/service-workers`
- `https://playwright.dev/docs/chrome-extensions`
- `https://playwright.dev/docs/webview2`
- `https://playwright.dev/docs/library`
- `https://playwright.dev/docs/extensibility`

Dodatkowo należy uwzględnić API reference dla klas, które testerzy faktycznie wykorzystują: `Page`, `Locator`, `Browser`, `BrowserContext`, `Frame`, `FrameLocator`, `APIRequestContext`, `APIResponse`, `Request`, `Response`, `Route`, `Download`, `FileChooser`, `Dialog`, `ConsoleMessage`, `WebSocket`, `Worker`, `Clock`, `Tracing`, `Test`, `TestInfo`, `TestStepInfo`, `Fixtures`, `Reporter`, `LocatorAssertions`, `PageAssertions`, `APIResponseAssertions`, `GenericAssertions`, `SnapshotAssertions`.

## 2. Główna diagnoza

Aplikacja ma bardzo dobry szkielet programu i szeroki zakres, ale treść jest nierówna:

1. Część lekcji jest rozbudowana i praktyczna, np. `5.1`, `4.2`, `10.2`, `11.x`, `13.x`, `15.x`.
2. Wiele lekcji ma 300–600 słów i wygląda jak streszczenie, nie jak samodzielna lekcja dla osoby uczącej się od zera do poziomu komercyjnego.
3. Część oficjalnych tematów Playwright jest obecna tylko pośrednio albo hasłowo.
4. Brakuje jednolitego standardu lekcji: cel, teoria, kiedy używać, kiedy nie używać, przykłady podstawowe i zaawansowane, typowe błędy, ćwiczenie, checklisty oraz linki do oficjalnej dokumentacji.
5. Należy rozdzielić tematy „Playwright Test” od tematów „Playwright Library”, bo oficjalna dokumentacja opisuje oba tryby pracy.

## 3. Standard docelowy każdej lekcji Playwright

Każda lekcja dotycząca Playwright powinna mieć minimum:

- 1500–3000 słów teorii dla tematów podstawowych i średniozaawansowanych;
- krótkie wyjaśnienie problemu, który temat rozwiązuje;
- sekcję „kiedy używać / kiedy nie używać”;
- minimum 2–4 kompletne przykłady TypeScript;
- przykład błędnego kodu i poprawionej wersji;
- checklistę review;
- ćwiczenie praktyczne;
- typowe błędy i flakiness traps;
- odniesienia do oficjalnej dokumentacji;
- nazewnictwo zgodne z aktualnym Playwright: locatory, web-first assertions, fixtures, projects, workers, trace, UI mode, storage state itd.

## 4. Mapa pokrycia oficjalnych tematów Playwright

| Temat oficjalny | Aktualne pokrycie w aplikacji | Status | Zalecane działanie |
|---|---|---|---|
| Installation / intro | moduł 1 | Częściowe | ujednolicić 1.1–1.5, dodać aktualne wymagania Node, komendy npm/yarn/pnpm, update Playwright |
| VS Code extension | brak osobnej lekcji | Brak | dodać do modułu 1 albo nową lekcję „VS Code extension i codegen” |
| CLI | rozproszone | Częściowe | dodać komendy `test`, `show-report`, `codegen`, `install`, `--project`, `--grep`, `--debug`, `--ui`, `--trace` |
| Writing tests | 1.5, 5.1 | Częściowe | spiąć pierwszy test z runnerem, krokami, fixtures i asercjami |
| Running tests | 5.1, 5.4 | Częściowe | rozbudować 5.4 o grep, project, headed, debug, UI, workers, list reporter |
| Locators | 2.3, 2.5, 8.2 | Częściowe | dodać pełną strategię locatorów: role, text, label, placeholder, altText, title, testId, filter, has/hasText, nth, strictness |
| Other locators | częściowo 2.3/8.2 | Słabe | dodać CSS/XPath jako wyjątek, React/Vue locators jeśli używane, shadow DOM ograniczenia |
| Actionability / auto-waiting | 2.4 | Słabe | rozbudować o pełne checki: visible, stable, receives events, enabled, editable; `force`, trial, timeout |
| Assertions | moduł 3 | Częściowe | rozbudować o pełną listę LocatorAssertions/PageAssertions/APIResponseAssertions/SnapshotAssertions/soft assertions/poll/toPass |
| Test fixtures | 5.2, 6.6 | Słabe | pilnie rozbudować: built-in fixtures, custom fixtures, worker/test scope, auto fixtures, options, mergeTests, types |
| Test configuration | 1.4, 5.3 | Częściowe | rozbudować o `defineConfig`, `use`, `expect`, `metadata`, `globalTimeout`, `fullyParallel`, `forbidOnly`, `outputDir` |
| Use options | 5.3, 4.6 | Częściowe | wydzielić pełną listę: baseURL, storageState, viewport, permissions, locale, timezoneId, geolocation, video, screenshot, trace, proxy, httpCredentials |
| Projects | 5.3 | Słabe | dodać osobną sekcję: multi-browser, mobile emulation, dependencies/setup project, teardown project, grep per project |
| Annotations/tags | 5.1, 5.5 | Częściowe | rozbudować 5.5: `tag`, `annotation`, `skip`, `fixme`, `fail`, `slow`, custom annotations, grep |
| Timeouts | 5.1, 5.3 | Słabe | dodać: test timeout, expect timeout, action/navigation timeout, fixture timeout, global timeout |
| Retries | 5.1, 5.4/9.x | Częściowe | dodać strategię retries vs flakiness, trace on retry, flaky classification |
| Parallelism | 5.4 | Słabe | rozbudować: workers, file-level, describe.configure, serial/parallel, workerIndex/parallelIndex, isolation danych |
| Sharding | 5.4 | Słabe | dodać komendy, CI matrix, równoważenie shardów i artefakty |
| Reporters | 10.1–10.5 | Dobre | uzupełnić o aktualne wbudowane reportery i attachmenty z `testInfo` |
| Snapshots / visual | 2.9, 14.3 | Częściowe | dodać snapshoty tekstowe, aria snapshots, visual snapshots, konfigurację tolerancji |
| UI Mode | 9.1, 5.1 | Częściowe | dodać osobny fragment: watch mode, filters, timeline, trace integration |
| Debugging | 9.1–9.5 | Częściowe | dobre fundamenty, dopisać `PWDEBUG`, `page.pause`, VS Code debugger, UI mode, trace artifacts |
| Trace viewer | 9.1 | Częściowe | rozbudować o konfigurację `trace: on-first-retry/on/retain-on-failure`, attach, CI |
| Codegen | brak wyraźnej lekcji | Brak | dodać lekcję lub sekcję: nagrywanie, pick locator, generowanie asercji, ograniczenia codegen |
| Authentication | 4.5 | Częściowe | rozbudować: setup project, storageState, per-worker auth, multiple roles, API auth, sessionStorage workaround |
| API testing | 3.3, 8.1–8.5 | Częściowe | dodać pełny `request` fixture, isolated APIRequestContext, failOnStatusCode, storageState, auth, multipart, JSON/schema |
| Network | 4.4, 16.3 | Częściowe | rozbudować: request/response events, waitForResponse, HAR, service workers, WebSocketRoute |
| Mocking APIs | 4.4 | Częściowe | dodać fulfill/abort/continue/fallback, routeFromHAR, GraphQL mocking, partial mocks |
| Mock browser APIs | brak | Brak | dodać: mockowanie Date/Random/local APIs, permissions, geolocation, clipboard/media |
| Browser contexts | 2.1, 4.x | Częściowe | rozbudować izolację, storage, cookies, permissions, multiple contexts, persistent context |
| Pages / popups | 4.1 | Dobre/częściowe | dopisać event patterns, popup race conditions, multi-tab auth/session |
| Navigation | 2.2 | Słabe | rozbudować o `goto`, `waitForURL`, `waitForLoadState`, SPA, history API, downloads/navigation race |
| Input | 2.6–2.8 | Częściowe | dopisać keyboard, mouse, touch, drag/drop, file uploads, selectOption, check/uncheck, fill vs pressSequentially |
| Dialogs | brak wyraźnej lekcji | Brak | dodać alert/confirm/prompt/beforeunload, event handling |
| Downloads | 2.7 | Słabe | rozbudować o `download.path`, `saveAs`, suggestedFilename, cleanup, remote browser limitations |
| Screenshots | 2.9/14.3 | Częściowe | dodać fullPage, locator screenshot, masks, style, animations, caret, scale |
| Videos | brak/cząstkowo | Brak | dodać konfigurację `recordVideo`/`video`, retencję, CI artifacts |
| Emulation | 4.6, 13.4 | Częściowe | rozbudować: devices, viewport, userAgent, locale, timezone, colorScheme, reducedMotion, contrast, offline |
| Frames | 4.2 | Dobre | utrzymać, dopisać frame events i frame locator pitfalls |
| Handles / JSHandle / ElementHandle | brak/cząstkowo | Brak | dodać lekcję o evaluate/handles i dlaczego preferować locatory |
| Evaluating JS | brak/cząstkowo | Brak | dodać `page.evaluate`, `evaluateHandle`, serializacja, bezpieczeństwo i antywzorce |
| Events | brak/cząstkowo | Brak | dodać wzorce `waitForEvent`, event-first pattern, race conditions |
| Clock | brak | Brak | dodać lekcję o `page.clock`, mockowaniu czasu i deterministycznych testach |
| POM | moduł 6 | Częściowe/dobre | dopisać locator-first POM, fixtures + POM, komponenty, antywzorce |
| Accessibility | 14.2 | Częściowe | dopisać oficjalne podejście: Axe fixture, aria snapshots, accessible name/role assertions |
| Components | 16.4 | Słabe | rozbudować Playwright component testing: setup, mount, fixtures, routing, porównanie z RTL |
| CI | moduł 11 | Dobre | dopisać oficjalny minimalny workflow, browsers cache, shards, artifacts, HTML report |
| Docker | 16.1 | Dobre/częściowe | dopisać oficjalne obrazy, `--with-deps`, root/non-root, xvfb, trace artifacts |
| Best practices | 12.x | Częściowe | scalić z oficjalnymi zasadami: user-visible locators, isolation, no sleeps, web-first assertions |
| Service workers | brak | Brak | dodać ostrzeżenia przy network mocking i konfigurację `serviceWorkers: block` |
| Chrome extensions | brak | Brak | dodać jako temat zaawansowany: persistent context, channel chromium |
| WebView2 | brak | Brak | dodać jako niszowy temat zaawansowany albo appendix |
| Library mode | brak wyraźnej lekcji | Brak | dodać różnicę Playwright Test vs Playwright Library |
| Extensibility | 10.2 + fixtures | Częściowe | uzupełnić o custom reporters, matchers, fixtures, wrappers |

## 5. Audyt moduł po module

### Moduł 1 — Wprowadzenie i konfiguracja

Status: częściowo dobry, ale nierówny. `1.2` i `1.5` są mocne, `1.1`, `1.3`, `1.4` są zbyt krótkie względem celu kursu.

Do poprawy:

- dopisać aktualny obraz Playwright Test jako frameworka: runner, assertions, fixtures, isolation, tooling;
- dodać VS Code Extension i CLI workflow;
- uaktualnić instalację: npm/yarn/pnpm, `npx playwright install --with-deps`, aktualizacja wersji;
- rozbudować strukturę projektu o `playwright.config.ts`, `tests`, `test-results`, `playwright-report`, `.auth`, `global setup`, `fixtures`;
- wskazać różnicę między Playwright Test i Playwright Library.

### Moduł 2 — Podstawy Playwright

Status: dużo ważnych tematów ma tylko 250–450 słów. To powinien być jeden z najmocniejszych modułów.

Do poprawy:

- pełna strategia locatorów, strict mode i priorytety locatorów;
- auto-waiting/actionability z pełną tabelą warunków;
- nawigacje w SPA i klasyczne nawigacje;
- akcje input: keyboard, mouse, touch, select, checkbox, upload, drag/drop;
- downloads i screenshots nie mogą być tylko krótkimi wzmiankami;
- dodać antywzorce: `waitForTimeout`, kruche CSS/XPath, `nth()` bez uzasadnienia.

### Moduł 3 — Asercje i weryfikacje

Status: częściowe. `3.2` i `3.4` są przyzwoite, `3.1` i `3.3` wymagają dużego rozszerzenia.

Do poprawy:

- rozdzielić web-first assertions od asercji ogólnych;
- dopisać `expect.soft`, `expect.poll`, `expect.toPass`;
- dopisać `PageAssertions`, `LocatorAssertions`, `APIResponseAssertions`, `SnapshotAssertions`;
- uzupełnić API testing o request fixture i APIRequestContext.

### Moduł 4 — Mechanizmy zaawansowane przeglądarki

Status: dobry szkielet, ale niepełny wobec oficjalnych tematów.

Do poprawy:

- `4.2` iframe jest mocne;
- `4.4` sieć wymaga dodania HAR, service workers, WebSocketRoute, waitForRequest/Response, GraphQL;
- `4.5` auth wymaga storageState/setup project/per-worker auth/multiple roles;
- `4.6` emulacja wymaga aktualizacji o locale/timezone/colorScheme/reducedMotion/contrast/offline.

Braki w module lub okolicy:

- dialogs;
- events;
- evaluating JavaScript;
- handles;
- clock;
- browser API mocks.

### Moduł 5 — Runner testów i fikstury

Status: największa nierówność wskazana przez użytkownika jest potwierdzona. `5.1` ma ok. 3300 słów i jest jakościowo dużo lepsza niż `5.2`–`5.5`, które mają ok. 339–546 słów.

Priorytet P0:

- rozbudować `5.2 Fixtures` do poziomu lekcji kompletnej: built-in fixtures, custom fixtures, scope, auto, option fixtures, merge, types, teardown;
- rozbudować `5.3 Configuration`: pełny `defineConfig`, `use`, `projects`, `expect`, output, metadata, global settings;
- rozbudować `5.4 Parallelism`: workers, file/test level, serial, sharding, data isolation, CI matrix;
- rozbudować `5.5 Organization/tagging`: tags, annotations, grep, folder structure, naming, test plan mapping.

### Moduł 6 — Page Object Model

Status: `6.1` jest dobre, reszta zbyt skrótowa.

Do poprawy:

- locator-first POM;
- komponentowe Page Objecty;
- fixtures + POM;
- API client jako POM/Service Object;
- antywzorce: ukrywanie asercji, dziedziczenie ponad kompozycję, POM jako „god object”.

### Moduł 7 — Dane testowe

Status: `7.1` mocne, reszta streszczeniowa.

Do poprawy w kontekście Playwright:

- dane per worker i per test;
- `testInfo.parallelIndex`, `workerIndex`;
- auth state per rola/per worker;
- cleanup i idempotencja;
- dane UI + API + DB w jednym scenariuszu.

### Moduł 8 — API testing

Status: dobry początek, ale temat oficjalnego API testing w Playwright wymaga doprecyzowania.

Do poprawy:

- `request` fixture;
- `playwright.request.newContext()`;
- izolacja cookies/storage między UI i API;
- `APIResponseAssertions`;
- multipart/form-data, headers, auth;
- `failOnStatusCode`, retry na poziomie API, tracing/logowanie requestów;
- użycie API do setup/teardown stanu testu.

### Moduł 9 — Debugowanie

Status: umiarkowanie dobry, ale wymaga aktualizacji do pełnego toolingu Playwright.

Do poprawy:

- Playwright Inspector;
- `PWDEBUG=1`;
- `page.pause()`;
- UI Mode;
- Trace Viewer;
- VS Code Extension;
- debugowanie w CI przez artefakty;
- test.step i attachments jako narzędzia diagnozy.

### Moduł 10 — Raportowanie

Status: jeden z mocniejszych modułów.

Do poprawy:

- dodać pełną listę oficjalnych reporterów;
- dopisać `testInfo.attach`, attachment lifecycle, trace/video/screenshot w HTML report;
- spiąć z CI artifacts.

### Moduł 11 — CI/CD

Status: mocny moduł.

Do poprawy w kontekście Playwright:

- minimalny oficjalny GitHub Actions workflow;
- instalacja browsers/deps;
- sharding w CI;
- raport HTML jako artifact;
- cache i trade-offy;
- strategie uruchamiania smoke/regression/nightly.

### Moduł 12 — Dobre praktyki

Status: nierówny.

Do poprawy:

- przenieść oficjalne best practices Playwright do jednej checklisty;
- nie używać `waitForTimeout`;
- preferować locatory widoczne dla użytkownika;
- izolacja testów;
- testy niezależne od kolejności;
- mockować tylko tam, gdzie to uzasadnione.

### Moduł 13 — Wydajność i optymalizacja

Status: treści długie, ale trzeba odróżnić wydajność aplikacji od wydajności suite Playwright.

Do poprawy:

- optymalizacja workers/projects/shards;
- minimalizacja heavy setup;
- reuse auth state;
- trace/video tylko kiedy potrzebne;
- testowanie web performance przez Performance API/CDP jako temat zaawansowany.

### Moduł 14 — Bezpieczeństwo i dostępność

Status: dostępność i visual regression są obecne, ale wymagają powiązania z oficjalnym Playwright.

Do poprawy:

- aria snapshots;
- role/name assertions;
- Axe jako fixture;
- visual snapshots z tolerancjami;
- security tests jako sanity checks, nie pełny pentest.

### Moduł 15 — Projekty praktyczne

Status: mocne treści projektowe.

Do poprawy:

- każdy projekt powinien mapować konkretne elementy Playwright: UI, API, auth state, fixtures, POM, CI, trace, report, sharding;
- dodać rubrykę oceny pokrycia funkcji Playwright.

### Moduł 16 — Środowiska i integracje specjalistyczne

Status: `16.1` dobre, `16.2`–`16.5` krótkie.

Do poprawy:

- Docker z oficjalnymi obrazami Playwright;
- komponent testing;
- WebSocketRoute i obsługa network events;
- upload/download jako osobny praktyczny flow;
- integracje zewnętrzne z route mocking/HAR.

## 6. Największe braki wymagające dodania nowych lekcji lub sekcji

P0 — pilne, bo to codzienna praca testera automatyzującego:

1. VS Code Extension + Codegen + Pick Locator.
2. Pełna lekcja o CLI Playwright.
3. Fixtures — wersja kompletna.
4. Projects/use options/configuration — wersja kompletna.
5. Parallelism/workers/sharding — wersja kompletna.
6. Authentication storage state/setup project/per-worker/multiple roles.
7. APIRequestContext/request fixture/APIResponseAssertions.
8. Network mocking + HAR + service worker caveats.
9. Debugging: UI Mode, Inspector, Trace, VS Code.
10. Pełna strategia locatorów i actionability.

P1 — ważne tematy zaawansowane:

1. Dialogs.
2. Events i event-first pattern.
3. Evaluating JavaScript.
4. JSHandle/ElementHandle i kiedy ich unikać.
5. Clock/time mocking.
6. Mock browser APIs.
7. Videos.
8. Aria snapshots.
9. Component testing.
10. Chrome extensions.

P2 — appendix / specjalistyczne:

1. WebView2.
2. Selenium Grid migration.
3. Puppeteer/Protractor migration.
4. Playwright Library mode.
5. Canary releases.

## 7. Plan naprawczy

Proponowany porządek prac:

1. Najpierw wyrównać moduły 1–5, bo to fundament kursu.
2. Następnie moduły 6–9: architektura, dane, API, debugowanie.
3. Następnie moduły 10–16: raportowanie, CI, praktyki, Docker, accessibility, component testing.
4. Dopiero potem przejść do narzędzi full-stack spoza Playwright.

## 8. Pierwszy konkretny backlog zmian

### Moduł 5 — natychmiastowa poprawa

- `lesson-5.2.md` — przepisać do pełnego przewodnika po fixtures.
- `lesson-5.3.md` — przepisać do pełnego przewodnika po konfiguracji.
- `lesson-5.4.md` — przepisać do pełnego przewodnika po parallelism/sharding.
- `lesson-5.5.md` — przepisać do pełnego przewodnika po organizacji, tagach i adnotacjach.
- Zaktualizować `lesson-5.2.ts`–`lesson-5.5.ts`: opisy, przykłady, quizy, ćwiczenia, references.

### Moduł 2 — drugi priorytet

- `lesson-2.2.md` — nawigacje.
- `lesson-2.3.md` — locatory.
- `lesson-2.4.md` — actionability.
- `lesson-2.5.md` — zaawansowana praca z locatorami.
- `lesson-2.6.md`–`2.8.md` — input/mouse/keyboard/touch/upload/download.

### Moduł 4 — trzeci priorytet

- dodać/rozszerzyć: dialogs, events, evaluating, handles, clock, service workers.

## 9. Decyzja redakcyjna

Nie należy jedynie dopisywać krótkich akapitów. Trzeba potraktować Playwright jako osobny kompletny curriculum. Docelowo aplikacja powinna mieć mapę: „oficjalny temat Playwright → lekcja lub sekcja w aplikacji”. Jeśli temat z dokumentacji jest używany w codziennej pracy automatyka, powinien być opisany praktycznie, z przykładami i ćwiczeniem.
