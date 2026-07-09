import type { Lesson } from '../../../renderer/types';
import theory2_6 from './lesson-2.6.md?raw';

export const lesson2_6: Lesson = {
  "id": "2.6",
  "moduleId": 2,
  "title": "Akcje podstawowe",
  "description": "Akcje podstawowe użytkownika: click, fill, pressSequentially, keyboard, checkbox/radio, select, hover, focus, skróty klawiaturowe i accessibility.",
  "order": 6,
  "difficulty": "beginner",
  "tags": [
    "playwright",
    "ui",
    "automation"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji rozumiesz temat: Akcje podstawowe, potrafisz zastosować go w stabilnych testach Playwright oraz wiesz, jak unikać typowych pułapek synchronizacji i selektorów.",
    "theory": theory2_6,
    "codeExamples": [
      "await page.getByLabel('Adres e-mail').fill('qa@example.test');\nawait page.getByLabel('Hasło').fill('Correct-Horse-Battery-7!');\nawait page.getByRole('button', { name: 'Zaloguj' }).click();\nawait expect(page).toHaveURL(/dashboard/);\n",
      "await page.getByLabel('Szukaj').fill('playwright');\nawait page.getByLabel('Szukaj').press('Enter');\nawait expect(page.getByRole('heading', { name: /wyniki/i })).toBeVisible();\n"
    ],
    "exercises": [
      {
        "id": "ex-2-6-1",
        "title": "Minimalny scenariusz",
        "description": "Przygotuj krótki test dla tematu „Akcje podstawowe”, zawierający akcję i asercję rezultatu."
      },
      {
        "id": "ex-2-6-2",
        "title": "Wariant negatywny",
        "description": "Dodaj scenariusz błędu, braku danych, braku uprawnień albo nieprawidłowej interakcji."
      },
      {
        "id": "ex-2-6-3",
        "title": "Stabilizacja",
        "description": "Usuń stały timeout i zastąp go oczekiwaniem na konkretny stan interfejsu użytkownika, API lub strony."
      },
      {
        "id": "ex-2-6-4",
        "title": "Diagnostyka",
        "description": "Dodaj trace, zrzut ekranu na awarii albo test.step opisujący etapy scenariusza."
      },
      {
        "id": "ex-2-6-5",
        "title": "Refaktor lokatorów",
        "description": "Przepisz kruche selektory na lokatory semantyczne lub test id."
      },
      {
        "id": "ex-2-6-6",
        "title": "Przegląd kodu",
        "description": "Przygotuj checklistę przeglądu kodu dla testów wykorzystujących tę technikę."
      }
    ],
    "quiz": [
      {
        "id": "q2-6-1",
        "question": "Jaki jest główny cel zagadnienia „Akcje podstawowe”?",
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
        "id": "q2-6-2",
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
        "id": "q2-6-3",
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
        "id": "q2-6-4",
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
        "id": "q2-6-5",
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
        "id": "q2-6-6",
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
        "id": "q2-6-7",
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
        "id": "q2-6-8",
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
            "title": "Input",
            "url": "https://playwright.dev/docs/input",
            "description": "Oficjalne akcje wejścia w Playwright."
      },
      {
            "title": "Actionability",
            "url": "https://playwright.dev/docs/actionability",
            "description": "Warunki gotowości elementu do akcji."
      },
      {
            "title": "Locators",
            "url": "https://playwright.dev/docs/locators",
            "description": "Stabilne znajdowanie elementów do interakcji."
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
