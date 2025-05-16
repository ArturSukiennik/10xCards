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
  timeout: 300000, // Increased to 5 minutes for the entire test

  use: {
    baseURL: process.env.TEST_BASE_URL || "http://localhost:3000",
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 120000, // Increased to 2 minutes
    navigationTimeout: 120000, // Increased to 2 minutes
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
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180000, // Increased to 3 minutes
  },
});
