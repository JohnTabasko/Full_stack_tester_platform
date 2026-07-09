# AI i LLM w pracy Testera — kompletny przewodnik

> **Perspektywa Full Stack Testera**
> Sztuczna Inteligencja nie zastąpi testera, ale tester używający AI zastąpi tego, który go nie używa. To nie jest hype — to realna zmiana w sposobie pracy. Modele językowe (LLM) takie jak Claude, ChatGPT czy Gemini potrafią: generować scenariusze testowe z wymagań, pisać kod Playwright szybciej niż człowiek, analizować błędy i proponować rozwiązania, refaktoryzować istniejący kod testowy. Ale mają też ograniczenia — halucynują metody, które nie istnieją, nie znają Twojej specyficznej domeny, mogą wyciekać poufne dane. Jako Full Stack Tester musisz wiedzieć, jak mądrze korzystać z AI, aby przyspieszyć pracę bez utraty jakości i bezpieczeństwa.

## Cel lekcji

Po ukończeniu tej lekcji rozumiesz możliwości i ograniczenia LLM w kontekście testowania, potrafisz skutecznie formułować prompty do generowania scenariuszy testowych i kodu, znasz narzędzia AI wspierające pracę z Playwright (GitHub Copilot, Cursor, Claude), rozumiesz ryzyka związane z używaniem AI w środowisku produkcyjnym, potrafisz weryfikować wyjście AI względem dokumentacji, i wiesz, jak zbudować własny workflow AI-assisted testing.

---

## Dlaczego AI zmienia pracę testera

### Co AI robi dobrze (i szybko)

LLM-y są szczególnie skuteczne w zadaniach, które wymagają:
- **Powtarzalnego wzorca**: Pisanie Page Objectów, asercji, fixture'ów — wszystko, co ma znaną strukturę.
- **Transformacji tekstu**: Konwersja wymagań w formacie Gherkin do kodu Playwright.
- **Analizy błędów**: Wklejenie stack trace'a i uzyskanie wyjaśnienia, co poszło nie tak.
- **Refaktoryzacji**: Przekształcenie starego kodu testowego na nowy wzorzec.
- **Brainstormingu**: Generowanie listy przypadków testowych, gdy masz wymagania, ale nie masz inspiracji.

### Co AI robi źle (lub nie robi wcale)

- **Nie zna Twojej aplikacji**: Nie rozumie Twojej domeny biznesowej, specyficznych flow,edge case'ów.
- **Halucynuje**: Może wymyślić metodę Playwrighta, która nie istnieje (`page.waitForSelectorThatExists()`).
- **Nie testuje krytycznych ścieżek automatycznie**: AI wygeneruje kod, ale nie uruchomi go w prawdziwej przeglądarce.
- **Nie rozumie bezpieczeństwa danych**: Nie wie, że wklejasz poufne informacje.

### Realny impact AI na workflow testera

Badania i obserwacje praktyków pokazują:
- **GitHub Copilot**: Przyspieszenie pisania kodu o **25-40%** (źródło: GitHub Next research).
- **Generowanie scenariuszy**: Z wymagań tekstowych → gotowa lista test case'ów w **minuty** zamiast **godzin**.
- **Debugowanie**: Analiza stack trace'a z pomocą LLM → **30-50% szybsza diagnoza** błędu.
- **Refaktoryzacja**: Przekształcenie suity testowej na POM → **10x szybsze** z AI assistance.

Te liczby nie oznaczają, że AI zastąpi testera. Oznaczają, że tester z AI może zrobić **10x więcej** niż tester bez niego — ale tylko jeśli wie, jak z niego korzystać mądrze.

---

## Prompt Engineering dla testera automatycznego

### Filozofia: Prompt to specyfikacja, nie pytanie

Prompt Engineering (inżynieria promptów) to umiejętność formułowania instrukcji dla LLM w sposób, który daje użyteczne, dokładne odpowiedzi. To **sztuka, nie nauka** — ale ma swoje zasady.

### Zasada 1: Daj kontekst

```typescript
// ❌ Słaby prompt — brak kontekstu
"napisz test Playwright"

// ✅ Dobry prompt — pełen kontekst
"Piszę testy Playwright dla aplikacji e-commerce w Next.js.
Używam TypeScript, Playwright Test i wzorca Page Object Model.
Mam stronę koszyka z przyciskiem 'Złóż zamówienie'.
Napisz metodę submitOrder() w klasie CartPage.ts,
która klika przycisk i czeka na przekierowanie do strony /order-confirmation.
Użyj getByRole() dla lokatorów i expect() dla asercji."
```

### Zasada 2: Określ format wyjścia

```typescript
// ❌ Słaby prompt — nieokreślony format
"napisz przypadki testowe dla formularza kontaktowego"

// ✅ Dobry prompt — określony format
"Napisz przypadki testowe dla formularza kontaktowego w formacie Gherkin.
Format: Feature: ... Scenario: ... Given/When/Then ...
Uwzględnij: pozytywne (poprawny email, poprawna wiadomość),
negatywne (pusty email, zły format, za krótka wiadomość <10 znaków),
brzegowe (email z polskimi znakami, wiadomość dokładnie 10 znaków).
Dla każdego scenariusza podaj Expected Result."
```

### Zasada 3: Podaj przykład (Few-shot prompting)

```typescript
// ❌ Słaby prompt — bez przykładu
"napisz Page Object dla strony logowania"

// ✅ Dobry prompt — z przykładem stylu
"Piszę Page Object dla strony logowania. Styl kodu:
class LoginPage {
  private readonly emailInput = this.page.getByLabel('Email');
  private readonly passwordInput = this.page.getByLabel('Hasło');
  private readonly submitButton = this.page.getByRole('button', { name: 'Zaloguj' });
  
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

Na tej podstawie napisz analogiczną klasę ProductPage dla strony /products.
Zawiera: input wyszukiwania, filtr kategorii, lista produktów, przycisk 'Do koszyka'.
Użyj tego samego stylu (prywatne lokatory, metody biznesowe)."
```

### Zasada 4: Określ ograniczenia

```typescript
// ❌ Słaby prompt — bez ograniczeń
"napisz test API dla endpointu /api/users"

// ✅ Dobry prompt — z ograniczeniami
"Napisz test API dla endpointu POST /api/users.
Ograniczenia:
- Używaj fixture 'request' z Playwright (nie axios/fetch)
- Weryfikuj status 201 Created i nagłówek Location
- Sprawdź, że odpowiedź zawiera id i email (NIE hasło)
- Stwórz unikalny email przez timestamp (nie hardkoduj)
- Dodaj cleanup: usuń użytkownika po teście
- Wpisz sekcję // Arrange / // Act / // Assert"
```

---

## Praktyczne workflow AI-assisted testing

### Workflow 1: Generowanie scenariuszy z wymagań

```typescript
/**
 * PROMPT: "Mam funkcję resetowania hasła z następującymi wymaganiami:
 * - Min 8 znaków
 * - Min 1 wielka litera
 * - Min 1 cyfra
 * - Min 1 znak specjalny (!@#$%^&*)
 * - Link aktywacyjny ważny 1 godzinę
 * - Po kliknięciu linku — formularz do ustawienia nowego hasła
 * - Nie można użyć poprzedniego hasła jako nowego
 * 
 * Wygeneruj listę przypadków testowych w formacie Gherkin (Scenario: Given/When/Then)
 * Dla każdego scenariusza podaj: Category (positive/negative/boundary), 
 * Priority (critical/high/medium/low), Expected Result"
 */

// OUTPUT AI (przykładowy):
/*
Feature: Resetowanie hasła

Background:
  Given Użytkownik jest na stronie /forgot-password

Scenario: Poprawne żądanie resetu — email wysyła się natychmiast
  Given Użytkownik wprowadza prawidłowy email "jan@example.pl"
  When Klikną przycisk "Wyślij link"
  Then System wysyła email z linkiem na adres "jan@example.pl"
  And Link jest ważny przez 1 godzinę
  And Komunikat "Link został wysłany" jest widoczny na stronie

Scenario: Email w nieprawidłowym formacie — błąd walidacji
  Given Użytkownik wprowadza email "nie-prawidlowy-email"
  When Klikną przycisk "Wyślij link"
  Then Błąd "Podaj prawidłowy adres email" jest widoczny
  And Email nie jest wysyłany

// ... (kontynuuj dla wszystkich przypadków)
*/
```

### Workflow 2: Pisanie kodu Playwright z AI

```typescript
/**
 * PROMPT: "Napisz Page Object dla strony logowania w Playwright + TypeScript.
 * Struktura strony:
 * - Pole tekstowe: <input id="login-email" type="email" placeholder="Email">
 * - Pole hasła: <input id="login-password" type="password">
 * - Przycisk: <button type="submit" id="login-submit">Zaloguj się</button>
 * - Link: <a href="/register">Nie masz konta? Zarejestruj się</a>
 * - Komunikat błędu: <div class="error-message" role="alert"></div>
 * 
 * Wymagania:
 * - Użyj getByRole i getByText dla lokatorów (nie ID)
 * - Dodaj metodę login(email, password) — pełny flow w jednej metodzie
 * - Dodaj metodę loginWithInvalidCredentials(email, password) — weryfikacja błędu
 * - Dodaj getter na isErrorVisible() dla asercji w testach
 * - Użyj TypeScript z prywatnymi lokatorami readonly"
 */

// OUTPUT AI (przykładowy):
/*
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;
  private readonly registerLink: Locator;
  private readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = this.page.getByRole('textbox', { name: /email/i });
    this.passwordInput = this.page.getByRole('textbox', { name: /hasło/i });
    this.submitButton = this.page.getByRole('button', { name: /zaloguj się/i });
    this.registerLink = this.page.getByRole('link', { name: /nie masz konta/i });
    this.errorMessage = this.page.getByRole('alert');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.page.waitForURL(/\/(dashboard|home)/);
  }

  async loginWithInvalidCredentials(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
  }

  get isErrorVisible(): Locator {
    return this.errorMessage;
  }
}
*/
```

### Workflow 3: Analiza błędów z AI

```typescript
/**
 * PROMPT: "Mój test Playwright rzuca TimeoutError na metodzie click().
 * Oto fragment Trace Viewera:
 * 
 * Error: TimeoutError: Timed out 30000ms waiting for the element to be 
 * visible, enabled and stable.
 * Element: <button class="btn-primary">Złóż zamówienie</button>
 * 
 * Action: click
 * Timeout: 30000ms
 * State at failure: Element was visible but "not stable" (was animating)
 * 
 * Kod testu:
 * await page.locator('button.btn-primary').click();
 * 
 * Co może być przyczyną i jak to naprawić? Podaj konkretne rozwiązanie."
 */

// OUTPUT AI:
/*
Przyczyna: Element "Złóż zamówienie" ma animację CSS (np. transition, 
@keyframes), która sprawia, że Playwright uznaje go za "not stable" 
(przez 30 sekund, dopóki animacja się nie zakończy lub timeout nie nastąpi).

Rozwiązania:
1. Poczekaj na zakończenie animacji:
   await page.locator('button.btn-primary').evaluate(el => {
     const s = getComputedStyle(el);
     // Sprawdź czy transition jest aktywny
   });
   await page.waitForTimeout(100); // Po animacji

2. Wyłącz animacje w CSS przed testem:
   await page.addStyleTag({ content: '*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }' });

3. Użyj force: true (jeśli animacja jest czysto kosmetyczna i nie wpływa na działanie):
   await page.locator('button.btn-primary').click({ force: true });

4. Sprawdź w Trace Viewerze, co dokładnie dzieje się z elementem 
   przez te 30 sekund — może się okazać, że przycisk jest zasłonięty 
   przez overlay (modal) zamiast animacji.
*/
```

---

## Narzędzia AI dla testera Playwright

### GitHub Copilot — autouzupełnianie kodu

GitHub Copilot to najpopularniejsze narzędzie AI dla programistów. Integruje się bezpośrednio z VS Code:

```typescript
// Piszesz komentarz/opis → Copilot podpowiada kod
// Wpisz:
// test('użytkownik loguje się i widzi dashboard')
// → Copilot automatycznie zasugeruje:
// → await page.goto('/login');
// → await page.getByLabel('Email').fill('test@example.com');
// → // ... itd.
```

**Konfiguracja dla Playwrighta w VS Code:**
```json
// .vscode/settings.json
{
  "github.copilot.enable": {
    "*": true,
    "typescript": true,
    "plaintext": false
  }
}
```

**Tip**: Nazywaj testy opisowo — Copilot uczy się na nazwie testu i generuje lepsze podpowiedzi:

```typescript
// ✅ Dobre nazwy testów → lepsze podpowiedzi Copilota
test('zalogowany użytkownik może dodać produkt do koszyka przez stronę produktu', async ({ page }) => { ... })
test('nieprawidłowe dane logowania wyświetlają komunikat błędu bez przekierowania', async ({ page }) => { ... })

// ❌ Słabe nazwy → gorsze podpowiedzi
test('test loginu', async ({ page }) => { ... })
test('add to cart', async ({ page }) => { ... })
```

### Claude (Anthropic) — analiza i generowanie

Claude jest szczególnie silny w:
- **Analizie wymagań**: Wklej specyfikację → dostajesz listę przypadków testowych.
- **Refaktoryzacji**: Wklej stary kod → dostajesz zrefaktoryzowaną wersję.
- **Debugowaniu**: Wklej błąd + kod → dostajesz diagnozę i rozwiązanie.
- **Nauce**: "Wyjaśnij mi, jak działa page.route() w Playwright" → dostajesz szczegółową odpowiedź.

### Cursor — IDE z natywnym AI

Cursor to IDE zbudowane na VS Code z głęboką integracją AI (Claude, GPT-4). Oferuje:
- **Inline AI**: Edytuj kod z asystą AI bezpośrednio w edytorze.
- **Chat w kontekście**: AI widzi Twój kod i może na nim operować.
- **Automatyczne apply**: AI może bezpośrednio edytować pliki.

---

## Ryzyka i ograniczenia — co musisz wiedzieć

### Ryzyko 1: Halucynacje — wymyślone metody API

LLM może wymyślić metodę Playwrighta, która nie istnieje:

```typescript
// ❌ Co AI może "wymyślić" (nie istnieje w Playwright!)
await page.waitForSelectorThatExists('#button');     // ❌ Takiej metody nie ma!
await page.waitForElementToBeStable('#loading');     // ❌ Nie istnieje!
await expect(page).toContainElement('#result');      // ❌ Zła składnia!
// Correct: await expect(page.locator('#result')).toBeVisible();

// ✅ Zawsze weryfikuj z dokumentacją
// https://playwright.dev/docs/api/class-page
// https://playwright.dev/docs/api/class-locator
```

**Zasada weryfikacji**: Gdy AI poda kod, sprawdź każdą metodę w [oficjalnej dokumentacji Playwright](https://playwright.dev/docs/api/) zanim użyjesz jej w projekcie.

### Ryzyko 2: Wyciek poufnych danych

Publiczne LLM (ChatGPT bez konfiguracji enterprise) uczą się na danych, które im podajesz. To oznacza, że Twój kod produkcyjny, klucze API czy dane osobowe klientów mogą wyciec:

```typescript
// ❌ NIGDY nie wklejaj do publicznych czatów:
const apiKey = process.env.STRIPE_SECRET_KEY; // Klucz Stripe!
const userData = await db.users.findAll(); // Dane klientów z bazy!
const password = 'SuperSecret123!'; // Hasła produkcyjne!

// ✅ Używaj lokalnych modeli lub narzędzi enterprise:
- GitHub Copilot (nie uczy się na Twoim kodzie w planie Team/Enterprise)
- Claude (tryb API z zachowaniem prywatności)
- Lokalne LLM (Ollama, LM Studio) — 100% offline

// ✅ Jeśli musisz użyć publicznego chatu:
1. Zmodyfikuj dane (fake email zamiast prawdziwego)
2. Usuń klucze API, hasła, numery kont
3. Uprość kod do minimum demonstracyjnego
4. Sprawdź polityki prywatności swojej firmy
```

### Ryzyko 3: Prawa autorskie do kodu

Wiele firm ma polityki, które zabraniają wklejania kodu produkcyjnego do zewnętrznych narzędzi AI. Sprawdź:
- Umowę z pracodawcą (IP clause).
- Politykę bezpieczeństwa IT.
- Regulamin usługi AI, z której korzystasz.

**Zasada bezpieczeństwa**: Gdy wątpisz — nie wklejaj. Używaj synthetic data i uproszczonych przykładów.

### Ryzyko 4: Fałszywe poczucie jakości

AI wygeneruje kod, który "wygląda dobrze" — ale nie uruchomi go, nie zobaczy, czy działa. To może prowadzić do:
- Przekonania, że test jest gotowy, gdy w rzeczywistości ma błędy.
- Copy-paste kodu bez zrozumienia, co robi.
- Zaufania do testu, który nie testuje tego, co powinien.

**Zasada**: AI generuje kod — ty go uruchamiasz, weryfikujesz i utrzymujesz. Odpowiedzialność za jakość zawsze leży po stronie testera.

---

## Efektywny workflow AI-assisted w codziennej pracy

### Codzienny workflow

```
1. Rano: Przegląd wymagań → AI generuje scenariusze testowe → weryfikacja z PM
2. Development: Copilot autouzupełnia kod → reviewer sprawdza → commit
3. Debugowanie: Błąd w CI → wklejenie trace do Claude → diagnoza → fix
4. Refaktoryzacja: Stary kod → Claude refaktoryzuje → weryfikacja → merge
5. Learning: "Jak działa X?" → zapytanie do Claude → szczegółowa odpowiedź
```

### Checklist przed użyciem AI

Przed użyciem wyjścia AI w kodzie produkcyjnym, sprawdź:

- [ ] Czy użyte metody istnieją w oficjalnej dokumentacji Playwright?
- [ ] Czy kod jest zgodny ze stylem projektu (POM, fixtures, naming)?
- [ ] Czy nie ma poufnych danych w prompcie lub wyjściu?
- [ ] Czy test faktycznie testuje to, co zamierzał?
- [ ] Czy asercje są wystarczające (nie tylko status OK, ale też treść)?
- [ ] Czy lokalizatory są stabilne (nie opierają się na losowych ID)?

---

## Perspektywa ekspercka: AI jako partner, nie zamiennik

AI jest najpotężniejsze jako narzędzie do:
- **Przyspieszenia**: Napisz w minutach to, co manualnie zajęłoby godziny.
- **Inspiracji**: Zobacz nieoczywiste przypadki testowe, których sam byś nie wymyślił.
- **Diagnostyki**: Zrozum błąd szybciej niż przez mozolne przeszukiwanie dokumentacji.

AI jest najsłabsze jako:
- **Gwarant jakości**: Nie wie, co jest "ważne" w Twojej aplikacji.
- **Zastępnik weryfikacji**: Nie uruchomi testu w prawdziwej przeglądarce.
- **Źródło prawdy**: Może się mylić — zawsze weryfikuj.

Umiejętność "współpracy z AI" — pisanie dobrych promptów, weryfikacja wyjść, integracja z workflow — to kompetencja przyszłości. Testerzy, którzy ją opanują, będą nieocenieni. Testerzy, którzy AI ignorują, staną się wolniejsi od tych, którzy go używają.

---

## Podsumowanie

1. **Możliwości AI**: Generowanie scenariuszy, pisanie kodu, debugowanie, refaktoryzacja, nauka.
2. **Prompt Engineering**: Dawaj kontekst, określaj format, podawaj przykłady, wyznaczaj ograniczenia.
3. **Narzędzia**: GitHub Copilot (autouzupełnianie), Claude (analiza/generowanie), Cursor (IDE z AI).
4. **Ryzyka**: Halucynacje, wyciek danych, prawa autorskie, fałszywe poczucie jakości.
5. **Weryfikacja**: Zawsze sprawdzaj wyjście AI z dokumentacją przed użyciem w produkcji.
6. **Workflow**: AI jako partner przyspieszający, nie zamiennik odpowiedzialności testera.

---

## Linki i źródła

- [Testing with AI: A New Era](https://www.ministryoftesting.com/articles/ai-in-testing)
- [GitHub Copilot for Testers](https://github.com/features/copilot)
- [Anthropic Claude — API Documentation](https://docs.anthropic.com/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [AI in Software Testing — IEEE](https://ieeexplore.ieee.org/document/10042339)