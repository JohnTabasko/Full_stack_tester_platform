# Wiersz poleceń i Bash dla Testera — kompletny przewodnik

> **Perspektywa Full Stack Testera**
> Systemy CI/CD (GitHub Actions, GitLab CI, Jenkins, CircleCI) działają prawie wyłącznie na systemach Linux. Twój kod testowy, Dockerfile, skrypty deploymentowe i konfiguracja pipeline'u — wszystko to żyje w terminalu. Jeśli nie rozumiesz podstaw konsoli, nie będziesz w stanie: skonfigurować środowiska testowego od zera, zdiagnozować problemu gdy test pada na serwerze CI (a nie u Ciebie), napisać automatycznego skryptu cleanupu, czy efektywnie monitorować logi aplikacji. Konsola to narzędzie, które czyni Cię niezależnym od gotowych rozwiązań — a w świecie DevOps/TestOps to bezcenna umiejętność.

## Cel lekcji

Po ukończeniu tej lekcji potrafisz nawigować po systemie plików z poziomu terminala, rozumiesz mechanizm uprawnień i użytkowników w Linuxie, znasz techniki wyszukiwania i przetwarzania tekstu (grep, awk, sed), umiesz zarządzać procesami i portami, rozumiesz zmienne środowiskowe i potrafisz je konfigurować, potrafisz pisać skrypty bash do automatyzacji powtarzalnych zadań, i wiesz, jak diagnozować problemy sieciowe i środowiskowe.

---

## Wprowadzenie: Dlaczego tester musi znać konsolę

### Środowisko CI a środowisko lokalne

Lokalnie możesz uruchamiać testy przez VS Code, klikając przycisk "Debug". Na CI (GitHub Actions, GitLab, Jenkins) nie ma GUI. Jest tylko terminal:

```
GitHub Actions Runner (Ubuntu 22.04)
├── Przeglądarki (Chromium/Firefox/WebKit) — zainstalowane w kontenerze
├── Node.js + npm — środowisko uruchomieniowe
├── Playwright — test runner
└── Twój kod testowy
    └── Dostęp TYLKO przez terminal / skrypty
```

Gdy test padnie na CI, nie masz dostępu do okna przeglądarki. Masz tylko logi tekstowe. Umiejętność czytania tych logów, przeszukiwania ich i wyciągania wniosków — to wszystko zaczyna się od biegłości w konsoli.

### Typowe scenariusze wymagające konsoli

| Scenariusz | Co musisz zrobić | Polecenie |
|---|---|---|
| Test zawiśnie na porcie 3000 | Znajdź i zabij proces | `lsof -i :3000 && kill -9 <PID>` |
| Logi CI są zbyt długie | Wyciągnij tylko błędy | `grep "Error" ci.log` |
| Pliki tymczasowe z testów | Wyczyść przed commitem | `rm -rf test-results/` |
| Zmienna środowiskowa w testach | Przekaż sekret do Playwrighta | `export API_KEY=xyz && npx playwright test` |
| Sprawdź wersję Node.js | Zweryfikuj środowisko | `node --version && npm --version` |
| Obrazy Docker nie wczytują się | Sprawdź logi kontenera | `docker logs <container_id>` |

---

## Nawigacja i zarządzanie plikami

### Podstawowe polecenia nawigacyjne

```bash
# Gdzie jestem?
pwd   # Print Working Directory — wypisz aktualną ścieżkę

# Lista plików i katalogów
ls                     # Prosta lista
ls -la                 # Lista szczegółowa (ukryte pliki, uprawnienia, rozmiar)
ls -lh                 # Lista z czytelnymi rozmiarami (KB, MB)
ls -lt                 # Lista posortowana po dacie modyfikacji (najnowsze na górze)
ls -la /home/user/app  # Lista plików w określonym katalogu

# Zmiana katalogu
cd /home/user/app                # Przejdź do określonej ścieżki (bezwzględna)
cd ./playwright-learning-platform # Przejdź do podkatalogu (relatywna)
cd ..                            # Idź do katalogu nadrzędnego
cd ~                             # Idź do katalogu domowego użytkownika
cd -                             # Wróć do poprzedniego katalogu

# Skróty
~    # Katalog domowy użytkownika (np. /root, /home/user)
..   # Katalog nadrzędny
.    # Aktualny katalog
```

### Tworzenie, kopiowanie, usuwanie

```bash
# Tworzenie katalogów
mkdir test-reports               # Stwórz jeden katalog
mkdir -p tests/e2e/checkout      # Stwórz zagnieżdżone katalogi (--parents)

# Tworzenie plików
touch README.md                  # Stwórz pusty plik
touch playwright.config.ts       # Stwórz plik konfiguracyjny
echo "Hello" > greeting.txt      # Stwórz plik z zawartością

# Kopiowanie i przenoszenie
cp report.json /tmp/report-backup.json   # Kopiowanie pliku
cp -r ./reports /tmp/                     # Kopiowanie katalogu rekursywnie
mv old-name.txt new-name.txt              # Zmiana nazwy pliku
mv file.txt /another/directory/           # Przeniesienie pliku

# Usuwanie (ostrożnie!)
rm temp-file.txt              # Usuń pojedynczy plik
rm -rf ./test-results/        # Usuń katalog rekursywnie i bez pytania (force)
rm -i *.log                   # Usuń z potwierdzeniem (-i = interactive)
```

### Uprawnienia plików — krytyczna wiedza dla CI

```bash
# Sprawdzenie uprawnień
ls -la
# Wynik: -rwxr-xr-- 1 user group 4096 Jun 23 10:30 script.sh
# Struktura: [type][owner][group][others] [links] [owner] [group] [size] [date] [name]

# Typ: - (plik), d (katalog), l (link symboliczny)
# Uprawnienia: r (read=4), w (write=2), x (execute=1)
# Kolejność: owner | group | others

# Przykłady:
# -rwxr-xr-x  = rwx (7) dla owner, r-x (5) dla group, r-x (5) dla others
# -rw-r--r--  = rw- (6) dla owner, r-- (4) dla group, r-- (4) dla others
# drwxr-x---  = rwx (7) dla owner, r-x (5) dla group, --- (0) dla others

# Zmiana uprawnień
chmod 755 script.sh            # Ustaw rwxr-xr-x (standard dla skryptów)
chmod +x run-tests.sh          # Dodaj execute (+x) dla wszystkich
chmod 644 config.json          # Ustaw rw-r--r-- (tylko owner może pisać)
chmod 600 .env                 # Ustaw rw------- (tylko owner, sekretne pliki)

# Zmiana właściciela
chown user:group file.txt      # Zmień właściciela pliku
chown -R user:group ./reports  # Zmień rekursywnie dla katalogu
```

**DLACZEGO TO WAŻNE**: W CI, jeśli Twój skrypt `run-tests.sh` nie ma bitu execute (`chmod +x`), pipeline rzuci błąd "Permission denied" mimo, że plik istnieje.

---

## Praca z tekstem i plikami logów

### Podstawowe operacje na plikach

```bash
# Wyświetlenie zawartości pliku
cat playwright-report/summary.txt         # Wypisz cały plik
head -n 20 ci.log                         # Pierwsze 20 linii pliku
tail -n 50 ci.log                         # Ostatnie 50 linii pliku
tail -f app.log                           # Podgląd logów w czasie rzeczywistym (follow)
wc -l test-results/**/*.spec.ts           # Policz linie w plikach

# Przeszukiwanie plików (grep)
grep "ERROR" ci.log                       # Wyszukaj wszystkie linie ze słowem "ERROR"
grep -n "TimeoutError" ci.log             # Z numerami linii (-n)
grep -i "payment" ci.log                  # Ignoruj wielkość liter (-i)
grep -r "FAILED" ./test-results/          # Rekurencyjnie w katalogu (-r)
grep "Error" ci.log | head -n 10          # Pierwsze 10 błędów
grep "Error" ci.log | wc -l               # Policz wystąpienia błędów
grep -E "ERROR|WARN|CRITICAL" ci.log      # Wyszukaj wiele wzorców (regex)
grep "2024-06-23" ci.log                  # Wyszukaj datę (konkretny день)
```

### Zaawansowane przetwarzanie tekstu

```bash
# awk — wyciąganie kolumn
cat ci.log | awk '{print $1, $4}'              # Wypisz kolumnę 1 i 4
cat ci.log | awk '/ERROR/ {print $2}'          # Z kolumny 2 w liniach z ERROR
# Przykład: "2024-06-23 10:30:15 ERROR Test failed at step 3"
# awk '{print $1, $4}' → "2024-06-23 ERROR"

# sed — zamiana i edycja
sed 's/old/new/g' file.txt                     # Zamień "old" na "new" globalnie
sed -n '10,20p' file.txt                       # Wypisz linie 10-20
sed '/^$/d' file.txt                           # Usuń puste linie
sed 's/[[:space:]]*$//' file.txt               # Usuń białe znaki na końcu linii

# sort + uniq — sortowanie i unikalność
cat errors.log | sort | uniq -c | sort -rn     # Zlicz unikalne błędy, posortuj po częstości

# cut — wycinanie kolumn
cat users.csv | cut -d',' -f1,3               # Wyciągnij kolumny 1 i 3 (separatory: przecinek)
echo "user1,user2,user3" | cut -d',' -f2      # Wynik: "user2"

# tee — zapisz i wyświetl jednocześnie
npm test 2>&1 | tee test-output.log           # Zapisz output do pliku I wyświetl na ekranie
```

### Przykład realny: Analiza logów CI

```bash
# Scenariusz: Testy padły na CI. Masz plik ci.log (5000 linii). Znajdź problem.

# 1. Zobacz, czy w ogóle są błędy
grep -c "FAILED\|ERROR" ci.log
# Wynik: 15

# 2. Wyciągnij tylko linie z błędami
grep -n "FAILED\|ERROR" ci.log > errors-only.log

# 3. Zobacz ostatnie 10 błędów (najczęściej ostatni = najważniejszy)
tail -n 10 errors-only.log

# 4. Dla każdego błędu znajdź timestamp (kiedy się zaczął)
grep -B 5 "FAILED" ci.log                     # 5 linii PRZED błędem (context)

# 5. Znajdź correlation ID błędu (jeśli jest)
grep -o "[a-f0-9-]\{36\}" errors-only.log      # UUID pattern

# 6. Podsumowanie
echo "=== Podsumowanie błędów CI ==="
echo "Całkowita liczba błędów: $(grep -c 'FAILED' ci.log)"
echo "Błąd TimeoutError: $(grep -c 'TimeoutError' ci.log)"
echo "Błąd 500: $(grep -c '500\|Internal Server Error' ci.log)"
```

---

## Zarządzanie procesami

### Podstawowe polecenia procesów

```bash
# Kto jest aktywny?
ps aux                           # Wszystkie procesy (szczegółowe)
ps aux | grep node               # Procesy Node.js
ps aux | grep -i playwright      # Procesy Playwright
ps aux | grep -v grep | grep npm # Wszystkie procesy npm (wykluczając grep)

# Format wyjścia ps aux:
# USER   PID   %CPU   %MEM   VSZ    RSS   TTY   STAT   START   TIME   COMMAND
# user   1234  0.1    0.5    1024   512   pts/0 S      10:30   0:00   node index.js

# top / htop — monitorowanie zasobów
top                              # Interaktywny monitor procesów (naciśnij q aby wyjść)
htop                             # Lepszy interaktywny monitor (kolorowy,sortowalny)
top -o %CPU                      # Sortuj po CPU
top -o %MEM                      # Sortuj po pamięci
```

### Zarządzanie procesami Playwright

```bash
# Problem: Test zawiśnie i zablokuje port 3000

# Krok 1: Sprawdź, co działa na porcie 3000
lsof -i :3000
# Wynik:
# COMMAND  PID    USER   FD   TYPE   DEVICE   SIZE/OFF   NODE NAME
# node     12345  user   21u  IPv4   12345    0t0        TCP *:3000 (LISTEN)

# Krok 2: Zabij proces
kill -9 12345           # Wymuszone zamknięcie (SIGKILL)
# lub
kill 12345              # Gracious zamknięcie (SIGTERM)

# Jeśli proces nie chce się zamknąć:
kill -15 12345          # SIGTERM
sleep 2
kill -9 12345           # Wymuś jeśli nadal działa

# Krok 3: Zweryfikuj, że port jest wolny
lsof -i :3000           # Nic nie powinno być wyświetlone

# Wszystko w jednej linii (często używane jako cleanup skrypt)
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
# Wyjaśnienie: lsof -ti :3000 → PID procesu na porcie 3000
# xargs kill -9 → zabij ten PID
# 2>/dev/null → ukryj błędy, jeśli port był pusty
# || true → zawsze zakończ sukcesem
```

### Automatyczny cleanup przy starcie testów

```bash
# Skrypt cleanup przed uruchomieniem testów (częsty w CI)
#!/bin/bash

echo "=== Czyszczenie środowiska przed testami ==="

# 1. Zabij zalegające procesy Playwright
pkill -f playwright || true
pkill -f chromium || true
echo "✓ Procesy Playwright zabite"

# 2. Zwolnij porty
for port in 3000 3001 3002 8080; do
  pid=$(lsof -ti :$port)
  if [ -n "$pid" ]; then
    echo "✓ Zwalnianie portu $port (PID: $pid)"
    kill -9 $pid 2>/dev/null || true
  fi
done

# 3. Wyczyść artefakty z poprzednich uruchomień
rm -rf test-results/ playwright-report/ trace-results/
echo "✓ Artefakty wyczyszczone"

# 4. Ustaw zmienne środowiskowe
export BASE_URL="${BASE_URL:-http://localhost:3000}"
export NODE_ENV="${NODE_ENV:-test}"
echo "✓ Zmienne środowiskowe ustawione"

echo "=== Środowisko gotowe ==="
```

---

## Zmienne środowiskowe (Environment Variables)

### Podstawowa praca ze zmiennymi

```bash
# Definiowanie zmiennej (lokalna dla sesji)
export BASE_URL="https://staging.mojaaplikacja.pl"
export API_KEY="sk_test_abc123xyz"

# Odczyt zmiennej
echo $BASE_URL
echo $API_KEY

# Usunięcie zmiennej
unset BASE_URL

# Lista wszystkich zmiennych środowiskowych
env
printenv

# Filtrowanie listy
env | grep "^NODE"
env | grep "^API"
```

### Zmienne środowiskowe w Playwright

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    // BASE_URL z env lub domyślna wartość
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
  },
  
  // Przekaż zmienne do testów przez project.use
  projects: [
    {
      name: 'staging',
      use: {
        baseURL: process.env.STAGING_URL,
        extraHTTPHeaders: {
          'X-API-Key': process.env.API_KEY ?? '',
        },
      },
    },
  ],
});
```

```bash
# Uruchomienie testów ze zmiennymi
BASE_URL=https://staging.mojaaplikacja.pl \
API_KEY=sk_test_xyz \
npx playwright test --project=staging

# Lub eksportuj najpierw
export BASE_URL=https://staging.mojaaplikacja.pl
export API_KEY=sk_test_xyz
npx playwright test
```

### Bezpieczne przekazywanie sekretów

```bash
# ❌ Nigdy nie commituj prawdziwych sekretów do repozytorium!
# Plik .env z "API_KEY=sk_live_xyz" w Git = katastrofa

# ✅ Używaj .env.example (bez wartości)
cat > .env.example << 'EOF'
# API Configuration
API_KEY=your_api_key_here
BASE_URL=https://your-url.com
DATABASE_URL=postgres://user:pass@host:5432/db

# Test Configuration  
TEST_USER_EMAIL=test@example.pl
TEST_USER_PASSWORD=change_me
EOF

# ✅ W CI używaj Secrets (GitHub: Settings → Secrets and variables)
# W GitHub Actions:
# steps:
#   - run: npx playwright test
#     env:
#       API_KEY: \${{ secrets.API_KEY }}
#       BASE_URL: \${{ secrets.STAGING_URL }}

# ✅ Na lokalnej maszynie używaj .env.local (w .gitignore)
cat > .env.local << 'EOF'
API_KEY=sk_test_xyz
BASE_URL=http://localhost:3000
EOF
```

---

## Automatyzacja powtarzalnych zadań — skrypty Bash

### Pierwszy skrypt: run-smoke.sh

```bash
#!/bin/bash
# run-smoke.sh — Uruchomienie szybkiej subty testów smoke

set -e  # Exit on error — jeśli jakiekolwiek polecenie zwróci błąd, skrypt się zatrzyma
set -u  # Exit on undefined variable — zmienna musi być zdefiniowana
set -o pipefail  # Fail on pipe error — 'npm test | grep' nie ukryje błędu

echo "=== Smoke Test Suite ==="
echo "Started at: $(date)"

# Cleanup środowiska
echo "[1/4] Czyszczenie artefaktów..."
rm -rf test-results/ playwright-report/
mkdir -p test-results/

# Instalacja zależności (jeśli potrzebna)
echo "[2/4] Sprawdzanie zależności..."
npm list playwright > /dev/null 2>&1 || npm install

# Uruchomienie testów smoke (tag @smoke)
echo "[3/4] Uruchamianie testów smoke..."
npx playwright test --grep "@smoke" --reporter=list || {
  echo "❌ Testy smoke nie przeszły!"
  exit 1  # Zwróć błąd — CI powinien wiedzieć, że coś padło
}

# Generowanie raportu
echo "[4/4] Generowanie raportu..."
npx playwright show-report --port 9323

echo "=== Zakończono ==="
echo "Finished at: $(date)"
```

### Skrypt deploymentu testów na Dockerze

```bash
#!/bin/bash
# deploy-tests.sh — Uruchomienie testów w Dockerze

set -e
set -u

IMAGE_NAME="playwright-tests"
CONTAINER_NAME="playwright-runner"
BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "=== Budowanie obrazu Docker ==="
docker build -t $IMAGE_NAME .

echo "=== Uruchamianie testów w kontenerze ==="
docker run --rm \
  --ipc=host \
  --name $CONTAINER_NAME \
  -e BASE_URL=$BASE_URL \
  -e CI=true \
  -v $(pwd)/test-results:/app/test-results \
  $IMAGE_NAME \
  npx playwright test --reporter=html

echo "=== Testy zakończone ==="
# Skopiuj raport na hosta
docker cp $CONTAINER_NAME:/app/playwright-report ./playwright-report 2>/dev/null || true
```

---

## Diagnostyka sieci i systemu

### Sprawdzanie łączności

```bash
# Czy serwer odpowiada?
curl -s -o /dev/null -w "%{http_code}" https://staging.mojaaplikacja.pl/api/health
# Wynik: 200 (jeśli OK)

# Szczegółowy request
curl -v https://staging.mojaaplikacja.pl/api/health
# -v = verbose — pokazuje wszystkie nagłówki requestu/odpowiedzi

# Sprawdź DNS
nslookup staging.mojaaplikacja.pl

# Ping (sprawdź czy host odpowiada)
ping -c 4 staging.mojaaplikacja.pl

# Traceroute (śledź trasę pakietów)
traceroute staging.mojaaplikacja.pl
```

### Monitorowanie zasobów podczas testów

```bash
# Uruchom testy i monitoruj zasoby w tle
npx playwright test --reporter=list &
TEST_PID=$!

# Monitoruj CPU i RAM co 5 sekund przez 60 sekund
for i in {1..12}; do
  echo "=== Snapshot $i ($(date +%H:%M:%S)) ==="
  top -b -n 1 | grep -E "node|chromium" | head -5
  sleep 5
done

wait $TEST_PID  # Poczekaj na zakończenie testów
```

---

## Perspektywa Full Stack Testera — konsola jako most

Konsola to nie jest "stare narzędzie dla hakerów". To uniwersalny język, którym posługuje się cała infrastruktura IT:
- **CI/CD pipelines** — każdy runner (GitHub, GitLab, Jenkins) to maszyna z terminalem.
- **Docker** — komunikacja z kontenerami odbywa się przez CLI.
- **Kubernetes** — zarządzanie klastrami przez `kubectl`.
- **Cloud providers** — AWS, GCP, Azure — wszystkie mają CLI.
- **Monitoring** — Logi z aplikacji, metryki z Prometheus/Grafana — wszystko jest tekstem w terminalu.

Umiejętność pisania skryptów bash, przeszukiwania logów i zarządzania procesami to kompetencja, która czyni Cię prawdziwym inżynierem DevOps/TestOps, a nie tylko "automatyzatorem testów". Gdy potrafisz samodzielnie zdiagnozować problem na CI, napisać skrypt cleanupu i skonfigurować pipeline — Twoja wartość dla zespołu dramatycznie rośnie.

---

## Podsumowanie

1. **Nawigacja**: `pwd`, `ls`, `cd`, `mkdir`, `cp`, `mv`, `rm`.
2. **Uprawnienia**: `chmod`, `chown` — krytyczne dla skryptów CI.
3. **Praca z tekstem**: `cat`, `grep`, `awk`, `sed`, `head`, `tail`, `sort`, `uniq`.
4. **Zarządzanie procesami**: `ps`, `top`, `lsof`, `kill`, `pkill`.
5. **Zmienne środowiskowe**: `export`, `env`, `unset`, `${VAR:-default}`.
6. **Skrypty bash**: `set -e`, `set -u`, `set -o pipefail`, warunki, pętle.
7. **Diagnostyka sieci**: `curl`, `ping`, `nslookup`, `traceroute`.

---

## Linki i źródła

- [Linux Journey — Free Course](https://linuxjourney.com/)
- [Explainshell — Visualizing Commands](https://explainshell.com/)
- [Bash Scripting Tutorial](https://www.shell-tips.com/bash/)
- [DevHints — Bash Cheat Sheet](https://devhints.io/bash)
- [Shell Command Language — POSIX](https://pubs.opengroup.org/onlinepubs/9699919799/utilities/V3_chap02.html)