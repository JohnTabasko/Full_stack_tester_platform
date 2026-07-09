# Postęp naprawy modułów 17–28

Data: 2026-07-09  
Gałąź: `arena/workspace-changes`

## Wykonane dotychczas

Poprawki są prowadzone zgodnie z audytem `docs/audit/fullstack-modules-17-28-official-coverage-audit.md`.

### Moduł 17 — Fundamenty testowania

Rozbudowano lekcje `17.2`, `17.3`, `17.4` oraz metadane `.ts`. Dodano rodzaje testów, piramidę jako model ekonomii informacji, techniki ISTQB, session-based testing i profesjonalne raportowanie defektów.

### Moduł 19 — Unit, integration, component testing

Rozbudowano lekcje `19.1`–`19.4` oraz metadane `.ts`. Dodano Vitest/Jest, mocki/spies/fakes, React Testing Library, MSW, Testcontainers, testy integracyjne backendu, migracje, kolejki i granice z E2E.

### Moduł 24 — k6 i JMeter

Rozbudowano lekcje `24.2`, `24.3`, `24.4` oraz metadane `.ts`. Dodano lifecycle k6, VUs, scenarios, thresholds, custom metrics, JMeter Test Plan, Thread Groups, Samplers, non-GUI mode, analizę bottlenecków, percentyle, saturation i budżety wydajności.

### Moduł 25 — DevOps i środowiska

Rozbudowano lekcje `25.2`, `25.3`, `25.4` oraz metadane `.ts`. Dodano DNS, HTTP, TLS, CORS, cookies, Docker Compose services/networks/volumes/healthcheck/profiles, Kubernetes Pod/Deployment/Service/Ingress/ConfigMap/Secret/probes/kubectl diagnostics i feature flags.

### Moduł 27 — AI/LLM w testowaniu

Rozbudowano lekcje `27.2`, `27.3`, `27.4` oraz metadane `.ts`. Dodano prompt patterns, traceability, review AI-generated tests, synthetic data, AI-assisted debugging, log redaction, OWASP LLM Top 10, NIST AI RMF, prompt injection, excessive agency, overreliance, governance i guardrails.

## Metryki modułów 17–28

| Moduł | Lekcja | Tytuł | Słowa |
|---:|---:|---|---:|
| 17 | 17.1 | Strategia jakości i zarządzanie ryzykiem — perspektywa Full Stack Testera | 1661 |
| 17 | 17.2 | Rodzaje testów i piramida testów | 760 |
| 17 | 17.3 | Techniki projektowania testów | 783 |
| 17 | 17.4 | Testowanie eksploracyjne i raportowanie błędów | 813 |
| 18 | 18.1 | Podstawy TypeScript dla Automatyzacji Testów — Bezpieczny Typowo Kod Testowy | 2727 |
| 18 | 18.2 | Async/Await i Promises — TypeScript Mastery dla Playwright | 2146 |
| 18 | 18.3 | Sprawdź wersję Node.js | 2644 |
| 18 | 18.4 | Przepływ Pracy Testera w Git — Współpraca, Review i Diagnostyka | 2500 |
| 19 | 19.1 | Podstawy Vitest i Jest | 835 |
| 19 | 19.2 | Mocki, stuby, obiekty pozorne i szpiedzy | 804 |
| 19 | 19.3 | React Testing Library i testowanie komponentów | 813 |
| 19 | 19.4 | Testy integracyjne backendu | 775 |
| 20 | 20.1 | SQL dla Testerów — Kompleksowa Weryfikacja Integralności Danych | 3528 |
| 20 | 20.2 | Relacje, Ograniczenia i Indeksy — Architektura Integralności Danych | 3194 |
| 20 | 20.3 | Transakcje, Izolacja i Warunki Wyścigu — Testowanie Spójności Współbieżnej | 4295 |
| 20 | 20.4 | Migracje, Seedowanie i Sprzątanie Danych — Higiena Środowiska Testowego | 3379 |
| 21 | 21.1 | OpenAPI jako Kontrakt — Wykonywalna Specyfikacja API | 2590 |
| 21 | 21.2 | Testy Kontraktowe Sterowane przez Konsumenta z Pact — Ochrona Granic Między Usługami | 2429 |
| 21 | 21.3 | Wersjonowanie API i Kompatybilność Wsteczna — Bezpieczna Ewolucja Kontraktów | 2299 |
| 21 | 21.4 | Testy Kontraktowe w CI/CD — Automatyczna Ochrona przed Breaking Changes | 2829 |
| 22 | 22.1 | Testowanie Kolejek i Zdarzeń — Integracyjna Weryfikacja Systemów Rozproszonych | 1935 |
| 22 | 22.2 | Architektura Mikroserwisowa dla Testerów — Mapowanie, Kontrakty i Strategia Testów | 1615 |
| 22 | 22.3 | Webhooki, Ponowienia i Idempotencja — Bezpieczna Obsługa Zdarzeń Zewnętrznych | 1288 |
| 22 | 22.4 | Spójność Ostateczna i Procesy Biznesowe — Testowanie Stanów Rozproszonych | 1695 |
| 23 | 23.1 | Logi, Metryki i Ślady Wykonania — Trzy Filary Obserwowalności Systemów | 2387 |
| 23 | 23.2 | Identyfikatory korelacji (Full Stack Debugging) | 2093 |
| 23 | 23.3 | Grafana, Prometheus, Loki i Kibana — Praktyczna Analiza Diagnostyczna | 2361 |
| 23 | 23.4 | SLO, SLA, SLI i Testowanie Odporności — Mierzalna Jakość i Niezawodność | 2458 |
| 24 | 24.1 | Testy wydajnościowe i obciążeniowe — kompletny przewodnik | 1890 |
| 24 | 24.2 | Podstawy k6 | 756 |
| 24 | 24.3 | JMeter i testy protokołów | 819 |
| 24 | 24.4 | Analiza wąskich gardeł i budżet wydajności | 766 |
| 25 | 25.1 | Wiersz poleceń i Bash dla Testera — kompletny przewodnik | 2342 |
| 25 | 25.2 | Podstawy sieci | 799 |
| 25 | 25.3 | Docker Compose dla środowisk testowych | 810 |
| 25 | 25.4 | Kubernetes, sekrety i flagi funkcji | 784 |
| 26 | 26.1 | Aplikacje mobilne webowe, natywne i hybrydowe | 3835 |
| 26 | 26.2 | Podstawy Appium | 3712 |
| 26 | 26.3 | Emulatory, prawdziwe urządzenia i farmy urządzeń | 3970 |
| 26 | 26.4 | Uprawnienia, linki głębokie i tryb offline | 4193 |
| 27 | 27.1 | AI i LLM w pracy Testera — kompletny przewodnik | 2287 |
| 27 | 27.2 | Generowanie przypadków testowych i danych testowych | 770 |
| 27 | 27.3 | Debugowanie wspierane przez sztuczną inteligencję i analiza logów | 796 |
| 27 | 27.4 | Ryzyka sztucznej inteligencji: prywatność, halucynacje i zarządzanie | 823 |
| 28 | 28.1 | Projekt końcowy: interfejs użytkownika, API, baza danych i CI | 2849 |
| 28 | 28.2 | GitHub, CV i prezentacja portfolio | 2255 |
| 28 | 28.3 | Matryca kompetencji testera full stack | 2833 |
| 28 | 28.4 | Zadania rekrutacyjne i programowanie na żywo | 2909 |

## Walidacja

Ostatnio uruchamiane walidacje: `git diff --check`, `npm run lint`, `npm run build`.

## Następny krok

Kolejne rekomendowane obszary: `21` AsyncAPI/contract drift, `22` Kafka/RabbitMQ/NATS/CloudEvents, `23` OpenTelemetry Collector/PromQL/semantic conventions, a następnie doprecyzowanie `18`, `20`, `26`, `28`.
