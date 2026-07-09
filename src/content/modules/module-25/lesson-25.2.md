# Podstawy sieci

> Moduł dwudziesty piąty daje testerowi praktyczny warsztat pracy ze środowiskiem: terminalem, siecią, kontenerami, Kubernetes, sekretami i flagami funkcji. Wiele awarii testów nie wynika z Playwrighta, lecz z infrastruktury i konfiguracji.

## Jak czytać ten moduł

Czytaj ten moduł jak zestaw narzędzi diagnostycznych. Nie chodzi o zostanie administratorem systemów, lecz o umiejętność samodzielnego sprawdzenia, czy aplikacja działa, czy API jest osiągalne, czy kontener jest gotowy, czy sekret istnieje i czy flaga funkcji ma właściwy stan.

Trzy zasady modułu:

1. **Środowisko jest częścią testu.** Jeśli jest niejawne, wynik testu jest niepewny.
2. **Diagnozuj warstwami.** DNS, sieć, proces, kontener, aplikacja, dane i test to różne klasy problemów.
3. **Nie loguj sekretów.** Diagnostyka nie może naruszać bezpieczeństwa.


## Cel lekcji

Ta lekcja koncentruje się na: **DNS, HTTP/TLS, porty, proxy, CORS, cookies, nagłówki i debugowanie problemów sieciowych w środowiskach testowych**. Główne ryzyko: **błąd infrastruktury jest błędnie klasyfikowany jako błąd testu albo aplikacji, bo zespół nie sprawdza DNS, TLS, portów, CORS i ciasteczek**. Po lekturze powinieneś umieć diagnozować środowisko testowe i odróżniać problem infrastruktury od błędu aplikacji lub testu.

## Sytuacja przewodnia

test logowania działa lokalnie, ale w CI kończy się błędem CORS albo nie zapisuje ciasteczka sesji po przekierowaniu

## 1. DNS

DNS tłumaczy nazwę hosta na adres. Jeżeli DNS w CI wskazuje inne środowisko niż lokalnie, testy mogą trafiać w niewłaściwą aplikację.

## 2. HTTP i TLS

HTTP opisuje żądania i odpowiedzi, a TLS zabezpiecza połączenie. Błędy certyfikatu, przekierowań i protokołu mogą wyglądać jak błąd aplikacji.

## 3. Porty i proxy

Usługa może działać, ale na innym porcie albo za proxy. Tester powinien umieć sprawdzić, czy port jest osiągalny i czy proxy nie zmienia nagłówków.

## 4. CORS

CORS jest mechanizmem przeglądarki. API może działać przez curl, a jednocześnie być blokowane w UI z powodu brakujących nagłówków CORS.

## 5. Cookies i nagłówki

Ciasteczka sesji zależą od domeny, SameSite, Secure, HttpOnly i ścieżki. Błąd cookie często objawia się jako losowe wylogowanie.

## Przykład referencyjny

```bash
# DNS i połączenie
nslookup test.example.internal
curl -vkI https://test.example.internal/login

# Nagłówki CORS
curl -i -X OPTIONS https://api.example.test/orders   -H 'Origin: https://app.example.test'   -H 'Access-Control-Request-Method: POST'

# Sprawdzenie portu
nc -vz test.example.internal 443
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
