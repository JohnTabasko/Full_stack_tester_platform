// ============ Course Structure Types ============

export interface LessonContent {
  objective: string;
  theory: string;
  codeExamples: string[];
  exercises: Exercise[];
  quiz: QuizQuestion[];
  references: Reference[];
  tipsAndTricks: string[];
  commonMistakes: CommonMistake[];
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  startingCode?: string;
  solution?: string;
  hints?: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Reference {
  title: string;
  url: string;
  description?: string;
}

export interface CommonMistake {
  mistake: string;
  solution: string;
  codeExample?: string;
}

export interface Lesson {
  id: string;
  moduleId: number;
  title: string;
  duration: string;
  description: string;
  content: LessonContent;
  order: number;
  prerequisites?: string[];
  tags?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Module {
  id: number;
  title: string;
  description: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  lessons: Lesson[];
  icon: string;
  order: number;
}

export interface CourseProgress {
  moduleId: number;
  lessonId: string;
  completed: boolean;
  score: number;
  timeSpent: number;
  lastAccessed: string;
}

export interface QuizResult {
  id: number;
  moduleId: number;
  lessonId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
  answers: number[];
}

export interface UserNote {
  moduleId: number;
  lessonId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: number;
  moduleId: number;
  lessonId: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: string;
}

export interface UserStats {
  points: number;
  streak: number;
  lastActivityDate: string;
  totalTimeSpent: number;
}

export interface ExerciseResultRow {
  module_id: number;
  lesson_id: string;
  exercise_id: string;
  score: number;
  passed_checks: string;
  answer?: string | null;
  completed: number;
  updated_at: string;
}

// ============ Typy interfejsu użytkownika ============

export type ThemeMode = 'light' | 'dark';
export type FontSize = 'small' | 'medium' | 'large';
export type ViewMode = 'theory' | 'practice' | 'quiz' | 'playground';
export type SidebarSection = 'modules' | 'bookmarks' | 'notes' | 'achievements' | 'settings' | 'daily' | 'faq' | 'glossary' | 'certificate' | 'wizard' | 'cheatsheets' | 'videos' | 'path' | 'templates' | 'sandbox' | 'practice';

// ============ Electron API ============

export interface ElectronAPI {
  getProgress: (moduleId: number, lessonId: string) => Promise<CourseProgress | null>;
  updateProgress: (moduleId: number, lessonId: string, data: Partial<CourseProgress>) => Promise<{ success: boolean; newlyCompleted?: boolean }>;
  getAllProgress: () => Promise<CourseProgress[]>;

  saveQuizResult: (data: {
    moduleId: number;
    lessonId: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    answers: number[];
  }) => Promise<{ success: boolean; id: number; earnedPoints: number }>;
  getQuizResults: (moduleId: number, lessonId: string) => Promise<QuizResult[]>;

  getNote: (moduleId: number, lessonId: string) => Promise<UserNote | null>;
  saveNote: (moduleId: number, lessonId: string, content: string) => Promise<{ success: boolean }>;

  toggleBookmark: (moduleId: number, lessonId: string) => Promise<{ bookmarked: boolean }>;
  getBookmarks: () => Promise<Bookmark[]>;
  isBookmarked: (moduleId: number, lessonId: string) => Promise<boolean>;

  getSetting: (key: string) => Promise<string | null>;
  setSetting: (key: string, value: string) => Promise<{ success: boolean }>;

  unlockAchievement: (achievementId: string) => Promise<{ success: boolean; newlyUnlocked: boolean }>;
  getAchievements: () => Promise<{ achievement_id: string; unlocked_at: string }[]>;

  getUserStats: () => Promise<UserStats>;

  saveExamResult: (data: {
    taskId: string;
    area: string;
    title: string;
    score: number;
    passedChecks: string[];
    submittedCode?: string;
  }) => Promise<{ success: boolean; updatedAt: string }>;
  getExamResults: () => Promise<Array<{
    task_id: string;
    area: string;
    title: string;
    score: number;
    passed_checks: string;
    submitted_code?: string | null;
    completed: number;
    updated_at: string;
  }>>;
  getExamStatus: (requiredTaskIds: string[]) => Promise<{
    passed: boolean;
    requiredCount: number;
    completedCount: number;
    missingTaskIds: string[];
    percentage: number;
    updatedAt: string | null;
  }>;

  saveExerciseResult: (data: {
    moduleId: number;
    lessonId: string;
    exerciseId: string;
    score: number;
    passedChecks: string[];
    answer?: string;
  }) => Promise<{ success: boolean; updatedAt: string }>;
  getExerciseResult: (moduleId: number, lessonId: string, exerciseId: string) => Promise<ExerciseResultRow | null>;
  getExerciseResultsForLesson: (moduleId: number, lessonId: string) => Promise<ExerciseResultRow[]>;
  getAllExerciseResults: () => Promise<ExerciseResultRow[]>;

  exportData: () => Promise<{ success: boolean; path?: string }>;
  importData: () => Promise<{ success: boolean; error?: string }>;

  runPlaygroundTest: (code: string) => Promise<{
    success: boolean;
    exitCode: number | null;
    timedOut: boolean;
    durationMs: number;
    stdout: string;
    stderr: string;
    command: string;
    runDir: string;
    testFile: string;
    error?: string;
  }>;

  openExternal: (url: string) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}