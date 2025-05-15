import type { Page } from "@playwright/test";

export class AuthUtils {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async loginTestUser() {
    const email = process.env.SUPABASE_TEST_USER_EMAIL;
    const password = process.env.SUPABASE_TEST_USER_PASSWORD;

    if (!email || !password) {
      throw new Error("Missing test user credentials");
    }

    try {
      console.log("Starting login process with email:", email);

      // Enable request/response logging
      this.page.on("request", (request) => {
        if (request.url().includes("/api/auth")) {
          console.log(`Request to ${request.url()}:`, request.postData());
        }
      });
      this.page.on("response", async (response) => {
        if (response.url().includes("/api/auth")) {
          console.log(`Response from ${response.url()}:`, await response.json());
        }
      });

      // Navigate to login page using the configured baseURL
      const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
      console.log("Navigating to login page:", `${baseUrl}/login`);
      await this.page.goto(`${baseUrl}/login`);

      // Wait for the login form
      console.log("Waiting for login form elements...");
      await this.page.waitForSelector('[data-test-id="auth-form"]');
      await this.page.waitForSelector('[data-test-id="email-input"]');
      await this.page.waitForSelector('[data-test-id="password-input"]');

      // Fill in the login form
      console.log("Filling login form...");
      await this.page.fill('[data-test-id="email-input"]', email);
      await this.page.fill('[data-test-id="password-input"]', password);

      // Click the login button
      console.log("Clicking login button...");
      await this.page.click('[data-test-id="login-button"]');

      // Wait for either successful navigation or error message
      console.log("Waiting for login result...");
      try {
        // First, try to wait for successful navigation
        await this.page.waitForURL("**/generate", { timeout: 10000 });
        console.log("Successfully navigated to /generate");

        // Additional verification - check if we can see the source text input
        console.log("Verifying successful login...");
        await this.page.waitForSelector('[data-test-id="source-text-input"]', {
          state: "visible",
          timeout: 10000,
        });

        console.log("Login successful!");
        return;
      } catch (navigationError) {
        // If navigation fails, check for error message
        console.log("Navigation failed, checking for error message...");
        const errorLocator = this.page.locator('[data-test-id="error-message"]');
        const errorMessage = await errorLocator.textContent({ timeout: 5000 });

        if (errorMessage) {
          console.error("Login form error:", errorMessage);
          throw new Error(`Login failed: ${errorMessage}`);
        } else {
          // If no error message is found, throw the original navigation error
          throw navigationError;
        }
      }
    } catch (error) {
      console.error("Login error:", error);

      // Take a screenshot on error
      try {
        await this.page.screenshot({ path: "login-error.png" });
        console.log("Error screenshot saved as login-error.png");
      } catch (screenshotError) {
        console.error("Failed to take error screenshot:", screenshotError);
      }

      throw error;
    }
  }

  async isLoggedIn() {
    try {
      // Check if we can access a protected route
      const currentUrl = this.page.url();
      return currentUrl.includes("/generate");
    } catch (error) {
      console.error("Error checking login status:", error);
      return false;
    }
  }
}
