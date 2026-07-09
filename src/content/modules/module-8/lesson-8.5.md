# Organizacja testów API i wzorce

> Moduł ósmy pokazuje, jak testować system szybciej i precyzyjniej przez warstwę API. Testy API są doskonałe do kontraktów, reguł biznesowych, autoryzacji, przygotowania danych i diagnostyki. Nie zastępują testów UI, ale pozwalają nie przeciążać przeglądarki problemami, które lepiej sprawdzić niżej.

## Jak czytać ten moduł

Czytaj ten moduł jak podręcznik kontraktu między systemami. Endpoint nie jest tylko adresem URL. Jest obietnicą: jakie dane przyjmuje, jakie zwraca, jakie błędy są możliwe, kto ma prawo go użyć i jak zachowuje się pod obciążeniem.

Trzy zasady modułu:

1. **Status HTTP nie wystarcza.** Sprawdzaj ciało odpowiedzi, nagłówki, semantykę danych i scenariusze błędów.
2. **API jest świetne do setupu danych.** Przygotowanie przez API jest zwykle szybsze i stabilniejsze niż przez UI.
3. **Kontrakt musi chronić konsumentów.** Test ma wykryć zmianę, która zepsuje klienta, zanim trafi na środowisko użytkownika.


## Cel lekcji

Ta lekcja koncentruje się na: **klient API, klasy zasobów, fikstury, tracker sprzątania, retry, struktura folderów i utrzymywalna architektura testów API**. Główne ryzyko: **testy API powielają adresy, nagłówki, tokeny, cleanup i parsowanie odpowiedzi w każdym pliku**. Po lekturze powinieneś umieć zaprojektować test API, który sprawdza kontrakt, dane, uprawnienia i diagnostykę, a nie tylko status techniczny.

## Sytuacja przewodnia

pakiet testów API ma obsługiwać użytkowników, zamówienia, faktury i płatności bez duplikacji setupu oraz cleanupu

## 1. Klient API

Klient API centralizuje bazowy adres, nagłówki, autoryzację i typowe operacje. Test powinien czytać się językiem zasobów, nie powtarzać szczegóły HTTP.

## 2. Klasy zasobów

OrdersApi, UsersApi i PaymentsApi porządkują odpowiedzialność. Każda klasa powinna znać swój zasób i typowe operacje.

## 3. Fikstury

Klienci API mogą być dostarczani przez fikstury Playwright. Dzięki temu testy dostają gotowe zależności bez ręcznego tworzenia w każdym pliku.

## 4. Cleanup tracker

Tracker sprzątania pozwala usuwać zasoby nawet wtedy, gdy test utworzył kilka powiązanych rekordów. Powinien działać w odwrotnej kolejności tworzenia.

## 5. Retry z ostrożnością

Retry na poziomie klienta API może pomóc przy chwilowych błędach infrastruktury, ale nie powinien ukrywać defektów produktu ani błędów kontraktu.

## Przykład referencyjny

```typescript
export class OrdersApi {
  constructor(private readonly request: APIRequestContext) {}

  async create(data: CreateOrderRequest) {
    const response = await this.request.post('/api/orders', { data });
    expect(response.status()).toBe(201);
    return response.json() as Promise<Order>;
  }

  async delete(orderId: string) {
    await this.request.delete(`/api/orders/${orderId}`);
  }
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
