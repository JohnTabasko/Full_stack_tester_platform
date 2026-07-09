# Typowe problemy i rozwiązania

> Moduł dziewiąty uczy traktować awarię testu jak informację diagnostyczną, a nie przeszkodę do szybkiego obejścia. Debugowanie, stabilność i monitoring decydują o zaufaniu zespołu do automatyzacji.

## Jak czytać ten moduł

Czytaj ten moduł jak podręcznik pracy z niepewnością. Test może zawieść z powodu produktu, danych, środowiska, konfiguracji, synchronizacji, integracji zewnętrznej albo błędu w samym teście. Dojrzałość polega na szybkim rozróżnianiu tych klas problemów.

Trzy zasady modułu:

1. **Nie naprawiaj objawu bez diagnozy.** Dłuższy timeout rzadko jest prawdziwym rozwiązaniem.
2. **Artefakty są częścią testu.** Trace, screenshot, logi i odpowiedzi API muszą być dostępne wtedy, gdy test zawiedzie.
3. **Flaky test to defekt procesu.** Nie wolno go ignorować tylko dlatego, że czasem przechodzi.


## Cel lekcji

Ta lekcja koncentruje się na: **timeouty, element not found, flaky tests, strict mode, uwierzytelnianie, różnice CI kontra lokalnie i systematyczny triage**. Główne ryzyko: **zespół naprawia objawy, wydłuża timeouty i oznacza testy jako flaky bez ustalenia klasy problemu**. Po lekturze powinieneś umieć postawić hipotezę diagnostyczną, zebrać dowody i zaproponować naprawę przyczyny, nie tylko objawu.

## Sytuacja przewodnia

test wyszukiwania czasem nie znajduje wyników, czasem znajduje dwa podobne elementy, a czasem kończy się błędem autoryzacji

## 1. Timeout

Timeout jest objawem, nie diagnozą. Może oznaczać zły lokator, brak danych, wolny backend, błąd frontendu, zasłonięty element albo niewłaściwe oczekiwanie.

## 2. Element not found

Brak elementu może wynikać z błędnego lokatora, złego stanu danych, innej roli użytkownika albo jeszcze niezakończonego renderowania.

## 3. Strict mode

Strict mode zgłasza niejednoznaczny lokator. To zabezpieczenie. Zamiast wyłączać problem, zawęź kontekst lokatora.

## 4. Flaky tests

Flaky test to test o zmiennym wyniku dla tego samego kodu. Przyczyny trzeba klasyfikować: dane, synchronizacja, środowisko, produkt, test.

## 5. CI kontra lokalnie

Różnice między CI i lokalnym środowiskiem obejmują zasoby, system, sieć, zmienne, sekrety, przeglądarki i równoległość.

## Przykład referencyjny

```typescript
await test.step('Diagnoza wyników wyszukiwania', async () => {
  const results = page.getByRole('listitem').filter({ hasText: 'Playwright' });
  await expect(results, 'lista wyników powinna zawierać dokładnie jeden wpis Playwright').toHaveCount(1);
  await results.first().getByRole('link', { name: /szczegóły/i }).click();
});
```

Przykład pokazuje, że diagnostyka powinna być projektowana przed awarią. Po awarii jest za późno na zgadywanie, jakie dane byłyby przydatne.

## Lista kontrolna

- Czy awaria zostawia trace lub inny artefakt diagnostyczny?
- Czy test ma czytelne kroki?
- Czy dane testowe są możliwe do odtworzenia?
- Czy problem można sklasyfikować: produkt, dane, test, środowisko, integracja?
- Czy retry nie ukrywa przyczyny?
- Czy alert lub raport prowadzi do właściciela problemu?


## Dobre praktyki i perspektywa inżynierska
Automatyzacja to proces ciągłego doskonalenia. Aby Twoje testy niosły realną wartość, stosuj się do poniższych zasad:
- **Testuj zachowanie, nie kod**: Skup się na tym, co widzi i robi użytkownik. Zmienne nazwy klas CSS nie powinny psuć Twoich testów.
- **Fail-fast**: Test powinien dawać jasny sygnał o błędzie tak szybko, jak to możliwe. Unikaj "wiszących" testów, które blokują kolejkę CI.
- **Ewoluuj**: Regularnie przeglądaj swoje testy. Usuwaj te, które są niestabilne i nie dają wartości, a refaktoryzuj te, które stają się zbyt skomplikowane.
