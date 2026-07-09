# Podstawy k6

> Moduł dwudziesty czwarty uczy prowadzić testy wydajnościowe jako eksperyment inżynierski. Obciążenie bez hipotezy, metryk i progów jest tylko ruchem generowanym w systemie.

## Jak czytać ten moduł

Czytaj ten moduł przez pryzmat pytania: jaką decyzję ma wspierać test wydajnościowy? Czy system wytrzyma normalny ruch, gdzie jest granica, co stanie się przy piku, czy długotrwała praca degraduje usługę i czy wynik mieści się w budżecie?

Trzy zasady modułu:

1. **Najpierw hipoteza, potem ruch.** Test bez celu nie daje wiedzy.
2. **Percentyle są ważniejsze niż średnia.** Użytkownik w ogonie rozkładu też jest użytkownikiem.
3. **Wynik wymaga metryk systemu.** Bez CPU, pamięci, bazy i logów znasz objaw, nie przyczynę.


## Cel lekcji

Ta lekcja koncentruje się na: **scenariusze k6, wirtualni użytkownicy, stages, thresholds, checks, custom metrics, raportowanie i uruchamianie testów wydajnościowych w CI**. Główne ryzyko: **skrypt k6 generuje ruch, ale nie odwzorowuje zachowania użytkowników, nie ma progów jakości i nie daje jednoznacznego wyniku w CI**. Po lekturze powinieneś umieć zaprojektować test wydajnościowy z hipotezą, profilem obciążenia, progami i interpretacją wyników.

## Sytuacja przewodnia

zespół chce dodać do pipeline test regresji wydajnościowej endpointu wyszukiwania produktów z limitem p95 i maksymalnym odsetkiem błędów

## 1. Model k6

k6 uruchamia funkcję default dla wirtualnych użytkowników. Każdy VU wykonuje scenariusz w pętli zgodnie z konfiguracją czasu, stages lub executorów.

## 2. Checks

Checks są asercjami funkcjonalnymi w teście wydajnościowym. Nie zastępują thresholds, ale pomagają upewnić się, że ruch nie trafia w błędny endpoint albo pustą odpowiedź.

## 3. Thresholds

Thresholds zamieniają wynik w decyzję: test przechodzi albo nie. Bez thresholds pipeline nie wie, czy wydajność jest akceptowalna.

## 4. Metryki własne

Custom metrics pozwalają mierzyć konkretne fragmenty procesu, np. czas wyszukiwania, czas logowania, czas checkoutu.

## 5. k6 w CI

W CI test k6 powinien mieć kontrolowany czas, stabilne środowisko, progi i publikację wyników. Nie każdy test wydajnościowy nadaje się do pull requestu.

## Przykład referencyjny

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const searchDuration = new Trend('search_duration');

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'],
    search_duration: ['p(95)<500'],
  },
  vus: 20,
  duration: '3m',
};

export default function () {
  const response = http.get(`${__ENV.BASE_URL}/api/search?q=book`);
  searchDuration.add(response.timings.duration);
  check(response, {
    'status 200': r => r.status === 200,
    'ma wyniki': r => r.json('items').length > 0,
  });
  sleep(1);
}
```

Przykład pokazuje, że test wydajnościowy powinien mieć profil ruchu, checks, thresholds i sposób interpretacji. Samo wysłanie wielu żądań nie wystarcza.

## Lista kontrolna

- Czy test ma hipotezę?
- Czy profil obciążenia odpowiada realnemu lub planowanemu ruchowi?
- Czy są progi p95/p99, error rate i throughput?
- Czy środowisko jest kontrolowane?
- Czy zbierasz metryki aplikacji i infrastruktury?
- Czy raport prowadzi do decyzji technicznej?


## Dobre praktyki i perspektywa inżynierska
Automatyzacja to proces ciągłego doskonalenia. Aby Twoje testy niosły realną wartość, stosuj się do poniższych zasad:
- **Testuj zachowanie, nie kod**: Skup się na tym, co widzi i robi użytkownik. Zmienne nazwy klas CSS nie powinny psuć Twoich testów.
- **Fail-fast**: Test powinien dawać jasny sygnał o błędzie tak szybko, jak to możliwe. Unikaj "wiszących" testów, które blokują kolejkę CI.
- **Ewoluuj**: Regularnie przeglądaj swoje testy. Usuwaj te, które są niestabilne i nie dają wartości, a refaktoryzuj te, które stają się zbyt skomplikowane.
