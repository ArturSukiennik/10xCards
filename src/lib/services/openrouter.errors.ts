// Base error class for OpenRouter service
export class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

// Authentication related errors
export class OpenRouterAuthenticationError extends OpenRouterError {
  constructor(message: string, details?: unknown) {
    super(message, "AUTHENTICATION_ERROR", 401, details);
    this.name = "OpenRouterAuthenticationError";
  }
}

// Rate limiting errors
export class OpenRouterRateLimitError extends OpenRouterError {
  constructor(message: string, details?: unknown) {
    super(message, "RATE_LIMIT_ERROR", 429, details);
    this.name = "OpenRouterRateLimitError";
  }
}

// Model availability errors
export class OpenRouterModelNotAvailableError extends OpenRouterError {
  constructor(message: string, details?: unknown) {
    super(message, "MODEL_NOT_AVAILABLE", 404, details);
    this.name = "OpenRouterModelNotAvailableError";
  }
}

// Invalid request errors
export class OpenRouterInvalidRequestError extends OpenRouterError {
  constructor(message: string, details?: unknown) {
    super(message, "INVALID_REQUEST", 400, details);
    this.name = "OpenRouterInvalidRequestError";
  }
}
