import type { Lesson } from '../../../renderer/types';
import theory3_2 from './lesson-3.2.md?raw';

export const lesson3_2: Lesson = {
  "id": "3.2",
  "moduleId": 3,
  "title": "Asercje ogólne",
  "description": "Generic assertions: toBe, toEqual, toStrictEqual, matchery asymetryczne, tablice, regex, liczby, błędy sync/async, poll/toPass i snapshoty danych.",
  "order": 2,
  "difficulty": "beginner",
  "tags": [
    "generic-assertions",
    "expect",
    "matchers",
    "data-validation"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz dobierać matchery do danych, rozumiesz różnice między toBe/toEqual/toStrictEqual i wiesz, jak testować wyjątki, tablice, obiekty oraz wartości częściowe.",
    "theory": theory3_2,
    "codeExamples": [
      "expect(2 + 2).toBe(4);\nexpect({ status: 'paid' }).toEqual({ status: 'paid' });\nexpect(order).toMatchObject({ status: 'paid', currency: 'PLN' });\nexpect(items).toEqual(expect.arrayContaining([expect.objectContaining({ sku: 'SKU-1' })]));\n",
      "function parseAmount(value: string) {\n  if (!/^\\d+(\\.\\d{2})$/.test(value)) throw new Error('Invalid amount');\n  return Number(value);\n}\n\nexpect(() => parseAmount('abc')).toThrow('Invalid amount');\nawait expect(api.createOrder({})).rejects.toThrow(/validation/i);\n"
    ],
    "exercises": [
      {
        "id": "ex-3-2-1",
        "title": "Asercja rezultatu",
        "description": "Dla tematu „Asercje ogólne” napisz test z asercją sprawdzającą realny efekt użytkownika lub kontraktu."
      },
      {
        "id": "ex-3-2-2",
        "title": "Scenariusz negatywny",
        "description": "Dodaj asercję dla błędu: brak elementu, niepoprawny status, walidacja albo wyjątek."
      },
      {
        "id": "ex-3-2-3",
        "title": "Refaktor asercji",
        "description": "Przepisz test z ogólnym expect(true).toBeTruthy() na konkretne oczekiwanie domenowe."
      },
      {
        "id": "ex-3-2-4",
        "title": "Diagnostyka komunikatu",
        "description": "Dodaj opis asercji lub helper tak, aby porażka testu była zrozumiała w raporcie."
      },
      {
        "id": "ex-3-2-5",
        "title": "Granice matcherów",
        "description": "Wskaż, kiedy użyć gotowego matchera, a kiedy napisać custom assertion."
      },
      {
        "id": "ex-3-2-6",
        "title": "Review asercji",
        "description": "Przygotuj checklistę review dla asercji w testach interfejsu użytkownika/API."
      }
    ],
    "quiz": [
      {
        "id": "q3-2-1",
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
        "id": "q3-2-2",
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
        "id": "q3-2-3",
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
        "id": "q3-2-4",
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
        "id": "q3-2-5",
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
        "id": "q3-2-6",
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
        "id": "q3-2-7",
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
        "id": "q3-2-8",
        "question": "Najważniejsza zasada lekcji „Asercje ogólne” to:",
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
            "title": "GenericAssertions",
            "url": "https://playwright.dev/docs/api/class-genericassertions",
            "description": "Asercje ogólne Playwright."
      },
      {
            "title": "Assertions",
            "url": "https://playwright.dev/docs/test-assertions",
            "description": "expect, soft assertions, poll i toPass."
      },
      {
            "title": "Jest Expect",
            "url": "https://jestjs.io/docs/expect",
            "description": "Matcher API kompatybilne z ekosystemem JS."
      }
],
    "tipsAndTricks": [
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
