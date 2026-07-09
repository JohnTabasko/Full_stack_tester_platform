import type { Lesson } from "../../../renderer/types";
import theory27_1 from './lesson-27.1.md?raw';

export const lesson27_1: Lesson = {
  "id": "27.1",
  "moduleId": 27,
  "title": "Sztuczna inteligencja w analizie wymagań i ryzyk",
  "description": "Promptowanie, identyfikacja luk w wymaganiach, pomysły testowe, założenia, kryteria akceptacji i review ryzyk z pomocą AI.",
  "order": 1,
  "difficulty": "intermediate",
  "tags": [
    "ai",
    "requirements",
    "risk-analysis",
    "prompting",
    "test-ideas"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz używać AI do rozszerzania analizy wymagań, identyfikacji luk, generowania hipotez testowych i przygotowania pytań do interesariuszy bez rezygnacji z własnej odpowiedzialności za ocenę ryzyka.",
    "theory": theory27_1,
    "codeExamples": [
      "# Przykład promptu\nJesteś doświadczonym testerem full stack. Przeanalizuj wymaganie:\n„Użytkownik może wyeksportować raport transakcji do CSV”.\n\nZwróć wynik w tabeli:\n- obszar ryzyka,\n- pytanie do product ownera,\n- proponowany test,\n- sugerowany poziom testu,\n- priorytet.\n\nUwzględnij bezpieczeństwo, dane, wydajność, dostępność i scenariusze negatywne.\n",
      "type AiSuggestion = {\n  risk: string;\n  question: string;\n  proposedTest: string;\n  level: 'unit' | 'api' | 'e2e' | 'exploratory' | 'security';\n  accepted: boolean;\n  reason: string;\n};\n"
    ],
    "exercises": [
      {
        "id": "ex-27-1-1",
        "title": "Prompt z kryteriami",
        "description": "Napisz prompt dla tematu „Sztuczna inteligencja w analizie wymagań i ryzyk”, zawierający kontekst, ograniczenia i format odpowiedzi."
      },
      {
        "id": "ex-27-1-2",
        "title": "Review odpowiedzi AI",
        "description": "Przeanalizuj wygenerowane przypadki testowe i wskaż luki, nadmiary oraz ryzyka bezpieczeństwa."
      },
      {
        "id": "ex-27-1-3",
        "title": "Anonimizacja danych",
        "description": "Przepisz log produkcyjny tak, aby był użyteczny diagnostycznie, ale nie zawierał danych wrażliwych."
      },
      {
        "id": "ex-27-1-4",
        "title": "Human-in-the-loop",
        "description": "Opisz, które decyzje może wspierać AI, a które muszą pozostać po stronie testera lub zespołu."
      },
      {
        "id": "ex-27-1-5",
        "title": "Walidacja wyniku",
        "description": "Zaprojektuj checklistę oceny testów, danych lub analizy wygenerowanej przez AI."
      },
      {
        "id": "ex-27-1-6",
        "title": "Ryzyka AI",
        "description": "Wypisz ryzyka: halucynacja, prywatność, bias, nieaktualna wiedza, brak deterministyczności i zaproponuj mitygacje."
      }
    ],
    "quiz": [
      {
        "id": "q27-1-1",
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
        "id": "q27-1-2",
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
        "id": "q27-1-3",
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
        "id": "q27-1-4",
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
        "id": "q27-1-5",
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
        "id": "q27-1-6",
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
        "id": "q27-1-7",
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
        "id": "q27-1-8",
        "question": "Najważniejszy wniosek z lekcji „Sztuczna inteligencja w analizie wymagań i ryzyk” to:",
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
