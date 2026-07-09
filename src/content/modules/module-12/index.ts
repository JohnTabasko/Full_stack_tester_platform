import type { Module } from "../../../renderer/types";
import { lesson12_1 } from "./lesson-12.1";
import { lesson12_2 } from "./lesson-12.2";
import { lesson12_3 } from "./lesson-12.3";
import { lesson12_4 } from "./lesson-12.4";
import { lesson12_5 } from "./lesson-12.5";

export const module12: Module = {
  id: 12, title: "Dobre praktyki i wzorce", duration: "15-18 godzin",
  description: "Zasady projektowania testów, zaawansowane wzorce obiektu strony, jakość kodu, współpraca zespołowa i antywzorce",
  level: "intermediate", icon: "🌟", order: 12,
  lessons: [lesson12_1, lesson12_2, lesson12_3, lesson12_4, lesson12_5],
};
