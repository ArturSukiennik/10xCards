import type { SupabaseClient } from "@supabase/supabase-js";
import type { CookieOptions } from "@supabase/ssr";

type MockData = Record<string, unknown>;

export class MockSupabaseClient {
  private testUser = {
    id: process.env.E2E_USERNAME_ID || "test-user-id",
    email: process.env.SUPABASE_TEST_USER_EMAIL,
    role: "authenticated",
  };

  private cookieStore: Record<string, string> = {};

  auth = {
    getUser: async () => ({
      data: { user: this.testUser },
      error: null,
    }),
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      console.log("Mock auth attempt:", {
        email,
        password,
        expected: process.env.SUPABASE_TEST_USER_EMAIL,
      });

      if (
        email === process.env.SUPABASE_TEST_USER_EMAIL &&
        password === process.env.SUPABASE_TEST_USER_PASSWORD
      ) {
        // Generate a mock session token
        const mockToken = "test-token-" + Date.now();
        this.cookieStore["sb-access-token"] = mockToken;

        return {
          data: {
            user: this.testUser,
            session: {
              access_token: mockToken,
              refresh_token: "test-refresh-token",
              expires_in: 3600,
              expires_at: Date.now() + 3600000,
            },
          },
          error: null,
        };
      }
      return {
        data: { user: null, session: null },
        error: { message: "Wrong credentials", name: "AuthError", status: 400 },
      };
    },
  };

  from = (table: string) => {
    console.log("Mock database operation on table:", table);
    return {
      insert: (data: MockData) => ({
        select: () => ({
          single: async () => ({
            data: { id: Date.now(), ...data },
            error: null,
          }),
        }),
      }),
    };
  };

  // Cookie handling
  cookieManager = {
    get: (name: string): string | undefined => {
      console.log("Mock getting cookie:", name, "value:", this.cookieStore[name]);
      return this.cookieStore[name];
    },
    set: (name: string, value: string, options?: CookieOptions): void => {
      console.log("Mock setting cookie:", name, "value:", value, "options:", options);
      this.cookieStore[name] = value;
    },
    remove: (name: string): void => {
      console.log("Mock removing cookie:", name);
      this.cookieStore[name] = "";
    },
  };
}

export const createMockSupabaseServer = () => {
  console.log("Creating mock Supabase server with test credentials:", {
    email: process.env.SUPABASE_TEST_USER_EMAIL,
    hasPassword: !!process.env.SUPABASE_TEST_USER_PASSWORD,
  });
  return new MockSupabaseClient() as unknown as SupabaseClient;
};
