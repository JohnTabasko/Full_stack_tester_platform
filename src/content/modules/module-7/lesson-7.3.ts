import type { Lesson } from '../../../renderer/types';
import theory7_3 from './lesson-7.3.md?raw';

export const lesson7_3: Lesson = {
  "id": "7.3",
  "moduleId": 7,
  "title": "Dynamiczne generowanie danych testowych",
  "description": "Wyeliminuj konflikty danych przy testach współbieżnych. Poznaj integrację biblioteki Faker, dynamiczne budowanie unikalnych adresów e-mail, imion i haseł oraz RODO.",
  "order": 3,
  "difficulty": "advanced",
  "tags": ["Faker", "dynamic-data", "uniqueness", "RODO", "concurrency-safety"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz sprawnie integrować bibliotekę Faker z projektem Playwright, generować w 100% unikalne zestawy danych osobowych, zapobiegać kolizjom w testach współbieżnych oraz wdrażać logowanie danych dla odtwarzalności testów.",
    "theory": theory7_3,
    "codeExamples": [
      `// Przykład integracji Faker z Test Data Builderem (Książka 1 - Kelhini)
import { fakerPL as faker } from '@faker-js/faker';
export class UserBuilder {
  private user = { email: faker.internet.email(), name: faker.person.fullName() };
  build() { return this.user; }
}`
    ],
    "exercises": [
      {
        "id": "ex-7-3-1",
        "title": "Wdrożenie dynamicznego budowniczego zamówień",
        "description": "Zmodyfikuj stworzonego wcześniej `OrderBuilder` w taki sposób, aby przy każdym wywołaniu automatycznie losował unikalne nazwy produktów, ilości, ceny oraz adresy dostawy z użyciem biblioteki Faker."
      }
    ],
    "quiz": [
      {
        "id": "q7-3-1",
        "question": "Dlaczego dynamiczne generowanie danych (np. przy użyciu Faker) jest kluczowe w testach współbieżnych (fullyParallel)?",
        "options": [
          "Zapobiega kolizjom danych w bazie (np. błędom unikalności e-maila) przy jednoczesnym wykonywaniu wielu testów",
          "Automatycznie skraca czas ładowania strony",
          "Zastępuje potrzebę pisania asercji",
          "Wyłącza obsługę ciasteczek w przeglądarce"
        ],
        "correctAnswer": 0,
        "explanation": "Podczas testów równoległych wiele wątków wykonuje te same akcje jednocześnie. Bez unikalnych danych wejściowych (e-maile, loginy), testy będą się nawzajem blokować i wywalać na walidacjach unikalności."
      }
    ],
    "references": [
      {
        "title": "Hands-On Automated Testing with Playwright (Faraz K. Kelhini, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Chapter 15: Best Practices for Test Maintainability (Generating dynamic data)."
      }
    ],
    "tipsAndTricks": [
      "Wykorzystuj polską wersję lokalizacji fakera (fakerPL), aby generowane adresy, imiona czy numery NIP wyglądały realistycznie w Twojej aplikacji."
    ],
    "commonMistakes": [
      {
        "mistake": "Używanie bazy produkcyjnej lub rzeczywistych danych prawdziwych klientów w testach automatycznych",
        "solution": "RODO kategorycznie tego zabrania. Zawsze używaj syntetycznie generowanych danych losowych."
      }
    ]
  }
};