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
    scrollToFlashcardsGrid: () => Promise<void>;
    saveAllFlashcards: () => Promise<void>;
    getFlashcardContent: (id: string) => Promise<{ front: string; back: string }>;
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
      scrollToFlashcardsGrid: async () => {
        console.log("Scrolling to flashcards grid...");
        const flashcardsGrid = this.page.locator('[data-test-id="flashcards-grid"]');
        await flashcardsGrid.waitFor({ state: "visible", timeout: 30000 });
        await flashcardsGrid.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1000); // Wait for scroll animation
      },
      saveAllFlashcards: async () => {
        console.log("Saving all generated flashcards...");

        // First scroll to the flashcards grid
        await this.flashcardsList.scrollToFlashcardsGrid();

        // Wait for the save all button to be visible
        const saveAllButton = this.page.locator('[data-test-id="save-all-button"]');
        await saveAllButton.waitFor({ state: "visible", timeout: 30000 });

        // Click the save all button
        await saveAllButton.click();

        // Wait for success message
        await this.page.waitForSelector('text="All flashcards saved successfully!"', {
          state: "visible",
          timeout: 30000,
        });

        console.log("All flashcards saved successfully");
      },
      getFlashcardContent: async (id: string) => {
        const front = await page.locator(`[data-test-id="flashcard-${id}-front"]`).textContent();
        const back = await page.locator(`[data-test-id="flashcard-${id}-back"]`).textContent();
        return { front: front || "", back: back || "" };
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
    // First scroll to the flashcards grid if there are any flashcards
    const hasFlashcards = (await this.page.locator('[data-test-id="flashcard-item"]').count()) > 0;
    if (hasFlashcards) {
      await this.flashcardsList.scrollToFlashcardsGrid();
    }

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

    console.log("Clicking generate button...");
    await this.textInputSection.generateButton.click();

    try {
      console.log("Waiting for generation API response...");
      const response = await this.page.waitForResponse(
        (response) => {
          const isGenerationResponse = response.url().includes("/api/generations");
          if (isGenerationResponse) {
            console.log("Generation response status:", response.status());
            if (response.status() !== 200) {
              console.log("Generation response error:", response.statusText());
            }
          }
          return isGenerationResponse && response.status() === 200;
        },
        { timeout: 120000 }, // Zwiększamy timeout do 120 sekund
      );

      // Log response details for debugging
      const responseData = await response.json().catch(() => null);
      console.log("Generation response data:", responseData);

      // Wait for flashcards grid to appear
      console.log("Waiting for flashcards grid...");
      await this.page.waitForSelector('[data-test-id="flashcards-grid"]', {
        state: "visible",
        timeout: 30000,
      });

      // Wait for at least one flashcard to appear
      console.log("Waiting for flashcards to appear...");
      await this.page.waitForSelector('[data-test-id="flashcard-item"]', {
        state: "visible",
        timeout: 30000,
      });

      // Scroll to flashcards
      console.log("Scrolling to flashcards...");
      await this.flashcardsList.scrollToFlashcardsGrid();

      // Take a screenshot for debugging
      await this.page.screenshot({ path: "flashcards-generated.png" });

      // Verify flashcards were generated
      const state = await this.getCurrentState();
      console.log("Final state after generation:", state);
      if (state.flashcardsCount === 0) {
        throw new Error("No flashcards were generated");
      }
    } catch (error) {
      console.error("Error during flashcard generation:", error);
      // Take error screenshot
      await this.page.screenshot({ path: "flashcard-generation-error.png" });
      throw error;
    }
  }
}
