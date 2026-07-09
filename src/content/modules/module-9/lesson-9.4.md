# Stabilność i niezawodność testów

> Moduł dziewiąty uczy traktować awarię testu jak informację diagnostyczną, a nie przeszkodę do szybkiego obejścia. Debugowanie, stabilność i monitoring decydują o zaufaniu zespołu do automatyzacji.

## Jak czytać ten moduł

Czytaj ten moduł jak podręcznik pracy z niepewnością. Test może zawieść z powodu produktu, danych, środowiska, konfiguracji, synchronizacji, integracji zewnętrznej albo błędu w samym teście. Dojrzałość polega na szybkim rozróżnianiu tych klas problemów.

Trzy zasady modułu:

1. **Nie naprawiaj objawu bez diagnozy.** Dłuższy timeout rzadko jest prawdziwym rozwiązaniem.
2. **Artefakty są częścią testu.** Trace, screenshot, logi i odpowiedzi API muszą być dostępne wtedy, gdy test zawiedzie.
3. **Flaky test to defekt procesu.** Nie wolno go ignorować tylko dlatego, że czasem przechodzi.


## Cel lekcji

Ta lekcja koncentruje się na: **testy deterministyczne, niezależność, warunki wyścigu, strategia retry, wykrywanie flakiness, mockowanie i izolacja workerów**. Główne ryzyko: **pakiet testów daje zmienne wyniki, więc zespół przestaje ufać automatyzacji i ignoruje czerwone przebiegi**. Po lekturze powinieneś umieć postawić hipotezę diagnostyczną, zebrać dowody i zaproponować naprawę przyczyny, nie tylko objawu.

## Sytuacja przewodnia

po włączeniu równoległości testy koszyka zaczynają losowo padać, bo używają tego samego użytkownika i tych samych produktów

## 1. Deterministyczność

Test deterministyczny daje ten sam wynik dla tego samego kodu i kontrolowanego stanu. Jeśli wynik zależy od kolejności, czasu albo resztek danych, test nie jest deterministyczny.

## 2. Niezależność

Test powinien móc działać sam, w pakiecie i równolegle. Zależność od poprzedniego testu to jeden z najdroższych antywzorców.

## 3. Warunki wyścigu

Race condition pojawia się, gdy wynik zależy od kolejności zdarzeń. W testach często dotyczy danych, procesów backendowych i równoległości.

## 4. Strategia retry

Retry jest narzędziem obserwacji i ograniczania szumu, nie naprawą. Test przechodzący po ponowieniu nadal wymaga analizy.

## 5. Mockowanie i izolacja

Mock może stabilizować zależność, ale nie może zastąpić wszystkich testów integracyjnych. Izolacja workerów wymaga unikalnych danych i braku globalnego stanu.

## Przykład referencyjny

```typescript
function uniqueRunEmail(testTitle: string) {
  const safeTitle = testTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `qa+${safeTitle}-${crypto.randomUUID()}@example.test`;
}

test('koszyk jest izolowany dla użytkownika', async ({ page }, testInfo) => {
  const email = uniqueRunEmail(testInfo.title);
  // utwórz użytkownika przez API, zaloguj i sprawdź koszyk tylko dla tego użytkownika
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
