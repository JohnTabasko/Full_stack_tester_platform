import type { Lesson } from '../../../renderer/types';
import theory18_1 from './lesson-18.1.md?raw';

export const lesson18_1: Lesson = {
  "id": "18.1",
  "moduleId": 18,
  "title": "Podstawy TypeScript dla automatyzacji",
  "description": "Zaprojektuj bezpieczny typowo kod testowy. Opanuj zwalczanie any za pomocą unknown i Type Guards, operator satisfies oraz zaawansowane typy narzędziowe (Partial, Omit).",
  "order": 1,
  "difficulty": "advanced",
  "tags": ["TypeScript", "type-safety", "unknown", "satisfies", "Utility-Types", "clean-code"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz wyeliminować any z bazy kodu testowego, wdrażać rygorystyczne typowanie TypeScript z strict: true, stosować unknown i strażników typów oraz elastycznie zarządzać modelami danych za pomocą typów narzędziowych.",
    "theory": theory18_1,
    "codeExamples": [
      `// Przykład wykorzystania Omit i Partial (Książka 3 - Uppadhyay)
interface User { id: string; name: string; email: string; }
type UserRegistration = Omit<User, 'id'>;
const newUser: UserRegistration = { name: 'Jan', email: 'jan@test.pl' };`
    ],
    "exercises": [
      {
        "id": "ex-18-1-1",
        "title": "Zaimplementowanie typowanego API Response",
        "description": "Zadeklaruj model danych `Order`. Napisz funkcję parsującą odpowiedź z serwera o typie `unknown` i użyj strażników typów, aby upewnić się, że dane są kompletne i poprawne przed przekazaniem ich do testu."
      }
    ],
    "quiz": [
      {
        "id": "q18-1-1",
        "question": "Dlaczego stosowanie typu unknown jest lepsze niż typu any przy odbieraniu danych z API zewnętrznego?",
        "options": [
          "Ponieważ unknown informuje kompilator, że struktura danych jest nieznana, wymuszając rygorystyczne sprawdzenie i zawężenie typu (Type Guards) przed użyciem danych",
          "Ponieważ unknown automatycznie kompiluje kod do Pythona",
          "Ponieważ any wyłącza obsługę wątków",
          "Nie ma między nimi różnicy"
        ],
        "correctAnswer": 0,
        "explanation": "typ any wyłącza kompilator i pozwala na błędy w locie. typ unknown blokuje jakiekolwiek operacje na obiekcie, dopóki deweloper jawnie nie zweryfikuje i nie otypuje struktury danych, co gwarantuje 100% bezpieczeństwo."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 1: Scalable Test Automation and Design Patterns (TypeScript Mastery)."
      }
    ],
    "tipsAndTricks": [
      "Zawsze włączaj flagę 'strict: true' w pliku tsconfig.json. To najważniejsza decyzja chroniąca przed powstawaniem długu technicznego w kodzie testów."
    ],
    "commonMistakes": [
      {
        "mistake": "Nadużywanie słowa kluczowego any do 'szybkiego' wyciszania błędów kompilatora",
        "solution": "Zdiagnozuj powód błędu typowania, użyj rzetelnego rzutowania typu lub typów narzędziowych (Utility Types)."
      }
    ]
  }
};