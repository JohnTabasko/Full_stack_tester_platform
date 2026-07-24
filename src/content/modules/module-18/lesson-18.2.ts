import type { Lesson } from '../../../renderer/types';
import theory18_2 from './lesson-18.2.md?raw';

export const lesson18_2: Lesson = {
  "id": "18.2",
  "moduleId": 18,
  "title": "Async/await, obietnice i obsługa błędów",
  "description": "Opanuj programowanie asynchroniczne w automatyzacji. Poznaj cykl życia Promises, unikaj pułapki cichych sukcesów (missing await) oraz wdrażaj Promise.all do współbieżnego przechwytywania sieci.",
  "order": 2,
  "difficulty": "advanced",
  "tags": ["async-await", "Promises", "Promise.all", "error-handling", "silent-pass", "clean-code"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz kontrolować asynchroniczny przepływ testów, eliminować ciche sukcesy poprzez rygorystyczne stosowanie await, wdrażać współbieżne operacje Promise.all i zarządzać błędami asynchronicznymi.",
    "theory": theory18_2,
    "codeExamples": [
      `// Przykład wykorzystania Promise.all (Książka 1 - Kelhini)
const [response] = await Promise.all([
  page.waitForResponse('**/api/data'),
  page.getByRole('button').click()
]);`
    ],
    "exercises": [
      {
        "id": "ex-18-2-1",
        "title": "Wdrożenie Promise.all w formularzu logowania",
        "description": "Napisz test, który po kliknięciu przycisku logowania równolegle oczekuje na zakończenie zapytania sieciowego API logowania (`/api/auth`) przy użyciu struktury `Promise.all`."
      }
    ],
    "quiz": [
      {
        "id": "q18-2-1",
        "question": "Jaka groźna anomalia zachodzi w teście Playwright, jeśli zapomnisz dodać słowo kluczowe 'await' przed wywołaniem asynchronicznej metody (np. page.click())?",
        "options": [
          "Wykonanie testu przejdzie do kolejnej linii bez czekania na kliknięcie elementu, co może prowadzić do fałszywego zaliczenia testu (cichy sukces) pomimo braku akcji",
          "Kompilator natychmiast rzuci błąd składniowy w terminalu",
          "Przeglądarka ulegnie awarii (crash)",
          "Test zostanie automatycznie usunięty z dysku"
        ],
        "correctAnswer": 0,
        "explanation": "To niesławny 'cichy sukces' (silent pass). Ponieważ obietnica nie jest oczekiwana, proces Node.js biegnie dalej, a test może zakończyć się statusem Passed, pomimo że akcja w ogóle nie została wykonana."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 1: Asynchronous patterns and Promise architecture."
      }
    ],
    "tipsAndTricks": [
      "Wykorzystaj regułę ESLint '@typescript-eslint/no-floating-promises' do automatycznego blokowania commitów zawierających zapomniane obietnice bez słowa await."
    ],
    "commonMistakes": [
      {
        "mistake": "Pisanie sekwencyjnego oczekiwania na zdarzenie sieciowe po wykonaniu akcji (wyścig stanów)",
        "solution": "Zawsze grupuj kliknięcie i oczekiwanie sieciowe (np. waitForResponse) wewnątrz bloku Promise.all()."
      }
    ]
  }
};