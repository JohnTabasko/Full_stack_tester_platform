import type { Lesson } from '../../../renderer/types';
import theory11_1 from './lesson-11.1.md?raw';

export const lesson11_1: Lesson = {
  "id": "11.1",
  "moduleId": 11,
  "title": "Integracja z GitHub Actions",
  "description": "Zaprojektuj rurociąg CI dla GitHub Actions. Poznaj strukturę zdarzeń wyzwalających (triggers), instalację przeglądarek z zależnościami systemowymi, sekrety oraz upload raportów.",
  "order": 1,
  "difficulty": "intermediate",
  "tags": ["CI-CD", "GitHub-Actions", "pipeline", "YAML", "artifacts", "secrets"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz stworzyć od zera kompletny, produkcyjny plik konfiguracyjny YAML dla GitHub Actions, bezpiecznie wstrzykiwać zmienne i sekrety środowiskowe oraz zarządzać eksportem raportów diagnostycznych.",
    "theory": theory11_1,
    "codeExamples": [
      `// Przykład wyzwalania i zmiennych w workflow (Książka 2 - Greffier)
name: Run Playwright
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright test`
    ],
    "exercises": [
      {
        "id": "ex-11-1-1",
        "title": "Stworzenie pierwszego workflow",
        "description": "Utwórz w swoim projekcie katalog `.github/workflows/` i zaimplementuj w nim plik `playwright.yml` weryfikujący kod przy zdarzeniu `pull_request`, z automatycznym eksportem raportu HTML."
      }
    ],
    "quiz": [
      {
        "id": "q11-1-1",
        "question": "Które ustawienie kroku upload-artifact w pliku YAML gwarantuje, że raport z testów zostanie pobrany nawet wtedy, gdy testy zakończą się niepowodzeniem?",
        "options": [
          "if: always()",
          "if: success()",
          "if: failed()",
          "always-upload: true"
        ],
        "correctAnswer": 0,
        "explanation": "Flaga 'if: always()' nakazuje silnikowi GitHub Actions wykonać dany krok bez względu na to, czy poprzednie kroki (np. uruchomienie testów) zakończyły się sukcesem, czy błędem."
      }
    ],
    "references": [
      {
        "title": "Hands-On Automated Testing with Playwright (Faraz K. Kelhini, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Chapter 7: Integrating Workflows with CI/CD Pipelines (GitHub Actions)."
      }
    ],
    "tipsAndTricks": [
      "Stosuj workflow_dispatch, aby umożliwić deweloperom i testerom ręczne wywoływanie testów z poziomu panelu graficznego na stronie GitHub."
    ],
    "commonMistakes": [
      {
        "mistake": "Brak npx playwright install --with-deps w kroku instalacji na Ubuntu",
        "solution": "Czyste kontenery Linux nie posiadają bibliotek graficznych i dźwiękowych wymaganych przez przeglądarki Chromium/WebKit, dlatego flaga --with-deps jest niezbędna."
      }
    ]
  }
};