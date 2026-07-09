# Podstawy sieci

Full Stack Tester nie musi być administratorem sieci, ale musi rozumieć podstawy. Wiele awarii testów wygląda jak problem aplikacji, a w rzeczywistości wynika z DNS, TLS, proxy, CORS, błędnych nagłówków, portów albo sieci kontenerów. Umiejętność rozdzielenia tych warstw skraca debugowanie.

## 1. Model mentalny requestu HTTP

Gdy test otwiera stronę lub wywołuje API, dzieje się kilka rzeczy:

1. DNS tłumaczy nazwę hosta na adres IP.
2. Klient nawiązuje połączenie TCP.
3. Dla HTTPS następuje handshake TLS.
4. Wysyłany jest request HTTP.
5. Serwer zwraca status, nagłówki i body.
6. Przeglądarka może zapisać cookies, cache albo wykonać kolejne requesty.

Awaria może wystąpić na każdym etapie.

## 2. DNS

DNS odpowiada za rozwiązywanie nazw:

```bash
nslookup staging.example.com
dig staging.example.com
```

Typowe problemy:

- zły rekord DNS;
- cache DNS;
- inny DNS w CI niż lokalnie;
- prywatna domena dostępna tylko przez VPN;
- kontener nie zna nazwy hosta.

W Docker Compose nazwy usług działają jako hosty w sieci compose, np. `http://api:3000` zamiast `localhost`.

## 3. Porty i localhost

`localhost` oznacza „ta sama maszyna” z perspektywy procesu. W kontenerze `localhost` oznacza kontener, nie komputer hosta. Dlatego test w kontenerze może nie widzieć aplikacji pod `localhost:3000`, jeśli aplikacja działa na hoście.

W Docker Compose usługi komunikują się po nazwie serwisu:

```text
postgres://user:pass@db:5432/app
http://api:3000
```

## 4. HTTP i status codes

Tester powinien znać podstawowe klasy statusów:

- 2xx — sukces;
- 3xx — redirect;
- 4xx — błąd klienta lub autoryzacji;
- 5xx — błąd serwera.

Przykłady:

- 400 — niepoprawny request;
- 401 — brak uwierzytelnienia;
- 403 — brak uprawnień;
- 404 — brak zasobu;
- 409 — konflikt;
- 429 — rate limit;
- 500 — błąd serwera;
- 503 — usługa niedostępna.

## 5. Nagłówki

Nagłówki często wyjaśniają problem:

```bash
curl -i https://staging.example.com/api/health
```

Ważne nagłówki:

- `content-type`;
- `authorization`;
- `set-cookie`;
- `cache-control`;
- `location`;
- `retry-after`;
- `x-request-id` lub correlation id;
- CORS headers.

## 6. Cookies i sesje

Problemy z logowaniem często wynikają z cookies:

- zła domena cookie;
- brak `Secure` przy HTTPS;
- `SameSite` blokuje cross-site flow;
- cookie wygasło;
- cookie ustawione dla innej subdomeny.

W Playwright trace i DevTools network pomagają zobaczyć `Set-Cookie` i request cookies.

## 7. TLS/HTTPS

TLS zapewnia szyfrowanie. Typowe błędy:

- wygasły certyfikat;
- certyfikat dla złej domeny;
- self-signed cert w środowisku testowym;
- brak zaufanego CA w kontenerze.

W testach można użyć `ignoreHTTPSErrors`, ale traktuj to jako świadomą decyzję środowiskową, nie domyślny plaster.

## 8. CORS

CORS dotyczy przeglądarki. Request wykonany przez backend albo `curl` może działać, a request z frontendu może być zablokowany.

Sprawdzaj:

- `Access-Control-Allow-Origin`;
- `Access-Control-Allow-Headers`;
- `Access-Control-Allow-Methods`;
- preflight `OPTIONS`;
- credentials/cookies.

CORS jest częstym powodem: „API działa w Postmanie, ale nie działa w aplikacji”.

## 9. Proxy i VPN

CI może działać poza firmową siecią. Jeśli środowisko staging wymaga VPN albo allowlist IP, testy będą padać. Dokumentuj wymagania sieciowe i sprawdzaj je health checkiem przed suite.

## 10. Narzędzia testera

- `curl` — request HTTP;
- `httpie` — wygodniejszy klient HTTP;
- `dig` / `nslookup` — DNS;
- `ping` — podstawowa osiągalność hosta;
- `traceroute` — trasa sieciowa;
- `openssl s_client` — diagnostyka TLS;
- DevTools/Trace Viewer — network w przeglądarce.

## 11. Checklista diagnozy sieci

- Czy DNS rozwiązuje nazwę?
- Czy port jest dostępny?
- Czy TLS jest poprawny?
- Czy status HTTP mówi o autoryzacji czy serwerze?
- Czy cookies są ustawione dla właściwej domeny?
- Czy CORS blokuje tylko przeglądarkę?
- Czy CI ma dostęp do środowiska?
- Czy correlation ID pozwala znaleźć request w logach?

## Linki

- [MDN HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)
- [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Docker Networking](https://docs.docker.com/network/)
- [Kubernetes Services](https://kubernetes.io/docs/concepts/services-networking/service/)

## 12. Debugowanie API przez curl

`curl` jest podstawowym narzędziem testera full stack:

```bash
curl -i -H "Authorization: Bearer $TOKEN" https://staging.example.com/api/orders/123
```

Sprawdzisz status, nagłówki i body bez UI. Jeśli curl zwraca 403, a test UI nie widzi danych, problemem może być autoryzacja, nie locator.

## 13. Preflight CORS

Przeglądarka przed niektórymi requestami wysyła `OPTIONS`. Jeśli preflight pada, właściwy request nigdy nie wyjdzie. W trace zobaczysz błąd CORS, ale API może działać w Postmanie. Tester powinien umieć odróżnić problem API od problemu polityki przeglądarki.

## 14. Check endpoint health

Przed dużą suite warto sprawdzić:

```bash
curl -f https://staging.example.com/api/health
```

Jeśli health check pada, nie ma sensu generować setek błędów UI. Pipeline powinien zgłosić awarię środowiska.

## 15. Debugowanie w Playwright

Trace Viewer pokazuje requesty z perspektywy przeglądarki. To ważne, bo przeglądarka stosuje CORS, cookies, cache i service workery. Jeśli `curl` działa, ale przeglądarka nie, porównaj nagłówki i preflight.

## 16. Sieć a kontenery

W testach kontenerowych pamiętaj:

- port opublikowany na hoście nie zawsze jest potrzebny między kontenerami;
- nazwa usługi działa tylko w sieci Compose/Kubernetes;
- `host.docker.internal` może działać inaczej na różnych systemach;
- firewall CI może blokować połączenia wychodzące.

## 17. Zasada końcowa

Sieć debuguj warstwami: DNS, połączenie, TLS, HTTP, autoryzacja, CORS, aplikacja. Nie przeskakuj od razu do poprawiania testu UI.
