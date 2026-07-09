# Najechanie, fokus oraz przeciąganie i upuszczanie

"> Moduł drugi jest praktycznym rdzeniem Playwrighta. Uczy, jak sterować przeglądarką bez tworzenia kruchych skryptów. Celem nie jest zapamiętanie nazw metod, lecz zrozumienie relacji między użytkownikiem, stroną, lokatorem, akcją, oczekiwaniem i asercją skutku.

## Jak czytać ten moduł

Każdą lekcję czytaj w trzech warstwach. Najpierw zrozum model: co reprezentuje dana abstrakcja Playwrighta i jakie ograniczenia ma przeglądarka. Następnie przeanalizuj kod: gdzie jest stan początkowy, jaka akcja wywołuje zachowanie i jaka asercja potwierdza rezultat. Na końcu oceń utrzymywalność: czy ten sam test będzie czytelny po zmianie layoutu, danych lub środowiska CI.

W module drugim szczególnie ważne są trzy zasady:

1. **Lokator opisuje intencję użytkownika.** Jeśli test wybiera element przez przypadkową klasę CSS, jest związany z implementacją, a nie zachowaniem.
2. **Akcja musi mieć skutek.** Kliknięcie, wpisanie tekstu lub przeciągnięcie elementu nie jest wartością samo w sobie. Wartością jest stan, który po akcji można zaobserwować.
3. **Czekamy na znaczący stan.** Stałe opóźnienie jest najczęściej objawem braku wiedzy o systemie. Stabilny test czeka na tekst, URL, odpowiedź API, status elementu, rekord albo zdarzenie.


## Cel lekcji

Ta lekcja koncentruje się na: **hover, focus, tooltipy, menu, drag and drop, touch events, obsługa klawiatury i dostępność interakcji złożonych**. Najważniejsze ryzyko, które ograniczamy, to: **test sprawdza tylko obsługę myszy, mimo że użytkownik korzystający z klawiatury lub dotyku napotka błąd**. Po lekturze powinieneś umieć dobrać właściwe API Playwrighta, zaprojektować asercję skutku i wyjaśnić, dlaczego dane rozwiązanie będzie stabilne w CI.

## Sytuacja przewodnia

Wyobraź sobie następujący przypadek: aplikacja ma menu pojawiające się po najechaniu, modal z focus trap oraz tablicę kanban z przeciąganiem kart. W takim scenariuszu łatwo napisać test, który działa lokalnie, ale nie daje zaufania. Dlatego będziemy stale wracać do pytań: jaki jest stan początkowy, jaka akcja jest wykonywana, gdzie widać skutek i co zostanie po awarii.

## 1. Hover

Najechanie myszą jest przydatne dla tooltipów i menu, ale nie powinno być jedyną drogą do funkcji.

## 2. Focus

Fokus jest podstawą dostępności klawiatury. Test powinien sprawdzać, gdzie trafia po Tab i czy modal zatrzymuje fokus.

## 3. Drag and drop

Przeciąganie jest złożone, bo zależy od zdarzeń myszy, pozycji i implementacji biblioteki.

## 4. Touch events

Interakcje dotykowe wymagają emulacji urządzenia lub osobnej strategii. Desktopowy hover nie zastępuje mobile.

## 5. Dostępność

Każda funkcja dostępna myszą powinna mieć sensowną alternatywę klawiaturową, jeśli jest istotna dla użytkownika.

## Przykład referencyjny

```typescript
await page.getByRole('button', { name: 'Więcej opcji' }).hover();
await expect(page.getByRole('menu')).toBeVisible();

await page.keyboard.press('Tab');
await expect(page.getByRole('button', { name: 'Zapisz' })).toBeFocused();

await page.getByText('Zadanie A').dragTo(page.getByRole('list', { name: 'W toku' }));
```

Przykład należy czytać jako wzorzec myślenia, nie jako jedyny poprawny kod. Warto zauważyć, że scenariusz ma wyraźny stan, akcję i asercję. Nie kończy się na samym wywołaniu metody Playwrighta, lecz sprawdza obserwowalny rezultat.

## Lista kontrolna lekcji

- Czy lokator opisuje zachowanie użytkownika?
- Czy akcja ma asercję skutku?
- Czy test nie zależy od stałego opóźnienia?
- Czy dane są jawne i powtarzalne?
- Czy błąd testu będzie możliwy do zdiagnozowania z raportu?
- Czy scenariusz można uruchomić równolegle z innymi testami?
- Czy rozwiązanie nie ukrywa zbyt wiele w helperach?

## 1. Strategia testowania: Najechanie, fokus oraz przeciąganie i upuszczanie
Strategia zaczyna się od rozpoznania, czy temat „Najechanie, fokus oraz przeciąganie i upuszczanie” powinien być sprawdzany przez pełny test UI, test API, test komponentu czy krótszy test integracyjny. W module drugim pracujemy blisko przeglądarki, ale nie oznacza to, że każdy szczegół aplikacji ma być testowany przez interfejs. Test UI jest najdroższy, lecz daje najwięcej realizmu. Dlatego używaj go tam, gdzie zachowanie użytkownika, dostępność elementów, routing, renderowanie i integracja z backendem są częścią ryzyka.

Dla tego tematu główny obszar decyzji to: najechanie, fokus, tooltipy, menu, przeciąganie i upuszczanie, dotyk i dostępność. Jeżeli test dotyczy tylko pojedynczej reguły walidacyjnej, często lepiej sprawdzić ją niżej. Jeżeli jednak ryzykiem jest to, że użytkownik nie może wykonać przepływu w przeglądarce, Playwright jest właściwym narzędziem. Ważne jest świadome uzasadnienie, a nie automatyczny wybór UI.

Praktyczny standard: każdy test powinien mieć jednozdaniowy cel, jawny stan początkowy i asercję skutku. Jeśli celu nie da się wyrazić po polsku bez słów „kliknięcie”, „selektor” albo „metoda”, prawdopodobnie opisujesz implementację, a nie zachowanie. Nazwa testu powinna brzmieć jak wymaganie użytkownika albo warunek jakości.

## 2. Dane i stan początkowy
Najczęstszą przyczyną niestabilności nie jest Playwright, lecz stan aplikacji. Dla tematu „Najechanie, fokus oraz przeciąganie i upuszczanie” szczególnie groźne jest: sprawdzenie tylko obsługi myszy przy pominięciu klawiatury i urządzeń dotykowych. Test, który zależy od ręcznie przygotowanego konta, istniejącego koszyka, dzisiejszej daty albo poprzedniego testu, nie jest powtarzalnym eksperymentem.

Stan początkowy powinien być przygotowany w sposób jawny. Może to być API, fixture, seed, fabryka danych albo osobny użytkownik z zapisanym `storageState`. Ważne jest, aby test nie zakładał historii środowiska. Jeżeli test potrzebuje zamówienia, utwórz zamówienie. Jeżeli potrzebuje pustej listy, upewnij się, że lista jest pusta. Jeżeli potrzebuje konkretnej roli, przygotuj użytkownika z tą rolą.

Dane testowe powinny mieć identyfikator przebiegu, prefiks lub inny mechanizm odróżniający je od danych ręcznych. To ułatwia sprzątanie i diagnozę. Przy równoległym uruchamianiu dane muszą być niezależne. Jeden wspólny użytkownik dla wszystkich testów jest wygodny tylko do pierwszej awarii.

## 3. Synchronizacja i oczekiwanie na stan
Stabilny test nie czeka „trochę”. Stabilny test czeka na warunek, który ma znaczenie dla scenariusza. W przypadku „Najechanie, fokus oraz przeciąganie i upuszczanie” takim warunkiem może być widoczność elementu, zmiana URL, odpowiedź API, status przycisku, komunikat walidacyjny, pojawienie się pliku, zniknięcie loadera albo zgodność z obrazem bazowym.

Stałe opóźnienie ma dwie wady: spowalnia szybkie przebiegi i nadal nie gwarantuje sukcesu wolnych przebiegów. Jeśli test używa `waitForTimeout`, zapytaj, jaki stan powinien zastąpić ten timeout. Czasem będzie to asercja webowa. Czasem `waitForResponse`. Czasem polling API. Czasem zmiana architektury testu, bo UI nie jest najlepszym miejscem do sprawdzenia danej reguły.

Dobra synchronizacja jest blisko sensu biznesowego. Po kliknięciu „Zapisz” nie czekaj na losową liczbę milisekund; sprawdź komunikat, odpowiedź API albo trwały status. Po nawigacji nie zakładaj, że dokument załadowany oznacza dane gotowe. Po uploadzie nie sprawdzaj tylko nazwy pliku; sprawdź, czy aplikacja przyjęła plik i co zrobiła z walidacją.

## 4. Diagnostyka awarii
Test należy pisać tak, jakby jutro miał zawieść w CI. Gdy zawiedzie, zespół potrzebuje odpowiedzi: gdzie byliśmy, jaki element wybrał lokator, jakie dane były użyte, jakie żądania wyszły, co odpowiedział backend i jaki stan zobaczył użytkownik. Bez tych danych awaria staje się zgadywaniem.

Dla lekcji „Najechanie, fokus oraz przeciąganie i upuszczanie” minimum diagnostyczne to czytelna nazwa testu, kroki `test.step` dla najważniejszych faz, trace na awarii oraz asercje, które wskazują oczekiwany stan. W bardziej złożonych przypadkach dodaj identyfikator danych testowych, aktualny URL, informację o roli użytkownika i załączniki z odpowiedzi API.

Trace viewer jest szczególnie ważny w module drugim, bo pokazuje relację między akcją, lokatorem i stanem strony. Możesz zobaczyć, czy element był zasłonięty, czy kliknięto właściwy przycisk, czy aplikacja przeszła do innego URL, czy konsola zgłosiła błąd i czy żądanie sieciowe zwróciło właściwy status.

## 5. Antywzorzec i poprawa
Typowy antywzorzec w tym obszarze wygląda następująco: test znajduje element przez przypadkowy selektor, wykonuje akcję, czeka stałą liczbę milisekund i kończy się bez asercji albo z asercją zbyt ogólną. Taki test może przechodzić, gdy funkcja nie działa, i padać, gdy funkcja działa, ale zmienił się layout.

Poprawa wymaga zmiany myślenia. Najpierw nazwij zachowanie. Następnie wybierz lokator opisujący intencję użytkownika. Potem wykonaj akcję i sprawdź skutek. Jeżeli pojawia się problem z actionability, nie zaczynaj od wymuszenia akcji. Sprawdź, czy element jest widoczny, włączony, niezasłonięty i jednoznaczny.

Przykładowe pytanie review: czy test padnie wtedy, gdy użytkownik naprawdę nie może wykonać operacji? Jeśli tak, jest wartościowy. Czy padnie tylko dlatego, że zmieniła się kolejność `div` w DOM? Jeśli tak, jest zbyt blisko implementacji.

## 6. Praca w CI
CI jest bardziej wymagającym środowiskiem niż laptop autora. Testy działają równolegle, zasoby są ograniczone, backend może odpowiadać wolniej, a artefakty są jedynym źródłem diagnozy. Dlatego scenariusze z lekcji „Najechanie, fokus oraz przeciąganie i upuszczanie” muszą być samowystarczalne i odporne na różnice środowiskowe.

W pipeline warto rozdzielić szybkie testy smoke od pełniejszej regresji. Nie każdy test wizualny, mobilny lub wieloprzeglądarkowy musi działać w każdym pull requeście. Z drugiej strony krytyczne przepływy powinny dawać szybki sygnał. Dobór zestawu testów to decyzja jakościowa, nie tylko techniczna.

Jeżeli test pada tylko w CI, nie zakładaj od razu, że jest flaky. Porównaj wersje, dane, `baseURL`, przeglądarkę, viewport, uprawnienia, dostęp do backendu i obciążenie środowiska. Dopiero potem klasyfikuj problem. Słowo „flaky” powinno rozpoczynać analizę, a nie ją kończyć.

## 7. Case study
Case study dla tej lekcji: tablica kanban obsługuje menu po najechaniu, modal z focus trap i przeciąganie kart. Pierwsza wersja testu zwykle powstaje szybko: wejście na stronę, kilka kliknięć, jedna asercja. Problem pojawia się później, gdy test zaczyna padać po zmianie danych albo przy wolniejszym backendzie. Wtedy okazuje się, że test nie czekał na właściwy stan i nie miał wystarczającej diagnostyki.

Wersja dojrzała zaczyna się od przygotowania danych, używa lokatorów semantycznych, opisuje kroki i sprawdza rezultat w kilku miejscach tylko wtedy, gdy te miejsca są częścią tego samego zachowania. Jeżeli operacja powinna zmienić UI i wysłać żądanie API, można sprawdzić oba aspekty. Jeżeli jeden test zaczyna obejmować pięć niezależnych procesów, należy go podzielić.

Po awarii case study powinno być możliwe do odtworzenia. W raporcie chcemy zobaczyć dane wejściowe, URL, krok, który zawiódł, stan elementu i ewentualną odpowiedź API. Bez tego nawet najlepsza teoria nie przełoży się na praktyczną stabilność.

## 8. Refaktoryzacja i utrzymanie
Nie próbuj od razu budować idealnej abstrakcji. Najpierw napisz kilka czytelnych testów. Gdy zobaczysz powtórzenie, nazwij je. Jeśli powtarza się przygotowanie danych, stwórz builder albo klienta API. Jeśli powtarza się fragment interfejsu, stwórz komponent. Jeśli powtarza się asercja domenowa, rozważ helper asercyjny.

Refaktoryzacja nie powinna ukrywać sensu testu. Helper, który wykonuje pięć akcji i trzy asercje, może skrócić plik, ale utrudnić diagnozę. Dobra abstrakcja ma nazwę domenową i jedną odpowiedzialność. Zła abstrakcja jest workiem na przypadkowy kod.

Po kilku miesiącach utrzymania największą wartość mają testy, które czyta się bez kontekstu autora. Jeżeli nowa osoba rozumie, co test chroni i jak naprawić awarię, projekt jest zdrowy. Jeśli musi pytać, dlaczego klikamy trzeci przycisk w drugim kontenerze, projekt wymaga refaktoryzacji.

## 9. Ćwiczenia zaawansowane
1. Znajdź w istniejącym teście jeden selektor zależny od struktury DOM i zastąp go lokatorem semantycznym.
2. Usuń jedno `waitForTimeout` i zastąp je oczekiwaniem na znaczący stan.
3. Dodaj `test.step` do scenariusza, który ma więcej niż trzy fazy.
4. Przygotuj wariant negatywny dla tego samego zachowania.
5. Uruchom test w trybie trace i opisz, jakie informacje są widoczne po awarii.
6. Sprawdź, czy test działa równolegle z samym sobą przy innym zestawie danych.
7. Napisz krótką notatkę review: co test chroni, jakie dane tworzy i jaki jest oczekiwany skutek.

Te ćwiczenia nie są dodatkiem. To sposób zamiany wiedzy z lekcji „Najechanie, fokus oraz przeciąganie i upuszczanie” w nawyk projektowy. Automatyzacja staje się stabilna dopiero wtedy, gdy dobre decyzje są powtarzane konsekwentnie.

