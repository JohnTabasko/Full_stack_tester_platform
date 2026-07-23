# Playwright w Dockerze — spójne środowiska dla lokalnej pracy i CI

> **Perspektywa Full Stack Testera**
> "U mnie działa" to najczęstszy problem w komunikacji tester ↔ programista ↔ DevOps. Programista na MacBooku ma Inne czcionki, inne sterowniki GPU, inną wersję systemu operacyjnego niż runner CI na Ubuntu. Rezultat: test przechodzi lokalnie, pada na CI. Rozwiązaniem jest Docker — technologia konteneryzacji, która zamyka całe środowisko testowe (system operacyjny, Node.js, Playwright, przeglądarki, fonty) w jeden niezależny obraz. Dzięki temu środowisko jest identyczne u Ciebie, u kolegi, na laptopie developera i na serwerze CI — zero rozbieżności.

## Cel lekcji

Po ukończeniu tej lekcji rozumiesz architekturę konteneryzacji (obrazy, kontenery, Dockerfile, Docker Compose), potrafisz skonfigurować obraz Docker dla projektu Playwright, konfigurujesz Docker Compose dla kompleksowego środowiska testowego (app + testy), rozumiesz znaczenie `--ipc=host` i innych flag dla Playwright, konfigurujesz testy wizualne w Dockerze, integrujesz Docker z GitHub Actions CI, i znasz techniki debugowania testów w kontenerze.

---

## Dlaczego Playwright + Docker?

### Problem rozbieżności środowisk

Lokalny laptop developera:
```
macOS Sonoma 14.4
Chrome 124.0
Fonty: San Francisco, Helvetica
Sterownik GPU: Apple M3
```

GitHub Actions Runner:
```
Ubuntu 22.04 LTS
Chrome 124.0 (z oficjalnego obrazu Playwright)
Fonty: Ubuntu, DejaVu Sans
Sterownik GPU: brak (headless)
```

Różnice w fontach, GPU, systemie operacyjnym powodują:
- Różne rendering kolorów (CSS rastra się różni)
- Różne wymiary layoutu (fonty mają inne metryki)
- Różne zachowanie animacji (GPU rendering vs. software)
- Różne zachowanie wideo (kodeki systemowe)

Rezultat: screenshot test przechodzi lokalnie, pada na CI.

### Rozwiązanie: Docker jako izolator

Docker uruchamia testy w identycznym środowisku niezależnie od hosta:
```
┌─────────────────────────────────────────────┐
│  Laptop Developera (macOS/Windows/Linux)     │
│  ┌─────────────────────────────────────┐    │
│  │  Docker Container (Ubuntu + Playwright) │   │
│  │  - Ubuntu 22.04 LTS                  │    │
│  │  - Node.js 22                        │    │
│  │  - Playwright 1.45                   │    │
│  │  - Chromium (ze standardowymi fontami)│   │
│  │  - Wszystkie testy uruchamiane tutaj  │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  GitHub Actions Runner (Ubuntu)              │
│  ┌─────────────────────────────────────┐    │
│  │  Docker Container (Ubuntu + Playwright) │   │
│  │  - Ubuntu 22.04 LTS                  │    │
│  │  - Node.js 22                        │    │
│  │  - Playwright 1.45                   │    │
│  │  - Chromium (ze standardowymi fontami)│   │
│  │  - IDENTYCZNE środowisko jak lokalnie │   │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

---

## Oficjalny obraz Playwright

### Użycie bez Dockerfile

```bash
# Uruchomienie interaktywnej sesji z obrazem Playwright
docker run -it --rm \
  --ipc=host \
  mcr.microsoft.com/playwright:v1.45.0-jammy \
  /bin/bash

# Wewnątrz kontenera:
# node --version  → v20.x
# npx playwright --version  → 1.45.0
# chromium-browser → dostępny

# Uruchomienie testów bezpośrednio w kontenerze
docker run -it --rm \
  --ipc=host \
  -v $(pwd):/app \
  -w /app \
  mcr.microsoft.com/playwright:v1.45.0-jammy \
  npx playwright test
```

### Dostępne obrazy Microsoft

| Obraz | Opis | Kiedy używać |
|---|---|---|
| `mcr.microsoft.com/playwright:v1.45.0-jammy` | Ubuntu 22.04 + Playwright | Większość przypadków |
| `mcr.microsoft.com/playwright:v1.45.0-focal` | Ubuntu 20.04 + Playwright | Kompatybilność ze starszym systemem |
| `mcr.microsoft.com/playwright:v1.45.0-bionic` | Ubuntu 18.04 + Playwright | Starsze środowiska CI |
| `mcr.microsoft.com/playwright:v1.45.0-jammy-arm64` | Ubuntu ARM64 + Playwright | Apple Silicon (M1/M2/M3) |

---

## Dockerfile dla projektu Playwright

### Pełny Dockerfile

```dockerfile
# ============================================================
# Etap 1: Build — kompilacja i instalacja zależności
# ============================================================
FROM mcr.microsoft.com/playwright:v1.45.0-jammy AS builder

WORKDIR /app

# Skopiuj package.json i package-lock.json OSOBNO
# (Docker cache: warstwa ta nie rebuilduje się przy zmianie kodu)
COPY package*.json ./

# Zainstaluj zależności
RUN npm ci --only=production && \
    npx playwright install-deps chromium && \
    npx playwright install chromium

# Skopiuj resztę kodu
COPY . .

# ============================================================
# Etap 2: Production — minimalne środowisko testowe
# ============================================================
FROM mcr.microsoft.com/playwright:v1.45.0-jammy AS production

WORKDIR /app

# Skopiuj tylko production dependencies i kod
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app .

# Konfiguracja użytkownika (nie uruchamiaj jako root!)
RUN useradd -m playwright && \
    chown -R playwright:playwright /app
USER playwright

# Domyślne polecenie: uruchom testy
CMD ["npx", "playwright", "test", "--reporter=html"]
```

### Multi-stage build — dlaczego warto?

```dockerfile
# ❌ Prosty Dockerfile — wszystko w jednym etapie
FROM mcr.microsoft.com/playwright:v1.45.0-jammy
COPY . .
RUN npm ci
CMD ["npx", "playwright", "test"]

# Problem: obraz waży ~3GB (zależności dev + dev tools)
# Przy zmianie kodu (COPY . .) cały RUN npm ci się rebuilduje

# ✅ Multi-stage: obraz produkcyjny waży ~800MB
# Etap builder: wszystko do budowy (3GB)
# Etap production: tylko to, co potrzebne do uruchomienia (800MB)
```

### .dockerignore — przyspieszenie builda

```dockerfile
# .dockerignore
# Wyklucz wszystko, co nie jest potrzebne do testów

# System
.git
.gitignore

# Artefakty
node_modules/
test-results/
playwright-report/
trace-results/

# Konfiguracja (niepotrzebna w obrazie)
.env
.env.local
.env.*.local

# Pliki deweloperskie
*.md
tsconfig.json
eslint.config.mjs
prettier.config.js

# Niepotrzebne pliki
.DS_Store
Thumbs.db
*.log
```

---

## Docker Compose dla kompleksowego środowiska

### docker-compose.yml — testy + aplikacja

```yaml
version: '3.9'

services:
  # ============================================================
  # Aplikacja frontendowa (Twój projekt)
  # ============================================================
  app:
    build:
      context: .
      dockerfile: Dockerfile.app  # Dockerfile aplikacji
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=test
      - DATABASE_URL=postgresql://test:test@db:5432/test_db
      - API_URL=http://localhost:3000
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 5s
      timeout: 3s
      retries: 5

  # ============================================================
  # baza danych PostgreSQL (dla testów)
  # ============================================================
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: test_db
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./scripts/seed-test-db.sql:/docker-entrypoint-initdb.d/01-seed.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U test"]
      interval: 5s
      timeout: 3s
      retries: 5

  # ============================================================
  # Redis (cache, sesje)
  # ============================================================
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # ============================================================
  # Playwright — test runner
  # ============================================================
  playwright:
    build:
      context: .
      dockerfile: Dockerfile.tests
    depends_on:
      app:
        condition: service_healthy
    environment:
      - BASE_URL=http://app:3000
      - DATABASE_URL=postgresql://test:test@db:5432/test_db
      - CI=true
    volumes:
      - ./test-results:/app/test-results
      - ./playwright-report:/app/playwright-report
    command: npx playwright test --reporter=list --project=chromium

volumes:
  pgdata:
```

### Skrypt uruchomieniowy

```bash
#!/bin/bash
# scripts/run-tests.sh

set -e

echo "=== Budowanie obrazów Docker ==="
docker-compose build

echo "=== Uruchamianie środowiska ==="
docker-compose up -d db redis app

echo "=== Czekanie na gotowość app ==="
docker-compose exec -T app sh -c 'until curl -sf http://localhost:3000/health; do echo "Czekam na app..."; sleep 2; done'

echo "=== Uruchamianie testów ==="
docker-compose run --rm playwright

echo "=== Sprzątanie ==="
docker-compose down --volumes

echo "=== Testy zakończone ==="
```

---

## Krytyczne flagi Playwright w Dockerze

### --ipc=host — udostępnienie pamięci współdzielonej

```bash
# ⚠️ KLUCZOWA FLAGA — bez niej Chromium pada z błędami pamięci!
docker run --ipc=host mcr.microsoft.com/playwright:v1.45.0-jammy

# Dlaczego?
# Kontenery Docker domyślnie izolują IPC (inter-process communication).
# Playwright (Chromium) używa Shared Memory (shm) do komunikacji
# między procesami (renderer, GPU process, network process).
# Bez --ipc=host → "Out of Memory" lub crash Chromium!
```

### Inne ważne flagi

```bash
docker run \
  --ipc=host \                        # Shared Memory dla Chromium
  --shm-size=2g \                     # Rozszerz Shared Memory do 2GB (domyślnie 64MB)
  --ulimit memlock=-1:-1 \            # Brak limitów na pamięć (Memory Lock)
  --cap-add=SYS_ADMIN \               # Dostęp do systemowych zasobów (opcjonalne)
  -v /dev/shm:/dev/shm \              # Montuj /dev/shm hosta do kontenera
  mcr.microsoft.com/playwright:v1.45.0-jammy \
  npx playwright test
```

### Konfiguracja w docker-compose

```yaml
services:
  playwright:
    build: .
    ipc: host           # Włącz IPC
    shm_size: '2gb'     # Rozszerz Shared Memory
    ulimits:
      memlock: -1       # Brak limitów na pamięć
```

---

## Integracja z GitHub Actions

### Pełny workflow z Dockerem

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests (Docker)

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build Docker images
        run: docker-compose build

      - name: Start infrastructure (DB, Redis, App)
        run: docker-compose up -d db redis app

      - name: Wait for app health
        run: |
          echo "Waiting for app to be healthy..."
          for i in {1..30}; do
            curl -sf http://localhost:3000/health && break
            echo "Attempt $i failed, retrying..."
            sleep 2
          done

      - name: Run Playwright tests
        run: docker-compose run --rm playwright

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-results-${{ github.run_id }}
          path: |
            test-results/
            playwright-report/
          retention-days: 30

      - name: Upload Trace on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-trace-${{ github.run_id }}
          path: test-results/**/trace.zip
          retention-days: 7

      - name: Cleanup
        if: always()
        run: docker-compose down -v
```

### Optymalizacja: Build cache

```yaml
- name: Build Docker with cache
  uses: docker/build-push-action@v5
  with:
    context: .
    push: false
    tags: playwright-tests:latest
    cache-from: type=gha   # GitHub Actions cache
    cache-to: type=gha,mode=max
```

---

## Debugowanie testów w Dockerze

### Tryb interaktywny

```bash
# Uruchom interaktywną sesję z testami
docker run -it --rm \
  --ipc=host \
  -v $(pwd):/app \
  -w /app \
  mcr.microsoft.com/playwright:v1.45.0-jammy \
  /bin/bash

# Wewnątrz kontenera:
# npx playwright test --ui   # UI Mode
# npx playwright test --debug  # Debug mode
```

### Debug z VS Code (Remote Container)

```json
// .devcontainer/devcontainer.json
{
  "name": "Playwright Test Environment",
  "image": "mcr.microsoft.com/playwright:v1.45.0-jammy",
  "features": {
    "docker-from-docker": {}
  },
  "forwardPorts": [9222],
  "postCreateCommand": "npx playwright install --with-deps chromium"
}
```

### Logi kontenera przy awarii

```bash
# Zobacz logi kontenera
docker-compose logs playwright

# Śledź logi w czasie rzeczywistym
docker-compose logs -f playwright

# Wejdź do działającego kontenera
docker-compose exec playwright /bin/bash

# Zobacz, jakie procesy działają w kontenerze
docker-compose exec playwright ps aux
```

---

## Testy wizualne w Dockerze — eliminacja rozbieżności

### Problem: screenshot różni się na różnych systemach

Screenshots z Mac (font San Francisco) vs. Ubuntu (font Ubuntu) → różne piksele → test pada mimo, że strona wygląda identycznie!

### Rozwiązanie: Docker gwarantuje identyczność

```bash
# Lokalnie na Mac:
docker run --ipc=host \
  -v $(pwd):/app \
  -w /app \
  mcr.microsoft.com/playwright:v1.45.0-jammy \
  npx playwright test --update-snapshots

# Na CI (Ubuntu):
docker run --ipc=host \
  -v $(pwd):/app \
  -w /app \
  mcr.microsoft.com/playwright:v1.45.0-jammy \
  npx playwright test

# Wynik: te same fonty, te same screenshoty, zero false positives
```

---

## Podsumowanie

1. **Problem rozbieżności środowisk**: "U mnie działa" — rozwiązuje Docker.
2. **Obrazy Microsoft**: `mcr.microsoft.com/playwright:v1.45.0-jammy` (i warianty).
3. **Dockerfile**: Multi-stage build, .dockerignore, optymalizacja rozmiaru.
4. **Docker Compose**: Kompleksowe środowisko (app + db + redis + tests).
5. **Flagi krytyczne**: `--ipc=host`, `--shm-size=2gb`, `--ulimit memlock=-1`.
6. **CI/CD**: GitHub Actions z Docker Compose i artifact upload.
7. **Debugowanie**: Interaktywna sesja, VS Code Remote Container, logi.

---

## Linki i źródła

- [Playwright Docker Guide](https://playwright.dev/docs/docker)
- [Official Playwright Images on Docker Hub](https://hub.docker.com/_/microsoft-playwright)
- [Docker Best Practices for Playwright](https://playwright.dev/docs/docker#best-practices)
- [Playwright in CI — GitHub Actions](https://playwright.dev/docs/ci)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 📘 Suplement Inżynieryjny 2026: Środowiska Specjalistyczne (Multi-Tenant Isolation)
*Inspiracja: „Scalable Test Automation with Playwright” (2026), Chapter 11*
*   **Multi-Tenant Isolation**: W środowiskach specjalistycznych dbaj o to, aby każdy worker operował na niezależnym podmiocie (tenant) lub wydzielonej strukturze danych, co wyeliminuje anomalie współbieżności.
