# Kubernetes, sekrety i flagi funkcji

> Moduł dwudziesty piąty daje testerowi praktyczny warsztat pracy ze środowiskiem: terminalem, siecią, kontenerami, Kubernetes, sekretami i flagami funkcji. Wiele awarii testów nie wynika z Playwrighta, lecz z infrastruktury i konfiguracji.

## Jak czytać ten moduł

Czytaj ten moduł jak zestaw narzędzi diagnostycznych. Nie chodzi o zostanie administratorem systemów, lecz o umiejętność samodzielnego sprawdzenia, czy aplikacja działa, czy API jest osiągalne, czy kontener jest gotowy, czy sekret istnieje i czy flaga funkcji ma właściwy stan.

Trzy zasady modułu:

1. **Środowisko jest częścią testu.** Jeśli jest niejawne, wynik testu jest niepewny.
2. **Diagnozuj warstwami.** DNS, sieć, proces, kontener, aplikacja, dane i test to różne klasy problemów.
3. **Nie loguj sekretów.** Diagnostyka nie może naruszać bezpieczeństwa.


## Cel lekcji

Ta lekcja koncentruje się na: **podstawy Kubernetes, pody, services, config maps, secrets, rollout, środowiska efemeryczne, feature flags i kontrolowane wdrożenia**. Główne ryzyko: **testy działają w nieznanym stanie klastra, używają złej konfiguracji albo nie rozpoznają, że funkcja jest wyłączona flagą**. Po lekturze powinieneś umieć diagnozować środowisko testowe i odróżniać problem infrastruktury od błędu aplikacji lub testu.

## Sytuacja przewodnia

zespół wdraża nową wersję checkoutu do środowiska efemerycznego per pull request i musi sprawdzić rollout, sekrety oraz flagę nowego flow płatności

## 1. Kubernetes dla testera

Tester nie musi administrować klastrem, ale powinien rozumieć podstawowe obiekty: pod, deployment, service, config map, secret i ingress.

## 2. Rollout

Rollout określa, czy nowa wersja została wdrożona poprawnie. Testy nie powinny startować, gdy deployment jest w połowie aktualizacji.

## 3. Sekrety

Sekrety muszą być przechowywane i przekazywane bezpiecznie. Testy nie powinny wypisywać ich w logach ani artefaktach.

## 4. Flagi funkcji

Feature flags zmieniają zachowanie bez wdrożenia kodu. Test musi wiedzieć, które flagi są włączone, inaczej wynik będzie niejednoznaczny.

## 5. Środowiska efemeryczne

Ephemeral environments per branch lub PR dają izolację, ale wymagają automatycznego tworzenia, seedowania, testowania i usuwania.

## Przykład referencyjny

```bash
kubectl get pods -n test
kubectl describe deployment checkout -n test
kubectl rollout status deployment/checkout -n test
kubectl get configmap checkout-config -n test -o yaml
kubectl get secret checkout-secrets -n test

# Feature flag przez API konfiguracji
curl -fsS "$CONFIG_URL/flags/new-checkout" | jq .enabled
```

Przykład pokazuje, że diagnostyka środowiska powinna być konkretna: sprawdzamy healthcheck, sieć, konfigurację i stan zależności, zamiast zgadywać przyczynę awarii.

## Lista kontrolna

- Czy umiesz sprawdzić healthcheck aplikacji?
- Czy potrafisz odróżnić błąd DNS, TLS, CORS i cookie?
- Czy kontenery mają healthchecki?
- Czy dane w wolumenach nie zanieczyszczają testów?
- Czy sekrety są poza logami i repozytorium?
- Czy stan flag funkcji jest jawny dla testu?


## Dobre praktyki i perspektywa inżynierska
Automatyzacja to proces ciągłego doskonalenia. Aby Twoje testy niosły realną wartość, stosuj się do poniższych zasad:
- **Testuj zachowanie, nie kod**: Skup się na tym, co widzi i robi użytkownik. Zmienne nazwy klas CSS nie powinny psuć Twoich testów.
- **Fail-fast**: Test powinien dawać jasny sygnał o błędzie tak szybko, jak to możliwe. Unikaj "wiszących" testów, które blokują kolejkę CI.
- **Ewoluuj**: Regularnie przeglądaj swoje testy. Usuwaj te, które są niestabilne i nie dają wartości, a refaktoryzuj te, które stają się zbyt skomplikowane.
