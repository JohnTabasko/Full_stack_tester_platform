import type { Module } from '../../../renderer/types';
import { lesson3_1 } from './lesson-3.1';
import { lesson3_2 } from './lesson-3.2';
import { lesson3_3 } from './lesson-3.3';
import { lesson3_4 } from './lesson-3.4';

export const module3: Module = {
  id: 3,
  title: 'Asercje i weryfikacje',
  description: 'Opanuj web-first assertions, API testing, custom matchers i helper functions',
  duration: '15-18 godzin',
  level: 'beginner',
  icon: '✅',
  order: 3,
  lessons: [lesson3_1, lesson3_2, lesson3_3, lesson3_4],
};
