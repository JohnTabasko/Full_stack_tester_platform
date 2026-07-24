# Najgroźniejsze antywzorce i pułapki w Playwright

Gdy zespół uczy się nowego narzędzia automatyzacji, bardzo często nieświadomie powiela stare nawyki ze starszych frameworków (jak Selenium) lub popełnia błędy projektowe, które na wczesnym etapie dają pozorną wygodę, ale w dłuższej perspektywie generują olbrzymie koszty i paraliżują wdrażanie kodu.

W tej lekcji zebraliśmy **najgroźniejsze antywzorce inżynieryjne w Playwright** wraz z wyjaśnieniem ich konsekwencji oraz gotowymi instrukcjami ich eliminacji.

---

## Antywzorzec 1: Ręczne opóźnienia czasowe (`page.waitForTimeout`)

Wstawianie stałych opóźnień (np. `await page.waitForTimeout(3000)`) w celu "poczekania, aż strona się załaduje" to kardynalny błąd i najczęstsza przyczyna powstawania niestabilności (flakiness).

*   **Dlaczego to błąd?** Trzy sekundy mogą być wystarczające na szybkim komputerze dewelopera, ale na obciążonej maszynie wirtualnej CI to zbyt krótko, co wywoła losowe awarie testów. Z drugiej strony, jeśli krok załaduje się w 200 ms, marnujesz 2.8 sekundy w każdym teście.
*   **Rozwiązanie**: Pozwól działać wbudowanemu auto-waitingowi i używaj wyłącznie asynchronicznych asercji Web-First:
    ```typescript
    // Prawidłowe podejście: Playwright poczeka dokładnie tyle, ile trzeba (maksymalnie do 5s)
    await expect(page.locator('.success-alert')).toBeVisible();
    ```

---

## Antywzorzec 2: "Framework ponad produkt" (Over-Engineering Trap)

Architekci testów często wpadają w pułapkę budowania skomplikowanego, abstrakcyjnego "frameworka wewnątrz frameworka" (pisania generycznych fasad, strategii, fabryk i fabryk fabryk) zanim projekt osiągnie stabilność i dojrzałość.

*   **Dlaczego to błąd?** Zwiększa to tzw. *obciążenie poznawcze* (cognitive load) dla nowych testerów. Proste dopisanie testu wymaga otwierania i edycji pięciu różnych plików abstrakcji, co wydłuża czas pracy deweloperów.
*   **Rozwiązanie**: Zastosuj zasadę **WET (Write Everything Twice)**. Powielenie kodu dwa razy jest w pełni zdrowe i naturalne. Dopiero przy trzeciej powtarzalności wyodrębnij czystą, prostą abstrakcję (np. klasę POM lub pomocnika).

---

## Antywzorzec 3: Leaking State (Brudne środowisko)

Testy modyfikują globalne dane konfiguracyjne (np. zmieniają nazwę głównego sklepu z "Sklep Staging" na "Sklep Testowy") bez przywrócenia stanu początkowego na koniec wykonania.

*   **Dlaczego to błąd?** Wywołuje błędy kaskadowe – wszystkie kolejne testy uruchomione w tym workerze zaczną zawodzić z niewytłumaczalnych powodów.
*   **Rozwiązanie**: Każdy test musi być w 100% niezależny. Jeśli test musi zmodyfikować stan globalny, zadbaj o przywrócenie wartości pierwotnej w sekcji `afterEach` / `afterAll` lub fazie teardownu fixtury:
    ```typescript
    test.afterEach(async ({ page }) => {
      // Przywróć stan początkowy (Teardown)
      await restoreGlobalSettings();
    });
    ```

---

## 4. Checklista Antywzorców (Self-Audit)
- [ ] Czy Twój kod testowy jest wolny od instrukcji `page.waitForTimeout`?
- [ ] Czy usunąłeś przedwczesne, skomplikowane abstrakcje projektowe na rzecz zasady WET?
- [ ] Czy upewniłeś się, że żaden test nie modyfikuje globalnych, wspólnych danych bez ich przywrócenia na koniec testu?
- [ ] Czy unikasz monolitycznych testów trwających powyżej 2 minut i sprawdzających wiele procesów biznesowych naraz?