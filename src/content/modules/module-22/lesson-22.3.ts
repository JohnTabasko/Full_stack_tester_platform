import type { Lesson } from '../../../renderer/types';
import theory22_3 from './lesson-22.3.md?raw';

export const lesson22_3: Lesson = {
  "id": "22.3",
  "moduleId": 22,
  "title": "Webhooki, ponowienia i idempotencja",
  "description": "Opanuj testowanie asynchronicznych powiadomień Webhook. Dowiedz się, jak weryfikować podpisy bezpieczeństwa, testować odporność na duplikaty (Idempotencja) oraz obsługiwać ponowienia (Retries).",
  "order": 3,
  "difficulty": "advanced",
  "tags": ["webhooks", "idempotency", "retries", "Stripe", "security", "API-testing"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz pisać testy bezpieczeństwa i integralności dla punktów końcowych Webhook, weryfikować mechanizmy idempotencji przy użyciu unikalnych kluczy oraz asynchronicznie badać poprawność zapisów w bazie danych.",
    "theory": theory22_3,
    "codeExamples": [
      `// Przykład testowania idempotencji Webhooka (Książka 3 - Uppadhyay)
const payload = { transactionId: 'tx-1' };
await request.post('/webhook', { data: payload });
const res2 = await request.post('/webhook', { data: payload });
expect(res2.status()).toBe(200); // Drugie wywołanie powinno być bezpiecznie zignorowane`
    ],
    "exercises": [
      {
        "id": "ex-22-3-1",
        "title": "Weryfikacja podpisu sygnatury Webhooka",
        "description": "Napisz test bezpieczeństwa dla punktu końcowego `/api/webhooks`. Wyślij poprawne żądanie, ale ze sfałszowanym nagłówkiem sygnatury (`X-Signature`) i upewnij się, że serwer poprawnie odrzuca żądanie ze statusem 401 Unauthorized."
      }
    ],
    "quiz": [
      {
        "id": "q22-3-1",
        "question": "Czym jest Idempotencja w kontekście asynchronicznych zapytaniach Webhook?",
        "options": [
          "To właściwość sprawiająca, że wielokrotne wywołanie tej samej operacji z identycznym kluczem daje dokładnie ten sam rezultat i nie wywołuje skutków ubocznych (np. duplikowania płatności)",
          "To metoda szyfrowania danych przesyłanych przez HTTP",
          "To automatyczne odpytywanie bazy danych w pętli",
          "To technika testowania responsywności na urządzeniach mobilnych"
        ],
        "correctAnswer": 0,
        "explanation": "Idempotencja gwarantuje, że jeśli system zewnętrzny (np. Stripe) ponowi wysyłkę tego samego powiadomienia (np. z powodu problemów z siecią), nasz system obsłuży je tylko raz, zabezpieczając dane przed zduplikowaniem."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 6: Webhooks, retries, and idempotency validation."
      }
    ],
    "tipsAndTricks": [
      "Stosuj unikalne klucze idempotencji (idempotency keys) oparte o UUID transakcji w nagłówkach lub ciele webhooków, aby serwer mógł bezbłędnie namierzyć duplikaty."
    ],
    "commonMistakes": [
      {
        "mistake": "Testowanie webhooków bez weryfikacji stanu bazy danych (sprawdzanie tylko statusu HTTP 200)",
        "solution": "Zawsze po wysłaniu webhooka odpytaj bazę danych i upewnij się, że liczba transakcji i status zamówienia są prawidłowe."
      }
    ]
  }
};