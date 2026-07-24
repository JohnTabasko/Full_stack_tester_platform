# Automatyzacja testów wydajnościowych z Grafana k6

W tradycyjnej automatyzacji, testy wydajnościowe API były zdominowane przez starsze, oparte o interfejs XML/Java narzędzia, takie jak Apache JMeter. Choć potężny, JMeter jest trudny do wersjonowania w systemie Git, nie posiada natywnego wsparcia dla formatu "kod jako test" (Code-as-Test) i wywołuje ogromne obciążenie poznawcze u programistów.

**Grafana k6** redefiniuje ten obszar, dostarczając nowoczesne, napisane w języku Go, ale w pełni skryptowalne w **JavaScript (ES6)** narzędzie dedykowane dla inżynierów wydajności i SDET. W tej lekcji nauczysz się projektować kompletne scenariusze obciążeniowe, zarządzać wirtualnymi użytkownikami (VUs) oraz wdrażać rygorystyczne asercje wydajnościowe (**Thresholds**).

---

## 1. Koncepcja Wirtualnych Użytkowników (Virtual Users - VUs)

W k6 obciążenie jest generowane przez tzw. **Wirtualnych Użytkowników (VUs – Virtual Users)**. Każdy VU to niezależny, odizolowany wątek (proces) wirtualny, który wykonuje w pętli kod zadeklarowany w funkcji głównej `default`. 

Liczbą użytkowników oraz czasem trwania testu sterujemy przy użyciu obiektu konfiguracji `options`:

```javascript
// Prosty test wydajnościowy k6
import http from 'k6/http';
import { sleep } from 'k6';

// 1. Opcje konfiguracyjne (Options)
export const options = {
  vus: 10,           // Uruchom 10 wirtualnych użytkowników jednocześnie
  duration: '30s',   // Wykonuj test przez 30 sekund
};

// 2. Funkcja główna wykonywana przez każdego VU w pętli
export default function () {
  http.get('https://test-api.mycommerce.pl/api/products');
  sleep(1); // Odpocznij 1 sekundę przed kolejnym zapytaniem (Think Time)
}
```

---

## 2. Modelowanie faz obciążenia (Load Stages)

Rzeczywisty ruch na stronie nie pojawia się nagle i nie znika natychmiast. Aby bezpiecznie przetestować aplikację pod kątem przeciążeń, musimy stopniowo zwiększać ruch (Ramping Up), utrzymywać stałe obciążenie (Peak), a na koniec stopniowo wygaszać wątki (Ramping Down).

Służą do tego **etapy obciążenia (stages)**:

```javascript
export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Rampa w górę: w ciągu 1 minuty zwiększ ruch od 0 do 50 użytkowników
    { duration: '3m', target: 50 },  // Utrzymanie: utrzymuj ruch 50 użytkowników przez 3 minuty
    { duration: '1m', target: 0 },   // Rampa w dół: w ciągu 1 minuty zmniejsz obciążenie do zera
  ],
};
```

---

## 3. Definiowanie twardych asercji wydajnościowych (Thresholds)

Samo uruchomienie testu i narysowanie wykresu nie daje automatycznej odpowiedzi, czy wydajność jest zadowalająca. k6 umożliwia wdrożenie **Thresholds (Progów Tolerancji)**. Są to automatyczne, bardzo precyzyjne asercje na metrykach sieciowych, które potrafią wywalić rurociąg CI/CD (bramka jakości – Quality Gate), jeśli wydajność spadnie:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '1m',
  
  // Asercje Wydajnościowe (Thresholds)
  thresholds: {
    // A. 95% wszystkich zapytań HTTP (p95) musi odpowiedzieć w czasie poniżej 200 ms!
    http_req_duration: ['p95 < 200'],
    
    // B. Współczynnik błędów sieciowych (failed requests) musi być mniejszy niż 1%
    http_req_failed: ['rate < 0.01'],
  },
};

export default function () {
  const res = http.get('https://test-api.mycommerce.pl/api/products');
  
  // Weryfikacja poprawności funkcjonalnej (Check)
  check(res, {
    'status to 200': (r) => r.status === 200,
  });
  
  sleep(0.5);
}
```

---

## 4. Checklista Projektowania Testów z k6
- [ ] Czy Twój kod testów obciążeniowych k6 jest wersjonowany w systemie Git w formacie Code-as-Test?
- [ ] Czy modelujesz realistyczny ruch użytkowników, stosując ramping (stopniowe zwiększanie obciążenia) za pomocą etapów (`stages`)?
- [ ] Czy wdrożyłeś rygorystyczne asercje na percentylach czasowych (`http_req_duration`) w sekcji `thresholds`?
- [ ] Czy stosujesz mechanizm `check()` do weryfikowania poprawności kodów statusu odpowiedzi?