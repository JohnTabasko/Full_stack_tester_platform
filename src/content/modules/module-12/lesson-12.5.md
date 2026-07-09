# Antywzorce i typowe błędy

> Moduł dwunasty zbiera zasady, które decydują o długowieczności automatyzacji. Dobre testy to nie tylko poprawne użycie Playwrighta, ale także czytelny projekt, spójne standardy, review, refaktoryzacja i unikanie antywzorców.

## Jak czytać ten moduł

Czytaj ten moduł jak poradnik utrzymania jakości kodu testowego. Każda decyzja, która dziś skraca pracę o pięć minut, może za pół roku kosztować wiele godzin, jeśli utrudni diagnostykę albo zmianę. Profesjonalny tester automatyzujący myśli nie tylko o tym, czy test przejdzie dzisiaj, ale czy będzie zrozumiały po zmianie produktu i zespołu.

Trzy zasady modułu:

1. **Test ma chronić ryzyko.** Nie automatyzuj dla samej liczby testów.
2. **Kod testowy wymaga standardów.** Bez standardów każdy autor buduje własny mini-framework.
3. **Antywzorce trzeba usuwać wcześnie.** Im dłużej istnieją, tym częściej są kopiowane.


## Cel lekcji

Ta lekcja koncentruje się na: **hardcoded waits, kruche selektory, zależność między testami, obiekty-bogi, logika testowa w POM i sposoby refaktoryzacji**. Główne ryzyko: **pakiet testów rośnie, ale każdy nowy test powiela złe praktyki, przez co koszt utrzymania rośnie szybciej niż wartość automatyzacji**. Po lekturze powinieneś umieć ocenić praktykę testową pod kątem wartości, utrzymywalności i kosztu długoterminowego.

## Sytuacja przewodnia

regresja ma setki testów, z których część pada losowo, część używa wspólnego konta, a część nie ma żadnych asercji skutku

## 1. Hardcoded waits

Stałe opóźnienia są najczęstszym objawem braku synchronizacji. Zamień je na oczekiwanie na stan mający znaczenie dla scenariusza.

## 2. Kruche selektory

Selektory zależne od DOM i klas CSS generowanych przez framework łamią się przy refaktoryzacji UI. Preferuj role, etykiety, tekst i test id.

## 3. Zależność między testami

Test, który wymaga poprzedniego testu, jest trudny do uruchamiania, debugowania i równoległości. Każdy test powinien przygotować własny stan.

## 4. Obiekty-bogi

Ogromne klasy page object lub helpery ukrywają chaos. Podziel je na strony, komponenty, klientów API i asercje domenowe.

## 5. Brak asercji skutku

Test bez asercji skutku jest skryptem, nie testem. Każda ważna akcja powinna prowadzić do widocznego lub mierzalnego dowodu.

## Przykład referencyjny

```typescript
// Antywzorzec
await page.locator('.btn').click();
await page.waitForTimeout(3000);

// Lepszy kierunek
await page.getByRole('button', { name: 'Zapisz' }).click();
await expect(page.getByRole('status')).toContainText('Zapisano');
```

Przykład pokazuje, że dobra praktyka nie jest ozdobą. Ma zmniejszać koszt zmiany, skracać diagnozę i zwiększać zaufanie do wyniku testów.

## Lista kontrolna

- Czy test chroni jasno nazwane ryzyko?
- Czy kod jest czytelny dla osoby spoza autora?
- Czy dane i zależności są jawne?
- Czy asercje potwierdzają skutek?
- Czy standard jest zapisany i egzekwowany w review?
- Czy widoczny antywzorzec został usunięty, a nie tylko obejściowo przykryty?


## Dobre praktyki i perspektywa inżynierska
Automatyzacja to proces ciągłego doskonalenia. Aby Twoje testy niosły realną wartość, stosuj się do poniższych zasad:
- **Testuj zachowanie, nie kod**: Skup się na tym, co widzi i robi użytkownik. Zmienne nazwy klas CSS nie powinny psuć Twoich testów.
- **Fail-fast**: Test powinien dawać jasny sygnał o błędzie tak szybko, jak to możliwe. Unikaj "wiszących" testów, które blokują kolejkę CI.
- **Ewoluuj**: Regularnie przeglądaj swoje testy. Usuwaj te, które są niestabilne i nie dają wartości, a refaktoryzuj te, które stają się zbyt skomplikowane.
