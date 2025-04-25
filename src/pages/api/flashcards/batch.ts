import type { APIRoute } from "astro";
import { FlashcardsService } from "../../../lib/services/flashcards.service";
import { ValidationError, GenerationNotFoundError } from "../../../lib/errors";
import type { MiddlewareContext } from "../../../types/astro";
import { supabase } from "@/lib/supabase";

export const prerender = false;

// POST /api/flashcards/batch
export const POST: APIRoute = async ({ request, locals }: MiddlewareContext) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!locals.supabase) {
      console.error("Supabase client not available");
      return new Response(JSON.stringify({ error: "Database connection not available" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const flashcardsService = new FlashcardsService(locals.supabase);
    const body = await request.json();

    console.log("Request body:", body);

    const result = await flashcardsService.createFlashcards(session.user.id, body);
    console.log("Created flashcards:", result);

    return new Response(JSON.stringify(result), {
      status: 201,
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

    if (error instanceof GenerationNotFoundError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.error("Unexpected error:", error);
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
