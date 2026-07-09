import type { Module } from "../../../renderer/types";
import { lesson13_1 } from "./lesson-13.1";
import { lesson13_2 } from "./lesson-13.2";
import { lesson13_3 } from "./lesson-13.3";
import { lesson13_4 } from "./lesson-13.4";
import { lesson13_5 } from "./lesson-13.5";

export const module13: Module = {
  id: 13, title: "Wydajność i optymalizacja", duration: "15-18 godzin",
  description: "Wydajność wykonywania testów, testowanie wydajności aplikacji, strategie optymalizacji, testy na prawdziwych urządzeniach i ciągłe monitorowanie wydajności",
  level: "advanced", icon: "⚡", order: 13,
  lessons: [lesson13_1, lesson13_2, lesson13_3, lesson13_4, lesson13_5],
};
