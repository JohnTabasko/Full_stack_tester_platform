import type { Lesson } from '../../../renderer/types';
import theory3_4 from './lesson-3.4.md?raw';

export const lesson3_4: Lesson = {
  "id": "3.4",
  "moduleId": 3,
  "title": "Własne asercje i funkcje pomocnicze",
  "description": "Naucz się pisać własne matchery asercji za pomocą expect.extend(), otypowywać je w TypeScript oraz dodawać precyzyjne, autorskie komunikaty błędów.",
  "order": 4,
  "difficulty": "advanced",
  "tags": ["assertions", "custom-matchers", "expect.extend", "TypeScript", "diagnostics"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz rozszerzać możliwości silnika expect o własne, silnie otypowane asercje domenowe, otypowywać je w TypeScript oraz projektować rzetelne i czytelne komunikaty błędów diagnostycznych.",
    "theory": theory3_4,
    "codeExamples": [
      `// Przykład rozszerzenia expect (Książka 2 - Greffier)
export const expect = baseExpect.extend({
  async toBeValidPageTitle(page: Page, expected: string) {
    const title = await page.title();
    const pass = title.includes(expected);
    return {
      message: () => \`Expected title "\${title}" \${pass ? 'not ' : ''}to contain "\${expected}"\`,
      pass
    };
  }
});`
    ],
    "exercises": [
      {
        "id": "ex-3-4-1",
        "title": "Zaimplementowanie matchera toBeAuthenticated",
        "description": "Zaprojektuj i wdroż custom matcher o nazwie `toBeAuthenticated(page: Page)` weryfikujący obecność i poprawność ciasteczka sesyjnego użytkownika, z obsługą typowania TypeScript."
      }
    ],
    "quiz": [
      {
        "id": "q3-4-1",
        "question": "W jaki sposób rejestrujemy własne matchery asercji w Playwright Test, aby zachować autouzupełnianie w edytorze?",
        "options": [
          "Definiując rozszerzenie expect.extend() i stosując mechanizm scalania deklaracji (Declaration Merging) TypeScript dla interfejsu PlaywrightTest.Matchers",
          "Wystarczy napisać zwykłą funkcję helpera w pliku JS",
          "Nie da się rozszerzyć obiektów asercji o typowanie",
          "Konfigurując to w pliku package.json"
        ],
        "correctAnswer": 0,
        "explanation": "TypeScript pozwala na rozszerzenie istniejących interfejsów za pomocą declaration merging. Dzięki temu edytor podpowiada nasze własne metody (np. .toBeValidPageTitle) bezpośrednio po obiekcie expect."
      }
    ],
    "references": [
      {
        "title": "Practical Playwright Test (Jean-François Greffier, 2026)",
        "url": "https://doi.org/10.1007/979-8-8688-2160-8",
        "description": "Chapter 6: Extending Playwright Test (Custom expect matchers)."
      }
    ],
    "tipsAndTricks": [
      "Zawsze uwzględniaj zachowanie zanegowane w metodzie message() (tj. co ma się wyświetlić, gdy oczekiwano, że warunek NIE zostanie spełniony)."
    ],
    "commonMistakes": [
      {
        "mistake": "Pisanie skomplikowanych pętli i asercji logicznych w plikach testowych zamiast zamknięcia ich w custom matcherze",
        "solution": "Przenieś techniczną logikę weryfikacyjną do rozszerzonego expect.extend(), co uczyni Twoje testy krystalicznie czystymi."
      }
    ]
  }
};