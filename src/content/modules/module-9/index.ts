import type { Module } from "../../../renderer/types";
import { lesson9_1 } from "./lesson-9.1";
import { lesson9_2 } from "./lesson-9.2";
import { lesson9_3 } from "./lesson-9.3";
import { lesson9_4 } from "./lesson-9.4";
import { lesson9_5 } from "./lesson-9.5";

export const module9: Module = {
  id: 9, title: "Debugowanie i rozwiązywanie problemów", duration: "15-18 godzin",
  description: "Narzędzia debugowania, typowe problemy, obsługa błędów, stabilność testów, logowanie i monitoring",
  level: "intermediate", icon: "🐛", order: 9,
  lessons: [lesson9_1, lesson9_2, lesson9_3, lesson9_4, lesson9_5],
};
