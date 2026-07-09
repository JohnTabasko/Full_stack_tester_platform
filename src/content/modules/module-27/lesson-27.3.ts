import type { Lesson } from "../../../renderer/types";
import theory27_3 from './lesson-27.3.md?raw';

export const lesson27_3: Lesson = {
  "id": "27.3",
  "moduleId": 27,
  "title": "Debugowanie wspierane przez sztuczną inteligencję i analiza logów",
  "description": "AI-assisted debugging: analiza logów, trace, stack trace, hipotezy, redakcja danych, evals jakości odpowiedzi i human verification.",
  "order": 3,
  "difficulty": "intermediate",
  "tags": [
    "ai-debugging",
    "logs",
    "trace-analysis",
    "flaky-tests",
    "root-cause"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz bezpiecznie używać AI do porządkowania logów, generowania hipotez przyczyn awarii i analizy niestabilnych testów, zachowując kontrolę nad prywatnością oraz weryfikacją dowodów.",
    "theory": theory27_3,
    "codeExamples": [
      "# Prompt do analizy awarii\nPrzeanalizuj zanonimizowany log i stack trace.\nZwróć:\n1. trzy najbardziej prawdopodobne hipotezy,\n2. dowód z logu dla każdej hipotezy,\n3. dodatkowy eksperyment diagnostyczny,\n4. możliwą poprawkę testu lub aplikacji.\nNie zakładaj faktów, których nie ma w logu.\n",
      "function redactLog(log: string): string {\n  return log\n    .replace(/Bearer [A-Za-z0-9._-]+/g, 'Bearer <REDACTED>')\n    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}/gi, '<EMAIL>')\n    .replace(/card_[a-zA-Z0-9]+/g, 'card_<REDACTED>');\n}\n"
    ],
    "exercises": [
      {
        "id": "ex-27-3-1",
        "title": "Prompt z kryteriami",
        "description": "Napisz prompt dla tematu „Debugowanie wspierane przez sztuczną inteligencję i analiza logów”, zawierający kontekst, ograniczenia i format odpowiedzi."
      },
      {
        "id": "ex-27-3-2",
        "title": "Review odpowiedzi AI",
        "description": "Przeanalizuj wygenerowane przypadki testowe i wskaż luki, nadmiary oraz ryzyka bezpieczeństwa."
      },
      {
        "id": "ex-27-3-3",
        "title": "Anonimizacja danych",
        "description": "Przepisz log produkcyjny tak, aby był użyteczny diagnostycznie, ale nie zawierał danych wrażliwych."
      },
      {
        "id": "ex-27-3-4",
        "title": "Human-in-the-loop",
        "description": "Opisz, które decyzje może wspierać AI, a które muszą pozostać po stronie testera lub zespołu."
      },
      {
        "id": "ex-27-3-5",
        "title": "Walidacja wyniku",
        "description": "Zaprojektuj checklistę oceny testów, danych lub analizy wygenerowanej przez AI."
      },
      {
        "id": "ex-27-3-6",
        "title": "Ryzyka AI",
        "description": "Wypisz ryzyka: halucynacja, prywatność, bias, nieaktualna wiedza, brak deterministyczności i zaproponuj mitygacje."
      }
    ],
    "quiz": [
      {
        "id": "q27-3-1",
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
        "id": "q27-3-2",
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
        "id": "q27-3-3",
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
        "id": "q27-3-4",
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
        "id": "q27-3-5",
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
        "id": "q27-3-6",
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
        "id": "q27-3-7",
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
        "id": "q27-3-8",
        "question": "Najważniejszy wniosek z lekcji „Debugowanie wspierane przez sztuczną inteligencję i analiza logów” to:",
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
        "title": "OWASP LLM Top 10",
        "url": "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
        "description": "Bezpieczeństwo i ryzyka LLM."
      },
      {
        "title": "OpenTelemetry",
        "url": "https://opentelemetry.io/docs/",
        "description": "Telemetry data: traces, metrics, logs."
      },
      {
        "title": "Playwright Trace Viewer",
        "url": "https://playwright.dev/docs/trace-viewer",
        "description": "Trace jako źródło dowodów."
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
