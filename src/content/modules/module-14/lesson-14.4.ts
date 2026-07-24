import type { Lesson } from '../../../renderer/types';
import theory14_4 from './lesson-14.4.md?raw';

export const lesson14_4: Lesson = {
  "id": "14.4",
  "moduleId": 14,
  "title": "Podstawy testów penetracyjnych",
  "description": "Wdróż automatyczne testy penetracyjne (Fuzzing). Poznaj techniki wykrywania SQL Injection przez słowniki zapytań oraz weryfikację uprawnień Broken Access Control.",
  "order": 4,
  "difficulty": "advanced",
  "tags": ["security", "penetration-testing", "SQL-Injection", "fuzzing", "access-control", "OWASP"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz zautomatyzować wykrywanie podatności poziomu wejść (SQLi) za pomocą słowników fuzzujących, pisać testy uprawnień chroniące przed Broken Access Control oraz interpretować anomalie w konsoli przeglądarki.",
    "theory": theory14_4,
    "codeExamples": [
      `// Przykład testu Broken Access Control (Książka 3 - Uppadhyay)
const context = await browser.newContext({ storageState: '.auth/customer.json' });
const page = await context.newPage();
await page.goto('/admin-settings');
await expect(page).not.toHaveURL('/admin-settings');`
    ],
    "exercises": [
      {
        "id": "ex-14-4-1",
        "title": "Automatyzacja testu uprawnień API",
        "description": "Zaimplementuj test sprawdzający, czy wywołanie metody DELETE na endpoint `/api/v1/users/12` z kontekstu posiadającego ciasteczko sesji klienta zwraca kod statusu 403 Forbidden."
      }
    ],
    "quiz": [
      {
        "id": "q14-4-1",
        "question": "W jaki sposób automatyzujemy wykrywanie podatności typu Broken Access Control (Uszkodzona kontrola dostępu) przy użyciu Playwright?",
        "options": [
          "Próbując wejść bezpośrednio na prywatne adresy URL z poziomu kontekstu przeglądarki o niskich uprawnieniach i weryfikując odmowę dostępu (np. przekierowanie lub status 403)",
          "Skanując kod źródłowy aplikacji przed kompilacją",
          "Wyłączając przeglądarce obsługę stylów CSS",
          "Playwright nie umożliwia testowania uprawnień"
        ],
        "correctAnswer": 0,
        "explanation": "Broken Access Control weryfikujemy, symulując akcje intruza: powołujemy kontekst zwykłego użytkownika i sprawdzamy, czy aplikacja poprawnie blokuje bezpośrednie próby nawigacji lub żądania API przeznaczone dla administratorów."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 5: OWASP top 10 and access control validation."
      }
    ],
    "tipsAndTricks": [
      "Stosuj pętle parametryzowane (parameterized tests) w Playwright do szybkiego przetestowania kilkunastu różnych złośliwych zapytań SQL/XSS na tym samym formularzu."
    ],
    "commonMistakes": [
      {
        "mistake": "Brak asercji na zmianę adresu URL lub kod błędu po próbie nieautoryzowanej nawigacji",
        "solution": "Zawsze po próbie wejścia na zablokowany adres wywołaj expect(page).not.toHaveURL() lub sprawdź obecność komunikatu o odmowie."
      }
    ]
  }
};