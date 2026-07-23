# Docker Compose dla środowisk testowych

Docker Compose pozwala uruchomić aplikację i jej zależności w powtarzalny sposób: bazę danych, cache, broker wiadomości, mail server, mocki API, aplikację backendową i frontend. Dla Full Stack Testera to narzędzie do eliminowania problemu „u mnie działa”.

Środowisko testowe jest częścią automatyzacji. Jeśli nie jest wersjonowane, obserwowalne i możliwe do odtworzenia, testy będą niestabilne.

## 1. Podstawowe pojęcia Compose

Compose opisuje usługi w pliku `compose.yml`:

```yaml
services:
  db:
    image: postgres:16
  redis:
    image: redis:7
  api:
    build: .
```

Najważniejsze elementy:

- **services** — kontenery;
- **networks** — sieci między kontenerami;
- **volumes** — trwałe dane;
- **environment** — zmienne środowiskowe;
- **ports** — mapowanie portów na hosta;
- **depends_on** — zależności startu;
- **healthcheck** — gotowość usługi.

## 2. Przykład środowiska testowego

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: test
      POSTGRES_DB: app_test
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d app_test"]
      interval: 5s
      timeout: 3s
      retries: 20

  mailpit:
    image: axllent/mailpit:latest
    ports:
      - "8025:8025"

  api:
    build: .
    environment:
      DATABASE_URL: postgres://app:test@db:5432/app_test
      SMTP_HOST: mailpit
    depends_on:
      db:
        condition: service_healthy
```

Aplikacja w kontenerze `api` łączy się z bazą przez host `db`, nie `localhost`.

## 3. Healthcheck zamiast sleep

Antywzorzec:

```bash
sleep 20
npm test
```

Lepsze: healthcheck w Compose i czekanie na gotowość. Baza może wystartować w 3 sekundy albo 40 sekund. Sleep zawsze będzie albo za długi, albo za krótki.

## 4. Sieci

Compose tworzy domyślną sieć. Usługi widzą się po nazwach:

```text
api -> db:5432
api -> redis:6379
api -> mailpit:1025
```

Jeśli test uruchamiasz na hoście, używa mapowanego portu, np. `localhost:8025`. Jeśli test uruchamiasz w kontenerze, używa nazwy usługi.

## 5. Volumes i czystość danych

W testach często chcesz świeżą bazę. Uważaj na named volumes, bo przechowują dane między uruchomieniami.

Komendy:

```bash
docker compose down -v
docker compose up -d --build
```

`-v` usuwa volumes. Używaj świadomie, aby nie skasować danych potrzebnych do diagnostyki.

## 6. Seed i migracje

Środowisko powinno wykonywać migracje i seed danych referencyjnych:

```bash
npm run db:migrate
npm run db:seed:test
```

Możesz zrobić to w skrypcie CI po `docker compose up` albo jako osobny kontener job.

## 7. Profiles

Profiles pozwalają uruchamiać tylko część usług:

```yaml
services:
  grafana:
    image: grafana/grafana
    profiles: ["observability"]
```

Uruchomienie:

```bash
docker compose --profile observability up -d
```

To przydatne, gdy lokalnie nie zawsze potrzebujesz pełnego stosu.

## 8. Logi i diagnostyka

Przy awarii zbierz:

```bash
docker compose ps
docker compose logs --no-color > compose.log
docker compose logs api
docker compose exec db psql -U app -d app_test
```

Logi Compose powinny być artefaktem CI przy awarii testów integracyjnych.

## 9. Compose w CI

Typowy flow:

```bash
docker compose up -d --build
docker compose ps
npm run db:migrate
npm run test:integration
docker compose logs --no-color > compose.log
docker compose down -v
```

Cleanup w `finally`/`post` jest ważny, aby runner CI nie zostawiał kontenerów.

## 10. Sekrety

Nie wkładaj prawdziwych sekretów do `compose.yml`. Używaj `.env.test`, zmiennych CI albo secret managera. Dane lokalne powinny być testowe i rotowalne.

## 11. Checklista Compose

- Czy każda zależność ma healthcheck?
- Czy baza jest czysta albo świadomie wersjonowana?
- Czy migracje i seed są automatyczne?
- Czy test wie, czy działa na hoście czy w kontenerze?
- Czy logi Compose są zbierane przy awarii?
- Czy sekrety nie są zapisane w repozytorium?
- Czy `docker compose down -v` jest używane świadomie?

## Linki

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Dockerfile Reference](https://docs.docker.com/reference/dockerfile/)
- [Docker Networking](https://docs.docker.com/network/)
- [Playwright Docker](https://playwright.dev/docs/docker)

## 12. Mocki i usługi pomocnicze

Compose świetnie nadaje się do uruchomienia usług pomocniczych:

- Mailpit/MailHog dla emaili;
- WireMock dla zewnętrznych API;
- LocalStack dla usług AWS;
- Redis dla cache;
- Kafka/RabbitMQ dla eventów.

Dzięki temu lokalne testy integracyjne mogą działać bez prawdziwych dostawców.

## 13. Compose override

Możesz mieć bazowy plik i override dla testów:

```bash
docker compose -f compose.yml -f compose.test.yml up -d
```

W override ustawiasz testowe zmienne, inne porty, mniejsze zasoby albo mocki. To utrzymuje konfigurację produkcyjnie podobną, ale bezpieczną dla testów.

## 14. Zasada końcowa

Compose nie jest tylko narzędziem uruchomienia. Jest wykonywalną dokumentacją zależności systemu. Jeśli nowa osoba nie może uruchomić testowego środowiska jedną komendą, automatyzacja nie jest kompletna.

## 15. Czekanie na aplikację

Aplikacja może wystartować jako proces, ale nie być gotowa. Dodaj endpoint health i sprawdzaj go przed testami:

```bash
until curl -f http://localhost:3000/health; do sleep 1; done
```

To nadal pętla, ale czeka na stan, nie na arbitralny czas.

## 16. Deterministyczność obrazów

Nie używaj bezmyślnie `latest` dla krytycznych zależności. Obraz `postgres:latest` może zmienić wersję i zachowanie. Preferuj konkretne wersje, np. `postgres:16`, i aktualizuj je świadomie.

## 17. Zasada końcowa

Dobre środowisko Compose jest małe, szybkie, opisane i możliwe do usunięcia bez żalu. Jeśli boisz się wykonać `down -v`, dane testowe nie są dobrze zaprojektowane.

## 18. Compose a testy równoległe

Jeśli kilka pipeline’ów uruchamia Compose na jednej maszynie, porty mogą kolidować. Rozwiązania: dynamiczne porty, osobne project name przez `COMPOSE_PROJECT_NAME`, albo osobne runnery. Dane również muszą być izolowane, np. osobna baza lub `runId`.

## 📘 Suplement Inżynieryjny 2026: Podstawy DevOps i Środowiska Testowe
*Inspiracja: „Scalable Test Automation with Playwright” (2026), Chapter 9*
*   **Docker Compose Hygiene**: Do każdego uruchomienia testów w CI podnoś odizolowane, świeże środowisko kontenerowe za pomocą Docker Compose, co wyeliminuje problem "brudnych" danych pozostawionych przez wcześniejsze wdrożenia.
