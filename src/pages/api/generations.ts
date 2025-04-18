import type { APIRoute } from 'astro';
import type { GenerateFlashcardsCommand, GenerateFlashcardsResponseDto } from '../../types';
import { GenerationService } from '../../lib/services/generation.service';
import { generateFlashcardsSchema } from '../../lib/validation/generation.schema';
import { ZodError } from 'zod';
import crypto from 'crypto';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // 1. Parse and validate request body
    const rawBody: GenerateFlashcardsCommand = await request.json();
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

    // 3. Create generation record with mock data
    const sourceTextHash = crypto
      .createHash('sha256')
      .update(body.source_text)
      .digest('hex');

    const { data: generation, error: dbError } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        model: 'mock-model',
        generated_count: 4, // Number of mock flashcards
        source_text_hash: sourceTextHash,
        source_text_length: body.source_text.length.toString(),
        generation_duration: 0,
        generated_unedited_count: 4 // Number of mock flashcards
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

    // 4. Get mock flashcards
    let generationResult: GenerateFlashcardsResponseDto;

    try {
      const result = await GenerationService.generateFlashcards(body.source_text, 'mock-model');
      generationResult = {
        ...result,
        generation_id: generation.id
      };
    } catch (error) {
      console.error('Error generating mock flashcards:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to generate flashcards' }),
        { status: 500 }
      );
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