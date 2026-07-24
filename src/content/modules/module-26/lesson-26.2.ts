import type { Lesson } from '../../../renderer/types';
import theory26_2 from './lesson-26.2.md?raw';

export const lesson26_2: Lesson = {
  "id": "26.2",
  "moduleId": 26,
  "title": "Podstawy Appium",
  "description": "Zrozum architekturę automatyzacji mobilnej w oparciu o Appium 2. Poznaj model Klient-Serwer, instalację sterowników systemowych, konfigurację Capabilities oraz pisanie testów w TypeScript.",
  "order": 2,
  "difficulty": "advanced",
  "tags": ["mobile", "Appium", "UiAutomator2", "XCUITest", "capabilities", "WebdriverIO"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz opisać modularną architekturę Appium 2, instalować i zarządzać sterownikami, poprawnie konfigurować obiekt W3C Capabilities oraz pisać silnie otypowane scenariusze testów mobilnych w TypeScript.",
    "theory": theory26_2,
    "codeExamples": [
      `// Przykład konfiguracji i startu sesji Appium (Książka 3 - Uppadhyay)
const driver = await remote({
  port: 4723,
  capabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:app': './my-app.apk'
  }
});`
    ],
    "exercises": [
      {
        "id": "ex-26-2-1",
        "title": "Wdrożenie testu logowania w Appium",
        "description": "Zaimplementuj mobilny skrypt testowy w TypeScript używając biblioteki WebdriverIO. Skonfiguruj capabilities dla emulatora Androida, zainstaluj aplikację, uzupełnij formularz logowania i zweryfikuj sukces."
      }
    ],
    "quiz": [
      {
        "id": "q26-2-1",
        "question": "Które z poniższych stwierdzeń najlepiej opisuje zmianę wprowadzoną w wersji Appium 2.0 w porównaniu do wersji 1.x?",
        "options": [
          "W wersji Appium 2 serwer jest w pełni modularny - nie zawiera domyślnych sterowników (drivers), które deweloper musi instalować niezależnie w zależności od platformy",
          "Appium 2 wycofało obsługę języka JavaScript",
          "Wersja 2 działa wyłącznie w chmurze",
          "Appium 2 służy wyłącznie do testowania baz danych"
        ],
        "correctAnswer": 0,
        "explanation": "To kluczowa zmiana architektoniczna. Appium 2.0 oddzieliło serwer od sterowników. Kierując się zasadą minimalnej złożoności, deweloper sam decyduje i instaluje tylko te sterowniki, których potrzebuje (np. tylko uiautomator2)."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 6: Strategies for Scalable Test Automation (Mobile testing and Appium 2 integration)."
      }
    ],
    "tipsAndTricks": [
      "Stosuj identyfikatory Accessibility ID (unikalne nazwy etykiet dostępności) jako główny typ selektora w testach mobilnych. Są one wielokrotnie szybsze i stabilniejsze niż surowe XPath."
    ],
    "commonMistakes": [
      {
        "mistake": "Brak zamykania sesji sterownika (driver.deleteSession()) w przypadku błędów w teście",
        "solution": "Zawsze zawieraj kod zamykania sesji w sekcji finally lub afterEach, aby zwolnić pamięć emulatora i zablokowane porty."
      }
    ]
  }
};