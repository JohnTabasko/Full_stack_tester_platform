import type { Lesson } from '../../../renderer/types';
import theory28_3 from './lesson-28.3.md?raw';

export const lesson28_3: Lesson = {
  "id": "28.3",
  "moduleId": 28,
  "title": "Zadania rekrutacyjne i programowanie na żywo",
  "description": "Opanuj techniczny proces rekrutacyjny na stanowisko SDET. Poznaj najczęstsze pytania techniczne (QA), strategie radzenia sobie podczas sesji Live Coding/Pair Programming oraz tworzenie dokumentów decyzji architektonicznych (ADR).",
  "order": 3,
  "difficulty": "advanced",
  "tags": ["recruitment", "live-coding", "pair-programming", "ADR", "technical-questions", "interview"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz bezstresowo przejść przez sesje Live Coding, głośno i merytorycznie tłumaczyć swój proces myślowy, rzetelnie odpowiadać na zaawansowane pytania techniczne oraz dokumentować wybory projektowe za pomocą szablonów ADR.",
    "theory": theory28_3,
    "codeExamples": [
      `// Przykład uproszczonego szablonu ADR (Książka 3 - Uppadhyay)
# ADR 2: Wybór Playwright do testów API zamiast Supertest
## Decyzja: Używamy wbudowanej fixtury request z @playwright/test
## Konsekwencje: Brak dodatkowych zależności, natywna synchronizacja sesji.`
    ],
    "exercises": [
      {
        "id": "ex-28-3-1",
        "title": "Napisanie ADR dla wyboru bazy danych",
        "description": "Stwórz dokument Architecture Decision Record (ADR) uzasadniający wybór bazy danych PostgreSQL i kontenerów Docker Compose jako głównego środowiska testów integracyjnych w Twojej firmie."
      }
    ],
    "quiz": [
      {
        "id": "q28-3-1",
        "question": "Jaka jest najważniejsza zasada zachowania podczas sesji Live Coding / Pair Programming z rekruterami technicznymi?",
        "options": [
          "Głośne i logiczne tłumaczenie swojego procesu myślowego (metodologia Think Aloud) podczas pisania każdej linii kodu",
          "Kodowanie w absolutnej ciszy bez kontaktu z rekruterem",
          "Kopiowanie gotowych rozwiązań z internetu bez słowa wyjaśnienia",
          "Natychmiastowe poddanie się przy napotkaniu błędu kompilacji"
        ],
        "correctAnswer": 0,
        "explanation": "Dla liderów technicznych liczy się proces myślowy dewelopera. Tłumaczenie na głos swoich założeń i decyzji architektonicznych pozwala ocenić dojrzałość inżynierską oraz umiejętności współpracy zespołowej."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 12: Reflections on Test Automation (Recruitment live coding)."
      }
    ],
    "tipsAndTricks": [
      "Jeśli podczas Live Coding napotkasz niespodziewany błąd kompilacji, nie panikuj. To doskonała szansa, aby pokazać rekruterom swoje umiejętności diagnostyczne - spokojnie przeanalizuj logi i opisz, jak zamierzasz go rozwiązać."
    ],
    "commonMistakes": [
      {
        "mistake": "Próba budowania skomplikowanych i nadmiarowych wzorców projektowych na samym starcie sesji Live Coding",
        "solution": "Zacznij od najprostszego, działającego rozwiązania (MVP), a dopiero po pomyślnym uruchomieniu testu zaproponuj i wdroż elegancki refaktoring."
      }
    ]
  }
};