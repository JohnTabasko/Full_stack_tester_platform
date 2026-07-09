# Generowanie przypadków testowych i danych testowych

AI może przyspieszyć analizę wymagań, generowanie wariantów testów i tworzenie syntetycznych danych. Nie może jednak być traktowana jako oracle jakości. Model może halucynować, pomijać istotne ryzyka, powielać przypadki albo generować dane niezgodne z polityką prywatności. Full Stack Tester powinien używać AI jako asystenta, a nie autora decyzji.

## 1. AI jako generator hipotez

Dobry prompt nie brzmi „napisz testy”. Dobry prompt zawiera:

- kontekst produktu;
- wymaganie;
- ryzyka;
- ograniczenia;
- poziom testu;
- oczekiwany format;
- kryteria oceny.

Przykład:

```text
Jesteś testerem API. Na podstawie wymagania wygeneruj przypadki testowe dla endpointu POST /orders. Uwzględnij klasy równoważności, wartości brzegowe, autoryzację, błędy walidacji i idempotencję. Zwróć tabelę: ryzyko, dane, oczekiwany status, poziom testu. Nie generuj danych osobowych.
```

## 2. Traceability do wymagań

AI może wygenerować dużo przypadków, ale każdy powinien być powiązany z wymaganiem albo ryzykiem. Dodaj kolumnę `source requirement` lub `risk id`. Bez tego lista testów wygląda imponująco, ale trudno ocenić pokrycie.

## 3. Walidacja wygenerowanych przypadków

Każdy przypadek wygenerowany przez AI powinien przejść review:

- czy sprawdza realne ryzyko?
- czy oczekiwany wynik jest poprawny?
- czy dane są legalne i bezpieczne?
- czy przypadek nie dubluje innego?
- czy poziom testu jest właściwy?
- czy przypadek jest automatyzowalny?

AI może zaproponować test E2E dla każdej walidacji. Tester powinien przenieść część przypadków na unit/API/contract.

## 4. Generowanie danych syntetycznych

AI może pomagać tworzyć dane:

- przykładowe adresy;
- nazwy produktów;
- edge cases tekstowe;
- dane wielojęzyczne;
- warianty formularzy;
- przypadki błędne.

Nie używaj AI do przetwarzania prawdziwych danych klientów bez polityki organizacji. Dane syntetyczne powinny być oznaczone i bezpieczne.

## 5. Dane produkcyjnopodobne

Dane produkcyjnopodobne są wartościowe, ale ryzykowne. Jeśli AI ma pomóc w ich tworzeniu, używaj opisu rozkładu, a nie prawdziwych rekordów:

```text
Wygeneruj 20 syntetycznych zamówień. Rozkład: 70% PL, 20% DE, 10% US; 10% z kuponem; 5% z produktem niedostępnym. Nie używaj prawdziwych danych osobowych.
```

## 6. Prompt patterns dla testera

Przydatne wzorce:

- „wygeneruj klasy równoważności”;
- „znajdź wartości brzegowe”;
- „stwórz tablicę decyzyjną”;
- „zaproponuj testy negatywne”;
- „wskaż brakujące ryzyka”;
- „zredukuj przypadki pairwise”;
- „przypisz poziom testu: unit/API/E2E”.

## 7. Halucynacje i nadmiar

AI często tworzy:

- endpointy, których nie ma;
- pola niezgodne z kontraktem;
- testy z nieprawdziwą logiką biznesową;
- zbyt dużo podobnych przypadków;
- asercje zbyt ogólne;
- dane naruszające prywatność.

Dlatego wynik AI jest szkicem do review, nie gotową specyfikacją.

## 8. Checklista AI-generated tests

- Czy każdy przypadek ma źródło wymagania lub ryzyko?
- Czy oczekiwany wynik jest zweryfikowany?
- Czy dane są syntetyczne?
- Czy przypadki nie są duplikatami?
- Czy poziom testu jest właściwy?
- Czy testy mają konkretne asercje?
- Czy człowiek zatwierdził wynik?

## Linki

- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic Documentation](https://docs.anthropic.com/)

## 9. AI a techniki projektowania testów

AI dobrze wspiera klasyczne techniki, jeśli poprosisz o konkretny format:

```text
Wygeneruj klasy równoważności i wartości brzegowe dla pola age: min 18, max 65. Zwróć tabelę z wartościami: poniżej, granica, powyżej.
```

Model może pomóc szybko znaleźć warianty, ale tester musi sprawdzić, czy wynik odpowiada wymaganiom.

## 10. Redukcja nadmiaru

AI często generuje zbyt dużo przypadków. Poproś o deduplikację i priorytetyzację:

```text
Zredukuj listę przypadków do minimalnego zestawu smoke, regression i edge cases. Uzasadnij, co pomijasz.
```

To pomaga przekształcić surową listę w strategię.

## 11. Zasada końcowa

AI może przyspieszyć generowanie wariantów, ale jakość testów zależy od review, traceability i umiejętności odrzucenia przypadków bez wartości.

## 12. Generowanie danych do testów bezpieczeństwa

AI może pomóc wygenerować listę payloadów do testów negatywnych: bardzo długie stringi, znaki specjalne, HTML, SQL-like input, Unicode, emoji. Taki zestaw musi być bezpieczny i kontrolowany. Nie kopiuj payloadów bez zrozumienia ich skutków.

## 13. Dokumentowanie użycia AI

Jeśli przypadki testowe powstały z pomocą AI, zapisz to w notatce projektowej: jaki był prompt, jakie ograniczenia, kto wykonał review i które przypadki odrzucono. To zwiększa audytowalność procesu.

## 14. Zasada końcowa

AI pomaga poszerzyć perspektywę, ale tester odpowiada za selekcję, priorytetyzację i zgodność przypadków z ryzykiem produktu.

## 15. AI a dane wielojęzyczne

Modele dobrze generują warianty językowe, ale wymagają walidacji przez osoby znające język i kontekst. Dla aplikacji międzynarodowej możesz poprosić o przykłady nazw, adresów i komunikatów dla kilku locale, ale wynik sprawdzaj względem reguł produktu.

## 16. AI a pairwise

AI może zaproponować redukcję kombinacji, ale jeśli decyzja jest krytyczna, użyj narzędzia pairwise albo jawnej tablicy. Model może pominąć ważną parę, jeśli prompt nie określa parametrów i wartości.

## 17. Minimalny workflow

1. Wygeneruj warianty.
2. Usuń duplikaty.
3. Przypisz ryzyko i poziom testu.
4. Zweryfikuj oczekiwany wynik.
5. Dopiero potem automatyzuj.

AI nie zwalnia z odpowiedzialności za jakość danych testowych i oczekiwanych rezultatów.

Każdy wygenerowany przypadek wymaga krytycznego review człowieka przed automatyzacją.
 Bez wyjątków.
