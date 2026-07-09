import React, { useMemo } from 'react';
import { useAppStore } from '@stores/appStore';
import { allModules } from '@content/modules';
import { Play, Clock, BarChart3, TrendingUp, BookOpen } from 'lucide-react';
import { cn } from '@lib/utils';

export function ResumeTracker() {
  const { progress, setCurrentLesson } = useAppStore();

  const stats = useMemo(() => {
    let completed = 0;
    let total = 0;
    let totalTime = 0;
    let lastAccessed: { moduleId: number; lessonId: string; time: string; title: string } | null = null;

    for (const module of allModules) {
      for (const lesson of module.lessons) {
        total++;
        const key = `${module.id}-${lesson.id}`;
        const p = progress[key];
        if (p) {
          if (p.completed) completed++;
          totalTime += p.timeSpent || 0;
          const accessTime = p.lastAccessed ? new Date(p.lastAccessed).getTime() : 0;
          if (!lastAccessed || accessTime > new Date(lastAccessed.time).getTime()) {
            lastAccessed = { moduleId: module.id, lessonId: lesson.id, time: p.lastAccessed || '', title: lesson.title };
          }
        }
      }
    }

    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      totalTimeMinutes: Math.round(totalTime / 60),
      lastAccessed,
    };
  }, [progress]);

  const handleResume = () => {
    if (stats.lastAccessed) {
      setCurrentLesson(stats.lastAccessed.moduleId, stats.lastAccessed.lessonId);
    }
  };

  // Find next uncompleted lesson
  const nextLesson = useMemo(() => {
    for (const module of allModules) {
      for (const lesson of module.lessons) {
        const key = `${module.id}-${lesson.id}`;
        if (!progress[key]?.completed) {
          return { moduleId: module.id, lessonId: lesson.id, title: lesson.title, moduleTitle: module.title };
        }
      }
    }
    return null;
  }, [progress]);

  const handleNextLesson = () => {
    if (nextLesson) {
      setCurrentLesson(nextLesson.moduleId, nextLesson.lessonId);
    }
  };

  if (allModules.length === 0) return null;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <h2 className="text-lg font-bold mb-4">\ud83d\udcc8 Twoj postep</h2>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
          <div className="text-2xl font-bold text-green-500">{stats.percentage}%</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Ukonczonych lekcji</div>
          <div className="text-xs text-muted-foreground">{stats.completed}/{stats.total} lekcji</div>
        </div>
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
          <div className="text-2xl font-bold text-primary">{stats.totalTimeMinutes}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Minut nauki</div>
          <div className="text-xs text-muted-foreground">~{Math.round(stats.totalTimeMinutes / 60)} godzin</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-purple-400 rounded-full transition-all duration-700" style={{ width: `${stats.percentage}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>Postep calkowity</span>
          <span className="font-medium">{stats.percentage}%</span>
        </div>
      </div>

      {/* Resume / Continue */}
      <div className="space-y-2">
        {/* Last accessed */}
        {stats.lastAccessed && (
          <button onClick={handleResume}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-left">
            <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
              <Play size={18} fill="currentColor" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-primary">Kontynuuj nauke</div>
              <div className="text-sm truncate mt-0.5">{stats.lastAccessed.title}</div>
              <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                <Clock size={10} />
                <span>Ostatnio: {new Date(stats.lastAccessed.time).toLocaleDateString('pl-PL')}</span>
              </div>
            </div>
          </button>
        )}

        {/* Next uncompleted */}
        {nextLesson && (
          <button onClick={handleNextLesson}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors text-left">
            <div className="p-2 rounded-full bg-secondary text-muted-foreground shrink-0">
              <TrendingUp size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold">Nastepna lekcja</div>
              <div className="text-sm truncate mt-0.5">{nextLesson.title}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Modul {nextLesson.moduleId}: {nextLesson.moduleTitle}</div>
            </div>
          </button>
        )}

        {/* All completed */}
        {!nextLesson && stats.percentage === 100 && (
          <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/10 text-center">
            <div className="text-3xl mb-2">\ud83c\udf89</div>
            <div className="text-sm font-semibold text-green-500">Wszystkie lekcje ukonczone!</div>
            <div className="text-xs text-muted-foreground mt-1">Gratulacje! Uzyskasz certyfikat ukonczenia kursu.</div>
          </div>
        )}
      </div>

      {/* Module breakdown */}
      <h3 className="text-sm font-semibold mt-6 mb-3">Postep w modulach</h3>
      <div className="space-y-1.5">
        {allModules.map(mod => {
          let modCompleted = 0;
          for (const lesson of mod.lessons) {
            const key = `${mod.id}-${lesson.id}`;
            if (progress[key]?.completed) modCompleted++;
          }
          const modPct = mod.lessons.length > 0 ? Math.round((modCompleted / mod.lessons.length) * 100) : 0;
          return (
            <div key={mod.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/30 transition-colors">
              <span className="text-sm shrink-0">{mod.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs truncate">{mod.title}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{modCompleted}/{mod.lessons.length}</span>
                </div>
                <div className="h-1 bg-secondary rounded-full mt-1 overflow-hidden">
                  <div className={cn(
                    'h-full rounded-full transition-all duration-500',
                    modPct === 100 ? 'bg-green-500' : 'bg-primary'
                  )} style={{ width: `${modPct}%` }} />
                </div>
              </div>
              <span className="text-[10px] font-medium w-8 text-right shrink-0"
                style={{ color: modPct === 100 ? '#22c55e' : 'var(--muted-foreground)' }}>
                {modPct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
