import type { TemporaryFlashcardDto, GenerateFlashcardsResponseDto } from '../../types';
import OpenAI from 'openai';

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
        Keep the front (question) under 200 characters and the back (answer) under 500 characters.
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

      const parsedContent = JSON.parse(content);
      if (!Array.isArray(parsedContent.flashcards)) {
        throw new Error('Invalid response format from AI');
      }

      // Map the response to TemporaryFlashcardDto format
      const generatedFlashcards = parsedContent.flashcards.map((card: any, index: number) => ({
        id: `temp_${index + 1}`,
        front: card.front,
        back: card.back
      }));

      // Note: generation_id will be set by the API endpoint
      return {
        generation_id: 0,
        generated_flashcards: generatedFlashcards
      };

    } catch (error) {
      console.error('Error generating flashcards:', error);
      throw error;
    }
  }
} 