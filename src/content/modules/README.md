# Struktura treści lekcji

Teoria lekcji została przeniesiona z długich stringów TypeScript do osobnych plików Markdown.

## Konwencja

Dla każdej lekcji istnieją dwa pliki:

```txt
module-X/lesson-X.Y.ts
module-X/lesson-X.Y.md
```

Przykład:

```txt
module-2/lesson-2.6.ts   # metadane lekcji, ćwiczenia, quiz, przykłady kodu
module-2/lesson-2.6.md   # pełna teoria lekcji
```

Plik `.ts` importuje teorię jako surowy tekst przez Vite:

```ts
import theory2_6 from './lesson-2.6.md?raw';
```

Następnie przekazuje ją do pola:

```ts
theory: theory2_6
```

## Zasady edycji

- Edytuj pełną teorię w pliku `.md`, nie w pliku `.ts`.
- Plik `.ts` powinien zawierać metadane, ćwiczenia, quizy, odnośniki i krótkie przykłady kodu.
- Nagłówki Markdown są używane przez widok lekcji do generowania spisu treści.
- Bloki kodu zapisuj z językiem, np. ` ```typescript `, aby działało kolorowanie składni.
- Nie przenoś quizów i ćwiczeń do Markdown bez wcześniejszej zmiany modelu danych aplikacji.

## Dlaczego tak?

Oddzielenie teorii od metadanych ułatwia redakcję, zmniejsza ryzyko błędów składniowych w TypeScript i przygotowuje aplikację do późniejszego eksportu lekcji do PDF/e-booka albo do dalszej migracji na MDX.


## Dobre praktyki i perspektywa inżynierska
Automatyzacja to proces ciągłego doskonalenia. Aby Twoje testy niosły realną wartość, stosuj się do poniższych zasad:
- **Testuj zachowanie, nie kod**: Skup się na tym, co widzi i robi użytkownik. Zmienne nazwy klas CSS nie powinny psuć Twoich testów.
- **Fail-fast**: Test powinien dawać jasny sygnał o błędzie tak szybko, jak to możliwe. Unikaj "wiszących" testów, które blokują kolejkę CI.
- **Ewoluuj**: Regularnie przeglądaj swoje testy. Usuwaj te, które są niestabilne i nie dają wartości, a refaktoryzuj te, które stają się zbyt skomplikowane.
