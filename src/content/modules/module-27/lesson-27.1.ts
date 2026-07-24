import type { Lesson } from '../../../renderer/types';
import theory27_1 from './lesson-27.1.ts?raw'; // Safely reference theory

export const lesson27_1: Lesson = {
  "id": "27.1",
  "moduleId": 27,
  "title": "Sztuczna inteligencja w analizie wymagań i ryzyk",
  "description": "Zrewolucjonizuj proces analizy jakości za pomocą AI. Poznaj techniki Prompt Engineeringu dla testerów, modelowanie ryzyka za pomocą LLM oraz metodologię Human-in-the-Loop.",
  "order": 1,
  "difficulty": "advanced",
  "tags": ["AI", "LLM", "Prompt-Engineering", "Human-in-the-loop", "risk-assessment", "Shift-Left"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz efektywnie stosować modele LLM do analizowania wymagań i specyfikacji biznesowych, projektować ustrukturyzowane zapytania (prompty) o wysokim stopniu precyzji oraz wdrażać rygorystyczną metodologię Human-in-the-Loop.",
    "theory": theory27_1,
    "codeExamples": [
      `// Przykład mapowania promptu walidacyjnego (Książka 3 - Uppadhyay)
const systemPrompt = "Jesteś ekspertem SDET. Przeanalizuj kod i znajdź błędy asynchroniczności.";`
    ],
    "exercises": [
      {
        "id": "ex-27-1-1",
        "title": "Projektowanie promptu analizy specyfikacji",
        "description": "Zaprojektuj zaawansowany system promptów dla modelu LLM, który przyjmuje surowy opis historyjki użytkownika (User Story) i generuje pełną matrycę przypadków testowych z podziałem na UI oraz API."
      }
    ],
    "quiz": [
      {
        "id": "q27-1-1",
        "question": "Na czym polega zasada Human-in-the-Loop w kontekście wdrożenia sztucznej inteligencji (AI) w testach?",
        "options": [
          "Zakłada, że sztuczna inteligencja wspiera i generuje pomysły/kod, ale to ludzki ekspert (tester/SDET) krytycznie analizuje, poprawia i ostatecznie autoryzuje wynik przed jego wdrożeniem",
          "Wymaga, aby testy automatyczne były uruchamiane wyłącznie przez człowieka ręcznie",
          "Zabrania deweloperom korzystania z asystentów AI",
          "Oznacza pełne zastąpienie ludzi przez boty LLM"
        ],
        "correctAnswer": 0,
        "explanation": "To kluczowa zasada bezpieczeństwa i jakości: AI może ułatwić i przyspieszyć generowanie szkieletu kodu, ale bez rzetelnego audytu człowieka (human verification) niesie wysokie ryzyko błędów logicznych i długu technicznego."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 12: Reflections on Test Automation (AI integration)."
      }
    ],
    "tipsAndTricks": [
      "Stosuj precyzyjnie określone role systemowe (np. 'Jesteś architektem testów z 10-letnim stażem') przed wklejeniem właściwego kodu do weryfikacji przez model LLM."
    ],
    "commonMistakes": [
      {
        "mistake": "Bezmyślne kopiowanie kodu wygenerowanego przez AI bezpośrednio do repozytorium bez sprawdzenia stabilności i typowania",
        "solution": "Zawsze poddawaj kod wygenerowany przez AI rygorystycznemu manualnemu przeglądowi (code review) i sprawdź kompilację."
      }
    ]
  }
};