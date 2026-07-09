import type { Module } from "../../../renderer/types";
import { lesson28_1 } from "./lesson-28.1";
import { lesson28_2 } from "./lesson-28.2";
import { lesson28_3 } from "./lesson-28.3";
import { lesson28_4 } from "./lesson-28.4";

export const module28: Module = {
  id: 28,
  title: "Portfolio i egzamin testera full stack",
  description: "Projekt końcowy UI + API + baza danych + CI + obserwowalność, matryca kompetencji, zadania rekrutacyjne i portfolio",
  duration: "25-35 godzin",
  level: "expert",
  icon: "🎓",
  order: 28,
  lessons: [lesson28_1, lesson28_2, lesson28_3, lesson28_4],
};
