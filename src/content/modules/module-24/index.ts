import type { Module } from "../../../renderer/types";
import { lesson24_1 } from "./lesson-24.1";
import { lesson24_2 } from "./lesson-24.2";
import { lesson24_3 } from "./lesson-24.3";
import { lesson24_4 } from "./lesson-24.4";

export const module24: Module = {
  id: 24,
  title: "Testowanie wydajności z k6 i JMeter",
  description: "Testy load, stress, spike i soak, k6, JMeter, percentyle, progi jakości, analiza wąskich gardeł i budżety wydajnościowe",
  duration: "18-24 godzin",
  level: "advanced",
  icon: "⚡",
  order: 24,
  lessons: [lesson24_1, lesson24_2, lesson24_3, lesson24_4],
};
