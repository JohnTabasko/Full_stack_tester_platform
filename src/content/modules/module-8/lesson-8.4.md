# Wydajność i testy obciążeniowe API

> Moduł ósmy pokazuje, jak testować system szybciej i precyzyjniej przez warstwę API. Testy API są doskonałe do kontraktów, reguł biznesowych, autoryzacji, przygotowania danych i diagnostyki. Nie zastępują testów UI, ale pozwalają nie przeciążać przeglądarki problemami, które lepiej sprawdzić niżej.

## Jak czytać ten moduł

Czytaj ten moduł jak podręcznik kontraktu między systemami. Endpoint nie jest tylko adresem URL. Jest obietnicą: jakie dane przyjmuje, jakie zwraca, jakie błędy są możliwe, kto ma prawo go użyć i jak zachowuje się pod obciążeniem.

Trzy zasady modułu:

1. **Status HTTP nie wystarcza.** Sprawdzaj ciało odpowiedzi, nagłówki, semantykę danych i scenariusze błędów.
2. **API jest świetne do setupu danych.** Przygotowanie przez API jest zwykle szybsze i stabilniejsze niż przez UI.
3. **Kontrakt musi chronić konsumentów.** Test ma wykryć zmianę, która zepsuje klienta, zanim trafi na środowisko użytkownika.


## Cel lekcji

Ta lekcja koncentruje się na: **k6, testy load, stress, spike i soak, wirtualni użytkownicy, percentyle, progi jakości i podstawy analizy wydajności API**. Główne ryzyko: **zespół mierzy średni czas odpowiedzi bez modelu ruchu, progów i metryk, przez co wynik nie mówi nic o realnym ryzyku**. Po lekturze powinieneś umieć zaprojektować test API, który sprawdza kontrakt, dane, uprawnienia i diagnostykę, a nie tylko status techniczny.

## Sytuacja przewodnia

endpoint wyszukiwania produktów musi obsłużyć kampanię marketingową i utrzymać p95 poniżej 500 ms

## 1. Test wydajnościowy jako eksperyment

Test obciążeniowy wymaga hipotezy, modelu ruchu, środowiska, metryk i progów. Bez tych elementów jest tylko generowaniem ruchu.

## 2. Rodzaje obciążenia

Load test sprawdza oczekiwany ruch, stress test szuka granicy, spike test bada nagły skok, a soak test długotrwałą stabilność.

## 3. Percentyle

Średnia ukrywa problemy użytkowników na końcu rozkładu. P95 i P99 często mówią więcej o doświadczeniu niż average.

## 4. Thresholds

Progi jakości zamieniają oczekiwania w automatyczny wynik. Test powinien jasno mówić, kiedy wydajność jest nieakceptowalna.

## 5. Korelacja z monitoringiem

Bez metryk bazy, CPU, pamięci i usług zewnętrznych trudno znaleźć wąskie gardło. k6 powinien iść w parze z obserwowalnością.

## Przykład referencyjny

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
  stages: [
    { duration: '2m', target: 50 },
    { duration: '5m', target: 50 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  const res = http.get(`${__ENV.BASE_URL}/api/products?q=book`);
  check(res, { 'status 200': r => r.status === 200 });
  sleep(1);
}
```

Przykład pokazuje styl testowania API: jawne żądanie, asercja statusu, sprawdzenie kontraktu i odniesienie do semantyki danych.

## Lista kontrolna

- Czy test sprawdza więcej niż status HTTP?
- Czy scenariusz ma wariant negatywny?
- Czy autoryzacja jest sprawdzona dla właściwych ról?
- Czy kontrakt odpowiedzi jest jawny?
- Czy dane tworzone przez test są sprzątane?
- Czy awaria zostawia request id, ciało odpowiedzi lub inne dane diagnostyczne?


## Dobre praktyki i perspektywa inżynierska
Automatyzacja to proces ciągłego doskonalenia. Aby Twoje testy niosły realną wartość, stosuj się do poniższych zasad:
- **Testuj zachowanie, nie kod**: Skup się na tym, co widzi i robi użytkownik. Zmienne nazwy klas CSS nie powinny psuć Twoich testów.
- **Fail-fast**: Test powinien dawać jasny sygnał o błędzie tak szybko, jak to możliwe. Unikaj "wiszących" testów, które blokują kolejkę CI.
- **Ewoluuj**: Regularnie przeglądaj swoje testy. Usuwaj te, które są niestabilne i nie dają wartości, a refaktoryzuj te, które stają się zbyt skomplikowane.
