import { test as base } from "@playwright/test";
import { chromium } from "@playwright/test";
import { AuthUtils } from "../utils/auth";
import type { Cookie } from "@playwright/test";

// Default viewport size for all tests
const viewportSize = { width: 1920, height: 1080 };

interface StorageState {
  cookies: Cookie[];
  origins: {
    origin: string;
    localStorage: { name: string; value: string }[];
  }[];
}

// Eksportujemy test z obsługą stanu logowania
export const test = base.extend({
  storageState: async (_fixture, use) => {
    // Tworzymy nowy kontekst i stronę
    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: viewportSize,
    });
    const page = await context.newPage();

    try {
      // Logujemy użytkownika testowego
      const authUtils = new AuthUtils(page);
      await authUtils.loginTestUser();

      // Sprawdzamy czy użytkownik jest zalogowany
      const isLoggedIn = await authUtils.isLoggedIn();
      if (!isLoggedIn) {
        throw new Error("Test user is not logged in. Please check authentication setup.");
      }

      // Pobieramy ciasteczka
      const cookies = await context.cookies();

      // Używamy ciasteczek w testach
      await use({ cookies, origins: [] } as StorageState);
    } finally {
      // Zamykamy kontekst i przeglądarkę
      await context.close();
      await browser.close();
    }
  },
});
