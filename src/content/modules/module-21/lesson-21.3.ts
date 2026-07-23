import type { Lesson } from "../../../renderer/types";
import theory21_3 from './lesson-21.3.md?raw';

export const lesson21_3: Lesson = {
  "id": "21.3",
  "moduleId": 21,
  "title": "Wersjonowanie API i kompatybilność wsteczna",
  "description": "Wersjonowanie API i eventów, kompatybilność wsteczna, SemVer, polityka deprecacji, breaking changes i telemetryka użycia kontraktu.",
  "order": 3,
  "difficulty": "advanced",
  "tags": [
    "api-versioning",
    "backward-compatibility",
    "breaking-change",
    "deprecation"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz ocenić, czy zmiana API jest łamiąca, zaplanować jej bezpieczne wdrożenie oraz zaprojektować politykę deprecacji i wersjonowania kontraktów.",
    "theory": theory21_3,
    "codeExamples": [
      "// Macierz oceny zmian API.\ntype ApiChange = {\n  description: string;\n  breaking: boolean;\n  mitigation: string;\n};\n\nconst changes: ApiChange[] = [\n  { description: 'Add optional field totalGross', breaking: false, mitigation: 'Document field and add examples' },\n  { description: 'Remove field total', breaking: true, mitigation: 'Deprecate first and monitor usage' },\n  { description: 'Change status enum paid -> captured', breaking: true, mitigation: 'Support both values during migration' },\n];\n",
      "Deprecation: true\nSunset: 2026-12-31\nLink: <https://docs.example.test/migration/total-gross>; rel=\"deprecation\"\n"
    ],
    "exercises": [
      {
        "id": "ex-21-3-1",
        "title": "Mapa konsumentów",
        "description": "Dla API z tematu „Wersjonowanie API i kompatybilność wsteczna” wypisz konsumentów i pola, których naprawdę potrzebują."
      },
      {
        "id": "ex-21-3-2",
        "title": "Scenariusze negatywne",
        "description": "Dodaj do kontraktu odpowiedzi 400, 401, 403 i 404 wraz z przykładowym body błędu."
      },
      {
        "id": "ex-21-3-3",
        "title": "Breaking czy non-breaking",
        "description": "Oceń dziesięć przykładowych zmian API i oznacz, które są łamiące."
      },
      {
        "id": "ex-21-3-4",
        "title": "Walidacja w CI",
        "description": "Zaprojektuj etap pipeline’u, który blokuje PR przy niezgodności kontraktu."
      },
      {
        "id": "ex-21-3-5",
        "title": "Review kontraktu",
        "description": "Przygotuj checklistę review OpenAPI/Pact dla nowego endpointu."
      },
      {
        "id": "ex-21-3-6",
        "title": "Plan wersjonowania",
        "description": "Opisz, jak bezpiecznie wycofać używane pole z publicznego API."
      }
    ],
    "quiz": [
      {
        "id": "q21-3-1",
        "question": "Czym jest kontrakt API?",
        "options": [
          "Umową opisującą oczekiwany sposób komunikacji między systemami",
          "Logiem z produkcji",
          "Zrzutem ekranu interfejs użytkownika",
          "Dowolnym testem E2E"
        ],
        "correctAnswer": 0,
        "explanation": "Kontrakt określa strukturę, znaczenie i zasady komunikacji między konsumentem i dostawcą."
      },
      {
        "id": "q21-3-2",
        "question": "Dlaczego sama dokumentacja nie wystarcza?",
        "options": [
          "Bo może rozjechać się z implementacją",
          "Bo API nie potrzebuje dokumentacji",
          "Bo dokumentacja zawsze spowalnia testy",
          "Bo zastępuje monitoring"
        ],
        "correctAnswer": 0,
        "explanation": "Kontrakt musi być wykonywalny i walidowany, inaczej szybko staje się nieaktualny."
      },
      {
        "id": "q21-3-3",
        "question": "Co jest przykładem zmiana niekompatybilna?",
        "options": [
          "Usunięcie pola używanego przez konsumenta",
          "Dodanie opcjonalnego pola",
          "Poprawienie literówki w opisie",
          "Dodanie przykładu do dokumentacji"
        ],
        "correctAnswer": 0,
        "explanation": "Usunięcie lub zmiana semantyki używanego pola może złamać konsumenta."
      },
      {
        "id": "q21-3-4",
        "question": "Kiedy contract test daje największą wartość?",
        "options": [
          "Gdy wiele usług rozwija się niezależnie",
          "Gdy aplikacja nie ma API",
          "Wyłącznie w testach wizualnych",
          "Tylko przy CSS"
        ],
        "correctAnswer": 0,
        "explanation": "Kontrakty ograniczają ryzyko integracji między zespołami i usługami."
      },
      {
        "id": "q21-3-5",
        "question": "Co powinien zawierać kontrakt poza 200 OK?",
        "options": [
          "Błędy walidacji, autoryzację i format response",
          "Kolor przycisku",
          "Nazwę branchy",
          "Instrukcję instalacji IDE"
        ],
        "correctAnswer": 0,
        "explanation": "Konsumenci muszą wiedzieć, jak API zachowuje się w scenariuszach negatywnych."
      },
      {
        "id": "q21-3-6",
        "question": "Co jest celem governance API?",
        "options": [
          "Utrzymanie spójnych zasad projektowania, wersjonowania i kontroli zmian API",
          "Ręczne klikanie endpointów",
          "Wyłączenie review",
          "Zastąpienie testów unit"
        ],
        "correctAnswer": 0,
        "explanation": "Governance porządkuje ewolucję API w skali organizacji."
      },
      {
        "id": "q21-3-7",
        "question": "Dlaczego warto publikować kontrakty w CI?",
        "options": [
          "Aby inne zespoły mogły je zweryfikować przed integracją",
          "Aby ukryć zmiany",
          "Aby ominąć review",
          "Aby zmniejszyć czytelność"
        ],
        "correctAnswer": 0,
        "explanation": "Publikacja kontraktów umożliwia automatyczną weryfikację zgodności providerów."
      },
      {
        "id": "q21-3-8",
        "question": "Jaki jest najważniejszy rezultat lekcji „Wersjonowanie API i kompatybilność wsteczna”?",
        "options": [
          "Umiejętność myślenia o API jako o wersjonowanej umowie",
          "Zapamiętanie jednego narzędzia",
          "Rezygnacja z testów API",
          "Przeniesienie wszystkiego do E2E"
        ],
        "correctAnswer": 0,
        "explanation": "Najważniejsze jest rozumienie kontraktu i jego wpływu na stabilność integracji."
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
        "title": "OpenAPI Specification",
        "url": "https://spec.openapis.org/oas/latest.html",
        "description": "Wersjonowanie i deprecacje w OpenAPI."
      },
      {
        "title": "SemVer",
        "url": "https://semver.org/",
        "description": "Semantic Versioning."
      },
      {
        "title": "AsyncAPI",
        "url": "https://www.asyncapi.com/docs",
        "description": "Wersjonowanie komunikatów asynchronicznych."
      }
    ],
    "tipsAndTricks": [
      "Zawsze opieraj architekturę testów na zasadach SOLID, unikając przedwczesnej abstrakcji zgodnie z zasadą WET (Write Everything Twice) z podręczników 2026.",
      
      "Kontrakt API powinien być traktowany jak publiczna umowa, nie jak dokumentacja generowana po fakcie.",
      "Breaking change to nie tylko usunięcie pola; zmianą łamiącą może być też zawężenie zakresu wartości albo zmiana semantyki błędu.",
      "Test kontraktowy nie zastępuje testu bezpieczeństwa ani wydajności, lecz chroni zgodność oczekiwań między usługami.",
      "W pipeline warto rozróżniać błąd implementacji od błędu samej specyfikacji."
    ],
    "commonMistakes": [
      {
        "mistake": "Specyfikacja nieaktualna wobec implementacji",
        "solution": "Waliduj requesty i response’y w CI oraz wymagaj aktualizacji OpenAPI w PR."
      },
      {
        "mistake": "Kontrakt opisuje tylko happy path",
        "solution": "Dodaj statusy błędów, formaty walidacji i przypadki braku uprawnień."
      },
      {
        "mistake": "Brak właściciela kontraktu",
        "solution": "Ustal odpowiedzialność za wersjonowanie i review zmian API."
      },
      {
        "mistake": "Consumer testuje szczegóły providera",
        "solution": "Kontrakt powinien opisywać potrzebne zachowanie, nie wewnętrzną implementację usługi."
      }
    ]
  }
};
