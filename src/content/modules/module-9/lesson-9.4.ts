import type { Lesson } from '../../../renderer/types';
import theory5_9_4 from './lesson-9.4.md?raw'; // Note: reuse same theory binder name safely

export const lesson5_9_4: Lesson = {
  "id": "9.4",
  "moduleId": 9,
  "title": "Stabilność i niezawodność testów",
  "description": "Zwalczaj niestabilność (flakiness) testów E2E. Poznaj przyczyny wyścigów stanów, zasady ścisłej izolacji danych, bezpieczne timouty oraz obsługę ponowień (Retries).",
  "order": 4,
  "difficulty": "advanced",
  "tags": ["flakiness", "stability", "retries", "race-conditions", "isolation"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz bezbłędnie diagnozować i usuwać przyczyny niestabilności testów, eliminować wyścigi stanów za pomocą asercji Web-First, poprawnie konfigurować ponowienia (retries) i dbać o 100% niezależność środowiskową testów.",
    "theory": theory5_9_4,
    "codeExamples": [
      `// Przykład elastycznego timeoutu asercji (Książka 2 - Greffier)
await expect(page.locator('.status-box')).toHaveText('Gotowe', { timeout: 15000 });`
    ],
    "exercises": [
      {
        "id": "ex-9-4-1",
        "title": "Diagnostyka i naprawa flaky testu",
        "description": "Zidentyfikuj niestabilny test w projekcie, który okazjonalnie zawodzi w CI z powodu asynchronicznego renderowania. Przeanalizuj plik Trace, zastąp kruchą asercję wersją Web-First i zweryfikuj stabilność testu."
      }
    ],
    "quiz": [
      {
        "id": "q9-4-1",
        "question": "W jaki sposób Playwright Test oznacza w końcowych raportach test, który nie przeszedł za pierwszym razem, ale zaliczył pozytywnie próbę ponowienia (Retry)?",
        "options": [
          "Jako test niestabilny (Flaky)",
          "Jako test udany (Passed)",
          "Jako błąd krytyczny (Failed)",
          "Jako test pominięty (Skipped)"
        ],
        "correctAnswer": 0,
        "explanation": "Playwright oznacza takie testy jako Flaky (niestabilne). To ważna informacja dla zespołu - test ostatecznie przeszedł, ale jego kod wymaga rzetelnego przeanalizowania i stabilizacji."
      }
    ],
    "references": [
      {
        "title": "Practical Playwright Test (Jean-François Greffier, 2026)",
        "url": "https://doi.org/10.1007/979-8-8688-2160-8",
        "description": "Chapter 9: Gain Confidence Thanks to Reliable Tests (Zwalczanie flakiness)."
      }
    ],
    "tipsAndTricks": [
      "Nigdy nie ignoruj testów oznaczonych jako Flaky. Wykorzystaj Trace Viewer, aby przeanalizować historię sieci i DOM w ułamku sekundy, w którym test nie przeszedł przy pierwszej próbie."
    ],
    "commonMistakes": [
      {
        "mistake": "Zwiększanie domyślnego limitu czasu (timeout) globalnie w konfiguracji dla wszystkich testów z powodu jednego powolnego kroku",
        "solution": "Pozostaw globalny timeout na poziomie 30s, a dla tego jednego powolnego wywołania nadpisz lokalnie opcję { timeout: 15000 } wewnątrz asercji expect."
      }
    ]
  }
};