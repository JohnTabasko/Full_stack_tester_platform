# Rodzaje testów i piramida testów

Automatyzacja jest skuteczna tylko wtedy, gdy zespół rozumie, **jaką informację chce uzyskać** i **na jakim poziomie najlepiej ją zdobyć**. Test jednostkowy, integracyjny, API, kontraktowy, E2E, eksploracyjny, regresyjny czy akceptacyjny nie konkurują ze sobą. Każdy odpowiada na inne pytanie i ma inny koszt.

Piramida testów nie jest dogmatem. To model ekonomii informacji: im niżej testujesz, tym szybciej i taniej dostajesz feedback, ale tym mniej sprawdzasz realne połączenie całego systemu. Im wyżej testujesz, tym większy realizm, ale też większy koszt, wolniejsze wykonanie i trudniejsza diagnoza.

## 1. Testowanie jako informacja o ryzyku

Tester nie „odhacza przypadków”. Tester dostarcza zespołowi informację:

- czy produkt spełnia istotne wymagania;
- jakie ryzyka pozostają;
- czy regresja jest prawdopodobna;
- gdzie system jest niestabilny;
- czy można podjąć decyzję o wdrożeniu.

Zanim wybierzesz narzędzie, nazwij ryzyko. Dla funkcji rabatów ryzyka mogą być różne:

| Ryzyko | Najlepszy poziom testu |
|---|---|
| źle obliczony rabat procentowy | unit |
| API zwraca `discountTotal` jako string zamiast number | contract/API |
| koszyk nie zapisuje rabatu po odświeżeniu | integration/E2E |
| użytkownik nie może użyć kuponu w checkout | E2E smoke |
| admin może zobaczyć raport rabatów | UI/API role test |

## 2. Testy jednostkowe

Testy jednostkowe sprawdzają mały fragment logiki w izolacji. Są szybkie, tanie i precyzyjne. Dobrze nadają się do:

- obliczeń;
- walidacji;
- mapowania danych;
- reguł domenowych;
- funkcji bez zależności zewnętrznych.

Przykład: funkcja obliczająca cenę po rabacie powinna mieć wiele testów jednostkowych, bo wariantów jest dużo, a uruchamianie każdego przez UI byłoby kosztowne.

Test jednostkowy nie mówi jednak, czy frontend poprawnie wysyła dane, API zapisuje wynik, a użytkownik widzi dobrą kwotę. Dlatego potrzebne są inne poziomy.

## 3. Testy integracyjne

Test integracyjny sprawdza współpracę kilku elementów:

- serwis + repozytorium;
- API + baza danych;
- komponent + provider;
- backend + kolejka;
- moduł płatności + adapter dostawcy sandbox.

Testy integracyjne są droższe niż unit, ale lepiej wykrywają problemy na granicach. Przykład: kalkulator rabatów może działać jednostkowo, ale integracja koszyka może zaokrąglać kwoty inaczej.

## 4. Testy API

Testy API są bardzo ważne dla Full Stack Testera. Sprawdzają zachowanie systemu bez kosztu pełnego UI:

- statusy HTTP;
- body odpowiedzi;
- nagłówki;
- autoryzację;
- scenariusze negatywne;
- paginację;
- kontrakty danych.

Test API jest często najlepszym miejscem dla walidacji ról, błędów 400/401/403/404, kontraktu i reguł biznesowych.

## 5. Testy kontraktowe

Testy kontraktowe chronią granicę między konsumentem i dostawcą API. Kontrakt może być opisany przez OpenAPI, Pact, JSON Schema albo AsyncAPI.

Przykłady pytań kontraktowych:

- Czy provider nadal zwraca pole `total` jako number?
- Czy błąd walidacji ma stabilny `code`?
- Czy event `OrderPaid` zawiera wymagane pola?
- Czy konsument używa tylko tego, co provider gwarantuje?

Kontrakt jest tańszy niż test E2E i szybciej wykrywa breaking changes.

## 6. Testy E2E

Testy end-to-end sprawdzają realny przepływ użytkownika przez wiele warstw. Są najdroższe, ale dają najwyższy realizm. Używaj ich dla krytycznych ścieżek:

- logowanie;
- checkout;
- płatność;
- rejestracja z aktywacją konta;
- najważniejszy przepływ SaaS;
- smoke po deployu.

Nie używaj E2E do każdej walidacji formularza. Jeśli test E2E pada, diagnoza może dotyczyć UI, API, danych, bazy, sieci, sesji albo środowiska. Dlatego E2E powinny być nieliczne, krytyczne i dobrze raportowane.

## 7. Smoke, sanity i regresja

**Smoke tests** odpowiadają na pytanie: „czy system w ogóle żyje po zmianie?”. Powinny być szybkie i krytyczne.

**Sanity tests** sprawdzają wąski obszar po konkretnej zmianie, np. tylko płatności po zmianie bramki płatniczej.

**Regression tests** sprawdzają, czy istniejące zachowania nie zostały zepsute. Mogą być szerokie, ale nadal powinny być oparte na ryzyku.

Przykład strategii:

```text
PR: unit + API smoke + E2E smoke
main: pełniejsza regresja API + UI
nightly: cross-browser + visual + accessibility + performance smoke
release: krytyczne E2E + kontrakty + raporty
```

## 8. Testy akceptacyjne

Testy akceptacyjne potwierdzają, że funkcja spełnia kryteria akceptacji. Mogą być manualne, automatyczne, API lub E2E. Ważne, aby były powiązane z wymaganiem i zrozumiałe dla biznesu.

Dobre kryterium:

```text
Given klient ma produkt w koszyku
When używa aktywnego kuponu 10%
Then suma zamówienia jest pomniejszona o 10%, ale nie więcej niż 50 zł
```

## 9. Antywzorce doboru poziomu testu

- Wszystko przez UI, bo „tak widzi użytkownik”.
- Same testy jednostkowe bez sprawdzenia integracji.
- Brak testów kontraktowych mimo wielu konsumentów API.
- Smoke suite trwająca 40 minut.
- Regresja bez priorytetów ryzyka.
- Testy E2E zależne od kolejności i wspólnych danych.

## 10. Checklista wyboru rodzaju testu

- Jakie ryzyko chcę sprawdzić?
- Jaki najniższy poziom da wiarygodny dowód?
- Czy potrzebuję realizmu całego systemu?
- Czy awaria wskaże konkretną przyczynę?
- Czy test będzie działał w odpowiednim pipeline?
- Czy ten scenariusz nie jest już pokryty taniej niżej?
- Czy wynik testu będzie zrozumiały dla zespołu?

## Linki

- [ISTQB Certified Tester Foundation Level](https://www.istqb.org/certifications/certified-tester-foundation-level)
- [ISO/IEC/IEEE 29119](https://www.iso.org/standard/81291.html)
- [Vitest Guide](https://vitest.dev/guide/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Pact — Contract Testing](https://docs.pact.io/)
