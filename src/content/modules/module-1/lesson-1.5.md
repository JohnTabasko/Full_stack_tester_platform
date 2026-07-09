# Pierwszy test — anatomia testu Playwright

> Ten materiał jest częścią redakcyjnie dopracowanego modułu pierwszego. Moduł ma nauczyć nie tylko pierwszych komend, ale sposobu myślenia: jak budować projekt testowy, któremu zespół może zaufać. Czytaj lekcję jak rozdział książki: zatrzymuj się przy przykładach, porównuj dobre i złe decyzje, a po każdej większej sekcji odpowiedz sobie, jak zastosowałbyś ją w swoim projekcie.

## Cel lekcji

Celem lekcji jest napisanie pierwszego testu, ale ważniejsze jest zrozumienie każdego jego fragmentu. Pierwszy test w projekcie jest wzorcem. Będzie kopiowany, modyfikowany i cytowany w review. Jeżeli od początku pokaże dobre praktyki, cały projekt skorzysta.

## Mapa mentalna modułu pierwszego

Pierwszy moduł jest fundamentem całego kursu. Jeżeli na tym etapie nauczysz się jedynie uruchamiać komendę `npx playwright test`, kolejne moduły będą wyglądały jak zbiór niepowiązanych sztuczek. Jeżeli jednak zrozumiesz architekturę narzędzia, rolę konfiguracji, znaczenie izolacji i sens asercji, późniejsze tematy będą naturalnym rozwinięciem jednego spójnego modelu.

W module pierwszym pracujemy na pięciu poziomach:

1. **Poziom narzędzia** — czym jest Playwright, jakie przeglądarki obsługuje i jak komunikuje się z nimi test.
2. **Poziom środowiska** — Node.js, npm, TypeScript, przeglądarki Playwright, edytor, system operacyjny i CI.
3. **Poziom projektu** — katalogi, konwencje nazw, pliki konfiguracyjne, dane testowe, raporty i artefakty.
4. **Poziom pojedynczego testu** — `test`, fixture `page`, lokatory, akcje, asercje, kroki i diagnostyka.
5. **Poziom zespołu** — standardy, review, powtarzalność, wersjonowanie i utrzymywalność.

Te poziomy stale się przenikają. Błąd w konfiguracji może wyglądać jak błąd testu. Zły lokator może być objawem złej struktury aplikacji. Brak raportu w CI może sprawić, że realny defekt produktu zostanie uznany za losową niestabilność. Dlatego od początku warto patrzeć na automatyzację jak na system naczyń połączonych.

## 1. Pierwszy test nie powinien być przypadkowy

Wiele kursów zaczyna od testu, który wchodzi na stronę i sprawdza tytuł. To dobre do demonstracji, ale niewystarczające do nauki profesjonalnego stylu. Pierwszy test powinien pokazywać intencję, stabilne lokatory, asercję skutku i czytelną strukturę.

Dobry pierwszy test nie musi być długi. Musi być świadomy. Każda linia powinna mieć powód.

## 2. Minimalny test

```typescript
import { test, expect } from '@playwright/test';

test('użytkownik widzi stronę logowania', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByRole('heading', { name: /logowanie/i })).toBeVisible();
  await expect(page.getByLabel(/adres e-mail/i)).toBeVisible();
  await expect(page.getByLabel(/hasło/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /zaloguj/i })).toBeEnabled();
});
```

Ten test jest prosty, ale uczy wielu rzeczy: importów, fixture `page`, nawigacji, lokatorów semantycznych, asercji webowych i czytelnej nazwy.

## 3. Importy

```typescript
import { test, expect } from '@playwright/test';
```

`test` pochodzi z runnera Playwright. Definiuje scenariusz, obsługuje fixture'y, timeouty, raporty i kroki. `expect` to biblioteka asercji z rozszerzeniami webowymi. Nie jest to zwykłe porównywanie wartości; `expect(locator).toBeVisible()` potrafi czekać na stan elementu.

## 4. Nazwa testu

```typescript
test('użytkownik widzi stronę logowania', async ({ page }) => {
```

Nazwa powinna opisywać zachowanie. Unikaj nazw „test logowania 1”, „sprawdzenie strony” albo „klik button”. Dobra nazwa pomaga w raporcie. Gdy test padnie w CI, pierwszą informacją jest właśnie nazwa.

## 5. Fixture `page`

`page` to karta przeglądarki dostarczona przez Playwright Test. Jest izolowana dla testu. Nie musisz ręcznie uruchamiać przeglądarki w każdym scenariuszu. Runner robi to zgodnie z konfiguracją.

Fixture'y są jednym z najważniejszych mechanizmów Playwright. Na początku używasz `page`, później poznasz `request`, `context`, własne fixture'y i zależności domenowe.

## 6. Nawigacja

```typescript
await page.goto('/login');
```

Jeżeli skonfigurowano `baseURL`, możesz używać ścieżek względnych. To lepsze niż wpisywanie pełnego adresu w każdym teście. Test nie powinien wiedzieć, czy działa na `localhost`, środowisku testowym czy stagingu. To odpowiedzialność konfiguracji.

Nie nadużywaj `waitUntil: 'networkidle'`. W wielu aplikacjach nowoczesnych sieć nigdy nie jest całkowicie cicha, bo działa polling, telemetryka albo WebSocket. Często lepiej czekać na widoczny stan strony.

## 7. Lokatory

```typescript
page.getByRole('heading', { name: /logowanie/i })
page.getByLabel(/adres e-mail/i)
page.getByRole('button', { name: /zaloguj/i })
```

To lokatory semantyczne. Opisują elementy tak, jak widzi je użytkownik i technologie wspomagające. Są zwykle stabilniejsze niż klasy CSS i XPath. Jeżeli `getByLabel` nie działa, być może formularz nie ma poprawnej etykiety. Wtedy test ujawnia problem dostępności.

## 8. Asercje

```typescript
await expect(page.getByRole('button', { name: /zaloguj/i })).toBeEnabled();
```

Asercja odpowiada na pytanie: skąd wiem, że system jest w oczekiwanym stanie? Samo wejście na URL nie wystarcza. Strona może pokazać błąd, loader, pusty ekran albo niepełny formularz. Asercje powinny potwierdzać elementy istotne dla zachowania.

## 9. `test.step`

Dla dłuższych scenariuszy używaj kroków:

```typescript
test('użytkownik może otworzyć stronę logowania', async ({ page }) => {
  await test.step('Przejście na stronę logowania', async () => {
    await page.goto('/login');
  });

  await test.step('Weryfikacja formularza', async () => {
    await expect(page.getByLabel(/e-mail/i)).toBeVisible();
    await expect(page.getByLabel(/hasło/i)).toBeVisible();
  });
});
```

Kroki poprawiają raport i trace. Nie przesadzaj jednak. Test z dwudziestoma krokami może oznaczać zbyt szeroki scenariusz.

## 10. Pierwszy test pozytywny i negatywny

Po sprawdzeniu widoczności formularza dodaj test błędu:

```typescript
test('użytkownik widzi błąd przy niepoprawnym haśle', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel(/e-mail/i).fill('anna@example.test');
  await page.getByLabel(/hasło/i).fill('złe-hasło');
  await page.getByRole('button', { name: /zaloguj/i }).click();

  await expect(page.getByRole('alert')).toContainText(/niepoprawne dane/i);
  await expect(page).toHaveURL(/\/login/);
});
```

Scenariusz negatywny uczy walidacji, komunikatów i braku niepożądanego skutku. W tym przypadku ważne jest nie tylko pojawienie się błędu, ale też brak przejścia do panelu.

## 11. Uruchamianie

Podstawowe komendy:

```bash
npx playwright test
npx playwright test tests/e2e/login.spec.ts
npx playwright test --headed
npx playwright test --debug
npx playwright show-report
```

Każda ma inne zastosowanie. Domyślne uruchomienie jest dobre do CI. `--headed` pomaga zobaczyć przeglądarkę. `--debug` otwiera tryb debugowania. Raport HTML pomaga przeanalizować wynik.

## 12. Interpretacja wyniku

Zielony test oznacza tylko tyle, że w danych warunkach spełniły się asercje. Nie oznacza, że funkcja jest w pełni przetestowana. Czerwony test oznacza, że scenariusz nie osiągnął oczekiwanego stanu. Nie oznacza automatycznie błędu produktu. Może to być błąd danych, środowiska, lokatora, konfiguracji albo testu.

Dlatego interpretacja wyniku wymaga artefaktów: komunikatu błędu, trace, screenshotu, logów konsoli i ruchu sieciowego.

## 13. Pierwsze antywzorce

Zły pierwszy test:

```typescript
test('login', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.locator('.input').first().fill('a@b.com');
  await page.locator('.input').nth(1).fill('123');
  await page.waitForTimeout(3000);
  await page.locator('.btn').click();
});
```

Problemy:

- pełny URL zamiast `baseURL`;
- kruche selektory;
- brak nazw dostępnych;
- stały timeout;
- brak asercji;
- nie wiadomo, co test potwierdza.

Poprawa nie polega na kosmetyce. Polega na zmianie myślenia: test ma potwierdzać zachowanie.

## 14. Wzorzec pierwszego pull requestu

Pierwszy PR z testem powinien zawierać:

- jeden prosty test pozytywny;
- jeden prosty test negatywny;
- konfigurację `baseURL`;
- skrypty npm;
- raport HTML;
- trace na awarii;
- README z instrukcją uruchomienia;
- brak sekretów w repozytorium;
- brak `waitForTimeout`.

To wystarczy, aby zbudować standard dla kolejnych lekcji.

## 15. Co zapamiętać

Pierwszy test jest deklaracją stylu. Jeżeli pokaże stabilne lokatory, asercje skutku, czytelne nazwy i diagnostykę, będzie dobrym wzorcem. Jeżeli pokaże przypadkowe selektory i brak asercji, projekt szybko pójdzie w złym kierunku.

## Rozdział pogłębiający: jak myśleć o temacie „Pierwszy test — anatomia testu Playwright” w prawdziwym zespole

W projekcie komercyjnym temat „Pierwszy test — anatomia testu Playwright” nie istnieje w izolacji. Dotyka organizacji pracy, sposobu zgłaszania błędów, tempa wydań, jakości danych oraz zaufania do pipeline'u. Najczęstszy błąd początkujących polega na tym, że uczą się narzędzia przez kopiowanie krótkich przykładów. Krótkie przykłady są dobre do demonstracji składni, ale nie uczą konsekwencji. A konsekwencje są tym, co odróżnia kod szkoleniowy od kodu utrzymywanego przez zespół przez kilka lat.

### Perspektywa testera

Tester powinien pytać: jakie ryzyko ograniczam? W kontekście tej lekcji szczególnie ważne jest: zrozumienie każdego elementu testu: importów, fixture, lokatorów, akcji, asercji, kroków, uruchomienia i interpretacji raportu. Jeżeli test lub konfiguracja nie ogranicza żadnego ryzyka, prawdopodobnie jest tylko technicznym ćwiczeniem. To nie znaczy, że ćwiczenia są złe. Oznacza to, że w projekcie produkcyjnym każdy element automatyzacji powinien mieć uzasadnienie.

Tester nie powinien akceptować wyniku „zielony” bez zrozumienia, co zostało sprawdzone. Zielony test bez dobrej asercji jest złudzeniem. Czerwony test bez diagnostyki jest kosztem. Najcenniejszy test to taki, który w razie regresji szybko wskazuje obszar awarii: dane, interfejs, API, konfigurację, uprawnienia, środowisko albo sam test.

### Perspektywa programisty

Programista czytający test powinien zobaczyć intencję. Nazwa testu, nazwy kroków i asercje powinny mówić językiem zachowania systemu. Jeżeli test jest pełen przypadkowych selektorów, magicznych timeoutów i komentarzy typu „czekamy aż zadziała”, programista nie będzie traktował go jak wiarygodnej dokumentacji. Dobrze napisany test pomaga zrozumieć wymaganie. Źle napisany test jest kolejną warstwą szumu.

### Perspektywa lidera technicznego

Lider techniczny patrzy na koszt utrzymania. Pyta, czy standard można skalować na kilkaset testów, czy nowa osoba w zespole zrozumie strukturę, czy pipeline pozostanie szybki, czy awarie będą klasyfikowane, czy artefakty wystarczą do diagnozy bez uruchamiania lokalnego. W tym sensie każdy plik konfiguracyjny i każdy pierwszy przykład w projekcie są decyzją architektoniczną.

### Perspektywa CI/CD

W CI znikają wygodne założenia lokalnego środowiska. Masz mniej zasobów, inną sieć, często inny system operacyjny, świeżą instalację zależności, równoległe uruchomienia i brak ręcznej interwencji. Dlatego wszystko, co lokalnie było „oczywiste”, w CI musi być jawne: wersja Node.js, instalacja przeglądarek, zmienne środowiskowe, `baseURL`, dane testowe, raporty, trace i zrzuty ekranu.

### Perspektywa utrzymania

Wyobraź sobie, że wracasz do tego projektu po roku. Czy wiesz, dlaczego ustawiono konkretne timeouty? Czy wiesz, czemu test działa tylko na Chromium? Czy wiesz, skąd pochodzi użytkownik testowy? Czy wiesz, czy porażka testu oznacza błąd produktu, brak danych czy problem środowiska? Jeżeli odpowiedzi nie są zapisane w kodzie, konfiguracji albo dokumentacji, wiedza istnieje tylko w głowach ludzi — a to najkruchszy nośnik dokumentacji.

## Antywzorce modułu pierwszego

### Antywzorzec 1: „najpierw niech kliknie”

Początkujący często zaczynają od nagrania kilku kliknięć albo przepisania przykładu z dokumentacji. To dobry eksperyment, ale zły fundament. Test powinien zaczynać się od pytania o zachowanie, nie od pytania o kliknięcie. Kliknięcie jest narzędziem, a nie celem. Jeżeli po kliknięciu nie ma asercji skutku, test nie daje dowodu.

### Antywzorzec 2: konfiguracja jako śmietnik

Do `playwright.config.ts` łatwo dopisywać kolejne opcje bez zrozumienia. Po kilku miesiącach nikt nie wie, dlaczego retry wynosi 3, dlaczego timeout wynosi 120 sekund, dlaczego raport HTML nie zapisuje się w CI i dlaczego testy mobilne działają w każdym pull requeście. Konfiguracja powinna być krótka, jawna i komentowana wtedy, gdy decyzja nie jest oczywista.

### Antywzorzec 3: jeden użytkownik do wszystkiego

Wiele projektów zaczyna od jednego konta testowego. To wygodne przez tydzień, a potem staje się źródłem niestabilności. Testy równoległe zmieniają sobie nawzajem stan konta, koszyka, ustawień i danych. Od pierwszego modułu warto myśleć o izolacji: osobne konta, fabryki danych, prefiksy, tenanty albo reset stanu.

### Antywzorzec 4: brak diagnostyki na początku

Trace, screenshoty i raporty bywają odkładane „na później”. To błąd. Diagnostyka jest najpotrzebniejsza wtedy, gdy projekt dopiero dojrzewa i awarie są częste. Włączenie diagnostyki po fakcie oznacza, że pierwsze problemy będą diagnozowane ręcznie, wolno i chaotycznie.

### Antywzorzec 5: kopiowanie struktury z innego projektu

Struktura katalogów powinna wynikać z typu aplikacji, zespołu i ryzyk. Projekt e-commerce, panel administracyjny, platforma SaaS i aplikacja bankowa będą potrzebowały innej organizacji danych, innych helperów i innych zestawów testów. Kopiowanie struktury bez zrozumienia prowadzi do folderów, których nikt nie używa, i helperów, których nikt nie rozumie.

## Pytania kontrolne do rozmowy technicznej

1. Jak wyjaśnisz różnicę między `Browser`, `BrowserContext` i `Page` osobie, która zna przeglądarkę tylko jako użytkownik?
2. Dlaczego lokator Playwrighta jest stabilniejszy niż jednorazowo pobrany element DOM?
3. Kiedy warto używać testu end-to-end, a kiedy lepiej przenieść sprawdzenie do API lub testu jednostkowego?
4. Co powinno znaleźć się w minimalnym `playwright.config.ts` dla zespołu pracującego w CI?
5. Jakie artefakty powinien zostawić test, który pada tylko w pipeline?
6. Jak rozpoznasz, że problemem jest środowisko, a nie test?
7. Jak zaprojektujesz dane testowe, aby testy mogły działać równolegle?
8. Co zrobisz, gdy pierwszy test przechodzi lokalnie, ale w CI kończy się timeoutem?
9. Jak uzasadnisz wybór struktury katalogów w nowym repozytorium testowym?
10. Jakie informacje powinny znaleźć się w README projektu Playwright?

## Ćwiczenia redakcyjne i praktyczne

1. Napisz krótkie README dla nowego projektu Playwright. Uwzględnij instalację, uruchomienie, debugowanie, raporty i wymagane zmienne środowiskowe.
2. Przygotuj checklistę pierwszego pull requestu z testem Playwright.
3. Weź dowolny test z internetu i oceń go według kryteriów: cel, dane, lokatory, asercje, diagnostyka, utrzymywalność.
4. Zaprojektuj minimalną konfigurację dla projektu lokalnego i osobną dla CI. Uzasadnij różnice.
5. Opisz, jak zespół powinien reagować na flaky test w pierwszym miesiącu istnienia automatyzacji.

## Podsumowanie pogłębione

Dobrze rozpoczęty projekt Playwright nie polega na tym, że pierwszy test uruchomi się na zielono. To dopiero początek. Prawdziwy sukces oznacza, że zespół rozumie, co test sprawdza, potrafi go uruchomić w powtarzalnym środowisku, wie, gdzie szukać raportu po awarii i ma standard, który można bezpiecznie powielać. Moduł pierwszy ma zbudować właśnie ten standard.


Ta część rozszerza materiał o praktyczne sytuacje, które pojawiają się w pierwszych tygodniach budowania automatyzacji. Jej celem nie jest dodanie kolejnej definicji, ale pokazanie, jak podejmować decyzje, gdy projekt przestaje być ćwiczeniem i zaczyna być narzędziem zespołu. W centrum pozostaje: importy, fixture page, nawigację, lokatory, akcje, asercje, test.step, uruchamianie, raporty i interpretację wyniku.

### Sytuacja projektowa

Wyobraź sobie zespół, który dopiero wprowadza Playwright. Aplikacja ma logowanie, panel użytkownika, kilka formularzy i API używane przez frontend. Manualna regresja zajmuje kilka godzin, a zespół chce zacząć od automatyzacji najważniejszych ścieżek. Pierwsza pokusa to napisać jak najwięcej testów. Lepsze podejście to napisać niewiele testów, ale takich, które ustanawiają standard: czytelne nazwy, stabilne lokatory, jawne dane, jednoznaczne asercje i diagnostyka.

Dla tematu „Anatomia pierwszego testu” oznacza to, że każda decyzja powinna mieć uzasadnienie. Jeśli używasz konkretnej konfiguracji, zapisz dlaczego. Jeśli tworzysz katalog, określ co do niego trafia. Jeśli wybierasz lokator, sprawdź czy opisuje intencję użytkownika. Jeśli dodajesz retry, traktuj go jako mechanizm obserwacji niestabilności, a nie jako sposób ukrycia problemu.

### Decyzje, które trzeba zapisać

W pierwszym tygodniu projektu warto zapisać przynajmniej następujące decyzje:

- jaka wersja Node.js jest wspierana i gdzie jest zapisana;
- jak instalujemy zależności i przeglądarki;
- które skrypty npm są oficjalnym sposobem uruchamiania testów;
- gdzie są testy smoke, a gdzie pełniejsza regresja;
- jak tworzymy dane testowe i jak je sprzątamy;
- jakie lokatory preferujemy;
- kiedy wolno używać `getByTestId`;
- czy testy logują się przez UI, API czy `storageState`;
- jakie artefakty są obowiązkowe po awarii;
- jak zgłaszamy i klasyfikujemy flaky testy.

Brak decyzji też jest decyzją — zwykle złą. Gdy standard nie jest zapisany, każdy autor tworzy własny styl. Po miesiącu projekt ma kilka sposobów logowania, kilka struktur danych, różne nazwy testów i niespójne raporty. Refaktoryzacja takiego chaosu jest droższa niż spisanie zasad na początku.

### Przykład dobrego komentarza architektonicznego

Komentarz w kodzie nie powinien tłumaczyć oczywistości. Nie pisz komentarza „klikamy przycisk”, jeśli następna linia robi `click()`. Dobry komentarz wyjaśnia decyzję:

```typescript
// W CI włączamy retry, aby oznaczyć niestabilność, ale nie ukrywamy jej:
// raport nadal pokazuje testy, które przeszły dopiero po ponowieniu.
retries: process.env.CI ? 2 : 0,
```

Albo:

```typescript
// Używamy getByRole, bo ten przycisk jest częścią kontraktu dostępności.
// Jeśli lokator przestanie działać, prawdopodobnie aplikacja straciła nazwę dostępną.
await page.getByRole('button', { name: 'Zapisz' }).click();
```

Takie komentarze uczą przyszłych autorów, dlaczego projekt wygląda tak, a nie inaczej.

### Jak recenzować rozwiązanie

Review powinno sprawdzać nie tylko to, czy kod działa. Dla tematu „Anatomia pierwszego testu” recenzent powinien zapytać:

1. Czy rozwiązanie jest zrozumiałe dla osoby, która nie pisała kodu?
2. Czy nazwy opisują zachowanie i odpowiedzialność?
3. Czy nie ma ukrytych zależności od lokalnego środowiska?
4. Czy dane testowe są deterministyczne?
5. Czy test lub konfiguracja zostawia wystarczające informacje po awarii?
6. Czy rozwiązanie będzie działało w równoległym uruchomieniu?
7. Czy nie przeniesiono zbyt dużej odpowiedzialności do jednego helpera?
8. Czy można łatwo uruchomić tylko ten fragment lokalnie?
9. Czy wynik w CI będzie jednoznaczny?
10. Czy dokumentacja mówi, jak utrzymać ten element za kilka miesięcy?

### Typowy błąd początkującego

Początkujący często myli „działa u mnie” z „jest gotowe dla zespołu”. Lokalnie można mieć pobraną przeglądarkę, ustawiony sekret, uruchomiony backend i ręcznie przygotowane konto. CI nie ma tej wiedzy. Nowa osoba w zespole też jej nie ma. Dlatego prawdziwym kryterium gotowości jest odtworzenie: czy inna osoba może sklonować projekt, wykonać opisane kroki i uzyskać ten sam wynik?

### Zadanie do wykonania

Weź aktualny projekt lub dowolny projekt ćwiczeniowy i przygotuj krótką notatkę architektoniczną. Powinna zawierać: cel automatyzacji, zakres pierwszego smoke testu, sposób uruchamiania, wymagane zmienne, dane testowe, raporty i zasady diagnostyki. Następnie porównaj notatkę z kodem. Jeśli kod robi coś, czego notatka nie opisuje, albo notatka obiecuje coś, czego kod nie zapewnia, masz miejsce do poprawy.


