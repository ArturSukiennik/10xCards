import type { TemporaryFlashcardDto, GenerateFlashcardsResponseDto } from '../../types';

// Constants for validation
const MAX_FRONT_LENGTH = 200;
const MAX_BACK_LENGTH = 500;

// Mock flashcards data
const MOCK_FLASHCARDS = [
  {
    front: "What is TypeScript?",
    back: "TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale."
  },
  {
    front: "What is React?",
    back: "React is a JavaScript library for building user interfaces, particularly single-page applications where you need a fast, interactive user experience."
  },
  {
    front: "What is Astro?",
    back: "Astro is a modern static site builder that allows you to use your favorite JavaScript framework while delivering lightning-fast performance."
  },
  {
    front: "What is Tailwind CSS?",
    back: "Tailwind CSS is a utility-first CSS framework that provides low-level utility classes to build custom designs directly in your markup."
  }
];

/**
 * Service for handling flashcard generation using AI (currently mocked)
 */
export class GenerationService {
  /**
   * Validates a single flashcard's content length
   * @throws Error if validation fails
   */
  private static validateFlashcardLength(front: string, back: string, index: number): void {
    if (front.length > MAX_FRONT_LENGTH) {
      throw new Error(`Flashcard ${index + 1} front side exceeds ${MAX_FRONT_LENGTH} characters`);
    }
    if (back.length > MAX_BACK_LENGTH) {
      throw new Error(`Flashcard ${index + 1} back side exceeds ${MAX_BACK_LENGTH} characters`);
    }
  }

  /**
   * Returns mock flashcards instead of generating them with AI
   * @param sourceText The text to generate flashcards from (currently ignored)
   * @param model The model to use for generation (currently ignored)
   * @returns Generated mock flashcards with generation ID
   */
  static async generateFlashcards(sourceText: string, model: string): Promise<GenerateFlashcardsResponseDto> {
    try {
      // Map mock data to DTO format and validate
      const generatedFlashcards: TemporaryFlashcardDto[] = MOCK_FLASHCARDS.map((card, index) => {
        // Validate content length
        this.validateFlashcardLength(card.front, card.back, index);

        return {
          id: `temp_${index + 1}`,
          front: card.front,
          back: card.back
        };
      });

      return {
        generation_id: 0, // Will be set by the API endpoint
        generated_flashcards: generatedFlashcards
      };

    } catch (error) {
      console.error('Error generating mock flashcards:', error);
      throw error;
    }
  }
} 