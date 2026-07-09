import type { Lesson } from "../../../renderer/types";
import theory25_2 from './lesson-25.2.md?raw';

export const lesson25_2: Lesson = {
  "id": "25.2",
  "moduleId": 25,
  "title": "Podstawy sieci",
  "description": "Podstawy sieci dla testera: DNS, localhost, porty, HTTP, status codes, headers, cookies, TLS, CORS, proxy, VPN i narzędzia diagnostyczne.",
  "order": 2,
  "difficulty": "intermediate",
  "tags": [
    "networking",
    "dns",
    "tls",
    "proxy",
    "cors",
    "ciasteczka",
    "http"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji rozumiesz podstawowe warstwy komunikacji sieciowej, potrafisz diagnozować problemy DNS/TLS/CORS/ciasteczka i wiesz, jak oddzielić błąd aplikacji od błędu infrastruktury.",
    "theory": theory25_2,
    "codeExamples": [
      "curl -i https://staging.example.com/api/health\ndig staging.example.com\nopenssl s_client -connect staging.example.com:443 -servername staging.example.com\n# Compare browser trace network with curl output when CORS/cookies are suspected."
],
    "exercises": [
      {
            "id": "ex-auto-1",
            "title": "Ćwiczenie 1",
            "description": "Zaprojektuj scenariusz zgodny z oficjalną dokumentacją narzędzia i opisz cel testu."
      },
      {
            "id": "ex-auto-2",
            "title": "Ćwiczenie 2",
            "description": "Dodaj wariant negatywny oraz kryterium sukcesu/fail dla pipeline CI."
      },
      {
            "id": "ex-auto-3",
            "title": "Ćwiczenie 3",
            "description": "Przygotuj checklistę diagnostyczną i listę artefaktów potrzebnych po awarii."
      },
      {
            "id": "ex-auto-4",
            "title": "Ćwiczenie 4",
            "description": "Wskaż, które elementy powinny zostać zautomatyzowane, a które opisane jako manual/exploratory."
      }
],
    "quiz": [
      {
            "id": "q-auto-1",
            "question": "Co jest najważniejsze przy użyciu tego narzędzia?",
            "options": [
                  "Jasny cel, kontrolowane dane i interpretowalne wyniki",
                  "Uruchomienie bez asercji",
                  "Maksymalna liczba opcji",
                  "Brak raportu"
            ],
            "correctAnswer": 0,
            "explanation": "Poprawna odpowiedź wynika z dobrych praktyk danego narzędzia."
      },
      {
            "id": "q-auto-2",
            "question": "Co powinno trafić do CI?",
            "options": [
                  "Mały, stabilny zestaw z jasnymi progami i artefaktami",
                  "Najcięższy test bez limitów",
                  "Sekrety w logach",
                  "Testy bez właściciela"
            ],
            "correctAnswer": 0,
            "explanation": "Poprawna odpowiedź wynika z dobrych praktyk danego narzędzia."
      },
      {
            "id": "q-auto-3",
            "question": "Co jest antywzorcem?",
            "options": [
                  "Ukrywanie problemu zamiast diagnozy",
                  "Jawne kryteria sukcesu",
                  "Artefakty po awarii",
                  "Dokumentacja środowiska"
            ],
            "correctAnswer": 0,
            "explanation": "Poprawna odpowiedź wynika z dobrych praktyk danego narzędzia."
      },
      {
            "id": "q-auto-4",
            "question": "Po co aktualne oficjalne źródła?",
            "options": [
                  "Aby unikać przestarzałych API i błędnych praktyk",
                  "Aby zastąpić review",
                  "Aby nie pisać testów",
                  "Aby wyłączyć lint"
            ],
            "correctAnswer": 0,
            "explanation": "Poprawna odpowiedź wynika z dobrych praktyk danego narzędzia."
      }
],
    "references": [
      {
        "title": "MDN HTTP",
        "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP",
        "description": "HTTP, statusy, nagłówki i podstawy web."
      },
      {
        "title": "MDN CORS",
        "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS",
        "description": "CORS w przeglądarce."
      },
      {
        "title": "Docker Networking",
        "url": "https://docs.docker.com/network/",
        "description": "Sieci kontenerów i nazwy usług."
      }
    ],
    "tipsAndTricks": [
      "Zaczynaj od celu i ryzyka, nie od składni narzędzia.",
      "Publikuj artefakty diagnostyczne w CI.",
      "Nie używaj danych produkcyjnych ani sekretów w przykładach.",
      "Porównuj wyniki z baseline i oficjalną dokumentacją."
],
    "commonMistakes": [
      {
            "mistake": "Brak celu testu",
            "solution": "Zapisz hipotezę i kryteria sukcesu przed implementacją."
      },
      {
            "mistake": "Brak izolacji danych",
            "solution": "Użyj runId, osobnych kont lub kontrolowanego datasetu."
      },
      {
            "mistake": "Brak artefaktów",
            "solution": "Zapisuj raporty, logi, konfigurację i metryki jako artefakty."
      }
]
  }
};
