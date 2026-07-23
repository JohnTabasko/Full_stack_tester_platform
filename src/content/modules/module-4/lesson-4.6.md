# Geolokalizacja, uprawnienia i emulacja urządzeń

> Moduł czwarty dotyczy sytuacji, w których prosta interakcja z jedną stroną przestaje wystarczać. Nowoczesna aplikacja może otwierać popupy, osadzać iframe, używać Shadow DOM, komunikować się z wieloma API, wymagać logowania SSO, pytać o uprawnienia albo zmieniać zachowanie zależnie od urządzenia.

## Jak czytać ten moduł

W tym module najważniejsze jest rozumienie granic. Granicą może być nowa karta, ramka iframe, Shadow DOM, zewnętrzne API, sesja użytkownika, uprawnienie przeglądarki albo emulowane urządzenie. Stabilny test wie, po której stronie granicy działa i gdzie powinien szukać dowodu.

Trzy zasady przewodnie:

1. **Najpierw określ granicę systemu.** Czy testujesz aplikację, integrację z dostawcą, czy samą obsługę błędu?
2. **Nie myl realizmu z przypadkową zależnością.** Prawdziwa integracja jest wartościowa, ale nie każdy test powinien zależeć od usługi zewnętrznej.
3. **Diagnostyka musi obejmować właściwą warstwę.** Przy iframe patrz na ramkę, przy sieci na żądania, przy uwierzytelnianiu na sesję, przy urządzeniach na kontekst.


## Cel lekcji

Ta lekcja koncentruje się na: **geolokalizacja, permissions, locale, timezone, dark mode, offline mode, viewport, urządzenia i emulacja warunków środowiskowych**. Główne ryzyko: **test działa tylko w domyślnym desktopowym środowisku, mimo że użytkownicy korzystają z różnych lokalizacji, uprawnień, języków, trybów i urządzeń**. Po lekturze powinieneś umieć zaprojektować test, który świadomie przekracza granicę jednej strony i nadal pozostaje stabilny oraz diagnozowalny.

## Sytuacja przewodnia

aplikacja pokazuje najbliższy punkt odbioru na podstawie lokalizacji i musi działać także przy odmowie uprawnienia

## 1. Geolokalizacja

Geolokalizacja jest częścią kontekstu przeglądarki. Test powinien ustawić współrzędne i uprawnienie, a następnie sprawdzić widoczny skutek w aplikacji.

## 2. Uprawnienia

Kamera, mikrofon, lokalizacja i powiadomienia wymagają decyzji użytkownika. Testuj zarówno zgodę, jak i odmowę, bo aplikacja musi mieć sensowny fallback.

## 3. Locale i timezone

Język i strefa czasowa wpływają na daty, liczby, waluty i teksty. Bez stabilizacji testy mogą padać zależnie od maszyny CI.

## 4. Dark mode i media

Tryb ciemny, prefers-reduced-motion i inne media features wpływają na wygląd oraz zachowanie. Testuj je świadomie, zwłaszcza przy testach wizualnych.

## 5. Offline mode i urządzenia

Tryb offline oraz emulacja urządzeń pomagają sprawdzić warunki brzegowe, ale nie zastępują testów na prawdziwych urządzeniach dla krytycznych przepływów mobilnych.

## Przykład referencyjny

```typescript
const context = await browser.newContext({
  geolocation: { latitude: 52.2297, longitude: 21.0122 },
  permissions: ['geolocation'],
  locale: 'pl-PL',
  timezoneId: 'Europe/Warsaw',
});

const page = await context.newPage();
await page.goto('/pickup-points');
await expect(page.getByText('Warszawa')).toBeVisible();
```

Przykład pokazuje, że zaawansowana funkcja Playwrighta ma sens dopiero wtedy, gdy prowadzi do asercji skutku. Samo przełączenie strony, ramki, mocka lub kontekstu nie jest testem. Testem jest dowód, że aplikacja zareagowała poprawnie.

## Lista kontrolna

- Czy test działa we właściwej stronie, ramce albo kontekście?
- Czy granica systemu jest świadomie określona?
- Czy mock nie ukrywa integracji, którą trzeba sprawdzić?
- Czy dane sesji i uprawnienia są izolowane?
- Czy po awarii trace i logi pokażą właściwą warstwę problemu?
- Czy scenariusz ma wariant negatywny lub fallback?


Dla tematu „Geolokalizacja, uprawnienia i emulacja urządzeń” najpierw określ, gdzie kończy się aplikacja pod Twoją kontrolą, a gdzie zaczyna przeglądarka, dostawca, ramka, kontekst albo urządzenie. Obszar techniczny lekcji to geolokalizacja, permissions, locale, timezone, dark mode, offline mode, viewport, urządzenia i emulacja warunków środowiskowych. Bez tej granicy łatwo diagnozować problem w złym miejscu.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


Najważniejsze ryzyko brzmi: test działa tylko w domyślnym desktopowym środowisku, mimo że użytkownicy korzystają z różnych lokalizacji, uprawnień, języków, trybów i urządzeń. Jeżeli test nie adresuje tego ryzyka, może być technicznie poprawny, ale mało wartościowy. Zaawansowane API Playwrighta powinno być odpowiedzią na konkretny problem, nie ozdobą kodu.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


Zaawansowane interakcje prawie zawsze wymagają lepszego przygotowania danych: osobnej sesji, osobnej roli, tokena, zasobu zewnętrznego, pliku, lokalizacji albo kontrolowanej odpowiedzi API. Dane powinny być jawne, powtarzalne i możliwe do powiązania z raportem.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


W tym module szczególnie łatwo o wyścigi. Popup trzeba oczekiwać przed kliknięciem. Odpowiedź sieci trzeba podsłuchiwać przed akcją. Ramkę trzeba zlokalizować, zanim szukasz elementu. Sesję trzeba przygotować, zanim test wystartuje. Kolejność ma znaczenie.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


Trace viewer, logi sieci, aktualny URL, nazwa ramki, stan kontekstu i załączniki z odpowiedzi API są ważniejsze niż zwykle. Gdy test przekracza granicę jednej strony, zwykły screenshot może nie wystarczyć.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


Dla scenariusza: aplikacja pokazuje najbliższy punkt odbioru na podstawie lokalizacji i musi działać także przy odmowie uprawnienia zaprojektuj także awarię. Co się stanie, gdy popup się nie otworzy, ramka nie odpowie, API zwróci 500, sesja wygaśnie albo użytkownik odmówi uprawnienia? Zaawansowany test powinien sprawdzać fallback, nie tylko ścieżkę sukcesu.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


Podczas review sprawdź, czy użycie zaawansowanej techniki jest konieczne. Jeżeli prosty lokator i asercja wystarczą, nie komplikuj testu. Jeżeli technika jest potrzebna, upewnij się, że kod jasno nazywa stronę, ramkę, kontekst albo mock.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


Im więcej granic w teście, tym większy koszt utrzymania. Warto izolować odpowiedzialności: osobny helper do przygotowania sesji, osobny klient API do danych, osobny komponent do ramki płatności. Nie twórz jednak abstrakcji, która ukrywa sens scenariusza.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


Weź prosty test związany z tematem „Geolokalizacja, uprawnienia i emulacja urządzeń” i dodaj do niego diagnostykę: `test.step`, opis danych, asercję stanu końcowego i informację, gdzie szukać przyczyny po awarii. Następnie dopisz wariant negatywny.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.

## 📘 Suplement Inżynieryjny 2026: Mechanizmy Zaawansowane (Dialogs & Interception)
*Inspiracja: „Hands-On Automated Testing with Playwright” (2026), Chapter 11 & 12*
*   **Event-First Pattern dla Dialogów**: Playwright automatycznie odrzuca systemowe dialogi (`alert`, `confirm`). Jeśli chcesz je zatwierdzić, musisz zarejestrować subskrypcję zdarzenia *przed* wywołaniem akcji wyzwalającej: `page.once('dialog', dialog => dialog.accept())`.
*   **Intercepcja Sieciowa (`route.fallback`)**: Nowoczesne mockowanie API opiera się na elastycznych regułach przechwytywania, umożliwiających przekazywanie żądań do rzeczywistego serwera lub nadpisywanie nagłówków w locie.
