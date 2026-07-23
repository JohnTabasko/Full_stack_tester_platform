import type { Lesson } from "../../../renderer/types";
import theory9_2 from './lesson-9.2.md?raw';

export const lesson9_2: Lesson = {
  "id": "9.2",
  "moduleId": 9,
  "title": "Typowe problemy i rozwiązania",
  "description": "Triage typowych awarii: timeouty, element not found, strict mode, CI vs local, auth, network, Inspector, UI Mode i trace.",
  "order": 2,
  "difficulty": "intermediate",
  "tags": [
    "debugging",
    "troubleshooting",
    "stability",
    "observability"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz diagnozować problemy z obszaru „Typowe problemy i rozwiązania”, zbierać właściwe artefakty i projektować testy bardziej odporne na niestabilność.",
    "theory": theory9_2,
    "codeExamples": [
      "// Doprecyzowanie strict mode przez kontekst wiersza.\nconst row = page.getByRole('row').filter({ hasText: 'Zamówienie #123' });\nawait row.getByRole('button', { name: 'Szczegóły' }).click();\n",
      "# Minimalna procedura CI kontra lokalnie\n1. Porównaj BASE_URL i env.\n2. Sprawdź storageState/auth.\n3. Otwórz trace z CI.\n4. Sprawdź console/pageerror/requestfailed.\n5. Porównaj viewport/timezone/locale.\n"
    ],
    "exercises": [
      {
        "id": "ex-9-2-1",
        "title": "Hipotezy diagnostyczne",
        "description": "Dla awarii z obszaru „Typowe problemy i rozwiązania” wypisz trzy hipotezy i artefakt, który je potwierdzi lub obali."
      },
      {
        "id": "ex-9-2-2",
        "title": "Trace analysis",
        "description": "Przeanalizuj trace nieudanego testu i opisz ostatni poprawny stan, akcję wywołującą błąd i brakującą asercję."
      },
      {
        "id": "ex-9-2-3",
        "title": "Console i network logs",
        "description": "Dodaj zbieranie console, pageerror i requestfailed do testu diagnostycznego."
      },
      {
        "id": "ex-9-2-4",
        "title": "Flaky classification",
        "description": "Sklasyfikuj flaky test jako problem danych, selektora, synchronizacji, środowiska albo zależności."
      },
      {
        "id": "ex-9-2-5",
        "title": "Cleanup i recovery",
        "description": "Dodaj finally lub fixture cleanup gwarantujące usunięcie danych nawet przy awarii."
      },
      {
        "id": "ex-9-2-6",
        "title": "Alert użyteczny",
        "description": "Zaprojektuj alert dla regresji testów, który zawiera właściciela, link do raportu i zakres wpływu."
      }
    ],
    "quiz": [
      {
        "id": "q9-2-1",
        "question": "Co jest pierwszym krokiem dobrej diagnozy?",
        "options": [
          "Postawienie hipotezy i zebranie artefaktów",
          "Zwiększenie timeoutu",
          "Usunięcie testu",
          "Ignorowanie CI"
        ],
        "correctAnswer": 0,
        "explanation": "Diagnoza powinna być kierowana pytaniem i dowodem."
      },
      {
        "id": "q9-2-2",
        "question": "Co najlepiej pokazuje Trace Viewer?",
        "options": [
          "Kolejność akcji, snapshoty DOM, network i moment awarii",
          "Tylko coverage",
          "Sekrety użytkownika",
          "Historię Git"
        ],
        "correctAnswer": 0,
        "explanation": "Trace pozwala odtworzyć przebieg testu bez lokalnej reprodukcji."
      },
      {
        "id": "q9-2-3",
        "question": "Dlaczego retry nie jest naprawą flaky testu?",
        "options": [
          "Bo maskuje objaw, jeśli nie analizujemy przyczyny",
          "Bo zawsze jest zakazany",
          "Bo działa tylko lokalnie",
          "Bo usuwa trace"
        ],
        "correctAnswer": 0,
        "explanation": "Retry może dać czasową odporność, ale źródło niestabilności nadal istnieje."
      },
      {
        "id": "q9-2-4",
        "question": "Co powinien zrobić catch w teście?",
        "options": [
          "Dodać kontekst i ponownie rzucić błąd",
          "Połknąć wyjątek",
          "Zawsze oznaczyć test jako passed",
          "Usunąć screenshot"
        ],
        "correctAnswer": 0,
        "explanation": "Błędu nie wolno ukrywać; diagnostyka ma go wzbogacić."
      },
      {
        "id": "q9-2-5",
        "question": "Co jest typową przyczyną strict mode violation?",
        "options": [
          "Lokator znajduje więcej niż jeden element",
          "Brak internetu",
          "Błąd TypeScriptu",
          "Niepoprawny commit"
        ],
        "correctAnswer": 0,
        "explanation": "Playwright wymaga jednoznacznego lokatora dla wielu akcji."
      },
      {
        "id": "q9-2-6",
        "question": "Jaki alert jest użyteczny?",
        "options": [
          "Taki, który wskazuje wpływ, właściciela i link do diagnostyki",
          "Każdy pojedynczy log",
          "Alert bez kontekstu",
          "Tylko wiadomość 'failed'"
        ],
        "correctAnswer": 0,
        "explanation": "Alert musi prowadzić do działania i skracać triage."
      },
      {
        "id": "q9-2-7",
        "question": "Co oznacza test independence?",
        "options": [
          "Test nie zależy od kolejności ani danych zostawionych przez inne testy",
          "Test działa tylko po innym teście",
          "Test nie ma asercji",
          "Test używa jednego konta globalnego"
        ],
        "correctAnswer": 0,
        "explanation": "Niezależność jest warunkiem równoległości i wiarygodności."
      },
      {
        "id": "q9-2-8",
        "question": "Najważniejsza zasada lekcji „Typowe problemy i rozwiązania” to:",
        "options": [
          "Awaria testu ma prowadzić do przyczyny, nie tylko do czerwonego statusu",
          "Najważniejszy jest długi timeout",
          "Brak artefaktów jest zaletą",
          "Flaky testy są normalne i nie wymagają reakcji"
        ],
        "correctAnswer": 0,
        "explanation": "Debugging i troubleshooting mają skracać czas od objawu do decyzji."
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
        "title": "Debugging tests",
        "url": "https://playwright.dev/docs/debug",
        "description": "Inspector, debug mode i page.pause."
      },
      {
        "title": "Trace Viewer",
        "url": "https://playwright.dev/docs/trace-viewer",
        "description": "Analiza DOM, network, console i kroków testu."
      },
      {
        "title": "Locators",
        "url": "https://playwright.dev/docs/locators",
        "description": "Diagnoza i poprawa locatorów."
      }
    ],
    "tipsAndTricks": [
      "Zawsze opieraj architekturę testów na zasadach SOLID, unikając przedwczesnej abstrakcji zgodnie z zasadą WET (Write Everything Twice) z podręczników 2026.",
      
      "Diagnozę zaczynaj od hipotezy: co dokładnie mogło zawieść i jaki artefakt to potwierdzi?",
      "Trace jest najcenniejszy wtedy, gdy jest dostępny z nieudanego przebiegu CI, nie tylko lokalnie.",
      "Flaky test traktuj jak błąd produktu testowego, nie jak irytujący przypadek losowy.",
      "Alerty testowe powinny prowadzić do działania; zbyt głośne alerty szybko przestają być czytane."
    ],
    "commonMistakes": [
      {
        "mistake": "Naprawianie timeoutu przez zwiększanie timeoutu",
        "solution": "Najpierw ustal, jaki stan nie pojawił się w czasie i dlaczego."
      },
      {
        "mistake": "Brak artefaktów z CI",
        "solution": "Zbieraj trace, screenshot, video, console logs i network logs co najmniej dla porażek."
      },
      {
        "mistake": "Retry bez analizy flaky rate",
        "solution": "Mierz ponowienia, klasyfikuj przyczyny i usuwaj źródła niestabilności."
      },
      {
        "mistake": "Try/catch ukrywający błąd",
        "solution": "Dodaj kontekst diagnostyczny i ponownie rzuć wyjątek."
      }
    ]
  }
};
