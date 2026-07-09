import React, { useState } from 'react';
import { BookOpen, Search } from 'lucide-react';

const GLOSSARY = [
  { term: 'Auto-waiting', def: 'Mechanizm Playwright, który automatycznie czeka na gotowość elementu przed wykonaniem akcji. Sprawdza czy element jest w DOM, widoczny, stabilny i odbiera zdarzenia.' },
  { term: 'Browser Context', def: 'Izolowana sesja przeglądarki z własnymi cookies, localStorage i sesjami. Wiele contextów może istnieć w jednej instancji przeglądarki.' },
  { term: 'CDP (Chrome DevTools Protocol)', def: 'Protokół komunikacji z silnikiem Chromium, umożliwiający zaawansowaną kontrolę (np. throttling sieci, emulacja CPU).' },
  { term: 'Codegen', def: 'Narzędzie Playwright generujące kod testów przez nagrywanie interakcji użytkownika w przeglądarce. Uruchamiane przez `npx playwright codegen`.' },
  { term: 'CSS Selector', def: 'Selektor oparty na składni CSS (tag, klasa, ID, atrybut). Np. `.btn-primary`, `#submit`, `[data-testid="login"]`.' },
  { term: 'data-testid', def: 'Atrybut HTML (`data-testid="submit-btn"`) rekomendowany jako najbardziej odporny selektor. Niezależny od zmian CSS i struktury DOM.' },
  { term: 'expect()', def: 'Funkcja asercji w Playwright. Web-first assertions (np. `toBeVisible()`) automatycznie ponawiają sprawdzenie aż warunek będzie spełniony.' },
  { term: 'Fixture', def: 'Mechanizm wstrzykiwania zależności (dependency injection) w Playwright. Wbudowane: page, context, browser, request. Własne: przez test.extend().' },
  { term: 'frameLocator()', def: 'API do pracy z elementami wewnątrz iframe. Pozwala na łańcuchowanie dla zagnieżdżonych iframe: frameLocator("#outer").frameLocator("#inner").' },
  { term: 'globalSetup', def: 'Plik wykonywany raz przed wszystkimi testami. Idealny do logowania i zapisywania storageState, aby uniknąć logowania w każdym teście.' },
  { term: 'HAR (HTTP Archive)', def: 'Format zapisu wszystkich requestów i responseów sieciowych. Playwright może nagrywać HAR (`recordHar`) i odtwarzać (`routeFromHAR`).' },
  { term: 'Headless mode', def: 'Tryb przeglądarki bez interfejsu graficznego. Szybszy i wymaga mniej zasobów. Domyślny w CI. Przeciwieństwo: headed mode.' },
  { term: 'Locator', def: 'Obiekt reprezentujący element(y) na stronie. Ma lazy evaluation i auto-retry. Preferowany nad przestarzałym ElementHandle.' },
  { term: 'Wzorzec obiektu strony (POM)', def: 'Wzorzec projektowy enkapsulujący selektory i akcje strony w dedykowanej klasie. Testy używają metod POM zamiast bezpośrednich selektorów.' },
  { term: 'Race condition', def: 'Sytuacja gdy kolejność wykonania operacji wpływa na wynik. W testach: sprawdzenie URL przed zakończeniem nawigacji. Rozwiązanie: Promise.all.' },
  { term: 'Retry', def: 'Automatyczne ponowienie testu po niepowodzeniu. Konfiguracja: `retries: process.env.CI ? 3 : 0`.' },
  { term: 'Route interception', def: 'Przechwytywanie requestów sieciowych przez `page.route()`. Umożliwia mockowanie odpowiedzi (fulfill), blokowanie (abort) lub modyfikację (continue).' },
  { term: 'Sharding', def: 'Dzielenie testów na części uruchamiane na osobnych maszynach. `npx playwright test --shard=1/4`. Przyspiesza wykonanie dużych suit.' },
  { term: 'Shadow DOM', def: 'Enkapsulowany DOM wewnątrz elementu. Playwright automatycznie przechodzi przez Shadow DOM (piercing) — nie potrzeba specjalnych selektorów.' },
  { term: 'storageState', def: 'Zapisany stan cookies i localStorage. Używany do pomijania logowania: `context.storageState({ path: "auth.json" })`.' },
  { term: 'Strict mode', def: 'Domyślne zachowanie Playwright: rzuca błąd gdy selektor pasuje do wielu elementów. Zapobiega niejednoznaczności. Można użyć `.first()`.' },
  { term: 'Test Runner', def: 'Wbudowany runner Playwright (`@playwright/test`). Oferuje: test(), describe(), hooks, fixtures, parallel execution, retry, sharding, reporters.' },
  { term: 'Trace Viewer', def: 'Narzędzie do time-travel debugging. Nagrywa każdy krok testu: DOM snapshot, screenshoty, requesty sieciowe, logi konsoli.' },
  { term: 'Web-first assertions', def: 'Asercje z wbudowanym mechanizmem retry. Oczekują aż warunek będzie spełniony (domyślnie 5s). Np. `toBeVisible()`, `toHaveText()`.' },
  { term: 'XPath', def: 'Język selektorów oparty na strukturze XML/HTML. Bardziej elastyczny niż CSS (może szukać po tekście, przodkach), ale wolniejszy.' },
];

export function Glossary() {
  const [search, setSearch] = useState('');
  const filtered = GLOSSARY.filter(g =>
    g.term.toLowerCase().includes(search.toLowerCase()) ||
    g.def.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <BookOpen size={20} /> Słownik pojęć
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Kompletny słownik terminologii Playwright i automatyzacji testów
        </p>

        <div className="relative mb-6">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Szukaj pojęcia..." className="w-full pl-9 pr-4 py-2 bg-secondary rounded-md text-sm outline-none" />
        </div>

        <div className="space-y-3">
          {filtered.map((g, i) => (
            <div key={i} className="p-4 bg-card rounded-lg border border-border">
              <h3 className="text-sm font-semibold text-primary mb-1">{g.term}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{g.def}</p>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
            <p>Nie znaleziono pojęcia "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
