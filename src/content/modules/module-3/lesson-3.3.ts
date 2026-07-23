import type { Lesson } from '../../../renderer/types';
import theory3_3 from './lesson-3.3.md?raw';

export const lesson3_3: Lesson = {
  "id": "3.3",
  "moduleId": 3,
  "title": "Asercje odpowiedzi API",
  "description": "Asercje odpowiedzi API: statusy, JSON, nagłówki, schematy, paginacja, CRUD, autoryzacja i scenariusze negatywne.",
  "order": 3,
  "difficulty": "beginner",
  "tags": [
    "api-testing",
    "response",
    "json",
    "headers",
    "schema",
    "crud"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz projektować asercje API obejmujące status, ciało odpowiedzi, nagłówki, kontrakt, paginację i błędy oraz rozumiesz, dlaczego samo 200 OK nie jest wystarczającym testem.",
    "theory": theory3_3,
    "codeExamples": [
      "const response = await request.get('/api/orders/ord-123');\nexpect(response.status()).toBe(200);\nexpect(response.headers()['content-type']).toContain('application/json');\n\nconst body = await response.json();\nexpect(body).toMatchObject({ id: 'ord-123', status: 'paid' });\nexpect(typeof body.totalGross).toBe('number');\n",
      "const forbidden = await request.get('/api/admin/users');\nexpect(forbidden.status()).toBe(403);\n\nconst error = await forbidden.json();\nexpect(error).toMatchObject({ code: 'FORBIDDEN' });\n"
    ],
    "exercises": [
      {
        "id": "ex-3-3-1",
        "title": "Asercja rezultatu",
        "description": "Dla tematu „Asercje odpowiedzi API” napisz test z asercją sprawdzającą realny efekt użytkownika lub kontraktu."
      },
      {
        "id": "ex-3-3-2",
        "title": "Scenariusz negatywny",
        "description": "Dodaj asercję dla błędu: brak elementu, niepoprawny status, walidacja albo wyjątek."
      },
      {
        "id": "ex-3-3-3",
        "title": "Refaktor asercji",
        "description": "Przepisz test z ogólnym expect(true).toBeTruthy() na konkretne oczekiwanie domenowe."
      },
      {
        "id": "ex-3-3-4",
        "title": "Diagnostyka komunikatu",
        "description": "Dodaj opis asercji lub helper tak, aby porażka testu była zrozumiała w raporcie."
      },
      {
        "id": "ex-3-3-5",
        "title": "Granice matcherów",
        "description": "Wskaż, kiedy użyć gotowego matchera, a kiedy napisać custom assertion."
      },
      {
        "id": "ex-3-3-6",
        "title": "Review asercji",
        "description": "Przygotuj checklistę review dla asercji w testach interfejsu użytkownika/API."
      }
    ],
    "quiz": [
      {
        "id": "q3-3-1",
        "question": "Jaka jest rola asercji w teście?",
        "options": [
          "Potwierdzenie oczekiwanego zachowania systemu",
          "Wydłużenie testu",
          "Zastąpienie danych testowych",
          "Ukrycie błędów"
        ],
        "correctAnswer": 0,
        "explanation": "Asercja jest miejscem, w którym test zamienia obserwację w ocenę poprawności."
      },
      {
        "id": "q3-3-2",
        "question": "Co oznacza web-first assertion?",
        "options": [
          "Asercja, która automatycznie ponawia sprawdzenie przez określony czas",
          "Asercja wyłącznie dla CSS",
          "Brak oczekiwania",
          "Dowolny screenshot"
        ],
        "correctAnswer": 0,
        "explanation": "Playwright czeka, aż warunek interfejsu użytkownika zostanie spełniony lub upłynie timeout."
      },
      {
        "id": "q3-3-3",
        "question": "Dlaczego expect(locator).toBeVisible() jest lepsze niż ręczne sprawdzanie DOM?",
        "options": [
          "Uwzględnia widoczność i oczekuje na stan",
          "Zawsze ignoruje timeout",
          "Nie wymaga lokatora",
          "Działa tylko w API"
        ],
        "correctAnswer": 0,
        "explanation": "Asercje locatorów są dostosowane do dynamicznego interfejsu użytkownika."
      },
      {
        "id": "q3-3-4",
        "question": "Co powinien sprawdzać test API poza statusem?",
        "options": [
          "Body, headers, kontrakt, błędy i semantykę odpowiedzi",
          "Kolor przycisku",
          "Tylko URL strony",
          "Nic"
        ],
        "correctAnswer": 0,
        "explanation": "Status HTTP jest tylko częścią kontraktu API."
      },
      {
        "id": "q3-3-5",
        "question": "Kiedy warto stworzyć custom matcher?",
        "options": [
          "Gdy powtarzalna asercja domenowa zyska na czytelnej nazwie",
          "Dla jednej przypadkowej linijki",
          "Aby ukryć dowolne błędy",
          "Zawsze zamiast gotowych matcherów"
        ],
        "correctAnswer": 0,
        "explanation": "Custom matcher powinien wyrażać intencję domenową i poprawiać diagnostykę."
      },
      {
        "id": "q3-3-6",
        "question": "Co jest antywzorcem asercji?",
        "options": [
          "expect(true).toBeTruthy() po wykonaniu akcji",
          "toHaveText dla komunikatu sukcesu",
          "toHaveStatus dla API",
          "toHaveCount dla listy"
        ],
        "correctAnswer": 0,
        "explanation": "Taka asercja nie sprawdza zachowania systemu."
      },
      {
        "id": "q3-3-7",
        "question": "Co daje opis asercji lub komunikat diagnostyczny?",
        "options": [
          "Szybszą analizę porażki w raporcie",
          "Ukrycie stack trace",
          "Brak potrzeby testów",
          "Zmianę danych"
        ],
        "correctAnswer": 0,
        "explanation": "Czytelny komunikat skraca czas diagnozy."
      },
      {
        "id": "q3-3-8",
        "question": "Najważniejsza zasada lekcji „Asercje odpowiedzi API” to:",
        "options": [
          "Asercja ma być konkretna, czytelna i powiązana z ryzykiem",
          "Asercje są opcjonalne",
          "Wystarczy kliknięcie",
          "Każdy helper jest dobry"
        ],
        "correctAnswer": 0,
        "explanation": "Wartość testu wynika z jakości oczekiwań."
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
        "title": "Playwright Assertions",
        "url": "https://playwright.dev/docs/test-assertions",
        "description": "Oficjalny opis asercji Playwright i mechanizmu web-first assertions."
      },
      {
        "title": "Playwright Testowanie API",
        "url": "https://playwright.dev/docs/api-testing",
        "description": "Dokumentacja testowania API w Playwright Test."
      },
      {
        "title": "Jest Expect",
        "url": "https://jestjs.io/docs/expect",
        "description": "Opis matcherów expect, przydatny również dla rozumienia wielu asercji w ekosystemie JS."
      },
      {
        "title": "Vitest Expect API",
        "url": "https://vitest.dev/api/expect.html",
        "description": "Matcher API w Vitest, użyteczne przy własne asercje i testach niższych poziomów."
      }
    ],
    "tipsAndTricks": [
      "Zawsze opieraj architekturę testów na zasadach SOLID, unikając przedwczesnej abstrakcji zgodnie z zasadą WET (Write Everything Twice) z podręczników 2026.",
      
      "Asercja powinna opisywać oczekiwany rezultat, a nie tylko potwierdzać, że kod się wykonał.",
      "Web-first assertions są retry-aware — używaj ich zamiast ręcznego pollingu interfejsu użytkownika.",
      "W API sprawdzaj status, body, nagłówki i scenariusze negatywne; sam status 200 rzadko wystarcza.",
      "Helper lub custom matcher ma zwiększać czytelność intencji, a nie ukrywać istotne szczegóły testu."
    ],
    "commonMistakes": [
      {
        "mistake": "Asercja zbyt ogólna",
        "solution": "Sprawdzaj konkretny, istotny rezultat: tekst, status, pole JSON, count, URL lub stan elementu."
      },
      {
        "mistake": "Ręczne oczekiwanie przed expect",
        "solution": "Używaj web-first assertions, które same czekają na spełnienie warunku."
      },
      {
        "mistake": "Test API sprawdzający tylko 200 OK",
        "solution": "Dodaj walidację body, headers, kontraktu i błędów."
      },
      {
        "mistake": "Helpery ukrywające asercje o niejasnym znaczeniu",
        "solution": "Nazwij helper językiem domeny i nie chowaj w nim zbyt wielu niezależnych oczekiwań."
      }
    ]
  }
};
