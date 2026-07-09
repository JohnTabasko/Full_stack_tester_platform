import type { Module } from "../../../renderer/types";
import { lesson10_1 } from "./lesson-10.1";
import { lesson10_2 } from "./lesson-10.2";
import { lesson10_3 } from "./lesson-10.3";
import { lesson10_4 } from "./lesson-10.4";
import { lesson10_5 } from "./lesson-10.5";

export const module10: Module = {
  id: 10, title: "Raportowanie i analityka", duration: "12-15 godzin",
  description: "Wbudowane i niestandardowe reportery, analityka testów, Allure i zaawansowane strategie raportowania",
  level: "intermediate", icon: "📊", order: 10,
  lessons: [lesson10_1, lesson10_2, lesson10_3, lesson10_4, lesson10_5],
};
