import type { Lesson } from "../../../renderer/types";
import theory26_4 from './lesson-26.4.md?raw';

export const lesson26_4: Lesson = {
  "id": "26.4",
  "moduleId": 26,
  "title": "Uprawnienia, linki głębokie i tryb offline",
  "description": "Mobile permissions, deep links, offline, app lifecycle, background/foreground, push notifications, restore state i testowanie fallbacków.",
  "order": 4,
  "difficulty": "advanced",
  "tags": [
    "permissions",
    "deep-links",
    "offline",
    "push-notifications",
    "sync",
    "mobile"
  ],
  "content": {
    "objective": "Po ukończeniu lekcji potrafisz testować przepływy zależne od systemu operacyjnego: uprawnienia, deep linki, powiadomienia, tryb offline i synchronizację danych po odzyskaniu sieci.",
    "theory": theory26_4,
    "codeExamples": [
      "// Pseudokod testu deep linku.\nawait device.openDeepLink('myapp://orders/ord-123');\nawait expect(app.getByText('Szczegóły zamówienia')).toBeVisible();\nawait expect(app.getByText('ord-123')).toBeVisible();\n",
      "// Pseudokod offline sync.\nawait device.setNetwork('offline');\nawait app.scanPackage('PKG-1');\nawait expect(app.getByText('Oczekuje na synchronizację')).toBeVisible();\n\nawait device.setNetwork('online');\nawait expect.poll(() => api.packageStatus('PKG-1')).toBe('synced');\n"
    ],
    "exercises": [
      {
        "id": "ex-26-4-1",
        "title": "Macierz urządzeń",
        "description": "Dla tematu „Uprawnienia, linki głębokie i tryb offline” zaprojektuj minimalną macierz urządzeń, systemów i rozdzielczości opartą na ryzyku."
      },
      {
        "id": "ex-26-4-2",
        "title": "Stan początkowy",
        "description": "Opisz setup testu: instalacja aplikacji, dane lokalne, uprawnienia, sesja i sieć."
      },
      {
        "id": "ex-26-4-3",
        "title": "Scenariusz negatywny",
        "description": "Dodaj wariant odmowy uprawnienia, utraty sieci, wygasłej sesji lub błędnego deep linku."
      },
      {
        "id": "ex-26-4-4",
        "title": "Diagnostyka mobilna",
        "description": "Wskaż artefakty potrzebne przy awarii: screenshot, wideo, logcat/syslog, device info i network logs."
      },
      {
        "id": "ex-26-4-5",
        "title": "CI mobile",
        "description": "Zaprojektuj, które testy mobilne uruchamiać w PR, nocą i przed wydaniem."
      },
      {
        "id": "ex-26-4-6",
        "title": "Ryzyko UX",
        "description": "Opisz, jak przetestujesz gesty, klawiaturę ekranową, orientację i przerwanie aplikacji."
      }
    ],
    "quiz": [
      {
        "id": "q26-4-1",
        "question": "Czym różni się mobile web od aplikacji natywne?",
        "options": [
          "Mobile web działa w przeglądarce, natywne korzysta z API systemu i jest instalowana jako aplikacja",
          "Niczym",
          "Native zawsze jest stroną HTML",
          "Mobile web nie wymaga sieci"
        ],
        "correctAnswer": 0,
        "explanation": "Typ aplikacji decyduje o narzędziach, ryzykach i sposobie automatyzacji."
      },
      {
        "id": "q26-4-2",
        "question": "Dlaczego realne urządzenia są ważne?",
        "options": [
          "Ujawniają problemy sprzętowe, systemowe, sieciowe i wydajnościowe niewidoczne w emulatorze",
          "Bo emulatory nigdy nie działają",
          "Bo zastępują wszystkie testy",
          "Tylko do screenshotów"
        ],
        "correctAnswer": 0,
        "explanation": "Emulator nie oddaje w pełni zachowania prawdziwego urządzenia."
      },
      {
        "id": "q26-4-3",
        "question": "Co jest kluczowe w testach uprawnień?",
        "options": [
          "Sprawdzenie przyznania, odmowy i zmiany uprawnień",
          "Tylko happy path",
          "Ukrycie promptów systemowych",
          "Brak resetu aplikacji"
        ],
        "correctAnswer": 0,
        "explanation": "Uprawnienia są częścią przepływu użytkownika i źródłem wielu błędów."
      },
      {
        "id": "q26-4-4",
        "question": "Po co testować deep links?",
        "options": [
          "Aby sprawdzić wejście do aplikacji z zewnętrznego kontekstu",
          "Aby zmienić CSS",
          "Aby ominąć routing",
          "Wyłącznie dla desktopu"
        ],
        "correctAnswer": 0,
        "explanation": "Deep linki są częstym sposobem wejścia z e-maila, push notification lub kampanii."
      },
      {
        "id": "q26-4-5",
        "question": "Co powinien zawierać raport awarii mobilnej?",
        "options": [
          "Model urządzenia, OS, wersję aplikacji, logi, screenshot/wideo i kroki reprodukcji",
          "Tylko nazwę testu",
          "Sam kolor ekranu",
          "Bez danych środowiska"
        ],
        "correctAnswer": 0,
        "explanation": "Bez informacji o urządzeniu i systemie awaria mobilna bywa niemożliwa do odtworzenia."
      },
      {
        "id": "q26-4-6",
        "question": "Kiedy device farm jest szczególnie przydatna?",
        "options": [
          "Gdy potrzebujemy pokryć wiele realnych urządzeń bez ich lokalnego utrzymywania",
          "Do testowania wyłącznie unit",
          "Do zastąpienia strategii",
          "Nigdy"
        ],
        "correctAnswer": 0,
        "explanation": "Device farm daje dostęp do macierzy urządzeń i systemów."
      },
      {
        "id": "q26-4-7",
        "question": "Co odróżnia dobry test tryb offline?",
        "options": [
          "Jawnie przełącza sieć, sprawdza komunikat i synchronizację po powrocie online",
          "Dodaje sleep",
          "Ignoruje dane lokalne",
          "Działa tylko na desktopie"
        ],
        "correctAnswer": 0,
        "explanation": "Offline mode wymaga kontroli sieci i stanu lokalnego."
      },
      {
        "id": "q26-4-8",
        "question": "Najważniejsza zasada lekcji „Uprawnienia, linki głębokie i tryb offline” to:",
        "options": [
          "Testy mobilne muszą kontrolować urządzenie, system i stan aplikacji",
          "Wystarczy jeden emulator",
          "Uprawnień nie testujemy",
          "Sieć zawsze jest stabilna"
        ],
        "correctAnswer": 0,
        "explanation": "Mobilność oznacza zmienne urządzenia, warunki i integracje z systemem."
      }
    ],
    "references": [
      {
        "title": "Appium Docs",
        "url": "https://appium.io/docs/en/latest/",
        "description": "Automatyzacja aplikacji mobilnych."
      },
      {
        "title": "Android Testing",
        "url": "https://developer.android.com/training/testing",
        "description": "Testowanie Android."
      },
      {
        "title": "XCTest",
        "url": "https://developer.apple.com/documentation/xctest",
        "description": "Testowanie iOS."
      }
    ],
    "tipsAndTricks": [
      "Macierz urządzeń powinna wynikać z danych użytkowników i ryzyka, nie z listy wszystkich możliwych modeli.",
      "Emulator jest świetny do szybkiej informacji zwrotnej, ale realne urządzenie ujawnia problemy sprzętowe, sieciowe i systemowe.",
      "W testach mobilnych szczególnie dbaj o stan aplikacji: uprawnienia, pamięć, sieć, sesję i dane lokalne.",
      "Każdy test deep linku, tryb offline lub push notification powinien mieć jawny setup i cleanup stanu urządzenia."
    ],
    "commonMistakes": [
      {
        "mistake": "Testowanie wyłącznie na jednym emulatorze",
        "solution": "Zbuduj małą, ryzykową macierz urządzeń obejmującą realne modele, OS i rozdzielczości."
      },
      {
        "mistake": "Ignorowanie uprawnień systemowych",
        "solution": "Testuj odmowę, przyznanie i zmianę uprawnień dla kamery, lokalizacji, powiadomień i plików."
      },
      {
        "mistake": "Brak kontroli stanu aplikacji",
        "solution": "Czyść dane aplikacji, resetuj sesję i jawnie ustawiaj warunki początkowe."
      },
      {
        "mistake": "Mylenie mobile web z natywne",
        "solution": "Dobierz narzędzia i strategię do typu aplikacji: RWD/PWA, hybrydowe albo natywne."
      }
    ]
  }
};
