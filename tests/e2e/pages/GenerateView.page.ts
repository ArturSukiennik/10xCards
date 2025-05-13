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
        await page.locator(`[data-test-id="flashcard-${id}-accept"]`).click();
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
    await this.page.goto("/generate");
    await this.page.waitForLoadState("networkidle");
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

      await this.page.waitForSelector('[data-test-id="flashcard-item"]', { timeout: 30000 });
      console.log("Flashcards generated successfully");
    } catch (error) {
      console.error("Error generating flashcards:", error);
      throw error;
    }
  }
}
