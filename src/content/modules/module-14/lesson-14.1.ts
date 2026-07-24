import type { Lesson } from '../../../renderer/types';
import theory14_1 from './lesson-14.1.md?raw';

export const lesson14_1: Lesson = {
  "id": "14.1",
  "moduleId": 14,
  "title": "Podstawy testowania bezpieczeństwa",
  "description": "Wprowadź testy bezpieczeństwa do rurociągu (Shift-Left). Opanuj automatyczną weryfikację nagłówków bezpieczeństwa (CSP, HSTS, X-Frame-Options) oraz odporności na wstrzykiwanie skryptów (XSS).",
  "order": 1,
  "difficulty": "advanced",
  "tags": ["security", "XSS", "CSP", "headers", "Clickjacking", "shift-left"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz automatyzować weryfikację polityk bezpieczeństwa serwera WWW, pisać testy odporności na ataki typu Cross-Site Scripting (XSS) oraz wdrażać mechanizmy ochronne na poziomie testów regresyjnych.",
    "theory": theory14_1,
    "codeExamples": [
      `// Przykład weryfikacji nagłówków bezpieczeństwa (Książka 3 - Uppadhyay)
const headers = response.headers();
expect(headers['x-frame-options']).toMatch(/DENY|SAMEORIGIN/i);`
    ],
    "exercises": [
      {
        "id": "ex-14-1-1",
        "title": "Weryfikacja podatności XSS w wyszukiwarce",
        "description": "Zaimplementuj test dla pola wyszukiwarki dynamicznej. Wstrzyknij złośliwy kod `<img src=x onerror=alert(1)>`, zatwierdź wyszukiwanie i zweryfikuj, że na stronie nie wyzwolił się żaden systemowy dialog błędu."
      }
    ],
    "quiz": [
      {
        "id": "q14-1-1",
        "question": "Jaki jest cel sprawdzania nagłówka X-Frame-Options w testach automatycznych?",
        "options": [
          "Chroni przed atakami typu Clickjacking, zapobiegając nieautoryzowanemu osadzaniu naszej strony wewnątrz ramek iframe na obcych domenach",
          "Wymusza szyfrowanie bazy danych SQL",
          "Automatycznie blokuje roboty sieciowe Google",
          "Nie ma wpływu na bezpieczeństwo"
        ],
        "correctAnswer": 0,
        "explanation": "X-Frame-Options z wartością DENY lub SAMEORIGIN informuje przeglądarkę, że strona nie może być renderowana wewnątrz ramek iframe obcych domen, co uniemożliwia oszukanie użytkownika (Clickjacking)."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 5: Security headers and encryption standards."
      }
    ],
    "tipsAndTricks": [
      "Stosuj zdarzenie page.on('dialog') w testach bezpieczeństwa do wychwytywania nieoczekiwanych, złośliwych komunikatów alert() wywołanych przez błędy XSS."
    ],
    "commonMistakes": [
      {
        "mistake": "Ręczne wklejanie loginów i haseł administratora bezpośrednio do plików testów bezpieczeństwa",
        "solution": "Zawsze wczytuj dane uwierzytelniające ze zmiennych środowiskowych i zabezpieczaj pliki .env."
      }
    ]
  }
};