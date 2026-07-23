# Zasady projektowania testów

Dobre testy Playwright zaczynają się od ryzyka, nie od narzędzia. Nie chodzi o to, aby automatyzować jak najwięcej kliknięć. Chodzi o to, aby zespół szybko wiedział, czy najważniejsze zachowania produktu nadal działają. Test ma być wartościowy, stabilny, czytelny i możliwy do diagnozy w CI.

## 1. Projektowanie od ryzyka

Zanim napiszesz test, odpowiedz:

- jaki błąd chcę wykryć?
- jaki byłby wpływ na użytkownika lub biznes?
- czy UI/E2E to właściwy poziom testu?
- jakie dane są potrzebne?
- jaka asercja udowodni poprawność?

Przykład: walidacja formatu kwoty może być testem jednostkowym. Integracja płatności z aktualizacją statusu zamówienia może wymagać testu API lub E2E. Krytyczna ścieżka płatności powinna mieć smoke test w UI.

## 2. Piramida testów

Nie wszystko powinno być testem E2E. Testy UI są najdroższe: wymagają przeglądarki, danych, środowiska i diagnostyki. Dlatego:

- reguły walidacji testuj nisko;
- kontrakty i autoryzację testuj przez API;
- krytyczne ścieżki użytkownika testuj przez UI;
- regresję wizualną stosuj tam, gdzie layout jest ryzykiem.

## 3. AAA — Arrange, Act, Assert

```typescript
test('klient może opłacić zamówienie', async ({ page, request }) => {
  // Arrange
  const order = await createOrder(request, buildOrder());

  // Act
  await page.goto(`/orders/${order.id}`);
  await page.getByRole('button', { name: 'Opłać' }).click();

  // Assert
  await expect(page.getByRole('status')).toContainText('Opłacone');
});
```

Jeśli Arrange, Act i Assert mieszają się chaotycznie, test będzie trudny w debugowaniu.

## 4. Oficjalne best practices Playwright

Najważniejsze zasady:

- testuj zachowanie widoczne dla użytkownika;
- używaj locatorów użytkownika: role, label, text;
- izoluj testy i dane;
- unikaj zależności od kolejności testów;
- nie używaj `waitForTimeout` jako synchronizacji;
- używaj web-first assertions;
- mockuj tylko tam, gdzie ma to uzasadnienie;
- włącz trace/screenshot/video jako diagnostykę, nie ozdobę;
- trzymaj testy małe i czytelne.

## 5. Given-When-Then

Given-When-Then jest dobrym językiem dla testów biznesowych:

```typescript
test('klient widzi błąd dla odrzuconej płatności', async ({ page }) => {
  await test.step('Given klient jest na stronie płatności', async () => {
    await page.goto('/checkout/payment');
  });

  await test.step('When płaci kartą odrzuconą', async () => {
    await page.getByLabel('Numer karty').fill('4000000000000002');
    await page.getByRole('button', { name: 'Zapłać' }).click();
  });

  await test.step('Then widzi komunikat o odrzuceniu', async () => {
    await expect(page.getByRole('alert')).toContainText('Płatność odrzucona');
  });
});
```

## 6. Smoke vs regression

Smoke:

- szybki;
- krytyczne ścieżki;
- każdy PR;
- mało danych;
- mało przeglądarek.

Regression:

- szerszy zakres;
- nightly lub przed release;
- więcej projektów/przeglądarek;
- większe koszty diagnostyki.

Tagi pomagają powiązać testy z pipeline:

```typescript
test('checkout działa @smoke @critical', async ({ page }) => {});
```

## 7. Checklista projektowania testu

- Czy test chroni konkretne ryzyko?
- Czy to właściwy poziom testu?
- Czy dane są izolowane?
- Czy locator jest stabilny i widoczny dla użytkownika?
- Czy asercja sprawdza skutek, a nie implementację?
- Czy test może działać równolegle?
- Czy awaria zostawi trace i czytelny raport?

## Linki

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Locators](https://playwright.dev/docs/locators)
- [Assertions](https://playwright.dev/docs/test-assertions)
- [Parallelism](https://playwright.dev/docs/test-parallel)

## 8. Decyzja: UI, API czy test niższego poziomu?

Przy każdym scenariuszu wybierz najtańszy poziom, który daje wiarygodną informację. Jeśli reguła waliduje format numeru telefonu, test jednostkowy da szybszy feedback niż E2E. Jeśli endpoint ma odrzucać brak uprawnień, test API będzie szybszy i precyzyjniejszy niż UI. Jeśli chcesz sprawdzić, że klient faktycznie przechodzi checkout i widzi potwierdzenie, E2E jest właściwe.

Przykład decyzji dla płatności:

| Ryzyko | Najlepszy poziom |
|---|---|
| algorytm naliczania rabatu | unit/integration |
| kontrakt `POST /payments` | API |
| brak uprawnień do cudzej płatności | API/security |
| użytkownik widzi potwierdzenie po płatności | E2E UI |
| układ formularza płatności | visual/component |

## 9. Minimalna liczba akcji

Dobry test wykonuje tylko akcje potrzebne do wywołania zachowania. Jeśli test sprawdza edycję adresu, utwórz użytkownika przez API i przejdź bezpośrednio do ekranu adresu. Nie przechodź przez rejestrację, logowanie, onboarding i menu, jeśli nie są celem testu.

## 10. Review projektu testu

Przed merge zadaj pytania:

- Czy test padnie, jeśli realne ryzyko się zmaterializuje?
- Czy test nie dubluje dokładnie sprawdzenia z niższego poziomu?
- Czy test ma tylko jedną główną przyczynę awarii?
- Czy jest szybki na tyle, aby działać w odpowiednim pipeline?
- Czy raport po awarii wskaże właściciela problemu?

Projekt testu jest tak samo ważny jak jego implementacja.

## 11. Jedna główna intencja testu

Test może mieć kilka asercji, ale powinien mieć jedną główną intencję. Jeśli test sprawdza logowanie, koszyk, płatność, email i fakturę, awaria może mieć zbyt wiele przyczyn. Taki test może istnieć jako krytyczny E2E smoke, ale nie powinien być wzorcem dla całej regresji.

## 12. Test jako dokumentacja zachowania

Dobrze napisany test jest żywą dokumentacją. Nazwy testów, kroki `test.step`, dane i asercje powinny mówić, jak system ma działać. Jeśli product owner nie rozumie nazwy testu w raporcie, nazwa jest prawdopodobnie zbyt techniczna.

## 13. Asercja skutku ubocznego

W testach full stack często warto sprawdzić skutek na innej warstwie:

```typescript
await page.getByRole('button', { name: 'Opłać' }).click();
await expect(page.getByText('Opłacone')).toBeVisible();

const order = await ordersClient.getOrder(orderId);
expect(order.status).toBe('PAID');
```

Nie rób tego w każdym teście, ale dla krytycznych przepływów UI + API daje dużo większą pewność.

## 📘 Suplement Inżynieryjny 2026: Dobre Praktyki i Wzorce (SOLID & Clean Code)
*Inspiracja: „Scalable Test Automation with Playwright” (2026), Chapter 5*
*   **Zasada Single Responsibility (SRP)**: Każdy komponent frameworka powinien odpowiadać za jedną rzecz. Unikaj monolitycznych klas POM łączących akcje UI, setup bazy, zapytania API i asercje.
*   **WET (Write Everything Twice)**: Unikaj przedwczesnej abstrakcji. Zastosuj zasadę WET i wyodrębnij kod do abstrakcji dopiero przy trzeciej duplikacji.
