import type { TemporaryFlashcardDto, GenerateFlashcardsResponseDto, AIFlashcardResponse } from '../../types';
import OpenAI from 'openai';

// Constants for validation
const MAX_FRONT_LENGTH = 200;
const MAX_BACK_LENGTH = 500;

// Validate required environment variable
if (!import.meta.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY,
});

/**
 * Service for handling flashcard generation using AI
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
   * Generates flashcards from the provided text using the specified model
   * @param sourceText The text to generate flashcards from
   * @param model The model to use for generation
   * @returns Generated flashcards with generation ID
   */
  static async generateFlashcards(sourceText: string, model: string): Promise<GenerateFlashcardsResponseDto> {
    try {
      const prompt = `
        Please create educational flashcards from the following text. 
        Each flashcard should have a question on the front and a concise answer on the back.
        The questions should test understanding of key concepts and important details.
        Keep the front (question) under ${MAX_FRONT_LENGTH} characters and the back (answer) under ${MAX_BACK_LENGTH} characters.
        Format your response as a JSON array of objects with 'front' and 'back' properties.

        Text to process:
        ${sourceText}
      `;

      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates educational flashcards. Your responses should be in valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in AI response');
      }

      const parsedContent = JSON.parse(content) as AIFlashcardResponse;
      if (!Array.isArray(parsedContent.flashcards)) {
        throw new Error('Invalid response format from AI');
      }

      // Map and validate the response
      const generatedFlashcards: TemporaryFlashcardDto[] = parsedContent.flashcards.map((card, index) => {
        if (typeof card.front !== 'string' || typeof card.back !== 'string') {
          throw new Error(`Invalid flashcard format at index ${index}`);
        }
        
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
      console.error('Error generating flashcards:', error);
      throw error;
    }
  }
} 