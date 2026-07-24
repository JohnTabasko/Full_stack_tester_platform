# Nawigacja i strategie oczekiwania sieciowego

W asynchronicznych aplikacjach internetowych (szczególnie SPA – Single Page Applications), kliknięcie linku lub wywołanie metody `page.goto()` nie oznacza, że strona jest natychmiast gotowa do interakcji. Oczekiwanie na pełne załadowanie kodu JavaScript, stylów i danych z API to jedno z największych wyzwań automatyzacji.

Playwright udostępnia precyzyjne mechanizmy kontroli nawigacji oraz **strategie oczekiwania sieciowego (waitUntil)**. Zrozumienie ich działania zapobiega niestabilnościom (flakiness) na maszynach CI/CD.

---

## 1. Parametry i cykl życia `page.goto()`

Metoda `page.goto(url)` nie tylko wpisuje adres do paska przeglądarki – zwraca ona obiekt odpowiedzi (`APIResponse`) i pozwala na precyzyjne określenie, w którym momencie nawigacja ma zostać uznana za zakończoną.

```typescript
await page.goto('/dashboard', {
  timeout: 30000,              // Maksymalny czas na nawigację (30s)
  waitUntil: 'domcontentloaded' // Kiedy uznać nawigację za udaną?
});
```

---

## 2. Strategie oczekiwania (`waitUntil` Options)

Playwright udostępnia cztery precyzyjne stany załadowania strony:

| Opcja | Opis i Zachowanie | Kiedy stosować? |
|---|---|---|
| `'commit'` | Serwer zwrócił pierwsze bajty odpowiedzi (nagłówki i kod statusu HTML). Przeglądarka rozpoczęła renderowanie. | Bardzo szybkie. Stosuj, gdy bezpośrednio po wejściu chcesz ręcznie skonfigurować mocki lub przechwytywanie zdarzeń sieciowych. |
| `'domcontentloaded'` | Sparsowano cały dokument HTML i zbudowano drzewo DOM. Skrypty asynchroniczne mogą być jeszcze pobierane. | Dobre dla tradycyjnych stron opartych o SSR (Server-Side Rendering). |
| `'load'` | (Domyślna) Wyzwolono systemowe zdarzenie `window.onload`. Pobrano wszystkie grafiki, style i skrypty. | Bezpieczna, tradycyjna strategia. |
| `'networkidle'` | Brak jakichkolwiek aktywnych żądań sieciowych przez minimum **500 milisekund**. | **Używaj ostrożnie w SPA!** Jeśli aplikacja w tle stale odpytuje serwer (long-polling / websockets), ta opcja wywoła timeout. |

---

## 3. Nawigacja w aplikacjach SPA (Client-Side Routing)

W aplikacjach SPA (np. React, Angular, Vue) kliknięcie przycisku nawigacji nie powoduje przeładowania całej strony (brak zdarzenia `window.onload`). Przejście do innego widoku zachodzi całkowicie w pamięci przeglądarki.

W takich sytuacjach nie stosujemy `page.waitForNavigation()`. Zamiast tego najlepszą praktyką jest **oczekiwanie na zmianę adresu URL** lub pojawienie się kluczowego elementu nowego widoku za pomocą asercji Web-First:

```typescript
// Act: Kliknięcie przycisku wyzwalającego routing po stronie klienta (SPA)
await page.getByRole('link', { name: 'Moje Konto' }).click();

// Assert: Asercja Web-First automatycznie poczeka na zmianę URL i widoczność elementu
await expect(page).toHaveURL('/account');
await expect(page.getByRole('heading', { name: 'Ustawienia Konta' })).toBeVisible();
```

---

## 4. Obsługa błędów nawigacji (SSL, 404, Timeouts)

Jeśli nawigacja nie powiedzie się (np. z powodu błędu certyfikatu SSL, niedostępności serwera lub upłynięcia limitu czasu), Playwright rzuci błąd. Błędy te możemy obsługiwać na poziomie konfiguracji globalnej (np. `ignoreHTTPSErrors: true` dla środowisk testowych ze słabymi certyfikatami).

---

## 5. Checklista Stabilnej Nawigacji
- [ ] Czy świadomie dobrałeś opcję `waitUntil` w zależności od typu technologii frontendowej (SSR vs SPA)?
- [ ] Czy całkowicie wyeliminowałeś przestarzałe, ręczne opóźnienia (`page.waitForTimeout`) po nawigacji?
- [ ] Czy w testach aplikacji SPA opierasz się na asercjach Web-First weryfikujących docelowy URL (`expect(page).toHaveURL`)?