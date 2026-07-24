import type { Lesson } from '../../../renderer/types';
import theory16_2 from './lesson-16.2.md?raw';

export const lesson16_2: Lesson = {
  "id": "16.2",
  "moduleId": 16,
  "title": "Testowanie poczty elektronicznej",
  "description": "Opanuj testowanie procesów rejestracji i resetowania haseł. Poznaj konfigurację serwera Mailpit, odpytywanie API Mailpit za pomocą expect.poll oraz wyodrębnianie linków aktywacyjnych przy użyciu Regex.",
  "order": 2,
  "difficulty": "advanced",
  "tags": ["email-testing", "Mailpit", "SMTP-mock", "expect.poll", "API-testing", "regex"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz konfigurować serwer Mailpit, pobierać listy odebranych wiadomości przez REST API w kodzie Playwright, wyodrębniać dynamiczne klucze i linki aktywacyjne z treści HTML oraz wdrażać stabilne testy procesów uwierzytelniających.",
    "theory": theory16_2,
    "codeExamples": [
      `// Przykład odpytywania API Mailpit o pocztę (Książka 1 - Kelhini)
await expect.poll(async () => {
  const response = await request.get('http://localhost:8025/api/v1/messages');
  const body = await response.json();
  return body.messages.find(m => m.To[0].Address === 'test@test.pl');
}, { timeout: 10000 }).toBeDefined();`
    ],
    "exercises": [
      {
        "id": "ex-16-2-1",
        "title": "Weryfikacja procesu rejestracji z e-mailem",
        "description": "Zaimplementuj test dla formularza rejestracji. Po wysłaniu danych, pobierz e-mail aktywacyjny z Mailpit, wyciągnij link aktywacyjny, przejdź pod niego i zweryfikuj aktywację konta."
      }
    ],
    "quiz": [
      {
        "id": "q16-2-1",
        "question": "W jaki sposób należy prawidłowo pobrać i zweryfikować e-mail aktywacyjny w asynchronicznym teście Playwright?",
        "options": [
          "Odpytując cyklicznie lokalny serwer przechwytujący (np. Mailpit) przy użyciu expect.poll() z określeniem odpowiedniego limitu czasu (timeout)",
          "Wstawiając stały sleep na 15 sekund",
          "Nie da się odczytać treści e-maila w kodzie Playwright",
          "Wczytując pliki z dysku twardego serwera pocztowego"
        ],
        "correctAnswer": 0,
        "explanation": "Wysyłka i odebranie wiadomości przez serwer pocztowy trwa kilkaset milisekund, dlatego asynchroniczne odpytywanie (polling) przez expect.poll() gwarantuje stabilność bez marnowania czasu testu."
      }
    ],
    "references": [
      {
        "title": "Hands-On Automated Testing with Playwright (Faraz K. Kelhini, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Chapter 13: Handling multiple file types (validating content and APIs)."
      }
    ],
    "tipsAndTricks": [
      "Wykorzystaj Mailpit jako kontener w Docker Compose, co ułatwi odpalanie całego środowiska jedną komendą w rurociągu CI/CD."
    ],
    "commonMistakes": [
      {
        "mistake": "Próba wysyłania rzeczywistych wiadomości testowych na produkcyjne domeny pocztowe (np. gmail.com) podczas testów automatycznych",
        "solution": "Zawsze przekierowuj ruch deweloperski i testowy SMTP na odizolowany serwer typu Mailpit/Mailhog."
      }
    ]
  }
};