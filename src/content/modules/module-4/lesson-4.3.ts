import type { Lesson } from '../../../renderer/types';
import theory4_3 from './lesson-4.3.md?raw';

export const lesson4_3: Lesson = {
  "id": "4.3",
  "moduleId": 4,
  "title": "Shadow DOM",
  "description": "Web Components, open/closed shadow roots, sloty i strategie testowania komponentów ukrytych w Shadow DOM.",
  "order": 3,
  "difficulty": "intermediate",
  "tags": [
    "playwright",
    "advanced-interactions",
    "ui-testing"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz stosować technikę: Shadow DOM, rozumiesz jej ryzyka i umiesz projektować stabilne testy z diagnostyką oraz izolacją stanu.",
    "theory": theory4_3,
    "codeExamples": [
      "await page.getByText('Komponent webowy').click();\nawait expect(page.getByRole('button', { name: 'Zapisz' })).toBeVisible();\n",
      "// Dla closed shadow root testuj publiczny skutek.\nawait page.getByTestId('date-picker').click();\nawait expect(page.getByText('Wybrano datę')).toBeVisible();\n"
    ],
    "exercises": [
      {
        "id": "ex-4-3-1",
        "title": "Scenariusz podstawowy",
        "description": "Napisz test wykorzystujący technikę „Shadow DOM” i sprawdzający widoczny rezultat."
      },
      {
        "id": "ex-4-3-2",
        "title": "Scenariusz negatywny",
        "description": "Dodaj wariant błędu: brak uprawnienia, błąd sieci, zamknięty popup, niedostępny frame albo niepoprawny stan."
      },
      {
        "id": "ex-4-3-3",
        "title": "Diagnostyka",
        "description": "Dodaj test.step, screenshot lub attachment pokazujący stan przed i po interakcji."
      },
      {
        "id": "ex-4-3-4",
        "title": "Izolacja",
        "description": "Wyjaśnij, jak odizolujesz kontekst, mock, storageState albo uprawnienia między testami."
      },
      {
        "id": "ex-4-3-5",
        "title": "Refaktor",
        "description": "Przenieś powtarzalny fragment do helpera, ale zostaw w teście czytelną intencję."
      },
      {
        "id": "ex-4-3-6",
        "title": "Review ryzyka",
        "description": "Wypisz ryzyka tej techniki i wskaż, które powinny być pokryte testem API/integration zamiast E2E."
      }
    ],
    "quiz": [
      {
        "id": "q4-3-1",
        "question": "Co jest najważniejsze przy technice „Shadow DOM”?",
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
        "id": "q4-3-2",
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
        "id": "q4-3-3",
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
        "id": "q4-3-4",
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
        "id": "q4-3-5",
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
        "id": "q4-3-6",
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
        "id": "q4-3-7",
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
        "id": "q4-3-8",
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
