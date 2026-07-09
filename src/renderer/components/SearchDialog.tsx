import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, BookOpen, Clock, ChevronRight, ArrowUp } from 'lucide-react';
import { cn } from '@lib/utils';
import { searchLessons, getAllLessons } from '@content/modules';
import type { Module } from '../types';
import { useAppStore } from '@stores/appStore';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modules: Module[];
  onSelectLesson: (moduleId: number, lessonId: string) => void;
}

export function SearchDialog({ open, onOpenChange, modules, onSelectLesson }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isLessonCompleted } = useAppStore();

  const results = useMemo(() => {
    if (!query.trim()) {
      const recent = getAllLessons()
        .map((item) => ({ ...item, accessedAt: useAppStore.getState().progress[`${item.module.id}-${item.lesson.id}`]?.lastAccessed }))
        .filter((item) => item.accessedAt)
        .sort((a, b) => new Date(b.accessedAt!).getTime() - new Date(a.accessedAt!).getTime())
        .slice(0, 5);
      return recent.length > 0 ? recent : getAllLessons().slice(0, 8);
    }
    return searchLessons(query).slice(0, 12);
  }, [query]);

  const groupedResults = useMemo(() => {
    const groups = new Map<number, typeof results>();
    for (const item of results) {
      groups.set(item.module.id, [...(groups.get(item.module.id) ?? []), item]);
    }
    return [...groups.entries()].map(([moduleId, items]) => ({ moduleId, items }));
  }, [results]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      const { module, lesson } = results[selectedIndex];
      onSelectLesson(module.id, lesson.id);
    } else if (e.key === 'Escape') {
      onOpenChange(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-[15vh] animate-fade-in">
      <div className="w-full max-w-lg bg-popover rounded-lg shadow-2xl border border-border overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Search size={18} className="text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Szukaj lekcji, modułów, tagów..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-secondary rounded border border-border text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        {!query.trim() && (
          <div className="px-4 py-2 text-[11px] text-muted-foreground border-b border-border/60">
            {results.some((item) => useAppStore.getState().progress[`${item.module.id}-${item.lesson.id}`]?.lastAccessed) ? 'Ostatnio otwierane lekcje' : 'Propozycje na start'}
          </div>
        )}
        <div className="max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              <Search size={32} className="mx-auto mb-2 opacity-30" />
              <p>Brak wyników dla "{query}"</p>
              <p className="text-xs mt-1">Spróbuj innych słów kluczowych</p>
            </div>
          ) : (
            (() => {
              let flatIndex = 0;
              return groupedResults.map((group) => (
                <div key={group.moduleId}>
                  <div className="sticky top-0 z-10 bg-popover/95 backdrop-blur px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground border-b border-border/60">
                    {group.items[0]?.module.icon} Moduł {group.moduleId} · {group.items[0]?.module.title}
                  </div>
                  {group.items.map(({ module, lesson }) => {
                    const index = flatIndex++;
                    const completed = isLessonCompleted(module.id, lesson.id);
                    return (
                      <button
                        key={`${module.id}-${lesson.id}`}
                        onClick={() => onSelectLesson(module.id, lesson.id)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 text-left transition-all',
                          selectedIndex === index ? 'bg-primary/10 text-primary' : 'hover:bg-accent/50'
                        )}
                      >
                        <span className="text-xl shrink-0">{module.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{lesson.title}</span>
                            {completed && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-500 shrink-0">Zaliczone</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1"><BookOpen size={10} /> Lekcja {lesson.id}</span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock size={10} /> {lesson.duration}</span>
                            <span className={cn('text-[10px] px-1 py-0.5 rounded', lesson.difficulty === 'beginner' ? 'bg-green-500/10 text-green-600' : lesson.difficulty === 'intermediate' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500')}>
                              {lesson.difficulty === 'beginner' ? 'Podstawowy' : lesson.difficulty === 'intermediate' ? 'Średni' : 'Zaawansowany'}
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                      </button>
                    );
                  })}
                </div>
              ));
            })()
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-border text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <ArrowUp size={10} />
            ↓ Nawiguj
          </span>
          <span>↵ Wybierz</span>
          <span>ESC Zamknij</span>
        </div>
      </div>
    </div>
  );
}