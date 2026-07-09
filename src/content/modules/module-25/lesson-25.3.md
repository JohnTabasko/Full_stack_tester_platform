# Docker Compose dla środowisk testowych

> Moduł dwudziesty piąty daje testerowi praktyczny warsztat pracy ze środowiskiem: terminalem, siecią, kontenerami, Kubernetes, sekretami i flagami funkcji. Wiele awarii testów nie wynika z Playwrighta, lecz z infrastruktury i konfiguracji.

## Jak czytać ten moduł

Czytaj ten moduł jak zestaw narzędzi diagnostycznych. Nie chodzi o zostanie administratorem systemów, lecz o umiejętność samodzielnego sprawdzenia, czy aplikacja działa, czy API jest osiągalne, czy kontener jest gotowy, czy sekret istnieje i czy flaga funkcji ma właściwy stan.

Trzy zasady modułu:

1. **Środowisko jest częścią testu.** Jeśli jest niejawne, wynik testu jest niepewny.
2. **Diagnozuj warstwami.** DNS, sieć, proces, kontener, aplikacja, dane i test to różne klasy problemów.
3. **Nie loguj sekretów.** Diagnostyka nie może naruszać bezpieczeństwa.


## Cel lekcji

Ta lekcja koncentruje się na: **uruchamianie aplikacji, baz i zależności, healthchecki, sieci, wolumeny, seedowanie kontenerów i powtarzalność środowiska**. Główne ryzyko: **środowisko testowe jest uruchamiane ręcznie, zależności startują w przypadkowej kolejności, a dane w wolumenach powodują niepowtarzalne wyniki**. Po lekturze powinieneś umieć diagnozować środowisko testowe i odróżniać problem infrastruktury od błędu aplikacji lub testu.

## Sytuacja przewodnia

lokalny smoke test wymaga aplikacji, PostgreSQL, Redis i Mailpit, które mają startować jedną komendą i być gotowe przed testami

## 1. Compose jako opis środowiska

Docker Compose pozwala opisać aplikację i jej zależności w jednym pliku. Dzięki temu środowisko jest łatwiejsze do odtworzenia lokalnie i w CI.

## 2. Healthcheck

depends_on bez healthchecka oznacza tylko, że kontener wystartował, nie że usługa jest gotowa. Testy powinny startować po gotowości zależności.

## 3. Sieci

Kontenery komunikują się po nazwach usług w sieci Compose. To inny model niż localhost na komputerze hosta.

## 4. Wolumeny

Wolumeny przechowują stan. Są przydatne, ale w testach mogą powodować zależność od poprzednich uruchomień, jeśli nie są czyszczone.

## 5. Seedowanie

Seed kontenerów powinien być deterministyczny i idempotentny. Wielokrotne uruchomienie nie powinno psuć środowiska.

## Przykład referencyjny

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: test
      POSTGRES_DB: app_test
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      timeout: 3s
      retries: 20
  mailpit:
    image: axllent/mailpit:latest
    ports: ['8025:8025']
  app:
    build: .
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgres://postgres:test@db:5432/app_test
```

Przykład pokazuje, że diagnostyka środowiska powinna być konkretna: sprawdzamy healthcheck, sieć, konfigurację i stan zależności, zamiast zgadywać przyczynę awarii.

## Lista kontrolna

- Czy umiesz sprawdzić healthcheck aplikacji?
- Czy potrafisz odróżnić błąd DNS, TLS, CORS i cookie?
- Czy kontenery mają healthchecki?
- Czy dane w wolumenach nie zanieczyszczają testów?
- Czy sekrety są poza logami i repozytorium?
- Czy stan flag funkcji jest jawny dla testu?

## Głębsza analiza tematu: SQL

Bezpośredni dostęp do bazy danych w testach Playwright pozwala na:
1. **Weryfikację danych**: Sprawdź czy po rejestracji rekord w tabeli `users` faktycznie powstał.
2. **Setup danych**: Wstaw zamówienie bezpośrednio do bazy, aby od razu przetestować stronę jego szczegółów.
3. **Cleanup**: Usuń użytkownika po teście, aby nie zaśmiecać środowiska.
Używaj bibliotek takich jak `pg` (PostgreSQL) czy `mysql2` wewnątrz swoich testów lub fikstur.
