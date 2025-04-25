import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createFlashcardSchema,
  createFlashcardBatchSchema,
  type CreateFlashcardSchema,
  type CreateFlashcardBatchSchema,
} from "../validation/flashcards.validation";
import type {
  FlashcardDto,
  CreateMultipleFlashcardsResponseDto,
  FlashcardListResponseDto,
} from "../../types";
import { mapToFlashcardDto, mapToFlashcardDtoArray } from "../../types";
import { ValidationError, GenerationNotFoundError } from "../errors";

export class FlashcardsService {
  constructor(private readonly supabase: SupabaseClient) {}

  async getFlashcards(
    userId: string,
    options: { page: number; limit: number },
  ): Promise<FlashcardListResponseDto> {
    const { page, limit } = options;
    const offset = (page - 1) * limit;

    const {
      data: flashcards,
      error,
      count,
    } = await this.supabase
      .from("flashcards")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Failed to fetch flashcards:", error);
      throw new Error("Failed to fetch flashcards");
    }

    return {
      data: mapToFlashcardDtoArray(flashcards),
      pagination: {
        current_page: page,
        total_pages: Math.ceil((count || 0) / limit),
        total_items: count || 0,
        limit,
      },
    };
  }

  async createFlashcard(userId: string, dto: CreateFlashcardSchema): Promise<FlashcardDto> {
    const validationResult = createFlashcardSchema.safeParse(dto);

    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.errors[0].message);
    }

    const { data: flashcard, error } = await this.supabase
      .from("flashcards")
      .insert({
        user_id: userId,
        front: dto.front,
        back: dto.back,
        source: "manual",
      })
      .select("*")
      .single();

    if (error) {
      console.error("Failed to create flashcard:", error);
      throw new Error("Failed to create flashcard");
    }

    return mapToFlashcardDto(flashcard);
  }

  async createFlashcards(
    userId: string,
    dto: CreateFlashcardBatchSchema,
  ): Promise<CreateMultipleFlashcardsResponseDto> {
    const validationResult = createFlashcardBatchSchema.safeParse(dto);

    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.errors[0].message);
    }

    // Only check if generation exists, don't validate ownership
    if (dto.generation_id) {
      await this.validateGeneration(dto.generation_id);
    }

    const flashcardsToCreate = dto.flashcards.map((f) => ({
      user_id: userId,
      front: f.front,
      back: f.back,
      source: f.source,
      generation_id: dto.generation_id,
    }));

    const { data: createdFlashcards, error } = await this.supabase
      .from("flashcards")
      .insert(flashcardsToCreate)
      .select("*");

    if (error) {
      console.error("Failed to create flashcards:", error);
      throw new Error("Failed to create flashcards");
    }

    return {
      created_count: createdFlashcards.length,
      flashcards: mapToFlashcardDtoArray(createdFlashcards),
    };
  }

  private async validateGeneration(generationId: number): Promise<void> {
    const { data: generation, error } = await this.supabase
      .from("generations")
      .select("id")
      .eq("id", generationId)
      .single();

    if (error || !generation) {
      throw new GenerationNotFoundError("Generation not found");
    }
  }
}
