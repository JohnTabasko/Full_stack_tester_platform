import type { Module } from "../../../renderer/types";
import { lesson27_1 } from "./lesson-27.1";
import { lesson27_2 } from "./lesson-27.2";
import { lesson27_3 } from "./lesson-27.3";
import { lesson27_4 } from "./lesson-27.4";

export const module27: Module = {
  id: 27,
  title: "Testowanie wspierane przez sztuczną inteligencję",
  description: "AI do analizy wymagań, generowania przypadków testowych, danych, debugowania, przeglądu kodu i zarządzania ryzykami prywatności",
  duration: "10-14 godzin",
  level: "intermediate",
  icon: "🤖",
  order: 27,
  lessons: [lesson27_1, lesson27_2, lesson27_3, lesson27_4],
};
