import type { Module } from "../../../renderer/types";
import { lesson11_1 } from "./lesson-11.1";
import { lesson11_2 } from "./lesson-11.2";
import { lesson11_3 } from "./lesson-11.3";
import { lesson11_4 } from "./lesson-11.4";
import { lesson11_5 } from "./lesson-11.5";

export const module11: Module = {
  id: 11, title: "Pełna integracja z CI/CD", duration: "18-22 godzin",
  description: "GitHub Actions, GitLab CI, Jenkins, Azure DevOps, CircleCI, dobre praktyki i optymalizacja",
  level: "advanced", icon: "🔄", order: 11,
  lessons: [lesson11_1, lesson11_2, lesson11_3, lesson11_4, lesson11_5],
};
