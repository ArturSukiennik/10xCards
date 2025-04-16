import { Tables } from "./db/database.types";

// ========================
// Enum Types
// ========================

/**
 * Możliwe źródła pochodzenia fiszek
 */
export enum FlashcardSource {
  AI_FULL = 'ai-full',
  AI_EDITED = 'ai-edited',
  MANUAL = 'manual',
}

/**
 * Okresy dla statystyk generowania
 */
export enum GenerationStatsPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  ALL = 'all',
}

// ========================
// Base DTOs
// ========================

/**
 * DTO reprezentujące fiszkę
 */
export type FlashcardDto = {
  id: number;
  front: string;
  back: string;
  source: FlashcardSource;
  generation_id: number;
  created_at: string;
  updated_at: string;
};

/**
 * DTO reprezentujące tymczasową fiszkę przed zapisaniem
 */
export type TemporaryFlashcardDto = {
  temp_id: string;
  front: string;
  back: string;
};

/**
 * DTO reprezentujące informacje o paginacji
 */
export type PaginationResponseDto = {
  current_page: number;
  total_pages: number;
  total_items: number;
  limit: number;
};

// ========================
// Command Models
// ========================

/**
 * Command model do ręcznego tworzenia pojedynczej fiszki
 */
export type CreateFlashcardCommand = {
  front: string;
  back: string;
};

/**
 * Command model do aktualizacji fiszki
 */
export type UpdateFlashcardCommand = {
  front: string;
  back: string;
};

/**
 * Command model do tworzenia wielu fiszek jednocześnie
 */
export type CreateMultipleFlashcardsCommand = {
  flashcards: Array<{
    front: string;
    back: string;
    source: FlashcardSource;
  }>;
  generation_id?: number;
};

/**
 * Command model do generowania fiszek przez AI
 */
export type GenerateFlashcardsCommand = {
  source_text: string;
  model: string;
};

/**
 * Command model dla zapisu wygenerowanych fiszek
 */
export type SaveGeneratedFlashcardsCommand = {
  flashcards: Array<{
    temp_id: string;
    front: string;
    back: string;
    source: FlashcardSource;
  }>;
};

// ========================
// Response DTOs
// ========================

/**
 * DTO odpowiedzi dla listy fiszek
 */
export type FlashcardListResponseDto = {
  data: FlashcardDto[];
  pagination: PaginationResponseDto;
};

/**
 * DTO odpowiedzi dla usunięcia fiszki
 */
export type DeleteFlashcardResponseDto = {
  message: string;
};

/**
 * DTO odpowiedzi dla utworzenia wielu fiszek
 */
export type CreateMultipleFlashcardsResponseDto = {
  created_count: number;
  flashcards: FlashcardDto[];
};

/**
 * DTO odpowiedzi dla generowania fiszek przez AI
 */
export type GenerateFlashcardsResponseDto = {
  generation_id: number;
  generated_flashcards: TemporaryFlashcardDto[];
};

/**
 * DTO odpowiedzi dla zapisania wygenerowanych fiszek
 */
export type SaveGeneratedFlashcardsResponseDto = {
  saved_count: number;
  flashcards: FlashcardDto[];
};

/**
 * DTO odpowiedzi dla statystyk generowania
 */
export type GenerationStatsResponseDto = {
  total_generations: number;
  total_flashcards_generated: number;
  flashcards_accepted: number;
  acceptance_rate: number;
  by_source: {
    ai_full: number;
    ai_edited: number;
    manual: number;
  };
};

// ========================
// Mappers (Database -> DTO)
// ========================

/**
 * Funkcja mapująca encję bazy danych na DTO fiszki
 */
export function mapToFlashcardDto(flashcard: Tables<"flashcards">): FlashcardDto {
  return {
    id: flashcard.id,
    front: flashcard.front,
    back: flashcard.back,
    source: flashcard.source as FlashcardSource,
    generation_id: flashcard.generation_id,
    created_at: flashcard.created_at,
    updated_at: flashcard.updated_at
  };
}

/**
 * Funkcja mapująca tablicę encji bazy danych na tablicę DTO fiszek
 */
export function mapToFlashcardDtoArray(flashcards: Tables<"flashcards">[]): FlashcardDto[] {
  return flashcards.map(mapToFlashcardDto);
} 