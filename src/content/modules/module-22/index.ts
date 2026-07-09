import type { Module } from "../../../renderer/types";
import { lesson22_1 } from "./lesson-22.1";
import { lesson22_2 } from "./lesson-22.2";
import { lesson22_3 } from "./lesson-22.3";
import { lesson22_4 } from "./lesson-22.4";

export const module22: Module = {
  id: 22,
  title: "Mikroserwisy i systemy asynchroniczne",
  description: "Testowanie event-driven, kolejki, webhooki, ponowienia, idempotencja, spójność ostateczna i wirtualizacja usług",
  duration: "18-24 godzin",
  level: "advanced",
  icon: "🕸️",
  order: 22,
  lessons: [lesson22_1, lesson22_2, lesson22_3, lesson22_4],
};
