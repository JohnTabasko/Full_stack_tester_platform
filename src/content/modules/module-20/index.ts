import type { Module } from "../../../renderer/types";
import { lesson20_1 } from "./lesson-20.1";
import { lesson20_2 } from "./lesson-20.2";
import { lesson20_3 } from "./lesson-20.3";
import { lesson20_4 } from "./lesson-20.4";

export const module20: Module = {
  id: 20,
  title: "SQL i bazy danych dla testerów",
  description: "SQL, schematy, transakcje, migracje, seedowanie, sprzątanie danych i weryfikacja danych po operacjach UI/API",
  duration: "16-20 godzin",
  level: "intermediate",
  icon: "🗄️",
  order: 20,
  lessons: [lesson20_1, lesson20_2, lesson20_3, lesson20_4],
};
