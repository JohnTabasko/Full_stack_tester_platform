import type { Lesson } from '../../../renderer/types';
import theory14_2 from './lesson-14.2.md?raw';

export const lesson14_2: Lesson = {
  "id": "14.2",
  "moduleId": 14,
  "title": "Testowanie dostępności (WCAG & Axe)",
  "description": "Zrozum standardy WCAG 2.1/2.2. Opanuj integrację @axe-core/playwright, precyzyjne ograniczanie zakresu skanowania (include/exclude), konfigurację reguł oraz dołączanie raportów violations do raportu HTML.",
  "order": 2,
  "difficulty": "intermediate",
  "tags": [
    "accessibility",
    "A11y",
    "WCAG",
    "AxeBuilder",
    "diagnostics"
  ],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz zaprojektować i zaimplementować automatyczny audyt dostępności (A11y) w Playwright z użyciem AxeBuilder, zarządzać regułami, ograniczać zakres skanowania i dołączać raporty o błędach do raportu HTML.",
    "theory": theory14_2,
    "codeExamples": [
      `// Ograniczanie zakresu skanowania Axe (Książka 1 - Kelhini)
const results = await new AxeBuilder({ page })
  .include('.main-content')
  .exclude('.social-share-widget')
  .analyze();
expect(results.violations).toEqual([]);`,
      `// Wybór zestawu reguł WCAG 2.1 AA
const results = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
  .analyze();`
    ],
    "exercises": [
      {
        "id": "ex-14-2-1",
        "title": "Wdrożenie zlokalizowanego skanowania komponentu",
        "description": "Napisz test dla formularza kontaktowego, w którym ograniczysz skanowanie Axe wyłącznie do kontenera formularza (używając selektora \`.contact-form-wrapper\`), wykluczając przycisk zgody RODO, który jest dostarczany przez zewnętrzną domenę."
      },
      {
        "id": "ex-14-2-2",
        "title": "Customowy Helper do raportowania błędów Axe",
        "description": "Napisz helper, który po uruchomieniu Axe analizuje tablicę \`violations\` i jeśli zawiera ona błędy o wpływie 'critical' lub 'serious', formatuje je w czytelny tekst i załącza do raportu za pomocą \`testInfo.attach()\`."
      }
    ],
    "quiz": [
      {
        "id": "q14-2-1",
        "question": "W jaki sposób możemy wykluczyć kłopotliwe elementy zewnętrzne (np. chatboty) ze skanowania Axe w Playwright?",
        "options": [
          "Używając metody `.exclude()` klasy AxeBuilder z odpowiednim selektorem CSS",
          "Nie da się wykluczyć elementów ze skanowania całej strony",
          "Należy przed skanowaniem usunąć te elementy z DOM przy użyciu CSS display:none",
          "Wyłączając przeglądarce obsługę skryptów JavaScript"
        ],
        "correctAnswer": 0,
        "explanation": "Metoda .exclude() pozwala wykluczyć konkretne regiony, komponenty lub selektory, co zapobiega fałszywym alertom (false positives) generowanym przez komponenty zewnętrzne, których nie możemy edytować."
      },
      {
        "id": "q14-2-2",
        "question": "Ile procent rzeczywistych błędów dostępności (A11y) są w stanie wykryć narzędzia automatyczne, takie jak Axe?",
        "options": [
          "Około 30-40% - automatyka wykrywa błędy techniczne (kontrast, alt), lecz nie zastąpi ręcznego testu klawiaturą i czytnikiem",
          "Dokładnie 100% - automatyczne testy całkowicie zastępują człowieka",
          "Poniżej 5%",
          "Axe nie służy do automatycznego wykrywania błędów"
        ],
        "correctAnswer": 0,
        "explanation": "Testy automatyczne pokrywają jedynie część kryteriów WCAG (np. brak atrybutów alt, nieodpowiedni kontrast, brak etykiet formularzy). Pozostałe błędy (np. logika odczytu przez czytnik, pułapki klawiaturowe) must be checked manually."
      }
    ],
    "references": [
      {
        "title": "Hands-On Automated Testing with Playwright (Faraz K. Kelhini, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Chapter 9: Accessibility Testing with Playwright and axe-core."
      }
    ],
    "tipsAndTricks": [
      "Zawsze staraj się dołączać raporty violations do HTML raportu przy użyciu testInfo.attach(), dzięki czemu programiści od razu widzą, który element HTML (node) i jaka reguła zostały naruszone.",
      "Skonfiguruj baseline dostępności w swoim projekcie, aby nowo dodawane testy nie zawodziły z powodu starych, znanych błędów, które zespół planuje naprawić w późniejszym terminie."
    ],
    "commonMistakes": [
      {
        "mistake": "Skanowanie całej strony łącznie z zewnętrznymi reklamami i iframe-ami",
        "solution": "Używaj precyzyjnych filtrów .include() oraz .exclude(), aby skupić się tylko na kodzie dostarczanym przez Twój zespół."
      },
      {
        "mistake": "Brak asercji na poziomy zgodności (wcag2a/wcag2aa)",
        "solution": "Wykorzystaj .withTags(), aby upewnić się, że weryfikujesz aplikację pod kątem właściwego poziomu zgodności WCAG wymaganej przez prawo."
      }
    ]
  }
};
