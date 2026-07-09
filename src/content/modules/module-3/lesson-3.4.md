# Własne asercje i funkcje pomocnicze

> Moduł trzeci przenosi uwagę z wykonywania kroków na dowodzenie, że system osiągnął oczekiwany stan. Akcja bez asercji jest tylko ruchem. Asercja bez zrozumienia ryzyka może być formalnością. Dobra asercja jest dowodem.

## Jak czytać ten moduł

Czytając lekcje o asercjach, stale zadawaj pytanie: co dokładnie chcę udowodnić? Nie pytaj najpierw, jakiego matchera użyć. Najpierw określ stan oczekiwany. Dopiero potem wybierz `toBeVisible`, `toHaveText`, `toEqual`, `toBeOK`, helper domenowy albo własny matcher.

W module trzecim obowiązują trzy zasady:

1. **Asercja musi być znacząca.** Powinna potwierdzać zachowanie, kontrakt albo stan ważny dla użytkownika lub systemu.
2. **Asercja musi być stabilna.** Nie powinna wiązać testu z przypadkowymi szczegółami implementacji.
3. **Asercja musi pomagać w diagnozie.** Gdy zawiedzie, komunikat błędu powinien przybliżać do przyczyny.


## Cel lekcji

Ta lekcja koncentruje się na: **asercje domenowe, helpery, własne matchery, organizacja kodu pomocniczego i granica między czytelnością a ukrywaniem sensu testu**. Najważniejsze ryzyko: **helper skraca test, ale ukrywa zbyt wiele akcji, danych i asercji, przez co awaria staje się trudna do diagnozy**. Po lekturze powinieneś umieć dobrać asercję do intencji testu, a nie odwrotnie.

## Sytuacja przewodnia

w wielu testach trzeba sprawdzać, czy zamówienie jest opłacone w UI, API i danych zwracanych przez backend

## 1. Po co tworzyć helper

Helper ma usuwać powtórzenie i nazywać wiedzę domenową. Nie powinien ukrywać losowych kliknięć ani zamieniać testu w czarną skrzynkę.

## 2. Asercja domenowa

Asercja domenowa mówi językiem produktu: zamówienie jest opłacone, użytkownik jest zablokowany, faktura jest wystawiona. To lepsze niż helper `checkText`.

## 3. Granice abstrakcji

Jeżeli helper wykonuje przygotowanie danych, akcje UI i kilka asercji, może być zbyt szeroki. Im więcej ukrywa, tym trudniej zrozumieć awarię.

## 4. Własne matchery

Własny matcher ma sens, gdy ta sama semantyczna asercja powtarza się często i potrzebuje dobrego komunikatu błędu. Nie twórz matcherów tylko po to, aby opakować każdą metodę `expect`.

## 5. Organizacja kodu pomocniczego

Kod pomocniczy powinien być podzielony według odpowiedzialności: asercje, budowniczowie danych, klienci API, page objects, utils. Folder `helpers` bez reguł szybko staje się śmietnikiem.

## Przykład referencyjny

```typescript
export async function expectOrderSummaryToShowPaidStatus(page: Page, orderId: string) {
  const summary = page.getByTestId(`order-summary-${orderId}`);
  await expect(summary.getByText('Status: opłacone')).toBeVisible();
  await expect(summary.getByRole('button', { name: 'Pobierz fakturę' })).toBeEnabled();
}
```

Przykład pokazuje zasadę: asercja nie jest ozdobą na końcu testu. Jest miejscem, w którym test udowadnia, że system zachował się zgodnie z oczekiwaniem.

## Lista kontrolna

- Czy asercja potwierdza zachowanie, a nie szczegół implementacji?
- Czy awaria asercji da czytelny komunikat?
- Czy asercja nie jest ani zbyt ogólna, ani zbyt szczegółowa?
- Czy dane dynamiczne są ustabilizowane lub sprawdzane częściowo?
- Czy scenariusz negatywny sprawdza właściwy błąd?
- Czy helper nie ukrywa sensu testu?


Asercję projektuj od oczekiwanego stanu. Dla tematu „Własne asercje i funkcje pomocnicze” kluczowe jest: asercje domenowe, helpery, własne matchery, organizacja kodu pomocniczego i granica między czytelnością a ukrywaniem sensu testu. Zacznij od zdania: „test przejdzie, jeśli...”. Jeżeli nie umiesz dokończyć tego zdania językiem produktu albo kontraktu, prawdopodobnie nie wiesz jeszcze, co sprawdzasz.

Asercja jest umową między testem a oczekiwanym zachowaniem systemu. Jeżeli umowa jest nieprecyzyjna, test nie daje zaufania. Jeżeli jest zbyt szczegółowa, będzie pękał przy refaktoryzacji. Dojrzałość polega na znalezieniu właściwej granicy.


Najgroźniejszy problem to test zielony mimo błędu produktu. Dzieje się tak, gdy sprawdzasz zbyt mało: sam status 200, samo istnienie elementu, samo kliknięcie albo dowolny tekst. Ryzyko tej lekcji to helper skraca test, ale ukrywa zbyt wiele akcji, danych i asercji, przez co awaria staje się trudna do diagnozy, dlatego asercja musi być dobrana do realnego skutku.

Asercja jest umową między testem a oczekiwanym zachowaniem systemu. Jeżeli umowa jest nieprecyzyjna, test nie daje zaufania. Jeżeli jest zbyt szczegółowa, będzie pękał przy refaktoryzacji. Dojrzałość polega na znalezieniu właściwej granicy.


Test czerwony mimo poprawnego produktu zwykle oznacza zbyt kruchą asercję. Przykładem jest pełne porównanie obiektu zawierającego daty, identyfikatory techniczne albo pola nieistotne dla scenariusza. Rozwiązaniem bywa asercja częściowa, stabilizacja danych albo przeniesienie sprawdzenia na właściwy poziom.

Asercja jest umową między testem a oczekiwanym zachowaniem systemu. Jeżeli umowa jest nieprecyzyjna, test nie daje zaufania. Jeżeli jest zbyt szczegółowa, będzie pękał przy refaktoryzacji. Dojrzałość polega na znalezieniu właściwej granicy.


W CI komunikat asercji jest często pierwszą i najważniejszą informacją o awarii. Dlatego warto preferować asercje, które pokazują oczekiwany i otrzymany stan. Dodatkowo używaj trace, logów, odpowiedzi API i identyfikatorów korelacji, gdy sama asercja nie wystarczy.

Asercja jest umową między testem a oczekiwanym zachowaniem systemu. Jeżeli umowa jest nieprecyzyjna, test nie daje zaufania. Jeżeli jest zbyt szczegółowa, będzie pękał przy refaktoryzacji. Dojrzałość polega na znalezieniu właściwej granicy.


Dla przypadku: w wielu testach trzeba sprawdzać, czy zamówienie jest opłacone w UI, API i danych zwracanych przez backend zaprojektuj także ścieżkę błędu. Dobre testy nie sprawdzają wyłącznie sukcesu. Sprawdzają brak uprawnień, błędne dane, brak zasobu, konflikt, pustą listę albo niedostępność zależności.

Asercja jest umową między testem a oczekiwanym zachowaniem systemu. Jeżeli umowa jest nieprecyzyjna, test nie daje zaufania. Jeżeli jest zbyt szczegółowa, będzie pękał przy refaktoryzacji. Dojrzałość polega na znalezieniu właściwej granicy.


Podczas review zapytaj: czy ta asercja padnie z właściwego powodu? Czy jest odporna na nieistotne zmiany? Czy wskazuje przyczynę? Czy nie powiela asercji z niższego poziomu? Czy nazwa testu i asercja mówią o tym samym zachowaniu?

Asercja jest umową między testem a oczekiwanym zachowaniem systemu. Jeżeli umowa jest nieprecyzyjna, test nie daje zaufania. Jeżeli jest zbyt szczegółowa, będzie pękał przy refaktoryzacji. Dojrzałość polega na znalezieniu właściwej granicy.


Im większy projekt, tym ważniejsza jest spójność stylu asercji. Jeśli jeden autor sprawdza status przez `toBe(200)`, drugi przez `toBeOK`, trzeci ignoruje body, a czwarty porównuje całe obiekty, raporty będą niespójne. Standard zespołowy powinien określać preferowany sposób sprawdzania typowych sytuacji.

Asercja jest umową między testem a oczekiwanym zachowaniem systemu. Jeżeli umowa jest nieprecyzyjna, test nie daje zaufania. Jeżeli jest zbyt szczegółowa, będzie pękał przy refaktoryzacji. Dojrzałość polega na znalezieniu właściwej granicy.


Weź istniejący test związany z tematem „Własne asercje i funkcje pomocnicze”. Zidentyfikuj jedną asercję zbyt słabą i jedną zbyt kruchą. Przepisz je tak, aby lepiej odpowiadały intencji scenariusza. Następnie celowo zepsuj aplikację lub dane i sprawdź, czy komunikat błędu jest zrozumiały.

Asercja jest umową między testem a oczekiwanym zachowaniem systemu. Jeżeli umowa jest nieprecyzyjna, test nie daje zaufania. Jeżeli jest zbyt szczegółowa, będzie pękał przy refaktoryzacji. Dojrzałość polega na znalezieniu właściwej granicy.

