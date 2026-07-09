# Postęp naprawy treści Playwright

Data: 2026-07-09  
Gałąź: `arena/workspace-changes`

## Status ogólny

Zakończono dużą rundę aktualizacji treści Playwright zgodnie z audytem `docs/audit/playwright-official-docs-coverage-audit.md`.

Wykonano:

- uzupełnienie brakujących tematów z oficjalnej dokumentacji Playwright;
- wyrównanie wielu krótszych lekcji;
- dodanie nowych lekcji do modułu 4;
- aktualizację części metadanych `.ts`;
- przegląd modułu 15 pod kątem mapowania pełnego curriculum Playwright;
- walidację build/lint;
- przygotowanie zmian do commita.

## Najważniejsze obszary objęte zmianami

### Moduły 1–5 — fundamenty Playwright

Zakres:

- Playwright Test vs Playwright Library;
- aktualne wymagania Node.js 22/24/26;
- VS Code Extension i Codegen;
- Browser / Context / Page;
- locatory i actionability;
- web-first assertions;
- API testing;
- fixtures;
- konfiguracja, projects, parallelism, sharding;
- organizacja testów, tagi i adnotacje.

### Moduł 4 — mechanizmy zaawansowane

Dodano nowe lekcje:

- `lesson-4.7` — dialogi, zdarzenia i event-first pattern;
- `lesson-4.8` — evaluating JS, handles, Clock i mockowanie API przeglądarki.

Rozszerzono:

- network mocking o HAR, GraphQL, service workers, `route.fetch`, `route.fallback`;
- authentication o setup project, multiple roles, per-worker auth i API authentication.

### Moduły 7–9, 12, 16 — runda wyrównywania Opcja B

Doprowadzono krótsze lekcje do poziomu około 800+ słów.

Wybrane metryki:

| Moduł | Lekcja | Liczba słów |
|---:|---:|---:|
| 7 | 7.2 | 917 |
| 7 | 7.3 | 807 |
| 7 | 7.4 | 926 |
| 7 | 7.5 | 873 |
| 8 | 8.3 | 801 |
| 8 | 8.4 | 800 |
| 8 | 8.5 | 909 |
| 9 | 9.2 | 803 |
| 9 | 9.3 | 826 |
| 9 | 9.4 | 804 |
| 9 | 9.5 | 824 |
| 12 | 12.1 | 829 |
| 12 | 12.2 | 855 |
| 12 | 12.4 | 865 |
| 12 | 12.5 | 856 |
| 16 | 16.2 | 816 |
| 16 | 16.3 | 809 |
| 16 | 16.4 | 801 |
| 16 | 16.5 | 816 |

Pełny baseline znajduje się w:

- `docs/audit/playwright-lesson-by-lesson-baseline.md`

### Moduł 15 — projekty praktyczne

Wykonano przegląd i uzupełnienie projektu końcowego.

Zmieniono:

- `src/content/modules/module-15/lesson-15.1.md`
- `src/content/modules/module-15/lesson-15.2.md`
- `src/content/modules/module-15/lesson-15.3.md`
- `src/content/modules/module-15/lesson-15.3.ts`
- `src/content/modules/module-15/lesson-15.4.md`

Zakres:

- aktualizacja przykładów CI z Node.js 20 do Node.js 22;
- dodanie matrycy pokrycia Playwright w projekcie końcowym;
- dodanie minimalnego zestawu dowodów w portfolio;
- dodanie rubryki Playwright-specific.

## Metadane `.ts`

Zaktualizowano `description` i `references` dla lekcji z modułów:

- 7.2–7.5;
- 8.3–8.5;
- 9.2–9.5;
- 12.1, 12.2, 12.4, 12.5;
- 16.2–16.5.

## Walidacja techniczna

Uruchomiono:

```bash
git diff --check
```

Wynik: brak problemów whitespace.

Uruchomiono:

```bash
npm ci
npm run build
```

Wynik: build przeszedł poprawnie.

Uwagi z builda:

- Vite zgłosił ostrzeżenie o deprecated CJS Node API;
- Vite zgłosił ostrzeżenie o dużych chunkach powyżej 500 kB.

Uruchomiono:

```bash
npm run lint
```

Wynik:

- 0 errors;
- 56 warnings.

Ostrzeżenia dotyczą istniejącego kodu aplikacji, głównie unused imports, `no-explicit-any`, zależności hooków React i `react-refresh/only-export-components`.

## Następny krok po commicie

Po commicie warto w osobnej rundzie:

1. dopracować `codeExamples`, `exercises`, `quiz`, `tipsAndTricks`, `commonMistakes` w plikach `.ts` dla wszystkich zmienionych lekcji;
2. przejrzeć pozostałe moduły spoza ścisłego zakresu Playwright;
3. rozważyć osobną techniczną rundę naprawy warningów ESLint.
