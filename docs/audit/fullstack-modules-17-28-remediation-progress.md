# Postęp naprawy modułów 17–28

Data: 2026-07-09  
Gałąź: `arena/workspace-changes`

## Wykonane dotychczas

Poprawki są prowadzone zgodnie z audytem `docs/audit/fullstack-modules-17-28-official-coverage-audit.md`.

### Moduły 17, 19, 21, 22, 23, 24, 25, 27

Rozbudowano najważniejsze luki P0/P1: fundamenty testowania, unit/component/integration testing, kontrakty, mikroserwisy, obserwowalność, performance, DevOps i AI/LLM.

### Moduły 18, 20, 26, 28

Doprecyzowano moduły P2: TypeScript/Node/Git, SQL, Appium/mobile i portfolio. Dodano m.in. `unknown` vs `any`, `satisfies`, ESM/CJS, `npm ci`, Git bisect/revert/rebase, SQL dialects, EXPLAIN, isolation anomalies, deadlocki, maskowanie danych, Appium 2/3 drivers/plugins/capabilities, artefakty z farm urządzeń, app lifecycle, push notifications, rubrykę portfolio i checklistę security/privacy.

## Metryki modułów 17–28

| Moduł | Lekcja | Tytuł | Słowa |
|---:|---:|---|---:|
| 17 | 17.1 | Strategia jakości i zarządzanie ryzykiem — perspektywa Full Stack Testera | 1661 |
| 17 | 17.2 | Rodzaje testów i piramida testów | 760 |
| 17 | 17.3 | Techniki projektowania testów | 783 |
| 17 | 17.4 | Testowanie eksploracyjne i raportowanie błędów | 813 |
| 18 | 18.1 | Podstawy TypeScript dla Automatyzacji Testów — Bezpieczny Typowo Kod Testowy | 2874 |
| 18 | 18.2 | Async/Await i Promises — TypeScript Mastery dla Playwright | 2253 |
| 18 | 18.3 | Node.js, npm i struktura projektu testowego | 2779 |
| 18 | 18.4 | Przepływ Pracy Testera w Git — Współpraca, Review i Diagnostyka | 2645 |
| 19 | 19.1 | Podstawy Vitest i Jest | 835 |
| 19 | 19.2 | Mocki, stuby, obiekty pozorne i szpiedzy | 804 |
| 19 | 19.3 | React Testing Library i testowanie komponentów | 813 |
| 19 | 19.4 | Testy integracyjne backendu | 775 |
| 20 | 20.1 | SQL dla Testerów — Kompleksowa Weryfikacja Integralności Danych | 3627 |
| 20 | 20.2 | Relacje, Ograniczenia i Indeksy — Architektura Integralności Danych | 3288 |
| 20 | 20.3 | Transakcje, Izolacja i Warunki Wyścigu — Testowanie Spójności Współbieżnej | 4392 |
| 20 | 20.4 | Migracje, Seedowanie i Sprzątanie Danych — Higiena Środowiska Testowego | 3469 |
| 21 | 21.1 | OpenAPI jako Kontrakt — Wykonywalna Specyfikacja API | 2802 |
| 21 | 21.2 | Testy Kontraktowe Sterowane przez Konsumenta z Pact — Ochrona Granic Między Usługami | 2645 |
| 21 | 21.3 | Wersjonowanie API i Kompatybilność Wsteczna — Bezpieczna Ewolucja Kontraktów | 2460 |
| 21 | 21.4 | Testy Kontraktowe w CI/CD — Automatyczna Ochrona przed Breaking Changes | 2966 |
| 22 | 22.1 | Testowanie Kolejek i Zdarzeń — Integracyjna Weryfikacja Systemów Rozproszonych | 2108 |
| 22 | 22.2 | Architektura Mikroserwisowa dla Testerów — Mapowanie, Kontrakty i Strategia Testów | 1750 |
| 22 | 22.3 | Webhooki, Ponowienia i Idempotencja — Bezpieczna Obsługa Zdarzeń Zewnętrznych | 1408 |
| 22 | 22.4 | Spójność Ostateczna i Procesy Biznesowe — Testowanie Stanów Rozproszonych | 1830 |
| 23 | 23.1 | Logi, Metryki i Ślady Wykonania — Trzy Filary Obserwowalności Systemów | 2511 |
| 23 | 23.2 | Identyfikatory korelacji (Full Stack Debugging) | 2210 |
| 23 | 23.3 | Grafana, Prometheus, Loki i Kibana — Praktyczna Analiza Diagnostyczna | 2478 |
| 23 | 23.4 | SLO, SLA, SLI i Testowanie Odporności — Mierzalna Jakość i Niezawodność | 2592 |
| 24 | 24.1 | Testy wydajnościowe i obciążeniowe — kompletny przewodnik | 1890 |
| 24 | 24.2 | Podstawy k6 | 756 |
| 24 | 24.3 | JMeter i testy protokołów | 819 |
| 24 | 24.4 | Analiza wąskich gardeł i budżet wydajności | 766 |
| 25 | 25.1 | Wiersz poleceń i Bash dla Testera — kompletny przewodnik | 2342 |
| 25 | 25.2 | Podstawy sieci | 799 |
| 25 | 25.3 | Docker Compose dla środowisk testowych | 810 |
| 25 | 25.4 | Kubernetes, sekrety i flagi funkcji | 784 |
| 26 | 26.1 | Aplikacje mobilne webowe, natywne i hybrydowe | 3835 |
| 26 | 26.2 | Podstawy Appium | 3800 |
| 26 | 26.3 | Emulatory, prawdziwe urządzenia i farmy urządzeń | 4046 |
| 26 | 26.4 | Uprawnienia, linki głębokie i tryb offline | 4266 |
| 27 | 27.1 | AI i LLM w pracy Testera — kompletny przewodnik | 2287 |
| 27 | 27.2 | Generowanie przypadków testowych i danych testowych | 770 |
| 27 | 27.3 | Debugowanie wspierane przez sztuczną inteligencję i analiza logów | 796 |
| 27 | 27.4 | Ryzyka sztucznej inteligencji: prywatność, halucynacje i zarządzanie | 823 |
| 28 | 28.1 | Projekt końcowy: interfejs użytkownika, API, baza danych i CI | 2849 |
| 28 | 28.2 | GitHub, CV i prezentacja portfolio | 2255 |
| 28 | 28.3 | Matryca kompetencji testera full stack | 2938 |
| 28 | 28.4 | Zadania rekrutacyjne i programowanie na żywo | 3003 |

## Walidacja

Ostatnio uruchamiane walidacje: `git diff --check`, `npm run lint`, `npm run build`.

## Następny krok

Po zakończeniu tej rundy zalecane jest pełne przejrzenie `quiz`, `exercises`, `codeExamples`, `tipsAndTricks` i `commonMistakes` w metadanych `.ts`, a następnie wypchnięcie commitów na GitHub po dostarczeniu działającego tokena.
