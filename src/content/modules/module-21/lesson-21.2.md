# Testy Kontraktowe sterowane przez Konsumenta (Consumer-Driven Contract Testing)

W nowoczesnych architekturach opartych o mikrousługi (Microservices), tradycyjne testy integracyjne E2E stają się niezwykle kłopotliwe i powolne. Wymagają podniesienia wszystkich powiązanych usług jednocześnie, a awaria jednego, bocznego modułu paraliżuje wdrożenia całego systemu.

**Testy Kontraktowe sterowane przez Konsumenta (CDC – Consumer-Driven Contracts)** rewolucjonizują to podejście. Pozwalają przetestować integrację między usługami **w całkowitej izolacji**, przy użyciu formalnego kontraktu (umowy). Najpopularniejszym narzędziem realizującym to zadanie na rynku jest **Pact**.

---

## 1. Architektura CDC: Konsument (Consumer) i Dostawca (Provider)

W modelu Consumer-Driven:
*   **Konsument (Consumer)**: Aplikacja kliencka, która pobiera i zużywa dane (np. nasz frontend w React, który odpytuje API zamówień). To konsument definiuje swoje wymagania (np. "oczekuję, że endpoint GET `/orders/1` zwróci obiekt z polami `id` (string) i `total` (number)").
*   **Dostawca (Provider)**: Usługa backendowa, która dostarcza dane. Musi udowodnić, że spełnia wymagania zadeklarowane przez wszystkich swoich konsumentów.

```
+------------------+                   +--------------------+
|  Consumer Test   | -- Generuje ----> |     Pact File      |
|  (Frontend/React)|                   |   (Kontrakt JSON)  |
+------------------+                   +--------------------+
                                                 |
                                           Publikuje do
                                                 v
+------------------+                   +--------------------+
|  Provider Test   | <-- Pobiera ----- |    Pact Broker     |
| (Backend/API)    |                   | (Centralny serwer) |
+------------------+                   +--------------------+
```

---

## 2. Tworzenie testu po stronie Konsumenta (Consumer Test)

Używając biblioteki `@pact-foundation/pact`, konsument konfiguruje wirtualny serwer testowy (Mock Service), opisuje oczekiwane zapytanie oraz poprawną strukturę odpowiedzi:

```typescript
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import path from 'path';

// 1. Inicjalizacja instancji Pact
const provider = new PactV3({
  consumer: 'MyCommerce-Frontend',
  provider: 'Order-Service',
  dir: path.resolve(process.cwd(), 'pacts'),
});

test('wygenerowanie kontraktu pobierania szczegółów zamówienia', async () => {
  // 2. Deklaracja oczekiwań (Interaction)
  provider
    .given('istnieje zamówienie o ID 100')
    .uponReceiving('zapytanie GET o szczegóły zamówienia 100')
    .withRequest({
      method: 'GET',
      path: '/api/v1/orders/100',
    })
    .willRespondWith({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        // Matchers sprawdzają zgodność typów, a nie konkretne wartości (Contract Testing)
        orderId: MatchersV3.string('100'),
        totalAmount: MatchersV3.decimal(150.50),
        status: MatchersV3.regex(/created|completed|failed/, 'created'),
      },
    });

  // 3. Wykonanie fizycznego zapytania testowego do wirtualnego serwera Mock
  await provider.executeTest(async (mockServer) => {
    const response = await fetch(`${mockServer.url}/api/v1/orders/100`);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.orderId).toBe('100');
  });
  
  // Po pomyślnym zakończeniu, Pact automatycznie zapisze plik kontraktu JSON w folderze /pacts
});
```

---

## 3. Rola rejestru kontraktów (Pact Broker)

Po pomyślnym wygenerowaniu pliku kontraktu JSON (np. `MyCommerce-Frontend-Order-Service.json`), zostaje on automatycznie wypchnięty (push) do centralnego rejestru – **Pact Broker**.

Podczas budowania backendu (Provider), serwer CI pobiera ten plik z brokera i automatycznie uruchamia testy weryfikujące, czy deweloperzy backendu nie wprowadzili zmian łamiących kontrakt frontendowy.

---

## 4. Checklista Testów Kontraktowych Pact
- [ ] Czy rozumiesz różnicę między tradycyjnymi testami E2E a testami kontraktowymi CDC?
- [ ] Czy do walidacji typów wewnątrz kontraktu stosujesz dopasowania typów (`MatchersV3`) zamiast sztywnych wartości statycznych?
- [ ] Czy po stronie konsumenta pomyślnie generujesz pliki kontraktu `.json` w katalogu głównym?
- [ ] Czy zaplanowałeś wdrożenie centralnego serwera Pact Broker w celu współdzielenia i weryfikacji umów?