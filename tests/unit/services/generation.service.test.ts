import { describe, test, expect, beforeEach, vi } from "vitest";
import { initialize } from "../../../src/lib/services/generation.service";
import type { OpenRouterConfig } from "../../../src/lib/services/openrouter.interfaces";

// Mock environment variables
vi.mock("import.meta.env", () => ({
  env: {
    OPENROUTER_API_KEY: "test-key",
  },
}));

describe("Generation Service", () => {
  beforeEach(() => {
    const config: OpenRouterConfig = {
      apiKey: "test-key",
      defaultModel: "openai/gpt-4o-mini",
      maxRetries: 3,
      timeout: 30000,
      baseUrl: "https://openrouter.ai/api/v1",
    };

    initialize(config);
  });

  test("should initialize with default config when valid API key is provided", () => {
    const validConfig: OpenRouterConfig = {
      apiKey: "test-key",
      defaultModel: "openai/gpt-4o-mini",
      maxRetries: 3,
      timeout: 30000,
      baseUrl: "https://openrouter.ai/api/v1",
    };

    expect(() => initialize(validConfig)).not.toThrow();
  });

  test("should throw error when initializing without API key", () => {
    const invalidConfig: OpenRouterConfig = {
      apiKey: "",
      defaultModel: "openai/gpt-4o-mini",
      maxRetries: 3,
      timeout: 30000,
      baseUrl: "https://openrouter.ai/api/v1",
    };

    expect(() => initialize(invalidConfig)).toThrow("OpenRouter API key is not configured");
  });
});
