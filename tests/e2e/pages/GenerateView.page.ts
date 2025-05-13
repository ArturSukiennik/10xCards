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
        await this.page.waitForTimeout(500); // Wait for character count update
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
    return {
      flashcardsCount: await this.page.locator('[data-test-id="flashcard-item"]').count(),
      characterCount: parseInt((await this.textInputSection.characterCount.textContent()) || "0"),
      acceptedCount: await this.page.locator('[data-test-id="accepted-flashcard-item"]').count(),
      validationErrors: await this.page
        .locator('[data-test-id="validation-error"]')
        .allTextContents(),
    };
  }

  async isReadyForGeneration() {
    return !(await this.textInputSection.generateButton.isDisabled());
  }

  async generateFlashcardsFromText(text: string) {
    await this.textInputSection.enterSourceText(text);
    await this.textInputSection.generateButton.click();
    await this.page.waitForResponse(
      (response) => response.url().includes("/api/generations") && response.status() === 200,
    );
    await this.page.waitForSelector('[data-test-id="flashcard-item"]');
  }
}
