import React, { useState } from 'react';
import { ChevronDown, ChevronRight, HelpCircle, ExternalLink, Search } from 'lucide-react';

const FAQ_ITEMS = [
  { q: 'Czym jest Playwright?', a: 'Playwright to narzędzie do automatyzacji testów przeglądarek stworzone przez Microsoft. Umożliwia testowanie aplikacji webowych na Chromium, Firefox i WebKit z jednym API. Wspiera TypeScript, JavaScript, Python, .NET i Java.' },
  { q: 'Jak zainstalować Playwright?', a: 'Uruchom `npm init playwright@latest` w terminalu. To polecenie przeprowadzi Cię przez interaktywny setup, instalując Playwright, przeglądarki i tworząc przykładowe testy.' },
  { q: 'Jaka jest różnica między Playwright a Selenium?', a: 'Playwright komunikuje się bezpośrednio z silnikiem przeglądarki przez WebSocket (szybciej). Selenium używa WebDriver przez HTTP. Playwright ma wbudowany auto-waiting, web-first assertions i Trace Viewer.' },
  { q: 'Czy Playwright działa na macOS, Windows i Linux?', a: 'Tak, Playwright działa na wszystkich trzech systemach. Instalator automatycznie pobiera odpowiednie wersje przeglądarek.' },
  { q: 'Jak debugować testy Playwright?', a: 'Użyj `npx playwright test --debug` aby otworzyć Inspector. Możesz też użyć `page.pause()`, Trace Viewer (`trace: "retain-on-failure"`), lub tryb UI (`--ui`).' },
  { q: 'Co to jest browser context?', a: 'Browser context to izolowana sesja przeglądarki z własnymi cookies, localStorage i sesjami. Contexty są od siebie całkowicie odseparowane, ale współdzielą tę samą instancję przeglądarki.' },
  { q: 'Jak obsłużyć logowanie w testach?', a: 'Najlepsza praktyka: zaloguj się raz w `globalSetup`, zapisz stan przez `context.storageState({ path: "auth.json" })`, a następnie użyj `use: { storageState: "auth.json" }` w konfiguracji.' },
  { q: 'Jak testować na urządzeniach mobilnych?', a: 'Użyj wbudowanych profili urządzeń: `const { devices } = require("@playwright/test"); const iPhone = devices["iPhone 14"];` lub skonfiguruj viewport ręcznie: `viewport: { width: 375, height: 812 }`.' },
  { q: 'Jak mockować odpowiedzi API?', a: 'Użyj `page.route()`: `await page.route("**/api/users", route => route.fulfill({ status: 200, body: JSON.stringify([...]) }));`' },
  { q: 'Jak uruchomić testy w CI/CD?', a: 'Skonfiguruj GitHub Actions: `uses: actions/setup-node@v4`, `run: npx playwright install --with-deps`, `run: npx playwright test`. Dodaj `retries: 2` i `timeout: 90000` dla CI.' },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const filtered = FAQ_ITEMS.filter(item =>
    item.q.toLowerCase().includes(search.toLowerCase()) ||
    item.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <HelpCircle size={20} /> FAQ — Najczęściej zadawane pytania
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Szybkie odpowiedzi na najczęstsze pytania o Playwright
        </p>

        <div className="relative mb-6">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Szukaj w FAQ..."
            className="w-full pl-9 pr-4 py-2 bg-secondary rounded-md text-sm outline-none"
          />
        </div>

        <div className="space-y-2">
          {filtered.map((item, i) => (
            <div key={i} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors"
              >
                {openIndex === i ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span className="text-sm font-medium">{item.q}</span>
              </button>
              {openIndex === i && (
                <div className="px-10 pb-4 text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm">
            Nie znalazłeś odpowiedzi? Sprawdź{' '}
            <button onClick={() => window.electronAPI?.openExternal('https://playwright.dev/docs/intro')} className="text-primary underline">
              oficjalną dokumentację Playwright
            </button>
            {' '}lub zadaj pytanie na{' '}
            <button onClick={() => window.electronAPI?.openExternal('https://stackoverflow.com/questions/tagged/playwright')} className="text-primary underline">
              Stack Overflow
            </button>.
          </p>
        </div>
      </div>
    </div>
  );
}
