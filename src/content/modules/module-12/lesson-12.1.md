# Inżynieryjne zasady projektowania testów automatycznych

Wytwarzanie oprogramowania testowego (Test Software Engineering) podlega tym samym rygorystycznym zasadom i wymaganiom architektonicznym, co tworzenie kodu aplikacyjnego. Pisanie testów w sposób chaotyczny, bez jasnego podziału na etapy oraz bez uwzględnienia analizy ryzyka, nieuchronnie prowadzi do paraliżu testów i utraty zaufania zespołu do zielonych raportów.

W tej lekcji przeanalizujemy fundamentalne zasady projektowania testów: od **metodologii analizy ryzyka (Risk-Based Testing)**, poprzez rygorystyczny wzorzec **Arrange-Act-Assert (AAA)**, aż po dobór właściwego poziomu testów (UI vs API).

---

## 1. Projektowanie testów od ryzyka (Risk-Based Testing)

W warunkach komercyjnych czas i zasoby są ograniczone – nie jesteś w stanie przetestować absolutnie wszystkiego. Z tego powodu automatyzację należy rozpocząć od **analizy ryzyka biznesowego**:

*   **Prawdopodobieństwo wystąpienia awarii**: Które moduły kodu są modyfikowane najczęściej? Gdzie deweloperzy najczęściej popełniają błędy?
*   **Wpływ biznesowy (Koszt awarii)**: Co się stanie, jeśli dany moduł przestanie działać na produkcji? (np. awaria koszyka i kasy blokuje przychody firmy – priorytet krytyczny P0; literówka w stopce – priorytet niski P3).

### Strategia pokrycia testowego:
1.  **Smoke Tests (Testy Dymne - P0)**: Błyskawiczny zestaw weryfikujący krytyczne ścieżki przychodowe (np. rejestracja, logowanie, płatność). Powinien trwać maksymalnie 2-3 minuty i być uruchamiany po każdym commitu dewelopera.
2.  **Regression Tests (Pełna Regresja - P1/P2)**: Szczegółowe pokrycie przypadków brzegowych, formularzy i integracji, uruchamiane rzadziej (np. raz dziennie / w nocy).

---

## 2. Rygorystyczny wzorzec AAA (Arrange, Act, Assert)

Każdy przypadek testowy w Twoim pliku specyfikacji musi posiadać krystalicznie czystą strukturę opartą o trzy odizolowane fazy **AAA**:

```
+-------------------------------------------------------------+
|    ARRANGE: Przygotuj środowisko, dane i zaloguj sesję      |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|    ACT: Wykonaj interakcję biznesową (maksymalnie 1-2 kroki) |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|    ASSERT: Zweryfikuj końcowy stan aplikacji (Web-First)    |
+-------------------------------------------------------------+
```

### Przykład idealnej struktury testu:
```typescript
import { test, expect } from './fixtures/custom-test';

test('użytkownik o niskich uprawnieniach nie może modyfikować ról', async ({ page, loginPage }) => {
  // 1. ARRANGE: Przygotuj stan użytkownika i przejdź do widoku
  await loginPage.navigate();
  await loginPage.login('user-viewer@sklep.pl', 'pass');
  await page.goto('/admin/users');

  // 2. ACT: Spróbuj wykonać akcję kliknięcia
  await page.getByRole('row', { name: 'Jan Kowalski' }).getByRole('button', { name: 'Edytuj rolę' }).click();

  // 3. ASSERT: Zweryfikuj odmowę dostępu i poprawność komunikatu
  await expect(page.getByRole('alert')).toContainText('Brak wymaganych uprawnień administratora');
});
```

---

## 3. Wybór poziomu: UI vs API vs Hybryda

Najczęstszym błędem spowalniającym testy E2E jest przeklikiwanie całego interfejsu graficznego (UI) w celu przygotowania stanu (Arrange). 

### Zalecana strategia hybrydowa (The Hybrid Approach):
*   Jeśli testujesz koszyk, nie trać 10 sekund na przechodzenie przez stronę główną, logowanie przez UI i wyszukiwanie 3 produktów.
*   **Użyj API** w fazie Arrange, aby zalogować się w ułamku sekundy, utworzyć koszyk i dodać do niego produkty.
*   **Użyj UI** w fazie Act i Assert, aby przetestować końcowy krok płatności w przeglądarce.

---

## 4. Checklista Projektowania Testów
- [ ] Czy kwalifikujesz testy do odpowiednich priorytetów (Smoke vs Regression) na podstawie analizy ryzyka biznesowego?
- [ ] Czy struktura Twojego kodu ściśle realizuje wzorzec AAA, oddzielając setup od akcji i asercji?
- [ ] Czy wykorzystujesz interfejsy API do błyskawicznego przygotowywania danych w fazie Arrange?
- [ ] Czy pliki testowe sprawdzają zachowania widziane z perspektywy rzeczywistego użytkownika, a nie detale techniczne HTML?