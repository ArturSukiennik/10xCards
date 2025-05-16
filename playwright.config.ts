import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Załaduj zmienne środowiskowe z pliku .env.test
dotenv.config({ path: ".env.test" });

// Sprawdź czy wymagane zmienne środowiskowe są ustawione
const requiredEnvVars = [
  "SUPABASE_TEST_USER_EMAIL",
  "SUPABASE_TEST_USER_PASSWORD",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "OPENROUTER_API_KEY",
  "USE_REAL_OPENROUTER",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  timeout: 180000, // Zwiększamy timeout do 180 sekund dla całego testu

  use: {
    baseURL: process.env.TEST_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    video: "on-first-retry",
    screenshot: "only-on-failure",
    actionTimeout: 60000, // Zwiększamy timeout akcji do 60 sekund
    navigationTimeout: 60000, // Zwiększamy timeout nawigacji do 60 sekund
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 120 seconds
  },
});
