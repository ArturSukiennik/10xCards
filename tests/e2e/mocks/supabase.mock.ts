import type { SupabaseClient } from "@supabase/supabase-js";

export class MockSupabaseClient {
  private testUser = {
    id: "test-user-id",
    email: process.env.SUPABASE_TEST_USER_EMAIL,
    role: "authenticated",
  };

  auth = {
    getUser: async () => ({
      data: { user: this.testUser },
      error: null,
    }),
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      if (
        email === process.env.SUPABASE_TEST_USER_EMAIL &&
        password === process.env.SUPABASE_TEST_USER_PASSWORD
      ) {
        return {
          data: { user: this.testUser, session: { access_token: "test-token" } },
          error: null,
        };
      }
      return {
        data: { user: null, session: null },
        error: { message: "Invalid credentials", name: "AuthError" },
      };
    },
  };

  from = (table: string) => ({
    insert: (data: any) => ({
      select: () => ({
        single: async () => ({
          data: { id: 1, ...data },
          error: null,
        }),
      }),
    }),
  });
}

export const createMockSupabaseServer = () => new MockSupabaseClient() as unknown as SupabaseClient;
