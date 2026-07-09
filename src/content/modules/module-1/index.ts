import type { Module } from '../../../renderer/types';
import { lesson1_1 } from './lesson-1.1';
import { lesson1_2 } from './lesson-1.2';
import { lesson1_3 } from './lesson-1.3';
import { lesson1_4 } from './lesson-1.4';
import { lesson1_5 } from './lesson-1.5';

export const module1: Module = {
  id: 1,
  title: 'Wprowadzenie i konfiguracja',
  description: 'Poznaj Playwright - od podstaw architektury po pełną konfigurację środowiska i pierwszy test',
  duration: '8-10 godzin',
  level: 'beginner',
  icon: '🚀',
  order: 1,
  lessons: [lesson1_1, lesson1_2, lesson1_3, lesson1_4, lesson1_5],
};