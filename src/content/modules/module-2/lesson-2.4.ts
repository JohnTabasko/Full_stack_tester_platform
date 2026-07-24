import type { Lesson } from '../../../renderer/types';
import theory2_4 from './lesson-2.4.md?raw';

export const lesson2_4: Lesson = {
  "id": "2.4",
  "moduleId": 2,
  "title": "Lokatory i akcje",
  "description": "Głębokie zrozumienie cyklu życia lokatora. Poznaj leniwą ewaluację (Lazy Evaluation), listę kontrolną gotowości (Actionability Checks) oraz zaawansowane opcje akcji.",
  "order": 4,
  "difficulty": "beginner",
  "tags": ["locators", "actionability", "click-options", "lists", "filtering"],
  "content": {
    "objective": "Po ukończeniu tej lekcji rozumiesz różnicę między deklaracją a ewaluacją lokatora, znasz maszynę stanów gotowości akcji Playwright oraz potrafisz operować na kolekcjach elementów i wysyłać złożone zdarzenia myszy i klawiatury.",
    "theory": theory2_4,
    "codeExamples": [
      `// Wykorzystanie filtrów i leniwej ewaluacji (Książka 1 - Kelhini)
const deleteButtons = page.getByRole('row')
  .filter({ hasText: 'Nieaktywny' })
  .getByRole('button', { name: 'Usuń' });
  
// Wyszukanie w DOM i kliknięcie nastąpi dopiero tutaj!
await deleteButtons.first().click();`
    ],
    "exercises": [
      {
        "id": "ex-2-4-1",
        "title": "Weryfikacja maszyny stanów gotowości",
        "description": "Napisz test, w którym przycisk jest początkowo niewidoczny lub zablokowany (disabled). Wywołaj akcję kliknięcia i zaobserwuj, jak Playwright automatycznie czeka na zmianę jego stanu."
      }
    ],
    "quiz": [
      {
        "id": "q2-4-1",
        "question": "W którym momencie Playwright fizycznie przeszukuje strukturę DOM w celu zlokalizowania elementu opisanego lokatorem?",
        "options": [
          "Dopiero w ułamku sekundy, w którym na lokatorze wywoływana jest akcja (np. .click() lub .fill())",
          "Natychmiast podczas deklarowania zmiennej const locator = page.locator(...)",
          "Podczas wczytywania pliku testu na poziomie kompilacji TypeScript",
          "Wyłącznie podczas wywoływania asercji expect"
        ],
        "correctAnswer": 0,
        "explanation": "Lokatory in Playwright są ewaluowane leniwie (lazy-evaluated). Deklaracja lokatora to jedynie przepis, który jest wykonywany dopiero podczas wywołania fizycznej interakcji lub asercji."
      }
    ],
    "references": [
      {
        "title": "Hands-On Automated Testing with Playwright (Packt, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Chapter 2: How Playwright ensures actions happen at the right time."
      }
    ],
    "tipsAndTricks": [
      "Jeśli napotkasz problem z kliknięciem elementu, który jest przysłonięty przez błąd renderowania, unikaj opcji { force: true }. Zamiast tego zlokalizuj element przysłaniający i poczekaj na jego ukrycie."
    ],
    "commonMistakes": [
      {
        "mistake": "Próba iterowania po elementach za pomocą tradycyjnej pętli for-of bez użycia asynchronicznych metod",
        "solution": "Wykorzystaj .all() lub asynchroniczne metody filtrowania Playwright do bezpiecznej pracy z listami."
      }
    ]
  }
};