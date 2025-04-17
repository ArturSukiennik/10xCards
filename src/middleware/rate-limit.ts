import type { MiddlewareHandler, MiddlewareContext, MiddlewareNext } from '../types/astro';
import { RateLimitError } from '../lib/errors';

// Simple in-memory store for rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30; // 30 requests per minute

export const createRateLimitMiddleware = (
  maxRequests: number = MAX_REQUESTS,
  windowMs: number = WINDOW_MS
): MiddlewareHandler => {
  return async (
    { locals, request }: MiddlewareContext,
    next: MiddlewareNext
  ) => {
    const userId = locals.user?.id;
    if (!userId) {
      throw new RateLimitError('User not authenticated');
    }

    const now = Date.now();
    const userRateLimit = rateLimitStore.get(userId);

    if (!userRateLimit || now > userRateLimit.resetTime) {
      // First request or window expired - create new entry
      rateLimitStore.set(userId, {
        count: 1,
        resetTime: now + windowMs,
      });
    } else if (userRateLimit.count >= maxRequests) {
      // Rate limit exceeded
      const remainingTime = Math.ceil((userRateLimit.resetTime - now) / 1000);
      throw new RateLimitError(
        `Rate limit exceeded. Please try again in ${remainingTime} seconds`
      );
    } else {
      // Increment request count
      userRateLimit.count++;
    }

    return next();
  };
}; 