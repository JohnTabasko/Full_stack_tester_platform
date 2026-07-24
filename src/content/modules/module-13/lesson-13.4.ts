import type { Lesson } from '../../../renderer/types';
import theory13_4 from './lesson-13.4.md?raw';

export const lesson13_4: Lesson = {
  "id": "13.4",
  "moduleId": 13,
  "title": "Testy na rzeczywistych urządzeniach i testy mobilne",
  "description": "Opanuj testowanie responsywności (RWD) i emulację urządzeń mobilnych. Dowiedz się, jak konfigurować deskryptory urządzeń, emulować geolokalizację, strefy czasowe, język oraz symulować gesty dotykowe tap.",
  "order": 4,
  "difficulty": "advanced",
  "tags": ["mobile-testing", "emulation", "geolocation", "tap", "responsive"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz projektować testy dla platform mobilnych, emulować parametry urządzeń (iPhone/Android), kontrolować geolokalizację i uprawnienia przeglądarki oraz symulować fizyczne gesty dotykowe na ekranach dotykowych.",
    "theory": theory13_4,
    "codeExamples": [
      `// Przykład symulacji geolokalizacji i tapnięcia (Książka 1 - Kelhini)
test.use({ ...devices['iPhone 14'], permissions: ['geolocation'] });
test('mobilny test', async ({ page }) => {
  await page.getByRole('button').tap(); // Tapnięcie na ekranie dotykowym
});`
    ],
    "exercises": [
      {
        "id": "ex-13-4-1",
        "title": "Konfiguracja testu mobilnego z geolokalizacją",
        "description": "Zaimplementuj test dla wyszukiwarki sklepów stacjonarnych. Emuluj urządzenie mobilne oraz współrzędne geograficzne Nowego Jorku i upewnij się, że strona automatycznie podpowiada najbliższy sklep w Nowym Jorku."
      }
    ],
    "quiz": [
      {
        "id": "q13-4-1",
        "question": "Która metoda w Playwright jest zalecana do symulowania interakcji dotykowej (dotknięcia ekranu) na urządzeniach mobilnych?",
        "options": [
          "locator.tap()",
          "locator.click()",
          "locator.swipe()",
          "locator.touch()"
        ],
        "correctAnswer": 0,
        "explanation": "Metoda .tap() emuluje rzeczywisty gest dotknięcia ekranu palcem (Touch Tap), co jest zgodne ze standardami interakcji na smartfonach i tabletach."
      }
    ],
    "references": [
      {
        "title": "Hands-On Automated Testing with Playwright (Faraz K. Kelhini, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Chapter 11: Testing Mobile Web Experiences (Device descriptors, orientation, network speed emulation)."
      }
    ],
    "tipsAndTricks": [
      "Stosuj automatyczne nadawanie uprawnień (permissions: ['geolocation']), aby przeglądarka nie blokowała testu systemowym pop-upem pytającym o zgodę na lokalizację."
    ],
    "commonMistakes": [
      {
        "mistake": "Ręczne ustawianie szerokości i wysokości ekranu zamiast używania gotowych, zunifikowanych deskryptorów urządzeń",
        "solution": "Zawsze importuj i rozwijaj gotowe konfiguracje (np. devices['iPhone 14']), które posiadają prawidłowe parametry gęstości pikseli i nagłówki userAgent."
      }
    ]
  }
};