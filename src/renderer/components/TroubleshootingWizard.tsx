import React, { useState } from 'react';
import { Bug, ArrowRight, CheckCircle2, AlertTriangle, Terminal, Copy, RefreshCw } from 'lucide-react';

type Step = { question: string; options: { label: string; next: number | 'solution'; solution?: string }[] };
type Solution = { title: string; steps: string[]; code?: string };

const STEPS: (Step | null)[] = [
  { question: 'Jaki problem napotkałeś?', options: [
    { label: 'Test failuje z timeoutem', next: 1 },
    { label: 'Element nie został znaleziony', next: 2 },
    { label: 'Test przechodzi lokalnie, ale failuje w CI', next: 3 },
    { label: 'Test raz przechodzi, raz nie (flaky)', next: 4 },
    { label: 'Problem z autoryzacją/logowaniem', next: 5 },
    { label: 'Strict mode violation (wiele elementów)', next: 6 },
  ]},
  // Timeout
  { question: 'Czy element na pewno istnieje na stronie?', options: [
    { label: 'Tak, jest widoczny', next: 'solution', solution: 'timeout-exists' },
    { label: 'Nie jestem pewien/nie istnieje', next: 'solution', solution: 'timeout-notfound' },
    { label: 'Element jest w iframe', next: 'solution', solution: 'timeout-iframe' },
  ]},
  // Element not found
  { question: 'Jakiego selektora używasz?', options: [
    { label: 'Klasy CSS (.btn-primary)', next: 'solution', solution: 'selector-fragile' },
    { label: 'data-testid lub getByRole', next: 'solution', solution: 'selector-timing' },
    { label: 'XPath', next: 'solution', solution: 'selector-xpath' },
  ]},
  // CI vs local
  { question: 'Czy konfiguracja CI różni się od lokalnej?', options: [
    { label: 'Nie — ta sama konfiguracja', next: 'solution', solution: 'ci-config' },
    { label: 'Tak — osobna konfiguracja dla CI', next: 'solution', solution: 'ci-resources' },
  ]},
  // Flaky
  { question: 'Co się zmienia między uruchomieniami?', options: [
    { label: 'Dane testowe są losowe', next: 'solution', solution: 'flaky-data' },
    { label: 'Kolejność testów/nawigacja', next: 'solution', solution: 'flaky-race' },
    { label: 'Zewnętrzne API/ usługi', next: 'solution', solution: 'flaky-external' },
  ]},
  // Auth
  { question: 'Jak obsługujesz logowanie?', options: [
    { label: 'Loguję przez interfejs użytkownika w każdym teście', next: 'solution', solution: 'auth-ui' },
    { label: 'Używam storageState / globalSetup', next: 'solution', solution: 'auth-token' },
  ]},
  // Strict mode
  { question: 'Ile elementów pasuje do selektora?', options: [
    { label: 'Wiele — potrzebuję pierwszego', next: 'solution', solution: 'strict-first' },
    { label: 'Wiele — potrzebuję konkretnego', next: 'solution', solution: 'strict-specific' },
  ]},
];

const SOLUTIONS: Record<string, Solution> = {
  'timeout-exists': { title: 'Element istnieje — zwiększ timeout', steps: [
    'Zwiększ timeout dla konkretnej akcji: `await page.click("#btn", { timeout: 15000 })`',
    'Lub globalnie: `expect: { timeout: 15000 }` w playwright.config.ts',
    'Sprawdź czy strona nie ładuje się zbyt wolno — użyj `waitForLoadState("networkidle")`',
  ], code: 'await expect(page.locator(".msg")).toBeVisible({ timeout: 15000 });' },
  'timeout-notfound': { title: 'Element nie istnieje — sprawdź selektor', steps: [
    'Zrób screenshot strony: `await page.screenshot({ path: "debug.png", fullPage: true })`',
    'Sprawdź liczbę elementów: `console.log(await page.locator(".item").count())`',
    'Użyj Locator Pickera w Inspectorze (--debug) aby znaleźć poprawny selektor',
  ], code: 'console.log("Count:", await page.locator(".item").count());\nawait page.screenshot({ path: "debug.png", fullPage: true });' },
  'timeout-iframe': { title: 'Element w iframe — użyj frameLocator', steps: [
    'Zamiast `page.locator()` użyj `page.frameLocator("#iframe-id").locator("button")`',
    'Dla zagnieżdżonych: łańcuchuj frameLocator()',
  ], code: 'const frame = page.frameLocator("#my-iframe");\nawait frame.locator("button").click();' },
  'selector-fragile': { title: 'Kruchy selektor — użyj data-testid', steps: [
    'Poproś developerów o dodanie atrybutu `data-testid` do elementu',
    'Użyj `page.getByTestId("submit-btn")` zamiast selektora CSS',
    'Alternatywnie: `page.getByRole("button", { name: /submit/i })`',
  ], code: 'page.getByTestId("submit-btn"); // zamiast .btn-primary-v2' },
  'selector-timing': { title: 'Problem z timingiem — element jeszcze nie gotowy', steps: [
    'Użyj auto-waitingu: Playwright automatycznie czeka na elementy',
    'Dla dynamicznych elementów: `await expect(page.locator(".msg")).toBeVisible({ timeout: 10000 })`',
    'Unikaj `page.waitForTimeout()` — to antypattern',
  ]},
  'selector-xpath': { title: 'XPath jest wolny i kruchy', steps: [
    'XPath jest 2-3x wolniejszy od CSS. Używaj tylko gdy CSS nie wystarcza.',
    'Preferuj: data-testid > getByRole > getByLabel > CSS > XPath',
  ]},
  'ci-config': { title: 'Brak osobnej konfiguracji CI', steps: [
    'Dodaj warunkową konfigurację: `const isCI = !!process.env.CI`',
    'CI: timeout 3x większy, retries: 3, workers: 4, headless: true',
  ], code: 'const isCI = !!process.env.CI;\nexport default defineConfig({\n  timeout: isCI ? 90000 : 30000,\n  retries: isCI ? 3 : 0,\n  use: { headless: isCI },\n});' },
  'ci-resources': { title: 'CI ma za mało zasobów', steps: [
    'Zmniejsz liczbę workerów: `workers: 2`',
    'Używaj tylko jednej przeglądarki w CI',
    'Dodaj sharding dla dużych suit testowych',
  ]},
  'flaky-data': { title: 'Losowe dane — użyj seed()', steps: [
    'Ustaw `faker.seed(123)` przed generowaniem danych',
    'Lub użyj stałych danych testowych zamiast losowych',
    'Upewnij się że każdy test tworzy unikalne dane i sprząta po sobie',
  ], code: 'faker.seed(123); // deterministyczne dane' },
  'flaky-race': { title: 'Race condition — użyj Promise.all', steps: [
    'Zamiast: `await page.click("button"); await expect(page).toHaveURL("/next")`',
    'Użyj: `await Promise.all([page.waitForURL("**/next"), page.click("button")])`',
  ], code: 'await Promise.all([\n  page.waitForURL("**/next"),\n  page.click("button"),\n]);' },
  'flaky-external': { title: 'Zewnętrzne zależności — mockuj', steps: [
    'Mockuj zewnętrzne API: `page.route("**/external/**", route => route.fulfill({...}))`',
    'Lub użyj HAR replay: `page.routeFromHAR("network.har")`',
  ], code: 'await page.route("**/external-api/**", route => route.fulfill({ status: 200, body: "mocked" }));' },
  'auth-ui': { title: 'Logowanie przez interfejs użytkownika — użyj storageState', steps: [
    'Zaloguj się raz w globalSetup i zapisz stan',
    'Wszystkie testy używają zapisanego stanu — pomijają logowanie',
    '10x szybsze niż logowanie przez interfejs użytkownika w każdym teście',
  ], code: '// global-setup.ts\nawait context.storageState({ path: "auth/state.json" });\n// playwright.config.ts\nuse: { storageState: "auth/state.json" },' },
  'auth-token': { title: 'Token wygasł — odśwież go', steps: [
    'Sprawdź czy token nie wygasł (sprawdź expiry w JWT)',
    'Odśwież token w globalSetup lub użyj API do logowania',
    'Upewnij się że storageState jest aktualny',
  ]},
  'strict-first': { title: 'Potrzebujesz pierwszego elementu', steps: [
    'Użyj `.first()`: `await page.locator("button").first().click()`',
    'Albo `.nth(0)`: `await page.locator("button").nth(0).click()`',
  ], code: 'await page.locator("button").first().click();' },
  'strict-specific': { title: 'Potrzebujesz konkretnego elementu', steps: [
    'Doprecyzuj selektor: `page.getByRole("button", { name: "Submit" })`',
    'Lub zawęź przez rodzica: `page.locator("form").getByRole("button", { name: "OK" })`',
  ], code: 'page.getByRole("button", { name: "Submit" });' },
};

export function TroubleshootingWizard() {
  const [step, setStep] = useState(0);
  const [solution, setSolution] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const currentStep = STEPS[step];
  const currentSolution = solution ? SOLUTIONS[solution] : null;

  const handleOption = (next: number | 'solution', sol?: string) => {
    if (next === 'solution' && sol) {
      setSolution(sol);
    } else if (typeof next === 'number') {
      setStep(next);
    }
  };

  const handleCopy = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => { setStep(0); setSolution(null); };

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Bug size={20} /> Kreator rozwiązywania problemów
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Odpowiedz na kilka pytań, a kreator wskaże Ci rozwiązanie
        </p>

        {!currentSolution && currentStep && (
          <div className="bg-card rounded-xl border border-border p-6 animate-slide-up">
            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
              <Bug size={14} /> Krok {step + 1}
            </div>
            <h3 className="text-lg font-semibold mb-4">{currentStep.question}</h3>
            <div className="space-y-2">
              {currentStep.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleOption(opt.next, opt.solution)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-secondary/50 rounded-lg text-left text-sm hover:bg-primary/10 hover:text-primary transition-colors group"
                >
                  <span>{opt.label}</span>
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
            <button onClick={reset} className="mt-4 text-xs text-muted-foreground hover:underline">← Zacznij od nowa</button>
          </div>
        )}

        {currentSolution && (
          <div className="bg-card rounded-xl border border-green-500/30 bg-green-500/5 p-6 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={18} className="text-green-500" />
              <h3 className="font-semibold">{currentSolution.title}</h3>
            </div>

            <ol className="space-y-2 mb-4">
              {currentSolution.steps.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary font-bold">{i + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>

            {currentSolution.code && (
              <div className="relative bg-secondary rounded-lg p-3 mb-4">
                <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">{currentSolution.code}</pre>
                <button
                  onClick={() => handleCopy(currentSolution.code!)}
                  className="absolute top-2 right-2 p-1 rounded hover:bg-accent transition-colors"
                >
                  {copied ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={reset} className="flex items-center gap-1 px-3 py-2 bg-secondary rounded-md text-xs hover:bg-accent">
                <RefreshCw size={13} /> Zacznij od nowa
              </button>
            </div>
          </div>
        )}

        {!currentStep && (
          <div className="text-center py-12 text-muted-foreground">
            <Terminal size={32} className="mx-auto mb-2 opacity-30" />
            <p>Kliknij przycisk poniżej aby rozpocząć diagnozę</p>
            <button onClick={() => setStep(0)} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
              Rozpocznij diagnozę
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
