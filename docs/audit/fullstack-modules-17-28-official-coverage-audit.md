# Audyt pokrycia modułów 17–28 — Full Stack Tester poza Playwright

Data audytu: 2026-07-09  
Gałąź robocza: `arena/workspace-changes`  
Zakres: moduły `17`–`28`, czyli obszary wykraczające poza rdzeń Playwright: fundamenty testowania, TypeScript/Node/Git, testy jednostkowe i komponentowe, SQL, kontrakty API, mikroserwisy, obserwowalność, wydajność, DevOps, mobile, AI oraz portfolio.

## 1. Założenie audytu

W poprzednim audycie głównym źródłem prawdy była oficjalna dokumentacja Playwright. Dla modułów 17–28 zakres jest szerszy, więc źródłem prawdy nie może być jedna dokumentacja. Dla każdego obszaru przyjmuję oficjalne lub wysokiej wiarygodności źródła:

- dokumentacje projektów i narzędzi;
- specyfikacje techniczne;
- dokumentacje organizacji utrzymujących standard;
- oficjalne przewodniki narzędzi;
- materiały organizacji branżowych, np. OWASP, CNCF, OpenAPI Initiative.

Celem audytu nie jest jeszcze przepisywanie lekcji, tylko wskazanie:

1. co jest dobrze pokryte;
2. co jest zbyt skrótowe;
3. jakie tematy z oficjalnych źródeł są pominięte;
4. które poprawki mają najwyższy priorytet.

## 2. Oficjalne i sprawdzone źródła przyjęte do audytu

### Testowanie, strategia jakości, techniki projektowania

- ISTQB Certified Tester Foundation Level syllabus: `https://www.istqb.org/certifications/certified-tester-foundation-level`
- ISO/IEC/IEEE 29119 — standardy testowania oprogramowania: `https://www.iso.org/standard/81291.html`
- OWASP Web Security Testing Guide: `https://owasp.org/www-project-web-security-testing-guide/`
- OWASP Top 10: `https://owasp.org/www-project-top-ten/`

### TypeScript, Node.js, Git

- TypeScript Handbook: `https://www.typescriptlang.org/docs/`
- TypeScript TSConfig Reference: `https://www.typescriptlang.org/tsconfig/`
- Node.js Learn: `https://nodejs.org/en/learn`
- Node.js API docs: `https://nodejs.org/api/`
- npm docs: `https://docs.npmjs.com/`
- Git official docs: `https://git-scm.com/docs`

### Testy jednostkowe, integracyjne i komponentowe

- Vitest docs: `https://vitest.dev/guide/`
- Jest docs: `https://jestjs.io/docs/getting-started`
- React Testing Library docs: `https://testing-library.com/docs/react-testing-library/intro/`
- Testing Library guiding principles: `https://testing-library.com/docs/guiding-principles`
- MSW docs: `https://mswjs.io/docs/`

### SQL i bazy danych

- PostgreSQL documentation: `https://www.postgresql.org/docs/current/`
- PostgreSQL Tutorial: `https://www.postgresql.org/docs/current/tutorial.html`
- PostgreSQL Transactions: `https://www.postgresql.org/docs/current/tutorial-transactions.html`
- MySQL Reference Manual: `https://dev.mysql.com/doc/refman/8.4/en/`
- SQLite documentation: `https://www.sqlite.org/docs.html`

### API, kontrakty, wersjonowanie

- OpenAPI Specification: `https://spec.openapis.org/oas/latest.html`
- OpenAPI Initiative: `https://www.openapis.org/`
- Pact docs: `https://docs.pact.io/`
- AsyncAPI docs/spec: `https://www.asyncapi.com/docs`
- JSON Schema: `https://json-schema.org/`

### Mikroserwisy, kolejki, systemy asynchroniczne

- Apache Kafka docs: `https://kafka.apache.org/documentation/`
- RabbitMQ docs: `https://www.rabbitmq.com/docs`
- NATS docs: `https://docs.nats.io/`
- AsyncAPI: `https://www.asyncapi.com/docs`
- CloudEvents specification: `https://cloudevents.io/`

### Obserwowalność i diagnostyka

- OpenTelemetry docs: `https://opentelemetry.io/docs/`
- Prometheus docs: `https://prometheus.io/docs/introduction/overview/`
- Grafana docs: `https://grafana.com/docs/grafana/latest/`
- Grafana Loki docs: `https://grafana.com/docs/loki/latest/`
- Elastic/Kibana docs: `https://www.elastic.co/guide/index.html`
- Google SRE Book: `https://sre.google/sre-book/table-of-contents/`

### Wydajność

- Grafana k6 docs: `https://grafana.com/docs/k6/latest/`
- Apache JMeter user manual: `https://jmeter.apache.org/usermanual/get-started.html`
- Web.dev performance: `https://web.dev/learn/performance/`
- Lighthouse docs: `https://developer.chrome.com/docs/lighthouse/overview`

### DevOps, Docker, Kubernetes

- Docker docs: `https://docs.docker.com/`
- Docker Compose docs: `https://docs.docker.com/compose/`
- Dockerfile reference: `https://docs.docker.com/reference/dockerfile/`
- Kubernetes docs: `https://kubernetes.io/docs/home/`
- kubectl reference: `https://kubernetes.io/docs/reference/kubectl/`
- CNCF Cloud Native Landscape: `https://landscape.cncf.io/`

### Mobile testing

- Appium docs: `https://appium.io/docs/en/latest/`
- Android Developers testing docs: `https://developer.android.com/training/testing`
- Apple XCTest docs: `https://developer.apple.com/documentation/xctest`
- BrowserStack App Automate docs: `https://www.browserstack.com/docs/app-automate`

### AI/LLM w testowaniu

- OWASP Top 10 for LLM Applications / GenAI Security Project: `https://owasp.org/www-project-top-10-for-large-language-model-applications/`
- NIST AI Risk Management Framework: `https://www.nist.gov/itl/ai-risk-management-framework`
- OpenAI API docs: `https://platform.openai.com/docs`
- Anthropic docs: `https://docs.anthropic.com/`
- Google Gemini API docs: `https://ai.google.dev/docs`

### Portfolio, GitHub, rekrutacja

- GitHub Docs: `https://docs.github.com/`
- GitHub Actions docs: `https://docs.github.com/en/actions`
- Conventional Commits: `https://www.conventionalcommits.org/`
- ADR: `https://adr.github.io/`

## 3. Diagnoza ogólna modułów 17–28

Moduły 17–28 mają dobry kierunek i szeroki zakres. Widać próbę zbudowania pełnego profilu Full Stack Testera, nie tylko automatyka UI. Jednak poziom szczegółowości jest nierówny:

- **Bardzo mocne moduły:** 20, 21, 22, 23, 26, 28 — lekcje są długie, praktyczne i obejmują wiele istotnych tematów.
- **Średnie / wymagające uzupełnienia:** 17, 18, 24, 25, 27 — część lekcji jest mocna, część skrótowa.
- **Największe luki objętościowe:** 19, 24.2–24.4, 25.2–25.4, 27.2–27.4 — wiele lekcji ma około 500–600 słów i wymaga rozbudowania.
- **Największe luki merytoryczne:** moduł 19 względem Vitest/Jest/RTL/MSW, moduł 24 względem oficjalnych k6/JMeter, moduł 25 względem Docker/Kubernetes/networking, moduł 27 względem AI security, prompt injection, privacy, governance i ewaluacji LLM.

## 4. Audyt moduł po module

---

## Moduł 17 — Fundamenty pracy testera i strategia jakości

### Aktualny stan

Lekcje:

- `17.1` — strategia jakości i zarządzanie ryzykiem — rozbudowana;
- `17.2` — rodzaje testów i piramida — krótka;
- `17.3` — techniki projektowania testów — krótka;
- `17.4` — eksploracja i raportowanie błędów — krótka.

### Źródła odniesienia

- ISTQB CTFL syllabus;
- ISO/IEC/IEEE 29119;
- OWASP WSTG dla perspektywy security testing;
- Google Testing Blog / SRE Book jako uzupełnienie praktyczne.

### Co jest dobrze pokryte

- Myślenie o jakości jako strategii, nie tylko testach;
- ryzyko i priorytetyzacja;
- ogólny podział typów testów;
- eksploracja i raportowanie błędów.

### Braki względem oficjalnych sylabusów i praktyki

Warto dodać:

1. Pełniejszy opis **techniki projektowania testów**:
   - klasy równoważności;
   - analiza wartości brzegowych;
   - tablice decyzyjne;
   - przejścia stanów;
   - testowanie par / pairwise;
   - use case testing;
   - error guessing.
2. Różnicę między:
   - test basis;
   - test condition;
   - test case;
   - test procedure;
   - test suite;
   - test oracle.
3. Defekt vs błąd vs awaria vs root cause.
4. Entry/exit criteria.
5. Traceability matrix.
6. Test monitoring and control.
7. Test estimation.
8. Risk-based testing w praktyce backlogu i CI.

### Priorytet

**P1** — moduł jest ważny jako fundament teoretyczny. Lekcje 17.2–17.4 powinny zostać rozbudowane do minimum 1000–1500 słów każda.

---

## Moduł 18 — TypeScript, Node.js i Git dla testerów

### Aktualny stan

Moduł jest mocny objętościowo. Lekcje mają po 2200–3000 słów.

### Źródła odniesienia

- TypeScript Handbook;
- TSConfig Reference;
- Node.js Learn/API;
- npm docs;
- Git official docs.

### Co jest dobrze pokryte

- TypeScript dla automatyzacji;
- async/await;
- Node.js i npm;
- Git workflow.

### Braki lub ryzyka

Do sprawdzenia i uzupełnienia:

1. TypeScript:
   - `unknown` vs `any`;
   - narrowing;
   - utility types;
   - generics dla fixtures i API clients;
   - strict mode;
   - `satisfies`;
   - typowanie danych z OpenAPI.
2. Node.js:
   - ESM vs CJS;
   - event loop;
   - streams;
   - `fs/promises`;
   - environment variables;
   - child process;
   - exit codes w CI.
3. npm:
   - `npm ci` vs `npm install`;
   - lockfile;
   - scripts;
   - audit i ryzyka dependency management.
4. Git:
   - rebase vs merge;
   - revert vs reset;
   - cherry-pick;
   - bisect;
   - worktree;
   - conventional commits;
   - signed commits, jeśli projekt tego wymaga.

### Priorytet

**P2** — objętościowo moduł jest dobry, ale warto zrobić precyzyjny przegląd zgodności z aktualnymi dokumentacjami TS/Node/Git.

---

## Moduł 19 — Testy jednostkowe, integracyjne i komponentowe

### Aktualny stan

Wszystkie lekcje mają około 520–570 słów. To jeden z najsłabszych objętościowo modułów w całym zakresie 17–28.

### Źródła odniesienia

- Vitest docs;
- Jest docs;
- React Testing Library docs;
- Testing Library guiding principles;
- MSW docs;
- Playwright Component Testing docs jako kontekst porównawczy.

### Główne braki

#### `19.1` — Vitest/Jest

Dodać:

- struktura testu unit;
- matchery;
- setup/teardown;
- watch mode;
- coverage;
- snapshoty;
- fake timers;
- spies/mocks;
- test parametrized;
- różnice Vitest vs Jest;
- kiedy Vitest jest lepszy w projektach Vite;
- konfiguracja TypeScript.

#### `19.2` — mocki, stuby, spies

Dodać:

- różnica mock/stub/fake/spy/dummy;
- `vi.fn`, `vi.spyOn`, `jest.fn`;
- mockowanie modułów;
- fake timers;
- MSW jako mock sieci;
- antywzorce nadmiernego mockowania;
- testowanie zachowania vs implementacji.

#### `19.3` — React Testing Library

Dodać:

- guiding principle Testing Library;
- queries priority: role, label, text, test id jako escape hatch;
- `screen`, `within`, `userEvent`;
- async queries: `findBy`, `waitFor`;
- accessibility jako efekt uboczny dobrych queries;
- unikanie testowania implementation details;
- porównanie RTL vs Playwright CT vs E2E.

#### `19.4` — integracja backendu

Dodać:

- testy integracyjne API;
- test database;
- Testcontainers;
- transakcje i rollback;
- migracje;
- seed;
- HTTP server in-memory;
- kontrakty i MSW;
- granica unit/integration/E2E.

### Priorytet

**P0** — moduł 19 powinien być następnym dużym kandydatem do rozbudowy.

---

## Moduł 20 — SQL i bazy danych

### Aktualny stan

Moduł bardzo mocny. Lekcje mają 3300–4500 słów.

### Źródła odniesienia

- PostgreSQL docs;
- MySQL docs;
- SQLite docs;
- dokumentacja konkretnych ORM/migracji, jeśli używane w przykładach.

### Co jest dobrze pokryte

- podstawy SQL;
- relacje, ograniczenia, indeksy;
- transakcje i izolacja;
- migracje, seed, cleanup.

### Braki do rozważenia

1. Różnice SQL dialects: PostgreSQL/MySQL/SQLite.
2. `EXPLAIN` / `EXPLAIN ANALYZE` jako narzędzie diagnostyczne testera.
3. Testowanie indeksów i regresji wydajności zapytań.
4. Locki, deadlocki, isolation anomalies:
   - dirty read;
   - non-repeatable read;
   - phantom read;
   - lost update.
5. Testowanie migracji rollback/forward-only.
6. Dane wrażliwe i maskowanie danych.

### Priorytet

**P2** — moduł jest dobry, wymaga raczej doprecyzowania niż gruntownego przepisywania.

---

## Moduł 21 — Testy kontraktowe i zarządzanie API

### Aktualny stan

Moduł bardzo dobry objętościowo i tematycznie.

### Źródła odniesienia

- OpenAPI Specification;
- Pact docs;
- JSON Schema;
- AsyncAPI;
- SemVer.

### Co jest dobrze pokryte

- OpenAPI jako kontrakt;
- Pact;
- wersjonowanie;
- kontrakty w CI/CD.

### Braki do rozważenia

1. AsyncAPI jako kontrakt dla eventów i kolejek.
2. Schema registry, np. Confluent Schema Registry — jeśli omawiamy Kafka/Avro/Protobuf.
3. Contract drift.
4. Consumer-driven vs provider-driven contract testing.
5. OpenAPI diff i breaking change detection w CI.
6. Przykłady walidacji response względem OAS.
7. Mock server generowany z OpenAPI.

### Priorytet

**P1/P2** — moduł jest dobry, ale powinien zostać rozszerzony o AsyncAPI, bo moduł 22 dotyczy systemów asynchronicznych.

---

## Moduł 22 — Mikroserwisy i systemy asynchroniczne

### Aktualny stan

Moduł jest solidny: 1300–2000 słów na lekcję.

### Źródła odniesienia

- Kafka docs;
- RabbitMQ docs;
- NATS docs;
- AsyncAPI;
- CloudEvents;
- OpenTelemetry jako diagnostyka przepływów rozproszonych.

### Co jest dobrze pokryte

- kolejki i zdarzenia;
- mikroserwisy;
- webhooki;
- retry;
- idempotencja;
- eventual consistency.

### Braki do rozważenia

1. Dokładniejsze rozróżnienie modeli komunikacji:
   - queue;
   - pub/sub;
   - stream;
   - event sourcing;
   - request/reply.
2. Kafka fundamentals:
   - topic;
   - partition;
   - offset;
   - consumer group;
   - retention;
   - ordering guarantee.
3. RabbitMQ fundamentals:
   - exchange;
   - queue;
   - binding;
   - routing key;
   - ack/nack;
   - dead-letter exchange.
4. Idempotency key jako wzorzec testowalny.
5. Outbox pattern.
6. Exactly-once jako ryzykowny skrót myślowy — wyjaśnić semantykę.
7. Testowanie kontraktów eventów przez AsyncAPI/JSON Schema/Avro.
8. Testowanie ordering i duplicate delivery.

### Priorytet

**P1** — dobry moduł, ale warto wzmocnić oficjalnymi pojęciami Kafka/RabbitMQ/AsyncAPI.

---

## Moduł 23 — Obserwowalność i diagnostyka systemów

### Aktualny stan

Moduł bardzo mocny, wszystkie lekcje powyżej 2000 słów.

### Źródła odniesienia

- OpenTelemetry docs;
- Prometheus docs;
- Grafana docs;
- Loki docs;
- Elastic/Kibana docs;
- Google SRE Book.

### Co jest dobrze pokryte

- logi, metryki, traces;
- correlation ID;
- Grafana/Prometheus/Loki/Kibana;
- SLO/SLA/SLI;
- odporność.

### Braki do rozważenia

1. OpenTelemetry Collector:
   - receiver;
   - processor;
   - exporter;
   - pipeline.
2. Semantic conventions.
3. Trace context propagation:
   - W3C traceparent;
   - baggage.
4. RED/USE metrics.
5. PromQL podstawy dla testerów.
6. Alert fatigue i alert rules.
7. Exemplars / linking metrics to traces.
8. Log levels i structured logging.

### Priorytet

**P2** — moduł dobry, dopisać konkretne sekcje techniczne OpenTelemetry/Prometheus.

---

## Moduł 24 — Testowanie wydajności z k6 i JMeter

### Aktualny stan

`24.1` jest rozbudowana, ale `24.2`, `24.3`, `24.4` mają około 500 słów. Moduł jest nierówny.

### Źródła odniesienia

- k6 docs;
- JMeter manual;
- Web.dev performance;
- Lighthouse docs;
- Grafana/Prometheus dla analizy wyników.

### Główne braki

#### `24.2` — k6

Dodać:

- k6 lifecycle: init, setup, default function, teardown;
- VUs, iterations, duration;
- scenarios/executors;
- thresholds;
- checks;
- custom metrics;
- groups;
- sleep;
- test types: smoke, load, stress, spike, soak;
- output do Grafana/Prometheus/Cloud;
- CI integration.

#### `24.3` — JMeter

Dodać:

- Test Plan;
- Thread Group;
- Samplers;
- Config Elements;
- Timers;
- Assertions;
- Listeners;
- CSV Data Set Config;
- CLI/non-GUI mode;
- HTML report;
- distributed testing;
- best practices: nie uruchamiać load testów w GUI.

#### `24.4` — analiza bottlenecków

Dodać:

- throughput vs latency;
- p50/p90/p95/p99;
- error rate;
- saturation;
- CPU/memory/network/db metrics;
- correlation z traces/logami;
- performance budget;
- capacity planning;
- różnica frontend performance vs backend load.

### Priorytet

**P0/P1** — jeśli kurs ma uczyć full stack testera, moduł 24 wymaga istotnej rozbudowy.

---

## Moduł 25 — Podstawy DevOps i środowiska testowe

### Aktualny stan

`25.1` jest dobre, ale `25.2`–`25.4` mają około 500 słów. Moduł jest nierówny.

### Źródła odniesienia

- Docker docs;
- Docker Compose docs;
- Dockerfile reference;
- Kubernetes docs;
- kubectl reference;
- Linux man pages / GNU Bash manual;
- MDN / RFC dla podstaw HTTP/DNS/TLS, jeśli omawiamy sieci.

### Braki

#### `25.2` — podstawy sieci

Dodać:

- DNS;
- HTTP/HTTPS;
- TLS;
- status codes;
- headers;
- cookies;
- CORS;
- proxy;
- ports;
- localhost vs container network;
- curl/httpie;
- dig/nslookup;
- ping/traceroute;
- debugging network in CI.

#### `25.3` — Docker Compose

Dodać:

- services;
- networks;
- volumes;
- environment;
- depends_on i healthcheck;
- profiles;
- logs;
- exec;
- deterministic test environments;
- ephemeral environments;
- cleanup.

#### `25.4` — Kubernetes

Dodać:

- Pod;
- Deployment;
- Service;
- Ingress;
- ConfigMap;
- Secret;
- Namespace;
- Job/CronJob;
- probes: readiness/liveness/startup;
- kubectl logs/describe/exec/port-forward;
- feature flags;
- test environments in K8s;
- security of secrets.

### Priorytet

**P0/P1** — moduł bardzo ważny dla full stack testera, a 25.2–25.4 są zbyt krótkie.

---

## Moduł 26 — Testowanie mobilne

### Aktualny stan

Moduł bardzo mocny objętościowo: wszystkie lekcje powyżej 3800 słów.

### Źródła odniesienia

- Appium docs;
- Android testing docs;
- Apple XCTest docs;
- BrowserStack/App Automate docs;
- Playwright mobile emulation docs jako kontekst mobile web.

### Co jest dobrze pokryte

- mobile web/native/hybrid;
- Appium;
- emulatory, real devices, farms;
- permissions, deep links, offline.

### Braki do rozważenia

1. Appium 2/3 architecture:
   - drivers;
   - plugins;
   - capabilities;
   - W3C WebDriver;
   - UiAutomator2, XCUITest.
2. Locator strategies mobile:
   - accessibility id;
   - resource-id;
   - iOS predicate/class chain;
   - XPath jako ostateczność.
3. Synchronizacja w mobile:
   - explicit waits;
   - app state;
   - animations;
   - network conditioning.
4. App lifecycle:
   - install;
   - reset;
   - background/foreground;
   - permissions;
   - push notifications.
5. Test data and accounts on device farms.
6. Artefakty:
   - video;
   - device logs;
   - screenshots;
   - Appium server logs.

### Priorytet

**P2** — moduł mocny; wymaga tylko audytu szczegółowego względem aktualnej dokumentacji Appium.

---

## Moduł 27 — Testowanie wspierane przez AI

### Aktualny stan

`27.1` jest rozbudowana, ale `27.2`–`27.4` są krótkie. To ryzykowny obszar, bo AI/LLM zmienia się szybko i wymaga ostrożnych, aktualnych źródeł.

### Źródła odniesienia

- OWASP Top 10 for LLM Applications / GenAI Security Project;
- NIST AI RMF;
- dokumentacje API dostawców LLM;
- polityki bezpieczeństwa i prywatności organizacji;
- dokumentacje narzędzi typu promptfoo / Ragas / LangSmith, jeśli omawiane.

### Braki

#### `27.2` — generowanie przypadków i danych

Dodać:

- AI jako asystent, nie oracle;
- prompt patterns;
- generowanie testów z wymagań;
- traceability do wymagań;
- walidacja wygenerowanych przypadków;
- ryzyko duplikatów i halucynacji;
- synthetic data vs production-like data;
- maskowanie danych.

#### `27.3` — debugowanie AI

Dodać:

- analiza logów z LLM;
- summarization jako pomoc, nie dowód;
- tworzenie hipotez;
- korelacja z trace/logami;
- prompt do analizy błędu z ograniczeniem kontekstu;
- nie wklejać sekretów;
- ewaluacja jakości odpowiedzi.

#### `27.4` — ryzyka AI

Dodać:

- OWASP LLM Top 10:
  - prompt injection;
  - insecure output handling;
  - sensitive information disclosure;
  - excessive agency;
  - overreliance;
  - supply chain.
- NIST AI RMF:
  - govern;
  - map;
  - measure;
  - manage.
- data retention;
- vendor risk;
- policy compliance;
- human-in-the-loop;
- evals i guardrails.

### Priorytet

**P0/P1** — AI jest ważnym i ryzykownym obszarem. Krótsze lekcje powinny zostać istotnie rozbudowane i oparte o OWASP/NIST.

---

## Moduł 28 — Portfolio i egzamin testera full stack

### Aktualny stan

Moduł bardzo mocny objętościowo.

### Źródła odniesienia

- GitHub Docs;
- GitHub Actions;
- Conventional Commits;
- ADR;
- dobre praktyki dokumentacji technicznej;
- wcześniej zdefiniowana matryca kompetencji kursu.

### Co jest dobrze pokryte

- projekt końcowy;
- GitHub/CV/portfolio;
- matryca kompetencji;
- zadania rekrutacyjne.

### Braki do rozważenia

1. Rubryka oceny projektu końcowego powiązana z modułami 17–27.
2. Wymagane artefakty portfolio:
   - README;
   - test strategy;
   - CI screenshot/link;
   - HTML report;
   - trace sample;
   - architecture diagram;
   - known limitations;
   - ADR.
3. Jak opowiadać o trade-offach:
   - co testuję przez UI;
   - co przez API;
   - co przez contract tests;
   - co pomijam świadomie.
4. Checklisty rekrutacyjne dla live coding/test design.
5. Security/privacy checklist dla publikowanego portfolio.

### Priorytet

**P2** — moduł dobry, warto dopiąć matrycę końcową na podstawie całego curriculum.

## 5. Najważniejsze braki P0/P1

### P0 — najpilniejsze

1. **Moduł 19** — Vitest/Jest/RTL/MSW wymaga gruntownej rozbudowy.
2. **Moduł 24** — k6 i JMeter wymagają rozbudowania na podstawie oficjalnych dokumentacji.
3. **Moduł 25** — Docker Compose, Kubernetes i networking są zbyt krótkie.
4. **Moduł 27** — AI/LLM wymaga rozbudowania o OWASP LLM Top 10, NIST AI RMF, privacy, prompt injection, overreliance i governance.

### P1 — ważne

1. **Moduł 17** — techniki projektowania testów i podstawy ISTQB.
2. **Moduł 21** — dodać AsyncAPI i contract drift.
3. **Moduł 22** — doprecyzować Kafka/RabbitMQ/NATS/CloudEvents.
4. **Moduł 23** — dopisać OpenTelemetry Collector, semantic conventions i PromQL basics.

### P2 — doprecyzowanie

1. **Moduł 18** — szczegółowy przegląd TypeScript/Node/Git.
2. **Moduł 20** — SQL dialects, EXPLAIN, locki, deadlocki.
3. **Moduł 26** — aktualny Appium 2/3, drivers/plugins/capabilities.
4. **Moduł 28** — rubryka końcowa i artefakty portfolio.

## 6. Proponowany plan naprawczy

### Etap 1 — Moduły najkrótsze i najbardziej krytyczne

1. Moduł 19 — przepisać/rozbudować wszystkie lekcje do 1000–1500+ słów.
2. Moduł 24 — rozbudować 24.2, 24.3, 24.4.
3. Moduł 25 — rozbudować 25.2, 25.3, 25.4.
4. Moduł 27 — rozbudować 27.2, 27.3, 27.4.

### Etap 2 — Moduły dobre, ale wymagające precyzji technicznej

1. Moduł 17 — ISTQB i techniki projektowania testów.
2. Moduł 21 — AsyncAPI i contract drift.
3. Moduł 22 — Kafka/RabbitMQ/NATS.
4. Moduł 23 — OpenTelemetry/Prometheus/Grafana.

### Etap 3 — Dopracowanie i spójność

1. Moduł 18 — TS/Node/Git aktualizacja.
2. Moduł 20 — SQL dodatki.
3. Moduł 26 — Appium aktualizacja.
4. Moduł 28 — portfolio i egzamin końcowy.

## 7. Wniosek końcowy

Moduły 17–28 tworzą dobrą mapę kompetencji Full Stack Testera, ale wymagają takiego samego procesu wyrównania jak moduły Playwright. Największym ryzykiem nie jest brak tematów w ogóle, tylko nierówny poziom: obok lekcji bardzo rozbudowanych istnieją lekcje 500-słowne, które jedynie sygnalizują temat.

Najbardziej opłacalne następne prace to moduły 19, 24, 25 i 27, ponieważ dotyczą narzędzi i kompetencji, których rekruterzy i zespoły techniczne oczekują od Full Stack Testera poza Playwright.
