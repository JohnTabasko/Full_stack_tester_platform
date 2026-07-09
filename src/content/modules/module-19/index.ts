import type { Module } from "../../../renderer/types";
import { lesson19_1 } from "./lesson-19.1";
import { lesson19_2 } from "./lesson-19.2";
import { lesson19_3 } from "./lesson-19.3";
import { lesson19_4 } from "./lesson-19.4";

export const module19: Module = {
  id: 19,
  title: "Testy jednostkowe, integracyjne i komponentowe",
  description: "Testy niższych poziomów: Vitest/Jest, mocki, React Testing Library, integracje backendowe i dobór poziomu testu",
  duration: "16-22 godzin",
  level: "intermediate",
  icon: "🧪",
  order: 19,
  lessons: [lesson19_1, lesson19_2, lesson19_3, lesson19_4],
};
