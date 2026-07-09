import type { Module } from "../../../renderer/types";
import { lesson14_1 } from "./lesson-14.1";
import { lesson14_2 } from "./lesson-14.2";
import { lesson14_3 } from "./lesson-14.3";
import { lesson14_4 } from "./lesson-14.4";
import { lesson14_5 } from "./lesson-14.5";

export const module14: Module = {
  id: 14, title: "Testowanie bezpieczeństwa i dostępności", duration: "18-22 godzin",
  description: "OWASP Top 10, testowanie dostępności WCAG, podstawy testów penetracyjnych i testowanie zgodności (RODO/GDPR, PCI DSS)",
  level: "advanced", icon: "🛡️", order: 14,
  lessons: [lesson14_1, lesson14_2, lesson14_3, lesson14_4, lesson14_5],
};
