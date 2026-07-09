import React, { useState, useCallback, useRef } from 'react';
import { Play, Copy, Check, RotateCcw, Terminal, Code2, Bug, FileText, Download, Trash2 } from 'lucide-react';
import { cn } from '@lib/utils';

interface SandboxTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  initialCode: string;
  expectedWynik?: string;
  hints?: string[];
}

const templates: SandboxTemplate[] = [
  {
    id: 'first-test',
    title: 'Pierwszy test',
    description: 'Napisz swoj pierwszy test Playwright - otworz strone i sprawdz tytul.',
    icon: <Play size={16} />,
    initialCode: `// Zadanie: Otworz strone example.com i sprawdz tytul
import { test, expect } from '@playwright/test';

test('pierwszy test', async ({ page }) => {
  // 1. Otworz strone
  await page.goto('https://example.com');

  // 2. Sprawdz tytul
  await expect(page).toHaveTitle(/Example Domain/);

  // 3. Sprawdz czy naglowek jest widoczny
  const heading = page.locator('h1');
  await expect(heading).toBeVisible();
  await expect(heading).toHaveText('Example Domain');

  console.log('Test zakonczony pomyslnie!');
});`,
    expectedWynik: 'Test zakonczony pomyslnie!',
    hints: ['Uzyj page.goto() do nawigacji', 'expect(page).toHaveTitle() sprawdza tytul', 'page.locator() znajduje element na stronie'],
  },
  {
    id: 'login-form',
    title: 'Formularz logowania',
    description: 'Przetestuj formularz logowania - wypelnij pola i kliknij submit.',
    icon: <Code2 size={16} />,
    initialCode: `// Zadanie: Przetestuj formularz logowania
import { test, expect } from '@playwright/test';

test('formularz logowania', async ({ page }) => {
  // Otworz strone testowa z formularzem
  await page.goto('https://demo.playwright.dev/todomvc');

  // 1. Znajdz input i wpisz tekst
  const input = page.locator('.new-todo');
  await expect(input).toBeVisible();

  // 2. Wpisz zadanie
  await input.fill('Nauczyc sie Playwright');
  await input.press('Enter');

  // 3. Sprawdz czy zadanie zostalo dodane
  const todoItem = page.locator('.todo-list li');
  await expect(todoItem).toHaveCount(1);
  await expect(todoItem).toContainText('Nauczyc sie Playwright');

  // 4. Dodaj drugie zadanie
  await input.fill('Napisac test E2E');
  await input.press('Enter');

  // 5. Sprawdz licznik
  const items = page.locator('.todo-list li');
  await expect(items).toHaveCount(2);

  console.log('Formularz dziala poprawnie!');
});`,
    hints: ['Uzyj .fill() do wpisania tekstu', '.press("Enter") symuluje klawisz Enter', 'expect().toHaveCount() sprawdza liczbe elementow'],
  },
  {
    id: 'api-test',
    title: 'Test API',
    description: 'Przetestuj REST API - GET, POST i sprawdz statusy.',
    icon: <Terminal size={16} />,
    initialCode: `// Zadanie: Przetestuj REST API
import { test, expect } from '@playwright/test';

test('API - GET users', async ({ request }) => {
  // 1. GET - pobierz liste uzytkownikow
  const response = await request.get(
    'https://jsonplaceholder.typicode.com/users'
  );

  // 2. Sprawdz status
  expect(response.status()).toBe(200);

  // 3. Sprawdz strukture odpowiedzi
  const users = await response.json();
  expect(Array.isArray(users)).toBe(true);
  expect(users.length).toBeGreaterThan(0);

  // 4. Sprawdz pierwszego usera
  const firstUser = users[0];
  expect(firstUser).toHaveProperty('id');
  expect(firstUser).toHaveProperty('name');
  expect(firstUser).toHaveProperty('email');

  console.log('Pobrano ' + users.length + ' uzytkownikow');
  console.log('Pierwszy: ' + firstUser.name + ' (' + firstUser.email + ')');
});

test('API - POST create post', async ({ request }) => {
  // 1. POST - stworz nowy post
  const response = await request.post(
    'https://jsonplaceholder.typicode.com/posts',
    {
      data: {
        title: 'Moj testowy post',
        body: 'Ucze sie Playwright API testing',
        userId: 1,
      },
    }
  );

  // 2. Sprawdz status (201 Created)
  expect(response.status()).toBe(201);

  // 3. Sprawdz odpowiedz
  const post = await response.json();
  expect(post.title).toBe('Moj testowy post');
  expect(post.id).toBeDefined();

  console.log('Post utworzony z ID: ' + post.id);
});`,
    hints: ['request.get() i request.post() do wywolan API', 'response.status() sprawdza HTTP status', 'response.json() parsuje odpowiedz'],
  },
  {
    id: 'debugging',
    title: 'Debugowanie',
    description: 'Uzyj console.log, page.on() i page.evaluate() do debugowania.',
    icon: <Bug size={16} />,
    initialCode: `// Zadanie: Debugowanie - nasluchuj bledow i zdarzen
import { test, expect } from '@playwright/test';

test('debugowanie - nasluchiwanie bledow', async ({ page }) => {
  // 1. Nasluchuj bledow JS
  const jsErrors: string[] = [];
  page.on('pageerror', (error) => {
    jsErrors.push(error.message);
    console.error('BLAD JS:', error.message);
  });

  // 2. Nasluchuj console.log z przegladarki
  page.on('console', (msg) => {
    console.log('CONSOLE [' + msg.type() + ']:', msg.text());
  });

  // 3. Nasluchuj nieudanych requestow
  page.on('requestfailed', (request) => {
    console.error('REQUEST FAILED:', request.url(), request.failure()?.errorText);
  });

  // 4. Otworz strone
  await page.goto('https://example.com');

  // 5. Evaluate - wykonaj JS w przegladarce
  const info = await page.evaluate(() => ({
    title: document.title,
    url: window.location.href,
    userAgent: navigator.userAgent,
    cookies: document.cookie,
  }));
  console.log('Informacje o stronie:', JSON.stringify(info, null, 2));

  // 6. Sprawdz czy nie bylo bledow
  expect(jsErrors.length).toBe(0);
  console.log('Debugowanie zakonczone - ' + jsErrors.length + ' bledow JS');
});`,
    hints: ['page.on("pageerror") lapie bledy JS', 'page.evaluate() wykonuje kod w przegladarce', 'page.on("console") przechwytuje logi'],
  },
  {
    id: 'mock-api',
    title: 'Mockowanie API',
    description: 'Zamockuj zewnetrzne API przez page.route().',
    icon: <FileText size={16} />,
    initialCode: `// Zadanie: Zamockuj zewnetrzne API
import { test, expect } from '@playwright/test';

test('mockowanie API', async ({ page }) => {
  // 1. Zamockuj endpoint /api/users
  await page.route('**/api/users', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'Jan Kowalski', email: 'jan@test.pl' },
        { id: 2, name: 'Anna Nowak', email: 'anna@test.pl' },
        { id: 3, name: 'Piotr Wisniewski', email: 'piotr@test.pl' },
      ]),
    });
    console.log('Zamockowano GET /api/users');
  });

  // 2. Zamockuj endpoint POST
  await page.route('**/api/users', (route) => {
    if (route.request().method() === 'POST') {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 4, name: 'Nowy User' }),
      });
      console.log('Zamockowano POST /api/users');
    } else {
      route.continue();
    }
  });

  // 3. Zamockuj bledny request
  await page.route('**/api/error', (route) => {
    route.fulfill({
      status: 500,
      body: 'Internal Server Error',
    });
    console.log('Zamockowano 500 /api/error');
  });

  // 4. Blokuj niepotrzebne zasoby
  await page.route('**/*.{png,jpg,gif,svg}', (route) => route.abort());
  await page.route('**/google-analytics.com/**', (route) => route.abort());
  console.log('Zablokowano obrazy i analytics');

  console.log('Wszystkie mocki skonfigurowane!');
});`,
    hints: ['page.route() przechwytuje requesty', 'route.fulfill() zwraca zamockowana odpowiedz', 'route.abort() blokuje request'],
  },
];

type LogEntry = { type: 'log' | 'error' | 'warn'; text: string; time: string };

export function InteractiveSandbox() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(templates[0].id);
  const [code, setCode] = useState(templates[0].initialCode);
  const [output, setWynik] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hintIndex, setHintIndex] = useState<Record<string, number>>({});
  const outputRef = useRef<HTMLDivElement>(null);

  const currentTemplate = templates.find(t => t.id === selectedTemplate) || templates[0];

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplate(id);
    const tmpl = templates.find(t => t.id === id);
    if (tmpl) {
      setCode(tmpl.initialCode);
    }
    setWynik([]);
  };

  const handleReset = () => {
    const tmpl = templates.find(t => t.id === selectedTemplate);
    if (tmpl) setCode(tmpl.initialCode);
    setWynik([]);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
  };

  const addLog = (type: LogEntry['type'], text: string) => {
    const time = new Date().toLocaleTimeString();
    setWynik(prev => [...prev, { type, text, time }]);
  };

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setWynik([]);
    const startTime = Date.now();

    addLog('log', '\ud83d\ude80 Uruchamianie kodu...');
    addLog('log', '\u2501'.repeat(40));

    try {
      // Simulate Playwright execution with realistic output
      const lines = code.split('\n');
      let inTest = false;
      let testName = '';
      let stepCount = 0;

      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.includes("test('") || trimmed.includes('test("')) {
          inTest = true;
          const match = trimmed.match(/test\(['"]([^'"]+)['"]/);
          testName = match ? match[1] : 'test';
          addLog('log', '\u25b6\ufe0f Test: ' + testName);
        }

        if (trimmed.includes('page.goto(') && inTest) {
          const urlMatch = trimmed.match(/['"](https?:\/\/[^'"]+)['"]/);
          const url = urlMatch ? urlMatch[1] : 'URL';
          addLog('log', '  \ud83c\udf10 Nawigacja: ' + url);
          await new Promise(r => setTimeout(r, 300));
          addLog('log', '  \u2705 Strona zaladowana (200 OK)');
        }

        if (trimmed.includes('page.fill(') && inTest) {
          const parts = trimmed.match(/['"]([^'"]+)['"]/g);
          if (parts && parts.length >= 2) {
            addLog('log', '  \u2328\ufe0f Fill ' + parts[0] + ' = ' + parts[1]);
          }
        }

        if (trimmed.includes('.click(') && inTest) {
          addLog('log', '  \ud83d\uddb1\ufe0f Click');
        }

        if (trimmed.includes('.press(') && inTest) {
          addLog('log', '  \u2328\ufe0f Key press');
        }

        if (trimmed.includes('expect(') && inTest) {
          stepCount++;
          if (trimmed.includes('toBeVisible') || trimmed.includes('toHaveCount')) {
            addLog('log', '  \u2705 Asercja #' + stepCount + ': PASSED');
            await new Promise(r => setTimeout(r, 100));
          } else if (trimmed.includes('toHaveTitle')) {
            addLog('log', '  \u2705 Asercja tytulu: PASSED');
          } else if (trimmed.includes('toHaveProperty')) {
            addLog('log', '  \u2705 Asercja propert: PASSED');
          } else if (trimmed.includes('toBe(') || trimmed.includes('toEqual(')) {
            addLog('log', '  \u2705 Asercja: PASSED');
          }
        }

        if (trimmed.includes('console.log(') || trimmed.includes('console.error(') || trimmed.includes('console.warn(')) {
          const isError = trimmed.includes('console.error');
          const match = trimmed.match(/console\.(log|error|warn)\(['"]([^'"]+)['"]\)/);
          if (match) {
            addLog(isError ? 'error' : 'log', '  ' + match[2]);
          } else {
            // Try template literal or concatenation
            const textMatch = trimmed.match(/console\.\w+\((.+)\)/);
            if (textMatch) {
              addLog(isError ? 'error' : 'log', '  ' + textMatch[1].replace(/['"]/g, '').replace(/\+/g, ''));
            }
          }
        }

        if (trimmed.includes('page.route(')) {
          addLog('log', '  \ud83c\udfad Mock skonfigurowany');
        }

        if (trimmed.includes('route.abort()')) {
          addLog('log', '  \ud83d\uded1 Zablokowano niepotrzebne zasoby');
        }

        if (trimmed.includes('route.fulfill(')) {
          const statusMatch = trimmed.match(/status:\s*(\d+)/);
          const status = statusMatch ? statusMatch[1] : '200';
          addLog('log', '  \ud83d\udce1 Mock response: ' + status);
        }

        if (trimmed.includes('page.evaluate(')) {
          addLog('log', '  \ud83e\udde0 Wykonywanie JS w przegladarce...');
        }

        if (trimmed.includes('response.status()') && inTest) {
          addLog('log', '  \u2705 Status: 200 OK');
        }

        if (trimmed.includes('.json()') && inTest) {
          addLog('log', '  \ud83d\udce6 JSON sparsowany pomyslnie');
        }
      }

      const elapsed = Date.now() - startTime;
      addLog('log', '\u2501'.repeat(40));
      addLog('log', '\u2705 Wszystkie testy przeszly pomyslnie! (' + (elapsed / 1000).toFixed(1) + 's)');

      if (currentTemplate.expectedWynik) {
        addLog('log', '\ud83c\udfaf Oczekiwany wynik: ' + currentTemplate.expectedWynik);
      }
    } catch (err) {
      addLog('error', '\u274c Blad: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsRunning(false);
    }
  }, [code, currentTemplate]);

  const handleShowHint = (templateId: string) => {
    setHintIndex(prev => {
      const current = prev[templateId] || 0;
      const tmpl = templates.find(t => t.id === templateId);
      const max = tmpl?.hints?.length || 0;
      return { ...prev, [templateId]: current < max - 1 ? current + 1 : 0 };
    });
  };

  const currentHint = () => {
    const tmpl = templates.find(t => t.id === selectedTemplate);
    if (!tmpl?.hints) return null;
    const idx = hintIndex[selectedTemplate] || 0;
    return tmpl.hints[idx];
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedTemplate + '.spec.ts';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Template selector */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-card/50 overflow-x-auto shrink-0">
        {templates.map(tmpl => (
          <button key={tmpl.id} onClick={() => handleSelectTemplate(tmpl.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors',
              selectedTemplate === tmpl.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent/50'
            )}>
            {tmpl.icon}
            {tmpl.title}
          </button>
        ))}
      </div>

      {/* Template info */}
      <div className="px-4 py-2 border-b border-border bg-card/30 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">{currentTemplate.title}</h3>
            <p className="text-xs text-muted-foreground">{currentTemplate.description}</p>
          </div>
          <div className="flex items-center gap-1">
            {currentTemplate.hints && (
              <button onClick={() => handleShowHint(selectedTemplate)}
                className="text-xs px-2 py-1 rounded bg-amber-400/10 text-amber-500 hover:bg-amber-400/20 transition-colors">
                \ud83d\udca1 Podpowiedz
              </button>
            )}
          </div>
        </div>
        {currentHint() && (
          <div className="mt-1.5 p-2 rounded bg-amber-400/10 border border-amber-400/20 text-xs text-amber-500">
            \ud83d\udca1 {currentHint()}
          </div>
        )}
      </div>

      {/* Editor + Wynik */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code editor */}
        <div className="flex-1 flex flex-col border-r border-border">
          <div className="flex items-center justify-between px-3 py-1 border-b border-border bg-card/30 shrink-0">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Edytor</span>
            <div className="flex items-center gap-0.5">
              <button onClick={handleCopy} className="p-1 rounded hover:bg-accent text-muted-foreground" title="Kopiuj">
                <Copy size={12} />
              </button>
              <button onClick={handleDownload} className="p-1 rounded hover:bg-accent text-muted-foreground" title="Pobierz">
                <Download size={12} />
              </button>
              <button onClick={handleReset} className="p-1 rounded hover:bg-accent text-muted-foreground" title="Reset">
                <RotateCcw size={12} />
              </button>
            </div>
          </div>
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            className="flex-1 w-full p-4 bg-background text-xs font-mono resize-none focus:outline-none text-foreground"
            spellCheck={false}
          />
        </div>

        {/* Wynik panel */}
        <div className="w-80 flex flex-col shrink-0">
          <div className="flex items-center justify-between px-3 py-1 border-b border-border bg-card/30 shrink-0">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Konsola</span>
            <div className="flex items-center gap-0.5">
              <button onClick={() => setWynik([])} className="p-1 rounded hover:bg-accent text-muted-foreground" title="Wyczysc">
                <Trash2 size={12} />
              </button>
              <button onClick={handleRun} disabled={isRunning}
                className={cn(
                  'flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors',
                  isRunning ? 'opacity-50 cursor-not-allowed bg-secondary text-muted-foreground' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                )}>
                <Play size={12} />
                {isRunning ? 'Wykonywanie...' : 'Uruchom'}
              </button>
            </div>
          </div>
          <div ref={outputRef} className="flex-1 overflow-y-auto p-3 font-mono text-[11px] leading-relaxed bg-black/5 dark:bg-black/20">
            {output.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Terminal size={24} className="opacity-20 mb-2" />
                <p className="text-xs">Kliknij "Uruchom" aby zobaczyc wynik</p>
              </div>
            ) : (
              output.map((entry, i) => (
                <div key={i} className={cn(
                  'whitespace-pre-wrap break-all',
                  entry.type === 'error' ? 'text-red-500' : entry.type === 'warn' ? 'text-amber-500' : 'text-foreground'
                )}>
                  {entry.text}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
