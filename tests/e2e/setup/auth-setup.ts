import { test as base } from "@playwright/test";
import { supabaseE2EClient } from "./supabase";
import type { Cookie, BrowserContext } from "@playwright/test";

// Rozszerzamy typ testu o stan logowania
interface AuthFixtures {
  storageState: {
    cookies: Cookie[];
    origins: {
      origin: string;
      localStorage: { name: string; value: string }[];
    }[];
  };
}

// Tworzymy nowy test z obsługą stanu logowania
export const test = base.extend<AuthFixtures>({
  storageState: async ({ browser }, callback) => {
    let context: BrowserContext | undefined;

    try {
      // Logujemy użytkownika testowego przez Supabase
      const { data: authData, error: authError } = await supabaseE2EClient.auth.signInWithPassword({
        email: process.env.SUPABASE_TEST_USER_EMAIL ?? "",
        password: process.env.SUPABASE_TEST_USER_PASSWORD ?? "",
      });

      if (authError || !authData.session) {
        throw new Error(`Failed to login test user: ${authError?.message || "No session"}`);
      }

      context = await browser.newContext();

      // Ustawiamy ciasteczka sesji
      await context.addCookies([
        {
          name: "sb-access-token",
          value: authData.session.access_token,
          domain: new URL(process.env.PUBLIC_SUPABASE_URL ?? "").hostname,
          path: "/",
        },
        {
          name: "sb-refresh-token",
          value: authData.session.refresh_token ?? "",
          domain: new URL(process.env.PUBLIC_SUPABASE_URL ?? "").hostname,
          path: "/",
        },
      ]);

      // Pobieramy ciasteczka
      const cookies = await context.cookies();

      // Używamy ciasteczek w testach
      await callback({ cookies, origins: [] });
    } finally {
      // Zamykamy kontekst
      await context?.close();
    }
  },
});
