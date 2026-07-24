# Projekt Końcowy: Budowa Kompleksowego Systemu Automatyzacji (UI, API, DB, CI)

Zwieńczeniem całego programu nauki dla Full Stack Testera / SDET jest samodzielne zaprojektowanie i zaimplementowanie od zera **zintegrowanego systemu automatyzacji testów**. Projekt ten ma dowieść Twoich kompetencji w zakresie czystego kodu (Clean Code), zasad SOLID, zaawansowanych wzorców Playwright (POM, AOM, Fabryki, Fixture), testowania baz danych w warunkach współbieżnych oraz pełnej orkiestracji w kontenerach Docker i rurociągach CI/CD.

W tej lekcji przeanalizujemy architekturę projektu końcowego, wymagania merytoryczne oraz kryteria oceny Twojego portfolio.

---

## 1. Architektura i zakres techniczny projektu końcowego

Twój projekt końcowy musi automatyzować rzeczywistą lub dostarczoną aplikację trójwarstwową (sklep internetowy lub system ERP) i składać się z następujących obszarów inżynieryjnych:

```
               +-------------------------------------------------+
               |            PROJEKT KOŃCOWY SDET                 |
               +-------------------------------------------------+
                /         |               |             \
               v          v               v              v
      +------------+ +------------+ +------------+ +------------+
      | WARSTWA UI | | WARSTWA API| | WARSTWA DB | | WARSTWA CI |
      |  (Playwright| |  (BaseApi  | | (Współbież-| |  (GitHub   |
      |   POM / CT)  | |   & AOM)   | |  ność/SQL) | |  Actions/  |
      +------------+ +------------+ +------------+ |   Docker)  |
                                                   +------------+
```

### A. Warstwa interfejsu graficznego (UI)
*   Pełna implementacja Page Object Model (POM) z podziałem stron na mniejsze komponenty (Component Objects) z lokalizatorami korzenia (`rootLocator`).
*   Wszystkie klasy stron muszą dziedziczyć po klasie abstrakcyjnej `BasePage` (Template Method).
*   Testy regresji wizualnej (`toHaveScreenshot`) z precyzyjnym maskowaniem elementów dynamicznych.

### B. Warstwa API i Integracji
*   Wdrożenie API Object Model (AOM) dla kluczowych serwisów biznesowych.
*   Zunifikowana klasa bazowa `BaseApi` automatycznie wstrzykująca nagłówki korelacji (`X-Correlation-Id`) i autoryzacji.
*   Automatyczna walidacja kontraktów JSON za pomocą biblioteki AJV (JSON Schema).

### C. Warstwa Bazy Danych (DB)
*   Wdrożenie automatycznego czyszczenia i przywracania bazy danych (Teardown) po każdym teście przy użyciu transakcyjnych rollbacków lub selektywnego kasowania po identyfikatorze `run_id` (UUID).
*   Test weryfikujący odporność aplikacji na anomalie współbieżne (Lost Update / Deadlocks).

### D. Warstwa DevOps i CI/CD
*   Zaprojektowanie pliku rurociągu YAML dla GitHub Actions lub GitLab CI.
*   Wdrożenie pełnego cache'owania zależności npm oraz binariów przeglądarek w celu skrócenia czasu builda o 80%.
*   Orkiestracja testów w kontenerze Docker za pomocą Docker Compose.
*   Publikacja raportów HTML bezpośrednio w chmurze (GitHub Pages) i dynamiczne alerty na Slacku.

---

## 2. Kryteria oceny rzetelności projektu (Code Review Standard)

Podczas oceny Twojego repozytorium przez rekruterów i liderów technicznych, badane będą następujące aspekty:
1.  **Czystość kodu (Clean Code)**: Czy kod jest czytelny, samo-dokumentujący się, wolny od "magicznych liczb" i twardo kodowanych sleepów?
2.  **Zasada Separation of Concerns**: Czy pliki testów zawierają wyłącznie logikę scenariusza (AAA) i asercje, bez technicznych lokatorów?
3.  **Wydajność**: Czy suita wykorzystuje pełną moc współbieżności i nie ulega zawieszeniu przy braku stabilności sieci?

---

## 3. Checklista Projektu Końcowego
- [ ] Czy Twój projekt integruje weryfikację warstw UI, API, bazy danych oraz rurociągu CI/CD w jednym spójnym repozytorium?
- [ ] Czy kod źródłowy w pełni przestrzega zasad SOLID, wzorca Fabryki oraz kompozycji komponentów?
- [ ] Czy rurociąg CI wykorzystuje zaawansowane cache'owanie oraz automatyczne publikowanie raportów HTML?
- [ ] Czy opisałeś architekturę swojego projektu oraz instrukcję uruchomienia od zera w profesjonalnym pliku `README.md`?