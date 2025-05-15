import { type Page } from "@playwright/test";
import { TextInputSectionPage } from "./TextInputSection.page";
import { FlashcardsListPage } from "./FlashcardsList.page";
import { TEST_CONFIG } from "../config";

export class GenerateViewPage {
  readonly page: Page;
  readonly textInputSection: TextInputSectionPage;
  readonly flashcardsList: FlashcardsListPage;

  constructor(page: Page) {
    this.page = page;
    this.textInputSection = new TextInputSectionPage(page);
    this.flashcardsList = new FlashcardsListPage(page);
  }

  /**
   * Navigates to the generate view page
   */
  async goto(): Promise<void> {
    await this.page.goto(`${TEST_CONFIG.baseUrl}/generate`);
  }

  /**
   * Generates flashcards from the given text
   * @param text - The source text to generate flashcards from
   * @param modelId - Optional model ID to use (defaults to first available)
   */
  async generateFlashcardsFromText(text: string, modelId?: string): Promise<void> {
    await this.textInputSection.enterSourceText(text);

    if (modelId) {
      await this.textInputSection.selectModel(modelId);
    }

    await this.textInputSection.generateFlashcards();
    await this.flashcardsList.waitForFlashcardsList();
  }

  /**
   * Checks if the page is ready for flashcard generation
   * @returns True if the page is ready, false otherwise
   */
  async isReadyForGeneration(): Promise<boolean> {
    return await this.textInputSection.isGenerateButtonEnabled();
  }

  /**
   * Gets the current state of the generation process
   * @returns Object containing current state information
   */
  async getCurrentState(): Promise<{
    characterCount: number;
    flashcardsCount: number;
    acceptedCount: number;
    validationErrors: string[];
  }> {
    return {
      characterCount: await this.textInputSection.getCharacterCount(),
      flashcardsCount: await this.flashcardsList.getFlashcardsCount(),
      acceptedCount: await this.flashcardsList.getAcceptedCount(),
      validationErrors: await this.textInputSection.getValidationErrors(),
    };
  }
}
