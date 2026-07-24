import type { Lesson } from '../../../renderer/types';
import theory15_4 from './lesson-15.4.md?raw';

export const lesson15_4: Lesson = {
  "id": "15.4",
  "moduleId": 15,
  "title": "Zarządzanie dużym zestawem testów",
  "description": "Dowiedz się, jak zarządzać i utrzymywać suity testowe zawierające ponad 500 testów E2E. Poznaj podział na poziomy (Suite Tiering), śledzenie metryki Flaky Rate oraz zasady kwarantanny testów.",
  "order": 4,
  "difficulty": "advanced",
  "tags": ["suite-tiering", "flaky-rate", "quarantine", "CI-optimization", "best-practices", "scale"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz projektować architekturę testów regresyjnych skali enterprise, kategoryzować testy na Smoke i Regression, wdrażać zasady kwarantanny dla niestabilnych testów oraz optymalizować czas trwania całej suity w CI/CD.",
    "theory": theory15_4,
    "codeExamples": [
      `// Przykład oznaczania testu w kwarantannie (Książka 3 - Uppadhyay)
test('niestabilny test kasy - kwarantanna', async ({ page }) => {
  test.fixme(true, 'BUG-1204: Niestabilne ładowanie bramki Stripe');
  await page.goto('/checkout');
});`
    ],
    "exercises": [
      {
        "id": "ex-15-4-1",
        "title": "Zaprojektowanie polityki kwarantanny",
        "description": "Zaprojektuj i opisz standard operacyjny (SOP) dla Twojego zespołu QA określający: kiedy test trafia do kwarantanny, kto odpowiada za jego naprawę i na jakich zasadach jest przywracany do głównego rurociągu CI/CD."
      }
    ],
    "quiz": [
      {
        "id": "q15-4-1",
        "question": "Jaka jest rekomendowana reakcja na wykrycie niestabilnego testu (Flaky Test) w głównym rurociągu produkcyjnym?",
        "options": [
          "Oznaczenie testu jako fixme (kwarantanna) i przeniesienie go do backlogu naprawczego deweloperów, aby nie blokował rurociągu zdrowych testów",
          "Całkowite usunięcie pliku testu z Git bez zgłoszenia błędu",
          "Pozostawienie testu bez zmian i ignorowanie jego czerwonych wyników w CI",
          "Zwiększenie liczby ponowień (retries) do 10"
        ],
        "correctAnswer": 0,
        "explanation": "Zasada kwarantanny to kluczowy standard inżynieryjny: niestabilny test musi zostać odizolowany (np. oznaczony jako fixme), aby nie paraliżował pracy zespołu, i naprawiony w dedykowanym zadaniu technicznym."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 11: Advanced Test Maintenance and Optimization Strategies."
      }
    ],
    "tipsAndTricks": [
      "Utrzymuj wskaźnik Flaky Rate poniżej 2%. Wyższy wskaźnik oznacza, że zespół przestanie wierzyć wynikom testów, co zrujnuje sens automatyzacji."
    ],
    "commonMistakes": [
      {
        "mistake": "Uruchamianie wszystkich 500+ testów regresyjnych przy każdym pojedynczym komicie (Push) w rurociągu PR",
        "solution": "W PR uruchamiaj wyłącznie szybkie i krytyczne testy dymne (@smoke), a pełną regresję wykonuj raz na dobę (nightly build)."
      }
    ]
  }
};