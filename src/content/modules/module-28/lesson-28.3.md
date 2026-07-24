# Zadania rekrutacyjne i techniczny proces Live Coding dla SDET

Przejście przez techniczny proces rekrutacyjny na stanowisko **Full Stack Testera / SDET (Software Development Engineer in Test)** różni się diametralnie od rekrutacji na manualnego QA. Oprócz wiedzy teoretycznej z zakresu metodologii testowania (ISTQB), liderzy techniczni rygorystycznie weryfikują Twoje umiejętności czystego kodowania, algorytmiki, znajomości architektury przeglądarek oraz zdolności projektowania systemów automatyzacji w locie (**Live Coding / Pair Programming**).

W tej lekcji przeanalizujemy najpopularniejsze pytania techniczne, zadania na żywo oraz strategie zaprezentowania swojej wiedzy inżynieryjnej w sposób bezkompromisowy.

---

## 1. Jak wygląda proces Live Coding / Pair Programming?

Podczas sesji Live Coding (najczęściej trwającej 45-60 minut na platformach typu CoderPad):
1.  **Dostajesz problem biznesowy**: Np. "napisz od zera test dla koszyka zakupowego na dostarczonej stronie, implementując wzorzec POM i dbając o stabilność".
2.  **Twoim zadaniem jest kodowanie z głośnym myślaniem (Think Aloud)**: Rekruterzy nie oceniają wyłącznie tego, czy Twój kod przejdzie na zielono. Badają Twój proces myślowy: jak podchodzisz do problemu, jak analizujesz błędy składniowe, jak reagujesz na niespodziewane trudności i czy potrafisz uzasadnić swoje decyzje architektoniczne.

### Złota zasada Live Coding:
*   **Mów na głos**: Tłumacz każdą linijkę, którą piszesz (np. "teraz zadeklaruję lokator jako prywatne pole klasy POM, ponieważ chcę ukryć szczegóły techniczne przed testem zgodnie z zasadą enkapsulacji").
*   **Zacznij od prostego rozwiązania**: Nie buduj skomplikowanych fabryk na starcie. Napisz prosty, działający test (Act-Assert), a dopiero potem przeprowadź elegancki refaktoring do odpowiednich wzorców (WET -> DRY).

---

## 2. Najpopularniejsze pytania techniczne (Technical QA)

Bądź przygotowany na rzetelne i głębokie odpowiedzi na poniższe pytania inżynieryjne:

### Pytanie 1: "Jak Playwright zapobiega flakiness?"
*   *Odpowiedź*: Playwright opiera się na stałym, dwukierunkowym połączeniu sieciowym przez WebSockets i protokół CDP. Dzięki temu posiada natywny auto-waiting (sprawdza gotowość elementu przed interakcją) oraz asynchroniczne asercje Web-First (auto-polling w tle), eliminując potrzebę stałych sleepów.

### Pytanie 2: "Czym różni się .toBe() od .toEqual() w TypeScript?"
*   *Odpowiedź*: `.toBe()` sprawdza ścisłą tożsamość referencyjną (`===`). Służy do porównywania wartości prymitywnych. `.toEqual()` rekurencyjnie porównuje strukturę i wartości pól obiektów oraz tablic, ignorując ich miejsce w pamięci.

### Pytanie 3: "W jaki sposób bezpiecznie wdrożyć testy regresji wizualnej w zespole?"
*   *Odpowiedź*: Testy wizualne muszą być uruchamiane w kontenerach Docker, aby wyeliminować różnice w renderowaniu czcionek między systemami deweloperów a maszynami CI. Ponadto należy maskować sekcje dynamiczne (`mask`) i odpowiednio dobrać próg tolerancji pikseli (`maxDiffPixelRatio`).

---

## 3. Dokumentowanie Decyzji Architektonicznych (ADR)

Wybitny SDET potrafi pisać i dokumentować swoje decyzje projektowe za pomocą **ADR (Architecture Decision Record)**. To prosty dokument Markdown opisujący powody, kontekst i konsekwencje wyboru danej technologii czy wzorca:

```markdown
# ADR 1: Wybór Playwright Component Testing (CT) zamiast JSDOM

## Status
Zatwierdzony

## Kontekst
Nasza biblioteka komponentów React korzysta z zaawansowanych animacji CSS i cieni. Tradycyjne testy w JSDOM (React Testing Library) nie potrafią wyrenderować stylów i wykryć przesunięć layoutu (CLS).

## Decyzja
Wdrażamy Playwright Component Testing (CT) jako standard testowania komponentów.

## Konsekwencje
+ Pełna zgodność z rzeczywistym renderowaniem we wszystkich przeglądarkach (Chromium, WebKit, Firefox).
- Nieznacznie dłuższy czas startu serwera testowego w porównaniu do surowego JSDOM.
```

---

## 4. Checklista Przygotowania Rekrutacyjnego
- [ ] Czy potrafisz płynnie i bezbłędnie zakodować od zera klasę POM i test Playwright w 30 minut?
- [ ] Czy podczas kodowania głośno i logicznie tłumaczysz swoje decyzje techniczne (metodologia Think Aloud)?
- [ ] Czy potrafisz rzetelnie wyjaśnić różnice między architekturami testów (Selenium vs Playwright, JSDOM vs Playwright CT)?
- [ ] Czy umiesz pisać i bronić dokumentów decyzji architektonicznych (ADR)?