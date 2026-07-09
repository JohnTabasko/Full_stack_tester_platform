import type { Module } from "../../../renderer/types";
import { lesson18_1 } from "./lesson-18.1";
import { lesson18_2 } from "./lesson-18.2";
import { lesson18_3 } from "./lesson-18.3";
import { lesson18_4 } from "./lesson-18.4";

export const module18: Module = {
  id: 18,
  title: "TypeScript, Node.js i Git dla testerów",
  description: "Praktyczne podstawy języka, środowisko uruchomieniowe, npm, debugowania oraz pracy w repozytorium",
  duration: "18-24 godzin",
  level: "beginner",
  icon: "🧑‍💻",
  order: 18,
  lessons: [lesson18_1, lesson18_2, lesson18_3, lesson18_4],
};
