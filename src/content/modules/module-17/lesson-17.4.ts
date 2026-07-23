import type { Lesson } from "../../../renderer/types";
import theory17_4 from './lesson-17.4.md?raw';

export const lesson17_4: Lesson = {
  "id": "17.4",
  "moduleId": 17,
  "title": "Testowanie eksploracyjne i raportowanie błędów",
  "description": "Testowanie eksploracyjne, session-based testing, heurystyki, severity vs priority, reprodukcja i profesjonalne raportowanie defektów.",
  "order": 4,
  "difficulty": "beginner",
  "tags": [
    "exploratory-testing",
    "bug-report",
    "heuristics",
    "session-based-testing",
    "defects"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz przeprowadzić sesję testowania eksploracyjnego, używać heurystyk do odkrywania ryzyk oraz napisać raport błędu, który umożliwia szybką reprodukcję i właściwą decyzję priorytetową.",
    "theory": theory17_4,
    "codeExamples": [
      "# Przykład charteru sesji eksploracyjnej\n\n## Misja\nZbadać odporność koszyka na równoległe działania użytkownika i problemy sieciowe.\n\n## Zakres\n- zmiana ilości produktów,\n- odświeżanie strony,\n- wolna sieć,\n- ponowienie żądań,\n- spójność interfejsu użytkownika/API/baza danych.\n\n## Czas\n60 minut.\n\n## Oczekiwane artefakty\nNotatki, lista błędów, pytania do PO, rekomendacje automatyzacji.\n",
      "# Szablon raportu błędu\n\n## Tytuł\nKoszyk przywraca poprzednią ilość produktu po szybkim odświeżeniu strony.\n\n## Środowisko\nstaging, Chrome 124, użytkownik testowy qa+cart@example.com\n\n## Kroki reprodukcji\n1. Zaloguj się jako użytkownik testowy.\n2. Dodaj produkt „Laptop Pro” do koszyka.\n3. Zmień ilość z 1 na 2.\n4. Natychmiast odśwież stronę.\n\n## Wynik aktualny\nKoszyk pokazuje ilość 1, mimo że żądanie aktualizacji zwróciło 200.\n\n## Wynik oczekiwany\nKoszyk powinien zachować ilość 2 albo pokazać czytelny błąd synchronizacji.\n\n## Dowody\ntrace.zip, screenshot, correlationId=cart-2026-06-19-001\n"
    ],
    "exercises": [
      {
        "id": "ex-17-4-1",
        "title": "Charter eksploracyjny",
        "description": "Napisz charter sesji dla funkcji resetu hasła, uwzględniając ryzyka bezpieczeństwa i użyteczności."
      },
      {
        "id": "ex-17-4-2",
        "title": "Heurystyki",
        "description": "Wybierz pięć heurystyk i zastosuj je do testowania profilu użytkownika."
      },
      {
        "id": "ex-17-4-3",
        "title": "Raport błędu",
        "description": "Napisz profesjonalny bug report dla błędu: użytkownik widzi dane innego konta po zmianie organizacji."
      },
      {
        "id": "ex-17-4-4",
        "title": "Minimalna reprodukcja",
        "description": "Skróć długi opis błędu do minimalnych kroków reprodukcji bez utraty istotnego kontekstu."
      },
      {
        "id": "ex-17-4-5",
        "title": "Severity vs priorytet",
        "description": "Dla pięciu błędów zaproponuj waga błędu i priorytet, a następnie uzasadnij różnice."
      },
      {
        "id": "ex-17-4-6",
        "title": "Automatyzacja po eksploracji",
        "description": "Po sesji eksploracyjnej wybierz dwa odkrycia, które warto zamienić w testy automatyczne."
      }
    ],
    "quiz": [
      {
        "id": "q17-4-1",
        "question": "Czym jest testowanie eksploracyjne?",
        "options": [
          "Losowym klikaniem bez celu",
          "Jednoczesnym projektowaniem, wykonywaniem i interpretacją testów w ramach misji",
          "Wyłącznie automatyzacją regresji",
          "Rodzajem testu jednostkowego"
        ],
        "correctAnswer": 1,
        "explanation": "Eksploracja jest zdyscyplinowaną aktywnością poznawczą, a nie przypadkowym używaniem aplikacji."
      },
      {
        "id": "q17-4-2",
        "question": "Po co stosuje się charter sesji?",
        "options": [
          "Aby ograniczyć eksplorację do celu i ułatwić raportowanie",
          "Aby zastąpić wszystkie testy automatyczne",
          "Aby ukryć wyniki sesji",
          "Aby mierzyć wyłącznie czas pracy"
        ],
        "correctAnswer": 0,
        "explanation": "Charter nadaje sesji kierunek i pozwala ocenić, co zostało zbadane."
      },
      {
        "id": "q17-4-3",
        "question": "Który element jest konieczny w dobrym bug reporcie?",
        "options": [
          "Opinia, kto zawinił",
          "Kroki reprodukcji, wynik aktualny, wynik oczekiwany i dowody",
          "Wyłącznie screenshot",
          "Długa historia projektu"
        ],
        "correctAnswer": 1,
        "explanation": "Raport ma umożliwić reprodukcję i decyzję, nie wskazywać winnych."
      },
      {
        "id": "q17-4-4",
        "question": "Czym różni się waga błędu od priorytet?",
        "options": [
          "Niczym",
          "Severity opisuje dotkliwość, priorytet pilność naprawy",
          "Priority jest zawsze ważniejsze",
          "Severity dotyczy tylko interfejsu użytkownika"
        ],
        "correctAnswer": 1,
        "explanation": "Błąd może być dotkliwy, ale niepilny, albo mało dotkliwy, lecz pilny biznesowo."
      },
      {
        "id": "q17-4-5",
        "question": "Która heurystyka pomaga badać operacje na danych?",
        "options": [
          "CRUD",
          "Kolor przycisku",
          "Rozmiar monitora",
          "Nazwa branchy"
        ],
        "correctAnswer": 0,
        "explanation": "CRUD przypomina o tworzeniu, odczycie, aktualizacji i usuwaniu danych."
      },
      {
        "id": "q17-4-6",
        "question": "Co warto zrobić po znalezieniu błędu eksploracyjnego?",
        "options": [
          "Zignorować, jeśli nie ma testu automatycznego",
          "Ocenić ryzyko i rozważyć dodanie automatycznej regresji",
          "Natychmiast automatyzować wszystko",
          "Usunąć notatki"
        ],
        "correctAnswer": 1,
        "explanation": "Nie każde odkrycie wymaga automatyzacji, ale ważne regresje powinny otrzymać kontrolę."
      },
      {
        "id": "q17-4-7",
        "question": "Jakie dowody są szczególnie pomocne przy błędach rozproszonych?",
        "options": [
          "Tylko opis słowny",
          "Correlation ID, trace, logi i request/response",
          "Kolor tła",
          "Informacja, że tester jest pewien"
        ],
        "correctAnswer": 1,
        "explanation": "W systemach rozproszonych identyfikatory korelacyjne i logi pozwalają prześledzić przepływ."
      },
      {
        "id": "q17-4-8",
        "question": "Dlaczego eksploracja uzupełnia automatyzację?",
        "options": [
          "Bo automatyzacja odpowiada głównie na znane pytania, a eksploracja odkrywa nowe",
          "Bo automatyzacja jest zawsze błędna",
          "Bo eksploracja nie wymaga umiejętności",
          "Bo testy manualne zawsze wystarczą"
        ],
        "correctAnswer": 0,
        "explanation": "Eksploracja pomaga odkrywać nieznane ryzyka, które później mogą zostać objęte automatyzacją."
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
        "title": "ISTQB CTFL",
        "url": "https://www.istqb.org/certifications/certified-tester-foundation-level",
        "description": "Podstawowe pojęcia defektów, raportowania i technik testowania."
      },
      {
        "title": "OWASP WSTG",
        "url": "https://owasp.org/www-project-web-security-testing-guide/",
        "description": "Heurystyki i podejście eksploracyjne w testowaniu bezpieczeństwa."
      },
      {
        "title": "Atlassian Bug Report",
        "url": "https://www.atlassian.com/agile/software-development/bug-report",
        "description": "Praktyczny opis elementów dobrego raportu błędu."
      }
    ],
    "tipsAndTricks": [
      "Zawsze opieraj architekturę testów na zasadach SOLID, unikając przedwczesnej abstrakcji zgodnie z zasadą WET (Write Everything Twice) z podręczników 2026.",
      
      "Przed sesją eksploracyjną zapisz misję jednym zdaniem. To chroni przed przypadkowym klikaniem.",
      "Notuj pytania, nie tylko błędy. Dobre pytanie do product ownera bywa cenniejsze niż kolejny screenshot.",
      "W bug reporcie oddziel obserwacje od hipotez. Hipoteza może pomóc, ale nie powinna udawać faktu.",
      "Jeżeli błąd jest trudny do reprodukcji, zapisuj częstotliwość, warunki środowiska i dane wejściowe."
    ],
    "commonMistakes": [
      {
        "mistake": "Eksploracja bez celu",
        "solution": "Zdefiniuj charter, ogranicz czas i przygotuj podsumowanie sesji."
      },
      {
        "mistake": "Raport błędu bez kroków reprodukcji",
        "solution": "Podaj minimalne kroki, środowisko, dane i dowody diagnostyczne."
      },
      {
        "mistake": "Mylenie waga błędu z priorytet",
        "solution": "Oddziel dotkliwość problemu od pilności jego naprawy."
      },
      {
        "mistake": "Brak decyzji po sesji",
        "solution": "Po eksploracji wskaż, co automatyzować, co doprecyzować i co obserwować."
      }
    ]
  }
};
