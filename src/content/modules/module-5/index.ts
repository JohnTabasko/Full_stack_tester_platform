import type { Module } from '../../../renderer/types';
import { lesson5_1 } from './lesson-5.1';
import { lesson5_2 } from './lesson-5.2';
import { lesson5_3 } from './lesson-5.3';
import { lesson5_4 } from './lesson-5.4';
import { lesson5_5 } from './lesson-5.5';

export const module5: Module = {
  id: 5,
  title: 'Runner testów i fikstury',
  description: 'Opanuj runner testów Playwright, fikstury, konfigurację, równoległość i organizację testów',
  duration: '20-25 godzin',
  level: 'intermediate',
  icon: '🏃',
  order: 5,
  lessons: [lesson5_1, lesson5_2, lesson5_3, lesson5_4, lesson5_5],
};
