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
      "import { expect, it, vi } from 'vitest';\n\ninterface Mailer {\n  sendPaymentConfirmation(email: string, orderId: string): Promise<void>;\n}\n\nclass FakeOrderRepository {\n  private statuses = new Map<string, string>();\n  async markAsPaid(orderId: string) { this.statuses.set(orderId, 'paid'); }\n  async status(orderId: string) { return this.statuses.get(orderId); }\n}\n\nit('marks order as paid and sends confirmation', async () => {\n  const repo = new FakeOrderRepository();\n  const mailer: Mailer = { sendPaymentConfirmation: vi.fn().mockResolvedValue(undefined) };\n\n  await completePayment({ repo, mailer }, { orderId: 'ord-1', email: 'a@example.test' });\n\n  expect(await repo.status('ord-1')).toBe('paid');\n  expect(mailer.sendPaymentConfirmation).toHaveBeenCalledWith('a@example.test', 'ord-1');\n});\n",
      "// Antywzorzec: test kruchej implementacji.\nexpect(repository.beginTransaction).toHaveBeenCalledBefore(repository.save);\n\n// Lepsze pytanie: czy rezultat domenowy jest poprawny?\nexpect(await repository.findOrder(orderId)).toMatchObject({ status: 'paid' });\n"
    ],
    "exercises": [
      {
        "id": "ex-19-2-1",
        "title": "Słownik dublerów",
        "description": "Dla pięciu przykładów wskaż, czy użyć dummy, stub, fake, spy czy mock."
      },
      {
        "id": "ex-19-2-2",
        "title": "Fake repozytorium",
        "description": "Zaimplementuj fake repozytorium w pamięci dla zamówień i użyj go w teście serwisu."
      },
      {
        "id": "ex-19-2-3",
        "title": "Spy mailera",
        "description": "Sprawdź, czy po zdarzeniu domenowym wysłano e-mail, nie uruchamiając prawdziwej poczty."
      },
      {
        "id": "ex-19-2-4",
        "title": "Granice mockowania",
        "description": "Wskaż, które zależności w module płatności mockować, a które testować integracyjnie."
      },
      {
        "id": "ex-19-2-5",
        "title": "Refaktor kruchego testu",
        "description": "Przepisz test sprawdzający prywatną kolejność wywołań na test rezultatu domenowego."
      },
      {
        "id": "ex-19-2-6",
        "title": "Kontrakt po mocku",
        "description": "Zaprojektuj test kontraktowy, który uzupełni test jednostkowy z mockiem klienta API."
      }
    ],
    "quiz": [
      {
        "id": "q19-2-1",
        "question": "Czym jest stub?",
        "options": [
          "Dubler zwracający przygotowane odpowiedzi",
          "Pełna baza produkcyjna",
          "Raport pokrycie kodu",
          "Test E2E"
        ],
        "correctAnswer": 0,
        "explanation": "Stub kontroluje odpowiedź zależności."
      },
      {
        "id": "q19-2-2",
        "question": "Czym jest fake?",
        "options": [
          "Uproszczoną działającą implementacją",
          "Losowym stringiem",
          "Prawdziwą usługą produkcyjną",
          "Typem CSS"
        ],
        "correctAnswer": 0,
        "explanation": "Fake działa, ale jest uproszczony, np. repozytorium w pamięci."
      },
      {
        "id": "q19-2-3",
        "question": "Kiedy spy jest użyteczny?",
        "options": [
          "Gdy chcemy sprawdzić istotną interakcję",
          "Do pomiaru p95",
          "Do migracji bazy",
          "Do generowania PDF"
        ],
        "correctAnswer": 0,
        "explanation": "Spy rejestruje wywołania zależności."
      },
      {
        "id": "q19-2-4",
        "question": "Jakie ryzyko niesie nadmierne mockowanie?",
        "options": [
          "Testujemy wyobrażenie zależności zamiast realnej integracji",
          "Testy zawsze stają się wolniejsze",
          "Nie da się pisać asercji",
          "TypeScript przestaje działać"
        ],
        "correctAnswer": 0,
        "explanation": "Mock może rozminąć się z prawdziwym kontraktem."
      },
      {
        "id": "q19-2-5",
        "question": "Którą zależność najczęściej warto mockować w unit testach?",
        "options": [
          "Zewnętrzną bramkę płatności",
          "Prostą funkcję sumującą",
          "Stałą matematyczną",
          "Typ TypeScript"
        ],
        "correctAnswer": 0,
        "explanation": "Zależności zewnętrzne są wolne, kosztowne i niedeterministyczne."
      },
      {
        "id": "q19-2-6",
        "question": "Co powinno uzupełniać testy z mockami API?",
        "options": [
          "Testy kontraktowe lub integracyjne",
          "Więcej waitForTimeout",
          "Usunięcie asercji",
          "Wyłącznie screenshoty"
        ],
        "correctAnswer": 0,
        "explanation": "Trzeba gdzieś sprawdzić prawdziwy kontrakt komunikacji."
      },
      {
        "id": "q19-2-7",
        "question": "Co jest lepsze niż asercja na prywatną kolejność wywołań?",
        "options": [
          "Asercja na rezultat domenowy",
          "Brak testu",
          "Losowy sleep",
          "Zmiana nazwy pliku"
        ],
        "correctAnswer": 0,
        "explanation": "Rezultat jest stabilniejszym kontraktem niż szczegóły implementacji."
      },
      {
        "id": "q19-2-8",
        "question": "Jaki jest cel dublera testowego?",
        "options": [
          "Kontrolowana zamiana zależności w teście",
          "Zastąpienie całej strategii testów",
          "Ukrywanie błędów",
          "Usunięcie TypeScriptu"
        ],
        "correctAnswer": 0,
        "explanation": "Dubler pozwala izolować jednostkę i kontrolować warunki testu."
      }
    ],
    "references": [
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
      "Mockuj granice systemu, nie każdy wewnętrzny detal.",
      "Fake jest często czytelniejszy niż rozbudowany mock z wieloma oczekiwaniami.",
      "Każdy mock zewnętrznego API powinien mieć parę w postaci testu kontraktowego lub integracyjnego.",
      "Nie asercjonuj interakcji, jeżeli nie jest częścią zachowania biznesowego."
    ],
    "commonMistakes": [
      {
        "mistake": "Mockowanie wszystkiego",
        "solution": "Zostaw prawdziwą logikę tam, gdzie jest szybka i deterministyczna."
      },
      {
        "mistake": "Brak testu prawdziwej integracji",
        "solution": "Dodaj test kontraktowy lub integracyjny dla adaptera."
      },
      {
        "mistake": "Asercje na szczegóły implementacji",
        "solution": "Preferuj asercje na rezultat domenowy."
      },
      {
        "mistake": "Złożone mocki trudniejsze niż kod produkcyjny",
        "solution": "Rozważ fake albo uproszczenie testowanej jednostki."
      }
    ]
  }
};
