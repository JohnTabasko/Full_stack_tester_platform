import type { Lesson } from '../../../renderer/types';
import theory6_4 from './lesson-6.4.md?raw';

export const lesson6_4: Lesson = {
  "id": "6.4",
  "moduleId": 6,
  "title": "Zaawansowane wzorce obiektu strony",
  "description": "Zasady SOLID w testach UI: Page Object Factory (Fabryka), wzorzec metody szablonowej w BasePage, wzorzec Strategii, Journey, Fasada oraz wykorzystanie Service Objects do przygotowania danych.",
  "order": 4,
  "difficulty": "advanced",
  "tags": [
    "best-practices",
    "patterns",
    "SOLID",
    "factory",
    "strategy-pattern",
    "page-objects"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz zaprojektować zaawansowany framework testowy UI z użyciem PageFactory, BasePage z metodą szablonową, wdrożyć wzorzec Strategii dla wariantów biznesowych oraz efektywnie separować interakcję UI od przygotowywania danych przez API.",
    "theory": theory6_4,
    "codeExamples": [
      `// Przykład Page Object Factory (Książka 3 - Uppadhyay)
export class PageFactory {
  public static getPage<T extends BasePage>(pageName: string, page: Page): T {
    if (pageName === 'LoginPage') return new LoginPage(page) as unknown as T;
    if (pageName === 'InventoryPage') return new InventoryPage(page) as unknown as T;
    throw new Error('Niedozwolony typ strony');
  }
}`,
      `// Przykład wzorca Strategii dla metod płatności (Książka 3)
export interface PaymentStrategy { pay(amount: number): Promise<void>; }
export class CardPayment implements PaymentStrategy { 
  constructor(private page: Page) {} 
  async pay(amount: number) { await this.page.getByLabel('Card').fill('4111...'); }
}`
    ],
    "exercises": [
      {
        "id": "ex-6-4-1",
        "title": "Zaprojektowanie PageFactory",
        "description": "Zbuduj silnie otypowaną klasę \`PageFactory\` w TypeScript obsługującą dynamiczną kreację co najmniej trzech różnych stron aplikacji, izolując ich szczegóły konstrukcyjne od testów."
      },
      {
        "id": "ex-6-4-2",
        "title": "Zaimplementowanie strategii dostawy produktów",
        "description": "Zaprojektuj interfejs \`DeliveryStrategy\` oraz dwie klasy ją implementujące: \`CourierDelivery\` i \`ParcelLockerDelivery\`. Zintegruj je z Page Objectem kasy \`CheckoutPage\` bez modyfikowania jego wnętrza (zgodnie z zasadą OCP)."
      },
      {
        "id": "ex-6-4-3",
        "title": "Przyspieszenie testu za pomocą Service Object",
        "description": "Przepisz test, który przeklikuje UI w celu dodania 5 produktów do koszyka. Użyj klienta API (Service Object) do błyskawicznego przygotowania koszyka, a w UI przetestuj jedynie końcowy krok kasy."
      }
    ],
    "quiz": [
      {
        "id": "q6-4-1",
        "question": "Jaki jest główny cel stosowania wzorca Fabryki (PageFactory) w automatyzacji UI?",
        "options": [
          "Zmniejszenie sprzężenia (decoupling) i scentralizowanie tworzenia obiektów stron, co ułatwia przyszłą refaktoryzację",
          "Automatyczne tłumaczenie selektorów CSS na XPath",
          "Wyeliminowanie potrzeby pisania asercji w testach",
          "Wymuszenie uruchamiania testów w jednym workerze"
        ],
        "correctAnswer": 0,
        "explanation": "Dzięki PageFactory, jeśli zmienią się parametry konstruktora klas stron (np. dodamy zależność), modyfikujemy tylko fabrykę, chroniąc setki plików testowych przed zmianami."
      },
      {
        "id": "q6-4-2",
        "question": "Która zasada SOLID jest realizowana przez zastosowanie wzorca Strategii dla różnych metod płatności?",
        "options": [
          "Open/Closed Principle (OCP) - możemy dodawać nowe metody płatności bez modyfikowania istniejącego kodu strony kasy",
          "Single Responsibility Principle (SRP) - sprawia, że plik testowy ma tylko 1 linijkę kodu",
          "Liskov Substitution Principle (LSP) - zabrania dziedziczenia klas",
          "Dependency Inversion Principle (DIP) - wymaga twardego kodowania selektorów"
        ],
        "correctAnswer": 0,
        "explanation": "Zasada Open/Closed mówi, że kod powinien być otwarty na rozszerzenia (dodanie nowej strategii), ale zamknięty na modyfikacje (nie zmieniamy kodu klasy CheckoutPage)."
      },
      {
        "id": "q6-4-3",
        "question": "Do czego służą Service Objects (np. klienci API) w kontekście testów UI?",
        "options": [
          "Do błyskawicznego przygotowywania stanu danych przed testem (Arrange) bezpośrednio na poziomie backendu, oszczędzając czas UI",
          "Do renderowania interfejsu graficznego w konsoli serwera",
          "Do generowania raportów HTML po zakończeniu testu",
          "Do symulowania wolnego połączenia sieciowego w przeglądarce"
        ],
        "correctAnswer": 0,
        "explanation": "Service Objects wykonują operacje przygotowawcze (np. tworzenie konta, koszyka) przez API w ułamku sekundy, dzięki czemu test UI skupia się wyłącznie na sprawdzeniu kluczowych funkcjonalności wizualnych."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Enterprise-grade design patterns (PageFactory, ApiFactory, BasePage), SOLID & DRY principles, and full stack scaling."
      },
      {
        "title": "Practical Playwright Test (Jean-François Greffier, 2026)",
        "url": "https://doi.org/10.1007/979-8-8688-2160-8",
        "description": "Deep dive into Playwright runner extension, custom expectations, dependent and automatic fixtures, and component testing."
      },
      {
        "title": "Hands-On Automated Testing with Playwright (Faraz K. Kelhini, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Comprehensive guide to browser mechanics, Chrome DevTools Protocol metrics, WCAG accessibility, visual testing, and mobile web."
      },
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 3: Building a Scalable UI Framework (PageFactory & BasePage)."
      },
      {
        "title": "Practical Playwright Test (Jean-François Greffier, 2026)",
        "url": "https://doi.org/10.1007/979-8-8688-2160-8",
        "description": "Wskazówki dotyczące ewolucji wzorców POM i unikania over-engineeringu."
      }
    ],
    "tipsAndTricks": [
      "Zawsze opieraj architekturę testów na zasadach SOLID, unikając przedwczesnej abstrakcji zgodnie z zasadą WET (Write Everything Twice) z podręczników 2026.",
      
      "Stosuj wzorzec Strategii, aby pozbyć się kłopotliwych instrukcji warunkowych (if/else) wewnątrz Page Objectu, kiedy zachowanie zależy od wybranej opcji biznesowej.",
      "Oddzielaj techniczną konfigurację od testu. Wykorzystaj Service Objects (API), aby przygotować bazę danych lub zalogować użytkownika w ułamku sekundy."
    ],
    "commonMistakes": [
      {
        "mistake": "Wdrażanie zbyt wielu wzorców naraz na starcie projektu (Framework-Over-Product)",
        "solution": "Unikaj przedwczesnego projektowania skomplikowanej architektury. Wprowadzaj wzorce dopiero wtedy, gdy kod rośnie i pojawia się realna duplikacja."
      },
      {
        "mistake": "Przechowywanie logiki weryfikacji i asercji w metodach Journey",
        "solution": "Metody Journey powinny przeprowadzić przez ścieżkę (Act). Asercje i weryfikacje stanów powinny pozostać widoczne i jasne w ciele testu (Assert)."
      }
    ]
  }
};
