# Zaawansowana współbieżność i Sharding w rurociągach CI/CD

Współczesne rurociągi wdrażania oprogramowania (CI/CD Pipelines) wymagają błyskawicznej informacji zwrotnej (Feedback Loop). Uruchamianie kilkuset testów E2E sekwencyjnie na jednej maszynie to marnotrawstwo czasu deweloperów oraz pieniędzy (koszty minut procesora w chmurach CI).

Playwright Test to lider wydajności współbieżnej. Udostępnia zaawansowane mechanizmy sterowania procesami roboczymi (Workers) oraz natywny mechanizm **horyzontalnego skalowania (Sharding)**. W tej lekcji nauczysz się optymalizować i skalować współbieżne wykonanie testów do granic możliwości.

---

## 1. Sterowanie współbieżnością na poziomie projektu

Liczbą procesów roboczych (Workers) sterujemy w pliku `playwright.config.ts`. Ponieważ zasoby procesora na maszynach lokalnych różnią się od maszyn wirtualnych CI, konfiguracja musi być elastyczna:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Lokalnie wykorzystaj 50% rdzeni procesora, a w CI ogranicz do 2, aby uniknąć przeciążenia pamięci
  workers: process.env.CI ? 2 : '50%',
  
  // Wymuś uruchomienie absolutnie każdego testu w osobnym wątku roboczym
  fullyParallel: true,
});
```

---

## 2. Izolacja danych w testach współbieżnych (Concurrency Safety)

Uruchomienie testów w pełnej współbieżności (`fullyParallel: true`) wymaga od inżyniera QA absolutnego przestrzegania zasady **niezależności testów (Test Independence)**.

### Zasada 1: Unikalne Konta Użytkowników
Jeśli dwa testy działające równolegle będą korzystać z tego samego konta (np. logować się jako `admin@sklep.pl`), ich sesje będą się nawzajem wylogowywać. 
*   **Rozwiązanie**: Każdy worker lub test musi operować na odizolowanych kontach testowych (np. generowanych dynamicznie, lub przypisanych do indeksu workera `testInfo.workerIndex`).
    ```typescript
    test('dynamiczny użytkownik per worker', async ({ page }, testInfo) => {
      const email = `test-user-${testInfo.workerIndex}@example.com`;
      // ... test działa na unikalnym koncie!
    });
    ```

### Zasada 2: Odizolowane Dane w Bazie
Unikaj modyfikowania tych samych rekordów (np. edycji tej samej nazwy produktu "Buty Adidas") w różnych testach działających współbieżnie. Zawsze twórz nowe, unikalne rekordy (np. dodając UUID lub timestamp do nazwy produktu).

---

## 3. Sharding: Horyzontalne Skalowanie w CI

Gdy dochodzisz do limitów wydajności pojedynczej maszyny CI (np. 4 wątki to maksimum, a testy wciąż trwają 15 minut), jedyną metodą dalszego przyspieszenia jest **Sharding** (dzielenie suity testów na wiele niezależnych maszyn działających równolegle).

Playwright Test posiada **natywne wsparcie dla shardingu** – nie potrzebujesz żadnych zewnętrznych bibliotek. Podziału dokonuje się prostymi flagami w terminalu:

```bash
# Uruchom pierwszą z trzech części testów (Shard 1 z 3)
npx playwright test --shard=1/3

# Uruchom drugą część testów (Shard 2 z 3)
npx playwright test --shard=2/3

# Uruchom trzecią część testów (Shard 3 z 3)
npx playwright test --shard=3/3
```

Każda maszyna CI uruchomi całkowicie inną, odizolowaną część Twoich testów, skracając czas trwania rurociągu dokładnie trzykrotnie!

---

## 4. Agregacja raportów z wielu Shardów (Blob Reporter)

Podczas korzystania z shardingu, każda maszyna generuje własny fragment raportu. Playwright udostępnia dedykowany reporter **Blob**, który zapisuje wyniki do lekkich plików pośrednich. Następnie, na koniec rurociągu, możemy je scalić w jeden kompletny, piękny raport HTML:

### Krok A: Konfiguracja Blob Reportera w CI
```bash
npx playwright test --shard=1/3 --reporter=blob
```

### Krok B: Scalenie raportów na maszynie głównej
```bash
npx playwright merge-reports --reporter=html ./all-blob-reports
```

---

## 5. Checklista Współbieżności i Shardingu
- [ ] Czy skonfigurowałeś elastyczną liczbę workerów (mniejszą dla CI, większą dla maszyn lokalnych)?
- [ ] Czy upewniłeś się, że testy uruchamiane równolegle nie modyfikują tych samych danych w bazie?
- [ ] Czy wdrożyłeś mechanizm unikalnych nazw (UUID/timestamps) dla tworzonych obiektów testowych?
- [ ] Czy wykorzystujesz mechanizm Shardingu (`--shard=x/n`) w połączeniu z `merge-reports` w rurociągu CI/CD?