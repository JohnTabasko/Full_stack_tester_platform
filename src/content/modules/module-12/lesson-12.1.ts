import type { Lesson } from '../../../renderer/types';
import theory12_1 from './lesson-12.1.md?raw';

export const lesson12_1: Lesson = {
  "id": "12.1",
  "moduleId": 12,
  "title": "Zasady projektowania testów",
  "description": "Zaprojektuj zestaw testów oparty na ryzyku. Poznaj wzorzec Arrange-Act-Assert (AAA), Smoke vs Regression oraz dobór optymalnego poziomu testowania (UI vs API).",
  "order": 1,
  "difficulty": "advanced",
  "tags": ["best-practices", "risk-based", "AAA", "smoke-testing", "API-seeding"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz klasyfikować i priorytetyzować przypadki testowe na podstawie analizy ryzyka biznesowego, pisać testy o krystalicznej strukturze AAA oraz stosować techniki hybrydowe (API + UI) w celu optymalizacji prędkości.",
    "theory": theory12_1,
    "codeExamples": [
      `// Przykład hybrydowego testu (Książka 3 - Uppadhyay)
test('zakup z szybkim setupem przez API', async ({ page, request }) => {
  // Arrange (API)
  const token = await apiLogin(request);
  await apiCreateCartWithProducts(request, token);
  
  // Act & Assert (UI)
  await page.goto('/cart');
  await page.getByRole('button', { name: 'Kup' }).click();
});`
    ],
    "exercises": [
      {
        "id": "ex-12-1-1",
        "title": "Przepisanie testu na wzorzec AAA",
        "description": "Przeanalizuj chaotyczny test w projekcie, wydziel z niego logiczne fazy Arrange, Act i Assert, usuń nadmiarowe kroki interfejsu i zoptymalizuj czas jego wykonania."
      }
    ],
    "quiz": [
      {
        "id": "q12-1-1",
        "question": "Które podejście gwarantuje najwyższą prędkość i stabilność przy przygotowywaniu stanu początkowego (Arrange) przed testem funkcjonalnym UI?",
        "options": [
          "Wykorzystanie zapytań API (lub bazy danych) do błyskawicznego zalogowania i wygenerowania stanu danych w ułamku sekundy",
          "Przeklikanie całego procesu logowania i wyboru produktów ręcznie przez UI w każdym teście",
          "Użycie stałego opóźnienia na 10 sekund na początku testu",
          "Wczytanie wszystkich danych z pliku Excel"
        ],
        "correctAnswer": 0,
        "explanation": "Strategia hybrydowa (API Seeding) to kluczowy wzorzec: dane wejściowe przygotowujemy w ułamku sekundy bezpośrednio przez API, a przez interfejs graficzny UI przechodzimy tylko na kluczowym etapie weryfikacji."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 5: Engineering Principles for Enterprise Automation."
      }
    ],
    "tipsAndTricks": [
      "Zawsze staraj się, aby jeden test weryfikował dokładnie jeden proces biznesowy. Unikaj monolitycznych testów trwających po kilka minut i sprawdzających 10 rzeczy naraz."
    ],
    "commonMistakes": [
      {
        "mistake": "Powielanie manualnego procesu logowania przez UI na początku absolutnie każdego testu",
        "solution": "Zastąp to globalnym stanem sesji storageState (Setup Project) lub szybkim logowaniem przez API."
      }
    ]
  }
};