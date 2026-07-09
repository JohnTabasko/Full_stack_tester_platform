import type { Module } from '../../../renderer/types';
import { lesson2_1 } from './lesson-2.1';
import { lesson2_2 } from './lesson-2.2';
import { lesson2_3 } from './lesson-2.3';
import { lesson2_4 } from './lesson-2.4';
import { lesson2_5 } from './lesson-2.5';
import { lesson2_6 } from './lesson-2.6';
import { lesson2_7 } from './lesson-2.7';
import { lesson2_8 } from './lesson-2.8';
import { lesson2_9 } from './lesson-2.9';

export const module2: Module = {
  id: 2,
  title: 'Podstawy Playwright',
  description: 'Opanuj hierarchię przeglądarka/kontekst/strona, selektory, lokatory, nawigację, akcje i testy wizualne',
  duration: '20-25 godzin',
  level: 'beginner',
  icon: '⚙️',
  order: 2,
  lessons: [lesson2_1, lesson2_2, lesson2_3, lesson2_4, lesson2_5, lesson2_6, lesson2_7, lesson2_8, lesson2_9],
};
