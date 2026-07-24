# Rodzaje testów i nowoczesna piramida testów (Test Pyramid)

Jednym z największych wyzwań w projektowaniu dużych systemów automatyzacji jest optymalny dobór poziomów testowania. Jeśli zaimplementujesz zbyt wiele testów na poziomie interfejsu graficznego (UI E2E), Twoja suita stanie się powolna, flaky i droga w utrzymaniu. Jeśli z kolei skupisz się wyłącznie na testach jednostkowych, przeoczysz krytyczne błędy integracji systemowych.

Zrozumienie i wdrożenie **Piramidy Testów (Test Pyramid)** Martina Fowlera w nowoczesnym ujęciu z 2026 r. to kluczowa kompetencja architekta testów.

---

## 1. Klasyczna Piramida Testów i jej warstwy

Piramida testów definiuje optymalną proporcję i rozkład rodzajów testów w projekcie:

```
                  / \
                 /   \       E2E / UI Tests (Playwright)
                /     \      ~10% — Najdroższe, najwolniejsze, stabilność wizualna
               /-------\
              /         \    Integration / API Tests (Playwright request)
             /           \   ~30% — Średnia szybkość, walidacja kontraktów i uprawnień
            /-------------\
           /               \  Unit / Component Tests (Jest, Vitest, Playwright CT)
          /                 \ ~60% — Najszybsze, najtańsze, izolowane badanie funkcji
         ─────────────────────
```

### A. Warstwa 1: Testy Jednostkowe (Unit Tests)
Weryfikują poprawność pojedynczych, odizolowanych funkcji, klas lub metod (np. funkcja obliczania podatku w koszyku).
*   **Charakterystyka**: Ekstremalnie szybkie (wykonują się w milisekundach), odizolowane od sieci i bazy (mocki).
*   **Narzędzia**: Vitest, Jest.

### B. Warstwa 2: Testy Integracyjne i API (Integration / API Tests)
Weryfikują poprawność komunikacji między modułami, bazą danych a serwerami API.
*   **Charakterystyka**: Sprawdzają walidację danych, poprawność kodów HTTP, uprawnienia i zgodność kontraktu JSON bez renderowania UI.
*   **Narzędzia**: Playwright (wbudowana fixtura `request`), Supertest.

### C. Warstwa 3: Testy End-to-End (E2E / UI Tests)
Symulują rzeczywistą podróż użytkownika (User Journey) od początku do końca, testując zintegrowany system (frontend + backend + bazy danych).
*   **Charakterystyka**: Najwolniejsze, wymagają pełnego renderowania przeglądarki, weryfikują spójność całego systemu.
*   **Narzędzia**: Playwright (wbudowana fixtura `page`).

---

## 2. Odwrócona piramida testów: Antywzorzec "Stożek lodowy" (Ice Cream Cone)

W projektach z dużym długiem technologicznym piramida często ulega odwróceniu: powstaje ogromna liczba niestabilnych i wolnych testów UI E2E, a testów jednostkowych i API jest znikoma ilość.

*   **Skutki**: Czas wykonania suity przekracza godzinę, testy stale rzucają fałszywe błędy, a programiści przestają im ufać, co prowadzi do paraliżu wydań.
*   **Rozwiązanie**: Przenieś 80% przypadków brzegowych (np. walidacje pól, niepoprawne formaty e-mail, błędy uprawnień) z warstwy UI do warstwy API lub jednostkowej, pozostawiając w E2E wyłącznie krytyczne procesy biznesowe (Happy Path).

---

## 3. Strategia Regresji Funkcjonalnej w Playwright

Nowoczesny Full Stack Tester projektuje **hybrydowe scenariusze**:
1.  **Arrange**: Dane wejściowe przygotuj błyskawicznie przez API (warstwa integracyjna).
2.  **Act & Assert**: Proces zakupu sprawdź przez interfejs graficzny UI (warstwa E2E).
To połączenie daje optymalną prędkość wykonania przy zachowaniu pełnego zaufania do rezultatów.

---

## 4. Checklista Poziomów Testowania
- [ ] Czy Twój projekt testowy dąży do zachowania optymalnych proporcji piramidy testów?
- [ ] Czy unikasz wstrzykiwania setek przypadków walidacji pól tekstowych do testów UI E2E?
- [ ] Czy wdrażasz testy hybrydowe (API Seeding) w celu drastycznego skracania czasu trwania regresji?
- [ ] Czy potrafisz zidentyfikować i zdiagnozować antywzorzec "stożka lodowego" (Ice Cream Cone) w zespole?