import React, { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useAppStore } from '@stores/appStore';
import { Play, RotateCcw, Copy, Check, Terminal, Bug, Zap } from 'lucide-react';
import { cn } from '@lib/utils';

const DEFAULT_TEMPLATES = [
  {
    name: 'Szybki test API',
    code: `import { test, expect } from '@playwright/test';

test('rzeczywisty test API bez uruchamiania przeglądarki', async ({ request }) => {
  const response = await request.get('https://example.com');

  expect(response.status()).toBe(200);
  console.log('Status odpowiedzi:', response.status());
  console.log('✅ Ten wynik pochodzi z rzeczywistego uruchomienia Playwright.');
});`,
  },
  {
    name: 'Podstawowy test UI',
    code: `import { test, expect } from '@playwright/test';

test('podstawowy test nawigacji', async ({ page }) => {
  // Przejdź do strony
  await page.goto('https://example.com');
  
  // Sprawdź tytuł
  await expect(page).toHaveTitle(/Example Domain/);
  
  // Sprawdź nagłówek
  const heading = page.locator('h1');
  await expect(heading).toBeVisible();
  await expect(heading).toContainText('Example');
  
  console.log('✅ Test zakończony sukcesem!');
});`,
  },
  {
    name: 'Interakcje z elementami',
    code: `import { test, expect } from '@playwright/test';

test('interakcje z formularzem', async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc');
  
  // Dodaj zadanie
  const input = page.locator('.new-todo');
  await input.fill('Nauczyć się Playwrighta');
  await input.press('Enter');
  
  // Sprawdź czy zadanie zostało dodane
  const todo = page.locator('.todo-list li');
  await expect(todo).toHaveCount(1);
  await expect(todo).toHaveText('Nauczyć się Playwrighta');
  
  // Oznacz jako ukończone
  await todo.locator('.toggle').check();
  await expect(todo).toHaveClass(/completed/);
  
  console.log('✅ Test interakcji zakończony!');
});`,
  },
  {
    name: 'Testowanie API',
    code: `import { test, expect } from '@playwright/test';

test('test API endpoint', async ({ request }) => {
  // GET request
  const response = await request.get('https://jsonplaceholder.typicode.com/posts/1');
  
  // Sprawdź status
  expect(response.status()).toBe(200);
  
  // Sprawdź body
  const body = await response.json();
  expect(body).toHaveProperty('id', 1);
  expect(body).toHaveProperty('title');
  expect(body).toHaveProperty('body');
  
  console.log('✅ API test zakończony!');
  console.log('📦 Odpowiedź:', JSON.stringify(body, null, 2));
});`,
  },
  {
    name: 'Emulacja urządzenia mobilnego',
    code: `import { test, expect, devices } from '@playwright/test';

test.use({
  ...devices['iPhone 14'],
  locale: 'pl-PL',
});

test('test na urządzeniu mobilnym', async ({ page }) => {
  await page.goto('https://example.com');
  
  // Sprawdź viewport mobilny
  const viewport = page.viewportSize();
  console.log(\`📱 Obszar widoku: \${viewport?.width}x\${viewport?.height}\`);
  
  // Sprawdź czy działa touch
  await expect(page.locator('h1')).toBeVisible();
  
  console.log('✅ Mobile test zakończony!');
});`,
  },
];

export function Playground() {
  const { playgroundCode, setPlaygroundCode, playgroundOutput, setPlaygroundOutput } = useAppStore();
  const [executing, setExecuting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(0);

  const handleRun = useCallback(async () => {
    setExecuting(true);
    setPlaygroundOutput('⏳ Uruchamianie prawdziwego testu Playwright...\n');

    try {
      const result = await window.electronAPI?.runPlaygroundTest(playgroundCode);

      if (!result) {
        setPlaygroundOutput(
          '❌ Nie można uruchomić testu, ponieważ API Electron nie jest dostępne.\n' +
          'Uruchom aplikację jako aplikację Electron, a nie jako sam podgląd renderera w przeglądarce.'
        );
        return;
      }

      const statusIcon = result.success ? '✅' : '❌';
      const statusText = result.success ? 'TEST ZAKOŃCZONY SUKCESEM' : 'TEST ZAKOŃCZONY BŁĘDEM';
      const duration = `${(result.durationMs / 1000).toFixed(2)} s`;
      const timeoutLine = result.timedOut ? '\n⏱️ Test został przerwany po przekroczeniu limitu czasu procesu.' : '';
      const errorLine = result.error ? `\n🚨 Błąd uruchomienia: ${result.error}\n` : '';

      setPlaygroundOutput(
        `${statusIcon} ${statusText}\n` +
        `Kod wyjścia procesu: ${result.exitCode ?? 'brak'}\n` +
        `Czas wykonania: ${duration}${timeoutLine}\n` +
        `Plik testu: ${result.testFile}\n` +
        `Katalog artefaktów: ${result.runDir}\n` +
        `Polecenie: ${result.command}\n` +
        `${errorLine}\n` +
        `--- STDOUT ---\n${result.stdout || '(brak danych na standardowym wyjściu)'}\n\n` +
        `--- STDERR ---\n${result.stderr || '(brak danych na standardowym wyjściu błędów)'}\n`
      );
    } catch (error) {
      setPlaygroundOutput(
        `❌ Nie udało się uruchomić testu.\n${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setExecuting(false);
    }
  }, [playgroundCode, setPlaygroundOutput]);

  const handleReset = () => {
    setPlaygroundCode(DEFAULT_TEMPLATES[0].code);
    setPlaygroundOutput('');
  };

  const handleTemplateChange = (index: number) => {
    setSelectedTemplate(index);
    setPlaygroundCode(DEFAULT_TEMPLATES[index].code);
    setPlaygroundOutput('');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(playgroundCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Template selector */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-card/50 shrink-0 overflow-x-auto">
        {DEFAULT_TEMPLATES.map((template, i) => (
          <button
            key={i}
            onClick={() => handleTemplateChange(i)}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors',
              selectedTemplate === i
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent/50'
            )}
          >
            {template.name}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Editor panel */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-3 py-1.5 bg-secondary/30 border-b border-border shrink-0">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Zap size={13} className="text-primary" />
              Edytor TypeScript
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground"
                title="Kopiuj kod"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
              <button
                onClick={handleReset}
                className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground"
                title="Resetuj"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={handleRun}
                disabled={executing}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all',
                  executing
                    ? 'bg-secondary text-muted-foreground cursor-wait'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                )}
              >
                <Play size={13} />
                {executing ? 'Uruchamianie...' : 'Uruchom'}
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              defaultLanguage="typescript"
              theme="vs-dark"
              value={playgroundCode}
              onChange={(val) => setPlaygroundCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                padding: { top: 8 },
                suggest: {
                  showKeywords: true,
                  showSnippets: true,
                },
              }}
            />
          </div>
        </div>

        {/* Wynik panel */}
        <div className="lg:w-96 xl:w-112 flex flex-col border-t lg:border-t-0 lg:border-l border-border bg-card">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border shrink-0">
            <Terminal size={13} className="text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Wynik</span>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {playgroundOutput ? (
              <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {playgroundOutput}
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Bug size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Kliknij „Uruchom”, aby zobaczyć wynik</p>
                  <p className="text-[10px] mt-1 opacity-50">Edytuj kod w panelu po lewej</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}