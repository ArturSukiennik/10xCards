import { z } from "zod";
import {
  OpenRouterError,
  OpenRouterAuthenticationError,
  OpenRouterRateLimitError,
  OpenRouterModelNotAvailableError,
  OpenRouterInvalidRequestError,
} from "./openrouter.errors";
import type {
  ModelInfo,
  Flashcard,
  CompletionResponse,
  OpenRouterConfig,
} from "./openrouter.interfaces";
import { DefaultOpenRouterLogger, type OpenRouterLogger } from "./openrouter.logger";

// Configuration schema
const configSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  defaultModel: z.string().min(1, "Default model is required"),
  maxRetries: z.number().int().positive().default(3),
  timeout: z.number().int().positive().default(30000),
  baseUrl: z.string().url().default("https://openrouter.ai/api/v1"),
});

// Validation schemas for public methods
const completionParamsSchema = z.object({
  systemMessage: z.string().min(1, "System message is required"),
  userMessage: z.string().min(1, "User message is required"),
  responseFormat: z.record(z.unknown()).optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().optional(),
});

const flashcardsParamsSchema = z.object({
  content: z.string().min(1, "Content is required"),
  numberOfCards: z.number().int().positive(),
  difficulty: z.enum(["basic", "intermediate", "advanced"]).optional(),
  language: z.string().length(2).optional(),
});

type Config = z.infer<typeof configSchema>;
type CompletionParams = z.infer<typeof completionParamsSchema>;
type FlashcardsParams = z.infer<typeof flashcardsParamsSchema>;

export class OpenRouterService {
  private readonly config: Config;
  private readonly controller: AbortController;
  private modelsCache: { models: ModelInfo[]; timestamp: number } | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  private readonly logger: OpenRouterLogger;
  private currentModelName = "openai/gpt-4-turbo";

  constructor(config: Partial<OpenRouterConfig>, logger?: OpenRouterLogger) {
    try {
      this.config = configSchema.parse({
        maxRetries: 3,
        timeout: 30000,
        baseUrl: "https://openrouter.ai/api/v1",
        ...config,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new OpenRouterInvalidRequestError("Invalid configuration provided", error.errors);
      }
      throw error;
    }

    this.controller = new AbortController();
    this.logger = logger ?? new DefaultOpenRouterLogger();
    this.logger.info("OpenRouter service initialized", { config: this.config });
  }

  /**
   * Returns the current configuration
   */
  public getConfig(): OpenRouterConfig {
    return {
      apiKey: this.config.apiKey,
      defaultModel: this.config.defaultModel,
      maxRetries: this.config.maxRetries,
      timeout: this.config.timeout,
      baseUrl: this.config.baseUrl,
    };
  }

  public getMetrics() {
    return this.logger.getMetrics();
  }

  // Abort all pending requests
  public abortRequests(): void {
    this.logger.info("Aborting all pending requests");
    this.controller.abort();
  }

  // Generate completion using OpenRouter API
  async generateCompletion(params: CompletionParams): Promise<CompletionResponse> {
    const startTime = Date.now();
    try {
      const validatedParams = completionParamsSchema.parse(params);
      const {
        systemMessage,
        userMessage,
        model = this.config.defaultModel,
        ...options
      } = validatedParams;

      this.logger.debug("Generating completion", { model, options });

      const response = await this.executeWithRetry(async () => {
        const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemMessage },
              { role: "user", content: userMessage },
            ],
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens,
            response_format: options.responseFormat,
          }),
          signal: this.controller.signal,
        });

        return this.handleResponse<CompletionResponse>(response);
      });

      const completionResponse = await response;
      const latency = Date.now() - startTime;

      // Only track metrics if we have valid usage data
      if (completionResponse.usage?.totalTokens) {
        this.logger.trackRequest(latency);
        this.logger.trackTokens(completionResponse.usage.totalTokens);
      }

      this.logger.info("Completion generated successfully", {
        model,
        latencyMs: latency,
        tokens: completionResponse.usage,
      });

      return completionResponse;
    } catch (error) {
      const latency = Date.now() - startTime;
      if (error instanceof z.ZodError) {
        this.logger.error("Invalid completion parameters", error, { params });
        throw new OpenRouterInvalidRequestError("Invalid completion parameters", error.errors);
      }
      this.logger.error("Failed to generate completion", error as Error, {
        params,
        latencyMs: latency,
      });
      throw error;
    }
  }

  // Generate flashcards using OpenRouter API
  async generateFlashcards(params: FlashcardsParams): Promise<Flashcard[]> {
    const startTime = Date.now();
    try {
      const validatedParams = flashcardsParamsSchema.parse(params);
      const { content, numberOfCards, difficulty = "basic", language = "pl" } = validatedParams;

      this.logger.debug("Generating flashcards", { numberOfCards, difficulty, language });

      const systemMessage = `You are a flashcard generation assistant. Create ${numberOfCards} flashcards at ${difficulty} level in ${language} language from the provided content. Focus on key concepts and important details. Format your response as a valid JSON array of objects, where each object has 'front' and 'back' properties.`;

      const response = await this.generateCompletion({
        systemMessage,
        userMessage: content,
        responseFormat: {
          type: "json_object",
        },
        temperature: 0.7,
      });

      try {
        const parsedResponse = JSON.parse(response.content);
        const flashcards = parsedResponse.flashcards as Flashcard[];

        if (!Array.isArray(flashcards)) {
          throw new Error("Response flashcards is not an array");
        }

        // Validate each flashcard has required properties
        const validFlashcards = flashcards.every(
          (card) =>
            typeof card.front === "string" &&
            typeof card.back === "string" &&
            card.front.trim() !== "" &&
            card.back.trim() !== ""
        );

        if (!validFlashcards) {
          throw new Error("Invalid flashcard format in response");
        }

        const latency = Date.now() - startTime;
        this.logger.info("Flashcards generated successfully", {
          count: flashcards.length,
          latencyMs: latency,
        });

        return flashcards;
      } catch {
        throw new OpenRouterError(
          "Failed to parse AI response as JSON array of flashcards",
          "INVALID_RESPONSE_FORMAT",
          200,
          { content: response.content }
        );
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.logger.error("Invalid flashcard parameters", error, { params });
        throw new OpenRouterInvalidRequestError("Invalid flashcard parameters", error.errors);
      }
      this.logger.error("Failed to generate flashcards", error as Error, { params });
      throw error;
    }
  }

  // Get available models from OpenRouter API with caching
  async getAvailableModels(): Promise<ModelInfo[]> {
    const startTime = Date.now();

    // Check cache first
    if (this.modelsCache && Date.now() - this.modelsCache.timestamp < this.CACHE_TTL) {
      this.logger.debug("Returning cached models");
      this.logger.trackCacheHit();
      return this.modelsCache.models;
    }

    this.logger.trackCacheMiss();
    this.logger.debug("Fetching available models");

    try {
      // Fetch fresh data
      const models = await this.executeWithRetry(async () => {
        const response = await fetch(`${this.config.baseUrl}/models`, {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          signal: this.controller.signal,
        });

        return this.handleResponse<ModelInfo[]>(response);
      });

      // Update cache
      this.modelsCache = {
        models,
        timestamp: Date.now(),
      };

      const latency = Date.now() - startTime;
      this.logger.trackRequest(latency);
      this.logger.info("Models fetched successfully", {
        count: models.length,
        latencyMs: latency,
      });

      return models;
    } catch (error) {
      this.logger.error("Failed to fetch models", error as Error);
      throw error;
    }
  }

  // Private helper method for handling API responses
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      switch (response.status) {
        case 401:
          throw new OpenRouterAuthenticationError("Invalid API key", errorData);
        case 429:
          throw new OpenRouterRateLimitError("Rate limit exceeded", errorData);
        case 404:
          throw new OpenRouterModelNotAvailableError("Model not available", errorData);
        default:
          throw new OpenRouterError("API request failed", "API_ERROR", response.status, errorData);
      }
    }

    const data = await response.json();

    if (response.url.endsWith("/chat/completions")) {
      this.logger.debug("Received API response", { response: data });

      if (!data.choices?.[0]?.message?.content) {
        throw new OpenRouterError(
          "Invalid API response format",
          "INVALID_RESPONSE",
          response.status,
          { response: data }
        );
      }

      return {
        content: data.choices[0].message.content,
        model: data.model || this.currentModelName,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
      } as T;
    }

    return data as T;
  }

  // Private helper method for executing requests with retry logic
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    retries: number = this.config.maxRetries
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        if (attempt > 0) {
          this.logger.trackRetry();
          this.logger.debug(`Retry attempt ${attempt + 1}/${retries}`);
        }
        return await operation();
      } catch (error) {
        const err = error as Error;
        lastError = err;

        // Don't retry on certain errors
        if (
          error instanceof OpenRouterAuthenticationError ||
          error instanceof OpenRouterInvalidRequestError
        ) {
          throw error;
        }

        // Wait before retrying, with exponential backoff
        if (attempt < retries - 1) {
          const backoffMs = Math.pow(2, attempt) * 1000;
          this.logger.warn(`Request failed, retrying in ${backoffMs}ms`, {
            attempt: attempt + 1,
            maxRetries: retries,
            error: err.message,
          });
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }
      }
    }

    throw lastError;
  }
}
