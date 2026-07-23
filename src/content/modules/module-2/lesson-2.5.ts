import type { Lesson } from '../../../renderer/types';
import theory2_5 from './lesson-2.5.md?raw';

export const lesson2_5: Lesson = {
  "id": "2.5",
  "moduleId": 2,
  "title": "API lokatorów",
  "description": "API locatorów i kolekcje elementów: toHaveCount, count, all, filter, has, nth, evaluateAll, frameLocator, POM komponentów i antywzorce.",
  "order": 5,
  "difficulty": "beginner",
  "tags": [
    "playwright",
    "ui",
    "automation"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji rozumiesz temat: API lokatorów, potrafisz zastosować go w stabilnych testach Playwright oraz wiesz, jak unikać typowych pułapek synchronizacji i selektorów.",
    "theory": theory2_5,
    "codeExamples": [
      "const row = page.getByRole('row').filter({ hasText: 'Zamówienie #123' });\nawait row.getByRole('button', { name: 'Szczegóły' }).click();\n",
      "await expect(page.getByRole('listitem')).toHaveCount(3);\nawait expect(page.getByTestId('order-status')).toHaveText('Opłacone');\n"
    ],
    "exercises": [
      {
        "id": "ex-2-5-1",
        "title": "Minimalny scenariusz",
        "description": "Przygotuj krótki test dla tematu „API lokatorów”, zawierający akcję i asercję rezultatu."
      },
      {
        "id": "ex-2-5-2",
        "title": "Wariant negatywny",
        "description": "Dodaj scenariusz błędu, braku danych, braku uprawnień albo nieprawidłowej interakcji."
      },
      {
        "id": "ex-2-5-3",
        "title": "Stabilizacja",
        "description": "Usuń stały timeout i zastąp go oczekiwaniem na konkretny stan interfejsu użytkownika, API lub strony."
      },
      {
        "id": "ex-2-5-4",
        "title": "Diagnostyka",
        "description": "Dodaj trace, zrzut ekranu na awarii albo test.step opisujący etapy scenariusza."
      },
      {
        "id": "ex-2-5-5",
        "title": "Refaktor lokatorów",
        "description": "Przepisz kruche selektory na lokatory semantyczne lub test id."
      },
      {
        "id": "ex-2-5-6",
        "title": "Przegląd kodu",
        "description": "Przygotuj checklistę przeglądu kodu dla testów wykorzystujących tę technikę."
      }
    ],
    "quiz": [
      {
        "id": "q2-5-1",
        "question": "Jaki jest główny cel zagadnienia „API lokatorów”?",
        "options": [
          "Stabilne i czytelne sterowanie przeglądarką w scenariuszach użytkownika",
          "Pisanie losowych sleepów",
          "Zastąpienie wszystkich testów API",
          "Ignorowanie asercji"
        ],
        "correctAnswer": 0,
        "explanation": "Podstawy Playwright służą budowaniu testów, które odtwarzają zachowanie użytkownika i dają wiarygodną informację."
      },
      {
        "id": "q2-5-2",
        "question": "Który lokator jest zwykle najbardziej zgodny z perspektywą użytkownika?",
        "options": [
          "getByRole z nazwą dostępną",
          "Długi XPath",
          "Losowa klasa CSS",
          "nth-child bez kontekstu"
        ],
        "correctAnswer": 0,
        "explanation": "Role i nazwy dostępne opisują element tak, jak widzą go użytkownicy i technologie wspomagające."
      },
      {
        "id": "q2-5-3",
        "question": "Co jest lepsze niż waitForTimeout?",
        "options": [
          "Oczekiwanie na widoczny tekst, URL, response lub stan elementu",
          "Jeszcze dłuższy timeout",
          "Brak oczekiwania",
          "Odświeżenie strony"
        ],
        "correctAnswer": 0,
        "explanation": "Czekamy na warunek, który potwierdza postęp scenariusza."
      },
      {
        "id": "q2-5-4",
        "question": "Po co używać BrowserContext?",
        "options": [
          "Do izolowania sesji, cookies i storage między użytkownikami/testami",
          "Do zmiany koloru przeglądarki",
          "Do zastąpienia asercji",
          "Do generowania danych SQL"
        ],
        "correctAnswer": 0,
        "explanation": "Context działa jak odseparowany profil przeglądarki."
      },
      {
        "id": "q2-5-5",
        "question": "Czym jest actionability check?",
        "options": [
          "Sprawdzeniem, czy element nadaje się do wykonania akcji",
          "Raportem JUnit",
          "Rodzajem screenshotu",
          "Typem danych testowych"
        ],
        "correctAnswer": 0,
        "explanation": "Playwright przed akcją sprawdza m.in. widoczność, stabilność i możliwość interakcji."
      },
      {
        "id": "q2-5-6",
        "question": "Co powinno nastąpić po akcji użytkownika w teście?",
        "options": [
          "Asercja widocznego lub mierzalnego rezultatu",
          "Koniec testu bez sprawdzenia",
          "Losowy sleep",
          "Zmiana nazwy pliku"
        ],
        "correctAnswer": 0,
        "explanation": "Test ma potwierdzać skutek, nie samo wykonanie akcji."
      },
      {
        "id": "q2-5-7",
        "question": "Kiedy test wizualny jest kruchy?",
        "options": [
          "Gdy obejmuje dynamiczne daty, animacje lub losowe dane bez maskowania",
          "Gdy ma stabilny viewport",
          "Gdy maskuje reklamy",
          "Gdy używa baseline"
        ],
        "correctAnswer": 0,
        "explanation": "Dynamiczne elementy powodują fałszywe regresje wizualne."
      },
      {
        "id": "q2-5-8",
        "question": "Co jest dobrym nawykiem w podstawowych testach Playwright?",
        "options": [
          "Czytelne test.step, stabilne lokatory i diagnostyka awarii",
          "Brak nazw testów",
          "Ukrywanie błędów",
          "Commitowanie raportów"
        ],
        "correctAnswer": 0,
        "explanation": "Te praktyki zwiększają utrzymywalność i skracają diagnozę."
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
            "title": "Locators",
            "url": "https://playwright.dev/docs/locators",
            "description": "Praca z locatorami i filtrowaniem."
      },
      {
            "title": "Locator API",
            "url": "https://playwright.dev/docs/api/class-locator",
            "description": "Metody Locator: count, all, filter, evaluateAll."
      },
      {
            "title": "Frames",
            "url": "https://playwright.dev/docs/frames",
            "description": "frameLocator i praca z iframe."
      }
    ],
    "tipsAndTricks": [
      "Zawsze opieraj architekturę testów na zasadach SOLID, unikając przedwczesnej abstrakcji zgodnie z zasadą WET (Write Everything Twice) z podręczników 2026.",
      
      "Preferuj lokatory opisujące intencję użytkownika: role, label, tekst dostępnościowy i test id.",
      "Nie zapisuj stałych timeoutów jako rozwiązania problemu synchronizacji; czekaj na znaczący stan.",
      "Każda akcja powinna mieć sensowną asercję skutku — kliknięcie bez weryfikacji nie jest testem.",
      "Przy interakcjach złożonych zapisuj diagnostykę: screenshot, trace, aktualny URL i stan kluczowych elementów."
    ],
    "commonMistakes": [
      {
        "mistake": "Używanie kruchych selektorów CSS/XPath bez potrzeby",
        "solution": "Najpierw spróbuj getByRole, getByLabel, getByText lub getByTestId."
      },
      {
        "mistake": "Mylenie obecności elementu w DOM z widocznością i używalnością",
        "solution": "Używaj asercji i akcji Playwright, które uwzględniają actionability."
      },
      {
        "mistake": "Brak izolacji kontekstu przeglądarki",
        "solution": "Dla niezależnych użytkowników używaj osobnych BrowserContext."
      },
      {
        "mistake": "Screenshoty porównujące dynamiczne treści",
        "solution": "Maskuj lub stabilizuj daty, reklamy, animacje i dane losowe."
      }
    ]
  }
};
