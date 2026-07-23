import type { Lesson } from '../../../renderer/types';
import theory14_3 from './lesson-14.3.md?raw';

export const lesson14_3: Lesson = {
  "id": "14.3",
  "moduleId": 14,
  "title": "Testy regresji wizualnej",
  "description": "Opanuj weryfikację wizualną w Playwright. Poznaj tworzenie złotych zrzutów (baseline), update wzorców, maskowanie elementów dynamicznych (mask) oraz progi tolerancji pikseli w CI.",
  "order": 3,
  "difficulty": "intermediate",
  "tags": [
    "visual-regression",
    "toHaveScreenshot",
    "masking",
    "thresholds",
    "CI-testing"
  ],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz projektować stabilne testy regresji wizualnej w Playwright, stosować zaawansowane opcje toHaveScreenshot (mask, threshold, maxDiffPixelRatio) i zarządzać plikami wzorców w rurociągach CI.",
    "theory": theory14_3,
    "codeExamples": [
      `// Przykład weryfikacji wizualnej z maskowaniem (Książka 1 - Kelhini)
await expect(page).toHaveScreenshot('dashboard-view.png', {
  mask: [
    page.locator('.current-date'),
    page.locator('.user-avatar-image')
  ]
});`,
      `// Konfiguracja tolerancji na przesunięcia pikseli
await expect(page.locator('.payment-box')).toHaveScreenshot('payment-card.png', {
  threshold: 0.25,
  maxDiffPixelRatio: 0.02 // dozwolone 2% odchylenia pikseli
});`
    ],
    "exercises": [
      {
        "id": "ex-14-3-1",
        "title": "Wdrożenie testu wizualnego z maskowaniem",
        "description": "Napisz test wizualny dla strony koszyka zakupowego, w którym zmaskujesz sumę zamówienia oraz listę polecanych produktów, zapobiegając fałszywym błędom przy zmianach asortymentu."
      },
      {
        "id": "ex-14-3-2",
        "title": "Globalna konfiguracja tolerancji dla CI",
        "description": "Skonfiguruj globalny parametr \`maxDiffPixelRatio\` na poziomie \`0.01\` w pliku \`playwright.config.ts\` w taki sposób, aby aplikował się automatycznie do wszystkich asercji wizualnych."
      }
    ],
    "quiz": [
      {
        "id": "q14-3-1",
        "question": "W jakim celu stosuje się opcję mask (maskowanie) w asercjach toHaveScreenshot()?",
        "options": [
          "Aby zastąpić elementy dynamiczne (np. daty, banery) różowym prostokątem i wykluczyć ich zawartość z porównania wizualnego",
          "Aby automatycznie zakodować dane wrażliwe (hasła) w bazie danych",
          "Aby przyspieszyć wykonywanie zapytań sieciowych API",
          "Nie ma takiej opcji w asercjach wizualnych Playwright"
        ],
        "correctAnswer": 0,
        "explanation": "Opcja mask pozwala przekazać tablicę lokatorów elementów, które zostaną zakryte przed wykonaniem zrzutu, co chroni testy przed fałszywymi czerwonymi alertami z powodu zmieniających się dat, imion itp."
      },
      {
        "id": "q14-3-2",
        "question": "Który parametr odpowiada za dopuszczalny procentowy stosunek odmiennych pikseli na całym zrzucie ekranu?",
        "options": [
          "maxDiffPixelRatio",
          "threshold",
          "maxDiffPixels",
          "pixelToleranceRatio"
        ],
        "correctAnswer": 0,
        "explanation": "maxDiffPixelRatio (przyjmujący wartości od 0 do 1) określa jaki procent pikseli na całym obrazie może się różnić (np. 0.01 to dozwolone 1% różnicy), co jest idealne przy antyaliasingu w CI."
      },
      {
        "id": "q14-3-3",
        "question": "Jak zaktualizować złote wzorce (Golden Snapshots) w Playwright po celowej zmianie wizualnej na aplikacji?",
        "options": [
          "Uruchomić testy z flagą --update-snapshots",
          "Ręcznie skasować pliki graficzne z folderów i uruchomić testy ponownie",
          "Abstrakcja toHaveScreenshot() robi to automatycznie przy każdym teście",
          "Zmienić nazwę zrzutu w teście"
        ],
        "correctAnswer": 0,
        "explanation": "Flaga --update-snapshots nakazuje Playwrightowi nadpisać istniejące wzorce na dysku nowo wykonanymi zrzutami ekranu z działającej wersji aplikacji."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Enterprise-grade design patterns (PageFactory, ApiFactory, BasePage), SOLID & DRY principles, and full stack scaling."
      },
      {
        "title": "Practical Playwright Test (Jean-François Greffier, 2026)",
        "url": "https://doi.org/10.1007/979-8-8688-2160-8",
        "description": "Deep dive into Playwright runner extension, custom expectations, dependent and automatic fixtures, and component testing."
      },
      {
        "title": "Hands-On Automated Testing with Playwright (Faraz K. Kelhini, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Comprehensive guide to browser mechanics, Chrome DevTools Protocol metrics, WCAG accessibility, visual testing, and mobile web."
      },
      {
        "title": "Hands-On Automated Testing with Playwright (Faraz K. Kelhini, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Chapter 10: Setting Up Visual Regression Testing - golden snapshots and masking."
      }
    ],
    "tipsAndTricks": [
      "Zawsze opieraj architekturę testów na zasadach SOLID, unikając przedwczesnej abstrakcji zgodnie z zasadą WET (Write Everything Twice) z podręczników 2026.",
      
      "Zawsze staraj się uruchamiać testy wizualne w kontenerze Docker w rurociągu CI, ponieważ silniki renderowania czcionek na Linuxie i macOS są nieznacznie różne, co powoduje zbędne czerwone testy.",
      "Ustaw maxDiffPixelRatio na poziomie 0.01 - 0.02 dla testów całych stron, aby minimalne różnice w renderowaniu cieni i tekstu nie blokowały Twoich wydań."
    ],
    "commonMistakes": [
      {
        "mistake": "Testowanie wizualne sekcji zawierających animacje CSS lub ruchome wideo bez ich wcześniejszego zatrzymania",
        "solution": "Użyj stylów CSS w teście lub opcji maskowania, aby zakryć poruszające się elementy przed wykonaniem zrzutu."
      },
      {
        "mistake": "Brak precyzyjnego maskowania dat lub stref czasowych na zrzutach",
        "solution": "Przekaż lokalizatory dat do opcji mask w toHaveScreenshot()."
      }
    ]
  }
};
