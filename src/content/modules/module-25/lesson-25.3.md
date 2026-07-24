# Orkiestracja środowisk kontenerowych: Docker Compose

Podczas testowania złożonych aplikacji (szczególnie w architekturze mikroserwisowej lub zintegrowanych z bazą danych i usługami pocztowymi), testy E2E oraz integracyjne potrzebują pełnego, działającego środowiska systemowego. Ręczne podnoszenie bazy danych, serwerów API i frontendu na komputerze każdego dewelopera oraz serwerze CI prowadzi do chaosu i błędów konfiguracyjnych.

Złotym standardem inżynieryjnym w DevOps i automatyzacji testów jest **orkiestracja odizolowanych, czystych środowisk za pomocą Docker Compose**. W tej lekcji nauczysz się projektować kompletne środowiska testowe podnoszone jedną komendą.

---

## 1. Struktura pliku `docker-compose.yml` klasy produkcyjnej

Plik `docker-compose.yml` pozwala zadeklarować architekturę aplikacji składającą się z wielu współpracujących kontenerów (usług), połączonych wspólną siecią wirtualną:

```yaml
version: '3.8'

services:
  # Usługa 1: Baza danych PostgreSQL
  postgres-db:
    image: postgres:15-alpine
    container_name: test-db-postgres
    environment:
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
      POSTGRES_DB: ecommerce_test
    ports:
      - "5432:5432"
    # Scentralizowany sprawdzian gotowości (Healthcheck)
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U test_user -d ecommerce_test"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Usługa 2: Serwer SMTP Mailpit (SMTP Mock do testów e-maili)
  mailpit:
    image: axllent/mailpit
    container_name: test-mail-catcher
    ports:
      - "1025:1025" # Port SMTP
      - "8025:8025" # Port API i UI
      
  # Usługa 3: Serwer API backendu (Zależy od bazy danych!)
  backend-api:
    image: my-app-backend:latest
    container_name: test-api-server
    environment:
      DATABASE_URL: postgres://test_user:test_password@postgres-db:5432/ecommerce_test
      SMTP_HOST: mailpit
      SMTP_PORT: 1025
    ports:
      - "8080:8080"
    depends_on:
      postgres-db:
        condition: service_healthy # Poczekaj, aż baza przejdzie pomyślnie healthcheck!
```

---

## 2. Rola Healthchecków (Sprawdzanie Gotowości Kontenerów)

Samo zadeklarowanie zależności `depends_on: [postgres-db]` to za mało. Kontener bazy może się uruchomić, ale silnik bazy danych potrzebuje od 2 do 5 sekund na zainicjalizowanie plików na dysku i nasłuchiwanie na porcie. Próba uruchomienia API przed pełną gotowością bazy wywoła błąd połączenia i padnięcie kontenera.

### Prawidłowe rozwiązanie:
Używamy instrukcji `condition: service_healthy` powiązanej z sekcją `healthcheck` w kontenerze bazy danych. Docker Compose podniesie backend API **dopiero w ułamku sekundy, w którym baza PostgreSQL potwierdzi pełną gotowość do przyjmowania zapytań SQL**.

---

## 3. Uruchamianie testów Playwright w odizolowanym kontenerze

W rurociągach CI/CD, możemy uruchomić sam runner Playwright w oficjalnym kontenerze dostarczanym przez Microsoft, który posiada wbudowane i zoptymalizowane przeglądarki wraz ze wszystkimi zależnościami systemowymi:

```bash
# Uruchomienie testów Playwright wewnątrz odizolowanego kontenera Docker
docker run --rm --network=host -v $(pwd):/work/ -w /work/ mcr.microsoft.com/playwright:v1.49.0-jammy npx playwright test
```

### Wyjaśnienie flag:
*   `--network=host`: Pozwala kontenerowi Playwright bez przeszkód komunikować się z usługami uruchomionymi na localhost maszyny (naszym API i Mailpitem).
*   `-v $(pwd):/work/`: Montuje aktualny katalog roboczy do wnętrza kontenera, dając Playwrightowi dostęp do kodu testów i pozwalając zapisać zrzuty i pliki Trace bezpośrednio na dysku hosta.

---

## 4. Checklista Docker Compose
- [ ] Czy wszystkie zależności Twojej aplikacji (baza, API, mocki poczty) są zadeklarowane w jednym pliku `docker-compose.yml`?
- [ ] Czy używasz instrukcji `healthcheck` do weryfikacji rzeczywistej gotowości bazy danych przed uruchomieniem serwerów aplikacji?
- [ ] Czy wolumeny (Volumes) i bazy danych są odizolowane, gwarantując czystość i higienę przy każdym nowym podniesieniu środowiska?
- [ ] Czy w rurociągu CI uruchamiasz testy regresji wizualnej wewnątrz oficjalnego kontenera Docker Playwright?