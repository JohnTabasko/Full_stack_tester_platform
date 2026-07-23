import type { Lesson } from "../../../renderer/types";
import theory12_2 from './lesson-12.2.md?raw';

export const lesson12_2: Lesson = {
  "id": "12.2",
  "moduleId": 12,
  "title": "Zaawansowane wzorce obiektu strony i inżynieria frameworków UI",
  "description": "Zaawansowany POM oparty o zasady SOLID. Poznaj wzorzec Fabryki (PageFactory), Metody Szablonowej (BasePage), rozszerzanie expecta oraz automatyczne fixtury diagnostyczne.",
  "order": 2,
  "difficulty": "advanced",
  "tags": [
    "best-practices",
    "patterns",
    "SOLID",
    "fixtures",
    "factory",
    "template-method"
  ],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz zaprojektować i zaimplementować skalowalny, otypowany w TypeScript framework testowy wykorzystujący zaawansowane wzorce projektowe (Fabryka, Metoda Szablonowa), niestandardowe asercje oraz modularne i automatyczne fixtury.",
    "theory": theory12_2,
    "codeExamples": [
      "// Wzorzec Metody Szablonowej (BasePage z hookami)\nexport abstract class BasePage {\n  constructor(protected page: Page) {}\n  public async navigate(path: string): Promise<void> {\n    await this.beforeNavigate(path);\n    await this.page.goto(path);\n    await this.afterNavigate(path);\n  }\n  protected async beforeNavigate(path: string) {}\n  protected async afterNavigate(path: string) {}\n}",
      "// Wzorzec Fabryki Stron (PageFactory)\nexport class PageFactory {\n  public static getPage<T extends BasePage>(pageName: PageName, page: Page): T {\n    switch (pageName) {\n      case 'LoginPage': return new LoginPage(page) as unknown as T;\n      case 'InventoryPage': return new InventoryPage(page) as unknown as T;\n      default: throw new Error(`Typ strony ${pageName} nieobsługiwany`);\n    }\n  }\n}",
      "// Rozszerzanie expect (Custom Matchers)\nexport const expect = baseExpect.extend({\n  async toBeValidPageTitle(page: Page, expected: string) {\n    const title = await page.title();\n    const pass = title.includes(expected);\n    return {\n      message: () => `Oczekiwano, że tytuł strony \"${title}\" ${pass ? 'NIE ' : ''}będzie zawierał \"${expected}\"`,\n      pass,\n    };\n  },\n});",
      "// Automatyczna fixtura diagnostyczna (Auto Fixture)\nexport const test = base.extend({\n  consoleErrors: [async ({ page }, use, testInfo) => {\n    const logs: string[] = [];\n    page.on('console', msg => msg.type() === 'error' && logs.push(msg.text()));\n    await use(logs);\n    if (logs.length > 0) {\n      await testInfo.attach('console-errors', {\n        body: JSON.stringify(logs, null, 2),\n        contentType: 'application/json'\n      });\n    }\n  }, { auto: true }]\n});"
    ],
    "exercises": [
      {
        "id": "ex-12-2-1",
        "title": "Audyt i refaktoryzacja klasycznego POM",
        "description": "Przeanalizuj tradycyjny projekt testowy, w którym bezpośrednio wywoływane są konstruktory `new SomePage(page)`. Zaprojektuj i wdroż klasę `PageFactory`, która przejmie tę odpowiedzialność, a następnie dostosuj definicje testów."
      },
      {
        "id": "ex-12-2-2",
        "title": "Zaimplementowanie własnej metody szablonowej",
        "description": "Zaimplementuj w klasie `BasePage` metodę szablonową `clickWithLogging(locator: Locator)`, która przed kliknięciem rejestruje szczegóły elementu w logach, a po kliknięciu upewnia się, że na stronie nie pojawiły się krytyczne błędy sieciowe."
      },
      {
        "id": "ex-12-2-3",
        "title": "Rozbudowa Custom Expect Matcher",
        "description": "Napisz niestandardową asercję `toBeAuthenticated(page: Page)`, która sprawdza, czy w ciasteczkach lub pamięci lokalnej (localStorage) przeglądarki znajduje się poprawny i nieprzeterminowany token sesji użytkownika."
      },
      {
        "id": "ex-12-2-4",
        "title": "Wdrożenie fixtury monitorującej wolne żądania API",
        "description": "Stwórz automatyczną fixturę (auto fixture), która mierzy czas trwania każdego zapytania sieciowego (API/Resource). Jeśli jakiekolwiek zapytanie przekroczy 1500 ms, fixtura powinna zapisać je na liście ostrzeżeń i dołączyć plik JSON z opóźnionymi żądaniami do raportu testowego (używając `testInfo.attach`)."
      }
    ],
    "quiz": [
      {
        "id": "q12-2-1",
        "question": "Jaka jest główna zaleta stosowania wzorca Fabryki (PageFactory) w zaawansowanym POM?",
        "options": [
          "Izoluje testy od bezpośredniej instancjacji obiektów stron, chroniąc przed zmianami sygnatur konstruktorów",
          "Zastępuje asercje web-first w testach",
          "Automatycznie generuje zrzuty ekranu przy błędach",
          "Skraca czas uruchamiania samej przeglądarki"
        ],
        "correctAnswer": 0,
        "explanation": "Fabryka centralizuje kreację obiektów stron, dzięki czemu zmiana parametrów konstruktora (np. dodanie loggera) wymaga edycji tylko jednego pliku fabryki, a nie wszystkich testów."
      },
      {
        "id": "q12-2-2",
        "question": "W jaki sposób wzorzec Metody Szablonowej (Template Method) zwiększa spójność frameworka?",
        "options": [
          "Pozwala podklasom dostosowywać konkretne kroki (hooki) bez zmiany ogólnej struktury algorytmu zdefiniowanej w klasie bazowej",
          "Całkowicie usuwa potrzebę stosowania asynchroniczności (async/await)",
          "Blokuje możliwość dziedziczenia klas",
          "Służy wyłącznie do testowania formularzy"
        ],
        "correctAnswer": 0,
        "explanation": "Definiując szkielet akcji (np. nawigacji) w klasie bazowej BasePage i udostępniając przed- i po-nawigacyjne hooki, podklasy mogą dostosowywać swoje zachowanie w sposób ustrukturyzowany."
      },
      {
        "id": "q12-2-3",
        "question": "Dlaczego zasada Single Responsibility Principle (SRP) jest ważna w projektowaniu testów?",
        "options": [
          "Ponieważ oddziela odpowiedzialności: test weryfikuje scenariusz, POM odpowiada za akcje UI, fabryka za kreację, a fixtury za środowisko",
          "Ponieważ wymusza, aby każdy plik testowy zawierał maksymalnie jeden test",
          "Ponieważ sprawia, że testy stają się jednowątkowe",
          "Ponieważ zabrania korzystania z interfejsów API"
        ],
        "correctAnswer": 0,
        "explanation": "SRP zapobiega powstawaniu monolitycznego, trudnego w utrzymaniu kodu. Każdy komponent frameworka robi dokładnie jedną rzecz dobrze."
      },
      {
        "id": "q12-2-4",
        "question": "Czym różni się fixtura automatyczna (auto: true) od standardowej fixtury w Playwright?",
        "options": [
          "Uruchamia się automatycznie dla każdego testu, bez konieczności deklarowania jej w sygnaturze testu",
          "Nie posiada fazy sprzątania (teardown)",
          "Może być używana wyłącznie w trybie bezgłowym (headless)",
          "Zastępuje potrzebę posiadania pliku konfiguracyjnego"
        ],
        "correctAnswer": 0,
        "explanation": "Automatyczne fixtury (auto fixtures) są wywoływane przez runner automatycznie dla każdego testu, co jest idealne do globalnego zbierania metryk, logów konsoli czy czyszczenia baz danych."
      },
      {
        "id": "q12-2-5",
        "question": "Co oznacza zasada WET (Write Everything Twice) w inżynierii testów?",
        "options": [
          "Zaleca unikanie przedwczesnej abstrakcji i powielenie kodu do dwóch razy, zanim zdecydujemy się na jego wyodrębnienie",
          "Wymaga, aby każdy test był uruchamiany dokładnie dwukrotnie w celu wykrycia niestabilności",
          "Oznacza pisanie testów najpierw w języku angielskim, a potem w polskim",
          "To metoda automatycznego usuwania flaków (flaky tests)"
        ],
        "correctAnswer": 0,
        "explanation": "Zasada WET przeciwdziała przedwczesnemu wprowadzaniu skomplikowanych abstrakcji i wzorców. Ekstrakcji kodu (np. do komponentów lub pomocników) dokonujemy dopiero, gdy realnie potrzebujemy go po raz trzeci i znamy jego ostateczną, stabilną strukturę."
      },
      {
        "id": "q12-2-6",
        "question": "Jakie możliwości daje użycie testInfo.attach wewnątrz fixtury w Playwright?",
        "options": [
          "Pozwala dynamicznie dodawać niestandardowe pliki, logi lub zrzuty pamięci bezpośrednio do raportu HTML generowanego przez Playwright",
          "Pozwala połączyć się z zewnętrzną bazą danych SQL",
          "Zastępuje wbudowane asercje typu expect",
          "Służy wyłącznie do wysyłania wiadomości na komunikatory Slack lub Teams"
        ],
        "correctAnswer": 0,
        "explanation": "Za pomocą testInfo.attach możemy w dowolnym momencie testu lub fixtury (np. podczas teardownu) dołączyć pliki tekstowe, obrazy czy pliki JSON, które będą czytelnie zaprezentowane w raporcie HTML."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Książka o wzorcach inżynieryjnych i skalowalności w Playwright."
      },
      {
        "title": "Practical Playwright Test (Jean-François Greffier, 2026)",
        "url": "https://doi.org/10.1007/979-8-8688-2160-8",
        "description": "Książka o głębokim rozszerzaniu test runnera, fixturach i asercjach."
      },
      {
        "title": "Hands-On Automated Testing with Playwright (Packt Publishing, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Książka o kompleksowych testach UI, A11y, Visual Regression i CDP."
      }
    ],
    "tipsAndTricks": [
      "Stosuj Page Object Factory (Fabrykę), aby chronić swoje testy przed zmianami konstrukcyjnymi. Jeśli do Page Objectu dojdą nowe zależności (np. logger), zmieniasz tylko Fabrykę.",
      "Unikaj przedwczesnego DRY. Zasada WET (Write Everything Twice) mówi, że powielenie kodu dwa razy jest zdrowe. Dopiero za trzecim razem wyekstrahuj go do abstrakcji.",
      "Używaj automatycznych fixtur ze wstrzykiwaniem testInfo.attach, aby zbierać błędy konsoli przeglądarki. To oszczędza mnóstwo czasu przy debugowaniu błędów w CI.",
      "Rozszerzaj expecta (expect.extend) o asercje domenowe. Dzięki temu testy czyta się jak specyfikację biznesową, a raporty błędów są niezwykle precyzyjne."
    ],
    "commonMistakes": [
      {
        "mistake": "Tworzenie monolitycznych klas POM z dziesiątkami metod",
        "solution": "Podziel stronę na mniejsze komponenty (Component Objects) posiadające własny root locator i operujące tylko w jego obszarze."
      },
      {
        "mistake": "Bezpośrednie wywoływanie new LoginPage(page) w każdym teście",
        "solution": "Wykorzystaj wzorzec Fabryki (PageFactory) oraz system fixture-ów Playwrighta, aby wstrzykiwać gotowe instancje stron do testów."
      },
      {
        "mistake": "Nadużywanie hooków beforeEach i afterEach do konfiguracji stanu",
        "solution": "Zastąp je modularnymi fixture-ami, które są leniwie inicjalizowane (tylko wtedy, gdy test ich zażąda) i mogą od siebie zależeć."
      },
      {
        "mistake": "Wprowadzanie nadmiernej liczby wzorców projektowych na starcie projektu (Framework-Over-Product)",
        "solution": "Zacznij od prostych, czytelnych testów z semantycznymi lokatorami. Refaktoryzuj i wprowadzaj wzorce dopiero wtedy, gdy kod zaczyna rosnąć i duplikacja staje się uciążliwa."
      }
    ]
  }
};
