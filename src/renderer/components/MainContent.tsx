import React, { lazy, Suspense, useEffect, useMemo, useState, useCallback } from 'react';
import { useAppStore } from '@stores/appStore';
import { getNextLesson, getPrevLesson, loadLessonById } from '@content/modules';
import { cn } from '@lib/utils';
import type { ExerciseResultRow, Module, ViewMode } from '../types';
import { BookOpen, Code2, HelpCircle, Play, Bookmark, StickyNote, ArrowLeft, ArrowRight, CheckCircle2, TrendingUp, Clock, Sparkles, GraduationCap, Target, Maximize2, Minimize2 } from 'lucide-react';

const LessonView = lazy(() => import('./LessonView').then((m) => ({ default: m.LessonView })));
const QuizView = lazy(() => import('./QuizView').then((m) => ({ default: m.QuizView })));
const Playground = lazy(() => import('./Playground').then((m) => ({ default: m.Playground })));
const NotesPanel = lazy(() => import('./NotesPanel').then((m) => ({ default: m.NotesPanel })));
const ResumeTracker = lazy(() => import('./ResumeTracker').then((m) => ({ default: m.ResumeTracker })));

function ContentFallback() {
  return <div className="h-full flex items-center justify-center text-xs text-muted-foreground animate-pulse">Ładowanie...</div>;
}

function CoursePanel({ modules }: { modules: Module[] }) {
  const { progress, setCurrentLesson, getModuleProgress } = useAppStore();
  const [overviewModuleId, setOverviewModuleId] = useState<number | null>(null);
  const overviewModule = modules.find((m) => m.id === overviewModuleId) ?? null;
  const [overviewExerciseStats, setOverviewExerciseStats] = useState<{
    total: number;
    completed: number;
    average: number;
    byLesson: Record<string, { total: number; completed: number; average: number }>;
  }>({ total: 0, completed: 0, average: 0, byLesson: {} });
  const [allExerciseResults, setAllExerciseResults] = useState<ExerciseResultRow[]>([]);
  const totalLessons = modules.reduce((acc, module) => acc + module.lessons.length, 0);
  const completed = Object.values(progress).filter((item) => item.completed).length;
  const percentage = totalLessons ? Math.round((completed / totalLessons) * 100) : 0;
  const allLessonRefs = modules.flatMap((module) => module.lessons.map((lesson) => ({ module, lesson })));
  const recentLesson = allLessonRefs
    .map((item) => ({ ...item, accessedAt: progress[`${item.module.id}-${item.lesson.id}`]?.lastAccessed }))
    .filter((item) => item.accessedAt)
    .sort((a, b) => new Date(b.accessedAt!).getTime() - new Date(a.accessedAt!).getTime())[0];
  const nextLesson = recentLesson ?? allLessonRefs.find(({ module, lesson }) => !progress[`${module.id}-${lesson.id}`]?.completed);
  const completedExerciseRows = allExerciseResults.filter((row) => row.completed || row.score >= 80);
  const averageExerciseScore = allExerciseResults.length
    ? Math.round(allExerciseResults.reduce((sum, row) => sum + row.score, 0) / allExerciseResults.length)
    : 0;

  useEffect(() => {
    window.electronAPI?.getAllExerciseResults().then((rows) => setAllExerciseResults(rows ?? []));
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadOverviewExerciseStats() {
      if (!overviewModule) {
        setOverviewExerciseStats({ total: 0, completed: 0, average: 0, byLesson: {} });
        return;
      }

      const rows = (await window.electronAPI?.getAllExerciseResults() ?? []) as ExerciseResultRow[];
      const byLesson: Record<string, { total: number; completed: number; average: number }> = {};
      let total = 0;
      let completed = 0;
      let scoreSum = 0;
      let scoredCount = 0;

      for (const lessonRef of overviewModule.lessons) {
        const fullLesson = await loadLessonById(overviewModule.id, lessonRef.id);
        const lessonTotal = fullLesson?.content.exercises.length ?? 0;
        const latest = new Map<string, ExerciseResultRow>();
        rows
          .filter((row) => row.module_id === overviewModule.id && row.lesson_id === lessonRef.id)
          .forEach((row) => latest.set(row.exercise_id, row));
        const lessonRows = [...latest.values()];
        const lessonCompleted = lessonRows.filter((row) => row.completed || row.score >= 80).length;
        const lessonAverage = lessonRows.length ? Math.round(lessonRows.reduce((sum, row) => sum + row.score, 0) / lessonRows.length) : 0;

        byLesson[lessonRef.id] = { total: lessonTotal, completed: lessonCompleted, average: lessonAverage };
        total += lessonTotal;
        completed += lessonCompleted;
        scoreSum += lessonRows.reduce((sum, row) => sum + row.score, 0);
        scoredCount += lessonRows.length;
      }

      if (!cancelled) {
        setOverviewExerciseStats({
          total,
          completed,
          average: scoredCount ? Math.round(scoreSum / scoredCount) : 0,
          byLesson,
        });
      }
    }

    loadOverviewExerciseStats();
    return () => {
      cancelled = true;
    };
  }, [overviewModule]);

  if (overviewModule) {
    const moduleProgress = getModuleProgress(overviewModule.id, overviewModule.lessons.length);
    return (
      <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
        <button onClick={() => setOverviewModuleId(null)} className="mb-4 text-xs text-muted-foreground hover:text-foreground">← Wróć do dashboardu</button>
        <div className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-4xl mb-3">{overviewModule.icon}</div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Moduł {overviewModule.id}</p>
              <h1 className="text-2xl sm:text-3xl font-bold mt-1">{overviewModule.title}</h1>
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">{overviewModule.description}</p>
            </div>
            <div className="grid min-w-52 gap-3">
              <div className="rounded-2xl bg-secondary/60 p-4">
                <div className="text-2xl font-bold text-primary">{moduleProgress}%</div>
                <div className="text-xs text-muted-foreground">postępu lekcji</div>
                <div className="mt-3 h-2 rounded-full bg-background overflow-hidden"><div className="h-full progress-gradient" style={{ width: `${moduleProgress}%` }} /></div>
              </div>
              <div className="rounded-2xl bg-secondary/60 p-4">
                <div className="text-2xl font-bold text-primary">{overviewExerciseStats.completed}/{overviewExerciseStats.total}</div>
                <div className="text-xs text-muted-foreground">zaliczonych ćwiczeń</div>
                <div className="mt-1 text-[11px] text-muted-foreground">średni wynik: {overviewExerciseStats.average}%</div>
                <div className="mt-3 h-2 rounded-full bg-background overflow-hidden"><div className="h-full progress-gradient" style={{ width: `${overviewExerciseStats.total ? Math.round((overviewExerciseStats.completed / overviewExerciseStats.total) * 100) : 0}%` }} /></div>
              </div>
            </div>
          </div>
          <div className="grid gap-2 mt-6">
            {overviewModule.lessons.map((lesson) => {
              const done = progress[`${overviewModule.id}-${lesson.id}`]?.completed;
              const exerciseStats = overviewExerciseStats.byLesson[lesson.id];
              return (
                <button key={lesson.id} onClick={() => setCurrentLesson(overviewModule.id, lesson.id)} className="group flex items-center gap-3 rounded-2xl border border-border bg-background/50 p-3 text-left transition-all hover:border-primary/40 hover:bg-primary/5">
                  <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl border', done ? 'border-green-500/30 bg-green-500/10 text-green-500' : 'border-border bg-card text-muted-foreground')}>
                    {done ? <CheckCircle2 size={18} /> : <BookOpen size={17} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium group-hover:text-primary">{lesson.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{lesson.description}</div>
                    {exerciseStats && exerciseStats.total > 0 && (
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>Ćwiczenia: {exerciseStats.completed}/{exerciseStats.total}</span>
                        <span>·</span>
                        <span>średnio {exerciseStats.average}%</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground">{lesson.duration}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <section className="rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-card to-card p-6 sm:p-8 shadow-sm overflow-hidden relative">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4"><Sparkles size={14} /> Ścieżka Full Stack Testera</div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Witaj w centrum nauki</h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">Kontynuuj kurs, wybierz moduł lub przejdź do praktyki. Panel pokazuje postęp bez zmuszania Cię do zaczynania od konkretnej lekcji.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {nextLesson && <button onClick={() => setCurrentLesson(nextLesson.module.id, nextLesson.lesson.id)} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90">{recentLesson ? 'Wróć do ostatniej lekcji' : 'Kontynuuj naukę'}</button>}
            <button onClick={() => setOverviewModuleId(1)} className="rounded-xl border border-border bg-background/70 px-4 py-2 text-sm font-medium hover:bg-accent">Przegląd modułów</button>
          </div>
        </div>
        <div className="absolute right-6 top-6 hidden md:block text-7xl opacity-20">🎭</div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 mt-5">
        <div className="rounded-2xl border border-border bg-card/80 p-4"><GraduationCap className="text-primary mb-2" size={20} /><div className="text-2xl font-bold">{completed}/{totalLessons}</div><div className="text-xs text-muted-foreground">ukończonych lekcji</div></div>
        <div className="rounded-2xl border border-border bg-card/80 p-4"><TrendingUp className="text-primary mb-2" size={20} /><div className="text-2xl font-bold">{percentage}%</div><div className="text-xs text-muted-foreground">postępu kursu</div></div>
        <div className="rounded-2xl border border-border bg-card/80 p-4"><Code2 className="text-primary mb-2" size={20} /><div className="text-2xl font-bold">{completedExerciseRows.length}</div><div className="text-xs text-muted-foreground">zaliczonych ćwiczeń</div><div className="text-[11px] text-muted-foreground mt-1">średnio {averageExerciseScore}%</div></div>
        <div className="rounded-2xl border border-border bg-card/80 p-4"><Target className="text-primary mb-2" size={20} /><div className="text-2xl font-bold">6</div><div className="text-xs text-muted-foreground">zadań egzaminu praktycznego</div></div>
        <div className="rounded-2xl border border-border bg-card/80 p-4"><Clock className="text-primary mb-2" size={20} /><div className="text-sm font-semibold truncate">{nextLesson ? nextLesson.lesson.title : 'Kurs ukończony'}</div><div className="text-xs text-muted-foreground mt-1">najbliższy cel</div></div>
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between mb-3"><h2 className="text-lg font-semibold">Moduły kursu</h2><span className="text-xs text-muted-foreground">{modules.length} modułów</span></div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {modules.map((module) => {
            const moduleProgress = getModuleProgress(module.id, module.lessons.length);
            return (
              <button key={module.id} onClick={() => setOverviewModuleId(module.id)} className="rounded-2xl border border-border bg-card/80 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                <div className="flex items-start gap-3"><span className="text-2xl">{module.icon}</span><div className="min-w-0 flex-1"><div className="text-sm font-semibold truncate">{module.title}</div><div className="text-xs text-muted-foreground mt-1 line-clamp-2">{module.description}</div></div></div>
                <div className="mt-4 flex items-center gap-2"><div className="h-2 flex-1 rounded-full bg-secondary overflow-hidden"><div className="h-full progress-gradient" style={{ width: `${moduleProgress}%` }} /></div><span className="text-[11px] text-muted-foreground w-9 text-right">{moduleProgress}%</span></div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

interface MainContentProps {
  modules: Module[];
  currentModuleId: number | null;
  currentLessonId: string | null;
}

export function MainContent({ modules, currentModuleId, currentLessonId }: MainContentProps) {
  const {
    currentView,
    setCurrentView,
    isBookmarked,
    toggleBookmark,
    isLessonCompleted,
    markLessonComplete,
    addAchievement,
  } = useAppStore();

  const [showNotes, setShowNotes] = useState(false);
  const [focusMode, setFocusMode] = useState(() => window.localStorage.getItem('reader-focus-mode') === 'true');

  const currentModule = useMemo(
    () => modules.find((m) => m.id === currentModuleId),
    [modules, currentModuleId]
  );

  const [currentLesson, setCurrentLessonContent] = useState<Module['lessons'][0] | undefined>();
  const [lessonLoading, setLessonLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadLesson() {
      if (!currentModuleId || !currentLessonId) {
        setCurrentLessonContent(undefined);
        return;
      }
      setLessonLoading(true);
      const lesson = await loadLessonById(currentModuleId, currentLessonId);
      if (!cancelled) {
        setCurrentLessonContent(lesson);
        setLessonLoading(false);
      }
    }
    loadLesson();
    return () => {
      cancelled = true;
    };
  }, [currentModuleId, currentLessonId]);

  useEffect(() => {
    window.localStorage.setItem('reader-focus-mode', String(focusMode));
  }, [focusMode]);

  const bookmarkKey = currentModuleId && currentLessonId
    ? `${currentModuleId}-${currentLessonId}`
    : '';

  const bookmarked = bookmarkKey ? isBookmarked(currentModuleId!, currentLessonId!) : false;

  const nextLesson = useMemo(
    () => (currentModuleId && currentLessonId ? getNextLesson(currentModuleId, currentLessonId) : null),
    [currentModuleId, currentLessonId]
  );

  const prevLesson = useMemo(
    () => (currentModuleId && currentLessonId ? getPrevLesson(currentModuleId, currentLessonId) : null),
    [currentModuleId, currentLessonId]
  );

  const handleComplete = useCallback(async () => {
    if (!currentModuleId || !currentLessonId) return;
    markLessonComplete(currentModuleId, currentLessonId);
    addAchievement('first-lesson');

    // Check if all Module 1 lessons completed
    const module = modules.find((m) => m.id === 1);
    if (module) {
      const allCompleted = module.lessons.every((l) => isLessonCompleted(1, l.id));
      if (allCompleted || (isLessonCompleted(1, currentLessonId) && module.lessons.slice(0, -1).every((l) => isLessonCompleted(1, l.id)))) {
        addAchievement('module-1-complete');
      }
    }
  }, [currentModuleId, currentLessonId, markLessonComplete, addAchievement, modules, isLessonCompleted]);

  const handleBookmarkToggle = useCallback(() => {
    if (bookmarkKey) {
      toggleBookmark(bookmarkKey);
    }
  }, [bookmarkKey, toggleBookmark]);

  const handleNavigate = useCallback(
    (moduleId: number, lessonId: string) => {
      const store = useAppStore.getState();
      store.setCurrentLesson(moduleId, lessonId);
    },
    []
  );

  if (lessonLoading) {
    return <ContentFallback />;
  }

  if (!currentModule || !currentLesson) {
    return <CoursePanel modules={modules} />;
  }

  const completed = currentModuleId && currentLessonId
    ? isLessonCompleted(currentModuleId, currentLessonId)
    : false;

  const tabs: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'theory', label: 'Teoria', icon: <BookOpen size={15} /> },
    { id: 'practice', label: 'Ćwiczenia', icon: <Code2 size={15} /> },
    { id: 'quiz', label: 'Quiz', icon: <HelpCircle size={15} /> },
    { id: 'playground', label: 'Plac zabaw', icon: <Play size={15} /> },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Lesson header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/70 bg-card/80 backdrop-blur shrink-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Moduł {currentModule.id} · {currentModule.title}
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
              {currentLesson.difficulty === 'beginner' ? '🟢 Podstawowy' : currentLesson.difficulty === 'intermediate' ? '🔵 Średni' : currentLesson.difficulty === 'advanced' ? '🟣 Zaawansowany' : '🟡 Expert'}
            </span>
          </div>
          <h1 className="text-base font-semibold truncate">{currentLesson.title}</h1>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setFocusMode(!focusMode)}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              focusMode ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-muted-foreground'
            )}
            title={focusMode ? 'Wyłącz tryb skupienia' : 'Tryb skupienia'}
          >
            {focusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          {/* Notes toggle */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              showNotes ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-muted-foreground'
            )}
            title="Notatki"
          >
            <StickyNote size={16} />
          </button>

          {/* Bookmark toggle */}
          <button
            onClick={handleBookmarkToggle}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              bookmarked ? 'bg-amber-400/10 text-amber-400' : 'hover:bg-accent text-muted-foreground'
            )}
            title={bookmarked ? 'Usuń zakładkę' : 'Dodaj zakładkę'}
          >
            <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
          </button>

          {/* Complete button */}
          <button
            onClick={handleComplete}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              completed
                ? 'bg-green-500/10 text-green-500'
                : 'bg-primary/10 text-primary hover:bg-primary/20'
            )}
          >
            <CheckCircle2 size={14} />
            <span className="hidden sm:inline">{completed ? 'Ukończone ✅' : 'Oznacz jako ukończone'}</span>
          </button>
        </div>
      </div>

      {/* View tabs */}
      {!focusMode && <div className="flex items-center gap-1 px-3 py-2 border-b border-border/70 bg-card/50 shrink-0 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentView(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap',
              currentView === tab.id
                ? 'bg-background text-primary shadow-sm ring-1 ring-border'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>}

      {/* Content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main content */}
        <div className={cn('flex-1 overflow-hidden', showNotes && 'border-r border-border')}>
          {currentView === 'theory' && <Suspense fallback={<ContentFallback />}><LessonView lesson={currentLesson} /></Suspense>}
          {currentView === 'practice' && <Suspense fallback={<ContentFallback />}><LessonView lesson={currentLesson} showExercises /></Suspense>}
          {currentView === 'quiz' && (
            <Suspense fallback={<ContentFallback />}>
              <QuizView
                moduleId={currentLesson.moduleId}
                lessonId={currentLesson.id}
                questions={currentLesson.content.quiz}
              />
            </Suspense>
          )}
          {currentView === 'playground' && <Suspense fallback={<ContentFallback />}><Playground /></Suspense>}
        </div>

        {/* Notes panel */}
        {showNotes && !focusMode && (
          <div className="w-72 shrink-0">
            <Suspense fallback={<ContentFallback />}><NotesPanel moduleId={currentModule.id} lessonId={currentLesson.id} /></Suspense>
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      {!focusMode && <div className="flex items-center justify-between px-4 py-3 border-t border-border/70 bg-card/80 shrink-0">
        <button
          onClick={() => prevLesson && handleNavigate(prevLesson.moduleId, prevLesson.lessonId)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors',
            prevLesson
              ? 'hover:bg-accent text-muted-foreground hover:text-foreground'
              : 'opacity-30 cursor-not-allowed text-muted-foreground'
          )}
          disabled={!prevLesson}
        >
          <ArrowLeft size={14} />
          Poprzednia lekcja
        </button>

        <span className="text-xs text-muted-foreground">{currentLesson.duration}</span>

        <button
          onClick={() => nextLesson && handleNavigate(nextLesson.moduleId, nextLesson.lessonId)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap',
            nextLesson
              ? 'bg-primary/10 text-primary hover:bg-primary/20'
              : 'opacity-30 cursor-not-allowed text-muted-foreground'
          )}
          disabled={!nextLesson}
        >
          Następna lekcja
          <ArrowRight size={14} />
        </button>
      </div>}
    </div>
  );
}