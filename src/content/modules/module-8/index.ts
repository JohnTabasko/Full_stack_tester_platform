import type { Module } from "../../../renderer/types";
import { lesson8_1 } from "./lesson-8.1";
import { lesson8_2 } from "./lesson-8.2";
import { lesson8_3 } from "./lesson-8.3";
import { lesson8_4 } from "./lesson-8.4";
import { lesson8_5 } from "./lesson-8.5";

export const module8: Module = {
  id: 8,
  title: "Zaawansowane testowanie API",
  description: "REST API, GraphQL, testy kontraktowe, testy wydajnościowe i organizacja testów API",
  duration: "18-22 godzin",
  level: "intermediate",
  icon: "🔌",
  order: 8,
  lessons: [lesson8_1, lesson8_2, lesson8_3, lesson8_4, lesson8_5],
};
