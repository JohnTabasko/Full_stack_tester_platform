# GitHub, CV i prezentacja portfolio

> Portfolio testera full stack to produkt, który ma użytkownika: rekrutera, lidera QA lub programistę oceniającego kod. Produkt musi być łatwy do uruchomienia, zrozumienia i oceny. W tej lekcji zbudujesz dokumentację, która zamienia kompetencje techniczne w czytelne dowody — README, CV, LinkedIn i narrację do rozmowy rekrutacyjnej.

## Jak czytać ten moduł

Czytaj tę lekcję z perspektywy osoby, która ma trzy minuty na ocenę Twojego projektu. Trzy minuty to czas, który rekruter poświęca na pierwsze przejrzenie portfolio przed głębszą analizą. W ciągu trzech minut odbiorca musi zrozumieć: co budujesz, jak to uruchomić, jakie warstwy testujesz i dlaczego warto się zatrzymać. Każda sekcja tej lekcji buduje jeden element tego pierwszego wrażenia.

Trzy zasady lekcji:

1. **Kontekst biznesowy jest ważniejszy niż techniczny.** Nie mów „testowałem logowanie". Mów „testowałem ścieżkę logowania użytkownika w aplikacji SaaS, która ma 50 000 aktywnych użytkowników".
2. **Struktura > treść.** Odbiorca skanuje, nie czyta. Nagłówki, listy i screenshoty działają szybciej niż paragrafy.
3. **Dowód > deklaracja.** Zdanie „zmniejszyłem czas regresji o 40%" brzmi lepiej niż „przyspieszyłem testy".

---

## Cel lekcji

Ta lekcja koncentruje się na: **README jako centralny dokument portfolio, decyzje architektoniczne, demo wizualne, raporty, CV techniczne, LinkedIn i checklisty publikacji portfolio QA Automation**. Główne ryzyko: **portfolio zawiera kod, ale nie wyjaśnia celu, zakresu, sposobu uruchomienia, decyzji ani wartości dla zespołu**. Po lekturze powinieneś umieć napisać README, które w trzy minuty przekona odbiorcę do dalszej analizy, oraz CV, które pokazuje efekty, nie tylko narzędzia.

**Perspektywa Full Stack Testera:** Portfolio jest produktem. Ma użytkowników (rekruterów), problem do rozwiązania (pokazać kompetencje) i mierzalne cele (zaproszenie na rozmowę). Traktuj je z taką samą starannością jak kod produkcyjny.

---

## Sytuacja przewodnia

Rekruter otwiera Twoje repozytorium na GitHubie. Widzi: 12 plików, kilka folderów i plik README na górze. Ma trzy minuty. Twoja praca polega na tym, żeby te trzy minuty wykorzystać jak najlepiej — pokazać wartość, kontekst i dowody, a nie zostawić odbiorcę z pytaniami.

---

## 1. README jako centrum portfolio

README to pierwszy dokument, który czyta odbiorca, i ostatni dokument, który zapamięta. Dobry README ma strukturę, która odpowiada na pytania odbiorcy w kolejności ważności.

### Anatomia profesjonalnego README

```markdown
# Nazwa projektu

> Krótki tagline opisujący, co projekt robi i dla kogo. 
> W jednym zdaniu: jaki problem rozwiązuje i jakim narzędziem.

## W skrócie

- **Cel:** Testy E2E dla aplikacji sklepowej (UI + API + DB)
- **Stack:** Playwright, TypeScript, PostgreSQL, GitHub Actions
- **Czas smoke suite:** ~2 minuty
- **Status:** Aktywnie utrzymywany

[![CI](https://github.com/username/project/actions/workflows/test.yml/badge.svg)](https://github.com/username/project/actions)
```

### Sekcja „Jak uruchomić"

To najważniejsza sekcja README. Jeśli odbiorca nie może uruchomić projektu w pięć minut, straci zainteresowanie. Ta sekcja musi być:

- **Kompaktowa:** Maksymalnie 10 linii
- **Kompletna:** Wszystko, co potrzebne do uruchomienia od zera
- **Aktualna:** Sprawdzana przy każdym commicie

```markdown
## Jak uruchomić

### Wymagania
- Node.js 22+
- Docker (dla bazy danych)

### Instalacja

```bash
git clone https://github.com/username/project.git
cd project
npm ci
npx playwright install --with-deps chromium
cp .env.example .env
```

### Uruchomienie testów

```bash
# Wszystkie testy
npm run test

# Tylko smoke
npm run test:smoke

# Z raportem HTML
npm run test:report
```

### Zmienne środowiskowe

| Zmienna | Opis | Przykład |
|---|---|---|
| `BASE_URL` | Adres testowanej aplikacji | `http://localhost:3000` |
| `API_URL` | Adres API | `http://localhost:3000/api` |
| `DB_CONNECTION_STRING` | Połączenie do PostgreSQL | `postgresql://user:pass@localhost/db` |

```

### Sekcja „Zakres testów"

Ta sekcja pokazuje, co dokładnie testujesz, bez zanurzania się w szczegóły. Użyj tabel i list, żeby odbiorca mógł szybko zeskanować zakres.

```markdown
## Zakres testów

### Warstwy
| Warstwa | Pliki | Czas |
|---|---|---|
| UI (Playwright) | 8 testów | ~90s |
| API (APIRequestContext) | 12 testów | ~15s |
| DB (pg) | 4 testy | ~8s |
| **Smoke** | **10 testów** | **~2 min** |
| **Full regression** | **24 testy** | **~5 min** |

### Pokryte przepływy
- Logowanie i wylogowanie
- Rejestracja nowego użytkownika
- Przeglądanie katalogu produktów
- Dodawanie do koszyka i modyfikacja ilości
- Checkout — happy path i scenariusze negatywne
- CRUD zamówień przez API
- Weryfikacja zapisu w bazie danych

### Znane ograniczenia
- Visual testing nie jest włączony (brak stable design system)
- Performance testing w osobnym repozytorium (k6)
- Mobile testing przez Playwright viewport, nie na prawdziwych urządzeniach
```

### Sekcja „Decyzje architektoniczne"

Ta sekcja odróżnia profesjonalne portfolio od amatorskiego. Pokazuje, że rozumiesz nie tylko „jak", ale też „dlaczego".

```markdown
## Decyzje architektoniczne

### Dlaczego Page Object Model?
Strona logowania może zmienić strukturę DOM. Gdybyśmy mieli lokatory rozproszone w testach,
zmiana jednego atrybutu wymagałaby edycji wielu plików. POM centralizuje wiedzę o strukturze
strony w jednym miejscu — zmiana w `LoginPage.ts` propaguje się do wszystkich testów.

### Dlaczego API setup zamiast UI setup?
Tworzenie użytkownika przez UI trwa ~3-5 sekund. Przez API — ~100ms. Przy 24 testach
różnica to około 2 minut. Wybraliśmy szybkość, zachowując walidację UI tam, gdzie
testujemy interakcję użytkownika.

### Dlaczego nieparallelizujemy wszystkiego?
Playwright pozwala na `workers: 4` lub więcej. Dla 24 testów to znaczące przyspieszenie.
Jednak przy testach, które modyfikują wspólne dane (np. stan magazynowy), parallelizacja
powoduje flakiness. Wybraliśmy mniejszą liczbę workerów z większą stabilnością.
```

### Sekcja „Struktura projektu"

Ta sekcja pomaga odbiorcy zorientować się w kodzie przed rozpoczęciem czytania.

```markdown
## Struktura projektu

```
project/
├── tests/           # Pliki .spec.ts — orchestracja scenariuszy
├── pages/           # Page Object Models — wiedza o strukturze UI
├── api/             # Klienci API — wiedza o kontraktach HTTP
├── fixtures/        # Fikstury Playwright — setup/teardown danych
├── utils/           # Funkcje pomocnicze — data builder, logger
├── data/            # Dane statyczne — JSON z konfiguracją
└── playwright.config.ts
```

Pełny opis każdego katalogu znajduje się w [ARCHITECTURE.md](./ARCHITECTURE.md).
```

---

## 2. CV techniczne — od listy narzędzi do historii wpływu

CV testera QA Automation ma specyficzną strukturę. Odbiorca szuka nie tylko kompetencji, ale dowodów wpływu na jakość produktu i efektywność procesu. Zdanie „testowałem aplikację" nic nie mówi. Zdanie „zmniejszyłem czas regresji z 45 do 18 minut przez wdrożenie parallelizacji testów Playwright i optymalizację fikstur" — mówi wszystko.

### Struktura CV technicznego

```
1. Profil zawodowy (3-4 zdania)
   - Kim jesteś i czego szukasz
   - Jaki masz background (years, industry)
   - Co wyróżnia Cię na tle innych

2. Kompetencje techniczne
   - Grupy: Playwright, API, DB, CI/CD, Inne
   - Nie wymieniaj wszystkiego — wymieniaj to, co na poziomie produkcyjnym

3. Doświadczenie zawodowe (reverse chronological)
   - Stanowisko, firma, okres
   - 2-4 punkty na stanowisko: konkretne projekty, metryki, wpływ

4. Projekty / Portfolio
   - Link do GitHuba z opisem
   - Krótki opis: co, jak, dowody

5. Wykształcenie i certyfikaty (opcjonalnie)
```

### Przykładowy opis stanowiska

**Źle:**
```
Tester automatyczny
- Pisałem testy w Playwright
- Używałem API
- Pracowałem w Scrumie
```

**Dobrze:**
```
Tester automatyczny (Playwright + API + CI/CD)
Firma X | Styczeń 2023 — obecnie

W zespole 5-osobowym odpowiadałem za automatyzację testów E2E dla aplikacji SaaS 
(50 000 użytkowników, 120+ testów, ~25 min regresji).

**Co osiągnąłem:**
- Zmniejszyłem czas regresji o 55% (z 45 do 20 min) przez parallelizację testów 
  Playwright (sharding 4 workerów) i refaktoryzację fikstur danych
- Wdrożyłem testy API (APIRequestContext) jako alternatywę dla setupu przez UI, 
  skracając czas przygotowania danych z ~4s do ~100ms na test
- Wprowadziłem raportowanie HTML + JUnit w GitHub Actions, publikując raporty 
  jako artefakty przy każdym PR
- Napisałem 8 niestabilnych testów (flaky), analizując trace i video, 
  identyfikując race conditions i źle dobrane waitFor; po naprawie pass rate 
  wzrósł z 94% do 99.5%
- Skonfigurowałem cleanup danych testowych przez bezpośredni dostęp do bazy 
  PostgreSQL, eliminując zanieczyszczenie środowiska testowego

**Stack:** Playwright, TypeScript, PostgreSQL, Docker, GitHub Actions, APIRequestContext
```

### Formatowanie CV

Format ma znaczenie. Używaj:

- **Metrici:** Liczby, procenty, czasy — wszystko, co można zweryfikować
- **Akcjiowników:** „zwiększyłem", „wdrożyłem", „zidentyfikowałem", „optymalizowałem"
- **Kontekstu:** „w zespole 5-osobowym", „dla aplikacji z 50 000 użytkowników"
- **Technicznej precyzji:** Nazwy narzędzi, wzorców, terminów — pokazuj głębię

Unikaj:

- Ogólników: „testowałem różne funkcjonalności"
- Zbędnych szczegółów: „kliknąłem przycisk o nazwie 'Zapisz'"
- Zdawkowych list: same czasowniki bez kontekstu

---

## 3. LinkedIn — krótki opis projektu

LinkedIn to nie CV — to pierwszy kontakt. Opis projektu musi być krótki (2-3 zdania), konkretny i zachęcający do kliknięcia linka do portfolio.

### Format opisu projektu

```markdown
🎯 Testowałem aplikację SaaS (50 000 użytkowników) od zera do release'u:
- 120+ testów Playwright (UI + API + DB)
- regresja: 45 → 20 min (parallelizacja + sharding)
- raportowanie w GitHub Actions z trace viewer
- stack: Playwright, TypeScript, PostgreSQL, Docker

🔗 Demo: [link do GitHub / raportu HTML]
```

### Co umieścić w opisie About

```
👋 Cześć, jestem [Imię] — tester automatyzacji z 2+ lat doświadczenia w testach E2E.

🤖 Specjalizuję się w Playwright + TypeScript. Buduję frameworki testowe, które 
    nie tylko wykrywają błędy, ale też przyspieszają feedback zespołom 
    deweloperskim.

📊 Ostatni projekt: zmniejszyłem czas regresji z 45 do 20 min przez 
    parallelizację i refaktoryzację fikstur. Raport z testów publikuję 
    jako artefakt w każdym PR.

✅ Moje repozytorium: [link]
   - 120+ testów, 4 warstwy (UI + API + DB + CI)
   - uruchamia się `npm ci && npm run test`
   - README z decyzjami architektonicznymi

🛠️ Stack: Playwright, TypeScript, APIRequestContext, PostgreSQL, GitHub Actions, Docker
```

---

## 4. Narracja do rozmowy technicznej

Podczas rozmowy rekrutacyjnej musisz umieć opowiedzieć o projekcie w sposób ustrukturyzowany. Rekruter ocenia nie tylko wiedzę techniczną, ale też sposób komunikowania problemów, decyzji i kompromisów.

### Struktura narracji o projekcie

**Format: Problem → Analiza → Decyzja → Dowód → Wniosek**

```
„W moim ostatnim projekcie największym wyzwaniem było to, że testy regresji 
trwały 45 minut. To było zbyt długo jak na feedback dla programistów — deadline 
wydania blendował się z wynikami testów.

Przeanalizowałem logi i zobaczyłem, że setup danych (tworzenie użytkowników 
przez UI) zajął ~4 sekundy na test. Przy 60 testach to 4 minuty tylko na setup.

Przetestowałem trzy opcje: setup przez UI (oryginalny), setup przez API 
(APIRequestContext), setup bezpośrednio w bazie (pg). Wybrałem setup przez API 
— 100ms zamiast 4s, przy zachowaniu walidacji kontraktu HTTP.

Po zmianie czas regresji spadł do 28 minut. Dodałem jeszcze parallelizację 
(sharding na 3 workerów) i doszliśmy do 18 minut.

Gdybym dziś robił to inaczej, prawdopodobnie zacząłbym od parallelizacji, 
bo to zmiana jednej linijki w config, a efekt jest większy."
```

### Typowe pytania i odpowiedzi

| Pytanie | Celne odpowiedzi |
|---|---|
| „Jak wybrałeś narzędzia?" | „Analiza ryzyka: jakie błędy chcę wykryć? Gdzie są najdroższe awarie? Od tego odwróciliśmy architekturę." |
| „Co byś zmienił?" | „Dodałbym visual testing na początku, choćby Snapshot comparison. Mam screenshoty jako artefakty, ale bez automatycznej walidacji." |
| „Jak diagnozujesz flaky test?" | „1) Sprawdzam trace — co dokładnie się stało. 2) Analizuję timing — timeout czy race condition? 3) Isolating test — czy pada samodzielnie? 4) Reprodukcja z logami." |
| „Jak dużo testów dodajesz tygodniowo?" | „Zależy od ryzyka. Średnio 3-5 nowych testów na sprint, ale też usuwam 1-2, które są redundantne lub niestabilne." |

---

## 5. Demo wizualne — screenshoty i filmy

Portfolio techniczne powinno zawierać elementy wizualne, które pokazują wyniki bez konieczności uruchamiania kodu.

### Co warto pokazać

**Screenshot raportu HTML Playwright:**
Umieść screenshot z przykładowym wynikiem testów. Pokaż, że raport jest czytelny, zawiera metryki i zrzuty ekranu przy awarii.

**Screenshot trace viewer:**
Trace viewer to najpotężniejsze narzędzie diagnostyczne Playwright. Screenshot z otwartym trace (steps, network, console) pokazuje zaawansowanie.

**Timeline testów:**
Timeline z Playwright Report pokazuje, ile trwa każdy test i gdzie są bottlenecky. To dowód na optymalizację.

**Screenshot z GitHub Actions:**
Pipeline z zielonymi testami, artefaktami i badge'em — pokazuje, że CI działa.

### Formatowanie screenshotów w README

```markdown
## Raporty i demo

### Raport HTML Playwright
Ostatni raport z main branch: [playwright-report/index.html](./playwright-report/index.html)

### Trace viewer — przykładowy test logowania
W przypadku awarii test generuje plik `.zip` z pełnym trace. 
Otwórz w [trace.playwright.dev](https://trace.playwright.dev):
![trace-viewer](docs/screenshots/trace-login.png)

### Pipeline GitHub Actions
![ci-pipeline](docs/screenshots/github-actions.png)
```

---

## 6. Checklisty publikacji portfolio

Przed publikacją portfolio sprawdź każdy z poniższych punktów. To jest Twoja lista kontrolna jakości.

### Checklist README

- [ ] README wyjaśnia cel projektu w jednym zdaniu
- [ ] README zawiera instrukcję uruchomienia od zera (git clone + npm ci + playwright install)
- [ ] README zawiera listę zmiennych środowiskowych z opisem
- [ ] README zawiera tabelę zakresu testów (warstwy, liczba testów, czas)
- [ ] README zawiera sekcję decyzji architektonicznych (co najmniej 3 decyzje z uzasadnieniem)
- [ ] README zawiera sekcję znanych ograniczeń (co najmniej 2 celowe pominięcia)
- [ ] README zawiera link do raportu HTML
- [ ] Badge CI jest aktualny i klikalny

### Checklist CV

- [ ] Każde stanowisko zawiera metryki (procenty, liczby, czasy)
- [ ] Każdy punkt opisuje wpływ, nie tylko działanie
- [ ] Stack techniczny jest konkretny (Playwright, nie „narzędzia do testowania")
- [ ] Portfolio jest podlinkowane z CV
- [ ] CV jest ATS-friendly (bez zbyt wielu kolumn, tabel, obrazków)

### Checklist GitHub

- [ ] Repo ma opis (description) — jedno zdanie o tym, co robi projekt
- [ ] Temat (topic) zawiera: `playwright`, `qa-automation`, `typescript`
- [ ] Branch main jest chroniony (require reviews, require status checks)
- [ ] Commity są opisowe (Conventional Commits)
- [ ] `.gitignore` nie ignoruje plików, które powinny być w repo (np. README.md)
- [ ] Package.json ma poprawne wersje (lock file jest commitowany)
- [ ] Licencja jest wybrana (np. MIT)

### Checklist LinkedIn

- [ ] Banner/profile picture jest profesjonalny
- [ ] About opisuje kompetencje i konkretne projekty
- [ ] Projects section zawiera link do GitHuba
- [ ] Skills są dodane z datą (LinkedIn pokazuje recent skills first)
- [ ] LinkedIn jest spójny z CV (te same lata, te same stanowiska)

---

## Perspektywa Full Stack Testera

Portfolio to rozmowa prowadzona bez Ciebie. README mówi pierwsze, CV mówi kontekst, LinkedIn buduje zaufanie, a rozmowa techniczna potwierdza kompetencje. Każdy z tych elementów musi być spójny: ta sama wersja projektu, te same metryki, te same decyzje. Jedna niespójność podważa całą resztę. Traktuj portfolio jak produkt, który musi przejść QA — zanim wyślesz, sprawdź każdy element.

---

## Podsumowanie

- **README:** Centrum portfolio — cel, instalacja, zakres, decyzje architektoniczne, ograniczenia, raport, CI badge
- **CV:** Efekty i metryki, nie tylko narzędzia — co osiągnąłeś, jak i dlaczego to było wartościowe
- **LinkedIn:** Krótki, konkretny, z linkiem do portfolio — problem, rozwiązanie, stack, dowód
- **Narracja:** Struktura problem → analiza → decyzja → dowód → wniosek — pokazuje dojrzałość techniczną
- **Demo wizualne:** Screenshots raportów, trace, CI pipeline — dowody bez konieczności uruchamiania
- **Checklisty:** README, CV, GitHub, LinkedIn — każdy element przed publikacją przechodzi QA

---

## Linki i źródła

- [GitHub README best practices](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes) — oficjalne wskazówki GitHuba dotyczące README
- [Conventional Commits](https://www.conventionalcommits.org/) — standard nazewnictwa commitów, który podnosi czytelność historii projektu
- [Resume template — GitHub Octicons](https://github.com/resume/resume.github.com) — format CV technicznego
- [LinkedIn Profile Optimization](https://www.linkedin.com/help/linkedin/answer/a1337793) — oficjalne wskazówki LinkedIn dotyczące profilu zawodowego
- [Technical Writing — Google](https://developers.google.com/tech-writing) — kurs technicznego pisania, który pomaga w dokumentacji projektowej
- [Playwright Test Annotations](https://playwright.dev/docs/test-annotations) — jak używać annotations do oznaczania testów w raportach
- [STAR Method — Phenomenal](https://www.usaJOBS.gov/careerplanning/STAR.aspx) — metoda opowiadania o doświadczeniach zawodowych

## 📘 Suplement Inżynieryjny 2026: Portfolio i Egzamin Testera Full Stack
*Inspiracja: „Scalable Test Automation with Playwright” (2026), Chapter 12*
*   **SDET Portfolio Checklist**: Profesjonalne portfolio testera full stack powinno demonstrować znajomość czystego kodu (clean code), zasady SOLID, wzorców projektowych (AOM, POM, Fabryka), automatycznej diagnostyki w CI oraz testów hybrydowych (API + UI).
