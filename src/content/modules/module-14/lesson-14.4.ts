import type { Lesson } from "../../../renderer/types";
import theory14_4 from './lesson-14.4.md?raw';

export const lesson14_4: Lesson = {
  "id": "14.4",
  "moduleId": 14,
  "title": "Podstawy testów penetracyjnych",
  "description": "Podstawy testów penetracyjnych i security testingu QA: OWASP, IDOR, XSS, injection, cookies, nagłówki, rate limiting, ZAP, etyka i raportowanie podatności.",
  "order": 4,
  "difficulty": "advanced",
  "tags": [
    "security",
    "accessibility",
    "visual",
    "compliance"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz projektować testy dla obszaru „Podstawy testów penetracyjnych”, łącząc automatyzację z analizą ryzyka, dowodami audytowymi i świadomą interpretacją wyników.",
    "theory": theory14_4,
    "codeExamples": [
      "const response = await request.get(`/api/orders/${otherUserOrderId}`, {\n  headers: { Authorization: `Bearer ${regularUserToken}` },\n});\nexpect([403, 404]).toContain(response.status());",
      "const cookies = await page.context().cookies();\nconst session = cookies.find(cookie => cookie.name === 'session');\nexpect(session?.httpOnly).toBe(true);\nexpect(session?.secure).toBe(true);",
      "docker run -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \\\n  -t https://staging.example.test \\\n  -r zap-report.html"
],
    "exercises": [
      {
            "id": "ex-14-4-1",
            "title": "Ćwiczenie 1",
            "description": "Zaprojektuj test IDOR dla zasobu zamówienia i opisz oczekiwane statusy."
      },
      {
            "id": "ex-14-4-2",
            "title": "Ćwiczenie 2",
            "description": "Sprawdź flagi cookies sesyjnego w Playwright i opisz ryzyko braku HttpOnly/Secure."
      },
      {
            "id": "ex-14-4-3",
            "title": "Ćwiczenie 3",
            "description": "Przygotuj checklistę nagłówków bezpieczeństwa dla strony głównej i API."
      },
      {
            "id": "ex-14-4-4",
            "title": "Ćwiczenie 4",
            "description": "Opisz bezpieczny zakres testów OWASP ZAP baseline dla stagingu."
      },
      {
            "id": "ex-14-4-5",
            "title": "Ćwiczenie 5",
            "description": "Napisz raport podatności zawierający wpływ, dowody, kroki i rekomendację."
      }
],
    "quiz": [
      {
            "id": "q14-4-1",
            "question": "Czym różni się pentest od security testingu QA?",
            "options": [
                  "Pentest jest głębszą próbą wykorzystania podatności w uzgodnionym zakresie, QA security testing regularnie sprawdza znane ryzyka",
                  "Niczym",
                  "QA może atakować dowolną produkcję",
                  "Pentest nie wymaga zgody"
            ],
            "correctAnswer": 0,
            "explanation": "To sprawdza praktyczne rozumienie podstaw security testingu."
      },
      {
            "id": "q14-4-2",
            "question": "Co oznacza IDOR?",
            "options": [
                  "Dostęp do cudzego zasobu przez manipulację identyfikatorem",
                  "Błąd koloru UI",
                  "Brak testów jednostkowych",
                  "Format raportu"
            ],
            "correctAnswer": 0,
            "explanation": "To sprawdza praktyczne rozumienie podstaw security testingu."
      },
      {
            "id": "q14-4-3",
            "question": "Co jest ryzykiem XSS?",
            "options": [
                  "Wykonanie niechcianego JavaScriptu w kontekście aplikacji",
                  "Powolny indeks bazy",
                  "Brak screenshotu",
                  "Za duży viewport"
            ],
            "correctAnswer": 0,
            "explanation": "To sprawdza praktyczne rozumienie podstaw security testingu."
      },
      {
            "id": "q14-4-4",
            "question": "Która flaga cookie ogranicza dostęp JavaScriptu do cookie?",
            "options": [
                  "HttpOnly",
                  "Public",
                  "Readable",
                  "LocalOnly"
            ],
            "correctAnswer": 0,
            "explanation": "To sprawdza praktyczne rozumienie podstaw security testingu."
      },
      {
            "id": "q14-4-5",
            "question": "Dlaczego skaner nie zastępuje pentestu?",
            "options": [
                  "Nie rozumie pełnego kontekstu biznesowego i autoryzacji",
                  "Zawsze znajduje wszystko",
                  "Nie generuje raportów",
                  "Nie działa w CI"
            ],
            "correctAnswer": 0,
            "explanation": "To sprawdza praktyczne rozumienie podstaw security testingu."
      }
],
    "references": [
      {
            "title": "OWASP WSTG",
            "url": "https://owasp.org/www-project-web-security-testing-guide/",
            "description": "Oficjalny przewodnik testowania bezpieczeństwa aplikacji webowych."
      },
      {
            "title": "OWASP Top 10",
            "url": "https://owasp.org/www-project-top-ten/",
            "description": "Najważniejsze klasy ryzyk aplikacji webowych."
      },
      {
            "title": "OWASP API Security Top 10",
            "url": "https://owasp.org/www-project-api-security/",
            "description": "Najważniejsze ryzyka API."
      },
      {
            "title": "OWASP ZAP",
            "url": "https://www.zaproxy.org/",
            "description": "Skaner bezpieczeństwa używany do baseline scans i testów pomocniczych."
      },
      {
            "title": "FIRST CVSS",
            "url": "https://www.first.org/cvss/",
            "description": "System oceny powagi podatności."
      }
],
    "tipsAndTricks": [
      "Nie wykonuj agresywnych testów poza uzgodnionym zakresem.",
      "Najbardziej wartościowe automatyczne security tests często dotyczą autoryzacji i IDOR.",
      "Skaner traktuj jako pomoc, nie wyrocznię.",
      "Raport podatności powinien opisywać wpływ biznesowy i dowody."
],
    "commonMistakes": [
      {
            "mistake": "Testowanie bezpieczeństwa na produkcji bez zgody",
            "solution": "Ustal pisemny zakres, środowisko i zakazane techniki."
      },
      {
            "mistake": "Poleganie wyłącznie na skanerze",
            "solution": "Dodaj scenariusze autoryzacji, role, dane i testy manualne."
      },
      {
            "mistake": "Raport bez wpływu biznesowego",
            "solution": "Opisz, jakie dane lub funkcje są zagrożone i kto może wykorzystać błąd."
      }
]
  }
};
