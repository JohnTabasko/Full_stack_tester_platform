import type { Lesson } from '../../../renderer/types';
import theory2_6 from './lesson-2.6.md?raw';

export const lesson2_6: Lesson = {
  "id": "2.6",
  "moduleId": 2,
  "title": "Praca z formularzami i elementami interaktywnymi",
  "description": "Zaawansowana automatyzacja pól wejściowych: fill vs pressSequentially, obsługa tradycyjnych i dynamicznych dropdownów, zaznaczanie pól wyboru i kalendarzy.",
  "order": 6,
  "difficulty": "beginner",
  "tags": ["forms", "inputs", "dropdowns", "checkbox", "selectOption"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz automatyzować dowolne formularze, obsługiwać tradycyjne i zaawansowane listy rozwijane div-based, kontrolować stan checkboxów i przycisków radiowych oraz pisać stabilne testy przesyłania formularzy.",
    "theory": theory2_6,
    "codeExamples": [
      `// Wybór z tradycyjnego dropdownu (Książka 1 - Kelhini)
await page.getByLabel('Wybierz rozmiar').selectOption({ label: 'XL' });`
    ],
    "exercises": [
      {
        "id": "ex-2-6-1",
        "title": "Obsługa formularza zamówienia",
        "description": "Napisz test, który wypełnia dane adresowe użytkownika (fill), wybiera metodę dostawy z dropdownu (selectOption) oraz zaznacza wymaganą zgodę na przetwarzanie danych (check)."
      }
    ],
    "quiz": [
      {
        "id": "q2-6-1",
        "question": "Kiedy należy użyć metody pressSequentially() zamiast metody fill()?",
        "options": [
          "Przy testowaniu pól z wyszukiwarkami dynamicznymi lub autouzupełnianiem, gdzie wymagane jest wywołanie zdarzeń klawiatury dla każdego wpisywanego znaku",
          "Zawsze, ponieważ pressSequentially jest znacznie szybsza",
          "Do wprowadzania haseł w formularzach logowania",
          "Wyłącznie do zaznaczania checkboxów"
        ],
        "correctAnswer": 0,
        "explanation": "fill() działa jak wklejenie tekstu, podczas gdy pressSequentially() emuluje rzeczywiste klikanie w klawisze po kolei, co jest wymagane przez skrypty dynamicznego filtrowania na frontendzie."
      }
    ],
    "references": [
      {
        "title": "Hands-On Automated Testing with Playwright (Packt, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Chapter 12: Testing Forms."
      }
    ],
    "tipsAndTricks": [
      "Stosuj metodę .check() zamiast .click() dla pól wyboru. Metoda .check() upewnia się, że element nie zmieni stanu na przeciwny, jeśli był już wcześniej poprawnie zaznaczony."
    ],
    "commonMistakes": [
      {
        "mistake": "Próba użycia .selectOption() na dropdownie, który jest zbudowany z divów i elementów li",
        "solution": "Niestandardowe dropdowny automatyzuj klikając najpierw w kontener, a następnie w wyrenderowaną opcję."
      }
    ]
  }
};