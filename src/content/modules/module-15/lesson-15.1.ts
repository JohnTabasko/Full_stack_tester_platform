import type { Lesson } from '../../../renderer/types';
import theory15_1 from './lesson-15.1.md?raw';

export const lesson15_1: Lesson = {
  "id": "15.1",
  "moduleId": 15,
  "title": "Projekt praktyczny 1: E-commerce",
  "description": "Zaprojektuj i zaimplementuj kompletny framework testowy dla platformy e-commerce. Wdróż zaawansowane wzorce POM, kompozycję komponentów, fabryki stron, wstrzykiwanie fixtur oraz dynamiczne dane testowe.",
  "order": 1,
  "difficulty": "advanced",
  "tags": ["e-commerce", "project", "architecture", "POM", "composition", "Faker"],
  "content": {
    "objective": "Po ukończeniu tego projektu praktycznego potrafisz zaprojektować od zera kompletną architekturę automatyzacji dla systemów e-commerce, łączyć klasy stron z komponentami, wstrzykiwać zalogowane sesje przez fixtury oraz eliminować kruchość testów.",
    "theory": theory15_1,
    "codeExamples": [
      `// Przykład kompletnej struktury testu e-commerce (Książka 3 - Uppadhyay)
test('zakup produktu', async ({ loggedInCustomerPage, productsPage, checkoutPage }) => {
  await productsPage.addProductToCart('Backpack');
  await checkoutPage.buy();
});`
    ],
    "exercises": [
      {
        "id": "ex-15-1-1",
        "title": "Implementacja kompletnego procesu zakupu",
        "description": "Utwórz klasy `ProductsPage` oraz `CheckoutPage` i zintegruj je z custom runnerem. Napisz działający test, który loguje użytkownika, dodaje produkt do koszyka, przechodzi proces kasy i weryfikuje sukces."
      }
    ],
    "quiz": [
      {
        "id": "q15-1-1",
        "question": "Które podejście jest uważane za najlepszą praktykę inżynieryjną przy automatyzacji procesu kasy (checkout) wymagającego danych adresowych klienta?",
        "options": [
          "Wykorzystanie Test Data Buildera w połączeniu z biblioteką Faker do dynamicznego generowania unikalnych i realistycznych danych adresowych per test",
          "Twarde kodowanie stałego adresu w kodzie testu",
          "Pominięcie kroku wprowadzania adresu",
          "Wprowadzanie losowego ciągu losowych liter"
        ],
        "correctAnswer": 0,
        "explanation": "Używanie Test Data Buildera i biblioteki Faker zapewnia pełną unikalność danych przy testach współbieżnych, chroniąc przed konfliktami w bazie i symulując realistyczne zachowania użytkowników."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 3: Building a Scalable UI Framework (E-commerce case study)."
      }
    ],
    "tipsAndTricks": [
      "Wydziel nagłówek koszyka (cart badge, przycisk koszyka) jako osobny komponent wspólny, ponieważ pojawia się on na każdej podstronie sklepu."
    ],
    "commonMistakes": [
      {
        "mistake": "Tworzenie jednego, gigantycznego Page Objectu zawierającego katalog produktów, filtry, koszyk i płatności",
        "solution": "Podziel system na mniejsze, wyspecjalizowane klasy stron i niezależne obiekty komponentów."
      }
    ]
  }
};