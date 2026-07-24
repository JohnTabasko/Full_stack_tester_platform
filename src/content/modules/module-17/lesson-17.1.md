# Strategia jakości i zarządzanie ryzykiem — perspektywa Full Stack Testera

W tradycyjnym ujęciu roli testera (Manual QA), jakość oprogramowania była weryfikowana na samym końcu cyklu wytwórczego – po złączeniu kodu i wdrożeniu na środowisko testowe. Taki model wywołuje poważne konsekwencje biznesowe: błędy wykryte późno są niezwykle kosztowne w naprawie i paraliżują proces wydań produkcyjnych.

Nowoczesna inżynieria jakości (Quality Engineering) redefiniuje rolę testera, przekształcając go w **Full Stack Testera / SDET (Software Development Engineer in Test)**. Praca ta opiera się na **zarządzaniu ryzykiem biznesowym**, przesuwaniu testowania w lewo (**Shift-Left Quality**) oraz budowaniu automatycznych rurociągów weryfikacji w celu ciągłego kontrolowania jakości.

---

## 1. Shift-Left Quality: Przesuwanie testowania w lewo

Koncepcja **Shift-Left** zakłada, że testowanie nie jest osobnym etapem następującym po dewelomencie. Testowanie to proces, który rozpoczyna się już w momencie analizowania wymagań biznesowych i projektowania architektury systemu.

```
       Tradycyjny model (Kaskadowy / Waterfalls):
       Wymagania -> Deweloment -> [ TESTOWANIE ] -> Wydanie
                                       |
                                       v (Wykrycie błędów późne i kosztowne)

       Nowoczesny model (Shift-Left / Agile / DevSecOps):
       [ Testowanie wymagań ] -> [ TDD / Unit Tests ] -> [ API Tests ] -> [ E2E ]
```

### Praktyczne działania Shift-Left dla Full Stack Testera:
1.  **Audyt wymagań (Static Testing)**: Wykrywanie sprzeczności, braków logicznych i luk bezpieczeństwa w specyfikacji (biletach Jira) przed napisaniem choćby jednej linii kodu.
2.  **Definition of Done (DoD)**: Wymuszenie rygorystycznych standardów jakości dla każdego zadania programistycznego (np. kod przechodzi testy jednostkowe z pokryciem >80%, przygotowano testy API, automatyzacja E2E została zaktualizowana).
3.  **Wspólna sesja projektowania**: Współpraca z programistami (Three Amigos) przed rozpoczęciem pracy w celu uzgodnienia struktury API, selektorów `data-testid` oraz matrycy pokrycia testowego.

---

## 2. Zarządzanie ryzykiem i priorytetyzacja testów

Jako inżynier jakości nie dążysz do pokrycia 100% kodu testami E2E (co byłoby powolne, kosztowne i niemożliwe do utrzymania). Twoim zadaniem jest **zarządzanie ryzykiem biznesowym**:

$$Ryzyko = Prawdopodobieństwo \\times Wpływ$$

*   **Prawdopodobieństwo**: Jak skomplikowany technicznie jest dany moduł? Czy korzysta z nowych technologii? Jak często ulega zmianom?
*   **Wpływ biznesowy**: Co się stanie, jeśli funkcja padnie na produkcji? Czy klienci stracą pieniądze? Czy ucierpi wizerunek firmy?

Na podstawie tej analizy kategoryzujesz testy, budując optymalną piramidę pokrycia i oddzielając szybkie testy dymne (Smoke Tests) od nocnych testów regresyjnych.

---

## 3. Decyzja o nieautomatyzowaniu (When NOT to automate)

Niewłaściwa decyzja o automatyzacji testu to marnotrawstwo budżetu firmy. Nie automatyzuj scenariuszy:
1.  **Jednorazowych**: Funkcji, które zostaną wycofane z aplikacji po zakończeniu kampanii marketingowej (np. świąteczny baner).
2.  **Często zmieniających się (Dynamic UI)**: Kiedy dany interfejs przechodzi głęboki redesign – utrzymywanie testów wywoła zbyt wysoki koszt (Maintenance Trap).
3.  **Wymagających ludzkiej intuicji i estetyki**: Np. czy dobór kolorów wywołuje miłe odczucia (tu lepiej sprawdzi się rzetelny test eksploracyjny).

---

## 4. Checklista Strategii Jakości
- [ ] Czy bierzesz aktywny udział w analizie wymagań biznesowych (Shift-Left) przed rozpoczęciem kodowania?
- [ ] Czy Twoje Definition of Done (DoD) wymusza rygorystyczne kryteria jakości dla deweloperów?
- [ ] Czy priorytetyzujesz scenariusze testowe w oparciu o rzetelne szacowanie ryzyka biznesowego?
- [ ] Czy potrafisz uzasadnić i obronić decyzję o nieautomatyzowaniu określonego testu w zespole?