import type { Lesson } from '../../../renderer/types';
import theory2_9 from './lesson-2.9.md?raw';

export const lesson2_9: Lesson = {
  "id": "2.9",
  "moduleId": 2,
  "title": "Zrzuty ekranu i testy wizualne",
  "description": "Testy wizualne: screenshoty, toHaveScreenshot, maski, tolerancje, stabilizacja danych, ARIA snapshots, CI baseline i review snapshotów.",
  "order": 9,
  "difficulty": "beginner",
  "tags": [
    "playwright",
    "ui",
    "automation"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji rozumiesz temat: Zrzuty ekranu i testy wizualne, potrafisz zastosować go w stabilnych testach Playwright oraz wiesz, jak unikać typowych pułapek synchronizacji i selektorów.",
    "theory": theory2_9,
    "codeExamples": [
      "await expect(page).toHaveScreenshot('home-page.png', {\n  mask: [page.getByTestId('current-date'), page.getByTestId('user-avatar')],\n});\n",
      "const card = page.getByTestId('product-card').filter({ hasText: 'Laptop Pro' });\nawait expect(card).toHaveScreenshot('product-card.png');\n"
    ],
    "exercises": [
      {
        "id": "ex-2-9-1",
        "title": "Minimalny scenariusz",
        "description": "Przygotuj krótki test dla tematu „Zrzuty ekranu i testy wizualne”, zawierający akcję i asercję rezultatu."
      },
      {
        "id": "ex-2-9-2",
        "title": "Wariant negatywny",
        "description": "Dodaj scenariusz błędu, braku danych, braku uprawnień albo nieprawidłowej interakcji."
      },
      {
        "id": "ex-2-9-3",
        "title": "Stabilizacja",
        "description": "Usuń stały timeout i zastąp go oczekiwaniem na konkretny stan interfejsu użytkownika, API lub strony."
      },
      {
        "id": "ex-2-9-4",
        "title": "Diagnostyka",
        "description": "Dodaj trace, zrzut ekranu na awarii albo test.step opisujący etapy scenariusza."
      },
      {
        "id": "ex-2-9-5",
        "title": "Refaktor lokatorów",
        "description": "Przepisz kruche selektory na lokatory semantyczne lub test id."
      },
      {
        "id": "ex-2-9-6",
        "title": "Przegląd kodu",
        "description": "Przygotuj checklistę przeglądu kodu dla testów wykorzystujących tę technikę."
      }
    ],
    "quiz": [
      {
        "id": "q2-9-1",
        "question": "Jaki jest główny cel zagadnienia „Zrzuty ekranu i testy wizualne”?",
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
        "id": "q2-9-2",
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
        "id": "q2-9-3",
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
        "id": "q2-9-4",
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
        "id": "q2-9-5",
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
        "id": "q2-9-6",
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
        "id": "q2-9-7",
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
        "id": "q2-9-8",
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
            "title": "Screenshots",
            "url": "https://playwright.dev/docs/screenshots",
            "description": "Screenshoty stron i locatorów."
      },
      {
            "title": "Visual comparisons",
            "url": "https://playwright.dev/docs/test-snapshots",
            "description": "Snapshot testing i toHaveScreenshot."
      },
      {
            "title": "ARIA snapshots",
            "url": "https://playwright.dev/docs/aria-snapshots",
            "description": "Snapshoty struktury dostępności."
      }
],
    "tipsAndTricks": [
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
