import type { Lesson } from '../../../renderer/types';
import theory4_7 from './lesson-4.7.md?raw';

export const lesson4_7: Lesson = {
  id: '4.7',
  moduleId: 4,
  title: 'Dialogi, zdarzenia i event-first pattern',
  description: 'Obsługa alert/confirm/prompt/beforeunload, popupów, downloadów, file chooser, console/page errors, request/response events i WebSocketów.',
  order: 7,
  difficulty: 'intermediate',
  tags: ['dialogs', 'events', 'popup', 'download', 'filechooser', 'websocket'],
  content: {
    objective: 'Po ukończeniu lekcji potrafisz obsługiwać zdarzenia przeglądarki w Playwright, stosować event-first pattern i diagnozować dialogi, popupy, downloady, logi konsoli oraz zdarzenia sieciowe.',
    theory: theory4_7,
    codeExamples: [
      "const popupPromise = page.waitForEvent('popup');\nawait page.getByRole('button', { name: 'Otwórz raport' }).click();\nconst popup = await popupPromise;\nawait expect(popup.getByRole('heading', { name: 'Raport' })).toBeVisible();\n",
      "page.once('dialog', async dialog => {\n  expect(dialog.message()).toContain('Czy na pewno');\n  await dialog.accept();\n});\nawait page.getByRole('button', { name: 'Usuń' }).click();\n"
    ],
    exercises: [
      { id: 'ex-4-7-1', title: 'Popup bez race condition', description: 'Napisz test otwierający nową kartę przez event-first pattern i sprawdź jej URL oraz nagłówek.' },
      { id: 'ex-4-7-2', title: 'Dialog confirm', description: 'Obsłuż confirm przy usuwaniu zasobu i dodaj asercję na treść dialogu.' },
      { id: 'ex-4-7-3', title: 'Download', description: 'Pobierz plik, zapisz go w test-results i sprawdź suggestedFilename.' },
      { id: 'ex-4-7-4', title: 'Diagnostyka konsoli', description: 'Zbierz błędy console/pageerror i dołącz je do raportu przy awarii.' }
    ],
    quiz: [
      { id: 'q4-7-1', question: 'Dlaczego oczekiwanie na event zaczynamy przed kliknięciem?', options: ['Aby nie przegapić szybko wyemitowanego zdarzenia', 'Aby wyłączyć timeouty', 'Aby pominąć asercje', 'Aby zamknąć przeglądarkę'], correctAnswer: 0, explanation: 'Event-first pattern ogranicza race condition.' },
      { id: 'q4-7-2', question: 'Kiedy użyć page.once zamiast page.on dla dialogu?', options: ['Gdy oczekujemy jednego konkretnego dialogu', 'Zawsze dla requestów', 'Tylko dla CSS', 'Nigdy'], correctAnswer: 0, explanation: 'once usuwa handler po pierwszym zdarzeniu.' },
      { id: 'q4-7-3', question: 'Jaki wzorzec jest poprawny dla downloadu?', options: ['const p = page.waitForEvent("download"); click; await p', 'click; waitForTimeout; count', 'goto; reload', 'evaluate click'], correctAnswer: 0, explanation: 'Download jest zdarzeniem asynchronicznym.' }
    ],
    references: [
      { title: 'Playwright Events', url: 'https://playwright.dev/docs/events', description: 'Oficjalna dokumentacja obsługi zdarzeń.' },
      { title: 'Dialogs', url: 'https://playwright.dev/docs/dialogs', description: 'Obsługa alert, confirm, prompt i beforeunload.' },
      { title: 'Downloads', url: 'https://playwright.dev/docs/downloads', description: 'Obsługa pobierania plików.' }
    ],
    tipsAndTricks: [
      'Najpierw twórz promise na zdarzenie, potem wykonuj akcję.',
      'Dla jednorazowych dialogów używaj once zamiast stałego on.',
      'Logi console i pageerror są bardzo cenne w CI.'
    ],
    commonMistakes: [
      { mistake: 'Czekanie na popup po kliknięciu', solution: 'Zastosuj event-first pattern: promise przed kliknięciem.' },
      { mistake: 'Brak asercji na treść dialogu', solution: 'Sprawdzaj message i type dialogu przed accept/dismiss.' }
    ]
  }
};
