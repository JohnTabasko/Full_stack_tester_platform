import React, { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '@stores/appStore';
import { Sidebar } from '@components/Sidebar';
import { MainContent } from '@components/MainContent';
import { SearchDialog } from '@components/SearchDialog';
import { TopBar } from '@components/TopBar';
import { Toaster } from '@components/Toaster';
import { AchievementPopup } from '@components/AchievementPopup';
import { allModules } from '@content/modules';

function OnboardingOverlay({ onClose }: { onClose: () => void }) {
  const steps = [
    {
      icon: '🧭',
      title: 'Ucz się ścieżką, nie listą plików',
      text: 'Panel pokazuje moduły, postęp i najlepszy kolejny krok. Możesz wejść do modułu albo kontynuować ostatnio rozpoczętą lekcję.',
    },
    {
      icon: '📖',
      title: 'Czytaj w trybie podręcznikowym',
      text: 'Lekcje mają spis treści, lepszą typografię, przykłady, ćwiczenia i quizy. W długich rozdziałach korzystaj z prawego panelu nawigacji.',
    },
    {
      icon: '🧪',
      title: 'Zdaj praktykę, odblokuj certyfikat',
      text: 'Sekcja Praktyka zapisuje wyniki do SQLite. Certyfikat odblokuje się po zaliczeniu wymaganych zadań egzaminacyjnych.',
    },
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl rounded-3xl border border-border bg-card p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Witaj w kursie</div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight">Playwright Learning Platform</h2>
            <p className="mt-1 text-sm text-muted-foreground">Krótki przewodnik po najważniejszych funkcjach aplikacji.</p>
          </div>
          <button onClick={onClose} className="rounded-xl px-3 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground">Pomiń</button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title} className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="text-3xl">{step.icon}</div>
              <h3 className="mt-3 text-sm font-semibold">{step.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">Możesz wrócić do nawigacji, wyszukiwarki i praktyki z panelu bocznego.</p>
          <button onClick={onClose} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90">Rozpocznij</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    sidebarOpen,
    toggleSidebar,
    searchOpen,
    setSearchOpen,
    currentModuleId,
    currentLessonId,
    setCurrentLesson,
    setProgress,
    setBookmarks,
    setAchievements,
    setUserStats,
    setSidebarSection,
  } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [showAchievement, setShowAchievement] = useState<{ title: string; icon: string } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Initialize from Baza danych
  useEffect(() => {
    async function init() {
      try {
        // Load settings
        const savedTheme = await window.electronAPI?.getSetting('theme');
        if (savedTheme) setTheme(savedTheme as 'light' | 'dark');

        const savedFontSize = await window.electronAPI?.getSetting('fontSize');
        if (savedFontSize) setFontSize(savedFontSize as 'small' | 'medium' | 'large');

        // Load progress
        const progressData: any[] = await (window.electronAPI?.getAllProgress() ?? []);
        if (progressData) {
          const progressMap: Record<string, any> = {};
          for (const p of progressData) {
            progressMap[`${p.module_id}-${p.lesson_id}`] = {
              moduleId: p.module_id,
              lessonId: p.lesson_id,
              completed: !!p.completed,
              score: p.score,
              timeSpent: p.time_spent,
              lastAccessed: p.last_accessed,
            };
          }
          setProgress(progressMap);
        }

        // Load bookmarks
        const bookmarks = await window.electronAPI?.getBookmarks() as any[];
        if (bookmarks) {
          setBookmarks(bookmarks.map((b: any) => `${b.module_id}-${b.lesson_id}`));
        }

        // Load achievements
        const achievements = await window.electronAPI?.getAchievements() as any[];
        if (achievements) {
          setAchievements(achievements.map((a: any) => a.achievement_id));
        }

        // Load user stats
        const stats = await window.electronAPI?.getUserStats();
        if (stats) {
          setUserStats(stats);
        }
      } catch (err) {
        console.error('Failed to initialize app:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    const seen = window.localStorage.getItem('playwright-learning-onboarding-seen');
    if (!seen) setShowOnboarding(true);
  }, []);

  const handleCloseOnboarding = useCallback(() => {
    window.localStorage.setItem('playwright-learning-onboarding-seen', 'true');
    setShowOnboarding(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+K or Cmd/Ctrl+P for search
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'p')) {
        e.preventDefault();
        setSearchOpen(true);
      }
      // Cmd/Ctrl+B for sidebar toggle
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
      // Escape to close search
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar, setSearchOpen, searchOpen]);

  const handleToggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  const handleSelectLesson = useCallback((moduleId: number, lessonId: string) => {
    setCurrentLesson(moduleId, lessonId);
    setSearchOpen(false);
  }, [setCurrentLesson, setSearchOpen]);

  const handleOpenMobileSection = useCallback((section: Parameters<typeof setSidebarSection>[0]) => {
    setSidebarSection(section);
    if (!sidebarOpen) toggleSidebar();
  }, [setSidebarSection, sidebarOpen, toggleSidebar]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="text-5xl animate-bounce">🎭</div>
          <div className="text-lg font-medium text-muted-foreground animate-pulse-slow">
            Ładowanie Playwright Learning Platform...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      {/* Top Bar */}
      <TopBar
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onToggleSidebar={toggleSidebar}
        onOpenSearch={() => setSearchOpen(true)}
        sidebarOpen={sidebarOpen}
      />

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden p-2 gap-2">
        {/* Sidebar */}
        <Sidebar
          modules={allModules}
          currentModuleId={currentModuleId}
          currentLessonId={currentLessonId}
          onSelectLesson={handleSelectLesson}
          isOpen={sidebarOpen}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden flex flex-col rounded-2xl app-surface">
          <MainContent
            modules={allModules}
            currentModuleId={currentModuleId}
            currentLessonId={currentLessonId}
          />
        </main>
      </div>

      {/* Mobile quick navigation */}
      <nav className="md:hidden fixed bottom-2 left-2 right-2 z-40 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/20 px-2 py-2 no-print">
        <div className="grid grid-cols-5 gap-1 text-[10px]">
          <button onClick={() => handleOpenMobileSection('modules')} className="rounded-xl px-2 py-2 hover:bg-accent">📚<span className="block mt-0.5">Moduły</span></button>
          <button onClick={() => setSearchOpen(true)} className="rounded-xl px-2 py-2 hover:bg-accent">🔎<span className="block mt-0.5">Szukaj</span></button>
          <button onClick={() => handleOpenMobileSection('practice')} className="rounded-xl px-2 py-2 hover:bg-accent">🧪<span className="block mt-0.5">Praktyka</span></button>
          <button onClick={() => handleOpenMobileSection('certificate')} className="rounded-xl px-2 py-2 hover:bg-accent">🎓<span className="block mt-0.5">Cert.</span></button>
          <button onClick={() => handleOpenMobileSection('settings')} className="rounded-xl px-2 py-2 hover:bg-accent">⚙️<span className="block mt-0.5">Opcje</span></button>
        </div>
      </nav>

      {/* Search Dialog */}
      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        modules={allModules}
        onSelectLesson={handleSelectLesson}
      />

      {/* Achievement Popup */}
      {showAchievement && (
        <AchievementPopup
          title={showAchievement.title}
          icon={showAchievement.icon}
          onClose={() => setShowAchievement(null)}
        />
      )}

      {showOnboarding && <OnboardingOverlay onClose={handleCloseOnboarding} />}

      <Toaster />
    </div>
  );
}