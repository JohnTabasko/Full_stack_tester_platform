import type { Module } from "../../../renderer/types";
import { lesson21_1 } from "./lesson-21.1";
import { lesson21_2 } from "./lesson-21.2";
import { lesson21_3 } from "./lesson-21.3";
import { lesson21_4 } from "./lesson-21.4";

export const module21: Module = {
  id: 21,
  title: "Testy kontraktowe i zarządzanie API",
  description: "OpenAPI, Pact, kontrakty sterowane przez konsumenta, wersjonowanie, zmiany niekompatybilne i kontrakty w CI/CD",
  duration: "14-18 godzin",
  level: "advanced",
  icon: "📜",
  order: 21,
  lessons: [lesson21_1, lesson21_2, lesson21_3, lesson21_4],
};
