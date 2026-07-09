import React, { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { ExerciseResultRow, Lesson } from '../types';
import { ChevronDown, ChevronRight, Copy, Check, Play, Lightbulb, AlertTriangle, ExternalLink, Code2, ListTree } from 'lucide-react';
import { cn } from '@lib/utils';

const Editor = lazy(() => import('@monaco-editor/react'));

function EditorFallback() {
  return <div className="h-full flex items-center justify-center text-xs text-muted-foreground bg-secondary/30">Ładowanie edytora...</div>;
}

function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function getNodeText(children: React.ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(getNodeText).join('');
  if (React.isValidElement<{ children?: React.ReactNode }>(children)) return getNodeText(children.props.children);
  return '';
}

interface LessonViewProps {
  lesson: Lesson;
  showExercises?: boolean;
}

function CodeBlock({ code, language = 'typescript' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-border">
      <div className="flex items-center justify-between px-4 py-1.5 bg-secondary/80 text-xs text-muted-foreground font-mono">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-accent transition-colors"
        >
          {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
          <span>{copied ? 'Skopiowane!' : 'Kopiuj'}</span>
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          padding: '1rem',
          fontSize: '13px',
          lineHeight: '1.5',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

type ExerciseValidationRule = {
  id: string;
  label: string;
  hint: string;
  validate: (answer: string) => boolean;
};

function has(pattern: RegExp) {
  return (answer: string) => pattern.test(answer);
}

function not(pattern: RegExp) {
  return (answer: string) => !pattern.test(answer);
}

function wordCount(answer: string) {
  return answer.trim().split(/\s+/).filter(Boolean).length;
}

function bulletCount(answer: string) {
  return (answer.match(/^\s*(?:[-*•]|\d+[.)]|✅|☑|\[ \]|\[x\])/gim) ?? []).length;
}

function buildExerciseValidationRules(exercise: Lesson['content']['exercises'][0]): ExerciseValidationRule[] {
  const title = exercise.title.toLowerCase();
  const description = exercise.description.toLowerCase();
  const combined = `${title} ${description}`;
  const isCodeExercise = Boolean(exercise.startingCode) || /kod|test|config|konfigurac|sql|api|yaml|pipeline|selektor|lokator|fixture|pom|page object/i.test(combined);

  const rules: ExerciseValidationRule[] = [
    {
      id: 'substantive-answer',
      label: isCodeExercise ? 'Rozwiązanie zawiera konkretny kod lub konfigurację' : 'Odpowiedź jest wystarczająco konkretna',
      hint: isCodeExercise
        ? 'Dodaj fragment kodu, konfiguracji, zapytania SQL albo komendy — samo ogólne zdanie nie wystarczy.'
        : 'Napisz co najmniej kilka zdań. Odpowiedź powinna mieć kontekst, decyzję i uzasadnienie.',
      validate: isCodeExercise
        ? has(/(test\s*\(|expect\s*\(|await\s+|export\s+default|defineConfig|SELECT\s+|JOIN\s+|curl\s+|npm\s+|npx\s+|yaml|steps:|jobs:|class\s+|function\s+)/i)
        : (answer) => wordCount(answer) >= 35,
    },
    {
      id: 'risk-or-purpose',
      label: 'Wskazuje cel albo ryzyko',
      hint: 'Wyjaśnij, jakie ryzyko ogranicza rozwiązanie albo jaki cel jakościowy wspiera.',
      validate: has(/\b(ryzyk|cel|po co|dlaczego|chroni|zapobiega|wartość|problem|awari|regresj|jakość)\b/i),
    },
    {
      id: 'observable-result',
      label: 'Opisuje obserwowalny rezultat',
      hint: 'Dodaj asercję, oczekiwany stan, status, komunikat, rekord, raport albo inny dowód powodzenia.',
      validate: has(/\b(expect|aserc|sprawd|rezultat|wynik|status|komunikat|url|rekord|raport|dowód|toBe|toHave|toContain)\b/i),
    },
  ];

  if (/minimalny|scenariusz|przykład|test/i.test(combined)) {
    rules.push({
      id: 'has-structure',
      label: 'Ma strukturę przygotowanie → działanie → weryfikacja',
      hint: 'Pokaż setup/stany wejściowe, akcję oraz końcową asercję.',
      validate: has(/(goto|request\.|setup|przygot|arrange|given|when|act|click|fill|post|get|select|insert|assert|expect|then|weryfik)/i),
    });
  }

  if (/stabiliz|timeout|synchron/i.test(combined)) {
    rules.push({
      id: 'no-hard-wait',
      label: 'Nie używa sztucznego oczekiwania',
      hint: 'Zastąp waitForTimeout oczekiwaniem na stan UI, odpowiedź API albo stan danych.',
      validate: not(/waitForTimeout\s*\(|setTimeout\s*\(|sleep\s*\(\s*\d+/i),
    });
    rules.push({
      id: 'state-wait',
      label: 'Czeka na znaczący stan',
      hint: 'Użyj expect(...), waitForResponse, toHaveURL, toBeVisible albo innego warunku domenowego.',
      validate: has(/(expect\s*\(|waitForResponse|waitForEvent|toHaveURL|toBeVisible|toContainText|poll|eventually)/i),
    });
  }

  if (/diagnost|trace|raport|debug|awari/i.test(combined)) {
    rules.push({
      id: 'diagnostics',
      label: 'Dodaje diagnostykę awarii',
      hint: 'Uwzględnij trace, screenshot/zrzut ekranu, test.step, logi, raport albo załącznik testInfo.',
      validate: has(/(trace|screenshot|zrzut|test\.step|testInfo\.attach|log|raport|artifact|artefakt|correlation|diagnost)/i),
    });
  }

  if (/lokator|selektor|refaktor|getby|ui|interfejs/i.test(combined)) {
    rules.push({
      id: 'semantic-locators',
      label: 'Preferuje lokatory semantyczne',
      hint: 'Użyj getByRole, getByLabel, getByText albo świadomego getByTestId.',
      validate: has(/(getByRole|getByLabel|getByText|getByTestId|rola|etykiet|tekst dostęp|semantycz)/i),
    });
    rules.push({
      id: 'no-fragile-selector',
      label: 'Unika kruchych selektorów bez uzasadnienia',
      hint: 'Unikaj nth-child, długiego XPath i przypadkowych klas CSS.',
      validate: not(/(nth-child|\/\/\w|locator\(['\"]\.[a-z0-9_-]+['\"]\)\.nth|\.nth\(\s*\d+\s*\))/i),
    });
  }

  if (/antywzorz|błęd|problem/i.test(combined)) {
    rules.push({
      id: 'anti-pattern',
      label: 'Pokazuje antywzorzec i jego skutek',
      hint: 'Nazwij błędne podejście i wyjaśnij, dlaczego będzie problemem w utrzymaniu albo CI.',
      validate: has(/(antywzorz|źle|błęd|problem|dlatego|ponieważ|skutek|konsekwenc|ci|utrzym)/i),
    });
  }

  if (/checklist|review|przegląd/i.test(combined)) {
    rules.push({
      id: 'checklist',
      label: 'Zawiera checklistę minimum 4 punktów',
      hint: 'Dodaj wypunktowaną listę kryteriów przeglądu.',
      validate: (answer) => bulletCount(answer) >= 4,
    });
  }

  if (/dane|data|baza|sql|api/i.test(combined)) {
    rules.push({
      id: 'test-data',
      label: 'Uwzględnia dane testowe i izolację',
      hint: 'Opisz setup danych, unikalność, cleanup, API lub bazę danych.',
      validate: has(/(dane|setup|cleanup|sprząt|izolac|unikal|api|baza|sql|seed|factory|builder)/i),
    });
  }

  if (/ci|pipeline|github|gitlab|jenkins|raport/i.test(combined)) {
    rules.push({
      id: 'ci-ready',
      label: 'Nadaje się do CI albo raportowania',
      hint: 'Uwzględnij skrypt, artefakty, raport, sekrety, zmienne środowiskowe lub warunki pipeline.',
      validate: has(/(ci|pipeline|workflow|artifact|artefakt|report|raport|secret|sekret|env|junit|html|npm|npx)/i),
    });
  }

  return rules.slice(0, 7);
}

function ExerciseCard({ exercise, index, moduleId, lessonId, onProgressChange }: { exercise: Lesson['content']['exercises'][0]; index: number; moduleId: number; lessonId: string; onProgressChange?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const storageKey = `exercise-answer:${exercise.id}`;
  const [userCode, setUserCode] = useState(() => window.localStorage.getItem(storageKey) || exercise.startingCode || '');
  const [isRunning, setIsRunning] = useState(false);
  const [runOutput, setRunOutput] = useState('');
  const validationRules = useMemo(() => buildExerciseValidationRules(exercise), [exercise]);
  const passedRuleIds = useMemo(() => validationRules.filter((rule) => rule.validate(userCode)).map((rule) => rule.id), [userCode, validationRules]);
  const validationScore = validationRules.length ? Math.round((passedRuleIds.length / validationRules.length) * 100) : 0;
  const exercisePassed = validationRules.length > 0 && validationScore >= 80;

  useEffect(() => {
    let cancelled = false;
    async function loadSavedExerciseResult() {
      const saved = await window.electronAPI?.getExerciseResult(moduleId, lessonId, exercise.id);
      if (cancelled || !saved?.answer) return;
      const localAnswer = window.localStorage.getItem(storageKey);
      if (!localAnswer) setUserCode(saved.answer);
    }
    loadSavedExerciseResult();
    return () => {
      cancelled = true;
    };
  }, [exercise.id, lessonId, moduleId, storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, userCode);
    if (!userCode.trim()) return;
    const timer = window.setTimeout(async () => {
      await window.electronAPI?.saveExerciseResult({ 
        moduleId,
        lessonId,
        exerciseId: exercise.id,
        score: validationScore,
        passedChecks: passedRuleIds,
        answer: userCode,
      });
      onProgressChange?.();
    }, 600);
    return () => window.clearTimeout(timer);
  }, [exercise.id, lessonId, moduleId, onProgressChange, passedRuleIds, storageKey, userCode, validationScore]);

  const handleRunExercise = async () => {
    setIsRunning(true);
    setRunOutput('⏳ Uruchamianie kodu ćwiczenia...');
    try {
      const result = await window.electronAPI?.runPlaygroundTest(userCode);
      if (!result) {
        setRunOutput('❌ API uruchamiania testów jest niedostępne. Uruchom aplikację w trybie Electron.');
        return;
      }
      const duration = `${(result.durationMs / 1000).toFixed(2)} s`;
      setRunOutput(
        `${result.success ? '✅ Test przeszedł' : '❌ Test nie przeszedł'}\n` +
        `Kod wyjścia: ${result.exitCode ?? 'brak'}\n` +
        `Czas: ${duration}\n` +
        `Plik testu: ${result.testFile}\n\n` +
        `${result.error ? `Błąd: ${result.error}\n\n` : ''}` +
        `--- STDOUT ---\n${result.stdout || '(brak)'}\n\n` +
        `--- STDERR ---\n${result.stderr || '(brak)'}\n`
      );
    } catch (error) {
      setRunOutput(`❌ Błąd uruchomienia: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left"
      >
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
          {index + 1}
        </span>
        <span className="font-medium text-sm flex-1">{exercise.title}</span>
        <span className={cn(
          'hidden sm:inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold',
          exercisePassed
            ? 'bg-green-500/10 text-green-500'
            : validationScore > 0
              ? 'bg-amber-500/10 text-amber-500'
              : 'bg-secondary text-muted-foreground'
        )}>
          {validationScore}%
        </span>
        <Code2 size={14} className="text-muted-foreground" />
        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border">
          <p className="text-sm text-muted-foreground my-3">{exercise.description}</p>

          {exercise.startingCode ? (
            <div className="mb-3">
              <div className="text-xs font-medium text-muted-foreground mb-2">Edytor kodu:</div>
              <div className="h-48 border border-border rounded-lg overflow-hidden">
                <Suspense fallback={<EditorFallback />}>
                  <Editor
                    height="100%"
                    defaultLanguage="typescript"
                    theme="vs-dark"
                    value={userCode}
                    onChange={(val) => setUserCode(val || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                    }}
                  />
                </Suspense>
              </div>
              <button
                onClick={handleRunExercise}
                disabled={isRunning}
                className={cn(
                  'flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-md text-xs transition-colors',
                  isRunning
                    ? 'bg-secondary text-muted-foreground cursor-wait'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                )}
              >
                <Play size={13} /> {isRunning ? 'Uruchamianie...' : 'Uruchom kod'}
              </button>
              {runOutput && (
                <pre className="mt-3 max-h-72 overflow-auto rounded-lg border border-border bg-secondary/30 p-3 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {runOutput}
                </pre>
              )}
            </div>
          ) : (
            <div className="mb-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="text-xs font-medium text-muted-foreground">Twoje rozwiązanie:</div>
                <button
                  onClick={() => setUserCode('')}
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Wyczyść
                </button>
              </div>
              <textarea
                value={userCode}
                onChange={(event) => setUserCode(event.target.value)}
                placeholder="Wpisz odpowiedź, plan testu, checklistę albo wklej fragment kodu. Kryteria poniżej będą aktualizować się automatycznie."
                className="min-h-40 w-full resize-y rounded-lg border border-border bg-background/70 p-3 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
              />
            </div>
          )}

          <div className="mb-3 rounded-xl border border-border bg-secondary/20 p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-semibold">Automatyczne kryteria zaliczenia</div>
                <div className="text-[11px] text-muted-foreground">{passedRuleIds.length}/{validationRules.length} spełnionych · próg zaliczenia: 80%</div>
              </div>
              <span className={cn(
                'rounded-full px-2.5 py-1 text-xs font-semibold',
                exercisePassed ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
              )}>
                {exercisePassed ? 'Zaliczone' : `${validationScore}%`}
              </span>
            </div>
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-background">
              <div className={cn('h-full transition-all', exercisePassed ? 'bg-green-500' : 'progress-gradient')} style={{ width: `${validationScore}%` }} />
            </div>
            <ul className="space-y-2">
              {validationRules.map((rule) => {
                const passed = rule.validate(userCode);
                return (
                  <li key={rule.id} className="flex items-start gap-2 text-xs">
                    <span className={cn('mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border', passed ? 'border-green-500 bg-green-500/10 text-green-500' : 'border-border text-muted-foreground')}>
                      {passed ? <Check size={11} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                    </span>
                    <span>
                      <span className={passed ? 'text-foreground' : 'text-muted-foreground'}>{rule.label}</span>
                      {!passed && <span className="block text-[11px] text-muted-foreground/80">{rule.hint}</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {exercise.hints && exercise.hints.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:underline"
              >
                <Lightbulb size={13} />
                {showHint ? 'Ukryj podpowiedzi' : 'Pokaż podpowiedzi'}
              </button>
              {showHint && (
                <ul className="mt-2 space-y-1">
                  {exercise.hints.map((hint, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <Lightbulb size={12} className="text-amber-400 mt-0.5 shrink-0" />
                      {hint}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function LessonView({ lesson, showExercises = false }: LessonViewProps) {
  const [showTips, setShowTips] = useState(true);
  const [showMistakes, setShowMistakes] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [showMobileToc, setShowMobileToc] = useState(false);
  const [exerciseResults, setExerciseResults] = useState<ExerciseResultRow[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollStorageKey = `lesson-scroll:${lesson.moduleId}:${lesson.id}`;
  const toc = useMemo(() => {
    const used = new Map<string, number>();
    return [...lesson.content.theory.matchAll(/^#{2,3}\s+(.+)$/gm)]
      .map((match) => {
        const title = match[1].replace(/[`*_]/g, '').trim();
        const baseSlug = slugifyHeading(title);
        const count = used.get(baseSlug) ?? 0;
        used.set(baseSlug, count + 1);
        return {
          title,
          level: match[0].startsWith('###') ? 3 : 2,
          id: count === 0 ? baseSlug : `${baseSlug}-${count + 1}`,
        };
      })
      .slice(0, 80);
  }, [lesson.content.theory]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || showExercises) return;

    // Zawsze zaczynamy od początku lekcji
    container.scrollTop = 0;
    requestAnimationFrame(() => {
    });

    const updateReadingState = () => {
      const maxScroll = Math.max(1, container.scrollHeight - container.clientHeight);
      const progress = Math.min(100, Math.max(0, Math.round((container.scrollTop / maxScroll) * 100)));
      setReadingProgress(progress);
      window.localStorage.setItem(scrollStorageKey, String(container.scrollTop));

      let current = toc[0]?.id ?? '';
      const containerTop = container.getBoundingClientRect().top;
      for (const item of toc) {
        const element = document.getElementById(item.id);
        if (!element || !container.contains(element)) continue;
        const top = element.getBoundingClientRect().top - containerTop;
        if (top <= 96) current = item.id;
        else break;
      }
      setActiveHeading(current);
    };

    updateReadingState();
    container.addEventListener('scroll', updateReadingState, { passive: true });
    return () => container.removeEventListener('scroll', updateReadingState);
  }, [lesson.id, lesson.moduleId, scrollStorageKey, showExercises, toc]);

  const scrollToHeading = (id: string) => {
    const container = scrollContainerRef.current;
    const element = document.getElementById(id);
    if (!container || !element || !container.contains(element)) return;
    const containerTop = container.getBoundingClientRect().top;
    const targetTop = element.getBoundingClientRect().top - containerTop + container.scrollTop - 20;
    container.scrollTo({ top: targetTop, behavior: 'smooth' });
    setActiveHeading(id);
    setShowMobileToc(false);
  };

  const loadExerciseResults = useCallback(async () => {
    const rows = await window.electronAPI?.getExerciseResultsForLesson(lesson.moduleId, lesson.id);
    setExerciseResults(rows ?? []);
  }, [lesson.id, lesson.moduleId]);

  useEffect(() => {
    if (!showExercises) return;
    loadExerciseResults();
  }, [loadExerciseResults, showExercises]);

  const exerciseStats = useMemo(() => {
    const total = lesson.content.exercises.length;
    const latestByExercise = new Map<string, ExerciseResultRow>();
    for (const row of exerciseResults) latestByExercise.set(row.exercise_id, row);
    const rows = [...latestByExercise.values()];
    const completed = rows.filter((row) => row.completed || row.score >= 80).length;
    const average = rows.length ? Math.round(rows.reduce((sum, row) => sum + row.score, 0) / rows.length) : 0;
    return { total, completed, average };
  }, [exerciseResults, lesson.content.exercises.length]);

  if (showExercises) {
    return (
      <div className="h-full overflow-y-auto p-6 animate-fade-in">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold mb-1">Ćwiczenia praktyczne</h2>
          <p className="text-sm text-muted-foreground mb-4">{lesson.description}</p>

          <div className="mb-6 rounded-2xl border border-border bg-card/70 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Postęp ćwiczeń w tej lekcji</div>
                <div className="text-xs text-muted-foreground">{exerciseStats.completed}/{exerciseStats.total} zaliczonych · średni wynik {exerciseStats.average}%</div>
              </div>
              <div className={cn('rounded-full px-3 py-1 text-xs font-semibold', exerciseStats.completed === exerciseStats.total && exerciseStats.total > 0 ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary')}>
                {exerciseStats.total ? Math.round((exerciseStats.completed / exerciseStats.total) * 100) : 0}% lekcji
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full progress-gradient transition-all" style={{ width: `${exerciseStats.total ? Math.round((exerciseStats.completed / exerciseStats.total) * 100) : 0}%` }} />
            </div>
          </div>

          <div className="space-y-2">
            {lesson.content.exercises.map((exercise, index) => (
              <ExerciseCard key={exercise.id} exercise={exercise} index={index} moduleId={lesson.moduleId} lessonId={lesson.id} onProgressChange={loadExerciseResults} />
            ))}
          </div>

          {/* Code Examples */}
          {lesson.content.codeExamples.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Code2 size={18} /> Przykładowy kod
              </h3>
              {lesson.content.codeExamples.map((code, i) => (
                <CodeBlock key={i} code={code} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const headingRenderCounts = new Map<string, number>();
  const createHeadingId = (children: React.ReactNode) => {
    const baseSlug = slugifyHeading(getNodeText(children));
    const count = headingRenderCounts.get(baseSlug) ?? 0;
    headingRenderCounts.set(baseSlug, count + 1);
    return count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;
  };

  return (
    <div ref={scrollContainerRef} className="h-full overflow-y-auto p-4 sm:p-6 animate-fade-in reading-scroll">
      <div className="sticky top-0 z-20 -mx-4 -mt-4 mb-4 border-b border-border/70 bg-background/90 px-4 py-2 backdrop-blur sm:-mx-6 sm:-mt-6 sm:px-6 xl:hidden">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setShowMobileToc((value) => !value)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent"
          >
            <ListTree size={14} /> Spis treści
          </button>
          <div className="min-w-28 flex-1">
            <div className="mb-1 flex justify-between text-[10px] text-muted-foreground"><span>Postęp czytania</span><span>{readingProgress}%</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full progress-gradient transition-all" style={{ width: `${readingProgress}%` }} /></div>
          </div>
        </div>
        {showMobileToc && (
          <div className="mt-3 max-h-72 overflow-auto rounded-2xl border border-border bg-card p-3 shadow-lg">
            {toc.length === 0 ? <p className="text-xs text-muted-foreground">Brak nagłówków w lekcji.</p> : toc.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToHeading(item.id)}
                className={cn(
                  'block w-full rounded-lg px-2 py-1.5 text-left text-xs leading-snug hover:bg-accent',
                  item.level === 3 && 'pl-5 opacity-80',
                  activeHeading === item.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                )}
              >
                {item.title}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <article className="max-w-3xl mx-auto w-full rounded-3xl bg-card/40 p-0 sm:p-2">
        {/* Objective */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
            🎯 Cel lekcji
          </h3>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            className="text-sm text-muted-foreground prose-sm"
          >
            {lesson.content.objective}
          </ReactMarkdown>
        </div>

        {/* Theory */}
        <div className="markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              h2({ children, ...props }) {
                const id = createHeadingId(children);
                return <h2 id={id} className="scroll-mt-24" {...props}>{children}</h2>;
              },
              h3({ children, ...props }) {
                const id = createHeadingId(children);
                return <h3 id={id} className="scroll-mt-24" {...props}>{children}</h3>;
              },
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !match;
                const codeString = String(children).replace(/\n$/, '');

                if (isInline) {
                  return (
                    <code className="bg-secondary px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  );
                }

                return <CodeBlock code={codeString} language={match![1]} />;
              },
              a({ href, children }) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1"
                    onClick={(e) => {
                      e.preventDefault();
                      if (href) window.electronAPI?.openExternal(href);
                    }}
                  >
                    {children}
                    <ExternalLink size={12} />
                  </a>
                );
              },
            }}
          >
            {lesson.content.theory}
          </ReactMarkdown>
        </div>

        {/* Code examples */}
        {lesson.content.codeExamples.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Code2 size={18} /> Kod przykładowy
            </h3>
            {lesson.content.codeExamples.map((code, i) => (
              <CodeBlock key={i} code={code} />
            ))}
          </div>
        )}

        {/* Wskazówki i triki */}
        {lesson.content.tipsAndTricks.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setShowTips(!showTips)}
              className="flex items-center gap-2 text-sm font-semibold mb-3 hover:text-primary transition-colors"
            >
              <Lightbulb size={16} className="text-amber-400" />
              Wskazówki i triki
              {showTips ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {showTips && (
              <ul className="space-y-2">
                {lesson.content.tipsAndTricks.map((tip, i) => (
                  <li key={i} className="text-sm text-muted-foreground bg-accent/30 rounded-lg p-3">
                    {tip}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Common Mistakes */}
        {lesson.content.commonMistakes.length > 0 && (
          <div className="mt-4 mb-8">
            <button
              onClick={() => setShowMistakes(!showMistakes)}
              className="flex items-center gap-2 text-sm font-semibold mb-3 hover:text-destructive transition-colors"
            >
              <AlertTriangle size={16} className="text-destructive" />
              Częste błędy
              {showMistakes ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {showMistakes && (
              <div className="space-y-3">
                {lesson.content.commonMistakes.map((cm, i) => (
                  <div key={i} className="border border-destructive/20 rounded-lg p-4 bg-destructive/5">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-destructive font-bold">❌</span>
                      <div>
                        <p className="text-sm font-medium text-destructive">{cm.mistake}</p>
                        <p className="text-sm text-muted-foreground mt-1">✅ {cm.solution}</p>
                      </div>
                    </div>
                    {cm.codeExample && <CodeBlock code={cm.codeExample} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* References */}
        {lesson.content.references && lesson.content.references.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <ExternalLink size={15} /> Referencje i linki
            </h3>
            <ul className="space-y-2">
              {lesson.content.references.map((ref, i) => (
                <li key={i}>
                  <button
                    onClick={() => window.electronAPI?.openExternal(ref.url)}
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {ref.title}
                    <ExternalLink size={11} />
                  </button>
                  {ref.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{ref.description}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        </article>
        <aside className="hidden xl:block">
          <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-hidden rounded-2xl border border-border bg-card/70 p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"><ListTree size={14} /> W tym rozdziale</div>
            <div className="mb-4">
              <div className="mb-1 flex justify-between text-[10px] text-muted-foreground"><span>Postęp czytania</span><span>{readingProgress}%</span></div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full progress-gradient transition-all" style={{ width: `${readingProgress}%` }} /></div>
            </div>
            <div className="max-h-[calc(100vh-8.5rem)] space-y-1 overflow-auto pr-1">
              {toc.length === 0 ? <p className="text-xs text-muted-foreground">Czytaj w swoim tempie — najważniejsze sekcje znajdziesz w treści lekcji.</p> : toc.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToHeading(item.id)}
                  className={cn(
                    'block w-full rounded-lg px-2 py-1.5 text-left text-xs leading-snug transition-colors hover:bg-accent',
                    item.level === 3 && 'pl-5 opacity-80',
                    activeHeading === item.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                  )}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}