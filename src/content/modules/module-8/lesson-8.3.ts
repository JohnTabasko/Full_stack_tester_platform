import type { Lesson } from '../../../renderer/types';
import theory8_3 from './lesson-8.3.md?raw';

export const lesson8_3: Lesson = {
  "id": "8.3",
  "moduleId": 8,
  "title": "Kontrakty API i walidacja schematów",
  "description": "Zabezpiecz integracje przed breaking changes. Poznaj definicję kontraktów API, integrację walidatora AJV oraz dopasowywanie odpowiedzi JSON do schematów strukturalnych.",
  "order": 3,
  "difficulty": "advanced",
  "tags": ["contracts", "JSON-schema", "AJV", "validation", "integration", "API-testing"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz projektować schematy walidacyjne JSON Schema, integrować bibliotekę AJV w testach Playwright, przeprowadzać rygorystyczną walidację struktury danych API oraz generować czytelne komunikaty o naruszeniach kontraktów.",
    "theory": theory8_3,
    "codeExamples": [
      `// Przykład walidacji z użyciem AJV (Książka 3 - Uppadhyay)
import Ajv from 'ajv';
const ajv = new Ajv();
const validate = ajv.compile(schema);
const valid = validate(apiResponseJson);
expect(valid).toBe(true);`
    ],
    "exercises": [
      {
        "id": "ex-8-3-1",
        "title": "Walidacja schematu szczegółów zamówienia",
        "description": "Zaprojektuj schemat JSON Schema dla odpowiedzi pobierania zamówienia. Wdroż walidację z użyciem AJV w teście Playwright i upewnij się, że test wykryje brak wymaganego pola 'totalPrice'."
      }
    ],
    "quiz": [
      {
        "id": "q8-3-1",
        "question": "Jakie zadanie spełnia walidacja schematów (JSON Schema Validation) przy użyciu biblioteki AJV?",
        "options": [
          "Weryfikuje zgodność strukturalną odpowiedzi JSON (typy pól, wymagane klucze, formaty) z zadeklarowanym kontraktem specyfikacji",
          "Automatycznie wysyła zapytania na serwer",
          "Służy wyłącznie do testowania szybkości API",
          "Generuje makiety graficzne strony na podstawie JSON"
        ],
        "correctAnswer": 0,
        "explanation": "JSON Schema Validation z biblioteką AJV dopasowuje strukturę otrzymanego JSON-a do schematu, co gwarantuje pełną zgodność kontraktową i chroni system przed breaking changes."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 2: API Contract testing and Schema integrity."
      }
    ],
    "tipsAndTricks": [
      "Wykorzystaj opcję 'allErrors: true' w konfiguracji AJV, aby lister zwrócił pełną listę wszystkich błędów strukturalnych naraz, a nie przerywał pracy na pierwszym napotkanym błędzie."
    ],
    "commonMistakes": [
      {
        "mistake": "Ręczne sprawdzanie typów i obecności kilkudziesięciu pól przy użyciu tradycyjnych asercji expect.toHaveProperty",
        "solution": "Zastąp powtarzalne asercje jednym zunifikowanym i czytelnym wywołaniem walidatora AJV ze schematem JSON Schema."
      }
    ]
  }
};