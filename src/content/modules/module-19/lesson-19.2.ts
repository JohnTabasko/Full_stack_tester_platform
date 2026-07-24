import type { Lesson } from '../../../renderer/types';
import theory19_2 from './lesson-19.2.md?raw';

export const lesson19_2: Lesson = {
  "id": "19.2",
  "moduleId": 19,
  "title": "Mocki, stuby, obiekty pozorne i szpiedzy",
  "description": "Zrozum klasyczną taksonomię atrap testowych Gerarda Meszarosa. Opanuj różnice między Dummy, Stub, Spy, Mock i Fake oraz ich wdrażanie w środowisku Vitest.",
  "order": 2,
  "difficulty": "advanced",
  "tags": ["mocks", "stubs", "spies", "Meszaros", "Vitest", "unit-testing"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz precyzyjnie rozróżniać i poprawnie stosować atrapy testowe, pisać testy oparte o weryfikację stanu (Stubs) oraz weryfikację zachowania (Mocks) w środowisku Vitest.",
    "theory": theory19_2,
    "codeExamples": [
      `// Przykład tworzenia stuba i szpiega w Vitest (Książka 3 - Uppadhyay)
const calculateSpy = vi.fn().mockReturnValue(100);
const result = calculateSpy('argument');
expect(calculateSpy).toHaveBeenCalledWith('argument');`
    ],
    "exercises": [
      {
        "id": "ex-19-2-1",
        "title": "Wdrożenie atrapy InMemoryDatabase",
        "description": "Napisz prostą klasę pozorowaną `InMemoryDatabase` (Fake), która implementuje interfejs bazy danych przy użyciu zwykłej tablicy w pamięci i użyj jej do przetestowania serwisu użytkowników."
      }
    ],
    "quiz": [
      {
        "id": "q19-2-1",
        "question": "Jaka jest kluczowa różnica między Stubem (Stub) a Mockiem (Mock) według klasycznej taksonomii Meszarosa?",
        "options": [
          "Stub dostarcza dane wejściowe do systemu (Indirect Input), a Mock weryfikuje interakcje i poprawne wywołania wyjściowe (Behavior Verification)",
          "Stub służy wyłącznie do testowania bazy danych SQL",
          "Nie ma między nimi żadnej różnicy",
          "Mock to pojęcie dla testów UI, a Stub dla API"
        ],
        "correctAnswer": 0,
        "explanation": "To fundamentalna koncepcja inżynierii testów. Stub dostarcza prekonfigurowany stan (np. zwraca 150 zł przy calculate), a Mock sprawdza czy system wywołał powiązaną metodę (np. czy wysłał powiadomienie email)."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 5: Engineering Principles for Enterprise Automation (Gerard Meszaros doubles)."
      }
    ],
    "tipsAndTricks": [
      "Stosuj atrapy z umiarem. Nadmierne mockowanie sprawia, że testy są bardzo mocno sprzężone z implementacją techniczną kodu i ulegają uszkodzeniu przy każdej drobnej refaktoryzacji."
    ],
    "commonMistakes": [
      {
        "mistake": "Nazywanie każdego obiektu pozorowanego w kodzie słowem 'mock'",
        "solution": "Używaj precyzyjnych określeń w nazwach zmiennych: emailSpy, taxServiceStub, dbFake."
      }
    ]
  }
};