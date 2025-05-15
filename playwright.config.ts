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
  fullyParallel: false, // Wyłączamy równoległe wykonywanie testów
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Dodajemy 1 ponowną próbę nawet w trybie dev
  workers: 1, // Wymuszamy jednego workera
  reporter: "html",
  timeout: 180000, // Zwiększamy timeout do 180 sekund dla całego testu

  use: {
    baseURL: process.env.TEST_BASE_URL || "http://localhost:3000",
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 60000, // Zwiększamy timeout akcji do 60 sekund
    navigationTimeout: 60000, // Zwiększamy timeout nawigacji do 60 sekund
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
        launchOptions: {
          args: ["--disable-gpu", "--no-sandbox", "--disable-setuid-sandbox"],
        },
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1280, height: 720 },
        launchOptions: {
          firefoxUserPrefs: {
            "browser.cache.disk.enable": false,
            "browser.cache.memory.enable": false,
            "browser.cache.offline.enable": false,
            "network.http.use-cache": false,
          },
        },
      },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 120 seconds
  },
});
