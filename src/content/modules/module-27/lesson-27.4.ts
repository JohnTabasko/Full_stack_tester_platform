import type { Lesson } from '../../../renderer/types';
import theory27_4 from './lesson-27.4.md?raw';

export const lesson27_4: Lesson = {
  "id": "27.4",
  "moduleId": 27,
  "title": "Ryzyka sztucznej inteligencji: prywatność, halucynacje i zarządzanie",
  "description": "Opanuj zasady bezpiecznego korzystania z AI (AI Governance). Poznaj ryzyka wycieku danych (Data Leakage), przeciwdziałanie halucynacjom kodu, audyt typowania oraz podatności OWASP Top 10 dla aplikacji LLM.",
  "order": 4,
  "difficulty": "advanced",
  "tags": ["AI-risks", "privacy", "hallucinations", "OWASP-LLM", "governance", "security"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz identyfikować i neutralizować ryzyka prawne i techniczne związane ze stosowaniem sztucznej inteligencji, bezpiecznie anonimizować dane testowe, diagnozować halucynacje w kodzie oraz stosować standardy bezpieczeństwa OWASP LLM.",
    "theory": theory27_4,
    "codeExamples": [
      `// Przykład bezpiecznej anonimizacji danych przed wysyłką (Książka 3 - Uppadhyay)
const sanitizedPayload = {
  username: "ANONYMOUS_USER", // Usuń wrażliwe imiona i nazwiska!
  apiKey: process.env.API_KEY // Nigdy nie przesyłaj rzeczywistego klucza w tekście!
};`
    ],
    "exercises": [
      {
        "id": "ex-27-4-1",
        "title": "Zaprojektowanie polityki bezpieczeństwa AI",
        "description": "Zaprojektuj dla swojego zespołu QA rygorystyczny dokument polityki korzystania z asystentów AI (AI Governance Policy) określający, jakie dane (kod, logi, błędy) mogą być przesyłane do zewnętrznych modeli, a jakie wymagają bezwzględnej anonimizacji."
      }
    ],
    "quiz": [
      {
        "id": "q27-4-1",
        "question": "Które zjawisko określamy mianem 'halucynacji' w kontekście generowania kodu testów Playwright przez modele sztucznej inteligencji (LLM)?",
        "options": [
          "Sytuację, w której model generuje pozornie poprawnie wyglądający kod, ale korzystający z nieistniejących lub przestarzałych metod API oraz zmyślonych selektorów",
          "Automatyczne tłumaczenie kodu na język hiszpański",
          "Błąd braku pamięci RAM na serwerze",
          "Sytuację, w której testy wykonują się zbyt szybko"
        ],
        "correctAnswer": 0,
        "explanation": "Modele LLM działają na bazie prawdopodobieństwa statystycznego i 'przewidują' wygląd kodu, co sprawia, że potrafią wymyślać nieistniejące metody lub przestarzałe interfejsy, które nie przejdą kompilacji TypeScript."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 12: Reflections on Test Automation (AI risks & data privacy)."
      }
    ],
    "tipsAndTricks": [
      "Korzystaj z oficjalnych rozszerzeń Copilot for Business lub kont Enterprise, które gwarantują w umowie, że przesyłany kod aplikacji jest odizolowany i nigdy nie posłuży do trenowania publicznych modeli."
    ],
    "commonMistakes": [
      {
        "mistake": "Wklejanie rzeczywistych logów produkcyjnych z danymi osobowymi klientów (RODO) do darmowych, publicznych wersji czatów AI",
        "solution": "Bezwzględnie usuń wszelkie dane osobowe (imiona, e-maile, IP) przed wysłaniem logów do analizy przez model LLM."
      }
    ]
  }
};