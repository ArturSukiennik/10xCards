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
          try {
            const responseData = await response.json();
            console.log(`Response from ${response.url()}:`, responseData);
          } catch (error) {
            console.error(`Failed to parse response from ${response.url()}:`, error);
          }
        }
      });

      // Navigate to login page using the configured baseURL with retry logic
      const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
      console.log("Navigating to login page:", `${baseUrl}/login`);

      let retries = 3;
      let waitTime = 2000; // Start with 2s wait

      while (retries > 0) {
        try {
          await this.page.goto(`${baseUrl}/login`, {
            waitUntil: "networkidle",
            timeout: 60000, // 60s timeout for initial navigation
          });

          // Wait for the login form with increased timeouts
          console.log("Waiting for login form elements...");
          await Promise.all([
            this.page.waitForSelector('[data-test-id="auth-form"]', { timeout: 30000 }),
            this.page.waitForSelector('[data-test-id="email-input"]', { timeout: 30000 }),
            this.page.waitForSelector('[data-test-id="password-input"]', { timeout: 30000 }),
          ]);

          // Fill in the login form
          console.log("Filling login form...");
          await this.page.fill('[data-test-id="email-input"]', email);
          await this.page.fill('[data-test-id="password-input"]', password);

          // Click the login button and wait for navigation
          console.log("Clicking login button...");
          await Promise.all([
            this.page.click('[data-test-id="login-button"]'),
            Promise.race([
              this.page.waitForURL("**/generate", { timeout: 60000 }),
              this.page.waitForSelector('[data-test-id="error-message"]', { timeout: 60000 }),
            ]),
          ]);

          // Check if we got an error message
          const errorLocator = this.page.locator('[data-test-id="error-message"]');
          if (await errorLocator.isVisible()) {
            const errorMessage = await errorLocator.textContent();
            throw new Error(`Login failed: ${errorMessage}`);
          }

          // Verify successful login
          console.log("Verifying successful login...");
          await this.page.waitForSelector('[data-test-id="source-text-input"]', {
            state: "visible",
            timeout: 30000,
          });

          console.log("Login successful!");
          return;
        } catch (error) {
          console.log(`Login attempt ${4 - retries} failed:`, error);
          retries--;

          if (retries === 0) {
            console.error("All login attempts failed");
            throw error;
          }

          console.log(`Waiting ${waitTime}ms before retry...`);
          await this.page.waitForTimeout(waitTime);
          waitTime *= 2; // Exponential backoff
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
      // Wait for user menu to be visible
      await this.page.waitForSelector('[data-test-id="user-menu"]', {
        state: "visible",
        timeout: 30000,
      });

      // Check if we're on a protected route
      const currentUrl = this.page.url();
      return currentUrl.includes("/generate");
    } catch (error) {
      console.error("Error checking login status:", error);
      return false;
    }
  }
}
