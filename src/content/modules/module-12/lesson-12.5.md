# Antywzorce i typowe błędy

Antywzorzec w testach Playwright to praktyka, która może chwilowo „naprawić” test, ale długoterminowo zwiększa flakiness, spowalnia CI albo utrudnia diagnostykę. Najgroźniejsze antywzorce są kopiowane przez zespół, dlatego trzeba usuwać je wcześnie.

## 1. `waitForTimeout`

```typescript
await page.waitForTimeout(5000); // źle jako synchronizacja
```

Lepsze:

```typescript
await expect(page.getByText('Zapisano')).toBeVisible();
```

Czekaj na stan, nie na czas.

## 2. Kruche locatory

Źle:

```typescript
page.locator('.container > div:nth-child(2) button')
```

Lepiej:

```typescript
page.getByRole('button', { name: 'Zapisz' })
```

Preferuj locatory widoczne dla użytkownika.

## 3. Testy zależne od kolejności

Jeśli test B wymaga, aby test A utworzył dane, suite nie będzie bezpieczna równolegle. Każdy test powinien przygotować własny stan lub użyć fixture.

## 4. Jeden użytkownik do wszystkiego

Wspólne konto powoduje konflikty przy równoległości. Używaj kont per worker, danych per test i `runId`.

## 5. Over-mocking

Mockowanie wszystkiego daje zielone testy, które nie sprawdzają integracji. Mockuj błędy trudne do wywołania i zewnętrzne zależności, ale zostaw krytyczne smoke E2E na prawdziwym systemie.

## 6. Brak asercji skutku

```typescript
await page.getByRole('button', { name: 'Zapisz' }).click();
```

To nie jest test, jeśli nie sprawdza rezultatu.

```typescript
await expect(page.getByRole('status')).toContainText('Zapisano');
```

## 7. Ukrywanie wszystkiego w helperach

Metoda `doEverything()` utrudnia diagnozę. Helper ma nazywać domenę, nie ukrywać scenariusz.

## 8. Ignorowanie artefaktów

Bez trace, screenshotów, video i logów konsoli awaria w CI staje się zgadywaniem. Konfiguruj artefakty świadomie.

## 9. Checklista antywzorców

- Czy nie ma `waitForTimeout`?
- Czy locatory są semantyczne?
- Czy test jest niezależny?
- Czy dane są izolowane?
- Czy mocki nie ukrywają krytycznej integracji?
- Czy po każdej akcji jest asercja skutku?
- Czy helpery nie ukrywają zbyt dużo?
- Czy CI publikuje artefakty?

## Linki

- [Best practices](https://playwright.dev/docs/best-practices)
- [Locators](https://playwright.dev/docs/locators)
- [Actionability](https://playwright.dev/docs/actionability)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)

## 10. Antywzorzec: test bez właściciela

Jeśli test pada i nikt nie wie, kto ma reagować, automatyzacja traci wartość. Krytyczne testy powinny mieć obszar, tag i właściciela, np. `@payments`, `@auth`, `@team-checkout`.

## 11. Antywzorzec: retry jako strategia jakości

Retry pomaga zebrać trace i ograniczyć szum infrastruktury, ale nie jest naprawą. Test przechodzący po retry powinien być analizowany. W przeciwnym razie zespół przyzwyczaja się do niestabilności.

## 12. Antywzorzec: testowanie wszystkiego przez UI

UI jest najdroższą warstwą. Jeśli wszystkie walidacje, kontrakty i uprawnienia testujesz przez przeglądarkę, suite będzie wolna i krucha. Przenieś część sprawdzeń do API, unit, integration albo contract tests.

## 13. Antywzorzec: brak review danych

Nawet dobry test będzie niestabilny, jeśli używa wspólnego użytkownika, stałego emaila albo danych produkcyjnych. Dane są częścią testu i muszą podlegać review.

## 14. Szybka procedura usuwania antywzorca

1. Nazwij problem.
2. Dodaj przykład złego kodu.
3. Pokaż lepszy wzorzec.
4. Popraw najczęściej kopiowane miejsca.
5. Dodaj punkt do checklisty review.

## 15. Antywzorzec: brak kontraktu z CI

Jeśli testy mają tagi, ale pipeline ich nie używa, tagi są dekoracją. Jeśli pipeline uruchamia wszystko zawsze, feedback będzie wolny. Powiąż standard tagów z komendami:

```bash
npx playwright test --grep @smoke
npx playwright test --grep @critical
npx playwright test --grep-invert @slow
```

## 16. Antywzorzec: ignorowanie dostępności

Jeśli test nie potrafi znaleźć przycisku przez `getByRole`, zespół często dodaje `data-testid`. Czasem to właściwe, ale najpierw zapytaj, czy element ma poprawną rolę i accessible name. Stabilność testów i dostępność produktu często mają ten sam korzeń.

## 17. Antywzorzec: brak standardu cleanupu

Testy tworzące dane bez cleanupu psują środowisko dla kolejnych uruchomień. Każdy test tworzący stan powinien mieć strategię: teardown fixture, cleanup tracker albo cleanup po `runId`.

## 18. Antywzorzec: snapshot jako zamiennik asercji

Snapshot wizualny lub ARIA jest przydatny, ale nie powinien zastępować jasnej asercji biznesowej. Jeśli test ma sprawdzić, że płatność się udała, lepsze jest:

```typescript
await expect(page.getByRole('heading', { name: 'Płatność przyjęta' })).toBeVisible();
```

Snapshot może być dodatkowym zabezpieczeniem layoutu, ale nie jedynym dowodem poprawności procesu.

## 19. Antywzorzec: zbyt duży test E2E

Test, który tworzy użytkownika, loguje, przechodzi onboarding, dodaje produkt, płaci, pobiera fakturę, sprawdza email i bazę, może być wartościowym testem end-to-end, ale nie powinien być wzorcem dla każdej walidacji. Duże testy są trudne w diagnozie. Rozbij warianty na API, komponenty i mniejsze E2E smoke.

## 20. Antywzorzec: brak lokalnego sposobu uruchomienia

Jeśli test da się uruchomić tylko w CI, debugowanie jest wolne. Każdy ważny zestaw powinien mieć lokalną komendę:

```bash
npx playwright test --grep @payments --project=chromium
npx playwright test tests/checkout/payment.spec.ts --debug
```

## 21. Antywzorzec: ignorowanie kosztu CI

Każdy test ma koszt. Jeśli test trwa 60 sekund i działa w każdym PR, musi chronić istotne ryzyko. W przeciwnym razie powinien trafić do nightly, API suite albo zostać zoptymalizowany.

## 22. Review antywzorców

Dodaj do review pytanie: „Czy ten test wprowadza wzorzec, który chcemy kopiować?”. Jeśli nie, popraw go przed merge. Najgorszy kod testowy to ten, który staje się szablonem dla kolejnych testów.

## 23. Antywzorzec: magiczne dane

Test używa `user123`, `product1` albo `ORD-1`, ale nikt nie wie, skąd te dane się biorą. Magiczne dane powodują konflikty i utrudniają reprodukcję. Zastąp je builderem, factory albo fixture z jasną nazwą.

## 24. Antywzorzec: zbyt ogólne asercje

`expect(await page.textContent('body')).toContain('OK')` jest słabe. Test powinien sprawdzać konkretny element i stan:

```typescript
await expect(page.getByRole('status')).toHaveText('Zamówienie opłacone');
```

## 25. Antywzorzec: brak usuwania starego kodu

Martwe helpery, stare Page Objecty i nieużywane fixtures komplikują projekt. Usuwaj je tak samo jak martwy kod produkcyjny.
