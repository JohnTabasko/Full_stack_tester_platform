import type { Lesson } from '../../../renderer/types';
import theory4_8 from './lesson-4.8.md?raw';

export const lesson4_8: Lesson = {
  id: '4.8',
  moduleId: 4,
  title: 'Evaluating JavaScript, handles, clock i mockowanie API przeglądarki',
  description: 'page.evaluate, evaluateHandle, JSHandle, ElementHandle, addInitScript, kontrola czasu, localStorage/sessionStorage i mockowanie API przeglądarki.',
  order: 8,
  difficulty: 'advanced',
  tags: ['evaluate', 'handles', 'clock', 'mock-browser-apis', 'localStorage'],
  content: {
    objective: 'Po ukończeniu lekcji rozumiesz, kiedy używać JavaScript evaluation, handles, clock i mocków API przeglądarki oraz kiedy lepiej pozostać przy locatorach i zachowaniu użytkownika.',
    theory: theory4_8,
    codeExamples: [
      "const theme = await page.evaluate(() => localStorage.getItem('theme'));\nexpect(theme).toBe('dark');\n",
      "await page.addInitScript(() => {\n  Math.random = () => 0.42;\n});\nawait page.goto('/');\n",
      "await page.clock.install({ time: new Date('2026-07-09T10:00:00Z') });\nawait page.goto('/promotions');\nawait expect(page.getByText('Promocja aktywna')).toBeVisible();\n"
    ],
    exercises: [
      { id: 'ex-4-8-1', title: 'Evaluate bez omijania UI', description: 'Odczytaj localStorage przez page.evaluate, ale główny rezultat sprawdź asercją UI.' },
      { id: 'ex-4-8-2', title: 'Mock czasu', description: 'Zaprojektuj test promocji zależnej od daty z użyciem clock zamiast waitForTimeout.' },
      { id: 'ex-4-8-3', title: 'Mock API przeglądarki', description: 'Zamockuj navigator.onLine przez addInitScript i sprawdź komunikat offline.' },
      { id: 'ex-4-8-4', title: 'Refaktor ElementHandle', description: 'Przepisz test oparty o page.$ na locatory Playwright.' }
    ],
    quiz: [
      { id: 'q4-8-1', question: 'Dlaczego locatory są zwykle lepsze niż ElementHandle?', options: ['Są retry-aware i odporne na re-render', 'Nie wymagają asercji', 'Działają tylko w CSS', 'Zawsze są szybsze od wszystkiego'], correctAnswer: 0, explanation: 'Locator wyszukuje element w momencie akcji i współpracuje z auto-waiting.' },
      { id: 'q4-8-2', question: 'Kiedy użyć addInitScript?', options: ['Gdy mock musi być ustawiony przed załadowaniem aplikacji', 'Po każdym kliknięciu', 'Do screenshotów', 'Do zamykania raportu'], correctAnswer: 0, explanation: 'Init script działa przed kodem strony.' },
      { id: 'q4-8-3', question: 'Co jest antywzorcem evaluate?', options: ['Klikanie DOM przez document.querySelector().click()', 'Odczyt localStorage', 'Sprawdzenie navigator.userAgent', 'Mock Math.random przed goto'], correctAnswer: 0, explanation: 'Klikanie przez evaluate omija model użytkownika i actionability.' }
    ],
    references: [
      { title: 'Evaluating JavaScript', url: 'https://playwright.dev/docs/evaluating', description: 'Wykonywanie kodu w kontekście strony.' },
      { title: 'Handles', url: 'https://playwright.dev/docs/handles', description: 'JSHandle i ElementHandle.' },
      { title: 'Clock', url: 'https://playwright.dev/docs/clock', description: 'Kontrola czasu w testach.' },
      { title: 'Mock browser APIs', url: 'https://playwright.dev/docs/mock-browser-apis', description: 'Mockowanie API przeglądarki.' }
    ],
    tipsAndTricks: [
      'Najpierw sprawdź, czy Playwright ma opcję kontekstu; dopiero potem mockuj przez JS.',
      'Nie używaj evaluate do akcji, które użytkownik może wykonać przez UI.',
      'Kontrola czasu jest stabilniejsza niż realne czekanie.'
    ],
    commonMistakes: [
      { mistake: 'Używanie evaluate do klikania', solution: 'Użyj locator.click(), aby korzystać z actionability.' },
      { mistake: 'Przechowywanie ElementHandle w SPA', solution: 'Użyj locatorów, które ponownie wyszukują element.' }
    ]
  }
};
