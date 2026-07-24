import type { Lesson } from '../../../renderer/types';
import theory24_2 from './lesson-24.2.md?raw';

export const lesson24_2: Lesson = {
  "id": "24.2",
  "moduleId": 24,
  "title": "Podstawy k6",
  "description": "Opanuj nowoczesne testowanie obciążeń z Grafana k6. Poznaj koncepcję Wirtualnych Użytkowników (VUs), modelowanie faz obciążenia (stages), weryfikację poprawności (checks) oraz twarde asercje (thresholds) w CI/CD.",
  "order": 2,
  "difficulty": "advanced",
  "tags": ["k6", "performance", "load-testing", "VUs", "stages", "thresholds", "DevOps"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz pisać kompletne skrypty wydajnościowe w k6 (JavaScript/ES6), modelować fazy obciążenia (stages), weryfikować statusy odpowiedzi (checks) oraz definiować automatyczne asercje jakościowe (thresholds) dla rurociągów CI/CD.",
    "theory": theory24_2,
    "codeExamples": [
      `// Przykład konfiguracji testu k6 (Książka 3 - Uppadhyay)
import http from 'k6/http';
export const options = {
  vus: 20,
  duration: '1m',
  thresholds: { http_req_duration: ['p95 < 200'] }
};
export default function() { http.get('http://api.test/products'); }`
    ],
    "exercises": [
      {
        "id": "ex-24-2-1",
        "title": "Wdrożenie testu kasy z progami w k6",
        "description": "Zaimplementuj skrypt k6 symulujący proces dodawania produktu do koszyka pod obciążeniem 30 użytkowników przez 2 minuty. Skonfiguruj próg tolerancji tak, aby 99% zapytań zakończyło się w czasie poniżej 300 ms."
      }
    ],
    "quiz": [
      {
        "id": "q24-2-1",
        "question": "W jaki sposób definiujemy twarde, automatyczne asercje wydajnościowe (np. maksymalny czas odpowiedzi) w konfiguracji k6?",
        "options": [
          "Definiując tablicę progów w sekcji 'thresholds' wewnątrz obiektu options",
          "Wpisując asercje expect() wewnątrz bloku try/catch",
          "Nie da się zautomatyzować weryfikacji progów czasowych",
          "Poprzez bezpośrednie rzucanie błędów w konsoli"
        ],
        "correctAnswer": 0,
        "explanation": "Sekcja 'thresholds' to kluczowe narzędzie DevSecOps/SRE w k6. Pozwala zadeklarować rygorystyczne warunki (np. p95 < 200ms), których niespełnienie automatycznie przerywa rurociąg CI ze statusem błędu."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 11: Advanced Test Maintenance and Optimization Strategies (Performance testing with k6)."
      }
    ],
    "tipsAndTricks": [
      "Stosuj 'Think Time' (metodę sleep) na koniec pętli wirtualnego użytkownika, aby symulować czas, w którym człowiek faktycznie czyta treść na stronie przed kolejnym kliknięciem, co zapobiega nierealistycznym atakom DDoS na Twoje API."
    ],
    "commonMistakes": [
      {
        "mistake": "Testowanie wydajności bez weryfikacji poprawności odpowiedzi (brak metod check())",
        "solution": "Zawsze weryfikuj poprawność kodu statusu. Powolna odpowiedź rzucająca błędy 500 w 50 ms może wyglądać na wydajną, mimo że aplikacja leży."
      }
    ]
  }
};