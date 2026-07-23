import type { Lesson } from "../../../renderer/types";
import theory14_1 from './lesson-14.1.md?raw';

export const lesson14_1: Lesson = {
  "id": "14.1",
  "moduleId": 14,
  "title": "Podstawy testowania bezpieczeństwa",
  "description": "OWASP Top 10, XSS, CSRF, SQLi, uwierzytelnianie, nagłówki bezpieczeństwa, ciasteczka, CORS i audyt zależności.",
  "order": 1,
  "difficulty": "advanced",
  "tags": [
    "security",
    "accessibility",
    "visual",
    "compliance"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz projektować testy dla obszaru „Podstawy testowania bezpieczeństwa”, łącząc automatyzację z analizą ryzyka, dowodami audytowymi i świadomą interpretacją wyników.",
    "theory": theory14_1,
    "codeExamples": [
      "const response = await request.get('/api/admin/users', {\n  headers: { Authorization: `Bearer ${customerToken}` },\n});\nexpect(response.status()).toBe(403);\n",
      "const response = await request.get('/');\nexpect(response.headers()['content-security-policy']).toBeTruthy();\nexpect(response.headers()['strict-transport-security']).toBeTruthy();\n"
    ],
    "exercises": [
      {
        "id": "ex-14-1-1",
        "title": "Mapa ryzyk",
        "description": "Dla tematu „Podstawy testowania bezpieczeństwa” wypisz ryzyka, dane testowe i oczekiwane dowody."
      },
      {
        "id": "ex-14-1-2",
        "title": "Scenariusz negatywny",
        "description": "Dodaj test odmowy dostępu, braku zgody, błędnego inputu albo naruszenia reguły."
      },
      {
        "id": "ex-14-1-3",
        "title": "Automatyzacja i manual review",
        "description": "Rozdziel, co może sprawdzić automat, a co wymaga oceny człowieka."
      },
      {
        "id": "ex-14-1-4",
        "title": "Artefakty audytu",
        "description": "Wskaż raporty, screenshoty, logi lub trace potrzebne jako dowód testu."
      },
      {
        "id": "ex-14-1-5",
        "title": "CI gate",
        "description": "Zaprojektuj bramkę jakości dla security/accessibility/visual/compliance."
      },
      {
        "id": "ex-14-1-6",
        "title": "Plan naprawy",
        "description": "Opisz, jak sklasyfikujesz i priorytetyzujesz znalezione naruszenie."
      }
    ],
    "quiz": [
      {
        "id": "q14-1-1",
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
        "id": "q14-1-2",
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
        "id": "q14-1-3",
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
        "id": "q14-1-4",
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
        "id": "q14-1-5",
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
        "id": "q14-1-6",
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
        "id": "q14-1-7",
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
        "id": "q14-1-8",
        "question": "Najważniejsza zasada lekcji „Podstawy testowania bezpieczeństwa” to:",
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
      "Zawsze opieraj architekturę testów na zasadach SOLID, unikając przedwczesnej abstrakcji zgodnie z zasadą WET (Write Everything Twice) z podręczników 2026.",
      
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
