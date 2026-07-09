import { contextBridge, ipcRenderer } from 'electron';

const api = {
  // Progress
  getProgress: (moduleId: number, lessonId: string) =>
    ipcRenderer.invoke('db:getProgress', moduleId, lessonId),
  updateProgress: (moduleId: number, lessonId: string, data: any) =>
    ipcRenderer.invoke('db:updateProgress', moduleId, lessonId, data),
  getAllProgress: () => ipcRenderer.invoke('db:getAllProgress'),

  // Quiz
  saveQuizResult: (data: any) => ipcRenderer.invoke('db:saveQuizResult', data),
  getQuizResults: (moduleId: number, lessonId: string) =>
    ipcRenderer.invoke('db:getQuizResults', moduleId, lessonId),

  // Notes
  getNote: (moduleId: number, lessonId: string) =>
    ipcRenderer.invoke('db:getNote', moduleId, lessonId),
  saveNote: (moduleId: number, lessonId: string, content: string) =>
    ipcRenderer.invoke('db:saveNote', moduleId, lessonId, content),

  // Bookmarks
  toggleBookmark: (moduleId: number, lessonId: string) =>
    ipcRenderer.invoke('db:toggleBookmark', moduleId, lessonId),
  getBookmarks: () => ipcRenderer.invoke('db:getBookmarks'),
  isBookmarked: (moduleId: number, lessonId: string) =>
    ipcRenderer.invoke('db:isBookmarked', moduleId, lessonId),

  // Settings
  getSetting: (key: string) => ipcRenderer.invoke('db:getSetting', key),
  setSetting: (key: string, value: string) => ipcRenderer.invoke('db:setSetting', key, value),

  // Achievements
  unlockAchievement: (achievementId: string) =>
    ipcRenderer.invoke('db:unlockAchievement', achievementId),
  getAchievements: () => ipcRenderer.invoke('db:getAchievements'),

  // User stats
  getUserStats: () => ipcRenderer.invoke('db:getUserStats'),

  // Practical exam
  saveExamResult: (data: unknown) => ipcRenderer.invoke('db:saveExamResult', data),
  getExamResults: () => ipcRenderer.invoke('db:getExamResults'),
  getExamStatus: (requiredTaskIds: string[]) => ipcRenderer.invoke('db:getExamStatus', requiredTaskIds),

  // Exercise results
  saveExerciseResult: (data: unknown) => ipcRenderer.invoke('db:saveExerciseResult', data),
  getExerciseResult: (moduleId: number, lessonId: string, exerciseId: string) =>
    ipcRenderer.invoke('db:getExerciseResult', moduleId, lessonId, exerciseId),
  getExerciseResultsForLesson: (moduleId: number, lessonId: string) =>
    ipcRenderer.invoke('db:getExerciseResultsForLesson', moduleId, lessonId),
  getAllExerciseResults: () => ipcRenderer.invoke('db:getAllExerciseResults'),

  // Export/Import
  exportData: () => ipcRenderer.invoke('app:exportData'),
  importData: () => ipcRenderer.invoke('app:importData'),

  // Playground
  runPlaygroundTest: (code: string) => ipcRenderer.invoke('app:runPlaygroundTest', code),

  // External
  openExternal: (url: string) => ipcRenderer.invoke('app:openExternal', url),
};

contextBridge.exposeInMainWorld('electronAPI', api);

export type ElectronAPI = typeof api;