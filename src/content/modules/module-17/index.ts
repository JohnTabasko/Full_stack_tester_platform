import type { Module } from "../../../renderer/types";
import { lesson17_1 } from "./lesson-17.1";
import { lesson17_2 } from "./lesson-17.2";
import { lesson17_3 } from "./lesson-17.3";
import { lesson17_4 } from "./lesson-17.4";

export const module17: Module = {
  id: 17,
  title: "Fundamenty pracy testera i strategia jakości",
  description: "Teoria jakości, piramida testów, techniki projektowania przypadków, testowanie oparte na ryzyku, testowanie eksploracyjne i raportowanie błędów",
  duration: "14-18 godzin",
  level: "beginner",
  icon: "🧭",
  order: 17,
  lessons: [lesson17_1, lesson17_2, lesson17_3, lesson17_4],
};
