import { create } from 'zustand';
import type { CourseProgress, ThemeMode, FontSize, ViewMode, SidebarSection, UserStats } from '../types';

interface AppState {
  // Navigation
  currentModuleId: number | null;
  currentLessonId: string | null;
  currentView: ViewMode;
  sidebarSection: SidebarSection;
  sidebarOpen: boolean;

  // Theme
  theme: ThemeMode;
  fontSize: FontSize;

  // Progress tracking
  progress: Record<string, CourseProgress>;
  userStats: UserStats | null;

  // Search
  searchOpen: boolean;
  searchQuery: string;

  // Bookmarks
  bookmarkedLessons: Set<string>;

  // Achievements
  unlockedAchievements: string[];

  // Playground
  playgroundCode: string;
  playgroundOutput: string;

  // Actions
  setCurrentLesson: (moduleId: number, lessonId: string) => void;
  setCurrentView: (view: ViewMode) => void;
  setSidebarSection: (section: SidebarSection) => void;
  toggleSidebar: () => void;
  setTheme: (theme: ThemeMode) => void;
  setFontSize: (size: FontSize) => void;
  markLessonComplete: (moduleId: number, lessonId: string) => void;
  updateLessonProgress: (moduleId: number, lessonId: string, progress: Partial<CourseProgress>) => void;
  setProgress: (progress: Record<string, CourseProgress>) => void;
  setUserStats: (stats: UserStats) => void;
  setSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  toggleBookmark: (lessonKey: string) => void;
  setBookmarks: (bookmarks: string[]) => void;
  addAchievement: (id: string) => void;
  setAchievements: (achievements: string[]) => void;
  setPlaygroundCode: (code: string) => void;
  setPlaygroundOutput: (output: string) => void;
  getLessonKey: (moduleId: number, lessonId: string) => string;
  isLessonCompleted: (moduleId: number, lessonId: string) => boolean;
  isBookmarked: (moduleId: number, lessonId: string) => boolean;
  getModuleProgress: (moduleId: number, totalLessons: number) => number;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  currentModuleId: null,
  currentLessonId: null,
  currentView: 'theory',
  sidebarSection: 'modules',
  sidebarOpen: true,
  theme: 'dark',
  fontSize: 'medium',
  progress: {},
  userStats: null,
  searchOpen: false,
  searchQuery: '',
  bookmarkedLessons: new Set(),
  unlockedAchievements: [],
  playgroundCode: `// 🎭 Plac zabaw Playwright
// Ten kod jest uruchamiany naprawdę przez runner Playwright.

import { test, expect } from '@playwright/test';

test('rzeczywisty test API bez przeglądarki', async ({ request }) => {
  const response = await request.get('https://example.com');

  expect(response.status()).toBe(200);
  console.log('Status odpowiedzi:', response.status());
  console.log('✅ Test zakończony pomyślnie!');
});`, 
  playgroundOutput: '',

  // Actions
  setCurrentLesson: (moduleId, lessonId) => {
    set({ currentModuleId: moduleId, currentLessonId: lessonId });
    // Update last accessed time
    const key = `${moduleId}-${lessonId}`;
    const existing = get().progress[key] || {
      moduleId,
      lessonId,
      completed: false,
      score: 0,
      timeSpent: 0,
      lastAccessed: new Date().toISOString(),
    };
    const updated = { ...existing, lastAccessed: new Date().toISOString() };
    set((state) => ({
      progress: { ...state.progress, [key]: updated },
    }));
    window.electronAPI?.updateProgress(moduleId, lessonId, updated);
  },

  setCurrentView: (view) => set({ currentView: view }),

  setSidebarSection: (section) => set({ sidebarSection: section }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setTheme: (theme) => {
    set({ theme });
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    window.electronAPI?.setSetting('theme', theme);
  },

  setFontSize: (size) => {
    set({ fontSize: size });
    const root = document.documentElement;
    root.style.fontSize = size === 'small' ? '14px' : size === 'large' ? '18px' : '16px';
    window.electronAPI?.setSetting('fontSize', size);
  },

  markLessonComplete: (moduleId, lessonId) => {
    const key = `${moduleId}-${lessonId}`;
    const wasCompleted = get().progress[key]?.completed ?? false;
    const progress: CourseProgress = {
      moduleId,
      lessonId,
      completed: true,
      score: 100,
      timeSpent: get().progress[key]?.timeSpent ?? 0,
      lastAccessed: new Date().toISOString(),
    };
    set((state) => ({
      progress: { ...state.progress, [key]: progress },
      userStats:
        state.userStats && !wasCompleted
          ? { ...state.userStats, points: state.userStats.points + 10, lastActivityDate: progress.lastAccessed }
          : state.userStats,
    }));
    window.electronAPI?.updateProgress(moduleId, lessonId, progress);
  },

  updateLessonProgress: (moduleId, lessonId, data) => {
    const key = `${moduleId}-${lessonId}`;
    const existing = get().progress[key] || {
      moduleId,
      lessonId,
      completed: false,
      score: 0,
      timeSpent: 0,
      lastAccessed: new Date().toISOString(),
    };
    const updated = { ...existing, ...data };
    set((state) => ({
      progress: { ...state.progress, [key]: updated },
    }));
    window.electronAPI?.updateProgress(moduleId, lessonId, updated);
  },

  setProgress: (progress) => set({ progress }),

  setUserStats: (stats) => set({ userStats: stats }),

  setSearchOpen: (open) => set({ searchOpen: open }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleBookmark: (lessonKey) => {
    set((state) => {
      const newBookmarks = new Set(state.bookmarkedLessons);
      if (newBookmarks.has(lessonKey)) {
        newBookmarks.delete(lessonKey);
      } else {
        newBookmarks.add(lessonKey);
      }
      return { bookmarkedLessons: newBookmarks };
    });
    const [moduleId, lessonId] = lessonKey.split('-');
    window.electronAPI?.toggleBookmark(parseInt(moduleId), lessonId);
  },

  setBookmarks: (bookmarks) => set({ bookmarkedLessons: new Set(bookmarks) }),

  addAchievement: (id) => {
    set((state) => ({
      unlockedAchievements: state.unlockedAchievements.includes(id)
        ? state.unlockedAchievements
        : [...state.unlockedAchievements, id],
    }));
    window.electronAPI?.unlockAchievement(id);
  },

  setAchievements: (achievements) => set({ unlockedAchievements: achievements }),

  setPlaygroundCode: (code) => set({ playgroundCode: code }),
  setPlaygroundOutput: (output) => set({ playgroundOutput: output }),

  getLessonKey: (moduleId, lessonId) => `${moduleId}-${lessonId}`,

  isLessonCompleted: (moduleId, lessonId) => {
    const key = `${moduleId}-${lessonId}`;
    return get().progress[key]?.completed || false;
  },

  isBookmarked: (moduleId, lessonId) => {
    const key = `${moduleId}-${lessonId}`;
    return get().bookmarkedLessons.has(key);
  },

  getModuleProgress: (moduleId, totalLessons) => {
    let completed = 0;
    const { progress } = get();
    for (let i = 1; i <= totalLessons; i++) {
      const key = `${moduleId}-${moduleId}.${i}`;
      if (progress[key]?.completed) completed++;
    }
    return totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
  },
}));