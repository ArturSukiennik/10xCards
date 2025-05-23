/* eslint-disable */
import { test as base } from "@playwright/test";
import { supabaseE2EClient } from "./supabase";

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
    const browser = await base.browser();
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Logujemy użytkownika testowego przez Supabase
      const { data: authData, error: authError } = await supabaseE2EClient.auth.signInWithPassword({
        email: process.env.SUPABASE_TEST_USER_EMAIL!,
        password: process.env.SUPABASE_TEST_USER_PASSWORD!,
      });

      if (authError || !authData.session) {
        throw new Error(`Failed to login test user: ${authError?.message || "No session"}`);
      }

      // Ustawiamy ciasteczka sesji
      await context.addCookies([
        {
          name: "sb-access-token",
          value: authData.session.access_token,
          domain: new URL(process.env.PUBLIC_SUPABASE_URL!).hostname,
          path: "/",
        },
        {
          name: "sb-refresh-token",
          value: authData.session.refresh_token!,
          domain: new URL(process.env.PUBLIC_SUPABASE_URL!).hostname,
          path: "/",
        },
      ]);

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
