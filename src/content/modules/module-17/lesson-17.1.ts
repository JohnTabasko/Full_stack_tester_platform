import type { Lesson } from '../../../renderer/types';
import theory17_1 from './lesson-17.1.md?raw';

export const lesson17_1: Lesson = {
  "id": "17.1",
  "moduleId": 17,
  "title": "Rola testera i strategia jakości",
  "description": "Zrozum strategiczną rolę Full Stack Testera / SDET. Opanuj koncepcję Shift-Left Quality, zarządzanie ryzykiem biznesowym, Definition of Done oraz kryteria opłacalności automatyzacji.",
  "order": 1,
  "difficulty": "intermediate",
  "tags": ["strategy", "Shift-Left", "risk-management", "DoD", "SDET", "best-practices"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz projektować spójną strategię zapewnienia jakości (Quality Strategy), wdrażać zasady Shift-Left w zespole programistycznym, priorytetyzować testy na podstawie szacowania ryzyka oraz świadomie dobierać scenariusze do automatyzacji.",
    "theory": theory17_1,
    "codeExamples": [
      `// Przykład mapy ryzyka (Książka 3 - Uppadhyay)
interface RiskRecord {
  feature: string;
  probability: 'high' | 'medium' | 'low';
  impact: 'critical' | 'major' | 'minor';
}
const checkoutRisk: RiskRecord = {
  feature: 'Bramka Płatności Stripe',
  probability: 'low',
  impact: 'critical' // Blokuje przychody firmy - najwyższy priorytet testów!
};`
    ],
    "exercises": [
      {
        "id": "ex-17-1-1",
        "title": "Analiza ryzyka dla nowego modułu",
        "description": "Zaprojektuj uproszczoną matrycę ryzyka (Risk Matrix) dla nowo powstającego modułu subskrypcji premium w aplikacji. Sklasyfikuj prawdopodobieństwo i wpływ awarii oraz wskaż 3 kluczowe testy Smoke."
      }
    ],
    "quiz": [
      {
        "id": "q17-1-1",
        "question": "Co oznacza pojęcie 'Shift-Left' w kontekście strategii zapewnienia jakości?",
        "options": [
          "Przesunięcie działań testowych na jak najwcześniejsze etapy cyklu życia projektu (już od analizy wymagań), zamiast zostawiania ich na sam koniec",
          "Pisanie testów wyłącznie w lewej części pliku specyfikacji",
          "Uruchamianie testów wyłącznie na systemach operacyjnych Linux",
          "Zastąpienie testów automatycznych testami manualnymi"
        ],
        "correctAnswer": 0,
        "explanation": "Shift-Left to fundamentalna koncepcja DevSecOps: weryfikacja jakości rozpoczyna się od analizy wymagań, co zapobiega powstawaniu błędów i drastycznie obniża koszty naprawy podatności."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 1: Scalable Test Automation and Design Patterns."
      }
    ],
    "tipsAndTricks": [
      "Stosuj spotkania Three Amigos (Biznes, Deweloper, Tester) przed rozpoczęciem sprintu, aby uzgodnić kryteria akceptacji i zapobiec powstawaniu błędów specyfikacji."
    ],
    "commonMistakes": [
      {
        "mistake": "Ślepe próby zautomatyzowania 100% wszystkich przypadków testowych w warstwie E2E (UI)",
        "solution": "Automatyzacja E2E powinna być wąska i skupiona na ryzyku. Przypadki brzegowe i walidacje pól testuj w niższych warstwach (API lub testach jednostkowych)."
      }
    ]
  }
};