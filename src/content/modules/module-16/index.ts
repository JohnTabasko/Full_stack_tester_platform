import type { Module } from "../../../renderer/types";
import { lesson16_1 } from "./lesson-16.1";
import { lesson16_2 } from "./lesson-16.2";
import { lesson16_3 } from "./lesson-16.3";
import { lesson16_4 } from "./lesson-16.4";
import { lesson16_5 } from "./lesson-16.5";

export const module16: Module = {
  id: 16,
  title: "Środowiska i integracje specjalistyczne",
  description: "Testowanie w Dockerze, testowanie poczty elektronicznej, WebSocket/SSE, testowanie komponentów w Playwright, integracje zewnętrzne, webhooki, upload plików i Circuit Breaker",
  duration: "18-22 godzin",
  level: "advanced",
  icon: "🚀",
  order: 16,
  lessons: [lesson16_1, lesson16_2, lesson16_3, lesson16_4, lesson16_5],
};
