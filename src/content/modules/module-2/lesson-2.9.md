# Testy wizualne i regresja — screenshoty, snapshoty i stabilne porównania

Test funkcjonalny może przejść, mimo że UI jest wizualnie uszkodzony: przycisk nachodzi na tekst, modal jest ucięty, ikona znika, formularz rozjeżdża się na mobile albo dark mode ma nieczytelny kontrast. Testy wizualne w Playwright pomagają wykrywać takie regresje przez porównanie screenshotów i snapshotów z zaakceptowanym wzorcem.

Testy wizualne są bardzo wartościowe, ale droższe w utrzymaniu niż zwykłe asercje. Dlatego trzeba projektować je świadomie.

## 1. Zwykły screenshot

Playwright może zrobić screenshot strony lub konkretnego elementu:

```typescript
await page.screenshot({ path: 'test-results/home-page.png', fullPage: true });
await page.getByTestId('product-card').screenshot({ path: 'test-results/product-card.png' });
```

To jest artefakt diagnostyczny. Sam screenshot nie porównuje jeszcze niczego z baseline.

## 2. `toHaveScreenshot` — visual assertion

```typescript
await expect(page).toHaveScreenshot('home-page.png');
```

Przy pierwszym uruchomieniu Playwright tworzy baseline snapshot. Przy kolejnych porównuje aktualny obraz z baseline. Jeśli różnica przekroczy tolerancję, test pada.

Dla komponentu:

```typescript
await expect(page.getByTestId('product-card')).toHaveScreenshot('product-card.png');
```

Screenshot komponentu jest zwykle stabilniejszy niż screenshot całej strony.

## 3. Kiedy robić screenshot całej strony, a kiedy komponentu

Screenshot całej strony ma sens dla:

- landing page;
- krytycznego checkoutu;
- stron prawnych i dokumentów;
- layoutu po dużym redesignie;
- widoków, gdzie całość jest ważna biznesowo.

Screenshot komponentu ma sens dla:

- kart produktu;
- tabel;
- modali;
- formularzy;
- elementów design systemu;
- nawigacji.

Nie rób screenshotów całej aplikacji w każdym teście. To spowolni suite i zwiększy liczbę fałszywych alarmów.

## 4. Stabilizacja dynamicznych elementów

Dynamiczne dane powodują niestabilność:

- aktualna data;
- losowe ID;
- animacje;
- reklamy;
- avatary z CDN;
- kursory i caret w polach tekstowych.

Maskowanie:

```typescript
await expect(page).toHaveScreenshot('dashboard.png', {
  mask: [
    page.getByTestId('current-date'),
    page.getByTestId('user-avatar'),
  ],
});
```

Wyłączenie animacji i caret:

```typescript
await expect(page).toHaveScreenshot('form.png', {
  animations: 'disabled',
  caret: 'hide',
});
```

Możesz też wstrzyknąć style:

```typescript
await expect(page).toHaveScreenshot('stable.png', {
  style: `
    [data-testid="clock"] { visibility: hidden !important; }
    .ad-banner { display: none !important; }
  `,
});
```

## 5. Tolerancja różnic

```typescript
await expect(page).toHaveScreenshot('home.png', {
  maxDiffPixels: 100,
  threshold: 0.2,
});
```

Nie ustawiaj wysokiej tolerancji tylko po to, aby test przeszedł. Tolerancja powinna kompensować drobne różnice renderowania, a nie ukrywać realne regresje.

## 6. Środowisko ma znaczenie

Ten sam UI może wyglądać trochę inaczej na macOS, Windows i Linux: font rendering, antyaliasing, dostępne fonty i skala ekranu wpływają na piksele.

Dobre praktyki:

- generuj i porównuj baseline w tym samym środowisku;
- używaj Docker/CI jako źródła prawdy dla visual tests;
- ustaw viewport i deviceScaleFactor;
- kontroluj fonty;
- nie porównuj baseline z macOS z wynikiem z Linuxa bez świadomej konfiguracji.

## 7. Aktualizacja snapshotów

Gdy zmiana UI jest celowa:

```bash
npx playwright test --update-snapshots
```

Aktualizacja snapshotów powinna przejść code review. Reviewer musi zobaczyć, czy różnice są oczekiwane. Nie akceptuj automatycznie wszystkich zmian w obrazach.

## 8. Screenshoty diagnostyczne w konfiguracji

W `playwright.config.ts` możesz ustawić:

```typescript
use: {
  screenshot: 'only-on-failure',
  trace: 'on-first-retry',
  video: 'retain-on-failure',
}
```

To nie są testy wizualne, tylko artefakty do debugowania awarii funkcjonalnych. Nie myl ich z `toHaveScreenshot`.

## 9. Snapshoty tekstowe i aria snapshots

Playwright wspiera też snapshoty niewizualne, np. tekstowe oraz ARIA snapshots. Są przydatne, gdy chcesz kontrolować strukturę dostępności albo wygenerowany tekst bez porównywania pikseli.

Przykład idei:

```typescript
await expect(page.getByRole('navigation')).toMatchAriaSnapshot();
```

ARIA snapshot może wykryć, że przycisk stracił accessible name, nawet jeśli wizualnie nadal wygląda dobrze.

## 10. Antywzorce

- Screenshot całej strony w każdym teście.
- Snapshoty dynamicznych danych bez maskowania.
- Aktualizacja baseline bez review.
- Porównywanie wyników z różnych systemów operacyjnych bez kontroli środowiska.
- Wysoka tolerancja ukrywająca realne błędy.
- Test wizualny zamiast prostej asercji tekstu lub roli.

## 11. Checklista testów wizualnych

- Czy test wizualny pokrywa realne ryzyko UI?
- Czy lepszy byłby screenshot komponentu niż całej strony?
- Czy dynamiczne elementy są maskowane?
- Czy animacje i caret są kontrolowane?
- Czy baseline powstaje w tym samym środowisku co porównanie?
- Czy snapshoty są reviewowane?
- Czy tolerancja ma uzasadnienie?
- Czy artefakty z CI są dostępne po awarii?

## Linki

- [Screenshots](https://playwright.dev/docs/screenshots)
- [Visual comparisons](https://playwright.dev/docs/test-snapshots)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [ARIA snapshots](https://playwright.dev/docs/aria-snapshots)
