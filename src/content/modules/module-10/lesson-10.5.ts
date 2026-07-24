import type { Lesson } from '../../../renderer/types';
import theory10_5 from './lesson-10.5.md?raw';

export const lesson10_5: Lesson = {
  "id": "10.5",
  "moduleId": 10,
  "title": "Zaawansowane strategie raportowania",
  "description": "Zaprojektuj transparentną politykę informowania o statusie testów. Poznaj techniki integracji Job Summaries w rurociągach CI, dynamicznego oznaczania znanych błędów linkami do Jira/GitHub oraz kategoryzacji awarii.",
  "order": 5,
  "difficulty": "advanced",
  "tags": ["reporting", "GitHub-Actions", "Job-Summaries", "Jira", "annotations", "CI-integration"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz projektować automatyczne podsumowania wykonania testów w GitHub Actions za pomocą Job Summaries, poprawnie powiązywać nieudane testy ze zgłoszeniami błędów oraz optymalizować widoczność wyników testów w organizacji.",
    "theory": theory10_5,
    "codeExamples": [
      `// Przykład dynamicznej adnotacji o błędzie (Książka 2 - Greffier)
testInfo.annotations.push({
  type: 'issue',
  description: 'https://github.com/microsoft/playwright/issues/23180'
});`
    ],
    "exercises": [
      {
        "id": "ex-10-5-1",
        "title": "Wdrożenie Job Summary w GitHub Actions",
        "description": "Napisz helper w TypeScript, który po każdym nieudanym teście dopisuje szczegółowy opis błędu w formacie Markdown do systemowego pliku wskazywanego przez zmienną środowiskową `GITHUB_STEP_SUMMARY`."
      }
    ],
    "quiz": [
      {
        "id": "q10-5-1",
        "question": "W jaki sposób możemy powiązać nieudany test ze znanym zgłoszeniem błędu w systemie Jira lub GitHub Issues bez wyłączania testu z wykonania?",
        "options": [
          "Wstrzykując adnotację typu 'issue' ze ścieżką URL do tablicy testInfo.annotations wewnątrz kodu testu",
          "Komentując kod testu w całości",
          "Należy usunąć plik specyfikacji",
          "Zmieniając nazwę przeglądarki na 'jira'"
        ],
        "correctAnswer": 0,
        "explanation": "Adnotacja wstrzyknięta do testInfo.annotations z typem 'issue' i adresem URL zostanie automatycznie odczytana przez HTML reporter i wyświetlona jako aktywny, czytelny link w podsumowaniu raportu testowego."
      }
    ],
    "references": [
      {
        "title": "Practical Playwright Test (Jean-François Greffier, 2026)",
        "url": "https://doi.org/10.1007/979-8-8688-2160-8",
        "description": "Chapter 6: Several annotations in HTML report."
      }
    ],
    "tipsAndTricks": [
      "Używaj adnotacji dynamicznych zamiast usuwania testów. To najlepszy sposób na kontrolowanie długu technologicznego i stanu wdrożeń poprawek przez deweloperów."
    ],
    "commonMistakes": [
      {
        "mistake": "Ręczne wklejanie logów z konsoli do opisu zadań w GitHub Actions",
        "solution": "Skonfiguruj automatyczne Job Summaries, aby serwer sam generował czytelne podsumowanie po każdym uruchomieniu rurociągu."
      }
    ]
  }
};