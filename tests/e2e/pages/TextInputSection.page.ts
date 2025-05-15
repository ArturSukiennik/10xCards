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
    this.generateButton = page.locator('[data-test-id="generate-button"]');
    this.characterCount = page.locator('[data-test-id="character-count"]');
    this.validationErrors = page.locator('[data-test-id="validation-error"]');
  }

  /**
   * Enters text into the source text input
   * @param text - The text to enter
   */
  async enterSourceText(text: string): Promise<void> {
    await this.sourceTextInput.fill(text);
    await this.page.waitForTimeout(500); // Wait for character count update
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
    await this.page.waitForSelector('[data-test-id="generate-button"]:has-text("Generating...")');
    // Wait for the generation to complete (button text changes back)
    await this.page.waitForSelector(
      '[data-test-id="generate-button"]:has-text("Generate Flashcards")'
    );
  }

  /**
   * Gets the current character count
   */
  async getCharacterCount(): Promise<number> {
    const text = await this.characterCount.textContent();
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Gets all validation errors
   */
  async getValidationErrors(): Promise<string[]> {
    return await this.validationErrors.allTextContents();
  }
}
