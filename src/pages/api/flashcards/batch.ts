import type { APIRoute } from 'astro';
import { FlashcardsService } from '../../../lib/services/flashcards.service';
import { 
  AuthorizationError, 
  ValidationError, 
  RateLimitError,
  GenerationNotFoundError
} from '../../../lib/errors';
import { authMiddleware } from '../../../middleware/auth';
import { createRateLimitMiddleware } from '../../../middleware/rate-limit';
import type { MiddlewareContext } from '../../../types/astro';

export const prerender = false;

// Create middleware chain with lower rate limit for batch operations
const rateLimit = createRateLimitMiddleware(30); // 30 requests per minute for batch operations

// POST /api/flashcards/batch
export const POST: APIRoute = async ({ request, locals }: MiddlewareContext) => {
  try {
    // Apply middleware
    await authMiddleware({ locals, request }, () => Promise.resolve(new Response()));
    await rateLimit({ locals, request }, () => Promise.resolve(new Response()));

    if (!locals.user) {
      throw new AuthorizationError('User not authenticated');
    }

    const flashcardsService = new FlashcardsService(locals.supabase);
    const body = await request.json();
    
    const result = await flashcardsService.createFlashcards(
      locals.user.id,
      body
    );

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (error instanceof AuthorizationError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (error instanceof RateLimitError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (error instanceof GenerationNotFoundError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 