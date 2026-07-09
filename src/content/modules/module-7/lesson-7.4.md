# Dane testowe z bazy danych i API

> Moduł siódmy dotyczy jednego z najczęstszych źródeł niestabilności automatyzacji: danych testowych. Test może mieć idealne lokatory i asercje, ale jeśli opiera się na przypadkowym stanie środowiska, nie będzie wiarygodny.

## Jak czytać ten moduł

Czytaj ten moduł jak podręcznik projektowania stanu. Dane nie są dodatkiem do testu; są częścią scenariusza. Każdy test ma stan początkowy, dane wejściowe i oczekiwany stan końcowy. Im bardziej jawnie je opiszesz, tym łatwiej utrzymać automatyzację.

Trzy zasady modułu:

1. **Dane muszą być deterministyczne.** Nawet jeśli są generowane, muszą dać się odtworzyć.
2. **Dane muszą być izolowane.** Równoległe testy nie mogą walczyć o ten sam rekord, konto lub koszyk.
3. **Dane muszą być bezpieczne.** Sekrety i prawdziwe dane osobowe nie należą do repozytorium testowego.


## Cel lekcji

Ta lekcja koncentruje się na: **seed bazy danych, rollback transakcji, setup przez API, tracker sprzątania, baza in-memory i dane bliskie produkcyjnym**. Główne ryzyko: **testy przygotowują dane przez niewłaściwą warstwę: SQL omija logikę aplikacji albo UI jest używane do setupu i spowalnia cały pakiet**. Po lekturze powinieneś umieć dobrać strategię danych do poziomu testu, ryzyka i kosztu utrzymania.

## Sytuacja przewodnia

test ma utworzyć zamówienie z pozycjami, sprawdzić je w UI i posprzątać dane po zakończeniu

## 1. API jako setup

API jest zwykle najlepsze do tworzenia stanu, bo przechodzi przez logikę aplikacji i jest szybsze niż UI.

## 2. SQL jako narzędzie precyzyjne

Bezpośredni SQL jest dobry do danych referencyjnych, diagnostyki i niektórych seedów. Może być zły, jeśli omija walidację biznesową, którą test powinien uwzględniać.

## 3. Transakcje i rollback

Rollback jest świetny w testach integracyjnych, ale w testach E2E przez przeglądarkę nie zawsze obejmie wszystkie procesy asynchroniczne.

## 4. Cleanup tracker

Tracker sprzątania pozwala usuwać zasoby w odwrotnej kolejności tworzenia. Musi być odporny na częściowe awarie setupu.

## 5. Dane produkcyjnopodobne

Dane bliskie produkcyjnym pomagają wykrywać realne problemy, ale muszą być syntetyczne, zanonimizowane i zgodne z polityką prywatności.

## Przykład referencyjny

```typescript
export class CleanupTracker {
  private readonly callbacks: Array<() => Promise<void>> = [];

  add(callback: () => Promise<void>) {
    this.callbacks.push(callback);
  }

  async cleanup() {
    for (const callback of this.callbacks.reverse()) {
      await callback();
    }
  }
}

// w teście: tracker.add(() => api.deleteOrder(order.id));
```

Przykład pokazuje, że dane testowe powinny być jawne, typowane i powtarzalne. Najważniejsze jest nie to, że dane istnieją, lecz to, że test wie, skąd się wzięły i jak je powiązać z wynikiem.

## Lista kontrolna

- Czy dane są tworzone jawnie?
- Czy test może działać równolegle z innymi testami?
- Czy awarię da się odtworzyć na tych samych danych?
- Czy dane testowe nie zawierają sekretów ani danych osobowych?
- Czy istnieje strategia sprzątania?
- Czy warianty danych są nazwane językiem domeny?

## Głębsza analiza tematu: SQL

Bezpośredni dostęp do bazy danych w testach Playwright pozwala na:
1. **Weryfikację danych**: Sprawdź czy po rejestracji rekord w tabeli `users` faktycznie powstał.
2. **Setup danych**: Wstaw zamówienie bezpośrednio do bazy, aby od razu przetestować stronę jego szczegółów.
3. **Cleanup**: Usuń użytkownika po teście, aby nie zaśmiecać środowiska.
Używaj bibliotek takich jak `pg` (PostgreSQL) czy `mysql2` wewnątrz swoich testów lub fikstur.
