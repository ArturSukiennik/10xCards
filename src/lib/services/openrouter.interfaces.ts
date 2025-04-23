// Model information interface
export interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  contextLength: number;
  pricing: {
    prompt: number;
    completion: number;
  };
}

// Flashcard interface
export interface Flashcard {
  front: string;
  back: string;
  difficulty?: "basic" | "intermediate" | "advanced";
  tags?: string[];
}

// API completion response interface
export interface CompletionResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Configuration interface
export interface OpenRouterConfig {
  apiKey: string;
  defaultModel: string;
  maxRetries?: number;
  timeout?: number;
  baseUrl?: string;
}
