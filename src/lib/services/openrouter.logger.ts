export interface OpenRouterMetrics {
  requestCount: number;
  errorCount: number;
  retryCount: number;
  totalTokens: number;
  averageLatency: number;
  cacheHits: number;
  cacheMisses: number;
}

export interface OpenRouterLogger {
  info(message: string, metadata?: Record<string, unknown>): void;
  error(message: string, error: Error, metadata?: Record<string, unknown>): void;
  warn(message: string, metadata?: Record<string, unknown>): void;
  debug(message: string, metadata?: Record<string, unknown>): void;
  getMetrics(): OpenRouterMetrics;

  // Tracking methods
  trackRequest(latencyMs: number): void;
  trackRetry(): void;
  trackTokens(count: number): void;
  trackCacheHit(): void;
  trackCacheMiss(): void;
}

export class DefaultOpenRouterLogger implements OpenRouterLogger {
  private metrics: OpenRouterMetrics = {
    requestCount: 0,
    errorCount: 0,
    retryCount: 0,
    totalTokens: 0,
    averageLatency: 0,
    cacheHits: 0,
    cacheMisses: 0,
  };

  private totalLatency = 0;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  info(_message: string, _metadata?: Record<string, unknown>): void {
    // Disable info logs
  }

  error(message: string, error: Error): void {
    // Only log critical errors
    if (error.name !== "AbortError" && !message.includes("retry")) {
      console.error(`[OpenRouter] Critical error: ${error.message}`);
    }
    this.metrics.errorCount++;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  warn(_message: string, _metadata?: Record<string, unknown>): void {
    // Disable warning logs
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  debug(_message: string, _metadata?: Record<string, unknown>): void {
    // Disable debug logs
  }

  trackRequest(latencyMs: number): void {
    this.metrics.requestCount++;
    this.totalLatency += latencyMs;
    this.metrics.averageLatency = this.totalLatency / this.metrics.requestCount;
  }

  trackRetry(): void {
    this.metrics.retryCount++;
  }

  trackTokens(count: number): void {
    this.metrics.totalTokens += count;
  }

  trackCacheHit(): void {
    this.metrics.cacheHits++;
  }

  trackCacheMiss(): void {
    this.metrics.cacheMisses++;
  }

  getMetrics(): OpenRouterMetrics {
    return { ...this.metrics };
  }
}
