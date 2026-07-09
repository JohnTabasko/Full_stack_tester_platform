import type { Module } from "../../../renderer/types";
import { lesson26_1 } from "./lesson-26.1";
import { lesson26_2 } from "./lesson-26.2";
import { lesson26_3 } from "./lesson-26.3";
import { lesson26_4 } from "./lesson-26.4";

export const module26: Module = {
  id: 26,
  title: "Testowanie mobilne",
  description: "Mobile web, PWA, aplikacje natywne i hybrydowe, Appium, farmy urządzeń, uprawnienia, gesty, deep linki i tryb offline",
  duration: "14-20 godzin",
  level: "advanced",
  icon: "📱",
  order: 26,
  lessons: [lesson26_1, lesson26_2, lesson26_3, lesson26_4],
};
