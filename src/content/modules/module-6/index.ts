import type { Module } from '../../../renderer/types';
import { lesson6_1 } from './lesson-6.1';
import { lesson6_2 } from './lesson-6.2';
import { lesson6_3 } from './lesson-6.3';
import { lesson6_4 } from './lesson-6.4';
import { lesson6_5 } from './lesson-6.5';
import { lesson6_6 } from './lesson-6.6';

export const module6: Module = {
  id: 6,
  title: 'Wzorzec obiektu strony',
  description: 'Opanuj wzorzec obiektu strony: od podstaw przez stronę bazową i komponenty po zaawansowane wzorce oraz integrację z fiksturami',
  duration: '18-22 godzin',
  level: 'intermediate',
  icon: '📄',
  order: 6,
  lessons: [lesson6_1, lesson6_2, lesson6_3, lesson6_4, lesson6_5, lesson6_6],
};
