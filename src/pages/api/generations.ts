import type { APIRoute } from 'astro';
import type { GenerateFlashcardsCommand, TemporaryFlashcardDto, GenerateFlashcardsResponseDto } from '../../types';
import { GenerationService } from '../../lib/services/generation.service';
import { generateFlashcardsSchema } from '../../lib/validation/generation.schema';
import { ZodError } from 'zod';
import crypto from 'crypto';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // 1. Parse and validate request body
    const rawBody = await request.json();
    const validationResult = generateFlashcardsSchema.safeParse(rawBody);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));
      
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed', 
          details: errors 
        }),
        { status: 400 }
      );
    }

    const body = validationResult.data;

    // 2. Verify authentication
    const { supabase } = locals;
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    // 3. Create generation record
    const sourceTextHash = crypto
      .createHash('sha256')
      .update(body.source_text)
      .digest('hex');

    const { data: generation, error: dbError } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        model: body.model,
        generated_count: 0,
        source_text_hash: sourceTextHash,
        source_text_length: body.source_text.length.toString(),
        generation_duration: 0,
        generated_unedited_count: 0
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to create generation record' }),
        { status: 500 }
      );
    }

    // 4. Generate flashcards using AI
    const startTime = Date.now();
    let generationResult: GenerateFlashcardsResponseDto;

    try {
      const result = await GenerationService.generateFlashcards(body.source_text, body.model);
      generationResult = {
        ...result,
        generation_id: generation.id
      };
    } catch (aiError) {
      // Log the error
      await supabase
        .from('generation_error_logs')
        .insert({
          user_id: user.id,
          model: body.model,
          source_text_hash: sourceTextHash,
          source_text_length: body.source_text.length,
          error_code: 'AI_SERVICE_ERROR',
          error_message: aiError instanceof Error ? aiError.message : 'Unknown error'
        });

      return new Response(
        JSON.stringify({ error: 'Failed to generate flashcards' }),
        { status: 502 }
      );
    }

    // 5. Update generation record with results
    const generationDuration = Date.now() - startTime;
    const { error: updateError } = await supabase
      .from('generations')
      .update({
        generated_count: generationResult.generated_flashcards.length,
        generated_unedited_count: generationResult.generated_flashcards.length,
        generation_duration: generationDuration
      })
      .eq('id', generation.id);

    if (updateError) {
      console.error('Error updating generation record:', updateError);
      // We don't return an error here as the generation was successful
    }

    return new Response(
      JSON.stringify(generationResult),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    
    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}; 