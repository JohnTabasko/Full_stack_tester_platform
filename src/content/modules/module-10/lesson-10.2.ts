import type { Lesson } from '../../../renderer/types';
import theory10_2 from './lesson-10.2.md?raw';

export const lesson10_2: Lesson = {
  "id": "10.2",
  "moduleId": 10,
  "title": "Niestandardowe reportery",
  "description": "Wdróż zaawansowane systemy raportowania. Poznaj konfigurację Monocart Reportera, integrację z kanałami Slack i Microsoft Teams za pomocą Webhooków oraz tworzenie własnych klas Reporter.",
  "order": 2,
  "difficulty": "advanced",
  "tags": ["reporters", "monocart", "slack", "notifications", "custom-reporter", "diagnostics"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz wdrażać i konfigurować alternatywne, bogate w analitykę i trendy reportery HTML (Monocart), integrować automatyczną wysyłkę raportów na Slack/Teams oraz napisać uproszczony, własny reporter w TypeScript.",
    "theory": theory10_2,
    "codeExamples": [
      `// Przykład konfiguracji powiadomień Slack (Książka 2 - Greffier)
export default defineConfig({
  reporter: [
    ['playwright-slack-report', { slackWebHookUrl: process.env.SLACK_URL }]
  ]
});`
    ],
    "exercises": [
      {
        "id": "ex-10-2-1",
        "title": "Konfiguracja Monocart z historią trendów",
        "description": "Zainstaluj i skonfiguruj `monocart-reporter` w swoim pliku `playwright.config.ts`. Skonfiguruj opcję zapisywania trendów (`trend: 'trends.json'`), tak aby kolejne uruchomienia testów rysowały na wykresie historię stabilności."
      }
    ],
    "quiz": [
      {
        "id": "q10-2-1",
        "question": "W jaki sposób klasa własnego reportera (Custom Reporter) komunikuje się z silnikiem Playwright Test?",
        "options": [
          "Implementując wbudowany interfejs 'Reporter' i nadpisując metody zdarzeń (np. onTestBegin, onTestEnd)",
          "Poprzez bezpośrednie modyfikowanie kodu binarnego Chromium",
          "Wywołując metody bazy danych SQL",
          "Nie da się stworzyć własnego reportera"
        ],
        "correctAnswer": 0,
        "explanation": "Playwright udostępnia dedykowany interfejs 'Reporter' z metodami zdarzeniowymi wywoływanymi na różnych etapach testów. Nasz niestandardowy reporter musi po prostu te metody zaimplementować."
      }
    ],
    "references": [
      {
        "title": "Practical Playwright Test (Jean-François Greffier, 2026)",
        "url": "https://doi.org/10.1007/979-8-8688-2160-8",
        "description": "Chapter 6: Extending Playwright (Monocart and slack reporters)."
      }
    ],
    "tipsAndTricks": [
      "Wysyłaj powiadomienia na Slacka wyłącznie przy błędach ('on-failure'). Unikaj spamowania kanałów zespołowych powiadomieniami o każdym udanym uruchomieniu testów w CI."
    ],
    "commonMistakes": [
      {
        "mistake": "Twarde kodowanie adresów Webhook URL w pliku konfiguracyjnym",
        "solution": "Zawsze pobieraj sekrety ze zmiennych środowiskowych (process.env.SLACK_WEBHOOK_URL) i zabezpieczaj pliki .env w .gitignore."
      }
    ]
  }
};