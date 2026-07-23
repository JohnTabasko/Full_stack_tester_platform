import type { Lesson } from "../../../renderer/types";
import theory19_2 from './lesson-19.2.md?raw';

export const lesson19_2: Lesson = {
  "id": "19.2",
  "moduleId": 19,
  "title": "Mocki, stuby, obiekty pozorne i szpiedzy",
  "description": "Mocki, stuby, fake, spy, vi.fn/jest.fn, spyOn, mockowanie modułów, fake timers, MSW i ryzyka nadmiernego mockowania.",
  "order": 2,
  "difficulty": "intermediate",
  "tags": [
    "mocks",
    "stubs",
    "fakes",
    "spies",
    "test-doubles",
    "isolation"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji rozumiesz różnice między typami dublerów testowych, potrafisz izolować zależności bez utraty sensu testu oraz wiesz, kiedy mock pomaga, a kiedy czyni test mniej wiarygodnym.",
    "theory": theory19_2,
    "codeExamples": [
      "import { expect, test, vi } from 'vitest';\n\ntest('logs provider timeout', async () => {\n  const gateway = { charge: vi.fn().mockRejectedValue(new Error('timeout')) };\n  const logger = { error: vi.fn() };\n\n  await expect(payOrder(gateway, logger)).rejects.toThrow('timeout');\n  expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('timeout'));\n});",
      "afterEach(() => {\n  vi.restoreAllMocks();\n  vi.clearAllMocks();\n});",
      "class InMemoryOrdersRepository {\n  private orders = new Map<string, Order>();\n  save(order: Order) { this.orders.set(order.id, order); }\n  findById(id: string) { return this.orders.get(id) ?? null; }\n}"
],
    "exercises": [
      {
            "id": "ex-auto-1",
            "title": "Ćwiczenie 1",
            "description": "Zastąp mock bazy prostym fake repository i porównaj czytelność testu."
      },
      {
            "id": "ex-auto-2",
            "title": "Ćwiczenie 2",
            "description": "Zamockuj błąd dostawcy płatności i sprawdź fallback oraz log diagnostyczny."
      },
      {
            "id": "ex-auto-3",
            "title": "Ćwiczenie 3",
            "description": "Dodaj `afterEach` czyszczący mocki i wykaż, jaki błąd usuwa."
      },
      {
            "id": "ex-auto-4",
            "title": "Ćwiczenie 4",
            "description": "Porównaj mock modułu z MSW dla tego samego API."
      }
],
    "quiz": [
      {
            "id": "q-auto-1",
            "question": "Czym różni się spy od stuba?",
            "options": [
                  "Spy obserwuje wywołania, stub zwraca zaprogramowaną odpowiedź",
                  "To dokładnie to samo",
                  "Spy wymaga przeglądarki",
                  "Stub jest wyłącznie dla CSS"
            ],
            "correctAnswer": 0,
            "explanation": "To sprawdza zrozumienie praktycznego zastosowania lekcji."
      },
      {
            "id": "q-auto-2",
            "question": "Co jest ryzykiem nadmiernego mockowania?",
            "options": [
                  "Test przechodzi mimo zepsutej realnej integracji",
                  "Testy zawsze są wolniejsze",
                  "Brak możliwości asercji",
                  "Nie działa TypeScript"
            ],
            "correctAnswer": 0,
            "explanation": "To sprawdza zrozumienie praktycznego zastosowania lekcji."
      },
      {
            "id": "q-auto-3",
            "question": "Kiedy MSW bywa lepsze od mockowania modułów?",
            "options": [
                  "Gdy chcesz mockować granicę HTTP zamiast implementacji",
                  "Gdy testujesz prywatną metodę",
                  "Gdy nie ma requestów",
                  "Gdy chcesz pominąć kontrakt"
            ],
            "correctAnswer": 0,
            "explanation": "To sprawdza zrozumienie praktycznego zastosowania lekcji."
      },
      {
            "id": "q-auto-4",
            "question": "Po co resetować mocki?",
            "options": [
                  "Aby testy nie dziedziczyły stanu i wywołań",
                  "Aby wyłączyć lint",
                  "Aby przyspieszyć build",
                  "Aby usunąć coverage"
            ],
            "correctAnswer": 0,
            "explanation": "To sprawdza zrozumienie praktycznego zastosowania lekcji."
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
        "title": "Vitest Mocking",
        "url": "https://vitest.dev/guide/mocking",
        "description": "Mockowanie w Vitest."
      },
      {
        "title": "Jest Mock Functions",
        "url": "https://jestjs.io/docs/mock-functions",
        "description": "Mock functions w Jest."
      },
      {
        "title": "MSW",
        "url": "https://mswjs.io/docs/",
        "description": "Mockowanie HTTP na granicy sieci."
      }
    ],
    "tipsAndTricks": [
      "Zawsze opieraj architekturę testów na zasadach SOLID, unikając przedwczesnej abstrakcji zgodnie z zasadą WET (Write Everything Twice) z podręczników 2026.",
      
      "Mockuj granice, nie logikę, którą testujesz.",
      "Dane mocka powinny być zgodne z kontraktem API.",
      "Fake bywa lepszy niż mock, gdy potrzebujesz prostego, działającego stanu.",
      "Po każdym teście przywracaj spies i mocki."
],
    "commonMistakes": [
      {
            "mistake": "Mock niezgodny z kontraktem",
            "solution": "Waliduj mocki typami, schema albo OpenAPI."
      },
      {
            "mistake": "Asercja tylko na wywołanie metody",
            "solution": "Sprawdź także efekt domenowy."
      },
      {
            "mistake": "Brak resetu mocków",
            "solution": "Użyj `restoreAllMocks` i `clearAllMocks` w teardownie."
      }
]
  }
};
