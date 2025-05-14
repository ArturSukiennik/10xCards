import type { Page } from "@playwright/test";

export class AuthUtils {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async loginTestUser() {
    const email = process.env.SUPABASE_TEST_USER_EMAIL;
    const password = process.env.SUPABASE_TEST_USER_PASSWORD;
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";

    if (!email || !password) {
      throw new Error("Missing test user credentials in .env.test file");
    }

    console.log("Starting login process...");

    try {
      // Go to login page and wait for it to be fully loaded
      await this.page.goto(`${baseUrl}/login`, {
        waitUntil: "networkidle",
        timeout: 60000,
      });

      // Wait for the login form with increased timeout
      const loginForm = await this.page.waitForSelector('[data-test-id="auth-form"]', {
        state: "visible",
        timeout: 30000,
      });

      if (!loginForm) {
        throw new Error("Login form not found");
      }

      console.log("Login form found, filling credentials...");

      // Fill the form
      await this.page.fill('[data-test-id="email-input"]', email);
      await this.page.fill('[data-test-id="password-input"]', password);

      // Wait for the button to be visible and enabled
      const loginButton = await this.page.waitForSelector('[data-test-id="login-button"]', {
        state: "visible",
        timeout: 30000,
      });

      // Ensure the button is enabled
      const isDisabled = await loginButton.evaluate((el) => el.hasAttribute("disabled"));
      if (isDisabled) {
        throw new Error("Login button is disabled");
      }

      console.log("Submitting login form...");

      // Click the button and wait for navigation
      await loginButton.click();

      // Wait for either successful navigation or error message
      await Promise.race([
        this.page.waitForURL("**/generate", { timeout: 30000 }),
        this.page.waitForSelector('[data-test-id="error-message"]', { timeout: 30000 }),
      ]);

      // Check if there's an error message
      const errorMessage = await this.page
        .locator('[data-test-id="error-message"]')
        .textContent()
        .catch(() => null);

      if (errorMessage) {
        throw new Error(`Login failed: ${errorMessage}`);
      }

      // Check if login was successful
      console.log("Checking if user is logged in...");
      const isLoggedIn = await this.isLoggedIn();

      if (!isLoggedIn) {
        throw new Error("Login failed: User is not logged in after successful form submission");
      }

      console.log("Login successful!");
    } catch (error) {
      console.error("Login process failed:", error);
      await this.page.screenshot({ path: "login-error.png" });
      throw error;
    }
  }

  /**
   * Checks if the user is currently logged in
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      // Wait for user menu to be visible
      await this.page.waitForSelector('[data-test-id="user-menu"]', {
        state: "visible",
        timeout: 30000,
      });

      // Check if login form is not present
      const loginForm = await this.page.locator('[data-test-id="auth-form"]').count();
      return loginForm === 0;
    } catch (error) {
      console.error("Login check failed:", error);
      return false;
    }
  }

  async logout() {
    if (await this.isLoggedIn()) {
      try {
        await this.page.click('[data-test-id="user-menu"]');
        await this.page.click('[data-test-id="logout-button"]');
        await this.page.waitForURL("**/login", { timeout: 30000 });
      } catch (error) {
        console.error("Logout failed:", error);
        throw new Error(
          `Logout failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }
  }
}
