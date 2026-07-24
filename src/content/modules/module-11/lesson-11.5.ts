import type { Lesson } from '../../../renderer/types';
import theory11_5 from './lesson-11.5.md?raw';

export const lesson11_5: Lesson = {
  "id": "11.5",
  "moduleId": 11,
  "title": "Dobre praktyki i optymalizacja CI/CD",
  "description": "Zoptymalizuj czas wykonania rurociągów. Poznaj techniki cache'owania node_modules i przeglądarek, kompilacje matrycowe (Matrix), współbieżność poziomów rurociągów oraz hosting raportów na GitHub Pages.",
  "order": 5,
  "difficulty": "advanced",
  "tags": ["performance", "caching", "Matrix", "GitHub-Pages", "optimization", "CI-CD"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz radykalnie (nawet o 80%) skrócić czas trwania rurociągów CI/CD, skonfigurować zaawansowane cache'owanie binariów przeglądarek i pakietów npm, projektować równoległe zadania matrycowe oraz zautomatyzować publikację raportów na GitHub Pages.",
    "theory": theory11_5,
    "codeExamples": [
      `// Przykład konfiguracji cache w YAML (Książka 2 - Greffier)
- name: Cache Playwright
  uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: playwright-\${{ hashFiles('**/package-lock.json') }}`
    ],
    "exercises": [
      {
        "id": "ex-11-5-1",
        "title": "Wdrożenie cache'owania przeglądarek",
        "description": "Zaktualizuj zaimplementowany wcześniej rurociąg `playwright.yml` o dwa niezależne kroki cache'owania: dla zależności npm oraz dla binariów przeglądarek Playwright, upewniając się, że kroki instalacji są wywoływane warunkowo."
      }
    ],
    "quiz": [
      {
        "id": "q11-5-1",
        "question": "W jaki sposób cache'owanie binariów przeglądarek wpływa na rurociągi CI/CD w Playwright?",
        "options": [
          "Skraca czas przygotowania środowiska o kilka minut, omijając pobieranie kilkuset megabajtów danych przy każdym uruchomieniu rurociągu",
          "Automatycznie usuwa niestabilne testy",
          "Wymaga płatnej subskrypcji w usłudze GitHub Enterprise",
          "Nie ma wpływu na czas wykonania"
        ],
        "correctAnswer": 0,
        "explanation": "Wgrywanie i przywracanie binariów przeglądarek z pamięci podręcznej (cache) chmury trwa zaledwie kilka sekund, podczas gdy ich pobieranie z serwerów Playwright i instalacja to główny narzut czasowy przygotowania środowiska."
      }
    ],
    "references": [
      {
        "title": "Practical Playwright Test (Jean-François Greffier, 2026)",
        "url": "https://doi.org/10.1007/979-8-8688-2160-8",
        "description": "Chapter 4: Continuous Integration (Caching and Pipeline optimizations)."
      }
    ],
    "tipsAndTricks": [
      "Stosuj opcję fail-fast: false w Matrix Builds, aby błąd w jednym systemie (np. Windows) nie przerywał wykonywania testów na pozostałych maszynach (np. Linux, macOS)."
    ],
    "commonMistakes": [
      {
        "mistake": "Pobieranie i instalowanie przeglądarek od nowa przy każdym uruchomieniu rurociągu CI/CD",
        "solution": "Skonfiguruj rzetelny krok cache'owania oparty o hash pliku package-lock.json i wywołuj instalację tylko przy braku trafienia w cache."
      }
    ]
  }
};