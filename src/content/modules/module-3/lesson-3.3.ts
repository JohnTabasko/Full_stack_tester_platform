import type { Lesson } from '../../../renderer/types';
import theory3_3 from './lesson-3.3.md?raw';

export const lesson3_3: Lesson = {
  "id": "3.3",
  "moduleId": 3,
  "title": "Asercje odpowiedzi API",
  "description": "Opanuj weryfikację warstwy REST API w Playwright. Poznaj asercję toBeOK(), częściowe dopasowanie struktur JSON (objectContaining) oraz nagłówków HTTP.",
  "order": 3,
  "difficulty": "intermediate",
  "tags": ["api-testing", "toBeOK", "JSON-validation", "headers", "contract-testing"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz pisać zaawansowane asercje na odpowiedziach API, walidować poprawność struktury zwracanego pliku JSON oraz diagnozować przyczyny błędów na poziomie rurociągów CI/CD.",
    "theory": theory3_3,
    "codeExamples": [
      `// Walidacja kontraktu API z użyciem częściowego dopasowania (Książka 3 - Uppadhyay)
const body = await response.json();
expect(body).toEqual(expect.objectContaining({ status: 'success' }));`
    ],
    "exercises": [
      {
        "id": "ex-3-3-1",
        "title": "Weryfikacja kontraktu zamówień przez API",
        "description": "Zaprojektuj test API dla pobierania szczegółów zamówienia. Zweryfikuj, że odpowiedź zwraca status 200, content-type to JSON oraz że struktura odpowiedzi zawiera klucz 'items' będący niepustą tablicą."
      }
    ],
    "quiz": [
      {
        "id": "q3-3-1",
        "question": "Które podejście jest rekomendowane do sprawdzania dynamicznych struktur danych JSON zwróconych z API?",
        "options": [
          "Wykorzystanie matchera expect.objectContaining() w celu weryfikacji wyłącznie obecności i poprawności kluczowych pól biznesowych",
          "Porównywanie całego obiektu za pomocą .toBe()",
          "Ręczne parsowanie całego pliku tekstowego za pomocą wyrażeń regularnych",
          "Nie należy walidować zawartości JSON na poziomie automatyzacji"
        ],
        "correctAnswer": 0,
        "explanation": "objectContaining() pozwala na elastyczne i bezproblemowe dopasowanie częściowe, co chroni testy przed fałszywymi błędami przy zmianach dynamicznych parametrów (np. dat)."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 2: API validation and structural integrity."
      }
    ],
    "tipsAndTricks": [
      "Przechwytuj i loguj ciało błędu (text()) przy nieudanych zapytaniach API. Skróci to czas poszukiwania przyczyn awarii w CI o połowę."
    ],
    "commonMistakes": [
      {
        "mistake": "Brak weryfikacji status code błędu przed wywołaniem metody response.json()",
        "solution": "Wykrycie błędu 500 może zwracać czysty tekst, a próba parsowania go na JSON rzuci błąd składniowy maskujący prawdziwą przyczynę awarii."
      }
    ]
  }
};