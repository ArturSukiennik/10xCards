/// <reference types="vitest" />

import { resolve } from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      reporter: ["text", "json", "html"],
      extension: [".ts", ".tsx"],
      exclude: ["**/*.{test,spec}.{ts,tsx}", "**/*.d.ts"],
    },
    setupFiles: ["./tests/setup.ts"],
    includeSource: ["src/**/*.{ts,tsx}"],
    exclude: [
      "node_modules",
      "dist",
      ".idea",
      ".git",
      ".cache",
      ".astro",
      "playwright-report",
      "test-results",
      "tests/e2e/**",
      "**/*.e2e.{test,spec}.{ts,tsx}",
    ],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
