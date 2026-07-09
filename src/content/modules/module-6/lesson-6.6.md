# Wzorzec obiektu strony z fiksturami

> Moduł szósty porządkuje architekturę kodu testowego. Wcześniejsze moduły uczyły, jak sterować przeglądarką i jak potwierdzać rezultat. Teraz pytanie brzmi: jak zorganizować ten kod, aby był czytelny, rozszerzalny i możliwy do utrzymania przez zespół.

## Jak czytać ten moduł

Nie traktuj wzorca obiektu strony jako obowiązkowego rytuału. POM jest narzędziem do zmniejszania kosztu zmiany, a nie celem samym w sobie. Dobry POM sprawia, że testy są bliżej języka domeny. Zły POM tylko przenosi chaos z testów do klas pomocniczych.

Trzy zasady modułu:

1. **Abstrakcja ma nazywać intencję.** Metoda `loginAs` jest lepsza niż `clickLoginButton`.
2. **Odpowiedzialność ma być mała.** Strona, komponent, journey i helper powinny mieć jasne granice.
3. **Czytelność testu jest nadrzędna.** Jeżeli abstrakcja utrudnia zrozumienie scenariusza, jest zła.


## Cel lekcji

Ta lekcja koncentruje się na: **page object jako fikstura, fikstura aplikacji, automatyczne fikstury, fikstury workerowe i migracja z ręcznego new PageObject**. Główne ryzyko: **każdy test ręcznie tworzy obiekty stron, powiela setup i miesza odpowiedzialność testu z konfiguracją zależności**. Po lekturze powinieneś umieć ocenić, czy abstrakcja rzeczywiście pomaga, czy tylko ukrywa złożoność.

## Sytuacja przewodnia

zespół chce, aby testy dostawały gotowe obiekty `loginPage`, `dashboardPage` i `ordersClient` bez ręcznego tworzenia w każdym pliku

## 1. Dlaczego łączyć POM z fiksturami

Fixture dostarcza zależności testowi. Page object jest zależnością. Połączenie tych mechanizmów zmniejsza powtarzanie i ujednolica sposób tworzenia obiektów.

## 2. Ręczne new PageObject

Ręczne tworzenie obiektów w każdym teście jest akceptowalne na początku, ale z czasem prowadzi do duplikacji i niespójności.

## 3. Fikstura aplikacji

W większych projektach można dostarczać obiekt `app`, który grupuje strony i komponenty. Trzeba uważać, aby nie stał się kolejnym God Object.

## 4. Automatyczne fikstury

Auto-fixtures są dobre do diagnostyki albo globalnych przygotowań, ale łatwo ukryć w nich zbyt dużo magii.

## 5. Migracja

Migrację zacznij od najczęściej używanych page objectów. Nie przepisuj całego projektu naraz, jeśli możesz wprowadzać wzorzec stopniowo.

## Przykład referencyjny

```typescript
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

type PageObjects = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

export const test = base.extend<PageObjects>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});
```

Przykład pokazuje kierunek projektowania: klasa lub komponent ma jedną odpowiedzialność, używa stabilnych lokatorów i nie ukrywa celu testu.

## Lista kontrolna

- Czy nazwa klasy odpowiada odpowiedzialności?
- Czy metoda opisuje zachowanie, a nie techniczny klik?
- Czy lokatory są semantyczne lub świadomie oparte o test id?
- Czy klasa nie zna zbyt wielu obszarów produktu?
- Czy test po użyciu abstrakcji nadal jest zrozumiały?
- Czy awaria prowadzi do czytelnej przyczyny?


## Dobre praktyki i perspektywa inżynierska
Automatyzacja to proces ciągłego doskonalenia. Aby Twoje testy niosły realną wartość, stosuj się do poniższych zasad:
- **Testuj zachowanie, nie kod**: Skup się na tym, co widzi i robi użytkownik. Zmienne nazwy klas CSS nie powinny psuć Twoich testów.
- **Fail-fast**: Test powinien dawać jasny sygnał o błędzie tak szybko, jak to możliwe. Unikaj "wiszących" testów, które blokują kolejkę CI.
- **Ewoluuj**: Regularnie przeglądaj swoje testy. Usuwaj te, które są niestabilne i nie dają wartości, a refaktoryzuj te, które stają się zbyt skomplikowane.
