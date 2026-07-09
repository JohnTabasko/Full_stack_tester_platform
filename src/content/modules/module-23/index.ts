import type { Module } from "../../../renderer/types";
import { lesson23_1 } from "./lesson-23.1";
import { lesson23_2 } from "./lesson-23.2";
import { lesson23_3 } from "./lesson-23.3";
import { lesson23_4 } from "./lesson-23.4";

export const module23: Module = {
  id: 23,
  title: "Obserwowalność i diagnostyka systemów",
  description: "Logi, metryki, ślady wykonania, OpenTelemetry, identyfikator korelacji, Grafana, Prometheus, SLO i diagnoza incydentów",
  duration: "14-20 godzin",
  level: "advanced",
  icon: "🔭",
  order: 23,
  lessons: [lesson23_1, lesson23_2, lesson23_3, lesson23_4],
};
