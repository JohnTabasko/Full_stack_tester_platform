import type { Lesson } from "../../../renderer/types";
import theory27_4 from './lesson-27.4.md?raw';

export const lesson27_4: Lesson = {
  "id": "27.4",
  "moduleId": 27,
  "title": "Ryzyka sztucznej inteligencji: prywatność, halucynacje i zarządzanie",
  "description": "Bezpieczeństwo danych, redakcja sekretów, deterministyczność, human-in-the-loop, polityki zespołowe i odpowiedzialne użycie AI.",
  "order": 4,
  "difficulty": "intermediate",
  "tags": [
    "ai-zarządzanie",
    "privacy",
    "security",
    "hallucinations",
    "responsible-ai"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji rozumiesz najważniejsze ryzyka użycia AI w testowaniu, potrafisz zaproponować zasady zarządzanie i wiesz, jak chronić dane, sekrety oraz jakość decyzji technicznych.",
    "theory": theory27_4,
    "codeExamples": [
      "# Minimalna polityka użycia AI w zespole QA\n- Nie wklejamy sekretów, tokenów ani danych osobowych.\n- Logi produkcyjne anonimizujemy przed analizą.\n- Każdy test wygenerowany przez AI przechodzi code review.\n- Sugestie techniczne weryfikujemy w dokumentacji lub eksperymencie.\n- Decyzje o ryzyku i release pozostają po stronie zespołu.\n",
      "type AiReviewChecklist = {\n  noSecrets: boolean;\n  verifiedAgainstDocs: boolean;\n  hasMeaningfulAssertions: boolean;\n  matchesProjectArchitecture: boolean;\n  reviewedByHuman: boolean;\n};\n"
    ],
    "exercises": [
      {
        "id": "ex-27-4-1",
        "title": "Prompt z kryteriami",
        "description": "Napisz prompt dla tematu „Ryzyka sztucznej inteligencji: prywatność, halucynacje i zarządzanie”, zawierający kontekst, ograniczenia i format odpowiedzi."
      },
      {
        "id": "ex-27-4-2",
        "title": "Review odpowiedzi AI",
        "description": "Przeanalizuj wygenerowane przypadki testowe i wskaż luki, nadmiary oraz ryzyka bezpieczeństwa."
      },
      {
        "id": "ex-27-4-3",
        "title": "Anonimizacja danych",
        "description": "Przepisz log produkcyjny tak, aby był użyteczny diagnostycznie, ale nie zawierał danych wrażliwych."
      },
      {
        "id": "ex-27-4-4",
        "title": "Human-in-the-loop",
        "description": "Opisz, które decyzje może wspierać AI, a które muszą pozostać po stronie testera lub zespołu."
      },
      {
        "id": "ex-27-4-5",
        "title": "Walidacja wyniku",
        "description": "Zaprojektuj checklistę oceny testów, danych lub analizy wygenerowanej przez AI."
      },
      {
        "id": "ex-27-4-6",
        "title": "Ryzyka AI",
        "description": "Wypisz ryzyka: halucynacja, prywatność, bias, nieaktualna wiedza, brak deterministyczności i zaproponuj mitygacje."
      }
    ],
    "quiz": [
      {
        "id": "q27-4-1",
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
        "id": "q27-4-2",
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
        "id": "q27-4-3",
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
        "id": "q27-4-4",
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
        "id": "q27-4-5",
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
        "id": "q27-4-6",
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
        "id": "q27-4-7",
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
        "id": "q27-4-8",
        "question": "Najważniejszy wniosek z lekcji „Ryzyka sztucznej inteligencji: prywatność, halucynacje i zarządzanie” to:",
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
