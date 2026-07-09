# Strategia jakości i zarządzanie ryzykiem — perspektywa Full Stack Testera

> **Perspektywa Full Stack Testera**
> Jako Full Stack Tester nie jesteś "maszyną do pisania testów". Twoim głównym zadaniem jest dostarczanie **informacji o ryzyku** — które części systemu są najbardziej narażone na awarię, które scenariusze testowe dają największą wartość, które błędy mają najpoważniejsze konsekwencje dla użytkownika i biznesu. Automatyzacja wszystkiego to błąd — nie masz na to czasu, zasobów ani sensu. Musisz wiedzieć *co* testować, *jak głęboko* i *dlaczego właśnie to*. Ta lekcja zamienia Cię z "wykonawcy testów" w "stratega jakości".

## Cel lekcji

Po ukończeniu tej lekcji rozumiesz definicję jakości w kontekście systemów software'owych, potrafisz obliczać i priorytetyzować ryzyko, znasz piramidę testów i wiesz, jak Dobierać poziomy testowania, implementujesz strategię Shift-Left w zespole Agile, tworzysz Definition of Done dla zespołu, i wiesz, kiedy test automatyczny NIE ma sensu i lepiej go nie pisać.

---

## Definicja jakości — co to znaczy "dobra jakość"?

### Jakość nie jest "brakiem błędów"

Powszechnym błędem jest myślenie, że jakość = zero bugów. To niemożliwe i niepraktyczne. Jakość to:

> **Stopień, w jakim system spełnia wymagania zdefiniowane dla niego przez użytkowników i interesariuszy.**

W praktyce oznacza to, że musisz odpowiedzieć na pytania:
- Czy system robi to, co użytkownik oczekuje? (funkcjonalność)
- Czy działa wystarczająco szybko? (wydajność)
- Czy jest bezpieczny? (security)
- Czy jest intuicyjny? (UX)
- Czy kod jest czytelny i łatwy do utrzymania? (technical quality)
- Czy jest dostępny dla osób z niepełnosprawnościami? (accessibility)

### Trzy wymiary jakości w ocenie systemu

**Jakość funkcjonalna** — czy system robi to, co powinien?
- Czy zamówienie jest składane poprawnie?
- Czy płatność jest przetwarzana zgodnie z oczekiwaniami?
- Czy raporty pokazują prawidłowe dane?

**Jakość niefunkcjonalna** — jak system to robi?
- Czy strona ładuje się w < 2 sekundy?
- Czy system wytrzymuje 1000 jednoczesnych użytkowników?
- Czy dane są szyfrowane w transmisji i w spoczynku?
- Czy kod jest zgodny z regulacjami (GDPR, PCI DSS)?

**Jakość percepcyjna** — jak użytkownik *odczuwa* system?
- Czy interfejs jest intuicyjny?
- Czy błędy są wyjaśnione w sposób zrozumiały dla użytkownika?
- Czy feedback jest natychmiastowy i jasny?

---

## Testowanie oparte na ryzyku (Risk-Based Testing)

### Formuła ryzyka

Nie masz czasu przetestować wszystkiego. Dlatego priorytetyzacja oparta na ryzyku jest kluczowa:

```
Ryzyko = Prawdopodobieństwo wystąpienia błędu × Wpływ błędu na biznes
```

### Macierz ryzyka — 4 poziomy

| Poziom | Opis | Przykłady | Strategia testowania |
|---|---|---|---|
| **🔴 Krytyczne (P1)** | Awaria paraliżuje biznes, strata pieniędzy lub danych | Płatności, logowanie, bezpieczeństwo | Pełna automatyzacja + testy manualne + monitoring |
| **🟠 Wysokie (P2)** | Znaczący wpływ na użytkownika, ale nie paraliżuje | Koszyk, checkout, raporty | Automatyzacja najważniejszych ścieżek |
| **🟡 Średnie (P3)** | Utrudnia korzystanie, ale użytkownik może obejść | Wyszukiwanie, filtrowanie, sortowanie | Automatyzacja smoke + selektywne E2E |
| **🟢 Niskie (P4)** | Mało istotne, kosmetyczne, rzadko używane | Stopka, tooltip, zmiana ikony | Testy ad-hoc, automatyzacja rzadko |

### Praktyczny przykład priorytetyzacji

```typescript
// Moduł e-commerce — priorytety testów

// 🔴 P1: Krytyczne — natychmiast automatyzuj
test.describe('🔴 Płatności (Krytyczne)', () => {
  test('poprawna płatność kartą — sukces', async ({ page }) => { /* ... */ });
  test('odrzucona karta — komunikat błędu', async ({ page }) => { /* ... */ });
  test('timeout bramki płatności — retry', async ({ page }) => { /* ... */ });
  test('zabezpieczenie przed podwójnym obciążeniem', async ({ page }) => { /* ... */ });
});

// 🟠 P2: Wysokie — automatyzuj najważniejsze
test.describe('🟠 Koszyk i Checkout (Wysokie)', () => {
  test('dodanie produktu do koszyka', async ({ page }) => { /* ... */ });
  test('zmiana ilości w koszyku', async ({ page }) => { /* ... */ });
  test('usunięcie produktu z koszyka', async ({ page }) => { /* ... */ });
  // Pomiń:edycja adresu dostawy (mniej krytyczne)
});

// 🟡 P3: Średnie — selektywnie
test.describe('🟡 Wyszukiwanie (Średnie)', () => {
  test('wyszukiwanie po nazwie — wyniki', async ({ page }) => { /* ... */ });
  test('brak wyników — komunikat', async ({ page }) => { /* ... */ });
  // Pomiń: sortowanie wyników, filtry — testuj ad-hoc
});

// 🟢 P4: Niskie — ad-hoc
// "Testowanie elementu X ręcznie przy okazji innego testu"
```

### Jak oszacować prawdopodobieństwo i wpływ?

**Prawdopodobieństwo** (jak często ta część się zmienia / jak często się psuje):
- Częstotliwość zmian w kodzie (githistory).
- Złożoność techniczna (wiele zależności, stare komponenty).
- Historia błędów (czy wcześniej tu były problemy?).
- Stabilność dostawców zewnętrznych (API trzeciej strony).

**Wpływ** (co się stanie gdy zawiedzie):
- Wpływ finansowy (utrata przychodu, kary umowne).
- Wpływ na użytkownika (zablokowany workflow, utrata danych).
- Wpływ prawny (GDPR, PCI DSS, regulacje).
- Wpływ reputacyjny (media społecznościowe, recenzje).

---

## Piramida testów w praktyce

### Optymalna struktura pokrycia

Nie wszystkie testy są sobie równe. Różne poziomy dają różną wartość:

```
         /\        E2E (Playwright UI)        ~5-10% — najwolniejsze, najdroższe
        /  \       Coverage: kluczowe ścieżki użytkownika
       /    \      Kiedy: smoke tests, najważniejsze flow, pre-release
      /------\  
     /        \   Integration (Playwright API) ~20-30% — średnia szybkość
    /          \   Coverage: walidacje, uprawnienia, logika biznesowa
   /------------\  Kiedy: większość przypadków brzegowych, kontraktów API
  /              \
 /                \ Unit (Jest/Vitest)       ~60-70% — najszybsze, najtańsze
/                  \ Coverage: funkcje, komponenty, logika
──────────────────── Kiedy: każdy PR przed merge
```

### Dlaczego ta piramida jest ważna?

**Testy E2E (Playwright UI)** — drogie, wolne, niestabilne:
- ✅ Dobre: Smoke testy krytycznych ścieżek (rejestracja, logowanie, zakup).
- ❌ Złe: Testowanie każdej walidacji formularza przez UI.
- ❌ Złe: Testowanie szczegółów logiki biznesowej przez UI.

**Testy API (Playwright request)** — tanie, szybkie, stabilne:
- ✅ Dobre: Walidacje, uprawnienia, logika backendowa, kontrakty danych.
- ✅ Dobre: Przypadki brzegowe (błąd 400/403/404/500).
- ❌ Złe: Rendering komponentów, UX, interakcje użytkownika.

**Testy jednostkowe (Jest)** — najtańsze, najszybsze:
- ✅ Doble: Logika domenowa, obliczenia, transformacje danych.
- ✅ Dobre: Każdy PR sprawdza w izolacji, czy nie zepsuł funkcji.
- ❌ Złe: Cały system, integracje z bazą, UI.

### Praktyczna decyzja: gdzie testować konkretny przypadek?

| Przypadek testowy | Gdzie testować | Uzasadnienie |
|---|---|---|
| "Czy formularz waliduje email?" | **API** (request POST) | Szybko, stabilnie, sprawdza kontrakt |
| "Czy błędny email wyświetla czerwony komunikat?" | **UI** (page.click) | Sprawdzasz UX, nie logikę |
| "Czy system odrzuca ujemną cenę?" | **Unit** (Jest) | Izolowana logika, nie wymaga UI |
| "Czy zamówienie przechodzi cały flow od koszyka do płatności?" | **E2E** (Playwright) | End-to-end flow, sprawdza integrację wszystkich komponentów |
| "Czy raport PDF generuje poprawne dane?" | **API** (request POST) | Szybka weryfikacja bez UI |
| "Czy przycisk 'Zapłać' jest widoczny na mobile?" | **E2E** (Playwright + mobile) | Sprawdzasz responsywność UX |

---

## Strategia Shift-Left — wcześniej = taniej = lepiej

### Co to znaczy "Shift-Left"?

Tradycyjnie testowanie odbywało się NA KOŃCU cyklu rozwoju (Shift-Right):

```
[Design] → [Development] → [Testing] → [Release]
                                         ↑
                                   Testowanie tutaj = DROGO
                                   Błąd znaleziony = PÓŹNO
```

Shift-Left przesuwa testowanie w lewo:

```
[Design] → [Development] → [Testing] → [Release]
↑         ↑
Testowanie tutaj = TANIO = SZYBKO = WCZESNIE
```

Błąd znaleziony w fazie Design kosztuje 1x. Ten sam błąd znaleziony w fazie Testing kosztuje 10x. Ten sam błąd znaleziony po release kosztuje 100x.

### Praktyczne implementacje Shift-Left w zespole

**1. Review wymagań przed rozpoczęciem kodowania:**

Jako tester bierz udział w sesjach refinowania wymagań (backlog refinement). Pytaj:
- "Jakie są przypadki brzegowe tego wymagania?"
- "Co powinno się stać, gdy input jest pusty / ujemny / za duży?"
- "Czy jest już istniejąca funkcjonalność, z którą to może kolidować?"
- "Jak przetestujemy, że to działa?"

**2. Testowanie na etapie makiet (wireframes):**

Testuj strukturę informacji na etapie Figma/Adobe XD:
- Czy są wszystkie wymagane formularze?
- Czy ścieżka użytkownika jest logiczna?
- Czy są dostępne labele dla wszystkich pól (dla accessibility)?
- Czy krytyczne elementy (przyciski akcji) są wystarczająco widoczne?

**3. Pisanie testów jednostkowych przez programistów (TDD):**

Programista pisze test PRZED napisaniem kodu. To nie jest Twoja odpowiedzialność, ale powinieneś znać ten workflow, aby:
- Wspierać programistów w pisaniu testów.
- Wiedzieć, które przypadki są już pokryte testami jednostkowymi (żeby nie dublować w E2E).
- Proponować przypadki brzegowe do pokrycia w testach jednostkowych.

**4. Definition of Done (DoD) jako kontrakt jakości:**

```markdown
Zadanie jest "skończone" (Done) gdy:

Funkcjonalność:
□ Kod został napisany zgodnie z wymaganiami
□ Testy jednostkowe pokrywają nową logikę (min 80% coverage)
□ Feature działa zgodnie z akceptancją użytkownika

Automatyzacja:
□ E2E testy zostały napisane dla nowej funkcjonalności
□ Testy przechodzą na CI (green build)
□ Testy są oznaczone tagiem (@new-feature) do szybkiego uruchomienia

Dokumentacja:
□ Zmiany w API są udokumentowane (Swagger/OpenAPI)
□ Nowe wartości enum są opisane w konfiguracji

Jakość:
□ Code Review został zaakceptowany
□ ESLint/TypeScript nie zwracają błędów
□ Accessibility (Axe scan) — brak błędów krytycznych

Monitoring:
□ Nowe metryki (jeśli dotyczy) są skonfigurowane
□ Alert w Grafana został przetestowany
```

---

## Kiedy NIE pisać testu automatycznego?

Paradoksalnie, umiejętność rozpoznania, kiedy test automatyczny NIE ma sensu, jest jedną z najważniejszych kompetencji Full Stack Testera:

### Czas na decyzję: "Czy ten test powinien być automatyczny?"

Odpowiedz na te pytania:

1. **Czy ten scenariusz będzie często uruchamiany?** Jeśli testujesz coś raz na kwartał, automatyzacja nie zwróci się.

2. **Czy stabilność tego elementu jest wysoka?** Jeśli interfejs zmienia się codziennie (MVP, prototype), automatyzacja będzie generować więcej pracy niż wartości.

3. **Czy błąd w tym miejscu jest krytyczny?** Jeśli bug w stopce strony nikomu nie przeszkadza, nie automatyzuj go.

4. **Czy możesz pokryć to lżejszym testem?** Jeśli walidację email możesz przetestować przez API w 50ms, nie testuj przez UI w 5s.

5. **Czy masz czas i zasoby?** Jeśli zespół ma 2 tygodnie na release, nie трать czas на automatyzację редкого edge case.

### Lista sygnałów "nie automatyzuj"

```
❌ Nie automatyzuj gdy:
- Scenariusz testowany raz na kwartał lub rzadziej
- Element zmienia się codziennie (prototype, MVP)
- Błąd ma minimalny wpływ na użytkownika
- Ten sam przypadek jest już pokryty testami jednostkowymi
- Automatyzacja kosztowałaby więcej niż manualne testowanie
- Test sprawdza Cosmetics, nie functionality (kolor przycisku, cień, animacja)
- Środowisko testowe jest niestabilne (brak kontroli nad danymi/serwisami)
```

---

## Perspektywa Full Stack Testera — strategia, nie taktyka

Bycie Full Stack Testerem oznacza myślenie **strategicznie**, nie tylko **taktycznie**:

- **Taktyka**: Pisać testy dla każdego przypadku, który programista doda.
- **Strategia**: Wybrać 20% przypadków, które dają 80% wartości ochronnej, zautomatyzować je perfekcyjnie, a resztę testować manualnie.

- **Taktyka**: Testować każdą zmianę na każdym środowisku.
- **Strategia**: Wybrać najwłaściwsze środowisko (staging) i najwłaściwszy czas (pre-release).

- **Taktyka**: Pisać jak najwięcej testów E2E.
- **Strategia**: Wybrać piramidę testów — 70% unit, 20% API, 10% E2E.

Jako Full Stack Tester z perspektywą strategiczną jesteś w stanie:
- Wyjaśnić zespołowi, dlaczego testujesz X a nie Y.
- Zaproponować managerowi, że熏 nie warto testować Z.
- Wynegocjować Definition of Done, który obejmuje zarówno funkcjonalność, jak i jakość.
- Zaproponować, aby Focus obszar testów zmienił się w kwartale, kiedy system jest stabilny.

To jest poziom, na którym tester staje się prawdziwym partnerem w zespole, nie tylko wykonawcą.

---

## Podsumowanie

1. **Definicja jakości**: Spełnianie wymagań użytkowników i interesariuszy na wielu poziomach (funkcjonalnym, niefunkcjonalnym, percepcyjnym).
2. **Risk-Based Testing**: Ryzyko = Prawdopodobieństwo × Wpływ. Priorytetyzacja na podstawie konsekwencji błędu.
3. **Piramida testów**: 70% unit, 20% API, 10% E2E. Wybieraj odpowiedni poziom dla każdego przypadku.
4. **Shift-Left**: Testuj wcześnie (wymagania, makiety, TDD) — taniej i szybciej.
5. **Definition of Done**: Kontrakt jakości na poziomie zespołu — co oznacza "gotowe".
6. **Kiedy nie automatyzować**: Umiejętność rozpoznania, że test automatyczny nie ma sensu, jest tak samo ważna jak umiejętność jego napisania.

---

## Linki i źródła

- [Risk-Based Testing Approach — Guru99](https://www.guru99.com/risk-based-testing.html)
- [Shift-Left Testing Explained — BrowserStack](https://www.browserstack.com/guide/shift-left-testing)
- [Test Pyramid — Martin Fowler](https://martinfowler.com/articles/practical-test-pyramid.html)
- [Definition of Done — Agile Alliance](https://www.agilealliance.org/agile101/agile-glossary/)
- [Quality Assurance in Software Development — ISTQB](https://www.istqb.org/)