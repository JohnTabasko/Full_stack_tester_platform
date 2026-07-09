import type { Lesson } from "../../../renderer/types";
import theory9_3 from './lesson-9.3.md?raw';

export const lesson9_3: Lesson = {
  "id": "9.3",
  "moduleId": 9,
  "title": "Obsługa błędów i odzyskiwanie",
  "description": "Try-catch z kontekstem, ponowienia z narastającym opóźnieniem, miękkie asercje, gwarancja sprzątania i circuit breaker.",
  "order": 3,
  "difficulty": "intermediate",
  "tags": [
    "debugging",
    "troubleshooting",
    "stability",
    "observability"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz diagnozować problemy z obszaru „Obsługa błędów i odzyskiwanie”, zbierać właściwe artefakty i projektować testy bardziej odporne na niestabilność.",
    "theory": theory9_3,
    "codeExamples": [
      "try {\n  await checkoutPage.pay();\n} catch (error) {\n  await testInfo.attach('checkout-url', { body: page.url(), contentType: 'text/plain' });\n  await testInfo.attach('screenshot', { body: await page.screenshot(), contentType: 'image/png' });\n  throw error;\n}\n",
      "async function retry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {\n  let lastError: unknown;\n  for (let i = 0; i < attempts; i++) {\n    try { return await fn(); } catch (error) {\n      lastError = error;\n      await new Promise((r) => setTimeout(r, 2 ** i * 250));\n    }\n  }\n  throw lastError;\n}\n"
    ],
    "exercises": [
      {
        "id": "ex-9-3-1",
        "title": "Hipotezy diagnostyczne",
        "description": "Dla awarii z obszaru „Obsługa błędów i odzyskiwanie” wypisz trzy hipotezy i artefakt, który je potwierdzi lub obali."
      },
      {
        "id": "ex-9-3-2",
        "title": "Trace analysis",
        "description": "Przeanalizuj trace nieudanego testu i opisz ostatni poprawny stan, akcję wywołującą błąd i brakującą asercję."
      },
      {
        "id": "ex-9-3-3",
        "title": "Console i network logs",
        "description": "Dodaj zbieranie console, pageerror i requestfailed do testu diagnostycznego."
      },
      {
        "id": "ex-9-3-4",
        "title": "Flaky classification",
        "description": "Sklasyfikuj flaky test jako problem danych, selektora, synchronizacji, środowiska albo zależności."
      },
      {
        "id": "ex-9-3-5",
        "title": "Cleanup i recovery",
        "description": "Dodaj finally lub fixture cleanup gwarantujące usunięcie danych nawet przy awarii."
      },
      {
        "id": "ex-9-3-6",
        "title": "Alert użyteczny",
        "description": "Zaprojektuj alert dla regresji testów, który zawiera właściciela, link do raportu i zakres wpływu."
      }
    ],
    "quiz": [
      {
        "id": "q9-3-1",
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
        "id": "q9-3-2",
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
        "id": "q9-3-3",
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
        "id": "q9-3-4",
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
        "id": "q9-3-5",
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
        "id": "q9-3-6",
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
        "id": "q9-3-7",
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
        "id": "q9-3-8",
        "question": "Najważniejsza zasada lekcji „Obsługa błędów i odzyskiwanie” to:",
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
        "title": "Playwright Debugging",
        "url": "https://playwright.dev/docs/debug",
        "description": "Oficjalny przewodnik po Inspectorze, tryb UI i debugowaniu testów Playwright."
      },
      {
        "title": "Playwright Trace Viewer",
        "url": "https://playwright.dev/docs/trace-viewer",
        "description": "Dokumentacja nagrywania i analizy trace."
      },
      {
        "title": "Playwright Test Retries",
        "url": "https://playwright.dev/docs/test-retries",
        "description": "Retry, niestabilne testy i raportowanie ponowień w Playwright Test."
      },
      {
        "title": "Google SRE Book - Monitoring",
        "url": "https://sre.google/sre-book/monitoring-distributed-systems/",
        "description": "Kontekst metryk, alertów i obserwowalności systemów."
      }
    ],
    "tipsAndTricks": [
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
