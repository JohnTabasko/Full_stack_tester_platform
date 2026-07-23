import type { Lesson } from '../../../renderer/types';
import theory8_1 from './lesson-8.1.md?raw';

export const lesson8_1: Lesson = {
  "id": "8.1",
  "moduleId": 8,
  "title": "Kompletne testowanie REST API — Wprowadzenie i Architektura AOM",
  "description": "Zrozum rolę testów API w piramidzie testów, opanuj wbudowaną fixturę request, oraz wdroż wzorzec API Object Model (AOM) z klasą bazową BaseApi i Fabryką API.",
  "order": 1,
  "difficulty": "beginner",
  "tags": [
    "api-testing",
    "request-fixture",
    "REST",
    "API-Object-Model",
    "SOLID",
    "factory"
  ],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz zaprojektować i zaimplementować skalowalny framework testowania API w Playwright przy użyciu wzorca API Object Model (AOM), BaseApi oraz ApiFactory, eliminując sprzężenia w plikach testowych.",
    "theory": theory8_1,
    "codeExamples": [
      `// Definicja klasy bazowej BaseApi (Książka 3 - Uppadhyay)
export abstract class BaseApi {
  constructor(protected request: APIRequestContext) {}
  protected async postRequest(endpoint: string, data: any) {
    return await this.request.post(endpoint, { data });
  }
}`,
      `// Implementacja specyficznego modelu API
export class UserApi extends BaseApi {
  async createUser(userData: any) {
    return await this.postRequest('/api/v1/users', userData);
  }
}`,
      `// Użycie ApiFactory w testach lub fixturach
export class ApiFactory {
  public static getApi<T extends BaseApi>(apiName: string, request: APIRequestContext): T {
    if (apiName === 'UserApi') return new UserApi(request) as unknown as T;
    throw new Error('Niedozwolone API');
  }
}`
    ],
    "exercises": [
      {
        "id": "ex-8-1-1",
        "title": "Wdrożenie klasy bazowej BaseApi",
        "description": "Zaimplementuj klasę bazową \`BaseApi\`, która automatycznie wstrzykuje nagłówek 'Authorization: Bearer <token>' pobierany ze zmiennych środowiskowych do każdego zapytania wychodzącego."
      },
      {
        "id": "ex-8-1-2",
        "title": "Stworzenie modelu OrdersApi oraz ApiFactory",
        "description": "Napisz model API dla zasobu zamówień (\`OrdersApi\`) obsługujący pobieranie i usuwanie zamówień, a następnie zarejestruj go w nowo utworzonej fabryce \`ApiFactory\`."
      },
      {
        "id": "ex-8-1-3",
        "title": "Hybrydowy scenariusz API + UI",
        "description": "Napisz test, w którym za pomocą fixtury \`userApi\` błyskawicznie tworzysz nowego użytkownika w bazie (Arrange), a następnie w warstwie UI przechodzisz na stronę logowania i logujesz się na nowo utworzone konto (Act/Assert)."
      }
    ],
    "quiz": [
      {
        "id": "q8-1-1",
        "question": "Czym jest wzorzec API Object Model (AOM) w inżynierii testów?",
        "options": [
          "To wzorzec hermetyzujący adresy URL, nagłówki, metody i struktury zapytań HTTP w dedykowanych klasach usług",
          "To technika służąca do generowania dokumentacji Swagger/OpenAPI",
          "To biblioteka asercyjna do walidacji typów w TypeScript",
          "To system automatycznego mockowania odpowiedzi bazy danych"
        ],
        "correctAnswer": 0,
        "explanation": "Podobnie jak POM porządkuje interakcje z UI, tak AOM porządkuje i hermetyzuje interakcje z punktami końcowymi API (REST, GraphQL), chroniąc testy przed zmianami adresów czy struktury żądań."
      },
      {
        "id": "q8-1-2",
        "question": "Dlaczego zaleca się stosowanie ApiFactory do kreacji obiektów API?",
        "options": [
          "Zapobiega bezpośredniemu sprzężeniu testu z konstruktorami klas API, ułatwiając przyszłe zmiany w inicjalizacji",
          "Automatycznie wysyła zapytania HTTP w tle",
          "Gwarantuje, że wszystkie zapytania API będą darmowe",
          "Służy wyłącznie do testowania protokołu SOAP"
        ],
        "correctAnswer": 0,
        "explanation": "ApiFactory ukrywa proces tworzenia klas API. Jeśli do klas API dodamy nowe parametry konstrukcyjne (np. logger), poprawiamy tylko fabrykę, chroniąc testy przed modyfikacją."
      },
      {
        "id": "q8-1-3",
        "question": "W jaki sposób wbudowana fixtura request zarządza sesjami autoryzacyjnymi?",
        "options": [
          "Może współdzielić stan sesji i ciasteczka z wbudowaną fixturą page i browser, jeśli są uruchomione w tym samym kontekście",
          "Wymaga każdorazowego logowania przy każdym zapytaniu",
          "Działa wyłącznie w trybie bezgłowym i nie potrafi wysyłać ciasteczek",
          "Służy wyłącznie do testów jednostkowych bazy danych"
        ],
        "correctAnswer": 0,
        "explanation": "Wbudowana fixtura request w Playwright automatycznie synchronizuje stan ciasteczek i nagłówków sesyjnych z powiązanym kontekstem przeglądarki, co umożliwia bezproblemowe testy hybrydowe (API + UI)."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 2: Building Your First API Test Automation Framework - kompletne AOM."
      },
      {
        "title": "Playwright API Testing",
        "url": "https://playwright.dev/docs/api-testing",
        "description": "Oficjalny przewodnik po testach API w Playwright Test."
      }
    ],
    "tipsAndTricks": [
      "Stosuj klasy bazowe BaseApi, aby scentralizować obsługę błędów sieciowych i automatyczne dołączanie tokenów Bearer do nagłówków.",
      "Używaj testów hybrydowych: twórz stan wejściowy przez API (0.1s), a weryfikuj proces w UI (1s). To najskuteczniejsza metoda skracania czasu wykonania dużych testów."
    ],
    "commonMistakes": [
      {
        "mistake": "Bezpośrednie wpisywanie twardo kodowanych adresów URL typu /api/v1/orders w testach",
        "solution": "Zawsze hermetyzuj endpointy w klasach AOM (np. OrdersApi)."
      },
      {
        "mistake": "Brak asercji na status code przed parsowaniem odpowiedzi JSON",
        "solution": "Zawsze weryfikuj najpierw czy response.ok() jest prawdą lub czy status wynosi oczekiwany kod, aby uniknąć błędów parsowania pustych obiektów."
      }
    ]
  }
};
