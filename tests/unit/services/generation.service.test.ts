import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import {
  initialize,
  updateConfig,
  generateFlashcards,
} from "../../../src/lib/services/generation.service";
import { OpenRouterService } from "../../../src/lib/services/openrouter.service";
import type { OpenRouterConfig, Flashcard } from "../../../src/lib/services/openrouter.interfaces";

// Mock OpenRouter service
vi.mock("../../../src/lib/services/openrouter.service");

// Mock environment variables
vi.mock("import.meta.env", () => ({
  env: {
    OPENROUTER_API_KEY: "test-key",
  },
}));

describe("Generation Service", () => {
  let mockService: OpenRouterService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => void 0);

    // Initialize OpenRouterService mock
    mockService = {
      generateFlashcards: vi.fn(),
      config: {} as OpenRouterConfig,
    } as unknown as OpenRouterService;

    vi.mocked(OpenRouterService).mockImplementation(() => mockService);

    // Initialize service with valid config
    initialize({
      apiKey: "test-key",
      defaultModel: "test-model",
      maxRetries: 3,
      timeout: 30000,
      baseUrl: "https://test.com",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initialization", () => {
    test("should initialize with default config when valid API key is provided", () => {
      // Arrange
      const validConfig: OpenRouterConfig = {
        apiKey: "test-key",
        defaultModel: "openai/gpt-4o-mini",
        maxRetries: 3,
        timeout: 30000,
        baseUrl: "https://openrouter.ai/api/v1",
      };

      // Act & Assert
      expect(() => initialize(validConfig)).not.toThrow();
    });

    test("should throw error when initializing without API key", () => {
      // Arrange
      const invalidConfig: OpenRouterConfig = {
        apiKey: "",
        defaultModel: "openai/gpt-4o-mini",
        maxRetries: 3,
        timeout: 30000,
        baseUrl: "https://openrouter.ai/api/v1",
      };

      // Act & Assert
      expect(() => initialize(invalidConfig)).toThrow("OpenRouter API key is not configured");
    });
  });

  describe("Configuration Updates", () => {
    test("should update configuration partially", () => {
      // Arrange
      const initialConfig: OpenRouterConfig = {
        apiKey: "test-key",
        defaultModel: "openai/gpt-4o-mini",
        maxRetries: 3,
        timeout: 30000,
        baseUrl: "https://openrouter.ai/api/v1",
      };
      initialize(initialConfig);

      // Act
      updateConfig({ maxRetries: 5 });

      // Assert - verify service was reinitialized
      expect(OpenRouterService).toHaveBeenLastCalledWith(
        expect.objectContaining({ maxRetries: 5 }),
      );
    });
  });

  describe("Flashcard Validation", () => {
    test("should validate flashcard within length limits", async () => {
      // Arrange
      const sourceText = "Sample text";
      const mockFlashcards: Flashcard[] = [
        {
          front: "A".repeat(200),
          back: "B".repeat(500),
        },
      ];

      vi.mocked(mockService.generateFlashcards).mockResolvedValue(mockFlashcards);

      // Act & Assert
      await expect(generateFlashcards(sourceText)).resolves.toBeDefined();
    });

    test("should throw error when front side exceeds limit", async () => {
      // Arrange
      const sourceText = "Sample text";
      const mockFlashcards: Flashcard[] = [
        {
          front: "A".repeat(201),
          back: "B".repeat(500),
        },
      ];

      vi.mocked(mockService.generateFlashcards).mockResolvedValue(mockFlashcards);

      // Act & Assert
      await expect(generateFlashcards(sourceText)).rejects.toThrow(
        "Flashcard 1 front side exceeds 200 characters",
      );
    });

    test("should throw error when back side exceeds limit", async () => {
      // Arrange
      const sourceText = "Sample text";
      const mockFlashcards: Flashcard[] = [
        {
          front: "A".repeat(200),
          back: "B".repeat(501),
        },
      ];

      vi.mocked(mockService.generateFlashcards).mockResolvedValue(mockFlashcards);

      // Act & Assert
      await expect(generateFlashcards(sourceText)).rejects.toThrow(
        "Flashcard 1 back side exceeds 500 characters",
      );
    });
  });

  describe("Flashcard Generation", () => {
    test("should successfully generate flashcards from source text", async () => {
      // Arrange
      const sourceText = "Sample text for flashcard generation";
      const mockFlashcards: Flashcard[] = [
        { front: "Question 1", back: "Answer 1" },
        { front: "Question 2", back: "Answer 2" },
      ];

      vi.mocked(mockService.generateFlashcards).mockResolvedValue(mockFlashcards);

      // Act
      const result = await generateFlashcards(sourceText);

      // Assert
      expect(result.generated_flashcards).toHaveLength(2);
      expect(result.generated_flashcards[0]).toMatchObject({
        id: expect.stringMatching(/^temp_1$/),
        front: "Question 1",
        back: "Answer 1",
      });
    });

    test("should handle empty source text", async () => {
      // Arrange
      const sourceText = "";

      // Act & Assert
      await expect(generateFlashcards(sourceText)).rejects.toThrow();
    });
  });

  describe("Error Handling", () => {
    test("should handle OpenRouter service errors", async () => {
      // Arrange
      const sourceText = "Sample text";
      const mockError = new Error("OpenRouter API error");

      vi.mocked(mockService.generateFlashcards).mockRejectedValue(mockError);

      // Act & Assert
      await expect(generateFlashcards(sourceText)).rejects.toThrow("OpenRouter API error");
    });

    test("should handle network timeouts", async () => {
      // Arrange
      const sourceText = "Sample text";
      const mockTimeoutError = new Error("Request timeout");

      vi.mocked(mockService.generateFlashcards).mockRejectedValue(mockTimeoutError);

      // Act & Assert
      await expect(generateFlashcards(sourceText)).rejects.toThrow("Request timeout");
    });
  });

  describe("OpenRouter Integration", () => {
    test("should call OpenRouter with correct parameters", async () => {
      // Arrange
      const sourceText = "Sample text";
      const mockFlashcards: Flashcard[] = [{ front: "Question 1", back: "Answer 1" }];

      vi.mocked(mockService.generateFlashcards).mockResolvedValue(mockFlashcards);

      // Act
      await generateFlashcards(sourceText);

      // Assert
      expect(mockService.generateFlashcards).toHaveBeenCalledWith({
        content: sourceText,
        numberOfCards: 8,
        difficulty: "basic",
        language: "pl",
      });
    });
  });
});
