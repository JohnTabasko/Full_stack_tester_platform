import type { Lesson } from '../../../renderer/types';
import theory7_2 from './lesson-7.2.md?raw';

export const lesson7_2: Lesson = {
  "id": "7.2",
  "moduleId": 7,
  "title": "Budowniczowie danych i fabryki",
  "description": "Zarządzaj złożonością danych testowych. Poznaj wzorzec Budowniczego Danych (Test Data Builder) z Fluent API, projektowanie Fabryk Danych (Data Factories) oraz ochronę przed zmianami modeli.",
  "order": 2,
  "difficulty": "advanced",
  "tags": ["test-data", "builders", "factories", "Fluent-API", "clean-code", "SOLID"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz wyeliminować powtarzalny i kruchy kod obiektów JSON z plików testowych, wdrożyć silnie otypowany wzorzec Test Data Builder z Fluent API oraz budować gotowe stany danych za pomocą Fabryk Danych.",
    "theory": theory7_2,
    "codeExamples": [
      `// Przykład wdrożenia Test Data Buildera (Książka 3 - Uppadhyay)
export class ProductBuilder {
  private product = { name: 'Buty', price: 150 };
  withPrice(price: number) { this.product.price = price; return this; }
  build() { return this.product; }
}`
    ],
    "exercises": [
      {
        "id": "ex-7-2-1",
        "title": "Projektowanie budowniczego zamówień",
        "description": "Stwórz budowniczego danych dla obiektu zamówienia (`OrderBuilder`), który domyślnie zawiera unikalne id, listę produktów oraz adres dostawy. Umożliw elastyczną zmianę statusu zamówienia i adresu."
      }
    ],
    "quiz": [
      {
        "id": "q7-2-1",
        "question": "W jaki sposób wzorzec Test Data Builder zabezpiecza testy przed zmianami w modelach danych deweloperskich?",
        "options": [
          "Ponieważ domyślne wartości są zadeklarowane w jednym centralnym punkcie (budowniczym). Dodanie nowego pola wymaga zmiany tylko w klasie budowniczego, a nie we wszystkich testach",
          "Automatycznie synchronizuje bazę z kodem JavaScript",
          "Usuwa asynchroniczność z kodu",
          "Nie ma wpływu na podatność testów na zmiany modeli"
        ],
        "correctAnswer": 0,
        "explanation": "Dzięki budowniczemu, testy nadpisują wyłącznie te pola, które ich interesują. Jeśli do modelu wejdą nowe pola, zmieniasz tylko definicję domyślną w budowniczym, chroniąc setki testów przed błędami kompilacji."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 7: Managing Test Data, Environments, and Configuration."
      }
    ],
    "tipsAndTricks": [
      "Stosuj Fluent API (zwracanie słowa kluczowego this) w metodach budowniczego, aby umożliwić niezwykle czytelne i płynne łączenie metod w jedną linię kodu."
    ],
    "commonMistakes": [
      {
        "mistake": "Ręczne definiowanie gigantycznych obiektów JSON bezpośrednio w plikach testowych",
        "solution": "Wykorzystaj Test Data Builder i statyczne metody fabrykujące klasy DataFactory."
      }
    ]
  }
};