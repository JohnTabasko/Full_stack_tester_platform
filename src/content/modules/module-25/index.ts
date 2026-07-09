import type { Module } from "../../../renderer/types";
import { lesson25_1 } from "./lesson-25.1";
import { lesson25_2 } from "./lesson-25.2";
import { lesson25_3 } from "./lesson-25.3";
import { lesson25_4 } from "./lesson-25.4";

export const module25: Module = {
  id: 25,
  title: "Podstawy DevOps i środowiska testowe",
  description: "Linux, bash, sieci, Docker Compose, podstawy Kubernetes, sekrety, flagi funkcji i środowiska efemeryczne",
  duration: "16-22 godzin",
  level: "intermediate",
  icon: "🛠️",
  order: 25,
  lessons: [lesson25_1, lesson25_2, lesson25_3, lesson25_4],
};
