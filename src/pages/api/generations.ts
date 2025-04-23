import type { APIRoute } from "astro";
import type { GenerateFlashcardsCommand, GenerateFlashcardsResponseDto } from "../../types";
import { GenerationService } from "../../lib/services/generation.service";
import { generateFlashcardsSchema } from "../../lib/validation/generation.schema";
import { ZodError } from "zod";
import crypto from "crypto";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // 1. Check if supabase client is available
    if (!locals.supabase) {
      return new Response(JSON.stringify({ error: "Database client not available" }), {
        status: 500,
      });
    }

    // 2. Parse and validate request body
    const rawBody: GenerateFlashcardsCommand = await request.json();
    const validationResult = generateFlashcardsSchema.safeParse(rawBody);

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
        { status: 400 },
      );
    }

    const body = validationResult.data;

    // 3. Validate source text is not empty
    if (!body.source_text.trim()) {
      return new Response(JSON.stringify({ error: "Source text cannot be empty" }), {
        status: 400,
      });
    }

    // 4. Generate flashcards first to avoid creating unnecessary database records
    let generationResult: GenerateFlashcardsResponseDto;
    try {
      generationResult = await GenerationService.generateFlashcards(body.source_text, "mock-model");
    } catch (error) {
      console.error("Failed to generate flashcards:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to generate flashcards",
          details: error instanceof Error ? error.message : "Unknown error",
        }),
        { status: 500 },
      );
    }

    // 5. Create generation record with null user_id
    const sourceTextHash = crypto.createHash("sha256").update(body.source_text).digest("hex");
    const { supabase } = locals;

    const { data: generation, error: dbError } = await supabase
      .from("generations")
      .insert({
        user_id: null,
        model: "mock-model",
        generated_count: generationResult.generated_flashcards.length,
        source_text_hash: sourceTextHash,
        source_text_length: body.source_text.length,
        generation_duration: 0,
        generated_unedited_count: generationResult.generated_flashcards.length,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Failed to create generation record:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to create generation record", details: dbError }),
        { status: 500 },
      );
    }

    // 6. Return complete response
    return new Response(
      JSON.stringify({
        ...generationResult,
        generation_id: generation.id,
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        }),
        { status: 400 },
      );
    }

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 },
    );
  }
};
