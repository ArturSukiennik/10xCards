import type { Page } from "@playwright/test";

export class AuthUtils {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async loginTestUser() {
    const email = process.env.SUPABASE_TEST_USER_EMAIL;
    const password = process.env.SUPABASE_TEST_USER_PASSWORD;

    if (!email || !password) {
      throw new Error("Missing test user credentials in .env.test file");
    }

    console.log("Starting login process...");

    try {
      await this.page.goto("/login");
      await this.page.waitForLoadState("networkidle");

      // Czekaj na załadowanie formularza logowania
      const loginForm = await this.page.waitForSelector('[data-test-id="login-form"]', {
        state: "visible",
        timeout: 30000,
      });

      if (!loginForm) {
        throw new Error("Login form not found");
      }

      console.log("Login form found, filling credentials...");

      // Wypełnij formularz logowania
      await this.page.fill('[data-test-id="email-input"]', email);
      await this.page.fill('[data-test-id="password-input"]', password);

      // Kliknij przycisk logowania i poczekaj na odpowiedź
      console.log("Submitting login form...");

      await Promise.all([
        this.page.waitForResponse(
          (response) => {
            const isAuthResponse =
              response.url().includes("/auth/v1/token") || response.url().includes("/api/auth");
            if (isAuthResponse) {
              console.log("Auth response received:", response.status());
            }
            return isAuthResponse;
          },
          { timeout: 30000 },
        ),
        this.page.click('[data-test-id="login-button"]'),
      ]);

      // Poczekaj na przekierowanie
      console.log("Waiting for redirect...");

      await this.page.waitForURL("**/generate", { timeout: 30000 }).catch(async (error) => {
        // Sprawdź, czy jest komunikat o błędzie
        const errorMessage = await this.page
          .locator('[data-test-id="error-message"]')
          .textContent()
          .catch(() => null);

        if (errorMessage) {
          console.error("Login error message:", errorMessage);
          throw new Error(`Login failed: ${errorMessage}`);
        }

        // Zrób zrzut ekranu dla debugowania
        await this.page.screenshot({ path: "login-error.png" });
        throw error;
      });

      // Sprawdź czy użytkownik jest zalogowany
      console.log("Checking if user is logged in...");

      const isLoggedIn = await this.isLoggedIn();
      if (!isLoggedIn) {
        // Zrób zrzut ekranu dla debugowania
        await this.page.screenshot({ path: "login-error.png" });
        throw new Error("Failed to log in test user: User menu not found after login");
      }

      console.log("Login successful!");
    } catch (error) {
      console.error("Login process failed:", error);
      await this.page.screenshot({ path: "login-error.png" });
      throw error;
    }
  }

  async isLoggedIn() {
    try {
      // Czekaj na element menu użytkownika
      await this.page.waitForSelector('[data-test-id="user-menu"]', {
        state: "visible",
        timeout: 30000,
      });

      // Sprawdź czy nie ma formularza logowania
      const loginForm = await this.page.locator('[data-test-id="login-form"]').count();
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
