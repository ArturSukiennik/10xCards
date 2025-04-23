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

  info(message: string, metadata?: Record<string, unknown>): void {
    console.info(`[OpenRouter] ${message}`, metadata ?? "");
  }

  error(message: string, error: Error, metadata?: Record<string, unknown>): void {
    console.error(`[OpenRouter] ${message}`, error, metadata ?? "");
    this.metrics.errorCount++;
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    console.warn(`[OpenRouter] ${message}`, metadata ?? "");
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    console.debug(`[OpenRouter] ${message}`, metadata ?? "");
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
