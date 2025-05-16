import { type Page } from "@playwright/test";

export class AuthUtils {
  constructor(private page: Page) {}

  /**
   * Logs in the test user using environment variables
   */
  async loginTestUser(): Promise<void> {
    const email = process.env.SUPABASE_TEST_USER_EMAIL;
    const password = process.env.SUPABASE_TEST_USER_PASSWORD;

    if (!email || !password) {
      throw new Error(
        "Missing test user credentials. Please set SUPABASE_TEST_USER_EMAIL and SUPABASE_TEST_USER_PASSWORD in .env.test",
      );
    }

    console.log("Starting login process...");

    try {
      // Go to login page and wait for it to be fully loaded
      await this.page.goto("/login", {
        waitUntil: "networkidle",
        timeout: 60000,
      });

      // Wait for the login form with increased timeout
      const loginForm = await this.page.waitForSelector('[data-test-id="login-form"]', {
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

      // Wait for the user menu to be visible
      await this.page.waitForSelector('[data-test-id="user-menu"]', {
        state: "visible",
        timeout: 30000,
      });

      console.log("Login successful");
    } catch (error) {
      console.error("Login failed:", error);

      // Take a screenshot for debugging
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
      const loginForm = await this.page.locator('[data-test-id="login-form"]').count();
      return loginForm === 0;
    } catch (error) {
      console.error("Login check failed:", error);
      return false;
    }
  }
}
