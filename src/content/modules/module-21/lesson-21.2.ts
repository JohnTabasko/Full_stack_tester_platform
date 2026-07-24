import type { Lesson } from '../../../renderer/types';
import theory21_2 from './lesson-21.2.md?raw';

export const lesson21_2: Lesson = {
  "id": "21.2",
  "moduleId": 21,
  "title": "Testy kontraktowe sterowane przez konsumenta z Pact",
  "description": "Zrozum strategię Consumer-Driven Contract (CDC) testing. Poznaj instalację biblioteki Pact, deklarowanie interakcji z MatchersV3, generowanie kontraktu JSON i rolę Pact Brokera.",
  "order": 2,
  "difficulty": "advanced",
  "tags": ["CDC", "Pact", "contracts", "MatchersV3", "Pact-Broker", "API-testing"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz opisać architekturę testów kontraktowych sterowanych przez konsumenta, zaimplementować test generujący kontrakt JSON za pomocą @pact-foundation/pact oraz zintegrować proces z Pact Brokerem.",
    "theory": theory21_2,
    "codeExamples": [
      `// Przykład deklaracji interakcji w Pact (Książka 3 - Uppadhyay)
provider
  .uponReceiving('GET user')
  .withRequest({ method: 'GET', path: '/api/user' })
  .willRespondWith({
    status: 200,
    body: { id: MatchersV3.string('1') }
  });`
    ],
    "exercises": [
      {
        "id": "ex-21-2-1",
        "title": "Generowanie kontraktu profilu użytkownika",
        "description": "Zaprojektuj i zaimplementuj test konsumenta dla pobierania danych profilu (`/api/profile`). Użyj MatchersV3 do otypowania e-maila i ról oraz wygeneruj plik kontraktu JSON."
      }
    ],
    "quiz": [
      {
        "id": "q21-2-1",
        "question": "Kto definiuje wymagania i strukturę danych w modelu Consumer-Driven Contract (CDC)?",
        "options": [
          "Konsument (odbiorca danych, np. aplikacja frontendowa)",
          "Dostawca (dostarczyciel danych, np. backend/API)",
          "Zewnętrzny audytor bezpieczeństwa",
          "Playwright Test Runner"
        ],
        "correctAnswer": 0,
        "explanation": "W modelu CDC to Konsument określa swoje potrzeby i strukturę danych, której wymaga do poprawnego działania. Dostawca musi jedynie dowieść, że spełnia te wymagania."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 1: Scalable Test Automation and Design Patterns (Pact contract testing)."
      }
    ],
    "tipsAndTricks": [
      "Zawsze stosuj MatchersV3 (np. string, integer, decimal, boolean) zamiast twardo kodowanych wartości w definicji body. Kontrakt sprawdza spójność typów, a nie konkretne rekordy w bazie."
    ],
    "commonMistakes": [
      {
        "mistake": "Testowanie logiki biznesowej i algorytmów backendu na poziomie testów kontraktowych",
        "solution": "Testy kontraktowe weryfikują wyłącznie format i spójność interfejsu (umowy), a nie logikę obliczeniową backendu. Do algorytmów stosuj tradycyjne testy API."
      }
    ]
  }
};