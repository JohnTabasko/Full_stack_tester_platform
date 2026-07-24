import type { Lesson } from '../../../renderer/types';
import theory28_2 from './lesson-28.2.md?raw';

export const lesson28_2: Lesson = {
  "id": "28.2",
  "moduleId": 28,
  "title": "Projekt końcowy: interfejs użytkownika, API, baza danych i CI",
  "description": "Zaprojektuj i wdroż swój flagowy projekt portfolio SDET. Połącz automatyzację UI (Playwright POM), API (AOM/AJV), bazy danych (SQL/Teardown) oraz orkiestrację DevOps (Docker, GitHub Actions).",
  "order": 2,
  "difficulty": "advanced",
  "tags": ["portfolio", "project", "UI", "API", "database", "CI-CD", "Docker", "scale"],
  "content": {
    "objective": "Po ukończeniu tego projektu końcowego posiadasz gotowe, kompletne portfolio inżynierskie (SDET) klasy enterprise, demonstrujące pełną integrację testów UI, API, bazy danych oraz automatycznych rurociągów CI/CD.",
    "theory": theory28_2,
    "codeExamples": [
      `// Przykład pełnej orkiestracji w README.md (Książka 3 - Uppadhyay)
# Jak uruchomić testy lokalnie:
1. docker-compose up -d --build
2. npm ci
3. npx playwright test`
    ],
    "exercises": [
      {
        "id": "ex-28-2-1",
        "title": "Wdrożenie projektu końcowego",
        "description": "Zaprojektuj i zaimplementuj od zera swój flagowy projekt portfolio. Stwórz czystą strukturę katalogów, wdroż wzorce POM, AOM i fabryk, skonfiguruj bazę danych z teardownem oraz zautomatyzuj rurociąg w GitHub Actions."
      }
    ],
    "quiz": [
      {
        "id": "q28-2-1",
        "question": "Która cecha jest najważniejsza dla profesjonalnego repozytorium portfolio inżyniera SDET?",
        "options": [
          "Przejrzysta architektura kodu oparta o zasady SOLID, wzorce projektowe (POM, AOM, Fabryki), stabilność w rurociągu CI/CD oraz rzetelne README.md z instrukcją uruchomienia",
          "Maksymalna liczba linii kodu w jednym pliku",
          "Uruchamianie testów wyłącznie na systemach Windows ręcznie",
          "Ukrywanie kodu źródłowego przed rekruterami"
        ],
        "correctAnswer": 0,
        "explanation": "Dla liderów technicznych i rekruterów liczy się jakość inżynieryjna: czysty kod, separacja warstw, brak niestabilności (flakiness), oraz czytelna dokumentacja pozwalająca uruchomić testy jedną komendą."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 12: Reflections on Test Automation (Enterprise portfolio guidelines)."
      }
    ],
    "tipsAndTricks": [
      "Napisz profesjonalny plik README.md. To wizytówka Twojego projektu. Powinien zawierać schemat architektury, opis użytych wzorców oraz przejrzystą instrukcję uruchomienia całego środowiska w kontenerach Docker za pomocą jednej komendy."
    ],
    "commonMistakes": [
      {
        "mistake": "Wysyłanie do portfolio projektu, który nie posiada konfiguracji CI/CD i wymaga skomplikowanego, manualnego konfigurowania bazy danych przed uruchomieniem",
        "solution": "Zautomatyzuj wszystko. Użyj Docker Compose do podniesienia bazy i serwera jednym kliknięciem, a testy zintegruj z darmowymi maszynami GitHub Actions."
      }
    ]
  }
};