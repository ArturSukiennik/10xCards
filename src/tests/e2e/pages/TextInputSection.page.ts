import { type Page, type Locator } from "@playwright/test";

export class TextInputSectionPage {
  readonly page: Page;
  readonly sourceTextInput: Locator;
  readonly modelSelect: Locator;
  readonly generateButton: Locator;
  readonly characterCount: Locator;
  readonly validationErrors: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sourceTextInput = page.locator('[data-test-id="source-text-input"]');
    this.modelSelect = page.locator('[data-test-id="model-select"]');
    this.generateButton = page.locator('[data-test-id="generate-flashcards-button"]');
    this.characterCount = page.locator(".text-sm", { hasText: "characters" });
    this.validationErrors = page.locator(".ValidationError");
  }

  /**
   * Enters text into the source text input area
   * @param text - The text to enter
   */
  async enterSourceText(text: string): Promise<void> {
    await this.sourceTextInput.fill(text);
  }

  /**
   * Selects an AI model from the dropdown
   * @param modelId - The ID of the model to select
   */
  async selectModel(modelId: string): Promise<void> {
    await this.modelSelect.click();
    await this.page.locator(`[data-value="${modelId}"]`).click();
  }

  /**
   * Clicks the generate button and waits for the generation to complete
   */
  async generateFlashcards(): Promise<void> {
    await this.generateButton.click();
    // Wait for the button to show loading state
    await this.page.waitForSelector(
      '[data-test-id="generate-flashcards-button"]:has-text("Generating...")',
    );
    // Wait for the generation to complete (button text changes back)
    await this.page.waitForSelector(
      '[data-test-id="generate-flashcards-button"]:has-text("Generate Flashcards")',
    );
  }

  /**
   * Gets the current character count from the input
   * @returns The current number of characters
   */
  async getCharacterCount(): Promise<number> {
    const countText = await this.characterCount.textContent();
    const match = countText?.match(/(\d+)\/\d+/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Checks if the generate button is enabled
   * @returns True if the button is enabled, false otherwise
   */
  async isGenerateButtonEnabled(): Promise<boolean> {
    return await this.generateButton.isEnabled();
  }

  /**
   * Gets any validation errors that are currently displayed
   * @returns Array of error messages
   */
  async getValidationErrors(): Promise<string[]> {
    const errors = await this.validationErrors.allTextContents();
    return errors.map((error) => error.trim());
  }
}
