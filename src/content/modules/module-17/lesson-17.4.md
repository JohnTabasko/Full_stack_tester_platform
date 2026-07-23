# Testowanie eksploracyjne i raportowanie błędów

Testowanie eksploracyjne nie jest chaotycznym klikaniem. To jednoczesne projektowanie, wykonywanie i uczenie się o systemie. Tester eksploruje produkt, buduje hipotezy, sprawdza ryzyka i dokumentuje obserwacje. Automatyzacja nie zastępuje eksploracji — często z niej wynika. Dobry test automatyczny zaczyna się od dobrego zrozumienia ryzyka.

Raportowanie błędów jest równie ważne jak ich znajdowanie. Źle opisany defekt wydłuża naprawę, powoduje nieporozumienia i zmniejsza zaufanie do testera. Dobry raport pomaga zespołowi szybko podjąć decyzję.

## 1. Eksploracja jako uczenie się

W eksploracji tester stale odpowiada na pytania:

- czego jeszcze nie wiemy o systemie?
- gdzie może być ryzyko?
- jakie dane mogą ujawnić problem?
- co się stanie przy przerwaniu procesu?
- czy system zachowuje się spójnie między UI, API i bazą?

Eksploracja jest szczególnie wartościowa, gdy:

- wymagania są niepełne;
- funkcja jest nowa;
- ryzyko UX jest wysokie;
- integracji jest dużo;
- automatyzacja jeszcze nie istnieje;
- zespół szuka nieoczywistych problemów.

## 2. Session-Based Test Management

Session-based testing porządkuje eksplorację. Sesja ma:

- **charter** — cel eksploracji;
- **timebox** — np. 60–90 minut;
- **notatki** — co sprawdzono;
- **defekty** — co znaleziono;
- **pytania** — czego nie udało się rozstrzygnąć;
- **podsumowanie** — decyzja lub rekomendacja.

Przykład charteru:

```text
Eksploruj checkout dla sytuacji przerwania procesu: refresh, back button, utrata sieci, wygasła sesja, drugi tab. Skup się na spójności koszyka, rabatu i statusu zamówienia.
```

## 3. Heurystyki eksploracyjne

Heurystyki pomagają znaleźć ryzyka. Przykłady:

- granice danych: minimum, maksimum, puste, bardzo długie;
- role: admin, klient, gość, brak uprawnień;
- stan: nowy, opłacony, anulowany, wygasły;
- czas: data graniczna, wygasły token, timezone;
- sieć: offline, timeout, 500, retry;
- przeglądarka: refresh, back, wiele kart;
- bezpieczeństwo: cudzy zasób, manipulacja ID, XSS;
- dostępność: klawiatura, focus, label, role;
- integracje: email, webhook, płatność, kolejka.

## 4. Notatki eksploracyjne

Notatki powinny być użyteczne po sesji. Dobry format:

```markdown
Charter: Checkout interruption
Środowisko: staging, Chrome, user qa+run123@example.test
Dane: product=BOOK-1, coupon=PROMO10

Obserwacje:
- Refresh na /checkout usuwa rabat z UI, ale API nadal zwraca discountTotal=10.
- Back do koszyka pokazuje poprawną kwotę.
- Po ponownym wejściu do checkoutu rabat wraca.

Hipoteza:
- frontend nie odtwarza rabatu z API przy pierwszym renderze checkoutu.

Dowody:
- screenshot
- HAR
- cartId=CART-123
```

## 5. Severity vs priority

**Severity** opisuje wpływ techniczny lub biznesowy błędu.
**Priority** opisuje kolejność naprawy.

Przykłady:

| Błąd | Severity | Priority |
|---|---|---|
| checkout nie działa dla wszystkich użytkowników | critical | high |
| literówka w stopce | low | low |
| rzadki błąd w raporcie rocznym dzień przed zamknięciem roku | medium/high | high |
| crash w funkcji eksperymentalnej wyłączonej flagą | high | low/medium |

Nie mieszaj tych pojęć. Błąd może być poważny, ale mieć niższy priorytet, jeśli nie dotyczy aktywnego zakresu release.

## 6. Dobry raport defektu

Raport powinien zawierać:

- tytuł opisujący problem;
- środowisko;
- wersję/commit;
- użytkownika/rolę;
- dane testowe;
- kroki reprodukcji;
- wynik rzeczywisty;
- wynik oczekiwany;
- wpływ biznesowy;
- dowody: screenshot, video, trace, HAR, logi, request id;
- częstotliwość;
- workaround, jeśli znany.

Przykład:

```markdown
Tytuł: Rabat znika z UI po odświeżeniu checkoutu

Środowisko: staging, Chrome, commit abc123
Użytkownik: qa+checkout-run42@example.test
Dane: cartId=CART-123, coupon=PROMO10

Kroki:
1. Dodaj BOOK-1 do koszyka
2. Zastosuj PROMO10
3. Przejdź do checkoutu
4. Odśwież stronę

Rzeczywisty: UI pokazuje pełną kwotę 100 zł
Oczekiwany: UI pokazuje 90 zł po rabacie
Wpływ: klient może zapłacić więcej niż oczekuje
Dowody: trace.zip, screenshot, response /api/cart
```

## 7. Reprodukcja błędu

Jeśli błąd trudno odtworzyć, zapisz:

- dokładne dane;
- czas;
- przeglądarkę;
- rolę;
- flagi funkcji;
- request/correlation ID;
- czy problem występuje po refresh;
- czy problem występuje lokalnie i w CI;
- czy problem występuje dla innego konta.

Celem raportu nie jest udowodnienie winy. Celem jest skrócenie czasu od wykrycia do naprawy.

## 8. Kiedy automatyzować znaleziony błąd

Nie każdy błąd wymaga automatycznego testu regresji. Automatyzuj, gdy:

- błąd dotyczy krytycznego ryzyka;
- łatwo go odtworzyć deterministycznie;
- regresja jest prawdopodobna;
- test będzie stabilny;
- koszt automatyzacji jest uzasadniony.

Jeśli błąd wynika z jednorazowej migracji danych, lepszy może być test migracji lub checklist release, a nie E2E.

## 9. Checklista eksploracji i raportowania

- Czy sesja ma charter?
- Czy notatki pozwalają odtworzyć myślenie testera?
- Czy defekt zawiera dane, środowisko i dowody?
- Czy severity i priority są rozdzielone?
- Czy raport opisuje wpływ biznesowy?
- Czy wiadomo, czy błąd warto automatyzować?
- Czy nie ujawniono sekretów w załącznikach?

## Linki

- [ISTQB Certified Tester Foundation Level](https://www.istqb.org/certifications/certified-tester-foundation-level)
- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Atlassian — Bug report template](https://www.atlassian.com/agile/software-development/bug-report)

## 10. Eksploracja wspierana artefaktami

Podczas eksploracji aplikacji webowej zbieraj dowody tak, jak w automatyzacji:

- screenshot;
- HAR lub logi network;
- response body kluczowego API;
- identyfikatory danych testowych;
- correlation ID;
- nagranie krótkiego flow;
- notatkę, czy problem jest powtarzalny.

Dzięki temu raport błędu jest bardziej techniczny i szybciej trafia do właściwej osoby.

## 11. Od eksploracji do regresji

Po znalezieniu błędu zapytaj:

1. Czy błąd dotyczy ważnego ryzyka?
2. Czy może wrócić po refaktorze?
3. Czy da się go odtworzyć deterministycznie?
4. Czy test regresyjny będzie stabilny?
5. Jaki poziom testu jest najlepszy?

Nie każdy bug znaleziony eksploracyjnie musi stać się testem E2E. Czasem najlepszy test regresyjny to unit, API albo contract test.

## 📘 Suplement Inżynieryjny 2026: Fundamenty Testera i Strategia Jakości
*Inspiracja: „Scalable Test Automation with Playwright” (2026), Chapter 5*
*   **Risk-Based Testing**: Dobór testów automatycznych powinien zależeć bezpośrednio od analizy ryzyka biznesowego. Pokrywaj testami E2E wyłącznie obszary o najwyższym stopniu prawdopodobieństwa awarii i skutkach biznesowych.
