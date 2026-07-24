import type { Lesson } from '../../../renderer/types';
import theory5_5 from './lesson-5.5.md?raw';

export const lesson5_5: Lesson = {
  "id": "5.5",
  "moduleId": 5,
  "title": "Organizacja testów i tagowanie",
  "description": "Zorganizuj bazę kodu testowego. Poznaj logiczne grupowanie w test.describe, dynamiczne tagowanie (@smoke), wybiórcze uruchamianie testów oraz wbudowane adnotacje.",
  "order": 5,
  "difficulty": "intermediate",
  "tags": ["test-organization", "tagging", "annotations", "skip", "fixme"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz strukturyzować testy za pomocą bloków describe, dynamicznie selekcjonować testy za pomocą filtrów grep, a także kontrolować ich cykl życia przy użyciu adnotacji skip, fixme i fail.",
    "theory": theory5_5,
    "codeExamples": [
      `// Użycie tagowania oraz adnotacji (Książka 2 - Greffier)
test('potwierdzenie transakcji @smoke @critical', async ({ page }) => {
  await page.goto('/checkout');
});`
    ],
    "exercises": [
      {
        "id": "ex-5-5-1",
        "title": "Wdrożenie warunkowego pomijania testów",
        "description": "Napisz test dla pobierania faktur PDF. Skonfiguruj go tak, aby był automatycznie pomijany (skip) podczas testów na przeglądarkach mobilnych (Mobile Safari), ponieważ pobieranie plików nie jest tam obsługiwane."
      }
    ],
    "quiz": [
      {
        "id": "q5-5-1",
        "question": "W jaki sposób najłatwiej uruchomić w terminalu wyłącznie testy posiadające tag @smoke?",
        "options": [
          "Należy wywołać komendę: npx playwright test --grep \"@smoke\"",
          "Należy zakomentować wszystkie pozostałe testy w plikach",
          "Konfigurując to w pliku package.json w sekcji dependencies",
          "Playwright nie pozwala na filtrowanie testów po tagach"
        ],
        "correctAnswer": 0,
        "explanation": "Flaga --grep (oraz jej odpowiednik --grep-invert do wykluczania) pozwala na dynamiczną i precyzyjną selekcję testów na podstawie tagów zadeklarowanych w nazwach."
      }
    ],
    "references": [
      {
        "title": "Hands-On Automated Testing with Playwright (Faraz K. Kelhini, 2026)",
        "url": "https://www.packtpub.com",
        "description": "Chapter 11: Testing Mobile Web Experiences (using projects with tags)."
      }
    ],
    "tipsAndTricks": [
      "Wykorzystuj adnotację test.fixme() zamiast komentowania kodu. Oznaczony w ten sposób test pojawi się w raportach jako pominięty, co przypomni zespołowi o długu technologicznym."
    ],
    "commonMistakes": [
      {
        "mistake": "Używanie trybu test.describe.configure({ mode: 'serial' }) jako domyślnego dla wszystkich plików",
        "solution": "Tryb serial łączy testy i sprawia, że błąd w jednym teście anuluje kolejne. Używaj go wyłącznie do weryfikacji długich, niepodzielnych procesów biznesowych."
      }
    ]
  }
};