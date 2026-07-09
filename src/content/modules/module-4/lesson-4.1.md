# Wiele stron i okien

> Moduł czwarty dotyczy sytuacji, w których prosta interakcja z jedną stroną przestaje wystarczać. Nowoczesna aplikacja może otwierać popupy, osadzać iframe, używać Shadow DOM, komunikować się z wieloma API, wymagać logowania SSO, pytać o uprawnienia albo zmieniać zachowanie zależnie od urządzenia.

## Jak czytać ten moduł

W tym module najważniejsze jest rozumienie granic. Granicą może być nowa karta, ramka iframe, Shadow DOM, zewnętrzne API, sesja użytkownika, uprawnienie przeglądarki albo emulowane urządzenie. Stabilny test wie, po której stronie granicy działa i gdzie powinien szukać dowodu.

Trzy zasady przewodnie:

1. **Najpierw określ granicę systemu.** Czy testujesz aplikację, integrację z dostawcą, czy samą obsługę błędu?
2. **Nie myl realizmu z przypadkową zależnością.** Prawdziwa integracja jest wartościowa, ale nie każdy test powinien zależeć od usługi zewnętrznej.
3. **Diagnostyka musi obejmować właściwą warstwę.** Przy iframe patrz na ramkę, przy sieci na żądania, przy uwierzytelnianiu na sesję, przy urządzeniach na kontekst.


## Cel lekcji

Ta lekcja koncentruje się na: **popupy, nowe karty, target=_blank, zdarzenia page i popup, komunikacja między stronami oraz zarządzanie cyklem życia okien**. Główne ryzyko: **test klika link otwierający nowe okno, ale dalej wykonuje asercje na starej stronie albo gubi kontekst użytkownika**. Po lekturze powinieneś umieć zaprojektować test, który świadomie przekracza granicę jednej strony i nadal pozostaje stabilny oraz diagnozowalny.

## Sytuacja przewodnia

użytkownik otwiera fakturę w nowej karcie, wraca do aplikacji i kontynuuje proces płatności

## 1. Model wielu stron

W Playwright pojedynczy `Page` reprezentuje jedną kartę. Popup lub link z `target=_blank` tworzy nową stronę w tym samym kontekście przeglądarki. Test musi jawnie przełączyć uwagę na właściwą stronę.

## 2. Oczekiwanie na popup

Najpierw ustaw oczekiwanie na zdarzenie `popup`, potem wykonaj akcję, która je wywołuje. Odwrotna kolejność prowadzi do wyścigu i losowych timeoutów.

## 3. Kontekst a strona

Nowa strona zwykle dziedziczy sesję z kontekstu. To wygodne, ale wymaga świadomości: test nadal pracuje w tej samej izolowanej sesji użytkownika.

## 4. Zamykanie zasobów

Jeżeli tworzysz dodatkowe strony, zamykaj je świadomie. Pozostawione karty mogą utrudnić diagnostykę i spowalniać testy.

## 5. Asercje właściwej strony

Najczęstszy błąd to wykonywanie asercji na `page`, gdy oczekiwany element znajduje się w `popupPage`. Nazwy zmiennych powinny jasno mówić, której strony dotyczą.

## Przykład referencyjny

```typescript
import { test, expect } from '@playwright/test';

test('użytkownik otwiera fakturę w nowej karcie', async ({ page }) => {
  await page.goto('/orders/1001');

  const invoicePagePromise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Pobierz fakturę' }).click();
  const invoicePage = await invoicePagePromise;

  await expect(invoicePage.getByRole('heading', { name: /faktura/i })).toBeVisible();
  await expect(invoicePage).toHaveURL(/invoice/);

  await invoicePage.close();
  await expect(page.getByRole('heading', { name: /zamówienie #1001/i })).toBeVisible();
});
```

Przykład pokazuje, że zaawansowana funkcja Playwrighta ma sens dopiero wtedy, gdy prowadzi do asercji skutku. Samo przełączenie strony, ramki, mocka lub kontekstu nie jest testem. Testem jest dowód, że aplikacja zareagowała poprawnie.

## Lista kontrolna

- Czy test działa we właściwej stronie, ramce albo kontekście?
- Czy granica systemu jest świadomie określona?
- Czy mock nie ukrywa integracji, którą trzeba sprawdzić?
- Czy dane sesji i uprawnienia są izolowane?
- Czy po awarii trace i logi pokażą właściwą warstwę problemu?
- Czy scenariusz ma wariant negatywny lub fallback?


Dla tematu „Wiele stron i okien” najpierw określ, gdzie kończy się aplikacja pod Twoją kontrolą, a gdzie zaczyna przeglądarka, dostawca, ramka, kontekst albo urządzenie. Obszar techniczny lekcji to popupy, nowe karty, target=_blank, zdarzenia page i popup, komunikacja między stronami oraz zarządzanie cyklem życia okien. Bez tej granicy łatwo diagnozować problem w złym miejscu.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


Najważniejsze ryzyko brzmi: test klika link otwierający nowe okno, ale dalej wykonuje asercje na starej stronie albo gubi kontekst użytkownika. Jeżeli test nie adresuje tego ryzyka, może być technicznie poprawny, ale mało wartościowy. Zaawansowane API Playwrighta powinno być odpowiedzią na konkretny problem, nie ozdobą kodu.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


Zaawansowane interakcje prawie zawsze wymagają lepszego przygotowania danych: osobnej sesji, osobnej roli, tokena, zasobu zewnętrznego, pliku, lokalizacji albo kontrolowanej odpowiedzi API. Dane powinny być jawne, powtarzalne i możliwe do powiązania z raportem.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


W tym module szczególnie łatwo o wyścigi. Popup trzeba oczekiwać przed kliknięciem. Odpowiedź sieci trzeba podsłuchiwać przed akcją. Ramkę trzeba zlokalizować, zanim szukasz elementu. Sesję trzeba przygotować, zanim test wystartuje. Kolejność ma znaczenie.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


Trace viewer, logi sieci, aktualny URL, nazwa ramki, stan kontekstu i załączniki z odpowiedzi API są ważniejsze niż zwykle. Gdy test przekracza granicę jednej strony, zwykły screenshot może nie wystarczyć.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


Dla scenariusza: użytkownik otwiera fakturę w nowej karcie, wraca do aplikacji i kontynuuje proces płatności zaprojektuj także awarię. Co się stanie, gdy popup się nie otworzy, ramka nie odpowie, API zwróci 500, sesja wygaśnie albo użytkownik odmówi uprawnienia? Zaawansowany test powinien sprawdzać fallback, nie tylko ścieżkę sukcesu.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


Podczas review sprawdź, czy użycie zaawansowanej techniki jest konieczne. Jeżeli prosty lokator i asercja wystarczą, nie komplikuj testu. Jeżeli technika jest potrzebna, upewnij się, że kod jasno nazywa stronę, ramkę, kontekst albo mock.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


Im więcej granic w teście, tym większy koszt utrzymania. Warto izolować odpowiedzialności: osobny helper do przygotowania sesji, osobny klient API do danych, osobny komponent do ramki płatności. Nie twórz jednak abstrakcji, która ukrywa sens scenariusza.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


Weź prosty test związany z tematem „Wiele stron i okien” i dodaj do niego diagnostykę: `test.step`, opis danych, asercję stanu końcowego i informację, gdzie szukać przyczyny po awarii. Następnie dopisz wariant negatywny.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.

