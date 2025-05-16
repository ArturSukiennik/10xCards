import type { Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

export class AuthUtils {
  private page: Page;
  private supabase;

  constructor(page: Page) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    this.page = page;
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async loginTestUser() {
    const email = process.env.SUPABASE_TEST_USER_EMAIL;
    const password = process.env.SUPABASE_TEST_USER_PASSWORD;

    if (!email || !password) {
      throw new Error("Missing test user credentials");
    }

    const { error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(`Failed to login test user: ${error.message}`);
    }
  }

  async isLoggedIn() {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser();

    if (error) {
      console.error("Error checking login status:", error);
      return false;
    }
    return !!user;
  }
}
