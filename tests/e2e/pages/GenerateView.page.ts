import type { Page, Locator } from "@playwright/test";

export class GenerateViewPage {
  readonly page: Page;
  readonly textInputSection: {
    textarea: Locator;
    generateButton: Locator;
    characterCount: Locator;
    enterSourceText: (text: string) => Promise<void>;
  };
  readonly flashcardsList: {
    acceptFlashcard: (id: string) => Promise<void>;
    getFlashcardContent: (id: string) => Promise<{ front: string; back: string }>;
    saveAccepted: () => Promise<void>;
  };

  constructor(page: Page) {
    this.page = page;

    // Text input section
    this.textInputSection = {
      textarea: page.locator('[data-test-id="source-text-input"]'),
      generateButton: page.locator('[data-test-id="generate-button"]'),
      characterCount: page.locator('[data-test-id="character-count"]'),
      enterSourceText: async (text: string) => {
        await this.textInputSection.textarea.fill(text);
        await this.page.waitForTimeout(1000); // Zwiększamy czas oczekiwania na aktualizację licznika
      },
    };

    // Flashcards list section
    this.flashcardsList = {
      acceptFlashcard: async (id: string) => {
        console.log(`Attempting to accept flashcard ${id}...`);

        // Wait for the flashcards grid to be loaded
        const flashcardsGrid = page.locator('[data-test-id="flashcards-grid"]');
        await flashcardsGrid.waitFor({ state: "visible", timeout: 30000 });

        // Wait for flashcards to be loaded
        await page.waitForFunction(
          () => {
            const items = document.querySelectorAll(
              '[data-test-id="flashcard-item"], [data-test-id="flashcard-item-accepted"]',
            );
            return items.length > 0;
          },
          { timeout: 30000 },
        );

        // Get all flashcard items
        const flashcardItems = page.locator(
          '[data-test-id="flashcard-item"], [data-test-id="flashcard-item-accepted"]',
        );

        // Get the count of flashcards
        const count = await flashcardItems.count();
        console.log(`Found ${count} flashcard(s)`);

        // Find the specific flashcard
        const flashcardIndex = parseInt(id) - 1;
        if (flashcardIndex >= count) {
          throw new Error(`Flashcard with id ${id} not found. Total flashcards: ${count}`);
        }

        // Get the specific flashcard
        const flashcard = flashcardItems.nth(flashcardIndex);

        try {
          // Wait for the flashcard to be visible and stable
          await flashcard.waitFor({ state: "visible", timeout: 30000 });

          // Scroll the flashcard into view
          await flashcard.scrollIntoViewIfNeeded();

          // Wait a moment for the scroll animation to complete
          await page.waitForTimeout(1000);

          // Get the accept button
          const acceptButton = flashcard.locator(`[data-test-id="flashcard-${id}-accept"]`);

          // Wait for the button to be visible and enabled
          await acceptButton.waitFor({ state: "visible", timeout: 30000 });

          // Ensure the button is enabled and visible
          await acceptButton.evaluate((el) => {
            if (el.hasAttribute("disabled")) {
              throw new Error("Accept button is disabled");
            }
            const style = window.getComputedStyle(el);
            if (style.display === "none" || style.visibility === "hidden") {
              throw new Error("Accept button is not visible");
            }
          });

          // Try to click the button with retries
          let retries = 3;
          while (retries > 0) {
            try {
              await acceptButton.click({ timeout: 10000, force: true });
              console.log(`Successfully accepted flashcard ${id}`);
              break;
            } catch (error) {
              retries--;
              if (retries === 0) throw error;
              console.log(`Retrying click on flashcard ${id}, ${retries} attempts left`);
              await page.waitForTimeout(1000); // Wait 1s between retries
            }
          }

          // Wait for the flashcard to be marked as accepted
          await page
            .locator(`[data-test-id="flashcard-item-accepted"]`)
            .waitFor({ state: "visible", timeout: 30000 });
        } catch (error) {
          console.error(`Error accepting flashcard ${id}:`, error);
          // Take a screenshot for debugging
          await page.screenshot({ path: `flashcard-${id}-accept-error.png` });
          throw error;
        }
      },
      getFlashcardContent: async (id: string) => {
        const front = await page.locator(`[data-test-id="flashcard-${id}-front"]`).textContent();
        const back = await page.locator(`[data-test-id="flashcard-${id}-back"]`).textContent();
        return { front: front || "", back: back || "" };
      },
      saveAccepted: async () => {
        await page.locator('[data-test-id="save-accepted-button"]').click();
      },
    };
  }

  async goto() {
    await this.page.goto("/generate", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Wait for essential elements to be present
    await Promise.all([
      this.page.waitForSelector('[data-test-id="source-text-input"]', {
        state: "visible",
        timeout: 30000,
      }),
      this.page.waitForSelector('[data-test-id="generate-button"]', {
        state: "visible",
        timeout: 30000,
      }),
    ]);

    // Optional: wait for network to be idle, but don't fail if it times out
    try {
      await this.page.waitForLoadState("networkidle", { timeout: 10000 });
    } catch (error) {
      console.log("Network did not become idle, but continuing anyway:", error);
    }
  }

  async getCurrentState() {
    const state = {
      flashcardsCount: await this.page.locator('[data-test-id="flashcard-item"]').count(),
      characterCount: parseInt((await this.textInputSection.characterCount.textContent()) || "0"),
      acceptedCount: await this.page.locator('[data-test-id="accepted-flashcard-item"]').count(),
      validationErrors: await this.page
        .locator('[data-test-id="validation-error"], [data-test-id="error-message"]')
        .allTextContents(),
    };

    console.log("Current page state:", state);
    return state;
  }

  async isReadyForGeneration() {
    const isDisabled = await this.textInputSection.generateButton.isDisabled();
    console.log("Generate button disabled:", isDisabled);
    return !isDisabled;
  }

  async generateFlashcardsFromText(text: string) {
    console.log("Generating flashcards from text...");
    await this.textInputSection.enterSourceText(text);

    const isReady = await this.isReadyForGeneration();
    if (!isReady) {
      const state = await this.getCurrentState();
      console.log("Cannot generate flashcards - button disabled. Current state:", state);
      throw new Error("Generate button is disabled");
    }

    await this.textInputSection.generateButton.click();

    try {
      await this.page.waitForResponse(
        (response) => {
          const isGenerationResponse = response.url().includes("/api/generations");
          if (isGenerationResponse) {
            console.log("Generation response status:", response.status());
          }
          return isGenerationResponse && response.status() === 200;
        },
        { timeout: 30000 },
      );

      // Wait for the flashcards grid to appear
      const flashcardsGrid = await this.page.waitForSelector('[data-test-id="flashcards-grid"]', {
        timeout: 30000,
        state: "visible",
      });

      // Scroll the flashcards grid into view
      await flashcardsGrid.scrollIntoViewIfNeeded();

      // Wait a moment for the scroll animation to complete
      await this.page.waitForTimeout(1000);

      // Wait for at least one flashcard to be visible
      await this.page.waitForSelector('[data-test-id="flashcard-item"]', {
        timeout: 30000,
        state: "visible",
      });

      console.log("Flashcards generated successfully");
    } catch (error) {
      console.error("Error generating flashcards:", error);
      throw error;
    }
  }
}
