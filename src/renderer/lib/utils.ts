import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calculateModuleProgress(
  moduleId: number,
  totalLessons: number,
  progress: Record<string, boolean>
): number {
  let completed = 0;
  for (let i = 0; i < totalLessons; i++) {
    const lessonId = `${moduleId}.${i + 1}`;
    if (progress[`${moduleId}-${lessonId}`]) {
      completed++;
    }
  }
  return totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
}

export function calculateOverallProgress(
  modules: { id: number; lessons: { id: string }[] }[],
  progress: Record<string, boolean>
): number {
  let totalLessons = 0;
  let completedLessons = 0;

  for (const module of modules) {
    for (const lesson of module.lessons) {
      totalLessons++;
      if (progress[`${module.id}-${lesson.id}`]) {
        completedLessons++;
      }
    }
  }

  return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
}

export function getLevelLabel(level: string): string {
  switch (level) {
    case 'beginner': return 'Początkujący';
    case 'intermediate': return 'Średniozaawansowany';
    case 'advanced': return 'Zaawansowany';
    case 'expert': return 'Ekspert';
    default: return level;
  }
}

export function getLevelColor(level: string): string {
  switch (level) {
    case 'beginner': return 'text-green-400 bg-green-400/10';
    case 'intermediate': return 'text-blue-400 bg-blue-400/10';
    case 'advanced': return 'text-purple-400 bg-purple-400/10';
    case 'expert': return 'text-amber-400 bg-amber-400/10';
    default: return 'text-muted-foreground bg-secondary';
  }
}

export function getDifficultyStars(level: string): number {
  switch (level) {
    case 'beginner': return 1;
    case 'intermediate': return 2;
    case 'advanced': return 3;
    case 'expert': return 4;
    default: return 1;
  }
}

export const ACHIEVEMENTS = [
  {
    id: 'first-lesson',
    title: 'Pierwszy krok',
    description: 'Ukończ pierwszą lekcję',
    icon: '🎯',
  },
  {
    id: 'module-1-complete',
    title: 'Fundamenty zaliczone',
    description: 'Ukończ Moduł 1: Wprowadzenie i konfiguracja',
    icon: '🏗️',
  },
  {
    id: 'quiz-master',
    title: 'Mistrz Quizów',
    description: 'Zdobądź 100% w 3 quizach',
    icon: '🏆',
  },
  {
    id: 'code-warrior',
    title: 'Wojownik Kodu',
    description: 'Rozwiąż 10 ćwiczeń praktycznych',
    icon: '⚔️',
  },
  {
    id: 'bookworm',
    title: 'Mól książkowy',
    description: 'Przeczytaj 20 lekcji',
    icon: '📚',
  },
  {
    id: 'night-owl',
    title: 'Nocny marek',
    description: 'Ucz się po północy',
    icon: '🦉',
  },
  {
    id: 'streak-7',
    title: 'Tydzień z Playwright',
    description: 'Utrzymaj passę 7 dni',
    icon: '🔥',
  },
  {
    id: 'notes-master',
    title: 'Skrupulatny notatnik',
    description: 'Dodaj notatki do 10 lekcji',
    icon: '📝',
  },
  {
    id: 'bookmark-collector',
    title: 'Kolekcjoner',
    description: 'Dodaj 15 zakładek',
    icon: '🔖',
  },
  {
    id: 'playground-explorer',
    title: 'Odkrywca',
    description: 'Uruchom kod na placu zabaw 20 razy',
    icon: '🚀',
  },
];