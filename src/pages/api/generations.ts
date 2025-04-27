import type { APIRoute } from "astro";
import type { GenerateFlashcardsCommand, GenerateFlashcardsResponseDto } from "../../types";
import { generateFlashcardsSchema } from "../../lib/validation/generation.schema";
import { ZodError } from "zod";
import crypto from "crypto";
import { OpenRouterService } from "../../lib/services/openrouter.service";

export const prerender = false;

// Initialize OpenRouter service with default configuration
const openRouterService = new OpenRouterService({
  apiKey: import.meta.env.OPENROUTER_API_KEY || "",
  defaultModel: "openai/gpt-4o-mini",
  maxRetries: 3,
  timeout: 30000,
  baseUrl: "https://openrouter.ai/api/v1",
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // 1. Check if supabase client is available
    if (!locals.supabase) {
      return new Response(JSON.stringify({ error: "Database client not available" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Get user from locals (set by middleware)
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Parse and validate request body
    const rawBody: GenerateFlashcardsCommand = await request.json();

    // Set default model if not provided
    const bodyWithDefaults = {
      ...rawBody,
      model: rawBody.model || "openai/gpt-4o-mini",
    };

    const validationResult = generateFlashcardsSchema.safeParse(bodyWithDefaults);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));

      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const body = validationResult.data;

    // 4. Validate source text is not empty
    if (!body.source_text.trim()) {
      return new Response(JSON.stringify({ error: "Source text cannot be empty" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 5. Generate flashcards using OpenRouter service
    let generationResult: GenerateFlashcardsResponseDto;
    const startTime = Date.now();
    try {
      const flashcards = await openRouterService.generateFlashcards({
        content: body.source_text,
        numberOfCards: 4,
        difficulty: "intermediate",
        language: "en",
      });

      generationResult = {
        generation_id: 0, // Will be set after database insertion
        generated_flashcards: flashcards.map((card, index) => ({
          id: `temp_${index + 1}`,
          front: card.front,
          back: card.back,
        })),
      };
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: "Failed to generate flashcards",
          details: error instanceof Error ? error.message : "Unknown error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    const generationDuration = Date.now() - startTime;

    // 6. Create generation record using authenticated client from middleware
    const sourceTextHash = crypto.createHash("sha256").update(body.source_text).digest("hex");

    try {
      const { data: generation, error: dbError } = await locals.supabase
        .from("generations")
        .insert({
          user_id: locals.user.id,
          model: body.model,
          generated_count: generationResult.generated_flashcards.length,
          source_text_hash: sourceTextHash,
          source_text_length: body.source_text.length,
          generation_duration: generationDuration,
          generated_unedited_count: generationResult.generated_flashcards.length,
          accepted_edited_count: 0,
        })
        .select()
        .single();

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      if (!generation) {
        throw new Error("Failed to create generation record - no data returned");
      }

      // Return complete response with generation ID
      return new Response(
        JSON.stringify({
          ...generationResult,
          generation_id: generation.id,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: "Failed to create generation record",
          details: error instanceof Error ? error.message : "Unknown error",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
