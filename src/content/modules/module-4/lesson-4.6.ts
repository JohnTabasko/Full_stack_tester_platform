import type { Lesson } from '../../../renderer/types';
import theory4_6 from './lesson-4.6.md?raw';

export const lesson4_6: Lesson = {
  "id": "4.6",
  "moduleId": 4,
  "title": "Geolokalizacja, uprawnienia i emulacja urządzeń",
  "description": "Geolokalizacja, uprawnienia, urządzenia, tryb ciemny, tryb offline, ustawienia regionalne i emulacja warunków środowiskowych.",
  "order": 6,
  "difficulty": "intermediate",
  "tags": [
    "playwright",
    "advanced-interactions",
    "ui-testing"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz stosować technikę: Geolokalizacja, uprawnienia i emulacja urządzeń, rozumiesz jej ryzyka i umiesz projektować stabilne testy z diagnostyką oraz izolacją stanu.",
    "theory": theory4_6,
    "codeExamples": [
      "const context = await browser.newContext({\n  geolocation: { latitude: 52.2297, longitude: 21.0122 },\n  permissions: ['geolocation'],\n  locale: 'pl-PL',\n  timezoneId: 'Europe/Warsaw',\n});\n",
      "await context.setOffline(true);\nawait page.goto('/dashboard');\nawait expect(page.getByText(/brak połączenia/i)).toBeVisible();\n"
    ],
    "exercises": [
      {
        "id": "ex-4-6-1",
        "title": "Scenariusz podstawowy",
        "description": "Napisz test wykorzystujący technikę „Geolokalizacja, uprawnienia i emulacja urządzeń” i sprawdzający widoczny rezultat."
      },
      {
        "id": "ex-4-6-2",
        "title": "Scenariusz negatywny",
        "description": "Dodaj wariant błędu: brak uprawnienia, błąd sieci, zamknięty popup, niedostępny frame albo niepoprawny stan."
      },
      {
        "id": "ex-4-6-3",
        "title": "Diagnostyka",
        "description": "Dodaj test.step, screenshot lub attachment pokazujący stan przed i po interakcji."
      },
      {
        "id": "ex-4-6-4",
        "title": "Izolacja",
        "description": "Wyjaśnij, jak odizolujesz kontekst, mock, storageState albo uprawnienia między testami."
      },
      {
        "id": "ex-4-6-5",
        "title": "Refaktor",
        "description": "Przenieś powtarzalny fragment do helpera, ale zostaw w teście czytelną intencję."
      },
      {
        "id": "ex-4-6-6",
        "title": "Review ryzyka",
        "description": "Wypisz ryzyka tej techniki i wskaż, które powinny być pokryte testem API/integration zamiast E2E."
      }
    ],
    "quiz": [
      {
        "id": "q4-6-1",
        "question": "Co jest najważniejsze przy technice „Geolokalizacja, uprawnienia i emulacja urządzeń”?",
        "options": [
          "Kontrolowanie zdarzenia, stanu i asercji rezultatu",
          "Dodanie stałego sleep",
          "Brak cleanupu",
          "Ignorowanie błędów"
        ],
        "correctAnswer": 0,
        "explanation": "Zaawansowane interakcje wymagają jawnej kontroli warunków i skutków."
      },
      {
        "id": "q4-6-2",
        "question": "Dlaczego zdarzenie trzeba często rejestrować przed akcją?",
        "options": [
          "Bo może zajść szybciej, niż test zacznie na nie czekać",
          "Bo Playwright nie obsługuje zdarzeń",
          "Bo to spowalnia test",
          "Nie ma takiej potrzeby"
        ],
        "correctAnswer": 0,
        "explanation": "To klasyczna ochrona przed race condition."
      },
      {
        "id": "q4-6-3",
        "question": "Co jest właściwą asercją po mocku API?",
        "options": [
          "Widoczna reakcja interfejs użytkownika lub sprawdzony request/response",
          "Sam fakt wywołania route",
          "Brak expect",
          "Dowolny timeout"
        ],
        "correctAnswer": 0,
        "explanation": "Mock ma wspierać scenariusz, ale nadal weryfikujemy zachowanie systemu."
      },
      {
        "id": "q4-6-4",
        "question": "Po co izolować stan w zaawansowanych interakcjach?",
        "options": [
          "Aby testy równoległe nie wpływały na siebie",
          "Aby ukryć defekty",
          "Aby pominąć asercje",
          "Aby skrócić nazwy"
        ],
        "correctAnswer": 0,
        "explanation": "Izolacja chroni przed zależnością od kolejności i poprzednich testów."
      },
      {
        "id": "q4-6-5",
        "question": "Co jest antywzorcem w auth testach?",
        "options": [
          "Logowanie przez interfejs użytkownika w każdym scenariuszu niebędącym testem logowania",
          "storageState w setupie",
          "osobny test logowania",
          "izolowane konta"
        ],
        "correctAnswer": 0,
        "explanation": "Powtarzane logowanie spowalnia suite i zwiększa flaky rate."
      },
      {
        "id": "q4-6-6",
        "question": "Kiedy mock sieciowy jest ryzykowny?",
        "options": [
          "Gdy zastępuje jedyny test prawdziwego kontraktu",
          "Gdy jest lokalny i jawny",
          "Gdy ma asercje",
          "Gdy testuje błąd 500"
        ],
        "correctAnswer": 0,
        "explanation": "Mock nie dowodzi, że realne API nadal spełnia kontrakt."
      },
      {
        "id": "q4-6-7",
        "question": "Co powinno znaleźć się w raporcie awarii takiego testu?",
        "options": [
          "URL, screenshot/trace, stan kontekstu i kluczowe dane",
          "Tylko nazwa testu",
          "Brak logów",
          "Losowy komentarz"
        ],
        "correctAnswer": 0,
        "explanation": "Zaawansowane interakcje bywają trudne w diagnozie bez kontekstu."
      },
      {
        "id": "q4-6-8",
        "question": "Jak wybrać, czy testować technikę przez interfejs użytkownika czy niżej?",
        "options": [
          "Na podstawie ryzyka i kosztu utrzymania",
          "Zawsze przez interfejs użytkownika",
          "Zawsze przez mock",
          "Losowo"
        ],
        "correctAnswer": 0,
        "explanation": "Poziom testu powinien wynikać z wartości informacji i kosztu."
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
        "title": "Playwright Pages",
        "url": "https://playwright.dev/docs/pages",
        "description": "Obsługa wielu stron, wyskakujących okien i kontekstów."
      },
      {
        "title": "Playwright Frames",
        "url": "https://playwright.dev/docs/frames",
        "description": "Praca z iframe i frame locatorami."
      },
      {
        "title": "Playwright Network",
        "url": "https://playwright.dev/docs/network",
        "description": "Intercepting, mocking i obserwacja ruchu sieciowego."
      },
      {
        "title": "Playwright Authentication",
        "url": "https://playwright.dev/docs/auth",
        "description": "Rekomendowane strategie logowania i storageState."
      }
    ],
    "tipsAndTricks": [
      "Zawsze opieraj architekturę testów na zasadach SOLID, unikając przedwczesnej abstrakcji zgodnie z zasadą WET (Write Everything Twice) z podręczników 2026.",
      
      "Zaawansowane interakcje testuj przez rezultat biznesowy, nie samo użycie API Playwright.",
      "Zdarzenia takie jak popup, download czy response rejestruj przed akcją, która je wywołuje.",
      "Mock sieciowy powinien być jawny i lokalny dla testu; globalne mocki łatwo ukrywają prawdziwe regresje.",
      "Stan uwierzytelnienia, uprawnienia i emulację urządzenia traktuj jak dane testowe: ustawiaj jawnie i izoluj."
    ],
    "commonMistakes": [
      {
        "mistake": "Czekanie na popup po kliknięciu",
        "solution": "Użyj Promise.all lub page.waitForEvent przed akcją wyzwalającą popup."
      },
      {
        "mistake": "Testowanie iframe zwykłym page.locator",
        "solution": "Używaj frameLocator i traktuj ramkę jako osobny kontekst DOM."
      },
      {
        "mistake": "Nadmierne mockowanie API",
        "solution": "Mockuj tylko zależność istotną dla scenariusza i zostaw osobne testy integracyjne kontraktu."
      },
      {
        "mistake": "Logowanie przez interfejs użytkownika w każdym teście",
        "solution": "Użyj storageState przygotowanego w setupie i testuj samo logowanie osobno."
      }
    ]
  }
};
