import type { Lesson } from '../../../renderer/types';
import theory4_4 from './lesson-4.4.md?raw';

export const lesson4_4: Lesson = {
  "id": "4.4",
  "moduleId": 4,
  "title": "Przechwytywanie sieci i mockowanie",
  "description": "Opanuj zaawansowane mockowanie warstwy sieciowej. Poznaj metody page.route, route.fulfill, route.abort, modyfikowanie nagłówków i obsługę błędów sieciowych.",
  "order": 4,
  "difficulty": "advanced",
  "tags": ["network", "mocking", "page.route", "fulfill", "abort", "intercept"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz konfigurować przechwytywanie żądań sieciowych w Playwright, symulować gotowe odpowiedzi API (JSON/XML), testować odporność interfejsu na awarie serwerów (route.abort) oraz modyfikować parametry zapytań w locie.",
    "theory": theory4_4,
    "codeExamples": [
      `// Przykład mockowania odpowiedzi API (Książka 2 - Greffier)
await page.route('**/api/user', route => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ name: 'Jan', role: 'admin' })
  });
});`
    ],
    "exercises": [
      {
        "id": "ex-4-4-1",
        "title": "Symulowanie awarii serwera API",
        "description": "Napisz test dla formularza wyszukiwania produktów, w którym przechwycisz zapytanie wyszukiwania i zwrócisz kod statusu 500 (Internal Server Error) z pustym body, weryfikując poprawność obsługi błędów na UI."
      }
    ],
    "quiz": [
      {
        "id": "q4-4-1",
        "question": "Która metoda obiektu Route w Playwright służy do symulowania błędu fizycznego zerwania połączenia sieciowego (np. błędu TCP/IP)?",
        "options": [
          "route.abort('failed')",
          "route.fulfill({ status: 500 })",
          "route.continue()",
          "route.fallback()"
        ],
        "correctAnswer": 0,
        "explanation": "route.abort() pozwala na symulowanie rzeczywistych awarii sieciowych poziomu gniazd (sockets) bez generowania jakiejkolwiek odpowiedzi HTTP z serwera, co jest idealne do testów odporności."
      }
    ],
    "references": [
      {
        "title": "Hands-On Automated Testing with Playwright (Packt, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Chapter 15: Mocking APIs to control external data."
      }
    ],
    "tipsAndTricks": [
      "Deklaruj reguły page.route() na poziomie beforeEach lub na samym początku testu przed jakąkolwiek nawigacją, aby upewnić się, że nie utracisz pierwszych zapytań sieciowych."
    ],
    "commonMistakes": [
      {
        "mistake": "Brak wywołania route.continue() dla żądań, które nie pasują do warunków testu w filtrze ogólnym",
        "solution": "Jeśli przechwytujesz szeroki wzorzec adresów (np. '**/*'), upewnij się, że wywołujesz route.continue() dla wszystkich żądań, których nie chcesz modyfikować, w przeciwnym razie zawisną one w nieskończoność."
      }
    ]
  }
};