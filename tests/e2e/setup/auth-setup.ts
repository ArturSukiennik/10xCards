import { test as base } from "@playwright/test";
import { AuthUtils } from "../utils/auth";

// Rozszerzamy typ testu o stan logowania
interface AuthFixtures {
  storageState: {
    cookies: any[];
    origins: any[];
  };
}

// Tworzymy nowy test z obsługą stanu logowania
export const test = base.extend<AuthFixtures>({
  storageState: async ({}, use) => {
    // Tworzymy nowy kontekst i stronę
    const browser = await base.browser();
    const context = await browser.newContext();
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
      await use({ cookies, origins: [] });
    } finally {
      // Zamykamy kontekst
      await context.close();
    }
  },
});
