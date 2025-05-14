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
    console.log("Using credentials:", { email, password });

    try {
      // Go to login page and wait for it to be fully loaded
      await this.page.goto(`${baseUrl}/login`, {
        waitUntil: "networkidle",
        timeout: 60000,
      });

      // Enable request logging
      await this.page.route("**/api/auth", async (route) => {
        const request = route.request();
        console.log("Auth request:", {
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          body: request.postData(),
        });
        await route.continue();
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

      // Click the button and wait for navigation or error
      await Promise.all([
        loginButton.click(),
        Promise.race([
          this.page.waitForURL("**/generate", { timeout: 30000 }),
          this.page.waitForSelector('[data-test-id="error-message"]', { timeout: 30000 }),
        ]),
      ]);

      // Check if we got an error message
      const errorMessage = await this.page.locator('[data-test-id="error-message"]');
      if (await errorMessage.isVisible()) {
        const error = await errorMessage.textContent();
        throw new Error(`Login failed: ${error}`);
      }

      // Verify we're on the generate page
      const currentUrl = this.page.url();
      if (!currentUrl.includes("/generate")) {
        throw new Error(`Login failed: Unexpected redirect to ${currentUrl}`);
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
