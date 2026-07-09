# Strategie uwierzytelniania

> Moduł czwarty dotyczy sytuacji, w których prosta interakcja z jedną stroną przestaje wystarczać. Nowoczesna aplikacja może otwierać popupy, osadzać iframe, używać Shadow DOM, komunikować się z wieloma API, wymagać logowania SSO, pytać o uprawnienia albo zmieniać zachowanie zależnie od urządzenia.

## Jak czytać ten moduł

W tym module najważniejsze jest rozumienie granic. Granicą może być nowa karta, ramka iframe, Shadow DOM, zewnętrzne API, sesja użytkownika, uprawnienie przeglądarki albo emulowane urządzenie. Stabilny test wie, po której stronie granicy działa i gdzie powinien szukać dowodu.

Trzy zasady przewodnie:

1. **Najpierw określ granicę systemu.** Czy testujesz aplikację, integrację z dostawcą, czy samą obsługę błędu?
2. **Nie myl realizmu z przypadkową zależnością.** Prawdziwa integracja jest wartościowa, ale nie każdy test powinien zależeć od usługi zewnętrznej.
3. **Diagnostyka musi obejmować właściwą warstwę.** Przy iframe patrz na ramkę, przy sieci na żądania, przy uwierzytelnianiu na sesję, przy urządzeniach na kontekst.


## Cel lekcji

Ta lekcja koncentruje się na: **storageState, JWT, OAuth, MFA, SSO, global setup, izolacja kont, role użytkowników i scenariusze negatywne logowania**. Główne ryzyko: **każdy test loguje się przez UI, jest wolny, zależny od jednego konta i podatny na awarie niezwiązane z celem scenariusza**. Po lekturze powinieneś umieć zaprojektować test, który świadomie przekracza granicę jednej strony i nadal pozostaje stabilny oraz diagnozowalny.

## Sytuacja przewodnia

pakiet regresji ma testować administratora, klienta i użytkownika bez uprawnień bez powtarzania logowania przez UI w każdym teście

## 1. Logowanie jako zależność

Logowanie jest często warunkiem testu, ale rzadko celem każdego testu. Jeżeli każdy scenariusz loguje się przez UI, awaria formularza logowania psuje cały pakiet.

## 2. storageState

`storageState` zapisuje ciasteczka i storage kontekstu. Pozwala szybko startować testy w stanie zalogowanym, ale wymaga odświeżania i bezpiecznego przechowywania.

## 3. Role i konta

Administrator, klient i użytkownik bez uprawnień powinni mieć oddzielne dane. Wspólne konto jest źródłem konfliktów i trudnych awarii.

## 4. OAuth, MFA i SSO

Zewnętrzne mechanizmy logowania bywają trudne do automatyzacji. Często lepsze jest przygotowanie sesji przez API, test kontraktu albo dedykowane środowisko testowe dostawcy.

## 5. Scenariusze negatywne

Nie testuj wyłącznie poprawnego logowania. Sprawdź błędne hasło, brak uprawnień, wygasłą sesję i próbę dostępu do zasobu innej roli.

## Przykład referencyjny

```typescript
// setup/auth.setup.ts
import { test as setup, expect } from '@playwright/test';

setup('zapisz stan sesji administratora', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Adres e-mail').fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel('Hasło').fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page).toHaveURL(/admin/);
  await page.context().storageState({ path: 'auth/admin.json' });
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


Dla tematu „Strategie uwierzytelniania” najpierw określ, gdzie kończy się aplikacja pod Twoją kontrolą, a gdzie zaczyna przeglądarka, dostawca, ramka, kontekst albo urządzenie. Obszar techniczny lekcji to storageState, JWT, OAuth, MFA, SSO, global setup, izolacja kont, role użytkowników i scenariusze negatywne logowania. Bez tej granicy łatwo diagnozować problem w złym miejscu.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


Najważniejsze ryzyko brzmi: każdy test loguje się przez UI, jest wolny, zależny od jednego konta i podatny na awarie niezwiązane z celem scenariusza. Jeżeli test nie adresuje tego ryzyka, może być technicznie poprawny, ale mało wartościowy. Zaawansowane API Playwrighta powinno być odpowiedzią na konkretny problem, nie ozdobą kodu.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


Zaawansowane interakcje prawie zawsze wymagają lepszego przygotowania danych: osobnej sesji, osobnej roli, tokena, zasobu zewnętrznego, pliku, lokalizacji albo kontrolowanej odpowiedzi API. Dane powinny być jawne, powtarzalne i możliwe do powiązania z raportem.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


W tym module szczególnie łatwo o wyścigi. Popup trzeba oczekiwać przed kliknięciem. Odpowiedź sieci trzeba podsłuchiwać przed akcją. Ramkę trzeba zlokalizować, zanim szukasz elementu. Sesję trzeba przygotować, zanim test wystartuje. Kolejność ma znaczenie.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


Trace viewer, logi sieci, aktualny URL, nazwa ramki, stan kontekstu i załączniki z odpowiedzi API są ważniejsze niż zwykle. Gdy test przekracza granicę jednej strony, zwykły screenshot może nie wystarczyć.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


Dla scenariusza: pakiet regresji ma testować administratora, klienta i użytkownika bez uprawnień bez powtarzania logowania przez UI w każdym teście zaprojektuj także awarię. Co się stanie, gdy popup się nie otworzy, ramka nie odpowie, API zwróci 500, sesja wygaśnie albo użytkownik odmówi uprawnienia? Zaawansowany test powinien sprawdzać fallback, nie tylko ścieżkę sukcesu.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


Podczas review sprawdź, czy użycie zaawansowanej techniki jest konieczne. Jeżeli prosty lokator i asercja wystarczą, nie komplikuj testu. Jeżeli technika jest potrzebna, upewnij się, że kod jasno nazywa stronę, ramkę, kontekst albo mock.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


Im więcej granic w teście, tym większy koszt utrzymania. Warto izolować odpowiedzialności: osobny helper do przygotowania sesji, osobny klient API do danych, osobny komponent do ramki płatności. Nie twórz jednak abstrakcji, która ukrywa sens scenariusza.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.


Weź prosty test związany z tematem „Strategie uwierzytelniania” i dodaj do niego diagnostykę: `test.step`, opis danych, asercję stanu końcowego i informację, gdzie szukać przyczyny po awarii. Następnie dopisz wariant negatywny.

W module czwartym dojrzałość polega na świadomym użyciu mocy Playwrighta. Narzędzie pozwala zrobić bardzo wiele, ale profesjonalny test robi tylko to, co służy wiarygodnej informacji o jakości.

