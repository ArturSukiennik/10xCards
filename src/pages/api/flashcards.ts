import type { APIRoute } from "astro";
import { FlashcardsService } from "../../lib/services/flashcards.service";
import { ValidationError, RateLimitError } from "../../lib/errors";
import { createRateLimitMiddleware } from "../../middleware/rate-limit";
import type { MiddlewareContext } from "../../types/astro";

export const prerender = false;

// Create middleware chain
const rateLimit = createRateLimitMiddleware(60); // 60 requests per minute for single flashcards

// GET /api/flashcards
export const GET: APIRoute = async ({ request, locals }: MiddlewareContext) => {
  try {
    if (!locals.supabase) {
      return new Response(JSON.stringify({ error: "Database connection not available" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const {
      data: { session },
    } = await locals.supabase.auth.getSession();

    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    const flashcardsService = new FlashcardsService(locals.supabase);
    const result = await flashcardsService.getFlashcards(session.user.id, { page, limit });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error details:", error);

    if (error instanceof ValidationError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

// POST /api/flashcards
export const POST: APIRoute = async ({ request, locals }: MiddlewareContext) => {
  try {
    if (!locals.supabase) {
      return new Response(JSON.stringify({ error: "Database connection not available" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const {
      data: { session },
    } = await locals.supabase.auth.getSession();

    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Apply rate limit middleware
    await rateLimit({ request, locals }, () => Promise.resolve(new Response()));

    const flashcardsService = new FlashcardsService(locals.supabase);
    const body = await request.json();

    const flashcard = await flashcardsService.createFlashcard(session.user.id, body);

    return new Response(JSON.stringify(flashcard), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (error instanceof RateLimitError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
