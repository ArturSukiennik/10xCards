import type { SupabaseClient } from '@supabase/supabase-js';
import { 
  createFlashcardSchema, 
  createFlashcardBatchSchema,
  type CreateFlashcardSchema,
  type CreateFlashcardBatchSchema
} from '../validation/flashcards.validation';
import type { 
  FlashcardDto,
  CreateMultipleFlashcardsResponseDto
} from '../../types';
import { mapToFlashcardDto, mapToFlashcardDtoArray } from '../../types';
import { AuthorizationError, GenerationNotFoundError, ValidationError } from '../errors';

export class FlashcardsService {
  constructor(private readonly supabase: SupabaseClient) {}

  async createFlashcard(userId: string, dto: CreateFlashcardSchema): Promise<FlashcardDto> {
    const validationResult = createFlashcardSchema.safeParse(dto);
    
    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.errors[0].message);
    }

    const { data: flashcard, error } = await this.supabase
      .from('flashcards')
      .insert({
        user_id: userId,
        front: dto.front,
        back: dto.back,
        source: 'manual'
      })
      .select('*')
      .single();

    if (error) {
      throw new Error('Failed to create flashcard');
    }

    return mapToFlashcardDto(flashcard);
  }

  async createFlashcards(
    userId: string, 
    dto: CreateFlashcardBatchSchema
  ): Promise<CreateMultipleFlashcardsResponseDto> {
    const validationResult = createFlashcardBatchSchema.safeParse(dto);
    
    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.errors[0].message);
    }

    if (dto.generation_id) {
      await this.validateGeneration(userId, dto.generation_id);
    }

    const flashcardsToCreate = dto.flashcards.map(f => ({
      user_id: userId,
      front: f.front,
      back: f.back,
      source: f.source,
      generation_id: dto.generation_id
    }));

    const { data: createdFlashcards, error } = await this.supabase
      .from('flashcards')
      .insert(flashcardsToCreate)
      .select('*');

    if (error) {
      throw new Error('Failed to create flashcards');
    }

    return {
      created_count: createdFlashcards.length,
      flashcards: mapToFlashcardDtoArray(createdFlashcards)
    };
  }

  private async validateGeneration(userId: string, generationId: number): Promise<void> {
    const { data: generation, error } = await this.supabase
      .from('generations')
      .select('user_id')
      .eq('id', generationId)
      .single();

    if (error || !generation) {
      throw new GenerationNotFoundError('Generation not found');
    }

    if (generation.user_id !== userId) {
      throw new AuthorizationError('You do not have access to this generation');
    }
  }
} 