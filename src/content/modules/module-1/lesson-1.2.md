# Instalacja i konfiguracja środowiska

> Ten materiał jest częścią redakcyjnie dopracowanego modułu pierwszego. Moduł ma nauczyć nie tylko pierwszych komend, ale sposobu myślenia: jak budować projekt testowy, któremu zespół może zaufać. Czytaj lekcję jak rozdział książki: zatrzymuj się przy przykładach, porównuj dobre i złe decyzje, a po każdej większej sekcji odpowiedz sobie, jak zastosowałbyś ją w swoim projekcie.

## Cel lekcji

Celem tej lekcji jest przygotowanie środowiska, które działa powtarzalnie lokalnie i w CI. Instalacja nie jest mechanicznym klikaniem „dalej”. Jest pierwszą decyzją o stabilności projektu: wersje narzędzi, sposób uruchamiania, lokalizacja konfiguracji i diagnostyka pierwszego błędu wpływają na cały późniejszy kurs.

## Mapa mentalna modułu pierwszego

Pierwszy moduł jest fundamentem całego kursu. Jeżeli na tym etapie nauczysz się jedynie uruchamiać komendę `npx playwright test`, kolejne moduły będą wyglądały jak zbiór niepowiązanych sztuczek. Jeżeli jednak zrozumiesz architekturę narzędzia, rolę konfiguracji, znaczenie izolacji i sens asercji, późniejsze tematy będą naturalnym rozwinięciem jednego spójnego modelu.

W module pierwszym pracujemy na pięciu poziomach:

1. **Poziom narzędzia** — czym jest Playwright, jakie przeglądarki obsługuje i jak komunikuje się z nimi test.
2. **Poziom środowiska** — Node.js, npm, TypeScript, przeglądarki Playwright, edytor, system operacyjny i CI.
3. **Poziom projektu** — katalogi, konwencje nazw, pliki konfiguracyjne, dane testowe, raporty i artefakty.
4. **Poziom pojedynczego testu** — `test`, fixture `page`, lokatory, akcje, asercje, kroki i diagnostyka.
5. **Poziom zespołu** — standardy, review, powtarzalność, wersjonowanie i utrzymywalność.

Te poziomy stale się przenikają. Błąd w konfiguracji może wyglądać jak błąd testu. Zły lokator może być objawem złej struktury aplikacji. Brak raportu w CI może sprawić, że realny defekt produktu zostanie uznany za losową niestabilność. Dlatego od początku warto patrzeć na automatyzację jak na system naczyń połączonych.

## 1. Dlaczego instalacja jest tematem inżynierskim

W prostym samouczku instalacja sprowadza się do komendy `npm init playwright@latest`. W projekcie zespołowym to dopiero początek. Musisz wiedzieć, jaka wersja Node.js jest wspierana, czy repozytorium używa npm, pnpm czy yarn, czy przeglądarki Playwright są instalowane lokalnie czy w obrazie CI, gdzie trzymane są zmienne środowiskowe i jak nowa osoba ma uruchomić testy od zera.

Najgorsza instalacja to taka, która działa tylko na komputerze autora. Dobra instalacja jest opisana, wersjonowana i możliwa do odtworzenia. Jeżeli ktoś klonuje repozytorium i po kilku komendach może uruchomić test smoke, projekt ma niski próg wejścia. Jeżeli musi pytać o brakujące sekrety, wersję Node.js i ręcznie doinstalowane przeglądarki, środowisko jest niejawne.

## 2. Wymagania wstępne

Profesjonalny projekt Playwright powinien jawnie określać:

- wersję Node.js;
- menedżer pakietów;
- sposób instalowania zależności;
- sposób instalowania przeglądarek;
- obsługiwane systemy operacyjne;
- wymagane zmienne środowiskowe;
- komendy do testów lokalnych i CI;
- lokalizację raportów i artefaktów.

W praktyce warto użyć pliku `.nvmrc`, pola `engines` w `package.json`, dokumentacji w README albo narzędzia typu Volta. Nie chodzi o formalizm. Chodzi o zmniejszenie liczby różnic między komputerami zespołu.

## 3. Minimalna instalacja

Najprostszy start:

```bash
npm init playwright@latest
npx playwright test
npx playwright show-report
```

Ta komenda tworzy przykładową strukturę, instaluje zależności i proponuje konfigurację. Warto jednak po instalacji przejrzeć każdy wygenerowany plik. Nie traktuj scaffoldu jak magii. Sprawdź `package.json`, `playwright.config.ts`, katalog `tests`, `.gitignore` i ewentualne przykładowe testy.

Minimalny `package.json` powinien mieć czytelne skrypty:

```json
{
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:ui": "playwright test --ui",
    "report": "playwright show-report",
    "typecheck": "tsc --noEmit"
  }
}
```

Skrypty są dokumentacją. Jeżeli zespół musi pamiętać długie komendy z flagami, będzie popełniał błędy. Jeżeli komendy są nazwane, łatwiej użyć ich lokalnie i w CI.

## 4. Instalacja przeglądarek

Playwright używa własnych wersji przeglądarek, aby zapewnić powtarzalność. Po instalacji pakietu często trzeba pobrać binaria:

```bash
npx playwright install
```

W CI na Linuksie często potrzebne są zależności systemowe:

```bash
npx playwright install --with-deps
```

Możesz instalować wszystkie przeglądarki albo wybrane:

```bash
npx playwright install chromium
npx playwright install chromium firefox webkit
```

Dla początkującego ważne jest rozumienie błędu „Executable doesn't exist”. To nie znaczy, że test jest źle napisany. To znaczy, że Playwright nie znalazł pobranej przeglądarki. Poprawną reakcją jest instalacja przeglądarek albo naprawa cache w CI, a nie zmiana testu.

## 5. TypeScript

TypeScript nie jest obowiązkowy, ale w profesjonalnym projekcie bardzo pomaga. Typy dokumentują fixture'y, dane testowe, klienty API i konfigurację. Błędy literówek, brakujących pól lub złych typów można wykryć przed uruchomieniem testu.

Minimalny `tsconfig.json` powinien być spójny z projektem. Nie kopiuj go bezmyślnie. Zwróć uwagę na `target`, `moduleResolution`, `strict`, `types` i zakres `include`. Jeżeli testy mieszkają w osobnym katalogu, uwzględnij go w konfiguracji.

Przykład prostego typu danych testowych:

```typescript
type TestUser = {
  email: string;
  password: string;
  role: 'customer' | 'admin';
};

const user: TestUser = {
  email: 'qa@example.test',
  password: 'Correct-Horse-Battery-7!',
  role: 'customer',
};
```

To wygląda prosto, ale w większym projekcie typy chronią przed przekazywaniem niepełnych danych do helperów i fixture'ów.

## 6. Edytor i rozszerzenia

Najczęściej używanym edytorem jest Visual Studio Code. Warto zainstalować rozszerzenie Playwright, które pomaga uruchamiać i debugować testy z poziomu edytora. Przydatne są również ESLint, Prettier i wsparcie TypeScript.

Edytor powinien wspierać standard zespołu, a nie zastępować standard. Jeżeli formatowanie zależy od lokalnych ustawień każdego programisty, pull requesty będą pełne szumu. Dlatego konfigurację formatowania i lintingu warto trzymać w repozytorium.

## 7. Zmienne środowiskowe

Testy zwykle potrzebują adresu aplikacji, danych logowania, tokenów API lub flag funkcji. Nie zapisuj sekretów w repozytorium. Używaj `.env` lokalnie i sekretów platformy CI w pipeline.

Przykład:

```bash
BASE_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.test
```

W kodzie:

```typescript
const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';
```

Pamiętaj: wartość domyślna jest wygodna lokalnie, ale w CI brak wymaganej zmiennej powinien często kończyć się błędem. Cichy fallback do złego środowiska może być groźniejszy niż awaria.

## 8. Pierwsze uruchomienie i diagnostyka

Po instalacji uruchom test przykładowy, raport i tryb debugowania:

```bash
npm test
npm run report
npm run test:debug
```

Jeżeli coś nie działa, diagnozuj warstwami:

1. Czy Node.js ma właściwą wersję?
2. Czy zależności zainstalowano przez `npm ci` lub `npm install`?
3. Czy przeglądarki Playwright są pobrane?
4. Czy test ma dostęp do aplikacji pod `baseURL`?
5. Czy system ma wymagane biblioteki?
6. Czy firewall, proxy lub VPN nie blokuje ruchu?
7. Czy błąd dotyczy testu, aplikacji, czy środowiska?

Ta lista jest ważna, bo początkujący często poprawia test, gdy problemem jest środowisko.

## 9. Instalacja w CI

Minimalny pipeline powinien robić to samo, co lokalna instrukcja:

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with:
      node-version: 22
      cache: npm
  - run: npm ci
  - run: npx playwright install --with-deps
  - run: npm test
```

Nie zakładaj, że CI ma zainstalowaną przeglądarkę. Nie zakładaj, że zależności systemowe istnieją. Nie zakładaj, że sekret jest dostępny w pull requestach z forków. Wszystko, co jest wymagane, powinno być jawnie opisane albo jawnie sprawdzone.

## 10. Najczęstsze problemy instalacyjne

**Brak przeglądarki.** Uruchom `npx playwright install`. W CI użyj `--with-deps`.

**Inna wersja Node.js.** Ustal wersję w `.nvmrc`, `engines` lub konfiguracji CI.

**Test działa lokalnie, ale nie w CI.** Porównaj `BASE_URL`, zmienne środowiskowe, system operacyjny, cache i dostęp do aplikacji.

**Błąd TypeScript.** Sprawdź `tsconfig.json`, importy i typy fixture'ów.

**Timeout przy `page.goto`.** Aplikacja może nie działać, adres może być zły, środowisko może być wolne albo certyfikat może być problemem. Nie zaczynaj od zwiększania timeoutu.

## 11. Standard README

Każdy projekt Playwright powinien mieć README zawierające:

- wymagania wstępne;
- instalację zależności;
- instalację przeglądarek;
- uruchamianie testów;
- debugowanie;
- raporty;
- zmienne środowiskowe;
- zasady danych testowych;
- sposób uruchamiania w CI;
- instrukcję rozwiązywania najczęstszych problemów.

README jest częścią jakości projektu. Jeżeli nowa osoba nie może uruchomić testów bez pomocy autora, dokumentacja jest niewystarczająca.

## Rozdział pogłębiający: jak myśleć o temacie „Instalacja i konfiguracja środowiska” w prawdziwym zespole

W projekcie komercyjnym temat „Instalacja i konfiguracja środowiska” nie istnieje w izolacji. Dotyka organizacji pracy, sposobu zgłaszania błędów, tempa wydań, jakości danych oraz zaufania do pipeline'u. Najczęstszy błąd początkujących polega na tym, że uczą się narzędzia przez kopiowanie krótkich przykładów. Krótkie przykłady są dobre do demonstracji składni, ale nie uczą konsekwencji. A konsekwencje są tym, co odróżnia kod szkoleniowy od kodu utrzymywanego przez zespół przez kilka lat.

### Perspektywa testera

Tester powinien pytać: jakie ryzyko ograniczam? W kontekście tej lekcji szczególnie ważne jest: powtarzalność środowiska lokalnego i CI, jawne wersje narzędzi oraz szybka diagnostyka problemów instalacyjnych. Jeżeli test lub konfiguracja nie ogranicza żadnego ryzyka, prawdopodobnie jest tylko technicznym ćwiczeniem. To nie znaczy, że ćwiczenia są złe. Oznacza to, że w projekcie produkcyjnym każdy element automatyzacji powinien mieć uzasadnienie.

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


Ta część rozszerza materiał o praktyczne sytuacje, które pojawiają się w pierwszych tygodniach budowania automatyzacji. Jej celem nie jest dodanie kolejnej definicji, ale pokazanie, jak podejmować decyzje, gdy projekt przestaje być ćwiczeniem i zaczyna być narzędziem zespołu. W centrum pozostaje: wersje Node.js, instalację przeglądarek, skrypty npm, TypeScript, zmienne środowiskowe oraz diagnozę błędów pierwszego uruchomienia.

### Sytuacja projektowa

Wyobraź sobie zespół, który dopiero wprowadza Playwright. Aplikacja ma logowanie, panel użytkownika, kilka formularzy i API używane przez frontend. Manualna regresja zajmuje kilka godzin, a zespół chce zacząć od automatyzacji najważniejszych ścieżek. Pierwsza pokusa to napisać jak najwięcej testów. Lepsze podejście to napisać niewiele testów, ale takich, które ustanawiają standard: czytelne nazwy, stabilne lokatory, jawne dane, jednoznaczne asercje i diagnostyka.

Dla tematu „Instalacja i środowisko” oznacza to, że każda decyzja powinna mieć uzasadnienie. Jeśli używasz konkretnej konfiguracji, zapisz dlaczego. Jeśli tworzysz katalog, określ co do niego trafia. Jeśli wybierasz lokator, sprawdź czy opisuje intencję użytkownika. Jeśli dodajesz retry, traktuj go jako mechanizm obserwacji niestabilności, a nie jako sposób ukrycia problemu.

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

Review powinno sprawdzać nie tylko to, czy kod działa. Dla tematu „Instalacja i środowisko” recenzent powinien zapytać:

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


