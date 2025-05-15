import { type Page, type Locator } from "@playwright/test";

export class FlashcardsListPage {
  readonly page: Page;
  readonly title: Locator;
  readonly flashcardsCount: Locator;
  readonly saveAllButton: Locator;
  readonly saveAcceptedButton: Locator;
  readonly flashcardsGrid: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('[data-test-id="flashcards-list-title"]');
    this.flashcardsCount = page.locator('[data-test-id="flashcards-count"]');
    this.saveAllButton = page.locator('[data-test-id="save-all-button"]');
    this.saveAcceptedButton = page.locator('[data-test-id="save-accepted-button"]');
    this.flashcardsGrid = page.locator('[data-test-id="flashcards-grid"]');
  }

  /**
   * Gets a specific flashcard item by its ID
   * @param id - The ID of the flashcard
   * @returns Locator for the flashcard item
   */
  getFlashcardItem(id: string): Locator {
    return this.page.locator(`[data-test-id="flashcard-item-${id}"]`);
  }

  /**
   * Gets the accept button for a specific flashcard
   * @param id - The ID of the flashcard
   * @returns Locator for the accept button
   */
  getAcceptButton(id: string): Locator {
    return this.page.locator(`[data-test-id="accept-button-${id}"]`);
  }

  /**
   * Gets the reject button for a specific flashcard
   * @param id - The ID of the flashcard
   * @returns Locator for the reject button
   */
  getRejectButton(id: string): Locator {
    return this.page.locator(`[data-test-id="reject-button-${id}"]`);
  }

  /**
   * Gets the total number of flashcards
   * @returns The number of flashcards
   */
  async getFlashcardsCount(): Promise<number> {
    const countText = await this.flashcardsCount.textContent();
    const match = countText?.match(/\((\d+) cards\)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Gets the number of accepted flashcards
   * @returns The number of accepted flashcards
   */
  async getAcceptedCount(): Promise<number> {
    const countText = await this.saveAcceptedButton.textContent();
    const match = countText?.match(/Save Accepted \((\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Accepts a flashcard by its ID
   * @param id - The ID of the flashcard to accept
   */
  async acceptFlashcard(id: string): Promise<void> {
    await this.getAcceptButton(id).click();
  }

  /**
   * Rejects a flashcard by its ID
   * @param id - The ID of the flashcard to reject
   */
  async rejectFlashcard(id: string): Promise<void> {
    await this.getRejectButton(id).click();
  }

  /**
   * Saves all flashcards
   */
  async saveAll(): Promise<void> {
    await this.saveAllButton.click();
    // Wait for the success toast to appear
    await this.page.waitForSelector('text="All flashcards saved successfully!"');
  }

  /**
   * Saves only accepted flashcards
   */
  async saveAccepted(): Promise<void> {
    await this.saveAcceptedButton.click();
    // Wait for the success toast to appear
    await this.page.waitForSelector('text="Accepted flashcards saved successfully!"');
  }

  /**
   * Gets the content of a specific flashcard
   * @param id - The ID of the flashcard
   * @returns Object containing front and back content
   */
  async getFlashcardContent(id: string): Promise<{ front: string; back: string }> {
    const flashcard = this.getFlashcardItem(id);
    const front = await flashcard
      .locator('text="Front:"')
      .locator("xpath=following-sibling::p")
      .textContent();
    const back = await flashcard
      .locator('text="Back:"')
      .locator("xpath=following-sibling::p")
      .textContent();
    return {
      front: front?.trim() || "",
      back: back?.trim() || "",
    };
  }

  /**
   * Waits for the flashcards list to be visible and loaded
   */
  async waitForFlashcardsList(): Promise<void> {
    await this.title.waitFor({ state: "visible" });
    await this.flashcardsGrid.waitFor({ state: "visible" });
  }
}
