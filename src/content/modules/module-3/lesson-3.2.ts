import type { Lesson } from '../../../renderer/types';
import theory3_2 from './lesson-3.2.md?raw';

export const lesson3_2: Lesson = {
  "id": "3.2",
  "moduleId": 3,
  "title": "Asercje ogólne",
  "description": "Opanuj asercje ogólne (Generic Assertions). Poznaj różnicę między referencyjnym .toBe() a strukturalnym .toEqual(), dopasowanie tablic i testowanie obietnic.",
  "order": 2,
  "difficulty": "beginner",
  "tags": ["assertions", "generic", "toBe", "toEqual", "promises"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz bezpiecznie porównywać typy i struktury danych w TypeScript, poprawnie odróżniać tożsamość referencyjną od strukturalnej oraz pisać asercje na obietnicach.",
    "theory": theory3_2,
    "codeExamples": [
      `// Porównanie strukturalne obiektów (Książka 3 - Uppadhyay)
const user = { name: 'Jan', role: 'admin' };
expect(user).toEqual({ name: 'Jan', role: 'admin' });`
    ],
    "exercises": [
      {
        "id": "ex-3-2-1",
        "title": "Głębokie porównanie struktur",
        "description": "Stwórz test jednostkowy weryfikujący strukturę obiektu koszyka zakupowego (zawierającego tablicę produktów z cenami). Użyj właściwego matchera w celu sprawdzenia poprawności danych."
      }
    ],
    "quiz": [
      {
        "id": "q3-2-1",
        "question": "Jaka jest kluczowa różnica między matcherem .toBe() a .toEqual()?",
        "options": [
          ".toBe() porównuje referencje w pamięci (===), podczas gdy .toEqual() rekurencyjnie porównuje strukturę i wartości pól obiektów/tablic",
          ".toBe() jest asynchroniczny, a .toEqual() synchroniczny",
          "Nie ma między nimi żadnej różnicy",
          ".toEqual() służy wyłącznie do walidacji typów boolean"
        ],
        "correctAnswer": 0,
        "explanation": "To kluczowy koncept: dwa obiekty o identycznej zawartości mają różne referencje w pamięci, dlatego .toBe() zakończy się na nich błędem, a .toEqual() przejdzie pomyślnie."
      }
    ],
    "references": [
      {
        "title": "Practical Playwright Test (Jean-François Greffier, 2026)",
        "url": "https://doi.org/10.1007/979-8-8688-2160-8",
        "description": "Wskazówki dotyczące korzystania ze standardowych asercji."
      }
    ],
    "tipsAndTricks": [
      "Stosuj matcher .toContain() do weryfikacji obecności elementów w listach zamiast ręcznie pisać pętle sprawdzające indeksy."
    ],
    "commonMistakes": [
      {
        "mistake": "Używanie .toBe() do sprawdzania wartości obiektów wygenerowanych przez API",
        "solution": "Do porównania zawartości obiektów zawsze stosuj matcher strukturalny .toEqual()."
      }
    ]
  }
};