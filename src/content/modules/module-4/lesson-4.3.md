# Shadow DOM

> Moduł czwarty dotyczy sytuacji, w których prosta interakcja z jedną stroną przestaje wystarczać. Nowoczesna aplikacja może otwierać popupy, osadzać iframe, używać Shadow DOM, komunikować się z wieloma API, wymagać logowania SSO, pytać o uprawnienia albo zmieniać zachowanie zależnie od urządzenia.

## Jak czytać ten moduł

W tym module najważniejsze jest rozumienie granic. Granicą może być nowa karta, ramka iframe, Shadow DOM, zewnętrzne API, sesja użytkownika, uprawnienie przeglądarki albo emulowane urządzenie. Stabilny test wie, po której stronie granicy działa i gdzie powinien szukać dowodu.

Trzy zasady przewodnie:

1. **Najpierw określ granicę systemu.** Czy testujesz aplikację, integrację z dostawcą, czy samą obsługę błędu?
2. **Nie myl realizmu z przypadkową zależnością.** Prawdziwa integracja jest wartościowa, ale nie każdy test powinien zależeć od usługi zewnętrznej.
3. **Diagnostyka musi obejmować właściwą warstwę.** Przy iframe patrz na ramkę, przy sieci na żądania, przy uwierzytelnianiu na sesję, przy urządzeniach na kontekst.


## Cel lekcji

Ta lekcja koncentruje się na: **Web Components, otwarty i zamknięty Shadow DOM, sloty, kontrakt publiczny komponentu i strategie testowania komponentów izolowanych**. Główne ryzyko: **test próbuje wejść w szczegóły implementacji komponentu, zamiast sprawdzić jego publiczne zachowanie**. Po lekturze powinieneś umieć zaprojektować test, który świadomie przekracza granicę jednej strony i nadal pozostaje stabilny oraz diagnozowalny.

## Sytuacja przewodnia

aplikacja używa komponentu webowego wyboru daty, którego struktura wewnętrzna jest ukryta za Shadow DOM

## 1. Po co istnieje Shadow DOM

Shadow DOM izoluje strukturę i style komponentu. Dla twórcy komponentu to mechanizm hermetyzacji. Dla testera to sygnał, że nie każda wewnętrzna struktura jest częścią kontraktu.

## 2. Otwarty Shadow DOM

Playwright potrafi przechodzić przez otwarty Shadow DOM w wielu lokatorach. Nadal warto preferować role, etykiety i tekst zamiast szczegółów wewnętrznego drzewa.

## 3. Zamknięty Shadow DOM

Zamknięty Shadow DOM nie pozwala testowi wejść do środka. Wtedy testuj przez publiczny interfejs komponentu, zdarzenia, wartości pól albo warstwę komponentową.

## 4. Sloty

Sloty pozwalają wstrzykiwać treść do komponentu. Test powinien sprawdzać, czy komponent poprawnie prezentuje treść i reaguje na interakcje, a nie wyłącznie strukturę slotów.

## 5. Granica testowania

Jeżeli test zależy od wewnętrznego selektora komponentu, prawdopodobnie jest zbyt blisko implementacji. Lepszy test sprawdza zachowanie użytkowe.

## Przykład referencyjny

```typescript
await page.goto('/booking');

await page.getByRole('button', { name: 'Wybierz datę' }).click();
await page.getByRole('gridcell', { name: '21' }).click();
await expect(page.getByLabel('Data rezerwacji')).toHaveValue(/21/);
```

Przykład pokazuje, że zaawansowana funkcja Playwrighta ma sens dopiero wtedy, gdy prowadzi do asercji skutku. Samo przełączenie strony, ramki, mocka lub kontekstu nie jest testem. Testem jest dowód, że aplikacja zareagowała poprawnie.

## Lista kontrolna

- Czy test działa we właściwej stronie, ramce albo kontekście?
- Czy granica systemu jest świadomie określona?
- Czy mock nie ukrywa integracji, którą trzeba sprawdzić?
- Czy dane sesji i uprawnienia są izolowane?
- Czy po awarii trace i logi pokażą właściwą warstwę problemu?
- Czy scenariusz ma wariant negatywny lub fallback?


Dla tematu „Shadow DOM” najpierw określ, gdzie kończy się aplikacja pod Twoją kontrolą, a gdzie zaczyna przeglądarka, dostawca, ramka, kontekst albo urządzenie. Obszar techniczny lekcji to Web Components, otwarty i zamknięty Shadow DOM, sloty, kontrakt publiczny komponentu i strategie testowania komponentów izolowanych. Bez tej granicy łatwo diagnozować problem w złym miejscu.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


Najważniejsze ryzyko brzmi: test próbuje wejść w szczegóły implementacji komponentu, zamiast sprawdzić jego publiczne zachowanie. Jeżeli test nie adresuje tego ryzyka, może być technicznie poprawny, ale mało wartościowy. Zaawansowane API Playwrighta powinno być odpowiedzią na konkretny problem, nie ozdobą kodu.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


Zaawansowane interakcje prawie zawsze wymagają lepszego przygotowania danych: osobnej sesji, osobnej roli, tokena, zasobu zewnętrznego, pliku, lokalizacji albo kontrolowanej odpowiedzi API. Dane powinny być jawne, powtarzalne i możliwe do powiązania z raportem.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


W tym module szczególnie łatwo o wyścigi. Popup trzeba oczekiwać przed kliknięciem. Odpowiedź sieci trzeba podsłuchiwać przed akcją. Ramkę trzeba zlokalizować, zanim szukasz elementu. Sesję trzeba przygotować, zanim test wystartuje. Kolejność ma znaczenie.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


Trace viewer, logi sieci, aktualny URL, nazwa ramki, stan kontekstu i załączniki z odpowiedzi API są ważniejsze niż zwykle. Gdy test przekracza granicę jednej strony, zwykły screenshot może nie wystarczyć.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


Dla scenariusza: aplikacja używa komponentu webowego wyboru daty, którego struktura wewnętrzna jest ukryta za Shadow DOM zaprojektuj także awarię. Co się stanie, gdy popup się nie otworzy, ramka nie odpowie, API zwróci 500, sesja wygaśnie albo użytkownik odmówi uprawnienia? Zaawansowany test powinien sprawdzać fallback, nie tylko ścieżkę sukcesu.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


Podczas review sprawdź, czy użycie zaawansowanej techniki jest konieczne. Jeżeli prosty lokator i asercja wystarczą, nie komplikuj testu. Jeżeli technika jest potrzebna, upewnij się, że kod jasno nazywa stronę, ramkę, kontekst albo mock.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


Im więcej granic w teście, tym większy koszt utrzymania. Warto izolować odpowiedzialności: osobny helper do przygotowania sesji, osobny klient API do danych, osobny komponent do ramki płatności. Nie twórz jednak abstrakcji, która ukrywa sens scenariusza.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


Weź prosty test związany z tematem „Shadow DOM” i dodaj do niego diagnostykę: `test.step`, opis danych, asercję stanu końcowego i informację, gdzie szukać przyczyny po awarii. Następnie dopisz wariant negatywny.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.

## 📘 Suplement Inżynieryjny 2026: Mechanizmy Zaawansowane (Dialogs & Interception)
*Inspiracja: „Hands-On Automated Testing with Playwright” (2026), Chapter 11 & 12*
*   **Event-First Pattern dla Dialogów**: Playwright automatycznie odrzuca systemowe dialogi (`alert`, `confirm`). Jeśli chcesz je zatwierdzić, musisz zarejestrować subskrypcję zdarzenia *przed* wywołaniem akcji wyzwalającej: `page.once('dialog', dialog => dialog.accept())`.
*   **Intercepcja Sieciowa (`route.fallback`)**: Nowoczesne mockowanie API opiera się na elastycznych regułach przechwytywania, umożliwiających przekazywanie żądań do rzeczywistego serwera lub nadpisywanie nagłówków w locie.
