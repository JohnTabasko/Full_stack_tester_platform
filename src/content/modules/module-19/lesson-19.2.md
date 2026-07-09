# Mocki, stuby, obiekty pozorne i szpiedzy

> Moduł dziewiętnasty pokazuje, jak testować niższe poziomy aplikacji, aby nie przepychać każdego ryzyka przez wolne testy end-to-end. Testy jednostkowe, komponentowe i integracyjne skracają feedback oraz pomagają precyzyjniej wskazać przyczynę awarii.

## Jak czytać ten moduł

Czytaj ten moduł jako uzupełnienie Playwright E2E. Pytanie nie brzmi „czy pisać E2E albo unit”, lecz „który poziom testu da najlepszą informację przy najniższym koszcie”. Dobrze zaprojektowana automatyzacja łączy poziomy.

Trzy zasady modułu:

1. **Testuj możliwie nisko, ale wystarczająco realistycznie.** Reguły domenowe nie muszą iść przez UI.
2. **Mocki zmniejszają koszt i realizm.** Używaj ich świadomie.
3. **Komponent i integracja mają własną wartość.** Nie są tylko etapem pośrednim między unit i E2E.


## Cel lekcji

Ta lekcja koncentruje się na: **dublerzy testowi, izolowanie zależności, mockowanie z umiarem, testowanie efektów ubocznych i granice wiarygodności testów izolowanych**. Główne ryzyko: **test z mockami przechodzi, ale prawdziwa integracja jest popsuta, bo mock nie odzwierciedla rzeczywistego kontraktu zależności**. Po lekturze powinieneś umieć dobrać poziom testu do ryzyka i zaprojektować test niższego poziomu, który uzupełnia E2E.

## Sytuacja przewodnia

serwis zamówień wysyła e-mail, publikuje zdarzenie i zapisuje rekord w bazie; test musi zdecydować, które zależności zastąpić dublerami

## 1. Po co dubler testowy

Dubler testowy zastępuje zależność po to, aby testować wybrany fragment logiki w kontrolowanych warunkach. Nie jest celem samym w sobie.

## 2. Dummy, stub, fake, mock, spy

Dummy wypełnia parametr, stub zwraca zaprogramowaną wartość, fake ma uproszczoną implementację, mock sprawdza interakcje, a spy obserwuje wywołania.

## 3. Mockowanie z umiarem

Im więcej mocków, tym większe ryzyko, że test sprawdza wyobrażenie o systemie, a nie system. Mockuj granice, nie wszystko.

## 4. Efekty uboczne

Wysyłka e-maila, publikacja zdarzenia i zapis do bazy to efekty uboczne. Test powinien sprawdzać, czy wywołano je z właściwymi danymi albo użyć testu integracyjnego.

## 5. Wiarygodność

Test izolowany jest szybki, ale mniej realistyczny. Uzupełniaj go testami integracyjnymi lub kontraktowymi tam, gdzie granica zależności jest ważna.

## Przykład referencyjny

```typescript
import { expect, it, vi } from 'vitest';

it('wysyła wiadomość po utworzeniu zamówienia', async () => {
  const mailer = { send: vi.fn().mockResolvedValue(undefined) };
  const repository = { save: vi.fn().mockResolvedValue({ id: 'order-1' }) };
  const service = new OrderService(repository, mailer);

  await service.createOrder({ userEmail: 'anna@example.test' });

  expect(repository.save).toHaveBeenCalledOnce();
  expect(mailer.send).toHaveBeenCalledWith(expect.objectContaining({
    to: 'anna@example.test',
  }));
});
```

Przykład pokazuje, że niższy poziom testu powinien mieć jasną odpowiedzialność. Test jednostkowy, komponentowy i integracyjny nie konkurują z E2E — uzupełniają go.

## Lista kontrolna

- Czy wybrany poziom testu pasuje do ryzyka?
- Czy test nie sprawdza prywatnej implementacji bez potrzeby?
- Czy mock nie kłamie o kontrakcie zależności?
- Czy dane testowe są małe i czytelne?
- Czy awaria wskazuje konkretną warstwę?
- Czy test niższego poziomu ogranicza potrzebę wolnego testu E2E?


## Dobre praktyki i perspektywa inżynierska
Automatyzacja to proces ciągłego doskonalenia. Aby Twoje testy niosły realną wartość, stosuj się do poniższych zasad:
- **Testuj zachowanie, nie kod**: Skup się na tym, co widzi i robi użytkownik. Zmienne nazwy klas CSS nie powinny psuć Twoich testów.
- **Fail-fast**: Test powinien dawać jasny sygnał o błędzie tak szybko, jak to możliwe. Unikaj "wiszących" testów, które blokują kolejkę CI.
- **Ewoluuj**: Regularnie przeglądaj swoje testy. Usuwaj te, które są niestabilne i nie dają wartości, a refaktoryzuj te, które stają się zbyt skomplikowane.
