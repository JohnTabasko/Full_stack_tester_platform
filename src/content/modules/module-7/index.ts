import type { Module } from '../../../renderer/types';
import { lesson7_1 } from './lesson-7.1';
import { lesson7_2 } from './lesson-7.2';
import { lesson7_3 } from './lesson-7.3';
import { lesson7_4 } from './lesson-7.4';
import { lesson7_5 } from './lesson-7.5';

export const module7: Module = {
  id: 7,
  title: 'Zarządzanie danymi testowymi',
  description: 'Opanuj strategie danych testowych: budowniczowie, fabryki, Faker.js, seedowanie bazy danych i organizację danych',
  duration: '15-18 godzin',
  level: 'intermediate',
  icon: '🗄️',
  order: 7,
  lessons: [lesson7_1, lesson7_2, lesson7_3, lesson7_4, lesson7_5],
};
