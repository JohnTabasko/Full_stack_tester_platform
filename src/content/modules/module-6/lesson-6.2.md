# Wzorzec strony bazowej

> Moduł szósty porządkuje architekturę kodu testowego. Wcześniejsze moduły uczyły, jak sterować przeglądarką i jak potwierdzać rezultat. Teraz pytanie brzmi: jak zorganizować ten kod, aby był czytelny, rozszerzalny i możliwy do utrzymania przez zespół.

## Jak czytać ten moduł

Nie traktuj wzorca obiektu strony jako obowiązkowego rytuału. POM jest narzędziem do zmniejszania kosztu zmiany, a nie celem samym w sobie. Dobry POM sprawia, że testy są bliżej języka domeny. Zły POM tylko przenosi chaos z testów do klas pomocniczych.

Trzy zasady modułu:

1. **Abstrakcja ma nazywać intencję.** Metoda `loginAs` jest lepsza niż `clickLoginButton`.
2. **Odpowiedzialność ma być mała.** Strona, komponent, journey i helper powinny mieć jasne granice.
3. **Czytelność testu jest nadrzędna.** Jeżeli abstrakcja utrudnia zrozumienie scenariusza, jest zła.


## Cel lekcji

Ta lekcja koncentruje się na: **wspólna klasa bazowa, nawigacja, diagnostyka, mały zakres odpowiedzialności i ryzyka dziedziczenia**. Główne ryzyko: **BasePage staje się klasą-śmietnikiem, do której trafia każda przypadkowa metoda i która wiąże ze sobą cały projekt**. Po lekturze powinieneś umieć ocenić, czy abstrakcja rzeczywiście pomaga, czy tylko ukrywa złożoność.

## Sytuacja przewodnia

zespół ma kilkanaście page objectów i chce ujednolicić nawigację, zrzuty ekranu oraz oczekiwanie na załadowanie widoku

## 1. Po co BasePage

Strona bazowa może ujednolicić nawigację, diagnostykę i oczekiwanie na załadowanie. Jest przydatna, gdy wiele stron ma wspólny model cyklu życia.

## 2. Mała odpowiedzialność

BasePage powinna mieć bardzo mały zakres. Im więcej metod bazowych, tym większe sprzężenie i ryzyko konfliktów.

## 3. Dziedziczenie kontra kompozycja

Dziedziczenie jest wygodne, ale sztywne. Jeżeli funkcjonalność dotyczy tylko części stron, często lepszy jest komponent albo helper.

## 4. expectLoaded

Każda strona powinna umieć powiedzieć, że jest gotowa do pracy. `expectLoaded` jest lepsze niż przypadkowe czekanie po `goto`.

## 5. Antywzorzec klasy-śmietnika

Jeśli w BasePage są metody do tabeli, modala, logowania, API i koszyka, klasa straciła sens. Rozbij odpowiedzialności.

## Przykład referencyjny

```typescript
import { expect, type Page } from '@playwright/test';

export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  abstract readonly path: string;
  abstract expectLoaded(): Promise<void>;

  async goto() {
    await this.page.goto(this.path);
    await this.expectLoaded();
  }

  async attachScreenshot(name: string) {
    return this.page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
  }
}

export class ProfilePage extends BasePage {
  readonly path = '/profile';

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Profil' })).toBeVisible();
  }
}
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
