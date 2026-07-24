# Atrapy testowe: Dummy, Stubs, Spies, Mocks i Fakes (Test Doubles)

Podczas pisania testów jednostkowych i integracyjnych, kod poddawany testom (SUT – System Under Test) bardzo rzadko funkcjonuje w izolacji. Najczęściej współpracuje z wieloma zewnętrznymi zależnościami (tzw. DOC – Depended-on Components), takimi jak serwisy sieciowe, bazy danych czy zewnętrzne systemy wysyłki wiadomości.

Testowanie kodu z rzeczywistymi zależnościami utrudnia izolację błędów i spowalnia testy. Aby temu zapobiec, stosujemy **Atrapy Testowe (Test Doubles)**. Niestety, w branży QA pojęcie "mock" jest powszechnie nadużywane jako synonim dla każdej atrapy. 

Zgodnie z klasyczną taksonomią Gerarda Meszarosa, wyróżniamy **pięć niezależnych rodzajów atrap**. W tej lekcji nauczysz się je rzetelnie rozróżniać i implementować w środowisku **Vitest/Jest**.

---

## 1. Pięć Rodzajów Atrap Testowych (Meszaros Taxonomy)

### A. Dummy (Zaślepka)
Najprostszy typ atrapy. Służy wyłącznie jako "zapychacz" parametrów wejściowych metod, aby kompilator nie zgłaszał błędów. Jej zawartość nigdy nie jest odczytywana ani używana przez testowany kod.
```typescript
// Dummy przekazywany tylko po to, by spełnić sygnaturę konstruktora
const dummyLogger = { log: () => {} };
const authService = new AuthService(dummyLogger);
```

### B. Stub (Stub / Dubler Stanu)
Dostarcza gotowe, prekonfigurowane dane wejściowe (pośrednie) do testowanego systemu. Służy do kontrolowania zachowania zależności, aby testowany system poszedł określoną ścieżką logiczną:
```typescript
import { vi } from 'vitest';

// Tworzymy Stub zwracający stałą wartość ceny (Indirect Input)
const taxServiceStub = {
  calculateTax: vi.fn().mockReturnValue(23.00)
};

const cart = new Cart(taxServiceStub);
expect(cart.getTotal(100)).toBe(123.00);
```

### C. Spy (Szpieg)
Rejestruje pośrednie wyjścia z systemu – zbiera informacje o tym, czy i jak wywołano metody zależności (ile razy, z jakimi argumentami), nie wpływając na ich działanie.
```typescript
const emailSpy = vi.fn();
const notificationService = new NotificationService(emailSpy);

await notificationService.sendWelcome('test@user.pl');

// Szpieg pozwala sprawdzić liczbę wywołań i przekazane parametry
expect(emailSpy).toHaveBeenCalledTimes(1);
expect(emailSpy).toHaveBeenCalledWith('test@user.pl', expect.stringContaining('Witaj'));
```

### D. Mock (Mock / Atrapa Interakcji)
Bardziej zaawansowana forma Szpiega. Posiada wbudowane oczekiwania (expectations) dotyczące interakcji. Jeśli testowany system nie wywoła oczekiwanej metody w określony sposób, mock automatycznie zgłosi awarię testu.
*   **Różnica**: Stub sprawdza stan (*State Verification*), a Mock sprawdza interakcję i zachowanie (*Behavior Verification*).

### E. Fake (Obiekt Pozorny)
Posiada kompletną, w pełni działającą, ale bardzo uproszczoną implementację zależności. Nie nadaje się do środowiska produkcyjnego, ale jest idealny do szybkich i odizolowanych testów.
*   **Przykład**: Lekka, działająca w pamięci RAM baza danych (`InMemoryDatabase`) jako atrapa dla ciężkiej bazy PostgreSQL.

---

## 2. Checklista Projektowania Atrap Testowych
- [ ] Czy potrafisz poprawnie rozróżnić Stuba (kontrola wejścia) od Mocka (weryfikacja interakcji)?
- [ ] Czy do prostych parametrów, których system nie używa, stosujesz bezpieczne obiekty typu Dummy?
- [ ] Czy unikasz nadmiernego mockowania (mocking hell), które sprawia, że testy stają się głuche na realne błędy kodu?