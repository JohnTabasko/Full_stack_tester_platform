import React from 'react';
import {
  Menu,
  Search,
  Sun,
  Moon,
  ChevronRight,
  Download,
  Upload,
} from 'lucide-react';
import { useAppStore } from '@stores/appStore';
import { getTotalLessonsCount } from '@content/modules';
import type { ThemeMode } from '../types';

interface TopBarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  sidebarOpen: boolean;
}

export function TopBar({ theme, onToggleTheme, onToggleSidebar, onOpenSearch, sidebarOpen }: TopBarProps) {
  const { userStats, currentModuleId, currentLessonId, progress } = useAppStore();

  // Calculate overall progress
  const totalLessons = getTotalLessonsCount();
  let completedCount = 0;
  Object.values(progress).forEach((p) => {
    if (p.completed) completedCount++;
  });
  const overallProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const handleExport = async () => {
    await window.electronAPI?.exportData();
  };

  const handleImport = async () => {
    await window.electronAPI?.importData();
  };

  return (
    <header className="h-14 flex items-center justify-between border-b border-border/70 bg-card/85 backdrop-blur-xl px-4 shrink-0 select-none shadow-sm">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl hover:bg-accent transition-colors"
          title={`${sidebarOpen ? 'Ukryj' : 'Pokaż'} panel boczny (Ctrl+B)`}
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2 ml-1">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-lg shadow-inner">🎭</span>
          <span className="font-semibold text-sm hidden sm:inline tracking-tight">Playwright Learning Platform</span>
          {currentModuleId && currentLessonId && (
            <>
              <ChevronRight size={14} className="text-muted-foreground hidden sm:block" />
              <span className="text-xs text-muted-foreground hidden sm:block">
                Moduł {currentModuleId} · Lekcja {currentLessonId}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Search trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground bg-secondary/60 rounded-xl border border-border/80 hover:bg-secondary hover:text-foreground transition-all min-w-[13rem] justify-between"
          title="Szukaj (Ctrl+K)"
        >
          <Search size={14} />
          <span className="hidden sm:inline">Szukaj lekcji...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-background rounded border border-border">
            ⌘K
          </kbd>
        </button>

        {/* Export */}
        <button
          onClick={handleExport}
          className="p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          title="Eksportuj dane"
        >
          <Download size={16} />
        </button>

        {/* Import */}
        <button
          onClick={handleImport}
          className="p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          title="Importuj dane"
        >
          <Upload size={16} />
        </button>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl hover:bg-accent transition-colors"
          title={theme === 'dark' ? 'Tryb jasny' : 'Tryb ciemny'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Progress indicator */}
        <div className="hidden md:flex items-center gap-2 ml-2 pl-2 border-l border-border">
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-semibold text-primary">{overallProgress}% kursu</span>
            <div className="w-28 h-2 bg-secondary rounded-full overflow-hidden ring-1 ring-border/60">
              <div
                className="h-full progress-gradient rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Points */}
        {userStats && (
          <div className="hidden lg:flex items-center gap-1 ml-2 pl-2 border-l border-border">
            <span className="text-xs font-medium text-amber-400">⚡ {userStats.points}</span>
          </div>
        )}
      </div>
    </header>
  );
}