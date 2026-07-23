# Debugowanie wspierane przez sztuczną inteligencję i analiza logów

AI może pomóc w analizie błędów, logów, trace, stack trace i raportów testów. Może streścić długi log, zaproponować hipotezy, wskazać podobne symptomy i przygotować checklistę diagnostyczną. Nie może jednak zastąpić dowodów z systemu. Debugowanie nadal wymaga weryfikacji w logach, metrykach, trace, kodzie i testach.

## 1. AI jako asystent hipotez

Dobry workflow:

1. Zbierz dane diagnostyczne.
2. Usuń sekrety i dane osobowe.
3. Poproś AI o hipotezy, nie o wyrok.
4. Zweryfikuj hipotezy w systemie.
5. Dopiero potem popraw test lub produkt.

Zły workflow: wkleić cały log produkcyjny z tokenami i przyjąć pierwszą odpowiedź jako prawdę.

## 2. Co można analizować z AI

Bezpieczne po anonimizacji:

- stack trace;
- fragment logu aplikacji;
- komunikat błędu Playwright;
- opis trace;
- response body bez danych wrażliwych;
- konfigurację testu;
- pseudokod;
- syntetyczny przykład danych.

Nie wklejaj:

- tokenów;
- cookies;
- danych osobowych;
- haseł;
- pełnych logów produkcyjnych bez redakcji;
- prywatnego kodu, jeśli polityka organizacji tego zabrania.

## 3. Prompt do analizy awarii testu

```text
Przeanalizuj awarię testu Playwright. Nie zakładaj jednej przyczyny. Podaj 5 hipotez w kategoriach: locator, dane, auth, network, środowisko. Dla każdej hipotezy podaj, jaki dowód ją potwierdzi lub obali.

Kontekst:
- test: checkout applies coupon
- error: expect(locator).toHaveText('90 zł') timeout
- actual UI: 100 zł
- API /cart response: discountTotal=10
- środowisko: staging
```

Dobry wynik AI powinien proponować dowody: sprawdzić render checkoutu, mapping API→UI, cache, feature flag, stan koszyka.

## 4. Analiza logów

AI może streścić logi, ale przedtem je zredukuj:

- wybierz zakres czasu;
- filtruj po correlation ID;
- usuń sekrety;
- zachowaj statusy, request id, błędy, nazwy usług;
- dodaj informację o oczekiwanym zachowaniu.

Prompt:

```text
Podsumuj logi dla correlationId=e2e-123. Wskaż pierwszą anomalię czasową, błędy 5xx, timeouty oraz usługę, która najprawdopodobniej jest źródłem problemu. Nie wymyślaj brakujących danych.
```

## 5. AI i trace Playwright

Trace zawiera DOM, screenshoty, network i console. Nie zawsze wkleisz trace do AI, ale możesz wkleić streszczenie:

```text
Trace summary:
- click Apply coupon succeeded
- /api/cart returned 200 with discountTotal=10
- console error: Cannot read property 'amount' of undefined
- UI total remained 100 zł
```

AI może zaproponować hipotezę, ale dowód jest w trace i kodzie.

## 6. Debugowanie kodu testu

AI może pomóc znaleźć antywzorce:

- brak `await`;
- zły locator;
- `waitForTimeout`;
- asercja negatywna przechodząca przypadkiem;
- współdzielone dane;
- brak cleanupu;
- race condition eventu.

Prompt powinien zawierać ograniczenie: „Nie zmieniaj celu testu, popraw stabilność i diagnostykę”.

## 7. Evals dla AI debugging

Jeśli zespół intensywnie używa AI, warto oceniać jakość odpowiedzi:

- czy odpowiedź wskazała prawdopodobną przyczynę?
- czy poprosiła o brakujące dane?
- czy nie ujawniła niebezpiecznych sugestii?
- czy nie zaproponowała ukrycia błędu?
- czy podała kroki weryfikacji?

## 8. Antywzorce

- Wklejanie sekretów do promptu.
- Przyjmowanie odpowiedzi AI bez weryfikacji.
- Proszenie AI o „napraw test, żeby przeszedł” bez kontekstu ryzyka.
- Generowanie dużych zmian bez review.
- Użycie AI do obejścia asercji zamiast diagnozy.
- Brak dokumentowania hipotez i dowodów.

## 9. Checklista AI-assisted debugging

- Czy dane są zanonimizowane?
- Czy prompt zawiera kontekst i oczekiwany rezultat?
- Czy AI ma podać hipotezy i dowody, a nie jedną pewną odpowiedź?
- Czy hipotezy zostały sprawdzone w systemie?
- Czy wynik nie ukrywa defektu?
- Czy poprawka przeszła review człowieka?

## Linki

- [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [OpenTelemetry Docs](https://opentelemetry.io/docs/)
- [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer)

## 10. AI jako rubber duck

Czasem warto użyć AI jak rozmówcy: opisać problem i poprosić o pytania diagnostyczne. Dobry model powinien zapytać o brakujące dane, np. status API, role użytkownika, trace, logi konsoli albo ostatni deploy.

## 11. Bezpieczny format logów

Przed analizą logów przygotuj format:

```json
{
  "timestamp": "2026-07-09T10:00:00Z",
  "service": "orders-api",
  "level": "error",
  "message": "payment provider timeout",
  "correlationId": "e2e-123"
}
```

Brak danych osobowych i sekretów, ale zachowany kontekst diagnostyczny.

## 12. Zasada końcowa

AI pomaga szybciej tworzyć hipotezy, ale tylko system może dostarczyć dowód. Każdą sugestię trzeba potwierdzić obserwacją, testem albo dokumentacją.

## 13. AI a root cause analysis

Model może pomóc ułożyć drzewo przyczyn, ale nie powinien sam ogłaszać root cause. Root cause wymaga dowodu: commit, log, metryka, trace, reprodukcja albo eksperyment. Użyj AI do uporządkowania hipotez, a nie do zastąpienia analizy.

## 14. Przykład dobrego pytania

```text
Na podstawie poniższego zanonimizowanego logu wypisz hipotezy i dowody potrzebne do ich weryfikacji. Nie proponuj zmian w kodzie bez wskazania, jaki dowód je uzasadnia.
```

Takie ograniczenie zmniejsza ryzyko halucynacyjnej „naprawy”.

## 15. AI a porównywanie runów

AI może pomóc porównać dwa raporty: ostatni zielony run i aktualny czerwony. Przygotuj różnice: commit, lista failed tests, nowe błędy konsoli, zmiana endpointów, czas odpowiedzi. Model może wskazać wzorce, ale nadal wymagany jest dowód w systemie.

## 16. Bezpieczne streszczanie raportów

Raport dla zespołu może być generowany z pomocą AI, jeśli dane są bezpieczne. Dobry prompt powinien prosić o: streszczenie wpływu, pogrupowanie awarii po domenie, wskazanie właścicieli i listę brakujących danych diagnostycznych.

## 📘 Suplement Inżynieryjny 2026: Testowanie Wspierane przez Sztuczną Inteligencję
*Inspiracja: „Scalable Test Automation with Playwright” (2026), Chapter 12*
*   **AI Prompt Governance**: Przy wdrażaniu narzędzi generatywnych (LLM) do tworzenia testów, stosuj rygorystyczne zasady prywatności i weryfikacji kodu, zapobiegając halucynacjom oraz wyciekom danych wrażliwych do zewnętrznych modeli.
