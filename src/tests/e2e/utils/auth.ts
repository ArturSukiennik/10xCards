import { type Page } from "@playwright/test";
import { TEST_CONFIG } from "../config";

export class AuthUtils {
  constructor(private page: Page) {}

  /**
   * Logs in the test user using environment variables
   */
  async loginTestUser(): Promise<void> {
    const email = process.env.E2E_TEST_USER_EMAIL;
    const password = process.env.E2E_TEST_USER_PASSWORD;

    if (!email || !password) {
      throw new Error(
        "Missing test user credentials. Please set E2E_TEST_USER_EMAIL and E2E_TEST_USER_PASSWORD in .env.test",
      );
    }

    console.log(`Attempting to log in test user: ${email}`);

    // Przejdź do strony logowania
    await this.page.goto(`${TEST_CONFIG.baseUrl}/login`);

    // Poczekaj na załadowanie formularza
    await this.page.waitForSelector('[data-test-id="auth-form"]', { timeout: 5000 });

    // Wypełnij formularz danymi z zmiennych środowiskowych
    await this.page.fill('[data-test-id="email-input"]', email);
    await this.page.fill('[data-test-id="password-input"]', password);

    // Kliknij przycisk logowania
    await this.page.click('[data-test-id="login-button"]');

    try {
      // Poczekaj na przekierowanie
      await this.page.waitForURL(`${TEST_CONFIG.baseUrl}/**`, { timeout: 5000 });

      // Sprawdź czy jesteśmy na stronie głównej
      const currentUrl = this.page.url();
      if (currentUrl.includes("/login")) {
        // Jeśli wciąż jesteśmy na stronie logowania, sprawdź błędy
        const errorElement = await this.page.locator('[data-test-id="auth-form-error"]');
        if (await errorElement.isVisible()) {
          const errorText = await errorElement.textContent();
          throw new Error(`Login failed: ${errorText}`);
        }
        throw new Error("Login failed: Still on login page");
      }

      // Poczekaj na załadowanie TopBar
      await this.page.waitForSelector('[data-test-id="top-bar"]', { timeout: 5000 });

      // Sprawdź czy użytkownik jest zalogowany
      const userEmail = await this.page.locator('[data-test-id="user-email"]').textContent();
      if (!userEmail?.includes(email)) {
        throw new Error("Login failed: User email not found in TopBar");
      }

      console.log("Test user successfully logged in");
    } catch (error) {
      console.error("Failed to log in test user:", error);

      // Zrób screenshot dla debugowania
      await this.page.screenshot({ path: "login-error.png" });

      throw error;
    }
  }

  /**
   * Checks if the user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    const email = process.env.E2E_TEST_USER_EMAIL;

    if (!email) {
      throw new Error("E2E_TEST_USER_EMAIL environment variable is not set");
    }

    try {
      // Poczekaj na załadowanie TopBar
      await this.page.waitForSelector('[data-test-id="top-bar"]', { timeout: 2000 });

      // Sprawdź czy email użytkownika jest widoczny
      const userEmail = await this.page.locator('[data-test-id="user-email"]').textContent();
      return userEmail?.includes(email) || false;
    } catch {
      return false;
    }
  }
}
