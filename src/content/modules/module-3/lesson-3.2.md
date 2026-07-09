# Asercje ogólne

> Moduł trzeci przenosi uwagę z wykonywania kroków na dowodzenie, że system osiągnął oczekiwany stan. Akcja bez asercji jest tylko ruchem. Asercja bez zrozumienia ryzyka może być formalnością. Dobra asercja jest dowodem.

## Jak czytać ten moduł

Czytając lekcje o asercjach, stale zadawaj pytanie: co dokładnie chcę udowodnić? Nie pytaj najpierw, jakiego matchera użyć. Najpierw określ stan oczekiwany. Dopiero potem wybierz `toBeVisible`, `toHaveText`, `toEqual`, `toBeOK`, helper domenowy albo własny matcher.

W module trzecim obowiązują trzy zasady:

1. **Asercja musi być znacząca.** Powinna potwierdzać zachowanie, kontrakt albo stan ważny dla użytkownika lub systemu.
2. **Asercja musi być stabilna.** Nie powinna wiązać testu z przypadkowymi szczegółami implementacji.
3. **Asercja musi pomagać w diagnozie.** Gdy zawiedzie, komunikat błędu powinien przybliżać do przyczyny.


## Cel lekcji

Ta lekcja koncentruje się na: **matchery expect dla danych: toBe, toEqual, toStrictEqual, toMatch, toContain, toThrow, obiekty częściowe, tablice i wyjątki**. Najważniejsze ryzyko: **test porównuje dane zbyt płytko, zbyt dokładnie albo w sposób niezgodny z intencją, przez co daje fałszywe wyniki**. Po lekturze powinieneś umieć dobrać asercję do intencji testu, a nie odwrotnie.

## Sytuacja przewodnia

test API pobiera obiekt zamówienia i musi sprawdzić kluczowe pola bez wiązania się z każdym technicznym szczegółem odpowiedzi

## 1. Tożsamość i równość

`toBe` sprawdza tożsamość lub wartość prymitywną. `toEqual` porównuje strukturę obiektu. `toStrictEqual` jest bardziej rygorystyczne i rozróżnia m.in. brak pola od pola z wartością `undefined`. Wybór matchera powinien wynikać z kontraktu danych.

## 2. Obiekty częściowe

`expect.objectContaining` pozwala sprawdzić pola istotne dla testu bez wiązania się z całą odpowiedzią. To dobre, gdy API zwraca dodatkowe pola techniczne, których test nie powinien stabilizować.

## 3. Tablice

Dla tablic rozróżniaj kolejność i zawartość. `toEqual` wymaga konkretnej kolejności, `arrayContaining` sprawdza obecność elementów. Przy wynikach sortowania kolejność jest kontraktem; przy liście tagów może nie być.

## 4. Wyrażenia regularne

`toMatch` pomaga przy identyfikatorach, datach i tekstach częściowo dynamicznych. Nie używaj jednak zbyt szerokich regexów, które przepuszczą błędny format.

## 5. Wyjątki

`toThrow` jest dobre dla kodu synchronicznego. Dla obietnic używaj `await expect(promise).rejects...`. Mylenie tych modeli prowadzi do testów, które nie sprawdzają błędów.

## Przykład referencyjny

```typescript
const order = await response.json();

expect(order).toEqual(expect.objectContaining({
  id: expect.any(String),
  status: 'PAID',
  total: expect.any(Number),
}));

expect(order.items).toEqual(
  expect.arrayContaining([
    expect.objectContaining({ sku: 'BOOK-1', quantity: 1 }),
  ])
);
```

Przykład pokazuje zasadę: asercja nie jest ozdobą na końcu testu. Jest miejscem, w którym test udowadnia, że system zachował się zgodnie z oczekiwaniem.

## Lista kontrolna

- Czy asercja potwierdza zachowanie, a nie szczegół implementacji?
- Czy awaria asercji da czytelny komunikat?
- Czy asercja nie jest ani zbyt ogólna, ani zbyt szczegółowa?
- Czy dane dynamiczne są ustabilizowane lub sprawdzane częściowo?
- Czy scenariusz negatywny sprawdza właściwy błąd?
- Czy helper nie ukrywa sensu testu?


Asercję projektuj od oczekiwanego stanu. Dla tematu „Asercje ogólne” kluczowe jest: matchery expect dla danych: toBe, toEqual, toStrictEqual, toMatch, toContain, toThrow, obiekty częściowe, tablice i wyjątki. Zacznij od zdania: „test przejdzie, jeśli...”. Jeżeli nie umiesz dokończyć tego zdania językiem produktu albo kontraktu, prawdopodobnie nie wiesz jeszcze, co sprawdzasz.

Asercja jest umową między testem a oczekiwanym zachowaniem systemu. Jeżeli umowa jest nieprecyzyjna, test nie daje zaufania. Jeżeli jest zbyt szczegółowa, będzie pękał przy refaktoryzacji. Dojrzałość polega na znalezieniu właściwej granicy.


Najgroźniejszy problem to test zielony mimo błędu produktu. Dzieje się tak, gdy sprawdzasz zbyt mało: sam status 200, samo istnienie elementu, samo kliknięcie albo dowolny tekst. Ryzyko tej lekcji to test porównuje dane zbyt płytko, zbyt dokładnie albo w sposób niezgodny z intencją, przez co daje fałszywe wyniki, dlatego asercja musi być dobrana do realnego skutku.

Asercja jest umową między testem a oczekiwanym zachowaniem systemu. Jeżeli umowa jest nieprecyzyjna, test nie daje zaufania. Jeżeli jest zbyt szczegółowa, będzie pękał przy refaktoryzacji. Dojrzałość polega na znalezieniu właściwej granicy.


Test czerwony mimo poprawnego produktu zwykle oznacza zbyt kruchą asercję. Przykładem jest pełne porównanie obiektu zawierającego daty, identyfikatory techniczne albo pola nieistotne dla scenariusza. Rozwiązaniem bywa asercja częściowa, stabilizacja danych albo przeniesienie sprawdzenia na właściwy poziom.

Asercja jest umową między testem a oczekiwanym zachowaniem systemu. Jeżeli umowa jest nieprecyzyjna, test nie daje zaufania. Jeżeli jest zbyt szczegółowa, będzie pękał przy refaktoryzacji. Dojrzałość polega na znalezieniu właściwej granicy.


W CI komunikat asercji jest często pierwszą i najważniejszą informacją o awarii. Dlatego warto preferować asercje, które pokazują oczekiwany i otrzymany stan. Dodatkowo używaj trace, logów, odpowiedzi API i identyfikatorów korelacji, gdy sama asercja nie wystarczy.

Asercja jest umową między testem a oczekiwanym zachowaniem systemu. Jeżeli umowa jest nieprecyzyjna, test nie daje zaufania. Jeżeli jest zbyt szczegółowa, będzie pękał przy refaktoryzacji. Dojrzałość polega na znalezieniu właściwej granicy.


Dla przypadku: test API pobiera obiekt zamówienia i musi sprawdzić kluczowe pola bez wiązania się z każdym technicznym szczegółem odpowiedzi zaprojektuj także ścieżkę błędu. Dobre testy nie sprawdzają wyłącznie sukcesu. Sprawdzają brak uprawnień, błędne dane, brak zasobu, konflikt, pustą listę albo niedostępność zależności.

Asercja jest umową między testem a oczekiwanym zachowaniem systemu. Jeżeli umowa jest nieprecyzyjna, test nie daje zaufania. Jeżeli jest zbyt szczegółowa, będzie pękał przy refaktoryzacji. Dojrzałość polega na znalezieniu właściwej granicy.


Podczas review zapytaj: czy ta asercja padnie z właściwego powodu? Czy jest odporna na nieistotne zmiany? Czy wskazuje przyczynę? Czy nie powiela asercji z niższego poziomu? Czy nazwa testu i asercja mówią o tym samym zachowaniu?

Asercja jest umową między testem a oczekiwanym zachowaniem systemu. Jeżeli umowa jest nieprecyzyjna, test nie daje zaufania. Jeżeli jest zbyt szczegółowa, będzie pękał przy refaktoryzacji. Dojrzałość polega na znalezieniu właściwej granicy.


Im większy projekt, tym ważniejsza jest spójność stylu asercji. Jeśli jeden autor sprawdza status przez `toBe(200)`, drugi przez `toBeOK`, trzeci ignoruje body, a czwarty porównuje całe obiekty, raporty będą niespójne. Standard zespołowy powinien określać preferowany sposób sprawdzania typowych sytuacji.

Asercja jest umową między testem a oczekiwanym zachowaniem systemu. Jeżeli umowa jest nieprecyzyjna, test nie daje zaufania. Jeżeli jest zbyt szczegółowa, będzie pękał przy refaktoryzacji. Dojrzałość polega na znalezieniu właściwej granicy.


Weź istniejący test związany z tematem „Asercje ogólne”. Zidentyfikuj jedną asercję zbyt słabą i jedną zbyt kruchą. Przepisz je tak, aby lepiej odpowiadały intencji scenariusza. Następnie celowo zepsuj aplikację lub dane i sprawdź, czy komunikat błędu jest zrozumiały.

Asercja jest umową między testem a oczekiwanym zachowaniem systemu. Jeżeli umowa jest nieprecyzyjna, test nie daje zaufania. Jeżeli jest zbyt szczegółowa, będzie pękał przy refaktoryzacji. Dojrzałość polega na znalezieniu właściwej granicy.

