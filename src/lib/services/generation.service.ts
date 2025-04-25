import type { TemporaryFlashcardDto, GenerateFlashcardsResponseDto } from "../../types";
import { OpenRouterService } from "./openrouter.service";
import type { OpenRouterConfig } from "./openrouter.interfaces";

// Constants for validation
const MAX_FRONT_LENGTH = 200;
const MAX_BACK_LENGTH = 500;

// Default configuration
const DEFAULT_CONFIG: OpenRouterConfig = {
  apiKey: import.meta.env.OPENROUTER_API_KEY || "",
  defaultModel: "openai/gpt-4o-mini",
  maxRetries: 3,
  timeout: 30000,
  baseUrl: "https://openrouter.ai/api/v1",
};

let openRouterService: OpenRouterService | null = null;
let currentConfig: OpenRouterConfig = DEFAULT_CONFIG;

/**
 * Ensures the OpenRouter service is initialized
 */
function ensureInitialized() {
  if (!openRouterService) {
    if (!currentConfig.apiKey || currentConfig.apiKey === "") {
      throw new Error(
        "OpenRouter API key is not configured. Please set OPENROUTER_API_KEY environment variable in .env file.",
      );
    }
    try {
      openRouterService = new OpenRouterService(currentConfig);
      // Test if service is properly initialized
      if (!openRouterService) {
        throw new Error("Failed to initialize OpenRouter service");
      }
    } catch (error) {
      console.error("Error initializing OpenRouter service:", error);
      throw error;
    }
  }
  return openRouterService;
}

/**
 * Initializes the OpenRouter service with the provided configuration
 */
export function initialize(config: OpenRouterConfig) {
  currentConfig = config;
  openRouterService = new OpenRouterService(currentConfig);
}

/**
 * Updates the OpenRouter service configuration
 */
export function updateConfig(config: Partial<OpenRouterConfig>) {
  currentConfig = { ...currentConfig, ...config };
  openRouterService = new OpenRouterService(currentConfig);
}

/**
 * Validates a single flashcard's content length
 * @throws Error if validation fails
 */
function validateFlashcardLength(front: string, back: string, index: number): void {
  if (front.length > MAX_FRONT_LENGTH) {
    throw new Error(`Flashcard ${index + 1} front side exceeds ${MAX_FRONT_LENGTH} characters`);
  }
  if (back.length > MAX_BACK_LENGTH) {
    throw new Error(`Flashcard ${index + 1} back side exceeds ${MAX_BACK_LENGTH} characters`);
  }
}

/**
 * Generates flashcards using OpenRouter AI
 * @param sourceText The text to generate flashcards from
 * @returns Generated flashcards with generation ID
 */
export async function generateFlashcards(
  sourceText: string,
): Promise<GenerateFlashcardsResponseDto> {
  try {
    const service = ensureInitialized();

    // Generate flashcards using OpenRouter
    const flashcards = await service.generateFlashcards({
      content: sourceText,
      numberOfCards: 10,
      difficulty: "basic",
      language: "pl",
    });

    // Validate and map to DTO format
    const generatedFlashcards: TemporaryFlashcardDto[] = flashcards.map((card, index) => {
      // Validate content length
      validateFlashcardLength(card.front, card.back, index);

      return {
        id: `temp_${index + 1}`,
        front: card.front,
        back: card.back,
      };
    });

    return {
      generation_id: 0, // Will be set by the API endpoint
      generated_flashcards: generatedFlashcards,
    };
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw error;
  }
}
