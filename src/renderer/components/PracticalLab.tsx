import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Code2,
  Database,
  FileCheck2,
  FlaskConical,
  GitBranch,
  Network,
  PlayCircle,
  RotateCcw,
  ShieldCheck,
  Trophy,
} from 'lucide-react';
import { cn } from '@lib/utils';

type LabArea = 'ui' | 'api' | 'db' | 'ci' | 'observability' | 'security';

type ValidationCheck = {
  id: string;
  label: string;
  hint: string;
  validate: (code: string) => boolean;
};

type LabTask = {
  id: string;
  area: LabArea;
  title: string;
  level: 'junior' | 'mid' | 'senior';
  scenario: string;
  goal: string;
  starterCode: string;
  checks: ValidationCheck[];
};

type SavedResults = Record<string, { score: number; passed: string[]; updatedAt: string }>;

const STORAGE_KEY = 'playwright-learning-practical-lab-results';

const has = (pattern: RegExp) => (code: string) => pattern.test(code);
const no = (pattern: RegExp) => (code: string) => !pattern.test(code);

export const LAB_TASKS: LabTask[] = [
  {
    id: 'ui-login-e2e',
    area: 'ui',
    title: 'E2E interfejsu użytkownika: logowanie i diagnostyka awarii',
    level: 'junior',
    scenario: 'Aplikacja SaaS ma krytyczny przepływ logowania. Test ma sprawdzić happy path, używać stabilnych lokatorów i zostawiać diagnostykę do analizy w CI.',
    goal: 'Napisz test Playwright z test.step, stabilnymi lokatorami, asercją sukcesu i attachmentem diagnostycznym.',
    starterCode: `import { test, expect } from '@playwright/test';

test('user can sign in', async ({ page }, testInfo) => {
  // TODO: uzupełnij test
});`,
    checks: [
      { id: 'uses-test-step', label: 'Używa test.step', hint: 'Podziel test na Arrange / Act / Assert.', validate: has(/test\.step\s*\(/) },
      { id: 'uses-stable-locators', label: 'Używa stabilnych lokatorów', hint: 'Preferuj getByRole, getByLabel lub getByTestId.', validate: has(/getBy(Role|Label|TestId)\s*\(/) },
      { id: 'has-assertion', label: 'Ma asercję sukcesu', hint: 'Dodaj expect(...).toBeVisible(), toHaveURL albo toContainText.', validate: has(/expect\s*\(.+\)\s*\./s) },
      { id: 'has-diagnostics', label: 'Dodaje diagnostykę', hint: 'Użyj testInfo.attach albo screenshot/trace w kontekście błędu.', validate: has(/testInfo\.attach|screenshot\s*\(/) },
      { id: 'no-hard-wait', label: 'Nie używa sztucznych timeoutów', hint: 'Zastąp waitForTimeout oczekiwaniem na stan interfejsu użytkownika.', validate: no(/waitForTimeout\s*\(/) },
    ],
  },
  {
    id: 'api-contract-negative',
    area: 'api',
    title: 'API: kontrakt, statusy i scenariusz negatywny',
    level: 'mid',
    scenario: 'Endpoint zamówień musi zwracać poprawny kontrakt dla autoryzowanego użytkownika i 401/403 dla użytkownika bez tokena.',
    goal: 'Napisz test API z walidacją statusu, body, nagłówków i scenariusza negatywnego.',
    starterCode: `import { test, expect } from '@playwright/test';

test('orders API follows contract', async ({ request }) => {
  // TODO: GET /api/orders
});`,
    checks: [
      { id: 'uses-request', label: 'Używa fixture request', hint: 'Wykonaj request.get/post/put/delete.', validate: has(/request\.(get|post|put|patch|delete)\s*\(/) },
      { id: 'checks-status', label: 'Sprawdza status HTTP', hint: 'Użyj expect(response.status()).toBe(...) albo toBeOK().', validate: has(/status\s*\(\)|toBeOK\s*\(/) },
      { id: 'checks-json', label: 'Parsuje JSON', hint: 'Użyj await response.json().', validate: has(/\.json\s*\(\s*\)/) },
      { id: 'checks-negative', label: 'Ma scenariusz negatywny', hint: 'Sprawdź brak tokena, błędne dane albo forbidden.', validate: has(/401|403|unauthori[sz]ed|forbidden|invalid/i) },
      { id: 'checks-contract', label: 'Weryfikuje kontrakt', hint: 'Sprawdź wymagane pola, typy, array/object lub nagłówek content-type.', validate: has(/toHaveProperty|content-type|Array\.isArray|typeof|schema/i) },
    ],
  },
  {
    id: 'db-integrity-check',
    area: 'db',
    title: 'Baza danych: weryfikacja integralności po operacji API/interfejsu użytkownika',
    level: 'mid',
    scenario: 'Po utworzeniu zamówienia tester musi potwierdzić spójność danych w tabelach orders i order_items oraz przygotować cleanup.',
    goal: 'Przygotuj fragment testu z transakcją/cleanupem, SELECT z JOIN i asercjami na dane.',
    starterCode: `import { test, expect } from '@playwright/test';

test('created order is persisted consistently', async () => {
  // TODO: query database and verify records
});`,
    checks: [
      { id: 'has-select', label: 'Używa SELECT', hint: 'Dodaj zapytanie pobierające rekordy.', validate: has(/select\s+/i) },
      { id: 'has-join', label: 'Sprawdza relacje przez JOIN', hint: 'Połącz tabelę główną i zależną.', validate: has(/join\s+/i) },
      { id: 'has-where', label: 'Filtruje po unikalnym identyfikatorze', hint: 'Użyj WHERE z orderId/runId.', validate: has(/where\s+/i) },
      { id: 'has-cleanup', label: 'Ma strategię cleanup', hint: 'Dodaj rollback, DELETE albo afterEach.', validate: has(/rollback|delete\s+from|afterEach|cleanup/i) },
      { id: 'has-assertion', label: 'Weryfikuje wynik', hint: 'Dodaj expect na liczbę rekordów lub wartości pól.', validate: has(/expect\s*\(/) },
    ],
  },
  {
    id: 'ci-pipeline-quality-gate',
    area: 'ci',
    title: 'CI/CD: quality gate dla testów Playwright',
    level: 'mid',
    scenario: 'Pipeline ma uruchamiać lint, typy, testy Playwright, publikować raport HTML/JUnit i archiwizować trace przy awarii.',
    goal: 'Przygotuj workflow GitHub Actions lub pseudo-YAML z cache, instalacją przeglądarek, testami i artefaktami.',
    starterCode: `name: e2e
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      # TODO: checkout, install, test, artifacts`,
    checks: [
      { id: 'checkout', label: 'Checkout repozytorium', hint: 'Dodaj actions/checkout.', validate: has(/actions\/checkout/) },
      { id: 'install', label: 'Instaluje zależności deterministycznie', hint: 'Użyj npm ci.', validate: has(/npm\s+ci/) },
      { id: 'browsers', label: 'Instaluje przeglądarki Playwright', hint: 'Dodaj npx playwright install --with-deps.', validate: has(/playwright\s+install/) },
      { id: 'quality-gate', label: 'Ma lint/typecheck/test', hint: 'Pipeline powinien mieć więcej niż samo e2e.', validate: has(/lint|typecheck|tsc|npm\s+test|playwright\s+test/i) },
      { id: 'artifacts', label: 'Publikuje artefakty', hint: 'Dodaj upload-artifact dla raportu/trace.', validate: has(/upload-artifact|artifact|playwright-report|test-results/i) },
    ],
  },
  {
    id: 'observability-correlation',
    area: 'observability',
    title: 'Obserwowalność: correlation ID i analiza incydentu',
    level: 'senior',
    scenario: 'Test E2E wykrywa błąd płatności. Musisz dodać correlation ID, zebrać kontekst i opisać, jak znajdziesz request w logach oraz trace.',
    goal: 'Dodaj nagłówek correlation ID, attachment z runId oraz checklistę logów/metryk do sprawdzenia.',
    starterCode: `import { test, expect } from '@playwright/test';

test('payment flow has observability context', async ({ page, context }, testInfo) => {
  // TODO: correlation id + diagnostics
});`,
    checks: [
      { id: 'correlation-id', label: 'Dodaje correlation ID', hint: 'Użyj x-correlation-id albo x-request-id.', validate: has(/correlation-id|x-request-id|traceparent/i) },
      { id: 'extra-headers', label: 'Ustawia nagłówki kontekstu', hint: 'Użyj setExtraHTTPHeaders lub request headers.', validate: has(/setExtraHTTPHeaders|headers\s*:/) },
      { id: 'attach-context', label: 'Załącza kontekst diagnostyczny', hint: 'Dodaj testInfo.attach z runId/correlationId.', validate: has(/testInfo\.attach/) },
      { id: 'mentions-logs', label: 'Uwzględnia logi/metryki/trace', hint: 'W komentarzu lub kodzie wskaż Grafana/Loki/Kibana/trace/logs.', validate: has(/logs|trace|grafana|loki|kibana|prometheus|metrics/i) },
      { id: 'has-assertion', label: 'Ma asercję biznesową', hint: 'Dodaj expect na rezultat płatności.', validate: has(/expect\s*\(/) },
    ],
  },
  {
    id: 'security-idor-check',
    area: 'security',
    title: 'Bezpieczeństwo: IDOR i izolacja tenantów',
    level: 'senior',
    scenario: 'Użytkownik A nie może pobrać zasobu użytkownika B. Test ma sprawdzić kontrolę dostępu i nie ujawniać sekretów w logach.',
    goal: 'Napisz test z dwoma kontekstami użytkowników, próbą dostępu cross-tenant i asercją 403/404.',
    starterCode: `import { test, expect } from '@playwright/test';

test('user cannot access another tenant resource', async ({ request }) => {
  // TODO: create users A/B and verify forbidden access
});`,
    checks: [
      { id: 'two-users', label: 'Modeluje dwóch użytkowników/tenantów', hint: 'Użyj userA/userB, tenantA/tenantB albo dwóch tokenów.', validate: has(/userA|userB|tenantA|tenantB|tokenA|tokenB/i) },
      { id: 'forbidden', label: 'Sprawdza odmowę dostępu', hint: 'Asercja 403, 404 albo forbidden.', validate: has(/403|404|forbidden|not found/i) },
      { id: 'no-secrets', label: 'Nie loguje sekretów', hint: 'Nie używaj console.log(token/password/secret).', validate: no(/console\.log\s*\([^)]*(token|password|secret)/i) },
      { id: 'negative-test', label: 'To jawny scenariusz negatywny', hint: 'Nazwij test cannot/should not/forbidden.', validate: has(/cannot|should not|forbidden|unauthorized|denied/i) },
      { id: 'assertion', label: 'Ma asercję bezpieczeństwa', hint: 'Dodaj expect na status/response body.', validate: has(/expect\s*\(/) },
    ],
  },
];

export const REQUIRED_PRACTICAL_TASK_IDS = LAB_TASKS.map((task) => task.id);

const MINI_APPS = [
  {
    icon: '🛒',
    name: 'Demo e-commerce',
    scope: 'interfejs użytkownika + API + baza danych',
    risks: ['koszyk i checkout', 'płatności', 'rabaty', 'stany magazynowe'],
  },
  {
    icon: '📊',
    name: 'Panel SaaS',
    scope: 'RBAC + multi-tenant',
    risks: ['uprawnienia', 'eksport danych', 'webhooki', 'audyt operacji'],
  },
  {
    icon: '🐞',
    name: 'Aplikacja z błędami',
    scope: 'laboratorium debugowania',
    risks: ['niestabilny interfejs użytkownika', 'race condition', 'błędy walidacji', 'złe statusy API'],
  },
  {
    icon: '♿',
    name: 'Sklep do ćwiczeń dostępności',
    scope: 'WCAG + visual',
    risks: ['kontrast', 'pułapka fokusu', 'nawigacja klawiaturą', 'ARIA'],
  },
];

const AREA_LABELS: Record<LabArea, string> = {
  ui: 'interfejs użytkownika',
  api: 'API',
  db: 'Baza danych',
  ci: 'CI/CD',
  observability: 'Obserwowalność',
  security: 'Bezpieczeństwo',
};

function loadResults(): SavedResults {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as SavedResults : {};
  } catch {
    return {};
  }
}

function saveResults(results: SavedResults) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
}

export function PracticalLab() {
  const [selectedTaskId, setSelectedTaskId] = useState(LAB_TASKS[0].id);
  const selectedTask = LAB_TASKS.find((task) => task.id === selectedTaskId) ?? LAB_TASKS[0];
  const [code, setCode] = useState(selectedTask.starterCode);
  const [results, setResults] = useState<SavedResults>(() => loadResults());
  const [dbLoaded, setDbLoaded] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    setCode(selectedTask.starterCode);
  }, [selectedTask]);

  useEffect(() => {
    async function loadExamResults() {
      try {
        const rows = await window.electronAPI?.getExamResults();
        if (rows) {
          const dbResults: SavedResults = {};
          for (const row of rows) {
            dbResults[row.task_id] = {
              score: row.score,
              passed: JSON.parse(row.passed_checks || '[]') as string[],
              updatedAt: row.updated_at,
            };
          }
          setResults((localResults) => ({ ...localResults, ...dbResults }));
        }
      } catch (error) {
        console.error('Failed to load practical exam results:', error);
      } finally {
        setDbLoaded(true);
      }
    }
    loadExamResults();
  }, []);

  useEffect(() => {
    saveResults(results);
  }, [results]);

  const evaluatedChecks = useMemo(
    () => selectedTask.checks.map((check) => ({ ...check, passed: check.validate(code) })),
    [selectedTask, code]
  );

  const score = Math.round((evaluatedChecks.filter((check) => check.passed).length / evaluatedChecks.length) * 100);
  const totalPassedTasks = Object.values(results).filter((result) => result.score === 100).length;
  const averageScore = Object.values(results).length
    ? Math.round(Object.values(results).reduce((acc, result) => acc + result.score, 0) / Object.values(results).length)
    : 0;

  const handleValidate = async () => {
    const passedChecks = evaluatedChecks.filter((check) => check.passed).map((check) => check.id);
    const updatedAt = new Date().toISOString();
    setResults((prev) => ({
      ...prev,
      [selectedTask.id]: {
        score,
        passed: passedChecks,
        updatedAt,
      },
    }));

    try {
      const result = await window.electronAPI?.saveExamResult({
        taskId: selectedTask.id,
        area: selectedTask.area,
        title: selectedTask.title,
        score,
        passedChecks,
        submittedCode: code,
      });
      setSaveMessage(result?.success ? 'Wynik zapisany w SQLite.' : 'Wynik zapisany lokalnie, ale nie w bazie.');
    } catch (error) {
      console.error('Failed to save practical exam result:', error);
      setSaveMessage('Wynik zapisany lokalnie. Zapis do SQLite nie powiódł się.');
    }

    setTimeout(() => setSaveMessage(null), 2500);
  };

  const handleReset = () => {
    setCode(selectedTask.starterCode);
  };

  return (
    <div className="h-full overflow-y-auto p-4 animate-fade-in">
      <div className="space-y-4">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FlaskConical size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Praktyka Full Stack Testera</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Rozwiązuj zadania z walidacją heurystyczną. To nie zastępuje prawdziwego uruchomienia testów,
                ale wymusza dobre praktyki: diagnostykę, asercje, izolację danych, kontrakty i quality gate.
              </p>
              <p className="text-[10px] text-muted-foreground mt-2">
                Status bazy: {dbLoaded ? 'wyniki synchronizowane z SQLite' : 'ładowanie wyników z SQLite...'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="rounded-lg bg-background/70 border border-border p-3">
              <div className="text-lg font-bold text-green-500">{totalPassedTasks}/{LAB_TASKS.length}</div>
              <div className="text-[10px] text-muted-foreground">zadań na 100%</div>
            </div>
            <div className="rounded-lg bg-background/70 border border-border p-3">
              <div className="text-lg font-bold text-primary">{averageScore}%</div>
              <div className="text-[10px] text-muted-foreground">średni wynik</div>
            </div>
            <div className="rounded-lg bg-background/70 border border-border p-3">
              <div className="text-lg font-bold text-amber-400">6</div>
              <div className="text-[10px] text-muted-foreground">obszarów praktyki</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Trophy size={15} /> Ścieżka egzaminu praktycznego</h3>
          <div className="space-y-2">
            {LAB_TASKS.map((task) => {
              const saved = results[task.id];
              const status = saved?.score === 100 ? 'Zaliczone' : saved ? 'W toku' : 'Do zrobienia';
              return (
                <button
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={cn(
                    'w-full text-left rounded-2xl border p-3 transition-all',
                    selectedTask.id === task.id ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20' : 'border-border hover:bg-accent/40 hover:border-primary/30'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                      {AREA_LABELS[task.area]}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground uppercase">
                      {task.level}
                    </span>
                    <span className={cn('ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium', saved?.score === 100 ? 'bg-green-500/10 text-green-500' : saved ? 'bg-amber-500/10 text-amber-500' : 'bg-secondary text-muted-foreground')}>{status}</span>
                  </div>
                  <div className="text-xs font-medium mt-1">{task.title}</div>
                  {saved && <div className="text-[10px] text-muted-foreground mt-1">Ostatni wynik: {saved.score}%</div>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Code2 size={16} className="text-primary" />
            <h3 className="font-semibold text-sm">{selectedTask.title}</h3>
            <span className="ml-auto text-xs font-bold text-primary">{score}%</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{selectedTask.scenario}</p>
          <p className="text-xs mb-3"><strong>Cel:</strong> {selectedTask.goal}</p>

          <textarea
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="w-full h-64 rounded-2xl border border-border bg-background/70 p-3 text-xs font-mono text-muted-foreground outline-none focus:border-primary resize-y"
            spellCheck={false}
          />

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleValidate}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90"
            >
              <PlayCircle size={14} /> Sprawdź rozwiązanie
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-xs font-medium hover:bg-secondary/80"
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          {saveMessage && (
            <div className="mt-3 text-xs rounded-md border border-green-500/30 bg-green-500/10 text-green-500 px-3 py-2">
              {saveMessage}
            </div>
          )}

          <div className="mt-4 space-y-2">
            {evaluatedChecks.map((check) => (
              <div key={check.id} className="flex items-start gap-2 text-xs">
                {check.passed ? <CheckCircle2 size={15} className="text-green-500 mt-0.5 shrink-0" /> : <Circle size={15} className="text-muted-foreground mt-0.5 shrink-0" />}
                <div>
                  <div className={check.passed ? 'text-green-500 font-medium' : 'font-medium'}>{check.label}</div>
                  {!check.passed && <div className="text-[10px] text-muted-foreground">{check.hint}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Network size={15} /> Mini aplikacje do ćwiczeń</h3>
          <div className="grid gap-2">
            {MINI_APPS.map((app) => (
              <div key={app.name} className="rounded-lg border border-border p-3 bg-background/50">
                <div className="flex items-center gap-2 text-sm font-medium"><span>{app.icon}</span>{app.name}</div>
                <div className="text-[10px] text-primary mt-1">{app.scope}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {app.risks.map((risk) => (
                    <span key={risk} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{risk}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 mb-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><FileCheck2 size={15} /> Egzamin praktyczny — kryteria zaliczenia</h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex gap-2"><ShieldCheck size={14} className="text-green-500 shrink-0" /> interfejs użytkownika: krytyczny przepływ z trace, screenshotem i stabilnymi lokatorami.</div>
            <div className="flex gap-2"><Network size={14} className="text-blue-500 shrink-0" /> API: kontrakt, negatywne statusy, autoryzacja i walidacja body.</div>
            <div className="flex gap-2"><Database size={14} className="text-purple-500 shrink-0" /> Baza danych: integralność danych, transakcje, cleanup i kontrola migracji.</div>
            <div className="flex gap-2"><GitBranch size={14} className="text-amber-500 shrink-0" /> CI/CD: quality gate, raporty, artefakty i progi jakości.</div>
            <div className="flex gap-2"><FlaskConical size={14} className="text-primary shrink-0" /> Portfolio: README z decyzjami, instrukcją uruchomienia i interpretacją wyników.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
