# Sztuczna inteligencja w analizie wymagań i szacowaniu ryzyka

Wykorzystanie modeli wielkojęzykowych (**LLM – Large Language Models**, np. GPT-4, Claude 3.5, Gemini) rewolucjonizuje codzienną pracę inżyniera jakości. Sztuczna inteligencja przestała być jedynie "pomocnikiem przy pisaniu prostego kodu" – stała się potężnym partnerem w analizie skomplikowanych wymagań biznesowych, identyfikacji ukrytych luk logicznych w specyfikacjach oraz automatycznym szacowaniu ryzyka funkcjonalności (Shift-Left Testing).

Jednak ślepe ufanie odpowiedziom generowanym przez sztuczną inteligencję to kardynalny błąd. W tej lekcji nauczysz się, jak z sukcesem i pełnym bezpieczeństwem wdrożyć metodologię **Human-in-the-Loop** oraz efektywnie projektować zapytania (**Prompt Engineering**) w codziennej pracy QA.

---

## 1. Techniki Prompt Engineeringu dla inżynierów jakości

Pisanie zapytań do modeli LLM w celu analizy wymagań wymaga precyzyjnej struktury (tzw. **Role-Based System Prompts**). Zamiast wpisywać ogólne "napisz mi przypadki testowe dla koszyka", zastosuj strukturę inżynieryjną:

### Szablon profesjonalnego zapytania (Prompt Template):
```text
Rola: Jesteś elitarnym architektem QA (SDET) z 10-letnim doświadczeniem w testowaniu e-commerce.
Zadanie: Przeanalizuj poniższe wymagania biznesowe i utwórz ustrukturyzowaną matrycę testową.
Kontekst: Aplikacja to mikroserwis koszyka zakupowego w technologii Node.js i Postgres.
Wytyczne: 
1. Zidentyfikuj 3 nieoczywiste luki logiczne w specyfikacji (edge cases).
2. Podziel przypadki na Smoke (P0) i regresyjne (P1/P2) na podstawie ryzyka biznesowego.
3. Wskaż, które testy powinny być zaimplementowane w warstwie API, a które w UI.

[TUTAJ WKLEJ TREŚĆ WYMAGAŃ / BILETU JIRA]
```

---

## 2. Metodologia "Human-in-the-Loop" (Człowiek w pętli decyzyjnej)

Modele sztucznej inteligencji są genialnymi generatorami pomysłów, ale **całkowicie pozbawionymi rzeczywistej odpowiedzialności inżynieryjnej**. 

Zasada **Human-in-the-Loop** zakłada, że:
1.  **AI generuje** bazę przypadków testowych, scenariuszy lub szkielet kodu testu Playwright.
2.  **Inżynier QA (Człowiek) audytuje** i autoryzuje wynik: sprawdza poprawność logiki, eliminuje "halucynacje" (nieistniejące selektory), dostosowuje kody asercji i dopiero wtedy zatwierdza kod do repozytorium.
3.  Bez krytycznego oka ludzkiego eksperta, bezmyślne wdrażanie kodu AI natychmiast doprowadzi do uszkodzenia stabilności testów i wygenerowania ogromnego długu technicznego.

---

## 3. Checklista Analizy Wymagań z AI
- [ ] Czy przed wysłaniem specyfikacji do modelu LLM upewniłeś się, że usunąłeś z tekstu wszelkie poufne dane firmy i klientów (GDPR/RODO Compliance)?
- [ ] Czy stosujesz precyzyjne, strukturalne zapytania (Prompt Engineering) określające rolę, zadanie i rygorystyczne kryteria wyjściowe?
- [ ] Czy każdy scenariusz wygenerowany przez sztuczną inteligencję poddajesz krytycznej ocenie i weryfikacji przed jego wdrożeniem?
- [ ] Czy dbasz o to, aby ostateczne decyzje architektoniczne i biznesowe były podejmowane wyłącznie przez ludzi (Human-in-the-Loop)?