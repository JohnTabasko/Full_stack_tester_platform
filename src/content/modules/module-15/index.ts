import type { Module } from "../../../renderer/types";
import { lesson15_1 } from "./lesson-15.1";
import { lesson15_2 } from "./lesson-15.2";
import { lesson15_3 } from "./lesson-15.3";
import { lesson15_4 } from "./lesson-15.4";

export const module15: Module = {
  id: 15, title: "Projekty praktyczne", duration: "30-40 godzin",
  description: "Projekt e-commerce, panel SaaS, pełna konfiguracja CI/CD, projekt końcowy i certyfikacja",
  level: "expert", icon: "🏆", order: 15,
  lessons: [lesson15_1, lesson15_2, lesson15_3, lesson15_4],
};
