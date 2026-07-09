import type { Lesson } from "../../../renderer/types";
import theory14_3 from './lesson-14.3.md?raw';

export const lesson14_3: Lesson = {
  "id": "14.3",
  "moduleId": 14,
  "title": "Testy regresji wizualnej",
  "description": "toHaveScreenshot, baseline, maskowanie, testy wieloprzeglądarkowe, Percy, Storybook i responsywny przegląd wizualny.",
  "order": 3,
  "difficulty": "advanced",
  "tags": [
    "security",
    "accessibility",
    "visual",
    "compliance"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz projektować testy dla obszaru „Testy regresji wizualnej”, łącząc automatyzację z analizą ryzyka, dowodami audytowymi i świadomą interpretacją wyników.",
    "theory": theory14_3,
    "codeExamples": [
      "await expect(page).toHaveScreenshot('dashboard.png', {\n  mask: [page.getByTestId('current-time'), page.getByTestId('user-avatar')],\n});\n",
      "const card = page.getByTestId('pricing-card').filter({ hasText: 'Pro' });\nawait expect(card).toHaveScreenshot('pricing-card-pro.png');\n"
    ],
    "exercises": [
      {
        "id": "ex-14-3-1",
        "title": "Mapa ryzyk",
        "description": "Dla tematu „Testy regresji wizualnej” wypisz ryzyka, dane testowe i oczekiwane dowody."
      },
      {
        "id": "ex-14-3-2",
        "title": "Scenariusz negatywny",
        "description": "Dodaj test odmowy dostępu, braku zgody, błędnego inputu albo naruszenia reguły."
      },
      {
        "id": "ex-14-3-3",
        "title": "Automatyzacja i manual review",
        "description": "Rozdziel, co może sprawdzić automat, a co wymaga oceny człowieka."
      },
      {
        "id": "ex-14-3-4",
        "title": "Artefakty audytu",
        "description": "Wskaż raporty, screenshoty, logi lub trace potrzebne jako dowód testu."
      },
      {
        "id": "ex-14-3-5",
        "title": "CI gate",
        "description": "Zaprojektuj bramkę jakości dla security/accessibility/visual/compliance."
      },
      {
        "id": "ex-14-3-6",
        "title": "Plan naprawy",
        "description": "Opisz, jak sklasyfikujesz i priorytetyzujesz znalezione naruszenie."
      }
    ],
    "quiz": [
      {
        "id": "q14-3-1",
        "question": "Dlaczego testy security/accessibility powinny być częścią CI?",
        "options": [
          "Wcześnie wykrywają regresje jakości i ryzyka użytkownika",
          "Bo zastępują wszystkie testy",
          "Bo są tylko formalnością",
          "Nie powinny być w CI"
        ],
        "correctAnswer": 0,
        "explanation": "Wczesna informacja zwrotna ogranicza koszt naprawy i ryzyko release."
      },
      {
        "id": "q14-3-2",
        "question": "Co jest ograniczeniem automatycznego skanera?",
        "options": [
          "Nie rozumie w pełni kontekstu biznesowego i intencji użytkownika",
          "Zawsze znajduje wszystkie błędy",
          "Nie wymaga interpretacji",
          "Zastępuje review"
        ],
        "correctAnswer": 0,
        "explanation": "Skaner pomaga, ale nie zastępuje analizy ryzyka i testów scenariuszowych."
      },
      {
        "id": "q14-3-3",
        "question": "Co jest ważne w testach autoryzacji?",
        "options": [
          "Sprawdzenie dostępu użytkownika do cudzych lub zabronionych zasobów",
          "Tylko status 200",
          "Kolor przycisku",
          "Brak tokena w logach"
        ],
        "correctAnswer": 0,
        "explanation": "Authorization bugs, np. IDOR, są jednymi z najpoważniejszych ryzyk API."
      },
      {
        "id": "q14-3-4",
        "question": "Co powinien obejmować test dostępności modala?",
        "options": [
          "Focus trap, role, nazwę dostępną i obsługę klawiatury",
          "Tylko screenshot",
          "Wyłącznie kolor tła",
          "Brak asercji"
        ],
        "correctAnswer": 0,
        "explanation": "Modal musi być używalny klawiaturą i czytelny dla technologii wspomagających."
      },
      {
        "id": "q14-3-5",
        "question": "Kiedy test wizualny daje fałszywe alarmy?",
        "options": [
          "Gdy porównuje dynamiczne elementy bez maskowania",
          "Gdy ma baseline review",
          "Gdy viewport jest stały",
          "Gdy dane są deterministyczne"
        ],
        "correctAnswer": 0,
        "explanation": "Dane losowe, daty i animacje powodują niestabilne diffy."
      },
      {
        "id": "q14-3-6",
        "question": "Co jest istotne w GDPR/RODO testing?",
        "options": [
          "Zgody, prawo do usunięcia, minimalizacja danych, audyt i retencja",
          "Tylko interfejs użytkownika banneru",
          "Wyłącznie kolor cookies",
          "Brak logów"
        ],
        "correctAnswer": 0,
        "explanation": "Zgodność obejmuje procesy, dane i dowody, nie tylko ekran zgody."
      },
      {
        "id": "q14-3-7",
        "question": "Co oznacza HttpOnly cookie?",
        "options": [
          "Cookie niedostępne z poziomu JavaScriptu w przeglądarce",
          "Cookie bez TLS",
          "Cookie publiczne",
          "Cookie tylko do CSS"
        ],
        "correctAnswer": 0,
        "explanation": "HttpOnly ogranicza ryzyko kradzieży cookie przez XSS."
      },
      {
        "id": "q14-3-8",
        "question": "Najważniejsza zasada lekcji „Testy regresji wizualnej” to:",
        "options": [
          "Testuj ryzyko i dowody, nie tylko narzędzie",
          "Zaufaj jednemu skanerowi",
          "Pomiń scenariusze negatywne",
          "Nie dokumentuj wyników"
        ],
        "correctAnswer": 0,
        "explanation": "Profesjonalne testowanie tych obszarów wymaga kontekstu i interpretacji."
      }
    ],
    "references": [
      {
        "title": "OWASP Web Bezpieczeństwo Testing Guide",
        "url": "https://owasp.org/www-project-web-security-testing-guide/",
        "description": "Przewodnik po testowaniu bezpieczeństwa aplikacji webowych."
      },
      {
        "title": "OWASP Top 10",
        "url": "https://owasp.org/www-project-top-ten/",
        "description": "Najważniejsze klasy ryzyk bezpieczeństwa aplikacji webowych."
      },
      {
        "title": "WCAG 2.2",
        "url": "https://www.w3.org/TR/WCAG22/",
        "description": "Standard dostępności treści internetowych."
      },
      {
        "title": "Playwright Visual Comparisons",
        "url": "https://playwright.dev/docs/test-snapshots",
        "description": "Dokumentacja porównań wizualnych i screenshotów w Playwright."
      }
    ],
    "tipsAndTricks": [
      "Testy bezpieczeństwa i dostępności są częścią jakości, nie dodatkiem wykonywanym po zakończeniu funkcji.",
      "Automatyczne skanery znajdują część problemów; najważniejsze scenariusze wymagają świadomego modelowania ryzyka.",
      "Dostępność najlepiej testować od początku przez semantyczny HTML i obsługę klawiatury.",
      "Compliance wymaga dowodów: logów audytu, zgód, ścieżek usunięcia danych i raportów z testów."
    ],
    "commonMistakes": [
      {
        "mistake": "Bezpieczeństwo testing ograniczony do npm audit",
        "solution": "Łącz dependency audit z testami auth, authorization, headers, cookies, CORS, XSS i rate limiting."
      },
      {
        "mistake": "Dostępność testowana wyłącznie axe-core",
        "solution": "Dodaj testy klawiatury, focus management, semantyki i screen-reader friendly labels."
      },
      {
        "mistake": "Visual testing bez stabilizacji danych",
        "solution": "Maskuj dynamiczne treści i utrzymuj baseline przez review."
      },
      {
        "mistake": "Compliance bez ścieżki dowodowej",
        "solution": "Dokumentuj testy zgód, retencji, audytu i prawa do usunięcia danych."
      }
    ]
  }
};
