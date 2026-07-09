import type { Module } from '../../../renderer/types';
import { lesson4_1 } from './lesson-4.1';
import { lesson4_2 } from './lesson-4.2';
import { lesson4_3 } from './lesson-4.3';
import { lesson4_4 } from './lesson-4.4';
import { lesson4_5 } from './lesson-4.5';
import { lesson4_6 } from './lesson-4.6';

export const module4: Module = {
  id: 4,
  title: 'Mechanizmy zaawansowane przeglądarki',
  description: 'Wiele stron i okien, ramki iframe, Shadow DOM, przechwytywanie sieci, uwierzytelnianie i emulacja urządzeń',
  duration: '18-22 godzin',
  level: 'intermediate',
  icon: '🔮',
  order: 4,
  lessons: [lesson4_1, lesson4_2, lesson4_3, lesson4_4, lesson4_5, lesson4_6],
};
