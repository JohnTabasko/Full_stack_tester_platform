import type { Lesson } from "../../../renderer/types";
import theory27_2 from './lesson-27.2.md?raw';

export const lesson27_2: Lesson = {
  "id": "27.2",
  "moduleId": 27,
  "title": "Generowanie przypadków testowych i danych testowych",
  "description": "Tworzenie macierzy przypadków, danych brzegowych, scenariuszy negatywnych, danych syntetycznych i walidacja wyników AI.",
  "order": 2,
  "difficulty": "intermediate",
  "tags": [
    "ai",
    "test-cases",
    "test-data",
    "synthetic-data",
    "boundary-values"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz używać AI do generowania szkiców przypadków testowych i danych syntetycznych, a następnie oceniać ich pokrycie, poprawność, bezpieczeństwo i przydatność w automatyzacji.",
    "theory": theory27_2,
    "codeExamples": [
      "# Prompt do danych brzegowych\nWygeneruj dane testowe dla pola „kwota przelewu”.\nWarunki:\n- minimalna kwota: 1.00 PLN,\n- maksymalna kwota: 100000.00 PLN,\n- dwa miejsca po przecinku,\n- uwzględnij wartości poprawne, niepoprawne i brzegowe,\n- zwróć JSON z polami: value, expectedValidity, reason.\n",
      "type GeneratedCase = {\n  id: string;\n  input: unknown;\n  expectedValidity: boolean;\n  risk: string;\n  reviewedByHuman: boolean;\n};\n\nfunction acceptGeneratedCase(testCase: GeneratedCase) {\n  if (!testCase.reviewedByHuman) throw new Error('AI-generated case requires review');\n  return testCase;\n}\n"
    ],
    "exercises": [
      {
        "id": "ex-27-2-1",
        "title": "Prompt z kryteriami",
        "description": "Napisz prompt dla tematu „Generowanie przypadków testowych i danych testowych”, zawierający kontekst, ograniczenia i format odpowiedzi."
      },
      {
        "id": "ex-27-2-2",
        "title": "Review odpowiedzi AI",
        "description": "Przeanalizuj wygenerowane przypadki testowe i wskaż luki, nadmiary oraz ryzyka bezpieczeństwa."
      },
      {
        "id": "ex-27-2-3",
        "title": "Anonimizacja danych",
        "description": "Przepisz log produkcyjny tak, aby był użyteczny diagnostycznie, ale nie zawierał danych wrażliwych."
      },
      {
        "id": "ex-27-2-4",
        "title": "Human-in-the-loop",
        "description": "Opisz, które decyzje może wspierać AI, a które muszą pozostać po stronie testera lub zespołu."
      },
      {
        "id": "ex-27-2-5",
        "title": "Walidacja wyniku",
        "description": "Zaprojektuj checklistę oceny testów, danych lub analizy wygenerowanej przez AI."
      },
      {
        "id": "ex-27-2-6",
        "title": "Ryzyka AI",
        "description": "Wypisz ryzyka: halucynacja, prywatność, bias, nieaktualna wiedza, brak deterministyczności i zaproponuj mitygacje."
      }
    ],
    "quiz": [
      {
        "id": "q27-2-1",
        "question": "Jaka jest najbezpieczniejsza rola AI w pracy testera?",
        "options": [
          "Asystent generujący hipotezy i szkice wymagające review",
          "Nieomylny autor testów",
          "Zamiennik strategii jakości",
          "Narzędzie do publikowania sekretów"
        ],
        "correctAnswer": 0,
        "explanation": "AI może przyspieszać pracę, ale wymaga weryfikacji człowieka."
      },
      {
        "id": "q27-2-2",
        "question": "Czego nie należy wklejać do promptu?",
        "options": [
          "Sekretów, tokenów, danych osobowych i wrażliwych logów",
          "Syntetycznych przykładów",
          "Opisu wymagań bez danych wrażliwych",
          "Publicznej dokumentacji"
        ],
        "correctAnswer": 0,
        "explanation": "Dane wrażliwe mogą trafić do historii, logów lub niekontrolowanych systemów."
      },
      {
        "id": "q27-2-3",
        "question": "Co oznacza halucynacja AI?",
        "options": [
          "Wygenerowanie wiarygodnie brzmiącej, ale fałszywej informacji",
          "Poprawną asercję",
          "Szybsze wykonanie testów",
          "Format JSON"
        ],
        "correctAnswer": 0,
        "explanation": "Modele mogą tworzyć nieprawdziwe odpowiedzi z dużą pewnością językową."
      },
      {
        "id": "q27-2-4",
        "question": "Co powinien zawierać dobry prompt testowy?",
        "options": [
          "Kontekst, cel, ograniczenia, format odpowiedzi i kryteria oceny",
          "Tylko jedno słowo",
          "Sekretny token",
          "Niejasne polecenie"
        ],
        "correctAnswer": 0,
        "explanation": "Im lepsze ramy zadania, tym łatwiej ocenić jakość odpowiedzi."
      },
      {
        "id": "q27-2-5",
        "question": "Dlaczego AI nie zastępuje testera domenowego?",
        "options": [
          "Bo nie ponosi odpowiedzialności za decyzję i może nie rozumieć kontekstu produktu",
          "Bo nie generuje tekstu",
          "Bo nie zna składni",
          "Bo zawsze działa offline"
        ],
        "correctAnswer": 0,
        "explanation": "Wiedza domenowa, priorytety i odpowiedzialność pozostają po stronie zespołu."
      },
      {
        "id": "q27-2-6",
        "question": "Co jest dobrą praktyką przy AI-assisted debugging?",
        "options": [
          "Dostarczyć zanonimizowany kontekst i zweryfikować hipotezy w logach/testach",
          "Wkleić pełne sekrety",
          "Przyjąć pierwszą odpowiedź za prawdę",
          "Usunąć dane diagnostyczne"
        ],
        "correctAnswer": 0,
        "explanation": "AI może pomóc formułować hipotezy, ale dowód musi pochodzić z systemu."
      },
      {
        "id": "q27-2-7",
        "question": "Czym jest human-in-the-loop?",
        "options": [
          "Człowiek kontroluje i zatwierdza istotne decyzje wspierane przez AI",
          "AI wdraża bez review",
          "Brak odpowiedzialności",
          "Losowy wybór testów"
        ],
        "correctAnswer": 0,
        "explanation": "Człowiek pozostaje odpowiedzialny za ocenę i decyzję."
      },
      {
        "id": "q27-2-8",
        "question": "Najważniejszy wniosek z lekcji „Generowanie przypadków testowych i danych testowych” to:",
        "options": [
          "AI zwiększa produktywność tylko wtedy, gdy działa w ramach zasad jakości, prywatności i review",
          "AI zwalnia z myślenia",
          "AI zawsze zna aktualny produkt",
          "AI może przechowywać sekrety"
        ],
        "correctAnswer": 0,
        "explanation": "Odpowiedzialne użycie AI wymaga procesu, ograniczeń i weryfikacji."
      }
    ],
    "references": [
      {
        "title": "OWASP Top 10 for LLM Applications",
        "url": "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
        "description": "Najważniejsze ryzyka bezpieczeństwa aplikacji korzystających z modeli językowych."
      },
      {
        "title": "NIST AI Risk Management Framework",
        "url": "https://www.nist.gov/itl/ai-risk-management-framework",
        "description": "Ramy zarządzania ryzykiem systemów AI."
      },
      {
        "title": "Google People + AI Guidebook",
        "url": "https://pair.withgoogle.com/guidebook/",
        "description": "Praktyczne wskazówki projektowania systemów wspieranych przez AI z człowiekiem w pętli decyzyjnej."
      },
      {
        "title": "Microsoft Responsible AI",
        "url": "https://www.microsoft.com/ai/responsible-ai",
        "description": "Materiały o odpowiedzialnym użyciu AI, prywatności i kontroli jakości."
      }
    ],
    "tipsAndTricks": [
      "AI traktuj jak asystenta, nie autorytet. Każdą sugestię trzeba zweryfikować.",
      "Nie wklejaj do narzędzi AI sekretów, danych osobowych ani niezanonimizowanych logów produkcyjnych.",
      "Najlepsze prompty testowe zawierają kontekst, ograniczenia, format oczekiwanej odpowiedzi i kryteria oceny.",
      "AI świetnie pomaga generować hipotezy, ale odpowiedzialność za decyzję testową pozostaje po stronie człowieka."
    ],
    "commonMistakes": [
      {
        "mistake": "Bezrefleksyjne kopiowanie testów wygenerowanych przez AI",
        "solution": "Zawsze wykonaj review: cel testu, dane, asercje, stabilność, bezpieczeństwo i zgodność z architekturą."
      },
      {
        "mistake": "Wklejanie sekretów lub danych osobowych do promptu",
        "solution": "Stosuj anonimizację, syntetyczne dane i zasady bezpieczeństwa organizacji."
      },
      {
        "mistake": "Brak kryteriów oceny odpowiedzi AI",
        "solution": "Zdefiniuj, jak poznasz, że wynik jest poprawny: pokrycie ryzyk, format, ograniczenia i źródła."
      },
      {
        "mistake": "Traktowanie AI jako zamiennika eksploracji i wiedzy domenowej",
        "solution": "Używaj AI do rozszerzania perspektywy, a nie do zastępowania rozumienia produktu."
      }
    ]
  }
};
